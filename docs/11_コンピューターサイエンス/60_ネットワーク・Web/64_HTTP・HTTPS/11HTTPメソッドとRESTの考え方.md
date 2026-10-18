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

## 発展：REST API の基礎（URI・CRUD・PUT と PATCH）

ネットワークコントローラ（Catalyst Center など）の API を例に、REST API の特徴・URI の構造・HTTP メソッドと CRUD の対応を整理します。

### REST APIの基礎：特徴・URI・HTTPメソッドとCRUD

#### API と REST

**API（Application Programming Interface）** は、プログラム同士がやり取りするための窓口です。人が GUI や CLI を操作する代わりに、プログラムが API を呼び出して情報取得や設定変更を行います。

**REST（REpresentational State Transfer）** は、**HTTP を使った API の設計方式** です。REST の考え方に沿った API を REST API（RESTful API）と呼びます。Catalyst Center のノースバウンドAPI や RESTCONF などで使われます。

REST では、リクエストを次の2つで表します。

- **どのリソースに** → **URI**（例：`/api/v1/network-device`）
- **何をするか** → **HTTP メソッド**（例：`GET`）

#### REST の主な特徴

| 特徴 | 説明 |
| --- | --- |
| **ステートレス** | サーバは **前のリクエストの状態を保持しない**。1つ1つのリクエストに、処理に必要な情報（**認証情報** など）をすべて含める |
| クライアント／サーバ | クライアント（スクリプト等）がリクエストし、サーバ（コントローラ等）が応答する |
| 統一インターフェース | リソースを URI で識別し、HTTP メソッドで操作する |
| キャッシュ可能 | 応答がキャッシュ可能かどうかを示せる |
| 階層化システム | 間にプロキシやロードバランサがあってもよい |

**なぜステートレスが嬉しいのか**：サーバがクライアントごとのセッション状態を覚えていなくてよいので、どのサーバがリクエストを受けても処理できます。結果として **負荷分散がしやすく、構成をシンプルにできます**。代わりに、毎回のリクエストにトークンなどの認証情報を付ける必要があります。

その他の重要事項：

- REST API は **HTTP/HTTPS を使うので、TCP 上で動作**します（HTTPS は通常 TCP 443）。「必ず UDP を使う」は誤り。
- データ形式は **JSON がよく使われる** が、**XML など他の形式も使える**。「XML しか使えない」は誤り。

#### URI の構造

```
 GET https://controller.example.com/api/v1/network-device?family=Switches
     └─┬─┘   └────────┬──────────┘ └────────┬─────────┘ └──────┬───────┘
     スキーム        ホスト                 パス           クエリパラメータ
   （プロトコル）  （サーバ）    （操作の対象となるリソース） （絞り込み条件）
```

| 部分 | 例 | 意味 |
| --- | --- | --- |
| スキーム | `https` | 通信方式 |
| ホスト | `controller.example.com` | API サーバ（コントローラ） |
| パス | `/api/v1/network-device` | **操作の対象となるリソース**（ここではネットワーク機器の一覧） |
| クエリパラメータ | `?family=Switches` | 条件による絞り込み（`?キー=値`、複数は `&` で連結） |

- パスに `v1` のような **バージョン** を入れておくと、API の仕様が変わっても古いバージョンを使い続けられます。
- **操作の種類は URI ではなく HTTP メソッド** で表します。
- **認証情報は URI に含めず、HTTP ヘッダ**（`Authorization` など）で送るのが通常です。
- **希望する応答のデータ形式は `Accept` ヘッダ** などで指定します。

#### HTTP メソッドと CRUD

データに対する基本操作 **Create（作成）・Read（取得）・Update（更新）・Delete（削除）** をまとめて **CRUD** と呼びます。REST では CRUD を HTTP メソッドに対応させます。

| CRUD | HTTP メソッド | 動作 | データを変更するか |
| --- | --- | --- | --- |
| **C**reate | **POST** | 新しいリソースを作成 | する |
| **R**ead | **GET** | リソースを取得 | **しない** |
| **U**pdate | **PUT** | 既存リソースを **全体置き換え** | する |
| **U**pdate | **PATCH** | 既存リソースの **一部の項目だけ** 更新 | する |
| **D**elete | **DELETE** | リソースを削除 | する |

##### PUT と PATCH の違い

元のリソース：

```json
{"vlan": 10, "name": "Sales", "description": "3F"}
```

**PATCH** で `name` だけを送る → 送った項目だけ変わる：

```http
PATCH /api/v1/vlans/10
Content-Type: application/json

{"name": "Sales-JP"}
```

結果：`{"vlan": 10, "name": "Sales-JP", "description": "3F"}`

**PUT** で同じように一部だけ送る → リソース全体が送った内容で置き換わる：

```http
PUT /api/v1/vlans/10
Content-Type: application/json

{"vlan": 10, "name": "Sales-JP"}
```

結果：`{"vlan": 10, "name": "Sales-JP"}` ← **送らなかった description は消えたり初期値に戻ったりする**

つまり PUT と PATCH の違いは **更新の範囲が全体か一部か** です。

#### リクエストと応答の例

機器一覧を取得する（Read）：

```http
GET /api/v1/network-device HTTP/1.1
Host: controller.example.com
Accept: application/json
X-Auth-Token: eyJ0eXAiOiJKV1Qi...
```

応答：

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "response": [
    {"hostname": "SW1", "managementIpAddress": "10.1.1.11", "family": "Switches and Hubs"},
    {"hostname": "R1",  "managementIpAddress": "10.1.1.1",  "family": "Routers"}
  ]
}
```

Python（requests ライブラリ）で書くと次のようになります。

```python
import requests

url = "https://controller.example.com/api/v1/network-device"
headers = {"Accept": "application/json", "X-Auth-Token": token}
r = requests.get(url, headers=headers)
if r.status_code == 200:          # ステータスコードで成功を判定（[[13HTTPステータスコード]]）
    for dev in r.json()["response"]:
        print(dev["hostname"])
```

#### ひっかけポイント・よくある誤解

- 取得は **GET**。POST（作成）、PUT（更新・置き換え）、DELETE（削除）と混同しない。
- 一部だけ更新は **PATCH**。PUT は全体置き換えで、送らなかった項目は消えたり初期値に戻ったりする。
- GET は **データを変更しない**。
- 「サーバがセッション状態を保持し続ける」はステートフルの説明。REST は **ステートレス**。
- 「REST は必ず UDP」は誤り。**HTTP/HTTPS ＝ TCP**。
- 「XML しか使えない」は誤り。**JSON が主流**、XML も可。
- URI のパスは **リソース**。操作の種類（メソッド）、認証情報（ヘッダ）、応答形式（Accept ヘッダ）ではない。

#### 押さえておくポイント

- REST ＝ HTTP ベース、**ステートレス**、URI でリソース、メソッドで操作。
- CRUD：**Create=POST / Read=GET / Update=PUT(全体)・PATCH(一部) / Delete=DELETE**。
- URI：スキーム・ホスト・パス・クエリ。パスにバージョン（v1）を含めることが多い。

## まとめ
- HTTPメソッドは**動詞**、URLは**名詞（リソース）**
- **冪等性と安全性**を意識すると設計が整う
- RESTは**リソース指向**の設計原則
- 正しいメソッドとステータスコードの組み合わせでAPIは読みやすくなる

次章では、通信のメタデータを伝える**HTTPヘッダー**を学びます。
