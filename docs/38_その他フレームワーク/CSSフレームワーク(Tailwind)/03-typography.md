# 2. 文字サイズ・タイポグラフィ（Tailwind・TSX）

React + TypeScript では `class` ではなく **`className`** にユーティリティを並べます。

## 2.1 スケールユーティリティで段階的に変える（定番）

モバイルファーストで、幅が広いほど大きくするパターンです。

```tsx
export function ArticleHeading() {
  return (
    <>
      <p className="text-base leading-relaxed md:text-lg">本文</p>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
        見出し
      </h1>
    </>
  );
}
```

- **本文**: `text-base`（16px 相当）を軸に、`md:text-lg` などで一段階ずつ足す。
- **行間**: `leading-normal` / `leading-relaxed` / `leading-loose`（本文は `relaxed` 前後が無難）。

## 2.2 任意値で fluid typography（`clamp`）

画面幅に連続的に追従させたいときは、角括弧で **任意の `font-size`** を書きます。

```tsx
export function FluidTitle() {
  return (
    <h1 className="text-[clamp(1.5rem,4vw+1rem,2.5rem)] font-bold leading-tight">
      可変見出し
    </h1>
  );
}
```

- **意味のおさらい**: `clamp(最小, 好みの可変, 最大)` で極端な大きさ／小ささを抑える。
- デザイントークンと揃えたい場合は `tailwind.config` の `theme.extend.fontSize` に名前を切ってもよいです。

## 2.3 行長・行間

- **行長**: 日本語本文はおおむね **25〜40文字** 前後が読みやすいとされることが多いです。
  - `max-w-prose`（おおむね読みやすい幅）
  - `max-w-[65ch]`（文字数ベースで上限を決めたいとき）
- **行間**: 上記のとおり `leading-relaxed` など。見出しは `leading-tight` / `leading-snug` もよく使います。

## 2.4 折り返し・はみ出し

- **長い英単語・URL**: `break-words`（必要な要素だけに付与）。強く詰めたいときは `break-all`（可読性は落ちやすい）。
- **折り返し禁止の塊**: `whitespace-nowrap`（改行ノートとセットで使うことが多い）。

```tsx
type Props = { url: string };

export function UrlLine({ url }: Props) {
  return <p className="break-words text-sm">{url}</p>;
}
```

← [[03_Web基礎（フロントエンド入門）/03_レスポンシブ/00-design-implementation|レスポンシブ実装インデックス]]
