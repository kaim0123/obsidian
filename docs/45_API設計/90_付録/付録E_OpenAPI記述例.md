# 付録E　OpenAPI 記述例（TODO API）

最小限の **OpenAPI 3.0** YAML 例です。[[01_ケーススタディ_TODO_API]] の題材に対応しています。

---

## ファイル例: `openapi.yaml`

```yaml
openapi: 3.0.3
info:
  title: TODO API
  version: 1.0.0
  description: シンプルな TODO 管理 API

servers:
  - url: https://api.example.com/v1

paths:
  /todos:
    get:
      summary: TODO 一覧
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        "200":
          description: 成功
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/TodoList"
    post:
      summary: TODO 作成
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/TodoCreate"
      responses:
        "201":
          description: 作成成功
          headers:
            Location:
              schema:
                type: string
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Todo"

  /todos/{todoId}:
    parameters:
      - $ref: "#/components/parameters/TodoId"
    get:
      summary: TODO 1 件取得
      responses:
        "200":
          description: 成功
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Todo"
        "404":
          $ref: "#/components/responses/NotFound"
    patch:
      summary: TODO 部分更新
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/TodoUpdate"
      responses:
        "200":
          description: 更新成功
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Todo"
        "404":
          $ref: "#/components/responses/NotFound"
    delete:
      summary: TODO 削除
      responses:
        "204":
          description: 削除成功
        "404":
          $ref: "#/components/responses/NotFound"

components:
  parameters:
    TodoId:
      name: todoId
      in: path
      required: true
      schema:
        type: string
        format: uuid

  schemas:
    Todo:
      type: object
      required: [id, title, completed, created_at]
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
          maxLength: 200
        completed:
          type: boolean
        created_at:
          type: string
          format: date-time
    TodoCreate:
      type: object
      required: [title]
      properties:
        title:
          type: string
          maxLength: 200
    TodoUpdate:
      type: object
      properties:
        title:
          type: string
          maxLength: 200
        completed:
          type: boolean
    TodoList:
      type: object
      required: [items, meta]
      properties:
        items:
          type: array
          items:
            $ref: "#/components/schemas/Todo"
        meta:
          type: object
          properties:
            page:
              type: integer
            limit:
              type: integer
            total:
              type: integer
    Error:
      type: object
      required: [code, message]
      properties:
        code:
          type: string
        message:
          type: string

  responses:
    NotFound:
      description: リソースが存在しない
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          example:
            code: TODO_NOT_FOUND
            message: Todo not found

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
```

---

## ポイント

| 項目 | この例での扱い |
|------|---------------|
| バージョン | `servers.url` に `/v1` |
| リソース | 複数形 `/todos` |
| 部分更新 | PATCH + `TodoUpdate` |
| 一覧 | `items` + `meta` ラッパー |
| エラー | 共通 `Error` スキーマ |
| 認証 | `bearerAuth` を全体に適用 |

---

## 関連ツール

- [Swagger Editor](https://editor.swagger.io/) — YAML のプレビュー
- [Redoc / Swagger UI](https://openapi.tools/) — ドキュメント HTML 生成

---

→ [[01_OpenAPIとドキュメント]]
