# 安全なWebアプリケーションの作り方（第3章）

第2章では、同一オリジンポリシーとクロスドメインアクセスの課題を学びました。第3章では、異なるオリジン間でデータを安全にやり取りする **CORS（Cross-Origin Resource Sharing）** について解説します。

### 第2章からのおさらい

フロントエンドとAPIが別ドメインの構成では、同一オリジンポリシーによりレスポンスの読み取りがブロックされます。

```
フロントエンド: https://myapp.com
バックエンドAPI: https://api.myapp.com   ← ドメインが違う = クロスドメイン

https://myapp.com の JavaScript
  → fetch('https://api.myapp.com/users')
  → 同一オリジンポリシーにより、レスポンスの読み取りがブロックされる
```

**CORS** は、この制限をサーバーの許可に基づいて安全に緩和する仕組みです。

---

## 🔀 CORS

**CORS（Cross-Origin Resource Sharing / クロスオリジンリソース共有）** は、同一オリジンポリシーの制限を **サーバーの許可に基づいて安全に緩和する** 仕組みです。

### 日常生活での例え

- **同一オリジンポリシー**: 他校の教室には勝手に入れない
- **CORS**: 校舎間の「許可証」を事前に交換しておけば、指定された相手だけ入れる

### 重要な前提

| ポイント | 説明 |
|---------|------|
| **ブラウザの機能** | CORSはブラウザが実施する。サーバー間通信には関係ない |
| **curl / Postman では起きない** | ツールからのリクエストはCORSチェックされない |
| **サーバー側の設定が必要** | 許可するオリジンをレスポンスヘッダで返す |

### CORSの基本フロー

```
1. ブラウザ: https://myapp.com のページから fetch('https://api.example.com/data')
2. ブラウザ: Origin: https://myapp.com ヘッダを付けてリクエスト送信
3. サーバー: Access-Control-Allow-Origin: https://myapp.com をレスポンスに付ける
4. ブラウザ: オリジンが一致 → JavaScript にレスポンスを渡す ✅
```

許可がなければ:

```
3. サーバー: Access-Control-Allow-Origin ヘッダなし
4. ブラウザ: CORSエラー → JavaScript からレスポンスを読めない ❌
```

### CORSエラーの例

```
Access to fetch at 'https://api.example.com/users' from origin 'https://myapp.com'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
on the requested resource.
```

**注意:** サーバーは正常にレスポンスを返していることが多い。ブラウザが **JavaScript への受け渡しをブロック** している。

---

## ✅ Access-Control-Allow-Origin

**Access-Control-Allow-Origin** は、CORSで **最も重要なレスポンスヘッダ** です。どのオリジンからのアクセスを許可するかを指定します。

### 設定例

```
# 特定のオリジンのみ許可（本番環境で推奨）
Access-Control-Allow-Origin: https://myapp.com

# 全オリジンを許可（開発環境のみ。本番では非推奨）
Access-Control-Allow-Origin: *
```

### ブラウザの検証

```
リクエストの Origin:     https://myapp.com
レスポンスの Allow-Origin: https://myapp.com
→ 一致 ✅ → レスポンスを JavaScript に渡す

リクエストの Origin:     https://evil.com
レスポンスの Allow-Origin: https://myapp.com
→ 不一致 ❌ → CORSエラー
```

### Express.js での設定例

```javascript
// 特定オリジンのみ許可
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://myapp.com');
  next();
});

// cors パッケージを使う（推奨）
const cors = require('cors');
app.use(cors({ origin: 'https://myapp.com' }));
```

### セキュリティ上の注意

| 設定 | リスク |
|------|--------|
| `*`（ワイルドカード） | どのサイトからでもAPIを呼べる |
| オリジン検証なし | 悪意あるサイトも許可してしまう |
| **推奨** | 許可するオリジンを明示的にリストアップ |

---

## 📨 シンプルなリクエスト

CORSリクエストには **シンプルリクエスト** と **プリフライトリクエストが必要なリクエスト** の2種類があります。

**シンプルリクエスト** は、条件を満たす場合に **事前確認（プリフライト）なし** でそのまま送信できるリクエストです。

### シンプルリクエストの条件（すべて満たす必要がある）

1. **メソッド** が GET、HEAD、POST のいずれか
2. **リクエストヘッダ** が許可リスト内のみ
3. **Content-Type**（POSTの場合）が許可された値のみ

---

## 📬 GET・HEAD・POST

シンプルリクエストで使える HTTP メソッドは次の3つだけです。

| メソッド | 用途 | シンプルリクエスト |
|---------|------|------------------|
| **GET** | データの取得 | ✅ |
| **HEAD** | ヘッダのみ取得（ボディなし） | ✅ |
| **POST** | データの送信 | ✅ |
| PUT | データの更新 | ❌ → プリフライト必要 |
| DELETE | データの削除 | ❌ → プリフライト必要 |
| PATCH | 部分更新 | ❌ → プリフライト必要 |

```javascript
// シンプルリクエスト（GET）
fetch('https://api.example.com/users');

// シンプルリクエスト（POST + 許可された Content-Type）
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'name=yamada&email=yamada@example.com'
});

// プリフライトが必要（PUT）
fetch('https://api.example.com/users/1', { method: 'PUT', ... });
```

---

## 📋 リクエストヘッダの制限

シンプルリクエストでは、**ブラウザが自動的に付けるヘッダ以外** に、次の4種類だけを追加できます。

| 許可されるヘッダ | 説明 |
|----------------|------|
| `Accept` | 受け取れるデータ形式 |
| `Accept-Language` | 希望する言語 |
| `Content-Language` | ボディの言語 |
| `Content-Type` | ボディのデータ形式 |

### 許可されないヘッダの例

```
Authorization: Bearer token123     ← カスタム/認証ヘッダ → プリフライト必要
X-Custom-Header: value             ← カスタムヘッダ → プリフライト必要
X-Requested-With: XMLHttpRequest   ← プリフライト必要
```

```javascript
// ❌ シンプルリクエストではない（Authorization ヘッダあり）
fetch('https://api.example.com/users', {
  headers: { 'Authorization': 'Bearer token123' }
});
// → ブラウザが先に OPTIONS リクエスト（プリフライト）を送る
```

---

## 📄 Content-Type ヘッダの制限

POST リクエストで `Content-Type` を指定する場合、シンプルリクエストとして認められるのは **次の3つの値だけ** です。

| Content-Type | 用途 |
|-------------|------|
| `application/x-www-form-urlencoded` | HTMLフォームと同じ形式 |
| `multipart/form-data` | ファイルアップロード |
| `text/plain` | プレーンテキスト |

### シンプルリクエストにならない Content-Type

```
Content-Type: application/json   ← 最もよく使うが、プリフライト必要
Content-Type: application/xml
Content-Type: text/html
```

```javascript
// ❌ シンプルリクエストではない
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'yamada' })
});
// → プリフライトリクエストが先に送られる
```

現代のAPIは JSON が主流のため、多くのリクエストで **プリフライトが発生する** のが普通です。

---

## ✈️ プリフライトリクエスト

**プリフライトリクエスト（Preflight Request）** とは、本番のリクエストの前にブラウザが送る **確認用の OPTIONS リクエスト** です。

「飛行機が離陸する前に安全確認をする」イメージで **Preflight（事前飛行チェック）** と呼ばれます。

### プリフライトが必要なケース

- PUT、DELETE、PATCH などのメソッド
- `Authorization` などのカスタムヘッダ
- `Content-Type: application/json`

### 処理フロー

```
1. ブラウザ → サーバー: OPTIONS（プリフライト）
   Origin: https://myapp.com
   Access-Control-Request-Method: PUT
   Access-Control-Request-Headers: Content-Type, Authorization

2. サーバー → ブラウザ: 204 No Content
   Access-Control-Allow-Origin: https://myapp.com
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE
   Access-Control-Allow-Headers: Content-Type, Authorization

3. ブラウザ: 許可を確認 ✅

4. ブラウザ → サーバー: PUT（本番リクエスト）
   Origin: https://myapp.com
   Content-Type: application/json
   Authorization: Bearer token123

5. サーバー → ブラウザ: 200 OK
   Access-Control-Allow-Origin: https://myapp.com
```

### プリフライトリクエストの例

```
OPTIONS /api/users/1 HTTP/1.1
Host: api.example.com
Origin: https://myapp.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Content-Type, Authorization
```

### プリフライトレスポンスの例

```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
```

`Access-Control-Max-Age: 3600` を設定すると、3600秒（1時間）は同じ種類のリクエストでプリフライトを省略できます。

---

## 🔧 メソッドに対する許可

プリフライトのレスポンスでは、**Access-Control-Allow-Methods** ヘッダで許可する HTTP メソッドを指定します。

```
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH
```

### ブラウザの検証

```
プリフライトで要求: Access-Control-Request-Method: PUT
サーバーの許可:     Access-Control-Allow-Methods: GET, POST, PUT, DELETE
→ PUT が含まれる ✅ → 本番リクエストを送信
```

```
プリフライトで要求: Access-Control-Request-Method: DELETE
サーバーの許可:     Access-Control-Allow-Methods: GET, POST
→ DELETE が含まれない ❌ → CORSエラー
```

### Express.js での設定

```javascript
app.options('/api/users/:id', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://myapp.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});
```

---

## 📝 ヘッダに対する許可

プリフライトのレスポンスでは、**Access-Control-Allow-Headers** ヘッダで許可するリクエストヘッダを指定します。

```
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-ID
```

### ブラウザの検証

```
プリフライトで要求: Access-Control-Request-Headers: Content-Type, Authorization
サーバーの許可:     Access-Control-Allow-Headers: Content-Type, Authorization
→ 両方含まれる ✅
```

### よくあるエラー

```
Method PUT is not allowed by Access-Control-Allow-Methods.
→ Allow-Methods に PUT を追加

Request header field Authorization is not allowed by Access-Control-Allow-Headers.
→ Allow-Headers に Authorization を追加
```

---

## 🏠 オリジンに対する許可

CORSにおける **オリジンへの許可** は、**Access-Control-Allow-Origin** ヘッダで行います。プリフライト・本番リクエスト **両方** のレスポンスに必要です。

### 許可パターン

| 設定 | 意味 | 用途 |
|------|------|------|
| `https://myapp.com` | 特定オリジンのみ | **本番環境（推奨）** |
| `https://myapp.com, https://admin.myapp.com` | ※ヘッダは1つだけ。動的に切り替え | 複数フロントエンド |
| `*` | 全オリジン許可 | 開発環境のみ |

### 複数オリジンを許可する場合

`Access-Control-Allow-Origin` ヘッダには **1つの値しか書けません**。複数オリジンを許可するには、リクエストの `Origin` を確認して動的に返します。

```javascript
const allowedOrigins = ['https://myapp.com', 'https://admin.myapp.com'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  next();
});
```

### プリフライトと本番の両方で必要

```
OPTIONS レスポンス → Access-Control-Allow-Origin 必須
PUT レスポンス     → Access-Control-Allow-Origin 必須（ここが漏れやすい）
```

本番リクエストのレスポンスに `Access-Control-Allow-Origin` がないと、プリフライトは成功しても最終的に CORS エラーになります。

---

## 🔑 認証情報を含むリクエスト

**認証情報（Credentials）** とは、**Cookie**、**Authorization ヘッダ**、**TLS クライアント証明書** など、リクエストに付随する認証データのことです。

### デフォルトの動作

クロスオリジンの `fetch()` では、**Cookie は自動送信されません**（セキュリティのため）。

```javascript
// デフォルト: credentials = 'same-origin'
fetch('https://api.example.com/profile');
// → api.example.com の Cookie は送られない
```

### 認証情報を含める設定

クライアント側とサーバー側 **両方** の設定が必要です。

**クライアント側:**

```javascript
fetch('https://api.example.com/profile', {
  credentials: 'include'  // Cookie を含めて送信
});
```

**サーバー側:**

```
Access-Control-Allow-Origin: https://myapp.com   ← * は使えない
Access-Control-Allow-Credentials: true
```

### credentials の値

| 値 | 動作 |
|----|------|
| `omit` | 認証情報を送らない |
| `same-origin` | 同一オリジンのみ送る（デフォルト） |
| `include` | クロスオリジンでも送る |

### 重要な制約

| 制約 | 理由 |
|------|------|
| `Allow-Origin: *` と `Credentials: true` は **併用不可** | どのサイトでもCookie付きアクセスできてしまう |
| 具体的なオリジンを指定する必要がある | 許可する相手を限定するため |
| `SameSite` Cookie 属性も影響する | クロスサイトCookie送信の制御 |

### 設定例（Express.js + cors パッケージ）

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://myapp.com',   // 具体的なオリジン（* 不可）
  credentials: true               // 認証情報を許可
}));

// クライアント
fetch('https://api.myapp.com/profile', {
  credentials: 'include'
});
```

### セキュリティ上の注意

- 認証情報を含む CORS は **必要最小限のオリジン** だけに許可する
- `Access-Control-Allow-Origin` を動的に設定する場合、**Origin ヘッダの検証** を必ず行う
- 反射的に Origin をそのまま返すと、任意オリジン許可の脆弱性になる

```javascript
// ❌ 危険：任意の Origin をそのまま返す
res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
res.setHeader('Access-Control-Allow-Credentials', 'true');

// ✅ 許可リストで検証
if (allowedOrigins.includes(req.headers.origin)) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}
```

---

## 📝 まとめ

| トピック | 要点 |
|---------|------|
| CORS | サーバーが許可ヘッダを返すことで、ブラウザが同一オリジンポリシーの制限を緩和 |
| Access-Control-Allow-Origin | 許可するオリジンを指定（最重要ヘッダ） |
| シンプルリクエスト | GET/HEAD/POST + 限定ヘッダ + 限定 Content-Type |
| プリフライトリクエスト | 条件外のリクエストは OPTIONS で事前確認 |
| メソッドの許可 | `Access-Control-Allow-Methods` |
| ヘッダの許可 | `Access-Control-Allow-Headers` |
| オリジンの許可 | プリフライト・本番両方のレスポンスで `Allow-Origin` が必要 |
| 認証情報 | `credentials: 'include'` + `Allow-Credentials: true` + 具体的なオリジン |

### 全体像

```
同一オリジンポリシー（ブラウザのデフォルト防御）
        │
        │  サーバーが CORS ヘッダで許可
        ▼
CORS（安全なクロスオリジン通信）
        │
        ├─ シンプルリクエスト → そのまま送信 → Allow-Origin を確認
        │
        └─ それ以外 → プリフライト（OPTIONS）
                        ├─ Allow-Methods（メソッド許可）
                        ├─ Allow-Headers（ヘッダ許可）
                        └─ Allow-Origin（オリジン許可）
                              ↓
                        本番リクエスト → Allow-Origin を再確認
```

次の章では、これらの知識を踏まえて、具体的な攻撃手法と防御策について学んでいきます。
