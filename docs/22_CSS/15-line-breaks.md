## スマホサイズだけで改行位置をコントロールする方法（HTML+CSS / Tailwind）

Zennスクラップ向けのメモです。PCとスマホで改行位置を変えたいときの最小実装と、実運用で使うパターンをまとめました。

### 要約
- **最小解**: 改行したい位置に `br` を置き、CSS（or Tailwind）で「スマホ時のみ表示」にする。
- **言い回しが長くて崩れる問題**は、改行させたくない部分を `nowrap`（or `whitespace-nowrap`）で包むと安定する。
- **`wbr`** は「折り返してもOKな位置」を示すソフトハイフン的な目印。厳密な「スマホだけ改行」用途には `br` の表示切替が明快。

---

### ① HTML + CSS での実装

#### 最小サンプル（スマホのみ改行）
```html
<!-- HTML -->
<p class="lead">
  最高の<span class="nowrap">Web制作</span><br class="br--sp">
  入門コース
</p>
```

```css
/* CSS */
.br--sp { display: none; }                 /* デフォルト（PCなど）では非表示 */
@media (max-width: 640px) {                /* 例: 640px以下＝スマホ */
  .br--sp { display: inline; }             /* スマホでのみ改行を発生させる */
}
.nowrap { white-space: nowrap; }           /* ここは極力1行で保ちたい時に使う */
```

- ポイント
  - 改行したい箇所に `<br class="br--sp">` を置き、メディアクエリで表示切替。
  - 連語・固有名詞などは `nowrap` で折り返し禁止にしてから `br` で切ると崩れにくい。

#### バリエーション
- PCのみ改行させたい（スマホでは1行に保つ）
  ```html
  <p>
    学習効率を最大化する<br class="br--pc">
    実践型カリキュラム
  </p>
  ```
  ```css
  .br--pc { display: inline; }             /* PCでは改行 */
  @media (max-width: 640px) {
    .br--pc { display: none; }             /* スマホでは非表示＝改行しない */
  }
  ```

- `wbr` を使う（「ここで折り返してもOK」なヒント）
  ```html
  <p class="lead">
    Next<wbr>.js の入門ガイド
  </p>
  ```
  - `wbr` はCSSで表示/非表示を切り替えるものではありません。
  - レイアウト都合で任意の箇所に「折り返し許可点」を置きたいときに便利。ただし「スマホだけ確実に改行」したい要件には `br` の方が確実です。

---

### ② Tailwind CSS での実装

Tailwindはモバイルファーストです。`sm:` は「640px以上」を指すため、
- 「スマホのみ改行」= ベースで表示（=改行させる）、`sm:` 以上で隠す
- 「PCのみ改行」= ベースで隠す、`sm:` 以上で表示

#### 最小サンプル（スマホのみ改行）
```html
<p class="text-lg">
  最高の<span class="whitespace-nowrap">Web制作</span><br class="sm:hidden">
  入門コース
</p>
```
- `<br class="sm:hidden">` は「640px未満では表示＝改行、640px以上では非表示＝改行しない」。
- 崩しやすい語句は `whitespace-nowrap` で1固まりにしてから、その後ろに `br` を置くのが安定。

#### PCのみ改行させたい
```html
<p>
  学習効率を最大化する<br class="hidden sm:block">
  実践型カリキュラム
</p>
```
- ベースで `hidden`（スマホでは改行しない）、`sm:block` で640px以上のみ改行を発生。

#### 1行キープと任意改行の合わせ技
```html
<h2 class="text-2xl font-bold">
  <span class="whitespace-nowrap">JavaScript</span>
  <br class="sm:hidden">
  <span class="whitespace-nowrap">モダン開発入門</span>
</h2>
```
- 各フレーズを `whitespace-nowrap` で固め、スマホだけ `br` で切る。

---

### 実運用Tips
- **基準幅の決め方**: まずは Tailwind 既定の `sm: 640px` を目安に。プロジェクトのデザインガイドがあればそれに合わせる。
- **長い英単語・URL対策**: `break-words`（Tailwind `break-words` / CSS `overflow-wrap: anywhere` 相当）を最終手段に。
- **見出しの可読性**: 見出し(`h1`〜`h3`)に `br` を使うのはOK。ただし文言変更で崩れやすいので、翻訳・A/Bテストを想定して `nowrap` と併用。
- **アクセシビリティ**: `br` は純粋な見た目の改行。文構造を分けたいときは要素自体を分ける（例: `span` を2つにして `display:block` 切替）。

---

### チェックリスト
- **スマホだけ確実に改行したい** → `br` を置いて、CSS（or Tailwind）でスマホ時のみ表示
- **自然な折り返しを許可したい** → `wbr` を補助的に
- **語句のまとまりを守りたい** → `nowrap`（Tailwind: `whitespace-nowrap`）で固める
- **英数がはみ出す** → 最後の手段で `break-words`（必要箇所だけ）

---

### コピペ用スニペット

#### HTML + CSS（スマホのみ改行）
```html
<!-- HTML -->
<p class="lead">
  最高の<span class="nowrap">Web制作</span><br class="br--sp">
  入門コース
</p>
```
```css
/* CSS */
.br--sp { display: none; }
@media (max-width: 640px) {
  .br--sp { display: inline; }
}
.nowrap { white-space: nowrap; }
```

#### Tailwind（スマホのみ改行）
```html
<p class="text-lg">
  最高の<span class="whitespace-nowrap">Web制作</span><br class="sm:hidden">
  入門コース
</p>
```

#### Tailwind（PCのみ改行）
```html
<p>
  学習効率を最大化する<br class="hidden sm:block">
  実践型カリキュラム
</p>
```

---

必要に応じて `sm` を `md`/`lg` に変更して、改行の境界幅を調整してください。

← [[03_Web基礎（フロントエンド入門）/03_レスポンシブ/00-design-implementation|レスポンシブ実装インデックス]]
