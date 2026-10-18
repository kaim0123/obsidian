# 第10章：DOM操作

## 📖 この章で学ぶこと

- DOMとは何か（DOM周辺の全体像）
- 要素の取得と操作
- イベント処理
- 実践的なDOM操作例

---

## 🌐 DOMとは？

DOM（Document Object Model）は、**HTML文書をプログラムから操作するための仕組み**です。

- HTMLの各要素を「オブジェクト」として扱う
- JavaScriptでHTML要素を取得・変更・追加・削除できる

---

## 🗺️ DOM周辺の全体像（初心者向け）

### DOM を一言で

**ブラウザが HTML を読んだあと、画面とプログラムのあいだに作る「設計図（ツリー状のモデル）」**です。

- HTML は「ファイルの文字」、DOM は「ブラウザの中でその文字を解釈した結果の、要素のつながり」
- この章で扱う **DOM API**（`document.querySelector` や `addEventListener` など）は、このモデルを JavaScript から触るための入り口

### ブラウザのながれ（ざっくり一本線）

1. **ネットワーク** … サーバーから HTML / CSS / JS / 画像などが届く
2. **HTML → DOM** … ブラウザが HTML を解析して **DOM ツリー**（要素が親子でつながった構造）を作る  
   - HTML と DOM はイコールではない。JavaScript で `createElement` などすると、**HTML ソースを書き換えなくても** DOM だけが変わることがある
3. **CSS → CSSOM** … CSS は別に解析され、**CSSOM**（どの要素にどんな見た目ルールが当たるかのモデル）になる
4. **DOM + CSSOM → レンダリング** … 組み合わせて「どこに何をどう描くか」が決まり、画面に描画される
5. **JavaScript** … **DOM API** で DOM を読んだり変えたりする。変更があれば、必要な部分だけ再計算・再描画される

DOM は **モデルのひとつ** で、その前後には **取得・解析・スタイル・描画・イベント** という流れがある。

### つまずきやすいポイント

| 誤解 | 実際 |
|------|------|
| HTML と DOM は常に同じ | 初期表示ではほぼ対応するが、JS で DOM だけ変えると「ソースの HTML」と内部表現がずれることがある |
| DOM を変えればファイル（サーバー上の HTML）も変わる | 変わるのはメモリ上のページ。保存されていない限り、サーバーの HTML はそのまま |
| DOM さえ分かればすべて分かる | 見た目は CSSOM、動きは JS とイベント、体感速度は再描画とも関係する |

### この章とのつながり

以下の節（要素の取得・操作・イベント・実践例）は、全体像の **「JavaScript が DOM を触る」** 部分にあたる。

覚えるときの3つ組：

- **DOM** … 構造（何がどこにあるか）
- **CSSOM + レンダリング** … 見た目（どう見えるか）
- **イベント** … 操作（クリックなどにどう反応するか）

### 超短いまとめ

**DOM = ブラウザがページを「オブジェクトの木」として持ち、JavaScript から触れる公式の入り口**である。その外側には HTML/CSS の解析、スタイルの組み合わせ、描画、ネットワークがあり、DOM はその中心のデータ構造のひとつ、と覚えると周辺がつながる。

---

## 📝 要素の取得

### getElementById
```javascript
let title = document.getElementById("main-title");
title.textContent = "新しいタイトル";
```

### getElementsByClassName
```javascript
let items = document.getElementsByClassName("item");
for (let item of items) {
    item.style.color = "red";
}
```

### querySelector / querySelectorAll
```javascript
let firstItem = document.querySelector(".item");
let allItems = document.querySelectorAll(".item");
allItems.forEach(function(item) {
    item.style.backgroundColor = "yellow";
});
```

---

## 🔧 要素の操作

### テキストやHTMLの変更
```javascript
let message = document.getElementById("message");
message.textContent = "こんにちは！";
message.innerHTML = "<strong>太字のテキスト</strong>";
```

### 属性の操作
```javascript
let link = document.getElementById("my-link");
link.href = "https://www.example.com";
link.setAttribute("target", "_blank");
```

### クラスの操作
```javascript
let box = document.getElementById("box");
box.classList.add("active");
box.classList.remove("hidden");
box.classList.toggle("highlight");
```

### 要素の追加・削除
```javascript
let list = document.getElementById("list");
let newItem = document.createElement("li");
newItem.textContent = "新しい項目";
list.appendChild(newItem);

// 削除
list.removeChild(list.firstElementChild);
```

---

## 🛎️ イベント処理

### イベントリスナーの追加
```javascript
let button = document.getElementById("my-button");
button.addEventListener("click", function() {
    alert("ボタンがクリックされました！");
});
```

### よく使うイベント
- click（クリック）
- mouseover（マウスオーバー）
- mouseout（マウスアウト）
- change（値の変更）
- input（入力）
- submit（フォーム送信）

### 実践例：入力値の取得
```javascript
let input = document.getElementById("user-input");
let display = document.getElementById("display");

input.addEventListener("input", function() {
    display.textContent = input.value;
});
```

---

## 💻 実践例

### 例1：カウンター
```html
<button id="count-up">カウントアップ</button>
<span id="count">0</span>
<script>
let count = 0;
let button = document.getElementById("count-up");
let countSpan = document.getElementById("count");

button.addEventListener("click", function() {
    count++;
    countSpan.textContent = count;
});
</script>
```

### 例2：リストの追加
```html
<input id="item-input" type="text">
<button id="add-item">追加</button>
<ul id="item-list"></ul>
<script>
let input = document.getElementById("item-input");
let button = document.getElementById("add-item");
let list = document.getElementById("item-list");

button.addEventListener("click", function() {
    let text = input.value;
    if (text) {
        let li = document.createElement("li");
        li.textContent = text;
        list.appendChild(li);
        input.value = "";
    }
});
</script>
```

### 例3：フォームのバリデーション
```html
<form id="my-form">
  <input id="name" type="text" required>
  <input id="age" type="number" required>
  <button type="submit">送信</button>
</form>
<div id="result"></div>
<script>
let form = document.getElementById("my-form");
let result = document.getElementById("result");

form.addEventListener("submit", function(event) {
    event.preventDefault();
    let name = document.getElementById("name").value;
    let age = document.getElementById("age").value;
    if (name && age) {
        result.textContent = `名前: ${name}, 年齢: ${age}`;
    } else {
        result.textContent = "すべての項目を入力してください";
    }
});
</script>
```

---

## ⚠️ よくある間違い

### 1. 要素の取得ミス
```javascript
let title = document.getElementById("main-title");
if (title) {
    title.textContent = "新しいタイトル";
} else {
    console.log("要素が見つかりません");
}
```

### 2. イベントリスナーの付け忘れ
```javascript
// 間違い
let btn = document.getElementById("btn");
// btn.onclick = function() { ... } // これでも良いが、addEventListener推奨

// 正しい
btn.addEventListener("click", function() {
    // ...
});
```

### 3. innerHTMLの使いすぎ
```javascript
// innerHTMLはXSSの危険があるので注意
let div = document.getElementById("content");
div.innerHTML = "<img src='x' onerror='alert(1)'>"; // 危険
```

---

## 🎯 DOM操作のコツ

### 1. 取得した要素がnullでないか確認
### 2. イベントリスナーはaddEventListenerで追加
### 3. innerHTMLよりtextContentを優先
### 4. できるだけクラスやIDで要素を取得

---

## 📝 練習問題

1. ボタンをクリックしたら「クリックされました」と表示するプログラムを作成してください
2. 入力欄に文字を入力すると、下にリアルタイムで表示されるプログラムを作成してください
3. リストに項目を追加・削除できるプログラムを作成してください

---

**前の章：** [[09-objects|第9章：オブジェクト]] | **次の章：** [[11-practice|第11章：実践練習]] 