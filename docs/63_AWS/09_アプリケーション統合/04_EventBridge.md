# AWS EventBridge 初心者向け解説

## 目次
1. [EventBridgeとは](#eventbridgeとは)
2. [主要な概念](#主要な概念)
3. [EventBridgeの種類](#eventbridgeの種類)
4. [基本的な使い方](#基本的な使い方)
5. [実践例](#実践例)
6. [料金体系](#料金体系)
7. [よくある質問](#よくある質問)

## EventBridgeとは

AWS EventBridgeは、**イベント駆動型アーキテクチャ**を構築するためのマネージドサービスです。アプリケーションやサービス間でイベントを送受信し、異なるシステムを連携させることができます。

### 従来の問題点
- システム間の密結合
- 複雑な連携ロジック
- スケーラビリティの課題
- 障害時の影響範囲が大きい

### EventBridgeの解決策
- **疎結合**: システム間の依存関係を最小化
- **スケーラブル**: 大量のイベントを効率的に処理
- **柔軟性**: 動的なルーティングとフィルタリング
- **信頼性**: 高可用性と耐久性

## 主要な概念

### 1. イベント（Event）
```json
{
  "version": "0",
  "id": "12345678-1234-1234-1234-123456789012",
  "detail-type": "EC2 Instance State-change Notification",
  "source": "aws.ec2",
  "account": "123456789012",
  "time": "2023-01-01T00:00:00Z",
  "region": "ap-northeast-1",
  "detail": {
    "instance-id": "i-1234567890abcdef0",
    "state": "running"
  }
}
```

### 2. イベントバス（Event Bus）
- イベントの受信・配信を行う中央ハブ
- カスタムイベントバスとAWSイベントバスがある

### 3. ルール（Rule）
- イベントをフィルタリングし、ターゲットに送信する条件
- JSON形式で条件を指定

### 4. ターゲット（Target）
- イベントの送信先
- Lambda、SNS、SQS、HTTPエンドポイントなど

## EventBridgeの種類

### 1. Amazon EventBridge（デフォルト）
- AWSサービスからのイベント
- サードパーティサービス（SaaS）からのイベント
- カスタムアプリケーションからのイベント

### 2. Amazon EventBridge Schema Registry
- イベントスキーマの管理
- コード生成とバリデーション
- バージョン管理

### 3. Amazon EventBridge Pipes
- ストリーミングデータの処理
- リアルタイムイベント処理
- データ変換とフィルタリング

## 基本的な使い方

### 1. イベントバスの作成
```bash
# AWS CLI
aws events create-event-bus --name my-custom-bus
```

### 2. ルールの作成
```bash
# EC2インスタンス起動時のイベントをキャッチ
aws events put-rule \
  --name ec2-start-rule \
  --event-pattern '{
    "source": ["aws.ec2"],
    "detail-type": ["EC2 Instance State-change Notification"],
    "detail": {
      "state": ["running"]
    }
  }'
```

### 3. ターゲットの追加
```bash
# Lambda関数をターゲットに設定
aws events put-targets \
  --rule ec2-start-rule \
  --targets Id=1,Arn=arn:aws:lambda:ap-northeast-1:123456789012:function:my-function
```

### 4. イベントの送信
```python
import boto3

eventbridge = boto3.client('events')

# カスタムイベントの送信
response = eventbridge.put_events(
    Entries=[
        {
            'Source': 'my-application',
            'DetailType': 'User Registration',
            'Detail': '{"userId": "12345", "email": "user@example.com"}',
            'EventBusName': 'default'
        }
    ]
)
```

## 実践例

### 例1: EC2インスタンス監視システム
```yaml
# CloudFormationテンプレート例
Resources:
  EC2MonitorRule:
    Type: AWS::Events::Rule
    Properties:
      EventPattern:
        source:
          - aws.ec2
        detail-type:
          - EC2 Instance State-change Notification
        detail:
          state:
            - running
            - stopped
      Targets:
        - Arn: !GetAtt MonitorFunction.Arn
          Id: EC2MonitorTarget

  MonitorFunction:
    Type: AWS::Lambda::Function
    Properties:
      Runtime: python3.9
      Handler: index.handler
      Code:
        ZipFile: |
          import json
          def handler(event, context):
              print(f"EC2 instance state changed: {event}")
```

### 例2: マイクロサービス間通信
```python
# 注文処理システムの例
import boto3
import json

eventbridge = boto3.client('events')

def process_order(order_data):
    # 注文処理
    order_id = create_order(order_data)
    
    # イベント送信
    eventbridge.put_events(
        Entries=[
            {
                'Source': 'order-service',
                'DetailType': 'Order Created',
                'Detail': json.dumps({
                    'orderId': order_id,
                    'customerId': order_data['customerId'],
                    'amount': order_data['amount']
                })
            }
        ]
    )

def handle_payment_event(event):
    # 支払いイベントの処理
    order_id = event['detail']['orderId']
    update_order_status(order_id, 'paid')
```

### 例3: サーバーレスワークフロー
```python
# 画像処理パイプライン
def image_upload_handler(event):
    # 画像アップロード時の処理
    image_url = event['detail']['imageUrl']
    
    # 画像処理イベントを送信
    eventbridge.put_events(
        Entries=[
            {
                'Source': 'image-service',
                'DetailType': 'Image Uploaded',
                'Detail': json.dumps({
                    'imageUrl': image_url,
                    'userId': event['detail']['userId']
                })
            }
        ]
    )

def image_processing_handler(event):
    # 画像処理
    image_url = event['detail']['imageUrl']
    processed_url = process_image(image_url)
    
    # 処理完了イベントを送信
    eventbridge.put_events(
        Entries=[
            {
                'Source': 'image-service',
                'DetailType': 'Image Processed',
                'Detail': json.dumps({
                    'originalUrl': image_url,
                    'processedUrl': processed_url
                })
            }
        ]
    )
```

## 料金体系

### 基本料金（2024年1月時点）
- **イベント送信**: 100万イベントあたり$1.00
- **ルール評価**: 100万評価あたり$1.00
- **ターゲット送信**: 100万送信あたり$0.50

### 無料利用枠
- 月間100万イベント送信まで無料
- 月間100万ルール評価まで無料
- 月間100万ターゲット送信まで無料

### 料金計算例
```
月間イベント数: 500万
月間ルール評価: 500万
月間ターゲット送信: 500万

料金計算:
- イベント送信: (5M - 1M) × $1.00 = $4.00
- ルール評価: (5M - 1M) × $1.00 = $4.00
- ターゲット送信: (5M - 1M) × $0.50 = $2.00
合計: $10.00/月
```

## よくある質問

### Q1: EventBridgeとSNSの違いは？
**A:** 
- **EventBridge**: イベント駆動型、複雑なルーティング、フィルタリング
- **SNS**: 通知中心、シンプルな配信、トピックベース

### Q2: イベントの順序は保証されますか？
**A:** 基本的には順序保証されません。順序が重要な場合は、SQS FIFOキューを使用してください。

### Q3: イベントの重複は発生しますか？
**A:** 稀に発生する可能性があります。冪等性を考慮した設計が重要です。

### Q4: 大量のイベントを処理する際の注意点は？
**A:** 
- バッチ処理の活用
- 適切なスロットリング設定
- モニタリングとアラートの設定

### Q5: セキュリティはどう確保しますか？
**A:** 
- IAMロールによる適切な権限管理
- VPCエンドポイントの使用
- イベントの暗号化

## まとめ

AWS EventBridgeは、現代のクラウドアプリケーションにおいて重要な役割を果たすサービスです。イベント駆動型アーキテクチャを構築することで、以下のメリットが得られます：

- **疎結合**: システム間の依存関係を最小化
- **スケーラビリティ**: 大量のイベントを効率的に処理
- **柔軟性**: 動的なルーティングとフィルタリング
- **信頼性**: 高可用性と耐久性

まずは簡単な例から始めて、徐々に複雑なワークフローを構築していくことをお勧めします。
