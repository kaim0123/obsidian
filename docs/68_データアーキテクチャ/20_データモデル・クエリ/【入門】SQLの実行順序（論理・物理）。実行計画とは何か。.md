---
title: "【入門】SQLの実行順序（論理・物理）。実行計画とは何か。"
source: "https://www.youtube.com/watch?v=bFfkwJRY6RE&t=19s"
author:
  - "[[直也テック]]"
published: 2026-09-02
created: 2026-10-04
description: "【PR】ITエンジニア特化の転職エージェント「テックゴー」https://h.accesstrade.net/sp/cc?rk=0100q5og00osn8メンバーシップの詳細はこちら。https://www.youtube.com/channel/UCtiDTuG40ZOarubtFm1fbzg/join====目次====0:00 イントロ / 書いた順には動かない2:26"
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=bFfkwJRY6RE)

【PR】ITエンジニア特化の転職エージェント「テックゴー」  
https://h.accesstrade.net/sp/cc?rk=0100q5og00osn8  
  
メンバーシップの詳細はこちら。  
https://www.youtube.com/channel/UCtiDTuG40ZOarubtFm1fbzg/join  
  
\====  
目次  
\====  
0:00 イントロ / 書いた順には動かない  
2:26 実行される順序  
4:52 実行計画とは  
6:07 実行計画の読み方  
7:47 実行計画で直す  
8:41 サーガブルな書き方  
9:36 SQLヒント  
10:24 実例で通しで追う  
12:25 インデックスの中身  
14:12 遅いクエリに出会ったら  
15:02 まとめ  
  
\====  
note  
\====  
海外ソフトウェアエンジニアリング事例を発信  
https://note.com/naoya\_tech  
  
\====  
SNS  
\====  
  
●X  
https://x.com/naoyashiga  
  
●Threads  
https://www.threads.com/@naoya\_tech  
  
●直也テック TikTok  
https://www.tiktok.com/@coding\_youtuber  
  
  
\====  
おすすめ書籍  
\====  
達人に学ぶSQL徹底指南書  
https://amzn.to/4qKaR20  
  
\====  
低レイヤー自作を行う学習教材  
\====  
バックエンドや要素技術を自作して学びたい方はCodeCraftersがおすすめです。  
  
  
👇このリンクから登録すると40%OFFになります。  
https://app.codecrafters.io/join?via=naoyashiga  
  
\------------  
  
●お仕事のご依頼はこちらから  
https://www.naoya-tech.com  
  
  
●BGM素材  
BGMer  
http://bgmer.net  
  
#sql

## 詳しい要約

**テーマ：SQL の論理的な実行順序と、DB が選ぶ物理的な手順（実行計画）**

SQL は SELECT から書き始めるが、実行されるのは終盤である。前半では「書く順序」と「論理的な処理順序」の違いから、WHERE で別名が使えず ORDER BY では使える理由を説明し、後半では DB が実際に選ぶ手順である実行計画の読み方、インデックスの仕組み、遅いクエリへの対処手順を解説する。結論は「推測せず実行計画で測り、直したらもう一度測る」。

---

### 書く順序と 5 つの絞り込み

- 書く順序（コーディング順序）は決まっていて、守らないとエラーになる: SELECT → (DISTINCT) → (TOP) → 列 → FROM → WHERE → GROUP BY → HAVING → ORDER BY。
- このクエリには 5 種類のデータの絞り込みが含まれる。

| 句 | 絞り込みの種類 |
|---|---|
| SELECT | 列の絞り込み |
| DISTINCT | 重複の絞り込み |
| TOP | 件数の絞り込み（条件なしで上から切る） |
| WHERE | 集計前の行の絞り込み |
| HAVING | 集計後の結果の絞り込み |

- どこで絞るかによって速度も結果も変わる。

### 論理的な実行順序

1. **FROM**: どの表から取るか。以降はすべてここで取った表に対して行う。
2. **WHERE**: 条件に合わない行を捨てる。集計前に絞ると後の処理が軽くなるが、捨てた行は平均や合計にも含まれない。
3. **GROUP BY**: 同じ値の行を 1 行にまとめ、集計関数を計算する。ここで表の形（行数・列）が変わる。
4. **HAVING**: 集計後の表に条件をかける。WHERE は元の行に、HAVING は集計後の行に問いかけるのが決定的な違い。
5. **SELECT**: 必要な列だけ残す。DISTINCT もここで適用。**別名（エイリアス）はここで作られる**。
6. **ORDER BY**: 並べ替え。SELECT の後なので別名が使える。
7. **TOP**（LIMIT）: 並べ替えた結果から上位を件数だけで切る。

- WHERE の時点では別名がまだ存在しないので、WHERE で別名を使うとエラーになる。
- これを **論理的な実行順序** と呼び、結果を決める意味上のルールである。ただし DB は結果が同じならこの順で動く必要はなく、実際の手順は DB 自身が組み立てる。

### 実行計画とは

- 実行計画（execution plan）は、クエリをどう実行するかの道順。目的地が同じでも経路は複数あり、地図を見て最善の経路を選ぶのに似ている。
- クエリを受け取るとすぐディスクを読みに行くのではなく、まず計画（どの表を、どう読み、どう結合するか）を作り、その後で実行する。
- 計画は **統計情報**（どの列にどんな値がどれくらいの割合であるか）に基づく見積もりで、最も安い経路が選ばれる。
- 作った計画はキャッシュに保存され、同じクエリなら作り直さずに再利用する。
- 実行前の **推定計画** と実行後の **実際の計画** がある。両者が食い違うのは統計情報が古いサイン。
- 実行計画は DB の頭の中を覗く窓で、推測ではなく数字で問題を特定できる。

### 実行計画の読み方

- **右から左へ読む**。右端がデータの読み込み、左端が結果。
- 表の読み方（悪い順）:
  - **Table Scan**: 全行を読む（12 行欲しいだけでも 6 万行読むことがある）。
  - **Index Scan**: インデックスをたどって読むが、端から端まで走っている可能性がある。
  - **Index Seek**: 必要な場所に直接たどり着いてそこだけ読む。最良。
- インデックス内では値が既に並んでいるので、並べ替えの手順そのものが計画から消えることがある。
- **Key Lookup**: インデックスにない列を取りに本体の表へ往復する手順。全列を要求すると発生する。
- 結合の種類: **Nested Loop**（小さい表なら十分）、**Merge Join**・**Hash Join**（大きい表ではこちらが速い）。
- 各手順のコストが割合（例: 71%）で表示され、最大のものがそのクエリのボトルネック。
- 読む方向・操作名・コストの 3 つが分かれば実行計画は怖くない。

### 実行計画で直す

- 条件によく使う列にインデックスを 1 つ追加して計画を見直すと、Table Scan が Index Seek に変わり、読む行が 6 万から 12 に減った。
- 計画に使われたインデックスの名前が出ているかを確認する。作ったのに名前が出ていなければ選択が間違っている。インデックスを作るたびに計画を確認する習慣をつける。
- 重い集計には列ごとにデータをまとめる **カラムストアインデックス** が劇的に効く（全体の 71% を占めた手順が 6% に）。
- 計画は保存して前後で並べて比べられる。必ず前後を比較する。

### サーガブル（SARGable）な書き方

- インデックスがあるのに使われない原因の一つが、WHERE で列を関数で包むこと。列を加工した瞬間にインデックスが使えなくなる。
  - 悪い例: WHERE の中で YEAR 関数を使う。良い例: 日付の範囲で比較する。意味は同じでも DB には別物。
- インデックスを使える書き方を Search ARGument-able、略して **SARGable** と呼ぶ。
  - 列を関数で包まない／できるだけ直接比較する／どうしても必要なら計算列や関数ベースのインデックスを検討する。
- 直すべきは SELECT の列、WHERE の条件、結合の 3 か所で、遅さの大半はここにある。

### SQL ヒント

- DB の判断を上書きする方法。統計情報が古い、インデックスが多すぎるなどで DB が誤った判断をすることがある。
- 結合方式を Hash Join に強制する、アクセス方法を Index Seek に強制する、使うインデックスを名前で指定する、などができる。
- 注意点: 開発環境で速くても本番で速いとは限らない（データ量が違えば最適な計画が変わる）。ヒントは恒久策にせず応急処置にとどめ、統計情報が古いのか、インデックスが間違っているのか、原因を必ず後で調べる。

### 実例で通しで追う

顧客ごとの注文数と合計金額を集計し、2026 年以降の注文だけを対象に、合計 1000 円超の上位 10 顧客を出すクエリ。

| 段階 | 行数 |
|---|---|
| FROM / JOIN（顧客 1000、注文 25 万） | 25 万 |
| WHERE（2026 年より前を除外） | 12 万 |
| GROUP BY（顧客ごと、COUNT・SUM を計算） | 8,400 |
| HAVING（合計 1000 超） | 310 |
| SELECT（顧客 ID・注文数・合計の 3 列）→ ORDER BY → LIMIT | 10 |

- HAVING の条件は WHERE には書けない（その時点では合計がまだ存在しない）。
- データを最も大きく減らす工程が速度を決める。**できるだけ早く絞る** のが目標で、遅く絞ると不要なデータまで集計してから捨てることになる。
- 早く絞るにはインデックスが不可欠。WHERE の条件がインデックスに届けば読む行数が減り、届かなければ全部読んで捨てるだけになる。実行順序を理解すると、どこで絞ると効くかが分かる。

### インデックスの中身

- インデックスは本の巻末の索引と同じ。なければ全ページをめくる必要がある。
- DB のインデックスは **B-Tree**（根 → 枝 → 葉）。葉は値の順にきれいに並ぶ。根から値を比べながら下り、3 段の木なら 3 回の比較で葉に届く。
- 範囲検索は、たどり着いた葉から横に進む。葉同士がつながっているので「より大きい／より小さい」の条件が速い。
- **複合インデックス** は電話帳のように、姓で並べた後に同じ姓の中で名で並ぶ。姓だけ・姓と名の検索は速いが、名だけではインデックスが効かない（**左端の列から使う** のがルール）。
- **カバリングインデックス**: 欲しい列をすべてインデックスに含め、本体データを取りに行く往復をなくす。
- インデックスはタダではない。行の追加・削除のたびに更新が必要で、読みが速くなる代わりに書き込みが遅くなり容量も増える。実行計画に出てこないインデックスは削除候補。

### 遅いクエリに出会ったら

1. 推測せず実行計画を出す。
2. 最もコストが高い 1 手順だけを選ぶ。
3. スキャンならインデックス候補が見えてくる。
4. 直したら計画が変わったかもう一度確認する。

- インデックスが効かない原因はたいてい 3 つ: 列を関数で包む／左端の列を使っていない／アスタリスク（*）で不要な列まで取る。
- 本番に近いデータ量でテストする（100 行の環境ではどんなクエリも速く見える）。データ量が変われば実行計画も変わる。

### まとめ

- 書く順序と実行順序は違う。FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → TOP の順序が、エラーの理由と結果を決める。
- 実際の手順を決めるのは実行計画。右から左に読み、Scan か Seek かを見て高コストの手順を探す。
- インデックスは早く絞るための道具だが、SARGable な書き方と左端ルールを守らないと効かない。
- 直す前に測り、直した後にまた測る。このサイクルが最適化そのもの。

## Transcript

### イントロ / 書いた順には動かない

**0:00** · SQL execution order: Even though you start writing with SELECT, it is executed near the end. Without knowing this fact, you cannot explain why errors occur or why queries are slow.

**0:11** · For example, this query results in an error. I simply used an alias defined in the SELECT clause within the WHERE clause. However, if you use an alias in ORDER BY, it works. The answer to why one works and the other doesn't lies in the execution order. There is also another query that returns the same result but is extremely slow. Sometimes , just changing how you write it can make it 10 times faster. That difference is also determined by how the database actually operates. Today, we will track two types of order.

**0:37** · The first is the order in which we write it and the order in which it is logically processed. The second is the physical procedure that the database actually chooses. We will look at the logic in the first half and the physics in the second half. First, let's look at the order in which we write queries. SQL has fixed positions for where keywords must be placed. If you do not follow the order, the database will return an error. It always starts with SELECT.

**1:04** · You can place DISTINCT right after SELECT. You can place TOP right after that. Then, list the columns you want to see, separated by commas. Once you have written the columns, use FROM to specify the table. If you want to filter before aggregation, use WHERE.

**1:19** · WHERE must always be placed immediately after FROM. When you want to summarize data, use GROUP BY at the end. HAVING can be placed after GROUP BY. And finally, you can place ORDER BY at the very end. This is the writing order, or coding order. This sequence is a rule that you simply have to memorize. Let's look at this query from a different angle. Actually, it contains five mechanisms for filtering data. The first is SELECT. Since it selects only the columns you want to see, this is a column filter. The second is DISTINCT.

**1:52** · If identical rows are lined up, it reduces them to one. It is a duplicate filter. The third is TOP. This one has no conditions. It just cuts off a certain number from the top. The fourth is WHERE. It keeps only the rows that match the condition. Moreover, it is applied before aggregation. The fifth is HAVING. This applies conditions to the results after aggregation. So, there are five types of filtering: columns, duplicates, count, pre-aggregation, and post-aggregation.

**2:23** · Changing where you filter data affects both speed and results. So, in what order does a database process this?

### 実行される順序

**2:30** · It’s not the order you write it in.

**2:32** · It operates in an entirely different sequence. The first thing executed is FROM. Which table should we pull data from? This is the starting point. All subsequent steps are performed on the table retrieved here. Second is WHERE.

**2:48** · Data that doesn't meet the criteria is discarded at this stage. Filtering before aggregation makes subsequent processing lighter. Conversely, data discarded here never comes back. It will no longer be included in averages or totals. Third is GROUP BY. Rows with the same value are consolidated into one. Then, the specified aggregate functions are calculated. At this moment, the table's shape changes. The number of rows becomes the number of groups, and columns are limited to those specified. Fourth is HAVING.

**3:17** · This applies conditions to the table after aggregation. Groups with a total of 30 or less disappear here. This is the critical difference between WHERE and HAVING. WHERE asks the original rows, while HAVING asks the aggregated rows.

**3:35** · Even though both filter, they are asking completely different subjects.

**3:39** · Finally, at the fifth step, we reach SELECT. Only the necessary columns are kept here. If DISTINCT is present, duplicates are removed here as well.

**3:49** · This solves the mystery from earlier.

**3:51** · Aliases are created at the fifth step, SELECT. At the second step, WHERE, the alias does not yet exist. That is why using an alias in WHERE causes an error . The sixth step is ORDER BY. It sorts the results by the specified column.

**4:06** · Sorting happens after SELECT. In other words, the alias is already established . That is why aliases can be used in ORDER BY. And finally, the seventh is TOP. It keeps only the top two rows from the sorted result. It doesn't look at conditions. It just counts them and cuts off there. Let's run through it.

**4:24** · FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, and TOP; the writing order and execution order are this different.

**4:34** · This sequence has a name. It is called the logical order of execution. These are the semantic rules that determine the results. However, the database doesn't necessarily operate in this order. It doesn't matter how it calculates, as long as the result is the same. The database constructs the actual procedure itself. That constructed procedure is the execution plan. In English, it is called an " execution plan." An execution plan is a roadmap for how to run a query. The database itself creates it before execution.

### 実行計画とは

**5:05** · It is easy to understand if you compare it to traveling. Even if the destination is set, there is not just one way to get there. It is just like looking at a map to choose the best route. When you send a query, it doesn't immediately go to read the disk . The database engine first creates a plan. Which tables to read, how to read them, and how to join them. Only after the plan is created does execution begin. The basis for execution is statistical information. What values are in which columns and at what proportions. Based on that estimate, the cheapest route is chosen.

**5:37** · The completed plan is saved in a cache. If the same query comes again, it won't recreate the plan. It takes it off the shelf and immediately moves to execution. There are two types of execution plans. The estimated plan shown before execution and the actual plan after. When these two differ, it is a sign that statistics are outdated.

**6:00** · An execution plan is a window into the database's mind. You can pinpoint the problem with numbers, not guesswork.

### 実行計画の読み方

**6:08** · There is a knack to reading it. You read execution plans from right to left . The far right is the reading of data.

**6:15** · The far left is the result. First, how was the table read? If it says "Table Scan," it means all rows were read.

**6:24** · Even if you only want 12 rows, it might have read 60,000. An "Index Scan" is a way of reading by following an index.

**6:31** · However, there is a possibility it ran from end to end. The best is an "Index Seek." It arrives directly at the required location and reads only that.

**6:41** · It can finish by reading just 12 rows instead of 60,000. From worst to better : Table Scan, Index Scan. And the best one is Index Seek. Just by distinguishing these three terms, you can narrow down causes. There is also a difference in sorting. Values are already sorted within an index. So, the sorting step itself disappears from the plan. Sometimes, even using an index results in extra steps. That is a Key Lookup. It’s the process of going to the main table to fetch columns not in the index.

**7:12** · This round trip occurs when you request all columns. There are also different types of table joins. Nested Loop, Merge Join, and Hash Join. For small tables, a Nested Loop is sufficient. For large tables, Merge or Hash joins are faster. Each step displays its cost as a percentage.

**7:34** · Numbers like 71%will appear. The largest number is the bottleneck for that query. How to read it, operation names, and cost. If you understand these three, execution plans aren't scary. Let's actually fix one. Add one index to a column frequently used in conditions. Then, look at the execution plan again. The table scan has changed to an index seek. The rows read dropped from 60,000 to 12. This is proof that the decision was correct.

### 実行計画で直す

**8:03** · What you must look at here is the name of the index used. If you made one but its name doesn't appear, your choice was wrong.

**8:12** · Check the plan every time you create an index. This is a habit. There is another method for heavy aggregation.

**8:19** · It's a Columnstore Index, which groups data by column. This works dramatically well for large summary tables. The step that took up 71%of the total is now 6%.

**8:31** · Resource usage has also decreased significantly. The important thing is to always compare before and after. You can save execution plans and compare them side by side. Next is about the writing style itself. Sometimes an index is not used even though it exists . The cause is wrapping a column in a function within the WHERE clause. The moment you process a column, the index becomes unusable. A bad example is using a YEAR function inside the WHERE clause. A good example is comparing by date range. Even if the meaning is the same, they are different to a database.

### サーガブルな書き方

**9:05** · There is a name for this style that allows index usage. Search Argumentable . Abbreviated as SARGable. It means it can be used as a search argument. There are three tips. Do not wrap columns in functions. Compare them as directly as possible. If absolutely necessary, consider calculated columns or function-based indexes. The things to fix are SELECT columns, WHERE conditions, and joins. These three areas account for most slowness.

### SQLヒント

**9:36** · Finally, I will introduce how to override the database's decisions.

**9:41** · These are called SQL hints. Databases create plans based on statistical information. If the statistics are old or there are too many indexes, it may decide incorrectly. You can force the join type to be a hash join. You can also force the access method to be an index seek. You can even specify the exact index to use by name. However, please use hints with caution. Faster performance in development doesn't guarantee the same in production.

**10:07** · Because if the data volume differs, the optimal plan changes. Also, do not make hints a permanent solution. Use them only as an emergency measure and always investigate the cause later. Is it outdated statistics or an incorrect index? That is where the real answer lies. Let's apply what we've discussed so far to an actual query. We will track a 250,000-row table until it becomes 10 rows. This query aggregates the number of orders and total spent per customer. We look only at orders from 2026 onwards and list the top 10 customers spending over 1000 yen.

### 実例で通しで追う

**10:39** · In the clause order, SELECT comes first.

**10:44** · But the first to execute are FROM and JOIN. There are 1,000 customers and 250,000 orders. This is the starting point. At the point of joining, nothing has been filtered yet. Next, the WHERE clause kicks in, removing orders before 2026. The 250,000 rows have decreased to 120,000. This single step cuts the workload of subsequent processes in half. GROUP BY consolidates the data into one row per customer. The 120,000 rows have become 8,400 groups. At this stage, COUNT and SUM are calculated.

**11:14** · HAVING applies to the 8,400 rows after aggregation. Only 310 customers had a total exceeding 1000. You cannot use this condition in a WHERE clause. That is because the totals do not exist yet.

**11:26** · Only now does the SELECT clause execute . Only the three columns for customer ID, order count, and total amount remain. ORDER BY sorts them by the total amount. Finally, LIMIT cuts it down to the top 10 rows. The 250,000 rows have become 10 rows. When you follow it through, the row count decreases like this. 250,000, 120,000, 8,400, 310, And 10. The process where you reduce the data most significantly determines the speed. The goal is to filter the data as early as possible.

**11:58** · If you filter late, you end up aggregating unnecessary data before discarding it. Even if the result is the same, the path taken differs in its cost. And to filter early, indexes are essential. If the WHERE clause conditions reach the index, the number of rows read decreases. If they don't reach it, you just end up reading everything and discarding the rest.

**12:18** · This is why understanding the execution order is important. Because the order shows you exactly where filtering will be effective. Now, let's take a look at the internal structure of that index.

### インデックスの中身

**12:28** · Understanding the mechanism lets you read which conditions work and which don't. An index is the same as the index at the back of a book. Without an index, you have to flip through every page to find the word you want. With an index, you can check the page number and jump straight there. A database index takes the form of a B-Tree. It is a tree that descends from the root to branches, and from branches to leaves.

**12:52** · The leaves are neatly arranged in the order of their values. When searching, you compare values as you descend from the root. With a three-level tree, you reach the leaf after only three comparisons. This is the true nature of an index search. When searching by range, you move horizontally from the reached leaf. Since the leaves are connected, you can read the subsequent data directly. This is why conditions like "greater than" or "less than" are so fast. There are also composite indexes that combine two columns. They are ordered exactly like names in a phone book.

**13:23** · First, they are sorted by surname, and then by given name within the same surname. That is why searching by surname alone is fast. Searching by both surname and given name is, of course, also fast. However, searching by given name alone means the index won't work. You must use columns starting from the leftmost one. This is the rule for composite indexes. There is another concept called a covering index. This is a method of including all the desired columns in the index itself. By doing this, the lookup to fetch the main data is eliminated.

**13:54** · However, indexes are not free. Every time you add or delete a row, the index must also be updated. In exchange for faster reads, writes become slower and storage usage increases. An unused index is just extra clutter. Indexes that don't appear in the execution plan are candidates for deletion. Finally, let’s summarize the procedure in the field. What to check first when encountering a slow query. First, don’t guess; output the execution plan. Next, select only the one step with the highest cost.

### 遅いクエリに出会ったら

**14:25** · If it’s a scan , index candidates will become visible.

**14:30** · After fixing it, check the plan again to see if it changed. The causes of ineffective indexes are usually these three. Wrapping columns in functions, or not using the leftmost column. And fetching everything with an asterisk, including unnecessary columns. Also, make sure to test with data close to production. In an environment with only 100 rows, any query looks fast.

**14:53** · Execution plans change if the volume of data changes. Measure before you fix.

**14:58** · Measure again after you fix. The execution plan is your measuring instrument for that. To summarize. The order of writing and the order of execution are different. FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, TOP . This order determines the reason for errors and the results. And the execution plan determines the actual procedure. Read from right to left, look for scans or seeks to find high-cost steps. Check the plan again after making a fix. This cycle is what optimization is all about.

### まとめ

**15:26** · If you found this video interesting or helpful, please subscribe to the channel and give it a like. See you next time. This is a PR message from the engineer recruitment agent, Tech-san. You can get free career counseling from the link in the description. Tech-san has three features: first, you can have interview prep sessions as many times as you like.

**15:51** · Typical agents don't offer mock interviews at all, or limit them to just once, but here you can practice repeatedly. Getting used to interviews makes it easier to highlight your achievements. Second, for busy people, we also offer one-day screening events.

**16:10** · We hold exclusive screening sessions featuring popular companies. Our one-day screening sessions, where you can complete all interviews in a single Saturday, are particularly popular.

**16:21** · This is recommended for engineers who are busy on weekdays. Third, we have plenty of high-income positions. Since we are run by the same company as MyVision, an agent specializing in high-class consulting jobs, we have many high-paying offers. It is recommended for those who want to work on large projects or target positions at mega-ventures. Please check the link in the description and try a free career consultation.