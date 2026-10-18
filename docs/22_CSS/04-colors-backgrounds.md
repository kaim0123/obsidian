# 4. 色と背景

## 概要

この章では、CSSでの色の指定方法と背景の設定について詳しく学びます。色の値、背景色、背景画像、グラデーション、そして透明度やブレンドモードなど、Webデザインに欠かせない要素を理解し、美しいデザインを作成できるようになります。

## 学習目標

- 色の指定方法を理解する
- 背景色と背景画像の設定を習得する
- グラデーションの作成方法を学ぶ
- 透明度とブレンドモードの使い方を理解する
- 実践的なデザインパターンを習得する

## 色の指定方法

CSSでは、色を指定する方法が複数あります。それぞれの方法には特徴があり、用途に応じて使い分けることが重要です。

### 1. キーワード

CSSで定義された色名を使用します。

```css
.text-red {
    color: red;
}

.background-blue {
    background-color: blue;
}

.border-green {
    border: 2px solid green;
}
```

### 2. 16進数（Hexadecimal）

`#`に続けて6桁の16進数で色を指定します。

```css
/* 完全な16進数 */
.color-primary {
    color: #ff0000; /* 赤 */
}

.color-secondary {
    color: #00ff00; /* 緑 */
}

.color-accent {
    color: #0000ff; /* 青 */
}

/* 短縮形（3桁） */
.color-short {
    color: #f00; /* #ff0000と同じ */
    background-color: #0f0; /* #00ff00と同じ */
}
```

### 3. RGB

赤、緑、青の値を0-255で指定します。

```css
/* RGB値 */
.rgb-red {
    color: rgb(255, 0, 0);
}

.rgb-green {
    color: rgb(0, 255, 0);
}

.rgb-blue {
    color: rgb(0, 0, 255);
}

/* パーセンテージ */
.rgb-percent {
    color: rgb(100%, 0%, 0%);
}
```

### 4. RGBA

RGBに透明度（アルファ値）を追加した形式です。

```css
/* 透明度付き */
.semi-transparent {
    background-color: rgba(255, 0, 0, 0.5); /* 50%の透明度 */
}

.overlay {
    background-color: rgba(0, 0, 0, 0.7); /* 黒の70%透明度 */
}
```

### 5. HSL

色相（Hue）、彩度（Saturation）、明度（Lightness）で色を指定します。

```css
/* HSL */
.hsl-red {
    color: hsl(0, 100%, 50%); /* 赤 */
}

.hsl-green {
    color: hsl(120, 100%, 50%); /* 緑 */
}

.hsl-blue {
    color: hsl(240, 100%, 50%); /* 青 */
}
```

### 6. HSLA

HSLに透明度を追加した形式です。

```css
/* HSLA */
.hsla-transparent {
    background-color: hsla(0, 100%, 50%, 0.5); /* 赤の50%透明度 */
}
```

## 色の値一覧

### 基本的な色キーワード

| 色名 | 16進数 | RGB | 説明 |
|------|--------|-----|------|
| `black` | `#000000` | `rgb(0, 0, 0)` | 黒 |
| `white` | `#ffffff` | `rgb(255, 255, 255)` | 白 |
| `red` | `#ff0000` | `rgb(255, 0, 0)` | 赤 |
| `green` | `#00ff00` | `rgb(0, 255, 0)` | 緑 |
| `blue` | `#0000ff` | `rgb(0, 0, 255)` | 青 |
| `yellow` | `#ffff00` | `rgb(255, 255, 0)` | 黄 |
| `cyan` | `#00ffff` | `rgb(0, 255, 255)` | シアン |
| `magenta` | `#ff00ff` | `rgb(255, 0, 255)` | マゼンタ |

### グレースケール

| 色名 | 16進数 | RGB | 説明 |
|------|--------|-----|------|
| `gray` | `#808080` | `rgb(128, 128, 128)` | グレー |
| `lightgray` | `#d3d3d3` | `rgb(211, 211, 211)` | ライトグレー |
| `darkgray` | `#a9a9a9` | `rgb(169, 169, 169)` | ダークグレー |
| `silver` | `#c0c0c0` | `rgb(192, 192, 192)` | シルバー |

### 実践的な色パレット

```css
/* モダンな色パレット */
:root {
    /* プライマリカラー */
    --primary: #007bff;
    --primary-dark: #0056b3;
    --primary-light: #3391ff;
    
    /* セカンダリカラー */
    --secondary: #6c757d;
    --secondary-dark: #545b62;
    --secondary-light: #868e96;
    
    /* 成功・警告・エラー */
    --success: #28a745;
    --warning: #ffc107;
    --danger: #dc3545;
    --info: #17a2b8;
    
    /* グレースケール */
    --gray-100: #f8f9fa;
    --gray-200: #e9ecef;
    --gray-300: #dee2e6;
    --gray-400: #ced4da;
    --gray-500: #adb5bd;
    --gray-600: #6c757d;
    --gray-700: #495057;
    --gray-800: #343a40;
    --gray-900: #212529;
}

/* 使用例 */
.button-primary {
    background-color: var(--primary);
    color: white;
}

.button-secondary {
    background-color: var(--secondary);
    color: white;
}

.alert-success {
    background-color: var(--success);
    color: white;
}

.alert-warning {
    background-color: var(--warning);
    color: var(--gray-800);
}
```

## 背景色（Background Color）

背景色は要素の背景を設定します。

### 基本的な背景色

```css
/* 単純な背景色 */
.simple-bg {
    background-color: #f0f0f0;
    padding: 20px;
}

/* 透明度付き背景色 */
.transparent-bg {
    background-color: rgba(0, 123, 255, 0.1);
    padding: 20px;
}

/* グラデーション背景 */
.gradient-bg {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    color: white;
    padding: 20px;
}
```

### 背景色の実践例

```css
/* カードの背景 */
.card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin: 10px;
}

/* アラートの背景 */
.alert {
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
}

.alert-success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.alert-warning {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
}

.alert-danger {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.alert-info {
    background-color: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}
```

## 背景画像（Background Image）

背景画像は要素の背景に画像を設定します。

### 基本的な背景画像

```css
/* 単純な背景画像 */
.bg-image {
    background-image: url('image.jpg');
    width: 300px;
    height: 200px;
}

/* 背景画像の繰り返し制御 */
.bg-no-repeat {
    background-image: url('logo.png');
    background-repeat: no-repeat;
    background-position: center;
    width: 300px;
    height: 200px;
}

/* 背景画像のサイズ制御 */
.bg-cover {
    background-image: url('hero.jpg');
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 400px;
}
```

### 背景画像のプロパティ

| プロパティ | 説明 | 値の例 |
|-----------|------|--------|
| `background-image` | 背景画像のURL | `url('image.jpg')` |
| `background-repeat` | 繰り返し方法 | `repeat`, `no-repeat`, `repeat-x`, `repeat-y` |
| `background-position` | 画像の位置 | `center`, `top left`, `50% 50%` |
| `background-size` | 画像のサイズ | `cover`, `contain`, `100% 100%` |
| `background-attachment` | スクロール時の動作 | `scroll`, `fixed`, `local` |

### 背景画像の実践例

```css
/* ヒーローセクション */
.hero {
    background-image: url('hero-bg.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-align: center;
}

/* パターン背景 */
.pattern-bg {
    background-image: url('pattern.png');
    background-repeat: repeat;
    padding: 40px;
}

/* アイコン背景 */
.icon-bg {
    background-image: url('icon.svg');
    background-repeat: no-repeat;
    background-position: 10px center;
    background-size: 20px;
    padding-left: 40px;
}

/* レスポンシブ背景 */
.responsive-bg {
    background-image: url('mobile-bg.jpg');
    background-size: cover;
    background-position: center;
    min-height: 300px;
}

@media (min-width: 768px) {
    .responsive-bg {
        background-image: url('desktop-bg.jpg');
    }
}
```

## グラデーション（Gradients）

グラデーションは、色から色への滑らかな変化を作成します。

### 線形グラデーション（Linear Gradient）

```css
/* 基本的な線形グラデーション */
.linear-gradient {
    background: linear-gradient(to right, #ff6b6b, #4ecdc4);
    height: 200px;
}

/* 角度指定 */
.angle-gradient {
    background: linear-gradient(45deg, #667eea, #764ba2);
    height: 200px;
}

/* 複数色のグラデーション */
.multi-color-gradient {
    background: linear-gradient(to right, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
    height: 200px;
}

/* 色停止点の指定 */
.stop-gradient {
    background: linear-gradient(to right, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%);
    height: 200px;
}
```

### 放射グラデーション（Radial Gradient）

```css
/* 基本的な放射グラデーション */
.radial-gradient {
    background: radial-gradient(circle, #ff6b6b, #4ecdc4);
    height: 200px;
}

/* 楕円グラデーション */
.ellipse-gradient {
    background: radial-gradient(ellipse, #ff6b6b, #4ecdc4);
    height: 200px;
}

/* 位置指定 */
.positioned-gradient {
    background: radial-gradient(circle at top left, #ff6b6b, #4ecdc4);
    height: 200px;
}
```

### グラデーションの実践例

```css
/* ボタンのグラデーション */
.gradient-button {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.gradient-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* カードのグラデーション背景 */
.gradient-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* 背景のグラデーションオーバーレイ */
.overlay-gradient {
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url('image.jpg');
    background-size: cover;
    background-position: center;
    color: white;
    padding: 60px 20px;
    text-align: center;
}

/* テキストのグラデーション */
.gradient-text {
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 2em;
    font-weight: bold;
}
```

## 透明度（Opacity）

透明度は要素全体の透明度を設定します。

### 透明度の設定

```css
/* 要素全体の透明度 */
.transparent {
    opacity: 0.5; /* 50%の透明度 */
}

/* 背景のみの透明度 */
.bg-transparent {
    background-color: rgba(255, 0, 0, 0.5); /* 背景のみ50%透明 */
}

/* ホバー時の透明度変化 */
.hover-transparent {
    opacity: 1;
    transition: opacity 0.3s ease;
}

.hover-transparent:hover {
    opacity: 0.7;
}
```

### 透明度の実践例

```css
/* オーバーレイ */
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

/* フェードイン効果 */
.fade-in {
    opacity: 0;
    animation: fadeIn 1s ease-in forwards;
}

@keyframes fadeIn {
    to {
        opacity: 1;
    }
}

/* 半透明のナビゲーション */
.transparent-nav {
    background-color: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    color: white;
    padding: 15px 30px;
}
```

## ブレンドモード（Blend Modes）

ブレンドモードは、要素が背景とどのように混ざるかを制御します。

### ブレンドモードの種類

| モード | 説明 | 効果 |
|--------|------|------|
| `normal` | 通常（デフォルト） | 通常の表示 |
| `multiply` | 乗算 | 暗くなる |
| `screen` | スクリーン | 明るくなる |
| `overlay` | オーバーレイ | コントラストが強くなる |
| `darken` | 暗く | 暗い方の色を採用 |
| `lighten` | 明るく | 明るい方の色を採用 |
| `color-dodge` | 覆い焼き | 明るく、コントラストが強くなる |
| `color-burn` | 焼き込み | 暗く、コントラストが強くなる |
| `hard-light` | ハードライト | オーバーレイの逆 |
| `soft-light` | ソフトライト | より自然なオーバーレイ |
| `difference` | 差分 | 色の差を表示 |
| `exclusion` | 除外 | 差分のより柔らかい版 |

### ブレンドモードの実践例

```css
/* 画像のブレンドモード */
.blend-image {
    background-image: url('image.jpg');
    background-size: cover;
    background-position: center;
    height: 300px;
    position: relative;
}

.blend-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #ff6b6b;
    mix-blend-mode: multiply;
}

/* テキストのブレンドモード */
.blend-text {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    color: white;
    padding: 20px;
    mix-blend-mode: overlay;
}

/* カードのブレンド効果 */
.blend-card {
    background-color: #f8f9fa;
    padding: 20px;
    position: relative;
    overflow: hidden;
}

.blend-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    mix-blend-mode: soft-light;
    opacity: 0.3;
}
```

## 実践的なデザインパターン

### モダンなカードデザイン

```html
<div class="modern-card">
    <div class="card-image">
        <img src="image.jpg" alt="カード画像">
    </div>
    <div class="card-content">
        <h3>カードタイトル</h3>
        <p>カードの内容がここに表示されます。</p>
        <button class="card-button">詳細を見る</button>
    </div>
</div>
```

```css
.modern-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.modern-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-image {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.modern-card:hover .card-image img {
    transform: scale(1.1);
}

.card-content {
    padding: 20px;
}

.card-content h3 {
    margin: 0 0 10px 0;
    color: #333;
}

.card-content p {
    margin: 0 0 20px 0;
    color: #666;
    line-height: 1.6;
}

.card-button {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.card-button:hover {
    transform: translateY(-2px);
}
```

### グラデーション背景のヒーローセクション

```html
<section class="hero-section">
    <div class="hero-content">
        <h1>美しいグラデーション</h1>
        <p>モダンなデザインで印象的なWebサイトを作成しましょう。</p>
        <button class="hero-button">始める</button>
    </div>
</section>
```

```css
.hero-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
    position: relative;
    overflow: hidden;
}

.hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('pattern.svg');
    opacity: 0.1;
    animation: float 20s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
}

.hero-content {
    position: relative;
    z-index: 1;
    max-width: 600px;
    padding: 0 20px;
}

.hero-content h1 {
    font-size: 3.5rem;
    margin-bottom: 20px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-content p {
    font-size: 1.2rem;
    margin-bottom: 30px;
    opacity: 0.9;
}

.hero-button {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid white;
    padding: 15px 30px;
    border-radius: 50px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.hero-button:hover {
    background: white;
    color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
```

## 練習問題

### 問題1: 色の指定方法
以下の要件を満たすCSSを作成してください。

**要件:**
- プライマリカラーを16進数で指定
- セカンダリカラーをRGBで指定
- アクセントカラーをHSLで指定
- 背景色をRGBAで指定（透明度50%）

### 問題2: グラデーションの作成
以下のグラデーションパターンを作成してください。

**要件:**
- 線形グラデーション（45度、3色）
- 放射グラデーション（円形、2色）
- テキストにグラデーションを適用
- ホバー時にグラデーションが変化するボタン

### 問題3: 背景画像とオーバーレイ
以下のHTMLに対して、背景画像とオーバーレイを適用してください。

```html
<div class="hero-banner">
    <div class="hero-text">
        <h1>美しい背景</h1>
        <p>背景画像とオーバーレイの組み合わせ</p>
    </div>
</div>
```

**要件:**
- 背景画像を設定
- グラデーションオーバーレイを適用
- テキストを中央配置
- レスポンシブ対応

## まとめ

この章では、CSSでの色と背景の設定について詳しく学びました：

- **色の指定方法**: キーワード、16進数、RGB、HSLなど
- **背景色**: 単色、透明度付き、グラデーション
- **背景画像**: 配置、サイズ、繰り返しの制御
- **グラデーション**: 線形、放射グラデーションの作成
- **透明度とブレンドモード**: 視覚効果の向上

これらの技術を組み合わせることで、美しく魅力的なWebデザインを作成できるようになります。

次の章では、レイアウトの基礎について学びます。

---

**関連リンク:**
- [[03-box-model|ボックスモデル]]
- [[05-layout|レイアウト基礎]]
- [[06-flexbox|フレックスボックス]]
- [[04-paragraphs|HTML段落]] 