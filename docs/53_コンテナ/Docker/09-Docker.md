# 09-Docker

## 概要
Dockerは、アプリケーションをコンテナとしてパッケージ化し、どこでも同じ環境で動作させることができる仮想化技術です。この章では、Dockerの基本、インストール、イメージ・コンテナ管理、Docker Compose、ネットワーク、ボリューム、セキュリティ、実践例について学習します。

## 目次
- [[03_Pythonアプリを本番で動かす|← Pythonアプリを本番で動かす（64章）]]
- [[MOC_サーバー・インフラ体系|← サーバー・インフラ目次]]
- [[10-Kubernetes|10-Kubernetes →]]

## Dockerとは

### 特徴
- **軽量な仮想化**: OSレベルの仮想化で高速起動
- **移植性**: どこでも同じ環境で動作
- **イメージ管理**: アプリケーションと依存関係をまとめて配布
- **スケーラビリティ**: マイクロサービスやCI/CDに最適

### アーキテクチャ
```
[Host OS]
  └─ [Docker Engine]
        ├─ [Container 1: Web]
        ├─ [Container 2: App]
        └─ [Container 3: DB]
```

## インストール

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \ \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

### Windows/Mac
- [公式サイト](https://www.docker.com/products/docker-desktop/)からDocker Desktopをダウンロード・インストール

### バージョン確認
```bash
docker --version
docker compose version
```

## 基本コマンド

### イメージ操作
```bash
# イメージ検索
docker search nginx
# イメージ取得
docker pull nginx:latest
# イメージ一覧
docker images
# イメージ削除
docker rmi nginx:latest
```

### コンテナ操作
```bash
# コンテナ起動
docker run -d --name webserver -p 8080:80 nginx:latest
# コンテナ一覧
docker ps -a
# コンテナ停止
docker stop webserver
# コンテナ再起動
docker restart webserver
# コンテナ削除
docker rm webserver
# ログ確認
docker logs webserver
# コンテナに入る
docker exec -it webserver /bin/bash
```

### Dockerfile
```dockerfile
# サンプルDockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### イメージビルド
```bash
docker build -t my-node-app:latest .
```

## Docker Compose

### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped
  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=mydb
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped
volumes:
  db_data:
```

### コマンド
```bash
docker compose up -d
docker compose down
docker compose ps
docker compose logs -f
docker compose exec app /bin/sh
```

## ネットワークとボリューム

### ネットワーク
```bash
# ネットワーク作成
docker network create my-network
# コンテナをネットワークに接続
docker run -d --name app --network my-network my-node-app
```

### ボリューム
```bash
# ボリューム作成
docker volume create my-volume
# ボリュームをマウント
docker run -d -v my-volume:/data my-node-app
```

## セキュリティ
- イメージは公式や信頼できるものを利用
- 不要なポートは開けない
- シークレット情報は環境変数やDocker Secretで管理
- rootユーザーでの実行を避ける
- イメージの脆弱性スキャン（`docker scan`）

## 実践例

### Node.js + MySQL
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db
    restart: unless-stopped
  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=mydb
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped
volumes:
  db_data:
```

### Flask + PostgreSQL
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/mydb
    depends_on:
      - db
    restart: unless-stopped
  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
volumes:
  postgres_data:
```

## 演習問題

### 初級
1. **DockerでNginxサーバーを起動してください**
2. **Dockerfileを作成してNode.jsアプリをコンテナ化してください**
3. **docker-composeでWeb+DB環境を構築してください**

### 中級
1. **独自ネットワークとボリュームを使って複数コンテナを連携させてください**
2. **環境変数やシークレットを安全に管理してください**
3. **イメージの脆弱性スキャンを実施してください**

### 上級
1. **マルチステージビルドで軽量なイメージを作成してください**
2. **本番運用向けのセキュリティ強化を施してください**
3. **CI/CDパイプラインで自動ビルド・デプロイを実装してください**

## まとめ

Dockerの基本を学びました：
- **コンテナ技術の概要**
- **イメージ・コンテナ管理**
- **Docker Composeによる複数サービス管理**
- **ネットワーク・ボリュームの活用**
- **セキュリティと実践例**

次の章では、Kubernetesについて学習します。

---

**次の章**: [[10-Kubernetes|10-Kubernetes →]] 