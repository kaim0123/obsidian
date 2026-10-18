# 第5章：条件分岐

## 📖 この章で学ぶこと

- if文の基本
- else文とelse if文
- switch文
- 条件分岐の実践例

---

## 🔀 条件分岐とは？

条件分岐は、**条件に応じて異なる処理を実行するための制御構文**です。

### 条件分岐の基本概念
```javascript
let age = 20;

if (age >= 20) {
    console.log("成人です");
} else {
    console.log("未成年です");
}
```

---

## 📋 if文の基本

### 基本的なif文
```javascript
let score = 85;

if (score >= 80) {
    console.log("優秀です！");
}
```

### if文の構文
```javascript
if (条件) {
    // 条件が真の時に実行される処理
}
```

### 実践例
```javascript
let temperature = 25;

if (temperature > 30) {
    console.log("暑いですね");
}

if (temperature < 10) {
    console.log("寒いですね");
}

if (temperature >= 20 && temperature <= 30) {
    console.log("快適な気温ですね");
}
```

---

## 🔄 else文

### 基本的なif-else文
```javascript
let age = 18;

if (age >= 20) {
    console.log("成人です");
} else {
    console.log("未成年です");
}
```

### if-else文の構文
```javascript
if (条件) {
    // 条件が真の時に実行される処理
} else {
    // 条件が偽の時に実行される処理
}
```

### 実践例
```javascript
let isLoggedIn = true;

if (isLoggedIn) {
    console.log("ようこそ！");
} else {
    console.log("ログインしてください");
}

// 数値の比較
let number = 15;

if (number > 10) {
    console.log("10より大きい");
} else {
    console.log("10以下");
}
```

---

## 🔀 else if文

### 複数の条件分岐
```javascript
let score = 85;

if (score >= 90) {
    console.log("A評価");
} else if (score >= 80) {
    console.log("B評価");
} else if (score >= 70) {
    console.log("C評価");
} else {
    console.log("D評価");
}
```

### else if文の構文
```javascript
if (条件1) {
    // 条件1が真の時に実行される処理
} else if (条件2) {
    // 条件2が真の時に実行される処理
} else if (条件3) {
    // 条件3が真の時に実行される処理
} else {
    // すべての条件が偽の時に実行される処理
}
```

### 実践例
```javascript
let time = 14; // 14時

if (time < 12) {
    console.log("おはようございます");
} else if (time < 18) {
    console.log("こんにちは");
} else {
    console.log("こんばんは");
}

// 年齢による分類
let age = 25;

if (age < 13) {
    console.log("児童");
} else if (age < 20) {
    console.log("青年");
} else if (age < 65) {
    console.log("成人");
} else {
    console.log("高齢者");
}
```

---

## 🔀 switch文

### 基本的なswitch文
```javascript
let day = "月曜日";

switch (day) {
    case "月曜日":
        console.log("月曜日です");
        break;
    case "火曜日":
        console.log("火曜日です");
        break;
    case "水曜日":
        console.log("水曜日です");
        break;
    default:
        console.log("その他の曜日です");
}
```

### switch文の構文
```javascript
switch (式) {
    case 値1:
        // 式が値1と等しい時に実行される処理
        break;
    case 値2:
        // 式が値2と等しい時に実行される処理
        break;
    default:
        // どの値とも等しくない時に実行される処理
}
```

### 実践例
```javascript
let grade = "B";

switch (grade) {
    case "A":
        console.log("優秀");
        break;
    case "B":
        console.log("良好");
        break;
    case "C":
        console.log("普通");
        break;
    case "D":
        console.log("要努力");
        break;
    default:
        console.log("評価なし");
}

// 数値でのswitch文
let month = 3;

switch (month) {
    case 12:
    case 1:
    case 2:
        console.log("冬");
        break;
    case 3:
    case 4:
    case 5:
        console.log("春");
        break;
    case 6:
    case 7:
    case 8:
        console.log("夏");
        break;
    case 9:
    case 10:
    case 11:
        console.log("秋");
        break;
    default:
        console.log("無効な月");
}
```

---

## 💻 実践例

### 例1：ログインシステム
```javascript
let username = "user123";
let password = "password123";
let isLoggedIn = false;

if (username === "user123" && password === "password123") {
    isLoggedIn = true;
    console.log("ログイン成功");
} else {
    console.log("ユーザー名またはパスワードが間違っています");
}

if (isLoggedIn) {
    console.log("ようこそ、user123さん！");
} else {
    console.log("ログインしてください");
}
```

### 例2：商品価格計算
```javascript
let productType = "premium";
let quantity = 3;
let basePrice = 1000;
let totalPrice = 0;

if (productType === "premium") {
    totalPrice = basePrice * quantity * 1.2; // 20%増
    console.log("プレミアム商品です");
} else if (productType === "standard") {
    totalPrice = basePrice * quantity;
    console.log("標準商品です");
} else if (productType === "discount") {
    totalPrice = basePrice * quantity * 0.8; // 20%割引
    console.log("割引商品です");
} else {
    console.log("無効な商品タイプです");
}

if (totalPrice > 0) {
    console.log("合計価格:", totalPrice + "円");
}
```

### 例3：成績評価システム
```javascript
let score = 85;
let grade = "";

if (score >= 90) {
    grade = "A";
} else if (score >= 80) {
    grade = "B";
} else if (score >= 70) {
    grade = "C";
} else if (score >= 60) {
    grade = "D";
} else {
    grade = "F";
}

console.log("点数:", score);
console.log("評価:", grade);

// 評価に応じたメッセージ
switch (grade) {
    case "A":
        console.log("優秀です！");
        break;
    case "B":
        console.log("良好です");
        break;
    case "C":
        console.log("普通です");
        break;
    case "D":
        console.log("要努力です");
        break;
    case "F":
        console.log("再試験が必要です");
        break;
}
```

### 例4：時間帯による挨拶
```javascript
let hour = new Date().getHours(); // 現在の時間を取得

if (hour >= 5 && hour < 12) {
    console.log("おはようございます");
} else if (hour >= 12 && hour < 18) {
    console.log("こんにちは");
} else if (hour >= 18 && hour < 22) {
    console.log("こんばんは");
} else {
    console.log("おやすみなさい");
}

// 曜日による分岐
let dayOfWeek = new Date().getDay(); // 0=日曜日, 1=月曜日, ...

switch (dayOfWeek) {
    case 0:
        console.log("日曜日です");
        break;
    case 6:
        console.log("土曜日です");
        break;
    default:
        console.log("平日です");
}
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

### 2. 括弧の忘れ
```javascript
// 間違い
if age >= 20 { // 括弧がない
    console.log("成人です");
}

// 正しい
if (age >= 20) { // 括弧がある
    console.log("成人です");
}
```

### 3. break文の忘れ（switch文）
```javascript
// 間違い
switch (grade) {
    case "A":
        console.log("優秀");
        // breakがない
    case "B":
        console.log("良好");
        break;
}

// 正しい
switch (grade) {
    case "A":
        console.log("優秀");
        break;
    case "B":
        console.log("良好");
        break;
}
```

---

## 🎯 条件分岐の使い方のコツ

### 1. 条件を明確にする
```javascript
// 良い例
if (age >= 20 && age < 65) {
    console.log("働き盛り");
}

// 悪い例
if (age > 19 && age < 66) {
    console.log("働き盛り");
}
```

### 2. 適切な条件分岐を選択
```javascript
// 複数の値の比較にはswitch文
let day = "月曜日";
switch (day) {
    case "月曜日":
    case "火曜日":
    case "水曜日":
        console.log("平日");
        break;
    default:
        console.log("休日");
}

// 範囲の比較にはif文
let score = 85;
if (score >= 90) {
    console.log("A");
} else if (score >= 80) {
    console.log("B");
}
```

### 3. ネストを避ける
```javascript
// 悪い例（ネストが深い）
if (isLoggedIn) {
    if (hasPermission) {
        if (isAdmin) {
            console.log("管理者メニュー");
        } else {
            console.log("一般メニュー");
        }
    } else {
        console.log("権限がありません");
    }
} else {
    console.log("ログインしてください");
}

// 良い例（早期リターン）
if (!isLoggedIn) {
    console.log("ログインしてください");
    return;
}

if (!hasPermission) {
    console.log("権限がありません");
    return;
}

if (isAdmin) {
    console.log("管理者メニュー");
} else {
    console.log("一般メニュー");
}
```

---

## 📝 練習問題

1. if文、else文、else if文の違いを説明してください
2. 以下の条件分岐をJavaScriptで実装してください：
   - 年齢が18歳未満：「未成年」
   - 年齢が18歳以上20歳未満：「青年」
   - 年齢が20歳以上：「成人」
3. switch文を使って曜日を判定するプログラムを作成してください

---

**前の章：** [[04-operators|第4章：演算子]] | **次の章：** [[06-loops|第6章：繰り返し処理]] 