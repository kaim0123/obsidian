# 外部 API と環境変数

外部サービス（OpenAI、Stripe、Google API、社内 API…）を Next.js から呼ぶときに**絶対に押さえておきたい**ポイントです。
特に **「API キーを安全に扱う」**ことは、漏れたら数十万円の請求が来るレベルの大事故になります。

---

## 1. 環境変数：3 種類のファイル

プロジェクトルートに置く `.env*` ファイルがあります。

| ファイル名 | 用途 | Git にコミット？ |
|-----------|------|-----------------|
| `.env` | デフォルト値（全環境共通） | OK |
| `.env.local` | **ローカル開発用、秘密値含む** | **NG（必ず .gitignore）** |
| `.env.development` | 開発時のみ | OK |
| `.env.production` | 本番ビルド時のみ | OK |
| `.env.test` | テスト時 | OK |

### ロード順（後勝ち）

`.env` → `.env.development` → `.env.local`

---

## 2. 公開・非公開の境界：`NEXT_PUBLIC_` 接頭辞

これが**最重要**ルールです。

```bash
# .env.local
DATABASE_URL=postgres://...
OPENAI_API_KEY=sk-xxxxx
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_GA_ID=G-XXXXX
```

| 接頭辞 | 公開？ | 利用可能な場所 |
|--------|--------|---------------|
| 接頭辞なし | **❌ サーバー専用** | Server Components、Route Handlers、Server Actions |
| `NEXT_PUBLIC_` 付き | **⚠ クライアントに含まれる** | どこでも利用可（=漏洩する） |

```ts
// ✅ サーバー側
const key = process.env.OPENAI_API_KEY; // 安全

// ❌ クライアントから読むと undefined
"use client";
const key = process.env.OPENAI_API_KEY; // undefined（漏れない）

// ⚠ NEXT_PUBLIC_ はクライアントでも読める
"use client";
const url = process.env.NEXT_PUBLIC_SITE_URL; // OK
```

### 鉄則

> **「クライアントから見せたくないものは、絶対に `NEXT_PUBLIC_` を付けない」**

API キー・DB パスワード・Webhook シークレット・JWT シークレットは**全て接頭辞なし**で。

---

## 3. 環境変数を型安全に扱う

ふつうに `process.env.FOO` だと型が `string | undefined`。
バリデーションして型安全にするには [Zod](https://zod.dev/) などを使います。

```ts
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

```ts
import { env } from "@/lib/env";
const key = env.OPENAI_API_KEY; // string 型！
```

起動時に必須な環境変数が無ければ落ちる、という安全策にもなります。

---

## 4. 外部 API を呼ぶ：基本パターン

### Server Component から

```tsx
// app/products/page.tsx
export default async function Products() {
  const res = await fetch("https://api.example.com/products", {
    headers: {
      Authorization: `Bearer ${process.env.EXAMPLE_API_KEY}`, // サーバーで使う
    },
    next: { revalidate: 3600 },
  });
  const products = await res.json();
  return <ul>...</ul>;
}
```

### Server Action から

```ts
"use server";
export async function purchase(productId: string) {
  await fetch("https://api.example.com/purchase", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${process.env.EXAMPLE_API_KEY}`,
    },
    body: JSON.stringify({ productId }),
  });
}
```

### Route Handler から（クライアントへの中継 API）

クライアントから直接外部 API を叩くとキーが露出します。**Route Handler を中継させる**のが定石。

```ts
// app/api/openai-chat/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const { messages } = await request.json();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });
  return NextResponse.json(completion.choices[0].message);
}
```

```tsx
"use client";
async function ask() {
  const res = await fetch("/api/openai-chat", {
    method: "POST",
    body: JSON.stringify({ messages: [...] }),
  });
  return res.json();
}
```

これでキーはサーバーに留まったまま、クライアントは安全に AI 応答を受けられます。

---

## 5. レート制限・リトライ

外部 API は失敗・レート制限がつきもの。基本のリトライ：

```ts
async function fetchWithRetry(url: string, options: RequestInit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (res.status === 429 || res.status >= 500) {
        await new Promise(r => setTimeout(r, 2 ** i * 1000));
        continue;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (i === retries - 1) throw err;
    }
  }
  throw new Error("retries exhausted");
}
```

実運用では [`p-retry`](https://www.npmjs.com/package/p-retry) などのライブラリを使うのもアリ。

---

## 6. 環境ごとの値を切り替える

```bash
# .env.development.local
NEXT_PUBLIC_API_URL=http://localhost:4000

# .env.production.local
NEXT_PUBLIC_API_URL=https://api.example.com
```

`.env.local` の方が**全環境のローカル上書き**として使われるので、ファイル設計に注意。

---

## 7. Vercel への環境変数登録

1. Vercel ダッシュボード → プロジェクト → Settings → Environment Variables
2. キー・値を入力、適用環境を選択（Production / Preview / Development）
3. 反映には **再デプロイ**が必要

ローカル開発と Vercel で同じ環境変数を使うには、`vercel env pull .env.local` で同期できます。

---

## 8. 機密情報を絶対やってはいけないこと

- ❌ Git に `.env.local` をコミット
- ❌ ログに `console.log(process.env)` を全件出力
- ❌ クライアント側で API キーを使うコードを書く（バンドルに残る）
- ❌ `NEXT_PUBLIC_` を秘密値に使う
- ❌ クッキー・LocalStorage に API キーを入れる

### 漏洩を疑ったら

1. すぐに該当 API キーを**ローテート（再発行）**
2. プロバイダ管理画面で**使用履歴を確認**
3. Git 履歴に残っているなら `git filter-repo` などで履歴から削除（後発デプロイは新しい鍵で）

---

## 9. よく使う外部 API パターン集

### A. OpenAI（生成 AI）

```ts
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

### B. Stripe（決済）

```ts
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

### C. Resend / SendGrid（メール）

```ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
```

### D. Supabase / Firebase（BaaS）

公開キー（`anon` key）はクライアント OK、サービスロールキーは絶対サーバーのみ。

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...    # 公開して OK
SUPABASE_SERVICE_ROLE_KEY=...        # 絶対 NEXT_PUBLIC_ 付けない
```

---

## 10. つまずきポイント

### Q. `process.env.FOO` が undefined

→ 開発サーバーを再起動しましたか？ `.env*` の変更は再起動が必要。
→ `NEXT_PUBLIC_` を付け忘れている可能性も（クライアントから読みたい場合）

### Q. Vercel に上げたら環境変数が反映されない

→ Vercel 側に設定して**再デプロイ**してください。`.env.local` はアップロードされません。

### Q. ビルドが「missing env var」で失敗

→ ビルド時に必要な変数（`NEXT_PUBLIC_*`）も含めて Vercel に設定。

### Q. クライアントで API キーを使ってしまった

→ そのキーは**漏洩済み**。即ローテーション。Route Handler 経由に修正。

---

## まとめ

- `.env.local` に**秘密の値**、`.env` に**共通設定**
- **`NEXT_PUBLIC_` 接頭辞**を付けたものだけがクライアントに公開される
- API キー類は**絶対にサーバー側だけ**で扱う（Route Handler / Server Action / Server Component）
- 環境変数は **Zod でバリデーション**すると安全
- Vercel に上げる際は環境変数を**ダッシュボードから登録**

次は CSS 周り → [[01CSSとTailwind]]
