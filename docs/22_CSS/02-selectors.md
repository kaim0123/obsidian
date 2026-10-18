# 2. セレクタとスタイリング

## 概要

この章では、CSSセレクタの詳細な使い方と、より高度なスタイリングテクニックについて学びます。疑似クラス、疑似要素、属性セレクタ、そして複雑なセレクタの組み合わせを理解することで、より精密で効率的なスタイリングができるようになります。

## 学習目標

- 詳細なセレクタの種類と使い方を理解する
- 疑似クラスと疑似要素を活用できるようになる
- 属性セレクタで要素を選択できるようになる
- 複雑なセレクタの組み合わせを理解する
- 効率的なセレクタの書き方を習得する

## 詳細なセレクタ

### 子孫セレクタ（Descendant Selector）

子孫セレクタは、指定された要素の子孫（子、孫、曾孫など）を選択します。

```css
/* div内のすべてのp要素 */
div p {
    color: blue;
}

/* .container内の.buttonクラス */
.container .button {
    background-color: green;
}

/* ネストしたセレクタ */
nav ul li a {
    text-decoration: none;
    color: white;
}
```

### 子セレクタ（Child Selector）

子セレクタは、指定された要素の直接の子要素のみを選択します。

```css
/* divの直接の子要素であるp */
div > p {
    font-weight: bold;
}

/* .menuの直接の子要素であるli */
.menu > li {
    display: inline-block;
}

/* ネストした子セレクタ */
nav > ul > li > a {
    padding: 10px;
}
```

### 隣接兄弟セレクタ（Adjacent Sibling Selector）

隣接兄弟セレクタは、指定された要素の直後の兄弟要素を選択します。

```css
/* h1の直後のp要素 */
h1 + p {
    margin-top: 20px;
    font-size: 1.2em;
}

/* .highlightの直後のdiv */
.highlight + div {
    border-top: 1px solid #ccc;
    padding-top: 20px;
}
```

### 一般兄弟セレクタ（General Sibling Selector）

一般兄弟セレクタは、指定された要素の後にあるすべての兄弟要素を選択します。

```css
/* h2の後にあるすべてのp要素 */
h2 ~ p {
    color: #666;
}

/* .sectionの後にあるすべての.article */
.section ~ .article {
    margin-top: 30px;
}
```

## 疑似クラス（Pseudo-classes）

疑似クラスは、要素の特定の状態や位置を指定してスタイルを適用します。

### 状態ベースの疑似クラス

| 疑似クラス | 説明 | 例 |
|-----------|------|-----|
| `:hover` | マウスオーバー時 | `button:hover { background-color: blue; }` |
| `:active` | クリック時 | `button:active { transform: scale(0.95); }` |
| `:focus` | フォーカス時 | `input:focus { border-color: blue; }` |
| `:visited` | 訪問済みリンク | `a:visited { color: purple; }` |
| `:link` | 未訪問リンク | `a:link { color: blue; }` |
| `:disabled` | 無効状態 | `button:disabled { opacity: 0.5; }` |
| `:checked` | チェック状態 | `input:checked { accent-color: green; }` |

### 位置ベースの疑似クラス

| 疑似クラス | 説明 | 例 |
|-----------|------|-----|
| `:first-child` | 最初の子要素 | `li:first-child { font-weight: bold; }` |
| `:last-child` | 最後の子要素 | `li:last-child { border-bottom: none; }` |
| `:nth-child(n)` | n番目の子要素 | `li:nth-child(odd) { background-color: #f0f0f0; }` |
| `:nth-last-child(n)` | 後ろからn番目の子要素 | `li:nth-last-child(1) { color: red; }` |
| `:only-child` | 唯一の子要素 | `p:only-child { margin: 0; }` |
| `:first-of-type` | 同種の最初の要素 | `p:first-of-type { font-size: 1.2em; }` |
| `:last-of-type` | 同種の最後の要素 | `p:last-of-type { margin-bottom: 0; }` |
| `:nth-of-type(n)` | 同種のn番目の要素 | `p:nth-of-type(2) { color: blue; }` |

### 実践的な例

```css
/* ナビゲーションリンクのスタイル */
nav a {
    color: #333;
    text-decoration: none;
    padding: 10px 15px;
    transition: all 0.3s ease;
}

nav a:hover {
    background-color: #007bff;
    color: white;
}

nav a:active {
    transform: translateY(1px);
}

/* フォーム要素のスタイル */
input, textarea {
    border: 2px solid #ddd;
    padding: 10px;
    border-radius: 4px;
    transition: border-color 0.3s ease;
}

input:focus, textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* リストのスタイル */
ul li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

ul li:first-child {
    border-top: 1px solid #eee;
}

ul li:nth-child(even) {
    background-color: #f8f9fa;
}

ul li:last-child {
    border-bottom: none;
}

/* ボタンのスタイル */
.button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.button:hover {
    background-color: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
```

## 疑似要素（Pseudo-elements）

疑似要素は、要素の特定の部分にスタイルを適用します。

### 主要な疑似要素

| 疑似要素 | 説明 | 例 |
|---------|------|-----|
| `::before` | 要素の前にコンテンツを挿入 | `p::before { content: "→ "; }` |
| `::after` | 要素の後にコンテンツを挿入 | `p::after { content: " ←"; }` |
| `::first-line` | 要素の最初の行 | `p::first-line { font-weight: bold; }` |
| `::first-letter` | 要素の最初の文字 | `p::first-letter { font-size: 3em; }` |
| `::selection` | 選択されたテキスト | `::selection { background-color: yellow; }` |

### 実践的な例

```css
/* 引用のスタイル */
blockquote {
    position: relative;
    padding: 20px 40px;
    background-color: #f8f9fa;
    border-left: 4px solid #007bff;
    margin: 20px 0;
}

blockquote::before {
    content: '"';
    font-size: 4em;
    color: #007bff;
    position: absolute;
    left: 10px;
    top: -10px;
    font-family: serif;
}

blockquote::after {
    content: '"';
    font-size: 4em;
    color: #007bff;
    position: absolute;
    right: 10px;
    bottom: -30px;
    font-family: serif;
}

/* リンクの外部アイコン */
a[href^="http"]::after {
    content: " ↗";
    font-size: 0.8em;
    color: #666;
}

/* 必須フィールドのマーク */
.required::after {
    content: " *";
    color: red;
    font-weight: bold;
}

/* カスタムリストマーカー */
.custom-list {
    list-style: none;
    padding-left: 0;
}

.custom-list li::before {
    content: "✓";
    color: #28a745;
    font-weight: bold;
    margin-right: 10px;
}

/* ドロップキャップ */
.dropcap::first-letter {
    float: left;
    font-size: 4em;
    line-height: 0.8;
    margin: 0.1em 0.1em 0 0;
    color: #007bff;
    font-family: serif;
}

/* 選択テキストのスタイル */
::selection {
    background-color: #007bff;
    color: white;
}

::-moz-selection {
    background-color: #007bff;
    color: white;
}
```

## 属性セレクタ（Attribute Selectors）

属性セレクタは、要素の属性値に基づいて要素を選択します。

### 属性セレクタの種類

| セレクタ | 説明 | 例 |
|---------|------|-----|
| `[attr]` | 属性を持つ要素 | `[title] { cursor: help; }` |
| `[attr=val]` | 属性値が完全一致 | `[type="text"] { border: 1px solid #ccc; }` |
| `[attr~=val]` | 属性値に単語を含む | `[class~="button"] { background-color: blue; }` |
| `[attr\|=val]` | 属性値が指定値で始まる | `[lang\|="en"] { font-family: Arial; }` |
| `[attr^=val]` | 属性値が指定値で始まる | `[href^="https"] { color: green; }` |
| `[attr$=val]` | 属性値が指定値で終わる | `[src$=".jpg"] { border: 1px solid #ccc; }` |
| `[attr*=val]` | 属性値に指定値を含む | `[alt*="logo"] { max-width: 100px; }` |

### 実践的な例

```css
/* 外部リンクのスタイル */
a[href^="http"] {
    color: #007bff;
}

a[href^="https"] {
    color: #28a745;
}

/* 画像のスタイル */
img[alt] {
    border: 1px solid #ddd;
}

img[alt=""] {
    border: 2px solid red;
}

/* フォーム要素のスタイル */
input[type="text"],
input[type="email"],
input[type="password"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

input[type="submit"],
input[type="button"] {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
}

input[type="submit"]:hover,
input[type="button"]:hover {
    background-color: #0056b3;
}

/* ファイル入力のスタイル */
input[type="file"] {
    border: 2px dashed #ddd;
    padding: 20px;
    text-align: center;
    border-radius: 4px;
}

/* 必須フィールドのスタイル */
input[required] {
    border-color: #dc3545;
}

input[required]:valid {
    border-color: #28a745;
}

/* 特定のファイル形式のリンク */
a[href$=".pdf"]::after {
    content: " (PDF)";
    color: #dc3545;
    font-size: 0.8em;
}

a[href$=".doc"]::after,
a[href$=".docx"]::after {
    content: " (Word)";
    color: #007bff;
    font-size: 0.8em;
}
```

## 複雑なセレクタの組み合わせ

### 複数クラスの組み合わせ

```css
/* 複数のクラスを持つ要素 */
.button.primary {
    background-color: #007bff;
}

.button.secondary {
    background-color: #6c757d;
}

.button.large {
    padding: 15px 30px;
    font-size: 1.2em;
}

/* 状態とクラスの組み合わせ */
.button.primary:hover {
    background-color: #0056b3;
}

.button.secondary:disabled {
    background-color: #adb5bd;
}
```

### 疑似クラスと疑似要素の組み合わせ

```css
/* 最初の子要素の最初の文字 */
p:first-child::first-letter {
    font-size: 3em;
    color: #007bff;
    float: left;
    margin-right: 0.1em;
}

/* ホバー時の疑似要素 */
.button:hover::before {
    content: "→ ";
    color: white;
}

/* フォーカス時の疑似要素 */
input:focus::after {
    content: " ✓";
    color: #28a745;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
}
```

### 属性セレクタと疑似クラスの組み合わせ

```css
/* 有効な入力フィールド */
input[type="text"]:valid {
    border-color: #28a745;
}

input[type="text"]:invalid {
    border-color: #dc3545;
}

/* チェックされたチェックボックス */
input[type="checkbox"]:checked + label {
    font-weight: bold;
    color: #007bff;
}

/* 無効なボタン */
button[disabled]:hover {
    cursor: not-allowed;
    opacity: 0.6;
}
```

## セレクタの効率性

### 効率的なセレクタの書き方

```css
/* ❌ 非効率なセレクタ */
body div.container div.content div.article p {
    color: #333;
}

/* ✅ 効率的なセレクタ */
.article p {
    color: #333;
}

/* ❌ 過度に具体的なセレクタ */
div.container div.content div.article div.title h1 {
    font-size: 2em;
}

/* ✅ シンプルなセレクタ */
.article .title h1 {
    font-size: 2em;
}
```

### セレクタの優先順位を考慮した設計

```css
/* 基本スタイル */
.button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

/* バリエーション */
.button.primary {
    background-color: #007bff;
    color: white;
}

.button.secondary {
    background-color: #6c757d;
    color: white;
}

/* サイズバリエーション */
.button.small {
    padding: 5px 10px;
    font-size: 0.9em;
}

.button.large {
    padding: 15px 30px;
    font-size: 1.2em;
}

/* 状態 */
.button:hover {
    opacity: 0.8;
}

.button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

## 実践的なプロジェクト例

### ナビゲーションメニュー

```html
<nav class="navbar">
    <ul class="nav-menu">
        <li class="nav-item">
            <a href="#" class="nav-link active">ホーム</a>
        </li>
        <li class="nav-item">
            <a href="#" class="nav-link">サービス</a>
        </li>
        <li class="nav-item">
            <a href="#" class="nav-link">製品</a>
        </li>
        <li class="nav-item">
            <a href="#" class="nav-link">お問い合わせ</a>
        </li>
    </ul>
</nav>
```

```css
.navbar {
    background-color: #333;
    padding: 1rem 2rem;
}

.nav-menu {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 2rem;
}

.nav-item {
    position: relative;
}

.nav-link {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.3s ease;
    position: relative;
}

.nav-link::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background-color: #007bff;
    transition: all 0.3s ease;
    transform: translateX(-50%);
}

.nav-link:hover::before,
.nav-link.active::before {
    width: 100%;
}

.nav-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
    background-color: #007bff;
}

/* ドロップダウンメニュー */
.nav-item:hover .dropdown {
    display: block;
}

.dropdown {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    min-width: 200px;
    z-index: 1000;
}

.dropdown a {
    color: #333;
    padding: 0.75rem 1rem;
    display: block;
    text-decoration: none;
    border-bottom: 1px solid #eee;
}

.dropdown a:last-child {
    border-bottom: none;
}

.dropdown a:hover {
    background-color: #f8f9fa;
}
```

## 練習問題

### 問題1: 疑似クラスの活用
以下のHTMLに対して、適切な疑似クラスを使用してスタイリングしてください。

```html
<ul class="task-list">
    <li class="task-item">買い物に行く</li>
    <li class="task-item completed">メールを送る</li>
    <li class="task-item">会議の準備</li>
    <li class="task-item completed">レポートを書く</li>
    <li class="task-item">運動する</li>
</ul>
```

**要件:**
- 完了したタスクにチェックマークを表示
- ホバー時に背景色を変更
- 最初と最後のタスクを特別にスタイリング
- 偶数番目のタスクに背景色を設定

### 問題2: 属性セレクタの活用
以下のフォームに対して、属性セレクタを使用してスタイリングしてください。

```html
<form class="contact-form">
    <div class="form-group">
        <label for="name">お名前 *</label>
        <input type="text" id="name" name="name" required>
    </div>
    <div class="form-group">
        <label for="email">メールアドレス *</label>
        <input type="email" id="email" name="email" required>
    </div>
    <div class="form-group">
        <label for="phone">電話番号</label>
        <input type="tel" id="phone" name="phone">
    </div>
    <div class="form-group">
        <label for="message">メッセージ</label>
        <textarea id="message" name="message" rows="5"></textarea>
    </div>
    <button type="submit">送信</button>
    <button type="reset">リセット</button>
</form>
```

**要件:**
- 必須フィールドに赤いアスタリスクを表示
- 入力タイプに応じて異なるスタイルを適用
- 有効/無効状態の視覚的フィードバック
- ボタンの種類に応じたスタイリング

### 問題3: 複雑なセレクタの組み合わせ
以下のHTMLに対して、複雑なセレクタを使用してスタイリングしてください。

```html
<div class="card-container">
    <article class="card">
        <h2 class="card-title">記事タイトル1</h2>
        <p class="card-content">記事の内容がここに表示されます。</p>
        <a href="https://example.com" class="card-link">詳細を見る</a>
    </article>
    <article class="card featured">
        <h2 class="card-title">記事タイトル2</h2>
        <p class="card-content">注目記事の内容がここに表示されます。</p>
        <a href="https://example.com" class="card-link">詳細を見る</a>
    </article>
    <article class="card">
        <h2 class="card-title">記事タイトル3</h2>
        <p class="card-content">記事の内容がここに表示されます。</p>
        <a href="https://example.com" class="card-link">詳細を見る</a>
    </article>
</div>
```

**要件:**
- カードのホバー効果
- 注目記事の特別なスタイリング
- 外部リンクのアイコン表示
- カードタイトルの装飾

## まとめ

この章では、CSSセレクタの詳細な使い方について学びました：

- **詳細なセレクタ**: 子孫、子、兄弟セレクタの使い分け
- **疑似クラス**: 要素の状態や位置に基づくスタイリング
- **疑似要素**: 要素の特定部分へのスタイリング
- **属性セレクタ**: 属性値に基づく要素選択
- **効率的なセレクタ**: パフォーマンスを考慮した書き方

次の章では、ボックスモデルについて詳しく学びます。

---

**関連リンク:**
- [[01_programming/03_Web基礎（フロントエンド入門）/02_CSS/01-basics|CSSの基礎]]
- [[03-box-model|ボックスモデル]]
- [[04-colors-backgrounds|色と背景]]
- [[02-structure|HTML構造]] 