---
title: 06_言語のモジュール機構_ESM・TypeScript・barrel
created: 2026-10-05
tags:
  - モジュール設計
  - JavaScript
  - TypeScript
---

# 言語のモジュール機構 — ESM・TypeScript・barrel ファイル

## この章の目的

ここまでの章では、モジュールを **設計の単位** として考えてきました。しかし最終的には、その設計を **言語のモジュール機構** で実現する必要があります。

この章では、JavaScript / TypeScript を例に、

- **ESM と CommonJS** の違いと、今どちらを使うべきか
- TypeScript の **`moduleResolution`** の選び方
- **パスエイリアス**（`paths`）と **サブパスインポート**（`#imports`）
- **barrel ファイル**（`index.ts` での再エクスポート）の利点と、性能上の問題
- 言語機能で **公開範囲（カプセル化）** をどう表すか

を解説します。

---

## 1. モジュール機構が設計に関係する理由

| 設計の考え方 | 言語のモジュール機構での実現 |
|---|---|
| 公開 API を絞る（[[01_モジュール間インターフェースの設計]]） | `export` するものを選ぶ、`package.json` の `exports` |
| 依存を明示する（[[02_依存関係の管理]]） | `import` 文、`package.json` の `dependencies` |
| 循環を作らない（[[03_結合の3原則と循環依存の断ち切り方]]） | ESM の循環 import の挙動を理解する |
| モジュールの境界 | ファイル・ディレクトリ・パッケージ |

言語の仕組みを理解していないと、**設計上は分けたつもりでも、実際には境界が守られていない** ことがよく起きます。

---

## 2. ESM と CommonJS

### 2.1 2つの方式

| | **ESM**（ECMAScript Modules） | **CommonJS**（CJS） |
|---|---|---|
| 構文 | `import` / `export` | `require()` / `module.exports` |
| 標準 | **JavaScript の言語標準**（ES2015〜） | Node.js 独自の方式（2009〜） |
| 読み込み | **静的**（実行前に依存関係が決まる） | **動的**（実行時に `require` が呼ばれる） |
| tree shaking | **できる**（使われていない export を削除できる） | 難しい |
| トップレベル `await` | 使える | 使えない |
| ブラウザ | ネイティブで動く | 動かない（バンドラーが必要） |

### 2.2 今どちらを使うべきか

- **新しいプロジェクトは ESM** が基本（`package.json` に `"type": "module"`）
- Node.js も ESM を標準としてサポートし、主要なライブラリも ESM へ移行が進んでいる
- CommonJS は既存資産との互換性のために残っている、と考えてよい

### 2.3 ESM の「静的」であることの意味

ESM の `import` は **ファイルの先頭で、文字列リテラルで書く** 必要があります。そのため、

- **実行前に依存グラフ全体が分かる** → ツールで依存を解析・検査できる（[[06_依存ルールの自動検査]]）
- **使われていない export を削除できる**（tree shaking）→ バンドルサイズが小さくなる

設計の観点では、「**依存が静的に分かる**」ことが、モジュール境界をツールで守るための前提になっています。

### 2.4 循環 import の挙動

ESM では循環 import は **エラーにならず動いてしまう** ことがありますが、**評価順によって値が `undefined` になる**（TDZ エラーになる）ことがあります。

```typescript
// a.ts
import { b } from "./b";
export const a = "A" + b;

// b.ts
import { a } from "./a";
export const b = "B" + a;   // a.ts の評価が終わっていないので ReferenceError になる場合がある
```

「動くこともあるが、順序次第で壊れる」という厄介なバグになるので、**循環は設計の段階でなくし、ツールで検出する** のが鉄則です。

---

## 3. TypeScript のモジュール解決

### 3.1 `moduleResolution` の選び方

TypeScript は、`import` に書いたパスから **どのファイルを読むか** を `moduleResolution` の設定で決めます。

| 設定 | 使う場面 | 特徴 |
|---|---|---|
| **`bundler`** | **Vite・webpack・Next.js など、バンドラーを使うフロントエンド** | 拡張子なしの import を許す。`package.json` の `exports` を解釈する |
| **`nodenext`**（`node16`） | **Node.js で直接動かすバックエンド・ライブラリ** | ESM では **`.js` 拡張子が必須**（`.ts` ファイルでも `import "./foo.js"` と書く）。`exports` を解釈する |
| `node`（`node10`） | 古い設定 | `exports` を解釈しない。新規プロジェクトでは使わない |

```jsonc
// フロントエンド（Vite / Next.js）
{ "compilerOptions": { "module": "esnext", "moduleResolution": "bundler" } }

// Node.js バックエンド
{ "compilerOptions": { "module": "nodenext", "moduleResolution": "nodenext" } }
```

> 重要：`node`（node10）では `package.json` の `exports` が無視されるため、[[04_npmパッケージとモノレポでの適用]] で見た **`exports` によるカプセル化が効きません**。`bundler` か `nodenext` を使いましょう。

### 3.2 `verbatimModuleSyntax`

型だけを import するときは `import type` と書くことを強制する設定です。

```typescript
import type { User } from "./user";   // 型だけ。実行時には消える
import { createUser } from "./user";  // 値。実行時にも残る
```

- 「型だけの依存」と「実行時の依存」が明確に区別される
- 型だけの import は実行時の循環を生まないので、依存関係の分析にも役立つ

---

## 4. パスエイリアスとサブパスインポート

### 4.1 相対パス地獄

```typescript
import { Money } from "../../../../shared/kernel/money";
```

- 読みにくい
- ファイルを移動すると、import をすべて直す必要がある

### 4.2 TypeScript の `paths`

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/shared/*": ["src/shared/*"],
      "@/features/*": ["src/features/*"]
    }
  }
}
```

```typescript
import { Money } from "@/shared/kernel/money";
```

**注意点**：`paths` は **TypeScript の型チェックのための設定** で、**実行時のパス解決はしてくれません**。

- バンドラー（Vite・Next.js）を使うなら、バンドラー側にも同じエイリアスを設定する（多くは自動で読み込んでくれる）
- Node.js で直接動かすなら、`tsc-alias` などで変換するか、次のサブパスインポートを使う

### 4.3 Node.js のサブパスインポート（`#imports`）

`package.json` の `imports` フィールドを使うと、**Node.js 自体がエイリアスを解決** してくれます。

```json
// package.json
{
  "imports": {
    "#shared/*": "./src/shared/*.js",
    "#features/*": "./src/features/*.js"
  }
}
```

```typescript
import { Money } from "#shared/kernel/money";
```

- `#` で始まるのがルール
- Node.js・TypeScript（`nodenext`/`bundler`）・主要なバンドラーが対応している
- **パッケージの内部からしか使えない**（外部からは見えない）ので、内部用のエイリアスとして安全

### 4.4 エイリアスと境界

エイリアスは便利ですが、**どこからでも何でも import できる** ようにしてしまう危険もあります。

```typescript
// エイリアスがあると、他の機能の内部にも簡単に手が届いてしまう
import { calculateDiscountInternal } from "@/features/orders/pricing/internal";
```

エイリアスを使うなら、**機能の公開 API（`index.ts`）以外への import を禁止するルール** をあわせて設定します（→ [[06_依存ルールの自動検査]]）。

---

## 5. barrel ファイル

### 5.1 barrel ファイルとは

> **他のモジュールを再エクスポートするだけの `index.ts`。**

```typescript
// features/orders/index.ts（barrel ファイル）
export { placeOrder } from "./application/placeOrder";
export { cancelOrder } from "./application/cancelOrder";
export type { Order } from "./domain/order";
```

```typescript
// 使う側
import { placeOrder, cancelOrder } from "@/features/orders";
```

### 5.2 利点：モジュールの公開 API になる

- 使う側は **1つの入口** から import できる
- **公開するものを選べる**（`index.ts` に書かないものは「内部」とみなせる）
- モジュールの中の構成を変えても、`index.ts` を直せば使う側に影響しない

設計の観点では、**barrel ファイルは「モジュールの公開 API」を表す** という重要な役割を持ちます。

### 5.3 問題：性能への悪影響

一方で、barrel ファイルには **性能上の問題** があることが広く知られるようになりました。

| 問題 | 説明 |
|---|---|
| **余計なモジュールの読み込み** | `import { placeOrder } from "./orders"` と書いても、barrel が再エクスポートしている **すべてのモジュールが読み込まれ、評価される** ことがある |
| **tree shaking の失敗** | 再エクスポート先のモジュールに副作用（トップレベルのコード）があると、バンドラーは削除できず、使っていないコードがバンドルに残る |
| **テストが遅くなる** | Jest などは tree shaking をしないので、barrel 経由の import がテストごとに巨大な依存グラフを読み込む |
| **開発サーバー・型チェックが遅くなる** | 依存グラフが膨らみ、HMR や IDE の型チェックが遅くなる |
| **循環 import を生みやすい** | モジュール内部のファイルが自分の barrel を import すると、簡単に循環ができる |

**Atlassian は、Jira のフロントエンドで barrel ファイルをなくしたことで、ビルドが 75% 速くなった** と報告しています（TypeScript のハイライト速度も 30% 以上改善）。

### 5.4 どう付き合うか

| 方針 | 内容 |
|---|---|
| **モジュールの境界にだけ置く** | `features/orders/index.ts` のように、**機能の公開 API** としてだけ使う。モジュール内部の各ディレクトリには置かない |
| **深い barrel を作らない** | barrel が barrel を再エクスポートする、何階層もの構成は避ける |
| **`export *` を避ける** | 何が公開されているか分からなくなる。明示的に名前を書く |
| **モジュール内部では直接 import** | 同じモジュール内のファイル同士は、自分の barrel を経由せず直接 import する（循環防止） |
| **大きな共通ライブラリは分割** | `@acme/ui` 全体の barrel より、`@acme/ui/button` のようなサブパスエクスポートを使う（→ [[04_npmパッケージとモノレポでの適用]]） |
| **フレームワークの最適化を使う** | Next.js の `optimizePackageImports` など、barrel を自動で展開する機能を活用する |

> まとめると、**barrel は「公開 API の宣言」としては有用、「import を短くするための便利機能」としては有害になりやすい**、という使い分けです。

---

## 6. 言語機能で公開範囲を表す

TypeScript / JavaScript には、Java の `package-private` のような **「同じモジュールの中だけ公開」** という仕組みがありません。そのため、次のような方法を組み合わせます。

| 方法 | 強さ | 内容 |
|---|---|---|
| **`package.json` の `exports`** | 強い（言語・ツールが強制） | パッケージ単位で公開する入口を限定（→ [[04_npmパッケージとモノレポでの適用]]） |
| **barrel ファイル（`index.ts`）** | 弱い（慣習） | 公開するものを `index.ts` に書く。書かないものは内部扱い |
| **Lint ルール** | 中（CI で強制） | 「他の機能の `index.ts` 以外への import を禁止」などをルール化（→ [[06_依存ルールの自動検査]]） |
| **命名の慣習** | 弱い | `internal/` ディレクトリ、`_` で始まるファイル名 |
| **`@internal` JSDoc ＋ `stripInternal`** | 中 | 型定義ファイル（`.d.ts`）から内部 API を除外 |

他の言語では、より強い仕組みがあります。

| 言語 | 仕組み |
|---|---|
| Java | `package-private`、Java 9 以降の **モジュールシステム（JPMS）** の `exports` |
| Kotlin | `internal`（同じモジュール内だけ公開） |
| C# | `internal`（同じアセンブリ内だけ公開） |
| Go | **小文字で始まる名前は非公開**、`internal/` ディレクトリは親パッケージからしか import できない |
| Rust | `pub` / `pub(crate)` / `pub(super)` で細かく制御 |

---

## 7. ありがちな誤解

### 7.1 「`paths` を設定すれば実行時も動く」

**誤りです。** `paths` は型チェック用です。実行時の解決は、バンドラーの設定・`tsc-alias`・Node.js のサブパスインポートで別途行います。

### 7.2 「barrel ファイルは常に良い／常に悪い」

**どちらも誤りです。** モジュールの境界での公開 API としては有用、深い階層や `export *` での多用は性能と循環の問題を生みます。

### 7.3 「`import` がエラーにならなければ、境界は守られている」

**誤りです。** TypeScript / JavaScript は、ほとんどのファイルを自由に import できます。境界は **`exports`・Lint ルール・ツール** で意図的に守る必要があります。

---

## まとめ

- 新しいプロジェクトは **ESM**。静的な import により、**依存グラフをツールで解析・検査** できる
- TypeScript の `moduleResolution` は、**フロントエンドは `bundler`、Node.js は `nodenext`**。古い `node` では `exports` が効かない
- **`paths` は型チェック用**。実行時は別の解決が必要。Node.js の **サブパスインポート（`#imports`）** はランタイムも解決してくれる
- **barrel ファイル** は公開 API の宣言として有用だが、**性能（Atlassian でビルド 75% 高速化の例）と循環** の問題がある。**モジュールの境界にだけ** 置く
- TypeScript には言語レベルの「モジュール内公開」がないので、**`exports`・Lint・慣習** を組み合わせて境界を守る

### 次に進む章

- [[06_依存ルールの自動検査]] — 境界をツールで守る

---

## 参考資料

- [TypeScript: Modules - Choosing Compiler Options（公式）](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html)
- [TypeScript: Modules - Reference（公式）](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
- [TypeScript & ES Modules - Resolution & Config Guide（esmodules.com）](https://esmodules.com/typescript/)
- [Node.js — Packages: subpath imports / exports（公式）](https://nodejs.org/api/packages.html)
- [Barrel Files: Why index.ts Re-Exports Hurt Tree Shaking, Next.js Dev Memory, and tsc（Medium, 2026）](https://medium.com/@wul55267/barrel-files-why-index-ts-re-exports-hurt-tree-shaking-next-js-dev-memory-and-tsc-2026-005a27a14689)
- [Barrel Exports: The Hidden Cost of Clean-Looking Code](https://atharvacm.dev/blog/barrel-exports-hidden-cost)
- [Why Barrel Files Brought Me Too Much Trouble in Development（Medium）](https://medium.com/codetodeploy/why-barrel-files-brought-me-too-much-trouble-in-development-a-developers-journey-away-from-f19522d4bd21)
