# 同期I/Oと非同期I/O

## I/Oとは
**Input / Output**の略で、プログラムが外部とデータをやり取りする操作です。
- ファイル読み書き
- ネットワーク通信
- 標準入出力
- データベースアクセス

I/Oは**CPU処理より圧倒的に遅い**（数千〜数百万倍）ので、どう待つかが性能を大きく左右します。

## 同期I/Oと非同期I/Oの違い

| 項目 | 同期I/O | 非同期I/O |
|---|---|---|
| 呼び出しの戻り | 完了してから戻る | すぐ戻る（結果は後で通知） |
| コード記述 | 直線的 | コールバック/Promise/await |
| スレッド | 待っている間占有 | 占有しない |
| スケール | スレッド数に依存 | 少ないスレッドで多数さばける |

## 同期I/Oの例
```python
data = open("file.txt").read()    # 読み終わるまで次に進まない
print(data)
```

```javascript
const data = fs.readFileSync("file.txt");
console.log(data);
```

### メリット
- **書きやすい・読みやすい**（上から順に流れる）
- デバッグが簡単

### デメリット
- **待っている間スレッドがブロック**
- 多数の同時I/Oにはスレッドが大量に必要
- UIが固まる、サーバーが詰まる

## 非同期I/Oの例

### コールバック
```javascript
fs.readFile("file.txt", (err, data) => {
  if (err) return handle(err);
  console.log(data);
});
```

### Promise
```javascript
fs.promises.readFile("file.txt")
  .then(data => console.log(data))
  .catch(err  => handle(err));
```

### async/await
```javascript
const data = await fs.promises.readFile("file.txt");
console.log(data);
```

### Python asyncio
```python
import aiofiles
async with aiofiles.open("file.txt") as f:
    data = await f.read()
```

### メリット
- **待ち時間に他の処理が進む**
- 少ないスレッド数で多数の接続を扱える
- UIがフリーズしない

### デメリット
- コードが複雑化しやすい
- 例外処理・キャンセルの考慮が必要
- CPUバウンドには効果なし

## スレッドによる「同期っぽい非同期」
Goのgoroutine、Java 21の仮想スレッドなどは**同期コードを書きつつ非同期の利点**を得られる。
```go
// 見た目は同期だが、goroutine内で並行実行
func handler(w http.ResponseWriter, r *http.Request) {
    data, err := db.Query("...")  // ブロックっぽく書ける
    w.Write(data)
}
```
ランタイムが裏でI/O待ちをノンブロッキング化してくれる。

## 同期/非同期の選択指針

### 同期I/Oで十分なケース
- スクリプト、CLIツール
- 少数のI/O
- コードの読みやすさ優先
- シンプルな業務ロジック

### 非同期I/Oが欲しいケース
- 高並行Webサーバー、APIサーバー
- ブラウザ側の通信
- リアルタイム（WebSocket, SSE）
- 大量の外部API呼び出し

## OSレベルのI/Oモデル

### ① ブロッキングI/O
`read()` が完了まで戻らない。一番単純。

### ② ノンブロッキングI/O
`read()` はすぐ戻るが、データがなければ「まだ」を返す。ポーリングが必要。

### ③ I/O多重化（select/poll/epoll/kqueue）
複数のFDをまとめて監視し、読める/書けるものを通知。高並行サーバーの基盤。

### ④ 非同期I/O（真のAIO）
OSにI/Oを依頼し、完了をシグナル/コールバックで受け取る。Linuxの `io_uring`、Windowsの IOCP。

多くの「非同期フレームワーク」は内部的に **epoll / kqueue / io_uring / IOCP** を使っている。

## イベントループの実装イメージ
```
while (running) {
  events = epoll_wait(...);       // 準備できたI/Oを取得
  for (ev of events) {
    callback = map[ev.fd];
    callback(ev);                 // I/Oに対応するコールバック実行
  }
}
```
1スレッドで数万接続を捌けるのはこの仕組み。

## 非同期I/Oと並行性
非同期I/Oは**並行性**を効率化する手段。CPU**並列性**とは別物。
- 非同期: I/O待ちの間に別タスク → スループット向上
- 並列: マルチコアで同時計算 → CPU処理時間短縮

両立させるには async + Worker Thread / multiprocessing。

## 非同期で注意すべき落とし穴

### 1. 同期関数が混ざる
```javascript
// ブロッキング同期関数を非同期コード内で呼ぶと、ループ全体が止まる
const data = fs.readFileSync("big.txt");
```

### 2. 無限同時実行
```javascript
await Promise.all(ids.map(fetchUser));   // ids が大量だと詰まる
```
同時実行数の制限が必要。

### 3. キャンセル忘れ
ユーザーがページ離脱した後も通信が続くケース。AbortControllerで解決。

### 4. バックプレッシャー
ストリーム処理で消費が遅いと、バッファがあふれる。

### 5. 例外の握りつぶし
Promise を catch し忘れると静かに消える。

## 同期API・非同期APIの混在

### 同期しか提供されていない重い処理
- **Worker Thread / 別プロセス**に逃がして、結果をメッセージで受け取る

### 非同期化できない処理を避ける
- ファイル丸読みでなくストリームで処理するなど設計を工夫

## 実例: 1万件のURLからデータ取得

### 同期（逐次）
```javascript
for (const url of urls) {
  const data = fetchSync(url);
}
// 1件1秒なら1万秒
```

### 非同期（並行、同時実行数制限あり）
```javascript
const limit = pLimit(50);
const results = await Promise.all(urls.map(u => limit(() => fetch(u))));
// 1件1秒でも200秒程度
```

## まとめ
- I/Oは遅い、**待ち方**が性能を決める
- **同期I/O**: 書きやすい、スレッドが占有される
- **非同期I/O**: 少スレッドで多数処理、書き方が複雑
- OSレベルでは epoll/kqueue/io_uring/IOCP が非同期の基盤
- 実務ではサーバー系はほぼ非同期、スクリプトは同期で十分なことも
