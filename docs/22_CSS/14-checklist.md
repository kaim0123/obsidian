# 総合チェックリスト（コピペ用）

TypeScript / React（TSX）＋ Tailwind 前提の確認項目です。

- [ ] `viewport` メタ（またはフレームワークの metadata）が適切
- [ ] 見出し・本文が `text-*` + `sm:` / `md:` または `text-[clamp(...)]` で破綻しにくい
- [ ] `leading-*` と `max-w-prose` / `max-w-[…ch]` が必要なら付いている
- [ ] 長い文字列に必要なら `break-words`（濫用しない）
- [ ] 改行意図がブレークポイントと一致（[[03_Web基礎（フロントエンド入門）/02_CSS/responsive-line-breaks|改行ノート]]）
- [ ] `flex-col` → `md:flex-row` や `grid-cols-*` の切り替えが意図どおり
- [ ] コンテナが `mx-auto w-full max-w-* px-*` 系で溢れない
- [ ] 画像・iframe が `w-full max-w-full` + `aspect-*` などで安定
- [ ] `srcSet` / `sizes` を検討、`loading="lazy"` を適所に
- [ ] ナビがタッチでも使える（表示切替・フォーカス）
- [ ] ボタン・リンクに十分な `p-*` / `min-h-[44px]` など
- [ ] 表・コードに `overflow-x-auto` など、横スクロールの逃がし
- [ ] 入力に `text-base`（iOS ズーム対策）
- [ ] `motion-reduce:` / `dark:` など、要件に応じたバリアント
- [ ] ズーム禁止にしていない／`hidden md:block` で情報が消えすぎていない

← [[03_Web基礎（フロントエンド入門）/03_レスポンシブ/00-design-implementation|レスポンシブ実装インデックス]]
