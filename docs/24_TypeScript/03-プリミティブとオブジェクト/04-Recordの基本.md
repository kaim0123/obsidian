# `Record` の基本

> `Record<K, V>` は「**キーが K、値が V の辞書型**」を作るユーティリティ型です。インデックスシグネチャの代わりに使え、**選択肢が決まったキー**にも使えるため、実務での出現頻度が非常に高い型です。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[03-オブジェクト型]]

---

## 1. `Record<K, V>` とは

`Record` は**標準ユーティリティ型**の1つ。

```typescript
Record<キーの型, 値の型>
```

「キーが `K` 型、値が `V` 型のオブジェクト」を作ります。

```typescript
type StringMap = Record<string, string>;
// { [key: string]: string } と同じ

const m: StringMap = {
  apple: "りんご",
  orange: "オレンジ",
};
```

---

## 2. インデックスシグネチャとの関係

`Record` は実は**インデックスシグネチャの糖衣構文**です。

```typescript
// この2つは等価
type A = { [key: string]: number };
type B = Record<string, number>;
```

なぜ `Record` を使うか:

- **短くて読みやすい**
- 標準のユーティリティ型なので、**他のユーティリティ型（`Pick`, `Omit` など）と組み合わせやすい**
- TypeScript側もインデックスシグネチャより `Record` を推奨

新規コードでは **`Record` を使う**のがベストプラクティス。

---

## 3. キーの型の選択肢

`Record<K, V>` の `K` には以下が入ります。

### (1) `string` / `number` / `symbol`（広い型）

```typescript
type StringDict = Record<string, number>;  // 任意の文字列キー
type NumDict = Record<number, string>;     // 数値キー
```

### (2) リテラルユニオン型（**実務で最も多用**）

```typescript
type Status = "loading" | "success" | "error";
type StatusMessages = Record<Status, string>;
// { loading: string; success: string; error: string }

const messages: StatusMessages = {
  loading: "読み込み中...",
  success: "完了！",
  error: "エラーが発生しました",
};
```

**全キーが必須**になるのが重要なポイント。`loading` を書き忘れたらエラー。

### (3) `keyof` で他の型のキーを使う

```typescript
type User = { id: string; name: string; email: string };
type Validators = Record<keyof User, (v: string) => boolean>;
// { id: ...; name: ...; email: ... }
```

「**`User` の各フィールドに対するバリデータ**」を型で表現できる。

---

## 4. インデックスシグネチャと `Record<リテラル, V>` の決定的な違い

最重要ポイント:

```typescript
// インデックスシグネチャ: 任意のキー
type A = { [key: string]: number };
const a: A = {}; // ✅ 空でもOK
a.anything;       // 型は number（実際は undefined）

// Record + リテラル: キーが固定
type B = Record<"a" | "b", number>;
const b: B = {}; // ❌ a も b も必須
const b2: B = { a: 1, b: 2 }; // ✅
b2.a; // number（必ず存在）
```

→ **キーが決まっているなら必ず `Record<リテラル, V>`**。インデックスシグネチャは「任意のキー」のときだけ。

---

## 5. `Record` の典型的な使い所

### (1) 状態ごとのメッセージ・スタイル定義

```typescript
type Status = "idle" | "loading" | "success" | "error";

const statusColors: Record<Status, string> = {
  idle: "gray",
  loading: "blue",
  success: "green",
  error: "red",
};
```

`Status` に新しい値を追加すると、`statusColors` の対応漏れが**コンパイルエラー**になる。

### (2) IDをキーにしたエンティティマップ

```typescript
type UsersById = Record<string, User>;

const users: UsersById = {
  u1: { name: "Alice", age: 30 },
  u2: { name: "Bob", age: 25 },
};
```

`Map` を使う代わりにシンプルに表現できる。

### (3) 列挙された設定

```typescript
type Feature = "darkMode" | "notifications" | "experiments";
type FeatureFlags = Record<Feature, boolean>;

const flags: FeatureFlags = {
  darkMode: true,
  notifications: false,
  experiments: false,
};
```

### (4) フォームのバリデーション結果

```typescript
type Field = "email" | "password";
type Errors = Partial<Record<Field, string>>;

const errors: Errors = {
  email: "形式が不正です",
  // password は省略可
};
```

`Partial` と組み合わせて「**あるかもしれないエラー**」を表現。

### (5) ジェネリックな辞書

```typescript
function group<K extends string, T>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const k = keyFn(item);
    (result[k] ??= []).push(item);
  }
  return result;
}

const users = [
  { name: "Alice", role: "admin" },
  { name: "Bob", role: "user" },
] as const;

const grouped = group(users, u => u.role);
// Record<"admin" | "user", typeof users[number][]>
```

---

## 6. `Partial` / `Required` / `Readonly` との組み合わせ

### `Partial<Record<K, V>>` ── キーは省略可、値は型保証

```typescript
type Status = "ok" | "ng";
type OptionalMessages = Partial<Record<Status, string>>;
// { ok?: string; ng?: string }
```

選択肢の一部だけ持つマップ。

### `Readonly<Record<K, V>>` ── 書き換え不可

```typescript
const CONFIG: Readonly<Record<string, string>> = {
  apiUrl: "https://...",
};

CONFIG.apiUrl = "..."; // ❌
```

定数オブジェクトを保護できる。

---

## 7. `Map` との使い分け

JavaScriptには `Map` クラスもあります。`Record` との違い:

| 観点 | `Record<K, V>` | `Map<K, V>` |
|---|---|---|
| 実体 | プレーンなオブジェクト | `Map` インスタンス |
| キーの型 | `string`/`number`/`symbol`/リテラル | **任意の値**（オブジェクトもOK） |
| 反復順序 | 保証されない（実装依存） | 挿入順を保証 |
| サイズ取得 | `Object.keys(o).length` | `m.size` |
| JSON化 | `JSON.stringify` 可 | 不可（カスタム必要） |
| 用途 | DTO・設定・列挙 | キャッシュ・動的なキー集合 |

### 使い分けの目安

- **キーが固定/限定で、JSONなどでやりとりする** → `Record`
- **キーが動的に追加・削除される、サイズが変動する** → `Map`
- **キーがオブジェクト** → `Map` 一択

---

## 8. `Record` の落とし穴

### (1) 値の絞り込みが効かない

```typescript
type Dict = Record<string, number>;
const d: Dict = { a: 1 };

const v = d.someKey; // 型: number（実際は undefined）
v.toFixed();          // 実行時エラー
```

`Record<string, V>` は「任意のキーが V を返す」ので、未存在キーが `undefined` を返すことを型が表現できない。

→ `noUncheckedIndexedAccess: true` を有効にすると、戻り値が `V | undefined` になる。

```typescript
// noUncheckedIndexedAccess: true
const v = d.someKey; // number | undefined
```

実務では**必ず有効化**したいオプション。詳しくは [[noUncheckedIndexedAccess]]。

### (2) リテラルキーでも欠落チェックは厳密

```typescript
type Status = "ok" | "ng";
const s: Record<Status, string> = {
  ok: "OK",
  // ng が無いとエラー
};
```

これは正しい挙動。**全キー必須**になるのが `Record<リテラル, V>` の利点。

### (3) `Object.keys` の戻り値型

```typescript
type Status = "ok" | "ng";
const s: Record<Status, string> = { ok: "O", ng: "N" };

Object.keys(s); // string[] （！）not ("ok" | "ng")[]
```

`Object.keys` は型として `string[]` を返します。これはTypeScriptの仕様（オブジェクトに余分なプロパティが入っているかもしれないため）。

→ ループでキーを使うときは型アサーションが必要:

```typescript
(Object.keys(s) as Status[]).forEach(k => {
  const v = s[k]; // ✅ string
});
```

---

## 9. `Record` の応用パターン

### (1) Mapped Type の入り口

`Record` は内部的には Mapped Type です。

```typescript
type MyRecord<K extends keyof any, V> = {
  [P in K]: V;
};
```

これを応用すると、より柔軟な型が作れます（[[09-mapped types]] で詳述）。

### (2) `keyof` と組み合わせて値を引く

```typescript
const ROLES = {
  admin: "管理者",
  user: "ユーザー",
} as const;

type RoleKey = keyof typeof ROLES;
// "admin" | "user"

type RoleLabel = typeof ROLES[RoleKey];
// "管理者" | "ユーザー"
```

`as const` + `Record` 的な発想で、**値からも型を導出**できる。

### (3) 型ガード関数のマップ

```typescript
type TypeGuards = Record<string, (v: unknown) => boolean>;

const guards: TypeGuards = {
  isString: v => typeof v === "string",
  isNumber: v => typeof v === "number",
};
```

---

## 10. `Record` 早見表

| 書きたいこと | 型 |
|---|---|
| 任意のstringキー → number | `Record<string, number>` |
| 限定キー → 値（全キー必須） | `Record<"a" \| "b", string>` |
| 限定キー → 値（一部省略可） | `Partial<Record<"a" \| "b", string>>` |
| キーごとに異なる型 | `Record` ではなく通常のオブジェクト型 |
| 動的に追加されるキー | `Record<string, V>` または `Map` |

---

## 11. まとめ

- `Record<K, V>` = **キー K、値 V の辞書型**
- インデックスシグネチャより**短く、読みやすく、組み合わせやすい**
- **`Record<リテラル型, V>`** にすると全キー必須でタイポ・漏れを検出
- `Partial` / `Readonly` と組み合わせて柔軟に表現
- 落とし穴: `noUncheckedIndexedAccess` を有効に / `Object.keys` の戻り値は `string[]`
- `Map` との使い分け: 静的なら `Record`、動的なら `Map`

> `Record` を使いこなせると、**「決まった選択肢に対して、対応するデータを必ず用意する」**設計が型で保証されます。enum的な使い方や設定オブジェクトでは、ほぼ毎日使う型です。

---

## 関連
- [[03-オブジェクト型]]
- [[10-utility-types]]
- [[noUncheckedIndexedAccess]]
- [[05-リテラル型とas-const]]
