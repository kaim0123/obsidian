# tsconfig 推奨設定

新規プロジェクト向けの **無難で安全な `tsconfig.json` 設定例**を解説します。
あくまで叩き台。プロジェクトの規模やランタイム（Node / ブラウザ / SSR）に応じて調整してください。

## ベース設定（推奨）

```jsonc
{
  "compilerOptions": {
    /* 出力 */
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],

    /* 厳格化 */
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": false,

    /* モジュール挙動 */
    "esModuleInterop": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "resolveJsonModule": true,

    /* ビルド設定 */
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true,

    /* 安全/品質 */
    "forceConsistentCasingInFileNames": true,
    "noEmitOnError": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 主要オプションの解説

### target / module / lib

- **target**：出力 JS の構文バージョン。Node 18+ なら **ES2022** で十分
- **module**：モジュール形式。バンドラ前提なら **ESNext**
- **moduleResolution**：`"Bundler"`（Vite/webpack）か `"Node16"`（純 Node）
- **lib**：使える組み込み API。フロントは `DOM` を含めること

### strict 系（→ `04-よくある罠/strict系オプション.md`）

- **`strict: true`** はほぼ必須（暗黙 any、null チェックなどを一括 ON）
- **`noUncheckedIndexedAccess`**：配列・辞書アクセスを `T | undefined` に
- **`noImplicitOverride`**：派生クラスの override を強制
- **`noFallthroughCasesInSwitch`**：switch の break 忘れ防止
- **`exactOptionalPropertyTypes`**：厳格すぎて既存コードに影響大なため、新規で慎重に

### isolatedModules / verbatimModuleSyntax

- バンドラ前提ならどちらも有効に
- **`verbatimModuleSyntax`**：`import type` と `import` の違いをそのまま出力に反映

### esModuleInterop

CommonJS と ES Modules の相互運用を整える。**新規プロジェクトでは ON 一択**。

### skipLibCheck

`node_modules` 内の `.d.ts` の型チェックを省略。**ON にしておくとビルドが速い**。

### declaration / declarationMap

ライブラリとして公開するなら必須。アプリ単体なら不要。

## ランタイム別の推奨例

### Node.js（純粋なバックエンド）

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true
  }
}
```

### React + Vite（フロントエンド）

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,            // Vite がビルドするので tsc はチェック専用
    "verbatimModuleSyntax": true,
    "isolatedModules": true
  }
}
```

### Next.js

`create-next-app` が生成する設定をそのまま使うのが無難。
Strict 系を追加するくらいの調整で十分です。

## モノレポでの工夫

複数パッケージを抱えるなら **`extends`** で共通設定を切り出します。

```jsonc
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "Bundler"
  }
}

// packages/web/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

**Project References (`references`)** を使うと、依存関係を意識したインクリメンタルビルドができます。

## paths（path alias）の落とし穴

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

便利ですが、`tsc` だけ知っていてもバンドラは別途設定が要ります。
Vite/webpack/Jest など **ツールごとに対応**する必要があるので、深いネストの import 削減目的に絞って導入するのが無難。

## やりすぎ注意

- **過剰な strict 設定**で、既存プロジェクトが死ぬ
- **target を低くしすぎる**と、出力が肥大・遅くなる
- **lib を広げすぎる**と、ランタイムにない API を呼べてしまう

## まとめ

- 基本：`strict: true` + `noUncheckedIndexedAccess` をデフォルトに
- バンドラ前提なら `module: "ESNext"` + `moduleResolution: "Bundler"`
- 純 Node なら `module: "NodeNext"`
- `skipLibCheck` で速度確保、`isolatedModules` でビルド互換性確保
- モノレポは `extends` + `references` で整理
- まず最小構成、必要に応じてオプションを増やす
