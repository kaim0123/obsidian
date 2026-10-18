# Result 型の自作

## Result 型とは？

「**成功した結果**」と「**失敗の理由**」を **戻り値** として表現する型です。
例外（`throw`）の代わりに使うことで、**エラーが型に現れる** ようになります。

Rust の `Result<T, E>` や Haskell の `Either` 型と同じ考え方です。

## 基本形

```typescript
type Ok<T>  = { ok: true;  value: T };
type Err<E> = { ok: false; error: E };
type Result<T, E = Error> = Ok<T> | Err<E>;
```

`ok: true | false` を判別子にした **判別可能ユニオン** です（→ `discriminated_union.md`）。

## 使ってみる

```typescript
function parseInteger(s: string): Result<number, string> {
  const n = Number(s);
  if (Number.isInteger(n)) {
    return { ok: true, value: n };
  }
  return { ok: false, error: `"${s}" は整数ではありません` };
}

const r = parseInteger("42");
if (r.ok) {
  console.log(r.value * 2);   // 84
} else {
  console.error(r.error);     // ここでは error が確定
}
```

`if (r.ok)` で型が絞り込まれ、それぞれの分岐で安全にアクセスできます。

## 例外との違い

|観点|例外（throw）|Result 型|
|---|---|---|
|エラーが型に出るか|出ない|**出る**|
|呼び出し側の対応|忘れがち|型で強制される|
|フローが追いやすいか|catch まで飛ぶ|**戻り値で素直**|
|既存の習慣|広く使われる|まだ自作中心|

すべてを Result にするのは過剰ですが、「**ビジネスロジックで起こりうる失敗**」は Result が向いています。
「ネットワーク切断」のような **完全に異常な事態**は例外でも OK。

## 便利なヘルパー関数

```typescript
const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
const err = <E>(error: E): Err<E> => ({ ok: false, error });

function divide(a: number, b: number): Result<number, string> {
  return b === 0 ? err("ゼロ除算") : ok(a / b);
}
```

## map / chain 風の操作

関数型的に書きたいなら、`map`/`flatMap` 相当を用意します。

```typescript
function map<T, U, E>(r: Result<T, E>, f: (v: T) => U): Result<U, E> {
  return r.ok ? ok(f(r.value)) : r;
}

function flatMap<T, U, E>(r: Result<T, E>, f: (v: T) => Result<U, E>): Result<U, E> {
  return r.ok ? f(r.value) : r;
}

const r = flatMap(parseInteger("42"), (n) =>
  n > 0 ? ok(n * 2) : err("負数")
);
```

「失敗を引きずって流れる」ロジックがすっきり書けます。

## エラー型を充実させる

`E` を文字列ではなく、**判別可能ユニオン** にすると、エラーの種類で分岐できます。

```typescript
type AppError =
  | { kind: "validation"; field: string }
  | { kind: "network";    status: number }
  | { kind: "not_found";  id: string };

function loadUser(id: string): Result<User, AppError> { /* ... */ }

const r = loadUser("u1");
if (!r.ok) {
  switch (r.error.kind) {
    case "validation": /* ... */ break;
    case "network":    /* ... */ break;
    case "not_found":  /* ... */ break;
  }
}
```

## 既存ライブラリ

自作する前に、こうしたライブラリも検討してみてください。

- **neverthrow**：型安全な Result 型ライブラリ
- **fp-ts / Effect**：本格的な関数型の型ユーティリティ
- **ts-results**：Rust の Result 風 API

「**チームで小さく統一する**」ことが、自作と既存どちらでも大事です。

## まとめ

- Result 型は **「成否を戻り値で表す」** ための判別可能ユニオン
- 例外より **エラーが型に出る** ため、対応忘れを防げる
- ヘルパー関数（`ok`/`err`/`map`/`flatMap`）で扱いやすく
- エラー型自体を判別可能ユニオンにすると、種類別の分岐ができる
- 大規模なら専用ライブラリ（neverthrow など）の検討も
