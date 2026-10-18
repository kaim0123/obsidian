# ファイルシステム

## 目次
- [[00-Node.js index|← 目次に戻る]]
- [[04-async|← 前章: 非同期処理]]
- [[06-http|次章: HTTPサーバー →]]

## fsモジュールとは？

### 基本的な概念

**fs（File System）モジュール**
- Node.jsのファイルシステム操作を提供
- ファイルの読み書き、ディレクトリ操作
- 同期・非同期の両方のAPIを提供
- ストリーム処理もサポート

### fsモジュールの読み込み

```javascript
// CommonJS
const fs = require('fs');

// ES Modules
import fs from 'fs';

// Promise版（Node.js 10以降）
const fsPromises = require('fs').promises;
// または
import { promises as fsPromises } from 'fs';
```

## ファイル操作

### ファイルの読み込み

#### 同期読み込み
```javascript
const fs = require('fs');

try {
  // テキストファイルの読み込み
  const data = fs.readFileSync('data.txt', 'utf8');
  console.log('ファイル内容:', data);
  
  // バイナリファイルの読み込み
  const buffer = fs.readFileSync('image.jpg');
  console.log('ファイルサイズ:', buffer.length);
} catch (error) {
  console.error('ファイル読み込みエラー:', error);
}
```

#### 非同期読み込み（コールバック）
```javascript
const fs = require('fs');

fs.readFile('data.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('ファイル読み込みエラー:', err);
    return;
  }
  console.log('ファイル内容:', data);
});

// エンコーディングを指定しない場合（Buffer）
fs.readFile('data.txt', (err, data) => {
  if (err) {
    console.error('ファイル読み込みエラー:', err);
    return;
  }
  console.log('Buffer:', data);
  console.log('文字列に変換:', data.toString('utf8'));
});
```

#### Promise版での読み込み
```javascript
const fs = require('fs').promises;

async function readFile() {
  try {
    const data = await fs.readFile('data.txt', 'utf8');
    console.log('ファイル内容:', data);
  } catch (error) {
    console.error('ファイル読み込みエラー:', error);
  }
}

readFile();
```

### ファイルの書き込み

#### 同期書き込み
```javascript
const fs = require('fs');

try {
  // テキストファイルの書き込み
  fs.writeFileSync('output.txt', 'Hello, World!', 'utf8');
  console.log('ファイルが作成されました');
  
  // バイナリデータの書き込み
  const buffer = Buffer.from('Hello, World!');
  fs.writeFileSync('output.bin', buffer);
  console.log('バイナリファイルが作成されました');
} catch (error) {
  console.error('ファイル書き込みエラー:', error);
}
```

#### 非同期書き込み（コールバック）
```javascript
const fs = require('fs');

// テキストファイルの書き込み
fs.writeFile('output.txt', 'Hello, World!', 'utf8', (err) => {
  if (err) {
    console.error('ファイル書き込みエラー:', err);
    return;
  }
  console.log('ファイルが作成されました');
});

// オプション付きの書き込み
fs.writeFile('output.txt', 'Hello, World!', {
  encoding: 'utf8',
  flag: 'a' // 追記モード
}, (err) => {
  if (err) {
    console.error('ファイル書き込みエラー:', err);
    return;
  }
  console.log('ファイルに追記されました');
});
```

#### Promise版での書き込み
```javascript
const fs = require('fs').promises;

async function writeFile() {
  try {
    await fs.writeFile('output.txt', 'Hello, World!', 'utf8');
    console.log('ファイルが作成されました');
  } catch (error) {
    console.error('ファイル書き込みエラー:', error);
  }
}

writeFile();
```

### ファイルの追記

#### 追記モードでの書き込み
```javascript
const fs = require('fs');

// 追記モード（'a'）
fs.writeFile('log.txt', '新しいログエントリ\n', { flag: 'a' }, (err) => {
  if (err) {
    console.error('追記エラー:', err);
    return;
  }
  console.log('ログが追記されました');
});

// 読み書きモード（'r+'）
fs.writeFile('data.txt', '更新された内容', { flag: 'r+' }, (err) => {
  if (err) {
    console.error('更新エラー:', err);
    return;
  }
  console.log('ファイルが更新されました');
});
```

#### appendFileメソッド
```javascript
const fs = require('fs');

// appendFileを使用した追記
fs.appendFile('log.txt', '新しいログエントリ\n', (err) => {
  if (err) {
    console.error('追記エラー:', err);
    return;
  }
  console.log('ログが追記されました');
});

// Promise版
const fsPromises = require('fs').promises;

async function appendToLog() {
  try {
    await fsPromises.appendFile('log.txt', '新しいログエントリ\n');
    console.log('ログが追記されました');
  } catch (error) {
    console.error('追記エラー:', error);
  }
}

appendToLog();
```

### ファイルの存在確認

#### 同期版
```javascript
const fs = require('fs');

try {
  // ファイルの存在確認
  if (fs.existsSync('data.txt')) {
    console.log('ファイルが存在します');
  } else {
    console.log('ファイルが存在しません');
  }
  
  // ファイルの詳細情報を取得
  const stats = fs.statSync('data.txt');
  console.log('ファイルサイズ:', stats.size);
  console.log('作成日時:', stats.birthtime);
  console.log('更新日時:', stats.mtime);
} catch (error) {
  console.error('エラー:', error);
}
```

#### 非同期版
```javascript
const fs = require('fs');

// ファイルの存在確認
fs.access('data.txt', fs.constants.F_OK, (err) => {
  if (err) {
    console.log('ファイルが存在しません');
    return;
  }
  console.log('ファイルが存在します');
});

// 読み取り権限の確認
fs.access('data.txt', fs.constants.R_OK, (err) => {
  if (err) {
    console.log('ファイルを読み取れません');
    return;
  }
  console.log('ファイルを読み取れます');
});

// 書き込み権限の確認
fs.access('data.txt', fs.constants.W_OK, (err) => {
  if (err) {
    console.log('ファイルに書き込めません');
    return;
  }
  console.log('ファイルに書き込めます');
});
```

### ファイルの削除

#### 同期削除
```javascript
const fs = require('fs');

try {
  fs.unlinkSync('delete-me.txt');
  console.log('ファイルが削除されました');
} catch (error) {
  console.error('ファイル削除エラー:', error);
}
```

#### 非同期削除
```javascript
const fs = require('fs');

fs.unlink('delete-me.txt', (err) => {
  if (err) {
    console.error('ファイル削除エラー:', err);
    return;
  }
  console.log('ファイルが削除されました');
});

// Promise版
const fsPromises = require('fs').promises;

async function deleteFile() {
  try {
    await fsPromises.unlink('delete-me.txt');
    console.log('ファイルが削除されました');
  } catch (error) {
    console.error('ファイル削除エラー:', error);
  }
}

deleteFile();
```

## ディレクトリ操作

### ディレクトリの作成

#### 単一ディレクトリの作成
```javascript
const fs = require('fs');

// 同期作成
try {
  fs.mkdirSync('new-directory');
  console.log('ディレクトリが作成されました');
} catch (error) {
  console.error('ディレクトリ作成エラー:', error);
}

// 非同期作成
fs.mkdir('new-directory', (err) => {
  if (err) {
    console.error('ディレクトリ作成エラー:', err);
    return;
  }
  console.log('ディレクトリが作成されました');
});

// オプション付き作成
fs.mkdir('new-directory', { recursive: true }, (err) => {
  if (err) {
    console.error('ディレクトリ作成エラー:', err);
    return;
  }
  console.log('ディレクトリが作成されました');
});
```

#### ネストしたディレクトリの作成
```javascript
const fs = require('fs');

// recursiveオプションを使用
fs.mkdir('parent/child/grandchild', { recursive: true }, (err) => {
  if (err) {
    console.error('ディレクトリ作成エラー:', err);
    return;
  }
  console.log('ネストしたディレクトリが作成されました');
});

// Promise版
const fsPromises = require('fs').promises;

async function createNestedDirectories() {
  try {
    await fsPromises.mkdir('parent/child/grandchild', { recursive: true });
    console.log('ネストしたディレクトリが作成されました');
  } catch (error) {
    console.error('ディレクトリ作成エラー:', error);
  }
}

createNestedDirectories();
```

### ディレクトリの読み込み

#### ディレクトリ内容の取得
```javascript
const fs = require('fs');

// 同期読み込み
try {
  const files = fs.readdirSync('.');
  console.log('ディレクトリ内容:', files);
} catch (error) {
  console.error('ディレクトリ読み込みエラー:', error);
}

// 非同期読み込み
fs.readdir('.', (err, files) => {
  if (err) {
    console.error('ディレクトリ読み込みエラー:', err);
    return;
  }
  console.log('ディレクトリ内容:', files);
});

// オプション付き読み込み
fs.readdir('.', { withFileTypes: true }, (err, files) => {
  if (err) {
    console.error('ディレクトリ読み込みエラー:', err);
    return;
  }
  
  files.forEach(file => {
    if (file.isDirectory()) {
      console.log(`ディレクトリ: ${file.name}`);
    } else if (file.isFile()) {
      console.log(`ファイル: ${file.name}`);
    }
  });
});
```

#### ディレクトリの詳細情報
```javascript
const fs = require('fs');

// ディレクトリの統計情報
fs.stat('.', (err, stats) => {
  if (err) {
    console.error('統計情報取得エラー:', err);
    return;
  }
  
  console.log('ディレクトリサイズ:', stats.size);
  console.log('作成日時:', stats.birthtime);
  console.log('更新日時:', stats.mtime);
  console.log('アクセス日時:', stats.atime);
  console.log('ディレクトリかどうか:', stats.isDirectory());
  console.log('ファイルかどうか:', stats.isFile());
});
```

### ディレクトリの削除

#### 空のディレクトリの削除
```javascript
const fs = require('fs');

// 同期削除
try {
  fs.rmdirSync('empty-directory');
  console.log('ディレクトリが削除されました');
} catch (error) {
  console.error('ディレクトリ削除エラー:', error);
}

// 非同期削除
fs.rmdir('empty-directory', (err) => {
  if (err) {
    console.error('ディレクトリ削除エラー:', err);
    return;
  }
  console.log('ディレクトリが削除されました');
});
```

#### 再帰的なディレクトリ削除
```javascript
const fs = require('fs');

// Node.js 14.14.0以降
fs.rm('directory-with-files', { recursive: true, force: true }, (err) => {
  if (err) {
    console.error('ディレクトリ削除エラー:', err);
    return;
  }
  console.log('ディレクトリとその内容が削除されました');
});

// Promise版
const fsPromises = require('fs').promises;

async function removeDirectory() {
  try {
    await fsPromises.rm('directory-with-files', { recursive: true, force: true });
    console.log('ディレクトリとその内容が削除されました');
  } catch (error) {
    console.error('ディレクトリ削除エラー:', error);
  }
}

removeDirectory();
```

## ファイル監視

### ファイルの変更監視

#### watchメソッド
```javascript
const fs = require('fs');

// ファイルの変更を監視
const watcher = fs.watch('data.txt', (eventType, filename) => {
  console.log(`イベントタイプ: ${eventType}`);
  console.log(`ファイル名: ${filename}`);
  
  if (eventType === 'change') {
    console.log('ファイルが変更されました');
  } else if (eventType === 'rename') {
    console.log('ファイル名が変更されました');
  }
});

// 監視を停止
setTimeout(() => {
  watcher.close();
  console.log('ファイル監視を停止しました');
}, 10000);
```

#### watchFileメソッド
```javascript
const fs = require('fs');

// ファイルの変更を定期的にチェック
fs.watchFile('data.txt', { interval: 1000 }, (curr, prev) => {
  console.log('現在の統計:', curr);
  console.log('前回の統計:', prev);
  
  if (curr.mtime > prev.mtime) {
    console.log('ファイルが更新されました');
  }
});

// 監視を停止
setTimeout(() => {
  fs.unwatchFile('data.txt');
  console.log('ファイル監視を停止しました');
}, 10000);
```

## ストリーム処理

### ファイルストリーム

#### 読み取りストリーム
```javascript
const fs = require('fs');

// 大きなファイルを効率的に読み込み
const readStream = fs.createReadStream('large-file.txt', 'utf8');

readStream.on('data', (chunk) => {
  console.log('チャンクサイズ:', chunk.length);
  console.log('チャンク内容:', chunk);
});

readStream.on('end', () => {
  console.log('ファイル読み込み完了');
});

readStream.on('error', (error) => {
  console.error('ストリームエラー:', error);
});
```

#### 書き込みストリーム
```javascript
const fs = require('fs');

// 大きなファイルを効率的に書き込み
const writeStream = fs.createWriteStream('output.txt');

writeStream.write('Hello, World!\n');
writeStream.write('This is a test file.\n');
writeStream.write('End of file.\n');

writeStream.end();

writeStream.on('finish', () => {
  console.log('ファイル書き込み完了');
});

writeStream.on('error', (error) => {
  console.error('ストリームエラー:', error);
});
```

#### パイプ処理
```javascript
const fs = require('fs');

// ファイルの内容を別のファイルにコピー
const readStream = fs.createReadStream('input.txt');
const writeStream = fs.createWriteStream('output.txt');

readStream.pipe(writeStream);

writeStream.on('finish', () => {
  console.log('ファイルコピー完了');
});

// 圧縮しながらコピー
const zlib = require('zlib');
const gzip = zlib.createGzip();

fs.createReadStream('input.txt')
  .pipe(gzip)
  .pipe(fs.createWriteStream('output.txt.gz'));
```

## 実践的な例

### ログファイル管理
```javascript
const fs = require('fs');
const path = require('path');

class Logger {
  constructor(logFile) {
    this.logFile = logFile;
  }
  
  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    fs.appendFile(this.logFile, logEntry, (err) => {
      if (err) {
        console.error('ログ書き込みエラー:', err);
      }
    });
  }
  
  async getLogs(limit = 100) {
    try {
      const data = await fs.promises.readFile(this.logFile, 'utf8');
      const lines = data.split('\n').filter(line => line.trim());
      return lines.slice(-limit);
    } catch (error) {
      console.error('ログ読み込みエラー:', error);
      return [];
    }
  }
  
  async rotateLog() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const newLogFile = `${this.logFile}.${timestamp}`;
      
      await fs.promises.rename(this.logFile, newLogFile);
      console.log(`ログファイルがローテーションされました: ${newLogFile}`);
    } catch (error) {
      console.error('ログローテーションエラー:', error);
    }
  }
}

// 使用例
const logger = new Logger('app.log');
logger.log('アプリケーションが起動しました');
logger.log('ユーザーがログインしました');
```

### ファイルバックアップシステム
```javascript
const fs = require('fs');
const path = require('path');

class BackupManager {
  constructor(backupDir) {
    this.backupDir = backupDir;
  }
  
  async createBackup(filePath) {
    try {
      // バックアップディレクトリの作成
      await fs.promises.mkdir(this.backupDir, { recursive: true });
      
      // バックアップファイル名の生成
      const fileName = path.basename(filePath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `${fileName}.${timestamp}`);
      
      // ファイルのコピー
      await fs.promises.copyFile(filePath, backupPath);
      console.log(`バックアップが作成されました: ${backupPath}`);
      
      return backupPath;
    } catch (error) {
      console.error('バックアップ作成エラー:', error);
      throw error;
    }
  }
  
  async listBackups() {
    try {
      const files = await fs.promises.readdir(this.backupDir);
      return files.filter(file => file.endsWith('.backup'));
    } catch (error) {
      console.error('バックアップ一覧取得エラー:', error);
      return [];
    }
  }
  
  async restoreBackup(backupFileName, targetPath) {
    try {
      const backupPath = path.join(this.backupDir, backupFileName);
      await fs.promises.copyFile(backupPath, targetPath);
      console.log(`バックアップが復元されました: ${targetPath}`);
    } catch (error) {
      console.error('バックアップ復元エラー:', error);
      throw error;
    }
  }
}

// 使用例
const backupManager = new BackupManager('./backups');

async function performBackup() {
  try {
    await backupManager.createBackup('important-data.txt');
    const backups = await backupManager.listBackups();
    console.log('利用可能なバックアップ:', backups);
  } catch (error) {
    console.error('バックアップ処理エラー:', error);
  }
}

performBackup();
```

### 設定ファイル管理
```javascript
const fs = require('fs');
const path = require('path');

class ConfigManager {
  constructor(configFile) {
    this.configFile = configFile;
    this.config = {};
  }
  
  async loadConfig() {
    try {
      if (await this.fileExists(this.configFile)) {
        const data = await fs.promises.readFile(this.configFile, 'utf8');
        this.config = JSON.parse(data);
      } else {
        this.config = this.getDefaultConfig();
        await this.saveConfig();
      }
      return this.config;
    } catch (error) {
      console.error('設定読み込みエラー:', error);
      this.config = this.getDefaultConfig();
      return this.config;
    }
  }
  
  async saveConfig() {
    try {
      const data = JSON.stringify(this.config, null, 2);
      await fs.promises.writeFile(this.configFile, data, 'utf8');
      console.log('設定が保存されました');
    } catch (error) {
      console.error('設定保存エラー:', error);
      throw error;
    }
  }
  
  get(key, defaultValue = null) {
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }
  
  set(key, value) {
    this.config[key] = value;
  }
  
  async fileExists(filePath) {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
  
  getDefaultConfig() {
    return {
      port: 3000,
      host: 'localhost',
      database: {
        host: 'localhost',
        port: 27017,
        name: 'myapp'
      },
      logging: {
        level: 'info',
        file: 'app.log'
      }
    };
  }
}

// 使用例
const configManager = new ConfigManager('config.json');

async function setupConfig() {
  await configManager.loadConfig();
  
  // 設定の取得
  const port = configManager.get('port', 3000);
  const dbHost = configManager.get('database.host', 'localhost');
  
  // 設定の変更
  configManager.set('port', 8080);
  configManager.set('database.host', 'production-db.com');
  
  // 設定の保存
  await configManager.saveConfig();
}

setupConfig();
```

## エラーハンドリング

### 一般的なエラーと対処法

```javascript
const fs = require('fs');

async function robustFileOperation() {
  try {
    // ファイルの存在確認
    await fs.promises.access('data.txt', fs.constants.F_OK);
    
    // ファイルの読み込み
    const data = await fs.promises.readFile('data.txt', 'utf8');
    console.log('ファイル内容:', data);
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('ファイルが存在しません');
    } else if (error.code === 'EACCES') {
      console.error('アクセス権限がありません');
    } else if (error.code === 'EISDIR') {
      console.error('ディレクトリをファイルとして読み込もうとしました');
    } else {
      console.error('予期しないエラー:', error);
    }
  }
}

robustFileOperation();
```

## 練習問題

### 問題1
以下の機能を持つファイル管理システムを作成してください：
1. ファイルの作成、読み込み、更新、削除
2. ディレクトリの作成と削除
3. ファイルの存在確認
4. エラーハンドリング

### 問題2
ログファイル管理システムを作成してください：
1. ログの書き込み機能
2. ログの読み込み機能
3. ログファイルのローテーション
4. ログレベルの管理

### 問題3
設定ファイル管理システムを作成してください：
1. JSON設定ファイルの読み込み
2. 設定値の取得・設定
3. 設定ファイルの保存
4. デフォルト値の管理

## まとめ

- fsモジュールの基本操作を理解
- 同期・非同期・Promise版の使い分け
- ファイルとディレクトリの操作
- ストリーム処理の活用
- 実践的なファイルシステム管理

---

**前の章**: [[04-async|非同期処理]]
**次の章**: [[06-http|HTTPサーバー]] 