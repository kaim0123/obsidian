# Functional Core, Imperative Shell

## この章の目的

**FCIS（Functional Core, Imperative Shell）** — 核を純粋関数、外縁を I/O に分けるパターンを学ぶ章です。

---

## 1. 核は純粋、外縁だけ I/O

**Functional Core, Imperative Shell** とは、

- **Core（核）**: 純粋関数 — 計算・変換・バリデーション
- **Shell（外縁）**: 副作用 — I/O、DB、HTTP、ログ

```text
  ┌─────────────────────────────┐
  │  Shell（Imperative）         │
  │  ┌───────────────────────┐  │
  │  │  Core（Pure）          │  │
  │  │  calculateTotal()     │  │
  │  │  validateOrder()      │  │
  │  └───────────────────────┘  │
  │  db.save() / email.send()    │
  └─────────────────────────────┘
```

核を **テストしやすく**、Shell を **薄く** 保ちます。

---

## 2. Shell（副作用あり）と Core（純粋関数）の境界

**境界の決め方**:

1. **入力** — Shell が DB から取得し、Core に渡す
2. **Core** — 純粋関数で計算・判定
3. **出力** — Shell が Core の結果を DB / API に書き込む

```javascript
// Core: 純粋
function processOrderData(order, items) {
  const total = calculateTotal(items);
  const discount = applyDiscount(total, order.coupon);
  return { ...order, total, discount, status: 'processed' };
}

// Shell: I/O
async function handleOrderRequest(req) {
  const order = await db.getOrder(req.id);
  const items = await db.getItems(req.id);
  const result = processOrderData(order, items);
  await db.save(result);
  return result;
}
```

---

## 3. ユースケース層での実践

アプリケーションサービス（ユースケース層）を **Shell** として設計します。

```javascript
class PlaceOrderUseCase {
  async execute(command) {
    const order = await this.repo.find(command.orderId);   // Shell
    const validated = validateOrder(order);                 // Core
    const total = calculateTotal(validated.items);          // Core
    await this.repo.save({ ...validated, total });          // Shell
    await this.notifier.send(validated);                    // Shell
  }
}
```

Core 部分は **モックなし** で単体テストできます。

---

## 4. OOP のメソッドと FP の関数の役割分担

| レイヤー | 向くパラダイgm | 例 |
|----------|---------------|-----|
| ドメイン計算 | 純粋関数 | `calculateTax()`, `applyDiscount()` |
| エンティティ | OOP メソッド | `order.submit()` |
| ユースケース | Shell（手続き） | `PlaceOrderUseCase.execute()` |

**組み合わせ** が現実的です。OOP で状態を表現し、FP で計算を純粋に。

---

## 5. 小さなアプリでは過剰にならないか（KISS とのバランス）

| 規模 | 推奨 |
|------|------|
| スクリプト・100 行 | FCIS は不要。関数分割だけで十分 |
| 中規模・複数レイヤー | Core / Shell の意識を持つ |
| 大規模・ドメイン複雑 | FCIS を明示的にレイヤー分け |

**過剰設計のサイン**: Shell が 1 行だけ、Core が 1 関数だけ — このときは統合を検討（[[03_KISS・DRY・YAGNI]]）。

---

## まとめ

- FCIS = 核は純粋、外縁だけ I/O
- Shell が入出力、Core が計算・判定
- ユースケース層を Shell として薄く保つ
- 小規模では KISS を優先。規模に応じて適用

→ 次の章: [[04_オブジェクトのメソッド]]
