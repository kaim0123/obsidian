# docker-compose基礎

## docker-composeとは
複数のコンテナを定義・管理するためのツールです。YAMLファイルで設定を記述します。

## docker-compose.ymlの基本構造

```yaml
version: '3.8'

services:
  # サービス1
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
    depends_on:
      - db

  # サービス2
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

## 主要な設定項目

### services
アプリケーションを構成するサービス（コンテナ）を定義

### build
Dockerfileからイメージをビルド
```yaml
build:
  context: .
  dockerfile: Dockerfile
```

### image
既存のイメージを使用
```yaml
image: nginx:latest
```

### ports
ポートマッピング
```yaml
ports:
  - "ホスト:コンテナ"
```

### environment
環境変数の設定
```yaml
environment:
  - KEY=value
```

### volumes
データの永続化
```yaml
volumes:
  - ホストのパス:コンテナのパス
```

### depends_on
起動順序の依存関係
```yaml
depends_on:
  - db
  - redis
```

## 基本コマンド

### コンテナの起動
```bash
docker-compose up
# バックグラウンド: docker-compose up -d
```

### コンテナの停止
```bash
docker-compose down
# ボリュームも削除: docker-compose down -v
```

### ログの確認
```bash
docker-compose logs
# 特定のサービス: docker-compose logs web
```

### コンテナ内でコマンド実行
```bash
docker-compose exec web bash
```

## 実用例: Web + DB構成

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```
