# 3. ボックスモデル

## 概要

CSSのボックスモデルは、HTML要素がどのように配置され、サイズが決定されるかを理解するための重要な概念です。この章では、マージン、パディング、ボーダー、そして要素の表示方法について詳しく学びます。

## 学習目標

- ボックスモデルの概念を理解する
- マージン、パディング、ボーダーの使い方を習得する
- ボックスサイジングの違いを理解する
- ディスプレイプロパティの種類と使い方を学ぶ
- オーバーフローの制御方法を理解する

## ボックスモデルとは

CSSでは、すべてのHTML要素は「ボックス」として扱われます。このボックスは以下の要素で構成されています：

- **コンテンツ（Content）**: テキストや画像などの実際の内容
- **パディング（Padding）**: コンテンツとボーダーの間の内側の余白
- **ボーダー（Border）**: 要素の境界線
- **マージン（Margin）**: 要素の外側の余白

```
┌─────────────────────────────────────┐ ← マージン（外側の余白）
│  ┌─────────────────────────────────┐ │
│  │ ┌─────────────────────────────┐ │ │ ← ボーダー（境界線）
│  │ │ ┌─────────────────────────┐ │ │ │
│  │ │ │     パディング           │ │ │ │ ← パディング（内側の余白）
│  │ │ │ ┌─────────────────────┐ │ │ │ │
│  │ │ │ │     コンテンツ       │ │ │ │ │ ← コンテンツ（実際の内容）
│  │ │ │ └─────────────────────┘ │ │ │ │
│  │ │ └─────────────────────────┘ │ │ │
│  │ └─────────────────────────────┘ │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## マージン（Margin）

マージンは要素の外側の余白を設定します。要素間の間隔を調整するために使用されます。

### マージンの指定方法

```css
/* 個別指定 */
margin-top: 10px;
margin-right: 20px;
margin-bottom: 10px;
margin-left: 20px;

/* ショートハンド（時計回り） */
margin: 10px;           /* 上下左右すべて10px */
margin: 10px 20px;      /* 上下10px、左右20px */
margin: 10px 20px 15px; /* 上10px、左右20px、下15px */
margin: 10px 20px 15px 25px; /* 上、右、下、左 */
```

### マージンの値

| 値 | 説明 | 例 |
|----|------|-----|
| `auto` | ブラウザが自動計算 | `margin: 0 auto;` |
| `inherit` | 親要素から継承 | `margin: inherit;` |
| `initial` | 初期値に設定 | `margin: initial;` |
| `unset` | 継承可能なら継承、そうでなければ初期値 | `margin: unset;` |

### マージンの実践例

```css
/* 基本的なマージン設定 */
.container {
    margin: 20px;
    background-color: #f0f0f0;
    padding: 20px;
}

/* 中央揃え */
.centered {
    width: 300px;
    margin: 0 auto; /* 左右を自動で中央に */
    background-color: white;
    padding: 20px;
}

/* 要素間の間隔 */
.card {
    margin-bottom: 20px; /* 下の要素との間隔 */
    background-color: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* ネガティブマージン */
.overlap {
    margin-top: -10px; /* 上の要素と重ねる */
    background-color: #ff6b6b;
    color: white;
    padding: 10px;
}
```

### マージンの相殺（Margin Collapse）

隣接する要素のマージンは相殺されます。

```css
.box1 {
    margin-bottom: 20px;
    background-color: #e74c3c;
    padding: 10px;
}

.box2 {
    margin-top: 30px; /* 実際の間隔は30px（大きい方が適用） */
    background-color: #3498db;
    padding: 10px;
}
```

## パディング（Padding）

パディングは要素の内側の余白を設定します。コンテンツとボーダーの間のスペースを調整します。

### パディングの指定方法

```css
/* 個別指定 */
padding-top: 10px;
padding-right: 20px;
padding-bottom: 10px;
padding-left: 20px;

/* ショートハンド（時計回り） */
padding: 10px;           /* 上下左右すべて10px */
padding: 10px 20px;      /* 上下10px、左右20px */
padding: 10px 20px 15px; /* 上10px、左右20px、下15px */
padding: 10px 20px 15px 25px; /* 上、右、下、左 */
```

### パディングの実践例

```css
/* 基本的なパディング */
.button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

/* カードのパディング */
.card {
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* フォーム要素のパディング */
input, textarea {
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

/* 異なる方向のパディング */
.alert {
    padding: 15px 20px 10px 20px; /* 上、右、下、左 */
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    color: #721c24;
}
```

## ボーダー（Border）

ボーダーは要素の境界線を設定します。スタイル、幅、色を指定できます。

### ボーダーの指定方法

```css
/* 個別指定 */
border-width: 2px;
border-style: solid;
border-color: #333;

/* ショートハンド */
border: 2px solid #333;

/* 方向別指定 */
border-top: 1px solid #ccc;
border-right: 2px dashed #999;
border-bottom: 3px dotted #666;
border-left: 1px solid #333;
```

### ボーダースタイル

| スタイル | 説明 | 例 |
|---------|------|-----|
| `solid` | 実線 | `border: 1px solid black;` |
| `dashed` | 破線 | `border: 1px dashed black;` |
| `dotted` | 点線 | `border: 1px dotted black;` |
| `double` | 二重線 | `border: 3px double black;` |
| `groove` | 立体的な溝 | `border: 3px groove #ccc;` |
| `ridge` | 立体的な隆起 | `border: 3px ridge #ccc;` |
| `inset` | 内側に凹む | `border: 3px inset #ccc;` |
| `outset` | 外側に凸る | `border: 3px outset #ccc;` |
| `none` | ボーダーなし | `border: none;` |
| `hidden` | 非表示 | `border: hidden;` |

### ボーダーの実践例

```css
/* 基本的なボーダー */
.bordered-box {
    border: 2px solid #333;
    padding: 20px;
    margin: 20px;
}

/* 角丸ボーダー */
.rounded-box {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
}

/* 異なる方向のボーダー */
.highlight-box {
    border-top: 3px solid #007bff;
    border-left: 1px solid #e9ecef;
    border-right: 1px solid #e9ecef;
    border-bottom: 1px solid #e9ecef;
    padding: 20px;
}

/* ボーダーなし */
.no-border {
    border: none;
    padding: 10px;
    background-color: #f8f9fa;
}

/* ホバー時のボーダー変更 */
.interactive-box {
    border: 2px solid transparent;
    padding: 15px;
    transition: border-color 0.3s ease;
}

.interactive-box:hover {
    border-color: #007bff;
}
```

## ボックスサイジング（Box Sizing）

ボックスサイジングは、要素の幅と高さの計算方法を決定します。

### ボックスサイジングの種類

#### 1. `content-box`（デフォルト）

```css
.box {
    box-sizing: content-box;
    width: 200px;
    padding: 20px;
    border: 5px solid #333;
    /* 実際の幅: 200px + 40px + 10px = 250px */
}
```

#### 2. `border-box`

```css
.box {
    box-sizing: border-box;
    width: 200px;
    padding: 20px;
    border: 5px solid #333;
    /* 実際の幅: 200px（パディングとボーダーを含む） */
}
```

### 実践的な使用例

```css
/* リセットCSS */
* {
    box-sizing: border-box;
}

/* レスポンシブなカード */
.card {
    width: 300px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    /* 幅は300pxで固定（パディングとボーダーを含む） */
}

/* フレックスアイテム */
.flex-item {
    flex: 1;
    padding: 15px;
    border: 1px solid #ccc;
    /* フレックスアイテムの幅計算が簡単になる */
}
```

## ディスプレイプロパティ（Display）

ディスプレイプロパティは、要素の表示方法を決定します。

### ディスプレイの種類

| 値 | 説明 | 特徴 |
|----|------|------|
| `block` | ブロック要素 | 改行、幅・高さ指定可能 |
| `inline` | インライン要素 | 改行なし、幅・高さ指定不可 |
| `inline-block` | インラインブロック要素 | 改行なし、幅・高さ指定可能 |
| `flex` | フレックスボックス | フレックスレイアウト |
| `grid` | グリッド | グリッドレイアウト |
| `none` | 非表示 | 要素を完全に隠す |
| `table` | テーブル | テーブルとして表示 |
| `table-cell` | テーブルセル | テーブルセルとして表示 |

### 実践例

```css
/* ブロック要素 */
.block-element {
    display: block;
    width: 200px;
    height: 100px;
    background-color: #007bff;
    margin: 10px 0;
}

/* インライン要素 */
.inline-element {
    display: inline;
    /* width、height、margin-top、margin-bottomは無効 */
    background-color: #28a745;
    padding: 5px;
}

/* インラインブロック要素 */
.inline-block-element {
    display: inline-block;
    width: 150px;
    height: 50px;
    background-color: #ffc107;
    margin: 10px;
    text-align: center;
    line-height: 50px;
}

/* フレックスボックス */
.flex-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background-color: #f8f9fa;
}

.flex-item {
    padding: 10px;
    background-color: white;
    border: 1px solid #ddd;
}

/* グリッド */
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 20px;
}

.grid-item {
    padding: 20px;
    background-color: white;
    border: 1px solid #ddd;
    text-align: center;
}

/* 非表示 */
.hidden {
    display: none;
}

/* 視覚的に非表示（スペースは保持） */
.visually-hidden {
    visibility: hidden;
}
```

## オーバーフロー（Overflow）

オーバーフローは、要素の内容が指定されたサイズを超えた場合の処理を制御します。

### オーバーフローの値

| 値 | 説明 | 動作 |
|----|------|------|
| `visible` | 表示（デフォルト） | 内容がはみ出して表示される |
| `hidden` | 非表示 | はみ出した部分を隠す |
| `scroll` | スクロール | スクロールバーを表示 |
| `auto` | 自動 | 必要に応じてスクロールバーを表示 |

### 実践例

```css
/* 基本的なオーバーフロー制御 */
.overflow-box {
    width: 200px;
    height: 100px;
    border: 1px solid #333;
    padding: 10px;
    overflow: hidden; /* はみ出した部分を隠す */
}

/* スクロール可能なコンテンツ */
.scrollable-content {
    width: 300px;
    height: 200px;
    overflow-y: auto; /* 縦方向のみスクロール */
    border: 1px solid #ddd;
    padding: 15px;
}

/* 横スクロール */
.horizontal-scroll {
    width: 300px;
    overflow-x: auto; /* 横方向のみスクロール */
    white-space: nowrap;
}

.horizontal-scroll > div {
    display: inline-block;
    width: 200px;
    margin-right: 10px;
    padding: 10px;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
}

/* テキストの省略表示 */
.text-ellipsis {
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; /* 省略記号を表示 */
}

/* 複数行の省略表示 */
.multi-line-ellipsis {
    width: 200px;
    height: 60px;
    line-height: 20px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3; /* 3行まで表示 */
    -webkit-box-orient: vertical;
}
```

## 実践的なレイアウト例

### カードレイアウト

```html
<div class="card-container">
    <div class="card">
        <h3>カードタイトル</h3>
        <p>カードの内容がここに表示されます。</p>
        <button class="card-button">詳細を見る</button>
    </div>
    <div class="card">
        <h3>カードタイトル2</h3>
        <p>もう一つのカードの内容です。</p>
        <button class="card-button">詳細を見る</button>
    </div>
</div>
```

```css
.card-container {
    display: flex;
    gap: 20px;
    padding: 20px;
    background-color: #f8f9fa;
}

.card {
    flex: 1;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.card h3 {
    margin: 0 0 15px 0;
    color: #333;
}

.card p {
    margin: 0 0 20px 0;
    color: #666;
    line-height: 1.6;
}

.card-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.card-button:hover {
    background-color: #0056b3;
}
```

### ナビゲーションメニュー

```html
<nav class="navbar">
    <div class="nav-brand">ロゴ</div>
    <ul class="nav-menu">
        <li><a href="#" class="nav-link">ホーム</a></li>
        <li><a href="#" class="nav-link">サービス</a></li>
        <li><a href="#" class="nav-link">製品</a></li>
        <li><a href="#" class="nav-link">お問い合わせ</a></li>
    </ul>
</nav>
```

```css
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    background-color: #333;
    color: white;
}

.nav-brand {
    font-size: 1.5em;
    font-weight: bold;
}

.nav-menu {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 20px;
}

.nav-link {
    color: white;
    text-decoration: none;
    padding: 10px 15px;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.nav-link:hover {
    background-color: #555;
}
```

## 練習問題

### 問題1: ボックスモデルの理解
以下のHTMLに対して、指定された要件を満たすCSSを作成してください。

```html
<div class="container">
    <div class="box box1">ボックス1</div>
    <div class="box box2">ボックス2</div>
    <div class="box box3">ボックス3</div>
</div>
```

**要件:**
- 各ボックスの幅を200px、高さを100pxに設定
- ボックス1: 赤い背景、10pxのパディング、5pxのボーダー
- ボックス2: 青い背景、20pxのパディング、2pxのボーダー
- ボックス3: 緑の背景、15pxのパディング、3pxのボーダー
- ボックス間の間隔を20pxに設定
- コンテナを中央揃えに設定

### 問題2: ディスプレイプロパティの活用
以下のHTMLに対して、異なるディスプレイプロパティを使用してスタイリングしてください。

```html
<div class="layout-container">
    <header class="header">ヘッダー</header>
    <nav class="navigation">
        <a href="#" class="nav-item">ホーム</a>
        <a href="#" class="nav-item">サービス</a>
        <a href="#" class="nav-item">お問い合わせ</a>
    </nav>
    <main class="main-content">
        <article class="article">記事1</article>
        <article class="article">記事2</article>
        <article class="article">記事3</article>
    </main>
    <footer class="footer">フッター</footer>
</div>
```

**要件:**
- ヘッダーとフッターをブロック要素として表示
- ナビゲーションをインラインブロック要素として表示
- メインコンテンツをフレックスボックスとして表示
- 記事を横並びに配置
- 適切なパディングとマージンを設定

### 問題3: オーバーフローの制御
以下のHTMLに対して、オーバーフローを適切に制御してください。

```html
<div class="content-container">
    <div class="text-box">
        <p>これは非常に長いテキストです。このテキストは指定された幅を超えて表示される可能性があります。オーバーフローを適切に制御して、見やすいレイアウトを作成してください。</p>
    </div>
    <div class="image-gallery">
        <img src="image1.jpg" alt="画像1">
        <img src="image2.jpg" alt="画像2">
        <img src="image3.jpg" alt="画像3">
        <img src="image4.jpg" alt="画像4">
        <img src="image5.jpg" alt="画像5">
    </div>
</div>
```

**要件:**
- テキストボックスで長いテキストを省略表示
- 画像ギャラリーで横スクロールを実装
- 適切なサイズと余白を設定
- レスポンシブな対応を考慮

## まとめ

この章では、CSSのボックスモデルについて詳しく学びました：

- **マージン**: 要素の外側の余白
- **パディング**: 要素の内側の余白
- **ボーダー**: 要素の境界線
- **ボックスサイジング**: 要素のサイズ計算方法
- **ディスプレイプロパティ**: 要素の表示方法
- **オーバーフロー**: 内容のはみ出し制御

これらの概念を理解することで、より精密で意図したレイアウトを作成できるようになります。

次の章では、色と背景について詳しく学びます。

---

**関連リンク:**
- [[02-selectors|セレクタとスタイリング]]
- [[04-colors-backgrounds|色と背景]]
- [[05-layout|レイアウト基礎]]
- [[03-headings|HTML見出し]] 