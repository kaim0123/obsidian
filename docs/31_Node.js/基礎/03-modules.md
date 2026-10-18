# モジュールシステム

## 目次
- [[00-Node.js index|← 目次に戻る]]
- [[01_programming/07_バックエンド開発/02_Node.js/02-setup|← 前章: 開発環境の構築]]
- [[04-async|次章: 非同期処理 →]]

## モジュールシステムとは？

### 基本的な概念

**モジュールシステム**
- コードを分割して管理する仕組み
- 再利用可能なコードブロック
- 名前空間の分離
- 依存関係の管理

### モジュールシステムの利点

1. **コードの分割**: 大きなファイルを小さな単位に分割
2. **再利用性**: 同じ機能を複数の場所で使用
3. **保守性**: 機能ごとにファイルを分けて管理
4. **名前空間**: 変数名の衝突を回避
5. **依存関係**: 必要な機能のみを読み込み

## CommonJS（require/exports）

### CommonJSとは？

**CommonJS**
- Node.jsの標準モジュールシステム
- 同期的な読み込み
- `require()`と`module.exports`を使用
- サーバーサイドJavaScript用に設計

### 基本的な使用方法

#### モジュールの作成（math.js）
```javascript
// 基本的な関数を定義
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

// 関数をエクスポート
module.exports = {
  add,
  subtract,
  multiply,
  divide
};
```

#### モジュールの使用（app.js）
```javascript
// モジュールを読み込み
const math = require('./math');

// 関数を使用
console.log(math.add(5, 3));      // 8
console.log(math.subtract(10, 4)); // 6
console.log(math.multiply(2, 6));  // 12
console.log(math.divide(15, 3));   // 5
```

### エクスポートの方法

#### 1. オブジェクトとしてエクスポート
```javascript
// utils.js
const utils = {
  formatDate: (date) => {
    return date.toISOString();
  },
  validateEmail: (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  generateId: () => {
    return Math.random().toString(36).substr(2, 9);
  }
};

module.exports = utils;
```

#### 2. 個別にエクスポート
```javascript
// helpers.js
function formatDate(date) {
  return date.toISOString();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

module.exports.formatDate = formatDate;
module.exports.validateEmail = validateEmail;
module.exports.generateId = generateId;
```

#### 3. クラスをエクスポート
```javascript
// User.js
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.createdAt = new Date();
  }

  getInfo() {
    return {
      name: this.name,
      email: this.email,
      createdAt: this.createdAt
    };
  }

  updateName(newName) {
    this.name = newName;
  }
}

module.exports = User;
```

### モジュールの読み込み

#### 1. 相対パスでの読み込み
```javascript
// 同じディレクトリ
const math = require('./math');

// 親ディレクトリ
const config = require('../config');

// 子ディレクトリ
const userRoutes = require('./routes/users');
```

#### 2. 絶対パスでの読み込み
```javascript
// プロジェクトルートからの絶対パス
const config = require('/app/config/database');
```

#### 3. 組み込みモジュールの読み込み
```javascript
// Node.jsの組み込みモジュール
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
```

#### 4. npmパッケージの読み込み
```javascript
// サードパーティパッケージ
const express = require('express');
const mongoose = require('mongoose');
const lodash = require('lodash');
```

### モジュールの種類

#### 1. ファイルモジュール
```javascript
// ファイルパスを指定
const math = require('./math.js');
const config = require('./config.json');
```

#### 2. ディレクトリモジュール
```javascript
// package.jsonがあるディレクトリ
const myPackage = require('./my-package');

// index.jsがあるディレクトリ
const routes = require('./routes');
```

#### 3. 組み込みモジュール
```javascript
// Node.jsの標準モジュール
const fs = require('fs');
const path = require('path');
const http = require('http');
```

#### 4. サードパーティモジュール
```javascript
// npmでインストールしたパッケージ
const express = require('express');
const lodash = require('lodash');
```

## ES Modules（import/export）

### ES Modulesとは？

**ES Modules**
- ECMAScript 2015（ES6）で導入されたモジュールシステム
- 非同期な読み込み
- `import`と`export`を使用
- ブラウザとNode.jsの両方で使用可能

### package.jsonでの設定

#### ES Modulesを有効化
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}
```

### 基本的な使用方法

#### モジュールの作成（math.js）
```javascript
// 関数を定義
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

// デフォルトエクスポート
export default {
  add,
  subtract,
  multiply,
  divide
};
```

#### モジュールの使用（app.js）
```javascript
// 名前付きインポート
import { add, subtract, multiply, divide } from './math.js';

// デフォルトインポート
import math from './math.js';

// 使用例
console.log(add(5, 3));      // 8
console.log(math.multiply(2, 6)); // 12
```

### エクスポートの方法

#### 1. 名前付きエクスポート
```javascript
// utils.js
export function formatDate(date) {
  return date.toISOString();
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// 定数もエクスポート可能
export const API_URL = 'https://api.example.com';
export const MAX_RETRIES = 3;
```

#### 2. デフォルトエクスポート
```javascript
// User.js
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.createdAt = new Date();
  }

  getInfo() {
    return {
      name: this.name,
      email: this.email,
      createdAt: this.createdAt
    };
  }
}

export default User;
```

#### 3. 複合エクスポート
```javascript
// api.js
export const API_BASE_URL = 'https://api.example.com';

export function fetchData(url) {
  return fetch(`${API_BASE_URL}${url}`);
}

export default class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async get(endpoint) {
    return fetch(`${this.baseUrl}${endpoint}`);
  }
}
```

### インポートの方法

#### 1. 名前付きインポート
```javascript
// 特定の関数のみをインポート
import { add, multiply } from './math.js';

// エイリアスを使用
import { add as addNumbers, multiply as multiplyNumbers } from './math.js';

// すべてをインポート
import * as math from './math.js';
```

#### 2. デフォルトインポート
```javascript
// デフォルトエクスポートをインポート
import User from './User.js';

// エイリアスを使用
import MyUser from './User.js';
```

#### 3. 複合インポート
```javascript
// デフォルトと名前付きを同時にインポート
import ApiClient, { API_BASE_URL, fetchData } from './api.js';
```

## 組み込みモジュールの活用

### 主要な組み込みモジュール

#### fs（ファイルシステム）
```javascript
// CommonJS
const fs = require('fs');

// ES Modules
import fs from 'fs';

// ファイル読み込み
fs.readFile('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// ファイル書き込み
fs.writeFile('output.txt', 'Hello World', (err) => {
  if (err) throw err;
  console.log('File written successfully');
});
```

#### path（パス操作）
```javascript
// CommonJS
const path = require('path');

// ES Modules
import path from 'path';

// パスの結合
const filePath = path.join(__dirname, 'data', 'users.json');

// ファイル名の取得
const filename = path.basename(filePath);

// 拡張子の取得
const ext = path.extname(filename);
```

#### http（HTTPサーバー）
```javascript
// CommonJS
const http = require('http');

// ES Modules
import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Hello, World!</h1>');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
```

#### crypto（暗号化）
```javascript
// CommonJS
const crypto = require('crypto');

// ES Modules
import crypto from 'crypto';

// ハッシュ作成
const hash = crypto.createHash('sha256');
hash.update('Hello, World!');
console.log(hash.digest('hex'));

// ランダムバイト生成
const randomBytes = crypto.randomBytes(16);
console.log(randomBytes.toString('hex'));
```

## サードパーティモジュールの使用

### インストールと使用

#### 1. パッケージのインストール
```bash
# 基本的なインストール
npm install express

# 開発依存関係としてインストール
npm install --save-dev nodemon

# グローバルにインストール
npm install -g nodemon
```

#### 2. モジュールの使用
```javascript
// CommonJS
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// ES Modules
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

app.use(cors());
app.use(helmet());

app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### よく使うサードパーティモジュール

| モジュール | 説明 | 用途 |
|------------|------|------|
| **express** | Webフレームワーク | Webアプリケーション開発 |
| **cors** | CORSミドルウェア | クロスオリジンリクエスト |
| **helmet** | セキュリティミドルウェア | セキュリティヘッダー |
| **dotenv** | 環境変数管理 | 設定ファイル管理 |
| **mongoose** | MongoDB ODM | データベース操作 |
| **sequelize** | ORM | SQLデータベース操作 |
| **jsonwebtoken** | JWT処理 | 認証・認可 |
| **bcrypt** | パスワードハッシュ | セキュリティ |
| **nodemailer** | メール送信 | メール機能 |
| **multer** | ファイルアップロード | ファイル処理 |

## モジュールの設計パターン

### 1. シングルトンパターン
```javascript
// database.js
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    this.connection = null;
    Database.instance = this;
  }

  connect() {
    if (!this.connection) {
      this.connection = 'Connected to database';
    }
    return this.connection;
  }
}

// CommonJS
module.exports = new Database();

// ES Modules
export default new Database();
```

### 2. ファクトリーパターン
```javascript
// userFactory.js
class UserFactory {
  static createUser(type, data) {
    switch (type) {
      case 'admin':
        return new AdminUser(data);
      case 'regular':
        return new RegularUser(data);
      default:
        throw new Error('Invalid user type');
    }
  }
}

// CommonJS
module.exports = UserFactory;

// ES Modules
export default UserFactory;
```

### 3. ミドルウェアパターン
```javascript
// middleware/logger.js
function logger(req, res, next) {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
}

// CommonJS
module.exports = logger;

// ES Modules
export default logger;
```

## モジュールのテスト

### 基本的なテスト
```javascript
// math.test.js
import { add, subtract, multiply, divide } from './math.js';

// 簡単なテスト
console.log('Testing add function...');
console.log(add(2, 3) === 5 ? 'PASS' : 'FAIL');

console.log('Testing subtract function...');
console.log(subtract(5, 2) === 3 ? 'PASS' : 'FAIL');

console.log('Testing multiply function...');
console.log(multiply(4, 3) === 12 ? 'PASS' : 'FAIL');

console.log('Testing divide function...');
console.log(divide(10, 2) === 5 ? 'PASS' : 'FAIL');
```

### Jestを使用したテスト
```javascript
// math.test.js
import { add, subtract, multiply, divide } from './math.js';

describe('Math functions', () => {
  test('adds two numbers correctly', () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
  });

  test('subtracts two numbers correctly', () => {
    expect(subtract(5, 2)).toBe(3);
    expect(subtract(1, 1)).toBe(0);
  });

  test('multiplies two numbers correctly', () => {
    expect(multiply(4, 3)).toBe(12);
    expect(multiply(0, 5)).toBe(0);
  });

  test('divides two numbers correctly', () => {
    expect(divide(10, 2)).toBe(5);
    expect(divide(7, 2)).toBe(3.5);
  });

  test('throws error when dividing by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });
});
```

## 練習問題

### 問題1
以下の機能を持つモジュールを作成してください：
1. 文字列操作関数（大文字変換、小文字変換、逆順）
2. 配列操作関数（フィルタ、ソート、重複削除）
3. 数値操作関数（平均、最大値、最小値）

### 問題2
ユーザー管理モジュールを作成してください：
1. ユーザークラス（名前、メール、作成日時）
2. ユーザー配列の管理
3. ユーザーの追加、削除、検索機能

### 問題3
設定管理モジュールを作成してください：
1. 環境変数の読み込み
2. デフォルト値の設定
3. 設定値の検証機能

## まとめ

- CommonJSとES Modulesの違いを理解
- モジュールの作成と使用方法を習得
- 組み込みモジュールの活用方法を理解
- サードパーティモジュールの使用方法を習得
- モジュール設計パターンを理解

---

**前の章**: [[01_programming/07_バックエンド開発/02_Node.js/02-setup|開発環境の構築]]
**次の章**: [[04-async|非同期処理]] 