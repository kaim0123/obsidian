# 静的Webサイト構築の実践例

## アーキテクチャ概要
```
ユーザー → CloudFront → S3バケット
```

## 必要なAWSサービス
- **S3**: 静的ファイルの保存
- **CloudFront**: CDN配信
- **Route53**: DNS設定（カスタムドメイン使用時）
- **ACM**: SSL証明書（HTTPS使用時）

## 構築手順

### 1. S3バケットの作成と設定
```bash
# バケットの作成
aws s3 mb s3://my-static-website-2024

# 静的ファイルのアップロード
aws s3 cp index.html s3://my-static-website-2024/
aws s3 cp style.css s3://my-static-website-2024/
aws s3 cp script.js s3://my-static-website-2024/
aws s3 cp images/ s3://my-static-website-2024/images/ --recursive

# バケットポリシーの設定（パブリック読み取り許可）
aws s3api put-bucket-policy --bucket my-static-website-2024 --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-static-website-2024/*"
    }
  ]
}'
```

### 2. CloudFrontディストリビューションの作成
```bash
aws cloudfront create-distribution \
    --distribution-config '{
        "CallerReference": "static-website-2024",
        "Comment": "Static website distribution",
        "DefaultCacheBehavior": {
            "TargetOriginId": "S3-my-static-website-2024",
            "ViewerProtocolPolicy": "redirect-to-https",
            "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
        },
        "Origins": {
            "Quantity": 1,
            "Items": [
                {
                    "Id": "S3-my-static-website-2024",
                    "DomainName": "my-static-website-2024.s3.amazonaws.com",
                    "S3OriginConfig": {
                        "OriginAccessIdentity": ""
                    }
                }
            ]
        },
        "Enabled": true
    }'
```

### 3. カスタムドメインの設定（オプション）
```bash
# ACM証明書の作成
aws acm request-certificate \
    --domain-name example.com \
    --validation-method DNS \
    --region us-east-1

# Route53ホストゾーンの作成
aws route53 create-hosted-zone \
    --name example.com \
    --caller-reference $(date +%s)
```

## 料金見積もり

### 月間100GB転送、1000万リクエストの場合
- **S3ストレージ**: 約$0.25（100GB × $0.025）
- **CloudFront転送**: 約$8.50（100GB × $0.085）
- **CloudFrontリクエスト**: 約$0.85（1000万リクエスト × $0.000085）
- **合計**: 約$9.60/月

## メリット
- **高速配信**: 世界中のエッジロケーションから配信
- **低コスト**: サーバー管理不要
- **高可用性**: AWSのインフラストラクチャを活用
- **スケーラビリティ**: 自動的にトラフィックに対応
