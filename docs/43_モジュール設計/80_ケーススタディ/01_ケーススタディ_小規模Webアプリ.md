# ケーススタディ：小規模 Web アプリ

## この章の目的

**ブログ + コメント** の小規模 Web アプリを題材に、モジュール分割から実装までを **手順どおり** 体験します。

---

## 1. 要件の整理

| 機能 | 説明 |
|------|------|
| 記事一覧・詳細 | 公開済み記事の表示 |
| 記事作成・編集 | 認証ユーザーのみ |
| コメント投稿 | 記事に対するコメント |
| 認証 | ログイン / ログアウト |

```text
  アクター
  ・訪問者（閲覧・コメント）
  ・著者（記事 CRUD）
```

非機能: 小規模（同時ユーザー数百）、単一 DB、モノリスデプロイ。

---

## 2. モジュール候補の洗い出し

名詞・責務から候補を出します。

| モジュール | 責務（1 文） |
|-----------|-------------|
| `article` | 記事の作成・公開・表示 |
| `comment` | 記事へのコメント管理 |
| `auth` | ユーザー認証・セッション |
| `web` | HTTP ルーティング・レスポンス |

```text
  依存（想定）
  web → article, comment, auth
  comment → article（記事 ID 参照）
  article → auth（著者 ID 参照、インターフェース経由）
```

---

## 3. 依存関係の設計

```text
        web
       / | \
      ▼  ▼  ▼
  article comment auth
      ↑
  comment（articleId のみ参照）
```

| ルール | 適用 |
|--------|------|
| domain は infra 非依存 | article/domain に ORM なし |
| 循環禁止 | comment → article のみ（逆なし） |
| auth の詳細を漏らさない | `CurrentUser` インターフェース |

---

## 4. インターフェース定義

```typescript
// article モジュール公開 API
interface ArticleService {
  listPublished(): Promise<ArticleSummary[]>;
  getById(id: ArticleId): Promise<Article | null>;
  create(cmd: CreateArticleCommand, author: UserId): Promise<ArticleId>;
}

// comment モジュール公開 API
interface CommentService {
  listByArticle(articleId: ArticleId): Promise<Comment[]>;
  post(articleId: ArticleId, body: string, author: UserId): Promise<CommentId>;
}
```

---

## 5. 実装と振り返り

### ディレクトリ（例）

```text
src/
  article/  domain/ application/ infra/ index.ts
  comment/  domain/ application/ infra/ index.ts
  auth/     domain/ application/ infra/ index.ts
  web/      controllers/ middleware/
```

### 振り返りチェック

- [ ] 各モジュールを 1 文で説明できるか
- [ ] 記事公開ルール変更は `article` だけか
- [ ] テスト: article domain は DB なしで実行できるか
- [ ] `common` に逃げていないか

→ 次は [[02_ケーススタディ_業務システム]] で規模を上げます。

---

## まとめ

- 小規模でも **article / comment / auth / web** と分けると見通しが良い
- **依存は一方向**、ID 参照でモジュール間をつなぐ
- **公開 API を先に定義** してから実装
- 振り返りで [[010Programming/43_モジュール設計/90_付録/付録B_チェックリスト]] を使う

### 次に進む章

→ [[02_ケーススタディ_業務システム]]
