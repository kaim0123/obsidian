# Node.jsの基礎

## 目次
- [[00-Node.js index|← 目次に戻る]]
- [[01_programming/07_バックエンド開発/02_Node.js/02-setup|次章: 開発環境の構築 →]]

## Node.jsとは？

### 基本的な概念

**Node.js**
- JavaScriptをサーバーサイドで実行するためのランタイム環境
- Chrome V8エンジンをベースに構築
- イベント駆動、非同期I/Oモデルを採用
- 単一スレッドで効率的な処理を実現

### Node.jsの特徴

#### 1. 非同期処理
```javascript
// 同期的な処理（ブロッキング）
const fs = require('fs');
const data = fs.readFileSync('file.txt', 'utf8');
console.log(data);

// 非同期処理（ノンブロッキング）
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});
```

#### 2. イベントループ
```javascript
// イベントループの例
console.log('1. 開始');

setTimeout(() => {
  console.log('3. タイマー完了');
}, 0);

Promise.resolve().then(() => {
  console.log('2. Promise完了');
});

console.log('4. 終了');

// 出力順序: 1 → 4 → 2 → 3
```

#### 3. 単一スレッド
```javascript
// 重い処理は非同期で実行
const crypto = require('crypto');

// ブロッキング処理（避けるべき）
function heavyTask() {
  const start = Date.now();
  crypto.pbkdf2Sync('password', 'salt', 100000, 64, 'sha512');
  console.log(`完了: ${Date.now() - start}ms`);
}

// 非同期処理（推奨）
function heavyTaskAsync() {
  const start = Date.now();
  crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', (err, key) => {
    console.log(`完了: ${Date.now() - start}ms`);
  });
}
```

## 組み込みモジュール

### 主要な組み込みモジュール一覧

| モジュール名 | 説明 | 主な用途 |
|-------------|------|----------|
| `fs` | ファイルシステム操作 | ファイルの読み書き、ディレクトリ操作 |
| `http` | HTTPサーバー・クライアント | Webサーバーの作成、HTTPリクエスト |
| `https` | HTTPSサーバー・クライアント | セキュアなWebサーバー |
| `path` | パス操作 | ファイルパスの結合、正規化 |
| `url` | URL解析 | URLの解析と操作 |
| `querystring` | クエリ文字列処理 | URLパラメータの解析 |
| `crypto` | 暗号化・ハッシュ | パスワードハッシュ、暗号化 |
| `os` | オペレーティングシステム情報 | システム情報の取得 |
| `util` | ユーティリティ関数 | 継承、デバッグ、型チェック |
| `events` | イベント処理 | カスタムイベントの作成 |
| `stream` | ストリーム処理 | 大容量データの効率的処理 |
| `buffer` | バイナリデータ処理 | 画像、音声ファイルの処理 |
| `child_process` | 子プロセス管理 | 外部コマンドの実行 |
| `cluster` | クラスタリング | マルチコアCPUの活用 |

### fs（ファイルシステム）モジュール

#### 基本的なファイル操作

| 関数 | 説明 | 例 |
|------|------|-----|
| `fs.readFile()` | ファイルを非同期で読み込み | `fs.readFile('file.txt', 'utf8', callback)` |
| `fs.readFileSync()` | ファイルを同期的に読み込み | `fs.readFileSync('file.txt', 'utf8')` |
| `fs.writeFile()` | ファイルを非同期で書き込み | `fs.writeFile('file.txt', data, callback)` |
| `fs.writeFileSync()` | ファイルを同期的に書き込み | `fs.writeFileSync('file.txt', data)` |
| `fs.appendFile()` | ファイルに追記 | `fs.appendFile('file.txt', data, callback)` |
| `fs.unlink()` | ファイルを削除 | `fs.unlink('file.txt', callback)` |

#### ディレクトリ操作

| 関数 | 説明 | 例 |
|------|------|-----|
| `fs.mkdir()` | ディレクトリを作成 | `fs.mkdir('newdir', callback)` |
| `fs.rmdir()` | ディレクトリを削除 | `fs.rmdir('dir', callback)` |
| `fs.readdir()` | ディレクトリの内容を読み込み | `fs.readdir('dir', callback)` |
| `fs.stat()` | ファイル・ディレクトリの情報取得 | `fs.stat('file.txt', callback)` |

#### 使用例
```javascript
const fs = require('fs');

// ファイル読み込み
fs.readFile('data.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('エラー:', err);
    return;
  }
  console.log('ファイル内容:', data);
});

// ファイル書き込み
const content = 'Hello, Node.js!';
fs.writeFile('output.txt', content, (err) => {
  if (err) {
    console.error('エラー:', err);
    return;
  }
  console.log('ファイルが作成されました');
});

// ディレクトリ作成
fs.mkdir('logs', (err) => {
  if (err) {
    console.error('エラー:', err);
    return;
  }
  console.log('ディレクトリが作成されました');
});
```

### http（HTTPサーバー）モジュール

#### 基本的なHTTP関数

| 関数 | 説明 | 例 |
|------|------|-----|
| `http.createServer()` | HTTPサーバーを作成 | `http.createServer(requestListener)` |
| `http.request()` | HTTPリクエストを送信 | `http.request(options, callback)` |
| `http.get()` | GETリクエストを送信 | `http.get(url, callback)` |

#### サーバー作成例
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  // レスポンスヘッダーを設定
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  // レスポンスボディを送信
  res.end('<h1>Hello, Node.js!</h1>');
});

server.listen(3000, () => {
  console.log('サーバーがポート3000で起動しました');
});
```

### path（パス操作）モジュール

#### パス操作関数

| 関数 | 説明 | 例 |
|------|------|-----|
| `path.join()` | パスを結合 | `path.join('dir', 'file.txt')` |
| `path.resolve()` | 絶対パスに解決 | `path.resolve('file.txt')` |
| `path.dirname()` | ディレクトリ名を取得 | `path.dirname('/path/to/file.txt')` |
| `path.basename()` | ファイル名を取得 | `path.basename('/path/to/file.txt')` |
| `path.extname()` | 拡張子を取得 | `path.extname('file.txt')` |

#### 使用例
```javascript
const path = require('path');

// パスの結合
const filePath = path.join(__dirname, 'data', 'users.json');
console.log(filePath); // /current/dir/data/users.json

// ファイル名の取得
const filename = path.basename('/path/to/file.txt');
console.log(filename); // file.txt

// 拡張子の取得
const ext = path.extname('document.pdf');
console.log(ext); // .pdf
```

### crypto（暗号化）モジュール

#### 暗号化関数

| 関数 | 説明 | 例 |
|------|------|-----|
| `crypto.createHash()` | ハッシュを作成 | `crypto.createHash('sha256')` |
| `crypto.randomBytes()` | ランダムバイトを生成 | `crypto.randomBytes(16)` |
| `crypto.createHmac()` | HMACを作成 | `crypto.createHmac('sha256', secret)` |
| `crypto.pbkdf2()` | パスワードハッシュ | `crypto.pbkdf2(password, salt, iterations, keylen, digest)` |

#### 使用例
```javascript
const crypto = require('crypto');

// ハッシュ作成
const hash = crypto.createHash('sha256');
hash.update('Hello, World!');
console.log(hash.digest('hex'));

// ランダムバイト生成
const randomBytes = crypto.randomBytes(16);
console.log(randomBytes.toString('hex'));

// パスワードハッシュ
crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', (err, key) => {
  console.log(key.toString('hex'));
});
```

### util（ユーティリティ）モジュール

#### ユーティリティ関数

| 関数 | 説明 | 例 |
|------|------|-----|
| `util.inherits()` | 継承を実装 | `util.inherits(Child, Parent)` |
| `util.format()` | 文字列フォーマット | `util.format('%s %d', 'count', 42)` |
| `util.inspect()` | オブジェクトの詳細表示 | `util.inspect(obj, {depth: null})` |
| `util.promisify()` | コールバック関数をPromise化 | `util.promisify(fs.readFile)` |

#### 使用例
```javascript
const util = require('util');

// 文字列フォーマット
const message = util.format('Hello %s, you are %d years old', 'John', 25);
console.log(message); // Hello John, you are 25 years old

// オブジェクトの詳細表示
const obj = { name: 'John', age: 25, hobbies: ['reading', 'coding'] };
console.log(util.inspect(obj, { depth: null, colors: true }));

// Promise化
const fs = require('fs');
const readFileAsync = util.promisify(fs.readFile);

async function readData() {
  try {
    const data = await readFileAsync('file.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

## グローバルオブジェクト

### 主要なグローバルオブジェクト

| オブジェクト | 説明 | 例 |
|-------------|------|-----|
| `global` | グローバルオブジェクト | `global.myVar = 'value'` |
| `process` | プロセス情報 | `process.env.NODE_ENV` |
| `Buffer` | バイナリデータ | `Buffer.from('Hello')` |
| `__dirname` | 現在のディレクトリパス | `console.log(__dirname)` |
| `__filename` | 現在のファイルパス | `console.log(__filename)` |
| `console` | コンソール出力 | `console.log('Hello')` |
| `setTimeout` | タイマー設定 | `setTimeout(callback, 1000)` |
| `setInterval` | 間隔タイマー | `setInterval(callback, 1000)` |
| `clearTimeout` | タイマーキャンセル | `clearTimeout(timerId)` |
| `clearInterval` | 間隔タイマーキャンセル | `clearInterval(intervalId)` |

### processオブジェクト

#### プロセス情報の取得

| プロパティ/メソッド | 説明 | 例 |
|-------------------|------|-----|
| `process.env` | 環境変数 | `process.env.NODE_ENV` |
| `process.argv` | コマンドライン引数 | `process.argv[2]` |
| `process.cwd()` | 現在の作業ディレクトリ | `process.cwd()` |
| `process.exit()` | プロセス終了 | `process.exit(0)` |
| `process.on()` | イベントリスナー | `process.on('exit', callback)` |

#### 使用例
```javascript
// 環境変数の取得
console.log('NODE_ENV:', process.env.NODE_ENV);

// コマンドライン引数
console.log('引数:', process.argv.slice(2));

// 現在の作業ディレクトリ
console.log('作業ディレクトリ:', process.cwd());

// プロセス終了時の処理
process.on('exit', (code) => {
  console.log(`プロセスが終了しました: ${code}`);
});

// プロセス終了
process.exit(0);
```

## イベントループ

### イベントループの仕組み

```javascript
console.log('1. 開始');

// タイマー（setTimeout, setInterval）
setTimeout(() => {
  console.log('4. タイマー完了');
}, 0);

// Promise（マイクロタスク）
Promise.resolve().then(() => {
  console.log('3. Promise完了');
});

// 同期的な処理
console.log('2. 終了');

// 出力順序: 1 → 2 → 3 → 4
```

### イベントループのフェーズ

1. **タイマー**: setTimeout、setIntervalのコールバック
2. **ペンディングコールバック**: 延期されたI/Oコールバック
3. **idle, prepare**: 内部使用
4. **poll**: 新しいI/Oイベントの取得
5. **check**: setImmediateのコールバック
6. **close callbacks**: closeイベントのコールバック

## 練習問題

### 問題1
以下の機能を持つNode.jsスクリプトを作成してください：
1. ファイルからデータを読み込み
2. データを処理（大文字に変換）
3. 結果を新しいファイルに保存

### 問題2
HTTPサーバーを作成し、以下の機能を実装してください：
1. GET / で「Hello, Node.js!」を表示
2. GET /about で「About Page」を表示
3. 404エラーページの表示

### 問題3
以下の機能を持つユーティリティ関数を作成してください：
1. 文字列をハッシュ化する関数
2. ランダムな文字列を生成する関数
3. ファイルの存在確認をする関数

## まとめ

- Node.jsはJavaScriptをサーバーサイドで実行するランタイム
- 非同期処理とイベントループが特徴
- 豊富な組み込みモジュールで効率的な開発が可能
- グローバルオブジェクトでプロセス情報にアクセス可能

---

**前の章**: [[00-Node.js index|目次]]
**次の章**: [[01_programming/07_バックエンド開発/02_Node.js/02-setup|開発環境の構築]] 