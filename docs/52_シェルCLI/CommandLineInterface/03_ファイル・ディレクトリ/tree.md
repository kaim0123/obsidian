# tree - ディレクトリ構造の可視化

## 概要

**tree**は、ディレクトリの構造を**ツリー形式**で視覚的に表示するコマンドです。プロジェクトの構成を把握したり、READMEにディレクトリ構造を記載する際に非常に便利です。

---

## インストール

```bash
# macOS（Homebrew）
brew install tree

# Ubuntu / Debian
sudo apt install tree

# Arch Linux
pacman -S tree

# Windows（Scoop）
scoop install tree

# Windows（Chocolatey）
choco install tree

# ※ Windowsにはtree.comが標準で存在するが機能が限定的
```

---

## 基本的な使い方

```bash
# カレントディレクトリのツリーを表示
tree

# 特定のディレクトリを指定
tree src/

# 出力例:
# src/
# ├── components/
# │   ├── Button.tsx
# │   ├── Header.tsx
# │   └── Footer.tsx
# ├── pages/
# │   ├── Home.tsx
# │   └── About.tsx
# ├── utils/
# │   └── helpers.ts
# ├── App.tsx
# └── main.tsx
```

---

## よく使うオプション

### 表示の制御

| オプション | 説明 | 例 |
|-----------|------|-----|
| `-L N` | 表示するディレクトリの深さを制限 | `tree -L 2` |
| `-a` | 隠しファイルも表示 | `tree -a` |
| `-d` | ディレクトリのみ表示 | `tree -d` |
| `-f` | フルパスで表示 | `tree -f` |
| `-i` | インデント線を非表示 | `tree -i` |
| `-C` | カラー出力 | `tree -C` |
| `--noreport` | 最後の集計行を非表示 | `tree --noreport` |

```bash
# 深さ2まで表示
tree -L 2

# ディレクトリのみ表示（深さ3まで）
tree -d -L 3

# 隠しファイルも含めて表示
tree -a

# カラー付きで表示
tree -C
```

### フィルタリング

| オプション | 説明 | 例 |
|-----------|------|-----|
| `-I PATTERN` | パターンにマッチするものを除外 | `tree -I 'node_modules\|.git'` |
| `-P PATTERN` | パターンにマッチするものだけ表示 | `tree -P '*.py'` |
| `--gitignore` | .gitignoreのルールを適用 | `tree --gitignore` |
| `--prune` | 空のディレクトリを非表示 | `tree --prune` |
| `--matchdirs` | -Pのパターンをディレクトリにも適用 | `tree -P '*.ts' --matchdirs` |

```bash
# node_modules と .git を除外
tree -I 'node_modules|.git|dist|coverage'

# Pythonファイルだけ表示
tree -P '*.py' --prune

# .gitignore のルールに従って表示
tree --gitignore

# TypeScriptファイルだけ表示（空ディレクトリは非表示）
tree -P '*.ts|*.tsx' --prune
```

### ファイル情報の表示

| オプション | 説明 | 例 |
|-----------|------|-----|
| `-s` | ファイルサイズをバイトで表示 | `tree -s` |
| `-h` | サイズを人間に読みやすく表示 | `tree -h` |
| `--du` | ディレクトリの合計サイズ | `tree --du -h` |
| `-p` | パーミッションを表示 | `tree -p` |
| `-u` | 所有者を表示 | `tree -u` |
| `-g` | グループを表示 | `tree -g` |
| `-D` | 最終更新日時を表示 | `tree -D` |
| `--inodes` | inode番号を表示 | `tree --inodes` |

```bash
# ファイルサイズ付きで表示
tree -h

# サイズ + パーミッション + 更新日時
tree -hpD

# ディレクトリごとの合計サイズ
tree --du -h -d
```

### 出力形式

| オプション | 説明 | 例 |
|-----------|------|-----|
| `-o FILE` | ファイルに出力 | `tree -o tree.txt` |
| `-H URL` | HTML形式で出力 | `tree -H '.' -o tree.html` |
| `-J` | JSON形式で出力 | `tree -J` |
| `-X` | XML形式で出力 | `tree -X` |

```bash
# ファイルに保存
tree -L 3 -I 'node_modules' > structure.txt

# HTML形式で出力
tree -H '.' -o tree.html --noreport

# JSON形式で出力
tree -J -L 2
```

### ソート

```bash
# 名前の逆順
tree -r

# 更新日時順（新しい順）
tree -t

# ファイルサイズ順
tree --sort=size

# ディレクトリを先に表示
tree --dirsfirst
```

---

## 実践的な使用例

### プロジェクト構造のドキュメント化

```bash
# README用のディレクトリ構造を生成
tree -L 3 -I 'node_modules|.git|dist|coverage|__pycache__' --dirsfirst

# 出力例:
# .
# ├── src/
# │   ├── components/
# │   │   ├── Button.tsx
# │   │   └── Header.tsx
# │   ├── pages/
# │   │   ├── Home.tsx
# │   │   └── About.tsx
# │   ├── App.tsx
# │   └── main.tsx
# ├── tests/
# │   └── App.test.tsx
# ├── package.json
# ├── tsconfig.json
# └── README.md
```

### ディスク使用量の把握

```bash
# ディレクトリごとのサイズを確認
tree --du -h -d -L 2

# 大きなディレクトリを特定
tree --du -h -d -L 1 --sort=size
```

### 特定ファイルの分布を確認

```bash
# テストファイルの場所を確認
tree -P '*test*|*spec*' --prune

# 設定ファイルの場所を確認
tree -P '*.yaml|*.yml|*.json|*.toml' --prune -I 'node_modules'

# Dockerfileの場所を確認
tree -P 'Dockerfile*|docker-compose*' --prune
```

### クリップボードにコピー

```bash
# macOS
tree -L 2 --dirsfirst -I 'node_modules|.git' | pbcopy

# Linux（xclip）
tree -L 2 --dirsfirst -I 'node_modules|.git' | xclip -selection clipboard

# Windows（Git Bash）
tree -L 2 --dirsfirst -I 'node_modules|.git' | clip
```

---

## eza --tree との比較

ezaにもツリー表示機能がありますが、用途が少し異なります:

| 特徴 | tree | eza -T |
|------|------|--------|
| 主な用途 | ディレクトリ構造の可視化 | ファイル一覧の装飾表示 |
| Git統合 | なし | あり |
| アイコン | なし | あり |
| ファイル情報 | 詳細（-p, -u, -D等） | ls -l形式 |
| 出力形式 | テキスト, HTML, JSON, XML | テキストのみ |
| 除外パターン | `-I` | `-I` |
| .gitignore | `--gitignore` | `--git-ignore` |

用途に応じて使い分けましょう:
- **ドキュメント化・構造把握** → `tree`
- **日常的なファイル確認** → `eza -T`

---

## まとめ

- **tree**はディレクトリ構造を視覚的に把握するための定番ツール
- `-L`（深さ制限）、`-I`（除外パターン）、`-d`（ディレクトリのみ）が基本
- README やドキュメントにプロジェクト構造を記載する際に重宝する
- `--gitignore`オプションで.gitignoreのルールを適用できる
- `-J`（JSON）や`-H`（HTML）で構造化データとしても出力可能
