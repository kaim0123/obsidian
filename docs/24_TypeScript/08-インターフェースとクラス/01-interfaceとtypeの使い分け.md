# `interface` と `type` の使い分け

> 「`interface` と `type`、どっちを使えばいい？」 ── TypeScriptで最もよく聞かれる質問の1つです。**機能はほぼ重なる**ので、宗教論争になりがち。実務的には**「迷ったら `type`、クラスのcontract時だけ `interface`」**がシンプルなルールです。本ファイルではその根拠を整理します。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 次: [[02-implementsとアクセス修飾子]]

---

## 1. 機能の重なりと差分（早見表）

| 機能 | `type` | `interface` |
|---|---|---|
| オブジェクト型を表現 | ✅ | ✅ |
| プロパティ・メソッド | ✅ | ✅ |
| ジェネリクス | ✅ | ✅ |
| `extends`（拡張） | ❌ (代わりに `&`) | ✅ |
| `implements` で実装可 | ✅ | ✅ |
| **ユニオン型** | ✅ | ❌ |
| **交差型** | ✅ | ❌（`extends` で類似） |
| **条件型** | ✅ | ❌ |
| **Mapped Type** | ✅ | ❌ |
| **テンプレートリテラル型** | ✅ | ❌ |
| **`typeof` から作る** | ✅ | ❌ |
| **declaration merging（同名再定義）** | ❌ | ✅ |
| クラスの contract | △（可だが慣例的に `interface`） | ✅ |

→ **`type` の方が圧倒的に表現力が高い**。`interface` は「**宣言マージ**」と「**クラスの contract**」のときだけ強み。

---

## 2. 共通点: オブジェクト型の表現

両方とも、ふつうのオブジェクト型を書くなら**機能的に同じ**です。

```typescript
// type
type User = {
  id: string;
  name: string;
  greet(): void;
};

// interface
interface User {
  id: string;
  name: string;
  greet(): void;
}
```

これらは**実質的に同じ**として扱えます。代入・実装・拡張すべて互換。

---

## 3. `type` だけにできること

### (1) ユニオン型・交差型

```typescript
type Status = "loading" | "success" | "error";
type Mixed = User & Admin;
```

`interface` では書けません。

### (2) プリミティブ・タプルの型エイリアス

```typescript
type ID = string;
type Coord = [number, number];
type Direction = "up" | "down" | "left" | "right";
```

### (3) Mapped Type / 条件型 / テンプレートリテラル型

```typescript
type Partial<T> = { [K in keyof T]?: T[K] };           // Mapped
type IsString<T> = T extends string ? true : false;     // 条件型
type Greeting = `Hello, ${string}`;                      // テンプレート
```

→ 高度な型変換は **`type` でしか書けない**。

### (4) `typeof` から型を導出

```typescript
const config = { mode: "dev", port: 3000 } as const;
type Config = typeof config;
```

→ 値から型を作るパターンは `type` 専用。

---

## 4. `interface` だけにできること

### (1) Declaration Merging（宣言マージ）

同名で複数回 `interface` を書くと、**自動でマージ**される。

```typescript
interface User {
  id: string;
}

interface User {
  name: string;
}

// 結果: User は { id: string; name: string }
```

`type` だと「重複定義エラー」になります。

#### 実用例: ライブラリの型拡張

```typescript
// Express の Request にカスタムフィールドを追加
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
```

→ ライブラリの型を**外側から拡張**するときに使う（module augmentation）。

### (2) `extends` で読みやすい継承

```typescript
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}
```

`type` で同じことをするなら:

```typescript
type Animal = { name: string };
type Dog = Animal & { breed: string };
```

機能は同じ。

---

## 5. パフォーマンス: 大規模では `interface` が速い

TypeScript コンパイラは、**`interface` の方が `type` より型解決を効率化しやすい**設計になっています。

- `interface` は同一性で比較される（参照同一性に近い）
- `type` は構造的に展開される

### 実務での影響

- 小〜中規模では**ほぼ差がない**
- 大規模 React アプリ・複雑な型ライブラリでは、`interface` の方がエディタ補完・型チェックが速いことがある
- **超巨大プロジェクト（VSCode、Microsoft内部など）では `interface` 推奨**

ふつうのアプリでは気にしなくてOK。

---

## 6. エラーメッセージの読みやすさ

`interface` は名前が保たれやすく、エラーメッセージが読みやすいことがある:

```typescript
// type
type User = { id: string; name: string };
// エラー: Type '...' is not assignable to type '{ id: string; name: string; }'

// interface
interface User { id: string; name: string; }
// エラー: Type '...' is not assignable to type 'User'
```

→ ユーザ視点では `interface` の方が読みやすい場面がある。ただし TS のバージョン進化で差は縮まっています。

---

## 7. クラスの contract: `implements` で使う

クラスが「何ができるか」を表す契約には、慣習的に `interface` を使う。

```typescript
interface Logger {
  log(message: string): void;
  error(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) { console.log(message); }
  error(message: string) { console.error(message); }
}
```

`type` でも書けますが、**OOP的な意図**（インターフェースの実装）を伝えるなら `interface` が伝統的に好まれる。

詳しくは [[02-implementsとアクセス修飾子]] へ。

---

## 8. 実務的なルール（迷わないために）

### **基本: 迷ったら `type`**

理由:

- 表現力が広い（ユニオン・条件型・Mapped 等が使える）
- 一貫性が保たれる（後から「やっぱりユニオンに」と変えやすい）
- 「これはオブジェクトだから interface」のような場合分けが要らない

### **例外: `interface` を使う場面**

1. **クラスの contract**（`implements` ターゲット）
2. **ライブラリの型拡張**（declaration merging が必要）
3. **既存コードベースが `interface` で統一されている**
4. **非常に大規模で、コンパイル速度が問題**

### チームで決める

どちらを基本にするかは**チームで統一**することが最重要。混在は避ける。

---

## 9. ESLintでの統一

`@typescript-eslint/consistent-type-definitions` ルールで強制できます:

```json
{
  "rules": {
    "@typescript-eslint/consistent-type-definitions": ["error", "type"]
    // または "interface"
  }
}
```

新規プロジェクトでは設定しておくと統一が保たれる。

---

## 10. 具体例で比較

### 例1: シンプルなプロパティ型

```typescript
// type（推奨）
type User = {
  id: string;
  name: string;
  email: string;
};

// interface
interface User {
  id: string;
  name: string;
  email: string;
}
```

→ 機能差なし。チーム規約で。

### 例2: ユニオン型を含む

```typescript
// ✅ type
type Status = "idle" | "loading" | "success" | "error";

// ❌ interface（書けない）
interface Status { ... } // ユニオン不可
```

→ `type` 一択。

### 例3: クラスの contract

```typescript
// 慣習的に interface
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
}

class UserRepo implements Repository<User> {
  async findById(id: string) { ... }
  async save(user: User) { ... }
}
```

→ `interface` 推奨（DI/contractの意図が伝わる）。

### 例4: ライブラリの型拡張

```typescript
// ✅ interface（マージできる）
declare module "express" {
  interface Request {
    user?: User;
  }
}

// ❌ type（マージ不可）
declare module "express" {
  type Request = ...;
}
```

→ `interface` 一択。

### 例5: ジェネリクス

```typescript
// 両方OK
type Container<T> = { value: T };
interface Container<T> { value: T; }
```

→ どちらでも。

### 例6: 複雑な型変換

```typescript
// ✅ type
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// ❌ interface（Mapped Type 不可）
```

→ `type` 一択。

---

## 11. 「どちらでも」のときの判断軸

両方で書けるとき、以下を考える:

- [ ] **チーム規約**は？ → 規約に従う
- [ ] 周囲のコードはどっち？ → 揃える
- [ ] **後から拡張**したい？ → `interface`（`extends` で柔軟）
- [ ] **ユニオン化** する可能性は？ → `type`
- [ ] **クラスで実装**される？ → `interface`
- [ ] **ライブラリ型を拡張**？ → `interface`

---

## 12. よくある誤解

### 誤解1: 「`interface` の方が"OOPらしい"から正しい」

→ TypeScriptはOOPを強制しない。**ユニオン・関数型・data-only の設計**が現代の主流。

### 誤解2: 「`type` は遅い」

→ 規模次第。**普通のアプリでは差を感じない**。

### 誤解3: 「`interface` は変更できない」

→ declaration merging で**むしろ後から追加できる**。これが利点でもあり欠点でもある。

### 誤解4: 「両方使い分けないとダメ」

→ 1つに統一する方が読みやすい。例外（`interface` が必要な場面）だけ使い分け。

---

## 13. まとめ

- 機能は**ほぼ重なる**が、`type` の方が**表現力が広い**
- `interface` だけの強み: **declaration merging** / **クラスの contract**（慣習）
- **基本ルール: 迷ったら `type`**
- **`interface` を使う場面**: クラス契約 / ライブラリ型拡張 / 大規模パフォーマンス
- **ESLint** で統一を強制できる
- **チームで統一**するのが最重要

> 「どちらが正しいか」より「**どちらでも一貫していること**」が大事。新規プロジェクトなら `type` 中心、既存コードなら周囲に合わせる ── これだけで論争に巻き込まれずに済みます。

---

## 関連
- [[02-implementsとアクセス修飾子]]
- [[03-readonlyとgetter_setter]]
- [[03-型エイリアスと設計指針]]
