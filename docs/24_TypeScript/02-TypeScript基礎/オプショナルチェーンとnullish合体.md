# オプショナルチェーン（`?.`）と Nullish 合体（`??`）

## オプショナルチェーン `?.`

「**途中が `null` / `undefined` だったら、安全にショートカットする**」演算子です。

```typescript
const user: User | undefined = getUser();

const city = user?.address?.city; // user か address が無ければ undefined
```

途中で `null/undefined` に当たった瞬間、その先は **評価されず** に `undefined` になります。

### 関数呼び出し・配列にも使える

```typescript
user?.greet();      // greet が無ければ呼ばれない
arr?.[0];           // 配列が無ければ undefined
fn?.(1, 2);          // fn が無ければ呼ばれない
```

### 何が嬉しい？

```typescript
// 旧来の書き方
const city = user && user.address && user.address.city;

// 今
const city = user?.address?.city;
```

ネストが深いオブジェクトを **短く・読みやすく** 扱えます。

## Nullish 合体 `??`

「**左辺が `null` か `undefined` のときだけ右辺を使う**」演算子です。

```typescript
const name = input ?? "ゲスト"; // input が null/undefined なら "ゲスト"
```

### `||` との違い

`||` は **falsy 全般**（`0`, `""`, `false`, `null`, `undefined`）を「無効」とみなします。
`??` は **`null` と `undefined` だけ**を無効とみなします。

```typescript
const count = 0;
const a = count || 10; // 10（0 が falsy 扱い）
const b = count ?? 10; // 0 （0 は有効として残る）
```

「**0 や空文字も有効な値**」のときは、`??` を使わないと意図しないデフォルト値に置き換わります。

## オプショナルチェーンと Nullish 合体の合わせ技

```typescript
const city = user?.address?.city ?? "未設定";
```

「**安全に取り出して、無ければデフォルト**」という超頻出パターンです。

## ?? と || の使い分け早見表

|意図|使う|
|---|---|
|null/undefined のときだけ既定値|`??`|
|空文字や 0 も既定値に置き換えたい|`\|\|`|
|どっちでも結果が同じ場合|どちらでも OK（`??` 推奨）|

## ?? 代入演算子（`??=`）

`x = x ?? y` の短縮形が `x ??= y` です。

```typescript
const config: { theme?: string } = {};
config.theme ??= "light"; // theme が null/undefined のときだけ代入
```

「**初期化忘れの保険**」として便利です。

## ?? と論理優先順位の罠

`??` と `||`、`&&` を **同じ式に並べると構文エラー** になります。

```typescript
const x = a ?? b || c; // ❌ 構文エラー
```

意図を明確にするためには、**括弧で囲む**必要があります。

```typescript
const x = (a ?? b) || c;
```

これは「混乱を防ぐための仕様」です。

## オプショナルチェーンの落とし穴

### 1. 逆に「型エラーを隠す」可能性

`?.` を多用すると、本来 `null` を許さない箇所でも誤魔化せてしまいます。
型自体を見直すべきサインかも。

### 2. 副作用がある式に注意

```typescript
result?.update(prepare()); // result が undefined でも prepare() は呼ばれる！
```

→ いいえ、実は **呼ばれません**。`?.` の右辺は「呼ばれる場合のみ評価される」ので安心。
ただし、`a?.b.c()` のような **`?.` の後ろの `.b` は普通の参照** なので、そこは保護されません。

```typescript
a?.b.c(); // a が undefined のときは何もしない（OK）
a?.b().c; // a?.b() が undefined なら .c でエラー
```

## まとめ

- `?.` は途中が `null/undefined` でも安全にチェーンできる
- `??` は `null/undefined` のときだけデフォルト値を使う
- `||` は falsy 全般を捨てるので、`0` や `""` を扱うときは要注意
- 合わせ技 `a?.b ?? "default"` は超頻出
- 多用しすぎると **型自体を直したほうがいい**サインになることも
