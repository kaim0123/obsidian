# bat - シンタックスハイライト付きcat

## 概要

**bat**は、`cat`コマンドの代替として開発されたファイル表示ツールです。Rustで書かれており、**シンタックスハイライト**、**行番号表示**、**Git差分表示**をデフォルトでサポートしています。

### batの特徴

- **シンタックスハイライト**: 多数のプログラミング言語・設定ファイルに対応
- **行番号表示**: デフォルトで行番号を表示
- **Git統合**: 変更・追加・削除された行をマーク表示
- **ページャー統合**: 長いファイルは自動的にless風にスクロール
- **catとの互換性**: パイプラインでの使用時はプレーン出力に自動切替

---

## インストール

```bash
# macOS（Homebrew）
brew install bat

# Ubuntu / Debian
sudo apt install bat
# ※ コマンド名が batcat になる場合がある
# alias bat='batcat'

# Arch Linux
pacman -S bat

# Windows（Scoop）
scoop install bat

# Windows（Chocolatey）
choco install bat

# Cargo（Rust）
cargo install bat
```

---

## 基本的な使い方

```bash
# ファイルの表示（シンタックスハイライト + 行番号 + Git差分）
bat main.py

# 複数ファイルの表示
bat src/main.rs src/lib.rs

# 標準入力から読み取り
cat data.json | bat -l json

# 言語を明示的に指定
bat --language=sql query.txt

# パイプラインでの使用（自動的にプレーン出力）
bat main.py | grep "function"
```

---

## シンタックスハイライト

### 対応言語の確認

```bash
# サポートされている言語の一覧
bat --list-languages
```

bat は200以上の言語・ファイル形式をサポートしています（Python, JavaScript, TypeScript, Rust, Go, Java, C/C++, YAML, JSON, Markdown, SQL, Dockerfile, Shell script など）。

### テーマの変更

```bash
# 利用可能なテーマの一覧
bat --list-themes

# テーマを指定して表示
bat --theme="Dracula" main.py
bat --theme="Monokai Extended" main.py
bat --theme="Nord" main.py

# テーマのプレビュー（全テーマを比較）
bat --list-themes | fzf --preview="bat --theme={} --color=always main.py"
```

### デフォルトテーマの設定

```bash
# 環境変数で設定
export BAT_THEME="Dracula"
```

---

## 表示スタイルのカスタマイズ

### --style オプション

`--style`で表示する要素を制御できます:

```bash
# 全要素を表示（デフォルト）
bat --style=full main.py

# 行番号のみ
bat --style=numbers main.py

# グリッド線 + 行番号
bat --style=grid,numbers main.py

# ヘッダー（ファイル名）のみ
bat --style=header main.py

# 何も装飾しない（catと同じ出力）
bat --style=plain main.py
# または
bat -p main.py
```

利用可能なスタイル要素:

| 要素 | 説明 |
|------|------|
| `full` | すべて表示 |
| `auto` | 自動判定（デフォルト） |
| `plain` | 装飾なし |
| `numbers` | 行番号 |
| `header` | ファイル名ヘッダー |
| `header-filename` | ファイル名のみ |
| `header-filesize` | ファイルサイズのみ |
| `grid` | グリッド線 |
| `rule` | 区切り線 |
| `snip` | 省略マーク |
| `changes` | Git変更マーク |

---

## よく使うオプション

| オプション | 説明 | 例 |
|-----------|------|-----|
| `-n` / `--number` | 行番号のみ表示（他の装飾なし） | `bat -n main.py` |
| `-p` / `--plain` | プレーン表示 | `bat -p main.py` |
| `-l` / `--language` | 言語を指定 | `bat -l python script` |
| `--line-range` / `-r` | 行範囲を指定 | `bat -r 10:20 main.py` |
| `--highlight-line` / `-H` | 特定行をハイライト | `bat -H 15 main.py` |
| `--diff` | 2ファイルの差分表示 | `bat --diff a.py b.py` |
| `-A` / `--show-all` | 非表示文字を表示 | `bat -A file.txt` |
| `--paging` | ページャーの制御 | `bat --paging=never main.py` |
| `--wrap` | 行の折り返し | `bat --wrap=never main.py` |
| `--tabs` | タブ幅の指定 | `bat --tabs=2 main.py` |

```bash
# 10行目から20行目を表示
bat --line-range 10:20 main.py

# 最初の30行を表示
bat --line-range :30 main.py

# 50行目以降を表示
bat --line-range 50: main.py

# 15行目をハイライト表示
bat --highlight-line 15 main.py

# 複数行をハイライト
bat -H 10 -H 15 -H 20 main.py
bat -H 10:15 main.py

# 非表示文字（タブ、スペース、改行）を表示
bat -A file.txt

# ページャーを使わない
bat --paging=never main.py
```

---

## catとの比較

| 特徴 | cat | bat |
|------|-----|-----|
| シンタックスハイライト | なし | あり |
| 行番号 | `-n`オプション | デフォルト |
| Git差分マーク | なし | あり |
| ページャー | なし | 自動（less互換） |
| パイプ時の挙動 | そのまま | 自動でプレーン出力 |
| 速度 | 高速 | やや遅い（ハイライト処理） |
| 可搬性 | どこでもある | インストール必要 |

### エイリアスの設定

```bash
# catをbatに置き換え
alias cat='bat --paging=never'

# または、batをcatのように使う（ページャーなし、スタイル最小限）
alias cat='bat -pp'
```

---

## 他のコマンドとの組み合わせ

### fzf のプレビューに使用

```bash
# ファイル選択時にbatでプレビュー
fzf --preview 'bat --color=always --style=numbers --line-range=:500 {}'

# 環境変数として設定
export FZF_CTRL_T_OPTS="--preview 'bat --color=always {}'"
```

### man ページの表示

```bash
# manページをbatで見やすく表示
export MANPAGER="sh -c 'col -bx | bat -l man -p'"

# または MANROFFOPT を設定
export MANROFFOPT="-c"
export MANPAGER="sh -c 'col -bx | bat -l man -p'"
```

### git diff の表示

```bash
# git diff の出力をbatで表示
git diff | bat -l diff

# batをgitのページャーとして設定
git config --global core.pager "bat --style=changes"

# delta（git用diffツール）と組み合わせ
# ※ deltaは別途インストールが必要
git config --global core.pager "delta"
```

### tail -f の代わり

```bash
# ログファイルの監視（シンタックスハイライト付き）
tail -f app.log | bat --paging=never -l log
```

---

## 設定ファイル

batの設定は設定ファイルで永続化できます:

```bash
# 設定ファイルのパスを確認
bat --config-file

# 設定ディレクトリを確認
bat --config-dir
```

設定ファイルの例（`~/.config/bat/config`）:

```
# テーマ
--theme="Dracula"

# デフォルトスタイル
--style="numbers,changes,header"

# タブ幅
--tabs=4

# 行の折り返し
--wrap=never

# イタリック体を使用
--italic-text=always
```

---

## 実践的な使用例

```bash
# 設定ファイルの確認（ハイライト付き）
bat /etc/nginx/nginx.conf
bat ~/.gitconfig

# ログファイルの閲覧（行番号付き）
bat -l log /var/log/syslog

# JSONの整形表示
curl -s https://api.example.com/data | jq '.' | bat -l json

# Markdownのプレビュー
bat README.md

# 複数ファイルの比較
bat --diff file1.py file2.py

# Docker関連ファイルの確認
bat Dockerfile docker-compose.yaml

# スクリプトファイルの言語を自動検出
bat deploy.sh

# コードスニペットの表示（特定行範囲）
bat --line-range 50:80 --highlight-line 65 main.py
```

---

## まとめ

- **bat**はcatの完全上位互換として、コードを読む体験を大幅に改善
- シンタックスハイライト、行番号、Git差分マークがデフォルトで有効
- fzfの`--preview`と組み合わせることで、ファイル選択が格段に便利になる
- パイプライン使用時は自動的にプレーン出力に切り替わるため、既存のワークフローを壊さない
- `--style`と`--theme`で見た目を自由にカスタマイズ可能
