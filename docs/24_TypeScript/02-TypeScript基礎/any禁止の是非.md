# `any` 禁止の是非

## なぜ `any` は嫌われる？

`any` は **型システムのスイッチを切る** 型です。
代入も呼び出しも自由になる代わりに、**型の安全性は完全に失われます**。

```typescript
let v: any = JSON.parse(json);
v.toUpperCase();   // エラーにならない（実行時クラッシュ）
v(1, 2, 3);         // 同上
const n: number = v; // 同上
```

しかも `any` は **周囲に伝播** するため、1 か所の `any` がプロジェクト全体の型安全性を侵食しがちです。

## 「any 全面禁止」の主張

多くのチームでは、ESLint の `@typescript-eslint/no-explicit-any` を **error** に設定して、`any` を禁止しています。

メリット：
- 型を考えざるを得なくなる
- レビュー時に `any` を見逃さない
- コードベース全体の信頼性が上がる

## 全面禁止の落とし穴

しかし、**完全禁止には弊害**もあります。

- **`any as unknown as T` で偽装する文化** が生まれやすい
- **型がない / 複雑なライブラリ** に対応できない
- 「とりあえず `// @ts-ignore`」が増える
- リファクタの **一時しのぎ** ができない

`any` を使えなくなるだけで、**問題は別の形に逃げる**ことが多いのです。

## 現実的な落としどころ

「**禁止 + 例外運用**」が現実解です。

1. 原則として `any` を **禁止**
2. ただし、**理由を書けば許可**
3. レビューで「他に方法がないか」を必ず議論

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function legacyAdapter(data: any) {
  // 理由：レガシー API の戻り値型が確定しないため。
  // TODO: スキーマを起こして Zod で検証するように移行する（2026-Q3）
}
```

`disable` コメントには **理由と将来計画** を残すのが鉄則です。

## any の代わりに使うべきもの

|やりたいこと|使うべき|
|---|---|
|なんでも入る箱がほしい|`unknown`|
|オブジェクトだとだけ判明|`Record<string, unknown>`|
|関数だとだけ判明|`(...args: unknown[]) => unknown`|
|型を渡したい|ジェネリクス（`<T>`）|
|外部 JSON|`unknown` + Zod 検証|

ほとんどの「any しか使えない」場面は、**`unknown` + 型ガード** で代替できます。

## 「明示的な any」と「暗黙の any」

|種類|例|対策|
|---|---|---|
|暗黙の any|引数の型を書き忘れた|`noImplicitAny: true`（strict 系）|
|明示的な any|`function f(x: any)`|ESLint の `no-explicit-any`|

**両方に対策する**のが理想です。

## ライブラリ境界での扱い

外部 JS ライブラリの戻り値が `any` になる場合は仕方ありません。
**呼び出し元で `unknown` に **絞ってから** 検証** する設計にしましょう。

```typescript
const raw: any = legacyApi();
const value: unknown = raw;          // any → unknown に降ろす
const parsed = MySchema.parse(value); // ここで型確定
```

## まとめ

- `any` は **型システムの安全装置を外す** 型
- 全面禁止には弊害もあるが、**原則禁止 + 理由付き例外** が落としどころ
- 多くの場面で **`unknown` + 型ガード/バリデーション** が代替できる
- ESLint で `no-explicit-any` を error にし、disable には理由を必須に
- `any` を見たら、**設計の見直しサイン** と捉える
