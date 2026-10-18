# 宣言ファイル（`.d.ts`）の書き方

## `.d.ts` ファイルとは？

**実装を含まず、型の宣言だけを書くファイル**です。
TypeScript はこれを読んで「世の中にこんな型がある」と理解します。

- 拡張子：**`.d.ts`**
- 中身：型・interface・declare 文 などのみ
- ランタイムには **何も出力しない**

主な用途：
1. **JS ライブラリに型を後付け**（`@types/xxx`）
2. **グローバル変数や環境設定の型** を定義
3. **module augmentation**（既存の型を拡張）

## 最小例

```typescript
// types/config.d.ts
declare const APP_VERSION: string;
declare function logInfo(message: string): void;
```

`declare` は「**実装は別の場所にある**」と宣言する印。これで型だけが見えるようになります。

## 環境変数の型を付ける

Node.js の `process.env` は何も書かないと `Record<string, string | undefined>` 同然で扱いにくいです。
`.d.ts` で **キーごとに型を付与** すると、補完も効きます。

```typescript
// types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    PORT?: string;
    NODE_ENV: "development" | "production" | "test";
  }
}
```

これで `process.env.DATABASE_URL` が `string` として扱えます。

## グローバル変数を宣言する

ブラウザ環境で `window.MY_GLOBAL` のような変数を扱うとき。

```typescript
// types/global.d.ts
declare global {
  interface Window {
    MY_GLOBAL: { version: string };
  }
}
export {}; // モジュール扱いにするため
```

`export {}` を入れると、このファイルが **モジュール** として認識され、`declare global` が正しく機能します。

## 既存ライブラリの型を拡張（module augmentation）

ライブラリの型を **追加・上書き** したいときに使います。

```typescript
// types/express.d.ts
import "express"; // 元モジュールの型を読み込ませる

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: number; name: string };
  }
}
```

Express の `req.user` のように、ミドルウェアで生やすプロパティを **型に追加** できます。

## 型のないライブラリに型を付ける

`@types/foo` が無いライブラリを使うとき、自前で **アンビエント宣言** します。

```typescript
// types/legacy-lib.d.ts
declare module "legacy-lib" {
  export function doSomething(input: string): number;
  export const VERSION: string;
}
```

これで `import { doSomething } from "legacy-lib"` がエラーにならなくなります。
中身が複雑なら、まず **最小限の関数だけ** 書いて、必要に応じて充実させましょう。

## アセットの import に型を付ける

CSS や画像を `import` する設定にしているとき。

```typescript
// types/assets.d.ts
declare module "*.css";
declare module "*.png" {
  const url: string;
  export default url;
}
declare module "*.svg?react" {
  import { FC, SVGProps } from "react";
  const Comp: FC<SVGProps<SVGSVGElement>>;
  export default Comp;
}
```

ビルドツール（webpack / Vite）と組み合わせて、TypeScript エラーを防ぎます。

## tsconfig.json で読み込ませる

`.d.ts` を作っただけでは TypeScript が読みに行きません。
`tsconfig.json` の `include` に含めるか、`types` ディレクトリを使う設定にします。

```jsonc
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./types"]
  },
  "include": ["src/**/*", "types/**/*.d.ts"]
}
```

## 公開ライブラリのための `.d.ts`

自作ライブラリを npm で公開するなら、`tsc --declaration` で **`.d.ts` を自動生成** できます。

```jsonc
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist"
  }
}
```

`package.json` に `"types": "dist/index.d.ts"` を書けば、利用者が型補完を受けられます。

## ベストプラクティス

- **型だけのファイルは `.d.ts` に分ける**：通常の `.ts` と混ぜないほうが意図が明確
- **`declare global` は `export {}` を忘れない**：モジュール化されないと挙動が変
- **過剰な module augmentation を避ける**：チームで共通理解できる範囲に
- **公開ライブラリは `tsc --declaration` で自動生成**：手書きは保守不能になる

## まとめ

- `.d.ts` は **型だけを宣言する** ファイル
- 環境変数 / グローバル変数 / 型のないライブラリ / アセット import などに使う
- `declare global` で `export {}` を忘れずに
- 既存ライブラリの拡張は **module augmentation** で
- 自作ライブラリは `tsc --declaration` で自動生成
