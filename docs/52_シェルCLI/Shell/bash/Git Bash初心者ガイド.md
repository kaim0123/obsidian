# Git Bash初心者ガイド

## 目次
1. [Git Bashとは](#git-bashとは)
2. [インストールと起動](#インストールと起動)
3. [基本的な画面構成](#基本的な画面構成)
4. [基本的なLinuxコマンド](#基本的なlinuxコマンド)
5. [ファイルとディレクトリ操作](#ファイルとディレクトリ操作)
6. [Gitの基本操作](#gitの基本操作)
7. [テキストエディタの使用](#テキストエディタの使用)
8. [シェルスクリプトの基礎](#シェルスクリプトの基礎)
9. [実践練習](#実践練習)
10. [よくあるエラーと対処法](#よくあるエラーと対処法)
11. [次のステップ](#次のステップ)

---

## Git Bashとは

**Git Bash**は、Git for Windowsに含まれるターミナルで、LinuxのBashシェル環境をWindows上で再現します。主にGit操作とLinuxコマンドの実行に使用されます。

### Git Bashの特徴
- **Linux互換**: Unix/Linuxコマンドが使用可能
- **Git最適化**: Git操作が非常に簡単
- **開発者向け**: プログラミング開発に最適
- **クロスプラットフォーム**: Linux、macOSと同じコマンド
- **無料**: オープンソースで無料利用可能

### なぜGit Bashを学ぶのか？
- **Git操作**: バージョン管理システムの操作
- **Linux学習**: Unix/Linux環境の理解
- **開発効率**: プログラミング開発の効率化
- **クロスプラットフォーム**: 異なるOS間での開発

---

## インストールと起動

### Git for Windowsのインストール
1. [Git for Windows](https://git-scm.com/download/win)からダウンロード
2. インストーラーを実行
3. デフォルト設定でインストール

### Git Bashの起動方法

#### 方法1: スタートメニューから
1. スタートボタンをクリック
2. 「Git Bash」と入力
3. 「Git Bash」をクリック

#### 方法2: 右クリックメニューから
1. エクスプローラーで任意のフォルダを右クリック
2. 「Git Bash Here」を選択

#### 方法3: デスクトップから
1. デスクトップを右クリック
2. 「Git Bash Here」を選択

---

## 基本的な画面構成

```
ユーザー名@コンピュータ名 MINGW64 /c/Users/ユーザー名
$
```

### 各部分の説明
- `ユーザー名@コンピュータ名`: 現在のユーザーとコンピュータ名
- `MINGW64`: Git Bashの環境を示す
- `/c/Users/ユーザー名`: 現在のディレクトリのパス（Linux形式）
- `$`: プロンプト（コマンド入力待ち状態）

### 重要なキー操作
- **Enter**: コマンドを実行
- **↑/↓**: コマンド履歴の移動
- **Tab**: ファイル名やコマンドの自動補完
- **Ctrl + C**: 実行中のコマンドを中断
- **Ctrl + D**: Git Bashを終了

---

## 基本的なLinuxコマンド

### 1. 現在のディレクトリを確認
```bash
pwd
```

### 2. ディレクトリ一覧の表示
```bash
ls
```

### 3. 詳細情報付きで表示
```bash
ls -l
```

### 4. 隠しファイルも表示
```bash
ls -a
```

### 5. ディレクトリの移動
```bash
cd ディレクトリ名
```

### 6. 新しいディレクトリの作成
```bash
mkdir ディレクトリ名
```

### 7. ディレクトリの削除
```bash
rmdir ディレクトリ名
```

### 8. ヘルプの表示
```bash
man コマンド名
```
または
```bash
コマンド名 --help
```

---

## ファイルとディレクトリ操作

### ファイル一覧の表示
```bash
# 基本的な表示
ls

# 詳細情報付きで表示
ls -l

# 隠しファイルも表示
ls -la

# 人間が読みやすい形式で表示
ls -lh

# 再帰的に表示（サブディレクトリも含む）
ls -R
```

### ファイルのコピー
```bash
cp 元ファイル コピー先
```

#### 例
```bash
cp file1.txt file2.txt
cp file1.txt /c/backup/
cp -r directory1 directory2
```

### ファイルの移動・リネーム
```bash
mv 元ファイル 移動先
```

#### 例
```bash
mv oldname.txt newname.txt
mv file.txt /c/backup/
```

### ファイルの削除
```bash
rm ファイル名
```

#### 例
```bash
rm file.txt
rm -r directory
rm -f file.txt  # 強制削除
```

### ファイルの内容表示
```bash
cat ファイル名
```

### ファイルの内容を書き込み
```bash
echo "内容" > ファイル名
```

### ファイルの内容を追加
```bash
echo "内容" >> ファイル名
```

---

## Gitの基本操作

### Gitの設定
```bash
# ユーザー名を設定
git config --global user.name "あなたの名前"

# メールアドレスを設定
git config --global user.email "your.email@example.com"

# 設定を確認
git config --list
```

### リポジトリの初期化
```bash
# 新しいリポジトリを作成
git init

# 既存のリポジトリをクローン
git clone https://github.com/username/repository.git
```

### 基本的なGit操作
```bash
# ファイルの状態を確認
git status

# ファイルをステージングエリアに追加
git add ファイル名
git add .  # すべてのファイルを追加

# コミットを作成
git commit -m "コミットメッセージ"

# コミット履歴を表示
git log

# ブランチ一覧を表示
git branch

# 新しいブランチを作成
git branch ブランチ名

# ブランチを切り替え
git checkout ブランチ名
```

### リモートリポジトリとの連携
```bash
# リモートリポジトリを追加
git remote add origin https://github.com/username/repository.git

# リモートリポジトリにプッシュ
git push origin main

# リモートリポジトリからプル
git pull origin main
```

---

## テキストエディタの使用

### nanoエディタ
```bash
# ファイルを開く
nano ファイル名

# 新しいファイルを作成
nano 新しいファイル名
```

#### nanoの基本操作
- **Ctrl + X**: 終了
- **Ctrl + O**: 保存
- **Ctrl + W**: 検索
- **Ctrl + K**: 行を切り取り
- **Ctrl + U**: 行を貼り付け

### vimエディタ
```bash
# ファイルを開く
vim ファイル名
```

#### vimの基本操作
- **i**: 挿入モードに入る
- **Esc**: コマンドモードに戻る
- **:w**: 保存
- **:q**: 終了
- **:wq**: 保存して終了
- **:q!**: 保存せずに終了

---

## シェルスクリプトの基礎

### 簡単なシェルスクリプトの作成
```bash
# スクリプトファイルを作成
nano myscript.sh
```

### スクリプトの内容例
```bash
#!/bin/bash

# シェルスクリプトの例
echo "こんにちは、Git Bash！"
echo "現在の時刻: $(date)"
echo "現在のディレクトリ: $(pwd)"

# ファイル一覧を表示
ls -la

# ユーザー入力を受け取る
read -p "あなたの名前を入力してください: " name
echo "こんにちは、$name さん！"
```

### スクリプトの実行
```bash
# 実行権限を付与
chmod +x myscript.sh

# スクリプトを実行
./myscript.sh
```

---

## 実践練習

### 練習1: 基本的なLinuxコマンド
```bash
# 1. 現在のディレクトリを確認
pwd

# 2. ディレクトリ一覧を表示
ls

# 3. 新しいフォルダを作成
mkdir gitbash_practice

# 4. 作成したフォルダに移動
cd gitbash_practice

# 5. 現在のディレクトリを確認
pwd
```

### 練習2: ファイル操作
```bash
# 1. テキストファイルを作成
echo "Hello Git Bash!" > test.txt

# 2. ファイルの内容を表示
cat test.txt

# 3. ファイルをコピー
cp test.txt test_copy.txt

# 4. ファイル一覧を確認
ls -la

# 5. コピーファイルを削除
rm test_copy.txt
```

### 練習3: Git操作
```bash
# 1. Gitリポジトリを初期化
git init

# 2. ファイルを作成
echo "# Git Bash練習" > README.md

# 3. ファイルをステージング
git add README.md

# 4. コミットを作成
git commit -m "Initial commit"

# 5. コミット履歴を確認
git log
```

### 練習4: シェルスクリプト
```bash
# 1. スクリプトファイルを作成
nano hello.sh

# 2. スクリプトの内容
#!/bin/bash
echo "Hello, Git Bash!"
echo "現在の時刻: $(date)"
echo "現在のディレクトリ: $(pwd)"

# 3. 実行権限を付与
chmod +x hello.sh

# 4. スクリプトを実行
./hello.sh
```

---

## よくあるエラーと対処法

### 1. コマンドが見つからない
```bash
bash: コマンド名: command not found
```
**原因**: コマンド名のスペルミスまたは存在しないコマンド
**対処法**: 
- コマンド名を正確に入力
- `which コマンド名`でコマンドの場所を確認
- `man コマンド名`でヘルプを確認

### 2. 権限がありません
```bash
Permission denied
```
**原因**: ファイルやディレクトリへのアクセス権限がない
**対処法**: 
- `chmod +x ファイル名`で実行権限を付与
- `sudo`コマンドで管理者権限で実行（Windowsでは制限あり）

### 3. ファイルが見つかりません
```bash
No such file or directory
```
**原因**: ファイル名やパスが間違っている
**対処法**: 
- `ls`でファイル一覧を確認
- パスが正しいか確認
- ファイル名を正確に入力

### 4. Gitの設定エラー
```bash
fatal: user.name not configured
```
**原因**: Gitの設定が完了していない
**対処法**: 
```bash
git config --global user.name "あなたの名前"
git config --global user.email "your.email@example.com"
```

---

## 便利なテクニック

### 1. タブ補完
コマンド名やファイル名の途中まで入力してTabキーを押すと、自動補完されます。

### 2. コマンド履歴
```bash
# コマンド履歴を表示
history

# 特定のコマンドを実行
!番号

# 最後のコマンドを再実行
!!
```

### 3. エイリアスの設定
```bash
# エイリアスを作成
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'

# エイリアス一覧を表示
alias

# エイリアスを削除
unalias ll
```

### 4. 環境変数の設定
```bash
# 環境変数を設定
export MY_VAR="Hello World"

# 環境変数を表示
echo $MY_VAR

# 環境変数一覧を表示
env
```

### 5. パイプラインの活用
```bash
# ファイル一覧を取得して、テキストファイルのみ表示
ls | grep .txt

# ファイルの内容を表示して、特定の行を抽出
cat file.txt | grep "keyword"

# ファイルの行数をカウント
wc -l file.txt
```

---

## 次のステップ

### 1. より高度なLinuxコマンドを学習
- `grep`: テキスト検索
- `sed`: テキスト編集
- `awk`: テキスト処理
- `find`: ファイル検索
- `tar`: アーカイブ作成・展開

### 2. Gitの高度な機能
- ブランチの管理
- マージとコンフリクト解決
- リベース
- タグの管理
- フックの設定

### 3. シェルスクリプトの作成
- 条件分岐（if文）
- ループ（for文、while文）
- 関数の定義
- エラーハンドリング

### 4. 開発環境の構築
- パッケージマネージャーの使用
- 開発ツールのインストール
- 環境設定の自動化

### 5. クラウド開発
- GitHub Actions
- 継続的インテグレーション
- デプロイメント自動化

---

## まとめ

Git Bashは、Windows環境でLinuxコマンドとGit操作を学ぶのに最適なツールです。このガイドで学んだ内容を基に、実際にコマンドを入力して練習してください。

### 学習のポイント
1. **Linuxコマンドの習得**: 基本的なファイル操作から始める
2. **Git操作の理解**: バージョン管理の概念を理解する
3. **シェルスクリプト**: 自動化の基礎を学ぶ
4. **実践重視**: 実際のプロジェクトでGit Bashを使用する
5. **継続学習**: 新しいコマンドや機能を積極的に学習する

### 推奨学習順序
1. **基本コマンド**: `ls`, `cd`, `pwd`, `mkdir`, `rm`など
2. **ファイル操作**: `cp`, `mv`, `cat`, `echo`など
3. **Git操作**: `git init`, `git add`, `git commit`など
4. **シェルスクリプト**: 基本的なスクリプト作成
5. **高度な機能**: パイプライン、エイリアス、環境変数など

次のステップとして、より高度なLinuxコマンドや、他の開発ツールとの連携を学習することをお勧めします！

---

*このガイドが皆様のGit Bash学習の一助となれば幸いです。*
