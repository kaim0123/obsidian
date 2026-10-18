# API Gateway とアプリケーションの接続

## 概要
このガイドでは、フロントエンドアプリケーション（React、Vue、Next.jsなど）からAPI Gatewayエンドポイントを呼び出す方法を学びます。

## フロントエンドからのAPI呼び出し方法

### 1. Fetch API（ネイティブ）
### 2. Axios（人気ライブラリ）
### 3. AWS Amplify（AWS統合）
### 4. 生成されたSDK

## A. Fetch API を使用した基本的な呼び出し

### GET リクエスト
```javascript
// ユーザー一覧を取得
async function getUsers() {
  try {
    const response = await fetch(
      'https://abc123.execute-api.ap-northeast-1.amazonaws.com/users?limit=10'
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Users:', data.users);
    return data.users;
    
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// 特定のユーザーを取得
async function getUser(userId) {
  const response = await fetch(
    `https://abc123.execute-api.ap-northeast-1.amazonaws.com/users/${userId}`
  );
  
  if (response.status === 404) {
    throw new Error('User not found');
  }
  
  return await response.json();
}
```

### POST リクエスト
```javascript
async function createUser(userData) {
  try {
    const response = await fetch(
      'https://abc123.execute-api.ap-northeast-1.amazonaws.com/users',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// 使用例
const newUser = await createUser({
  name: 'John Doe',
  email: 'john@example.com'
});
```

### PUT リクエスト
```javascript
async function updateUser(userId, userData) {
  const response = await fetch(
    `https://abc123.execute-api.ap-northeast-1.amazonaws.com/users/${userId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    }
  );
  
  return await response.json();
}
```

### DELETE リクエスト
```javascript
async function deleteUser(userId) {
  const response = await fetch(
    `https://abc123.execute-api.ap-northeast-1.amazonaws.com/users/${userId}`,
    {
      method: 'DELETE'
    }
  );
  
  if (response.status === 204) {
    return { success: true };
  }
  
  return await response.json();
}
```

## B. Axios を使用した実装

### セットアップ
```bash
npm install axios
```

### APIクライアントの作成
```javascript
// api/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://abc123.execute-api.ap-northeast-1.amazonaws.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// リクエストインターセプター（認証トークン追加など）
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // サーバーがエラーレスポンスを返した
      console.error('API Error:', error.response.data);
      
      if (error.response.status === 401) {
        // 認証エラー - ログインページにリダイレクト
        window.location.href = '/login';
      }
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない
      console.error('No response received:', error.request);
    } else {
      // リクエスト設定時のエラー
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### APIサービスの実装
```javascript
// api/userService.js
import apiClient from './client';

export const userService = {
  // ユーザー一覧取得
  async getUsers(params = {}) {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },
  
  // 特定ユーザー取得
  async getUser(userId) {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },
  
  // ユーザー作成
  async createUser(userData) {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },
  
  // ユーザー更新
  async updateUser(userId, userData) {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },
  
  // ユーザー削除
  async deleteUser(userId) {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  }
};
```

### Reactコンポーネントでの使用
```jsx
// components/UserList.jsx
import React, { useState, useEffect } from 'react';
import { userService } from '../api/userService';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers({ limit: 20 });
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (userId) => {
    if (window.confirm('本当に削除しますか？')) {
      try {
        await userService.deleteUser(userId);
        // リストから削除
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        alert('削除に失敗しました');
      }
    }
  };
  
  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  
  return (
    <div>
      <h2>ユーザー一覧</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => handleDelete(user.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
```

## C. CORS設定

### API Gateway での CORS 設定

#### HTTP API（SAMテンプレート）
```yaml
Resources:
  MyHttpApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      CorsConfiguration:
        AllowOrigins:
          - "https://www.example.com"
          - "https://app.example.com"
          - "http://localhost:3000"  # 開発環境
        AllowHeaders:
          - Content-Type
          - Authorization
          - X-Api-Key
          - X-Requested-With
        AllowMethods:
          - GET
          - POST
          - PUT
          - DELETE
          - PATCH
          - OPTIONS
        MaxAge: 300  # プリフライトリクエストのキャッシュ時間（秒）
        AllowCredentials: true
        ExposeHeaders:
          - X-Request-Id
```

#### REST API（SAMテンプレート）
```yaml
Resources:
  MyRestApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: prod
      Cors:
        AllowOrigin: "'https://www.example.com'"
        AllowHeaders: "'Content-Type,Authorization'"
        AllowMethods: "'GET,POST,PUT,DELETE,OPTIONS'"
        MaxAge: "'300'"
      GatewayResponses:
        # 4xxエラーのCORSヘッダー
        DEFAULT_4XX:
          ResponseParameters:
            Headers:
              Access-Control-Allow-Origin: "'*'"
              Access-Control-Allow-Headers: "'Content-Type,Authorization'"
        # 5xxエラーのCORSヘッダー
        DEFAULT_5XX:
          ResponseParameters:
            Headers:
              Access-Control-Allow-Origin: "'*'"
              Access-Control-Allow-Headers: "'Content-Type,Authorization'"
```

### Lambda関数でのCORSヘッダー追加
```python
def lambda_handler(event, context):
    # OPTIONSリクエスト（プリフライト）の処理
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Max-Age': '300'
            },
            'body': ''
        }
    
    # 通常の処理
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'message': 'Success'})
    }
```

## D. 認証付きリクエスト

### Cognito認証トークンの使用
```javascript
// auth/authService.js
export const authService = {
  // Cognitoからトークンを取得
  getAccessToken() {
    return localStorage.getItem('accessToken');
  },
  
  getIdToken() {
    return localStorage.getItem('idToken');
  },
  
  // トークンをストレージに保存
  setTokens(accessToken, idToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('idToken', idToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  
  // ログアウト
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
  }
};
```

### 認証付きAPIクライアント
```javascript
import axios from 'axios';
import { authService } from '../auth/authService';

const authenticatedClient = axios.create({
  baseURL: 'https://abc123.execute-api.ap-northeast-1.amazonaws.com',
});

authenticatedClient.interceptors.request.use(
  (config) => {
    const token = authService.getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// リフレッシュトークンによる自動更新
authenticatedClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // トークンをリフレッシュ
        const newToken = await refreshAccessToken();
        authService.setTokens(newToken.accessToken, newToken.idToken);
        
        // リクエストを再実行
        originalRequest.headers.Authorization = `Bearer ${newToken.idToken}`;
        return authenticatedClient(originalRequest);
      } catch (refreshError) {
        // リフレッシュ失敗 - ログアウト
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## E. カスタムドメインの設定

### ドメインの作成（Route 53）
```yaml
Resources:
  # ACM証明書（us-east-1リージョンで作成）
  ApiCertificate:
    Type: AWS::CertificateManager::Certificate
    Properties:
      DomainName: api.example.com
      ValidationMethod: DNS
      DomainValidationOptions:
        - DomainName: api.example.com
          HostedZoneId: !Ref HostedZone

  # API Gatewayカスタムドメイン
  ApiDomainName:
    Type: AWS::ApiGatewayV2::DomainName
    Properties:
      DomainName: api.example.com
      DomainNameConfigurations:
        - CertificateArn: !Ref ApiCertificate
          EndpointType: REGIONAL

  # APIマッピング
  ApiMapping:
    Type: AWS::ApiGatewayV2::ApiMapping
    Properties:
      DomainName: !Ref ApiDomainName
      ApiId: !Ref MyHttpApi
      Stage: !Ref MyHttpApiStage

  # Route 53レコード
  ApiDnsRecord:
    Type: AWS::Route53::RecordSet
    Properties:
      HostedZoneId: !Ref HostedZone
      Name: api.example.com
      Type: A
      AliasTarget:
        DNSName: !GetAtt ApiDomainName.RegionalDomainName
        HostedZoneId: !GetAtt ApiDomainName.RegionalHostedZoneId
```

### フロントエンドでの使用
```javascript
// 環境変数で管理
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.example.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL
});
```

### 環境別設定
```javascript
// config/api.js
const config = {
  development: {
    apiUrl: 'http://localhost:3000'
  },
  staging: {
    apiUrl: 'https://api-staging.example.com'
  },
  production: {
    apiUrl: 'https://api.example.com'
  }
};

const env = process.env.NODE_ENV || 'development';
export const apiConfig = config[env];
```

## F. エラーハンドリング

### 統一的なエラーハンドリング
```javascript
// utils/errorHandler.js
export class ApiError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

export function handleApiError(error) {
  if (error.response) {
    // サーバーエラーレスポンス
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        throw new ApiError('リクエストが不正です', status, data);
      case 401:
        throw new ApiError('認証が必要です', status, data);
      case 403:
        throw new ApiError('アクセス権限がありません', status, data);
      case 404:
        throw new ApiError('リソースが見つかりません', status, data);
      case 429:
        throw new ApiError('リクエスト数が上限を超えました', status, data);
      case 500:
        throw new ApiError('サーバーエラーが発生しました', status, data);
      default:
        throw new ApiError('不明なエラーが発生しました', status, data);
    }
  } else if (error.request) {
    // リクエストは送信されたがレスポンスなし
    throw new ApiError('サーバーに接続できません', 0);
  } else {
    // リクエスト設定エラー
    throw new ApiError('リクエストの設定エラー', 0);
  }
}

// 使用例
try {
  const user = await userService.getUser(userId);
} catch (error) {
  const apiError = handleApiError(error);
  console.error(apiError.message);
  
  // ユーザーに通知
  alert(apiError.message);
}
```

## G. TypeScript での型安全な実装

### 型定義
```typescript
// types/user.ts
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
```

### APIサービス（TypeScript）
```typescript
// api/userService.ts
import { AxiosResponse } from 'axios';
import apiClient from './client';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse
} from '../types/user';

export const userService = {
  async getUsers(
    limit: number = 10,
    offset: number = 0
  ): Promise<PaginatedResponse<User>> {
    const response: AxiosResponse<PaginatedResponse<User>> = 
      await apiClient.get('/users', {
        params: { limit, offset }
      });
    return response.data;
  },
  
  async getUser(userId: number): Promise<User> {
    const response: AxiosResponse<User> = 
      await apiClient.get(`/users/${userId}`);
    return response.data;
  },
  
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response: AxiosResponse<User> = 
      await apiClient.post('/users', userData);
    return response.data;
  },
  
  async updateUser(
    userId: number,
    userData: UpdateUserRequest
  ): Promise<User> {
    const response: AxiosResponse<User> = 
      await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },
  
  async deleteUser(userId: number): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  }
};
```

### Reactカスタムフック
```typescript
// hooks/useUsers.ts
import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { userService } from '../api/userService';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data.items);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  
  const createUser = async (userData: CreateUserRequest) => {
    const newUser = await userService.createUser(userData);
    setUsers([...users, newUser]);
    return newUser;
  };
  
  const deleteUser = async (userId: number) => {
    await userService.deleteUser(userId);
    setUsers(users.filter(user => user.id !== userId));
  };
  
  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    deleteUser
  };
}
```

## H. Next.js での実装

### API Routes（サーバーサイドプロキシ）
```typescript
// pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_BASE_URL = process.env.API_GATEWAY_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await axios({
      method: req.method,
      url: `${API_BASE_URL}/users`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        // APIキーなどの機密情報はサーバーサイドで管理
        'X-Api-Key': process.env.API_KEY
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.message
    });
  }
}
```

### クライアントサイドでの使用
```typescript
// pages/users/index.tsx
export default function UsersPage() {
  const { users, loading } = useUsers();
  
  // /api/users を呼び出す（Next.jsの API Routes）
  // これにより、APIキーなどをクライアントに露出させない
}
```

## まとめ

✅ Fetch APIとAxiosでのAPI呼び出し
✅ CORS設定の理解と実装
✅ 認証付きリクエストの実装
✅ カスタムドメインの設定
✅ エラーハンドリング
✅ TypeScriptによる型安全な実装
✅ Next.jsでのサーバーサイドプロキシ

**次のステップ**:
- [07_LambdaとCognito接続](./07_LambdaとCognito接続.md)
- [09_LambdaとS3接続](./09_LambdaとS3接続.md)

---

**関連ドキュメント**:
- [API Gateway CORS設定](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)
- [カスタムドメイン設定](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html)

