# 6. フレックスボックス

## 概要

フレックスボックス（Flexbox）は、CSS3で導入された強力なレイアウトシステムです。要素を柔軟に配置し、レスポンシブデザインを簡単に実現できるようになります。この章では、フレックスコンテナとフレックスアイテムの設定、主軸と交差軸の概念、そして実践的なレイアウトの作成について学びます。

## 学習目標

- フレックスボックスの基本概念を理解する
- フレックスコンテナのプロパティを習得する
- フレックスアイテムのプロパティを理解する
- 主軸と交差軸の概念を学ぶ
- 実践的なフレックスボックスレイアウトを作成できるようになる

## フレックスボックスとは

フレックスボックスは、要素を柔軟に配置するためのCSSレイアウトモデルです。従来のフロートやポジショニングよりも直感的で、レスポンシブデザインに適しています。

### 基本概念

- **フレックスコンテナ**: `display: flex`を設定した要素
- **フレックスアイテム**: フレックスコンテナの直接の子要素
- **主軸**: フレックスアイテムが配置される方向（デフォルトは水平）
- **交差軸**: 主軸に垂直な方向

## フレックスコンテナ

フレックスコンテナは、`display: flex`または`display: inline-flex`を設定した要素です。

### 基本的なフレックスコンテナ

```css
/* 基本的なフレックスコンテナ */
.flex-container {
    display: flex;
    background-color: #f8f9fa;
    padding: 20px;
    border: 2px solid #dee2e6;
}

.flex-item {
    background-color: #007bff;
    color: white;
    padding: 20px;
    margin: 5px;
    border-radius: 4px;
    text-align: center;
}
```

### フレックスコンテナのプロパティ

#### 1. flex-direction（主軸の方向）

| 値 | 説明 | 効果 |
|----|------|------|
| `row` | 水平方向（デフォルト） | 左から右へ |
| `row-reverse` | 水平方向（逆順） | 右から左へ |
| `column` | 垂直方向 | 上から下へ |
| `column-reverse` | 垂直方向（逆順） | 下から上へ |

```css
/* 水平方向（デフォルト） */
.flex-row {
    display: flex;
    flex-direction: row;
}

/* 水平方向（逆順） */
.flex-row-reverse {
    display: flex;
    flex-direction: row-reverse;
}

/* 垂直方向 */
.flex-column {
    display: flex;
    flex-direction: column;
}

/* 垂直方向（逆順） */
.flex-column-reverse {
    display: flex;
    flex-direction: column-reverse;
}
```

#### 2. flex-wrap（折り返し）

| 値 | 説明 | 効果 |
|----|------|------|
| `nowrap` | 折り返しなし（デフォルト） | 1行に収める |
| `wrap` | 折り返しあり | 複数行に分ける |
| `wrap-reverse` | 逆順で折り返し | 下から上に折り返し |

```css
/* 折り返しなし */
.flex-nowrap {
    display: flex;
    flex-wrap: nowrap;
}

/* 折り返しあり */
.flex-wrap {
    display: flex;
    flex-wrap: wrap;
}

/* 逆順で折り返し */
.flex-wrap-reverse {
    display: flex;
    flex-wrap: wrap-reverse;
}
```

#### 3. justify-content（主軸方向の配置）

| 値 | 説明 | 効果 |
|----|------|------|
| `flex-start` | 開始位置（デフォルト） | 左端（または上端）に配置 |
| `flex-end` | 終了位置 | 右端（または下端）に配置 |
| `center` | 中央 | 中央に配置 |
| `space-between` | 両端揃え | 両端に配置し、間隔を均等に |
| `space-around` | 均等配置 | 各アイテムの周りに均等な間隔 |
| `space-evenly` | 完全均等配置 | すべての間隔を完全に均等に |

```css
/* 開始位置 */
.justify-start {
    display: flex;
    justify-content: flex-start;
}

/* 終了位置 */
.justify-end {
    display: flex;
    justify-content: flex-end;
}

/* 中央 */
.justify-center {
    display: flex;
    justify-content: center;
}

/* 両端揃え */
.justify-between {
    display: flex;
    justify-content: space-between;
}

/* 均等配置 */
.justify-around {
    display: flex;
    justify-content: space-around;
}

/* 完全均等配置 */
.justify-evenly {
    display: flex;
    justify-content: space-evenly;
}
```

#### 4. align-items（交差軸方向の配置）

| 値 | 説明 | 効果 |
|----|------|------|
| `stretch` | 伸縮（デフォルト） | コンテナの高さに合わせて伸縮 |
| `flex-start` | 開始位置 | 上端に配置 |
| `flex-end` | 終了位置 | 下端に配置 |
| `center` | 中央 | 中央に配置 |
| `baseline` | ベースライン | テキストのベースラインで揃える |

```css
/* 伸縮（デフォルト） */
.align-stretch {
    display: flex;
    align-items: stretch;
}

/* 開始位置 */
.align-start {
    display: flex;
    align-items: flex-start;
}

/* 終了位置 */
.align-end {
    display: flex;
    align-items: flex-end;
}

/* 中央 */
.align-center {
    display: flex;
    align-items: center;
}

/* ベースライン */
.align-baseline {
    display: flex;
    align-items: baseline;
}
```

#### 5. align-content（複数行の配置）

| 値 | 説明 | 効果 |
|----|------|------|
| `stretch` | 伸縮（デフォルト） | 行間を均等に伸縮 |
| `flex-start` | 開始位置 | 上端に配置 |
| `flex-end` | 終了位置 | 下端に配置 |
| `center` | 中央 | 中央に配置 |
| `space-between` | 両端揃え | 両端に配置し、間隔を均等に |
| `space-around` | 均等配置 | 各行の周りに均等な間隔 |

```css
/* 複数行の配置 */
.flex-multiline {
    display: flex;
    flex-wrap: wrap;
    height: 300px;
    align-content: space-between;
}
```

### ショートハンドプロパティ

```css
/* flex-direction + flex-wrap */
.flex-flow {
    display: flex;
    flex-flow: row wrap;
}

/* すべてのプロパティを一括設定 */
.flex-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    align-content: space-between;
}
```

## フレックスアイテム

フレックスアイテムは、フレックスコンテナの直接の子要素です。

### フレックスアイテムのプロパティ

#### 1. order（順序）

```css
/* 順序の変更 */
.item-1 {
    order: 1;
}

.item-2 {
    order: 2;
}

.item-3 {
    order: 3;
}

/* 逆順にする */
.reverse-order .item-1 { order: 3; }
.reverse-order .item-2 { order: 2; }
.reverse-order .item-3 { order: 1; }
```

#### 2. flex-grow（伸縮比率）

```css
/* 伸縮比率 */
.grow-1 {
    flex-grow: 1; /* 1倍の伸縮 */
}

.grow-2 {
    flex-grow: 2; /* 2倍の伸縮 */
}

.grow-3 {
    flex-grow: 3; /* 3倍の伸縮 */
}

/* 均等に伸縮 */
.equal-grow {
    flex-grow: 1;
}
```

#### 3. flex-shrink（縮小比率）

```css
/* 縮小比率 */
.shrink-0 {
    flex-shrink: 0; /* 縮小しない */
}

.shrink-1 {
    flex-shrink: 1; /* 通常の縮小 */
}

.shrink-2 {
    flex-shrink: 2; /* 2倍の縮小 */
}
```

#### 4. flex-basis（基準サイズ）

```css
/* 基準サイズ */
.basis-100 {
    flex-basis: 100px;
}

.basis-200 {
    flex-basis: 200px;
}

.basis-auto {
    flex-basis: auto; /* コンテンツサイズ */
}

.basis-0 {
    flex-basis: 0; /* 最小サイズ */
}
```

#### 5. flex（ショートハンド）

```css
/* flex: grow shrink basis */
.flex-1 {
    flex: 1; /* flex: 1 1 0% */
}

.flex-2 {
    flex: 2; /* flex: 2 1 0% */
}

.flex-auto {
    flex: auto; /* flex: 1 1 auto */
}

.flex-none {
    flex: none; /* flex: 0 0 auto */
}

.flex-initial {
    flex: initial; /* flex: 0 1 auto */
}

/* カスタム値 */
.flex-custom {
    flex: 2 1 200px; /* grow: 2, shrink: 1, basis: 200px */
}
```

#### 6. align-self（個別の交差軸配置）

```css
/* 個別の配置 */
.self-start {
    align-self: flex-start;
}

.self-end {
    align-self: flex-end;
}

.self-center {
    align-self: center;
}

.self-stretch {
    align-self: stretch;
}

.self-baseline {
    align-self: baseline;
}
```

## 主軸と交差軸

### 主軸（Main Axis）

主軸は、フレックスアイテムが配置される方向です。

```css
/* 水平方向の主軸（デフォルト） */
.flex-row {
    display: flex;
    flex-direction: row;
    /* 主軸: 水平方向（左から右） */
    /* justify-content: 主軸方向の配置 */
    /* flex-grow/flex-shrink: 主軸方向の伸縮 */
}

/* 垂直方向の主軸 */
.flex-column {
    display: flex;
    flex-direction: column;
    /* 主軸: 垂直方向（上から下） */
    /* justify-content: 主軸方向の配置 */
    /* flex-grow/flex-shrink: 主軸方向の伸縮 */
}
```

### 交差軸（Cross Axis）

交差軸は、主軸に垂直な方向です。

```css
/* 水平主軸の場合の交差軸 */
.flex-row {
    display: flex;
    flex-direction: row;
    /* 交差軸: 垂直方向（上から下） */
    /* align-items: 交差軸方向の配置 */
    /* align-self: 個別の交差軸配置 */
}

/* 垂直主軸の場合の交差軸 */
.flex-column {
    display: flex;
    flex-direction: column;
    /* 交差軸: 水平方向（左から右） */
    /* align-items: 交差軸方向の配置 */
    /* align-self: 個別の交差軸配置 */
}
```

## 実践的なフレックスボックス例

### 1. ナビゲーションメニュー

```html
<nav class="navbar">
    <div class="nav-brand">ロゴ</div>
    <ul class="nav-menu">
        <li><a href="#">ホーム</a></li>
        <li><a href="#">サービス</a></li>
        <li><a href="#">製品</a></li>
        <li><a href="#">お問い合わせ</a></li>
    </ul>
    <div class="nav-actions">
        <button class="btn-login">ログイン</button>
        <button class="btn-signup">サインアップ</button>
    </div>
</nav>
```

```css
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #333;
    color: white;
    padding: 0 20px;
    height: 60px;
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

.nav-menu a {
    color: white;
    text-decoration: none;
    padding: 10px 15px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.nav-menu a:hover {
    background-color: #555;
}

.nav-actions {
    display: flex;
    gap: 10px;
}

.btn-login, .btn-signup {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-login {
    background-color: transparent;
    color: white;
    border: 1px solid white;
}

.btn-signup {
    background-color: #007bff;
    color: white;
}

.btn-login:hover {
    background-color: white;
    color: #333;
}

.btn-signup:hover {
    background-color: #0056b3;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
    .navbar {
        flex-direction: column;
        height: auto;
        padding: 20px;
    }
    
    .nav-menu {
        flex-direction: column;
        width: 100%;
        margin: 20px 0;
    }
    
    .nav-actions {
        width: 100%;
        justify-content: center;
    }
}
```

### 2. カードレイアウト

```html
<div class="card-container">
    <div class="card">
        <h3>カードタイトル1</h3>
        <p>カードの内容がここに表示されます。</p>
        <button class="card-button">詳細を見る</button>
    </div>
    <div class="card">
        <h3>カードタイトル2</h3>
        <p>もう一つのカードの内容です。</p>
        <button class="card-button">詳細を見る</button>
    </div>
    <div class="card">
        <h3>カードタイトル3</h3>
        <p>三つ目のカードの内容です。</p>
        <button class="card-button">詳細を見る</button>
    </div>
</div>
```

```css
.card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.card {
    flex: 1 1 300px;
    display: flex;
    flex-direction: column;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card h3 {
    margin: 0 0 15px 0;
    color: #333;
}

.card p {
    margin: 0 0 20px 0;
    color: #666;
    line-height: 1.6;
    flex-grow: 1; /* 残りのスペースを埋める */
}

.card-button {
    align-self: flex-start; /* ボタンを左端に配置 */
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.card-button:hover {
    background-color: #0056b3;
}
```

### 3. フォームレイアウト

```html
<form class="form-container">
    <div class="form-group">
        <label for="name">お名前</label>
        <input type="text" id="name" name="name" required>
    </div>
    <div class="form-group">
        <label for="email">メールアドレス</label>
        <input type="email" id="email" name="email" required>
    </div>
    <div class="form-row">
        <div class="form-group">
            <label for="phone">電話番号</label>
            <input type="tel" id="phone" name="phone">
        </div>
        <div class="form-group">
            <label for="age">年齢</label>
            <input type="number" id="age" name="age" min="0" max="120">
        </div>
    </div>
    <div class="form-group">
        <label for="message">メッセージ</label>
        <textarea id="message" name="message" rows="5"></textarea>
    </div>
    <div class="form-actions">
        <button type="submit" class="btn-submit">送信</button>
        <button type="reset" class="btn-reset">リセット</button>
    </div>
</form>
```

```css
.form-container {
    display: flex;
    flex-direction: column;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.form-row {
    display: flex;
    gap: 20px;
}

.form-row .form-group {
    flex: 1;
}

label {
    font-weight: bold;
    color: #333;
}

input, textarea {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

input:focus, textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.btn-submit, .btn-reset {
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

.btn-submit {
    background-color: #007bff;
    color: white;
}

.btn-reset {
    background-color: #6c757d;
    color: white;
}

.btn-submit:hover {
    background-color: #0056b3;
}

.btn-reset:hover {
    background-color: #545b62;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
    .form-row {
        flex-direction: column;
        gap: 20px;
    }
    
    .form-actions {
        flex-direction: column;
    }
}
```

### 4. ヒーローセクション

```html
<section class="hero">
    <div class="hero-content">
        <h1>美しいフレックスボックス</h1>
        <p>モダンなCSSレイアウトで素晴らしいWebサイトを作成しましょう。</p>
        <div class="hero-buttons">
            <button class="btn-primary">始める</button>
            <button class="btn-secondary">詳細を見る</button>
        </div>
    </div>
    <div class="hero-image">
        <img src="hero-image.jpg" alt="ヒーロー画像">
    </div>
</section>
```

```css
.hero {
    display: flex;
    align-items: center;
    min-height: 80vh;
    padding: 40px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.hero-content {
    flex: 1;
    max-width: 600px;
    padding-right: 40px;
}

.hero-content h1 {
    font-size: 3rem;
    margin-bottom: 20px;
    line-height: 1.2;
}

.hero-content p {
    font-size: 1.2rem;
    margin-bottom: 30px;
    line-height: 1.6;
    opacity: 0.9;
}

.hero-buttons {
    display: flex;
    gap: 15px;
}

.btn-primary, .btn-secondary {
    padding: 15px 30px;
    border: none;
    border-radius: 6px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background-color: white;
    color: #667eea;
}

.btn-secondary {
    background-color: transparent;
    color: white;
    border: 2px solid white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-secondary:hover {
    background-color: white;
    color: #667eea;
}

.hero-image {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.hero-image img {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
    .hero {
        flex-direction: column;
        text-align: center;
        padding: 20px;
    }
    
    .hero-content {
        padding-right: 0;
        margin-bottom: 30px;
    }
    
    .hero-content h1 {
        font-size: 2rem;
    }
    
    .hero-buttons {
        justify-content: center;
        flex-wrap: wrap;
    }
}
```

## 練習問題

### 問題1: 基本的なフレックスボックス
以下のHTMLに対して、フレックスボックスを使用したレイアウトを作成してください。

```html
<div class="flex-container">
    <div class="flex-item">アイテム1</div>
    <div class="flex-item">アイテム2</div>
    <div class="flex-item">アイテム3</div>
    <div class="flex-item">アイテム4</div>
</div>
```

**要件:**
- アイテムを水平方向に配置
- アイテム間の間隔を均等に設定
- アイテムを中央揃えに配置
- レスポンシブ対応（モバイルでは縦並び）

### 問題2: カードグリッド
以下のHTMLに対して、フレックスボックスを使用したカードグリッドを作成してください。

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
</div>
```

**要件:**
- カードを3列で配置
- カードの高さを統一
- カード内のコンテンツを適切に配置
- レスポンシブ対応

### 問題3: ナビゲーションメニュー
以下のHTMLに対して、フレックスボックスを使用したナビゲーションメニューを作成してください。

```html
<nav class="navbar">
    <div class="nav-brand">サイト名</div>
    <ul class="nav-menu">
        <li><a href="#">ホーム</a></li>
        <li><a href="#">サービス</a></li>
        <li><a href="#">製品</a></li>
        <li><a href="#">お問い合わせ</a></li>
    </ul>
    <div class="nav-actions">
        <button>ログイン</button>
        <button>サインアップ</button>
    </div>
</nav>
```

**要件:**
- ブランド名を左端に配置
- メニューを中央に配置
- アクションボタンを右端に配置
- レスポンシブ対応（モバイルではハンバーガーメニュー）

## まとめ

この章では、フレックスボックスについて詳しく学びました：

- **フレックスコンテナ**: `display: flex`によるコンテナの設定
- **フレックスアイテム**: 子要素の配置とサイズ制御
- **主軸と交差軸**: レイアウトの方向性の理解
- **配置プロパティ**: `justify-content`、`align-items`、`align-content`
- **実践的なレイアウト**: ナビゲーション、カード、フォームなど

フレックスボックスを活用することで、柔軟でレスポンシブなレイアウトを簡単に作成できるようになります。

次の章では、CSSグリッドについて詳しく学びます。

---

**関連リンク:**
- [[05-layout|レイアウト基礎]]
- [[07-grid|CSSグリッド]]
- [[08-responsive|レスポンシブデザイン]]
- [[06-images|HTML画像]] 