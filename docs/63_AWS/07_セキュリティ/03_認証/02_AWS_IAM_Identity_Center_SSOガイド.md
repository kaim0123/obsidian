---
title: AWS IAM Identity Center (旧AWS SSO) を用いたマルチアプリSSO実装ガイド
updated: 2025-11-18
tags:
  - security
  - authentication
  - sso
  - iam-identity-center
---

# 1. なぜAWS IAM Identity Centerか

- **複数アプリで一元的なID管理**：AWS Organizations配下のアカウントやSaaS連携アプリのアクセス制御を統一できる。
- **既存IdPとの連携**：Active Directory / Azure AD / Oktaなど外部IdPをアイデンティティソースとして利用可能。
- **SAML 2.0 / OIDC対応**：社内で開発したWebアプリやSaaSアプリに対してSSOを簡易に付与。
- **権限セット（Permission Set）**：AWSアカウント側の権限をテンプレート化し、ユーザー/グループに迅速に付与。

# 2. 全体アーキテクチャ

```
社内ユーザー
    │ (SAML/OIDC)
    ▼
社内IdP (Azure AD等)  ──SCIM──>  IAM Identity Center
                                    │
                                    ├─ AWSアカウント (Permission Set→IAM Role)
                                    └─ カスタム/SaaSアプリ (SAML/OIDC)
```

- IdPで認証 → IAM Identity Centerで認可 → 各アプリケーションにセッションを発行。
- SCIMを使うとユーザー／グループ自動同期が可能。

# 3. 前提条件チェックリスト

| 項目 | 内容 |
| --- | --- |
| AWS Organizations | 有効化済みであること（SSOは管理アカウントから設定） |
| IAM Identity Center | 管理アカウントの `IAM Identity Center` サービスが有効 |
| アイデンティティソース | 既存IdPか、内蔵ディレクトリを使用するか決定 |
| 対象アプリ | SAML 2.0 or OIDC対応か事前確認 |
| 権限設計 | AWSアカウントごとのアクセスレベルをPermission Setで定義 |

# 4. 実装ステップ

## 4.1 アイデンティティソースの選択
1. AWSマネジメントコンソールで `IAM Identity Center` → `設定`。
2. `アイデンティティソース` から以下を選択:
   - **AWS IAM Identity Center ディレクトリ**（簡易ユーザー管理）
   - **Active Directory**（AWS Managed Microsoft AD）
   - **外部IdP**（SAMLによるフェデレーション）
3. 外部IdPの場合はメタデータ（SAML）を交換し信頼関係を確立。

## 4.2 ユーザー・グループの同期
- 内蔵ディレクトリ：コンソールまたはCSV/CLIでユーザーを作成。
- 外部IdP：SCIMエンドポイント＆トークンを発行し、自動プロビジョニングを設定。
- 推奨：AWSアカウントとアプリのアクセス単位でグループを定義。

## 4.3 Permission Setの作成
1. `AWSアカウント` → `Permission sets` → `Create`.
2. テンプレート：
   - **ViewOnlyAccess**：監査ユーザー
   - **PowerUserAccess**：開発者
   - **Custom**：JSONポリシーで最小権限
3. セッション期間、MFA要件、Relay Stateなども設定可能。

## 4.4 AWSアカウントへの割り当て
1. `AWSアカウント` タブで対象アカウントを選択。
2. `Assign users or groups` でユーザー/グループ＋Permission Setを紐付け。
3. 割り当て後、自動的にIAMロールが各アカウントへデプロイされる（数分待機）。

## 4.5 アプリケーション（SAML/OIDC）統合
1. `アプリケーション` → `追加`。
2. ギャラリーアプリ（Salesforce, Slack等）か `カスタムSAML/OIDC` を選択。
3. カスタムSAMLの場合:
   - ACS URL（Assertion Consumer Service）
   - Audience URI (SP Entity ID)
   - Relay State
   - 属性マッピング（`Subject`, `email`, `groups` など）
4. OIDCの場合:
   - `Client ID` / `Client Secret`
   - リダイレクトURL
   - Scope (`openid profile email` 等)
5. 設定後、ユーザー/グループをアプリに割り当て、テストログイン。

# 5. AWS CLI / IaCによる自動化

## 5.1 CLI例
```powershell
# Permission Set作成
aws sso-admin create-permission-set `
  --name "AppDevAccess" `
  --instance-arn arn:aws:sso:::instance/ssoins-xxxx `
  --inline-policy file://policies/app-dev.json

# グループ割当て
aws sso-admin create-account-assignment `
  --permission-set-arn arn:aws:sso:::permissionSet/ssoins-xxxx/ps-xxxx `
  --principal-type GROUP `
  --principal-id "08abc12345" `
  --instance-arn arn:aws:sso:::instance/ssoins-xxxx `
  --target-id 123456789012 `
  --target-type AWS_ACCOUNT
```

## 5.2 CloudFormation/CDK
- `AWS::SSO::PermissionSet` リソースで権限セットを定義。
- CDKでは `@aws-cdk/aws-sso` (v2) を使用し、アカウント割り当てもコード化。
- SCIM連携やアプリ統合は手動初期設定後、メタデータをParameter Storeに格納して自動反映する運用が一般的。

# 6. マルチアプリSSOのベストプラクティス

1. **権限分離**：AWSアカウントとSaaSアプリでグループを分け、過剰付与を防ぐ。
2. **多要素認証 (MFA)**：IdP側で必須化し、IAM Identity Center側でも2次MFAを設定。
3. **監査ログ**：`CloudTrail` と `CloudWatch Logs` に `sso.amazonaws.com` イベントを送信。
4. **ライフサイクル管理**：SCIM＋人事システム連携で入退社を自動化。
5. **権限セットのバージョン管理**：GitでJSONポリシーを管理し、変更はCI/CD経由で適用。
6. **アプリ接続テスト**：SAML/OIDCのメタデータ更新時は事前にステージング環境で検証。

# 7. 参考実装の流れ（例）

1. Organizations管理アカウントでIAM Identity Centerを有効化。
2. Azure ADをアイデンティティソースに設定し、SAMLフェデレーション & SCIMを構成。
3. `dev-app`, `ops`, `readonly` の3グループを同期。
4. `AppDevAccess`, `OpsAccess`, `ViewOnly` のPermission Setを作成して各AWSアカウントに割当。
5. 自社開発ポータルをカスタムSAMLアプリとして登録し、Relay StateでアプリのホームURLに遷移。
6. CloudTrail LakeでSSOイベントログ分析を有効化し、権限レビューを自動レポート化。

# 8. トラブルシューティングのヒント

| 症状 | 確認ポイント |
| --- | --- |
| ログイン後に権限が見えない | 割当済みPermission Setがデプロイ済みか？ロール名が一致しているか？ |
| ユーザーが表示されない | SCIM同期状態、トークン期限、グループフィルタを確認 |
| SAMLアプリでエラー | ACS URL/Audienceのスペル、証明書期限、Clock Skewを確認 |
| MFAが要求されない | IdPポリシーとIAM Identity CenterのMFA設定を両方確認 |

# 9. まとめ

- IAM Identity Centerを使うと、社内外の複数アプリに対し統一的なSSOと権限管理を提供できる。
- アカウント割当とアプリ割当を自動化し、SCIM＋IaCで一貫した運用を実現するのがポイント。
- 監査ログとMFAを組み合わせ、セキュアかつ運用しやすい社内SSO基盤を構築しよう。

