# CodeDeployとは

## 概要

AWS CodeDeployは、Amazon EC2インスタンス、オンプレミスサーバー、AWS Lambda関数、Amazon ECSサービスなどへのアプリケーションの自動デプロイを可能にするデプロイメントサービスです。

## 主要機能

### 1. 自動デプロイメント
- **ローリングデプロイ**: 段階的なデプロイでダウンタイムを最小化
- **Blue/Greenデプロイ**: 本番環境を複製して安全なデプロイ
- **Canaryデプロイ**: 少数のインスタンスでテスト後、全インスタンスに展開

### 2. 対応プラットフォーム
- **EC2インスタンス**: Linux/Windowsサーバー
- **オンプレミス**: オンプレミスサーバー
- **Lambda関数**: サーバーレス関数
- **ECS**: コンテナサービス
- **EKS**: Kubernetesクラスター

### 3. デプロイ戦略
- **In-Place**: 既存インスタンスを更新
- **Blue/Green**: 新しい環境を作成して切り替え
- **Lambda**: 関数のバージョン管理

## 料金体系

### EC2/オンプレミスデプロイ
- **月1,000デプロイまで無料**
- **超過分**: デプロイあたり$0.02

### Lambdaデプロイ
- **無料**

## 使用例

### 1. EC2へのデプロイ設定
```yaml
# appspec.yml
version: 0.0
os: linux
files:
  - source: /index.html
    destination: /var/www/html/
hooks:
  BeforeInstall:
    - location: scripts/install_dependencies.sh
      timeout: 300
  AfterInstall:
    - location: scripts/restart_server.sh
      timeout: 300
```

### 2. Lambda関数のデプロイ
```yaml
# appspec.yml
version: 0.0
Resources:
  - myLambdaFunction:
      Type: AWS::Lambda::Function
      Properties:
        Name: myFunction
        Alias: live
        CurrentVersion: "1"
        TargetVersion: "2"
```

## メリット

### デプロイの自動化
- **手動デプロイの削減**: 人的ミスの削減
- **一貫性**: 標準化されたデプロイプロセス
- **ロールバック**: 問題発生時の迅速な復旧

### 可用性の向上
- **ゼロダウンタイム**: ローリングデプロイによる継続運用
- **段階的デプロイ**: リスクの分散

---

**注意**: このドキュメントは学習目的で作成されています。本番環境では、プロジェクトの要件に応じて適切なデプロイ戦略を選択してください。
