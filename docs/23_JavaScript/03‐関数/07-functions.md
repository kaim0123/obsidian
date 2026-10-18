# 第7章：関数

## 📖 この章で学ぶこと

- 関数の定義と呼び出し
- パラメータと戻り値
- 関数式とアロー関数
- スコープとクロージャ

---

## 🔧 関数とは？

関数は、**特定の処理をまとめて、何度でも呼び出せるようにしたもの**です。

### 関数の基本概念
```javascript
// 関数の定義
function greet() {
    console.log("こんにちは！");
}

// 関数の呼び出し
greet(); // "こんにちは！"
```

---

## 📝 関数の定義と呼び出し

### 基本的な関数定義
```javascript
function sayHello() {
    console.log("Hello, World!");
}

// 関数の呼び出し
sayHello();
```

### 関数定義の構文
```javascript
function 関数名() {
    // 実行したい処理
}
```

### 実践例
```javascript
// 挨拶の関数
function greet() {
    console.log("おはようございます");
    console.log("こんにちは");
    console.log("こんばんは");
}

// 複数回呼び出し
greet();
greet();
greet();

// 計算の関数
function calculateArea() {
    let width = 10;
    let height = 5;
    let area = width * height;
    console.log("面積:", area);
}

calculateArea();
```

---

## 📤 パラメータ（引数）

### パラメータ付きの関数
```javascript
function greet(name) {
    console.log("こんにちは、" + name + "さん！");
}

// パラメータを渡して呼び出し
greet("太郎"); // "こんにちは、太郎さん！"
greet("花子"); // "こんにちは、花子さん！"
```

### 複数のパラメータ
```javascript
function add(a, b) {
    let result = a + b;
    console.log(a + " + " + b + " = " + result);
}

add(5, 3);  // "5 + 3 = 8"
add(10, 20); // "10 + 20 = 30"
```

### 実践例
```javascript
// 長方形の面積を計算
function calculateRectangleArea(width, height) {
    let area = width * height;
    console.log("幅:", width);
    console.log("高さ:", height);
    console.log("面積:", area);
}

calculateRectangleArea(10, 5); // 幅: 10, 高さ: 5, 面積: 50

// 年齢チェック
function checkAge(name, age) {
    if (age >= 20) {
        console.log(name + "さんは成人です");
    } else {
        console.log(name + "さんは未成年です");
    }
}

checkAge("太郎", 25); // "太郎さんは成人です"
checkAge("花子", 18); // "花子さんは未成年です"
```

---

## 📥 戻り値（return）

### 戻り値のある関数
```javascript
function add(a, b) {
    return a + b;
}

let result = add(5, 3);
console.log(result); // 8
```

### return文の使い方
```javascript
function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        return "エラー：0で割ることはできません";
    }
    return a / b;
}

let product = multiply(4, 5);
let quotient = divide(10, 2);
let error = divide(10, 0);

console.log(product); // 20
console.log(quotient); // 5
console.log(error); // "エラー：0で割ることはできません"
```

### 実践例
```javascript
// 円の面積を計算
function calculateCircleArea(radius) {
    const PI = 3.14159;
    return PI * radius * radius;
}

let area = calculateCircleArea(5);
console.log("円の面積:", area);

// 成績評価
function getGrade(score) {
    if (score >= 90) {
        return "A";
    } else if (score >= 80) {
        return "B";
    } else if (score >= 70) {
        return "C";
    } else if (score >= 60) {
        return "D";
    } else {
        return "F";
    }
}

let grade = getGrade(85);
console.log("成績:", grade); // "B"
```

---

## 🔄 関数式

### 関数式の定義
```javascript
// 関数式
let greet = function(name) {
    console.log("こんにちは、" + name + "さん！");
};

// 呼び出し
greet("太郎");

// 即座実行関数
(function() {
    console.log("即座に実行されました");
})();
```

### 実践例
```javascript
// 計算関数を関数式で定義
let add = function(a, b) {
    return a + b;
};

let subtract = function(a, b) {
    return a - b;
};

let multiply = function(a, b) {
    return a * b;
};

// 関数の配列
let operations = [add, subtract, multiply];

// 配列の関数を順番に実行
let a = 10;
let b = 3;

for (let operation of operations) {
    let result = operation(a, b);
    console.log("結果:", result);
}
```

---

## ➡️ アロー関数

### アロー関数の基本
```javascript
// 従来の関数
function add(a, b) {
    return a + b;
}

// アロー関数
let add = (a, b) => {
    return a + b;
};

// より短い書き方（1行の場合）
let add = (a, b) => a + b;
```

### アロー関数の構文
```javascript
// パラメータが1つの場合
let greet = name => console.log("こんにちは、" + name + "さん！");

// パラメータがない場合
let sayHello = () => console.log("Hello!");

// 複数のパラメータ
let multiply = (a, b) => a * b;

// 複数行の処理
let calculate = (a, b) => {
    let sum = a + b;
    let product = a * b;
    return { sum, product };
};
```

### 実践例
```javascript
// 配列の処理でアロー関数を使用
let numbers = [1, 2, 3, 4, 5];

// 各要素を2倍にする
let doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// 偶数のみをフィルタリング
let evens = numbers.filter(num => num % 2 === 0);
console.log(evens); // [2, 4]

// 合計を計算
let sum = numbers.reduce((total, num) => total + num, 0);
console.log(sum); // 15

// オブジェクトの配列を処理
let students = [
    { name: "太郎", score: 85 },
    { name: "花子", score: 92 },
    { name: "次郎", score: 78 }
];

// 高得点の学生をフィルタリング
let highScorers = students.filter(student => student.score >= 80);
console.log(highScorers);

// 名前の配列を作成
let names = students.map(student => student.name);
console.log(names); // ["太郎", "花子", "次郎"]
```

---

## 🎯 デフォルトパラメータ

### デフォルト値の設定
```javascript
function greet(name = "ゲスト") {
    console.log("こんにちは、" + name + "さん！");
}

greet("太郎"); // "こんにちは、太郎さん！"
greet();       // "こんにちは、ゲストさん！"

// 複数のデフォルトパラメータ
function createUser(name = "ゲスト", age = 20, city = "東京") {
    console.log("名前:", name);
    console.log("年齢:", age);
    console.log("都市:", city);
}

createUser("太郎", 25, "大阪");
createUser("花子", 30);
createUser();
```

---

## 🔍 スコープ

### 変数のスコープ
```javascript
let globalVar = "グローバル変数";

function testScope() {
    let localVar = "ローカル変数";
    console.log(globalVar); // アクセス可能
    console.log(localVar);  // アクセス可能
}

testScope();
console.log(globalVar); // アクセス可能
// console.log(localVar); // エラー：アクセス不可
```

### 実践例
```javascript
let counter = 0; // グローバル変数

function increment() {
    let localCounter = 0; // ローカル変数
    counter++;
    localCounter++;
    console.log("グローバルカウンター:", counter);
    console.log("ローカルカウンター:", localCounter);
}

increment(); // グローバル: 1, ローカル: 1
increment(); // グローバル: 2, ローカル: 1
increment(); // グローバル: 3, ローカル: 1
```

---

## 🔒 クロージャ

### クロージャの基本
```javascript
function createCounter() {
    let count = 0;
    
    return function() {
        count++;
        return count;
    };
}

let counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

### 実践例
```javascript
// プライベート変数を持つ関数
function createBankAccount(initialBalance) {
    let balance = initialBalance;
    
    return {
        getBalance: function() {
            return balance;
        },
        deposit: function(amount) {
            balance += amount;
            return balance;
        },
        withdraw: function(amount) {
            if (amount <= balance) {
                balance -= amount;
                return balance;
            } else {
                return "残高不足";
            }
        }
    };
}

let account = createBankAccount(1000);
console.log(account.getBalance()); // 1000
console.log(account.deposit(500)); // 1500
console.log(account.withdraw(200)); // 1300
console.log(account.withdraw(2000)); // "残高不足"
```

---

## 💻 実践例

### 例1：計算機
```javascript
function calculator(operation, a, b) {
    switch (operation) {
        case "add":
            return a + b;
        case "subtract":
            return a - b;
        case "multiply":
            return a * b;
        case "divide":
            if (b === 0) {
                return "エラー：0で割ることはできません";
            }
            return a / b;
        default:
            return "無効な演算";
    }
}

console.log(calculator("add", 10, 5));      // 15
console.log(calculator("subtract", 10, 5)); // 5
console.log(calculator("multiply", 10, 5)); // 50
console.log(calculator("divide", 10, 5));   // 2
console.log(calculator("divide", 10, 0));   // "エラー：0で割ることはできません"
```

### 例2：配列操作関数
```javascript
// 配列の平均を計算
function calculateAverage(numbers) {
    if (numbers.length === 0) {
        return 0;
    }
    
    let sum = 0;
    for (let number of numbers) {
        sum += number;
    }
    return sum / numbers.length;
}

// 配列の最大値を取得
function findMax(numbers) {
    if (numbers.length === 0) {
        return null;
    }
    
    let max = numbers[0];
    for (let number of numbers) {
        if (number > max) {
            max = number;
        }
    }
    return max;
}

// 配列の最小値を取得
function findMin(numbers) {
    if (numbers.length === 0) {
        return null;
    }
    
    let min = numbers[0];
    for (let number of numbers) {
        if (number < min) {
            min = number;
        }
    }
    return min;
}

let scores = [85, 92, 78, 96, 88];
console.log("平均:", calculateAverage(scores));
console.log("最高点:", findMax(scores));
console.log("最低点:", findMin(scores));
```

### 例3：文字列操作関数
```javascript
// 文字列を逆順にする
function reverseString(str) {
    let reversed = "";
    for (let i = str.length - 1; i >= 0; i--) {
        reversed += str[i];
    }
    return reversed;
}

// 文字列が回文かどうかチェック
function isPalindrome(str) {
    let cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
    return cleaned === reverseString(cleaned);
}

// 文字列の単語数をカウント
function countWords(str) {
    if (str.trim() === "") {
        return 0;
    }
    return str.trim().split(/\s+/).length;
}

console.log(reverseString("Hello")); // "olleH"
console.log(isPalindrome("racecar")); // true
console.log(isPalindrome("hello")); // false
console.log(countWords("Hello world")); // 2
console.log(countWords("  Hello   world  ")); // 2
```

---

## ⚠️ よくある間違い

### 1. 関数名の間違い
```javascript
// 間違い
function greet() {
    console.log("Hello");
}
greet(); // 正しい
greet;   // 関数を呼び出していない

// 正しい
function greet() {
    console.log("Hello");
}
greet(); // 関数を呼び出している
```

### 2. パラメータの順序
```javascript
// 間違い
function divide(a, b) {
    return a / b;
}
console.log(divide(10)); // NaN（bがundefined）

// 正しい
function divide(a, b = 1) { // デフォルト値を設定
    return a / b;
}
console.log(divide(10)); // 10
```

### 3. スコープの理解不足
```javascript
// 間違い
function test() {
    let x = 10;
}
console.log(x); // エラー：xは定義されていない

// 正しい
let x = 10;
function test() {
    console.log(x); // グローバル変数にアクセス可能
}
test();
```

---

## 🎯 関数の使い方のコツ

### 1. 関数名は動詞から始める
```javascript
// 良い例
function calculateArea() { }
function getUserData() { }
function validateInput() { }

// 悪い例
function area() { }
function userData() { }
function input() { }
```

### 2. 単一責任の原則
```javascript
// 良い例（1つの関数に1つの責任）
function calculateArea(width, height) {
    return width * height;
}

function displayArea(area) {
    console.log("面積:", area);
}

// 悪い例（複数の責任）
function calculateAndDisplayArea(width, height) {
    let area = width * height;
    console.log("面積:", area);
    return area;
}
```

### 3. 適切なパラメータ数
```javascript
// 良い例（パラメータが少ない）
function createUser(name, email) {
    return { name, email };
}

// 悪い例（パラメータが多い）
function createUser(name, email, age, city, country, phone, address) {
    return { name, email, age, city, country, phone, address };
}

// 改善例（オブジェクトを使用）
function createUser(userData) {
    return userData;
}
```

---

## 📝 練習問題

1. 関数の定義方法を3つ説明してください
2. 以下の関数を作成してください：
   - 2つの数値を受け取り、その積を返す関数
   - 文字列を受け取り、その長さを返す関数
   - 配列を受け取り、その合計を返す関数
3. アロー関数を使って、配列`[1, 2, 3, 4, 5]`の各要素を2倍にする処理を書いてください

---

**前の章：** [[06-loops|第6章：繰り返し処理]] | **次の章：** [[08-arrays|第8章：配列]] 