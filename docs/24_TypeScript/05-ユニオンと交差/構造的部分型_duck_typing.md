# 構造的部分型（Duck Typing）

## 構造的部分型とは？

TypeScript の型システムは **構造的部分型（structural typing）**を採用しています。
これは「型の名前」ではなく **「型の構造（プロパティの形）」**で互換性を判断するという考え方です。

> 「アヒルのように歩き、アヒルのように鳴くなら、それはアヒルだ」（duck typing）

```typescript
type Person = { name: string; age: number };
type User   = { name: string; age: number };

const a: Person = { name: "Alice", age: 25 };
const b: User = a; // OK！ 名前は違うが構造が同じ
```

Java や C# のような **公称型（nominal typing）**では、`Person` と `User` が違う名前なら互換性はありません。TypeScript は違います。

## 「形が合えば OK」

必要なプロパティを持っていれば、宣言時の型と一致しなくても割り当てられます。

```typescript
type Named = { name: string };

function greet(x: Named) {
  console.log(`Hello, ${x.name}`);
}

const dog = { name: "Pochi", age: 3 };
greet(dog); // OK：name を持っているから
```

`dog` の型は `{ name: string; age: number }` ですが、`Named` が要求するプロパティ（`name`）を満たしているので合格です。

## クラスにも適用される

クラスインスタンスでも、構造が合えば代入できます。

```typescript
class Cat {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const obj = { name: "Tama" };
const cat: Cat = obj; // OK！ クラスでも構造で判定
```

これがオブジェクト指向言語に慣れている人を一番驚かせるポイントです。

## 余分なプロパティのチェック（Excess Property Check）

「形が合えば OK」とはいえ、**オブジェクトリテラルを直接渡すとき**だけは余分なプロパティが警告されます。

```typescript
type Config = { url: string };

function load(c: Config) {}

load({ url: "/api", debug: true });
//             ^^^^^ エラー：余分な debug
```

ただし、いったん変数に入れてから渡せば通ります。

```typescript
const cfg = { url: "/api", debug: true };
load(cfg); // OK
```

これは「タイポ防止」のための特別な救済策です。バグの温床になるので、必要に応じて型を見直しましょう。

## 構造が「足りる」と「過ぎる」

代入の判断は **「相手が要求するもの」をすべて持っているか** だけです。

```typescript
type A = { x: number };
type B = { x: number; y: number };

const a: A = { x: 1 };
const b: B = { x: 1, y: 2 };

const aFromB: A = b; // OK：B は A の要求を満たす（プロパティが多い分には問題なし）
// const bFromA: B = a; // エラー：A は y を持たない
```

「**多い分には OK、足りないのは NG**」と覚えれば十分です。

## 関数の互換性

関数も構造で判定されます。

```typescript
type Handler = (x: number) => void;

const f: Handler = (x: number, y: number) => {}; // エラー
const g: Handler = (x: number) => "ignored";     // OK（戻り値 string は無視される）
```

引数は **少なくても OK**、戻り値は **代入先が要求しないなら無視** されます。

## 構造的部分型とどう付き合うか

構造的部分型は便利な反面、「**型は同じでも意味が違う**」値を取り違える危険もあります。

```typescript
type UserId = number;
type ProductId = number;

function getUser(id: UserId) {}

const pid: ProductId = 42;
getUser(pid); // 通ってしまう（どちらも number）
```

この対策が **ブランド型** などの「公称型を疑似的に作るテクニック」です（→ `05-レシピ/ブランド型.md` を参照）。

## まとめ

- TypeScript は **形（構造）** で型互換性を判定する
- 名前が違っても、必要なプロパティを満たせば代入できる
- オブジェクトリテラルを直接渡すときだけ「余分なプロパティ」警告が出る
- 「ID 番号」などの意味が違う型を区別したいときはブランド型で守る
- この性質を理解すると、TypeScript の型設計が格段に楽になる
