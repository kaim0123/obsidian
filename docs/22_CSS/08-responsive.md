# 8. レスポンシブデザイン

## 目次
- [8.1 レスポンシブデザインとは](#81-レスポンシブデザインとは)
- [8.2 メディアクエリ](#82-メディアクエリ)
- [8.3 ビューポート](#83-ビューポート)
- [8.4 ブレークポイント](#84-ブレークポイント)
- [8.5 モバイルファーストデザイン](#85-モバイルファーストデザイン)
- [8.6 レスポンシブ画像](#86-レスポンシブ画像)
- [8.7 タッチデバイス対応](#87-タッチデバイス対応)
- [8.8 実践的なレスポンシブレイアウト](#88-実践的なレスポンシブレイアウト)
- [8.9 練習問題](#89-練習問題)

## 8.1 レスポンシブデザインとは

レスポンシブデザインは、異なる画面サイズやデバイスで最適な表示を提供するWebデザインの手法です。

### レスポンシブデザインの重要性

```css
/* 従来の固定幅レイアウト */
.container {
  width: 960px;
  margin: 0 auto;
}

/* レスポンシブなレイアウト */
.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
}
```

### レスポンシブデザインの3つの柱

1. **フレキシブルグリッド** - 固定幅ではなく相対的な幅
2. **レスポンシブ画像** - 画面サイズに応じてサイズ調整
3. **メディアクエリ** - デバイス特性に応じたスタイル適用

## 8.2 メディアクエリ

メディアクエリは、デバイスの特性に基づいてCSSを適用するための機能です。

### 基本的なメディアクエリ

```css
/* 画面幅が768px以下の場合 */
@media screen and (max-width: 768px) {
  .container {
    padding: 0 10px;
  }
  
  .sidebar {
    display: none;
  }
}

/* 画面幅が1024px以上の場合 */
@media screen and (min-width: 1024px) {
  .container {
    max-width: 1200px;
  }
}
```

### メディアクエリの構文

```css
@media [メディアタイプ] and (条件) {
  /* CSSルール */
}
```

### メディアタイプ

```css
/* 画面表示 */
@media screen { }

/* 印刷 */
@media print { }

/* 音声 */
@media speech { }

/* すべて */
@media all { }
```

### メディア特性

```css
/* 画面幅 */
@media (max-width: 768px) { }
@media (min-width: 1024px) { }

/* 画面の高さ */
@media (max-height: 600px) { }

/* 画面の向き */
@media (orientation: portrait) { }
@media (orientation: landscape) { }

/* 解像度 */
@media (min-resolution: 2dppx) { }

/* カラー */
@media (color) { }
@media (monochrome) { }
```

### 複数条件の組み合わせ

```css
/* 画面幅が768px以上1024px以下 */
@media screen and (min-width: 768px) and (max-width: 1024px) {
  .container {
    max-width: 900px;
  }
}

/* 画面幅が768px以上または印刷時 */
@media screen and (min-width: 768px), print {
  .sidebar {
    display: block;
  }
}
```

## 8.3 ビューポート

ビューポートは、Webページが表示される画面の表示領域です。

### ビューポートメタタグ

```html
<!-- 基本的なビューポート設定 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 詳細な設定 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes">
```

### ビューポートの設定値

```html
<!-- デバイス幅に合わせる -->
<meta name="viewport" content="width=device-width">

<!-- 初期スケールを1.0に設定 -->
<meta name="viewport" content="initial-scale=1.0">

<!-- 最大スケールを制限 -->
<meta name="viewport" content="maximum-scale=2.0">

<!-- ユーザーのズームを無効化（非推奨） -->
<meta name="viewport" content="user-scalable=no">
```

### CSSでのビューポート単位

```css
/* ビューポート幅の1% */
.element {
  width: 1vw;
}

/* ビューポート高さの1% */
.element {
  height: 1vh;
}

/* ビューポートの小さい方の1% */
.element {
  width: 1vmin;
}

/* ビューポートの大きい方の1% */
.element {
  width: 1vmax;
}
```

### ビューポート単位の実用例

```css
/* フルスクリーンヘッダー */
.header {
  height: 100vh;
  background: linear-gradient(45deg, #667eea, #764ba2);
}

/* レスポンシブなフォントサイズ */
.title {
  font-size: clamp(2rem, 5vw, 4rem);
}

/* 画面に合わせたパディング */
.container {
  padding: 5vw;
}

/* 正方形の要素 */
.square {
  width: 50vmin;
  height: 50vmin;
}
```

## 8.4 ブレークポイント

ブレークポイントは、レイアウトが変更される画面幅の境界点です。

### 一般的なブレークポイント

```css
/* モバイル */
@media (max-width: 767px) {
  /* モバイル用スタイル */
}

/* タブレット */
@media (min-width: 768px) and (max-width: 1023px) {
  /* タブレット用スタイル */
}

/* デスクトップ */
@media (min-width: 1024px) {
  /* デスクトップ用スタイル */
}
```

### Bootstrap風のブレークポイント

```css
/* Extra small devices (phones, 576px and down) */
@media (max-width: 575.98px) { }

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) and (max-width: 767.98px) { }

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) and (max-width: 991.98px) { }

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) and (max-width: 1199.98px) { }

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) { }
```

### コンテンツベースのブレークポイント

```css
/* コンテンツが読みにくくなるポイント */
@media (max-width: 600px) {
  .article {
    font-size: 16px;
    line-height: 1.6;
  }
}

/* ナビゲーションが折り返されるポイント */
@media (max-width: 800px) {
  .nav {
    flex-direction: column;
  }
}

/* サイドバーが邪魔になるポイント */
@media (max-width: 1000px) {
  .sidebar {
    display: none;
  }
}
```

### CSS変数を使ったブレークポイント管理

```css
:root {
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
}

@media (min-width: var(--breakpoint-md)) {
  .container {
    max-width: 720px;
  }
}

@media (min-width: var(--breakpoint-lg)) {
  .container {
    max-width: 960px;
  }
}
```

## 8.5 モバイルファーストデザイン

モバイルファーストデザインは、モバイルデバイスを基準にデザインし、大きな画面に向けて拡張していく手法です。

### モバイルファーストの基本原則

```css
/* モバイル用の基本スタイル */
.container {
  width: 100%;
  padding: 0 15px;
}

.nav {
  flex-direction: column;
}

/* タブレット以上でスタイルを追加 */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
    margin: 0 auto;
  }
  
  .nav {
    flex-direction: row;
  }
}

/* デスクトップでさらにスタイルを追加 */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}
```

### モバイルファーストの利点

1. **パフォーマンス** - モバイル用の軽量なCSSから開始
2. **ユーザビリティ** - モバイルユーザーを最優先
3. **保守性** - 段階的な拡張で管理しやすい

### 実践例：カードレイアウト

```css
/* モバイル用：縦並び */
.card-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

/* タブレット用：2列 */
@media (min-width: 768px) {
  .card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
}

/* デスクトップ用：3列 */
@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
  }
  
  .card {
    padding: 30px;
  }
}
```

### ナビゲーションのモバイルファースト対応

```css
/* モバイル用：ハンバーガーメニュー */
.nav {
  position: relative;
}

.nav-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-menu.active {
  display: block;
}

.hamburger {
  display: block;
  cursor: pointer;
}

/* デスクトップ用：横並びメニュー */
@media (min-width: 768px) {
  .nav-menu {
    display: flex;
    position: static;
    width: auto;
    background: none;
    box-shadow: none;
  }
  
  .hamburger {
    display: none;
  }
}
```

## 8.6 レスポンシブ画像

レスポンシブ画像は、画面サイズに応じて適切に表示される画像です。

### 基本的なレスポンシブ画像

```css
/* 画像を親要素に合わせる */
.responsive-img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

```html
<img src="image.jpg" alt="説明" class="responsive-img">
```

### 複数の画像サイズ

```html
<!-- 異なる解像度の画像 -->
<img src="image-300w.jpg" 
     srcset="image-300w.jpg 300w,
             image-600w.jpg 600w,
             image-900w.jpg 900w"
     sizes="(max-width: 768px) 100vw,
            (max-width: 1024px) 50vw,
            33vw"
     alt="説明">
```

### アートディレクション

```html
<!-- 画面サイズに応じて異なる画像 -->
<picture>
  <source media="(min-width: 1024px)" srcset="desktop.jpg">
  <source media="(min-width: 768px)" srcset="tablet.jpg">
  <img src="mobile.jpg" alt="説明">
</picture>
```

### CSSでの背景画像

```css
/* レスポンシブな背景画像 */
.hero {
  background-image: url('hero-mobile.jpg');
  background-size: cover;
  background-position: center;
  height: 300px;
}

@media (min-width: 768px) {
  .hero {
    background-image: url('hero-tablet.jpg');
    height: 400px;
  }
}

@media (min-width: 1024px) {
  .hero {
    background-image: url('hero-desktop.jpg');
    height: 500px;
  }
}
```

### 画像の最適化

```css
/* 高解像度ディスプレイ対応 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .logo {
    background-image: url('logo@2x.png');
    background-size: 100px 50px;
  }
}

/* 低帯域幅対応 */
@media (max-width: 768px) {
  .hero {
    background-image: url('hero-compressed.jpg');
  }
}
```

## 8.7 タッチデバイス対応

タッチデバイスでは、マウスとは異なる操作が必要です。

### タッチターゲットのサイズ

```css
/* タッチターゲットは最低44px×44px */
.button {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 20px;
}

/* リンクも同様 */
.nav-link {
  display: block;
  padding: 12px 20px;
  min-height: 44px;
  line-height: 20px;
}
```

### タッチ操作の最適化

```css
/* タッチデバイスでのホバー効果を無効化 */
@media (hover: none) {
  .button:hover {
    background-color: inherit;
  }
}

/* タッチデバイスでのホバー効果を有効化 */
@media (hover: hover) {
  .button:hover {
    background-color: #007bff;
  }
}
```

### スワイプジェスチャー

```css
/* スワイプ可能なコンテナ */
.swipe-container {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.swipe-item {
  scroll-snap-align: start;
  flex-shrink: 0;
  width: 100%;
}

@media (min-width: 768px) {
  .swipe-item {
    width: 50%;
  }
}
```

### ピンチズームの制御

```css
/* 特定の要素でのピンチズームを無効化 */
.no-zoom {
  touch-action: manipulation;
}

/* 画像でのピンチズームを有効化 */
.zoomable-image {
  touch-action: pinch-zoom;
}
```

## 8.8 実践的なレスポンシブレイアウト

### レスポンシブなブログレイアウト

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>レスポンシブブログ</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="nav-brand">My Blog</div>
            <button class="hamburger" id="hamburger">☰</button>
            <ul class="nav-menu" id="nav-menu">
                <li><a href="#" class="nav-link">Home</a></li>
                <li><a href="#" class="nav-link">About</a></li>
                <li><a href="#" class="nav-link">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main class="main">
        <div class="container">
            <article class="article">
                <h1>レスポンシブデザインの実践</h1>
                <p>この記事では、レスポンシブデザインの実装方法について説明します。</p>
                <!-- 記事の内容 -->
            </article>
            
            <aside class="sidebar">
                <h3>関連記事</h3>
                <ul>
                    <li><a href="#">CSS Grid の使い方</a></li>
                    <li><a href="#">Flexbox の基礎</a></li>
                    <li><a href="#">モダンCSS テクニック</a></li>
                </ul>
            </aside>
        </div>
    </main>
</body>
</html>
```

```css
/* 基本スタイル */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

/* ヘッダー */
.header {
  background: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: #f0f0f0;
}

.hamburger {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

/* メインコンテンツ */
.main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.article {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.article h1 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.sidebar {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  height: fit-content;
}

.sidebar h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.sidebar ul {
  list-style: none;
}

.sidebar li {
  margin-bottom: 0.5rem;
}

.sidebar a {
  text-decoration: none;
  color: #007bff;
}

.sidebar a:hover {
  text-decoration: underline;
}

/* タブレット対応 */
@media (min-width: 768px) {
  .container {
    grid-template-columns: 2fr 1fr;
    gap: 3rem;
  }
  
  .nav {
    padding: 1rem 2rem;
  }
}

/* デスクトップ対応 */
@media (min-width: 1024px) {
  .container {
    grid-template-columns: 3fr 1fr;
    gap: 4rem;
  }
  
  .article {
    padding: 3rem;
  }
  
  .sidebar {
    padding: 2rem;
  }
}

/* モバイル用ナビゲーション */
@media (max-width: 767px) {
  .hamburger {
    display: block;
  }
  
  .nav-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: #fff;
    flex-direction: column;
    padding: 1rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .nav-menu.active {
    display: flex;
  }
  
  .nav {
    position: relative;
  }
}

/* JavaScript for hamburger menu */
```

```javascript
document.getElementById('hamburger').addEventListener('click', function() {
  document.getElementById('nav-menu').classList.toggle('active');
});
```

## 8.9 練習問題

### 問題1: レスポンシブカードレイアウト
以下の要件でレスポンシブなカードレイアウトを作成してください：

- モバイル（768px以下）：1列表示
- タブレット（768px-1024px）：2列表示
- デスクトップ（1024px以上）：3列表示

```html
<div class="card-grid">
  <div class="card">カード1</div>
  <div class="card">カード2</div>
  <div class="card">カード3</div>
  <div class="card">カード4</div>
  <div class="card">カード5</div>
  <div class="card">カード6</div>
</div>
```

### 問題2: レスポンシブナビゲーション
ハンバーガーメニュー付きのレスポンシブナビゲーションを作成してください。

### 問題3: レスポンシブ画像ギャラリー
異なる画面サイズで最適化された画像ギャラリーを作成してください。

### 問題4: メディアクエリの組み合わせ
以下の条件を満たすメディアクエリを作成してください：
- 画面幅が768px以上1024px以下
- かつ画面の向きが横向き
- かつカラーディスプレイ

### 問題5: レスポンシブなフォントサイズ
画面サイズに応じてフォントサイズが変化するテキストを作成してください。

---

**次の章**: [9. CSSアニメーションとトランジション](09-animations.md)

**前の章**: [7. CSSグリッド](07-grid.md)

**目次に戻る**: [CSS教科書目次](00-CSS%20index.md) 