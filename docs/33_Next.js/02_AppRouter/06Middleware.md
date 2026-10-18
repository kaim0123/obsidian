# Middleware（ミドルウェア）

ミドルウェアは、**リクエストがページや API ハンドラに届く前に走る関数**です。
URL を見て、リダイレクト・書き換え・ヘッダ追加・認証チェックなどができます。

---

## 1. どこに書く？

プロジェクトの**ルート**（`src/` を使うなら `src/`、使わないならプロジェクト直下）に **`middleware.ts`** を 1 つだけ置きます。

```text
プロジェクトルート/
├── src/
│   ├── middleware.ts   ← ここ（src/ 構成の場合）
│   └── app/
└── next.config.ts
```

```text
プロジェクトルート/
├── middleware.ts       ← ここ（src/ なし構成の場合）
├── app/
└── next.config.ts
```

**1 ファイルだけ**しか置けません。

---

## 2. 最小例

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("リクエスト:", request.nextUrl.pathname);
  return NextResponse.next(); // 何もせず通す
}
```

`NextResponse.next()` は「**そのまま通す**」という意味です。何もしない場合でも明示的に返します。

---

## 3. どんな URL で動かすか：`config.matcher`

デフォルトでは **すべてのリクエスト**で動きます（`favicon.ico` や画像も含む）。
それでは無駄なので、**マッチするパスを限定**します。

```ts
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
```

- `:path*` は「0 階層以上の任意」
- `:path` は「1 階層」
- `:path+` は「1 階層以上」

### 一般的な「除外パターン」

```ts
export const config = {
  matcher: [
    // _next, api, 静的ファイル以外を全部対象
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

---

## 4. よくある使い道

### A. 認証チェックして未ログインならリダイレクト

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("session_token");

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
```

### B. URL のリライト（裏で別 URL に変換）

ユーザーから見える URL は変えず、内部で違うパスを処理。

```ts
export function middleware(request: NextRequest) {
  // /old-url にアクセスされたら、内部で /new-url を表示
  if (request.nextUrl.pathname === "/old-url") {
    return NextResponse.rewrite(new URL("/new-url", request.url));
  }
  return NextResponse.next();
}
```

### C. 国・言語による分岐（i18n）

```ts
export function middleware(request: NextRequest) {
  const locale = request.headers.get("accept-language")?.startsWith("ja") ? "ja" : "en";
  if (!request.nextUrl.pathname.startsWith(`/${locale}`)) {
    return NextResponse.redirect(new URL(`/${locale}${request.nextUrl.pathname}`, request.url));
  }
  return NextResponse.next();
}
```

### D. レスポンスヘッダの追加

```ts
export function middleware() {
  const response = NextResponse.next();
  response.headers.set("x-custom-header", "hello");
  return response;
}
```

### E. リクエストヘッダを後段に渡す

```ts
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", "123");

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
```

---

## 5. リクエスト・レスポンスでできる主なこと

| メソッド | 何をする |
|----------|----------|
| `NextResponse.next()` | 通す |
| `NextResponse.redirect(url)` | リダイレクト（URL が変わる） |
| `NextResponse.rewrite(url)` | リライト（URL は変えず内容を差し替え） |
| `NextResponse.json(...)` | JSON を直接返す |
| `request.cookies.get(...)` / `set(...)` | クッキーを読み書き |
| `request.headers.get(...)` | ヘッダを読む |

---

## 6. 重要な制約

ミドルウェアは **Edge Runtime** で動きます（軽量・高速だが制約あり）。

- **Node.js 専用 API（`fs`、`crypto.randomBytes` 等）は使えない**
- バンドルサイズに上限がある（重いライブラリは入れにくい）
- DB に直接アクセスはできない（HTTP 経由 or Edge 対応 SDK は OK）

→ **「軽い判断と振り分けだけ」をやらせる場所**と理解しましょう。重い処理は Route Handler や Server Component に任せます。

---

## 7. つまずきポイント

### Q. Middleware が動いていない

→ ファイルの場所が違う可能性。`src/` を使うなら `src/middleware.ts` です。

### Q. すべての画像・JS にも適用されてしまって遅い

→ `config.matcher` で除外しましょう。

### Q. `NextResponse.next()` を返し忘れて画面が真っ白

→ ミドルウェアは**必ず何かを return** する必要があります。

### Q. クッキーをセットしたのに後段で読めない

→ `NextResponse.next()` の戻り値に対して `cookies.set()` するか、リクエスト側にも反映する必要があります。

### Q. Middleware が遅い

→ Middleware は**ほぼ全リクエストで走る**ので、重い処理は厳禁。`fetch` などをミドルウェアでやると体感速度が落ちます。

---

## 8. 認証は Middleware だけでやらない方がいい

App Router では「**Middleware で粗い振り分け + ページ/Layout で本格チェック**」が定石です。

- Middleware：未ログインなら `/login` へ飛ばす（軽い判定）
- Server Component / Route Handler：実データのアクセス制御（厳密）

なぜなら、Middleware だけだと **Edge Runtime の制約**（DB に直接当てるのが難しい）にぶつかったり、**1 つのレイヤーに全責任**が集中して脆弱になりやすいからです。

---

## まとめ

- **`middleware.ts`** はプロジェクトに 1 つだけ、ルートに置く
- **リクエストが届く前に走る**：リダイレクト・リライト・ヘッダ操作など
- **Edge Runtime** で動くので Node 専用 API は不可
- 必ず **`config.matcher`** で対象を絞る
- 認証は Middleware と各ページ層の**両方で**やるのが安全

次は Server / Client コンポーネントの世界へ → [[01Server-ComponentsとClient-Components]]
