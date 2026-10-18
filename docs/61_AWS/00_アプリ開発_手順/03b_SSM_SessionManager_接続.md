## なぜSSMか
- 鍵管理不要・踏み台不要・CloudTrailで監査容易

## 前提
- EC2 に IAM ロール `AmazonSSMManagedInstanceCore`
- エンドポイントにインターネット/または VPC エンドポイント

## シェル接続
```bash
aws ssm start-session --target <instance-id> --profile dev
```

## ポートフォワード（例: SSH 22 をローカルへ）
```bash
aws ssm start-session \
  --target <instance-id> \
  --document-name AWS-StartPortForwardingSession \
  --parameters '{"portNumber":["22"],"localPortNumber":["2222"]}' \
  --profile dev
```

## Cursor/VS Code の接続
1. 上記で `localhost:2222` にトンネル作成
2. SSH 設定でホストを `localhost` ポート `2222` に
3. リモート開発拡張で接続しワークスペースを開く


