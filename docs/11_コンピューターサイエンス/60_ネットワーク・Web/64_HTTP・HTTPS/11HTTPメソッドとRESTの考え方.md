# HTTPメソッドとRESTの考え方

## HTTPメソッドとは
リクエストでサーバーに対して**何をしたいか**を伝えるキーワードです。動詞のような役割を果たします。

## 主要なHTTPメソッド

| メソッド | 用途 | ボディ | 冪等 | 安全 |
|---|---|---|---|---|
| GET | リソース取得 | なし | ○ | ○ |
| POST | リソース作成・処理実行 | あり | × | × |
| PUT | リソース全体更新・作成 | あり | ○ | × |
| PATCH | リソース部分更新 | あり | △ | × |
| DELETE | リソース削除 | 任意 | ○ | × |
| HEAD | ヘッダだけ取得 | なし | ○ | ○ |
| OPTIONS | 使えるメソッドを問合せ | なし | ○ | ○ |

- **安全**: サーバーの状態を変えない
- **冪等**: 何回実行しても結果が同じ

## 各メソッドの使い方

### GET: 取得
```
GET /users/42
GET /users?role=admin&page=2
```
- URLだけで完結、キャッシュ可能
- 機密情報はクエリに載せない

### POST: 作成・任意処理
```
POST /users
Content-Type: application/json

{"name": "Alice"}
```
- 新規作成、検索、決済処理などにも使える
- 同じリクエストを2回投げると2回処理される（冪等でない）

### PUT: 置き換え
```
PUT /users/42
Content-Type: application/json

{"id": 42, "name": "Alice", "age": 30}
```
- リソース**全体を差し替える**
- 同じPUTを何度送っても結果は同じ

### PATCH: 部分更新
```
PATCH /users/42
Content-Type: application/json

{"age": 31}
```
- 一部フィールドだけ更新
- 実装によっては冪等でない場合あり

### DELETE: 削除
```
DELETE /users/42
```
- リソースを削除。2回目は404になるが状態は同じ（冪等）

### HEAD / OPTIONS
- **HEAD**: GETと同じだがボディなし。存在確認や更新確認に
- **OPTIONS**: CORSのプリフライトなどで自動利用

## 冪等性の具体例

### GET: 冪等
`GET /users/42` を何回やっても取得するだけで状態は変わらない。

### DELETE: 冪等
1回目 → 削除される（200）
2回目 → もう無い（404）
いずれにしても**最終状態は「存在しない」で同じ**。

### POST: 非冪等
`POST /orders` を2回 → 注文が2件作られる。

## RESTとは
**REpresentational State Transfer**の略で、Webに適した設計思想です。「リソース指向」のAPI設計と言えます。

## RESTの設計原則

### 1. リソース中心
URLは**名詞**で、操作はメソッドで表現。
```
❌ /getUser?id=42
❌ /createOrder
✅ GET /users/42
✅ POST /orders
```

### 2. 一貫したURL設計
| 操作 | メソッド | URL |
|---|---|---|
| ユーザー一覧 | GET | /users |
| ユーザー詳細 | GET | /users/42 |
| 作成 | POST | /users |
| 更新 | PUT/PATCH | /users/42 |
| 削除 | DELETE | /users/42 |

### 3. ネスト構造でリレーションを表現
```
GET /users/42/orders          ← ユーザー42の注文一覧
GET /users/42/orders/100      ← ユーザー42の注文100
POST /users/42/orders         ← ユーザー42に注文を追加
```

### 4. ステータスコードを正しく使う
- 200 OK / 201 Created / 204 No Content
- 400 Bad Request / 401 Unauthorized / 404 Not Found
- 500 Internal Server Error

### 5. ステートレス
各リクエストは自己完結。認証情報もトークン等で都度送る。

### 6. 表現は複数可
同じリソースでも `Accept: application/json` でJSON、`text/csv` でCSVなど返し分ける。

## RESTの実例

### ブログAPI
| 操作 | メソッド | URL |
|---|---|---|
| 記事一覧 | GET | /posts |
| 記事詳細 | GET | /posts/123 |
| 記事投稿 | POST | /posts |
| 記事更新 | PUT | /posts/123 |
| 記事削除 | DELETE | /posts/123 |
| コメント一覧 | GET | /posts/123/comments |
| コメント追加 | POST | /posts/123/comments |

## RESTで気をつけること

### アンチパターン
- URLに動詞を入れる（`/getUsers`）
- GETで状態を変える
- POSTだけで全て表現する

### 現実的な妥協
- バッチ処理（複数同時作成など）
- 検索でフィルタが多すぎてURLが長くなる → POST使用も可
- 複雑な業務処理（例: `/orders/123/cancel`）

## REST以外の選択肢
- **GraphQL**: 必要なフィールドだけ取得できる
- **gRPC**: 高速なバイナリ通信
- **WebSocket**: 双方向リアルタイム通信

要件（クライアント多様性・パフォーマンス・リアルタイム性）で選択します。

## まとめ
- HTTPメソッドは**動詞**、URLは**名詞（リソース）**
- **冪等性と安全性**を意識すると設計が整う
- RESTは**リソース指向**の設計原則
- 正しいメソッドとステータスコードの組み合わせでAPIは読みやすくなる

次章では、通信のメタデータを伝える**HTTPヘッダー**を学びます。
