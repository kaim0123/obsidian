# tmux - ターミナルマルチプレクサ

## 概要

**tmux**（Terminal Multiplexer）は、1つのターミナルウィンドウ内で**複数の端末セッションを管理**するためのツールです。画面分割、セッションの永続化、リモート作業の効率化に欠かせません。

### なぜtmuxを使うのか

- **セッション永続化**: SSHが切断されてもプロセスが続行する
- **画面分割**: 1つのウィンドウでエディタ、ターミナル、ログを同時に表示
- **リモート作業**: サーバー上の長時間タスクを安全に実行
- **作業環境の保存**: 開発環境のレイアウトを保存・復元

---

## インストール

```bash
# macOS（Homebrew）
brew install tmux

# Ubuntu / Debian
sudo apt install tmux

# Arch Linux
pacman -S tmux

# CentOS / RHEL
sudo yum install tmux
```

---

## 基本概念

tmuxには3つの階層があります:

```
Session（セッション）
├── Window（ウィンドウ）≈ タブ
│   ├── Pane（ペイン）≈ 分割領域
│   └── Pane
├── Window
│   ├── Pane
│   ├── Pane
│   └── Pane
└── Window
```

- **セッション**: tmuxの最上位単位。デタッチ/アタッチの対象
- **ウィンドウ**: セッション内のタブのようなもの。画面全体を使用
- **ペイン**: ウィンドウ内の分割領域。画面を分割して複数のシェルを表示

---

## プレフィックスキー

tmuxのほとんどの操作は**プレフィックスキー**の後にコマンドキーを押すことで実行します。

デフォルトのプレフィックスキーは **`Ctrl+b`** です。

```
操作の流れ:
1. Ctrl+b を押す（プレフィックス）
2. キーを離す
3. コマンドキーを押す

例: Ctrl+b → c （新しいウィンドウを作成）
```

以降、プレフィックスキーを `<prefix>` と表記します。

---

## セッション操作

### セッションの作成と起動

```bash
# 新しいセッションを作成して入る
tmux

# 名前付きセッションを作成
tmux new -s mysession

# 名前付きセッション + 最初のウィンドウに名前をつける
tmux new -s dev -n editor
```

### デタッチとアタッチ

```bash
# セッションからデタッチ（tmux内で）
<prefix> d

# セッション一覧の表示
tmux ls
# または
tmux list-sessions

# セッションにアタッチ（再接続）
tmux attach -t mysession
# 短縮形
tmux a -t mysession

# 最後のセッションにアタッチ
tmux a
```

### セッションの管理

```bash
# セッションの終了（tmux内で）
exit    # 最後のウィンドウで実行

# セッションをkill
tmux kill-session -t mysession

# すべてのセッションをkill
tmux kill-server

# セッション名の変更（tmux内で）
<prefix> $

# セッション一覧からインタラクティブに選択（tmux内で）
<prefix> s
```

---

## ウィンドウ操作

| キー | 動作 |
|------|------|
| `<prefix> c` | 新しいウィンドウを作成 |
| `<prefix> n` | 次のウィンドウに移動 |
| `<prefix> p` | 前のウィンドウに移動 |
| `<prefix> 0-9` | 番号でウィンドウを指定 |
| `<prefix> w` | ウィンドウ一覧から選択 |
| `<prefix> ,` | ウィンドウ名を変更 |
| `<prefix> &` | ウィンドウを閉じる（確認あり） |
| `<prefix> l` | 最後に使ったウィンドウに切替 |
| `<prefix> f` | ウィンドウを検索 |

---

## ペイン操作

### ペインの分割

| キー | 動作 |
|------|------|
| `<prefix> %` | 垂直分割（左右に分割） |
| `<prefix> "` | 水平分割（上下に分割） |

```
# <prefix> % で垂直分割
┌──────┬──────┐
│      │      │
│  A   │  B   │
│      │      │
└──────┴──────┘

# <prefix> " で水平分割
┌─────────────┐
│      A      │
├─────────────┤
│      B      │
└─────────────┘
```

### ペインの移動

| キー | 動作 |
|------|------|
| `<prefix> ←↑↓→` | 矢印キーでペイン間を移動 |
| `<prefix> o` | 次のペインに移動 |
| `<prefix> ;` | 最後に操作したペインに移動 |
| `<prefix> q` | ペイン番号を表示（番号を押して移動） |

### ペインのサイズ変更

| キー | 動作 |
|------|------|
| `<prefix> Ctrl+←↑↓→` | ペインのサイズを変更（1セルずつ） |
| `<prefix> Alt+←↑↓→` | ペインのサイズを変更（5セルずつ） |

### ペインの操作

| キー | 動作 |
|------|------|
| `<prefix> z` | ペインのズーム（全画面表示/元に戻す） |
| `<prefix> x` | ペインを閉じる（確認あり） |
| `<prefix> !` | ペインを新しいウィンドウに変換 |
| `<prefix> {` | ペインを前に移動 |
| `<prefix> }` | ペインを後に移動 |
| `<prefix> Space` | ペインレイアウトを切り替え |

### ペインのレイアウト

`<prefix> Space` を押すたびにレイアウトが切り替わります:

- **even-horizontal**: 水平均等分割
- **even-vertical**: 垂直均等分割
- **main-horizontal**: 上にメイン、下に分割
- **main-vertical**: 左にメイン、右に分割
- **tiled**: タイル状に均等分割

---

## コピーモード

コピーモードでは、ターミナルの出力をスクロールしたり、テキストを選択・コピーしたりできます。

### 基本操作

| キー | 動作 |
|------|------|
| `<prefix> [` | コピーモードに入る |
| `q` | コピーモードを終了 |
| `↑↓←→` / `h j k l` | カーソル移動 |
| `Ctrl+u` | 半ページ上にスクロール |
| `Ctrl+d` | 半ページ下にスクロール |
| `g` | 先頭に移動 |
| `G` | 末尾に移動 |
| `/` | 前方検索 |
| `?` | 後方検索 |
| `n` | 次のマッチに移動 |
| `N` | 前のマッチに移動 |

### テキストの選択・コピー

```
1. <prefix> [ でコピーモードに入る
2. Space でテキスト選択を開始
3. カーソルを移動して選択範囲を拡大
4. Enter で選択範囲をコピー（バッファに保存）
5. <prefix> ] でペースト
```

---

## 設定ファイル（~/.tmux.conf）

### よく使う設定

```bash
# ~/.tmux.conf

# プレフィックスキーを Ctrl+a に変更（screenと同じ）
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# マウスサポートを有効化
set -g mouse on

# ウィンドウ番号を1から開始（デフォルトは0）
set -g base-index 1
setw -g pane-base-index 1

# ウィンドウを閉じた時に番号を詰める
set -g renumber-windows on

# 256色サポート
set -g default-terminal "screen-256color"

# ステータスバーの位置を上に
set -g status-position top

# ステータスバーの色
set -g status-style bg=colour235,fg=colour136

# ペイン分割のキーバインドを直感的に
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"
unbind '"'
unbind %

# 新しいウィンドウを現在のパスで開く
bind c new-window -c "#{pane_current_path}"

# ペイン間の移動を vim 風に
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# ペインのリサイズを vim 風に
bind -r H resize-pane -L 5
bind -r J resize-pane -D 5
bind -r K resize-pane -U 5
bind -r L resize-pane -R 5

# コピーモードを vi 風に
setw -g mode-keys vi
bind -T copy-mode-vi v send-keys -X begin-selection
bind -T copy-mode-vi y send-keys -X copy-selection-and-cancel

# 設定ファイルのリロード
bind r source-file ~/.tmux.conf \; display "Config reloaded!"

# Escキーの遅延を解消
set -sg escape-time 0

# ヒストリーのサイズを増やす
set -g history-limit 50000
```

### 設定の反映

```bash
# tmux外から反映
tmux source-file ~/.tmux.conf

# tmux内から反映（上記のbind rを設定している場合）
<prefix> r
```

---

## プラグインマネージャ（tpm）

**tpm**（Tmux Plugin Manager）を使うと、tmuxのプラグインを簡単に管理できます。

### インストール

```bash
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
```

### 設定（~/.tmux.conf に追加）

```bash
# プラグインのリスト
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'      # 基本的な設定
set -g @plugin 'tmux-plugins/tmux-resurrect'      # セッションの保存・復元
set -g @plugin 'tmux-plugins/tmux-continuum'      # 自動保存
set -g @plugin 'tmux-plugins/tmux-yank'           # システムクリップボードへのコピー
set -g @plugin 'catppuccin/tmux'                  # テーマ

# tpmの初期化（この行は必ず最後に）
run '~/.tmux/plugins/tpm/tpm'
```

### プラグインのインストール

```
tmux内で:
<prefix> I    → プラグインのインストール
<prefix> U    → プラグインの更新
<prefix> alt+u → 未使用プラグインの削除
```

---

## 実践的な使用例

### 開発環境の構築

```bash
# スクリプトで開発環境を構築
#!/bin/bash
SESSION="dev"

tmux new-session -d -s $SESSION -n "editor"
tmux send-keys -t $SESSION:editor "vim ." Enter

tmux new-window -t $SESSION -n "server"
tmux send-keys -t $SESSION:server "npm run dev" Enter

tmux new-window -t $SESSION -n "terminal"

tmux select-window -t $SESSION:editor
tmux attach -t $SESSION
```

### サーバーでの長時間タスク

```bash
# SSH接続してtmuxセッションを作成
ssh server
tmux new -s deploy

# デプロイコマンドを実行
./deploy.sh

# <prefix> d でデタッチ（SSH接続を切っても大丈夫）
# 後で再接続:
ssh server
tmux a -t deploy
```

---

## キーバインド一覧表

### セッション

| キー | 動作 |
|------|------|
| `<prefix> d` | デタッチ |
| `<prefix> s` | セッション一覧 |
| `<prefix> $` | セッション名の変更 |
| `<prefix> (` | 前のセッション |
| `<prefix> )` | 次のセッション |

### ウィンドウ

| キー | 動作 |
|------|------|
| `<prefix> c` | 新規作成 |
| `<prefix> n` / `<prefix> p` | 次/前 |
| `<prefix> 0-9` | 番号で移動 |
| `<prefix> w` | 一覧表示 |
| `<prefix> ,` | 名前変更 |
| `<prefix> &` | 閉じる |

### ペイン

| キー | 動作 |
|------|------|
| `<prefix> %` | 垂直分割 |
| `<prefix> "` | 水平分割 |
| `<prefix> ←↑↓→` | 移動 |
| `<prefix> z` | ズーム |
| `<prefix> x` | 閉じる |
| `<prefix> Space` | レイアウト変更 |
| `<prefix> q` | ペイン番号表示 |

### その他

| キー | 動作 |
|------|------|
| `<prefix> :` | コマンドモード |
| `<prefix> ?` | キーバインド一覧 |
| `<prefix> t` | 時計表示 |
| `<prefix> [` | コピーモード |
| `<prefix> ]` | ペースト |

---

## まとめ

- **tmux**はターミナルでの作業効率を劇的に向上させるツール
- **セッション永続化**によりSSH切断からプロセスを保護
- **ペイン分割**でエディタ、ターミナル、ログを同時表示
- `~/.tmux.conf`でプレフィックスキーやキーバインドをカスタマイズ
- **tpm**でプラグインを管理し、機能を拡張（resurrectでセッション復元など）
- まずは `<prefix> %`（垂直分割）、`<prefix> "`（水平分割）、`<prefix> z`（ズーム）の3つを覚えよう
