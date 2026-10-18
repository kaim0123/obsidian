# API Gateway設定

## API設計

### RESTful API エンドポイント

```
基本URL: https://api.example.com/v1

認証: Bearer Token (JWT)
Content-Type: application/json
```

### エンドポイント一覧

#### テナント管理
```
POST   /tenants                    テナント作成
GET    /tenants/{tenantId}         テナント取得
PUT    /tenants/{tenantId}         テナント更新
DELETE /tenants/{tenantId}         テナント削除
```

#### ユーザー管理
```
POST   /users                      ユーザー作成（管理者のみ）
GET    /users                      ユーザー一覧取得
GET    /users/{userId}             ユーザー取得
PUT    /users/{userId}             ユーザー更新
DELETE /users/{userId}             ユーザー削除（管理者のみ）
GET    /users/me                   自分の情報取得
```

#### 招待機能
```
POST   /invitations                招待送信（管理者のみ）
GET    /invitations                招待一覧取得
POST   /invitations/{inviteId}/accept  招待受諾（認証不要）
```

#### 認証
```
POST   /auth/signin                サインイン
POST   /auth/signout               サインアウト
POST   /auth/refresh               トークンリフレッシュ
POST   /auth/forgot-password       パスワードリセット
```

## SAMテンプレート（API Gateway部分）

```yaml
Resources:
  # HTTP API（API Gateway v2）
  HttpApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      # API名
      Name: !Sub TenantUserManagementAPI-${Environment}
      
      # CORS設定
      CorsConfiguration:
        AllowOrigins:
          - 'http://localhost:3000'
          - !Sub 'https://${Environment}.example.com'
        AllowHeaders:
          - 'Content-Type'
          - 'Authorization'
          - 'X-Requested-With'
        AllowMethods:
          - GET
          - POST
          - PUT
          - DELETE
          - OPTIONS
        MaxAge: 300
        AllowCredentials: false
      
      # 認証設定
      Auth:
        Authorizers:
          CognitoAuthorizer:
            IdentitySource: $request.header.Authorization
            JwtConfiguration:
              Audience:
                - !Ref UserPoolClient
              Issuer: !Sub https://cognito-idp.${AWS::Region}.amazonaws.com/${UserPool}
        DefaultAuthorizer: CognitoAuthorizer
      
      # アクセスログ設定
      AccessLogSettings:
        DestinationArn: !GetAtt ApiAccessLogGroup.Arn
        Format: $context.requestId $context.error.message $context.error.messageString
      
      # ステージ設定
      StageName: !Ref Environment
      
      # タグ
      Tags:
        Environment: !Ref Environment
        Project: TenantUserManagement
  
  # CloudWatch Logs（アクセスログ）
  ApiAccessLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub /aws/apigateway/tenant-user-api-${Environment}
      RetentionInDays: 30
  
  # カスタムドメイン（オプション）
  ApiDomainName:
    Type: AWS::ApiGatewayV2::DomainName
    Condition: UseCustomDomain
    Properties:
      DomainName: !Sub api-${Environment}.example.com
      DomainNameConfigurations:
        - EndpointType: REGIONAL
          CertificateArn: !Ref CertificateArn
  
  # ドメインマッピング
  ApiMapping:
    Type: AWS::ApiGatewayV2::ApiMapping
    Condition: UseCustomDomain
    Properties:
      ApiId: !Ref HttpApi
      DomainName: !Ref ApiDomainName
      Stage: !Ref Environment

Conditions:
  UseCustomDomain: !Not [!Equals [!Ref CertificateArn, '']]

Parameters:
  CertificateArn:
    Type: String
    Default: ''
    Description: ACM Certificate ARN for custom domain

Outputs:
  ApiUrl:
    Description: API Gateway endpoint URL
    Value: !Sub https://${HttpApi}.execute-api.${AWS::Region}.amazonaws.com/${Environment}
    Export:
      Name: !Sub ${AWS::StackName}-ApiUrl
  
  ApiId:
    Description: API Gateway ID
    Value: !Ref HttpApi
```

## リクエスト・レスポンス形式

### 共通レスポンス形式

#### 成功レスポンス
```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": {
    // データ
  }
}
```

#### エラーレスポンス
```json
{
  "statusCode": 400,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": {
    "error": "エラーメッセージ",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### ステータスコード

```
成功:
200 OK              - 取得成功
201 Created         - 作成成功
204 No Content      - 削除成功

クライアントエラー:
400 Bad Request     - リクエストが不正
401 Unauthorized    - 認証が必要
403 Forbidden       - 権限がない
404 Not Found       - リソースが見つからない
409 Conflict        - リソースが既に存在

サーバーエラー:
500 Internal Server Error  - サーバー内部エラー
503 Service Unavailable    - サービス利用不可
```

## APIリクエスト例

### 1. テナント作成
```bash
curl -X POST https://api.example.com/v1/tenants \
  -H "Authorization: Bearer ${ID_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "株式会社サンプル",
    "plan": "standard",
    "maxUsers": 50
  }'
```

**レスポンス**:
```json
{
  "tenantId": "abc123",
  "tenantName": "株式会社サンプル",
  "plan": "standard",
  "status": "active",
  "maxUsers": 50,
  "currentUsers": 0,
  "createdAt": 1234567890,
  "updatedAt": 1234567890
}
```

### 2. ユーザー作成
```bash
curl -X POST https://api.example.com/v1/users \
  -H "Authorization: Bearer ${ID_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "山田太郎",
    "role": "user",
    "profile": {
      "department": "営業部",
      "position": "主任"
    }
  }'
```

**レスポンス**:
```json
{
  "userId": "user123",
  "tenantId": "abc123",
  "email": "user@example.com",
  "name": "山田太郎",
  "role": "user",
  "status": "active",
  "profile": {
    "department": "営業部",
    "position": "主任"
  },
  "createdAt": 1234567890
}
```

### 3. ユーザー一覧取得
```bash
curl -X GET "https://api.example.com/v1/users?role=admin&status=active" \
  -H "Authorization: Bearer ${ID_TOKEN}"
```

**レスポンス**:
```json
{
  "users": [
    {
      "userId": "user123",
      "email": "admin@example.com",
      "name": "管理者",
      "role": "admin",
      "status": "active"
    }
  ],
  "count": 1
}
```

### 4. ユーザー招待
```bash
curl -X POST https://api.example.com/v1/invitations \
  -H "Authorization: Bearer ${ID_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "role": "user",
    "message": "チームに参加してください"
  }'
```

**レスポンス**:
```json
{
  "inviteId": "invite123",
  "tenantId": "abc123",
  "email": "newuser@example.com",
  "role": "user",
  "status": "pending",
  "expiresAt": 1234567890,
  "createdAt": 1234567890
}
```

## 認証フローの実装

### 認証用Lambda関数

```python
# functions/auth_signin/app.py

import boto3
import json
import os
from lib.utils import create_response, logger

cognito = boto3.client('cognito-idp')
USER_POOL_ID = os.environ['USER_POOL_ID']
CLIENT_ID = os.environ['USER_POOL_CLIENT_ID']


def lambda_handler(event, context):
    """サインイン"""
    try:
        body = json.loads(event.get('body', '{}'))
        
        email = body['email']
        password = body['password']
        
        # Cognito認証
        response = cognito.admin_initiate_auth(
            UserPoolId=USER_POOL_ID,
            ClientId=CLIENT_ID,
            AuthFlow='ADMIN_USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': password
            }
        )
        
        auth_result = response['AuthenticationResult']
        
        # ユーザー情報取得
        user_info = cognito.get_user(
            AccessToken=auth_result['AccessToken']
        )
        
        # 属性を辞書に変換
        attributes = {
            attr['Name']: attr['Value']
            for attr in user_info['UserAttributes']
        }
        
        return create_response(200, {
            'accessToken': auth_result['AccessToken'],
            'idToken': auth_result['IdToken'],
            'refreshToken': auth_result['RefreshToken'],
            'expiresIn': auth_result['ExpiresIn'],
            'user': {
                'userId': attributes.get('custom:userId'),
                'tenantId': attributes.get('custom:tenantId'),
                'email': attributes.get('email'),
                'name': attributes.get('name'),
                'role': attributes.get('custom:role')
            }
        })
        
    except cognito.exceptions.NotAuthorizedException:
        return create_response(401, {
            'error': 'Invalid email or password'
        })
    except cognito.exceptions.UserNotFoundException:
        return create_response(401, {
            'error': 'Invalid email or password'
        })
    except KeyError as e:
        return create_response(400, {
            'error': f'Missing required field: {str(e)}'
        })
    except Exception as e:
        logger.error(f"Error signing in: {str(e)}", exc_info=True)
        return create_response(500, {
            'error': 'Internal server error'
        })
```

### トークンリフレッシュ

```python
# functions/auth_refresh/app.py

import boto3
import json
import os
from lib.utils import create_response, logger

cognito = boto3.client('cognito-idp')
USER_POOL_ID = os.environ['USER_POOL_ID']
CLIENT_ID = os.environ['USER_POOL_CLIENT_ID']


def lambda_handler(event, context):
    """トークンリフレッシュ"""
    try:
        body = json.loads(event.get('body', '{}'))
        refresh_token = body['refreshToken']
        
        response = cognito.admin_initiate_auth(
            UserPoolId=USER_POOL_ID,
            ClientId=CLIENT_ID,
            AuthFlow='REFRESH_TOKEN_AUTH',
            AuthParameters={
                'REFRESH_TOKEN': refresh_token
            }
        )
        
        auth_result = response['AuthenticationResult']
        
        return create_response(200, {
            'accessToken': auth_result['AccessToken'],
            'idToken': auth_result['IdToken'],
            'expiresIn': auth_result['ExpiresIn']
        })
        
    except cognito.exceptions.NotAuthorizedException:
        return create_response(401, {
            'error': 'Invalid refresh token'
        })
    except Exception as e:
        logger.error(f"Error refreshing token: {str(e)}", exc_info=True)
        return create_response(500, {
            'error': 'Internal server error'
        })
```

## レート制限とスロットリング

### API Gateway のスロットリング設定

```yaml
Resources:
  HttpApiStage:
    Type: AWS::ApiGatewayV2::Stage
    Properties:
      ApiId: !Ref HttpApi
      StageName: !Ref Environment
      DefaultRouteSettings:
        ThrottlingBurstLimit: 5000
        ThrottlingRateLimit: 10000
      RouteSettings:
        # 認証エンドポイントは制限を厳しく
        'POST /auth/signin':
          ThrottlingBurstLimit: 100
          ThrottlingRateLimit: 50
```

## エラーハンドリング

### カスタムエラーレスポンス

```python
# layers/common/python/lib/errors.py

class APIError(Exception):
    """API エラー基底クラス"""
    def __init__(self, message: str, code: str = None, status_code: int = 400):
        self.message = message
        self.code = code or self.__class__.__name__
        self.status_code = status_code
        super().__init__(self.message)


class ValidationError(APIError):
    """バリデーションエラー"""
    def __init__(self, message: str):
        super().__init__(message, 'VALIDATION_ERROR', 400)


class AuthenticationError(APIError):
    """認証エラー"""
    def __init__(self, message: str = 'Authentication required'):
        super().__init__(message, 'AUTHENTICATION_ERROR', 401)


class AuthorizationError(APIError):
    """認可エラー"""
    def __init__(self, message: str = 'Insufficient permissions'):
        super().__init__(message, 'AUTHORIZATION_ERROR', 403)


class NotFoundError(APIError):
    """リソース未検出エラー"""
    def __init__(self, resource: str):
        super().__init__(f'{resource} not found', 'NOT_FOUND', 404)


class ConflictError(APIError):
    """競合エラー"""
    def __init__(self, message: str):
        super().__init__(message, 'CONFLICT', 409)


def handle_error(error: Exception):
    """エラーハンドリング"""
    from lib.utils import create_response, logger
    
    if isinstance(error, APIError):
        return create_response(error.status_code, {
            'error': error.message,
            'code': error.code
        })
    
    # 予期しないエラー
    logger.error(f"Unexpected error: {str(error)}", exc_info=True)
    return create_response(500, {
        'error': 'Internal server error',
        'code': 'INTERNAL_ERROR'
    })
```

### Lambda関数でのエラーハンドリング例

```python
from lib.errors import (
    ValidationError,
    AuthorizationError,
    NotFoundError,
    handle_error
)

def lambda_handler(event, context):
    try:
        # ビジネスロジック
        if not valid:
            raise ValidationError('Invalid input')
        
        if not authorized:
            raise AuthorizationError()
        
        if not found:
            raise NotFoundError('User')
        
        return create_response(200, result)
        
    except Exception as e:
        return handle_error(e)
```

## モニタリングとログ

### CloudWatch メトリクス

```
自動収集されるメトリクス:
- Count（リクエスト数）
- 4XXError（クライアントエラー）
- 5XXError（サーバーエラー）
- IntegrationLatency（Lambda実行時間）
- Latency（総レスポンス時間）
```

### カスタムメトリクス

```python
import boto3

cloudwatch = boto3.client('cloudwatch')

def put_metric(metric_name: str, value: float, unit: str = 'Count'):
    """カスタムメトリクス送信"""
    cloudwatch.put_metric_data(
        Namespace='TenantUserManagement',
        MetricData=[{
            'MetricName': metric_name,
            'Value': value,
            'Unit': unit
        }]
    )
```

## まとめ

### API Gateway の役割
✅ エンドポイント管理
✅ 認証・認可（Cognito Authorizer）
✅ CORS設定
✅ レート制限
✅ アクセスログ

### ベストプラクティス
✅ RESTful設計
✅ 適切なステータスコード
✅ エラーハンドリング
✅ レート制限
✅ モニタリング

---

**次のステップ**: [07_フロントエンド連携](./07_フロントエンド連携.md)

