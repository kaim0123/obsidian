# NoSQL vs RDB 比較 - 認証・権限管理システムにおける選択

## 概要

テナント・ユーザー管理システムを中央認証・権限管理システム（IAMシステム）として拡張する場合、データベース選択は非常に重要です。

### 中央認証・権限管理システムとは

```
機能:
- 複数システム・アプリケーションの統合認証（SSO）
- きめ細かい権限管理（RBAC、ABAC）
- ユーザー、グループ、ロール、権限の管理
- 監査ログ
- API認証・認可
```

## NoSQL（DynamoDB）のメリット・デメリット

### メリット ✅

#### 1. スケーラビリティ
```
- 自動スケーリング
- 数百万ユーザーでも安定したパフォーマンス
- パーティション分散で高スループット

例: 1秒間に10万リクエストでも対応可能
```

#### 2. 低レイテンシ
```
- ミリ秒未満のレスポンス
- グローバルテーブルで地理的分散
- キャッシング不要な速度

例: 認証トークン検証が1ms未満
```

#### 3. サーバーレスとの親和性
```
- マネージド型サービス
- サーバー管理不要
- Lambdaとの統合が容易

コスト: 小規模なら月額$5未満
```

#### 4. 柔軟なスキーマ
```
- スキーマレス
- 属性の追加が容易
- バージョン管理が簡単

例: 新しいカスタム属性を即座に追加可能
```

#### 5. 可用性
```
- 99.99%の可用性SLA
- 自動レプリケーション
- ポイントインタイムリカバリ

ダウンタイム: ほぼゼロ
```

### デメリット ❌

#### 1. 複雑なクエリの困難さ
```
問題: 
- JOINができない
- 複雑な検索が難しい
- フィルタリングが非効率

例: 「部署Aのマネージャーで、プロジェクトXへのアクセス権を持つユーザー」
→ DynamoDBでは複数回のクエリとアプリケーション側での結合が必要
```

```python
# DynamoDBでの複雑なクエリ（非効率）
# ステップ1: 部署Aのユーザーを取得
users_in_dept_a = query_users_by_department('A')

# ステップ2: 各ユーザーのロールを取得
managers = []
for user in users_in_dept_a:
    roles = get_user_roles(user['userId'])
    if 'manager' in roles:
        managers.append(user)

# ステップ3: 各マネージャーの権限を確認
result = []
for manager in managers:
    permissions = get_user_permissions(manager['userId'])
    if has_access_to_project(permissions, 'X'):
        result.append(manager)

# → 数百のクエリが必要になる可能性
```

#### 2. トランザクション制限
```
問題:
- 最大25項目までのトランザクション
- 複雑な整合性制約が困難
- 外部キー制約がない

例: ユーザー削除時に関連する権限、ロール、ログも削除する
→ 複数のトランザクションに分割する必要がある
```

#### 3. リレーションシップの管理
```
問題:
- 多対多の関係が複雑
- 参照整合性の保証が困難
- データの重複が発生しやすい

例: ユーザー ←→ グループ ←→ 権限の関係
```

```
ユーザー: user123
  ↓
グループ: [group1, group2, group3]
  ↓
各グループの権限を個別に取得する必要がある
```

#### 4. 集計・分析の困難さ
```
問題:
- COUNT、SUMなどの集計が非効率
- レポート生成が困難
- ビジネスインテリジェンスツールとの統合が限定的

例: 「各部署の権限別ユーザー数」のレポート
→ 全データをスキャンして集計する必要
```

#### 5. 学習曲線
```
問題:
- シングルテーブルデザインは習得が難しい
- アクセスパターンの事前設計が必須
- 柔軟な変更が困難

例: 新しい検索要件が出た場合、GSIの追加やテーブル再設計が必要
```

## RDB（Aurora Serverless）のメリット・デメリット

### メリット ✅

#### 1. 複雑なクエリが容易
```
SQLの強力さ:
- JOIN、サブクエリ、UNION
- 複雑な条件での検索
- 集計関数（COUNT、GROUP BY）

例: 「部署Aのマネージャーで、プロジェクトXへのアクセス権を持つユーザー」
```

```sql
-- RDBでは1つのクエリで実行可能
SELECT u.user_id, u.name, u.email
FROM users u
  INNER JOIN user_departments ud ON u.user_id = ud.user_id
  INNER JOIN departments d ON ud.department_id = d.department_id
  INNER JOIN user_roles ur ON u.user_id = ur.user_id
  INNER JOIN roles r ON ur.role_id = r.role_id
  INNER JOIN role_permissions rp ON r.role_id = rp.role_id
  INNER JOIN permissions p ON rp.permission_id = p.permission_id
WHERE d.name = 'A'
  AND r.name = 'manager'
  AND p.resource = 'project:X'
  AND u.tenant_id = 'tenant123';

-- 1回のクエリで完結、パフォーマンスも良好
```

#### 2. データ整合性の保証
```
ACID特性:
- トランザクションの原子性
- 外部キー制約
- チェック制約
- ユニーク制約

例: ユーザー削除時に関連データも自動削除（CASCADE）
```

```sql
-- 外部キー制約でデータ整合性を保証
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL,
  role_id UUID NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- ユーザーを削除すると、user_rolesも自動的に削除される
DELETE FROM users WHERE user_id = 'user123';
```

#### 3. リレーションシップの自然な表現
```
正規化されたスキーマ:
- 多対多の関係が自然
- データの重複が少ない
- 参照整合性の保証

例: ユーザー、グループ、権限の関係が明確
```

```sql
-- 正規化されたスキーマ例
users (user_id, name, email)
  ↓
user_groups (user_id, group_id)  -- 中間テーブル
  ↓
groups (group_id, group_name)
  ↓
group_permissions (group_id, permission_id)  -- 中間テーブル
  ↓
permissions (permission_id, resource, action)
```

#### 4. 豊富なツールエコシステム
```
BI・分析ツール:
- Tableau、Power BI、Looker
- SQLベースのレポートツール
- ORM（Prisma、TypeORM、SQLAlchemy）

例: 既存のSQLスキルとツールが活用できる
```

#### 5. 柔軟なクエリ
```
アドホッククエリ:
- 事前設計不要
- 新しい検索要件に即対応
- インデックスの追加で最適化

例: 「先月作成された、未承認の招待一覧」
```

```sql
-- 即座に実行可能
SELECT i.*, u.name as invited_by_name
FROM invitations i
  INNER JOIN users u ON i.invited_by = u.user_id
WHERE i.status = 'pending'
  AND i.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
ORDER BY i.created_at DESC;
```

#### 6. Aurora Serverless の特徴
```
サーバーレスの利点:
- 自動スケーリング（ACU単位）
- 使用しない時は自動停止
- マネージド型サービス
- バックアップ・レプリケーション自動

コスト: 小規模なら月額$30程度
```

### デメリット ❌

#### 1. スケーリングの制限
```
問題:
- 垂直スケーリングに限界
- 読み取りレプリカでの対応が必要
- シャーディングが複雑

限界: 数千万〜数億レコードで性能低下の可能性
```

#### 2. レイテンシ
```
問題:
- DynamoDBより遅い（数ms〜数十ms）
- ネットワーク経由のアクセス
- VPC内配置が必要（Lambda Cold Start影響）

例: 認証トークン検証が5-10ms
```

#### 3. コールドスタート（Aurora Serverless v1）
```
問題:
- 停止状態からの起動に30秒程度
- 低トラフィック時に停止する

※ Aurora Serverless v2 では大幅改善（瞬時起動）
```

#### 4. コスト（高トラフィック時）
```
問題:
- 高負荷時のコストが高い
- ACU（容量単位）課金
- ストレージ課金

例: 常時稼働で月額$50-200
```

#### 5. NoSQLより複雑な運用
```
問題:
- インデックス設計が必要
- クエリチューニングが必要
- スロークエリの監視

必要スキル: SQL最適化の知識
```

## 認証・権限管理システムでの推奨

### 結論: **RDB（Aurora Serverless v2）を推奨** 🎯

### 理由

#### 1. 権限管理は複雑なクエリが多い
```
典型的なクエリ:
- ユーザーが持つ全権限の取得（グループ、ロール経由含む）
- 特定リソースへのアクセス権を持つユーザー一覧
- 権限の継承チェーン
- 監査ログとユーザー情報の結合

→ これらはSQLが圧倒的に有利
```

#### 2. データ整合性が重要
```
要件:
- ユーザー削除時に関連データも確実に削除
- 権限の不整合を防ぐ
- トランザクションの原子性

→ RDBの外部キー制約とトランザクションが最適
```

#### 3. レポート・監査が必要
```
要件:
- ユーザーアクティビティレポート
- 権限の使用状況分析
- コンプライアンス監査

→ SQLの集計機能が必須
```

#### 4. スケールの現実的な見積もり
```
想定規模:
- テナント数: 100-1,000社
- ユーザー数: 1万-10万人
- 同時アクセス: 100-1,000

→ Aurora Serverless で十分対応可能
```

## ハイブリッドアプローチ（推奨）

### 最適解: RDB（メイン）+ NoSQL（キャッシュ）

```
アーキテクチャ:

┌─────────────────┐
│  クライアント    │
└────────┬────────┘
         ↓
┌────────────────────────┐
│   API Gateway + Lambda  │
└───┬──────────────┬─────┘
    ↓              ↓
┌──────────┐  ┌─────────────┐
│ DynamoDB │  │   Aurora     │
│(キャッシュ)│  │ Serverless  │
│ - トークン│  │ - ユーザー   │
│ - セッション│  │ - 権限      │
│          │  │ - ロール     │
└──────────┘  └─────────────┘
```

### 役割分担

#### Aurora（メインデータストア）
```
用途:
✅ ユーザー情報
✅ テナント情報
✅ ロール・権限マスタ
✅ グループ管理
✅ 監査ログ
✅ 複雑な検索・レポート

理由: データ整合性とクエリの柔軟性
```

#### DynamoDB（高速キャッシュ）
```
用途:
✅ アクセストークン検証
✅ セッション管理
✅ レート制限カウンター
✅ 最近のアクティビティ

理由: 低レイテンシとスケーラビリティ
```

### データフロー例

#### 認証フロー
```
1. サインイン
   ↓
2. Auroraでユーザー検証
   ↓
3. トークン生成
   ↓
4. DynamoDBにトークン保存（TTL付き）
   ↓
5. クライアントにトークン返却

以降のリクエスト:
1. DynamoDBでトークン検証（1ms）← 高速
2. Auroraで権限チェック（必要時のみ）
```

#### 権限チェックフロー
```
1. DynamoDBにキャッシュがあるか確認
   ├─ あり → キャッシュを使用
   └─ なし ↓
2. Auroraから権限を取得（複雑なJOIN）
   ↓
3. 結果をDynamoDBにキャッシュ（TTL: 5分）
   ↓
4. 権限判定
```

## RDBを使った実装設計

### データベーススキーマ

```sql
-- テナント
CREATE TABLE tenants (
  tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  plan VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  max_users INTEGER NOT NULL,
  settings JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ユーザー
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  profile JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  UNIQUE (tenant_id, email)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant ON users(tenant_id);

-- ロール
CREATE TABLE roles (
  role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  role_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  UNIQUE (tenant_id, role_name)
);

-- 権限（パーミッション）
CREATE TABLE permissions (
  permission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  resource VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  UNIQUE (tenant_id, resource, action)
);

-- ユーザーとロールの関連（多対多）
CREATE TABLE user_roles (
  user_id UUID NOT NULL,
  role_id UUID NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- ロールと権限の関連（多対多）
CREATE TABLE role_permissions (
  role_id UUID NOT NULL,
  permission_id UUID NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

-- グループ
CREATE TABLE groups (
  group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  group_name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_group_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
  UNIQUE (tenant_id, group_name)
);

-- ユーザーとグループの関連
CREATE TABLE user_groups (
  user_id UUID NOT NULL,
  group_id UUID NOT NULL,
  PRIMARY KEY (user_id, group_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE
);

-- グループとロールの関連
CREATE TABLE group_roles (
  group_id UUID NOT NULL,
  role_id UUID NOT NULL,
  PRIMARY KEY (group_id, role_id),
  FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- 監査ログ
CREATE TABLE audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

### 複雑なクエリ例

#### ユーザーの全権限取得（グループ経由含む）

```sql
-- ユーザーが持つすべての権限を取得
-- 直接割り当てられたロール + グループ経由のロール
WITH user_all_roles AS (
  -- 直接割り当てられたロール
  SELECT r.role_id, r.role_name
  FROM user_roles ur
    INNER JOIN roles r ON ur.role_id = r.role_id
  WHERE ur.user_id = 'user123'
  
  UNION
  
  -- グループ経由のロール
  SELECT r.role_id, r.role_name
  FROM user_groups ug
    INNER JOIN group_roles gr ON ug.group_id = gr.group_id
    INNER JOIN roles r ON gr.role_id = r.role_id
  WHERE ug.user_id = 'user123'
)
SELECT DISTINCT p.resource, p.action, p.description
FROM user_all_roles uar
  INNER JOIN role_permissions rp ON uar.role_id = rp.role_id
  INNER JOIN permissions p ON rp.permission_id = p.permission_id
ORDER BY p.resource, p.action;
```

#### 特定リソースへのアクセス権を持つユーザー一覧

```sql
-- 'project:X' への 'read' 権限を持つすべてのユーザー
SELECT DISTINCT u.user_id, u.name, u.email
FROM users u
WHERE u.tenant_id = 'tenant123'
  AND (
    -- 直接ロール経由
    EXISTS (
      SELECT 1 FROM user_roles ur
        INNER JOIN role_permissions rp ON ur.role_id = rp.role_id
        INNER JOIN permissions p ON rp.permission_id = p.permission_id
      WHERE ur.user_id = u.user_id
        AND p.resource = 'project:X'
        AND p.action = 'read'
    )
    OR
    -- グループ経由
    EXISTS (
      SELECT 1 FROM user_groups ug
        INNER JOIN group_roles gr ON ug.group_id = gr.group_id
        INNER JOIN role_permissions rp ON gr.role_id = rp.role_id
        INNER JOIN permissions p ON rp.permission_id = p.permission_id
      WHERE ug.user_id = u.user_id
        AND p.resource = 'project:X'
        AND p.action = 'read'
    )
  );
```

#### 監査レポート：ユーザーアクティビティサマリー

```sql
-- 先月のユーザーアクティビティサマリー
SELECT 
  u.name,
  u.email,
  COUNT(*) as action_count,
  COUNT(DISTINCT DATE(al.created_at)) as active_days,
  MAX(al.created_at) as last_activity,
  jsonb_object_agg(al.action, action_count) as action_breakdown
FROM audit_logs al
  INNER JOIN users u ON al.user_id = u.user_id
WHERE al.tenant_id = 'tenant123'
  AND al.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND al.created_at < DATE_TRUNC('month', CURRENT_DATE)
GROUP BY u.user_id, u.name, u.email
ORDER BY action_count DESC;
```

## SAMテンプレート（RDB版）

```yaml
Resources:
  # Aurora Serverless v2 クラスター
  DatabaseCluster:
    Type: AWS::RDS::DBCluster
    Properties:
      Engine: aurora-postgresql
      EngineMode: provisioned
      EngineVersion: '15.3'
      DatabaseName: tenantusers
      MasterUsername: !Sub '{{resolve:secretsmanager:${DBSecret}:SecretString:username}}'
      MasterUserPassword: !Sub '{{resolve:secretsmanager:${DBSecret}:SecretString:password}}'
      ServerlessV2ScalingConfiguration:
        MinCapacity: 0.5
        MaxCapacity: 4
      VpcSecurityGroupIds:
        - !Ref DatabaseSecurityGroup
      DBSubnetGroupName: !Ref DBSubnetGroup
      BackupRetentionPeriod: 7
      EnableCloudwatchLogsExports:
        - postgresql
  
  DatabaseInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      Engine: aurora-postgresql
      DBClusterIdentifier: !Ref DatabaseCluster
      DBInstanceClass: db.serverless
      PubliclyAccessible: false
  
  # データベース接続シークレット
  DBSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      GenerateSecretString:
        SecretStringTemplate: '{"username": "adminuser"}'
        GenerateStringKey: 'password'
        PasswordLength: 32
        ExcludeCharacters: '"@/\'
  
  # Lambda用のVPC設定
  LambdaSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Lambda security group
      VpcId: !Ref VPC
  
  DatabaseSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Database security group
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 5432
          ToPort: 5432
          SourceSecurityGroupId: !Ref LambdaSecurityGroup
  
  # Lambda関数（RDB接続）
  CreateUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: functions/create_user/
      Handler: app.lambda_handler
      Environment:
        Variables:
          DB_SECRET_ARN: !Ref DBSecret
          DB_CLUSTER_ARN: !GetAtt DatabaseCluster.DBClusterArn
      VpcConfig:
        SecurityGroupIds:
          - !Ref LambdaSecurityGroup
        SubnetIds:
          - !Ref PrivateSubnet1
          - !Ref PrivateSubnet2
      Policies:
        - AWSSecretsManagerGetSecretValuePolicy:
            SecretArn: !Ref DBSecret
        - Statement:
            - Effect: Allow
              Action:
                - rds-data:ExecuteStatement
                - rds-data:BatchExecuteStatement
              Resource: !GetAtt DatabaseCluster.DBClusterArn
```

## Lambda関数実装（RDB版）

```python
# functions/create_user/app.py

import json
import os
import boto3
from datetime import datetime
import psycopg2
from lib.utils import create_response, get_tenant_id, logger

# Secrets Manager
secrets_client = boto3.client('secretsmanager')

# データベース接続のキャッシュ
_db_connection = None

def get_db_connection():
    """データベース接続を取得（再利用）"""
    global _db_connection
    
    if _db_connection is not None and not _db_connection.closed:
        return _db_connection
    
    # Secrets Managerからクレデンシャル取得
    secret_arn = os.environ['DB_SECRET_ARN']
    secret = json.loads(
        secrets_client.get_secret_value(SecretId=secret_arn)['SecretString']
    )
    
    # 環境変数からエンドポイント取得
    db_host = os.environ['DB_HOST']
    db_name = os.environ['DB_NAME']
    
    _db_connection = psycopg2.connect(
        host=db_host,
        database=db_name,
        user=secret['username'],
        password=secret['password'],
        connect_timeout=5
    )
    
    return _db_connection


def lambda_handler(event, context):
    """ユーザー作成"""
    try:
        tenant_id = get_tenant_id(event)
        body = json.loads(event.get('body', '{}'))
        
        email = body['email']
        name = body['name']
        role_name = body.get('role', 'user')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # トランザクション開始
        cursor.execute("BEGIN;")
        
        try:
            # 1. ユーザー作成
            cursor.execute("""
                INSERT INTO users (tenant_id, email, name, status, email_verified)
                VALUES (%s, %s, %s, 'active', TRUE)
                RETURNING user_id, created_at;
            """, (tenant_id, email, name))
            
            user_id, created_at = cursor.fetchone()
            
            # 2. デフォルトロールを割り当て
            cursor.execute("""
                INSERT INTO user_roles (user_id, role_id)
                SELECT %s, role_id
                FROM roles
                WHERE tenant_id = %s AND role_name = %s;
            """, (user_id, tenant_id, role_name))
            
            # 3. 監査ログ記録
            cursor.execute("""
                INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
                VALUES (%s, %s, 'user.created', 'user', %s, %s);
            """, (
                tenant_id,
                event['requestContext']['authorizer']['jwt']['claims']['custom:userId'],
                user_id,
                json.dumps({'email': email, 'name': name})
            ))
            
            # コミット
            cursor.execute("COMMIT;")
            
            logger.info(f"User created: {user_id}")
            
            return create_response(201, {
                'userId': str(user_id),
                'tenantId': tenant_id,
                'email': email,
                'name': name,
                'role': role_name,
                'createdAt': created_at.isoformat()
            })
            
        except Exception as e:
            cursor.execute("ROLLBACK;")
            raise
        
    except psycopg2.IntegrityError as e:
        if 'unique' in str(e).lower():
            return create_response(400, {
                'error': 'User with this email already exists'
            })
        raise
    
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}", exc_info=True)
        return create_response(500, {'error': 'Internal server error'})
```

## パフォーマンス比較

### トークン検証（毎リクエスト）

```
DynamoDB:
- レイテンシ: 1-2ms
- スループット: 制限なし
- コスト: $0.25/百万リクエスト

Aurora + DynamoDBキャッシュ:
- レイテンシ: 1-2ms（キャッシュヒット時）
- スループット: 制限なし
- コスト: $0.25/百万リクエスト（キャッシュ分）

推奨: どちらも同等
```

### 複雑な権限チェック（初回）

```
DynamoDB:
- レイテンシ: 50-100ms（複数クエリ）
- 複雑度: 高い（アプリケーション側で結合）
- コード量: 多い

Aurora:
- レイテンシ: 5-15ms（1クエリ）
- 複雑度: 低い（SQLで完結）
- コード量: 少ない

推奨: Aurora が有利
```

### レポート生成

```
DynamoDB:
- 実行時間: 数秒〜数分（全スキャン）
- コスト: 高い
- 実装難易度: 高い

Aurora:
- 実行時間: 数百ms〜数秒
- コスト: 中程度
- 実装難易度: 低い

推奨: Aurora が圧倒的に有利
```

## コスト比較（月額）

### 小規模（テナント10社、ユーザー1,000人）

```
DynamoDBのみ:
- DynamoDB: $5
- Lambda: $3
- 合計: $8

Aurora + DynamoDB:
- Aurora Serverless: $30
- DynamoDB（キャッシュ）: $2
- Lambda: $3
- 合計: $35

差額: +$27/月
```

### 中規模（テナント100社、ユーザー10,000人）

```
DynamoDBのみ:
- DynamoDB: $25
- Lambda: $15
- 合計: $40

Aurora + DynamoDB:
- Aurora Serverless: $50
- DynamoDB（キャッシュ）: $5
- Lambda: $15
- 合計: $70

差額: +$30/月
```

### 大規模（テナント1,000社、ユーザー100,000人）

```
DynamoDBのみ:
- DynamoDB: $200
- Lambda: $100
- 合計: $300

Aurora + DynamoDB:
- Aurora Serverless: $150
- DynamoDB（キャッシュ）: $50
- Lambda: $100
- 合計: $300

差額: ±$0/月（ほぼ同等）
```

## 最終推奨

### ユーザーの要望に基づく推奨 🎯

あなたの「RDBが好み」という感覚は**正しい**です。

認証・権限管理システムでは：

#### RDB（Aurora Serverless v2）を推奨する理由

1. **複雑な権限チェックが容易**
   - JOINで1クエリで完結
   - コード量が1/3に削減
   - メンテナンス性が高い

2. **データ整合性が保証される**
   - 外部キー制約
   - トランザクション
   - カスケード削除

3. **監査・レポートが簡単**
   - SQLの集計機能
   - BIツール連携
   - アドホッククエリ

4. **開発速度が速い**
   - 既存のSQLスキル活用
   - ORM使用可能
   - デバッグが容易

5. **コストは許容範囲**
   - 小規模で+$30/月程度
   - 大規模では同等
   - 開発コスト削減で回収可能

### 実装戦略

```
Phase 1: RDB（Aurora）でメイン機能構築
- ユーザー・テナント管理
- ロール・権限管理
- 監査ログ
- レポート

Phase 2: DynamoDBをキャッシュとして追加
- トークン検証
- セッション管理
- レート制限

Phase 3: 最適化
- クエリチューニング
- インデックス最適化
- キャッシュ戦略調整
```

### まとめ

認証・権限管理システムでは、**RDB（特にAurora Serverless v2）が最適**です。

DynamoDBの利点（スケーラビリティ、低レイテンシ）は、キャッシュ層として活用することで得られます。

**あなたの直感は正しい** - RDBを選びましょう！

---

**関連ドキュメント**:
- [12_Aurora_Serverless実装ガイド](./12_Aurora_Serverless実装ガイド.md)（次に作成予定）

