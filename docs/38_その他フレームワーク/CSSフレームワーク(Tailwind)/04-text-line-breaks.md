# 3. 改行・テキストの見え方（Tailwind・TSX）

詳細は [[03_Web基礎（フロントエンド入門）/02_CSS/responsive-line-breaks|改行専用ノート]] を参照してください。

| 目的 | Tailwind での例（TSX では `className`） |
|------|------------------|
| ブレークポイントで**確実に**改行 | `br` + `className="sm:hidden"`（スマホのみ改行） / `className="hidden sm:block"`（PC付近で改行）など |
| **自然な**折り返し位置 | HTML の `<wbr />`（Tailwind 専用クラスはない） |
| 語句を1まとまりに | `whitespace-nowrap` |

```tsx
export function HeadlineWithBreak() {
  return (
    <h1 className="text-xl sm:text-2xl">
      長い見出しの
      <br className="sm:hidden" />
      改行位置
    </h1>
  );
}
```

← [[03_Web基礎（フロントエンド入門）/03_レスポンシブ/00-design-implementation|レスポンシブ実装インデックス]]
