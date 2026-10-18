# 11. Node.js入門：実行環境としてのJS

---

## この章で学ぶこと

- Node.jsでのJavaScript実行
- npm とパッケージ管理
- 標準入出力（console、process.argv）
- ファイル操作（fs）の基本

---

## 11-1. Nodeでの実行（npm scripts）

### Node.js とは

Node.jsは**ブラウザの外でJavaScriptを実行するための環境**です。サーバーサイドの開発、コマンドラインツール、ビルドツールなどに使われます。

### 実行方法

```bash
# ファイルを実行
node app.js

# 対話モード（REPL）
node
> 1 + 2
3
> "hello".toUpperCase()
'HELLO'
> .exit
```

### npm scripts

`package.json` にスクリプトを定義して、`npm run` で実行できます。

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "node --watch app.js",
    "test": "node --test"
  }
}
```

```bash
npm run start   # node app.js が実行される
npm run dev     # ファイル変更を監視して自動再実行
npm test        # "test" は run を省略できる
npm start       # "start" も run を省略できる
```

### ブラウザとNode.jsの違い

| | ブラウザ | Node.js |
|--|---------|---------|
| DOM | ある | **ない** |
| window | ある | **ない** |
| document | ある | **ない** |
| fetch | ある | ある（v18以降） |
| fs（ファイル操作） | **ない** | ある |
| process | **ない** | ある |
| モジュール | ES Modules | ES Modules / CommonJS |

---

## 11-2. パッケージ管理（package.json）

### package.json とは

プロジェクトの設定ファイル。依存ライブラリや実行スクリプトを管理します。

```bash
# プロジェクトの初期化（package.json を作る）
npm init -y
```

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "eslint": "^9.0.0"
  }
}
```

### パッケージのインストール

```bash
# 本番で使うパッケージ（dependencies）
npm install express
npm install lodash dayjs

# 開発でだけ使うパッケージ（devDependencies）
npm install --save-dev eslint prettier

# インストール済みパッケージを復元（git clone 後など）
npm install
```

### node_modules と package-lock.json

```
my-project/
├── node_modules/        ← インストールされたパッケージ（.gitignore に入れる）
├── package.json         ← プロジェクト設定
└── package-lock.json    ← 正確なバージョン情報（コミットする）
```

- **node_modules** は `.gitignore` に入れて Git で管理しない
- **package-lock.json** はコミットする（他の人が同じバージョンをインストールできるように）

### パッケージの使い方

```javascript
// ES Modules（推奨）
import express from "express";
import { format } from "date-fns";

// CommonJS（古い書き方）
const express = require("express");
```

---

## 11-3. 標準入出力（console、process.argv）

### console

```javascript
console.log("通常の出力");
console.error("エラー出力");  // 標準エラー出力へ
console.warn("警告");
console.table([{ a: 1 }, { a: 2 }]);  // テーブル表示
```

### process.argv（コマンドライン引数）

```javascript
// args.js
console.log(process.argv);
```

```bash
node args.js hello world
# [
#   '/usr/local/bin/node',   ← Node.jsのパス
#   '/path/to/args.js',      ← スクリプトのパス
#   'hello',                 ← 引数1
#   'world'                  ← 引数2
# ]
```

```javascript
// 実際の使い方（最初の2つをスキップ）
const args = process.argv.slice(2);
console.log(args);  // → ['hello', 'world']
```

### 実践：簡単なCLIツール

```javascript
// greet.js
const args = process.argv.slice(2);
const name = args[0] || "World";
console.log(`Hello, ${name}!`);
```

```bash
node greet.js 太郎
# → Hello, 太郎!

node greet.js
# → Hello, World!
```

### process の便利なプロパティ

```javascript
process.env.NODE_ENV    // 環境変数
process.cwd()           // 現在の作業ディレクトリ
process.exit(0)         // プロセスを終了（0=正常、1=エラー）
process.platform        // "win32", "darwin", "linux"
```

### 環境変数

```bash
# 実行時に環境変数を設定
NODE_ENV=production node app.js
PORT=3000 node app.js
```

```javascript
// コード内で参照
const port = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== "production";
```

---

## 11-4. ファイル操作（fs）入門

### fs モジュール（Promises API）

```javascript
import { readFile, writeFile, readdir, mkdir, stat } from "node:fs/promises";
```

### ファイルの読み込み

```javascript
// テキストファイルを読む
const content = await readFile("data.txt", "utf-8");
console.log(content);

// JSONファイルを読む
const json = await readFile("config.json", "utf-8");
const config = JSON.parse(json);
console.log(config);
```

### ファイルの書き込み

```javascript
// テキストファイルを書く（上書き）
await writeFile("output.txt", "Hello, Node.js!\n", "utf-8");

// JSONファイルを書く
const data = { name: "太郎", age: 20 };
await writeFile("user.json", JSON.stringify(data, null, 2), "utf-8");
```

### ファイルに追記

```javascript
import { appendFile } from "node:fs/promises";

await appendFile("log.txt", `${new Date().toISOString()} ログメッセージ\n`, "utf-8");
```

### ディレクトリの操作

```javascript
// ディレクトリの一覧
const files = await readdir("./src");
console.log(files);  // → ["app.js", "utils.js", ...]

// ディレクトリの作成（recursive で親ディレクトリも作る）
await mkdir("./dist/assets", { recursive: true });

// ファイルの情報
const info = await stat("app.js");
console.log(info.isFile());       // → true
console.log(info.isDirectory());  // → false
console.log(info.size);           // → 1234（バイト数）
```

### ファイルの存在確認

```javascript
import { access } from "node:fs/promises";

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

if (await fileExists("config.json")) {
  console.log("設定ファイルがあります");
}
```

### エラーハンドリング

```javascript
try {
  const content = await readFile("not-found.txt", "utf-8");
} catch (error) {
  if (error.code === "ENOENT") {
    console.log("ファイルが見つかりません");
  } else {
    throw error;  // 想定外のエラーは再throw
  }
}
```

---

## よくある間違い

```javascript
// ❌ fsのコールバック版を使う（古い書き方）
const fs = require("fs");
fs.readFile("file.txt", (err, data) => { ... });

// ✅ Promises版を使う
import { readFile } from "node:fs/promises";
const data = await readFile("file.txt", "utf-8");

// ❌ encoding を忘れて Buffer が返る
const content = await readFile("file.txt");
console.log(content);  // → <Buffer 48 65 6c 6c 6f>

// ✅ "utf-8" を指定する
const content = await readFile("file.txt", "utf-8");
console.log(content);  // → "Hello"

// ❌ node_modules をコミットする
// ✅ .gitignore に node_modules を追加
```

---

## 重要ポイント

1. **Node.js**はブラウザの外でJSを実行する環境。DOMはない
2. **npm**でパッケージを管理。`npm install` でインストール
3. **package.json**はプロジェクトの設定ファイル。scriptsでコマンドを定義
4. **process.argv**でコマンドライン引数を取得
5. **fs/promises**でファイルの読み書き。必ず`"utf-8"`を指定
6. **node_modules**は`.gitignore`に入れる。**package-lock.json**はコミットする

---

## 練習問題

1. コマンドライン引数で名前と年齢を受け取り、挨拶を表示するプログラムを書こう：
   ```bash
   node greet.js 太郎 20
   # → こんにちは、太郎さん！20歳ですね。
   ```

2. テキストファイルを読み込み、行数と文字数を表示するプログラムを書こう。

3. JSONファイルにTODOリストを保存・読み込みするプログラムを書こう（追加・一覧表示・削除）。

---

## ミニ課題

**「マークダウンファイル一覧ツール」を作ろう**

指定したディレクトリ内の `.md` ファイルを再帰的に探して一覧表示するCLIツールを作ろう。

```bash
node md-list.js ./docs
```

出力例：
```
docs/README.md (1.2KB)
docs/guide/setup.md (3.4KB)
docs/guide/usage.md (2.1KB)
合計: 3ファイル
```

ヒント：`readdir` に `{ recursive: true }` オプションを使う。
