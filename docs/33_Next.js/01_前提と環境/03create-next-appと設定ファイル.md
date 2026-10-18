# create-next-app と設定ファイル

Next.js は手で 0 から構築することもできますが、公式が **`create-next-app`** という雛形ジェネレータを用意しています。これを使うと、コマンド 1 発で動く状態のプロジェクトが作れます。

---

## 1. プロジェクトを作る

### 基本のコマンド

ターミナルで、プロジェクトを置きたいフォルダに移動してから次を実行します。

```bash
npx create-next-app@latest my-app
```

- `npx` は npm に付属するコマンドで、「ライブラリをインストールせずに 1 回だけ実行する」もの
- `@latest` を付けると最新版の Next.js で雛形が作られる
- `my-app` の部分は自分の好きなプロジェクト名に

`pnpm` を使っているなら：

```bash
pnpm create next-app my-app
```

### 質問に答える

実行すると、いくつか質問されます。**初心者は基本的に Yes（Enter）で進めて OK** です。

```
? Would you like to use TypeScript? › No / Yes
? Would you like to use ESLint? › No / Yes
? Would you like to use Tailwind CSS? › No / Yes
? Would you like to use `src/` directory? › No / Yes
? Would you like to use App Router? (recommended) › No / Yes
? Would you like to customize the default import alias (@/*)? › No / Yes
```

### おすすめの選択

| 質問 | 推奨 | 理由 |
|------|------|------|
| TypeScript | **Yes** | エラーを事前に見つけられる。後悔しない |
| ESLint | **Yes** | ミスや古い書き方を警告 |
| Tailwind CSS | **Yes** | 一番人気のスタイリング方式 |
| `src/` directory | お好み | あった方が整理しやすい派が多い |
| App Router | **Yes** | これから学ぶなら必須 |
| import alias | **No**（デフォルト `@/*` のまま） | `@/components/...` のように書ける |

完了すると `my-app` フォルダができて、依存ライブラリも自動でインストールされます。

### 起動する

```bash
cd my-app
npm run dev
```

ブラウザで **<http://localhost:3000>** にアクセスして、Next.js の初期画面が出れば成功！

---

## 2. プロジェクトのフォルダ構成

`create-next-app` で作った直後はこんな感じになります（TypeScript + App Router + Tailwind + `src/` あり構成の例）。

```text
my-app/
├── node_modules/          ← インストールされたライブラリ（触らない）
├── public/                ← 画像などの静的ファイル
│   └── favicon.ico
├── src/
│   └── app/               ← App Router の本体
│       ├── layout.tsx     ← 全ページ共通のレイアウト
│       ├── page.tsx       ← トップページ "/"
│       ├── globals.css    ← 全体に効く CSS
│       └── favicon.ico
├── .gitignore             ← Git で無視するファイル
├── next.config.ts         ← Next.js の設定ファイル
├── package.json           ← プロジェクト定義 / 依存ライブラリ
├── package-lock.json      ← 依存の正確なバージョン記録
├── postcss.config.mjs     ← PostCSS（Tailwind が裏で使う）
├── tailwind.config.ts     ← Tailwind の設定
├── tsconfig.json          ← TypeScript の設定
└── README.md              ← 説明書
```

---

## 3. 主要ファイルを詳しく

### `package.json`

プロジェクトの「身分証明書 + 依存ライブラリ一覧」。

```json
{
  "name": "my-app",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "16.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  },
  "devDependencies": { ... }
}
```

#### 重要な `scripts`

| コマンド | 何をする |
|----------|----------|
| `npm run dev` | **開発サーバー起動**。ファイル変更を即反映（最も使う） |
| `npm run build` | **本番用にビルド**。`.next/` フォルダに最適化済みの成果物を出力 |
| `npm run start` | ビルド済みのものを**本番モードで起動** |
| `npm run lint` | コードのチェック |

### `next.config.ts`（または `.js` / `.mjs`）

Next.js 自体の設定。最初は中身がほぼ空。

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ここに設定を書く
};

export default nextConfig;
```

よく追加する設定例：

```ts
const nextConfig: NextConfig = {
  // 画像を外部ドメインから取得する場合の許可リスト
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "example.com" },
    ],
  },
  // 環境変数を公開（クライアントから見える）
  env: {
    APP_VERSION: "1.0.0",
  },
  // 実験的機能の ON/OFF
  experimental: {
    // ...
  },
};
```

### `tsconfig.json`

TypeScript の設定。基本いじらなくて OK ですが、知っておきたい部分：

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,                 // 厳密チェック ON（推奨）
    "paths": {
      "@/*": ["./src/*"]            // @/ で src/ を指せる
    }
  }
}
```

`paths` 設定のおかげで、

```ts
// これが
import { Button } from "../../components/Button";
// こう書ける
import { Button } from "@/components/Button";
```

### `tailwind.config.ts`

Tailwind を選んだ場合に作られる。色やフォント、breakpoint などを拡張するファイル。

```ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#FF6B6B",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

`content` に書かれたファイルから「使われている Tailwind クラス」を自動で抜き出して、CSS を生成します。

### `.gitignore`

Git で**追跡しない**ファイルを書く場所。デフォルトで以下が無視されています：

```text
/node_modules
/.next/
.env*.local
```

- `node_modules` は容量が大きく再生成可能なのでコミットしない
- `.next` はビルド成果物なのでコミットしない
- `.env.local` は秘密情報なのでコミットしない（重要）

### `globals.css`

全ページに効く CSS。Tailwind を選んでいる場合は冒頭に：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

または Next.js 16 系なら：

```css
@import "tailwindcss";
```

---

## 4. 環境変数（`.env`）

API キーや DB のパスワードなど、**コードに直書きしたくない値** は `.env.local` ファイルに書きます。

```bash
# .env.local（プロジェクトルートに作成。Git にはコミットしない）
DATABASE_URL=postgres://...
OPENAI_API_KEY=sk-xxxxx
NEXT_PUBLIC_SITE_URL=https://example.com
```

### ルール

- **`NEXT_PUBLIC_` で始まる変数だけ** クライアント側（ブラウザ）から参照可能
- それ以外は **サーバー側でしか読めない**（安全）

```ts
// サーバー側（Server Components や Route Handlers）
const key = process.env.OPENAI_API_KEY;       // 読める

// クライアント側（'use client' のコンポーネント）
const url = process.env.NEXT_PUBLIC_SITE_URL; // 読める
const key = process.env.OPENAI_API_KEY;       // undefined（読めない！）
```

---

## 5. はじめての編集

`src/app/page.tsx` を開いて、中身を全部消して以下を貼ってみましょう。

```tsx
export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Hello Next.js!</h1>
      <p className="mt-4 text-gray-600">
        編集して保存すると、ブラウザに即反映されます。
      </p>
    </main>
  );
}
```

保存すると、ブラウザが自動で更新されて変更が反映されます（**Hot Module Replacement / HMR**）。

---

## 6. つまずきポイント

### `npm run dev` でエラーが出る

- Node.js のバージョンが古い → `node -v` で確認、20 以上に
- `node_modules` が壊れている → 一度削除して `npm install` し直す

```bash
rm -rf node_modules package-lock.json
npm install
```

### ポート 3000 が使えない（既に使われている）

別のアプリが使っているので、別ポートで起動：

```bash
npm run dev -- -p 3001
```

### Tailwind が効かない

- `globals.css` で `@tailwind` 系の指示があるか
- `tailwind.config.ts` の `content` が正しいパスを指しているか
- `layout.tsx` で `globals.css` が `import` されているか

---

## まとめ

- **`npx create-next-app@latest`** で雛形を一発生成
- 開発中は **`npm run dev`** をひたすら使う
- 設定ファイルは最初は触らなくて OK、必要になったときに開く
- 秘密情報は **`.env.local`** に置く

次は実際にページを作っていきましょう → [[01ファイル規約とURL]]
