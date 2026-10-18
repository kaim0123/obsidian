# 付録E　よくあるアンチパターン一覧

メソッド設計で避けるべき **アンチパターン** の一覧です。

---

## 1. 巨大関数（God Function / 神メソッド）

| 症状 | 対策 |
|------|------|
| 100 行超、複数の関心 | Extract Method + SoC |
| `main` / `handleRequest` に全部 | 段階的詳細化 |

```javascript
// アンチパターン
function handleEverything(req) { /* 500 行 */ }
```

→ [[04_Extract_Method]]、[[01_ケーススタディ_注文処理フロー]]

---

## 2. 曖昧な命名

| 症状 | 対策 |
|------|------|
| `process()`, `handleData()` | 動詞 + 目的語 |
| 検索で数十件ヒット | 具体的な名前 |

→ [[01_命名]]、[[02_関心の分離と単一責任]]

---

## 3. 副作用付き getter

| 症状 | 対策 |
|------|------|
| `getUser()` 内でログ・DB 更新 | CQS — Query は副作用なし |
| 読むたびに状態が変わる | Command に分離 |

```javascript
// アンチパターン
function getTotal(order) {
  order.lastAccessed = Date.now();
  return order.cachedTotal;
}
```

→ [[01_CQS]]

---

## 4. フラグ引数

| 症状 | 対策 |
|------|------|
| `save(data, true)` の意味が不明 | 関数を分割 |
| 1 関数が 2 モード | `saveAsHtml()` / `saveAsText()` |

→ [[02_引数の設計]]

---

## 5. ネスト地獄

| 症状 | 対策 |
|------|------|
| if の中の if が 4 段 | Guard Clause |
| 正常系が右端 | 異常系を先に return |

→ [[02_Guard_Clause]]

---

## 6. モック地獄

| 症状 | 対策 |
|------|------|
| テストでモック 10 個 | 純粋関数に Core を切り出す |
| モックの順序に依存 | FCIS、依存注入 |

→ [[01_テストしやすいメソッド設計]]、[[03_Functional_Core_Imperative_Shell]]

---

## 7. 貧血モデル（メソッド版）

| 症状 | 対策 |
|------|------|
| エンティティはデータのみ | ドメインルールをメソッドに |
| サービスにロジック集中 | Tell, Don't Ask |

→ [[04_オブジェクトのメソッド]]

---

## 8. try-catch だらけ

| 症状 | 対策 |
|------|------|
| 各関数に try-catch | 境界（Shell）に集約 |
| 正常系が読めない | Fail Fast + 上位で catch |

→ [[02_エラー処理]]

---

## 関連

- [[付録B_メソッド設計チェックリスト]]
- [[010Programming/46_メソッド設計/90_付録/付録F_参考図解|付録F_参考図解]]
