# 付録C　GRASP 早見表

GRASP（責任分配の原則）の一覧です。詳細は [[02_GRASP]] を参照。

---

## 基本原則

| 原則 | 問い | 答えの指針 |
|------|------|-----------|
| **Information Expert** | 誰がその処理を知っているか | 必要なデータを持つクラス |
| **Creator** | 誰がインスタンスを作るか | 集約・記録・密接利用しているクラス |
| **Controller** | ユースケースの窓口は誰か | システムイベントの最初の受け手 |
| **Low Coupling** | 依存は弱いか | インターフェース・委譲 |
| **High Cohesion** | まとまりは強いか | 無関係な責務を分離 |

---

## 拡張原則

| 原則 | 問い | 答えの指針 |
|------|------|-----------|
| **Polymorphism** | 型で分岐しているか | 多態・Strategy |
| **Pure Fabrication** | ドメインにないが必要なクラスは | Repository, Factory 等 |
| **Indirection** | 直接依存を避けられるか | 仲介・イベント |
| **Protected Variations** | 変わる点は守れているか | インターフェースで隔離 |

---

## よくある適用例

| 状況 | GRASP |
|------|-------|
| 明細の小計計算 | Information Expert → `OrderLine` |
| 注文明細の生成 | Creator → `Order` |
| 注文確定ユースケース | Controller → `PlaceOrderController` |
| DB 永続化 | Pure Fabrication → `OrderRepository` |
| 支払い方法の追加 | Polymorphism + Protected Variations |

---

## 関連

- [[02_GRASP]]
- [[付録B_クラス設計チェックリスト]]
