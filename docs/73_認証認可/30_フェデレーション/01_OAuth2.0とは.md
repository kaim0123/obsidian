# OAuth2.0とは

OAuth2.0は、現代のWebアプリケーションで広く使われている認証・認可の仕組みです。この章では、OAuth2.0の概念と使い方について初心者向けに解説します。

## 📖 OAuth2.0とは何か

**OAuth2.0（オーオース2.0）**は、「Open Authorization 2.0」の略で、ユーザーが自分のアカウント情報を提供元に渡すことなく、第三者のアプリケーションにアクセス権限を付与するためのプロトコルです。

### 日常生活での例え

OAuth2.0は、「ホテルの鍵カード」のようなものです。

- **あなた（ユーザー）**: ホテルにチェックインする
- **フロント（認証サーバー）**: あなたの身分を確認し、鍵カード（アクセストークン）を発行
- **鍵カード（アクセストークン）**: 部屋に入る権限を持つ
- **部屋（リソースサーバー）**: 鍵カードがあれば入れる

あなたは、フロントで身分を証明すれば、鍵カードを使って部屋に入れます。OAuth2.0も同じように、認証サーバーで認証すれば、アクセストークンを使ってリソースにアクセスできます。

## 🔑 OAuth2.0の主な目的

### 1. パスワードを共有しない

従来の方法では、第三者のアプリケーションにパスワードを渡す必要がありました。OAuth2.0では、パスワードを共有せずにアクセス権限を付与できます。

```
❌ 従来の方法:
ユーザー → アプリ: 「パスワードは123456です」
アプリ → サービス: 「パスワード123456でログインします」

✅ OAuth2.0:
ユーザー → 認証サーバー: 「このアプリにアクセス権限を付与します」
認証サーバー → アプリ: 「アクセストークンを発行します」
アプリ → サービス: 「アクセストークンでアクセスします」
```

### 2. 限定的なアクセス権限

アプリケーションに必要な権限だけを付与できます。

```
例：
- 写真アプリ: 写真へのアクセスのみ
- カレンダーアプリ: カレンダーへのアクセスのみ
- メールアプリ: メールへのアクセスのみ
```

### 3. アクセス権限の取り消し

いつでもアクセス権限を取り消すことができます。

## 🎭 OAuth2.0の登場人物

OAuth2.0には、4つの主要な役割があります。

### 1. リソースオーナー（Resource Owner）

**ユーザー**のことです。自分のリソース（データ）の所有者です。

```
例：あなたがGoogleアカウントを持っている場合
- あなた = リソースオーナー
- Googleアカウントのデータ = リソース
```

### 2. クライアント（Client）

**アプリケーション**のことです。ユーザーのリソースにアクセスしたいアプリです。

```
例：
- あなたが使っているWebアプリ
- モバイルアプリ
- デスクトップアプリ
```

### 3. 認証サーバー（Authorization Server）

**認証とトークン発行を担当するサーバー**です。

```
例：
- Googleの認証サーバー
- GitHubの認証サーバー
- Facebookの認証サーバー
```

### 4. リソースサーバー（Resource Server）

**実際のデータ（リソース）を提供するサーバー**です。

```
例：
- GoogleのAPIサーバー（ユーザー情報、メールなど）
- GitHubのAPIサーバー（リポジトリ情報など）
```

## 🔄 OAuth2.0の基本的な流れ

### 認証コードフロー（Authorization Code Flow）

最も一般的なフローです。

```
1. ユーザーがアプリで「Googleでログイン」をクリック
   ↓
2. アプリがユーザーをGoogleの認証ページにリダイレクト
   ↓
3. ユーザーがGoogleでログインし、アプリへのアクセスを許可
   ↓
4. Googleが認証コードをアプリに返す
   ↓
5. アプリが認証コードを認証サーバーに送信
   ↓
6. 認証サーバーがアクセストークンを発行
   ↓
7. アプリがアクセストークンを使ってリソースにアクセス
```

### 詳細なステップ

#### ステップ1: 認証リクエスト

```javascript
// アプリがユーザーを認証サーバーにリダイレクト
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=http://localhost:3000/callback&
  response_type=code&
  scope=email profile&
  state=random_string`;

window.location.href = authUrl;
```

**パラメータの説明**:
- `client_id`: アプリのID
- `redirect_uri`: 認証後のリダイレクト先
- `response_type`: `code`（認証コードを要求）
- `scope`: 要求する権限（email、profileなど）
- `state`: CSRF攻撃を防ぐためのランダムな文字列

#### ステップ2: ユーザーが認証

ユーザーがGoogleでログインし、アプリへのアクセスを許可します。

#### ステップ3: 認証コードを受け取る

```javascript
// リダイレクト先（/callback）で認証コードを受け取る
// URL: http://localhost:3000/callback?code=AUTHORIZATION_CODE&state=random_string

const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');
```

#### ステップ4: アクセストークンを取得

```javascript
// サーバー側でアクセストークンを取得
async function getAccessToken(code) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code: code,
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET',
      redirect_uri: 'http://localhost:3000/callback',
      grant_type: 'authorization_code',
    }),
  });

  const data = await response.json();
  return data.access_token; // アクセストークン
}
```

#### ステップ5: リソースにアクセス

```javascript
// アクセストークンを使ってリソースにアクセス
async function getUserInfo(accessToken) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const userInfo = await response.json();
  return userInfo;
}
```

## 💻 実践例：完全な実装

### フロントエンド（React）

```javascript
// components/LoginButton.jsx
import { useState } from 'react';

function LoginButton() {
  const [user, setUser] = useState(null);

  const handleLogin = () => {
    // Googleの認証ページにリダイレクト
    const clientId = 'YOUR_CLIENT_ID';
    const redirectUri = encodeURIComponent('http://localhost:3000/callback');
    const scope = encodeURIComponent('email profile');
    const state = Math.random().toString(36).substring(7);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
      client_id=${clientId}&
      redirect_uri=${redirectUri}&
      response_type=code&
      scope=${scope}&
      state=${state}`;

    window.location.href = authUrl;
  };

  const handleCallback = async () => {
    // URLから認証コードを取得
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // サーバーに認証コードを送信してアクセストークンを取得
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const { accessToken } = await response.json();

      // ユーザー情報を取得
      const userInfo = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }).then(res => res.json());

      setUser(userInfo);
    }
  };

  // コールバックページで実行
  useEffect(() => {
    handleCallback();
  }, []);

  if (user) {
    return <div>こんにちは、{user.name}さん</div>;
  }

  return <button onClick={handleLogin}>Googleでログイン</button>;
}
```

### バックエンド（Express.js）

```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// 認証コードをアクセストークンに交換
router.post('/callback', async (req, res) => {
  try {
    const { code } = req.body;

    // Googleのトークンエンドポイントにリクエスト
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'http://localhost:3000/callback',
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token } = response.data;

    // アクセストークンをセッションやデータベースに保存
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;

    res.json({ accessToken: access_token });
  } catch (error) {
    console.error('認証エラー:', error);
    res.status(400).json({ error: '認証に失敗しました' });
  }
});

// ユーザー情報を取得
router.get('/user', async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ error: 'アクセストークンが必要です' });
    }

    // GoogleのAPIでユーザー情報を取得
    const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    res.status(401).json({ error: 'ユーザー情報の取得に失敗しました' });
  }
});

module.exports = router;
```

## 🔐 OAuth2.0のフロー種類

### 1. 認証コードフロー（Authorization Code Flow）

最も安全で一般的なフロー。サーバー側のアプリケーションで使用。

```
特徴：
- 最も安全
- サーバー側で使用
- アクセストークンとリフレッシュトークンを取得
```

### 2. インプリシットフロー（Implicit Flow）

**非推奨**。クライアント側のアプリケーションで使用されていましたが、現在は非推奨です。

### 3. クライアントクレデンシャルフロー（Client Credentials Flow）

アプリケーション同士の認証に使用。ユーザーは関与しません。

```javascript
// サーバー間の認証
const response = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    grant_type: 'client_credentials',
  }),
});
```

### 4. リソースオーナーパスワードクレデンシャルフロー

**非推奨**。パスワードを直接渡すため、セキュリティリスクが高いです。

## 🔄 リフレッシュトークン

アクセストークンは有効期限が短いため、リフレッシュトークンを使って新しいアクセストークンを取得します。

```javascript
// アクセストークンの有効期限が切れた場合
async function refreshAccessToken(refreshToken) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  return data.access_token; // 新しいアクセストークン
}
```

## 📊 実際のOAuth2.0プロバイダー

### Google OAuth2.0

```javascript
// Googleでログイン
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=http://localhost:3000/callback&
  response_type=code&
  scope=email profile&
  access_type=offline&
  prompt=consent`;
```

### GitHub OAuth2.0

```javascript
// GitHubでログイン
const authUrl = `https://github.com/login/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=http://localhost:3000/callback&
  scope=user:email`;
```

### Facebook OAuth2.0

```javascript
// Facebookでログイン
const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=http://localhost:3000/callback&
  scope=email`;
```

## ⚠️ セキュリティの注意点

### 1. クライアントシークレットの保護

```javascript
// ❌ 間違い（クライアントシークレットをクライアント側に書く）
const clientSecret = 'secret-key-12345'; // 危険！

// ✅ 正しい（サーバー側で管理）
// 環境変数や設定ファイルで管理
const clientSecret = process.env.CLIENT_SECRET;
```

### 2. stateパラメータの使用

CSRF攻撃を防ぐために、`state`パラメータを使用します。

```javascript
// stateを生成
const state = Math.random().toString(36).substring(7);
sessionStorage.setItem('oauth_state', state);

// コールバックで検証
const returnedState = urlParams.get('state');
const storedState = sessionStorage.getItem('oauth_state');

if (returnedState !== storedState) {
  throw new Error('State mismatch - possible CSRF attack');
}
```

### 3. HTTPSの使用

OAuth2.0では、必ずHTTPSを使用してください。

```javascript
// ❌ 間違い（HTTPは危険）
redirect_uri: 'http://localhost:3000/callback'

// ✅ 正しい（HTTPSを使用）
redirect_uri: 'https://myapp.com/callback'
```

## 🎯 OAuth2.0のメリット

1. **パスワードを共有しない**: セキュリティが向上
2. **限定的な権限**: 必要な権限だけを付与
3. **アクセス権限の管理**: いつでも取り消し可能
4. **標準化**: 多くのサービスで対応

## 🎯 OAuth2.0のデメリット

1. **実装が複雑**: フローが複雑で実装が難しい
2. **トークンの管理**: アクセストークンとリフレッシュトークンの管理が必要
3. **エラーハンドリング**: 様々なエラーケースに対応する必要がある

## 💡 実践例：Googleログインの完全な実装

### 環境変数の設定

```bash
# .env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
REDIRECT_URI=http://localhost:3000/callback
```

### サーバー側の実装

```javascript
// server.js
const express = require('express');
const session = require('express-session');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// ログインページ
app.get('/login', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  req.session.oauthState = state;

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
    client_id=${process.env.GOOGLE_CLIENT_ID}&
    redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&
    response_type=code&
    scope=email profile&
    access_type=offline&
    prompt=consent&
    state=${state}`;

  res.redirect(authUrl);
});

// コールバック
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  // stateの検証
  if (state !== req.session.oauthState) {
    return res.status(400).send('Invalid state parameter');
  }

  try {
    // アクセストークンを取得
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token } = tokenResponse.data;

    // ユーザー情報を取得
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    // セッションに保存
    req.session.user = userResponse.data;
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;

    res.redirect('/dashboard');
  } catch (error) {
    console.error('認証エラー:', error);
    res.status(400).send('認証に失敗しました');
  }
});

// ダッシュボード
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.send(`
    <h1>ダッシュボード</h1>
    <p>こんにちは、${req.session.user.name}さん</p>
    <p>メール: ${req.session.user.email}</p>
  `);
});

app.listen(3000, () => {
  console.log('サーバーが起動しました: http://localhost:3000');
});
```

## 🎯 まとめ

- **OAuth2.0**は、パスワードを共有せずにアクセス権限を付与する仕組み
- **4つの役割**: リソースオーナー、クライアント、認証サーバー、リソースサーバー
- **認証コードフロー**が最も一般的で安全
- **アクセストークン**でリソースにアクセス
- **リフレッシュトークン**で新しいアクセストークンを取得
- **セキュリティ**に注意（HTTPS、stateパラメータ、クライアントシークレットの保護）

## 📚 次のステップ

OAuth2.0の基本を理解したら、次は以下を学習しましょう：

- [認証と認可とは](15_認証と認可とは.md) - OAuth2.0が解決する認証・認可の問題
- [APIとは](./08_APIとは.md) - OAuth2.0で保護されたAPIへのアクセス
- [セキュリティの基礎知識](../02_プログラミング周辺知識/19_セキュリティの基礎知識.md) - より広範なセキュリティ知識

