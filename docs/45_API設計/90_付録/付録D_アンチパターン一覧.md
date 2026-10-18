# 付録D　API 設計アンチパターン一覧

よく見る悪い例と、改善の方向性です。

---

## 1. URL に動詞を載せる

**悪い例**

```http
POST /getUserById
POST /createOrder
GET  /deleteTodo?id=5
```

**良い例**

```http
GET    /users/{id}
POST   /orders
DELETE /todos/{id}
```

---

## 2. すべて 200 OK + success フラグ

**悪い例**

```json
HTTP/1.1 200 OK
{ "success": false, "error": "Not found" }
```

**良い例**

```json
HTTP/1.1 404 Not Found
{ "code": "USER_NOT_FOUND", "message": "User not found" }
```

---

## 3. エンドポイントごとに JSON 形式がバラバラ

**悪い例**

```json
GET /users/1     → { "user": { ... } }
GET /orders/1    → { "data": { ... } }
GET /products/1  → { ... }   // ラッパーなし
```

**良い例**

```json
GET /users/1  → { "id": "...", "name": "..." }
GET /orders/1 → { "id": "...", "total": 1000 }
// 単一リソースは同じ「フラット or ラッパー」規則で統一
```

---

## 4. 401 と 403 の混同

**悪い例**

- トークン期限切れ → 403
- ログインしていない → 403

**良い例**

- 認証情報なし・無効 → **401** + `WWW-Authenticate` 等
- 認証済みだが操作不可 → **403**

---

## 5. 破壊的変更を黙ってリリース

**悪い例**

- `email` フィールドを突然 `mail_address` に改名
- 必須フィールドを追加し古いクライアントが 400 連発

**良い例**

- 新フィールド追加（旧フィールドも当面維持）
- `/v2/` 導入 + deprecation 告知 + 移行期限

---

## 6. ページネーションなしの巨大一覧

**悪い例**

```http
GET /users   → 10 万件を一度に返す
```

**良い例**

```http
GET /users?page=2&limit=20
GET /users?cursor=eyJpZCI6MTIzfQ&limit=20
```

---

## 7. 内部実装の漏洩

**悪い例**

```json
{
  "error": "SQLException: duplicate key users_pkey",
  "stack_trace": "..."
}
```

**良い例**

```json
{
  "code": "EMAIL_ALREADY_EXISTS",
  "message": "This email is already registered"
}
```

---

## 8. GET に副作用

**悪い例**

```http
GET /orders/5/cancel
GET /sendVerificationEmail?user=1
```

**良い例**

```http
POST /orders/5/cancel
POST /users/1/verification-emails
```

---

## 9. トークンを URL クエリに載せる

**悪い例**

```http
GET /users/me?access_token=SECRET
```

**良い例**

```http
GET /users/me
Authorization: Bearer SECRET
```

---

## 10. ドキュメントと実装の不一致

**症状**: OpenAPI では `name` 必須、実装は `title` を期待  
**対策**: OpenAPI を **単一の真実** にし、CI で契約テスト（[[02_APIのテスト]]）

---

→ [[010Programming/45_API設計/90_付録/付録B_チェックリスト]] / [[05_API設計の原則]]
