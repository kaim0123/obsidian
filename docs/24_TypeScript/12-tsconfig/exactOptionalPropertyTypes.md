# exactOptionalPropertyTypes

`tsconfig.json` の **厳格化オプション**のひとつ。
「**オプショナルプロパティ `?` と `| undefined` を区別する**」という、地味だが重要なフラグです。

## 何が起きる？

通常の TypeScript では、次の 2 つは ほぼ同じ扱い です。

```typescript
type A = { name?: string };          // name は省略 OK
type B = { name: string | undefined }; // name は必須だが undefined OK
```

`exactOptionalPropertyTypes: true` をセットすると、両者を **明確に区別** するようになります。

```typescript
type User = { name?: string };

const a: User = { name: "Alice" };      // OK
const b: User = {};                       // OK（省略）
const c: User = { name: undefined };     // ❌ エラー！
```

オプショナルなのは「**プロパティを省略してよい**」という意味であって、「`undefined` を **代入してよい**」とは違うのだ、という考え方です。

## 何のためにあるの？

「`undefined` がプロパティに **明示的に代入** されているか、**そもそも無い** か」を区別したいケースがあるからです。

```typescript
type Patch = { name?: string };

function update(p: Patch) {
  if ("name" in p) {
    // 明示的に name が指定されている
    // → これを使って更新したい
  }
  // p.name が undefined でも、明示か省略かでロジックが分岐できる
}
```

`exactOptionalPropertyTypes` を使うと、`{ name: undefined }` を渡すコードはコンパイルで弾かれ、**意図せぬ undefined 代入** を防げます。

## 影響を受けやすいパターン

### 1. 「未指定なら省略してね」を強制したい場面

```typescript
type Settings = { theme?: "light" | "dark" };

const s: Settings = { theme: undefined }; // エラー
```

`undefined` を渡したいなら、明示的に許可します。

```typescript
type Settings = { theme?: "light" | "dark" | undefined };
```

### 2. 部分更新オブジェクトに使うとき

```typescript
type Patch<T> = { [K in keyof T]?: T[K] };

const p: Patch<User> = { name: undefined }; // エラー
```

`undefined` を「**値をリセットする**」意味で使いたいことがあるので、要注意。
意図的にやるなら、型側で許可する必要があります。

### 3. オブジェクトのスプレッド

```typescript
const base = { name: "Alice" };
const patch: { name?: string } = {};
const merged = { ...base, ...patch }; // OK
```

スプレッドはプロパティを上書きしないので問題ありません。

## 使うべきか？

- **ライブラリや厳格な API 設計**では有用：意図しない `undefined` を弾ける
- **既存コードへの導入**は影響範囲が広い：型エラーが大量に出るかも
- **ESLint やバリデータと併用**して、効果を最大化するのがおすすめ

## 一緒に考えたいオプション

|オプション|目的|
|---|---|
|`strict`|諸々の strict 系オプションを一括有効化|
|`noUncheckedIndexedAccess`|配列・辞書アクセスに `undefined` 可能性を付与|
|`exactOptionalPropertyTypes`|`?` と `\| undefined` を区別|

→ 詳細は `strict系オプション.md` を参照。

## まとめ

- `exactOptionalPropertyTypes` は「**省略**」と「**`undefined` 代入**」を区別するフラグ
- 意図しない `undefined` を防げる代わりに、既存コードに影響大
- 必要なら型側で `| undefined` を明示的に追加
- 厳格な型運用を目指すチームには検討する価値あり
