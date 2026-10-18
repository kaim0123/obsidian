# 付録D　参考図解

モジュール設計でよく使う図のテンプレートです。Obsidian やホワイトボードに転記して使えます。

---

## 1. 設計の階層

```text
アーキテクチャ    … システム全体
    ↓
ソフトウェア設計  … パラダイム・DDD（[[MOC_ソフトウェア設計体系]]）
    ↓
モジュール設計    … パッケージ・レイヤー（本教材）
    ↓
クラス設計        … クラス・インターフェース（[[010Programming/44_クラス設計・デザインパターン/00_全体像/目次]]）
    ↓
メソッド設計      … 関数の中身（[[010Programming/46_メソッド設計/00_全体像/目次|目次]]）
```

---

## 2. 高凝集・低結合

```text
  ┌─────────┐         ┌─────────┐
  │ Module A│         │ Module B│
  │ (高凝集) │── IF ──→│ (高凝集) │
  └─────────┘         └─────────┘
       内部詳細は隠す      最小限の契約だけ
```

---

## 3. レイヤードアーキテクチャ

```text
  ┌──────────────────┐
  │  Presentation    │
  ├──────────────────┤
  │  Application     │
  ├──────────────────┤
  │  Domain          │
  ├──────────────────┤
  │  Infrastructure  │
  └──────────────────┘
        依存: 上 → 下
```

---

## 4. ヘキサゴナル（ポートとアダプタ）

```text
       HTTP Adapter
            │
            ▼
      [ Driving Port ]
            │
       ┌────┴────┐
       │  Core   │
       └────┬────┘
            │
      [ Driven Port ]
            ▲
       DB Adapter
```

---

## 5. 依存グラフ（良い例）

```text
  web
   ├──→ order ──→ order/domain
   │       └──→ order/infra
   └──→ payment
              └──→ payment/infra

  ※ domain は infra に依存しない
  ※ 循環なし
```

---

## 6. 依存グラフ（悪い例）

```text
  order ←──→ payment     ← 循環
    │            │
    └─────┬──────┘
          ▼
      orders テーブル（直接 SQL）  ← 共有 DB
```

---

## 7. モジュール間データの渡し方

```text
  良い:  OrderId, OrderSummaryDto
  悪い:  OrderEntity（内部）, RawDbRow
```

---

## 8. イベント連携

```text
  [Order] ──publish──→ OrderPlacedEvent ──→ [Inventory]
                                              reserve()
                                              [Notification]
                                              sendEmail()
```

---

## 9. ドメイン主軸のディレクトリ

```text
src/
  order/     domain/ application/ infra/
  payment/   domain/ application/ infra/
  catalog/   domain/ application/ infra/
```

---

→ [[010Programming/43_モジュール設計/90_付録/付録E_推奨図書]] / [[MOC_モジュール設計体系|目次]]
