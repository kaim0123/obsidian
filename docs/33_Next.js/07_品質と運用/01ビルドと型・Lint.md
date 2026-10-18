# ビルドと型・Lint

「動いてはいるけど、型が緩い」「Lint が無視されている」プロジェクトは、必ず後で痛い目を見ます。
最初に**ビルド・型・Lint**の 3 セットを整えると、安心感が段違いです。

---

## 1. 主要コマンド

| コマンド | 何をする |
|---------|----------|
| `npm run dev` | 開発サーバー（Hot Reload） |
| `npm run build` | 本番ビルド（エラー時停止） |
| `npm run start` | ビルド済み成果物で本番起動 |
| `npm run lint` | ESLint チェック |
| `npx tsc --noEmit` | TypeScript の型チェックのみ（コード生成なし） |

---

## 2. `next build` の中身

`npm run build` を実行すると、Next.js は次のことを順番にやります。

1. **TypeScript の型チェック**（`tsconfig.json` の `strict` 設定に従う）
2. **ESLint 実行**（`next.config` の `eslint` 設定に従う）
3. **静的ページ生成**（`generateStaticParams` のあるルートを実行）
4. **JS / CSS バンドル**
5. **画像最適化用のビルド成果物**

成果物は `.next/` に出力されます。

### 型エラー / Lint エラーで止まる

デフォルトでは **エラーがあると build は失敗**。ここを甘くせずに、**「ローカルで build が通る」状態を維持**するのが理想です。

```ts
// next.config.ts
export default {
  // ⚠ これらは「一時しのぎ」で、長期的には付けないこと
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
```

---

## 3. TypeScript の設定（`tsconfig.json`）

`create-next-app` で生成される設定はこんな感じ：

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,           // ★ 厳密チェック ON
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 個別オプション

| オプション | 説明 |
|-----------|------|
| `strict` | これだけで `strictNullChecks` 等が一括有効化（推奨：ON） |
| `noUncheckedIndexedAccess` | 配列の要素も `undefined` 可能とする（より安全） |
| `noImplicitAny` | 型省略を許さない（`strict` に含まれる） |
| `paths` | 別名 import（`@/components/...`） |

### 推奨追加オプション

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": false,        // 開発中はじゃまになるので false でも可
    "noUnusedParameters": false,
    "exactOptionalPropertyTypes": true
  }
}
```

---

## 4. 型チェックを高速にする

Next.js 自体の型チェックは内蔵ですが、本格的にやるなら `tsc` を別途回します。

```bash
npx tsc --noEmit
```

CI（GitHub Actions など）でも回すと安全。

```yaml
# .github/workflows/ci.yml の例
- run: npm ci
- run: npx tsc --noEmit
- run: npm run lint
- run: npm run build
```

---

## 5. ESLint：コードの品質チェック

`create-next-app` で `next/core-web-vitals` というルールセットが入ります。

### `eslint.config.mjs`（Flat Config、Next.js 15+）

```js
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
```

### よく追加するルール

```js
export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react/jsx-key": "error",
    },
  },
];
```

### ESLint を実行

```bash
npm run lint            # チェックのみ
npm run lint -- --fix   # 自動修正できる箇所を直す
```

---

## 6. Prettier：フォーマッタ

ESLint は「**ルール違反**」を見るのが主、Prettier は「**整形**」が主です。

```bash
npm install -D prettier
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

VSCode の Prettier 拡張を入れて、**保存時に自動整形**にすると最高。

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## 7. ESLint と Prettier の競合解消

両方使うとルール衝突が起きるので、`eslint-config-prettier` を入れる：

```bash
npm install -D eslint-config-prettier
```

```js
// eslint.config.mjs
import prettier from "eslint-config-prettier";

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  prettier, // ★ 最後に置く
];
```

---

## 8. コミット時の自動チェック：lint-staged + Husky

コミット直前に**変更ファイルだけ**自動修正・チェック。

```bash
npm install -D husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["prettier --write", "eslint --fix"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

---

## 9. ビルド出力の見方

`npm run build` の出力例：

```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB   90 kB
├ ○ /about                               1.1 kB   86 kB
├ ƒ /dashboard                           3.4 kB   88 kB
└ ƒ /api/auth/[...nextauth]              0 B      0 B

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

| マーク | 意味 |
|--------|------|
| `○` Static | ビルド時に HTML 化 |
| `●` SSG | `generateStaticParams` で生成 |
| `ƒ` Dynamic | 毎リクエストでサーバー実行 |
| `λ` Server | サーバー側で動く（同義） |

**First Load JS** が一番重要。ここが大きいと初回表示が重い。
**目安：100KB 以下、120KB 超えなら見直す**

---

## 10. Bundle Analyzer：何が重いか可視化

```bash
npm install -D @next/bundle-analyzer
```

```ts
// next.config.ts
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer({
  // ...
});
```

```bash
ANALYZE=true npm run build
```

→ ブラウザで「どのライブラリがバンドルの何 % を占めるか」グラフが見られる。

---

## 11. CI/CD の最低構成

GitHub Actions の例：

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "npm" }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm run build
```

これだけで「型エラー」「Lint 違反」「Build 失敗」を PR 段階で検出できます。

---

## 12. つまずきポイント

### Q. `npm run dev` は通るが `npm run build` で落ちる

→ 開発時は緩いチェック、ビルド時は厳しいチェックなので、build は型エラーで止まりがち。**ローカルで build を回す習慣**を。

### Q. 型エラーで build が止まるのを一時的に回避したい

→ `next.config.ts` で `typescript.ignoreBuildErrors: true`。**ただし長期的には絶対に直す**。

### Q. ESLint が遅すぎる

→ `next lint` の対象を `--dir` で絞る、または ESLint バージョンを上げる。

### Q. Prettier と ESLint がケンカする

→ `eslint-config-prettier` を最後に追加。

### Q. ビルドサイズが想定より大きい

→ Bundle Analyzer で確認、`dynamic import` で遅延ロード、ライブラリの選定見直し。

---

## まとめ

- **`tsc --noEmit` + `lint` + `build`** を CI で必ず回す
- **`strict: true`** は外さない、可能なら `noUncheckedIndexedAccess` も
- **Prettier** は保存時自動整形、**lint-staged** でコミット前チェック
- **Bundle Analyzer** で見える化、**First Load JS は 100KB 以内**を目安
- 型エラーを `ignoreBuildErrors` で回避するのは**最後の手段**

次は速さを測る → [[02パフォーマンス計測]]
