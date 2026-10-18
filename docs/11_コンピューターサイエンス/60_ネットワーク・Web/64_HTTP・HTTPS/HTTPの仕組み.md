---
title: "HTTPの仕組み"
source: "https://www.youtube.com/shorts/CHQ9RjYFcH0"
author:
  - "[[直也テック]]"
published:
created: 2026-09-26
description: "ぜひチャンネル登録をお願いします！​ ⁨@naoya-tech-sub   ====note====海外ソフトウェアエンジニアリング事例を発信https://note.com/naoya_tech====SNS====●Xhttps://x.com/naoyashiga●Threadshttps://www.th..."
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=CHQ9RjYFcH0)

ぜひチャンネル登録をお願いします！​ ⁨@naoya-tech-sub ====note====海外ソフトウェアエンジニアリング事例を発信https://note.com/naoya\_tech====SNS====●Xhttps://x.com/naoyashiga●Threadshttps://www.th...

## 詳しい要約

**テーマ：HTTP/1.0 から HTTP/3 までの進化**

HTTP はクライアントのリクエストとサーバーのレスポンスのルール。バージョンアップの歴史は「接続を作り直すのをやめ、ボトルネックを 1 つずつ取り除いてきた」歴史である。

---

### HTTP/1.0 → HTTP/1.1

- **HTTP/1.0**：リクエストのたびに接続を破棄。画像・CSS・JS ごとに **TCP と TLS のハンドシェイク**をやり直していた
- **HTTP/1.1**：接続を維持し、ハンドシェイクは最初の 1 回だけ。25 年たった今も現役
- ただしレスポンスの順番はリクエスト順に固定で、先頭が遅れると後ろが全部詰まる（**Head-of-Line ブロッキング**）
- ブラウザ側は**ドメインシャーディング**や画像・CSS の**バンドル**で回避していた

### HTTP/2

- 通信を**バイナリフレーム**に分割し、1 つの接続に複数のフレームを混ぜて送り、受信側で組み立て直す
- ヘッダーは **HPACK** で圧縮し、前回送った部分を省略
- それでも詰まりは残った。根本原因は **TCP**：パケットが 1 つ失われると全ストリームが待たされる

### HTTP/3

- TCP をやめ、Google が作った UDP ベースの **QUIC** を採用
- ストリームが独立しており、1 つが落ちても他は進む
- 接続確立と暗号化を同時に行い、**1 往復または 0 往復**で通信開始
- **コネクション ID** を使うため、ネットワークが切り替わっても接続が切れない

### まとめ

- 1.0 → 1.1 で接続の使い回し、2 でフレーム多重化とヘッダー圧縮、3 で TCP 自体を QUIC に置き換え
- HTTP の進化は、接続の作り直しとボトルネックを順に取り除いてきた歴史

## Transcript

**0:00** · How HTTP works: the client requests, and the server responds. The rules for those requests are what we call HTTP.

**0:07** · In HTTP/1.0, the connection was discarded after every single request.

**0:11** · Before the connection, you need a TCP and TLS handshake. For every image, CSS , or JS file, you had to redo that handshake. HTTP/1.1 keeps the connection open. The handshake is done just once at the start, and it’s still in use 25 years later. You can send requests without waiting, but the response order is fixed to the request order. If the lead request is delayed, everything behind it gets stuck.

**0:34** · Browsers avoided this Head-of-Line blocking as much as they could.

**0:38** · Workarounds included domain sharding or bundling images and CSS. In HTTP/2, communication is broken down into binary frames. Multiple frames are mixed into one connection, then reassembled by the receiver. Headers are compressed via HPACK, omitting parts sent previously. Even then, some congestion remained. The root cause is TCP. If one packet is lost, all streams are forced to wait. HTTP/3 drops TCP and uses QUIC instead. QUIC is made by Google and built on UDP.

**1:07** · Streams are independent, so if one drops, the others continue. Connection and encryption happen at once, starting in one or zero round trips. It uses connection IDs, so it doesn't break if your network changes. HTTP/1.1 is still active today. We stopped rebuilding connections and cleared the bottlenecks one by one. This is what HTTP really is .