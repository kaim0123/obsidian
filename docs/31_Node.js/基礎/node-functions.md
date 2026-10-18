# Node.js 組み込み関数一覧

## 目次
- [[00-Node.js index|← 目次に戻る]]
- [[01_programming/07_バックエンド開発/02_Node.js/01-basics|← Node.jsの基礎]]

## 組み込みモジュール関数一覧

### fs（ファイルシステム）モジュール

#### ファイル操作関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `fs.readFile()` | ファイルを非同期で読み込み | `(path, options, callback)` | `undefined` | `fs.readFile('file.txt', 'utf8', callback)` |
| `fs.readFileSync()` | ファイルを同期的に読み込み | `(path, options)` | `string\|Buffer` | `fs.readFileSync('file.txt', 'utf8')` |
| `fs.writeFile()` | ファイルを非同期で書き込み | `(path, data, options, callback)` | `undefined` | `fs.writeFile('file.txt', data, callback)` |
| `fs.writeFileSync()` | ファイルを同期的に書き込み | `(path, data, options)` | `undefined` | `fs.writeFileSync('file.txt', data)` |
| `fs.appendFile()` | ファイルに追記 | `(path, data, options, callback)` | `undefined` | `fs.appendFile('file.txt', data, callback)` |
| `fs.appendFileSync()` | ファイルに同期的に追記 | `(path, data, options)` | `undefined` | `fs.appendFileSync('file.txt', data)` |
| `fs.unlink()` | ファイルを削除 | `(path, callback)` | `undefined` | `fs.unlink('file.txt', callback)` |
| `fs.unlinkSync()` | ファイルを同期的に削除 | `(path)` | `undefined` | `fs.unlinkSync('file.txt')` |
| `fs.copyFile()` | ファイルをコピー | `(src, dest, flags, callback)` | `undefined` | `fs.copyFile('src.txt', 'dest.txt', callback)` |
| `fs.copyFileSync()` | ファイルを同期的にコピー | `(src, dest, flags)` | `undefined` | `fs.copyFileSync('src.txt', 'dest.txt')` |
| `fs.rename()` | ファイル名を変更 | `(oldPath, newPath, callback)` | `undefined` | `fs.rename('old.txt', 'new.txt', callback)` |
| `fs.renameSync()` | ファイル名を同期的に変更 | `(oldPath, newPath)` | `undefined` | `fs.renameSync('old.txt', 'new.txt')` |

#### ディレクトリ操作関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `fs.mkdir()` | ディレクトリを作成 | `(path, options, callback)` | `undefined` | `fs.mkdir('newdir', callback)` |
| `fs.mkdirSync()` | ディレクトリを同期的に作成 | `(path, options)` | `undefined` | `fs.mkdirSync('newdir')` |
| `fs.rmdir()` | ディレクトリを削除 | `(path, callback)` | `undefined` | `fs.rmdir('dir', callback)` |
| `fs.rmdirSync()` | ディレクトリを同期的に削除 | `(path)` | `undefined` | `fs.rmdirSync('dir')` |
| `fs.readdir()` | ディレクトリの内容を読み込み | `(path, options, callback)` | `undefined` | `fs.readdir('dir', callback)` |
| `fs.readdirSync()` | ディレクトリの内容を同期的に読み込み | `(path, options)` | `string[]` | `fs.readdirSync('dir')` |
| `fs.stat()` | ファイル・ディレクトリの情報取得 | `(path, callback)` | `undefined` | `fs.stat('file.txt', callback)` |
| `fs.statSync()` | ファイル・ディレクトリの情報を同期的に取得 | `(path)` | `Stats` | `fs.statSync('file.txt')` |
| `fs.access()` | ファイルのアクセス権限をチェック | `(path, mode, callback)` | `undefined` | `fs.access('file.txt', callback)` |
| `fs.accessSync()` | ファイルのアクセス権限を同期的にチェック | `(path, mode)` | `undefined` | `fs.accessSync('file.txt')` |

### http（HTTPサーバー）モジュール

#### サーバー関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `http.createServer()` | HTTPサーバーを作成 | `(options, requestListener)` | `Server` | `http.createServer(requestListener)` |
| `http.createServer()` | HTTPサーバーを作成（オプション付き） | `(options, requestListener)` | `Server` | `http.createServer({}, requestListener)` |
| `server.listen()` | サーバーを起動 | `(port, hostname, callback)` | `Server` | `server.listen(3000, callback)` |
| `server.close()` | サーバーを停止 | `(callback)` | `Server` | `server.close(callback)` |

#### クライアント関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `http.request()` | HTTPリクエストを送信 | `(options, callback)` | `ClientRequest` | `http.request(options, callback)` |
| `http.get()` | GETリクエストを送信 | `(url, options, callback)` | `ClientRequest` | `http.get('http://example.com', callback)` |

### path（パス操作）モジュール

#### パス操作関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `path.join()` | パスを結合 | `(...paths)` | `string` | `path.join('dir', 'file.txt')` |
| `path.resolve()` | 絶対パスに解決 | `(...paths)` | `string` | `path.resolve('file.txt')` |
| `path.dirname()` | ディレクトリ名を取得 | `(path)` | `string` | `path.dirname('/path/to/file.txt')` |
| `path.basename()` | ファイル名を取得 | `(path, ext)` | `string` | `path.basename('/path/to/file.txt')` |
| `path.extname()` | 拡張子を取得 | `(path)` | `string` | `path.extname('file.txt')` |
| `path.parse()` | パスを解析 | `(path)` | `object` | `path.parse('/path/to/file.txt')` |
| `path.format()` | パスオブジェクトを文字列に変換 | `(pathObject)` | `string` | `path.format(pathObject)` |
| `path.normalize()` | パスを正規化 | `(path)` | `string` | `path.normalize('/path//to/file')` |
| `path.isAbsolute()` | 絶対パスかチェック | `(path)` | `boolean` | `path.isAbsolute('/path/to/file')` |
| `path.relative()` | 相対パスを取得 | `(from, to)` | `string` | `path.relative('/from', '/to')` |

### crypto（暗号化）モジュール

#### ハッシュ関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `crypto.createHash()` | ハッシュを作成 | `(algorithm)` | `Hash` | `crypto.createHash('sha256')` |
| `crypto.createHmac()` | HMACを作成 | `(algorithm, secret)` | `Hmac` | `crypto.createHmac('sha256', secret)` |
| `crypto.pbkdf2()` | パスワードハッシュ | `(password, salt, iterations, keylen, digest, callback)` | `undefined` | `crypto.pbkdf2(password, salt, 100000, 64, 'sha512', callback)` |
| `crypto.pbkdf2Sync()` | パスワードハッシュ（同期） | `(password, salt, iterations, keylen, digest)` | `Buffer` | `crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512')` |

#### 暗号化関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `crypto.randomBytes()` | ランダムバイトを生成 | `(size, callback)` | `Buffer` | `crypto.randomBytes(16, callback)` |
| `crypto.randomInt()` | ランダム整数を生成 | `(min, max, callback)` | `number` | `crypto.randomInt(1, 100, callback)` |
| `crypto.createCipher()` | 暗号化オブジェクトを作成 | `(algorithm, password)` | `Cipher` | `crypto.createCipher('aes-256-cbc', password)` |
| `crypto.createDecipher()` | 復号化オブジェクトを作成 | `(algorithm, password)` | `Decipher` | `crypto.createDecipher('aes-256-cbc', password)` |

### util（ユーティリティ）モジュール

#### ユーティリティ関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `util.inherits()` | 継承を実装 | `(constructor, superConstructor)` | `undefined` | `util.inherits(Child, Parent)` |
| `util.format()` | 文字列フォーマット | `(format, ...args)` | `string` | `util.format('%s %d', 'count', 42)` |
| `util.inspect()` | オブジェクトの詳細表示 | `(object, options)` | `string` | `util.inspect(obj, {depth: null})` |
| `util.promisify()` | コールバック関数をPromise化 | `(original)` | `function` | `util.promisify(fs.readFile)` |
| `util.callbackify()` | Promise関数をコールバック化 | `(original)` | `function` | `util.callbackify(asyncFunction)` |
| `util.isArray()` | 配列かチェック | `(object)` | `boolean` | `util.isArray([])` |
| `util.isBoolean()` | 真偽値かチェック | `(object)` | `boolean` | `util.isBoolean(true)` |
| `util.isNull()` | nullかチェック | `(object)` | `boolean` | `util.isNull(null)` |
| `util.isNullOrUndefined()` | nullまたはundefinedかチェック | `(object)` | `boolean` | `util.isNullOrUndefined(value)` |
| `util.isNumber()` | 数値かチェック | `(object)` | `boolean` | `util.isNumber(42)` |
| `util.isString()` | 文字列かチェック | `(object)` | `boolean` | `util.isString('hello')` |
| `util.isSymbol()` | シンボルかチェック | `(object)` | `boolean` | `util.isSymbol(Symbol())` |
| `util.isUndefined()` | undefinedかチェック | `(object)` | `boolean` | `util.isUndefined(undefined)` |
| `util.isRegExp()` | 正規表現かチェック | `(object)` | `boolean` | `util.isRegExp(/regex/)` |
| `util.isObject()` | オブジェクトかチェック | `(object)` | `boolean` | `util.isObject({})` |
| `util.isDate()` | Dateオブジェクトかチェック | `(object)` | `boolean` | `util.isDate(new Date())` |
| `util.isError()` | Errorオブジェクトかチェック | `(object)` | `boolean` | `util.isError(new Error())` |
| `util.isFunction()` | 関数かチェック | `(object)` | `boolean` | `util.isFunction(() => {})` |
| `util.isPrimitive()` | プリミティブ値かチェック | `(object)` | `boolean` | `util.isPrimitive('string')` |
| `util.isBuffer()` | Bufferかチェック | `(object)` | `boolean` | `util.isBuffer(Buffer.from('hello'))` |

### os（オペレーティングシステム）モジュール

#### システム情報関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `os.platform()` | プラットフォーム名を取得 | `()` | `string` | `os.platform()` |
| `os.arch()` | CPUアーキテクチャを取得 | `()` | `string` | `os.arch()` |
| `os.cpus()` | CPU情報を取得 | `()` | `object[]` | `os.cpus()` |
| `os.freemem()` | 空きメモリを取得 | `()` | `number` | `os.freemem()` |
| `os.totalmem()` | 総メモリを取得 | `()` | `number` | `os.totalmem()` |
| `os.homedir()` | ホームディレクトリを取得 | `()` | `string` | `os.homedir()` |
| `os.tmpdir()` | 一時ディレクトリを取得 | `()` | `string` | `os.tmpdir()` |
| `os.hostname()` | ホスト名を取得 | `()` | `string` | `os.hostname()` |
| `os.type()` | OSタイプを取得 | `()` | `string` | `os.type()` |
| `os.release()` | OSリリース情報を取得 | `()` | `string` | `os.release()` |
| `os.uptime()` | システム稼働時間を取得 | `()` | `number` | `os.uptime()` |
| `os.loadavg()` | システム負荷を取得 | `()` | `number[]` | `os.loadavg()` |
| `os.networkInterfaces()` | ネットワークインターフェースを取得 | `()` | `object` | `os.networkInterfaces()` |
| `os.userInfo()` | ユーザー情報を取得 | `(options)` | `object` | `os.userInfo()` |
| `os.constants()` | OS定数を取得 | `()` | `object` | `os.constants()` |

### events（イベント）モジュール

#### イベント関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `events.EventEmitter()` | イベントエミッターを作成 | `()` | `EventEmitter` | `new events.EventEmitter()` |
| `emitter.on()` | イベントリスナーを追加 | `(eventName, listener)` | `EventEmitter` | `emitter.on('event', listener)` |
| `emitter.once()` | 一度だけ実行されるイベントリスナーを追加 | `(eventName, listener)` | `EventEmitter` | `emitter.once('event', listener)` |
| `emitter.emit()` | イベントを発火 | `(eventName, ...args)` | `boolean` | `emitter.emit('event', data)` |
| `emitter.removeListener()` | イベントリスナーを削除 | `(eventName, listener)` | `EventEmitter` | `emitter.removeListener('event', listener)` |
| `emitter.removeAllListeners()` | すべてのイベントリスナーを削除 | `(eventName)` | `EventEmitter` | `emitter.removeAllListeners('event')` |
| `emitter.listenerCount()` | イベントリスナーの数を取得 | `(eventName)` | `number` | `emitter.listenerCount('event')` |
| `emitter.eventNames()` | 登録されているイベント名を取得 | `()` | `string[]` | `emitter.eventNames()` |

### stream（ストリーム）モジュール

#### ストリーム関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `stream.Readable()` | 読み取りストリームを作成 | `(options)` | `Readable` | `new stream.Readable()` |
| `stream.Writable()` | 書き込みストリームを作成 | `(options)` | `Writable` | `new stream.Writable()` |
| `stream.Duplex()` | 双方向ストリームを作成 | `(options)` | `Duplex` | `new stream.Duplex()` |
| `stream.Transform()` | 変換ストリームを作成 | `(options)` | `Transform` | `new stream.Transform()` |
| `stream.PassThrough()` | パススルーストリームを作成 | `(options)` | `PassThrough` | `new stream.PassThrough()` |
| `stream.pipeline()` | ストリームパイプラインを作成 | `(...streams, callback)` | `Promise` | `stream.pipeline(source, destination, callback)` |
| `stream.finished()` | ストリームの完了を待機 | `(stream, callback)` | `function` | `stream.finished(stream, callback)` |

### buffer（バッファ）モジュール

#### バッファ関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `Buffer.from()` | バッファを作成 | `(input, encoding)` | `Buffer` | `Buffer.from('Hello')` |
| `Buffer.alloc()` | 初期化されたバッファを作成 | `(size, fill, encoding)` | `Buffer` | `Buffer.alloc(10)` |
| `Buffer.allocUnsafe()` | 未初期化のバッファを作成 | `(size)` | `Buffer` | `Buffer.allocUnsafe(10)` |
| `Buffer.isBuffer()` | バッファかチェック | `(obj)` | `boolean` | `Buffer.isBuffer(buffer)` |
| `Buffer.byteLength()` | バイト長を取得 | `(string, encoding)` | `number` | `Buffer.byteLength('Hello')` |
| `Buffer.concat()` | バッファを結合 | `(list, totalLength)` | `Buffer` | `Buffer.concat([buf1, buf2])` |
| `Buffer.compare()` | バッファを比較 | `(buf1, buf2)` | `number` | `Buffer.compare(buf1, buf2)` |

### child_process（子プロセス）モジュール

#### 子プロセス関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `child_process.exec()` | コマンドを実行 | `(command, options, callback)` | `ChildProcess` | `child_process.exec('ls -la', callback)` |
| `child_process.execSync()` | コマンドを同期的に実行 | `(command, options)` | `Buffer` | `child_process.execSync('ls -la')` |
| `child_process.spawn()` | プロセスを生成 | `(command, args, options)` | `ChildProcess` | `child_process.spawn('ls', ['-la'])` |
| `child_process.fork()` | Node.jsプロセスを生成 | `(modulePath, args, options)` | `ChildProcess` | `child_process.fork('./worker.js')` |
| `child_process.execFile()` | 実行ファイルを実行 | `(file, args, options, callback)` | `ChildProcess` | `child_process.execFile('node', ['script.js'], callback)` |

## グローバル関数

### タイマー関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `setTimeout()` | タイマーを設定 | `(callback, delay, ...args)` | `Timeout` | `setTimeout(callback, 1000)` |
| `setInterval()` | 間隔タイマーを設定 | `(callback, delay, ...args)` | `Timeout` | `setInterval(callback, 1000)` |
| `setImmediate()` | 即座に実行 | `(callback, ...args)` | `Immediate` | `setImmediate(callback)` |
| `clearTimeout()` | タイマーをキャンセル | `(timeoutId)` | `undefined` | `clearTimeout(timeoutId)` |
| `clearInterval()` | 間隔タイマーをキャンセル | `(intervalId)` | `undefined` | `clearInterval(intervalId)` |
| `clearImmediate()` | 即座実行をキャンセル | `(immediateId)` | `undefined` | `clearImmediate(immediateId)` |

### コンソール関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `console.log()` | ログを出力 | `(...data)` | `undefined` | `console.log('Hello')` |
| `console.error()` | エラーログを出力 | `(...data)` | `undefined` | `console.error('Error')` |
| `console.warn()` | 警告ログを出力 | `(...data)` | `undefined` | `console.warn('Warning')` |
| `console.info()` | 情報ログを出力 | `(...data)` | `undefined` | `console.info('Info')` |
| `console.debug()` | デバッグログを出力 | `(...data)` | `undefined` | `console.debug('Debug')` |
| `console.trace()` | スタックトレースを出力 | `(...data)` | `undefined` | `console.trace('Trace')` |
| `console.time()` | タイマーを開始 | `(label)` | `undefined` | `console.time('label')` |
| `console.timeEnd()` | タイマーを終了 | `(label)` | `undefined` | `console.timeEnd('label')` |
| `console.table()` | テーブル形式で出力 | `(tabularData, properties)` | `undefined` | `console.table(array)` |
| `console.count()` | カウンターを出力 | `(label)` | `undefined` | `console.count('label')` |
| `console.countReset()` | カウンターをリセット | `(label)` | `undefined` | `console.countReset('label')` |
| `console.group()` | グループを開始 | `(...label)` | `undefined` | `console.group('group')` |
| `console.groupEnd()` | グループを終了 | `()` | `undefined` | `console.groupEnd()` |
| `console.clear()` | コンソールをクリア | `()` | `undefined` | `console.clear()` |

## 関連リンク

- [[01_programming/07_バックエンド開発/02_Node.js/01-basics|Node.jsの基礎]] - 基本的な概念と使用例
- [[00-JavaScript index|JavaScript入門]] - JavaScriptの基本
- [[プログラミング基礎知識/02-APIの基礎|APIの基礎]] - APIの概念

---

**前の章**: [[01_programming/07_バックエンド開発/02_Node.js/01-basics|Node.jsの基礎]]
**次の章**: [[01_programming/07_バックエンド開発/02_Node.js/02-setup|開発環境の構築]] 