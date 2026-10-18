# HTTPサーバー

## 目次
- [[00-Node.js index|← 目次に戻る]]
- [[05-filesystem|← 前章: ファイルシステム]]
- [[07-express-basics|次章: Express入門 →]]

## HTTPサーバーとは？

### 基本的な概念

**HTTPサーバー**
- クライアント（ブラウザ等）からのリクエストを受け取り、レスポンスを返すプログラム
- Webアプリケーションの基盤
- Node.jsでは標準モジュール`http`で簡単に作成可能

## httpモジュールの使い方

### モジュールの読み込み
```javascript
const http = require('http');
```

### 最も基本的なHTTPサーバー
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, Node.js HTTP Server!');
});

server.listen(3000, () => {
  console.log('サーバーが http://localhost:3000 で起動しました');
});
```

### リクエスト情報の取得
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  console.log('メソッド:', req.method);
  console.log('URL:', req.url);
  console.log('ヘッダー:', req.headers);

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('リクエスト情報を受信しました');
});

server.listen(3000);
```

### ルーティングの実装
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>ホームページ</h1>');
  } else if (req.url === '/about' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>このサイトについて</h1>');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('ページが見つかりません');
  }
});

server.listen(3000);
```

### POSTリクエストの受信
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/submit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      console.log('受信データ:', body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'データを受信しました', data: body }));
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('ページが見つかりません');
  }
});

server.listen(3000);
```

## 静的ファイルの配信

### ファイルサーバーの実装例
```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  if (filePath === './') filePath = './index.html';

  const extname = path.extname(filePath);
  let contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('ファイルが見つかりません');
      } else {
        res.writeHead(500);
        res.end('サーバーエラー');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(3000, () => {
  console.log('静的ファイルサーバーが http://localhost:3000 で起動しました');
});
```

## HTTPSサーバー

### HTTPSサーバーの作成例
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

const server = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('Hello, HTTPS!');
});

server.listen(3443, () => {
  console.log('HTTPSサーバーが https://localhost:3443 で起動しました');
});
```

## 実践例：簡易APIサーバー
```javascript
const http = require('http');

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

const server = http.createServer((req, res) => {
  if (req.url === '/api/users' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('APIサーバーが http://localhost:3000 で起動しました');
});
```

## 練習問題

### 問題1
1. ポート3000で動作するHTTPサーバーを作成し、「Hello, World!」を返してください。
2. `/about`にアクセスしたとき「このサイトについて」と返すルーティングを追加してください。

### 問題2
1. POSTリクエストで送信されたデータを受信し、JSON形式で返すAPIを作成してください。
2. 送信データが空の場合は400エラーを返してください。

### 問題3
1. 静的ファイル（HTML, CSS, JS）を配信するサーバーを作成してください。
2. 存在しないファイルにアクセスした場合は404エラーを返してください。

## まとめ

- httpモジュールで基本的なHTTPサーバーを作成できる
- ルーティングやPOSTデータの受信方法を理解
- 静的ファイルやAPIサーバーの実装例を学習
- HTTPSサーバーの作成方法も習得

---

**前の章**: [[05-filesystem|ファイルシステム]]
**次の章**: [[07-express-basics|Express入門]] 