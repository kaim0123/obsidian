---
title: ネットワーク機器への管理アクセス（パスワード・SSH・ファイル転送）
created: 2026-10-18
tags:
  - インフラ
  - サーバーセキュリティ
  - ネットワーク
---

# ネットワーク機器への管理アクセス（パスワード・SSH・ファイル転送）

[[MOC_サーバー・インフラ体系|📚 目次]] ｜ [[05_ログ監査と侵入の検知|← 前へ]] ｜ [[07_AAA（RADIUS・TACACS+・802.1X）|次へ →]]

> [!abstract] この記事で分かること
> - ルータ・スイッチを管理する方法（コンソール・Telnet/SSH・HTTP/HTTPS・クラウド管理）と暗号化の有無
> - IOS のログインの入口（コンソール・vty・特権EXEC）と、password / secret の違い
> - 最小文字数・`login block-for`・`exec-timeout`・特権レベルによるアクセス保護
> - IOS での SSH の設定手順と確認方法
> - TFTP / FTP / SCP / SFTP の違いと、`copy` コマンドによる設定・イメージのコピー
>
> **前提**：[[01_サーバーセキュリティの基本]] と [[02_SSHの安全な運用]] を読んでいると理解しやすいです。

ルータやスイッチ自体が乗っ取られると、ACLもVPNもすべて書き換えられてしまいます。このノートでは「機器にログインする入口」をどう守るかを、IOSの設定コマンドとともに学びます。サーバー（Linux）側の SSH の運用は [[02_SSHの安全な運用]]、SSH そのものの仕組みは [[SSHの仕組み]] を参照してください。

## 1. 管理方法の種類

ネットワーク機器（スイッチ、ルータ、AP、WLC）を設定・監視する方法には、次のものがあります。

| 方法 | 接続方法 | 暗号化 | 特徴 |
|---|---|---|---|
| **コンソール** | 機器のコンソールポートにケーブルを**直接**つなぐ | ―（直接接続） | 初期設定や障害時に使う。**1台ずつ、その場で**作業する必要がある |
| **Telnet** | ネットワーク経由でCLIにログイン（TCP 23） | **されない**（平文） | パスワードなども平文で流れる |
| **SSH** | ネットワーク経由でCLIにログイン（TCP 22） | **される** | Telnetの代わりに使う |
| **HTTP** | Webブラウザで管理画面（GUI）へ（TCP 80） | **されない** | ログイン情報を盗聴される恐れ |
| **HTTPS** | Webブラウザで管理画面へ（TCP 443） | **される**（TLS） | GUI管理の推奨方式 |
| **クラウド管理** | 機器がインターネット経由でクラウドに接続し、**ダッシュボード**から一括管理（例：**Cisco Meraki**） | される | 各拠点のスイッチやAPの設定・監視をまとめて行える |

管理者の**認証**には、機器に登録した**ローカルのユーザー**や、**TACACS+ / RADIUS の AAA サーバ**を使います。

関連して、混同しやすいもの：

- **TFTP**：ファイルを転送するプロトコル（UDP 69）。設定ファイルやIOSイメージのコピーに使うが、**機器の管理方法ではない**。
- **SNMP**：機器の監視に使うプロトコル。**SNMPv1/v2c はコミュニティ名が平文**で送られる。SNMPv3 は認証・暗号化に対応。

### 1.1 暗号化の有無で整理

| 用途 | 暗号化されない | 暗号化される |
|---|---|---|
| CLI（リモート） | Telnet | **SSH** |
| GUI（Web） | HTTP | **HTTPS** |
| 監視 | SNMPv1 / v2c | SNMPv3（authPriv） |

### 1.2 HTTPSによるWeb管理の設定

```
SW1(config)# ip http secure-server          ← HTTPS（TLS）を有効化
SW1(config)# no ip http server              ← 暗号化されないHTTPは無効化
SW1(config)# ip http authentication local   ← ローカルユーザーで認証
SW1(config)# username admin privilege 15 secret Cisco123!
```

```
SW1# show ip http server status
HTTP server status: Disabled
HTTP server port: 80
...
HTTP secure server status: Enabled
HTTP secure server port: 443
```

### 1.3 クラウド管理

クラウド管理（Cisco Meraki など）では、機器は**インターネット経由でクラウドに接続し、設定を受け取ります**。管理者はWebブラウザでクラウドのダッシュボードにログインし、**各拠点のスイッチやAPをまとめて**設定・監視できます。拠点にIT担当者がいなくても、機器をつなぐだけで設定が反映される（ゼロタッチプロビジョニング）のが利点です。一方、管理はインターネット接続とクラウドサービスに依存します。

## 2. IOSのモードとログインの入口

```
                     コンソールケーブル（物理）        ネットワーク経由（Telnet/SSH）
                            │                                 │
                       line con 0                      line vty 0 4（0〜15）
                            │  ← password + login / login local で認証
                            v                                 v
                  ┌──────────────────────────────────────────────┐
                  │ ユーザーEXECモード   Router>     （特権レベル1）  │
                  └──────────────────────────────────────────────┘
                            │ enable  ← enable secret（または enable password）で認証
                            v
                  ┌──────────────────────────────────────────────┐
                  │ 特権EXECモード      Router#     （特権レベル15） │
                  └──────────────────────────────────────────────┘
                            │ configure terminal
                            v
                  グローバル設定モード  Router(config)#
```

守るべき入口は次の3つです。

| 入口 | 設定場所 | 用途 |
|---|---|---|
| コンソール | `line con 0` | ケーブルで機器に直接接続する（IPアドレス不要） |
| vty（仮想端末） | `line vty 0 4`（機種により `0 15`） | Telnet/SSHでネットワーク経由で接続する |
| 特権EXECモード | `enable secret` | `enable` で設定変更ができるモードに入る |

## 3. ラインのパスワード：password と login

ラインにパスワードを設定するには、`password` と `login` の**両方**が必要です。`password` だけでは「パスワードを持っている」だけで、確認は行われません。`login` を設定して初めてパスワードが要求されます。

```
Router(config)# line con 0
Router(config-line)# password cisco123
Router(config-line)# login
Router(config-line)# exit
```

コンソール接続時の動作:

```
User Access Verification

Password:          ← 入力した文字は表示されない
Router>
```

コンソールにパスワードを設定する正しい手順は `line con 0 → password cisco123 → login` です。

- `line vty 0 4 → password ... → login` は**リモート接続用**のラインで、コンソールには影響しない。
- `enable secret` は**特権EXECモード**に入るときのパスワードで、コンソールに接続した時点では要求されない。
- `username admin secret ...` はローカルユーザーを作るだけで、ラインに `login local` を設定しないと使われない。

### ユーザー名とパスワードで認証する（login local）

```
Router(config)# username admin secret Cisco!2026
Router(config)# line con 0
Router(config-line)# login local          ← ローカルユーザーのデータベースで認証
Router(config-line)# line vty 0 4
Router(config-line)# login local
```

```
User Access Verification

Username: admin
Password:
Router>
```

| ラインの設定 | 認証の方法 |
|---|---|
| `login` | そのラインの `password` で認証（ユーザー名なし） |
| `login local` | `username` で作成したローカルユーザーで認証 |
| （AAA使用時）`login authentication ...` / default | AAAの方法リストで認証（[[07_AAA（RADIUS・TACACS+・802.1X）]]） |

## 4. password と secret（平文・タイプ7・ハッシュ）

IOSのパスワード保存方式は「**password＝平文（またはタイプ7）、secret＝ハッシュ**」と覚えます。

| コマンド | 保存形式 | 安全性 |
|---|---|---|
| `enable password XXX` | 平文（タイプ0） | 低い。`show running-config` でそのまま見える |
| `enable secret XXX` | ハッシュ（タイプ5＝MD5、8＝PBKDF2-SHA256、9＝scrypt） | 高い。復元が困難 |
| `username U password XXX` | 平文（タイプ0） | 低い |
| `username U secret XXX` | ハッシュ（タイプ5/8/9） | 高い |
| `line ... password XXX` | 平文（タイプ0） | 低い |
| 上記の平文 ＋ `service password-encryption` | タイプ7 | 低い（簡単に復号できる） |

### enable password と enable secret の両方を設定した場合

```
Router(config)# enable password cisco
Router(config)# enable secret Str0ng!Pass
```

このとき `enable` で使えるのは **enable secret の方だけ**です。enable secret が存在すると enable password は無視されます。両方を順番に入力する仕組みも、どちらでも入れる仕組みもありません。実務では enable secret だけを使います。

```
Router# show running-config | include enable
enable secret 9 $9$8hG7bW2yQ0n7yE$Zk0p...（ハッシュ値）
enable password cisco          ← 平文で見えてしまう（しかも使われない）
```

### service password-encryption

```
Router(config)# service password-encryption
```

設定ファイル内の**平文のパスワード**（line の password、enable password、username ... password）を、**弱い方式（タイプ7）**で暗号化して表示するコマンドです。

```
! 実行前
line vty 0 4
 password cisco123
! 実行後
line vty 0 4
 password 7 0822455D0A16544541
```

- 目的は「**肩越しにのぞかれても読めない**」程度。タイプ7は解読ツールで簡単に元に戻せる。
- **通信は暗号化しない**（通信の暗号化はSSHやVPN）。
- ログインの動作は変わらない。
- 強い保護が必要なら `enable secret` や `username ... secret` を使う。

ローカルユーザーのパスワードをハッシュで保存するのは `username admin secret Cisco!2026`。`username admin password ...` は平文で保存され、service password-encryption を使っても弱いタイプ7になるだけです。

```
Router# show running-config | include username
username admin secret 9 $9$nhEmQVczB7dqsO$X.HsgL6x1il0RxkOSSvyQYwucySCt7qFm4v7pqCxkKM
```

## 5. パスワードの最小文字数：security passwords min-length

```
Router(config)# security passwords min-length 10
Router(config)# enable secret short
% Password too short - must be at least 10 characters. Password configuration failed
```

- グローバル設定のコマンド。
- **これ以降に設定する**パスワード（enable secret、username、line の password など）に適用される。
- すでに設定されている短いパスワードは**自動では変わらない**ので、設定し直す必要がある。

誤答の確認:

- `service password-encryption` … 表示を隠すだけで長さは制限しない。
- `enable secret 10` … 特権EXECモードのパスワードを「10」にしてしまう。
- `exec-timeout 10 0` … 10分無操作で切断する line の設定。

## 6. ブルートフォース対策：login block-for

```
Router(config)# login block-for 120 attempts 3 within 60
```

読み方:

```
login block-for 120   attempts 3   within 60
                 │            │           │
                 │            │           └─ 失敗を数える期間（秒）：60秒以内に
                 │            └──────────── 失敗回数：3回失敗したら
                 └───────────────────────── 禁止する時間（秒）：120秒間ログインを受け付けない
```

「60秒以内に3回失敗したら、その後120秒間ログインを受け付けない」は `login block-for 120 attempts 3 within 60` です。数字の位置を逆にした `login block-for 60 attempts 3 within 120` は誤り。

- グローバル設定のコマンド。総当たり攻撃（ブルートフォース）の速度を大きく落とせる。
- ブロック中（quiet mode）は**管理者もログインできなくなる**。そこで、管理用PCのアドレスだけはブロックの対象外にする `login quiet-mode access-class` を組み合わせることがある。

```
Router(config)# access-list 5 permit 192.168.100.0 0.0.0.255
Router(config)# login quiet-mode access-class 5
Router# show login
     A login delay of 1 seconds is applied.
     Quiet-Mode access list 5 is applied.
     Router enabled to watch for login Attacks.
     If more than 3 login failures occur in 60 seconds or less,
     logins will be disabled for 120 seconds.
```

## 7. 無操作セッションの自動切断：exec-timeout

```
Router(config)# line con 0
Router(config-line)# exec-timeout 5 0      ← 5分0秒
Router(config)# line vty 0 4
Router(config-line)# exec-timeout 5 0
```

| 設定 | 意味 |
|---|---|
| `exec-timeout 5 0` | 5分（「**分 秒**」の順） |
| `exec-timeout 0 5` | 5**秒**（順番を間違えた例） |
| `exec-timeout 0 0` | タイムアウト無効（切断しない）。本番では非推奨 |
| （未設定） | デフォルトは**10分** |

- line（`line con 0`、`line vty 0 4`）の中で設定する。
- ログインしたまま放置された画面を他人に操作される危険を防ぐ。
- 検証環境では `0 0` にすることもあるが、本番環境では避ける。
- `login block-for` はログイン**失敗**による制限で、無操作セッションの切断とは別物。

## 8. 特権レベル（0〜15）

| レベル | 内容 |
|---|---|
| 0 | `logout`、`enable`、`disable`、`exit`、`help` など、ごく一部のコマンドのみ |
| 1 | **ユーザーEXECモード**（`Router>`）。確認用の一部のコマンドだけ使える |
| 2〜14 | **カスタマイズ用**。管理者が使えるコマンドを割り当てて使う |
| 15 | **特権EXECモード**（`Router#`）。すべてのコマンドを実行できる。`enable` で入るレベル |

特権EXECモードの特権レベルは **15** です。

```
Router(config)# username operator privilege 5 secret Op3rator!Pass
Router(config)# privilege exec level 5 show running-config
Router# show privilege
Current privilege level is 15
```

ユーザーごとに特権レベルを割り当てると、「オペレーターには確認用のコマンドだけを許可する」といった制御ができます。これは**認可（何をしてよいか）**の一種です。より細かく、多数の機器で一元的に制御したい場合は、**AAAの認可（TACACS+など）**を使います（[[07_AAA（RADIUS・TACACS+・802.1X）]]）。

## 9. SSHの設定（Telnetを使わない理由）

**TelnetではなくSSHを使う主な理由は、通信内容が暗号化されるため**です。Telnetはパスワードを含むすべての通信を**平文**で送るので、盗聴されるとユーザー名やパスワードがそのまま読まれてしまいます。

```
Telnet（TCP 23）:  PC ── "admin" "cisco123" "show run" ──> ルータ   ← 盗聴すれば丸見え
SSH   （TCP 22）:  PC ── "x9#Fq0...暗号文..." ────────────> ルータ   ← 読めない
```

| 誤った理由 | 正しくは |
|---|---|
| 通信速度が速い | 速度は理由ではない。暗号化処理の分むしろわずかに負荷が増える |
| 設定が不要 | 逆。ホスト名・ドメイン名・RSA鍵などの設定が必要 |
| IPアドレスがなくても接続できる | SSHもTelnetもIPで通信する。IPなしで接続するならコンソールケーブル |

### SSHの設定手順

```
Router(config)# hostname R1                          ! ① ホスト名（デフォルトの Router では鍵を作れない）
R1(config)# ip domain-name example.com               ! ② ドメイン名（①②から鍵の名前が決まる）
R1(config)# crypto key generate rsa modulus 2048     ! ③ RSA鍵の生成（SSHv2には768ビット以上）
R1(config)# ip ssh version 2                         ! ④ SSHv2を使う（推奨）
R1(config)# username admin secret Cisco!2026         ! ⑤ ローカルユーザーの作成
R1(config)# line vty 0 4
R1(config-line)# login local                         ! ⑥ ローカルユーザーで認証
R1(config-line)# transport input ssh                 ! ⑦ vtyへの接続をSSHだけに（Telnetを禁止）
R1(config-line)# exec-timeout 5 0
```

確認:

```
R1# show ip ssh
SSH Enabled - version 2.0
Authentication methods:publickey,keyboard-interactive,password
Authentication timeout: 120 secs; Authentication retries: 3
...
R1# show ssh
Connection Version Mode Encryption  Hmac         State           Username
0          2.0     IN   aes256-ctr  hmac-sha2-256 Session started admin
```

さらに、vtyへの接続元を管理用ネットワークに限定するには `access-class` を使います（[[08_ACL（アクセスコントロールリスト）]] の「vtyへのACL適用：access-class」）。

### SSHとTelnet

ネットワーク機器をリモートから管理するには、TelnetかSSHを使います。

| 項目 | Telnet | SSH |
|---|---|---|
| ポート | TCP 23 | TCP 22 |
| 暗号化 | **なし**（パスワードもコマンドも平文） | **あり** |
| 推奨 | 使わない | 使う（SSHv2） |

### SSHの設定手順（各コマンドの意味）

```
R1(config)# hostname R1                                  ! ① 初期値の Router 以外にする
R1(config)# ip domain-name example.com                   ! ② ドメイン名
R1(config)# crypto key generate rsa modulus 2048         ! ③ RSA鍵の作成
The name for the keys will be: R1.example.com
% The key modulus size is 2048 bits
% Generating 2048 bit RSA keys, keys will be non-exportable...[OK]
R1(config)# username admin secret Str0ngPass!            ! ④ ローカルユーザー
R1(config)# ip ssh version 2                             ! ⑥ SSHv2に限定（推奨）
R1(config)# line vty 0 4
R1(config-line)# login local                             ! ⑤ ローカルユーザーで認証
R1(config-line)# transport input ssh                     ! ⑤ SSHだけ許可（Telnet禁止）
```

| 手順 | コマンド | なぜ必要か |
|---|---|---|
| ① | `hostname` | RSA鍵の名前が「ホスト名.ドメイン名」で作られるため、初期値の Router のままでは鍵を作れない |
| ② | `ip domain-name` | 同上。鍵の名前にドメイン名が必要 |
| ③ | `crypto key generate rsa` | SSHの暗号化に使うRSA鍵を作成する。**鍵を作るとSSHが有効になる**。SSHv2には **768ビット以上**（推奨は2048ビット）が必要 |
| ④ | `username ... secret ...` | ログインに使うローカルユーザーを作成 |
| ⑤ | `line vty 0 4` → `login local`、`transport input ssh` | VTYでローカルユーザー認証を使い、接続方式をSSHだけにする |
| ⑥ | `ip ssh version 2` | 脆弱性のあるSSHv1を使わせず、SSHv2だけを受け付ける（グローバル設定） |

**SSHの有効化に関係ないコマンド**

- `ip http server`: Webブラウザで機器を管理するためのHTTPサーバを有効にする。SSHとは無関係。
- `service password-encryption`: 設定ファイル内のパスワードを簡易的に暗号化（タイプ7）して表示する。推奨される設定だが、SSHの有効化には不要。

**似たコマンドの役割の違い**

| コマンド | モード | 役割 |
|---|---|---|
| `ip ssh version 2` | グローバル設定 | SSHの **バージョン** をv2に限定 |
| `transport input ssh` | line vty | 接続 **方式** をSSHだけにする（Telnetを禁止）。バージョンは指定しない |
| `crypto key generate rsa` | グローバル設定 | RSA鍵の作成。バージョンを固定するものではない |
| `ip domain-name` | グローバル設定 | ドメイン名の設定。RSA鍵の作成に必要 |

### SSHの確認

```
R1# show ip ssh
SSH Enabled - version 2.0
Authentication methods:publickey,keyboard-interactive,password
Authentication timeout: 120 secs; Authentication retries: 3
```

| 表示 | 意味 |
|---|---|
| `SSH Enabled - version 2.0` | SSHv2だけを受け付ける（`ip ssh version 2` 設定済み） |
| `SSH Enabled - version 1.99` | **v1とv2の両方** を受け付ける状態（既定。v1.99は「v1互換のv2」の意味） |
| `SSH Disabled - version 1.99` | RSA鍵がなくSSHが無効 |

接続中のSSHセッションは `show ssh` で確認できます。

### （参考）スイッチでのSSHの設定

```
SW1(config)# hostname SW1
SW1(config)# ip domain-name example.com
SW1(config)# crypto key generate rsa modulus 2048
SW1(config)# ip ssh version 2
SW1(config)# username admin secret Cisco123!
SW1(config)# line vty 0 15
SW1(config-line)# login local
SW1(config-line)# transport input ssh       ← Telnetを禁止しSSHのみ許可
```

## 10. ファイル転送プロトコルの比較

| プロトコル | トランスポート/ポート | 認証 | 暗号化 | 特徴・用途 |
|---|---|---|---|---|
| **TFTP** | **UDP 69** | **なし** | なし | 機能が少なく軽い。IOSイメージや設定ファイルのコピーによく使われる。ディレクトリ一覧などの機能はない |
| **FTP** | **TCP 20/21** | ユーザー名・パスワード | **なし**（パスワードも平文） | 制御用とデータ用の2つのコネクション |
| **SCP** | TCP 22（SSH上） | あり | **あり** | SSHの仕組みで認証・暗号化しながらコピー |
| **SFTP** | TCP 22（SSH上） | あり | **あり** | SSH上のファイル転送。ディレクトリ操作も可能 |
| HTTP | TCP 80 | （任意） | なし | Web閲覧。ファイル取得もできるが安全ではない |
| HTTPS | TCP 443 | （任意） | あり | |

**安全性で整理すると**

```
 TFTP  ── 認証なし・暗号化なし   （信頼できるネットワーク内に限る）
 FTP   ── 認証あり・暗号化なし   （パスワードが盗聴されうる）
 SCP / SFTP ── 認証あり・暗号化あり（推奨）
```

TFTPは認証も暗号化もないので、使う場所は **信頼できるネットワーク内に限ります**。

## 11. FTPの2つのコネクション

FTPは **制御用** と **データ転送用** の2つのコネクションを使います。

| コネクション | ポート | 用途 |
|---|---|---|
| 制御用 | **サーバのTCP 21**（常に） | ログイン、コマンドのやり取り（ls、get、put など） |
| データ用（アクティブモード） | **サーバのTCP 20** から クライアントへ | ファイルの中身やディレクトリ一覧の転送 |
| データ用（パッシブモード） | クライアントから **サーバが指定したポート** へ | 同上 |

```
 アクティブモード                              パッシブモード
 クライアント           サーバ                  クライアント           サーバ
     |--- 制御 → TCP 21 -->|                      |--- 制御 → TCP 21 -->|
     |   PORT (待ち受けポート通知)                 |   PASV            |
     |<-- データ TCP 20 から接続 ---|              |<-- 「ポート5xxxxへ」-|
     |   (サーバ→クライアント方向に                |--- データ → 5xxxx -->|
     |    接続されるのでFWで止まりやすい)           | (どちらもクライアントから接続
                                                  |  するのでFWを越えやすい)
```

## 12. Cisco IOSでのファイルのコピー

`copy` コマンドは **`copy <コピー元> <コピー先>`** の順に書きます。

| コマンド | 動作 |
|---|---|
| `copy running-config tftp` | 現在の設定（RAM）をTFTPサーバへ **バックアップ**。実行後にサーバのアドレスとファイル名を聞かれる |
| `copy tftp running-config` | TFTPサーバのファイルを現在の設定に **読み込む（マージする）**（コピー元とコピー先が逆） |
| `copy running-config startup-config` | 現在の設定を **NVRAM** に保存（再起動後も設定が残る） |
| `show running-config` | 現在の設定を画面に表示するだけで、保存はしない |
| `copy tftp flash:` | TFTPサーバからIOSイメージなどをフラッシュへコピー |
| `copy scp: flash:` | **SCP** で暗号化しながらフラッシュへコピー |
| `copy flash: ftp:` | FTPサーバへコピー |

```
R1# copy running-config tftp
Address or name of remote host []? 10.1.1.50
Destination filename [r1-confg]? R1-backup.cfg
!!
1530 bytes copied in 0.420 secs (3643 bytes/sec)
```

```
R1# copy scp: flash:
Address or name of remote host []? 10.1.1.60
Source username [admin]?
Source filename []? c2900-universalk9-mz.SPA.157-3.M8.bin
Destination filename [c2900-universalk9-mz.SPA.157-3.M8.bin]?
Password:
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
```

**running-config と startup-config**

| 名前 | 場所 | 内容 |
|---|---|---|
| running-config | RAM | 現在動作中の設定。設定変更は即座にここへ反映される。**再起動で消える** |
| startup-config | NVRAM | 起動時に読み込まれる設定 |

設定を変更したら `copy running-config startup-config` で保存しないと、再起動で消えてしまいます。

## 13. 機器のアクセス保護 チェックリスト

```
hostname R1
security passwords min-length 10                 ! 最小文字数
enable secret <強いパスワード>                     ! secret を使う（password は使わない）
service password-encryption                      ! 平文で残るものをタイプ7で隠す（補助）
username admin privilege 15 secret <強いパスワード>
login block-for 120 attempts 3 within 60         ! 総当たり対策
ip domain-name example.com
crypto key generate rsa modulus 2048
ip ssh version 2
access-list 10 permit 192.168.100.0 0.0.0.255    ! 管理用ネットワーク
!
line con 0
 login local
 exec-timeout 5 0
line vty 0 4
 access-class 10 in                              ! 接続元の制限
 login local
 transport input ssh                             ! SSHのみ
 exec-timeout 5 0
```

## ひっかけポイント・よくある誤解

### パスワード・ログインの保護

- **SSHを使う理由は速度でも設定の簡単さでもなく「暗号化」**。SSHはむしろ設定が必要（hostname、ip domain-name、RSA鍵、ユーザー、transport input ssh）。
- **enable password と enable secret の両方がある場合、使えるのは secret だけ**。「どちらでも」「両方を順番に」は誤り。
- **service password-encryption は通信を暗号化しない**し、**強力でもない**（タイプ7は簡単に復号可能）。
- **`password` だけでは認証されない**。`login` が必要。`username` を作っても `login local` がないと使われない。
- vty の設定はコンソールに影響しない。enable secret はコンソール接続時点では要求されない。
- `username ... password` は平文。ハッシュにしたいなら `username ... secret`。
- `security passwords min-length` は**既存の**パスワードを変えない。
- `login block-for X attempts Y within Z`：X＝禁止時間、Z＝失敗を数える期間。**数字の位置**に注意。
- `exec-timeout` は「**分 秒**」の順。`0 5` は5秒、`0 0` は無効。デフォルトは10分。
- 特権EXECは15。1はユーザーEXEC、0はごく一部のみ、2〜14はカスタマイズ用。

### 管理方法（コンソール・HTTP/HTTPS など）

- **コンソール接続は1台ずつ、その場で作業する**方法で、一括管理ではありません。
- **Telnetは1台ずつCLIにログインする方法で、通信は暗号化されません。** Webブラウザでは使いません。
- **TFTPはファイル転送のプロトコル**で、機器の管理方法ではありません。
- **HTTP（`ip http server`）は暗号化されない**ため、ログイン情報を盗聴される恐れがあります。暗号化するのは **HTTPS（`ip http secure-server`）**。
- **SNMPv1は監視用のプロトコルで、コミュニティ名が平文**で送られます。

### SSH・ファイル転送

- **TFTP＝UDP 69・認証なし**。「TCP 20/21・ユーザー名とパスワードで認証」はFTP。暗号化するのはSFTP/SCP（TFTPもFTPも暗号化しない）。Web閲覧はHTTP/HTTPS。
- **バックアップは `copy running-config tftp`**（コピー元→コピー先）。`copy tftp running-config` は逆向きでマージ。`copy running-config startup-config` はNVRAMへの保存、`show running-config` は表示のみ。
- **SSHに必要なのは `ip domain-name` と `crypto key generate rsa`**（ホスト名とユーザーは別途）。`ip http server`、`service password-encryption` はSSHの有効化に不要。
- **SSHv2だけを許可するのは `ip ssh version 2`**（グローバル設定）。`transport input ssh` は接続方式（Telnet禁止）、`crypto key generate rsa` は鍵の作成、`ip domain-name` はドメイン名。
- **FTPの制御はTCP 21**。20はアクティブモードのデータ用。UDP 69はTFTP、TCP 22はSSH（SFTP・SCPも22）。
- **暗号化して安全にコピーするならSCP**。TFTPは認証も暗号化もなし、FTPはパスワードも平文、HTTPも暗号化されない。

## 押さえておくポイント

### パスワード・ログインの保護

- password＝平文/タイプ7、secret＝ハッシュ（5/8/9）。enable も username も secret を使う。
- ラインは `password` ＋ `login`、またはローカルユーザー ＋ `login local`。
- SSHの必須設定：hostname、ip domain-name、crypto key generate rsa、ローカルユーザー、`transport input ssh`。
- `security passwords min-length`、`login block-for`、`exec-timeout` の書式と意味。
- 特権レベル15＝特権EXEC、1＝ユーザーEXEC。

### 管理方法

- 管理方法：コンソール（直接）、Telnet/SSH（CLI）、HTTP/HTTPS（GUI）、クラウド管理（Meraki）。
- 暗号化なし：Telnet、HTTP。暗号化あり：SSH、HTTPS。
- HTTPSは `ip http secure-server`。HTTPは `no ip http server` で無効化。
- 管理者認証：ローカルユーザー、または TACACS+/RADIUS（AAA）。

### SSH・ファイル転送

- SSHの設定：hostname → ip domain-name → crypto key generate rsa（SSHv2は768ビット以上）→ username → line vty（login local、transport input ssh）→ ip ssh version 2。
- `show ip ssh`：version 2.0＝v2のみ、1.99＝v1/v2両対応。
- TFTP（UDP 69、認証・暗号化なし）／FTP（TCP 20/21、認証あり・暗号化なし）／SCP・SFTP（TCP 22、認証・暗号化あり）。
- FTPは制御21・データ20（アクティブ）。パッシブはクライアントから接続するのでFWを越えやすい。
- `copy <元> <先>`。running（RAM）→ startup（NVRAM）で保存。

## 関連ノート

- [[02_SSHの安全な運用]] — サーバー（Linux）側の SSH の安全な設定と運用
- [[SSHの仕組み]] — SSH の暗号化と認証の仕組み
- [[07_AAA（RADIUS・TACACS+・802.1X）]] — 管理者の認証を AAA サーバで一元管理する
- [[08_ACL（アクセスコントロールリスト）]] — vty への接続元を `access-class` で制限する
- [[04_HTTPSとTLS証明書]] — HTTPS（TLS）の仕組み
- [[03_MFAの方式比較]] — 認証の3要素とパスワードポリシー
- [[01_サーバーセキュリティの基本]] — 多層防御の全体像
