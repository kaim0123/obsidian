# HTTPステータスコード

## ステータスコードとは
サーバーがクライアントに対して、**処理の結果**を3桁の数値で伝えるものです。レスポンスの1行目に含まれます。

```
HTTP/1.1 200 OK
```

## 大分類（百の位で意味が変わる）

| 範囲 | カテゴリ | 意味 |
|---|---|---|
| 1xx | Informational | 情報・処理中 |
| 2xx | Success | 成功 |
| 3xx | Redirection | リダイレクト |
| 4xx | Client Error | クライアント側の問題 |
| 5xx | Server Error | サーバー側の問題 |

## 1xx: 情報（あまり使わない）

- **100 Continue**: ヘッダOK、本体を送ってよい
- **101 Switching Protocols**: WebSocketなどへプロトコル切替
- **103 Early Hints**: 先行ヒント（プリロード用）

## 2xx: 成功

### 200 OK
標準的な成功。GETなどで使用。

### 201 Created
新規作成に成功。POSTでリソース作成した時。
```
HTTP/1.1 201 Created
Location: /users/42
```

### 202 Accepted
受け付けたが処理は非同期（完了していない）。

### 204 No Content
成功したが返すボディがない。DELETEや更新処理で使用。

### 206 Partial Content
範囲リクエスト（動画のシーク、大容量ダウンロードなど）。

## 3xx: リダイレクト

### 301 Moved Permanently
恒久的な移転。検索エンジンが新URLを覚える。

### 302 Found / 303 See Other / 307 Temporary Redirect
一時的な移転。メソッドの扱いが微妙に違う。
- **302**: 曖昧（実装により異なる）
- **303**: GETでリダイレクトする（POST後のリダイレクトに）
- **307**: 同じメソッドで再送する

### 304 Not Modified
キャッシュがまだ有効。ボディは返らない。

### 308 Permanent Redirect
301の「メソッド維持」版。

## 4xx: クライアントエラー

### 400 Bad Request
リクエストの形式が間違っている。JSON構文エラーなど。

### 401 Unauthorized
**認証が必要または失敗**（名前の割に認可ではなく認証）。
```
WWW-Authenticate: Bearer
```

### 403 Forbidden
認証は通ったが**権限がない**。

### 404 Not Found
リソースが見つからない。

### 405 Method Not Allowed
メソッドが許可されていない（例: GET専用にPOST）。

### 408 Request Timeout
クライアントが遅すぎて切断された。

### 409 Conflict
状態の衝突。楽観ロック失敗、重複登録など。

### 410 Gone
意図的に削除され、もう戻らない。

### 413 Payload Too Large
送信データが大きすぎる。

### 415 Unsupported Media Type
Content-Typeが対応外。

### 422 Unprocessable Entity
形式は正しいが**バリデーションエラー**。REST APIで多用。

### 429 Too Many Requests
レートリミット超過。
```
Retry-After: 60
```

## 5xx: サーバーエラー

### 500 Internal Server Error
サーバー内部で例外発生。原因は詳細不明。

### 501 Not Implemented
そのメソッドを実装していない。

### 502 Bad Gateway
プロキシやロードバランサの先のサーバーが異常。

### 503 Service Unavailable
一時的に利用不可（メンテ中、過負荷）。

### 504 Gateway Timeout
上流サーバーからの応答が遅い。

### 505 HTTP Version Not Supported
指定のHTTPバージョン非対応。

## 401 vs 403 の違い

| ステータス | 意味 |
|---|---|
| 401 | まだ認証していない／認証失敗 |
| 403 | 認証はOKだが権限がない |

例: ログインしていない → 401 / 一般ユーザーが管理画面にアクセス → 403

## 200番台でよくある使い分け

| 状況 | コード |
|---|---|
| GETでデータ返す | 200 |
| POSTで作成成功 | 201 |
| 非同期受付 | 202 |
| DELETE成功、レスポンスなし | 204 |

## API設計での実践例

### ログイン
```
成功:     200 OK + トークン
認証失敗: 401 Unauthorized
凍結:     403 Forbidden
入力不正: 400 / 422
```

### リソース作成
```
成功:       201 Created + Location
バリデーション: 422 Unprocessable Entity
重複:       409 Conflict
```

### 取得
```
存在:       200 OK
非存在:     404 Not Found
権限なし:   403 Forbidden
```

## ステータスコード早見表

```
 ✅ 成功系         2xx
 ⮑  200 OK / 201 Created / 204 No Content
 🔀 リダイレクト   3xx
 ⮑  301 Moved / 302 Found / 304 Not Modified
 ❌ クライアント   4xx
 ⮑  400 Bad / 401 Unauth / 403 Forbidden / 404 Not Found / 429 Too Many
 💥 サーバー       5xx
 ⮑  500 Internal / 502 Bad Gateway / 503 Unavailable / 504 Timeout
```

## 発展：REST API でステータスコードを判定する

スクリプトから REST API（ネットワークコントローラなど）を呼ぶときに、どのステータスコードをどう読むかを整理します。HTTP ヘッダ側の話は [[12HTTPヘッダー]] の「発展」節にあります。

### HTTPステータスコード（REST API での読み方）

#### ステータスコード

ステータスコードは **先頭の数字** で大きく分類されます。スクリプトではこのコードを確認して処理が成功したかどうかを判断します。

| 分類 | 意味 | 主なコード |
| --- | --- | --- |
| 1xx | 情報 | 100 Continue |
| **2xx** | **成功** | **200 OK**、**201 Created**、**204 No Content** |
| 3xx | リダイレクト | 301 Moved Permanently |
| **4xx** | **クライアント側の問題** | **400 Bad Request**、**401 Unauthorized**、**403 Forbidden**、**404 Not Found** |
| **5xx** | **サーバ側の問題** | **500 Internal Server Error** |

各コードの詳細：

| コード | 意味 | 典型的な場面 |
| --- | --- | --- |
| **200 OK** | リクエスト成功（一般的な成功） | GET の成功など |
| **201 Created** | 新しいリソースが作成された | **POST での作成に成功** |
| **204 No Content** | 成功したが返す本文はない | DELETE の成功など |
| **400 Bad Request** | リクエストの書式・内容に誤り | **JSON の文法エラー**（カンマ抜け等）を送った |
| **401 Unauthorized** | **認証の失敗**：認証情報がない／誤っている（「あなたは誰？」） | トークンなし、パスワード誤り |
| **403 Forbidden** | **認可の失敗**：誰かはわかったが権限がない（「あなたにはその権限がない」） | 読み取り専用ユーザーが変更しようとした |
| **404 Not Found** | 指定したリソース（URI）が見つからない | URI のタイプミス、存在しない機器 ID |
| **500 Internal Server Error** | サーバ側でエラー | サーバの不具合・障害 |

##### 401 と 403 の違い ＝ AAA の「認証」と「認可」

```
 リクエスト ─> [認証 Authentication] 誰？ ──失敗──> 401 Unauthorized
                     │成功
                     ▼
              [認可 Authorization] その操作をしてよい？ ──失敗──> 403 Forbidden
                     │成功
                     ▼
              処理実行 ──> 200 / 201 / 204
```

名前は "Unauthorized（認可されていない）" なのに実際は **認証** の失敗を表す点がややこしいので注意しましょう。

#### ひっかけポイント・よくある誤解

- 認証情報がない／誤り → **401**。200（成功）、404（リソースなし）、500（サーバエラー）ではない。
- 認証成功だが権限なし → **403**。401 と取り違えない。
- POST で作成成功 → **201 Created** が多い。200 は一般的な成功（GET など）、400 は書式誤り、500 はサーバエラー。

#### 押さえておくポイント

- **2xx 成功 / 4xx クライアント側 / 5xx サーバ側**。
- **200 OK、201 Created、204 No Content、400 Bad Request、401 Unauthorized（認証）、403 Forbidden（認可）、404 Not Found、500 Internal Server Error**。

## まとめ
- ステータスコードは**処理結果を示す3桁の数値**
- 百の位で大分類（2xx成功 / 3xxリダイレクト / 4xxクライアント / 5xxサーバー）
- **401 vs 403 / 301 vs 302**など、近いものの違いを押さえる
- APIでは**正しいコード**を返すと、クライアントが適切に処理できる

次章では、通信を安全にする**HTTPSとTLSの違い**を学びます。
