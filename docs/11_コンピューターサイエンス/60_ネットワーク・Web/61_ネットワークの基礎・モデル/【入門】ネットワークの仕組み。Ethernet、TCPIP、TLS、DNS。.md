---
title: "【入門】ネットワークの仕組み。Ethernet、TCP/IP、TLS、DNS。"
source: "https://www.youtube.com/watch?v=t0tVQkIAfos"
author:
  - "[[直也テック]]"
published: 2026-09-23
created: 2026-09-26
description: "コンピュータ1台とケーブル1本から始めてロードバランサまで解説しました。用語を単に覚えるのではなく、どんな不便があって、それを解くために何が足されたのかにフォーカスしています。隣が誰か分からないからMACアドレス、ネットワークをまたげないからIPアドレス、届いたか分からないからTCP、どのアプリ宛か分からないからポート、読まれてしまうからTLS、数字を覚えられないからDNS、1台では足りないか"
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=t0tVQkIAfos)

コンピュータ1台とケーブル1本から始めてロードバランサまで解説しました。  
  
用語を単に覚えるのではなく、どんな不便があって、それを解くために何が足されたのかにフォーカスしています。隣が誰か分からないからMACアドレス、ネットワークをまたげないからIPアドレス、届いたか分からないからTCP、どのアプリ宛か分からないからポート、読まれてしまうからTLS、数字を覚えられないからDNS、1台では足りないからロードバランサー、という流れです。  
  
この動画で分かること  
・Ethernet / Wi-Fi とMACアドレス、スイッチが何をしているか  
・IPアドレスとサブネット、ルー へ出る仕組み  
・pingで疎通を確かめる方法と、  
・TCPとUDPの違い、ポート番号と  
・盗聴や改ざんを防ぐTLSと、公  
・ドメイン名からIPアドレスを引・HTTPのリクエストとレスポンス、SSH / FTP / SMTP / WebSocket / QUIC  
・サーバを増やすときのロードバランサ  
  
Ethernetを作ったロバート・メトラディア・パールマン、QUICの初  
期設計をしたジム・ロスキンドなど人の話も挟んでいます。  
  
  
現在チャンネル登録者が11.3万人。ここ2ヶ月ほどで多くの人に登録して頂きました。改めてありがとうございます。しかしまだ未登録の方が77%おられます。ぜひチャンネル登録をお願い致します！  
  
メンバーシップの登録はこちら。  
https://www.youtube.com/channel/UCtiDTuG40ZOarubtFm1fbzg/join  
  
\====  
目次  
\====  
0:00 イントロ  
0:49 第1章 まず物理的につなぐ  
2:50 第2章 IPアドレス  
5:31 第3章 データを外へ運ぶ  
8:11 第4章 本当に届くか試す  
8:53 第5章 TCPとUDP  
11:27 第6章 ポートとファイアウォール  
12:34 第7章 通信を守る  
16:37 第8章 名前でたどり着く  
18:11 第9章 Webのやりとり  
19:36 第10章 そのほかのプロトコル  
21:49 第11章 サーバを増やす  
22:16 まとめ  
  
【PR】ITエンジニア特化の転職エージェント「テックゴー」  
https://h.accesstrade.net/sp/cc?rk=0100q5og00osn8  
  
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
プロフェッショナルTLS＆PKI 改題第2版  
https://amzn.to/3VtXvLI  
  
マスタリングTCP/IP―入門編―(第6版)  
https://amzn.to/4yTubwI  
  
マスタリングTCP/IP 情報セキュリティ編(第2版)  
https://amzn.to/4hr1nVh  
  
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
  
#ネットワーク #dns

## 詳しい要約

**テーマ：「どんな不便を解くために足されたか」で辿るネットワークの全体像**

コンピュータ1台とケーブル1本から出発し、MACアドレス、IP、ルーティング、TCP/UDP、ポート、TLS、DNS、HTTP、ロードバランサまでを順に積み上げて解説する動画。各技術は「用語」として覚えるより、それ以前にあった不便と、それを解決するために誰が何を足したのかという流れで理解すると整理しやすい、というのが結論。

---

### 第1章 物理的につなぐ（Ethernet・MAC・スイッチ）

- 有線は **Ethernet**（1973年、Xerox PARC のロバート・メトカーフ考案）、無線は **Wi-Fi**。運び方が違うだけで考え方は同じ
- つないだだけでは相手が誰か分からない → 製造時に割り当てられる48ビットの **MACアドレス**（前半がメーカー、後半が通し番号）で宛先を指定
- 全台を直結するとケーブル数が爆発（10台で45本）→ 中央に **スイッチ** を置く。スイッチは「どのMACがどのポートの先にいるか」の表を持ち、宛先にだけ転送
- スイッチ間のループで通信が回り続ける問題は、DEC のラディア・パールマンが **スパニングツリープロトコル** で解決
- MACアドレスは同一ネットワーク内でしか使えない

### 第2章 IPアドレス

- ネットワークをまたぐための論理アドレスが **IPアドレス**。MACは基本的に不変、IPはつなぐネットワークで変わる
- **IPv4**（32ビット、約43億個）は枯渇 → **IPv6**（128ビット）
- 取得方法：手入力の **固定IP** か **DHCP**。DHCPは Discover → Offer → Request → ACK の4段階（**DORA**）で、IPに加えサブネットマスク・デフォルトゲートウェイ・DNSサーバーも配る。アドレスは「貸与（リース）」で期限切れ時に更新
- **サブネット**：`/24` なら先頭24ビットがネットワーク部で、同一ネットワークに254台。宛先が同じネットワークかどうかの判定に使う

### 第3章 データを外へ運ぶ（ルーティング）

- 外への出口が **ルーター**。スイッチはMACで、ルーターはIPで転送先を判断
- 行き先が分からないものはすべて **デフォルトゲートウェイ** に任せる
- ルーターは **ルーティングテーブル** を持つ。手書きは **スタティックルーティング**
- 組織内では **OSPF** が経路を自動計算（ダイクストラ法。1956年にダイクストラがカフェで約20分で考案）
- 企業・ISP間は **BGP**（IBMのレクター、Ciscoのローヒードが設計、1989年 RFC 1105）。速さではなく「到達できる経路」を決める。相手の申告を基本的に信頼するため、誤った経路広告で国単位の通信停止が起きたこともある
- 小規模＝静的、組織内＝OSPF、組織間＝BGP の3層で世界がつながる

### 第4章 届くか試す（ping・ICMP）

- **ping**（1983年、米陸軍研究所のマイク・ミュース作。ソナーが名前の由来）は **ICMP** を使い、応答の有無と往復時間でネットワークの状態を確かめる

### 第5章 TCPとUDP

- IPは方向だけを担い、届いたかは上位のトランスポート層の仕事
- **TCP**：信頼性と順序を保証。原設計はヴィントン・サーフとロバート・カーン（1974年論文、2004年チューリング賞）。**3ウェイハンドシェイク**（SYN / ACK）で接続し、パケットに **シーケンス番号** を付けて並べ直し、欠けたら再送。代わりに遅い（「パケット」の名付け親はドナルド・デイヴィス）
- **UDP**：接続確立も番号付けも再送もしない。速さ優先で、通話やゲームに使う

### 第6章 ポートとファイアウォール

- IPが「建物の住所」なら **ポート番号** は「部屋番号」。443（暗号化Web）、53（名前解決）など。番号管理はジョン・ポステル（のちの **IANA**）
- **ファイアウォール** がポート・IP・方向のルールで通信を許可・遮断する

### 第7章 通信を守る（TLS・VPN）

- 平文だと経路上で盗み見られる → **TLS** がTCPとアプリの間で通信を暗号化
- **共通鍵暗号**は速いが鍵の受け渡しが課題。**公開鍵暗号**（1976年ディフィーとヘルマン、2015年チューリング賞）は安全だが重い → TLSは「鍵交換は公開鍵、データ転送は共通鍵」と組み合わせる
- TLS 1.2 の流れ：TCPハンドシェイク → **Client Hello**（対応バージョン・暗号方式を提示）→ **Server Hello** ＋証明書（公開鍵・ドメイン名・期限・発行者の署名）→ ブラウザが署名を検証（失敗時は警告）→ **セッション鍵** を公開鍵で暗号化して送付 → 以降は共通鍵で通信
- 現行の **TLS 1.3** は1往復に短縮し、鍵交換をディフィー・ヘルマンに統一。SSLは前身で全バージョン非推奨
- **VPN** はネットワーク間に暗号化トンネルを張り、種類を問わず全通信を守る

### 第8章 名前でたどり着く（DNS）

- 名前をIPに変換する「インターネットの電話帳」。ポール・モカペトリスが考案。以前は名前一覧ファイルを配布していたが更新が追いつかず、階層化と権限委譲で管理する形に
- 自端末のキャッシュ → **リゾルバ** → **ルートサーバー** → `.com` の担当 → **権威サーバー** と辿る
- レコード：A / AAAA（アドレス）、CNAME（別名）、MX（メール）。結果は **TTL** の間キャッシュされるので変更の反映に時間がかかる
- 従来のDNSは暗号化されず閲覧先が見える → **DNS over HTTPS** などが広がりつつある

### 第9章 Webのやりとり（HTTP）

- **HTTP** はリクエストとレスポンスのテキストのやりとり（1989年、CERNのティム・バーナーズ＝リーが提案）。1行目に操作と対象、続いてヘッダー。応答はステータスコード（200 成功、404 未検出、500 サーバーエラー）
- **HTTPS** はHTTPをTLS上で動かしたもの。鍵マークは「暗号化」と「ドメインの検証済み」を示すが、運営者が安全である保証ではない

### 第10章 そのほかのプロトコル

- **SSH**：平文だったTelnetの代替。1995年、フィンランドのタトゥ・ユロネンが作成。鍵認証、ファイル転送、ポートフォワーディングも可能
- **FTP**：平文なので今選ぶ理由はない。**SMTP**：メール送信専用（受信は別プロトコル）
- **WebSocket**：HTTPで始めて双方向通信に切り替え（チャット、ゲーム、株価）
- **QUIC**：Googleのジム・ロスキンドが初期設計。OSやハードに深く組み込まれたTCPを避けUDP上に構築し、接続とTLSハンドシェイクを1回にまとめる。1つのパケット欠落が他のストリームを止めない。2021年にRFC化

### 第11章 サーバを増やす（ロードバランサ）

- 1台で捌けなくなったら **ロードバランサ** を前段に置いてリクエストを分散。死活監視をして落ちたサーバーを外す

### まとめ

- プロトコルは **層** で考えると整理しやすい（下ほどハード寄り、上ほど人の用途寄り）
- MAC＝隣が誰か分からない、IP＝ネットワークをまたげない、TCP＝届いたか分からない、ポート＝どのアプリ宛か分からない、TLS＝読まれる、DNS＝数字を覚えられない、ロードバランサ＝1台では足りない
- 新しいプロトコルに出会ったら、それ以前にあった不便を調べる（RFCの冒頭数ページに経緯が書いてある）

## Transcript

### イントロ

**0:00** · I’ll explain how networks work from scratch in this single video. We’ll start with one computer and one cable, and end up with a load balancer. Every network component was created to solve a specific problem. Switches, IP addresses, and TLS were all added because something was inconvenient.

**0:18** · Tracing them in that order is faster than memorizing terms one by one.

**0:22** · Before we begin, 77%of our viewers are not subscribed to the channel. If you find this topic interesting, please support us by subscribing and liking this video. First, let’s start with a single computer that isn’t connected to a network. In this state, the machine can only handle the information within itself. To make it communicate, we first have to connect it physically.

**0:46** · Let’s place a second computer and connect them with a cable. The standard for connecting via wires is Ethernet.

### 第1章 まず物理的につなぐ

**0:52** · It carries data through physical cables like copper wires or fiber optics.

**0:56** · Wi-Fi does the same thing, but using radio waves instead. The concept is the same; only the method of transporting data differs. For clarity, we will proceed assuming they are connected by a cable. Ethernet was created by Robert Metcalfe at Xerox PARC. In 1973, he devised it to connect lab computers, then founded 3Com to spread it. However , just connecting them with a wire leaves a problem. Neither computer knows who is on the other side of the line. You cannot send out data without specifying a destination.

**1:28** · That is where the MAC address comes in. Devices connected to a network have a unique number assigned at manufacture. It’s a 48-bit number; the first half is the maker, the second is the serial. When devices are directly connected, they use this MAC address to specify the target. You write the target machine's number on the data and send it out. But this method only works well for two machines. To connect 10 machines directly, you would need 45 cables. As the number of devices grows, the number of cables explodes.

**2:00** · That’s why we place a switch in the middle. It is a device used to connect all machines on the same network together. Everyone just needs to plug one cable into the switch, and that’s it. When connecting multiple switches, redundant lines can loop, causing data to circulate indefinitely. Radia Perlman, who was at DEC, invented the Spanning Tree Protocol to prevent this. Switches keep a table of which MAC addresses are located behind which ports. They read the destination of the incoming data and send it only to that device.

**2:29** · Since data isn't broadcast to everyone, unnecessary traffic is reduced. However , MAC addresses have a major limitation . They can only be used within the same network. You cannot reach a device on a different network using a MAC address.

**2:44** · In other words, you need a different address that can be used across networks. That is the IP address. An IP address is a logical address assigned to identify a device. It takes the form of four numbers ranging from 0 to 255.

### 第2章 IPアドレス

**3:00** · It is a 32-bit number in total. The difference between a MAC address and an IP address is whether it changes. A MAC address is hard-coded into the hardware and basically never changes. An IP address changes to a different number when you connect to a different network . There are two main versions of IP addresses. What I just described is IPv4, with 32 bits, totaling about 4.3 billion addresses. 4.3 billion sounds like a lot, but it wasn't enough for an era where the whole world is connected.

**3:27** · As individuals began owning multiple devices, the available numbers ran out.

**3:32** · That is why IPv6 was created, using 128 -bit addresses. The scale is immense, with a count comparable to the number of grains of sand on Earth. There is no concern about running out for a very long time. There are two main ways to obtain an IP address. One way is to open the settings screen and enter it manually. This is called a static IP address. The other way is DHCP. It stands for Dynamic Host Configuration Protocol, a system that automatically distributes settings.

**4:04** · DHCP determines an IP address through a four-step exchange. The device broadcasts a request to see if anyone is there, which is "Discover." The server replies with an offer of an address, which is " Offer." The device responds by saying it wants that address, which is " Request." The server confirms the assignment, which is "ACK." Taking the first letters, it is called DORA. DHCP distributes more than just IP addresses . The subnet mask, default gateway, and DNS server are also provided together.

**4:36** · With these four, a device can start communicating without any manual setup.

**4:41** · The distributed IP address is not given away, but leased. There is a set lease time, and it is renewed when the period expires. This allows unused numbers to be reclaimed and prevents duplicates.

**4:53** · Next is the subnet. An IP address indicates which network the first part belongs to, and which number it is in the second part. The number after the slash determines where the division is made. With a slash 24, the first 24 bits represent the network portion.

**5:08** · Since 8 bits remain, the number of devices allowed on the same network is 254. In other words, the subnet is information representing the size of your network. Devices determine every time whether the destination is on the same network as themselves. If it is in the same network, it passes it to the switch; if outside, it goes elsewhere.

**5:28** · This subnet information is used for that determination. A router is placed to go out to an external network. It is a device that connects different networks and acts as the exit for your own. The router reads the destination IP address of the received packet. It then determines where to pass it next and forwards it. While a switch makes decisions based on MAC, a router decides based on IP. However, there may be several routers connected to a single network. The device does not know which router to send it to.

### 第3章 データを外へ運ぶ

**5:56** · The default gateway is the setting that determines where to pass it if lost.

**6:03** · From the device's perspective, it feels like this. I don't know where this destination is. I'll leave it to the gateway for now. It essentially dumps everything outside its own network to the gateway. So how does the receiving router decide? The router has a table for each destination indicating where to send it next. Each line is a route, and together they are called a routing table. This table can also be written manually by a person. This is called static routing.

**6:30** · It is reliable for small scales, but manual work can't keep up as sites increase. That is where a routing protocol called OSPF is used. Routers within the same organization inform each other of their status. Based on that, it automatically calculates the path with the lowest cost. OSPF uses Dijkstra's algorithm to calculate the shortest path. It was devised by Edsger W. Dijkstra from the Netherlands in 1956, before the internet existed.

**6:59** · He recalled that he came up with the idea in about 20 minutes while at a cafe. Even if a line is cut, it automatically reselects another path. How does the entire internet spanning across companies adapt to changes in network topology without manual reconfiguration? This is where BGP, or Border Gateway Protocol, is used. ISPs and large companies inform their neighbors of the IP ranges they own. Early BGP was designed by IBM's Yakov Rekhter and Cisco's Kirk Lougheed.

**7:30** · Engineers from a research lab and a hardware manufacturer teamed up and compiled it as RFC 1105 in 1989.

**7:39** · What BGP determines is not speed, but rather which paths will reach the destination. The internet today is the result of companies sharing routes with one another. However, BGP basically trusts the information declared by the other party. Because of this, if an incorrect path is advertised, a massive amount of traffic flows in the wrong direction. In the past, this has even caused nation-wide communications to stop. Routing methods are chosen based on the scale of the network. Small configurations use static routing, internal networks use OSPF, and inter-company networks use BGP.

**8:07** · Connected in these three tiers, a network that reaches around the world is formed. With this, the structure of the network is complete. Now, let's test if it actually reaches the destination. We use the ping command for this. It sends out a small packet to see if a reply comes back. Ping was written by Mike Muuss, who was at the U.S. Army Research Laboratory. He created it in 1983 to investigate network issues and named it after sonar , which uses sound to detect reflections. Ping uses a protocol called ICMP. It stands for Internet Control Message Protocol.

### 第4章 本当に届くか試す

**8:39** · It is a tool not for carrying data, but for reporting on the state of the network.

**8:45** · The fact that a reply came back means the path to the other party is established. You can also find out the round-trip time. Up to this point, we have been talking about addresses and paths. IP is only responsible for the direction of where to send data. IP does not concern itself with whether the data actually arrived safely. That responsibility is handled by the transport layer, one level above. The most representative ones are TCP and UDP. First is TCP, the Transmission Control Protocol. It guarantees that data is delivered reliably and in order .

### 第5章 TCPとUDP

**9:17** · The original design for TCP/IP was created by Vint Cerf and Robert Kahn.

**9:24** · To connect different types of networks, they published a paper on common rules in 1974. The two received the Turing Award in 2004. TCP establishes a connection before sending any data.

**9:37** · Because it involves a three-step exchange, it's called a three-way handshake. SYN is short for synchronize , meaning to coordinate. ACK stands for acknowledgement, meaning received. As abbreviations, they look like incantations, but they're just greetings. Once connected, data is split into small packets and sent. At this time, TCP assigns a sequence number to each one. The term "packet" was coined by Donald Davies at the UK's National Physical Laboratory.

**10:03** · He thought that by splitting long data into small pieces, no one person would hog the line. If the routes taken are different, packets may arrive out of order. Since they are numbered, the receiver can put them back in the correct order. What happens if a packet is lost along the way? Since no confirmation returns, the sender sends it again. As a result, you get complete , gapless data. However, this reliability comes with a cost.

**10:34** · Establishing a connection and waiting for confirmations takes time. TCP is secure, but it is slower because of that. The other one is UDP, the User Datagram Protocol. This one uses a completely opposite approach. UDP does not establish a connection. It does not perform a handshake. It just starts throwing data without checking if the other side is ready. It doesn't number them, check them, or resend them if they are lost. Comparing the two, they have exactly opposite personalities.

**11:02** · TCP prioritizes reliability, while UDP prioritizes speed. This is why UDP is chosen for calls and gaming. Even if one is missing, it only causes a slight glitch. Because waiting for that one packet and having the whole thing stop is far more unpleasant. Here is an announcement. This channel offers YouTube memberships. Please check the membership link in the description for details. Right now, your computer has dozens of apps communicating at the same time.

### 第6章 ポートとファイアウォール

**11:31** · A single PC can handle file transfers and video calls simultaneously, right? How does it decide which app to hand the data to?

**11:40** · The answer is port numbers. Think of the IP address as the building's address and the port number as the room number. IP gets it to the device, and the port delivers it to the correct app . Frequently used numbers are determined in advance. Encrypted web traffic uses 443, while name resolution uses 53, and so on. Jon Postel managed these number assignments for a long time. He served as RFC editor for about 30 years and created the system for number management that later became IANA.

**12:11** · However, sometimes you send data to port 443 and get nothing back. There is a possibility it was stopped along the way. The guard at the gate is the firewall. Firewalls decide whether to allow or block incoming and outgoing communication. You define rules based on port numbers, IP addresses, and the direction of traffic. Adding one line to the allow rules will let the packets through. The communication now goes through, but there is still a problem.

### 第7章 通信を守る

**12:37** · If someone is sitting on the path in between, they can read the contents as they flow by. This is because passwords and credit card numbers are being sent as plain text. TLS is what solves this.

**12:49** · It stands for Transport Layer Security, and it encrypts the communication itself. TLS is said to sit between TCP and the application. From the app's perspective, it’s just passing data as usual. But by the time it actually hits the network, the contents are unreadable. There are broadly two ways to handle encryption. One is symmetric encryption, where you use the same key to lock and unlock it. It's fast, but the problem is how to get that key to the other party safely. The other method is public-key encryption. It uses a pair of two different keys.

**13:21** · Data locked with the public key can only be opened with the corresponding private key. That's why it doesn't matter who sees the public key. Whitfield Diffie and Martin Hellman introduced the concept of public-key encryption. In their 1976 paper, they proposed a way to handle public information and secret information separately. The two of them received the Turing Award in 2015.

**13:48** · Public-key encryption is secure, but computationally heavy and unsuitable for large data. That is why TLS combines these two methods. It uses public-key for key exchange, and common-key for actual data transfer.

**14:02** · TLS exchanges are broadly divided into four stages. First, as a prerequisite, a connection is made via a TCP three-way handshake. TLS begins by running on top of that. Next, the browser sends a message called a " Client Hello." It is an introduction stating which TLS version and encryption methods it supports. The server selects one from that list to actually use and sends it back. This is the "Server Hello." The server then continues by sending its certificate to the browser.

**14:32** · The certificate contains the server's public key. It also includes the domain name, expiration date, and the issuer's signature. The browser does not trust the certificate just by receiving it. It verifies the signature to ensure it was issued by a trusted certificate authority. This verification prevents spoofing by fake servers. If verification fails, the browser issues a warning and blocks further progress. Common causes include expired dates, domain name mismatches, or unknown issuers.

**15:01** · The browser creates the common key used for communication at this stage. This is called a session key. It encrypts that session key with the server's public key and sends it.

**15:12** · Even if someone steals it in transit, they cannot open it. This is because what is locked with a public key can only be opened by its matching private key. Since the private key never leaves the server, only the server can open it . Once the server opens it with its private key, both sides have the same session key. From here on, they exchange data using that common key with high-speed encryption. One might wonder why public-key is not used until the end. It is because public-key encryption is computationally heavy and unsuited for large data. We use the heavy method just to exchange keys, then switch to a lighter method.

**15:43** · What I just explained is the easier-to-understand flow of TLS 1.2.

**15:50** · The current version is TLS 1.3, which reduces the exchange to a single round-trip. Key exchange methods have also been unified to Diffie-Hellman, making it more secure. You've likely heard the term SSL before. It’s the predecessor to TLS, and all its versions are now deprecated. Even when people say "SSL" on the job, what’s actually running is TLS. TLS only protects a single connection at a time.

**16:16** · VPNs are used when you want to protect all traffic across a network. It stands for Virtual Private Network, meaning a virtualized private link. A VPN creates an encrypted tunnel between endpoints or networks. Any traffic passing through it is protected regardless of its type. It is often used to connect to internal systems from outside the office. Up to this point, we’ve specified targets using IP addresses.

### 第8章 名前でたどり着く

**16:41** · But nobody types an IP address into their browser. We type names like youtube.com instead. The system that translates these names into IP addresses is DNS. Domain Name System acts as the phonebook of the internet.

**16:55** · DNS was conceived by Paul Mockapetris at the USC Information Sciences Institute. Back then, they distributed files listing names and addresses, but updates couldn't keep up with growth.

**17:07** · DNS was created to manage names hierarchically, delegating authority to specific owners. When looking up a name , the device first checks its own cache . If unknown, it queries a component called a resolver. The resolver first asks the root server who is in charge of ".com". Next, it asks the ".com" authority, finally reaching the domain’s authoritative server. This back-and-forth happens in a fraction of a second. DNS doesn't just hold address mapping tables. Record types are defined based on the specific purpose.

**17:40** · "A" and "AAAA" are for addresses. " CNAME" is for aliases. "MX" is for email destinations. Once a result is retrieved, it is saved for a while.

**17:49** · This is called a cache. The storage duration is determined by a value called TTL. This is why changes don't reflect for everyone immediately. A point of caution: traditional DNS queries are not encrypted. This means the sites you visit can be seen from along the path. Because of this, protocols like DNS over HTTPS are starting to be used. We have most of the necessary tools now. IP determines the destination, TCP ensures delivery, and TLS hides the content. All that is left is the essential content.

### 第9章 Webのやりとり

**18:21** · That is HTTP, the Hypertext Transfer Protocol.

**18:28** · A client asks for a page, and the server returns it. It is a very straightforward system of requests and responses. HTTP and the Web were conceived by Tim Berners-Lee at CERN.

**18:40** · He proposed them in 1989 and implemented the first browser and web server himself the following year. The order was building the Web on top of the already existing Internet. What is actually flowing is a string of text like this. The first line specifies the action and the location of the requested item. The subsequent lines are headers that convey sender information and desired formats. The reply from the server is also a string of text in the same way. The status code on the first line indicates whether it was successful. 200 means success. 404 means it was not found.

**19:09** · 500 means there is an error on the server side. HTTPS is this HTTP running on top of the aforementioned TLS. The ' S' at the end stands for Secure. The protocol itself is the same; only the transit path is encrypted. The lock icon in the browser indicates two things. That the communication is encrypted and that the domain of the other party is verified. However, it is not a guarantee that the site is run by a safe operator. Besides the Web, there are many other protocols with different roles. First is SSH, or Secure Shell.

### 第10章 そのほかのプロトコル

**19:43** · It is used to securely log in to and operate a remote server. SSH was created as a replacement for the previously used Telnet. This is because Telnet transmitted even passwords in plain text. With SSH, you can log in using a pair of public and private keys instead of a password. SSH was created by Tatu Ylönen of Finland. Following a password-stealing attack on his university network, he released the first SSH in 1995.

**20:10** · You can operate a remote server directly from your local terminal. File transfers and port forwarding can also be done over the same path. There are also protocols for sending files. One that has been around for a long time is FTP, the File Transfer Protocol. However, since it is in plain text, there is no reason to choose FTP today. The protocol that carries email is called SMTP. It stands for Simple Mail Transfer Protocol, dating back to the 1980s.

**20:38** · However, SMTP only handles sending; receiving uses a different protocol. HTTP is based on a round trip: a request and a response.

**20:48** · This makes it difficult for servers to initiate communication. That is where WebSockets come into play. It starts as a regular HTTP request. Then, the connection switches to create a two-way path. It is used for chats, online games, and live stock updates. Finally, there is QUIC. It is a protocol making the modern web much faster. Previously, TCP connections and TLS handshakes were done separately. QUIC combines these two into a single exchange.

**21:17** · QUIC was initially designed by Jim Roskind at Google. Because TCP is deeply embedded in OS and hardware, they built it on UDP instead. It was later developed by the IETF and standardized as an RFC in 2021. QUIC runs on top of UDP while providing its own reliability mechanisms. Furthermore, one lost packet does not stop other data streams .

**21:45** · This keeps videos and communications smooth even with an unstable connection . At this point, we have covered the basics of communication. But as users increase, a single server cannot handle the load. That is why we place a load balancer in front. It stands before multiple servers and distributes requests. This prevents overloading one server and allows the cluster to handle it all. Load balancers regularly check if each server is still alive. If one fails, it redirects traffic to the others so the service stays up.

### 第11章 サーバを増やす

**22:15** · Finally , let's look at everything we have built in a single view. We started with a single device and reached a worldwide network. Thinking of protocols in layers makes them easier to organize in your head. The lower layers are closer to hardware; the upper layers, to our needs. Knowing which layer you are discussing helps avoid confusion. Every component was created by someone to solve a specific problem.

### まとめ

**22:41** · We added MAC addresses because we didn't know who was next to us, IP addresses because networks weren't enough, and TCP because we didn't know if packets arrived. Ports were added because we didn't know which app it was for. TLS was added because our data was being read. DNS was added because we can't remember numbers, and load balancers because one server isn't enough. You will likely encounter the names of new protocols from now on. When you do, try looking into the inconveniences that existed before they were created.

**23:10** · Usually, the first few pages of the RFC will explain that story. If you found this video interesting or helpful, please be sure to subscribe to the channel and leave a like. See you next time. This is a message from the engineering career agent, TechG. You can get a free career consultation via the link in the description. TechG has three main features; first, you can have as many interview practice sessions as you need.

**23:37** · While typical agents might not offer mock interviews at all or limit them to just once, you can practice repeatedly here. Being comfortable in interviews makes it easier to showcase your achievements, which is a big plus. Second, for those who are busy, we offer one-day screening sessions. We hold exclusive screening events featuring popular companies. Our one-day screening sessions, where you can finish all interviews in just one Saturday, are particularly popular.

**24:06** · This is highly recommended for engineers who are busy during the week. Third, we have a wealth of high-salary positions. Since we are operated by the same company as MyVision, a career agent specializing in consulting and high-class jobs, we have many high-paying openings. We recommend this to those who want to work on major projects or aim for positions at mega-ventures. Please try a free career consultation by clicking the link in the description.