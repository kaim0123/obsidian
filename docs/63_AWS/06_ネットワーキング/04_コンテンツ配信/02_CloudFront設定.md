# CloudFront設定手順

## ディストリビューションの作成

### 1. 基本的な設定項目

| 設定項目 | 説明 | 推奨値 |
|---------|------|--------|
| **Origin Domain** | オリジンサーバーのドメイン | S3バケット名 |
| **Viewer Protocol Policy** | プロトコル設定 | Redirect HTTP to HTTPS |
| **Cache Policy** | キャッシュポリシー | CachingOptimized |
| **TTL** | キャッシュ期間 | 86400秒（1日） |

### 2. AWS CLIでの作成例
```bash
aws cloudfront create-distribution \
    --distribution-config '{
        "CallerReference": "my-distribution-2024",
        "Comment": "My CloudFront Distribution",
        "DefaultCacheBehavior": {
            "TargetOriginId": "S3-my-bucket",
            "ViewerProtocolPolicy": "redirect-to-https",
            "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
        },
        "Origins": {
            "Quantity": 1,
            "Items": [
                {
                    "Id": "S3-my-bucket",
                    "DomainName": "my-bucket.s3.amazonaws.com",
                    "S3OriginConfig": {
                        "OriginAccessIdentity": ""
                    }
                }
            ]
        },
        "Enabled": true
    }'
```

## CloudFormationテンプレート例

```yaml
Resources:
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - Id: S3Origin
            DomainName: !Sub "${S3Bucket}.s3.amazonaws.com"
            S3OriginConfig:
              OriginAccessIdentity: !Sub "origin-access-identity/cloudfront/${OriginAccessIdentity}"
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad
        Enabled: true
        Comment: Static website distribution
```

## パフォーマンスの確認

```bash
# 配信速度のテスト
curl -w "@curl-format.txt" -o /dev/null -s "https://d1234567890.cloudfront.net/index.html"

# curl-format.txtの内容
#      time_namelookup:  %{time_namelookup}\n
#         time_connect:  %{time_connect}\n
#      time_appconnect:  %{time_appconnect}\n
#     time_pretransfer:  %{time_pretransfer}\n
#        time_redirect:  %{time_redirect}\n
#   time_starttransfer:  %{time_starttransfer}\n
#                      ----------\n
#           time_total:  %{time_total}\n
```
