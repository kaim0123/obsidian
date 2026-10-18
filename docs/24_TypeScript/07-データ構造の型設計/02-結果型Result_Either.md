# 例外より結果型（Result / Either 的パターン）

> 「失敗したら throw」── これがJavaScript世界の標準ですが、**例外は型シグネチャに現れません**。「**この関数が失敗するか**」を型で表現するのが Result型 / Either 型のパターンです。一度この設計に慣れると、エラーハンドリングが**コンパイラに守られる**世界に入れます。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[01-ドメインモデルの表現]]
- 次: [[03-不変を前提にした型]]

---

## 1. 例外（throw）の何が問題か

### (1) 失敗が型に現れない

```typescript
function parseUser(json: string): User {
  const data = JSON.parse(json); // 失敗で throw
  if (!isUser(data)) throw new Error("invalid");
  return data;
}

const u = parseUser(input); // 失敗するかもしれないのに、型は User
```

→ 呼び出し側が「**`try/catch` が必要**」と気付けない。

### (2) 例外は伝播する

```typescript
function a() { throw new Error("boom"); }
function b() { return a(); }       // throw する
function c() { return b(); }        // throw する
function main() { return c(); }     // throw する
```

「どこで投げられたか」「どこで catch すべきか」が**コードを読まないと分からない**。

### (3) 検査例外がない

Java の `throws` のように「この関数はこのエラーを投げる」と宣言する仕組みが**JavaScript / TypeScript にはない**。

### (4) `try/catch` が読みにくい

```typescript
try {
  const u = parseUser(json);
  const profile = loadProfile(u.id);
  return render(profile);
} catch (err) {
  // どの関数がどんな失敗をするのか追えない
}
```

複数の関数が throw するとき、**どの失敗かを区別する**には `instanceof` などで分岐が必要。

---

## 2. Result型（Either型）の発想

「**戻り値で成功/失敗を表現する**」型。

```typescript
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

判別可能ユニオンで「**成功なら値、失敗ならエラー**」を表す。

### 関数の戻り値で使う

```typescript
function parseUser(json: string): Result<User, "parse_error" | "invalid_user"> {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { ok: false, error: "parse_error" };
  }
  if (!isUser(data)) {
    return { ok: false, error: "invalid_user" };
  }
  return { ok: true, value: data };
}
```

### 呼び出し側

```typescript
const r = parseUser(json);
if (r.ok) {
  r.value; // ✅ User
} else {
  r.error; // ✅ "parse_error" | "invalid_user"
}
```

→ **コンパイラが「失敗ハンドリング」を強制**してくれる。

---

## 3. Result型の利点

### (1) 失敗が型に現れる

```typescript
function divide(a: number, b: number): Result<number, "zero_division"> { ... }
```

シグネチャを見ただけで「失敗しうる」ことが分かる。

### (2) 失敗の種類を**列挙できる**

```typescript
type LoadError = "not_found" | "network_error" | "permission_denied";
function loadUser(id: string): Promise<Result<User, LoadError>> { ... }
```

「**どんな失敗があるか**」を型で表現。判別可能ユニオンで分岐できる。

```typescript
const r = await loadUser(id);
if (!r.ok) {
  switch (r.error) {
    case "not_found":         return notFound();
    case "network_error":     return retry();
    case "permission_denied": return showLogin();
  }
}
```

### (3) 例外が「**飛んでこない**」

`try/catch` がないので、どこで失敗が起きるか追える。コードがフラットになる。

### (4) Promise との相性

`Promise<Result<T, E>>` と書けば、非同期の失敗も型で表現できる。

---

## 4. 標準のヘルパー（自前実装）

### 基本の Result 型

```typescript
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
```

### 使い方

```typescript
function divide(a: number, b: number): Result<number, "zero_division"> {
  if (b === 0) return err("zero_division");
  return ok(a / b);
}
```

### `map` / `flatMap`（チェーン）

```typescript
function map<T, U, E>(
  r: Result<T, E>,
  fn: (v: T) => U
): Result<U, E> {
  return r.ok ? ok(fn(r.value)) : r;
}

function flatMap<T, U, E>(
  r: Result<T, E>,
  fn: (v: T) => Result<U, E>
): Result<U, E> {
  return r.ok ? fn(r.value) : r;
}

const result = flatMap(
  parseUser(json),
  user => loadProfile(user.id)
);
```

「成功時だけ次を実行、失敗時はそのまま」というチェーン。関数型プログラミング寄り。

---

## 5. ライブラリで楽をする

### `neverthrow`

```typescript
import { ok, err, Result } from "neverthrow";

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return err("zero division");
  return ok(a / b);
}

const r = divide(10, 2);
r.match(
  v => console.log("ok", v),
  e => console.error("err", e)
);
```

`map` `andThen`（flatMap） `match` などの便利メソッドが揃っている。

### `fp-ts` の `Either`

関数型プログラミング寄りのライブラリ。

```typescript
import * as E from "fp-ts/Either";

const r = E.right(42);
const r2 = E.left("error");
```

学習コストはあるが、関数合成やパイプラインを書きたいなら最強。

### Zod

`safeParse` が Result 型を返す:

```typescript
const result = UserSchema.safeParse(data);
if (result.success) {
  result.data; // ✅
} else {
  result.error; // ZodError
}
```

→ **バリデーション結果は実質Result型**。Zodだけで十分なケースも多い。

---

## 6. Result型を使うべき場面・使わない場面

### 使うべき場面

- **業務ロジックの「想定される失敗」**: バリデーション・権限チェック・存在確認
- **外部I/O**: APIコール・ファイル読み書き・DB操作
- **複数の失敗種別を区別したい**: ユーザに違うメッセージを出すなど
- **失敗ハンドリングを忘れたくない**: コンパイラに強制させる

### 使わない方がよい場面

- **絶対に失敗しないロジック**: 単純な計算・データ変換
- **失敗が「バグ」を意味する場合**: アサーション系（`assert(x !== 0)` のような）
- **チームがResult型に慣れていない**: 学習コストとのトレードオフ
- **小さなスクリプト**: 例外で十分

---

## 7. 例外と Result の併用

「**回復可能な失敗 = Result**、**回復不可能なバグ = throw**」 ── というハイブリッドが現代の主流。

```typescript
// 回復可能（呼び出し側で対処すべき）
function parseUser(json: string): Result<User, "invalid_format"> { ... }

// 回復不可能（プログラマのバグ）
function assertInvariant(condition: boolean): asserts condition {
  if (!condition) throw new Error("invariant violated");
}
```

### 判断基準

| 状況 | 推奨 |
|---|---|
| ユーザ入力エラー | Result |
| 権限エラー | Result |
| 一時的なネットワーク障害 | Result |
| 設定漏れ（起動時のみ） | throw |
| プログラマのミス（不変条件違反） | throw / `assertNever` |
| メモリ不足など | throw（catch不要） |

---

## 8. async + Result のパターン

```typescript
async function loadUser(id: string): Promise<Result<User, "not_found" | "network">> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (res.status === 404) return err("not_found");
    if (!res.ok) return err("network");
    const data: unknown = await res.json();
    return ok(UserSchema.parse(data));
  } catch {
    return err("network");
  }
}
```

呼び出し側:

```typescript
const r = await loadUser(id);
if (r.ok) {
  console.log(r.value.name);
} else if (r.error === "not_found") {
  redirect("/404");
} else {
  showError("ネットワークエラー");
}
```

---

## 9. Result型と判別可能ユニオン

`Result` は実は**ただの判別可能ユニオン**。`ok` フィールドが判別子。

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

→ [[02-判別可能ユニオン]] を理解していれば、Result型は自然に書けます。

### 判別子のバリエーション

```typescript
type Result<T, E> = { kind: "ok"; value: T } | { kind: "err"; error: E };
type Result<T, E> = { _tag: "Right"; right: T } | { _tag: "Left"; left: E };  // fp-ts風
type Result<T, E> = { type: "success"; data: T } | { type: "failure"; reason: E };
```

中身は同じ。**チームで統一**するのが大事。

---

## 10. アンチパターン

### (1) 例外と Result を混在

```typescript
function parseUser(json: string): Result<User, string> {
  const data = JSON.parse(json); // throw する！
  // ...
}
```

→ **内部の throw も catch して Result に変換**する。

### (2) `error` の型が `string` だけ

```typescript
type Result<T> = { ok: true; value: T } | { ok: false; error: string };
```

→ **判別可能なエラー型**にする（`"not_found" | "network" | ...`）。

### (3) Result を `then` で渡しまくり、`!r.ok` チェックを忘れる

```typescript
const r = await loadUser(id);
console.log(r.value.name); // ❌ ok チェックなし
```

→ TypeScript的には型エラーで防げるが、`as` で潰さないように。

### (4) Result 型を**外部API境界**にそのまま渡す

```typescript
// REST API のレスポンス
res.json({ ok: true, value: { ... } }); // 内部実装が漏れる
```

→ APIレスポンスは別の DTO 型に変換してから返す。

### (5) 全部 Result にして地獄

```typescript
function add(a: number, b: number): Result<number, never> {
  return ok(a + b); // 失敗しないのにResultでラップ
}
```

→ **失敗しないなら普通の戻り値**で。

---

## 11. ジェネリックな Result ヘルパー集

### `tryCatch`: throw を Result に変換

```typescript
function tryCatch<T, E = unknown>(
  fn: () => T,
  onError: (e: unknown) => E
): Result<T, E> {
  try {
    return ok(fn());
  } catch (e) {
    return err(onError(e));
  }
}

const r = tryCatch(
  () => JSON.parse(input),
  e => `Parse error: ${e}`
);
```

### `tryCatchAsync`

```typescript
async function tryCatchAsync<T, E = unknown>(
  fn: () => Promise<T>,
  onError: (e: unknown) => E
): Promise<Result<T, E>> {
  try {
    return ok(await fn());
  } catch (e) {
    return err(onError(e));
  }
}
```

### `unwrap` （失敗時に throw、テスト用）

```typescript
function unwrap<T, E>(r: Result<T, E>): T {
  if (r.ok) return r.value;
  throw new Error(`Unwrap failed: ${JSON.stringify(r.error)}`);
}
```

テストで「ここは絶対成功する前提」のとき便利。本番コードでは控える。

### `combine`（複数Resultを合体）

```typescript
function combine<T1, T2, E>(
  r1: Result<T1, E>,
  r2: Result<T2, E>
): Result<[T1, T2], E> {
  if (!r1.ok) return r1;
  if (!r2.ok) return r2;
  return ok([r1.value, r2.value]);
}
```

---

## 12. まとめ

- **例外は型に現れない** → どこで catch すべきか追えない
- **Result型 / Either型** = 戻り値で成功/失敗を表現する判別可能ユニオン
- 利点: **失敗が型に現れる**、**種類を列挙できる**、**コンパイラが分岐を強制**
- 自前実装も10行で書けるが、`neverthrow` / `fp-ts` / Zod を活用するのが楽
- **回復可能な失敗 = Result**、**バグ = throw** のハイブリッドが現代の主流
- アンチパターン: throwとの混在 / error が string だけ / 失敗しない関数まで Result化

> 「**例外より戻り値**」というシンプルなルールに切り替えるだけで、エラーハンドリングは**読めるコード**になります。型システムが「失敗ハンドリングを忘れさせない」── これがTypeScriptの設計力の真骨頂です。

---

## 関連
- [[01-ドメインモデルの表現]]
- [[03-不変を前提にした型]]
- [[02-判別可能ユニオン]]
- [[03-voidとPromiseとasync]]
