# 判別可能ユニオン（Discriminated Union）

## 判別可能ユニオンとは？

ユニオン型のメンバーが **共通の「タグ（識別子）プロパティ」** を持つ設計パターンです。
このタグを使うと、TypeScript が自動的に **型を絞り込んで** くれます。

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
  | { kind: "rectangle"; width: number; height: number };
```

`kind` というプロパティが **判別子（discriminant）** です。これが各メンバーで違う **リテラル文字列** になっています。

## 絞り込みの威力

```typescript
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.size ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
}
```

`switch` の中で `shape.kind` をチェックすると、各 `case` の中で **shape の型が絞り込まれます**。
`circle` の中では `radius` にアクセスできて、他のプロパティは見えません。

## なぜこのパターンが嬉しい？

- **タイプセーフ**：存在しないプロパティへのアクセスを防げる
- **網羅性チェック**ができる（never と組み合わせ）
- **拡張に強い**：新ケースを追加すると、未対応の場所でエラーになる

## 網羅性チェック（exhaustiveness）

```typescript
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":    return Math.PI * shape.radius ** 2;
    case "square":    return shape.size ** 2;
    case "rectangle": return shape.width * shape.height;
    default:
      const _exhaustive: never = shape; // 全ケース対応していれば never
      return _exhaustive;
  }
}
```

将来 `Shape` に `triangle` を追加すると、`default` 節で型エラーになります。
**「分岐の追加忘れ」をコンパイル時に検出** できる強力な仕掛けです。

## 判別子の選び方

- **必ず付ける**：すべてのメンバーで同じ名前のプロパティ
- **リテラル型**：`"circle"`, `"square"` のような文字列リテラル
- **直感的な名前**：`kind`, `type`, `tag`, `_tag` などが慣例

```typescript
// よくある形
type Result<T, E> =
  | { ok: true;  value: T }
  | { ok: false; error: E };
```

`ok: true | false` でも判別子になります（ブール値リテラル）。

## API レスポンスでの定石

成功・失敗・読み込み中のような **「画面の状態」** に最適です。

```typescript
type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function render(state: FetchState<User>): string {
  switch (state.status) {
    case "idle":    return "未取得";
    case "loading": return "読み込み中…";
    case "success": return `Hello, ${state.data.name}`;
    case "error":   return `エラー: ${state.error.message}`;
  }
}
```

「ロード中なのに data がある」のような **不整合な状態を型で禁止** できるのが最大のメリットです。

## アンチパターンとの比較

```typescript
// 悪い例：オプショナルだらけ
type FetchState<T> = {
  loading: boolean;
  data?: T;
  error?: Error;
};
```

これだと「`loading` が true なのに `data` もある」のような不正な組み合わせも作れてしまいます。
**判別可能ユニオン** にすれば、不可能な組み合わせを型レベルで弾けます。

## まとめ

- 判別可能ユニオン = **共通タグ + リテラル型** で構成するユニオン
- `switch` で自動的に **型が絞り込まれる**
- `default + never` で **網羅性チェック** が可能に
- 「画面の状態」「処理結果」「ドメインイベント」など **状態管理に最適**
- オプショナル乱用より、判別可能ユニオンを使うほうが安全
