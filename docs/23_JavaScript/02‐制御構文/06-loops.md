# 第6章：繰り返し処理

## 📖 この章で学ぶこと

- for文の基本
- while文とdo-while文
- for...of文とfor...in文
- 繰り返し処理の制御

---

## 🔄 繰り返し処理とは？

繰り返し処理は、**同じ処理を複数回実行するための制御構文**です。

### 繰り返し処理の基本概念
```javascript
// 1から5まで表示
for (let i = 1; i <= 5; i++) {
    console.log(i);
}
```

---

## 🔁 for文の基本

### 基本的なfor文
```javascript
for (let i = 0; i < 5; i++) {
    console.log("Hello " + i);
}
```

### for文の構文
```javascript
for (初期化; 条件; 更新) {
    // 繰り返し実行される処理
}
```

### 実践例
```javascript
// 1から10までの数字を表示
for (let i = 1; i <= 10; i++) {
    console.log(i);
}

// 10から1まで逆順で表示
for (let i = 10; i >= 1; i--) {
    console.log(i);
}

// 2ずつ増加（偶数を表示）
for (let i = 0; i <= 10; i += 2) {
    console.log(i);
}
```

---

## 🔄 while文

### 基本的なwhile文
```javascript
let count = 0;

while (count < 5) {
    console.log("カウント: " + count);
    count++;
}
```

### while文の構文
```javascript
while (条件) {
    // 条件が真の間、繰り返し実行される処理
}
```

### 実践例
```javascript
// 1から10までの合計を計算
let sum = 0;
let i = 1;

while (i <= 10) {
    sum += i;
    i++;
}

console.log("合計:", sum);

// パスワードの確認
let password = "";
let attempts = 0;

while (password !== "1234" && attempts < 3) {
    password = prompt("パスワードを入力してください:");
    attempts++;
    
    if (password !== "1234") {
        console.log("パスワードが間違っています");
    }
}

if (password === "1234") {
    console.log("ログイン成功");
} else {
    console.log("ログイン失敗");
}
```

---

## 🔄 do-while文

### 基本的なdo-while文
```javascript
let number = 0;

do {
    console.log("数字: " + number);
    number++;
} while (number < 5);
```

### do-while文の構文
```javascript
do {
    // 最低1回は実行される処理
} while (条件);
```

### 実践例
```javascript
// ユーザー入力の確認
let userInput;

do {
    userInput = prompt("1から10までの数字を入力してください:");
    userInput = parseInt(userInput);
} while (userInput < 1 || userInput > 10);

console.log("入力された数字:", userInput);

// メニュー選択
let choice;

do {
    choice = prompt("メニューを選択してください（1-3）:");
    choice = parseInt(choice);
} while (choice < 1 || choice > 3);

switch (choice) {
    case 1:
        console.log("メニュー1が選択されました");
        break;
    case 2:
        console.log("メニュー2が選択されました");
        break;
    case 3:
        console.log("メニュー3が選択されました");
        break;
}
```

---

## 🔄 for...of文

### 配列の繰り返し処理
```javascript
let fruits = ["りんご", "みかん", "バナナ", "ぶどう"];

for (let fruit of fruits) {
    console.log(fruit);
}
```

### 文字列の繰り返し処理
```javascript
let message = "Hello";

for (let char of message) {
    console.log(char);
}
```

### 実践例
```javascript
// 配列の合計を計算
let numbers = [1, 2, 3, 4, 5];
let sum = 0;

for (let number of numbers) {
    sum += number;
}

console.log("合計:", sum);

// 配列の要素を変換
let scores = [85, 92, 78, 96, 88];
let grades = [];

for (let score of scores) {
    if (score >= 90) {
        grades.push("A");
    } else if (score >= 80) {
        grades.push("B");
    } else if (score >= 70) {
        grades.push("C");
    } else {
        grades.push("D");
    }
}

console.log("成績:", grades);
```

---

## 🔄 for...in文

### オブジェクトのプロパティを繰り返し処理
```javascript
let person = {
    name: "太郎",
    age: 25,
    city: "東京"
};

for (let key in person) {
    console.log(key + ": " + person[key]);
}
```

### 配列のインデックスを繰り返し処理
```javascript
let colors = ["赤", "青", "緑"];

for (let index in colors) {
    console.log(index + ": " + colors[index]);
}
```

### 実践例
```javascript
// オブジェクトの情報を表示
let product = {
    name: "ノートパソコン",
    price: 80000,
    brand: "サンプル",
    inStock: true
};

for (let property in product) {
    console.log(property + ": " + product[property]);
}

// 配列の要素とインデックスを表示
let names = ["山田", "佐藤", "田中", "鈴木"];

for (let index in names) {
    console.log(`インデックス${index}: ${names[index]}`);
}
```

---

## 🛑 繰り返し処理の制御

### break文
```javascript
// 条件を満たしたら繰り返しを終了
for (let i = 1; i <= 10; i++) {
    if (i === 5) {
        break; // 5で繰り返しを終了
    }
    console.log(i);
}
```

### continue文
```javascript
// 条件を満たしたらその回をスキップ
for (let i = 1; i <= 10; i++) {
    if (i % 2 === 0) {
        continue; // 偶数をスキップ
    }
    console.log(i); // 奇数のみ表示
}
```

### 実践例
```javascript
// 特定の値を見つけたら終了
let numbers = [1, 3, 5, 7, 9, 2, 4, 6, 8, 10];
let target = 7;
let found = false;

for (let number of numbers) {
    if (number === target) {
        found = true;
        break;
    }
}

if (found) {
    console.log(target + "が見つかりました");
} else {
    console.log(target + "は見つかりませんでした");
}

// 特定の条件をスキップ
let scores = [85, 92, 78, 96, 88, 65, 100];
let highScores = [];

for (let score of scores) {
    if (score < 80) {
        continue; // 80点未満をスキップ
    }
    highScores.push(score);
}

console.log("高得点:", highScores);
```

---

## 💻 実践例

### 例1：九九の表
```javascript
// 九九の表を作成
for (let i = 1; i <= 9; i++) {
    for (let j = 1; j <= 9; j++) {
        console.log(`${i} × ${j} = ${i * j}`);
    }
    console.log("---"); // 区切り線
}
```

### 例2：配列の操作
```javascript
let students = [
    { name: "山田", score: 85 },
    { name: "佐藤", score: 92 },
    { name: "田中", score: 78 },
    { name: "鈴木", score: 96 }
];

// 平均点を計算
let totalScore = 0;
for (let student of students) {
    totalScore += student.score;
}

let average = totalScore / students.length;
console.log("平均点:", average);

// 最高点の学生を見つける
let highestScore = 0;
let topStudent = null;

for (let student of students) {
    if (student.score > highestScore) {
        highestScore = student.score;
        topStudent = student;
    }
}

console.log("最高点:", topStudent.name + "さん (" + topStudent.score + "点)");
```

### 例3：数当てゲーム
```javascript
let targetNumber = Math.floor(Math.random() * 100) + 1; // 1-100の乱数
let attempts = 0;
let maxAttempts = 10;

console.log("1から100までの数字を当ててください");

while (attempts < maxAttempts) {
    let guess = parseInt(prompt("数字を入力してください:"));
    attempts++;
    
    if (guess === targetNumber) {
        console.log(`正解です！${attempts}回で当てました`);
        break;
    } else if (guess < targetNumber) {
        console.log("もっと大きい数字です");
    } else {
        console.log("もっと小さい数字です");
    }
    
    if (attempts === maxAttempts) {
        console.log(`ゲームオーバー。正解は${targetNumber}でした`);
    }
}
```

### 例4：フィボナッチ数列
```javascript
let n = 10; // 生成する項数
let fibonacci = [0, 1]; // 最初の2項

for (let i = 2; i < n; i++) {
    fibonacci[i] = fibonacci[i-1] + fibonacci[i-2];
}

console.log("フィボナッチ数列:", fibonacci);

// 別の方法（while文）
let fib = [0, 1];
let i = 2;

while (fib.length < n) {
    fib.push(fib[i-1] + fib[i-2]);
    i++;
}

console.log("フィボナッチ数列（while文）:", fib);
```

---

## ⚠️ よくある間違い

### 1. 無限ループ
```javascript
// 間違い（無限ループ）
let i = 0;
while (i < 5) {
    console.log(i);
    // i++がない
}

// 正しい
let i = 0;
while (i < 5) {
    console.log(i);
    i++;
}
```

### 2. 条件の間違い
```javascript
// 間違い
for (let i = 0; i <= 5; i++) { // 0,1,2,3,4,5（6回実行）
    console.log(i);
}

// 正しい（5回実行したい場合）
for (let i = 0; i < 5; i++) { // 0,1,2,3,4（5回実行）
    console.log(i);
}
```

### 3. 配列のインデックスエラー
```javascript
// 間違い
let fruits = ["りんご", "みかん"];
for (let i = 0; i <= fruits.length; i++) { // インデックスエラー
    console.log(fruits[i]);
}

// 正しい
let fruits = ["りんご", "みかん"];
for (let i = 0; i < fruits.length; i++) {
    console.log(fruits[i]);
}
```

---

## 🎯 繰り返し処理の使い方のコツ

### 1. 適切な繰り返し文を選択
```javascript
// 回数が決まっている場合：for文
for (let i = 0; i < 10; i++) {
    console.log(i);
}

// 条件が決まっている場合：while文
let password = "";
while (password !== "1234") {
    password = prompt("パスワードを入力:");
}

// 配列の要素を処理：for...of文
let numbers = [1, 2, 3, 4, 5];
for (let number of numbers) {
    console.log(number);
}
```

### 2. パフォーマンスを考慮
```javascript
// 悪い例（配列の長さを毎回計算）
let numbers = [1, 2, 3, 4, 5];
for (let i = 0; i < numbers.length; i++) {
    console.log(numbers[i]);
}

// 良い例（配列の長さを変数に保存）
let numbers = [1, 2, 3, 4, 5];
let length = numbers.length;
for (let i = 0; i < length; i++) {
    console.log(numbers[i]);
}
```

### 3. ネストした繰り返しの注意
```javascript
// ネストした繰り返し
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        console.log(`i=${i}, j=${j}`);
    }
}

// 出力：
// i=0, j=0
// i=0, j=1
// i=0, j=2
// i=1, j=0
// i=1, j=1
// i=1, j=2
// i=2, j=0
// i=2, j=1
// i=2, j=2
```

---

## 📝 練習問題

1. for文、while文、do-while文の違いを説明してください
2. 1から100までの偶数の合計を計算するプログラムを作成してください
3. 配列`[1, 3, 5, 7, 9]`の要素を2倍にして新しい配列を作成してください
4. 数当てゲームを作成してください（1-50の範囲、最大5回の試行）

---

**前の章：** [[05-conditions|第5章：条件分岐]] | **次の章：** [[07-functions|第7章：関数]] 