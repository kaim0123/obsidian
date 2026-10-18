---
title: HTTPクライアント・ユーティリティ比較
created: 2026-09-25
tags:
  - HTTPクライアント
  - ユーティリティ
  - ライブラリ選定
---

# HTTPクライアント・ユーティリティ比較

旧 `HTTPクライアント/README.md`・`ユーティリティ/README.md` の比較表を、2026年時点の情報で作り直したもの。

## HTTPクライアント

| 特徴 | Fetch API | ky | Axios |
|---|---|---|---|
| 種類 | 標準（ブラウザ・Node.js 18+） | fetch のラッパー | 独自実装（ブラウザは XHR / fetch、Node は http） |
| サイズ（gzip） | 0KB | 約5KB | 約40KB |
| 4xx/5xx で例外 | しない（`res.ok` を見る） | する（`HTTPError`） | する（`AxiosError`） |
| JSON | `res.json()` を自分で | `.json()` / `json:` オプション | 自動 |
| タイムアウト | `AbortSignal.timeout()` | `timeout`（既定10秒）・`totalTimeout` | `timeout`（既定なし） |
| リトライ | なし | 内蔵（既定2回） | なし（`axios-retry`） |
| 共通処理 | 自作ラッパー | hooks | interceptors |
| スキーマ検証 | なし | `.json(schema)`（v2） | なし |
| アップロード進捗 | 難しい | あり（環境による） | あり（`onUploadProgress`） |
| 向いている場面 | 小規模・依存を増やしたくない | 新規プロジェクトの既定 | 既存資産・インターセプター文化・進捗表示 |

- バックエンドに OpenAPI 定義があるなら、手書きより生成クライアント（openapi-fetch / Orval / Hey API）を検討 → [[02_OpenAPIからクライアントを生成する]]
- 2026年3月、Axios の npm アカウントが乗っ取られ、不正な版（1.14.1 / 0.30.4）が約3時間公開された。どの道具でも lockfile の固定・`npm ci`・インストールスクリプトの制限などは必須

## ユーティリティ

| 分野 | 第一候補 | 代替 | 標準でできること |
|---|---|---|---|
| 配列・オブジェクト | es-toolkit | Lodash（既存）、Remeda、Radash | `flat`・`at`・`toSorted`・`Object.groupBy`・`structuredClone` |
| 日付・時刻 | date-fns | Day.js、Temporal（これからの標準） | `Intl.DateTimeFormat`・`Intl.RelativeTimeFormat` |

## ノート一覧
- [[01_Axios]]
- [[02_Fetch API]]
- [[03_ky]]
- [[04_Lodash]]
- [[05_es-toolkit]]
- [[06_date-fns]]
