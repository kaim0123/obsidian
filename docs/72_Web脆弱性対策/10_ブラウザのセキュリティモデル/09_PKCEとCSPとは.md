# PKCEとCSPとは

PKCEとCSPは、Webアプリケーションのセキュリティを強化するための重要な仕組みです。この章では、これらの概念について初心者向けに解説します。

## 📖 PKCEとは

**PKCE（Proof Key for Code Exchange）**は、OAuth2.0の認証コードフローをより安全にするための拡張仕様です。特に、モバイルアプリやシングルページアプリケーション（SPA）で使用されます。

### 日常生活での例え

PKCEは、「ワンタイムパスワード」のようなものです。

- **通常の認証**: 固定のパスワードを使う（盗まれるリスクがある）
- **PKCE**: 毎回新しいワンタイムパスワードを生成する（盗まれても無効）

### なぜPKCEが必要なのか

従来のOAuth2.0の認証コードフローでは、認証コードが盗まれるリスクがありました。PKCEは、このリスクを軽減します。

```
❌ PKCEなし（危険）:
1. アプリが認証コードを取得
2. 認証コードが盗まれる可能性がある
3. 攻撃者が認証コードを使ってアクセストークンを取得できる

✅ PKCEあり（安全）:
1. アプリがコード_verifierとcode_challengeを生成
2. 認証コードとcode_verifierの両方が必要
3. 認証コードだけではアクセストークンを取得できない
```

## 🔐 PKCEの仕組み

### 基本的な流れ

```
1. アプリがcode_verifier（ランダムな文字列）を生成
   ↓
2. code_verifierからcode_challengeを生成（SHA256でハッシュ化）
   ↓
3. 認証リクエストにcode_challengeを含める
   ↓
4. 認証サーバーが認証コードを発行
   ↓
5. アプリが認証コードとcode_verifierを送信
   ↓
6. 認証サーバーがcode_verifierからcode_challengeを再計算し、一致するか確認
   ↓
7. 一致すればアクセストークンを発行
```

### 実装例

#### ステップ1: code_verifierとcode_challengeを生成

```javascript
// クライアント側（ブラウザ）
import crypto from 'crypto';

// code_verifierを生成（43-128文字のランダムな文字列）
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

// code_challengeを生成（code_verifierをSHA256でハッシュ化）
function generateCodeChallenge(verifier) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

// 使用例
const codeVerifier = generateCodeVerifier();
const codeChallenge = generateCodeChallenge(codeVerifier);

// セッションストレージに保存（後で使用するため）
sessionStorage.setItem('code_verifier', codeVerifier);
```

#### ステップ2: 認証リクエストにcode_challengeを含める

```javascript
// 認証リクエスト
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=http://localhost:3000/callback&
  response_type=code&
  scope=email profile&
  code_challenge=${codeChallenge}&
  code_challenge_method=S256`;

window.location.href = authUrl;
```

#### ステップ3: アクセストークンを取得

```javascript
// コールバックで認証コードを受け取った後
async function getAccessToken(code) {
  const codeVerifier = sessionStorage.getItem('code_verifier');
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code: code,
      client_id: 'YOUR_CLIENT_ID',
      code_verifier: codeVerifier, // code_verifierを含める
      redirect_uri: 'http://localhost:3000/callback',
      grant_type: 'authorization_code',
    }),
  });

  const data = await response.json();
  return data.access_token;
}
```

## 🛡️ CSP（Content Security Policy）とは

**CSP（Content Security Policy）**は、XSS（Cross-Site Scripting）攻撃を防ぐためのセキュリティポリシーです。ブラウザに、どのリソースを読み込んで良いかを指示します。

### 日常生活での例え

CSPは、「セキュリティチェック」のようなものです。

- **セキュリティチェック**: 許可されたものだけを持ち込める
- **CSP**: 許可されたリソースだけを読み込める

### なぜCSPが必要なのか

XSS攻撃では、悪意のあるスクリプトが注入される可能性があります。CSPは、許可されていないスクリプトの実行を防ぎます。

```
❌ CSPなし（危険）:
<script>
  // 悪意のあるスクリプトが実行される可能性がある
  eval(userInput); // 危険！
</script>

✅ CSPあり（安全）:
Content-Security-Policy: script-src 'self'
// 'self'以外のスクリプトは実行されない
```

## 🔒 CSPの設定方法

### HTTPヘッダーで設定

```javascript
// Express.jsでの例
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  next();
});
```

### HTMLのmetaタグで設定

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline';">
```

## 📋 CSPディレクティブ

### 主なディレクティブ

| ディレクティブ | 説明 | 例 |
|--------------|------|-----|
| `default-src` | 他のディレクティブのデフォルト値 | `'self'` |
| `script-src` | JavaScriptの読み込み元 | `'self' 'unsafe-inline'` |
| `style-src` | CSSの読み込み元 | `'self' 'unsafe-inline'` |
| `img-src` | 画像の読み込み元 | `'self' data: https:` |
| `font-src` | フォントの読み込み元 | `'self' https://fonts.googleapis.com` |
| `connect-src` | fetch、XMLHttpRequestなどの接続先 | `'self' https://api.example.com` |
| `frame-src` | iframeの読み込み元 | `'self' https://youtube.com` |

### CSPの値

| 値 | 説明 |
|----|------|
| `'self'` | 同じオリジンのみ許可 |
| `'unsafe-inline'` | インラインスクリプト/スタイルを許可（非推奨） |
| `'unsafe-eval'` | eval()を許可（非推奨） |
| `'none'` | すべて禁止 |
| `https:` | HTTPSのすべてのドメインを許可 |
| `data:` | data: URLを許可 |

## 💻 CSPの実装例

### 基本的な設定

```javascript
// Express.jsでの例
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.example.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.example.com",
      "frame-src 'none'",
    ].join('; ')
  );
  next();
});
```

### Reactアプリでの設定

```javascript
// public/index.html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'self'; 
                 script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
                 style-src 'self' 'unsafe-inline'; 
                 img-src 'self' data: https:; 
                 connect-src 'self' https://api.example.com;">
  <title>My App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

### Next.jsでの設定

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "connect-src 'self' https://api.example.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
```

## ⚠️ CSPの注意点

### 1. 'unsafe-inline'の使用

```javascript
// ❌ 非推奨（XSS攻撃のリスクがある）
script-src 'self' 'unsafe-inline'

// ✅ 推奨（nonceやハッシュを使用）
script-src 'self' 'nonce-random-string'
```

### 2. nonceの使用

```javascript
// サーバー側でnonceを生成
const nonce = crypto.randomBytes(16).toString('base64');

// CSPヘッダーにnonceを含める
res.setHeader(
  'Content-Security-Policy',
  `script-src 'self' 'nonce-${nonce}'`
);

// HTMLでnonceを使用
res.send(`
  <script nonce="${nonce}">
    // このスクリプトは実行される
  </script>
`);
```

### 3. ハッシュの使用

```javascript
// インラインスクリプトのハッシュを計算
// <script>alert('Hello')</script> のSHA256ハッシュ
const hash = 'sha256-...';

// CSPにハッシュを含める
res.setHeader(
  'Content-Security-Policy',
  `script-src 'self' '${hash}'`
);
```

## 🔍 CSPのデバッグ

### report-uriの使用

CSP違反をレポートするエンドポイントを設定できます。

```javascript
res.setHeader(
  'Content-Security-Policy',
  "default-src 'self'; report-uri /api/csp-report"
);

// レポートを受け取るエンドポイント
app.post('/api/csp-report', (req, res) => {
  console.log('CSP違反:', req.body);
  res.status(204).send();
});
```

### Content-Security-Policy-Report-Only

実際にはブロックせず、レポートのみ送信します。

```javascript
res.setHeader(
  'Content-Security-Policy-Report-Only',
  "default-src 'self'; report-uri /api/csp-report"
);
```

## 💡 実践例：PKCEとCSPの組み合わせ

### PKCEを使ったOAuth2.0実装

```javascript
// クライアント側
import crypto from 'crypto';

// code_verifierとcode_challengeを生成
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return { codeVerifier, codeChallenge };
}

// ログインボタンのクリック
function handleLogin() {
  const { codeVerifier, codeChallenge } = generatePKCE();
  
  // code_verifierを保存
  sessionStorage.setItem('code_verifier', codeVerifier);
  
  // 認証リクエスト
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
    client_id=${CLIENT_ID}&
    redirect_uri=${REDIRECT_URI}&
    response_type=code&
    scope=email profile&
    code_challenge=${codeChallenge}&
    code_challenge_method=S256`;
  
  window.location.href = authUrl;
}

// コールバック処理
async function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const codeVerifier = sessionStorage.getItem('code_verifier');
  
  // アクセストークンを取得
  const response = await fetch('/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, code_verifier: codeVerifier }),
  });
  
  const { access_token } = await response.json();
  return access_token;
}
```

### CSPを設定したアプリケーション

```javascript
// server.js
const express = require('express');
const app = express();

// CSPミドルウェア
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' https://cdn.example.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.example.com",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  
  next();
});

// HTMLを返す
app.get('/', (req, res) => {
  const nonce = res.locals.nonce;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>My App</title>
    </head>
    <body>
      <div id="app"></div>
      <script nonce="${nonce}">
        // このスクリプトは実行される
        console.log('Hello, World!');
      </script>
    </body>
    </html>
  `);
});
```

## 🎯 まとめ

### PKCE

- **PKCE**は、OAuth2.0をより安全にする拡張仕様
- **code_verifier**と**code_challenge**を使用
- **モバイルアプリやSPA**で特に重要
- **認証コードの盗難リスク**を軽減

### CSP

- **CSP**は、XSS攻撃を防ぐセキュリティポリシー
- **許可されたリソースのみ**読み込める
- **HTTPヘッダーやmetaタグ**で設定
- **'unsafe-inline'は非推奨**（nonceやハッシュを使用）

## 📚 次のステップ

PKCEとCSPの基本を理解したら、次は以下を学習しましょう：

- [OAuth2.0とは](29_OAuth2.0とは.md) - PKCEが使われるOAuth2.0
- [認証と認可とは](15_認証と認可とは.md) - セキュリティの基礎
- [セキュリティの基礎知識](../02_プログラミング周辺知識/19_セキュリティの基礎知識.md) - より広範なセキュリティ知識

