# IAM AccessAnalyzer

## 概要

**IAM AccessAnalyzer**は、AWSリソースへのアクセス権限を自動的に分析し、セキュリティリスクを特定するサービスです。未使用の権限や過剰な権限、意図しない公開リソースなどを検出できます。

## 主な機能

### 1. アクセス権限の分析
- **未使用の権限**: 実際に使用されていない権限を特定
- **過剰な権限**: 必要以上に広い権限を検出
- **外部アクセス**: 組織外からのアクセスを監視

### 2. セキュリティリスクの特定
- **パブリックアクセス**: 意図しない公開リソースを検出
- **クロスアカウントアクセス**: 他のアカウントからのアクセスを分析
- **サービスリンクロール**: サービス間の権限関係を監視

### 3. 継続的な監視
- **定期的な分析**: 設定された間隔で自動分析
- **リアルタイム検出**: 新しいリスクの即座な検出
- **トレンド分析**: セキュリティ状況の変化を追跡

## AccessAnalyzerの種類

### 1. アカウント分析

#### 対象範囲
```
対象: アカウント内の全リソース
用途: 全体的なセキュリティ状況の把握
```

#### 分析内容
- IAMユーザー、ロール、ポリシーの分析
- S3バケット、SNSトピック、SQSキューなどの分析
- 未使用権限の特定
- 過剰権限の検出

### 2. 組織分析

#### 対象範囲
```
対象: 組織内の複数アカウント
用途: 組織全体のセキュリティ管理
```

#### 分析内容
- 組織内の全アカウントの統合分析
- クロスアカウントアクセスの監視
- 組織レベルのセキュリティポリシーの適用状況
- 一貫性のない権限設定の検出

### 3. 外部アクセス分析

#### 対象範囲
```
対象: 外部エンティティからのアクセス
用途: 外部からの不正アクセスの検出
```

#### 分析内容
- パブリックリソースの検出
- 外部アカウントからのアクセス分析
- 意図しない公開の検出
- セキュリティリスクの評価

## 分析結果の種類

### 1. アクティブな警告

#### 外部アクセス警告
```json
{
  "findingType": "ExternalAccess",
  "resource": "arn:aws:s3:::my-bucket",
  "principal": {
    "AWS": "arn:aws:iam::123456789012:root"
  },
  "action": ["s3:GetObject"],
  "isPublic": true,
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### 未使用IAMロール警告
```json
{
  "findingType": "UnusedIAMRole",
  "resource": "arn:aws:iam::123456789012:role/UnusedRole",
  "lastAccessed": "2023-06-01T00:00:00Z",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### 過剰権限警告
```json
{
  "findingType": "OverlyPermissivePolicy",
  "resource": "arn:aws:iam::123456789012:policy/OverlyPermissivePolicy",
  "principal": {
    "AWS": "arn:aws:iam::123456789012:user/john-doe"
  },
  "action": ["*"],
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 2. アーカイブされた警告

#### 解決済み警告
```json
{
  "findingType": "ExternalAccess",
  "resource": "arn:aws:s3:::my-bucket",
  "status": "ARCHIVED",
  "archivedAt": "2024-01-15T10:30:00Z",
  "reason": "RESOLVED"
}
```

#### 誤検知警告
```json
{
  "findingType": "UnusedIAMRole",
  "resource": "arn:aws:iam::123456789012:role/SystemRole",
  "status": "ARCHIVED",
  "archivedAt": "2024-01-15T10:30:00Z",
  "reason": "FALSE_POSITIVE"
}
```

## 設定手順

### 1. アナライザーの作成

#### AWS Management Consoleでの作成
```
1. AWS Management Consoleにログイン
2. IAMサービスに移動
3. 「Access Analyzer」を選択
4. 「Create analyzer」をクリック
5. アナライザー名を入力
6. 分析対象のリージョンを選択
7. 「Create analyzer」をクリック
```

#### AWS CLIでの作成
```bash
# アナライザーの作成
aws accessanalyzer create-analyzer \
    --analyzer-name MyAnalyzer \
    --type ACCOUNT \
    --region us-east-1

# 出力例
{
    "arn": "arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer"
}
```

#### CloudFormationでの作成
```yaml
Resources:
  MyAnalyzer:
    Type: AWS::AccessAnalyzer::Analyzer
    Properties:
      AnalyzerName: MyAnalyzer
      Type: ACCOUNT
      Tags:
        - Key: Environment
          Value: Production
        - Key: Project
          Value: SecurityAudit
```

### 2. 分析の実行

#### 手動分析の実行
```bash
# 特定リソースの分析
aws accessanalyzer start-resource-scan \
    --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer \
    --resource-arn arn:aws:s3:::my-bucket

# 全リソースの分析
aws accessanalyzer start-resource-scan \
    --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer \
    --resource-arn "*"
```

#### 自動分析の設定
```bash
# アナライザーの設定更新
aws accessanalyzer update-analyzer \
    --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer \
    --archive-rules '[{
        "ruleName": "ArchiveOldFindings",
        "filter": {
            "updatedAt": {
                "start": "2024-01-01T00:00:00Z",
                "end": "2024-01-31T23:59:59Z"
            }
        }
    }]'
```

### 3. 結果の確認

#### 分析結果の取得
```bash
# 分析結果の一覧取得
aws accessanalyzer list-findings \
    --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer

# 特定の警告の詳細取得
aws accessanalyzer get-finding \
    --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer \
    --id finding-id-123
```

#### フィルタリング
```bash
# 特定タイプの警告のみ取得
aws accessanalyzer list-findings \
    --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer \
    --filter '{"findingType": {"eq": ["ExternalAccess"]}}'

# アクティブな警告のみ取得
aws accessanalyzer list-findings \
    --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer \
    --filter '{"status": {"eq": ["ACTIVE"]}}'
```

## 実践的な活用例

### 1. S3バケットのセキュリティ監査

#### パブリックアクセスの検出
```json
{
  "findings": [
    {
      "findingType": "ExternalAccess",
      "resource": "arn:aws:s3:::public-bucket",
      "principal": "*",
      "action": ["s3:GetObject"],
      "isPublic": true,
      "recommendation": "バケットポリシーを確認し、必要に応じて制限を追加"
    }
  ]
}
```

#### 対応手順
```bash
# 1. バケットポリシーの確認
aws s3api get-bucket-policy --bucket public-bucket

# 2. パブリックアクセスの無効化
aws s3api put-public-access-block \
    --bucket public-bucket \
    --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# 3. 警告をアーカイブ
aws accessanalyzer update-findings \
    --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer \
    --ids finding-id-123 \
    --status ARCHIVED \
    --reason RESOLVED
```

### 2. IAMロールの最適化

#### 未使用ロールの検出
```json
{
  "findings": [
    {
      "findingType": "UnusedIAMRole",
      "resource": "arn:aws:iam::123456789012:role/OldRole",
      "lastAccessed": "2023-06-01T00:00:00Z",
      "recommendation": "90日以上未使用のロールを削除することを検討"
    }
  ]
}
```

#### 対応手順
```bash
# 1. ロールの使用状況確認
aws iam get-role --role-name OldRole

# 2. ロールの削除（必要に応じて）
aws iam delete-role --role-name OldRole

# 3. 警告をアーカイブ
aws accessanalyzer update-findings \
    --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer \
    --ids finding-id-456 \
    --status ARCHIVED \
    --reason RESOLVED
```

### 3. クロスアカウントアクセスの監視

#### 外部アカウントアクセスの検出
```json
{
  "findings": [
    {
      "findingType": "CrossAccountAccess",
      "resource": "arn:aws:s3:::shared-bucket",
      "principal": {
        "AWS": "arn:aws:iam::987654321098:root"
      },
      "action": ["s3:PutObject", "s3:DeleteObject"],
      "recommendation": "外部アカウントからのアクセス権限を再検討"
    }
  ]
}
```

#### 対応手順
```bash
# 1. バケットポリシーの確認
aws s3api get-bucket-policy --bucket shared-bucket

# 2. 必要に応じてポリシーを更新
aws s3api put-bucket-policy \
    --bucket shared-bucket \
    --policy file://updated-bucket-policy.json

# 3. 警告をアーカイブ
aws accessanalyzer update-findings \
    --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer \
    --ids finding-id-789 \
    --status ARCHIVED \
    --reason RESOLVED
```

## 自動化とモニタリング

### 1. CloudWatch Eventsとの連携

#### イベントルールの作成
```json
{
  "source": ["aws.access-analyzer"],
  "detail-type": ["Access Analyzer Finding"],
  "detail": {
    "findingType": ["ExternalAccess", "UnusedIAMRole", "OverlyPermissivePolicy"]
  }
}
```

#### Lambda関数での自動対応
```python
import json
import boto3

def lambda_handler(event, context):
    accessanalyzer = boto3.client('accessanalyzer')
    sns = boto3.client('sns')
    
    for record in event['Records']:
        finding = json.loads(record['body'])
        
        # 高優先度の警告を通知
        if finding['findingType'] == 'ExternalAccess':
            sns.publish(
                TopicArn='arn:aws:sns:us-east-1:123456789012:security-alerts',
                Message=f"外部アクセスが検出されました: {finding['resource']}",
                Subject="Access Analyzer Alert"
            )
        
        # 自動アーカイブ（条件に応じて）
        if finding['findingType'] == 'UnusedIAMRole':
            accessanalyzer.update_findings(
                analyzerArn=finding['analyzerArn'],
                ids=[finding['id']],
                status='ARCHIVED',
                reason='AUTO_RESOLVED'
            )
    
    return {
        'statusCode': 200,
        'body': json.dumps('Processing completed')
    }
```

### 2. 定期的なレポート生成

#### 週次レポートの生成
```python
import boto3
import json
from datetime import datetime, timedelta

def generate_weekly_report():
    accessanalyzer = boto3.client('accessanalyzer')
    
    # 過去7日間の警告を取得
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    findings = accessanalyzer.list_findings(
        analyzerArn='arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer',
        filter={
            'createdAt': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            }
        }
    )
    
    # レポートの生成
    report = {
        'period': f"{start_date.date()} to {end_date.date()}",
        'totalFindings': len(findings['findings']),
        'findingTypes': {},
        'recommendations': []
    }
    
    # 警告タイプ別の集計
    for finding in findings['findings']:
        finding_type = finding['findingType']
        if finding_type not in report['findingTypes']:
            report['findingTypes'][finding_type] = 0
        report['findingTypes'][finding_type] += 1
    
    return report
```

### 3. ダッシュボードの作成

#### CloudWatchダッシュボード
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/AccessAnalyzer", "Findings", "FindingType", "ExternalAccess"],
          ["AWS/AccessAnalyzer", "Findings", "FindingType", "UnusedIAMRole"],
          ["AWS/AccessAnalyzer", "Findings", "FindingType", "OverlyPermissivePolicy"]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "us-east-1",
        "title": "Access Analyzer Findings"
      }
    }
  ]
}
```

## ベストプラクティス

### 1. 定期的な分析

#### 分析スケジュール
```
✅ 週次での自動分析実行
✅ 月次での結果レビュー
✅ 四半期での権限見直し
✅ 年次でのセキュリティ監査
```

#### 分析の自動化
```bash
# EventBridgeルールの作成
aws events put-rule \
    --name "AccessAnalyzerWeeklyScan" \
    --schedule-expression "rate(7 days)" \
    --description "Weekly Access Analyzer scan"

# Lambda関数のターゲット設定
aws events put-targets \
    --rule "AccessAnalyzerWeeklyScan" \
    --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:123456789012:function:AccessAnalyzerScan"
```

### 2. 結果の活用

#### 優先度に基づく対応
```
✅ 高優先度の警告から対応
✅ 未使用権限の削除
✅ 過剰権限の最小化
✅ セキュリティポリシーの更新
```

#### 対応の追跡
```python
def track_remediation(finding_id, action_taken, status):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('AccessAnalyzerRemediation')
    
    table.put_item(
        Item={
            'findingId': finding_id,
            'actionTaken': action_taken,
            'status': status,
            'timestamp': datetime.now().isoformat()
        }
    )
```

### 3. 組織での運用

#### セキュリティチームでの共有
```
✅ 定期的なレポートの配布
✅ 重要度の高い警告の即座な通知
✅ 対応状況の追跡
✅ 改善アクションの記録
```

#### コンプライアンス要件への対応
```
✅ 規制要件に応じた分析項目の設定
✅ 監査ログの保持
✅ レポートの生成と配布
✅ 改善計画の策定と実行
```

## トラブルシューティング

### 1. 分析が実行されない

#### アナライザーの状態確認
```bash
# アナライザーの状態確認
aws accessanalyzer get-analyzer \
    --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer

# 分析履歴の確認
aws accessanalyzer list-analyzed-resources \
    --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer
```

#### 権限の確認
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "access-analyzer:*",
        "iam:Get*",
        "iam:List*",
        "s3:GetBucketPolicy",
        "s3:GetBucketAcl"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2. 誤検知の対応

#### 誤検知のアーカイブ
```bash
# 誤検知としてアーカイブ
aws accessanalyzer update-findings \
    --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer \
    --ids finding-id-123 \
    --status ARCHIVED \
    --reason FALSE_POSITIVE
```

#### アーカイブルールの設定
```bash
# 自動アーカイブルールの設定
aws accessanalyzer update-analyzer \
    --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer \
    --archive-rules '[{
        "ruleName": "ArchiveSystemRoles",
        "filter": {
            "resource": {
                "contains": ["arn:aws:iam::123456789012:role/AWSServiceRole"]
            }
        }
    }]'
```

### 3. パフォーマンスの問題

#### 分析の最適化
```bash
# 特定リソースのみの分析
aws accessanalyzer start-resource-scan \
    --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAnalyzer \
    --resource-arn arn:aws:s3:::specific-bucket

# 分析のスケジューリング
aws events put-rule \
    --name "AccessAnalyzerOffPeakScan" \
    --schedule-expression "cron(0 2 * * ? *)" \
    --description "Off-peak Access Analyzer scan"
```

## 料金

### 1. 基本料金
- **分析**: 分析されたリソースあたりの料金
- **警告**: 生成された警告あたりの料金
- **ストレージ**: アーカイブされた警告の保存料金

### 2. 料金最適化
```
✅ 必要なリソースのみを分析対象に設定
✅ 定期的なアーカイブの実施
✅ 分析頻度の最適化
✅ 不要な警告の削除
```

## 次のステップ

1. **[ベストプラクティス](./10-ベストプラクティス.md)** - セキュリティの強化
2. **[コンプライアンスと監査](./13-コンプライアンスと監査.md)** - 規制要件への対応
3. **[実践的な設定例](./11-実践的な設定例.md)** - 具体的な設定手順

---

**重要**: AccessAnalyzerは継続的なセキュリティ監視の重要なツールです。定期的な分析と適切な対応を実施してください。
