# `target` / `module` / `lib`

> `tsconfig.json` の中でも**最初に決める3つの設定**。「どんなJSに変換するか」「どんなモジュールシステムで出力するか」「どんなAPIを使えると仮定するか」を決めるため、ここを間違えると**実行時エラーや謎の型エラー**の根っこになります。本ファイルでは「**実務で迷わない選び方**」を整理します。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 次: [[02-strictと主要オプション]]

---

## 1. 3つの役割

| 設定 | 役割 |
|---|---|
| `target` | コンパイル後のJSの**構文バージョン** |
| `module` | 出力する**モジュールシステム** |
| `lib` | 型として認識する**標準API** |

`tsconfig.json` の例:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM"]
  }
}
```

---

## 2. `target` ── コンパイル後のJS構文

「**どのバージョンのJavaScriptに変換するか**」。

```typescript
// TypeScript
const arr = [1, 2, 3];
const doubled = arr.map(n => n * 2);
class User { constructor(public name: string) {} }
```

`target: "ES5"` だと、アロー関数や `class` を**古い構文に変換**:

```javascript
var arr = [1, 2, 3];
var doubled = arr.map(function (n) { return n * 2; });
function User(name) { this.name = name; }
```

`target: "ES2022"` だと、ほぼそのまま出力:

```javascript
const arr = [1, 2, 3];
const doubled = arr.map(n => n * 2);
class User { constructor(name) { this.name = name; } }
```

### 主な選択肢

| 値 | 対応環境 | 用途 |
|---|---|---|
| `ES5` | IE11等のレガシーブラウザ | もう使わない |
| `ES2015` (ES6) | クラス/let/const | レガシー |
| `ES2017` | async/await | やや古い |
| `ES2020` | Optional Chaining | 古いNode (14) |
| `ES2022` | Top-level await, クラスフィールド | **モダンNode/ブラウザ**（推奨） |
| `ES2023` | Array.findLast 等 | 最新 |
| `ESNext` | 最新仕様 | 開発用、ビルド時は固定推奨 |

### 推奨

- **モダンWeb / 新Node.js** → `ES2022` または `ES2023`
- **古いブラウザ対応**（IE11）→ `ES5`（バンドラ側で polyfill）
- **ライブラリ作成** → 一段下げて広く対応（`ES2020` あたり）

---

## 3. `module` ── モジュールシステム

「**出力ファイルのモジュール形式**」。

| 値 | 形式 | 用途 |
|---|---|---|
| `CommonJS` | `require/exports` | 旧Node、レガシー |
| `ESNext` | `import/export` | モダンWeb、Vite/Webpack |
| `ES2015` `ES2020` 等 | ESM | バージョン固定 |
| `Node16` / `NodeNext` | Node.jsの`.cjs/.mjs`/拡張子必須 | モダンNode |
| `AMD` `UMD` `System` | レガシー | 使わない |

### `moduleResolution` とセット

`module` だけでなく **`moduleResolution`**（モジュールの**解決アルゴリズム**）も重要:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler"
  }
}
```

| `moduleResolution` | 用途 |
|---|---|
| `Node` | 旧 Node 風（CJS時代の挙動） |
| `Node16` / `NodeNext` | モダン Node の ESM/CJS区別 |
| `Bundler` | Vite/Webpack/esbuild など**バンドラ前提** |
| `Classic` | 古い、使わない |

### 推奨

| 環境 | `module` | `moduleResolution` |
|---|---|---|
| Vite / Next.js | `ESNext` | `Bundler` |
| Node.js (ESM) | `NodeNext` | `NodeNext` |
| Node.js (CJS、レガシー) | `CommonJS` | `Node` |

→ **新規プロジェクトなら `Bundler`** が一番楽（拡張子省略OK、最新仕様対応）。詳しくは [[01-ESMとCJSの違い]]。

---

## 4. `lib` ── 利用可能な標準API

「**コードの中でどんな標準APIを使えると仮定するか**」。型として認識される範囲を制御。

```json
{
  "compilerOptions": {
    "lib": ["ES2022", "DOM"]
  }
}
```

これを書かないと、**`target` の設定からデフォルト**が選ばれる。

### 主なライブラリ

| `lib` の値 | 内容 |
|---|---|
| `ES5`, `ES2015`, ... `ES2022` | 各バージョンの組み込み型（`Promise`, `Map`, `Array.includes` など） |
| `DOM` | ブラウザAPI（`document`, `window`, `fetch` など） |
| `DOM.Iterable` | DOMコレクションの `for...of` 対応 |
| `WebWorker` | Web Worker 環境 |
| `ScriptHost` | ?（ほぼ使わない） |

### Node.js 環境

```json
{
  "lib": ["ES2022"],
  "types": ["node"]
}
```

→ `DOM` を入れない。代わりに `@types/node` をインストールして `types: ["node"]` で読み込み。

### ブラウザ + Node 両対応のライブラリ

```json
{
  "lib": ["ES2022", "DOM"]
}
```

両方入れて、ブラウザでは `document` を、Nodeでは `process` を使う、など。

---

## 5. `target` と `lib` の関係

`target: "ES2022"` だけ書くと、`lib` のデフォルトは:

```json
{ "lib": ["ES2022", "DOM", "DOM.Iterable", "ScriptHost"] }
```

→ ブラウザ用APIが**自動で含まれる**。

Node.js プロジェクトでは **`lib` を明示**して `DOM` を外す:

```json
{
  "target": "ES2022",
  "lib": ["ES2022"]
}
```

---

## 6. 実例: 環境別の推奨設定

### Vite + React

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "skipLibCheck": true
  }
}
```

### Next.js（自動生成される）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "strict": true,
    // ...
  }
}
```

### Node.js + ESM

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "types": ["node"],
    "strict": true,
    "esModuleInterop": true
  }
}
```

### Node.js + CJS（レガシー）

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "lib": ["ES2020"],
    "types": ["node"],
    "esModuleInterop": true
  }
}
```

### ライブラリ作成

```json
{
  "compilerOptions": {
    "target": "ES2020",      // 一段下げて互換性確保
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2020"],
    "declaration": true,      // .d.ts 出力
    "declarationMap": true,
    "sourceMap": true
  }
}
```

---

## 7. 落とし穴

### (1) `target: "ES5"` でアロー関数が `function` に化ける

レガシーブラウザ向けの設定だが、**現代ではほぼ不要**。Vite/Webpack のバンドラが対応する。

### (2) `lib: ["ES5"]` で `Promise` が使えない

```typescript
const p = Promise.resolve(42); // ❌ 'Promise' name not found
```

→ `lib` に `ES2015` 以上を入れる。

### (3) Node.js プロジェクトで `DOM` が混入

```json
{ "lib": ["ES2022", "DOM"] }
```

```typescript
document.title; // ✅ 通る（型として）が、Node実行時に死ぬ
```

→ Node 環境では `DOM` を入れない。

### (4) `target` と `lib` のバージョン不整合

```json
{
  "target": "ES5",
  "lib": ["ES2022"]
}
```

→ コンパイル後のJSは ES5 だが、`Promise` などが「あるもの」として扱われる。**ランタイムに polyfill が必要**。

### (5) Vite/Next.js の自動設定を上書きしてしまう

```json
{
  "module": "CommonJS"  // ❌ Vite では ESNext が必要
}
```

→ ツールが要求する設定を尊重する。

---

## 8. ベストプラクティス

### (1) **新規プロジェクトは `target: "ES2022"` 以上**

古いブラウザ対応はバンドラに任せる。

### (2) **`module` と `moduleResolution` はセットで決める**

| 環境 | 組み合わせ |
|---|---|
| バンドラ環境 | `ESNext` + `Bundler` |
| モダンNode | `NodeNext` + `NodeNext` |
| レガシーNode | `CommonJS` + `Node` |

### (3) **`lib` を明示**

デフォルトに頼ると環境変更時に挙動が変わる。

### (4) **`@types/*` のインストールも忘れず**

```bash
npm install -D @types/node @types/react
```

`types: ["node"]` で必要なものを読み込む。

### (5) **ツールテンプレートを尊重**

Vite/Next.js 等が生成する `tsconfig.json` には**意味がある**。むやみに変更しない。

---

## 9. デバッグのヒント

### 「謎の型エラー」が出たら…

- `lib` に必要なAPIが含まれているか確認
- `target` がコードの構文に対応しているか確認
- `node_modules` の型定義が読めているか（`skipLibCheck: true` で一時回避）

### 「実行時エラー」が出たら…

- `module` がランタイムと合っているか（CJS 環境で ESM 出力していないか）
- `target` で出力された構文を**実行環境がサポート**しているか

### `tsc --showConfig` で確認

```bash
npx tsc --showConfig
```

→ 実際に適用される完全な設定が表示される。デフォルト含む全部が見える。

---

## 10. 早見表

| 設定 | 推奨値（モダンWeb） | 推奨値（モダンNode） |
|---|---|---|
| `target` | `ES2022` | `ES2022` |
| `module` | `ESNext` | `NodeNext` |
| `moduleResolution` | `Bundler` | `NodeNext` |
| `lib` | `["ES2022", "DOM"]` | `["ES2022"]` |
| `types` | （ブラウザは不要） | `["node"]` |
| `jsx` | `react-jsx`（React） | （不要） |

---

## 11. まとめ

- **`target`**: コンパイル後のJS構文バージョン（**`ES2022`** が現代の標準）
- **`module`**: 出力モジュール形式（`ESNext` / `NodeNext` / `CommonJS`）
- **`moduleResolution`**: モジュール解決アルゴリズム（**`Bundler` または `NodeNext`**）
- **`lib`**: 利用可能な標準API（環境に応じて `DOM` を入れる/外す）
- 環境テンプレート（Vite/Next/etc）の生成設定を**尊重**する
- 「謎の型エラー」は `lib` 不足、「実行時エラー」は `module` ミスマッチを疑う

> この3つは「**プロジェクトの土台**」。新規プロジェクト開始時に**しっかり決めておく**と、後から触らずに済みます。テンプレート由来ならそれを使い、自前で書くなら本ファイルの推奨値から始めるのが安全です。

---

## 関連
- [[02-strictと主要オプション]]
- [[01-ESMとCJSの違い]]
- [[strict系オプション]]
