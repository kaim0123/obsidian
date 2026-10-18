# curl / HTTPie - HTTPクライアント

## 概要

**curl**と**HTTPie**は、コマンドラインからHTTPリクエストを送信するためのツールです。REST APIの操作、ファイルのダウンロード、Webhookの送信など、Web通信に関わるあらゆる場面で使われます。

- **curl**: 1998年から開発されている万能HTTPクライアント。ほぼすべてのOSにプリインストール
- **HTTPie**: 人間に優しい構文とカラー出力を持つモダンなHTTPクライアント

---

## curl

### curlとは

**curl**（Client URL）は、URLを使ってデータを転送するコマンドラインツールです。HTTP、HTTPS、FTP、SFTP、SMTPなど多数のプロトコルに対応しています。

### インストール

ほとんどのOSにプリインストールされています:

```bash
# バージョン確認
curl --version

# macOS/Linux: プリインストール
# Windows: Windows 10以降はプリインストール
# Homebrew
brew install curl
```

### 基本的な使い方

#### GETリクエスト

```bash
# 基本的なGET
curl https://api.example.com/users

# レスポンスヘッダーも表示
curl -i https://api.example.com/users

# ヘッダーのみ表示
curl -I https://api.example.com/users

# 詳細な通信情報を表示
curl -v https://api.example.com/users

# サイレントモード（進捗表示を非表示）
curl -s https://api.example.com/users

# リダイレクトを自動追跡
curl -L https://example.com/redirect
```

#### POSTリクエスト

```bash
# フォームデータの送信
curl -X POST -d "name=Alice&age=25" https://api.example.com/users

# JSONデータの送信
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","age":25}' \
  https://api.example.com/users

# --json オプション（curl 7.82以降）
curl --json '{"name":"Alice","age":25}' https://api.example.com/users

# ファイルからJSONデータを読み込む
curl -X POST \
  -H "Content-Type: application/json" \
  -d @data.json \
  https://api.example.com/users
```

#### PUT / PATCH / DELETE

```bash
# PUT
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","age":30}' \
  https://api.example.com/users/1

# PATCH
curl -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"age":31}' \
  https://api.example.com/users/1

# DELETE
curl -X DELETE https://api.example.com/users/1
```

### よく使うオプション

| オプション | 説明 | 例 |
|-----------|------|-----|
| `-X` | HTTPメソッドを指定 | `-X POST` |
| `-H` | ヘッダーを追加 | `-H "Authorization: Bearer token"` |
| `-d` | リクエストボディ | `-d '{"key":"value"}'` |
| `--json` | JSON送信（Content-Type自動設定） | `--json '{"key":"value"}'` |
| `-F` | マルチパートフォーム（ファイルアップロード） | `-F "file=@photo.jpg"` |
| `-o` | 出力をファイルに保存 | `-o output.html` |
| `-O` | URLのファイル名で保存 | `-O` |
| `-L` | リダイレクトを追跡 | `-L` |
| `-v` | 詳細表示（デバッグ用） | `-v` |
| `-s` | サイレント（進捗非表示） | `-s` |
| `-k` | SSL証明書の検証をスキップ | `-k` |
| `-u` | Basic認証 | `-u user:password` |
| `-b` | Cookieを送信 | `-b "session=abc123"` |
| `-c` | Cookieをファイルに保存 | `-c cookies.txt` |
| `-w` | カスタム出力フォーマット | `-w "%{http_code}"` |
| `--connect-timeout` | 接続タイムアウト | `--connect-timeout 5` |
| `--max-time` | 最大実行時間 | `--max-time 30` |

### 認証

```bash
# Basic認証
curl -u username:password https://api.example.com/protected

# Bearer Token
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com/users

# APIキー（ヘッダーで送信）
curl -H "X-API-Key: YOUR_API_KEY" https://api.example.com/data
```

### ファイル操作

```bash
# ファイルのダウンロード
curl -O https://example.com/file.zip

# ファイル名を指定してダウンロード
curl -o myfile.zip https://example.com/file.zip

# ダウンロードの再開
curl -C - -O https://example.com/large-file.zip

# ファイルのアップロード
curl -X POST -F "file=@document.pdf" https://api.example.com/upload

# 複数ファイルのアップロード
curl -X POST \
  -F "file1=@photo1.jpg" \
  -F "file2=@photo2.jpg" \
  https://api.example.com/upload
```

### レスポンス情報の取得

```bash
# HTTPステータスコードだけ取得
curl -s -o /dev/null -w "%{http_code}" https://example.com

# レスポンス時間を計測
curl -s -o /dev/null -w "Total: %{time_total}s\n" https://example.com

# 詳細な時間情報
curl -s -o /dev/null -w "\
  DNS:        %{time_namelookup}s\n\
  Connect:    %{time_connect}s\n\
  TLS:        %{time_appconnect}s\n\
  Start:      %{time_starttransfer}s\n\
  Total:      %{time_total}s\n" https://example.com
```

### curlの設定ファイル（~/.curlrc）

```
# ~/.curlrc
--silent
--location
--connect-timeout 10
--max-time 30
```

---

## HTTPie

### HTTPieとは

**HTTPie**（エイチティーティーパイ）は、API操作に特化した**人間に優しい**HTTPクライアントです。直感的な構文、自動JSON整形、カラー出力が特徴です。

### インストール

```bash
# macOS（Homebrew）
brew install httpie

# Ubuntu / Debian
sudo apt install httpie

# pip
pip install httpie

# Windows
pip install httpie
# または
scoop install httpie
```

### 基本的な使い方

```bash
# GET（デフォルト）
http https://api.example.com/users

# POST（データを渡すと自動的にPOST）
http POST https://api.example.com/users name=Alice age:=25

# PUT
http PUT https://api.example.com/users/1 name=Bob

# DELETE
http DELETE https://api.example.com/users/1
```

### HTTPieの構文ルール

```bash
# 文字列パラメータ（= で指定）
http POST https://api.example.com/users name=Alice city=Tokyo
# → {"name": "Alice", "city": "Tokyo"}

# 数値・真偽値・null（:= で指定）
http POST https://api.example.com/users name=Alice age:=25 active:=true
# → {"name": "Alice", "age": 25, "active": true}

# ヘッダー（: で指定）
http https://api.example.com/users Authorization:"Bearer TOKEN"

# クエリパラメータ（== で指定）
http https://api.example.com/users page==2 limit==10
# → GET /users?page=2&limit=10

# ファイルからデータを読み込む
http POST https://api.example.com/users < data.json
```

### HTTPieの特徴

```bash
# 自動JSON整形 + カラー出力（デフォルト）
http https://api.example.com/users
# curlでは以下に相当:
# curl -s https://api.example.com/users | jq '.'

# レスポンスヘッダーとボディの両方を表示
http -v https://api.example.com/users

# ヘッダーのみ
http --headers https://api.example.com/users
# または
http -h https://api.example.com/users

# ボディのみ
http --body https://api.example.com/users
# または
http -b https://api.example.com/users

# ダウンロード
http --download https://example.com/file.zip
```

### 認証

```bash
# Basic認証
http -a user:password https://api.example.com/protected

# Bearer Token
http https://api.example.com/users "Authorization: Bearer TOKEN"
```

---

## curl と HTTPie の比較

### 構文の比較

```bash
# JSON POST
# curl:
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","age":25}' \
  https://api.example.com/users

# HTTPie:
http POST https://api.example.com/users name=Alice age:=25
```

```bash
# 認証付きGET
# curl:
curl -H "Authorization: Bearer TOKEN" https://api.example.com/users

# HTTPie:
http https://api.example.com/users "Authorization: Bearer TOKEN"
```

### 比較表

| 特徴 | curl | HTTPie |
|------|------|--------|
| 構文 | 複雑だが柔軟 | 直感的で簡潔 |
| JSON整形 | なし（jqが必要） | デフォルト |
| カラー出力 | なし | デフォルト |
| プロトコル | HTTP, FTP, SMTP等 多数 | HTTPのみ |
| 可搬性 | どこでもある | インストール必要 |
| スクリプト向き | 最適 | 可能だがcurlが主流 |
| 学習コスト | やや高い | 低い |
| セッション管理 | Cookieファイル手動 | 組み込みセッション |

### 使い分けの指針

- **対話的なAPI操作・デバッグ** → HTTPie（見やすい出力）
- **シェルスクリプト・自動化** → curl（可搬性が高い）
- **ファイルダウンロード** → curl（多機能）
- **素早いAPIテスト** → HTTPie（構文が簡潔）

---

## 実践的な使用例

### REST API操作

```bash
# curl + jq でAPIの応答を整形
curl -s https://api.github.com/users/octocat | jq '.name, .bio'

# HTTPieで同じことをする（整形は不要）
http https://api.github.com/users/octocat
```

### Webhookの送信

```bash
# Slack Webhookに通知
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"デプロイが完了しました"}' \
  https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Discord Webhook
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"content":"ビルドが成功しました"}' \
  https://discord.com/api/webhooks/YOUR/WEBHOOK
```

### API の死活監視

```bash
# ステータスコードをチェック
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.example.com/health)
if [ "$STATUS" -ne 200 ]; then
  echo "API is down! Status: $STATUS"
fi
```

### ファイルダウンロード

```bash
# 大きなファイルを進捗表示付きでダウンロード
curl -L -O --progress-bar https://example.com/large-file.tar.gz

# 複数ファイルを一括ダウンロード
curl -O https://example.com/file1.txt -O https://example.com/file2.txt
```

---

## まとめ

- **curl**はHTTP通信の万能ツール。あらゆる環境で使えるため、基本を押さえておくべき
- **HTTPie**はAPI操作に特化した使いやすいツール。対話的なAPI テストに最適
- APIの応答を見やすくするには `curl | jq` または HTTPie を使う
- シェルスクリプトや自動化にはcurl、手動でのAPI操作にはHTTPieがおすすめ
