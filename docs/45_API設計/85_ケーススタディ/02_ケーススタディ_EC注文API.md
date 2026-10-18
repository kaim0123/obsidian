# ケーススタディ：EC注文 API

## この章の目的

EC サイトの注文まわりを題材に、ネスト・ページネーション・互換性の判断を統合する章です。

---

## 1. 注文・商品・カートのリソース設計

| リソース | URL | 備考 |
|---------|-----|------|
| 商品 | `/v1/products` | 公開カタログ |
| カート | `/v1/carts/me` | ログインユーザーのカート |
| カート明細 | `/v1/carts/me/items` | 行の追加・更新 |
| 注文 | `/v1/orders` | 確定後の注文 |
| 注文明細 | `/v1/orders/{id}/items` | 読み取り専用 |

```text
  Product（カタログ）
       ↑
  CartItem ── belongs to ── Cart（me）
       │
       checkout
       ↓
  Order ── has many ── OrderItem
```

カートは **セッション中の作業領域**、注文は **確定後の記録** として分けます。

---

## 2. ネストと関連リソース

**エンドポイント一覧（主要操作）**

| メソッド | パス | 説明 | 成功 |
|---------|------|------|------|
| GET | `/v1/products` | 商品一覧 | 200 |
| GET | `/v1/products/{id}` | 商品詳細 | 200 |
| GET | `/v1/carts/me` | 自分のカート | 200 |
| POST | `/v1/carts/me/items` | カートに追加 | 201 |
| PATCH | `/v1/carts/me/items/{item_id}` | 数量変更 | 200 |
| DELETE | `/v1/carts/me/items/{item_id}` | 行削除 | 204 |
| POST | `/v1/orders` | カートから注文確定 | 201 |
| GET | `/v1/orders` | 注文履歴一覧 | 200 |
| GET | `/v1/orders/{id}` | 注文詳細 | 200 |
| GET | `/v1/orders/{id}/items` | 明細一覧 | 200 |

**カート追加例**

```http
POST /v1/carts/me/items HTTP/1.1
Authorization: Bearer <token>
Idempotency-Key: cart-add-550e8400-e29b-41d4-a716
Content-Type: application/json

{"product_id": "prod_abc", "quantity": 2}
```

**注文確定例**

```http
POST /v1/orders HTTP/1.1
Authorization: Bearer <token>
Idempotency-Key: order-7c9e6679-7425-40de-944b-e07fc1f90ae7
Content-Type: application/json

{"shipping_address_id": "addr_123", "payment_method_id": "pm_456"}
```

---

## 3. ページネーションと検索

**商品一覧**

```http
GET /v1/products?q=コーヒー&category=drink&sort=price&order=asc&page=1&limit=20
```

```json
{
  "data": [
    {
      "id": "prod_abc",
      "name": "ドリップコーヒー",
      "price": 980,
      "currency": "JPY",
      "in_stock": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

**注文履歴（カーソル方式）**

```http
GET /v1/orders?cursor=ord_cursor_xyz&limit=10
```

```json
{
  "data": [{"id": "ord_99", "status": "shipped", "total": 1960}],
  "meta": {
    "has_more": true,
    "next_cursor": "ord_cursor_abc"
  }
}
```

| API | 方式 | 理由 |
|-----|------|------|
| 商品検索 | オフセット | ページ番号 UI と相性が良い |
| 注文履歴 | カーソル | リアルタイム追加があり offset ずれを防ぐ |

---

## 4. バージョニングと後方互換性の判断

**シナリオ**: 注文レスポンスに **`tracking_number`（配送追跡番号）** を追加したい。

| 変更 | 判断 | 理由 |
|------|------|------|
| `tracking_number` 追加 | 後方互換 OK | 任意フィールド |
| `status` を数値 → 文字列に変更 | 破壊的 | クライアントの switch が壊れる |
| `/v1/orders/list` を廃止 | Deprecation → Sunset | `/v1/orders` に統一 |

```json
// v1.1 — 後方互換な追加
{
  "data": {
    "id": "ord_99",
    "status": "shipped",
    "total": 1960,
    "tracking_number": "JP123456789"
  }
}
```

数値 `status` から文字列への変更が必要なら **`/v2/orders`** を新設し、v1 は 6 ヶ月並行します。

---

## 5. よくある設計ミスと修正

| ミス | 問題 | 修正 |
|------|------|------|
| `POST /createOrder` | REST から逸脱 | `POST /v1/orders` |
| カートと注文が同一テーブル | 状態が混線 | リソース分離 |
| 注文 POST に Idempotency-Key なし | 二重課金 | ヘッダ必須化 |
| 他人の注文が GET できる | 認可漏れ | owner チェック + 403/404 方針 |
| 商品一覧が無制限 | タイムアウト | limit 上限（例: 100） |

```text
  設計レビューで指摘 → OpenAPI 更新 → 契約テスト追加
```

本章の API は [[010Programming/45_API設計/90_付録/付録B_チェックリスト]] で最終確認してください。

---

## まとめ

- 注文・商品・カートのリソース設計
- ネストと関連リソース
- ページネーションと検索
- バージョニングと後方互換性の判断
- よくある設計ミスと修正

### 次に進む章

→ 本教材完了後は [[MOC_クラス設計体系|44_クラス設計]] → [[010Programming/46_メソッド設計/00_全体像/目次|46_メソッド設計/目次]] へ進んでください。
