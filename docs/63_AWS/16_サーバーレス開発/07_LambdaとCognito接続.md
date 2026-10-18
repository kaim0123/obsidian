# Lambda と Cognito の接続

## 概要
このガイドでは、AWS Cognitoを使用した認証・認可の実装と、Lambda関数での統合方法を学びます。

## Cognito の主要コンポーネント

### 1. ユーザープール（User Pool）
```
機能:
- ユーザー登録・サインイン
- パスワード管理
- MFA（多要素認証）
- ソーシャルログイン
- カスタム属性
```

### 2. IDプール（Identity Pool / Federated Identities）
```
機能:
- 一時的なAWS認証情報の発行
- ゲストアクセス
- 複数のIDプロバイダー統合
- きめ細かいIAMポリシー
```

## アーキテクチャパターン

### パターン1: API Gateway Cognito Authorizer（最もシンプル）
```
クライアント
    ↓ IDトークン
API Gateway (Cognito Authorizer)
    ↓ 検証済み
Lambda（認証情報をeventから取得）
```

### パターン2: Lambda Authorizer（カスタムロジック）
```
クライアント
    ↓ トークン
API Gateway
    ↓
Lambda Authorizer（カスタム検証）
    ↓ IAMポリシー
API Gateway
    ↓
Lambda（ビジネスロジック）
```

### パターン3: Lambda トリガー（Cognitoイベント）
```
Cognito User Pool
    ↓ イベント（サインアップ、ログインなど）
Lambda（カスタム処理）
    - 検証
    - データベース更新
    - メール送信
```

## A. Cognito ユーザープールの作成

### SAMテンプレート
```yaml
Resources:
  # ユーザープール
  UserPool:
    Type: AWS::Cognito::UserPool
    Properties:
      UserPoolName: my-app-user-pool
      # サインイン設定
      UsernameAttributes:
        - email
      UsernameConfiguration:
        CaseSensitive: false
      # パスワードポリシー
      Policies:
        PasswordPolicy:
          MinimumLength: 8
          RequireLowercase: true
          RequireNumbers: true
          RequireSymbols: true
          RequireUppercase: true
      # MFA設定
      MfaConfiguration: OPTIONAL
      EnabledMfas:
        - SOFTWARE_TOKEN_MFA
        - SMS_MFA
      # アカウント回復
      AccountRecoverySetting:
        RecoveryMechanisms:
          - Name: verified_email
            Priority: 1
      # 自動検証
      AutoVerifiedAttributes:
        - email
      # メール設定
      EmailConfiguration:
        EmailSendingAccount: COGNITO_DEFAULT
      # カスタム属性
      Schema:
        - Name: name
          AttributeDataType: String
          Mutable: true
          Required: true
        - Name: company
          AttributeDataType: String
          Mutable: true
          Required: false
      # Lambda トリガー
      LambdaConfig:
        PreSignUp: !GetAtt PreSignUpFunction.Arn
        PostConfirmation: !GetAtt PostConfirmationFunction.Arn

  # アプリクライアント
  UserPoolClient:
    Type: AWS::Cognito::UserPoolClient
    Properties:
      UserPoolId: !Ref UserPool
      ClientName: web-app-client
      GenerateSecret: false
      RefreshTokenValidity: 30
      AccessTokenValidity: 1
      IdTokenValidity: 1
      TokenValidityUnits:
        AccessToken: hours
        IdToken: hours
        RefreshToken: days
      ExplicitAuthFlows:
        - ALLOW_USER_SRP_AUTH
        - ALLOW_REFRESH_TOKEN_AUTH
      PreventUserExistenceErrors: ENABLED
      ReadAttributes:
        - email
        - name
      WriteAttributes:
        - email
        - name

  # ドメイン
  UserPoolDomain:
    Type: AWS::Cognito::UserPoolDomain
    Properties:
      Domain: my-app-auth-domain
      UserPoolId: !Ref UserPool

Outputs:
  UserPoolId:
    Value: !Ref UserPool
    Export:
      Name: !Sub ${AWS::StackName}-UserPoolId
  
  UserPoolClientId:
    Value: !Ref UserPoolClient
    Export:
      Name: !Sub ${AWS::StackName}-UserPoolClientId
  
  UserPoolArn:
    Value: !GetAtt UserPool.Arn
```

## B. API Gateway Cognito Authorizer

### SAMテンプレート
```yaml
Resources:
  MyApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      Auth:
        Authorizers:
          CognitoAuthorizer:
            IdentitySource: $request.header.Authorization
            JwtConfiguration:
              Audience:
                - !Ref UserPoolClient
              Issuer: !Sub https://cognito-idp.${AWS::Region}.amazonaws.com/${UserPool}
        DefaultAuthorizer: CognitoAuthorizer

  # 保護されたエンドポイント
  ProtectedFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: protected-function
      Runtime: python3.11
      Handler: app.lambda_handler
      CodeUri: functions/protected/
      Events:
        ApiEvent:
          Type: HttpApi
          Properties:
            ApiId: !Ref MyApi
            Path: /protected
            Method: GET
            Auth:
              Authorizer: CognitoAuthorizer

  # 認証不要のエンドポイント
  PublicFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: public-function
      Runtime: python3.11
      Handler: app.lambda_handler
      CodeUri: functions/public/
      Events:
        ApiEvent:
          Type: HttpApi
          Properties:
            ApiId: !Ref MyApi
            Path: /public
            Method: GET
            Auth:
              Authorizer: NONE
```

### Lambda関数でのユーザー情報取得
```python
import json
from typing import Dict, Any

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """認証されたユーザー情報を取得"""
    
    print(f"Event: {json.dumps(event)}")
    
    # Cognito Authorizerから渡される情報
    authorizer = event.get('requestContext', {}).get('authorizer', {})
    jwt_claims = authorizer.get('jwt', {}).get('claims', {})
    
    # ユーザー情報
    user_id = jwt_claims.get('sub')  # Cognito User ID
    email = jwt_claims.get('email')
    name = jwt_claims.get('name')
    
    # カスタム属性
    company = jwt_claims.get('custom:company')
    
    # スコープ
    scopes = jwt_claims.get('scope', '').split()
    
    print(f"User ID: {user_id}")
    print(f"Email: {email}")
    print(f"Name: {name}")
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'message': f'Hello, {name}!',
            'userId': user_id,
            'email': email,
            'company': company
        })
    }
```

### イベント構造（HTTP API）
```json
{
  "version": "2.0",
  "routeKey": "GET /protected",
  "requestContext": {
    "authorizer": {
      "jwt": {
        "claims": {
          "sub": "12345678-1234-1234-1234-123456789012",
          "email": "user@example.com",
          "name": "John Doe",
          "custom:company": "Acme Corp",
          "cognito:username": "johndoe",
          "aud": "1234567890abcdef",
          "token_use": "id",
          "auth_time": "1704067200",
          "exp": "1704070800",
          "iat": "1704067200",
          "iss": "https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_ABC123"
        },
        "scopes": null
      }
    }
  }
}
```

## C. フロントエンドからのCognito認証

### Amazon Cognito Identity SDKの使用

#### セットアップ
```bash
npm install amazon-cognito-identity-js
```

#### サインアップ
```javascript
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'ap-northeast-1_ABC123',
  ClientId: '1234567890abcdef'
};

const userPool = new CognitoUserPool(poolData);

// サインアップ
async function signUp(email, password, name) {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email
      }),
      new CognitoUserAttribute({
        Name: 'name',
        Value: name
      })
    ];
    
    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('User signed up:', result.user.getUsername());
      resolve(result.user);
    });
  });
}

// 使用例
try {
  const user = await signUp('user@example.com', 'Password123!', 'John Doe');
  console.log('Please check your email for verification code');
} catch (error) {
  console.error('Sign up error:', error);
}
```

#### 確認コードの検証
```javascript
async function confirmSignUp(email, code) {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

// 使用例
await confirmSignUp('user@example.com', '123456');
```

#### サインイン
```javascript
import { AuthenticationDetails } from 'amazon-cognito-identity-js';

async function signIn(email, password) {
  return new Promise((resolve, reject) => {
    const authenticationData = {
      Username: email,
      Password: password
    };
    
    const authenticationDetails = new AuthenticationDetails(authenticationData);
    
    const userData = {
      Username: email,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        const accessToken = result.getAccessToken().getJwtToken();
        const idToken = result.getIdToken().getJwtToken();
        const refreshToken = result.getRefreshToken().getToken();
        
        // トークンを保存
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('idToken', idToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        resolve({
          accessToken,
          idToken,
          refreshToken
        });
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // 初回ログイン時に新しいパスワードが必要な場合
        console.log('New password required');
        resolve({ newPasswordRequired: true, cognitoUser, userAttributes });
      }
    });
  });
}

// 使用例
try {
  const tokens = await signIn('user@example.com', 'Password123!');
  console.log('Signed in successfully');
} catch (error) {
  console.error('Sign in error:', error);
}
```

#### トークンのリフレッシュ
```javascript
async function refreshSession() {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    
    if (!cognitoUser) {
      reject(new Error('No current user'));
      return;
    }
    
    cognitoUser.getSession((err, session) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!session.isValid()) {
        // セッションが無効 - リフレッシュ
        const refreshToken = session.getRefreshToken();
        cognitoUser.refreshSession(refreshToken, (err, newSession) => {
          if (err) {
            reject(err);
            return;
          }
          
          const newIdToken = newSession.getIdToken().getJwtToken();
          localStorage.setItem('idToken', newIdToken);
          
          resolve(newSession);
        });
      } else {
        resolve(session);
      }
    });
  });
}
```

#### サインアウト
```javascript
function signOut() {
  const cognitoUser = userPool.getCurrentUser();
  
  if (cognitoUser) {
    cognitoUser.signOut();
  }
  
  // トークンを削除
  localStorage.removeItem('accessToken');
  localStorage.removeItem('idToken');
  localStorage.removeItem('refreshToken');
}
```

### AWS Amplify を使用した実装（推奨・よりシンプル）

#### セットアップ
```bash
npm install aws-amplify
```

#### 設定
```javascript
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'ap-northeast-1',
    userPoolId: 'ap-northeast-1_ABC123',
    userPoolWebClientId: '1234567890abcdef',
    mandatorySignIn: false,
    authenticationFlowType: 'USER_SRP_AUTH'
  }
});
```

#### サインアップ〜サインイン
```javascript
import { Auth } from 'aws-amplify';

// サインアップ
async function signUp(email, password, name) {
  try {
    const { user } = await Auth.signUp({
      username: email,
      password,
      attributes: {
        email,
        name
      }
    });
    console.log('User signed up:', user);
    return user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

// 確認
async function confirmSignUp(email, code) {
  try {
    await Auth.confirmSignUp(email, code);
    console.log('User confirmed');
  } catch (error) {
    console.error('Error confirming sign up:', error);
    throw error;
  }
}

// サインイン
async function signIn(email, password) {
  try {
    const user = await Auth.signIn(email, password);
    console.log('User signed in:', user);
    return user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// 現在のユーザーを取得
async function getCurrentUser() {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return user;
  } catch (error) {
    console.log('Not authenticated');
    return null;
  }
}

// トークンを取得
async function getIdToken() {
  try {
    const session = await Auth.currentSession();
    return session.getIdToken().getJwtToken();
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

// サインアウト
async function signOut() {
  try {
    await Auth.signOut();
    console.log('User signed out');
  } catch (error) {
    console.error('Error signing out:', error);
  }
}
```

### Reactでの実装例
```jsx
import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkUser();
  }, []);
  
  async function checkUser() {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleSignIn(email, password) {
    try {
      const user = await Auth.signIn(email, password);
      setUser(user);
    } catch (error) {
      console.error('Sign in error:', error);
      alert(error.message);
    }
  }
  
  async function handleSignOut() {
    try {
      await Auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <SignInForm onSignIn={handleSignIn} />;
  }
  
  return (
    <div>
      <h1>Welcome, {user.attributes.name}!</h1>
      <button onClick={handleSignOut}>Sign Out</button>
      <Dashboard />
    </div>
  );
}

function SignInForm({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSignIn(email, password);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### 認証付きAPIリクエスト
```javascript
import axios from 'axios';
import { Auth } from 'aws-amplify';

const apiClient = axios.create({
  baseURL: 'https://api.example.com'
});

// リクエストインターセプター
apiClient.interceptors.request.use(async (config) => {
  try {
    const session = await Auth.currentSession();
    const idToken = session.getIdToken().getJwtToken();
    config.headers.Authorization = `Bearer ${idToken}`;
  } catch (error) {
    console.log('Not authenticated');
  }
  return config;
});

// 使用例
async function getProtectedData() {
  const response = await apiClient.get('/protected');
  return response.data;
}
```

## D. Cognito Lambda トリガー

### トリガーの種類
```
サインアップ前: Pre Sign-up
サインアップ後: Post Confirmation
認証前: Pre Authentication
認証後: Post Authentication
トークン生成前: Pre Token Generation
ユーザー移行: User Migration
カスタムメッセージ: Custom Message
```

### Pre Sign-up トリガー
```python
def lambda_handler(event, context):
    """サインアップ前の検証"""
    
    print(f"Event: {json.dumps(event)}")
    
    # ユーザー情報
    user_attributes = event['request']['userAttributes']
    email = user_attributes.get('email', '')
    
    # メールドメインの検証
    allowed_domains = ['example.com', 'company.com']
    domain = email.split('@')[1] if '@' in email else ''
    
    if domain not in allowed_domains:
        raise Exception(f'Email domain {domain} is not allowed')
    
    # 自動確認（管理者承認が不要な場合）
    event['response']['autoConfirmUser'] = True
    event['response']['autoVerifyEmail'] = True
    
    return event
```

### Post Confirmation トリガー
```python
import boto3
import json

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('Users')

def lambda_handler(event, context):
    """サインアップ後にユーザープロフィールを作成"""
    
    user_attributes = event['request']['userAttributes']
    
    # DynamoDBにユーザープロフィールを作成
    users_table.put_item(
        Item={
            'userId': event['userName'],
            'email': user_attributes.get('email'),
            'name': user_attributes.get('name'),
            'createdAt': event['request']['userAttributes'].get('cognito:user_creation_date'),
            'emailVerified': True
        }
    )
    
    print(f"Created profile for user: {event['userName']}")
    
    return event
```

### Pre Token Generation トリガー
```python
def lambda_handler(event, context):
    """トークン生成前にカスタムクレームを追加"""
    
    user_id = event['userName']
    
    # データベースからユーザーロールを取得
    user_role = get_user_role(user_id)
    user_permissions = get_user_permissions(user_id)
    
    # カスタムクレームを追加
    event['response']['claimsOverrideDetails'] = {
        'claimsToAddOrOverride': {
            'role': user_role,
            'permissions': json.dumps(user_permissions)
        }
    }
    
    return event
```

### Lambda トリガーの設定
```yaml
Resources:
  PreSignUpFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: cognito-pre-signup
      Runtime: python3.11
      Handler: app.lambda_handler
      CodeUri: functions/pre_signup/

  # Lambdaに実行権限を付与
  PreSignUpPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref PreSignUpFunction
      Action: lambda:InvokeFunction
      Principal: cognito-idp.amazonaws.com
      SourceArn: !GetAtt UserPool.Arn
```

## まとめ

✅ Cognito User Poolの作成
✅ API Gateway Cognito Authorizerの設定
✅ Lambda関数でのユーザー情報取得
✅ フロントエンドからの認証実装（SDK / Amplify）
✅ Cognito Lambda トリガーの活用

**次のステップ**:
- [08_APIGatewayとCognito統合](./08_APIGatewayとCognito統合.md)
- [04_LambdaとDynamoDB接続](./04_LambdaとDynamoDB接続.md)

---

**関連ドキュメント**:
- [Cognito公式ドキュメント](https://docs.aws.amazon.com/cognito/)
- [IAM基礎](../07_セキュリティ/01_IAM/)

