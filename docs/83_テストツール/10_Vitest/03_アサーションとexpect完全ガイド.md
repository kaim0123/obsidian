# 03 — アサーションと expect 完全ガイド

この章では、Vitest の中心的な API である **`expect`** を徹底解説します。マッチャー（`toBe`, `toEqual` など）の種類と使い分け、スナップショットテスト、非同期アサーションまでを押さえます。

---

## アサーションとは何か

**アサーション**とは、「**実際の値が期待どおりであることを宣言する**」命令です。期待どおりでなければテストは失敗し、Vitest がその差分を報告してくれます。

```ts
expect(実際の値).マッチャー(期待値);
```

Vitest のアサーションは、内部的に [Chai](https://www.chaijs.com/) 互換の API に Jest 互換の拡張を加えたものです。Jest のマッチャーはほぼすべて使えます。

---

## 等価系マッチャー

### `toBe` — 厳密な同一性（`===`）

```ts
expect(1 + 1).toBe(2);
expect('hello').toBe('hello');
expect(true).toBe(true);
```

- プリミティブ（number / string / boolean / null / undefined / symbol / bigint）に使う。
- オブジェクトや配列に `toBe` を使うと、**参照が同じ**である場合にしか通らない。

```ts
const a = { x: 1 };
expect(a).toBe(a);              // ✓ 同じ参照
expect({ x: 1 }).toBe({ x: 1 }); // ❌ 別の参照
```

### `toEqual` — 構造的に等価

```ts
expect({ name: 'Alice', age: 20 }).toEqual({ name: 'Alice', age: 20 });
expect([1, 2, 3]).toEqual([1, 2, 3]);
```

- ネストも再帰的に比較する。
- **`undefined` のプロパティは無視**される。`toStrictEqual` は無視しない。

```ts
expect({ a: 1, b: undefined }).toEqual({ a: 1 });       // ✓
expect({ a: 1, b: undefined }).toStrictEqual({ a: 1 }); // ❌
```

### `toStrictEqual` — より厳密な構造等価

- `undefined` を持つキーの有無まで区別する。
- **`class` のインスタンスかプレーンオブジェクトか**も区別する。

```ts
class User { constructor(public name: string) {} }

expect(new User('Alice')).toEqual({ name: 'Alice' });        // ✓
expect(new User('Alice')).toStrictEqual({ name: 'Alice' });  // ❌（クラスが違う）
```

**使い分けの指針**：

- 普段は `toEqual` で十分。
- DTO の厳密な形を保証したい／`undefined` を意図して持たせていることを検証したい → `toStrictEqual`。
- 文字列 / 数値 / boolean → `toBe`。

---

## 真偽・存在系マッチャー

| マッチャー | 意味 |
|-----------|------|
| `toBeTruthy()` | JavaScript 的に真（`0`, `''`, `null`, `undefined`, `NaN`, `false` 以外） |
| `toBeFalsy()` | JavaScript 的に偽 |
| `toBeNull()` | `null` |
| `toBeUndefined()` | `undefined` |
| `toBeDefined()` | `undefined` ではない |
| `toBeNaN()` | `NaN` |

```ts
expect(user.isAdmin).toBeTruthy();
expect(user.deletedAt).toBeNull();
expect(process.env.API_KEY).toBeDefined();
```

> **ヒント**：可能なら `toBeTruthy` より `toBe(true)` のほうが意図が明確です。「どの真値でもいい」のか「`true` である必要がある」のかで使い分けます。

---

## 数値系マッチャー

```ts
expect(10).toBeGreaterThan(5);          // >
expect(10).toBeGreaterThanOrEqual(10);  // >=
expect(3).toBeLessThan(5);              // <
expect(3).toBeLessThanOrEqual(3);       // <=

expect(0.1 + 0.2).toBeCloseTo(0.3);     // 浮動小数の近似比較
expect(0.1 + 0.2).toBeCloseTo(0.3, 5);  // 小数点以下 5 桁まで一致
```

**`toBeCloseTo` は浮動小数点計算で必須**です。`0.1 + 0.2 === 0.3` は `false` なので、`toBe` や `toEqual` を使うとテストが落ちます。

---

## 文字列・配列・オブジェクト

### 文字列

```ts
expect('Hello, World').toContain('World');
expect('abc123').toMatch(/^[a-z]+\d+$/);
expect('abc').toHaveLength(3);
```

- `toMatch` は文字列 or 正規表現を取れる。

### 配列

```ts
expect([1, 2, 3]).toContain(2);
expect([1, 2, 3]).toHaveLength(3);
expect([{ id: 1 }, { id: 2 }]).toContainEqual({ id: 1 }); // オブジェクトの中身比較
```

- `toContain` は `===` で比較、`toContainEqual` は構造比較。

### オブジェクト

```ts
const user = { id: 1, name: 'Alice', role: 'admin' };

expect(user).toHaveProperty('name');
expect(user).toHaveProperty('name', 'Alice');
expect(user).toHaveProperty('profile.email');       // ネストもドット記法
expect(user).toMatchObject({ name: 'Alice' });      // 部分一致
```

- **`toMatchObject`** は「期待するキーだけ一致していればよい」ケースで便利。API レスポンスの一部だけ検証したいときに多用します。

---

## 例外系マッチャー — `toThrow`

例外を投げる関数をテストするときは、**関数をラップして渡す**のがポイントです。

```ts
// ❌ この書き方だと、expect を呼ぶ前に例外が飛んでしまう
expect(divide(1, 0)).toThrow();

// ✓ ラップすれば、Vitest 側で呼び出して捕捉してくれる
expect(() => divide(1, 0)).toThrow();
```

マッチしたい条件：

```ts
expect(() => divide(1, 0)).toThrow();                       // 何らかのエラー
expect(() => divide(1, 0)).toThrow('0 で割る');             // メッセージの部分一致
expect(() => divide(1, 0)).toThrow(/0 で割/);               // 正規表現
expect(() => divide(1, 0)).toThrow(DivisionByZeroError);    // エラークラス
expect(() => divide(1, 0)).toThrow(new Error('0 で割る'));  // エラーオブジェクト
```

非同期関数で投げられる例外は `rejects` と組み合わせる（後述）。

---

## 非同期アサーション

### Promise を扱うパターン

```ts
// パターン 1：await してから expect（最もシンプル・推奨）
it('ユーザーを取得できる', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('Alice');
});

// パターン 2：resolves / rejects
it('ユーザーを取得できる（resolves）', async () => {
  await expect(fetchUser(1)).resolves.toMatchObject({ name: 'Alice' });
});

it('存在しないユーザーは例外になる', async () => {
  await expect(fetchUser(999)).rejects.toThrow('not found');
});
```

- `resolves` / `rejects` を使うときは **`await`（または `return`）が必須**。忘れるとテストが常に成功してしまう。
- 迷ったら **「パターン 1：`await` してから `expect`」** が一番ミスが少ないです。

---

## `expect.xxx` — 柔軟な期待値

値そのものではなく「条件」を期待値として使えます。`toEqual` / `toMatchObject` と組み合わせることが多いです。

```ts
expect(user).toEqual({
  id: expect.any(Number),               // 数値ならなんでも
  name: expect.any(String),
  createdAt: expect.any(Date),
  email: expect.stringMatching(/@/),    // 正規表現にマッチする文字列
  tags: expect.arrayContaining(['vip']),// 配列にこの要素を含む
  profile: expect.objectContaining({    // 指定したキーを含むオブジェクト
    age: expect.any(Number),
  }),
});

// 特定のキーを持たないことを期待
expect(response).toEqual(expect.not.objectContaining({ password: expect.anything() }));
```

主要なもの：

| 書き方 | 意味 |
|--------|------|
| `expect.any(Constructor)` | そのコンストラクタ（`String`/`Number`/`Date`/`Array` など）のインスタンス |
| `expect.anything()` | `null` / `undefined` 以外なら何でも |
| `expect.stringContaining('X')` | X を含む文字列 |
| `expect.stringMatching(/X/)` | 正規表現にマッチする文字列 |
| `expect.arrayContaining([...])` | 指定要素をすべて含む配列（順序は任意） |
| `expect.objectContaining({...})` | 指定キーを**含む**オブジェクト |
| `expect.closeTo(n, digits)` | 近似比較（`toBeCloseTo` の柔軟版） |

**ID や `createdAt` のような「値が不定」のフィールドを含むオブジェクトを検証するときに必須のテクニック**です。

---

## `not` で反転する

マッチャーの直前に `.not` を挟むと意味が反転します。

```ts
expect(value).not.toBe(null);
expect(list).not.toContain('error');
expect(() => fn()).not.toThrow();
```

- 「`not.toBeFalsy()`」は二重否定で読みにくいので、**素直に `toBeTruthy()` を使う**ほうが親切。

---

## スナップショットテスト

複雑な出力（HTML、JSON、エラーメッセージなど）を「前回と同じであること」を確認するテストです。

### `toMatchSnapshot` — ファイルに保存

```ts
it('ユーザーのサマリーは期待どおり', () => {
  const summary = renderSummary({ id: 1, name: 'Alice' });
  expect(summary).toMatchSnapshot();
});
```

- 初回実行時：`__snapshots__/xxx.test.ts.snap` に自動で保存。
- 2 回目以降：保存済みと比較。差分があれば失敗。
- 意図して変更した場合は `vitest -u`（または実行中に `u` キー）で更新。

### `toMatchInlineSnapshot` — ファイル内にインラインで保存

```ts
it('ユーザーのサマリー（インライン）', () => {
  expect(renderSummary({ id: 1, name: 'Alice' })).toMatchInlineSnapshot();
});
```

初回実行時に自動で引数が埋められ、次のようになります。

```ts
expect(renderSummary({ id: 1, name: 'Alice' })).toMatchInlineSnapshot(`
  "User: Alice (#1)"
`);
```

- 小さい出力なら**インラインのほうが見通しが良い**（スナップショットファイルを探さずに済む）。
- 大きい出力や HTML などは、ファイル分離型の `toMatchSnapshot` が読みやすい。

### スナップショットの落とし穴

- **意味もわからず `-u` で更新する**と、バグを「正しい状態」として固定化してしまう。**差分を必ず人間が確認**する。
- スナップショットが肥大化すると、PR レビューの負荷が大きい。**重要な部分だけ抜き出して `toMatchObject` で検証する**方が保守性が高いことも多い。

### エラーのスナップショット

```ts
it('0 除算エラーのメッセージは安定している', () => {
  expect(() => divide(1, 0)).toThrowErrorMatchingInlineSnapshot(`"0 で割ることはできません"`);
});
```

例外メッセージをインラインで固定したいときに便利です。

---

## カスタムマッチャー

プロジェクト固有の検証が増えたら、自作マッチャーにできます。

```ts
// test-setup.ts
import { expect } from 'vitest';

expect.extend({
  toBeValidEmail(received: string) {
    const pass = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid email`
          : `expected ${received} to be a valid email`,
    };
  },
});
```

`vitest.config.ts` の `setupFiles` に追加。

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    setupFiles: ['./test-setup.ts'],
  },
});
```

TypeScript の型定義も追加しておくと補完が効きます。

```ts
// test-setup.d.ts
import 'vitest';
interface CustomMatchers<R = unknown> {
  toBeValidEmail(): R;
}
declare module 'vitest' {
  interface Assertion<T> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
```

**使いすぎ注意**：10 個以上のカスタムマッチャーを持ち始めたら、そのチームに根付く「テストの共通語彙」になるか、あるいは単に `expect(fn(x)).toBe(true)` で十分かを検討しましょう。

---

## よくあるマッチャー選びの落とし穴

| 場面 | 間違い | 正解 |
|------|--------|------|
| オブジェクトの中身を比べたい | `toBe` | `toEqual` |
| 浮動小数を比べたい | `toBe(0.3)` | `toBeCloseTo(0.3)` |
| 例外を期待したい | `expect(fn()).toThrow()` | `expect(() => fn()).toThrow()` |
| 非同期の結果を比べたい | `expect(promise).resolves.toBe(...)` を `await` し忘れ | `await expect(promise).resolves.toBe(...)` |
| 配列にオブジェクトが含まれるか | `toContain({...})` | `toContainEqual({...})` |
| 特定のキーだけ検証したい | 全部書いて `toEqual` | `toMatchObject({...})` |

---

## この章のまとめ

- **プリミティブは `toBe`、オブジェクト／配列は `toEqual`**。この 2 つを最初に押さえる。
- 部分一致は `toMatchObject` / `toContainEqual` / `expect.objectContaining` を使い分ける。
- 浮動小数は `toBeCloseTo`。
- 非同期は **「`await` してから `expect`」** が一番安全。`resolves`/`rejects` を使うなら `await` を忘れない。
- スナップショットは便利だが、**変更のたびに差分をレビュー**する運用を守る。

---

## 次章

[[04_モックとスパイ|04 — モックとスパイ]] では、外部依存（API、DB、時刻など）を切り離してテストするための `vi.fn` / `vi.mock` を解説します。
