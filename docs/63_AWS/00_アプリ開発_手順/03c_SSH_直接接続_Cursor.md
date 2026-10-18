## 前提（最小化の原則）
- 可能な限りSSM優先。直接SSHは例外的運用に限定
- セキュリティグループは特定固定IPのみ許可
- キーペアの秘密鍵は安全に保管（権限600）

## EC2 側
- パブリックIP（または Elastic IP）
- 22/tcp を固定送信元IPのみに制限

## ローカル設定（Windows/Powershell）
```powershell
mkdir ~\.ssh -Force
notepad ~\.ssh\config
```

`~/.ssh/config` 例:
```
Host my-ec2
  HostName <ec2-public-ip>
  User ec2-user
  IdentityFile C:\\Users\\<you>\\.ssh\\my-ec2.pem
  IdentitiesOnly yes
```

## Cursor での接続
1. Cursor の Remote SSH から `my-ec2` を選択
2. 初回は known_hosts 登録を確認
3. 接続後、ワークスペースとして `/home/ec2-user/<project>` を開く


