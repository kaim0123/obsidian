## 方針
- IaC（Terraform/CDK）でパイプラインもコード化
- ビルドは CodeBuild、配布は CodeDeploy/ECS/Lambda へ

## 典型フロー
1. GitHub push → CodePipeline トリガー
2. CodeBuild: テスト/ビルド
3. デプロイ: Lambda/ECS/EC2
4. ポストデプロイ検証/ロールバック

## 成果物の保管
- コンテナ: ECR
- バンドル: S3 + 署名


