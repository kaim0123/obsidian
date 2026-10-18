# Feature-Sliced Design

## この章の目的

**Feature-Sliced Design（FSD）** —— フロントエンドのコードを **層（layer）・スライス（slice）・セグメント（segment）** の 3 段階で整理し、**import の向きを制限する** 設計方法論 —— を学ぶ章です。

方式どうしの比較は [[01_ディレクトリ構成の方式比較]]、ルールの自動検査は [[04_依存ルールの自動検査]] で扱います。

---

## 1. FSD とは

FSD は、ロシア語圏のフロントエンドコミュニティ発の方法論で、公式ドキュメント（feature-sliced.design）として公開されています。大規模で長く育つ SPA・複数チーム開発を想定しています。

中心となる考えは 2 つです。

- **標準化された層** にコードを分け、どこに何を置くかを迷わせない
- **上の層は下の層だけを使う**。逆向き・同じ層どうしの import を禁止する

---

## 2. 3 段階の構造

```text
src/
├── app/                 ← 層（layer）
├── pages/
│   └── product-detail/  ← スライス（slice）= 業務上の切れ目
│       ├── ui/          ← セグメント（segment）= 技術的な役割
│       ├── model/
│       └── index.ts     ← 公開 API
├── widgets/
├── features/
│   └── add-to-cart/
├── entities/
│   └── product/
│       ├── ui/
│       ├── model/
│       ├── api/
│       └── index.ts
└── shared/
    ├── ui/
    ├── api/
    ├── lib/
    └── config/
```

| 段階 | 分ける軸 | 例 |
|---|---|---|
| **Layer（層）** | 責務の広さ（固定の名前） | app, pages, widgets, features, entities, shared |
| **Slice（スライス）** | 業務ドメイン | product, cart, user, add-to-cart |
| **Segment（セグメント）** | 技術的な役割 | ui, model, api, lib, config |

---

## 3. 層（上から順に）

| 層 | 役割 | スライス |
|---|---|---|
| **app** | アプリの起動・プロバイダ・ルーティング・グローバルスタイル | なし |
| （processes） | 複数ページにまたがるフロー。**非推奨**（現在は使わない） | — |
| **pages** | 1 画面（ルート）単位の組み立て | あり |
| **widgets** | ページを構成する大きな自己完結ブロック（ヘッダー、商品一覧パネル） | あり |
| **features** | ユーザーに価値を与える **操作**（カートに追加、ログイン、コメント投稿） | あり |
| **entities** | 業務上の **もの**（商品、ユーザー、注文）の表示とデータ | あり |
| **shared** | 業務に依存しない共通部品（UI キット、API クライアント、ユーティリティ） | なし |

**features と entities の区別** が最初の難所です。

- entity = 名詞（商品、ユーザー）。「商品カード」「ユーザーのアバター」
- feature = 動詞（カートに**追加する**、ログイン**する**）。ボタンとその処理

すべての層を使う必要はありません。小さめのプロジェクトでは `app / pages / shared` から始め、必要になってから widgets・features・entities を切り出す進め方も公式に案内されています。

---

## 4. import のルール

```text
  app
   ↓
  pages
   ↓
  widgets
   ↓
  features
   ↓
  entities
   ↓
  shared
```

- **上の層は、自分より下の層だけを import できる**
- **同じ層のスライスどうしは import しない**（features/add-to-cart から features/login を使わない）
- 同じ層のものを組み合わせたいときは、**1 つ上の層で組み立てる**

```ts
// NG: feature どうしの import
// features/add-to-cart/ui/AddToCartButton.tsx
import { useAuth } from '@/features/login';

// OK: 下の層（entities）を使う
import { useCurrentUser } from '@/entities/user';
```

entities どうしがどうしても参照し合う場合（注文が商品を含むなど）のために、公式には **`@x` 記法**（明示的な相互参照用の公開 API）が用意されています。乱用せず、例外として扱います。

---

## 5. 公開 API（Public API）

各スライスは **`index.ts` で外に見せるものだけを export** します。外からはスライスの内部ファイルを直接 import しません。

```ts
// entities/product/index.ts
export { ProductCard } from './ui/ProductCard';
export { useProduct } from './api/useProduct';
export type { Product } from './model/types';
```

```ts
// 使う側
import { ProductCard } from '@/entities/product';           // OK
import { ProductCard } from '@/entities/product/ui/ProductCard'; // NG（内部に依存）
```

公開 API があると、スライス内部のファイル構成を変えても **使う側を壊さない** で済みます（情報隠蔽のディレクトリ版）。

---

## 6. 向く場面・向かない場面

| 向く | 向かない |
|---|---|
| 画面・機能が多く、長期運用する SPA | 数画面の小さなアプリ・短命な試作 |
| 複数人・複数チームで開発する | 一人開発で構成ルールを守る必要が薄い |
| 依存が絡み合い、変更の影響が読めなくなっている | フレームワークが強い構成規約を持ち、衝突する場合（要調整） |

Next.js の App Router のように **フレームワーク側がディレクトリに意味を持たせる** 場合は、ルーティング用の `app/` と FSD の層を分けて置くなどの調整が必要です。

---

## まとめ

- FSD は **layer × slice × segment** の 3 段階でコードを置く
- 層は app / pages / widgets / features / entities / shared（processes は非推奨）
- **上の層から下の層へだけ** import し、同じ層どうしは import しない
- entity は「もの」、feature は「操作」
- スライスは `index.ts` の公開 API 経由でだけ使う
- 小さく始めて、必要な層だけ足していく

## 関連

- [[01_ディレクトリ構成の方式比較]] — 他の方式との比較
- [[04_依存ルールの自動検査]] — FSD のルールを Steiger などで検査する
- [[03_bulletproof-reactの構成]] — もう一つの代表的な構成
- [[10-6-ディレクトリ設計]] — React でのフォルダ例（32）
- [[MOC_モジュール設計体系]] — 公開インターフェース・依存の向きの一般論（43）
- [[00_フロントエンド設計の変遷]] — Feature First / FSD の登場

→ 次の章: [[03_bulletproof-reactの構成]]
