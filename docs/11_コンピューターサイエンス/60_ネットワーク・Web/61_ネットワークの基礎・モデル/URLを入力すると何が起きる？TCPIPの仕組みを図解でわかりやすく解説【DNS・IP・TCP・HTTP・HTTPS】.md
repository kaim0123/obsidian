---
title: "URLを入力すると何が起きる？TCP/IPの仕組みを図解でわかりやすく解説【DNS・IP・TCP・HTTP・HTTPS】"
source: "https://www.youtube.com/watch?v=AlJXwfOCYhg"
author:
  - "[[ぎゅぎゅっとテック]]"
published: 2026-10-04
created: 2026-10-18
description: "ブラウザに URL を入力すると、Web ページが表示されるまでに何が起きているのか。TCP/IP の仕組みを、全体像の図を少しずつ具体化しながら、初心者向けにわかりやすく解説します。DNS で名前を IP アドレスに変え、ルーターが包み（パケット）をバケツリレーし、TCP が確実に届け、ポート番号でプログラムを見分け、HTTP でページを頼み、HTTPS（TLS）で中身を守る。その流れを一本の"
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=AlJXwfOCYhg)

ブラウザに URL を入力すると、Web ページが表示されるまでに何が起きているのか。TCP/IP の仕組みを、全体像の図を少しずつ具体化しながら、初心者向けにわかりやすく解説します。  
DNS で名前を IP アドレスに変え、ルーターが包み（パケット）をバケツリレーし、TCP が確実に届け、ポート番号でプログラムを見分け、HTTP でページを頼み、HTTPS（TLS）で中身を守る。その流れを一本の旅としてたどります。  
  
▼ この動画でわかること  
・Web サイトはどこにあるのか（サーバー）  
・IP アドレスとは何か、名前とどう違うのか  
・DNS が名前を IP アドレスに変える仕組み（名前の木・リゾルバー・キャッシュ）  
・ルーターがパケットを届ける仕組みと、IP が「届くことを約束しない」理由  
・TCP が確実に届ける仕組み（通し番号・確認応答・再送・3 ウェイハンドシェイク）  
・ポート番号（80 / 443）  
・HTTP のリクエストとレスポンス  
・HTTPS と TLS で何が守られ、何が守られないのか  
・TCP/IP の 4 つの層と OSI 参照モデル  
  
▼ 目次  
0:00 URL を入力すると何が起きる？  
1:07 Web サイトはどこにある（サーバー）  
2:04 相手を番号で見分ける（IP アドレス）  
3:32 名前を番号に変える（DNS）  
8:48 番号を頼りに届ける（ルーターとパケット）  
11:51 確実に届ける（TCP）  
14:02 どのプログラムに届ける（ポート番号）  
15:58 ページを頼む（HTTP）  
18:01 途中で覗かれないように（TLS・HTTPS）  
20:14 学んだものを整理する（TCP/IP の 4 階層・OSI 参照モデル）  
22:00 まとめ  
  
▼ こんな方におすすめ  
・ネットワークやインターネットの仕組みを基礎から知りたい方  
・エンジニアを目指して勉強を始めた方  
・基本情報技術者試験などで TCP/IP を学んでいる方  
・「DNS」「TCP」「HTTPS」を言葉では知っているが、つながりがわからない方  
  
※ 図に出てくる IP アドレスやドメイン（example.com など）は説明用のものです。  
  
▼ 次回の動画  
DNSの仕組みを図解でゼロから｜ドメインがIPアドレスに変わるまで・レジストラとレジストリ・dig【ITの仕組み入門】  
https://youtu.be/IRe7o3ycpzY?si=SWyPx78gpVKyyB1T  
  
・TLSのしくみ：https://www.youtube.com/watch?v=INN1c5DWVys  
  
#TCPIP #ネットワーク #DNS #HTTPS #プログラミング初心者  
#ぎゅぎゅテク  
#ぎゅぎゅっとテック

## 詳しい要約

**テーマ：URL 入力からページ表示までを TCP/IP の役割分担でたどる**

「ブラウザが頼み、サーバーが返し、ブラウザが描く」という 1 本の矢印を、DNS → IP（ルーティング）→ TCP → ポート番号 → HTTP → TLS（HTTPS）と少しずつ具体化していく入門解説。各仕組みはそれぞれ別の問題を解くために積み重なっており、最後に TCP/IP の 4 階層と OSI 参照モデルで整理する。

---

### Web サイトの居場所と IP アドレス

- Web サイトの中身は世界のどこかにある**コンピューター（サーバー）**に置かれている。インターネットはそうしたコンピューター同士をつなぐ巨大なネットワーク。
- 相手は**IP アドレス**（0〜255 の数字 4 つをドットで区切る）という番号で見分ける。
- IP アドレスは「名前」ではなく**「場所」**。サイトが別のコンピューターに引っ越すと名前はそのままで番号が変わる。

### DNS：名前を番号に変える

- 昔は名前と番号の対応表を 1 か所の 1 ファイルで管理し、全員がコピーしていた（電話帳の配布）。コンピューターが爆発的に増えて破綻した。
- そこで名前を**階層**に分け、各階層をその名前を使う組織が管理する方式に変えた。これが **DNS**。
- 名前は右から読む：見えない**ルート** → com → example → www という木構造。
- PC 内の窓口は自分で探さず、外部の**リゾルバー**（多くはプロバイダー提供）に頼む。
  1. リゾルバーはまず**キャッシュ**を確認
  2. なければルートサーバーに聞く（ルートの住所はあらかじめ書き込まれている）→「com はこちらへ」
  3. com サーバー →「example.com はこちらへ」
  4. example.com サーバー → www.example.com の IP を回答
- キャッシュには**有効期限**（何秒覚えておくか）が付き、期限が切れれば聞き直すので、住所が変わってもいずれ新しい答えに置き換わる。
- よくある誤解：「DNS は全部を知る巨大な 1 台」「毎回ルートから聞き直す」→ **どちらも誤り**。階層ごとに分担し、各部分は 2 台以上で運用される。

### IP とルーター：番号を頼りに届ける

- データは回線の制約から小さな包み（**パケット**）に分けられ、宛先と送信元の番号が書かれる。
- **ルーター**は宛先番号だけを見て、番号の範囲ごとの表（どの隣に渡すか）で次の行き先を決める。全経路を知る機器はなく、**バケツリレー**で届く（ルーティング）。
- ルーターは渡したパケットを覚えず、到着のたびに最適な経路を選ぶので、1 本の経路が壊れても別経路で届く。迷子防止に**寿命**が書かれ、中継ごとに減って 0 で破棄される。
- IP は**届くことを保証しない**（消失・重複・順序の入れ替わりがあり得る）。中継機器が個々のパケットを追跡すると負荷が大きく故障に弱いため、**確認作業は両端のコンピューターに任せる**分業がインターネットを頑丈にしている。

### TCP：確実に届ける

- 送信側がデータに**通し番号**を付け、受信側は番号で並べ直し、重複は捨てる。
- 受信側は「次はこの番号をください」と**確認応答**を返し、返事がなければ送信側が**再送**する。
- やり取りの前に**3 ウェイハンドシェイク**（接続要求 → OK と自分も接続したい → 確認）で開始番号を共有する。
- 「IP が運び、TCP が確かめる」。この 2 つが中心なので TCP/IP と呼ぶ。パケットが消えたとき再送するのはルーターではなく**両端の TCP**。

### ポート番号：どのプログラムに届けるか

- 1 台のコンピューターでは多数のプログラムが同時に通信しているので、IP アドレス（建物の住所）に加えて**ポート番号**（部屋番号）を使う。TCP が通し番号とともに中身の先頭に書き、宛先のコンピューターが読む。
- 送信元・宛先の IP アドレスとポート番号の**4 つの組**でやり取りが一意に決まる。
- Web は固定番号で待つ：**HTTP は 80、HTTPS は 443**。だから URL に書かなくても届く。

### HTTP：ページを頼む

- つながっただけでは会話は始まらない。決まった書式で「**GET**（このページをください）」と頼み、サーバーは「**200 OK**」とページの中身を返す。
- 最初に届くのは設計図の **HTML**。ブラウザはそれを読んで画像やスタイルファイルを再び HTTP で頼み、そろったら組み立てて描画する（1 ページの裏で多数のリクエスト）。
- HTTP がデータを運ぶわけではない。HTTP は**会話の中身**を決めるもので、手紙で言えば HTTP が文面、TCP と IP が郵便の仕組み。

### TLS・HTTPS：途中で覗かれないように

- 多数のルーターを経由するので、のぞき見・改ざん・なりすましの危険がある。
- TCP 接続の後、HTTP の前に 1 段階を挟み、両端だけが読めるよう**暗号化**し、改ざんを検知でき、サーバーは**証明書**（信頼できる発行元の裏書き付き。その元の情報は事前に配布済み）で本物の持ち主であることを示す。これが **TLS**、その中で HTTP を話すのが **HTTPS**。
- HTTPS でも**どのサーバーと通信しているかは中継のルーターから隠せない**（宛先を暗号化すると届かない）。守るのは封筒の中身。また相手が名乗った本人かは確かめるが、**サイトの内容が正しいかは保証しない**。

### TCP/IP の 4 階層と OSI 参照モデル

| 層 | 役割 | 例 |
|---|---|---|
| アプリケーション層 | 何を話すか | HTTP、DNS（TLS は TCP と HTTP の間） |
| トランスポート層 | 端と端の確実な通信 | TCP |
| インターネット層 | 番号で包みを運ぶ | IP |
| リンク層 | 隣の機器まで届ける | ケーブル、Wi-Fi |

- 各層は下の層に任せ、下の細部を気にしない。送信時は下の層が上の層の成果物を封筒に入れ（TLS が暗号化、TCP が通し番号、IP が宛先番号）、受信側は外側から順に開ける。
- 7 層に分ける **OSI 参照モデル**もあり、現場の **L4**（TCP の層）・**L7**（HTTP の層）はその番号。名前より「各層がどんな問題を解くために生まれたか」を覚えるのが大事。

### まとめ

- URL の名前は **DNS**（リゾルバー → キャッシュ → ルート → com → example.com）で IP アドレスに変わる。
- **IP** はルーターのバケツリレーで運ぶだけで到着は保証せず、**TCP** が両端で通し番号・確認応答・再送により確実にする。
- ポート **443** に TCP 接続し、**TLS** で相手確認と暗号化をしたうえで、**HTTP** でページを頼み、200 OK と HTML を受け取って描画する。
- DNS・IP・ルーティング・ポート・TCP・TLS・HTTP は、それぞれ特定の問題を 1 つずつ解くために並んでいる。

## Transcript

### URL を入力すると何が起きる？

**0:00** · When you enter a URL into a browser, a website opens. We do this every day, but what exactly is happening behind the scenes? In this video, we will explain TCP/IP in an easy-to-understand way by gradually fleshing out the big picture. The goal is for you to be able to explain what happens behind the scenes in your own words by the time you finish watching. The initial answer is very simple.

**0:26** · Your computer's browser asks a remote computer to please provide this page. The other party sends back the contents of the page.

**0:38** · The browser receives it and draws it on the screen. For now, this is enough. We will use this diagram as the big picture. From here on, we will repeatedly zoom in to look at details and then return to the big picture.

**0:55** · Let's deepen our understanding little by little by looking at the big picture and the details alternately. By the end , you will be able to explain everything that happens within this single arrow. Where is the website?

### Web サイトはどこにある（サーバー）

**1:11** · First, one question. Where is a website located? Is it floating loosely in the space called the Internet? Actually, the content of a website is stored inside a computer located somewhere in the world. Large sites divide the work among many computers, but here we will think of it as one. Since its job is to send back pages when requested, we call this computer a server.

**1:37** · The Internet is a huge network connecting such computers to each other. By now, we have learned that the box on the right side of the big picture is a single computer called a server. The journey hasn't started yet. But there are countless computers in the world. How does the browser distinguish the target one? It identifies the other party by a number. To deliver a letter, you need a destination address.

### 相手を番号で見分ける（IP アドレス）

**2:10** · It is the same on the Internet, where each connected computer has a number that corresponds to an address. This number is called an IP address. An IP address is written as four numbers separated by dots, as shown on the screen. Each of these numbers ranges from 0 to 255. The browser uses this number as the destination to talk to the server. Here is a question. Is an IP address like a website's name?

**2:41** · Or is it more like a location? The answer is a location.

**2:49** · When a site moves to a different computer, the name stays the same, but the number changes. Internet standards clearly distinguish between names that represent what to look for and addresses that tell you where it is.

**3:04** · Looking up a location from a name is a job for a mechanism separate from IP addresses. So far, we know that servers are assigned a number representing their location, called an IP address.

**3:17** · But there is a problem. What we type into our browsers are names like www.example.com, not numbers. How do we find the number from the name? We convert names into numbers. Humans cannot memorize many sequences of four numbers. Plus, as we saw earlier, the number changes if the site moves. That is why humans use names, while computers use numbers.

### 名前を番号に変える（DNS）

**3:47** · We need a system in between to convert names into numbers. At first, it was a simple method. A table of names and numbers was kept in one file at a single location, and every computer copied the whole thing. It was like making one phone book and distributing it to everyone. However, as the number of computers exploded, this stopped working.

**4:16** · Just distributing the new table to everyone would clog the network. Even to change one name, you had to wait for the single central office to update the table. So, the approach was changed. We stopped having everyone keep a copy of the same phone book. We divide the name into layers, and each layer is managed by the organization that uses that name. If you don't know a part, you go ask someone who does. This system is called DNS.

**4:48** · Name layers are read from right to left. To the far right of www.example.com, there is an unwritten top point called the root. Under that is "com," and further under that, " example," and finally "www." It is like tracing a tree from the root to the tips of the branches. There are managers responsible for each part of this tree.

**5:15** · These managers aren't people , but computers placed all over the world, each with its own IP address.

**5:25** · The root server knows the address of the com server. The com server knows the address of the example.com server.

**5:34** · And the example.com server knows the address of www.example.com itself. So, who goes around asking these servers?

**5:47** · Inside your computer, there is a small window for looking up names. But this window does not search for information itself. It asks a specialized computer outside your PC to look it up instead.

**6:01** · This is what we call a resolver. The address of the resolver to ask is pre-configured on your computer.

**6:11** · Resolvers are often provided by internet service providers and shared by many people. The resolver first checks its own cache. If someone recently asked for the same name, the answer is still in the cache, so it can return it immediately. If it is not in the cache, it goes to ask the root server. The address of the root server is pre-written into the resolver. The root server does not know the address of www.example.com.

**6:42** · Instead, it tells you where to go, saying "For anything com, please ask this address." The com server doesn't know the answer either, but it tells you the address of the example.com server. Finally, when you ask the example.com server, it tells you "The address for www.example.com is this." The resolver writes this answer into its cache before returning it to the window on your PC.

**7:13** · This is how your browser finally obtains the destination address. The cache has an expiration date attached to it. Along with the answer, it tells you how many seconds to remember it, and during that time, it returns it from the cache without re-asking. Once the expiration time passes, it goes to ask again. Thanks to this expiration, even if the address changes, it will eventually be replaced with the new answer. Here, let's verify two common misconceptions.

**7:42** · First, that DNS is a single massive computer in the world that knows every name and number.

**7:54** · Second, that every time you enter a URL , you ask again starting from the root server. Are either of these correct?

**8:02** · The answer is both are wrong. Because the method of having everyone hold one single table reached its limit, names were divided into a hierarchy, with each part handled separately. And they are operated on two or more servers in case one breaks down. The answer is saved in a memo, so you only need to ask the root if it's not in the memo.

**8:26** · Now we understand how DNS works to convert names into numbers. The first step has been added to the top-left of the overall diagram. The resolver follows the referrals from one to another until it finally gets the number. What we have obtained here is just the destination number. Not a single character of the page has been delivered yet. Delivering by relying on the number. We now know the destination number.

### 番号を頼りに届ける（ルーターとパケット）

**8:53** · But there isn't a single line directly connecting your computer and the server. From the device called a router in your home to the communications company's equipment. It passes through many relay points further beyond that. The data you want to send is divided into small packages.

**9:15** · This is because lines have a limit on how much data can flow at once. Each package has the destination number and sender number written on it, like an envelope. These packages are called packets. The relay router only looks at the package's destination number to decide which way to pass it next, then sends it on. Routers have a table showing which neighbor to pass data to for each range of numbers, and they use that to decide.

**9:45** · But no device knows the entire route to the destination. It reaches the destination just by passing it on one by one, like a bucket brigade . Choosing this path is called routing.

**10:04** · The router doesn't remember the packet once it has been passed on. It just chooses the best available path for each packet the moment it arrives. So even if one path breaks, the next packet can be delivered via a different route. To prevent lost packets from wandering forever, a "lifespan" is written on them, which decreases at each hop and is discarded when it hits zero. This is an important point. This method of delivery does not guarantee arrival.

**10:36** · Packets can be lost in transit , two of the same packet can arrive, or they can arrive out of order. Relying on the number, it just transports them toward the destination. This set of rules is called IP. The "IP" in IP address comes from this. Doesn't failing to guarantee delivery make it flawed? Why would they design it that way?

**11:02** · If every router along the path had to track each individual packet, the load would be massive, and one broken unit would stop all communication. The relays focus solely on transport, leaving the verification task to the computers at both ends. This division of labor makes the internet resilient.

**11:28** · So far, we’ve learned that packets are transported via router relays. The arrows in the overall diagram have been replaced by a series of routers. Even the inquiry to the resolver earlier was actually carried by these packets and relays. However, it’s not guaranteed that everything will arrive in the correct order. Who at the two ends handles the verification work? Ensuring reliable delivery. Imagine web page data being split into several packets for transmission.

### 確実に届ける（TCP）

**11:58** · If one packet in the middle is lost, a part of the page will be missing. If the order gets swapped, the text will be jumbled up. IP, which only handles transport, doesn't look after such details. That’s why the computers at both ends use a clever workaround. The sender assigns sequence numbers to the data. The receiver looks at these numbers to reorder them correctly. If the same number arrives twice, one is discarded.

**12:27** · Furthermore, the receiver confirms what has been received so far. It sends a reply requesting the next sequence number.

**12:37** · The sender waits for a while if no reply arrives, then resends the data.

**12:42** · In this way, even lost packets eventually arrive. Before starting this exchange, both ends exchange a greeting . The browser sends a request to connect, and the server says it's okay.

**12:57** · It replies that it wants to connect too , and the browser confirms it. Since the starting sequence number changes each time, these three steps allow them to share their starting numbers and prepare. Sequence numbers, acknowledgments, and retransmission.

**13:17** · This builds reliable, sequential communication on top of the " best-effort" IP. These rules are called TCP. IP transports, and TCP verifies.

**13:30** · The internet's communication system is collectively called TCP/IP because these two are at the core. So, when a package goes missing, is it the router that dropped it that sends it again? No , the router doesn't remember the packages it passed on. It is the TCP of the computers at both ends that notices it is missing and sends it again. The job of verifying is left to both ends.

**13:58** · The division of labor we talked about earlier connects here. Which program should it be delivered to? The package has arrived at the server. However, many programs are running simultaneously inside a single computer . On your PC, other apps are communicating while you have several browser tabs open. Which program should the received package be handed to? That is where we use another number in addition to the IP address.

### どのプログラムに届ける（ポート番号）

**14:29** · It is like a room number written after a building's address. This number is called a port number. The TCP writes the port number at the beginning of the package's contents, along with the sequence number. Since routers only look at the address label, the room number is read by the destination computer. For the sender's room number, the computer chooses a number that is open at that time. The destination and sender's IP addresses and port numbers.

**15:01** · This combination of four elements uniquely identifies the specific exchange. Programs that return web pages usually wait at a fixed room number. If the URL starts with HTTP, it is port 80. If it starts with HTTPS, it is port 443. The reason it reaches its destination without you writing the room number in the URL is that these fixed numbers are used. I will explain the difference between HTTP and HTTPS later.

**15:30** · By now, you understand TCP for reliable delivery and port numbers for room assignment. You get the destination number via DNS and exchange TCP greetings towards that room 443.

**15:46** · The package is carried by router relays , and TCP ensures the exchange is reliable and in the correct order. But we haven't asked for the page yet.

### ページを頼む（HTTP）

**15:58** · Requesting a page. Just being connected doesn't start the conversation. Both sides need to use the same language to understand which page is wanted and how to ask for it. The browser makes the request using a fixed format. "GET" on the first line means "please give me this page." The server also responds using a fixed format. "200 OK" means it went well, and the page content follows after that.

**16:29** · These rules for requesting and responding are called HTTP. The first thing to arrive is the blueprint of the page, called HTML. The browser reads the blueprint and uses HTTP again to request the images and style files described within. Once all the parts are gathered, it assembles them and renders them on the screen. A single page involves many requests happening behind the scenes. Here is a question.

**17:02** · Does HTTP carry the page data from the server to your computer? No, HTTP is not what carries it. What HTTP determines is the content of the conversation: what to request and how to respond. TCP ensures that the conversation is reliable, and IP packages it for delivery. In terms of a letter, HTTP is the message, while TCP and IP are the postal system.

**17:27** · However, unlike a letter, the message is divided into many separate packages for transport. We now understand how HTTP is used to request a page. It converts names to numbers, sets a path for the packages, ensures reliable communication, requests the page, and receives it. There is just one thing I haven't mentioned yet. It is the "S" at the end of "HTTPS" at the start of a URL.

**17:59** · To prevent it from being snooped on along the way. The packages are transported through many routers. If the contents can be read as they are, there is a risk of them being snooped on or tampered with. Also, we want to confirm that the person who gave us the number is truly the owner of that name.

### 途中で覗かれないように（TLS・HTTPS）

**18:24** · So, after connecting via TCP and before starting to talk via HTTP, we take one more step. We encrypt the exchange so that only the two ends can read it, preventing snooping. We also ensure that any tampering can be detected. And to prevent impersonation, the server shows an ID called a certificate to prove it is the genuine owner of that name. The certificate comes with the endorsement of a trusted issuer, and the original information for that is distributed in advance.

**18:56** · These preparatory rules for creating a seal are called TLS. And communicating via HTTP within that TLS seal is what we call HTTPS. The "S" in the URL was this seal. Here is a question. If you use HTTPS, can you hide which server you are communicating with from the routers along the way? You cannot.

**19:22** · Routers look at the destination number on the package label and pass it along. If you encrypt the label, the package won't reach its destination. HTTPS protects what is inside the envelope. HTTPS also verifies whether the other party is who they claim to be. It does not verify whether the content written on the site is correct. We now understand how HTTPS works.

**19:55** · After connecting via TCP, TLS uses a certificate to verify the party and encrypt, then HTTP conversations take place within that. Now we have the full path from entering a URL to the page being displayed. Let's organize what we have learned. Let's stack the mechanisms we've covered by their roles . The top layer determines what to talk about, and this is where HTTP and DNS reside.

### 学んだものを整理する（TCP/IP の 4 階層・OSI 参照モデル）

**20:27** · Below that is the layer that ensures reliable communication between endpoints, which is TCP. TLS sits between TCP and HTTP to perform its role. Below that is the layer that carries the package using numbers, which is IP. The bottom layer delivers data to the next machine, like a home router, via cable or Wi-Fi. From top to bottom, these are called the Application layer, Transport layer, Internet layer, and Link layer.

**20:58** · Each layer leaves the work to the layer below and doesn't worry about the details of what happens underneath.

**21:08** · HTTP can hold a conversation without knowing which path the package took.

**21:15** · When sending, each lower layer puts what the upper layer created into an envelope. TLS encrypts the HTTP text, TCP adds sequence numbers, and IP puts it in an envelope with the destination number. The receiving side opens the envelopes one by one from the outside.

**21:36** · There is another way to organize it by dividing it into seven layers, known as the OSI reference model. Terms like L4 and L7 heard in the workplace are the numbers of those layers counted from the bottom. L4 refers to the TCP layer, and L7 refers to the HTTP layer. Before memorizing names, remember what problems each layer was created to solve. Summary. Returning to the first question. Why does a website appear when you enter a URL?

### まとめ

**22:07** · Pause the video and try explaining it yourself using the terms we covered today. The browser first needs to convert the name in the URL into a number.

**22:29** · The computer's gateway asks a resolver, and if the resolver doesn't have it in its cache, it follows the path from root to com to example.com to get the IP address. Next , it exchanges a TCP greeting directed to room number 443 at that address. The exchange is divided into small packets and relayed from router to router following IP rules.

**22:57** · If a packet goes missing, the TCP at both ends notices and resends it. Once connected, it uses TLS certificates to verify the identity of the other party and encrypt the connection. Inside that connection, the browser uses HTTP to request the page.

**23:18** · The server returns "200 OK" along with the HTML, and the browser requests additional items like images to assemble and render on the screen. At the beginning, we summarized it as just requesting, sending back, and rendering . Now, you should be able to explain exactly what happens inside that single arrow. DNS, IP, routing, ports, TCP, TLS, and HTTP—each is lined up to solve a specific problem one by one.

**23:54** · The next time you enter a URL, try remembering this journey. Please subscribe and like the video.