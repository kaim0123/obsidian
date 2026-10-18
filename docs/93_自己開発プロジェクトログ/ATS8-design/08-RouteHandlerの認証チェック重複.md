# 08. Route Handler の認証チェック重複

## design.md の指摘（✅ 対応済み）

> **各 Route Handler で認証チェックを毎回ベタ書き**
>
> `requireUser(supabase)`（`src/lib/supabase/require-user.ts`）に集約。

---

## 基礎知識：Route Handler とは？

Next.js App Router では **`src/app/api/**/route.ts`** が API エンドポイントです。

```
GET  /api/candidates     → src/app/api/candidates/route.ts
POST /api/events         → src/app/api/events/route.ts
```

ブラウザや TanStack Query から `fetch('/api/candidates')` すると、ここが実行されます。

**認証が必要な API** では、「ログインしているユーザーだけ」にデータを返す必要があります。

---

## 何が間違っていたか

### 問題：26個の API すべてに同じコードがコピペされていた

```typescript
// 以前：各 route.ts に繰り返し（悪い例）
export async function GET() {
  const supabase = await createRouteHandlerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ここから本来の処理...
}
```

**26ルート × 5〜10行 = 130〜260行の重複** です。

### なぜ問題か

1. **401 レスポンスの形式がバラバラ** — ある API は `{ error: 'Unauthorized' }`、別の API は `{ message: '...' }`
2. **getUser vs getSession** — 片方だけ古い API を使うとセキュリティホール
3. **認証ロジック変更が大変** — 例: ロールチェックを追加したい → 26ファイル修正
4. **可読性** — 本質的な DB 操作の前に毎回同じ boilerplate

---

## どう修正すべきか

### 1. `requireUser` ヘルパーを作る

```typescript
// src/lib/supabase/require-user.ts

import { AuthenticationError } from '@/lib/errors'

export async function requireUser(supabase) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthenticationError()  // 統一されたエラー型
  }

  return user  // 必要なら user.id 等を使える
}
```

### 2. Route Handler では1行で呼ぶ

```typescript
// 修正後（良い例）
export async function GET() {
  const supabase = await createRouteHandlerClient()
  await requireUser(supabase)  // 未認証なら例外 → handleApiError で 401

  const { data } = await supabase.from('candidates').select('*')
  return NextResponse.json({ data })
}
```

ユーザー情報が必要な場合:

```typescript
const user = await requireUser(supabase)
// user.id で「誰が操作したか」を記録
```

### 3. エラーは `handleApiError` で統一

```typescript
// lib/errors.ts
export class AuthenticationError extends AppError {
  constructor() {
    super('認証が必要です', 401)
  }
}

// route.ts
try {
  await requireUser(supabase)
  // ...
} catch (error) {
  return handleApiError(error)  // 401, 404, 500 を統一フォーマットで返す
}
```

---

## 認証の多層防御（おさらい）

| 層 | 仕組み | ファイル |
|----|--------|----------|
| 画面 | middleware | `src/middleware.ts` |
| API | `requireUser` | 各 `route.ts` |
| DB | RLS | Supabase ポリシー |

**API 層の requireUser は middleware があっても必要** — API は curl や Postman から直接叩けるため。

---

## まとめ

| 間違い | 修正 |
|--------|------|
| 各 API に認証コードコピペ | `requireUser(supabase)` に集約 |
| 401 レスポンスが不統一 | `AuthenticationError` + `handleApiError` |
| ユーザー情報の取り方がバラバラ | `requireUser` の戻り値 `User` を利用 |

**学び**: **横断的関心事**（認証・ログ・エラー処理）はヘルパーに抽出する。API の本体はビジネスロジックだけ書く。
