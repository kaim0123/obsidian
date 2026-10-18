# fzf - コマンドラインファジーファインダー

## 概要

**fzf**（fuzzy finder）は、コマンドラインで**あいまい検索（ファジー検索）**を行うための汎用ツールです。ファイル、コマンド履歴、プロセス、Gitブランチなど、あらゆるリストをインタラクティブに絞り込んで選択できます。

### fzfの特徴

- **ファジー（あいまい）マッチ**: 完全一致でなくても、文字の部分的な一致で候補を絞り込める
- **超高速**: Go言語で実装され、数万件のリストも瞬時に処理
- **汎用的**: 任意のテキスト入力をフィルタリングできる
- **シェル統合**: Ctrl+R（コマンド履歴）、Ctrl+T（ファイル選択）などのキーバインドを提供
- **プレビュー機能**: 選択候補の中身をリアルタイムにプレビューできる

---

## インストール

```bash
# macOS（Homebrew）
brew install fzf
# シェル統合のインストール
$(brew --prefix)/opt/fzf/install

# Ubuntu / Debian
sudo apt install fzf

# Arch Linux
pacman -S fzf

# Windows（Scoop）
scoop install fzf

# Windows（Chocolatey）
choco install fzf

# Git経由（どの環境でも）
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install
```

---

## 基本的な使い方

### パイプラインでの使用

fzfの最も基本的な使い方は、パイプで渡されたリストをインタラクティブに絞り込むことです:

```bash
# ファイル一覧から選択
ls | fzf

# コマンド出力から選択
ps aux | fzf

# 任意のリストから選択
echo -e "apple\nbanana\ncherry\ndate" | fzf
```

### 単体で実行

引数なしで実行すると、カレントディレクトリ以下のファイルをリストアップします:

```bash
# ファイルを検索して選択
fzf

# 選択したファイルをエディタで開く
code $(fzf)
vim $(fzf)
```

### ファジーマッチの仕組み

入力した文字は**順序を保ったまま部分一致**で検索されます:

```
入力: "src js"
マッチ: "src/components/Button.js"  ← src と js の両方を含む
マッチ: "src/utils/helper.js"
非マッチ: "test/Button.spec.ts"     ← src を含まない
```

### 検索構文

| 構文 | 説明 | 例 |
|------|------|-----|
| `abc` | ファジーマッチ | `abc` → 「abc」を含む候補 |
| `'abc` | 完全一致（プレフィックス `'`） | `'test` → 「test」を含む候補のみ |
| `^abc` | 前方一致 | `^src` → 「src」で始まる候補 |
| `abc$` | 後方一致 | `.ts$` → 「.ts」で終わる候補 |
| `!abc` | 否定（除外） | `!test` → 「test」を含まない候補 |
| `!^abc` | 前方一致の否定 | `!^node` → 「node」で始まらない候補 |
| `a \| b` | OR検索 | `ts \| js` → tsまたはjsを含む |

```
# 複数条件の組み合わせ
src .ts !test     → src配下の.tsファイルでtestを含まないもの
^src 'component   → srcで始まりcomponentを含むもの
```

---

## シェル統合（キーバインド）

fzfのインストール時にシェル統合を有効にすると、以下のキーバインドが使えるようになります:

### Ctrl+R - コマンド履歴の検索

```
Ctrl+R を押すと、コマンド履歴をファジー検索できます

例: "docker" と入力すると、過去に実行したdocker関連のコマンドが絞り込まれる
```

これは通常のCtrl+Rの逆方向検索より圧倒的に便利です。

### Ctrl+T - ファイル選択

```
Ctrl+T を押すと、ファイルをファジー検索して選択し、
現在のコマンドラインに挿入できます

例: vim [Ctrl+T] → ファイルを選択 → vim src/main.ts
```

### Alt+C - ディレクトリ移動

```
Alt+C を押すと、ディレクトリをファジー検索して
選択したディレクトリにcdできます
```

---

## プレビュー機能

fzfの強力な機能の一つが、選択候補の内容をリアルタイムにプレビューする機能です:

### --preview オプション

```bash
# ファイルの内容をプレビュー
fzf --preview 'cat {}'

# bat を使ったシンタックスハイライト付きプレビュー
fzf --preview 'bat --color=always --style=numbers {}'

# プレビューウィンドウのサイズと位置を指定
fzf --preview 'bat --color=always {}' --preview-window=right:60%

# プレビューウィンドウを下部に配置
fzf --preview 'bat --color=always {}' --preview-window=down:40%

# ディレクトリの中身をプレビュー
fd -t d | fzf --preview 'ls -la {}'

# 隠しプレビュー（?キーで切り替え）
fzf --preview 'bat --color=always {}' --preview-window=hidden --bind '?:toggle-preview'
```

---

## よく使うオプション

### 表示の制御

| オプション | 説明 | 例 |
|-----------|------|-----|
| `--height N%` | 画面の一部だけ使用 | `fzf --height 40%` |
| `--reverse` | リストを上から表示 | `fzf --reverse` |
| `--border` | 境界線を表示 | `fzf --border` |
| `--prompt` | プロンプト文字列 | `fzf --prompt "Select> "` |
| `--header` | ヘッダーテキスト | `fzf --header "Choose a file"` |
| `--no-info` | 情報行を非表示 | `fzf --no-info` |

### 選択の制御

| オプション | 説明 | 例 |
|-----------|------|-----|
| `--multi` / `-m` | 複数選択を有効化（Tabで選択） | `fzf -m` |
| `--query` / `-q` | 初期クエリ | `fzf -q "test"` |
| `--filter` / `-f` | 非インタラクティブフィルタ | `fzf -f "test"` |
| `--select-1` | 候補が1つなら自動選択 | `fzf --select-1` |
| `--exit-0` | 候補が0なら即終了 | `fzf --exit-0` |

### キーバインドのカスタマイズ

```bash
# --bind でキーバインドを追加
fzf --bind 'ctrl-a:select-all,ctrl-d:deselect-all'
fzf --bind 'ctrl-y:execute-silent(echo {} | clip)'
fzf --bind 'enter:become(vim {})'

# プレビューのスクロール
fzf --preview 'bat {}' --bind 'ctrl-u:preview-up,ctrl-d:preview-down'
```

---

## 他のコマンドとの組み合わせ

### fd + fzf（ファイル検索）

```bash
# fdで検索 → fzfで選択 → エディタで開く
fd -t f | fzf --preview 'bat --color=always {}' | xargs code

# 特定の拡張子のファイルをインタラクティブに選択
fd -e py | fzf -m | xargs code

# FZF_DEFAULT_COMMAND にfdを設定
export FZF_DEFAULT_COMMAND='fd --type f --hidden --follow --exclude .git'
```

### rg + fzf（テキスト検索）

```bash
# rgの結果をfzfで絞り込み
rg --line-number --no-heading '' | fzf --delimiter ':' --preview 'bat --color=always --highlight-line {2} {1}' --preview-window '+{2}/2'

# インタラクティブなgrep（入力するたびに再検索）
FZF_DEFAULT_COMMAND='rg --files' fzf
```

### git + fzf

```bash
# Gitブランチの切り替え
git branch -a | fzf | xargs git checkout

# コミットログの検索
git log --oneline | fzf --preview 'git show {1}'

# 変更されたファイルの選択
git diff --name-only | fzf -m | xargs git add

# Git stashの選択と適用
git stash list | fzf | cut -d: -f1 | xargs git stash apply
```

### プロセスのkill

```bash
# プロセスを選択してkill
ps aux | fzf | awk '{print $2}' | xargs kill

# より安全なバージョン（確認付き）
kill $(ps aux | fzf -m | awk '{print $2}')
```

### Docker

```bash
# コンテナを選択してログを表示
docker ps | fzf | awk '{print $1}' | xargs docker logs -f

# イメージを選択して削除
docker images | fzf -m | awk '{print $3}' | xargs docker rmi
```

---

## カスタマイズ

### 環境変数

```bash
# ~/.bashrc または ~/.zshrc に追加

# デフォルトのファイル検索コマンド
export FZF_DEFAULT_COMMAND='fd --type f --hidden --follow --exclude .git'

# デフォルトのオプション
export FZF_DEFAULT_OPTS='
  --height 40%
  --reverse
  --border
  --preview "bat --color=always --style=numbers --line-range=:500 {}"
  --bind "ctrl-u:preview-up,ctrl-d:preview-down"
'

# Ctrl+T のコマンド
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"

# Ctrl+T のオプション
export FZF_CTRL_T_OPTS="--preview 'bat --color=always {}'"

# Alt+C のコマンド
export FZF_ALT_C_COMMAND='fd --type d --hidden --follow --exclude .git'

# Alt+C のオプション
export FZF_ALT_C_OPTS="--preview 'tree -C {} | head -50'"
```

### カラースキーム

```bash
# カラースキームのカスタマイズ
export FZF_DEFAULT_OPTS='
  --color=fg:#e5e9f0,bg:#2e3440,hl:#81a1c1
  --color=fg+:#e5e9f0,bg+:#3b4252,hl+:#81a1c1
  --color=info:#eacb8a,prompt:#bf6069,pointer:#b48dac
  --color=marker:#a3be8b,spinner:#b48dac,header:#a3be8b
'
```

---

## 実践的な使用例

### 便利なシェル関数

```bash
# ファイルを検索してエディタで開く
fe() {
  local file
  file=$(fd -t f | fzf --preview 'bat --color=always {}')
  [[ -n "$file" ]] && ${EDITOR:-vim} "$file"
}

# ディレクトリに移動
fcd() {
  local dir
  dir=$(fd -t d | fzf --preview 'tree -C {} | head -50')
  [[ -n "$dir" ]] && cd "$dir"
}

# Gitブランチの切り替え
fbr() {
  local branch
  branch=$(git branch -a | sed 's/^..//' | fzf)
  [[ -n "$branch" ]] && git checkout "$branch"
}

# コマンド履歴から選んで実行
fh() {
  eval "$(history | fzf --tac | sed 's/^ *[0-9]* *//')"
}

# 環境変数を検索
fenv() {
  env | fzf
}

# プロセスをkill
fkill() {
  local pid
  pid=$(ps aux | fzf -m | awk '{print $2}')
  [[ -n "$pid" ]] && echo "$pid" | xargs kill -9
}
```

### スクリプトでの使用

```bash
#!/bin/bash
# デプロイ先の環境を選択
ENV=$(echo -e "development\nstaging\nproduction" | fzf --prompt "Deploy to: ")
if [[ -z "$ENV" ]]; then
  echo "キャンセルされました"
  exit 1
fi
echo "Deploying to $ENV..."
```

---

## キーバインド一覧

fzfのインタラクティブモードで使えるキーバインド:

| キー | 動作 |
|------|------|
| `Enter` | 選択を確定 |
| `Esc` / `Ctrl+C` | キャンセル |
| `↑` / `↓` | 候補の移動 |
| `Ctrl+J` / `Ctrl+K` | 候補の移動（矢印キーの代わり） |
| `Tab` | 複数選択モードで選択/解除 |
| `Shift+Tab` | 複数選択モードで選択解除 |
| `Ctrl+A` | 全選択（bindで設定時） |
| `Page Up` / `Page Down` | ページ移動 |
| `Ctrl+U` | クエリをクリア |

---

## まとめ

- **fzf**はコマンドラインのインタラクティブ検索を劇的に改善するツール
- **Ctrl+R**（履歴検索）、**Ctrl+T**（ファイル選択）、**Alt+C**（ディレクトリ移動）の3つのシェル統合が特に便利
- `--preview`オプションで選択候補の中身を事前確認できる
- fd、rg、bat、gitなど他のツールと組み合わせることで真価を発揮
- 環境変数でカスタマイズすることで、自分好みのワークフローを構築できる
