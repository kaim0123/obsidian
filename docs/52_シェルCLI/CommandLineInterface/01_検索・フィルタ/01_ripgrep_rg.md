# ripgrep（rg） - 超高速テキスト検索ツール

## 概要

**ripgrep**（コマンド名: `rg`）は、ファイル内のテキストを超高速に検索するコマンドラインツールです。従来のgrepの代替として開発され、**速度**、**使いやすさ**、**デフォルト設定の賢さ**の3点で大きく優れています。

### なぜripgrepが高速なのか

- **Rust製**: メモリ安全で高速なRust言語で実装
- **並列処理**: マルチスレッドでファイルを並列に検索
- **スマートなスキップ**: `.gitignore`のルールを自動的に尊重し、不要なファイルを検索しない
- **正規表現エンジン**: Rustの高性能正規表現ライブラリを使用
- **メモリマップドI/O**: 大きなファイルも効率的に処理

---

## インストール

```bash
# macOS（Homebrew）
brew install ripgrep

# Ubuntu / Debian
sudo apt install ripgrep

# Arch Linux
pacman -S ripgrep

# Windows（Scoop）
scoop install ripgrep

# Windows（Chocolatey）
choco install ripgrep

# Cargo（Rust）
cargo install ripgrep
```

バージョン確認:

```bash
rg --version
```

---

## 基本的な使い方

### 文字列の検索

```bash
# カレントディレクトリ以下を再帰的に検索（デフォルト）
rg "検索したい文字列"

# 特定のファイルを検索
rg "pattern" file.txt

# 特定のディレクトリを検索
rg "pattern" src/
```

### 出力の見方

ripgrepの出力はデフォルトでカラー表示されます:

```
src/main.rs
3:    let pattern = "hello";
15:    println!("hello, world!");

src/lib.rs
42:    // hello from lib
```

- **ファイル名**: 紫色で表示
- **行番号**: 緑色で表示
- **マッチ箇所**: 赤色でハイライト

---

## よく使うオプション

### 検索の制御

| オプション | 説明 | 例 |
|-----------|------|-----|
| `-i` / `--ignore-case` | 大文字小文字を無視 | `rg -i "error"` |
| `-w` / `--word-regexp` | 単語単位でマッチ | `rg -w "log"` |
| `-x` / `--line-regexp` | 行全体でマッチ | `rg -x "exact line"` |
| `-F` / `--fixed-strings` | 正規表現を無効化（リテラル検索） | `rg -F "a.b"` |
| `-v` / `--invert-match` | マッチしない行を表示 | `rg -v "debug"` |
| `-s` / `--case-sensitive` | 大文字小文字を区別（デフォルト） | `rg -s "Error"` |
| `-S` / `--smart-case` | パターンが全小文字なら無視、大文字含むなら区別 | `rg -S "Error"` |

### 出力の制御

| オプション | 説明 | 例 |
|-----------|------|-----|
| `-n` / `--line-number` | 行番号を表示（デフォルト） | `rg -n "TODO"` |
| `-N` / `--no-line-number` | 行番号を非表示 | `rg -N "TODO"` |
| `-l` / `--files-with-matches` | マッチしたファイル名のみ表示 | `rg -l "TODO"` |
| `-c` / `--count` | ファイルごとのマッチ数を表示 | `rg -c "TODO"` |
| `-o` / `--only-matching` | マッチした部分のみ表示 | `rg -o '\d+'` |
| `--no-filename` | ファイル名を非表示 | `rg --no-filename "pattern"` |
| `--no-heading` | ファイル名をグループ化しない | `rg --no-heading "pattern"` |
| `--json` | JSON形式で出力 | `rg --json "pattern"` |

### コンテキスト表示

| オプション | 説明 | 例 |
|-----------|------|-----|
| `-C N` / `--context N` | マッチの前後N行を表示 | `rg -C 3 "ERROR"` |
| `-B N` / `--before-context N` | マッチの前N行を表示 | `rg -B 2 "ERROR"` |
| `-A N` / `--after-context N` | マッチの後N行を表示 | `rg -A 5 "ERROR"` |

### ファイルの絞り込み

| オプション | 説明 | 例 |
|-----------|------|-----|
| `-t` / `--type` | ファイルタイプで絞り込み | `rg -t py "import"` |
| `-T` / `--type-not` | ファイルタイプを除外 | `rg -T js "function"` |
| `-g` / `--glob` | グロブパターンで絞り込み | `rg -g '*.md' "TODO"` |
| `-g '!pattern'` | グロブパターンで除外 | `rg -g '!test*' "func"` |
| `--hidden` | 隠しファイルも検索 | `rg --hidden "config"` |
| `--no-ignore` | .gitignoreのルールを無視 | `rg --no-ignore "pattern"` |
| `-L` / `--follow` | シンボリックリンクを追跡 | `rg -L "pattern"` |
| `--max-depth N` | 検索するディレクトリの深さ | `rg --max-depth 2 "pattern"` |
| `--max-filesize N` | ファイルサイズの上限 | `rg --max-filesize 1M "pattern"` |

```bash
# Pythonファイルのみを検索
rg -t py "import requests"

# TypeScriptファイルで "useState" を検索
rg -t ts "useState"

# テストファイルを除外して検索
rg -g '!*test*' -g '!*spec*' "function"

# src/ 配下の .tsx ファイルのみ検索
rg -g '*.tsx' "Component" src/

# 利用可能なファイルタイプの一覧
rg --type-list
```

---

## 正規表現の使い方

ripgrepはデフォルトで**正規表現**を使用します:

```bash
# 数字の連続にマッチ
rg '\d+'

# メールアドレスのパターン
rg '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'

# IPアドレスのパターン
rg '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'

# 行頭が # で始まる行（コメント行）
rg '^#'

# 行末が ; で終わる行
rg ';$'

# "function" の後に任意の文字列が続くパターン
rg 'function\s+\w+'

# TODO または FIXME を検索
rg 'TODO|FIXME'

# 特定の形式の日付（YYYY-MM-DD）
rg '\d{4}-\d{2}-\d{2}'
```

### 正規表現を使いたくない場合

```bash
# -F でリテラル検索（特殊文字をエスケープ不要）
rg -F "array[0].value"
rg -F "price: $10.00"
rg -F "C:\Users\path"
```

---

## .rgignore と .gitignore の関係

ripgrepは以下の順序で無視ルールを適用します:

1. **.gitignore**: Gitリポジトリ内であれば自動的に適用
2. **.ignore**: ripgrepおよびag（The Silver Searcher）が読む
3. **.rgignore**: ripgrep専用の無視ルールファイル

```bash
# .rgignore の例
node_modules/
dist/
*.min.js
*.map
coverage/
.cache/
```

### 無視ルールをスキップする

```bash
# .gitignore のルールを無視して検索
rg --no-ignore "pattern"

# 隠しファイルも含めて検索
rg --hidden "pattern"

# すべての無視ルールをスキップ（隠しファイル含む）
rg --no-ignore --hidden "pattern"
# 短縮形
rg -uu "pattern"
```

---

## 置換（--replace）

ripgrepは検索結果の表示上で置換もできます:

```bash
# マッチした部分を置換して表示（ファイルは変更しない）
rg 'foo' --replace 'bar'

# キャプチャグループを使った置換
rg '(\w+)@(\w+)' --replace '$1 at $2'

# マッチした行全体を表示せず、置換結果のみ表示
rg -o 'pattern' --replace 'replacement'
```

> **注意**: ripgrepはファイルを直接書き換えません。ファイルの置換には `sed` や `sd` を使いましょう。

---

## 実践的な使用例

### コード検索

```bash
# TODOコメントを一覧表示
rg 'TODO|FIXME|HACK|XXX' --no-heading

# 未使用のimportを探す（JavaScript/TypeScript）
rg 'import .* from' -t ts

# 特定の関数の呼び出し箇所を検索
rg 'fetchUserData\(' src/

# console.log の残骸を探す
rg 'console\.(log|debug|warn)' -t js -t ts

# 環境変数の使用箇所
rg 'process\.env\.\w+' -t ts -o | sort -u

# デッドコード候補（エクスポートされた関数の使用箇所を確認）
rg -l 'export function myFunc' && rg 'myFunc' -l
```

### ログ検索

```bash
# エラーログを検索（前後3行のコンテキスト付き）
rg -C 3 'ERROR|FATAL' /var/log/app.log

# 特定の時間帯のログを検索
rg '2024-01-15 1[0-2]:' access.log

# 特定のユーザーに関するログ
rg -i 'user_id.*12345' /var/log/

# ステータスコード500番台のアクセスログ
rg ' 5\d{2} ' access.log
```

### 設定ファイルの検索

```bash
# 特定のポート番号が使われている設定ファイルを探す
rg -l '8080' -g '*.yaml' -g '*.yml' -g '*.json' -g '*.toml'

# 環境変数の定義箇所を探す
rg 'DATABASE_URL' -g '*.env*' -g '*.yaml' --hidden
```

---

## grepとの比較

| 特徴 | grep | ripgrep |
|------|------|---------|
| 速度 | 普通 | 非常に高速（数倍〜数十倍） |
| 再帰検索 | `-r` オプションが必要 | デフォルトで再帰 |
| .gitignore | 非対応 | 自動的に尊重 |
| Unicode | 限定的 | 完全対応 |
| カラー出力 | `--color` が必要 | デフォルトでカラー |
| バイナリスキップ | 手動で除外 | 自動スキップ |
| ファイルタイプ指定 | 不可 | `-t` で簡単に指定 |
| コンテキスト表示 | `-C`, `-B`, `-A` | 同じオプション名 |

### grepからの移行

```bash
# grep → ripgrep の対応
grep -r "pattern" .              →  rg "pattern"
grep -ri "pattern" .             →  rg -i "pattern"
grep -rn "pattern" .             →  rg "pattern"        # デフォルトで行番号表示
grep -rl "pattern" .             →  rg -l "pattern"
grep -r "pattern" --include="*.py"  →  rg -t py "pattern"
grep -rw "pattern" .             →  rg -w "pattern"
grep -c "pattern" file           →  rg -c "pattern" file
```

---

## Tips

### エイリアス設定

```bash
# ~/.bashrc または ~/.zshrc に追加
alias rg='rg --smart-case'   # デフォルトでスマートケース
```

### 設定ファイル

`~/.config/ripgrep/config`（Linux/Mac）または環境変数 `RIPGREP_CONFIG_PATH` で設定ファイルを指定:

```bash
# ~/.config/ripgrep/config
--smart-case
--hidden
--glob=!.git/
--glob=!node_modules/
--max-columns=200
```

```bash
# 環境変数で設定ファイルのパスを指定
export RIPGREP_CONFIG_PATH="$HOME/.config/ripgrep/config"
```

### 他のツールとの組み合わせ

```bash
# fzfと組み合わせてインタラクティブ検索
rg --line-number --no-heading '' | fzf

# 結果をlessで見る
rg "pattern" --color=always | less -R

# マッチしたファイルをエディタで開く
rg -l "TODO" | xargs code

# マッチ数を集計
rg -c "TODO" | sort -t: -k2 -n -r
```

---

## まとめ

- **ripgrep**はgrepの完全上位互換として、圧倒的な速度と使いやすさを提供
- デフォルトで再帰検索、.gitignore尊重、カラー出力と、初心者にも優しい設計
- `-t`（ファイルタイプ）、`-g`（グロブ）、`-C`（コンテキスト）の3つのオプションを覚えるだけで多くの場面に対応
- grepの知識がそのまま活かせる互換性のあるオプション体系
