# 第9章：オブジェクト

## 📖 この章で学ぶこと

- オブジェクトの定義と使い方
- プロパティとメソッド
- オブジェクトの操作（追加・削除・検索）
- オブジェクトの活用例

---

## 🧩 オブジェクトとは？

オブジェクトは、**複数の値（プロパティ）や処理（メソッド）をまとめて管理できるデータ構造**です。

### オブジェクトの基本
```javascript
let person = {
    name: "太郎",
    age: 25,
    city: "東京"
};

console.log(person.name); // "太郎"
console.log(person["age"]); // 25
```

---

## 📝 オブジェクトの定義と使い方

### オブジェクトの作成
```javascript
let book = {
    title: "JavaScript入門",
    author: "山田太郎",
    price: 2000
};
```

### プロパティの追加・変更・削除
```javascript
let user = { name: "花子", age: 30 };
user.email = "hanako@example.com"; // 追加
user.age = 31; // 変更
delete user.name; // 削除
console.log(user);
```

### プロパティの存在確認
```javascript
let car = { brand: "トヨタ", model: "プリウス" };
console.log("brand" in car); // true
console.log(car.hasOwnProperty("model")); // true
```

---

## 🔧 メソッド（関数プロパティ）

### メソッドの定義
```javascript
let calculator = {
    add: function(a, b) {
        return a + b;
    },
    subtract: function(a, b) {
        return a - b;
    }
};

console.log(calculator.add(5, 3)); // 8
console.log(calculator.subtract(10, 4)); // 6
```

### thisキーワード
```javascript
let user = {
    name: "太郎",
    greet: function() {
        console.log("こんにちは、" + this.name + "さん！");
    }
};

user.greet(); // "こんにちは、太郎さん！"
```

---

## 🧰 オブジェクトの操作

### オブジェクトのループ
```javascript
let person = { name: "山田", age: 25, city: "東京" };
for (let key in person) {
    console.log(key + ": " + person[key]);
}
```

### オブジェクトのコピー
```javascript
let original = { a: 1, b: 2 };
let copy = { ...original };
copy.a = 100;
console.log(original); // { a: 1, b: 2 }
console.log(copy);     // { a: 100, b: 2 }
```

### オブジェクトのネスト
```javascript
let company = {
    name: "サンプル株式会社",
    address: {
        city: "東京",
        zip: "100-0001"
    },
    employees: [
        { name: "山田", age: 30 },
        { name: "佐藤", age: 28 }
    ]
};
console.log(company.address.city); // "東京"
console.log(company.employees[1].name); // "佐藤"
```

---

## 💻 実践例

### 例1：ユーザー管理システム
```javascript
let users = [
    { name: "山田", age: 25 },
    { name: "佐藤", age: 30 },
    { name: "田中", age: 22 }
];

for (let user of users) {
    console.log(user.name + "さん（" + user.age + "歳）");
}
```

### 例2：商品管理
```javascript
let products = [
    { name: "ノートパソコン", price: 80000 },
    { name: "スマートフォン", price: 60000 },
    { name: "タブレット", price: 40000 }
];

let total = 0;
for (let product of products) {
    total += product.price;
}
console.log("合計金額:", total);
```

### 例3：メソッドを持つオブジェクト
```javascript
let counter = {
    count: 0,
    increment: function() {
        this.count++;
        return this.count;
    },
    reset: function() {
        this.count = 0;
        return this.count;
    }
};

console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.reset());     // 0
```

---

## ⚠️ よくある間違い

### 1. プロパティ名の間違い
```javascript
let user = { name: "太郎" };
console.log(user.neme); // undefined（スペルミス）
```

### 2. thisの使い方
```javascript
let user = {
    name: "太郎",
    greet: () => {
        console.log("こんにちは、" + this.name + "さん！");
    }
};
user.greet(); // "こんにちは、undefinedさん！"（アロー関数のthisはグローバルを参照）

// 正しい
let user = {
    name: "太郎",
    greet: function() {
        console.log("こんにちは、" + this.name + "さん！");
    }
};
user.greet(); // "こんにちは、太郎さん！"
```

### 3. オブジェクトのコピー
```javascript
// 間違い（参照がコピーされる）
let a = { x: 1 };
let b = a;
b.x = 100;
console.log(a); // { x: 100 }

// 正しい（スプレッド構文でコピー）
let a = { x: 1 };
let b = { ...a };
b.x = 100;
console.log(a); // { x: 1 }
```

---

## 🎯 オブジェクトの使い方のコツ

### 1. プロパティ名は分かりやすく
```javascript
let user = { name: "太郎", age: 25 };
```

### 2. メソッドにはfunctionを使う
```javascript
let user = {
    name: "太郎",
    greet: function() {
        console.log("こんにちは、" + this.name + "さん！");
    }
};
```

### 3. ネストや配列と組み合わせる
```javascript
let company = {
    name: "サンプル株式会社",
    employees: [
        { name: "山田", age: 30 },
        { name: "佐藤", age: 28 }
    ]
};
```

---

## 📝 練習問題

1. オブジェクトで自分のプロフィール（名前・年齢・趣味）を作成してください
2. オブジェクトの配列を使って、3人のユーザー情報を管理し、全員の名前を表示してください
3. メソッドを持つオブジェクトを作成し、メソッドを呼び出してみてください

---

**前の章：** [[08-arrays|第8章：配列]] | **次の章：** [[10-dom|第10章：DOM操作]] 