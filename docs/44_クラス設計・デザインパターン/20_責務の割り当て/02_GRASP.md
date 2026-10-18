# GRASP — 責任分配の原則

## この章の目的

**GRASP**（General Responsibility Assignment Software Patterns）を学び、  
「この責務はどのクラスに置くか」を判断する実践的な指針を身につけます。

---

## 1. GRASP とは何か

GRASP は、オブジェクト指向設計で **責任をどのクラスに割り当てるか** を決める原則集です。  
デザインパターンの「前段」として、日常の設計判断に使います。

| 原則 | 一言 |
|------|------|
| Information Expert | 情報を持つクラスが処理する |
| Creator | 適切な作成者がインスタンスを作る |
| Controller | システム操作の窓口を置く |
| Low Coupling | 結合を弱く |
| High Cohesion | 凝集を高く |
| その他 | 多態・純粋作り・間接・保護された変化 |

早見表は [[付録C_GRASP早見表]] を参照。

---

## 2. Information Expert（情報エキスパート）

**必要な情報を持つクラス** が、その処理の責任を持つ。

```javascript
class OrderLine {
  constructor(unitPrice, quantity) {
    this.unitPrice = unitPrice;
    this.quantity = quantity;
  }
  subtotal() {
    return this.unitPrice * this.quantity;  // 自分のデータで計算
  }
}
```

合計を `OrderService` で計算するより、`OrderLine` が subtotal を知っているほうが自然です。

---

## 3. Creator（クリエイタ）

**作成されるオブジェクトを、関連・集約・記録・使用しているクラス** が作る。

| 条件（満たすほど Creator に） | 例 |
|------------------------------|-----|
| B が A の集約・構成要素 | `Order` が `OrderLine` を作る |
| B が A を記録する | `Register` が `Sale` を作る |
| B が A を密接に使う | `Cart` が `CartItem` を作る |

```javascript
class Order {
  addProduct(product, qty) {
    this.lines.push(new OrderLine(product, qty)); // Order が Line を作る
  }
}
```

---

## 4. Controller（コントローラ）

**システムイベント（ユースケース）の最初の窓口** となるクラスを置く。  
UI 層とドメイン層の橋渡しです（Fat Controller に注意）。

```text
  UI ──→ PlaceOrderController ──→ Order, Inventory, Payment
              ↑
         ユースケースのオーケストレーション
```

ドメインルール自体は Controller に書かず、**委譲** します。

---

## 5. Low Coupling / High Cohesion

GRASP でも **低結合・高凝集** を明示的に目標にします。

- 責務を移すとき → 結合度は下がるか？凝集度は上がるか？
- 新しい依存を増やすとき → 本当に必要か？

[[04_クラスの凝集度と結合度]] と同じ物差しです。

---

## 6. Polymorphism / Pure Fabrication / Indirection / Protected Variations

| 原則 | 意味 | 例 |
|------|------|-----|
| **Polymorphism** | 型で分岐せず多態を使う | `PaymentStrategy` |
| **Pure Fabrication** | ドメインにないが便利なクラスを作る | `OrderRepository` |
| **Indirection** | 仲介者で結合を弱める | イベントバス |
| **Protected Variations** | 変わる点をインターフェースで守る | `TaxCalculator` 抽象化 |

```javascript
// Protected Variations — 税ルールが変わる
interface TaxCalculator {
  tax(amount): Money;
}
```

---

## まとめ

- GRASP は責務配置の実践指針
- Expert・Creator・Controller が日常でよく使う
- Low Coupling / High Cohesion を常に確認
- Polymorphism 等で変化に備える

→ 次の章: [[03_ドメインを表すクラス]]
