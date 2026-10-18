# 06. snake_case と camelCase の手動マッピング

## design.md の指摘（✅ 対応済み）

> **snake_case ↔ camelCase の手動マッピングが全 Route Handler に散在**
>
> テーブルごとの `toCamel` / `toSnake` マッパを `features/shared/lib/mappers/`（共通）と `features/<domain>/lib/mappers.ts`（ドメイン固有）に集約。

---

## 基礎知識：命名規則の違い

プログラミングの世界では、**単語をつなぐ書き方** に慣習があります。

| 規則 | 例 | よく使う場所 |
|------|-----|-------------|
| **snake_case** | `display_order`, `created_at` | PostgreSQL / Supabase（DB） |
| **camelCase** | `displayOrder`, `createdAt` | JavaScript / TypeScript（アプリ） |

Supabase から取ったデータ:

```json
{ "first_name": "太郎", "created_at": "2025-01-01" }
```

アプリで扱いたい形:

```json
{ "firstName": "太郎", "createdAt": "2025-01-01" }
```

**この変換が必要** です。

---

## 何が間違っていたか

### 問題：各 Route Handler に変換コードがコピペされていた

```typescript
// 以前：candidates/route.ts の中（悪い例）
const candidate = {
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  createdAt: row.created_at,
  // ... 20フィールド手動マッピング
}

// events/route.ts にもほぼ同じパターンが...
// participations/route.ts にも...
```

**26個の API ルート** それぞれに似たような変換が書かれていました。

### なぜ問題か

1. **修正漏れ** — DB にカラム追加 → 26ファイル全部直す？ 1つ忘れるとバグ
2. ** typo** — `first_name` を `firstName` に typo しても、コピペ箇所によって挙動が違う
3. **可読性** — Route Handler の本質（認証 → DB 操作 → レスポンス）が変換コードで埋もれる
4. **テスト不能** — 変換ロジックが API の中に埋まっていると単体テストしにくい

---

## どう修正すべきか

### 1. マッパ関数を専用ファイルに切り出す

```
features/shared/lib/mappers/
├── selection-stage.ts    ← 選考段階
├── stage-history.ts      ← 選考履歴
├── task.ts               ← タスク
├── event.ts              ← イベント
└── source.ts             ← 反響元

features/candidates/lib/mappers.ts   ← 応募者（ドメイン固有）
features/events/lib/mappers.ts       ← イベント参加など
```

### 2. マッパの形（パターン）

```typescript
// features/shared/lib/mappers/selection-stage.ts

/** DB行 → アプリ用オブジェクト */
export function selectionStageToCamel(row: SelectionStageRow) {
  return {
    id: row.id,
    name: row.name,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** アプリ用 → DB insert/update 用 */
export function selectionStageToSnake(data: Partial<SelectionStage>) {
  return {
    name: data.name,
    display_order: data.displayOrder,
    // ...
  }
}
```

### 3. Route Handler はマッパを呼ぶだけ

```typescript
// 修正後（良い例）
import { selectionStageToCamel } from '@/features/shared/lib/mappers/selection-stage'

export async function GET() {
  const { data } = await supabase.from('selection_stages').select('*')
  return NextResponse.json({
    data: data.map(selectionStageToCamel),
  })
}
```

**Handler の仕事**: 認証 → DB → マッパ → JSON 返却。**変換の詳細は知らない。**

### 4. 共有 vs ドメイン固有の切り分け

| 置き場所 | 対象 |
|----------|------|
| `shared/lib/mappers/` | 2つ以上の feature / API で使うテーブル |
| `features/<domain>/lib/mappers.ts` | そのドメインだけのテーブル・複合オブジェクト |

---

## まとめ

| 間違い | 修正 |
|--------|------|
| 各 API に変換コードが散在 | `mappers/` に集約 |
| フィールド追加時の修正漏れ | マッパ1ファイルだけ直せば OK |
| Handler が太い | マッパ呼び出し1行に |

**学び**: **境界（DB ↔ アプリ）** でデータの形を変える。変換は **1か所** に閉じ込め、API はビジネスフローに集中する。
