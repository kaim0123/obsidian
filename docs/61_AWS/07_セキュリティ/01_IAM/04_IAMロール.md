# IAMロール

## 概要

**IAMロール**は、一時的な権限を付与するための仕組みです。ユーザーやサービスが、特定の条件下で一時的に権限を引き受けることができます。

## 特徴

### 1. 一時的な権限
- 永続的な認証情報ではなく、一時的な認証情報を使用
- セキュリティリスクの軽減
- 自動的な権限の期限切れ

### 2. 委任可能
- 他のAWSアカウントやサービスに権限を委任
- クロスアカウントアクセス
- サービス間の連携

### 3. 条件付きアクセス
- 特定の条件下でのみ権限を付与
- 時間制限、IP制限、MFA要求など
- 細かいアクセス制御

## IAMロールの種類

### 1. サービスロール

#### EC2インスタンス用ロール
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**使用場面:**
- EC2インスタンスがS3にアクセス
- EC2インスタンスがDynamoDBにアクセス
- EC2インスタンスが他のAWSサービスを利用

#### Lambda関数用ロール
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**使用場面:**
- Lambda関数がS3にアクセス
- Lambda関数がDynamoDBにアクセス
- Lambda関数が他のAWSサービスを利用

### 2. クロスアカウントロール

#### 信頼ポリシー
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "unique-external-id"
        }
      }
    }
  ]
}
```

**使用場面:**
- 複数のAWSアカウント間でのリソース共有
- 組織内での権限委任
- パートナーとの連携

### 3. フェデレーティッドロール

#### SAML連携
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:saml-provider/MySAMLProvider"
      },
      "Action": "sts:AssumeRoleWithSAML",
      "Condition": {
        "StringEquals": {
          "SAML:aud": "https://signin.aws.amazon.com/saml"
        }
      }
    }
  ]
}
```

**使用場面:**
- 企業のActive Directoryとの連携
- シングルサインオン（SSO）
- 外部IDプロバイダーとの連携

### 4. Web Identityロール

#### OIDC連携
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/accounts.google.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "accounts.google.com:aud": "123456789012-abcdefghijklmnop.apps.googleusercontent.com"
        }
      }
    }
  ]
}
```

**使用場面:**
- Google、Facebook、AmazonなどのOIDCプロバイダーとの連携
- モバイルアプリケーションでの認証
- Webアプリケーションでの認証

## IAMロールの作成

### 1. AWS Management Consoleでの作成

#### ステップ1: ロール作成
```
1. AWS Management Consoleにログイン
2. IAMサービスに移動
3. 「ロール」→「ロールを作成」
4. 信頼されたエンティティのタイプを選択
5. ロール名を入力
```

#### ステップ2: 信頼ポリシーの設定
```
1. 信頼されたエンティティを選択
2. 必要に応じて条件を追加
3. 「次のステップ: 権限」
```

#### ステップ3: 権限ポリシーの設定
```
1. 適切なポリシーを選択
2. 「次のステップ: タグ」
3. 必要に応じてタグを追加
4. 「ロールの作成」
```

### 2. AWS CLIでの作成

#### サービスロールの作成
```bash
# 信頼ポリシーファイルの作成
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# ロールの作成
aws iam create-role \
    --role-name EC2-S3-Access-Role \
    --assume-role-policy-document file://trust-policy.json

# ポリシーのアタッチ
aws iam attach-role-policy \
    --role-name EC2-S3-Access-Role \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
```

#### クロスアカウントロールの作成
```bash
# クロスアカウント信頼ポリシーの作成
cat > cross-account-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "unique-external-id"
        }
      }
    }
  ]
}
EOF

# クロスアカウントロールの作成
aws iam create-role \
    --role-name CrossAccountRole \
    --assume-role-policy-document file://cross-account-trust-policy.json
```

### 3. CloudFormationでの作成

#### テンプレート例
```yaml
Resources:
  EC2Role:
    Type: AWS::IAM::Role
    Properties:
      RoleName: EC2-S3-Access-Role
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: ec2.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
      Tags:
        - Key: Environment
          Value: Production
        - Key: Project
          Value: WebApp

  InstanceProfile:
    Type: AWS::IAM::InstanceProfile
    Properties:
      Roles:
        - !Ref EC2Role
```

## ロールの引き受け（Assume Role）

### 1. AWS CLIでの引き受け

#### 基本的な引き受け
```bash
# ロールの引き受け
aws sts assume-role \
    --role-arn arn:aws:iam::123456789012:role/MyRole \
    --role-session-name MySession

# 出力例
{
    "Credentials": {
        "AccessKeyId": "ASIAIOSFODNN7EXAMPLE",
        "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
        "SessionToken": "FQoGZXIvYXdzEBYaD...",
        "Expiration": "2024-01-15T11:30:00Z"
    },
    "AssumedRoleUser": {
        "AssumedRoleId": "AROACKCEVSQ6C2EXAMPLE:MySession",
        "Arn": "arn:aws:iam::123456789012:assumed-role/MyRole/MySession"
    }
}
```

#### 環境変数の設定
```bash
# 一時的な認証情報を環境変数に設定
export AWS_ACCESS_KEY_ID=ASIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_SESSION_TOKEN=FQoGZXIvYXdzEBYaD...

# AWS CLIでロールを使用
aws s3 ls
```

### 2. SDKでの引き受け

#### Python (boto3)
```python
import boto3

# STSクライアントの作成
sts_client = boto3.client('sts')

# ロールの引き受け
response = sts_client.assume_role(
    RoleArn='arn:aws:iam::123456789012:role/MyRole',
    RoleSessionName='MySession'
)

# 一時的な認証情報の取得
credentials = response['Credentials']

# 新しいセッションの作成
session = boto3.Session(
    aws_access_key_id=credentials['AccessKeyId'],
    aws_secret_access_key=credentials['SecretAccessKey'],
    aws_session_token=credentials['SessionToken']
)

# S3クライアントの作成
s3_client = session.client('s3')
```

#### JavaScript (AWS SDK)
```javascript
const AWS = require('aws-sdk');

// STSクライアントの作成
const sts = new AWS.STS();

// ロールの引き受け
sts.assumeRole({
    RoleArn: 'arn:aws:iam::123456789012:role/MyRole',
    RoleSessionName: 'MySession'
}, (err, data) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    // 一時的な認証情報の設定
    AWS.config.update({
        accessKeyId: data.Credentials.AccessKeyId,
        secretAccessKey: data.Credentials.SecretAccessKey,
        sessionToken: data.Credentials.SessionToken
    });
    
    // S3クライアントの作成
    const s3 = new AWS.S3();
});
```

### 3. 条件付き引き受け

#### MFA要求
```bash
# MFAトークン付きでロールを引き受け
aws sts assume-role \
    --role-arn arn:aws:iam::123456789012:role/MyRole \
    --role-session-name MySession \
    --serial-number arn:aws:iam::123456789012:mfa/john-doe \
    --token-code 123456
```

#### 外部ID
```bash
# 外部ID付きでロールを引き受け
aws sts assume-role \
    --role-arn arn:aws:iam::123456789012:role/MyRole \
    --role-session-name MySession \
    --external-id unique-external-id
```

## ロールの管理

### 1. ロール情報の確認

#### ロール一覧の取得
```bash
# ロール一覧の取得
aws iam list-roles

# 特定ロールの情報取得
aws iam get-role --role-name MyRole
```

#### 信頼ポリシーの確認
```bash
# 信頼ポリシーの確認
aws iam get-role --role-name MyRole --query 'Role.AssumeRolePolicyDocument'
```

#### アタッチされたポリシーの確認
```bash
# アタッチされたポリシーの確認
aws iam list-attached-role-policies --role-name MyRole

# インラインポリシーの確認
aws iam list-role-policies --role-name MyRole
```

### 2. ロールの更新

#### 信頼ポリシーの更新
```bash
# 信頼ポリシーの更新
aws iam update-assume-role-policy \
    --role-name MyRole \
    --policy-document file://new-trust-policy.json
```

#### ポリシーのアタッチ/デタッチ
```bash
# ポリシーのアタッチ
aws iam attach-role-policy \
    --role-name MyRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# ポリシーのデタッチ
aws iam detach-role-policy \
    --role-name MyRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

### 3. ロールの削除

```bash
# ポリシーのデタッチ
aws iam detach-role-policy \
    --role-name MyRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# ロールの削除
aws iam delete-role --role-name MyRole
```

## 実践的な使用例

### 1. EC2インスタンスでの使用

#### インスタンスプロファイルの作成
```bash
# インスタンスプロファイルの作成
aws iam create-instance-profile \
    --instance-profile-name EC2-S3-InstanceProfile

# ロールをインスタンスプロファイルに追加
aws iam add-role-to-instance-profile \
    --instance-profile-name EC2-S3-InstanceProfile \
    --role-name EC2-S3-Access-Role
```

#### EC2インスタンスでの使用
```python
import boto3

# EC2インスタンスからS3にアクセス
s3_client = boto3.client('s3')

# バケット一覧の取得
response = s3_client.list_buckets()
print(response['Buckets'])
```

### 2. Lambda関数での使用

#### Lambda関数用ロールの作成
```bash
# Lambda関数用ロールの作成
aws iam create-role \
    --role-name Lambda-S3-Role \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }'

# ポリシーのアタッチ
aws iam attach-role-policy \
    --role-name Lambda-S3-Role \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
```

#### Lambda関数での使用
```python
import json
import boto3

def lambda_handler(event, context):
    # S3クライアントの作成
    s3_client = boto3.client('s3')
    
    # バケット一覧の取得
    response = s3_client.list_buckets()
    
    return {
        'statusCode': 200,
        'body': json.dumps(response['Buckets'])
    }
```

### 3. クロスアカウントアクセス

#### アカウントA（信頼する側）
```bash
# クロスアカウントロールの作成
aws iam create-role \
    --role-name CrossAccountRole \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "AWS": "arn:aws:iam::123456789012:root"
                },
                "Action": "sts:AssumeRole",
                "Condition": {
                    "StringEquals": {
                        "sts:ExternalId": "unique-external-id"
                    }
                }
            }
        ]
    }'
```

#### アカウントB（信頼される側）
```bash
# ロールの引き受け
aws sts assume-role \
    --role-arn arn:aws:iam::987654321098:role/CrossAccountRole \
    --role-session-name CrossAccountSession \
    --external-id unique-external-id
```

## セキュリティの考慮事項

### 1. 最小権限の原則
- 必要最小限の権限のみ付与
- 定期的な権限の見直し
- 未使用権限の削除

### 2. 条件の活用
- 時間制限の設定
- IP制限の設定
- MFA要求の設定

### 3. 監視とログ
- CloudTrailでの監視
- 異常なアクセスの検出
- 定期的な監査

## トラブルシューティング

### 1. ロールの引き受けエラー

#### 信頼ポリシーの問題
```
エラー: Access Denied
原因: 信頼ポリシーが正しく設定されていない
解決策: 信頼ポリシーを確認・修正
```

#### 条件の不適合
```
エラー: Access Denied
原因: 条件が満たされていない
解決策: 条件を確認・修正
```

### 2. 権限不足エラー

#### ポリシーの不足
```
エラー: Access Denied
原因: 必要な権限が不足
解決策: 適切なポリシーをアタッチ
```

## ベストプラクティス

### 1. セキュリティ
- **最小権限の原則**: 必要最小限の権限のみ付与
- **条件の活用**: 適切な条件を設定
- **定期的な監査**: 権限の見直しと未使用権限の削除

### 2. 管理
- **命名規則**: 一貫性のあるロール名
- **タグの活用**: ロールの分類と管理
- **ドキュメント化**: ロールの目的と使用方法を記録

### 3. 運用
- **自動化**: ロールの作成と管理の自動化
- **監視**: ロールの使用状況の監視
- **バックアップ**: 重要なロールの設定をバックアップ

## 次のステップ

1. **[IAMポリシー](./05-IAMポリシー.md)** - 詳細な権限制御
2. **[ABAC](./06-ABAC.md)** - 属性ベースアクセス制御
3. **[ベストプラクティス](./10-ベストプラクティス.md)** - セキュリティの強化

---

**重要**: IAMロールは一時的な権限を提供する強力な機能です。適切な信頼ポリシーと条件を設定して、セキュリティを確保してください。
