# リテラル型・`as const`

> 「`"loading"` という**値**を、そのまま**型**として扱う」── これがリテラル型の発想です。`as const` はその扉を開けるカギ。両者を理解すると、TypeScriptで「**間違った文字列が混ざらない**」コードが書けるようになります。

## 目次
- [[01Programming/目次|← 教材目次に戻る]]
- 前: [[04-neverの意味]]
- 次: [[06-型アサーションとas-constの違い]]

---

## 1. リテラル型とは

**リテラル型（Literal Type）** とは、「特定の値そのもの」を表す型です。

```typescript
let s: "hello" = "hello"; // "hello" 以外は代入できない
s = "world"; // ❌ Type '"world"' is not assignable to type '"hello"'.

let n: 42 = 42;
n = 43; // ❌

let b: true = true;
b = false; // ❌
```

`string` のような「広い」型ではなく、「**この値だけ**」という極限まで狭い型です。

### 文字列リテラル型 / 数値リテラル型 / 真偽値リテラル型

```typescript
type Direction = "up" | "down" | "left" | "right";
type Dice = 1 | 2 | 3 | 4 | 5 | 6;
type Flag = true;

function move(d: Direction) { ... }
move("up");      // ✅
move("upward");  // ❌ "upward" is not assignable to '"up" | ...'
```

---

## 2. なぜリテラル型が便利なのか

### (1) タイポをコンパイル時に防げる

```typescript
type Status = "loading" | "success" | "error";

function setStatus(s: Status) { ... }
setStatus("loading"); // ✅
setStatus("loadign"); // ❌ コンパイルエラー（タイポを即検出）
```

`string` 引数だったらタイポが通り、**実行時に静かに壊れる**ところを、リテラル型が事前に止めてくれます。

### (2) IDEで補完が出る

`Status` 型の引数の場所では、エディタが `"loading" | "success" | "error"` を候補表示してくれます。**ドキュメントを見なくても使える**。

### (3) 判別可能ユニオンに使える

```typescript
type Result =
  | { kind: "ok"; value: number }
  | { kind: "err"; error: string };

function handle(r: Result) {
  if (r.kind === "ok") {
    r.value; // ✅ number
  } else {
    r.error; // ✅ string
  }
}
```

`kind` フィールドが**リテラル型**だからこそ、`if` で絞り込むと残りのフィールドの型が確定します。

---

## 3. Widening（型の広がり）── ここで初心者は驚く

リテラル型の理解で最大の壁が **widening** です。

### `let` と `const` で型推論が違う

```typescript
let a = "hello";   // 型: string
const b = "hello"; // 型: "hello"
```

- `let` は再代入されうる → **広い型**（`string`）に推論される
- `const` は再代入できない → **狭い型**（リテラル型）に推論される

これは「変わるかもしれない値は、変わる先も含めた広い型にしておこう」という設計です。

### オブジェクト・配列のプロパティはさらに広がる

```typescript
const obj = { kind: "ok", value: 42 };
// 型: { kind: string; value: number }
//                    ^^^ "ok" ではなく string
```

オブジェクトのプロパティは `const` で宣言しても**再代入可能**（`obj.kind = "err"` できる）なので、widening が起きます。

```typescript
const arr = [1, 2, 3];
// 型: number[]（[1, 2, 3] というタプルではない）
```

---

## 4. `as const` の効果

`as const` は「**widening を止めて、可能な限り狭い型に固定する**」アサーションです。

### (1) リテラル型を保つ

```typescript
const a = "hello" as const;
// 型: "hello"

const obj = { kind: "ok", value: 42 } as const;
// 型: { readonly kind: "ok"; readonly value: 42 }

const arr = [1, 2, 3] as const;
// 型: readonly [1, 2, 3]
```

### (2) すべてのプロパティが `readonly` になる

```typescript
const obj = { x: 1, y: 2 } as const;
obj.x = 3; // ❌ Cannot assign to 'x' because it is a read-only property.
```

意図しない書き換えを防ぐ副次効果も。

### (3) 配列がタプル型になる

```typescript
const tuple = [1, "a", true] as const;
// 型: readonly [1, "a", true]

// as const なしだと…
const arr = [1, "a", true];
// 型: (string | number | boolean)[]（順序情報も値も失われる）
```

---

## 5. `as const` の典型的な使い所

### (1) ユニオン型の選択肢を**値**として持つ

```typescript
const STATUSES = ["loading", "success", "error"] as const;
type Status = typeof STATUSES[number];
// 型: "loading" | "success" | "error"

function isStatus(s: string): s is Status {
  return (STATUSES as readonly string[]).includes(s);
}
```

**配列の中身がそのまま型になる**。値と型を二重に書かなくて済む。

### (2) オブジェクトをそのまま型として使う

```typescript
const ROLES = {
  admin: "Administrator",
  user: "Regular User",
  guest: "Guest",
} as const;

type RoleKey = keyof typeof ROLES;
// "admin" | "user" | "guest"

type RoleLabel = typeof ROLES[RoleKey];
// "Administrator" | "Regular User" | "Guest"
```

### (3) 関数の引数を判別可能ユニオンに渡す

```typescript
type Action =
  | { type: "ADD"; payload: number }
  | { type: "RESET" };

function dispatch(a: Action) { ... }

// ❌ 失敗例
const action = { type: "ADD", payload: 1 };
dispatch(action); // エラー: type が string と推論されるため

// ✅
const action = { type: "ADD", payload: 1 } as const;
dispatch(action); // OK
```

オブジェクトを変数に入れて関数に渡す典型パターン。`as const` なしだと型が広がって判別ユニオンに合わなくなる。

### (4) Reactの `useReducer` のアクション型

```typescript
const increment = () => ({ type: "INCREMENT" } as const);
const setValue = (v: number) => ({ type: "SET", value: v } as const);

type Action =
  | ReturnType<typeof increment>
  | ReturnType<typeof setValue>;
```

**アクションクリエイタの戻り値からアクション型を導出**する強力なパターン。

### (5) enum の代替

```typescript
const Direction = {
  Up: "up",
  Down: "down",
  Left: "left",
  Right: "right",
} as const;

type Direction = typeof Direction[keyof typeof Direction];
// "up" | "down" | "left" | "right"
```

`enum` を使うより、`as const` オブジェクトの方が**ツリーシェイキングしやすく、JS互換性も高い**。チームによっては `enum` 禁止にしているところも多い。

---

## 6. `as const` を使わなくてよい場面

### (1) 関数の引数で直接渡す場合

```typescript
type Status = "loading" | "success" | "error";

function setStatus(s: Status) { ... }
setStatus("loading"); // ✅ 文脈から型が決まる（contextual typing）
```

引数の型が分かっているなら、引数として直接渡したリテラルは widening されません。

### (2) 型注釈で広い型を期待しているとき

```typescript
const config: Record<string, string> = {
  apiUrl: "https://...",
  // ...
};
// as const は不要（むしろ readonly が邪魔になる場合も）
```

---

## 7. `as const` の注意点

### (1) ネストしたオブジェクトもすべて readonly になる

```typescript
const config = {
  api: { url: "https://..." },
  features: ["a", "b"],
} as const;

config.api.url = "...";       // ❌ readonly
config.features.push("c");    // ❌ readonly tuple
```

「ちょっと変更したい」が一切できなくなる。本当に不変な定数にだけ使う。

### (2) 関数引数では「文脈型」が優先される

```typescript
function take(x: string) { ... }
take("hello" as const); // ✅ 通る（"hello" は string のサブタイプ）
```

引数として渡す瞬間、`as const` の効果は消えます（広い型として受け入れられる）。

### (3) `as const` はキャストではない

`as const` は「**狭める**」アサーション。`as SomeType` のように**異なる型に変換する**ものではありません。誤用しないために [[06-型アサーションとas-constの違い]] を必ず読みましょう。

---

## 8. 実践チェックリスト

「これ、リテラル型 + `as const` でいけないか？」と考えるべき場面:

- [ ] 文字列の選択肢が決まっている（`"a" | "b" | "c"`）→ リテラルユニオン型
- [ ] 配列の中身がそのままユニオン型になる → `as const` + `typeof[number]`
- [ ] オブジェクトをアクション/設定として渡す → `as const`
- [ ] enum を使っている → `as const` オブジェクトに置き換えを検討
- [ ] 「タイポしそうな文字列引数」がある → リテラル型化

---

## 9. まとめ

- **リテラル型** = 値そのものを型にしたもの（`"hello"` 型）
- **widening** = `let` やオブジェクトプロパティで型が広がる挙動
- **`as const`** = widening を止め、すべて readonly + リテラル型に固定
- 使い所: **選択肢のユニオン化 / 判別ユニオン / enum代替 / アクション型**
- 注意: 全プロパティが readonly になる / 関数引数では文脈型が優先

> リテラル型と `as const` を使いこなせると、「**マジックストリングが型で守られる**」世界に入れます。コードに登場する文字列の99%は、本当はリテラルユニオンに置き換え可能です。

---

## 関連
- [[06-型アサーションとas-constの違い]]
- [[enum_vs_const_assertions]]
- [[01-型注釈と型推論]]
