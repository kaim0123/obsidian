---
title: "鍵を送らずに同じ鍵ができるのはなぜ？ディフィー・ヘルマン鍵交換の仕組みを計算でわかりやすく【TLS の鍵交換】【TLSシリーズ2】"
source: "https://www.youtube.com/watch?v=YpSqcq8FOtc"
author:
  - "[[ぎゅぎゅっとテック]]"
published: 2026-10-07
created: 2026-10-18
description: "「ITの仕組み入門」シリーズの、TLS の回に出てきた「鍵交換」を 1 本に広げた回です。TLS の回を見ていなくても分かるように作っています。鍵交換の説明でよく見る「秘密A ＋ 公開B ＝ 共有秘密」の図。この「＋」は本当に足し算なのでしょうか。この動画では、ディフィー・ヘルマン鍵交換を 5 と 23 という小さな数で実際に計算し、鍵そのものを一度も送らないのに 2 人が同じ数を持てる理"
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=YpSqcq8FOtc)

「ITの仕組み入門」シリーズの、TLS の回に出てきた「鍵交換」を 1 本に広げた回です。TLS の回を見ていなくても分かるように作っています。  
  
鍵交換の説明でよく見る「秘密A ＋ 公開B ＝ 共有秘密」の図。この「＋」は本当に足し算なのでしょうか。  
  
この動画では、ディフィー・ヘルマン鍵交換を 5 と 23 という小さな数で実際に計算し、鍵そのものを一度も送らないのに 2 人が同じ数を持てる理由を確かめます。途中で、あなたにも盗聴者になってもらいます。通り道に流れる値をすべて見ても、共通の数は分かるでしょうか。  
  
後半は、手元で取った TLS 1.3 の通信の記録と Chrome の画面で、key\_share・supported\_groups・X25519MLKEM768 が今日の計算のどこに当たるかを見ます。最後に、RFC 7919・7748・5246・8446 の 4 つの文書を読み、中間者攻撃と前方秘匿性まで話します。  
  
▼ こんな人向け  
・TLS の回で鍵交換が出てきたが、なぜ同じ鍵ができるのかまでは分からなかった  
・鍵交換の図や key\_share、X25519MLKEM768 を見たことはあるが、計算から理解したい  
  
▼ チャプター  
0:00 「＋」は足し算？  
1:24 全体像（ブラウザ・サーバー・盗聴者）  
2:07 第 1 部 絵の具で考える  
3:25 第 2 部 割り算の余りと累乗で計算してみる  
7:05 第 3 部 盗聴者になってみる  
11:53 2 人の側では同じ 512 桁（離散対数問題）  
12:45 もし片方の秘密が漏れたら  
14:15 第 4 部 本物（X25519・TLS 1.3 の記録・Chrome）  
18:58 第 5 部 決まりの文書（RFC 7919 / 7748 / 5246 / 8446）  
23:30 第 6 部 弱点と組み合わせ（中間者攻撃・前方秘匿性）  
26:32 まとめ  
27:25 自分の言葉で説明してみる  
28:31 X25519MLKEM768 を見かけたら  
  
▼ 関連動画  
・TLSのしくみ：https://www.youtube.com/watch?v=INN1c5DWVys  
・HTTPS の証明書：https://www.youtube.com/watch?v=qarVh9XAFiU  
  
▼ 再生リスト「ITの仕組み入門｜しくみを図解でゼロから」  
https://youtube.com/playlist?list=PLXlTlS8raBns&si=5LyXZszBmRe7F\_NC  
  
  
▼ 参考にした資料  
・W. Diffie, M. Hellman "New Directions in Cryptography"（1976）  
・RFC 7919 Negotiated Finite Field Diffie-Hellman Ephemeral Parameters for TLS  
・RFC 7748 Elliptic Curves for Security  
・RFC 5246 The Transport Layer Security (TLS) Protocol Version 1.2  
・RFC 8446 The Transport Layer Security (TLS) Protocol Version 1.3  
　※ RFC 8446 は 2026 年 7 月に RFC 9846 へ改訂されています  
・IANA TLS Supported Groups  
  
動画中の総当たりの速さや通信の記録は、手元の Mac（127.0.0.1）で実行した結果です。  
  
#ディフィーヘルマン #TLS #暗号 #鍵交換 #ITの仕組み入門  
#ぎゅぎゅテク  
#ぎゅぎゅっとテック

## 詳しい要約

**テーマ：ディフィー・ヘルマン鍵交換の「＋」の正体を計算で確かめる**

鍵交換の図でよく見る「秘密A ＋ 公開B ＝ 共有秘密」の「＋」は足し算ではなく、「受け取った値に自分の秘密の回数だけ同じ計算を繰り返す」操作である。5 と 23 という小さな数での計算、盗聴者の立場での総当たり、本物の X25519・TLS 1.3 の通信記録・Chrome の表示、関連する RFC を通して、2 人が同じ数を持てる理由と、盗聴者に分からない理由、鍵交換だけでは足りない点（中間者攻撃）と前方秘匿性を説明する。

---

### 導入と全体像

- AES-128-GCM などの共通鍵暗号は両者が同じ鍵を持たないと使えないが、最初の挨拶は暗号化前なので途中で見られる。鍵をそのまま送ると見ている人にも渡る
- そこで使うのが **ディフィー・ヘルマン鍵交換**（1976 年の Diffie と Hellman の論文）。鍵そのものを送らずに 2 人が同じ数を持てる
- 登場人物はブラウザ・サーバー・**盗聴者**。盗聴者は通り道の値をすべて見られるが、ここでは書き換えはしないと仮定する。秘密の数も最終的な共通の数も送られない

### 第 1 部 絵の具で考える

- みんなが知っている色に自分の秘密の色を混ぜて渡し、受け取った色にまた自分の色を混ぜると、混ぜる順番が違っても同じ色になる
- 混ぜるのは簡単で戻すのは難しいので、盗聴者は同じ色を作れない
- たとえの限界：本物の絵の具は色見本と比べれば近い色が分かる。実際に使うのは数の計算

### 第 2 部 割り算の余りと累乗で計算する

- 使う計算は 2 つ：**割り算の余り（MOD）**（25 MOD 23 = 2）と **累乗**（5 を 6 回掛けると 15,625、23 で割った余りは 8）
- 掛けるたびに余りに置き換えても最終的な余りは変わらない（23 で割り切れる部分に何を掛けても割り切れるから）。5→2→10→4→20→8
- 鍵交換：共通の数は起点 5 と割る数 23。ブラウザの秘密 6、サーバーの秘密 15
  1. ブラウザ：5 を 6 回掛けて 23 で割った余り → **8**
  2. サーバー：5 を 15 回掛けて 23 で割った余り → **19**
  3. 8 と 19 を送り合う
  4. ブラウザ：19 を 6 回掛けた余り → **2**、サーバー：8 を 15 回掛けた余り → **2**
- 一致する理由：どちらも結局 5 を 6×15 = **90 回** 掛けて 23 で割っている。まとまり方が違っても合計回数は同じ
- 割る数 23 は **素数**。本物の鍵交換ではこの素数をとても大きくする

### 第 3 部 盗聴者になってみる

- 見える値は 5、23、ブラウザの 11、サーバーの 21（秘密は第 2 部と別）
- 足し算（11+21 → 余り 9）や掛け算（11×21 → 余り 1）はもっともらしい数が出るが根拠がなく、どちらも外れ
- 1 回ずつ試すと 9 回目で 11 になり、21 を 9 回掛けた余り **17** が正解の共通の数
- 余りを取らなければ値の大きさから回数を推測できるが、余りを取ると値が飛び回るので大きさから分からない。小さな数なら総当たりできるので本物は大きな数を使う
- 本番：割る数を **RFC 7919 の FFDHE2048**（2048 ビット＝16 進で 512 桁）、起点を 2 にすると、手がかりすらない
- Python で 3 秒間総当たりすると約 1,465 万回（毎秒約 488 万回）試せたが見つからない。秘密を 256 ビットとすると全部試すのに **10 の 62 乗兆年**（宇宙の年齢は約 138 億年）
- 実際にはもっと速い解き方が知られているが、それでも FFDHE2048 は 2 の 103 乗の手間とされ（RFC 7919 の値）、今のコンピューターでは現実的な時間で解けない

### 2 人の側では同じ 512 桁（離散対数問題）

- 2 人は 1 回ずつ掛けるのではなく、2 乗・4 乗・8 乗…と **2 乗を繰り返す近道** を使うので、256 ビットの秘密でも数百回の掛け算で済む。逆算する側にはこの近道がない
- 送られた値から秘密の回数を取り出す問題を **離散対数問題** という。これが解ければこの鍵交換は破れる
- 解けないことが安全の証明になるわけではないが、秘密の数を見つけずに共通の数を出す方法も見つかっていない

### もし片方の秘密が漏れたら

- ブラウザの秘密 9 だけが漏れても、見えている 21 を 9 回掛ければ共通の数 17 が出る
- 大きな数でも、秘密が漏れれば 2 人と同じ近道で約 2.3 ミリ秒で計算できた
- この仕組みは **秘密が漏れないこと** が前提。だから本物の鍵交換では接続ごとに秘密を作り、終わったら捨てる

### 第 4 部 本物（X25519・TLS 1.3 の記録・Chrome）

- **X25519** は楕円曲線を使う。曲線上の点には足し方が決まっていて、固定の起点を秘密の回数だけ **足す**。足した結果から回数を求める方法は知られていない。短い値で同じ強さが出るので秘密も公開値も **32 バイト**
- Python の cryptography ライブラリ（中は OpenSSL）で試すと両者の 32 バイトの値が一致（True）。相手から受け取った値の確認などが必要なので、実際には自作しない。TLS ではこの共通の数を鍵導出関数に通して AES の鍵を作る
- TLS 1.3 の通信記録：ClientHello の **supported_groups** は使える鍵交換の種類の一覧（好み順）。その下の **key_share** に X25519 と 32 バイトの値（小さな数の 8 に当たる）。ServerHello の key_share の 32 バイトが 19 に当たる。FFDHE2048 に限定すると値は 256 バイト（X25519 の 8 倍）
- Chrome の Security タブに出る **X25519MLKEM768** は X25519 と **ML-KEM-768** の組み合わせ。KEM は DH とは別の仕組みで、将来の大規模な量子計算機に備えたもの（RFC 7748 も量子計算機ができれば X25519 は破れると書いている）。今記録された通信が後で解読されないよう今から備え、片方が破れてももう片方が守る。ブラウザが送る値は 1216 バイトで、最後の 32 バイトが X25519 の公開鍵

### 第 5 部 決まりの文書（RFC）

| RFC | 内容 |
|---|---|
| RFC 7919 | 有限体 DH 用の大きな素数の組に名前を付ける（FFDHE2048〜8192、起点はすべて 2）。1.2 ではサーバーが素数を選んで送っていたが、ブラウザは正しい素数かすぐ確かめられなかったため。素数は自然対数の底 e の桁から作り、都合のよい数を選んでいないことを示す |
| RFC 7748 | 楕円曲線 X25519（32 バイト）と X448（56 バイト）の計算と入出力の形式、検証用の値 |
| RFC 5246 | TLS 1.2。今の 1.2 は主に楕円曲線の **ECDHE** を使い、5 と 23 型の DHE は推奨されない。DHE ではサーバーが ServerKeyExchange で素数 dh_p・生成元 dh_g・公開鍵 dh_Ys を送り、ブラウザが ClientKeyExchange で dh_Yc を送る。素数自体が毎回流れ、2 往復かかる |
| RFC 8446 | TLS 1.3（2026 年 7 月に RFC 9846 へ改訂、要点は同じ）。素数や生成元は送らず FFDHE2048 や X25519 などの名前で指す。最初の挨拶に種類の一覧と key_share（名前と公開鍵の組）を入れ、1 往復で材料がそろう。予想が外れると **HelloRetryRequest** で 1 往復増える。公開鍵による鍵交換は使い捨て方式だけになった |

### 第 6 部 弱点と組み合わせ

- 値を書き換えられる者が、ブラウザにはサーバーのふり、サーバーにはブラウザのふりをして別々に鍵交換すると、両方と別の共通の数を持ち、復号・再暗号化しても気づかれない（**中間者攻撃**）
- 鍵交換は同じ数を共有する方法であって、相手が誰かを確かめる方法ではない。だから TLS は **証明書と署名** を組み合わせる。サーバーが交換内容に証明書の秘密鍵で署名し、ブラウザが証明書の公開鍵で確かめる。1.2 の記録でも DHE のパラメータの直後に署名があった
- もう 1 つの組み合わせが **使い捨て（ephemeral）**。ECDHE・DHE の最後の E はこの意味
- 使い捨てにより **前方秘匿性（forward secrecy）** が得られる：後で証明書の秘密鍵が盗まれても、共通の数を作った秘密は捨てられているので、記録された過去の通信は読めない。ただし実装が実際に秘密を捨てていることが条件で、再接続用のチケットの扱いは別の話
- 1.2 までは、ブラウザが鍵の元をサーバーの公開鍵で暗号化して送る方式もあり、記録した通信と後で盗んだ秘密鍵で過去の通信を復号できた（実験で確認）。この方式は 1.3 で削除された

### まとめ

- 「＋」は足し算ではなく、受け取った値に自分の秘密の回数だけ同じ計算を繰り返す操作。小さな数では掛け算と余り、X25519 では楕円曲線上の点の足し算
- 2 人が同じ数になるのは、15 のまとまりを 6 回でも 6 のまとまりを 15 回でも合計 90 回で同じだから。大きな数では送られた値から回数を逆算する方法が知られていないので他人には分からない
- 前提は秘密が漏れないこと。だから接続ごとに作って捨てる
- 鍵交換だけでは相手が本物か分からないので、TLS は証明書と署名で確かめる。秘密を毎回捨てるので、後で証明書の秘密が盗まれても古い通信は読めない

## Transcript

### 「＋」は足し算？

**0:00** · You often see diagrams like this when key exchange is explained. Combining the browser's secret A and the server's public B allows both to arrive at the same shared secret. But is this plus sign in the middle really addition? If it were, it seems someone watching could calculate it too. This mechanism is needed when we want to encrypt communication.

**0:24** · Ciphers like AES-128-GCM , which appear in Chrome's security tab , can't be used unless both sides have the same key. However, the initial handshake happens before encryption is active, so it can be seen in transit.

**0:41** · If you send the key as is, anyone watching could also obtain it. That is where the Diffie-Hellman key exchange is used. It was presented in a paper by Diffie and Hellman in 1976. It's a way for two people to hold the same number without ever sending the key itself.

**1:01** · The keys seen in Wireshark or those like X25519 and ML-KEM-768 in Chrome are linked to this mechanism. In this video, you will calculate how both sides arrive at the same number and determine what the "plus" in the first diagram actually means. Along the way, I will have you play the role of an eavesdropper. First, here is the big picture. There are three participants involved.

### 全体像（ブラウザ・サーバー・盗聴者）

**1:28** · The browser, the server, and the eavesdropper watching the communication on the path between them.

**1:36** · The eavesdropper can see every value that flows along that path. However, we assume here that they only watch and do not alter the data. The two parties only send numbers over the path that are safe to be seen. The secret numbers never leave their hands, and the final shared number is not sent either. We will deepen our understanding by moving through paint, calculation, eavesdropping, the real thing, standard documents, and vulnerabilities. Part 1: Let's think about this using paint.

### 第 1 部 絵の具で考える

**2:11** · First, we decide on a color that everyone knows. Both parties prepare their own secret color. They mix their secret color into the agreed-upon color and send only the mixed result to the other. The recipient then mixes their own secret color into what they received. Both sides will eventually arrive at the same color, containing the initial color and both secret colors. This works because even if the mixing order differs, the resulting mixture is the same. All an eavesdropper can see is the color after mixing.

**2:42** · Mixing is easy, but it’s hard to extract the original colors from the mixture. That’s why an eavesdropper cannot create the same color as the two of them. However, this analogy has its limits. With real paint, you could compare it to a color chart to find a similar hue. And we don’t know specifically what happens when mixing inside a computer. What is actually used is mathematical calculation.

**3:08** · So far, we’ve learned that if there is an operation that is easy to mix but hard to reverse, only the two parties can share the same secret. Next, we will replace that operation with numerical calculation. Part 2: Let's calculate. We only use two types of calculations. The first is the remainder of a division. When 25 is divided by 23, the remainder is 2; the remainder of any division will be a number from 0 to 22.

### 第 2 部 割り算の余りと累乗で計算してみる

**3:40** · The calculation to find the remainder is written as MOD.

**3:45** · So, 25 MOD 23 is 2. The second is exponentiation. This is multiplying the same number multiple times; starting from 1, multiplying 5 six times equals 15,625. This is called 5 to the 6th power, and in this video, we call it multiplying 5 six times. Since 15,625 is 23 times 679 plus 8, the remainder when divided by 23 is 8.

**4:10** · Dividing large numbers is difficult, but there is a shortcut for this calculation. You can replace the result with the remainder each time you multiply. 5x5 is 25, remainder 2; 2x5 is 10; 10x5 is 50, remainder 4; 4x5 is 20; 20x5 is 100, remainder 8. It’s 8, just like before .

**4:37** · You can replace it because no matter what you multiply by the part divisible by 23, it remains divisible by 23. The only part that affects the final remainder is the remainder itself. Now, let’s perform the key exchange. First , we decide on two numbers that everyone knows. The starting number 5 and the divisor 23. The browser chooses 6 as its secret number, and the server chooses 15. These numbers, 6 and 15, are never sent to anyone.

**5:07** · The browser multiplies 5 six times and finds the remainder when divided by 23. As calculated earlier, it is 8. The server calculates 5 to the 15th power, divided by 23, and outputs the remainder. 5 to the 15th is an 11-digit number, but the remainder is 19. These values, 8 and 19 , are sent across the path to each other. The browser takes the received 19, multiplies it by its secret 6 times , and finds the remainder divided by 23 . The answer is 2.

**5:39** · The server takes the received 8, multiplies it 15 times, and finds the remainder. This result is also 2. Neither the secret 6 and 15, nor the shared number 2, have ever been sent. So why do they arrive at the same number? The 19 the browser received was the remainder of 5 to the 15th power.

**6:01** · Since it multiplied that by 6, it effectively multiplied 5 to the 15th power 6 times, meaning 6 times 15, or 90 multiplications. The server multiplied 5 to the 6th power by itself 15 times. 15 times 6 is also 90 multiplications. Since replacing values with remainders along the way doesn't change the final result, both parties were calculating 5 to the 90th power divided by 23. The true nature of the plus sign in the initial diagram is becoming clear.

**6:33** · I will introduce one term here. The divisor 23 is a number that can only be divided by 1 and itself. In real key exchanges, this prime number is made very large. We now understand why both parties can arrive at the same number. Even if the grouping differs, the total number of multiplications is 6 times 15, which is the same. What remains is the question of whether it is truly safe if seen along the path. Let's become the eavesdropper in Part 3.

### 第 3 部 盗聴者になってみる

**7:06** · From here on, you are the eavesdropper. This time, the two parties are using secret numbers different from those in Part 2.

**7:17** · You know all the rules. Take the starting point, multiply it by a secret number of times, and send the remainder divided by the divisor. The only things you don't know are the two parties ' secret numbers. There are four values visible on the path. The starting point 5, the divisor 23, the 11 sent by the browser, and the 21 sent by the server.

**7:40** · So, what is the shared number that they both possess? Pause the video and try to think about it. Let's start with a

**7:59** · common guessing method: since there was a plus in the diagram, let's try adding them. 11 + 21 is 32, and divided by 23 the remainder is 9, but there's no clue to verify if this is really the shared number. How about trying multiplication ? 11 × 21 is 231, and the remainder divided by 23 is 1. This also produces a plausible number, but it has no basis . We will check the answer later. Next is the most naive approach.

**8:32** · It's a method of trying every candidate one by one. 5 multiplied once is 5, twice is 2 , and three times is 14, 28, 17, 16...

**8:45** · Continuing on, the 9th time it becomes 11, the same 11 the browser sent. In this example, 9 was found, which acts the same as the browser's secret count.

**8:57** · If you multiply the 21 the server sent by 9 and divide by 23, the remainder is 17. When checking the answer, the shared number for the two was indeed 17 . The addition (9) and multiplication ( 1) were wrong, but this worked. Why is there no choice but to try it this painstakingly? If you don't take the remainder, 5 gets larger with each multiplication, so you can estimate the count from its size.

**9:22** · However, when you take the remainder, it jumps around like 5, 2, 1, 4, 2, 8......so you can't tell the count from the magnitude because the values skip around. Even so , if the numbers are small, you can try them all, so the real one uses very large numbers. Now, the real performance begins. The rules are the same, but we change the divisor to a prime number called FFDH2048 from the RFC7919 standard document.

**9:51** · It's a 2048- bit number, which is 512 digits in hexadecimal, and the starting point is 2. The browser's value and the server's value that were sent are both 512 digits long. What you see on the screen is only the beginning and the end. Try it just like we did before. You shouldn't even have a clue where to start.

**10:16** · With addition or multiplication, there's no way to verify if you hit the target. All that remains is this. I ran a program on my Python setup for just 3 seconds that multiplies 2 one by one and compares it to the browser's value.

**10:38** · It was able to try about 14.65 million times, roughly 4.88 million times per second. Even then, it wasn't found.

**10:48** · Let's estimate how long it would take to try them all at this speed. In this experiment, I set the secret number to 256 bits for the sake of explanation.

**10:58** · If you try all 2 to the power of 256 candidates, it will take 10 to the power of 62 trillion years. The age of the universe is about 13.8 billion years, on the order of 10 to the 10th power years. Of course, the speed of Python is not the speed of an attacker.

**11:16** · In reality, much faster ways to solve this than just trying every value are known. Even estimated with those faster methods, FFDHE2048 is said to require 2 to the 103rd power in effort. This is a value from RFC7919, and while it varies by person, current computers cannot solve it in a realistic timeframe. The loop on the screen is still running right now. But there is no prospect of it finishing.

**11:45** · As an eavesdropper, you remain unable to know the two parties' common number until the end. On the other hand, for the two parties, the 512-digit numbers that appeared were exactly the same from beginning to end.

### 2 人の側では同じ 512 桁（離散対数問題）

**12:00** · Moreover, the two of them did not multiply one by one. They use a shortcut of squaring repeatedly—2 nd power, 4th power, 8th power—so even with a 256-bit secret, it only takes a few hundred multiplications. The side trying to reverse the result to find the count does not have this shortcut.

**12:18** · This is the true nature of why it is easy to mix but difficult to unmix.

**12:24** · This problem of retrieving the secret count from the sent value is called the discrete logarithm problem. If this can be solved, this key exchange is broken.

**12:34** · However, there is no proof that it is secure just because it cannot be solved . On the other hand, no method has been found to derive the common number without finding the secret number. So, what happens if one party's secret leaks? Let's go back to small numbers.

### もし片方の秘密が漏れたら

**12:53** · Suppose that in the previous example, only the browser's secret of 9 fell into the eavesdropper's hands. They do not know the server's secret. The eavesdropper takes the 21 they saw on the path, multiplies it 9 times, and divides by 23 to find the result. The answer is 17. Even without doing that, the two parties 'common number came out just like that. Let's try it with larger numbers as well. This is the communication we estimated would take 10 to the 62nd power years if tried one by one earlier.

**13:23** · If the browser's secret has leaked, you can use the same shortcut as the two parties and calculate it in one line of Python. The time taken was about 2.3 milliseconds.

**13:34** · The 512-digit number that appeared was the same as the two parties' common number. In other words, this mechanism is predicated on the secret numbers not being leaked. That is why, in real key exchange, we generate a secret number for each connection and discard it when done. This is to ensure that even if it leaks, the damage is limited to that one time and no secrets remain to be stolen later. I will summarize what this "disposable" approach protects in the next section.

**14:00** · So far, we have learned why the eavesdropper cannot figure out the common number and why the whole thing is exposed if one person's secret leaks. Next, we will run an actual key exchange. Part 4: Let's run the real thing. The key exchange often used in modern TLS is called X25519. It uses a different type of calculation called elliptic curves.

### 第 4 部 本物（X25519・TLS 1.3 の記録・Chrome）

**14:30** · A curve is a collection of points that satisfy a certain equation, and there is a defined way to add these points together. In X25519, we add a fixed starting point to itself a secret number of times. Instead of multiplying a number a secret number of times, we add a point a secret number of times.

**14:49** · The structure is the same as it was with the small numbers. Even with point addition, there is no known way to determine how many times it was added based on the result. Furthermore, since it provides the same strength with shorter values, 32 bytes are sufficient for both secret and public values. We will run it in Python. I used the " cryptography" library, which is powered by OpenSSL under the hood. In practice, we don't write this from scratch ourselves. This is because it requires standard checks, such as verifying the values received from the other party.

**15:22** · In the first two lines, the two parties each create a 32-byte secret number. I created them from fixed values to ensure the results match, but in reality, they are created from random numbers each time. The 32-byte values created in the next two lines correspond to numbers like 8 and 19.

**15:39** · These are called public keys, which are values that can be shown to anyone. In the exchange line, a common number is calculated from the other party's public key and your own secret number.

**15:51** · The 32-byte values calculated by both parties were exactly the same, and the result of the comparison was True. In TLS, this common number is passed through a key derivation function to create an AES key. Next is a record of the communication. I set up a server on my Mac, connected via TLS 1.3 using the OpenSSL tool, and dumped the contents of the handshake. If you have ever opened a Client Hello in Wireshark, you should see the same names listed there.

**16:25** · The Client Hello's supported groups include X25519 and FFDHE2048. It is a list of available key exchange types, ordered by preference. Modern browsers rarely offer FFDHE. I included it here manually for comparison. The key below it contains the name X25519 and a 32- byte value. This is the browser's public key, corresponding to 8 in our smaller numbers.

**16:56** · The server's response, Server Hello, also has a key share containing a 32-byte value. This corresponds to 19. If I limit it to FFDHE2048 for testing, the key value becomes 256, which is eight times the size of X25519. That is 512 digits in hexadecimal. A value the same size as the one from Part 3 was flowing through this connection. Lastly, let's look at Chrome.

**17:30** · In the DevTools security panel, the Key Exchange field may show X25519MLKEM768. It is a long name, but it simply combines the two methods: X25519 and ML-KEM-768. KEM is a different mechanism from Diffie-Hellman .

**17:52** · Known as a KEM, it uses a disposable public key and was created for future large-scale quantum computers; RFC 7748 also states X25519 can be broken if such a computer is built. The same applies to Diffie-Hellman using numbers like 5 and 23. Large quantum computers do not exist yet, but we prepare now so that captured traffic cannot be decrypted later.

**18:21** · It is a layered approach where if one is broken, the other still protects it. The value sent by the browser is 1216 bytes, and the final 32 bytes are the X25519 public key, making the total shared value 64 bytes by combining the two. Now we understand where "supported groups X25519MLKEM768" fits into today's calculations.

**18:50** · Next, we will read the documents that define these names and transmission methods. In Part 5, we will read through the official rule documents. Internet standards are written in numbered documents called RFCs. Four of them are relevant to today's topic. RFC 7919, which defines the sets of numbers. RFC 7748, which defines the curve calculations. RFC 5246 and 8446, which define the transmission methods.

### 第 5 部 決まりの文書（RFC 7919 / 7748 / 5246 / 8446）

**19:23** · Note that RFC 8446 was updated to RFC 9846 in July 2026, but the core points remain the same. RFC 5246 is considered deprecated , but TLS 1.2 messages are read using 5246. The first one is RFC 7919.

**19:44** · It assigns names to sets of large prime numbers to use Diffie-Hellman, the same type as 23, in TLS. FFDHE ranges from 2048 to 8192; the number is the prime's bit length, and the starting point is 2 for all. Why name them? In TLS 1.2, servers used to choose and send the prime and starting point themselves.

**20:17** · Browsers had no quick way to verify if the prime was valid, so they had no choice but to disconnect if they were suspicious. So, they named fixed sets to allow for choosing by name. The primes are generated from the digits of the natural logarithm base, e. This is to prove that no "convenient" numbers were chosen behind the scenes. When I configured FFDHE2048 on my server and connected via TLS 1.2, the prime sent was exactly the FFDHE2048 prime.

**20:48** · The second is RFC 7748. It defines calculations for elliptic curves X25519 and X448, along with their input and output formats. X25519 is 32 bytes, X448 is 56, and the 32-byte key from earlier follows this format. It also includes test values for verifying calculations. The third is RFC 5246.

**21:24** · This is TLS 1.2. First, I should note that modern TLS 1.2 primarily uses elliptic curves. It is ECDHE, which uses the EC initials for Elliptic Curve . The use of DHE, like the one in 5 and 23, is discouraged. I connected using DHE here just to see how the mechanism works. The server sends the prime DHp, the generator DHg, and its public key DHys in the Server Key Exchange.

**21:53** · In my logs, they were 256 bytes each, with 1 byte for 2256. The browser sends its own public key DHyc of 256 bytes in the Client Key Exchange. In TLS 1.2 DHE, the prime number itself flows through the connection every time. And it takes a round trip to finish the handshake.

**22:24** · The fourth is RFC 8446. This is TLS 1.3 . Primes and generators are not sent; they are referred to by names like FFDHE2048 or X25519. The browser includes a list of supported types in the initial handshake and adds a name/ public key pair in the key share. If the server picks one and returns its public key, the necessary materials are gathered in one round trip.

**22:51** · If the browser's guess is wrong and the server doesn't have the desired public key type, it requests a retry with a HelloRetryRequest, adding one extra round trip. Also, in TLS 1.3, key exchange using public keys is now limited to ephemeral methods only. I will explain what this "ephemeral" nature means in Part 6. So far, we have covered the changes in how data is sent . In TLS 1.2 DHE, you had to send the prime numbers, taking two round trips.

**23:25** · In TLS 1.3, you just specify the name, taking only one round trip. Part 6: Weaknesses and combinations. In Part 3, the eavesdropper could only watch. But what if there is someone who can rewrite the values in transit? That person would claim to be the server to the browser. They would then claim to be the browser to the server and perform a key exchange with each.

### 第 6 部 弱点と組み合わせ（中間者攻撃・前方秘匿性）

**23:50** · This allows them to share separate common numbers with both the browser and the server. By decrypting and reading the message from the browser and re-encrypting it for the server, both ends remain unaware. This type of attack where someone intercepts the connection is called a Man-in-the-Middle attack. Key exchange is a method for sharing the same number , not a way to verify who the other party is. That is why TLS combines certificates and signatures.

**24:20** · The server signs the exchange contents with its certificate's private key, and the browser verifies it with the certificate's public key. A man-in-the-middle attacker does not possess the private key of a certificate issued by a trusted authority for that site name. Therefore , they cannot create a signature that passes the browser's verification. A signature is a mark that can only be created by someone who holds that secret. Even in the TLS 1.2 record I have here, there was a signature immediately following the DHE params.

**24:53** · The mechanics of certificates will be covered in another episode. Another combination is the use of ephemeral keys. You create a new secret number for every connection and discard it when finished. In English, this is called "ephemeral," meaning temporary.

**25:10** · The final 'E' in the common terms ECDHE and DHE stands for this "ephemeral."

**25:17** · Using ephemeral keys provides a property called "forward secrecy." This is a property where past communications remain protected even if the server's long-term private key, the certificate's secret, is stolen later.

**25:31** · Because the certificate's secret is used only for signatures and the secret numbers used to create the common number are discarded, the common number cannot be recreated even if the communication was recorded. However, this is only true if the implementation actually discards the ephemeral secrets . How tickets for resuming connections quickly are handled is a separate matter. Up until TLS 1.2, there was also a method where the browser encrypted the secret—the basis for the key—with the server's public key.

**26:05** · With this method, if you have recorded traffic and later steal the server's secret, you can decrypt past communications. I was actually able to decrypt them in my own experiments.

**26:16** · This method was removed in TLS 1.3. So far, we've learned that key exchange alone cannot verify the identity of the other party. And we've seen how TLS combines certificates, signatures, and ephemeral secrets. Here is a summary.

### まとめ

**26:34** · Let's return to the first diagram.

**26:37** · Secret A plus Secret B. This "plus" was not simple addition. It is an operation of repeatedly applying the same calculation to the value received from the other party as many times as your secret number. With small numbers, it's a calculation involving multiplication and remainders. In X25519, it was a calculation of adding points on an elliptic curve. The two parties arrive at the same number because a block of 15 repeated 6 times is the same as a block of 6 repeated 15 times, both resulting in 90.

**27:07** · It remains hidden from others because, with large numbers, there is no known way to reverse the calculation and find the secret count from the sent value. And the premise is that the secret numbers must not be leaked. That is why secrets are created for each connection and then discarded.

### 自分の言葉で説明してみる

**27:27** · One last thing: how would you explain Diffie-Hellman if a colleague asked you what it is? Pause the video and try saying it in your own words. For example, you could say this. Both parties know the same starting point and each decides on their own secret count.

**27:53** · They exchange the value of the starting point calculated that many times, then apply their own count to the received value again. Since the total number of times the operation is applied is the same for both, they arrive at the same number. Because the numbers are large, there is no known way for an observer to reverse the count. However, since you don't know if the other party is genuine, TLS uses certificates and signatures to verify them.

**28:19** · Since secrets are discarded each time, even if the certificate secret is stolen later, old communications cannot be read. If you can say all that, you have successfully explained it. Next time you see X25519ML768 in Chrome, please remember this. The ML-KEM inside it is wrapped in an ephemeral public key to be sent. Here is another mechanism.

### X25519MLKEM768 を見かけたら

**28:44** · And in the X25519 part, using the same concept as today, both parties end up with the same number without ever sending the key itself.

**28:58** · Please subscribe and like the video.

**29:02** · See you next time.