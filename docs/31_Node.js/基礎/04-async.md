# 非同期処理

## 目次
- [[00-Node.js index|← 目次に戻る]]
- [[03-modules|← 前章: モジュールシステム]]
- [[05-filesystem|次章: ファイルシステム →]]

## 非同期処理とは？

### 基本的な概念

**非同期処理**
- 処理が完了するまで待たずに次の処理に進む
- ブロッキングしない処理方式
- 効率的なリソース利用
- Node.jsの重要な特徴

### 同期処理 vs 非同期処理

#### 同期処理（ブロッキング）
```javascript
const fs = require('fs');

// 同期処理 - 処理が完了するまで待機
console.log('ファイル読み込み開始');
const data = fs.readFileSync('large-file.txt', 'utf8');
console.log('ファイル読み込み完了');
console.log('次の処理');

// 出力順序:
// ファイル読み込み開始
// ファイル読み込み完了
// 次の処理
```

#### 非同期処理（ノンブロッキング）
```javascript
const fs = require('fs');

// 非同期処理 - 処理が完了するまで待たない
console.log('ファイル読み込み開始');
fs.readFile('large-file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log('ファイル読み込み完了');
});
console.log('次の処理');

// 出力順序:
// ファイル読み込み開始
// 次の処理
// ファイル読み込み完了
```

## コールバック関数

### コールバックとは？

**コールバック関数**
- 非同期処理が完了したときに実行される関数
- エラーハンドリングの標準的な方法
- Node.jsの伝統的な非同期処理パターン

### 基本的なコールバック

#### ファイル操作の例
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
fs.writeFile('output.txt', 'Hello, World!', (err) => {
  if (err) {
    console.error('エラー:', err);
    return;
  }
  console.log('ファイルが作成されました');
});
```

#### HTTPリクエストの例
```javascript
const http = require('http');

const options = {
  hostname: 'api.example.com',
  port: 80,
  path: '/users',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('レスポンス:', JSON.parse(data));
  });
});

req.on('error', (err) => {
  console.error('リクエストエラー:', err);
});

req.end();
```

### コールバック地獄（Callback Hell）

#### 問題のあるコード
```javascript
const fs = require('fs');

// コールバック地獄の例
fs.readFile('user.txt', 'utf8', (err, userData) => {
  if (err) {
    console.error('ユーザーファイル読み込みエラー:', err);
    return;
  }
  
  const userId = JSON.parse(userData).id;
  
  fs.readFile('posts.txt', 'utf8', (err, postsData) => {
    if (err) {
      console.error('投稿ファイル読み込みエラー:', err);
      return;
    }
    
    const posts = JSON.parse(postsData);
    const userPosts = posts.filter(post => post.userId === userId);
    
    fs.writeFile('user-posts.txt', JSON.stringify(userPosts), (err) => {
      if (err) {
        console.error('ファイル書き込みエラー:', err);
        return;
      }
      
      console.log('ユーザーの投稿を保存しました');
    });
  });
});
```

#### 解決方法：関数の分割
```javascript
const fs = require('fs');

// 関数を分割して可読性を向上
function readUserFile(callback) {
  fs.readFile('user.txt', 'utf8', (err, data) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, JSON.parse(data));
  });
}

function readPostsFile(callback) {
  fs.readFile('posts.txt', 'utf8', (err, data) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, JSON.parse(data));
  });
}

function writeUserPosts(userPosts, callback) {
  fs.writeFile('user-posts.txt', JSON.stringify(userPosts), (err) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null);
  });
}

// メイン処理
readUserFile((err, userData) => {
  if (err) {
    console.error('ユーザーファイル読み込みエラー:', err);
    return;
  }
  
  const userId = userData.id;
  
  readPostsFile((err, posts) => {
    if (err) {
      console.error('投稿ファイル読み込みエラー:', err);
      return;
    }
    
    const userPosts = posts.filter(post => post.userId === userId);
    
    writeUserPosts(userPosts, (err) => {
      if (err) {
        console.error('ファイル書き込みエラー:', err);
        return;
      }
      
      console.log('ユーザーの投稿を保存しました');
    });
  });
});
```

## Promise

### Promiseとは？

**Promise**
- 非同期処理の結果を表現するオブジェクト
- コールバック地獄を解決
- エラーハンドリングが改善
- ES6で標準化

### Promiseの基本

#### Promiseの作成
```javascript
// 基本的なPromise
const myPromise = new Promise((resolve, reject) => {
  // 非同期処理
  setTimeout(() => {
    const randomNumber = Math.random();
    
    if (randomNumber > 0.5) {
      resolve(`成功: ${randomNumber}`);
    } else {
      reject(`失敗: ${randomNumber}`);
    }
  }, 1000);
});

// Promiseの使用
myPromise
  .then(result => {
    console.log('成功:', result);
  })
  .catch(error => {
    console.error('エラー:', error);
  });
```

#### ファイル操作のPromise化
```javascript
const fs = require('fs');
const util = require('util');

// fs.readFileをPromise化
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

// Promiseを使用したファイル操作
readFileAsync('data.txt', 'utf8')
  .then(data => {
    console.log('ファイル内容:', data);
    return writeFileAsync('output.txt', data.toUpperCase());
  })
  .then(() => {
    console.log('ファイルが更新されました');
  })
  .catch(error => {
    console.error('エラー:', error);
  });
```

### Promiseのメソッド

#### Promise.all()
```javascript
const fs = require('fs');
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);

// 複数のPromiseを並行実行
Promise.all([
  readFileAsync('file1.txt', 'utf8'),
  readFileAsync('file2.txt', 'utf8'),
  readFileAsync('file3.txt', 'utf8')
])
.then(results => {
  console.log('すべてのファイルが読み込まれました');
  console.log('file1:', results[0]);
  console.log('file2:', results[1]);
  console.log('file3:', results[2]);
})
.catch(error => {
  console.error('エラー:', error);
});
```

#### Promise.race()
```javascript
// 最初に完了したPromiseの結果を取得
const promise1 = new Promise(resolve => setTimeout(() => resolve('Promise 1'), 3000));
const promise2 = new Promise(resolve => setTimeout(() => resolve('Promise 2'), 1000));
const promise3 = new Promise(resolve => setTimeout(() => resolve('Promise 3'), 2000));

Promise.race([promise1, promise2, promise3])
  .then(result => {
    console.log('最初に完了:', result); // Promise 2
  });
```

#### Promise.allSettled()
```javascript
// すべてのPromiseが完了するまで待機（成功・失敗に関係なく）
const promises = [
  Promise.resolve('成功1'),
  Promise.reject('失敗1'),
  Promise.resolve('成功2'),
  Promise.reject('失敗2')
];

Promise.allSettled(promises)
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Promise ${index}: 成功 - ${result.value}`);
      } else {
        console.log(`Promise ${index}: 失敗 - ${result.reason}`);
      }
    });
  });
```

### Promiseチェーン

#### 複数の処理を連続実行
```javascript
const fs = require('fs');
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

// Promiseチェーン
readFileAsync('input.txt', 'utf8')
  .then(data => {
    console.log('ファイル読み込み完了');
    return data.toUpperCase();
  })
  .then(upperData => {
    console.log('大文字変換完了');
    return writeFileAsync('output.txt', upperData);
  })
  .then(() => {
    console.log('ファイル書き込み完了');
    return readFileAsync('output.txt', 'utf8');
  })
  .then(finalData => {
    console.log('最終確認:', finalData);
  })
  .catch(error => {
    console.error('エラー:', error);
  });
```

## async/await

### async/awaitとは？

**async/await**
- Promiseをより直感的に使用する構文
- 同期的なコードのように書ける
- エラーハンドリングが簡単
- ES2017で導入

### 基本的な使用方法

#### 基本的なasync/await
```javascript
const fs = require('fs');
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);

// async/awaitを使用したファイル読み込み
async function readFile() {
  try {
    const data = await readFileAsync('data.txt', 'utf8');
    console.log('ファイル内容:', data);
  } catch (error) {
    console.error('エラー:', error);
  }
}

readFile();
```

#### 複数の非同期処理
```javascript
const fs = require('fs');
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

async function processFiles() {
  try {
    // 並行実行
    const [file1, file2] = await Promise.all([
      readFileAsync('file1.txt', 'utf8'),
      readFileAsync('file2.txt', 'utf8')
    ]);
    
    console.log('file1:', file1);
    console.log('file2:', file2);
    
    // 連続実行
    const combined = file1 + '\n' + file2;
    await writeFileAsync('combined.txt', combined);
    
    console.log('ファイルが結合されました');
  } catch (error) {
    console.error('エラー:', error);
  }
}

processFiles();
```

### エラーハンドリング

#### try-catch文
```javascript
async function handleErrors() {
  try {
    const result = await someAsyncOperation();
    console.log('成功:', result);
  } catch (error) {
    console.error('エラー:', error);
  }
}
```

#### Promise.catch()
```javascript
async function handleErrors() {
  const result = await someAsyncOperation()
    .catch(error => {
      console.error('エラー:', error);
      return 'デフォルト値';
    });
  
  console.log('結果:', result);
}
```

### 実践的な例

#### HTTPリクエスト
```javascript
const https = require('https');
const util = require('util');

// Promise化されたHTTPリクエスト
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// async/awaitを使用
async function fetchUserData() {
  try {
    const userData = await makeRequest('https://jsonplaceholder.typicode.com/users/1');
    console.log('ユーザーデータ:', userData);
    
    const posts = await makeRequest('https://jsonplaceholder.typicode.com/posts?userId=1');
    console.log('投稿データ:', posts);
  } catch (error) {
    console.error('エラー:', error);
  }
}

fetchUserData();
```

#### データベース操作
```javascript
// 仮想的なデータベース操作
class Database {
  async connect() {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('データベースに接続しました');
        resolve();
      }, 1000);
    });
  }
  
  async query(sql) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) {
          resolve({ rows: [{ id: 1, name: 'John' }] });
        } else {
          reject(new Error('クエリエラー'));
        }
      }, 500);
    });
  }
  
  async close() {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('データベース接続を閉じました');
        resolve();
      }, 500);
    });
  }
}

async function performDatabaseOperations() {
  const db = new Database();
  
  try {
    await db.connect();
    
    const users = await db.query('SELECT * FROM users');
    console.log('ユーザー:', users.rows);
    
    const posts = await db.query('SELECT * FROM posts');
    console.log('投稿:', posts.rows);
    
    await db.close();
  } catch (error) {
    console.error('データベースエラー:', error);
    await db.close();
  }
}

performDatabaseOperations();
```

## イベントループ

### イベントループとは？

**イベントループ**
- Node.jsの非同期処理の仕組み
- シングルスレッドで効率的な処理
- コールバック、Promise、async/awaitの実行順序

### イベントループの仕組み

```javascript
console.log('1. 開始');

setTimeout(() => {
  console.log('4. タイマー完了');
}, 0);

Promise.resolve().then(() => {
  console.log('3. Promise完了');
});

setImmediate(() => {
  console.log('5. setImmediate完了');
});

process.nextTick(() => {
  console.log('2. nextTick完了');
});

console.log('6. 終了');

// 出力順序:
// 1. 開始
// 6. 終了
// 2. nextTick完了
// 3. Promise完了
// 4. タイマー完了
// 5. setImmediate完了
```

### イベントループのフェーズ

1. **タイマー**: setTimeout、setInterval
2. **ペンディングコールバック**: 延期されたI/Oコールバック
3. **idle, prepare**: 内部使用
4. **poll**: 新しいI/Oイベントの取得
5. **check**: setImmediateのコールバック
6. **close callbacks**: closeイベントのコールバック

## 非同期処理のベストプラクティス

### 1. エラーハンドリング
```javascript
async function robustAsyncFunction() {
  try {
    const result = await riskyOperation();
    return result;
  } catch (error) {
    console.error('エラーが発生しました:', error);
    // 適切なエラーハンドリング
    throw error; // または適切な処理
  }
}
```

### 2. 並行処理の活用
```javascript
// 非効率（順次実行）
async function sequential() {
  const result1 = await operation1();
  const result2 = await operation2();
  const result3 = await operation3();
  return [result1, result2, result3];
}

// 効率的（並行実行）
async function parallel() {
  const [result1, result2, result3] = await Promise.all([
    operation1(),
    operation2(),
    operation3()
  ]);
  return [result1, result2, result3];
}
```

### 3. タイムアウトの設定
```javascript
function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('タイムアウト'));
    }, ms);
  });
}

async function withTimeout(promise, ms) {
  return Promise.race([promise, timeout(ms)]);
}

// 使用例
async function fetchWithTimeout() {
  try {
    const result = await withTimeout(
      fetch('https://api.example.com/data'),
      5000 // 5秒でタイムアウト
    );
    return result;
  } catch (error) {
    console.error('タイムアウトまたはエラー:', error);
  }
}
```

## 練習問題

### 問題1
以下の機能を持つ非同期関数を作成してください：
1. ファイルを読み込んで内容を大文字に変換
2. 変換した内容を新しいファイルに保存
3. 処理時間を計測して表示

### 問題2
複数のAPIエンドポイントからデータを取得し、統合する関数を作成してください：
1. ユーザー情報の取得
2. ユーザーの投稿の取得
3. ユーザーのコメントの取得
4. すべてのデータを統合して返す

### 問題3
エラーハンドリングを含む非同期処理を作成してください：
1. データベース接続
2. 複数のクエリ実行
3. エラー時の適切な処理
4. リソースの適切な解放

## まとめ

- 非同期処理の基本概念を理解
- コールバック、Promise、async/awaitの使い分け
- エラーハンドリングの重要性
- イベントループの仕組み
- 非同期処理のベストプラクティス

---

**前の章**: [[03-modules|モジュールシステム]]
**次の章**: [[05-filesystem|ファイルシステム]] 