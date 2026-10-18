# JSONの型付け（入ってくるデータは信用しない）

> 「**外から来たデータには型がない**」── これは TypeScript で最も重要な前提の1つです。`JSON.parse` の戻り値は標準で `any`、`fetch().json()` も `any`。**外部データを `unknown` で受け、検証してから内部の型世界に取り込む** ── この原則を守るかどうかで、本番の安定性が天と地ほど変わります。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 次: [[02-バリデーションと型の同期]]

---

## 1. JSON は「信用できないデータ」の代表

JSONは外部から来る:

- APIレスポンス
- LocalStorage / Cookie の値
- フォームの入力
- 設定ファイル
- WebSocket メッセージ
- メッセージキュー

これらの**型は実行時には何もない**。コードで「`User` 型のはず」と思っても、**実態は何でもありえる**。

```json
{ "name": "Alice", "age": 30 }      // 期待
{ "name": "Alice" }                  // age がない
{ "name": "Alice", "age": "30" }     // age が文字列
null                                  // null
{ "evil": "..." }                    // 全然違う
```

→ **型注釈で解決しないこと**を理解する。

---

## 2. `JSON.parse` の戻り値は `any`

```typescript
const data = JSON.parse('{"name":"Alice"}');
// data: any
```

`any` なので**何でもアクセスできる**:

```typescript
data.name.toUpperCase();   // 通る → 実行時エラーの可能性
data.evil.boom();           // 通る → 同様
```

→ **型システムが死んでいる状態**。

### 標準では避けようがない

`JSON.parse` の型定義は:

```typescript
JSON.parse(text: string, reviver?: ...): any
```

戻り値が **`any`** になっている。TypeScriptの仕様。

---

## 3. 解決策: `unknown` で受け直す

自前で型を `unknown` にして、**安全な扱い**を強制する:

```typescript
function parseJSON(s: string): unknown {
  return JSON.parse(s);
}

const data = parseJSON('{"name":"Alice"}');
// data: unknown

data.name; // ❌ unknown には何もできない
```

→ `unknown` なので**絞り込みかバリデーションが必要**。

### ヘルパとして用意

```typescript
// utils/json.ts
export function safeParse(s: string): unknown {
  return JSON.parse(s);
}
```

プロジェクト内で `JSON.parse` を直接使わず、必ずこのヘルパ経由にする。

---

## 4. `as` で型を強制するアンチパターン

最悪のパターン:

```typescript
const data = JSON.parse(s) as User; // ❌ 嘘の保証
data.name.toUpperCase(); // 中身が User とは限らない
```

→ **コンパイラを黙らせるだけ**。実行時は何も検証されていない。

実例:

```typescript
// 期待: { name: string }
// 実際: { naem: string }（タイポ）

const data = JSON.parse('{"naem":"Alice"}') as { name: string };
console.log(data.name.toUpperCase());
// 実行時エラー: Cannot read property 'toUpperCase' of undefined
```

---

## 5. 解決策: バリデーションする

外部から来た**`unknown` を、検証を通して内部の型に変換する**。

### 自前の型ガード

```typescript
type User = { name: string; age: number };

function isUser(v: unknown): v is User {
  return (
    typeof v === "object" &&
    v !== null &&
    "name" in v && typeof (v as any).name === "string" &&
    "age" in v && typeof (v as any).age === "number"
  );
}

const data: unknown = JSON.parse(input);
if (isUser(data)) {
  data.name; // ✅
} else {
  throw new Error("invalid user");
}
```

→ 動くが、**フィールドが増えるとメンテが破綻**。手書きはミスりやすい。

### Zod（推奨）

```typescript
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

type User = z.infer<typeof UserSchema>;

const data: unknown = JSON.parse(input);
const user = UserSchema.parse(data); // 検証して型確定
user.name; // ✅
```

→ **スキーマと型が一元管理**。手書きより遥かに安全。詳しくは [[02-バリデーションと型の同期]]。

---

## 6. 「Postel の法則」の罠

「**送信は厳密に、受信は寛容に**」という古くからの設計原則ですが、現代の安全性志向では**寛容すぎる受信が脆弱性のもと**。

```typescript
// ❌ 寛容すぎ
function handle(data: any) {
  if (data.user) { ... }
}
```

→ 不正なデータを通してしまう。

### 現代版: 「**寛容に受け取り、厳密に検証**」

- `unknown` で受ける（型を仮定しない）
- バリデータで検証
- 通ったものだけを内部型として扱う

```typescript
function handle(data: unknown) {
  const result = UserSchema.safeParse(data);
  if (!result.success) {
    return logAndIgnore(result.error);
  }
  return processUser(result.data);
}
```

---

## 7. シリアライズの非対称性

JSON 化で**消える**もの:

- `undefined`
- 関数
- `Symbol`
- `Date` → 文字列に変換
- `BigInt` → エラー（`JSON.stringify` で例外）

### Date の罠

```typescript
const obj = { d: new Date() };
const json = JSON.stringify(obj);
// '{"d":"2026-04-26T..."}'

const parsed = JSON.parse(json);
parsed.d; // string (Date ではない！)
parsed.d.getTime(); // ❌ string にメソッドなし
```

→ `Date` フィールドを持つ型を JSON 化すると**復元時に文字列**になる。

#### 対策

**(a) `reviver` を使う**

```typescript
const parsed = JSON.parse(json, (key, value) => {
  if (key === "d" && typeof value === "string") return new Date(value);
  return value;
});
```

**(b) Zod で変換する**

```typescript
const Schema = z.object({
  d: z.string().transform(s => new Date(s)),
});
```

→ **API境界で `string ⇄ Date` を変換**するのが定石。

### BigInt

```typescript
JSON.stringify({ x: 10n }); // ❌ TypeError
```

→ 文字列に変換してからシリアライズ:

```typescript
JSON.stringify({ x: String(10n) });
```

---

## 8. JSON 型を表現する型

TS には JSON 互換型を表す**標準型はない**が、以下のように定義できる:

```typescript
type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };
```

→ 「**JSONとして取りうる任意の値**」を表す。`unknown` より少し具体的だが、実用上は `unknown` で受けて Zod で検証する方が一般的。

---

## 9. LocalStorage / Cookie の値

LocalStorage は**全部 string**。型情報なし。

```typescript
const raw = localStorage.getItem("user"); // string | null
if (raw === null) return;

const data: unknown = JSON.parse(raw);
const user = UserSchema.parse(data);
```

→ 「`localStorage` から取ったら必ず検証」。型を仮定しない。

### ヘルパ化

```typescript
import { z } from "zod";

function loadFromStorage<T>(key: string, schema: z.Schema<T>): T | null {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  try {
    return schema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

const user = loadFromStorage("user", UserSchema);
```

---

## 10. 環境変数の取り扱い

`process.env` も外部入力:

```typescript
const port = process.env.PORT; // string | undefined
const portNum = parseInt(port!); // ❌ undefined の可能性
```

→ Zod で検証:

```typescript
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.string().transform(s => parseInt(s, 10)).pipe(z.number().positive()),
  DATABASE_URL: z.string().url(),
});

const env = EnvSchema.parse(process.env);
env.PORT; // number
```

→ **起動時に1回検証**して型安全な `env` オブジェクトを作る。

---

## 11. 設定ファイルの取り扱い

`config.json` のような設定ファイルも外部入力:

```typescript
import config from "./config.json";

// config: any（JSON import の型は any）
config.api.url; // 通るが、変更で壊れる
```

→ Zod で検証:

```typescript
import rawConfig from "./config.json";
import { ConfigSchema } from "./schema";

const config = ConfigSchema.parse(rawConfig);
```

---

## 12. WebSocket / イベント

```typescript
ws.on("message", (raw: string) => {
  const data: unknown = JSON.parse(raw);
  const message = MessageSchema.parse(data);
  handleMessage(message);
});
```

→ 受信メッセージは**毎回検証**。ネットワーク経由のデータは何が来るか分からない。

---

## 13. ベストプラクティス

### (1) **`JSON.parse` を直接使わない**

```typescript
// 自前ヘルパ経由に統一
import { safeParse } from "@/utils/json";
```

### (2) **境界で必ず検証**

外部データは「**受け取った瞬間に検証して内部型に変換**」。

### (3) **Zod または同等のライブラリを使う**

手書き型ガードはミスのもと。

### (4) **入力境界を明確に**

```
外部データ → [境界: バリデータ] → 内部型 → 内部ロジック
```

「**境界を超えるまでは型がない**」と意識する。

### (5) **エラー時の挙動を決める**

検証失敗時:

- ログを残して中断
- ユーザにエラー表示
- リトライ
- フォールバック

統一的なエラーハンドリングを設計。

### (6) **`Date` / `BigInt` の変換を境界で**

シリアライズ・デシリアライズを境界で行う。

---

## 14. アンチパターン

### (1) `JSON.parse` の戻り値を直接使う

```typescript
const data = JSON.parse(s);
data.name; // ❌
```

### (2) `as` で型を強制

```typescript
const user = JSON.parse(s) as User; // ❌
```

### (3) フォームから来た値を `as number`

```typescript
const age = e.target.value as unknown as number; // ❌
```

→ `Number(e.target.value)` で変換 + Zod で検証。

### (4) APIレスポンスを「型定義通り」と信じる

```typescript
// バックエンドが変わるとクライアントが壊れる
const user: User = await fetch(...).then(r => r.json());
```

→ 自分のクライアントで毎回検証する。

### (5) ライブラリの戻り値を信用しすぎ

```typescript
// 古いライブラリの戻り値が any
const data = oldLib.fetch();
```

→ 自分の境界で `unknown` 化して検証。

---

## 15. まとめ

- **外部データ**（JSON、API、LocalStorage、env）は**型がない**
- `JSON.parse` の戻り値は `any` ── **`unknown` で受け直す**
- **`as` で型強制は禁忌**（嘘を埋め込むだけ）
- **Zod等のバリデータで検証**してから内部型に変換
- **境界で `unknown` → 内部型** の流れを徹底
- `Date` / `BigInt` は**境界で変換**
- 環境変数・設定ファイルも同様

> 「**型は内部の世界の言語**、外の世界には型がない」── この境界感覚を持つだけで、実行時クラッシュは劇的に減ります。バリデーションは「**面倒だがやる価値がある**」コードの代表。

---

## 関連
- [[02-バリデーションと型の同期]]
- [[03-エラー設計]]
- [[04-fetchとresponseの型付け]]
- [[03-unknownと安全な取り扱い]]
- [[02-anyを避ける理由と最小限の逃げ道]]
