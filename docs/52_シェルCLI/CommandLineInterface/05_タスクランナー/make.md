# Make - ビルドツールの元祖

## 概要

**Make**は、1976年に誕生した歴史あるビルド自動化ツールです。**Makefile**と呼ばれるファイルに記述されたルールに従って、コマンドの実行を自動化します。元々はC/C++のコンパイルを自動化するために作られましたが、現在ではあらゆるプロジェクトのタスクランナーとして広く使われています。

### なぜMakeを使うのか

- **どこでもある**: ほぼすべてのUnix/Linux環境にプリインストール
- **依存関係の管理**: ファイルの変更を検出し、必要な部分だけ再ビルド
- **シンプル**: 基本的な使い方は非常に簡単
- **言語非依存**: どのプログラミング言語のプロジェクトでも使える

---

## インストール

```bash
# Linux: ほぼプリインストール
sudo apt install make        # Ubuntu/Debian
sudo yum install make        # CentOS/RHEL

# macOS: Xcode Command Line Tools に含まれる
xcode-select --install

# Windows
# Git Bash に含まれる
# WSL を使用
# Chocolatey: choco install make
# Scoop: scoop install make
```

---

## Makefileの基本構造

Makefileは**ターゲット**、**依存関係**、**レシピ**の3つで構成されます:

```makefile
ターゲット: 依存関係
	レシピ（コマンド）
```

### 最もシンプルなMakefile

```makefile
hello:
	echo "Hello, World!"
```

```bash
# 実行
make hello
# → echo "Hello, World!"
# → Hello, World!
```

### タブ文字の重要性（初心者がハマるポイント）

**レシピの行頭は必ずタブ文字**でなければなりません。スペースではエラーになります。

```makefile
# 正しい（タブ文字）
hello:
	echo "Hello"    # ← タブ

# 間違い（スペース）
hello:
    echo "Hello"    # ← スペース → エラー!
```

> エディタの設定で「タブをスペースに変換」が有効な場合は、Makefileでは無効にする必要があります。

---

## 基本的なMakefileの書き方

### 複数のターゲット

```makefile
.PHONY: build test clean run

build:
	echo "Building..."
	npm run build

test:
	echo "Testing..."
	npm test

clean:
	echo "Cleaning..."
	rm -rf dist/

run:
	echo "Running..."
	npm start
```

```bash
make build     # ビルドを実行
make test      # テストを実行
make clean     # クリーンアップ
make run       # アプリケーションを起動
make           # 最初のターゲット（build）を実行
```

### 依存関係

```makefile
# deploy は build に依存する
deploy: build
	echo "Deploying..."
	rsync -av dist/ server:/var/www/

build:
	echo "Building..."
	npm run build
```

```bash
make deploy
# → まず build が実行され、次に deploy が実行される
```

### 複数の依存関係

```makefile
all: build test lint

build:
	npm run build

test:
	npm test

lint:
	npm run lint
```

---

## 変数

### 変数の定義と使用

```makefile
# 変数の定義
CC = gcc
CFLAGS = -Wall -g
SRC_DIR = src
BUILD_DIR = build

# 変数の使用（$(変数名) または ${変数名}）
compile:
	$(CC) $(CFLAGS) -o $(BUILD_DIR)/app $(SRC_DIR)/main.c
```

### 変数の代入方法

| 代入方法 | 説明 | 例 |
|---------|------|-----|
| `=` | 再帰的代入（使用時に評価） | `CC = gcc` |
| `:=` | 即時代入（定義時に評価） | `VERSION := $(shell git describe)` |
| `?=` | 未定義の場合のみ代入 | `PORT ?= 3000` |
| `+=` | 値を追加 | `CFLAGS += -O2` |

```makefile
# ?= で環境変数からのオーバーライドを許可
PORT ?= 3000
ENV ?= development

run:
	PORT=$(PORT) ENV=$(ENV) npm start

# 使用時に環境変数でオーバーライド可能
# PORT=8080 make run
```

### 自動変数

| 変数 | 説明 |
|------|------|
| `$@` | ターゲット名 |
| `$<` | 最初の依存関係 |
| `$^` | すべての依存関係 |
| `$?` | ターゲットより新しい依存関係 |
| `$*` | パターンルールのステム（%にマッチした部分） |

```makefile
# C言語の例
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@
# $< = ソースファイル（.c）
# $@ = ターゲット（.o）

app: main.o utils.o
	$(CC) $^ -o $@
# $^ = main.o utils.o（すべての依存関係）
```

---

## PHONYターゲット

通常、Makeはターゲット名と同名のファイルが存在すると「既に最新」と判断してスキップします。**PHONY**を宣言すると、ファイルの存在に関係なく常に実行されます:

```makefile
.PHONY: build test clean deploy all

all: build test

build:
	npm run build

test:
	npm test

clean:
	rm -rf dist/ node_modules/

deploy: build
	rsync -av dist/ server:/var/www/
```

> **ルール**: ファイルを生成しないターゲットは必ず`.PHONY`に含めましょう。

---

## パターンルール

`%`をワイルドカードとして使い、汎用的なルールを定義できます:

```makefile
# .c ファイルから .o ファイルを生成するルール
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# .md ファイルから .html を生成
%.html: %.md
	pandoc $< -o $@

# .ts ファイルから .js を生成
%.js: %.ts
	npx tsc $<
```

---

## 条件分岐

```makefile
# 変数の値で分岐
ifeq ($(ENV),production)
  OPTS = --minify --sourcemap=false
else
  OPTS = --sourcemap=true
endif

build:
	esbuild $(OPTS) src/index.ts --outdir=dist

# 変数が定義されているかで分岐
ifdef DEBUG
  CFLAGS += -g -DDEBUG
endif

# OSの検出
UNAME := $(shell uname)
ifeq ($(UNAME),Darwin)
  OPEN_CMD = open
else
  OPEN_CMD = xdg-open
endif

open-docs:
	$(OPEN_CMD) docs/index.html
```

---

## 関数

```makefile
# wildcard: ファイル一覧を取得
SRCS = $(wildcard src/*.c)

# patsubst: パターン置換
OBJS = $(patsubst src/%.c, build/%.o, $(SRCS))

# shell: シェルコマンドの実行
GIT_HASH = $(shell git rev-parse --short HEAD)
DATE = $(shell date +%Y%m%d)

# foreach: ループ
DIRS = src lib test
clean-all:
	$(foreach dir,$(DIRS),rm -rf $(dir)/build;)

# filter / filter-out: フィルタリング
TEST_FILES = $(filter %_test.go, $(wildcard *.go))
SRC_FILES = $(filter-out %_test.go, $(wildcard *.go))
```

---

## .DEFAULT_GOAL

デフォルトで実行されるターゲットを指定:

```makefile
.DEFAULT_GOAL := help

help:
	@echo "使用方法:"
	@echo "  make build   - ビルド"
	@echo "  make test    - テスト"
	@echo "  make clean   - クリーンアップ"
	@echo "  make deploy  - デプロイ"
```

> `@`をコマンドの前につけると、コマンド自体の表示を抑制します。

---

## 実践的な使用例

### Webプロジェクト（Node.js）

```makefile
.PHONY: install build test lint format dev clean deploy help

.DEFAULT_GOAL := help

install:
	npm ci

build: install
	npm run build

test:
	npm test

lint:
	npm run lint

format:
	npm run format

dev:
	npm run dev

clean:
	rm -rf dist/ node_modules/ .cache/

deploy: build test
	rsync -avz --delete dist/ server:/var/www/app/

help:
	@echo "利用可能なコマンド:"
	@echo "  make install  - 依存関係のインストール"
	@echo "  make build    - ビルド"
	@echo "  make test     - テスト実行"
	@echo "  make lint     - リンター実行"
	@echo "  make dev      - 開発サーバー起動"
	@echo "  make clean    - クリーンアップ"
	@echo "  make deploy   - デプロイ"
```

### Dockerワークフロー

```makefile
.PHONY: docker-build docker-run docker-push docker-clean

IMAGE_NAME = myapp
TAG ?= latest

docker-build:
	docker build -t $(IMAGE_NAME):$(TAG) .

docker-run: docker-build
	docker run -p 3000:3000 $(IMAGE_NAME):$(TAG)

docker-push: docker-build
	docker push $(IMAGE_NAME):$(TAG)

docker-clean:
	docker rmi $(IMAGE_NAME):$(TAG)
```

### C/C++プロジェクト

```makefile
CC = gcc
CFLAGS = -Wall -Wextra -g
SRCS = $(wildcard src/*.c)
OBJS = $(patsubst src/%.c, build/%.o, $(SRCS))
TARGET = build/app

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) $^ -o $@

build/%.o: src/%.c | build
	$(CC) $(CFLAGS) -c $< -o $@

build:
	mkdir -p build

clean:
	rm -rf build/
```

---

## よくあるエラーと対処法

### 1. `Makefile:X: *** missing separator. Stop.`

**原因**: レシピの行頭がスペースになっている（タブが必要）

```makefile
# 修正: タブ文字を使う
target:
	command    # ← タブ文字
```

### 2. `make: Nothing to be done for 'target'.`

**原因**: ターゲット名と同じファイルが存在し、依存関係が最新

```makefile
# 修正: .PHONY を宣言
.PHONY: build
build:
	npm run build
```

### 3. `make: 'target' is up to date.`

**原因**: 上記と同様。.PHONYを追加する。

### 4. コマンドのエラーで停止する

```makefile
# - をコマンドの前につけるとエラーを無視
clean:
	-rm -rf dist/
	-rm -rf node_modules/
```

---

## Makefileのベストプラクティス

1. **`.PHONY`を忘れずに宣言する**: ファイルを生成しないターゲットはすべて.PHONYに
2. **`help`ターゲットを用意する**: チームメンバーが使い方を把握できる
3. **`@`で出力を整理する**: 不要なコマンド表示を抑制
4. **`?=`で環境変数をオーバーライド可能にする**: 柔軟な設定
5. **依存関係を正しく設定する**: 不要な再ビルドを防ぐ
6. **タブ文字を使う**: エディタの設定を確認

---

## まとめ

- **Make**はビルドの自動化とタスクランナーの定番ツール
- Makefileは「ターゲット: 依存関係 → レシピ」のシンプルな構造
- **タブ文字**の使用は必須（スペースは不可）
- **`.PHONY`**でファイル生成しないターゲットを宣言
- **`?=`**で環境変数からのオーバーライドを可能にする
- どの環境でも使えるため、プロジェクトの「共通インターフェース」として最適
