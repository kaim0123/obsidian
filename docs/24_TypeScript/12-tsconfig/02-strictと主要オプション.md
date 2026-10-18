# `strict` と主要オプション（`noImplicitAny` 等）

> `"strict": true` は「**TypeScript の真価を引き出すスイッチ**」です。これを有効にしないと、TypeScript はほぼ「型注釈付きJavaScript」程度。本ファイルでは `strict` が含む各オプションの意味と、**新規プロジェクトでオンにすべきもの**を整理します。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[01-target_module_lib]]
- 次: [[03-noUncheckedIndexedAccess]]

---

## 1. `strict: true` とは

**8つのオプションを一括有効化**するショートカット。

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

これは内部的に以下を全部 `true` にする:

- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- `strictBindCallApply`
- `strictPropertyInitialization`
- `noImplicitThis`
- `useUnknownInCatchVariables`
- `alwaysStrict`

→ **新規プロジェクトでは必ず `true`**。これがないと TypeScript を使う意味がほぼ消えます。

---

## 2. `noImplicitAny`

**暗黙の `any` を禁止**する。

```typescript
function greet(user) { // ❌ 'user' implicitly has an 'any' type.
  return `Hi ${user}`;
}

// ✅
function greet(user: string) {
  return `Hi ${user}`;
}
```

引数の型を書き忘れると警告。これがないと**型を書き忘れたまま `any` で進行**してしまう。

### 影響

- すべての関数引数に型注釈を要求される
- 型のないライブラリの `import` で警告
- 「あとで書く」ができなくなる

→ **必ず有効に**。

---

## 3. `strictNullChecks`

`null` / `undefined` を**他の型と区別**する。

```typescript
let s: string = "hello";
s = null;       // ❌ Type 'null' is not assignable to type 'string'.
s = undefined;  // ❌

let s2: string | null = "hello";
s2 = null;      // ✅
```

無効だと、`null` がどこにでも入りうる地獄に。

### 影響

- 「null になりうる値」を**型で表現**する必要
- 関数引数や戻り値の `| null` / `| undefined` を意識
- `if (x !== null)` などの narrowing が必要

→ **必ず有効に**。詳しくは [[05-null安全とstrictNullChecks]]。

---

## 4. `strictFunctionTypes`

関数引数の**互換性を厳密に**チェックする（変位の正しい扱い）。

```typescript
type Animal = { name: string };
type Dog = Animal & { bark(): void };

type AnimalHandler = (a: Animal) => void;
type DogHandler = (d: Dog) => void;

const handleDog: DogHandler = (d) => d.bark();
const handleAnimal: AnimalHandler = handleDog;
// ❌ strictFunctionTypes 有効時はエラー
// （DogHandler は Animal で呼べない、bark がないため）
```

→ 関数の引数の**反変性**を正しく扱う。詳しくは [[共変と反変]]。

### 影響

- 一部の既存コードでエラーが出る（多くは正しい指摘）
- ライブラリの型定義が古いとエラーになることも

→ **有効に**（`strict: true` の一部）。

---

## 5. `strictBindCallApply`

`bind` / `call` / `apply` の引数チェックを**厳密に**する。

```typescript
function greet(name: string, age: number) {
  return `${name}, ${age}`;
}

greet.call(null, "Alice", "thirty"); // ❌ age が string
greet.apply(null, ["Alice", 30]);    // ✅
```

→ JavaScript 由来のメソッドの引数も型チェック。

### 影響

ほぼ問題なし。**有効推奨**。

---

## 6. `strictPropertyInitialization`

クラスの**全フィールドが初期化**されているか確認。

```typescript
class User {
  name: string; // ❌ 初期化されていない

  constructor() {
    // name = ... を書いていない
  }
}
```

→ 初期化方法:

```typescript
// (a) 宣言で初期化
class User {
  name: string = "";
}

// (b) コンストラクタで初期化
class User {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

// (c) パラメータプロパティ
class User {
  constructor(public name: string) {}
}

// (d) 「絶対に初期化される」を `!` で表明（最終手段）
class User {
  name!: string; // 例: 後から DI される
}
```

### 影響

- フィールド未初期化バグを防げる
- 「`undefined` になりうる」と思っていなかったフィールドの炙り出し

→ **有効推奨**。`strictNullChecks` とセットで効果が出る。

---

## 7. `noImplicitThis`

`this` の型が**不明な関数**を警告。

```typescript
function f() {
  console.log(this); // ❌ 'this' implicitly has type 'any'
}
```

→ `this` 型を明示するか、`this` を使わない関数にする:

```typescript
function f(this: User) {
  console.log(this.name); // ✅ this: User
}
```

### 影響

- `this` を使う関数で型注釈が必要
- アロー関数なら影響なし（`this` を持たないため）

→ **有効推奨**。詳しくは [[05-thisと関数の落とし穴]]。

---

## 8. `useUnknownInCatchVariables`

`catch (err)` の `err` の型を **`unknown`** にする（デフォルトは `any`）。

```typescript
try {
  // ...
} catch (err) {
  // err: unknown (有効時)
  err.message; // ❌ unknown
  if (err instanceof Error) {
    err.message; // ✅
  }
}
```

`throw` は何でも投げられる（`throw "string"` も可能）ので、**`Error` とは限らない**前提が正しい。

### 影響

- 既存の `catch` で `err.message` のようなコードが警告に
- `if (err instanceof Error)` でガード必要

→ **有効推奨**。

---

## 9. `alwaysStrict`

すべてのファイルを **JavaScript の strict mode** で出力。

```javascript
"use strict"; // ← 自動で挿入される
```

ECMAScript Modules はもともと strict mode なので、ESM 環境ではほぼ無関係。CJS 環境で意味がある。

→ **有効推奨**（影響ほぼなし）。

---

## 10. `strict` に含まれない、追加で有効にしたいオプション

`strict: true` だけでは足りない。**追加でオン**にすべきものを紹介。

### `noUncheckedIndexedAccess`

配列・辞書のアクセス結果を `T | undefined` にする。

```typescript
const arr = [1, 2, 3];
const x = arr[10]; // T | undefined （有効時）
```

詳しくは [[03-noUncheckedIndexedAccess]]。

### `exactOptionalPropertyTypes`

`?` プロパティに明示的に `undefined` を渡せなくする。

```typescript
type T = { x?: string };
const t: T = { x: undefined }; // ❌ 有効時
```

詳しくは [[04-exactOptionalPropertyTypes]]。

### `noFallthroughCasesInSwitch`

`switch` で `break` 漏れを警告。

```typescript
switch (x) {
  case 1:
    foo();
    // break 忘れ
  case 2:
    bar();
    break;
}
// ❌ Fallthrough case in switch.
```

→ **有効推奨**。

### `noImplicitReturns`

関数の**全パスで return しないと警告**。

```typescript
function f(x: number): string {
  if (x > 0) return "positive";
  // 他のパスで return がない → ❌
}
```

→ **有効推奨**。

### `noUnusedLocals` / `noUnusedParameters`

未使用変数・引数を警告。

```typescript
function f(x: number) {
  const y = 10; // ❌ y は未使用
  return x;
}
```

→ ESLint でも代替できるので**ESLintに任せる**選択も。

### `forceConsistentCasingInFileNames`

ファイル名の大文字小文字を厳密に。

```typescript
import { x } from "./Utils";
import { y } from "./utils"; // ❌ 大文字小文字の不一致
```

WindowsとMac/Linuxの**ファイルシステム差**でハマるので、有効に。

→ **有効推奨**（多くのテンプレートで既定）。

---

## 11. 推奨設定（モダンプロジェクト）

```json
{
  "compilerOptions": {
    // 基本
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "esModuleInterop": true,
    "isolatedModules": true,
    "skipLibCheck": true,

    // strict 系
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true, // チームと相談

    // 追加
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,

    // 出力
    "outDir": "dist",
    "declaration": true
  }
}
```

→ 「**型システムを最大限活かす**」設定。

---

## 12. 既存プロジェクトを strict 化する手順

レガシー TS プロジェクトを途中から strict 化するには:

### (1) いきなり `strict: true` は無理

エラーが大量に出てビルド不能になる。**段階的**に有効化する。

### (2) 個別オプションを順番に

```json
{
  "noImplicitAny": true   // まずこれだけ
}
```

→ `any` を全部明示する → 完了したら次へ。

### (3) ファイル単位で `// @ts-strict` も検討

`@typescript-eslint/strict` プラグインで**ファイル単位**で有効化できる。

### (4) 自動化ツール

- `tsc --noEmit` でエラーを列挙
- `ts-migrate` などの自動変換ツール

### (5) チームで合意

「strict 移行は3か月かけて段階的に」のような**計画**を共有。

---

## 13. ESLint との関係

TypeScript の strict だけでは足りない部分を ESLint で補う:

```bash
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/strict"
  ]
}
```

→ `no-floating-promises`, `no-unsafe-assignment`, `consistent-type-imports` などの**TS固有のlintルール**が有効になる。

---

## 14. 設定の確認

```bash
npx tsc --showConfig
```

→ 適用される完全な設定（デフォルト含む）が表示される。

```bash
npx tsc --noEmit
```

→ 出力なしで型チェックだけ実行。CI で使う。

---

## 15. 早見表

| オプション | 含まれる？ | 推奨 | 効果 |
|---|---|---|---|
| `noImplicitAny` | strict | ✅ | 暗黙のany禁止 |
| `strictNullChecks` | strict | ✅ | null/undefined 厳密 |
| `strictFunctionTypes` | strict | ✅ | 関数の変位チェック |
| `strictBindCallApply` | strict | ✅ | bind/call/applyの引数チェック |
| `strictPropertyInitialization` | strict | ✅ | クラスフィールド初期化必須 |
| `noImplicitThis` | strict | ✅ | this の型必須 |
| `useUnknownInCatchVariables` | strict | ✅ | catchが unknown |
| `alwaysStrict` | strict | ✅ | "use strict"挿入 |
| `noUncheckedIndexedAccess` | 追加 | ✅ | 配列アクセスが `T \| undefined` |
| `exactOptionalPropertyTypes` | 追加 | △（規約次第） | optional に undefined 不可 |
| `noFallthroughCasesInSwitch` | 追加 | ✅ | switch の break 漏れ警告 |
| `noImplicitReturns` | 追加 | ✅ | return 漏れ警告 |
| `forceConsistentCasingInFileNames` | 追加 | ✅ | ファイル名の大小区別 |

---

## 16. まとめ

- **`strict: true`** で8つのオプションを一括有効化（**新規プロジェクトでは必須**）
- 内訳: `noImplicitAny` / `strictNullChecks` / `strictFunctionTypes` / `strictBindCallApply` / `strictPropertyInitialization` / `noImplicitThis` / `useUnknownInCatchVariables` / `alwaysStrict`
- 追加で **`noUncheckedIndexedAccess`** / **`noFallthroughCasesInSwitch`** / **`forceConsistentCasingInFileNames`** を推奨
- **`exactOptionalPropertyTypes`** はチーム規約と相談
- 既存プロジェクトは**段階的に**有効化
- ESLint と組み合わせて TS の型チェックを補完

> `strict` を有効にしないTSは「**型のヒント付きJS**」。`strict: true` から始めて、追加の厳密化オプションを段階的に取り入れる ── これが TypeScript を使う本当の意味です。

---

## 関連
- [[01-target_module_lib]]
- [[03-noUncheckedIndexedAccess]]
- [[04-exactOptionalPropertyTypes]]
- [[05-isolatedModulesとビルド前提]]
- [[strict系オプション]]
