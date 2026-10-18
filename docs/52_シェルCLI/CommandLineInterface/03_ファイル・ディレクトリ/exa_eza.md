# exa / eza - モダンなls代替ツール

## 概要

**exa**は`ls`コマンドのモダンな代替ツールとして開発されました。**eza**はexaの開発が停止した後、コミュニティによってフォーク・メンテナンスされている後継プロジェクトです。

### exaからezaへの経緯

- **exa**: 2017年から開発。Rust製のls代替として人気を博す
- **2023年**: exaの開発が停止（メンテナーが不在に）
- **eza**: コミュニティがフォークし、活発にメンテナンスを継続

> 現在は **eza** を使うことが推奨されています。本ページではezaを中心に解説しますが、コマンド体系はexaとほぼ同じです。

### 特徴

- **カラー出力**: ファイルタイプに応じた色分け
- **アイコン表示**: ファイルタイプごとのアイコン（Nerd Font必要）
- **Git統合**: ファイルのGitステータスを表示
- **ツリー表示**: 内蔵のツリー表示機能
- **人間に読みやすいサイズ表示**: デフォルトで有効

---

## インストール

```bash
# macOS（Homebrew）
brew install eza

# Ubuntu / Debian
sudo apt install eza
# または
cargo install eza

# Arch Linux
pacman -S eza

# Windows（Scoop）
scoop install eza

# Windows（Cargo）
cargo install eza
```

---

## 基本的な使い方

```bash
# 基本的なファイル一覧（カラー表示）
eza

# 詳細表示（パーミッション、サイズ、日時など）
eza -l

# 隠しファイルを含む
eza -a

# 詳細 + 隠しファイル
eza -la

# 特定のディレクトリを表示
eza -l src/
```

---

## よく使うオプション

### 表示の制御

| オプション | 説明 | 例 |
|-----------|------|-----|
| `-l` / `--long` | 詳細表示 | `eza -l` |
| `-a` / `--all` | 隠しファイルを含む | `eza -a` |
| `-1` / `--oneline` | 1行1ファイル | `eza -1` |
| `-G` / `--grid` | グリッド表示（デフォルト） | `eza -G` |
| `--icons` | アイコンを表示 | `eza --icons` |
| `-h` / `--header` | ヘッダー行を表示 | `eza -lh` |
| `--no-permissions` | パーミッションを非表示 | `eza -l --no-permissions` |
| `--no-user` | ユーザー名を非表示 | `eza -l --no-user` |
| `--no-time` | 日時を非表示 | `eza -l --no-time` |
| `--time-style` | 日時のフォーマット | `eza -l --time-style=long-iso` |

### ソート

| オプション | 説明 | 例 |
|-----------|------|-----|
| `-s` / `--sort` | ソート基準を指定 | `eza -l -s size` |
| `-r` / `--reverse` | 逆順 | `eza -l -s size -r` |
| `--group-directories-first` | ディレクトリを先に表示 | `eza -l --group-directories-first` |

利用可能なソート基準:
- `name`（名前、デフォルト）
- `size`（サイズ）
- `date` / `modified`（更新日時）
- `accessed`（アクセス日時）
- `created`（作成日時）
- `extension`（拡張子）
- `type`（タイプ）
- `none`（ソートなし）

```bash
# サイズ順（大きい順）
eza -l -s size -r

# 更新日時順（新しい順）
eza -l -s modified -r

# 拡張子でグループ化
eza -l -s extension

# ディレクトリを先に、その後名前順
eza -l --group-directories-first
```

### フィルタリング

```bash
# ディレクトリのみ表示
eza -D

# ファイルのみ表示（ディレクトリを除く）
eza -f

# 特定の深さまで表示
eza -l -d         # カレントディレクトリのみ（再帰しない）

# .gitignore のファイルを除外
eza --git-ignore
```

---

## ツリー表示

ezaは内蔵のツリー表示機能を持っています:

```bash
# ツリー表示
eza --tree
eza -T

# 深さを制限
eza --tree --level=2
eza -T -L 2

# ツリー + 詳細表示
eza -Tl

# ツリー + アイコン + Git
eza -T --icons --git

# ディレクトリのみのツリー
eza -TD

# 特定パターンを除外
eza -T -I "node_modules|.git|dist"
```

---

## Git統合

ezaはGitリポジトリ内で、各ファイルのGitステータスを表示できます:

```bash
# Git情報付きで表示
eza -l --git

# 出力例:
# .rw-r--r--  1.2k user  1 Jan 12:00 -M README.md
# .rw-r--r--   500 user  1 Jan 12:00 -N src/main.rs
# .rw-r--r--   300 user  1 Jan 12:00 N- tests/test.rs
```

### Gitステータスの記号

| 記号 | 意味 |
|------|------|
| `N` | New（新規追加） |
| `M` | Modified（変更あり） |
| `-` | 変更なし |

2文字表示され、左がステージング状態、右がワークツリー状態を示します。

```bash
# Gitリポジトリのルートを自動検出してrepo全体のステータスを表示
eza -l --git --git-repos
```

---

## lsとの比較

| 特徴 | ls | eza |
|------|----|----|
| カラー出力 | `--color=auto` | デフォルト |
| アイコン | なし | `--icons` |
| Git統合 | なし | `--git` |
| ツリー表示 | なし（treeコマンドが別途必要） | `-T` |
| 人間に読みやすいサイズ | `-h` | デフォルト |
| ヘッダー行 | なし | `-h` |
| 拡張属性 | 一部対応 | `-@` |
| Unicode | 限定的 | 完全対応 |

---

## エイリアス設定

```bash
# ~/.bashrc または ~/.zshrc に追加

# 基本的なエイリアス
alias ls='eza'
alias ll='eza -l --icons --git --group-directories-first'
alias la='eza -la --icons --git --group-directories-first'
alias lt='eza --tree --level=2 --icons'
alias l='eza -1'

# 詳細なエイリアス
alias lls='eza -l --sort=size --reverse'    # サイズ順
alias llt='eza -l --sort=modified --reverse' # 更新日時順
alias lla='eza -la --git --icons --group-directories-first --header'
```

---

## 実践的な使用例

```bash
# プロジェクトの構造を把握
eza -T -L 3 --icons --git-ignore -I "node_modules|.git"

# 大きなファイルを見つける
eza -l -s size -r | head -10

# 最近変更されたファイル
eza -l -s modified -r | head -10

# Gitで変更されたファイルだけを確認
eza -l --git | grep -E "^.{3}[MN]"

# README用のディレクトリ構造を生成
eza -T -L 2 --icons -I "node_modules|.git|dist|coverage"

# ディスク使用量の把握
eza -l --total-size -s size -r -D

# 特定のファイルタイプだけ表示
eza -l *.py
eza -l **/*.ts
```

---

## まとめ

- **eza**（exaの後継）はlsの全面的な改良版
- カラー出力、アイコン、Git統合、ツリー表示をデフォルトでサポート
- `-l`（詳細）、`--icons`（アイコン）、`--git`（Git統合）、`-T`（ツリー）が基本
- エイリアスを設定してlsの代わりに使うのがおすすめ
- 現在は**eza**を使うこと（exaは開発停止）
