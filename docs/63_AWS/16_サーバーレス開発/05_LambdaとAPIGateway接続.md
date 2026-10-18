# Lambda と API Gateway の接続

## 概要
このガイドでは、AWS Lambda関数をAmazon API Gatewayと統合し、RESTful APIやHTTP APIを構築する方法を学びます。

## API Gateway の種類

### 1. REST API
```
特徴:
✅ フル機能（キャッシング、リクエスト変換）
✅ APIキー管理
✅ リクエスト/レスポンスバリデーション
✅ WAF統合
⚠️ 料金が高い（$3.50/100万リクエスト）
```

**適用ケース**:
- エンタープライズアプリケーション
- 複雑なAPI管理が必要
- APIキーによる課金が必要

### 2. HTTP API
```
特徴:
✅ 軽量・高速
✅ 低コスト（$1.00/100万リクエスト）
✅ JWT認証ネイティブサポート
✅ CORS設定が簡単
⚠️ 機能が限定的（キャッシングなし）
```

**適用ケース**:
- マイクロサービス
- シンプルなREST API
- コスト重視のプロジェクト

### 3. WebSocket API
```
特徴:
✅ 双方向通信
✅ リアルタイムアプリケーション
✅ クライアントプッシュ通知

用途:
- チャットアプリ
- リアルタイムダッシュボード
- オンラインゲーム
```

## Lambda統合の種類

### Lambda Proxy統合（推奨）
```
API Gateway
    ↓ リクエスト全体を転送
Lambda（event に全情報）
    ↓ 構造化レスポンス
API Gateway
    ↓
クライアント
```

**メリット**:
- Lambda側で完全制御
- ヘッダー、ステータスコードを自由に設定
- 最も柔軟

### Lambda非Proxy統合
```
API Gateway
    ↓ マッピングテンプレートで変換
Lambda（カスタムevent）
    ↓ シンプルなレスポンス
API Gateway
    ↓ マッピングテンプレートで変換
クライアント
```

**メリット**:
- Lambda関数がAPI Gateway非依存
- レガシーシステム統合に適す

**デメリット**:
- 設定が複雑
- メンテナンスが困難

## A. HTTP API + Lambda Proxy統合（推奨）

### ステップ1: SAMテンプレートで作成

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Runtime: python3.11
    Timeout: 30
    Environment:
      Variables:
        POWERTOOLS_SERVICE_NAME: my-api
        LOG_LEVEL: INFO

Resources:
  # HTTP API
  MyHttpApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      CorsConfiguration:
        AllowOrigins:
          - "https://example.com"
          - "http://localhost:3000"
        AllowHeaders:
          - Content-Type
          - Authorization
        AllowMethods:
          - GET
          - POST
          - PUT
          - DELETE
          - OPTIONS
        MaxAge: 300
      FailOnWarnings: true

  # GET /users
  GetUsersFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: get-users
      CodeUri: functions/get_users/
      Handler: app.lambda_handler
      Events:
        GetUsers:
          Type: HttpApi
          Properties:
            ApiId: !Ref MyHttpApi
            Path: /users
            Method: GET

  # GET /users/{id}
  GetUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: get-user
      CodeUri: functions/get_user/
      Handler: app.lambda_handler
      Events:
        GetUser:
          Type: HttpApi
          Properties:
            ApiId: !Ref MyHttpApi
            Path: /users/{id}
            Method: GET

  # POST /users
  CreateUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: create-user
      CodeUri: functions/create_user/
      Handler: app.lambda_handler
      Events:
        CreateUser:
          Type: HttpApi
          Properties:
            ApiId: !Ref MyHttpApi
            Path: /users
            Method: POST

  # PUT /users/{id}
  UpdateUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: update-user
      CodeUri: functions/update_user/
      Handler: app.lambda_handler
      Events:
        UpdateUser:
          Type: HttpApi
          Properties:
            ApiId: !Ref MyHttpApi
            Path: /users/{id}
            Method: PUT

  # DELETE /users/{id}
  DeleteUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: delete-user
      CodeUri: functions/delete_user/
      Handler: app.lambda_handler
      Events:
        DeleteUser:
          Type: HttpApi
          Properties:
            ApiId: !Ref MyHttpApi
            Path: /users/{id}
            Method: DELETE

Outputs:
  ApiUrl:
    Description: "HTTP API endpoint URL"
    Value: !Sub "https://${MyHttpApi}.execute-api.${AWS::Region}.amazonaws.com"
```

### ステップ2: Lambda関数の実装

#### GET /users - ユーザー一覧取得
```python
import json
from typing import Dict, Any

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """ユーザー一覧を取得"""
    
    print(f"Event: {json.dumps(event)}")
    
    # クエリパラメータの取得
    query_params = event.get('queryStringParameters', {}) or {}
    limit = int(query_params.get('limit', 10))
    offset = int(query_params.get('offset', 0))
    
    # データベースからユーザーを取得（仮のデータ）
    users = [
        {'id': 1, 'name': 'John Doe', 'email': 'john@example.com'},
        {'id': 2, 'name': 'Jane Smith', 'email': 'jane@example.com'},
    ]
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'users': users,
            'count': len(users),
            'limit': limit,
            'offset': offset
        })
    }
```

#### GET /users/{id} - 特定ユーザー取得
```python
import json

def lambda_handler(event, context):
    """特定ユーザーを取得"""
    
    # パスパラメータの取得
    user_id = event['pathParameters']['id']
    
    # データベースから取得（仮の実装）
    user = {
        'id': int(user_id),
        'name': 'John Doe',
        'email': 'john@example.com',
        'createdAt': '2024-01-01T00:00:00Z'
    }
    
    if not user:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'User not found'})
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(user)
    }
```

#### POST /users - ユーザー作成
```python
import json

def lambda_handler(event, context):
    """新しいユーザーを作成"""
    
    # リクエストボディの取得
    try:
        body = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid JSON'})
        }
    
    # バリデーション
    if 'name' not in body or 'email' not in body:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Name and email are required'})
        }
    
    # データベースに保存（仮の実装）
    new_user = {
        'id': 123,
        'name': body['name'],
        'email': body['email'],
        'createdAt': '2024-01-01T00:00:00Z'
    }
    
    return {
        'statusCode': 201,
        'headers': {
            'Content-Type': 'application/json',
            'Location': f"/users/{new_user['id']}"
        },
        'body': json.dumps(new_user)
    }
```

#### PUT /users/{id} - ユーザー更新
```python
import json

def lambda_handler(event, context):
    """ユーザー情報を更新"""
    
    user_id = event['pathParameters']['id']
    
    try:
        body = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid JSON'})
        }
    
    # データベースを更新（仮の実装）
    updated_user = {
        'id': int(user_id),
        'name': body.get('name', 'John Doe'),
        'email': body.get('email', 'john@example.com'),
        'updatedAt': '2024-01-01T00:00:00Z'
    }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(updated_user)
    }
```

#### DELETE /users/{id} - ユーザー削除
```python
import json

def lambda_handler(event, context):
    """ユーザーを削除"""
    
    user_id = event['pathParameters']['id']
    
    # データベースから削除（仮の実装）
    # delete_user(user_id)
    
    return {
        'statusCode': 204,  # No Content
        'headers': {}
    }
```

### ステップ3: イベント構造の理解

#### HTTP API イベント構造
```json
{
  "version": "2.0",
  "routeKey": "GET /users/{id}",
  "rawPath": "/users/123",
  "rawQueryString": "limit=10&offset=0",
  "headers": {
    "accept": "application/json",
    "content-type": "application/json",
    "host": "abc123.execute-api.us-east-1.amazonaws.com",
    "user-agent": "curl/7.79.1",
    "x-amzn-trace-id": "Root=1-..."
  },
  "queryStringParameters": {
    "limit": "10",
    "offset": "0"
  },
  "pathParameters": {
    "id": "123"
  },
  "requestContext": {
    "accountId": "123456789012",
    "apiId": "abc123",
    "domainName": "abc123.execute-api.us-east-1.amazonaws.com",
    "http": {
      "method": "GET",
      "path": "/users/123",
      "protocol": "HTTP/1.1",
      "sourceIp": "1.2.3.4",
      "userAgent": "curl/7.79.1"
    },
    "requestId": "abc-123",
    "routeKey": "GET /users/{id}",
    "stage": "$default",
    "time": "01/Jan/2024:00:00:00 +0000",
    "timeEpoch": 1704067200000
  },
  "body": "{\"name\":\"John\",\"email\":\"john@example.com\"}",
  "isBase64Encoded": false
}
```

## B. REST API + Lambda Proxy統合

### SAMテンプレート
```yaml
Resources:
  MyRestApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: prod
      Cors:
        AllowOrigin: "'*'"
        AllowHeaders: "'Content-Type,Authorization'"
        AllowMethods: "'GET,POST,PUT,DELETE,OPTIONS'"
      Auth:
        DefaultAuthorizer: MyCognitoAuthorizer
        Authorizers:
          MyCognitoAuthorizer:
            UserPoolArn: !GetAtt UserPool.Arn
      GatewayResponses:
        DEFAULT_4XX:
          ResponseParameters:
            Headers:
              Access-Control-Allow-Origin: "'*'"
        DEFAULT_5XX:
          ResponseParameters:
            Headers:
              Access-Control-Allow-Origin: "'*'"

  GetUsersFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: functions/get_users/
      Handler: app.lambda_handler
      Events:
        GetUsers:
          Type: Api
          Properties:
            RestApiId: !Ref MyRestApi
            Path: /users
            Method: GET
            Auth:
              Authorizer: NONE  # 認証不要の場合
```

#### REST API イベント構造
```json
{
  "resource": "/users/{id}",
  "path": "/users/123",
  "httpMethod": "GET",
  "headers": {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Host": "abc123.execute-api.us-east-1.amazonaws.com",
    "User-Agent": "curl/7.79.1"
  },
  "queryStringParameters": {
    "limit": "10"
  },
  "pathParameters": {
    "id": "123"
  },
  "stageVariables": null,
  "requestContext": {
    "accountId": "123456789012",
    "apiId": "abc123",
    "protocol": "HTTP/1.1",
    "httpMethod": "GET",
    "path": "/prod/users/123",
    "stage": "prod",
    "requestId": "abc-123",
    "resourceId": "xyz789",
    "resourcePath": "/users/{id}",
    "identity": {
      "sourceIp": "1.2.3.4",
      "userAgent": "curl/7.79.1"
    }
  },
  "body": null,
  "isBase64Encoded": false
}
```

## C. エラーハンドリング

### 標準的なエラーレスポンス
```python
class APIError(Exception):
    """API エラーベースクラス"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class BadRequestError(APIError):
    def __init__(self, message: str = "Bad Request"):
        super().__init__(message, 400)

class NotFoundError(APIError):
    def __init__(self, message: str = "Not Found"):
        super().__init__(message, 404)

class UnauthorizedError(APIError):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, 401)

def error_response(error: APIError) -> Dict[str, Any]:
    """エラーレスポンスを生成"""
    return {
        'statusCode': error.status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'error': error.message,
            'statusCode': error.status_code
        })
    }

def lambda_handler(event, context):
    try:
        # ビジネスロジック
        user_id = event['pathParameters']['id']
        
        if not user_id.isdigit():
            raise BadRequestError("Invalid user ID format")
        
        user = get_user(int(user_id))
        
        if not user:
            raise NotFoundError(f"User {user_id} not found")
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(user)
        }
        
    except APIError as e:
        return error_response(e)
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return error_response(APIError("Internal Server Error", 500))
```

## D. リクエスト/レスポンスのバリデーション

### Pydanticを使用したバリデーション
```python
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
import json

class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    age: Optional[int] = None
    
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v
    
    @validator('age')
    def age_must_be_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError('Age must be positive')
        return v

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: Optional[int] = None
    createdAt: str

def lambda_handler(event, context):
    try:
        # リクエストのバリデーション
        body = json.loads(event.get('body', '{}'))
        request = CreateUserRequest(**body)
        
        # ビジネスロジック
        new_user = create_user(request)
        
        # レスポンスの生成
        response = UserResponse(**new_user)
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json'},
            'body': response.json()
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid JSON'})
        }
    
    except ValueError as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': str(e)})
        }
```

## E. ミドルウェアパターン

### デコレーターを使用したミドルウェア
```python
import json
import functools
from typing import Callable, Any, Dict

def cors_headers(func: Callable) -> Callable:
    """CORSヘッダーを追加"""
    @functools.wraps(func)
    def wrapper(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        response = func(event, context)
        
        if 'headers' not in response:
            response['headers'] = {}
        
        response['headers'].update({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        })
        
        return response
    return wrapper

def json_body_parser(func: Callable) -> Callable:
    """JSONボディをパース"""
    @functools.wraps(func)
    def wrapper(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        if event.get('body'):
            try:
                event['parsedBody'] = json.loads(event['body'])
            except json.JSONDecodeError:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'error': 'Invalid JSON'})
                }
        
        return func(event, context)
    return wrapper

def error_handler(func: Callable) -> Callable:
    """エラーハンドリング"""
    @functools.wraps(func)
    def wrapper(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        try:
            return func(event, context)
        except Exception as e:
            print(f"Error: {str(e)}")
            import traceback
            traceback.print_exc()
            
            return {
                'statusCode': 500,
                'body': json.dumps({'error': 'Internal Server Error'})
            }
    return wrapper

# 使用例
@cors_headers
@json_body_parser
@error_handler
def lambda_handler(event, context):
    # parsedBody を使用
    body = event.get('parsedBody', {})
    
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Success'})
    }
```

## F. ローカルテスト

### SAM CLIでのローカルテスト
```bash
# API全体をローカルで起動
sam local start-api

# 別のターミナルでテスト
curl http://127.0.0.1:3000/users

# 特定の関数を直接テスト
sam local invoke GetUsersFunction -e events/get-users.json
```

### テストイベントの作成
```json
{
  "version": "2.0",
  "routeKey": "GET /users",
  "rawPath": "/users",
  "rawQueryString": "limit=10",
  "headers": {
    "accept": "application/json",
    "content-type": "application/json"
  },
  "queryStringParameters": {
    "limit": "10"
  },
  "requestContext": {
    "http": {
      "method": "GET",
      "path": "/users"
    }
  }
}
```

## まとめ

✅ HTTP APIとREST APIの違いを理解
✅ Lambda Proxy統合の実装
✅ CRUD操作の実装
✅ エラーハンドリング
✅ リクエスト/レスポンスバリデーション
✅ ミドルウェアパターン
✅ ローカルテスト方法

**次のステップ**:
- [06_APIGatewayとアプリケーション接続](./06_APIGatewayとアプリケーション接続.md)
- [07_LambdaとCognito接続](./07_LambdaとCognito接続.md)

---

**関連ドキュメント**:
- [API Gateway公式ドキュメント](https://docs.aws.amazon.com/apigateway/)
- [Lambda基礎](../03_コンピューティング/Lambda/AWS_Lambda.md)

