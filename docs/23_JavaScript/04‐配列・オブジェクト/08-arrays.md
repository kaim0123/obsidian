# 第8章：配列

## 📖 この章で学ぶこと

- 配列の定義と使い方
- 配列の操作（追加・削除・検索）
- 配列のメソッド（map, filter, reduce など）
- 多次元配列

---

## 📦 配列とは？

配列は、**複数の値をまとめて管理できるデータ構造**です。

### 配列の基本
```javascript
let fruits = ["りんご", "みかん", "バナナ"];
let numbers = [1, 2, 3, 4, 5];

console.log(fruits[0]); // "りんご"
console.log(numbers[2]); // 3
```

---

## 📝 配列の定義と使い方

### 配列の作成
```javascript
let emptyArray = [];
let colors = ["赤", "青", "緑"];
```

### 配列の要素数
```javascript
let numbers = [1, 2, 3, 4, 5];
console.log(numbers.length); // 5
```

### 配列の要素の変更
```javascript
let fruits = ["りんご", "みかん", "バナナ"];
fruits[1] = "ぶどう";
console.log(fruits); // ["りんご", "ぶどう", "バナナ"]
```

### 配列の要素の追加
```javascript
let animals = ["犬", "猫"];
animals.push("うさぎ"); // 末尾に追加
animals.unshift("鳥"); // 先頭に追加
console.log(animals); // ["鳥", "犬", "猫", "うさぎ"]
```

### 配列の要素の削除
```javascript
let numbers = [1, 2, 3, 4, 5];
numbers.pop(); // 末尾を削除
numbers.shift(); // 先頭を削除
console.log(numbers); // [2, 3, 4]
```

### 配列の要素の検索
```javascript
let colors = ["赤", "青", "緑"];
console.log(colors.indexOf("青")); // 1
console.log(colors.includes("緑")); // true
```

---

## 🔧 配列のメソッド

### forEach
```javascript
let numbers = [1, 2, 3];
numbers.forEach(function(num) {
    console.log(num);
});
```

### map
```javascript
let numbers = [1, 2, 3];
let doubled = numbers.map(function(num) {
    return num * 2;
});
console.log(doubled); // [2, 4, 6]
```

### filter
```javascript
let numbers = [1, 2, 3, 4, 5];
let evens = numbers.filter(function(num) {
    return num % 2 === 0;
});
console.log(evens); // [2, 4]
```

### reduce
```javascript
let numbers = [1, 2, 3, 4, 5];
let sum = numbers.reduce(function(total, num) {
    return total + num;
}, 0);
console.log(sum); // 15
```

### find
```javascript
let users = [
    { name: "太郎", age: 25 },
    { name: "花子", age: 30 },
    { name: "次郎", age: 20 }
];
let user = users.find(function(u) {
    return u.age === 30;
});
console.log(user); // { name: "花子", age: 30 }
```

---

## 🧩 多次元配列

### 2次元配列
```javascript
let matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];
console.log(matrix[1][2]); // 6
```

### 多次元配列の操作
```javascript
let table = [
    ["名前", "年齢"],
    ["山田", 25],
    ["佐藤", 30]
];
for (let row of table) {
    console.log(row.join(", "));
}
```

---

## 💻 実践例

### 例1：配列の合計と平均
```javascript
let scores = [80, 90, 75, 60, 85];
let sum = scores.reduce((total, score) => total + score, 0);
let average = sum / scores.length;
console.log("合計:", sum);
console.log("平均:", average);
```

### 例2：配列の最大値・最小値
```javascript
let numbers = [5, 8, 2, 9, 3];
let max = Math.max(...numbers);
let min = Math.min(...numbers);
console.log("最大値:", max);
console.log("最小値:", min);
```

### 例3：配列の並び替え
```javascript
let numbers = [5, 2, 8, 1, 9];
numbers.sort((a, b) => a - b); // 昇順
console.log(numbers); // [1, 2, 5, 8, 9]

numbers.sort((a, b) => b - a); // 降順
console.log(numbers); // [9, 8, 5, 2, 1]
```

### 例4：配列の重複を削除
```javascript
let items = ["りんご", "みかん", "りんご", "バナナ"];
let uniqueItems = [...new Set(items)];
console.log(uniqueItems); // ["りんご", "みかん", "バナナ"]
```

---

## ⚠️ よくある間違い

### 1. インデックスエラー
```javascript
let fruits = ["りんご", "みかん"];
console.log(fruits[2]); // undefined（存在しない要素）
```

### 2. 配列のコピー
```javascript
// 間違い（参照がコピーされる）
let a = [1, 2, 3];
let b = a;
b[0] = 100;
console.log(a); // [100, 2, 3]

// 正しい（スプレッド構文でコピー）
let a = [1, 2, 3];
let b = [...a];
b[0] = 100;
console.log(a); // [1, 2, 3]
```

### 3. 配列の長さの間違い
```javascript
let arr = [1, 2, 3];
for (let i = 0; i <= arr.length; i++) { // 間違い
    console.log(arr[i]);
}

for (let i = 0; i < arr.length; i++) { // 正しい
    console.log(arr[i]);
}
```

---

## 🎯 配列の使い方のコツ

### 1. 配列メソッドを活用
```javascript
let numbers = [1, 2, 3, 4, 5];
let squares = numbers.map(n => n * n);
console.log(squares); // [1, 4, 9, 16, 25]
```

### 2. スプレッド構文
```javascript
let arr1 = [1, 2, 3];
let arr2 = [4, 5, 6];
let merged = [...arr1, ...arr2];
console.log(merged); // [1, 2, 3, 4, 5, 6]
```

### 3. 分割代入
```javascript
let [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1 2 3
```

---

## 📝 練習問題

1. 配列の要素を3つ作成して表示してください
2. 配列の合計と平均を計算するプログラムを作成してください
3. 配列の偶数のみを抽出するプログラムを作成してください
4. 2次元配列を使って表を作成し、各行を表示してください

---

**前の章：** [[07-functions|第7章：関数]] | **次の章：** [[09-objects|第9章：オブジェクト]] 