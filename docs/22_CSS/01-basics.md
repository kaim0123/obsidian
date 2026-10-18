# 1. CSSの基礎

## 概要

CSS（Cascading Style Sheets）は、HTMLで作成されたWebページの見た目を装飾するためのスタイルシート言語です。この章では、CSSの基本概念、構文、セレクタ、そして重要な概念であるカスケーディングと継承について学びます。

## 学習目標

- CSSとは何かを理解する
- CSSの基本構文を習得する
- セレクタの種類と使い方を学ぶ
- カスケーディングと継承の概念を理解する
- 基本的なスタイリングを実装できるようになる

## CSSとは何か

CSSは「Cascading Style Sheets」の略で、Webページのスタイルを定義するための言語です。HTMLが構造を担当するのに対し、CSSは見た目を担当します。

### CSSの役割

- **レイアウト**: 要素の配置とサイズ
- **デザイン**: 色、フォント、背景
- **アニメーション**: 動的な効果
- **レスポンシブ**: デバイスに応じた表示

## CSSの基本構文

CSSは「セレクタ」と「宣言ブロック」で構成されています。

```css
セレクタ {
    プロパティ: 値;
    プロパティ: 値;
}
```

### 基本的な例

```css
h1 {
    color: blue;
    font-size: 24px;
    text-align: center;
}

p {
    color: #333;
    line-height: 1.6;
    margin-bottom: 16px;
}
```

## CSSの記述方法

CSSをHTMLに適用する方法は3つあります。

### 1. 外部CSSファイル（推奨）

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>タイトル</h1>
    <p>段落</p>
</body>
</html>
```

### 2. 内部CSS

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        h1 {
            color: blue;
            font-size: 24px;
        }
        
        p {
            color: #333;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <h1>タイトル</h1>
    <p>段落</p>
</body>
</html>
```

### 3. インラインCSS

```html
<!DOCTYPE html>
<html>
<body>
    <h1 style="color: blue; font-size: 24px;">タイトル</h1>
    <p style="color: #333; line-height: 1.6;">段落</p>
</body>
</html>
```

## セレクタの種類

セレクタは、どのHTML要素にスタイルを適用するかを指定します。

### 1. 要素セレクタ

HTML要素名を直接指定します。

```css
/* すべてのh1要素 */
h1 {
    color: red;
}

/* すべてのp要素 */
p {
    font-size: 16px;
}

/* すべてのdiv要素 */
div {
    background-color: #f0f0f0;
}
```

### 2. クラスセレクタ

クラス名の前にドット（.）を付けます。

```css
/* .highlightクラスを持つ要素 */
.highlight {
    background-color: yellow;
}

/* .buttonクラスを持つ要素 */
.button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
```

```html
<p class="highlight">このテキストは黄色い背景になります</p>
<button class="button">ボタン</button>
```

### 3. IDセレクタ

ID名の前にシャープ（#）を付けます。

```css
/* #headerというIDを持つ要素 */
#header {
    background-color: #333;
    color: white;
    padding: 20px;
}

/* #main-contentというIDを持つ要素 */
#main-content {
    max-width: 1200px;
    margin: 0 auto;
}
```

```html
<div id="header">ヘッダー</div>
<div id="main-content">メインコンテンツ</div>
```

### 4. ユニバーサルセレクタ

すべての要素に適用されます。

```css
/* すべての要素 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
```

## セレクタの組み合わせ

複数のセレクタを組み合わせて、より具体的な要素を指定できます。

### 1. 子孫セレクタ

```css
/* div内のp要素 */
div p {
    color: blue;
}

/* .container内の.buttonクラス */
.container .button {
    background-color: green;
}
```

### 2. 子セレクタ

```css
/* divの直接の子要素であるp */
div > p {
    font-weight: bold;
}
```

### 3. 隣接兄弟セレクタ

```css
/* h1の直後のp要素 */
h1 + p {
    margin-top: 20px;
}
```

### 4. 複数セレクタ

```css
/* h1、h2、h3すべてに適用 */
h1, h2, h3 {
    color: navy;
    font-family: Arial, sans-serif;
}
```

## カスケーディング（段階的適用）

CSSの「Cascading」とは、複数のCSSルールが同じ要素に適用される場合の優先順位を決定する仕組みです。

### 優先順位（詳細度）

1. **インラインスタイル** (1000点)
2. **IDセレクタ** (100点)
3. **クラスセレクタ、属性セレクタ、疑似クラス** (10点)
4. **要素セレクタ、疑似要素** (1点)

### 例

```css
/* 詳細度: 1点 */
p {
    color: red;
}

/* 詳細度: 10点 */
.highlight {
    color: blue;
}

/* 詳細度: 100点 */
#special {
    color: green;
}
```

```html
<p class="highlight" id="special">このテキストは緑色になります</p>
```

### 同じ詳細度の場合

同じ詳細度の場合は、**後に書かれたものが優先**されます。

```css
p {
    color: red;
}

p {
    color: blue; /* これが適用される */
}
```

## 継承（Inheritance）

子要素は親要素の一部のプロパティを継承します。

### 継承されるプロパティ

- `color`
- `font-family`
- `font-size`
- `line-height`
- `text-align`

### 継承されないプロパティ

- `margin`
- `padding`
- `border`
- `background`
- `width`
- `height`

### 例

```css
body {
    font-family: Arial, sans-serif;
    color: #333;
    line-height: 1.6;
}
```

```html
<body>
    <h1>タイトル</h1> <!-- font-family、color、line-heightを継承 -->
    <p>段落</p> <!-- font-family、color、line-heightを継承 -->
    <div>
        <span>スパン</span> <!-- font-family、color、line-heightを継承 -->
    </div>
</body>
```

## 基本的なプロパティ

### テキスト関連

| プロパティ | 説明 | 例 |
|-----------|------|-----|
| `color` | テキストの色 | `color: red;` |
| `font-size` | フォントサイズ | `font-size: 16px;` |
| `font-family` | フォントファミリー | `font-family: Arial, sans-serif;` |
| `font-weight` | フォントの太さ | `font-weight: bold;` |
| `text-align` | テキストの配置 | `text-align: center;` |
| `line-height` | 行間 | `line-height: 1.6;` |

### 背景関連

| プロパティ | 説明 | 例 |
|-----------|------|-----|
| `background-color` | 背景色 | `background-color: #f0f0f0;` |
| `background-image` | 背景画像 | `background-image: url('image.jpg');` |
| `background-size` | 背景画像のサイズ | `background-size: cover;` |
| `background-position` | 背景画像の位置 | `background-position: center;` |

### ボックスモデル

| プロパティ | 説明 | 例 |
|-----------|------|-----|
| `margin` | 外側の余白 | `margin: 10px;` |
| `padding` | 内側の余白 | `padding: 20px;` |
| `border` | 境界線 | `border: 1px solid black;` |
| `width` | 幅 | `width: 300px;` |
| `height` | 高さ | `height: 200px;` |

## 実践的な例

### 基本的なページスタイル

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS基礎</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Webサイトのタイトル</h1>
        <nav>
            <a href="#" class="nav-link">ホーム</a>
            <a href="#" class="nav-link">サービス</a>
            <a href="#" class="nav-link">お問い合わせ</a>
        </nav>
    </header>
    
    <main>
        <section class="hero">
            <h2>ようこそ</h2>
            <p>これはCSSの基礎を学ぶためのサンプルページです。</p>
            <button class="cta-button">詳細を見る</button>
        </section>
        
        <section class="content">
            <article>
                <h3>記事のタイトル</h3>
                <p>記事の内容がここに表示されます。</p>
            </article>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 CSS学習サイト</p>
    </footer>
</body>
</html>
```

```css
/* リセットCSS */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* 基本スタイル */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8f9fa;
}

/* ヘッダー */
header {
    background-color: #2c3e50;
    color: white;
    padding: 1rem 2rem;
}

header h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
}

nav {
    display: flex;
    gap: 2rem;
}

.nav-link {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.nav-link:hover {
    background-color: #34495e;
}

/* メインコンテンツ */
main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.hero {
    text-align: center;
    padding: 4rem 2rem;
    background-color: white;
    border-radius: 8px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.hero h2 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 1rem;
}

.hero p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 2rem;
}

.cta-button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.cta-button:hover {
    background-color: #2980b9;
}

/* コンテンツセクション */
.content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.content h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
}

.content p {
    color: #666;
    margin-bottom: 1rem;
}

/* フッター */
footer {
    background-color: #2c3e50;
    color: white;
    text-align: center;
    padding: 2rem;
    margin-top: 2rem;
}
```

## 練習問題

### 問題1: 基本的なスタイリング
以下のHTMLにCSSを適用して、見やすいページを作成してください。

```html
<!DOCTYPE html>
<html>
<head>
    <title>練習問題1</title>
</head>
<body>
    <h1>私のブログ</h1>
    <p>これは私の最初のブログ記事です。</p>
    <p>CSSを使ってスタイリングを学んでいます。</p>
    <div class="highlight">
        <h2>重要なポイント</h2>
        <p>CSSはWebデザインに不可欠です。</p>
    </div>
</body>
</html>
```

**要件:**
- ページ全体に適切なフォントと色を設定
- 見出しを目立つようにスタイリング
- `.highlight`クラスを持つ要素を強調表示
- 適切な余白とレイアウトを設定

### 問題2: セレクタの理解
以下のHTMLに対して、指定されたスタイルを適用するCSSを書いてください。

```html
<div class="container">
    <h1>メインタイトル</h1>
    <p>最初の段落</p>
    <div class="sidebar">
        <h2>サイドバー</h2>
        <p>サイドバーの内容</p>
    </div>
    <p>最後の段落</p>
</div>
```

**要件:**
- `.container`内のすべての`p`要素を青色にする
- `.sidebar`内の`h2`を赤色にする
- `.container`の直接の子要素である`h1`を緑色にする

### 問題3: カスケーディングの理解
以下のCSSで、各要素がどの色になるかを予測してください。

```css
p {
    color: red;
}

.highlight {
    color: blue;
}

#special {
    color: green;
}

p.highlight {
    color: purple;
}
```

```html
<p>通常の段落</p>
<p class="highlight">ハイライト段落</p>
<p class="highlight" id="special">特別な段落</p>
```

## まとめ

この章では、CSSの基本概念について学びました：

- **CSSの役割**: HTMLの構造に対して見た目を定義
- **基本構文**: セレクタと宣言ブロック
- **セレクタの種類**: 要素、クラス、ID、ユニバーサル
- **カスケーディング**: 優先順位と詳細度
- **継承**: 親要素から子要素へのスタイルの継承

次の章では、より詳細なセレクタとスタイリングについて学びます。

---

**関連リンク:**
- [[00-CSS index|CSS教科書]]
- [[02-selectors|セレクタとスタイリング]]
- [[03-box-model|ボックスモデル]]
- [[01_programming/03_Web基礎（フロントエンド入門）/01_HTML/01-basics|HTML基礎]] 