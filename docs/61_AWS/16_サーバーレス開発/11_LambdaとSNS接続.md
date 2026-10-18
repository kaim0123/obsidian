# Lambda と SNS の接続

## 概要
このガイドでは、AWS Lambda関数とAmazon SNS（Simple Notification Service）を統合し、プッシュ通知やファンアウトパターンを実装する方法を学びます。

## SNS の特徴

### メリット
```
✅ Pub/Sub（パブリッシュ/サブスクライブ）モデル
✅ 複数のサブスクライバーに同時配信（ファンアウト）
✅ 複数の配信プロトコル対応
✅ メッセージフィルタリング
✅ モバイルプッシュ通知
✅ SMS/メール送信
✅ 完全マネージド型
```

### 配信プロトコル
```
- Lambda関数
- SQS
- HTTP/HTTPS エンドポイント
- Email/Email-JSON
- SMS
- モバイルプッシュ通知（iOS、Android、Firebase）
- Kinesis Data Firehose
```

## SNS と SQS の違い

### SNS（プッシュ型）
```
用途:
- リアルタイム通知
- 複数のサブスクライバー
- ファンアウトパターン
- アラート・通知

特徴:
- メッセージは即座に配信
- サブスクライバーが処理
```

### SQS（プル型）
```
用途:
- 非同期タスク処理
- キューイング
- デカップリング
- バッファリング

特徴:
- メッセージはキューに保存
- コンシューマーがポーリング
```

### SNS + SQS パターン（推奨）
```
SNS Topic
  ├→ SQS Queue 1 → Lambda 1
  ├→ SQS Queue 2 → Lambda 2
  └→ SQS Queue 3 → Lambda 3

メリット:
✅ ファンアウト + バッファリング
✅ 各サービスが独立してスケール
✅ 失敗時の再試行
```

## A. SNS トピックの作成

### SAMテンプレート
```yaml
Resources:
  # SNS トピック
  NotificationTopic:
    Type: AWS::SNS::Topic
    Properties:
      TopicName: app-notifications
      DisplayName: Application Notifications
      FifoTopic: false
      ContentBasedDeduplication: false

  # Lambda サブスクリプション
  LambdaSubscription:
    Type: AWS::SNS::Subscription
    Properties:
      Protocol: lambda
      TopicArn: !Ref NotificationTopic
      Endpoint: !GetAtt NotificationHandlerFunction.Arn
      FilterPolicy:
        eventType:
          - order
          - payment

  # Lambda に SNS からの実行権限を付与
  LambdaInvokePermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref NotificationHandlerFunction
      Action: lambda:InvokeFunction
      Principal: sns.amazonaws.com
      SourceArn: !Ref NotificationTopic

  # メール サブスクリプション
  EmailSubscription:
    Type: AWS::SNS::Subscription
    Properties:
      Protocol: email
      TopicArn: !Ref NotificationTopic
      Endpoint: admin@example.com
      FilterPolicy:
        severity:
          - critical
          - high

  # SQS サブスクリプション（ファンアウト）
  SQSSubscription:
    Type: AWS::SNS::Subscription
    Properties:
      Protocol: sqs
      TopicArn: !Ref NotificationTopic
      Endpoint: !GetAtt ProcessingQueue.Arn

  ProcessingQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: notification-processing-queue

  # SQS に SNS からのメッセージ送信権限を付与
  QueuePolicy:
    Type: AWS::SQS::QueuePolicy
    Properties:
      Queues:
        - !Ref ProcessingQueue
      PolicyDocument:
        Statement:
          - Effect: Allow
            Principal:
              Service: sns.amazonaws.com
            Action: sqs:SendMessage
            Resource: !GetAtt ProcessingQueue.Arn
            Condition:
              ArnEquals:
                aws:SourceArn: !Ref NotificationTopic

  # パブリッシャー Lambda
  PublisherFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: sns-publisher
      Runtime: python3.11
      Handler: app.lambda_handler
      CodeUri: functions/publisher/
      Environment:
        Variables:
          TOPIC_ARN: !Ref NotificationTopic
      Policies:
        - SNSPublishMessagePolicy:
            TopicName: !GetAtt NotificationTopic.TopicName

  # サブスクライバー Lambda
  NotificationHandlerFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: notification-handler
      Runtime: python3.11
      Handler: app.lambda_handler
      CodeUri: functions/handler/

Outputs:
  TopicArn:
    Value: !Ref NotificationTopic
    Export:
      Name: !Sub ${AWS::StackName}-TopicArn
```

## B. メッセージのパブリッシュ

### 基本的なパブリッシュ
```python
import boto3
import json
import os
from typing import Dict, Any

sns = boto3.client('sns')
TOPIC_ARN = os.environ['TOPIC_ARN']

def publish_message(message: str, subject: str = None, attributes: Dict = None) -> str:
    """SNSトピックにメッセージをパブリッシュ"""
    try:
        params = {
            'TopicArn': TOPIC_ARN,
            'Message': message,
        }
        
        if subject:
            params['Subject'] = subject
        
        if attributes:
            params['MessageAttributes'] = attributes
        
        response = sns.publish(**params)
        message_id = response['MessageId']
        
        print(f"Message published: {message_id}")
        return message_id
        
    except Exception as e:
        print(f"Error publishing message: {str(e)}")
        raise

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """イベントを SNS にパブリッシュ"""
    try:
        body = json.loads(event.get('body', '{}'))
        
        # メッセージの作成
        message = json.dumps({
            'eventType': body.get('eventType', 'notification'),
            'timestamp': context.request_id,
            'data': body.get('data', {})
        })
        
        # メッセージ属性（フィルタリング用）
        message_attributes = {
            'eventType': {
                'DataType': 'String',
                'StringValue': body.get('eventType', 'notification')
            },
            'severity': {
                'DataType': 'String',
                'StringValue': body.get('severity', 'info')
            }
        }
        
        # パブリッシュ
        message_id = publish_message(
            message=message,
            subject=f"Event: {body.get('eventType')}",
            attributes=message_attributes
        )
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'message': 'Published successfully',
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

### 構造化メッセージ（複数プロトコル対応）
```python
def publish_structured_message(event_data: Dict[str, Any]) -> str:
    """異なるプロトコル向けにカスタマイズしたメッセージ"""
    
    # デフォルトメッセージ
    default_message = json.dumps(event_data)
    
    # プロトコル別メッセージ
    message_structure = {
        'default': default_message,
        'email': f"Subject: {event_data['title']}\n\n{event_data['description']}",
        'sms': event_data.get('shortMessage', event_data['title']),
        'lambda': json.dumps(event_data),  # Lambda用の詳細データ
        'sqs': json.dumps(event_data)
    }
    
    response = sns.publish(
        TopicArn=TOPIC_ARN,
        Message=json.dumps(message_structure),
        MessageStructure='json',  # 重要
        Subject=event_data.get('title', 'Notification'),
        MessageAttributes={
            'eventType': {
                'DataType': 'String',
                'StringValue': event_data.get('eventType', 'notification')
            }
        }
    )
    
    return response['MessageId']

# 使用例
publish_structured_message({
    'eventType': 'order',
    'title': '新しい注文',
    'description': '注文ID: 12345\n商品: サンプル商品\n金額: ¥1,000',
    'shortMessage': '新しい注文が入りました',
    'orderId': '12345',
    'amount': 1000
})
```

## C. Lambda でのメッセージ受信

### SNSイベント処理
```python
import json
from typing import Dict, Any

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """SNSメッセージを処理"""
    
    print(f"Processing {len(event['Records'])} records")
    
    for record in event['Records']:
        # SNSメッセージ
        sns_message = record['Sns']
        
        # 基本情報
        message_id = sns_message['MessageId']
        subject = sns_message.get('Subject', 'No Subject')
        timestamp = sns_message['Timestamp']
        
        # メッセージボディ
        message_body = sns_message['Message']
        
        # メッセージ属性
        message_attributes = sns_message.get('MessageAttributes', {})
        event_type = message_attributes.get('eventType', {}).get('Value')
        severity = message_attributes.get('severity', {}).get('Value')
        
        print(f"Message ID: {message_id}")
        print(f"Subject: {subject}")
        print(f"Event Type: {event_type}")
        print(f"Severity: {severity}")
        
        try:
            # メッセージをJSONとしてパース
            data = json.loads(message_body)
            
            # イベントタイプに応じた処理
            if event_type == 'order':
                process_order(data)
            elif event_type == 'payment':
                process_payment(data)
            elif event_type == 'alert':
                handle_alert(data, severity)
            else:
                print(f"Unknown event type: {event_type}")
        
        except json.JSONDecodeError:
            print(f"Message is not JSON: {message_body}")
        
        except Exception as e:
            print(f"Error processing message: {str(e)}")
            # SNSからのトリガーでは再試行されないため、
            # 失敗ログを記録するか、DLQを設定する
    
    return {'statusCode': 200}

def process_order(order_data: Dict[str, Any]):
    """注文を処理"""
    print(f"Processing order: {order_data.get('orderId')}")
    # 注文処理ロジック...

def process_payment(payment_data: Dict[str, Any]):
    """支払いを処理"""
    print(f"Processing payment: {payment_data.get('transactionId')}")
    # 支払い処理ロジック...

def handle_alert(alert_data: Dict[str, Any], severity: str):
    """アラートを処理"""
    print(f"Handling {severity} alert: {alert_data.get('message')}")
    
    if severity in ['critical', 'high']:
        # 緊急対応
        send_pagerduty_alert(alert_data)
```

### SNSイベント構造
```json
{
  "Records": [
    {
      "EventSource": "aws:sns",
      "EventVersion": "1.0",
      "EventSubscriptionArn": "arn:aws:sns:ap-northeast-1:123456789012:app-notifications:12345678-1234-1234-1234-123456789012",
      "Sns": {
        "Type": "Notification",
        "MessageId": "12345678-1234-1234-1234-123456789012",
        "TopicArn": "arn:aws:sns:ap-northeast-1:123456789012:app-notifications",
        "Subject": "Event: order",
        "Message": "{\"eventType\":\"order\",\"orderId\":\"12345\",\"amount\":1000}",
        "Timestamp": "2024-01-01T00:00:00.000Z",
        "SignatureVersion": "1",
        "Signature": "...",
        "SigningCertUrl": "...",
        "UnsubscribeUrl": "...",
        "MessageAttributes": {
          "eventType": {
            "Type": "String",
            "Value": "order"
          },
          "severity": {
            "Type": "String",
            "Value": "info"
          }
        }
      }
    }
  ]
}
```

## D. メッセージフィルタリング

### フィルターポリシーの設定
```python
import boto3

sns = boto3.client('sns')

def update_subscription_filter(subscription_arn: str, filter_policy: Dict[str, Any]):
    """サブスクリプションのフィルターポリシーを更新"""
    
    sns.set_subscription_attributes(
        SubscriptionArn=subscription_arn,
        AttributeName='FilterPolicy',
        AttributeValue=json.dumps(filter_policy)
    )

# 使用例：特定のイベントタイプのみ受信
update_subscription_filter(
    subscription_arn='arn:aws:sns:...',
    filter_policy={
        'eventType': ['order', 'payment'],
        'severity': ['critical', 'high']
    }
)
```

### SAMテンプレートでのフィルター設定
```yaml
Resources:
  # 注文専用Lambda
  OrderHandlerSubscription:
    Type: AWS::SNS::Subscription
    Properties:
      Protocol: lambda
      TopicArn: !Ref NotificationTopic
      Endpoint: !GetAtt OrderHandlerFunction.Arn
      FilterPolicy:
        eventType:
          - order

  # 高優先度アラート専用Lambda
  AlertHandlerSubscription:
    Type: AWS::SNS::Subscription
    Properties:
      Protocol: lambda
      TopicArn: !Ref NotificationTopic
      Endpoint: !GetAtt AlertHandlerFunction.Arn
      FilterPolicy:
        severity:
          - critical
          - high
        eventType:
          - alert
          - error
```

### 複雑なフィルターポリシー
```python
filter_policy = {
    # AND条件（すべて一致）
    'eventType': ['order'],
    'amount': [{'numeric': ['>', 1000]}],
    'region': ['us-east-1', 'eu-west-1'],
    
    # 存在チェック
    'priority': [{'exists': True}],
    
    # プレフィックスマッチング
    'category': [{'prefix': 'electronics'}]
}
```

## E. SMS送信

### SMS メッセージの送信
```python
def send_sms(phone_number: str, message: str) -> str:
    """SMSメッセージを送信"""
    try:
        response = sns.publish(
            PhoneNumber=phone_number,  # +81901234567 形式
            Message=message,
            MessageAttributes={
                'AWS.SNS.SMS.SMSType': {
                    'DataType': 'String',
                    'StringValue': 'Transactional'  # または 'Promotional'
                },
                'AWS.SNS.SMS.SenderID': {
                    'DataType': 'String',
                    'StringValue': 'MyApp'
                }
            }
        )
        
        return response['MessageId']
        
    except Exception as e:
        print(f"Error sending SMS: {str(e)}")
        raise

# 使用例
send_sms(
    phone_number='+819012345678',
    message='認証コード: 123456'
)
```

### SMS 設定の管理
```python
def configure_sms_settings():
    """SMS送信設定を構成"""
    sns.set_sms_attributes(
        attributes={
            'DefaultSMSType': 'Transactional',  # トランザクショナル（優先度高）
            'MonthlySpendLimit': '100',  # 月間予算上限（USD）
            'DeliveryStatusSuccessSamplingRate': '100',  # 成功ログのサンプリング率
            'DefaultSenderID': 'MyApp',  # 送信者ID
            'UsageReportS3Bucket': 'my-sms-logs'  # ログ保存先
        }
    )
```

## F. モバイルプッシュ通知

### プラットフォームアプリケーションの作成
```python
def create_platform_application(name: str, platform: str, credentials: Dict[str, str]) -> str:
    """プラットフォームアプリケーションを作成"""
    
    # platform: 'GCM' (Firebase), 'APNS' (iOS), 'APNS_SANDBOX'
    
    response = sns.create_platform_application(
        Name=name,
        Platform=platform,
        Attributes=credentials
    )
    
    return response['PlatformApplicationArn']

# Firebase (Android)
fcm_app_arn = create_platform_application(
    name='MyApp-Android',
    platform='GCM',
    credentials={
        'PlatformCredential': 'YOUR_FCM_SERVER_KEY'
    }
)

# iOS
apns_app_arn = create_platform_application(
    name='MyApp-iOS',
    platform='APNS',
    credentials={
        'PlatformPrincipal': 'YOUR_APNS_CERTIFICATE',
        'PlatformCredential': 'YOUR_APNS_PRIVATE_KEY'
    }
)
```

### デバイスエンドポイントの登録
```python
def register_device(platform_app_arn: str, device_token: str, user_data: Dict = None) -> str:
    """デバイスをプラットフォームに登録"""
    
    response = sns.create_platform_endpoint(
        PlatformApplicationArn=platform_app_arn,
        Token=device_token,
        CustomUserData=json.dumps(user_data) if user_data else None
    )
    
    return response['EndpointArn']
```

### プッシュ通知の送信
```python
def send_push_notification(endpoint_arn: str, title: str, body: str, data: Dict = None):
    """モバイルプッシュ通知を送信"""
    
    # Firebase (Android) 向けメッセージ
    gcm_message = {
        'notification': {
            'title': title,
            'body': body
        },
        'data': data or {}
    }
    
    # iOS 向けメッセージ
    apns_message = {
        'aps': {
            'alert': {
                'title': title,
                'body': body
            },
            'badge': 1,
            'sound': 'default'
        },
        'data': data or {}
    }
    
    message = {
        'default': body,
        'GCM': json.dumps(gcm_message),
        'APNS': json.dumps(apns_message),
        'APNS_SANDBOX': json.dumps(apns_message)
    }
    
    sns.publish(
        TargetArn=endpoint_arn,
        Message=json.dumps(message),
        MessageStructure='json'
    )

# 使用例
send_push_notification(
    endpoint_arn='arn:aws:sns:...',
    title='新しいメッセージ',
    body='田中さんからメッセージが届きました',
    data={'messageId': '12345', 'senderId': '67890'}
)
```

## G. ファンアウトパターン

### SNS + SQS ファンアウト
```yaml
Resources:
  # 1つのSNSトピック
  EventTopic:
    Type: AWS::SNS::Topic
    Properties:
      TopicName: event-topic

  # 複数のSQSキュー
  EmailQueue:
    Type: AWS::SQS::Queue
  
  SMSQueue:
    Type: AWS::SQS::Queue
  
  PushQueue:
    Type: AWS::SQS::Queue
  
  AnalyticsQueue:
    Type: AWS::SQS::Queue

  # 各キューをSNSにサブスクライブ
  EmailSubscription:
    Type: AWS::SNS::Subscription
    Properties:
      Protocol: sqs
      TopicArn: !Ref EventTopic
      Endpoint: !GetAtt EmailQueue.Arn
      FilterPolicy:
        channel: [email]
  
  # 各キューから処理Lambda
  EmailProcessorFunction:
    Type: AWS::Serverless::Function
    Properties:
      Events:
        SQSEvent:
          Type: SQS
          Properties:
            Queue: !GetAtt EmailQueue.Arn
```

### パブリッシャー
```python
def publish_event(event_data: Dict[str, Any]):
    """イベントを複数のチャネルに配信"""
    
    sns.publish(
        TopicArn=TOPIC_ARN,
        Message=json.dumps(event_data),
        MessageAttributes={
            'channel': {
                'DataType': 'String.Array',
                'StringValue': json.dumps(['email', 'sms', 'push'])
            },
            'eventType': {
                'DataType': 'String',
                'StringValue': event_data['type']
            }
        }
    )
```

## H. エラーハンドリングとモニタリング

### デッドレターキュー（DLQ）
```yaml
Resources:
  NotificationHandlerFunction:
    Type: AWS::Serverless::Function
    Properties:
      DeadLetterQueue:
        Type: SNS
        TargetArn: !Ref FailedNotificationsTopic
  
  FailedNotificationsTopic:
    Type: AWS::SNS::Topic
    Properties:
      TopicName: failed-notifications
```

### 配信ステータスのロギング
```python
def enable_delivery_status_logging(topic_arn: str, role_arn: str):
    """配信ステータスのロギングを有効化"""
    
    # Lambda配信のロギング
    sns.set_topic_attributes(
        TopicArn=topic_arn,
        AttributeName='LambdaSuccessFeedbackRoleArn',
        AttributeValue=role_arn
    )
    
    sns.set_topic_attributes(
        TopicArn=topic_arn,
        AttributeName='LambdaFailureFeedbackRoleArn',
        AttributeValue=role_arn
    )
    
    # サンプリング率
    sns.set_topic_attributes(
        TopicArn=topic_arn,
        AttributeName='LambdaSuccessFeedbackSampleRate',
        AttributeValue='100'  # 100%
    )
```

## まとめ

✅ SNSトピックの作成とサブスクリプション
✅ Lambda関数でのメッセージパブリッシュ
✅ Lambda関数でのメッセージ受信
✅ メッセージフィルタリング
✅ SMS送信
✅ モバイルプッシュ通知
✅ ファンアウトパターン（SNS + SQS）
✅ エラーハンドリングとモニタリング

**次のステップ**:
- [12_LambdaとEventBridge接続](./12_LambdaとEventBridge接続.md)
- [10_LambdaとSQS接続](./10_LambdaとSQS接続.md)

---

**関連ドキュメント**:
- [SNS公式ドキュメント](https://docs.aws.amazon.com/sns/)
- [Lambda基礎](../03_コンピューティング/Lambda/AWS_Lambda.md)

