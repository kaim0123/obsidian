# 07_Testing（テスト：領域として独立させる）目次

「フレームワークの一章」ではなく **独立した領域** として扱う。
Vitest / Playwright / QA の実戦知を蓄積している現状を活かし、
**戦略・種別・技法・ツール・CI・デバッグ** の6軸で整理する。

| 軸 | 何を書く？ |
|---|-----------|
| **Strategy** | 何をどれだけ書くかの判断基準 |
| **Types** | テストの種別（Unit / Integration / E2E …） |
| **Techniques** | 書く上での汎用テクニック（モック・タイマー等） |
| **Tools** | 具体的なツール（Vitest / Playwright） |
| **CI** | テストを継続的に回すための仕組み |
| **Debugging** | テストが落ちたときの型 |

### 迷ったときの判断軸

| 内容 | 置き場 |
|------|-------|
| 「このプロジェクトで何をどれだけテストする？」 | Strategy |
| 「このタイプのテストってそもそも何？」 | Types |
| 「時間依存の処理をどうテストする？」 | Techniques |
| 「Vitestで〇〇したい」 | Tools/Vitest |
| 「CIで安定して通したい」 | CI |
| 「テストがたまに落ちる」 | Debugging |

---

## 🧭 Strategy/ （既存フォルダ 3つ）
**何をテストするか／しないか** を決めるための考え方。

### テストピラミッド/ ✅ *既存*
- `テストピラミッドとは.md` — Unit多め・E2E少なめの原則
- `ピラミッドの崩れ方.md` — Ice-cream cone アンチパターン
- `Testing_Trophy.md` — Kent C. Dodds の Integration重視モデル
- `Testing_Honeycomb.md` — バックエンド向けの派生
- `プロジェクト別の重心.md` — FE/BE/ライブラリで違う

### テスト設計の原則/ ✅ *既存*
- `FIRST原則.md` — Fast / Independent / Repeatable / Self-validating / Timely
- `Given_When_Then.md` — 振る舞い駆動の書き方
- `AAA_Arrange_Act_Assert.md`
- `テストの命名規則.md` — describe/it の書き方
- `1テスト1アサーションの是非.md`
- `ホワイトボックスとブラックボックス.md`
- `境界値分析_同値分割.md`
- `テストの独立性.md` — 順序依存を生まない
- `テストダブルの分類.md` — Dummy/Stub/Spy/Mock/Fake

### 品質戦略/ ✅ *既存*
- `品質と速度のトレードオフ.md`
- `テストカバレッジの読み方.md` — 数字に踊らされない
- `変更容易性とテスト量の関係.md`
- `回帰テストの育て方.md`
- `バグ修正時に先にテスト.md` — 再発防止の型
- `レガシーコードへのテスト追加戦略.md`
- `テストを書かない判断.md` — プロトタイプ等

---

## 🎯 Types/ （既存フォルダ 5つ）
テストの **種別** ごとに責務と書き方を整理。

### Unit/ ✅ *既存*
- `Unitテストとは.md` — 定義と目的
- `何を単位とするか.md` — 関数 / クラス / モジュール
- `純粋関数のテスト.md`
- `副作用を含む関数のテスト.md`
- `依存注入で書きやすくする.md`
- `境界値の網羅.md`
- `よいUnitテストの条件.md`

### Integration/ ✅ *既存*
- `Integrationテストとは.md`
- `UnitとE2Eの境界.md`
- `DBを含むテスト.md` — 実DB vs テストコンテナ
- `外部APIを含むテスト.md` — MSW / nock
- `複数モジュール結合のテスト.md`
- `テスト用データの用意.md` — fixture / factory / seed

### E2E/ ✅ *既存*
- `E2Eテストとは.md`
- `何をE2Eで検証するか.md` — クリティカルフロー優先
- `ページオブジェクトパターン.md`
- `テストデータ戦略.md` — シード / 固定 / 生成
- `認証の扱い.md` — Storage State の保存
- `E2Eの費用対効果.md` — 書きすぎの害

### Contract/ ✅ *既存*
- `Contractテストとは.md` — サービス間の約束を検証
- `Consumer_Driven_Contract.md`
- `Pact.md` — OSS の定番
- `OpenAPIからの契約検証.md`
- `マイクロサービスでの位置づけ.md`

### Visual/ ✅ *既存*
- `ビジュアルリグレッションとは.md`
- `スクリーンショット比較の仕組み.md`
- `Playwright_toHaveScreenshot.md`
- `Percy_Chromatic_Loki.md` — SaaS系ツール
- `アンチエイリアシング問題.md` — 環境差の罠
- `差分の許容閾値.md`

### 追加候補（Types/ 配下に新規）
- **Performance/** — 負荷テスト（k6 / Artillery）
- **Accessibility/** — axe-core / Lighthouse CI
- **Security/** — SAST / DAST の位置づけ
- **SmokeTest.md** / **Sanity_Regression.md** — 種別用語の整理

---

## 🛠 Techniques/ （既存フォルダ 5つ）
**どのツールでも使える** テスト技法。

### モック/ ✅ *既存*
- `モックとは.md` — ダブルの中の位置づけ
- `何をモックするか.md` — 外部依存の線引き
- `モックの罠.md` — 実装の写像になる問題
- `関数のモック.md` — vi.fn() / vi.mock()
- `モジュールのモック.md`
- `ネットワークのモック.md` — MSW 基礎
- `時間のモック.md` — fake timers との関係
- `スパイとの違い.md`

### スタブ/ ✅ *既存*
- `スタブとは.md` — モックとの違い
- `固定値を返すスタブ.md`
- `複雑なスタブの書き方.md`
- `スタブでテストを壊さない書き方.md`

### タイマー/ ✅ *既存*
- `時間依存コードのテスト.md`
- `fake_timersの使い方.md` — vi.useFakeTimers()
- `setTimeoutのテスト.md`
- `setIntervalのテスト.md`
- `Dateのモック.md`
- `タイマーテストの落とし穴.md`

### 非同期/ ✅ *既存*
- `非同期テストの基本.md` — async/await で書く
- `Promiseの解決を待つ.md`
- `ポーリング系のテスト.md`
- `waitForの使い方.md`
- `awaitの付け忘れ.md` — よくあるすり抜け
- `未処理Promiseの検出.md`

### プロパティテスト/ ✅ *既存*
- `プロパティテストとは.md` — 例ベースとの違い
- `fast-check入門.md`
- `不変条件の見つけ方.md`
- `縮小化_shrinking.md` — 失敗例の最小化
- `どんな関数に向くか.md` — 純粋関数・数値処理
- `例ベースとの併用.md`

### 追加候補
- **スナップショット/**
  - `Snapshotテストとは.md`
  - `いつ使うか_使わないか.md`
  - `インラインスナップショット.md`
- **フィクスチャ/**
  - `fixture_factoryの違い.md`
  - `テストデータ生成.md` — Faker
- **コンポーネントテスト/**
  - `Testing_Library哲学.md`
  - `アクセシブルクエリ.md`
  - `ユーザー視点でのテスト.md`

---

## 🧰 Tools/
具体的なツール群。現状は **Vitest / Playwright** が充実。

> **Jestは本ノートでは扱わない** （Vitestに統一）。過去資料を見る場合は 99_ 系か 11_その他リソース/ を参照。

### Vitest/ ✅ *既存 (8ファイル)*
- `00_目次.md` ✅
- `01_Vitestとはと環境構築.md` ✅
- `02_最初のテストとプロジェクト構成.md` ✅
- `03_アサーションとexpect完全ガイド.md` ✅
- `04_モックとスパイ.md` ✅
- `05_非同期処理とタイマーのテスト.md` ✅
- `06_カバレッジとUI・ブラウザモード.md` ✅
- `07_実践パターンとベストプラクティス.md` ✅
- `08_CI連携とデバッグ.md` ✅
- **補完候補**:
  - `09_設定ファイル深掘り.md` — vitest.config.ts のすべて
  - `10_Workspace機能.md` — モノレポでの使い方
  - `11_ブラウザモード詳細.md` — Playwright連携
  - `12_型テスト.md` — `expectTypeOf`
  - `13_移行ガイド_Jestから.md`

### Playwright/ ✅ *既存 (11ファイル)*
- `00_目次.md` ✅
- `01_Playwrightとはと環境構築.md` ✅
- `01_よくあるE2Eテストエラー集.md` ✅ *（⚠️ 番号重複）*
- `02_プロジェクト作成と最初のテスト.md` ✅
- `03_セレクターと要素操作.md` ✅
- `04_アサーションと待機.md` ✅
- `05_実践パターンとベストプラクティス.md` ✅
- `06_CIとデバッグ.md` ✅
- `07_公式ドキュメント詳解_基本編.md` ✅
- `08_Assertions完全ガイド.md` ✅
- `09_Advanced_Topics_実務テクニック.md` ✅
- `10_CI_MCP_自動化_外部記事リンク.md` ✅
- **補完候補**:
  - `11_Fixtureの使い方.md` — beforeEachの代替
  - `12_Auth_storageState.md`
  - `13_APIテスト機能.md` — request context
  - `14_Visualテスト.md` — toHaveScreenshot
  - `15_Component_Testing.md` — React/Vue コンポーネントを直接

### 将来の候補（必要に応じて）
- **TestingLibrary/** — React/Vue/Svelte 共通の考え方
- **MSW/** — ネットワークモック
- **Cypress/** — Playwrightとの比較のみ（運用は推奨しない）
- **Storybook/** — コンポーネント単位の動作確認

---

## 🔁 CI/ （既存フォルダ・空）
**テストを継続的に回す** ための仕組み。GitHub Actionsを基本線に。

### CIでの回し方/
- `CIでテストを回す基本.md`
- `GitHub_Actionsでテスト.md`
- `ジョブの並列化.md` — shard / matrix
- `キャッシュ戦略.md` — node_modules / browser
- `条件付き実行.md` — 変更されたパッケージだけ走らせる
- `プルリクのステータスチェック必須化.md`

### フレーク対策/
- `フレーキーテストとは.md`
- `原因の切り分け方.md` — タイミング / 共有状態 / ネットワーク
- `retryの是非.md` — 症状隠しになる危険
- `quarantine戦略.md` — 隔離して後で直す
- `並列実行で露呈するバグ.md`
- `E2Eのフレーク典型パターン.md`

### レポートと可視化/
- `テスト結果レポート.md` — JUnit XML / HTML
- `カバレッジレポート.md` — Codecov / Coveralls
- `Test_Failure_Annotations.md` — PR上での表示
- `Allure_Report.md`
- `フレーク率のトラッキング.md`

### 実行時間・コスト/
- `テスト実行時間の短縮.md`
- `E2Eの分割戦略.md`
- `PRごとに全部走らせるか.md` — 差分ベース実行
- `nightlyの使い分け.md`

---

## 🐛 Debugging/ （既存フォルダ・空）
**テストが落ちたときの型** を集める場所。

### 切り分けの型/
- `テストが落ちたときの最初の5手.md` — 再現 / 隔離 / 直近の変更 / ログ / モック確認
- `ローカルで再現しない時.md` — 環境差の列挙
- `特定の順序で落ちる時.md` — 状態汚染を疑う
- `並列実行だけで落ちる時.md`
- `CIだけで落ちる時.md` — タイムアウト / タイムゾーン / リソース

### ツール別のデバッグ手段/
- `Vitest_debug.md` — `--inspect-brk` / VS Code連携
- `Playwright_trace.md` — trace.zip の読み方
- `Playwright_UIモード.md`
- `スクリーンショット_動画の使い方.md`
- `console_log地獄からの脱出.md`

### ありがちな落ち方カタログ/
- `await忘れで非同期がすり抜ける.md`
- `タイマーを進めてない.md`
- `モックがクリアされていない.md`
- `テストデータが残っている.md`
- `スナップショットが古い.md`
- `DOMが描画されていない.md`
- `ネットワークモックのURLがマッチしてない.md`
- `タイムゾーン由来の日時比較失敗.md`

### ポストモーテム/
- `フレークインシデント記録フォーマット.md`
- `過去事例集.md`

---

## 📝 この領域の運用ルール

### テストを「書けば良い」から「戦略で回す」へ

- 数を増やすことが目的ではない
- **種別（Types）× 技法（Techniques）× 戦略（Strategy）** の3次元で考える
- 落ちる原因は **Debugging/** に必ず記録して再発を防ぐ

### QAノートとの住み分け

- `99_QAエンジニア向け教材/` → **QA視点**（手動含むテスト計画・観点表）
- `99_JSTQB_FL/` → **資格学習**
- `07_Testing/` → **開発者が書く自動テスト** を中心

重複しそうなら、QA視点は 99_QA に、コード寄りはここに。

---

## ⚠️ 既知の整理候補

- Playwright/ に **`01_` の番号が2つ**（`01_Playwrightとはと環境構築.md` と `01_よくあるE2Eテストエラー集.md`）→ 後者は `15_` 等に振り直しか Debugging へ移動
- CI/ と Debugging/ は **既存フォルダあるが中身なし** — 早めに種を蒔く価値大
- Techniques/ に **スナップショット** と **Testing Library系** の項が欲しい

---

## 🔗 関連領域

- `04_Tooling/Git/` — フック / Husky / lint-staged
- `06_Frameworks/React/` — コンポーネントテスト
- `08_QA/` — 手動テスト・品質保証
- `99_QAエンジニア向け教材/` — QA職の知識体系
- `99_JSTQB_FL/` — ISTQB系の資格
- `10_インフラとクラウド/` — CI/CDの基盤側
