# Network（通信の監視）

## Networkパネルとは
ブラウザが行うすべてのHTTP通信を監視・分析できるパネルです。API呼び出し、画像の読み込み、スクリプトの取得などを確認できます。

## 基本的な使い方

### 記録の開始/停止
- 赤い丸ボタン: 記録のオン/オフ
- リロードすると記録が開始される

### クリア
- 🚫 ボタンでログをクリア

### フィルター
- All: すべて
- Fetch/XHR: API呼び出し
- JS: JavaScriptファイル
- CSS: スタイルシート
- Img: 画像
- Media: 動画・音声
- Font: フォント
- Doc: HTMLドキュメント
- WS: WebSocket

## リクエストの確認

### 表示される情報

| 列名 | 説明 |
|------|------|
| Name | ファイル名・URL |
| Status | HTTPステータスコード |
| Type | ファイルの種類 |
| Initiator | リクエストの発生元 |
| Size | ファイルサイズ |
| Time | 読み込み時間 |
| Waterfall | タイムライン |

### ステータスコード

```
2xx: 成功
  200 OK - 正常
  201 Created - 作成成功
  204 No Content - 内容なし

3xx: リダイレクト
  301 Moved Permanently - 恒久的な移動
  302 Found - 一時的な移動
  304 Not Modified - 変更なし

4xx: クライアントエラー
  400 Bad Request - 不正なリクエスト
  401 Unauthorized - 認証が必要
  403 Forbidden - アクセス禁止
  404 Not Found - 見つからない

5xx: サーバーエラー
  500 Internal Server Error - サーバー内部エラー
  502 Bad Gateway - ゲートウェイエラー
  503 Service Unavailable - サービス利用不可
```

## リクエストの詳細

リクエストをクリックすると詳細が表示されます。

### Headers（ヘッダー）

#### General（一般情報）
- Request URL: リクエストURL
- Request Method: HTTPメソッド（GET, POST等）
- Status Code: ステータスコード

#### Response Headers（レスポンスヘッダー）
サーバーから返された情報
```
Content-Type: application/json
Content-Length: 1234
Set-Cookie: sessionId=abc123
```

#### Request Headers（リクエストヘッダー）
ブラウザが送信した情報
```
Accept: application/json
Authorization: Bearer token123
Content-Type: application/json
```

### Payload（ペイロード）

#### Query String Parameters（クエリパラメータ）
GETリクエストのパラメータ
```
?id=123&name=taro
```

#### Form Data（フォームデータ）
POSTリクエストのデータ
```
username: taro
password: ****
```

#### Request Payload（JSONデータ）
```json
{
  "name": "太郎",
  "age": 25
}
```

### Preview（プレビュー）
レスポンスの整形表示
- JSON: 構造化して表示
- 画像: 画像プレビュー
- HTML: レンダリング

### Response（レスポンス）
生のレスポンスデータ

### Timing（タイミング）
リクエストの各段階の時間
- Queueing: キューイング
- Stalled: 待機
- DNS Lookup: DNS解決
- Initial connection: 接続確立
- SSL: SSL/TLSネゴシエーション
- Request sent: リクエスト送信
- Waiting (TTFB): サーバー処理待ち
- Content Download: ダウンロード

## API呼び出しのデバッグ

### 1. リクエストの確認
```
Method: POST
URL: https://api.example.com/users
Status: 201 Created
```

### 2. 送信データの確認
```json
{
  "name": "太郎",
  "email": "taro@example.com"
}
```

### 3. レスポンスの確認
```json
{
  "id": 123,
  "name": "太郎",
  "email": "taro@example.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 4. エラーの確認
ステータスコードが4xxや5xxの場合
```json
{
  "error": "Email already exists",
  "code": "DUPLICATE_EMAIL"
}
```

## 便利な機能

### リクエストのコピー
右クリック > Copy
- Copy as cURL: cURLコマンドとしてコピー
- Copy as fetch: fetchコードとしてコピー
- Copy response: レスポンスをコピー

### リクエストの再送信
右クリック > Replay XHR

### HAR形式でエクスポート
右クリック > Save all as HAR
- 通信ログを保存
- パフォーマンス分析に使用

### スロットリング（通信速度の制限）
Slow 3G, Fast 3Gなどで低速回線をシミュレート

### オフラインモード
Offline にチェックでオフライン時の動作確認

## 実践例

### 1. API呼び出しが失敗する場合

#### 確認ポイント
1. **URL が正しいか**
   - スペルミス
   - プロトコル（http vs https）

2. **HTTPメソッドが正しいか**
   - GET, POST, PUT, DELETE

3. **ヘッダーが正しいか**
   - Content-Type
   - Authorization

4. **ボディが正しいか**
   - JSON形式
   - 必須フィールド

5. **ステータスコードの確認**
   - 400番台: リクエストの問題
   - 500番台: サーバーの問題

### 2. ページの読み込みが遅い場合

#### 確認ポイント
1. **大きなファイルがないか**
   - Sizeカラムをソート
   - 画像の最適化

2. **リクエスト数が多すぎないか**
   - ファイルの結合
   - 遅延読み込み

3. **Waiting時間が長いか**
   - サーバー処理の最適化
   - キャッシュの活用

### 3. CORSエラーの確認

エラーメッセージ
```
Access to fetch at 'https://api.example.com' from origin
'http://localhost:3000' has been blocked by CORS policy
```

#### 確認ポイント
- Response Headersに `Access-Control-Allow-Origin` があるか
- Preflight request（OPTIONSメソッド）が成功しているか

## パフォーマンス分析

### DOMContentLoaded
- HTMLの解析完了
- 青い線で表示

### Load
- すべてのリソース読み込み完了
- 赤い線で表示

### Waterfall（ウォーターフォール）
リクエストのタイムラインを視覚化
- 並列処理されているか
- ブロッキングがないか

## よくある問題と対処

### リクエストが表示されない
- Networkパネルを開いてからリロード
- 記録ボタンが有効か確認
- フィルターを確認

### CORSエラー
- サーバー側で `Access-Control-Allow-Origin` を設定
- プロキシを使用

### 404エラー
- URLのスペルミス
- ファイルパスの確認
- サーバーの設定

### 401/403エラー
- 認証トークンの確認
- 権限の確認
- トークンの有効期限

## ベストプラクティス

1. **開発中は常にNetworkパネルを開く**
   - API呼び出しの確認
   - エラーの早期発見

2. **本番環境でもチェック**
   - キャッシュの動作確認
   - CDNの動作確認

3. **パフォーマンス計測**
   - 定期的に計測
   - 改善点の洗い出し

4. **エラーログの保存**
   - HARファイルで保存
   - 問題の共有・報告に使用
