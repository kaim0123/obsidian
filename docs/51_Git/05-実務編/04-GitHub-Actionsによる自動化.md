# GitHub Actionsによる自動化

## 概要

GitHub Actionsを使用すると、プロジェクト管理の多くのタスクを自動化できます。Issueの自動ラベル付け、マイルストーンの進捗追跡、プルリクエストの自動管理など、実務で役立つ自動化を実現できます。

## GitHub Actionsとは

GitHub Actionsは、GitHub上でCI/CDパイプラインやその他の自動化タスクを実行できる機能です。ワークフローファイル（YAML形式）を作成することで、様々なイベントに応じた自動化を設定できます。

## 基本的なワークフローの作成

### ワークフローファイルの場所

```
.github/workflows/
  ├── auto-label.yml
  ├── project-automation.yml
  └── milestone-reminder.yml
```

### 基本的な構造

```yaml
name: Workflow Name

on:
  # トリガーとなるイベント

jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - name: Step name
        run: echo "Hello, World!"
```

## Issueの自動ラベル付け

### 新規Issueに自動でラベルを付与

```yaml
# .github/workflows/auto-label-issues.yml
name: Auto Label Issues

on:
  issues:
    types: [opened]

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - name: Add triage label
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

### タイトルに基づいてラベルを自動付与

```yaml
# .github/workflows/smart-labeling.yml
name: Smart Labeling

on:
  issues:
    types: [opened, edited]

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - name: Add labels based on title
        uses: actions/github-script@v6
        with:
          script: |
            const title = context.payload.issue.title.toLowerCase();
            const labels = [];
            
            // バグ関連
            if (title.includes('bug') || title.includes('error') || title.includes('fix')) {
              labels.push('bug');
            }
            
            // 機能関連
            if (title.includes('feature') || title.includes('add') || title.includes('implement')) {
              labels.push('feature');
            }
            
            // ドキュメント関連
            if (title.includes('doc') || title.includes('readme') || title.includes('guide')) {
              labels.push('documentation');
            }
            
            if (labels.length > 0) {
              github.rest.issues.addLabels({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                labels: labels
              });
            }
```

## プロジェクトボードの自動管理

### Issue作成時にプロジェクトに追加

```yaml
# .github/workflows/add-to-project.yml
name: Add to Project

on:
  issues:
    types: [opened]

jobs:
  add-to-project:
    runs-on: ubuntu-latest
    steps:
      - name: Add issue to project
        uses: alex-page/github-project-automation-plus@v0.8.1
        with:
          project: My Project
          column: To do
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

### ラベル変更時にカラムを移動

```yaml
# .github/workflows/move-on-label.yml
name: Move on Label

on:
  issues:
    types: [labeled]

jobs:
  move:
    runs-on: ubuntu-latest
    steps:
      - name: Move to In Progress
        if: contains(github.event.label.name, 'status: in-progress')
        uses: alex-page/github-project-automation-plus@v0.8.1
        with:
          project: My Project
          column: In Progress
          repo-token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Move to Review
        if: contains(github.event.label.name, 'status: review')
        uses: alex-page/github-project-automation-plus@v0.8.1
        with:
          project: My Project
          column: Review
          repo-token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Move to Done
        if: contains(github.event.label.name, 'status: done')
        uses: alex-page/github-project-automation-plus@v0.8.1
        with:
          project: My Project
          column: Done
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

## プルリクエストの自動管理

### プルリクエスト作成時にラベルを付与

```yaml
# .github/workflows/auto-label-pr.yml
name: Auto Label PR

on:
  pull_request:
    types: [opened]

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - name: Add labels
        uses: actions/github-script@v6
        with:
          script: |
            const labels = ['needs-review'];
            
            // タイトルに基づいてラベルを追加
            const title = context.payload.pull_request.title.toLowerCase();
            if (title.includes('fix') || title.includes('bug')) {
              labels.push('bug');
            }
            if (title.includes('feature')) {
              labels.push('feature');
            }
            
            github.rest.issues.addLabels({
              issue_number: context.payload.pull_request.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              labels: labels
            })
```

### プルリクエストをプロジェクトに追加

```yaml
# .github/workflows/add-pr-to-project.yml
name: Add PR to Project

on:
  pull_request:
    types: [opened]

jobs:
  add-to-project:
    runs-on: ubuntu-latest
    steps:
      - name: Add PR to project
        uses: alex-page/github-project-automation-plus@v0.8.1
        with:
          project: My Project
          column: Review
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

### マージ時にIssueを自動的に閉じる

```yaml
# .github/workflows/auto-close-issues.yml
name: Auto Close Issues

on:
  pull_request:
    types: [closed]

jobs:
  close-issues:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Close related issues
        uses: actions/github-script@v6
        with:
          script: |
            const body = context.payload.pull_request.body;
            const issueRegex = /(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s+#(\d+)/gi;
            const matches = body.matchAll(issueRegex);
            
            for (const match of matches) {
              const issueNumber = match[1];
              github.rest.issues.update({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issueNumber,
                state: 'closed'
              });
            }
```

## マイルストーンの自動管理

### 期限が近づいたら通知

```yaml
# .github/workflows/milestone-reminder.yml
name: Milestone Reminder

on:
  schedule:
    - cron: '0 9 * * *'  # 毎日9時（UTC）

jobs:
  remind:
    runs-on: ubuntu-latest
    steps:
      - name: Check milestone deadlines
        uses: actions/github-script@v6
        with:
          script: |
            const milestones = await github.rest.issues.listMilestones({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: 'open'
            });
            
            const today = new Date();
            for (const milestone of milestones.data) {
              if (milestone.due_on) {
                const dueDate = new Date(milestone.due_on);
                const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysLeft <= 7 && daysLeft > 0) {
                  // Issueを作成して通知
                  await github.rest.issues.create({
                    owner: context.repo.owner,
                    repo: context.repo.repo,
                    title: `[Reminder] Milestone "${milestone.title}" is due in ${daysLeft} days`,
                    body: `The milestone "${milestone.title}" is due on ${milestone.due_on}. Please review the progress.`,
                    labels: ['reminder', 'milestone']
                  });
                }
              }
            }
```

### マイルストーン進捗の定期レポート

```yaml
# .github/workflows/milestone-report.yml
name: Milestone Report

on:
  schedule:
    - cron: '0 9 * * 1'  # 毎週月曜日9時

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - name: Generate milestone report
        uses: actions/github-script@v6
        with:
          script: |
            const milestones = await github.rest.issues.listMilestones({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: 'open'
            });
            
            let report = '# Milestone Progress Report\n\n';
            
            for (const milestone of milestones.data) {
              const issues = await github.rest.issues.listForRepo({
                owner: context.repo.owner,
                repo: context.repo.repo,
                milestone: milestone.number,
                state: 'all'
              });
              
              const open = issues.data.filter(i => i.state === 'open').length;
              const closed = issues.data.filter(i => i.state === 'closed').length;
              const total = issues.data.length;
              const progress = total > 0 ? Math.round((closed / total) * 100) : 0;
              
              report += `## ${milestone.title}\n`;
              report += `- Progress: ${progress}% (${closed}/${total})\n`;
              report += `- Open: ${open}\n`;
              report += `- Closed: ${closed}\n`;
              if (milestone.due_on) {
                report += `- Due: ${milestone.due_on}\n`;
              }
              report += '\n';
            }
            
            // Issueとして投稿
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `[Report] Milestone Progress - ${new Date().toLocaleDateString()}`,
              body: report,
              labels: ['report', 'milestone']
            });
```

## カスタム自動化

### スター数に応じたアクション

```yaml
# .github/workflows/on-star.yml
name: On Star

on:
  watch:
    types: [started]

jobs:
  thank:
    runs-on: ubuntu-latest
    steps:
      - name: Thank stargazer
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `Thank you for starring! 🎉`,
              body: `Thank you @${context.payload.sender.login} for starring this repository!`,
              labels: ['thanks']
            });
```

### 定期的なメンテナンスタスク

```yaml
# .github/workflows/maintenance.yml
name: Maintenance

on:
  schedule:
    - cron: '0 0 * * 0'  # 毎週日曜日

jobs:
  maintenance:
    runs-on: ubuntu-latest
    steps:
      - name: Close stale issues
        uses: actions/stale@v7
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          stale-issue-message: 'This issue has been inactive for 30 days. It will be closed if no activity occurs.'
          days-before-issue-stale: 30
          days-before-issue-close: 7
          stale-issue-label: 'stale'
```

## ベストプラクティス

1. **適切なトリガー**: 必要な時だけワークフローを実行
2. **エラーハンドリング**: エラーが発生しても適切に処理
3. **ログの確認**: ワークフローの実行ログを定期的に確認
4. **セキュリティ**: 機密情報はSecretsを使用
5. **パフォーマンス**: 不要なワークフローは無効化

## トラブルシューティング

### ワークフローが実行されない

1. **ファイルの場所を確認**: `.github/workflows/`に配置されているか
2. **YAML構文を確認**: 構文エラーがないか
3. **権限を確認**: 必要な権限があるか

### エラーが発生する

1. **ログを確認**: Actionsタブでログを確認
2. **権限を確認**: `GITHUB_TOKEN`の権限を確認
3. **イベントを確認**: トリガーとなるイベントが正しく発生しているか

## 次のステップ

GitHub Actionsによる自動化を理解したら、実務的なワークフローを学びましょう。

→ [実務的なワークフロー](05-実務的なワークフロー.md)

