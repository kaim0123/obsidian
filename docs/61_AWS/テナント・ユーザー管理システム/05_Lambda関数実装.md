# Lambda関数実装

## 関数一覧

### テナント管理
1. **CreateTenant** - テナント作成
2. **GetTenant** - テナント取得
3. **UpdateTenant** - テナント更新
4. **DeleteTenant** - テナント削除

### ユーザー管理
5. **CreateUser** - ユーザー作成
6. **GetUser** - ユーザー取得
7. **ListUsers** - ユーザー一覧
8. **UpdateUser** - ユーザー更新
9. **DeleteUser** - ユーザー削除

### 招待機能
10. **InviteUser** - ユーザー招待
11. **AcceptInvitation** - 招待受諾

## SAMテンプレート（Lambda関数部分）

```yaml
Resources:
  # ========== テナント管理 ==========
  CreateTenantFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub CreateTenant-${Environment}
      CodeUri: functions/create_tenant/
      Handler: app.lambda_handler
      Environment:
        Variables:
          USER_POOL_ID: !Ref UserPool
      Events:
        Api:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /tenants
            Method: POST
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref TenantUserTable

  GetTenantFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub GetTenant-${Environment}
      CodeUri: functions/get_tenant/
      Handler: app.lambda_handler
      Events:
        Api:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /tenants/{tenantId}
            Method: GET
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref TenantUserTable

  UpdateTenantFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub UpdateTenant-${Environment}
      CodeUri: functions/update_tenant/
      Handler: app.lambda_handler
      Events:
        Api:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /tenants/{tenantId}
            Method: PUT
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref TenantUserTable

  DeleteTenantFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub DeleteTenant-${Environment}
      CodeUri: functions/delete_tenant/
      Handler: app.lambda_handler
      Events:
        Api:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /tenants/{tenantId}
            Method: DELETE
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref TenantUserTable

  # ========== ユーザー管理 ==========
  CreateUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub CreateUser-${Environment}
      CodeUri: functions/create_user/
      Handler: app.lambda_handler
      Environment:
        Variables:
          USER_POOL_ID: !Ref UserPool
      Events:
        Api:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /users
            Method: POST
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref TenantUserTable
        - Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - cognito-idp:AdminCreateUser
                - cognito-idp:AdminAddUserToGroup
              Resource: !GetAtt UserPool.Arn

  GetUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub GetUser-${Environment}
      CodeUri: functions/get_user/
      Handler: app.lambda_handler
      Events:
        Api:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /users/{userId}
            Method: GET
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref TenantUserTable

  ListUsersFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub ListUsers-${Environment}
      CodeUri: functions/list_users/
      Handler: app.lambda_handler
      Events:
        Api:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /users
            Method: GET
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref TenantUserTable

  UpdateUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub UpdateUser-${Environment}
      CodeUri: functions/update_user/
      Handler: app.lambda_handler
      Environment:
        Variables:
          USER_POOL_ID: !Ref UserPool
      Events:
        Api:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /users/{userId}
            Method: PUT
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref TenantUserTable
        - Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - cognito-idp:AdminUpdateUserAttributes
                - cognito-idp:AdminAddUserToGroup
                - cognito-idp:AdminRemoveUserFromGroup
              Resource: !GetAtt UserPool.Arn

  DeleteUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub DeleteUser-${Environment}
      CodeUri: functions/delete_user/
      Handler: app.lambda_handler
      Environment:
        Variables:
          USER_POOL_ID: !Ref UserPool
      Events:
        Api:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /users/{userId}
            Method: DELETE
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref TenantUserTable
        - Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - cognito-idp:AdminDeleteUser
              Resource: !GetAtt UserPool.Arn

  # ========== 招待機能 ==========
  InviteUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub InviteUser-${Environment}
      CodeUri: functions/invite_user/
      Handler: app.lambda_handler
      Environment:
        Variables:
          NOTIFICATION_TOPIC: !Ref NotificationTopic
      Events:
        Api:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /invitations
            Method: POST
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref TenantUserTable
        - SNSPublishMessagePolicy:
            TopicName: !GetAtt NotificationTopic.TopicName

  AcceptInvitationFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub AcceptInvitation-${Environment}
      CodeUri: functions/accept_invitation/
      Handler: app.lambda_handler
      Environment:
        Variables:
          USER_POOL_ID: !Ref UserPool
      Events:
        Api:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /invitations/{inviteId}/accept
            Method: POST
            Auth:
              Authorizer: NONE  # 招待受諾は未認証でOK
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref TenantUserTable
        - Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - cognito-idp:AdminCreateUser
                - cognito-idp:AdminAddUserToGroup
              Resource: !GetAtt UserPool.Arn
```

## Lambda関数の実装

### 1. テナント作成
```python
# functions/create_tenant/app.py

import json
import uuid
from datetime import datetime
from lib.utils import create_response, get_user_claims, logger
from lib.db import TenantDB


def lambda_handler(event, context):
    """テナント作成"""
    try:
        # リクエスト解析
        body = json.loads(event.get('body', '{}'))
        
        # バリデーション
        if 'tenantName' not in body:
            return create_response(400, {
                'error': 'tenantName is required'
            })
        
        # テナントID生成
        tenant_id = str(uuid.uuid4())
        
        # テナントデータ作成
        tenant_data = {
            'tenantId': tenant_id,
            'tenantName': body['tenantName'],
            'displayName': body.get('displayName', body['tenantName']),
            'subdomain': body.get('subdomain', ''),
            'plan': body.get('plan', 'standard'),
            'status': 'active',
            'maxUsers': body.get('maxUsers', 50),
            'currentUsers': 0,
            'settings': body.get('settings', {
                'allowInvitation': True,
                'requireMFA': False
            }),
            'createdAt': int(datetime.now().timestamp()),
            'updatedAt': int(datetime.now().timestamp())
        }
        
        # DynamoDBに保存
        tenant = TenantDB.create(tenant_data)
        
        logger.info(f"Tenant created: {tenant_id}")
        
        return create_response(201, tenant)
        
    except Exception as e:
        logger.error(f"Error creating tenant: {str(e)}", exc_info=True)
        return create_response(500, {
            'error': 'Internal server error'
        })
```

### 2. テナント取得
```python
# functions/get_tenant/app.py

from lib.utils import create_response, get_tenant_id, logger
from lib.db import TenantDB


def lambda_handler(event, context):
    """テナント取得"""
    try:
        # URLパラメータからテナントID取得
        path_tenant_id = event['pathParameters']['tenantId']
        
        # 認証トークンからテナントID取得
        user_tenant_id = get_tenant_id(event)
        
        # テナントアクセス権限チェック
        if user_tenant_id != path_tenant_id:
            return create_response(403, {
                'error': 'Access denied to this tenant'
            })
        
        # テナント取得
        tenant = TenantDB.get(path_tenant_id)
        
        if not tenant:
            return create_response(404, {
                'error': 'Tenant not found'
            })
        
        return create_response(200, tenant)
        
    except ValueError as e:
        return create_response(400, {'error': str(e)})
    except Exception as e:
        logger.error(f"Error getting tenant: {str(e)}", exc_info=True)
        return create_response(500, {
            'error': 'Internal server error'
        })
```

### 3. ユーザー作成
```python
# functions/create_user/app.py

import boto3
import json
import uuid
import os
from datetime import datetime
from lib.utils import create_response, get_tenant_id, require_admin, logger
from lib.db import UserDB

cognito = boto3.client('cognito-idp')
USER_POOL_ID = os.environ['USER_POOL_ID']


def lambda_handler(event, context):
    """ユーザー作成（管理者のみ）"""
    try:
        # 管理者権限チェック
        require_admin(event)
        
        # テナントID取得
        tenant_id = get_tenant_id(event)
        
        # リクエスト解析
        body = json.loads(event.get('body', '{}'))
        
        # バリデーション
        required_fields = ['email', 'name']
        for field in required_fields:
            if field not in body:
                return create_response(400, {
                    'error': f'{field} is required'
                })
        
        email = body['email']
        name = body['name']
        role = body.get('role', 'user')
        
        # ユーザーID生成
        user_id = str(uuid.uuid4())
        
        # Cognitoにユーザー作成
        temp_password = generate_temp_password()
        
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
            TemporaryPassword=temp_password,
            DesiredDeliveryMediums=['EMAIL']
        )
        
        cognito_username = cognito_response['User']['Username']
        
        # グループに追加
        cognito.admin_add_user_to_group(
            UserPoolId=USER_POOL_ID,
            Username=cognito_username,
            GroupName=role
        )
        
        # DynamoDBに保存
        user_data = {
            'userId': user_id,
            'tenantId': tenant_id,
            'email': email,
            'name': name,
            'role': role,
            'status': 'active',
            'cognitoUsername': cognito_username,
            'emailVerified': True,
            'profile': body.get('profile', {}),
            'createdAt': int(datetime.now().timestamp()),
            'updatedAt': int(datetime.now().timestamp())
        }
        
        user = UserDB.create(user_data)
        
        logger.info(f"User created: {user_id} in tenant {tenant_id}")
        
        # パスワードは返さない
        return create_response(201, user)
        
    except cognito.exceptions.UsernameExistsException:
        return create_response(400, {
            'error': 'User with this email already exists'
        })
    except PermissionError as e:
        return create_response(403, {'error': str(e)})
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}", exc_info=True)
        return create_response(500, {
            'error': 'Internal server error'
        })


def generate_temp_password():
    """一時パスワード生成"""
    import secrets
    import string
    
    alphabet = string.ascii_letters + string.digits + '!@#$%^&*'
    password = ''.join(secrets.choice(alphabet) for i in range(12))
    
    # パスワードポリシーを満たすように調整
    if not any(c.isupper() for c in password):
        password = password[:-1] + 'A'
    if not any(c.islower() for c in password):
        password = password[:-1] + 'a'
    if not any(c.isdigit() for c in password):
        password = password[:-1] + '1'
    if not any(c in '!@#$%^&*' for c in password):
        password = password[:-1] + '!'
    
    return password
```

### 4. ユーザー一覧取得
```python
# functions/list_users/app.py

from lib.utils import create_response, get_tenant_id, logger
from lib.db import UserDB


def lambda_handler(event, context):
    """ユーザー一覧取得"""
    try:
        # テナントID取得
        tenant_id = get_tenant_id(event)
        
        # クエリパラメータ
        query_params = event.get('queryStringParameters', {}) or {}
        role_filter = query_params.get('role')
        status_filter = query_params.get('status')
        
        # テナント内の全ユーザー取得
        users = UserDB.list_by_tenant(tenant_id)
        
        # フィルタリング
        if role_filter:
            users = [u for u in users if u.get('role') == role_filter]
        
        if status_filter:
            users = [u for u in users if u.get('status') == status_filter]
        
        # ソート（作成日時の降順）
        users.sort(key=lambda x: x.get('createdAt', 0), reverse=True)
        
        return create_response(200, {
            'users': users,
            'count': len(users)
        })
        
    except ValueError as e:
        return create_response(400, {'error': str(e)})
    except Exception as e:
        logger.error(f"Error listing users: {str(e)}", exc_info=True)
        return create_response(500, {
            'error': 'Internal server error'
        })
```

### 5. ユーザー更新
```python
# functions/update_user/app.py

import boto3
import json
import os
from datetime import datetime
from lib.utils import create_response, get_tenant_id, get_user_role, logger
from lib.db import UserDB

cognito = boto3.client('cognito-idp')
USER_POOL_ID = os.environ['USER_POOL_ID']


def lambda_handler(event, context):
    """ユーザー更新"""
    try:
        # テナントID取得
        tenant_id = get_tenant_id(event)
        
        # URLパラメータからユーザーID取得
        user_id = event['pathParameters']['userId']
        
        # リクエスト解析
        body = json.loads(event.get('body', '{}'))
        
        # 既存ユーザー取得
        user = UserDB.get(tenant_id, user_id)
        if not user:
            return create_response(404, {'error': 'User not found'})
        
        # 権限チェック：自分自身または管理者のみ更新可能
        current_role = get_user_role(event)
        current_user_id = event['requestContext']['authorizer']['jwt']['claims'].get('custom:userId')
        
        if current_role != 'admin' and current_user_id != user_id:
            return create_response(403, {
                'error': 'You can only update your own profile'
            })
        
        # ロール変更は管理者のみ
        if 'role' in body and current_role != 'admin':
            return create_response(403, {
                'error': 'Only admins can change roles'
            })
        
        # 更新データ準備
        updates = {
            'updatedAt': int(datetime.now().timestamp())
        }
        
        # 許可されたフィールドのみ更新
        allowed_fields = ['name', 'profile', 'status']
        if current_role == 'admin':
            allowed_fields.append('role')
        
        for field in allowed_fields:
            if field in body:
                updates[field] = body[field]
        
        # ロール変更時はCognitoも更新
        if 'role' in updates and updates['role'] != user.get('role'):
            update_cognito_role(
                user.get('cognitoUsername'),
                user.get('role'),
                updates['role']
            )
        
        # DynamoDB更新
        updated_user = UserDB.update(tenant_id, user_id, updates)
        
        logger.info(f"User updated: {user_id}")
        
        return create_response(200, updated_user)
        
    except PermissionError as e:
        return create_response(403, {'error': str(e)})
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}", exc_info=True)
        return create_response(500, {
            'error': 'Internal server error'
        })


def update_cognito_role(cognito_username: str, old_role: str, new_role: str):
    """Cognitoのロール更新"""
    try:
        # 古いグループから削除
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
    
    # カスタム属性更新
    cognito.admin_update_user_attributes(
        UserPoolId=USER_POOL_ID,
        Username=cognito_username,
        UserAttributes=[
            {'Name': 'custom:role', 'Value': new_role}
        ]
    )
```

### 6. ユーザー招待
```python
# functions/invite_user/app.py

import boto3
import json
import uuid
import os
from datetime import datetime, timedelta
from lib.utils import create_response, get_tenant_id, require_admin, logger
from lib.db import InvitationDB, UserDB, TenantDB

sns = boto3.client('sns')
NOTIFICATION_TOPIC = os.environ['NOTIFICATION_TOPIC']


def lambda_handler(event, context):
    """ユーザー招待（管理者のみ）"""
    try:
        # 管理者権限チェック
        require_admin(event)
        
        # テナントID取得
        tenant_id = get_tenant_id(event)
        
        # リクエスト解析
        body = json.loads(event.get('body', '{}'))
        
        email = body['email']
        role = body.get('role', 'user')
        message = body.get('message', '')
        
        # 既存ユーザーチェック
        existing_user = UserDB.find_by_email(email)
        if existing_user:
            return create_response(400, {
                'error': 'User with this email already exists'
            })
        
        # 既存招待チェック
        existing_invites = InvitationDB.find_by_email(email)
        if existing_invites:
            return create_response(400, {
                'error': 'Invitation already sent to this email'
            })
        
        # テナント情報取得
        tenant = TenantDB.get(tenant_id)
        
        # 招待ID生成
        invite_id = str(uuid.uuid4())
        
        # 招待トークン生成
        invite_token = generate_invite_token(invite_id)
        
        # 有効期限（7日）
        expires_at = int((datetime.now() + timedelta(days=7)).timestamp())
        
        # 招待作成
        invite_data = {
            'inviteId': invite_id,
            'tenantId': tenant_id,
            'email': email,
            'role': role,
            'message': message,
            'status': 'pending',
            'invitedBy': event['requestContext']['authorizer']['jwt']['claims']['custom:userId'],
            'expiresAt': expires_at,
            'createdAt': int(datetime.now().timestamp()),
            'token': invite_token
        }
        
        invitation = InvitationDB.create(invite_data)
        
        # 招待メール送信
        send_invitation_email(
            email=email,
            tenant_name=tenant['tenantName'],
            invite_token=invite_token,
            message=message
        )
        
        logger.info(f"Invitation sent: {invite_id} to {email}")
        
        # トークンは返さない
        invitation.pop('token', None)
        
        return create_response(201, invitation)
        
    except KeyError as e:
        return create_response(400, {
            'error': f'Missing required field: {str(e)}'
        })
    except PermissionError as e:
        return create_response(403, {'error': str(e)})
    except Exception as e:
        logger.error(f"Error inviting user: {str(e)}", exc_info=True)
        return create_response(500, {
            'error': 'Internal server error'
        })


def generate_invite_token(invite_id: str) -> str:
    """招待トークン生成"""
    import hashlib
    import secrets
    
    # ランダムな塩を生成
    salt = secrets.token_hex(16)
    
    # トークン生成
    token_data = f"{invite_id}:{salt}"
    token = hashlib.sha256(token_data.encode()).hexdigest()
    
    return token


def send_invitation_email(email: str, tenant_name: str, invite_token: str, message: str):
    """招待メール送信"""
    invite_url = f"https://app.example.com/accept-invite?token={invite_token}"
    
    email_body = f"""
{tenant_name} への招待

こんにちは、

{tenant_name} のメンバーから招待が届いています。

{message}

以下のリンクから参加してください：
{invite_url}

このリンクは7日間有効です。

※ このメールに心当たりがない場合は無視してください。
"""
    
    sns.publish(
        TopicArn=NOTIFICATION_TOPIC,
        Subject=f'{tenant_name} への招待',
        Message=email_body,
        MessageAttributes={
            'email': {'DataType': 'String', 'StringValue': email}
        }
    )
```

## まとめ

### 実装した機能
✅ テナント管理（CRUD）
✅ ユーザー管理（CRUD）
✅ 招待機能
✅ 権限チェック
✅ Cognito連携

### ベストプラクティス
✅ 共通ライブラリ（Layer）の使用
✅ エラーハンドリング
✅ ロギング
✅ バリデーション
✅ セキュリティチェック

---

**次のステップ**: [06_API_Gateway設定](./06_API_Gateway設定.md)

