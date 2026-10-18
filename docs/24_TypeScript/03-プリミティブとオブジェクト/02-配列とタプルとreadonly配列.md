# 配列・タプル・readonly配列

> 「配列」と一括りにされがちですが、TypeScriptには **可変配列 / タプル / readonly配列** の3つがあります。使い分けると「**意図しない書き換えが入らない**」設計が可能になり、バグが大幅に減ります。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[01-プリミティブ型]]
- 次: [[03-オブジェクト型]]

---

## 1. 配列の基本

### 2つの書き方

```typescript
const a: number[] = [1, 2, 3];           // ① 短縮記法（推奨）
const b: Array<number> = [1, 2, 3];      // ② ジェネリック記法
```

機能は同じ。**チームでどちらかに統一**するのがふつう。一般的には `T[]` の方が短くて好まれます。

### ユニオン型の配列

```typescript
const mixed: (string | number)[] = [1, "a", 2, "b"];
const wrong: string | number[] = "hello";  // ❌ 違う意味（string、または number[]）
```

カッコの位置で意味が変わるので注意。

### 配列リテラルからの推論

```typescript
const arr = [1, 2, 3];          // 推論: number[]
const mixed = [1, "a"];         // 推論: (string | number)[]
const empty = [];               // 推論: any[]（要注意）
```

空配列 `[]` は `any[]` になり、後から型が崩れます。**初期化時に注釈を**:

```typescript
const items: string[] = [];
items.push("ok");
items.push(1); // ❌
```

---

## 2. 配列の主要メソッド（型付き）

### 非破壊メソッド（新しい配列を返す）

```typescript
const arr = [1, 2, 3];

arr.map(n => n * 2);           // number[]
arr.filter(n => n > 1);         // number[]
arr.find(n => n > 1);           // number | undefined
arr.slice(0, 2);                // number[]
arr.concat([4, 5]);             // number[]
[...arr, 4];                    // number[]（スプレッド構文）
```

### 破壊メソッド（元の配列を変える）

```typescript
const arr = [1, 2, 3];

arr.push(4);     // 末尾追加（戻り値: 新しい長さ）
arr.pop();       // 末尾削除（戻り値: 削除された要素 or undefined）
arr.shift();     // 先頭削除
arr.unshift(0);  // 先頭追加
arr.sort();      // 並び替え（同じ配列を返す）
arr.reverse();   // 反転
```

### 注意: `find` / `pop` / `shift` の戻り値は `T | undefined`

```typescript
const arr: number[] = [1, 2, 3];
const x = arr.find(n => n > 100); // number | undefined
x.toFixed(); // ❌ undefinedの可能性
```

`tsconfig.json` の `noUncheckedIndexedAccess: true` を有効にすると、**インデックスアクセスも `T | undefined`** になります。安全だが、毎回チェックが要るので導入は段階的に。

---

## 3. タプル型（Tuple）

「**長さと各要素の型が固定**された配列」を表す型。

```typescript
const point: [number, number] = [10, 20];     // ✅
const wrong: [number, number] = [10, 20, 30]; // ❌ 長さが違う
const wrong2: [number, number] = [10, "a"];    // ❌ 型が違う
```

### 使い所

#### (1) 関数から複数の値を返す（小規模）

```typescript
function divmod(a: number, b: number): [number, number] {
  return [Math.floor(a / b), a % b];
}

const [q, r] = divmod(10, 3); // q: number, r: number
```

3つ以上戻り値があるならオブジェクトを返す方が読みやすい。

#### (2) Reactの `useState`

```typescript
const [count, setCount] = useState(0);
// useState の戻り値: [number, (v: number | ((p: number) => number)) => void]
```

`useState` はタプルを返す典型。

#### (3) 固定長データ（座標、RGB、日付要素など）

```typescript
type RGB = [number, number, number];
type ISODate = [year: number, month: number, day: number]; // ラベル付きタプル
```

ラベル付きタプル（TS 4.0以降）は補完に名前が出るので可読性UP。

### 可変長要素を含むタプル

```typescript
type StringsThenNumber = [...string[], number];
const a: StringsThenNumber = ["a", "b", 1]; // ✅
```

「最初は string が任意個、最後が number」のような表現も可能（あまり使わない）。

---

## 4. `readonly` 配列

「**書き換えできない配列**」。push/pop/sort などの破壊メソッドが使えなくなる。

### 2つの書き方

```typescript
const a: readonly number[] = [1, 2, 3];           // ① 推奨
const b: ReadonlyArray<number> = [1, 2, 3];       // ② 同じ
```

### 効果

```typescript
const arr: readonly number[] = [1, 2, 3];

arr.push(4);    // ❌ Property 'push' does not exist
arr[0] = 100;   // ❌ Index signature is readonly
arr.sort();     // ❌

arr.map(n => n * 2);    // ✅ 非破壊メソッドはOK
arr.filter(n => n > 1);  // ✅
[...arr, 4];             // ✅ スプレッドして新しい配列を作るのはOK
```

### 使い所

#### (1) 関数の引数を変更させない

```typescript
function sum(arr: readonly number[]): number {
  // arr.push(...) ← ❌ できない（書き換え意図がない契約が型で表現される）
  return arr.reduce((a, b) => a + b, 0);
}
```

呼び出し側が「書き換えられないなら安心して渡せる」と分かる。**API設計の基本**。

#### (2) 設定・定数を保護する

```typescript
const ROLES: readonly string[] = ["admin", "user", "guest"];
ROLES.push("admin"); // ❌ 防げる
```

#### (3) `as const` と組み合わせる

```typescript
const STATUSES = ["loading", "success", "error"] as const;
// 型: readonly ["loading", "success", "error"]

type Status = typeof STATUSES[number]; // "loading" | "success" | "error"
```

`as const` は配列を **readonly タプル** に変える効果があります（[[05-リテラル型とas-const]] 参照）。

---

## 5. `readonly` の落とし穴

### (1) ネストは readonly にならない

```typescript
const a: readonly { name: string }[] = [{ name: "Alice" }];
a.push({ name: "Bob" }); // ❌
a[0].name = "Charlie";   // ✅ 中身は変更できる！
```

`readonly` は**配列そのもの**だけ。要素のオブジェクトは変更可能。

→ 完全に不変にするなら `readonly { readonly name: string }[]` のように内側にも書く（あるいは `as const`）。

### (2) `readonly T[]` から `T[]` への代入は不可

```typescript
const ro: readonly number[] = [1, 2, 3];
const mut: number[] = ro; // ❌ readonly を捨てる代入は禁止
```

逆は可能:

```typescript
const mut: number[] = [1, 2, 3];
const ro: readonly number[] = mut; // ✅
```

「**広い権限から狭い権限へ**」は安全（書き換え権限を捨てるのはOK）。

### (3) JS 実行時には変わらない

`readonly` は**コンパイル時のチェック**。実行時は普通の配列なので、外部からの書き換えは防げません。

```typescript
const arr: readonly number[] = [1, 2, 3];
(arr as number[]).push(4); // 強制キャストすれば書ける（ランタイムは普通の配列）
```

---

## 6. `T[]` / タプル / `readonly T[]` の使い分け

| 用途 | 型 |
|---|---|
| 同じ型の要素が任意個、書き換え可 | `T[]` |
| 同じ型の要素が任意個、書き換え不可 | `readonly T[]` |
| 異なる型が決まった順で並ぶ | `[T, U, V]` |
| 上記の不変版 | `readonly [T, U, V]` |
| 関数の引数（書き換える意図なし） | `readonly T[]` を**デフォルト**に |
| 関数の戻り値 | `T[]`（呼び出し側に自由を渡す） |

> **覚え方**: 「**入口は readonly、出口は普通の配列**」。引数は受けるだけなので readonly にしても損がなく、戻り値は使う側の自由を残す。

---

## 7. よくあるパターンと罠

### (1) 配列のコピー

```typescript
const arr = [1, 2, 3];

const copy1 = [...arr];           // ✅ シャローコピー
const copy2 = arr.slice();         // ✅ 同上
const copy3 = arr;                  // ❌ 同じ配列の参照（コピーではない）
```

### (2) 配列の要素を1つだけ書き換える（不変的に）

```typescript
const arr = [1, 2, 3];
const updated = arr.map((v, i) => (i === 1 ? 99 : v));
// [1, 99, 3]
```

または:

```typescript
const updated = [...arr.slice(0, 1), 99, ...arr.slice(2)];
```

ReactなどのImmutable前提のコードでは必須テクニック。

### (3) `Array.isArray` の挙動

```typescript
function f(v: unknown) {
  if (Array.isArray(v)) {
    v; // any[]（要素型は分からない）
    v.forEach(item => {
      // item: any
    });
  }
}
```

`Array.isArray` は要素型を絞り込みません。**要素は `any`** になるので、別途チェックが必要。

### (4) スプレッドでタプル化

```typescript
const arr = [1, 2, 3];
const tuple: [number, number, number] = arr; // ❌ number[] は固定長ではない

const tuple2: [number, number, number] = [...arr]; // ❌ 同様

// ✅ as const で固定長に
const tuple3 = [1, 2, 3] as const; // readonly [1, 2, 3]
```

---

## 8. パフォーマンスのヒント

- 大きな配列を頻繁にコピーすると遅い。Immutableが必要な場合のみ。
- `arr.indexOf(x) !== -1` より `arr.includes(x)` の方が読みやすい。
- 順序が不要なら `Set` を使う方が探索が速い（`O(1)`）。
- 配列の重複削除は `[...new Set(arr)]`。

---

## 9. まとめ

- 配列の宣言は `T[]`（短縮）または `Array<T>`。**統一**して使う
- **空配列 `[]` は `any[]`** になる。初期化時に注釈を
- **タプル**: 長さと各要素の型が固定（`useState` の戻り値などで使う）
- **readonly配列**: 書き換え不可。**引数のデフォルト**として使うとAPI契約が明確に
- 注意: readonly はネストには効かない / 実行時は普通の配列
- **`as const`** で配列をreadonlyタプル化できる

> 配列の型を意識的に選ぶだけで、「気付かないうちに引数を書き換えていた」系のバグが消えます。実務では **`readonly T[]` をデフォルト**にしておくと安全です。

---

## 関連
- [[03-オブジェクト型]]
- [[05-リテラル型とas-const]]
- [[noUncheckedIndexedAccess]]
- [[exactOptionalPropertyTypes]]
