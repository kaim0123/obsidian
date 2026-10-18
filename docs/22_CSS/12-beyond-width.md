# 11. 「画面幅以外」の切り替え（必要な応用）

TypeScript の有無に関わらず、Tailwind の任意バリアントやコンテナクエリで表現します。

| 内容 | Tailwind での例（TSX では `className` 内に同じ） |
|------|------------------|
| 粗いポインタ（タッチ中心） | `[@media(pointer:coarse)]:min-h-12` のように書く |
| コンテナクエリ | v4 では標準機能の範囲が広い。v3 では `@tailwindcss/container-queries` プラグイン＋`@container` / `@lg:` など |

```tsx
export function CoarsePointerButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="min-h-10 px-4 [@media(pointer:coarse)]:min-h-12"
      {...props}
    />
  );
}
```

頻出のレスポンシブは **`sm:`〜`lg:`** で足りることが多く、上記は要件が出たときに足すイメージでよいです。

← [[03_Web基礎（フロントエンド入門）/03_レスポンシブ/00-design-implementation|レスポンシブ実装インデックス]]
