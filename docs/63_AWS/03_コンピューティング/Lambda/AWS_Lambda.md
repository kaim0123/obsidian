# AWS Lambda 初心者向け解説

## 目次
1. [AWS Lambdaとは](#aws-lambdaとは)
2. [サーバーレスとは](#サーバーレスとは)
3. [Lambdaの特徴とメリット](#lambdaの特徴とメリット)
4. [Lambdaの基本的な仕組み](#lambdaの基本的な仕組み)
5. [対応言語とランタイム](#対応言語とランタイム)
6. [Lambda関数の作成方法](#lambda関数の作成方法)
7. [トリガーとイベント](#トリガーとイベント)
8. [料金体系](#料金体系)
9. [実際の使用例](#実際の使用例)
10. [ベストプラクティス](#ベストプラクティス)
11. [制限事項と注意点](#制限事項と注意点)

## AWS Lambdaとは

AWS Lambdaは、**サーバーレスコンピューティングサービス**です。従来のサーバー管理が不要で、コードをアップロードするだけで実行環境が自動的に提供されます。

### 従来のサーバー vs Lambda

**従来のサーバー:**
- サーバーの起動・停止・管理が必要
- 常時稼働でコストが発生
- スケーリングの設定が必要
- メンテナンスが必要

**Lambda:**
- サーバー管理不要
- 実行時のみ課金
- 自動スケーリング
- メンテナンス不要

## サーバーレスとは

サーバーレス（Serverless）は、**サーバーの存在を意識せずにアプリケーションを開発・実行できる**アーキテクチャです。

### サーバーレスの特徴
- **イベント駆動**: 特定のイベントが発生した時のみ実行
- **自動スケーリング**: 負荷に応じて自動的にスケール
- **従量課金**: 実際の実行時間とリソース使用量に応じて課金
- **運用負荷軽減**: インフラ管理が不要

## Lambdaの特徴とメリット

### 主な特徴
1. **イベント駆動実行**
   - API GatewayからのHTTPリクエスト
   - S3バケットへのファイルアップロード
   - DynamoDBのデータ変更
   - CloudWatch Events（スケジュール実行）

2. **自動スケーリング**
   - 同時実行数の自動調整
   - 最大1000並行実行（デフォルト）
   - リクエスト数に応じた自動拡張

3. **従量課金**
   - 実行時間とメモリ使用量に基づく課金
   - 実行しない時は課金なし
   - 従来のサーバーよりコスト効率が良い

### メリット
- **運用コスト削減**: サーバー管理が不要
- **開発効率向上**: インフラに集中せずビジネスロジックに集中
- **スケーラビリティ**: 自動的な負荷分散
- **コスト最適化**: 使用した分だけの課金

## Lambdaの基本的な仕組み

### 実行フロー
1. **イベント発生**: トリガーとなるイベントが発生
2. **関数実行**: Lambda関数が自動的に起動
3. **コード実行**: アップロードしたコードが実行
4. **結果返却**: 実行結果を返却
5. **終了**: 実行完了後、自動的に終了

### 実行環境
- **コンテナ**: 各実行は独立したコンテナで実行
- **一時的**: 実行後はコンテナが破棄される
- **ステートレス**: 実行間で状態は保持されない

## 対応言語とランタイム

### 公式サポート言語
- **Node.js** (JavaScript/TypeScript)
- **Python**
- **Java**
- **C#** (.NET)
- **Go**
- **Ruby**
- **PowerShell**

### ランタイムバージョン
```
Node.js: 18.x, 20.x
Python: 3.9, 3.10, 3.11
Java: 11, 17, 21
C#: .NET 6, .NET 8
Go: 1.x
```

## Lambda関数の作成方法

### 1. AWS Management Console
1. Lambdaサービスにアクセス
2. 「関数の作成」をクリック
3. 関数名、ランタイム、実行ロールを設定
4. コードを記述またはアップロード

### 2. AWS CLI
```bash
# 関数作成
aws lambda create-function \
  --function-name my-function \
  --runtime nodejs18.x \
  --role arn:aws:iam::123456789012:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip
```

### 3. Infrastructure as Code
- **AWS CDK**
- **Terraform**
- **Serverless Framework**
- **SAM (Serverless Application Model)**

## トリガーとイベント

### 主要なトリガー
1. **API Gateway**: HTTPリクエスト
2. **S3**: オブジェクトの作成・削除
3. **DynamoDB**: テーブルの変更
4. **CloudWatch Events**: スケジュール実行
5. **SNS**: メッセージ配信
6. **SQS**: キューからのメッセージ処理
7. **Cognito**: ユーザー認証イベント

### イベント構造の例
```json
// API Gateway イベント
{
  "httpMethod": "GET",
  "path": "/users",
  "queryStringParameters": {
    "id": "123"
  },
  "body": null
}

// S3 イベント
{
  "Records": [
    {
      "s3": {
        "bucket": {
          "name": "my-bucket"
        },
        "object": {
          "key": "uploaded-file.jpg"
        }
      }
    }
  ]
}
```

## 料金体系

### 課金項目
1. **リクエスト数**: 関数の実行回数
2. **実行時間**: 実際の実行時間（ミリ秒単位）
3. **メモリ使用量**: 割り当てたメモリ量

### 料金例（東京リージョン）
- **リクエスト**: 100万リクエストあたり $0.20
- **実行時間**: GB-秒あたり $0.0000166667
- **無料利用枠**: 月100万リクエスト、40万GB-秒

### コスト計算例
```
実行時間: 100ms
メモリ: 128MB
月間実行: 10,000回

計算:
- リクエスト料金: 10,000 × $0.20/1,000,000 = $0.002
- 実行時間料金: 10,000 × 0.1秒 × 0.128GB × $0.0000166667 = $0.0021
- 合計: 約$0.004
```

## 実際の使用例

### 1. API サーバー
```javascript
// Node.js でのAPI実装例
exports.handler = async (event) => {
    const { httpMethod, path, queryStringParameters } = event;
    
    if (httpMethod === 'GET' && path === '/users') {
        // ユーザー一覧取得
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                users: [
                    { id: 1, name: '田中太郎' },
                    { id: 2, name: '佐藤花子' }
                ]
            })
        };
    }
    
    return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Not Found' })
    };
};
```

### 2. 画像リサイズ処理
```python
# Python での画像処理例
import boto3
from PIL import Image
import io

def lambda_handler(event, context):
    s3 = boto3.client('s3')
    
    # S3から画像を取得
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    response = s3.get_object(Bucket=bucket, Key=key)
    image_data = response['Body'].read()
    
    # 画像をリサイズ
    image = Image.open(io.BytesIO(image_data))
    resized = image.resize((300, 300))
    
    # リサイズした画像をS3に保存
    output_buffer = io.BytesIO()
    resized.save(output_buffer, format='JPEG')
    output_buffer.seek(0)
    
    s3.put_object(
        Bucket=bucket,
        Key=f'resized/{key}',
        Body=output_buffer.getvalue()
    )
    
    return {'statusCode': 200}
```

### 3. スケジュール実行
```python
# 定期実行の例（毎日午前9時に実行）
import boto3
from datetime import datetime

def lambda_handler(event, context):
    # 日次レポート生成
    report_data = generate_daily_report()
    
    # SNSで通知
    sns = boto3.client('sns')
    sns.publish(
        TopicArn='arn:aws:sns:region:account:topic',
        Message=f'日次レポート: {report_data}',
        Subject='Daily Report'
    )
    
    return {'statusCode': 200}
```

## ベストプラクティス

### 1. パフォーマンス最適化
- **適切なメモリ割り当て**: 必要最小限のメモリを設定
- **コールドスタート対策**: 初期化処理を最小限に
- **接続プール**: データベース接続の再利用

### 2. エラーハンドリング
```javascript
exports.handler = async (event) => {
    try {
        // メイン処理
        const result = await processData(event);
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal Server Error'
            })
        };
    }
};
```

### 3. セキュリティ
- **IAMロール**: 最小権限の原則
- **環境変数**: 機密情報の管理
- **VPC**: 必要に応じてプライベートネットワーク使用

### 4. モニタリング
- **CloudWatch Logs**: ログの確認
- **CloudWatch Metrics**: メトリクス監視
- **X-Ray**: 分散トレーシング

## 制限事項と注意点

### 実行制限
- **最大実行時間**: 15分（900秒）
- **メモリ**: 最大10GB
- **一時ディスク**: 最大10GB（/tmp）
- **同時実行数**: デフォルト1000（調整可能）

### 15分を超える処理・待ち時間の長い処理
- LLM の呼び出しのように **返事を待つだけの時間も課金** される
- API Gateway 経由の同期呼び出しは、原則 29 秒で切れる
- 対策：SQS で非同期にする、**Lambda durable functions**（ステップごとに保存しながら最長 1 年、待ち時間は課金なし）、Step Functions で分割する
- 詳しくは [[20_LLMの長時間処理を非同期で動かす]]

### コールドスタート
- **初回実行**: 実行環境の初期化で遅延
- **対策**: プロビジョンド同時実行の使用
- **影響**: レスポンス時間の増加

### ステートレス設計
- **状態保持不可**: 実行間でデータは保持されない
- **外部ストレージ**: データベースやS3の活用
- **セッション管理**: 外部サービスでの管理

### デバッグの注意点
- **ローカル環境**: 本番環境との差異
- **ログ確認**: CloudWatch Logsでの確認
- **テスト**: 単体テストと統合テストの実施

## まとめ

AWS Lambdaは、サーバーレスアーキテクチャの代表的なサービスです。サーバー管理が不要で、イベント駆動の処理に最適化されています。

### 適している用途
- API サーバー
- データ処理
- ファイル変換
- スケジュール実行
- イベント処理

### 学習のポイント
1. **イベント駆動**: トリガーとイベントの理解
2. **ステートレス**: 状態管理の方法
3. **エラーハンドリング**: 堅牢なアプリケーションの構築
4. **モニタリング**: 運用の可視化

Lambdaを活用することで、インフラ管理の負荷を軽減し、ビジネスロジックの開発に集中できるようになります。
