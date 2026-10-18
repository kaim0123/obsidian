# rsync - 高効率ファイル同期ツール

## 概要

**rsync**（Remote Sync）は、ファイルやディレクトリを**効率的に同期・コピー**するためのツールです。ローカル間のコピーはもちろん、ネットワーク越しのリモートサーバーとの同期にも使えます。

### rsyncの特徴

- **差分転送**: 変更された部分だけを転送するため、大量のファイルでも高速
- **ローカル・リモート両対応**: ローカルコピーもSSH経由のリモート同期も同じコマンドで
- **多彩なオプション**: 除外パターン、ドライラン、圧縮転送など
- **バックアップに最適**: 増分バックアップの仕組みを内蔵
- **権限・タイムスタンプの保持**: ファイルの属性を正確にコピー

---

## インストール

```bash
# macOS（プリインストール）
# Homebrewで最新版にアップデート可能
brew install rsync

# Ubuntu / Debian
sudo apt install rsync

# Windows
# WSL内で使用するか、cwRsyncを使用
# Scoop
scoop install rsync
```

---

## 基本的な使い方

### ローカルコピー

```bash
# ディレクトリをコピー
rsync -av src/ dest/

# ファイルをコピー
rsync -av file.txt /backup/

# 進捗表示付き
rsync -avP src/ dest/
```

### リモートとの同期

```bash
# ローカル → リモート（アップロード）
rsync -avz src/ user@remote:/path/to/dest/

# リモート → ローカル（ダウンロード）
rsync -avz user@remote:/path/to/src/ dest/

# SSHのポートを指定
rsync -avz -e 'ssh -p 2222' src/ user@remote:/path/to/dest/
```

---

## よく使うオプション

### 基本オプション

| オプション | 説明 |
|-----------|------|
| `-a` / `--archive` | アーカイブモード（`-rlptgoD`と同等。再帰的にコピーし、属性を保持） |
| `-v` / `--verbose` | 詳細な出力 |
| `-z` / `--compress` | 転送時にデータを圧縮（リモート同期時に有効） |
| `-P` | `--progress --partial` の短縮形。進捗表示＋中断時の部分ファイル保持 |
| `--progress` | 転送の進捗を表示 |
| `-h` / `--human-readable` | サイズを人間に読みやすく表示 |
| `-r` / `--recursive` | 再帰的にディレクトリをコピー（-aに含まれる） |

### 同期の制御

| オプション | 説明 |
|-----------|------|
| `--delete` | 送信元にないファイルを送信先から削除（ミラーリング） |
| `--delete-after` | 転送完了後に削除 |
| `-n` / `--dry-run` | 実際にはコピーせず、何が起きるかを表示 |
| `--update` / `-u` | 送信先に新しいファイルがある場合はスキップ |
| `--existing` | 送信先に既に存在するファイルのみ更新 |
| `--ignore-existing` | 送信先に既に存在するファイルをスキップ |

### ファイルの選択

| オプション | 説明 | 例 |
|-----------|------|-----|
| `--exclude` | パターンに合うファイルを除外 | `--exclude='*.log'` |
| `--include` | パターンに合うファイルを含める | `--include='*.py'` |
| `--exclude-from` | 除外パターンをファイルから読み込む | `--exclude-from=.rsyncignore` |
| `--filter` / `-f` | フィルタルール | `-f '- *.log'` |
| `--max-size` | 指定サイズ以上のファイルをスキップ | `--max-size=10M` |
| `--min-size` | 指定サイズ以下のファイルをスキップ | `--min-size=1K` |

### その他

| オプション | 説明 |
|-----------|------|
| `-e` | リモートシェルを指定 |
| `--backup` / `-b` | 上書き前にバックアップを作成 |
| `--backup-dir` | バックアップの保存先 |
| `--link-dest` | ハードリンクによる増分バックアップの参照先 |
| `-c` / `--checksum` | サイズと日時ではなくチェックサムで比較 |
| `--chmod` | 転送先のパーミッションを変更 |

---

## 末尾スラッシュの挙動（重要）

rsyncでは**ソースパスの末尾にスラッシュがあるかないか**で挙動が大きく変わります。これは初心者がよくハマるポイントです:

### スラッシュあり: `src/`

ディレクトリの**中身**をコピーします:

```bash
rsync -av src/ dest/
# src/ の中身が dest/ 直下にコピーされる
# src/file.txt → dest/file.txt
```

### スラッシュなし: `src`

ディレクトリ**自体**をコピーします:

```bash
rsync -av src dest/
# src ディレクトリ自体が dest/ 配下にコピーされる
# src/file.txt → dest/src/file.txt
```

### 図で理解する

```
# スラッシュあり: rsync -av src/ dest/
src/                    dest/
├── file1.txt    →     ├── file1.txt
├── file2.txt    →     ├── file2.txt
└── subdir/      →     └── subdir/

# スラッシュなし: rsync -av src dest/
src/                    dest/
├── file1.txt    →     └── src/
├── file2.txt                ├── file1.txt
└── subdir/                  ├── file2.txt
                             └── subdir/
```

> **ルール**: 送信元の末尾に `/` をつけると中身だけ、つけないとディレクトリごとコピー。

---

## ドライラン（--dry-run）

実行前に必ずドライランで確認することをお勧めします:

```bash
# 何がコピーされるかを確認（実際にはコピーしない）
rsync -avnP src/ dest/

# --deleteを使う前に特に重要
rsync -avn --delete src/ dest/
```

---

## cp / scp との比較

| 特徴 | cp | scp | rsync |
|------|----|----|-------|
| ローカルコピー | 最適 | 不可 | 可能 |
| リモートコピー | 不可 | 可能 | 可能 |
| 差分転送 | なし | なし | あり |
| 進捗表示 | なし | あり | `-P` |
| 再開機能 | なし | なし | `--partial` |
| 除外パターン | なし | なし | `--exclude` |
| 属性保持 | `-p` | `-p` | `-a` |
| 圧縮転送 | なし | `-C` | `-z` |
| ミラーリング | 不可 | 不可 | `--delete` |

---

## バックアップ戦略

### シンプルなミラーバックアップ

```bash
# 送信元と完全に同じ状態にする
rsync -avP --delete /home/user/ /backup/home/
```

### 増分バックアップ（--link-dest）

ハードリンクを使って、変更されたファイルだけを実際にコピーし、変更のないファイルは前回のバックアップへのハードリンクにする効率的な方法:

```bash
#!/bin/bash
# 増分バックアップスクリプト
DATE=$(date +%Y-%m-%d_%H%M%S)
BACKUP_DIR="/backup"
LATEST_LINK="$BACKUP_DIR/latest"
SOURCE="/home/user/"

rsync -av --delete \
  --link-dest="$LATEST_LINK" \
  "$SOURCE" "$BACKUP_DIR/$DATE/"

# latestリンクを更新
ln -snf "$BACKUP_DIR/$DATE" "$LATEST_LINK"
```

### 除外パターンファイルの活用

`.rsyncignore` ファイル:

```
node_modules/
.git/
*.log
*.tmp
.cache/
dist/
__pycache__/
.env
```

```bash
rsync -av --exclude-from='.rsyncignore' src/ dest/
```

---

## 実践的な使用例

### デプロイ

```bash
# Webサイトのデプロイ
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env' \
  ./dist/ user@server:/var/www/html/

# ドライランで確認してからデプロイ
rsync -avzn --delete ./dist/ user@server:/var/www/html/
```

### プロジェクトのバックアップ

```bash
# プロジェクトをバックアップ（不要ファイルを除外）
rsync -av \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='__pycache__' \
  ~/projects/ /backup/projects/
```

### サーバー間の同期

```bash
# サーバーAからサーバーBにデータを同期
rsync -avz -e ssh user@serverA:/data/ user@serverB:/data/

# 帯域制限付き（1MB/s）
rsync -avz --bwlimit=1000 src/ user@remote:/dest/
```

---

## 注意点とトラブルシューティング

### よくある間違い

1. **末尾スラッシュの忘れ**: 意図しないディレクトリ構造になる
2. **--deleteの不用意な使用**: 送信先のファイルが消える。必ずドライランで確認
3. **権限の問題**: `-a`を使っても、rootでないと一部の属性は保持できない

### パフォーマンスの改善

```bash
# 大量の小さいファイルの場合
rsync -av --info=progress2 src/ dest/  # ファイル単位ではなく全体の進捗を表示

# チェックサムベースの比較（正確だが遅い）
rsync -avc src/ dest/
```

---

## まとめ

- **rsync**はファイル同期の定番ツールで、差分転送により効率的にコピーできる
- `-av`（アーカイブモード + 詳細表示）が基本の組み合わせ
- **末尾スラッシュの有無**で挙動が変わることに注意
- `--delete`を使う前は必ず`-n`（ドライラン）で確認
- バックアップ、デプロイ、サーバー間同期など、用途は幅広い
