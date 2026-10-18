# 付録E　推奨図書・学習リソース

モジュール設計を深掘りするための参考資料です。

---

## 書籍

| 書籍 | 著者 | おすすめポイント |
|------|------|-----------------|
| **Clean Architecture** | Robert C. Martin | レイヤー・依存ルール・コンポーネント分割 |
| **Implementing Domain-Driven Design** | Vaughn Vernon | 境界づけられたコンテキストとモジュール |
| **Domain-Driven Design** | Eric Evans | 戦略的設計・ユビキタス言語 |
| **Working Effectively with Legacy Code** | Michael Feathers | レガシーへの段階的モジュール化 |
| **Building Microservices** (2nd) | Sam Newman | モノリスからサービスへの分割判断 |
| **Modular Monoliths** (記事・講演) | various | モジュール化モノリスの実践 |

---

## オンラインリソース

| リソース | 内容 |
|---------|------|
| [martinfowler.com/bliki](https://martinfowler.com/bliki/) | BoundedContext, Microservice 等の解説 |
| [c4model.com](https://c4model.com/) | コンテナ・コンポーネント図の描き方 |
| dependency-cruiser / ArchUnit ドキュメント | 依存関係の自動チェック |

---

## 本 vault 内の関連ノート

| ノート | 内容 |
|--------|------|
| [[MOC_ソフトウェア設計体系]] | 上位：設計思想・DDD・イベント駆動 |
| [[010Programming/44_クラス設計・デザインパターン/00_全体像/目次]] | 下位：クラス・SOLID |
| [[010Programming/46_メソッド設計/00_全体像/目次|目次]] | 下位：関数・メソッド |
| [[05_SOLIDとの関係]] | DIP, OCP, SRP |
| [[01_DDDを学ぶ理由|42 / 30_ドメイン駆動設計]] | ドメイン分割の詳細 |

---

## 学習の順序（推奨）

```text
  1. 本教材（モジュール設計）を一通り
  2. Clean Architecture で依存ルールを整理
  3. DDD 書籍でドメイン分割を深掘り
  4. レガシー書籍で実プロジェクトに適用
  5. [[010Programming/44_クラス設計・デザインパターン/00_全体像/目次]] へ
```

---

→ [[010Programming/43_モジュール設計/00_全体像/00_はじめに]] / [[MOC_モジュール設計体系|目次]]
