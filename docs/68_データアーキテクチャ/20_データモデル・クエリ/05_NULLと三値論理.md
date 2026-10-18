---
title: NULLと三値論理
created: 2026-10-12
tags:
  - データベース
  - データモデル
---

# NULLと三値論理

[[MOC_データアーキテクチャ体系|📚 目次]] ｜ [[04_集約とウィンドウ関数|← 前へ]] ｜ [[06_SQLの実行順序|次へ →]]

> [!abstract] この記事で分かること
> - NULL が「値」ではなく「値がない／分からない」という印である理由
> - SQL の三値論理（TRUE / FALSE / UNKNOWN）の真理値表と、WHERE が TRUE しか通さないこと
> - `= NULL` が効かない理由と、`IS NULL`・`IS DISTINCT FROM`・`COALESCE` の使い方
> - `NOT IN` に NULL が混ざると 0 件になる罠と、集約関数と NULL の関係
> - そもそも NULL を減らすための設計
>
> **前提**：[[03_JOINとサブクエリ]]、[[04_集約とウィンドウ関数]] を読んでいると理解しやすいです。

## 1. ひとことで言うと

アンケートの「年収」欄が空欄だったとします。この人の年収は 0 円でしょうか？違います。**答えてくれなかったので分からない** のです。
SQL の NULL はこの「空欄」です。0 でも空文字でもなく、「ここに入るべき値を知らない（または当てはまらない）」という **印** です。そして「分からないもの」と何かを比べた結果もまた **「分からない（UNKNOWN）」** になります。SQL が TRUE / FALSE の 2 つではなく、UNKNOWN を加えた **三値論理** で動いているのはこのためです。

- NULL は値ではなく「値がない」という印
- NULL との比較は TRUE でも FALSE でもなく UNKNOWN
- WHERE は TRUE の行しか通さないので、UNKNOWN の行は **静かに消える**

## 2. NULL の意味と三値論理

### 2.1 NULL が生まれた理由

リレーショナルモデルを提唱した E.F. コッドは、欠けた情報を表すために NULL を導入しました。新入社員の電話番号をまだ聞いていないとき、`0` や `''` を入れると「電話番号 0 番」という **嘘のデータ** になり、集計にも混ざります。NULL は「知らないことを、知らないまま保存する」ための仕組みです。

ただし NULL には実は 2 つの意味が混ざっています。

| 意味 | 例 |
|---|---|
| 不明（値はあるが知らない） | 電話番号をまだ聞いていない |
| 該当なし（そもそも値が存在しない） | 独身の人の「配偶者名」、未発送の注文の「発送日時」 |

コッド自身も後にこの 2 つを区別する 4 値論理を提案しましたが、どの DB にも採用されず、SQL では両方とも同じ NULL です。

### 2.2 三値論理の真理値表

NULL を含む比較（`=`, `<`, `>` など）の結果は **UNKNOWN** です。UNKNOWN を含む論理演算は次のように決まります。考え方は「UNKNOWN は TRUE か FALSE のどちらか分からない値」で、どちらであっても結果が同じなら確定し、変わるなら UNKNOWN です。

**AND**（両方 TRUE のときだけ TRUE）

| AND | TRUE | FALSE | UNKNOWN |
|---|---|---|---|
| **TRUE** | TRUE | FALSE | UNKNOWN |
| **FALSE** | FALSE | FALSE | FALSE |
| **UNKNOWN** | UNKNOWN | FALSE | UNKNOWN |

**OR**（どちらか TRUE なら TRUE）

| OR | TRUE | FALSE | UNKNOWN |
|---|---|---|---|
| **TRUE** | TRUE | TRUE | TRUE |
| **FALSE** | TRUE | FALSE | UNKNOWN |
| **UNKNOWN** | TRUE | UNKNOWN | UNKNOWN |

**NOT**

| x | NOT x |
|---|---|
| TRUE | FALSE |
| FALSE | TRUE |
| UNKNOWN | **UNKNOWN** |

`FALSE AND UNKNOWN` は、UNKNOWN が何であっても FALSE なので FALSE。`TRUE OR UNKNOWN` は何であっても TRUE なので TRUE。そして **NOT UNKNOWN は UNKNOWN のまま** です。「知らない」を否定しても「知らない」なのです。

### 2.3 WHERE は TRUE しか通さない

ここが最重要ポイントです。

```
WHERE 条件 の評価結果      行は？
─────────────────────────────────
TRUE                  →  結果に残る
FALSE                 →  捨てられる
UNKNOWN               →  捨てられる   ← FALSE と同じ扱い
```

```sql
-- 例：products の category_id は 1, 1, 2, 3, NULL（福袋）
SELECT name FROM products WHERE category_id = 1;       -- 2 件
SELECT name FROM products WHERE category_id <> 1;      -- 2 件（ボールペン, USBケーブル）
-- 合計 4 件。福袋はどちらにも出てこない！
```

`category_id = 1` と `category_id <> 1` で全件を網羅したつもりでも、NULL の行は両方で UNKNOWN になって消えます。論理学でいう **排中律**（「A または A でない」は常に真）が SQL では成り立たないのです。エラーも警告も出ないので、気づかないうちに「集計から一部の行が抜けている」バグになります。

> [!note] CHECK 制約は逆
> WHERE は TRUE だけを通しますが、`CHECK` 制約は **FALSE のときだけ拒否** し、UNKNOWN は通します。`CHECK (price >= 0)` の列に NULL を入れても制約違反にならないのはこのためです。だから CHECK と NOT NULL はセットで使います。

## 3. `= NULL` が効かない理由と正しい書き方

### 3.1 なぜ `= NULL` はダメなのか

```sql
SELECT name FROM products WHERE category_id = NULL;   -- 常に 0 件
```

`category_id = NULL` は「category_id が、何か分からない値と等しいか？」という問いなので、答えは常に UNKNOWN です。**`NULL = NULL` ですら UNKNOWN** です（分からない値どうしが同じとは限らないから）。

### 3.2 IS NULL / IS NOT NULL

NULL かどうかを調べる専用の述語で、結果は必ず TRUE か FALSE になります。

```sql
SELECT name FROM products WHERE category_id IS NULL;       -- 福袋
SELECT name FROM products WHERE category_id IS NOT NULL;   -- 4 件
```

先ほどの「1 以外の全部」を NULL 込みで取るなら次のように書きます。

```sql
SELECT name FROM products WHERE category_id <> 1 OR category_id IS NULL;
```

### 3.3 IS DISTINCT FROM：NULL を「普通の値」として比較する

「変更があった行だけ更新したい」のような比較で、NULL を含めて「同じか違うか」を判定したいことがあります。

```sql
-- old と new が違うか？（NULL どうしは「同じ」、NULL と値は「違う」とみなす）
SELECT 1 IS DISTINCT FROM NULL;       -- true
SELECT NULL IS DISTINCT FROM NULL;    -- false
SELECT NULL IS NOT DISTINCT FROM NULL;-- true

-- 実例：在庫取り込み時、値が変わったときだけ更新
UPDATE products p SET category_id = s.category_id
FROM staging_products s
WHERE p.id = s.id
  AND p.category_id IS DISTINCT FROM s.category_id;
```

`<>` で書くと、片方が NULL の行で UNKNOWN になり更新漏れが起きます。

| a | b | `a = b` | `a IS NOT DISTINCT FROM b` |
|---|---|---|---|
| 1 | 1 | TRUE | TRUE |
| 1 | 2 | FALSE | FALSE |
| 1 | NULL | UNKNOWN | FALSE |
| NULL | NULL | UNKNOWN | TRUE |

> [!note] MySQL との違い
> MySQL は `IS DISTINCT FROM` に対応していない代わりに、NULL 安全な等価演算子 `<=>` があります（`a <=> b` が `a IS NOT DISTINCT FROM b` に相当）。

### 3.4 COALESCE：NULL を別の値に置き換える

`coalesce(a, b, c, ...)`：引数を左から見て、最初の NULL でない値を返す関数 です。表示や計算の直前で NULL を既定値に置き換えるのに使います。

```sql
SELECT name, coalesce(category_id::text, '未分類') AS category FROM products;

-- 算術演算は NULL が混ざると結果も NULL
SELECT 100 + NULL;                     -- NULL
SELECT price * coalesce(discount_rate, 1) FROM ...;   -- NULL なら割引なし扱い
```

逆に `nullif(a, b)` は「a と b が等しければ NULL、違えば a」を返し、0 除算の回避（`x / nullif(y, 0)`）によく使います。

## 4. NOT IN と NULL の罠

[[03_JOINとサブクエリ]] で見た「NOT IN が 0 件になる」現象を、三値論理で分解します。

```sql
-- 商品が 1 つもないカテゴリを探したい（正解は「食品」id=4）
SELECT name FROM categories
WHERE id NOT IN (SELECT category_id FROM products);   -- 0 件！
```

サブクエリの結果は `(1, 1, 2, 3, NULL)` です。`id NOT IN (1, 2, 3, NULL)` は次のように展開されます。

```
id NOT IN (1, 2, 3, NULL)
= id <> 1 AND id <> 2 AND id <> 3 AND id <> NULL

id = 4（食品）のとき:
= TRUE    AND TRUE    AND TRUE    AND UNKNOWN
= UNKNOWN                  ← AND の表より。WHERE で捨てられる

id = 1（本）のとき:
= FALSE   AND ...                     = FALSE   ← 捨てられる（正しい）
```

`id <> NULL` が必ず UNKNOWN なので、どの行も TRUE になれず **全滅** します。リストに NULL が 1 つ混ざるだけでクエリ全体が無言で無効化されるのです。

一方、肯定形の `IN` は `id = 1 OR id = 2 OR ... OR id = NULL` なので、一致するものがあれば TRUE OR UNKNOWN = TRUE となり、正しく動きます。罠は **NOT IN だけ** です。

対策は次のどちらかです。

```sql
-- ✅ 対策 1：NOT EXISTS を使う（推奨。NULL の影響を受けない）
SELECT name FROM categories c
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.category_id = c.id);

-- ✅ 対策 2：サブクエリから NULL を除く
SELECT name FROM categories
WHERE id NOT IN (SELECT category_id FROM products WHERE category_id IS NOT NULL);
```

今は NULL がない列でも、将来 NULL を許すように変わると突然壊れます。**否定の存在チェックは最初から NOT EXISTS** にしておくのが安全です。

## 5. 集約・並べ替え・UNIQUE と NULL

NULL の扱いは場所によって「等しくない」とみなされたり「同じ」とみなされたりします。一覧で押さえておきます。

| 場面 | NULL の扱い | 例 |
|---|---|---|
| `=`, `<>`, `<` など比較 | UNKNOWN | `NULL = NULL` は UNKNOWN |
| `count(*)` | 数える | 行そのものを数える |
| `count(列)`, `sum`, `avg`, `min`, `max` | **無視** | `avg` の分母にも入らない |
| 対象が 0 行（または全部 NULL）の `sum` / `avg` | **NULL を返す** | `coalesce(sum(x), 0)` で 0 に |
| `GROUP BY` / `DISTINCT` | **同じグループ** にまとめる | NULL のグループが 1 つできる |
| `ORDER BY` | PostgreSQL は **最大値扱い**（昇順で最後） | `NULLS FIRST` / `NULLS LAST` で指定可 |
| `UNIQUE` 制約 | **互いに異なる** とみなす | NULL を何行でも入れられる |
| 外部結合 | 相手がいない列が NULL で埋まる | 入れた覚えのない NULL が湧く |

`avg` が NULL を無視する点は特に注意です。

```sql
-- レビューの点数：5, 3, NULL（未評価）
SELECT avg(score) FROM (VALUES (5), (3), (NULL)) t(score);           -- 4（2 件の平均）
SELECT avg(coalesce(score, 0)) FROM (VALUES (5), (3), (NULL)) t(score); -- 2.67（未評価を 0 点扱い）
```

どちらが正しいかは業務の定義次第です。「未評価は平均に含めない」のか「0 点とみなす」のかを決めてから書きます。

> [!note] DB ごとの違い
> - **ORDER BY**：PostgreSQL は NULL を最大値として扱いますが、MySQL は最小値として扱います（昇順で先頭）。
> - **UNIQUE**：PostgreSQL・MySQL は NULL を複数許しますが、SQL Server は 1 つしか許しません。PostgreSQL 15 以降は `UNIQUE NULLS NOT DISTINCT` で NULL も 1 つに制限できます。
> - **Oracle** は長さ 0 の文字列 `''` を NULL として扱います。

## 6. NULL を避ける設計

NULL は欠損という現実を表すので完全には消せませんが、**NULL を許す列は最小限にする** のが実務の定石です。

1. **NOT NULL をデフォルトにする**：列を作るときはまず NOT NULL を付け、「本当に値がない状態がありうるか」を考えてから外す。
2. **意味のある既定値を使う**：在庫数は「不明」ではなく 0 から始まるなら `NOT NULL DEFAULT 0`。ただし「不明」と「0」を混同する既定値（年収の 0 など）は嘘のデータになるので避ける。
3. **状態を明示する列に分ける**：「発送日時が NULL = 未発送」と暗黙に表すより、`status` 列で状態を持つ方がクエリが読みやすい。
4. **任意項目は別テーブルに分ける**：多くのユーザーが入力しない属性は 1対1 の別テーブルに出せば、本体テーブルに NULL が並ばない（「行がない」で表現する）。
5. **クエリで NULL を明示的に扱う**：`IS NULL`、`IS DISTINCT FROM`、`coalesce`、`NOT EXISTS` を使い、「この列は NULL になりうるか」を常に意識する。

```sql
-- 例：注文の発送日時。未発送は NULL を許すが、状態との整合性を CHECK で守る
ALTER TABLE orders ADD COLUMN shipped_at TIMESTAMPTZ;
ALTER TABLE orders ADD CONSTRAINT shipped_consistency
  CHECK ((status = 'shipped') = (shipped_at IS NOT NULL));
```

制約設計の詳細は [[04_キーと制約の設計]] で扱います。

## よくある誤解・つまずき

- ❌ **NULL は 0 や空文字と同じ** → ✅ NULL は「値がない」という印です。`0`、`''` とは別物で、比較結果も違います（Oracle の `''` だけは例外）。
- ❌ **`WHERE x = NULL` で NULL の行が取れる** → ✅ 常に UNKNOWN で 0 件です。`IS NULL` を使います。
- ❌ **`x = 1` と `x <> 1` で全行がカバーされる** → ✅ NULL の行はどちらにも入りません。
- ❌ **NOT IN と NOT EXISTS は同じ結果** → ✅ リストに NULL があると NOT IN は 0 件。否定は NOT EXISTS。
- ❌ **`avg` は全行の平均** → ✅ NULL を除いた行の平均です。分母が変わるので、NULL を 0 扱いしたいなら `coalesce` してから集計します。

## まとめ

- NULL は「値が分からない／当てはまらない」印で、NULL との比較は UNKNOWN になる
- SQL は三値論理。NOT UNKNOWN は UNKNOWN、WHERE は TRUE の行だけを通す
- NULL の判定は `IS NULL`、NULL を含めた等価比較は `IS [NOT] DISTINCT FROM`、置き換えは `coalesce`
- `NOT IN` のリストに NULL があると全行が消える。否定の存在チェックは `NOT EXISTS`
- 集約関数は NULL を無視し、0 行の `sum` は NULL。NOT NULL を基本にした設計で NULL を減らす

## 確認クイズ

1. `SELECT count(*) FROM users WHERE phone = '090-0000-0000' OR phone <> '090-0000-0000';` が users の全件数より少なくなりました。なぜですか？
> [!tip]- 答え
> phone が NULL の行は、両方の比較が UNKNOWN になり `UNKNOWN OR UNKNOWN = UNKNOWN` で WHERE に捨てられるためです。差の件数が phone が NULL のユーザー数です。

2. `NULL AND FALSE`、`NULL OR TRUE`、`NOT NULL`（論理値として）の結果は？
> [!tip]- 答え
> `FALSE`、`TRUE`、`UNKNOWN`（SQL 上は NULL）です。UNKNOWN が TRUE でも FALSE でも結果が変わらない場合は確定し、変わる場合は UNKNOWN のままです。

3. 「前回の値から変わった行だけ」を `WHERE old_value <> new_value` で探すと、一部の変更が漏れました。原因と修正方法は？
> [!tip]- 答え
> 片方が NULL（NULL → 値、値 → NULL の変更）のとき `<>` は UNKNOWN になり行が捨てられるためです。`WHERE old_value IS DISTINCT FROM new_value` に書き換えます（MySQL なら `NOT (old_value <=> new_value)`）。

## 関連ノート

- [[03_JOINとサブクエリ]] — NOT IN と NOT EXISTS、外部結合で生まれる NULL
- [[04_集約とウィンドウ関数]] — `count(*)` と `count(列)` の違い
- [[01_リレーショナルモデルとテーブル]] — SQL のテーブルが理論の「関係」とずれる点
- [[04_キーと制約の設計]] — NOT NULL・CHECK を使った設計
- [[【SQL】NULLが気持ち悪い数学的理由｜真でも偽でもない第3の値]] — （クリップ）コッドの NULL 導入、排中律の崩壊、NOT IN・ユニーク制約・Oracle の空文字などの事故簿を歴史とともに解説

## 参考

- [PostgreSQL Documentation: Comparison Functions and Operators](https://www.postgresql.org/docs/current/functions-comparison.html)
- [PostgreSQL Documentation: Conditional Expressions（COALESCE, NULLIF）](https://www.postgresql.org/docs/current/functions-conditional.html)
- [PostgreSQL Documentation: Subquery Expressions（NOT IN と NULL）](https://www.postgresql.org/docs/current/functions-subquery.html)
- [PostgreSQL Documentation: Constraints（UNIQUE と NULLS NOT DISTINCT）](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [MySQL 8.0 Reference Manual: NULL-safe equal <=>](https://dev.mysql.com/doc/refman/8.0/en/comparison-operators.html)
