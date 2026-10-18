# 第1章：Reactとは？

## 📖 この章で学ぶこと

- Reactの定義と特徴
- コンポーネントベース開発とは
- Reactの利点
- 従来の開発との違い

---

## ⚛️ Reactとは？

**React**は、**Facebook（現Meta）が開発したJavaScriptライブラリ**で、**ユーザーインターフェース（UI）を効率的に構築するためのツール**です。

### Reactの主な特徴
- **コンポーネントベース**：UIを小さな部品に分けて開発
- **宣言的**：何を表示したいかを書くだけで、どう表示するかはReactが自動で処理
- **効率的**：必要な部分だけを更新して高速に動作
- **再利用可能**：一度作ったコンポーネントを何度でも使える

---

## 🧩 コンポーネントベース開発とは？

### 従来の開発方法
```html
<!-- 従来のHTML -->
<div class="header">
    <h1>ウェブサイト</h1>
    <nav>
        <a href="/">ホーム</a>
        <a href="/about">会社概要</a>
        <a href="/contact">お問い合わせ</a>
    </nav>
</div>

<div class="main">
    <h2>商品一覧</h2>
    <div class="product">
        <h3>商品A</h3>
        <p>価格: 1000円</p>
        <button>購入</button>
    </div>
    <div class="product">
        <h3>商品B</h3>
        <p>価格: 2000円</p>
        <button>購入</button>
    </div>
</div>
```

### Reactでの開発方法
```jsx
// Reactコンポーネント
function Header() {
    return (
        <div className="header">
            <h1>ウェブサイト</h1>
            <nav>
                <a href="/">ホーム</a>
                <a href="/about">会社概要</a>
                <a href="/contact">お問い合わせ</a>
            </nav>
        </div>
    );
}

function Product({ name, price }) {
    return (
        <div className="product">
            <h3>{name}</h3>
            <p>価格: {price}円</p>
            <button>購入</button>
        </div>
    );
}

function ProductList() {
    return (
        <div className="main">
            <h2>商品一覧</h2>
            <Product name="商品A" price={1000} />
            <Product name="商品B" price={2000} />
        </div>
    );
}
```

---

## 🎯 Reactの利点

### 1. 再利用性
```jsx
// 一度作ったコンポーネントを何度でも使える
<Product name="商品A" price={1000} />
<Product name="商品B" price={2000} />
<Product name="商品C" price={3000} />
```

### 2. 保守性
- 各コンポーネントが独立しているため、修正が簡単
- バグが発生した場合、該当するコンポーネントだけを修正すれば良い

### 3. 効率性
- 必要な部分だけを更新（仮想DOM）
- ページ全体を再描画する必要がない

### 4. 開発効率
- コンポーネントを組み合わせて大きなアプリを作成
- チーム開発で役割分担がしやすい

---

## 🔄 従来の開発との違い

### 従来の開発（jQueryなど）
```javascript
// 従来の方法
$('#button').click(function() {
    $('#message').text('ボタンがクリックされました');
    $('#counter').text(parseInt($('#counter').text()) + 1);
});

// HTML
<button id="button">クリック</button>
<div id="message"></div>
<div id="counter">0</div>
```

### Reactでの開発
```jsx
// Reactの方法
function Counter() {
    const [count, setCount] = useState(0);
    const [message, setMessage] = useState('');

    const handleClick = () => {
        setCount(count + 1);
        setMessage('ボタンがクリックされました');
    };

    return (
        <div>
            <button onClick={handleClick}>クリック</button>
            <div>{message}</div>
            <div>{count}</div>
        </div>
    );
}
```

---

## 🌐 Reactの使用例

### 実際のReactアプリケーション
- **Facebook**：Reactを開発した会社のメインサイト
- **Instagram**：写真共有アプリ
- **Netflix**：動画配信サービス
- **Airbnb**：宿泊予約サイト
- **Discord**：コミュニケーションツール

---

## 💡 Reactの基本概念

### 1. コンポーネント
- UIの部品
- 関数やクラスで定義
- 再利用可能

### 2. Props（プロパティ）
- コンポーネントに渡すデータ
- 親から子へ情報を伝える

### 3. State（状態）
- コンポーネント内で管理するデータ
- 変更されると画面が自動で更新される

### 4. JSX
- JavaScriptの中にHTMLを書く記法
- React専用の構文

---

## ⚠️ よくある誤解

### 1. Reactはフレームワークではない
- Reactは**ライブラリ**
- フレームワークはNext.js、Gatsbyなど

### 2. Reactは必ずしも必要ではない
- 小さなWebサイトなら通常のHTML/CSS/JavaScriptで十分
- 大規模なアプリや動的なUIが必要な場合に有効

### 3. Reactを学ぶにはJavaScriptの基礎が必要
- ReactはJavaScriptのライブラリ
- JavaScriptの基本文法を理解してから学ぶことを推奨

---

## 🎯 Reactが向いている場面

### ✅ Reactが適している場合
- 動的なWebアプリケーション
- 複雑なUIを持つサイト
- データが頻繁に更新されるアプリ
- チーム開発での大規模プロジェクト
- モバイルアプリ（React Native）

### ❌ Reactが不適切な場合
- 静的なWebサイト
- シンプルなランディングページ
- SEOが最重要なサイト（Next.jsなどのフレームワークを推奨）

---

## 📝 まとめ

- **React**はUIを効率的に構築するためのJavaScriptライブラリ
- **コンポーネントベース**で開発することで、再利用性と保守性が向上
- **宣言的**な書き方で、何を表示したいかを明確に表現
- 大規模なアプリケーションや動的なUIに特に有効
- JavaScriptの基礎知識が必要

---

## 📝 練習問題

1. Reactの主な特徴を3つ挙げてください
2. コンポーネントベース開発の利点を説明してください
3. Reactが適している場面と適していない場面をそれぞれ1つずつ挙げてください

---

**前の章：** [[00-React index|目次]] | **次の章：** [[01Programming/06_Frameworks/02_React/02_開発環境/2-1-Node-npm-pnpmの基本|2-1. Node / npm / pnpm の基本]] 