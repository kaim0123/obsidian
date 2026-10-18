# 01. 画面レベルの認証ガードと middleware

## design.md の指摘

> **画面（ページ）レベルの認証ガードが存在しない**
>
> - `middleware.ts` が無く、`(dashboard)/layout.tsx` もサーバー側で認証チェックをしていない。
> - 保護は API の `getUser()` チェック + Supabase の RLS 頼み。未認証でもダッシュボードのシェルがレンダリングされ、リダイレクトはクライアント任せになっている。

---

## 基礎知識：認証ガードとは？

Web アプリには **ログインが必要なページ**（ダッシュボードなど）と **誰でも見られるページ**（ログイン画面など）があります。

**認証ガード** = 「ログインしていない人を、保護されたページに入れない仕組み」のことです。

### 3つの防御レイヤー

| レイヤー | 役割 | 例 |
|----------|------|-----|
| **画面（ページ）** | HTML を返す前に弾く | middleware、layout のサーバー側チェック |
| **API（Route Handler）** | データ取得・更新の前に弾く | `requireUser(supabase)` |
| **データベース（RLS）** | SQL レベルで行を制限 | Supabase Row Level Security |

**理想**: 3層すべてで守る。  
**問題だった状態**: API と DB だけ。画面は「後からクライアントでリダイレクト」に任せていた。

---

## 何が間違っていたか

### 1. middleware がなかった

Next.js の **middleware** は、ページが表示される **前** に毎回実行される関数です。

```
ブラウザ → middleware（ここで認証チェック）→ ページ表示
```

middleware が無いと:

1. 未ログインでも `/candidates` などの URL にアクセスできる
2. ダッシュボードの **サイドバー・ヘッダー** が一瞬（またはそのまま）表示される
3. 中のデータは API が 401 を返すので空っぽ — **見た目だけログイン後の画面**

ユーザー体験が悪いだけでなく、**「画面は見えたが API は守られている」** という中途半端な状態になります。

### 2. layout.tsx が認証を見ていなかった

`(dashboard)/layout.tsx` はダッシュボード全体を包むレイアウトですが、中身は UI コンポーネントを並べるだけで、**「ログインしているか？」をサーバー側で確認していませんでした**。

### 3. クライアント任せのリダイレクト

ログイン画面への転送を **ブラウザ上の JavaScript** だけに頼ると:

- JavaScript が無効 / 遅延 → 保護が効かない
- 一瞬だけ中身が見える（**フラッシュ**）

---

## どう修正すべきか

### 推奨：`src/middleware.ts` を追加する

Supabase の SSR（Server-Side Rendering）公式ガイドでは、次を middleware で行うのが **推奨パターン** です。

1. **セッションの更新** — 期限切れ間近の cookie を自動リフレッシュ
2. **認証チェック** — `getUser()` でユーザーが本当に有効か確認（`getSession()` だけでは不十分）
3. **リダイレクト** — 未認証なら `/login` へ、ログイン済みなら `/login` から `/` へ

#### コードのイメージ（概念）

```typescript
// middleware.ts（概念図）
export async function middleware(request) {
  // 1. Supabase クライアントを cookie 付きで作成
  // 2. await supabase.auth.getUser() でユーザー確認
  // 3. 未認証 & 保護ページ → /login へ redirect
  // 4. リダイレクト時も cookie を引き継ぐ（重要！）
}
```

#### リダイレクト時の cookie コピーが重要な理由

Supabase は middleware 内で **トークンをリフレッシュ** することがあります。  
新しい `NextResponse.redirect()` を作るだけだと、**更新された cookie が消えてログアウトループ** になることがあります。

```typescript
// 悪い例
return NextResponse.redirect(url)  // リフレッシュした cookie が消える

// 良い例
const redirectResponse = NextResponse.redirect(url)
supabaseResponse.cookies.getAll().forEach((cookie) => {
  redirectResponse.cookies.set(cookie)
})
return redirectResponse
```

### matcher（対象パス）の設定

middleware は **すべてのリクエスト** に走ると重くなります。  
また `/api/*` を middleware で HTML リダイレクトしてしまうと、**API クライアントが JSON の代わりに HTML を受け取って壊れます**。

推奨 matcher の例:

```
'/((?!api|_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:png|jpg|...)$).*)'
```

- `api` — API Route は除外（認証は各 Handler の `requireUser` に任せる）
- `_next/data` — Next.js の内部データ取得を除外（302 ループ防止）

---

## 現在の対応状況

| 項目 | 状態 |
|------|------|
| `src/middleware.ts` の追加 | ✅ 実装済み |
| `getUser()` による認証判定 | ✅ 実装済み |
| リダイレクト時の cookie コピー | ✅ 実装済み |
| `/api` への HTML リダイレクト回避 | ✅ `isApiPath` でロジック上は回避 |
| matcher で `_next/data` 除外 | ⚠️ 未対応（改善推奨） |
| matcher で `api` を除外 | ⚠️ middleware 自体は api にも走る（ロジックで skip しているが、パフォーマンス上は matcher 除外が望ましい） |

---

## まとめ

| 間違い | 修正 |
|--------|------|
| 画面側に認証が無い | middleware でサーバー側ガード |
| セッション更新が無い | middleware で cookie リフレッシュ |
| クライアントだけでリダイレクト | middleware で `/login` へ server redirect |
| `getSession()` だけで判定 | `getUser()` でサーバー検証 |

**学び**: 「API と DB だけ守れば十分」ではない。ユーザーが **最初に触れる入口（ページ）** でも守るのが Web アプリの基本です。
