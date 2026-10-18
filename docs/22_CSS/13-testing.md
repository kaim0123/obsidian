# 12. 検証のしかた（簡易）

TypeScript ビルド（`tsc --noEmit`）や ESLint に加え、**見た目の検証**は次を意識するとよいです。

- DevTools で幅を変え、**Tailwind の境界（640 / 768 / 1024 …）の前後**を重点的に見る。
- 実機（iOS / Android）でフォームの `text-base`、固定ヘッダー、`min-h-screen` とアドレスバーの関係を確認。
- 画像の遅延読み込み `loading="lazy"` と、`srcSet` / `sizes` の効き。

React なら Strict Mode 下で二重マウントによる副作用も念のため確認すると、本番でのレスポンシブ挙動と差が出にくくなります。

← [[03_Web基礎（フロントエンド入門）/03_レスポンシブ/00-design-implementation|レスポンシブ実装インデックス]]
