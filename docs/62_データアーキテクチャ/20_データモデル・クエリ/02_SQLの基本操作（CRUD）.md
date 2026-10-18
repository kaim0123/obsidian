---
title: SQLの基本操作（CRUD）
created: 2026-10-12
tags:
  - データベース
  - データモデル
---

# SQLの基本操作（CRUD）

[[MOC_データアーキテクチャ体系|📚 目次]] ｜ [[01_リレーショナルモデルとテーブル|← 前へ]] ｜ [[03_JOINとサブクエリ|次へ →]]

> [!abstract] この記事で分かること
> - SQL の 4 分類（DDL / DML / DCL / TCL）と、それぞれの代表的な文
> - CREATE TABLE で例題スキーマを作り、INSERT（複数行・RETURNING）でデータを入れる方法
> - SELECT の基本（WHERE・ORDER BY・LIMIT/OFFSET・LIKE・IN・BETWEEN）
> - UPDATE / DELETE で「WHERE を忘れる事故」を防ぐ習慣
> - UPSERT（INSERT ... ON CONFLICT）で「なければ追加、あれば更新」を 1 文で書く方法
>
> **前提**：[[01_リレーショナルモデルとテーブル]] を読んでいると理解しやすいです。

## 1. ひとことで言うと

SQL（Structured Query Language）：リレーショナルデータベースに命令を出すための言語 です。
レストランの注文に似ています。客は「カルボナーラを 1 つ」と **何が欲しいか** だけを伝え、厨房でどの鍋を使いどの順で作るかは指定しません。SQL も同じで、「どのデータが欲しいか」を書くだけで、取り出し方は DB が考えます。こうした書き方を **宣言型（Declarative）** と呼びます。

データ操作の基本は 4 つの動詞に集約され、頭文字を取って **CRUD** と呼ばれます。

| CRUD | 意味 | SQL |
|---|---|---|
| **C**reate | 作る | `INSERT` |
| **R**ead | 読む | `SELECT` |
| **U**pdate | 更新する | `UPDATE` |
| **D**elete | 消す | `DELETE` |

## 2. SQL の 4 分類

| 分類 | 正式名 | 何をするか | 代表的な文 |
|---|---|---|---|
| DDL | Data Definition Language（データ定義言語） | テーブルなど「入れ物」を定義する | `CREATE` / `ALTER` / `DROP` / `TRUNCATE` |
| DML | Data Manipulation Language（データ操作言語） | 入れ物の「中身」を操作する | `SELECT` / `INSERT` / `UPDATE` / `DELETE` |
| DCL | Data Control Language（データ制御言語） | 権限を与える・奪う | `GRANT` / `REVOKE` |
| TCL | Transaction Control Language（トランザクション制御言語） | 複数の操作をひとまとめにする | `BEGIN` / `COMMIT` / `ROLLBACK` |

> [!note] 分類は流派がある
> `SELECT` を DML と分けて DQL（Data Query Language）と呼ぶ流儀もあります。また PostgreSQL では DDL もトランザクションの中で実行・ロールバックできますが、MySQL では多くの DDL が暗黙的にコミットされます。この違いはマイグレーションで効いてきます（[[01_マイグレーションとは]]）。

TCL の中身（なぜまとめる必要があるか）は [[01_トランザクションとACID]]、DDL の本番運用は [[01_マイグレーションとは]] から始まるマイグレーションの章で扱います。この記事では DDL と DML を中心に見ます。

## 3. CREATE TABLE と INSERT

### 3.1 テーブルを作る（DDL）

例題スキーマを作ります。外部キーの参照先から順に作るのがポイントです。

```sql
CREATE TABLE users (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE categories (
  id   BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE products (
  id          BIGSERIAL PRIMARY KEY,
  category_id BIGINT REFERENCES categories(id),
  name        TEXT NOT NULL,
  price       INTEGER NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE orders (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id),
  status     TEXT NOT NULL DEFAULT 'pending',
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE order_items (
  order_id   BIGINT REFERENCES orders(id),
  product_id BIGINT REFERENCES products(id),
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
```

### 3.2 行を入れる（INSERT）

```sql
-- 1 行。列名を必ず書く（テーブルに列が追加されても壊れない）
INSERT INTO users (name, email) VALUES ('山田太郎', 'yamada@example.com');

-- 複数行を 1 文で。1 行ずつ投げるより通信回数が減り速い
INSERT INTO users (name, email) VALUES
  ('佐藤花子', 'sato@example.com'),
  ('鈴木一郎', 'suzuki@example.com'),
  ('田中美咲', 'tanaka@example.com');

INSERT INTO categories (name) VALUES ('本'), ('文具'), ('家電');

INSERT INTO products (category_id, name, price, stock) VALUES
  (1, 'SQL入門',        2800, 10),
  (1, 'DB設計の教科書',  3200,  5),
  (2, 'ボールペン',       150, 200),
  (3, 'USBケーブル',      980,  0),
  (NULL, '福袋',         5000,  3);   -- カテゴリ未分類
```

`id` と `created_at` を書いていないのは、`BIGSERIAL`（連番）と `DEFAULT now()` が自動で埋めるからです。

### 3.3 RETURNING：入れた行をそのまま受け取る

注文を作ったら、採番された注文 ID を使って明細を入れたいはずです。PostgreSQL では `RETURNING` で、INSERT した行の値をその場で返してもらえます。

```sql
INSERT INTO orders (user_id) VALUES (1)
RETURNING id, ordered_at;
--  id |          ordered_at
-- ----+-------------------------------
--   1 | 2026-10-12 10:00:00.123+09

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (1, 1, 1, 2800),
  (1, 3, 3,  150);
```

`RETURNING` は UPDATE・DELETE にも使え、「更新後の値」や「消した行」を返せます。

> [!note] MySQL との違い
> MySQL 8.0 は `RETURNING` に対応していません（MariaDB は 10.5 以降で対応）。代わりに `LAST_INSERT_ID()` で直前の自動採番値を取得します。

## 4. SELECT：データを読む

SELECT の基本形と、各句の役割です。

```sql
SELECT 列, ...        -- どの列を
FROM   テーブル        -- どこから
WHERE  条件            -- どの行を
ORDER BY 列 [ASC|DESC] -- どの順で
LIMIT  件数 OFFSET 飛ばす件数;  -- 何件
```

書く順番はこの通りですが、**DB が意味的に処理する順番は違います**（FROM → WHERE → SELECT → ORDER BY → LIMIT）。この違いが「WHERE で別名が使えない」などの現象を生みます。詳しくは [[06_SQLの実行順序]] で。

### 4.1 WHERE：行を絞る

```sql
-- 比較演算子：=, <> (または !=), <, <=, >, >=
SELECT id, name, price FROM products WHERE price >= 1000;

-- AND / OR。混ぜるときは括弧を付ける（AND が先に結合する）
SELECT name FROM products
WHERE stock > 0 AND (category_id = 1 OR price < 500);
```

### 4.2 LIKE・IN・BETWEEN

```sql
-- LIKE：パターン一致。% は 0 文字以上、_ はちょうど 1 文字
SELECT name FROM products WHERE name LIKE 'SQL%';      -- 前方一致
SELECT email FROM users  WHERE email LIKE '%@example.com';

-- IN：いずれかに一致（OR の短縮形）
SELECT name FROM products WHERE category_id IN (1, 2);

-- BETWEEN：範囲（両端を含む）
SELECT name, price FROM products WHERE price BETWEEN 1000 AND 3000;
```

> [!warning] BETWEEN と日時の罠
> `ordered_at BETWEEN '2026-10-01' AND '2026-10-31'` は「10 月 31 日 0:00:00 ちょうど」までしか含みません（31 日の昼の注文が漏れる）。日時の範囲は **半開区間** で書くのが定石です。
> ```sql
> WHERE ordered_at >= '2026-10-01' AND ordered_at < '2026-11-01'
> ```

> [!note] 大文字小文字
> PostgreSQL の `LIKE` は大文字小文字を区別し、区別しない検索は `ILIKE` を使います。MySQL は照合順序（collation）次第で、デフォルトでは区別しないことが多いです。また `'%SQL%'` のような中間一致は通常の B-Tree インデックスが効きません（[[04_インデックスが効かないパターン]]）。

### 4.3 ORDER BY と LIMIT / OFFSET

```sql
-- 価格の高い順、同じ価格なら id 順
SELECT id, name, price FROM products
ORDER BY price DESC, id ASC
LIMIT 3;

-- ページネーション：2 ページ目（1 ページ 10 件）
SELECT id, name FROM products
ORDER BY id
LIMIT 10 OFFSET 10;
```

ポイントは 2 つあります。

1. **ORDER BY のない LIMIT は「どの 3 件か」が不定**です。同じクエリでも実行計画が変われば別の行が返ります。
2. **OFFSET は飛ばした行も一度読んでいます**。`OFFSET 100000` は 10 万行を読み捨てるので深いページほど遅くなります。大量データでは「前ページ最後の id より大きいもの」を取る **キーセットページネーション** が有効です。

```sql
-- キーセット方式：前ページ最後の id が 120 だった場合
SELECT id, name FROM products WHERE id > 120 ORDER BY id LIMIT 10;
```

### 4.4 SELECT * を避ける

`SELECT *` は手軽ですが、本番コードでは必要な列だけを書きます。不要な列の転送量が増える、列追加でアプリが壊れる、インデックスだけで答えられる（カバリング）機会を失う、といった理由があります。

> [!warning] アプリから SQL を組み立てるときはプレースホルダを使う
> ユーザー入力を文字列連結で SQL に埋め込む（`"... WHERE email = '" + input + "'"`）と、入力に `' OR '1'='1` のような SQL 断片を混ぜられて任意の SQL を実行される **SQL インジェクション** の原因になります。必ずプレースホルダ（PostgreSQL のドライバなら `WHERE email = $1`）を使うプリペアドステートメントで値を渡します。ORM（[[17_ORMとは]]）も内部でこれを行っています。

## 5. UPDATE と DELETE：WHERE を忘れる事故

```sql
-- 商品 4 の在庫を 50 にする
UPDATE products SET stock = 50 WHERE id = 4;

-- 複数列・計算式も OK。RETURNING で結果を確認
UPDATE products SET price = price * 110 / 100, stock = stock - 1
WHERE id = 1
RETURNING id, price, stock;

-- 注文 1 の明細から商品 3 を消す
DELETE FROM order_items WHERE order_id = 1 AND product_id = 3;
```

最も有名な事故は **WHERE の書き忘れ** です。

```sql
UPDATE users SET email = 'new@example.com';   -- 全ユーザーのメールが同じに！
DELETE FROM orders;                            -- 全注文が消える！
```

SQL は「全行を更新したい」のか「書き忘れた」のかを区別できないので、エラーも警告も出さずに実行します。防ぐための習慣です。

1. **先に同じ WHERE で SELECT して、件数と中身を確認する**
2. **トランザクションの中で実行し、件数を見てから COMMIT する**
   ```sql
   BEGIN;
   UPDATE products SET stock = 0 WHERE category_id = 3;
   -- UPDATE 1   ← 想定した件数か確認
   COMMIT;      -- 想定外なら ROLLBACK;
   ```
3. 本番の手作業は、更新権限のないユーザーで調査し、更新はレビュー済みの SQL だけにする（DCL の出番）

> [!note] MySQL の安全装置
> MySQL には `SET sql_safe_updates = 1;`（クライアントの `--safe-updates` オプション）があり、キー列を使った WHERE か LIMIT のない UPDATE/DELETE をエラーにできます。PostgreSQL には標準ではこの設定はありません。

なお、テーブルの全行を消したいときは `TRUNCATE products;` の方が高速です（行を 1 つずつ消さずにデータファイルごと空にする DDL 寄りの操作）。

## 6. UPSERT：なければ追加、あれば更新

「カテゴリ名が既にあれば何もしない」「在庫データを外部から取り込み、既存の商品なら上書きする」といった処理は頻出です。SELECT で存在確認してから INSERT/UPDATE を分けると、その間に別の処理が割り込んで重複エラーになる可能性があります。PostgreSQL の `INSERT ... ON CONFLICT` は、これを **1 文で原子的に** 行います。

```sql
-- 重複していたら何もしない
INSERT INTO categories (name) VALUES ('本')
ON CONFLICT (name) DO NOTHING;

-- 重複していたら更新（UPSERT = UPDATE + INSERT）
INSERT INTO users (name, email) VALUES ('山田太郎（改名）', 'yamada@example.com')
ON CONFLICT (email)
DO UPDATE SET name = EXCLUDED.name
RETURNING id, name;
```

- `ON CONFLICT (email)` は「email の一意制約（UNIQUE / 主キー）に違反しそうなら」という意味で、対象列に **一意制約か一意インデックスが必要** です。
- `EXCLUDED` は「挿入しようとして弾かれた行」を指す特別な名前です。
- `DO UPDATE` を使うときは対象（`(email)` の部分）の指定が必須です。

```sql
-- カートに同じ商品を追加：明細がなければ作り、あれば数量を加算
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES (1, 1, 2, 2800)
ON CONFLICT (order_id, product_id)
DO UPDATE SET quantity = order_items.quantity + EXCLUDED.quantity;
```

> [!note] MySQL との違い
> MySQL では `INSERT ... ON DUPLICATE KEY UPDATE col = VALUES(col)`（8.0.20 以降は行エイリアス `AS new` を使う書き方が推奨）を使います。どの一意キーで衝突したかを指定できない点が PostgreSQL と異なります。PostgreSQL 15 以降は標準 SQL の `MERGE` 文も使えます。

## よくある誤解・つまずき

- ❌ **SELECT は ORDER BY を書かなくても id 順に返る** → ✅ 保証されません。順番が必要なら必ず ORDER BY を書きます。LIMIT と組み合わせるときは特に重要です。
- ❌ **`WHERE name = NULL` で NULL の行が取れる** → ✅ 1 行も返りません。`WHERE name IS NULL` と書きます（理由は [[05_NULLと三値論理]]）。
- ❌ **存在確認の SELECT → INSERT で重複は防げる** → ✅ 同時実行で間に割り込まれます。一意制約 + `ON CONFLICT` で DB に判断させます。
- ❌ **OFFSET を使えばどんなに深いページも同じ速さ** → ✅ 飛ばす行も読むので線形に遅くなります。大量データはキーセット方式で。
- ❌ **文字列は `"` で囲む** → ✅ 標準 SQL / PostgreSQL では文字列は `'単一引用符'`、`"二重引用符"` は列名などの識別子です（MySQL はデフォルトで `"` も文字列として扱うため混乱しやすい）。

## まとめ

- SQL は DDL（定義）・DML（操作）・DCL（権限）・TCL（トランザクション）に分類される
- INSERT は列名を明示し、複数行をまとめて入れる。PostgreSQL は RETURNING で採番値などを受け取れる
- SELECT は WHERE / ORDER BY / LIMIT が基本。日時範囲は半開区間、LIMIT には ORDER BY を必ず添える
- UPDATE / DELETE は「先に SELECT」「トランザクションで件数確認」で WHERE 忘れを防ぐ
- 「なければ追加、あれば更新」は一意制約 + `ON CONFLICT` で 1 文にする

## 確認クイズ

1. 次の SQL で 10 月中の注文を取りたいのですが、問題があります。何が問題でどう直しますか？
   `SELECT * FROM orders WHERE ordered_at BETWEEN '2026-10-01' AND '2026-10-31';`
> [!tip]- 答え
> `'2026-10-31'` は 10 月 31 日 0 時 0 分 0 秒として扱われ、31 日中の注文が漏れます。`WHERE ordered_at >= '2026-10-01' AND ordered_at < '2026-11-01'` の半開区間で書きます。ついでに `SELECT *` も必要な列に絞るとよいです。

2. `INSERT INTO categories (name) VALUES ('本') ON CONFLICT (name) DO NOTHING;` が動くために、テーブル側に必要なものは何ですか？
> [!tip]- 答え
> `name` 列の一意制約（UNIQUE）または一意インデックスです。ON CONFLICT は一意制約違反を検出して代替動作をする仕組みなので、制約がないと「衝突」を判定できずエラーになります。

3. 本番 DB で「キャンセル済みの注文を削除」したい。安全に実行する手順を述べてください。
> [!tip]- 答え
> ①`SELECT count(*) FROM orders WHERE status = 'cancelled';` で件数と中身を確認 → ②`BEGIN;` → ③`DELETE FROM orders WHERE status = 'cancelled';`（明細を先に消す必要がある点にも注意）→ ④表示された件数が①と一致すれば `COMMIT;`、違えば `ROLLBACK;`。

## 関連ノート

- [[01_リレーショナルモデルとテーブル]] — ここで使ったスキーマと制約の意味
- [[03_JOINとサブクエリ]] — 複数テーブルを組み合わせて読む
- [[06_SQLの実行順序]] — SELECT の各句が実際に評価される順番
- [[01_トランザクションとACID]] — BEGIN / COMMIT が何を保証しているのか
- [[17_ORMとは]] — アプリからこれらの SQL を生成する ORM
- [[【入門】SQLの実行順序（論理・物理）。実行計画とは何か。]] — （クリップ）SELECT の書く順と実行順の違いを動画で

## 参考

- [PostgreSQL Documentation: INSERT](https://www.postgresql.org/docs/current/sql-insert.html)
- [PostgreSQL Documentation: SELECT](https://www.postgresql.org/docs/current/sql-select.html)
- [PostgreSQL Documentation: Pattern Matching](https://www.postgresql.org/docs/current/functions-matching.html)
- [MySQL 8.0 Reference Manual: INSERT ... ON DUPLICATE KEY UPDATE](https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html)
