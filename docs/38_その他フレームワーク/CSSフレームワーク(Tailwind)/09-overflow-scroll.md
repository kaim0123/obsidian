# 8. 横スクロール・オーバーフロー（Tailwind・TSX）

- **全幅**: `w-screen` はスクロールバー次第ではみ出すことがあるため、基本は親いっぱいの `w-full` が安全です。どうしてもビューポート幅基準なら `w-screen` の代替として `max-w-[100dvw]` などを検討する場面があります（任意値）。
- **表・コード**: 横スクロールをそのブロックに閉じ込める。

```tsx
type Props = { children: React.ReactNode };

export function TableScrollRegion({ children }: Props) {
  return (
    <div className="max-w-full overflow-x-auto">
      <table className="min-w-max">{children}</table>
    </div>
  );
}
```

```tsx
export function CodeBlock({ code }: { code: string }) {
  return (
    <div className="max-w-full overflow-x-auto rounded-md bg-gray-900 p-4">
      <pre className="min-w-max text-sm text-gray-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
```

← [[03_Web基礎（フロントエンド入門）/03_レスポンシブ/00-design-implementation|レスポンシブ実装インデックス]]
