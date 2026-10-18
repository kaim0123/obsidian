# 付録F　参考図解

API 設計でよく使う ASCII 図のテンプレートです。Obsidian やホワイトボードに転記して使えます。

---

## 1. HTTP リクエスト／レスポンスの流れ

```text
  Client                          Server
    │                                │
    │  GET /users/1                  │
    │  Accept: application/json      │
    │  Authorization: Bearer ***     │
    │ ─────────────────────────────→ │
    │                                │ 認証・認可
    │                                │ ビジネス処理
    │                                │ DB アクセス
    │  200 OK                        │
    │  Content-Type: application/json│
    │  { "id": "1", "name": "..." }  │
    │ ←───────────────────────────── │
    │                                │
```

---

## 2. REST リソースと HTTP メソッド

```text
  /users
    │
    ├─ GET    → 一覧取得
    ├─ POST   → 新規作成
    │
    └─ /{id}
         ├─ GET    → 1 件取得
         ├─ PUT    → 全体置換
         ├─ PATCH  → 部分更新
         └─ DELETE → 削除

  URL = 名詞（リソース）  /  HTTP メソッド = 操作
```

---

## 3. 認証・認可フロー（Bearer Token）

```text
  Client                    Auth Server              Resource API
    │                            │                        │
    │  POST /oauth/token           │                        │
    │  (client_id, secret)         │                        │
    │ ──────────────────────────→  │                        │
    │  access_token (JWT)          │                        │
    │ ←──────────────────────────  │                        │
    │                            │                        │
    │  GET /orders                 │                        │
    │  Authorization: Bearer JWT   │                        │
    │ ────────────────────────────────────────────────────→  │
    │                            │      トークン検証         │
    │                            │      権限チェック         │
    │  200 / 401 / 403             │                        │
    │ ←────────────────────────────────────────────────────  │
```

---

## 4. バージョニング（URL パス方式）

```text
  /v1/users  ──→ 既存クライアント（保守のみ）
       │
       │ 破壊的変更が必要
       ▼
  /v2/users  ──→ 新クライアント
       │
       ├─ v1 は deprecation 告知
       └─ 一定期間後に v1 廃止
```

---

## 5. ページネーション（offset 方式）

```text
  GET /todos?page=2&limit=20

  ┌──────────────────────────────────────┐
  │ meta: { page: 2, limit: 20, total }  │
  │ items: [ todo_21 .. todo_40 ]        │
  └──────────────────────────────────────┘
```

---

## 6. エラー設計のレイヤー

```text
  HTTP ステータス  … 結果の大分類（404, 422）
        │
        ▼
  error.code       … 機械可読（USER_NOT_FOUND）
        │
        ▼
  error.message    … 人間向け短文
        │
        ▼
  error.details    … フィールド単位（任意）
```

---

## 7. API 設計の階層での位置

```text
  ソフトウェア設計 → モジュール設計
                            │
                            ▼
                       API 設計（本教材）
                            │
                            ▼
                      クラス設計 → メソッド設計
```

---

→ [[01_HTTPの基本]] / [[01_RESTの考え方]]
