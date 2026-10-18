# Gitフック

## 概要

Gitフック（Git Hooks）は、特定のGitイベントが発生したときに自動的に実行されるスクリプトです。コミット前の検証、デプロイの自動化、通知の送信などに使用できます。

## Gitフックとは

Gitフックは、`.git/hooks/`ディレクトリに配置されるスクリプトです。特定のイベント（コミット、プッシュなど）が発生すると、対応するフックが自動的に実行されます。

### フックの種類

Gitフックには、クライアント側フックとサーバー側フックがあります：

- **クライアント側フック**: 開発者のマシンで実行
- **サーバー側フック**: Gitサーバーで実行

## フックの場所

```bash
# フックのディレクトリ
.git/hooks/

# フックの一覧
ls -la .git/hooks/
```

## クライアント側フック

### pre-commit

コミット前に実行されます。コミットを拒否できます。

```bash
#!/bin/sh
# .git/hooks/pre-commit

# テストを実行
npm test

# テストが失敗した場合、コミットを拒否
if [ $? -ne 0 ]; then
    echo "Tests failed. Commit aborted."
    exit 1
fi
```

### prepare-commit-msg

コミットメッセージエディタが開く前に実行されます。

```bash
#!/bin/sh
# .git/hooks/prepare-commit-msg

# コミットメッセージにテンプレートを追加
echo "[WIP] " >> "$1"
```

### commit-msg

コミットメッセージを検証します。

```bash
#!/bin/sh
# .git/hooks/commit-msg

# コミットメッセージの形式を検証
commit_msg=$(cat "$1")

if ! echo "$commit_msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore): "; then
    echo "Invalid commit message format."
    echo "Format: <type>: <description>"
    exit 1
fi
```

### post-commit

コミット後に実行されます。

```bash
#!/bin/sh
# .git/hooks/post-commit

# 通知を送信
echo "Commit completed: $(git log -1 --pretty=format:'%s')"
```

### pre-push

プッシュ前に実行されます。

```bash
#!/bin/sh
# .git/hooks/pre-push

# リモートにプッシュする前にテストを実行
npm test

if [ $? -ne 0 ]; then
    echo "Tests failed. Push aborted."
    exit 1
fi
```

## サーバー側フック

### pre-receive

リモートリポジトリへのプッシュを受け取る前に実行されます。

```bash
#!/bin/sh
# .git/hooks/pre-receive

# プッシュされたコミットを検証
while read oldrev newrev refname; do
    # コミットメッセージを検証
    git log --format=%B $oldrev..$newrev | while read message; do
        if ! echo "$message" | grep -qE "^(feat|fix|docs): "; then
            echo "Invalid commit message format."
            exit 1
        fi
    done
done
```

### update

各ブランチの更新前に実行されます。

```bash
#!/bin/sh
# .git/hooks/update

refname=$1
oldrev=$2
newrev=$3

# 特定のブランチを保護
if [ "$refname" = "refs/heads/main" ]; then
    # 直接プッシュを禁止
    echo "Direct push to main branch is not allowed."
    exit 1
fi
```

### post-receive

プッシュを受け取った後に実行されます。

```bash
#!/bin/sh
# .git/hooks/post-receive

# デプロイを実行
cd /path/to/production
git pull origin main
npm install
npm run build
systemctl restart myapp
```

## フックの作成

### 基本的なフックの作成

```bash
# 1. フックファイルを作成
touch .git/hooks/pre-commit

# 2. 実行権限を付与
chmod +x .git/hooks/pre-commit

# 3. スクリプトを記述
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
echo "Running pre-commit hook..."
# ここに処理を記述
EOF
```

### フックのテスト

```bash
# フックを直接実行
.git/hooks/pre-commit

# 実際の操作でテスト
git commit -m "Test commit"
```

## 実用的なフック例

### 例1: コミットメッセージの検証

```bash
#!/bin/sh
# .git/hooks/commit-msg

commit_msg=$(cat "$1")

# コミットメッセージが50文字以内か確認
if [ ${#commit_msg} -gt 50 ]; then
    echo "Commit message is too long (max 50 characters)."
    exit 1
fi

# コミットメッセージが空でないか確認
if [ -z "$commit_msg" ]; then
    echo "Commit message cannot be empty."
    exit 1
fi
```

### 例2: コードフォーマットの検証

```bash
#!/bin/sh
# .git/hooks/pre-commit

# ESLintを実行
npm run lint

if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix the errors."
    exit 1
fi
```

### 例3: テストの実行

```bash
#!/bin/sh
# .git/hooks/pre-commit

# テストを実行
npm test

if [ $? -ne 0 ]; then
    echo "Tests failed. Commit aborted."
    exit 1
fi
```

### 例4: 大容量ファイルの検出

```bash
#!/bin/sh
# .git/hooks/pre-commit

# 10MB以上のファイルを検出
large_files=$(git diff --cached --name-only | xargs ls -lh | awk '$5 ~ /[0-9]+M/ && $5+0 > 10 {print $9}')

if [ -n "$large_files" ]; then
    echo "Large files detected:"
    echo "$large_files"
    echo "Please use Git LFS for large files."
    exit 1
fi
```

### 例5: ブランチ名の検証

```bash
#!/bin/sh
# .git/hooks/pre-push

# ブランチ名を取得
branch=$(git symbolic-ref --short HEAD)

# ブランチ名の形式を検証
if ! echo "$branch" | grep -qE "^(feature|bugfix|hotfix|release)/"; then
    echo "Invalid branch name. Use feature/, bugfix/, hotfix/, or release/ prefix."
    exit 1
fi
```

## フックの共有

### 問題点

`.git/hooks/`ディレクトリはリポジトリに含まれないため、フックをチームで共有するには別の方法が必要です。

### 解決方法

#### 方法1: フックをバージョン管理に含める

```bash
# 1. フックを別のディレクトリに保存
mkdir -p .githooks
cp .git/hooks/pre-commit .githooks/pre-commit

# 2. リポジトリに追加
git add .githooks/pre-commit
git commit -m "Add pre-commit hook"

# 3. セットアップスクリプトを作成
cat > setup-hooks.sh << 'EOF'
#!/bin/sh
cp .githooks/* .git/hooks/
chmod +x .git/hooks/*
EOF

chmod +x setup-hooks.sh
```

#### 方法2: Huskyなどのツールを使用

Huskyは、Node.jsプロジェクトでGitフックを管理するツールです：

```bash
# インストール
npm install --save-dev husky

# セットアップ
npx husky install

# フックを追加
npx husky add .husky/pre-commit "npm test"
```

## フックの無効化

### 一時的に無効化

```bash
# 環境変数でスキップ
SKIP_HOOKS=1 git commit -m "Skip hooks"

# または、--no-verifyオプション
git commit --no-verify -m "Skip hooks"
git push --no-verify
```

### 永続的に無効化

```bash
# フックファイルを削除またはリネーム
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled
```

## トラブルシューティング

### フックが実行されない

```bash
# 実行権限を確認
ls -la .git/hooks/pre-commit

# 実行権限を付与
chmod +x .git/hooks/pre-commit

# フックの構文を確認
bash -n .git/hooks/pre-commit
```

### フックがエラーを返す

```bash
# フックを直接実行してデバッグ
.git/hooks/pre-commit

# エラーメッセージを確認
git commit -m "Test" 2>&1
```

## ベストプラクティス

1. **エラーハンドリング**: フック内で適切にエラーを処理
2. **パフォーマンス**: フックの実行時間を短く保つ
3. **メッセージ**: ユーザーに分かりやすいエラーメッセージを表示
4. **オプトアウト**: 緊急時にはフックをスキップできるようにする
5. **ドキュメント**: フックの目的と使用方法をドキュメント化

## 次のステップ

Gitフックを理解したら、ワークフロー編に進みましょう。

→ [Git Flow](01-Git-Flow.md)

