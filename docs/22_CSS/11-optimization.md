# 11. CSSの最適化とベストプラクティス

## 目次
- [11.1 CSS最適化の重要性](#111-css最適化の重要性)
- [11.2 セレクタの最適化](#112-セレクタの最適化)
- [11.3 プロパティの最適化](#113-プロパティの最適化)
- [11.4 CSSの構造化](#114-cssの構造化)
- [11.5 メンテナンス性の向上](#115-メンテナンス性の向上)
- [11.6 アクセシビリティ](#116-アクセシビリティ)
- [11.7 モダンCSSのベストプラクティス](#117-モダンcssのベストプラクティス)
- [11.8 練習問題](#118-練習問題)

## 11.1 CSS最適化の重要性

CSSの最適化は、Webサイトのパフォーマンス、保守性、ユーザビリティを向上させる重要な要素です。

### 最適化の目的

1. **パフォーマンス向上** - 読み込み速度の改善
2. **保守性向上** - コードの管理しやすさ
3. **アクセシビリティ** - すべてのユーザーへの対応
4. **ブラウザ互換性** - 様々な環境での動作保証

### 最適化の指標

```css
/* 最適化前 - 非効率なコード */
.container .wrapper .content .title {
  color: red;
  font-size: 16px;
  margin: 10px;
  padding: 5px;
}

.container .wrapper .content .subtitle {
  color: red;
  font-size: 14px;
  margin: 10px;
  padding: 5px;
}

/* 最適化後 - 効率的なコード */
.content-title {
  color: red;
  font-size: 16px;
  margin: 10px;
  padding: 5px;
}

.content-subtitle {
  color: red;
  font-size: 14px;
  margin: 10px;
  padding: 5px;
}

/* さらに最適化 - 共通スタイルの抽出 */
.content-title,
.content-subtitle {
  color: red;
  margin: 10px;
  padding: 5px;
}

.content-title {
  font-size: 16px;
}

.content-subtitle {
  font-size: 14px;
}
```

## 11.2 セレクタの最適化

### セレクタの詳細度

```css
/* 詳細度の高いセレクタ（避けるべき） */
body div.container div.wrapper div.content h1.title {
  color: red;
}

/* 詳細度の低いセレクタ（推奨） */
.title {
  color: red;
}

/* 必要に応じて適度な詳細度 */
.content .title {
  color: red;
}
```

### 効率的なセレクタ

```css
/* 非効率なセレクタ */
.container .wrapper .content .title {
  color: red;
}

/* 効率的なセレクタ */
.content-title {
  color: red;
}

/* クラスベースのセレクタ */
.btn {
  padding: 10px 20px;
  border-radius: 4px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}
```

### セレクタの組み合わせ

```css
/* 効率的な組み合わせ */
.card,
.card-header,
.card-body,
.card-footer {
  border: 1px solid #ddd;
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-header {
  background-color: #f8f9fa;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}

.card-body {
  padding: 1rem;
}

.card-footer {
  background-color: #f8f9fa;
  padding: 1rem;
  border-top: 1px solid #ddd;
}
```

## 11.3 プロパティの最適化

### ショートハンドプロパティ

```css
/* 個別プロパティ（非効率） */
.element {
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;
  padding-top: 5px;
  padding-right: 10px;
  padding-bottom: 5px;
  padding-left: 10px;
}

/* ショートハンドプロパティ（効率的） */
.element {
  margin: 10px 20px;
  padding: 5px 10px;
}

/* さらに最適化 */
.element {
  margin: 10px 20px;
  padding: 5px 10px;
  border: 1px solid #ddd;
  background: linear-gradient(45deg, #667eea, #764ba2);
}
```

### 値の最適化

```css
/* 冗長な値 */
.element {
  margin: 0px;
  padding: 0px;
  border: 0px solid #000;
  background-color: #ffffff;
}

/* 最適化された値 */
.element {
  margin: 0;
  padding: 0;
  border: 0;
  background: #fff;
}

/* 色の最適化 */
.element {
  color: #ffffff; /* 6文字 */
  background: #fff; /* 3文字 */
  border-color: #000000; /* 6文字 */
  border-color: #000; /* 3文字 */
}
```

### 不要なプロパティの削除

```css
/* 不要なプロパティを含むコード */
.element {
  width: 100%;
  height: auto;
  display: block;
  position: static;
  float: none;
  clear: none;
  overflow: visible;
  visibility: visible;
}

/* 最適化されたコード */
.element {
  width: 100%;
  /* デフォルト値のプロパティは削除 */
}
```

## 11.4 CSSの構造化

### ファイル構造

```
styles/
├── base/
│   ├── reset.css
│   ├── typography.css
│   └── variables.css
├── components/
│   ├── buttons.css
│   ├── cards.css
│   └── forms.css
├── layout/
│   ├── grid.css
│   ├── header.css
│   └── footer.css
├── utilities/
│   ├── spacing.css
│   ├── colors.css
│   └── helpers.css
└── main.css
```

### CSSの組織化

```css
/* 1. リセットとベース */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 2. 変数定義 */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --spacing-unit: 8px;
}

/* 3. ベーススタイル */
body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

/* 4. レイアウト */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-unit);
}

/* 5. コンポーネント */
.button {
  display: inline-block;
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2);
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

/* 6. ユーティリティ */
.text-center {
  text-align: center;
}

.mb-1 {
  margin-bottom: var(--spacing-unit);
}

.mb-2 {
  margin-bottom: calc(var(--spacing-unit) * 2);
}
```

### コメントの活用

```css
/* ==========================================================================
   ベーススタイル
   ========================================================================== */

/* リセット */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 変数定義 */
:root {
  /* カラーパレット */
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  
  /* スペーシング */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}

/* ==========================================================================
   レイアウト
   ========================================================================== */

/* コンテナ */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* グリッドシステム */
.grid {
  display: grid;
  gap: var(--spacing-md);
}

/* ==========================================================================
   コンポーネント
   ========================================================================== */

/* ボタン */
.button {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #0056b3;
}

/* カード */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: var(--spacing-md);
}
```

## 11.5 メンテナンス性の向上

### 命名規則

```css
/* BEM記法 */
.block {
  /* ブロックのスタイル */
}

.block__element {
  /* 要素のスタイル */
}

.block--modifier {
  /* 修飾子のスタイル */
}

/* 実例 */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card__header {
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}

.card__title {
  margin: 0;
  font-size: 1.25rem;
}

.card__body {
  padding: 1rem;
}

.card--featured {
  border: 2px solid #007bff;
}

.card--featured .card__header {
  background-color: #007bff;
  color: white;
}
```

### モジュラー設計

```css
/* ボタンモジュール */
.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn--primary {
  background-color: #007bff;
  color: white;
}

.btn--secondary {
  background-color: #6c757d;
  color: white;
}

.btn--success {
  background-color: #28a745;
  color: white;
}

.btn--danger {
  background-color: #dc3545;
  color: white;
}

.btn--small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn--large {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}
```

### 設定ファイルの活用

```css
/* _config.css */
:root {
  /* カラーパレット */
  --color-primary: #007bff;
  --color-primary-dark: #0056b3;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;
  
  /* タイポグラフィ */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-sm: 0.875rem;
  
  /* スペーシング */
  --spacing-unit: 0.25rem;
  --spacing-1: var(--spacing-unit);
  --spacing-2: calc(var(--spacing-unit) * 2);
  --spacing-3: calc(var(--spacing-unit) * 3);
  --spacing-4: calc(var(--spacing-unit) * 4);
  
  /* ボーダー */
  --border-radius: 0.375rem;
  --border-radius-lg: 0.5rem;
  --border-radius-sm: 0.25rem;
  
  /* シャドウ */
  --shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  --shadow-lg: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}
```

## 11.6 アクセシビリティ

### フォーカス管理

```css
/* フォーカスインジケーター */
.button:focus,
.link:focus,
.input:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* カスタムフォーカススタイル */
.button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

/* フォーカス可視性の制御 */
.button:focus:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}

.button:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
```

### カラーコントラスト

```css
/* 十分なコントラスト比を確保 */
.text-primary {
  color: #007bff; /* 4.5:1以上のコントラスト比 */
}

.text-secondary {
  color: #6c757d; /* 4.5:1以上のコントラスト比 */
}

/* 高コントラストモード対応 */
@media (prefers-contrast: high) {
  .button {
    border: 2px solid currentColor;
  }
  
  .card {
    border: 2px solid #000;
  }
}
```

### モーションの制御

```css
/* ユーザーの設定を尊重 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* アニメーションの一時停止 */
.pause-animations {
  animation-play-state: paused;
}

/* 特定の要素のアニメーション無効化 */
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

### スクリーンリーダー対応

```css
/* 視覚的に隠すがスクリーンリーダーでは読み上げる */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* スキップリンク */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

## 11.7 モダンCSSのベストプラクティス

### CSS GridとFlexboxの活用

```css
/* レイアウトの選択基準 */
.layout {
  /* 1次元レイアウト → Flexbox */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.grid-layout {
  /* 2次元レイアウト → CSS Grid */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

/* レスポンシブグリッド */
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### モダンなセレクタ

```css
/* 属性セレクタ */
input[type="email"] {
  border-color: #007bff;
}

/* 子セレクタ */
.card > .card-header {
  background-color: #f8f9fa;
}

/* 隣接セレクタ */
.card + .card {
  margin-top: 1rem;
}

/* 疑似クラス */
.button:hover {
  background-color: #0056b3;
}

.button:active {
  transform: translateY(1px);
}

/* 疑似要素 */
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(45deg, #667eea, #764ba2);
}
```

### パフォーマンス最適化

```css
/* GPU加速を活用 */
.element {
  transform: translateZ(0); /* レイヤー作成 */
  will-change: transform; /* 変更予告 */
}

/* 効率的なアニメーション */
.animated-element {
  /* 推奨されるプロパティ */
  transform: translateX(100px);
  opacity: 0.5;
  
  /* 避けるべきプロパティ */
  /* width: 100px; */
  /* height: 100px; */
  /* margin: 10px; */
  /* padding: 10px; */
}

/* レイアウトスラッシングの回避 */
.container {
  contain: layout style paint; /* コンテインメント */
}
```

### レスポンシブデザイン

```css
/* モバイルファースト */
.container {
  width: 100%;
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    max-width: 720px;
    margin: 0 auto;
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}

/* コンテナクエリ（新しい機能） */
@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

## 11.8 練習問題

### 問題1: セレクタの最適化
以下の非効率なセレクタを最適化してください：

```css
body div.container div.wrapper div.content h1.title {
  color: red;
  font-size: 24px;
  margin-bottom: 20px;
}

body div.container div.wrapper div.content h2.subtitle {
  color: red;
  font-size: 18px;
  margin-bottom: 20px;
}
```

### 問題2: プロパティの最適化
以下の冗長なプロパティを最適化してください：

```css
.element {
  margin-top: 0px;
  margin-right: 0px;
  margin-bottom: 0px;
  margin-left: 0px;
  padding-top: 10px;
  padding-right: 20px;
  padding-bottom: 10px;
  padding-left: 20px;
  background-color: #ffffff;
  border-width: 1px;
  border-style: solid;
  border-color: #000000;
}
```

### 問題3: アクセシビリティの改善
以下のボタンコンポーネントにアクセシビリティを改善してください：

```css
.button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

### 問題4: モジュラー設計
以下のCSSをモジュラー設計に変更してください：

```css
.primary-button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.secondary-button {
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.small-button {
  background-color: #007bff;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

### 問題5: パフォーマンス最適化
以下のアニメーションをパフォーマンス最適化してください：

```css
.animated-element {
  width: 100px;
  height: 100px;
  background-color: red;
  animation: slide 1s ease infinite;
}

@keyframes slide {
  0% { width: 100px; }
  50% { width: 200px; }
  100% { width: 100px; }
}
```

---

**次の章**: [12. 実践プロジェクト](12-project.md)

**前の章**: [10. CSS変数とカスタムプロパティ](10-variables.md)

**目次に戻る**: [CSS教科書目次](00-CSS%20index.md) 