# IPサービス 解説

- **分野**: IPサービス（`ip-services`）
- **出題比率**: 10%（CCNA 200-301 v1.1）
- **収録問題数**: 52問（is-001 〜 is-052）
- **範囲**: NAT/PAT、DHCP、DNS、NTP、SNMP、Syslog、QoS、SSH、ファイル転送（TFTP/FTP/SCP）

この解説書は、問題を1問ずつ並べるのではなく、トピックごとに「仕組み → 設定 → 確認 → ひっかけ」の順で整理しています。各章の最後に「関連問題」として問題IDを載せているので、読み終えたら該当する問題を解いて理解を確かめてください。巻末には全問の「問題別クイックリファレンス」があります。

---

## 目次

1. [IPサービスの全体像とポート番号](#1-ipサービスの全体像とポート番号)
2. [DHCP](#2-dhcp)
3. [DNS](#3-dns)
4. [NAT / PAT](#4-nat--pat)
5. [NTP](#5-ntp)
6. [SNMP](#6-snmp)
7. [Syslog](#7-syslog)
8. [QoS](#8-qos)
9. [SSHとファイル転送（TFTP / FTP / SCP）](#9-sshとファイル転送tftp--ftp--scp)
10. [問題別クイックリファレンス](#10-問題別クイックリファレンス)

### 学習の順序について

章の並びは、次の考え方で決めています。

1. まず各サービスが使う **ポート番号とTCP/UDP** の全体像をつかむ（以降のすべての章の土台）。
2. 端末がネットワークに参加するときに最初に使う **DHCP**（アドレスをもらう）→ **DNS**（名前を調べる）→ **NAT**（インターネットへ出る）。
3. ネットワークを運用・管理するための **NTP**（時刻）→ **SNMP**（監視）→ **Syslog**（ログ）。NTPとSyslogは「ログの時刻」で密接に関係します。
4. 混雑時の通信品質を守る **QoS**。
5. 機器の安全な管理と保守のための **SSH** と **ファイル転送**。

---

## 1. IPサービスの全体像とポート番号

### 1.1 なぜポート番号を覚える必要があるのか

IPアドレスは「どの機器か」を表し、ポート番号は「その機器の中のどのアプリケーション（サービス）か」を表します。ACLやファイアウォールで通信を許可・拒否するとき、パケットキャプチャを読むとき、障害の切り分けをするときには、「このサービスはTCPかUDPか、何番か」を即答できる必要があります。

試験では「プロトコルとポート番号の組み合わせ」を問う問題が頻出で、**不正解の選択肢は、たいてい“別のプロトコルの正しいポート番号”** になっています（例：「Telnet ― 25」の25はSMTP）。そのため、1つずつ単独で覚えるのではなく、一覧で整理して「この番号はこのプロトコル」と双方向に言えるようにしておくのが効果的です。

### 1.2 TCPとUDPの使い分け

| 項目 | TCP | UDP |
|---|---|---|
| 接続 | コネクション型（3ウェイハンドシェイクで接続を確立） | コネクションレス型（いきなり送る） |
| 信頼性 | 再送・順序制御・フロー制御あり | なし（必要ならアプリ側で対処） |
| オーバーヘッド | 大きい | 小さい（軽い） |
| 向いている用途 | 確実に届けたいもの（SSH、FTP、HTTP） | 軽さ・速さ優先、少量の問い合わせ、ブロードキャスト（DHCP、DNS問い合わせ、NTP、SNMP、Syslog、TFTP） |

IPサービスの多くがUDPを使うのは、次の理由からです。

- **DHCP**: クライアントはまだIPアドレスを持たず、サーバの場所も知らないため、TCPの接続（3ウェイハンドシェイク）を確立できない。ブロードキャストで送る必要もある（TCPはブロードキャストを扱えない）。
- **DNS**: 1回の問い合わせと応答で済む小さなやり取りなので、接続を張るコストが無駄になる。（応答が大きい場合やゾーン転送ではTCP 53も使う。）
- **SNMP**: 多数の機器を定期的に監視するため、軽いUDPが向いている。
- **NTP / Syslog**: 小さなメッセージを頻繁に送るため。
- **TFTP**: 実装を極力シンプルにするため（機器の起動時やROMモニタからでも使える）。

### 1.3 よく出るポート番号一覧

| ポート | TCP/UDP | プロトコル | 用途・覚え方 |
|---|---|---|---|
| 20 | TCP | FTP（データ） | アクティブモードのデータ転送用 |
| 21 | TCP | FTP（制御） | ログイン・コマンド用。常に21番に接続 |
| 22 | TCP | SSH / SCP / SFTP | 暗号化されたリモートログイン・ファイル転送 |
| 23 | TCP | Telnet | 平文のリモートログイン（非推奨） |
| 25 | TCP | SMTP | メール送信 |
| 53 | UDP（主）/ TCP | DNS | 名前解決。通常の問い合わせはUDP |
| 67 | UDP | DHCP（サーバ） | サーバが待ち受け |
| 68 | UDP | DHCP（クライアント） | クライアントが待ち受け |
| 69 | UDP | TFTP | 認証なしの簡易ファイル転送 |
| 80 | TCP | HTTP | Web |
| 123 | UDP | NTP | 時刻同期 |
| 161 | UDP | SNMP（Get/Set） | エージェントが待ち受け |
| 162 | UDP | SNMP（Trap/Inform） | マネージャが待ち受け |
| 443 | TCP | HTTPS | 暗号化されたWeb |
| 514 | UDP | Syslog | ログの送信 |

**語呂・関連づけのコツ**

- 20/21/22/23 は「FTP・FTP・SSH・Telnet」と連番で覚える。SSHはTelnet（23）の安全版で、その1つ手前の22。
- DHCPは67/68と **2つの番号**（サーバ67、クライアント68）。DNS（53）やTFTP（69）と数字が近く、混同を狙われる。
- SNMPは161/162と **2つの番号**。小さいほう（161）が「エージェントへの問い合わせ」、大きいほう（162）が「Trap」。
- NTP 123 は「1・2・3と時を刻む」。
- Syslog 514。SNMPの161/162やNTPの123と取り違えさせる選択肢に注意。

### ひっかけポイント・よくある誤解

- 「Telnet ― 25」→ 25はSMTP（メール送信）。TelnetはTCP 23。
- 「DNS ― 69」→ 69はTFTP。DNSは53。
- 「NTP ― 161」→ 161はSNMP。NTPはUDP 123。
- 「DHCP ― UDP 53」「DHCP ― UDP 69」→ それぞれDNS、TFTPのポート。DHCPは67/68。
- 「SNMP ― 514」→ 514はSyslog。
- 「FTPの制御 ― TCP 20」→ 20はデータ用（アクティブモード）。制御は21。
- 「TFTP ― TCP」→ TFTPはUDP 69。TCP 20/21はFTP。

### 試験のポイント

- ポート番号の問題は、誤答が「他のプロトコルの正しい番号」になっている。一覧表を双方向（番号→プロトコル、プロトコル→番号）で言えるようにする。
- DHCP（67/68）とSNMP（161/162）は2つの番号を使う。どちらがどちら側かまで問われる。
- IPサービスの多くはUDP。TCPなのはSSH（22）、Telnet（23）、FTP（20/21）、HTTP/HTTPSなど。

### 関連問題

- is-013（プロトコルとポート番号の組み合わせ）
- 関連: is-033（DHCPのポート）、is-038（SNMPのポート）、is-050（FTPのポート）、is-024（TFTPのポート）

---

## 2. DHCP

### 2.1 DHCPとは何か・なぜ必要か

DHCP（Dynamic Host Configuration Protocol）は、端末がネットワークに接続したときに、IPアドレスなどの設定を **サーバから自動で受け取る** 仕組みです。数百台のPCに手作業でアドレスを設定すると、手間がかかるうえ、アドレスの重複やゲートウェイの設定ミスが起きます。DHCPを使えば、これらを一元管理でき、設定ミスも減らせます。

**DHCPで配布できる主な情報**

| 情報 | Cisco IOSの `ip dhcp pool` 内のコマンド |
|---|---|
| IPアドレスとサブネットマスク | `network 192.168.1.0 255.255.255.0` |
| デフォルトゲートウェイ | `default-router 192.168.1.1` |
| DNSサーバ | `dns-server 8.8.8.8` |
| リース期間（アドレスを使える期間） | `lease 7`（7日間） |
| ドメイン名 | `domain-name example.com` |

**DHCPで配布しないもの（ひっかけで出る）**

- **クライアントのMACアドレス**: MACアドレスはNIC（ネットワークカード）に製造時に割り当てられた固有の値です。むしろDHCPサーバは、クライアントのMACアドレスを「誰に貸したか」の識別に使います。
- **VLAN番号**: VLANはスイッチのポート設定（`switchport access vlan 10` など）で決まります。端末はどのVLANに所属しているかを意識せず、ポートに接続されたVLANのDHCPサーバ（またはリレー）からアドレスをもらいます。

### 2.2 DHCPの動作：DORA

クライアントがアドレスを取得するときは、4つのメッセージをやり取りします。頭文字をとって **DORA** と覚えます。

```
 DHCPクライアント                                      DHCPサーバ
 (アドレスなし)                                        (192.168.1.1)
      |                                                     |
      | ① DHCPDISCOVER  (ブロードキャスト)                   |
      |   送信元 0.0.0.0:68  → 宛先 255.255.255.255:67       |
      |   「DHCPサーバはいませんか？」                        |
      |---------------------------------------------------->|
      |                                                     |
      | ② DHCPOFFER                                          |
      |   「192.168.1.20 を使えますよ（GW, DNS, リース期間）」 |
      |<----------------------------------------------------|
      |                                                     |
      | ③ DHCPREQUEST  (ブロードキャスト)                     |
      |   「192.168.1.20 を使わせてください」                  |
      |---------------------------------------------------->|
      |                                                     |
      | ④ DHCPACK                                            |
      |   「承認します」→ クライアントはここで使用開始          |
      |<----------------------------------------------------|
      |                                                     |
```

| 順番 | メッセージ | 送信者 | 意味 |
|---|---|---|---|
| ① | DHCPDISCOVER | クライアント | DHCPサーバを探す。宛先がわからないのでブロードキャスト |
| ② | DHCPOFFER | サーバ | 割り当てられるIPアドレスなどを **提案** する |
| ③ | DHCPREQUEST | クライアント | 提案されたアドレスを使いたいと **要求** する |
| ④ | DHCPACK | サーバ | **承認**。これを受け取ってクライアントがアドレスを使い始める |

**なぜ③のREQUESTが必要なのか**: 同じネットワークに複数のDHCPサーバがあると、クライアントは複数のOFFERを受け取ることがあります。REQUESTをブロードキャストで送り「このサーバのこのアドレスを選んだ」と知らせることで、選ばれなかったサーバは提案したアドレスを取り消せます。

**なぜ④のACKを受け取るまで使わないのか**: OFFERは「提案」にすぎず、まだ正式な割り当てではないからです。ACKで初めて貸し出しが確定します。（サーバが拒否する場合は DHCPNAK を返します。）

### 2.3 DHCPDISCOVERのアドレスとポート

DHCPDISCOVERの送信元・宛先は、次の組み合わせになります。

| 項目 | 値 | 理由 |
|---|---|---|
| 送信元IP | 0.0.0.0 | 自分のアドレスがまだないため |
| 宛先IP | 255.255.255.255 | DHCPサーバの場所（アドレス）がわからないため、ローカルネットワーク全体へブロードキャスト |
| 送信元MAC | 自分のMAC | |
| 宛先MAC | FFFF.FFFF.FFFF | L2ブロードキャスト |
| トランスポート | UDP | アドレスがないとTCPの接続を張れない |
| 送信元ポート | 68（クライアント） | |
| 宛先ポート | 67（サーバ） | |

**255.255.255.255（限定ブロードキャスト）はルータを越えません。** これが次のDHCPリレーが必要になる理由です。

> 誤答で出るアドレスの意味
> - **169.254.x.x**: DHCPでアドレスを取得できなかったときにOSが自分で付けるAPIPAアドレス（2.9節）。DISCOVERの送信元ではない。
> - **127.0.0.1**: 自分自身を表すループバックアドレス。ネットワークへ送信するパケットには使わない。
> - **宛先＝DHCPサーバのIP**: クライアントはサーバのアドレスを知らないので直接送れない。

### 2.4 DHCPのポート番号とTCP/UDP

- DHCPは **UDP** を使い、**サーバ側 67、クライアント側 68** の2つのポートを使います（BOOTPから引き継いだ番号）。
- TCPは使えません。TCPは送信前に3ウェイハンドシェイクで接続を確立する必要があり、アドレスを持たないクライアントにはできないからです。
- ACLでDHCPを許可するときや、パケットキャプチャを読むときにこの知識が必要です。

```
! 例：インターフェースのACLでDHCPのクライアント→サーバ方向を通す
access-list 100 permit udp any eq 68 any eq 67
```

### 2.5 DHCPリレー（ip helper-address）

DHCPサーバは、本社のデータセンターなど、クライアントとは別のネットワークに置かれることがよくあります。しかし、DHCPDISCOVERは255.255.255.255宛てのブロードキャストなので、**ルータはそれを別のネットワークへ転送しません**。

そこで、ルータの **クライアントが接続されている側のインターフェース** に `ip helper-address <DHCPサーバのIP>` を設定します。ルータは受け取ったDHCPのブロードキャストを **ユニキャストに変換してDHCPサーバへ中継** します。この機能を **DHCPリレーエージェント** と呼びます。

```
  PC (アドレスなし)            R1                                DHCPサーバ
  VLAN10 192.168.10.0/24   G0/0: 192.168.10.1      G0/1          10.1.1.100
     |                       |                       |               |
     |--DISCOVER(broadcast)->|                       |               |
     |   255.255.255.255     | ip helper-address     |               |
     |                       |   10.1.1.100          |               |
     |                       |--DISCOVER(unicast)--->|-------------->|
     |                       |  送信元: 192.168.10.1 (G0/0のIP)       |
     |                       |  ↑サーバはこのアドレスを見て            |
     |                       |   192.168.10.0/24 のプールから選ぶ      |
     |                       |<---------OFFER (unicast)--------------|
     |<------OFFER-----------|                       |               |
```

```
R1(config)# interface GigabitEthernet0/0
R1(config-if)# description to VLAN10 clients
R1(config-if)# ip address 192.168.10.1 255.255.255.0
R1(config-if)# ip helper-address 10.1.1.100
```

**ポイント**

- 設定する場所は **クライアント側（ブロードキャストを受け取る側）** のインターフェース。サーバ側ではない。
- 指定するのは **DHCPサーバのIPアドレスそのもの**。DNSでサーバ名を調べる機能ではない。
- リレーするとき、ルータは受信インターフェースのアドレス（giaddr）をメッセージに入れます。サーバはそれを見て、どのサブネット用のプールから貸し出すかを決めます。

### 2.6 Ciscoルータの3つのDHCPの役割

Ciscoルータは、DHCPに関して次の3つのどの役割にもなれます。コマンドと役割の対応は頻出です。

| 役割 | 意味 | コマンド | 設定場所 |
|---|---|---|---|
| DHCPサーバ | ルータ自身がアドレスを貸し出す | `ip dhcp pool <名前>`（＋`ip dhcp excluded-address`） | グローバル設定 |
| DHCPリレー | ブロードキャストを別ネットワークのサーバへ中継 | `ip helper-address <サーバIP>` | クライアント側インターフェース |
| DHCPクライアント | インターフェースがDHCPでアドレスを取得する | `ip address dhcp` | インターフェース（例：ISP側） |

#### DHCPサーバの設定例

```
R1(config)# ip dhcp excluded-address 192.168.1.1 192.168.1.10
R1(config)# ip dhcp pool LAN
R1(dhcp-config)# network 192.168.1.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.1.1
R1(dhcp-config)# dns-server 8.8.8.8
R1(dhcp-config)# lease 7
R1(dhcp-config)# exit
```

- `ip dhcp excluded-address 192.168.1.1 192.168.1.10` は、**192.168.1.1〜192.168.1.10 をクライアントへの割り当て対象から除外** します。ルータ自身（デフォルトゲートウェイ）、サーバ、プリンタなど、手動で設定するアドレスと重複しないようにするためです。
- `excluded-address` は **プールの外（グローバル設定モード）** で設定します。プールの中ではありません。
- 割り当てる範囲は `network` コマンドで指定します。excluded-address は「この範囲だけ割り当てる」という意味ではなく、**逆に除外** です。
- `lease 7` はリース期間7日（Ciscoの既定は1日）。`lease 0 8` なら0日8時間。

#### DHCPクライアントの設定例（ISP側インターフェース）

```
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip address dhcp
R1(config-if)# no shutdown

R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     192.168.1.1     YES manual up                    up
GigabitEthernet0/1     203.0.113.25    YES DHCP   up                    up
```

`Method` 列が `DHCP` になっていれば、DHCPでアドレスを取得しています。

### 2.7 リース期間と更新（T1 / T2）

DHCPのアドレスは「永久に与える」のではなく、**リース期間** の間だけ「貸し出す」ものです。使われなくなったアドレスは期限切れで回収され、別の端末に再利用できます。

クライアントは期限が切れる前に自動的に更新するので、通常は同じアドレスを使い続けられます。PCを再起動しなくても、リース期間の途中で自動で更新します。

```
リース開始                 T1 (50%)               T2 (87.5%)        期限切れ (100%)
   |-------------------------|-------------------------|-----------------|
   |                         |                         |                 |
   |                         | 貸してくれたサーバへ      | どのサーバでもよい | アドレス使用不可
   |                         | ユニキャストで           | のでブロードキャスト| → DISCOVERから
   |                         | DHCPREQUEST (更新)       | でDHCPREQUEST     |   やり直し
```

| タイミング | 名前 | 動作 |
|---|---|---|
| 50% 経過 | T1（更新 / Renewal） | アドレスを貸してくれた **サーバに直接（ユニキャスト）** 更新を要求 |
| 87.5% 経過 | T2（再バインド / Rebinding） | T1で更新できなかった場合、**どのサーバでもよいのでブロードキャスト** で要求 |
| 100% | 期限切れ | アドレスを使えなくなる。DISCOVERからやり直し |

**最初に更新を要求するのは 50%（T1）** です。87.5%（T2）は「T1で失敗したときの2回目のチャンス」です。

### 2.8 DHCPの確認コマンド

| コマンド | 表示内容 |
|---|---|
| `show ip dhcp binding` | 誰（MACアドレス / クライアントID）に、どのIPアドレスを、いつまで貸しているか |
| `show ip dhcp pool` | プールの設定と統計（アドレス総数、使用中の数など）。個々のクライアントは表示しない |
| `show ip dhcp conflict` | 貸そうとしたアドレスがすでに使われていた（重複していた）記録 |
| `show arp` | IPアドレスとMACアドレスの対応（ARPテーブル）。DHCPの貸し出し状況ではない |

```
R1# show ip dhcp binding
Bindings from all pools not associated with VRF:
IP address          Client-ID/              Lease expiration        Type
                    Hardware address/
                    User name
192.168.1.11        0100.5056.a1b2.c3       Oct 25 2026 10:15 AM    Automatic
192.168.1.12        0100.5056.d4e5.f6       Oct 25 2026 10:18 AM    Automatic
```

```
R1# show ip dhcp pool

Pool LAN :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 Total addresses                : 254
 Leased addresses               : 2
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range                    Leased addresses
 192.168.1.13         192.168.1.1      - 192.168.1.254     2
```

```
R1# show ip dhcp conflict
IP address        Detection method   Detection time          VRF
192.168.1.15      Ping               Oct 18 2026 09:02 AM
```

**重複検出の仕組み**: Cisco IOSのDHCPサーバは、アドレスを貸す前にそのアドレスへpingを送り、応答があれば「誰かが手動で使っている」と判断します。そのアドレスは conflict に記録して貸し出しません。覚え方は「**binding＝誰に何を貸したか、pool＝プールの使用状況、conflict＝重複**」です。

### 2.9 APIPA（169.254.0.0/16）とトラブルシューティング

WindowsのPCで `ipconfig` を実行して、IPアドレスが **169.254.x.x** になっていたら、**DHCPサーバからアドレスを取得できなかった** ことを示します。

```
C:\> ipconfig

イーサネット アダプター イーサネット:
   自動構成 IPv4 アドレス. . . . . . . : 169.254.10.20
   サブネット マスク . . . . . . . . . : 255.255.0.0
   デフォルト ゲートウェイ . . . . . . :
```

- DHCPに失敗すると、OSが **169.254.0.0/16** から自動でアドレスを付けます。これを **APIPA**（Automatic Private IP Addressing、リンクローカルアドレス）と呼びます。
- DHCPサーバが配るアドレスではありません。
- 手動で設定することも技術的には可能ですが、この範囲のアドレスは通常「自動設定の失敗」を示します。
- **IPv4** のアドレスです（IPv6のリンクローカルは fe80::/10）。
- デフォルトゲートウェイが設定されないため、**同じネットワーク内の、同じくAPIPAの端末同士としか通信できません**。

**APIPAを見たときの確認手順**

1. ケーブル・スイッチポートの状態（物理層、`show interfaces status`）
2. スイッチポートのVLAN設定（正しいVLANに所属しているか）
3. DHCPサーバの状態（サービスが動いているか、プールが枯渇していないか：`show ip dhcp pool`）
4. サーバが別ネットワークなら、ルータの `ip helper-address` の設定（設定場所・サーバIPが正しいか）

### ひっかけポイント・よくある誤解

- **DORAの順番**: DISCOVER → OFFER → REQUEST → ACK。REQUESTとOFFERを入れ替えた並びに注意。クライアントが使い始めるのはACKを受け取ってから。
- **ip helper-address ＝ルータをDHCPサーバにする設定、ではない**。サーバにするのは `ip dhcp pool`。
- **ip helper-address ＝インターフェースがDHCPでアドレスを取得する設定、ではない**。それは `ip address dhcp`。
- **ip helper-address にDNS名を書いてサーバを探す、のではない**。DHCPサーバのIPアドレスを直接指定する。
- **excluded-address は「その範囲だけ割り当てる」ではない**。逆に除外する。割り当て範囲は `network`。通信の拒否はACLの役割で、DHCPサーバのアドレス登録でもない。
- **DHCPで配布しないもの**: クライアントのMACアドレス（NIC固有の値）、VLAN番号（スイッチポートで決まる）。
- **最初のリース更新は87.5%ではなく50%（T1）**。87.5%はT2で、ブロードキャストで任意のサーバに要求する。期限切れ後や再起動時だけ更新するのでもない。
- **DISCOVERの送信元は 0.0.0.0、宛先は 255.255.255.255**。宛先がDHCPサーバのIPになることはない（知らないから）。169.254.x.x や 127.0.0.1 は使わない。
- **DHCPはUDP 67（サーバ）/ 68（クライアント）**。TCPは使えない。53はDNS、69はTFTP。
- **show ip dhcp pool では個々のクライアントの対応は見えない**。それは binding。conflict は重複の記録、show arp はARPテーブル。
- **169.254.x.x は「正常に取得した」でも「IPv6」でもない**。DHCP失敗のサイン。

### 試験のポイント

- DORA（DISCOVER→OFFER→REQUEST→ACK）。DISCOVERは 0.0.0.0 → 255.255.255.255 のブロードキャスト。
- ブロードキャストはルータを越えない → 別ネットワークのサーバには **クライアント側インターフェースに `ip helper-address`**。
- サーバ＝`ip dhcp pool`、リレー＝`ip helper-address`、クライアント＝`ip address dhcp`。
- `ip dhcp excluded-address` はグローバル設定で、割り当てから **除外** する範囲。
- 配布する情報：IP/マスク、デフォルトゲートウェイ（default-router）、DNSサーバ（dns-server）、リース期間（lease）。
- リース更新：T1＝50%（ユニキャストで元のサーバへ）、T2＝87.5%（ブロードキャスト）。
- UDP、サーバ67 / クライアント68。
- 確認：binding（貸出先）、pool（使用状況）、conflict（重複）。
- 169.254.0.0/16（APIPA）＝DHCP失敗。

### 関連問題

- is-001（DORAの順番）
- is-008（ip helper-address の目的）
- is-009（ip dhcp excluded-address の意味）
- is-010（DHCPで配布できる情報）
- is-011（ip address dhcp）
- is-031（リース更新のタイミング）
- is-032（DHCPDISCOVERの送信元/宛先IP）
- is-033（DHCPのプロトコルとポート）
- is-034（show ip dhcp binding）
- is-035（APIPA 169.254.x.x）

---

## 3. DNS

### 3.1 DNSと名前解決

DNS（Domain Name System）は、`www.example.com` のような **ホスト名に対応するIPアドレスを調べる** 仕組みです。これを **名前解決** と呼びます。人間はIPアドレスより名前のほうが覚えやすく、またサーバのIPアドレスが変わっても名前を変えずに済みます。

- ポート番号は **53**。通常の問い合わせには **UDP** を使います（1往復の小さなやり取りなので軽いUDPが向く）。応答が大きい場合や、DNSサーバ間でゾーン情報をまとめて転送する（ゾーン転送）場合はTCP 53を使います。

**似た仕組みとの区別**

| 仕組み | 何を何に対応づけるか / 役割 |
|---|---|
| DNS | ホスト名 → IPアドレス（名前解決） |
| DHCP | 端末にIPアドレスなどの設定を自動配布 |
| ARP | 同じネットワーク内で、IPアドレス → MACアドレス |
| NAT | プライベートIPアドレス ⇔ グローバルIPアドレスの変換 |

### 3.2 PCが Webサーバにアクセスするまでの流れ

```
 PC (192.168.1.10, GW 192.168.1.1, DNS 8.8.8.8)

 ① DNS: 「www.example.com のIPアドレスは？」 → 応答「93.184.216.34」
 ② 宛先 93.184.216.34 は自分のネットワーク(192.168.1.0/24)の外
      → デフォルトゲートウェイ 192.168.1.1 へ送る必要がある
 ③ ARP: 「192.168.1.1 のMACアドレスは？」 → 応答「GWのMAC」
 ④ 宛先IP=93.184.216.34 / 宛先MAC=GWのMAC でフレームを送信
```

DNSで「宛先IP」を、ARPで「次に渡す相手（同一ネットワーク内）のMAC」を調べる、という役割分担を押さえてください。（実際には①のDNSサーバへの問い合わせ自体も、DNSサーバが別ネットワークならゲートウェイ経由で送られます。）

### 3.3 主なDNSレコード

| レコード | 内容 | 例 |
|---|---|---|
| A | ホスト名 → **IPv4** アドレス | www.example.com → 93.184.216.34 |
| AAAA | ホスト名 → **IPv6** アドレス | www.example.com → 2001:db8::10 |
| CNAME | ホスト名の別名（エイリアス） | web.example.com → www.example.com |
| MX | そのドメイン宛てのメールを受け取るメールサーバ | example.com → mail.example.com |
| PTR | IPアドレス → ホスト名（逆引き） | 34.216.184.93.in-addr.arpa → www.example.com |
| NS | そのドメインを管理するDNSサーバ | example.com → ns1.example.com |

**AAAAの名前の由来**: IPv6アドレスは128ビットで、IPv4（32ビット）の **4倍** の長さ。そこでAレコードの「A」を4つ並べてAAAA（クアッドA）と呼びます。

### 3.4 Cisco IOSとDNS

ルータ自身が名前解決を行う（例：`ping www.example.com`）には、DNSサーバを指定します。

```
R1(config)# ip domain-lookup            ! 既定で有効
R1(config)# ip name-server 8.8.8.8      ! 問い合わせ先のDNSサーバ
R1(config)# ip domain-name example.com  ! ルータ自身のドメイン名（SSHの鍵作成にも必要）
```

#### 打ち間違いで待たされる問題と no ip domain-lookup

Cisco IOSは、コマンドとして認識できない **1単語** を「Telnetの接続先のホスト名」と解釈し、DNSで名前解決しようとします。DNSサーバを指定していない場合は、**255.255.255.255へブロードキャストで問い合わせ** ます。

```
R1# shwo
Translating "shwo"...domain server (255.255.255.255)
 (しばらく応答待ちで操作できない)
% Bad IP address or host name
% Unknown command or computer name, or unable to find computer address
```

この動作を止めるのが **`no ip domain-lookup`** です。

| コマンド | 効果 |
|---|---|
| `no ip domain-lookup` | DNSによる名前解決そのものを無効化 → 打ち間違いで待たされなくなる |
| `no ip name-server` | DNSサーバの指定を消すだけ。名前解決の試み自体は止まらず、ブロードキャストで問い合わせる |
| `no logging console` | コンソールへのログ表示を止める。名前解決とは無関係 |
| `ip domain-name example.com` | ルータのドメイン名を設定（SSHのRSA鍵作成に必要）。名前解決の動作は止まらない |

検証環境（ラボ）ではDNSサーバがないことが多いので、最初に `no ip domain-lookup` を設定するのが定番です。ただし **ルータで名前解決を使いたい場合は無効にしてはいけません**（ホスト名でpingやNTPサーバを指定できなくなる）。

### ひっかけポイント・よくある誤解

- 名前→IPアドレスはDNS。DHCP（設定の配布）、ARP（IP→MAC）、NAT（アドレス変換）と混同しない。
- **AAAA＝IPv6**、**A＝IPv4**。MXはメールサーバ、CNAMEは別名、PTRは逆引き。
- `no ip name-server` では名前解決は止まらない（ブロードキャストで問い合わせ続ける）。止めるのは `no ip domain-lookup`。
- `ip domain-name` はドメイン名の設定であり、名前解決を止めるものではない。
- DNSは53番。69番（TFTP）と混同しない。

### 試験のポイント

- DNS＝名前解決、ポート53、通常はUDP（大きな応答・ゾーン転送はTCP）。
- PCの処理順：DNSで宛先IP → （別ネットワークなら）ARPでGWのMAC → 送信。
- レコード：A（IPv4）、AAAA（IPv6）、CNAME、MX、PTR、NS。
- ルータ：`ip name-server` でDNSサーバ指定、`no ip domain-lookup` で打ち間違い時の名前解決を停止。

### 関連問題

- is-012（名前解決の仕組み＝DNS）
- is-036（AAAAレコード）
- is-037（no ip domain-lookup）

---

## 4. NAT / PAT

### 4.1 NATが必要な理由

社内のPCには、通常 **プライベートIPアドレス**（RFC 1918）が設定されています。

| クラス | 範囲 |
|---|---|
| A | 10.0.0.0/8 |
| B | 172.16.0.0/12（172.16.0.0〜172.31.255.255） |
| C | 192.168.0.0/16 |

プライベートアドレスは組織内で自由に使えますが、**インターネット上ではルーティングされません**（どの組織でも同じアドレスを使っているため、インターネットのルータは宛先を決められない）。そこで、インターネットとの境界にあるルータで、プライベートアドレスを **グローバル（パブリック）アドレス** に変換します。これが **NAT（Network Address Translation）** です。NATはIPv4アドレスの枯渇対策としても重要な役割を果たしています。

### 4.2 NATの4つのアドレス用語

NATの用語は **2つの言葉の組み合わせ** で考えます。

- **inside / outside**: 「**どちら側の端末か**」（社内の端末か、外部の端末か）
- **local / global**: 「**どこから見たアドレスか**」（社内＝local から見た値か、インターネット＝global から見た値か）

```
        社内 (inside)                    NATルータ                  インターネット (outside)
  +-----------------+          +-----------------------+          +--------------------+
  |  PC             |          |                       |          |  Webサーバ          |
  |  192.168.1.10   |--------->| inside      outside   |--------->|  198.51.100.80     |
  +-----------------+          +-----------------------+          +--------------------+

  変換前（社内側で見えるパケット）       変換後（インターネット側で見えるパケット）
   送信元 192.168.1.10   ←inside local     送信元 203.0.113.5    ←inside global
   宛先   198.51.100.80  ←outside local    宛先   198.51.100.80  ←outside global
```

| 用語 | 意味 | 上の例 |
|---|---|---|
| **inside local**（内部ローカル） | 社内の端末に **実際に設定されている** 変換前のアドレス | 192.168.1.10 |
| **inside global**（内部グローバル） | 社内の端末が **外部からどう見えるか**（変換後のアドレス） | 203.0.113.5 |
| **outside local**（外部ローカル） | 外部の相手が **社内からどう見えるか** | 198.51.100.80（通常は outside global と同じ） |
| **outside global**（外部グローバル） | 外部の相手（例：Webサーバ）に **実際に設定されている** アドレス | 198.51.100.80 |

一般的な「社内からインターネットへ出る」NATでは、outside local と outside global は同じ値になります（外部側のアドレスは変換しないため）。

### 4.3 NATの3つの種類

| 種類 | 対応関係 | 変換が作られるタイミング | 主な用途 |
|---|---|---|---|
| **スタティックNAT** | 1対1・**固定** | 設定した時点から常に存在 | 外部に公開するサーバ（外部から通信を始める必要がある） |
| **ダイナミックNAT** | 1対1・**プールから動的に** 割り当て | 社内から通信を始めたとき | 少数のグローバルアドレスを順番に使う（同時接続数はプールのアドレス数まで） |
| **PAT（NATオーバーロード）** | 多対1（**アドレス＋ポート番号** で区別） | 社内から通信を始めたとき | 多数の端末で1つ（または少数）のグローバルアドレスを共有。家庭用ルータでも一般的 |

#### PATの仕組み

PATは、IPアドレスだけでなく **送信元ポート番号も変換・記録** します。「グローバルIPアドレス＋ポート番号」の組み合わせで各端末の通信を区別できるので、1つのグローバルアドレスで多数の端末が同時に通信できます。

```
 社内                              PATルータ (外側 203.0.113.5)          インターネット
 192.168.1.10:51000  ─┐
 192.168.1.11:51000  ─┼──>  203.0.113.5:51000  ┐
 192.168.1.12:49152  ─┘     203.0.113.5:51001  ├──> 198.51.100.80:443
                            203.0.113.5:49152  ┘
   (192.168.1.11 のポートは重複するので 51001 に変換して区別)
   戻りのパケットは宛先ポートを見て、どの社内端末に返すかを判断する
```

Ciscoでは `ip nat inside source ...` の **最後に `overload` を付けるとPAT** になります。

### 4.4 NATの設定：2つのステップ

NATの設定は大きく2つに分けられます。

1. **インターフェースごとに内側と外側を指定する**: 社内（LAN）側に `ip nat inside`、インターネット側に `ip nat outside`
2. **グローバル設定で変換ルールを作る**: `ip nat inside source ...`

**inside と outside の指定を逆にすると変換されません**。NATは「insideで受信して outside へ送る」「outside で受信して inside へ送る」パケットに対して働くからです。

#### (1) スタティックNAT

社内のWebサーバ（192.168.1.10）を、インターネットから常に 203.0.113.10 でアクセスできるようにする例です。

```
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip address 192.168.1.1 255.255.255.0
R1(config-if)# ip nat inside
R1(config-if)# interface GigabitEthernet0/1
R1(config-if)# ip address 203.0.113.2 255.255.255.0
R1(config-if)# ip nat outside
R1(config-if)# exit
R1(config)# ip nat inside source static 192.168.1.10 203.0.113.10
```

- 書式は `ip nat inside source static <inside local> <inside global>`。**先に社内側（変換前）、後に変換後** の順です。逆に書くと意味が変わってしまいます。
- 変換が常に存在するので、**外部から通信を始める** ことができます。PATやダイナミックNATは社内から通信を始めたときにだけ変換が作られるため、外部から特定サーバへのアクセスには使えません。
- `ip route 203.0.113.10 255.255.255.255 192.168.1.10` のようなホストルートはルーティングの設定で、アドレスの変換は行いません。

#### (2) ダイナミックNAT

```
R1(config)# ip nat pool GLOBAL 203.0.113.1 203.0.113.5 netmask 255.255.255.248
R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255
R1(config)# ip nat inside source list 1 pool GLOBAL
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip nat inside
R1(config-if)# interface GigabitEthernet0/1
R1(config-if)# ip nat outside
```

手順:

1. `ip nat pool` で変換後のアドレスの **プール** を作る（ここでは 203.0.113.1〜.5 の5個）。
2. `access-list 1 permit ...` で **変換対象（社内の送信元）** を決める。
3. `ip nat inside source list 1 pool GLOBAL` で **ACLとプールを結び付ける**。
4. インターフェースに `ip nat inside` / `ip nat outside`。

末尾に `overload` を付ける（`ip nat inside source list 1 pool GLOBAL overload`）と、プールのアドレスを使ったPATになります。

**プールが足りなくなるとどうなるか**: ダイナミックNATはプールのアドレスを **1対1で貸し出す** ため、同時に通信できる台数はプールのアドレス数までです。プールに3つしかなく3台が通信中なら、4台目は変換に使えるアドレスがないので **通信できません**（どれかの変換がタイムアウトで解放されるまで待つ）。

- overload がなければ、ポート番号で既存のアドレスを共有することはない。
- 変換されずにプライベートアドレスのまま出ていっても、インターネットではルーティングされないので通信できない。
- ルータがプールのアドレスを自動で増やすことはない。

#### (3) PAT（インターフェースのアドレスを共有）

最も一般的な形です。外側インターフェース自身のアドレス1つを全員で共有します。

```
R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255
R1(config)# ip nat inside source list 1 interface GigabitEthernet0/1 overload
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip nat inside
R1(config-if)# interface GigabitEthernet0/1
R1(config-if)# ip nat outside
```

`interface GigabitEthernet0/1` は「変換後のアドレスとして G0/1 のアドレスを使う」という意味です。G0/1 が `ip address dhcp` でISPからアドレスを取得していても、そのアドレスが使われます。

#### NATで使うACLの役割

`ip nat inside source list 1 ...` の **ACL 1 は、NATで変換する対象の、社内側の「送信元」アドレスを指定** します。

- ACLはパケットフィルタ（許可・拒否）だけでなく、「**条件に一致する通信を選ぶ**」道具としても使われます。NATのACLは通信を拒否するためのものではありません。
- ACLで permit した送信元からの通信だけが変換されます。permit していないアドレスは **変換されないまま** インターネットへ出ていきます（プライベートアドレスなので多くの場合、通信できない）。
- 変換後のアドレスはACLではなく、`interface ...` や `pool ...` で指定します。
- 宛先アドレスを選ぶものでもありません。

#### inside source と outside source

- `ip nat inside source` … **社内（inside）の送信元アドレス** を変換する。通常使うのはこちら。
- `ip nat outside source` … **外部（outside）のアドレス** を変換する特殊な設定（アドレスが重複するネットワーク同士の接続など）。社内アドレスの変換には使わない。

### 4.5 NATの確認とトラブルシューティング

| コマンド | 内容 |
|---|---|
| `show ip nat translations` | 現在の変換の一覧（NATテーブル）。inside local ⇔ inside global の対応 |
| `show ip nat statistics` | 変換の件数、inside/outside に設定されたインターフェース、ヒット数など |
| `clear ip nat translation *` | **動的な** 変換をすべて削除（スタティックは消えない） |
| `debug ip nat` | 変換の様子をリアルタイムに表示 |

```
R1# show ip nat translations
Pro Inside global        Inside local         Outside local        Outside global
tcp 203.0.113.2:51000    192.168.1.10:51000   198.51.100.80:443    198.51.100.80:443
tcp 203.0.113.2:51001    192.168.1.11:51000   198.51.100.80:443    198.51.100.80:443
--- 203.0.113.10         192.168.1.10         ---                  ---
```

- 3行目の `---` が付いた行はスタティックNATのエントリ（常に存在）。
- 上2行はPATの動的エントリ。同じ inside global アドレスをポート番号で区別しています。

```
R1# show ip nat statistics
Total active translations: 3 (1 static, 2 dynamic; 2 extended)
Outside interfaces:
  GigabitEthernet0/1
Inside interfaces:
  GigabitEthernet0/0
Hits: 1520  Misses: 4
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 interface GigabitEthernet0/1 refcount 2
```

**変換が表示されないとき** は、次を確認します。

1. `ip nat inside` / `ip nat outside` がそれぞれ正しいインターフェースに付いているか（逆になっていないか）→ `show ip nat statistics`
2. ACLの範囲に送信元が含まれているか（ワイルドカードマスクの誤り）
3. プールのアドレス・ `overload` の有無

**clear ip nat translation \* を使う場面**: 動的な変換は、通信がなくなると一定時間後に自動で削除されます。NATの設定を変更した直後は **古い変換が残っていて期待どおりに動かない** ことがあるため、`clear ip nat translation *` で消去してから確認します。ただし通信中のセッションは切れるので、実務では影響に注意します。

- `show ip nat translations` は表示するだけで、消去はしない。
- `no ip nat inside` はインターフェースの inside 指定を外す設定変更で、既存の変換を消去するコマンドではない。
- `clear ip route *` はルーティングテーブルを再構築するコマンドで、NATの変換は消えない。

### ひっかけポイント・よくある誤解

- **1つのグローバルアドレスを多数の端末で共有するのはPAT（overload）**。スタティックNATは1対1固定、ダイナミックNATはプールから1対1（同時接続はプール数まで）。DNSはアドレス変換ではない。
- **用語**: 社内PCの変換前＝inside local、変換後＝inside global。outside local＝外部の相手が社内からどう見えるか、outside global＝外部の相手の実アドレス。「inside/outside＝どちら側の端末」「local/global＝どこから見た値」。
- **インターネット側は `ip nat outside`、LAN側は `ip nat inside`**。`ip nat inside source ...` はグローバル設定でインターフェースには付けない。`ip helper-address` はDHCPリレーでNATと無関係。
- **スタティックNATの順番は inside local → inside global**。逆に書くのは誤り。
- **外部からサーバへアクセスさせるにはスタティックNAT**。PAT/ダイナミックNATは社内から通信を始めたときだけ変換ができる。スタティックルートは変換しない。
- **ダイナミックNATは `list 1 pool GLOBAL`**。`static` は1台固定、`interface ... overload` はPAT、`outside source` は外部アドレスの変換。
- **NATのACLは変換対象の「社内側の送信元」を選ぶ**。通信の拒否・変換後アドレスの指定・宛先の指定ではない。
- **ダイナミックNATのプール枯渇時は通信できない**。overload なしではポート共有しない。プライベートのまま出ても通信できない。プールは自動で増えない。
- **NATの確認は `show ip nat translations`**。`show ip route`（ルーティング）、`show ip interface brief`（IFの状態）、`show arp`（ARP）ではない。
- **変換の消去は `clear ip nat translation *`**。動的のみ消え、スタティックは残る。

### 試験のポイント

- NATの3種類（スタティック／ダイナミック／PAT）の違いと用途。
- 4つの用語（inside local / inside global / outside local / outside global）を例から即答できること。
- 設定は「IFに inside/outside」＋「グローバルで `ip nat inside source`」の2ステップ。
- `static <inside local> <inside global>`、`list <ACL> pool <名前>`、`list <ACL> interface <IF> overload`。
- `overload` を付けるとPAT。
- ACLは変換対象の送信元を選ぶ。
- 確認 `show ip nat translations` / `show ip nat statistics`、消去 `clear ip nat translation *`。

### 関連問題

- is-002（PAT＝1つのアドレスを共有）
- is-004（inside local）
- is-005（ip nat outside）
- is-006（show ip nat translations）
- is-007（スタティックNATの設定）
- is-027（ダイナミックNATの設定）
- is-028（NATで使うACLの役割）
- is-029（ダイナミックNATのプール枯渇）
- is-030（clear ip nat translation *）

---

## 5. NTP

### 5.1 なぜ時刻同期が必要か

NTP（Network Time Protocol）は、ネットワーク機器の **時刻を同期** させるプロトコルです（**UDP 123**）。

機器ごとに時刻がずれていると、障害時に複数の機器のログを突き合わせても、**どの出来事が先に起きたのか** がわからなくなります。たとえば「R1のインターフェースがダウンした」ログと「SW1でSTPのトポロジ変更が起きた」ログのどちらが原因でどちらが結果かは、時刻が正しくそろっていないと判断できません。そのほか、証明書の有効期限の確認、認証（時刻を使うもの）、課金・監査ログなどにも正確な時刻が必要です。

時刻を配る側を **NTPサーバ**、受け取る側を **NTPクライアント** と呼びます。

### 5.2 ストラタム（stratum）

NTPは **階層構造** になっていて、その階層を **ストラタム** という値で表します。

```
   ストラタム0   [原子時計] [GPS]          ← 正確な時刻源（ネットワーク機器ではない）
                     |
   ストラタム1   [NTPサーバA]              ← 時刻源に直接つながるサーバ
                     |
   ストラタム2   [NTPサーバB 10.1.1.1]      ← Aから取得
                     |
   ストラタム3   [ルータR1]                 ← Bから取得（show ntp status: stratum 3）
                     |
   ストラタム4   [スイッチSW1]              ← R1から取得
   ...
   ストラタム16  = 同期していない（unsynchronized）
```

- **値が小さいほど、原子時計やGPSなどの正確な時刻源に近い**。
- 時刻源（ストラタム0）に直接つながるサーバがストラタム1。
- NTPサーバを **1段経由するごとに1ずつ大きくなる**。つまり、自分のストラタム＝同期先のストラタム＋1。
- **ストラタム16は「同期していない」** 状態を表す（最も信頼性が高い、ではない）。
- ストラタムが小さいサーバほど正確な時刻を持つと判断され、同期先として優先されます。
- ストラタムは時刻源からの距離（階層）であり、**暗号化の強さとは関係ありません**（NTPの認証は別の機能）。

### 5.3 NTPの設定

```
R1(config)# ntp server 10.1.1.1          ! 10.1.1.1 から時刻を取得（R1はNTPクライアント）
R1(config)# clock timezone JST 9         ! タイムゾーン（表示用）

SW1(config)# ntp server 192.168.1.1      ! R1から時刻を取得

R2(config)# ntp master 3                 ! R2自身を時刻源（NTPサーバ）にする（ストラタム3）
```

| コマンド | モード | 意味 |
|---|---|---|
| `ntp server <IP>` | グローバル設定 | このルータが **NTPクライアント** として、指定したサーバから時刻を取得・同期する |
| `ntp master [ストラタム]` | グローバル設定 | このルータを信頼できる時刻源（NTPサーバ）にする（外部の時刻源がない場合など） |
| `clock set 10:00:00 1 April 2026` | **特権EXEC** | 時刻を手動で設定する |
| `logging host <IP>` | グローバル設定 | Syslogの送信先（NTPとは無関係） |

**ntp server を設定したルータの役割**: そのルータは10.1.1.1に対しては **クライアント** です。「10.1.1.1に時刻を提供する」のではありません。ただし、同期した後は、そのルータ自身も他の機器（上の例のSW1など）へ時刻を提供できます（クライアント兼サーバ）。

### 5.4 NTPの確認

```
R1# show ntp status
Clock is synchronized, stratum 3, reference is 10.1.1.1
nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**10
reference time is E9A1B2C3.1A2B3C4D (10:15:30.102 JST Sun Oct 18 2026)
clock offset is 0.5000 msec, root delay is 2.00 msec
...
```

- `Clock is synchronized` → 同期済み
- `stratum 3` → **このルータ自身** のストラタム
- `reference is 10.1.1.1` → 同期先

このルータがストラタム3なら、同期先の 10.1.1.1 は **ストラタム2** です（自分＝サーバ＋1）。このルータから時刻を取得する機器はストラタム4になります。

```
R1# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
*~10.1.1.1        192.0.2.1        2     45     64   377  2.000   0.500  1.000
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured
```

- `*` が付いた行が実際の同期先（sys.peer）。
- `st` 列で、同期先の候補それぞれのストラタムを確認できます（ここでは10.1.1.1が2）。

### 5.5 NTPとログのタイムスタンプ

NTPで時刻をそろえても、それだけではログに日時は付きません。ログに日時を付けるのは `service timestamps log datetime msec` です（7章のSyslogで詳しく扱います）。**「NTPで正しい時刻」＋「service timestamps でログに日時を付ける」** の両方がそろって、複数機器のログを時系列で突き合わせられます。

### ひっかけポイント・よくある誤解

- 時刻同期はNTP。SNMP（監視）、Syslog（ログ送信）、TFTP（ファイル転送）ではない。
- `ntp server 10.1.1.1` は「10.1.1.1 **から** 時刻を取得する（自分はクライアント）」。「10.1.1.1 に提供する」ではない。自分をサーバにするのは `ntp master`。
- ログの送信先は `logging host`、時刻の手動設定は特権EXECの `clock set`。
- ストラタムは **小さいほど正確**。大きいほど正確、は逆。
- **ストラタム16は「同期していない」**。最も信頼性が高いのではない。
- ストラタムは暗号化の強さではない。
- `show ntp status` の stratum は **自分自身** の値。同期先はそれより1小さい。
- `ntp server` だけではログに日時は付かない（`service timestamps` が必要）。

### 試験のポイント

- NTPはUDP 123。時刻をそろえる目的は、ログの時系列の突き合わせ。
- `ntp server <IP>` でクライアント、`ntp master` で時刻源。同期後はクライアント兼サーバになれる。
- ストラタム：小さいほど正確、1段ごとに+1、16＝非同期。
- 確認：`show ntp status`（自分のストラタム・同期状態・同期先）、`show ntp associations`（同期先候補とそのストラタム）。

### 関連問題

- is-003（時刻同期のプロトコル＝NTP）
- is-018（ntp server の意味）
- is-019（ストラタムの説明）
- is-045（show ntp status から同期先のストラタムを求める）
- 関連: is-044（ログのタイムスタンプとNTP）

---

## 6. SNMP

### 6.1 SNMPの構成要素

SNMP（Simple Network Management Protocol）は、ネットワーク機器のCPU使用率、メモリ、インターフェースの状態やトラフィック量などを **監視・管理** するプロトコルです。

| 構成要素 | 役割 | 例 |
|---|---|---|
| **マネージャ**（NMS） | 監視する側。情報を集め、グラフ化やアラートを行う | 監視サーバ（Zabbix、PRTG など） |
| **エージェント** | 監視される側。自分の情報を管理し、マネージャに応答する | ルータ、スイッチ |
| **MIB** | エージェントが管理する情報の項目を **木構造** で定義したデータベース | インターフェースの受信バイト数、ホスト名など |
| **OID** | MIBの中の各項目を **一意に識別する番号** | 1.3.6.1.2.1.1.5.0（sysName：ホスト名） |

```
                    MIBの木構造（一部）
  iso(1)
   └ org(3)
      └ dod(6)
         └ internet(1)
            └ mgmt(2)
               └ mib-2(1)
                  ├ system(1)
                  │   ├ sysDescr(1)
                  │   └ sysName(5)  → OID 1.3.6.1.2.1.1.5 (.0 はインスタンス)
                  └ interfaces(2)
                      └ ifTable(2) → ifInOctets(10) … 受信バイト数
```

OIDは、ドットで区切った数字の並びで「MIBの木の中の位置」を表します。マネージャはOIDを指定して Get で値を取得したり、Set で値を変更したりします。

### 6.2 SNMPのメッセージ

| メッセージ | 方向 | 内容 | 宛先ポート |
|---|---|---|---|
| **Get**（GetNext、GetBulk） | マネージャ → エージェント | 情報を **問い合わせる** | UDP 161 |
| **Set** | マネージャ → エージェント | 設定値を **変更する** | UDP 161 |
| **Trap** | エージェント → マネージャ | 異常などを **自分から通知**（応答確認なし） | UDP 162 |
| **Inform** | エージェント → マネージャ | Trapと同じく通知するが、**応答確認あり**（届かなければ再送）。v2c以降 | UDP 162 |

```
   マネージャ (NMS)                                    エージェント (ルータ)
   UDP 162で待ち受け                                   UDP 161で待ち受け
        |                                                      |
        |---- Get (OID 1.3.6.1.2.1.1.5.0) ----> 宛先UDP 161 --->|  定期的なポーリング
        |<--- Response ("R1") ------------------------------------|
        |                                                      |
        |---- Set ---------------------------> 宛先UDP 161 --->|  設定変更（rwのみ）
        |                                                      |
        |<--- Trap (linkDown) <--- 宛先UDP 162 -----------------|  異常時に即時通知
        |                                                      |
```

**MIBはメッセージではない** ことに注意してください。MIBは情報の定義（データベース）です。

SNMPの監視は、マネージャが定期的に Get で情報を取得する **ポーリング** が基本です。ただし、ポーリングの間隔の間に起きた異常はすぐにはわからないので、インターフェースのダウンなどの異常は、エージェントが **Trap**（または応答確認ありの Inform）で問い合わせを待たずに即座に通知します。

### 6.3 ポート番号

- **エージェントはUDP 161で待ち受け**（マネージャからの Get/Set の宛先）
- **マネージャはUDP 162で待ち受け**（エージェントからの Trap/Inform の宛先）
- SNMPは軽量で多数の機器を監視しやすい **UDP** を使う（通常TCPは使わない）。
- ファイアウォールやACLでSNMPを許可するときは、**マネージャ → エージェント（161）** と **エージェント → マネージャ（162）** の両方向を考える必要があります。
- 514番はSyslog。

### 6.4 SNMPのバージョンとセキュリティ

| バージョン | 認証 | 暗号化 | 備考 |
|---|---|---|---|
| SNMPv1 | コミュニティ名（**平文**） | なし | 最初のバージョン |
| SNMPv2c | コミュニティ名（**平文**） | なし | GetBulk、Informを追加。現在も広く使われる |
| **SNMPv3** | **ユーザーごとの認証**（ハッシュ） | **あり** | セキュリティ機能を持つ唯一のバージョン |

SNMPv1/v2c の **コミュニティ名** は、パスワードのような文字列ですが、**平文で流れる** ため、盗聴されると機器の情報を読まれたり、（rwなら）設定を変更されたりする恐れがあります。

**SNMPv3のセキュリティレベル**

| レベル | 認証 | 暗号化 |
|---|---|---|
| noAuthNoPriv | なし（ユーザー名のみ） | なし |
| authNoPriv | あり | なし |
| **authPriv** | あり | **あり** |

「Auth＝認証、Priv＝プライバシー（暗号化）」と覚えると、3つのレベルの意味がすぐにわかります。

### 6.5 SNMPの設定（v2c）

```
R1(config)# snmp-server community MONITOR ro 10      ! 読み取り専用。ACL 10の送信元だけ許可
R1(config)# snmp-server community ADMIN rw 10        ! 読み書き（使う場合は慎重に）
R1(config)# snmp-server host 10.1.1.200 version 2c MONITOR   ! Trapの送信先
R1(config)# snmp-server enable traps                 ! Trapの送信を有効化
R1(config)# access-list 10 permit host 10.1.1.200
```

| 設定 | 意味 |
|---|---|
| `ro`（Read Only） | 情報の **読み取り（Get）だけ** ができる |
| `rw`（Read Write） | 読み取りに加えて、**設定の変更（Set）** もできる |
| `snmp-server host` | **Trapの送信先** を指定する（community の ro/rw とは別の設定） |

- 監視の目的なら **ro で十分**。rw は設定を変更できるため、使う場合は **ACLで接続元を制限** するなど慎重に扱います。
- 初期値として広く知られている **public**（ro）や **private**（rw）は使わない。
- ro を指定しても、コミュニティ名が暗号化されるわけではありません（v1/v2c では常に平文）。

#### SNMPv3の設定例（参考）

```
R1(config)# snmp-server group NMSGROUP v3 priv
R1(config)# snmp-server user nmsuser NMSGROUP v3 auth sha AuthPass123 priv aes 128 PrivPass123
```

### ひっかけポイント・よくある誤解

- **エージェントから自分で通知するのは Trap**。Get は問い合わせ、Set は設定変更。MIBはメッセージではなく情報の定義。
- **認証と暗号化の両方に対応するのは SNMPv3 だけ**。v1/v2c はコミュニティ名が平文。「どのバージョンも暗号化に非対応」は誤り。
- **ポート：問い合わせ UDP 161 / Trap UDP 162**。逆にした選択肢、TCPにした選択肢、514（Syslog）に注意。
- **ro は読み取りのみ**。Set もできるのは rw。Trapの送信先は `snmp-server host`。コミュニティ名は暗号化されない。
- **MIBの項目を識別する番号は OID**。コミュニティ名（v1/v2cの認証文字列）、ストラタム（NTPの階層）、DSCP（QoSの優先度）と混同しない。

### 試験のポイント

- 構成：マネージャ（監視サーバ）、エージェント（機器）、MIB（情報のデータベース）、OID（項目の番号）。
- メッセージ：Get（取得）、Set（変更）、Trap（通知・確認なし）、Inform（通知・確認あり）。
- ポート：エージェント UDP 161、マネージャ（Trap受信）UDP 162。
- v1/v2c＝平文のコミュニティ名、v3＝認証＋暗号化（noAuthNoPriv / authNoPriv / authPriv）。
- `snmp-server community <名前> ro|rw [ACL]`、Trap送信先は `snmp-server host`。

### 関連問題

- is-014（Trap）
- is-015（SNMPv3）
- is-038（SNMPのポート 161/162）
- is-039（community ro）
- is-040（OID）

---

## 7. Syslog

### 7.1 Syslogとは

Syslogは、機器のログメッセージ（インターフェースのup/down、設定変更、エラーなど）を記録・送信する仕組みです。外部のSyslogサーバへは **UDP 514** で送ります。ログの重要度は **0〜7の重大度（severity）レベル** で表します。

### 7.2 重大度（severity）レベル

**数字が小さいほど深刻** です。

| レベル | キーワード | 意味 | 例 |
|---|---|---|---|
| **0** | **emergencies** | システムが使用不能（最も深刻） | |
| 1 | alerts | 直ちに対処が必要 | |
| 2 | critical | 危機的な状態 | ハードウェアの重大な故障 |
| 3 | errors | エラーの発生 | `%LINK-3-UPDOWN`（物理層のup/down） |
| 4 | warnings | 警告 | |
| 5 | notifications | 正常だが重要な出来事 | `%LINEPROTO-5-UPDOWN`（ラインプロトコルのup/down）、`%SYS-5-CONFIG_I`（設定変更） |
| 6 | informational | 情報 | |
| 7 | **debugging** | デバッグ用の詳細メッセージ（最も重大度が低い） | `debug` コマンドの出力 |

**語呂合わせ**: 「**E**very **A**wesome **C**isco **E**ngineer **W**ill **N**eed **I**ce cream **D**aily」
（Emergencies, Alerts, Critical, Errors, Warnings, Notifications, Informational, Debugging）

> 補足：「インターフェースのup/down」には2種類のログがあります。物理層（Link）の状態変化は `%LINK-3-UPDOWN`（レベル3 errors）、データリンク層のラインプロトコルの状態変化は `%LINEPROTO-5-UPDOWN`（レベル5 notifications）です。

### 7.3 Syslogメッセージの形式

```
*Oct 18 10:15:30.102: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down
 └────── タイムスタンプ ─────┘ └ファシリティ┘└重大度┘└ニーモニック┘ └──────────── 本文 ────────────┘
```

形式は **`%ファシリティ-重大度-ニーモニック: 本文`** です。

| 部分 | この例 | 意味 |
|---|---|---|
| ファシリティ | LINEPROTO | メッセージの発生元（ラインプロトコル） |
| 重大度 | **5** | notifications（正常だが重要な出来事） |
| ニーモニック | UPDOWN | 出来事の種類を表す短い名前（状態の変化） |
| 本文 | Line protocol on Interface GigabitEthernet0/1, changed state to down | 詳細。インターフェース名はここに含まれる |

メッセージ中の数字「5」はインターフェース番号でも、発生回数でもありません。先頭のタイムスタンプは `service timestamps` を設定したときに付きます（7.6節）。

### 7.4 ログの出力先

Cisco IOSのログには4つの出力先があります。

| 出力先 | 設定 | 説明 |
|---|---|---|
| コンソール | `logging console [レベル]` | コンソールケーブルで接続した画面に表示（既定で有効） |
| SSH/Telnetの画面（VTY） | `logging monitor [レベル]` ＋ **`terminal monitor`** | リモート接続の画面に表示。セッションごとに `terminal monitor` が必要 |
| RAMのバッファ | `logging buffered [サイズ] [レベル]` | ルータのRAMに保存し、`show logging` で後から見る。**再起動すると消える** |
| 外部のSyslogサーバ | `logging host <IP>` ＋ `logging trap <レベル>` | 長期保存・複数機器のログの集中管理 |

```
R1(config)# logging buffered 16384 informational
R1(config)# logging host 10.1.1.100
R1(config)# logging trap 4
R1(config)# service timestamps log datetime msec
```

```
R1# show logging
Syslog logging: enabled (0 messages dropped, 0 flushes, 0 overruns)
    Console logging: level debugging, 45 messages logged
    Monitor logging: level debugging, 0 messages logged
    Buffer logging:  level informational, 32 messages logged
    Trap logging: level warnings, 12 message lines logged
        Logging to 10.1.1.100  (udp port 514, audit disabled, link up), 12 message lines logged

Log Buffer (16384 bytes):
*Oct 18 10:15:30.102: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down
```

`show logging` で各出力先の状態と、バッファに保存されたログを確認できます。ただし `show logging` は **バッファの内容を一度表示するだけ** で、新しいログがリアルタイムに流れてくるようにはなりません。

### 7.5 レベルの指定：「指定したレベル以下の数字」が対象

`logging trap 4` を設定すると、Syslogサーバへ送られるのは **レベル0〜4** です。指定したレベル **と、それより重大度が高い（数字が小さい）レベル** が送られます。

```
 レベル:   0    1    2    3    4  |  5    6    7
          <── 送られる (0〜4) ──>  |  <─ 送られない ─>
                         logging trap 4
```

- 「レベル4のみ」ではない（より深刻なものも含む）。
- 「4〜7」ではない（数字が大きいほど重大度は低い。範囲が逆）。
- レベル7（debugging）まで送ると大量のログが出て機器に負荷がかかるため、通常は必要な範囲に絞ります。
- レベルはキーワードでも指定可能（`logging trap warnings` ＝ 4）。

### 7.6 terminal monitor

SSHやTelnetで接続した画面には、**デフォルトではログが表示されません**。表示させるには、そのセッションで **`terminal monitor`**（特権EXECモード）を実行します。

```
R1# terminal monitor
R1#
*Oct 18 10:20:01.555: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up
```

- `terminal monitor` は **設定ファイルには保存されず**、ログアウトすると元に戻ります（次回ログイン時に再実行が必要）。
- `logging console` はコンソールへの表示設定で、SSHの画面には影響しない。
- `logging buffered` はRAMへの保存で、SSHの画面に流れるようにはならない。
- `show logging` はバッファを一度表示するだけ。

### 7.7 ログのタイムスタンプ

```
R1(config)# service timestamps log datetime msec
```

これで、ログに **日付と時刻（ミリ秒まで）** が付きます。障害の調査では「何が、いつ、どの順番で起きたか」が重要です。

| 設定 | 役割 |
|---|---|
| `service timestamps log datetime msec` | ログに日時（ミリ秒まで）を付ける |
| `ntp server 10.1.1.1` | 機器の時刻を正しくそろえる（重要だが、これだけでは日時は付かない） |
| `clock set ...` | 時刻を手動で設定（特権EXEC）。日時を付ける設定ではない |
| `logging trap 7` | Syslogサーバへ送る重大度の範囲 |

`service timestamps` でログに日時を付け、NTPで全機器の時刻を正しくそろえておくことで、複数の機器のログを時系列で突き合わせられます。（`datetime` の代わりに `uptime` を指定すると、起動からの経過時間が付きます。）

### ひっかけポイント・よくある誤解

- **最も重大度が高いのはレベル0（emergencies）**。7（debugging）は最も低い。3（errors）、5（notifications）は0より低い。
- **`logging trap 4` ＝ レベル0〜4**。「4のみ」「4〜7」「5〜7」はすべて誤り。
- **`%LINEPROTO-5-UPDOWN` の5は重大度**（notifications）。ファシリティは LINEPROTO、インターフェースは本文中、回数は表示されない。
- **RAMに保存して `show logging` で見るのは `logging buffered`**。console は画面表示のみ、host は外部サーバ、trap は送信レベルの範囲。
- **SSHの画面にログを出すのは `terminal monitor`**。logging console / logging buffered / show logging では流れてこない。
- **ログに日時を付けるのは `service timestamps log datetime msec`**。clock set（手動設定）、ntp server（時刻同期）、logging trap（レベル）ではない。

### 試験のポイント

- Syslogは UDP 514。重大度 0〜7、**数字が小さいほど深刻**。0 emergencies 〜 7 debugging の8つを順に言える。
- `logging trap N` / `logging console N` などは **0〜N** が対象。
- 形式 `%FACILITY-SEVERITY-MNEMONIC: 本文`。
- 出力先：console、monitor（＋terminal monitor）、buffered（show logging）、host（Syslogサーバ）。
- `terminal monitor` は特権EXEC、保存されない。
- `service timestamps log datetime msec` ＋ NTP で時系列分析。

### 関連問題

- is-016（最も重大度が高いレベル）
- is-017（logging trap 4 の範囲）
- is-041（メッセージ形式の「5」）
- is-042（logging buffered）
- is-043（terminal monitor）
- is-044（service timestamps log datetime msec）

---

## 8. QoS

### 8.1 QoSの目的

QoS（Quality of Service）は、**回線が混雑したときに、音声など重要な通信を優先して送る** ための技術です。通信を **分類** し、種類ごとに扱いを変えます。

- QoSは **今ある帯域の使い方を工夫する** 技術で、回線の物理的な帯域幅そのものは増えません。
- 通信の暗号化（IPsec VPNなどの役割）や、ルータ故障時の切り替え（FHRP：HSRPなどの役割）とは別のものです。

**なぜ必要か**: 通信の種類によって「何に弱いか」が違うからです。

| 通信の種類 | 帯域 | 遅延 | ジッタ | パケットロス |
|---|---|---|---|---|
| 音声 | 小さい（1通話あたり数十kbps程度） | **非常に弱い** | **非常に弱い** | 弱い |
| ビデオ会議 | 大きい | 弱い | 弱い | 弱い |
| ファイル転送・メール | 大きい（バースト的） | 多少遅れても問題ない | 問題ない | TCPが再送するので比較的強い |

- **遅延（delay）**: パケットが届くまでの時間
- **ジッタ（jitter）**: 遅延のばらつき
- **パケットロス**: 途中で失われるパケットの割合

### 8.2 音声品質の目安

| 項目 | 一般的な目安 |
|---|---|
| 片方向の遅延 | **150ms 以下** |
| ジッタ | 30ms 以下 |
| パケットロス | 1% 以下 |

片方向の遅延が150msを超えると、会話の間が不自然に感じられるようになります。1秒もあれば会話が成り立たないほど不自然で、5秒は論外です。逆に1msはLAN内の遅延程度の値で、音声に必要な目安としては厳しすぎます。音声は帯域が小さい代わりに遅延とジッタに非常に弱いので、LLQなどで優先して送ります。

### 8.3 QoSの処理の流れ

```
 受信 ──> [分類] ──> [マーキング] ──> [ポリシング] ──> [キューイング / スケジューリング] ──> [シェーピング] ──> 送信
          何の通信か   優先度の印を     超過分を破棄      混雑時の送信順を決める             超過分を遅らせる
          (ACL,NBAR)  付ける(DSCP,CoS)                 (LLQ, CBWFQ)                      
                                                       ＋輻輳回避 (WRED)
```

| 仕組み | 内容 |
|---|---|
| **分類（classification）** | ACL、ポート番号、NBARなどの条件で、パケットを種類分けする |
| **マーキング（marking）** | パケットに「どの優先度で扱うか」の印（DSCPやCoS）を書き込む |
| **キューイング（queuing）** | 混雑時に、どのキューのパケットをどの順で送るかを決める |
| **輻輳回避（congestion avoidance）** | キューがあふれる前に一部を破棄して混雑を和らげる（WRED） |
| **ポリシング / シェーピング** | 通信量を一定のレートに制限する |

### 8.4 マーキング：DSCPとCoS

ネットワークの **入口で一度分類・マーキング** しておけば、途中の機器は毎回細かく分類し直さなくても、**その印を見るだけ** で扱いを決められます。

```
 IPv4ヘッダ
 +--------+--------+-----------------+----------------+
 |Version | IHL    | ToS (8ビット)    | Total Length   | ...  TTL ...
 +--------+--------+-----------------+----------------+
                    |<-DSCP 6bit->|ECN 2bit|
                    
 802.1Qタグ (トランク上のEthernetフレーム)
 +---------------+-----+-----+-------------+
 | TPID 0x8100   | PCP | DEI | VLAN ID     |
 +---------------+-----+-----+-------------+
                  ↑ 3ビット = CoS (0〜7)
```

| 項目 | DSCP | CoS |
|---|---|---|
| 層 | L3（IPヘッダ） | L2（802.1Qタグ） |
| 場所 | ToSバイトのうち **6ビット** | 802.1QタグのPCPフィールド **3ビット** |
| 値の範囲 | 0〜63 | 0〜7 |
| 有効範囲 | **ネットワーク全体**（ルータを越えても残る） | **トランク上だけ**（ルータを越えるとL2ヘッダは付け替えられる） |
| 音声の典型値 | **EF（46）** | **5** |

**CoSの代表的な値**

| CoS | 用途 |
|---|---|
| 0 | デフォルト（ベストエフォート、通常の通信） |
| 3 | 音声の呼制御（シグナリング） |
| **5** | **音声（ペイロード）** |
| 6・7 | ネットワーク制御用に予約（通常のユーザー通信には使わない） |

**DSCPの代表的な値**

| 名前 | 値 | 用途 |
|---|---|---|
| DF（Default / BE） | 0 | ベストエフォート |
| AF41 | 34 | ビデオ会議など |
| CS3 | 24 | 呼制御（シグナリング） |
| **EF** | **46** | **音声**（Expedited Forwarding：優先転送） |

マーキングに使えない・関係ないフィールド:

- **TTL**: パケットが経由できるルータの数を制限するフィールド（ルーティングループ対策）。優先度ではない。
- **送信元ポート番号**: TCP/UDPヘッダの項目。**分類の条件** には使えるが、優先度を書き込むフィールドではない。

### 8.5 トラストバウンダリ（信頼の境界）

受信したパケットに付いているマーキング（CoSやDSCP）を **信頼する範囲の境目** を **トラストバウンダリ** と呼びます。一般的には **ネットワークの端（IP電話や、端末を接続するアクセススイッチ）** に置きます。できるだけ端末に近い場所で分類・マーキングし、それより内側ではその値を信頼します。

```
   [PC] ─── [IP電話] ─── [アクセススイッチ] ─── [ディストリビューション] ─── [コア]
   信頼しない  ↑ ここが境界              ここから内側はマーキングを信頼して処理するだけ
  (上書き)   音声に CoS 5 を付ける
```

- **PCのマーキングを信頼しない理由**: 利用者がOSの設定で自分の通信を勝手に最優先（EFなど）にできてしまうからです。電話の先につながるPCのマーキングは信頼せず、上書き（通常は0に）します。
- **Cisco IP電話を接続したポート** では、電話を信頼の境目にすることが多いです（CDPで電話を検出したときだけ信頼する設定など）。
- **コア層に置かない理由**: コア層は高速転送に専念する場所です。そこまで信頼できないマーキングが届くと、途中の機器（アクセス・ディストリビューション）で正しく扱えません。
- **どこにも置かない（すべて信頼）のは誤り**: 不正なマーキングでQoSの設計が崩れます。

### 8.6 キューイング

インターフェースの送信が追いつかない（混雑している）とき、パケットは **送信キュー** に溜まります。キューイングは「どのキューのパケットを、どの順番・どの割合で送るか」を決めます。

| 方式 | 動作 | 特徴 |
|---|---|---|
| **FIFO** | 届いた順に送るだけ | 優先制御なし（既定の単純な方式） |
| **CBWFQ** | クラス（通信の種類）ごとにキューを分け、**最低限の帯域を保証** | 完全な優先送信はしない（音声も順番待ちが発生しうる） |
| **LLQ**（低遅延キューイング） | CBWFQ ＋ **完全優先キュー（PQ）** | 優先キューのパケットは **常に先に** 送られる。音声・ビデオ用 |

```
 LLQ の動作イメージ

  音声 (EF) ──> [優先キュー PQ] ──┐ ← 常に最初に送る（ただし上限帯域でポリシング）
  ビデオ ─────> [CBWFQ クラス1] ──┤
  業務 ───────> [CBWFQ クラス2] ──┼──> スケジューラ ──> 送信
  その他 ─────> [class-default] ──┘   (PQが空のとき、CBWFQの各クラスに
                                       保証帯域の比率で送信機会を配る)
```

**LLQの優先キューに上限がある理由**: 優先キューのパケットが常に先に送られるため、もし優先キューが帯域を使い切ると、他の通信がまったく送れなくなります（スタベーション）。これを防ぐため、優先キューで使える帯域には **上限（ポリシング）** が設けられています。

```
! LLQの設定例（MQC）
class-map match-any VOICE
 match dscp ef
class-map match-any VIDEO
 match dscp af41
!
policy-map WAN-EDGE
 class VOICE
  priority percent 20          ! 優先キュー（LLQ）。上限20%
 class VIDEO
  bandwidth percent 30         ! CBWFQ：最低30%を保証
 class class-default
  fair-queue
!
interface GigabitEthernet0/1
 service-policy output WAN-EDGE
```

### 8.7 輻輳回避：テールドロップとWRED

**テールドロップ**: インターフェースの送信キューが満杯になり、その後に届いたパケットが **すべて破棄** される状態です。キューの最後尾（テール）に入れられないので「テール」ドロップと呼びます。

**テールドロップの問題点（TCPグローバル同期）**:

```
 送信レート
   ^     /\      /\      /\        多数のTCP通信が同時にパケットを失う
   |    /  \    /  \    /  \       → 一斉に送信速度を落とす（回線がガラガラになる）
   |   /    \  /    \  /    \      → 一斉に速度を上げる → また同時にあふれる…
   |  /      \/      \/      \     
   +------------------------------> 時間       平均すると回線を効率よく使えない
```

**WRED**（Weighted Random Early Detection）: キューが満杯になる **前に**、**優先度の低いパケットから少しずつランダムに破棄** します。TCPの通信ごとに速度を落とすタイミングがばらけるので、グローバル同期を防げます。

- WREDは **輻輳回避** の仕組みで、キューイング方式（送信順を決める仕組み）ではありません。
- 「Weighted」は、DSCPなどの優先度に応じて破棄されやすさを変えることを意味します。

### 8.8 シェーピングとポリシング

どちらも通信量を **一定のレートに制限** する仕組みで、違いは **超過分の扱い** です。

| 項目 | ポリシング（policing） | シェーピング（shaping） |
|---|---|---|
| 超過分の扱い | **破棄**（または優先度を下げてマーキングし直す） | **バッファに溜めて遅らせて送る** |
| 遅延 | 増えない | 増える |
| パケットロス | 出る | 減る |
| バッファ | 使わない | 使う |
| 典型的な使用場所 | 受信側（ISPが契約帯域を超えた分を捨てる）、LLQの優先キュー上限 | 送信側（契約帯域を超えると破棄されるWAN回線へ送るとき） |

```
            ポリシング                         シェーピング
 レート  ^  ┌┐  ┌┐                   レート ^
        |  ││  ││ ← 超過分は切り捨て        |  ┌───────────┐ ← 超過分を後ろへずらして平準化
 CIR -- |--┼┼--┼┼------              CIR --|--┤           ├----
        |  ││  ││                          |  │           │
        +--┴┴--┴┴----> 時間                +--┴───────────┴--> 時間
```

**シェーピングがよく使われる場面**: 物理的には1Gbpsのインターフェースでも、WAN回線の契約が100Mbpsで、超過分をキャリア側でポリシング（破棄）されるようなケース。送る側で100Mbpsにシェーピングしておけば、キャリアに破棄される前に自分で平準化できます。

### ひっかけポイント・よくある誤解

- **QoSは帯域を増やさない**。暗号化（IPsec VPN）、故障時の切り替え（FHRP）でもない。
- **IPヘッダの優先度フィールドはDSCP**（ToSバイトの6ビット）。CoSは802.1QタグのL2フィールド（3ビット）でIPヘッダではない。TTLはループ対策、送信元ポートは分類の条件にはなるが優先度の書き込み先ではない。
- **超過分を溜めて遅らせるのはシェーピング**。ポリシングは破棄（または再マーキング）でバッファに溜めない。マーキングは印付け、分類は種類分け。
- **常に優先して送るのはLLQ**。FIFOは優先制御なし、CBWFQは最低帯域保証のみで完全優先ではない、WREDは輻輳回避でキューイング方式ではない。
- **トラストバウンダリはネットワークの端（IP電話・アクセススイッチ）**。コア層ではない、PCは信頼しない、すべて信頼するのも誤り。
- **キュー満杯で後続をすべて破棄＝テールドロップ**。WREDはその前にランダムに破棄して防ぐ仕組み。シェーピング、LLQとは別物。
- **音声の片方向遅延の目安は150ms**。1msは厳しすぎ、1秒・5秒は大きすぎ。
- **音声のCoSは5**（DSCPはEF 46）。0はベストエフォート、3は呼制御、7はネットワーク制御用に予約。

### 試験のポイント

- QoSの目的：混雑時に重要な通信（音声など）を優先。帯域は増えない。
- 音声の目安：片方向遅延 150ms以下、ジッタ 30ms以下、ロス 1%以下。帯域は小さい。
- マーキング：L3＝DSCP（6ビット、音声EF＝46）、L2＝CoS（3ビット、音声5、トランク上のみ）。
- トラストバウンダリはできるだけ端末に近い場所（IP電話・アクセススイッチ）。
- キューイング：FIFO（なし）、CBWFQ（帯域保証）、LLQ（CBWFQ＋優先キュー、上限あり）。
- テールドロップ → TCPグローバル同期 → WREDで回避。
- ポリシング＝破棄（遅延↑なし、ロスあり）、シェーピング＝遅延させて送る（ロス減、遅延↑）。

### 関連問題

- is-020（QoSの目的）
- is-021（DSCP）
- is-022（シェーピングとポリシング）
- is-023（LLQ）
- is-046（トラストバウンダリ）
- is-047（テールドロップ）
- is-048（音声の遅延の目安 150ms）
- is-049（音声のCoS値 5）

---

## 9. SSHとファイル転送（TFTP / FTP / SCP）

### 9.1 SSHとTelnet

ネットワーク機器をリモートから管理するには、TelnetかSSHを使います。

| 項目 | Telnet | SSH |
|---|---|---|
| ポート | TCP 23 | TCP 22 |
| 暗号化 | **なし**（パスワードもコマンドも平文） | **あり** |
| 推奨 | 使わない | 使う（SSHv2） |

### 9.2 SSHの設定手順

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

### 9.3 SSHの確認

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

### 9.4 ファイル転送プロトコルの比較

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

### 9.5 FTPの2つのコネクション

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

### 9.6 Cisco IOSでのファイルのコピー

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

### ひっかけポイント・よくある誤解

- **TFTP＝UDP 69・認証なし**。「TCP 20/21・ユーザー名とパスワードで認証」はFTP。暗号化するのはSFTP/SCP（TFTPもFTPも暗号化しない）。Web閲覧はHTTP/HTTPS。
- **バックアップは `copy running-config tftp`**（コピー元→コピー先）。`copy tftp running-config` は逆向きでマージ。`copy running-config startup-config` はNVRAMへの保存、`show running-config` は表示のみ。
- **SSHに必要なのは `ip domain-name` と `crypto key generate rsa`**（ホスト名とユーザーは別途）。`ip http server`、`service password-encryption` はSSHの有効化に不要。
- **SSHv2だけを許可するのは `ip ssh version 2`**（グローバル設定）。`transport input ssh` は接続方式（Telnet禁止）、`crypto key generate rsa` は鍵の作成、`ip domain-name` はドメイン名。
- **FTPの制御はTCP 21**。20はアクティブモードのデータ用。UDP 69はTFTP、TCP 22はSSH（SFTP・SCPも22）。
- **暗号化して安全にコピーするならSCP**。TFTPは認証も暗号化もなし、FTPはパスワードも平文、HTTPも暗号化されない。

### 試験のポイント

- SSHの設定：hostname → ip domain-name → crypto key generate rsa（SSHv2は768ビット以上）→ username → line vty（login local、transport input ssh）→ ip ssh version 2。
- `show ip ssh`：version 2.0＝v2のみ、1.99＝v1/v2両対応。
- TFTP（UDP 69、認証・暗号化なし）／FTP（TCP 20/21、認証あり・暗号化なし）／SCP・SFTP（TCP 22、認証・暗号化あり）。
- FTPは制御21・データ20（アクティブ）。パッシブはクライアントから接続するのでFWを越えやすい。
- `copy <元> <先>`。running（RAM）→ startup（NVRAM）で保存。

### 関連問題

- is-024（TFTPの特徴）
- is-025（copy running-config tftp）
- is-026（SSH有効化に必要な設定）
- is-050（FTPの制御ポート TCP 21）
- is-051（SCP）
- is-052（ip ssh version 2）

---

## 10. 問題別クイックリファレンス

| 問題ID | 問われていること | 正解 | 一言ポイント |
|---|---|---|---|
| is-001 | DHCPメッセージの順番 | DISCOVER → OFFER → REQUEST → ACK | 「DORA」。ACKを受けてから使用開始 |
| is-002 | 1つのグローバルIPを多数で共有する変換方式 | PAT（NATオーバーロード） | IP＋ポート番号で区別。`overload` |
| is-003 | 時刻を同期するプロトコル | NTP | UDP 123。ログの時系列突き合わせに必須 |
| is-004 | 社内PCの変換前アドレスのNAT用語 | 内部ローカルアドレス（inside local） | inside/outside＝どちら側、local/global＝どこから見たか |
| is-005 | インターネット側インターフェースのNAT設定 | `ip nat outside` | LAN側は `ip nat inside`。逆にすると変換されない |
| is-006 | NATの変換状況の確認コマンド | `show ip nat translations` | 統計は `show ip nat statistics` |
| is-007 | Webサーバを固定アドレスで公開する設定 | `ip nat inside source static 192.168.1.10 203.0.113.10` | inside local → inside global の順 |
| is-008 | `ip helper-address` の目的 | ブロードキャストのDHCPをユニキャストでサーバへ中継 | DHCPリレーエージェント。クライアント側IFに設定 |
| is-009 | `ip dhcp excluded-address` の目的 | 指定範囲を割り当て対象から除外 | グローバル設定。範囲指定は `network` |
| is-010 | DHCPで配布できる情報（2つ） | デフォルトゲートウェイ、DNSサーバ | MACアドレス・VLANは配布しない |
| is-011 | IFでDHCPからアドレスを取得するコマンド | `ip address dhcp` | サーバ＝pool、リレー＝helper、クライアント＝address dhcp |
| is-012 | ホスト名からIPアドレスを調べる仕組み | DNS | UDP 53。DNS → ARP → 送信の順 |
| is-013 | プロトコルとポート番号の正しい組み合わせ | SSH ― 22 | Telnet 23、SMTP 25、DNS 53、TFTP 69、NTP 123、SNMP 161 |
| is-014 | エージェントが自分から異常を通知するメッセージ | Trap | UDP 162。応答確認ありはInform |
| is-015 | 認証と暗号化に対応するSNMPバージョン | SNMPv3 | v1/v2cはコミュニティ名が平文 |
| is-016 | Syslogで最も重大度が高いレベル | レベル0（emergencies） | 数字が小さいほど深刻 |
| is-017 | `logging trap 4` で送られる範囲 | レベル0〜4 | 指定レベル以下の数字が対象 |
| is-018 | `ntp server 10.1.1.1` の意味 | ルータがNTPクライアントとして10.1.1.1から時刻取得 | 自分をサーバにするのは `ntp master` |
| is-019 | ストラタムの説明 | 値が小さいほど正確な時刻源に近い | 1段ごとに+1、16＝非同期 |
| is-020 | QoSの主な目的 | 混雑時に重要な通信を優先して送る | 帯域は増えない |
| is-021 | IPヘッダで優先度を示すフィールド | DSCP | ToSバイトの6ビット。音声はEF（46） |
| is-022 | 超過分をバッファに溜めて遅らせて送る仕組み | シェーピング | ポリシングは破棄 |
| is-023 | 遅延に弱い通信を常に優先するキューイング | LLQ（低遅延キューイング） | CBWFQ＋優先キュー（上限あり） |
| is-024 | TFTPの特徴 | UDP 69、ユーザー認証なし | FTPはTCP 20/21で認証あり |
| is-025 | 現在の設定をTFTPサーバへバックアップ | `copy running-config tftp` | copy 元 先。逆はマージ |
| is-026 | SSH有効化に必要な設定（2つ） | `ip domain-name example.com`、`crypto key generate rsa` | 鍵名は「ホスト名.ドメイン名」。v2は768ビット以上 |
| is-027 | ダイナミックNATの設定 | `ip nat inside source list 1 pool GLOBAL` | overload を付けるとプールPAT |
| is-028 | NAT設定でのACL 1 の役割 | 変換対象の社内側送信元アドレスを指定 | 許可・拒否のためではない |
| is-029 | プール3個で4台目が通信しようとすると | 変換できず通信できない | overload なしではポート共有しない |
| is-030 | 動的なNAT変換をすべて消去 | `clear ip nat translation *` | スタティックは消えない |
| is-031 | 最初にリース更新を要求するタイミング | リース期間の50%経過時（T1） | T2＝87.5%でブロードキャスト |
| is-032 | DHCPDISCOVERの送信元/宛先IP | 0.0.0.0 → 255.255.255.255 | ブロードキャストはルータを越えない |
| is-033 | DHCPのトランスポートとポート | UDP、サーバ67 / クライアント68 | アドレスがないのでTCPは使えない |
| is-034 | 貸し出し状況（MACとIPの対応）の確認 | `show ip dhcp binding` | pool＝使用状況、conflict＝重複 |
| is-035 | PCが169.254.10.20になった原因 | DHCPサーバからアドレスを取得できなかった | APIPA（169.254.0.0/16） |
| is-036 | IPv6アドレスを登録するDNSレコード | AAAAレコード | AはIPv4、MXはメール、CNAMEは別名 |
| is-037 | 打ち間違いの名前解決を止めるコマンド | `no ip domain-lookup` | `no ip name-server` では止まらない |
| is-038 | SNMPの問い合わせとTrapの宛先ポート | 問い合わせ UDP 161 / Trap UDP 162 | 514はSyslog |
| is-039 | `snmp-server community MONITOR ro` でできること | 情報の読み取りのみ | rwでSetも可能。Trap先は `snmp-server host` |
| is-040 | MIB項目を一意に識別する番号 | OID（オブジェクトID） | 例 1.3.6.1.2.1.1.5.0 |
| is-041 | `%LINEPROTO-5-UPDOWN` の「5」 | 重大度レベル（5＝notifications） | 形式は %ファシリティ-重大度-ニーモニック |
| is-042 | ログをRAMに保存し `show logging` で見る設定 | `logging buffered` | 再起動で消える |
| is-043 | SSHの画面にログを表示させる | `terminal monitor` | 特権EXEC。保存されない |
| is-044 | ログに日時（ミリ秒まで）を付ける設定 | `service timestamps log datetime msec` | NTPと組み合わせて時系列分析 |
| is-045 | stratum 3 のルータの同期先のストラタム | 2 | 自分＝同期先＋1 |
| is-046 | トラストバウンダリを置く場所 | ネットワークの端（IP電話・アクセススイッチ） | PCのマーキングは信頼しない |
| is-047 | キュー満杯で後続をすべて破棄する状態 | テールドロップ | WREDで回避（グローバル同期を防ぐ） |
| is-048 | 音声の片方向遅延の上限の目安 | 150ミリ秒 | ジッタ30ms、ロス1% |
| is-049 | 音声に付けるCoS値 | 5 | DSCPはEF（46）。3は呼制御 |
| is-050 | FTPの制御用コネクションのポート | TCP 21 | 20はアクティブモードのデータ用 |
| is-051 | 暗号化して安全にファイルをコピー | SCP | SSH（TCP 22）上で認証・暗号化 |
| is-052 | SSHv2だけを許可するグローバル設定 | `ip ssh version 2` | show ip ssh で version 2.0 と表示 |
