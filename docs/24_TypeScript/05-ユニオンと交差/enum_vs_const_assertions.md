# enum vs const assertions

「**列挙的な値の集合**」を表すには、`enum` と `as const` の 2 つの選択肢があります。
近年は **`as const` を推奨** する声が多いです。理由を順に見ていきましょう。

## enum の基本

```typescript
enum Status {
  Pending,
  Approved,
  Rejected,
}

const s: Status = Status.Approved; // 1
```

数値が自動的に `0, 1, 2...` と振られます。文字列を割り当てることもできます。

```typescript
enum Color {
  Red = "RED",
  Blue = "BLUE",
}
```

## enum の何が問題？

### 1. ランタイムにオブジェクトが残る

`enum` は **JavaScript の出力にオブジェクトを生成**します。
バンドルサイズが増えるうえ、tree-shaking されにくい場合があります。

### 2. 数値 enum は型がゆるい

```typescript
enum E { A, B }

const x: E = 99; // OK ！？（Eに99はないのに通る）
```

数値 enum は「`number` ならなんでも代入できる」ような挙動をすることがあり、**安全とは言えません**。

### 3. `isolatedModules` と相性が悪いことがある

`const enum` は別ファイルから参照できないなど、ツール依存の制約があります。

### 4. 構造的部分型から外れる

TypeScript は構造的に型を判定しますが、`enum` は **公称（名前ベース）** に近い扱いを受けます。
他のパターンと噛み合わないことがあります。

## as const による「定数オブジェクト + ユニオン」

`as const` を使えば、enum の代替がシンプルに書けます。

```typescript
const Status = {
  Pending: "pending",
  Approved: "approved",
  Rejected: "rejected",
} as const;

type Status = typeof Status[keyof typeof Status];
// "pending" | "approved" | "rejected"

const s: Status = "approved"; // OK
const x: Status = "wrong";    // エラー
```

### この書き方の利点

- **JS 出力は普通のオブジェクトだけ**（無駄なランタイムコードがない）
- **ユニオンリテラル型として安全**
- **構造的部分型と自然に共存**
- **`Object.values(Status)` などの操作がそのまま使える**

## どちらを選ぶか

|状況|推奨|
|---|---|
|新規プロジェクト|**`as const`**|
|シンプルな文字列リテラル集合|**`as const`** か単なるユニオン型|
|既存コードベースが enum で統一されている|揃える|
|フロント/SSR でバンドル軽減を重視|**`as const`**|

## ユニオン型だけでも十分なことが多い

そもそも、わざわざ「定数集合」を作らず、**ユニオン型だけで済む** ことも多いです。

```typescript
type Status = "pending" | "approved" | "rejected";

function update(s: Status) { /* ... */ }
update("approved"); // OK
update("wrong");    // エラー
```

「**値を直接書く方が読みやすいなら、無理に名前付き定数にしない**」のも 1 つの判断です。

## 注意：const enum

`const enum` は出力が定数に置き換わるため軽量ですが、

- `isolatedModules` で利用に制限がある
- ツールチェイン全体で扱いを揃える必要がある

ため、**プロジェクト全体で慎重に判断**してください。基本は使わないほうが無難です。

## まとめ

- `enum` は便利な反面、**ランタイムコスト** と **型のゆるさ** という弱点がある
- 多くの場面で **`as const` + ユニオン型** が代替できる
- 「列挙したいだけ」なら **生のユニオン型** が一番シンプル
- 新規プロジェクトでは、まず `as const` を検討しよう
