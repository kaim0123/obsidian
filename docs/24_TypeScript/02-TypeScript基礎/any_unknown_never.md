# any / unknown / never の違い

## ひとことで言うと

|型|意味|安全性|
|---|---|---|
|`any`|「型チェックを諦める」値|❌ 危険|
|`unknown`|「何が入っているかわからない」値|✅ 安全|
|`never`|「絶対に到達しない」値|⚠ 特殊|

3 つは似ているようで役割がまったく違います。

## any：型システムからの離脱

`any` は **何でも代入できて、何でもできる** 万能型です。
便利ですが、`any` を使った瞬間 **型の恩恵がそこから失われ、周囲にも伝播** します。

```typescript
let v: any = 1;
v.toUpperCase();  // 型エラーにならない（実行時エラー）
v(1, 2, 3);       // 同上
const n: number = v; // 何でも代入できる
```

外部 JS のレガシーコードを取り込むときの「最後の逃げ道」と心得ましょう。

## unknown：安全な「なんでも入る箱」

`unknown` も「どんな値でも代入できる」点は `any` と同じです。
ただし、**使うときに型を確定させないとエラー** になります。

```typescript
let v: unknown = JSON.parse(text);

v.toUpperCase();        // エラー：型が確定していない
if (typeof v === "string") {
  v.toUpperCase();      // OK：絞り込んだので使える
}
```

「外から来るデータ」（JSON、Web API レスポンス、`localStorage` など）には **`unknown` を使い、型ガードで絞り込む** のが鉄則です。

## never：あり得ない型

`never` は「**絶対に値が存在しない**」型です。

```typescript
function fail(msg: string): never {
  throw new Error(msg); // 戻ってこない
}

function loop(): never {
  while (true) {}       // 終わらない
}
```

`never` 自身を変数として持つことは、ふつうありません。

### 網羅性チェック（exhaustiveness check）

`never` の最大の使いどころが、`switch` の漏れチェックです。

```typescript
type Shape = { kind: "circle" } | { kind: "square" };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return 1;
    case "square": return 2;
    default:
      const _exhaustive: never = s; // 新ケースを追加するとここがエラーに
      return _exhaustive;
  }
}
```

将来 `Shape` に `triangle` を加えると、`_exhaustive: never` の行でコンパイルエラーになり、対応漏れに気付けます。

## ユニオンと never

`never` をユニオンに混ぜると、**消えます**。

```typescript
type T = string | never; // string
```

これは `Exclude<T, U>` のような条件型の動作で重要な役割を果たします（→ `02-ユーティリティ型/Exclude_Extract.md`）。

## どれを使う？

- **何でも入る変数を作りたい** → ほぼ `unknown`
- **JS から流れてきた未知のデータ** → `unknown`
- **どうしても型を捨てたい救急対応** → `any`（コメントで理由を残す）
- **戻らない関数 / 網羅性チェック** → `never`

## まとめ

- `any` は **型を捨てる**：使えば安全装置が外れる
- `unknown` は **安全な any**：使う前に絞り込みが必要
- `never` は **存在しない値**：例外を投げる関数や網羅性チェックで活躍
- 迷ったら **`any` ではなく `unknown`** を選ぶ
