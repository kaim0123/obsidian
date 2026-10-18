# Route Handlers（API ルート）

Server Actions は「アプリ内部から呼ぶ」のに最適ですが、**外部から HTTP で叩かれる API** を作るには **Route Handlers** を使います。
モバイルアプリや外部サービスからのアクセス、Webhook 受信などが典型例。

---

## 1. 基本：`route.ts` を置く

`app/` 配下に **`route.ts`** という名前のファイルを置くと、その階層が API エンドポイントになります。

```text
app/
└── api/
    └── hello/
        └── route.ts        → GET/POST/... /api/hello
```

```ts
// app/api/hello/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "こんにちは" });
}
```

ブラウザで `http://localhost:3000/api/hello` を開くと `{"message":"こんにちは"}` が返ります。

> **注意**：`route.ts` と `page.tsx` は**同じフォルダに共存できません**。どちらか片方。

---

## 2. HTTP メソッドごとに関数を書く

```ts
// app/api/posts/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const posts = await db.posts.findMany();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const post = await db.posts.create({ data: body });
  return NextResponse.json(post, { status: 201 });
}

export async function PUT(request: Request) { /* ... */ }
export async function DELETE() { /* ... */ }
export async function PATCH() { /* ... */ }
```

宣言した HTTP メソッドだけが受け付けられ、他は自動で 405 が返ります。

---

## 3. リクエスト情報を取り出す

### URL クエリ

```ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  return NextResponse.json({ q });
}
```

### JSON ボディ

```ts
export async function POST(request: Request) {
  const data = await request.json();
  // ...
}
```

### FormData

```ts
export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("avatar") as File;
  // ...
}
```

### ヘッダ

```ts
import { headers } from "next/headers";

export async function GET() {
  const h = await headers();
  const auth = h.get("authorization");
  // ...
}
```

### クッキー

```ts
import { cookies } from "next/headers";

export async function GET() {
  const c = await cookies();
  const token = c.get("session");
  // ...
}
```

---

## 4. 動的セグメント

```text
app/
└── api/
    └── posts/
        └── [id]/
            └── route.ts        → /api/posts/123
```

```ts
// app/api/posts/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Next.js 15+ Promise
  const post = await db.posts.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(post);
}
```

---

## 5. レスポンスの作り方

```ts
// JSON
return NextResponse.json({ ok: true });

// ステータスコード指定
return NextResponse.json({ error: "..." }, { status: 400 });

// プレーンテキスト
return new NextResponse("hello", { status: 200, headers: { "content-type": "text/plain" } });

// リダイレクト
return NextResponse.redirect(new URL("/login", request.url));

// クッキーセット
const res = NextResponse.json({ ok: true });
res.cookies.set("session", "xxx", { httpOnly: true, secure: true });
return res;
```

---

## 6. キャッシュ制御

Route Handlers のデフォルト：
- **GET**：Next.js 14 まではキャッシュ、15+ ではキャッシュしない
- **POST/PUT/...**：キャッシュしない

明示的に：

```ts
export const dynamic = "force-dynamic"; // 毎回実行
export const revalidate = 60;            // 60 秒キャッシュ
```

---

## 7. ストリーミングレスポンス

`Response` の `ReadableStream` で逐次送信できます。

```ts
export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode("data: hello\n\n"));
      await new Promise(r => setTimeout(r, 1000));
      controller.enqueue(encoder.encode("data: world\n\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "content-type": "text/event-stream" },
  });
}
```

OpenAI のチャット API のような **ストリーミング応答**を中継するときに便利。

---

## 8. CORS（外部ドメインから叩かれる場合）

デフォルトでは同一オリジン以外からのアクセスはブラウザにブロックされます。CORS を許可するには：

```ts
export async function GET() {
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
```

`Access-Control-Allow-Origin: *` は誰でも叩けることになるので、本番では特定ドメインに絞ります。

---

## 9. 認証付き API

```ts
// app/api/me/route.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ user: session.user });
}
```

---

## 10. Webhook 受信の例

Stripe や CMS からの Webhook を受け取る。

```ts
// app/api/webhooks/stripe/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text(); // raw body が必要
  const sig = request.headers.get("stripe-signature")!;

  try {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    // event.type に応じた処理
    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }
}
```

---

## 11. Server Actions と Route Handlers の使い分け

| ユースケース | 推奨 |
|-------------|------|
| 自分のフロントエンドからのフォーム送信 | **Server Actions** |
| 自分のフロントエンドからのボタン操作 | **Server Actions** |
| モバイルアプリから叩く API | **Route Handlers** |
| サードパーティ Webhook の受信 | **Route Handlers** |
| 外部サービスへの API 提供 | **Route Handlers** |
| ファイルダウンロード/アップロード | **Route Handlers**（ストリーミング） |

---

## 12. つまずきポイント

### Q. `route.ts` と `page.tsx` を同居させたら片方しか動かない

→ どちらか片方しか置けません。`api/posts/route.ts` と `posts/page.tsx` のように URL を分ける。

### Q. POST した直後に GET したらキャッシュが古い

→ `revalidateTag` を呼ぶか、GET 側で `cache: 'no-store'` に。

### Q. `request.json()` を 2 回呼んでエラー

→ Body は 1 回しか読めません。一度変数に入れて使い回す。

### Q. CORS エラーが消えない

→ プリフライト（`OPTIONS`）への応答も書く必要があります。

### Q. レスポンスが文字化けする

→ `content-type` に `; charset=utf-8` を付ける、または `NextResponse.json` を使う（自動で UTF-8）。

---

## まとめ

- `app/.../route.ts` を置くだけで API が作れる
- HTTP メソッドごとに関数を export（`GET`、`POST`、...）
- 内部利用は **Server Actions**、外部公開は **Route Handlers**
- ストリーミング・Webhook・CORS にも対応
- 動的セグメントも `[id]` 形式で OK

次は認証の話 → [[02認証とセッションのパターン]]
