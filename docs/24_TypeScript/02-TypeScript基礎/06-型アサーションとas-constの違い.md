# 型アサーション（`as`）と `as const` の違い（誤用しないための最低限）

> `as` は「**コンパイラを黙らせる**」、`as const` は「**型を狭める**」── 名前が似ているだけで、目的も危険度もまったく違います。`as` の誤用は静かにバグを混入させる最大の原因なので、最低限のルールをここで固めておきましょう。

## 目次
- [[01Programming/目次|← 教材目次に戻る]]
- 前: [[05-リテラル型とas-const]]

---

## 1. 2つの `as` を区別する

TypeScriptには「`as`」を使う2つの構文があります。**まったくの別物**です。

| 構文 | 名前 | 役割 | 危険度 |
|---|---|---|---|
| `value as Type` | **型アサーション** | 「これはこの型だと思ってくれ」とコンパイラに**主張**する | ⚠️ 高い |
| `value as const` | **constアサーション** | 値を**可能な限り狭い**型に固定する（widening抑制） | ✅ 安全 |

混同しないために、まずこの違いを頭に入れること。

---

## 2. 型アサーション（`as Type`）とは

「**この値の本当の型はこれだ**」とコンパイラに主張する構文です。

```typescript
const el = document.getElementById("app") as HTMLDivElement;
el.innerHTML = "..."; // HTMLDivElement のメソッドが使える
```

`getElementById` の戻り値は `HTMLElement | null`。「いや、これは絶対に div だ」と**人間が約束**しているわけです。

### `as` は「**チェックなしの変換**」

`as` は **実行時には何もしない**。コンパイラの型推論を上書きするだけです。

```typescript
const x = "hello" as number; // ❌ さすがにエラー
const x = "hello" as unknown as number; // ✅ 通る（強制キャスト）

console.log(x.toFixed(2)); // 実行時エラー: x.toFixed is not a function
```

`as unknown as T` で**何でも変換可能**になります。これは「**型システムを完全にだます**」行為で、**バグの温床**です。

---

## 3. `as const` とは（おさらい）

`as const` は「値を可能な限り**狭い型**に固定する」構文。

```typescript
const a = "hello" as const;    // 型: "hello"（"hello"以外は入らない）
const obj = { x: 1 } as const; // 型: { readonly x: 1 }
const arr = [1, 2] as const;   // 型: readonly [1, 2]
```

詳細は [[05-リテラル型とas-const]]。

### `as` との決定的な違い

- **`as Type`**: 異なる型に**変換する**（嘘をつくこともできる）
- **`as const`**: 同じ値を**より具体的に表現する**（嘘をつかない）

`as const` は型システム的に**安全な操作**で、誤用してもバグになりません。`as Type` は**誤用すると即バグ**です。

---

## 4. `as` がよく誤用される場面

### (1) APIレスポンスを「信じて」キャスト

```typescript
const data = await (await fetch("/api/user")).json();
const user = data as User; // ❌ 中身が User である保証はない

console.log(user.name.toUpperCase()); // 実行時エラーの可能性
```

**正しい対処**: バリデータ（Zod等）を使う。

```typescript
import { z } from "zod";
const UserSchema = z.object({ name: z.string() });

const data: unknown = await (await fetch("/api/user")).json();
const user = UserSchema.parse(data); // 検証して型を確定
```

### (2) `unknown` を絞り込まずに型付け

```typescript
function handle(v: unknown) {
  const s = v as string; // ❌ 嘘の可能性
  s.toUpperCase();        // 実行時エラーの可能性
}
```

**正しい対処**: `typeof` などで narrowing する。

```typescript
function handle(v: unknown) {
  if (typeof v === "string") {
    v.toUpperCase(); // ✅ 安全
  }
}
```

### (3) 型エラーを「とりあえず黙らせる」

```typescript
const result = (someComplexValue as any).foo.bar; // ❌
```

`as any` は最も避けるべきパターン。詳しくは [[02-anyを避ける理由と最小限の逃げ道]]。

### (4) 自分で都合のいい型に「強制」

```typescript
type User = { id: string; name: string };
const u = { id: "1" } as User; // ❌ name がないのに通る
console.log(u.name.length);    // 実行時エラー
```

オブジェクトリテラルは普通なら不足プロパティでエラーになりますが、`as` は黙らせてしまいます。

---

## 5. `as` を使ってよい限定的な場面

完全禁止は現実的でないので、**許容できる場面**を整理します。

### (1) DOM要素の絞り込み

```typescript
const input = document.getElementById("name") as HTMLInputElement;
```

`getElementById` は `HTMLElement | null` しか返さないが、**コード上の文脈**で確実に input である場合。

→ より安全には `instanceof` で確認する:

```typescript
const el = document.getElementById("name");
if (el instanceof HTMLInputElement) {
  el.value = "...";
}
```

### (2) 自前で検証した直後の型表明

```typescript
function isUser(v: unknown): v is User { ... }

const data: unknown = JSON.parse(raw);
if (isUser(data)) {
  // ここでは型ガードで data: User になる（asは不要）
}
```

`as` ではなく**型ガード関数**を使う方がベター。

### (3) オーバーロードや型推論の限界を埋める

```typescript
const handlers = new Map<string, (v: unknown) => void>();
handlers.set("user", (v) => {
  const user = v as User; // 内部規約で「user」キーの値は User と決まっている場合
  // ...
});
```

→ 可能なら型付きの判別ユニオンに作り直す。

### (4) `as const` 後の絞った型を別の型として使うとき

```typescript
const config = { mode: "dev" } as const;
const mode = config.mode as string; // 広い型に戻す（稀）
```

これは安全（狭い型 → 広い型）。

---

## 6. 安全な `as` のルール

実務で `as` を使うときの自衛ルール:

1. **`as any` は原則禁止**（ESLint で `no-explicit-any` を有効に）
2. **`as unknown as T` は要レビュー**（コメント必須）
3. **`as` はその関数の中だけで完結させる**（外に漏らさない）
4. **可能な限り型ガードに置き換える**（`is T`, `instanceof`）
5. **APIレスポンスには絶対に使わない**（バリデータを使う）

---

## 7. `as`/`as const` の使い分け早見表

| やりたいこと | 構文 | 例 |
|---|---|---|
| 型を**狭く固定**したい（widening抑制） | `as const` | `[1, 2] as const` |
| 型を**別の型に変えたい**（要注意） | `as Type` | `el as HTMLDivElement` |
| 何でも代入したい（NG） | `as any` | 使わない |
| 強制キャスト（最終手段） | `as unknown as Type` | コメント必須 |
| 値を検証してから型付け（推奨） | バリデータ / 型ガード | `Schema.parse(v)` / `isUser(v)` |

---

## 8. よくある質問

### Q: `<Type>value` という古い構文と `value as Type` の違いは？

機能は同じですが、**JSXと衝突する**ため、現代では `as` 構文を使うのが標準です。

```typescript
// 古い
const x = <number>someValue;

// 現代
const x = someValue as number;
```

### Q: `as` を使った瞬間にエラーが出ない＝安全？

**違います**。`as` は「コンパイラを黙らせる」だけで、**実行時のチェックは何もしません**。型と値が食い違っていれば、実行時に静かに壊れます。

### Q: `satisfies` 演算子との違いは？

TypeScript 4.9以降の `satisfies` は「型に**合致しているか検証**するが、推論された具体型を**壊さない**」ものです。

```typescript
// as: 型を上書きする
const config = { mode: "dev" } as { mode: string };
// 型: { mode: string }（リテラル "dev" が失われる）

// satisfies: 検証だけして推論を保つ
const config = { mode: "dev" } satisfies { mode: string };
// 型: { mode: "dev" }（リテラル型が保たれる）
```

「型を表明するけれど推論は活かしたい」なら **`satisfies` を優先**。

---

## 9. 判断フローチャート

```
型を変えたい
  ├─ 値はそのままで、表現を狭めたい？
  │    → as const
  ├─ 型を「広い型に合わせて検証」したい？
  │    → satisfies
  ├─ 値が本当にその型か？コードで保証できる？
  │    ├─ YES（DOM/コードの文脈で確実）
  │    │    → as Type（ただし狭く・短く・コメント）
  │    └─ NO
  │         ├─ 自前検証できる
  │         │    → 型ガード（is T）
  │         └─ 外部入力
  │              → バリデータ（Zod等）
  └─ 何でも入る型にしたい
       → そもそも設計を見直す（unknown / ジェネリクス）
```

---

## 10. まとめ

- **`as Type`**: コンパイラを黙らせる主張。誤用するとバグが静かに混入する
- **`as const`**: 安全な「型を狭める」操作。誤用しても危険はない
- **`as` を使うべき場面**: DOM絞り込み・型ガードの代替が困難・段階的移行の一時しのぎ
- **`as` を使ってはいけない場面**: APIレスポンス・unknownの強制変換・型エラー隠し
- **代替手段の優先順位**: 型ガード > バリデータ > `satisfies` > `as`（最終手段）

> `as` は「コードに**型の嘘**を埋め込む」行為。1か所の嘘が、3か月後にプロダクションで爆発します。**書く前にいったん手を止め、`satisfies` か型ガードで済まないか考える**癖を。

---

## 関連
- [[05-リテラル型とas-const]]
- [[02-anyを避ける理由と最小限の逃げ道]]
- [[03-unknownと安全な取り扱い]]
- [[as_asserting_dangers]]
- [[13-type-assertions]]
