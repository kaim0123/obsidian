# 12. Tailwind CSS応用

## 目次
- [12.1 レスポンシブデザイン（ブレークポイント）](#121-レスポンシブデザインブレークポイント)
- [12.2 クラスの並べ方・自動整列（おすすめ）](#122-クラスの並べ方自動整列おすすめ)
- [12.3 カスタマイズと拡張（theme / plugins）](#123-カスタマイズと拡張theme--plugins)
- [12.4 ダークモード対応](#124-ダークモード対応)
- [12.5 実践レイアウト例](#125-実践レイアウト例)
- [12.6 練習問題](#126-練習問題)

## 12.1 レスポンシブデザイン（ブレークポイント）

Tailwindは**モバイルファースト**です。`sm:` は「640px以上」のように、**一定幅以上で上書き**する考え方になります。

- `sm:`（640px以上）
- `md:`（768px以上）
- `lg:`（1024px以上）
- `xl:`（1280px以上）
- `2xl:`（1536px以上）

### 例（列数を増やす）

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="bg-white p-4 rounded shadow">カード1</div>
  <div class="bg-white p-4 rounded shadow">カード2</div>
  <div class="bg-white p-4 rounded shadow">カード3</div>
</div>
```

### （補足）スマホだけ改行位置を変えたい

`br` を置いて `sm:hidden` のように「スマホだけ表示」にすると簡単です。詳しくは [[responsive-line-breaks|スマホサイズだけで改行位置をコントロールする方法]] も参照してください。

## 12.2 クラスの並べ方・自動整列（おすすめ）

Tailwindには「絶対この順番で書く」という強制ルールはありません。ただし、1行が長くなりやすいので、**読みやすさ**と**差分の安定**のためにチームで並べ方を決めることが多いです。

### よくある並べ方（目安）

「大きいレイアウト → 見た目 → 文字 → 状態」の順にすると追いやすいです。

- レイアウト/配置: `flex` `grid` `items-*` `justify-*` `gap-*`
- サイズ: `w-*` `h-*` `min-*` `max-*`
- 余白: `p-*` `m-*`
- 見た目: `bg-*` `border*` `rounded-*` `shadow-*`
- 文字: `text-*` `font-*` `leading-*` `tracking-*`
- その他: `overflow-*` `z-*` `opacity-*` `transition*` `duration-*`

### バリアント（`sm:` / `hover:` など）の置き方

- レスポンシブ（`sm:` `md:` `lg:`…）は、同じ性質のクラスに対して**後ろに上書き**として付けると読みやすいです。
- 状態（`hover:` `focus:` `disabled:`…）も同様に、ベースの後ろに置くと意図が伝わりやすいです。
- 例: `text-sm md:text-base hover:text-blue-600`

### 自動で並び替える（おすすめ）

実務では `prettier-plugin-tailwindcss` を入れて、クラス順を自動整列する運用がよく使われます（手で順番を悩まなくてよく、レビュー差分も安定します）。

## 12.3 カスタマイズと拡張（theme / plugins）

### `tailwind.config.js` でテーマ拡張

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#1e40af",
        secondary: "#f59e42",
      },
      spacing: {
        "128": "32rem",
      },
    },
  },
}
```

### プラグインの利用

- forms, typography, aspect-ratio など

```js
plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")]
```

## 12.4 ダークモード対応

### メディアクエリベース

```js
module.exports = {
  darkMode: "media", // または "class"
}
```

### クラスベース

```html
<body class="dark">
  <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
    ダークモード対応
  </div>
</body>
```

## 12.5 実践レイアウト例

### ナビゲーションバー

```html
<nav class="bg-blue-600 p-4 text-white flex justify-between items-center">
  <div class="font-bold text-lg">MySite</div>
  <ul class="flex space-x-4">
    <li><a href="#" class="hover:underline">Home</a></li>
    <li><a href="#" class="hover:underline">About</a></li>
    <li><a href="#" class="hover:underline">Contact</a></li>
  </ul>
</nav>
```

### レスポンシブカードグリッド

```html
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
  <div class="bg-white p-6 rounded shadow">カード1</div>
  <div class="bg-white p-6 rounded shadow">カード2</div>
  <div class="bg-white p-6 rounded shadow">カード3</div>
</div>
```

### フォーム

```html
<form class="max-w-md mx-auto bg-white p-6 rounded shadow mt-8 space-y-4">
  <input type="text" placeholder="名前" class="w-full border p-2 rounded" />
  <input type="email" placeholder="メール" class="w-full border p-2 rounded" />
  <button class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700">送信</button>
</form>
```

## 12.6 練習問題

### 問題1: レスポンシブなナビゲーションバー

Tailwind CSSを使って、スマホではハンバーガーメニュー、PCでは横並びのナビゲーションバーを作成してください。

### 問題2: カードレイアウト

3列のカードグリッドを作成し、各カードに画像・タイトル・説明文・ボタンを配置してください。

### 問題3: ダークモード切り替え

ボタンでダークモードとライトモードを切り替えられるレイアウトを作成してください。

### 問題4: カスタムカラー

`tailwind.config.js` で独自のカラーを追加し、その色を使ったボタンを作成してください。

### 問題5: フォームデザイン

Tailwind CSSのformsプラグインを使って、見やすく美しいフォームを作成してください。

---

**前の章**: [[11-tailwind-basics|Tailwind CSS基礎]]

**目次に戻る**: [[00-CSS index|CSS教科書目次]]

