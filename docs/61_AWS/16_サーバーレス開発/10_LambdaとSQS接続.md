# Lambda と SQS の接続

## 概要
このガイドでは、AWS Lambda関数とAmazon SQS（Simple Queue Service）を統合し、非同期処理とメッセージキューイングを実装する方法を学びます。

## SQS の特徴

### メリット
```
✅ 非同期処理の実現
✅ システム間の疎結合化
✅ スパイクトラフィックの吸収
✅ 処理の再試行機能
✅ Dead Letter Queue（DLQ）
✅ メッセージの順序保証（FIFO）
✅ 完全マネージド型
```

### 使用ケース
```
- 時間のかかる処理（動画変換、レポート生成）
- バッチ処理
- マイクロサービス間の通信
- イベント駆動アーキテクチャ
- 負荷平準化
```

## SQS の種類

### Standard Queue（標準キュー）
```
特徴:
✅ 無制限のスループット
✅ ベストエフォート順序
✅ 少なくとも1回の配信
✅ 低コスト

用途:
- 順序が重要でない処理
- 重複を許容できる処理
```

### FIFO Queue（先入先出キュー）
```
特徴:
✅ 厳密な順序保証
✅ 重複排除
✅ 3,000メッセージ/秒（バッチ使用時は30,000）

用途:
- 順序が重要な処理
- 重複を許容できない処理
- 金融取引、注文処理
```

## A. SQS キューの作成

### SAMテンプレート（Standard Queue）
```yaml
Resources:
  # 標準キュー
  TaskQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: task-queue
      VisibilityTimeout: 300  # 5分（Lambda実行時間以上）
      MessageRetentionPeriod: 345600  # 4日
      ReceiveMessageWaitTimeSeconds: 20  # ロングポーリング
      RedrivePolicy:
        deadLetterTargetArn: !GetAtt TaskDLQ.Arn
        maxReceiveCount: 3  # 3回失敗したらDLQへ

  # Dead Letter Queue
  TaskDLQ:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: task-dlq
      MessageRetentionPeriod: 1209600  # 14日

  # メッセージ送信Lambda
  ProducerFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: sqs-producer
      Runtime: python3.11
      Handler: app.lambda_handler
      CodeUri: functions/producer/
      Environment:
        Variables:
          QUEUE_URL: !Ref TaskQueue
      Policies:
        - SQSSendMessagePolicy:
            QueueName: !GetAtt TaskQueue.QueueName

  # メッセージ処理Lambda
  ConsumerFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: sqs-consumer
      Runtime: python3.11
      Handler: app.lambda_handler
      CodeUri: functions/consumer/
      Timeout: 300
      ReservedConcurrentExecutions: 5  # 同時実行数制限
      Events:
        SQSEvent:
          Type: SQS
          Properties:
            Queue: !GetAtt TaskQueue.Arn
            BatchSize: 10  # 一度に処理するメッセージ数
            MaximumBatchingWindowInSeconds: 5

Outputs:
  QueueUrl:
    Value: !Ref TaskQueue
  QueueArn:
    Value: !GetAtt TaskQueue.Arn
```

### FIFO Queue
```yaml
Resources:
  OrderQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: order-queue.fifo
      FifoQueue: true
      ContentBasedDeduplication: true  # 自動重複排除
      DeduplicationScope: messageGroup  # グループ単位で重複排除
      FifoThroughputLimit: perMessageGroupId  # グループごとにスループット
      VisibilityTimeout: 300
      RedrivePolicy:
        deadLetterTargetArn: !GetAtt OrderDLQ.Arn
        maxReceiveCount: 3

  OrderDLQ:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: order-dlq.fifo
      FifoQueue: true
```

## B. メッセージの送信（Producer）

### 基本的な送信
```python
import boto3
import json
import os
from typing import Dict, Any

sqs = boto3.client('sqs')
QUEUE_URL = os.environ['QUEUE_URL']

def send_message(message_body: Dict[str, Any], delay_seconds: int = 0) -> str:
    """SQSにメッセージを送信"""
    try:
        response = sqs.send_message(
            QueueUrl=QUEUE_URL,
            MessageBody=json.dumps(message_body),
            DelaySeconds=delay_seconds,  # 遅延送信（0-900秒）
            MessageAttributes={
                'TaskType': {
                    'StringValue': message_body.get('type', 'default'),
                    'DataType': 'String'
                },
                'Priority': {
                    'StringValue': str(message_body.get('priority', 1)),
                    'DataType': 'Number'
                }
            }
        )
        
        message_id = response['MessageId']
        print(f"Message sent: {message_id}")
        return message_id
        
    except Exception as e:
        print(f"Error sending message: {str(e)}")
        raise

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """API経由でタスクをキューに追加"""
    try:
        body = json.loads(event.get('body', '{}'))
        
        # タスクデータ
        task = {
            'taskId': body.get('taskId'),
            'type': body.get('type', 'processing'),
            'data': body.get('data'),
            'priority': body.get('priority', 1),
            'timestamp': context.request_id
        }
        
        # メッセージ送信
        message_id = send_message(task)
        
        return {
            'statusCode': 202,  # Accepted
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'message': 'Task queued',
                'taskId': task['taskId'],
                'messageId': message_id
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

### バッチ送信（最大10件）
```python
def send_batch_messages(messages: list) -> dict:
    """複数のメッセージを一度に送信"""
    
    entries = []
    for idx, message in enumerate(messages[:10]):  # 最大10件
        entries.append({
            'Id': str(idx),
            'MessageBody': json.dumps(message),
            'MessageAttributes': {
                'TaskType': {
                    'StringValue': message.get('type', 'default'),
                    'DataType': 'String'
                }
            }
        })
    
    response = sqs.send_message_batch(
        QueueUrl=QUEUE_URL,
        Entries=entries
    )
    
    print(f"Successful: {len(response.get('Successful', []))}")
    print(f"Failed: {len(response.get('Failed', []))}")
    
    return response
```

### FIFO メッセージ送信
```python
def send_fifo_message(
    message_body: Dict[str, Any],
    group_id: str,
    deduplication_id: str = None
) -> str:
    """FIFOキューにメッセージを送信"""
    
    params = {
        'QueueUrl': QUEUE_URL,
        'MessageBody': json.dumps(message_body),
        'MessageGroupId': group_id,  # 必須
    }
    
    # ContentBasedDeduplicationがfalseの場合は必須
    if deduplication_id:
        params['MessageDeduplicationId'] = deduplication_id
    
    response = sqs.send_message(**params)
    return response['MessageId']

# 使用例
send_fifo_message(
    message_body={'orderId': '123', 'action': 'process'},
    group_id='order-123',  # 同じグループIDは順序保証
    deduplication_id='unique-id-123'  # 5分以内の重複を排除
)
```

## C. メッセージの受信と処理（Consumer）

### Lambda関数での処理
```python
import json
from typing import Dict, Any, List

def process_task(task: Dict[str, Any]) -> bool:
    """タスクを処理"""
    try:
        task_type = task.get('type')
        
        if task_type == 'email':
            send_email(task['data'])
        elif task_type == 'report':
            generate_report(task['data'])
        elif task_type == 'image':
            process_image(task['data'])
        else:
            print(f"Unknown task type: {task_type}")
            return False
        
        return True
        
    except Exception as e:
        print(f"Error processing task: {str(e)}")
        raise

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """SQSメッセージを処理"""
    
    print(f"Processing {len(event['Records'])} messages")
    
    successful = []
    failed = []
    
    for record in event['Records']:
        message_id = record['messageId']
        receipt_handle = record['receiptHandle']
        
        try:
            # メッセージボディをパース
            body = json.loads(record['body'])
            
            # メッセージ属性
            attributes = record.get('messageAttributes', {})
            task_type = attributes.get('TaskType', {}).get('stringValue')
            
            print(f"Processing message {message_id} (type: {task_type})")
            
            # タスクを処理
            if process_task(body):
                successful.append(message_id)
                print(f"Successfully processed: {message_id}")
            else:
                failed.append(message_id)
                
        except Exception as e:
            print(f"Failed to process message {message_id}: {str(e)}")
            failed.append(message_id)
            
            # 例外を再スローすると、メッセージはキューに戻される
            # （RetryPolicy に従って再処理される）
    
    # 部分的なバッチ失敗レポート
    if failed:
        # 失敗したメッセージのみ再処理させる
        return {
            'batchItemFailures': [
                {'itemIdentifier': msg_id} for msg_id in failed
            ]
        }
    
    return {'statusCode': 200}

def send_email(data: Dict[str, Any]):
    """メール送信処理"""
    print(f"Sending email to {data.get('to')}")
    # 実装...

def generate_report(data: Dict[str, Any]):
    """レポート生成処理"""
    print(f"Generating report: {data.get('reportType')}")
    # 実装...

def process_image(data: Dict[str, Any]):
    """画像処理"""
    print(f"Processing image: {data.get('imageUrl')}")
    # 実装...
```

### イベント構造
```json
{
  "Records": [
    {
      "messageId": "059f36b4-87a3-44ab-83d2-661975830a7d",
      "receiptHandle": "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
      "body": "{\"taskId\":\"123\",\"type\":\"email\",\"data\":{\"to\":\"user@example.com\"}}",
      "attributes": {
        "ApproximateReceiveCount": "1",
        "SentTimestamp": "1545082649183",
        "SenderId": "AIDAIENQZJOLO23YVJ4VO",
        "ApproximateFirstReceiveTimestamp": "1545082649185"
      },
      "messageAttributes": {
        "TaskType": {
          "stringValue": "email",
          "dataType": "String"
        }
      },
      "md5OfBody": "e4e68fb7bd0e697a0ae8f1bb342846b3",
      "eventSource": "aws:sqs",
      "eventSourceARN": "arn:aws:sqs:ap-northeast-1:123456789012:task-queue",
      "awsRegion": "ap-northeast-1"
    }
  ]
}
```

## D. エラーハンドリングとリトライ

### 部分的なバッチ失敗処理
```python
def lambda_handler(event, context):
    """失敗したメッセージのみ再処理"""
    
    failed_items = []
    
    for record in event['Records']:
        try:
            process_message(record)
        except Exception as e:
            print(f"Failed: {record['messageId']} - {str(e)}")
            failed_items.append({
                'itemIdentifier': record['messageId']
            })
    
    # 失敗したメッセージのみキューに戻す
    if failed_items:
        return {
            'batchItemFailures': failed_items
        }
    
    return {'statusCode': 200}
```

### Visibility Timeout の延長
```python
import boto3

sqs = boto3.client('sqs')

def extend_visibility_timeout(receipt_handle: str, seconds: int):
    """可視性タイムアウトを延長（処理時間が長い場合）"""
    sqs.change_message_visibility(
        QueueUrl=QUEUE_URL,
        ReceiptHandle=receipt_handle,
        VisibilityTimeout=seconds
    )

def lambda_handler(event, context):
    for record in event['Records']:
        receipt_handle = record['receiptHandle']
        
        # 長時間処理の開始
        if will_take_long_time():
            # タイムアウトを延長
            extend_visibility_timeout(receipt_handle, 600)  # 10分
        
        # 処理...
```

### Dead Letter Queue の監視
```python
def lambda_handler(event, context):
    """DLQのメッセージを監視・通知"""
    
    for record in event['Records']:
        body = json.loads(record['body'])
        
        # 失敗したメッセージの分析
        print(f"Failed message: {body}")
        
        # 管理者に通知
        send_alert({
            'subject': 'SQS DLQ Alert',
            'message': f'Message failed after max retries: {body}',
            'severity': 'HIGH'
        })
        
        # ログに記録
        log_failed_message(body)
```

## E. ベストプラクティス

### 1. べき等性の確保
```python
import hashlib

processed_messages = {}  # 実際はDynamoDBなどで管理

def is_already_processed(message_id: str) -> bool:
    """メッセージが処理済みか確認"""
    return message_id in processed_messages

def mark_as_processed(message_id: str):
    """メッセージを処理済みとしてマーク"""
    processed_messages[message_id] = True

def lambda_handler(event, context):
    for record in event['Records']:
        message_id = record['messageId']
        
        # 重複チェック
        if is_already_processed(message_id):
            print(f"Message {message_id} already processed, skipping")
            continue
        
        # 処理
        process_message(record)
        
        # 処理済みマーク
        mark_as_processed(message_id)
```

### 2. バッチサイズの最適化
```yaml
# 小さなメッセージ、高速処理
Events:
  SQSEvent:
    Type: SQS
    Properties:
      Queue: !GetAtt Queue.Arn
      BatchSize: 10
      MaximumBatchingWindowInSeconds: 0

# 大きなメッセージ、重い処理
Events:
  SQSEvent:
    Type: SQS
    Properties:
      Queue: !GetAtt Queue.Arn
      BatchSize: 1
      MaximumBatchingWindowInSeconds: 0
```

### 3. メッセージのフィルタリング
```python
def lambda_handler(event, context):
    """優先度の高いメッセージのみ処理"""
    
    for record in event['Records']:
        attributes = record.get('messageAttributes', {})
        priority = int(attributes.get('Priority', {}).get('stringValue', 0))
        
        if priority < 5:
            print("Low priority message, skipping")
            continue
        
        # 高優先度メッセージを処理
        process_message(record)
```

### 4. コスト最適化
```python
# ロングポーリングを使用（リクエスト数削減）
response = sqs.receive_message(
    QueueUrl=QUEUE_URL,
    MaxNumberOfMessages=10,
    WaitTimeSeconds=20,  # ロングポーリング
    MessageAttributeNames=['All']
)
```

## F. 実践例：非同期タスク処理システム

### アーキテクチャ
```
API Gateway
    ↓ リクエスト
Lambda (Producer)
    ↓ メッセージ送信
SQS Queue
    ↓ トリガー
Lambda (Consumer)
    ↓ 処理完了通知
DynamoDB (ステータス管理)
```

### Producer
```python
import boto3
import json
import uuid

sqs = boto3.client('sqs')
dynamodb = boto3.resource('dynamodb')

QUEUE_URL = os.environ['QUEUE_URL']
tasks_table = dynamodb.Table('Tasks')

def lambda_handler(event, context):
    """タスクを作成してキューに追加"""
    
    body = json.loads(event.get('body', '{}'))
    
    # タスクID生成
    task_id = str(uuid.uuid4())
    
    # DynamoDBにタスク情報を保存
    tasks_table.put_item(
        Item={
            'taskId': task_id,
            'status': 'QUEUED',
            'type': body['type'],
            'createdAt': int(time.time()),
            'data': body.get('data', {})
        }
    )
    
    # SQSにメッセージ送信
    sqs.send_message(
        QueueUrl=QUEUE_URL,
        MessageBody=json.dumps({
            'taskId': task_id,
            'type': body['type'],
            'data': body.get('data', {})
        })
    )
    
    return {
        'statusCode': 202,
        'body': json.dumps({
            'taskId': task_id,
            'status': 'QUEUED'
        })
    }
```

### Consumer
```python
def lambda_handler(event, context):
    """タスクを処理"""
    
    for record in event['Records']:
        body = json.loads(record['body'])
        task_id = body['taskId']
        
        try:
            # ステータスを「処理中」に更新
            tasks_table.update_item(
                Key={'taskId': task_id},
                UpdateExpression='SET #status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':status': 'PROCESSING'}
            )
            
            # タスク処理
            result = process_task(body)
            
            # ステータスを「完了」に更新
            tasks_table.update_item(
                Key={'taskId': task_id},
                UpdateExpression='SET #status = :status, result = :result',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':status': 'COMPLETED',
                    ':result': result
                }
            )
            
        except Exception as e:
            # エラー時は「失敗」に更新
            tasks_table.update_item(
                Key={'taskId': task_id},
                UpdateExpression='SET #status = :status, error = :error',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':status': 'FAILED',
                    ':error': str(e)
                }
            )
            raise
```

## まとめ

✅ SQSキューの作成（Standard / FIFO）
✅ メッセージの送信（単一 / バッチ）
✅ Lambda関数でのメッセージ処理
✅ エラーハンドリングとリトライ
✅ Dead Letter Queue
✅ べき等性の確保
✅ 実践例：非同期タスク処理システム

**次のステップ**:
- [11_LambdaとSNS接続](./11_LambdaとSNS接続.md)
- [12_LambdaとEventBridge接続](./12_LambdaとEventBridge接続.md)

---

**関連ドキュメント**:
- [SQS公式ドキュメント](https://docs.aws.amazon.com/sqs/)
- [Lambda基礎](../03_コンピューティング/Lambda/AWS_Lambda.md)

