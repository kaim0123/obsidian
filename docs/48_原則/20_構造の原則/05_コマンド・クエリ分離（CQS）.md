---
title: コマンド・クエリ分離（CQS）
created: 2026-10-18
tags:
  - 原則
---

# コマンド・クエリ分離（Command-Query Separation, CQS）

## はじめに

「値を確認したかっただけなのに、呼んだら状態が変わってしまった」。こんなメソッドがあると、**呼ぶ回数や順番** に気をつけないといけなくなり、コードを読むのも試すのも怖くなります。

これを防ぐための原則が **コマンド・クエリ分離（CQS）** です。

このノートでは原則としての考え方を扱います。メソッド設計での具体的な書き方は [[01_CQS]] にまとめてあります。

---

## 一言でいうと

**「質問するメソッドは状態を変えない。状態を変えるメソッドは答えを返さない」**

Meyer の言葉では、**「質問をすることで、答えが変わってはならない（Asking a question should not change the answer）」** です。

---

## 定義・背景

- **Bertrand Meyer** が、プログラミング言語 Eiffel の設計と著書『Object-Oriented Software Construction』（初版 1988 年）の中で提唱しました
- メソッドを次の 2 種類に分けます

| 種類 | すること | 戻り値 | 状態の変更 |
|---|---|---|---|
| **クエリ（Query）** | 質問に答える | **ある** | **しない** |
| **コマンド（Command）** | 何かを実行する | **ない**（void） | **する** |

- Meyer は、クエリに副作用がなければ **何度呼んでも安全** になり、**契約による設計（Design by Contract）** の事前条件・事後条件の中でもクエリを安心して使える、と考えました

---

## 悪い例: 質問と変更が混ざっている

```javascript
class Counter {
  constructor() {
    this.count = 0;
  }
  // 次の番号を「返す」のに、内部の値も「増やす」
  next() {
    this.count += 1;
    return this.count;
  }
}

class Stock {
  constructor(quantity) {
    this.quantity = quantity;
  }
  // 「在庫があるか？」と聞いたら、在庫が 1 つ減る
  hasStock() {
    if (this.quantity > 0) {
      this.quantity -= 1;
      return true;
    }
    return false;
  }
}
```

### 何が問題か

- `if (stock.hasStock()) { ... }` と **確認のつもりで書くと在庫が減る**
- デバッグ中に `console.log(stock.hasStock())` を **1 行足しただけで動きが変わる**
- テストで同じクエリを 2 回呼ぶと **結果が変わる**

---

## 良い例: 質問と変更を分ける

```javascript
class Counter {
  constructor() {
    this.count = 0;
  }
  increment() {   // コマンド: 変えるだけ
    this.count += 1;
  }
  current() {     // クエリ: 答えるだけ
    return this.count;
  }
}

class Stock {
  constructor(quantity) {
    this.quantity = quantity;
  }
  hasStock() {    // クエリ
    return this.quantity > 0;
  }
  takeOne() {     // コマンド
    if (this.quantity <= 0) throw new Error('在庫切れ');
    this.quantity -= 1;
  }
}

if (stock.hasStock()) {
  stock.takeOne();
}
```

`hasStock()` は何度呼んでも安全です。**状態が変わる場所は `takeOne()` だけ** なので、読む人もすぐ分かります。

---

## よくある誤解・やりすぎ

### 誤解1: 例外なく必ず守るべき

CQS をきっちり守りにくい場面もあります。

- **スタックの `pop()`** … 取り出す（変更）と返す（質問）が 1 つになっているほうが自然
- **並行処理** … 「確認してから変更」の間に他のスレッドが割り込むと困るので、**確認と変更を 1 回で行う操作**（例: `compareAndSet`）が必要になる

こうした場面では、**名前で「変更もする」ことが分かるようにして** 例外として扱います。

### 誤解2: CQS と CQRS は同じもの

名前は似ていますが別物です。

| | CQS | CQRS |
|---|---|---|
| 単位 | **メソッド** | **システム・アーキテクチャ** |
| 分けるもの | 1 つのメソッドの役割 | 書き込み用と読み取り用の **モデルそのもの** |
| 提唱 | Bertrand Meyer | Greg Young（CQS の考え方を発展させたもの） |

### 誤解3: ログ出力やキャッシュも「状態の変更」なので禁止

CQS が問題にしているのは **呼び出し側から見える状態（観測できる状態）** の変化です。内部のキャッシュやログのように、**結果に影響しない変化** まで禁止しているわけではありません。

---

## 他の原則との関係

- **驚き最小の原則** — 「`get〜` や `is〜` は何も変えない」と期待できる（[[05_驚き最小の原則]]）
- **純粋関数** — クエリを副作用のない関数として書くと、テストしやすくなる（[[02_純粋関数と副作用]]）
- **契約による設計** — 事前条件・事後条件の中で、副作用のないクエリを使う（[[01_Design_by_Contract]]）

---

## まとめ

- **クエリは答えるだけ、コマンドは変えるだけ**
- Bertrand Meyer が Eiffel と『Object-Oriented Software Construction』（1988 年）で提唱
- クエリに副作用がなければ、**何度呼んでも安全** になる
- `pop()` や並行処理など、**例外は名前で明示** する
- システム単位に広げた考え方が **CQRS**

---

## 関連ノート

- [[01_CQS]] — メソッド設計での使い方
- [[02_純粋関数と副作用]]
- [[03_Functional_Core_Imperative_Shell]]
- [[01_Design_by_Contract]]
- [[05_驚き最小の原則]]
- [[01_関心の分離]]

→ 入口: [[MOC_原則体系]]
