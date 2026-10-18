# Task（go-task） - YAMLベースのタスクランナー

## 概要

**Task**（go-task）は、**YAML形式**でタスクを定義するモダンなタスクランナーです。Makeの代替として設計されており、YAMLの読みやすさとGoの高速なバイナリを組み合わせています。

### Taskの特徴

- **YAML形式**: 設定ファイル（Taskfile.yml）がYAMLで書かれているため、読みやすく書きやすい
- **クロスプラットフォーム**: Windows、macOS、Linuxで同じTaskfileが動作
- **依存関係**: タスク間の依存関係を簡単に定義
- **変更検知**: ソースファイルの変更を検知して必要な部分だけ実行
- **インクルード**: 複数のTaskfileを分割して管理
- **シングルバイナリ**: Go製のシングルバイナリで、依存関係なし

---

## インストール

```bash
# macOS（Homebrew）
brew install go-task

# Ubuntu / Debian（snap）
sudo snap install task --classic

# Arch Linux
pacman -S go-task

# Windows（Scoop）
scoop install task

# Windows（Chocolatey）
choco install go-task

# npm
npm install -g @go-task/cli

# Go
go install github.com/go-task/task/v3/cmd/task@latest

# スクリプトでインストール
sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin
```

```bash
# バージョン確認
task --version
```

---

## Taskfileの基本構造

Taskfileは`Taskfile.yml`（または`Taskfile.yaml`）に記述します:

```yaml
version: '3'

tasks:
  hello:
    desc: Hello Worldを表示する
    cmds:
      - echo "Hello, World!"

  build:
    desc: プロジェクトをビルドする
    cmds:
      - echo "Building..."
      - npm run build

  test:
    desc: テストを実行する
    cmds:
      - npm test
```

```bash
# タスクの実行
task hello
task build

# タスク一覧の表示
task --list
# または
task -l
```

---

## タスクの定義

### 基本的なタスク

```yaml
version: '3'

tasks:
  greet:
    desc: 挨拶を表示する
    cmds:
      - echo "Good morning!"
      - echo "Have a nice day!"

  # 単一コマンドの場合は cmd を使える
  hello:
    desc: Hello を表示する
    cmd: echo "Hello!"
```

### サイレント実行

```yaml
tasks:
  hello:
    desc: コマンドを表示せずに実行
    silent: true
    cmds:
      - echo "Hello!"

  # 個別のコマンドをサイレントに
  mixed:
    cmds:
      - echo "This is shown"
      - cmd: echo "This is silent"
        silent: true
```

---

## 依存関係（deps）

```yaml
version: '3'

tasks:
  build:
    desc: ビルド
    deps: [install]
    cmds:
      - npm run build

  install:
    desc: 依存関係のインストール
    cmds:
      - npm ci

  deploy:
    desc: デプロイ
    deps: [build, test]
    cmds:
      - rsync -av dist/ server:/var/www/

  test:
    desc: テスト
    cmds:
      - npm test
```

> **注意**: `deps`に指定されたタスクは**並列実行**されます。順序が重要な場合は`cmds`内で`task`コマンドを使います:

```yaml
tasks:
  deploy:
    cmds:
      - task: install
      - task: build
      - task: test
      - echo "Deploying..."
```

### 前提条件（preconditions）

```yaml
tasks:
  deploy:
    desc: 本番デプロイ
    preconditions:
      - sh: test -f dist/index.html
        msg: "ビルドが必要です。先に 'task build' を実行してください"
      - sh: '[ "$ENV" = "production" ]'
        msg: "ENV=production が設定されていません"
    cmds:
      - echo "Deploying to production..."
```

---

## 変数（vars / env）

### タスク内変数

```yaml
version: '3'

vars:
  PROJECT_NAME: myapp
  VERSION: 1.0.0

tasks:
  build:
    desc: ビルド
    vars:
      BUILD_DIR: dist
    cmds:
      - echo "Building {{.PROJECT_NAME}} v{{.VERSION}}"
      - mkdir -p {{.BUILD_DIR}}
      - npm run build -- --outdir={{.BUILD_DIR}}
```

### 環境変数

```yaml
version: '3'

env:
  NODE_ENV: production

tasks:
  build:
    desc: ビルド
    env:
      DEBUG: "false"
    cmds:
      - echo "NODE_ENV=$NODE_ENV"
      - npm run build
```

### 動的変数（sh:）

シェルコマンドの出力を変数として使用:

```yaml
version: '3'

vars:
  GIT_HASH:
    sh: git rev-parse --short HEAD
  DATE:
    sh: date +%Y%m%d
  BRANCH:
    sh: git branch --show-current

tasks:
  info:
    desc: プロジェクト情報を表示
    cmds:
      - echo "Commit {{.GIT_HASH}}"
      - echo "Date {{.DATE}}"
      - echo "Branch {{.BRANCH}}"

  docker-build:
    desc: Dockerイメージをビルド
    cmds:
      - docker build -t myapp:{{.GIT_HASH}} .
```

---

## 条件分岐と状態チェック

### status（状態チェック）

`status`を使うと、条件が満たされている場合にタスクをスキップできます:

```yaml
tasks:
  install:
    desc: 依存関係のインストール
    cmds:
      - npm ci
    status:
      - test -d node_modules
    # node_modules が存在する場合はスキップ
```

### sources / generates（ファイル変更検知）

```yaml
tasks:
  build:
    desc: ビルド（ソースが変更された場合のみ）
    cmds:
      - npm run build
    sources:
      - src/**/*.ts
      - src/**/*.tsx
      - package.json
    generates:
      - dist/**/*
    # sources のファイルが変更されていない場合はスキップ
```

### method（チェック方法）

```yaml
tasks:
  build:
    cmds:
      - npm run build
    sources:
      - src/**/*
    generates:
      - dist/**/*
    method: checksum   # チェックサムで比較（デフォルト）
    # method: timestamp  # タイムスタンプで比較
    # method: none       # 常に実行
```

---

## タスクの呼び出しとインクルード

### 他のタスクの呼び出し

```yaml
tasks:
  all:
    desc: すべてを実行
    cmds:
      - task: lint
      - task: test
      - task: build

  lint:
    cmds:
      - npm run lint

  test:
    cmds:
      - npm test

  build:
    cmds:
      - npm run build
```

### インクルード（Taskfileの分割）

```yaml
# Taskfile.yml
version: '3'

includes:
  docker: ./taskfiles/Docker.yml
  db: ./taskfiles/Database.yml

tasks:
  default:
    cmds:
      - task --list
```

```yaml
# taskfiles/Docker.yml
version: '3'

tasks:
  build:
    desc: Dockerイメージをビルド
    cmds:
      - docker build -t myapp .

  run:
    desc: Dockerコンテナを実行
    cmds:
      - docker run -p 3000:3000 myapp
```

```bash
# インクルードしたタスクの実行
task docker:build
task docker:run
task db:migrate
```

---

## OS固有のタスク（platforms）

```yaml
tasks:
  open:
    desc: ブラウザで開く
    platforms: [darwin]
    cmds:
      - open http://localhost:3000

  open:
    desc: ブラウザで開く
    platforms: [linux]
    cmds:
      - xdg-open http://localhost:3000

  install:
    desc: 依存関係のインストール
    cmds:
      - cmd: brew install jq
        platforms: [darwin]
      - cmd: sudo apt install -y jq
        platforms: [linux]
```

---

## dotenv対応

```yaml
version: '3'

dotenv: ['.env', '.env.local']

tasks:
  start:
    desc: アプリケーション起動
    cmds:
      - echo "Database $DATABASE_URL"
      - npm start
```

---

## CLIオプション

```bash
# タスク一覧
task --list
task -l

# ドライラン（何が実行されるか確認）
task --dry

# 強制実行（statusやsourcesのチェックをスキップ）
task --force build
task -f build

# タスクに変数を渡す
task build -- --verbose

# 並列実行
task --parallel lint test

# Taskfileのパスを指定
task --taskfile path/to/Taskfile.yml build

# 作業ディレクトリを指定
task --dir /path/to/project build

# 監視モード（ファイル変更時に自動実行）
task --watch build
```

---

## 実践的な使用例

### 開発環境セットアップ

```yaml
version: '3'

dotenv: ['.env']

vars:
  APP_NAME: myapp

tasks:
  default:
    desc: 利用可能なタスクの一覧
    silent: true
    cmds:
      - task --list

  setup:
    desc: 開発環境の初期セットアップ
    cmds:
      - task: install
      - task: db:setup
      - echo "Setup complete! Run 'task dev' to start."

  install:
    desc: 依存関係のインストール
    cmds:
      - npm ci
    status:
      - test -d node_modules

  dev:
    desc: 開発サーバーの起動
    deps: [install]
    cmds:
      - npm run dev

  build:
    desc: プロダクションビルド
    deps: [install]
    cmds:
      - npm run build
    sources:
      - src/**/*
      - package.json
    generates:
      - dist/**/*

  test:
    desc: テストの実行
    cmds:
      - npm test

  lint:
    desc: リンターの実行
    cmds:
      - npm run lint

  check:
    desc: すべてのチェックを実行
    cmds:
      - task: lint
      - task: test
      - task: build

  db:setup:
    desc: データベースのセットアップ
    cmds:
      - npx prisma migrate deploy
      - npx prisma db seed

  db:migrate:
    desc: マイグレーションの実行
    cmds:
      - npx prisma migrate deploy

  db:reset:
    desc: データベースのリセット
    cmds:
      - npx prisma migrate reset

  docker:build:
    desc: Dockerイメージのビルド
    vars:
      TAG:
        sh: git rev-parse --short HEAD
    cmds:
      - docker build -t {{.APP_NAME}}:{{.TAG}} .

  deploy:
    desc: デプロイ
    deps: [check]
    preconditions:
      - sh: test -d dist
        msg: "ビルドが必要です"
    cmds:
      - echo "Deploying {{.APP_NAME}}..."
      - rsync -avz dist/ server:/var/www/
```

---

## Make / just / Task 比較表

| 特徴 | Make | just | Task |
|------|------|------|------|
| 設定ファイル | Makefile | justfile | Taskfile.yml |
| 設定形式 | 独自形式 | 独自形式 | YAML |
| インデント | タブ必須 | スペースOK | YAMLの規則 |
| 引数サポート | 限定的 | ネイティブ | 限定的 |
| 変更検知 | ファイルベース | なし | sources/generates |
| dotenv | 手動 | `set dotenv-load` | `dotenv:` |
| タスク一覧 | 手動で作成 | `just --list` | `task --list` |
| 並列実行 | `-j` オプション | なし | `deps`で自動 |
| インクルード | `include` | `import` | `includes:` |
| OS依存 | 条件分岐 | `[linux]` 等 | `platforms:` |
| 監視モード | なし | なし | `--watch` |
| 実装言語 | C | Rust | Go |
| プリインストール | ほぼ全環境 | なし | なし |

### どれを選ぶか

- **Make**: どの環境でも動く。C/C++プロジェクトやファイルの依存関係管理が必要な場合
- **just**: シンプルなコマンドランナーが欲しい。引数サポートが重要な場合
- **Task**: YAMLが好み。変更検知や監視モードが必要。大きなプロジェクトでTaskfileを分割したい場合

---

## まとめ

- **Task**はYAML形式で記述するモダンなタスクランナー
- `sources` / `generates`による**変更検知**で不要な再実行を防げる
- `includes`でTaskfileを分割し、大規模プロジェクトでも管理しやすい
- `--watch`モードでファイル変更時の自動実行が可能
- `preconditions`でタスクの前提条件を明示でき、安全なデプロイに活用できる
- YAML形式に馴染みがあるチーム（Kubernetes、Docker Compose等を使用）には特に親和性が高い
