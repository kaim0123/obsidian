# 15-5. React Routerデプロイ問題（404/リライト/ベースパス）

## 🎯 この章で学ぶこと

- デプロイ後に出る React Router 関連の典型問題
- 各問題の症状と直し方
- チェックリストで予防

---

## 📖 典型的な3つの問題

1. **リロードで404**：サブパスをリロードすると404になる
2. **アセットが404**：CSS/JSが読み込めない
3. **リンクが間違ったURL**：`/about` のはずが `/some-prefix/about`

---

## 💻 問題1：リロードで404

### 症状

```text
http://example.com/products （ブラウザリロード）→ 404 Not Found
```

### 原因

サーバに `/products` というファイルがない。SPAの仕組み上、index.html を返すべき。

### 対処

各ホスティングで rewrite 設定。詳しくは [[15-3-ルーティングとリライト]]。

#### Vercel

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

#### Netlify

```text
# public/_redirects
/*    /index.html   200
```

#### nginx

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 💻 問題2：アセットが404

### 症状

ホームは表示されるけど、CSS/JSが読み込めない（白い画面、コンソールに404）。

### 原因A：base path の設定漏れ

GitHub Pages のサブパス（`username.github.io/myapp/`）にデプロイした場合：

```html
<!-- index.html が以下のようになっている -->
<script src="/assets/index-abc.js"></script>
<!-- → /assets/... を取りに行くが、本来は /myapp/assets/... -->
```

### 対処

```js
// vite.config.js
export default {
  base: '/myapp/',
};
```

→ ビルド後のパスが `/myapp/assets/...` になる。

### 原因B：BrowserRouter の basename 漏れ

```jsx
<BrowserRouter basename="/myapp">
  <Routes>...</Routes>
</BrowserRouter>
```

`base` と `basename` を**一致**させる。

---

## 💻 問題3：リンクのURL間違い

### 症状

`<Link to="/about">` が `https://example.com/some-prefix/about` ではなく `https://example.com/about` になる。

### 原因

basename 設定がない、または Linkに直接full pathを書いている。

### 対処

```jsx
// ❌ 直接path書き
<Link to="/myapp/about">About</Link>

// ✅ basenameを使う
<BrowserRouter basename="/myapp">
  <Link to="/about">About</Link> {/* 自動で /myapp/about になる */}
</BrowserRouter>
```

---

## 💻 問題4：HashRouterからBrowserRouterに切り替えたら404

```jsx
// 開発で動いていた
<HashRouter>...</HashRouter>

// 本番でも...
<BrowserRouter>...</BrowserRouter>
```

→ サーバ側でリライトしないと 404。**[[15-3-ルーティングとリライト]]**を参照。

---

## 💻 問題5：環境変数が未定義

### 症状

API呼び出しが `undefined/users` のような変なURLに。

### 原因

Vercel / Netlify で環境変数を設定し忘れ。

### 対処

ダッシュボードで `VITE_API_URL` などを設定 → 再デプロイ。

---

## 💻 問題6：プレビューでは動くが本番で動かない

考えられる原因：

- CORS（プレビューとの違い）
- 環境変数が違う
- httpOnly cookie の domain設定
- ブラウザキャッシュ

→ DevToolsのNetwork、Console を必ず確認。

---

## 💻 共有サーバーでリライトが効きにくい場合：HashRouter + 相対パス

GMO や一般的な共有レンタルサーバーでは、`/products` のようなパスに対応する実体ファイルがなく **リロードで 404** になることがあります。[[15-3-ルーティングとリライト]] の rewrite が使えない・不安定な場合は、**HashRouter** とビルドの **相対パス（base）** の組み合わせが動きやすいです。

### BrowserRouter と HashRouterの違い

**BrowserRouter（パス型）**

- URL は `/contact/264` のようになる
- ブラウザはその URL ごとサーバーにリクエストする → **`/contact/264` 用のファイルが無いと 404**
- 対策はサーバー側で常に `index.html` を返すリライト（前述の問題1）

**HashRouter（ハッシュ型）**

- URL は `/index.html#/contact/264` のように **`#` 以降** でルートを表す
- **`#` 以降はサーバーに送られない** ので、取得されるのは常に `/index.html` など実在する1ファイルでよい
- 共有サーバーで `.htaccess` が期待どおり動かない場合でも、SPA として回しやすい

### 設定例：HashRouter

```jsx
import { HashRouter } from 'react-router-dom';

function App() {
  return (
    <HashRouter>
      {/* ルート設定 */}
    </HashRouter>
  );
}
```

### 相対パス（サブディレクトリにも効かせる）

Vite では `base` を相対にすると、アセットの URL が `/` 直下前提にならない：

```js
// vite.config.js
export default {
  base: './',
};
```

Create React App 系では `package.json` の `homepage` に `"./"` を置く例もある。

**効果**

- サーバー設定に依存しにくいルーティング（ハッシュ型）
- サブディレクトリに置いても JS/CSS のパスが破けにくい

### 技術メモ

- ハッシュ部分はブラウザ内でだけ解釈され、React Router が表示コンポーネントを切り替える
- ハッシュ URL は SEO の観点ではパス型より不利になりやすい（クローラや要件次第）。社内ツール・共有サーバー限定などでは実用上問題になりにくいことも多い

### 環境別の目安

| 環境 | 目安 |
|------|------|
| Vercel / Netlify / VPS など、rewrite を自在に書ける | BrowserRouter + リライトの方が URL もきれいで有利なことが多い |
| GMO / XSERVER / さくらなど、共有サーバーでリライトが難しい | HashRouter + `base: './'`（または `homepage: "./"`）が安定しやすい |

### 成功した構成の例

| 項目 | 内容 |
|------|------|
| ルーター | HashRouter |
| `.htaccess` | 不要なら削除してシンプルにできる場合がある |
| base | `'./'` など相対パス |

---

## 🛠 デプロイ前チェックリスト

```text
□ npm run build & npm run preview で動作確認
□ /、/about、/users/123 などをリロードで開ける
□ アセット（CSS/JS）の URL が正しい
□ 環境変数が dashboard で設定済み
□ rewrites / redirects 設定済み
□ HTTPS で動作
□ 404 / エラーページがある
□ console にエラーが出ていない
□ Lighthouse スコア確認
```

---

## 💻 デバッグの順番

1. **DevTools の Network**：404 / 失敗を確認
2. **Console**：JSエラーを確認
3. **`<head>` 内のscript src**：パスがおかしくないか
4. **環境変数**：本番に正しく設定されているか
5. **rewrites設定**：ホスティングのドキュメントを再確認

---

## ❌ よくある間違い

### 開発で動くから大丈夫と思う

→ 必ず `preview` で本番ビルドを試す。

### `vite.config.js` の base を変えて basename を変えない

→ 両方一致させる。

### `<a>`タグでルーティング

```jsx
<a href="/about">About</a>  // ❌ ページリロード
```

→ ✅ `<Link to="/about">`。

### サブパスデプロイで `/` のテストだけ

→ 必ず深いURLもテスト。

---

## ✅ ベストプラクティス

1. **デプロイ前に preview で動作確認**
2. **rewrite 設定**を忘れずに
3. **base / basename** を一致
4. **チェックリスト**を運用
5. **失敗を恐れず、ロールバック**

---

## 🔬 実践演習

新しいSPAをサブパスにデプロイ：

- `/myapp/about` で表示
- リロードしても表示
- アセット読み込み成功
- 環境変数で API URL 切替
- すべて動くまで試行錯誤

---

## 📝 まとめ

- リロード404 → rewrite
- アセット404 → base path
- リンク誤り → basename
- 必ず preview で確認
- チェックリストで予防

---

## 🔗 関連ページ

- [[6-1-React-Routerの導入]]
- [[15-2-静的ホスティング]]
- [[15-3-ルーティングとリライト]]
