# 06_Frameworks（フレームワーク / ランタイム別）目次

言語そのもの（`05_Languages/`）ではなく、**その上に乗せる仕組み** を置く場所。

| カテゴリ | 置くもの |
|---------|--------|
| **Node.js** | JSランタイムの機能（イベントループ・fs・http 等） |
| **React** | UIコンポーネントフレームワーク |
| **Next.js** | React + SSR/SSG/RSC 等の統合FW |
| **Backend** | サーバFW（Express / Fastify / NestJS 等） |
| **DB** | RDBMS / ORM / マイグレーションツール |

---

## 🔄 バージョン差分の扱い方

フレームワークは **メジャーバージョンで別物** になることが多い。
「最新版の情報」と「今メンテしているプロジェクトの情報」が混在すると事故るので、
**必要になった時点で** バージョン別サブフォルダに切る。

### 切り方の目安

| 状況 | 構造 |
|------|-----|
| 普段1つのバージョンしか触らない | ルート直下に置く（切らない） |
| **破壊的変更** で書き方が変わった | `<FW>/v14/` のようにバージョン別に切る |
| **同じFWで2パラダイム共存** | `Next.js/app-router/` と `Next.js/pages-router/` のようにパラダイム別 |
| ライブラリ拡張 | `React/libraries/TanStackQuery/` 等、ライブラリ別に切る |

### 命名ルール案

- バージョン番号で切る: `Next.js/v14/` `React/v18/`
- パラダイムで切る: `Next.js/app-router/` `Next.js/pages-router/`
- 共通の知識は **バージョン外に置く**（例: `Next.js/common/` or ルート直下）

> **原則**: 先にフォルダを切らない。**2つめのバージョンに触れる日が来たら** 分割する。

---

## 🟢 Node.js/
JavaScriptサーバサイドランタイム。フレームワークではないがここに置く。

### 基礎/ （既存ファイルを集約）
- `00-Node.js index.md` ✅
- `01-basics.md` ✅
- `02-setup.md` ✅
- `03-modules.md` ✅ — CommonJS / ESM
- `04-async.md` ✅ — Promise / async-await
- `05-filesystem.md` ✅ — fs / fs/promises
- `06-http.md` ✅ — 組み込みhttpモジュール
- `node-functions.md` ✅
- `イベントループ.md` — タスク / マイクロタスク / I/O
- `Buffer_Stream.md`
- `process_osモジュール.md`
- `child_process.md` — exec / spawn / fork
- `worker_threads.md` — 並列処理
- `デバッグ方法.md` — inspector / --inspect

### Node.jsの標準機能でサーバ構築/ *（Expressを使わない場合）*
- `07-express-basics.md` ✅ *（Express への橋渡し）*
- `08-middleware.md` ✅
- `09-routing.md` ✅
- `10-database.md` ✅
- `11-auth.md` ✅
- `12-deploy.md` ✅
- `express-api-functions.md` ✅
  > ⚠️ これらはExpress寄りの内容なので、将来 `Backend/Express/` に移すと整理しやすい。

### よくある罠/
- `ESMとCommonJSの混在.md`
- `__dirname_がESMで使えない.md`
- `非同期エラーの握りつぶし.md`
- `process_exitの乱用.md`
- `イベントリスナーのメモリリーク.md`
- `タイムゾーンと環境依存.md`

### レシピ/
- `環境変数の読み込み.md` — dotenv / process.env
- `CLIツールの作り方.md`
- `定期実行.md` — setInterval / node-cron
- `ログ出力.md` — pino / winston

---

## ⚛️ React/
UIを宣言的に組み立てるライブラリ。既に非常に充実した構成が存在。

### 既存構成（そのまま尊重）
- `00_基礎概念/` ✅ — fetch・コンポーネント/フックス/サービスの概念整理
- `01_React基礎/` ✅ — 00〜20番のチュートリアル系（20ファイル）
- `02_API連携/` ✅
- `03_状態管理/` ✅ — 20以上のファイル（フォーム・認証・UI切替・データ取得・URL連動・共有・リアルタイム）
- `04_UI実装/` ✅ — モーダル・タブ・トースト・テーマ・レスポンシブ
- `05_データ操作/` ✅ — CRUD・インポート/エクスポート・D&D
- `06_検索・絞込/` ✅ — 検索・ソート・ページネーション・無限スクロール
- `07_ユーザビリティ/` ✅ — お気に入り・ブレッドクラム・履歴
- `08_コミュニケーション機能/` ✅ — チャット・コメント・レビュー・共有
- `09_データ可視化/` ✅ — ダッシュボード・グラフ・統計
- `10_パフォーマンス最適化/` ✅ — PWA / CDN / 遅延読み込み
- `12_エラー・トラブルシューティング/` ✅ — ブラウザ / 状態 / ルーティング / API / 性能 等の6カテゴリ

### 補完したいもの
- **11_テスト/** （未作成） — Testing Library / Jest / Vitest
- **13_ライブラリ別/** （未作成、将来用）
  - `TanStackQuery/` — データ取得・キャッシュ
  - `ReactHookForm/` — フォーム
  - `Zustand_Jotai/` — グローバル状態
  - `Redux_Toolkit/` — 伝統的選択肢
- **common/ または 00_概念補強/**
  - `レンダリングの仕組み.md` — リコンシリエーション
  - `仮想DOM.md`
  - `React_19の変更点.md` — use / Actions / 新コンパイラ
  - `ServerComponents_ClientComponents.md`
  - `key属性の重要性.md`
  - `useEffect脱却の考え方.md`

### バージョン分岐の候補
必要になったら切る:
- `React/v17/` — 旧JSX Transform / レガシー
- `React/v18/` — 自動バッチング / Concurrent / Suspense
- `React/v19/` — Actions / use / 新コンパイラ

---

## ▲ Next.js/
React上のフルスタックフレームワーク。**Pages Router と App Router の2系統** があるので分岐する価値大。

### 既存ファイル（現状すべてルート直下）
- `00-Next.js index.md` ✅
- `01-basics.md` ✅ 〜 `12-practice.md` ✅
- `13-useParams詳細解説.md` ✅
- `14-useRouter詳細解説.md` ✅
- `15-useSearchParams詳細解説.md` ✅
- `nextjs-functions.md` ✅
- `ログインページのレイアウト分岐問題.md` ✅

### 🔀 推奨構造（段階的に移行）

```
Next.js/
├── common/                  ← 両ルーター共通
│   ├── Next.jsとは.md
│   ├── ビルドとデプロイ.md
│   └── 環境変数.md
├── app-router/              ← v13+ の新方式
│   ├── ルーティング基礎.md
│   ├── layout_template_page.md
│   ├── Server_Components.md
│   ├── Server_Actions.md
│   ├── Route_Handlers.md
│   └── Parallel_Intercepting_Routes.md
├── pages-router/            ← 従来方式
│   ├── pages_ディレクトリ.md
│   ├── getServerSideProps.md
│   ├── getStaticProps_getStaticPaths.md
│   └── API_Routes.md
└── v14/ または v15/         ← バージョン差分が大きくなったら
```

### 機能別トピック（ルーターにかかわらず）
- `データフェッチ戦略.md` — SSR / SSG / ISR / RSC の使い分け
- `画像最適化.md` — next/image
- `フォント最適化.md` — next/font
- `Middleware.md`
- `国際化_i18n.md`
- `認証連携.md` — NextAuth / Auth.js / Clerk
- `Turbopack.md` — 新ビルダー

### よくある罠
- `SSR_vs_CSRのハイドレーション.md`
- `use_client_use_serverの境界.md`
- `cookieとheadersの扱い.md` — Server Actions内
- `キャッシュの挙動.md` — fetch / revalidate / no-store

---

## 🔙 Backend/
サーバーサイドフレームワーク。現状 `Express/` がトップレベルにあるが、
**将来 Fastify や NestJS を加える** ことを見越して Backend/ 配下に集約する想定。

### 📦 現状と推奨構造

```
（現状）                      （推奨）
Express/       ────→         Backend/
                                ├── Express/
                                ├── Fastify/
                                ├── NestJS/
                                └── 比較・選定/
```

### Backend/Express/ （現 `Express/`）✅ *既存*
- `00-Express.js index.md` ✅
- `01-Express.jsとは.md` ✅
- `02-セットアップと基本構造.md` ✅
- `03-ルーティング.md` ✅
- `04-ミドルウェア.md` ✅
- `05-リクエストとレスポンス.md` ✅
- `06-テンプレートエンジン.md` ✅
- `07-APIサーバー構築.md` ✅
- `12-テストとCI_CD.md` ✅
- `13-パフォーマンス・最適化.md` ✅
- `14-よくある質問・トラブルシューティング.md` ✅
- **補完候補**:
  - `08-認証認可.md`
  - `09-エラーハンドリング.md`
  - `10-DB接続.md`
  - `11-バリデーション.md`

### Backend/Hono/ （未作成、将来候補）
エッジランタイム対応の新世代FW。

### Backend/比較・選定/
- `バックエンドFW選定指針.md`
- `Node系FWの軽量ベンチマーク.md`
- `エッジランタイム対応表.md`

---

## 🗄️ DB/
RDBMS・ORM・マイグレーションなど、**アプリから見たDB層** のフレームワーク/ライブラリ。

> ⚠️ **使い分け**:
> - **SQL文法・クエリの書き方** → `05_Languages/SQL/`
> - **DB製品固有の方言・運用** → `08_データベース/`
> - **アプリから叩くFW・ORM** → ここ

### DB/Postgres/ ✅ *既存 (空フォルダ)*
アプリから見た PostgreSQL 接続・利用。
- `Postgresとは.md` — 特徴・他DBとの違い
- `ローカル開発環境.md` — Docker / brew / WSL
- `接続ライブラリ.md` — node-postgres / psycopg
- `コネクションプール.md`
- `マイグレーション戦略.md`
- `JSONB活用.md` — JSONネイティブサポート
- `全文検索.md` — tsvector / tsquery
- `拡張機能.md` — pgvector / PostGIS
- `PgAdmin_psql.md` — クライアントツール
- `バックアップ_リストア.md`

### DB/ORM/ （未作成）
- `ORMを使うべきか.md` — Raw SQL との比較
- `Prisma.md` — TypeScript向け
- `Drizzle.md` — 型安全な軽量ORM
- `TypeORM.md`
- `Sequelize.md`
- `Knex_queryBuilder.md`
- `SQLAlchemy.md` — Python
- `マイグレーションの運用.md`

### DB/マイグレーションツール/ （未作成）
- `マイグレーションとは.md`
- `Prisma_Migrate.md`
- `Flyway.md`
- `sqlx_migrate.md`
- `ダウンマイグレーションの要否.md`

### DB/他のRDBMS/ （未作成、将来候補）
- `MySQL/` `SQLite/` `MSSQL/`

### DB/NoSQL/ （未作成、将来候補）
- `MongoDB/` `Redis/` `DynamoDB/`

---

## 📝 この領域の運用ルール

### 「フレームワーク」と「言語」の境界

| 判断軸 | 例 |
|--------|-----|
| **言語が提供する機能** | JavaScriptのasync/await → `05_Languages/JavaScript/` |
| **ランタイムの機能** | Node.jsのfs → ここ（`Node.js/`） |
| **追加パッケージ** | React / Express → ここ |
| **DB製品の運用** | PostgreSQLのVACUUM → `08_データベース/` |

### バージョン分割のタイミング

**早すぎる分割は管理コストを上げる**。
- 1つのバージョンしか書いてないのに `v14/` を先に切らない
- 破壊的変更が絡んだ記事を書くときに初めて分割する
- `common/` に「バージョンに依存しない話」を残す

### ファイルが増えてきたときの再構成

- Reactのような規模になる前提で、**番号付きサブフォルダ** で章立て
- 「機能別」と「チュートリアル順」を混ぜない
- 例: `01_基礎/` `02_応用/` `03_機能別実装/` `04_トラブル/`

---

## ⚠️ 既知の整理候補

1. **Express を `Backend/Express/` に移動** — Fastify/NestJS追加時に備える
2. **Node.js/ の `07-express-basics.md` 以降** は Express系なので、Backend/Express/ に寄せると責務が明確
3. **Next.js をルーター別に分割** — `app-router/` と `pages-router/` があると検索しやすい
4. **React/11_テスト/** の作成 — 現状テスト章が抜けている
5. **Postgres/ は空** — `08_データベース/` との責務分離を決めてから中身を書く

これらは **移行タイミングを見て** 実行。いま全部やると参照リンクが壊れるので注意。

---

## 🔗 関連領域

- `05_Languages/` — 言語そのもの
- `04_Tooling/Build/` — npm / pnpm / バンドラ
- `07_Testing/` — フレームワーク別テスト戦略
- `08_データベース/` — RDBMS運用・SQL方言
- `09_Architecture/` — Clean/DDD/レイヤー設計
- `10_インフラとクラウド/` — デプロイ先
