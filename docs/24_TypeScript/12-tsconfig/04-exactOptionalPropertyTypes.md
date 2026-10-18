# `exactOptionalPropertyTypes` の影響

> `name?: string` という型は、デフォルトでは「**プロパティを省略**」も「**`undefined` を明示的に代入**」も両方OKです。`exactOptionalPropertyTypes: true` を有効にすると、**`?` と `| undefined` を厳密に区別**するようになります。地味ですが、PATCH系APIや状態管理で**「省略」と「`undefined`」の意味の違い**が型で表現できるようになる重要オプションです。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[03-noUncheckedIndexedAccess]]
- 次: [[05-isolatedModulesとビルド前提]]

---

## 1. デフォルトの挙動

```typescript
type User = {
  name?: string;
};

const a: User = {};                      // ✅ プロパティ省略
const b: User = { name: "Alice" };        // ✅
const c: User = { name: undefined };       // ✅ undefined を明示
```

→ `?` プロパティには **「省略」も「`undefined` 明示」も両方代入可**。

これが**意図しない挙動**を生むことがあります。

---

## 2. `exactOptionalPropertyTypes: true` で何が変わるか

```json
{
  "compilerOptions": {
    "exactOptionalPropertyTypes": true
  }
}
```

```typescript
type User = {
  name?: string;
};

const a: User = {};                       // ✅ 省略はOK
const b: User = { name: "Alice" };         // ✅
const c: User = { name: undefined };        // ❌ undefined を明示はNG
```

「`?` は **省略のみ許可**、`undefined` を明示したいなら `| undefined` を別途書け」というルール。

---

## 3. `?` と `| undefined` の区別が重要な場面

### PATCH API での意味の違い

```typescript
type UpdateUser = {
  name?: string;
};

// 「name を変更しない」
patch({});
// 「name を null/empty にする」
patch({ name: undefined });
// または
patch({ name: "" });
```

デフォルトの挙動では、`{}` と `{ name: undefined }` が**型としては区別不可**。サーバ側で挙動が違うのに、クライアントで誤って後者を送る可能性。

→ `exactOptionalPropertyTypes: true` なら、**型で意図的に区別**できる:

```typescript
type UpdateUser = {
  name?: string;                  // 省略可（フィールドを変更しない）
  description: string | null;     // 必須、null は「明示的に空にする」
};
```

### Reactのprops

```typescript
type Props = {
  className?: string;
};

// ❌ exactOptionalPropertyTypes 有効時
<Comp className={undefined} />

// ✅
<Comp />
<Comp className="foo" />
```

「未指定」と「`undefined` を渡す」が型で区別されるので、**省略時のデフォルト値**が明確になる。

---

## 4. `?` と `| undefined` の使い分け

### `?` のみ（プロパティ省略を許可、値は `undefined` 不可）

```typescript
type T = { name?: string };
const a: T = {};                  // ✅
const b: T = { name: "x" };        // ✅
const c: T = { name: undefined };   // ❌ 有効時
```

### `| undefined` のみ（必須プロパティ、値が `undefined` でもよい）

```typescript
type T = { name: string | undefined };
const a: T = {};                  // ❌ name が必須
const b: T = { name: "x" };        // ✅
const c: T = { name: undefined };   // ✅
```

### `?` + `| undefined`（両方許可）

```typescript
type T = { name?: string | undefined };
const a: T = {};                  // ✅
const b: T = { name: "x" };        // ✅
const c: T = { name: undefined };   // ✅
```

→ デフォルト挙動と同等。明示的に「両方OK」と表現したいときに。

---

## 5. 影響を受けるパターン

### (1) 分割代入

```typescript
type Props = { x?: number };

function f(props: Props) {
  const { x = 0 } = props;
  // x: number （デフォルト値が適用される）
}

f({ x: undefined }); // ❌ 有効時はエラー
f({});                // ✅
```

→ デフォルト値が**省略時のみ適用**されるルールを型でも一貫させる。

### (2) `Object.assign` / spread

```typescript
type T = { x?: number };
const a: T = {};
const b = { ...a, x: undefined }; // ❌ 有効時
```

### (3) ライブラリのオプション引数

```typescript
type Options = {
  timeout?: number;
};

callApi({ timeout: undefined }); // ❌ 有効時
callApi({});                      // ✅
callApi({ timeout: 1000 });        // ✅
```

→ ライブラリ側が「省略時はデフォルト値、`undefined` 明示は無効」のような挙動なら、型でそれを表現できる。

---

## 6. 既存コードへの影響（移行コスト）

`exactOptionalPropertyTypes` を後から有効にすると、**大量のエラー**が出る可能性。

### よくあるパターン

#### (a) 「条件付きで undefined を代入」

```typescript
// ❌
const obj: T = {
  name: condition ? "value" : undefined,
};

// ✅ 修正案
const obj: T = condition ? { name: "value" } : {};

// または
const obj: T = {};
if (condition) obj.name = "value";

// または `| undefined` を許可する
type T = { name?: string | undefined };
```

#### (b) Reactで `undefined` を渡す

```typescript
// ❌
<Comp value={maybe} />  // maybe: string | undefined

// ✅
{maybe !== undefined && <Comp value={maybe} />}

// または props 側で `?` ではなく `| undefined` にする
type Props = { value: string | undefined };
```

#### (c) ライブラリの型定義

ライブラリの型が `?` で書かれている場合、**そのライブラリ側を変更できない**ことが多い。`exactOptionalPropertyTypes` 有効化時に既存ライブラリでエラーが出ることも。

→ 受け入れ可能なライブラリの組み合わせか確認。

---

## 7. 有効化すべきプロジェクト・しないプロジェクト

### 有効化推奨

- **PATCH 系のAPI** を扱う（部分更新の意味が重要）
- **チームが規律を保てる**（migration コストを払える）
- **新規プロジェクト**

### 慎重に判断

- **既存の大規模プロジェクト**（移行コストが大きい）
- **ライブラリで `?` `| undefined` の混在が多い**
- **チームメンバーの理解が浅い**（混乱のもと）

→ 「**有効化のメリット > 移行コスト**」が成り立つかが判断軸。

---

## 8. 実例: APIの設計

```typescript
type UpdateUser = {
  // 省略 = 変更しない
  name?: string;

  // null = 明示的に削除
  middleName: string | null;

  // undefined = ?? 曖昧 → 意図を明確に
};

// API実装
async function updateUser(id: string, body: UpdateUser): Promise<User> {
  // body.name が undefined → 「変更しない」
  // body.middleName が null → 「削除」
  // body.middleName が undefined → 必須なので来ない
}
```

→ **省略・null・undefined** に**意味のある違い**を持たせる設計。

---

## 9. `noUncheckedIndexedAccess` との関係

両方とも「**型と実態の乖離を埋める**」厳密化オプション。

| | `noUncheckedIndexedAccess` | `exactOptionalPropertyTypes` |
|---|---|---|
| 対象 | インデックスアクセス | オプショナルプロパティ |
| 効果 | アクセス結果に `\| undefined` 追加 | `?` と `\| undefined` の区別 |
| 影響範囲 | 配列・辞書 | オブジェクト型 |
| 移行コスト | 中〜大 | 中〜大（ライブラリ依存） |

→ **両方とも有効化が理想**だが、影響を見極めて段階的に。

---

## 10. 設計指針

### 推奨: **`?` と `| undefined` を意図的に使い分ける**

```typescript
type CreateUserInput = {
  name: string;            // 必須
  email: string;            // 必須
  middleName?: string;     // 省略可（指定なし）
};

type UpdateUserInput = {
  name?: string;            // 省略可（変更しない）
  email?: string;            // 省略可
  middleName: string | null; // 必須、null で削除を意図
};
```

### 設計の意図を**コメント**で残す

```typescript
type Update = {
  /** 省略時: 変更しない */
  name?: string;
  /** null: 明示的に削除 */
  middleName: string | null;
};
```

---

## 11. 落とし穴

### (1) **デフォルト値との挙動の差**

```typescript
function f({ x = 0 }: { x?: number }) { ... }
f({ x: undefined }); // ❌ 有効時、デフォルトは適用されない
```

→ 関数引数で `?` を使う場合、デフォルト値とセットで使うのが安全。

### (2) **`Partial<T>` の `T` に注意**

```typescript
type T = { name: string };
type P = Partial<T>; // { name?: string }

const p: P = { name: undefined }; // ❌ 有効時
```

`Partial` を多用するコードでは影響大。

### (3) **JSONシリアライズで失われる**

```typescript
const obj = { name: undefined };
JSON.stringify(obj); // "{}" （undefined は消える）
```

→ シリアライズ時には省略と同等になる。**APIで明示的に区別したい場合は `null` を使う**。

### (4) **ライブラリ型が `?` で書かれている**

```typescript
// React の型
type Props = { className?: string };

<Comp className={undefined} /> // ❌ 有効時
```

→ ライブラリ側を変えられない場合、**自分のコードで `undefined` を渡さない**ようにする。

---

## 12. ベストプラクティス

### (1) **新規プロジェクトでは有効化を検討**

設計の意図が型に現れる。

### (2) **`?` と `| undefined` の使い分けを明文化**

チームで「省略 vs `undefined` の意味」を合意。

### (3) **PATCHには明示的に `null` を使う**

「**削除**」を意味するなら `null`。「**未変更**」なら省略。

### (4) **段階的に導入**

既存プロジェクトでは少しずつ。

### (5) **ライブラリ互換性を確認**

主要ライブラリが対応しているか先に確認。

---

## 13. 早見表

| 書き方 | 省略 | undefined 明示 | デフォルト時 | exactOptional時 |
|---|---|---|---|---|
| `name?: string` | ✅ | ✅ | ✅ | ❌ |
| `name: string \| undefined` | ❌ | ✅ | ✅ | ✅ |
| `name?: string \| undefined` | ✅ | ✅ | ✅ | ✅ |

---

## 14. まとめ

- **`exactOptionalPropertyTypes: true`**: `?` と `| undefined` を厳密に区別
- `?` のみ → 省略のみ可（`undefined` 明示はエラー）
- `| undefined` のみ → 必須、値は `undefined` 可
- 両方書くとデフォルト挙動
- **PATCH API** や **設定オブジェクト**で意味の違いが型で表現できる
- 既存プロジェクトの移行は**コスト大**、新規での導入推奨
- ライブラリの型と相性問題があることも

> `exactOptionalPropertyTypes` は「**地味だが意味のある厳密化**」。「省略」と「`undefined`」の違いに**意図がある**プロジェクトでは、この区別が型で表現できると設計が一段クリアになります。

---

## 関連
- [[03-noUncheckedIndexedAccess]]
- [[02-strictと主要オプション]]
- [[03-オブジェクト型]]
- [[exactOptionalPropertyTypes]]
