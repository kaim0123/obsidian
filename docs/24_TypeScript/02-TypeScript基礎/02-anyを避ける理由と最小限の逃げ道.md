# `any` を避ける理由と最小限の逃げ道

> `any` を使った瞬間、TypeScriptは「ただの遅いJavaScript」になります。**なぜ避けるのか**を腹落ちさせ、**それでも使う必要がある場面**を限定的に許容する ── このバランス感覚が、実務で生き残る型の使い方です。

## 目次
- [[01Programming/目次|← 教材目次に戻る]]
- 前: [[01-型注釈と型推論]]
- 次: [[03-unknownと安全な取り扱い]]

---

## 1. `any` とは何か

`any` は「**型チェックを放棄する**」という宣言です。`any` 型の値には、TypeScriptは何のチェックもかけません。

```typescript
let v: any = 1;

v.toUpperCase();   // ✅ コンパイルOK（実行時エラー）
v(1, 2, 3);        // ✅ コンパイルOK（実行時エラー）
v.foo.bar.baz;     // ✅ コンパイルOK（実行時エラー）

const n: number = v;       // ✅ 何にでも代入できる
const s: string = v;       // ✅ 何にでも代入できる
```

「便利」に見えますが、**TypeScriptを使う意味そのものを消す**選択です。

---

## 2. `any` の何が危険か

### (1) 型エラーが「沈黙する」

```typescript
function getUser(): any {
  return { name: "Alice" };
}

const u = getUser();
console.log(u.namee.toUpperCase()); // タイポ。実行時エラー（型チェックは通る）
```

タイポや存在しないプロパティへのアクセスが**コンパイルでは検知されません**。

### (2) `any` は「伝染」する

`any` を使うと、その値から派生したものが**全部 `any` になります**。

```typescript
function getUser(): any {
  return { name: "Alice", age: 30 };
}

const u = getUser();         // u: any
const name = u.name;         // name: any（string ではない！）
const upper = name.toUpperCase();  // upper: any
```

たった1か所の `any` が、関数の外、モジュールの外まで型情報を**じわじわ崩していく**のが最大の問題です。

### (3) リファクタが壊れる

`any` の値を扱うコードは、**他の型を変更したときの影響範囲が分かりません**。

```typescript
type User = { name: string; age: number };

function process(u: any) {
  console.log(u.age);
}

// User から age を消したい → process は気付かず通ってしまう
```

「型を変えたら関連箇所が全部エラーになる」というTypeScript最大のメリットが、`any` を挟むと消えます。

### (4) IDE補完が効かない

`any` の値には**プロパティ補完が出ません**（出ても全プロパティが候補になる）。開発体験が一気に悪化します。

---

## 3. `any` が混入する典型パターン

意図せず `any` が入る経路を知っておくと、防げます。

### (1) 暗黙のany（implicit any）

引数の型を書き忘れると、自動で `any` になります。

```typescript
function greet(user) {  // user: any
  return `Hello ${user}`;
}
```

→ `tsconfig.json` で `"noImplicitAny": true`（または `"strict": true`）にすれば**警告**になります。**必ずオン**に。

### (2) 空配列

```typescript
const items = [];      // items: any[]
items.push("hello");
items.push(123);       // 何でも入る
```

→ 初期化時に注釈をつける。

```typescript
const items: string[] = [];
```

### (3) `JSON.parse` の戻り値

```typescript
const data = JSON.parse('{"name":"Alice"}'); // data: any
data.namee.toUpperCase(); // タイポでも通る
```

→ 後述の `unknown` で受けるか、Zod等のバリデータを使う。

### (4) サードパーティ型定義の `any`

ライブラリの型定義（`@types/*`）に `any` が含まれていることがあります。これは**コントロール外**ですが、自分のコードでは追加でチェックしましょう。

### (5) `as any` での強制キャスト

```typescript
const x = (someValue as any).foo; // 型チェックを破壊
```

これは「**意図的な `any` 注入**」です。コードレビューで弾く対象。

---

## 4. `any` を避けるための代替手段

ほとんどの「`any` で済ませたい場面」は、以下のいずれかで置き換え可能です。

### (1) `unknown` を使う

「型が分からない値」を受けるなら `any` ではなく `unknown` を使います。

```typescript
function parseInput(raw: string): unknown {
  return JSON.parse(raw);
}

const data = parseInput("...");
// data.name; // ❌ エラー：型を絞ってから使え

if (typeof data === "object" && data !== null && "name" in data) {
  // ここで data.name にアクセスできる（要narrowing）
}
```

詳しくは [[03-unknownと安全な取り扱い]]。

### (2) ジェネリクスを使う

「型が分からない」のではなく「**呼び出し側で決まる**」場合はジェネリクス。

```typescript
// ❌
function first(arr: any[]): any {
  return arr[0];
}

// ✅
function first<T>(arr: T[]): T {
  return arr[0];
}

const n = first([1, 2, 3]); // n: number
const s = first(["a", "b"]); // s: string
```

### (3) ユニオン型で列挙する

「複数の型を取り得る」なら、`any` ではなくユニオン型で具体的に書く。

```typescript
// ❌
function format(value: any): string { ... }

// ✅
function format(value: string | number | Date): string { ... }
```

### (4) 型ガードで絞り込む

`unknown` で受けて、`typeof` / `instanceof` / ユーザー定義型ガードで絞り込む。

```typescript
function process(value: unknown) {
  if (typeof value === "string") {
    return value.toUpperCase(); // ここでは string
  }
  if (Array.isArray(value)) {
    return value.length;        // ここでは any[]（要さらに絞り込み）
  }
  throw new Error("unsupported");
}
```

### (5) Zod等でバリデーションする

外部入力（API、フォーム、JSON）はバリデータで型を保証する。

```typescript
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const data: unknown = JSON.parse(raw);
const user = UserSchema.parse(data); // user: { name: string; age: number }
```

---

## 5. それでも `any` を使ってよい「最小限の逃げ道」

実務では `any` ゼロは現実的でないこともあります。**条件付き**で許容できる場面を整理します。

### (1) 型のないレガシーJSライブラリの取り込み

`@types` がなく、自分で `.d.ts` も書く余裕がないとき、**1か所だけ** `any` で受け、すぐに型のある世界に閉じ込める。

```typescript
// 1か所だけ any、外には漏らさない
import legacyLib from "untyped-lib";

export function safeLegacyCall(input: string): string {
  const result = (legacyLib as any).process(input);
  return String(result); // 戻り値の型を確定
}
```

ポイント: **`any` を関数の境界で吸収し、外に出さない**。

### (2) 動的すぎて型化が割に合わない箇所

メタプログラミング、動的プロパティアクセスなど、型を書くコストが利益を上回る場面。**コメントで明記**する。

```typescript
// any: 動的にプラグインが追加するキー。スキーマ化しても保守できないため許容
const handlers: Record<string, any> = {};
```

### (3) 既存コードの段階的移行

JS→TS移行中は、いきなり厳密にできないことも。「**いずれ unknown / 具体型に置き換える**」というTODOを残す。

```typescript
// TODO(2026-Q2): unknown化してバリデータを通す
function legacyHandler(payload: any) { ... }
```

---

## 6. `any` 運用ルール（チームで決めておくとよい）

1. **`tsconfig.json` で `"noImplicitAny": true`** を必須に。
2. **`as any` は禁止 or 要レビュー承認**。
3. ESLint の `@typescript-eslint/no-explicit-any` を `error` または `warn` に。
4. やむを得ず使うときは **`// eslint-disable-next-line` + 理由コメント**を必ず付ける。
5. **公開API（exportされる関数の引数・戻り値）には絶対に `any` を出さない**。

---

## 7. `any` チェックリスト（書く前に自問）

- [ ] それ、`unknown` で受けて絞り込めない？
- [ ] それ、ジェネリクス `<T>` で表現できない？
- [ ] それ、ユニオン型で列挙できない？
- [ ] それ、Zod等のバリデータで保証できない？
- [ ] 上のすべてに「No」だとして、`any` を**この関数の中だけに閉じ込められる**？

最後の「閉じ込められる」が **YES** なら使ってOK。**外に漏れるなら絶対NG**。

---

## 8. まとめ

- `any` は型チェックを**放棄する**宣言。便利だが代償は大きい。
- 危険は4つ: **沈黙するエラー / 伝染 / リファクタ崩壊 / 補完喪失**
- 代替は4つ: **`unknown` / ジェネリクス / ユニオン型 / バリデータ**
- 使うなら: **境界で吸収して外に出さない**。コメントで理由を残す。
- ルール: **`noImplicitAny: true`** + **ESLintで `no-explicit-any`**。

> 「`any` は道具ではなく**敗北宣言**」と心得る。負けるのは構わないが、負けたことを認識しておくこと。

---

## 関連
- [[03-unknownと安全な取り扱い]]
- [[04-neverの意味]]
- [[型推論の仕組み]]
- [[any_unknown_never]]
