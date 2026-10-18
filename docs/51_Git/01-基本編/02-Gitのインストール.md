# Gitのインストール

## 概要

Gitを使用するには、まずお使いのオペレーティングシステムにGitをインストールする必要があります。このドキュメントでは、主要なOSでのインストール方法を詳しく説明します。

## インストール前の確認

既にGitがインストールされているか確認するには、ターミナル（コマンドプロンプト）で以下のコマンドを実行します：

```bash
git --version
```

バージョン番号が表示されれば、Gitは既にインストールされています。

## Windowsでのインストール

### 方法1: 公式インストーラーを使用（推奨）

1. **Git公式サイトにアクセス**
   - URL: https://git-scm.com/download/win
   - 自動的に最新版のダウンロードが開始されます

2. **インストーラーの実行**
   - ダウンロードした`.exe`ファイルを実行
   - セットアップウィザードが起動します

3. **インストールオプションの選択**
   - **エディタの選択**: デフォルトはVimですが、お好みのエディタを選択可能
   - **PATH環境変数**: "Git from the command line and also from 3rd-party software"を推奨
   - **改行コードの処理**: "Checkout Windows-style, commit Unix-style line endings"を推奨
   - **ターミナルエミュレータ**: WindowsのデフォルトコンソールまたはMinTTYを選択

4. **インストールの完了**
   - インストールが完了したら、Git Bashまたはコマンドプロンプトで動作確認

### 方法2: Chocolateyを使用

Chocolateyがインストールされている場合：

```powershell
choco install git
```

### 方法3: Wingetを使用（Windows 10/11）

```powershell
winget install --id Git.Git -e --source winget
```

### インストール後の確認

コマンドプロンプトまたはPowerShellで：

```bash
git --version
```

## macOSでのインストール

### 方法1: Homebrewを使用（推奨）

1. **Homebrewのインストール**（未インストールの場合）
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Gitのインストール**
   ```bash
   brew install git
   ```

### 方法2: Xcode Command Line Toolsを使用

```bash
xcode-select --install
```

これにより、Gitも含む開発ツールがインストールされます。

### 方法3: 公式インストーラーを使用

1. https://git-scm.com/download/mac にアクセス
2. インストーラーをダウンロードして実行

### インストール後の確認

ターミナルで：

```bash
git --version
```

## Linuxでのインストール

### Debian/Ubuntu系

```bash
sudo apt update
sudo apt install git
```

### Red Hat/CentOS/Fedora系

```bash
# Fedora
sudo dnf install git

# CentOS/RHEL
sudo yum install git
```

### Arch Linux

```bash
sudo pacman -S git
```

### インストール後の確認

```bash
git --version
```

## Gitの初期設定

インストール後、最初にユーザー情報を設定する必要があります。

### ユーザー名とメールアドレスの設定

```bash
git config --global user.name "あなたの名前"
git config --global user.email "your.email@example.com"
```

### 設定の確認

```bash
git config --list
```

### 個別の設定確認

```bash
git config user.name
git config user.email
```

## よく使用される設定

### デフォルトエディタの設定

```bash
# Vimを使用する場合
git config --global core.editor "vim"

# VS Codeを使用する場合
git config --global core.editor "code --wait"

# nanoを使用する場合
git config --global core.editor "nano"
```

### 改行コードの自動変換設定

```bash
# Windowsの場合（推奨）
git config --global core.autocrlf true

# macOS/Linuxの場合
git config --global core.autocrlf input
```

### デフォルトブランチ名の設定

```bash
git config --global init.defaultBranch main
```

### カラー表示の有効化

```bash
git config --global color.ui auto
```

### エイリアスの設定

よく使用するコマンドに短いエイリアスを設定できます：

```bash
# ステータス確認を短縮
git config --global alias.st status

# ログをグラフ表示
git config --global alias.lg "log --oneline --graph --decorate --all"

# コミットを短縮
git config --global alias.ci commit
```

使用例：
```bash
git st  # git status と同じ
git lg  # グラフ表示のログ
```

## 設定ファイルの場所

- **グローバル設定**: `~/.gitconfig`（ホームディレクトリ）
- **ローカル設定**: 各リポジトリの`.git/config`

## トラブルシューティング

### コマンドが見つからない

- PATH環境変数にGitが追加されているか確認
- ターミナルを再起動してみる

### 権限エラー（Linux/macOS）

```bash
sudo chmod +x /usr/local/bin/git
```

### 古いバージョンがインストールされている

最新版にアップデート：

```bash
# Homebrew (macOS)
brew upgrade git

# apt (Debian/Ubuntu)
sudo apt update && sudo apt upgrade git
```

## 次のステップ

Gitのインストールと初期設定が完了したら、実際にリポジトリを作成して使い始めましょう。

→ [リポジトリの作成と初期化](03-リポジトリの作成と初期化.md)

