---
title: "SSHの仕組み"
source: "https://www.youtube.com/shorts/7pKRT00HAgg"
author:
  - "[[直也テック]]"
published:
created: 2026-09-26
description: "====note====海外ソフトウェアエンジニアリング事例を発信https://note.com/naoya_tech====SNS====●Xhttps://x.com/naoyashiga●Threadshttps://www.threads.com/@naoya_tech●直也テック TikTokhttp..."
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=7pKRT00HAgg)

\====note====海外ソフトウェアエンジニアリング事例を発信https://note.com/naoya\_tech====SNS====●Xhttps://x.com/naoyashiga●Threadshttps://www.threads.com/@naoya\_tech●直也テック TikTokhttp...

## 詳しい要約

**テーマ：SSH の仕組み ― 暗号化・鍵認証・トンネル**

SSH はリモートサーバーに安全にアクセスするための仕組み。パスワードやコマンドを平文で送っていた Telnet と違い、すべてを暗号化する。鍵交換で暗号化トンネルを作り、公開鍵認証で本人を証明し、ポートフォワーディングで内部ネットワークへの経路にもなる。

---

### 暗号化トンネルの確立

- Telnet は「はがき」のように中身が丸見えだったが、SSH は鍵付きケースに入れてすべてを暗号化する。
- まずポート 22 に接続して暗号化トンネルを作る。最初の壁は鍵をどう安全に共有するか。
- 公開鍵と秘密鍵のペアを使う（公開鍵は「開いた南京錠」のようなもの）。互いに交換するのは公開鍵だけで秘密の値は送らないのに、双方が同じ **セッション鍵** を計算できる。
- セッション鍵は接続ごとに作り直す使い捨て。以降は同じ鍵を使う **共通鍵暗号** で通信し、こちらの方がずっと高速。ここまでがログインプロンプト前の数秒で起きる。

### 公開鍵認証（誰であるかの証明）

- トンネルができても「誰か」はまだ分からない。ローカルで鍵ペアを作り、**公開鍵だけ** をサーバーの `authorized_keys` に置く。
- 接続時にサーバーがチャレンジを送り、クライアントは秘密鍵で所有を証明、サーバーは公開鍵で検証する。**パスワードは一切送られない**。
- EC2 で使う PEM ファイルの正体は秘密鍵。GitHub への push も同じ仕組みで、登録した公開鍵で本人確認される。

### ポートフォワーディング

- ローカルの 3306 番ポートを、踏み台（ジャンプホスト）経由で内部 DB につなげられる。アプリは localhost に接続しているつもりのまま使える。

### まとめ

- SSH の 3 要素は **暗号化**・**鍵による認証**・**トンネル**。
- 鍵交換では秘密を送らずに共通のセッション鍵を作り、その後は高速な共通鍵暗号で通信する。
- 公開鍵認証はパスワードを送らない。EC2 の PEM や GitHub の SSH キーも同じ仕組み。

## Transcript

**0:00** · SSH is a system for securely accessing remote servers. Old Telnet sent passwords and commands in plain text.

**0:08** · Unlike a postcard, SSH uses a locked case to encrypt everything. First, connect to port 22 to establish an encrypted tunnel. The first hurdle is how to share this key securely. We use a pair of public and private keys. The public key is like an open lock. They only exchange public keys; secret values are never sent. Yet, both sides can calculate the same session key.

**0:31** · This key is regenerated for every single-use connection. After that, it uses symmetric encryption with the same key. This is much faster. Everything up to here happens in seconds before the login prompt. But even with a tunnel, who you are is still unknown. Create a key pair locally and place only the public key on the server. It goes into a file called "authorized\_keys". When you connect, the server sends a challenge. The client proves ownership using the private key. The server verifies it using the public key. No passwords are ever sent. The PEM file used with EC2.

**1:03** · That is the private key in disguise. Pushing to GitHub works using the same mechanism. Register your public key, and it verifies you to let you through. Another weapon is port forwarding. Your local port 3306 connects to the internal DB via a jump host. The app thinks it is still connecting to localhost. Encryption and key-based authentication. And the tunnel. This is SSH.