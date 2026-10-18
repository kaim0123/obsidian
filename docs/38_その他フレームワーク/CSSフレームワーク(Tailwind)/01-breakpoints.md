# Tailwind のブレークポイント（既定・モバイルファースト）

TypeScript / React（TSX）で Tailwind を使う場合も、**プレフィックスは「この幅以上」** で効きます（ベース＝全幅、広いほど上書き）。

| プレフィックス | min-width（概ね） |
|----------------|-------------------|
| （なし） | 0（最小幅＝スマホ想定のデフォルト） |
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |

プロジェクトで `tailwind.config.js` または `tailwind.config.ts` の `theme.screens` を変えている場合は、その値が優先されます。

## TSX での例

```tsx
export function ResponsiveHeading() {
  return (
    <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
      ブレークポイントでサイズが変わる見出し
    </h1>
  );
}
```

← [[03_Web基礎（フロントエンド入門）/03_レスポンシブ/00-design-implementation|レスポンシブ実装インデックス]]
