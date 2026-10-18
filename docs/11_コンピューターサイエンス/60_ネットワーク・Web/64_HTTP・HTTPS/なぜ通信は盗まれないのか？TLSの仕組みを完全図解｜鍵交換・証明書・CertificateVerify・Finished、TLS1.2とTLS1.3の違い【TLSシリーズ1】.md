---
title: "なぜ通信は盗まれないのか？TLSの仕組みを完全図解｜鍵交換・証明書・CertificateVerify・Finished、TLS1.2とTLS1.3の違い【TLSシリーズ1】"
source: "https://www.youtube.com/watch?v=INN1c5DWVys"
author:
  - "[[ぎゅぎゅっとテック]]"
published: 2026-10-07
created: 2026-10-18
description: "https のページを開くとき、ブラウザとサーバーは何を送り合い、何を確かめてから暗号化しているのか。TLS 1.3 のハンドシェイクを、ClientHello から Finished まで、メッセージの順に 1 通ずつ読み解きます。「公開鍵」と一括りにされがちなものを、3 種類に分けて整理します。・ルートストアの公開鍵（OS やブラウザに最初から入っている）・証明書の公開鍵（認証局が署"
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=INN1c5DWVys)

https のページを開くとき、ブラウザとサーバーは何を送り合い、何を確かめてから暗号化しているのか。  
TLS 1.3 のハンドシェイクを、ClientHello から Finished まで、メッセージの順に 1 通ずつ読み解きます。  
  
「公開鍵」と一括りにされがちなものを、3 種類に分けて整理します。  
・ルートストアの公開鍵（OS やブラウザに最初から入っている）  
・証明書の公開鍵（認証局が署名した、サーバーの長く使う鍵）  
・使い捨ての公開鍵（接続のたびに作る、キーシェアの鍵）  
  
そのうえで、ハンドシェイクを 4 つの問いとして見ていきます。  
1\. 見ている人には作れない共通の秘密を作れたか（ClientHello・ServerHello）  
2\. この公開鍵を www.example.com のものと信じてよいか（Certificate）  
3\. 今話している相手は、その秘密鍵を本当に持っているか（CertificateVerify）  
4\. ここまでの会話と鍵は、2 人で一致しているか（Finished）  
  
小さな数での鍵交換、Python で動かす X25519・HKDF・AES-GCM・署名、curl -v や openssl s\_client での観察など、手元で確かめながら進めます。  
最後に、TLS 1.2 と 1.3 の違い（なぜ 1 往復減ったのか、前方秘匿性）も説明します。  
  
▼ こんな人向け  
・https や TLS を使っているけれど、中で何が起きているか説明できない  
・ClientHello や証明書の名前は知っているが、つながりが分からない  
・TLS 1.2 と 1.3 の違いを、理由まで言えるようになりたい  
  
▼ チャプター  
0:00 導入：どうやって安全な通り道を作るのか  
6:00 全体像 1：認証局・ブラウザ・サーバーと 3 種類の公開鍵  
9:32 全体像 2：1 本のはしごと 4 つの問い  
17:50 第 1 部 問い 1：見ている人には作れない共通の秘密（鍵交換）  
27:32 第 2 部 鍵を作る：準備用の鍵と本番用の鍵（HKDF・AES-GCM）  
36:43 第 3 部 問い 2：この公開鍵を信じてよいか（証明書とルートストア）  
41:11 第 4 部 問い 3：相手は秘密鍵を持っているか（CertificateVerify）  
45:53 第 5 部 問い 4：会話と鍵は一致しているか（Finished）  
48:29 全体像に戻る：攻撃者の手はどこで止まるか  
49:42 第 6 部 TLS 1.2 と 1.3 の違い  
1:01:46 まとめ  
  
▼ 補足  
・動画の実験は、すべて手元のパソコン（127.0.0.1）で行っています。www.example.com は説明用の名前で、証明書も説明用に自分で作ったものです（実在の認証局ではありません）。  
・鍵交換の実物は X25519 の部分だけを扱います（今の curl などが使う X25519MLKEM768 の ML-KEM の部分は扱いません）。  
・コードは中の計算を見るための実験です。実際のアプリでは、OpenSSL などの TLS のライブラリに任せてください。  
・初めてつなぐときの流れだけを扱い、つなぎ直し（再接続）は扱いません。  
  
▼ 主な参考資料  
・RFC 8446 The Transport Layer Security (TLS) Protocol Version 1.3（2026 年 7 月に RFC 9846 で改訂）  
・RFC 7748 Elliptic Curves for Security（X25519）  
・RFC 5280 Internet X.509 Public Key Infrastructure Certificate and CRL Profile  
・RFC 8448 Example Handshake Traces for TLS 1.3  
・RFC 9325 Recommendations for Secure Use of TLS and DTLS  
・Chrome Root Store FAQ / Apple「Available root certificates for Apple operating systems」/ Microsoft「Configure trusted roots and disallowed certificates in Windows」  
  
▼ 関連動画  
・TCP/IP の全体像：https://www.youtube.com/watch?v=AlJXwfOCYhg  
・ディフィー・ヘルマン鍵交換：https://www.youtube.com/watch?v=YpSqcq8FOtc  
・HTTPS の証明書：https://www.youtube.com/watch?v=qarVh9XAFiU  
  
▼ 再生リスト「ITの仕組み入門｜しくみを図解でゼロから」  
https://youtube.com/playlist?list=PLXlTlS8raBns&si=5LyXZszBmRe7F\_NC  
  
#TLS #HTTPS #ネットワーク  
  
#ぎゅぎゅテク  
#ぎゅぎゅっとテック

## 詳しい要約

**テーマ：TLS 1.3 のハンドシェイクを「3 種類の公開鍵」と「4 つの問い」で読み解く**

TLS は盗聴・改ざん・なりすましの 3 つを防ぐための決まりで、TCP の接続の後、HTTP の前に行われる。TLS 1.3 のハンドシェイクを ClientHello から Finished までメッセージ順に追い、各メッセージが「4 つの問い」のどれに答えているかを、小さな数の計算、Python（X25519・HKDF・AES-GCM・Ed25519）、curl -v / openssl s_client での観察で確かめる。最後に TLS 1.2 との違い（往復数と前方秘匿性）を説明する。

---

### 導入：TLS の位置づけと 2 種類の暗号

- 何もしなければ通り道で **盗聴（eavesdropping）・改ざん（tampering）・なりすまし（impersonation）** が起こりうる。TLS の RFC もこの 3 つを守るべきものとして挙げている
- TLS で暗号化した接続の中で HTTP を話すのが **HTTPS**（既定ポート 443）。HTTP/3 では TLS 1.3 の仕組みが QUIC に組み込まれる
- SSL は TLS の前の世代。SSL と TLS 1.0/1.1 は禁止され、1.0/1.1 は 2021 年に正式に非推奨。今使われているのは **TLS 1.2 と 1.3**
- **共通鍵暗号**は速く大量のデータを暗号化できるが、同じ鍵を相手と共有する必要がある。**公開鍵暗号**は公開鍵と秘密鍵のペアを使うが計算が遅い
- TLS は両者を組み合わせる：中身は共通鍵暗号、公開鍵の仕組みは **鍵交換** と **署名（本人確認）** に使う。TLS 1.3 では長期の公開鍵で秘密を暗号化して送る方式（RSA 鍵交換）は使わない

### 全体像 1：認証局・ブラウザ・サーバーと 3 種類の公開鍵

| 関係 | 公開鍵 | 特徴 |
|---|---|---|
| 認証局（CA）とブラウザ | **ルートストアの公開鍵** | OS・ブラウザに最初から入っているルート証明書の中の鍵。接続ごとには送られない |
| 認証局とサーバー | **証明書の公開鍵** | サーバーが作った長く使う鍵。CA がドメイン管理を確認して「この名前の公開鍵はこれ」と署名。署名は発行時に 1 回だけ |
| ブラウザとサーバー | **使い捨ての公開鍵** | 接続ごとに作って捨てる鍵。key_share（キーシェア）に入れて交換する（ブラウザ側 A、サーバー側 B） |

### 全体像 2：1 本のはしごと 4 つの問い

- HTTPS のページを開く流れは「TCP で接続 → TLS ハンドシェイク → 暗号化した HTTP」の 3 段階
- TLS 1.3 のメッセージは **ClientHello → ServerHello → EncryptedExtensions → Certificate → CertificateVerify → Finished（サーバー）→ Finished（ブラウザ）** の 7 つ。その後 HTTP のリクエスト
- ClientHello・ServerHello は暗号化されない（まだ鍵がない）。その後は **準備用の鍵**、ページのリクエスト以降は **本番用の鍵** で暗号化される
- 4 つの問い：
  1. 見ている人には作れない共通の秘密を作れたか（ClientHello・ServerHello／使い捨ての公開鍵）
  2. この公開鍵を www.example.com のものと信じてよいか（Certificate／ルートストアから中間 CA をたどる）
  3. 相手はその秘密鍵を本当に持っているか（CertificateVerify／証明書の公開鍵）
  4. ここまでの会話と鍵は 2 人で一致しているか（Finished／共通の秘密から作った鍵）
- Chrome の DevTools の Security タブで TLS のバージョン・鍵交換・署名方式・暗号スイートや証明書が見られる。`curl -v` ではメッセージ名が順に表示され、Mac の curl の鍵交換は **X25519MLKEM768**（X25519 と量子計算機対策の組み合わせ。動画は X25519 部分のみ扱う）。`openssl s_client -msg` では ServerHello の後から暗号化されていることが分かる

### 第 1 部 問い 1：鍵交換で共通の秘密を作る

- ClientHello には使える暗号方式の一覧、鍵の計算の種類の一覧、key_share（A）が入る。ServerHello には選んだ方式と B が入る
- 鍵をそのまま送ると見ている人にも鍵が渡る。必要なのは「見られても安全な情報だけで、2 人だけが同じ鍵を持てる」方法
- 絵の具のたとえ：共通の色に自分の秘密の色を混ぜて渡し合い、受け取った色にまた自分の色を混ぜると同じ色になる。混ぜるのは簡単だが戻すのは難しい
- 小さな数での計算：共通の数 5 と 23、ブラウザの秘密 6、サーバーの秘密 15 → 送る値は 8 と 19 → 両者とも **2** にたどり着く。秘密も 2 も送られていない
- 小さな数なら総当たりで秘密が見つかるが、本物の **X25519**（楕円曲線、32 バイト）は今のコンピューターでは現実的な時間で逆算できない
- X25519 では、固定の起点を秘密の回数だけ「足す」。秘密の回数だけ同じ操作を繰り返す点は小さな数と同じ形
- これが **ディフィー・ヘルマン鍵交換**。秘密の数は接続ごとに作って捨てる（**ephemeral**＝使い捨て）。**ECDHE** は使い捨ての楕円曲線 DH の略。証明書の秘密鍵は署名にだけ使う別物
- 盗聴者に見えるのは A と B と宛先のドメイン名だけで、共通の秘密は計算できない。ただし相手が本物かはまだ分からない

### 第 2 部 鍵を作る：HKDF と AES-GCM

- 共通の秘密をそのまま鍵にしない理由は 2 つ：**偏り** がありうること、**用途ごとに別の鍵** がほしいこと（方向別・準備用と本番用）
- **HKDF** は 2 段階：まず 1 つの強い秘密にまとめ、そこから必要な長さの鍵を用途ごとに取り出す。どちらの段階も **HMAC** を使う
- ラベルで秘密を分ける：準備用は **c hs traffic / s hs traffic**、本番用は **c ap traffic / s ap traffic**。さらに会話の要約（ハッシュ）を混ぜるので接続ごとに秘密が変わる
- 各秘密から "key" と "iv" を取り出す（AES-128-GCM なら鍵 16 バイト、IV 12 バイト）
- 準備用の秘密には ClientHello〜ServerHello の要約、本番用の秘密には ClientHello〜サーバーの Finished の要約（Certificate・CertificateVerify を含む）が混ざる → 本番の鍵は相手を確かめた会話に結びつく
- 色が ServerHello の直後で変わるのは、ServerHello を受け取った時点で両者が共通の秘密を計算できるから。最初の EncryptedExtensions には鍵作りに不要な応答が入る
- TLS 1.3 の暗号はすべて暗号化と改ざん検知を 1 回で行う。AES-GCM で暗号化すると暗号文の後ろに 16 バイトの **タグ** が付き、1 ビット書き換えると「invalid tag」で開けない（接続を切る）。ただしデータの長さは隠れない
- IV はそのまま使わず、レコードごとの番号（0 から 1 ずつ増える）と組み合わせて毎回違う値にする（同じ鍵で同じ値を使い回すと破られる手がかりになる）
- 環境変数 **SSLKEYLOGFILE** を設定して curl を動かすと実際の秘密がファイルに出力され、Wireshark で復号できる。漏れると記録した通信が読めるので、自分の通信を調べるときだけ使い、終わったら消す
- 実際のアプリではこれらの計算は OpenSSL などの TLS ライブラリに任せる。計算の値は RFC 8448 の例と一致することを確認済み

### 第 3 部 問い 2：証明書とルートストア

- 署名は秘密鍵で作り、対の公開鍵で確かめる印。持ち主しか作れないが誰でも確かめられる
- 証明書にはサイト名・サーバーの公開鍵・発行した CA の署名が入る。多くの場合、サーバー証明書に署名するのはルートではなく **中間認証局**
- サーバーは自分の証明書と中間 CA の証明書を Certificate メッセージで送る。ブラウザは下の証明書の署名を上の発行者の公開鍵で確かめ、これをルートまで繰り返す（**証明書チェーン**）
- 他に、名前がドメインと一致するか、有効期間内か、**失効（revocation）** していないかも確かめる（確かめ方はブラウザによって違う）
- TLS が確かめるのは「そのドメイン名の持ち主とつながっているか」だけで、似た名前の偽サイトは見分けられない
- 攻撃者が自作した証明書には信頼された CA の署名がなく、ルートストアにつながらないので弾かれる。名前違い・期限切れ（100 日後の日付で検証）も弾かれることを実験で確認

### 第 4 部 問い 3：CertificateVerify

- 証明書は公開情報なので、途中の誰でも本物の証明書をそのまま見せられる。本当の証拠は対応する **秘密鍵を持っていること**
- 鍵交換の弱点は相手が誰かを確かめないこと。途中の者が双方と別々に鍵交換すれば、復号して読み、再暗号化して転送できる（**中間者攻撃（Man-in-the-Middle）**）
- 署名では、まず **ハッシュ**（代表例 SHA-256）で内容を固定長に要約してから署名する。これまで「会話の要約」と呼んでいたのはこのハッシュ
- Python で Ed25519 署名（64 バイト）を作ると検証 OK、1 ビット変えると「Invalid Signature」。署名は内容を隠さない（隠すのは AES-GCM の役目）。サイトの証明書では ECDSA や RSA が多い
- サーバーは証明書の直後に、両者の鍵の材料を含む会話への署名（CertificateVerify）を送る。ブラウザは証明書の公開鍵で確かめる。材料をすり替えると署名が合わず、攻撃者は秘密鍵がないので作り直せない

### 第 5 部 問い 4：Finished

- サーバーの Finished は、ClientHello〜CertificateVerify の会話の要約に **Finished 用の鍵**（方向ごとの秘密から作る）で HMAC の印を付けたもの。署名とは別物
- 受け手も同じ計算をし、印が一致すれば同じ鍵を作れていて会話が改ざんされていないと分かる
- ブラウザも、サーバーの Finished までの会話の要約で自分の Finished を作り、準備用の鍵で暗号化して送る。決まりにより、自分の Finished を送るまでページのリクエストは送らない
- ページのリクエストからは本番用の鍵に切り替わる

### 全体像に戻る：攻撃者の手はどこで止まるか

| 攻撃者の手 | 止める仕組み |
|---|---|
| 見ているだけの盗聴 | 使い捨ての公開鍵による鍵交換 |
| 自作の偽証明書 | ルートストアにつながらない |
| 本物の証明書の使い回し | CertificateVerify（証明書の公開鍵で確認） |
| 準備中のメッセージの改ざん | CertificateVerify の署名と Finished の印 |

- ただし、信頼された CA が正しく発行していること、ルートストアに別のルートが足されていないことが前提。会社が社員の端末に独自のルートを入れると、そのルートから作った証明書も通る

### 第 6 部 TLS 1.2 と 1.3 の違い

- 同じ条件で比べると最初の 1 文字が届くまで 1.2 は約 315ms、1.3 は約 215ms。初回接続の暗号化の準備が **1.2 は 2 往復、1.3 は 1 往復** だから（片道 50ms の遅延で準備は約 215ms と約 115ms）
- 1.2 の流れ：ClientHello（key_share なし）→ ServerHello・Certificate・ServerKeyExchange（使い捨て鍵交換の場合）・ServerHelloDone → ClientKeyExchange・ChangeCipherSpec・Finished → ChangeCipherSpec・Finished。暗号化は ChangeCipherSpec の後からなので **証明書は暗号化されない**
- curl で `--tls-max 1.2` にすると ServerKeyExchange・ClientKeyExchange が表示される
- 1.3 でも TCP の 1 往復とページの 1 往復があるので、全体では 1.3 が 3 RTT、1.2 が 4 RTT
- 1.2 で材料を先に送れなかった理由：1.2 では **RSA 鍵交換**（ブラウザが鍵の種をサーバーの公開鍵で錠をかけて送る）と使い捨て鍵交換をサーバーが選ぶ。公開鍵は証明書に入っていて、応答が来るまでどちらを送るかも分からない。そもそも最初の挨拶に材料を入れる欄がない
- 1.3 は初回接続の鍵作りを **使い捨て鍵交換だけ** にし、RSA 鍵交換を削除。最初の挨拶に key_share 欄を作り、サーバーが選びそうな種類を予想して材料を入れる
- 予想が外れるとサーバーが **HelloRetryRequest** で再送を求め、1 往復増える
- **前方秘匿性（forward secrecy）**：通信を保存しておき後でサーバーの秘密鍵を盗んだ場合、RSA 鍵交換なら鍵を再現できた（実験で一致）が、使い捨て鍵交換では一致しない。サーバーの秘密鍵が共通の鍵の計算に関わらないため
- 1.3 は古い暗号も削り、暗号化と改ざん検知を同時に行うものだけを残した。ServerHello 以降はすべて暗号化（証明書も）。1 つの設計で速さと安全性が両立した
- 1.2 をすぐ止めるべきかというと必ずしもそうではない。**RFC 9325**（2022 年）は、楕円曲線の ECDHE を選ぶなど指針に従えば 1.2 も 1.3 と同じくらい安全としつつ、使えるなら 1.3 を選ぶべきとしている

### まとめ

- 安全な通り道は **鍵交換・暗号化・証明書** の組み合わせで作る。使い捨ての公開鍵で共通の秘密を作り、HKDF で鍵を作って ServerHello 以降を暗号化し、証明書チェーンと CertificateVerify で相手を確かめ、Finished で会話と鍵の一致を確かめる
- 盗聴は共通鍵暗号、改ざんは AES-GCM のタグと Finished、なりすましは証明書と署名で防ぐ
- 教科書で「ハイブリッド暗号」と呼ばれる、公開鍵で共通鍵を送る方式は 1.2 の RSA 鍵交換で、1.3 で削除された
- 1.3 は鍵作りを使い捨て鍵交換に絞ったことで、1 往復のハンドシェイクと全接続での前方秘匿性を同時に実現した

## Transcript

### 導入：どうやって安全な通り道を作るのか

**0:00** · It's easy to just assume that if you see a padlock icon, HTTPS is safe. Many people know it's encrypted, but can't explain what's happening or where. So, let's dive deep into the key to all of this: TLS. First, I want you to think about one thing. How do we create a secure communication channel? When you open a page in a browser, your data passes through home Wi-Fi, routers, and many other devices before reaching the server. You can't always guarantee who owns those intermediate devices.

**0:32** · If you do nothing, three problematic things could happen. The first is having the content read in transit—eavesdropping . The second is having it altered in transit—tampering. The third is connecting to a fake server— impersonation. If you connect to a fake server, everything you send will be read by that fake. How do we build a path that prevents these three issues?

**1:04** · The set of rules for that is TLS. First , let's look at where TLS fits into the big picture. This is the overview from the TCP/IP video I made before. For those who haven't seen it, I'll explain it briefly. When you enter a URL, it translates the name to a number, routes the data, establishes a path, encrypts it, requests the page, and draws it on screen. TLS is situated right there at the encryption step.

**1:33** · TLS stands for Transport Layer Security, and it's a protocol for creating a secure path between a browser and a server.

**1:45** · Internet standard documents are called RFCs and are assigned numbers. The TLS RFC also lists three things it must protect. That the contents aren't read, that changes are detected, and that the target server is verified as genuine.

**2:03** · This corresponds exactly to the three concerns we mentioned earlier. TLS operates after the TCP path is established and before HTTP starts exchanging page data. Speaking HTTP inside a TLS-encrypted connection is what we call HTTPS. In the HTTP standard documentation, the default port for HTTPS URLs is 443. A port is like a room number inside a server.

**2:30** · In this video, we will focus on TLS running over TCP. In HTTP/3, the TLS 1.3 mechanism is built into a different transport method called QUIC. When researching TLS, you will often see the name SSL as well. SSL is the name for the generation preceding TLS. Even now, we sometimes refer to TLS as SSL, such as in "SSL certificates."

**3:00** · However, SSL itself and older versions of TLS, 1.0 and 1.1, are prohibited by standards documents. TLS 1.0 and 1.1 were also officially deprecated in 2021. The versions currently in use are TLS 1.2 and 1.3. Now, let's zoom in on the TLS portion of the overall picture to see how it works inside. In this video, we will first look at two overall perspectives.

**3:31** · One is a map of the players and their roles, and the other is a ladder diagram showing messages in chronological order. In parts 1 through 5 that follow, we will go through the ladder messages one by one to answer four questions. In part 6, we will explain the differences between TLS 1.2 and 1.3, including the reasons why.

**3:54** · First, let's look at the zoomed-in view in chronological order. When opening an HTTPS page, three things happen between the browser and the server in sequence.

**4:06** · First, a connection is established via TCP. Second, a TLS handshake is performed to prepare for encryption.

**4:15** · Third, the page is requested and received using encrypted HTTP. Before looking at the big picture, let's cover two types of encryption. This is a topic that comes up frequently as a fundamental concept. The first is symmetric-key encryption. The same key is used for both encrypting and reverting to the original data.

**4:35** · Reverting the data back to its original state is called decryption. It is computationally fast and can encrypt large amounts of data. However, it cannot be used unless both parties possess the same key. The problem then becomes how to share that key with the other party. The second type is public-key encryption. This uses a pair of two related keys. One is the public key, which can be distributed to anyone . The other is the private key, which only the owner possesses.

**5:03** · In methods like RSA, the public key acts like a padlock anyone can close, and the private key acts as the only key to open it. However, unlike a real padlock , the public key can be copied and distributed infinitely. This property is achieved through numerical calculations. Public key systems are convenient, but they take longer to compute than symmetric ciphers. That is why TLS combines the two.

**5:32** · It uses fast symmetric encryption to encrypt the actual content. The public key system is used for key exchange, so both parties share a number, and for digital signatures to verify identities. In TLS 1.3, we do not use the method where the server sends the shared secret encrypted with a long-term public key.

**5:54** · This method is called RSA key exchange, which we will look at in the next section. The first big picture: three parties and three types of public keys.

### 全体像 1：認証局・ブラウザ・サーバーと 3 種類の公開鍵

**6:05** · Here, we introduce one more character.

**6:08** · The three parties are the browser, the server, and the Certificate Authority.

**6:13** · A Certificate Authority is an organization that issues certificates, often called a CA. When these three are placed in a triangle, each connection has a different role. Between the CA and the browser, it is pre-decided which CAs the browser trusts. Between the CA and the server, the CA guarantees the server's identity. And the connection between the browser and the server is the actual TLS communication. A different type of public key appears in each of these three connections.

**6:43** · First, between the CA and the browser. The browser holds the public keys of the CAs it trusts before it even connects. Included are the certificates of the highest-level CAs, known as Root CAs, called root certificates. Inside them, you will find the public key of that CA. The list of root certificates is called a root store, and it comes pre-installed in the browser.

**7:12** · OS and browser vendors vet which CAs to include, and if the list changes, it is updated through OS or browser updates. These are not sent every time a connection is made. This public key is referred to as the root store public key. Next is between the CA and the server. The server generates its own long-term key pair.

**7:37** · The private key is kept inside the server, and only the public key is sent to the CA to request a certificate. Applications are made for each domain. A domain is a site name like www.example. It refers to names like com. www.example.com is a name reserved for explanations and examples.

**8:00** · The certificate authority verifies if the applicant truly manages that domain, then signs a document stating "this is the public key for this name" using its own private key.

**8:14** · This is the certificate. A signature is a mark that can only be made by the holder of the private key; we will look at this in detail later. This signature is applied at the time of issuance and is not re-applied every time you connect. The public key inside the certificate is called the certificate's public key. Finally, there is the connection between the browser and the server. What we use here is a key pair created for each connection and discarded after use. This public key is called a disposable public key.

**8:43** · The browser and server each create their own, place them in a "key," and exchange them to generate a shared secret that observers cannot create. We call the browser's disposable public key A, and the server's B. "Key" is the name of the L that carries A and B; when this video mentions "key materials ," it refers to these A and B. This is the first overview map.

**9:08** · The root store's public key is on hand before connecting, the certificate's public key arrives in the certificate, and the disposable public key is created each time. From here on, we will proceed while confirming on this map which two parties we are talking about and which public key is involved. The second overview: a single ladder. The second overview is the timeline.

### 全体像 2：1 本のはしごと 4 つの問い

**9:37** · Please recall the three steps in chronological order we saw at the beginning. Connect the path via TCP, prepare with a TLS handshake, and receive the page via encrypted HTTP. The ladder is an expansion of this middle TLS handshake drawn as a single line. Let's define the meaning of "round trip" here. One full send and the return of a reply from the other party is counted as one round trip. The greeting to connect the path via TCP is "I want to connect.""

**10:12** · Okay." That is three communications of understanding. However, the browser can send the next message immediately after sending the confirmation. Since it doesn't wait for a reply, it counts as one round trip. Let's turn the preparation in the middle into a conversation. This is the newer TLS 1.3 . When the browser says which methods it can use, it predicts what the server might choose and includes the key materials too.

**10:38** · The prediction means guessing the type the server will choose and sending those materials ahead of time. I will talk about what happens if it guesses wrong in the dropout section. The server agrees to that, sends its own materials, and from there on, it sends the certificate encrypted. Finally, it says that the conversation so far should match its own records. This completes the setup.

**11:07** · The browser replies that it has verified the certificate and conversation, and immediately follows up by asking for the page. We will calculate and verify what the key materials are and why it is okay for them to be seen in Part 1. This preparatory conversation is a sequence of messages with specific names. A message is a piece of information sent from one side to the other. I will read them in the order they are sent. When lined up, they look like this.

**11:35** · The browser's Client Hello and the server's Server Hello. Next, the server sends four items. Encrypted Extensions, Certificate, Certificate Verify, and Finished. Finally, with the browser's Finished, these seven items complete the setup. After that, the HTTP page request follows. I will also summarize which messages are encrypted.

**12:02** · The two messages, Client Hello and Server Hello , are sent without encryption. This is because key materials are being exchanged and the keys do not exist yet . We create separate keys for the setup phase and the actual communication. The reason for this will be covered in Part 2. The subsequent four server messages and the browser's Finished are encrypted with the setup key. From the page request onward, it switches to the production key. In the ladder diagram, I will represent these three using different colors.

**12:33** · The three colors are for the unencrypted part, the setup key , and the production key. Each message in this ladder diagram answers one question. The first question is answered by the two messages up to Server Hello. Have we created a shared secret that an observer cannot generate ? The second question is answered by the Certificate. Can we trust this public key as belonging to www.example.

**13:00** · com? What arrives with the Certificate is a certificate containing the public key. Certificate Verify answers that one. Does the party I'm talking to really hold that secret? Finished answers question four. Do our conversation and keys match up so far?

**13:23** · Once all four questions are answered, we send HTTP using the production key.

**13:29** · These four questions are also connected to the diagram. A disposable public key answers question one. Question two is answered by following public keys from the root store through the intermediate certificate authorities. Question three is answered by the certificate's public key. Question four is answered using a key derived from the shared secret, not a public key. Let's observe it on your own device. This conversation isn't just something on a diagram.

**13:58** · You can verify it yourself using browser developer tools and terminal commands.

**14:06** · First, let's look at the browser. In Chrome, open the developer tools, or DevTools. You can open it with Command + Option + I on Mac, or F12 on Windows.

**14:19** · Select Security from the tabs at the top to open a panel showing connection and certificate information. In this panel, you can view connection and certificate details for the site you have open. Under Connection, you'll see the TLS version for the protocol, the key exchange method, the signature algorithm, and the cipher suite. Under Certificate, you can see the certificate's name, expiration date, and issuer.

**14:50** · For large sites, the protocol might appear as QUIC. This is the transport method for HTTP/3, which uses TLS 1.3 mechanisms internally. The display may vary depending on your version of Chrome. Next is the command line. If you add the-v option to the curl command, it displays what curl is doing internally. I tested this by setting up a server on my local machine . I set the name to www.example.com and directed it to my local server.

**15:22** · On the line labeled TLSv 1.3, you'll see Client Hello, Server Hello, Encrypted Extensions, Certificate, Cert Verify, and Finished. "Out" represents what curl sent. "In" represents what it received. This shows the order in which curl processed them, which matches the order I just mentioned.

**15:46** · The encrypted message names appear because curl itself is at the bridge of the communication and can decrypt them. You don't need to worry about the ChangeCipherSpec line in the middle; it’s just a formality. OpenSSL sends this. OpenSSL is the component within curl responsible for TLS.

**16:10** · The SSL connection line below it summarizes the version, encryption method, and key material type. On this Mac's curl, the type is X25519ml. 768. It combines the X25519 calculation with a calculation prepared for quantum computers. In this video, we will only cover the X25519 side.

**16:38** · Further down, the certificate name, issuer, and verification status are displayed. I created this issuer myself for the purpose of this explanation. In this experiment, the root signs it directly for demonstration. It passed verification because I provided a root certificate for explanation to curl as a trusted list. This is the same as adding it to the root store. You can also observe this with a command called openssl s\_client.

**17:10** · Adding "-msg" displays sent and received items with arrow directions and message names. After the Server Hello, an "Inner Content" line is inserted before the message. This line appears when opening the encrypted block, indicating that everything after it arrived encrypted. Returning to the big picture. So far, we have confirmed that the big picture of the map and ladder, and the ladder itself, flow in the same order.

**17:41** · From here, we will make it concrete to deepen our understanding . We will answer the questions on the ladder one by one. Part 1: A shared secret that an observer cannot create.

### 第 1 部 問い 1：見ている人には作れない共通の秘密（鍵交換）

**17:56** · We will look at the first two steps of the ladder: Client Hello and Server Hello. The question here is: were we able to create a shared secret that an observer cannot create? On the map, this refers to the disposable public keys between the browser and the server . The first is the Client Hello sent by the browser. "Client" refers to the browser side. It contains a list of supported encryption methods and a list of supported key calculation types.

**18:24** · The method for encrypting the content and the calculation for creating key materials are separate components, so they are listed separately. And in the field called "key," you will find the materials for the chosen type of key.

**18:43** · Next is the Server Hello, which the server returns. It contains the chosen method and the server's materials. Once these two are gathered, both parties can create the same shared secret and generate keys from it. The Client Hello's key contains A, and the Server Hello's key contains B. So, how do we create a secret that an observer cannot replicate? What if we send the key directly?

**19:10** · The initial greeting is not yet encrypted, so it can be seen along the way. If the browser created the key and sent it as is, anyone watching could also have the same key. If that happened, all subsequent encrypted messages would be read. What we need is a way to exchange only information that is safe to be seen, allowing both parties to have the same key while keeping it impossible for an observer to recreate. Let's think of it in terms of paint. First, decide on one color that everyone knows.

**19:41** · Each of the two prepares their own secret color, mixes it with the decided color, and passes only the mixed color to the other. Both parties then add their own secret color to the color they received from the other. By doing this, both arrive at the same color containing all the components. An observer watching the process sees the two mixed colors, but they cannot extract the secret colors or recreate the same final color.

**20:10** · However, the real version isn't paint, but mathematical calculations. Mixing them is easy, but reversing the mixed result is so difficult that it cannot be finished in a realistic timeframe with current computers. We choose and use calculations of that nature. Now, let's try an actual calculation with small numbers. First, we decide on two numbers that everyone knows. They are 5 and 23. The browser chooses 6 as its secret number, and the server chooses 15. These numbers, 6 and 15, are not sent.

**20:42** · The browser multiplies 5 by itself 6 times and then divides by 23 to get a result. Multiplying 5 by itself 6 times gives 15,625, and dividing by 23 leaves a remainder of 8.

**20:55** · The server multiplies 5 to the power of 1, then finds the remainder when divided by 23. This results in 19.

**21:02** · These numbers, 8 and 19, are the materials they exchange. Next, the browser takes the received 19, multiplies it 6 times, and finds the remainder when divided by 23. The server takes the received 8, multiplies it 15 times, and finds the remainder when divided by 23. Both results are 2.

**21:21** · Even though the secret numbers 6 and 15 were never sent, both arrived at the same 2. This 2 was never sent either.

**21:30** · Why do they match? The browser's calculation treats the result of 5 to the 1st power as a block, multiplied 6 times. That means 5 is multiplied a total of 6 times. The server's calculation multiplies a block of 5 to the 1st power 15 times, which also totals 6. Multiplication and division have a property where replacing values with remainders along the way doesn't change the final remainder. That is why , when taking the remainder by 23, 19 can stand in for 5 multiplied 15 times.

**22:07** · An observer only knows the four values: 5, 23, 8, and 19. Here, we try multiplying 5 repeatedly starting from 1 to see when the remainder becomes 8.

**22:19** · With these small numbers, the secret 6 is found on the 6th try. The commonly used X25519 uses a different type of calculation called elliptic curves, with much larger numbers. Even with the fastest known solving method, today's computers cannot finish in a realistic timeframe. Both ends arrive at the same number, but an observer cannot reverse the process. This structure is the same as with the small numbers. Now, for the real calculation.

**22:49** · I will run the X25519 key exchange, which appeared in the curl command earlier, using a short Python program. Records of SSL 3.0 tests show X25519 materials were 32 bytes in size. In the first two lines, the browser and server each generate their own secret numbers. In reality, these are random numbers, but here I used fixed values to ensure the results are consistent.

**23:21** · The next two lines create 32-byte numbers from the secrets that are safe to be made public. These are the materials that go into the key exchange. It is also called a public key in the code. The line labeled " exchange" is where the common secret is calculated from the other party's public number and your own secret number. The browser uses the server's number, and the server uses the browser's number. Looking at the output , the two 32-byte values are identical, and the result of the check is true.

**23:56** · The calculation performed inside is the same shape as when using small numbers.

**24:01** · With small numbers, we multiplied the base number by the secret count. With X25519, we add a fixed starting point the secret number of times. This is what elliptical curve calculation is.

**24:15** · Both are the same in that they repeat the same operation the secret number of times. The difference is that the secret number is 32 bytes long. We only exchange numbers that are safe to be made public. Even though the key itself is never sent, both parties end up with the same key. This mechanism is called a key exchange. It is also called Diffie-Hellman key exchange after the people who invented it. The identity of the key materials A and B are the numbers that are safe to share, like 8 and 19 earlier. There is one more important technique.

**24:48** · The secret number is created fresh for every connection and discarded afterward. In English, this is called "ephemeral," meaning temporary. In this video, we call it a disposable key exchange. This disposable secret number is different from a certificate's secret. The certificate's private key is used for a long time and only for signatures. The commonly seen ECDHE is an abbreviation for an Elliptic Curve Diffie-Hellman key exchange using ephemeral keys.

**25:21** · X25519 is also one of these elliptic curve calculations. You will learn why disposability is important in Part 6.

**25:31** · So when is the disposable key created?

**25:34** · After connecting via TCP, the browser generates the secret number as a random value when creating the Client Hello.

**25:43** · It calculates the public value from that and sends it inside the key. The secret number is kept only in memory and never sent outside. After the calculation method is determined by the Client Hello, the server generates its own secret number and returns the public value inside the Server Hello key. The secret number is no longer used once the common secret has been calculated. Now, let's place an eavesdropper between our triangle browser and server.

**26:11** · Regarding keys, all the eavesdropper can see are the two disposable public keys inside the ClientHello and ServerHello. They can see the destination domain name, but everything after that is encrypted.

**26:28** · Since the eavesdropper lacks both of their secret numbers, they cannot calculate the shared secret. Reversing the secret number from the public key would not finish in a realistic time on current computers, even with the fastest known methods. An eavesdropper who just watches is stopped here. Let's return to the big picture. By now, we have established that we can create a shared secret that an observer cannot produce. This is the answer to question 1.

**26:56** · By sending A and B back and forth in the ClientHello and ServerHello, both sides can calculate and hold the same number. Someone who was watching cannot generate the same number. We confirmed this with small numbers and with the real X25519. However, we still don't know if the other party is truly the server. We confirm that with the CertificateVerify question. And this shared secret is not used as-is for the encryption key.

**27:24** · Next, we will look at how the color changes on the ladder are made. Part 2: Creating Keys. Recall the colors on the ladder. It changed to the preparation key color right after the ServerHello, and to the production key color starting from HTTP. Here, we will see how these color transitions are created. The material is the shared secret we created in Part 1. Why not just use the shared secret as the key?

### 第 2 部 鍵を作る：準備用の鍵と本番用の鍵（HKDF・AES-GCM）

**27:58** · There are two reasons. One is that it might be biased. The result of a key exchange doesn't necessarily have every bit as a 0 or 1 with equal probability.

**28:10** · We want to use values that do for our keys. The other reason is that we want separate keys for each purpose. For the browser-to-server direction and the server-to-browser direction. We separate the keys for the preparation phase and the production phase. First, we consolidate the shared secret into one strong secret, then generate as many keys of the required length as needed for each purpose from that single secret. We call this two-stage calculation HKDF.

**28:37** · Both stages use a key to create a specific mark for the data, which is called HMAC. Since this mark is unpredictable to anyone who doesn't know the original secret, it can be used as key material. In TLS 1.3, we assign names to the consolidated secrets to create separate secrets. We call these names labels. The direction from the browser during the setup is called CHS Traffic. The direction from the server is called SHS Traffic.

**29:09** · C stands for Client. S stands for Server.

**29:15** · HS stands for Handshake. For actual use , we use CAP Traffic and SAP Traffic, which include AP. If the labels are different, the resulting secrets will be different. Furthermore, we also mix in a summary of the conversation so far . The summary is created by a calculation called a hash, which condenses content into a fixed-length value. We will look at this in detail in Part 4. Since different conversations result in different secrets, the secrets change for every connection. I ran this using Python as well.

**29:47** · I used the 32-byte value created by X25519 earlier as the input. In the first stage of KDF, I consolidated it into a strong secret, and in the second stage, I changed only the labels to CHS Traffic and SHS Traffic. The two secrets produced were completely different values. For the sake of explanation, I used a fixed value as a substitute for the conversation summary . From each secret, we then extract two values using the labels "key" and "IV".

**30:19** · Here, I assumed the use of AES-128-GCM, so the key is 16 bytes. The IV is 12 bytes, which serves as the base for the value used in each encryption. The key and IV values were different for the browser-to-server direction and the server-to-browser direction. In this way, we created the actual keys used from the shared secret. Actually, the curl line we saw in the overview showed AES-256.

**30:46** · This version has a key 32 times larger, and the length of the original secret is also different. I will summarize everything up to this point as the key stage on one slide.

**30:58** · The starting point is the shared secret created during key exchange. In the first stage of HKDF, we consolidate this into the original secret for the handshake. From there, we create handshake secrets for each direction using CHS Traffic and SHS Traffic. The conversation summary mixed in covers from Client Hello to Server Hello. The production secret is created by advancing from the initial handshake secret to generate the production base secret, from which the client and server application traffic keys are derived.

**31:30** · The summary of the conversation mixed into this includes everything from ClientHello to ServerFinished. This also incorporates the Certificate and CertificateVerify messages used to authenticate the parties. Therefore, the production keys are bound to the conversation where the identity has been verified. And they cannot be generated until ServerFinished is completed. So why is the color transition right after ServerHello?

**31:56** · Because it is only when the ServerHello is received that both sides have the full information to possess a shared secret. When the server sends ServerHello, and the browser receives it, both can calculate the shared secret and the handshake keys. Everything before that point has no keys, so it flows in plaintext, meaning it is not encrypted. Everything after that point can be immediately encrypted using the handshake keys.

**32:23** · From this point on, server messages are encrypted with the handshake keys. The first EncryptedExtensions message contains responses to the browser's requests that aren't needed to create the keys. For example, it returns the chosen settings if the server supports the options the browser listed in its ClientHello. We won't go into the details of those contents in this video . Now, we use the generated keys to encrypt the actual content. This is where the previously mentioned symmetric encryption is used.

**32:54** · All TLS 1.3 ciphers are designed to perform encryption and tamper detection in a single process. Here, we will run one of them, AES-GCM. We used the browser's transmit key and IV to encrypt the single line requesting the page. In a real scenario, the page request is encrypted with keys derived from the production application traffic secret.

**33:22** · Here, we are attempting the same calculation using the handshake keys we have on hand. The output is the unreadable ciphertext followed by a 16- byte tag. The tag is a mark used to detect if the data has been tampered with. When the receiving side decrypts it with the same key and IV, the original page request is revealed. So, what happens if we change just one bit of the ciphertext before decrypting it?

**33:48** · The result is an "invalid tag." In other words, it couldn't be opened because the tag didn't match. Instead of revealing the altered content, opening it will fail entirely. The protocol dictates that we terminate the connection when this happens. This is how we can detect if the contents have been tampered with. However, encryption does not hide the length of the data sent. The IV is not used as-is every time. TLS sends data by breaking it into chunks.

**34:18** · Each chunk is assigned a number starting from 0 that increments by 1, and this number is combined with the IV to create a unique value each time. This is because reusing the same value with the same key provides clues that can break the encryption. The previous code was for the first message . Since the number was 0, it remained the IV itself. You can observe these key stages on your own machine. If you set a filename in the SSLKEYLOGFILE environment variable and run curl, the secrets actually used by curl will be written to that file.

**34:50** · The keys used for encryption are derived from these secrets. You can only export them if the version supports this feature, which version 8.21 does. In TLS 1.3, two of the five lines—the client handshake traffic secret and server handshake traffic secret—are secrets for the initial setup. These were created from the CHS traffic and SHS traffic secrets.

**35:19** · The two lines for the client traffic secret 0 and server traffic secret 0 are the secrets for the actual data. These were created using the CAT traffic and SAT traffic secrets. The remaining exporter secret is for other purposes and is not covered in this video. Tools for inspecting traffic, such as Wireshark, can decrypt and display the contents of a saved session using this log.

**35:47** · Conversely, if this file is leaked, the contents of the recorded connection can be read. Do not use this except when inspecting your own traffic, and be sure to delete it when finished.

**35:59** · Returning to the big picture. We now understand the mechanism behind the color changes in the ladder diagram.

**36:05** · The shared secret is split into direction-specific and stage-specific keys using HKDF, and these keys, combined with AES-GCM, ensure privacy and detection of tampering. The code shown so far is an experiment to look inside the process. In real applications, these calculations are handled internally by TLS libraries like OpenSSL, and you do not build them yourself. We confirmed that the initial values of our key derivation calculations match the values in the RFC 8448 implementation example.

**36:35** · Next, we return to the ladder for the certificate question. Part 3: Can we trust the public key? Back to the ladder. The next message is the certificate. In 1.3, this certificate also arrives encrypted with the setup key. Inside is the certificate's public key. The question here is: can we trust this public key for www.example. com as belonging to the site?

### 第 3 部 問い 2：この公開鍵を信じてよいか（証明書とルートストア）

**37:08** · The starting point for the answer is the root store's public key. The clue for verification is the signature. A signature is a mark created with a private key and verified with its corresponding public key. Only the private key holder can create it, but anyone with the public key can verify it. The details of the calculation will be covered in Part 4. Now, let's look at the certificate between the CA and the server.

**37:35** · The certificate contains the site name and that server's public key. It also carries the signature of the issuing CA. This is the issuer's seal of approval. The certificate is stating that for this name, the public key is this. The clue to verifying if a certificate is authentic is the certificate chain. For highly trusted CAs, it's not the root but an intermediate CA that signs the server certificate.

**38:07** · The server sends its own certificate along with the intermediate CA certificate in the certificate message. The browser verifies the lower certificate's signature using the public key from the issuer above it.

**38:24** · This is repeated all the way up to the top root certificate. All we have from the start are the root certificates in the root store between the CA and the browser. If it chains back to our local root certificate, the approval is authentic. There are other things to check as well. Whether the name matches the domain, if it's within the validity period, and if the issuer revoked it.

**38:57** · Revoking a certificate is called revocation. There are mechanisms to check for revocation, but we won't go into them here. The actual verification method varies by browser. And TLS only verifies if you are indeed connected to the owner of that domain name. You can't tell a fake site apart just by its similar name. If looking isn't enough, why not intercept and pretend to be the server?

**39:21** · Requesting from a CA for www.example. com won't get you a certificate unless you manage the domain. So, suppose an attacker creates their own key pair and makes a certificate......containing the name " www.example.com" and their own public key. Anyone can create a certificate in terms of format alone. What's missing is the signature from a trusted certificate authority.

**39:49** · To create that signature, you need the CA's private key, which the attacker doesn't have.

**39:58** · Even with a fake signature, it won't trace back to the root store's public key, so the browser flags it. I tested it locally; the "browser" role is a small program that verifies certificates. When an interceptor presented a self-made certificate with the same name, the browser blocked it for lacking a trusted stamp.

**40:20** · Even with a real certificate, if the site name doesn't match, it flags a mismatch and stops. When I checked a sample certificate with a date 100 days later, it was flagged as expired. Back to the big picture. Now we know how to verify if a certificate's public key is trustworthy. This is the answer to question two.

**40:49** · The chain connects to the local root store, the name and expiry match, and it's not revoked. Then, this public key can be trusted as belonging to www.example.com. A self-made fake certificate is stopped right here. But there is still something missing. Part 4: Does the other party actually hold the private key? The next message is the Certificate Verify.

### 第 4 部 問い 3：相手は秘密鍵を持っているか（CertificateVerify）

**41:17** · The question here is question three: Does the person I'm talking to really have that secret key? In the exchange, it's the certificate's public key's turn. In part three, we established that the certificate's public key is trustworthy . However, a certificate is public information. Anyone along the way can show you the real certificate as is.

**41:45** · Just showing it is not proof that the other party is legitimate. The real proof is possessing the private key that corresponds to the certificate's public key. That secret is held only by the real server. Even if you encrypt, if the recipient is fake, they will read the content. Actually, key exchange has a weak point. It does not verify who the other party is. The key material was numbers that don't matter if seen.

**42:13** · What's troublesome is not being seen, but being swapped in transit. Suppose an intruder performs a key exchange with the browser claiming to be the server, and with the server claiming to be the browser. Then, the intruder can hold separate shared keys with both. If they decrypt and read the message from the browser and re-encrypt it for the server, both ends won't notice. This type of intrusion attack is called a Man-in-the-Middle attack.

**42:49** · In this case, if the intruder shows the original certificate as is, the third check will pass. That is why Certificate Verify is needed. Digital signatures prevent this. Signatures also use a public key system, but the calculation is different from encryption. There are methods used only for signatures, such as Ed25519. You create a stamp with a private key and verify it with the paired public key.

**43:19** · It is a stamp that can only be created with a private key and verified by anyone with the public key. When signing, you first use a hash calculation to summarize the content into a fixed, short length. A representative one is SHA-256. Even if the content changes slightly, the value becomes completely different, and it is practically impossible to find different content that results in the same value. Because you sign this summarized value, if the content changes at all, it won't match during verification.

**43:49** · What I have been calling a summary of the conversation until now is this hash. Let's try running a signature in Python as well. I used the Ed25519 method because it is easy to show the results. For site certificates , ECDSA or RSA are common. First, we sign a value prepared as a substitute for the conversation summary using a private key. What comes out is a 64- byte signature. Verifying with the paired public key resulted in OK.

**44:23** · However, when I changed the value by just one bit and verified it, it became "Invalid Signature." Unlike encryption, signatures do not hide the content. A signature proves who created the data and that the content hasn't been altered. Hiding the content is the role of AES-GCM, as mentioned earlier. In TLS 1.3, the server sends a CertificateVerify signature right after the certificate.

**44:50** · With that signature, the server declares that it holds the certificate's secret key and conducted the conversation, including both parties 'materials. The browser verifies this signature using the public key from the certificate and checks it against the conversation it witnessed. If someone in the middle swaps the browser's or the server's materials, the signature will no longer match.

**45:18** · Because an attacker doesn't hold the real certificate's secret key, they cannot recreate the signature. Let's return to the big picture. We now know how to verify if the other party holds the certificate's secret key. This is the answer to question 3. If the CertificateVerify signature is validated by the certificate's public key, the party is the legitimate server possessing that private key. An attacker who just reuses a real certificate will be stopped here. There is only one question remaining.

**45:51** · Part 5: Do the conversation and keys match? The server's final step is the Finished message. It is a verification mark to confirm the conversation so far, essentially saying, "The conversation up to this point should match your records." This concludes the server's turn. This Finished message answers question 4: "Do the conversation and keys match between the two parties?" It uses a key derived from the shared secret, not the public key.

### 第 5 部 問い 4：会話と鍵は一致しているか（Finished）

**46:22** · The content of the server's Finished message is a summary of the conversation from ClientHello to CertificateVerify, marked with that key. This key is called the Finished key, created from the secret prepared for each sender's direction. The mark is created using the HMAC from Part 2, so it is different from a signature. The receiver performs the same calculation.

**46:51** · If the marks match, it proves that the same key was generated and the conversation was not altered. If someone in the middle altered even one message, the summary of the conversation will mismatch and the marks won't align. Even if they try to remake the seal, tampering with the materials is stopped by the Certificate Verify, so any intermediary does not possess the shared secret between the two. The browser receives and verifies this, then sends back its own Finished.

**47:19** · It confirms the conversation certificate and the conversation itself . The browser's Finished seal is written as a summary of the conversation up to the server's Finished. The browser also encrypts the Finished with the preparatory key and sends it. According to the rules, the browser does not send a page request until it sends its own Finished. That is why, right after the Finished, it says "please give me the encrypted page ." This was the preparation for step 3.

**47:48** · From the page request onward, it switches to the production key. Since the production secret is created from the summary of the conversation up to the server's Finished, both parties have it by this point. From here on, the HTTP conversation flows, protected by the production key and encryption like AES-GCM. Let's return to the big picture. Up to this point, we have learned how to verify if the conversation and keys match between the two parties. This is the answer to question 4.

**48:17** · If the Finished seals match , both parties hold the same key, and the conversation has not been altered.

**48:25** · With this, all four questions in the sequence have been answered. Let's return to the triangle. There were three types of public keys. We use the root store's public key as a starting point to trace the intermediate certificate authority's public key to verify if the certificate can be trusted. We use the certificate's public key to verify if the other party is the genuine server. We use the disposable public key to create a key for this connection only. Let's list the four moves an attacker can make.

### 全体像に戻る：攻撃者の手はどこで止まるか

**48:53** · An eavesdropper who only watches is stopped by the key exchange using the disposable public key. A self-made fake certificate is stopped because it does not connect back to the root store.

**49:06** · Reusing a genuine certificate is stopped by the Certificate Verify, which checks using the certificate's public key. Tampering with messages during preparation is stopped by the Certificate Verify signature and the Finished seal. However, this assumes the trusted certificate authority issues them correctly and no other roots have been added to the root store . For example, a company might install its own root certificate on an employee's device. In that case, certificates created from that root will also pass.

**49:36** · Passing the root certificate to Carl earlier for the explanation was the same thing. Part 6: The differences between TLS 1.2 and 1.3 . Here, we will only cover the initial connection flow, not the resumption mechanism. I tried opening the same page twice under the same network conditions. From the start of the preparation to receiving the first character of the page, one took about 315ms, and the other about 215ms.

### 第 6 部 TLS 1.2 と 1.3 の違い

**50:06** · The only difference is the TLS version. The old 1.2 and the new 1.3. Why is there about a 100ms difference? Let me give you the answer first. In the standard initial connection flow, preparing for encryption takes two round trips in 1.2 , and one round trip in 1.3. This difference accounts for the one round trip of about 100ms. If you line them up, it looks like this.

**50:37** · The left is 1.2 , and the right is 1.3. Both establish a path with TCP, prepare for encryption , and then request the page. What differs is the length of the preparation in the middle. Since we’ve already read the 1.3 conversation, here we’ll read the 1.2 conversation. In 1.2, the first step is also the browser’s ClientHello.

**51:03** · However, the 1.2 ClientHello does not have key shares and contains no key material. The server chooses a method in ServerHello and sends a certificate with Certificate. In 1.2, you could also choose how to create the keys.

**51:19** · When an ephemeral key exchange is chosen, the server also sends its materials via ServerKeyExchange.

**51:26** · Finally, it sends ServerHelloDone, meaning "that is all." This is the end of the first round trip. The second round trip is from the browser. It sends its own material with ClientKeyExchange, signals that encryption starts here with ChangeCipherSpec, and sends Finished.

**51:46** · The server also returns ChangeCipherSpec and Finished. My records showed a message called NewSessionTicket in between, but I won't cover it in this video. In 1.2, encryption begins after ChangeCipherSpec. Therefore, the certificate is sent without encryption.

**52:08** · And the server can only send Finished after receiving the browser’s material and creating a shared key. In 1.2, the browser's material arrives in the second round, so Finished is also in the second. Under the 1.2 rules, the browser requests the page only after receiving the server's Finished message . In 1.3, the materials arrive with the initial greeting, so the server can include the Finished message in its first response. You can see this 1.2 flow on your own machine as well.

**52:36** · When you connect with 1.2 by setting TLS max 1.2 in curl, the Server Key Exchange and Client Key Exchange lines appear.

**52:49** · The display "Server Finished" actually refers to the Server Hello Done message . It is just that curl's display name is confusing. There are no lines for Encrypted Extensions or Certificate Verify. Although curl does not display some lines, they appear in the same order as I named them. Let’s verify this with actual time. I used a communication path where I deliberately added a 50ms delay each way. The time taken for this round trip is called RTT .

**53:18** · The preparation took about 215ms for 1.2 and about 115ms for 1.3, which is almost 2 RTT and 1 RTT respectively.

**53:30** · The initial 315 and 215 in section 6 are the times with the addition of about 100ms for one round trip to request and receive the page. Here is a question. With 1.3, does the page arrive in one round trip after entering a URL and getting the number via DNS?

**53:51** · It does not. Here, we count from establishing a new TCP connection, preparing for encryption, and receiving the first page response. Only the preparation for encryption became one round trip. Before that, there is a round trip to establish the TCP path, and after that, a round trip to request and receive the page. Even in 1.3, it is 3 RTT, and for 1.2, it is 4 RTT. The initial measurement was the time excluding the TCP round trip.

**54:20** · Why couldn't 1.2 send the materials beforehand? Let's zoom in on the 1.2 preparation. In 1.2, there were two typical ways to create keys. One is the ephemeral key exchange calculated in Part 1. They exchange public numbers and calculate the same secret at both ends. The other one is RSA key exchange . The difference is the clue.

**54:46** · In RSA key exchange, the browser creates a number to serve as the key seed and sends it locked with the server's public key, essentially a padlock. Only the server with the private key can open it. This base number is called the key seed. Although it’s called key exchange, unlike the previous method, you are sending the key material itself inside a locked box. So, where is the server's public key?

**55:19** · It's inside the certificate. And that certificate arrives within the server's response.

**55:29** · In other words, with RSA key exchange, the browser doesn't have the "padlock" to lock the key material until it receives the server's response. In 1.2, the server chooses how to create the key in its response, whether to use this RSA key exchange or an ephemeral key exchange. From the browser's perspective, until the response arrives , it doesn't even know if it should send a locked box or a public number.

**55:56** · That’s why, under the 1.2 rules, the browser waits until it receives the server's response and certificate before sending anything. The order is the same even when an ephemeral key exchange is chosen. There are several types of calculations for ephemeral key exchange, and the server specifies which one to use in its response. To begin with, the 1.2 protocol has no field in the initial handshake to include key materials. That is why there is always a round-trip delay while waiting for the response.

**56:24** · This is a record of when I tested the 1.2 handshake myself. The data sent by the browser was transmitted after the server's certificate. In the case of RSA key exchange, the content was a 256 -byte box locked with the server's public key. In the case of ephemeral key exchange, it was a 32-byte public number. The formats are completely different.

**56:50** · TLS 1.3 simplified the way keys are created during a new connection to just ephemeral key exchange. RSA key exchange has been removed. In 1.3, the server still chooses the encryption method, but the key creation method is always ephemeral key exchange. This means what the browser sends is always a public number it can generate itself. And a new "key" field was created to include this in the initial handshake.

**57:19** · They redesigned the protocol itself so that materials can be sent upfront. The only thing not yet decided regarding the materials sent is the type of calculation to be used. The browser writes a list of supported calculation types in the initial handshake and also predicts which one the server will choose, including that material in the key field.

**57:40** · In the logs from my OpenSSL 3.0 test, the list of types showed just one , with the key containing a 32-byte X25519 value. Sometimes, the prediction is wrong. This happens when the server only uses a different type. In this case, the server asks to try again with its preferred type. This request is called a HelloRetryRequest. When I tested this myself, the browser had to send its greeting twice.

**58:11** · This adds one extra round trip. The one round trip in 1.3 only applies when the prediction is correct. What 1.3 discarded and what it gained. If a server's private key is leaked, whether past recorded communications can be read depends on how the keys were generated. Let's compare the RSA key exchange, which 1.3 removed, with ephemeral key exchange.

**58:38** · The scenario is as follows. An attacker saves all the encrypted traffic currently flowing without being able to read it. Then, suppose the server's private key is stolen years later. In RSA key exchange, the key material was sent inside the traffic, locked with the server's public key. With the saved traffic and the stolen private key, one can open the box and recreate the shared key.

**59:05** · When I tested this, the recreated key matched the one actually used by the browser. In ephemeral key exchange, only numbers that are safe to reveal were sent. Even when trying the same procedure, the keys did not match.

**59:23** · This is because the server's private key is not involved in calculating the shared key. It uses ephemeral secret numbers, which are discarded as soon as the connection ends. Past communications remain protected even if a long-term key is stolen later. This property is called forward secrecy.

**59:46** · Since 1.3 only uses ephemeral key exchange, all new connections have forward secrecy as long as the secrets and the resulting shared keys are properly deleted. RSA key exchange is not the only thing 1.3 removed. It cut out old encryption methods and kept only those that perform encryption and integrity checks at once. AES-GCM from the second part is one such example.

**1:00:14** · And all messages after the Server Hello have been encrypted. Even the certificate, which was sent unencrypted in 1.2, is now encrypted in 1.3. This is where speed and security converge.

**1:00:29** · 1.3 streamlined key generation to use ephemeral key exchange, and redesigned the handshake accordingly. Since the method is fixed, the browser can send materials ahead of time, effectively shortening the handshake. With the removal of RSA key exchange in favor of ephemeral exchanges, every new connection now has forward secrecy. A single design choice improved both speed and security.

**1:00:58** · So, does this mean we should immediately shut down servers still running on 1.2?

**1:01:07** · Not necessarily. The organization that defines TLS standards released usage guidelines in 2022. RFC 9325 states that if you follow the guidelines, such as choosing ECDHE with elliptic curves, 1.2 can be as secure as 1.3. The difference is that 1.3 mandates ephemeral key exchange for new connections and excludes RSA and older ciphers by default.

**1:01:36** · The same guidelines also specify that you should choose 1.3 if it is available. Let's return to our summary questions. How do we establish a secure communication channel? And what are the differences between TLS 1.2 and 1.3? Pause the video and try explaining it using the terms we covered today.

### まとめ

**1:02:01** · Let's check the answers against our four questions and three reasons. The browser and server exchange ephemeral public keys A and B to create a shared secret that observers cannot replicate. They use this to generate keys and encrypt everything after the Server Hello.

**1:02:30** · The server sends its certificate, and the browser verifies it by tracing back to a root store public key to see if it can be trusted. It then checks the Certificate Verify signature with the certificate's public key to confirm the sender holds the private key. Finally, they verify the handshake and key integrity with the Finished message before sending HTTP data with the session keys.

**1:02:56** · The difference from version 1.2 is that we’ve streamlined key generation into disposable key exchanges, allowing the material to be sent upfront. As a result, a 1-RTT handshake ensures that every new connection always maintains forward secrecy. However, if the prediction is wrong, a HelloRetryRequest will add one extra round trip. Finally, let's answer some common exam and interview questions using what we've learned today. If you are asked, here is how you can respond.

**1:03:27** · What does TLS prevent, and what mechanisms are used for each?

**1:03:34** · Eavesdropping is prevented by encrypting the contents with symmetric cryptography. Tampering is detected through AES-GCM tags and the Finished message verification. Impersonation is prevented by using certificates and digital signatures. How are symmetric and public-key cryptography distinguished in TLS? We use fast symmetric cryptography to encrypt the actual data. Public-key mechanisms are used for key exchange to share a secret , and for signatures to verify the other party.

**1:04:03** · The method often called hybrid encryption in textbooks, where a shared key is sent via public key, is the RSA key exchange used in 1.2. This was removed in 1.3. What is verified in a server certificate? We check if the certificate authority signature leads to a root certificate on hand, if the name matches the domain, and if it is within the validity period and not revoked. What is forward secrecy?

**1:04:30** · It is the property that even if the server’s long-term private key is stolen later, past recorded communications cannot be decrypted.

**1:04:43** · This is achieved by making the key exchange disposable and properly discarding the secret numbers and common keys. You can verify this process on your own machine. Try reading the messages in order using curl-v, and check where encryption begins using OpenSSL s\_client. You can also export the secrets using an SSLKEYLOGFILE, but be sure to delete it when you're finished. Key exchange calculations can be run using a short Python program.

**1:05:12** · When connecting to actual sites, the selected methods and order may differ from the output in this video. How do we create a secure communication channel? Today's answer was the combination of key exchange, encryption, and certificates. By following today's calculations, you can also explain why 1.3 reduced the round trips. I hope you’ll remember this handshake conversation the next time you open an HTTPS page. Please subscribe to the channel and leave a like. See you next time.