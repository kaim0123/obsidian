---
title: L2セキュリティ（ポートセキュリティ・DHCPスヌーピング・DAI）
created: 2026-10-18
tags:
  - インフラ
  - サーバーセキュリティ
  - ネットワーク
---

# L2セキュリティ（ポートセキュリティ・DHCPスヌーピング・DAI）

[[MOC_サーバー・インフラ体系|📚 目次]] ｜ [[08_ACL（アクセスコントロールリスト）|← 前へ]] ｜ [[10_VPN（サイト間・リモートアクセス・IPsec・GRE）|次へ →]]

> [!abstract] この記事で分かること
> - スイッチ（L2）を狙う攻撃（MACフラッディング・DHCP スタベーション／スプーフィング・ARP スプーフィング・VLAN ホッピング）と対策の対応
> - ポートセキュリティの設定（maximum・sticky・violation）と err-disabled からの復旧
> - DHCP スヌーピングの trusted / untrusted とバインディングテーブル
> - ダイナミック ARP インスペクション（DAI）と BPDU ガード
>
> **前提**：[[16ルーターとスイッチとハブとNAT]] と [[06_DHCPとNTP（インフラを支えるネットワークサービス）]] を読んでいると理解しやすいです。

スイッチ（レイヤー2）は、社内の端末が直接つながる場所です。社内に入り込んだ攻撃者や不正な機器は、まずL2の仕組みを悪用します。このノートでは「攻撃」と「対策機能」を対応させて学びます。

## 1. L2攻撃と対策の対応表

| 攻撃 | 手口 | 被害 | 主な対策 |
|---|---|---|---|
| MACフラッディング | 送信元MACを次々に変えた大量のフレームでMACアドレステーブルをあふれさせる | スイッチがハブのようにフラッディング → 盗聴 | **ポートセキュリティ**（学習できるMAC数の制限） |
| DHCPスタベーション | 偽のMACで大量の DHCPDISCOVER → アドレスを使い切らせる | 正規の端末がIPをもらえない（DoS） | **DHCPスヌーピング**（レート制限）、ポートセキュリティ |
| DHCPスプーフィング | 偽のDHCPサーバとして応答し、偽のゲートウェイ/DNSを配る | 通信を攻撃者経由にされる（中間者攻撃） | **DHCPスヌーピング**（untrustedポートのサーバ応答を破棄） |
| ARPスプーフィング | 「ゲートウェイのIPは自分のMACだ」という偽ARPを送る | 通信を攻撃者に引き寄せる（中間者攻撃） | **DAI**（ダイナミックARPインスペクション） |
| VLANホッピング（スイッチスプーフィング） | DTPで交渉してトランクを作る | 全VLANにアクセス | アクセスポートに固定・**DTP無効**（`switchport nonegotiate`） |
| VLANホッピング（ダブルタギング） | 外側にネイティブVLAN、内側に標的VLANのタグを付ける | 別のVLANへフレームを送り込む | **ネイティブVLANを未使用VLANに変更** |
| 不正なスイッチの接続（STP操作） | PortFastのポートでBPDUを送る | ルートブリッジの乗っ取りなど | **BPDUガード** |

## 2. MACフラッディングとポートセキュリティ

### MACフラッディング

スイッチはMACアドレステーブルを使って、宛先MACのあるポートだけにフレームを転送します。テーブルの容量には上限があります。

```
攻撃者がランダムな送信元MACのフレームを大量に送る
  aa:01 → ... aa:02 → ... aa:03 → ... （数万個）
           │
           v
  MACアドレステーブルが満杯 → 新しい宛先を学習できない
           │
           v
  宛先不明のフレーム（ユニキャストフラッディング）を全ポートへ送る ＝ ハブ状態
           │
           v
  攻撃者のポートにも他人の通信が届く → 盗聴できる
```

「送信元MACアドレスを次々に変えた大量のフレームで、MACアドレステーブルをあふれさせる」は**MACフラッディング**です。対策は**ポートセキュリティ**で、1つのポートで学習できるMACアドレスの数を制限します。

### ポートセキュリティの基本

**ポートセキュリティ**は、スイッチのポートに接続できる端末を**MACアドレスで制限**する機能です。許可するMACアドレスや、その数を制限します。許可していないMACアドレスの端末がつながると**違反**として扱います。

```
SW(config)# interface g0/1
SW(config-if)# switchport mode access                          ! ① アクセスポートにする（必須）
SW(config-if)# switchport port-security                        ! ② 機能を有効化（必須）
SW(config-if)# switchport port-security maximum 2              ! 許可するMACの数（デフォルト1）
SW(config-if)# switchport port-security mac-address sticky     ! 学習したMACを設定に自動追加
SW(config-if)# switchport port-security violation restrict     ! 違反時の動作（デフォルト shutdown）
```

- ポートセキュリティを使うには、ポートを**アクセスポート**（`switchport mode access`）にして、`switchport port-security` で**機能を有効**にする必要がある（DTPのdynamicモードのままではコマンドが拒否される）。
- 許可する数は `switchport port-security maximum` で指定。**デフォルトは1**。
- 静的に登録するなら `switchport port-security mac-address 0011.2233.4455`。

### sticky

`switchport port-security mac-address sticky` は、ポートで**学習したMACアドレスを、許可するアドレスとして running-config に自動で追加**します。1台ずつ手動で登録する手間が省けます。

```
SW# show running-config interface g0/1
interface GigabitEthernet0/1
 switchport mode access
 switchport port-security
 switchport port-security mac-address sticky
 switchport port-security mac-address sticky 0011.2233.4455    ← 自動で追加された
```

- running-config に書き込まれるので、`copy running-config startup-config` で保存すれば**再起動後も維持**される（保存しなければ再起動で消える）。
- 許可する**数**とは無関係（数は `maximum`）。
- err-disabled からの**自動復旧**とは無関係（それは `errdisable recovery`）。
- MACアドレステーブルの**エージング（保持時間）**とは無関係。

### 違反時の動作（violation モード）

| モード | ポート | フレーム | ログ（syslog/SNMP） | 違反カウンタ |
|---|---|---|---|---|
| **shutdown**（デフォルト） | **停止（err-disabled）** | 破棄 | 出す | 増える |
| restrict | 止めない | 破棄 | 出す | 増える |
| protect | 止めない | 破棄 | **出さない** | 増えない |

覚え方：「ポートを止めるか」「ログを出すか」の2軸。

```
            ポートを止める   ログを出す
shutdown         ◯              ◯
restrict         ✕              ◯
protect          ✕              ✕
```

`sticky` は違反時の動作ではなく、学習したMACを設定に保存する機能です。

### 状態の確認

```
SW# show port-security interface g0/1
Port Security              : Enabled
Port Status                : Secure-shutdown
Violation Mode             : Shutdown
Aging Time                 : 0 mins
Aging Type                 : Absolute
SecureStatic Address Aging : Disabled
Maximum MAC Addresses      : 1
Total MAC Addresses        : 1
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 1
Last Source Address:Vlan   : 00aa.bbcc.ddee:10
Security Violation Count   : 1

SW# show interfaces status
Port      Name   Status       Vlan  Duplex  Speed Type
Gi0/1            err-disabled 10    auto    auto  10/100/1000BaseTX
```

### err-disabled からの復旧

shutdown モードで違反すると、ポートは **err-disabled** 状態になります。

```
%PM-4-ERR_DISABLE: psecure-violation error detected on Gi0/1, putting Gi0/1 in err-disable state
%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 00aa.bbcc.ddee on port GigabitEthernet0/1.
```

手動での復旧手順:

```
① 原因を取り除く（許可していない端末を外す、または許可設定を見直す）
② SW(config)# interface g0/1
   SW(config-if)# shutdown          ← いったん管理的に無効にする
   SW(config-if)# no shutdown       ← 有効にすると err-disabled が解除される
```

- **no shutdown だけでは復旧しない**。先に shutdown が必要。
- `clear mac address-table` は MACアドレステーブルを消すだけで、err-disabled は解除されない。
- 自動復旧（`errdisable recovery`）を設定していなければ、**自動では復旧しない**。
- **原因を取り除かずに復旧させると、すぐにまた違反**になる。

自動復旧の設定:

```
SW(config)# errdisable recovery cause psecure-violation
SW(config)# errdisable recovery interval 300         ! 300秒後に自動復旧（デフォルトも300秒）
```

## 3. DHCPスタベーションとDHCPスプーフィング

```
【ステップ1：DHCPスタベーション（枯渇攻撃）】
 攻撃者 ── DHCPDISCOVER（偽MAC #1）──> 正規DHCPサーバ  → 10.0.0.10 を貸し出す
        ── DHCPDISCOVER（偽MAC #2）──>                → 10.0.0.11 を貸し出す
        ── ...（数百〜数千回）       ──>                → アドレスプールが空に
 → 正規の端末がアドレスをもらえない（DoS）

【ステップ2：DHCPスプーフィング（偽DHCPサーバ）】
 新しいPC ── DHCPDISCOVER ──> （正規サーバは枯渇して応答できない）
 攻撃者   ── DHCPOFFER：IP=10.0.0.50, GW=攻撃者のIP, DNS=攻撃者のIP ──> 新しいPC
 → PCの通信はすべて攻撃者を経由する（中間者攻撃）
```

「偽のMACアドレスで大量の DHCPDISCOVER を送り、アドレスを使い切らせる」は**DHCPスタベーション**。偽のDHCPサーバとして応答するのは**DHCPスプーフィング**で、スタベーションはその準備にもなります。

対策: **DHCPスヌーピング**（偽サーバの遮断、DHCPメッセージのレート制限）と**ポートセキュリティ**（1ポートの偽MACの数を制限）。

## 4. DHCPスヌーピング

### 仕組み

DHCPスヌーピングは、スイッチのポートを **trusted（信頼）** と **untrusted（非信頼）** に分け、**untrusted ポートから届いたDHCPサーバの応答（OFFER/ACK など）を破棄**します。

```
                    ┌──────────── スイッチ（DHCPスヌーピング有効） ────────────┐
正規DHCPサーバ ── Gi0/24 [trusted]   ← OFFER/ACK を受け付ける                     │
                    │                                                          │
PC-A ──────────── Gi0/1  [untrusted] ← DISCOVER/REQUEST は通す                 │
攻撃者（偽サーバ）── Gi0/2  [untrusted] ← OFFER/ACK が来たら破棄 ✕               │
                    └──────────────────────────────────────────────────────────┘
```

| ポート | 設定 | 理由 |
|---|---|---|
| 正規のDHCPサーバにつながるポート（アップリンクなど） | **trusted** | サーバの応答を受け付けるため |
| 一般ユーザーのPCがつながるポート | untrusted（デフォルトのまま） | 不正なDHCPサーバがつながっても、その応答を破棄できる |

- **すべて trusted** にすると、不正なDHCPサーバを防げない。
- DHCPスヌーピングを有効にすると、デフォルトで**すべて untrusted** になる。どのポートも trusted にしないと、**正規のサーバの応答も届かなくなる**。

さらに、DHCPスヌーピングは「どのポートの、どのMACアドレスに、どのIPアドレスが割り当てられたか」を記録した**バインディングテーブル**を作ります。これがDAIなどで使われます。

```
SW# show ip dhcp snooping binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
00:11:22:33:44:55   10.0.10.21       86250       dhcp-snooping   10    GigabitEthernet0/1
00:11:22:33:44:66   10.0.10.22       86100       dhcp-snooping   10    GigabitEthernet0/3
Total number of bindings: 2
```

### 設定

```
SW(config)# ip dhcp snooping                         ! ① 機能の有効化（グローバル）
SW(config)# ip dhcp snooping vlan 10                 ! ② 対象のVLANを指定（これがないとどのVLANでも動かない）
SW(config)# interface g0/24
SW(config-if)# ip dhcp snooping trust                ! ③ 正規のDHCPサーバの方向のポートだけ trusted
SW(config)# interface range g0/1 - 23
SW(config-if-range)# ip dhcp snooping limit rate 10  ! （任意）untrustedポートのDHCPメッセージを毎秒10個に制限＝スタベーション対策
```

```
SW# show ip dhcp snooping
Switch DHCP snooping is enabled
DHCP snooping is configured on following VLANs:
10
...
Interface                  Trusted    Allow option    Rate limit (pps)
-----------------------    -------    ------------    ----------------
GigabitEthernet0/24        yes        yes             unlimited
GigabitEthernet0/1         no         no              10
```

DHCPスヌーピングを動かすには「`ip dhcp snooping vlan 10` のように対象のVLANを指定する」ことが必要です。

| 誤答 | 理由 |
|---|---|
| すべてのポートで `ip dhcp snooping trust` | 不正なDHCPサーバを防げない。trust は正規サーバ側のポートだけ |
| `ip arp inspection vlan 10` | DAIの設定。DHCPスヌーピングを働かせるものではない |
| `switchport port-security` | ポートセキュリティの設定。別の機能 |

> 補足: レート制限を超えたポートは err-disabled になります（`errdisable recovery cause dhcp-rate-limit` で自動復旧可能）。

## 5. ダイナミックARPインスペクション（DAI）

### ARPスプーフィング（ARPポイズニング）

```
正常:   PC-A の ARPキャッシュ   10.0.10.1（GW） → GWのMAC（00:aa:...:01）

攻撃:   攻撃者 ── 偽のARP応答「10.0.10.1 は 00:bb:...:99（攻撃者のMAC）です」──> PC-A
        PC-A の ARPキャッシュ   10.0.10.1（GW） → 攻撃者のMAC   ← 書き換えられた
        → PC-A がゲートウェイに送るつもりのフレームは攻撃者に届く（中間者攻撃）
```

### DAIの仕組み

DAIは、untrusted ポートで受信したARPに書かれた「**IPアドレスとMACアドレスの組み合わせ**」を、**DHCPスヌーピングのバインディングテーブル**と照合し、一致しなければ破棄します。

```
受信したARP： 送信元IP 10.0.10.1 / 送信元MAC 00:bb:...:99（Gi0/2）
バインディングテーブル： 10.0.10.1 と 00:bb:...:99 の組み合わせは存在しない
→ 破棄＋ログ
```

| 選択肢 | なぜ参照先にならないか |
|---|---|
| **DHCPスヌーピングのバインディングテーブル** | ◯ IPとMACの対応が記録されている |
| MACアドレステーブル | スイッチの転送用の表。MACとポートの対応で、**IPアドレスとの対応は記録されていない** |
| ルーティングテーブル | ルータが宛先ネットワークへの経路を決める表 |
| NATテーブル | アドレス変換の対応表 |

そのため、**DAIを使うには先にDHCPスヌーピングを有効にしておく必要**があります（静的IPの機器はARP ACLで許可する）。

```
SW(config)# ip dhcp snooping
SW(config)# ip dhcp snooping vlan 10
SW(config)# ip arp inspection vlan 10                ! DAIを有効化
SW(config)# interface g0/24
SW(config-if)# ip dhcp snooping trust
SW(config-if)# ip arp inspection trust               ! アップリンクは DAI でも trusted
```

```
SW# show ip arp inspection vlan 10
 Vlan     Configuration    Operation   ACL Match          Static ACL
 ----     -------------    ---------   ---------          ----------
   10     Enabled          Active
```

## 6. VLANホッピングとその対策

VLANホッピングは、本来アクセスできない別のVLANの通信に入り込む攻撃で、2つの手口があります。

### ①スイッチスプーフィング

```
攻撃者PC ── DTP「トランクにしよう」──> スイッチのポート（dynamic auto/desirable のまま）
         <── トランク成立 ──
→ 攻撃者PCがすべてのVLANのフレームを送受信できる
```

対策: 端末用のポートを**アクセスポートに固定**し、**DTPを無効**にする。

```
SW(config)# interface range g0/1 - 23
SW(config-if-range)# switchport mode access
SW(config-if-range)# switchport nonegotiate     ! DTPフレームを送らない
```

### ②ダブルタギング（二重タグ）

```
攻撃者（VLAN 1 = ネイティブVLANのアクセスポート）
  送信フレーム: [外側タグ VLAN1][内側タグ VLAN20][データ]
      │
  SW1: 外側タグ＝ネイティブVLAN(1) → トランクではネイティブVLANはタグなしで送るので「外側タグを外す」
      │  トランク上: [内側タグ VLAN20][データ]
      v
  SW2: VLAN20 のタグ付きフレームとして受信 → VLAN20 の被害者へ転送
  ※ 一方向の攻撃（応答は返ってこない）
```

対策: トランクの**ネイティブVLANを、どの端末も使っていない未使用のVLANに変更**する。

```
SW(config)# vlan 999
SW(config-vlan)# name UNUSED_NATIVE
SW(config)# interface g0/24
SW(config-if)# switchport mode trunk
SW(config-if)# switchport trunk native vlan 999
SW(config-if)# switchport nonegotiate
```

| 選択肢 | 判定 |
|---|---|
| 端末用ポートをアクセスに固定しDTPを無効 | ◯ |
| ネイティブVLANを未使用のVLANに変更 | ◯ |
| ネイティブVLANをデフォルトのVLAN 1のまま | ✕ VLAN 1は初期状態で全ポートが所属しており、攻撃に利用されやすい |
| すべてのポートをトランクにする | ✕ 端末が複数VLANの通信にアクセスできてしまう |

その他のベストプラクティス：未使用のポートは shutdown して未使用VLANに割り当てる、VLAN 1を業務に使わない。

## 7. BPDUガード

**BPDUガード**は、PortFastを設定したポート（端末用）でBPDU（STPの制御フレーム）を受信したら、ポートを err-disabled にして停止する機能です。不正なスイッチの接続やSTPの乗っ取りを防ぎます。

```
SW(config-if)# spanning-tree portfast
SW(config-if)# spanning-tree bpduguard enable
```

## 8. 機能の比較まとめ

| 機能 | 何を防ぐか | 見るもの |
|---|---|---|
| **ポートセキュリティ** | 許可されていない端末の接続、MACフラッディング | 送信元MACアドレス・MACの数 |
| DHCPスヌーピング | 不正なDHCPサーバ、DHCPスタベーション | DHCPメッセージの種類と受信ポート（trusted/untrusted） |
| BPDUガード | PortFastポートへのスイッチ接続 | BPDUの受信 |
| ダイナミックARPインスペクション | ARPのなりすまし | ARPのIP/MACの組とバインディングテーブル |

## ひっかけポイント・よくある誤解

- MACで端末を制限するのは**ポートセキュリティ**。DHCPスヌーピング・BPDUガード・DAIと機能を混同しない。
- 違反時のデフォルトは **shutdown**（err-disabled）。restrict＝止めない・ログあり、protect＝止めない・ログなし。**sticky は違反モードではない**。
- sticky は「学習したMACを running-config に追加」。数の制限（maximum、デフォルト1）、自動復旧（errdisable recovery）、エージングとは無関係。保存しないと再起動で消える。
- err-disabled は **shutdown → no shutdown**。no shutdown だけ、clear mac address-table では戻らない。自動復旧は設定しない限り行われない。
- DHCPスヌーピングの trusted は**正規のDHCPサーバ側だけ**。全部 trusted は無意味、どこも trusted にしないと正規の応答も届かない。
- DHCPスヌーピングは `ip dhcp snooping` だけでは動かない。**`ip dhcp snooping vlan`** が必要。`ip arp inspection vlan` はDAI。
- DAIの参照先は**DHCPスヌーピングのバインディングテーブル**（MACアドレステーブルにはIPの情報がない）。
- MACフラッディング（テーブルをあふれさせる）、ARPスプーフィング（IPのなりすまし）、DHCPスタベーション（アドレス枯渇）、DHCPスプーフィング（偽サーバ）、VLANホッピング（別VLANへの侵入）を区別する。
- VLANホッピング対策は「アクセス固定＋DTP無効」「ネイティブVLANを未使用VLANに」。VLAN 1のまま・全ポートトランクは逆効果。

## 押さえておくポイント

- ポートセキュリティ：`switchport mode access` → `switchport port-security` → `maximum`（既定1）／`mac-address sticky`／`violation {shutdown|restrict|protect}`（既定shutdown）。
- err-disabled の復旧：原因除去 → `shutdown` → `no shutdown`。自動は `errdisable recovery cause psecure-violation`。確認は `show port-security interface`、`show interfaces status`。
- DHCPスヌーピング：`ip dhcp snooping` → `ip dhcp snooping vlan X` → 正規サーバ側に `ip dhcp snooping trust`。`limit rate` でスタベーション対策。バインディングテーブルを作る。
- DAIはバインディングテーブルを参照 → DHCPスヌーピングが前提。
- VLANホッピング：スイッチスプーフィング（DTP）とダブルタギング（ネイティブVLAN）。

## 関連ノート

- [[16ルーターとスイッチとハブとNAT]] — スイッチと MAC アドレステーブルの基本
- [[06_DHCPとNTP（インフラを支えるネットワークサービス）]] — DHCP の仕組み（DISCOVER / OFFER / REQUEST / ACK）
- [[07_AAA（RADIUS・TACACS+・802.1X）]] — 802.1X によるポートベースの認証
- [[08_ACL（アクセスコントロールリスト）]] — L3 での通信制御
- [[01_サーバーセキュリティの基本]] — 多層防御の全体像
