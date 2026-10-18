# strict 系オプション

`tsconfig.json` の **strict 系オプション**は、TypeScript の安全性を大きく左右します。
**新規プロジェクトでは原則すべて有効** にし、既存プロジェクトでは段階的に導入するのがおすすめです。

## まず有効にすべき：`strict: true`

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

このフラグを 1 つ立てると、以下のオプションが **まとめて有効** になります。

|オプション|意味|
|---|---|
|`noImplicitAny`|暗黙の `any` を禁止|
|`strictNullChecks`|`null`/`undefined` を別の型として扱う|
|`strictFunctionTypes`|関数引数の互換性を厳しくする|
|`strictBindCallApply`|`bind/call/apply` の型を厳密に|
|`strictPropertyInitialization`|クラスプロパティの初期化を強制|
|`alwaysStrict`|`"use strict"` を自動付与 + 解析|
|`noImplicitThis`|`this` の暗黙 `any` を禁止|
|`useUnknownInCatchVariables`|`catch (e)` の `e` を `unknown` に|

## 各オプションの威力

### noImplicitAny

```typescript
function add(a, b) {     // a, b の型が暗黙 any → エラー
  return a + b;
}
```

「型を書き忘れた箇所」を確実に検出できます。

### strictNullChecks

```typescript
const name: string = null; // エラー（null は string ではない）
```

`null` / `undefined` を独立した型として扱うため、**意図しない null 参照** をコンパイル時に防げます。

### strictPropertyInitialization

```typescript
class User {
  name: string; // エラー：初期化されていない
}
```

クラスのプロパティに **初期値か constructor で代入** を強制します。

### useUnknownInCatchVariables

```typescript
try {
  // ...
} catch (e) {
  // e は unknown（以前は any）
  if (e instanceof Error) console.error(e.message);
}
```

エラー処理が安全になります。

## strict だけでは足りないオプション

`strict: true` には含まれませんが、強くおすすめのオプションがあります。

### noUncheckedIndexedAccess

```typescript
const arr: number[] = [1, 2, 3];
const x = arr[10]; // 型は number | undefined（true のとき）
```

配列・辞書のインデックスアクセスに `undefined` の可能性が含まれるようになります。
**「あるはず」を疑う安全策**として非常に有効。

### exactOptionalPropertyTypes

`?` と `| undefined` を区別します（→ `exactOptionalPropertyTypes.md`）。

### noImplicitOverride

```typescript
class Base {
  greet() {}
}
class Sub extends Base {
  greet() {} // エラー：override キーワードがない
}
```

クラス継承で `override` を強制し、メソッド名のタイポを防ぎます。

### noFallthroughCasesInSwitch

```typescript
switch (x) {
  case 1:
    doA();
  case 2: // エラー：break 忘れ
    doB();
}
```

`switch` の **break 忘れ**を警告。地味に重要。

### noUnusedLocals / noUnusedParameters

未使用の変数や引数を警告します。**死にコード防止**に。

## 段階的導入のコツ

すでに大規模なコードベースで `strict` を有効にすると、**何百ものエラー** が一気に出ることがあります。

1. まず `noImplicitAny` だけ有効にして、明示的な型を書く
2. 次に `strictNullChecks` を有効化（影響大）
3. 残りの strict オプションを順次オン
4. 最後に `noUncheckedIndexedAccess` などの追加オプション

CI で **新規ファイルのみ strict** にするツール（`tsc --strict path/to/new.ts`）も活用できます。

## まとめ

- 新規プロジェクトでは **`strict: true` をまず有効化**
- 強くおすすめの追加：`noUncheckedIndexedAccess` / `noImplicitOverride` / `noFallthroughCasesInSwitch`
- 既存プロジェクトでは **段階的に** オンにする
- strict 系を有効化することで、ランタイムエラーの多くがコンパイル時に発見できる
- 詳しい推奨設定は `06-ベストプラクティス/tsconfig推奨設定.md` を参照
