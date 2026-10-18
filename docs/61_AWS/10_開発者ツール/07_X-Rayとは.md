# X-Rayとは

## 概要

AWS X-Rayは、分散アプリケーションの分析とデバッグのためのサービスです。アプリケーションのパフォーマンスを可視化し、ボトルネックやエラーの原因を特定できます。

## 主要機能

### 1. 分散トレーシング
- **リクエスト追跡**: リクエストの全体像を可視化
- **サービスマップ**: サービス間の依存関係を表示
- **トレース分析**: パフォーマンスボトルネックの特定

### 2. パフォーマンス分析
- **レイテンシ分析**: 応答時間の詳細分析
- **エラー率**: エラーの発生率と原因
- **スループット**: 処理能力の測定

### 3. 対応サービス
- **Lambda**: サーバーレス関数
- **EC2**: 仮想サーバー
- **ECS**: コンテナサービス
- **API Gateway**: API管理
- **SQS**: メッセージキュー

## 料金体系

### トレース分析
- **月100,000トレースまで無料**
- **超過分**: 100万トレースあたり$5.00

### データ取得
- **月100,000トレースまで無料**
- **超過分**: 100万トレースあたり$0.50

## 使用例

### 1. Lambda関数でのトレーシング
```javascript
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

exports.handler = async (event) => {
    const segment = AWSXRay.getSegment();
    
    // サブセグメントの作成
    const subsegment = segment.addNewSubsegment('database-query');
    
    try {
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        const result = await dynamodb.get({
            TableName: 'MyTable',
            Key: { id: event.id }
        }).promise();
        
        subsegment.close();
        return result.Item;
    } catch (error) {
        subsegment.addError(error);
        subsegment.close();
        throw error;
    }
};
```

### 2. カスタムアノテーション
```javascript
const AWSXRay = require('aws-xray-sdk-core');

exports.handler = async (event) => {
    const segment = AWSXRay.getSegment();
    
    // カスタムアノテーション
    segment.addAnnotation('userId', event.userId);
    segment.addAnnotation('operation', 'getUserProfile');
    
    // カスタムメタデータ
    segment.addMetadata('request', 'requestData', event);
    
    // 処理の実行
    const result = await processRequest(event);
    
    return result;
};
```

### 3. EC2でのX-Ray設定
```bash
# X-Rayデーモンのインストール
curl https://s3.dualstack.us-east-2.amazonaws.com/aws-xray-assets.us-east-2/xray-daemon/aws-xray-daemon-linux-3.x.zip -o aws-xray-daemon-linux-3.x.zip
unzip aws-xray-daemon-linux-3.x.zip

# デーモンの起動
sudo ./xray -c xray-daemon-config.yaml
```

## メリット

### 可視性の向上
- **全体像の把握**: 複雑なアーキテクチャの可視化
- **ボトルネック特定**: パフォーマンス問題の迅速な特定
- **依存関係の理解**: サービス間の関係の明確化

### デバッグの効率化
- **エラー追跡**: エラーの発生源と影響範囲の特定
- **パフォーマンス分析**: 詳細なパフォーマンスメトリクス

---

**注意**: このドキュメントは学習目的で作成されています。本番環境では、セキュリティ要件に応じて適切な設定を行ってください。
