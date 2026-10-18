# watch - コマンドの定期実行

## 概要

**watch**は、指定したコマンドを**一定間隔で繰り返し実行**し、出力をリアルタイムに画面に表示するツールです。ログの監視、ディスク容量のチェック、プロセスの監視など、状態の変化を追跡する場面で活躍します。

---

## インストール

```bash
# Linux: ほとんどのディストリビューションにプリインストール
# （procps または procps-ng パッケージに含まれる）

# macOS（Homebrew）
brew install watch

# Windows（Git Bash）
# watchは含まれていない。WSLを使うか、代替方法を参照

# Windows（Scoop で GNU watch をインストール）
scoop install watch
```

---

## 基本的な使い方

```bash
# 2秒ごとにコマンドを実行（デフォルト間隔）
watch date

# 出力例（画面がリアルタイムに更新される）:
# Every 2.0s: date                    hostname: Sat Jan 15 12:00:00 2024
#
# Sat Jan 15 12:00:02 2024

# 特定のコマンドを監視
watch "ls -la"

# パイプを含むコマンド（クォートで囲む）
watch "ps aux | grep nginx"

# 複数のコマンド
watch "echo '=== Disk ===' && df -h && echo '=== Memory ===' && free -h"
```

> **注意**: パイプ（`|`）やリダイレクション（`>`）を含むコマンドは、必ずクォートで囲みます。

---

## よく使うオプション

| オプション | 説明 | 例 |
|-----------|------|-----|
| `-n N` | 実行間隔をN秒に設定 | `watch -n 5 "df -h"` |
| `-d` | 前回の出力との差分をハイライト | `watch -d "ls -la"` |
| `-t` | ヘッダー（時刻表示）を非表示 | `watch -t date` |
| `-c` | カラー出力を保持 | `watch -c "ls --color"` |
| `-e` | コマンドがエラーの場合に停止 | `watch -e "curl -sf http://localhost"` |
| `-g` | 出力に変化があったら終了 | `watch -g "ls -la"` |
| `-x` | コマンドをexecで実行（シェルを経由しない） | `watch -x ls -la` |
| `-p` | 正確な間隔で実行（精密モード） | `watch -p -n 1 date` |

---

## 差分ハイライト（-d）

`-d`オプションを使うと、前回の出力から**変化した部分**がハイライト表示されます:

```bash
# ファイルの変更を監視（変化箇所がハイライト）
watch -d "ls -la"

# プロセスの変化を監視
watch -d "ps aux | head -20"

# メモリ使用量の変化を監視
watch -d free -h

# --differences=permanent で変化した箇所を永続的にハイライト
watch --differences=permanent "cat /proc/meminfo | head -5"
```

---

## エラー時の自動停止（-e）

コマンドの終了コードが0以外（エラー）の場合に停止します:

```bash
# サーバーのヘルスチェック（ダウンしたら停止）
watch -e "curl -sf http://localhost:3000/health"

# ビルドの状態チェック
watch -e "make check"
```

---

## 変化検知で停止（-g）

出力内容が前回と変わった時点で終了します:

```bash
# ファイルが作成されるのを待つ
watch -g "ls output/"

# ビルドの完了を待つ
watch -g "ls -la dist/bundle.js"

# 特定のプロセスが終了するのを待つ
watch -g "pgrep -c long-running-process"
```

---

## 実行間隔の設定（-n）

```bash
# 1秒ごとに実行
watch -n 1 date

# 0.5秒ごとに実行（0.1秒単位で指定可能）
watch -n 0.5 "cat /proc/loadavg"

# 10秒ごとに実行
watch -n 10 "df -h"

# 60秒（1分）ごとに実行
watch -n 60 "curl -s http://api.example.com/status"
```

---

## 実践的な使用例

### ログ監視

```bash
# ログファイルの末尾を監視
watch "tail -20 /var/log/app.log"

# エラーログのカウント
watch -d "grep -c ERROR /var/log/app.log"

# 最新のログエントリをリアルタイム表示
watch -n 1 "tail -5 /var/log/syslog"
```

> **注意**: ログのリアルタイム監視には `tail -f` の方が適している場合もあります。watchは定期的なスナップショットを表示するのに対し、`tail -f`はストリームとして新しい行を表示します。

### ディスク容量の監視

```bash
# ディスク使用量を監視
watch -d "df -h"

# 特定のディレクトリのサイズ変化を監視
watch -d "du -sh /var/log/*"

# inode使用率の監視
watch -n 30 "df -i"
```

### プロセス監視

```bash
# 特定のプロセスを監視
watch "ps aux | grep '[n]ginx'"

# プロセス数の変化を監視
watch -d "ps aux | wc -l"

# Dockerコンテナの状態を監視
watch "docker ps"

# Dockerコンテナのリソース使用量
watch "docker stats --no-stream"
```

### ネットワーク監視

```bash
# ネットワーク接続の監視
watch -d "ss -tuln"

# 特定ポートの接続数
watch -n 5 "ss -tuln | grep ':80' | wc -l"

# pingの監視
watch -n 1 "ping -c 1 -W 1 google.com 2>&1 | tail -2"
```

### Kubernetes Pod監視

```bash
# Podの状態を監視
watch "kubectl get pods"

# 特定のnamespaceのPodを監視
watch "kubectl get pods -n production"

# Podのリソース使用量
watch "kubectl top pods"

# デプロイメントの状態
watch "kubectl rollout status deployment/myapp"
```

### ビルド・テストの監視

```bash
# ビルド出力の監視
watch "ls -la dist/"

# テスト結果の監視
watch -e "npm test 2>&1 | tail -10"

# CI/CDのステータス確認
watch -n 30 "gh run list --limit 5"
```

### Git の監視

```bash
# Git status の監視（ファイル変更を追跡）
watch -d "git status -s"

# 最新のコミットを監視
watch "git log --oneline -5"

# リモートの変更を監視
watch -n 60 "git fetch --dry-run 2>&1"
```

---

## watchの代替手段

### whileループとの比較

```bash
# while ループでの代替
while true; do
  clear
  date
  echo "---"
  df -h
  sleep 5
done

# watch の方がシンプル
watch -n 5 "date && echo '---' && df -h"
```

| 特徴 | watch | while ループ |
|------|-------|-------------|
| 構文 | シンプル | やや複雑 |
| 差分ハイライト | `-d` | 不可（追加ツールが必要） |
| ヘッダー表示 | 自動 | 手動で実装 |
| 終了条件 | `-g`, `-e` | 条件文で実装 |
| 複雑な処理 | 限定的 | 柔軟 |

### tail -f との使い分け

| 用途 | 推奨ツール |
|------|-----------|
| ログのストリーム監視 | `tail -f` |
| コマンド出力のスナップショット | `watch` |
| ファイル変更のリアルタイム追跡 | `tail -f` |
| 定期的な状態確認 | `watch` |

---

## Windows環境での代替方法

Windows（WSLなし）では`watch`コマンドがないため、以下の方法で代替します:

### PowerShell

```powershell
# PowerShellでの代替
while ($true) {
    Clear-Host
    Get-Date
    Get-Process | Sort-Object CPU -Descending | Select-Object -First 10
    Start-Sleep -Seconds 2
}
```

### Git Bash

```bash
# while ループで代替
while true; do clear; date; echo "---"; ls -la; sleep 2; done
```

### WSL

```bash
# WSL内ではwatchが使える
wsl watch "ls -la"
```

---

## まとめ

- **watch**はコマンドを定期実行してリアルタイムに出力を表示するシンプルなツール
- `-d`（差分ハイライト）が最も便利な機能。変化を視覚的に追跡できる
- `-n`で実行間隔、`-e`でエラー時停止、`-g`で変化検知停止を制御
- ディスク容量、プロセス、ネットワーク、Kubernetes Podの監視に日常的に使える
- ログのストリーム監視には`tail -f`、定期的なスナップショットには`watch`を使い分ける
