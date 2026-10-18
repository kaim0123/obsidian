# DynamoDB設計

## シングルテーブルデザイン

### なぜシングルテーブルなのか

```
従来型（複数テーブル）:
- Tenantsテーブル
- Usersテーブル
- Invitationsテーブル

問題点:
❌ JOINができない（DynamoDBはリレーショナルDBではない）
❌ 複数テーブルへのクエリが必要（コスト増）
❌ トランザクション処理が複雑

シングルテーブルデザイン:
- 1つのテーブルにすべてのエンティティを格納
- PK（パーティションキー）とSK（ソートキー）で分類
- GSIで柔軟な検索

メリット:
✅ 1回のクエリで複数エンティティ取得可能
✅ コスト効率が良い
✅ スケーラブル
✅ トランザクション処理が容易
```

## テーブル設計

### メインテーブル

```yaml
テーブル名: TenantUserManagement

パーティションキー: PK (String)
ソートキー: SK (String)
```

### アクセスパターンの定義

```
1. テナント取得
   - PK = TENANT#{tenantId}, SK = METADATA

2. テナント内の全ユーザー取得
   - PK = TENANT#{tenantId}, SK begins_with USER#

3. 特定ユーザー取得
   - PK = TENANT#{tenantId}, SK = USER#{userId}

4. メールアドレスでユーザー検索
   - GSI (EmailIndex): email = {email}

5. テナント内のユーザー一覧（ロールフィルタ）
   - GSI (TenantIndex): tenantId = {tenantId}

6. 招待状態確認
   - PK = INVITE#{inviteId}, SK = METADATA

7. メールアドレスで招待検索
   - GSI (EmailIndex): email = {email}
```

## エンティティ詳細設計

### 1. テナント（Tenant）

```json
{
  "PK": "TENANT#abc123",
  "SK": "METADATA",
  "entityType": "Tenant",
  
  // 基本情報
  "tenantId": "abc123",
  "tenantName": "株式会社サンプル",
  "displayName": "サンプル社",
  "subdomain": "sample",
  
  // プラン情報
  "plan": "standard",
  "status": "active",
  "maxUsers": 50,
  "currentUsers": 5,
  
  // 設定
  "settings": {
    "allowInvitation": true,
    "requireMFA": false,
    "allowedDomains": ["example.com"],
    "sessionTimeout": 3600
  },
  
  // メタデータ
  "createdAt": 1234567890,
  "updatedAt": 1234567890,
  "createdBy": "user123"
}
```

#### テナント取得パターン
```python
# テナントを取得
response = table.get_item(
    Key={
        'PK': f'TENANT#{tenant_id}',
        'SK': 'METADATA'
    }
)

# テナントとそのユーザーを一括取得
response = table.query(
    KeyConditionExpression='PK = :pk',
    ExpressionAttributeValues={
        ':pk': f'TENANT#{tenant_id}'
    }
)
# → テナント情報 + 全ユーザー情報が取得できる
```

### 2. ユーザー（User）

```json
{
  "PK": "TENANT#abc123",
  "SK": "USER#user123",
  "entityType": "User",
  
  // 基本情報
  "userId": "user123",
  "tenantId": "abc123",
  "email": "user@example.com",
  "name": "山田太郎",
  "displayName": "山田",
  
  // 認証情報
  "cognitoUsername": "user123",
  "cognitoSub": "cognito-sub-uuid",
  
  // ロールと権限
  "role": "admin",
  "permissions": ["user:read", "user:write", "tenant:read"],
  
  // ステータス
  "status": "active",
  "emailVerified": true,
  "lastLoginAt": 1234567890,
  
  // プロフィール
  "profile": {
    "department": "開発部",
    "position": "マネージャー",
    "phoneNumber": "090-1234-5678",
    "avatar": "https://example.com/avatar.jpg"
  },
  
  // メタデータ
  "createdAt": 1234567890,
  "updatedAt": 1234567890,
  "createdBy": "admin123"
}
```

#### ユーザー取得パターン
```python
# 特定ユーザー取得
response = table.get_item(
    Key={
        'PK': f'TENANT#{tenant_id}',
        'SK': f'USER#{user_id}'
    }
)

# テナント内の全ユーザー取得
response = table.query(
    KeyConditionExpression='PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues={
        ':pk': f'TENANT#{tenant_id}',
        ':sk': 'USER#'
    }
)

# メールアドレスでユーザー検索（GSI使用）
response = table.query(
    IndexName='EmailIndex',
    KeyConditionExpression='email = :email',
    ExpressionAttributeValues={
        ':email': 'user@example.com'
    }
)
```

### 3. 招待（Invitation）

```json
{
  "PK": "INVITE#invite123",
  "SK": "METADATA",
  "entityType": "Invitation",
  
  // 基本情報
  "inviteId": "invite123",
  "tenantId": "abc123",
  "email": "newuser@example.com",
  
  // 招待内容
  "role": "user",
  "message": "チームに参加してください",
  
  // ステータス
  "status": "pending",
  "invitedBy": "user123",
  "inviterName": "山田太郎",
  
  // 有効期限
  "expiresAt": 1234567890,
  "acceptedAt": null,
  
  // メタデータ
  "createdAt": 1234567890,
  "token": "encrypted-token-here"
}
```

#### 招待取得パターン
```python
# 招待ID で取得
response = table.get_item(
    Key={
        'PK': f'INVITE#{invite_id}',
        'SK': 'METADATA'
    }
)

# メールアドレスで招待検索
response = table.query(
    IndexName='EmailIndex',
    KeyConditionExpression='email = :email AND entityType = :type',
    ExpressionAttributeValues={
        ':email': 'newuser@example.com',
        ':type': 'Invitation'
    }
)

# テナントの全招待を取得（GSI使用）
response = table.query(
    IndexName='TenantIndex',
    KeyConditionExpression='tenantId = :tenantId AND begins_with(SK, :sk)',
    ExpressionAttributeValues={
        ':tenantId': 'abc123',
        ':sk': 'INVITE#'
    }
)
```

## グローバルセカンダリインデックス（GSI）

### GSI1: EmailIndex

```yaml
パーティションキー: email (String)
ソートキー: entityType (String)

用途:
- メールアドレスでユーザー検索
- メールアドレスで招待検索
- 重複メールチェック

投影: ALL（全属性）
```

#### 使用例
```python
# メールアドレスでユーザー検索
def find_user_by_email(email: str):
    response = table.query(
        IndexName='EmailIndex',
        KeyConditionExpression='email = :email AND entityType = :type',
        ExpressionAttributeValues={
            ':email': email,
            ':type': 'User'
        }
    )
    return response.get('Items', [])

# メール重複チェック
def check_email_exists(email: str) -> bool:
    response = table.query(
        IndexName='EmailIndex',
        KeyConditionExpression='email = :email',
        ExpressionAttributeValues={':email': email},
        Limit=1
    )
    return len(response.get('Items', [])) > 0
```

### GSI2: TenantIndex

```yaml
パーティションキー: tenantId (String)
ソートキー: SK (String)

用途:
- テナント内の全エンティティ取得
- テナント内ユーザー一覧
- テナント内招待一覧

投影: ALL（全属性）
```

#### 使用例
```python
# テナント内の全ユーザー取得
def list_tenant_users(tenant_id: str):
    response = table.query(
        IndexName='TenantIndex',
        KeyConditionExpression='tenantId = :tenantId AND begins_with(SK, :sk)',
        ExpressionAttributeValues={
            ':tenantId': tenant_id,
            ':sk': 'USER#'
        }
    )
    return response.get('Items', [])

# テナント内の管理者のみ取得
def list_tenant_admins(tenant_id: str):
    response = table.query(
        IndexName='TenantIndex',
        KeyConditionExpression='tenantId = :tenantId AND begins_with(SK, :sk)',
        FilterExpression='#role = :role',
        ExpressionAttributeNames={'#role': 'role'},
        ExpressionAttributeValues={
            ':tenantId': tenant_id,
            ':sk': 'USER#',
            ':role': 'admin'
        }
    )
    return response.get('Items', [])
```

### GSI3: StatusIndex（オプション）

```yaml
パーティションキー: status (String)
ソートキー: createdAt (Number)

用途:
- ステータスごとの招待一覧
- 期限切れ招待のクリーンアップ

投影: KEYS_ONLY（キーのみ）
```

## SAMテンプレート（DynamoDB部分）

```yaml
Resources:
  TenantUserTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub TenantUserManagement-${Environment}
      BillingMode: PAY_PER_REQUEST
      
      # プライマリキー
      AttributeDefinitions:
        - AttributeName: PK
          AttributeType: S
        - AttributeName: SK
          AttributeType: S
        - AttributeName: email
          AttributeType: S
        - AttributeName: tenantId
          AttributeType: S
        - AttributeName: entityType
          AttributeType: S
        - AttributeName: status
          AttributeType: S
        - AttributeName: createdAt
          AttributeType: N
      
      KeySchema:
        - AttributeName: PK
          KeyType: HASH
        - AttributeName: SK
          KeyType: RANGE
      
      # GSI1: メール検索
      GlobalSecondaryIndexes:
        - IndexName: EmailIndex
          KeySchema:
            - AttributeName: email
              KeyType: HASH
            - AttributeName: entityType
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
        
        # GSI2: テナント内検索
        - IndexName: TenantIndex
          KeySchema:
            - AttributeName: tenantId
              KeyType: HASH
            - AttributeName: SK
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
        
        # GSI3: ステータス検索
        - IndexName: StatusIndex
          KeySchema:
            - AttributeName: status
              KeyType: HASH
            - AttributeName: createdAt
              KeyType: RANGE
          Projection:
            ProjectionType: KEYS_ONLY
      
      # ストリーム設定（監査ログ用）
      StreamSpecification:
        StreamViewType: NEW_AND_OLD_IMAGES
      
      # ポイントインタイムリカバリ
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      
      # TTL設定（招待の自動削除）
      TimeToLiveSpecification:
        AttributeName: expiresAt
        Enabled: true
      
      Tags:
        - Key: Environment
          Value: !Ref Environment
        - Key: Project
          Value: TenantUserManagement
```

## データベース操作の実装

### 共通DBクラス
```python
# layers/common/python/lib/db.py

import boto3
import os
from typing import Dict, Any, List, Optional
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])


class TenantDB:
    """テナント操作"""
    
    @staticmethod
    def create(tenant_data: Dict[str, Any]) -> Dict[str, Any]:
        """テナント作成"""
        item = {
            'PK': f"TENANT#{tenant_data['tenantId']}",
            'SK': 'METADATA',
            'entityType': 'Tenant',
            **tenant_data
        }
        table.put_item(Item=item)
        return item
    
    @staticmethod
    def get(tenant_id: str) -> Optional[Dict[str, Any]]:
        """テナント取得"""
        response = table.get_item(
            Key={
                'PK': f'TENANT#{tenant_id}',
                'SK': 'METADATA'
            }
        )
        return response.get('Item')
    
    @staticmethod
    def update(tenant_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """テナント更新"""
        update_expr = "SET "
        expr_values = {}
        expr_names = {}
        
        for key, value in updates.items():
            if key not in ['PK', 'SK', 'tenantId']:
                expr_names[f'#{key}'] = key
                expr_values[f':{key}'] = value
                update_expr += f"#{key} = :{key}, "
        
        update_expr = update_expr.rstrip(', ')
        
        response = table.update_item(
            Key={
                'PK': f'TENANT#{tenant_id}',
                'SK': 'METADATA'
            },
            UpdateExpression=update_expr,
            ExpressionAttributeNames=expr_names,
            ExpressionAttributeValues=expr_values,
            ReturnValues='ALL_NEW'
        )
        return response['Attributes']
    
    @staticmethod
    def delete(tenant_id: str):
        """テナント削除"""
        table.delete_item(
            Key={
                'PK': f'TENANT#{tenant_id}',
                'SK': 'METADATA'
            }
        )


class UserDB:
    """ユーザー操作"""
    
    @staticmethod
    def create(user_data: Dict[str, Any]) -> Dict[str, Any]:
        """ユーザー作成"""
        item = {
            'PK': f"TENANT#{user_data['tenantId']}",
            'SK': f"USER#{user_data['userId']}",
            'entityType': 'User',
            **user_data
        }
        table.put_item(Item=item)
        return item
    
    @staticmethod
    def get(tenant_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """ユーザー取得"""
        response = table.get_item(
            Key={
                'PK': f'TENANT#{tenant_id}',
                'SK': f'USER#{user_id}'
            }
        )
        return response.get('Item')
    
    @staticmethod
    def list_by_tenant(tenant_id: str) -> List[Dict[str, Any]]:
        """テナント内ユーザー一覧"""
        response = table.query(
            KeyConditionExpression=Key('PK').eq(f'TENANT#{tenant_id}') & 
                                 Key('SK').begins_with('USER#')
        )
        return response.get('Items', [])
    
    @staticmethod
    def find_by_email(email: str) -> Optional[Dict[str, Any]]:
        """メールでユーザー検索"""
        response = table.query(
            IndexName='EmailIndex',
            KeyConditionExpression=Key('email').eq(email) & 
                                 Key('entityType').eq('User')
        )
        items = response.get('Items', [])
        return items[0] if items else None
    
    @staticmethod
    def update(tenant_id: str, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """ユーザー更新"""
        update_expr = "SET "
        expr_values = {}
        expr_names = {}
        
        for key, value in updates.items():
            if key not in ['PK', 'SK', 'userId', 'tenantId']:
                expr_names[f'#{key}'] = key
                expr_values[f':{key}'] = value
                update_expr += f"#{key} = :{key}, "
        
        update_expr = update_expr.rstrip(', ')
        
        response = table.update_item(
            Key={
                'PK': f'TENANT#{tenant_id}',
                'SK': f'USER#{user_id}'
            },
            UpdateExpression=update_expr,
            ExpressionAttributeNames=expr_names,
            ExpressionAttributeValues=expr_values,
            ReturnValues='ALL_NEW'
        )
        return response['Attributes']
    
    @staticmethod
    def delete(tenant_id: str, user_id: str):
        """ユーザー削除"""
        table.delete_item(
            Key={
                'PK': f'TENANT#{tenant_id}',
                'SK': f'USER#{user_id}'
            }
        )


class InvitationDB:
    """招待操作"""
    
    @staticmethod
    def create(invite_data: Dict[str, Any]) -> Dict[str, Any]:
        """招待作成"""
        item = {
            'PK': f"INVITE#{invite_data['inviteId']}",
            'SK': 'METADATA',
            'entityType': 'Invitation',
            **invite_data
        }
        table.put_item(Item=item)
        return item
    
    @staticmethod
    def get(invite_id: str) -> Optional[Dict[str, Any]]:
        """招待取得"""
        response = table.get_item(
            Key={
                'PK': f'INVITE#{invite_id}',
                'SK': 'METADATA'
            }
        )
        return response.get('Item')
    
    @staticmethod
    def find_by_email(email: str) -> List[Dict[str, Any]]:
        """メールで招待検索"""
        response = table.query(
            IndexName='EmailIndex',
            KeyConditionExpression=Key('email').eq(email) & 
                                 Key('entityType').eq('Invitation'),
            FilterExpression=Attr('status').eq('pending')
        )
        return response.get('Items', [])
    
    @staticmethod
    def update_status(invite_id: str, status: str) -> Dict[str, Any]:
        """招待ステータス更新"""
        response = table.update_item(
            Key={
                'PK': f'INVITE#{invite_id}',
                'SK': 'METADATA'
            },
            UpdateExpression='SET #status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':status': status},
            ReturnValues='ALL_NEW'
        )
        return response['Attributes']
```

## まとめ

### シングルテーブルデザインの利点
✅ 1回のクエリで関連データ取得
✅ コスト効率が高い
✅ スケーラブル
✅ 柔軟なアクセスパターン

### 設計のポイント
✅ アクセスパターンを先に定義
✅ PK/SKで効率的なクエリ設計
✅ GSIで柔軟な検索
✅ TTLで自動削除

---

**次のステップ**: [04_Cognito設定](./04_Cognito設定.md)

