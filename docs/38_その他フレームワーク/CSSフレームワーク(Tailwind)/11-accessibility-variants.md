# 10. アクセシビリティ（Tailwind のバリアント・TSX）

- **ズーム禁止**の viewport は原則避ける（[[03_Web基礎（フロントエンド入門）/03_レスポンシブ/02-viewport-meta|ビューポート]]参照）。
- **動きを減らす設定**: `motion-reduce:` プレフィックスでアニメを弱める。
- **ダークモード**: `dark:`（`tailwind.config` で `darkMode: 'media'` または `'class'` を設定済みが前提）。

```tsx
export function MotionSafeCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="transition hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100">
      {children}
    </div>
  );
}
```

```tsx
export function ThemedParagraph({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-900 dark:text-gray-100">{children}</p>;
}
```

← [[03_Web基礎（フロントエンド入門）/03_レスポンシブ/00-design-implementation|レスポンシブ実装インデックス]]
