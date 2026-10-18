# CSS と Tailwind

Next.js は CSS の選択肢が豊富です。プロジェクトの規模や好みで選んでください。
ここでは主要な選択肢と、特に人気の **Tailwind CSS** を中心に解説します。

---

## 1. CSS の主な選択肢

| 方式 | 概要 | 向き |
|------|------|------|
| **Global CSS** | 普通の CSS ファイル | シンプルなサイト |
| **CSS Modules** | ファイルごとにスコープを分ける | 大規模・コンポーネント単位 |
| **Tailwind CSS** | ユーティリティクラスを並べる | **2026 年の主流** |
| **CSS-in-JS（styled-components 等）** | JS の中に CSS を書く | 動的スタイル多用 |
| **vanilla-extract / Panda CSS** | ゼロランタイム CSS-in-JS | 型安全 + 高速 |

App Router では、ランタイム型 CSS-in-JS（styled-components 等）は**設定が複雑**になりがち。
新規なら **Tailwind** か **CSS Modules** が無難です。

---

## 2. Global CSS

最もシンプル。`globals.css` を作って `app/layout.tsx` で import。

```css
/* app/globals.css */
body {
  font-family: sans-serif;
  margin: 0;
  background: #fafafa;
}
```

```tsx
// app/layout.tsx
import "./globals.css";

export default function RootLayout({ children }: any) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

**Global CSS は `app/layout.tsx` でしか import できません**（page.tsx で import すると怒られる）。

---

## 3. CSS Modules

ファイル名を `.module.css` にすると、**自動でクラス名が一意化**されてスコープが分離されます。

```css
/* app/components/Button.module.css */
.button {
  background: #007aff;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
}
```

```tsx
// app/components/Button.tsx
import styles from "./Button.module.css";

export function Button() {
  return <button className={styles.button}>クリック</button>;
}
```

裏で `Button_button__xyz123` のような名前に変換されるので、他の `.button` と衝突しません。

---

## 4. Tailwind CSS

**ユーティリティクラス**（`p-4`、`text-red-500`、`flex`...）を並べてスタイリングする方式。
慣れるとスピードが圧倒的に速く、CSS ファイルがほぼ不要になります。

### `create-next-app` 時に Yes と答えていれば既に入っている

入っていない場合は以下で導入：

```bash
npm install -D tailwindcss @tailwindcss/postcss
```

Next.js 16+ / Tailwind v4 はセットアップが簡単で、`globals.css` に：

```css
@import "tailwindcss";
```

これで使えるようになります。

### 基本の使い方

```tsx
export default function Card() {
  return (
    <div className="rounded-lg border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">タイトル</h2>
      <p className="mt-2 text-gray-600">本文がここに入ります</p>
    </div>
  );
}
```

### よく使うクラス早見表

| カテゴリ | 例 | 意味 |
|---------|-----|------|
| 余白 | `p-4`, `m-2`, `px-6`, `mt-8` | padding/margin（`-数字` は 4px×数字） |
| サイズ | `w-full`, `h-32`, `max-w-md` | 幅・高さ |
| 文字 | `text-lg`, `font-bold`, `text-gray-700` | サイズ・太さ・色 |
| Flex/Grid | `flex`, `grid`, `gap-4`, `items-center`, `justify-between` | レイアウト |
| 色 | `bg-blue-500`, `border-red-300` | 背景・ボーダー |
| 角丸 | `rounded`, `rounded-lg`, `rounded-full` | 角の丸み |
| 影 | `shadow`, `shadow-md`, `shadow-xl` | drop shadow |

### レスポンシブ（モバイルファースト）

```tsx
<div className="text-base md:text-xl lg:text-2xl">
  画面幅で文字サイズが変わる
</div>
```

| プレフィックス | 適用される画面幅 |
|--------------|-----------------|
| なし | 全サイズ |
| `sm:` | 640px 以上 |
| `md:` | 768px 以上 |
| `lg:` | 1024px 以上 |
| `xl:` | 1280px 以上 |
| `2xl:` | 1536px 以上 |

### 状態によるスタイル

```tsx
<button className="bg-blue-500 hover:bg-blue-700 active:bg-blue-900 disabled:opacity-50">
  送信
</button>
```

### ダークモード

`tailwind.config` で `darkMode: "class"` にすると、`<html class="dark">` に切り替えるだけで全体の色を反転できます。

```tsx
<div className="bg-white text-black dark:bg-gray-900 dark:text-white">
  ...
</div>
```

### 任意の値（square brackets）

```tsx
<div className="w-[287px] text-[#ff6b6b]">任意の値</div>
```

定義済みじゃない値もそのまま指定できます。

---

## 5. クラス名の組み立て：`clsx` / `cn`

条件付きでクラスを組み合わせるユーティリティ。

```bash
npm install clsx tailwind-merge
```

```ts
// lib/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
import { cn } from "@/lib/cn";

<button
  className={cn(
    "rounded px-4 py-2",
    isPrimary ? "bg-blue-500 text-white" : "bg-gray-200",
    disabled && "opacity-50 cursor-not-allowed",
    className
  )}
/>
```

`tailwind-merge` を挟むと、`px-2` と `px-4` が衝突したときに後者が優先される（=競合解消）など賢く処理してくれます。

---

## 6. Tailwind の設定をカスタマイズ

### v4 系（CSS で設定）

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-brand: #ff6b6b;
  --font-display: "Pacifico", cursive;
}
```

これで `bg-brand`、`font-display` が使えるようになります。

### v3 系（`tailwind.config.ts` で設定）

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { brand: "#ff6b6b" },
      fontFamily: { display: ["Pacifico", "cursive"] },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## 7. CSS Modules と Tailwind の併用

両方使うこともできます。複雑なアニメーションや疑似要素は CSS Modules、それ以外は Tailwind、など。

```tsx
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={`flex items-center p-12 ${styles.gradient}`}>
      ...
    </section>
  );
}
```

---

## 8. アニメーション

### CSS（Tailwind）

```tsx
<div className="transition-all duration-300 hover:scale-105">
  ホバーで拡大
</div>
```

### Framer Motion（高度なアニメ）

```bash
npm install framer-motion
```

```tsx
"use client";
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  ...
</motion.div>
```

Framer Motion は Client Component 専用。

---

## 9. つまずきポイント

### Q. Tailwind のクラスが効かない

→ 以下を確認：
- `globals.css` で `@import "tailwindcss";` してるか
- `tailwind.config.ts` の `content` が正しいパス？
- `app/layout.tsx` で `globals.css` を import してるか

### Q. `Hover` 状態は Tailwind でどう書く？

→ `hover:bg-blue-700` のように接頭辞。`focus:`、`active:`、`disabled:` も同じ。

### Q. CSS Modules でクラス名が動的に変わると CSS が当たらない

→ `styles[name]` のように bracket access で。

### Q. 動的にクラスを組み合わせると Tailwind がパージしてしまう

→ Tailwind は `content` のファイルを文字列レベルで走査するため、`bg-${color}-500` のような動的生成は検出されません。`bg-red-500` などフルクラス名で書くか、Safelist する必要あり。

### Q. styled-components を使いたい

→ App Router で動かすには「`"use client"` + Provider 設定」が必要。新規開発なら Tailwind か CSS Modules を推奨。

---

## まとめ

- 新規プロジェクトなら **Tailwind**（速くて公式テンプレもこれ）
- 局所的なカスタムスタイルは **CSS Modules**
- 全体共通は **`app/layout.tsx` で import する Global CSS**
- 動的クラスは **`clsx + tailwind-merge`** の `cn` ヘルパで安全に
- レスポンシブ・ダークモード・hover も Tailwind だけで完結

次は画像とフォント → [[02画像・フォント]]
