# Amazon Cognito 初心者向け解説

## 目次
1. [Amazon Cognitoとは](#amazon-cognitoとは)
2. [主要な機能](#主要な機能)
3. [Cognito User Pools vs Cognito Identity Pools](#cognito-user-pools-vs-cognito-identity-pools)
4. [基本的な使い方](#基本的な使い方)
5. [実装例](#実装例)
6. [料金体系](#料金体系)
7. [セキュリティ機能](#セキュリティ機能)
8. [よくある質問](#よくある質問)

## Amazon Cognitoとは

Amazon Cognitoは、AWSが提供する**ユーザー認証・認可サービス**です。Webアプリケーションやモバイルアプリケーションで、ユーザーの登録、ログイン、パスワード管理、アクセストークンの発行などを簡単に実装できます。

### なぜCognitoを使うのか？

従来の認証システムを自前で実装する場合：
- セキュリティの実装が複雑
- パスワードハッシュ化、トークン管理など専門知識が必要
- セキュリティホールのリスク
- 開発・保守コストが高い

Cognitoを使うことで：
- セキュリティがAWSによって管理される
- 開発者は認証ロジックに集中できる
- 業界標準のセキュリティ機能を利用可能
- スケーラブルで高可用性

## 主要な機能

### 1. ユーザー登録・ログイン
- メールアドレス/ユーザー名での登録
- パスワードの安全な管理
- 多要素認証（MFA）対応
- ソーシャルログイン（Google、Facebook、Amazon等）

### 2. パスワード管理
- パスワードリセット機能
- パスワード強度の設定
- パスワード有効期限の管理

### 3. セッション管理
- JWT（JSON Web Token）の発行
- リフレッシュトークンの管理
- セッションの有効期限設定

### 4. ユーザープール管理
- ユーザー属性の管理
- カスタム属性の追加
- ユーザーグループの管理

## Cognito User Pools vs Cognito Identity Pools

### Cognito User Pools（ユーザープール）
**ユーザー認証**に特化したサービス
- ユーザー登録・ログイン機能
- パスワード管理
- 多要素認証
- ユーザー属性管理
- JWTトークンの発行

### Cognito Identity Pools（フェデレーティッドアイデンティティ）
**AWSリソースへのアクセス権限**を管理
- 一時的なAWS認証情報の提供
- ソーシャルプロバイダーとの連携
- AWSサービスへのアクセス制御

## 基本的な使い方

### 1. User Poolの作成

```bash
# AWS CLIでの作成例
aws cognito-idp create-user-pool \
    --pool-name "MyUserPool" \
    --policies '{
        "PasswordPolicy": {
            "MinimumLength": 8,
            "RequireUppercase": true,
            "RequireLowercase": true,
            "RequireNumbers": true,
            "RequireSymbols": true
        }
    }'
```

### 2. アプリクライアントの作成

```bash
aws cognito-idp create-user-pool-client \
    --user-pool-id "us-east-1_XXXXXXXXX" \
    --client-name "MyAppClient" \
    --generate-secret
```

### 3. ユーザー登録（JavaScript例）

```javascript
// AWS SDK for JavaScript
import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: 'us-east-1_XXXXXXXXX',
    ClientId: 'your-client-id'
};

const userPool = new CognitoUserPool(poolData);

// ユーザー登録
function signUp(username, email, password) {
    const attributeList = [
        new CognitoUserAttribute({
            Name: 'email',
            Value: email
        })
    ];

    userPool.signUp(username, password, attributeList, null, (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('ユーザー登録成功:', result);
    });
}
```

### 4. ユーザーログイン

```javascript
function signIn(username, password) {
    const authenticationData = {
        Username: username,
        Password: password
    };

    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const userData = {
        Username: username,
        Pool: userPool
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            console.log('ログイン成功:', result);
            // アクセストークンを取得
            const accessToken = result.getAccessToken().getJwtToken();
        },
        onFailure: (err) => {
            console.error('ログイン失敗:', err);
        }
    });
}
```

## 実装例

### React + Cognito の実装例

```jsx
import React, { useState, useEffect } from 'react';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const poolData = {
        UserPoolId: process.env.REACT_APP_USER_POOL_ID,
        ClientId: process.env.REACT_APP_CLIENT_ID
    };

    const userPool = new CognitoUserPool(poolData);

    useEffect(() => {
        // 既存のセッションをチェック
        const currentUser = userPool.getCurrentUser();
        if (currentUser) {
            currentUser.getSession((err, session) => {
                if (err) {
                    setLoading(false);
                    return;
                }
                setUser(currentUser);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    const signIn = (username, password) => {
        return new Promise((resolve, reject) => {
            const authenticationDetails = new AuthenticationDetails({
                Username: username,
                Password: password
            });

            const cognitoUser = new CognitoUser({
                Username: username,
                Pool: userPool
            });

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    setUser(cognitoUser);
                    resolve(result);
                },
                onFailure: (err) => {
                    reject(err);
                }
            });
        });
    };

    const signOut = () => {
        if (user) {
            user.signOut();
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
```

## 料金体系

### 無料利用枠
- **月間50,000 MAU（Monthly Active Users）**まで無料
- 多要素認証：月間50,000回まで無料

### 有料料金（2024年時点）
- **MAU超過分**: $0.0055/MAU
- **多要素認証**: $0.05/認証
- **SMS認証**: $0.05/SMS

### 料金計算例
- 月間アクティブユーザー10万人の場合：
  - 無料枠: 50,000 MAU
  - 有料分: 50,000 MAU × $0.0055 = $275/月

## セキュリティ機能

### 1. パスワードポリシー
```json
{
    "PasswordPolicy": {
        "MinimumLength": 8,
        "RequireUppercase": true,
        "RequireLowercase": true,
        "RequireNumbers": true,
        "RequireSymbols": true,
        "TemporaryPasswordValidityDays": 7
    }
}
```

### 2. 多要素認証（MFA）
- SMS認証
- TOTP（Time-based One-Time Password）
- ハードウェアセキュリティキー

### 3. リスクベース認証
- 異常なログイン試行の検出
- 地理的位置に基づく認証
- デバイス信頼性の評価

### 4. データ保護
- データの暗号化（保存時・転送時）
- GDPR準拠
- プライバシー保護機能

## よくある質問

### Q: Cognitoと他の認証サービスとの違いは？
**A:** 
- **Auth0**: より多くのカスタマイズオプション、高機能
- **Firebase Auth**: Googleエコシステムとの統合が強い
- **Cognito**: AWSエコシステムとの統合、コスト効率

### Q: 既存のデータベースのユーザーを移行できますか？
**A:** はい。AWS CLIやSDKを使用してユーザーを一括インポートできます。

### Q: カスタム認証フローは実装できますか？
**A:** はい。Lambda関数を使用してカスタム認証チャレンジを実装できます。

### Q: ソーシャルログインはどのプロバイダーに対応していますか？
**A:** 
- Google
- Facebook
- Amazon
- Apple
- SAML 2.0
- OpenID Connect

### Q: パフォーマンスに影響はありますか？
**A:** CognitoはAWSのグローバルインフラストラクチャを使用しているため、高い可用性と低レイテンシを提供します。

## まとめ

Amazon Cognitoは、アプリケーションの認証・認可を簡単に実装できる強力なサービスです。特にAWSエコシステムを使用している場合、他のAWSサービスとの統合が容易で、セキュリティもAWSによって管理されるため、開発者はビジネスロジックに集中できます。

初心者の方は、まずUser Poolから始めて、基本的なユーザー登録・ログイン機能を実装することから始めることをお勧めします。
