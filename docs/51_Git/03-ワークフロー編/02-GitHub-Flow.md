# GitHub Flow

## 概要

GitHub Flowは、GitHubが推奨するシンプルなブランチ戦略です。Git Flowよりもシンプルで、継続的デプロイメント（CD）に適しています。

## GitHub Flowの原則

1. **mainブランチは常にデプロイ可能**: mainブランチは常に本番環境にデプロイできる状態
2. **機能ブランチで作業**: 新しい機能はブランチを作成して開発
3. **プルリクエストでレビュー**: 変更はプルリクエストを通じてレビュー
4. **マージ後は即座にデプロイ**: マージされたらすぐにデプロイ

## GitHub Flowのブランチ構造

### mainブランチ

- **役割**: 本番環境にデプロイ可能なコード
- **特徴**: 常に安定した状態
- **保護**: 直接コミットは避け、プルリクエスト経由でマージ

### 機能ブランチ

- **役割**: 新機能やバグ修正の開発
- **作成元**: `main`
- **マージ先**: `main`
- **命名**: 機能や修正内容を表す名前（例: `add-user-login`, `fix-payment-bug`）

## 基本的なワークフロー

### 1. 機能ブランチの作成

```bash
# mainブランチを最新の状態に更新
git checkout main
git pull origin main

# 機能ブランチを作成
git checkout -b add-user-authentication
```

### 2. 開発とコミット

```bash
# 機能を実装
# ... コードを編集 ...

# 変更をコミット
git add .
git commit -m "Add user authentication feature"

# 複数のコミットを作成
git add file1.js
git commit -m "Implement login form"
git add file2.js
git commit -m "Add authentication logic"
```

### 3. リモートにプッシュ

```bash
# ブランチをリモートにプッシュ
git push -u origin add-user-authentication
```

### 4. プルリクエストの作成

GitHub上で：

1. "New Pull Request"をクリック
2. ベースブランチ（main）と比較ブランチ（add-user-authentication）を選択
3. タイトルと説明を記入
4. レビュアーを指定
5. "Create Pull Request"をクリック

### 5. コードレビュー

- レビュアーがコードを確認
- コメントや変更要求に対応
- 必要に応じて追加のコミット

```bash
# レビューコメントに対応
# ... コードを修正 ...
git add .
git commit -m "Address review comments"
git push origin add-user-authentication
```

### 6. マージとデプロイ

- レビューが完了したらマージ
- マージ後、自動的にデプロイ（CI/CDが設定されている場合）

```bash
# マージ後、ローカルのmainブランチを更新
git checkout main
git pull origin main

# 不要になったブランチを削除
git branch -d add-user-authentication
```

## プルリクエストのベストプラクティス

### 良いプルリクエスト

1. **明確なタイトル**: 変更内容が分かるタイトル
2. **詳細な説明**: 変更の理由と内容を説明
3. **小さな変更**: 1つのプルリクエストは1つの機能に集中
4. **テスト**: 変更がテストされていることを確認

### プルリクエストのテンプレート

```markdown
## 変更内容
- ユーザー認証機能を追加

## 変更理由
- ユーザーがログインできるようにする必要があった

## テスト
- [ ] ログインフォームのテスト
- [ ] 認証ロジックのテスト
- [ ] エラーハンドリングのテスト

## スクリーンショット
（必要に応じて）

## 関連Issue
Closes #123
```

## 継続的インテグレーション（CI）

### GitHub Actionsの例

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
      - name: Run linter
        run: npm run lint
```

## デプロイメント

### 自動デプロイの設定

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          # デプロイスクリプト
          ./deploy.sh
```

## 実践例

### 例1: 新機能の追加

```bash
# 1. ブランチを作成
git checkout main
git pull origin main
git checkout -b add-dark-mode

# 2. 開発
# ... ダークモードを実装 ...
git add .
git commit -m "Add dark mode feature"
git push -u origin add-dark-mode

# 3. プルリクエストを作成（GitHub上）
# 4. レビューとマージ
# 5. デプロイ（自動）
```

### 例2: バグ修正

```bash
# 1. ブランチを作成
git checkout main
git pull origin main
git checkout -b fix-login-error

# 2. 修正
# ... バグを修正 ...
git add .
git commit -m "Fix login error"
git push -u origin fix-login-error

# 3. プルリクエストを作成
# 4. 緊急マージとデプロイ
```

### 例3: 複数のコミット

```bash
# 1. ブランチを作成
git checkout -b refactor-user-service

# 2. 段階的にコミット
git add user-service.js
git commit -m "Refactor user service: Extract validation"

git add user-repository.js
git commit -m "Refactor user service: Extract data access"

git add user-controller.js
git commit -m "Refactor user service: Update controller"

# 3. プッシュ
git push -u origin refactor-user-service

# 4. プルリクエストで全体をレビュー
```

## GitHub Flowの利点

1. **シンプル**: 理解しやすい構造
2. **迅速**: デプロイまでの時間が短い
3. **継続的デプロイ**: 自動デプロイに適している
4. **透明性**: プルリクエストで変更が可視化

## GitHub Flowの欠点

1. **リリース管理**: リリースブランチがない
2. **並行リリース**: 複数のバージョンの管理が困難
3. **ロールバック**: 本番環境の問題への対応が迅速さに依存

## ベストプラクティス

1. **小さなプルリクエスト**: 1つのプルリクエストは1つの機能に集中
2. **迅速なマージ**: レビューが完了したら迅速にマージ
3. **自動テスト**: CI/CDで自動的にテストを実行
4. **デプロイの自動化**: マージ後は自動的にデプロイ

## 次のステップ

GitHub Flowを理解したら、Trunk Based Developmentを学びましょう。

→ [Trunk Based Development](03-Trunk-Based-Development.md)

