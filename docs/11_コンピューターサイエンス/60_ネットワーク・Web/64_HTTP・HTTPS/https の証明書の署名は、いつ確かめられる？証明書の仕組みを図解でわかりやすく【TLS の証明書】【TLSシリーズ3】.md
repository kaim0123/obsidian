---
title: "https の証明書の署名は、いつ確かめられる？証明書の仕組みを図解でわかりやすく【TLS の証明書】【TLSシリーズ3】"
source: "https://www.youtube.com/watch?v=qarVh9XAFiU"
author:
  - "[[ぎゅぎゅっとテック]]"
published: 2026-10-07
created: 2026-10-18
description: "「ITの仕組み入門」シリーズの、TLS の回に出てきた「証明書」を 1 本に広げた回です。TLS の回を見ていなくても分かるように作っています。https のページは、ふつう警告も出ずに開きます。その裏では、証明書という小さなデータが届いて、確かめられています。では、証明書は誰が、いつ、何を保証しているのでしょうか。その署名は、発行のときに確かめられるのでしょうか、それともつなぐたびでしょうか"
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=qarVh9XAFiU)

「ITの仕組み入門」シリーズの、TLS の回に出てきた「証明書」を 1 本に広げた回です。TLS の回を見ていなくても分かるように作っています。  
  
https のページは、ふつう警告も出ずに開きます。その裏では、証明書という小さなデータが届いて、確かめられています。では、証明書は誰が、いつ、何を保証しているのでしょうか。その署名は、発行のときに確かめられるのでしょうか、それともつなぐたびでしょうか。  
  
Let's Encrypt で証明書を自動で取った。DNS に TXT レコードを置いた。中間証明書を置いたらエラーが直った。期限切れの警告を見た。この動画では、こうしたばらばらの点を、証明書の一生という 1 本の線でつなぎます。  
  
手元の openssl で自分が認証局になり、署名して、確かめて、1 バイトの書き換え・名前違い・期限切れ・知らない認証局・中間証明書の欠け・失効で弾かれるところまで試します。最後に、証明書の期限が 47 日へ縮んでいく理由と、自動更新が当たり前になった理由を話します。  
  
▼ こんな人向け  
・Let's Encrypt やクラウドの証明書を、手順どおりに設定したことはあるが、中身は習っていない  
・「証明書の署名はいつ確かめられるの？」と聞かれて、うまく答えられない  
  
▼ チャプター  
0:00 証明書は誰が、いつ、何を保証している？  
1:49 全体像（証明書の一生）  
4:00 第 1 部 証明書の中身（公開鍵・署名・Security タブ）  
8:06 第 2 部 署名はいつ付くのか（鍵・CSR・認証局）  
10:12 ACME と HTTP-01 / DNS-01  
12:29 発行と中間認証局  
14:49 CT（証明書の公開ログ）  
16:01 第 3 部 署名はいつ確かめられるのか  
19:32 壊して確かめる（中間の欠け・書き換え・名前違い・期限切れ）  
22:14 証明書だけでは足りない（CertificateVerify）  
23:06 失効（CRL と OCSP）  
26:19 第 4 部 なぜ期限があるのか  
27:04 398 日から 47 日へ  
29:22 まとめ  
31:20 自分のサイトで見てみる  
  
▼ 関連動画  
・TLSのしくみ：https://www.youtube.com/watch?v=INN1c5DWVys  
・ディフィー・ヘルマン鍵交換：https://www.youtube.com/watch?v=YpSqcq8FOtc  
  
▼ 再生リスト「ITの仕組み入門｜しくみを図解でゼロから」  
https://youtube.com/playlist?list=PLXlTlS8raBns&si=5LyXZszBmRe7F\_NC  
  
  
▼ 参考にした資料  
・RFC 5280 Internet X.509 Public Key Infrastructure Certificate and CRL Profile  
・RFC 2986 PKCS #10（CSR）  
・RFC 8555 Automatic Certificate Management Environment (ACME)  
・RFC 6962 / RFC 9162 Certificate Transparency  
・RFC 6960 OCSP  
・RFC 8446 TLS 1.3（2026 年 7 月に RFC 9846 へ改訂）  
・CA/Browser Forum Baseline Requirements、Ballot SC-081v3  
・Let's Encrypt の公式のお知らせ（OCSP の終了、証明書の有効期間）  
  
動画中の実験は、手元の Mac（127.0.0.1）だけで自分のルート・中間・サーバーの証明書を作って行ったものです。実在の認証局や本物のサイトには接続していません。  
  
  
  
#SSL証明書 #HTTPS #TLS #LetsEncrypt #ITの仕組み入門  
  
#ぎゅぎゅテク  
#ぎゅぎゅっとテック

## 詳しい要約

**テーマ：証明書の署名は「発行時に 1 回付き、接続のたびに確かめられる」**

証明書とは「この名前の公開鍵はこれ」という文書に第三者（認証局）が署名したもの。署名が付くのは発行時の 1 回だけで、確かめられるのは接続（TLS ハンドシェイク）のたび。Let's Encrypt・DNS の TXT レコード・中間証明書・期限切れの警告といったばらばらの点を「証明書の一生」という 1 本の線でつなぎ、openssl で自分が認証局になって署名・検証・破壊・失効を試す。最後に証明書の期限が 47 日へ縮む理由と自動更新が当たり前になった理由を説明する。

---

### 全体像：証明書の一生（6 段階）

1. サーバーの持ち主が鍵を作る
2. 証明書を申し込む
3. 認証局がドメインを確かめて署名する（**発行**）
4. できた証明書をサーバーに置く
5. ブラウザが接続のたびに証明書を確かめる
6. 期限切れか失効で、新しい証明書に替わる（1 に戻る）

- 「接続」は新しい暗号化の準備（TLS ハンドシェイク）のこと。1 つの接続の中でページや画像を何度取っても毎回は確かめない
- **発行は 1 回、検証は何度も**。検証は 2 段階：①証明書自体（署名が信頼されたルートにつながるか、名前、期限、失効）②接続先のサーバーがその証明書の秘密鍵を持っているか。ブラウザの警告の多くはこのどれかの失敗

### 第 1 部 証明書の中身

- 公開鍵と秘密鍵はペア（SSH 鍵と同じ考え方）。**署名** は秘密鍵で作り、対の公開鍵で誰でも確かめられる印。内容をそのままではなく **ハッシュ** にしてから署名し、検証者は受け取った内容から自分でハッシュを作って照らし合わせる
- 判子に似ているが、デジタル署名は内容ごとに変わり、他の文書に使い回せない
- Chrome DevTools の Security タブの Certificate 欄には **Subject・SAN・Valid From・Valid Until・Issuer** が出る
  - SAN（Subject Alternative Name）はこの証明書を使えるドメイン名の一覧で、複数入れられる。RFC 9525 はサーバー名を SAN だけで表すべきとしている
  - 有効期間は正式には Not Before / Not After で、両端の日も期間に含む
- RFC 5280 では証明書は **署名される本体・署名アルゴリズム・署名値** の 3 部分。本体には名前・公開鍵・有効期間・発行者が入り、発行者は本体に署名して名前と公開鍵の組み合わせを保証する
- Let's Encrypt のようにドメインの管理だけを確かめる **DV 証明書** が保証するのは名前と公開鍵の結びつきだけ。運営会社の信頼性やページの安全性は保証しない（2023 年の Chrome のブログでも、多くのフィッシングサイトが HTTPS を使っていると指摘）

### 第 2 部 署名はいつ付くのか

- サーバーの持ち主が鍵ペアを作り、秘密鍵はサーバーに残す。公開鍵だけを認証局に渡す
- 申込書は **CSR（Certificate Signing Request）**。証明書に入れたい名前と公開鍵、さらに申請者自身の秘密鍵による署名が入る（他人が自分の公開鍵で申し込むのを防ぐため）。秘密鍵は含まれない。手元で作った CSR は P-256 の鍵で「self-signature verify OK」
- 第三者の **認証局（CA）** が必要なのは、偽サイトも「これは私の公開鍵」と言えるから。CA が署名前に最も重視するのは、申請者が本当にそのドメインを管理しているか

### ACME と HTTP-01 / DNS-01

- 確認と発行を自動化する決まりが **ACME（RFC 8555）**。Let's Encrypt はこれで発行する
- **HTTP-01**：CA が渡すトークンとアカウント鍵から作った値を `/.well-known/acme-challenge/` の下に置き、CA が外からポート 80 で取りに来て一致を確認
- **DNS-01**：`_acme-challenge.www.example.com` のような TXT レコードを置く。DNS を書き換えられるのはドメインの管理者だけという理屈。自動化ではツールが DNS サービスの API で書き換える。手で置いた TXT は自動で更新されない
- 手順書どおりに置いた TXT レコードや well-known フォルダは「ドメインを管理しているのは自分」という署名前の証拠だった（1 つ目の点がつながる）
- 規則により確認は複数のネットワーク地点から行う（途中の経路が乗っ取られてもだまされにくくするため）。`*.example.com` のような **ワイルドカード証明書** は HTTP-01 では取れず DNS で確認する

### 発行と中間認証局

- CA は CSR の名前と公開鍵に、発行者名・有効期間・シリアル番号などを足して本体を作り、CA の秘密鍵で署名する。ブラウザが確かめる証明書の署名はこの 1 回だけ
- 署名するのはふつう **中間認証局**。規則でルート CA の秘密鍵で直接サーバー証明書に署名することは禁止。ルートの鍵は大事にしまっておき、中間の鍵に何かあってもルート全体を替えずに済む
- openssl でルート CA と中間 CA の 2 層を作り（デモ用の名前で、実在の CA ではない）、中間 CA の鍵で CSR に 90 日の期限で署名。サーバー証明書の **Basic Constraints** は CA:FALSE で、この鍵で他の証明書に署名しても受け入れられない

### CT（証明書の公開ログ）

- 本物の CA はドメイン確認・規則に沿った運用・発行した証明書の公開まで行う。その公開記録が **CT（Certificate Transparency）**
- 発行直前に、最終版と同じ内容の下書き（**プレ証明書**）を誰でも見られるログに出し、ログは一定期間内に載せるという署名付きの約束 **SCT** を返す。CA は SCT を入れてから最終版に署名する
- 正式文書では実験的扱いだが、Chrome などが必須にしているので実質必須。誤発行も後でログから見つけられる。Security タブの SCT はこの約束の印

### 第 3 部 署名はいつ確かめられるのか

- サーバーには **サーバー証明書・中間 CA の証明書・サーバーの秘密鍵** を置く
- TLS 1.3 では最初の応答の後、Certificate メッセージで証明書を送る。この時点で通信は鍵交換で作った鍵で暗号化済みだが、相手が本物かはまだ確かめていない
- Certificate メッセージの中は 2 枚（サーバー証明書と中間 CA の証明書）。受け手はルートを持っているので **ルートは送らない**
- ブラウザは 1 枚目の署名を 2 枚目の中間 CA の公開鍵で確かめ、2 枚目の署名は送られてきたものではなく **手元のルートの公開鍵** で確かめる。こうして手元のルートまでつながることを **証明書チェーン** という
- ルート証明書は自分で自分に署名していて、署名では確かめられない。端末に最初から入っていることが信頼の出発点。OS・ブラウザの開発者が選んで入れる（Chrome Root Store、Mozilla のリストは Firefox 以外でも使われる）。規則を守らない CA は外されたり制限されたりする。Let's Encrypt が無料でも受け入れられるのはこのリストに入っているから
- 中間証明書を入れ忘れるとエラーになり、入れると直るのは、1 枚目の署名を確かめるのに必要な中間 CA の公開鍵がブラウザに届くから（2 つ目の点がつながる）

### 壊して確かめる

| 試したこと | 結果 |
|---|---|
| 中間証明書を渡さない | unable to get local issuer certificate（実際のブラウザは以前見た中間を覚えていてつながることもあるが、サーバーが中間を送るのが正しい設定） |
| Subject の 1 文字（w→v）を書き換え | certificate signature failure（内容が変わるとハッシュが変わり署名と合わない） |
| api.example.com として検証 | hostname mismatch |
| 100 日後の時刻で検証 | certificate has expired |
| 別の CA が署名した証明書 | 発行者の証明書が見つからず失敗（社内の検証環境でよく見る警告。社内で広く使うなら独自のルートを社員の端末に配って信頼リストに入れる） |

- openssl でのブラウザ役の実験では、証明書を受け取った直後に検証が失敗し、アラートを送って接続を切った。その後のメッセージには進まない

### 証明書だけでは足りない（CertificateVerify）

- 証明書は公開情報なので偽サーバーも本物をそのまま送れる。そこで 2 段階目として、TLS 1.3 のサーバーは証明書の直後に、その接続の会話への署名を **CertificateVerify** で送る
- 証明書の公開鍵で確かめられれば、相手は対応する秘密鍵を持つ本物のサーバー。これは発行時の署名とは別の、**ハンドシェイクごとの新しい署名**。Security タブの Connection 欄の「Server Signature」はこのときの署名方式

### 失効（CRL と OCSP）

- **失効** は期限前に発行者が証明書を取り消すこと（例：秘密鍵が漏れたとき）。証明書は書き換えられないので別の手段で知らせる
- **CRL**：失効した証明書のシリアル番号の一覧に日時と署名を付けて公開する。**OCSP**：まだ有効かを毎回問い合わせる。サーバーが前もって答えを取ってハンドシェイクで一緒に渡す方法もある
- 中間 CA で keyCompromise を理由に失効させ CRL を渡すと certificate_revoked で失敗。**CRL を渡さないと同じ証明書が OK** で通る（証明書自体は何も変わっていないため）。失効は確かめに行かないと分からない
- Chrome はふつう接続時に OCSP や CRL を取りに行かず、一部の失効証明書の一覧 **CRLSet** を配って弾く。Firefox は **CRLite** で失効情報を端末に持つ
- 毎回の問い合わせは問い合わせ先にどのサイトを見ているかを知らせてしまう。Let's Encrypt はこれを理由に 2025 年に OCSP を終了し、CRL だけで失効を知らせている
- 再接続の仕組みを使うと証明書のやり取りが省かれることもある
- 警告の見分け方：期限切れなら期限、サイト名違いなら名前、自己署名なら信頼、失効なら失効。詳細設定から先へ進む前にどれに引っかかったか確かめる

### 第 4 部 なぜ期限があるのか

- 失効は確かめに行かないと効かず、ブラウザによっては一部しか弾けない。期限が来ればどのブラウザでも使えなくなる。つまり **期限は、鍵の漏えいや誤発行の被害が続く期間の上限**。短いほどその期間も短い
- Chrome の文書も、今の失効の仕組みには穴があり、短命の証明書だけにすれば多くが改善すると述べている

### 398 日から 47 日へ

- CA と ブラウザ企業が集まる **CA/Browser Forum** が 2025 年から段階的に有効期間の上限を縮める規則を可決（ブラウザが公に信頼する証明書が対象、発行日で上限が決まる）

| 時期 | 上限 |
|---|---|
| 以前 | 398 日 |
| 現在（すでに） | 200 日 |
| 2027 年 3 月〜 | 100 日 |
| 2029 年 3 月〜 | 47 日 |

- ドメイン確認の結果を使い回せる期間も縮み、最終的にはゼロになる。これは上限で、どこまで短くするかは各 CA 次第。Let's Encrypt の標準は現在 90 日で、2028 年までに 45 日にすると発表
- 45 日ごとに人手で更新するのは現実的でないので **ACME** の出番。Certbot や Kubernetes の cert-manager が期限が近づくと自分で申し込み、ドメインを確かめ直し、証明書を入れ替える
- Let's Encrypt の無料・自動更新は便利な機能以上の意味がある。自動更新が広まったから期間を短くでき、短いほど自動更新が欠かせなくなる（3 つ目の点がつながる）
- 自動化が止まると期限が切れて失敗する。ニュースで聞く期限切れによる障害は、6 から 1 へ戻れなかったということ。自分のサイトの更新が自動化されているか時々確かめるとよい

### まとめ

- **何を**：このドメインの公開鍵はこれ、という結びつき。**誰が**：第三者の認証局が署名で保証する
- **いつ署名が付く**：一生の 3 番目、発行時の 1 回だけ。その前に DNS の TXT レコードや well-known のファイルでドメイン管理を確かめる
- **いつ確かめる**：一生の 5 番目、ハンドシェイクのたび。発行者の公開鍵で署名を確かめ、OS・ブラウザに入っているルートまでたどる。中間証明書を置くのはこの信頼のチェーンをつなぐため。名前・期限・失効・秘密鍵の所持も確かめ、すべて通れば警告なしで開く
- 短い期限は鍵が漏れたときの被害を抑えるためで、それを ACME の自動更新が支えている。Chrome の Security タブで自分のサイトの発行者（Issued by）と期限（Valid until）を確かめ、期限前に自動更新が動いているか確認しよう

## Transcript

### 証明書は誰が、いつ、何を保証している？

**0:01** · When you open an HTTPS page in your browser, it usually opens without any warnings. Depending on the browser, a padlock icon may also appear in the address bar. In the background, a small piece of data called a certificate is sent and verified. So, who is guaranteeing what, and when, with this certificate? You may have heard that certificates guarantee a site's identity. But if asked to go one step further, it gets tricky. Who signed it?

**0:34** · When is that signature verified? At issuance? Upon connection? Or when it expires? Actually, you already have plenty of clues at hand. You automatically obtained a certificate using Let's Encrypt. You placed a text record in DNS as instructed by the manual. You fixed an error by bundling intermediate certificates. You saw an expiration warning and just clicked through—these are all disconnected dots. In this video, we will connect those dots into a single line.

**1:07** · Our goal is to be able to explain to a colleague in 12 minutes what a certificate is and when its signature is verified. We’ll use OpenSSL to act as a Certificate Authority, sign, verify, break, and revoke one ourselves. I'll give you the core answers first. A certificate is a document stating "this name belongs to this public key" that has been signed by a third party.

**1:36** · The signature on a certificate is applied only once, at the time of issuance. That signature is verified only when you connect. These two "whens" are the focus of today's talk. The big picture: the lifecycle of a certificate. There is a flow for a certificate from its birth until it is no longer used. If we arrange it on a timeline, it divides into six stages.

### 全体像（証明書の一生）

**2:02** · First, the server owner creates a key.

**2:05** · Second, they apply for a certificate.

**2:08** · Third, the Certificate Authority verifies the domain and signs it. This is issuance. Fourth, the completed certificate is placed on the server.

**2:18** · Fifth, the browser verifies the certificate every time it connects.

**2:23** · Sixth, it expires or is revoked, and is replaced by a new certificate. Then it goes back to the first step. " Connecting" here means the browser is preparing a new encrypted session with the server. This exchange to prepare is called the TLS handshake. Even if you request pages or images multiple times within a single connection, you don't re-verify the certificate every single time. Looking at this timeline makes it clear when the signature is applied.

**2:57** · The certificate is signed only once during the third step of issuance, and its contents cannot be changed afterward. Verification happens at the fifth step, where the same certificate is checked repeatedly with every handshake. Issued once, verified many times. This separation seems to be how the certificate mechanism works. The verification process is divided into two stages. The first stage is verifying the certificate itself, which mainly involves four points.

**3:23** · Whether the signature chain leads to a trusted root, if the names match, and if it's within the expiration date and not revoked. The second stage is whether the connected server possesses the secret for that certificate. Most browser warnings are signs that one of these checks has failed. From here, we will make things concrete to deepen our understanding. In Part 1, we read the certificate contents; in Part 2, we look at the signing issuance; and in Part 3, we look at the verification at every connection.

**3:55** · Part 4 covers expiration and renewal. Part 1: The contents of a certificate. First, let's review two terms. A public key and a private key are a pair of keys. Only the owner possesses the private key.

### 第 1 部 証明書の中身（公開鍵・署名・Security タブ）

**4:13** · You can show the public key to anyone.

**4:17** · It is the same concept as the pair you saw when creating SSH keys. You can create a signature with this pair. A signature is a mark created using a private key. Only the person with the private key can create it, but anyone with the matching public key can verify it. This signature is also used behind the scenes when logging in via SSH. A signature is not created using the contents directly, but rather by hashing them first.

**4:44** · A hash is a calculation that condenses any length of data into a short, fixed-length value, and if even one character differs, the value changes completely.

**4:57** · The verifier creates their own hash from the received contents and checks if it matches the result of the signature verified with the public key.

**5:05** · It is like a personal seal stamped on a document. You know who stamped it, and it can be verified later. However, there are also some differences. While a bank seal is the same on every document, a digital signature changes based on the content and cannot be reused on other documents. That concludes the analogy. Now, let's take a look inside a real certificate. Open the Chrome Developer Tools and select the Security tab from the list at the top.

**5:34** · When you select the origin of the open site, five items will appear under the Certificate section. They are Subject, SAN, Valid From, Until, and Issuer. On the screen, I have opened www.example.com as an example. The Subject indicates who this certificate belongs to. SAN stands for Subject Alternative Name, which is a list of domain names that can use this certificate. You can include multiple names in a single certificate.

**6:06** · RFC 9525 , which defines how to verify names, states that server names should only be represented by SAN, not names in the Subject field. Valid From and Valid Until represent the start and end of the validity period. In the official documentation, they are called Not Before and Not After, and both end dates are included in the period. The Issuer is the name of the authority that signed this certificate.

**6:34** · Although not shown in this specific field, the certificate contains two other important things. One is the server's public key, and the other is the issuer's signature. You can see everything by clicking the "Open full certificate details" button. According to the certificate standard document RFC 5280, a certificate consists of three parts.

**7:01** · These are the signed body, the signature algorithm, and the signature value. The body contains the name, public key, validity period, and issuer. By signing this body, the issuer guarantees the combination of the name and the public key.

**7:21** · Certificates like Let's Encrypt that are issued by only verifying domain control are called DV certificates.

**7:29** · What a DV certificate guarantees is the link between this name and this specific public key. It does not guarantee that the company operating the site is trustworthy or that the page content is safe. A 2023 Chrome blog post also notes that most phishing sites now use HTTPS. With that, we now understand the contents of a certificate. They are the name, public key, validity period, issuer, and the issuer's signature.

**7:58** · Next, we will look at when this signature is applied and by whom. When is the certificate signature applied? It happens in steps one through three. First, the server owner generates a pair of keys. The private key remains on the server and is never released. Only the public key is handed over to the certificate authority. Next, an application form is created. This is called a CSR, or Certificate Signing Request.

### 第 2 部 署名はいつ付くのか（鍵・CSR・認証局）

**8:30** · It contains the name you want on the certificate and the public key created earlier. The CSR also includes a signature created by the applicant using their own private key. Why sign the application as well? The protocol requires it to prevent others from applying using your public key. The signature proves that the applicant possesses the corresponding private key for that public key.

**8:58** · The applicant signs the CSR, while the certificate authority signs the certificate. I created a CSR on my end and checked its contents. The subject is www.example.com, and the public key is a 256-bit P-256 type key. The first line stated "Certificate Request Self-Signature Verify OK." This means there was a signature from the applicant themselves. The private key is not included in the CSR.

**9:31** · The entity that receives the CSR is the certificate authority. Also known as a CA, they are a third party that signs and issues certificates. Why do we need a third party? Because even if a site says, "This is my public key," a fake site could say the same. So, what does the CA check before signing? The most important thing is whether the applicant can truly control that domain .

**10:01** · For a www.example.com certificate, issuing it to someone who doesn't control that domain would make the signature meaningless. The standard that automates this verification and issuance process is ACME. Let's Encrypt issues certificates using this protocol . The verification methods in the RFC 8555 protocol are HTTP-01, which uses HTTP, and DNS-01, which uses DNS.

### ACME と HTTP-01 / DNS-01

**10:30** · With HTTP-01, the CA provides a value called a token and instructs you to place it at a specific location. The location is under the domain's well-known ACME-challenge, and the file contains a value created from a token and the applicant's account key. The Certificate Authority retrieves it from outside via port 80, and if the content matches, it confirms you are authorized to manage the domain.

**11:00** · In DNS-01, it requires you to place a text record with "acme-challenge" at the beginning.

**11:10** · For example, \_acme-challenge.www.example.com. The value is similarly created from the token. The logic is that only someone who can manage the domain can rewrite its DNS settings. When automating DNS- 01, the tool uses the DNS service's API to rewrite this text record itself.

**11:32** · If you placed the text record manually, it will not update automatically, requiring you to replace it by hand each time. This connects the first point. The text record you placed according to the manual or the well-known folder created by the tool.

**11:55** · Those were evidence to prove to the Certificate Authority that I am the one managing this domain. It was a verification of ownership before signing. Regulations set by Certificate Authorities and browser companies require this verification to be performed from multiple network locations. This is to make it harder to be deceived even if a path in between is hijacked. Also, wildcard certificates like\*.example.com cannot be obtained via HTTP-01 and must be verified via DNS.

**12:26** · Once verification is complete, the signing finally begins.

### 発行と中間認証局

**12:33** · The CA takes the name and public key from the CSR, adds the issuer's name, validity period, serial number, etc., to create the certificate body. It then signs that body with the CA's private key. This is what issuance is. The signature on the certificate that browsers verify is applied exactly once at this time. The one doing the signing is usually an intermediate Certificate Authority. Rules forbid signing server certificates directly with the private key of the top-level Root CA.

**13:04** · Generally , the root key is kept safely and rarely used, leaving routine issuance to the intermediate CA. This way, if something happens to the intermediate key, you don't have to change the entire root. I have recreated this issuance process locally. Using OpenSSL , I created two layers: a root CA and an intermediate CA beneath it. The names are Example CA and Example Issuing CA, with "demo" added to show these are for demonstration purposes.

**13:38** · They are not actual certificate authorities. I signed the CSR from earlier using the intermediate CA's private key. The expiration is set to 90 days. Opening the generated certificate, the issuer is Example Issuing CA and the subject is www.example. com. At the bottom, the intermediate CA's signature value is listed as the signature value. Inside the certificate, there is also a field called Basic Constraints.

**14:08** · For this server certificate, CA is set to no. In other words, it is not a certificate authority. Even if you sign another certificate with this certificate's key , that signature will not be accepted.

**14:24** · It means that even if you have a server certificate, you cannot issue certificates. However, real certificate authorities do more than just sign CSRs like we did with OpenSSL. They verify domains, operate according to rules, and publish issued certificates to a public record. Our experiment here has not done any of that. That public record is CT, or Certificate Transparency.

### CT（証明書の公開ログ）

**14:52** · Just before issuance, the CA takes a draft with the same content as the final version. They submit this "pre-certificate" to a log that anyone can view. The log returns a signed promise to include it within a certain timeframe. It returns an SCT. The CA then includes that SCT before signing the final certificate. The draft also has a CA signature, but the browser verifies the signature on the final certificate.

**15:21** · Although CT is treated as experimental in official documents, it is practically mandatory because browsers like Chrome require it.

**15:32** · Incorrectly issued certificates can also be found later from the logs. The SCT in the security tab is the mark of this promise. So far, we have understood the steps for adding a signature. Generate a key on the server , apply via CSR, have the CA verify the domain, submit a draft to the CT log, and then sign the final certificate once. Next is step 5 of the belt.

**15:59** · Verifying the connection. When is the third-party signature actually verified ? In step 4 of the belt, we place three items on the server. The server's certificate, the intermediate CA's certificate, and the server's private key. This is where step 5 begins. When a browser connects to a server, a TLS handshake begins. In TLS 1.3, after its initial response, the server sends a certificate in a message called " Certificate."

### 第 3 部 署名はいつ確かめられるのか

**16:30** · At this point, the communication is already encrypted.

**16:36** · However, this encryption uses a key created via key exchange, so we haven't verified if the other party is authentic yet. That is why we verify it after this. I connected an OpenSSL server and a browser client locally, and when I looked inside the Certificate message, it contained two certificates. The first one is the certificate for www.example. com. The second is the intermediate example-ising CA certificate. The root is not sent.

**17:06** · The standard states that since the receiver already holds the root, it can be omitted. Note that while the TLS 1.3 specification was updated to RFC 9846 in July 2026, this point remains unchanged. So, how does the browser verify the two certificates it received? First, it verifies the signature of the first certificate using the public key of the intermediate CA contained in the second .

**17:36** · If they match, we know the first was indeed signed by the intermediate CA and hasn't been altered since it was signed. Next, we verify the signature of the second certificate. The issuer of the second certificate is the Example CA. We use the root's public key that we have on hand, not the one that was sent. By verifying level by level with the public key of the issuer above, reaching the local root means the chain is connected. This connection is called the certificate chain.

**18:10** · The certificate of the CA that sits in the middle is the intermediate certificate.

**18:18** · The certificate at the very top that signs itself is the root certificate.

**18:23** · The root certificate cannot be verified by a signature. The fact that it is already on your device is the starting point of trust. The root certificates on your device are selected and pre-installed by the OS or browser developers. For example, Chrome has its own list called the Chrome Root Store.

**18:43** · The list chosen by Mozilla is also used by browsers other than Firefox.

**18:49** · Certificate authorities that do not follow the rules may be removed from these lists, or the acceptance of certificates they issue may be restricted. Certificate authorities are trusted because the maintainers of the list ensure they follow the rules.

**19:04** · Let's Encrypt is accepted even for free because its root is included in this list. This is where the second point connects. Forgetting to include the intermediate certificate in server settings can cause errors. It is fixed by including it because the browser receives the intermediate CA's public key needed to verify the first signature. If a link in the chain is missing, you cannot trace it back to the root. Even with OpenSSL verify on my machine, passing the intermediate makes it OK.

### 壊して確かめる（中間の欠け・書き換え・名前違い・期限切れ）

**19:36** · If you don't pass it, it fails with "unable to get local issuer certificate." Real browsers might sometimes connect because they remember intermediate certificates they've seen before. Since results can vary by environment, the correct setup is to have the server send the intermediate certificate. The next part of verification is the signature. So, I tested whether the signature really detects tampering.

**20:07** · I'll rewrite just one character of the server certificate . I changed the first 'W' in the subject "www.example.com" to 'V'.

**20:21** · Checking the rewritten certificate results in "certificate signature failure." It failed because the signature did not match. If the content changes, the hash changes, and it no longer matches the intermediate CA's signature. In other words, you cannot change the contents after issuance.

**20:39** · Next after the chain is the name. The browser compares the domain name you are trying to open with the name in the certificate. Verifying it locally as " www.example.com" is OK. Verifying the same certificate as "api.example.com" fails with "hostname mismatch." The third point is the expiration date. The browser checks if the current time is between "valid from" and "valid until."

**21:12** · This certificate is valid for 90 days.

**21:16** · If I specify a time 100 days later, it fails with "certificate has expired."

**21:23** · Even if the chain is correct, it won't pass if it's outside the validity period. A certificate signed by a separately created "other CA" also failed because it couldn't link to my root, saying the issuer certificate could not be found. This is the warning you often see in internal testing environments. If you use it extensively within your company, distribute your own root certificate to employee terminals and add it to the trusted list. Where does this verification occur during the handshake?

**21:53** · In my OpenSSL browser simulation, the verification failed immediately after receiving the certificate, sending an alert and terminating the connection.

**22:04** · Whether it's a name mismatch or an expired certificate, it doesn't proceed to the subsequent messages. A real browser displays its own specific warning on the screen. Everything up to this point is the verification of the certificate itself. But this alone is not enough. Because the certificate is public information, a fake server could also send a genuine certificate as is.

### 証明書だけでは足りない（CertificateVerify）

**22:28** · That is why there is a second layer of verification. A TLS 1.3 server sends a "Certificate Verify" message immediately after the certificate, which contains a signature of the conversation for that connection. If the browser can verify that with the public key in the certificate, the other party is the genuine server holding the corresponding private key.

**22:51** · This is different from the signature on the certificate when it was issued; it is a new signature created for every handshake. The "Server Signature" found in the Security tab under Connection details is the signature method the server used at this time. Finally, the fourth point of the first layer: revocation. Revocation means the issuer cancels a certificate before its expiration date. For example, when a server's secret key has been leaked.

### 失効（CRL と OCSP）

**23:19** · Since the certificate itself cannot be changed, you need to inform others by another means that this certificate should no longer be used. A traditional method is the CRL, a list of revoked certificates. The Certificate Authority lists the serial numbers of revoked certificates and publishes them with a timestamp and a signature. Another method is OCSP, which involves querying each time whether the certificate is still valid.

**23:46** · There is also a way where the server gets the answer in advance and provides it together during the handshake. I had the intermediate CA revoke the server's certificate and issued a CRL. The reason is " keyCompromise." Meaning the key was leaked. When I passed this CRL to verify, it failed with " certificate\_revoked." The important part is what happens next.

**24:15** · When I verified the same certificate without providing the CRL, it passed as OK.

**24:23** · This is because nothing about the certificate itself has changed.

**24:27** · Revocation cannot be known without verifying it. How actual browsers verify this differs by browser. Chrome does not usually fetch OCSP or CRL data when connecting. Instead, it distributes a list of some revoked certificates called a CRL set, and uses that to block them. Firefox uses a mechanism called CRLite to keep revocation info on the device for verification.

**24:54** · Inquiring each time would reveal which site you are visiting to the query recipient. Let's Encrypt also cited this, ending OCSP in 2025 and now using only CRL to announce revocation.

**25:13** · In summary, verification happens during a new handshake. It checks the four main certificate points and whether the server holds the private key; if not passed, it stops the connection. When using mechanisms to resume previous connections, certificate exchanges may be omitted. Warnings can also be distinguished by these two stages. If expired, it is the expiration; if the site name differs, it is the name; if self-signed, it is trust; if revoked, it is revocation.

**25:44** · Before proceeding via advanced settings, check which one was triggered. Up to this point, we have understood the verification done during connection. The first stage is the four certificate points: trust via signature ending at a local root, name, expiration via Valid From/Until, and revocation via browser methods. The second stage is Certificate Verify, which checks if the server holds the private key. If all pass, the page opens without warnings.

**26:17** · Part 4: Expiration and Renewal. Why do certificates even have expiration dates ? As we saw, revocation doesn't work unless you go to check it. Depending on the browser, only some revocations are blocked. But once the expiration date arrives, that certificate will no longer work in any browser. In short, the expiration is the limit on how long damage can continue if keys are leaked or issued incorrectly.

### 第 4 部 なぜ期限があるのか

**26:46** · The shorter the expiration, the shorter that period becomes. Chrome's documentation also notes that current revocation systems have holes, and many would improve if we only used short-lived certificates.

### 398 日から 47 日へ

**27:04** · That is why the maximum expiration period is getting shorter. The CA/ Browser Forum, where certificate authorities and browser companies gather, has passed a rule to phase in shorter validity limits starting in 2025. This applies to certificates publicly trusted by browsers, with the limit determined by the issuance date.

**27:25** · The limit has already been reduced from the previous 398 days to 200 days. It will become 100 days from March 2027, and 47 days from March 2029. The period for reusing domain validation results is also shrinking, eventually reaching zero. These are just the upper limits; how much shorter they go is up to each certificate authority. Let’s Encrypt’s standard certificates are currently 90 days, and they’ve announced a reduction to 45 days by 2028.

**27:56** · My experiment's 90-day setting was chosen to align with this. It is not practical for humans to manually renew certificates every 45 days. That is where ACME comes in. Tools like Certbot, or cert-manager for Kubernetes , apply for renewals on their own as the deadline approaches, re-validate the domain, and swap in new certificates. This is where the third dot connects.

**28:25** · The fact that Let’s Encrypt is free and automatically renewed is more than just a convenient feature. Because automatic renewal spread, we can now shorten the validity periods. The shorter the validity, the more essential automatic renewal becomes. That is why automatic renewal has become the standard. Conversely, if the automation stops, the certificate will expire and fail. Service outages caused by expired certificates that we hear about in the news mean they failed to cycle back from step 6 to step 1.

**29:00** · It’s a good idea to check from time to time that your site's renewal is automated. By now, you should understand the meaning behind deadlines and renewals. The expiration date is a limit to minimize damage if leaked, and it is supported by automatic renewal via ACME. With this, the first thread of certificates is complete. In summary , when is the signature verified?

### まとめ

**29:27** · Let’s return to the initial question.

**29:29** · Who is guaranteeing what, and when, regarding this certificate? I'll give you a moment. Try answering in your own words while recalling what you've learned. Let’s check the answers.

**29:50** · What is being guaranteed? It is the binding that says, "This is the public key for this domain." Who is doing the guaranteeing? A third-party certificate authority guarantees it with their signature. When is the signature applied? The Certificate Authority's signature on the certificate is the third item in the chain. It happens only once, at the time of issuance.

**30:12** · Before that, the CA has you place a text record in DNS or a well-known file to verify you control the domain. When is the signature verified? It's the fifth item in the chain, during the handshake. The browser verifies the signature using the issuer's public key , tracing it back to the root certificate pre-installed in the OS or browser. Placing the intermediate certificate on the server is to connect this chain of trust.

**30:40** · It checks if the name matches, if it's within the expiration date, if it's revoked, and if the server holds the private key. If everything passes, the page opens without warning; if anything fails, a warning appears. Short expiration periods limit the damage if a key is leaked, which is why automatic renewal has become standard. Try explaining these answers to your colleagues.

**31:07** · The scattered concepts of key icons, text records, intermediate certificates, and expiration warnings should now form a single, clear line. After watching, try opening your own site and checking the Security tab in Chrome. You can read the issuer under "Issued by" and the expiration under "Valid until." Also, make sure the automatic renewal is running before that expiration date arrives.

### 自分のサイトで見てみる

**31:35** · Every time an HTTPS page opens without a warning, the signature applied once at issuance is being verified in the background. Next time you open a page, remember that single issuance and the constant verifications . Please subscribe and like the video.

**31:59** · See you next time.