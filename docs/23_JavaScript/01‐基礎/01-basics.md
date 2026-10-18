# 第1章：JavaScriptとは？

## 📖 この章で学ぶこと

- JavaScriptの定義と役割
- JavaScriptの特徴
- JavaScriptの実行環境
- 最初のJavaScriptプログラム

---

## 🤔 JavaScriptとは？

**JavaScript**は、**Webページに動的な機能を追加するためのプログラミング言語**です。

### JavaScriptの役割

JavaScriptは以下のような役割を果たします：

- **Webページの動的な操作**
- **ユーザーとの対話機能**
- **データの処理と計算**
- **アニメーションの実装**

### プログラミング言語とは？

プログラミング言語は、**コンピュータに指示を出すための人工的な言語**です。

例：
```javascript
console.log("Hello, World!");
alert("こんにちは！");
```

---

## 🌐 JavaScriptの特徴

### 1. インタープリタ型言語
- コードを一行ずつ実行
- コンパイルが不要
- ブラウザで直接実行可能

### 2. 動的型付け言語
- 変数の型を自動で判断
- 柔軟なプログラミングが可能

### 3. オブジェクト指向言語
- オブジェクトベースのプログラミング
- 再利用可能なコードの作成

### 4. イベント駆動型
- ユーザーの操作に応じて実行
- インタラクティブな機能の実装

---

## 🖥️ JavaScriptの実行環境

### 1. Webブラウザ
- Chrome、Firefox、Safari、Edge
- HTMLファイルに組み込んで実行
- 最も一般的な実行環境

### 2. Node.js
- サーバーサイドでの実行
- コマンドラインでの実行
- ファイル操作やネットワーク処理

### 3. その他の環境
- モバイルアプリ（React Native、Ionic）
- デスクトップアプリ（Electron）
- ゲーム開発（Unity）

---

## 💻 最初のJavaScriptプログラム

### HTMLファイルにJavaScriptを組み込む

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JavaScript入門</title>
</head>
<body>
    <h1>JavaScript入門</h1>
    
    <script>
        // 最初のJavaScriptプログラム
        console.log("Hello, JavaScript!");
        alert("JavaScriptを学びましょう！");
    </script>
</body>
</html>
```

### 外部JavaScriptファイルの使用

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JavaScript入門</title>
</head>
<body>
    <h1>JavaScript入門</h1>
    
    <!-- 外部JavaScriptファイルを読み込み -->
    <script src="script.js"></script>
</body>
</html>
```

**script.js**
```javascript
// 外部JavaScriptファイル
console.log("外部ファイルから読み込まれました");
alert("外部ファイルの実行");
```

---

## 🔍 JavaScriptの基本構文

### 1. 文の終わり
```javascript
// セミコロンで文を終了
console.log("Hello");
alert("World");
```

### 2. コメント
```javascript
// 一行コメント

/*
複数行の
コメント
*/

// コードの説明
let name = "太郎"; // 名前を定義
```

### 3. 大文字・小文字の区別
```javascript
// 大文字・小文字は区別される
let Name = "太郎";
let name = "花子"; // 別の変数
```

---

## 🎯 JavaScriptでできること

### 1. ユーザーとの対話
```javascript
// アラート表示
alert("こんにちは！");

// 確認ダイアログ
let result = confirm("本当に削除しますか？");

// 入力ダイアログ
let name = prompt("お名前を入力してください：");
```

### 2. 計算処理
```javascript
// 基本的な計算
let sum = 10 + 5;
let product = 3 * 4;
let division = 15 / 3;

console.log("合計:", sum);
console.log("積:", product);
console.log("商:", division);
```

### 3. 文字列操作
```javascript
// 文字列の結合
let firstName = "太郎";
let lastName = "山田";
let fullName = firstName + " " + lastName;

console.log("フルネーム:", fullName);
```

---

## ⚠️ よくある間違い

### 1. セミコロンの忘れ
```javascript
// 間違い
console.log("Hello")
alert("World")

// 正しい
console.log("Hello");
alert("World");
```

### 2. 大文字・小文字の間違い
```javascript
// 間違い
Console.log("Hello");
Alert("World");

// 正しい
console.log("Hello");
alert("World");
```

### 3. 引用符の不適切な使用
```javascript
// 間違い
console.log('Hello"); // 引用符が一致していない

// 正しい
console.log("Hello");
console.log('Hello');
```

---

## 💡 重要なポイント

- JavaScriptは**プログラミング言語**です
- **ブラウザで実行**されることが多い
- **動的な機能**をWebページに追加できます
- **HTMLと組み合わせ**て使用します

---

## 📝 練習問題

1. JavaScriptの主な役割を3つ挙げてください
2. JavaScriptの特徴を2つ説明してください
3. 以下の内容でHTMLファイルを作成してください：
   - タイトル：「JavaScript入門」
   - 見出し：「JavaScriptを学びましょう」
   - JavaScriptで「Hello, JavaScript!」をアラート表示

---

**前の章：** [[00-JavaScript index|目次]] | **次の章：** [[01_programming/04_JavaScript基礎/01_JavaScript/02-setup|第2章：開発環境の準備]] 