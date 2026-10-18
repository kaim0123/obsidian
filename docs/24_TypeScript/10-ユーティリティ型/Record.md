# Record<K, V>

`Record<K, V>` は **「キーが `K` 型、値が `V` 型のオブジェクト」** を簡潔に書くためのユーティリティ型です。

## 基本

```typescript
type Scores = Record<string, number>;

const score: Scores = {
  math: 90,
  english: 85,
  history: 70,
};
```

`{ [key: string]: number }` と書くのと同じ意味ですが、`Record` の方が読みやすいです。

## キーをリテラル型で固定する

`K` をユニオンの文字列リテラルにすると、**指定したキーがすべて揃っていることを強制**できます。

```typescript
type Theme = "light" | "dark" | "auto";
type ThemeColors = Record<Theme, string>;

const colors: ThemeColors = {
  light: "#fff",
  dark: "#000",
  auto: "#888", // ←これを忘れるとエラー
};
```

「**取りうるキーがすべて揃っているか**」を型でチェックできるのは大きな強みです。

## 例：ステータスごとのメッセージ

```typescript
type Status = "success" | "error" | "loading";
const messages: Record<Status, string> = {
  success: "成功しました",
  error: "失敗しました",
  loading: "読み込み中…",
};
```

新しいステータスを追加すると、`messages` で漏らした瞬間にエラーになります。**変更時の安全網**として優秀です。

## 任意のキーで OK にする

`Record<string, V>` のように `string` を渡すと、**どんなキーも許す辞書**になります。

```typescript
type Cache = Record<string, unknown>;

const cache: Cache = {};
cache["user:1"] = { name: "Alice" };
cache["user:2"] = { name: "Bob" };
```

ただし `string` キーで作った Record は、未定義のキーでも値が **存在するように見えてしまう** 落とし穴があります。
`tsconfig` の `noUncheckedIndexedAccess` を有効にすると、`undefined` の可能性が型に含まれるため安全です（→ `04-よくある罠/strict系オプション.md`）。

```typescript
const v = cache["unknown"]; // unknown（noUncheckedIndexedAccess なら unknown | undefined）
```

## Partial<Record<K, V>> という定石

「**キーがすべてあるとは限らない辞書**」を作りたいときは `Partial` を組み合わせます。

```typescript
type Locale = "ja" | "en" | "fr";
type Translation = Partial<Record<Locale, string>>;

const t: Translation = {
  ja: "こんにちは",
  en: "Hello",
  // fr は未提供でも OK
};
```

## 仕組み

`Record` の定義は驚くほどシンプルです（mapped types を使っています）。

```typescript
type Record<K extends keyof any, T> = {
  [P in K]: T;
};
```

`K` の各キーに対して値型を `T` にする、という素朴な mapped type です。

## まとめ

|書き方|意味|
|---|---|
|`Record<string, V>`|どんなキーでも許す辞書|
|`Record<"a" \| "b", V>`|キーが `"a"` と `"b"` だけで、両方必須|
|`Partial<Record<K, V>>`|キーが `K` のどれかで、ある/ない自由|

- `Record` は「キーの集合 × 値型」を表すのに最適
- リテラル型の `K` を使うと **網羅性チェック** ができる
- 任意キー辞書を使うときは `noUncheckedIndexedAccess` を検討する
