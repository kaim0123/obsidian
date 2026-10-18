# `isolatedModules` とビルド前提

> Vite や esbuild、SWC のような**高速ビルドツール**は、**1ファイルずつ独立してコンパイル**します。これらが安全に動くように「**1ファイル単独でも型情報なしでコンパイル可能なコード**」を保証するのが `isolatedModules: true` です。モダンなTSビルドの**前提条件**として、必ず有効にすべきオプションです。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[04-exactOptionalPropertyTypes]]

---

## 1. `isolatedModules` とは

```json
{
  "compilerOptions": {
    "isolatedModules": true
  }
}
```

「**1ファイル単独で型情報なしにコンパイル可能か**」を検証するオプション。

### なぜ必要か

`tsc`（TypeScript標準のコンパイラ）は**プロジェクト全体を読んで**型情報を解析します。一方、Vite/esbuild/SWC/Babel は**1ファイルずつ独立に**処理します。

→ 「**ファイル単独で意味を持つコード**」でないと、これらの高速ビルドツールで**コンパイルエラー**になることがある。

`isolatedModules: true` は、`tsc` の段階で「ファイル単独でも意味が通るコード」を強制するためのオプション。

---

## 2. `isolatedModules` で検出されるエラー

### (1) 型のみの再エクスポートに `type` がない

```typescript
// types.ts
export type User = { ... };

// re-export
export { User } from "./types"; // ❌ User は型のみ
```

`tsc` 単体では通るが、esbuild などは「`User` が値か型か」を判断できない。

→ **`export type` を明示**:

```typescript
export type { User } from "./types"; // ✅
```

### (2) `import` でも同様

```typescript
import { User } from "./types"; // ❌ User が型のみ
import type { User } from "./types"; // ✅
```

→ 詳しくは [[02-importとexportの基本]]。

### (3) `const enum` が使えない

```typescript
const enum Status {  // ❌
  OK = "ok",
  NG = "ng",
}
```

`const enum` は**コンパイル時に値が消える**特殊な enum。1ファイル単位の処理だと値が解決できない。

→ 通常の `enum` か、`as const` オブジェクトを使う。

### (4) 名前空間 `namespace` の制限

```typescript
namespace MyNs {
  export const x = 1;
}
```

ファイルをまたぐ `namespace` 宣言マージは制限される。

→ ESM の `import` / `export` を使う。

### (5) 全ファイルが「モジュール」である必要

`import` / `export` を1つも持たない `.ts` ファイルは**スクリプト**扱いになり、エラー:

```typescript
// foo.ts （import/export なし）
const x = 1;
// ❌ "Cannot compile namespaces when the '--isolatedModules' flag is provided."
```

→ 最低でも `export {};` を書いてモジュール化:

```typescript
const x = 1;
export {};
```

---

## 3. なぜ Vite/esbuild は速いのか

`tsc` と比べて Vite/esbuild は**桁違いに速い**:

| ツール | 100kファイルの型チェック |
|---|---|
| `tsc` | 数十秒〜数分 |
| esbuild / Vite | 1秒以下（型チェックなし） |

理由:

- **ファイル単独**で並列処理できる
- **Go や Rust** で書かれている（JSのtscより速い）
- **型チェックをスキップ**する（型は剥がしてJSにするだけ）

→ 高速さの代わりに「**ファイル単独でコンパイル可能**」という制約。これを保証するのが `isolatedModules`。

---

## 4. ビルドツールごとの推奨設定

### Vite

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "isolatedModules": true,
    "noEmit": true,
    "module": "ESNext",
    "moduleResolution": "Bundler"
  }
}
```

- `isolatedModules: true` で esbuild が安全に動く
- `noEmit: true` で `tsc` は型チェックのみ、出力は Vite に任せる

### Next.js

```json
{
  "compilerOptions": {
    "isolatedModules": true,
    "noEmit": true
    // ...
  }
}
```

→ Next.js が自動で生成。

### esbuild 直接利用

```json
{
  "compilerOptions": {
    "isolatedModules": true
  }
}
```

→ 必須。

### `tsc` のみ（バンドラなし）

```json
{
  "compilerOptions": {
    "isolatedModules": true   // 推奨だが必須ではない
  }
}
```

→ `tsc` 単体でも将来の互換性のため有効化しておくのが安全。

---

## 5. 「型チェック」と「ビルド」の分離

モダンなTSプロジェクトでは:

| 役割 | ツール |
|---|---|
| 型チェック | `tsc --noEmit` |
| ビルド（JS出力） | Vite / esbuild / SWC |

それぞれが**役割分担**する設計:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "type-check": "tsc --noEmit"
  }
}
```

→ ビルド前に必ず型チェック。CIでも `tsc --noEmit` を回す。

---

## 6. `isolatedModules` 関連のエラー対処

### (1) `Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'`

```typescript
// ❌
export { User } from "./types";

// ✅
export type { User } from "./types";

// または値と型を混ぜる場合（TS 4.5+）
export { someFn, type User } from "./mod";
```

### (2) `Cannot compile namespaces when the '--isolatedModules' flag is provided`

```typescript
// ❌
namespace Foo {
  export const x = 1;
}

// ✅
export const x = 1; // モジュールとして
```

### (3) `'X' is a type and must be imported using a type-only import`

```typescript
// ❌
import { User } from "./types";  // User は型のみ

// ✅
import type { User } from "./types";
```

### (4) `'const' enums cannot be used in TypeScript files where 'isolatedModules' is enabled`

```typescript
// ❌
const enum Status { OK = "ok" }

// ✅
const Status = { OK: "ok" } as const;
type Status = typeof Status[keyof typeof Status];
```

→ `as const` オブジェクトを使う。

---

## 7. 実例: Vite + React の典型構成

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,

    "isolatedModules": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,

    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

→ **新規プロジェクトの推奨設定**。これに沿えば大体問題なし。

---

## 8. `noEmit` との関係

### `noEmit: true`

`tsc` が**JSファイルを出力しない**設定。

```json
{
  "noEmit": true
}
```

→ 「型チェックだけしたい」とき（バンドラが出力を担当する場合）に使う。

### モダンなプロジェクトでは

`tsc` = 型チェック専用、Vite/esbuild = JS出力 という分業。`noEmit: true` + `isolatedModules: true` がセットになる。

---

## 9. `verbatimModuleSyntax`（TS 5.0+）

`isolatedModules` の進化版とも言える新オプション。

```json
{
  "verbatimModuleSyntax": true
}
```

これを有効にすると、`import` / `export` が**そのままJSに残る**。

```typescript
import type { User } from "./types"; // 型のみ → JS には出ない
import { foo } from "./mod";          // 値 → JS に残る
```

`isolatedModules` をさらに厳密化したもの。**新規プロジェクトでは検討の価値あり**。

ただし、`isolatedModules` と一緒に有効にすると一部の挙動が変わるので、**既存プロジェクトでの導入は要検証**。

---

## 10. 「型チェックは別ツール」の選択肢

`tsc` 以外で型チェックする選択肢も増えている:

### `tsgo`（仮）/ TypeScript-native コンパイラ（Microsoft開発中）

TypeScript本家が Go で書き直し中。**桁違いに速い**型チェッカーが将来登場予定。

### `@biomejs/biome`

Rust製の lint/format ツール。**型チェックは部分対応**。

### `oxc`

新世代の高速TS/JSツールチェーン。

→ 将来は型チェックも esbuild レベルの速度になる可能性。

---

## 11. ベストプラクティス

### (1) **`isolatedModules: true` を必ず有効化**

新規プロジェクトでは必須。

### (2) **`tsc --noEmit` で型チェック、ビルドは別ツール**

役割分担を明確に。

### (3) **`import type` / `export type` を使う**

ESLint の `consistent-type-imports` ルールで自動化:

```json
{
  "rules": {
    "@typescript-eslint/consistent-type-imports": "error"
  }
}
```

### (4) **`const enum` を避ける**

`as const` オブジェクト or リテラルユニオン型を使う。

### (5) **CIで `tsc --noEmit` を必ず回す**

ビルド前に型エラーを検出。

```yaml
# GitHub Actions 例
- run: npm run type-check
- run: npm run build
```

---

## 12. アンチパターン

### (1) `isolatedModules: false` のまま放置

```json
{ "isolatedModules": false }
```

→ Vite/esbuild に切り替えたとき大量のエラー。最初から `true` に。

### (2) `import` で型と値を混在

```typescript
import { User, UserSchema } from "./types"; // User=型, UserSchema=値
```

→ 型と値を分ける:

```typescript
import { type User, UserSchema } from "./types";
// または
import type { User } from "./types";
import { UserSchema } from "./types";
```

### (3) `// @ts-ignore` でエラーを潰す

```typescript
// @ts-ignore
import { User } from "./types";
```

→ 修正する。`type` を付ける。

### (4) `tsc` でビルドし続ける（モダンプロジェクトで）

`tsc` ビルドは遅い。**Vite/esbuild に移行**。

---

## 13. 早見表

| オプション | 意味 | モダン環境での推奨 |
|---|---|---|
| `isolatedModules` | 1ファイル単独コンパイル可能か検証 | ✅ true |
| `noEmit` | tsc が JS を出力しない | ✅ true（バンドラ使用時） |
| `verbatimModuleSyntax` | import/export をそのままJSに残す | △ 検討 |
| `esModuleInterop` | CJS との相互運用 | ✅ true |

---

## 14. まとめ

- **`isolatedModules: true`**: 1ファイル単独でコンパイル可能なコードを強制
- **Vite/esbuild/SWC** などの**高速ビルダ**の前提
- 検出されるエラー: **型のみ re-export / `const enum` / `namespace` / module でないファイル**
- 対処: **`import type` / `export type`**、`as const` オブジェクト、`export {}`
- モダンプロジェクトでは **`tsc --noEmit` で型チェック、ビルドは別ツール**
- TS 5.0+ の **`verbatimModuleSyntax`** はさらに厳密版

> `isolatedModules` は「**現代のTSビルドへの入場券**」。これを有効にすれば Vite/esbuild が安全に動き、ビルド時間が**桁で短縮**されます。新規プロジェクトでは絶対オン、既存プロジェクトも段階的に。

---

## 関連
- [[01-target_module_lib]]
- [[02-strictと主要オプション]]
- [[03-noUncheckedIndexedAccess]]
- [[04-exactOptionalPropertyTypes]]
- [[02-importとexportの基本]]
