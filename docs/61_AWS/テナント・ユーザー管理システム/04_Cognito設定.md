# Cognito設定

## Amazon Cognitoとは

### 役割
Amazon Cognitoは、Webアプリケーションとモバイルアプリケーションの認証、認可、ユーザー管理を提供するマネージドサービスです。

### 本システムでの使用目的
```
1. ユーザー認証（サインアップ/サインイン）
2. JWT トークンの発行と検証
3. ユーザープロフィール管理
4. カスタム属性（tenantId）の管理
5. ロール・グループ管理
6. パスワードリセット
```

## ユーザープールの設計

### カスタム属性設計

```yaml
標準属性:
- email (必須、変更不可)
- name (必須)

カスタム属性:
- custom:tenantId (文字列、変更不可)
  → どのテナントに所属するか
  
- custom:role (文字列、変更可)
  → admin または user
  
- custom:userId (文字列、変更不可)
  → DynamoDBのuserIdと紐付け
```

### ユーザープール設定

```yaml
ユーザー名設定:
- ユーザー名属性: email
- 大文字小文字を区別: なし

パスワードポリシー:
- 最小長: 8文字
- 大文字: 必須
- 小文字: 必須
- 数字: 必須
- 記号: 必須

検証設定:
- メール自動検証: 有効
- 検証方法: リンク

MFA設定:
- MFA: オプション（テナント設定で制御）
- TOTP: 有効
```

## SAMテンプレート（Cognito部分）

```yaml
Resources:
  # ユーザープール
  UserPool:
    Type: AWS::Cognito::UserPool
    Properties:
      UserPoolName: !Sub tenant-user-pool-${Environment}
      
      # ユーザー名設定
      UsernameAttributes:
        - email
      UsernameConfiguration:
        CaseSensitive: false
      
      # 自動検証
      AutoVerifiedAttributes:
        - email
      
      # パスワードポリシー
      Policies:
        PasswordPolicy:
          MinimumLength: 8
          RequireLowercase: true
          RequireNumbers: true
          RequireSymbols: true
          RequireUppercase: true
          TemporaryPasswordValidityDays: 7
      
      # スキーマ（属性定義）
      Schema:
        # 標準属性
        - Name: email
          AttributeDataType: String
          Required: true
          Mutable: false
        
        - Name: name
          AttributeDataType: String
          Required: true
          Mutable: true
        
        # カスタム属性
        - Name: tenantId
          AttributeDataType: String
          Mutable: false
          StringAttributeConstraints:
            MinLength: "1"
            MaxLength: "256"
        
        - Name: userId
          AttributeDataType: String
          Mutable: false
          StringAttributeConstraints:
            MinLength: "1"
            MaxLength: "256"
        
        - Name: role
          AttributeDataType: String
          Mutable: true
          StringAttributeConstraints:
            MinLength: "1"
            MaxLength: "50"
      
      # MFA設定
      MfaConfiguration: OPTIONAL
      EnabledMfas:
        - SOFTWARE_TOKEN_MFA
      
      # アカウント復旧
      AccountRecoverySetting:
        RecoveryMechanisms:
          - Name: verified_email
            Priority: 1
      
      # メール設定
      EmailConfiguration:
        EmailSendingAccount: COGNITO_DEFAULT
      
      # デバイス記憶
      DeviceConfiguration:
        ChallengeRequiredOnNewDevice: false
        DeviceOnlyRememberedOnUserPrompt: true
      
      # ユーザープールタグ
      UserPoolTags:
        Environment: !Ref Environment
        Project: TenantUserManagement
  
  # ユーザープールクライアント
  UserPoolClient:
    Type: AWS::Cognito::UserPoolClient
    Properties:
      UserPoolId: !Ref UserPool
      ClientName: web-client
      
      # シークレット生成（Web アプリは false）
      GenerateSecret: false
      
      # 認証フロー
      ExplicitAuthFlows:
        - ALLOW_USER_SRP_AUTH           # SRP認証
        - ALLOW_REFRESH_TOKEN_AUTH      # リフレッシュトークン
        - ALLOW_USER_PASSWORD_AUTH      # パスワード認証（開発用）
      
      # トークン有効期限
      RefreshTokenValidity: 30         # 30日
      AccessTokenValidity: 60          # 60分
      IdTokenValidity: 60              # 60分
      TokenValidityUnits:
        AccessToken: minutes
        IdToken: minutes
        RefreshToken: days
      
      # 属性の読み書き権限
      ReadAttributes:
        - email
        - name
        - custom:tenantId
        - custom:userId
        - custom:role
      
      WriteAttributes:
        - email
        - name
      
      # OAuth設定（将来のソーシャルログイン用）
      AllowedOAuthFlows:
        - code
      AllowedOAuthScopes:
        - email
        - openid
        - profile
      AllowedOAuthFlowsUserPoolClient: true
      
      # ログアウト・コールバックURL
      CallbackURLs:
        - http://localhost:3000/callback
        - !Sub https://${Environment}.example.com/callback
      LogoutURLs:
        - http://localhost:3000/logout
        - !Sub https://${Environment}.example.com/logout
      
      # トークン失効設定
      PreventUserExistenceErrors: ENABLED
  
  # 管理者グループ
  AdminGroup:
    Type: AWS::Cognito::UserPoolGroup
    Properties:
      GroupName: admin
      UserPoolId: !Ref UserPool
      Description: Tenant administrators
      Precedence: 1
  
  # 一般ユーザーグループ
  UserGroup:
    Type: AWS::Cognito::UserPoolGroup
    Properties:
      GroupName: user
      UserPoolId: !Ref UserPool
      Description: Regular users
      Precedence: 2

Outputs:
  UserPoolId:
    Description: Cognito User Pool ID
    Value: !Ref UserPool
    Export:
      Name: !Sub ${AWS::StackName}-UserPoolId
  
  UserPoolArn:
    Description: Cognito User Pool ARN
    Value: !GetAtt UserPool.Arn
  
  UserPoolClientId:
    Description: Cognito User Pool Client ID
    Value: !Ref UserPoolClient
    Export:
      Name: !Sub ${AWS::StackName}-UserPoolClientId
```

## Lambda関数でのCognito操作

### ユーザー作成
```python
# functions/create_user/app.py

import boto3
import uuid
import os
from lib.utils import create_response, get_tenant_id, logger
from lib.db import UserDB

cognito = boto3.client('cognito-idp')
USER_POOL_ID = os.environ['USER_POOL_ID']


def lambda_handler(event, context):
    """ユーザー作成（Cognito + DynamoDB）"""
    try:
        # テナントID取得
        tenant_id = get_tenant_id(event)
        
        # リクエストボディ解析
        import json
        body = json.loads(event['body'])
        
        email = body['email']
        name = body['name']
        role = body.get('role', 'user')
        
        # ユーザーID生成
        user_id = str(uuid.uuid4())
        
        # 1. Cognitoにユーザー作成
        cognito_response = cognito.admin_create_user(
            UserPoolId=USER_POOL_ID,
            Username=email,
            UserAttributes=[
                {'Name': 'email', 'Value': email},
                {'Name': 'name', 'Value': name},
                {'Name': 'email_verified', 'Value': 'true'},
                {'Name': 'custom:tenantId', 'Value': tenant_id},
                {'Name': 'custom:userId', 'Value': user_id},
                {'Name': 'custom:role', 'Value': role}
            ],
            DesiredDeliveryMediums=['EMAIL'],
            MessageAction='SUPPRESS'  # 招待メールは別途送信
        )
        
        cognito_username = cognito_response['User']['Username']
        
        # 2. グループに追加
        if role == 'admin':
            cognito.admin_add_user_to_group(
                UserPoolId=USER_POOL_ID,
                Username=cognito_username,
                GroupName='admin'
            )
        else:
            cognito.admin_add_user_to_group(
                UserPoolId=USER_POOL_ID,
                Username=cognito_username,
                GroupName='user'
            )
        
        # 3. DynamoDBにユーザー情報保存
        from datetime import datetime
        user_data = {
            'userId': user_id,
            'tenantId': tenant_id,
            'email': email,
            'name': name,
            'role': role,
            'status': 'active',
            'cognitoUsername': cognito_username,
            'emailVerified': True,
            'createdAt': int(datetime.now().timestamp()),
            'updatedAt': int(datetime.now().timestamp())
        }
        
        user = UserDB.create(user_data)
        
        logger.info(f"User created: {user_id} in tenant {tenant_id}")
        
        return create_response(201, user)
        
    except cognito.exceptions.UsernameExistsException:
        return create_response(400, {
            'error': 'User with this email already exists'
        })
    
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}", exc_info=True)
        return create_response(500, {
            'error': 'Internal server error'
        })
```

### ユーザー更新（ロール変更）
```python
def update_user_role(tenant_id: str, user_id: str, new_role: str):
    """ユーザーロール更新"""
    
    # 1. DynamoDBから現在の情報取得
    user = UserDB.get(tenant_id, user_id)
    if not user:
        raise ValueError('User not found')
    
    old_role = user.get('role')
    cognito_username = user.get('cognitoUsername')
    
    # 2. Cognitoのグループを変更
    if old_role != new_role:
        # 古いグループから削除
        try:
            cognito.admin_remove_user_from_group(
                UserPoolId=USER_POOL_ID,
                Username=cognito_username,
                GroupName=old_role
            )
        except Exception as e:
            logger.warning(f"Failed to remove from old group: {str(e)}")
        
        # 新しいグループに追加
        cognito.admin_add_user_to_group(
            UserPoolId=USER_POOL_ID,
            Username=cognito_username,
            GroupName=new_role
        )
        
        # カスタム属性も更新
        cognito.admin_update_user_attributes(
            UserPoolId=USER_POOL_ID,
            Username=cognito_username,
            UserAttributes=[
                {'Name': 'custom:role', 'Value': new_role}
            ]
        )
    
    # 3. DynamoDBを更新
    from datetime import datetime
    updated_user = UserDB.update(tenant_id, user_id, {
        'role': new_role,
        'updatedAt': int(datetime.now().timestamp())
    })
    
    return updated_user
```

### ユーザー削除
```python
def delete_user(tenant_id: str, user_id: str):
    """ユーザー削除（Cognito + DynamoDB）"""
    
    # 1. DynamoDBから情報取得
    user = UserDB.get(tenant_id, user_id)
    if not user:
        raise ValueError('User not found')
    
    cognito_username = user.get('cognitoUsername')
    
    # 2. Cognitoから削除
    try:
        cognito.admin_delete_user(
            UserPoolId=USER_POOL_ID,
            Username=cognito_username
        )
    except Exception as e:
        logger.error(f"Failed to delete from Cognito: {str(e)}")
        # Cognitoでエラーでも続行（DynamoDBは削除）
    
    # 3. DynamoDBから削除
    UserDB.delete(tenant_id, user_id)
    
    logger.info(f"User deleted: {user_id} from tenant {tenant_id}")
```

### パスワードリセット
```python
def reset_user_password(email: str):
    """パスワードリセット"""
    
    try:
        # パスワードリセットメール送信
        cognito.admin_reset_user_password(
            UserPoolId=USER_POOL_ID,
            Username=email
        )
        
        logger.info(f"Password reset initiated for: {email}")
        return True
        
    except cognito.exceptions.UserNotFoundException:
        raise ValueError('User not found')
```

## 認証フローの実装

### auth.pyライブラリ
```python
# layers/common/python/lib/auth.py

import boto3
import os
from typing import Dict, Any, Optional

cognito = boto3.client('cognito-idp')
USER_POOL_ID = os.environ['USER_POOL_ID']
CLIENT_ID = os.environ['USER_POOL_CLIENT_ID']


def sign_in(email: str, password: str) -> Dict[str, Any]:
    """サインイン"""
    try:
        response = cognito.admin_initiate_auth(
            UserPoolId=USER_POOL_ID,
            ClientId=CLIENT_ID,
            AuthFlow='ADMIN_USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': password
            }
        )
        
        return {
            'accessToken': response['AuthenticationResult']['AccessToken'],
            'idToken': response['AuthenticationResult']['IdToken'],
            'refreshToken': response['AuthenticationResult']['RefreshToken'],
            'expiresIn': response['AuthenticationResult']['ExpiresIn']
        }
        
    except cognito.exceptions.NotAuthorizedException:
        raise ValueError('Invalid credentials')
    except cognito.exceptions.UserNotFoundException:
        raise ValueError('User not found')


def refresh_token(refresh_token: str) -> Dict[str, Any]:
    """トークンリフレッシュ"""
    response = cognito.admin_initiate_auth(
        UserPoolId=USER_POOL_ID,
        ClientId=CLIENT_ID,
        AuthFlow='REFRESH_TOKEN_AUTH',
        AuthParameters={
            'REFRESH_TOKEN': refresh_token
        }
    )
    
    return {
        'accessToken': response['AuthenticationResult']['AccessToken'],
        'idToken': response['AuthenticationResult']['IdToken'],
        'expiresIn': response['AuthenticationResult']['ExpiresIn']
    }


def get_user_by_token(access_token: str) -> Dict[str, Any]:
    """トークンからユーザー情報取得"""
    response = cognito.get_user(AccessToken=access_token)
    
    # 属性を辞書に変換
    attributes = {}
    for attr in response['UserAttributes']:
        attributes[attr['Name']] = attr['Value']
    
    return {
        'username': response['Username'],
        'email': attributes.get('email'),
        'name': attributes.get('name'),
        'tenantId': attributes.get('custom:tenantId'),
        'userId': attributes.get('custom:userId'),
        'role': attributes.get('custom:role')
    }


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """JWTトークン検証（ローカル検証）"""
    from jose import jwt, JWTError
    import requests
    
    # JWKSを取得（起動時に1度取得してキャッシュ推奨）
    region = os.environ.get('AWS_REGION', 'ap-northeast-1')
    keys_url = f'https://cognito-idp.{region}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json'
    
    try:
        keys = requests.get(keys_url).json()['keys']
        
        # トークンをデコード・検証
        claims = jwt.decode(
            token,
            keys,
            algorithms=['RS256'],
            audience=CLIENT_ID,
            options={'verify_exp': True}
        )
        
        return claims
        
    except JWTError as e:
        print(f"Token verification failed: {str(e)}")
        return None
```

## API GatewayとCognitoの統合

### Cognito Authorizerの設定
```yaml
Resources:
  HttpApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      CorsConfiguration:
        AllowOrigins: ['*']
        AllowHeaders: ['*']
        AllowMethods: ['*']
      
      # Cognito Authorizer設定
      Auth:
        Authorizers:
          CognitoAuthorizer:
            IdentitySource: $request.header.Authorization
            JwtConfiguration:
              Audience:
                - !Ref UserPoolClient
              Issuer: !Sub https://cognito-idp.${AWS::Region}.amazonaws.com/${UserPool}
        DefaultAuthorizer: CognitoAuthorizer
```

### Lambda関数での認証情報取得
```python
def lambda_handler(event, context):
    """認証済みユーザー情報を使用"""
    
    # JWTクレームから情報取得
    claims = event['requestContext']['authorizer']['jwt']['claims']
    
    tenant_id = claims.get('custom:tenantId')
    user_id = claims.get('custom:userId')
    email = claims.get('email')
    role = claims.get('custom:role')
    
    # ロールチェック
    if role != 'admin':
        return create_response(403, {'error': 'Forbidden'})
    
    # ビジネスロジック実行...
```

## まとめ

### Cognitoの役割
✅ ユーザー認証
✅ JWT トークン発行
✅ カスタム属性管理（tenantId）
✅ グループ・ロール管理
✅ パスワードポリシー適用

### 実装のポイント
✅ Cognito + DynamoDB の二重管理
✅ カスタム属性でテナント分離
✅ グループでロール管理
✅ API Gateway Authorizerで自動検証

---

**次のステップ**: [05_Lambda関数実装](./05_Lambda関数実装.md)

