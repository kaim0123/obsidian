# `as` による型アサーションの危険性

## 型アサーションとは？

`as` は **「この値はこの型である」と TypeScript に強制的に伝える**機能です。

```typescript
const v = JSON.parse(text) as User;
```

実行時には何もしません。**型システムを欺くだけ** で、「これは本当に `User` なのか？」は誰も保証してくれません。

## なぜ危険なのか

`as` は **コンパイラを黙らせる** だけで、**実行時の安全性は何も増えません**。

```typescript
const x = "123" as unknown as number; // 強引に number 扱い
console.log(x.toFixed(2));            // 実行時エラー（toFixed は文字列にない）
```

`as` を多用したコードは、**型がついているように見えて、中身は any 同然** になりがちです。

## よくある誤用

### 1. 入力データに無条件で型を付ける

```typescript
const user = JSON.parse(json) as User; // 中身は本当に User？
```

外部から来るデータは **何でもありえます**。Zod などのバリデーションを通してから型を付けるのが正解です。

### 2. エラーをごまかすために使う

```typescript
const el = document.getElementById("foo") as HTMLInputElement;
el.value = "x"; // foo が存在しない/別要素なら実行時エラー
```

「型エラーが消えた → 直った」と勘違いしがち。**根本原因に向き合いましょう**。

### 3. as unknown as T の連発

```typescript
const x = obj as unknown as DeepNested;
```

「**コンパイラに 2 段階で嘘をつく**」最悪の書き方。設計を見直すサインです。

## 正しい使いどころ

`as` が **正しく使える** 場面は限定的です。

### 1. 型を「狭める」（広げない）

```typescript
const status = "approved" as const;
//   ^? "approved"（広がるのを防ぐ）
```

`as const` は「**より狭いリテラル型に固める**」ので安全方向です。

### 2. 型ガードができない場面の最終手段

DOM 操作などでクラスが特定できる前提のとき。

```typescript
const input = e.target as HTMLInputElement;
```

ただし、本当は `instanceof` で判別したほうが安全です。

```typescript
if (e.target instanceof HTMLInputElement) {
  e.target.value = "x";
}
```

### 3. ライブラリの型がゆるい場合の限定的な補強

外部ライブラリの型定義が不十分なときの局所的な救済。コメントで理由を残しましょう。

## as の安全な代替

|やりたいこと|代わりに使うもの|
|---|---|
|JSON を型付けしたい|Zod / valibot などのバリデーション|
|`unknown` から型を絞りたい|型ガード（`typeof`/`instanceof`/`x is T`）|
|定数を狭く保ちたい|`as const`|
|`null` を消したい|`?? デフォルト値` か早期 return|

## 「satisfies」を活用する

「型に合うことは確認したいが、リテラル型を保ちたい」ときは `satisfies` が便利です。

```typescript
type Theme = Record<string, string>;

const colors = {
  primary: "#1e40af",
  secondary: "#9333ea",
} satisfies Theme;

colors.primary; // "#1e40af"（リテラル型を保ったまま型チェックされる）
```

`as Theme` だと型が広がりますが、`satisfies` なら **リテラル型を保ちつつ Theme に適合するか確認** できます。

## まとめ

- `as` は **コンパイラを黙らせるだけ**で、実行時の安全性は増えない
- 危険な使い方：「JSON のキャスト」「エラー隠し」「`as unknown as T` 連発」
- 安全な使い方：`as const`、最終手段の DOM キャスト
- 代替を優先：**バリデーション / 型ガード / `satisfies`**
- `as` を書く前に、その理由をコメントで残す習慣をつけよう
