# 付録D　リファクタリング技法早見表（Extract Method ほか）

メソッド設計で使うリファクタリング技法の早見表です（Martin Fowler, *Refactoring*）。

---

## 関数の抽出・整理

| 技法 | 用途 | 章 |
|------|------|-----|
| **Extract Method** | 意味の塊を新関数に | [[04_Extract_Method]] |
| **Inline Method** | 小さすぎる関数を統合 | [[04_Extract_Method]] |
| **Replace Temp with Query** | 一時変数を関数に | [[04_Extract_Method]] |
| **Introduce Parameter Object** | 引数をオブジェクト化 | [[02_引数の設計]] |
| **Remove Flag Argument** | フラグ引数を関数分割に | [[02_引数の設計]] |

---

## 制御フロー

| 技法 | 用途 | 章 |
|------|------|-----|
| **Replace Nested Conditional with Guard Clauses** | ネストを早期 return に | [[02_Guard_Clause]] |
| **Replace Conditional with Polymorphism** | 分岐を多態に | [[03_複雑度と分岐]] |
| **Decompose Conditional** | 条件式を関数に | [[03_複雑度と分岐]] |
| **Consolidate Conditional Expression** | 同じ結果の条件を統合 | [[03_複雑度と分岐]] |

---

## データ・副作用

| 技法 | 用途 | 章 |
|------|------|-----|
| **Separate Query from Modifier** | CQS の適用 | [[01_CQS]] |
| **Extract Class / Move Method** | 関数を適切なクラスへ | [[04_オブジェクトのメソッド]] |
| **Pass Object Instead of Data** | プリミティブをオブジェクトに | [[02_引数の設計]] |

---

## 適用手順（共通）

1. **テスト** を書く（または既存テストを確認）
2. **小さく** 1 技法ずつ適用
3. **テスト** が通ることを確認
4. **コミット** する
5. 次の技法へ

---

## レガシー関数への優先順位

```text
  1. Guard Clause（異常系の抽出）
  2. Extract Method（意味の塊）
  3. Introduce Parameter Object（引数整理）
  4. Replace Conditional（分岐の整理）
  5. Separate Query from Modifier（CQS）
```

関連: [[02_リファクタリングの実践]]、[[00_メソッド設計の変遷]]
