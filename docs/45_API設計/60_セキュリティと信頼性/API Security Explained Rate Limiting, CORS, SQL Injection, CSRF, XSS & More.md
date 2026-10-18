---
title: "API Security Explained: Rate Limiting, CORS, SQL Injection, CSRF, XSS & More"
source: "https://www.youtube.com/watch?v=FsB_nRGdeLs"
author:
  - "[[Hayk Simonyan]]"
published: 2025-08-12
created: 2026-05-17
description: "Become a senior software engineer with a job guarantee: https://go.hayksimonyan.com/133-api-security-explainedLearn 7 proven techniques to protect your APIs,..."
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=FsB_nRGdeLs)

## 詳しい要約

**テーマ：API を守る 7 つの定番手法**

API はシステムへの「扉」であり、無防備だと攻撃者がユーザーデータやシステムを好き放題にできてしまう。本動画はそれを防ぐ実証済みの 7 つの手法（レート制限・CORS・インジェクション対策・ファイアウォール・VPN・CSRF 対策・XSS）を、例を挙げて約 8 分で解説する。

---

### 1. レート制限（Rate Limiting）

- 一定時間あたりにクライアントが送れる **リクエスト数を制限** する（例: ユーザー A は 100 回まで、101 回目はブロックし時間を置かせる）
- 設定しないと、毎分数千リクエストでシステムを落とされたり、**ブルートフォース** されたりする
- 設定の単位
  - **エンドポイント単位**（例: `/comments` に厳しい上限）
  - **ユーザー／IP 単位**（IP D から 101 回目が来たらブロック）
  - **全体（overall）**: 攻撃者がボットを多数立ち上げると IP ごとの上限の合計でシステムが耐えられなくなるため、流入トラフィック全体の上限を設け、超えたら原因がわかるまで一時的に全リクエストを止める（**DDoS** 対策）
- 数値は説明用の例で、実際はもっと大きい

### 2. CORS（Cross-Origin Resource Sharing）

- **ブラウザから** どのドメインが API を呼べるかを制御する
- 適切に設定しないと、悪意あるサイトがユーザーのブラウザに代理リクエストを送らせる
- 例: フロントエンドが `app.yourdomain.com` なら、そこからのリクエストだけ許可し、`another-domain.com` などはブロック

### 3. SQL／NoSQL インジェクション

- ユーザー入力がそのまま DB クエリに入ると、攻撃者がチェックを回避してデータの読み取り・改ざん・全削除を行える
- 対策は **パラメータ化クエリ** や **ORM の安全機構** を常に使うこと

### 4. ファイアウォール

- API と外部トラフィックの間に置き、悪意あるトラフィックを通常のものから **ふるい分ける門番**
- 例: **AWS WAF** は怪しい SQL キーワードや不自然な HTTP メソッドなど既知の攻撃パターンをブロックし、それ以外は API まで通す

### 5. VPN（Virtual Private Network）

- 特定のネットワークからだけアクセスさせたい **プライベート API** 向け
- 公開 API はインターネットから誰でも使えるが、VPN 内の API は同じネットワーク内のユーザーしか到達できない
- 例: 社内管理ダッシュボードの API は、会社 VPN に接続した従業員だけが使える

### 6. CSRF（Cross-Site Request Forgery）

- ログイン中のユーザーのブラウザをだまして、意図しないリクエストを送らせる攻撃
- 例: 銀行がセッション Cookie だけで認証していると、悪意あるサイトがその Cookie を使って隠れた送金リクエストを送れる
- 対策: セッション Cookie に加えて **CSRF トークン** も照合し、一致しないリクエストはブロックする

### 7. XSS（Cross-Site Scripting）

- 他のユーザーに配信されるページに **スクリプトを注入** させる攻撃
- 例: コメント欄に「nice picture」のような通常の投稿ではなくスクリプトを仕込むと、API がそのまま DB に保存し、他のユーザーがコメント欄を開いたときにブラウザで悪意ある JavaScript が実行される（他人の Cookie の取得などを狙う）

### まとめ

- 量の攻撃にはレート制限（エンドポイント／IP／全体の組み合わせ）
- ブラウザ経由の攻撃には CORS・CSRF トークン・XSS への備え
- DB を守るパラメータ化クエリ、入口で弾く WAF、内部 API を閉じる VPN を併用する

## Transcript

### 日本語要約（詳細）

本動画は、APIを「システムへの扉」と捉え、攻撃者や不正利用から守るための**7つの実践的な防御手法**を解説する。いずれも本番APIでよく使われる定番の対策である。

#### はじめに：なぜAPIセキュリティが重要か

APIはアプリケーションの入り口である。保護が不十分だと、攻撃者がユーザーデータやシステム全体に自由にアクセスできてしまう。本動画では、そうしたリスクを抑えるための7つの手法を順に説明する。

#### 1. レート制限（Rate Limiting）

**目的**：一定時間あたりにクライアントが送れるリクエスト数を制限し、過負荷・ブルートフォース・悪用を防ぐ。

**仕組みの例**：ユーザーAに「100リクエスト／期間」と設定し、101件目以降は一時的にブロックし、クールダウン後に再開する。

**設定の粒度**（組み合わせて使うことが多い）：

| 粒度 | 説明 | 例 |
|------|------|-----|
| **エンドポイント単位** | 特定パスだけ厳しく制限 | `/comments` の作成・取得を別上限に |
| **ユーザー／IP単位** | 同一主体の連続リクエストを抑止 | IP `D` から101件目でブロック |
| **全体（グローバル）** | サーバー流入トラフィックの合計上限 | DDoS対策 |

**IP単位だけでは足りない理由**：攻撃者が多数のボットを立ち上げ、各IPがそれぞれ上限（例：100件）まで使うと、合計ではシステムが耐えられない負荷になる。そこで**全体レート制限**を設け、流入合計が閾値を超えたら一時的にすべてのリクエストを止め、原因調査の時間を確保する。

数値（100、1000など）はあくまで説明用の例であり、本番ではトラフィック規模に合わせて調整する。

#### 2. CORS（Cross-Origin Resource Sharing）

**目的**：**ブラウザから**どのオリジン（ドメイン）がAPIを呼び出せるかを制御する。

**背景**：CORSを正しく設定しないと、悪意のあるサイトがユーザーのブラウザ経由で、ログイン済みセッションなどを悪用したリクエストを送らせる可能性がある。

**設定の考え方**：

- フロントエンドが `app.yourdomain.com` のみを想定しているなら、そのオリジンからのリクエストだけを許可する。
- `another-domain.com` など許可リスト外からのリクエストはブロックし、認証やデータ取得をさせない。

CORSは**ブラウザの同一オリジンポリシー**に関する仕組みであり、サーバー間通信や curl などブラウザ外のクライアントには別の認可・認証レイヤーが必要である点に注意する。

#### 3. SQL／NoSQLインジェクション

**目的**：ユーザー入力がそのままDBクエリに埋め込まれることで、意図しない読取・改ざん・削除を防ぐ。

**攻撃のイメージ**：入力欄に `'; DROP TABLE ...` のような文字列を送り、認証チェックをバイパスしたり、全ユーザーデータの読取・削除を試みる。

**対策**：

- **パラメータ化クエリ**（プリペアドステートメント）を常に使う。
- **ORM**の安全なAPIを使い、生の文字列連結でクエリを組み立てない。

入力の「エスケープ」だけに頼らず、クエリ構造とデータを分離することが基本である。

#### 4. ファイアウォール（WAF）

**目的**：APIの手前で**悪意あるトラフィックをフィルタ**し、正常なリクエストだけを通す。

**配置**：通常、APIとインターネット側のトラフィックのあいだに置く。

**例（AWS WAF など）**：

- 疑わしいSQLキーワードを含むリクエスト
- 不自然なHTTPメソッド

といった既知の攻撃パターンをブロックし、それ以外はAPIまで到達させる。

WAFはシグネチャやルールベースの防御であり、レート制限やアプリ層の入力検証と併用する。

#### 5. VPN（Virtual Private Network）

**目的**：**社内・プライベート向けAPI**を、特定のネットワーク内のクライアントだけが使えるようにする。

**公開APIと内部APIの分離**：

- **パブリック向け**：インターネット上の一般ユーザーからアクセス可能。
- **VPN内API**：会社VPNなど同じネットワークにいる端末だけが到達できる。Web上の一般ユーザーからのリクエストはブロックされる。

**典型例**：社内管理ダッシュボード用APIは、従業員が会社VPNに接続しているときだけ利用可能にする。

ネットワーク境界での防御であり、認証・認可とは別レイヤーとして設計する。

#### 6. CSRF（Cross-Site Request Forgery）

**目的**：ログイン済みユーザーのブラウザに、**本人の意図しないリクエスト**を送らせる攻撃を防ぐ。

**攻撃シナリオ**：銀行サイトがセッションCookieのみで認証している場合、別タブで開いた悪意のあるサイトが、ユーザーのCookieを使って「送金」などのリクエストを自動送信する。

**対策**：

- セッションCookieに加え、**CSRFトークン**を要求する。
- サーバーは「Cookieが有効か」と「送信されたCSRFトークンがサーバー側の値と一致するか」の両方を検証する。
- トークンが一致しない未知のソースからのリクエストは拒否し、正当なフォーム送信のみ許可する。

SameSite Cookie、Origin／Referer チェックなども併用されることが多い。

#### 7. XSS（Cross-Site Scripting）

**目的**：攻撃者がWebページに**スクリプトを埋め込み**、他のユーザーのブラウザで実行させることを防ぐ。

**流れの例**（コメント機能）：

1. 攻撃者がコメント欄に `<script>...</script>` を投稿する。
2. APIがサニタイズせずにDBへ保存する。
3. 他ユーザーがコメント一覧を表示すると、埋め込まれたスクリプトがHTMLとして返り、ブラウザが実行する。
4. 結果として、他ユーザーのCookie取得や、さらなる改ざんなどが起こりうる。

**対策の方向性**：

- 入力時・保存時・表示時の**エスケープ／サニタイズ**（コンテキストに応じた出力エンコーディング）。
- **Content-Security-Policy（CSP）**でインラインスクリプトを制限する。
- Cookieに `HttpOnly` を付与し、JavaScriptから読めないようにする。

「nice picture」のような正常なコメントは問題なく通し、スクリプトを含む危険な入力だけを無害化または拒否する。

#### まとめ：多層防御として組み合わせる

| 手法 | 主に防ぐ脅威 |
|------|----------------|
| レート制限 | 過負荷、ブルートフォース、DDoS的な大量リクエスト |
| CORS | ブラウザ経由の不正オリジンからのアクセス |
| パラメータ化クエリ／ORM | SQL／NoSQLインジェクション |
| WAF | 既知パターンの悪意あるHTTPリクエスト |
| VPN | インターネットからの内部APIへの不正到達 |
| CSRFトークン等 | ログイン済みセッションの悪用 |
| XSS対策 | 他ユーザーへのスクリプト実行 |

単一の対策に頼らず、ネットワーク境界・アプリケーション・データ層で**重ねて守る**のが実務的なAPIセキュリティの基本である。

---

### はじめに

**0:00** · APIs are like doors into your system. If you leave them unprotected, then attackers and anyone can walk right in and do whatever they want with your user data and overall the system. That's why in today's video, we'll look at seven proven techniques which will help you to protect your APIs from unwanted attacks.

### レート制限

**0:18** · The first one we have in the list is rate limiting, which controls how many requests a client can make in a given time. For example, you can set a limit for user A to make, let's say, 100 requests per some period of time to your API. And if they cross that limit and let's say make 101 requests, then you block the next request and allow some time to pass before they can send their next request.

**0:44** · If you don't set this to your API, then attackers can overwhelm your system. they can send like thousands of requests per minute and then overwhelm your API which will take your system down or it can also brute force your data and these rate limits can be set per endpoint. For instance, let's say you have some / comments endpoint and here they can send a request to either create a comment or fetch comments. You can set that limit for endpoint level. So these comments endpoint will be set to some strict number of requests per minute.

**1:16** · You can also set it per user or IP address.

**1:22** · Let's say in A we have the IP address of first user and then B for the second C for this one and your attacker has some IP address which corresponds to D. If you get the 101 request from the D IP address then you will know that this user overused the API so you will block it at the user IP level. And there is also overall rate limiting to protect from DDOS attacks. Since you can set the rate limit to work per user or per IP address.

**1:53** · That means that this attacker alone cannot send that many requests.

**1:57** · You will block it with your rate limiting in the API. But what they can do is they can spin up some bots and each bot will have their own limit, right? Let's say you've set it to 100 per IP address. So each of these boats has 100 and overall they have more than you would allow or your system could handle. That's why you have also overall rate limitings which can be some bigger number.

**2:21** · So whenever all the traffic coming into your server reaches or passes this number then you will temporarily block all requests until you find out the root cause. And of course these numbers are just examples. So in reality it's much more than thousand but that's just an example. The second one on the list is course which stands for cross origin resource sharing.

### CORS

**2:42** · This controls which domain can call your API from a browser and without proper course malicious websites could trick users browsers into making requests on their behalf. For instance, if your API is only meant to serve your front-end app which is at app.youdomain.com yourdommain.com then only requests from this source should be allowed.

**3:06** · If anyone else sends you a request like up another domain.com then you should block this request and not allow them to use your API for authenticating or using any of its data.

**3:19** · If you'd like to learn these and other system design concepts in much more detail so that you can land senior developer roles with higher paying salaries, then you can check out the first link in the description which will be a link to my mentorship program.

**3:34** · However, this is not for beginners. So, if you're an absolute beginner or you're a computer science graduate and you're just learning the fundamentals, then this is not for you. So, you should at least have one or more years of experience as a developer, and I'll help you to get to senior roles and higher paying salaries in the program with the one-on-one mentorship. So, fill out your details there to see if you qualify. And if you do, you'll meet in a call either with myself or someone from my team and we'll help you to get to that senior developer role.

**4:04** · The third one is also a common one, which is SQL and NoSQL injections. Injection attacks can happen when the user input is directly included in the database query. For instance, attacker can modify it and send some queries to read or delete your data.

### SQLおよびNoSQLインジェクション

**4:23** · Here for example, this part bypasses the checks entirely and then attacker can use this query to start reading data from your database or modify anything or they can also delete all the data all the user data and any other tables that you have in this database. So to fix this we always use parameterized queries or OM safeguards. The next technique to use is firewalls. A firewall acts as a gatekeeper filtering the malicious traffic from the other normal traffic.

### ファイアウォール

**4:56** · So typically you have it between your API and the incoming traffic. For example, if you use the AWS's web application firewall, these can block requests with unknown attack patterns such as suspicious SQL keywords or strange HTTP methods, which means it will block any suspicious requests from attackers, but it will allow others to bypass the request and reach to your API. Some APIs are also private and should only be accessed from specific networks.

### VPN

**5:26** · That's why we have also VPNs which stands for virtual private networks. The APIs that are within the VPN network can only be accessed by someone who is also within that same network. Which means that some APIs are public facing meaning these APIs will allow any requests from the internet from your users. But this for example can be within the VPN network. Which means if a user from web tries to reach your API then this request will be blocked because the user is not within the same network.

**5:58** · But on the other hand if you have another user here which is within the VPN network they can make a request to these APIs and in this case they will bypass the checks and their request will reach to your APIs. This is useful where you have internal tools.

**6:15** · Let's say you have internal admin dashboard and the API for this admin panel will only be reachable by employees connected to the company VPN.

### CSRF

**6:24** · Next, we have CSRF, which stands for cross-sight request forgery. This tricks a logged in user's browser into making unwanted requests to the API. Let's say you as a user are logged in into your bank system and your bank system uses cookies for authentication. If the bank system is not secure and they only use session cookies, another malicious site might use your cookie and submit a hidden transferring money request through your cookie.

**6:52** · So to prevent such attacks, companies also use CSRF tokens in combination with session cookie. So the banking system will check if the session cookie is present, but it will also check if the CSRF token matches with the one that they have. And if it doesn't then it will block this request from the other unknown source while it will allow request from your behalf. And the last one we have is XSS or it's also called cross-sight scripting.

### XSS

**7:20** · This lets attackers to inject scripts into web pages served to other users. For example, if you have a comment section and this comment gets submitted to your API. Next, your API will also store it in a database. You can get normal requests like nice picture or something like that and this will get to your API.

**7:42** · Your API will store it in the database.

**7:45** · So everything is fine there. But what if an attacker places a script in this comment section and within this script they can try to do many different things. For example, they can try to fetch the cookie for another user or they can try to inject something into your database. And if you allow this then it will reach to your server and the information will be written into the database.

**8:09** · Later when the other users load this comments section on their screen, they will get also the injected comment directly into their web page and the browser will execute this malicious JavaScript code into the other users browser. These are the most common ways to attack an API and how you should protect it. If you'd like to learn all of this hands-on with a real system and with my guidance, then check out the first link in the description to apply for the mentorship.