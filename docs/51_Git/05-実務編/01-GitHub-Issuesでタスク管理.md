# GitHub Issuesでタスク管理

## 概要

GitHub Issuesは、プロジェクトのタスク、バグ、機能要望などを管理するための強力なツールです。Gitのブランチやコミットと連携することで、開発プロセス全体を一元管理できます。

## Issuesとは

GitHub Issuesは、プロジェクトの課題やタスクを追跡するためのチケットシステムです。各Issueには以下の情報を含めることができます：

- **タイトル**: Issueの概要
- **説明**: 詳細な説明や要件
- **ラベル**: カテゴリや優先度
- **マイルストーン**: リリースや目標との関連付け
- **担当者**: 責任者やレビュアー
- **コメント**: 議論や進捗の記録

## Issueの作成

### 基本的なIssue作成

1. **リポジトリのページで「Issues」タブをクリック**
2. **「New Issue」ボタンをクリック**
3. **タイトルと説明を入力**

```markdown
## 概要
ユーザー認証機能を追加する

## 要件
- ログイン機能
- パスワードリセット機能
- セッション管理

## 関連Issue
#123

## チェックリスト
- [ ] ログインフォームの実装
- [ ] 認証ロジックの実装
- [ ] テストの作成
```

### Issueテンプレートの使用

プロジェクトでIssueテンプレートを作成すると、一貫性のあるIssueを作成できます。

`.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: バグレポート
about: バグを報告するためのテンプレート
title: '[BUG] '
labels: bug
assignees: ''
---

## バグの説明
バグの簡潔な説明

## 再現手順
1. '...'に移動
2. '...'をクリック
3. エラーが発生

## 期待される動作
何が起こるべきか

## スクリーンショット
可能であればスクリーンショットを追加

## 環境
- OS: [例: iOS]
- ブラウザ: [例: Chrome 90]
- バージョン: [例: 1.0.0]

## 追加のコンテキスト
その他の情報
```

## ラベルの活用

### ラベルの作成

1. **「Issues」→「Labels」をクリック**
2. **「New label」をクリック**
3. **名前、説明、色を設定**

### 推奨ラベル

#### 種類（Type）
- `bug`: バグ報告
- `feature`: 新機能
- `enhancement`: 機能改善
- `documentation`: ドキュメント関連
- `question`: 質問
- `refactor`: リファクタリング

#### 優先度（Priority）
- `priority: critical`: 緊急
- `priority: high`: 高
- `priority: medium`: 中
- `priority: low`: 低

#### ステータス（Status）
- `status: todo`: 未着手
- `status: in-progress`: 進行中
- `status: review`: レビュー中
- `status: done`: 完了

### ラベルの一括管理

```bash
# GitHub CLIを使用してラベルを作成
gh label create "priority: high" --color "d73a4a" --description "High priority"
gh label create "priority: medium" --color "fbca04" --description "Medium priority"
gh label create "priority: low" --color "0e8a16" --description "Low priority"
```

## マイルストーンの活用

### マイルストーンの作成

1. **「Issues」→「Milestones」をクリック**
2. **「New milestone」をクリック**
3. **タイトル、説明、期限を設定**

### マイルストーンの例

- **v1.0.0 Release**: バージョン1.0.0のリリース
- **Q1 2024**: 2024年第1四半期の目標
- **Sprint 1**: スプリント1の目標

### Issueとマイルストーンの関連付け

Issue作成時や編集時に、マイルストーンを選択できます。これにより、リリース計画やスプリント計画を可視化できます。

## Issueとブランチの連携

### ブランチ名にIssue番号を含める

```bash
# Issue #123 に対応するブランチを作成
git checkout -b feature/123-user-authentication

# または、より詳細に
git checkout -b feature/123-add-user-login
```

### コミットメッセージでIssueを参照

```bash
# Issueを閉じる
git commit -m "Add user authentication - closes #123"

# Issueを参照するだけ
git commit -m "Implement login form - refs #123"

# 複数のIssueを参照
git commit -m "Fix multiple bugs - fixes #123, #124, #125"
```

### プルリクエストでIssueを自動的に閉じる

プルリクエストの説明に以下のキーワードを含めると、マージ時にIssueが自動的に閉じられます：

- `closes #123`
- `fixes #123`
- `resolves #123`

## Issueの検索とフィルタリング

### 基本的な検索

```
# ラベルで検索
label:bug

# 担当者で検索
assignee:username

# マイルストーンで検索
milestone:"v1.0.0"

# 状態で検索
is:open
is:closed
```

### 高度な検索

```
# 複数の条件を組み合わせ
label:bug label:priority:high is:open

# 日付で検索
created:>2024-01-01

# コメント数で検索
comments:>5
```

## Issueのライフサイクル管理

### 基本的なワークフロー

1. **作成**: 新しいIssueを作成
2. **割り当て**: 担当者を割り当て
3. **作業開始**: ラベルを`status: in-progress`に変更
4. **レビュー**: ラベルを`status: review`に変更
5. **完了**: Issueを閉じる

### GitHub Actionsで自動化

```yaml
# .github/workflows/issue-auto-label.yml
name: Auto Label Issues

on:
  issues:
    types: [opened]

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - name: Add label
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.addLabels({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              labels: ['triage']
            })
```

## 実践例

### 例1: バグ報告から修正まで

```bash
# 1. Issueを作成（GitHub上）
# タイトル: [BUG] ログインボタンがクリックできない
# ラベル: bug, priority: high

# 2. ブランチを作成
git checkout -b bugfix/456-fix-login-button

# 3. 修正を実装
# ... コードを修正 ...
git add .
git commit -m "Fix login button click handler - fixes #456"

# 4. プッシュしてプルリクエストを作成
git push origin bugfix/456-fix-login-button

# 5. プルリクエストの説明に以下を追加
# Fixes #456
```

### 例2: 新機能の開発

```bash
# 1. Issueを作成（GitHub上）
# タイトル: [FEATURE] ユーザー認証機能
# ラベル: feature, priority: medium
# マイルストーン: v1.0.0

# 2. ブランチを作成
git checkout -b feature/123-user-authentication

# 3. 段階的にコミット
git commit -m "Add login form - refs #123"
git commit -m "Implement authentication logic - refs #123"
git commit -m "Add tests - refs #123"

# 4. プルリクエストを作成
git push origin feature/123-user-authentication

# 5. プルリクエストの説明
# Implements #123
# 
# ## 変更内容
# - ログインフォームの追加
# - 認証ロジックの実装
# - テストの追加
```

## ベストプラクティス

1. **明確なタイトル**: Issueの内容が一目で分かるタイトル
2. **詳細な説明**: 要件や背景を詳しく記述
3. **チェックリスト**: タスクを細分化してチェックリスト化
4. **関連付け**: 関連するIssueやプルリクエストをリンク
5. **定期的な更新**: 進捗状況をコメントで更新

## 次のステップ

GitHub Issuesを理解したら、GitHub Projectsでカンバンボード管理を学びましょう。

→ [GitHub Projectsでカンバンボード管理](02-GitHub-Projectsでカンバンボード管理.md)

