# 05_Languages（言語別）目次

特定のプログラミング言語そのものに関するノート。
**この領域の4カテゴリ** に留め、フレームワークは `06_Frameworks/` に分離する。

| カテゴリ | 何を書く？ |
|---------|----------|
| **文法** | 変数・制御構文・関数・クラス・モジュール 等、言語仕様 |
| **標準ライブラリ** | 追加パッケージなしで使える組み込み機能 |
| **よくある罠** | ハマりポイント、仕様の落とし穴、なぜそうなるか |
| **レシピ** | 「〇〇したいとき、こう書く」の小さな実用例集 |

### 書くか迷ったときの判断

| 内容 | どこに書く？ |
|------|-----------|
| 言語の仕様・文法 | `05_Languages/<言語>/文法/` |
| React / Express / Django 等 | `06_Frameworks/` |
| npm / pip / uv 等のツール | `04_Tooling/Build/` |
| SQLのDB固有方言（PostgreSQL等） | `08_データベース/` |

---

## 🟨 JavaScript/
ブラウザとNode.jsの共通言語。既存ファイルが最も充実している領域。

### 文法/
既存のチュートリアル形式ファイルをこのカテゴリに寄せる。
- `01-basics.md` ✅ — 実行モデル・コメント・基本構造
- `02-setup.md` ✅ — Node/ブラウザでの実行環境
- `03-variables.md` ✅ — `var` / `let` / `const` とスコープ
- `04-operators.md` ✅ — 比較（`==` vs `===`）・スプレッド
- `05-conditions.md` ✅ — 分岐・truthyとfalsy
- `06-loops.md` ✅ — for / while / for...of / for...in
- `07-functions.md` ✅ — 関数宣言/式/アロー・this
- `08-arrays.md` ✅ — map / filter / reduce / 破壊的 vs 非破壊的
- `09-objects.md` ✅ — リテラル・分割代入・プロトタイプ
- `js-functions.md` ✅ — 関数補足メモ
- `15-named-imports.md` ✅ — import/export
- `16-if-vs-switch-readability.md` ✅
- `プロトタイプチェーン.md`
- `クロージャ.md`
- `非同期処理.md` — Promise / async-await / イベントループ
- `クラスと継承.md`
- `モジュール.md` — ESM vs CommonJS

### 標準ライブラリ/
- `String.md` — 文字列操作メソッド
- `Array.md` — 配列メソッド一覧
- `Object.md` — `Object.keys` / `entries` / `fromEntries`
- `Map_Set.md`
- `Date.md` — 日付操作の落とし穴と Temporal
- `JSON.md` — parse / stringify
- `Math_Number.md`
- `RegExp.md` — 正規表現
- `Promise_API.md` — all / allSettled / race / any

### ブラウザAPI/ （既存ファイルを集約）
- `10-dom.md` ✅
- `17-browser-apis.md` ✅
- `18-browser-developer-knowledge.md` ✅
- `19-common-browser-apis-practical.md` ✅
- `13-search-functions.md` ✅
- `14-search-advanced.md` ✅
- `イベントとデフォルト動作の防止.md` ✅
- `fetch_API.md`
- `Storage_API.md` — localStorage / sessionStorage / IndexedDB
- `History_API.md`

### よくある罠/
- `==と===の違い.md` — 暗黙変換の恐怖
- `thisの挙動.md` — 関数呼び出し形式で変わる
- `hoisting_巻き上げ.md`
- `浮動小数点誤差.md` — `0.1 + 0.2 !== 0.3`
- `null_undefined_NaN.md` — それぞれの違いと検査
- `配列の空要素.md` — `[1,,3]` の怪
- `for_in_for_ofの違い.md`
- `オブジェクト参照の罠.md` — スプレッドは浅いコピー
- `非同期の順序バグ.md`
- `typeof_nullはobject.md` — 歴史的バグ

### レシピ/
- `配列の重複削除.md` — `[...new Set(arr)]`
- `オブジェクトのディープコピー.md` — `structuredClone`
- `デバウンスとスロットル.md`
- `配列のシャッフル.md`
- `日付フォーマット.md`
- `クエリ文字列の操作.md` — URLSearchParams
- `エラーハンドリング.md`
- `環境判定.md` — Node / ブラウザ

### 既存トップレベル
- `00-JavaScript index.md` ✅
- `11-practice.md` ✅
- `12-js-ecosystem.md` ✅ — npm / バンドラ等の概観

---

## 🟦 TypeScript/
JavaScriptに型を載せた上位互換。

### 文法/
- `01-basics.md` ✅
- `02-setup.md` ✅ — tsconfig の基本
- `03-types.md` ✅ — プリミティブ型
- `04-interfaces.md` ✅
- `04-TypeScriptの型.md` ✅
- `05-classes.md` ✅
- `06-functions.md` ✅
- `07-generics.md` ✅
- `07-modules.md` ⚠️ *重複番号*
- `08-advanced-types.md` ✅
- `08-modules.md` ⚠️ *重複番号*
- `09-advanced-types.md` ⚠️ *重複番号*
- `09-decorators.md` ⚠️ *重複番号*
- `10-decorators.md` ⚠️ *重複番号*
- `10-utility-types.md` ⚠️ *重複番号*
- `13-type-assertions.md` ✅
- `型推論の仕組み.md`
- `構造的部分型_duck_typing.md`

### ユーティリティ型/
- `11-utilities.md` ✅
- `Partial_Required_Readonly.md`
- `Pick_Omit.md`
- `Record.md`
- `Exclude_Extract.md`
- `ReturnType_Parameters.md`
- `自作ユーティリティ型.md`

### 高度な型/
- `条件型.md` — `T extends U ? X : Y`
- `mapped_types.md`
- `template_literal_types.md`
- `infer.md`
- `型レベルプログラミング入門.md`

### よくある罠/
- `any_unknown_never.md` — 3つの違い
- `as_asserting_dangers.md` — 型アサーションの危険性
- `non-null-assertion.md` — `!` の乱用
- `型と値の混同.md`
- `exactOptionalPropertyTypes.md`
- `共変と反変.md` — 関数型での挙動
- `strict系オプション.md`
- `enum_vs_const_assertions.md`

### レシピ/
- `型ガードの書き方.md` — `is` / `in` / `instanceof`
- `discriminated_union.md` — タグ付き共用体
- `オプショナルチェーンとnullish合体.md`
- `ブランド型.md` — 名義的な型付け
- `Result型の自作.md`
- `zod等との組み合わせ.md`
- `宣言ファイル_d_ts_の書き方.md`

### ベストプラクティス/
- `tsconfig推奨設定.md`
- `any禁止の是非.md`

### 既存トップレベル
- `00-TypeScript index.md` ✅

---

## 🐍 Python/
汎用スクリプト・データ処理・機械学習の定番。

### 文法/
- `Python入門.md` — 実行モデル・インデント
- `変数とオブジェクト.md` — 全てはオブジェクト
- `数値と文字列.md`
- `リスト_タプル_セット_辞書.md` — 4大コレクション
- `制御構文.md` — if / for / while / match
- `関数.md` — 引数の種類・デフォルト値の罠
- `クラスと継承.md` — self / super / MRO
- `モジュールとパッケージ.md` — import の仕組み
- `例外処理.md` — try/except/else/finally
- `デコレータ.md`
- `ジェネレータとyield.md`
- `内包表記.md` — list / dict / set / generator
- `with文とコンテキストマネージャ.md`
- `型ヒント.md` — PEP 484 系

### 標準ライブラリ/
- `collections.md` — Counter / defaultdict / deque / namedtuple
- `itertools.md`
- `functools.md` — lru_cache / partial / reduce
- `pathlib.md` — モダンなファイルパス操作
- `os_sys.md`
- `datetime.md` — タイムゾーン含む
- `json.md`
- `re_正規表現.md`
- `logging.md`
- `argparse.md` — CLI 引数
- `typing.md` — 型ヒント用モジュール
- `dataclasses.md`
- `asyncio.md` — 非同期
- `subprocess.md`
- `unittest.md`

### よくある罠/
- `ミュータブルなデフォルト引数.md` — 最頻出の罠
- `is_と_==の違い.md`
- `浅いコピーと深いコピー.md` — `copy.deepcopy`
- `遅延バインディング.md` — ループ内でのクロージャ
- `整数キャッシュ.md` — `is` が True になる範囲
- `循環import.md`
- `__init__.py_の役割.md`
- `globalとnonlocal.md`
- `GIL.md` — マルチスレッドの制約
- `属性アクセスの順序.md` — __getattr__ vs __getattribute__

### レシピ/
- `ファイル読み書き.md` — open / with
- `辞書のマージ.md` — `dict | dict`
- `リストの重複削除.md` — 順序保持
- `日付フォーマット.md`
- `環境変数の読み込み.md` — python-dotenv
- `CSVとJSONの扱い.md`
- `APIリクエスト.md` — requests / httpx
- `並列処理.md` — threading / multiprocessing / concurrent.futures
- `ロギング設定.md`
- `エラー時リトライ.md`

---

## 🗃️ SQL/
データベース操作の共通言語。

### 文法/
- `SQL入門.md` — 宣言的言語の考え方
- `SELECT基礎.md` — 射影・選択・並び替え
- `WHERE句.md` — 条件・LIKE・IN・BETWEEN
- `JOIN.md` — INNER / LEFT / RIGHT / FULL / CROSS
- `GROUP_BYとHAVING.md`
- `集約関数.md` — COUNT / SUM / AVG / MIN / MAX
- `サブクエリ.md` — スカラー/相関/EXISTS
- `INSERT_UPDATE_DELETE.md`
- `CREATE_ALTER_DROP.md` — DDL基礎
- `トランザクション.md` — BEGIN / COMMIT / ROLLBACK
- `ビュー.md`
- `インデックス基礎.md`
- `制約.md` — PRIMARY KEY / FOREIGN KEY / UNIQUE / CHECK / NOT NULL
- `ウィンドウ関数.md` — OVER / PARTITION BY
- `CTE_WITH句.md`

### 標準機能/
- `文字列関数.md`
- `日付関数.md`
- `数値関数.md`
- `条件分岐_CASE.md`
- `NULL_の扱い.md`
- `キャスト.md`

### よくある罠/
- `NULLとの比較.md` — `= NULL` は常に不明
- `JOIN種別の誤り.md` — INNER と LEFT の混同
- `GROUP_BYの必要カラム.md`
- `COUNT_DISTINCT_性能.md`
- `サブクエリと相関サブクエリ.md` — 性能の差
- `SELECT__の罠.md` — 本番では避ける
- `暗黙の型変換.md`
- `N+1問題.md` — アプリ側含めた話
- `UPDATEとDELETEのWHERE忘れ.md`
- `トランザクション分離レベル.md` — READ COMMITTED / REPEATABLE READ

### レシピ/
- `上位N件を取得.md` — LIMIT / TOP / FETCH
- `ページネーション.md` — OFFSET / キー方式
- `重複レコードの検出.md`
- `欠損データの埋め方.md` — COALESCE
- `ピボットテーブル.md`
- `日付範囲の生成.md`
- `ランキング.md` — RANK / DENSE_RANK / ROW_NUMBER
- `再帰クエリ.md` — 階層構造の扱い
- `UPSERT.md` — INSERT ... ON CONFLICT

> DB製品固有の方言（PostgreSQL / MySQL / SQLite）は `08_データベース/` へ。

---

## 📐 HTML/CSS/ （`01_HTML/` `02_CSS/` として既存）

HTMLとCSSは「プログラミング言語」とは違うが、既存構成を尊重してここに置く。
将来的に `99_Web基礎（フロントエンド入門）` との統合も検討。

### 01_HTML/ ✅ *既存・充実*
- `00-HTML index.md` / `01-basics.md` 〜 `09-forms.md` / `10-practice.md` / `buttonタグの使い方.md`
- 補足候補: セマンティクス / アクセシビリティ / メタタグとOGP / SEOの最低限

### 02_CSS/ ✅ *既存・充実*
- `00-CSS index.md` / `01-basics.md` 〜 `11-optimization.md`、および `02_CSS/Tailwind/`（`目次` / `11-tailwind-basics` など）
- 補足候補: CSS設計（BEM/OOCSS）/ CSS変数活用 / コンテナクエリ / :has() 等の新機能

---

## 🌐 Other/ （未作成）
将来触れる可能性がある言語の置き場。最初から構造を作り込まず、必要になったら作る。

候補例（必要性が生まれたら追加）:
- `Go/` — 並行処理・静的型・シンプルな言語仕様
- `Rust/` — メモリ安全・所有権・パフォーマンス
- `Java_Kotlin/` — JVM 系
- `C_Cpp/` — 低レイヤー・組み込み
- `Ruby/` — スクリプト・Rails 周辺
- `Shell/` — Bash/Zsh スクリプト（※ [03_DevEnv/Shell](../03_DevEnv/) と住み分けに注意）

> **判断基準**: 「その言語で **継続的に書く** ことが決まったら」フォルダを作る。
> 単発の素振り・翻訳は `00_Inbox/` で十分。

---

## ⚠️ 既知の修正候補

### TypeScript/ の番号重複
同じ番号のファイルが複数ある:
- `07-generics.md` と `07-modules.md`
- `08-advanced-types.md` と `08-modules.md`
- `09-advanced-types.md` と `09-decorators.md`
- `10-decorators.md` と `10-utility-types.md`

内容が重複している場合は統合、残すなら番号を振り直すと読みやすい。

### HTML/CSS の位置づけ
`01_HTML/` `02_CSS/` のプレフィックスがあるのは、学習順を示すため？
それとも整理途中の名残？ 方針に応じて維持 or リネーム。

---

## 🔗 関連領域

- `06_Frameworks/` — React / Vue / Express / Django 等
- `04_Tooling/Build/` — npm / pnpm / pip / uv
- `08_データベース/` — SQL方言・DB製品固有の話
- `99_Web基礎（フロントエンド入門）/` — HTML/CSS/JSの入門的統合
- `99_コーディング規約とベストプラクティス/` — 言語横断の書き方指針
