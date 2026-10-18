# 2-1. Node.js / npm / pnpm の基本

## 🎯 この章で学ぶこと

- Node.js とは何か、なぜReact開発に必要か
- npm / pnpm / yarn の違いと選び方
- パッケージのインストール・更新・削除の基本コマンド

---

## 📖 概念の説明

### Node.jsとは

**Node.js**は、ブラウザの外でJavaScriptを動かす実行環境です。本来JavaScriptはブラウザの中だけで動きますが、Node.jsを入れるとPC上でJSが直接動かせるようになります。

> **なぜReact開発に必要？**
> Reactは「ビルドツール」を使ってJSXをブラウザが分かるJSに変換します。そのビルドツールがNode.js上で動くからです。

### npm / pnpm / yarn とは

これらは**パッケージマネージャ**。Reactや関連ライブラリ（パッケージ）を取ってきたり、更新したりする道具です。

| 名前 | 特徴 | 一言で |
| --- | --- | --- |
| **npm** | Node.jsに最初から付属 | 標準。これでOK |
| **pnpm** | 高速・ディスク節約 | こだわるなら推奨 |
| **yarn** | 昔流行った代替 | 今あえて選ぶ理由は薄い |

**初心者は npm でOK**。慣れたらpnpmに乗り換えると快適です。

### パッケージとは

「他人が作って公開してくれた便利な機能のまとまり」のこと。例：

- `react`：React本体
- `react-router-dom`：ルーティング
- `axios`：HTTP通信
- `tailwindcss`：CSS

これらを `package.json` というファイルで管理し、コマンド1つで取ってこられます。

---

## 💻 インストール手順

### Node.jsのインストール

公式サイト [nodejs.org](https://nodejs.org) から **LTS版**（推奨版）をダウンロードしてインストール。

**ついでにそろえるとよいもの**（必須ではないが一般的な組み合わせ）：

- **エディタ**：**Visual Studio Code** を推奨（React向け拡張が充実）
- **ブラウザ**：**Google Chrome** / Firefox / Edge のいずれか。開発者ツールで動作確認する前提

**確認**：

```bash
node -v   # → v20.x.x のように表示されればOK
npm -v    # → 10.x.x のように表示されればOK
```

npm でパッケージを公開する予定がある場合など、**任意**で作者情報を初期化しておくことがあります。

```bash
npm config set init.author.name "あなたの名前"
npm config set init.author.email "あなたのメールアドレス"
```

### pnpmを使いたい場合

```bash
npm install -g pnpm

pnpm -v   # 確認
```

`-g` は「グローバルにインストール」の意味。どこでも `pnpm` コマンドが使えるようになります。

---

## 💻 よく使うコマンド

### パッケージのインストール

```bash
# プロジェクトのフォルダで
npm install                    # package.jsonにある依存を全部入れる
npm install react              # 特定のパッケージを追加
npm install -D vitest          # 開発用に追加（-D は --save-dev）
```

pnpmなら：

```bash
pnpm install
pnpm add react
pnpm add -D vitest
```

### スクリプトの実行

`package.json`に書かれた便利コマンドを呼ぶ。

```bash
npm run dev      # 開発サーバ起動（よく使う）
npm run build    # 本番ビルド
npm run lint     # コード規約チェック
npm test         # テスト実行（runを省略可能なものもある）
```

### パッケージの更新・削除

```bash
npm update react             # 更新
npm uninstall axios          # 削除
npm outdated                 # 古くなっているものを表示
```

---

## 📦 package.json の中身

`package.json` はプロジェクトの設定ファイル。中身の例：

```json
{
  "name": "my-react-app",
  "version": "0.1.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint ."
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "eslint": "^8.0.0"
  }
}
```

- `dependencies`：本番でも必要なパッケージ
- `devDependencies`：開発時だけ必要（ビルドツール、テストなど）

---

## ❌ よくある間違い

### `node_modules` を直接編集してしまう

→ 絶対NG。`node_modules` は npm/pnpm が管理する場所。`package.json` に書いて再インストールするのが正しい。

### `package-lock.json` を消してしまう

→ これは**バージョン固定の証明書**。消すと別バージョンが入って動かなくなることがある。残しておく。

### グローバルとローカルを混同する

```bash
npm install -g eslint  # PC全体に1つだけ
npm install -D eslint  # このプロジェクト用
```

→ プロジェクト用は `-D` (devDependencies) で入れる。

### Node.js が認識されない（`node` がコマンドとして存在しない）

→ Node.js をインストールするか、インストール後にターミナルを開き直す。PATH が通っていない場合は公式インストーラの再実行や環境変数を確認。

### `EACCES` など npm の権限エラー

→ 管理者権限のシェルで実行してしまうのは最終手段。まずは [npm の推奨ディレクトリ権限](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally) の解説を参照する。

### ネットワークエラーで `npm install` が失敗する

→ プロキシ・VPN・ファイアウォール、社内プロキシの設定を確認。オフライン環境ではミラー設定が必要な場合もある。

---

## ✅ ベストプラクティス

1. **Node.jsはLTS版**を選ぶ（安定して長くサポート）
2. グローバルインストールは最小限。プロジェクト用が基本
3. **package-lock.jsonはGitにコミットする**（チームで同じバージョン）
4. **node_modulesはGit管理しない**（.gitignoreで除外、容量がでかい）
5. 古いプロジェクトを開いたら、まず `npm install`

---

## 📝 まとめ

- Node.js = JSをPCで動かすための実行環境
- npm / pnpm / yarn = パッケージマネージャ。初心者はnpmでOK
- `npm install` で依存を取る、`npm run dev` で開発サーバ起動
- package.json に依存関係が書かれる。lockファイルはコミット、node_modulesは無視

---

## 🔗 関連ページ

- [[2-2-ViteでReactアプリ作成]]
- [[2-3-プロジェクト構成の見方]]
- [[2-4-ESLint-Prettier]]
