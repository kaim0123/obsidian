# `import` / `export` の基本とパターン

> ESM の `import` / `export` は構文が多く、**書き方によって挙動が微妙に違います**。`default export` と `named export` の使い分け、`type` 専用 import、re-export ── 実務で出会うパターンをまとめて整理します。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[01-ESMとCJSの違い]]
- 次: [[03-path-alias]]

---

## 1. `export` の2種類

### Named Export（名前付きエクスポート）

```typescript
// utils.ts
export const PI = 3.14;
export function add(a: number, b: number) { return a + b; }
export class User {}
export type Status = "ok" | "ng";
```

複数の値を**名前付きで**公開できる。

### Default Export（デフォルトエクスポート）

```typescript
// math.ts
export default function add(a: number, b: number) {
  return a + b;
}

// または
function add(a: number, b: number) { return a + b; }
export default add;
```

ファイルあたり**1つだけ**、名前なしで公開。

---

## 2. `import` の対応する書き方

### Named Import

```typescript
import { PI, add, User } from "./utils";
```

### Default Import

```typescript
import add from "./math"; // 名前は何でもOK
import myAdd from "./math"; // ✅ こう書いてもいい
```

### 両方を組み合わせ

```typescript
// utils.ts
export const PI = 3.14;
export default function add() { ... }
```

```typescript
import add, { PI } from "./utils"; // default + named
```

### 全部まとめてインポート（Namespace import）

```typescript
import * as utils from "./utils";

utils.PI;
utils.add(1, 2);
```

`*` で「**そのモジュールの全 export を1つのオブジェクトにまとめる**」。

---

## 3. `default export` vs `named export` ── どちらを使う？

### Named Export（**推奨**）

#### メリット

- **タイポをコンパイル時に検出**

```typescript
import { add } from "./utils";
import { ad } from "./utils"; // ❌ コンパイルエラー
```

- **複数の値を1ファイルから公開できる**
- **エディタの自動補完が効く**
- **rename refactoring が容易**

#### デメリット

- 1ファイルに複数あると import 文が長くなる

### Default Export

#### メリット

- ファイルあたり1つの「主役」が明確
- 短く書ける（`import x from ...`）

#### デメリット

- **タイポを検出しにくい**（任意の名前で受けられる）

```typescript
import addd from "./math"; // ❌ コンパイルは通る！
```

- **rename refactoring が難しい**（受け側の名前が固定でない）
- **Tree shakingしにくい**ことがある

### 結論: **Named Export を基本**に

現代のTSプロジェクトでは **Named Export 中心**が推奨。例外:

- React コンポーネントの慣習で default export
- ライブラリの「メイン1つ」の慣習で default export

```typescript
// React コンポーネント（慣習）
export default function Button() { ... }
```

ただし、Named Export でも問題なく動く:

```typescript
export function Button() { ... }
import { Button } from "./Button";
```

→ **チームで統一**するのが大事。

---

## 4. `import type` / `export type` ── 型専用

TypeScript 3.8+ で導入された **「型のみのインポート」** 構文。

```typescript
import type { User } from "./types";

function f(u: User) { ... } // 型として使う
```

### なぜ必要か

通常の `import` だと、コンパイル後の JS にも残る:

```typescript
// 通常
import { User } from "./types";
// → コンパイル後: import { User } from "./types"; （実行時に読み込み発生）
```

`User` が**型のみ**（`type` か `interface`）なら、実行時には不要なのに読み込みが発生するのは無駄。

```typescript
// type-only
import type { User } from "./types";
// → コンパイル後: 完全に消える
```

### `isolatedModules: true` で必須に近い

`tsconfig.json` で `isolatedModules: true`（Vite/Next.js では既定）を有効にすると、**型のみ import は `import type` にしないと警告**。

### 混在の書き方

```typescript
import { someValue, type SomeType } from "./mod";
```

TypeScript 4.5 から、**1つの import 文の中で値と型を区別**できる。

---

## 5. Re-export（再エクスポート）

ある場所から import したものを、その場所から export する。

```typescript
// utils/index.ts
export { add, sub } from "./math";
export { User } from "./user";
export type { Status } from "./status";
```

→ **バレル**（次章 [[04-バレルと循環参照]]）の構築に使う。

### 別名で export

```typescript
export { add as addNumbers } from "./math";
```

### 全部 re-export

```typescript
export * from "./math";
```

→ `math.ts` のすべての named export がそのまま公開される。

### default を named にして re-export

```typescript
export { default as Button } from "./Button";
```

→ `Button.tsx` の default export を `Button` として named export に変換。

---

## 6. 動的 import (`import()`)

実行時に**動的に**モジュールを読み込む。

```typescript
async function loadUser() {
  const { User } = await import("./user");
  return new User();
}
```

戻り値は `Promise`。

### 使い所

- **コード分割**（lazy loading）
- **条件付き読み込み**

```typescript
if (someCondition) {
  const { heavyModule } = await import("./heavy");
  heavyModule.doStuff();
}
```

### React の lazy

```typescript
const HeavyComponent = React.lazy(() => import("./HeavyComponent"));
```

→ ビルド時に**別チャンクに分離**され、必要な時だけロードされる。

---

## 7. `export = ...` と `import = require(...)` （CJS互換構文）

TypeScript固有の**CJS互換**構文。

```typescript
// 古いCJS互換
export = function() { ... };
import x = require("module");
```

**現代では使わない**。`esModuleInterop: true` で普通の `import` で済む。

---

## 8. パターン: バレル（index.ts）

ディレクトリの公開APIを `index.ts` で集約。

```
src/
  utils/
    math.ts
    string.ts
    index.ts   // re-export
```

```typescript
// utils/index.ts
export * from "./math";
export * from "./string";
```

```typescript
// 利用側
import { add, capitalize } from "./utils"; // index.ts経由
```

詳しくは [[04-バレルと循環参照]] へ。

---

## 9. 副作用のあるモジュールの import

ファイル全体を**実行**したいだけのとき:

```typescript
import "./polyfills"; // 副作用のために実行
import "./styles.css"; // CSSを読み込み（バンドラ依存）
```

`{ ... }` も名前もない `import` は、**ファイルの実行（副作用の発火）だけ**を行う。

---

## 10. よくある書き方パターン

### (1) 標準ライブラリ・サードパーティ

```typescript
import { useState } from "react";
import express from "express";
import * as fs from "fs/promises";
```

### (2) 同じプロジェクト内

```typescript
import { User } from "../types/user";
import { api } from "@/lib/api";  // path alias
```

### (3) 型のみ

```typescript
import type { ComponentProps } from "react";
import type { User, Order } from "@/types";
```

### (4) 副作用

```typescript
import "./polyfills";
import "./global.css";
```

### (5) 動的

```typescript
const m = await import("./heavy");
```

### (6) Namespace

```typescript
import * as utils from "./utils";
```

---

## 11. 落とし穴

### (1) `default` import で名前を変えてしまう

```typescript
import dog from "./animal"; // 中身は default export の Cat
dog.meow(); // 動くが混乱
```

→ 命名は元の名前に揃える。

### (2) Named import のタイポ

```typescript
import { Usre } from "./user"; // ❌ Usre が無い
```

→ コンパイル時に検出される。

### (3) 循環参照

```typescript
// a.ts
import { b } from "./b";
export const a = "A";

// b.ts
import { a } from "./a";
export const b = "B";
```

→ 実行時に `undefined` が混入することがある。詳しくは [[04-バレルと循環参照]]。

### (4) `import type` の効果を忘れる

```typescript
import { User } from "./user"; // 値として読み込む
import type { User } from "./user"; // 型のみ（実行時に消える）
```

→ 型しか使わないなら `type` を付ける。

### (5) `isolatedModules` 環境で再エクスポートに `type` 必須

```typescript
// isolatedModules: true
export { User } from "./user"; // ❌ 型のみだとエラー
export type { User } from "./user"; // ✅
```

---

## 12. ベストプラクティス

### (1) **Named Export を基本に**

タイポ検出・rename・補完の恩恵が大きい。

### (2) **`import type` を積極的に使う**

型しか使わない import は `type` を付ける。

### (3) **import の順序を整える**

ESLint の `import/order` ルールで自動整列:

```typescript
// 1. Node 組み込み
import fs from "fs";

// 2. サードパーティ
import { useState } from "react";
import axios from "axios";

// 3. 自プロジェクト（path alias）
import { User } from "@/types";
import { api } from "@/lib/api";

// 4. 相対パス
import { helper } from "./helper";

// 5. CSS等の副作用
import "./styles.css";
```

### (4) **不要な import は削除**

ESLint の `unused-imports` ルールで自動削除。

### (5) **長いパスは path alias で短く**

```typescript
import { User } from "../../../types/user"; // ❌ 読みにくい
import { User } from "@/types/user";          // ✅
```

→ [[03-path-alias]] へ。

---

## 13. 早見表

| 構文 | 効果 |
|---|---|
| `export const x = ...` | named export |
| `export default ...` | default export |
| `export type X = ...` | 型 export |
| `import { x } from "..."` | named import |
| `import x from "..."` | default import |
| `import type { X } from "..."` | 型 only import |
| `import * as ns from "..."` | namespace import |
| `import "..."` | 副作用のみ |
| `await import("...")` | 動的 import |
| `export { x } from "..."` | re-export |
| `export * from "..."` | 全 re-export |

---

## 14. まとめ

- **Named export** = タイポ検出・rename しやすい（推奨）
- **Default export** = ファイル1つの主役向き（Reactコンポーネント等の慣習）
- **`import type`** で型のみ import → 実行時コードが軽くなる
- **動的 import** で lazy loading
- **re-export** でバレル構築
- 副作用 import は `import "..."` だけで実行
- ESLint で順序・未使用・型only を自動整理

> `import` / `export` は「**書き方は多いが、ルールはシンプル**」。Named Export を基本に、`import type` を活用する ── これだけで保守性が一段上がります。

---

## 関連
- [[01-ESMとCJSの違い]]
- [[03-path-alias]]
- [[04-バレルと循環参照]]
- [[isolatedModules]]
