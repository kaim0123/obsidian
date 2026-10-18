# 4. レイアウト（幅・並び・余白）— Tailwind・TSX

## 4.1 モバイルファーストの書き方

ベースクラスを「狭い画面」、`sm:` `md:` 以降を「広い画面用の上書き」と決めると読みやすいです。

## 4.2 Flex の縦積み → 横並び

```tsx
type Props = { children: React.ReactNode };

export function Toolbar({ children }: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {children}
    </div>
  );
}
```

- 狭い画面: `flex-col`。`md:flex-row` から横並びに切り替え。

## 4.3 Grid（列数をブレークポイントで変える）

```tsx
type Props = { children: React.ReactNode };

export function CardGrid({ children }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}
```

**カード最小幅＋自動列数**（CSS の `auto-fit` / `minmax` に近い挙動）をユーティリティだけで寄せる例:

```tsx
export function AutoFitGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">{children}</div>
  );
}
```

## 4.4 コンテナ（はみ出し防止）

固定の `1200px` 幅だけを与えると小さい画面で溢れます。次のような組み合わせが安全です。

```tsx
export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
  );
}
```

- `max-w-6xl` は例。`max-w-screen-lg` や `max-w-7xl` もよく使います。
- `px-*` をブレークポイントで増やすと、余白の呼吸が取りやすいです。

## 4.5 スペーシング・ギャップ

`p-4 md:p-8` / `gap-3 md:gap-6` のように、**同じ軸でプレフィックスをそろえる**とメンテしやすいです。

← [[03_Web基礎（フロントエンド入門）/03_レスポンシブ/00-design-implementation|レスポンシブ実装インデックス]]
