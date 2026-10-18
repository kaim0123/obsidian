# ジェネリクス（Generics）

## ジェネリクスとは？

**ジェネリクス**とは、「型をパラメータとして受け取る」しくみです。
関数や型に、後から型を当てはめて使える「型のひな形」を作るイメージです。

### なぜ必要？

`any` を使えば「何でも受け取れる」関数は書けます。しかし `any` は型情報を失うため、戻り値の型もわからなくなります。

```typescript
// any では型が失われる
function firstAny(arr: any[]): any {
  return arr[0];
}

const x = firstAny([1, 2, 3]); // x の型は any（number ではない）
x.toUpperCase(); // 実行時エラー（数値に toUpperCase はない）
```

ジェネリクスを使うと、入力と出力の型を「リンクさせた」まま保てます。

```typescript
// 型をリンクできる
function first<T>(arr: T[]): T {
  return arr[0];
}

const n = first([1, 2, 3]);    // n: number
const s = first(["a", "b"]);  // s: string
```

`<T>` の `T` が型のパラメータです。呼び出されたタイミングで実際の型に置き換わります。

## ジェネリクス関数の基本

```typescript
// 値をそのまま返す関数（恒等関数）
function identity<T>(value: T): T {
  return value;
}

identity<string>("hello"); // 明示的に指定
identity(123);              // 推論で number になる
```

`<T>` に明示的な型を渡すこともできますが、ほとんどの場合は **型推論にまかせれば OK** です。

### 型変数を複数使う

```typescript
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}

const p = pair("age", 25); // [string, number]
```

慣習として `T` は Type、`K` は Key、`V` は Value、`E` は Element の略です。

## ジェネリクス型（型エイリアス・interface）

関数だけでなく、**型自体**をジェネリクスにすることもできます。

```typescript
// 「箱」型
type Box<T> = {
  value: T;
};

const numberBox: Box<number> = { value: 10 };
const stringBox: Box<string> = { value: "hi" };
```

`interface` でも書けます。

```typescript
interface ApiResponse<T> {
  status: number;
  data: T;
}

const userRes: ApiResponse<{ name: string }> = {
  status: 200,
  data: { name: "Alice" },
};
```

## 制約（extends）

「どんな型でも OK」だと困る場合があります。たとえば「`length` プロパティを持つもの」だけ受け取りたいときは、`extends` で制約をかけます。

```typescript
function logLength<T extends { length: number }>(value: T): T {
  console.log(value.length);
  return value;
}

logLength("hello");      // OK（string は length を持つ）
logLength([1, 2, 3]);    // OK（配列は length を持つ）
// logLength(123);        // エラー（number に length はない）
```

### keyof との組み合わせ

オブジェクトと、その「キー」を結び付けるパターンも頻出です。

```typescript
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Alice", age: 25 };
const name = getProp(user, "name"); // string
const age = getProp(user, "age");   // number
// getProp(user, "email");           // エラー（"email" は user のキーにない）
```

`T[K]` は「`T` の `K` 番目のプロパティの型」を表します（インデックスアクセス型）。

## デフォルト型引数

型引数に「初期値」を持たせられます。

```typescript
type EventHandler<T = Event> = (event: T) => void;

const click: EventHandler = (e) => console.log(e); // T は Event
const custom: EventHandler<MouseEvent> = (e) => console.log(e.button);
```

## ジェネリクスを使うときのコツ

- **まず型推論にまかせる**：明示的な `<T>` 指定は最後の手段。
- **意味のある名前にしてもよい**：`T`, `U` だけでなく、`TItem`, `TKey` など説明的な名前も OK。
- **`any` ではなくジェネリクスを検討**：「何でも受け取れる」は大抵ジェネリクスのほうが安全。
- **無理に汎用化しない**：1 か所でしか使わない型をジェネリクスにすると、かえって読みにくい。

## まとめ

- ジェネリクスは「型を引数として受け取る」しくみ
- `<T>` の中身は呼び出し時に実際の型に置き換わる
- `extends` で「どんな型を許すか」を制限できる
- `keyof` と組み合わせると、オブジェクト操作が型安全になる
- 迷ったら推論にまかせ、必要な場面でだけ明示する
