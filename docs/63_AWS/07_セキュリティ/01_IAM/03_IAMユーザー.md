# IAMユーザー

## 概要

**IAMユーザー**は、AWSアカウント内で作成できる個別のユーザーアカウントです。日常業務で使用するためのユーザーアカウントとして設計されています。

## 特徴

### 1. 個別の権限設定
- 必要最小限の権限のみ付与可能
- ユーザーごとに異なる権限を設定
- 細かいアクセス制御が可能

### 2. 複数作成可能
- 用途に応じて複数のユーザーを作成
- 最大5,000ユーザーまで作成可能
- 組織の規模に応じてスケール

### 3. 削除可能
- 不要になったら削除可能
- 一時的なユーザーも作成可能
- ライフサイクル管理が容易

### 4. アクセスキー
- プログラムからのアクセス用のキーを発行可能
- APIアクセス用の認証情報
- 一時的な認証情報も利用可能

## IAMユーザーの種類

### 1. 管理者ユーザー

#### 権限ポリシー
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }
  ]
}
```

#### 使用場面
- システム管理者
- 緊急時の対応
- 初期設定

#### 注意点
- 最小権限の原則に反する
- セキュリティリスクが高い
- 監査が困難

### 2. 開発者ユーザー

#### 権限ポリシー
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "ec2:DescribeInstances",
        "ec2:StartInstances",
        "ec2:StopInstances",
        "lambda:InvokeFunction",
        "lambda:ListFunctions"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Deny",
      "Action": [
        "iam:*",
        "organizations:*",
        "account:*"
      ],
      "Resource": "*"
    }
  ]
}
```

#### 使用場面
- アプリケーション開発
- テスト環境での作業
- デプロイメント

### 3. 読み取り専用ユーザー

#### 権限ポリシー
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "ec2:Describe*",
        "rds:Describe*",
        "cloudwatch:Get*",
        "cloudwatch:List*"
      ],
      "Resource": "*"
    }
  ]
}
```

#### 使用場面
- 監視・監査
- レポート作成
- トラブルシューティング

### 4. 特定サービス専用ユーザー

#### S3専用ユーザー
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-app-bucket",
        "arn:aws:s3:::my-app-bucket/*"
      ]
    }
  ]
}
```

#### EC2専用ユーザー
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:RebootInstances"
      ],
      "Resource": "*"
    }
  ]
}
```

## IAMユーザーの作成

### 1. AWS Management Consoleでの作成

#### ステップ1: ユーザー作成
```
1. AWS Management Consoleにログイン
2. IAMサービスに移動
3. 「ユーザー」→「ユーザーを追加」
4. ユーザー名を入力
5. 「プログラムによるアクセス」を選択
```

#### ステップ2: 権限の設定
```
1. 「既存のポリシーを直接アタッチ」
2. 適切なポリシーを選択
3. 「次のステップ: タグ」
4. 必要に応じてタグを追加
5. 「ユーザーの作成」
```

#### ステップ3: 認証情報の保存
```
1. アクセスキーIDとシークレットアクセスキーを保存
2. CSVファイルをダウンロード
3. 安全な場所に保管
```

### 2. AWS CLIでの作成

#### ユーザー作成
```bash
# ユーザーの作成
aws iam create-user \
    --user-name john-doe \
    --tags Key=Department,Value=Engineering Key=Project,Value=WebApp

# 出力例
{
    "User": {
        "UserName": "john-doe",
        "Path": "/",
        "CreateDate": "2024-01-15T10:30:00Z",
        "UserId": "AIDACKCEVSQ6C2EXAMPLE",
        "Arn": "arn:aws:iam::123456789012:user/john-doe"
    }
}
```

#### アクセスキーの作成
```bash
# アクセスキーの作成
aws iam create-access-key \
    --user-name john-doe

# 出力例
{
    "AccessKey": {
        "UserName": "john-doe",
        "AccessKeyId": "AKIAIOSFODNN7EXAMPLE",
        "Status": "Active",
        "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
        "CreateDate": "2024-01-15T10:30:00Z"
    }
}
```

#### ポリシーのアタッチ
```bash
# ポリシーのアタッチ
aws iam attach-user-policy \
    --user-name john-doe \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
```

### 3. CloudFormationでの作成

#### テンプレート例
```yaml
Resources:
  DeveloperUser:
    Type: AWS::IAM::User
    Properties:
      UserName: developer-user
      Groups:
        - !Ref DeveloperGroup
      Tags:
        - Key: Department
          Value: Engineering
        - Key: Project
          Value: WebApp

  DeveloperGroup:
    Type: AWS::IAM::Group
    Properties:
      GroupName: developers
      Policies:
        - PolicyName: DeveloperPolicy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - s3:GetObject
                  - s3:PutObject
                  - ec2:Describe*
                Resource: '*'

  DeveloperAccessKey:
    Type: AWS::IAM::AccessKey
    Properties:
      UserName: !Ref DeveloperUser
```

## IAMユーザーの管理

### 1. ユーザー情報の確認

#### ユーザー一覧の取得
```bash
# ユーザー一覧の取得
aws iam list-users

# 特定ユーザーの情報取得
aws iam get-user --user-name john-doe
```

#### アタッチされたポリシーの確認
```bash
# アタッチされたポリシーの確認
aws iam list-attached-user-policies --user-name john-doe

# インラインポリシーの確認
aws iam list-user-policies --user-name john-doe
```

### 2. 権限の変更

#### ポリシーのアタッチ
```bash
# ポリシーのアタッチ
aws iam attach-user-policy \
    --user-name john-doe \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

#### ポリシーのデタッチ
```bash
# ポリシーのデタッチ
aws iam detach-user-policy \
    --user-name john-doe \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

### 3. アクセスキーの管理

#### アクセスキー一覧の確認
```bash
# アクセスキー一覧の確認
aws iam list-access-keys --user-name john-doe
```

#### アクセスキーの無効化
```bash
# アクセスキーの無効化
aws iam update-access-key \
    --user-name john-doe \
    --access-key-id AKIAIOSFODNN7EXAMPLE \
    --status Inactive
```

#### アクセスキーの削除
```bash
# アクセスキーの削除
aws iam delete-access-key \
    --user-name john-doe \
    --access-key-id AKIAIOSFODNN7EXAMPLE
```

## セキュリティの強化

### 1. 多要素認証（MFA）の設定

#### ソフトウェアMFAの設定
```bash
# 仮想MFAデバイスの作成
aws iam create-virtual-mfa-device \
    --virtual-mfa-device-name john-doe-mfa \
    --outfile QRCode.png \
    --bootstrap-method QRCodePNG

# MFAデバイスの有効化
aws iam enable-mfa-device \
    --user-name john-doe \
    --serial-number arn:aws:iam::123456789012:mfa/john-doe-mfa \
    --authentication-code1 123456 \
    --authentication-code2 789012
```

#### ハードウェアMFAの設定
```bash
# ハードウェアMFAデバイスの有効化
aws iam enable-mfa-device \
    --user-name john-doe \
    --serial-number GAHT12345678 \
    --authentication-code1 123456 \
    --authentication-code2 789012
```

### 2. パスワードポリシーの設定

#### パスワードポリシーの作成
```bash
# パスワードポリシーの設定
aws iam update-account-password-policy \
    --minimum-password-length 12 \
    --require-symbols \
    --require-numbers \
    --require-uppercase-characters \
    --require-lowercase-characters \
    --max-password-age 90 \
    --password-reuse-prevention 5
```

### 3. アクセスキーのローテーション

#### ローテーション手順
```bash
# 1. 新しいアクセスキーを作成
aws iam create-access-key --user-name john-doe

# 2. アプリケーションで新しいキーをテスト
# 3. 古いアクセスキーを無効化
aws iam update-access-key \
    --user-name john-doe \
    --access-key-id OLD_ACCESS_KEY_ID \
    --status Inactive

# 4. 古いアクセスキーを削除
aws iam delete-access-key \
    --user-name john-doe \
    --access-key-id OLD_ACCESS_KEY_ID
```

## グループの活用

### 1. グループの作成

#### 開発者グループ
```bash
# グループの作成
aws iam create-group --group-name developers

# ポリシーのアタッチ
aws iam attach-group-policy \
    --group-name developers \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
```

#### 管理者グループ
```bash
# 管理者グループの作成
aws iam create-group --group-name administrators

# 管理者ポリシーのアタッチ
aws iam attach-group-policy \
    --group-name administrators \
    --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

### 2. ユーザーをグループに追加

```bash
# ユーザーをグループに追加
aws iam add-user-to-group \
    --group-name developers \
    --user-name john-doe
```

### 3. グループの利点

- **権限の一元管理**: グループレベルで権限を管理
- **効率的な管理**: 複数ユーザーに一括で権限を付与
- **一貫性の確保**: 同じ役割のユーザーに同じ権限を付与

## 監査とモニタリング

### 1. CloudTrailでの監視

#### ユーザーアクティビティの追跡
```json
{
  "eventTime": "2024-01-15T10:30:00Z",
  "eventName": "GetObject",
  "userIdentity": {
    "type": "IAMUser",
    "principalId": "AIDACKCEVSQ6C2EXAMPLE",
    "arn": "arn:aws:iam::123456789012:user/john-doe",
    "userName": "john-doe"
  },
  "sourceIPAddress": "203.0.113.12",
  "userAgent": "aws-cli/2.0.0"
}
```

### 2. アクセス分析

#### 未使用権限の特定
```bash
# ユーザーのアクセス分析
aws iam generate-service-last-accessed-details \
    --arn arn:aws:iam::123456789012:user/john-doe
```

### 3. セキュリティ監査

#### 定期的な権限見直し
```bash
# ユーザーの権限一覧
aws iam list-attached-user-policies --user-name john-doe
aws iam list-user-policies --user-name john-doe
aws iam get-groups-for-user --user-name john-doe
```

## トラブルシューティング

### 1. アクセス拒否エラー

#### 権限不足の場合
```
エラー: Access Denied
原因: 必要な権限が不足
解決策: 適切なポリシーをアタッチ
```

#### ポリシーの競合
```
エラー: Explicit Deny
原因: Denyポリシーが優先
解決策: ポリシーの順序を確認
```

### 2. アクセスキーの問題

#### 無効なアクセスキー
```
エラー: InvalidAccessKeyId
原因: アクセスキーが無効
解決策: 新しいアクセスキーを作成
```

#### 期限切れの認証情報
```
エラー: TokenExpired
原因: 一時的な認証情報の期限切れ
解決策: 新しい認証情報を取得
```

## ベストプラクティス

### 1. セキュリティ
- **最小権限の原則**: 必要最小限の権限のみ付与
- **MFAの有効化**: すべてのユーザーにMFAを設定
- **定期的な権限見直し**: 月次での権限確認
- **アクセスキーのローテーション**: 90日ごとのローテーション

### 2. 管理
- **グループの活用**: 効率的な権限管理
- **タグの活用**: ユーザーの分類と管理
- **命名規則**: 一貫性のあるユーザー名
- **ドキュメント化**: 権限の目的と理由を記録

### 3. 監視
- **CloudTrailの有効化**: すべての操作をログ記録
- **異常なアクセスの監視**: CloudWatchでの監視
- **定期的な監査**: 四半期でのセキュリティ監査

## 次のステップ

1. **[IAMロール](./04-IAMロール.md)** - 一時的な権限の管理
2. **[IAMポリシー](./05-IAMポリシー.md)** - 詳細な権限制御
3. **[ベストプラクティス](./10-ベストプラクティス.md)** - セキュリティの強化

---

**重要**: IAMユーザーは日常業務で使用するためのアカウントです。適切な権限設定とセキュリティ対策を実施してください。
