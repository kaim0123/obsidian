## 前提
- AWS CLI v2 / Docker / SAM CLI
- `AWS_PROFILE` で環境切替（例: dev）

## 初期化
```bash
sam init --name my-sls --runtime python3.11 --app-template hello-world
cd my-sls
```

### 生成ディレクトリ例（Python）
```
my-sls/
  ├─ events/
  │   └─ event.json
  ├─ hello_world/
  │   ├─ app.py
  │   └─ requirements.txt
  ├─ tests/
  ├─ template.yaml
  └─ samconfig.toml (deploy 後に生成)
```

## ローカル実行
- API 全体: `sam local start-api`
- 単発実行: `sam local invoke HelloWorldFunction --event events/event.json`

例（Windows PowerShell）:
```powershell
sam build
sam local start-api --port 3000
# 別ターミナル
curl http://127.0.0.1:3000/hello
```

## デバッグ（例: Python）
1. Cursor でブレークポイント設定
2. `sam local invoke/start-api` に `--debug-port` を付与
3. デバッガを `localhost:<port>` にアタッチ

例:
```bash
sam build
sam local start-api --debug-port 5890
```
（Cursor 側は Python Attach で `localhost:5890` を指定）

## デプロイ
```bash
sam deploy --guided --profile dev
# 2回目以降
sam deploy --profile dev
```

## ベストプラクティス
- 環境変数は `.env`（ローカルのみ）/ 本番は Parameter Store/Secrets Manager
- `template.yaml` は論理名と権限（最小権限）を厳格化
- CI で `sam build` → `sam deploy`（変更セット/承認を組み込む）

## トラブルシューティング
- Docker が起動していない: `sam local` が失敗（起動/再起動）
- ポート競合: `--port`/`--debug-port` を変更
- 権限不足: IAM ロール/ポリシーを `template.yaml` で明示
- 依存解決: `sam build --use-container` を試す


