# 01 — Vitest とはと環境構築

この章では、Vitest が何であるか、なぜ単体テストに使われるのかを説明したうえで、あなたの PC に Vitest をインストールして「テストが走る状態」までを解説します。

---

## Vitest とは

**Vitest** は、Vite の開発チームが中心となって作っている **JavaScript / TypeScript 向けのテストフレームワーク**です。主に **単体テスト（ユニットテスト）** と **コンポーネントテスト** に使われ、API は Jest とほぼ互換に設計されています。

> 公式サイト：<https://vitest.dev/>

### テストフレームワークの役割

- **テストランナー**：`*.test.ts` のようなファイルを集めて実行し、成功・失敗をまとめてレポートする。
- **アサーションライブラリ**：`expect(x).toBe(1)` のように「期待値との比較」を表現する機能を提供する。
- **モックライブラリ**：関数やモジュールを差し替えて、外部依存（API、時間、DB など）を切り離す。

Jest もほぼ同じ機能を提供しますが、Vitest は **Vite のビルドパイプラインをそのままテストに流用する**ことで、以下の点が改善されています。

### Vitest の主な特徴

| 特徴 | 説明 |
|------|------|
| **Vite ネイティブ** | Vite の設定（`vite.config.ts`）をそのまま使えるため、エイリアス・プラグイン・TS/JSX 変換の設定を二重管理しなくて済む。 |
| **高速** | ワーカー並列実行と Vite の変換キャッシュで、Jest と比べて起動・再実行が速いことが多い。 |
| **ESM ファーストフラン** | Native ESM をそのまま実行できるため、`import` 構文の扱いで詰まりにくい。 |
| **Jest 互換 API** | `describe / it / expect / vi.fn()` など、Jest から来た人でも違和感が少ない。 |
| **多様な実行環境** | Node、jsdom、happy-dom、さらに実ブラウザで動かす **Browser Mode** まで選べる。 |
| **優れた DX** | Watch モード、Vitest UI（ブラウザでテスト結果を見る）、型チェック統合、スナップショットなど標準搭載。 |

### Jest との違い（ざっくり）

- **Jest**：独自のトランスフォーマー（`babel-jest`, `ts-jest`）が必要。長年の実績があり、React Native などでは今も標準。
- **Vitest**：Vite 経由で変換するので TypeScript / JSX / エイリアスの設定がアプリ側と統一できる。Jest のテストコードはほぼそのまま動くケースが多い。

**「Vite を使って作られているアプリ」（Vue、React+Vite、Svelte、Nuxt、Astro など）の単体テストには、Vitest が第一候補**と考えてよいです。すでに Jest を使っている既存プロジェクトなら、無理に乗り換える必要はありません。

### どこまでを Vitest でテストするか

Vitest は**ブラウザ操作ではなく「コードのロジック」を確認する**ためのツールです。

- ✅ 純粋な関数、ユーティリティ、バリデーション、フォーマッタ
- ✅ Vue/React コンポーネントを jsdom や Browser Mode で描画してイベントを検証
- ✅ API クライアントのロジック（モック前提）
- ❌ 実ブラウザで複数ページをまたぐ操作（→ ここは Playwright や Cypress の領域）

---

## 環境構築の流れ

Vitest を動かすには、次の 2 つが必要です。

1. **Node.js**（JavaScript を実行する環境）
2. **Vitest パッケージ**（テストランナー本体）

まず Node.js の有無を確認し、必要ならインストールします。そのあとでプロジェクトに Vitest を追加します。

---

## Node.js の確認とインストール

### 1. Node.js が入っているか確認する

ターミナル（PowerShell / コマンドプロンプト / bash）で次を実行します。

```bash
node -v
```

例として `v20.10.0` のように表示されれば OK です。**18.x 以上**（できれば 20 以上）を推奨します。

「コマンドが見つかりません」と出る場合は、Node.js をインストールする必要があります。

### 2. Node.js をインストールする（必要な人向け）

1. 公式サイト <https://nodejs.org/> にアクセスします。
2. **LTS（Long Term Support）** のインストーラをダウンロードして実行します。
3. インストール後、ターミナルを**一度閉じて開き直し**、もう一度 `node -v` でバージョンが表示されることを確認します。

npm も同時に入ります。

```bash
npm -v
```

こちらもバージョンが出れば問題ありません。

---

## Vitest のインストール

Vitest は「プロジェクトごと」にインストールするのが一般的です。これから使うフォルダ（例：`vitest-tutorial`）を作り、その中で初期化とインストールを行います。

### 方法 A：新しいプロジェクトに追加する

```bash
mkdir vitest-tutorial
cd vitest-tutorial
npm init -y
npm install -D vitest
```

ポイントは以下です。

- `npm init -y`：`package.json` を自動生成する。
- `npm install -D vitest`：Vitest を **devDependencies**（開発用依存）としてインストールする。本番のバンドルには含まれない。
- `-D` は `--save-dev` の短縮形。テスト用ライブラリには必ず付ける。

続いて、`package.json` の `scripts` に `test` コマンドを追加します。

```json
{
  "name": "vitest-tutorial",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^2.0.0"
  }
}
```

- `"type": "module"`：ESM として扱う設定。最近のプロジェクトではほぼ必須。
- `vitest`（引数なし）：**Watch モード**でファイル変更のたびに再実行する開発時向け。
- `vitest run`：**1 回だけ**実行して終了する。CI で使う。
- `vitest --ui`：ブラウザ上でテストを可視化する UI モード（06 章で詳解）。
- `vitest run --coverage`：カバレッジ付きで 1 回実行する。

### 方法 B：既存のプロジェクトに追加する

すでに Vite ベースのプロジェクト（Vue/React/Svelte など）がある場合も、基本は同じです。

```bash
npm install -D vitest
```

フレームワーク別によく併用するパッケージ：

- **Vue**：`@vue/test-utils`, `jsdom`（または `happy-dom`）
- **React**：`@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- **Svelte**：`@testing-library/svelte`, `jsdom`
- **Node のみ**（サーバーサイド・CLI など）：追加パッケージは不要

たとえば React の場合：

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

### TypeScript を使う場合

TypeScript プロジェクトなら `typescript` を入れ、`tsconfig.json` の `types` に `vitest/globals` を足しておくと、グローバル API の型補完が効きます。

```bash
npm install -D typescript
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

> `globals: true` を `vitest.config.ts` で設定するまでは、`import { describe, it, expect } from 'vitest'` のように明示的に import するスタイルでも問題ありません（こちらのほうが IDE で探しやすく、初心者にはむしろ推奨です）。

---

## インストール確認：最小のテストを動かす

インストールが正しくできたか、最小のテストで確認します。

### 1. テスト対象のファイルを作る

`src/math.js`：

```js
export const add = (a, b) => a + b;
```

### 2. テストファイルを作る

`src/math.test.js`：

```js
import { describe, it, expect } from 'vitest';
import { add } from './math.js';

describe('add', () => {
  it('2 + 3 は 5 になる', () => {
    expect(add(2, 3)).toBe(5);
  });
});
```

### 3. 実行する

```bash
npm test
```

次のような出力が出れば成功です（抜粋）。

```
 ✓ src/math.test.js (1)
   ✓ add
     ✓ 2 + 3 は 5 になる

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Watch モードで起動しているので、`q` キーで終了できます。

---

## 設定ファイル（`vitest.config.ts`）の雛形

最低限は設定ゼロで動きますが、少し慣れたら次のような設定ファイルを用意します。

`vitest.config.ts`：

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,          // describe / it / expect をグローバルで使えるようにする
    environment: 'node',    // 'node' | 'jsdom' | 'happy-dom' | 'edge-runtime'
    include: ['src/**/*.{test,spec}.{ts,tsx,js,jsx}'],
    coverage: {
      provider: 'v8',       // 'v8' か 'istanbul'
      reporter: ['text', 'html'],
    },
  },
});
```

Vite プロジェクトの場合は、既存の `vite.config.ts` に `test` プロパティを追加する形でも OK です。

```ts
// vite.config.ts（Vite と共用するパターン）
/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  // ...plugins など既存のVite設定
  test: {
    environment: 'jsdom',
  },
});
```

詳しくは 02 章で扱います。

---

## インストールがうまくいかないとき

- **Node.js のバージョンが古い**：`node -v` で 18 未満なら LTS 版に更新する。
- **`SyntaxError: Cannot use import statement outside a module`**：`package.json` に `"type": "module"` が無い／テストファイルの拡張子が `.cjs` になっている等のケース。
- **`window is not defined`**：`environment` が `node` のままで、DOM を触るテストを書いている。`jsdom` か `happy-dom` に切り替える（06 章参照）。
- **ネットワークエラー**：社内プロキシ環境では `npm config set proxy ...` など事前に設定が必要。
- **古い Jest 設定との衝突**：Jest と Vitest を同居させる場合、`jest.config.js` の `testMatch` と Vitest の `include` が被らないように整理する。

---

## この章のまとめ

- **Vitest** は Vite の変換基盤を流用した高速なテストフレームワークで、API は Jest とほぼ互換。
- 実行には **Node.js 18+** が必要。
- 最小構成は `npm install -D vitest` と、`package.json` に `"test": "vitest"` を追加するだけ。
- 設定は `vitest.config.ts`（または既存の `vite.config.ts` に `test` プロパティを追加）で行う。
- DOM が必要なテストは `environment: 'jsdom'` を設定する。

---

## 次章

[[02_最初のテストとプロジェクト構成|02 — 最初のテストとプロジェクト構成]] では、典型的なプロジェクト構成、テスト実行コマンドの使い分け、`describe` / `it` の書き方を整理します。
