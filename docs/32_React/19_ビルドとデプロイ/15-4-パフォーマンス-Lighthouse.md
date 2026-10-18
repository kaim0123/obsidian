# 15-4. パフォーマンス（Lighthouseの見方）

## 🎯 この章で学ぶこと

- Lighthouse の使い方とスコアの読み方
- Web Vitals（LCP / INP / CLS）の意味
- スコア改善の典型パターン

---

## 📖 Lighthouse とは

Googleが提供するWebサイト品質計測ツール。Chrome DevTools 内蔵。

**5カテゴリ**で点数化：

- Performance（速度）
- Accessibility（アクセシビリティ）
- Best Practices（ベスト準拠）
- SEO（検索）
- PWA（Progressive Web App）

---

## 💻 起動方法

### Chrome DevTools

1. F12 → Lighthouse タブ
2. カテゴリ選択 → 「Analyze page load」
3. レポートが出る

### CLI

```bash
npm install -g lighthouse
lighthouse https://example.com --view
```

### CI

GitHub Actions で `treosh/lighthouse-ci-action` などを使うと、PRごとにスコア計測。

---

## 📊 Web Vitals（最重要指標）

### LCP（Largest Contentful Paint）

「**最大コンテンツが表示されるまでの時間**」。

- 良い：2.5秒以内
- 改善必要：2.5〜4秒
- 悪い：4秒超

改善：

- 画像最適化（WebP、サイズ）
- フォント最適化
- バンドル削減
- preload

### INP（Interaction to Next Paint）

「**操作してから画面更新までの時間**」。FIDの後継。

- 良い：200ms以内
- 改善必要：200〜500ms
- 悪い：500ms超

改善：

- 重い処理を Web Worker
- useTransition で優先度下げ
- 不要な再レンダーを抑制

### CLS（Cumulative Layout Shift）

「**ページ表示中のレイアウトずれの累積**」。

- 良い：0.1以下
- 改善必要：0.1〜0.25
- 悪い：0.25超

改善：

- 画像に width / height を指定
- 動的に増えるコンテンツに高さを予約
- フォント（FOUT/FOIT）対策

---

## 💻 改善：画像

### サイズ指定

```jsx
<img src="/photo.jpg" width="800" height="600" alt="..." />
```

→ レイアウトずれ防止。

### lazy loading

```jsx
<img src="/photo.jpg" loading="lazy" />
```

→ 画面外の画像は読まない。

### WebP / AVIF

```html
<picture>
  <source srcset="/photo.webp" type="image/webp">
  <img src="/photo.jpg" alt="...">
</picture>
```

WebPは JPEG より 30%軽い。

### sizes / srcset（レスポンシブ）

```html
<img srcset="small.jpg 600w, medium.jpg 1200w, large.jpg 1800w"
     sizes="(max-width: 600px) 100vw, 50vw"
     alt="...">
```

ブラウザが画面に合った画像を選ぶ。

---

## 💻 改善：フォント

```css
@font-face {
  font-family: 'MyFont';
  src: url('/font.woff2') format('woff2');
  font-display: swap; /* 表示中も代替フォントで読める */
}
```

`<link rel="preload">` でも先読みできる：

```html
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>
```

---

## 💻 改善：バンドル

### code splitting

```jsx
const About = React.lazy(() => import('./pages/About'));
```

→ 初期バンドルが軽くなる。

### dynamic import

```jsx
async function loadHeavy() {
  const { default: HeavyLib } = await import('./heavyLib');
  return new HeavyLib();
}
```

### 不要な依存削除

```bash
npx depcheck
```

未使用パッケージを発見。

### バンドルアナライザ

```bash
npm install -D rollup-plugin-visualizer
```

```js
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [visualizer({ open: true })],
};
```

→ ビルド時に**何が大きいか**が円グラフで見える。

---

## 💻 改善：preconnect / dns-prefetch

```html
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://api.example.com">
```

→ 接続準備を先にしておく。

---

## 💻 改善：CSS

### Critical CSS

最初の画面に必要なCSSをinline化、残りは後で。

→ Vite + `vite-plugin-critical` などで自動化。

### unused CSS

Tailwind は自動削除。手書きCSSは PurgeCSS で。

---

## 💻 計測の継続

### web-vitals ライブラリ

```bash
npm install web-vitals
```

```ts
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP((metric) => console.log('LCP', metric.value));
onINP((metric) => console.log('INP', metric.value));
onCLS((metric) => console.log('CLS', metric.value));
```

→ 本物のユーザーの値を取得して分析サービスへ。

---

## 💡 スコアの目安

- **90〜100**：緑（良好）
- **50〜89**：黄（改善あり）
- **0〜49**：赤（要修正）

→ 90以上を目指すが、**完璧主義より継続改善**。

---

## ❌ よくある間違い

### 開発モードで計測

→ 開発は遅い。**`npm run preview`** でビルド版を計測。

### 1回だけで判断

→ ばらつきあり。3〜5回測って中央値。

### 全部直そうとして時間切れ

→ Web Vitals優先で改善。

### 画像サイズなしでCLS悪化

→ ✅ 必ず width/height。

---

## ✅ ベストプラクティス

1. **Lighthouse で定期計測**
2. **Web Vitals（LCP/INP/CLS）を優先**
3. **画像最適化**は効果大
4. **code splitting** で初期軽量化
5. **本物のユーザー計測**（web-vitals）

---

## 🔬 実践演習

自分のアプリの Lighthouse 計測：

- スコアを記録
- 改善点を3つ実施
- 再計測してスコア比較

---

## 📝 まとめ

- Lighthouse は開発者の友
- LCP / INP / CLS が中心指標
- 画像・フォント・バンドルが定番改善
- 90以上を目標、本物のユーザー計測も

---

## 🔗 関連ページ

- [[9-1-体感が重い原因を切り分ける]]
- [[9-5-計測]]
- [[15-1-本番ビルドと環境変数]]
