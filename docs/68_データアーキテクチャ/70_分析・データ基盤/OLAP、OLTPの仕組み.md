---
title: "OLAP、OLTPの仕組み"
source: "https://www.youtube.com/shorts/0qlRQRYNAkk"
author:
  - "[[直也テック]]"
published:
created: 2026-09-26
description: "ぜひチャンネル登録をお願いします！​ @naoya-tech-sub ====note====海外ソフトウェアエンジニアリング事例を発信https://note.com/naoya_tech====SNS====●Xhttps://x.com/naoyashiga●Threadshttps://www.threa..."
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=0qlRQRYNAkk)

ぜひチャンネル登録をお願いします！​ @naoya-tech-sub ====note====海外ソフトウェアエンジニアリング事例を発信https://note.com/naoya\_tech====SNS====●Xhttps://x.com/naoyashiga●Threadshttps://www.threa...

## 詳しい要約

**テーマ：OLTP と OLAP の違いは「行指向か列指向か」というデータの並べ方**

OLTP（Transactional）はアプリを動かす DB、OLAP（Analytical）は分析用の DB。違いはディスク上のデータの並べ方に表れ、OLTP は行指向、OLAP は列指向で、読み方・保存の仕方そのものが変わる、というのが要点。

---

### OLTP と OLAP の役割

| | OLTP | OLAP |
|---|---|---|
| 用途 | アプリを動かす。ログイン・購入・予約など小さな処理を大量にさばく | 分析。例：Spotify の「Wrapped」 |
| 代表例 | MySQL、Postgres、MongoDB | ClickHouse、BigQuery、Redshift |
| データ配置 | **行指向**（1 行をまとめて保存） | **列指向**（列ごとにまとめて保存） |

- OLAP の中核は **OLAP キューブ**：地域・時間・商品などの次元を加え、データを立体的に見る。

### ディスク上の並べ方の違い

- 例：ユーザーテーブル（ID・名前・メール・住所・登録日）。
- **OLTP（行指向）**：あるユーザーの ID の隣にメールや住所が並ぶ。ディスクは **4KB 単位**で読むので、1 行がまとまっていれば 1 回の読み込みで済む。
- ただし登録日だけを集計したいとき、行指向では不要な住所データまで読まされる。
- **OLAP（列指向）**：ID は ID、名前は名前、登録日は登録日でまとまる。登録日の部分だけを一直線に読めて無駄がない。
- 同じ値が連続するので**圧縮**が効く（「10 月 25 日」が続くなら「×4 件」とまとめられる）。

### まとめ

- 両方をカバーする **HTAP** もあるが、大規模システムでは分けるのが一般的。
- 実際のシステムでは **OLTP のデータを OLAP へ流し込み**、日々の業務とそこから得る洞察の両方を得る。
- 行指向の OLTP と列指向の OLAP は、データの読み方と保存の仕方を変える。

## Transcript

**0:00** · The difference between OLAP and OLTP comes down to one letter: Analytical or Transactional. OLTP is the database that powers applications, handling a high volume of small tasks like logins, purchases, and reservations; MySQL, Postgres, and MongoDB are in this group . OLAP is a database for analysis.

**0:19** · Think of Spotify’s "Wrapped"—that is OLAP's job. ClickHouse, BigQuery, and Redshift belong here. At the core of OLAP is the OLAP cube. You add dimensions like region, time, and product to view data in three dimensions. This difference manifests in how data is arranged on the disk.

**0:36** · Here is a user table. ID, name, email, address, registration date. OLTP stores an entire row together. It is row-oriented. Next to a user's ID, the user's email and address are placed.

**0:48** · Disks read data in 4KB chunks. If a row is packed together, a single read is sufficient. However, if you want to aggregate just the registration dates, row-oriented storage forces you to read unnecessary address data. OLAP is column-oriented, grouping data by column. IDs are all together. Names are all together. Registration dates are all together. You only need to read the registration date section in a straight line, eliminating wasted reads. Since identical values repeat, you can compress "October 25th" into "4 entries ."

**1:16** · There is HTAP which covers both, but they are separated in large-scale systems. In systems, we stream OLTP data into OLAP. We need both daily operations and the insights gained from them. Row-oriented OLTP and column-oriented OLAP change how you read and store data. That is the true nature of OLTP and OLAP.