# `Pick<T, K>` / `Omit<T, K>`

> `Pick` は「**指定したキーだけ取り出す**」、`Omit` は「**指定したキーを除外する**」。元の型から派生型を作るときに**最も多用**するペア。1つの型を「**正準なソース**」として、目的別の型を導出していく ── これが現代的なTSの設計の中心です。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[01-Partial_Required_Readonly]]
- 次: [[03-Exclude_Extract_NonNullable]]

---

## 1. `Pick<T, K>` ── キーを抽出

`T` から指定したキーだけを取り出して新しい型を作る。

```typescript
type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

type PublicUser = Pick<User, "id" | "name" | "email">;
// {
//   id: string;
//   name: string;
//   email: string;
// }
```

→ **`password` を含めない公開型**ができる。

### 内部実装

```typescript
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

`K extends keyof T` の制約で、**存在しないキーを指定するとエラー**。

```typescript
type Bad = Pick<User, "wrong">; // ❌
```

---

## 2. `Pick` の使い所

### (1) DTOやAPIレスポンス

```typescript
type User = { id: string; name: string; email: string; password: string };

// 公開API用
type PublicUserDTO = Pick<User, "id" | "name">;

// 認証時用
type AuthInfo = Pick<User, "email" | "password">;
```

### (2) Reactコンポーネントの一部 props

```typescript
type ButtonProps = {
  label: string;
  onClick: () => void;
  variant: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  disabled: boolean;
};

type IconButtonProps = Pick<ButtonProps, "onClick" | "variant" | "size">;
```

### (3) コンポーネント間で props を中継

```typescript
type ListItemProps = Pick<ItemProps, "id" | "title" | "onSelect">;
```

### (4) フォームでの選択的サブセット

```typescript
type Settings = { theme: string; lang: string; notifications: boolean; ... };
type ThemeSettings = Pick<Settings, "theme">;
```

---

## 3. `Omit<T, K>` ── キーを除外

`T` から指定したキーを取り除いた型を作る。

```typescript
type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

type SafeUser = Omit<User, "password">;
// {
//   id: string;
//   name: string;
//   email: string;
// }
```

### 内部実装

```typescript
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

「`T` のキーから `K` を除いて、それを `Pick` で取り出す」という構造。`Exclude` は [[03-Exclude_Extract_NonNullable]]。

### `K extends keyof any` の意味

`Omit` では `K` が `keyof T` に制約されていない（`keyof any` = `string | number | symbol`）。これは**意図的**で、「**T に存在しないキーを `Omit` で指定してもエラーにならない**」という挙動につながる:

```typescript
type T = Omit<User, "password" | "wrong"); // ✅ "wrong" がなくてもエラーなし
```

→ 後述の落とし穴に注意。

---

## 4. `Omit` の使い所

### (1) 特定フィールドを取り除く

```typescript
type User = { id: string; name: string; password: string };
type SafeUser = Omit<User, "password">;
```

### (2) 入力型から自動生成フィールドを除外

```typescript
type DBRecord = {
  id: string;        // 自動生成
  createdAt: Date;   // 自動生成
  updatedAt: Date;   // 自動生成
  name: string;
  description: string;
};

type CreateInput = Omit<DBRecord, "id" | "createdAt" | "updatedAt">;
// { name: string; description: string }
```

→ **DB レコードから入力型を導出**する典型パターン。

### (3) 特定 prop を消して別の型に置き換え

```typescript
type ButtonProps = { onClick: () => void; label: string };

type LinkButtonProps = Omit<ButtonProps, "onClick"> & {
  href: string;
};
// { label: string; href: string }
```

→ **プロパティを置換**する定番テクニック。

---

## 5. `Pick` vs `Omit` ── どちらを使うか

### `Pick` を使うべき場面

- **必要なフィールドが少ない**ときに、含めたいものを明示
- **限定的な公開API**を作る

```typescript
type PublicUserDTO = Pick<User, "id" | "name">;
```

### `Omit` を使うべき場面

- **除外したいフィールドが少ない**とき
- 「これだけ無し」を明示したい

```typescript
type SafeUser = Omit<User, "password">;
```

### 一般原則

- **元の型のフィールドが増えるたびに**:
  - `Pick` → 含めるリストを更新する必要がある
  - `Omit` → 自動的に新フィールドが含まれる
- **「公開しない」フィールドを管理**: `Omit` の方が安全（追加されたフィールドを自動含める）
- **「公開する」フィールドを限定**: `Pick` の方が安全（追加されたフィールドが勝手に公開されない）

→ **セキュリティが大事なら `Pick`**（明示的に必要なフィールドだけ通す）。

---

## 6. ジェネリクスとの組み合わせ

### `Pick` を使った汎用関数

```typescript
function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const k of keys) result[k] = obj[k];
  return result;
}

const user = { id: "1", name: "Alice", password: "secret" };
const safe = pick(user, "id", "name");
// 型: { id: string; name: string }
```

### `Omit` を使った汎用関数

```typescript
function omit<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const k of keys) delete result[k];
  return result;
}

const safe2 = omit(user, "password");
```

→ どちらも実務でよく自作する。

---

## 7. `Omit` の落とし穴

### (1) 存在しないキーがエラーにならない

```typescript
type SafeUser = Omit<User, "password" | "wrong"); // ✅ 通ってしまう
```

`Omit` の `K` の制約が緩いため、**タイポを検出できない**。

→ 厳密版を自作:

```typescript
type StrictOmit<T, K extends keyof T> = Omit<T, K>;

type Bad = StrictOmit<User, "wrong"); // ❌ エラー
```

### (2) ユニオン型でうまく動かない

```typescript
type T =
  | { kind: "a"; x: number }
  | { kind: "b"; y: string };

type R = Omit<T, "kind">;
// { x: number } | { y: string }  ← OK

type R2 = Pick<T, "kind">;
// { kind: "a" } | { kind: "b" }
```

ユニオン型に `Omit` を使うと、各メンバーから取り除く挙動になる。**判別子**を残したいときは注意。

### (3) インデックスシグネチャを失う

```typescript
type T = { id: string; [key: string]: unknown };
type R = Omit<T, "id">;
// { [key: string]: unknown }
```

挙動的には妥当だが、意図と違うことも。

---

## 8. `Pick` / `Omit` を組み合わせた応用パターン

### プロパティの型を「上書き」

```typescript
type User = { id: string; age: number; name: string };

// age を string に変える
type UserWithStringAge = Omit<User, "age"> & { age: string };
// { id: string; name: string; age: string }
```

→ 1フィールドだけ型を変えたいときの定番。

### ヘルパー型化

```typescript
type Override<T, R> = Omit<T, keyof R> & R;

type T = Override<User, { age: string }>;
// { id: string; name: string; age: string }
```

「**既存型の一部を上書き**」を1ステップで。

### `Partial` と組み合わせる

```typescript
type User = { id: string; name: string; email: string };

type UpdateInput = Partial<Omit<User, "id">>;
// { name?: string; email?: string }
```

「**id は変更不可、それ以外は optional な更新**」を表現。

### `Required` と組み合わせる

```typescript
type ConfigInput = Partial<Config>;
type ConfigResolved = Required<Pick<Config, "apiUrl" | "timeout">>;
```

---

## 9. 実例: ドメイン型から派生型を作る

```typescript
type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

// 公開用（password を含めない）
type PublicUser = Omit<User, "password" | "deletedAt">;

// 一覧表示用（最小限）
type UserListItem = Pick<User, "id" | "name">;

// 作成入力（id・タイムスタンプは自動）
type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt" | "deletedAt">;

// 更新入力（部分更新）
type UpdateUserInput = Partial<Omit<User, "id" | "createdAt" | "updatedAt" | "deletedAt">>;
```

→ **1つの正準型（`User`）から、用途別の型を導出**する設計。元の型を変更すれば、派生型も自動追従する。

---

## 10. ベストプラクティス

### (1) **正準型 + 派生型**の設計を意識

```typescript
type User = { ... };          // ソース
type PublicUser = Omit<User, "password">; // 派生
type CreateUserInput = Omit<User, "id">;   // 派生
```

### (2) **大きな型は分割せず、Pick/Omitで切り出す**

```typescript
// ❌ 別々に書くと同期が大変
type User = { id: string; name: string; email: string };
type CreateUser = { name: string; email: string };

// ✅ Omit で派生
type User = { id: string; name: string; email: string };
type CreateUser = Omit<User, "id">;
```

### (3) **型変換のチェーンは1つの型エイリアスに**

```typescript
type UpdateUserInput = Partial<Omit<User, "id" | "createdAt">>;
```

長くなるなら名前を付けて分かりやすく:

```typescript
type EditableUser = Omit<User, "id" | "createdAt">;
type UpdateUserInput = Partial<EditableUser>;
```

### (4) **`Pick` を `Record` で代用する**ケース

```typescript
type Form = Record<"email" | "password", string>;
// { email: string; password: string }
```

全プロパティが**同じ型**なら、`Record<キーのユニオン, 値型>` の方が短い。

---

## 11. アンチパターン

### (1) **`Omit` で存在しないキーを指定してもエラーにならない**ことを忘れる

```typescript
type T = Omit<User, "passwrod"); // タイポでも通る
```

→ 厳密版（`StrictOmit`）または ESLint で対策。

### (2) **複雑な変換をネストしすぎる**

```typescript
type T = Required<Partial<Omit<Pick<User, "a" | "b">, "a">>>;
```

→ 中間型に名前を付ける。

### (3) **手書きで派生型を作って同期が切れる**

```typescript
type User = { id: string; name: string; email: string };
type CreateUser = { name: string; email: string }; // 手書き
// User に age を追加 → CreateUser を更新し忘れ
```

→ 派生は `Omit` で機械的に。

---

## 12. 早見表

| 標準型 | 効果 |
|---|---|
| `Pick<T, K>` | T の K キーだけ取り出す |
| `Omit<T, K>` | T から K キーを除外 |
| `Pick<T, K> & R` | 上書き不可 |
| `Omit<T, K> & R` | プロパティの**置換**（Override） |
| `Partial<Omit<T, K>>` | 一部キーを除外して残りを optional に |

---

## 13. まとめ

- **`Pick<T, K>`**: T から K のキーだけを抽出
- **`Omit<T, K>`**: T から K のキーを除外
- 「**正準型**」を1つ持って、`Pick` / `Omit` で**派生型を導出**するのが現代設計
- `Omit` は存在しないキーでもエラーにならない（**厳密版を自作**してもよい）
- `Override<T, R> = Omit<T, keyof R> & R` で**プロパティを上書き**する
- セキュリティが大事なら `Pick`（明示）、保守性なら `Omit`（自動追従）

> `Pick` と `Omit` を使いこなすと、「**1か所変更すれば派生型が全部追従する**」設計が手に入ります。これがTSで「型を書く意味」が一気に大きくなる場面です。

---

## 関連
- [[01-Partial_Required_Readonly]]
- [[03-Exclude_Extract_NonNullable]]
- [[06-自作ユーティリティ型入門]]
- [[03-keyofとインデックスアクセス型]]
