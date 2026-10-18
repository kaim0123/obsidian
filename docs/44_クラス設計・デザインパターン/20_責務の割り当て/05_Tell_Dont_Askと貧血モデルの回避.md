---
title: 05_Tell_Dont_Askと貧血モデルの回避
created: 2026-10-05
tags:
  - クラス設計
  - 責務
  - ドメインモデル
---

# Tell, Don't Ask と貧血モデルの回避

## この章の目的

[[02_GRASP]] の **情報エキスパート**（責務は、その情報を持っているクラスに割り当てる）を学びました。
この章では、その考え方を **日々のコードの書き方** に落とし込む原則と、その原則が守られないときに生まれるアンチパターンを学びます。

- **Tell, Don't Ask**（尋ねるな、命じよ）
- **貧血ドメインモデル**（Anemic Domain Model）とは何か、なぜ問題か
- 貧血モデルから **リッチなドメインモデル** へのリファクタリング
- **getter / setter** との付き合い方
- 貧血モデルが **許される場面**

---

## 1. Tell, Don't Ask

### 1.1 原則

> **オブジェクトにデータを尋ねて、呼ぶ側で判断・処理するのではなく、オブジェクトに「何をしてほしいか」を命じよ。**

『達人プログラマー』の著者 Andy Hunt と Dave Thomas が広め、Martin Fowler も bliki で解説しています。

```typescript
// ✕ Ask（尋ねて、呼ぶ側で判断する）
if (account.getBalance() >= amount) {
  account.setBalance(account.getBalance() - amount);
} else {
  throw new Error("残高不足");
}

// ○ Tell（命じる。判断はオブジェクト自身が行う）
account.withdraw(amount);
```

### 1.2 なぜ Tell なのか

| Ask のコード | Tell のコード |
|---|---|
| 「残高が足りるか」の **判断が呼ぶ側にある** | 判断が **データを持つクラスの中** にある |
| 同じ判断が、引き出しを行う **あちこちに重複** する | 判断は **1か所** |
| `setBalance` で **誰でも残高を自由に書き換えられる** | 残高は `withdraw` / `deposit` を通してしか変わらない |
| 「残高はマイナスにならない」というルールを **全員が守る必要がある** | ルールは **クラスが守る**（不変条件のカプセル化） |

つまり Tell, Don't Ask は、**データとそれを扱うロジックを同じ場所に置く**（カプセル化・情報エキスパート）ための、実践的な合言葉です（→ [[03_クラスのカプセル化と情報隠蔽]]）。

### 1.3 デメテルの法則との関係

```typescript
// ✕ 友達の友達に話しかけている（デメテルの法則違反）
order.getCustomer().getAddress().getPrefecture() === "沖縄県"

// ○ 直接の相手に命じる・尋ねる
order.isRemoteIslandDelivery()
```

- **デメテルの法則**（直接の友達とだけ話せ）は、Tell, Don't Ask と同じ方向の原則です（→ 48 の [[02_デメテルの法則]]）
- 長いメソッドチェーン（`a.getB().getC().getD()`）は、Fowler のコードの臭い **メッセージの連鎖（Message Chains）** にあたります

### 1.4 Tell, Don't Ask の限界

Fowler 自身は、この原則を **厳格には使っていない** と述べています。

- **画面表示** や **レポート** のためには、データを取り出す（Ask する）必要がある
- すべてを Tell にしようとすると、表示用のロジックまでドメインのクラスに入ってしまう
- 大事なのは「**判断や計算のロジックを、データの近くに置く**」こと。データを読むこと自体は悪くない

| Ask してよい | Tell にすべき |
|---|---|
| 画面に表示する、レポートを作る、ログに出す | **状態を変える** 処理 |
| データをそのまま外部に渡す（DTO に詰める） | **業務ルールに基づく判断**（キャンセルできるか、割引が適用されるか） |

---

## 2. 貧血ドメインモデル

### 2.1 定義

> **ドメインのクラスが、データ（getter / setter）だけを持ち、振る舞い（業務ロジック）をほとんど持たない状態。ロジックはすべて「サービス」クラスに書かれる。**

Martin Fowler が 2003 年の bliki 記事「Anemic Domain Model」で名付けました。

```typescript
// ✕ 貧血ドメインモデル
class Order {
  id: string;
  status: "draft" | "placed" | "shipped" | "cancelled";
  items: OrderItem[];
  total: number;
  // getter / setter だけ
}

class OrderService {
  cancel(order: Order) {
    if (order.status === "shipped") throw new Error("発送済みはキャンセル不可");
    if (order.status === "cancelled") throw new Error("キャンセル済み");
    order.status = "cancelled";
  }

  addItem(order: Order, item: OrderItem) {
    if (order.status !== "draft") throw new Error("確定後は変更不可");
    order.items.push(item);
    order.total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }
}
```

### 2.2 なぜ問題か

Fowler は、貧血ドメインモデルを **「実質的には手続き型の設計」** だと批判しています。

| 問題 | 説明 |
|---|---|
| **オブジェクト指向の利点がない** | データと処理を一緒にするというオブジェクト指向の基本が失われている。それでいて、ドメインモデルを作るコスト（DB との対応づけなど）は払っている |
| **ルールが散らばる** | 「確定後は変更不可」が `OrderService` にも `AdminOrderService` にも `OrderImportBatch` にも書かれる |
| **不正な状態を作れる** | `order.status = "shipped"` や `order.total = 0` を、どこからでも直接書き換えられる |
| **サービスが肥大化する** | すべてのロジックがサービスに集まり、**神クラス** になる |
| **知識がどこにあるか分からない** | 「注文はいつキャンセルできるか」を知るために、複数のサービスを読む必要がある |

### 2.3 なぜ生まれるのか

- **DB のテーブルをそのままクラスにする**（ORM のエンティティ＝テーブルの行）
- 「エンティティは純粋なデータ、ロジックはサービス層」という **誤ったレイヤードの理解**
- フレームワークが setter を要求する（古い ORM・シリアライザ）
- **Tell, Don't Ask を知らない**

---

## 3. リッチなドメインモデルへ

### 3.1 リファクタリング後

```typescript
// ○ リッチなドメインモデル：ルールをクラス自身が守る
class Order {
  private constructor(
    readonly id: OrderId,
    private status: OrderStatus,
    private readonly items: OrderItem[],
  ) {}

  static create(id: OrderId): Order {
    return new Order(id, "draft", []);
  }

  addItem(item: OrderItem): void {
    if (this.status !== "draft") throw new DomainError("確定後は商品を追加できません");
    this.items.push(item);
  }

  cancel(): void {
    if (!this.canCancel()) throw new DomainError("この注文はキャンセルできません");
    this.status = "cancelled";
  }

  canCancel(): boolean {
    return this.status === "draft" || this.status === "placed";
  }

  get total(): Money {
    return this.items.reduce((sum, i) => sum.add(i.subtotal()), Money.zero("JPY"));
  }
}
```

```typescript
// サービス（アプリケーションサービス）は「手順」だけを担う
class CancelOrderUseCase {
  async execute(orderId: OrderId) {
    const order = await this.orders.findById(orderId);
    order.cancel();                    // Tell：判断は Order に任せる
    await this.orders.save(order);
    await this.events.publish(new OrderCancelled(orderId));
  }
}
```

### 3.2 変わったこと

| 観点 | 貧血モデル | リッチなモデル |
|---|---|---|
| `status` の変更 | どこからでも直接代入 | `cancel()` などのメソッド経由だけ |
| キャンセルできるかの判断 | サービスごとに重複 | `Order.canCancel()` の1か所 |
| `total` | 誰かが計算して代入（ずれる可能性） | 常に明細から計算（ずれない） |
| サービスの役割 | ロジックのすべて | 取得 → 命令 → 保存 → 通知 の **手順だけ** |

これは 42 の [[06_ドメイン層とユースケースとアプリサービス]] でいう **ドメイン層とアプリケーション層の役割分担** です。

### 3.3 リファクタリングの手順

1. サービスの中で、**1つのエンティティのデータだけを使っている処理** を探す（Fowler の臭い **機能の横恋慕（Feature Envy）**）
2. その処理を、**エンティティのメソッドとして移動** する（リファクタリング **Move Function**）
3. エンティティの **setter を削除** し、意味のある名前のメソッド（`cancel`・`addItem`）に置き換える
4. 計算で求められる値（`total`）は、**フィールドに保存せず計算する** か、変更時に必ず再計算する
5. 不正な状態を防ぐチェックを、**エンティティの中** に移す

---

## 4. getter / setter との付き合い方

| 種類 | 方針 |
|---|---|
| **setter** | **原則として作らない**。状態の変更は、業務上の意味を持つ名前のメソッド（`changeAddress`・`approve`）にする |
| **getter** | 表示・保存のために必要なものは作ってよい。ただし、**getter で取り出した値で判断している呼び出し側のコード** がないかに注意する |
| **コレクションの getter** | 内部の配列をそのまま返さない（呼ぶ側で `push` されてしまう）。`readonly` な配列やコピーを返す |

```typescript
// ✕ 内部の配列をそのまま返す → 外から items.push() できてしまう
get items(): OrderItem[] { return this.items; }

// ○ 読み取り専用にする
get items(): ReadonlyArray<OrderItem> { return this.items; }
```

---

## 5. 貧血モデルが許される場面

貧血モデルは **常に悪い** わけではありません。

| 場面 | 理由 |
|---|---|
| **単純な CRUD アプリ** | 業務ルールがほとんどないなら、ドメインモデルを作るコストに見合わない（トランザクションスクリプトで十分） |
| **DTO・API のリクエスト／レスポンス** | データの受け渡しが目的なので、振る舞いを持たない方が正しい |
| **支援サブドメイン・汎用サブドメイン** | 42 の [[05_コアドメインとサブドメイン]] でいう、競争優位を生まない単純な部分 |
| **関数型スタイルの設計** | データ（型）と振る舞い（関数）を意図的に分ける設計。ただしその場合は、**不変データ＋状態ごとの型** でルールを守る（42 の [[03_型でドメインを表す_DomainModelingMadeFunctional]]） |

> 問題になるのは、**業務ルールが複雑な部分（コアドメイン）** で、ルールがサービスに散らばっている状態です。

---

## 6. ありがちな誤解

### 6.1 「ドメインのクラスにロジックを入れると、層の分離が崩れる」

**誤りです。** ドメイン層に置くべきなのは **業務ルール** です。DB アクセスや HTTP のような **技術的な処理** を入れないことと、業務ロジックを入れないことは別の話です。

### 6.2 「Tell, Don't Ask なら getter は禁止」

**誤りです。** 表示や保存のためにデータを読むのは問題ありません。避けるべきは、**読んだデータで呼ぶ側が判断・計算・状態変更をすること** です。

### 6.3 「サービスクラスがあるのは貧血モデルの証拠」

**誤りです。** アプリケーションサービス（ユースケース）は、手順を組み立てる役として必要です。問題なのは、**業務ルールまでサービスに書かれていること** です。

---

## まとめ

- **Tell, Don't Ask**：データを尋ねて呼ぶ側で判断するのではなく、オブジェクトに命じる。判断はデータを持つクラスに置く
- **デメテルの法則**・**情報エキスパート** と同じ方向の原則。ただし表示・保存のための Ask は問題ない
- **貧血ドメインモデル**（Fowler, 2003）：getter / setter だけのクラスと、ロジックが集まるサービス。実質は手続き型で、ルールが散らばり、不正な状態を作れる
- リファクタリング：**機能の横恋慕を探す → メソッドを移動 → setter を意味のあるメソッドに置き換える**
- 貧血モデルが許されるのは、**単純な CRUD・DTO・支援サブドメイン**。問題はコアドメインでルールが散らばること

### 次の章

- [[01_クラス間の関係]] — クラス同士をどう関係づけるか

---

## 参考資料

- [Martin Fowler — Anemic Domain Model（bliki, 2003）](https://www.martinfowler.com/bliki/AnemicDomainModel.html)
- [ドメインモデル貧血症（bliki 日本語訳）](https://bliki-ja.github.io/AnemicDomainModel)
- [Martin Fowler — TellDontAsk（bliki）](https://martinfowler.com/bliki/TellDontAsk.html)
- [Anemic domain model（Wikipedia）](https://en.wikipedia.org/wiki/Anemic_domain_model)
- [Designing a microservice domain model（Microsoft Learn）](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model)
- Andrew Hunt, David Thomas『達人プログラマー』
