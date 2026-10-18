# Aurora PostgreSQL 設計

## なぜRDBを選ぶのか

### 認証・権限管理システムの特性

```
要件:
✅ 複雑な権限チェック（ユーザー → グループ → ロール → 権限）
✅ 多対多のリレーションシップ
✅ データ整合性の保証
✅ 監査ログとの結合
✅ レポート・分析機能

→ これらはすべてRDBが得意とする領域
```

### RDBの利点

```
メリット:
✅ SQL JOINで複雑なクエリが1回で完結
✅ 外部キー制約でデータ整合性を保証
✅ トランザクションで原子性を保証
✅ 正規化によりデータ重複を排除
✅ 豊富なツールエコシステム
✅ インデックスで柔軟な最適化
✅ 集計・分析が容易
```

### Aurora Serverless v2 の特徴

```
サーバーレスの利点を享受:
✅ 自動スケーリング（0.5〜128 ACU）
✅ 秒単位のスケーリング
✅ 使用しない時は最小容量に縮小
✅ PostgreSQL完全互換
✅ 99.99%の可用性
✅ 自動バックアップ・レプリケーション
```

## データベース設計

### ER図

```
tenants (テナント)
    ↓ 1:N
users (ユーザー)
    ↓ N:M (user_roles)
roles (ロール)
    ↓ N:M (role_permissions)
permissions (権限)

users
    ↓ N:M (user_groups)
groups (グループ)
    ↓ N:M (group_roles)
roles

users
    ↓ 1:N
audit_logs (監査ログ)
```

## テーブル定義

### 1. テナント（tenants）

```sql
CREATE TABLE tenants (
    -- プライマリキー
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 基本情報
    tenant_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    subdomain VARCHAR(100) UNIQUE,
    
    -- プラン情報
    plan VARCHAR(50) NOT NULL DEFAULT 'standard',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    max_users INTEGER NOT NULL DEFAULT 50,
    current_users INTEGER NOT NULL DEFAULT 0,
    
    -- 設定（JSONB型で柔軟に保存）
    settings JSONB DEFAULT '{
        "allowInvitation": true,
        "requireMFA": false,
        "allowedDomains": [],
        "sessionTimeout": 3600
    }'::jsonb,
    
    -- メタデータ
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    
    -- 制約
    CONSTRAINT chk_tenant_status CHECK (status IN ('active', 'suspended', 'deleted')),
    CONSTRAINT chk_tenant_plan CHECK (plan IN ('free', 'standard', 'premium', 'enterprise'))
);

-- インデックス
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_status ON tenants(status);

-- コメント
COMMENT ON TABLE tenants IS 'テナント（組織）情報';
COMMENT ON COLUMN tenants.settings IS '設定情報（JSONB形式）';
```

#### テナント取得パターン

```sql
-- テナント取得
SELECT * FROM tenants WHERE tenant_id = 'abc123';

-- アクティブなテナント一覧
SELECT tenant_id, tenant_name, plan, current_users, max_users
FROM tenants
WHERE status = 'active'
ORDER BY created_at DESC;

-- サブドメインでテナント検索
SELECT * FROM tenants WHERE subdomain = 'sample';
```

### 2. ユーザー（users）

```sql
CREATE TABLE users (
    -- プライマリキー
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- テナント（外部キー）
    tenant_id UUID NOT NULL,
    
    -- 基本情報
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    
    -- 認証情報
    password_hash VARCHAR(255),
    cognito_username VARCHAR(255),
    cognito_sub VARCHAR(255),
    
    -- ステータス
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- ログイン情報
    last_login_at TIMESTAMP,
    last_login_ip INET,
    login_count INTEGER NOT NULL DEFAULT 0,
    
    -- プロフィール（JSONB型）
    profile JSONB DEFAULT '{}'::jsonb,
    
    -- メタデータ
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    
    -- 外部キー制約
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    
    -- ユニーク制約（テナント内でメール重複不可）
    UNIQUE (tenant_id, email),
    
    -- チェック制約
    CONSTRAINT chk_user_status CHECK (status IN ('active', 'inactive', 'suspended', 'deleted'))
);

-- インデックス
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cognito_username ON users(cognito_username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 複合インデックス
CREATE INDEX idx_users_tenant_status ON users(tenant_id, status);

-- GINインデックス（JSONB検索用）
CREATE INDEX idx_users_profile ON users USING GIN(profile);

-- コメント
COMMENT ON TABLE users IS 'ユーザー情報';
COMMENT ON COLUMN users.profile IS 'プロフィール情報（department, position等）';
```

#### ユーザー取得パターン

```sql
-- 特定ユーザー取得
SELECT * FROM users WHERE user_id = 'user123' AND tenant_id = 'tenant123';

-- テナント内の全ユーザー取得
SELECT user_id, email, name, status, created_at
FROM users
WHERE tenant_id = 'tenant123'
ORDER BY created_at DESC;

-- メールアドレスでユーザー検索
SELECT * FROM users WHERE email = 'user@example.com';

-- アクティブユーザー数
SELECT COUNT(*) 
FROM users 
WHERE tenant_id = 'tenant123' AND status = 'active';

-- プロフィール検索（JSONB）
SELECT * FROM users
WHERE tenant_id = 'tenant123'
  AND profile->>'department' = '開発部';
```

### 3. ロール（roles）

```sql
CREATE TABLE roles (
    -- プライマリキー
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- テナント
    tenant_id UUID NOT NULL,
    
    -- ロール情報
    role_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    
    -- システムロール（削除不可）
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- メタデータ
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 外部キー
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    
    -- ユニーク制約
    UNIQUE (tenant_id, role_name)
);

-- インデックス
CREATE INDEX idx_roles_tenant ON roles(tenant_id);

-- コメント
COMMENT ON TABLE roles IS 'ロール（役割）定義';
COMMENT ON COLUMN roles.is_system_role IS 'システムロール（admin, user等）は削除不可';
```

#### ロールのデータ例

```sql
-- システムロールの初期データ
INSERT INTO roles (tenant_id, role_name, display_name, description, is_system_role) VALUES
('tenant123', 'admin', '管理者', 'すべての操作が可能', TRUE),
('tenant123', 'user', '一般ユーザー', '基本的な操作が可能', TRUE),
('tenant123', 'viewer', '閲覧者', '閲覧のみ可能', TRUE);
```

### 4. 権限（permissions）

```sql
CREATE TABLE permissions (
    -- プライマリキー
    permission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- テナント
    tenant_id UUID NOT NULL,
    
    -- 権限情報
    resource VARCHAR(255) NOT NULL,  -- 例: 'user', 'project', 'report'
    action VARCHAR(100) NOT NULL,    -- 例: 'read', 'write', 'delete'
    description TEXT,
    
    -- メタデータ
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 外部キー
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    
    -- ユニーク制約
    UNIQUE (tenant_id, resource, action)
);

-- インデックス
CREATE INDEX idx_permissions_tenant ON permissions(tenant_id);
CREATE INDEX idx_permissions_resource ON permissions(resource);

-- コメント
COMMENT ON TABLE permissions IS '権限定義';
COMMENT ON COLUMN permissions.resource IS 'リソース名（user, project等）';
COMMENT ON COLUMN permissions.action IS 'アクション（read, write, delete等）';
```

#### 権限のデータ例

```sql
-- 権限の初期データ
INSERT INTO permissions (tenant_id, resource, action, description) VALUES
-- ユーザー管理
('tenant123', 'user', 'read', 'ユーザー情報の閲覧'),
('tenant123', 'user', 'write', 'ユーザー情報の作成・編集'),
('tenant123', 'user', 'delete', 'ユーザーの削除'),

-- プロジェクト管理
('tenant123', 'project', 'read', 'プロジェクトの閲覧'),
('tenant123', 'project', 'write', 'プロジェクトの作成・編集'),
('tenant123', 'project', 'delete', 'プロジェクトの削除'),

-- レポート
('tenant123', 'report', 'read', 'レポートの閲覧'),
('tenant123', 'report', 'export', 'レポートのエクスポート');
```

### 5. ユーザーとロールの関連（user_roles）

```sql
CREATE TABLE user_roles (
    -- 複合プライマリキー
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    
    -- メタデータ
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    expires_at TIMESTAMP,  -- 期限付きロール
    
    PRIMARY KEY (user_id, role_id),
    
    -- 外部キー（CASCADE削除）
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- インデックス
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_expires ON user_roles(expires_at) WHERE expires_at IS NOT NULL;

-- コメント
COMMENT ON TABLE user_roles IS 'ユーザーとロールの関連（N:M）';
```

### 6. ロールと権限の関連（role_permissions）

```sql
CREATE TABLE role_permissions (
    -- 複合プライマリキー
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    
    PRIMARY KEY (role_id, permission_id),
    
    -- 外部キー
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- コメント
COMMENT ON TABLE role_permissions IS 'ロールと権限の関連（N:M）';
```

### 7. グループ（groups）

```sql
CREATE TABLE groups (
    -- プライマリキー
    group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- テナント
    tenant_id UUID NOT NULL,
    
    -- グループ情報
    group_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- 階層構造（親グループ）
    parent_group_id UUID,
    
    -- メタデータ
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 外部キー
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    
    -- ユニーク制約
    UNIQUE (tenant_id, group_name)
);

-- インデックス
CREATE INDEX idx_groups_tenant ON groups(tenant_id);
CREATE INDEX idx_groups_parent ON groups(parent_group_id);

-- コメント
COMMENT ON TABLE groups IS 'グループ（部署、チーム等）';
COMMENT ON COLUMN groups.parent_group_id IS '親グループID（階層構造）';
```

### 8. ユーザーとグループの関連（user_groups）

```sql
CREATE TABLE user_groups (
    -- 複合プライマリキー
    user_id UUID NOT NULL,
    group_id UUID NOT NULL,
    
    -- メタデータ
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, group_id),
    
    -- 外部キー
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX idx_user_groups_user ON user_groups(user_id);
CREATE INDEX idx_user_groups_group ON user_groups(group_id);

-- コメント
COMMENT ON TABLE user_groups IS 'ユーザーとグループの関連（N:M）';
```

### 9. グループとロールの関連（group_roles）

```sql
CREATE TABLE group_roles (
    -- 複合プライマリキー
    group_id UUID NOT NULL,
    role_id UUID NOT NULL,
    
    PRIMARY KEY (group_id, role_id),
    
    -- 外部キー
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX idx_group_roles_group ON group_roles(group_id);
CREATE INDEX idx_group_roles_role ON group_roles(role_id);

-- コメント
COMMENT ON TABLE group_roles IS 'グループとロールの関連（N:M）';
```

### 10. 招待（invitations）

```sql
CREATE TABLE invitations (
    -- プライマリキー
    invitation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- テナント
    tenant_id UUID NOT NULL,
    
    -- 招待情報
    email VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL,
    message TEXT,
    
    -- ステータス
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    
    -- 招待者
    invited_by UUID NOT NULL,
    
    -- トークン
    token VARCHAR(255) UNIQUE NOT NULL,
    
    -- 有効期限
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    
    -- メタデータ
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 外部キー
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- チェック制約
    CONSTRAINT chk_invitation_status CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'))
);

-- インデックス
CREATE INDEX idx_invitations_tenant ON invitations(tenant_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_expires ON invitations(expires_at);

-- コメント
COMMENT ON TABLE invitations IS 'ユーザー招待情報';
```

### 11. 監査ログ（audit_logs）

```sql
CREATE TABLE audit_logs (
    -- プライマリキー
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- テナント・ユーザー
    tenant_id UUID NOT NULL,
    user_id UUID,
    
    -- アクション情報
    action VARCHAR(100) NOT NULL,  -- 例: 'user.created', 'role.assigned'
    resource_type VARCHAR(100),    -- 例: 'user', 'role', 'permission'
    resource_id UUID,
    
    -- 詳細情報（JSONB）
    details JSONB,
    
    -- リクエスト情報
    ip_address INET,
    user_agent TEXT,
    
    -- タイムスタンプ
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 外部キー（SET NULLで削除後もログは残す）
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- インデックス
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- 複合インデックス（よく使う検索パターン）
CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);

-- パーティショニング（月次）
-- 大量のログデータに対応するため、テーブルパーティショニングを推奨
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- コメント
COMMENT ON TABLE audit_logs IS '監査ログ（すべての操作を記録）';
COMMENT ON COLUMN audit_logs.details IS 'アクションの詳細情報（JSONB）';
```

## 複雑なクエリパターン

### 1. ユーザーの全権限取得（グループ経由含む）

```sql
-- ユーザーが持つすべての権限を取得
-- 直接割り当てられたロール + グループ経由のロール
WITH user_all_roles AS (
    -- 直接割り当てられたロール
    SELECT DISTINCT r.role_id, r.role_name
    FROM user_roles ur
        INNER JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = 'user123'
      AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
    
    UNION
    
    -- グループ経由のロール
    SELECT DISTINCT r.role_id, r.role_name
    FROM user_groups ug
        INNER JOIN group_roles gr ON ug.group_id = gr.group_id
        INNER JOIN roles r ON gr.role_id = r.role_id
    WHERE ug.user_id = 'user123'
)
SELECT DISTINCT 
    p.permission_id,
    p.resource,
    p.action,
    p.description
FROM user_all_roles uar
    INNER JOIN role_permissions rp ON uar.role_id = rp.role_id
    INNER JOIN permissions p ON rp.permission_id = p.permission_id
ORDER BY p.resource, p.action;
```

### 2. 権限チェック（特定リソースへのアクセス可否）

```sql
-- ユーザーが 'project:X' への 'write' 権限を持つか確認
SELECT EXISTS (
    SELECT 1
    FROM users u
    WHERE u.user_id = 'user123'
      AND u.tenant_id = 'tenant123'
      AND (
        -- 直接ロール経由
        EXISTS (
            SELECT 1 
            FROM user_roles ur
                INNER JOIN role_permissions rp ON ur.role_id = rp.role_id
                INNER JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE ur.user_id = u.user_id
              AND p.resource = 'project:X'
              AND p.action = 'write'
              AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
        )
        OR
        -- グループ経由
        EXISTS (
            SELECT 1 
            FROM user_groups ug
                INNER JOIN group_roles gr ON ug.group_id = gr.group_id
                INNER JOIN role_permissions rp ON gr.role_id = rp.role_id
                INNER JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE ug.user_id = u.user_id
              AND p.resource = 'project:X'
              AND p.action = 'write'
        )
    )
) AS has_permission;
```

### 3. 特定リソースへのアクセス権を持つユーザー一覧

```sql
-- 'project:X' への 'read' 権限を持つすべてのユーザー
WITH users_with_permission AS (
    -- 直接ロール経由
    SELECT DISTINCT u.user_id
    FROM users u
        INNER JOIN user_roles ur ON u.user_id = ur.user_id
        INNER JOIN role_permissions rp ON ur.role_id = rp.role_id
        INNER JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE u.tenant_id = 'tenant123'
      AND p.resource = 'project:X'
      AND p.action = 'read'
      AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
    
    UNION
    
    -- グループ経由
    SELECT DISTINCT u.user_id
    FROM users u
        INNER JOIN user_groups ug ON u.user_id = ug.user_id
        INNER JOIN group_roles gr ON ug.group_id = gr.group_id
        INNER JOIN role_permissions rp ON gr.role_id = rp.role_id
        INNER JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE u.tenant_id = 'tenant123'
      AND p.resource = 'project:X'
      AND p.action = 'read'
)
SELECT 
    u.user_id,
    u.name,
    u.email,
    u.status
FROM users u
    INNER JOIN users_with_permission uwp ON u.user_id = uwp.user_id
WHERE u.status = 'active'
ORDER BY u.name;
```

### 4. グループの階層構造を辿る（再帰クエリ）

```sql
-- 指定グループとその子孫グループをすべて取得
WITH RECURSIVE group_hierarchy AS (
    -- ベースケース：指定グループ
    SELECT 
        group_id,
        group_name,
        parent_group_id,
        0 AS level
    FROM groups
    WHERE group_id = 'group123'
    
    UNION ALL
    
    -- 再帰：子グループ
    SELECT 
        g.group_id,
        g.group_name,
        g.parent_group_id,
        gh.level + 1
    FROM groups g
        INNER JOIN group_hierarchy gh ON g.parent_group_id = gh.group_id
)
SELECT 
    group_id,
    REPEAT('  ', level) || group_name AS indented_name,
    level
FROM group_hierarchy
ORDER BY level, group_name;
```

### 5. ユーザーアクティビティレポート

```sql
-- 先月のユーザーアクティビティサマリー
SELECT 
    u.user_id,
    u.name,
    u.email,
    COUNT(*) AS total_actions,
    COUNT(DISTINCT DATE(al.created_at)) AS active_days,
    MAX(al.created_at) AS last_activity,
    jsonb_object_agg(
        al.action,
        (SELECT COUNT(*) FROM audit_logs al2 
         WHERE al2.user_id = u.user_id 
           AND al2.action = al.action
           AND al2.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
           AND al2.created_at < DATE_TRUNC('month', CURRENT_DATE))
    ) AS action_breakdown
FROM users u
    INNER JOIN audit_logs al ON u.user_id = al.user_id
WHERE u.tenant_id = 'tenant123'
  AND al.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND al.created_at < DATE_TRUNC('month', CURRENT_DATE)
GROUP BY u.user_id, u.name, u.email
ORDER BY total_actions DESC
LIMIT 100;
```

### 6. 権限マトリックス（ユーザー × 権限）

```sql
-- テナント内の全ユーザーと主要権限のマトリックス
SELECT 
    u.name AS user_name,
    u.email,
    MAX(CASE WHEN p.resource = 'user' AND p.action = 'write' THEN '✓' END) AS user_write,
    MAX(CASE WHEN p.resource = 'project' AND p.action = 'write' THEN '✓' END) AS project_write,
    MAX(CASE WHEN p.resource = 'report' AND p.action = 'read' THEN '✓' END) AS report_read,
    MAX(CASE WHEN p.resource = 'report' AND p.action = 'export' THEN '✓' END) AS report_export
FROM users u
    LEFT JOIN user_roles ur ON u.user_id = ur.user_id
    LEFT JOIN role_permissions rp ON ur.role_id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.permission_id
WHERE u.tenant_id = 'tenant123'
  AND u.status = 'active'
GROUP BY u.user_id, u.name, u.email
ORDER BY u.name;
```

## トリガーとストアドファンクション

### 1. updated_at 自動更新トリガー

```sql
-- トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの適用
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. テナントのユーザー数自動更新

```sql
-- ユーザー数更新関数
CREATE OR REPLACE FUNCTION update_tenant_user_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tenants 
        SET current_users = current_users + 1
        WHERE tenant_id = NEW.tenant_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tenants 
        SET current_users = current_users - 1
        WHERE tenant_id = OLD.tenant_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- トリガー
CREATE TRIGGER update_tenant_user_count_trigger
    AFTER INSERT OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_user_count();
```

### 3. 監査ログ自動記録

```sql
-- 監査ログ記録関数
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
        VALUES (
            NEW.tenant_id,
            NEW.created_by,
            'user.created',
            'user',
            NEW.user_id,
            jsonb_build_object('email', NEW.email, 'name', NEW.name)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
        VALUES (
            NEW.tenant_id,
            CURRENT_SETTING('app.current_user_id', TRUE)::UUID,
            'user.updated',
            'user',
            NEW.user_id,
            jsonb_build_object(
                'old', jsonb_build_object('name', OLD.name, 'status', OLD.status),
                'new', jsonb_build_object('name', NEW.name, 'status', NEW.status)
            )
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
        VALUES (
            OLD.tenant_id,
            CURRENT_SETTING('app.current_user_id', TRUE)::UUID,
            'user.deleted',
            'user',
            OLD.user_id,
            jsonb_build_object('email', OLD.email, 'name', OLD.name)
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- トリガー
CREATE TRIGGER log_user_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_user_changes();
```

### 4. 権限チェック関数

```sql
-- 権限チェック関数（高速化のため）
CREATE OR REPLACE FUNCTION check_user_permission(
    p_user_id UUID,
    p_resource VARCHAR,
    p_action VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
            INNER JOIN role_permissions rp ON ur.role_id = rp.role_id
            INNER JOIN permissions p ON rp.permission_id = p.permission_id
        WHERE ur.user_id = p_user_id
          AND p.resource = p_resource
          AND p.action = p_action
          AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
        
        UNION
        
        SELECT 1
        FROM user_groups ug
            INNER JOIN group_roles gr ON ug.group_id = gr.group_id
            INNER JOIN role_permissions rp ON gr.role_id = rp.role_id
            INNER JOIN permissions p ON rp.permission_id = p.permission_id
        WHERE ug.user_id = p_user_id
          AND p.resource = p_resource
          AND p.action = p_action
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- 使用例
SELECT check_user_permission('user123', 'project:X', 'write');
```

## SAMテンプレート（Aurora Serverless v2）

```yaml
Resources:
  # VPC（Lambda用）
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
  
  # プライベートサブネット
  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
  
  PrivateSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [1, !GetAZs '']
  
  # DBサブネットグループ
  DBSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupDescription: Subnet group for Aurora
      SubnetIds:
        - !Ref PrivateSubnet1
        - !Ref PrivateSubnet2
  
  # セキュリティグループ
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
  
  LambdaSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Lambda security group
      VpcId: !Ref VPC
  
  # データベース認証情報（Secrets Manager）
  DBSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: !Sub ${AWS::StackName}-db-secret
      Description: Database credentials
      GenerateSecretString:
        SecretStringTemplate: '{"username": "dbadmin"}'
        GenerateStringKey: 'password'
        PasswordLength: 32
        ExcludeCharacters: '"@/\\'
  
  # Aurora Serverless v2 クラスター
  DatabaseCluster:
    Type: AWS::RDS::DBCluster
    Properties:
      Engine: aurora-postgresql
      EngineMode: provisioned
      EngineVersion: '15.4'
      DatabaseName: tenantusers
      MasterUsername: !Sub '{{resolve:secretsmanager:${DBSecret}:SecretString:username}}'
      MasterUserPassword: !Sub '{{resolve:secretsmanager:${DBSecret}:SecretString:password}}'
      ServerlessV2ScalingConfiguration:
        MinCapacity: 0.5   # 最小容量（0.5 ACU）
        MaxCapacity: 4     # 最大容量（4 ACU）
      VpcSecurityGroupIds:
        - !Ref DatabaseSecurityGroup
      DBSubnetGroupName: !Ref DBSubnetGroup
      BackupRetentionPeriod: 7
      PreferredBackupWindow: '03:00-04:00'
      PreferredMaintenanceWindow: 'mon:04:00-mon:05:00'
      EnableCloudwatchLogsExports:
        - postgresql
      DeletionProtection: true  # 本番環境では必須
      StorageEncrypted: true
      Tags:
        - Key: Environment
          Value: !Ref Environment
  
  # Aurora インスタンス
  DatabaseInstance1:
    Type: AWS::RDS::DBInstance
    Properties:
      Engine: aurora-postgresql
      DBClusterIdentifier: !Ref DatabaseCluster
      DBInstanceClass: db.serverless
      PubliclyAccessible: false
  
  # オプション：リードレプリカ
  DatabaseInstance2:
    Type: AWS::RDS::DBInstance
    Condition: CreateReadReplica
    Properties:
      Engine: aurora-postgresql
      DBClusterIdentifier: !Ref DatabaseCluster
      DBInstanceClass: db.serverless
      PubliclyAccessible: false
  
  # Lambda関数（RDS接続）
  CreateUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub CreateUser-${Environment}
      CodeUri: functions/create_user/
      Handler: app.lambda_handler
      Runtime: python3.11
      MemorySize: 512
      Timeout: 30
      Environment:
        Variables:
          DB_SECRET_ARN: !Ref DBSecret
          DB_HOST: !GetAtt DatabaseCluster.Endpoint.Address
          DB_NAME: tenantusers
          DB_PORT: 5432
      VpcConfig:
        SecurityGroupIds:
          - !Ref LambdaSecurityGroup
        SubnetIds:
          - !Ref PrivateSubnet1
          - !Ref PrivateSubnet2
      Policies:
        - AWSSecretsManagerGetSecretValuePolicy:
            SecretArn: !Ref DBSecret
        - VPCAccessPolicy: {}

Conditions:
  CreateReadReplica: !Equals [!Ref Environment, 'prod']

Outputs:
  DatabaseEndpoint:
    Description: Database endpoint
    Value: !GetAtt DatabaseCluster.Endpoint.Address
    Export:
      Name: !Sub ${AWS::StackName}-DBEndpoint
  
  DatabasePort:
    Description: Database port
    Value: !GetAtt DatabaseCluster.Endpoint.Port
  
  DBSecretArn:
    Description: Database secret ARN
    Value: !Ref DBSecret
    Export:
      Name: !Sub ${AWS::StackName}-DBSecretArn
```

## Lambda関数実装（PostgreSQL接続）

### requirements.txt

```txt
psycopg2-binary==2.9.9
```

### データベース接続ライブラリ

```python
# layers/common/python/lib/db_connection.py

import json
import os
import boto3
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional

# Secrets Manager
secrets_client = boto3.client('secretsmanager')

# グローバル接続（Lambda実行間で再利用）
_connection = None


def get_db_connection():
    """データベース接続を取得（再利用）"""
    global _connection
    
    # 既存の接続があり、アクティブならそれを返す
    if _connection is not None:
        try:
            # 接続が生きているか確認
            with _connection.cursor() as cur:
                cur.execute('SELECT 1')
            return _connection
        except (psycopg2.OperationalError, psycopg2.InterfaceError):
            # 接続が切れている場合は再接続
            _connection = None
    
    # Secrets Managerから認証情報取得
    secret_arn = os.environ['DB_SECRET_ARN']
    secret = json.loads(
        secrets_client.get_secret_value(SecretId=secret_arn)['SecretString']
    )
    
    # 環境変数からエンドポイント取得
    db_host = os.environ['DB_HOST']
    db_name = os.environ['DB_NAME']
    db_port = os.environ.get('DB_PORT', '5432')
    
    # 接続
    _connection = psycopg2.connect(
        host=db_host,
        database=db_name,
        user=secret['username'],
        password=secret['password'],
        port=db_port,
        connect_timeout=5,
        # 辞書形式で結果を取得
        cursor_factory=RealDictCursor
    )
    
    # オートコミットを無効化（トランザクション管理）
    _connection.autocommit = False
    
    return _connection


def close_db_connection():
    """データベース接続を閉じる"""
    global _connection
    if _connection is not None:
        _connection.close()
        _connection = None
```

### ユーザー作成Lambda関数

```python
# functions/create_user/app.py

import json
import os
import uuid
from datetime import datetime
import psycopg2
from lib.utils import create_response, get_tenant_id, require_admin, logger
from lib.db_connection import get_db_connection


def lambda_handler(event, context):
    """ユーザー作成"""
    conn = None
    
    try:
        # 管理者権限チェック
        require_admin(event)
        
        # テナントID取得
        tenant_id = get_tenant_id(event)
        current_user_id = event['requestContext']['authorizer']['jwt']['claims']['custom:userId']
        
        # リクエスト解析
        body = json.loads(event.get('body', '{}'))
        
        email = body['email']
        name = body['name']
        role_name = body.get('role', 'user')
        profile = body.get('profile', {})
        
        # ユーザーID生成
        user_id = str(uuid.uuid4())
        
        # データベース接続
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # トランザクション開始
        cursor.execute("BEGIN;")
        
        try:
            # 1. ユーザー作成
            cursor.execute("""
                INSERT INTO users (
                    user_id, tenant_id, email, name, 
                    status, email_verified, profile, created_by
                )
                VALUES (%s, %s, %s, %s, 'active', TRUE, %s, %s)
                RETURNING user_id, created_at;
            """, (user_id, tenant_id, email, name, json.dumps(profile), current_user_id))
            
            result = cursor.fetchone()
            created_at = result['created_at']
            
            # 2. デフォルトロールを割り当て
            cursor.execute("""
                INSERT INTO user_roles (user_id, role_id, assigned_by)
                SELECT %s, role_id, %s
                FROM roles
                WHERE tenant_id = %s AND role_name = %s;
            """, (user_id, current_user_id, tenant_id, role_name))
            
            # 3. 監査ログ記録（トリガーで自動記録されるが、明示的にも記録可能）
            cursor.execute("""
                INSERT INTO audit_logs (
                    tenant_id, user_id, action, resource_type, resource_id, details
                )
                VALUES (%s, %s, 'user.created', 'user', %s, %s);
            """, (
                tenant_id,
                current_user_id,
                user_id,
                json.dumps({'email': email, 'name': name, 'role': role_name})
            ))
            
            # コミット
            conn.commit()
            
            logger.info(f"User created: {user_id} in tenant {tenant_id}")
            
            return create_response(201, {
                'userId': user_id,
                'tenantId': tenant_id,
                'email': email,
                'name': name,
                'role': role_name,
                'profile': profile,
                'createdAt': created_at.isoformat()
            })
            
        except psycopg2.IntegrityError as e:
            conn.rollback()
            if 'unique' in str(e).lower():
                return create_response(400, {
                    'error': 'User with this email already exists in this tenant'
                })
            raise
        
        except Exception as e:
            conn.rollback()
            raise
            
    except KeyError as e:
        return create_response(400, {
            'error': f'Missing required field: {str(e)}'
        })
    
    except PermissionError as e:
        return create_response(403, {'error': str(e)})
    
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}", exc_info=True)
        return create_response(500, {'error': 'Internal server error'})
```

### ユーザー権限チェックLambda関数

```python
# functions/check_permission/app.py

from lib.utils import create_response, logger
from lib.db_connection import get_db_connection


def lambda_handler(event, context):
    """ユーザー権限チェック"""
    try:
        # パラメータ取得
        user_id = event['pathParameters']['userId']
        query_params = event.get('queryStringParameters', {}) or {}
        resource = query_params['resource']
        action = query_params['action']
        
        # データベース接続
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 権限チェック（ストアドファンクション使用）
        cursor.execute("""
            SELECT check_user_permission(%s, %s, %s) AS has_permission;
        """, (user_id, resource, action))
        
        result = cursor.fetchone()
        has_permission = result['has_permission']
        
        return create_response(200, {
            'userId': user_id,
            'resource': resource,
            'action': action,
            'hasPermission': has_permission
        })
        
    except KeyError as e:
        return create_response(400, {
            'error': f'Missing required parameter: {str(e)}'
        })
    
    except Exception as e:
        logger.error(f"Error checking permission: {str(e)}", exc_info=True)
        return create_response(500, {'error': 'Internal server error'})
```

## 初期データ投入

```sql
-- init.sql

-- テナント作成
INSERT INTO tenants (tenant_id, tenant_name, subdomain, plan, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'システム管理', 'system', 'enterprise', 'active');

-- システムロール作成
INSERT INTO roles (role_id, tenant_id, role_name, display_name, description, is_system_role) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin', '管理者', 'すべての操作が可能', TRUE),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'user', '一般ユーザー', '基本的な操作が可能', TRUE),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'viewer', '閲覧者', '閲覧のみ可能', TRUE);

-- 権限作成
INSERT INTO permissions (tenant_id, resource, action, description) VALUES
-- ユーザー管理
('00000000-0000-0000-0000-000000000001', 'user', 'read', 'ユーザー情報の閲覧'),
('00000000-0000-0000-0000-000000000001', 'user', 'write', 'ユーザー情報の作成・編集'),
('00000000-0000-0000-0000-000000000001', 'user', 'delete', 'ユーザーの削除'),
-- テナント管理
('00000000-0000-0000-0000-000000000001', 'tenant', 'read', 'テナント情報の閲覧'),
('00000000-0000-0000-0000-000000000001', 'tenant', 'write', 'テナント情報の編集'),
-- ロール管理
('00000000-0000-0000-0000-000000000001', 'role', 'read', 'ロール情報の閲覧'),
('00000000-0000-0000-0000-000000000001', 'role', 'write', 'ロール情報の作成・編集');

-- ロールに権限を割り当て
-- 管理者：すべての権限
INSERT INTO role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000001', permission_id
FROM permissions;

-- 一般ユーザー：閲覧のみ
INSERT INTO role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000002', permission_id
FROM permissions
WHERE action = 'read';
```

## まとめ

### Aurora PostgreSQL の利点
✅ 複雑なクエリが容易（JOIN、サブクエリ）
✅ データ整合性の保証（外部キー制約）
✅ トランザクション管理
✅ ストアドファンクション・トリガー
✅ 柔軟なインデックス設計
✅ 集計・分析が得意

### 設計のポイント
✅ 正規化されたスキーマ
✅ 外部キー制約で整合性保証
✅ 再帰クエリで階層構造対応
✅ JSONB型で柔軟な属性管理
✅ トリガーで自動処理
✅ パーティショニングでスケール対応

---

**次のステップ**: [04_Cognito設定](./04_Cognito設定.md)

