# Lambda と DynamoDB の接続

## 概要
このガイドでは、AWS Lambda関数からAmazon DynamoDBを操作する方法を学びます。NoSQLデータベースとしてのDynamoDBは、サーバーレスアプリケーションと非常に相性が良いです。

## DynamoDB の特徴

### メリット
```
✅ 完全マネージド型（サーバー管理不要）
✅ 自動スケーリング
✅ ミリ秒未満のレスポンス
✅ Lambda との統合が容易
✅ DynamoDB Streams（変更データキャプチャ）
✅ トランザクション対応
✅ グローバルテーブル（マルチリージョン）
```

### Aurora との使い分け
```
DynamoDB を選ぶ場合:
- Key-Value または ドキュメント型データ
- 予測不可能なスケール
- シンプルなクエリ
- 高速なレスポンスが必須

Aurora を選ぶ場合:
- 複雑な JOIN が必要
- トランザクションが多い
- 既存の SQL 資産がある
- リレーショナルモデルが最適
```

## A. DynamoDB テーブルの作成

### SAMテンプレート
```yaml
Resources:
  UsersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: Users
      BillingMode: PAY_PER_REQUEST  # オンデマンド課金
      AttributeDefinitions:
        - AttributeName: userId
          AttributeType: S
        - AttributeName: email
          AttributeType: S
        - AttributeName: createdAt
          AttributeType: N
      KeySchema:
        - AttributeName: userId
          KeyType: HASH  # パーティションキー
      GlobalSecondaryIndexes:
        - IndexName: EmailIndex
          KeySchema:
            - AttributeName: email
              KeyType: HASH
          Projection:
            ProjectionType: ALL
        - IndexName: CreatedAtIndex
          KeySchema:
            - AttributeName: createdAt
              KeyType: HASH
          Projection:
            ProjectionType: ALL
      StreamSpecification:
        StreamViewType: NEW_AND_OLD_IMAGES
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      Tags:
        - Key: Environment
          Value: Production

  # Lambda関数
  DynamoDBAccessFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: dynamodb-access-function
      Runtime: python3.11
      Handler: app.lambda_handler
      CodeUri: functions/dynamodb_access/
      Environment:
        Variables:
          USERS_TABLE: !Ref UsersTable
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref UsersTable

Outputs:
  UsersTableName:
    Value: !Ref UsersTable
    Export:
      Name: !Sub ${AWS::StackName}-UsersTable
```

## B. 基本操作（CRUD）

### セットアップ
```python
import boto3
import json
import os
from datetime import datetime
from decimal import Decimal
from typing import Dict, Any, List

# DynamoDBクライアント
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['USERS_TABLE'])

# Decimalをfloatに変換するヘルパー
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)
```

### Create（アイテムの作成）
```python
def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """ユーザーを作成"""
    import uuid
    
    user_id = str(uuid.uuid4())
    timestamp = int(datetime.now().timestamp())
    
    item = {
        'userId': user_id,
        'email': user_data['email'],
        'name': user_data['name'],
        'age': user_data.get('age'),
        'createdAt': timestamp,
        'updatedAt': timestamp
    }
    
    try:
        # 条件付き書き込み（メール重複チェック）
        table.put_item(
            Item=item,
            ConditionExpression='attribute_not_exists(userId)'
        )
        return item
    except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
        raise ValueError('User already exists')

def lambda_handler(event, context):
    """POST /users - ユーザー作成"""
    try:
        body = json.loads(event.get('body', '{}'))
        
        # バリデーション
        if 'email' not in body or 'name' not in body:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Email and name are required'})
            }
        
        user = create_user(body)
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(user, cls=DecimalEncoder)
        }
        
    except ValueError as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
```

### Read（アイテムの取得）
```python
def get_user(user_id: str) -> Dict[str, Any]:
    """ユーザーを取得"""
    response = table.get_item(Key={'userId': user_id})
    
    if 'Item' not in response:
        raise ValueError('User not found')
    
    return response['Item']

def lambda_handler(event, context):
    """GET /users/{userId} - ユーザー取得"""
    try:
        user_id = event['pathParameters']['userId']
        user = get_user(user_id)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(user, cls=DecimalEncoder)
        }
        
    except ValueError as e:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': str(e)})
        }
```

### Update（アイテムの更新）
```python
def update_user(user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """ユーザー情報を更新"""
    
    # 更新式を動的に生成
    update_expression = "SET updatedAt = :updatedAt"
    expression_values = {':updatedAt': int(datetime.now().timestamp())}
    expression_names = {}
    
    for key, value in updates.items():
        if key not in ['userId', 'createdAt']:  # 更新不可フィールド
            placeholder = f":{key}"
            name_placeholder = f"#{key}"
            
            update_expression += f", {name_placeholder} = {placeholder}"
            expression_values[placeholder] = value
            expression_names[name_placeholder] = key
    
    try:
        response = table.update_item(
            Key={'userId': user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values,
            ExpressionAttributeNames=expression_names,
            ConditionExpression='attribute_exists(userId)',
            ReturnValues='ALL_NEW'
        )
        return response['Attributes']
    except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
        raise ValueError('User not found')

def lambda_handler(event, context):
    """PUT /users/{userId} - ユーザー更新"""
    try:
        user_id = event['pathParameters']['userId']
        body = json.loads(event.get('body', '{}'))
        
        updated_user = update_user(user_id, body)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(updated_user, cls=DecimalEncoder)
        }
        
    except ValueError as e:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': str(e)})
        }
```

### Delete（アイテムの削除）
```python
def delete_user(user_id: str) -> bool:
    """ユーザーを削除"""
    try:
        table.delete_item(
            Key={'userId': user_id},
            ConditionExpression='attribute_exists(userId)'
        )
        return True
    except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
        raise ValueError('User not found')

def lambda_handler(event, context):
    """DELETE /users/{userId} - ユーザー削除"""
    try:
        user_id = event['pathParameters']['userId']
        delete_user(user_id)
        
        return {
            'statusCode': 204
        }
        
    except ValueError as e:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': str(e)})
        }
```

## C. クエリとスキャン

### Query（効率的）
```python
def query_users_by_email(email: str) -> List[Dict[str, Any]]:
    """メールアドレスでユーザーを検索（GSI使用）"""
    response = table.query(
        IndexName='EmailIndex',
        KeyConditionExpression='email = :email',
        ExpressionAttributeValues={':email': email}
    )
    return response['Items']

def query_recent_users(limit: int = 20) -> List[Dict[str, Any]]:
    """最近作成されたユーザーを取得"""
    response = table.scan(
        Limit=limit,
        # スキャンは非効率だが、全件取得の場合は仕方ない
    )
    
    # クライアント側でソート
    items = response['Items']
    items.sort(key=lambda x: x['createdAt'], reverse=True)
    return items[:limit]
```

### Scan（非効率・避けるべき）
```python
def scan_all_users() -> List[Dict[str, Any]]:
    """全ユーザーを取得（注意: 大量データには不向き）"""
    items = []
    
    # ページネーション処理
    response = table.scan()
    items.extend(response['Items'])
    
    while 'LastEvaluatedKey' in response:
        response = table.scan(
            ExclusiveStartKey=response['LastEvaluatedKey']
        )
        items.extend(response['Items'])
    
    return items
```

### ページネーション
```python
def list_users(limit: int = 20, last_key: str = None) -> Dict[str, Any]:
    """ユーザー一覧を取得（ページネーション対応）"""
    
    scan_kwargs = {
        'Limit': limit
    }
    
    if last_key:
        # Base64デコードしてLastEvaluatedKeyとして使用
        import base64
        scan_kwargs['ExclusiveStartKey'] = json.loads(
            base64.b64decode(last_key).decode('utf-8')
        )
    
    response = table.scan(**scan_kwargs)
    
    result = {
        'items': response['Items'],
        'count': len(response['Items'])
    }
    
    if 'LastEvaluatedKey' in response:
        # Base64エンコードして返す
        import base64
        result['nextToken'] = base64.b64encode(
            json.dumps(response['LastEvaluatedKey']).encode('utf-8')
        ).decode('utf-8')
    
    return result

def lambda_handler(event, context):
    """GET /users - ユーザー一覧（ページネーション）"""
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        limit = int(query_params.get('limit', 20))
        next_token = query_params.get('nextToken')
        
        result = list_users(limit, next_token)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result, cls=DecimalEncoder)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

## D. バッチ操作

### BatchGetItem（複数アイテム取得）
```python
def batch_get_users(user_ids: List[str]) -> List[Dict[str, Any]]:
    """複数ユーザーを一度に取得"""
    
    if not user_ids:
        return []
    
    # 最大100件まで
    keys = [{'userId': user_id} for user_id in user_ids[:100]]
    
    response = dynamodb.batch_get_item(
        RequestItems={
            table.table_name: {
                'Keys': keys
            }
        }
    )
    
    return response['Responses'][table.table_name]
```

### BatchWriteItem（複数アイテム書き込み）
```python
def batch_create_users(users: List[Dict[str, Any]]) -> int:
    """複数ユーザーを一度に作成"""
    
    if not users:
        return 0
    
    import uuid
    timestamp = int(datetime.now().timestamp())
    
    # 最大25件まで
    with table.batch_writer() as batch:
        for user_data in users[:25]:
            item = {
                'userId': str(uuid.uuid4()),
                'email': user_data['email'],
                'name': user_data['name'],
                'createdAt': timestamp,
                'updatedAt': timestamp
            }
            batch.put_item(Item=item)
    
    return len(users[:25])
```

## E. トランザクション

### TransactWriteItems
```python
def transfer_credits(from_user_id: str, to_user_id: str, amount: int):
    """クレジットを転送（トランザクション）"""
    
    dynamodb_client = boto3.client('dynamodb')
    table_name = table.table_name
    
    try:
        response = dynamodb_client.transact_write_items(
            TransactItems=[
                # 送信者から減算
                {
                    'Update': {
                        'TableName': table_name,
                        'Key': {'userId': {'S': from_user_id}},
                        'UpdateExpression': 'SET credits = credits - :amount',
                        'ExpressionAttributeValues': {
                            ':amount': {'N': str(amount)},
                            ':zero': {'N': '0'}
                        },
                        'ConditionExpression': 'credits >= :amount'
                    }
                },
                # 受信者に加算
                {
                    'Update': {
                        'TableName': table_name,
                        'Key': {'userId': {'S': to_user_id}},
                        'UpdateExpression': 'SET credits = credits + :amount',
                        'ExpressionAttributeValues': {
                            ':amount': {'N': str(amount)}
                        },
                        'ConditionExpression': 'attribute_exists(userId)'
                    }
                }
            ]
        )
        return True
    except dynamodb_client.exceptions.TransactionCanceledException as e:
        print(f"Transaction cancelled: {str(e)}")
        raise ValueError('Transaction failed')
```

## F. DynamoDB Streams

### StreamでLambdaをトリガー
```yaml
Resources:
  # Stream処理Lambda
  StreamProcessorFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: dynamodb-stream-processor
      Runtime: python3.11
      Handler: app.lambda_handler
      CodeUri: functions/stream_processor/
      Events:
        Stream:
          Type: DynamoDB
          Properties:
            Stream: !GetAtt UsersTable.StreamArn
            StartingPosition: TRIM_HORIZON
            BatchSize: 100
            MaximumBatchingWindowInSeconds: 5
```

### Stream処理の実装
```python
def lambda_handler(event, context):
    """DynamoDBストリームイベントを処理"""
    
    for record in event['Records']:
        event_name = record['eventName']  # INSERT, MODIFY, REMOVE
        
        if event_name == 'INSERT':
            new_image = record['dynamodb']['NewImage']
            user_id = new_image['userId']['S']
            email = new_image['email']['S']
            
            print(f"New user created: {user_id} ({email})")
            
            # 新規ユーザーにウェルカムメールを送信
            send_welcome_email(email)
        
        elif event_name == 'MODIFY':
            old_image = record['dynamodb']['OldImage']
            new_image = record['dynamodb']['NewImage']
            
            # 変更を検知
            if old_image['email']['S'] != new_image['email']['S']:
                print(f"Email changed for user {new_image['userId']['S']}")
        
        elif event_name == 'REMOVE':
            old_image = record['dynamodb']['OldImage']
            user_id = old_image['userId']['S']
            
            print(f"User deleted: {user_id}")
    
    return {'statusCode': 200}

def send_welcome_email(email: str):
    """ウェルカムメールを送信"""
    # SNSやSESを使用してメール送信
    pass
```

## G. ベストプラクティス

### 1. シングルテーブルデザイン
```python
# 複数のエンティティを1つのテーブルに格納
table_structure = {
    'PK': 'USER#123',
    'SK': 'PROFILE',
    'entityType': 'User',
    'email': 'user@example.com',
    'name': 'John Doe'
}

order_structure = {
    'PK': 'USER#123',
    'SK': 'ORDER#456',
    'entityType': 'Order',
    'orderId': '456',
    'amount': 100
}
```

### 2. 楽観的ロック
```python
def update_with_version(user_id: str, updates: Dict[str, Any], expected_version: int):
    """バージョンチェック付き更新"""
    
    updates['version'] = expected_version + 1
    
    try:
        response = table.update_item(
            Key={'userId': user_id},
            UpdateExpression='SET #v = :new_version, #name = :name',
            ExpressionAttributeNames={
                '#v': 'version',
                '#name': 'name'
            },
            ExpressionAttributeValues={
                ':new_version': expected_version + 1,
                ':name': updates['name'],
                ':expected_version': expected_version
            },
            ConditionExpression='#v = :expected_version',
            ReturnValues='ALL_NEW'
        )
        return response['Attributes']
    except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
        raise ValueError('Version mismatch - item was modified')
```

### 3. TTL（自動削除）
```yaml
Resources:
  SessionsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: Sessions
      AttributeDefinitions:
        - AttributeName: sessionId
          AttributeType: S
      KeySchema:
        - AttributeName: sessionId
          KeyType: HASH
      TimeToLiveSpecification:
        AttributeName: expiresAt
        Enabled: true
```

```python
def create_session(session_data: Dict[str, Any], ttl_hours: int = 24):
    """セッションを作成（TTL付き）"""
    import time
    
    session_id = str(uuid.uuid4())
    expires_at = int(time.time()) + (ttl_hours * 3600)
    
    table.put_item(
        Item={
            'sessionId': session_id,
            'userId': session_data['userId'],
            'expiresAt': expires_at,  # TTL属性
            'createdAt': int(time.time())
        }
    )
    
    return session_id
```

## まとめ

✅ DynamoDBテーブルの作成
✅ CRUD操作の実装
✅ クエリとスキャン
✅ バッチ操作
✅ トランザクション
✅ DynamoDB Streams
✅ ベストプラクティス

**次のステップ**:
- [10_LambdaとSQS接続](./10_LambdaとSQS接続.md)
- [12_LambdaとEventBridge接続](./12_LambdaとEventBridge接続.md)

---

**関連ドキュメント**:
- [DynamoDB基礎](../05_データベース/02_DynamoDBとは.md)
- [DynamoDB公式ドキュメント](https://docs.aws.amazon.com/dynamodb/)

