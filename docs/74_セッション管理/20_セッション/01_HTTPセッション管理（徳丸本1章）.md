# 安全なWebアプリケーションの作り方（第1章）

Webアプリケーションのセキュリティを理解するには、まず **HTTP** という通信の仕組みを押さえることが大切です。この章では、HTTPの基本から認証・セッション管理まで、初心者向けに解説します。

---

## 🌐 HTTP

**HTTP（HyperText Transfer Protocol）** は、ブラウザとWebサーバーがデータをやり取りするための「約束事（プロトコル）」です。

### 日常生活での例え

- **HTTP**: レストランでの注文と配膳のルール
- **ブラウザ**: お客さん（注文する側）
- **Webサーバー**: 厨房（料理を作って返す側）

お客さんが「ハンバーガーをください」と注文（リクエスト）すると、厨房が「はい、どうぞ」と料理を出す（レスポンス）。このやり取りの形式が HTTP です。

### HTTPの特徴

| 特徴 | 説明 |
|------|------|
| **リクエスト・レスポンス型** | クライアント（ブラウザ）が先に要求し、サーバーが応答する |
| **ステートレス** | サーバーは前回の通信を覚えていない（別の仕組みで状態を管理する） |
| **テキストベース** | メッセージの多くは人間が読める形式 |
| **ポート443（HTTPS）** | 暗号化された安全な通信には HTTPS を使う |

### URLの構成

```
https://example.com:443/search?q=hello#top
  │       │          │    │      │     │
  │       │          │    │      │     └─ フラグメント（ページ内の位置）
  │       │          │    │      └─ クエリ文字列（パラメータ）
  │       │          │    └─ パス
  │       │          └─ ポート番号（省略時は443）
  │       └─ ホスト名（ドメイン）
  └─ スキーム（http / https）
```

---

## 📤 リクエストメッセージ

ブラウザがサーバーに送るメッセージを **リクエストメッセージ** と呼びます。主に3つの部分で構成されます。

```
GET /search?q=hello HTTP/1.1          ← リクエストライン
Host: example.com                     ← リクエストヘッダ
User-Agent: Mozilla/5.0 ...
Accept: text/html
Cookie: sessionId=abc123

                                      ← 空行
（メッセージボディ ※GETでは通常なし）
```

### リクエストライン

```
メソッド  リクエストURI  HTTPバージョン
GET       /index.html    HTTP/1.1
```

- **メソッド**: 何をしたいか（GET、POST など）
- **リクエストURI**: どのリソースにアクセスするか
- **HTTPバージョン**: 使用するHTTPの版

### リクエストヘッダ

リクエストに関する追加情報を伝えます。

| ヘッダ名 | 役割 |
|---------|------|
| `Host` | アクセス先のホスト名（必須） |
| `User-Agent` | ブラウザの種類・バージョン |
| `Accept` | 受け取れるデータ形式 |
| `Content-Type` | ボディのデータ形式（POST時） |
| `Cookie` | 保存済みクッキーの送信 |
| `Referer` | リンク元のURL |

---

## 📥 レスポンスメッセージ

サーバーがブラウザに返すメッセージを **レスポンスメッセージ** と呼びます。

```
HTTP/1.1 200 OK                       ← ステータスライン
Content-Type: text/html; charset=UTF-8 ← レスポンスヘッダ
Content-Length: 1234
Set-Cookie: sessionId=abc123; HttpOnly

                                      ← 空行
<!DOCTYPE html>                       ← メッセージボディ
<html>...</html>
```

---

## 📊 ステータスライン

レスポンスの最初の1行。**処理結果を3桁の数字**で表します。

```
HTTP/1.1 200 OK
  │       │   └─ 理由フレーズ（人間向けの説明）
  │       └─ ステータスコード（数字）
  └─ HTTPバージョン
```

### 主なステータスコード

| コード | 意味 | 例 |
|--------|------|-----|
| **2xx 成功** | | |
| 200 | OK | 正常に取得・処理できた |
| 201 | Created | 新しいリソースを作成した |
| **3xx リダイレクト** | | |
| 301 | Moved Permanently | 恒久的に別URLへ移動 |
| 302 | Found | 一時的に別URLへ移動 |
| 304 | Not Modified | キャッシュが有効（再取得不要） |
| **4xx クライアントエラー** | | |
| 400 | Bad Request | リクエストの形式が不正 |
| 401 | Unauthorized | 認証が必要 |
| 403 | Forbidden | アクセス権限がない |
| 404 | Not Found | リソースが存在しない |
| **5xx サーバーエラー** | | |
| 500 | Internal Server Error | サーバー内部のエラー |
| 502 | Bad Gateway | 上流サーバーのエラー |
| 503 | Service Unavailable | 一時的にサービス停止 |

---

## 📋 レスポンスヘッダとMIMEタイプ

### レスポンスヘッダ

レスポンスに関する追加情報を伝えます。

| ヘッダ名 | 役割 |
|---------|------|
| `Content-Type` | ボディのデータ形式（MIMEタイプ） |
| `Content-Length` | ボディのバイト数 |
| `Set-Cookie` | クッキーの設定 |
| `Location` | リダイレクト先URL |
| `Cache-Control` | キャッシュの制御 |
| `Strict-Transport-Security` | HTTPS強制（HSTS） |

### MIMEタイプ

**MIMEタイプ** は、データの種類を表す識別子です。`Content-Type` ヘッダで指定します。

```
Content-Type: text/html; charset=UTF-8
              │         │
              │         └─ 文字コード
              └─ MIMEタイプ
```

| MIMEタイプ | 内容 |
|-----------|------|
| `text/html` | HTML文書 |
| `text/css` | CSSスタイルシート |
| `text/plain` | プレーンテキスト |
| `application/json` | JSONデータ |
| `application/javascript` | JavaScript |
| `image/png` | PNG画像 |
| `image/jpeg` | JPEG画像 |
| `application/pdf` | PDFファイル |

ブラウザは MIMEタイプ を見て、HTMLとして表示するのか、JSONとして処理するのか、画像として描画するのかを判断します。

---

## 📮 POSTメソッド

**POST** は、サーバーにデータを **送信（作成・更新）** するためのHTTPメソッドです。

### GETとの違い（概要）

| | GET | POST |
|---|-----|------|
| 目的 | データの取得 | データの送信 |
| パラメータの位置 | URL（クエリ文字列） | メッセージボディ |
| ブックマーク | 可能 | 不可 |
| キャッシュ | されやすい | されにくい |
| 再送信 | 安全 | 注意が必要 |

### POSTリクエストの例

```
POST /login HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 29

username=yamada&password=secret
```

```html
<!-- HTMLフォームからPOSTする例 -->
<form method="POST" action="/login">
  <input type="text" name="username">
  <input type="password" name="password">
  <button type="submit">ログイン</button>
</form>
```

---

## 📦 メッセージボディ

**メッセージボディ** は、HTTPメッセージの本体部分です。ヘッダとボディの間には **空行** が1行入ります。

### リクエストボディ

POSTやPUTなど、クライアントからサーバーへデータを送るときに使います。

```
Content-Type: application/x-www-form-urlencoded

username=yamada&password=secret
```

```
Content-Type: application/json

{"username": "yamada", "password": "secret"}
```

### レスポンスボディ

サーバーから返される実際のコンテンツです。

- HTMLページ
- JSON形式のAPIレスポンス
- 画像・PDFなどのバイナリデータ

### 注意点（セキュリティ）

- パスワードなど **機密情報はボディに入れる**（URLに載せない）
- HTTPS を使わないと、ボディの内容が傍受される可能性がある
- ボディのサイズには上限を設ける（DoS攻撃対策）

---

## 🔤 パーセントエンコード

URLやフォームデータに **英数字以外の文字**（日本語、スペース、`&`、`=` など）を含めるとき、特殊な形式に変換します。これを **パーセントエンコード（URLエンコード）** と呼びます。

### 変換ルール

1. 英数字と `-_.~` 以外の文字を、UTF-8のバイト列に変換
2. 各バイトを `%` + 16進数2桁で表す

```
元の文字    エンコード後
スペース  →  %20
&         →  %26
=         →  %3D
こ        →  %E3%81%93
```

### 例

```
/search?q=こんにちは
↓
/search?q=%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF
```

### なぜ必要か

- URLには `#`、`?`、`&`、`=` など **特別な意味を持つ文字** がある
- そのまま送ると、サーバーがパラメータの区切りと誤解する
- エンコードすることで、データとして安全に送れる

```javascript
// JavaScriptでの例
encodeURIComponent('こんにちは');  // "%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF"
decodeURIComponent('%E3%81%93');  // "こ"
```

---

## 🔗 リファラー（Referer）

**リファラー（Referer）** は、ユーザーが **どのページから来たか** を示す情報です。HTTPヘッダ `Referer`（スペルは歴史的経緯で Referer になっている）で送信されます。

```
Referer: https://example.com/search?q=hello
```

### 用途

- **アクセス解析**: どのサイト・ページから流入したか
- **CSRF対策**: リクエスト元を検証する
- **ホットリンク防止**: 画像の直リンクを制限する

### セキュリティ上の注意

| リスク | 説明 |
|--------|------|
| **情報漏洩** | URLにトークンや検索語が含まれると、Referer経由で漏れる |
| **プライバシー** | 閲覧履歴が外部サイトに伝わる |

### 対策

- 機密情報をURLに含めない
- `Referrer-Policy` ヘッダで送信を制限する

```
Referrer-Policy: strict-origin-when-cross-origin
```

---

## ⚖️ GET・POSTの使い分け

### 基本原則

| 操作 | 使うメソッド | 理由 |
|------|------------|------|
| データの **参照・検索** | GET | 安全（副作用なし）、キャッシュ可能 |
| データの **登録・更新・削除** | POST（PUT/DELETE） | 副作用がある操作 |
| **ログイン** | POST | パスワードをURLに載せない |
| **検索フォーム** | GET | 結果URLをブックマーク・共有可能 |

### GETを使うべき場面

```
GET /products?category=books&page=2
```

- 検索結果の表示
- ページネーション
- フィルタリング
- **冪等**（何度実行しても同じ結果）な操作

### POSTを使うべき場面

```
POST /orders
{"productId": 123, "quantity": 2}
```

- ログイン・会員登録
- フォーム送信（問い合わせ、決済）
- データの作成・更新
- **副作用がある** 操作

### よくある間違い

```html
<!-- ❌ パスワードをGETで送る（URLに残る） -->
<form method="GET" action="/login">
  <input type="password" name="password">
</form>

<!-- ✅ POSTで送る -->
<form method="POST" action="/login">
  <input type="password" name="password">
</form>
```

---

## 👁️ Hiddenパラメータ

**Hiddenパラメータ** は、HTMLフォームで `<input type="hidden">` を使い、画面上は見えないがサーバーに送信される値です。

```html
<form method="POST" action="/transfer">
  <input type="hidden" name="from_account" value="12345">
  <input type="text" name="amount" placeholder="送金額">
  <button type="submit">送金</button>
</form>
```

### 用途

- フォームの状態を引き継ぐ（商品ID、ページ番号）
- CSRFトークンの埋め込み
- 処理モードの指定

### セキュリティ上の重大な注意 ⚠️

Hiddenパラメータは **ブラウザの開発者ツールで誰でも見え、値を書き換えられる** ため、セキュリティの根拠にはなりません。

```html
<!-- ❌ 危険：権限チェックをhiddenに頼る -->
<input type="hidden" name="is_admin" value="true">

<!-- ❌ 危険：価格をhiddenで送る -->
<input type="hidden" name="price" value="100">
```

**正しい考え方:**

- Hiddenは **利便性のため** に使う（UIの状態引き継ぎなど）
- 権限・価格・ユーザーIDなど **信頼すべき値はサーバー側で管理** する
- 送られてきた値は必ずサーバーで **再検証** する

---

## 🔐 Basic認証

**Basic認証（ベーシック認証）** は、HTTPで定義されている最もシンプルな認証方式です。

### 仕組み

1. ユーザーが保護されたページにアクセス
2. サーバーが `401 Unauthorized` と `WWW-Authenticate: Basic` を返す
3. ブラウザがログインダイアログを表示
4. ユーザー名とパスワードを入力
5. ブラウザが `Authorization: Basic エンコード文字列` ヘッダで送信

```
Authorization: Basic eWFtYWRhOnNlY3JldA==
                              ↑
                    Base64(username:password)
```

### 例

```
GET /admin HTTP/1.1
Host: example.com
Authorization: Basic eWFtYWRhOnBhc3N3b3JkMTIz
```

### メリット・デメリット

| メリット | デメリット |
|---------|-----------|
| 実装が簡単 | **HTTPS必須**（平文に近い形式のため） |
| ブラウザが対応 | ログアウト機能が弱い |
| 小規模な管理画面向け | パスワードを毎回送信する |
| | Base64は **暗号化ではない**（誰でも復号できる） |
| | セッション管理がない |

### セキュリティ上の注意

- **必ずHTTPSで使う**（HTTPでは盗聴される）
- 本番のユーザー認証には **セッション＋フォームログイン** や **OAuth** を推奨
- 管理画面の簡易保護や、開発環境での利用に限定するのが現実的

---

## 🍪 クッキーによるセッション管理

HTTPは **ステートレス**（状態を保持しない）なので、ログイン状態などを維持するには別の仕組みが必要です。**クッキーによるセッション管理** が最も一般的な方法です。

### 仕組みの流れ

```
1. ログイン成功
   サーバー → ブラウザ: Set-Cookie: sessionId=abc123

2. ブラウザがクッキーを保存

3. 次回以降のリクエスト
   ブラウザ → サーバー: Cookie: sessionId=abc123

4. サーバーが sessionId をキーにセッションデータを取得
   → 「この人はログイン済みの yamada さんだ」と判断
```

### セッションIDとセッションデータ

| 保存場所 | 内容 | 例 |
|---------|------|-----|
| **クッキー（ブラウザ）** | セッションIDのみ | `sessionId=abc123` |
| **サーバー** | 実際のユーザーデータ | `{ userId: 1, username: "yamada" }` |

セッションIDは「ロッカーの鍵」、サーバー側のデータは「ロッカーの中身」に例えると分かりやすいです。

### 実装例（Express.js）

```javascript
const session = require('express-session');

app.use(session({
  secret: 'ランダムな秘密鍵',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.post('/login', (req, res) => {
  // 認証成功後
  req.session.userId = 1;
  req.session.username = 'yamada';
  res.json({ message: 'ログイン成功' });
});
```

---

## 🚨 セッションID漏洩の原因

セッションIDが第三者に知られると、そのIDを使って **なりすまし（セッションハイジャック）** が可能になります。

### 主な漏洩原因

| 原因 | 説明 | 対策 |
|------|------|------|
| **HTTP通信の盗聴** | 平文通信でCookieが傍受される | HTTPSを使う、`Secure` 属性 |
| **XSS攻撃** | 悪意あるJavaScriptがCookieを読み取る | `HttpOnly` 属性、入力値のエスケープ |
| **Referer経由** | URLにセッションIDを含めると漏洩 | Cookie方式を使う（URLに載せない） |
| **ログやキャッシュ** | サーバーログやプロキシに記録される | URLではなくCookieで管理 |
| **セッション固定攻撃** | 攻撃者が用意したIDを被害者に使わせる | ログイン成功時にIDを再生成 |
| **物理アクセス** | PCを離席中にCookieをコピーされる | タイムアウト、再認証 |

### セッション固定攻撃の例

```
1. 攻撃者が sessionId=EVIL123 のセッションを取得
2. 被害者にそのURL（?sessionId=EVIL123）を踏ませる
3. 被害者がログイン → サーバーは同じ sessionId=EVIL123 にユーザー情報を紐付け
4. 攻撃者が sessionId=EVIL123 でアクセス → 被害者として操作可能
```

**対策:** ログイン成功時に必ず **新しいセッションIDを発行** する（`session.regenerate()` など）。

### セッションIDの要件

- **推測困難**: ランダムで十分な長さ（128bit以上推奨）
- **一意**: 他のユーザーと重複しない
- **HTTPSで送信**: `Secure` 属性を設定
- **JavaScriptから読めない**: `HttpOnly` 属性を設定

---

## 🛡️ クッキーの属性

クッキーには、送信範囲や有効期限、セキュリティを制御する **属性** があります。安全なWebアプリケーションでは、これらを正しく設定することが重要です。

```
Set-Cookie: sessionId=abc123; Domain=example.com; Path=/; Expires=Wed, 01 Jan 2025 00:00:00 GMT; Secure; HttpOnly; SameSite=Strict
```

### Domain（ドメイン）

クッキーを **どのドメインに送信するか** を指定します。

```
Set-Cookie: sessionId=abc123; Domain=example.com
```

| 設定 | 送信先 |
|------|--------|
| `Domain=example.com` | `example.com` と `*.example.com` |
| 省略 | 設定したホストのみ（`www.example.com` だけ等） |

**注意:** `Domain` を広げすぎると、サブドメイン間でCookieが共有され、漏洩リスクが増えます。必要最小限に設定しましょう。

### Path（パス）

クッキーを **どのURLパス以下に送信するか** を指定します。

```
Set-Cookie: sessionId=abc123; Path=/app
```

- `Path=/app` → `/app`、`/app/dashboard` などに送信
- `Path=/` → サイト全体に送信（最も一般的）

### Expires / Max-Age（有効期限）

クッキーの **有効期限** を設定します。

```
Set-Cookie: sessionId=abc123; Expires=Wed, 01 Jan 2025 00:00:00 GMT
Set-Cookie: sessionId=abc123; Max-Age=86400
```

| 属性 | 説明 |
|------|------|
| `Expires` | 具体的な日時まで有効 |
| `Max-Age` | 設定から何秒間有効（秒数） |
| 両方省略 | **セッションCookie**（ブラウザを閉じると削除） |

セキュリティの観点では、ログインセッションには **適切な有効期限** を設け、長期間有効なCookieは避けます。

### Secure

**HTTPS接続でのみ** クッキーを送信します。

```
Set-Cookie: sessionId=abc123; Secure
```

- HTTP通信ではCookieが送信されない
- セッションIDなど機密性の高いCookieには **必須**

### HttpOnly

**JavaScriptからCookieにアクセスできなく** します。

```
Set-Cookie: sessionId=abc123; HttpOnly
```

- `document.cookie` で読み取れない
- XSS攻撃でCookieが盗まれるリスクを大幅に低減
- セッションIDには **必ず設定**

```javascript
// HttpOnly なし → XSSで盗める
document.cookie; // "sessionId=abc123"

// HttpOnly あり → JavaScriptからは見えない
document.cookie; // "" （sessionIdは含まれない）
```

### SameSite

**クロスサイトリクエスト** でCookieを送るかどうかを制御します。CSRF（クロスサイトリクエストフォージェリ）対策に有効です。

```
Set-Cookie: sessionId=abc123; SameSite=Strict
```

| 値 | 動作 |
|----|------|
| `Strict` | 同一サイトからのリクエストのみ送信（最も厳格） |
| `Lax` | トップレベルナビゲーション（リンククリック等）では送信（デフォルト） |
| `None` | クロスサイトでも送信（`Secure` 必須） |

**推奨:** セッションCookieには `SameSite=Strict` または `SameSite=Lax` を設定。

### 安全なクッキー設定のまとめ

```javascript
res.cookie('sessionId', sessionId, {
  httpOnly: true,      // XSS対策
  secure: true,        // HTTPS必須
  sameSite: 'strict',  // CSRF対策
  maxAge: 3600000,     // 1時間で期限切れ
  path: '/'
});
```

| 属性 | セッションID | 一般Cookie |
|------|------------|-----------|
| HttpOnly | ✅ 必須 | 用途による |
| Secure | ✅ 必須 | ✅ 推奨 |
| SameSite | ✅ Strict/Lax | ✅ 推奨 |
| 適切な有効期限 | ✅ 必須 | ✅ 推奨 |

---

## 📝 まとめ

| トピック | 要点 |
|---------|------|
| HTTP | ブラウザとサーバーの通信ルール。リクエストとレスポンスで構成 |
| リクエスト/レスポンス | ライン・ヘッダ・ボディの3部構成 |
| ステータスコード | 200=成功、401=認証必要、404=未発見、500=サーバーエラー |
| MIMEタイプ | データの種類を示す（`text/html`、`application/json` 等） |
| GET/POST | 取得はGET、送信・更新はPOST |
| パーセントエンコード | URLに特殊文字を安全に含めるための変換 |
| リファラー | リンク元URL。機密情報の漏洩に注意 |
| Hiddenパラメータ | 見えないが改ざん可能。サーバー側で必ず検証 |
| Basic認証 | 簡易だがHTTPS必須。本番認証には不向き |
| セッション管理 | セッションIDをCookieで送り、データはサーバーで保持 |
| セッションID漏洩 | HTTPS、HttpOnly、ログイン時のID再生成が重要 |
| クッキー属性 | Domain、Path、Expires、Secure、HttpOnly、SameSite |

次の章では、これらの基礎知識を踏まえて、具体的な脆弱性と対策について学んでいきます。
