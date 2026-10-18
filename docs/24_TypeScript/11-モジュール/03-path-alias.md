# path alias（`baseUrl` / `paths`）

> `import { User } from "../../../types/user";` のような **相対パスの長い import** が増えると、コードが読みにくくリファクタにも弱くなります。**path alias** を設定すると `import { User } from "@/types/user";` のように書け、**ファイルを移動しても import が壊れない**設計が手に入ります。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[02-importとexportの基本]]
- 次: [[04-バレルと循環参照]]

---

## 1. 相対パスの問題

### 長くなる

```typescript
import { User } from "../../../types/user";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/Button";
```

→ ディレクトリの深さに依存して `../` が増殖。

### ファイル移動で壊れる

```typescript
// 元: src/features/user/profile.ts
import { api } from "../../lib/api";

// src/pages/user/profile.ts に移動
// → import を全部書き直す必要
```

### **path alias で解決**

```typescript
import { User } from "@/types/user";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
```

→ ファイルを移動しても **`@/...` は変わらない**。短く読みやすい。

---

## 2. `tsconfig.json` での設定

### 基本構文

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- **`baseUrl`**: パス解決の基準ディレクトリ
- **`paths`**: 別名 → 実パスへのマッピング

### 例: `@/` を `src/` に

```typescript
import { User } from "@/types/user";
// → 実際は: src/types/user
```

### `*` の意味

```json
"paths": {
  "@/*": ["src/*"]
}
```

`*` は「**任意の文字列**」を表すワイルドカード。`@/foo` → `src/foo` のように対応する。

---

## 3. 複数のエイリアスを設定

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

```typescript
import { Button } from "@components/Button";
import { add } from "@utils/math";
```

→ **役割ごとにエイリアスを分ける**スタイル。チームによっては「`@/`1個だけ」が好まれる。

---

## 4. 命名規則の流派

### (1) `@/` 一本（最近の主流、Vite/Next.jsデフォルト）

```json
"paths": { "@/*": ["src/*"] }
```

```typescript
import { User } from "@/types/user";
```

→ **シンプル・統一感**。多くのテンプレートが採用。

### (2) `~/` （ホームディレクトリ風）

```json
"paths": { "~/*": ["src/*"] }
```

→ **Nuxt** などで使われる。

### (3) `#` プレフィックス（Node 内部慣習）

```json
"paths": { "#/*": ["src/*"] }
```

→ Node のビルトインに近い感覚。Pino などのライブラリが採用。

### (4) ドメインごと（大規模向け）

```json
"paths": {
  "@app/*": ["src/app/*"],
  "@shared/*": ["src/shared/*"],
  "@features/*": ["src/features/*"]
}
```

→ アーキテクチャを反映。**モノレポ**や**大規模アプリ**に向く。

---

## 5. ツール側の設定（重要）

`tsconfig.json` だけでは**型チェック**が通るだけで、**実行・バンドル時に解決されません**。各ツールで個別に設定が必要。

### Vite

```typescript
// vite.config.ts
import path from "path";

export default {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
```

### Next.js

`tsconfig.json` の paths を**自動認識**。設定不要。

### Webpack

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
};
```

### Vitest / Jest

#### Vitest

`vite.config.ts` のエイリアスを継承。

#### Jest

```javascript
// jest.config.js
module.exports = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

### Node.js（直接実行）

`node` コマンドだけでは path alias を理解しない。`tsx` `tsconfig-paths` などで対応:

```bash
npx tsx -r tsconfig-paths/register src/index.ts
```

→ **実行ツールに合わせた設定が必要**。これが path alias の最大の手間。

---

## 6. `vite-tsconfig-paths` プラグイン（Vite用）

Vite なら**プラグインで自動同期**:

```bash
npm install -D vite-tsconfig-paths
```

```typescript
// vite.config.ts
import tsconfigPaths from "vite-tsconfig-paths";

export default {
  plugins: [tsconfigPaths()],
};
```

→ `tsconfig.json` の `paths` を**自動的にVite側にも反映**。重複設定が不要に。

---

## 7. 実例: `src/` ベースの典型構成

### ディレクトリ構造

```
my-app/
  tsconfig.json
  vite.config.ts
  src/
    components/
      Button.tsx
      ui/
        Card.tsx
    features/
      user/
        UserList.tsx
    types/
      user.ts
    utils/
      math.ts
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "moduleResolution": "Bundler",
    "module": "ESNext",
    "strict": true
  }
}
```

### `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
});
```

### 使い方

```typescript
import { Button } from "@/components/Button";
import { Card } from "@/components/ui/Card";
import { UserList } from "@/features/user/UserList";
import { User } from "@/types/user";
import { add } from "@/utils/math";
```

→ どこからでも同じ書き方で import できる。

---

## 8. パターン別の設定例

### モノレポ

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@my/ui": ["packages/ui/src"],
      "@my/utils": ["packages/utils/src"],
      "@my/types": ["packages/types/src"]
    }
  }
}
```

→ **パッケージ間参照**を path alias で。pnpm workspace と組み合わせるのが現代的。

### app/lib 分離

```json
"paths": {
  "@app/*": ["src/app/*"],
  "@lib/*": ["src/lib/*"]
}
```

→ アプリケーション層とライブラリ層を分離。

---

## 9. 落とし穴

### (1) 型チェックは通るが実行で死ぬ

```bash
npm run dev
# Cannot find module '@/utils/math'
```

→ **ツール側の設定**を忘れている。Vite/Webpack/Jest 等それぞれで設定。

### (2) `baseUrl` を忘れる

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["src/*"] }
    // baseUrl がない
  }
}
```

→ 古いTSでは `baseUrl` が必須。新しめのTSでは `paths` 単独でも動くが、**`baseUrl: "."` を明示**するのが安全。

### (3) `*` を忘れる

```json
"paths": {
  "@/*": ["src/*"]   // ✅ 正しい
  "@": ["src"]        // ❌ ワイルドカードでない、@ そのものだけ解決
}
```

### (4) 相対パスと混在して読みにくい

```typescript
import { User } from "@/types/user";
import { helper } from "./helper"; // 同じディレクトリ
```

→ **同じディレクトリは相対パス、それ以外は alias** が一般的なルール。

### (5) IDE が認識しない

VSCode 等は `tsconfig.json` を自動認識するが、**サブディレクトリの tsconfig** や**プロジェクト設定**が複雑だと失敗することも。

→ VSCode を再起動・「Reload Window」で解消することが多い。

---

## 10. ベストプラクティス

### (1) **`@/` 一本に統一**

役割別の alias は管理が大変。**`@/` で統一**して `src/` 全体を覆うのがシンプル。

### (2) **同じディレクトリは相対パス**

```typescript
// ✅
import { helper } from "./helper";

// ❌（同じディレクトリで alias は冗長）
import { helper } from "@/features/user/helper";
```

### (3) **`vite-tsconfig-paths` などを使う**

`tsconfig.json` と Vite/Jestの設定を**二重管理しない**。

### (4) **path alias は `src/` 専用**

`node_modules` 内のライブラリ名と衝突しないよう、`@/` などプレフィックス付きで。

```json
"paths": {
  "@/*": ["src/*"],     // ✅
  "lodash": ["..."]      // ❌ 既存ライブラリ名と衝突
}
```

### (5) **README に記載**

新メンバーが混乱しないよう、`README.md` に「path alias は `@/` で `src/` を指す」と明記。

---

## 11. ESLint で並び順を整える

`eslint-plugin-import` の `import/order` で**alias と相対パスを区別**して並べられる:

```json
{
  "rules": {
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling"],
        "pathGroups": [
          { "pattern": "@/**", "group": "internal" }
        ]
      }
    ]
  }
}
```

→ 自動で:

```typescript
import fs from "fs";              // builtin
import { useState } from "react"; // external
import { User } from "@/types";    // internal (alias)
import { helper } from "../utils"; // parent
import { local } from "./local";   // sibling
```

---

## 12. まとめ

- **path alias** = 長い相対パスを短い別名に変換（`../../../utils` → `@/utils`）
- 設定は **`tsconfig.json` の `baseUrl` + `paths`**
- **ツール側（Vite/Jest等）にも別途設定が必要** ── これが最大の手間
- **`vite-tsconfig-paths`** などのプラグインで自動同期
- 命名は **`@/` 一本** が現代の主流
- 同じディレクトリは**相対パス**、それ以外は alias がベストプラクティス

> path alias は「**設定すれば一生楽になる**」投資。新規プロジェクトを始めるときに**最初に組み込む**のがおすすめです。

---

## 関連
- [[01-ESMとCJSの違い]]
- [[02-importとexportの基本]]
- [[04-バレルと循環参照]]
- [[12-tsconfig]]
