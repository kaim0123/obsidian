# 5. 画像・動画・埋め込み（Tailwind・TSX）

属性名は JSX のルールに従います（`className`、`srcSet` は camelCase）。

## 5.1 最大幅・縦横比

```tsx
type ImgProps = React.ImgHTMLAttributes<HTMLImageElement>;

export function ResponsiveImage(props: ImgProps) {
  const { className, alt, ...rest } = props;
  return (
    <img
      alt={alt ?? ""}
      className={`h-auto w-full max-w-full object-cover ${className ?? ""}`}
      {...rest}
    />
  );
}
```

動画も同様に `w-full max-w-full` を基本にします。

## 5.2 アスペクト比（CLS 対策）

```tsx
type Props = { src: string; alt: string };

export function CoverImage({ src, alt }: Props) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg">
      <img className="h-full w-full object-cover" src={src} alt={alt} />
    </div>
  );
}
```

- `aspect-video`（16:9）、`aspect-square`、任意 `aspect-[4/3]` など。

## 5.3 `srcSet` / `sizes` / `loading`

Tailwind は**マークアップの属性**で指定します（クラスでは代替できない）。

```tsx
export function ArtDirectedImage() {
  return (
    <img
      src="/photo-800.jpg"
      srcSet="/photo-400.jpg 400w, /photo-800.jpg 800w"
      sizes="(max-width: 768px) 100vw, 50vw"
      alt="説明"
      className="h-auto w-full max-w-full"
      loading="lazy"
    />
  );
}
```

## 5.4 iframe（YouTube 等）

ラッパーに比率を持たせ、中身を伸ばします。

```tsx
type Props = { src: string; title: string };

export function ResponsiveIframe({ src, title }: Props) {
  return (
    <div className="aspect-video w-full max-w-full">
      <iframe className="h-full w-full" src={src} title={title} />
    </div>
  );
}
```

← [[03_Web基礎（フロントエンド入門）/03_レスポンシブ/00-design-implementation|レスポンシブ実装インデックス]]
