# 11. Tailwind CSS基礎

## 目次
- [11.1 Tailwind CSSとは](#111-tailwind-cssとは)
- [11.2 導入方法（CDN / npm）](#112-導入方法cdn--npm)
- [11.3 ユーティリティファーストの考え方](#113-ユーティリティファーストの考え方)
- [11.4 よく使う基本クラス](#114-よく使う基本クラス)
- [11.5 最初に覚えるデバッグ手順](#115-最初に覚えるデバッグ手順)

## 11.1 Tailwind CSSとは

Tailwind CSSは**ユーティリティファースト**なCSSフレームワークです。
「クラス1つ＝スタイル1つ」の小さい部品を組み合わせて、HTML側で見た目を組み立てます。

- **メリット**: 追加CSSが減る / 命名で悩みにくい / 変更に強い（局所的に直せる）
- **よく使う場面**: Webアプリ、LP、管理画面など

## 11.2 導入方法（CDN / npm）

### CDN（お試し・学習用）

```html
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/dist/tailwind.min.css" rel="stylesheet">
```

学習やスニペット確認には便利ですが、実務ではビルド（npm）を使うことが多いです。

### npm（おすすめ）

```bash
npm install -D tailwindcss
npx tailwindcss init
```

#### `tailwind.config.js` の例

```js
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### CSSにディレクティブを追加

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### ビルドコマンド例

```bash
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
```

## 11.3 ユーティリティファーストの考え方

- 1つのクラス = 1つのスタイル
- HTMLに直接クラスを記述
- カスタムCSSを書く量が減る（必要になった時だけ書く）

### 例

```html
<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">ボタン</button>
```

## 11.4 よく使う基本クラス

### レイアウト
- `container` `mx-auto` `p-4` `flex` `grid` `gap-4`

### 色・背景
- `bg-blue-500` `text-white` `border` `border-gray-300`

### 余白
- `m-4` `mt-2` `mb-2` `p-4` `px-2` `py-1`

### 文字
- `font-bold` `text-lg` `text-center` `tracking-wide`

### ボーダー・角丸・影
- `border` `border-gray-400` `rounded` `rounded-lg`
- `shadow` `shadow-lg`

### まとめ例（カード）

```html
<div class="p-4 bg-gray-100 rounded shadow">
  <h2 class="text-xl font-bold mb-2">タイトル</h2>
  <p class="text-gray-700">本文テキスト</p>
</div>
```

## 11.5 最初に覚えるデバッグ手順

- **スペル/コロン**: `md:grid-cols-2` のように `:` を忘れていないか
- **上書き**: 同じ系統（例: `text-sm` と `text-lg`）が混在していないか（後勝ち）
- **content設定**: npm構成なら `tailwind.config.js` の `content` にHTML/JSのパスが入っているか

---

**次の章**: [[12-tailwind-advanced|Tailwind CSS応用]]

**Tailwind目次に戻る**: [[010Programming/05_Languages/Tailwind/目次|Tailwind目次]]

**CSSの目次に戻る**: [[00-CSS index|CSS教科書目次]]

