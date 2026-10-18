# CloudFrontセキュリティ機能

## AWS WAFとの連携

### WAF WebACLの設定例
```yaml
Resources:
  WebACL:
    Type: AWS::WAFv2::WebACL
    Properties:
      Name: CloudFrontWebACL
      Scope: CLOUDFRONT
      DefaultAction:
        Allow: {}
      Rules:
        - Name: RateLimitRule
          Priority: 1
          Statement:
            RateBasedStatement:
              Limit: 2000
              AggregateKeyType: IP
          Action:
            Block: {}
```

## SSL/TLS証明書の設定

### ACM証明書の作成
```bash
# ACM証明書の作成（us-east-1リージョンで作成が必要）
aws acm request-certificate \
    --domain-name example.com \
    --validation-method DNS \
    --region us-east-1
```

## オリジンアクセス制御

### S3バケットポリシーの設定
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity E1234567890"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

## セキュリティ機能の詳細

### 1. オリジンアクセスアイデンティティ（OAI）
- S3バケットへの直接アクセスを防止
- CloudFront経由でのみアクセス可能
- セキュリティの向上

### 2. 署名付きURL/クッキー
- 特定のユーザーのみアクセス可能
- 有効期限の設定
- 動的コンテンツの保護

### 3. 地理的制限
- 特定の国からのアクセスを制限
- コンプライアンス要件への対応
- 不正アクセスの防止

### 4. セキュリティヘッダー
```yaml
ResponseHeadersPolicy:
  SecurityHeadersConfig:
    StrictTransportSecurity:
      AccessControlMaxAgeSec: 31536000
      IncludeSubdomains: true
    ContentTypeOptions:
      Override: false
    FrameOptions:
      FrameOption: DENY
    ReferrerPolicy:
      ReferrerPolicy: strict-origin-when-cross-origin
```

## セキュリティのベストプラクティス

### 1. HTTPS強制
- 全通信の暗号化
- HTTPからHTTPSへのリダイレクト
- セキュリティヘッダーの追加

### 2. オリジンアクセス制御
- S3バケットへの直接アクセス防止
- CloudFront経由でのみアクセス可能
- プライベートコンテンツの保護

### 3. WAFの活用
- SQLインジェクション攻撃の防御
- XSS攻撃の防御
- DDoS攻撃の軽減

### 4. 監視とログ
- CloudWatch Logsでのアクセス監視
- 異常なアクセスパターンの検出
- セキュリティインシデントの対応
