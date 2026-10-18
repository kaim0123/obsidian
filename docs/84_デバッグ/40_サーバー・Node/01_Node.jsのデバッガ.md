# Node.js のデバッガ

ブラウザでは DevTools でブレークポイントを置けますが、サーバー側の Node.js でも同じことができます。Node.js には **Inspector** という仕組みが組み込まれていて、Chrome DevTools や VS Code をつないで、止める・変数を見る・ステップ実行するができます。`console.log` を何度も足して再起動する前に、使えるようにしておくと調査がずっと速くなります。

---

## 1. 仕組み

```
Node.js プロセス（--inspect で起動）
   └─ Inspector が 9229 番ポートで待ち受け
          ↑ WebSocket（Chrome DevTools Protocol）
   Chrome DevTools ／ VS Code がつなぐ
```

| フラグ | 動き |
|--------|------|
| `--inspect` | デバッガを有効にして、そのまま実行を始める |
| `--inspect-brk` | デバッガを有効にして、**最初の行で止まる**（起動直後の処理を調べたいとき） |
| `--inspect=0.0.0.0:9229` | 待ち受けるアドレスとポートを指定（Docker の中など） |
| `--enable-source-maps` | TypeScript などのソースマップを使ってスタックトレースを出す |

> `--inspect` を外部に公開すると、誰でもサーバーの中でコードを実行できてしまいます。**本番では使わない**、使うなら localhost に限定して SSH トンネル経由にします。

---

## 2. Chrome DevTools でつなぐ

```bash
node --inspect-brk src/server.js
```

1. Chrome で `chrome://inspect` を開く。
2. 「Remote Target」に表示されたプロセスの **inspect** をクリック。
3. 専用の DevTools が開くので、Sources パネルでブレークポイントを置く（使い方はブラウザと同じ → [[Sources（ブレークポイントとステップ実行）]]）。

- 「Open dedicated DevTools for Node」を開いておくと、プロセスを再起動しても自動でつなぎ直してくれます。

---

## 3. VS Code でつなぐ

### 一番簡単：JavaScript Debug Terminal

1. コマンドパレット → **JavaScript: Debug Terminal**。
2. そのターミナルで、いつもどおり `npm run dev` などを実行する。
3. VS Code で置いたブレークポイントで止まる。

- 子プロセスも自動でつながるので、`npm` スクリプト・`tsx`・`nodemon`・Vitest でもそのまま使えます。

### launch.json で設定する

```jsonc
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "サーバーを起動してデバッグ",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "skipFiles": ["<node_internals>/**", "**/node_modules/**"],
      "console": "integratedTerminal"
    },
    {
      "name": "起動中のプロセスにつなぐ",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true
    }
  ]
}
```

- `skipFiles` で Node の内部や node_modules にステップインしないようにする。
- `attach` は、`--inspect` 付きで起動済みのプロセス（Docker の中など）につなぐときに使う。

---

## 4. TypeScript を直接デバッグする

| 実行方法 | デバッグの仕方 |
|----------|----------------|
| `tsx src/server.ts` | `node --inspect --import tsx src/server.ts`、または Debug Terminal で `npx tsx src/server.ts` |
| Node.js の型除去（`node src/server.ts`、新しめの Node.js） | そのまま `--inspect` を付ける |
| `tsc` でビルドしてから実行 | `sourceMap: true` でビルドし、ビルド後の JS を `--inspect` で実行。ブレークポイントは .ts に置ける |

- ブレークポイントが効かない（灰色の丸になる）ときは、ソースマップが生成されているか、パスが合っているかを確かめる。

---

## 5. フレームワークごとの起動

| 対象 | 方法 |
|------|------|
| Express など | `node --inspect src/server.js`、nodemon なら `nodemon --inspect src/server.js` |
| **Next.js** | `NODE_OPTIONS='--inspect' next dev`。サーバーコンポーネント・Route Handler・Server Action のサーバー側処理で止まる。クライアント側はブラウザの DevTools で |
| Vitest | Debug Terminal で `npx vitest run`、または `vitest --inspect-brk --no-file-parallelism`（[[08_CI連携とデバッグ]]） |
| Docker の中 | `node --inspect=0.0.0.0:9229` で起動し、`9229` ポートを公開して `attach` |

---

## 6. ブレークポイント以外の道具

| 道具 | 使い方 | 用途 |
|------|--------|------|
| **REPL** | `node` だけで起動し、コードを1行ずつ試す | 関数の動き・正規表現・日付の計算を確かめる |
| `util.inspect` | `console.log(util.inspect(obj, { depth: null }))` | 深い入れ子のオブジェクトを全部出す（通常は2階層で省略される） |
| `NODE_DEBUG` | `NODE_DEBUG=http,net node app.js` | Node 内部モジュールのデバッグログ |
| `DEBUG` | `DEBUG=express:* node app.js` | `debug` パッケージを使うライブラリ（Express など）のログ |
| `--cpu-prof` / `--heap-prof` | 実行後にプロファイルのファイルができる | 遅さ・メモリの調査（[[03_サーバー側のよくある問題の調べ方]]） |

---

## 7. 関連項目

- [[Sources（ブレークポイントとステップ実行）]]：画面の使い方はブラウザと同じ
- [[02_サーバーのログと本番の調査]]
- [[03_サーバー側のよくある問題の調べ方]]
- 31_Node.js：Node.js 自体の基礎

---

**前へ** ← [[02_flakyテストの原因と対策]]　｜　**次に読む** → [[02_サーバーのログと本番の調査]]
