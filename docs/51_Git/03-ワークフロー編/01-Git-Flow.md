# Git Flow

## 概要

Git Flowは、Vincent Driessenによって提唱されたGitブランチ戦略です。明確なブランチ構造とリリースプロセスを定義し、大規模なプロジェクトやチーム開発に適しています。

## Git Flowのブランチ構造

### メインブランチ

#### main（またはmaster）

- **役割**: 本番環境にデプロイ可能なコード
- **特徴**: 常に安定した状態を保つ
- **保護**: 直接コミットは避け、マージのみ

#### develop

- **役割**: 開発の統合ブランチ
- **特徴**: 次のリリースに向けた開発が統合される
- **保護**: 機能ブランチからマージされる

### サポートブランチ

#### feature/*

- **役割**: 新機能の開発
- **作成元**: `develop`
- **マージ先**: `develop`
- **命名**: `feature/user-authentication`, `feature/payment-system`

#### release/*

- **役割**: リリース準備
- **作成元**: `develop`
- **マージ先**: `main`と`develop`
- **命名**: `release/v1.0.0`, `release/2024-01`

#### hotfix/*

- **役割**: 本番環境の緊急修正
- **作成元**: `main`
- **マージ先**: `main`と`develop`
- **命名**: `hotfix/security-patch`, `hotfix/critical-bug`

## Git Flowのインストール

### インストール方法

```bash
# macOS
brew install git-flow-avh

# Linux
apt-get install git-flow

# Windows (Git for Windowsに含まれる)
```

### 初期化

```bash
# リポジトリでGit Flowを初期化
git flow init

# 対話形式で設定
# - Production release branch: main
# - Development branch: develop
# - Feature branch prefix: feature/
# - Release branch prefix: release/
# - Hotfix branch prefix: hotfix/
# - Support branch prefix: support/
```

## 機能開発のワークフロー

### 機能ブランチの作成

```bash
# Git Flowコマンドを使用
git flow feature start user-authentication

# または、手動で作成
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication
```

### 機能の開発

```bash
# 機能ブランチで作業
git add .
git commit -m "Implement user authentication"

# 定期的にdevelopから最新の変更を取り込む
git checkout develop
git pull origin develop
git checkout feature/user-authentication
git merge develop
```

### 機能の完了

```bash
# Git Flowコマンドを使用
git flow feature finish user-authentication

# または、手動でマージ
git checkout develop
git merge --no-ff feature/user-authentication
git branch -d feature/user-authentication
git push origin develop
```

## リリースのワークフロー

### リリースブランチの作成

```bash
# Git Flowコマンドを使用
git flow release start 1.0.0

# または、手動で作成
git checkout develop
git checkout -b release/1.0.0
```

### リリース準備

```bash
# バージョン番号の更新
# ... ファイルを編集 ...

# コミット
git add .
git commit -m "Bump version to 1.0.0"

# バグ修正（必要に応じて）
# ... バグを修正 ...
git commit -m "Fix release bugs"
```

### リリースの完了

```bash
# Git Flowコマンドを使用
git flow release finish 1.0.0

# タグメッセージを入力
# リリースブランチがmainとdevelopにマージされる

# または、手動で完了
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"
git checkout develop
git merge --no-ff release/1.0.0
git branch -d release/1.0.0
git push origin main
git push origin develop
git push origin v1.0.0
```

## ホットフィックスのワークフロー

### ホットフィックスブランチの作成

```bash
# Git Flowコマンドを使用
git flow hotfix start security-patch

# または、手動で作成
git checkout main
git checkout -b hotfix/security-patch
```

### 緊急修正

```bash
# バグを修正
# ... 修正 ...

# コミット
git add .
git commit -m "Fix security vulnerability"

# バージョン番号を更新
# ... ファイルを編集 ...
git commit -m "Bump version to 1.0.1"
```

### ホットフィックスの完了

```bash
# Git Flowコマンドを使用
git flow hotfix finish security-patch

# または、手動で完了
git checkout main
git merge --no-ff hotfix/security-patch
git tag -a v1.0.1 -m "Hotfix: Security patch"
git checkout develop
git merge --no-ff hotfix/security-patch
git branch -d hotfix/security-patch
git push origin main
git push origin develop
git push origin v1.0.1
```

## Git Flowコマンド一覧

### 機能ブランチ

```bash
# 機能ブランチの開始
git flow feature start <name>

# 機能ブランチの公開
git flow feature publish <name>

# 機能ブランチの取得
git flow feature pull <remote> <name>

# 機能ブランチの完了
git flow feature finish <name>
```

### リリースブランチ

```bash
# リリースブランチの開始
git flow release start <version>

# リリースブランチの公開
git flow release publish <version>

# リリースブランチの完了
git flow release finish <version>
```

### ホットフィックスブランチ

```bash
# ホットフィックスブランチの開始
git flow hotfix start <version>

# ホットフィックスブランチの完了
git flow hotfix finish <version>
```

## 実践例

### 例1: 新機能の開発からリリースまで

```bash
# 1. 機能ブランチを作成
git flow feature start new-feature

# 2. 開発
# ... コードを実装 ...
git add .
git commit -m "Implement new feature"

# 3. 機能を完了
git flow feature finish new-feature

# 4. リリース準備
git flow release start 1.1.0
# ... リリース準備 ...
git flow release finish 1.1.0

# 5. デプロイ
git checkout main
git push origin main --tags
```

### 例2: 緊急修正

```bash
# 1. ホットフィックスブランチを作成
git flow hotfix start 1.0.1

# 2. 修正
# ... バグを修正 ...
git add .
git commit -m "Fix critical bug"

# 3. ホットフィックスを完了
git flow hotfix finish 1.0.1

# 4. デプロイ
git checkout main
git push origin main --tags
```

## Git Flowの利点

1. **明確な構造**: ブランチの役割が明確
2. **リリース管理**: リリースプロセスが体系化
3. **並行開発**: 複数の機能を並行して開発可能
4. **緊急対応**: ホットフィックスで迅速に対応

## Git Flowの欠点

1. **複雑さ**: ブランチ構造が複雑
2. **オーバーヘッド**: 小規模プロジェクトには過剰
3. **学習コスト**: チーム全体が理解する必要がある

## ベストプラクティス

1. **ブランチの保護**: mainとdevelopブランチを保護
2. **定期的なマージ**: developブランチを定期的に更新
3. **リリースノート**: リリースごとにリリースノートを作成
4. **タグの管理**: すべてのリリースにタグを付ける

## 次のステップ

Git Flowを理解したら、GitHub Flowを学びましょう。

→ [GitHub Flow](02-GitHub-Flow.md)

