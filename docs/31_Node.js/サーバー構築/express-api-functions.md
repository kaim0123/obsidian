# Express.js API関数一覧

## 目次
- [[00-Node.js index|← 目次に戻る]]
- [[07-express-basics|← Express.js入門]]

## Express.js API関数一覧

### アプリケーション関数

#### 基本設定関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `express()` | Expressアプリケーションを作成 | `()` | `Application` | `const app = express()` |
| `app.listen()` | サーバーを起動 | `(port, hostname, callback)` | `Server` | `app.listen(3000, callback)` |
| `app.set()` | アプリケーション設定 | `(name, value)` | `Application` | `app.set('view engine', 'ejs')` |
| `app.get()` | 設定値を取得 | `(name)` | `any` | `app.get('view engine')` |
| `app.enable()` | 設定を有効化 | `(name)` | `Application` | `app.enable('trust proxy')` |
| `app.disable()` | 設定を無効化 | `(name)` | `Application` | `app.disable('trust proxy')` |
| `app.enabled()` | 設定が有効かチェック | `(name)` | `boolean` | `app.enabled('trust proxy')` |
| `app.disabled()` | 設定が無効かチェック | `(name)` | `boolean` | `app.disabled('trust proxy')` |

#### ミドルウェア関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `app.use()` | ミドルウェアを登録 | `(path, middleware)` | `Application` | `app.use(express.json())` |
| `app.use()` | パス指定でミドルウェアを登録 | `(path, middleware)` | `Application` | `app.use('/api', router)` |
| `app.all()` | すべてのHTTPメソッドでミドルウェアを登録 | `(path, middleware)` | `Application` | `app.all('*', middleware)` |
| `app.param()` | パラメータミドルウェアを登録 | `(name, callback)` | `Application` | `app.param('id', callback)` |

#### ルーティング関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `app.get()` | GETリクエストを処理 | `(path, callback)` | `Application` | `app.get('/users', callback)` |
| `app.post()` | POSTリクエストを処理 | `(path, callback)` | `Application` | `app.post('/users', callback)` |
| `app.put()` | PUTリクエストを処理 | `(path, callback)` | `Application` | `app.put('/users/:id', callback)` |
| `app.delete()` | DELETEリクエストを処理 | `(path, callback)` | `Application` | `app.delete('/users/:id', callback)` |
| `app.patch()` | PATCHリクエストを処理 | `(path, callback)` | `Application` | `app.patch('/users/:id', callback)` |
| `app.head()` | HEADリクエストを処理 | `(path, callback)` | `Application` | `app.head('/users', callback)` |
| `app.options()` | OPTIONSリクエストを処理 | `(path, callback)` | `Application` | `app.options('/users', callback)` |
| `app.route()` | ルートチェーンを作成 | `(path)` | `Router` | `app.route('/users').get().post()` |

### ルーター関数

#### ルーター作成・設定

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `express.Router()` | ルーターを作成 | `(options)` | `Router` | `const router = express.Router()` |
| `router.use()` | ルーターにミドルウェアを登録 | `(path, middleware)` | `Router` | `router.use(express.json())` |
| `router.param()` | ルーターにパラメータミドルウェアを登録 | `(name, callback)` | `Router` | `router.param('id', callback)` |
| `router.all()` | すべてのHTTPメソッドでルートを登録 | `(path, callback)` | `Router` | `router.all('*', callback)` |

#### ルータールーティング

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `router.get()` | GETリクエストを処理 | `(path, callback)` | `Router` | `router.get('/', callback)` |
| `router.post()` | POSTリクエストを処理 | `(path, callback)` | `Router` | `router.post('/', callback)` |
| `router.put()` | PUTリクエストを処理 | `(path, callback)` | `Router` | `router.put('/:id', callback)` |
| `router.delete()` | DELETEリクエストを処理 | `(path, callback)` | `Router` | `router.delete('/:id', callback)` |
| `router.patch()` | PATCHリクエストを処理 | `(path, callback)` | `Router` | `router.patch('/:id', callback)` |
| `router.head()` | HEADリクエストを処理 | `(path, callback)` | `Router` | `router.head('/', callback)` |
| `router.options()` | OPTIONSリクエストを処理 | `(path, callback)` | `Router` | `router.options('/', callback)` |
| `router.route()` | ルートチェーンを作成 | `(path)` | `Router` | `router.route('/:id').get().put().delete()` |

### レスポンス関数

#### 基本レスポンス関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `res.send()` | レスポンスを送信 | `(body)` | `Response` | `res.send('Hello')` |
| `res.json()` | JSONレスポンスを送信 | `(body)` | `Response` | `res.json({data: 'value'})` |
| `res.jsonp()` | JSONPレスポンスを送信 | `(body)` | `Response` | `res.jsonp({data: 'value'})` |
| `res.sendStatus()` | ステータスコードのみ送信 | `(statusCode)` | `Response` | `res.sendStatus(404)` |
| `res.sendFile()` | ファイルを送信 | `(path, options, callback)` | `Response` | `res.sendFile('/path/to/file')` |
| `res.download()` | ファイルをダウンロード | `(path, filename, callback)` | `Response` | `res.download('/path/to/file')` |
| `res.redirect()` | リダイレクト | `(status, url)` | `Response` | `res.redirect('/home')` |
| `res.render()` | テンプレートをレンダリング | `(view, locals, callback)` | `Response` | `res.render('index', {data})` |

#### ヘッダー・ステータス関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `res.status()` | ステータスコードを設定 | `(code)` | `Response` | `res.status(404).send('Not Found')` |
| `res.set()` | ヘッダーを設定 | `(field, value)` | `Response` | `res.set('Content-Type', 'text/html')` |
| `res.set()` | 複数ヘッダーを設定 | `(headers)` | `Response` | `res.set({'Content-Type': 'text/html'})` |
| `res.get()` | ヘッダー値を取得 | `(field)` | `string` | `res.get('Content-Type')` |
| `res.header()` | ヘッダーを設定（setのエイリアス） | `(field, value)` | `Response` | `res.header('Content-Type', 'text/html')` |
| `res.links()` | Linkヘッダーを設定 | `(links)` | `Response` | `res.links({'next': 'http://example.com'})` |

#### クッキー関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `res.cookie()` | クッキーを設定 | `(name, value, options)` | `Response` | `res.cookie('name', 'value')` |
| `res.clearCookie()` | クッキーを削除 | `(name, options)` | `Response` | `res.clearCookie('name')` |
| `res.signedCookie()` | 署名付きクッキーを設定 | `(name, value, options)` | `Response` | `res.signedCookie('name', 'value', secret)` |

#### その他のレスポンス関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `res.end()` | レスポンスを終了 | `(data, encoding)` | `Response` | `res.end()` |
| `res.format()` | コンテンツネゴシエーション | `(obj)` | `Response` | `res.format({html: ..., json: ...})` |
| `res.attachment()` | ファイル添付ヘッダーを設定 | `(filename)` | `Response` | `res.attachment('file.pdf')` |
| `res.append()` | ヘッダーを追加 | `(field, value)` | `Response` | `res.append('Set-Cookie', 'foo=bar')` |
| `res.vary()` | Varyヘッダーを設定 | `(field)` | `Response` | `res.vary('User-Agent')` |

### リクエスト関数

#### リクエスト情報取得

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `req.params` | URLパラメータを取得 | - | `object` | `req.params.id` |
| `req.query` | クエリパラメータを取得 | - | `object` | `req.query.page` |
| `req.body` | リクエストボディを取得 | - | `any` | `req.body.name` |
| `req.headers` | リクエストヘッダーを取得 | - | `object` | `req.headers['user-agent']` |
| `req.cookies` | クッキーを取得 | - | `object` | `req.cookies.name` |
| `req.signedCookies` | 署名付きクッキーを取得 | - | `object` | `req.signedCookies.name` |
| `req.get()` | ヘッダー値を取得 | `(name)` | `string` | `req.get('Content-Type')` |
| `req.header()` | ヘッダー値を取得（getのエイリアス） | `(name)` | `string` | `req.header('Content-Type')` |

#### リクエスト情報チェック

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `req.is()` | コンテンツタイプをチェック | `(type)` | `string\|false` | `req.is('application/json')` |
| `req.accepts()` | Acceptヘッダーをチェック | `(types)` | `string\|false` | `req.accepts('html', 'json')` |
| `req.acceptsCharsets()` | 文字セットをチェック | `(charsets)` | `string\|false` | `req.acceptsCharsets('utf-8')` |
| `req.acceptsEncodings()` | エンコーディングをチェック | `(encodings)` | `string\|false` | `req.acceptsEncodings('gzip')` |
| `req.acceptsLanguages()` | 言語をチェック | `(languages)` | `string\|false` | `req.acceptsLanguages('en', 'ja')` |

#### リクエスト情報取得（詳細）

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `req.path` | リクエストパスを取得 | - | `string` | `req.path` |
| `req.hostname` | ホスト名を取得 | - | `string` | `req.hostname` |
| `req.host` | ホストを取得 | - | `string` | `req.host` |
| `req.protocol` | プロトコルを取得 | - | `string` | `req.protocol` |
| `req.secure` | HTTPSかチェック | - | `boolean` | `req.secure` |
| `req.ip` | IPアドレスを取得 | - | `string` | `req.ip` |
| `req.ips` | 信頼されたプロキシのIPを取得 | - | `string[]` | `req.ips` |
| `req.subdomains` | サブドメインを取得 | - | `string[]` | `req.subdomains` |
| `req.originalUrl` | 元のURLを取得 | - | `string` | `req.originalUrl` |
| `req.url` | URLを取得 | - | `string` | `req.url` |
| `req.method` | HTTPメソッドを取得 | - | `string` | `req.method` |
| `req.xhr` | XHRリクエストかチェック | - | `boolean` | `req.xhr` |

### 組み込みミドルウェア関数

#### ボディパーサーミドルウェア

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `express.json()` | JSONボディパーサー | `(options)` | `function` | `express.json()` |
| `express.urlencoded()` | URLエンコードボディパーサー | `(options)` | `function` | `express.urlencoded({extended: true})` |
| `express.raw()` | 生データパーサー | `(options)` | `function` | `express.raw()` |
| `express.text()` | テキストパーサー | `(options)` | `function` | `express.text()` |

#### 静的ファイル・セキュリティミドルウェア

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `express.static()` | 静的ファイル配信 | `(root, options)` | `function` | `express.static('public')` |
| `express.static()` | 静的ファイル配信（オプション付き） | `(root, options)` | `function` | `express.static('public', {maxAge: '1d'})` |

### エラーハンドリング関数

#### エラーハンドリングミドルウェア

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `app.use()` | エラーハンドリングミドルウェア | `(err, req, res, next)` | `Application` | `app.use((err, req, res, next) => {})` |
| `next()` | 次のミドルウェアに制御を渡す | `(error)` | `undefined` | `next(error)` |
| `next('route')` | 次のルートに制御を渡す | `('route')` | `undefined` | `next('route')` |

### テンプレートエンジン関数

#### ビューエンジン設定

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `app.engine()` | テンプレートエンジンを設定 | `(ext, callback)` | `Application` | `app.engine('html', engine)` |
| `app.set()` | ビューエンジンを設定 | `('view engine', engine)` | `Application` | `app.set('view engine', 'ejs')` |
| `app.set()` | ビューディレクトリを設定 | `('views', path)` | `Application` | `app.set('views', './views')` |

### セキュリティ関数

#### セキュリティ関連設定

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `app.disable()` | セキュリティ設定を無効化 | `(name)` | `Application` | `app.disable('x-powered-by')` |
| `app.enable()` | セキュリティ設定を有効化 | `(name)` | `Application` | `app.enable('trust proxy')` |
| `app.set()` | セキュリティ設定 | `(name, value)` | `Application` | `app.set('trust proxy', 1)` |

### アプリケーション情報関数

#### アプリケーション情報取得

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `app.locals` | ローカル変数を設定 | - | `object` | `app.locals.title = 'My App'` |
| `app.mountpath` | マウントパスを取得 | - | `string` | `app.mountpath` |
| `app.path()` | アプリケーションパスを取得 | `()` | `string` | `app.path()` |

### 開発・デバッグ関数

#### 開発支援関数

| 関数名 | 説明 | 引数 | 戻り値 | 例 |
|--------|------|------|--------|-----|
| `app.render()` | ビューをレンダリング | `(view, options, callback)` | `undefined` | `app.render('index', {data})` |
| `app.listen()` | サーバーを起動（詳細設定） | `(port, hostname, backlog, callback)` | `Server` | `app.listen(3000, 'localhost', 511, callback)` |

## よく使うパターン

### 基本的なルーティングパターン

```javascript
// 基本的なGETリクエスト
app.get('/users', (req, res) => {
  res.json({ users: [] });
});

// パラメータ付きルート
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ userId });
});

// クエリパラメータの使用
app.get('/search', (req, res) => {
  const query = req.query.q;
  res.json({ query });
});

// POSTリクエストでボディデータを取得
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  res.status(201).json({ name, email });
});
```

### ミドルウェアパターン

```javascript
// ログミドルウェア
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 認証ミドルウェア
app.use('/api', (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
```

## 関連リンク

- [[07-express-basics|Express.js入門]] - 基本的な概念と使用例
- [[Node.js/08-routing|ルーティング]] - 詳細なルーティング方法
- [[Node.js/09-middleware|ミドルウェア]] - ミドルウェアの詳細
- [[00-JavaScript index|JavaScript入門]] - JavaScriptの基本
- [[プログラミング基礎知識/02-APIの基礎|APIの基礎]] - APIの概念

---

**前の章**: [[07-express-basics|Express.js入門]]
**次の章**: [[Node.js/08-routing|ルーティング]] 