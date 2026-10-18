# `fetch` / `response.json()` の型付け（外部レスポンスを判別可能ユニオンで表現する）

> `fetch` の戻り値はTypeScriptの中でも**最も型が崩れる**箇所の1つ。`response.json()` は `Promise<any>` を返すため、油断すると型システムが完全に死にます。本ファイルでは「**HTTPレスポンスを判別可能ユニオンで表現する**」現代的なパターンを整理します。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[03-エラー設計]]

---

## 1. `fetch` のシグネチャと罠

```typescript
fetch(input: RequestInfo, init?: RequestInit): Promise<Response>
```

戻り値は `Promise<Response>`。`Response` 自体は型が付いていますが…

```typescript
const res = await fetch("/api/user");
res.ok;          // boolean
res.status;      // number
res.headers;     // Headers
res.json();      // Promise<any>  ← これが問題
res.text();      // Promise<string>
```

→ `res.json()` の戻り値が **`Promise<any>`**。受け取った瞬間に**型が崩壊**する。

---

## 2. `any` の伝染を防ぐ

```typescript
const res = await fetch("/api/user");
const data = await res.json(); // any
data.evil.boom();              // 通る → 実行時エラー
```

→ **`unknown` で受け直す**:

```typescript
const data: unknown = await res.json();
data.name; // ❌ unknown
```

これで型システムが復活する。

### ヘルパ関数化

```typescript
async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // any → 戻り値型の unknown に絞られる
}
```

`fetchJson` を使えば、戻り値は常に `unknown` で、**検証必須**になる。

---

## 3. ステータスコードを忘れない

`fetch` は **HTTP エラー（4xx, 5xx）でも throw しない**:

```typescript
const res = await fetch("/api/user");
// 404 でも例外にならない！
const data = await res.json(); // 404のレスポンスボディを読んでしまう
```

→ **必ず `res.ok` か `res.status` をチェック**:

```typescript
if (!res.ok) {
  throw new Error(`HTTP ${res.status}`);
}
```

axios と違い、fetch は**HTTPエラーが透過**する仕様。これが一番ハマる。

---

## 4. レスポンスを「判別可能ユニオン」で表現

成功・失敗・空など、**ステータスごとに違う型**を表現したい場合、判別可能ユニオンが最適:

```typescript
type ApiResponse<T> =
  | { status: "success"; data: T }
  | { status: "not_found" }
  | { status: "unauthorized" }
  | { status: "error"; message: string };

async function loadUser(id: string): Promise<ApiResponse<User>> {
  const res = await fetch(`/api/users/${id}`);
  if (res.status === 404) return { status: "not_found" };
  if (res.status === 401) return { status: "unauthorized" };
  if (!res.ok) return { status: "error", message: `HTTP ${res.status}` };
  const data: unknown = await res.json();
  return { status: "success", data: UserSchema.parse(data) };
}
```

### 利用側

```typescript
const r = await loadUser("u1");
switch (r.status) {
  case "success":      return show(r.data);
  case "not_found":    return showNotFound();
  case "unauthorized": return redirectLogin();
  case "error":        return showError(r.message);
}
```

→ **ステータスごとに必要なフィールドが型で保証**される。詳しくは [[02-判別可能ユニオン]]。

---

## 5. Result型版

判別ユニオンの代わりに Result 型でも:

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

type LoadError = "not_found" | "unauthorized" | "network" | "validation";

async function loadUser(id: string): Promise<Result<User, LoadError>> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (res.status === 404) return { ok: false, error: "not_found" };
    if (res.status === 401) return { ok: false, error: "unauthorized" };
    if (!res.ok) return { ok: false, error: "network" };
    const data: unknown = await res.json();
    const parsed = UserSchema.safeParse(data);
    if (!parsed.success) return { ok: false, error: "validation" };
    return { ok: true, value: parsed.data };
  } catch {
    return { ok: false, error: "network" };
  }
}
```

→ どちらでも同じ発想。**プロジェクトで統一**するのが大事。詳しくは [[02-結果型Result_Either]]。

---

## 6. Zod を使った検証付き fetch

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  return UserSchema.parse(data);
}

type User = z.infer<typeof UserSchema>;
```

→ **`fetch → unknown → Schema.parse → User`** が定石フロー。

---

## 7. ジェネリックな fetchJson ヘルパ

スキーマを引数として受け取る汎用ヘルパ:

```typescript
import { z } from "zod";

async function fetchJson<T>(
  url: string,
  schema: z.Schema<T>,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const data: unknown = await res.json();
  return schema.parse(data);
}

const user = await fetchJson("/api/user", UserSchema);
const users = await fetchJson("/api/users", z.array(UserSchema));
```

→ **型と検証が1か所**に集約された呼び出し。

---

## 8. POST / PUT / DELETE でのパターン

```typescript
async function createUser(input: CreateUserInput): Promise<User> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  return UserSchema.parse(data);
}
```

入力側（`input`）も型がある:

```typescript
type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
```

→ **入力スキーマと出力スキーマを両方定義**するのが堅実。

---

## 9. AbortController でキャンセル可能に

```typescript
const controller = new AbortController();

async function loadUser(id: string, signal?: AbortSignal): Promise<User> {
  const res = await fetch(`/api/users/${id}`, { signal });
  // ...
}

// キャンセル
controller.abort();
```

`fetch` は `AbortError` を投げるので、catch で処理:

```typescript
try {
  await loadUser("1", controller.signal);
} catch (e) {
  if (e instanceof DOMException && e.name === "AbortError") {
    // キャンセル
  } else {
    throw e;
  }
}
```

---

## 10. タイムアウトの実装

`fetch` 自体にタイムアウトはないので、`AbortController` で実装:

```typescript
async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
```

**Node 18+ / 最近のブラウザ**では `AbortSignal.timeout(ms)` も使える:

```typescript
const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
```

---

## 11. リトライパターン

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i < retries - 1) await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

const user = await withRetry(() => fetchUser("u1"));
```

---

## 12. APIクライアントクラス

複数のエンドポイントをまとめる:

```typescript
class ApiClient {
  constructor(private readonly baseUrl: string) {}

  private async fetchJson<T>(
    path: string,
    schema: z.Schema<T>,
    init?: RequestInit
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return schema.parse(await res.json());
  }

  getUser(id: string) {
    return this.fetchJson(`/users/${id}`, UserSchema);
  }

  createUser(input: CreateUserInput) {
    return this.fetchJson("/users", UserSchema, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  }
}

const api = new ApiClient("https://api.example.com");
const user = await api.getUser("u1");
```

---

## 13. ライブラリで楽をする

### `axios`

`fetch` の改良版的存在:

```typescript
import axios from "axios";

const res = await axios.get<User>("/api/user");
res.data; // User （ただし any のまま、型は注釈に過ぎない）
```

→ `axios` の型注釈は**バリデーションしない**。Zod等を別途使うべき。HTTPエラーで自動 throw する点が `fetch` との違い。

### `ky`

`fetch` ベースの軽量ラッパー:

```typescript
import ky from "ky";

const user = await ky.get("/api/user").json<User>();
```

### `ofetch` / `wretch`

似たような fetch ラッパー。

### tRPC

サーバとクライアントで型を**共有**するフレームワーク:

```typescript
const user = await trpc.user.byId.query("u1"); // 型自動同期
```

→ 「同じTSプロジェクト内でAPIを共有するなら最強」。

### TanStack Query

データ取得とキャッシュ管理:

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["user", id],
  queryFn: () => fetchUser(id),
});
```

→ React/Vue 等で**状態管理含めた取得**に。

### OpenAPI / GraphQL からの型生成

`openapi-typescript` `graphql-codegen` などで**バックエンドのスキーマから型を自動生成**。

---

## 14. アンチパターン

### (1) `res.json()` の戻り値を直接使う

```typescript
const data = await res.json();
data.name.toUpperCase(); // any
```

→ `unknown` で受ける + 検証。

### (2) `as` で型を強制

```typescript
const user = await res.json() as User;
```

→ Zod等で検証。

### (3) `res.ok` をチェックしない

```typescript
const data = await res.json(); // 404でも実行
```

→ 必ず `if (!res.ok) throw ...`。

### (4) 全ステータスを `try/catch` で同じ扱い

```typescript
try { ... } catch (e) {
  showError("error"); // 404 も 500 も同じメッセージ
}
```

→ 判別ユニオン or Result で**ステータスごとに分岐**。

### (5) タイムアウトなし

```typescript
const res = await fetch(...); // 永遠に待つ
```

→ `AbortController` でタイムアウト。

### (6) リクエストボディの型を書かない

```typescript
fetch("/api", { body: JSON.stringify(anything) });
```

→ 入力スキーマを定義。

---

## 15. ベストプラクティス

### (1) **境界で `unknown` 化**

`fetch().json()` の `any` を**プロジェクト全体で漏らさない**。

### (2) **必ず Zod 等で検証**

外部レスポンスは信用しない。

### (3) **判別可能ユニオンでステータスを表現**

成功・失敗・特殊ケースを型で分ける。

### (4) **タイムアウト・リトライをデフォルト化**

`fetchWithTimeout`, `withRetry` をユーティリティ化。

### (5) **APIクライアントを集約**

`ApiClient` クラスや `apiClient.user.get()` のような構造で**1か所に集める**。

### (6) **TanStack Queryなどの状態管理ライブラリを活用**

「fetch + キャッシュ + ローディング状態」を毎回手書きしない。

### (7) **OpenAPI から型生成**

バックエンドが OpenAPI を提供しているなら、**型を自動生成**して同期コストを消す。

---

## 16. まとめ

- **`fetch` の `res.json()` は `Promise<any>`** ── 油断すると型崩壊
- **`unknown` で受け、Zod等で検証** が定石
- **`res.ok` をチェック**しないと HTTP エラーが透過する
- **判別可能ユニオン or Result** でステータスごとの応答を表現
- **タイムアウト・リトライ・キャンセル**は AbortController で
- **ジェネリックな `fetchJson<T>` ヘルパ**を1つ用意して全社で使い回す
- ライブラリ: **axios / ky / ofetch / TanStack Query / tRPC / openapi-typescript**

> 「**外部APIは型のない世界からの侵入者**」── `fetch + Zod + 判別ユニオン` の3点セットで、安全な境界を作るのがプロのスタイルです。

---

## 関連
- [[01-JSONの型付け]]
- [[02-バリデーションと型の同期]]
- [[03-エラー設計]]
- [[03-unknownと安全な取り扱い]]
- [[02-判別可能ユニオン]]
- [[02-結果型Result_Either]]
