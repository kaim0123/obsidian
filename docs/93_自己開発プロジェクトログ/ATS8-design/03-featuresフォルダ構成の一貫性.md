# 03. features/ フォルダ構成の一貫性

## design.md の指摘（✅ 対応済み）

> **`features/` のフォルダ構成がバラバラ**
>
> 共有型を `features/shared/types.ts` に集約。各 feature は `types.ts` を持ち、必要なら shared から再エクスポート。

---

## 基礎知識：feature-based 構成とは？

大きなアプリでは、ファイルを **技術の種類**（components / hooks / utils）だけで分けると、1つの機能を直すのに **10個のフォルダ** を行き来することになります。

**feature-based（機能別）構成** は、**ドメイン（業務領域）ごと** にまとめる方式です。

```
features/
├── candidates/   ← 「応募者」に関するすべて
├── events/       ← 「イベント」に関するすべて
└── shared/       ← 複数機能で共通のもの
```

各 feature の中身の例:

```
features/candidates/
├── components/   UI 部品
├── hooks/        データ取得・状態管理
├── schemas/      バリデーション（Zod）
├── types/        型定義
└── lib/          ドメイン固有のロジック
```

---

## 何が間違っていたか

### 問題：feature によって中身が違いすぎた

| feature | 以前の状態 |
|---------|-----------|
| `candidates` | components + hooks + schemas + types（フル構成） |
| `events` | 同上（フル構成） |
| `auth` | hooks のみ |
| `analytics` | hooks + types |
| `history` | hooks + types（再エクスポート） |

**同じ `features/` の下なのに、ルールが統一されていませんでした。**

### 特に問題だった点：型定義の散在

- `Candidate` 型は `features/candidates/types.ts`
- `Task` 型は `features/tasks/types.ts` にも `features/candidates/types.ts` にも…
- `Source` 型は `constants/sources.ts` にも存在（→ [[05-Source型の二重定義]]）

**「この型はどこが正？」** が分からず、import 先を間違えやすい状態でした。

---

## どう修正すべきか

### 1. 共有型は `features/shared/types.ts` に集約

**2つ以上の feature で使う型** は shared に置きます。

例:
- `Task` — 応募者画面でもタスク画面でも使う
- `Source` — 応募者・設定画面で使う
- `StageHistory` — 履歴・応募者詳細で使う

### 2. 各 feature は自分専用の `types.ts` を持つ

**その feature だけ** で使う型は各 feature に残します。

例:
- `features/candidates/types.ts` → `Candidate`, `CandidateListItem` など
- `features/events/types.ts` → イベント固有の型

### 3. 必要なら shared から再エクスポート

import パスを統一したい feature では:

```typescript
// features/history/types.ts
export type { StageHistory } from '@/features/shared/types'
```

これで `history` を使う側は `@/features/history/types` から import でき、**中身は shared の正** です。

### 4. フォルダ規約をドキュメント化

新しい feature を追加するときのチェックリスト:

- [ ] `types.ts` があるか
- [ ] 共有型を shared に置いていないか（重複していないか）
- [ ] components が必要なら `components/` があるか

---

## 修正後の構造（イメージ）

```
features/
├── shared/
│   ├── types.ts          ← 共有型の「正」
│   └── lib/mappers/      ← 共有エンティティの変換
├── candidates/
│   ├── components/
│   ├── hooks/
│   ├── schemas/
│   └── types.ts          ← 応募者専用型のみ
├── events/
│   └── types.ts          ← EventParticipation は shared 参照
└── auth/
    └── hooks/            ← UI が少ない feature は hooks のみでも OK
```

**「フル構成」が必須なのは UI が複雑な feature だけ** — 無理に空フォルダを作る必要はありません。  
重要なのは **型の置き場所のルール** です。

---

## まとめ

| 間違い | 修正 |
|--------|------|
| 型が feature 間で重複 | `shared/types.ts` に集約 |
| import 先がバラバラ | 各 feature の `types.ts` で再エクスポート |
| 新規 feature のルール不明 | 共有型 → shared、専用型 → feature 内 |

**学び**: フォルダ構成の一貫性は **見た目のきれいさ** ではなく、**「どこを直せばいいか分かる」** ためのものです。
