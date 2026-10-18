# ESM / CJS の違い（実務で困らない最小知識）

> Node.js でTypeScriptを書いていると、ある日突然 `Cannot use import statement outside a module` や `require is not defined` というエラーに出会います。原因は **ESM（ECMAScript Modules）** と **CJS（CommonJS）** という2つのモジュールシステムの混在。本ファイルでは「**実務で困らない**」最小限の理解を整理します。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 次: [[02-importとexportの基本]]

---

## 1. 2つのモジュールシステム

### CJS（CommonJS）

Node.js が長年使ってきた**伝統的な**システム。

```javascript
// 読み込み
const fs = require("fs");

// 公開
module.exports = { foo: 1 };
```

### ESM（ECMAScript Modules）

ECMAScript 標準（ブラウザでも動く）。**現代のJSの標準**。

```javascript
// 読み込み
import fs from "fs";

// 公開
export const foo = 1;
export default { foo };
```

→ **TypeScriptの `import` / `export` 構文はESM準拠**。

---

## 2. なぜ混在するのか

### 歴史的経緯

- **2009年**: Node.js 誕生、CJSを採用
- **2015年**: ESM が ECMAScript 仕様に入る
- **2019年〜**: Node.js が ESM を本格サポート
- **現在**: 既存の npm パッケージは CJS、新しいものは ESM、両対応も多い

→ **エコシステム全体が移行中**。完全に終わるには数年かかる見込み。

---

## 3. 実務でのハマりどころ

### (1) `Cannot use import statement outside a module`

```javascript
import fs from "fs"; // ❌ Node が ESM として認識していない
```

→ Node がこのファイルを CJS と解釈している。

#### 解決策

**(a) `package.json` に `"type": "module"` を追加**

```json
{
  "type": "module"
}
```

これで `.js` ファイルが ESM として扱われる。

**(b) ファイル拡張子を `.mjs` にする**

```
script.mjs  // 自動的にESM
script.cjs  // 自動的にCJS
```

**(c) TypeScript なら `tsconfig.json` の `module` 設定**

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler"  // または "node16" / "nodenext"
  }
}
```

→ 出力が ESM になる。

### (2) `require is not defined`

```javascript
const fs = require("fs"); // ❌ ESM 環境では require が無い
```

→ ESM 環境では `import` を使う。

```javascript
import fs from "fs";
```

ただし**動的な読み込み**が必要なら:

```javascript
const fs = await import("fs"); // 動的 import（Promise を返す）
```

### (3) `__dirname` / `__filename` が無い

CJS には `__dirname` `__filename` があるが、**ESM には無い**:

```javascript
// CJS
console.log(__dirname); // ✅

// ESM
console.log(__dirname); // ❌
```

→ ESM での代替:

```javascript
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

長い。慣れるしかない。

### (4) `default export` の挙動の違い

CJS の `module.exports = ...` を ESM から `import` するときに、**TypeScript設定次第**で挙動が変わる。

```javascript
// CJS パッケージ
module.exports = function() { ... };
```

```typescript
// ESM 側
import lodash from "lodash"; // OK or NG ?
```

→ `tsconfig.json` の **`esModuleInterop: true`** が必要（推奨）:

```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

これを有効にすると、CJS パッケージを `import x from "pkg"` で読み込めるようになる。**ほぼ必須設定**。

### (5) ESM では拡張子が必須

```typescript
// CJS
import { foo } from "./utils"; // ✅

// 純粋なESM
import { foo } from "./utils"; // ❌ 拡張子が要る
import { foo } from "./utils.js"; // ✅
```

TypeScript の `.ts` ファイルでも、ESM出力時は **`.js`**（コンパイル後の名前）を書く必要がある場合があります。これは `tsconfig.json` の `moduleResolution` 設定次第:

- `node` / `bundler`: 拡張子省略OK
- `node16` / `nodenext`: 拡張子必須（`.js` を書く）

→ Vite / Webpack などの**バンドラ環境**なら気にしなくてOK。**素のNode.js + ESM** で書くと拡張子が必要になる。

---

## 4. TypeScript の `module` / `target` / `moduleResolution`

`tsconfig.json` の関連設定:

```json
{
  "compilerOptions": {
    "target": "ES2022",          // 出力する JS の構文バージョン
    "module": "ESNext",           // モジュールシステム（出力）
    "moduleResolution": "bundler", // 解決アルゴリズム
    "esModuleInterop": true       // CJS との相互運用
  }
}
```

### 推奨設定（モダン）

| 環境 | `module` | `moduleResolution` |
|---|---|---|
| Vite / Next.js / バンドラ | `ESNext` | `Bundler` |
| Node.js + ESM（最新） | `NodeNext` | `NodeNext` |
| Node.js + CJS（レガシー） | `CommonJS` | `Node` |
| ライブラリ作成 | `ESNext` | `Bundler` |

→ **新規プロジェクトは ESM 系**。`Bundler` か `NodeNext`。

---

## 5. Node.js でTSを「直接実行」するツール

開発時に `tsc` でコンパイルしてから `node` で実行は面倒。**直接実行**ツールが便利:

| ツール | 特徴 |
|---|---|
| `ts-node` | 老舗、CJSメイン、ESMは設定が必要 |
| `tsx` | 高速、ESM/CJS両対応、設定楽 |
| `vite-node` | Vite 内部で使う |
| `bun` | TypeScript ネイティブ実行（Node 代替） |
| `deno` | TypeScript ネイティブ |

→ **新規開発は `tsx` がおすすめ**（設定なしで動く）。

```bash
npx tsx script.ts
```

---

## 6. ESM / CJS 混在時の最小ルール

実務での生存戦略:

### (1) **新規プロジェクトは ESM**

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts"
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "target": "ES2022"
  }
}
```

### (2) **既存 CJS プロジェクトはそのまま**

無理にESMに移行する必要はない。既存コードが動くなら CJS でOK。

### (3) **`esModuleInterop: true` は必須**

CJSパッケージを使う場面で必要。

### (4) **ライブラリ作成は両対応がベター**

公開する npm パッケージは「ESM版」「CJS版」両方を提供するのが親切（`tsup` などのツールが自動化）。

---

## 7. ブラウザでのモジュール

ブラウザは ESM をネイティブ対応:

```html
<script type="module" src="main.js"></script>
```

```javascript
// main.js
import { foo } from "./utils.js"; // 拡張子必須
```

→ ブラウザは**素のESM**しか扱えない（拡張子必須、パスが厳密）。実務ではバンドラ（Vite, Webpack）が解決してくれるので意識しないことも多い。

---

## 8. `import.meta`

ESM 専用のオブジェクト。CJS の `__dirname` の代替などで使う。

```javascript
console.log(import.meta.url); // ファイルのURL
```

### Vite では環境変数取得に使う

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

→ Vite ユーザはここで `import.meta` に出会うことが多い。

---

## 9. CommonJS の挙動の独特さ

CJSの `module.exports` は**動的**に振る舞う:

```javascript
// CJS
function foo() { ... }
function bar() { ... }
module.exports = { foo };
if (someCondition) {
  module.exports.bar = bar; // 後から追加できる
}
```

ESM はこれができない（`export` は静的）。**ESMの方が型解析・ツリーシェイキングしやすい**理由の1つ。

---

## 10. `package.json` の `exports` フィールド

モダンなパッケージは `exports` フィールドで**ESM/CJS両方**を提供:

```json
{
  "name": "my-lib",
  "main": "./dist/index.cjs",       // 旧 Node 用
  "module": "./dist/index.mjs",      // ESM 環境用（古い）
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

→ ライブラリ作者は `exports` を書くのが現代的。

---

## 11. よくあるエラーと対処

### `ERR_REQUIRE_ESM`

CJS 環境から ESM パッケージを `require` しようとした。

```javascript
const lib = require("esm-only-pkg"); // ❌
```

→ プロジェクトを ESM 化するか、動的 import:

```javascript
const lib = await import("esm-only-pkg");
```

### `ERR_UNSUPPORTED_DIR_IMPORT`

```javascript
import { foo } from "./utils"; // ディレクトリは不可（ESM）
import { foo } from "./utils/index.js"; // ✅
```

### `Cannot find module './utils'`

拡張子省略が許されない設定で省略している。

→ `.js` を書くか、`moduleResolution` を `Bundler` に。

### `SyntaxError: Cannot use import statement outside a module`

`package.json` に `"type": "module"` がない、またはファイルが `.cjs` 扱い。

---

## 12. ベストプラクティス

### (1) **新規プロジェクト**

```json
// package.json
{
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc"
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "isolatedModules": true,
    "strict": true
  }
}
```

### (2) **設定で迷ったら**

- アプリ → `Bundler` モジュール解決
- ライブラリ → `NodeNext` で両対応ビルド（`tsup` 等で自動）
- レガシー継続 → `CommonJS` のまま

### (3) **実行ツール**

- 開発: `tsx`（設定不要、高速）
- 本番: `tsc` でコンパイル → `node`

### (4) **トラブった時**

- `package.json` の `"type"` を確認
- `tsconfig.json` の `module` / `moduleResolution` を確認
- パッケージの `package.json` の `exports` / `main` / `module` を確認

---

## 13. まとめ

- **CJS** = `require` / `module.exports`、**ESM** = `import` / `export`
- **TypeScriptの構文はESM**、出力先は `tsconfig.json` で制御
- ハマりどころ: `Cannot use import` / `require is not defined` / `__dirname` 不在 / 拡張子必須
- **`esModuleInterop: true`** は事実上必須
- **新規プロジェクトはESM**、既存 CJS は無理に移行しなくてOK
- **`tsx`** で開発時の TS 直接実行が楽
- **ライブラリ作成は両対応**（`exports` フィールド）

> ESM / CJS は「**設定のせいでハマることはあるが、概念は単純**」。一度自分のプロジェクトが ESM か CJS かを把握し、`tsconfig.json` を整えれば、9割のトラブルは回避できます。

---

## 関連
- [[02-importとexportの基本]]
- [[03-path-alias]]
- [[12-tsconfig]]
