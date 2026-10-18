# 付録F　参考図解

メソッド設計の主要概念を **図解** で整理した参考ページです。

---

## 1. Functional Core, Imperative Shell（FCIS）

```text
  ┌──────────────────────────────────────┐
  │  Imperative Shell（副作用あり）        │
  │  ┌────────────────────────────────┐  │
  │  │  Functional Core（純粋関数）    │  │
  │  │                                │  │
  │  │  validateOrder()               │  │
  │  │  calculateTotal()              │  │
  │  │  applyDiscount()               │  │
  │  │                                │  │
  │  └────────────────────────────────┘  │
  │                                      │
  │  loadFromDb()  saveToDb()  sendEmail()│
  └──────────────────────────────────────┘
         ▲                           │
         │  データ IN                 │  結果 OUT
         └───────────────────────────┘
```

→ [[03_Functional_Core_Imperative_Shell]]

---

## 2. 抽象度の階層

```text
  processOrder()                    ← 高（オーケストレーション）
    ├─ validateOrder()              ← 中
    ├─ calculateTotal()             ← 中
    │    └─ sumItemPrices()         ← 低（詳細）
    └─ saveOrder()                  ← 中
```

**原則**: 同じ関数内のステップは **同じ抽象度**。

→ [[01_メソッドの分割]]、[[01_サイズと抽象度]]

---

## 3. Guard Clause Before / After

### Before（ネスト）

```text
if (A) {
  if (B) {
    if (C) {
      → 正常系（深い）
    }
  }
}
```

### After（Guard Clause）

```text
if (!A) return;
if (!B) return;
if (!C) return;
→ 正常系（浅い）
```

→ [[02_Guard_Clause]]

---

## 4. CQS — Command と Query

```text
  Command（書く）          Query（読む）
  ─────────────          ─────────────
  submitOrder()          getOrder()
  saveUser()             isActive()
  activateAccount()      calculateTotal()

  副作用 OK               副作用 NG
  戻り値 void が多い       値を返す
```

→ [[01_CQS]]

---

## 5. 設計の階層での位置づけ

```text
  モジュール設計  … 部屋
  クラス設計      … 家具
  メソッド設計    … 細部  ← 本教材
  コーディング規約 … 仕上げ
```

→ [[MOC_クラス設計体系|44 クラス設計]]、[[010Programming/59_AI開発ツール・コーディング規約/コーディング規約/目次|コーディング規約]]

---

## 関連

- [[010Programming/46_メソッド設計/00_全体像/00_はじめに|00_はじめに]]
- [[010Programming/46_メソッド設計/90_付録/付録G_推奨図書|付録G_推奨図書]]
