# Design by Contract / Fail Fast

## この章の目的

**Design by Contract（契約による設計）** と **Fail Fast** をメソッド設計に適用する章です。  
前置条件・後置条件、前提チェック、例外と戻り値の使い分けを学びます。

---

## 1. 前置条件・後置条件・不変条件

Bertrand Meyer（Eiffel, 1986）が提唱した **Design by Contract（DbC）** は、メソッドに **契約** を定義します。

| 契約 | 意味 | 例 |
|------|------|-----|
| **前置条件** | 呼び出し前に満たすべき条件 | `amount > 0` |
| **後置条件** | 実行後に保証する条件 | `return >= 0` |
| **不変条件** | オブジェクトが常に満たす条件 | `balance >= 0` |

```javascript
function withdraw(account, amount) {
  // 前置条件
  if (amount <= 0) throw new Error('amount must be positive');
  if (amount > account.balance) throw new Error('insufficient funds');

  account.balance -= amount;
  // 後置条件: balance >= 0 は不変条件で保証
}
```

---

## 2. Fail Fast — 異常は早い段階で検出する

**Fail Fast** とは、**不正な状態を先送りせず、検出した時点で即座に失敗** させる考え方です。

```javascript
// 悪い例: 不正を先送り
function process(data) {
  // 100 行後...
  if (!data.id) return;  // 気づくのが遅い
}

// 良い例: Fail Fast
function process(data) {
  if (!data?.id) throw new Error('data.id is required');
  // 以降は data.id が存在する前提で書ける
}
```

メソッド **先頭** で前提をチェックし、以降のコードを単純に保ちます。

---

## 3. メソッド先頭での前提チェック

Guard Clause と組み合わせて、**契約を入口に集約** します。

```javascript
function calculateDiscount(order, rate) {
  if (!order) throw new TypeError('order is required');
  if (rate < 0 || rate > 1) throw new RangeError('rate must be 0-1');
  if (order.items.length === 0) return 0;

  return order.subtotal * rate;
}
```

前提チェック → 正常系、の順序が読みやすいメソッドの基本形です。

---

## 4. 例外 vs 戻り値（Result 型）の使い分け

| 方式 | 向く場面 |
|------|----------|
| **例外** | プログラムのバグ・契約違反・回復不能なエラー |
| **戻り値（Result 型）** | 想定内の失敗（バリデーション、見つからない等） |

```javascript
// 想定内の失敗 → Result
function parseAge(input) {
  const n = Number(input);
  if (isNaN(n) || n < 0) return { ok: false, error: 'invalid age' };
  return { ok: true, value: n };
}

// 契約違反 → 例外
function divide(a, b) {
  if (b === 0) throw new Error('division by zero');
  return a / b;
}
```

チームで **どちらをいつ使うか** を統一すると、読み手が迷いません。

---

## 5. Guard Clause との相補関係

```text
  Design by Contract  … 「何を満たすべきか」を定義
  Guard Clause        … 満たされないとき早期 return / throw
  Fail Fast           … 満たされないことを早く検出
```

3 つは **同じ入口での前提チェック** を異なる角度から語っています。実装では Guard Clause で Fail Fast し、契約を文書化（コメント・型・アサーション）します。

---

## まとめ

- DbC = 前置条件・後置条件・不変条件で契約を定義
- Fail Fast = 異常を先送りせず、入口で検出
- 例外は契約違反、Result は想定内の失敗
- Guard Clause と組み合わせて入口に集約

→ 次の章: [[02_エラー処理]]
