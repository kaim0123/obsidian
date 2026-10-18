# 第2章：開発環境の準備

## 📖 この章で学ぶこと

- 開発に必要なツール
- テキストエディタの設定
- ブラウザの開発者ツール
- 最初のプログラムの実行

---

## 🛠️ 開発に必要なツール

### 1. テキストエディタ
JavaScriptのコードを書くためのエディタが必要です。

#### 推奨エディタ
- **Visual Studio Code**（無料、最も人気）
- **Sublime Text**（軽量、高速）
- **Atom**（無料、カスタマイズ可能）
- **Notepad++**（Windows、軽量）

#### エディタの選び方
- 無料で使えるか
- 日本語対応しているか
- 拡張機能が豊富か
- 使いやすいか

### 2. Webブラウザ
JavaScriptを実行するためのブラウザが必要です。

#### 推奨ブラウザ
- **Google Chrome**（開発者ツールが優秀）
- **Mozilla Firefox**（開発者向け機能が豊富）
- **Microsoft Edge**（Windows標準）
- **Safari**（Mac標準）

---

## 📝 テキストエディタの設定

### Visual Studio Codeの設定

#### 1. インストール
1. [Visual Studio Code公式サイト](https://code.visualstudio.com/)にアクセス
2. ダウンロードしてインストール

#### 2. 推奨拡張機能
```javascript
// JavaScript開発に便利な拡張機能
- JavaScript (ES6) code snippets
- Live Server
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
```

#### 3. 基本設定
```json
// settings.json
{
    "editor.tabSize": 2,
    "editor.insertSpaces": true,
    "editor.wordWrap": "on",
    "files.autoSave": "afterDelay"
}
```

---

## 🔧 ブラウザの開発者ツール

### Chrome開発者ツールの使い方

#### 1. 開発者ツールを開く
- **F12キー**を押す
- **右クリック → 検証**を選択
- **Ctrl + Shift + I**（Windows）
- **Cmd + Option + I**（Mac）

#### 2. 主要なタブ
- **Elements**: HTMLとCSSの確認・編集
- **Console**: JavaScriptの実行・デバッグ
- **Sources**: JavaScriptファイルの確認・デバッグ
- **Network**: ネットワーク通信の確認
- **Application**: ストレージの確認

#### 3. Consoleタブの使い方
```javascript
// コンソールで直接JavaScriptを実行
console.log("Hello, World!");
alert("テスト");

// 変数の確認
let name = "太郎";
console.log(name);

// 計算の実行
let result = 10 + 5;
console.log(result);
```

---

## 💻 最初のプログラムの実行

### 手順1：ファイルの作成

#### HTMLファイル（index.html）
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JavaScript開発環境</title>
</head>
<body>
    <h1>JavaScript開発環境</h1>
    <p>開発者ツールのコンソールを確認してください。</p>
    
    <script src="script.js"></script>
</body>
</html>
```

#### JavaScriptファイル（script.js）
```javascript
// 最初のJavaScriptプログラム
console.log("開発環境の準備が完了しました！");

// 変数の定義
let message = "Hello, JavaScript!";
console.log(message);

// 簡単な計算
let a = 10;
let b = 5;
let sum = a + b;
console.log(`${a} + ${b} = ${sum}`);

// アラート表示
alert("JavaScriptの実行に成功しました！");
```

### 手順2：ファイルの保存
1. 適切なフォルダを作成
2. HTMLファイルとJavaScriptファイルを保存
3. ファイル名と拡張子を確認

### 手順3：ブラウザで実行
1. HTMLファイルをダブルクリック
2. ブラウザでページが開く
3. F12キーで開発者ツールを開く
4. Consoleタブで出力を確認

---

## 🎯 開発のベストプラクティス

### 1. ファイル構成
```
project/
├── index.html
├── script.js
├── style.css
└── images/
```

### 2. コーディング規約
```javascript
// 変数名は分かりやすく
let userName = "太郎";
let userAge = 25;

// 関数名は動詞から始める
function calculateSum(a, b) {
    return a + b;
}

// コメントを適切に書く
// ユーザーの年齢をチェックする関数
function checkAge(age) {
    if (age >= 20) {
        return "成人";
    } else {
        return "未成年";
    }
}
```

### 3. デバッグの基本
```javascript
// console.logでデバッグ
let value = 10;
console.log("変数の値:", value);

// 条件分岐のデバッグ
if (value > 5) {
    console.log("値は5より大きい");
} else {
    console.log("値は5以下");
}
```

---

## ⚠️ よくある問題と解決方法

### 1. ファイルが見つからない
```html
<!-- 間違い -->
<script src="script.js"></script> <!-- ファイルが存在しない -->

<!-- 正しい -->
<script src="./script.js"></script> <!-- 相対パスを指定 -->
```

### 2. 文字化け
```html
<!-- 間違い -->
<meta charset="UTF-8"> <!-- 文字エンコーディングが指定されていない -->

<!-- 正しい -->
<meta charset="UTF-8"> <!-- UTF-8を指定 -->
```

### 3. コンソールエラー
```javascript
// よくあるエラー
console.log("Hello"); // セミコロンがない
let name = "太郎" // セミコロンがない

// 正しい書き方
console.log("Hello");
let name = "太郎";
```

---

## 🎨 開発環境のカスタマイズ

### 1. テーマの変更
- ダークテーマ
- ライトテーマ
- カスタムテーマ

### 2. フォントの設定
```json
// settings.json
{
    "editor.fontFamily": "Consolas, 'Courier New', monospace",
    "editor.fontSize": 14,
    "editor.lineHeight": 1.5
}
```

### 3. 自動保存の設定
```json
// settings.json
{
    "files.autoSave": "afterDelay",
    "files.autoSaveDelay": 1000
}
```

---

## 📝 練習問題

1. 開発に必要なツールを3つ挙げてください
2. ブラウザの開発者ツールの主要なタブを3つ説明してください
3. 以下の内容でファイルを作成して実行してください：
   - HTMLファイル：「JavaScript開発環境」
   - JavaScriptファイル：変数`name`に自分の名前を代入してコンソールに表示
   - ブラウザで実行して開発者ツールで確認

---

**前の章：** [[01_programming/04_JavaScript基礎/01_JavaScript/01-basics|第1章：JavaScriptとは？]] | **次の章：** [[03-variables|第3章：変数とデータ型]] 