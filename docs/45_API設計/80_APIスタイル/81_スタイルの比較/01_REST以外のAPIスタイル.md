# REST以外のAPIスタイル

## この章の目的

REST 以外の API スタイルの特徴と、どう選ぶかを学ぶ章です。

---

## 1. GraphQL — 必要なデータだけ取得

**GraphQL** は 1 つのエンドポイントに **クエリ言語** で欲しいフィールドを指定します。

```graphql
query {
  user(id: "42") {
    name
    todos(status: OPEN) { title }
  }
}
```

| REST | GraphQL |
|------|---------|
| エンドポイント多数 | 基本 1 URL（`/graphql`） |
| 過不足 fetch | 必要なフィールドだけ |
| キャッシュ（HTTP）が効きやすい | キャッシュ設計が別途必要 |

モバイルで **通信量削減** が重要なときに選ばれます。

---

## 2. RPC 風 API — `/users/search` のような操作指向

**RPC（Remote Procedure Call）風** は URL に **動詞** が入る形式です。

```http
POST /v1/users/search
POST /v1/orders/cancel
POST /v1/reports/generate
```

| REST 風 | RPC 風 |
|---------|--------|
| `GET /v1/users?q=taro` | `POST /v1/users/search` |
| リソース中心 | 操作中心 |

複雑な検索・バッチ処理では RPC 風の方が **分かりやすい** こともあります。  
ただし **[[03_検索と複合操作]]** の「REST らしくない操作」は、チーム内で命名ルールを統一してください。

---

## 3. Webhook — サーバーからクライアントへの通知

**Webhook** は、イベント発生時に **クライアントの URL へ POST** します。

```text
  注文完了（サーバー）
       │
       └── POST https://partner.example.com/hooks/order-completed
               Body: {"order_id": "ord-99", "status": "paid"}
```

| ポーリング | Webhook |
|-----------|---------|
| クライアントが定期 GET | サーバーが push |
| 実装が簡単 | 署名検証・再送設計が必要 |

`X-Signature` でペイロード署名を検証し、**冪等処理**（同じ event_id は 1 回だけ）を実装します。

---

## 4. gRPC の概要（高性能な内部連携）

**gRPC** は Protocol Buffers + HTTP/2 による **高性能 RPC** です。

| 用途 | 向き |
|------|------|
| マイクロサービス間 | ◎ 低レイテンシ・型安全 |
| ブラウザ公開 API | △ ツールチェーンが REST より重い |
| ストリーミング | ◎ 双方向通信 |

```text
  外部公開 API  →  REST / JSON（汎用性）
  内部サービス間  →  gRPC（性能・契約の厳密さ）
```

初心者は **REST をマスターしてから** gRPC を検討すれば十分です。

---

## 5. スタイルの選び方と混在のリスク

| 要件 | 候補 |
|------|------|
| 公開 CRUD API | REST |
| 複雑な画面向けデータ取得 | GraphQL |
| イベント連携 | Webhook |
| 内部高性能通信 | gRPC |

```text
  混在のリスク
       │
       ├─ 認証方式がバラバラ
       ├─ エラー形式がエンドポイントごとに違う
       └─ ドキュメントが分散
```

**1 プロダクト内でも「公開面は REST で統一」** など、ルールを決めてからスタイルを増やします。

---

## まとめ

- GraphQL — 必要なデータだけ取得
- RPC 風 API — `/users/search` のような操作指向
- Webhook — サーバーからクライアントへの通知
- gRPC の概要（高性能な内部連携）
- スタイルの選び方と混在のリスク

### 次に進む章

→ [[01_ケーススタディ_TODO_API]]（GraphQL を深掘りするなら [[00_GraphQL入門ガイド]]）
