---
title: 05_Screaming_Architecture
created: 2026-10-05
tags:
  - モジュール設計
  - ディレクトリ構成
---

# Screaming Architecture（叫ぶアーキテクチャ）

## この章の目的

[[04_モジュール分割の考え方]] では、機能別とレイヤー別の分け方を比較し、Screaming Architecture にも簡単に触れました。
この章では、その考え方をもう少し掘り下げ、**ディレクトリ構成を設計の道具として使う** 方法を学びます。

- Screaming Architecture とは何か（Robert C. Martin, 2011）
- 「フレームワークは道具であって、構造ではない」という主張
- フロントエンド・バックエンドでの具体的な構成例
- どこまで「叫ばせる」べきか（実務的な妥協点）

---

## 1. Screaming Architecture とは

### 1.1 建物の設計図のたとえ

Robert C. Martin（ボブおじさん）は 2011 年のブログ記事と、後の『Clean Architecture』第21章で、次のように問いかけました。

> 家の設計図を見れば、それが **家** だと分かる。玄関があり、居間があり、台所があり、寝室がある。図書館の設計図を見れば、それが **図書館** だと分かる。
>
> では、あなたのアプリのディレクトリ構成を見たとき、それは何を **叫んで** いるだろうか？
> 「**医療システム**」だろうか、「**会計システム**」だろうか。それとも「**Rails**」「**Spring**」「**Next.js**」だろうか？

### 1.2 主張

> **アーキテクチャは、使っているフレームワークではなく、システムの「目的」と「ユースケース」を叫ぶべきである。**

```text
✕ フレームワークを叫ぶ               ○ 業務を叫ぶ
src/                                 src/
  controllers/                         reservations/
  models/                              patients/
  views/                               prescriptions/
  services/                            billing/
  helpers/                             shared/
```

左を見て分かるのは「MVC フレームワークを使っている」ことだけです。右を見れば「**病院の予約・患者・処方・請求を扱うシステム**」だと分かります。

---

## 2. フレームワークは道具である

### 2.1 Martin の主張

- フレームワークは **便利な道具** だが、アーキテクチャの **中心ではない**
- アーキテクチャの中心は **ユースケース**（システムが利用者のために何をするか）
- フレームワークに構造を決めさせると、**フレームワークを変えられなくなり**、業務ロジックがフレームワークの流儀に引きずられる

> 「フレームワークと結婚するな」— ボブおじさん

### 2.2 なぜ重要か

| 観点 | フレームワークを叫ぶ構成 | 業務を叫ぶ構成 |
|---|---|---|
| 新しいメンバーの理解 | 「何のシステムか」が分からない | 業務の全体像がすぐ分かる |
| 機能の変更 | 複数のフォルダ（controllers・models・views）を行き来する | 1つのフォルダで完結しやすい |
| フレームワークの移行 | 構造ごと作り直し | 外側だけ差し替えやすい |
| テスト | フレームワークを起動しないとテストできないことが多い | 業務ロジックをフレームワークなしでテストできる |
| 業務の専門家との会話 | フォルダ名が業務の言葉でない | フォルダ名がそのまま **ユビキタス言語** になる |

最後の点は DDD とつながります（→ 42 の [[02_ユビキタス言語]]、[[02_ドメインに基づくモジュール設計]]）。

---

## 3. 構成の例

### 3.1 バックエンド（TypeScript）

```text
src/
  reservations/                 ← 業務の単位（叫ぶ部分）
    domain/
      Reservation.ts
      ReservationPolicy.ts
    application/
      MakeReservation.ts        ← ユースケース名がファイル名になる
      CancelReservation.ts
    infrastructure/
      PrismaReservationRepository.ts
    http/
      reservationRoutes.ts
    index.ts                    ← このモジュールの公開 API
  patients/
    ...
  billing/
    ...
  shared/                       ← 本当に共通のものだけ（小さく保つ）
    kernel/                     ← 共有カーネル（Money・DateRange など）
    infrastructure/             ← DB 接続・ロガー
  main.ts                       ← フレームワークとの接続（Composition Root）
```

- **最上位** は業務で分ける（叫ぶ）
- 各業務フォルダの **中** は、必要に応じて技術で分ける（41 の [[03_垂直スライスアーキテクチャ]] やヘキサゴナルと組み合わせる）
- フレームワークとの接続は `main.ts` や `http/` のような **外側** に寄せる（41 の [[03_制御の反転とComposition Root]]）

### 3.2 フロントエンド（React / Next.js）

```text
src/
  app/                          ← Next.js のルーティング（フレームワークの規約）
    reservations/page.tsx       ← features を呼ぶだけの薄い層
    patients/[id]/page.tsx
  features/                     ← 業務の単位（叫ぶ部分）
    reservations/
      components/ReservationForm.tsx
      hooks/useReservations.ts
      api/reservationApi.ts
      model/reservation.ts
      index.ts
    patients/
      ...
  shared/
    ui/                         ← ボタン・モーダルなど業務を知らない部品
    lib/
```

- Next.js の `app/` のように、**フレームワークが構造を強制する部分** はある。その場合は **薄く保ち、業務のコードは `features/` に置く**
- フロントエンドの構成方法論として知られる **Feature-Sliced Design** も、同じ発想で「層（app・pages・widgets・features・entities・shared）× 業務のスライス」に分けています（→ 47_フロントエンド設計）

---

## 4. どこまで叫ばせるか — 実務的な妥協点

### 4.1 規模による使い分け

| 規模 | おすすめ |
|---|---|
| 小規模（数十ファイル） | レイヤー別でも問題ない。無理に業務で分けると、フォルダの中身が1〜2ファイルだけになる |
| 中規模 | **最上位を業務で分け、中を技術で分ける** |
| 大規模 | 業務ごとのモジュールを、**パッケージ・ワークスペース** として分離する（→ [[04_npmパッケージとモノレポでの適用]]） |

### 4.2 よくある悩み

| 悩み | 考え方 |
|---|---|
| **どの業務にも属さないコードはどこに置く？** | `shared/` に置く。ただし `shared/` が肥大化したら、業務の境界の見直しのサイン（[[01_パッケージ設計の原則]] の「共通ユーティリティ置き場を小さく保つ」） |
| **複数の業務にまたがるユースケースは？** | 主導する業務のフォルダに置き、他の業務は公開 API 経由で使う。どうしても決められないなら、境界の切り方を見直す |
| **フレームワークの規約と衝突する** | 規約に従う部分（ルーティング・設定）は薄く保ち、業務のコードはその外に置く |
| **フォルダ名は英語か日本語か** | コードは英語が一般的。ただし **業務の専門家が使う言葉を英訳したもの** にする（技術用語にしない） |

### 4.3 AI 時代の Screaming Architecture

AI コーディングアシスタントは、ディレクトリ構成とファイル名を手がかりにコードベースを理解します。**業務を叫ぶ構成** は、人間だけでなく AI にとっても「どこに何があるか」「どこを直せばいいか」を分かりやすくします。2026 年には「エージェントのための Screaming Architecture」という議論も出てきています。

---

## 5. ありがちな誤解

### 5.1 「Screaming Architecture ではレイヤーを使わない」

**誤りです。** 最上位を業務で分けるのであって、業務フォルダの中ではレイヤーを使ってかまいません。

### 5.2 「フレームワークを使ってはいけない」

**誤りです。** フレームワークは積極的に使います。ただし、**構造の中心** にはしない、ということです。

### 5.3 「フォルダ名を業務の言葉にすれば完了」

**不十分です。** フォルダ名だけ変えても、`reservations/` が `patients/` の内部を直接 import しているなら、境界は守られていません。**公開 API の制限** と **依存ルールの自動検査** とセットで考えます（→ [[06_依存ルールの自動検査]]）。

---

## まとめ

- **Screaming Architecture**：ディレクトリ構成は、フレームワークではなく **システムの目的とユースケース** を叫ぶべき（Robert C. Martin, 2011）
- **フレームワークは道具**。構造の中心は業務とユースケース
- 業務を叫ぶ構成は、**理解・変更・移行・テスト・業務の専門家との会話** のすべてで有利
- 実務では **最上位を業務で、中を技術で** 分けるのが一般的。フレームワークが強制する部分は薄く保つ
- フォルダ名を変えるだけでなく、**公開 API と依存ルール** で境界を守る

### 次に進む章

- [[01_モジュール間インターフェースの設計]] — 業務モジュールの公開 API をどう設計するか

---

## 参考資料

- Robert C. Martin『Clean Architecture』第21章「叫ぶアーキテクチャ」
- [Screaming Architecture（Milan Jovanović）](https://milanjovanovic.tech/blog/screaming-architecture)
- [Let Me Hear you Scream(ing Architecture)（Level Up Coding）](https://levelup.gitconnected.com/let-me-hear-you-screaming-architecture-3adcc02f2ca3)
- [What is Screaming Architecture?（DEV Community）](https://dev.to/nilebits/what-is-screaming-architecture-442o)
- [Screaming Architecture for Agents（Robin Tegg, 2026）](https://robintegg.com/2026/07/24/screaming-architecture-for-agents.html)
- [Feature-Sliced Design](https://feature-sliced.design/)
