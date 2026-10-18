# Phase 2: 認証機能

## 概要

Amazon Cognitoを使用してユーザー認証機能を実装します。ユーザー登録、ログイン、権限管理、セッション管理を構築します。

## 2.1 Cognito設定

### Cognitoユーザープール作成
```yaml
# infrastructure/cognito.yaml
Resources:
  UserPool:
    Type: AWS::Cognito::UserPool
    Properties:
      UserPoolName: DocumentManagementUsers
      Policies:
        PasswordPolicy:
          MinimumLength: 8
          RequireUppercase: true
          RequireLowercase: true
          RequireNumbers: true
          RequireSymbols: true
      Schema:
        - Name: email
          AttributeDataType: String
          Required: true
          Mutable: true
        - Name: name
          AttributeDataType: String
          Required: true
          Mutable: true
        - Name: role
          AttributeDataType: String
          Required: false
          Mutable: true

  UserPoolClient:
    Type: AWS::Cognito::UserPoolClient
    Properties:
      UserPoolId: !Ref UserPool
      ClientName: DocumentManagementClient
      GenerateSecret: false
      ExplicitAuthFlows:
        - ALLOW_USER_SRP_AUTH
        - ALLOW_REFRESH_TOKEN_AUTH
```

## 2.2 認証ミドルウェア実装

### Lambda認証関数
```typescript
// lambda/functions/auth/index.ts
import { APIGatewayTokenAuthorizerEvent, Context } from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: 'access',
  clientId: process.env.USER_POOL_CLIENT_ID!
});

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent,
  context: Context
) => {
  try {
    const token = event.authorizationToken;
    const payload = await verifier.verify(token);
    
    return {
      principalId: payload.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn
          }
        ]
      },
      context: {
        userId: payload.sub,
        email: payload.email,
        role: payload['custom:role'] || 'viewer'
      }
    };
  } catch (error) {
    throw new Error('Unauthorized');
  }
};
```

## 2.3 フロントエンド認証実装

### 認証コンテキスト
```typescript
// app/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import { Auth } from 'aws-amplify';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const session = await Auth.currentSession();
      const user = await Auth.currentAuthenticatedUser();
      setUser({
        id: user.attributes.sub,
        email: user.attributes.email,
        name: user.attributes.name,
        role: user.attributes['custom:role'] || 'viewer'
      });
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const user = await Auth.signIn(email, password);
      setUser({
        id: user.attributes.sub,
        email: user.attributes.email,
        name: user.attributes.name,
        role: user.attributes['custom:role'] || 'viewer'
      });
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          name
        }
      });
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### ログインコンポーネント
```typescript
// app/components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          パスワード
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  );
}
```

### ユーザー登録コンポーネント
```typescript
// app/components/SignUpForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signUp(email, password, name);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-semibold text-green-600 mb-2">
          登録完了
        </h3>
        <p className="text-gray-600">
          確認メールを送信しました。メール内のリンクをクリックしてアカウントを有効化してください。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          名前
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          パスワード
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          minLength={8}
        />
        <p className="text-xs text-gray-500 mt-1">
          8文字以上、大文字・小文字・数字・記号を含む必要があります
        </p>
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? '登録中...' : '登録'}
      </button>
    </form>
  );
}
```

## 2.4 権限管理実装

### 権限チェックミドルウェア
```typescript
// app/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { Auth } from 'aws-amplify';

export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await Auth.currentAuthenticatedUser();
    const role = user.attributes['custom:role'] || 'viewer';
    
    // 管理者専用ページのチェック
    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/documents/:path*', '/admin/:path*']
};
```

### 権限ベースコンポーネント
```typescript
// app/components/ProtectedRoute.tsx
'use client';

import { useAuth } from '../contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback = <div>アクセス権限がありません</div> 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!user) {
    return <div>ログインが必要です</div>;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

## 2.5 セッション管理

### セッション更新
```typescript
// app/hooks/useSession.ts
'use client';

import { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';

export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
    
    // セッション更新の定期チェック
    const interval = setInterval(checkSession, 5 * 60 * 1000); // 5分ごと
    
    return () => clearInterval(interval);
  }, []);

  const checkSession = async () => {
    try {
      const currentSession = await Auth.currentSession();
      setSession(currentSession);
    } catch (error) {
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const currentSession = await Auth.currentSession();
      const refreshedSession = await Auth.refreshSession(currentSession);
      setSession(refreshedSession);
    } catch (error) {
      console.error('Session refresh failed:', error);
    }
  };

  return { session, loading, refreshSession };
}
```

## 次のステップ

Phase 2が完了したら、Phase 3のファイルストレージ機能の実装に進みます。
