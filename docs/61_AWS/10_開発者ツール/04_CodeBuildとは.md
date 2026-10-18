# AWS CodeBuild とは

## 概要

AWS CodeBuild は、クラウドベースのビルドサービスです。ソースコードをコンパイルし、テストを実行し、デプロイ可能なアーティファクトを生成します。サーバーを管理する必要がなく、使用した分だけ支払う従量課金制です。

## 主な機能

### 1. ビルド環境
- マネージドビルド環境
- 複数のプログラミング言語サポート
- カスタムビルドイメージの使用
- 複数のランタイム環境

### 2. 自動スケーリング
- 並列ビルドの実行
- オンデマンドスケーリング
- ビルドキューの自動管理
- リソースの効率的な利用

### 3. 統合機能
- AWS CodeCommitとの連携
- AWS CodePipelineとの連携
- GitHub、GitLabとの連携
- サードパーティツールとの連携

## 料金体系

### 基本料金（2024年1月時点）
- **ビルド時間**: $0.005/分
- **無料利用枠**: 月100分まで無料

### 料金計算例
```
月間ビルド時間: 1000分
料金計算: (1000 - 100) × $0.005 = $4.50/月
```

## 基本的な使い方

### 1. ビルドプロジェクトの作成
```bash
# AWS CLI
aws codebuild create-project --cli-input-json file://build-project.json
```

### 2. buildspec.ymlの設定
```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
  build:
    commands:
      - echo Build started on `date`
      - echo Building the Docker image...
      - docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG .
      - docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
  post_build:
    commands:
      - echo Build completed on `date`
      - echo Pushing the Docker image...
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG

artifacts:
  files:
    - '**/*'
  name: $(date +%Y-%m-%d)

cache:
  paths:
    - '/root/.npm/**/*'
```

### 3. ビルドの実行
```bash
# ビルドの開始
aws codebuild start-build --project-name my-build-project

# ビルドの状態確認
aws codebuild batch-get-builds --ids <build-id>
```

## 実践例

### Node.jsアプリケーションのビルド
```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18
  pre_build:
    commands:
      - echo Installing dependencies...
      - npm install
  build:
    commands:
      - echo Running tests...
      - npm test
      - echo Building application...
      - npm run build
  post_build:
    commands:
      - echo Build completed successfully

artifacts:
  files:
    - 'dist/**/*'
    - 'package.json'
  name: nodejs-app-$(date +%Y-%m-%d)
```

### Dockerイメージのビルド
```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
  build:
    commands:
      - echo Build started on `date`
      - echo Building the Docker image...
      - docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG .
      - docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
  post_build:
    commands:
      - echo Build completed on `date`
      - echo Pushing the Docker image...
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG

env:
  variables:
    AWS_DEFAULT_REGION: ap-northeast-1
    AWS_ACCOUNT_ID: "123456789012"
    IMAGE_REPO_NAME: my-app
    IMAGE_TAG: latest
```

## ベストプラクティス

### 1. ビルドの最適化
- キャッシュの活用
- 並列ビルドの設定
- 不要なファイルの除外
- ビルド時間の短縮

### 2. セキュリティ
- IAMロールの適切な設定
- シークレットの管理
- ビルドログの暗号化
- ネットワークアクセスの制限

### 3. 監視とアラート
- CloudWatchメトリクスの活用
- ビルド失敗のアラート設定
- ビルド時間の監視
- コストの監視

## 注意点

### 1. 制限事項
- ビルド時間: 最大8時間
- アーティファクトサイズ: 最大10GB
- 同時ビルド数: アカウント制限あり

### 2. パフォーマンス
- ビルド環境の初期化時間
- ネットワーク転送速度
- 並列ビルドの効率性

## まとめ

AWS CodeBuild は、サーバーレスでスケーラブルなビルドサービスです。CI/CDパイプラインの重要な構成要素として、開発効率の向上とコスト削減を実現できます。適切な設定により、効率的で信頼性の高いビルドプロセスを構築できます。
