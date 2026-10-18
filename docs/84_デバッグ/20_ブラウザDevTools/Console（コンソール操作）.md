# Console（コンソール操作）

## Consoleパネルとは
JavaScriptのエラー確認、コードの実行、デバッグ情報の表示ができるパネルです。開発者にとって最も頻繁に使うツールの一つです。

## Consoleの開き方

### 単独で開く
- **Windows/Linux**: `Ctrl + Shift + J`
- **Mac**: `Cmd + Option + J`

### 他のパネルと一緒に表示
- `Esc` キーで下部にConsoleドロワーを表示

## 基本的な使い方

### JavaScriptの実行
Consoleに直接コードを入力して実行できます。

```javascript
// 計算
2 + 3  // 5

// 変数の定義
let name = "太郎";
console.log(name);  // "太郎"

// DOM操作
document.querySelector('h1').textContent = '変更しました';
```

### 複数行の入力
- `Shift + Enter` で改行
- 最後に `Enter` で実行

```javascript
function greet(name) {
  return `こんにちは、${name}さん！`;
}

greet('花子');  // "こんにちは、花子さん！"
```

## console.log の種類

### console.log()
通常のログ出力
```javascript
console.log('メッセージ');
console.log('値:', 42);
console.log({name: '太郎', age: 25});
```

### console.error()
エラーメッセージ（赤色で表示）
```javascript
console.error('エラーが発生しました');
```

### console.warn()
警告メッセージ（黄色で表示）
```javascript
console.warn('この機能は非推奨です');
```

### console.info()
情報メッセージ
```javascript
console.info('処理が完了しました');
```

### console.table()
配列やオブジェクトを表形式で表示
```javascript
const users = [
  {name: '太郎', age: 25},
  {name: '花子', age: 30}
];
console.table(users);
```

### console.group() / console.groupEnd()
ログをグループ化
```javascript
console.group('ユーザー情報');
console.log('名前: 太郎');
console.log('年齢: 25');
console.groupEnd();
```

### console.time() / console.timeEnd()
処理時間の計測
```javascript
console.time('処理時間');
// 何か重い処理
for(let i = 0; i < 1000000; i++) {}
console.timeEnd('処理時間');  // 処理時間: 5.234ms
```

## エラーの読み方

### 一般的なエラーメッセージ

#### Uncaught ReferenceError
変数が定義されていない
```javascript
console.log(unknownVariable);
// Uncaught ReferenceError: unknownVariable is not defined
```

#### Uncaught TypeError
型が正しくない
```javascript
null.toString();
// Uncaught TypeError: Cannot read property 'toString' of null
```

#### Uncaught SyntaxError
構文エラー
```javascript
let obj = {key 'value'};
// Uncaught SyntaxError: Unexpected string
```

### エラーの確認ポイント
1. **エラーメッセージ**: 何が問題か
2. **ファイル名と行番号**: どこで発生したか
3. **スタックトレース**: どの関数から呼ばれたか

## 便利な機能

### $0, $1, $2...
Elementsパネルで選択した要素を参照
```javascript
$0  // 最後に選択した要素
$1  // その前に選択した要素
```

### $()
document.querySelector() の短縮形
```javascript
$('h1')  // document.querySelector('h1')
```

### $$()
document.querySelectorAll() の短縮形
```javascript
$$('li')  // document.querySelectorAll('li')
```

### clear()
Consoleをクリア
```javascript
clear()
```

### copy()
値をクリップボードにコピー
```javascript
copy(document.title)  // ページタイトルをコピー
```

## フィルタリング

### ログレベルでフィルター
- デフォルト: すべて表示
- エラーのみ
- 警告のみ
- 情報のみ

### テキストでフィルター
検索ボックスでキーワードを入力

## デバッグのコツ

### 1. 変数の中身を確認
```javascript
const user = {name: '太郎', age: 25};
console.log('user:', user);
console.log('name:', user.name);
```

### 2. 条件分岐のチェック
```javascript
if (age >= 20) {
  console.log('成人です');
} else {
  console.log('未成年です');
}
```

### 3. ループの確認
```javascript
for (let i = 0; i < 5; i++) {
  console.log('i:', i);
}
```

### 4. API呼び出しの結果確認
```javascript
fetch('https://api.example.com/data')
  .then(res => res.json())
  .then(data => console.log('取得データ:', data))
  .catch(err => console.error('エラー:', err));
```

## 実践例

### オブジェクトの詳細確認
```javascript
const data = {
  user: {name: '太郎', age: 25},
  items: ['apple', 'banana', 'orange']
};

console.log('data:', data);
console.dir(data);  // 詳細表示
```

### 配列の中身を確認
```javascript
const numbers = [1, 2, 3, 4, 5];
console.table(numbers);
```

### パフォーマンス計測
```javascript
console.time('データ取得');
fetch('/api/data')
  .then(res => res.json())
  .then(data => {
    console.timeEnd('データ取得');
    console.log(data);
  });
```

## よく使うコマンド集

```javascript
// 現在のURLを確認
console.log(window.location.href);

// ローカルストレージを確認
console.log(localStorage);

// クッキーを確認
console.log(document.cookie);

// 画面サイズを確認
console.log(window.innerWidth, window.innerHeight);

// 選択した要素のスタイルを確認
console.log(getComputedStyle($0));
```

## 注意点

1. **本番環境では console.log を削除**
   - パフォーマンスに影響
   - セキュリティリスク

2. **センシティブな情報をログに出さない**
   - パスワード
   - トークン
   - 個人情報

3. **適切なログレベルを使う**
   - デバッグ: console.log
   - 警告: console.warn
   - エラー: console.error
