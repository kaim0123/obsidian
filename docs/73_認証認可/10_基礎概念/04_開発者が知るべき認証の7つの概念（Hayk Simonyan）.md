---
title: "7 Authentication Concepts Every Developer Should Know"
source: "https://www.youtube.com/watch?v=iX8g4LqF8p8&t=507s"
author:
  - "[[Hayk Simonyan]]"
published: 2026-02-19
created: 2026-05-17
description: "Become a senior software engineer with a job guarantee: https://go.hayksimonyan.com/156-authLearn what authentication is, the basic methods like Basic Auth, ..."
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=iX8g4LqF8p8)

## Transcript

## 日本語要約

この動画では、システムがリソースへのアクセスを許可する**前**に行う「本人確認」である**認証（Authentication）**を中心に、開発者が混同しやすい概念を整理しながら主要な方式を解説している。認証は「誰か」を特定する段階であり、「何ができるか」を決める**認可（Authorization）**とは別物である。

### 開発者が混同しやすい点

- **認証方式**と**認可フレームワーク**を同一視しないこと。
- **JWT**は認証方式ではなく、**トークンの形式（フォーマット）**である。
- **Bearer**は「トークンを持っている者にアクセスを与える」という**パターン**であり、JWTそのものではない。
- **OAuth 2**は認証方式ではなく、**認可フレームワーク**である。
- **SSO（シングルサインオン）**は認証方式ではなく、**一度ログインすれば複数サービスにアクセスできる UX パターン**である。

Postman などのツールが Basic / Digest / API Key / Bearer などを並べて「認証タイプ」と表示するため、方式・フレームワーク・UX がさらに混ざりやすい、という指摘もある。

---

### 認証とは何か

認証が答える問いは一つ：**「リクエストしてきたのは誰か？」**

典型的な流れは次のとおり。

1. ユーザーまたは別サービスが API ゲートウェイなどにアクセスする。
2. ログイン（資格情報の提示）で身元を確認する。
3. 有効ならシステム内の API・サービス・データへのアクセスを許可する。
4. 無効なら **401 Unauthorized** を返す。

認可（アクセス可能なリソースや操作の範囲）は、この後の別ステップとして扱う。

---

### 1. Basic 認証

最も単純な方式。

1. 資格情報なしでリソース（例：`GET /api/users`）にアクセスすると **401**。
2. 次のリクエストで `Authorization` ヘッダに **Base64 エンコードした `username:password`** を付与する。
3. サーバーで検証し、成功なら **200** とデータ、失敗なら再び **401**。

**弱点**

- Base64 は暗号化ではなく**容易に復号**できる。
- **HTTPS 必須**でも、毎リクエストで資格情報に近い情報を送るため、本番の外部向け API ではほぼ使われない（内部ツール程度）。

---

### 2. Digest 認証

Basic と似た流れだが、パスワードを平文で送らず **MD5 ハッシュ**を使う点でやや改善される。それでも MD5 は古く、現代の選択肢（セッション・JWT など）に比べると**レガシー**とみなされることが多い。

---

### 3. API キー認証

クライアントごとに**一意のキー**を発行し、リクエストごとに `Authorization` または `X-API-Key` ヘッダで送る。

- サーバー側ではキーの**ハッシュ**と**スコープ（権限範囲）**を DB 等に保存し、リクエスト時にルックアップして検証する。
- ダッシュボードでキーを生成して API を叩く体験は、多くの SaaS でこの方式。

**挙動**

- キーが有効 → 成功レスポンス。
- キーが無効 → **401**。
- ヘッダ自体がない → **400 Bad Request**（キー必須の設計の場合）。

**弱点**

- キーが漏洩すると、有効期限を自前で設けない限り**誰でもなりすまし可能**。
- キーは**ランダム文字列**であり、JWT のようにペイロードに情報は埋め込まれない。**所有者や権限は DB 参照が必要**。

JWT と「毎回ヘッダに秘密を載せる」点は似て見えるが、API キーは**自己完結しない**のが大きな違い。

---

### 4. セッション認証（従来の Web）

ユーザーがログインすると、サーバー側の**セッションストレージ**にセッションを作成し、クライアントには **セッション ID を Cookie** で返す。以降のリクエストでは Cookie のセッション ID でストレージを参照し、有効ならユーザーデータを取得して応答する。

**セッションストアの例**

| 方式 | 特徴 |
|------|------|
| メモリ | 単純だが再起動で消失 |
| **Redis** | 高速・TTL（有効期限）・本番でよく使われる |
| SQL DB | 永続化可能 |
| ファイルシステム | スケールしにくく稀 |

**特徴**

- **ステートフル**：サーバーがセッションを「覚えている」必要がある。
- 従来の Web アプリには向くが、分散 API やマイクロサービスではスケールが難しくなりがち。

---

### 5. Bearer トークンと JWT

**Bearer**＝「このトークンを持っている主体にアクセスを与える」という**運用パターン**。実体として最も一般的なのが **JWT（JSON Web Token）**。

JWT は**署名付き JSON**で、例えば次を含められる。

- ユーザー ID、メール
- 有効期限（`exp`）
- ロール・権限などのクレーム

**ログイン後の流れ**

1. 初回のみ資格情報を検証。
2. 有効なら JWT を発行してクライアントに返す。
3. 以降は `Authorization: Bearer <token>` で、サーバーは**署名をローカル検証**（多くの場合 DB 不要）。
4. 有効 → データ返却、無効 → **401**。

**セッションとの比較**

| | セッション | JWT（典型的） |
|--|-----------|----------------|
| 状態 | サーバーがセッションを保持 | **ステートレス**（自己完結） |
| 検証 | ストア参照 | 署名検証 |
| スケール | ストア共有が課題 | 分散しやすい |

JWT 以前の「不透明トークン」は、毎回 DB／キャッシュ参照が必要でステートフルだった。JWT はクレームをトークン内に載せられるため、**DB 負荷軽減**と**検証の簡素化**に寄与する。

---

### 6. アクセストークンとリフレッシュトークン

現代のシステムでは多くの場合、2 種類のトークンを併用する。

| 種類 | 寿命 | 用途 |
|------|------|------|
| **アクセストークン** | 短い（15分〜1時間程度） | API 呼び出し |
| **リフレッシュトークン** | 長い（数日〜数週間） | 新しいアクセストークンの取得 |

ログイン時に両方を発行。アクセストークン期限切れで **401** になったら、リフレッシュトークンで認証サーバーに再発行を依頼し、新しいアクセストークンで API を再開する。

**セキュリティ上の注意**

- リフレッシュトークンは **`localStorage` に置かない**（XSS で盗まれやすい）。
- **`HttpOnly` Cookie** など、JavaScript から読めない保存が推奨される。

---

### 7. OAuth 2.0

**認可フレームワーク**。「このアプリは、ユーザーに代わって**何にアクセスできるか**」を答える。単体では「ユーザーが誰か」をアプリに伝えない。

**例：外部アプリが Google Drive のファイルを読む**

1. ユーザーを Google の**同意画面**へリダイレクト。
2. 許可すると**認可コード**がアプリに返る。
3. アプリがコードを**アクセストークン**と交換。
4. そのトークンで Drive API を呼び出す。

ここで得るアクセストークンは「Drive にアクセスする**権限の証明**」であり、**本人確認（認証）そのものではない**、という区別が重要。

---

### 8. OpenID Connect（OIDC）

OAuth 2 の上に**認証レイヤー**を載せたもの。「Google でサインイン」などで使われる。

**流れ（概要）**

1. 認可エンドポイントへリダイレクト → ログイン・同意。
2. 認可コードをアプリが受け取る。
3. コードをトークンと交換 → **アクセストークン**（OAuth 2 の認可用）＋ **ID トークン**（JWT、**本人情報**：メール・ユーザー ID 等）。
4. アプリは ID トークンの署名を検証し身元を確定し、自前のセッションやアクセストークンを発行できる。

現代の「Sign in with Google / GitHub / Microsoft」は、多くがこの系統。

---

### 9. シングルサインオン（SSO）

**UX パターン**：一度 IdP（アイデンティティプロバイダ）にログインすれば、Gmail・Drive・YouTube など**複数サービスに再ログイン不要**でアクセスできる。

仕組みのイメージ：

1. Google などに一度ログイン → **グローバルセッション**が IdP 側に保存。
2. クライアントに **SSO 用 Cookie** が付与される。
3. 別サービス（例：Drive）初回アクセス時もセッション検証のみで通過。
4. 以降のサービスも同様にセッション検証で済む。

SSO そのものは方式ではなく、下層で **SAML** や **OIDC** などの**アイデンティティプロトコル**を使う。

---

### 10. アイデンティティプロトコル（SAML / OIDC）

| プロトコル | 形式・用途 | 備考 |
|-----------|------------|------|
| **SAML** | XML ベース。エンタープライズ・レガシー（Salesforce、社内ダッシュボード等）で依然普及 | リダイレクトログイン後、**SAML アサーション（XML）**で身元確認 |
| **OIDC** | JWT 形式の **ID トークン**。Google などモダンなサービスで主流 | SAML より新しく、JSON/JWT エコシステムと相性が良い |

どちらも SSO と組み合わせて使われ、いずれもセキュアで現役の選択肢。

---

### 認証のあと：認可

認証で「誰か」が分かったら、次は**認可**で「何ができるか」（ロール・ポリシー・スコープ）を決める。動画では認可の詳細は別動画へ誘導している。

---

### 全体の整理（一覧）

| 概念 | 分類 | 一言 |
|------|------|------|
| Basic / Digest | 認証方式（レガシー） | ヘッダで資格情報／ハッシュを毎回送る |
| API キー | 認証方式 | DB ルックアップが必要な不透明キー |
| セッション + Cookie | 認証方式 | ステートフル、古典的 Web |
| Bearer | パターン | トークン保持者にアクセス |
| JWT | トークン形式 | 署名付き・自己完結可能 |
| Access / Refresh | トークン運用 | 短命 API 用 + 長命更新用 |
| OAuth 2 | 認可フレームワーク | 第三者アプリのリソースアクセス許可 |
| OIDC | 認証（+ OAuth 2） | ID トークンで本人確認 |
| SSO | UX パターン | 一度のログインで複数サービス |
| SAML / OIDC | アイデンティティプロトコル | SSO の下層技術 |

---

### Intro

**0:00** · Before a system can authorize or restrict anything, it first needs to know the identity of the requester, whether it's a user accessing our service through a browser or through mobile app, or it's a third-party service trying to access our system.

**0:17** · That's what authentication does. It verifies that the user or service trying to access our system is who they claim to be. But, here is where most software engineers confuse or mix up concepts.

**0:29** · They mix up authentication methods with authorization frameworks. They treat JWT as an authentication method, when in reality it's just a token format. They also confuse the bearer authentication with JWT. They sometimes call OAuth2 an authentication method, when in reality it's actually an authorization framework. And they mix up single sign-on with authentication methods, when it's really a user experience pattern.

**0:57** · In this video, we're going to fix all of that by covering, first of all, what authentication is, and then all the major types of authentication, starting from basic to digest authentication to API keys, sessions and cookies, bearer authentication and JWT tokens. What are access and refresh tokens? Also, we'll cover OAuth2, OpenID Connect, also single sign-on and identity protocols, and understand what each one actually is, and where this all fits.

**1:29** · Let's first understand what is authentication, and then we'll get into the different authentication methods.

### What is Authentication?

**1:35** · So, authentication really answers one simple question, which is who the user is, whoever is trying to access our system. Let's say you have your system, like your API gateway, the layer of APIs, then your service layer, and also the data storage. Before anyone can make requests to your API gateway and start accessing services and data, they first need to be authenticated. That is where they send a login request. This comes either from a user or another service.

**2:07** · This is where we confirm their identity if it's valid and grant access to our system, to our API gateway and all the other services. Or if the identity is not confirmed, then we reject it with a 401 unauthorized response. This is the first step before they will get into the authorization, which is what they can access and what they can do once they can sign in to your system, but that's a separate discussion in itself.

**2:33** · So, in this one, we're primarily focusing on the authentication and different authentication methods that we can use to verify the user's identity. Now, let's see the different authentication methods that we have to verify the identity of the requester and let's start with the basic authentication methods. These are the basic off, digest authentication, API keys, and session-based authentication.

### Basic Authentication

**3:01** · Let's start with the very first one on the list, which is the basic authentication flow. This is the simplest form of authentication. Let's say you're making a request to the server to access some resource like API/users to retrieve the user data. You will first receive an unauthorized response because you didn't provide the credentials. So, we prompt the user or the service to provide credentials before accessing any resource in the server.

**3:28** · So, in the upcoming request to the same resource, they also provide the authorization header, and this header contains the base 64-encoded version of the username and password for this user.

**3:43** · This is where we verify it on the server side. If the credentials are valid, then we respond with 200 OK status with the user data returned in the body or we unauthorized it again marking this as credentials invalid. The problem with this method is that base 64 is easily reversible.

**4:03** · So this is an insecure method unless it is wrapped with HTTPS protocol and even then it's rarely used nowadays in production outside of the internal tools because you're sending the credentials with every request and you're sending the base 64 encoded version which is not that secure. That's why we also have a digest authentication which is slightly better and it uses the MD5 hashing.

### Digest Authentication

**4:31** · So this method works similar to the authentication with basic version. So you are let's say trying to access the same resource like the users.

**4:42** · It will first respond with 401 unauthorized prompting you to include the credentials and then you'll make the same request but with the hashed response and that will also contain the MD5 hash version instead of the plain password and username and same process as the previous one. If the credentials are invalid, you will receive 401 unauthorized. Otherwise, you will receive the successful response with the user data in the request body.

**5:12** · This is slightly better than the basic off as it uses the MD5 hashing but it's still outdated and rarely used today because we have better options as you will see soon. And if you're wondering how do we set these options in the authorization? For instance, if you're making the request from Postman or if you're doing this from the code then you'll include it as the header in the request.

**5:35** · This is where you can set the authentication type and you will notice the things that we're discussing here like the basic authentication which was the first version or digest authentication which is the second version, and you will see the other methods available here, also the API key option.

**5:52** · And Postman calls all of these authentication types to just keep it simple on the interface, but that's also one of the reasons why developers get confused and they think that all of these are authentication types when some of them are authentication methods, some of them are authorization frameworks.

**6:11** · Next, we have API key authentication.

### API Keys

**6:13** · This is where you generate a unique key for each client, then then they send it with each request to access the resources. So, for the same request as we discussed, indeed comes to your API server first, and it will include either authorization header or X-API-Key, and that will include the API key that you generated for the user. These API keys are typically stored in a database with key hash and also the scopes for the API key.

**6:44** · And for instance, if you ever tried to access APIs by generating a key on the dashboard, and then it gives you the key back, which you can attach to the requests, that is where you already used the API key of that service to access the data. So, if you included that key in the request, then the server will first do an API key lookup in the permissions or users table.

**7:08** · And if it's able to verify that the API key is valid, then we will authorize the request and send the successful response with the data in the response body.

**7:20** · Otherwise, the user will get a 401 unauthorized response.

**7:24** · And if the key is missing overall, like the authorization header or X-API-Key, then we just return a 400 bad request because the API key is required to access this type of system.

**7:37** · One issue with API keys is that if the key ever leaks, then anyone can use it and start accessing the resources on your behalf with your API key, and there is no built-in expiration unless you implement it yourself. Another thing is that this might seem similar to JSON Web Tokens, but API keys are just random strings with no embedded information, while in JWT we can store also information, as you will see shortly.

**8:07** · So, the server here has no way to know who owns the key or what permissions they have without looking it up in the database.

### Session-Based Authentication

**8:16** · Next, we have the traditional web approach, which is the session-based authentication. This is where a user logs in with their credentials, and then we create a session in some sort of session storage. This session storage can be as simple as just in memory, like just a variable, but the problem here is that we will lose it once the server restarts or crashes.

**8:37** · The other option is we can use tools like Redis, which is one of the most common ones in production, because it's fast and it supports expiration for the sessions, or we can use a dedicated database here, like SQL type of database. Another option, which is very rare, is to use the file system of the server that you're using. The problem with this one is that it's not scalable, and overall Redis is usually the go-to for production because it's fast and has built-in key expiration.

**9:09** · So, with the first request, we are fetching the session ID, and then we set the session cookie on the client side. Then, for any other upcoming requests that contain this cookie, we look up the session in the session storage here, and then if the session is valid, we will get back the user data, and we will send it with authorized response. Otherwise, if it's not found, if we can't find the session, then this user is not authenticated, so we send them an unauthorized response.

**9:40** · One challenge with session-based authentications is that it is stateful, which means that the server must remember the sessions. We need to have some sort of session storage here. And it works great for traditional web apps, but cannot scale as easily for APIs or distributed systems. Now, let's look at token-based authentication. We'll cover better authentication, JWT tokens, access and refresh tokens, and how this compares to the session-based authentication. Instead of sessions, modern applications usually use tokens.

### Bearer Tokens and JWTs

**10:14** · So, the client sends a token with each requests. For example, we have a login with credentials, where a user will include their credentials in the authorization header, which will include the type of authentication, which is better, and also the token, which we will validate on the server side. One thing developers confuse here is the bearer token and JSON web tokens. Bearer token just means whoever has this token gets access, so it's a pattern, but not a specific method.

**10:43** · And the most common type of bearer token is JWT, JSON web token.

**10:50** · It's basically a signed JSON object that contains the user ID or email for us to validate the user, also expiration time, and other claims as we need to store them, like roles, permissions, and so on. So, what we do on the authentication server is we validate the credentials once we receive that authorization header. And it is stateless, meaning that we don't need a database here to look up, and that is why it's also scalable compared to the session-based authentication.

**11:21** · Before the JWT, let's say revolution, a token was just a string with no information. And that token was sent, and then this was looked up in some sort of database, and only then we could verify that the user has access. The downside of that was that, of course, it's still stateful because we need the database access or cache, which is required every time the token is used.

**11:48** · With JSON Web Tokens, now we can encode and verify via signing their own claims, and this is what now allows us to issue a short-lived JWT token as they are stateless, meaning they are self-contained, and they don't depend on anybody else. They do not need to hit the database, and this reduces the databases' load, and it also simplifies the authentication process for the server. So, the first time we will receive the credentials and validate the user.

**12:19** · And if it is valid, we will generate the JSON Web Token and send it to the client. From this point forward, the client can make requests and include this bearer token, which is this authorization header that contains the bearer authentication with the token.

**12:37** · And that token is most cases it is a JSON Web Token. We verify that signature locally without needing to hit the database. And if the token is valid, we return the requested data. Otherwise, we return an unauthorized response.

### Access and Refresh Tokens

**12:54** · Modern systems also use two types of tokens. One of them is the access token, and the other one is the refresh tokens.

**13:03** · The reason we need two tokens here is that access tokens are short-lived, and they are used for API calls to the server, while the refresh tokens are long-lived, and they are used to get new access tokens, basically to renew the access token. Whenever user sends a login request and signs in, they get both of these tokens. We generate an access token that's valid for 15 minutes to 1 hour and we generate a refresh token that can last for days or even weeks.

**13:35** · Client now will use the access token to access the API and make the requests and it also stores the refresh tokens. One important note here is that we never store it in local storage, but we store it in HTTP only cookies. This prevents us from XSS attacks on the client side.

**13:56** · And after this user will stay logged in without re-entering credentials. If their access token expires, they will get an unauthorized response and this is where we will use that refresh token which we stored to generate a new access token on the off server side. We can make a request with that new token and this will successfully return us the data since we renewed the access token.

**14:21** · Next, let's get into OAuth 2 and OpenID Connect which are some of the misunderstood concepts and let's clarify whether these are authentication methods or authorization frameworks and how they work. OAuth 2 is one of the concepts that is often misunderstood. It's an authorization framework and not an authentication. So, it answers what can this app access on behalf of the user.

### OAuth2

**14:49** · For instance, if you want to grant an application access to your Google Drive to be able to read your files from there, you would typically connect your Google Drive for this external application and you're giving the app permission to access your data.

**15:04** · The way it works is it first will redirect you to consent screen from the Google OAuth authentication and it will show you the permission request and if you allow access for this application to be able to read the drive files on your behalf, then it will return the authorization code to this external application, or it can also be your application.

**15:28** · And the way it works after that is that you exchange the code for token, and you return the access token from Google OAuth to be able to read the data. That is the confusing part, because you're getting back an access token for the Google Drive API, and you might think that this is an authentication method, but the access token just proves that the app can access your resources. But it doesn't tell the app who you are.

**15:57** · It just proves that the app is allowed to access certain resources from your Google Drive. So, after this point, the application will be able to request files with that token and return the user files from Google Drive API.

### OpenID Connect

**16:14** · Next, we have OpenID Connect, which adds authentication on top of OAuth 2. So, when you click on sign in to Google, let's say, via your app, it will redirect you to the authorization endpoint. And this will show you the login screen where you grant access to sign in to Google through your application. If you enter your credentials and consent, then the provider will return the authorization code.

**16:41** · And after this step, your application will exchange the code for tokens and return the access token in combination with the ID token. From here, the access token is for OAuth 2 authorization, but the ID token is a JSON Web Token that contains your identity, which includes your email or username user ID.

**17:02** · Which means that after this point, your application is able to verify the signature and extract the user's identity to send the ID token for verification to your back end. And by having this ID token, your application can now create its own session and grant the access token for that user.

**17:25** · This is a modern solution. It's secure and also scales well. And that's also why most applications nowadays use that type of authentication like sign in with Google, GitHub, Microsoft, and so on.

**17:38** · And lastly, let's cover single sign on and identity protocols.

### Single Sign-On (SSO)

**17:43** · Single sign on is a user experience, not an authentication method, which means that you're able to log in once, but access multiple services. For example, when you want to log in to Google or Okta, let's say you want to get access to your Gmail, to your Google Drive, to YouTube, to Google Calendar, you can do this by logging in once to the identity provider. Let's say it can be Google in this case if you want to access these services.

**18:13** · And single sign on uses identity protocols underneath to validate these sessions. So, once you sign in with the identity provider, let's say it's Google in this case, your global session is stored in a session storage. And then you get back a single sign on cookie to your client to be able to access other resources. So, let's say you want to access Gmail for the first time, then once you log in, you verify also the session, and now you're able to access Gmail.

**18:44** · And for the next requests, if you need to access Google Drive for the next one, you don't need to log in again because you have these cookie and the session stored in the session storage.

**18:55** · So, we just verify your session, and if it's valid, then you get access to Google Drive as well. And similarly to YouTube, to Google Calendar, and other services.

### Identity Protocols (SAML, OIDC)

**19:05** · As I mentioned, single sign on uses identity protocols underneath. And these protocols are SAML, which is security assertion markup language, or OpenID Connect.

**19:18** · Both of these are identity protocols which are used in combination with single sign-on.

**19:24** · In case of SAML, to be able to access the app, you're redirected to login, and this is where we use SAML for authentication.

**19:32** · This is a common solution in enterprise and legacy systems like Salesforce, corporate dashboards, and so on. It is an XML-based protocol, so once you want to sign in, you are redirected to login, and then you get back the SAML assertion in XML format. And after that, your identity is confirmed for the user, and now you're able to access the third-party application.

**20:00** · SAML is still widely used, but it's an older version compared to OpenID Connect. So, the next option is the OpenID Connect as an identity protocol.

**20:10** · Let's say you want to access an app, and in this case it's Gmail.

**20:14** · You will be redirected to login to provide your credentials. And once you provide your credentials, the user is authenticated, and now you get back the ID token in JSON Web Token format. And this is what you will use for confirming your identity with Gmail.

**20:32** · This is, for instance, what Google uses under the hood, and it's a more modern approach compared to SAML, but both of them are still very secure and relevant.

**20:43** · These are the most common types of authentication, and that is just the first step for accessing our system.

### Authorization

**20:50** · After you know who the user is with authentication, you need to also know what they can do and what permissions they have. That is the part of authorization, and I recommend you check out this video next to learn about the different authorization frameworks and how it works.