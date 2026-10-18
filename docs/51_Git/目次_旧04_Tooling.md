# 04_Tooling（汎用ツール：横断カテゴリ）目次

特定の言語・フレームワークに縛られず、**複数の領域をまたいで使う道具** を置く場所。

「ツール」は際限なく増える性質があるため、
**`03_DevEnv`（環境構築）とは分離**、さらに内部も **目的別カテゴリ** に切って破綻を防ぐ。

| カテゴリ | 何のため？ |
|---------|-----------|
| **Git** | ソース管理・協業 |
| **CLI** | ターミナルでの高速作業 |
| **Containers** | 実行環境を閉じ込めて可搬化 |
| **Build** | パッケージ管理・ビルド・依存解決 |
| **Docs** | ドキュメント作成・図示・自動生成 |
| **API Client** | API疎通確認・ドキュメント化 |
| **Analytics** | Web計測（GA4 + GTM）・LPのCV計測 |

---

## 🌿 Git/
既に章立てが充実している領域。構成を尊重しつつ、空カテゴリを補完する。

### 01-基本編/ ✅ *既存*
- `01-Gitとは.md` ✅
- `02-Gitのインストール.md` ✅
- `03-リポジトリの作成と初期化.md` ✅
- `04-ファイルの追加とコミット.md` ✅
- `05-ブランチの操作.md` ✅
- `06-リモートリポジトリとの連携.md` ✅

### 02-応用編/ ✅ *既存*
- `01-マージとリベース.md` ✅
- `02-変更の取り消しと修正.md` ✅
- `03-スタッシュとチェリーピック.md` ✅
- `04-タグとリリース管理.md` ✅
- `05-サブモジュールとサブツリー.md` ✅
- `06-Gitフック.md` ✅

### 03-ワークフロー編/ ✅ *既存*
- `01-Git-Flow.md` ✅
- `02-GitHub-Flow.md` ✅
- `03-Trunk-Based-Development.md` ✅

### 04-トラブルシューティング編/ ✅ *既存*
- `01-よくある問題と解決方法.md` ✅
- `02-リフログの活用.md` ✅
- `03-パフォーマンスの最適化.md` ✅

### 05-実務編/ ✅ *既存*
- `00-IssueとProjectの違い.md` ✅
- `01-GitHub-Issuesでタスク管理.md` ✅
- `02-GitHub-Projectsでカンバンボード管理.md` ✅
- `03-マイルストーンとラベルの活用.md` ✅
- `04-GitHub-Actionsによる自動化.md` ✅
- `05-実務的なワークフロー.md` ✅

### ブランチ戦略/ （空フォルダ）
- `ブランチ戦略の選び方.md` — チーム規模とリリース頻度で選ぶ
- `mainブランチ保護.md` — required reviews / status checks
- `機能ブランチ命名規則.md`
- `長寿命ブランチのアンチパターン.md`
- `ブランチ戦略とCICDの関係.md`

### 運用/ （空フォルダ）
- `コミットメッセージ規約.md` — Conventional Commits
- `プルリクのテンプレート.md`
- `コードレビューの観点.md`
- `マージ戦略.md` — merge / squash / rebase の選択
- `大規模リポジトリの運用.md` — monorepo / LFS
- `複数リポジトリ管理.md` — ghq / gh repo

### トップレベル資料 ✅ *既存*
- `README.md` ✅
- `00-GitHub用語解説.md` ✅
- `01-GitHubタブ解説.md` ✅
- `02-Git開発サイクル（初心者向け）.md` ✅
- `Git 研修【MIXI 25新卒技術研修】.md` ✅

---

## 💻 CLI/（現 `CommandLineInterface/`）
ターミナルで作業を加速する汎用ツール群。

### 検索・フィルタ/
- `ripgrep_rg.md` — grep の代替、デフォルトで .gitignore 尊重
- `fd.md` — find の代替、シンプルで高速
- `fzf.md` — インタラクティブ絞り込み（cd / git / history と連携）
- `grep_find_との比較.md` — どれをいつ使うか

### テキスト処理/
- `jq.md` — JSON の整形・抽出・変換
- `yq.md` — YAML / TOML 版 jq
- `awk_sed_基礎.md` — 古典だが強力
- `sd.md` — sed の代替（わかりやすい置換）

### ファイル・ディレクトリ/
- `bat.md` — cat の色付き版、シンタックスハイライト
- `exa_eza.md` — ls の代替
- `tree.md` — ディレクトリツリー表示
- `rsync.md` — 差分コピー・同期
- `tar_gzip_zip.md` — アーカイブ操作

### システム観察/
- `htop_btop.md` — top の代替
- `watch.md` — コマンドの定期実行監視
- `tmux.md` — セッション分割・永続化
- `curl_httpie.md` — HTTP クライアント

### タスクランナー/
- `make.md` — Makefile の基礎
- `just.md` — make のモダンな代替
- `task_Taskfile.md` — YAMLベースのランナー
- `使い分けの指針.md`

### その他の必携/
- `gh_GitHub_CLI.md`
- `jq_fzf_組み合わせレシピ.md` — 実用的な連携例
- `シェルのパイプ哲学.md` — 小さな道具を繋ぐ文化

---

## 🐳 Containers/
環境を閉じ込めて再現可能にする仕組み。

### Docker/ ✅ *既存*
- `Dockerとは.md` ✅
- `コンテナとイメージ.md` ✅
- `Dockerの基本コマンド.md` ✅
- `Dockerfile作成.md` ✅
- `docker-compose基礎.md` ✅
- `マルチステージビルド.md`
- `イメージサイズの最適化.md` — alpine / distroless
- `.dockerignore.md`
- `ボリュームとバインドマウント.md`
- `ネットワーク.md`
- `レイヤーキャッシュの仕組み.md`
- `本番向けベストプラクティス.md`

### compose/ （空フォルダ）
- `docker-compose_yml書き方.md`
- `複数サービス構成.md`
- `環境変数と_env.md`
- `開発用compose.override.md`
- `depends_on_healthcheck.md`
- `本番で使う場合の注意.md` — Swarm / Kubernetes との関係

### 周辺/
- `Docker_Desktopの代替.md` — Rancher Desktop / colima / Podman
- `BuildKit.md`
- `コンテナレジストリ.md` — Docker Hub / GHCR / ECR
- `Kubernetesへの橋渡し.md`

---

## 🔨 Build/
パッケージ管理・依存解決・ビルドの考え方。

### node_pnpm/ （空フォルダ）
- `npm_yarn_pnpm比較.md`
- `package_json解説.md` — scripts / dependencies / devDependencies
- `package-lock_yarn-lock_pnpm-lock.md` — ロックファイルの役割
- `semverの読み方.md` — `^` `~` の違い
- `pnpmの特徴.md` — ハードリンク・ディスク節約
- `workspace_monorepo.md` — pnpm workspaces
- `npx_pnpm_dlx.md` — 一時実行
- `.nvmrc_volta_fnm.md` — Node バージョン管理

### Python_uv/ （現 `Pyrhon_uv/` ← ⚠️ タイポあり）
- `Python環境管理の歴史.md` — venv / pip / poetry / rye / uv
- `uv入門.md` — 高速な統合ツール
- `pyproject_toml.md`
- `依存解決の仕組み.md`
- `仮想環境.md` — venv / virtualenv
- `pipxとuv_tool.md` — CLIツールのインストール
- `pyenv.md` — Python自体のバージョン管理

### ビルド概念/
- `ビルドとは.md` — ソースから成果物への変換
- `コンパイル_トランスパイル_バンドル.md`
- `依存関係とロックファイル.md` — なぜ必要か
- `ビルド再現性.md` — reproducible build
- `キャッシュ戦略.md` — ローカル / CI での使い分け
- `環境変数のビルド時埋め込み.md`

### バンドラ・タスクランナー/
- `Webpack_Vite_esbuild_比較.md`
- `Vite入門.md`
- `tsconfigの考え方.md`
- `モノレポツール.md` — Turborepo / Nx

---

## 📝 Docs/
ドキュメントを **書く・図示する・生成する** ための道具。

### Markdown/ （空フォルダ）
- `Markdown基本記法.md`
- `GFM_GitHub_Flavored_Markdown.md` — 表 / タスクリスト / 絵文字
- `コードブロックとシンタックスハイライト.md`
- `リンクと画像.md` — 相対パス / オブシディアン記法
- `Obsidian独自記法.md` — wikilink / callout / プロパティ
- `Markdownリンター.md` — markdownlint / textlint
- `PrettierでMarkdown整形.md`

### Mermaid/ （空フォルダ）
- `Mermaid入門.md`
- `フローチャート.md` — `graph TD / LR`
- `シーケンス図.md`
- `クラス図.md`
- `ER図.md`
- `ガントチャート.md`
- `状態遷移図.md`
- `GitHub_Obsidianでの表示.md`

### 生成ドキュメント/
- `ドキュメント生成ツール比較.md` — TypeDoc / Sphinx / pdoc / rustdoc
- `OpenAPI_Swagger.md` — API仕様からドキュメント生成
- `Docusaurus.md`
- `MkDocs.md`
- `Astro_Starlight.md`
- `docs_as_code.md` — ドキュメントをコードと同じリポジトリで管理

### 図解ツール/
- `draw_io.md`
- `Excalidraw.md`
- `PlantUML.md`
- `Mermaid_PlantUML_比較.md`

---

## 🌐 API_Client/
API の疎通確認・ドキュメント化・共有。

### Postman/ ✅ *既存 (空フォルダ)*
- `Postman入門.md` — コレクション / 環境 / 変数
- `環境変数とシークレット.md`
- `テストスクリプト.md` — pm.test によるアサーション
- `Pre-request_Script.md`
- `チーム共有とワークスペース.md`
- `CLIでの実行.md` — Newman
- `OpenAPIからのインポート.md`

### Insomnia/
- `Insomnia入門.md`
- `Postmanとの比較.md`
- `環境変数とテンプレートタグ.md`
- `プラグイン.md`

### その他のクライアント/
- `Bruno.md` — ローカルファイルベースで Git 管理可能
- `Hoppscotch.md` — OSS / Web ベース
- `HTTPie.md` — CLIで直感的
- `curl基礎.md` — CLIの標準
- `REST_Client_VSCode拡張.md` — `.http` ファイルで管理

### 設計・共有/
- `OpenAPI_Swagger.md` — スキーマ駆動での API 定義
- `mockサーバ.md` — Prism / Mockoon
- `API仕様の版管理.md`
- `コレクションの置き場.md` — リポジトリ同梱 vs 専用ツール

---

## 📊 Analytics/
GA4（Googleアナリティクス4）と GTM（Googleタグマネージャー）を中心とする計測領域。

### GoogleAnalytics/
- `01_GA4とは.md` — GA4の世界観・用語マップ
- `02_GA4の導入手順.md` — アカウント作成〜計測ID取得
- `03_イベント・パラメータ・ユーザープロパティ.md`
- `04_主要レポートと指標.md` — エンゲージメント率等
- `05_キーイベント(コンバージョン)設定.md`
- `06_2026年の新機能とプライバシー対応.md` — Analytics Advisor / Consent Mode v2

### GoogleTagManager/
- `01_GTMとは.md`
- `02_GTMの導入手順.md`
- `03_タグ(Tags)の基礎.md`
- `04_トリガー(Triggers)の基礎.md`
- `05_変数(Variables)の基礎.md`
- `06_データレイヤー(dataLayer).md`
- `07_プレビューモードとデバッグ.md`
- `08_命名規則_運用ルール.md` — タグ/トリガー/変数/イベントの命名辞書

### 実務編_LPでのCV計測/
- `00_LP計測の全体像.md`
- `01_CTAボタンのクリック計測.md`
- `02_フォーム送信完了の計測.md` — LPの最重要CV
- `03_電話番号タップ・メールリンクの計測.md`
- `04_スクロール率・滞在時間の計測.md`
- `05_外部リンク・ファイルダウンロードの計測.md`
- `06_よくあるトラブルとデバッグ.md`

### GoogleAds/
- `00_Google広告とは.md`
- `01_アカウント作成と初期設定.md`
- `02_キャンペーン種別の選び方.md` — 検索/P-MAX/AI Max/Demand Gen
- `03_コンバージョン設定とGA4連携.md` — 拡張CVと二重カウント防止
- `04_GTMでの広告タグ設置.md` — コンバージョンリンカー等
- `05_リマーケティングとオーディエンス.md`
- `06_2026年の新機能_AIMaxとP-MAX.md` — Power Pack構成
- `07_LP運用での広告実務.md`

→ 各フォルダの `目次.md` はなく、`Analytics/目次.md` に全体ロードマップを集約。

---

## 📝 この領域の運用ルール

### 「ツール」はどんどん増える前提

ひとつの道具箱（`道具.md` / `便利ツール.md`）にまとめない。
**カテゴリで切っておけば**、新しい道具が出ても置き場所に迷わない。

### 新しいツールを書き足すときの判断

| 問い | Yes なら... |
|------|-----------|
| 複数言語で使う？ | `04_Tooling` に入れる |
| 特定言語専用？ | `05_Languages/<言語>/` に入れる |
| 環境構築用？ | `03_DevEnv` に入れる |
| インフラ向け？ | `10_インフラとクラウド` に入れる |

### ツール単体の紹介 vs 概念

- **ツール単体**: `xxx.md`（例: `ripgrep.md`）
- **概念・選び方**: 冒頭に置く（例: `ビルドとは.md`）

---

## ⚠️ 既知の修正候補

- `Build/Pyrhon_uv/` → `Build/Python_uv/` （タイポ）
- `CommandLineInterface/` → `CLI/` とリネームすると短くて書きやすい（ただしリネームは既存参照への影響を確認してから）

---

## 🔗 関連領域

- `03_DevEnv/` — OS・シェル・エディタの土台
- `05_Languages/` — 言語別のツール（pip / npm / go mod 等）
- `10_インフラとクラウド/` — Kubernetes / Terraform / CI/CD
- `12_チーム開発とキャリア/` — コードレビュー・開発文化
