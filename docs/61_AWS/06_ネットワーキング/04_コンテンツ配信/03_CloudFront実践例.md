# CloudFront実践例

## 静的Webサイトの配信

### 1. S3バケットの準備
```bash
# S3バケットの作成
aws s3 mb s3://my-static-website-2024

# 静的ファイルのアップロード
aws s3 cp index.html s3://my-static-website-2024/
aws s3 cp style.css s3://my-static-website-2024/
aws s3 cp script.js s3://my-static-website-2024/
```

### 2. 構成例
```
S3バケット（オリジン） → CloudFront → ユーザー

メリット：
- 高速な配信
- 低コスト
- 高可用性
```

## 動的コンテンツの配信

### 1. EC2インスタンスとの連携
```javascript
// Express.jsアプリケーション例
const express = require('express');
const app = express();

// CloudFrontからのリクエストを識別
app.use((req, res, next) => {
  const cloudfrontViewerCountry = req.headers['cloudfront-viewer-country'];
  const cloudfrontIsMobileViewer = req.headers['cloudfront-is-mobile-viewer'];
  
  console.log(`Country: ${cloudfrontViewerCountry}, Mobile: ${cloudfrontIsMobileViewer}`);
  next();
});

// 動的コンテンツの配信
app.get('/api/data', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    data: 'Dynamic content from EC2'
  });
});

app.listen(3000);
```

### 2. キャッシュポリシーの設定
```json
{
  "Name": "DynamicContentPolicy",
  "DefaultTTL": 0,
  "MaxTTL": 0,
  "MinTTL": 0,
  "ParametersInCacheKeyAndForwardedToOrigin": {
    "QueryStrings": {
      "Forward": "all"
    },
    "Headers": {
      "Forward": "whitelist",
      "WhitelistedNames": ["Authorization", "Content-Type"]
    }
  }
}
```

### 3. 構成例
```
ELB → EC2インスタンス（オリジン） → CloudFront → ユーザー

設定：
- 静的コンテンツ：キャッシュ有効
- 動的コンテンツ：キャッシュ無効
```

## 動画配信

### 1. 構成例
```
S3バケット（動画ファイル） → CloudFront → ユーザー

機能：
- プログレッシブダウンロード
- 帯域幅の最適化
- グローバル配信
```

## パフォーマンス最適化

### 1. キャッシュ設定の最適化
```yaml
# 異なるコンテンツタイプごとのキャッシュ設定
CacheBehaviors:
  - PathPattern: "*.css"
    TargetOriginId: S3Origin
    CachePolicyId: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"  # 長期キャッシュ
    TTL:
      DefaultTTL: 86400  # 1日
      MaxTTL: 31536000   # 1年
  
  - PathPattern: "*.js"
    TargetOriginId: S3Origin
    CachePolicyId: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    TTL:
      DefaultTTL: 86400
      MaxTTL: 31536000
  
  - PathPattern: "/api/*"
    TargetOriginId: APIOrigin
    CachePolicyId: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    TTL:
      DefaultTTL: 0      # キャッシュしない
      MaxTTL: 0
```

### 2. 圧縮設定
```json
{
  "Compress": true,
  "CompressionLevel": 6,
  "CompressionTypes": [
    "gzip",
    "brotli"
  ]
}
```

### 3. HTTP/2とHTTP/3の活用
```yaml
# CloudFrontは自動的にHTTP/2とHTTP/3をサポート
# 追加設定は不要
```
