## ブランチ戦略（例）
- main: 本番
- develop: 統合
- feature/*: 機能
- hotfix/*: 本番修正

## 必須設定
- 必須レビュー（PR保護）
- 必須ステータスチェック（CI）
- シークレットは GitHub Secrets or AWS Secrets Manager

## 署名とセキュリティ
- Commit/Tag の署名（GPG/Sigstore）
- Dependabot で依存アップデート


