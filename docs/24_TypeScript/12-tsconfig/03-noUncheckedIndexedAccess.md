# `noUncheckedIndexedAccess` の影響

> 配列の `arr[10]` や辞書の `obj["key"]` ── これらは**実は `undefined` を返しうる**のに、TypeScriptはデフォルトで「必ず値がある」とみなしています。`noUncheckedIndexedAccess: true` を有効にすると、**インデックスアクセスが正直に `T | undefined` を返す**ようになり、本物の null安全に近づけます。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[02-strictと主要オプション]]
- 次: [[04-exactOptionalPropertyTypes]]

---

## 1. デフォルトの問題

`strict: true` でも、配列・辞書のアクセスは**「必ず値がある」前提**で型推論される:

```typescript
const arr: number[] = [1, 2, 3];
const x = arr[10]; // 型: number （実は undefined！）
x.toFixed();        // 通る → 実行時エラー: Cannot read property 'toFixed' of undefined
```

```typescript
const dict: Record<string, string> = { a: "A" };
const v = dict.unknown; // 型: string （実は undefined！）
v.toUpperCase();        // 実行時エラー
```

→ **型と実態の不一致**が起きる。

---

## 2. `noUncheckedIndexedAccess: true` で解決

```json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true
  }
}
```

これを有効にすると、**インデックスアクセスの戻り値に自動で `| undefined` が付く**:

```typescript
const arr: number[] = [1, 2, 3];
const x = arr[10];   // 型: number | undefined
x.toFixed();          // ❌ undefined の可能性
if (x !== undefined) {
  x.toFixed();        // ✅
}
```

```typescript
const dict: Record<string, string> = { a: "A" };
const v = dict.unknown;  // 型: string | undefined
v.toUpperCase();          // ❌
v?.toUpperCase();         // ✅
```

→ **未存在のキー・インデックス**が型で表現される。

---

## 3. 影響を受ける場面

### (1) 配列インデックスアクセス

```typescript
const arr = [1, 2, 3];
const first = arr[0];  // number | undefined
const last = arr[arr.length - 1]; // number | undefined
```

### (2) `Record` / インデックスシグネチャ

```typescript
type Dict = Record<string, number>;
const d: Dict = { a: 1 };
const v = d.b; // number | undefined

type T = { [key: string]: number };
const t: T = { ... };
const x = t.anything; // number | undefined
```

### (3) `Map` / `Set` メソッド

`Map.get` などはもともと `T | undefined` を返すので影響なし。

```typescript
const m = new Map<string, number>();
m.get("key"); // number | undefined （変わらず）
```

### (4) 文字列のインデックスアクセス

```typescript
const s = "hello";
const c = s[0]; // string | undefined （有効時）
```

→ 文字列にも適用される。

---

## 4. 影響を受けない場面

### (1) タプル型

```typescript
const t: [number, string] = [1, "a"];
const x = t[0]; // number （変わらず）
const y = t[1]; // string （変わらず）
```

タプル型は**長さが固定**なので、`undefined` にならない。

### (2) `for...of`

```typescript
for (const item of arr) {
  item; // number （変わらず）
}
```

ループ内の `item` は `undefined` にならない（実際にループする要素のみ）。

### (3) `forEach` / `map` のコールバック

```typescript
arr.forEach((item) => {
  item; // number （変わらず）
});
```

### (4) `find` の戻り値

```typescript
arr.find((x) => x > 0); // number | undefined （元から | undefined）
```

`find` はもともと `| undefined` を返すので変わらず。

---

## 5. 実例: ハマりやすいパターン

### `find` のあとのアクセス

```typescript
const users = [{ id: "1", name: "Alice" }];
const u = users.find(u => u.id === "1");
// u: { id: string; name: string } | undefined

// 有効化前: u.name とアクセスできてしまう
// 有効化後: u は undefined チェック必要

if (u) {
  console.log(u.name); // ✅
}
```

### 配列の最初/最後

```typescript
const items = [1, 2, 3];
const first = items[0];   // number | undefined
const last = items[items.length - 1]; // number | undefined
```

→ 「**配列が空の可能性**」が型で表現される。

### Object.keys のループ

```typescript
const data: Record<string, number> = { a: 1, b: 2 };
const keys = Object.keys(data); // string[]

for (const k of keys) {
  const v = data[k]; // number | undefined
  // ループしているキーなのに undefined !? と感じるが、型としては正しい
}
```

→ 一見奇妙だが、`Object.keys` の戻り値型は `string[]`（実際のキーに絞られない）。型としては正しい挙動。

---

## 6. 困る場面と対処

### (1) ループで明らかに存在するアクセス

```typescript
for (let i = 0; i < arr.length; i++) {
  arr[i].toFixed(); // ❌ undefined の可能性
}
```

「`i < arr.length` だから絶対ある」のに型がそう推論しない。

#### 対処

**(a) ローカル変数に取る**

```typescript
for (let i = 0; i < arr.length; i++) {
  const v = arr[i];
  if (v !== undefined) v.toFixed();
}
```

**(b) `for...of` を使う**

```typescript
for (const v of arr) {
  v.toFixed(); // ✅
}
```

**(c) `!` で表明**（最終手段）

```typescript
for (let i = 0; i < arr.length; i++) {
  arr[i]!.toFixed(); // ⚠ 自分で保証
}
```

→ `for...of` が最も安全で読みやすい。

### (2) 「絶対あるはず」のキーアクセス

```typescript
const messages: Record<Status, string> = {
  ok: "Success",
  ng: "Failure",
};

const m = messages.ok; // string | undefined（型としては）
```

#### 対処

**型をリテラルキーに絞る** → `Record<リテラル, V>` なら**全キー必須**になる。実は `noUncheckedIndexedAccess` の影響を受けない:

```typescript
type Status = "ok" | "ng";
const messages: Record<Status, string> = { ok: "...", ng: "..." };
messages.ok; // string ✅（リテラルキーなら undefined にならない！）
```

→ **`Record<リテラルユニオン, V>` は安全**。`Record<string, V>` だけが影響を受ける。

### (3) `as` で逃げる誘惑

```typescript
const x = arr[0] as number;
```

→ 型を嘘でつけているだけ。`if` チェックを書く方が安全。

---

## 7. 既存プロジェクトへの導入

`noUncheckedIndexedAccess` を後から有効にすると、**大量のエラー**が出ることがある。

### 段階的に対応

1. **新規ファイル**から適用（古いものは `// @ts-nocheck` で逃げる）
2. **危険な配列アクセスを優先的に修正**
3. **ループは `for...of` に書き換え**
4. **`Record<string, V>` を `Record<リテラル, V>` に絞る**

### CI で段階的に

```bash
tsc --noEmit | wc -l
```

→ エラー数を計測しながら段階的に減らす。

---

## 8. パフォーマンスへの影響

`noUncheckedIndexedAccess` は型チェックの**負荷を増やす**ことがある（`| undefined` が増えるため）。**大規模プロジェクト**では型チェック速度が落ちることも。

→ 現代の TS では実用上問題ないことが多いが、巨大プロジェクトでは**ベンチマーク**を。

---

## 9. 関連オプションとの関係

### `strictNullChecks` との違い

- **`strictNullChecks`**: 型注釈で `| null` / `| undefined` を明示しないと代入できない
- **`noUncheckedIndexedAccess`**: インデックスアクセスの戻り値が自動で `| undefined` になる

→ **両方有効**でやっと「真の null安全」。

### `exactOptionalPropertyTypes` との関係

別物。`exactOptionalPropertyTypes` はオプショナルプロパティの厳密化、こちらはインデックスアクセスの厳密化。両方とも有効推奨。

---

## 10. 実例: 安全なコードの書き方

### 配列の最初

```typescript
// ❌
const first = arr[0];
console.log(first.toFixed());

// ✅
const first = arr[0];
if (first !== undefined) {
  console.log(first.toFixed());
}

// ✅ デフォルト値
const first = arr[0] ?? 0;
console.log(first.toFixed());

// ✅ 早期リターン
if (arr.length === 0) return;
const first = arr[0]!; // ここまでで保証される（!の使用は限定的に）
```

### 辞書アクセス

```typescript
// ❌
const v = dict[key];
v.toUpperCase();

// ✅
const v = dict[key];
v?.toUpperCase();

// ✅
const v = dict[key] ?? "default";
v.toUpperCase();
```

### ループ

```typescript
// ❌（古い書き方）
for (let i = 0; i < arr.length; i++) {
  arr[i].toFixed();
}

// ✅
for (const x of arr) {
  x.toFixed();
}

// ✅
arr.forEach(x => x.toFixed());
```

---

## 11. ベストプラクティス

### (1) **新規プロジェクトでは有効化**

`strict: true` と一緒にデフォルトでオン。

### (2) **`for...of` を使う**

伝統的な `for (let i = 0; i < ...; i++)` より安全。

### (3) **`Record<string, V>` を避ける**

可能なら `Record<リテラルユニオン, V>` にして、安全な辞書に。

### (4) **`!` の使用は最低限**

「絶対ある」と確信できる場合のみ、コメント付きで。

### (5) **`?.` `??` を活用**

```typescript
const name = user.profile?.name ?? "anonymous";
```

`undefined` を自然に扱える書き方を覚える。

---

## 12. アンチパターン

### (1) 全部 `!` で潰す

```typescript
const x = arr[0]!;
const y = dict[k]!;
```

→ 有効化した意味がなくなる。

### (2) `// @ts-ignore` で消す

```typescript
// @ts-ignore
const x = arr[0];
x.toFixed();
```

→ 同上。

### (3) `as` で型を嘘でつける

```typescript
const x = arr[0] as number;
```

→ 同上。

### (4) 「面倒」だから無効化

```json
{ "noUncheckedIndexedAccess": false }
```

→ バグの温床に戻る。**1度有効化したら戻さない**。

---

## 13. まとめ

- **`noUncheckedIndexedAccess: true`**: インデックスアクセスの戻り値を `T | undefined` に
- 影響: `arr[i]` / `Record<string, V>` のキーアクセスが安全に
- 影響なし: タプル / `for...of` / `Map.get` / `Record<リテラル, V>`
- 対処: **`for...of`**, **`?.` / `??`**, **デフォルト値**, **リテラルユニオンキー**
- `strictNullChecks` と**併用してやっと真の null安全**
- 新規プロジェクトでは **`strict: true` と一緒に有効化**

> `noUncheckedIndexedAccess` は「**TypeScript の null安全のラスボス**」。これを有効にすると `Cannot read property of undefined` エラーが**ほぼ消えます**。新規プロジェクトでは絶対オンに、既存は段階的に。

---

## 関連
- [[02-strictと主要オプション]]
- [[04-exactOptionalPropertyTypes]]
- [[05-null安全とstrictNullChecks]]
- [[noUncheckedIndexedAccess]]
