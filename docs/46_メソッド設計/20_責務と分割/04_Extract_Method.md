# Extract Method — 意味の塊で切り出す

## この章の目的

**Extract Method（メソッドの抽出）** — メソッド設計で最も頻繁に使うリファクタリング技法を学ぶ章です。

---

## 1. Extract Method とは何か

**Extract Method** は、長い関数の中の **意味のある塊** を、新しい関数に切り出すリファクタリングです。  
Martin Fowler の *Refactoring*（1999）で体系化されました。

```javascript
// Before
function printOrderSummary(order) {
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.qty;
  }
  const tax = total * 0.1;
  console.log(`Total: ${total + tax}`);
}

// After
function printOrderSummary(order) {
  const total = calculateTotal(order);
  const tax = calculateTax(total);
  console.log(`Total: ${total + tax}`);
}
```

---

## 2. 長い関数の典型パターン

Extract Method の **候補** になるサインです。

| パターン | 症状 |
|----------|------|
| **100 行超** | スクロールしないと全体が見えない |
| **重複** | 同じ 5 行が 2 か所以上 |
| **コメント頼み** | `// ここから検証` で区切っている |
| **ネスト深い** | if の中の if が 3 段以上 |

```javascript
// コメント = 抽出候補のサイン
function handleRequest(req) {
  // --- 認証 ---
  if (!req.token) { /* 20 行 */ }
  // --- バリデーション ---
  if (!req.body) { /* 30 行 */ }
}
```

---

## 3. 抽出の手順 — 選ぶ・名前を付ける・呼び出す

1. **選ぶ** — 意味の塊（コメントで区切られた部分、ループ、条件分岐）を特定
2. **名前を付ける** — 動詞 + 目的語（`validateRequest`, `calculateTotal`）
3. **呼び出す** — 元の位置を関数呼び出しに置き換え
4. **テスト** — 振る舞いが変わっていないことを確認

**引数の渡し方**: 塊が参照する変数を引数に。変更する変数は戻り値で返す。

---

## 4. Replace Temp with Query — 一時変数を関数に

**Replace Temp with Query** は、一時変数の計算を **問い合わせ関数** に置き換える技法です。

```javascript
// Before
function getPrice(order) {
  const base = order.items.reduce((s, i) => s + i.price, 0);
  const discount = base * 0.1;
  return base - discount;
}

// After
function getPrice(order) {
  const base = calculateBasePrice(order);
  const discount = calculateDiscount(base);
  return base - discount;
}

function calculateBasePrice(order) {
  return order.items.reduce((s, i) => s + i.price, 0);
}
```

一時変数が **意図の名前** になれば、そのまま関数名にもできます。

---

## 5. 抽出しすぎの落とし穴

| 問題 | 例 | 対処 |
|------|-----|------|
| **1 行関数の乱立** | `add(a,b)` だけの関数が 30 個 | 意味のある塊まで統合 |
| **引数地獄** | 抽出後に引数が 8 個 | Parameter Object（[[02_引数の設計]]） |
| **ジャンプが多い** | 10 行読むのに 5 ファイル | 同じ抽象度の関数は近くに配置 |

**目安**: 抽出後の関数は **2〜3 行以上** の意味があること。名前で説明できること。

---

## まとめ

- Extract Method = 意味の塊を新関数に切り出す
- 100 行・重複・コメント頼みが抽出候補
- 選ぶ → 名前 → 呼び出す → テスト
- 抽出しすぎに注意。KISS とバランスを取る

→ 次の章: [[01_命名]]
