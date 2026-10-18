# 開発環境の構築

## 目次
- [[TypeScript 1/01-basics|← 前章: TypeScriptの基礎]]
- [[03-types|次章: 型システムの詳細 →]]

## 必要なツールのインストール

### Node.jsのインストール

**Node.js**はTypeScriptの実行環境として必要です。

#### Windowsでのインストール

1. **公式サイトからダウンロード**
   - [nodejs.org](https://nodejs.org/)にアクセス
   - LTS版（推奨）をダウンロード

2. **インストーラーの実行**
   ```bash
   # インストール確認
   node --version
   npm --version
   ```

#### macOSでのインストール

```bash
# Homebrewを使用
brew install node

# または公式インストーラーを使用
# https://nodejs.org/からダウンロード
```

#### Linuxでのインストール

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs
```

### TypeScriptのインストール

#### グローバルインストール

```bash
# npmを使用
npm install -g typescript

# インストール確認
tsc --version
```

#### プロジェクトローカルインストール

```bash
# プロジェクトディレクトリの作成
mkdir my-typescript-project
cd my-typescript-project

# package.jsonの初期化
npm init -y

# TypeScriptのローカルインストール
npm install --save-dev typescript

# npxを使用してTypeScriptコンパイラを実行
npx tsc --version
```

## プロジェクトの初期化

### 基本的なプロジェクト構造

```bash
my-typescript-project/
├── src/
│   ├── index.ts
│   └── utils.ts
├── dist/
├── package.json
├── tsconfig.json
└── README.md
```

### package.jsonの設定

```json
{
  "name": "my-typescript-project",
  "version": "1.0.0",
  "description": "A TypeScript project",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "keywords": ["typescript", "node"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### TypeScript設定ファイル（tsconfig.json）

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### 主要なコンパイラオプション

| オプション | 説明 | デフォルト |
|-----------|------|-----------|
| `target` | 出力するJavaScriptのバージョン | `ES3` |
| `module` | モジュールシステム | `ESNext` |
| `outDir` | 出力ディレクトリ | 入力ファイルと同じ |
| `rootDir` | 入力ファイルのルートディレクトリ | 自動検出 |
| `strict` | 厳密な型チェックを有効化 | `false` |
| `esModuleInterop` | CommonJSモジュールの互換性 | `false` |
| `declaration` | .d.tsファイルの生成 | `false` |
| `sourceMap` | ソースマップの生成 | `false` |

## コードエディターの設定

### Visual Studio Code

**推奨エディター**：TypeScript開発に最適化されています。

#### インストール

1. [code.visualstudio.com](https://code.visualstudio.com/)からダウンロード
2. インストール後、以下の拡張機能を追加：

#### 推奨拡張機能

```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

#### ワークスペース設定

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### その他のエディター

#### WebStorm
- JetBrains製のIDE
- TypeScriptサポートが優れている
- 有料だが高機能

#### Sublime Text
- 軽量で高速
- TypeScriptプラグインで拡張可能

#### Vim/Neovim
- ターミナルベースのエディター
- TypeScript Language Serverでサポート

## 開発ツールの設定

### ESLint

**コード品質チェックツール**

```bash
# ESLintのインストール
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# 設定ファイルの生成
npx eslint --init
```

#### .eslintrc.js

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  env: {
    node: true,
    es6: true,
  },
};
```

### Prettier

**コードフォーマッター**

```bash
# Prettierのインストール
npm install --save-dev prettier

# ESLintとの統合
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

#### .prettierrc

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### スクリプトの追加

```json
// package.json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "clean": "rm -rf dist"
  }
}
```

## 最初のTypeScriptプログラム

### 基本的なファイル構造

```typescript
// src/index.ts
import { greet, calculateSum } from './utils';

console.log(greet('TypeScript'));
console.log('Sum:', calculateSum(5, 3));
```

```typescript
// src/utils.ts
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export function calculateSum(a: number, b: number): number {
  return a + b;
}

export function isEven(num: number): boolean {
  return num % 2 === 0;
}
```

### コンパイルと実行

```bash
# TypeScriptのコンパイル
npm run build

# 実行
npm start

# 開発モード（ファイル変更を監視）
npm run dev
```

## デバッグ設定

### VS Codeでのデバッグ

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug TypeScript",
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true,
      "resolveSourceMapLocations": [
        "${workspaceFolder}/**",
        "!**/node_modules/**"
      ]
    }
  ]
}
```

### ソースマップの活用

```json
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSourceMap": false,
    "inlineSources": true
  }
}
```

## パッケージ管理

### npm

```bash
# 依存関係のインストール
npm install lodash
npm install --save-dev @types/lodash

# 開発依存関係
npm install --save-dev jest @types/jest ts-jest

# グローバルパッケージ
npm install -g typescript ts-node
```

### yarn

```bash
# yarnのインストール
npm install -g yarn

# 依存関係のインストール
yarn add lodash
yarn add -D @types/lodash

# 開発依存関係
yarn add -D jest @types/jest ts-jest
```

### pnpm

```bash
# pnpmのインストール
npm install -g pnpm

# 依存関係のインストール
pnpm add lodash
pnpm add -D @types/lodash
```

## 環境変数の管理

### dotenv

```bash
# dotenvのインストール
npm install dotenv
npm install --save-dev @types/node
```

```typescript
// src/config.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || 'localhost',
  apiKey: process.env.API_KEY || '',
};
```

```bash
# .env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/myapp
API_KEY=your-secret-api-key
```

## テスト環境の構築

### Jest

```bash
# Jestのインストール
npm install --save-dev jest @types/jest ts-jest
```

```json
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
};
```

```typescript
// src/utils.test.ts
import { greet, calculateSum, isEven } from './utils';

describe('Utils', () => {
  test('greet should return greeting message', () => {
    expect(greet('World')).toBe('Hello, World!');
  });

  test('calculateSum should add two numbers', () => {
    expect(calculateSum(2, 3)).toBe(5);
  });

  test('isEven should return true for even numbers', () => {
    expect(isEven(2)).toBe(true);
    expect(isEven(3)).toBe(false);
  });
});
```

## 練習問題

### 問題1
1. 開発環境を構築してください：
   - Node.jsとTypeScriptのインストール
   - プロジェクトの初期化
   - tsconfig.jsonの設定

### 問題2
1. 基本的なTypeScriptプロジェクトを作成してください：
   - 複数のファイルを持つプロジェクト
   - モジュールのインポート/エクスポート
   - コンパイルと実行

### 問題3
1. 開発ツールを設定してください：
   - ESLintとPrettierの設定
   - VS Codeの設定
   - デバッグ環境の構築

## まとめ

- Node.jsとTypeScriptのインストール方法
- プロジェクトの初期化と設定
- コードエディターと開発ツールの設定
- 基本的なTypeScriptプログラムの作成
- デバッグとテスト環境の構築

---

**前の章**: [[TypeScript 1/01-basics|TypeScriptの基礎]]
**次の章**: [[03-types|型システムの詳細]] 