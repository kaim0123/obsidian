# known_hosts の扱い

## known_hosts とは

**known_hosts**は、SSH 接続時に使用される信頼できるホストの情報を保存するファイルです。初回接続時にホストの指紋（fingerprint）を保存し、以降の接続時にホストの同一性を検証するために使用されます。

## known_hosts ファイルの場所

### ユーザー別の known_hosts

```bash
# ユーザーのknown_hostsファイル
~/.ssh/known_hosts

# ファイルの確認
ls -la ~/.ssh/known_hosts
cat ~/.ssh/known_hosts
```

### システム全体の known_hosts

```bash
# システム全体のknown_hostsファイル
/etc/ssh/ssh_known_hosts

# ファイルの確認
ls -la /etc/ssh/ssh_known_hosts
cat /etc/ssh/ssh_known_hosts
```

## known_hosts ファイルの構造

### ファイルの形式

```
hostname,ip_address ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC...
hostname ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC...
```

### 各フィールドの説明

1. **hostname,ip_address**: ホスト名と IP アドレス
2. **ssh-rsa**: 暗号化アルゴリズム
3. **AAAAB3NzaC1yc2E...**: ホストの公開鍵

## SSH 接続時の動作

### 初回接続

```bash
# 初回接続時の表示
The authenticity of host '192.168.1.100 (192.168.1.100)' can't be established.
ECDSA key fingerprint is SHA256:AbCdEfGhIjKlMnOpQrStUvWxYz1234567890.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.1.100' (ECDSA) to the list of known hosts.
```

### 既知のホストへの接続

```bash
# 既知のホストへの接続
ssh user@192.168.1.100
# 警告なしで接続
```

## known_hosts の管理

### ホストの追加

#### 自動追加

```bash
# SSH接続時に自動的に追加
ssh user@hostname
# 初回接続時に「yes」を入力
```

#### 手動追加

```bash
# ssh-keyscanコマンドで追加
ssh-keyscan hostname >> ~/.ssh/known_hosts

# 特定のポートで追加
ssh-keyscan -p 2222 hostname >> ~/.ssh/known_hosts

# 複数のホストを追加
ssh-keyscan host1 host2 host3 >> ~/.ssh/known_hosts
```

### ホストの削除

#### 特定のホストを削除

```bash
# 特定のホストを削除
ssh-keygen -R hostname

# IPアドレスで削除
ssh-keygen -R 192.168.1.100

# 特定のポートのホストを削除
ssh-keygen -R [hostname]:2222
```

#### 手動で削除

```bash
# ファイルを編集して削除
nano ~/.ssh/known_hosts

# 特定の行を削除
sed -i '/hostname/d' ~/.ssh/known_hosts
```

### ホストの確認

#### 特定のホストの確認

```bash
# 特定のホストの情報を表示
ssh-keygen -l -f ~/.ssh/known_hosts | grep hostname

# ホストの指紋を確認
ssh-keygen -l -f ~/.ssh/known_hosts
```

#### ファイルの整合性確認

```bash
# known_hostsファイルの整合性を確認
ssh-keygen -l -f ~/.ssh/known_hosts

# 破損したエントリを確認
ssh-keygen -l -f ~/.ssh/known_hosts 2>&1 | grep -i error
```

## セキュリティの考慮事項

### ホストキーの検証

```bash
# ホストの指紋を確認
ssh-keyscan hostname | ssh-keygen -l -f -

# 手動で指紋を確認
ssh-keyscan -t rsa hostname
```

### 中間者攻撃の防止

```bash
# ホストキーの変更を検出
ssh user@hostname
# 警告が表示される場合
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
```

### セキュリティのベストプラクティス

1. **ホストキーの検証**: 初回接続時に指紋を確認
2. **定期的な監査**: known_hosts ファイルの定期的な確認
3. **不要なエントリの削除**: 使用しないホストの削除
4. **ファイルの権限**: 適切な権限設定

## 実用的な例

### バッチ処理でのホスト追加

```bash
#!/bin/bash
# 複数ホストのknown_hostsへの追加

hosts=(
    "server1.example.com"
    "server2.example.com"
    "server3.example.com"
)

for host in "${hosts[@]}"; do
    echo "Adding $host to known_hosts..."
    ssh-keyscan "$host" >> ~/.ssh/known_hosts
done

echo "All hosts added to known_hosts"
```

### ホストの一括削除

```bash
#!/bin/bash
# 特定のパターンのホストを削除

# 特定のドメインのホストを削除
sed -i '/\.example\.com/d' ~/.ssh/known_hosts

# 特定のIP範囲のホストを削除
sed -i '/192\.168\.1\./d' ~/.ssh/known_hosts
```

### ホストの監視

```bash
#!/bin/bash
# known_hostsファイルの監視

KNOWN_HOSTS_FILE="$HOME/.ssh/known_hosts"

if [ -f "$KNOWN_HOSTS_FILE" ]; then
    echo "known_hosts file exists"
    echo "Number of hosts: $(wc -l < "$KNOWN_HOSTS_FILE")"

    # 重複エントリを確認
    duplicates=$(sort "$KNOWN_HOSTS_FILE" | uniq -d)
    if [ -n "$duplicates" ]; then
        echo "Duplicate entries found:"
        echo "$duplicates"
    fi
else
    echo "known_hosts file does not exist"
fi
```

## トラブルシューティング

### 一般的な問題

#### ホストキーの変更エラー

```bash
# エラーメッセージ
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

# 解決方法
ssh-keygen -R hostname
ssh user@hostname
```

#### 接続の拒否

```bash
# エラーメッセージ
Host key verification failed.

# 解決方法
ssh-keygen -R hostname
ssh-keyscan hostname >> ~/.ssh/known_hosts
```

#### ファイルの権限問題

```bash
# エラーメッセージ
Bad permissions. Ignoring host key.

# 解決方法
chmod 600 ~/.ssh/known_hosts
chmod 700 ~/.ssh
```

### ログの確認

```bash
# SSH接続のログを確認
ssh -v user@hostname

# 詳細なログを確認
ssh -vvv user@hostname
```

## 設定ファイルの管理

### SSH 設定ファイル

```bash
# SSH設定ファイルの編集
nano ~/.ssh/config

# 設定の例
Host myserver
    HostName 192.168.1.100
    User myuser
    Port 22
    StrictHostKeyChecking yes
    UserKnownHostsFile ~/.ssh/known_hosts
```

### グローバル設定

```bash
# システム全体のSSH設定
sudo nano /etc/ssh/ssh_config

# 設定の例
StrictHostKeyChecking ask
UserKnownHostsFile /etc/ssh/ssh_known_hosts
```

## まとめ

known_hosts ファイルは、SSH 接続のセキュリティにおいて重要な役割を果たします。適切な管理により、中間者攻撃を防ぎ、安全な接続を維持できます。特に、ホストキーの検証、定期的な監査、不要なエントリの削除などの管理により、セキュアな SSH 接続が実現できます。トラブルシューティングと適切な設定により、効率的な SSH 接続管理が可能になります。
