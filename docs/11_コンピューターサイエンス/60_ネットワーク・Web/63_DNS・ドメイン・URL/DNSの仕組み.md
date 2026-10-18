---
title: "DNSの仕組み"
source: "https://www.youtube.com/shorts/-CUTO89q-_s"
author:
  - "[[直也テック]]"
published:
created: 2026-09-26
description: "====note====海外ソフトウェアエンジニアリング事例を発信https://note.com/naoya_tech====SNS====●Xhttps://x.com/naoyashiga●Threadshttps://www.threads.com/@naoya_tech●直也テック TikTokhttp..."
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=-CUTO89q-_s)

\====note====海外ソフトウェアエンジニアリング事例を発信https://note.com/naoya\_tech====SNS====●Xhttps://x.com/naoyashiga●Threadshttps://www.threads.com/@naoya\_tech●直也テック TikTokhttp...

## 詳しい要約

**テーマ：DNS が名前を IP アドレスに変える仕組み**

通信先は数字の IP アドレスだが、人は名前で覚える。DNS はその名前を数字に変える「インターネットの電話帳」であり、世界中に分散した階層構造とキャッシュによって数十ミリ秒で答えを返す。

---

### なぜ分散システムなのか

- ブラウザに URL を入れたとき、最初に動くのが DNS。
- 登録ドメインは **3 億 5000 万以上**あり、1 台のサーバーでは到底さばけない。だから DNS は世界に分散している。

### 名前解決の流れ

- 最初の窓口は **DNS リゾルバー**（ISP、Cloudflare、Google などの公開リゾルバー）。
- リゾルバーがたどるネームサーバーは **ルート → TLD → 権威サーバー** の 3 層。
  - ルートサーバーは **13 系統**あり、**Anycast** で最寄りにつながる。ルートが知っているのは TLD の場所だけ。
  - 実際の答えを持つのは一番下の**権威サーバー**。

1. まず**ブラウザと OS のキャッシュ**を確認する。
2. なければ**リゾルバー**に問い合わせる。
3. リゾルバーも持っていなければ**ルート**に聞き、`.com` 担当のサーバーを教わる。
4. `.com` サーバーが**権威サーバー**の場所を返す。
5. 権威サーバーから IP アドレスを得て、ようやく接続できる。この往復は数十ミリ秒で終わる。

### キャッシュと TTL

- 毎回たどるのは無駄なので、各段階でキャッシュする。その有効期限が **TTL**。
- そのため DNS の変更はすぐには反映されない。**切り替え前に TTL を短くしておく**のが定石。

### まとめ

- DNS は名前を IP に変える、世界規模の分散システム。
- リゾルバー → ルート → TLD → 権威サーバーの順にたどる。
- キャッシュと TTL のおかげで速いが、変更の反映には時間がかかる。

## Transcript

**0:00** · How DNS works: When you type a URL into your browser, DNS is the first thing that moves. The destination for communication is an IP address, just a string of numbers. Instead of memorizing them, we use names. DNS is the internet's phonebook, turning names into numbers. There are over 350 million registered domains. A single server could never handle all of that.

**0:22** · That is why DNS is a distributed system across the world. The first point of contact is the DNS resolver. These are public resolvers from ISPs, Cloudflare, or Google. The name servers the resolver follows are in three layers.

**0:37** · Root, TLD, and then the authoritative server. There are 13 root servers, connecting to the nearest one via Anycast. All the root knows is the location of the TLDs. The one with the actual answer is the authoritative server at the bottom. First, it checks the browser and OS cache. If it is not in either, it queries the resolver. If the resolver doesn't have it, it finally goes to ask the root. The root tells us which server is in charge of .com. The .com server returns the location of the authoritative server.

**1:07** · Only then do we get the IP address and can connect. This round trip is completed in just a few dozen milliseconds. Since doing this every time is wasteful, we cache at each level. The expiration time for that is called TTL. That is why DNS changes do not propagate immediately. It is standard practice to shorten the TTL before switching. This simple name-lookup mechanism is the foundation of the internet.