# 5. レイアウト基礎

## 概要

この章では、CSSレイアウトの基礎となる概念について学びます。フロートとクリア、ポジショニング、z-indexなど、要素の配置を制御する重要な技術を理解し、基本的なレイアウトを作成できるようになります。

## 学習目標

- フロートとクリアの概念を理解する
- ポジショニングの種類と使い方を習得する
- z-indexによる重なり順の制御を学ぶ
- 基本的なレイアウトパターンを理解する
- 実践的なレイアウトを作成できるようになる

## フロート（Float）

フロートは、要素を左右に浮かせて配置するためのプロパティです。主にテキストの回り込みやレイアウトの作成に使用されます。

### フロートの基本

```css
/* 左フロート */
.float-left {
    float: left;
    width: 200px;
    height: 150px;
    background-color: #ff6b6b;
    margin: 10px;
}

/* 右フロート */
.float-right {
    float: right;
    width: 200px;
    height: 150px;
    background-color: #4ecdc4;
    margin: 10px;
}

/* フロートなし */
.no-float {
    clear: both;
    background-color: #f8f9fa;
    padding: 20px;
    margin: 10px;
}
```

### フロートの値

| 値 | 説明 | 効果 |
|----|------|------|
| `left` | 左フロート | 要素を左に浮かせる |
| `right` | 右フロート | 要素を右に浮かせる |
| `none` | フロートなし（デフォルト） | 通常の配置 |
| `inherit` | 親要素から継承 | 親要素のフロート値を継承 |

### フロートの実践例

```css
/* 画像の回り込み */
.article {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.article img {
    float: left;
    width: 300px;
    height: 200px;
    margin: 0 20px 20px 0;
    border-radius: 8px;
}

.article p {
    line-height: 1.6;
    margin-bottom: 20px;
}

/* ナビゲーションメニュー */
.nav-menu {
    list-style: none;
    margin: 0;
    padding: 0;
    background-color: #333;
}

.nav-menu li {
    float: left;
}

.nav-menu a {
    display: block;
    color: white;
    text-decoration: none;
    padding: 15px 20px;
    transition: background-color 0.3s;
}

.nav-menu a:hover {
    background-color: #555;
}

/* カードレイアウト */
.card-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.card {
    float: left;
    width: calc(33.333% - 20px);
    margin: 10px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
    box-sizing: border-box;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
    .card {
        width: calc(50% - 20px);
    }
}

@media (max-width: 480px) {
    .card {
        width: calc(100% - 20px);
        float: none;
    }
}
```

## クリア（Clear）

クリアは、フロート要素の影響を解除するためのプロパティです。

### クリアの値

| 値 | 説明 | 効果 |
|----|------|------|
| `left` | 左フロートをクリア | 左フロート要素の下に配置 |
| `right` | 右フロートをクリア | 右フロート要素の下に配置 |
| `both` | 両方のフロートをクリア | すべてのフロート要素の下に配置 |
| `none` | クリアなし（デフォルト） | フロートの影響を受ける |
| `inherit` | 親要素から継承 | 親要素のクリア値を継承 |

### クリアの実践例

```css
/* 基本的なクリア */
.clear-left {
    clear: left;
    background-color: #f8f9fa;
    padding: 20px;
    margin: 10px;
}

.clear-right {
    clear: right;
    background-color: #e9ecef;
    padding: 20px;
    margin: 10px;
}

.clear-both {
    clear: both;
    background-color: #dee2e6;
    padding: 20px;
    margin: 10px;
}

/* クリアフィックス */
.clearfix::after {
    content: "";
    display: table;
    clear: both;
}

/* フロートコンテナのクリア */
.float-container {
    border: 2px solid #333;
    padding: 20px;
    margin: 20px 0;
}

.float-container::after {
    content: "";
    display: table;
    clear: both;
}

.float-item {
    float: left;
    width: 100px;
    height: 100px;
    background-color: #ff6b6b;
    margin: 10px;
}
```

## ポジショニング（Positioning）

ポジショニングは、要素の配置方法を制御するプロパティです。

### ポジションの種類

| 値 | 説明 | 特徴 |
|----|------|------|
| `static` | 静的配置（デフォルト） | 通常のドキュメントフロー |
| `relative` | 相対配置 | 元の位置を基準に移動 |
| `absolute` | 絶対配置 | 最も近い位置指定要素を基準 |
| `fixed` | 固定配置 | ビューポートを基準に固定 |
| `sticky` | 粘着配置 | スクロールに応じて動作 |

### 1. 静的配置（Static）

```css
.static {
    position: static;
    /* top, right, bottom, left は無効 */
    background-color: #f8f9fa;
    padding: 20px;
    margin: 10px;
}
```

### 2. 相対配置（Relative）

```css
.relative {
    position: relative;
    top: 20px;
    left: 30px;
    background-color: #ff6b6b;
    color: white;
    padding: 20px;
    margin: 10px;
}

/* 元の位置を保持したまま移動 */
.relative-original {
    position: relative;
    top: -10px;
    background-color: #4ecdc4;
    padding: 20px;
    margin: 10px;
}
```

### 3. 絶対配置（Absolute）

```css
/* 親要素にposition: relativeが必要 */
.parent {
    position: relative;
    border: 2px solid #333;
    padding: 40px;
    margin: 20px;
}

.absolute {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #ff6b6b;
    color: white;
    padding: 10px;
    border-radius: 4px;
}

/* 中央配置 */
.absolute-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #4ecdc4;
    color: white;
    padding: 20px;
    border-radius: 8px;
}
```

### 4. 固定配置（Fixed）

```css
/* ヘッダーの固定 */
.fixed-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #333;
    color: white;
    padding: 15px;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 固定ボタン */
.fixed-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #007bff;
    color: white;
    border: none;
    padding: 15px;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

/* サイドバーの固定 */
.fixed-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 250px;
    height: 100vh;
    background-color: #f8f9fa;
    border-right: 1px solid #dee2e6;
    padding: 20px;
    overflow-y: auto;
}
```

### 5. 粘着配置（Sticky）

```css
/* 粘着ヘッダー */
.sticky-header {
    position: sticky;
    top: 0;
    background-color: #333;
    color: white;
    padding: 15px;
    z-index: 100;
}

/* 粘着ナビゲーション */
.sticky-nav {
    position: sticky;
    top: 60px; /* ヘッダーの高さ分下げる */
    background-color: #f8f9fa;
    padding: 10px;
    border-bottom: 1px solid #dee2e6;
    z-index: 99;
}

/* 粘着サイドバー */
.sticky-sidebar {
    position: sticky;
    top: 20px;
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

## Z-Index

z-indexは、要素の重なり順を制御するプロパティです。

### Z-Indexの基本

```css
/* 基本的なz-index */
.z-1 {
    position: relative;
    z-index: 1;
    background-color: #ff6b6b;
    padding: 20px;
}

.z-2 {
    position: relative;
    z-index: 2;
    background-color: #4ecdc4;
    padding: 20px;
    margin-top: -10px;
}

.z-3 {
    position: relative;
    z-index: 3;
    background-color: #45b7d1;
    padding: 20px;
    margin-top: -10px;
}
```

### Z-Indexの実践例

```css
/* モーダルオーバーレイ */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal {
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 1001;
    max-width: 500px;
    width: 90%;
}

/* ドロップダウンメニュー */
.dropdown {
    position: relative;
    display: inline-block;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    min-width: 200px;
    display: none;
}

.dropdown:hover .dropdown-menu {
    display: block;
}

/* ツールチップ */
.tooltip {
    position: relative;
    display: inline-block;
}

.tooltip-text {
    position: absolute;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    white-space: nowrap;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
}

.tooltip:hover .tooltip-text {
    opacity: 1;
}
```

## レイアウトの基本概念

### 1. ドキュメントフロー

```css
/* 通常のドキュメントフロー */
.normal-flow {
    background-color: #f8f9fa;
    padding: 20px;
    margin: 10px;
    border: 1px solid #dee2e6;
}

/* フロートによるフロー変更 */
.float-flow {
    float: left;
    width: 200px;
    background-color: #ff6b6b;
    color: white;
    padding: 20px;
    margin: 10px;
}

/* 絶対配置によるフローからの脱却 */
.absolute-flow {
    position: absolute;
    top: 50px;
    right: 50px;
    background-color: #4ecdc4;
    color: white;
    padding: 20px;
    width: 150px;
}
```

### 2. 包含ブロック

```css
/* 包含ブロックの例 */
.containing-block {
    position: relative;
    border: 2px solid #333;
    padding: 40px;
    margin: 20px;
    height: 300px;
}

.contained-element {
    position: absolute;
    top: 20px;
    left: 20px;
    background-color: #ff6b6b;
    color: white;
    padding: 15px;
}
```

### 3. スタッキングコンテキスト

```css
/* スタッキングコンテキストの作成 */
.stacking-context {
    position: relative;
    z-index: 1;
    background-color: #f8f9fa;
    padding: 20px;
    margin: 20px;
}

.stacking-child {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #ff6b6b;
    color: white;
    padding: 10px;
    z-index: 10;
}
```

## 実践的なレイアウト例

### 1. ヘッダー・メイン・フッターレイアウト

```html
<div class="layout">
    <header class="header">ヘッダー</header>
    <main class="main">
        <aside class="sidebar">サイドバー</aside>
        <section class="content">メインコンテンツ</section>
    </main>
    <footer class="footer">フッター</footer>
</div>
```

```css
.layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.header {
    background-color: #333;
    color: white;
    padding: 20px;
    text-align: center;
}

.main {
    flex: 1;
    display: flex;
}

.sidebar {
    width: 250px;
    background-color: #f8f9fa;
    padding: 20px;
    border-right: 1px solid #dee2e6;
}

.content {
    flex: 1;
    padding: 20px;
}

.footer {
    background-color: #333;
    color: white;
    padding: 20px;
    text-align: center;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
    .main {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid #dee2e6;
    }
}
```

### 2. カードグリッドレイアウト

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
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.card {
    float: left;
    width: calc(33.333% - 20px);
    margin: 10px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
    box-sizing: border-box;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* クリアフィックス */
.card-grid::after {
    content: "";
    display: table;
    clear: both;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
    .card {
        width: calc(50% - 20px);
    }
}

@media (max-width: 480px) {
    .card {
        width: calc(100% - 20px);
        float: none;
    }
}
```

### 3. 固定ヘッダーとサイドバー

```html
<header class="fixed-header">固定ヘッダー</header>
<aside class="fixed-sidebar">固定サイドバー</aside>
<main class="main-content">メインコンテンツ</main>
```

```css
.fixed-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background-color: #333;
    color: white;
    padding: 0 20px;
    display: flex;
    align-items: center;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.fixed-sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    width: 250px;
    height: calc(100vh - 60px);
    background-color: #f8f9fa;
    border-right: 1px solid #dee2e6;
    padding: 20px;
    overflow-y: auto;
    z-index: 999;
}

.main-content {
    margin-left: 250px;
    margin-top: 60px;
    padding: 20px;
    min-height: calc(100vh - 60px);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
    .fixed-sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
    }
    
    .fixed-sidebar.open {
        transform: translateX(0);
    }
    
    .main-content {
        margin-left: 0;
    }
}
```

## 練習問題

### 問題1: フロートレイアウト
以下のHTMLに対して、フロートを使用したレイアウトを作成してください。

```html
<div class="container">
    <div class="header">ヘッダー</div>
    <div class="sidebar">サイドバー</div>
    <div class="main">メインコンテンツ</div>
    <div class="footer">フッター</div>
</div>
```

**要件:**
- サイドバーを左フロートで配置
- メインコンテンツを右側に配置
- フッターをクリアして下部に配置
- レスポンシブ対応

### 問題2: ポジショニングの活用
以下の要素を指定された位置に配置してください。

```html
<div class="positioning-container">
    <div class="box box1">ボックス1</div>
    <div class="box box2">ボックス2</div>
    <div class="box box3">ボックス3</div>
    <div class="box box4">ボックス4</div>
</div>
```

**要件:**
- ボックス1: 相対配置で右下に移動
- ボックス2: 絶対配置で右上に配置
- ボックス3: 固定配置で画面右下に配置
- ボックス4: 粘着配置で上部に固定

### 問題3: Z-Indexの制御
以下の要素の重なり順を制御してください。

```html
<div class="layered-container">
    <div class="layer layer1">レイヤー1</div>
    <div class="layer layer2">レイヤー2</div>
    <div class="layer layer3">レイヤー3</div>
    <div class="layer layer4">レイヤー4</div>
</div>
```

**要件:**
- 各レイヤーを異なるz-indexで配置
- ホバー時に最前面に表示
- 適切な重なり順を設定

## まとめ

この章では、CSSレイアウトの基礎について詳しく学びました：

- **フロート**: 要素の左右配置とテキスト回り込み
- **クリア**: フロートの影響を解除
- **ポジショニング**: 要素の配置方法の制御
- **Z-Index**: 要素の重なり順の制御
- **レイアウト概念**: ドキュメントフロー、包含ブロック、スタッキングコンテキスト

これらの技術を組み合わせることで、複雑なレイアウトを作成できるようになります。

次の章では、フレックスボックスについて詳しく学びます。

---

**関連リンク:**
- [[04-colors-backgrounds|色と背景]]
- [[06-flexbox|フレックスボックス]]
- [[07-grid|CSSグリッド]]
- [[05-links|HTMLリンク]] 