# non-null assertion（`!`）の落とし穴

## non-null assertion とは？

変数や式の **末尾に `!`** を付けると、
「この値は `null` でも `undefined` でもない」と TypeScript に断言できます。

```typescript
const el = document.getElementById("foo")!;
el.style.color = "red"; // ! のおかげでエラーにならない
```

`as` と同じく **コンパイラを黙らせるだけ** で、ランタイムには何の保護もありません。

## なぜ危険?

「**実は null だった**」場合、実行時に **`Cannot read properties of null` エラー** で落ちます。

```typescript
const el = document.getElementById("missing")!;
el.style.color = "red"; // ❌ ランタイムで爆発
```

`!` を使うと、**チェックすべきだった null 可能性** をうっかり忘れがちです。

## よくあるアンチパターン

### 1. DOM 取得直後に !

```typescript
const input = document.querySelector("input")!;
```

要素が存在しないページでも、コンパイルは通るが実行時に死にます。
ガードしてから使うのが安全。

```typescript
const input = document.querySelector("input");
if (!input) return;
input.value = "x";
```

### 2. 配列要素に !

```typescript
const first = arr[0]!;
```

`noUncheckedIndexedAccess` を有効にすると `arr[0]` の型が `T | undefined` になります。
`!` で消すのは簡単ですが、**配列が空のとき** に確実に落ちます。

### 3. オプショナルチェーン後に !

```typescript
const name = user?.profile?.name!;
```

`?.` は安全に短絡してくれているのに、`!` で台無しに。**意味を打ち消し合う**書き方は避けましょう。

## 安全な代替

|やりたいこと|代わりに|
|---|---|
|`null` の可能性をなくす|早期 return / ガード節|
|デフォルト値を設定|`?? デフォルト`|
|チェーンしたい|`?.`（オプショナルチェーン）|
|型を絞り込みたい|型ガード関数 (`x is T`)|

```typescript
// good
const el = document.getElementById("foo");
if (!el) throw new Error("foo not found");
el.style.color = "red"; // ここでは el が確定している
```

## どうしても使いたい場面

- **絶対に存在することが文脈で保証されている**（直前で代入したばかりなど）
- **テストコード**で前提条件を簡略化したい
- **アルゴリズムの不変条件**で、`undefined` がありえないことを示したい

それでも、**コメントで根拠を残す** ことを習慣に。

```typescript
// この時点で users は 1 件以上あることが保証されている
const first = users[0]!;
```

## ESLint の助け

`@typescript-eslint/no-non-null-assertion` ルールで、`!` の使用を警告できます。
チームでは原則 **エラー or 警告** にして、必要なときだけ disable コメントで承認するのがおすすめ。

```typescript
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const x = data.user!;
```

## まとめ

- `!`（non-null assertion）は **コンパイラを黙らせるだけ**
- 実行時に `null/undefined` が来れば、その場でクラッシュする
- 安全な代替は **早期 return / `??` / `?.` / 型ガード**
- どうしても使うときは **理由を添える**
- ESLint で意図しない使用を防ぐ運用も検討
