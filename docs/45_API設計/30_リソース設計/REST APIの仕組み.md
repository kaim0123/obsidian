---
title: "REST APIの仕組み"
source: "https://www.youtube.com/shorts/M2aeozjvvLw"
author:
  - "[[直也テック]]"
published:
created: 2026-09-26
description: "ぜひチャンネル登録をお願いします！ ⁨@naoya-tech-sub ====note====海外ソフトウェアエンジニアリング事例を発信https://note.com/naoya_tech====SNS====●Xhttps://x.com/naoyashiga●Threadshttps://www.threa..."
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=M2aeozjvvLw)

ぜひチャンネル登録をお願いします！ ⁨@naoya-tech-sub ====note====海外ソフトウェアエンジニアリング事例を発信https://note.com/naoya\_tech====SNS====●Xhttps://x.com/naoyashiga●Threadshttps://www.threa...

## 詳しい要約

**テーマ：REST API の基本ルールと仕組み**

API は 2 つのプログラムが通信するためのインターフェースで、REST（Representational State Transfer）はその最も普及した標準。仕様ではなく一連のルールに従う API を RESTful と呼び、シンプルで大半の用途に十分なため世界中で使われている。

---

### リソースとリクエストの構造

- 各リソースに一意の **URI** を割り当てる。URI は動詞ではなく **名詞**（`get-product` ではなく `products`）。
- リクエストは **開始行・ヘッダー・ボディ** の 3 部構成。開始行にはメソッド、URI、HTTP バージョン。
- メソッドは POST（作成）・GET（読み取り）・PUT（更新）・DELETE（削除）で、頭文字をまとめると **CRUD**。
- ボディには JSON でデータを入れ、ヘッダーには API キーなどの認証情報や `Content-Type`（JSON であること）を置く。

### レスポンスとステータスコード

- 200 番台 = 成功、400 番台 = クライアント側のエラー、500 番台 = サーバー側のエラー。
- 500 番台ならリトライしてよいが、POST は **二重登録** のリスクがある。
- 何度送っても結果が同じになる性質を **冪等性（idempotency）** という。

### REST の設計上のポイント

- 鍵は **ステートレス**。互いの状態を保持しないのでサーバーを際限なくスケールできる。
- 巨大なデータは `limit` と `offset` で切り出して返す（ページネーション）。
- URI に `v1`・`v2` のようなバージョンを付ければ、破壊的変更をしてもユーザーを徐々に移行できる。

### 具体例：ドーナツ店の商品一覧

- 一覧取得は GET、売り切れ商品の置き換えは ID 付きの PUT。
- 新商品の追加は POST でボディに名前を入れ、新しい ID と作成内容が返る。

### まとめ

- 名詞の URI ＋ HTTP メソッドで CRUD を表現する。
- ステータスコードと冪等性を意識してリトライを設計する。
- ステートレス性・ページネーション・バージョニングが REST のスケールと進化を支える。

## Transcript

**0:00** · How REST APIs work. Most Web and server communication runs on this protocol. An API is an interface for two programs to communicate. REST has become the most widespread standard for this. It stands for Representational State Transfer. An API that follows a set of rules rather than a specification is called RESTful.

**0:20** · The basic principle is to assign each resource to a unique URI. URIs should use nouns, not verbs; "products" instead of "get-product." The first line of a request contains the verb, URI, and HTTP version. POST for create, GET for read, PUT for update, and DELETE for delete. Putting these initials together spells CRUD. The data to be sent is placed in the body as JSON. Requests consist of three parts: the start line, headers, and the body.

**0:47** · Authentication info like API keys is placed in these headers. The Content-Type is used to specify that the body is JSON. The server processes the request and returns it with a status code at the top. 200-range codes mean success. 400-range codes mean an error on our side. 500-range codes mean something went wrong on the server side . If you get a 500-range code, it is safe to retry. However, POST requests carry the risk of double-registration.

**1:11** · The property where results stay the same no matter how many times you send it is called idempotency. The key to REST is being stateless. Since they don't store each other's state, you can scale servers indefinitely. Huge datasets are sliced and returned using limit and offset. By adding versions like V1 or V2 to the URI, you can slowly migrate users even if you make breaking changes. Here is a concrete example. Let's consider a list of products at a donut shop. Use GET to retrieve them. Use PUT with an ID to replace items that are sold out.

**1:39** · Use POST to add new items, including the name in the body. It returns the new ID and the created content. It is simple and sufficient for most purposes, which is why it's used worldwide. That is the true nature of a REST API.