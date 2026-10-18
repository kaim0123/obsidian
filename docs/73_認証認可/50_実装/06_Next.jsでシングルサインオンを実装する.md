# Next.jsでシングルサインオンを実装する

初心者向けに、Next.jsでシングルサインオン（SSO）を実装する方法をステップバイステップで解説します。

## 目次

- [1. シングルサインオン（SSO）とは](#1-シングルサインオンssoとは)
- [2. Next.jsでSSOを実装する方法](#2-nextjsでssoを実装する方法)
- [3. NextAuth.jsを使用した実装](#3-nextauthjsを使用した実装)
- [4. 実装例：Googleアカウントでログイン](#4-実装例googleアカウントでログイン)
- [5. 実装例：Auth0を使用したSSO](#5-実装例auth0を使用したsso)
- [6. 実装例：AWS Cognitoを使用したSSO](#6-実装例aws-cognitoを使用したsso)
- [7. セキュリティのベストプラクティス](#7-セキュリティのベストプラクティス)
- [8. よくある問題と対処法](#8-よくある問題と対処法)

---

## 1. シングルサインオン（SSO）とは

### SSOの基本概念

**シングルサインオン（SSO: Single Sign-On）**は、一度ログインすれば、関連する複数のアプリケーションやサービスに自動的にログインできる仕組みです。

### 簡単な例え

- **SSO = 共通の入場券**
  - 一度入場券を買えば、複数の施設に入れる
  - 各施設で個別にチケットを買う必要がない

### SSOのメリット

- ✅ **ユーザー体験が良い**: 複数のパスワードを覚える必要がない
- ✅ **管理が容易**: 管理者が一元的にユーザーを管理できる
- ✅ **セキュリティ向上**: パスワードの再利用が減る
- ✅ **生産性向上**: ログインの手間が減る

### SSOの仕組み

```
ユーザー → IDプロバイダでログイン
    ↓
認証成功 → SSOトークン発行
    ↓
アプリケーションA → SSOトークンを確認 → 自動ログイン ✅
アプリケーションB → SSOトークンを確認 → 自動ログイン ✅
アプリケーションC → SSOトークンを確認 → 自動ログイン ✅
```

---

## 2. Next.jsでSSOを実装する方法

### 主な実装方法

Next.jsでSSOを実装する方法は主に3つあります：

1. **NextAuth.js** - 最も人気のある認証ライブラリ
2. **Auth0 SDK** - Auth0を使用する場合
3. **AWS Amplify** - AWS Cognitoを使用する場合

### 推奨：NextAuth.js

**NextAuth.js**が最もおすすめです。

- ✅ 多くのプロバイダーをサポート（Google、GitHub、Auth0など）
- ✅ 実装が簡単
- ✅ TypeScript対応
- ✅ セキュリティが高い
- ✅ アクティブに開発されている

---

## 3. NextAuth.jsを使用した実装

### NextAuth.jsとは

**NextAuth.js**は、Next.jsアプリケーション向けの認証ライブラリです。OpenID Connect、OAuth 2.0、SAMLなどをサポートしています。

### 主な特徴

- 多くの認証プロバイダーをサポート
- セッション管理
- JWTトークンのサポート
- TypeScript対応
- セキュリティが高い

### インストール

```bash
npm install next-auth
```

または

```bash
yarn add next-auth
```

---

## 4. 実装例：Googleアカウントでログイン

### ステップ1: プロジェクトのセットアップ

```bash
# Next.jsプロジェクトを作成（まだの場合）
npx create-next-app@latest my-sso-app
cd my-sso-app

# NextAuth.jsをインストール
npm install next-auth
```

### ステップ2: Google OAuth認証情報の取得

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「OAuth 2.0 クライアント ID」を選択
5. アプリケーションの種類を「ウェブアプリケーション」に設定
6. 承認済みのリダイレクト URIに以下を追加：
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. クライアントIDとクライアントシークレットをコピー

### ステップ3: 環境変数の設定

`.env.local`ファイルを作成：

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

`NEXTAUTH_SECRET`を生成するには：

```bash
openssl rand -base64 32
```

### ステップ4: APIルートの作成

`pages/api/auth/[...nextauth].js`（または`app/api/auth/[...nextauth]/route.ts`）を作成：

#### App Router（Next.js 13+）の場合

`app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return session
    },
    async jwt({ token, account }) {
      return token
    },
  },
})

export { handler as GET, handler as POST }
```

#### Pages Routerの場合

`pages/api/auth/[...nextauth].js`:

```javascript
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return session
    },
    async jwt({ token, account }) {
      return token
    },
  },
})
```

### ステップ5: セッションプロバイダーの設定

#### App Routerの場合

`app/layout.tsx`:

```typescript
import { SessionProvider } from "next-auth/react"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

#### Pages Routerの場合

`pages/_app.tsx`:

```typescript
import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
```

### ステップ6: ログインページの作成

#### App Routerの場合

`app/login/page.tsx`:

```typescript
"use client"

import { signIn, signOut, useSession } from "next-auth/react"

export default function LoginPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>読み込み中...</div>
  }

  if (session) {
    return (
      <div>
        <p>ログイン中: {session.user?.email}</p>
        <button onClick={() => signOut()}>ログアウト</button>
      </div>
    )
  }

  return (
    <div>
      <p>ログインしていません</p>
      <button onClick={() => signIn("google")}>
        Googleでログイン
      </button>
    </div>
  )
}
```

#### Pages Routerの場合

`pages/login.tsx`:

```typescript
import { signIn, signOut, useSession } from "next-auth/react"

export default function LoginPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>読み込み中...</div>
  }

  if (session) {
    return (
      <div>
        <p>ログイン中: {session.user?.email}</p>
        <button onClick={() => signOut()}>ログアウト</button>
      </div>
    )
  }

  return (
    <div>
      <p>ログインしていません</p>
      <button onClick={() => signIn("google")}>
        Googleでログイン
      </button>
    </div>
  )
}
```

### ステップ7: 保護されたページの作成

#### App Routerの場合

`app/dashboard/page.tsx`:

```typescript
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return <div>読み込み中...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div>
      <h1>ダッシュボード</h1>
      <p>ようこそ、{session.user?.email}さん</p>
    </div>
  )
}
```

#### Pages Routerの場合

`pages/dashboard.tsx`:

```typescript
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return <div>読み込み中...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div>
      <h1>ダッシュボード</h1>
      <p>ようこそ、{session.user?.email}さん</p>
    </div>
  )
}
```

### 動作確認

1. 開発サーバーを起動：
   ```bash
   npm run dev
   ```

2. ブラウザで`http://localhost:3000/login`にアクセス

3. 「Googleでログイン」ボタンをクリック

4. Googleアカウントでログイン

5. ログイン成功後、セッション情報が表示される

---

## 5. 実装例：Auth0を使用したSSO

### ステップ1: Auth0アカウントの作成

1. [Auth0](https://auth0.com/)にアクセス
2. 無料アカウントを作成
3. 新しいアプリケーションを作成
4. アプリケーションタイプを「Regular Web Application」に設定
5. 許可されたコールバックURLに以下を追加：
   ```
   http://localhost:3000/api/auth/callback/auth0
   ```
6. 許可されたログアウトURLに以下を追加：
   ```
   http://localhost:3000
   ```
7. ドメイン、クライアントID、クライアントシークレットをコピー

### ステップ2: 環境変数の設定

`.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_ISSUER=https://your-domain.auth0.com
```

### ステップ3: NextAuth.jsの設定

`app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"

const handler = NextAuth({
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER,
    }),
  ],
})

export { handler as GET, handler as POST }
```

### ステップ4: ログインページの更新

`app/login/page.tsx`:

```typescript
"use client"

import { signIn, signOut, useSession } from "next-auth/react"

export default function LoginPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>読み込み中...</div>
  }

  if (session) {
    return (
      <div>
        <p>ログイン中: {session.user?.email}</p>
        <button onClick={() => signOut()}>ログアウト</button>
      </div>
    )
  }

  return (
    <div>
      <p>ログインしていません</p>
      <button onClick={() => signIn("auth0")}>
        Auth0でログイン
      </button>
    </div>
  )
}
```

---

## 6. 実装例：AWS Cognitoを使用したSSO

### ステップ1: AWS Cognitoのセットアップ

1. [AWS Console](https://console.aws.amazon.com/)にアクセス
2. Cognitoサービスに移動
3. 「ユーザープールを作成」をクリック
4. ユーザープール名を入力
5. 「認証プロバイダー」で「Cognitoユーザープール」を選択
6. アプリクライアントを作成
7. ドメイン名を設定
8. コールバックURLに以下を追加：
   ```
   http://localhost:3000/api/auth/callback/cognito
   ```

### ステップ2: 環境変数の設定

`.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

COGNITO_CLIENT_ID=your-cognito-client-id
COGNITO_CLIENT_SECRET=your-cognito-client-secret
COGNITO_ISSUER=https://cognito-idp.region.amazonaws.com/your-user-pool-id
```

### ステップ3: NextAuth.jsの設定

`app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth"
import CognitoProvider from "next-auth/providers/cognito"

const handler = NextAuth({
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER,
    }),
  ],
})

export { handler as GET, handler as POST }
```

---

## 7. セキュリティのベストプラクティス

### 1. 環境変数の保護

- `.env.local`を`.gitignore`に追加
- 本番環境では環境変数を適切に設定
- シークレットキーを定期的に更新

### 2. HTTPSの使用

- 本番環境では必ずHTTPSを使用
- 開発環境でも可能な限りHTTPSを使用

### 3. セッションの管理

- セッションの有効期限を適切に設定
- リフレッシュトークンを使用
- ログアウト時にセッションを適切に破棄

### 4. CSRF対策

- NextAuth.jsは自動的にCSRF対策を実装
- 追加の対策が必要な場合は、CSRFトークンを使用

### 5. レート制限

- ログイン試行回数を制限
- ブルートフォース攻撃を防ぐ

### 実装例：レート制限

```typescript
// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const rateLimitMap = new Map()

export function middleware(request: NextRequest) {
  const ip = request.ip || "unknown"
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15分
  const maxRequests = 5 // 最大5回

  const userRequests = rateLimitMap.get(ip) || []
  const recentRequests = userRequests.filter(
    (time: number) => now - time < windowMs
  )

  if (recentRequests.length >= maxRequests) {
    return new NextResponse("Too Many Requests", { status: 429 })
  }

  recentRequests.push(now)
  rateLimitMap.set(ip, recentRequests)

  return NextResponse.next()
}

export const config = {
  matcher: "/api/auth/:path*",
}
```

---

## 8. よくある問題と対処法

### 問題1: リダイレクトエラー

**エラー**: `redirect_uri_mismatch`

**原因**: コールバックURLが正しく設定されていない

**対処法**:
1. プロバイダーの設定でコールバックURLを確認
2. `NEXTAUTH_URL`環境変数が正しく設定されているか確認
3. 本番環境では本番URLを設定

### 問題2: セッションが保持されない

**原因**: クッキーの設定が正しくない

**対処法**:
1. `NEXTAUTH_SECRET`が設定されているか確認
2. クッキーの設定を確認：

```typescript
// [...nextauth].ts
export default NextAuth({
  // ...
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
})
```

### 問題3: CORSエラー

**原因**: クロスオリジンリクエストがブロックされている

**対処法**:
1. プロバイダーの設定で許可されたオリジンを確認
2. Next.jsの設定でCORSを適切に設定

### 問題4: トークンの有効期限切れ

**原因**: トークンの有効期限が短すぎる

**対処法**:
1. リフレッシュトークンを使用
2. トークンの有効期限を適切に設定

```typescript
// [...nextauth].ts
export default NextAuth({
  // ...
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
})
```

---

## まとめ

### 実装の流れ

1. **NextAuth.jsをインストール**
2. **認証プロバイダーを選択**（Google、Auth0、AWS Cognitoなど）
3. **環境変数を設定**
4. **APIルートを作成**
5. **セッションプロバイダーを設定**
6. **ログインページを作成**
7. **保護されたページを作成**

### 推奨事項

- **NextAuth.js**を使用（最も簡単で柔軟）
- **OpenID Connect**プロトコルを使用（モダンで安全）
- **環境変数**を適切に管理
- **HTTPS**を本番環境で使用
- **セキュリティのベストプラクティス**を遵守

### 次のステップ

- 複数のプロバイダーに対応
- カスタム認証フローの実装
- ユーザー情報の管理
- ロールベースのアクセス制御（RBAC）

---

## 参考資料

- [NextAuth.js公式ドキュメント](https://next-auth.js.org/)
- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Auth0公式ドキュメント](https://auth0.com/docs)
- [AWS Cognito公式ドキュメント](https://docs.aws.amazon.com/cognito/)

