# Dockerの基本コマンド

## イメージ関連

### イメージの取得
```bash
docker pull <イメージ名>:<タグ>
# 例: docker pull nginx:latest
```

### イメージ一覧の表示
```bash
docker images
```

### イメージの削除
```bash
docker rmi <イメージID>
```

## コンテナ関連

### コンテナの起動
```bash
docker run <イメージ名>
# バックグラウンド実行: docker run -d <イメージ名>
# ポート公開: docker run -p 8080:80 <イメージ名>
```

### 実行中のコンテナ一覧
```bash
docker ps
# 停止中も含める: docker ps -a
```

### コンテナの停止
```bash
docker stop <コンテナID>
```

### コンテナの削除
```bash
docker rm <コンテナID>
```

### コンテナ内でコマンド実行
```bash
docker exec -it <コンテナID> /bin/bash
```

## その他の便利なコマンド

### ログの確認
```bash
docker logs <コンテナID>
```

### 全てのコンテナを停止
```bash
docker stop $(docker ps -q)
```

### 未使用リソースの削除
```bash
docker system prune
```
