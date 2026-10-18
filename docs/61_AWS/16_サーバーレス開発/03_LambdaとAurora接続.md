# Lambda と Aurora の接続

## 概要
このガイドでは、AWS Lambda関数からAmazon Aurora Serverless（PostgreSQLまたはMySQL互換）に接続する方法を学びます。

## アーキテクチャパターン

### パターン1: 直接接続（小規模アプリ向け）
```
Lambda関数
    ↓ VPC内から直接接続
Aurora Serverless v2
```

**メリット**:
- シンプルな構成
- 追加コスト不要

**デメリット**:
- コネクション数の管理が必要
- 高負荷時にコネクション枯渇の可能性

### パターン2: RDS Proxy経由（推奨・本番環境向け）
```
Lambda関数
    ↓
RDS Proxy（コネクションプーリング）
    ↓
Aurora Serverless v2
```

**メリット**:
- コネクションプーリング
- 自動フェイルオーバー
- IAM認証対応
- コールドスタート時のパフォーマンス向上

**デメリット**:
- 追加コスト（$0.015/時間 + vCPU時間）

## 前提条件

### 1. VPCとサブネット
```
VPC: 10.0.0.0/16
├─ パブリックサブネット: 10.0.1.0/24 (us-east-1a)
├─ パブリックサブネット: 10.0.2.0/24 (us-east-1b)
├─ プライベートサブネット: 10.0.11.0/24 (us-east-1a) ← Lambda
├─ プライベートサブネット: 10.0.12.0/24 (us-east-1b) ← Lambda
├─ データベースサブネット: 10.0.21.0/24 (us-east-1a) ← Aurora
└─ データベースサブネット: 10.0.22.0/24 (us-east-1b) ← Aurora
```

### 2. セキュリティグループ
- **Lambda用**: lambda-sg
- **Aurora用**: aurora-sg
- **RDS Proxy用**: rds-proxy-sg

## セットアップ手順

## A. Aurora Serverless v2 の作成

### ステップ1: Aurora クラスターの作成

#### マネジメントコンソール
```
1. RDS → データベース → データベースの作成
2. 設定:
   - エンジンタイプ: Aurora (PostgreSQL Compatible または MySQL Compatible)
   - エディション: Aurora Serverless v2
   - テンプレート: 開発/テスト
   - DBクラスター識別子: serverless-app-db
   - マスターユーザー名: postgres (または admin)
   - パスワード: 強力なパスワード
   - VPC: 既存のVPC
   - サブネットグループ: 新規作成（データベースサブネット選択）
   - パブリックアクセス: なし
   - VPCセキュリティグループ: 新規作成 (aurora-sg)
   - データベース名: appdb
   - Capacity設定:
     - 最小ACU: 0.5
     - 最大ACU: 1 (開発環境) または適切な値
```

#### AWS CLI
```bash
# DB サブネットグループの作成
aws rds create-db-subnet-group \
  --db-subnet-group-name serverless-db-subnet \
  --db-subnet-group-description "Subnet group for Aurora" \
  --subnet-ids subnet-xxx subnet-yyy \
  --tags Key=Name,Value=serverless-db-subnet

# Aurora クラスターの作成
aws rds create-db-cluster \
  --db-cluster-identifier serverless-app-cluster \
  --engine aurora-postgresql \
  --engine-version 15.3 \
  --master-username postgres \
  --master-user-password "YourStrongPassword123!" \
  --database-name appdb \
  --db-subnet-group-name serverless-db-subnet \
  --vpc-security-group-ids sg-xxxxx \
  --serverless-v2-scaling-configuration MinCapacity=0.5,MaxCapacity=1 \
  --engine-mode provisioned

# Aurora インスタンスの作成（Serverless v2）
aws rds create-db-instance \
  --db-instance-identifier serverless-app-instance \
  --db-cluster-identifier serverless-app-cluster \
  --db-instance-class db.serverless \
  --engine aurora-postgresql
```

#### SAM テンプレート
```yaml
Resources:
  # DB サブネットグループ
  DBSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupName: serverless-db-subnet
      DBSubnetGroupDescription: Subnet group for Aurora Serverless
      SubnetIds:
        - !Ref PrivateSubnet1
        - !Ref PrivateSubnet2

  # Aurora クラスター
  AuroraCluster:
    Type: AWS::RDS::DBCluster
    Properties:
      DBClusterIdentifier: serverless-app-cluster
      Engine: aurora-postgresql
      EngineVersion: 15.3
      MasterUsername: postgres
      MasterUserPassword: !Ref DBPassword
      DatabaseName: appdb
      DBSubnetGroupName: !Ref DBSubnetGroup
      VpcSecurityGroupIds:
        - !Ref AuroraSecurityGroup
      ServerlessV2ScalingConfiguration:
        MinCapacity: 0.5
        MaxCapacity: 1

  # Aurora インスタンス
  AuroraInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: serverless-app-instance
      DBClusterIdentifier: !Ref AuroraCluster
      DBInstanceClass: db.serverless
      Engine: aurora-postgresql

  # セキュリティグループ
  AuroraSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupName: aurora-sg
      GroupDescription: Security group for Aurora
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 5432
          ToPort: 5432
          SourceSecurityGroupId: !Ref LambdaSecurityGroup
      Tags:
        - Key: Name
          Value: aurora-sg

Parameters:
  DBPassword:
    Type: String
    NoEcho: true
    Description: Database master password

Outputs:
  ClusterEndpoint:
    Value: !GetAtt AuroraCluster.Endpoint.Address
    Export:
      Name: !Sub ${AWS::StackName}-ClusterEndpoint
```

### ステップ2: セキュリティグループの設定

```bash
# Aurora セキュリティグループのインバウンドルール
aws ec2 authorize-security-group-ingress \
  --group-id sg-aurora-xxx \
  --protocol tcp \
  --port 5432 \
  --source-group sg-lambda-xxx \
  --region ap-northeast-1

# Lambda セキュリティグループのアウトバウンドルール（デフォルトで全許可）
# 必要に応じて制限
```

## B. Lambda関数の作成（直接接続）

### ステップ1: Lambda関数のVPC設定

#### SAM テンプレート
```yaml
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: aurora-connect-function
      Runtime: python3.11
      Handler: app.lambda_handler
      CodeUri: functions/aurora_connect/
      MemorySize: 512
      Timeout: 30
      Environment:
        Variables:
          DB_HOST: !GetAtt AuroraCluster.Endpoint.Address
          DB_PORT: 5432
          DB_NAME: appdb
          DB_USER: postgres
          DB_PASSWORD_SECRET: !Ref DBPasswordSecret
      VpcConfig:
        SubnetIds:
          - !Ref PrivateSubnet1
          - !Ref PrivateSubnet2
        SecurityGroupIds:
          - !Ref LambdaSecurityGroup
      Policies:
        - VPCAccessPolicy: {}
        - Statement:
            - Effect: Allow
              Action:
                - secretsmanager:GetSecretValue
              Resource: !Ref DBPasswordSecret

  LambdaSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupName: lambda-sg
      GroupDescription: Security group for Lambda functions
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: lambda-sg

  # Secrets Manager（パスワード管理）
  DBPasswordSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: aurora-db-password
      SecretString: !Sub |
        {
          "username": "postgres",
          "password": "${DBPassword}",
          "engine": "postgres",
          "host": "${AuroraCluster.Endpoint.Address}",
          "port": 5432,
          "dbname": "appdb"
        }
```

### ステップ2: Python Lambda関数の実装

#### requirements.txt
```txt
psycopg2-binary==2.9.9
boto3==1.34.10
```

#### app.py（PostgreSQL例）
```python
import json
import os
import psycopg2
import boto3
from typing import Dict, Any

# Secrets Managerクライアント（グローバルスコープ）
secrets_client = boto3.client('secretsmanager')

# コネクションをグローバル変数で保持（再利用）
connection = None

def get_db_credentials() -> Dict[str, str]:
    """Secrets Managerからデータベース認証情報を取得"""
    secret_name = os.environ['DB_PASSWORD_SECRET']
    
    try:
        response = secrets_client.get_secret_value(SecretId=secret_name)
        secret = json.loads(response['SecretString'])
        return secret
    except Exception as e:
        print(f"Error retrieving secret: {str(e)}")
        raise

def get_connection():
    """データベース接続を取得（再利用可能）"""
    global connection
    
    # 既存の接続が有効かチェック
    if connection is not None:
        try:
            # 簡単な接続テスト
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
            print("Reusing existing database connection")
            return connection
        except Exception as e:
            print(f"Connection lost: {str(e)}, creating new connection")
            connection = None
    
    # 新しい接続を作成
    try:
        credentials = get_db_credentials()
        
        connection = psycopg2.connect(
            host=credentials['host'],
            port=credentials['port'],
            dbname=credentials['dbname'],
            user=credentials['username'],
            password=credentials['password'],
            connect_timeout=5
        )
        
        print("Created new database connection")
        return connection
    except Exception as e:
        print(f"Error connecting to database: {str(e)}")
        raise

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Lambda ハンドラー"""
    print(f"Event: {json.dumps(event)}")
    
    try:
        # データベース接続を取得
        conn = get_connection()
        
        # クエリ実行
        with conn.cursor() as cursor:
            # 例: ユーザー一覧を取得
            cursor.execute("""
                SELECT id, name, email, created_at 
                FROM users 
                ORDER BY created_at DESC 
                LIMIT 10
            """)
            
            # 結果を取得
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            
            # 辞書形式に変換
            users = [dict(zip(columns, row)) for row in rows]
        
        # コミット（SELECT のみなら不要）
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'data': users,
                'count': len(users)
            }, default=str)  # datetime対応
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }
```

#### INSERT/UPDATE 操作の例
```python
def create_user(conn, name: str, email: str) -> int:
    """ユーザーを作成"""
    with conn.cursor() as cursor:
        cursor.execute("""
            INSERT INTO users (name, email, created_at)
            VALUES (%s, %s, NOW())
            RETURNING id
        """, (name, email))
        
        user_id = cursor.fetchone()[0]
        conn.commit()
        
        return user_id

def update_user(conn, user_id: int, name: str, email: str) -> bool:
    """ユーザーを更新"""
    with conn.cursor() as cursor:
        cursor.execute("""
            UPDATE users 
            SET name = %s, email = %s, updated_at = NOW()
            WHERE id = %s
        """, (name, email, user_id))
        
        conn.commit()
        return cursor.rowcount > 0

# Lambda ハンドラーでの使用
def lambda_handler(event, context):
    try:
        conn = get_connection()
        
        # HTTPメソッドに応じた処理
        http_method = event.get('httpMethod', 'GET')
        
        if http_method == 'POST':
            body = json.loads(event.get('body', '{}'))
            user_id = create_user(conn, body['name'], body['email'])
            
            return {
                'statusCode': 201,
                'body': json.dumps({'id': user_id})
            }
        
        elif http_method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            user_id = event['pathParameters']['id']
            success = update_user(conn, user_id, body['name'], body['email'])
            
            return {
                'statusCode': 200 if success else 404,
                'body': json.dumps({'success': success})
            }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

### Node.js版の実装

#### package.json
```json
{
  "name": "aurora-connect-function",
  "version": "1.0.0",
  "dependencies": {
    "@aws-sdk/client-secrets-manager": "^3.450.0",
    "pg": "^8.11.3"
  }
}
```

#### app.js
```javascript
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { Pool } = require('pg');

const secretsClient = new SecretsManagerClient({});
let pool = null;

async function getDbCredentials() {
    const command = new GetSecretValueCommand({
        SecretId: process.env.DB_PASSWORD_SECRET
    });
    
    const response = await secretsClient.send(command);
    return JSON.parse(response.SecretString);
}

async function getPool() {
    if (pool) {
        return pool;
    }
    
    const credentials = await getDbCredentials();
    
    pool = new Pool({
        host: credentials.host,
        port: credentials.port,
        database: credentials.dbname,
        user: credentials.username,
        password: credentials.password,
        max: 1, // Lambda内では1接続で十分
        idleTimeoutMillis: 120000,
        connectionTimeoutMillis: 5000
    });
    
    console.log('Created new database pool');
    return pool;
}

exports.lambda_handler = async (event, context) => {
    console.log('Event:', JSON.stringify(event));
    
    try {
        const pool = await getPool();
        
        // クエリ実行
        const result = await pool.query(`
            SELECT id, name, email, created_at 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                data: result.rows,
                count: result.rowCount
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};
```

## C. RDS Proxy の使用（推奨）

### ステップ1: RDS Proxyの作成

#### SAM テンプレート
```yaml
Resources:
  DBProxy:
    Type: AWS::RDS::DBProxy
    Properties:
      DBProxyName: serverless-app-proxy
      EngineFamily: POSTGRESQL  # または MYSQL
      Auth:
        - AuthScheme: SECRETS
          SecretArn: !Ref DBPasswordSecret
          IAMAuth: REQUIRED  # IAM認証を有効化
      RoleArn: !GetAtt DBProxyRole.Arn
      VpcSubnetIds:
        - !Ref PrivateSubnet1
        - !Ref PrivateSubnet2
      VpcSecurityGroupIds:
        - !Ref ProxySecurityGroup
      RequireTLS: true

  DBProxyTargetGroup:
    Type: AWS::RDS::DBProxyTargetGroup
    Properties:
      DBProxyName: !Ref DBProxy
      TargetGroupName: default
      DBClusterIdentifiers:
        - !Ref AuroraCluster
      ConnectionPoolConfig:
        MaxConnectionsPercent: 100
        MaxIdleConnectionsPercent: 50
        ConnectionBorrowTimeout: 120

  DBProxyRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: rds.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/SecretsManagerReadWrite

  ProxySecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupName: rds-proxy-sg
      GroupDescription: Security group for RDS Proxy
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 5432
          ToPort: 5432
          SourceSecurityGroupId: !Ref LambdaSecurityGroup

Outputs:
  ProxyEndpoint:
    Value: !GetAtt DBProxy.Endpoint
    Export:
      Name: !Sub ${AWS::StackName}-ProxyEndpoint
```

### ステップ2: IAM認証を使用したLambda関数

#### SAM テンプレート（Lambda設定）
```yaml
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: aurora-proxy-function
      Runtime: python3.11
      Handler: app.lambda_handler
      CodeUri: functions/aurora_proxy/
      Environment:
        Variables:
          DB_HOST: !GetAtt DBProxy.Endpoint
          DB_PORT: 5432
          DB_NAME: appdb
          DB_USER: postgres
          DB_REGION: !Ref AWS::Region
      VpcConfig:
        SubnetIds:
          - !Ref PrivateSubnet1
          - !Ref PrivateSubnet2
        SecurityGroupIds:
          - !Ref LambdaSecurityGroup
      Policies:
        - VPCAccessPolicy: {}
        - Statement:
            - Effect: Allow
              Action:
                - rds-db:connect
              Resource: !Sub 'arn:aws:rds-db:${AWS::Region}:${AWS::AccountId}:dbuser:*/${DBUser}'
```

#### Lambda関数（IAM認証使用）
```python
import os
import boto3
import psycopg2

def get_db_connection_with_iam():
    """IAM認証を使用してデータベース接続"""
    
    # RDSクライアント
    rds_client = boto3.client('rds', region_name=os.environ['DB_REGION'])
    
    # IAM認証トークンを生成
    db_host = os.environ['DB_HOST']
    db_port = int(os.environ['DB_PORT'])
    db_user = os.environ['DB_USER']
    db_name = os.environ['DB_NAME']
    
    # 認証トークン（15分有効）
    password = rds_client.generate_db_auth_token(
        DBHostname=db_host,
        Port=db_port,
        DBUsername=db_user,
        Region=os.environ['DB_REGION']
    )
    
    # 接続
    connection = psycopg2.connect(
        host=db_host,
        port=db_port,
        database=db_name,
        user=db_user,
        password=password,
        sslmode='require',
        connect_timeout=5
    )
    
    return connection

def lambda_handler(event, context):
    try:
        conn = get_db_connection_with_iam()
        
        with conn.cursor() as cursor:
            cursor.execute("SELECT version()")
            version = cursor.fetchone()
            print(f"Database version: {version}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Connected successfully'})
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

## D. ベストプラクティス

### 1. コネクション管理

```python
class DatabaseManager:
    """データベース接続マネージャー"""
    
    def __init__(self):
        self.connection = None
        self.max_retries = 3
    
    def get_connection(self):
        """接続取得（リトライロジック付き）"""
        for attempt in range(self.max_retries):
            try:
                if self.connection is None or self.is_connection_closed():
                    self.connection = self._create_connection()
                return self.connection
            except Exception as e:
                print(f"Connection attempt {attempt + 1} failed: {str(e)}")
                if attempt == self.max_retries - 1:
                    raise
                time.sleep(2 ** attempt)  # 指数バックオフ
    
    def is_connection_closed(self):
        """接続がクローズされているかチェック"""
        if self.connection is None:
            return True
        try:
            with self.connection.cursor() as cursor:
                cursor.execute('SELECT 1')
            return False
        except:
            return True
    
    def _create_connection(self):
        """新しい接続を作成"""
        credentials = get_db_credentials()
        return psycopg2.connect(
            host=credentials['host'],
            port=credentials['port'],
            database=credentials['dbname'],
            user=credentials['username'],
            password=credentials['password'],
            connect_timeout=5
        )
    
    def close(self):
        """接続をクローズ"""
        if self.connection:
            self.connection.close()
            self.connection = None

# グローバルインスタンス
db_manager = DatabaseManager()

def lambda_handler(event, context):
    try:
        conn = db_manager.get_connection()
        # クエリ実行...
    finally:
        # Lambda環境では通常closeしない（再利用のため）
        # ただし、明示的にクローズしたい場合:
        # db_manager.close()
        pass
```

### 2. トランザクション管理

```python
def execute_in_transaction(conn, operations):
    """トランザクション内で複数操作を実行"""
    try:
        with conn.cursor() as cursor:
            for operation in operations:
                cursor.execute(operation['sql'], operation.get('params'))
        
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"Transaction failed: {str(e)}")
        raise

# 使用例
def lambda_handler(event, context):
    conn = get_connection()
    
    operations = [
        {
            'sql': 'INSERT INTO users (name, email) VALUES (%s, %s)',
            'params': ('John Doe', 'john@example.com')
        },
        {
            'sql': 'INSERT INTO profiles (user_id, bio) VALUES (LASTVAL(), %s)',
            'params': ('Software Engineer',)
        }
    ]
    
    execute_in_transaction(conn, operations)
```

### 3. エラーハンドリング

```python
import psycopg2
from psycopg2 import OperationalError, IntegrityError

def lambda_handler(event, context):
    try:
        conn = get_connection()
        # 処理...
        
    except OperationalError as e:
        # 接続エラー
        print(f"Database connection error: {str(e)}")
        return {
            'statusCode': 503,
            'body': json.dumps({'error': 'Database temporarily unavailable'})
        }
    
    except IntegrityError as e:
        # 整合性エラー（重複キーなど）
        print(f"Data integrity error: {str(e)}")
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid data'})
        }
    
    except Exception as e:
        # その他のエラー
        print(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
```

## まとめ

✅ Aurora Serverless v2 の作成
✅ VPCとセキュリティグループの設定
✅ Lambda関数からの直接接続
✅ RDS Proxyを使用した接続プーリング
✅ IAM認証の実装
✅ ベストプラクティス（接続管理、トランザクション、エラーハンドリング）

**次のステップ**:
- [04_LambdaとDynamoDB接続](./04_LambdaとDynamoDB接続.md)
- [05_LambdaとAPIGateway接続](./05_LambdaとAPIGateway接続.md)

---

**関連ドキュメント**:
- [Aurora基礎](../05_データベース/03_Amazon_Auroraとは.md)
- [VPC基礎](../06_ネットワーキング/02_VPC/01_VPC基本概念.md)
- [Lambda基礎](../03_コンピューティング/Lambda/AWS_Lambda.md)

