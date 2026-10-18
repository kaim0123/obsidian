# CORSの仕組み

CORSがどのように動作するかを詳しく解説します。

## CORSリクエストの種類

CORSリクエストには、**シンプルリクエスト**と**プリフライトリクエスト**の2種類があります。

## シンプルリクエスト

条件を満たすシンプルなリクエストは、追加の確認なしで実行されます。

### シンプルリクエストの条件

以下の**全て**の条件を満たす必要があります：

1. **許可されているメソッド**
   - GET
   - HEAD
   - POST

2. **許可されているヘッダー**（カスタムヘッダーは制限あり）
   - `Accept`
   - `Accept-Language`
   - `Content-Language`
   - `Content-Type`（ただし値は以下のみ）
     - `application/x-www-form-urlencoded`
     - `multipart/form-data`
     - `text/plain`

3. **リクエストに含まれないもの**
   - カスタムヘッダー（`X-Custom-Header`など）
   - `Content-Type`が`application/json`の場合もシンプルリクエストではない

### シンプルリクエストの例

```javascript
// シンプルリクエストの例
fetch('https://api.example.com/users');
// GETリクエスト、カスタムヘッダーなし

// シンプルリクエストの例
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: 'name=山田&email=yamada@example.com'
});
```

### シンプルリクエストの処理フロー

```
1. ブラウザがリクエストを送信
   ↓
2. サーバーがレスポンスを返す
   ↓
3. ブラウザがレスポンスヘッダーを確認
   - Access-Control-Allow-Origin があるか？
   ↓
4. あれば成功、なければエラー
```

## プリフライトリクエスト

シンプルリクエストの条件を満たさないリクエストは、**プリフライトリクエスト**が先に送信されます。

### プリフライトリクエストが必要な場合

以下のいずれかに該当する場合：

1. **メソッド**: PUT、DELETE、PATCHなど
2. **カスタムヘッダー**: `X-Custom-Header`、`Authorization`など
3. **Content-Type**: `application/json`など

### プリフライトリクエストの例

```javascript
// プリフライトリクエストが必要な例
fetch('https://api.example.com/users', {
  method: 'PUT',  // PUTメソッド
  headers: {
    'Content-Type': 'application/json',  // JSON
    'Authorization': 'Bearer token123'   // カスタムヘッダー
  },
  body: JSON.stringify({ name: '山田花子' })
});
```

### プリフライトリクエストの処理フロー

```
1. ブラウザがOPTIONSリクエスト（プリフライト）を送信
   ↓
2. サーバーがOPTIONSレスポンスを返す
   - Access-Control-Allow-Origin
   - Access-Control-Allow-Methods
   - Access-Control-Allow-Headers
   ↓
3. ブラウザが許可を確認
   ↓
4. 許可されていれば、実際のリクエストを送信
   ↓
5. サーバーがレスポンスを返す
```

## CORSレスポンスヘッダー

サーバーが返す必要があるCORS関連のヘッダーです。

### Access-Control-Allow-Origin

**必須**のヘッダー。どのオリジンを許可するかを指定します。

```
Access-Control-Allow-Origin: *
```

全てのオリジンを許可します（本番環境では非推奨）。

```
Access-Control-Allow-Origin: https://myapp.com
```

特定のオリジンのみを許可します。

```
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Credentials: true
```

`Access-Control-Allow-Credentials: true`を使う場合、`*`は使えません。必ず具体的なオリジンを指定する必要があります。

### Access-Control-Allow-Methods

プリフライトリクエストのレスポンスで必要。許可するHTTPメソッドを指定します。

```
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

### Access-Control-Allow-Headers

プリフライトリクエストのレスポンスで必要。許可するヘッダーを指定します。

```
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Access-Control-Allow-Credentials

クッキーや認証情報を含めることを許可するかどうかを指定します。

```
Access-Control-Allow-Credentials: true
```

このヘッダーを使用する場合：
- `Access-Control-Allow-Origin`に`*`は指定できない
- リクエスト側でも`credentials: 'include'`を指定する必要がある

### Access-Control-Max-Age

プリフライトリクエストの結果をキャッシュする時間（秒）を指定します。

```
Access-Control-Max-Age: 3600
```

この時間内は、同じリクエストに対してプリフライトリクエストがスキップされます。

## 実際のリクエスト・レスポンス例

### シンプルリクエストの例

#### リクエスト

```
GET /api/users HTTP/1.1
Host: api.example.com
Origin: https://myapp.com
```

#### レスポンス

```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://myapp.com
Content-Type: application/json

[{"id": 1, "name": "田中太郎"}]
```

### プリフライトリクエストの例

#### プリフライトリクエスト（OPTIONS）

```
OPTIONS /api/users HTTP/1.1
Host: api.example.com
Origin: https://myapp.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Content-Type, Authorization
```

#### プリフライトレスポンス

```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
```

#### 実際のリクエスト（PUT）

```
PUT /api/users/1 HTTP/1.1
Host: api.example.com
Origin: https://myapp.com
Content-Type: application/json
Authorization: Bearer token123

{"name": "山田花子"}
```

#### 実際のレスポンス

```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://myapp.com
Content-Type: application/json

{"id": 1, "name": "山田花子"}
```

## よくある誤解

### 誤解1: CORSはサーバー側のエラー

**正しくは**: CORSエラーは**ブラウザのセキュリティ機能**によるものです。サーバーは正常にレスポンスを返していますが、ブラウザがそれをブロックしています。

### 誤解2: 全てのリクエストにプリフライトが必要

**正しくは**: シンプルリクエストの条件を満たす場合は、プリフライトは不要です。

### 誤解3: CORSはAPIの問題

**正しくは**: CORSは**ブラウザのセキュリティ機能**です。サーバー間通信やツール（curl、Postman）では発生しません。

## まとめ

- **シンプルリクエスト**: 条件を満たす場合は、追加の確認なしで実行
- **プリフライトリクエスト**: シンプルリクエストの条件を満たさない場合、OPTIONSリクエストが先に送信される
- **Access-Control-Allow-Origin**: 必須のヘッダー
- **Access-Control-Allow-Methods**: プリフライト時に必要なヘッダー
- **Access-Control-Allow-Headers**: プリフライト時に必要なヘッダー
- **Access-Control-Allow-Credentials**: 認証情報を許可する場合に必要

次は「07_CORSエラーの対処法.md」で、実際にCORSエラーを解決する方法を学習しましょう。

