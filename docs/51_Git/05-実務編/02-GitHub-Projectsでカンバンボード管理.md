# GitHub Projectsでカンバンボード管理

## 概要

GitHub Projectsは、カンバンボード形式でプロジェクトの進捗を視覚的に管理できる機能です。Issuesやプルリクエストと連携することで、タスクの状態をリアルタイムで追跡できます。

## GitHub Projectsとは

GitHub Projectsは、以下の2つのタイプがあります：

1. **Classic Projects**: 従来のプロジェクトボード
2. **Projects (beta)**: 新しいプロジェクト管理機能（テーブルビューとボードビュー）

この章では、両方の使い方を説明します。

## Classic Projects

### プロジェクトボードの作成

1. **リポジトリのページで「Projects」タブをクリック**
2. **「New project」をクリック**
3. **プロジェクト名と説明を入力**
4. **「Create project」をクリック**

### カラムの設定

デフォルトのカラム：
- **To do**: 未着手のタスク
- **In progress**: 進行中のタスク
- **Done**: 完了したタスク

カスタムカラムの追加：
1. **「Add column」をクリック**
2. **カラム名を入力**
3. **「Create column」をクリック**

推奨カラム構成：
- **Backlog**: バックログ
- **To do**: 未着手
- **In progress**: 進行中
- **Review**: レビュー中
- **Testing**: テスト中
- **Done**: 完了

### Issueやプルリクエストの追加

1. **カラム内で「Add cards」をクリック**
2. **Issueやプルリクエストを選択**
3. **カードが追加される**

### カードの移動

ドラッグ＆ドロップでカードをカラム間で移動できます。これにより、タスクの進捗を視覚的に管理できます。

### 自動化の設定

各カラムに自動化ルールを設定できます：

1. **カラムの設定（歯車アイコン）をクリック**
2. **「Manage automation」をクリック**
3. **自動化ルールを設定**

例：
- **「In progress」カラム**: ラベル`status: in-progress`が付いたら自動的に追加
- **「Review」カラム**: プルリクエストが作成されたら自動的に追加
- **「Done」カラム**: Issueが閉じられたら自動的に追加

## Projects (beta)

### 新しいプロジェクトの作成

1. **リポジトリのページで「Projects」タブをクリック**
2. **「New project」をクリック**
3. **「Board」または「Table」を選択**
4. **プロジェクト名を入力**
5. **「Create」をクリック**

### ボードビュー

カンバンボード形式でタスクを管理：

1. **「+ Add item」をクリック**
2. **IssueやDraft issueを追加**
3. **カードをドラッグ＆ドロップで移動**

### テーブルビュー

スプレッドシート形式でタスクを管理：

1. **「+ Add item」をクリック**
2. **IssueやDraft issueを追加**
3. **フィールドを編集**

### フィールドのカスタマイズ

以下のフィールドを追加・編集できます：

- **Status**: ステータス（To do, In progress, Doneなど）
- **Priority**: 優先度
- **Assignee**: 担当者
- **Labels**: ラベル
- **Milestone**: マイルストーン
- **Custom fields**: カスタムフィールド

### フィルターとソート

1. **「Filter」をクリック**
2. **条件を設定**（ラベル、担当者、マイルストーンなど）
3. **「Sort」で並び替え**

### ビューの保存

よく使用するフィルターやソートをビューとして保存：

1. **フィルターやソートを設定**
2. **「Save view」をクリック**
3. **ビュー名を入力**

## IssueとProjectsの連携

### 自動的な連携

Issueやプルリクエストを作成・更新すると、Projectsに自動的に反映されます：

- **Issue作成**: デフォルトのカラムに追加
- **ラベル変更**: 対応するカラムに移動
- **プルリクエスト作成**: 自動的に追加
- **マージ**: 「Done」カラムに移動

### 手動での連携

1. **Issueやプルリクエストのサイドバーで「Projects」をクリック**
2. **プロジェクトを選択**
3. **カラムを選択**

## 実践的なワークフロー

### 例1: 機能開発のワークフロー

```bash
# 1. Issueを作成
# GitHub上で新機能のIssueを作成
# ラベル: feature, priority: medium

# 2. プロジェクトボードで確認
# 「To do」カラムにIssueが表示される

# 3. 作業開始
# Issueにラベル`status: in-progress`を追加
# プロジェクトボードで「In progress」カラムに移動

# 4. ブランチを作成
git checkout -b feature/123-new-feature

# 5. 開発とコミット
git commit -m "Implement new feature - refs #123"

# 6. プルリクエストを作成
git push origin feature/123-new-feature
# プルリクエストが「Review」カラムに自動的に追加

# 7. レビューとマージ
# レビュー完了後、マージ
# Issueが自動的に閉じられ、「Done」カラムに移動
```

### 例2: バグ修正のワークフロー

```bash
# 1. バグIssueを作成
# ラベル: bug, priority: high

# 2. 緊急対応として「In progress」に移動

# 3. ホットフィックスブランチを作成
git checkout -b hotfix/456-critical-bug

# 4. 修正を実装
git commit -m "Fix critical bug - fixes #456"

# 5. プルリクエストを作成
# 自動的に「Review」カラムに追加

# 6. 緊急マージ
# マージ後、「Done」カラムに移動
```

## 自動化の設定

### GitHub Actionsで自動化

```yaml
# .github/workflows/project-automation.yml
name: Project Automation

on:
  issues:
    types: [opened, labeled]
  pull_request:
    types: [opened, closed]

jobs:
  update-project:
    runs-on: ubuntu-latest
    steps:
      - name: Move to In Progress
        if: contains(github.event.label.name, 'status: in-progress')
        uses: alex-page/github-project-automation-plus@v0.8.1
        with:
          project: My Project
          column: In Progress
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

## ベストプラクティス

1. **明確なカラム構成**: チームのワークフローに合わせたカラム構成
2. **自動化の活用**: 手動操作を減らし、自動化を活用
3. **定期的な確認**: プロジェクトボードを定期的に確認
4. **カードの整理**: 完了したタスクは定期的にアーカイブ
5. **ビューの活用**: よく使用するフィルターをビューとして保存

## トラブルシューティング

### カードが自動的に移動しない

自動化ルールが正しく設定されているか確認：

1. **カラムの設定を確認**
2. **自動化ルールを再設定**
3. **GitHub Actionsのログを確認**

### プロジェクトが見つからない

1. **リポジトリの「Projects」タブを確認**
2. **組織レベルのプロジェクトを確認**
3. **権限を確認**

## 次のステップ

GitHub Projectsを理解したら、マイルストーンとラベルの活用を学びましょう。

→ [マイルストーンとラベルの活用](03-マイルストーンとラベルの活用.md)

