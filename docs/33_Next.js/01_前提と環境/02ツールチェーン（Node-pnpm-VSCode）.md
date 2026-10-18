# ツールチェーン（Node / pnpm / VSCode）

Next.js を動かすために必要な「道具」を揃えます。
ここで言う**ツールチェーン**とは、開発に使う一連の道具（実行環境・パッケージ管理・エディタ）のセットのことです。

---

## 必要なものの全体像

| 道具 | 役割 | 必須度 |
|------|------|--------|
| **Node.js** | JavaScript をパソコン上で動かすための実行環境 | 必須 |
| **パッケージマネージャ** | ライブラリの追加・削除を管理（npm / pnpm / yarn / bun） | 必須（Node.js に npm が同梱されているのでまずはそれでも OK） |
| **エディタ（VSCode）** | コードを書くためのテキストエディタ | ほぼ必須 |
| **Git** | バージョン管理（履歴の記録、共同作業） | 後からでも可 |
| **ブラウザ** | 動作確認用（Chrome / Edge / Firefox） | 必須 |

---

## 1. Node.js のインストール

### Node.js とは

普段 JavaScript はブラウザの中で動きますが、Node.js を入れると **パソコン上でも JavaScript が動く**ようになります。Next.js の開発サーバーやビルドツールは Node.js の上で動いているため、これがないと話が始まりません。

### バージョンの選び方

- **Next.js 16 系の場合：Node.js 20 以上が必要**（公式推奨）
- 一般に「**LTS（Long Term Support）版**」と書かれている偶数バージョン（20、22 など）を選びます。
- 「Current（最新）」は新機能が入っていますが、安定性重視なら LTS。

### インストール方法

#### 方法 A：公式サイトからインストーラを落とす（一番ラク）

1. <https://nodejs.org/> にアクセス
2. **LTS** の方をダウンロード
3. インストーラを実行（基本「Next」連打で OK）
4. インストール後、ターミナル（Windows なら PowerShell）で確認：

```bash
node -v
# v20.x.x など表示されれば OK

npm -v
# 10.x.x など表示されれば OK
```

#### 方法 B：バージョン管理ツールを使う（複数バージョンを切り替えたい人向け）

- **Windows**：[fnm](https://github.com/Schniz/fnm) または [Volta](https://volta.sh/)
- **Mac/Linux**：[nvm](https://github.com/nvm-sh/nvm) または fnm / Volta

例えば fnm なら、

```bash
fnm install 20
fnm use 20
```

でバージョンの切り替えができます。複数のプロジェクトで違う Node.js バージョンを使う必要が出てきたら、後から導入を検討すれば OK です。

---

## 2. パッケージマネージャ

Next.js のプロジェクトでは、たくさんの「ライブラリ（npm パッケージ）」を使います。それを **インストール・更新・削除する道具** がパッケージマネージャです。

### 主要 4 つの違い

| 名前 | 速さ | ディスク使用量 | 特徴 |
|------|------|----------------|------|
| **npm** | ふつう | 多い | Node.js に標準で付いてくる。最初はこれで十分 |
| **pnpm** | 速い | **少ない**（共有方式） | 大規模プロジェクトや複数プロジェクト持つなら有利 |
| **yarn** | 速い | 多い | 過去に大流行、今は他に押されぎみ |
| **bun** | 爆速 | 少ない | 新興。実行ランタイムも兼ねる。未対応ライブラリが稀にある |

### 初心者へのおすすめ

- **最初は `npm`** で十分。学習中に困ることはありません。
- 慣れてきたら **pnpm** に乗り換えると、ディスクも節約できて快適です。

### pnpm を入れる場合

```bash
npm install -g pnpm
pnpm -v
```

### よく使うコマンド対応表

| やりたいこと | npm | pnpm | yarn |
|--------------|-----|------|------|
| 全パッケージインストール | `npm install` | `pnpm install` | `yarn` |
| 追加 | `npm install <名前>` | `pnpm add <名前>` | `yarn add <名前>` |
| 開発用に追加 | `npm install -D <名前>` | `pnpm add -D <名前>` | `yarn add -D <名前>` |
| 削除 | `npm uninstall <名前>` | `pnpm remove <名前>` | `yarn remove <名前>` |
| スクリプト実行 | `npm run dev` | `pnpm dev` | `yarn dev` |

---

## 3. エディタ：VSCode

[Visual Studio Code](https://code.visualstudio.com/) は Microsoft が無料で提供しているコードエディタ。Next.js（TypeScript / React）の開発でデファクトスタンダードです。

### 入れておきたい拡張機能

| 拡張 | 何をしてくれる |
|------|----------------|
| **ES7+ React/Redux/React-Native snippets** | `rfc` などで React コンポーネントの雛形を一発生成 |
| **Tailwind CSS IntelliSense** | Tailwind を使うなら必須。クラス名補完 |
| **Prettier - Code formatter** | コードの自動整形（インデント、改行など） |
| **ESLint** | コードのミスや非推奨パターンを警告 |
| **GitLens** | Git 操作の可視化 |
| **Path Intellisense** | ファイルパスの自動補完 |
| **Error Lens** | エラーをその行に直接表示 |

### 推奨設定（`settings.json` の例）

VSCode 左下の歯車 → 「Settings」→ 右上のファイルアイコン → JSON 編集。

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

---

## 4. ターミナル

ターミナル（コマンドを打つ画面）も使います。

### Windows の場合

- **Windows Terminal**（Microsoft Store から無料）→ 一番おすすめ
- PowerShell（標準でも入っている）
- 内部のシェルとして **PowerShell** または **Git Bash**（Git 付属）

### Mac の場合

- 標準の「ターミナル」で OK
- もう少しリッチに使いたいなら [iTerm2](https://iterm2.com/) や [Warp](https://www.warp.dev/)

---

## 5. Git（バージョン管理）

絶対必須ではありませんが、入れておくと**「失敗しても元に戻せる」**安心感が得られます。

- ダウンロード：<https://git-scm.com/>
- 確認：

```bash
git --version
```

最初の設定（自分の名前とメールを登録）：

```bash
git config --global user.name "あなたの名前"
git config --global user.email "you@example.com"
```

---

## 6. ブラウザ（開発確認用）

- **Chrome** または **Edge** が一番無難（DevTools が充実）
- **React Developer Tools**（Chrome 拡張）を入れるとコンポーネントツリーが見られて便利

---

## チェックリスト

開発を始める前に、以下が全部できれば準備 OK！

- [ ] `node -v` でバージョンが表示される（20 以上）
- [ ] `npm -v` でバージョンが表示される
- [ ] VSCode が起動する
- [ ] VSCode に上記の拡張機能が入っている
- [ ] ターミナルでコマンドが打てる
- [ ] ブラウザに React Developer Tools が入っている（任意）

これが揃ったら、次は実際にプロジェクトを作ります → [[03create-next-appと設定ファイル]]
