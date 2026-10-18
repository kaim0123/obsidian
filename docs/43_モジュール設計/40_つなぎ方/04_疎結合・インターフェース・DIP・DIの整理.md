---
title: 04_疎結合・インターフェース・DIP・DIの整理
created: 2026-10-15
tags:
  - モジュール設計
  - 結合度
  - DIP
  - DI
---

# 疎結合・インターフェース・DIP・DI の整理

## このノートの目的

「疎結合」「インターフェース」「依存性逆転の原則（DIP）」「依存性注入（DI）」は、セットで語られるので混ざりやすい概念です。  
このノートでは **4つの関係** を1枚に整理し、**モジュール（ディレクトリ・パッケージ）単位でどう実現するか** までをまとめます。

各概念の詳細は本拠地のノートにリンクします（下の「関連ノート」）。

---

## 1. 4つの概念の役割分担

| 概念 | 役割 | 一言でいうと | 詳細の本拠地 |
|---|---|---|---|
| **疎結合** | 目的 | 部品同士が互いの中身をなるべく知らない状態 | [[02_結合度]] / [[03_疎結合と高凝集]] |
| **インターフェース** | 手段（道具） | 「何ができるか」だけを決め、「どうやるか」を隠す | [[01_モジュール間インターフェースの設計]] / [[04_インターフェースと抽象化]] |
| **DIP（依存性逆転の原則）** | 設計原則 | 依存の矢印を、変わりにくい側（ビジネスロジック）に向ける | [[02_依存関係の管理]] / [[05_DIP (依存性逆転の原則)]] |
| **DI（依存性注入）** | 実装の技法 | 使う部品を自分で `new` せず、外から渡してもらう | [[01_依存性注入]] / [[03_制御の反転とComposition Root]] |

> **疎結合** にしたい → **インターフェース** で中身を隠す → その置き場所と矢印の向きを決めるのが **DIP** → 実物を外から渡す仕組みが **DI**

```text
          目的: 疎結合（変更・テストに強くする）
                        │
     ┌──────────────────┼──────────────────────┐
     ▼                  ▼                      ▼
 インターフェース        DIP                     DI
 「契約で隠す」     「矢印を上位へ向ける」      「実物は外から渡す」
                   （抽象は上位が所有）      （new は Composition Root へ）
     └──────────────────┴──────────────────────┘
                        ▼
        差し替え可能・テスト容易・変更の影響範囲が小さい
```

---

## 2. 段階を追って見る

同じコードを、密結合から順に4段階で直していきます。

### 段階0：密結合（具体クラスを直接 `new`）

```typescript
// order/OrderService.ts
import { PostgresOrderRepository } from '../infra/PostgresOrderRepository';

export class OrderService {
  private repo = new PostgresOrderRepository(); // 具体クラスを直接生成

  async place(cmd: PlaceOrderCommand) {
    const order = Order.create(cmd);
    await this.repo.save(order);
  }
}
```

- DB を替えると `OrderService` も直す必要がある
- テストに本物の Postgres が必要
- `order` モジュールが `infra` モジュールの **内部クラス名** まで知っている（[[02_結合度]] の内容結合に近い）

### 段階1：インターフェースを導入しただけ

```typescript
// infra/OrderRepository.ts   ← インターフェースを infra 側に置いてしまった
export interface OrderRepository { save(order: Order): Promise<void>; }
export class PostgresOrderRepository implements OrderRepository { /* ... */ }

// order/OrderService.ts
import { OrderRepository, PostgresOrderRepository } from '../infra/OrderRepository';

export class OrderService {
  private repo: OrderRepository = new PostgresOrderRepository(); // まだ new している
}
```

型はインターフェースになりましたが、**疎結合にはなっていません**。

- `new` が残っているので、結局 Postgres 実装に依存している
- インターフェースが `infra` にあるので、`order → infra` の矢印は消えていない

### 段階2：DI を導入（外から渡す）

```typescript
// order/OrderService.ts
export class OrderService {
  constructor(private readonly repo: OrderRepository) {} // 受け取るだけ
}
```

`new` は消えました。テストではメモリ実装を渡せます。  
ただし **インターフェースがまだ `infra` 側** にあるなら、`order` は `infra` を import し続けます。

### 段階3：DIP を適用（インターフェースを上位側が所有）

```typescript
// order/domain/OrderRepository.ts   ← 上位（使う側）が定義
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
}

// order/application/OrderService.ts
import type { OrderRepository } from '../domain/OrderRepository';
export class OrderService {
  constructor(private readonly repo: OrderRepository) {}
}

// infra/PostgresOrderRepository.ts  ← 下位が上位の契約を実装しに行く
import type { OrderRepository } from '../order/domain/OrderRepository';
export class PostgresOrderRepository implements OrderRepository { /* ... */ }

// main.ts（Composition Root）  ← new はここに集める
const repo = new PostgresOrderRepository(pool);
const service = new OrderService(repo);
```

```text
  段階0〜2                         段階3（DIP 適用後）
  ────────                         ─────────────────
  order ──→ infra                  order ←── infra
                                     ▲
                                    main（組み立て）
```

| 段階 | インターフェース | DI | DIP | 疎結合か |
|---|---|---|---|---|
| 0 | なし | なし | なし | ✕ |
| 1 | あり（infra 所有） | なし | なし | ✕ |
| 2 | あり（infra 所有） | あり | なし | △（テストは楽になるが矢印はそのまま） |
| 3 | あり（**order 所有**） | あり | あり | ◯ |

**ポイント**: インターフェース・DI・DIP は **3つそろって初めて** モジュール間の矢印が逆転します。

---

## 3. 「処理の流れ」と「依存の方向」は別物

DIP の「逆転」がわかりにくいのは、2つの矢印を混同しやすいからです。

```text
  処理の流れ（実行時の呼び出し）
    OrderService ───呼ぶ───▶ PostgresOrderRepository

  ソースコードの依存（import の向き）
    OrderService ──▶ «OrderRepository» ◀── PostgresOrderRepository
```

- **処理の流れ** は変わらない（業務ロジックが DB を呼ぶ）
- **ソースコードの依存** だけが、下位から上位へ逆向きになる

依存の矢印は「**どちらが変わったら、どちらが壊れるか**」を表します。  
DIP 後は DB 側を変えても業務ロジックは壊れず、業務ロジック側の契約が変わったときだけ DB 側が追従します。**変わりにくく重要な方** が主導権を持つ構造です。

---

## 4. モジュール単位での実現

43_モジュール設計 の視点で、ディレクトリ・パッケージにどう落とすかをまとめます。

### 4.1 インターフェースの置き場所

```text
src/
  order/                      ← 上位（業務）
    domain/
      Order.ts
      OrderRepository.ts      ← ポート（インターフェース）はここ
    application/
      PlaceOrderUseCase.ts
    index.ts                  ← 外部に公開する面
  infra/                      ← 下位（技術的詳細）
    postgres/
      PostgresOrderRepository.ts   ← order/domain を import して実装
  main.ts                     ← Composition Root
```

| ルール | 理由 |
|---|---|
| ポートは **使う側のモジュール** に置く | 契約の形を業務の都合で決めるため |
| アダプタは **infra 側** に置く | 技術の詳細を外側に閉じ込めるため |
| `order/**` は `infra/**` を import しない | 依存の矢印を内向きに保つため |
| `new` は `main.ts`（または各モジュールの `composition.ts`）だけ | 組み立てを1か所に集めるため |

詳しい構成例は [[03_ヘキサゴナルアーキテクチャのモジュール構成]] を参照してください。

### 4.2 import ルールで矢印を守る

DIP は「気をつける」だけでは崩れます。**import 制約を CI で検査** して守ります（[[06_依存ルールの自動検査]]）。

```js
// .dependency-cruiser.js（イメージ）
{
  name: 'domain-must-not-depend-on-infra',
  from: { path: '^src/order/domain' },
  to:   { path: '^src/infra' },
  severity: 'error',
}
```

### 4.3 モジュール間の DI

モジュール A がモジュール B の機能を使う場合も、考え方は同じです。

```typescript
// order モジュールが「在庫を引き当てたい」
// order/domain/InventoryPort.ts   ← order が必要な形で定義
export interface InventoryPort {
  reserve(items: OrderItem[]): Promise<ReservationResult>;
}

// inventory モジュールの公開 API を、order のポートに合わせるアダプタ
// composition/InventoryAdapter.ts
import { inventoryApi } from '../inventory';          // inventory の index.ts だけを使う
import type { InventoryPort } from '../order/domain/InventoryPort';

export const inventoryAdapter: InventoryPort = {
  reserve: (items) => inventoryApi.reserve(items.map(toSku)),
};
```

- `order` は `inventory` を一切 import しない
- `inventory` 側の API が変わっても、直すのはアダプタだけ
- テストでは `InventoryPort` の偽物を渡せる

---

## 5. 混同しやすいポイント

| よくある誤解 | 実際 |
|---|---|
| DI と DIP は同じもの | 別物。DIP は **依存の向き** の原則、DI は **渡し方** の技法。具体クラスを DI することもできる（その場合 DIP は満たさない） |
| インターフェースを作れば DIP | インターフェースを **下位側に置いたら逆転しない**。置き場所と所有者が重要 |
| DI には DI コンテナが必要 | 不要。コンストラクタ引数で渡すだけで DI |
| IoC = DI | IoC（制御の反転）はより広い概念。DI はその一種（[[03_制御の反転とComposition Root]]） |
| 疎結合なら結合はゼロにすべき | 結合は **なくせない**。強さ・距離・変動性のバランスで決める（[[03_バランス結合_強度・距離・変動性]]） |

---

## 6. どこまでやるか（やりすぎ注意）

**効果が大きい場所**

- DB・外部 API・ファイル・メール・時刻・乱数など、**外部・変わりやすい・テストしにくい** もの
- 業務ロジックと技術的詳細の **境界**
- 別チームが持つモジュールとの **境界**

**やりすぎになりやすい場所**

- 実装が1つしかなく、替わる見込みもテスト上の不便もないもの
- 同じモジュール内のクラス同士（モジュール内部は密でもよい＝高凝集）
- すべてのクラスに `IFoo` / `FooImpl` を作る

差し込み口を作る目安は、[[【入門】依存性注入とは何か]] で紹介されている3つのシグナルがわかりやすいです。

1. 分岐が **3つ以上** に増えてきた
2. テストのためにその依存を用意するのが明らかに面倒
3. たまにしか使わないのに起動を重くしている部品がある

---

## まとめ

- **疎結合** が目的、**インターフェース** が道具、**DIP** が向きの原則、**DI** が渡し方
- インターフェースを作るだけ、DI するだけでは矢印は逆転しない。**上位側がインターフェースを所有** して初めて DIP になる
- 処理の流れは変わらず、**ソースコードの依存の向き** だけが逆になる
- モジュール単位では「ポートは使う側に置く」「`new` は Composition Root に集める」「import ルールを CI で検査する」
- 抽象化は **境界とテストのため** に絞り、早すぎる抽象化は避ける

---

## 関連ノート

### 43_モジュール設計（モジュールでの実現）
- [[02_結合度]] — 結合の種類と疎結合の原則
- [[03_バランス結合_強度・距離・変動性]] — どこまで疎結合にするかの判断軸
- [[01_モジュール間インターフェースの設計]] — 公開 API と契約
- [[02_依存関係の管理]] — 依存の方向・循環依存・DIP
- [[03_ヘキサゴナルアーキテクチャのモジュール構成]] — ポートとアダプタのディレクトリ構成
- [[06_依存ルールの自動検査]] — import ルールを CI で守る
- [[【入門】依存性注入とは何か]] — DI の具体例と使いどころ（動画クリップ）

### 41_アーキテクチャ（アーキテクチャでの位置づけ）
- [[03_疎結合と高凝集]]
- [[04_インターフェースと抽象化]]
- [[01依存性逆転]] / [[02_依存関係逆転の原則]]
- [[01_依存性注入]]
- [[03_制御の反転とComposition Root]]
- [[依存性のルール]] — クリーンアーキテクチャの同心円

### 48_原則・44_クラス設計・42_ソフトウェア設計
- [[05_DIP (依存性逆転の原則)]] — 原則の詳細
- [[04_ISP (インターフェース分離の原則)]] — インターフェースを小さく保つ
- [[03_インターフェースと抽象化]] — クラス単位の抽象化
- [[04_多態とインターフェース]] — 多態性との関係
