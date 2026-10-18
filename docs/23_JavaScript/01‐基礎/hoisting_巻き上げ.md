# hoisting（巻き上げ）

## hoisting とは

**hoisting（ホイスティング／巻き上げ）** とは、JavaScript エンジンがコードを実行する前に、変数や関数の宣言を **その関数／ブロックの先頭に移動したかのように** 扱う仕様のことです。

これにより、**宣言より前のコードで変数や関数が使える（ように見える）** 現象が起こります。

## var の巻き上げ

```js
console.log(x); // undefined（エラーにならない！）
var x = 10;
console.log(x); // 10
```

内部的には次のように解釈されます。

```js
var x;           // 宣言だけ先頭に巻き上げ
console.log(x);  // undefined
x = 10;          // 代入はそのまま
console.log(x);  // 10
```

**ポイント**：`var` は「宣言」だけ巻き上げられて、**初期値は `undefined`**。

これが「値はまだ入っていないけど参照はできる」状態を生みます。ここから大量のバグが生まれた歴史があり、現代は `let` / `const` の使用が推奨されます。

## let / const の巻き上げ

`let` と `const` も **実は巻き上げられている** のですが、宣言までの間は参照すると **ReferenceError** になります。この期間を **Temporal Dead Zone（TDZ／一時的死角）** と呼びます。

```js
console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 10;
```

TDZ の間は変数が「存在するが触れない」状態です。`var` の `undefined` ではなく **エラー**になるので、バグに気づきやすい。これが `let`/`const` が推奨される大きな理由のひとつ。

### 同じブロック内での例

```js
{
  // ここから y は TDZ
  // console.log(y); // ReferenceError
  let y = 1;       // ここから使える
  console.log(y);  // 1
}
```

## 関数宣言の巻き上げ

**関数宣言** は「宣言と関数本体がセットで」巻き上げられます。そのため、定義より前に呼べます。

```js
hello(); // "こんにちは"（エラーにならない）

function hello() {
  console.log("こんにちは");
}
```

### 関数式（関数リテラル）は違う

関数式は「変数に関数を代入する」形なので、巻き上げは変数のルールに従います。

```js
bye(); // TypeError: bye is not a function
var bye = function () { console.log("さようなら"); };
```

`var bye` は巻き上げられて `undefined`、そこに `()` を付けるので `undefined is not a function` となります。

`let` / `const` の関数式なら TDZ なので ReferenceError になります。

## class は巻き上げられない（扱い）

```js
const u = new User(); // ReferenceError
class User {}
```

厳密には class も巻き上げはされているのですが、`let`/`const` と同じく TDZ があるため、実質「定義より前は使えない」です。

## よくある事故例

### 1. 同名変数の汚染（var）

```js
function foo() {
  console.log(x); // undefined（巻き上げで undefined になる）
  var x = 1;
  console.log(x); // 1
}
foo();
```

外側に `x` があっても、関数内で `var x` があれば **関数全体で内部の x が使われる** ため、外の `x` には見えず `undefined` が出ます。

### 2. ループ内の var

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 3, 3, 3
}
```

これは巻き上げ＋関数スコープの合わせ技。`let` だとブロックスコープで期待通り 0, 1, 2 が出ます。詳しくは [[クロージャ]] を参照。

## 対策：`let` と `const` を使う

- 変更しない値は `const`
- 変更する値は `let`
- `var` は原則使わない

これだけで巻き上げに悩まされることはほぼなくなります。

## なぜ巻き上げがあるのか

JavaScript は元々ブラウザに組み込む簡易言語として作られました。スクリプトを上から下に読む際に、「関数は定義前に呼べたほうが便利」「変数が先に使えても動くほうが柔軟」という設計判断があり、それが今も残っています。

モダンな開発では `let`/`const` と厳格な linter（ESLint の `no-use-before-define` など）でトラブルを避けるのが一般的です。

## まとめ

- **hoisting**：宣言が上に移動したように振る舞う
- `var` は宣言だけ巻き上げ、値は `undefined`
- `let` / `const` も巻き上げはあるが TDZ に入るのでエラーで気付ける
- 関数宣言は本体ごと巻き上げ、関数式は変数の扱い
- **対策：`var` を避けて `let` / `const` を使う**

巻き上げは「知らないとハマる、知っていれば避けられる」タイプの仕様。現代の書き方をしていれば怖くありません。
