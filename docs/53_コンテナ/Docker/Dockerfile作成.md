# Dockerfile作成

## Dockerfileとは
Dockerイメージを作成するための設計書です。アプリケーションの実行に必要な環境を記述します。

## 基本的な構文

### FROM - ベースイメージの指定
```dockerfile
FROM node:18
# 公式のNode.js 18イメージをベースにする
```

### WORKDIR - 作業ディレクトリの設定
```dockerfile
WORKDIR /app
# 以降のコマンドは/app内で実行される
```

### COPY - ファイルのコピー
```dockerfile
COPY package*.json ./
COPY . .
# ホストのファイルをコンテナにコピー
```

### RUN - コマンドの実行
```dockerfile
RUN npm install
# イメージビルド時に実行される
```

### EXPOSE - ポートの公開
```dockerfile
EXPOSE 3000
# コンテナがリッスンするポートを宣言
```

### CMD - デフォルトコマンド
```dockerfile
CMD ["npm", "start"]
# コンテナ起動時に実行されるコマンド
```

## Node.jsアプリケーションの例

```dockerfile
# ベースイメージ
FROM node:18-alpine

# 作業ディレクトリ
WORKDIR /app

# 依存関係のコピーとインストール
COPY package*.json ./
RUN npm install

# アプリケーションのコピー
COPY . .

# ポート公開
EXPOSE 3000

# 起動コマンド
CMD ["npm", "start"]
```

## イメージのビルド
```bash
docker build -t my-app:1.0 .
```

## ベストプラクティス
- 軽量なベースイメージを使用（alpine など）
- レイヤーをキャッシュしやすい順序で記述
- .dockerignore で不要なファイルを除外
- マルチステージビルドで最終イメージを小さく
