---
title: "なぜALBでエラーになる？実はわかっていないHTTPを図解で完全理解｜バージョン・通信経路・HTTP/1.1・2・3・gRPC"
source: "https://www.youtube.com/watch?v=BEQLQHmMymc"
author:
  - "[[ぎゅぎゅっとテック]]"
published: 2026-10-08
created: 2026-10-18
description: "HTTP/2 や HTTP/3 は、誰が、どこで決めているのか。AWS の ALB でターゲットグループを作るとき、Protocol version に HTTP1・HTTP2・gRPC が並んでいます。何を基準に選んでいますか。この動画では、HTTP/1.1 が何に困っていて、HTTP/2 がそれを 1 本の接続の中でどう解き、HTTP/3 がなぜ TCP をやめて QUIC にしたのかを"
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=BEQLQHmMymc)

HTTP/2 や HTTP/3 は、誰が、どこで決めているのか。  
AWS の ALB でターゲットグループを作るとき、Protocol version に HTTP1・HTTP2・gRPC が並んでいます。何を基準に選んでいますか。  
  
この動画では、HTTP/1.1 が何に困っていて、HTTP/2 がそれを 1 本の接続の中でどう解き、HTTP/3 がなぜ TCP をやめて QUIC にしたのかを、全体像の図と具体を行き来しながら説明します。  
後半は AWS です。ブラウザと ALB の間（フロント側）と、ALB とアプリの間（ターゲット側）でバージョンが別々に決まること、Protocol version の 9 通りの組み合わせのどこでエラーになるか、本番で切り替える手順、gRPC が HTTP/2 の上で動く理由までつなげます。  
  
▼ こんな人に  
・HTTP・GET・POST・HTTPS は知っているが、HTTP/1.1・2・3 の違いを説明できない  
・ALB を作ったことはあるが、Protocol version を何となく選んでいる  
・QUIC や gRPC と HTTP の関係がつながっていない  
  
▼ チャプター  
0:00 導入  
1:22 第 1 部 HTTP はどこにいる  
3:19 第 2 部 HTTP/1.1 の困りごと  
5:20 第 3 部 HTTP/2  
9:29 第 4 部 HTTP/2 で完成？  
11:07 第 5 部 HTTP/3  
11:33 第 6 部 UDP なのに、なぜ使えるのか  
13:45 第 7 部 TLS の回の続き（QUIC と TLS 1.3）  
15:23 第 8 部 AWS では誰がバージョンを決めるのか  
17:34 第 9 部 ALB・NLB と HTTP/3  
19:05 第 10 部 最新を選べばよいのか  
20:09 第 11 部 本番で HTTP/2 に切り替える  
24:57 第 12 部 gRPC は HTTP とは別物なのか  
27:25 第 13 部 手元で動いた gRPC が AWS で動かない  
29:55 第 14 部 全部つなげる  
  
▼ この動画の前に（シリーズ「ITの仕組み入門｜しくみを図解でゼロから」）  
・TCP/IP の回: https://www.youtube.com/watch?v=AlJXwfOCYhg  
・TLS の回: https://www.youtube.com/watch?v=INN1c5DWVys  
再生リスト: https://www.youtube.com/playlist?list=PLXlTlS8raBns  
  
  
▼ 再生リスト「ITの仕組み入門｜しくみを図解でゼロから」  
https://youtube.com/playlist?list=PLXlTlS8raBns&si=5LyXZszBmRe7F\_NC  
▼ 手元の実験について  
画像 30 枚の取得時間・ALPN・gRPC の呼び出しは、手元の Go のサーバーと curl で測りました。  
「ALB の後ろのバージョンの食い違いで gRPC が失敗する」場面は、ALB そのものではなく、手元の Go の中継で同じ形の失敗を再現したものです。本物の ALB が返す状態コード（464）は、AWS のドキュメントに基づいています。  
  
▼ 参考文献  
【HTTP の仕様（RFC）】  
・RFC 9110 HTTP Semantics（HTTP の意味）: https://www.rfc-editor.org/rfc/rfc9110  
・RFC 9112 HTTP/1.1: https://www.rfc-editor.org/rfc/rfc9112  
・RFC 9113 HTTP/2: https://www.rfc-editor.org/rfc/rfc9113  
・RFC 9114 HTTP/3: https://www.rfc-editor.org/rfc/rfc9114  
・RFC 9000 QUIC: https://www.rfc-editor.org/rfc/rfc9000  
・RFC 9001 QUIC と TLS: https://www.rfc-editor.org/rfc/rfc9001  
・RFC 7301 ALPN: https://www.rfc-editor.org/rfc/rfc7301  
・RFC 9293 TCP: https://www.rfc-editor.org/rfc/rfc9293  
・RFC 768 UDP: https://www.rfc-editor.org/rfc/rfc768  
  
【AWS のドキュメント】  
・ALB のターゲットグループ（Protocol version と 9 通りの表）: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-target-groups.html  
・ALB のリスナー: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-listeners.html  
・ALB のアクセスログ: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html  
・ALB のトラブルシューティング（HTTP 464）: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-troubleshooting.html  
・ModifyTargetGroup: https://docs.aws.amazon.com/elasticloadbalancing/latest/APIReference/API\_ModifyTargetGroup.html  
・NLB のリスナー（QUIC のパススルー）: https://docs.aws.amazon.com/elasticloadbalancing/latest/network/load-balancer-listeners.html  
  
【gRPC】  
・gRPC over HTTP/2: https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md  
・gRPC Core concepts: https://grpc.io/docs/what-is-grpc/core-concepts/  
  
※ AWS のドキュメントは 2026 年 10 月 8 日に確認した内容です。  
  
#http #grpc #protocol #tls #it #technology #computerscience #テクノロジー #https  
#ぎゅぎゅテク  
#ぎゅぎゅっとテック

## 詳しい要約

**テーマ：HTTP のバージョンは誰がどこで決めるのか（HTTP/1.1・2・3、QUIC、ALB、gRPC）**

HTTP/1.1 の行列問題を HTTP/2 が 1 本の接続内の多重化で解き、残った TCP の行頭ブロッキングを HTTP/3 が QUIC（UDP 上）で解いた流れを、手元の実測を交えて解説する。後半は AWS で、ブラウザ〜ALB（フロント側）は ALPN で、ALB〜アプリ（ターゲット側）はターゲットグループの Protocol version で別々に決まることを示す。冒頭の「手元で動いた gRPC が ALB 経由で失敗する」原因は、ターゲット側が既定の HTTP/1.1 のままだったことだと結論づける。

---

### 第 1 部 HTTP はどこにいるか

- DNS で IP を得て、TCP で経路を張り、HTTPS なら TLS で暗号化の準備をした後、ようやく HTTP の出番。層は下から IP → TCP → TLS → HTTP。
- 下の層は「安全・確実に運ぶ」役、HTTP は**何を頼み何を返すか（リクエストとレスポンス）**を決める側。
- curl で `GET / HTTP/1.1` → `HTTP/1.1 200 OK`。この 1 往復が最小単位。HTML に書かれた CSS・JS・画像をさらに取りに行くので、1 ページで 30 以上のリクエストが発生（手元の例では画像 30 枚）。リクエストをいかに速くさばくかがページ速度を決める。

### 第 2 部 HTTP/1.1 の困りごと

- HTTP/1.1 は古いから悪いわけではなく、**持続的接続（Keep-Alive）**で 1 本の接続を再利用でき、接続の往復を節約した。
- ただし 1 本の接続内では 1 つずつ。**パイプライン**でも応答は頼んだ順に返す決まりなので、先頭が遅いと後ろが待たされる＝**HTTP の行頭ブロッキング（head-of-line blocking）**。
- 実測（各画像 200ms）：1 接続で 30 枚 → **約 6044ms**（200ms × 30）、最大 6 接続 → **1024ms**。
- 接続を増やす回避策は、接続ごとの往復・TLS 準備・TCP の輻輳制御が別々にかかり、ネットワーク効率を下げる。

### 第 3 部 HTTP/2：1 本の接続で同時に

- 中身を**フレーム**（長さ・種類が決まった位置に書かれたバイナリ）に分け、リクエストとレスポンスの組に番号を振った**ストリーム**に属させる。複数ストリームのフレームを 1 本の接続に混ぜる＝**多重化**。
- ヘッダーは **HPACK** で圧縮（送った名前と値の表を双方が持ち、繰り返しは番号で送る）。
- **HTTP の意味は変わらない**（GET と 200 はそのまま）。変わったのは運び方。HTTP/1.1 の開始行（start line）はなくなり、`:method`・`:path`・`:status` のようなコロン始まりの特別なフィールドで送る。リクエストにバージョンの欄はなく、**バージョンは接続で決まる**。
- 実測：1 本の HTTP/2 接続で 30 枚同時 → **215ms**。
- バージョンの決定は TLS の **ALPN**：ClientHello で curl が `h2` と `http/1.1` を提案し、サーバーが選んで EncryptedExtensions で返す。HTTP/2 非対応サーバーは http/1.1 を選び、それでもページは正しく返る。追加の往復は不要なので、自分で HTTP/2 を指定した覚えがないのはこのため。暗号化しない HTTP/2 は ALPN を使わず最初から HTTP/2 で話す方法もある（gRPC など）。

### 第 4 部 HTTP/2 で完成？

- HTTP/2 の仕様自体が **TCP の行頭ブロッキング**は解決しないと書いている。
- TCP は順番どおり届けるのが約束なので、パケット 2 が消えると、届いているパケット 3・4 も 2 の再送まで上に渡さない。画像 1 のフレームが消えると、届いている画像 2 も止まる。TCP からはストリームの区別が見えず、1 本のバイト列にすぎない。
- 上の層の行列を解いても、下の層で詰まった。

### 第 5〜6 部 HTTP/3 と QUIC：UDP なのになぜ使えるのか

- HTTP/3 は意味を保ったまま、TCP ではなく **QUIC** の上で動き、QUIC は **UDP** の上で動く。
- UDP 自体は到着も重複なしも保証しないが、QUIC は**独自に消失検知・再送・輻輳制御**を持ち、UDP はパケットを運ぶ土台として使うだけ。UDP の上に作ったのは既存のシステムやネットワークを通りやすいから。
- QUIC もストリームを持ち、**ストリームごとに**確実・順番どおり届けるが、ストリームをまたいだ順序は守らない → 画像 1 の消失で画像 2 は止まらない。
- ストリーム間の順序が保証されないため、ヘッダー圧縮は HPACK から **QPACK** に変更。
- UDP を通さないネットワークでは TCP 版（HTTP/2・1.1）を使う。ブラウザは多くの場合 TCP 版で始め、応答の **Alt-Svc** ヘッダーで HTTP/3 対応を知り、次に QUIC で ALPN に `h3` を指定して試す。

### 第 7 部 QUIC と TLS 1.3

- 従来の HTTPS：TCP で 1 往復 + TLS 1.3 で 1 往復 = 2 往復してから HTTP リクエスト。
- QUIC は暗号化の準備と転送の準備をまとめ、新規接続でも基本は **1 往復**で送れる。
- 中身は TLS 1.3 のハンドシェイク（ClientHello・ServerHello・Certificate・Finished）そのものだが、TCP 上の TLS レコードではなく QUIC が直接運ぶ。QUIC は TLS で鍵生成と相手確認をし、TLS は QUIC の確実な配送を使う。**積み重ねではなく協調**。ALPN はそのままで名前は `h3`。以前通信した相手には **0-RTT**（名前の紹介のみ）。

### 第 8 部 AWS では誰がバージョンを決めるか

- ブラウザと Go アプリの間に ALB があるとき、ブラウザの接続は **ALB で終わり**、ALB からアプリへ新しい接続を張る。接続は 2 つに分かれる。
  - **フロント側**（クライアント〜ALB）：**リスナー**で設定。HTTP/2 は HTTPS リスナーで使え（ALPN は TLS 内なので 80 番の HTTP は 1.1 のまま）、**既定で有効**。クライアントは HTTP/2 か 1.1 で接続できる。
  - **ターゲット側**（ALB〜アプリ）：**ターゲットグループの Protocol version**（HTTP1／HTTP2／gRPC、未選択なら **HTTP1**）。ALPN ではなく自分で選ぶ。
- フロントが HTTP/2、ターゲットが HTTP/1.1 はよくある形で、ALB が中継しながらバージョンを変える。HTTP の意味がバージョンに依存しないから可能。「HTTP/2 にして」と言われたら**どの区間か**を聞き返す。

### 第 9 部 ALB・NLB と HTTP/3

- **ALB は L7**（HTTP 層）：HTTP の中身を読み、パス・ヘッダー・メソッドでルーティング。
- **NLB は L4**（TCP/UDP 層）：TCP・TLS・UDP・QUIC を扱い、接続・パケット単位で運ぶ。
- NLB は QUIC を扱えるが HTTP/3 を理解するとは限らない。QUIC リスナーには証明書がなく中身を復号できず、ターゲットごとにサーバー ID を登録し、**パススルー**で運ぶ。QUIC と HTTP/3 を話すのは先のアプリ。

### 第 10 部 最新を選べばよいのか

- 基準は新しさではなく**解きたい問題**（HTTP/2＝1 接続内の行列、HTTP/3＝TCP の行頭ブロッキングと接続準備の往復）が実際に起きているか。
- 確認事項：クライアントの対応、使う AWS サービスの対応、後ろのアプリが話せるか、経路（UDP を遮断するネットワーク、途中のプロキシやファイアウォール）、切り替え後にログとメトリクスで追えるか。
- ALPN でフォールバックできる区間（ブラウザ〜ALB）は新しいバージョンを有効にしても安全寄り。自分のアプリが話すバージョンを変える区間は相手の対応を先に確認。

### 第 11 部 本番で HTTP/2 に切り替える

- **フロント側**：有効にすると ALB は全リクエストに**厳格な HTTP/2 のヘッダー検査**をかける（ヘッダー名は英数字とハイフンのみ。自作クライアントのアンダースコア入りヘッダーは失敗）。HTTP/1.1 のクライアントも対象なので、事前に送っているヘッダーを確認。
- **ターゲット側**：AWS ガイドの 9 通りの表（左＝ALB に届く形、右＝Protocol version）。

| 届く形 ＼ Protocol version | HTTP/1.1（既定） | HTTP/2 | gRPC |
|---|---|---|---|
| HTTP/1.1 | 成功 | **エラー** | **エラー** |
| HTTP/2 | 成功（ALB が 1.1 に変換） | 成功 | POST のときだけ成功 |
| gRPC | **エラー** | アプリが gRPC 対応なら成功 | 成功 |

- エラーの 3 パターンで ALB は **464** を返す。gRPC は HTTP/2 のストリーム上の仕組みなので 1.1 区間には乗らない。gRPC は定義上 POST で送る。
- ブラウザは大抵 ALPN で HTTP/2 で来るので、注意すべきは**ブラウザ以外**（1.1 しか話さない古いライブラリ、自作クライアント、他サービスからの呼び出し、ALB の前の CDN などのプロキシの送り方）。ALB アクセスログの先頭フィールド（`h2` か、TLS 上の HTTP/1.1 なら `http`）やリクエスト行で、残っている HTTP/1.1 を数えてから切り替える。
- Protocol version は**作成後に変更できない**ので新しいターゲットグループを作り、ヘルスチェックも見直す（gRPC では成功条件が HTTP ステータスではなく gRPC コード）。新グループにアプリを登録しヘルスチェック通過を確認してからルールの転送先を変える。**重み付き転送**で少しずつ移し、エラー率と応答時間を比べ、問題があれば重みを戻す。同一ルールに異なるバージョンのグループを置けるかは事前に AWS ガイドで確認し、本番と同じ構成で接続と負荷を試す。

### 第 12 部 gRPC は HTTP とは別物か

- 別物ではなく比較の階層が違う。**HTTP**＝リクエストとレスポンスの規格、**REST と RPC**＝その上での API の形の考え方、**gRPC**＝RPC の具体的な実装。
- RPC（Remote Procedure Call）は他マシンの処理をローカル関数のように呼ぶ考え方。REST は `GET /user/123` のようにメソッドとパスで表す。
- gRPC は呼べる関数の一覧を**サービス**として通常 **Protocol Buffers** で定義し、クライアントとサーバーのコードを生成。呼び出しは HTTP/2 フレームに乗せ、**1 呼び出し＝1 ストリーム**。メソッドは POST、パスはサービス名と関数名（例：`/grpc.health.v1.Health/Check`）、Content-Type は `application/grpc`。
- 4 種類：**Unary**（1 対 1）、**サーバーストリーミング**、**クライアントストリーミング**、**双方向ストリーミング**。1 ストリーム内で複数フレームを送り終了フラグで終わりを示せ、ストリームは多重化できるから可能。

### 第 13 部 手元で動いた gRPC が AWS で動かない

- 切り分け順：ターゲットグループでアプリが healthy か → ALB アクセスログでエラーが ALB 由来かアプリ由来か → アプリのログ。アプリに処理の記録がない → 経路を疑う。
- ターゲットグループの Protocol version が未選択の既定 **HTTP/1.1** で、gRPC を 1.1 で送っていた（表の「gRPC → HTTP/1.1 はエラー」）。
- 手元の Go の中継（前で HTTP/2、後ろへ HTTP/1.1）で再現すると `unavailable`（中継は bad gateway を返し Content-Type なし。本物の ALB なら 464）。後ろを HTTP/2 にすると成功。※ ALB そのものではなく手元での再現。
- gRPC アプリなら Protocol version を **gRPC** に。HTTP/2 でも gRPC でも 4 種類の呼び出しに対応するが、gRPC にすると ALB が gRPC 呼び出しとして扱い、サービス名・メソッド名でのルーティングや gRPC ヘルスチェックが可能。gRPC は **HTTPS リスナーでのみ**動く。作成後は変更できないので新しいグループを作って切り替える。
- 原因はアプリでもセキュリティグループでもなく、**ALB とアプリの間の HTTP バージョンの食い違い**。

### 第 14 部 全部つなげる（問いへの答え）

- 誰が HTTP/2 を決めるか：フロント側はブラウザが ALPN で提案し ALB が選ぶ。ターゲット側は Protocol version で自分が選ぶ。
- なぜ HTTP/3 か：HTTP/2 で HTTP 層の行列は解けたが TCP の行頭ブロッキングが残ったから。UDP で大丈夫か：QUIC が再送と輻輳制御を自前で行う。
- ALB は HTTP を読み、NLB は HTTP より下を運ぶ。最新を使うべきかは、解く問題・経路・相手の対応で決める。gRPC は HTTP/2 のストリームで関数呼び出しを運ぶ仕組み。

### まとめ

- HTTP の**意味は不変**で、バージョンごとに変わったのは運び方（1.1 のテキスト → 2 のフレーム・ストリーム・多重化 → 3 の QUIC/UDP）。
- **ALB で接続は 2 つに分かれ**、フロント側は ALPN、ターゲット側は Protocol version（既定 HTTP/1.1・作成後変更不可）で別々に決まる。食い違いは 464。
- gRPC は HTTP/2 の上で動くので、ALB 経由なら Protocol version を gRPC（HTTPS リスナー必須）にし、新グループ＋重み付きで切り替える。
- 「どの区間で何が決まるか」を知っていれば、障害の最初の疑いどころがわかる。

## Transcript

### 導入

**0:00** · Have you ever created an ALB load balancer on AWS? You have to set up a target group to connect your app behind the ALB. Inside that, there is an item for protocol version. You can choose from three options: HTTP/1, HTTP/2, and gRPC. What criteria are you using to choose here? "HTTP/2 is newer, so I'll go with 2." If that's the case, HTTP/3 is even newer, so you'd want to choose 3. But in the first place, you probably don't recall specifying HTTP/2 yourself . Yet, the browser and the server are deciding on a version somewhere. For example, consider this scenario.

**0:30** · You built a gRPC API. It works perfectly on your local machine. But the moment you deploy it to AWS ECS and route it through an ALB, the calls fail. When you investigate, settings like HTTP/2 or gRPC appear. If you don't understand HTTP, you won't understand these AWS settings either. Conversely, if you understand HTTP, everything starts to connect. How the TCP and TLS we looked at before work beneath HTTP. What is the difference between an ALB and an NLB? Why does gRPC use HTTP/2?

**0:58** · And what should you check when changing versions in a production environment? The question of this video is this: Who decides the HTTP version, and where?

**1:10** · Your answer right now is probably just that the browser and server handle it well for you. We will use this answer as a map and flesh it out one by one from here. By the end, you will be able to explain for yourself why the gRPC at the beginning didn't work. Part 1: Where is HTTP? First, let’s recall the big picture of the TCP/IP video we made before. When you enter a URL into a browser, first DNS converts the name into a number called an IP address.

### 第 1 部 HTTP はどこにいる

**1:34** · Next, TCP establishes a path to the server. If it's HTTPS, TLS prepares the encryption. Only then does HTTP finally get its turn. If you draw it out, it looks like this. IP at the bottom, TCP above that, TLS above that, and HTTP at the very top. The lower layers are for transporting data reliably and securely . HTTP is on the side of the content being transported, defining what to request and what to return. Even in the official HTTP specification documents, it states that HTTP is a protocol for requests and responses. Let's take a look at the real thing.

**2:03** · I set up a server on my machine and made a single request using the curl command. I named it www.example.com for demonstration and pointed it to my local server. Here , I have specified that curl should communicate using HTTP/1.1. The requesting curl sends "GET/HTTP/1.1".

**2:21** · This means "please give me the top of the page using HTTP/1.1". The server returns "HTTP/1.1 200 OK". 200 is the number representing success, called a status code. This single pair of request and response is the smallest unit of HTTP. It doesn't end with just one time, however. The returned HTML contains CSS for layout, JavaScript for interactivity, and the locations of images. The browser reads this and then goes to request them one by one. On my page, there were 30 images written in the HTML.

**2:50** · In other words, just opening one page causes over 30 HTTP requests to occur. On actual websites, many requests also occur for a single page.

**2:59** · Therefore, whether these requests can be handled quickly determines the page speed. Up to this point, we understand the role of HTTP. HTTP is what requests and receives page content on top of DNS , TCP, and TLS. And even for one page, many requests occur. Next, we will look at how HTTP/1.1 handled these many requests. Part 2: What was the problem with HTTP/1.1? It is a mistake to dismiss HTTP/1.1 as bad because it is old. HTTP/1.1 enabled multiple requests over a single connection.

### 第 2 部 HTTP/1.1 の困りごと

**3:29** · You don't need to reconnect every time, which saves the round trips for connecting.

**3:35** · This reuse is called persistent connection and is also known as Keep-Alive. However, within a single connection, the standard is one by one.

**3:42** · You wait for the full response to arrive before requesting the next.

**3:45** · There is also a mechanism in the specifications called pipelining to request consecutively without waiting for responses. Even so, the rule is that responses must be returned in the order requested. If the first response is slow, the subsequent responses are made to wait even if they are ready first. This phenomenon where the whole queue is blocked by the front is called head-of-line blocking. It means stopping at the head of the line. The HTTP/2 specification document also states that this issue remains in HTTP/ 1.1. I measured it myself, intentionally setting each image to take 200ms to load. I requested 30 images in sequence over a single HTTP/ 1.1 connection. The time it took was 6044ms. That is 200ms times 30.

**4:17** · It is almost exactly that. So, clients like browsers have come up with a workaround . They open multiple connections and make requests simultaneously. It is the idea of adding more lanes if the road is congested. Using curl, I allowed up to 6 connections to request those same 30 images. It took 1024ms, which is about 1/6th of the time. However, the analogy of adding lanes has its flaws.

**4:40** · Unlike real traffic lanes, each connection requires a round-trip to establish. For HTTPS, TLS setup is also required for every single connection.

**4:48** · Furthermore, TCP manages congestion separately for each connection. The HTTP/3 specification also states that opening too many connections negatively impacts network efficiency. This leads to a natural question. Instead of opening many connections, couldn't we process multiple requests simultaneously within one connection?

**5:04** · So far, we have understood the problems with HTTP/1.1. In a single connection, requests form a line, and if the front is blocked, the back has to wait.

**5:12** · Increasing connections makes it faster, but adds overhead for setup and congestion control. Next, we will look at how HTTP/2 resolves this single-line issue while keeping one connection.

### 第 3 部 HTTP/2

**5:20** · Part 3. How does HTTP/2 use a single connection? HTTP/2 first breaks the content to be sent into small units.

**5:28** · These units are called frames. HTTP/1.1 was written in human-readable text separated by spaces and line breaks.

**5:35** · HTTP/2 frames have the length and type written in fixed positions, which we call binary. Next, we assign a number to each pair of request and response.

**5:43** · This numbered flow of pairs is called a stream. Each frame contains information about which stream it belongs to. So, even if you interleave frames from separate streams into a single connection, the receiver can reassemble them correctly. This practice of mixing multiple streams into one connection is called multiplexing. You can stream frames for image 2 or image 3 while still waiting for the response to image 1. The HTTP/2 specification also states that streams are largely independent, so if one stalls, the others can proceed.

**6:10** · If you are a programmer, it might feel similar to running multiple concurrent processes without waiting for them to finish. However, this analogy has its limits. All HTTP/2 streams share the same underlying TCP connection. If a single packet is lost at that level, all streams have to wait . We will cover this in Part 4. Another point is that HTTP/2 compresses headers before sending them. Headers are supplementary information attached to requests and responses as name-value pairs. Since the content is almost the same every time, both sides keep a table of sent names and values, and send the table index for repeated data.

**6:41** · This compression method is called HPACK . What is important here is that the meaning of HTTP has not changed.

**6:47** · Requesting with GET and responding with 200 remains the same in HTTP/2. My local curl also displayed "GET/HTTP/2" and returned HTTP/2. However, this is just how curl displays it for readability. In reality, methods and paths are placed into designated fields and sent via frames. What changed is the transport mechanism, not the meaning. So, what are these designated fields? In HTTP/1.1 requests, you list the method, path, and version on the first line. For example, "GET" followed by the path of the image you want. And then "HTTP/1.1".

**7:16** · The first line of a response contains "HTTP/1.1" and a status like "200 OK". The specification refers to this first line as the "start line". HTTP/2 and HTTP/3 do not have this first line. The specification states that the same content is sent by placing it into special fields that start with a colon. The method becomes: method, the path becomes: path, and the response status becomes: status. These are the names starting with a colon that were in the previous table. Also, there is no field for the version in an HTTP/2 request. The version is determined by the connection itself, not within the message.

**7:47** · I requested the same 30 images simultaneously over a single HTTP/2 connection. The time taken was 215 milliseconds. With one HTTP/1.1 connection, it took 604 milliseconds, and even with six, it took 1,024 milliseconds. You might get similar speeds with HTTP/1.1 if you open 30 connections. However, that would require the setup and coordination of 30 connections. HTTP/2 achieved that same concurrency over a single connection. So, how did curl and the server decide to speak HTTP/2? The answer lies in the TLS setup.

**8:17** · In the initial handshake, the ClientHello, curl offers to speak both H2 and HTTP/ 1.1. H2 is the name for HTTP/2 over TLS . The server selects one from the offers and sends it back. A server capable of HTTP/2 chose H2. I also tried requesting the same thing from a server that cannot speak HTTP/2. Curl offered H2 and HTTP/1.1 in the same way , and the server chose HTTP/1.1. Even so, the page comes back correctly. This mechanism of offering and selecting is called ALPN.

**8:47** · The offer is in the browser's initial greeting, and the selected answer is in the server's response. It is the ClientHello and EncryptedExtensions we saw in the TLS session. The rules of communication are decided without additional round trips.

**8:58** · That is why you don't remember specifying HTTP/2 yourself. It is because the browser offered it and the server chose it. However, ALPN is a mechanism within TLS. For unencrypted HTTP/2, there is a way to connect by deciding to speak HTTP/2 from the start , like gRPC, without using ALPN. So far , we have understood HTTP/2. It uses frames and streams to mix and flow multiple requests over a single connection. The meaning remains the same, but the delivery method has changed. And for which version to speak , the browser offers it via ALPN and the server chooses it. Part 4: Is it finished with HTTP/2?

### 第 4 部 HTTP/2 で完成？

**9:30** · Here is a question. If HTTP/2 resolved the single-file line issue, does that mean queueing problems are gone? They are not. The HTTP/2 specification itself states that it does not solve TCP head-of-line blocking. Let's look at that diagram again. Below HTTP/2 is TLS , and below that is TCP. We organized the HTTP layer, but what about the TCP layer below it? TCP is a protocol designed to deliver data reliably and in order. The sender divides data into small packages called packets and sends them.

**10:02** · The receiver puts the arriving packets back in order and passes them to the layer above. If a packet is lost in transit, it requests a resend. In reality, the sequence is counted by byte position, but here we will represent it using package numbers.

**10:12** · Suppose we send packets 1, 2, 3, and 4, and only number 2 is lost in transit.

**10:17** · Packets 3 and 4 have already arrived.

**10:18** · Even so, TCP will not pass 3 and 4 to the upper layer until 2 is resent and arrives. This is because TCP's promise is to deliver data exactly in order.

**10:26** · Let's apply this to HTTP/2. Packet 2 contained a frame for the stream of image 1. Packet 3 contained a frame for the stream of image 2. Even though the data for image 2 has arrived, TCP waits for packet 2, so image 2 also stops.

**10:38** · From TCP's perspective, the distinction between HTTP/2 streams is invisible. To TCP, it is just a single, ordered stream of bytes. The HTTP/3 specification document also notes that if a single packet is lost, unrelated exchanges are all brought to a halt.

**10:52** · This is TCP head-of-line blocking. We now understand the limitations of HTTP/ 2. We cleared the line at the HTTP layer, but the TCP layer below it still waits for missing packets in order.

**11:03** · Fixing only the upper layer was limited by the layer below. So, what should we do? Part 5: HTTP/3 changed from TCP.

### 第 5 部 HTTP/3

**11:11** · The answer was to change the underlying transport layer. HTTP/3 is not just a minor improvement over HTTP/2. Keeping the meaning of HTTP intact, it runs on a new transport method called QUIC instead of TCP. And QUIC runs on top of UDP. Here is a question. Isn't UDP a " send-and-forget" delivery method? If a packet is dropped, isn't it lost forever? Part 6: Why is it usable despite being UDP? That concern is half-right. UDP itself only has a minimal mechanism.

### 第 6 部 UDP なのに、なぜ使えるのか

**11:39** · The UDP specification document also states that it does not guarantee delivery or non-duplication. It also says to use TCP if you want to ensure delivery in the correct order. However, QUIC does not just use UDP as-is. QUIC has its own mechanisms to detect lost data and retransmit it in new packets, and to adjust transmission volume based on network congestion. It only uses UDP as a foundation for carrying packets. Then why bother building a new specification on top of UDP?

**12:06** · The QUIC specification document states it's because it's easier to pass through existing systems and networks. It was easier for the world to start using it by building on existing UDP rather than creating a completely new type of delivery method.

**12:20** · QUIC also has streams. And it delivers data reliably and in order for each stream. The difference is that it does not maintain order across streams. If data in stream A is missing, stream B, which does not contain the missing data , is not stalled as collateral. Let's look at the same situation as before with HTTP/3. A packet for the stream of image 1 was dropped. Since the data for image 2 has arrived, image 2 is passed on to the upper layer as is. Only image 1 waits for retransmission. The HTTP/3 specification document also states that even if one stream is missing data, other streams can proceed. There were also small changes.

**12:50** · The header compression method in HTTP/2, HPACK, assumed that the order of arrival was fixed. Since QUIC does not maintain order across streams, HTTP/3 changes the compression method to QPACK.

**13:01** · Changing the lower layer meant that the details of the upper layer also needed to be corrected accordingly. However, there are also networks that do not pass UDP traffic. In such cases, the specifications state to use HTTP/2 or HTTP/1.1 over TCP. Also, browsers do not necessarily start with HTTP/3. In many cases, the connection begins with a TCP version, and the server informs the browser that HTTP/3 is available via an Alt-Svc header in its response.

**13:25** · Seeing this, the browser will try QUIC next and specify H3 within the ALPN. We now have a basic understanding of QUIC.

**13:32** · QUIC is built on UDP and handles its own retransmissions and congestion control. Since it does not enforce order across different streams, one loss will not affect unrelated streams.

**13:41** · Next, the discussion from the TLS episode connects here. Continuing from Part 7, QUIC has also changed how connections are established. Please recall how HTTPS worked until now.

### 第 7 部 TLS の回の続き（QUIC と TLS 1.3）

**13:52** · First, one round trip to establish the path with TCP. Then, one round trip to set up TLS 1.3. Only after two round trips can you finally send the HTTP request. We saw that TLS 1.3 reduced one round trip, but one round trip for TCP still remained. QUIC has combined these two preparation steps into one.

**14:09** · The QUIC specification states that it reduces connection time by combining encryption setup and transport setup.

**14:15** · Even with a new connection, the basic flow allows you to send an HTTP request after just one round trip. What it uses inside is the exact TLS 1.3 handshake we saw in the TLS episode. ClientHello, ServerHello, Certificate, and Finished messages all appear. The difference lies in how they are transported.

**14:31** · Instead of sending them as TLS records over TCP, QUIC carries the handshake messages directly. QUIC uses the TLS handshake to generate keys and verify the peer. TLS makes use of QUIC's ability to ensure reliable, ordered delivery. The TLS and QUIC specifications state that the two are not stacked on top of each other, but rather work in cooperation. ALPN is used as is, and the name for HTTP/3 is H3. Furthermore, if you have communicated with the peer before, there is a mechanism called 0-RTT that sends data along with the initial transmission. However, this can only be used when you have communicated with them before.

**15:02** · In this video, I will only introduce the names. So far, the TCP and TLS groups have been connected by HTTP/3. HTTP/3 uses QUIC to avoid TCP queuing, and QUIC integrates TLS 1.3 to reduce round trips during setup. Now, let's return to the question from the beginning. Who determines this version in AWS? Part 8: Who decides the version in AWS? First, let's recall ALPN. The client proposes the versions it can speak, and the server chooses one.

### 第 8 部 AWS では誰がバージョンを決めるのか

**15:31** · So, when an ALB is between a browser and a Go app, who is the server? The answer is the ALB. The browser connection ends at the ALB. Separately, the ALB establishes a new connection from itself to the app. Even if it looks like one communication, the connection is split in two at the ALB. In AWS documentation, these two have separate names. The connection from the client to the ALB is configured via the listener. The connection from the ALB to the app is configured via the target group. In this video, I will call the front the "front side" and the back the "target side."

**16:03** · Let's look at the front side. ALB's HTTP/2 can be used with HTTPS listeners that accept HTTPS.

**16:10** · Since ALPN is within TLS, HTTP port 80 remains HTTP/1.1. If HTTP/2 is enabled on an HTTPS listener, the client can connect using either HTTP/2 or HTTP/1.1 . This setting is enabled by default.

**16:26** · That is why it was already using HTTP/2 without doing anything. Next is the target side. This is where the protocol version mentioned at the beginning comes in. If HTTP/1 is set, the ALB sends to the app using HTTP/1.1. If HTTP/2 is set, it sends using HTTP/2, and if gRPC, it uses gRPC. If nothing is selected, the default is HTTP/1. The target side is not determined by an ALPN proposal. The ALB speaks to the app using the version we choose. In other words, it is common for the front side to be HTTP/2 while the target side is HTTP/1.1.

**16:56** · The ALB acts as an intermediary, changing the version as it relays. Such relaying is possible because the meaning of HTTP does not depend on the version. Therefore, if you are asked to "set it to HTTP/2," there is something you must ask back.

**17:08** · Which part should be HTTP/2? Is it between the browser and the ALB, or between the ALB and the app? These two are separate settings. However, we will see in Part 10 how the outcome changes depending on the combination. By now, we understand where versions are determined in AWS. Between the browser and the ALB, the ALB chooses based on ALPN. Between the ALB and the app, we choose using the target group's protocol version. Next, we will look at load balancers other than the ALB and the entrance for HTTP/3. ALB and HTTP/3 .

### 第 9 部 ALB・NLB と HTTP/3

**17:36** · AWS documentation states that it operates at the application layer, Layer 7. In the layer diagram from Part 1, this is the top HTTP tier. It handles HTTP and HTTPS. Since it can read the content of HTTP, it can route based on paths, headers, or methods. On the other hand, the NLB operates at the transport layer, Layer 4. In the layer diagram, this is the TCP or UDP tier.

**18:00** · It handles TCP, TLS, UDP, and QUIC. The NLB does not read HTTP content to perform routing. It routes at a lower level, in units of connections or packets. Here is a question. The NLB can handle QUIC. Does this mean the NLB understands HTTP/3? Not necessarily.

**18:20** · AWS API documentation states that certificates are for HTTPS and TLS listeners. QUIC listeners do not have certificates. Without a certificate and private key, you cannot decrypt HTTP/3 exchanges. Instead, for targets, you register server IDs for each one. AWS documentation also says that for QUIC listeners, the NLB acts as a pass-through load balancer in accordance with the RFC. The NLB transports the QUIC connection to the target without opening the HTTP/3 content. It is the application further ahead that speaks QUIC and HTTP/3.

**18:50** · By now, we understand these two roles. The ALB reads HTTP content to route traffic . The NLB transports connections and packets below the HTTP layer. Knowing HTTP makes it clear which tool handles which layer. Is it okay? Should you just choose the latest? Here is a question. If you can choose the version , should you always select the newest one? Not necessarily. The criteria for choosing should be what problem you want to solve, not just newness. HTTP/2 solved the issue of queuing within a single connection.

### 第 10 部 最新を選べばよいのか

**19:20** · HTTP/3 solved the issue of TCP head-of-line blocking and connection setup round-trips. First, consider whether that problem is actually occurring in your own communication. On top of that, there are a few things to verify. Does the client support it, does the AWS service you use support that version, and can the app behind it speak that version?

**19:39** · Next is the path it travels. On networks that block UDP, HTTP/3 cannot be used and it reverts to a TCP-based version. Proxies and firewalls along the way are also part of that path.

**19:48** · Also, after switching to a new version, it is important to be able to track what is happening via logs and metrics.

**19:54** · Technology is not a competition to use the latest features. Places where you can fall back to older versions via ALPN, like between a browser and an ALB , are safer to enable new versions. On the other hand, where you change the version your own app speaks, you must verify support from the other side first. Part 11: Is it okay to switch to HTTP/2 in production? Can you just click to change from HTTP/1.1 to HTTP/2 in the settings? The answer depends on which segment you mean. By now, you should know how to ask yourself the right questions.

### 第 11 部 本番で HTTP/2 に切り替える

**20:22** · Is it between the browser and ALB, or between the ALB and the app? First, the front side. HTTP/2 is enabled by default. If you have it disabled and are about to enable it, there are points to be careful about.

**20:35** · Once enabled, the ALB will apply strict HTTP/2 header checks to all requests.

**20:40** · AWS documentation states, for instance, that header names must consist only of alphanumeric characters and hyphens.

**20:46** · For example, if a client you built yourself sends headers with underscores in the name, they will fail this check.

**20:51** · Thanks to ALPN, clients that cannot speak HTTP/2 can continue using HTTP/ 1.1. However, this check applies to everyone. Check the headers your current clients are sending beforehand.

**21:02** · Next is the target side. Here, the version that the app itself speaks will change. First, verify if your app can speak HTTP/2 or gRPC. Also, in the guide published by AWS, it states that if you set the target side to HTTP/2, requests coming in as HTTP/1.1 will result in an error. Verify that there are no remaining clients reaching the front side via HTTP/1.1. Let's take a closer look at this table. The AWS guide includes a table showing results for nine combinations of requests arriving at the ALB and the target group protocol versions.

**21:30** · The left side shows how clients like browsers request the ALB, and the right side shows how the ALB sends it to the app. We will look at them three at a time. First, when the protocol version is the default HTTP/1.1, it succeeds whether the browser comes via HTTP/1.1 or HTTP/ 2. Requests that arrive via HTTP/2 are converted by the ALB into HTTP/1.1 and sent to the app. This relay is possible because, as seen in Part 8, the meaning doesn't depend on the version. However, requests that arrive via gRPC will result in an error.

**21:58** · Since gRPC is a mechanism that runs on HTTP/2 streams, it cannot be carried over an HTTP/1.1 segment. Next, when set to HTTP/2, this is where the pitfall lies. Requests that arrive via HTTP/2 will succeed.

**22:11** · Requests that arrive via gRPC will also succeed if the app supports gRPC.

**22:15** · However, requests that arrive via HTTP/ 1.1 will result in an error. Even though HTTP/1.1 requests were passing through when the backend was HTTP/1.1, they stop passing when the backend is switched to HTTP/2. So, who is sending via HTTP/1.1? Most browsers offer HTTP/ 2 via ALPN, so they come via HTTP/2.

**22:34** · What you need to watch out for is anything other than browsers. This includes old libraries that only speak HTTP/1.1, custom-built clients, or calls from other services. Also, if you have another proxy like a CDN in front of the ALB, how requests reach the ALB depends on how that proxy sends them.

**22:49** · If you have ALB access logs enabled, you can see if the first field is 'h2' for HTTP/2, or 'http' for HTTP/1.1 over TLS. The first line of the request also remains in a format that indicates whether it is HTTP/1.1 or HTTP/2.0.

**23:02** · Before switching, you can count whether any HTTP/1.1 requests are still remaining. Finally, when set to gRPC, requests arriving via gRPC succeed, but those via HTTP/1.1 result in an error.

**23:13** · Requests arriving via HTTP/2 only succeed if they are POST requests. This is because gRPC calls are required to be sent as POST requests by definition.

**23:20** · In summary, there are three cases that result in errors. When routing gRPC behind HTTP/1.1, or routing HTTP/1.1 behind HTTP/2 or gRPC, setting the backend to HTTP/2 or gRPC will cause requests arriving via HTTP/1.1 to fail.

**23:35** · According to the AWS troubleshooting page, the ALB will return a 464 status code in these three scenarios. That is why you must verify what protocol is being used in the previous segment before switching the target side.

**23:46** · Looking at the AWS API documentation, the protocol version is not an item that can be changed after a target group is created. Since the protocol version cannot be changed later, you will need to create a new target group for the new version. At that time, you should also review the health checks accordingly. When using gRPC, the success condition for health checks becomes a gRPC code rather than an HTTP status code. When switching, register the app in the new target group, confirm that health checks pass, and then update the rule's forwarding destination. ALB forwarding can also distribute traffic to multiple target groups based on weights.

**24:17** · This is a switching method where you gradually shift traffic to the new one, compare error rates and response times, and revert weights if there are issues.

**24:25** · Check the AWS guide before use to see if target groups with different versions can be placed in the same rule . Before that, test if connections work and if it can handle load in an environment with the same configuration as production. Even if a setting value is singular, if you understand the underlying communication changes, you can build a safe switching method yourself. Up to this point, we have covered how to switch versions. The front end can be reverted via ALPN, but header inspection becomes stricter.

**24:48** · Since the app version changes on the target side, create a new target group and shift traffic gradually so you can revert immediately. Next is gRPC, which has been appearing since the beginning.

### 第 12 部 gRPC は HTTP とは別物なのか

**24:57** · This is important. Is gRPC something separate from HTTP? Here is a question.

**25:03** · Is gRPC a rival communication standard separate from HTTP? It is not separate.

**25:08** · To begin with, they are on different levels of comparison. HTTP is a communication standard that determines what to request and what to return.

**25:15** · REST and RPC are concepts for how to shape APIs on top of that. gRPC is a concrete mechanism that implements the RPC concept. RPC stands for Remote Procedure Call, a concept for calling processes on other machines as if they were local functions. To fetch user 123 , you would write something like "user 123." In REST, the same thing is expressed through a combination of HTTP methods and paths. You use a GET request at the user location, like GET/ user/123.

**25:42** · REST is often designed around HTTP methods and paths, while RPC is designed around function calls. In gRPC , you first define a list of callable functions as a service. For these definitions, you typically use a format called Protocol Buffers. You specify what each function receives and returns , then generate client and server code from that. gRPC then carries these calls by loading them into HTTP/2 frames. The official gRPC documentation states that HTTP/2 stream IDs are used for individual call IDs.

**26:13** · In other words , one call equals one stream. Therefore , gRPC calls can also be viewed as HTTP /2 requests. The method is POST, and the path is the service and function name. The content type is application/ grpc. In my logs, I was calling /grpc.health.v1.Health/Check using POST . There are four types of gRPC calls.

**26:36** · Unary: one request, one response.

**26:38** · Server streaming: one request followed by a continuous stream of responses.

**26:41** · Client streaming: a continuous stream of requests followed by one final response. Bidirectional streaming: both sides continuously send data to each other. This is possible because both sides can send multiple frames within one stream, marking the end with a final flag. And as we saw in Part 3, streams can be multiplexed within a single connection. I was able to call the single-response Check, and I received the first response for the watch call. That is why learning gRPC leads you to HTTP/2. By now, you understand the position of gRPC. HTTP is the standard for requests and responses.

**27:12** · REST and RPC are concepts for API structure. gRPC is a specific implementation of RPC. And gRPC runs its calls on top of HTTP/2 streams. We now have the materials needed to solve the problem from the beginning. The main issue. The gRPC setup that worked locally doesn't work on AWS. Returning to the situation at the start. The gRPC server works fine on my local machine.

### 第 13 部 手元で動いた gRPC が AWS で動かない

**27:34** · It fails when deployed to ECS and routed through an ALB. Where should I look first? I’ll start by isolating the ALB side. Is the application marked as healthy in the target group? Does the ALB access log show the error coming from the ALB or the app? After that, I check the application logs.

**27:49** · There is no record of the request being processed. It seems the issue isn't the app, but something in the path leading to it. Now I suspect the target side, between the ALB and the app. What is the protocol version of the target group? If created without selection, it defaults to HTTP/1.1. The ALB is sending requests to the app using HTTP/ 1.1. The AWS guide table notes that sending gRPC requests to an HTTP/1.1 target group results in an error. I reproduced the same type of failure locally. I wrote a small proxy in Go to act as the ALB.

**28:19** · It receives via HTTP/2 in front and sends via HTTP/1.1 to the gRPC server behind. When called, it returned an "unavailable" error. The gRPC server rejected the HTTP/1.1 request, and the proxy returned a "bad gateway" instead. Since it wasn't a gRPC response, it says there is no content type. However, this is just how my custom proxy handles the response.

**28:42** · According to the AWS troubleshooting page, a real ALB would return a 464 status code. When I changed the proxy's backend to HTTP/2, the same call succeeded. The first request also reached the server. This is just a reproduction using a local proxy, not the ALB itself. On AWS, if it’s a gRPC app, you should set the protocol version to gRPC. The table shows that gRPC calls work on HTTP/2 if the target supports it. Current AWS guides state that both HTTP/2 and gRPC support all four call types, including streaming.

**29:13** · The difference is that with gRPC, the ALB treats requests as gRPC calls. It can route by service or method name and supports gRPC health checks. The guide also states that the gRPC protocol version only works with HTTPS listeners . The front end must also be receiving via HTTPS. And keep in mind, the protocol version cannot be changed after creation. Create a new gRPC target group, then determine the health check method and gRPC code to switch over. The cause of the failure was neither the application nor the security group.

**29:42** · The HTTP versions between the ALB and the application did not match. If you know that the HTTP version and the connection are separate , this is the first place you would suspect. Knowledge of HTTP has transformed into the ability to investigate incidents. Connect all the important parts together. Finally, let's put the whole map together. When you enter a URL, DNS translates the name into an IP address. For HTTP/1.1 and HTTP/2, TCP establishes the path and TLS prepares the encryption. For HTTP/3, QUIC handles both the connection setup over UDP and TLS simultaneously.

### 第 14 部 全部つなげる

**30:13** · On top of that, HTTP carries the requests and responses. For REST APIs, you manipulate resources using HTTP methods and paths. For gRPC, you invoke functions over HTTP/2 streams. And finally, it reaches the application. You can also place the intermediate tools on the map. The ALB routes HTTP at Layer 7 and splits the connection into front-end and target-side segments. The NLB carries connections and packets below the HTTP layer. I will now answer the opening questions one by one. Who decides on HTTP/2?

**30:43** · On the front-end, the browser proposes it via ALPN and the ALB chooses. On the target-side, we choose it via the protocol version rather than ALPN. Why HTTP/3? Because even though HTTP/2 cleared the HTTP layer's queue, the TCP head-of-line blocking remained.

**30:59** · Is UDP okay? Yes, because QUIC handles retransmission and congestion control itself. What is the difference between ALB and NLB? ALB reads HTTP, while NLB carries traffic below HTTP. Should we use the latest version? Decide based on the problem to solve, the path, and the peer's support. The relationship between gRPC and HTTP is that gRPC is a mechanism that carries function calls over HTTP/2 streams. Now, let's return to the same question from the beginning . Who decides the HTTP version, and where is it decided?

**31:26** · Try explaining it yourself using today's terms, while picturing the map from the browser to the app. Pause the video and give it some thought. The initial answer was that the browser and server are handling it well for us. Now you should even be able to explain which part decides what and how. The goal wasn't just to memorize HTTP versions. The purpose of this video was to help you understand what happens where in communication. Please subscribe and like the video. See you next time.