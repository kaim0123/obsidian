# Guard Clause — 早期 return

## この章の目的

**Guard Clause（ガード節）** — ネストした if を避け、正常系を一直線に読ませる技法を学ぶ章です。

---

## 1. ネストした if の問題

深くネストした `if` は **読みにくく・テストしにくい** 原因になります。

```javascript
// 悪い例: ネストが深い
function processOrder(order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.customer.isActive) {
        // 正常系が 3 段インデント
        return calculateTotal(order);
      }
    }
  }
  return null;
}
```

右に伸びる **矢印型コード** は、正常系の流れを追いにくくします。

---

## 2. Guard Clause（ガード節）の書き方

**Guard Clause** は、**異常系・前提条件を先に弾き、早期 return する** 書き方です。

```javascript
// 良い例: Guard Clause
function processOrder(order) {
  if (!order) return null;
  if (order.items.length === 0) return null;
  if (!order.customer.isActive) return null;

  return calculateTotal(order);  // 正常系が一直線
}
```

異常系を **関数の入口** に集約し、本流を浅く保ちます。

---

## 3. 正常系を一直線に読ませる

Guard Clause の **目的** は、読み手が **正常系だけ** を上から下に読めることです。

```text
  Before（ネスト）          After（Guard Clause）
  ───────────────          ───────────────────
  if (ok) {                if (!ok) return;
    if (valid) {           if (!valid) return;
      正常系                  正常系
    }                      }
  }
```

正常系は **インデント 1 段** に収めるのが理想です。

---

## 4. else 句をなくすと条件分岐が単純になる

増田亨『現場で役立つシステム設計の原則』第2章は、区分ごとの料金計算などを例に **else を消して早期 return（ガード節）** にすると、分岐同士の結びつきが弱まり、順序の入れ替えや追加がしやすいと説明します。

```typescript
// 悪い例: 結果を変数にため、else でつなぐ
function fee(customer: Customer): number {
  let result: number;
  if (customer.isChild()) {
    result = childFee();
  } else if (customer.isSenior()) {
    result = seniorFee();
  } else {
    result = adultFee();
  }
  return result;
}

// 良い例: else をなくし、確定したらすぐ return
function fee(customer: Customer): number {
  if (customer.isChild()) return childFee();
  if (customer.isSenior()) return seniorFee();
  return adultFee();
}
```

条件式そのものをメソッドに独立させると、さらに意図が読めます（「判断や処理のロジックをメソッドに独立させる」）。

```typescript
function fee(customer: Customer): number {
  if (isChild(customer)) return childFee();
  if (isSenior(customer)) return seniorFee();
  return adultFee();
}
```

区分が増えて同じパターンの if が散らばる段階では、クラス／列挙への押し出し（[[07_区分オブジェクトと状態遷移]]）を検討します。

---

## 5. 対称的な分岐 — if-else のままがよい場面

すべてを Guard Clause にする必要はありません。

| Guard Clause が向く | if-else が向く |
|---------------------|----------------|
| 前提条件のチェック | 2 つの同等な選択肢 |
| 異常系の早期脱出 | 状態に応じた対称的処理 |
| 区分の早期振り分け | 真偽が対等な二択 |

```javascript
// 対称的な分岐 → if-else でよい
function getPrice(isMember) {
  if (isMember) {
    return applyMemberDiscount(basePrice);
  } else {
    return basePrice;
  }
}
```

---

## 6. Guard Clause + Extract Method の組み合わせ

Guard の条件が複雑なら **Extract Method** で名前を付けます。

```javascript
function processOrder(order) {
  if (!isValidOrder(order)) return null;
  if (!isActiveCustomer(order.customer)) return null;

  return calculateTotal(order);
}

function isValidOrder(order) {
  return order && order.items.length > 0;
}

function isActiveCustomer(customer) {
  return customer && customer.isActive;
}
```

条件に **意図のある名前** を付けると、Guard Clause がさらに読みやすくなります。

---

## まとめ

- ネストした if は読みにくい。Guard Clause で浅くする
- **else をなくし早期 return** すると、区分分岐の入れ替え・追加がしやすい
- 異常系を先に弾き、正常系を一直線に
- 対称的な分岐は if-else のままでよい
- 複雑な条件は Extract Method で名前を付ける

→ 次の章: [[03_複雑度と分岐]]
