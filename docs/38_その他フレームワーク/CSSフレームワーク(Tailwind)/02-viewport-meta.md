# 1. ビューポート（HTML・Tailwind 共通）

モバイルブラウザが「デスクトップ用の幅」で縮小表示するのを防ぎ、Tailwind の `w-full` などが**実際の画面幅**に対して効くようにします。ビューポートはコンポーネントの `className` ではなく **HTML の head** で宣言します。

## `index.html`（Vite / CRA など）

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Next.js（App Router）の例

`app/layout.tsx` で **`viewport` を別エクスポート**するのが一般的です（Next 14 以降の型: `Viewport`）。

```tsx
import type { Viewport } from "next";
import type { ReactNode } from "react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

プロジェクトの Next.js のバージョンによっては API が異なる場合があるため、[Viewport の公式ドキュメント](https://nextjs.org/docs/app/api-reference/functions/generate-viewport) を確認してください。

## 注意

- **initial-scale=1**: 初期ズーム100%。ピンチズームを残すなら `maximum-scale=1` は付けない（a11y でも推奨）。
- ビューポートは Tailwind の対象外なので、**必ず HTML / メタデータで宣言**します。

← [[03_Web基礎（フロントエンド入門）/03_レスポンシブ/00-design-implementation|レスポンシブ実装インデックス]]
