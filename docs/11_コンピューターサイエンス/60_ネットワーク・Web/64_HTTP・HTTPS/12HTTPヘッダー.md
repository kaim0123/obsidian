# HTTPヘッダー

## HTTPヘッダーとは
HTTPメッセージの**メタ情報**を伝えるキー・バリューの集まりです。本文（ボディ）とは別に、形式・認証・キャッシュ・セキュリティなどの付加情報を交換します。

```
Key: Value
```

## ヘッダーの分類

| 種類 | 方向 | 例 |
|---|---|---|
| 一般ヘッダー | 共通 | Date, Connection |
| リクエストヘッダー | 要求側 | Host, Accept, User-Agent |
| レスポンスヘッダー | 応答側 | Server, Location |
| エンティティヘッダー | 本文の情報 | Content-Type, Content-Length |

## 主要なリクエストヘッダー

### Host
宛先ドメイン。HTTP/1.1で必須。
```
Host: example.com
```

### User-Agent
クライアント情報（ブラウザ、OS、ボットなど）。
```
User-Agent: Mozilla/5.0 (Windows NT 11.0) Chrome/120
```

### Accept系
受け取りたい形式を優先度付きで指定。
```
Accept: application/json, text/html;q=0.9
Accept-Language: ja,en;q=0.8
Accept-Encoding: gzip, br
```

### Authorization
認証情報を送る。
```
Authorization: Bearer eyJhbGciOi...
Authorization: Basic dXNlcjpwYXNz
```

### Cookie
ブラウザに保存されたCookieを返送。
```
Cookie: session=abc; theme=dark
```

### Referer / Origin
- **Referer**: どのページから遷移してきたか
- **Origin**: CORSで使われる呼び出し元オリジン
```
Referer: https://google.com/search?q=...
Origin: https://app.example.com
```

### Content-Type / Content-Length
送信ボディの形式とサイズ。
```
Content-Type: application/json; charset=utf-8
Content-Length: 123
```

## 主要なレスポンスヘッダー

### Content-Type
返すデータの形式（MIMEタイプ）。
```
Content-Type: text/html; charset=utf-8
Content-Type: image/png
Content-Type: application/pdf
```

### Content-Length / Transfer-Encoding
サイズ、もしくは分割転送の指定。
```
Content-Length: 2048
Transfer-Encoding: chunked
```

### Location
リダイレクト先URL。
```
Location: https://example.com/new
```

### Set-Cookie
ブラウザに保存させるCookie。
```
Set-Cookie: session=abc; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600
```

### Server
サーバーソフト情報（セキュリティ的に隠すことも）。
```
Server: nginx/1.24
```

### WWW-Authenticate
認証要求。401レスポンスで使う。
```
WWW-Authenticate: Bearer realm="api"
```

## キャッシュ関連ヘッダー

### Cache-Control
キャッシュ方針を指定。
```
Cache-Control: no-store          ← 保存禁止
Cache-Control: no-cache          ← 検証必須
Cache-Control: public, max-age=3600  ← 1時間有効
Cache-Control: private, max-age=60   ← ブラウザのみキャッシュ
```

### ETag / If-None-Match
コンテンツのバージョン識別子。変わってなければ 304 Not Modified を返す。
```
ETag: "abc123"
If-None-Match: "abc123"
```

### Last-Modified / If-Modified-Since
更新日時ベースのキャッシュ検証。

### Expires
昔ながらの有効期限指定。Cache-Controlが優先される。

## セキュリティ関連ヘッダー

### HTTPS通信を強制
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### XSS対策・クリックジャッキング対策
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=()
```

### CORS
他オリジンからの呼び出しを制御。
```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## カスタムヘッダー
アプリ固有の情報を送る時に使用。慣例として `X-` を付けていたが、現在は不要。
```
X-Request-ID: 7b3f4d2c
X-API-Version: 2
```

## Cookie属性の詳細

| 属性 | 役割 |
|---|---|
| HttpOnly | JSからアクセス不可（XSS対策） |
| Secure | HTTPS通信のみ送信 |
| SameSite=Strict | 同一サイトのみ |
| SameSite=Lax | GETなど一部緩和（既定） |
| SameSite=None | クロスサイトOK（Secure必須） |
| Domain | 送信対象ドメイン |
| Path | 送信対象パス |
| Max-Age / Expires | 有効期間 |

## 実例: API呼び出し

### リクエスト
```
POST /api/orders HTTP/1.1
Host: shop.example.com
Authorization: Bearer xxx
Content-Type: application/json
Accept: application/json
Origin: https://app.example.com
X-Request-ID: abc123

{"item_id": 42, "qty": 2}
```

### レスポンス
```
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/orders/999
Cache-Control: no-store
Access-Control-Allow-Origin: https://app.example.com
Set-Cookie: session=xyz; HttpOnly; Secure; SameSite=Lax

{"id": 999, "status": "created"}
```

## 発展：REST API のリクエストとヘッダ

REST API（ネットワークコントローラなど）を呼ぶときのリクエスト／レスポンスの構成と、よく使うヘッダを整理します。ステータスコードの読み方は [[13HTTPステータスコード]] の「発展」節にあります。

### HTTPヘッダ（REST API での使い方）

#### HTTP リクエスト／レスポンスの構成

HTTP のリクエストは **メソッドと URI、ヘッダ、本文（ボディ）** で構成されます。

```
 ── リクエスト ─────────────────────────────
 POST /api/v1/vlans HTTP/1.1          ← メソッド + URI（リクエスト行）
 Host: controller.example.com          ┐
 Content-Type: application/json        │ ヘッダ
 Accept: application/json              │
 Authorization: Bearer eyJhbGci...     ┘
                                       ← 空行
 {"vlan": 20, "name": "Eng"}           ← 本文（ボディ）

 ── レスポンス ─────────────────────────────
 HTTP/1.1 201 Created                  ← ステータスコード
 Content-Type: application/json        ← ヘッダ

 {"vlan": 20, "name": "Eng"}           ← 本文
```

#### よく使う HTTP ヘッダ

| ヘッダ | 方向 | 意味 | 例 |
| --- | --- | --- | --- |
| **Content-Type** | 送る側 | **送る本文の形式** | `Content-Type: application/json`（XML なら `application/xml`） |
| **Accept** | リクエスト | **受け取りたい応答の形式** | `Accept: application/json` |
| **Authorization** | リクエスト | 認証情報 | `Authorization: Basic YWRtaW46Q2lzY28xMjM=` / `Authorization: Bearer <トークン>` |
| User-Agent | リクエスト | リクエストを送ったソフトウェアの種類 | `User-Agent: python-requests/2.31` |
| X-Auth-Token | リクエスト | Catalyst Center などで使うトークン用ヘッダ | `X-Auth-Token: eyJ...` |

**Content-Type（送る形式）と Accept（受け取りたい形式）** は混同しやすいポイントです。「POST の本文が JSON であることを伝える」のは **Content-Type** です。

#### ひっかけポイント・よくある誤解

- 本文の形式は **Content-Type**。Accept は受け取りたい形式、Authorization は認証、User-Agent はソフトウェアの種類。

#### 押さえておくポイント

- Content-Type ＝ 送る形式、Accept ＝ 受け取りたい形式。

## まとめ
- ヘッダーは通信の**メタ情報**を伝えるキー・バリュー
- リクエスト/レスポンス/共通で役割が分かれる
- **認証・キャッシュ・セキュリティ・CORS** あたりが実務で重要
- Cookie属性（HttpOnly, Secure, SameSite）はセキュリティ上必須知識

次章では、処理結果を示す**HTTPステータスコード**を学びます。
