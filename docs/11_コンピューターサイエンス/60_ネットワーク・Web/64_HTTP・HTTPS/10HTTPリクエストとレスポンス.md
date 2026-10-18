# HTTPリクエストとレスポンス

## 概要
HTTPのやり取りは、クライアントが送る**リクエスト**と、サーバーが返す**レスポンス**の2つで構成されます。どちらも同じ基本構造（スタートライン + ヘッダ + 空行 + ボディ）を持ちます。

## HTTPリクエストの構造

```
POST /api/users HTTP/1.1          ← リクエストライン
Host: example.com                 ← ヘッダ
Content-Type: application/json
Authorization: Bearer eyJhbGc...
Content-Length: 43
                                  ← 空行
{"name": "Alice", "age": 30}      ← ボディ
```

### 1. リクエストライン
```
[メソッド] [パス＋クエリ] [HTTPバージョン]
```
例: `GET /users?id=42 HTTP/1.1`

### 2. リクエストヘッダ（主要なもの）
| ヘッダ | 役割 | 例 |
|---|---|---|
| Host | 宛先ドメイン | `example.com` |
| User-Agent | クライアント情報 | `Mozilla/5.0 ...` |
| Accept | 受け取れる形式 | `application/json` |
| Accept-Language | 優先言語 | `ja, en;q=0.9` |
| Content-Type | 送信データの形式 | `application/json` |
| Content-Length | ボディのバイト数 | `43` |
| Authorization | 認証情報 | `Bearer xxx` |
| Cookie | 保存済みCookie | `session=abc123` |
| Referer | 遷移元URL | `https://example.com/` |
| Origin | 呼び出し元オリジン | `https://app.example.com` |

### 3. リクエストボディ
POST・PUT・PATCHなどで送るデータ本体。
- JSON: `{"name": "Alice"}`
- フォーム: `name=Alice&age=30`
- ファイルアップロード: `multipart/form-data`

GETやDELETEでは通常ボディなし。

## HTTPレスポンスの構造

```
HTTP/1.1 200 OK                    ← ステータスライン
Content-Type: application/json     ← ヘッダ
Content-Length: 56
Cache-Control: max-age=60
Set-Cookie: session=abc123; Secure
                                   ← 空行
{"id": 42, "name": "Alice"}        ← ボディ
```

### 1. ステータスライン
```
[HTTPバージョン] [ステータスコード] [理由フレーズ]
```
例: `HTTP/1.1 404 Not Found`

### 2. レスポンスヘッダ（主要なもの）
| ヘッダ | 役割 | 例 |
|---|---|---|
| Content-Type | 返すデータ形式 | `text/html; charset=utf-8` |
| Content-Length | ボディのバイト数 | `1024` |
| Cache-Control | キャッシュの方針 | `max-age=3600` |
| Set-Cookie | Cookie保存指示 | `token=xyz; HttpOnly` |
| Location | リダイレクト先 | `https://new.example.com/` |
| ETag | コンテンツ識別子 | `"abc123"` |
| Server | サーバーソフト | `nginx/1.24` |
| Access-Control-Allow-Origin | CORS設定 | `*` / ドメイン |

### 3. レスポンスボディ
返すデータ。HTML、JSON、画像、ファイルなど。

## 代表的なやり取り例

### ① Webページを表示
```
GET /blog/post-1 HTTP/1.1
Host: example.com

↓

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 2048

<!doctype html><html>...
```

### ② APIでデータ取得
```
GET /api/users/42 HTTP/1.1
Host: example.com
Accept: application/json

↓

HTTP/1.1 200 OK
Content-Type: application/json

{"id": 42, "name": "Alice"}
```

### ③ リソース作成
```
POST /api/users HTTP/1.1
Host: example.com
Content-Type: application/json

{"name": "Bob"}

↓

HTTP/1.1 201 Created
Location: /api/users/43

{"id": 43, "name": "Bob"}
```

### ④ 認証エラー
```
GET /api/private HTTP/1.1
Host: example.com

↓

HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="api"
```

### ⑤ リダイレクト
```
GET /old-page HTTP/1.1
Host: example.com

↓

HTTP/1.1 301 Moved Permanently
Location: https://example.com/new-page
```

## ブラウザの開発者ツールで見る
ChromeなどのDevTools → Network タブで、実際のリクエスト/レスポンスを観察できます。
- **Headers**: リクエスト・レスポンスのヘッダ
- **Payload**: 送信ボディ
- **Response**: 受信ボディ
- **Timing**: 各フェーズの所要時間

## curlで試す
```bash
# ヘッダも見る
curl -v https://example.com

# ヘッダだけ（HEADメソッド）
curl -I https://example.com

# POSTでJSON送信
curl -X POST https://example.com/api \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice"}'

# Cookieを送る
curl -b "session=abc" https://example.com
```

## まとめ
- リクエストもレスポンスも **スタートライン / ヘッダ / 空行 / ボディ** で構成
- リクエストは **メソッド + パス**、レスポンスは**ステータスコード**が核
- ヘッダで認証・キャッシュ・形式などのメタ情報を伝える
- DevToolsや curl で実際の通信を確認すると理解が深まる

次章では、リクエストで使う**HTTPメソッド**とRESTの設計思想を学びます。
