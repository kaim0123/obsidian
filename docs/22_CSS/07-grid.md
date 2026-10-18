# 7. CSSグリッド

## 概要

CSSグリッドは、2次元のレイアウトシステムで、行と列の両方を同時に制御できます。フレックスボックスが1次元のレイアウトに特化しているのに対し、グリッドは複雑なレイアウトを簡単に作成できる強力なツールです。この章では、グリッドコンテナ、グリッドアイテム、グリッドライン、グリッドエリアについて詳しく学びます。

## 学習目標

- CSSグリッドの基本概念を理解する
- グリッドコンテナのプロパティを習得する
- グリッドアイテムの配置方法を学ぶ
- グリッドラインとグリッドエリアの使い方を理解する
- 実践的なグリッドレイアウトを作成できるようになる

## CSSグリッドとは

CSSグリッドは、行と列の両方を定義して、要素を2次元のグリッドに配置するレイアウトシステムです。

### 基本概念

- **グリッドコンテナ**: `display: grid`を設定した要素
- **グリッドアイテム**: グリッドコンテナの直接の子要素
- **グリッドライン**: グリッドの境界線
- **グリッドトラック**: 行と列の領域
- **グリッドセル**: 行と列の交差部分
- **グリッドエリア**: 複数のセルを結合した領域

## グリッドコンテナ

グリッドコンテナは、`display: grid`または`display: inline-grid`を設定した要素です。

### 基本的なグリッドコンテナ

```css
/* 基本的なグリッドコンテナ */
.grid-container {
    display: grid;
    grid-template-columns: 200px 200px 200px;
    grid-template-rows: 100px 100px;
    gap: 20px;
    background-color: #f8f9fa;
    padding: 20px;
    border: 2px solid #dee2e6;
}

.grid-item {
    background-color: #007bff;
    color: white;
    padding: 20px;
    border-radius: 4px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

### グリッドコンテナのプロパティ

#### 1. grid-template-columns（列の定義）

```css
/* 固定幅の列 */
.grid-fixed {
    display: grid;
    grid-template-columns: 200px 300px 200px;
}

/* フラクション単位 */
.grid-fraction {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
}

/* パーセンテージ */
.grid-percentage {
    display: grid;
    grid-template-columns: 25% 50% 25%;
}

/* 自動サイズ */
.grid-auto {
    display: grid;
    grid-template-columns: 200px auto 200px;
}

/* repeat関数 */
.grid-repeat {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

/* minmax関数 */
.grid-minmax {
    display: grid;
    grid-template-columns: repeat(3, minmax(200px, 1fr));
}

/* 複雑なパターン */
.grid-complex {
    display: grid;
    grid-template-columns: 200px 1fr 2fr 200px;
}
```

#### 2. grid-template-rows（行の定義）

```css
/* 固定高さの行 */
.grid-rows-fixed {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 100px 150px 100px;
}

/* フラクション単位の行 */
.grid-rows-fraction {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 1fr 2fr 1fr;
}

/* 自動サイズの行 */
.grid-rows-auto {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto auto auto;
}

/* minmax関数の行 */
.grid-rows-minmax {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, minmax(100px, auto));
}
```

#### 3. grid-template-areas（エリアの定義）

```css
/* エリア名によるレイアウト */
.grid-areas {
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    grid-template-rows: 80px 1fr 80px;
    grid-template-areas: 
        "header header header"
        "sidebar main aside"
        "footer footer footer";
    gap: 20px;
    height: 100vh;
}

.header {
    grid-area: header;
    background-color: #333;
    color: white;
    padding: 20px;
}

.sidebar {
    grid-area: sidebar;
    background-color: #f8f9fa;
    padding: 20px;
}

.main {
    grid-area: main;
    background-color: white;
    padding: 20px;
}

.aside {
    grid-area: aside;
    background-color: #f8f9fa;
    padding: 20px;
}

.footer {
    grid-area: footer;
    background-color: #333;
    color: white;
    padding: 20px;
}
```

#### 4. gap（間隔）

```css
/* 行と列の間隔 */
.grid-gap {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px; /* 行と列の両方に20pxの間隔 */
}

/* 行と列の間隔を個別に設定 */
.grid-gap-separate {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    row-gap: 30px; /* 行の間隔 */
    column-gap: 15px; /* 列の間隔 */
}

/* 古い書き方（非推奨） */
.grid-gap-old {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 20px; /* 非推奨 */
    grid-row-gap: 30px; /* 非推奨 */
    grid-column-gap: 15px; /* 非推奨 */
}
```

#### 5. justify-items（アイテムの水平配置）

```css
/* アイテムの水平配置 */
.justify-start {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    justify-items: start;
}

.justify-end {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    justify-items: end;
}

.justify-center {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    justify-items: center;
}

.justify-stretch {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    justify-items: stretch; /* デフォルト */
}
```

#### 6. align-items（アイテムの垂直配置）

```css
/* アイテムの垂直配置 */
.align-start {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 100px);
    align-items: start;
}

.align-end {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 100px);
    align-items: end;
}

.align-center {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 100px);
    align-items: center;
}

.align-stretch {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 100px);
    align-items: stretch; /* デフォルト */
}
```

#### 7. justify-content（グリッドの水平配置）

```css
/* グリッド全体の水平配置 */
.justify-content-start {
    display: grid;
    grid-template-columns: 200px 200px 200px;
    justify-content: start;
}

.justify-content-end {
    display: grid;
    grid-template-columns: 200px 200px 200px;
    justify-content: end;
}

.justify-content-center {
    display: grid;
    grid-template-columns: 200px 200px 200px;
    justify-content: center;
}

.justify-content-space-between {
    display: grid;
    grid-template-columns: 200px 200px 200px;
    justify-content: space-between;
}

.justify-content-space-around {
    display: grid;
    grid-template-columns: 200px 200px 200px;
    justify-content: space-around;
}

.justify-content-space-evenly {
    display: grid;
    grid-template-columns: 200px 200px 200px;
    justify-content: space-evenly;
}
```

#### 8. align-content（グリッドの垂直配置）

```css
/* グリッド全体の垂直配置 */
.align-content-start {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 100px 100px;
    height: 500px;
    align-content: start;
}

.align-content-end {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 100px 100px;
    height: 500px;
    align-content: end;
}

.align-content-center {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 100px 100px;
    height: 500px;
    align-content: center;
}

.align-content-space-between {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 100px 100px;
    height: 500px;
    align-content: space-between;
}
```

### ショートハンドプロパティ

```css
/* grid-template: rows / columns */
.grid-shorthand {
    display: grid;
    grid-template: 100px 1fr / 200px 1fr 200px;
}

/* grid: rows / columns / areas */
.grid-complete {
    display: grid;
    grid: 
        "header header header" 80px
        "sidebar main aside" 1fr
        "footer footer footer" 80px
        / 200px 1fr 200px;
}
```

## グリッドアイテム

グリッドアイテムは、グリッドコンテナの直接の子要素です。

### グリッドアイテムのプロパティ

#### 1. grid-column（列の配置）

```css
/* 列の開始と終了ライン */
.item-span-2 {
    grid-column: 1 / 3; /* 1番目のラインから3番目のラインまで */
}

.item-span-3 {
    grid-column: 2 / 5; /* 2番目のラインから5番目のラインまで */
}

/* spanキーワード */
.item-span {
    grid-column: 1 / span 2; /* 1番目のラインから2列分 */
}

/* 自動配置 */
.item-auto {
    grid-column: auto; /* デフォルト */
}
```

#### 2. grid-row（行の配置）

```css
/* 行の開始と終了ライン */
.item-row-span-2 {
    grid-row: 1 / 3; /* 1番目のラインから3番目のラインまで */
}

.item-row-span-3 {
    grid-row: 2 / 5; /* 2番目のラインから5番目のラインまで */
}

/* spanキーワード */
.item-row-span {
    grid-row: 1 / span 2; /* 1番目のラインから2行分 */
}

/* 自動配置 */
.item-row-auto {
    grid-row: auto; /* デフォルト */
}
```

#### 3. grid-area（エリアの指定）

```css
/* エリア名による配置 */
.item-header {
    grid-area: header;
}

.item-sidebar {
    grid-area: sidebar;
}

.item-main {
    grid-area: main;
}

.item-aside {
    grid-area: aside;
}

.item-footer {
    grid-area: footer;
}

/* ライン番号による配置 */
.item-custom {
    grid-area: 1 / 2 / 3 / 4; /* row-start / column-start / row-end / column-end */
}
```

#### 4. justify-self（個別の水平配置）

```css
/* 個別の水平配置 */
.self-start {
    justify-self: start;
}

.self-end {
    justify-self: end;
}

.self-center {
    justify-self: center;
}

.self-stretch {
    justify-self: stretch; /* デフォルト */
}
```

#### 5. align-self（個別の垂直配置）

```css
/* 個別の垂直配置 */
.self-align-start {
    align-self: start;
}

.self-align-end {
    align-self: end;
}

.self-align-center {
    align-self: center;
}

.self-align-stretch {
    align-self: stretch; /* デフォルト */
}
```

## グリッドライン

グリッドラインは、グリッドの境界線を表す番号付きのラインです。

### グリッドラインの概念

```css
/* グリッドラインの可視化 */
.grid-lines {
    display: grid;
    grid-template-columns: 200px 200px 200px;
    grid-template-rows: 100px 100px;
    gap: 20px;
    background-color: #f8f9fa;
    padding: 20px;
}

/* ライン番号の表示 */
.grid-lines::before {
    content: "1 2 3 4";
    position: absolute;
    top: 0;
    left: 0;
    color: #666;
    font-size: 12px;
}

.grid-lines::after {
    content: "1 2 3";
    position: absolute;
    top: 0;
    left: 0;
    color: #666;
    font-size: 12px;
    writing-mode: vertical-rl;
}
```

### グリッドラインの使用例

```css
/* ライン番号による配置 */
.item-line-1-3 {
    grid-column: 1 / 3; /* 1番目のラインから3番目のラインまで */
    grid-row: 1 / 2; /* 1番目のラインから2番目のラインまで */
}

.item-line-2-4 {
    grid-column: 2 / 4; /* 2番目のラインから4番目のラインまで */
    grid-row: 2 / 3; /* 2番目のラインから3番目のラインまで */
}

/* 負のライン番号 */
.item-negative {
    grid-column: -3 / -1; /* 後ろから3番目から後ろから1番目まで */
    grid-row: -2 / -1; /* 後ろから2番目から後ろから1番目まで */
}
```

## グリッドエリア

グリッドエリアは、複数のセルを結合した領域です。

### グリッドエリアの定義

```css
/* エリア名によるレイアウト */
.layout-grid {
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    grid-template-rows: 80px 1fr 80px;
    grid-template-areas: 
        "header header header"
        "sidebar main aside"
        "footer footer footer";
    gap: 20px;
    height: 100vh;
}

/* エリアの指定 */
.header-area {
    grid-area: header;
    background-color: #333;
    color: white;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sidebar-area {
    grid-area: sidebar;
    background-color: #f8f9fa;
    padding: 20px;
}

.main-area {
    grid-area: main;
    background-color: white;
    padding: 20px;
}

.aside-area {
    grid-area: aside;
    background-color: #f8f9fa;
    padding: 20px;
}

.footer-area {
    grid-area: footer;
    background-color: #333;
    color: white;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

### 複雑なエリアレイアウト

```css
/* 複雑なエリアレイアウト */
.complex-layout {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: 80px 1fr 200px 80px;
    grid-template-areas: 
        "header header header"
        "sidebar main aside"
        "sidebar gallery aside"
        "footer footer footer";
    gap: 20px;
    height: 100vh;
}

.gallery-area {
    grid-area: gallery;
    background-color: #e9ecef;
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}

.gallery-item {
    background-color: white;
    padding: 10px;
    border-radius: 4px;
    text-align: center;
}
```

## 実践的なグリッド例

### 1. レスポンシブカードグリッド

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

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
    .card-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
        padding: 15px;
    }
}

@media (max-width: 480px) {
    .card-grid {
        grid-template-columns: 1fr;
        gap: 10px;
        padding: 10px;
    }
}
```

### 2. フォトギャラリー

```html
<div class="photo-gallery">
    <div class="photo photo-large">写真1</div>
    <div class="photo">写真2</div>
    <div class="photo">写真3</div>
    <div class="photo photo-tall">写真4</div>
    <div class="photo">写真5</div>
    <div class="photo photo-wide">写真6</div>
    <div class="photo">写真7</div>
    <div class="photo">写真8</div>
</div>
```

```css
.photo-gallery {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 200px;
    gap: 10px;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.photo {
    background-color: #007bff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-weight: bold;
    transition: transform 0.3s ease;
}

.photo:hover {
    transform: scale(1.05);
}

.photo-large {
    grid-column: span 2;
    grid-row: span 2;
    background-color: #28a745;
}

.photo-tall {
    grid-row: span 2;
    background-color: #ffc107;
    color: #333;
}

.photo-wide {
    grid-column: span 2;
    background-color: #dc3545;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
    .photo-gallery {
        grid-template-columns: repeat(3, 1fr);
        grid-auto-rows: 150px;
    }
}

@media (max-width: 480px) {
    .photo-gallery {
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: 120px;
    }
}
```

### 3. ダッシュボードレイアウト

```html
<div class="dashboard">
    <header class="dashboard-header">ダッシュボード</header>
    <nav class="dashboard-nav">ナビゲーション</nav>
    <main class="dashboard-main">
        <section class="widget widget-large">メインウィジェット</section>
        <section class="widget">ウィジェット1</section>
        <section class="widget">ウィジェット2</section>
        <section class="widget">ウィジェット3</section>
        <section class="widget widget-wide">ワイドウィジェット</section>
    </main>
    <aside class="dashboard-sidebar">サイドバー</aside>
    <footer class="dashboard-footer">フッター</footer>
</div>
```

```css
.dashboard {
    display: grid;
    grid-template-columns: 250px 1fr 200px;
    grid-template-rows: 60px 1fr 60px;
    grid-template-areas: 
        "header header header"
        "nav main sidebar"
        "footer footer footer";
    height: 100vh;
    gap: 20px;
    background-color: #f8f9fa;
}

.dashboard-header {
    grid-area: header;
    background-color: #333;
    color: white;
    padding: 0 20px;
    display: flex;
    align-items: center;
    font-size: 1.5em;
    font-weight: bold;
}

.dashboard-nav {
    grid-area: nav;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-main {
    grid-area: main;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 15px;
    padding: 20px;
}

.widget {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #333;
}

.widget-large {
    grid-column: span 2;
    grid-row: span 2;
    background-color: #007bff;
    color: white;
}

.widget-wide {
    grid-column: span 2;
    background-color: #28a745;
    color: white;
}

.dashboard-sidebar {
    grid-area: sidebar;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-footer {
    grid-area: footer;
    background-color: #333;
    color: white;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* レスポンシブ対応 */
@media (max-width: 1024px) {
    .dashboard {
        grid-template-columns: 200px 1fr;
        grid-template-areas: 
            "header header"
            "nav main"
            "footer footer";
    }
    
    .dashboard-sidebar {
        display: none;
    }
}

@media (max-width: 768px) {
    .dashboard {
        grid-template-columns: 1fr;
        grid-template-areas: 
            "header"
            "nav"
            "main"
            "footer";
    }
    
    .dashboard-main {
        grid-template-columns: 1fr;
        grid-template-rows: auto;
    }
    
    .widget-large,
    .widget-wide {
        grid-column: span 1;
        grid-row: span 1;
    }
}
```

## 練習問題

### 問題1: 基本的なグリッドレイアウト
以下のHTMLに対して、CSSグリッドを使用したレイアウトを作成してください。

```html
<div class="grid-container">
    <div class="grid-item">アイテム1</div>
    <div class="grid-item">アイテム2</div>
    <div class="grid-item">アイテム3</div>
    <div class="grid-item">アイテム4</div>
    <div class="grid-item">アイテム5</div>
    <div class="grid-item">アイテム6</div>
</div>
```

**要件:**
- 3列のグリッドを作成
- アイテム間に適切な間隔を設定
- アイテムを中央揃えに配置
- レスポンシブ対応

### 問題2: グリッドエリアを使用したレイアウト
以下のHTMLに対して、グリッドエリアを使用したレイアウトを作成してください。

```html
<div class="layout">
    <header class="header">ヘッダー</header>
    <nav class="nav">ナビゲーション</nav>
    <main class="main">メインコンテンツ</main>
    <aside class="sidebar">サイドバー</aside>
    <footer class="footer">フッター</footer>
</div>
```

**要件:**
- グリッドエリアを使用してレイアウトを定義
- ヘッダーとフッターを全幅に設定
- ナビゲーション、メイン、サイドバーを適切に配置
- レスポンシブ対応

### 問題3: レスポンシブカードグリッド
以下のHTMLに対して、レスポンシブなカードグリッドを作成してください。

```html
<div class="card-grid">
    <div class="card">
        <h3>カード1</h3>
        <p>カードの内容</p>
    </div>
    <div class="card">
        <h3>カード2</h3>
        <p>カードの内容</p>
    </div>
    <div class="card">
        <h3>カード3</h3>
        <p>カードの内容</p>
    </div>
    <div class="card">
        <h3>カード4</h3>
        <p>カードの内容</p>
    </div>
    <div class="card">
        <h3>カード5</h3>
        <p>カードの内容</p>
    </div>
    <div class="card">
        <h3>カード6</h3>
        <p>カードの内容</p>
    </div>
</div>
```

**要件:**
- `auto-fit`と`minmax`を使用したレスポンシブグリッド
- デスクトップでは4列、タブレットでは3列、モバイルでは1列
- カードの高さを統一
- ホバー効果を追加

## まとめ

この章では、CSSグリッドについて詳しく学びました：

- **グリッドコンテナ**: `display: grid`による2次元レイアウト
- **グリッドアイテム**: 子要素の配置とサイズ制御
- **グリッドライン**: 境界線による精密な配置
- **グリッドエリア**: 複数セルの結合によるレイアウト
- **実践的なレイアウト**: カードグリッド、フォトギャラリー、ダッシュボード

CSSグリッドを活用することで、複雑で柔軟な2次元レイアウトを簡単に作成できるようになります。

次の章では、レスポンシブデザインについて詳しく学びます。

---

**関連リンク:**
- [[06-flexbox|フレックスボックス]]
- [[08-responsive|レスポンシブデザイン]]
- [[CSS/09-typography|タイポグラフィ]]
- [[07-lists|HTMLリスト]] 