# OpenAPIとドキュメント

## この章の目的

API ドキュメントを設計の一部として扱い、OpenAPI で契約を共有する方法を学ぶ章です。

---

## 1. なぜドキュメントが設計の一部か

API の **契約** はコードだけでは伝わりません。ドキュメントは設計の **公開面** です。

| ドキュメントなし | ドキュメントあり |
|----------------|----------------|
| Slack で「この API どう使う？」 | 自己完結で試せる |
| 実装と説明がズレる | レビュー時に契約を議論できる |
| 新メンバーの onboarding が遅い | クライアントが並行開発できる |

> **良い API = 良いドキュメント** とセットで考えます。

---

## 2. OpenAPI（Swagger）の基本

**OpenAPI** は API を **YAML / JSON** で記述する標準フォーマットです。

```yaml
openapi: 3.0.3
info:
  title: Todo API
  version: 1.0.0
paths:
  /v1/todos:
    get:
      summary: TODO 一覧
      responses:
        '200':
          description: 成功
```

| 要素 | 役割 |
|------|------|
| `paths` | エンドポイント定義 |
| `components/schemas` | 共通 JSON スキーマ |
| `securitySchemes` | 認証方式 |

Swagger UI 等で **ブラウザから試せる** ドキュメントを自動生成できます。

---

## 3. スキーマ定義とレビューへの活用

```yaml
components:
  schemas:
    Todo:
      type: object
      required: [id, title, completed]
      properties:
        id:
          type: integer
        title:
          type: string
        completed:
          type: boolean
```

設計レビューでは OpenAPI を **議論のたたき台** にします。

```text
  設計案 → OpenAPI 草案 → レビュー → 実装
                ↑__________________|
                    ズレたら戻る
```

フィールドの **必須 / 任意** を OpenAPI 上で明示すると、後方互換の議論がしやすくなります。

---

## 4. サンプルリクエスト・レスポンスの書き方

```yaml
/v1/todos/{id}:
  get:
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
    responses:
      '200':
        content:
          application/json:
            example:
              data:
                id: 1
                title: "牛乳を買う"
                completed: false
      '404':
        content:
          application/json:
            example:
              error:
                code: NOT_FOUND
                message: "指定された TODO が見つかりません"
```

| 書くべき例 | 理由 |
|-----------|------|
| 成功 200/201 | 正常形の理解 |
| 400/422 | バリデーションエラー |
| 401/403 | 認証・認可 |
| 404 | 存在しないリソース |

---

## 5. ドキュメントと実装のズレを防ぐ

| 手法 | 説明 |
|------|------|
| OpenAPI First | 先に YAML を書き、実装はそれに従う |
| Code First + 生成 | コードから OpenAPI を自動生成 |
| CI で diff チェック | 実装変更時にドキュメント更新を強制 |

```text
  PR マージ条件
       │
       ├─ OpenAPI 更新あり
       ├─ 破壊的変更は CHANGELOG + バージョン議論
       └─ サンプルが実行可能（Swagger Try it out）
```

詳細な記述例は [[010Programming/45_API設計/90_付録/付録E_OpenAPI記述例]] を参照してください。

---

## まとめ

- なぜドキュメントが設計の一部か
- OpenAPI（Swagger）の基本
- スキーマ定義とレビューへの活用
- サンプルリクエスト・レスポンスの書き方
- ドキュメントと実装のズレを防ぐ

### 次に進む章

→ [[02_APIのテスト]]
