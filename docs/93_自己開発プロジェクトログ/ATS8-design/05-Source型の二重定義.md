# 05. Source 型の二重定義

## design.md の指摘（✅ 対応済み）

> **`Source` 型が二重定義されている**
>
> - 正の型は `features/shared/types.ts` の `Source`（DB / `source_settings`）のみ。
> - `constants/sources.ts` は `FallbackSourceEntry` + `SOURCES` 定数（フォールバック専用）。
> - 解決ロジックは `features/shared/sources.ts` に集約。

---

## 基礎知識：型（Type）と定数（Constant）の違い

### 型（TypeScript）

**データの形** を定義します。コンパイル時にチェックされ、実行時には消えます。

```typescript
type Source = {
  id: string
  name: string
  displayOrder: number
  isActive: boolean
}
```

### 定数

**実行時に使う固定データ** です。

```typescript
const SOURCES = [
  { id: 'web', name: 'Webサイト', displayOrder: 1 },
  { id: 'referral', name: '紹介', displayOrder: 2 },
]
```

---

## 何が間違っていたか

### 問題：「反響元（Source）」が2か所で別々に定義されていた

| 場所 | 内容 |
|------|------|
| `features/shared/types.ts`（または各所） | DB テーブル `source_settings` 用の `Source` 型 |
| `constants/sources.ts` | 別の `Source` 型 + ハードコードされた `SOURCES` 配列 |

**同じ名前 `Source` なのに、フィールドが微妙に違う** ことがあり、TypeScript 上は別物として扱われます。

### なぜ二重定義が起きやすいか

1. **最初は定数だけで十分だった** — DB 化前は `SOURCES` 配列だけで反響元を管理
2. **後から DB 化した** — `source_settings` テーブルが追加されたが、古い定数を削除し忘れた
3. **型もコピーした** — 定数ファイルに独自の型を定義してしまった

### 実害

- 画面 A は DB の `Source`、画面 B は定数の `Source` を使う → **表示が食い違う**
- 新しい反響元を DB に追加しても、定数側に無いと **一部画面で名前が解決できない**
- 「どちらが正（source of truth）？」がコードを読む人に分からない

---

## どう修正すべきか

### 1. 型の「正」を1か所に決める

```
正（source of truth）: features/shared/types.ts の Source
                       ↑ DB テーブル source_settings と一致
```

### 2. 定数ファイルは「フォールバック専用」に役割を限定

```typescript
// constants/sources.ts
/** DB 未投入・移行前データ参照用のフォールバックのみ */
export type FallbackSourceEntry = {
  id: string
  name: string
  displayOrder: number
}

export const SOURCES: FallbackSourceEntry[] = [ ... ]
```

**`Source` という名前は使わない** — 定数用であることが型名から分かるようにする。

### 3. 解決ロジックを1か所に集約

```typescript
// features/shared/sources.ts

/** DB 優先。settings が空のときのみ定数 SOURCES を使う */
export function resolveEffectiveSources(dbSources: Source[]): Source[] {
  return dbSources.length > 0 ? dbSources : fallbackSourcesAsSource()
}

/** 表示用の反響元名 */
export function getSourceDisplayName(sourceId, dbSources): string {
  // DB マップ優先 → なければ定数で解決
}
```

**「DB と定数、どちらを使うか」の判断を各画面に書かない。**

### 4. ファイル先頭に方針コメントを書く

将来の自分や他の開発者のために:

```typescript
/**
 * 反響元の正（source of truth）は DB の source_settings テーブル。
 * このファイルの SOURCES はフォールバック専用。
 */
```

---

## データの優先順位（修正後）

```
1. DB（source_settings）     ← 常に最優先
2. constants/SOURCES 定数    ← DB が空のときだけ
3. sourceId をそのまま表示   ← どちらにも無いとき
```

---

## まとめ

| 間違い | 修正 |
|--------|------|
| 同じ概念の型が2定義 | `shared/types.ts` に1つだけ |
| 定数と DB の優先順位が不明 | `resolveEffectiveSources` で集約 |
| 各画面が独自に名前解決 | `getSourceDisplayName` を共通利用 |

**学び**: 「正（source of truth）」を **1つ** 決め、それ以外は **フォールバック** と明示する。型の名前被りはバグの温床です。
