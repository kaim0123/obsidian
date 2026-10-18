# `unknown` と安全な取り扱い

> `unknown` は「**何が入っているか分からないけれど、安全に扱える箱**」です。`any` の安全な代替として、外部から入ってくるデータを受け取る場面で必須の型になります。

## 目次
- [[01Programming/目次|← 教材目次に戻る]]
- 前: [[02-anyを避ける理由と最小限の逃げ道]]
- 次: [[04-neverの意味]]

---

## 1. `unknown` とは何か

`unknown` は「**任意の型の値が入りうるが、使う前に型を確定させなければならない**」という型です。

```typescript
let v: unknown;

v = 1;          // ✅
v = "hello";    // ✅
v = { a: 1 };   // ✅
v = null;       // ✅

v.toUpperCase(); // ❌ エラー: Object is of type 'unknown'.
v.length;        // ❌ エラー
v();             // ❌ エラー
```

代入は何でもOK。**使うときに「どんな型か」を絞り込まないとエラー**になります。

---

## 2. `any` との違い（最重要）

| 観点 | `any` | `unknown` |
|---|---|---|
| 何でも代入できる | ✅ | ✅ |
| メソッド・プロパティに**そのまま**アクセス | ✅ | ❌（要narrowing） |
| 他の型に**そのまま**代入 | ✅ | ❌（`unknown` または同型のみ） |
| 型チェックが効く | ❌ | ✅ |
| 型補完 | ❌ | ✅（絞り込み後） |

```typescript
// any: そのまま使える（危険）
let a: any = JSON.parse(text);
a.foo.bar.baz; // 通る（実行時に死ぬ）
const n: number = a; // 通る（実行時に死ぬ）

// unknown: 絞り込まないと使えない（安全）
let u: unknown = JSON.parse(text);
u.foo;               // ❌ エラー
const n: number = u; // ❌ エラー
```

> **覚え方**: `any` は「**型を諦める**」、`unknown` は「**型を後で確定する**」。

---

## 3. `unknown` を絞り込む方法（narrowing）

### (1) `typeof` でプリミティブを判定

```typescript
function process(v: unknown) {
  if (typeof v === "string") {
    v.toUpperCase(); // ✅ ここでは string
  }
  if (typeof v === "number") {
    v.toFixed(2);    // ✅ ここでは number
  }
  if (typeof v === "boolean") {
    v.valueOf();     // ✅ ここでは boolean
  }
}
```

### (2) `instanceof` でクラスを判定

```typescript
function handle(err: unknown) {
  if (err instanceof Error) {
    console.log(err.message); // ✅ Error
  } else if (err instanceof Date) {
    console.log(err.getTime()); // ✅ Date
  }
}
```

### (3) `Array.isArray` で配列を判定

```typescript
function flatten(v: unknown): unknown[] {
  if (Array.isArray(v)) {
    return v; // ✅ ここでは any[]（要素型は不明）
  }
  return [v];
}
```

### (4) `in` 演算子でプロパティの存在を判定

```typescript
function getName(v: unknown): string {
  if (typeof v === "object" && v !== null && "name" in v) {
    // この時点で v: object & Record<"name", unknown>
    if (typeof v.name === "string") {
      return v.name;
    }
  }
  return "anonymous";
}
```

### (5) ユーザー定義型ガード（type predicate）

複数のプロパティをチェックするときは、関数に切り出す。

```typescript
type User = { id: string; name: string };

function isUser(v: unknown): v is User {
  return (
    typeof v === "object" &&
    v !== null &&
    "id" in v && typeof (v as any).id === "string" &&
    "name" in v && typeof (v as any).name === "string"
  );
}

function greet(v: unknown) {
  if (isUser(v)) {
    console.log(`Hello, ${v.name}`); // ✅ User
  }
}
```

ただし**手書きの型ガードはミスの温床**です。フィールドが増えるとチェック漏れも増えます。実務では Zod 等のバリデータを使う方が安全。

### (6) Zod等のバリデータでまとめて検証

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

function handle(input: unknown) {
  const result = UserSchema.safeParse(input);
  if (result.success) {
    console.log(result.data.name); // ✅ 型安全
  } else {
    console.error(result.error);
  }
}
```

スキーマと型が**一元管理**できるため、フィールド追加時の漏れがなくなります。

---

## 4. `unknown` を使うべき場面

### (1) `JSON.parse` の戻り値を受ける

`JSON.parse` の戻り値は標準で `any` ですが、**自前で `unknown` で受け直す**のがベストプラクティス。

```typescript
function parseJSON(s: string): unknown {
  return JSON.parse(s);
}

const data = parseJSON('{"name":"Alice"}');
// 必ず絞り込む
```

### (2) APIレスポンスを受ける

```typescript
async function fetchUser(id: string): Promise<unknown> {
  const res = await fetch(`/api/users/${id}`);
  return res.json(); // 標準では Promise<any>、unknownに変えると安全
}

const data = await fetchUser("u1");
const user = UserSchema.parse(data); // 検証してから使う
```

### (3) catch句のエラー

TypeScript 4.4以降、`tsconfig.json` の `useUnknownInCatchVariables: true`（または `strict: true`）で `catch (err)` の `err` が `unknown` 型になります。

```typescript
try {
  await something();
} catch (err) {
  // err: unknown
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error("unknown error", err);
  }
}
```

エラーは Error 型とは限らない（throw "string" もできる）ため、`unknown` で扱うのが正しい。

### (4) ライブラリの境界

汎用ユーティリティで「呼び出し側が型を決める」場面では、引数を `unknown` にしてユーザに narrowing を任せるパターン。

```typescript
function isNonNull<T>(v: T | null | undefined): v is T {
  return v !== null && v !== undefined;
}

// 任意のunknown値を扱うユーティリティ
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
```

---

## 5. `unknown` を使うときの実装パターン

### パターンA: 入口で `unknown` → すぐにバリデーション

```typescript
async function loadUser(id: string): Promise<User> {
  const raw: unknown = await (await fetch(`/api/users/${id}`)).json();
  return UserSchema.parse(raw); // 型を確定して返す
}
```

→ **関数の外には `unknown` を出さない**。

### パターンB: 入口で `unknown` → 一段階の型ガードで絞り込み

```typescript
function safeStringify(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}
```

### パターンC: コールバック引数を `unknown` にして利用側に委ねる

```typescript
type EventHandler = (payload: unknown) => void;

const handlers: Record<string, EventHandler> = {
  click: (p) => {
    if (typeof p === "object" && p !== null && "x" in p) {
      // ...
    }
  },
};
```

---

## 6. `unknown` の落とし穴

### (1) `unknown` を `any` に逃がしたくなる

```typescript
const data: unknown = JSON.parse(s);
console.log((data as any).name); // ❌ 元も子もない
```

→ せっかく `unknown` で受けたなら、**ちゃんと絞り込む**こと。

### (2) `unknown[]` の要素は `unknown`

```typescript
const arr: unknown[] = [1, "a", true];
arr[0].toString(); // ❌ unknown
arr.forEach(item => {
  // item: unknown
});
```

要素ごとに narrowing が必要。

### (3) `Object.keys` の戻り値

```typescript
const obj: Record<string, unknown> = { a: 1, b: "x" };
Object.keys(obj).forEach(k => {
  obj[k]; // unknown
});
```

→ 値を使う前に narrowing。

### (4) 「`unknown` なら何でもOK」ではない

`unknown` は**逃げ道ではなく、型確定を要求するゲート**。型確定をスキップしたら `any` と変わりません。

---

## 7. `any` / `unknown` / 具体型 の選び方フローチャート

```
値が来た
  ├─ 型が完全に分かっている？
  │    └─ YES → 具体型（string, User, など）
  ├─ 呼び出し側で決まる？
  │    └─ YES → ジェネリクス <T>
  ├─ 型は不明だが、検証してから使う？
  │    └─ YES → unknown + バリデータ
  └─ 型をどうしても付けられない？
       └─ YES → any（最終手段、コメント必須、境界で吸収）
```

---

## 8. まとめ

- `unknown` = **「使う前に型を確定させてね」という安全な any**
- `any` との違い: **そのまま使えない / 他の型に代入できない**
- 絞り込み手段: `typeof` / `instanceof` / `Array.isArray` / `in` / 型ガード / バリデータ
- 使うべき場面: **JSON.parse / APIレスポンス / catch句 / ライブラリ境界**
- 鉄則: **入口で `unknown` で受け、関数を出る前に絞り込む**

> `unknown` を使いこなせるようになると、「外の世界から来たデータ」を**安全に内部の型世界に取り込む**設計ができるようになります。これが中級者の入口です。

---

## 関連
- [[02-anyを避ける理由と最小限の逃げ道]]
- [[04-neverの意味]]
- [[any_unknown_never]]
