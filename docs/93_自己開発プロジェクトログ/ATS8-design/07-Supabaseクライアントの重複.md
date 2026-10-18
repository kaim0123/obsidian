# 07. Supabase クライアント生成関数の重複

## design.md の指摘（✅ 対応済み）

> **Supabase クライアント生成関数が2つほぼ同一**
>
> `createServerSupabaseClient({ mutableCookies })` に統合。`createRouteHandlerClient` は `{ mutableCookies: true }` を渡す薄いラッパとして残置。

---

## 基礎知識：Supabase クライアントとは？

Supabase と通信するには **クライアントオブジェクト** を作る必要があります。

```typescript
const supabase = createServerClient(url, key, { cookies: ... })
await supabase.from('candidates').select('*')
```

Next.js では **実行場所によって cookie の扱いが違う** ため、クライアントの作り方も変わります。

| 実行場所 | cookie の読み書き |
|----------|------------------|
| **Server Component** | 読み取りのみ（書き込みは try/catch で無視） |
| **Route Handler（API）** | 読み書き両方（セッション更新に必要） |
| **middleware** | Request/Response 経由で読み書き |

---

## 何が間違っていたか

### 問題：ほぼ同じ関数が2つあった

```typescript
// 以前（悪い例）
async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(url, key, {
    cookies: { get, set, remove }  // 50行...
  })
}

async function createRouteHandlerClient() {
  const cookieStore = await cookies()
  return createServerClient(url, key, {
    cookies: { get, set, remove }  // ほぼ同じ50行...
  })
}
```

**違いは「cookie を書き換えられるか」くらい** なのに、ファイル全体が2倍になっていました。

### なぜ問題か

1. **バグ修正が2倍** — cookie 処理のバグを直すとき、両方直し忘れる
2. **挙動の不一致** — 片方だけ直して、Server Component と API でセッション挙動がズレる
3. **新人が迷う** — 「どっちを使えばいい？」

---

## どう修正すべきか

### 1. 1つの関数に統合し、オプションで切り替える

```typescript
// src/lib/supabase/server.ts

type Options = {
  /** true = Route Handler 用（cookie 書き込み許可） */
  mutableCookies?: boolean
}

export async function createServerSupabaseClient(
  options: { mutableCookies?: boolean } = {},
) {
  const { mutableCookies = false } = options
  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      get(name) { ... },
      set(name, value, opts) {
        if (mutableCookies) {
          cookieStore.set(...)
        } else {
          try { cookieStore.set(...) } catch { /* Server Component */ }
        }
      },
      remove(name, opts) { /* 同様 */ },
    },
  })
}
```

### 2. 後方互換の薄いラッパーを残す

既存コードで `createRouteHandlerClient()` を使っている箇所を一括変更しなくて済むように:

```typescript
export async function createRouteHandlerClient() {
  return createServerSupabaseClient({ mutableCookies: true })
}
```

**実体は1つ、呼び方は2つ** — これで OK です。

### 3. 使い分けのルール

| 呼び出し | 使う場所 |
|----------|----------|
| `createServerSupabaseClient()` | Server Component（デフォルト） |
| `createServerSupabaseClient({ mutableCookies: true })` | Route Handler |
| `createRouteHandlerClient()` | Route Handler（ラッパー） |
| middleware 専用 | `lib/supabase/middleware.ts`（Request/Response ベースで別実装） |

※ middleware は cookie API が異なるため、**別ファイルの別実装** が正しいです（統合しない）。

---

## まとめ

| 間違い | 修正 |
|--------|------|
| 同一ロジックの関数が2つ | `mutableCookies` オプションで1つに |
| 修正漏れリスク | 変更は `server.ts` 1ファイルだけ |
| import がバラバラ | ラッパーで既存コードとの互換維持 |

**学び**: コピペされたコードは **パラメータ1つで分岐できるか** を疑う。DRY（Don't Repeat Yourself）の基本です。
