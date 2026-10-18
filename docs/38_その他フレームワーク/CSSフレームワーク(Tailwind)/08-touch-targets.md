# 7. タッチ・操作しやすさ（Tailwind・TSX）

- **タップ領域の目安**: 多くのガイドラインで **44×44 CSS px 前後**が参照されます。見た目は小さくても、次のようにします。
  - `min-h-[44px] min-w-[44px]` や `p-3` / `px-4 py-3` で**ヒットエリア**を確保。
  - アイコンボタンなら `inline-flex items-center justify-center` と組み合わせる。
- **ホバーだけに情報を置かない**: `group-hover:` だけに依存せず、タップでも同じ情報に届く構成にします。

```tsx
type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function IconButton({ children, className, ...rest }: Props) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 ${className ?? ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}
```

← [[03_Web基礎（フロントエンド入門）/03_レスポンシブ/00-design-implementation|レスポンシブ実装インデックス]]
