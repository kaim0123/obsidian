## 前提
- Node.js / AWS CLI v2 / AWS CDK
- 初回アカウント/リージョンは bootstrap が必要

## 初期化
```bash
npm create aws-cdk@latest my-cdk-app
cd my-cdk-app
npm install
```

### 生成ディレクトリ例（TypeScript）
```
my-cdk-app/
  ├─ bin/
  │   └─ my-cdk-app.ts
  ├─ lib/
  │   └─ my-cdk-app-stack.ts
  ├─ cdk.json
  └─ package.json
```

## ブートストラップ
```bash
cdk bootstrap aws://<account-id>/<region> --profile dev
```

## 合成と差分
```bash
cdk synth
cdk diff --profile dev
```

## デプロイ
```bash
cdk deploy --profile dev
```

## ベストプラクティス
- コンストラクトに権限/命名規則を集約
- パラメータ化して環境差分を明示（Context/SSM）
- Pipelines（CDK Pipelines or CodePipeline）で段階デプロイ

## トラブルシューティング
- Bootstrap 未実施: `cdk bootstrap` を先に実行
- Context 差分: `cdk context` の整理、`cdk.json` を見直し
- 権限不足: デプロイ用ロールの権限（CloudFormation, IAM, S3, ECR 等）


