# 第4章：演算子

## 📖 この章で学ぶこと

- 算術演算子
- 比較演算子
- 論理演算子
- 代入演算子
- その他の演算子

---

## ➕ 算術演算子

算術演算子は、**数値の計算を行うための演算子**です。

### 基本的な算術演算子
```javascript
let a = 10;
let b = 3;

// 加算
let sum = a + b;        // 13

// 減算
let difference = a - b; // 7

// 乗算
let product = a * b;    // 30

// 除算
let quotient = a / b;   // 3.333...

// 剰余（余り）
let remainder = a % b;  // 1

// べき乗
let power = a ** b;     // 1000

console.log("加算:", sum);
console.log("減算:", difference);
console.log("乗算:", product);
console.log("除算:", quotient);
console.log("剰余:", remainder);
console.log("べき乗:", power);
```

### インクリメント・デクリメント
```javascript
let count = 5;

// インクリメント（1増加）
count++; // count = count + 1
console.log(count); // 6

// デクリメント（1減少）
count--; // count = count - 1
console.log(count); // 5

// 前置と後置の違い
let x = 5;
let y = ++x; // 前置：先に増加してから代入
console.log(x, y); // 6, 6

let a = 5;
let b = a++; // 後置：代入してから増加
console.log(a, b); // 6, 5
```

---

## 🔍 比較演算子

比較演算子は、**値を比較して真偽値を返す演算子**です。

### 基本的な比較演算子
```javascript
let a = 10;
let b = 5;

// 等しい
let equal = a == b;        // false
let strictEqual = a === b; // false

// 等しくない
let notEqual = a != b;        // true
let strictNotEqual = a !== b; // true

// より大きい
let greater = a > b;  // true

// より小さい
let less = a < b;     // false

// 以上
let greaterEqual = a >= b; // true

// 以下
let lessEqual = a <= b;    // false

console.log("等しい:", equal);
console.log("厳密に等しい:", strictEqual);
console.log("等しくない:", notEqual);
console.log("厳密に等しくない:", strictNotEqual);
console.log("より大きい:", greater);
console.log("より小さい:", less);
console.log("以上:", greaterEqual);
console.log("以下:", lessEqual);
```

### == と === の違い
```javascript
// ==（等価演算子）
console.log(5 == "5");   // true（型変換あり）
console.log(0 == false); // true
console.log("" == 0);    // true

// ===（厳密等価演算子）
console.log(5 === "5");   // false（型変換なし）
console.log(0 === false); // false
console.log("" === 0);    // false

// 推奨：===を使用
let age = 25;
if (age === 25) {
    console.log("25歳です");
}
```

---

## 🧠 論理演算子

論理演算子は、**真偽値の論理演算を行う演算子**です。

### 基本的な論理演算子
```javascript
let isStudent = true;
let isWorking = false;
let age = 20;

// AND（&&）
let canWork = isStudent && isWorking; // false
let isAdult = age >= 20 && age < 65;  // true

// OR（||）
let hasIncome = isStudent || isWorking; // true
let canVote = age >= 18 || age >= 20;   // true

// NOT（!）
let isNotStudent = !isStudent; // false
let isNotWorking = !isWorking; // true

console.log("学生かつ働いている:", canWork);
console.log("成人:", isAdult);
console.log("収入がある:", hasIncome);
console.log("投票可能:", canVote);
console.log("学生ではない:", isNotStudent);
console.log("働いていない:", isNotWorking);
```

### 短絡評価
```javascript
// ANDの短絡評価
let result1 = false && console.log("実行されない");
let result2 = true && console.log("実行される");

// ORの短絡評価
let result3 = true || console.log("実行されない");
let result4 = false || console.log("実行される");

// 実用的な例
let user = null;
let userName = user && user.name; // userがnullならuserNameもnull
console.log(userName); // null

let defaultName = "ゲスト";
let displayName = userName || defaultName; // userNameがnullならdefaultNameを使用
console.log(displayName); // "ゲスト"
```

---

## 📝 代入演算子

代入演算子は、**変数に値を代入する演算子**です。

### 基本的な代入演算子
```javascript
let x = 10;

// 加算代入
x += 5; // x = x + 5
console.log(x); // 15

// 減算代入
x -= 3; // x = x - 3
console.log(x); // 12

// 乗算代入
x *= 2; // x = x * 2
console.log(x); // 24

// 除算代入
x /= 4; // x = x / 4
console.log(x); // 6

// 剰余代入
x %= 4; // x = x % 4
console.log(x); // 2

// べき乗代入
x **= 3; // x = x ** 3
console.log(x); // 8
```

### 複合代入演算子の例
```javascript
let count = 0;
let total = 0;

// カウントアップ
count += 1; // count++
total += 100; // 合計に100を追加

console.log("カウント:", count);
console.log("合計:", total);

// 文字列の結合
let message = "Hello";
message += " World"; // message = message + " World"
console.log(message); // "Hello World"
```

---

## 🔗 その他の演算子

### 文字列演算子
```javascript
// 文字列の結合
let firstName = "山田";
let lastName = "太郎";
let fullName = firstName + " " + lastName;
console.log(fullName); // "山田 太郎"

// テンプレートリテラル
let age = 25;
let greeting = `こんにちは、${fullName}さん。${age}歳ですね。`;
console.log(greeting); // "こんにちは、山田太郎さん。25歳ですね。"
```

### 条件（三項）演算子
```javascript
let age = 20;
let status = age >= 20 ? "成人" : "未成年";
console.log(status); // "成人"

// ネストした条件演算子
let score = 85;
let grade = score >= 90 ? "A" : 
           score >= 80 ? "B" : 
           score >= 70 ? "C" : "D";
console.log(grade); // "B"
```

### typeof演算子
```javascript
console.log(typeof "Hello");     // "string"
console.log(typeof 42);          // "number"
console.log(typeof true);        // "boolean"
console.log(typeof undefined);   // "undefined"
console.log(typeof null);        // "object"
console.log(typeof {});          // "object"
console.log(typeof []);          // "object"
console.log(typeof function(){}); // "function"
```

---

## 💻 実践例

### 例1：年齢チェックシステム
```javascript
let userAge = 18;
let hasPermission = true;

// 年齢と権限のチェック
let canAccess = userAge >= 18 && hasPermission;
let isMinor = userAge < 18;
let needsParentalConsent = userAge >= 13 && userAge < 18;

console.log("アクセス可能:", canAccess);
console.log("未成年:", isMinor);
console.log("親の同意が必要:", needsParentalConsent);

// メッセージの表示
let message = userAge >= 18 ? "アクセス許可" : "アクセス拒否";
console.log(message);
```

### 例2：商品価格計算
```javascript
let basePrice = 1000;
let quantity = 3;
let isPremium = true;
let discount = 0.1; // 10%

// 価格計算
let subtotal = basePrice * quantity;
let discountAmount = isPremium ? subtotal * discount : 0;
let total = subtotal - discountAmount;

console.log("基本価格:", basePrice + "円");
console.log("数量:", quantity + "個");
console.log("小計:", subtotal + "円");
console.log("プレミアム会員:", isPremium);
console.log("割引額:", discountAmount + "円");
console.log("合計:", total + "円");
```

### 例3：ユーザー認証
```javascript
let username = "user123";
let password = "password123";
let isLoggedIn = false;
let loginAttempts = 0;
let maxAttempts = 3;

// ログイン試行
let isValidUsername = username.length >= 5;
let isValidPassword = password.length >= 8;
let canLogin = isValidUsername && isValidPassword && loginAttempts < maxAttempts;

// ログイン処理
if (canLogin) {
    isLoggedIn = true;
    loginAttempts = 0;
    console.log("ログイン成功");
} else {
    loginAttempts++;
    console.log("ログイン失敗。試行回数:", loginAttempts);
}

// アカウントロックチェック
let isAccountLocked = loginAttempts >= maxAttempts;
console.log("アカウントロック:", isAccountLocked);
```

---

## ⚠️ よくある間違い

### 1. 比較演算子の間違い
```javascript
// 間違い
if (age = 20) { // 代入になってしまう
    console.log("20歳です");
}

// 正しい
if (age === 20) { // 比較
    console.log("20歳です");
}
```

### 2. 論理演算子の優先順位
```javascript
// 間違い
let result = true || false && true; // 予期しない結果

// 正しい
let result = true || (false && true); // 括弧で優先順位を明確化
```

### 3. 文字列と数値の比較
```javascript
// 間違い
let age = "25";
if (age > 20) { // 文字列比較になる可能性
    console.log("20歳以上です");
}

// 正しい
let age = "25";
if (Number(age) > 20) { // 数値に変換して比較
    console.log("20歳以上です");
}
```

---

## 🎯 演算子の使い方のコツ

### 1. 厳密等価演算子を使用
```javascript
// 良い例
if (age === 20) {
    console.log("20歳です");
}

// 悪い例
if (age == 20) {
    console.log("20歳です");
}
```

### 2. 短絡評価を活用
```javascript
// 良い例
let userName = user && user.name || "ゲスト";

// 悪い例
let userName;
if (user) {
    if (user.name) {
        userName = user.name;
    } else {
        userName = "ゲスト";
    }
} else {
    userName = "ゲスト";
}
```

### 3. 条件演算子の適切な使用
```javascript
// 良い例（シンプルな条件）
let status = age >= 20 ? "成人" : "未成年";

// 悪い例（複雑な条件）
let status = age >= 20 ? "成人" : age >= 13 ? "青年" : age >= 6 ? "児童" : "幼児";
```

---

## 📝 練習問題

1. 算術演算子を5つ挙げてください
2. 以下の条件をJavaScriptで表現してください：
   - 年齢が18歳以上かつ学生である
   - 年齢が65歳以上または学生である
   - 年齢が20歳未満または学生ではない
3. 以下の計算を行ってください：
   - 初期値：100
   - 5を加算
   - 3を乗算
   - 2で除算
   - 結果を表示

---

**前の章：** [[03-variables|第3章：変数とデータ型]] | **次の章：** [[05-conditions|第5章：条件分岐]] 