# just - モダンなコマンドランナー

## 概要

**just**は、プロジェクトでよく使うコマンドを保存・実行するための**コマンドランナー**です。Makeに触発されて開発されましたが、**ビルドシステムではなくコマンドランナー**として設計されているため、Makeの複雑な部分（ファイルの依存関係管理、タブ文字の制約など）を排除し、よりシンプルで直感的な使い方ができます。

### Makeとの主な違い

- **タブ文字が不要**: スペースでもOK
- **ファイルベースの依存関係なし**: ビルドツールではなくコマンドランナー
- **引数のサポート**: レシピに引数を渡すのが簡単
- **エラーメッセージが親切**: 問題箇所を明確に教えてくれる
- **クロスプラットフォーム**: Windows、macOS、Linuxで同じように動作

---

## インストール

```bash
# macOS（Homebrew）
brew install just

# Ubuntu / Debian（プリビルトバイナリ）
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin

# Arch Linux
pacman -S just

# Windows（Scoop）
scoop install just

# Windows（Chocolatey）
choco install just

# Cargo（Rust）
cargo install just

# npm
npx --yes @anthropic-ai/just  # もしくは npm install -g just-install
```

---

## justfileの基本構造

justのレシピは`justfile`（または`Justfile`）に記述します:

```justfile
# これはコメントです

# デフォルトのレシピ（引数なしで just を実行した時に表示）
default:
    @just --list

# シンプルなレシピ
hello:
    echo "Hello, World!"

# 複数のコマンド
build:
    echo "Building..."
    npm run build
    echo "Done!"
```

```bash
# レシピの実行
just hello
just build

# 利用可能なレシピの一覧
just --list
```

---

## レシピの定義と実行

### 基本的なレシピ

```justfile
# コメントがレシピの説明になる
# ビルドを実行する
build:
    npm run build

# テストを実行する
test:
    npm test

# 開発サーバーを起動する
dev:
    npm run dev

# クリーンアップ
clean:
    rm -rf dist/
    rm -rf node_modules/
```

### コマンドの表示を抑制

```justfile
# @ をつけるとコマンド自体は表示しない
hello:
    @echo "Hello!"

# レシピ全体で抑制する場合
@silent-recipe:
    echo "This command is not shown"
    echo "Neither is this one"
```

---

## 引数の受け取り

justの大きな利点の一つが、レシピに**引数を渡せる**ことです:

### 位置引数

```justfile
# 引数を受け取る
greet name:
    echo "Hello, {{name}}!"

# 複数の引数
deploy env target:
    echo "Deploying {{target}} to {{env}}"
```

```bash
just greet Alice          # → Hello, Alice!
just deploy staging api   # → Deploying api to staging
```

### デフォルト値

```justfile
# デフォルト値を設定
serve port="3000":
    echo "Starting server on port {{port}}"

build mode="development":
    echo "Building in {{mode}} mode"
```

```bash
just serve          # → Starting server on port 3000
just serve 8080     # → Starting server on port 8080
just build          # → Building in development mode
just build production  # → Building in production mode
```

### 可変長引数

```justfile
# +args で1つ以上の引数を受け取る
test +files:
    npm test {{files}}

# *args で0個以上の引数を受け取る
docker-run *args:
    docker run {{args}} myapp
```

```bash
just test src/test1.ts src/test2.ts
just docker-run -p 3000:3000 -e NODE_ENV=production
```

---

## 変数と式

### 設定変数

```justfile
# 変数の定義
project_name := "myapp"
version := "1.0.0"
build_dir := "dist"

build:
    echo "Building {{project_name}} v{{version}}"
    mkdir -p {{build_dir}}
```

### 環境変数

```justfile
# 環境変数を設定してコマンドを実行
build:
    NODE_ENV=production npm run build

# export で子プロセスに渡す
export DATABASE_URL := "postgres://localhost/mydb"

migrate:
    npx prisma migrate deploy

# 環境変数を参照
home := env_var("HOME")
user := env_var_or_default("USER", "unknown")

info:
    @echo "Home: {{home}}"
    @echo "User: {{user}}"
```

### バッククォート（コマンドの出力を変数に）

```justfile
# シェルコマンドの出力を変数に
git_hash := `git rev-parse --short HEAD`
date := `date +%Y%m%d`
branch := `git branch --show-current`

info:
    @echo "Commit: {{git_hash}}"
    @echo "Date: {{date}}"
    @echo "Branch: {{branch}}"

# タグ付きビルド
build:
    docker build -t myapp:{{git_hash}} .
```

---

## 条件分岐

```justfile
# if-else
greet name:
    @if [ "{{name}}" = "Alice" ]; then \
        echo "Hi Alice!"; \
    else \
        echo "Hello, {{name}}!"; \
    fi

# just の組み込み条件式
mode := if env_var_or_default("CI", "") != "" { "ci" } else { "local" }

test:
    @echo "Running in {{mode}} mode"
```

---

## OS依存のレシピ

```justfile
# OS ごとに異なるコマンドを定義
[linux]
open path:
    xdg-open {{path}}

[macos]
open path:
    open {{path}}

[windows]
open path:
    start {{path}}

# OS の検出
os := os()
arch := arch()

info:
    @echo "OS: {{os}}, Arch: {{arch}}"
```

---

## 依存関係の指定

```justfile
# build は install に依存
build: install
    npm run build

install:
    npm ci

# deploy は build と test に依存
deploy: build test
    rsync -av dist/ server:/var/www/

test:
    npm test

# 引数付き依存関係
deploy env: (build env)
    echo "Deploying to {{env}}"

build env:
    echo "Building for {{env}}"
```

---

## dotenv統合

```justfile
# .envファイルを自動的に読み込む
set dotenv-load

start:
    echo "Database: $DATABASE_URL"
    echo "Port: $PORT"
    npm start

# 特定の.envファイルを指定
set dotenv-filename := ".env.local"
```

---

## シェルの指定

```justfile
# デフォルトのシェルを変更
set shell := ["bash", "-uc"]

# Python でレシピを実行
calc:
    #!/usr/bin/env python3
    import math
    print(f"Pi = {math.pi}")

# Node.js でレシピを実行
generate:
    #!/usr/bin/env node
    const data = { name: "test", version: "1.0" };
    console.log(JSON.stringify(data, null, 2));

# PowerShell でレシピを実行
[windows]
info:
    #!powershell
    Get-Date
    Get-ComputerInfo | Select-Object CsName
```

---

## レシピの一覧表示

```bash
# 利用可能なレシピの一覧
just --list

# 出力例:
# Available recipes:
#     build          # ビルドを実行する
#     clean          # クリーンアップ
#     deploy env     # デプロイ
#     dev            # 開発サーバーを起動する
#     test           # テストを実行する
```

コメントがレシピの説明として表示されます:

```justfile
# ビルドを実行する
build:
    npm run build

# [private] で --list から非表示にする
[private]
_helper:
    echo "This is a helper"
```

---

## 実践的な使用例

### 開発ワークフロー

```justfile
set dotenv-load

default:
    @just --list

# 依存関係のインストール
install:
    npm ci

# 開発サーバーの起動
dev: install
    npm run dev

# ビルド
build: install
    npm run build

# テスト
test *args:
    npm test {{args}}

# リンター
lint:
    npm run lint

# フォーマット
format:
    npm run format

# すべてのチェック
check: lint test build

# Docker
docker-build tag=`git rev-parse --short HEAD`:
    docker build -t myapp:{{tag}} .

docker-run tag=`git rev-parse --short HEAD`:
    docker run -p 3000:3000 myapp:{{tag}}

# デプロイ
deploy env="staging":
    @echo "Deploying to {{env}}..."
    just build
    rsync -avz dist/ server:/var/www/{{env}}/

# データベース
db-migrate:
    npx prisma migrate deploy

db-seed:
    npx prisma db seed

db-reset:
    npx prisma migrate reset
```

---

## Makeとの比較表

| 特徴 | Make | just |
|------|------|------|
| 用途 | ビルドシステム + タスクランナー | コマンドランナー専用 |
| インデント | タブ必須 | スペースでもOK |
| ファイル名 | Makefile | justfile |
| 引数のサポート | 不便（変数として渡す） | 直接サポート |
| デフォルト値 | `?=` | `arg="default"` |
| .envの読み込み | 手動 | `set dotenv-load` |
| OS依存レシピ | 条件分岐で対応 | `[linux]` `[macos]` 等 |
| シェルの指定 | 限定的 | Python, Node等自由 |
| エラーメッセージ | 分かりにくい | 親切 |
| レシピ一覧 | 手動で`help`を作成 | `just --list` |
| プリインストール | ほぼすべてのUnix | インストール必要 |
| ファイル依存関係 | あり（本来の機能） | なし |

---

## まとめ

- **just**はMakeの「タスクランナー」としての側面だけを取り出し、モダンに再設計したツール
- **引数**、**デフォルト値**、**dotenv統合**がネイティブサポートされ、非常に使いやすい
- `just --list`で利用可能なレシピが一覧表示され、ドキュメントとしても機能
- タブ文字の制約がなく、エラーメッセージも親切で、初心者にも優しい
- ファイルの依存関係管理が必要な場合はMakeを、単純なコマンドランナーとして使うならjustを選ぶ
