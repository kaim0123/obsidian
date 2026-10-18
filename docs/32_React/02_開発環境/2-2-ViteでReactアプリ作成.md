# 2-2. ViteでReactアプリ作成（推奨）

## 🎯 この章で学ぶこと

- Viteとは何か、なぜCreate React Appではなく Vite を使うのか
- 1コマンドでReactプロジェクトを作る手順
- 開発サーバを起動して、画面を確認する流れ

---

## 📖 概念の説明

### Viteとは

**Vite**（ヴィート、フランス語で「速い」の意味）は、ReactなどのSPAを作るための**ビルドツール**。

> 例えるなら、Viteは**料理の下ごしらえ機**。あなたの書いたJSX/TSXを、ブラウザが分かるJSに変換し、開発中はリアルタイムで反映してくれます。

### なぜCreate React Appではなく Vite ?

以前は **Create React App (CRA)** が公式の標準でしたが、**現在は非推奨**（2023年に公式に「使うな」とアナウンス）。

| | CRA | Vite |
| --- | --- | --- |
| 起動速度 | 遅い（10秒〜） | 超速（1秒以下） |
| 開発体験 | もっさり | 軽快 |
| 設定 | 隠蔽（ejectしないと触れない） | 分かりやすい |
| 状況 | 非推奨 | 推奨 |

公式ドキュメント [react.dev](https://react.dev) でも Vite を含むフレームワークが推奨されています。

---

## 💻 プロジェクト作成手順

### Step 1：ターミナルで以下を実行

```bash
npm create vite@latest my-app
```

`my-app` の部分は**プロジェクト（フォルダ）名**です。npm のパッケージ名に近いルールが無難です。

- 小文字とハイフンのみ（例：`my-app`、`todo-list`）
- 数字で始めない
- スペースや記号は避ける

実行すると質問されます。

```
? Select a framework: › React
? Select a variant: › TypeScript    ← 慣れたら推奨
                     › JavaScript    ← 最初はこちらでもOK
```

### Step 2：プロジェクトに移動して依存をインストール

```bash
cd my-app
npm install
```

数十秒ほどでパッケージがダウンロードされます。

### Step 3：開発サーバを起動

```bash
npm run dev
```

```text
  VITE v5.0.0  ready in 312 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**ブラウザで `http://localhost:5173/` を開く** → React のロゴと「count is 0」のボタンが見えれば成功です。

開発サーバを止めるときは、ターミナルで **`Ctrl + C`**（Mac は同様）を押します。

### Step 4：コードを編集してみる

`src/App.jsx`（または`App.tsx`）を編集して保存すると、ブラウザが**自動で更新**されます（HMR = Hot Module Replacement）。

---

## 📁 作成されたフォルダ構成

```text
my-app/
├─ public/              # 静的ファイル（画像など）
├─ src/                 # ★メインのコード
│  ├─ App.jsx          # ルートコンポーネント
│  ├─ main.jsx         # エントリポイント
│  ├─ index.css
│  └─ App.css
├─ index.html           # HTMLのテンプレート
├─ package.json         # 依存関係・スクリプト
├─ vite.config.js       # Vite設定
└─ .gitignore
```

詳しい中身は [[2-3-プロジェクト構成の見方]] で解説します。

---

## 💻 ビルドとプレビュー

### 本番用にビルド

```bash
npm run build
```

`dist/` フォルダに、ブラウザにそのまま置ける成果物が作られます。

### ビルド結果をローカルで確認

```bash
npm run preview
```

本番に近い動きを確認できます。

---

## ❌ よくある間違い

### `npm install` を忘れて `npm run dev`

→ エラー：`Cannot find module 'react'`。先に `npm install` を実行。

### ポート 5173 が既に使われている

→ Viteが自動で別ポート（5174など）を提示してくれる。それを使えばOK。

### 編集しても画面が変わらない

→ `npm run dev` がまだ動いているか確認。ターミナルを閉じると止まる。

### `node_modules` をGitにコミット

→ サイズが膨大になる。`.gitignore`で除外（Vite作成時にデフォルトで入る）。

---

## ✅ ベストプラクティス

1. **新規プロジェクトはVite**で（CRAは非推奨）
2. **TypeScriptを選ぶ**ことを徐々に検討（11章で扱う）
3. ターミナルは**2つ**開く（1つは`npm run dev`、もう1つはコマンド用）
4. 保存して自動更新されないときは、まずブラウザをリロード
5. **`.env`** ファイルでAPI URLなどを管理（15-1で扱う）
6. ブラウザに **React Developer Tools** 拡張を入れておくと、コンポーネントの状態確認がしやすい（詳しくは [[2-5-デバッグ]]）
7. プロジェクト名は分かりやすく（汎用の `my-app` のままより、`todo-app` など用途が伝わる名前がよい）。初期コミットするなら `git init` → `git add .` → `git commit` でよい

### `import.meta.env.BASE_URL` と `base`（サブパス配信で効く）

Vite では `import.meta.env.BASE_URL` が **「アプリの配置ベースパス」**として使われます。

- **例**: GitHub Pages や社内ホスティングで `/my-app/` の下に置く場合
- `BASE_URL` は末尾に `/` を含む形になりがちなので、URL を組み立てるときに `//` が出ないよう **正規化**して使うことがあります

```ts
// 例：末尾の / を削って base path を揃える
export const base = import.meta.env.BASE_URL.replace(/\/$/, "");
```

`base + "/assets/..."` のように連結する想定なら、この形にしておくと破綻しにくいです。  
（逆に、ルーティングやビルド設定に直接関わるので、置き場は `src/config/*` や `src/env/*` のような「設定」側に寄せるのが一般的です）

---

## 🔬 実践演習

1. `npm create vite@latest hello-react -- --template react` で作成
2. `cd hello-react && npm install && npm run dev`
3. `src/App.jsx` の `<h1>` の文字を変えて、ブラウザに反映されることを確認
4. ボタンを1つ追加して、クリックすると `alert('hi')` が出るようにする

---

## 📝 まとめ

- Viteは現在の標準ビルドツール（CRAは非推奨）
- `npm create vite@latest` 1コマンドでReactプロジェクト作成
- `npm run dev` で開発サーバ起動 → http://localhost:5173/
- `npm run build` で本番ビルド、結果は `dist/` に出る

---

## 🔗 関連ページ

- [[2-1-Node-npm-pnpmの基本]]
- [[2-3-プロジェクト構成の見方]]
- [[2-4-ESLint-Prettier]]
- [[15-1-本番ビルドと環境変数]]
