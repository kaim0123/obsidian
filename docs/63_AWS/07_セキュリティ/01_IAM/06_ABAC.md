# ABAC（Attribute-based Access Control）

## 概要

**ABAC（Attribute-based Access Control）**は、ユーザーやリソースの属性（タグ）に基づいてアクセス制御を行う仕組みです。従来のRBAC（Role-based Access Control）よりも柔軟で、動的なアクセス制御が可能です。

## ABACの特徴

### 1. 属性ベースの制御
```
従来のRBAC: ロール → 権限
ABAC: 属性（タグ） → 権限
```

### 2. 動的なアクセス制御
- **時間ベース**: 特定の時間帯のみアクセス許可
- **条件ベース**: 特定の条件下でのみアクセス許可
- **リソースベース**: リソースの属性に応じたアクセス制御

### 3. スケーラビリティ
- 新しいリソースやユーザーが追加されても、タグを設定するだけで自動的にアクセス制御が適用
- ポリシーの数を大幅に削減可能

## ABACで使用される属性

### 1. プリンシパル属性

#### ユーザータグ
```json
{
  "Principal": {
    "AWS": "arn:aws:iam::123456789012:user/john",
    "attributes": {
      "Department": "Engineering",
      "Project": "WebApp",
      "Environment": "Production",
      "ClearanceLevel": "High"
    }
  }
}
```

#### ロールタグ
```json
{
  "Principal": {
    "AWS": "arn:aws:iam::123456789012:role/DeveloperRole",
    "attributes": {
      "Department": "Engineering",
      "Project": "WebApp",
      "Environment": "Development"
    }
  }
}
```

### 2. リソース属性

#### S3バケットタグ
```json
{
  "Resource": "arn:aws:s3:::my-bucket/*",
  "attributes": {
    "Owner": "Engineering",
    "Project": "WebApp",
    "Environment": "Production",
    "DataClassification": "Confidential"
  }
}
```

#### EC2インスタンスタグ
```json
{
  "Resource": "arn:aws:ec2:us-east-1:123456789012:instance/*",
  "attributes": {
    "Department": "Engineering",
    "Project": "WebApp",
    "Environment": "Production",
    "CostCenter": "IT-001"
  }
}
```

### 3. 環境属性

#### 時間属性
```json
{
  "Environment": {
    "CurrentTime": "2024-01-15T10:30:00Z",
    "DayOfWeek": "Monday",
    "Hour": 10
  }
}
```

#### ネットワーク属性
```json
{
  "Environment": {
    "SourceIP": "203.0.113.0/24",
    "UserAgent": "AWS-CLI/2.0",
    "VpcId": "vpc-12345678"
  }
}
```

## ABACポリシーの例

### 1. 基本的なABACポリシー

#### 部門ベースのアクセス制御
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/Department": "Engineering",
          "s3:ExistingObjectTag/Department": "Engineering"
        }
      }
    }
  ]
}
```

#### プロジェクトベースのアクセス制御
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/Project": "${s3:ExistingObjectTag/Project}"
        }
      }
    }
  ]
}
```

### 2. 時間ベースのアクセス制御

#### 営業時間内のみアクセス許可
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*",
      "Condition": {
        "DateGreaterThan": {
          "aws:CurrentTime": "2024-01-01T09:00:00Z"
        },
        "DateLessThan": {
          "aws:CurrentTime": "2024-12-31T18:00:00Z"
        },
        "StringEquals": {
          "aws:PrincipalTag/Department": "Engineering"
        }
      }
    }
  ]
}
```

#### 平日のみアクセス許可
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ec2:StartInstances",
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:CurrentTime": "Saturday"
        },
        "StringNotEquals": {
          "aws:CurrentTime": "Sunday"
        }
      }
    }
  ]
}
```

### 3. プロジェクトベースのアクセス制御

#### プロジェクトメンバーのみアクセス許可
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:DescribeInstances"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/Project": "${ec2:ResourceTag/Project}"
        }
      }
    }
  ]
}
```

#### 環境別のアクセス制御
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/Environment": "${s3:ExistingObjectTag/Environment}"
        },
        "StringNotEquals": {
          "aws:PrincipalTag/Environment": "Production"
        }
      }
    }
  ]
}
```

### 4. データ分類に基づくアクセス制御

#### 機密レベルに応じたアクセス制御
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/ClearanceLevel": "High"
        },
        "ForAnyValue:StringEquals": {
          "s3:ExistingObjectTag/DataClassification": ["Public", "Internal", "Confidential"]
        }
      }
    },
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/ClearanceLevel": "Medium"
        },
        "ForAnyValue:StringEquals": {
          "s3:ExistingObjectTag/DataClassification": ["Public", "Internal"]
        }
      }
    },
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/ClearanceLevel": "Low"
        },
        "StringEquals": {
          "s3:ExistingObjectTag/DataClassification": "Public"
        }
      }
    }
  ]
}
```

## ABACの実装手順

### 1. タグ戦略の策定

#### タグ命名規則の定義
```
✅ 組織のタグ命名規則を定義
✅ 必須タグとオプションタグを決定
✅ タグの値の制約を設定
✅ タグのライフサイクル管理を計画
```

#### 推奨タグ構造
```json
{
  "tags": {
    "Department": "Engineering|Marketing|Sales|HR",
    "Project": "WebApp|MobileApp|DataAnalytics",
    "Environment": "Development|Staging|Production",
    "Owner": "user@company.com",
    "CostCenter": "IT-001|IT-002|IT-003",
    "DataClassification": "Public|Internal|Confidential|Restricted"
  }
}
```

### 2. タグの適用

#### S3バケットにタグを適用
```bash
# S3バケットにタグを適用
aws s3api put-bucket-tagging \
    --bucket my-bucket \
    --tagging 'TagSet=[{Key=Department,Value=Engineering},{Key=Project,Value=WebApp},{Key=Environment,Value=Production}]'

# S3オブジェクトにタグを適用
aws s3api put-object-tagging \
    --bucket my-bucket \
    --key data/file.txt \
    --tagging 'TagSet=[{Key=DataClassification,Value=Confidential},{Key=Owner,Value=john@company.com}]'
```

#### EC2インスタンスにタグを適用
```bash
# EC2インスタンスにタグを適用
aws ec2 create-tags \
    --resources i-1234567890abcdef0 \
    --tags Key=Department,Value=Engineering Key=Project,Value=WebApp Key=Environment,Value=Production

# インスタンス起動時のタグ設定
aws ec2 run-instances \
    --image-id ami-12345678 \
    --instance-type t2.micro \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Department,Value=Engineering},{Key=Project,Value=WebApp}]'
```

#### IAMユーザーにタグを適用
```bash
# IAMユーザーにタグを適用
aws iam tag-user \
    --user-name john-doe \
    --tags Key=Department,Value=Engineering Key=Project,Value=WebApp Key=ClearanceLevel,Value=High
```

### 3. ABACポリシーの作成

#### 基本的なABACポリシー
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/Department": "${s3:ExistingObjectTag/Department}"
        }
      }
    }
  ]
}
```

#### 複雑なABACポリシー
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/Department": "${s3:ExistingObjectTag/Department}",
          "aws:PrincipalTag/Project": "${s3:ExistingObjectTag/Project}"
        },
        "StringNotEquals": {
          "aws:PrincipalTag/Environment": "Production"
        },
        "DateGreaterThan": {
          "aws:CurrentTime": "2024-01-01T09:00:00Z"
        },
        "DateLessThan": {
          "aws:CurrentTime": "2024-12-31T18:00:00Z"
        }
      }
    }
  ]
}
```

## ABACの活用例

### 1. マルチテナント環境での分離

#### テナント別アクセス制御
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/Tenant": "${aws:ResourceTag/Tenant}"
        }
      }
    }
  ]
}
```

#### テナント別リソース作成
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:CreateBucket",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "us-east-1"
        },
        "StringLike": {
          "aws:RequestTag/Tenant": "${aws:PrincipalTag/Tenant}"
        }
      }
    }
  ]
}
```

### 2. 環境別のアクセス制御

#### 開発環境での制限
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/Environment": "${s3:ExistingObjectTag/Environment}"
        },
        "StringNotEquals": {
          "aws:PrincipalTag/Environment": "Production"
        }
      }
    }
  ]
}
```

#### 本番環境での厳格な制御
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/Environment": "Production",
          "s3:ExistingObjectTag/Environment": "Production"
        },
        "Bool": {
          "aws:MultiFactorAuthPresent": "true"
        },
        "IpAddress": {
          "aws:SourceIp": "203.0.113.0/24"
        }
      }
    }
  ]
}
```

### 3. データ分類に基づくアクセス制御

#### 機密データへのアクセス制御
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/ClearanceLevel": "High"
        },
        "ForAnyValue:StringEquals": {
          "s3:ExistingObjectTag/DataClassification": ["Confidential", "Restricted"]
        }
      }
    },
    {
      "Effect": "Deny",
      "Action": "s3:PutObject",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "s3:ExistingObjectTag/DataClassification": "Restricted"
        },
        "StringNotEquals": {
          "aws:PrincipalTag/ClearanceLevel": "High"
        }
      }
    }
  ]
}
```

## ABACとRBACの比較

| 項目 | RBAC | ABAC |
|------|------|------|
| **柔軟性** | 低い | 高い |
| **管理の複雑さ** | 低い | 高い |
| **スケーラビリティ** | 限定的 | 高い |
| **動的制御** | 困難 | 容易 |
| **ポリシー数** | 多い | 少ない |
| **学習コスト** | 低い | 高い |
| **実装コスト** | 低い | 高い |
| **メンテナンス** | 容易 | 複雑 |

## ABACのベストプラクティス

### 1. タグ戦略の設計

#### 一貫性のあるタグ命名規則
```
✅ 組織全体で統一された命名規則
✅ 大文字・小文字の統一
✅ 特殊文字の制限
✅ タグの値の制約設定
```

#### 必須タグの定義
```json
{
  "requiredTags": [
    "Department",
    "Project",
    "Environment",
    "Owner"
  ],
  "optionalTags": [
    "CostCenter",
    "DataClassification",
    "ClearanceLevel"
  ]
}
```

### 2. ポリシーの設計

#### 最小権限の原則を適用
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/Department": "${s3:ExistingObjectTag/Department}"
        }
      }
    }
  ]
}
```

#### 条件の論理的な組み合わせ
```json
{
  "Condition": {
    "StringEquals": {
      "aws:PrincipalTag/Department": "${s3:ExistingObjectTag/Department}"
    },
    "StringNotEquals": {
      "aws:PrincipalTag/Environment": "Production"
    },
    "DateGreaterThan": {
      "aws:CurrentTime": "2024-01-01T09:00:00Z"
    }
  }
}
```

### 3. 運用管理

#### タグの自動化
```bash
# CloudFormationでのタグ自動設定
Resources:
  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      Tags:
        - Key: Department
          Value: !Ref Department
        - Key: Project
          Value: !Ref Project
        - Key: Environment
          Value: !Ref Environment
```

#### ポリシーの定期的な見直し
```
✅ 月次でのポリシー効果の確認
✅ 四半期でのタグ戦略の見直し
✅ 年次でのABAC全体の評価
```

## ABACの制限事項

### 1. 対応サービス
- すべてのAWSサービスがABACをサポートしているわけではない
- サービスごとにサポートされる属性が異なる
- 新しいサービスのABACサポートは段階的

### 2. パフォーマンス
- 複雑な条件は評価に時間がかかる場合がある
- 大量のリソースがある場合の影響を考慮
- 条件の数と複雑さのバランスが重要

### 3. デバッグの複雑さ
- アクセス拒否の原因特定が困難
- 条件の組み合わせによる予期しない動作
- ログの分析が複雑

## 実践的な移行戦略

### フェーズ1: 準備
```
1. タグ戦略の策定
2. 既存リソースへのタグ適用
3. テスト環境での検証
```

### フェーズ2: 段階的導入
```
1. 新規リソースからABACを適用
2. 既存ポリシーとの併用
3. 段階的な移行
```

### フェーズ3: 完全移行
```
1. 全リソースでABACを適用
2. 不要なRBACポリシーの削除
3. 運用プロセスの確立
```

## トラブルシューティング

### 1. タグが認識されない

#### タグの適用確認
```bash
# S3バケットのタグ確認
aws s3api get-bucket-tagging --bucket my-bucket

# EC2インスタンスのタグ確認
aws ec2 describe-tags --filters "Name=resource-id,Values=i-1234567890abcdef0"

# IAMユーザーのタグ確認
aws iam list-user-tags --user-name john-doe
```

### 2. 条件が正しく動作しない

#### ポリシーのテスト
```bash
# ポリシーのシミュレーション
aws iam simulate-principal-policy \
    --policy-source-arn arn:aws:iam::123456789012:user/john-doe \
    --action-names s3:GetObject \
    --resource-arns arn:aws:s3:::my-bucket/object.txt \
    --context-entries ContextKeyName=aws:PrincipalTag/Department,ContextKeyValues=Engineering,ContextKeyType=string
```

### 3. パフォーマンスの問題

#### 条件の最適化
```json
{
  "Condition": {
    "StringEquals": {
      "aws:PrincipalTag/Department": "Engineering"
    }
  }
}
```

## 次のステップ

1. **[IAM AccessAnalyzer](./07-IAM-AccessAnalyzer.md)** - セキュリティ分析と監査
2. **[条件キーとセッションポリシー](./09-条件キーとセッションポリシー.md)** - 詳細なアクセス制御
3. **[ベストプラクティス](./10-ベストプラクティス.md)** - セキュリティの強化

---

**重要**: ABACは強力なアクセス制御機能ですが、適切なタグ戦略とポリシー設計が重要です。段階的な導入を推奨します。
