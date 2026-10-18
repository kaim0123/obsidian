# Cloud9とは

## 概要

AWS Cloud9は、ブラウザベースのクラウドIDE（統合開発環境）です。サーバーレスの環境でコードの記述、実行、デバッグが可能で、AWSリソースとの統合も簡単に行えます。

## 主要機能

### 1. ブラウザベースIDE
- **どこからでもアクセス**: ブラウザがあればどこからでも開発可能
- **マルチユーザー**: 複数人での同時編集
- **リアルタイム協業**: 他の開発者とのリアルタイム協業

### 2. 事前設定済み環境
- **40以上の言語サポート**: Java、Python、PHP、Ruby、Go等
- **AWS CLI**: 事前インストール済み
- **Docker**: コンテナ開発に対応

### 3. AWS統合
- **IAMロール**: EC2インスタンスの権限を継承
- **Lambda関数**: サーバーレス開発
- **ECS**: コンテナ開発

## 料金体系

### EC2ベース環境
- **EC2インスタンス料金**: t2.microで月約$8.50
- **EBSストレージ**: 月10GBまで無料

### サーバーレス環境
- **月500分まで無料**
- **超過分**: 分あたり$0.0024

## 使用例

### 1. 環境の作成
```bash
# AWS CLIでCloud9環境を作成
aws cloud9 create-environment-ec2 \
  --name "MyDevelopmentEnvironment" \
  --description "開発用Cloud9環境" \
  --instance-type "t2.micro" \
  --automatic-stop-time-minutes 30
```

### 2. Lambda関数の開発
```javascript
// Lambda関数のサンプル
exports.handler = async (event) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Hello from Lambda!',
            input: event,
        }),
    };
    return response;
};
```

### 3. Docker開発
```dockerfile
# Dockerfileの例
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## メリット

### 開発効率の向上
- **環境構築不要**: 即座に開発開始
- **AWS統合**: AWSサービスとのシームレスな連携
- **協業機能**: チーム開発の効率化

### コスト効率
- **自動停止**: 非使用時の自動停止
- **従量課金**: 使用した分だけの料金

---

**注意**: このドキュメントは学習目的で作成されています。本番環境では、セキュリティ要件に応じて適切な設定を行ってください。
