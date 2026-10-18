# 第3章：変数とデータ型

## 📖 この章で学ぶこと

- 変数の定義と使い方
- データ型の種類
- 変数の命名規則
- **用語の整理（メソッド・プロパティなど）と、関数・オブジェクト別の命名の慣習**
- 定数の使い方

---

## 📦 変数とは？

変数は、**データを保存するための箱**のようなものです。

### 変数の基本概念
```javascript
// 変数の定義
let name = "太郎";
let age = 25;
let isStudent = true;

// 変数の使用
console.log(name); // "太郎"
console.log(age);  // 25
console.log(isStudent); // true
```

---

## 🔧 変数の定義方法

### 1. let（推奨）
```javascript
// letで変数を定義
let message = "Hello";
let count = 0;
let price = 1000;

// 値を変更可能
message = "Goodbye";
count = 10;
price = 1500;
```

### 2. const（定数）
```javascript
// constで定数を定義
const PI = 3.14159;
const COMPANY_NAME = "株式会社サンプル";
const MAX_SIZE = 100;

// 値を変更不可（エラーになる）
// PI = 3.14; // エラー
```

### 3. var（古い書き方）
```javascript
// varで変数を定義（非推奨）
var oldMessage = "古い書き方";
var oldCount = 5;

// 現在はletとconstを使用
```

---

## 📊 データ型の種類

### 1. 文字列（String）
```javascript
// 文字列の定義
let name = "太郎";
let message = 'こんにちは';
let address = `東京都渋谷区`; // テンプレートリテラル

// 文字列の操作
let firstName = "山田";
let lastName = "太郎";
let fullName = firstName + " " + lastName; // 文字列の結合
let greeting = `こんにちは、${fullName}さん`; // テンプレートリテラル

console.log(fullName); // "山田 太郎"
console.log(greeting); // "こんにちは、山田太郎さん"
```

### 2. 数値（Number）
```javascript
// 整数
let age = 25;
let count = 100;

// 小数
let price = 1000.50;
let pi = 3.14159;

// 負の数
let temperature = -5;
let balance = -1000;

// 計算
let sum = 10 + 5;      // 15
let product = 3 * 4;   // 12
let division = 15 / 3; // 5
let remainder = 7 % 3; // 1（余り）
```

### 3. 真偽値（Boolean）
```javascript
// true/false
let isStudent = true;
let isWorking = false;
let hasPermission = true;

// 比較結果
let isAdult = age >= 20; // true（ageが25の場合）
let isExpensive = price > 1000; // false（priceが1000.50の場合）
```

### 4. undefined
```javascript
// 未定義
let undefinedVariable;
console.log(undefinedVariable); // undefined

// 明示的にundefinedを代入
let emptyValue = undefined;
```

### 5. null
```javascript
// 空の値
let emptyObject = null;
let noValue = null;
```

### 6. オブジェクト（Object）
```javascript
// オブジェクトの定義
let person = {
    name: "太郎",
    age: 25,
    city: "東京"
};

// プロパティへのアクセス
console.log(person.name); // "太郎"
console.log(person.age);  // 25
```

### 7. 配列（Array）
```javascript
// 配列の定義
let fruits = ["りんご", "みかん", "バナナ"];
let numbers = [1, 2, 3, 4, 5];

// 要素へのアクセス
console.log(fruits[0]); // "りんご"
console.log(numbers[2]); // 3
```

---

## 🏷️ 変数の命名規則

### 1. 基本的なルール
```javascript
// 良い例
let userName = "太郎";
let userAge = 25;
let isActive = true;
let firstName = "山田";

// 悪い例
let user name = "太郎"; // スペースは使用不可
let 1name = "太郎";     // 数字で始まるのは不可
let let = "太郎";       // 予約語は使用不可
```

### 2. 命名規則
```javascript
// キャメルケース（推奨）
let userName = "太郎";
let firstName = "山田";
let isStudent = true;

// スネークケース
let user_name = "太郎";
let first_name = "山田";

// パスカルケース（クラス名など）
let UserName = "太郎"; // 通常は使用しない
```

### 3. 定数の命名
```javascript
// 定数は大文字とアンダースコア
const MAX_SIZE = 100;
const PI = 3.14159;
const COMPANY_NAME = "株式会社サンプル";
```

---

## 📚 用語の整理（メソッド・プロパティなど）

文法上は「変数名」と同じく**識別子**ですが、**置かれる場所**によって呼び方が変わります。

| 用語 | ざっくりした意味 |
|------|------------------|
| **関数（function）** | 処理をまとめたもの。`function foo() {}` のように単体で定義しても、オブジェクトの中に入れてもよい。 |
| **メソッド（method）** | **オブジェクトのプロパティとして入っている関数**のこと。`obj.greet()` の `greet` がメソッド。中身は普通の関数と同じ。 |
| **プロパティ（property）** | オブジェクトの「キーと値」の組。値がデータならデータプロパティ、値が関数なら（呼び方として）メソッド。 |
| **引数（ひきすう） / パラメータ** | 関数やメソッドに渡す値。教材によって「引数」と「パラメータ」を区別して説明することもありますが、実務では混ざって使われます。 |
| **戻り値（return value）** | `return` で返す結果。 |

```javascript
// 単体の関数（「グローバル関数」などと呼ばれることもある）
function sayHi() {
    return "Hi";
}

let user = {
    name: "太郎",
    // greet は user のメソッド（プロパティの値が関数）
    greet: function () {
        return "こんにちは、" + this.name;
    }
};
```

ブラウザや Node でも、`fetch` のような**単体の関数**と、`array.push` のような**オブジェクトにぶら下がったメソッド**が並びます。名前の付け方の基本は、どちらも次の節の**キャメルケース**が一般的です。詳しい定義は [[07-functions|第7章：関数]]・[[09-objects|第9章：オブジェクト]] も参照してください。

---

## 🎯 識別子の命名：関数・オブジェクト・クラスで違う？

**言語のルール**（使える文字・予約語など）は、変数・関数・オブジェクトのキーで**同じ**です。**チームやコミュニティの慣習**でスタイルが分かれます。多くの JavaScript の現場では次のように揃えます。

| 何に付ける名前か | よく使うスタイル | 例 |
|------------------|------------------|-----|
| 変数 | camelCase | `userName`, `itemCount` |
| 関数（単体定義） | camelCase | `calculateTotal`, `fetchUser` |
| オブジェクトのキー（プロパティ名） | 基本は camelCase | `{ firstName: "花子", isActive: true }` |
| オブジェクトのメソッド名 | camelCase | `{ getFullName() { ... } }` |
| クラス・コンストラクタ関数 | PascalCase | `class UserAccount { }` |
| 「本当に変わらない」設定値などの定数 | 多くは SCREAMING_SNAKE_CASE | `const API_BASE_URL = "..."` |
| オブジェクトは1つだけ export するモジュール | 慣習で default export 名が PascalCase になることも | `export default function App() { }`（React など） |

### オブジェクトのキーだけ特別？

**文法上は特別ではありません。** 文字列キーなら `snake_case` や `"kebab-case"` も書けます。

```javascript
// API の JSON が snake_case のまま受け取る、などはよくある
const row = { user_id: 1, created_at: "2024-01-01" };

// 自分のコード内のプロパティは camelCase に揃えることが多い
const user = { userId: 1, createdAt: "2024-01-01" };
```

**まとめ:** 変数・関数・メソッド・（自分で決める）オブジェクトのキーは、多くの場合 **camelCase で統一**。**型や「型のような役割」を表すもの**（クラス、古い書き方のコンストラクタ関数）だけ **PascalCase**、**不変の設定**は **SCREAMING_SNAKE_CASE**、という分け方が一般的です。

---

## 🔍 データ型の確認

### typeof演算子
```javascript
// データ型の確認
let name = "太郎";
let age = 25;
let isStudent = true;
let undefinedVar;

console.log(typeof name);        // "string"
console.log(typeof age);         // "number"
console.log(typeof isStudent);   // "boolean"
console.log(typeof undefinedVar); // "undefined"
console.log(typeof null);        // "object"（注意）
```

---

## 💻 実践例

### 例1：ユーザー情報の管理
```javascript
// ユーザー情報の変数
let userName = "山田太郎";
let userAge = 30;
let userEmail = "yamada@example.com";
let isPremium = true;
let joinDate = "2024-01-15";

// 情報の表示
console.log("ユーザー名:", userName);
console.log("年齢:", userAge);
console.log("メール:", userEmail);
console.log("プレミアム会員:", isPremium);
console.log("登録日:", joinDate);
```

### 例2：商品情報の管理
```javascript
// 商品情報
let productName = "ノートパソコン";
let productPrice = 80000;
let productStock = 15;
let isOnSale = false;
let categories = ["電化製品", "パソコン", "ノートPC"];

// 商品情報の表示
console.log("商品名:", productName);
console.log("価格:", productPrice + "円");
console.log("在庫:", productStock + "台");
console.log("セール中:", isOnSale);
console.log("カテゴリ:", categories.join(", "));
```

### 例3：計算処理
```javascript
// 計算に使用する変数
let price = 1000;
let tax = 0.1; // 10%
let quantity = 3;

// 計算
let subtotal = price * quantity;
let taxAmount = subtotal * tax;
let total = subtotal + taxAmount;

// 結果の表示
console.log("単価:", price + "円");
console.log("数量:", quantity + "個");
console.log("小計:", subtotal + "円");
console.log("税額:", taxAmount + "円");
console.log("合計:", total + "円");
```

---

## ⚠️ よくある間違い

### 1. 変数名の間違い
```javascript
// 間違い
let user name = "太郎"; // スペースは使用不可

// 正しい
let userName = "太郎";
```

### 2. データ型の混同
```javascript
// 間違い
let age = "25"; // 文字列として定義
let result = age + 5; // "255"になってしまう

// 正しい
let age = 25; // 数値として定義
let result = age + 5; // 30になる
```

### 3. 定数の再代入
```javascript
// 間違い
const PI = 3.14159;
PI = 3.14; // エラー

// 正しい
const PI = 3.14159;
// PIは変更しない
```

---

## 🎯 変数の使い方のコツ

### 1. 分かりやすい名前
```javascript
// 良い例
let userName = "太郎";
let userAge = 25;
let isLoggedIn = true;

// 悪い例
let u = "太郎";
let a = 25;
let flag = true;
```

### 2. 適切なデータ型
```javascript
// 良い例
let age = 25;           // 数値
let name = "太郎";      // 文字列
let isStudent = true;   // 真偽値

// 悪い例
let age = "25";         // 文字列（計算できない）
let name = 太郎;        // エラー（引用符がない）
```

### 3. 定数の活用
```javascript
// 変更しない値は定数にする
const MAX_USERS = 100;
const TAX_RATE = 0.1;
const COMPANY_NAME = "株式会社サンプル";
```

---

## 📝 練習問題

1. JavaScriptの主要なデータ型を5つ挙げてください
2. 以下の変数を適切なデータ型で定義してください：
   - ユーザー名（文字列）
   - 年齢（数値）
   - メールアドレス（文字列）
   - 会員かどうか（真偽値）
3. 以下の計算を行ってください：
   - 商品価格：1000円
   - 数量：3個
   - 税率：10%
   - 合計金額を計算して表示

---

**前の章：** [[01_programming/04_JavaScript基礎/01_JavaScript/02-setup|第2章：開発環境の準備]] | **次の章：** [[04-operators|第4章：演算子]] 