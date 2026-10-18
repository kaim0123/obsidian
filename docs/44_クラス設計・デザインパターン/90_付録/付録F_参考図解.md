# 付録F　参考図解（クラス図・関係図・継承階層）

クラス設計の議論で使える **ASCII 図のテンプレート** です。  
Obsidian のコードブロックやホワイトボードにそのまま転記できます。

---

## クラス図（基本）

```text
┌─────────────────┐
│     Order       │
├─────────────────┤
│ - id: OrderId   │
│ - status        │
│ - lines: Line[] │
├─────────────────┤
│ + addLine()     │
│ + confirm()     │
│ + total()       │
└─────────────────┘
```

| 記号 | 意味 |
|------|------|
| `-` | private |
| `+` | public |
| `#` | protected |

---

## 関連（Association）

```text
Customer "1" ──────< "*" Order
     │                    │
     │                    │ 1
     │                    ◆─────── "*" OrderLine
     │                    （コンポジション）
     └──────────────────────────┘
```

| 多重度 | 読み方 |
|--------|--------|
| `1` | ちょうど1 |
| `0..1` | 0または1 |
| `1..*` | 1以上 |
| `*` | 0以上 |

---

## 依存（Dependency）

```text
PlaceOrderController ..> Order : uses
Order ..> Inventory : canFulfill
OrderService ──→ OrderRepository <<interface>>
                      △
                      │ implements
               SqlOrderRepository
```

点線矢印 `..>` は **依存**（一時利用）。  
実線 + 三角は **実装・継承**。

---

## 継承と実装

```text
        <<interface>>
      PaymentStrategy
       △           △
       │           │
  CardPayment   BankPayment


      Animal
        △
        │
       Dog
```

継承は **浅く**。疑わしければ右のようにインターフェース + 実装:

```text
      <<interface>>
         Shape
       △     △
       │     │
  Rectangle  Square
```

---

## パッケージ（モジュール内配置）

```text
  ┌─────────────────────────────────────┐
  │  order パッケージ                    │
  │  ┌─────────┐    ┌────────────────┐ │
  │  │ domain  │    │ infrastructure │ │
  │  │ Order   │←───│ SqlOrderRepo   │ │
  │  └─────────┘    └────────────────┘ │
  └─────────────────────────────────────┘
         ↑ 依存の向きは内側へ
```

[[MOC_モジュール設計体系]] の境界の内側で使います。

---

## Strategy パターン（構造）

```text
  CheckoutService
        │
        │ uses
        ▼
  PaymentStrategy <<interface>>
     △      △      △
     │      │      │
   Card   Bank  Invoice
```

---

## 関連

- [[02_クラスとオブジェクトの基本]]
- [[01_クラス間の関係]]
- [[010Programming/42_ソフトウェア設計/90_付録/付録F_参考図解|42 付録F_参考図解]]
