# 開発環境の構築

## 目次
- [[00-Node.js index|← 目次に戻る]]
- [[01_programming/07_バックエンド開発/02_Node.js/01-basics|← 前章: Node.jsの基礎]]
- [[03-modules|次章: モジュールシステム →]]

## Node.jsのインストール

### インストール方法

#### 1. 公式サイトからのインストール
```bash
# 公式サイト: https://nodejs.org/
# LTS版（推奨）またはCurrent版をダウンロード
```

#### 2. パッケージマネージャーを使用

**Windows (Chocolatey)**
```bash
choco install nodejs
```

**macOS (Homebrew)**
```bash
brew install node
```

**Ubuntu/Debian**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**CentOS/RHEL**
```bash
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs
```

### インストール確認
```bash
# Node.jsのバージョン確認
node --version
# 例: v18.17.0

# npmのバージョン確認
npm --version
# 例: 9.6.7
```

## npm（Node Package Manager）の基本

### npmとは？

**npm（Node Package Manager）**
- Node.jsの標準パッケージマネージャー
- JavaScriptライブラリのインストール・管理
- プロジェクトの依存関係管理
- スクリプトの実行

### 基本的なnpmコマンド

#### パッケージ管理

| コマンド | 説明 | 例 |
|----------|------|-----|
| `npm install` | 依存関係をインストール | `npm install` |
| `npm install <package>` | パッケージをインストール | `npm install express` |
| `npm install -g <package>` | グローバルにインストール | `npm install -g nodemon` |
| `npm uninstall <package>` | パッケージを削除 | `npm uninstall express` |
| `npm update` | パッケージを更新 | `npm update` |
| `npm list` | インストール済みパッケージを表示 | `npm list` |
| `npm outdated` | 更新可能なパッケージを表示 | `npm outdated` |

#### プロジェクト管理

| コマンド | 説明 | 例 |
|----------|------|-----|
| `npm init` | package.jsonを初期化 | `npm init` |
| `npm init -y` | デフォルト設定で初期化 | `npm init -y` |
| `npm run <script>` | スクリプトを実行 | `npm run dev` |
| `npm start` | startスクリプトを実行 | `npm start` |
| `npm test` | testスクリプトを実行 | `npm test` |
| `npm publish` | パッケージを公開 | `npm publish` |

### package.jsonの理解

#### 基本的なpackage.json
```json
{
  "name": "my-node-app",
  "version": "1.0.0",
  "description": "A sample Node.js application",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "keywords": ["node", "express", "api"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.5.0"
  }
}
```

#### package.jsonの主要フィールド

| フィールド | 説明 | 例 |
|------------|------|-----|
| `name` | パッケージ名 | `"my-app"` |
| `version` | バージョン | `"1.0.0"` |
| `description` | 説明 | `"A Node.js application"` |
| `main` | エントリーポイント | `"index.js"` |
| `scripts` | 実行スクリプト | `{"start": "node index.js"}` |
| `dependencies` | 本番依存関係 | `{"express": "^4.18.2"}` |
| `devDependencies` | 開発依存関係 | `{"nodemon": "^3.0.1"}` |
| `keywords` | キーワード | `["node", "api"]` |
| `author` | 作者 | `"Your Name"` |
| `license` | ライセンス | `"MIT"` |

### 依存関係の管理

#### dependencies vs devDependencies

**dependencies（本番依存関係）**
```bash
# 本番環境でも必要なパッケージ
npm install express cors helmet
```

**devDependencies（開発依存関係）**
```bash
# 開発時のみ必要なパッケージ
npm install --save-dev nodemon jest eslint
```

#### バージョン指定

| 指定方法 | 説明 | 例 |
|----------|------|-----|
| `^4.18.2` | パッチ・マイナーバージョン更新を許可 | `^4.18.2` |
| `~4.18.2` | パッチバージョンのみ更新を許可 | `~4.18.2` |
| `4.18.2` | 厳密なバージョン | `4.18.2` |
| `*` | 最新バージョン | `*` |
| `>=4.18.0` | 4.18.0以上 | `>=4.18.0` |

## 開発環境のセットアップ

### プロジェクトの初期化

#### 1. プロジェクトディレクトリの作成
```bash
# プロジェクトディレクトリを作成
mkdir my-node-project
cd my-node-project

# Gitリポジトリを初期化
git init
```

#### 2. package.jsonの作成
```bash
# 対話的にpackage.jsonを作成
npm init

# または、デフォルト設定で作成
npm init -y
```

#### 3. 基本的な依存関係のインストール
```bash
# Express.jsをインストール
npm install express

# 開発用ツールをインストール
npm install --save-dev nodemon
```

### 推奨開発ツール

#### コードエディター
- **VSCode**: 無料、高機能、豊富な拡張機能
- **Cursor**: AI機能付きコードエディター
- **WebStorm**: 有料、高機能IDE

#### 推奨VSCode拡張機能

| 拡張機能 | 説明 | 用途 |
|----------|------|------|
| **Node.js Extension Pack** | Node.js開発サポート | デバッグ、IntelliSense |
| **ESLint** | コード品質チェック | コードスタイル統一 |
| **Prettier** | コードフォーマット | 自動フォーマット |
| **Thunder Client** | APIテスト | REST APIテスト |
| **GitLens** | Git統合 | バージョン管理 |
| **Auto Rename Tag** | タグ自動リネーム | HTML/JSX編集 |

### プロジェクト構造

#### 推奨ディレクトリ構造
```
my-node-project/
├── package.json           # プロジェクト設定
├── package-lock.json      # 依存関係ロック
├── .gitignore            # Git除外設定
├── .env                  # 環境変数
├── .eslintrc.js          # ESLint設定
├── .prettierrc           # Prettier設定
├── README.md             # プロジェクト説明
├── index.js              # エントリーポイント
├── app.js                # アプリケーション設定
├── public/               # 静的ファイル
│   ├── css/
│   ├── js/
│   └── images/
├── views/                # テンプレートファイル
├── routes/               # ルートファイル
│   ├── index.js
│   └── users.js
├── models/               # データモデル
├── controllers/          # コントローラー
├── middleware/           # カスタムミドルウェア
├── config/              # 設定ファイル
├── logs/                # ログファイル
└── tests/               # テストファイル
```

### 設定ファイル

#### .gitignore
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output/

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

#### .env（環境変数）
```env
# アプリケーション設定
NODE_ENV=development
PORT=3000

# データベース設定
DB_HOST=localhost
DB_PORT=27017
DB_NAME=myapp

# API設定
API_KEY=your_api_key
JWT_SECRET=your_jwt_secret

# 外部サービス
REDIS_URL=redis://localhost:6379
```

#### .eslintrc.js（ESLint設定）
```javascript
module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['warn'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

#### .prettierrc（Prettier設定）
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

### 基本的なアプリケーション作成

#### 1. エントリーポイント（index.js）
```javascript
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
  console.log(`http://localhost:${PORT} にアクセスしてください`);
});
```

#### 2. アプリケーション設定（app.js）
```javascript
const express = require('express');
const path = require('path');

const app = express();

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ルートの設定
app.get('/', (req, res) => {
  res.send('Hello, Node.js!');
});

// エラーハンドリング
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
```

#### 3. package.jsonのスクリプト設定
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "debug": "nodemon --inspect index.js",
    "test": "jest",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write ."
  }
}
```

## 開発サーバーの起動

### 基本的な起動方法
```bash
# 本番モードで起動
npm start

# 開発モードで起動（nodemon使用）
npm run dev

# デバッグモードで起動
npm run debug
```

### nodemonの設定（nodemon.json）
```json
{
  "watch": ["app.js", "routes/", "models/"],
  "ext": "js,json",
  "ignore": ["node_modules/", "public/", "tests/"],
  "env": {
    "NODE_ENV": "development"
  },
  "delay": "1000"
}
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. パッケージのインストールエラー
```bash
# npmキャッシュをクリア
npm cache clean --force

# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

#### 2. ポートが使用中
```bash
# ポートの使用状況を確認
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# プロセスを終了
taskkill /PID <process_id>    # Windows
kill <process_id>             # macOS/Linux
```

#### 3. 権限エラー
```bash
# グローバルパッケージの権限を修正
sudo chown -R $USER /usr/local/lib/node_modules
```

## 練習問題

### 問題1
基本的なNode.jsプロジェクトを作成してください：
1. プロジェクトディレクトリを作成
2. package.jsonを初期化
3. Express.jsをインストール
4. 簡単なWebサーバーを作成
5. 開発サーバーを起動

### 問題2
以下の設定ファイルを作成してください：
1. .gitignoreファイル
2. .envファイル（環境変数）
3. ESLint設定ファイル
4. Prettier設定ファイル

### 問題3
以下の機能を持つアプリケーションを作成してください：
1. 静的ファイルの配信
2. JSON APIエンドポイント
3. エラーハンドリング
4. ログ出力

## まとめ

- Node.jsのインストール方法を理解
- npmの基本的な使い方を習得
- package.jsonの構造と役割を理解
- 開発環境のセットアップ方法を習得
- プロジェクト構造の設計方法を理解

---

**前の章**: [[01_programming/07_バックエンド開発/02_Node.js/01-basics|Node.jsの基礎]]
**次の章**: [[03-modules|モジュールシステム]] 