# 11-ユーティリティ型

---

## この章で学ぶこと
- 主要なユーティリティ型の使い方
- 応用例
- 練習問題

---

## 主なユーティリティ型

### Partial<T>
- すべてのプロパティをオプショナルに
```ts
type User = { name: string; age: number };
type PartialUser = Partial<User>; // { name?: string; age?: number }
```

### Required<T>
- すべてのプロパティを必須に
```ts
type User = { name?: string; age?: number };
type RequiredUser = Required<User>; // { name: string; age: number }
```

### Readonly<T>
- すべてのプロパティをreadonlyに
```ts
type User = { name: string };
type ReadonlyUser = Readonly<User>; // { readonly name: string }
```

### Record<K, T>
- 指定したキーと型でオブジェクト型を生成
```ts
type UserMap = Record<string, number>; // { [key: string]: number }
```

### Pick<T, K>
- 指定したプロパティのみ抽出
```ts
type User = { name: string; age: number; email: string };
type UserName = Pick<User, 'name'>; // { name: string }
```

### Omit<T, K>
- 指定したプロパティを除外
```ts
type User = { name: string; age: number; email: string };
type UserWithoutEmail = Omit<User, 'email'>; // { name: string; age: number }
```

### Exclude<T, U>
- TからUを除外
```ts
type T = Exclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'
```

### Extract<T, U>
- TとUの共通部分のみ抽出
```ts
type T = Extract<'a' | 'b' | 'c', 'a' | 'c'>; // 'a' | 'c'
```

### NonNullable<T>
- nullとundefinedを除外
```ts
type T = NonNullable<string | null | undefined>; // string
```

### ReturnType<T>
- 関数の戻り値型を取得
```ts
function fn(): number { return 1; }
type T = ReturnType<typeof fn>; // number
```

### Parameters<T>
- 関数の引数型をタプルで取得
```ts
function fn(a: string, b: number): void {}
type T = Parameters<typeof fn>; // [string, number]
```

---

## 応用例
- 複数のユーティリティ型を組み合わせて型変換

---

## 練習問題
1. User型からemailだけを除外した型を作成してください。
2. 関数の引数型・戻り値型をユーティリティ型で取得してください。

---

## 参考・関連ページ
- [[TypeScript/typescript-functions|TypeScript組み込み関数一覧]]
- [[10-decorators|デコレーター]] 