# DevToolsの開き方と基本

## DevTools（開発者ツール）とは
ブラウザに組み込まれた、Web開発のための強力なツール群です。HTMLの検証、CSSのデバッグ、JavaScriptのデバッグなどができます。

## DevToolsの開き方

### キーボードショートカット
- **Windows/Linux**: `F12` または `Ctrl + Shift + I`
- **Mac**: `Cmd + Option + I`

### 右クリックメニューから
1. ページ上で右クリック
2. 「検証」または「要素を調査」を選択

### ブラウザメニューから
- **Chrome**: メニュー > その他のツール > デベロッパーツール
- **Firefox**: メニュー > ウェブ開発 > 開発ツール

## 主要なパネル

### Elements（要素）
- HTMLの構造を確認・編集
- CSSスタイルの確認・変更
- リアルタイムでページを変更できる

### Console（コンソール）
- JavaScriptのエラーを確認
- コマンドを実行してテスト
- ログの出力を確認

### Sources（ソース）
- JavaScriptファイルを確認
- ブレークポイントを設定
- ステップ実行でデバッグ

### Network（ネットワーク）
- HTTP通信を監視
- API呼び出しの確認
- 読み込み時間の測定

### Application（アプリケーション）
- ローカルストレージ
- クッキー
- Service Worker

### Performance（パフォーマンス）
- ページの読み込み速度
- 処理のボトルネック特定

## 基本的な使い方

### 1. 要素の検査
1. DevToolsを開く
2. 左上の矢印アイコンをクリック
3. ページ上の要素を選択

### 2. CSSの変更
1. Elementsパネルで要素を選択
2. Stylesセクションで値を変更
3. リアルタイムで反映される

### 3. コンソールでJavaScript実行
```javascript
console.log('Hello, DevTools!');
document.querySelector('h1').textContent = '変更されました';
```

## よく使うショートカット

### 要素の選択
- `Ctrl + Shift + C` (Mac: `Cmd + Shift + C`)

### コンソールの表示/非表示
- `Esc`

### ファイル検索
- `Ctrl + P` (Mac: `Cmd + P`)

## 初心者へのアドバイス

1. **恐れずに触る**: DevToolsでの変更は一時的です
2. **Console.log を活用**: 変数の中身を確認する習慣をつける
3. **Networkタブで通信を確認**: APIの動きを理解する
4. **要素検査で学ぶ**: 他のサイトのHTMLやCSSを参考にできる
