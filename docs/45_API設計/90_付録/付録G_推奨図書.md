# 付録G　推奨図書・学習リソース

API 設計を深掘りするための参考資料です。初心者は **上から順に** 触れると理解が積み上がりやすいです。

---

## 書籍

| 書籍 | 著者 | おすすめポイント |
|------|------|-----------------|
| **HTTP の教科書** | 増井敏克 | HTTP の基礎を体系的に。API 設計の土台 |
| **Web API: The Good Parts** | 水野貴明（訳: オライリー） | REST API の実践的な良い／悪い例 |
| **API Design Patterns** | JJ Geewax | リソース設計・エラー・バージョニングのパターン集 |
| **RESTful Web APIs** | Leonard Richardson 他 | REST の考え方とリソースモデリング |
| **OAuth 2 in Action** | Justin Richer 他 | 認証・認可の実装理解 |
| **Building Microservices** (2nd) | Sam Newman | サービス間 API・進化・互換性 |
| **現場で役立つシステム設計の原則** 第8章 | 増田亨 | 連携の4方式・良い API・発展の進め方・ドメインとの境界 |

本ノート群: [[06_アプリケーション間連携の価値と4つの方式]]、[[01_HTTPの基本]]、[[05_API設計の原則]]、[[04_発展性のあるAPI開発]]、[[10_ドメインオブジェクトとWeb API]]、[[07_複雑なアプリケーション間連携]]

---

## オンラインリソース

| リソース | 内容 |
|---------|------|
| [MDN Web Docs — HTTP](https://developer.mozilla.org/ja/docs/Web/HTTP) | ステータスコード・ヘッダーの公式寄り解説 |
| [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3) | OpenAPI 3.0 仕様 |
| [RFC 9457 — Problem Details](https://www.rfc-editor.org/rfc/rfc9457) | 標準的なエラーレスポンス形式 |
| [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines) | 大規模 API の設計ガイドライン例 |
| [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/) | 実務向け REST ガイドライン |

---

## 本 vault 内の関連ノート

| ノート | 内容 |
|--------|------|
| [[MOC_モジュール設計体系]] | 上位：モジュール境界と公開面 |
| [[010Programming/44_クラス設計・デザインパターン/00_全体像/目次]] | 下位：クラス・インターフェース |
| [[010Programming/46_メソッド設計/00_全体像/目次|46_メソッド設計/目次]] | 下位：関数の中身 |
| [[00_API設計の概要]] | 8 テーマの要約 |
| [[MOC_API設計体系|目次]] | 本教材の全体像 |

---

## 学習の順序（推奨）

```text
  1. 本教材（10_APIの基礎・20_HTTPの土台）で HTTP と API の全体像
  2. Web API: The Good Parts で REST の勘所
  3. OpenAPI で手を動かしドキュメント駆動
  4. API Design Patterns で実務パターンを蓄積
  5. ケーススタディ（85_ケーススタディ）→ [[010Programming/44_クラス設計・デザインパターン/00_全体像/目次]] へ
```

---

→ [[010Programming/45_API設計/00_全体像/00_はじめに]] / [[MOC_API設計体系|目次]]
