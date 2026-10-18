# ケーススタディ：TODO API

## この章の目的

これまで学んだ設計を、シンプルな TODO API に統合する演習章です。

---

## 1. 要件の整理

**TODO API** の要件を整理します。

| 機能 | 説明 |
|------|------|
| 認証 | ログインユーザーの TODO のみ操作 |
| CRUD | 作成・一覧・詳細・更新・削除 |
| 完了トグル | 完了 / 未完了の切り替え |
| 一覧 | ページネーション、完了フィルタ |

**非機能**

- ベース URL: `https://api.example.com/v1`
- JSON、`snake_case`、日時は ISO 8601 UTC
- Bearer Token 認証

---

## 2. リソースと URL の設計

| リソース | URL | 説明 |
|---------|-----|------|
| TODO（コレクション） | `/todos` | 一覧・作成 |
| TODO（単一） | `/todos/{id}` | 詳細・更新・削除 |
| 現在ユーザー | `/me` | プロフィール確認用 |

```text
  User 1 ── owns ──→ Todo × n

  /me          … 認証確認
  /todos       … 自分の TODO コレクション
  /todos/{id}  … 単一 TODO（所有者チェック）
```

ネストは **浅く** — `/users/{id}/todos` より `/todos` + 認可で十分です。

---

## 3. CRUD エンドポイントの定義

| メソッド | パス | 説明 | 成功 |
|---------|------|------|------|
| GET | `/v1/todos` | 一覧（`?completed=&page=&limit=`） | 200 |
| POST | `/v1/todos` | 作成 | 201 |
| GET | `/v1/todos/{id}` | 詳細 | 200 |
| PATCH | `/v1/todos/{id}` | 部分更新（title, completed） | 200 |
| DELETE | `/v1/todos/{id}` | 削除 | 204 |

**作成リクエスト**

```http
POST /v1/todos HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{"title": "牛乳を買う"}
```

**作成レスポンス**

```json
{
  "data": {
    "id": 42,
    "title": "牛乳を買う",
    "completed": false,
    "created_at": "2026-06-19T10:00:00Z",
    "updated_at": "2026-06-19T10:00:00Z"
  }
}
```

**一覧レスポンス**

```json
{
  "data": [
    {"id": 42, "title": "牛乳を買う", "completed": false}
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

---

## 4. エラー・認証の設計

| 状況 | ステータス | code |
|------|-----------|------|
| トークンなし | 401 | `UNAUTHORIZED` |
| 他人の todo | 403 | `FORBIDDEN` |
| 存在しない id | 404 | `NOT_FOUND` |
| title 空 | 422 | `VALIDATION_ERROR` |

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に問題があります",
    "details": [
      {"field": "title", "message": "1 文字以上必要です"}
    ],
    "request_id": "req_xyz789"
  }
}
```

認可は **todo の owner_id == トークンの user_id** で統一します。

---

## 5. OpenAPI 草案と振り返り

```yaml
openapi: 3.0.3
info:
  title: Todo API
  version: 1.0.0
paths:
  /v1/todos:
    get:
      security: [{ bearerAuth: [] }]
      parameters:
        - name: completed
          in: query
          schema: { type: boolean }
        - name: page
          in: query
          schema: { type: integer, default: 1 }
      responses:
        '200':
          description: TODO 一覧
    post:
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [title]
              properties:
                title: { type: string, minLength: 1 }
      responses:
        '201':
          description: 作成成功
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

**振り返りチェック**

| テーマ | 本章での適用 |
|--------|------------|
| REST | `/todos` リソース + HTTP メソッド |
| エラー | 統一 JSON + request_id |
| 認証認可 | Bearer + 所有者チェック |
| Pagination | page / limit / meta |

---

## まとめ

- 要件の整理
- リソースと URL の設計
- CRUD エンドポイントの定義
- エラー・認証の設計
- OpenAPI 草案と振り返り

### 次に進む章

→ [[02_ケーススタディ_EC注文API]]
