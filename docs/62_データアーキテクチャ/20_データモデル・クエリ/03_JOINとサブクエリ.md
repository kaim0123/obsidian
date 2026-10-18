---
title: JOINとサブクエリ
created: 2026-10-12
tags:
  - データベース
  - データモデル
---

# JOINとサブクエリ

[[MOC_データアーキテクチャ体系|📚 目次]] ｜ [[02_SQLの基本操作（CRUD）|← 前へ]] ｜ [[04_集約とウィンドウ関数|次へ →]]

> [!abstract] この記事で分かること
> - INNER / LEFT / RIGHT / FULL / CROSS / 自己結合が「どの行とどの行を組み合わせるか」
> - JOIN で行が増えて合計金額が膨らむ問題と、その避け方
> - サブクエリ 4 種（スカラー・IN・EXISTS・相関）の使い分け
> - EXISTS と IN の違い（特に NOT のとき）
> - CTE（WITH 句）で長いクエリを読みやすく分解する方法
>
> **前提**：[[01_リレーショナルモデルとテーブル]]、[[02_SQLの基本操作（CRUD）]] を読んでいると理解しやすいです。

## 1. ひとことで言うと

前回までで、データは「ユーザー」「注文」「商品」と別々の表に分けて保存しました。でも画面に出したいのは「山田さんが SQL入門 を 1 冊買った」のように **表をまたいだ情報** です。
JOIN（結合）は、2 つの表の行を **条件に合うものどうしでペアにして 1 行に並べる** 操作です。合コンの席決めに似ています。「同じ趣味の人どうしを隣に座らせる」が INNER JOIN、「相手が見つからなくても参加者全員は席に着かせる」が LEFT JOIN です。

- JOIN は **行と行の組み合わせ**。条件に合うペアの数だけ結果の行ができる
- 外部結合（LEFT/RIGHT/FULL）は、相手がいない行も NULL で埋めて残す
- サブクエリは「クエリの中のクエリ」。JOIN では書きにくい「存在するか」の判定などに使う

## 2. この記事で使うデータ

[[02_SQLの基本操作（CRUD）]] のデータに、少しだけ追加します。

```sql
INSERT INTO categories (name) VALUES ('食品');          -- 商品が 1 つもないカテゴリ
INSERT INTO orders (user_id) VALUES (1), (2);           -- 注文 2（山田）, 3（佐藤）
INSERT INTO order_items VALUES (2, 2, 1, 3200), (3, 3, 10, 150);
```

```
users                 orders                 categories        products
id | name             id | user_id           id | name         id | category_id | name
---+------            ---+--------           ---+------       ---+-------------+-------------
 1 | 山田太郎           1 | 1                  1 | 本            1 | 1           | SQL入門
 2 | 佐藤花子           2 | 1                  2 | 文具          2 | 1           | DB設計の教科書
 3 | 鈴木一郎           3 | 2                  3 | 家電          3 | 2           | ボールペン
 4 | 田中美咲                                  4 | 食品          4 | 3           | USBケーブル
                                                                 5 | NULL        | 福袋
```

order_items（明細）は次の 4 行です（02 回の UPDATE / DELETE / UPSERT の例は実行していない前提）。

```
order_id | product_id | quantity | unit_price
---------+------------+----------+-----------
       1 | 1 SQL入門        |  1 | 2800
       1 | 3 ボールペン     |  3 |  150
       2 | 2 DB設計の教科書 |  1 | 3200
       3 | 3 ボールペン     | 10 |  150
```

鈴木さん・田中さんは注文なし、「食品」には商品なし、「福袋」はカテゴリなし、がポイントです。

## 3. JOIN の種類を「行の組み合わせ」で理解する

JOIN はよくベン図で説明されますが、ベン図は「行が増える」ことを表せないので誤解を招きます。ここでは **左の行と右の行を線で結ぶ図** で考えます。

### 3.1 INNER JOIN：ペアが成立した行だけ

```sql
SELECT u.name, o.id AS order_id
FROM users u
INNER JOIN orders o ON o.user_id = u.id;    -- INNER は省略可（JOIN だけで INNER）
```

```
users            orders            結果
1 山田 ───┬──── 1 (user 1)   →  山田 | 1
          └──── 2 (user 1)   →  山田 | 2
2 佐藤 ──────── 3 (user 2)   →  佐藤 | 3
3 鈴木   (相手なし)          →  （消える）
4 田中   (相手なし)          →  （消える）
```

山田さんは注文が 2 件あるので **2 行** になります。注文のない鈴木さん・田中さんは結果から消えます。

### 3.2 LEFT JOIN：左は全員残す

```sql
SELECT u.name, o.id AS order_id
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;
```

```
1 山田 ───┬──── 1    →  山田 | 1
          └──── 2    →  山田 | 2
2 佐藤 ──────── 3    →  佐藤 | 3
3 鈴木   (相手なし) →  鈴木 | NULL   ← 右側を NULL で埋めて残す
4 田中   (相手なし) →  田中 | NULL
```

「一度も注文していないユーザー」を探すには、LEFT JOIN して右側が NULL の行を選びます（アンチ結合）。

```sql
SELECT u.name
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;           -- 鈴木一郎、田中美咲
```

> [!warning] 条件を ON に書くか WHERE に書くか
> LEFT JOIN で右テーブルの条件を WHERE に書くと、NULL で埋めた行が条件で落ち、**実質 INNER JOIN になります**。
> ```sql
> -- ❌ 「全ユーザーと、その pending の注文」のつもりが、注文のない人が消える
> SELECT u.name, o.id FROM users u LEFT JOIN orders o ON o.user_id = u.id
> WHERE o.status = 'pending';
> -- ✅ 右側の絞り込みは ON に書く
> SELECT u.name, o.id FROM users u LEFT JOIN orders o
>   ON o.user_id = u.id AND o.status = 'pending';
> ```

### 3.3 RIGHT JOIN と FULL JOIN

`RIGHT JOIN` は LEFT の左右を逆にしたものです。`A RIGHT JOIN B` は `B LEFT JOIN A` と同じ結果なので、実務では読みやすさのため LEFT に統一することが多いです。

`FULL JOIN`（FULL OUTER JOIN）は **左右どちらの相手なしも残します**。

```sql
SELECT c.name AS category, p.name AS product
FROM categories c
FULL JOIN products p ON p.category_id = c.id;
```

```
categories        products              結果
1 本   ───┬─── 1 SQL入門          →  本   | SQL入門
          └─── 2 DB設計の教科書   →  本   | DB設計の教科書
2 文具 ─────── 3 ボールペン       →  文具 | ボールペン
3 家電 ─────── 4 USBケーブル      →  家電 | USBケーブル
4 食品  (相手なし)                →  食品 | NULL
   (相手なし)  5 福袋             →  NULL | 福袋
```

> [!note] MySQL との違い
> MySQL は FULL OUTER JOIN に対応していません。しかも `FULL JOIN` と書いてもエラーにならず、`FULL` がテーブル別名と解釈されて INNER JOIN として動くことがあります。MySQL では `LEFT JOIN ... UNION ALL ... RIGHT JOIN（左が NULL の行のみ）` で代用します。

### 3.4 CROSS JOIN：全組み合わせ

条件なしで、左の全行 × 右の全行を作ります（直積：Cartesian Product）。4 ユーザー × 4 カテゴリ = 16 行です。

```sql
-- 「全ユーザー × 全カテゴリ」の表を作り、購入有無を後で埋める、などに使う
SELECT u.name, c.name FROM users u CROSS JOIN categories c;
```

ON を書き忘れた JOIN（古い書き方 `FROM a, b` で WHERE を忘れた場合など）は意図せず CROSS JOIN になり、100 万行 × 100 万行 = 1 兆行のような事故になります。

### 3.5 自己結合（Self Join）

同じテーブルを別名を付けて 2 回使います。「同じカテゴリで、自分より安い商品」のように **表の中の行どうしを比べたい** ときに使います。

```sql
SELECT a.name AS product, b.name AS cheaper_in_same_category
FROM products a
JOIN products b
  ON b.category_id = a.category_id
 AND b.price < a.price;
-- DB設計の教科書 | SQL入門
```

社員テーブルの `manager_id`（上司も同じ社員テーブルの行）のような階層構造も自己結合で辿ります。

## 4. JOIN で行が増える問題（ファンアウト）

JOIN の結果の行数は「ペアの数」です。**1 対多 の「多」側と JOIN すると、「1」側の行が複製されます**。これに気づかず集計すると数字が膨らみます。

例：ユーザーごとの「注文数」と「購入した商品の個数合計」を出したい。

```sql
-- ❌ 間違い
SELECT u.name,
       count(o.id)        AS order_count,
       sum(oi.quantity)   AS total_qty
FROM users u
JOIN orders o       ON o.user_id = u.id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY u.name;
-- 山田太郎 | 3 | 5    ← 山田さんの注文は 2 件なのに 3 になる
```

```
users ── orders ── order_items           JOIN 後の行
山田 ─┬─ 注文1 ─┬─ SQL入門 ×1      →  山田 | 注文1 | 1
      │         └─ ボールペン ×3   →  山田 | 注文1 | 3   ← 注文1 が 2 回数えられる
      └─ 注文2 ─── DB設計 ×1       →  山田 | 注文2 | 1
```

対処法は 3 つです。

1. 数える対象を一意にする：`count(DISTINCT o.id)`（ただし `sum` には使えない）
2. **先に集約してから JOIN する**（最も安全）
3. サブクエリ／CTE で粒度（1 行が何を表すか）を揃える

```sql
-- ✅ 明細を注文単位に集約してから JOIN
SELECT u.name, count(o.id) AS order_count, sum(oi.qty) AS total_qty
FROM users u
JOIN orders o ON o.user_id = u.id
JOIN (SELECT order_id, sum(quantity) AS qty
      FROM order_items GROUP BY order_id) oi ON oi.order_id = o.id
GROUP BY u.name;
-- 山田太郎 | 2 | 5
-- 佐藤花子 | 1 | 10
```

**JOIN する前に「結果の 1 行は何を表すのか（粒度）」を口に出す** 習慣が、この事故をいちばん確実に防ぎます。

## 5. サブクエリ

サブクエリ（Subquery）：別のクエリの中に括弧で埋め込んだ SELECT 文 です。返す形によって使える場所が変わります。

### 5.1 スカラーサブクエリ：1 行 1 列を返す

値 1 つとして、SELECT 句や WHERE 句に置けます。

```sql
-- 平均価格より高い商品
SELECT name, price FROM products
WHERE price > (SELECT avg(price) FROM products);
```

2 行以上返すとエラー、0 行なら NULL になります。

### 5.2 IN サブクエリ：1 列の集合を返す

```sql
-- 「本」カテゴリの商品を買ったことがある注文
SELECT DISTINCT order_id FROM order_items
WHERE product_id IN (SELECT id FROM products WHERE category_id = 1);
```

### 5.3 EXISTS サブクエリ：存在するかだけを見る

`EXISTS (サブクエリ)` は、サブクエリが **1 行でも返せば真** です。何を SELECT するかは関係ないので慣習的に `SELECT 1` と書きます。

```sql
-- 注文したことがあるユーザー
SELECT u.name FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
```

### 5.4 相関サブクエリ

上の EXISTS のように、サブクエリの中から **外側の行（u.id）を参照する** ものを相関サブクエリ（Correlated Subquery）と呼びます。論理的には「外側の 1 行ごとにサブクエリを評価し直す」動きです。

```sql
-- 各ユーザーの最新注文日時（SELECT 句の相関サブクエリ）
SELECT u.name,
       (SELECT max(o.ordered_at) FROM orders o WHERE o.user_id = u.id) AS last_ordered
FROM users u;
-- 鈴木一郎 | NULL   （注文なし → max が NULL）
```

「1 行ごとに実行」と聞くと遅そうですが、PostgreSQL のオプティマイザは EXISTS や IN を結合（セミ結合）に書き換えて実行することが多く、書き方だけで速さは決まりません。実際の手順は実行計画で確認します（[[05_実行計画の読み方]]）。

## 6. EXISTS と IN の違い

肯定形（`IN` / `EXISTS`）の結果はほぼ同じで、PostgreSQL ではどちらもセミ結合として最適化されるのが普通です。違いが出るのは **否定形** です。

```sql
-- 注文したことがないユーザー
SELECT name FROM users WHERE id NOT IN (SELECT user_id FROM orders);
SELECT name FROM users u WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
```

ここでは orders.user_id が NOT NULL なので両者は同じ結果です。しかし、**サブクエリの結果に NULL が 1 つでも混ざると `NOT IN` は 1 行も返さなくなります**。

```sql
-- products.category_id には NULL（福袋）がある
SELECT name FROM categories
WHERE id NOT IN (SELECT category_id FROM products);   -- 0 行！（「食品」が出てほしい）

SELECT name FROM categories c
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.category_id = c.id);  -- 食品
```

なぜそうなるのかは三値論理の話になるので [[05_NULLと三値論理]] で詳しく解説します。実務のルールとしては **「否定は NOT EXISTS を使う」** と覚えておけば安全です。

| | IN | EXISTS |
|---|---|---|
| 判定内容 | 値が集合に含まれるか | 条件に合う行があるか |
| 複数列の条件 | `(a, b) IN (SELECT ...)` で可能だが読みにくい | WHERE に自由に書ける |
| NOT のときの NULL | **全行消える罠あり** | 罠なし |
| 定数リスト | `IN (1, 2, 3)` と書ける | 不可 |

## 7. CTE（WITH 句）：クエリに名前を付けて分解する

サブクエリを入れ子にすると、内側から外側へ読まねばならず難解になります。CTE（Common Table Expression：共通テーブル式）は、**途中結果に名前を付けて上から順に書ける** 仕組みです。

```sql
WITH order_totals AS (          -- ① 注文ごとの金額
  SELECT order_id, sum(quantity * unit_price) AS amount
  FROM order_items
  GROUP BY order_id
),
user_totals AS (                -- ② ユーザーごとの購入総額
  SELECT o.user_id, sum(t.amount) AS total
  FROM orders o
  JOIN order_totals t ON t.order_id = o.id
  GROUP BY o.user_id
)
SELECT u.name, coalesce(ut.total, 0) AS total   -- ③ 全ユーザーに付ける
FROM users u
LEFT JOIN user_totals ut ON ut.user_id = u.id
ORDER BY total DESC;
-- 山田太郎 | 6450
-- 佐藤花子 | 1500
-- 鈴木一郎 | 0
-- 田中美咲 | 0
```

①②③ と粒度（注文単位 → ユーザー単位）を 1 段ずつ変えているので、第 4 節のファンアウトも起きません。

> [!note] CTE と性能
> PostgreSQL 12 以降、副作用のない非再帰 CTE は **1 回しか参照されなければ親クエリに展開（インライン化）** され、サブクエリと同じように最適化されます。2 回以上参照されると一度だけ計算して結果を使い回します。`WITH x AS MATERIALIZED (...)` / `NOT MATERIALIZED` で明示的に指定もできます。PostgreSQL 11 以前は常に実体化されたため「CTE は遅い」と言われていました。MySQL は 8.0 から CTE に対応しています。

自分自身を参照する **再帰 CTE** は [[04_集約とウィンドウ関数]] で軽く紹介します。

## よくある誤解・つまずき

- ❌ **JOIN はベン図の重なり部分** → ✅ JOIN は行と行のペアを作る操作です。1 対多で結合すれば行が増えます。ベン図は「どの行が残るか」しか表せません。
- ❌ **LEFT JOIN すれば左の行は必ず残る** → ✅ 右テーブルの条件を WHERE に書くと NULL 行が落ちて INNER と同じになります。右側の条件は ON に書きます。
- ❌ **NOT IN と NOT EXISTS は同じ** → ✅ サブクエリに NULL があると NOT IN は 0 行になります。否定は NOT EXISTS。
- ❌ **相関サブクエリは必ず遅い／JOIN は必ず速い** → ✅ オプティマイザが書き換えるので書き方だけでは決まりません。実行計画で確認します。
- ❌ **集計値がおかしいのは関数の使い方が悪い** → ✅ 多くは JOIN による行の複製（ファンアウト）が原因です。先に集約してから JOIN します。

## まとめ

- JOIN は「条件に合う行のペア」を作る。INNER はペアのみ、LEFT/RIGHT/FULL は相手なしも NULL で残す、CROSS は全組み合わせ
- 1 対多の JOIN では「1」側が複製される。集計前に粒度を揃える（先に集約してから JOIN）
- サブクエリはスカラー・IN・EXISTS・相関の 4 形。外側の行を参照するのが相関サブクエリ
- 否定の存在チェックは NOT IN ではなく NOT EXISTS（NULL の罠を避ける）
- CTE で途中結果に名前を付けると、長いクエリを上から順に読める

## 確認クイズ

1. users（4 行）と orders（3 行、うち山田さん 2 件・佐藤さん 1 件）を LEFT JOIN すると何行になりますか？
> [!tip]- 答え
> 5 行です。山田さんが 2 行、佐藤さんが 1 行、注文のない鈴木さん・田中さんが NULL 埋めで 1 行ずつ。結果の行数は「ペアの数 + 相手なしで残った行の数」です。

2. 「商品が 1 つも登録されていないカテゴリ」を `NOT IN (SELECT category_id FROM products)` で探すと 0 行になりました。原因と対策は？
> [!tip]- 答え
> products.category_id に NULL（カテゴリ未分類の福袋）があるため、`id NOT IN (..., NULL)` が「不明」となり全行が落ちます。`NOT EXISTS (SELECT 1 FROM products p WHERE p.category_id = c.id)` に書き換えます（または サブクエリに `WHERE category_id IS NOT NULL` を付ける）。

3. ユーザー × 注文 × 明細 を JOIN して `sum(o.shipping_fee)`（注文単位の送料）を合計したら実際より大きくなりました。なぜですか？
> [!tip]- 答え
> 明細と JOIN したことで、明細の数だけ注文の行が複製され、送料が重複して足されたためです。送料は注文単位で集計してから（明細とは JOIN せずに）合算します。

## 関連ノート

- [[02_SQLの基本操作（CRUD）]] — この記事のデータを入れた回
- [[04_集約とウィンドウ関数]] — GROUP BY と、行を減らさない集計
- [[05_NULLと三値論理]] — NOT IN が 0 行になる本当の理由
- [[06_SQLの実行順序]] — JOIN（FROM）が最初に評価される意味
- [[05_実行計画の読み方]] — Nested Loop / Hash Join / Merge Join の見分け方
- [[【SQL】NULLが気持ち悪い数学的理由｜真でも偽でもない第3の値]] — （クリップ）NOT IN の穴や外部結合で湧く NULL を事故簿として紹介

## 参考

- [PostgreSQL Documentation: Table Expressions（Joined Tables）](https://www.postgresql.org/docs/current/queries-table-expressions.html)
- [PostgreSQL Documentation: Subquery Expressions](https://www.postgresql.org/docs/current/functions-subquery.html)
- [PostgreSQL Documentation: WITH Queries (Common Table Expressions)](https://www.postgresql.org/docs/current/queries-with.html)
- [MySQL Bug #69858: Make FULL a reserved word](https://bugs.mysql.com/bug.php?id=69858)
