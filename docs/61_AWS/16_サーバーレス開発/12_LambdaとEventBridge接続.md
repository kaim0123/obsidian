# Lambda と EventBridge の接続

## 概要
このガイドでは、AWS Lambda関数とAmazon EventBridge（旧CloudWatch Events）を統合し、イベント駆動アーキテクチャを実装する方法を学びます。

## EventBridge の特徴

### メリット
```
✅ イベント駆動アーキテクチャの実現
✅ 柔軟なイベントルーティング
✅ スケジュール実行（cronジョブ）
✅ SaaSアプリケーション統合（Salesforce、Zendesk等）
✅ カスタムイベントバス
✅ スキーマレジストリ
✅ イベントリプレイ
```

### 主要コンポーネント
```
1. イベントバス: イベントを受信
2. ルール: イベントパターンでフィルタリング
3. ターゲット: ルールにマッチしたイベントの送信先
```

## EventBridge と SNS の違い

### EventBridge
```
用途:
- イベント駆動アーキテクチャ
- 複雑なイベントルーティング
- スケジュール実行
- AWS サービス統合

特徴:
- イベントパターンマッチング
- イベント変換
- アーカイブ・リプレイ
```

### SNS
```
用途:
- シンプルな通知
- ファンアウト
- モバイルプッシュ

特徴:
- Pub/Sub モデル
- 複数プロトコル対応
- シンプルなフィルタリング
```

## A. EventBridge ルールの作成

### SAMテンプレート（スケジュール実行）
```yaml
Resources:
  # スケジュール実行Lambda
  ScheduledFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: scheduled-task
      Runtime: python3.11
      Handler: app.lambda_handler
      CodeUri: functions/scheduled/
      Events:
        # 毎日午前9時（JST）に実行
        DailySchedule:
          Type: Schedule
          Properties:
            Schedule: cron(0 0 * * ? *)  # UTC 00:00 = JST 09:00
            Description: Daily report generation
            Enabled: true
        
        # 5分ごとに実行
        EveryFiveMinutes:
          Type: Schedule
          Properties:
            Schedule: rate(5 minutes)
            Description: Health check
            Enabled: true
        
        # 毎週月曜日の午前10時
        WeeklyMonday:
          Type: Schedule
          Properties:
            Schedule: cron(0 1 ? * MON *)  # UTC 01:00 Monday
            Description: Weekly summary
            Enabled: true

  # イベントパターンによるトリガー
  EventDrivenFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: event-handler
      Runtime: python3.11
      Handler: app.lambda_handler
      CodeUri: functions/event_handler/
      Events:
        # EC2状態変更イベント
        EC2StateChange:
          Type: EventBridgeRule
          Properties:
            EventBusName: default
            Pattern:
              source:
                - aws.ec2
              detail-type:
                - EC2 Instance State-change Notification
              detail:
                state:
                  - running
                  - stopped
        
        # カスタムイベント
        CustomEvent:
          Type: EventBridgeRule
          Properties:
            EventBusName: !Ref CustomEventBus
            Pattern:
              source:
                - myapp.orders
              detail-type:
                - Order Placed
              detail:
                amount:
                  - numeric: [">", 1000]

  # カスタムイベントバス
  CustomEventBus:
    Type: AWS::Events::EventBus
    Properties:
      Name: myapp-event-bus

  # イベントアーカイブ（リプレイ用）
  EventArchive:
    Type: AWS::Events::Archive
    Properties:
      ArchiveName: myapp-events-archive
      SourceArn: !GetAtt CustomEventBus.Arn
      RetentionDays: 30
      EventPattern:
        source:
          - myapp.orders

Outputs:
  EventBusArn:
    Value: !GetAtt CustomEventBus.Arn
    Export:
      Name: !Sub ${AWS::StackName}-EventBusArn
```

### Cron式とRate式
```
Cron式: cron(分 時 日 月 曜日 年)
- cron(0 0 * * ? *)      # 毎日午前0時（UTC）
- cron(0 9 * * ? *)      # 毎日午前9時（UTC）
- cron(0 12 * * MON-FRI *) # 平日の正午
- cron(0/15 * * * ? *)   # 15分ごと
- cron(0 10 1 * ? *)     # 毎月1日の午前10時

Rate式: rate(値 単位)
- rate(5 minutes)        # 5分ごと
- rate(1 hour)           # 1時間ごと
- rate(1 day)            # 1日ごと
```

## B. イベントのパブリッシュ

### カスタムイベントの送信
```python
import boto3
import json
import os
from datetime import datetime
from typing import Dict, Any

eventbridge = boto3.client('events')
EVENT_BUS_NAME = os.environ.get('EVENT_BUS_NAME', 'default')

def put_event(
    source: str,
    detail_type: str,
    detail: Dict[str, Any],
    resources: list = None
) -> str:
    """EventBridgeにイベントを送信"""
    try:
        response = eventbridge.put_events(
            Entries=[
                {
                    'Source': source,
                    'DetailType': detail_type,
                    'Detail': json.dumps(detail),
                    'EventBusName': EVENT_BUS_NAME,
                    'Resources': resources or [],
                    'Time': datetime.now()
                }
            ]
        )
        
        if response['FailedEntryCount'] > 0:
            print(f"Failed to send events: {response['Entries']}")
            raise Exception('Failed to send event')
        
        event_id = response['Entries'][0]['EventId']
        print(f"Event sent: {event_id}")
        return event_id
        
    except Exception as e:
        print(f"Error sending event: {str(e)}")
        raise

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """注文イベントをEventBridgeに送信"""
    try:
        body = json.loads(event.get('body', '{}'))
        
        # 注文データ
        order_data = {
            'orderId': body['orderId'],
            'customerId': body['customerId'],
            'amount': body['amount'],
            'items': body.get('items', []),
            'timestamp': datetime.now().isoformat()
        }
        
        # イベントを送信
        event_id = put_event(
            source='myapp.orders',
            detail_type='Order Placed',
            detail=order_data,
            resources=[f"order/{body['orderId']}"]
        )
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'message': 'Order placed successfully',
                'orderId': body['orderId'],
                'eventId': event_id
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

### バッチでイベント送信（最大10件）
```python
def put_events_batch(events: list) -> Dict[str, Any]:
    """複数のイベントを一度に送信"""
    
    entries = []
    for event_data in events[:10]:  # 最大10件
        entries.append({
            'Source': event_data['source'],
            'DetailType': event_data['detailType'],
            'Detail': json.dumps(event_data['detail']),
            'EventBusName': EVENT_BUS_NAME,
            'Time': datetime.now()
        })
    
    response = eventbridge.put_events(Entries=entries)
    
    print(f"Successful: {len(entries) - response['FailedEntryCount']}")
    print(f"Failed: {response['FailedEntryCount']}")
    
    return response

# 使用例
events = [
    {
        'source': 'myapp.analytics',
        'detailType': 'Page View',
        'detail': {'pageId': 'home', 'userId': '123'}
    },
    {
        'source': 'myapp.analytics',
        'detailType': 'Button Click',
        'detail': {'buttonId': 'signup', 'userId': '123'}
    }
]
put_events_batch(events)
```

## C. イベントの受信と処理

### Lambda関数での処理
```python
import json
from typing import Dict, Any

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """EventBridgeイベントを処理"""
    
    print(f"Event: {json.dumps(event)}")
    
    # イベント情報
    source = event.get('source')
    detail_type = event.get('detail-type')
    detail = event.get('detail', {})
    resources = event.get('resources', [])
    
    print(f"Source: {source}")
    print(f"Detail Type: {detail_type}")
    
    try:
        # ソースとタイプに応じた処理
        if source == 'myapp.orders':
            if detail_type == 'Order Placed':
                handle_order_placed(detail)
            elif detail_type == 'Order Cancelled':
                handle_order_cancelled(detail)
        
        elif source == 'aws.ec2':
            if detail_type == 'EC2 Instance State-change Notification':
                handle_ec2_state_change(detail)
        
        elif source == 'aws.s3':
            if detail_type == 'Object Created':
                handle_s3_object_created(detail)
        
        else:
            print(f"Unknown event: {source} - {detail_type}")
        
        return {'statusCode': 200}
        
    except Exception as e:
        print(f"Error processing event: {str(e)}")
        raise

def handle_order_placed(detail: Dict[str, Any]):
    """注文イベントを処理"""
    order_id = detail['orderId']
    amount = detail['amount']
    
    print(f"Processing order {order_id} with amount {amount}")
    
    # 在庫確認
    check_inventory(order_id)
    
    # 支払い処理
    process_payment(order_id)
    
    # 確認メール送信
    send_confirmation_email(order_id)

def handle_ec2_state_change(detail: Dict[str, Any]):
    """EC2状態変更イベントを処理"""
    instance_id = detail['instance-id']
    state = detail['state']
    
    print(f"EC2 Instance {instance_id} is now {state}")
    
    if state == 'stopped':
        # 停止時の処理
        notify_admin(f"Instance {instance_id} has stopped")
    elif state == 'running':
        # 起動時の処理
        register_instance(instance_id)
```

### イベント構造
```json
{
  "version": "0",
  "id": "12345678-1234-1234-1234-123456789012",
  "detail-type": "Order Placed",
  "source": "myapp.orders",
  "account": "123456789012",
  "time": "2024-01-01T00:00:00Z",
  "region": "ap-northeast-1",
  "resources": [
    "order/12345"
  ],
  "detail": {
    "orderId": "12345",
    "customerId": "67890",
    "amount": 1500,
    "items": [
      {"productId": "ABC", "quantity": 2}
    ],
    "timestamp": "2024-01-01T00:00:00"
  }
}
```

## D. イベントパターンマッチング

### 基本的なパターン
```json
{
  "source": ["myapp.orders"],
  "detail-type": ["Order Placed"]
}
```

### 複数の値（OR条件）
```json
{
  "source": ["myapp.orders"],
  "detail-type": ["Order Placed", "Order Updated", "Order Cancelled"]
}
```

### ネストされたフィールド
```json
{
  "source": ["myapp.orders"],
  "detail": {
    "amount": [{"numeric": [">", 1000]}],
    "status": ["pending", "processing"]
  }
}
```

### 数値比較
```json
{
  "detail": {
    "amount": [
      {"numeric": [">", 100]},
      {"numeric": ["<=", 1000]}
    ]
  }
}
```

### 存在チェック
```json
{
  "detail": {
    "priority": [{"exists": true}]
  }
}
```

### プレフィックスマッチング
```json
{
  "detail": {
    "eventType": [{"prefix": "order."}]
  }
}
```

### 複雑なパターン
```json
{
  "source": ["myapp.orders"],
  "detail-type": ["Order Placed"],
  "detail": {
    "amount": [{"numeric": [">", 1000]}],
    "region": ["us-east-1", "eu-west-1"],
    "priority": [{"exists": true}],
    "category": [{"prefix": "electronics"}],
    "customerId": [{"anything-but": ["blocked-user-123"]}]
  }
}
```

## E. スケジュール実行の実装

### 定期バッチ処理
```python
import boto3
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

def lambda_handler(event, context):
    """毎日午前0時に実行されるバッチ処理"""
    
    print("Starting daily batch process...")
    
    try:
        # 前日のデータを集計
        yesterday = datetime.now() - timedelta(days=1)
        
        # データベースから集計
        stats = aggregate_daily_stats(yesterday)
        
        # レポート生成
        report = generate_report(stats)
        
        # S3に保存
        save_to_s3(report, yesterday)
        
        # 通知送信
        send_notification(report)
        
        print("Daily batch process completed successfully")
        return {'statusCode': 200}
        
    except Exception as e:
        print(f"Batch process failed: {str(e)}")
        send_error_alert(str(e))
        raise

def aggregate_daily_stats(date: datetime) -> Dict[str, Any]:
    """日次統計を集計"""
    table = dynamodb.Table('Transactions')
    
    # データを取得・集計
    # ...
    
    return {
        'date': date.strftime('%Y-%m-%d'),
        'totalOrders': 150,
        'totalRevenue': 150000,
        'newUsers': 50
    }

def send_notification(report: Dict[str, Any]):
    """レポートを通知"""
    sns.publish(
        TopicArn=os.environ['REPORT_TOPIC_ARN'],
        Subject='Daily Report',
        Message=json.dumps(report, indent=2)
    )
```

### 動的スケジュール管理
```python
def create_scheduled_rule(rule_name: str, schedule_expression: str, target_function_arn: str):
    """動的にスケジュールルールを作成"""
    
    events_client = boto3.client('events')
    lambda_client = boto3.client('lambda')
    
    # ルールを作成
    events_client.put_rule(
        Name=rule_name,
        ScheduleExpression=schedule_expression,
        State='ENABLED',
        Description='Dynamically created scheduled rule'
    )
    
    # ターゲットを追加
    events_client.put_targets(
        Rule=rule_name,
        Targets=[
            {
                'Id': '1',
                'Arn': target_function_arn
            }
        ]
    )
    
    # Lambda に EventBridge からの実行権限を付与
    lambda_client.add_permission(
        FunctionName=target_function_arn,
        StatementId=f'{rule_name}-permission',
        Action='lambda:InvokeFunction',
        Principal='events.amazonaws.com',
        SourceArn=f'arn:aws:events:*:*:rule/{rule_name}'
    )

# 使用例
create_scheduled_rule(
    rule_name='custom-schedule-123',
    schedule_expression='rate(30 minutes)',
    target_function_arn='arn:aws:lambda:ap-northeast-1:123456789012:function:my-function'
)
```

## F. クロスアカウント・クロスリージョンイベント

### イベントバスポリシーの設定
```python
def allow_cross_account_events(event_bus_arn: str, allowed_accounts: list):
    """他のアカウントからのイベントを許可"""
    
    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowCrossAccountEvents",
                "Effect": "Allow",
                "Principal": {
                    "AWS": [f"arn:aws:iam::{account}:root" for account in allowed_accounts]
                },
                "Action": "events:PutEvents",
                "Resource": event_bus_arn
            }
        ]
    }
    
    eventbridge.put_permission(
        EventBusName=event_bus_arn.split('/')[-1],
        Policy=json.dumps(policy)
    )
```

### クロスリージョンイベント送信
```yaml
Resources:
  # us-east-1 のイベントを ap-northeast-1 に転送
  CrossRegionRule:
    Type: AWS::Events::Rule
    Properties:
      Name: forward-to-tokyo
      EventBusName: default
      State: ENABLED
      EventPattern:
        source:
          - myapp.orders
      Targets:
        - Arn: arn:aws:events:ap-northeast-1:123456789012:event-bus/target-bus
          RoleArn: !GetAtt CrossRegionRole.Arn
          Id: TokyoBus
```

## G. イベントのリプレイ

### アーカイブからのリプレイ
```python
def replay_events(
    archive_name: str,
    replay_name: str,
    start_time: datetime,
    end_time: datetime,
    destination_arn: str
):
    """アーカイブされたイベントをリプレイ"""
    
    response = eventbridge.start_replay(
        ReplayName=replay_name,
        EventSourceArn=f'arn:aws:events:ap-northeast-1:123456789012:archive/{archive_name}',
        EventStartTime=start_time,
        EventEndTime=end_time,
        Destination={
            'Arn': destination_arn
        }
    )
    
    return response['ReplayArn']

# 使用例：昨日のイベントを再処理
from datetime import datetime, timedelta

yesterday_start = datetime.now() - timedelta(days=1)
yesterday_start = yesterday_start.replace(hour=0, minute=0, second=0)
yesterday_end = yesterday_start.replace(hour=23, minute=59, second=59)

replay_arn = replay_events(
    archive_name='myapp-events-archive',
    replay_name='replay-yesterday',
    start_time=yesterday_start,
    end_time=yesterday_end,
    destination_arn='arn:aws:events:ap-northeast-1:123456789012:event-bus/default'
)
```

## H. ベストプラクティス

### 1. イベント設計
```python
# 良い例：構造化された詳細なイベント
good_event = {
    'source': 'myapp.orders',
    'detail-type': 'Order Placed',
    'detail': {
        'orderId': '12345',
        'customerId': '67890',
        'amount': 1000,
        'currency': 'JPY',
        'items': [...],
        'timestamp': '2024-01-01T00:00:00Z',
        'metadata': {
            'version': '1.0',
            'correlationId': 'abc-123'
        }
    }
}

# 悪い例：最小限の情報のみ
bad_event = {
    'source': 'myapp',
    'detail-type': 'Event',
    'detail': {
        'id': '12345'
    }
}
```

### 2. エラーハンドリング
```python
def lambda_handler(event, context):
    try:
        process_event(event)
    except Exception as e:
        # エラーをログに記録
        print(f"Error: {str(e)}")
        
        # Dead Letter Queueに送信
        send_to_dlq(event, str(e))
        
        # 必要に応じて再スロー（リトライさせる）
        # raise
```

### 3. べき等性の確保
```python
processed_events = set()  # 実際はDynamoDBなどで管理

def lambda_handler(event, context):
    event_id = event['id']
    
    if event_id in processed_events:
        print(f"Event {event_id} already processed")
        return {'statusCode': 200}
    
    process_event(event)
    processed_events.add(event_id)
```

## まとめ

✅ EventBridgeルールの作成（スケジュール/イベントパターン）
✅ カスタムイベントのパブリッシュ
✅ Lambda関数でのイベント処理
✅ 柔軟なイベントパターンマッチング
✅ スケジュール実行の実装
✅ クロスアカウント・クロスリージョンイベント
✅ イベントのアーカイブとリプレイ
✅ ベストプラクティス

**次のステップ**:
- [13_LambdaとStepFunctions接続](./13_LambdaとStepFunctions接続.md)
- [18_ベストプラクティス](./18_ベストプラクティス.md)

---

**関連ドキュメント**:
- [EventBridge基礎](../09_アプリケーション統合/04_EventBridge.md)
- [EventBridge公式ドキュメント](https://docs.aws.amazon.com/eventbridge/)

