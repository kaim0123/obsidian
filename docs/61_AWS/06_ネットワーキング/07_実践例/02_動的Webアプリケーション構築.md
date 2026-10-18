# 動的Webアプリケーション構築の実践例

## アーキテクチャ概要
```
ユーザー → CloudFront → ALB → EC2 → RDS
```

## 必要なAWSサービス
- **VPC**: 仮想ネットワーク環境
- **ALB**: ロードバランサー
- **EC2**: アプリケーションサーバー
- **RDS**: データベース
- **CloudFront**: CDN配信
- **Route53**: DNS設定

## 構築手順

### 1. VPCの作成
```bash
# VPCの作成
aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=MyVPC}]'

# サブネットの作成
aws ec2 create-subnet \
    --vpc-id vpc-12345678 \
    --cidr-block 10.0.1.0/24 \
    --availability-zone us-east-1a

aws ec2 create-subnet \
    --vpc-id vpc-12345678 \
    --cidr-block 10.0.2.0/24 \
    --availability-zone us-east-1b
```

### 2. セキュリティグループの設定
```bash
# Webサーバー用セキュリティグループ
aws ec2 create-security-group \
    --group-name WebServerSG \
    --description "Security group for web servers" \
    --vpc-id vpc-12345678

# HTTP/HTTPSアクセスを許可
aws ec2 authorize-security-group-ingress \
    --group-id sg-12345678 \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id sg-12345678 \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0
```

### 3. ALBの作成
```bash
# ターゲットグループの作成
aws elbv2 create-target-group \
    --name MyTargetGroup \
    --protocol HTTP \
    --port 80 \
    --vpc-id vpc-12345678

# ALBの作成
aws elbv2 create-load-balancer \
    --name MyALB \
    --subnets subnet-12345678 subnet-87654321 \
    --security-groups sg-12345678
```

### 4. EC2インスタンスの起動
```bash
# キーペアの作成
aws ec2 create-key-pair \
    --key-name MyKeyPair \
    --query 'KeyMaterial' \
    --output text > MyKeyPair.pem

# EC2インスタンスの起動
aws ec2 run-instances \
    --image-id ami-12345678 \
    --count 2 \
    --instance-type t3.micro \
    --key-name MyKeyPair \
    --security-group-ids sg-12345678 \
    --subnet-id subnet-12345678
```

### 5. RDSの作成
```bash
# DBサブネットグループの作成
aws rds create-db-subnet-group \
    --db-subnet-group-name MyDBSubnetGroup \
    --db-subnet-group-description "My DB subnet group" \
    --subnet-ids subnet-12345678 subnet-87654321

# RDSインスタンスの作成
aws rds create-db-instance \
    --db-instance-identifier mydb \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --master-username admin \
    --master-user-password MyPassword123 \
    --allocated-storage 20 \
    --db-subnet-group-name MyDBSubnetGroup
```

### 6. CloudFrontの設定
```bash
# CloudFrontディストリビューションの作成
aws cloudfront create-distribution \
    --distribution-config '{
        "CallerReference": "dynamic-app-2024",
        "Comment": "Dynamic application distribution",
        "DefaultCacheBehavior": {
            "TargetOriginId": "ALB-MyALB",
            "ViewerProtocolPolicy": "redirect-to-https",
            "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
        },
        "Origins": {
            "Quantity": 1,
            "Items": [
                {
                    "Id": "ALB-MyALB",
                    "DomainName": "my-alb-1234567890.us-east-1.elb.amazonaws.com",
                    "CustomOriginConfig": {
                        "HTTPPort": 80,
                        "HTTPSPort": 443,
                        "OriginProtocolPolicy": "https-only"
                    }
                }
            ]
        },
        "Enabled": true
    }'
```

## アプリケーションコード例

### Node.js/Express.jsアプリケーション
```javascript
const express = require('express');
const mysql = require('mysql2');
const app = express();

// データベース接続
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// 静的ファイルの配信
app.use(express.static('public'));

// APIエンドポイント
app.get('/api/data', (req, res) => {
  connection.query('SELECT * FROM users', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## 料金見積もり

### 月間の想定使用量
- **EC2**: t3.micro × 2台 × 24時間 × 30日 = 約$15
- **RDS**: db.t3.micro × 24時間 × 30日 = 約$12
- **ALB**: 時間料金 + LCU料金 = 約$16
- **CloudFront**: データ転送 + リクエスト = 約$10
- **合計**: 約$53/月

## メリット
- **高可用性**: マルチAZ構成
- **スケーラビリティ**: Auto Scaling対応
- **セキュリティ**: VPC内での分離
- **パフォーマンス**: CloudFrontによる高速配信
