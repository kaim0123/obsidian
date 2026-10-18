# 08. ブラウザJavaScript：DOMとイベント

---

## この章で学ぶこと

- DOMの基本（要素の取得・操作）
- イベント処理（click / input / submit）
- フォームバリデーション
- 状態→描画の設計パターン
- よくある罠（再描画、イベント多重登録）
- ブラウザの保存機能（localStorage等）
- 開発者ツール（DevTools）の使い方
- CORS の基本理解

---

## 08-1. DOMの基本（querySelector / 要素操作）

### DOM とは

DOM（Document Object Model）は、HTMLをJavaScriptから操作するための仕組みです。HTMLの各要素が「オブジェクト」として扱えます。

```html
<div id="app">
  <h1 class="title">Hello</h1>
  <p>World</p>
</div>
```

このHTMLは、JavaScriptからはツリー構造のオブジェクトとして見えます。

### 要素の取得

```javascript
// IDで取得（1つだけ）
const app = document.getElementById("app");

// CSSセレクタで取得（最初の1つ）
const title = document.querySelector(".title");
const firstP = document.querySelector("p");

// CSSセレクタで複数取得（NodeList）
const allP = document.querySelectorAll("p");
allP.forEach(p => console.log(p.textContent));
```

> **`querySelector` / `querySelectorAll` を使うのが現代的**。CSSセレクタと同じ書き方で要素を指定できます。

### 要素の内容を変更

```javascript
const title = document.querySelector(".title");

// テキストを変更
title.textContent = "新しいタイトル";

// HTMLを変更（⚠️ XSS注意）
title.innerHTML = "<em>強調</em>タイトル";

// textContent vs innerHTML
// textContent: テキストとして扱う（安全）
// innerHTML: HTMLとして解釈する（ユーザー入力を入れるとXSSの危険）
```

### 要素のスタイルを変更

```javascript
const el = document.querySelector(".box");

// 直接スタイルを変更
el.style.color = "red";
el.style.backgroundColor = "yellow";  // ケバブケースではなくキャメルケース

// クラスを操作する（推奨！）
el.classList.add("active");
el.classList.remove("active");
el.classList.toggle("active");    // あれば外す、なければつける
el.classList.contains("active");  // → true / false
```

### 要素の作成と追加

```javascript
// 新しい要素を作る
const li = document.createElement("li");
li.textContent = "新しい項目";

// 既存の要素に追加
const ul = document.querySelector("ul");
ul.appendChild(li);

// 複数の要素を一度に追加
const fragment = document.createDocumentFragment();
for (let i = 0; i < 5; i++) {
  const item = document.createElement("li");
  item.textContent = `項目 ${i + 1}`;
  fragment.appendChild(item);
}
ul.appendChild(fragment);  // 1回の追加で済む（パフォーマンスが良い）
```

### 属性の操作

```javascript
const link = document.querySelector("a");

// 属性の取得・設定
link.getAttribute("href");
link.setAttribute("href", "https://example.com");
link.removeAttribute("target");

// data属性
// <div data-user-id="123" data-role="admin">
const el = document.querySelector("[data-user-id]");
console.log(el.dataset.userId);  // → "123"（ケバブケース→キャメルケース）
console.log(el.dataset.role);    // → "admin"
```

---

## 08-2. イベント（click / input / submit）

### イベントリスナーの登録

```javascript
const button = document.querySelector("#myButton");

button.addEventListener("click", () => {
  console.log("ボタンがクリックされました");
});
```

### よく使うイベント

```javascript
// クリック
element.addEventListener("click", (event) => {
  console.log("クリック位置:", event.clientX, event.clientY);
});

// キーボード入力
input.addEventListener("input", (event) => {
  console.log("入力値:", event.target.value);
});

// キーダウン
document.addEventListener("keydown", (event) => {
  console.log("押されたキー:", event.key);
  if (event.key === "Enter") {
    console.log("Enterが押された");
  }
});

// フォーム送信
form.addEventListener("submit", (event) => {
  event.preventDefault();  // デフォルトの送信を防ぐ
  console.log("フォームが送信された");
});
```

### event オブジェクト

```javascript
button.addEventListener("click", (event) => {
  event.target;          // クリックされた要素
  event.currentTarget;   // リスナーが登録された要素
  event.preventDefault();   // デフォルト動作を防ぐ
  event.stopPropagation();  // イベントの伝搬を止める
});
```

### イベントの伝搬（バブリング）

```javascript
// <div id="parent">
//   <button id="child">クリック</button>
// </div>

document.querySelector("#parent").addEventListener("click", () => {
  console.log("親がクリックされた");
});

document.querySelector("#child").addEventListener("click", () => {
  console.log("子がクリックされた");
});

// ボタンをクリックすると：
// → 子がクリックされた
// → 親がクリックされた（バブリングで親にも伝わる）
```

### イベントデリゲーション

動的に追加される要素にもイベントを適用する手法。

```javascript
// ❌ 各liに個別に登録（後から追加したliには効かない）
document.querySelectorAll("li").forEach(li => {
  li.addEventListener("click", () => { ... });
});

// ✅ 親要素に1つだけ登録（イベントデリゲーション）
document.querySelector("ul").addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    console.log("クリックされた:", event.target.textContent);
  }
});
```

---

## 08-3. フォーム（バリデーションの基礎）

### フォームの値を取得

```html
<form id="myForm">
  <input type="text" name="username" id="username">
  <input type="email" name="email" id="email">
  <select name="role" id="role">
    <option value="user">一般</option>
    <option value="admin">管理者</option>
  </select>
  <button type="submit">送信</button>
</form>
```

```javascript
const form = document.querySelector("#myForm");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = document.querySelector("#username").value;
  const email = document.querySelector("#email").value;
  const role = document.querySelector("#role").value;

  console.log({ username, email, role });
});
```

### 簡易バリデーション

```javascript
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = document.querySelector("#username").value.trim();
  const email = document.querySelector("#email").value.trim();

  // バリデーション
  const errors = [];

  if (username.length === 0) {
    errors.push("ユーザー名を入力してください");
  }
  if (username.length > 20) {
    errors.push("ユーザー名は20文字以内にしてください");
  }
  if (!email.includes("@")) {
    errors.push("正しいメールアドレスを入力してください");
  }

  if (errors.length > 0) {
    alert(errors.join("\n"));
    return;
  }

  // バリデーションOK → 送信処理
  console.log("送信OK:", { username, email });
});
```

---

## 08-4. 表示更新の設計（状態→描画）

### 「状態→描画」パターン

UIを作るとき、**「データ（状態）を変える → 画面を更新する」**という流れを意識すると、コードが整理されます。

```javascript
// 状態（データ）
let state = {
  count: 0,
};

// 描画関数（状態を画面に反映する）
function render() {
  document.querySelector("#count").textContent = state.count;
}

// イベント（状態を変える → 描画）
document.querySelector("#increment").addEventListener("click", () => {
  state.count++;
  render();
});

document.querySelector("#decrement").addEventListener("click", () => {
  state.count--;
  render();
});

// 初期描画
render();
```

**なぜこのパターンが良いのか**：
- 状態と表示が分離されて、どちらもシンプルになる
- 「今の状態」を見ればUIがどうなるかわかる
- React等のフレームワークと同じ考え方

---

## 08-5. よくある罠（再描画、イベント多重登録）

### イベントの多重登録

```javascript
// ❌ ループの中でaddEventListenerを呼ぶと多重登録される
function setup() {
  const button = document.querySelector("#btn");
  button.addEventListener("click", () => {
    console.log("クリック！");
  });
}

setup();  // 1回登録
setup();  // 2回目 → リスナーが2つになる！
// ボタンを1回クリック → 「クリック！」が2回表示される
```

```javascript
// ✅ 対策1: 古いリスナーを削除してから登録
function handleClick() {
  console.log("クリック！");
}

button.removeEventListener("click", handleClick);
button.addEventListener("click", handleClick);

// ✅ 対策2: { once: true } で1回だけ実行
button.addEventListener("click", handleClick, { once: true });

// ✅ 対策3: AbortControllerで管理
const controller = new AbortController();
button.addEventListener("click", handleClick, { signal: controller.signal });
// 解除したいとき：
controller.abort();
```

### innerHTML の繰り返し書き換え

```javascript
// ❌ innerHTML で全部書き換えると、イベントリスナーが消える
const list = document.querySelector("#list");

function addItem(text) {
  list.innerHTML += `<li>${text}</li>`;
  // 既存のliに付けたイベントリスナーがすべて消える！
}

// ✅ appendChild を使う
function addItem(text) {
  const li = document.createElement("li");
  li.textContent = text;
  list.appendChild(li);
}
```

---

## 08-6. ブラウザの「保存」入門

### localStorage

ブラウザにデータを永続的に保存します（ブラウザを閉じても残る）。

```javascript
// 保存
localStorage.setItem("username", "太郎");

// 取得
const name = localStorage.getItem("username");
console.log(name);  // → "太郎"

// 削除
localStorage.removeItem("username");

// 全削除
localStorage.clear();

// オブジェクトを保存するにはJSONに変換
const user = { name: "太郎", age: 20 };
localStorage.setItem("user", JSON.stringify(user));
const saved = JSON.parse(localStorage.getItem("user"));
```

### sessionStorage

タブを閉じると消える。使い方はlocalStorageと同じ。

### Cookie

サーバーに自動送信される。認証トークンの保存に使われる。

### 使い分け

| 方法 | 容量 | 寿命 | サーバー送信 |
|------|------|------|------------|
| localStorage | 5-10MB | 永続 | しない |
| sessionStorage | 5-10MB | タブを閉じるまで | しない |
| Cookie | 4KB | 設定次第 | する |
| IndexedDB | 大容量 | 永続 | しない |

---

## 08-7. 開発者ツール（DevTools）の使いどころ

### Console タブ

```javascript
// ログレベル
console.log("情報");      // 通常のログ
console.warn("警告");     // 黄色い警告
console.error("エラー");  // 赤いエラー
console.table([{a:1},{a:2}]); // テーブル表示

// オブジェクトを見やすく
console.dir(document.body);

// 時間計測
console.time("処理");
// ... 処理 ...
console.timeEnd("処理");  // → 処理: 15.234ms
```

### Elements タブ

- HTMLの構造をリアルタイムで見る・編集する
- CSSを試しに変えてみる
- 要素を右クリック → 「検証」で該当要素にジャンプ

### Network タブ

- API通信の内容を確認する
- リクエスト/レスポンスのヘッダーとボディを見る
- 通信が遅い原因を調べる

### Application タブ

- localStorage / sessionStorage / Cookie の中身を見る
- データの追加・編集・削除ができる

---

## 08-8. オリジンとCORSの入口

### オリジンとは

`プロトコル + ドメイン + ポート` の組み合わせ。

```
https://example.com:443  ← これが「オリジン」
 ↑         ↑         ↑
プロトコル  ドメイン   ポート
```

### 同一オリジンポリシー

ブラウザは**セキュリティのため**、異なるオリジンへのリクエストを制限します。

```
✅ 同じオリジン
https://example.com/page1 → https://example.com/api  （OK）

❌ 異なるオリジン（CORSが必要）
https://example.com → https://api.other.com  （ブロックされる）
```

### CORS（Cross-Origin Resource Sharing）

「異なるオリジンからのアクセスを許可する」仕組み。**サーバー側で設定する**ものです。

```
ブラウザ → サーバーにリクエスト
サーバー → レスポンスに「Access-Control-Allow-Origin: *」を付ける
ブラウザ → 「許可されているからOK」とデータを受け取る
```

### CORS エラーが出たら

```
Access to fetch at 'https://api.example.com' from origin
'http://localhost:3000' has been blocked by CORS policy
```

**対処法**：
1. サーバー側でCORS設定を追加する（正攻法）
2. 開発中は proxy を使う（フレームワークの設定で）
3. ブラウザ拡張は一時的な回避策だが本番では使えない

> 今の段階では「CORSエラー = サーバー側の問題」と覚えておけばOKです。

---

## よくある間違い

```javascript
// ❌ DOMが読み込まれる前にアクセスする
// <head>の中で↓を実行するとnullになる
const el = document.querySelector("#app");  // → null

// ✅ DOMContentLoaded を使うか、<body>の末尾で読み込む
document.addEventListener("DOMContentLoaded", () => {
  const el = document.querySelector("#app");  // → OK
});

// ❌ innerHTMLにユーザー入力をそのまま入れる（XSS！）
el.innerHTML = userInput;  // 危険！
// ✅ textContent を使う
el.textContent = userInput;  // 安全
```

---

## 重要ポイント

1. **`querySelector`** でCSS セレクタを使って要素を取得
2. **`addEventListener`** でイベントを登録。`event.preventDefault()` でデフォルト動作を防ぐ
3. **「状態→描画」パターン**：データを変えてから画面を更新
4. **`innerHTML`** にユーザー入力を入れない（XSS対策）。`textContent` を使う
5. **localStorage** でブラウザにデータを保存（JSON.stringifyが必要）
6. **CORSエラー**はサーバー側の設定で解決する

---

## 練習問題

1. ボタンをクリックするたびに、`<p>` のテキストが「Hello」と「Goodbye」で切り替わるプログラムを書こう。

2. テキスト入力欄に文字を打つと、リアルタイムで下に「入力中：〇〇」と表示されるプログラムを書こう。

3. TODOリストの骨格を作ろう：入力欄にテキストを入れて「追加」ボタンを押すと、リストに項目が追加される。

---

## ミニ課題

**「カウンターアプリ」を作ろう**

以下の機能を持つカウンターをHTML + JSで作ろう：
- 「+1」ボタンで数字が1増える
- 「-1」ボタンで数字が1減る
- 「リセット」ボタンで0に戻る
- 現在の数値をlocalStorageに保存し、ページを再読み込みしても値が残る
- 数値が0未満になったら赤色で表示
