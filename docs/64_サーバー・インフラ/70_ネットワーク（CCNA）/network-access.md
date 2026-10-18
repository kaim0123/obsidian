# ネットワークアクセス 解説

- 分野: ネットワークアクセス（Network Access）
- CCNA 200-301 v1.1 における出題比率: **20%**
- 本書の収録問題数: **49問**（na-001 〜 na-049）

この解説書は、アプリに収録されている「ネットワークアクセス」分野の全問題を解くために必要な知識を、トピック別に体系立てて説明するものです。問題を順番に並べるのではなく、「スイッチがフレームを転送するしくみ」から始めて、VLAN、トランク、隣接機器の検出、STP、EtherChannel、無線LAN、機器の管理アクセスへと、学習しやすい順に並べています。

各章は次の構成です。

- **本文**: 基礎から、なぜそうなるのかまで説明します。表・IOSコマンド例・出力例・図を多く使っています。
- **ひっかけポイント・よくある誤解**: 問題の不正解の選択肢から読み取れる、間違えやすい点です。
- **試験のポイント**: 覚えておくべき要点です。
- **関連問題**: その章で扱っている問題のIDです。

巻末の「問題別クイックリファレンス」には、全問題の正解と要点をID順にまとめています。

---

## 目次

1. [L2スイッチの転送のしくみとMACアドレステーブル](#1-l2スイッチの転送のしくみとmacアドレステーブル)
2. [VLANの基礎](#2-vlanの基礎)
3. [アクセスポートの設定と確認](#3-アクセスポートの設定と確認)
4. [ボイスVLAN](#4-ボイスvlan)
5. [トランクと IEEE 802.1Q](#5-トランクと-ieee-8021q)
6. [ネイティブVLANとその不一致](#6-ネイティブvlanとその不一致)
7. [トランクの許可VLANと確認コマンド](#7-トランクの許可vlanと確認コマンド)
8. [DTP（Dynamic Trunking Protocol）](#8-dtpdynamic-trunking-protocol)
9. [VLAN間ルーティング（ルータオンアスティックとSVI）](#9-vlan間ルーティングルータオンアスティックとsvi)
10. [CDPとLLDP（隣接機器の検出）](#10-cdpとlldp隣接機器の検出)
11. [STPの目的とL2ループの問題](#11-stpの目的とl2ループの問題)
12. [ルートブリッジの選出とブリッジID](#12-ルートブリッジの選出とブリッジid)
13. [パスコストとポートの役割の決定](#13-パスコストとポートの役割の決定)
14. [STPのポートの状態とタイマー](#14-stpのポートの状態とタイマー)
15. [PortFastとSTPの保護機能（BPDUガード・ルートガード・ループガード・BPDUフィルタ）](#15-portfastとstpの保護機能)
16. [RSTP と Rapid PVST+](#16-rstp-と-rapid-pvst)
17. [EtherChannel の基礎](#17-etherchannel-の基礎)
18. [LACP・PAgP・on モード](#18-lacppagpon-モード)
19. [EtherChannel の設定・確認・トラブルシューティング（L2/L3）](#19-etherchannel-の設定確認トラブルシューティングl2l3)
20. [無線LANのアーキテクチャ（自律型・コントローラ型・クラウド型）](#20-無線lanのアーキテクチャ)
21. [CAPWAP とライトウェイトAP](#21-capwap-とライトウェイトap)
22. [APのモード（ローカル・FlexConnect・モニターほか）](#22-apのモード)
23. [AP・WLCを接続するスイッチポートの設定](#23-apwlcを接続するスイッチポートの設定)
24. [WLCのGUIによるWLAN設定とQoSプロファイル](#24-wlcのguiによるwlan設定とqosプロファイル)
25. [機器の管理アクセス（コンソール・Telnet/SSH・HTTP/HTTPS・クラウド管理）](#25-機器の管理アクセス)
26. [問題別クイックリファレンス](#26-問題別クイックリファレンス)

---

## 1. L2スイッチの転送のしくみとMACアドレステーブル

### 1.1 L2スイッチは「MACアドレス」で転送先を決める

L2スイッチ（以下、スイッチ）は、OSI参照モデルのデータリンク層（レイヤー2）で動作する機器です。スイッチが扱う単位は**イーサネットフレーム**で、フレームの先頭には宛先MACアドレスと送信元MACアドレスがあります。

```
 イーサネットフレーム（Ethernet II）の構造
+------------+------------+--------+-----------------------+-----+
| 宛先MAC    | 送信元MAC  | タイプ | データ（IPパケットなど）| FCS |
| 6バイト    | 6バイト    | 2バイト| 46〜1500バイト         | 4B  |
+------------+------------+--------+-----------------------+-----+
```

スイッチは、受信したフレームをどのポートから送り出すかを、**MACアドレステーブル**（CAMテーブルとも呼ばれます）を参照して決めます。MACアドレステーブルは「MACアドレス ↔ ポート（とVLAN）」の対応表です。

機器ごとに「転送先を決めるために見る表」は異なります。ここを混同しないことが重要です。

| 表 | 主に使う機器 | 何と何の対応か | 用途 | 確認コマンド |
|---|---|---|---|---|
| **MACアドレステーブル** | L2スイッチ | MACアドレス ↔ ポート（VLAN） | フレームの転送先ポートを決める | `show mac address-table` |
| ルーティングテーブル | ルータ、L3スイッチ | 宛先ネットワーク ↔ ネクストホップ／出力インターフェース | パケットの転送先を決める（L3） | `show ip route` |
| ARPテーブル | PC、ルータ | IPアドレス ↔ MACアドレス | 宛先IPに対応するMACアドレスを調べた結果を保存 | `show ip arp`、`arp -a` |
| NATテーブル | NATを行うルータ | プライベートIP ↔ グローバルIP | アドレス変換の状況を記録 | `show ip nat translations` |

### 1.2 スイッチの5つの動作：学習・転送・フラッディング・フィルタリング・エージング

スイッチがフレームを受信したときの動作は次のとおりです。

1. **学習（Learning）**: 受信したフレームの**送信元MACアドレス**と、**受信したポート**の組み合わせをMACアドレステーブルに登録します。
2. **転送（Forwarding）**: フレームの**宛先MACアドレス**でMACアドレステーブルを検索し、見つかればそのポートだけに送ります。
3. **フラッディング（Flooding）**: 宛先MACアドレスがテーブルにない（未知のユニキャスト）場合、またはブロードキャスト（FF:FF:FF:FF:FF:FF）の場合は、**受信ポート以外の、同じVLANの全ポート**に送ります。
4. **フィルタリング（Filtering）**: 宛先MACアドレスが受信ポートと同じポートに登録されている場合は、フレームを送り出さずに破棄します。
5. **エージング（Aging）**: 一定時間（Ciscoのデフォルトは300秒）そのMACアドレスからのフレームを受信しなければ、テーブルから消します。

「学習は送信元」「転送の判断は宛先」という点がポイントです。

```
          PC-A (aaaa.aaaa.aaaa)          PC-B (bbbb.bbbb.bbbb)
               |                               |
             Fa0/1                           Fa0/2
          +------------------------------------------+
          |                 SW1                       |
          +------------------------------------------+
                            Fa0/3
                              |
                    PC-C (cccc.cccc.cccc)

 ① PC-A → PC-B 宛てのフレームを Fa0/1 で受信
    → 送信元 aaaa.aaaa.aaaa を Fa0/1 として学習
    → 宛先 bbbb.bbbb.bbbb はテーブルにない → Fa0/2 と Fa0/3 にフラッディング
 ② PC-B が返信（送信元 bbbb.bbbb.bbbb）を Fa0/2 から送る
    → bbbb.bbbb.bbbb を Fa0/2 として学習
    → 宛先 aaaa.aaaa.aaaa は Fa0/1 にあると分かっている → Fa0/1 だけに転送
```

### 1.3 MACアドレステーブルの確認

```
SW1# show mac address-table
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    aaaa.aaaa.aaaa    DYNAMIC     Fa0/1
   1    bbbb.bbbb.bbbb    DYNAMIC     Fa0/2
  10    cccc.cccc.cccc    DYNAMIC     Fa0/3
Total Mac Addresses for this criterion: 3
```

- `DYNAMIC` は、受信したフレームから自動で学習したエントリです。
- `STATIC` は、手動設定や、ポートセキュリティの sticky 学習などで登録したエントリです。
- テーブルは**VLANごと**に管理されています。同じスイッチでも、VLANが違えばフラッディングの範囲も違います。

便利な関連コマンド：

```
SW1# show mac address-table dynamic
SW1# show mac address-table address aaaa.aaaa.aaaa
SW1# show mac address-table interface fa0/1
SW1# clear mac address-table dynamic
```

### ひっかけポイント・よくある誤解

- **「スイッチはルーティングテーブルを見て転送する」は誤り。** ルーティングテーブルは宛先IPアドレスから転送先を決めるL3の表で、ルータやL3スイッチが使います。
- **ARPテーブルはIPアドレスとMACアドレスの対応表**で、PCやルータが「このIPアドレスの相手のMACアドレスは何か」を保存しておくものです。スイッチがフレームの転送先ポートを決めるための表ではありません。
- **NATテーブルはアドレス変換の記録**です。フレーム転送とは関係ありません。
- 宛先がテーブルにない場合でも、フレームは破棄されません。**受信ポート以外の全ポートにフラッディング**されます。

### 試験のポイント

- L2スイッチは**MACアドレステーブル**で転送先ポートを決める（`show mac address-table`）。
- **送信元MACアドレス**で学習し、**宛先MACアドレス**で転送先を決める。
- 宛先が未学習・ブロードキャストなら**受信ポート以外へフラッディング**。
- MACアドレステーブルはVLANごとに管理される。

### 関連問題

- na-001

---

## 2. VLANの基礎

### 2.1 VLANとは何か

**VLAN（Virtual LAN）** は、1台の物理スイッチを、論理的に複数のスイッチのように分割する技術です。VLANが異なるポート同士は、同じスイッチにつながっていても、別々のスイッチにつながっているのと同じ扱いになります。

VLANを使う最大の目的は、**ブロードキャストドメインを分割すること**です。

- **ブロードキャストドメイン**: ブロードキャストフレーム（宛先 FF:FF:FF:FF:FF:FF）が届く範囲。ARP要求やDHCPディスカバーなどはブロードキャストなので、同じブロードキャストドメインの全端末に届きます。
- **コリジョンドメイン**: 半二重通信でフレームが衝突しうる範囲。スイッチは**ポートごとにコリジョンドメインを分割**します（ハブはしない）。これはVLANを使わなくても、スイッチを使うだけで実現されます。

```
 VLANなし: 1つのブロードキャストドメイン
 +-----------------------------------------------+
 | SW  [Fa0/1] [Fa0/2] [Fa0/3] [Fa0/4]            |
 +-----------------------------------------------+
   PC1のブロードキャスト → PC2, PC3, PC4 すべてに届く

 VLANあり: ブロードキャストドメインが2つに分かれる
 +-----------------------------------------------+
 | SW  [Fa0/1] [Fa0/2] | [Fa0/3] [Fa0/4]          |
 |      VLAN 10        |      VLAN 20             |
 +-----------------------------------------------+
   PC1(VLAN10)のブロードキャスト → PC2(VLAN10)にだけ届く
```

ブロードキャストドメインを小さくすると、次のメリットがあります。

| メリット | 説明 |
|---|---|
| 無駄なトラフィックの削減 | ブロードキャストが届く範囲が狭くなり、帯域や端末のCPUの無駄が減る |
| セキュリティの向上 | 部署ごと・用途ごとにネットワークを分け、VLAN間の通信はルータ／L3スイッチやACLで制御できる |
| 柔軟な設計 | 物理的な場所に関係なく、論理的にグループ分けできる |
| 障害範囲の限定 | ブロードキャストストームなどの影響範囲を狭められる |

VLANが**しないこと**も押さえておきましょう。

- VLANは**通信を暗号化しません**。論理的に分けるだけです。暗号化はVPN（IPsecなど）やWPA2/WPA3（無線）などで行います。
- VLANは**IPアドレスを割り当てません**。IPアドレスの自動割り当てはDHCPの役割です。
- VLANは**VLAN同士を通信させません**。VLAN間の通信にはルーティングが必要です（第9章）。

1つのVLANは1つのIPサブネットに対応させるのが基本です（例：VLAN 10 = 192.168.10.0/24、VLAN 20 = 192.168.20.0/24）。

### 2.2 VLAN IDの範囲と特別なVLAN

VLAN IDは12ビット（第5章）で表され、使える範囲は 1〜4094 です。

| VLAN ID | 区分 | 説明 |
|---|---|---|
| 0 | 予約 | 使用不可（802.1Qではタグに優先度だけを入れる「プライオリティタグ」の意味） |
| **1** | 標準範囲 | **デフォルトVLAN**。初期状態の全ポートが所属。**名前の変更・削除ができない**。初期状態のネイティブVLANでもある |
| 2〜1001 | 標準範囲（Normal range） | 通常利用するVLAN |
| 1002〜1005 | 標準範囲（予約） | FDDI・トークンリング用に予約。**削除できない** |
| 1006〜4094 | 拡張範囲（Extended range） | 設定可能。4094が設定可能な最大値 |
| 4095 | 予約 | 使用不可 |

初期状態の `show vlan brief` の出力例：

```
SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/1, Fa0/2, Fa0/3, Fa0/4
                                                Fa0/5, Fa0/6, Fa0/7, Fa0/8
                                                ...（全ポート）
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup
```

### 2.3 VLAN 1 とセキュリティ

初期状態ではすべてのポートがVLAN 1に所属し、トランクのネイティブVLANもVLAN 1です。VLAN 1にはCDPなどの制御トラフィックも流れます。そのため、セキュリティのベストプラクティスとして次のようにします。

- 使っていないポートは、**VLAN 1以外の未使用VLAN（いわゆる「ブラックホールVLAN」）に移し、`shutdown` する**
- ネイティブVLANをVLAN 1以外の未使用VLANに変更する（第6章）
- 管理用のSVIもVLAN 1以外に置く

```
SW1(config)# vlan 999
SW1(config-vlan)# name UNUSED
SW1(config-vlan)# exit
SW1(config)# interface range fa0/20 - 24
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 999
SW1(config-if-range)# shutdown
```

### 2.4 VLANの作成

```
SW1(config)# vlan 10
SW1(config-vlan)# name SALES
SW1(config-vlan)# exit
SW1(config)# vlan 20
SW1(config-vlan)# name ENGINEERING
```

`vlan 30` のようなコマンドは**スイッチにVLANを作成するだけ**で、どのポートを所属させるか、トランクで許可するかは別の設定です。

### ひっかけポイント・よくある誤解

- **「VLANはコリジョンドメインを分割する」は誤り。** コリジョンドメインは、VLANと関係なく、スイッチのポートごとにすでに分かれています。VLANが分割するのは**ブロードキャストドメイン**です。
- **「VLANでIPアドレスが自動で割り当てられる」は誤り。** それはDHCPの役割です。
- **「VLANで通信が暗号化される」は誤り。** VLANは論理的な分割だけで、暗号化はVPNなどで行います。
- **VLAN 0 は予約されていて使えません。** 初期状態のポートが所属しているのはVLAN 0ではなく**VLAN 1**です。
- **VLAN 1002〜1005 は古い技術（FDDI、トークンリング）用に予約されたVLAN**で、削除できません。初期状態のポートの所属先ではありません。
- **VLAN 4094 は設定可能な最大値**（拡張範囲1006〜4094の上限）で、初期状態のポートは所属していません。

### 試験のポイント

- VLANの目的は**ブロードキャストドメインの分割**。異なるVLANにはブロードキャストが届かない。
- スイッチは**ポートごとにコリジョンドメインを分割**（VLANとは無関係）。
- 初期状態の全ポートは**VLAN 1（デフォルトVLAN）**。VLAN 1は名前変更・削除不可。初期のネイティブVLANもVLAN 1。
- 使用可能なVLAN IDは 1〜4094。0と4095は予約。1002〜1005は削除不可。
- 未使用ポートは未使用VLANに移して `shutdown` するのがベストプラクティス。

### 関連問題

- na-005、na-006

---

## 3. アクセスポートの設定と確認

### 3.1 アクセスポートとトランクポート

スイッチのポートは、大きく2種類のモードで使います。

| | アクセスポート | トランクポート |
|---|---|---|
| 所属するVLAN | **1つだけ**（＋ボイスVLAN） | **複数のVLAN**のフレームを運ぶ |
| VLANタグ | 付けない（端末はタグを意識しない） | 802.1Qタグを付ける（ネイティブVLANを除く） |
| 主な接続先 | PC、プリンタ、サーバ、ローカルモードのAPなど | スイッチ同士、ルータ（ルータオンアスティック）、WLCなど |
| 設定コマンド | `switchport mode access` | `switchport mode trunk` |

### 3.2 アクセスポートの基本設定

ポートをVLAN 10のアクセスポートにするには、インターフェース設定モードで次の2つを設定します。

```
SW1(config)# interface fa0/1
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
```

- `switchport mode access` … ポートをアクセスポートに**固定**します。DTPでトランクになってしまうことも防ぎます（第8章）。
- `switchport access vlan 10` … アクセスポートとして所属するVLANを10にします。
- 指定したVLANがまだ存在しない場合は、**自動で作成されます**（`% Access VLAN does not exist. Creating vlan 10` と表示されます）。

複数のポートをまとめて設定するには `interface range` を使います。

```
SW1(config)# interface range fa0/1 - 12
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 10
```

### 3.3 確認：show vlan brief

```
SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/13, Fa0/14, ... Fa0/23
10   SALES                            active    Fa0/1, Fa0/2, ... Fa0/12
20   ENGINEERING                      active
1002 fddi-default                     act/unsup
...
```

`show vlan brief` には、**アクセスポート**とその所属VLANが表示されます。**トランクポートはこの一覧に表示されません**。「あるはずのポートが `show vlan brief` に出てこない」ときは、そのポートがトランクになっている（あるいはEtherChannelのメンバーなど）可能性を疑い、`show interfaces trunk` で確認します（第7章）。

個別のポートの状態を詳しく見るには `show interfaces fa0/1 switchport` を使います。

```
SW1# show interfaces fa0/1 switchport
Name: Fa0/1
Switchport: Enabled
Administrative Mode: static access
Operational Mode: static access
Administrative Trunking Encapsulation: dot1q
Negotiation of Trunking: Off
Access Mode VLAN: 10 (SALES)
Trunking Native Mode VLAN: 1 (default)
Voice VLAN: none
...
```

### ひっかけポイント・よくある誤解

- **`switchport mode trunk` はトランクポートにするコマンド**です。アクセスポートの設定には使いません。
- **`switchport trunk native vlan 10` はトランクのネイティブVLANを変えるコマンド**で、アクセスポートの所属VLANとは関係ありません。
- アクセスポートの設定は「モードを決める」＋「VLANを決める」の**2つでワンセット**です。

### 試験のポイント

- アクセスポート = `switchport mode access` ＋ `switchport access vlan <番号>`。
- 存在しないVLANを指定すると自動で作成される。
- アクセスポートの所属は `show vlan brief` で確認。トランクポートは表示されない。

### 関連問題

- na-007

---

## 4. ボイスVLAN

### 4.1 IP電話とPCを1つのポートで扱う

オフィスでは、壁のLANポート（スイッチの1ポート）にIP電話をつなぎ、IP電話の背面のポートにPCをつなぐ構成がよく使われます。IP電話の中には小さな3ポートのスイッチが入っています。

```
  [PC] ---- [IP電話] ---- Fa0/5 [SW1]
           (内蔵スイッチ)
   データ:タグなし      音声:VLAN 20のタグ付き
   → VLAN 10           → VLAN 20
```

このとき、1つのスイッチポートで

- **データ用VLAN（access vlan）**: PCのデータ通信用。PCのフレームは**タグなし**で届き、データ用VLANに入ります。
- **音声用VLAN（voice vlan）**: IP電話の音声通信用。IP電話は音声フレームに**音声用VLANの802.1Qタグ（とCoS値）を付けて**送ります。

の2つを扱えます。これを**ボイスVLAN**と呼びます。

### 4.2 設定

```
SW1(config)# interface fa0/5
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# switchport voice vlan 20
```

- `switchport access vlan 10` … PCのデータ用VLANを10にする
- `switchport voice vlan 20` … IP電話の音声用VLANを20にする

CiscoのIP電話は、スイッチから**CDP（またはLLDP-MED）**で音声VLANの番号を教えてもらい、その番号のタグを付けて音声を送ります。

確認：

```
SW1# show interfaces fa0/5 switchport
...
Access Mode VLAN: 10 (DATA)
...
Voice VLAN: 20 (VOICE)
```

### 4.3 なぜ音声とデータを分けるのか

- 音声は遅延・ジッタ・パケットロスに弱いリアルタイム通信です。VLANを分けておくと、**QoSで音声を優先しやすく**なります（タグの3ビットの優先度フィールド＝CoSも使えます）。
- 音声とデータでサブネットを分けることで、管理やセキュリティのポリシーも分けやすくなります。

ボイスVLANを設定したポートは、技術的にはタグ付きとタグなしの両方を扱いますが、**トランクポートではなく「アクセスポート＋ボイスVLAN」**として設定するのが一般的です（`show interfaces trunk` には表示されません）。

### ひっかけポイント・よくある誤解

- **`switchport access vlan 20` はPCのデータ用VLANを20にするコマンド**で、音声用VLANの指定にはなりません。
- **`switchport trunk native vlan 20` はトランクのネイティブVLANを変えるコマンド**です。
- **`spanning-tree portfast` は端末用ポートをすぐに通信可能にするSTPの機能**で、VLANは指定しません（ただし、IP電話のポートでも端末接続ポートなのでPortFastは一緒によく設定されます）。

### 試験のポイント

- 音声用VLANの指定は `switchport voice vlan <番号>`。
- PCのフレームはタグなしでデータ用VLAN（access vlan）へ、IP電話の音声はタグ付きで音声用VLANへ。
- 音声とデータを分けるとQoSで音声を優先しやすい。

### 関連問題

- na-012

---

## 5. トランクと IEEE 802.1Q

### 5.1 なぜトランクが必要か

VLAN 10 と VLAN 20 の両方が、2台のスイッチにまたがって存在する場合を考えます。VLANごとにスイッチ間のケーブルを1本ずつ用意すると、VLANが増えるたびにケーブルとポートが必要になります。

```
 VLANごとにケーブルを用意（非効率）
 [SW1]--VLAN10用--[SW2]
 [SW1]--VLAN20用--[SW2]
 [SW1]--VLAN30用--[SW2]

 トランク（1本で複数VLANを運ぶ）
 [SW1]==== トランク (VLAN 10,20,30) ====[SW2]
```

**トランク**は、1本のリンクで複数のVLANのフレームを運ぶポート（リンク）です。受け取ったスイッチが「このフレームはどのVLANのものか」を区別できるように、送信側はフレームに**VLANタグ**を付けます。このタグの規格が **IEEE 802.1Q**（dot1q）です。

> 参考：かつてはCisco独自の ISL というトランクプロトコルもありましたが、現在はほとんど使われず、CCNAでは802.1Qが前提です。

### 5.2 802.1Qタグの構造

802.1Qタグは**4バイト（32ビット）**で、**送信元MACアドレスとタイプフィールドの間**に挿入されます。

```
 タグなしフレーム
+---------+---------+--------+----------------+-----+
| 宛先MAC | 送信元MAC| タイプ | データ          | FCS |
+---------+---------+--------+----------------+-----+

 802.1Qタグ付きフレーム
+---------+---------+===========+--------+----------------+-----+
| 宛先MAC | 送信元MAC| 802.1Qタグ| タイプ | データ          | FCS |
|         |         | (4バイト) |        |                | 再計算|
+---------+---------+===========+--------+----------------+-----+
                     |
                     v
       +--------------+-------+-----+---------------+
       | TPID         | PCP   | DEI | VID (VLAN ID) |
       | 16ビット     | 3ビット|1ビット| 12ビット      |
       | 0x8100       | 優先度 |     | 0〜4095       |
       +--------------+-------+-----+---------------+
                      |<------- TCI (16ビット) ------>|
```

| フィールド | ビット数 | 内容 |
|---|---|---|
| **TPID**（Tag Protocol Identifier） | **16ビット** | 値は **0x8100**。「このフレームは802.1Qタグ付きである」ことを示す |
| **PCP**（Priority Code Point） | **3ビット** | フレームの優先度。**CoS**（Class of Service）とも呼ばれ、0〜7の8段階。QoSで使う |
| **DEI**（Drop Eligible Indicator） | 1ビット | 輻輳時に破棄してよいフレームかどうか（以前はCFI） |
| **VID**（VLAN ID） | **12ビット** | VLAN番号。2^12 = 4096通り（0〜4095）。0と4095は予約なので、**使えるのは1〜4094** |

タグを挿入するとフレームの内容が変わるため、末尾の FCS（エラーチェック用の値）は再計算されます。

### 5.3 トランクの基本設定

```
SW1(config)# interface g0/1
SW1(config-if)# switchport trunk encapsulation dot1q   ← ISLにも対応する機種でのみ必要
SW1(config-if)# switchport mode trunk
```

- 802.1Qにしか対応していない機種（現在の多くのスイッチ）では、`switchport trunk encapsulation dot1q` は不要（コマンド自体がない）です。
- ISLと802.1Qの両方に対応する機種では、カプセル化方式を指定しないと `switchport mode trunk` が拒否されることがあります。

### ひっかけポイント・よくある誤解

- **VLAN IDは12ビット**です。8ビットだと256通りしか表せず、4094個のVLANを表せません。
- **3ビットは優先度（PCP、CoS）**のフィールドです。VLAN IDではありません。
- **16ビットはTPID（0x8100）**のフィールドです。VLAN IDではありません。
- 802.1Qは**タグを付ける規格**で、トンネルのプロトコル（CAPWAPなど）ではありません。

### 試験のポイント

- トランク = 1本のリンクで複数VLANを運ぶ。VLANの区別は802.1Qタグで行う。
- 802.1Qタグは4バイト、送信元MACとタイプの間に挿入。
- 内訳：TPID 16ビット（0x8100）、PCP 3ビット、DEI 1ビット、**VID 12ビット**。
- 使えるVLAN IDは1〜4094。

### 関連問題

- na-002、na-039（タグ構造）。トランク関連は第6〜8章も参照。

---

## 6. ネイティブVLANとその不一致

### 6.1 ネイティブVLANとは

802.1Qトランクでは、原則としてすべてのフレームにVLANタグを付けますが、**1つのVLANだけはタグを付けずに送信します**。このVLANを**ネイティブVLAN**と呼びます。**デフォルトはVLAN 1**です。

- 送信側：ネイティブVLANのフレームは**タグなし**で送る
- 受信側：**タグなしのフレームを受け取ったら、自分のネイティブVLANのフレームとして扱う**

ネイティブVLANは、もともと802.1Qに対応していない機器（タグを理解できない機器）がトランクのリンク上にいても通信できるようにするための仕組みです。

ネイティブVLANを変更するコマンド（トランクの**両端で同じ値**にします）：

```
SW1(config)# interface g0/1
SW1(config-if)# switchport trunk native vlan 99
```

### 6.2 似た名前のVLANとの違い

| 名前 | 意味 |
|---|---|
| **ネイティブVLAN** | 802.1Qトランク上を**タグなし**で流れるVLAN。デフォルトはVLAN 1 |
| 管理VLAN | SSHなどでスイッチ自体に接続するためのIPアドレス（SVI、`interface vlan X`）を置くVLAN |
| ボイスVLAN | IP電話の音声通信用のVLAN（第4章） |
| デフォルトVLAN | 初期状態の全ポートが所属するVLAN 1 |
| プライベートVLAN | 同じVLAN内のポート同士の通信をさらに制限する機能（CCNAの範囲外の発展的な内容） |

### 6.3 ネイティブVLANの不一致で何が起きるか

トランクの両端でネイティブVLANが異なる場合を考えます。

```
   SW1                                         SW2
 native vlan 1                              native vlan 99
    g0/1 ================ トランク ================ g0/1

  SW1のVLAN 1のフレーム ──(タグなしで送信)──▶ SW2は「タグなし＝自分のネイティブVLAN 99」と解釈
  SW2のVLAN 99のフレーム ─(タグなしで送信)──▶ SW1は「タグなし＝自分のネイティブVLAN 1」と解釈
```

- タグなしのフレームが、**相手側の別のVLANに入ってしまいます**（VLAN 1 → VLAN 99、VLAN 99 → VLAN 1）。いわば「VLANをまたいでフレームが漏れる」状態で、**通信障害やセキュリティ上の問題**になります。
- **トランク自体は動作し続けます。** ネイティブVLAN以外（タグ付きのVLAN）の通信は正常です。影響を受けるのはネイティブVLANの通信です。
- **CDPが不一致を検出して警告メッセージ**を出します。

```
%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/1 (1),
 with SW2 GigabitEthernet0/1 (99).
```

> 補足：CiscoのPVST+／Rapid PVST+が動いている場合は、STPもネイティブVLANの不一致を検出し、該当VLANでそのポートを「PVID不一致（PVID_Inc）」としてブロックすることがあります。その場合、実機では「フレームが漏れる」前に該当VLANの通信が止まります。試験では「タグなしフレームが別のVLANに入る」「CDPが警告する」という原理を押さえておきましょう。

ネイティブVLANの不一致は、**STPのルートブリッジの選出とは関係ありません**（ルートブリッジはブリッジIDで決まります。第12章）。

### 6.4 セキュリティ：VLANホッピング（ダブルタギング）対策

ネイティブVLANがユーザーのアクセスVLANと同じ（例：どちらもVLAN 1）だと、攻撃者が二重にタグを付けたフレームを送り、別のVLANにフレームを届ける「ダブルタギング攻撃」が成立しえます。対策として、

- ネイティブVLANを**どのユーザーも使っていない未使用VLAN**（例：VLAN 99）に変更する
- または `vlan dot1q tag native` でネイティブVLANにもタグを付ける

といった設定が推奨されます。

### ひっかけポイント・よくある誤解

- **「ネイティブVLANが不一致だとトランクが自動で切断され、すべてのVLANが止まる」は誤り。** トランクは動作し続け、影響を受けるのはネイティブVLANの通信です。
- **「ネイティブVLANの不一致でルートブリッジが変わる」は誤り。** ルートブリッジの選出とは無関係です。
- **「何も問題は起きない」も誤り。** 異なるVLAN間でフレームが漏れ、通信障害やセキュリティ問題になります。
- タグなしで流れるVLANは**ネイティブVLAN**です。管理VLAN、ボイスVLAN、プライベートVLANと混同しないこと。

### 試験のポイント

- ネイティブVLAN = 802.1Qトランクでタグなしで送るVLAN。デフォルトはVLAN 1。
- 受信側はタグなしフレームを自分のネイティブVLANとして扱う。
- 両端のネイティブVLANが違うと、フレームが別VLANに入る。CDPが `NATIVE_VLAN_MISMATCH` を警告。
- 対策：両端で `switchport trunk native vlan <番号>` を同じにする。セキュリティ上は未使用VLANにする。

### 関連問題

- na-002、na-038

---

## 7. トランクの許可VLANと確認コマンド

### 7.1 許可VLAN（allowed VLAN）

トランクは、初期状態では**すべてのVLAN（1〜4094）を許可**しています。不要なVLANのフレーム（特にブロードキャスト）をトランクに流さないよう、許可するVLANを絞ることができます。

| コマンド | 動作 |
|---|---|
| `switchport trunk allowed vlan 10,20` | 許可VLANを**10と20だけに置き換える** |
| `switchport trunk allowed vlan add 30` | 今の許可VLANに**30を追加**する |
| `switchport trunk allowed vlan remove 20` | 今の許可VLANから**20を削除**する |
| `switchport trunk allowed vlan except 100` | **100以外をすべて**許可する |
| `switchport trunk allowed vlan all` | **すべて**許可する（初期状態に戻す） |
| `switchport trunk allowed vlan none` | どのVLANも許可しない |

**最重要ポイント：`add` を付け忘れると、許可リストが置き換わります。**

```
! 現在：VLAN 10, 20 を許可
SW1(config-if)# switchport trunk allowed vlan 30
! → 許可VLANは「30だけ」になり、VLAN 10 と 20 の通信が止まる！

SW1(config-if)# switchport trunk allowed vlan add 30
! → 許可VLANは「10, 20, 30」になる（正しい）
```

これは実務でもよくある事故です。

### 7.2 show interfaces trunk

トランクとして動作しているポートと、そのポートで許可されているVLANを確認するには `show interfaces trunk` を使います。

```
SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on               802.1q         trunking      99

Port        Vlans allowed on trunk
Gi0/1       10,20,30

Port        Vlans allowed and active in management domain
Gi0/1       10,20,30

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       10,20,30
```

出力の見方：

| セクション | 意味 |
|---|---|
| Mode | `on`（`switchport mode trunk` で固定）、`desirable`、`auto` など（DTPのモード） |
| Encapsulation | `802.1q` など |
| Status | `trunking` ならトランクとして動作中 |
| Native vlan | ネイティブVLAN |
| Vlans allowed on trunk | 許可VLANのリスト（設定値） |
| Vlans allowed and active in management domain | 許可されていて、かつスイッチ上に存在する（作成済みの）VLAN |
| Vlans in spanning tree forwarding state and not pruned | さらにSTPでフォワーディング状態で、プルーニングされていないVLAN。実際にフレームが流れるVLAN |

### 7.3 主な show コマンドの使い分け

| コマンド | 表示内容 |
|---|---|
| `show vlan brief` | VLANの一覧と、各VLANに所属する**アクセスポート**。トランクポートは表示されない |
| `show interfaces trunk` | **トランクポート**の一覧、ネイティブVLAN、許可VLANなど |
| `show interfaces <if> switchport` | 個別ポートのモード（管理上・動作上）、アクセスVLAN、ネイティブVLAN、ボイスVLANなど |
| `show mac address-table` | 学習したMACアドレスとポートの対応 |
| `show ip route` | ルーティングテーブル（L3） |

### ひっかけポイント・よくある誤解

- **`switchport trunk allowed vlan 30`（add なし）は「追加」ではなく「置き換え」。** 10と20の通信が止まります。
- **`switchport access vlan 30` はアクセスポートのVLANを設定するコマンド**で、トランクの許可VLANは変わりません。
- **`vlan 30` はVLANを作成するコマンド**で、トランクで許可するかどうかは別の設定です。
- トランクポートの確認に `show vlan brief` を使っても、トランクポートは一覧に表示されません。
- `show ip route` はルーティングテーブル、`show mac address-table` はMACアドレステーブルの表示で、トランクの確認には使いません。

### 試験のポイント

- 許可VLANの変更は `add` / `remove` / `except` / `all`。**`add` を忘れると置き換え**。
- トランクの確認は `show interfaces trunk`（モード、カプセル化、状態、ネイティブVLAN、許可VLAN）。
- `show vlan brief` にポートが出ない → トランクになっている可能性。

### 関連問題

- na-008、na-037

---

## 8. DTP（Dynamic Trunking Protocol）

### 8.1 DTPとは

**DTP（Dynamic Trunking Protocol）** は、接続した2つのスイッチポートの間で、**トランクにするかどうかを自動でネゴシエーションする、Cisco独自のプロトコル**です。

DTPに関係するポートのモード：

| モード | コマンド | 動作 | 覚え方 |
|---|---|---|---|
| **access** | `switchport mode access` | 常にアクセスポート | 固定 |
| **trunk** | `switchport mode trunk` | 常にトランク。DTPでトランクを誘う（DTPフレームを送る） | 固定 |
| **dynamic desirable** | `switchport mode dynamic desirable` | **自分から積極的にトランクを誘う**。相手が trunk / desirable / auto ならトランクになる | 積極的 |
| **dynamic auto** | `switchport mode dynamic auto` | **誘われたら応じる**（自分からは誘わない）。相手が trunk / desirable ならトランクになる | 受け身 |

> 補足：現在の多くのCiscoスイッチ（Catalyst 2960/3650/9000系など）のデフォルトは `dynamic auto` です。

### 8.2 モードの組み合わせ表

「**少なくとも一方が誘えば（trunk または desirable なら）トランクになる**」と覚えます。

| | access | dynamic auto | dynamic desirable | trunk |
|---|---|---|---|---|
| **access** | アクセス | アクセス | アクセス | （不一致・非推奨） |
| **dynamic auto** | アクセス | **アクセス** | トランク | トランク |
| **dynamic desirable** | アクセス | トランク | トランク | トランク |
| **trunk** | （不一致・非推奨） | トランク | トランク | トランク |

- **auto と auto はトランクにならない**：どちらも相手からの誘いを待つだけで、誰も誘わないからです。結果はアクセスポートになります。
- auto と desirable：desirable 側が誘い、auto 側が応じる → トランク。
- desirable と desirable：両方が誘う → トランク。
- trunk と auto：trunk 側がDTPで誘い、auto 側が応じる → トランク。
- access と trunk のように片方を固定で食い違わせるのは設定ミスで、通信が正常に行えません。

### 8.3 DTPのセキュリティと推奨設定

DTPが有効なままだと、攻撃者が自分のPCからDTPフレームを送ってポートをトランクにし、すべてのVLANのフレームを受け取る「スイッチスプーフィング」攻撃が可能になります。また、意図しないトランク化も起こりえます。そのため実務では、

- ポートのモードを**手動で固定**する（端末用は `switchport mode access`、スイッチ間は `switchport mode trunk`）
- トランクでは `switchport nonegotiate` で**DTPフレームの送信を止める**

ことが推奨されます。

```
SW1(config)# interface g0/1
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport nonegotiate
```

確認（`show interfaces g0/1 switchport` の一部）：

```
Administrative Mode: trunk
Operational Mode: trunk
Negotiation of Trunking: Off
```

`switchport mode access` を設定すると、そのポートではDTPのネゴシエーションも行われなくなります。

### 8.4 似たプロトコルとの対比

DTPの「auto同士はだめ」という考え方は、EtherChannelのネゴシエーション（LACPの passive 同士、PAgPの auto 同士は構成されない）と同じです。第18章で合わせて整理します。

| プロトコル | 用途 | 積極的なモード | 受け身のモード | 標準/独自 |
|---|---|---|---|---|
| DTP | トランクの自動構成 | desirable（と trunk） | auto | Cisco独自 |
| LACP | EtherChannelの自動構成 | active | passive | IEEE標準 |
| PAgP | EtherChannelの自動構成 | desirable | auto | Cisco独自 |

### ひっかけポイント・よくある誤解

- **auto と desirable はトランクになります**（desirable が誘う）。
- **desirable と desirable もトランクになります**（両方が誘う）。
- **trunk と auto もトランクになります**（trunk 側がDTPで誘う）。
- トランクにならないのは **auto と auto**（と、access が関わる組み合わせ）です。
- DTPは**隣接機器の情報を得るプロトコルではありません**（それはCDP/LLDP）。

### 試験のポイント

- DTPはCisco独自のトランク自動ネゴシエーション。
- auto = 誘われたら応じる、desirable = 自分から誘う、trunk = 常にトランク。
- **少なくとも一方が誘えばトランク。auto同士はアクセスポート**。
- 実務ではモードを固定し、`switchport nonegotiate` でDTPを止める。

### 関連問題

- na-011

---

## 9. VLAN間ルーティング（ルータオンアスティックとSVI）

### 9.1 なぜルーティングが必要か

VLANは別々のブロードキャストドメインであり、通常は**別々のIPサブネット**です。異なるサブネット同士の通信は、L3の機器（ルータやL3スイッチ）が中継（ルーティング）しなければ実現できません。

```
 VLAN 10: 192.168.10.0/24              VLAN 20: 192.168.20.0/24
 PC-A 192.168.10.10                    PC-B 192.168.20.10
 GW   192.168.10.1                     GW   192.168.20.1
        \                                 /
         \______ L3の機器（ルータ / L3スイッチ）______/
                  .10.1          .20.1
```

- PC-Aは、宛先 192.168.20.10 が自分のサブネット外なので、**自分のサブネットにあるデフォルトゲートウェイ（192.168.10.1）**にフレームを送ります。
- L3の機器がルーティングして、VLAN 20側（192.168.20.1のインターフェース）からPC-Bに届けます。

したがって、**各VLANのPCは、それぞれ自分のサブネットにあるゲートウェイを設定**します。両方のPCに同じゲートウェイを設定することはできません（ゲートウェイは自分と同じサブネットにある必要があるため）。

VLAN間ルーティングの主な方法は2つです。

| 方法 | 構成 | 特徴 |
|---|---|---|
| **ルータオンアスティック**（Router on a Stick, ROAS） | ルータの1つの物理インターフェースを**VLANごとのサブインターフェース**に分け、スイッチとトランクで接続 | 物理インターフェース1本で済む。全VLAN間通信がそのリンクを通るため帯域がボトルネックになりやすい |
| **L3スイッチのSVI** | L3スイッチに**VLANごとの仮想インターフェース（SVI、`interface vlan X`）**を作る | ルータが不要。スイッチ内部でハードウェア処理するため高速。現在の主流 |

（ほかに、VLANごとにルータの物理インターフェースを1本ずつ用意する方法もありますが、ポートを多く消費します。）

### 9.2 ルータオンアスティックの設定

```
            [R1]
             | g0/0 （トランク：VLAN 10, 20）
             |
          g0/1
           [SW1]
        fa0/1   fa0/2
         |        |
       PC-A      PC-B
     (VLAN 10)  (VLAN 20)
```

ルータ側：

```
R1(config)# interface g0/0
R1(config-if)# no shutdown                       ← 物理インターフェースを有効化
R1(config-if)# exit
R1(config)# interface g0/0.10                    ← VLAN 10用のサブインターフェース
R1(config-subif)# encapsulation dot1Q 10         ← このサブIFはVLAN 10のタグを扱う
R1(config-subif)# ip address 192.168.10.1 255.255.255.0
R1(config-subif)# exit
R1(config)# interface g0/0.20
R1(config-subif)# encapsulation dot1Q 20
R1(config-subif)# ip address 192.168.20.1 255.255.255.0
```

- サブインターフェース番号（`.10`）とVLAN番号は一致させなくても動作しますが、分かりやすさのため一致させるのが一般的です。
- **`encapsulation dot1Q <VLAN番号>` が必須**です。これでそのサブインターフェースが担当するVLANが決まります。
- 各サブインターフェースのIPアドレス（例：192.168.10.1）が、そのVLANのPCの**デフォルトゲートウェイ**になります。
- ネイティブVLANを扱うサブインターフェースでは `encapsulation dot1Q 99 native` のように `native` を付けます。

スイッチ側（ルータとつながるポートはトランク）：

```
SW1(config)# interface g0/1
SW1(config-if)# switchport mode trunk
```

確認：

```
R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     unassigned      YES unset  up                    up
GigabitEthernet0/0.10  192.168.10.1    YES manual up                    up
GigabitEthernet0/0.20  192.168.20.1    YES manual up                    up

R1# show ip route
...
C        192.168.10.0/24 is directly connected, GigabitEthernet0/0.10
L        192.168.10.1/32 is directly connected, GigabitEthernet0/0.10
C        192.168.20.0/24 is directly connected, GigabitEthernet0/0.20
L        192.168.20.1/32 is directly connected, GigabitEthernet0/0.20
```

### 9.3 L3スイッチのSVIによるVLAN間ルーティング

```
SW1(config)# ip routing                          ← L3スイッチでルーティングを有効化
SW1(config)# interface vlan 10
SW1(config-if)# ip address 192.168.10.1 255.255.255.0
SW1(config-if)# no shutdown
SW1(config-if)# exit
SW1(config)# interface vlan 20
SW1(config-if)# ip address 192.168.20.1 255.255.255.0
SW1(config-if)# no shutdown
```

SVIが up/up になるには、そのVLANが存在し、そのVLANでup状態のポート（アクセスポートまたはそのVLANを許可したフォワーディング中のトランク）が少なくとも1つ必要です。

L3スイッチでは、物理ポートで `no switchport` を設定して**ルーテッドポート**（ルータのインターフェースのように直接IPアドレスを持つポート）にすることもできます。L3 EtherChannel（第19章）はこの考え方を使います。

### ひっかけポイント・よくある誤解

- **「スイッチ間をトランクでつなげばVLAN間で通信できる」は誤り。** トランクは複数VLANのフレームを運ぶだけで、VLAN同士をつなぐわけではありません。
- **「STPを有効にするとVLAN間で通信できる」は誤り。** STPはL2ループを防ぐプロトコルです。
- **「両方のPCに同じデフォルトゲートウェイを設定する」は誤り。** VLANが違えばサブネットも違うので、それぞれ自分のサブネットにあるゲートウェイを設定します。
- **SVIはL3スイッチの中に作る仮想インターフェース**で、ルータのサブインターフェースを使う構成（ルータオンアスティック）とは別物です。
- **EtherChannel**（リンクを束ねる技術）や**ネイティブVLAN**（タグなしで送るVLAN）は、ルータオンアスティックとは別の概念です。
- EtherChannel も VLAN間通信を可能にするものではありません（第17章）。

### 試験のポイント

- 異なるVLAN（= 異なるサブネット）間の通信には**L3のルーティング**が必要。
- ルータオンアスティック = ルータの1物理IFをサブIFに分け、`encapsulation dot1Q <VLAN>` で各VLANを担当。スイッチ側はトランク。
- サブIFのIPアドレスが各VLANのデフォルトゲートウェイ。
- ルータオンアスティックはリンク1本に通信が集中しボトルネックになりやすい。
- L3スイッチでは `ip routing` ＋ `interface vlan X`（SVI）。

### 関連問題

- na-009、na-010

---

## 10. CDPとLLDP（隣接機器の検出）

### 10.1 隣接機器の検出プロトコルとは

ネットワーク構成図がない、あるいは古い場合でも、各機器が「自分の隣に何がつながっているか」を知ることができれば、構成をたどれます。そのためのL2プロトコルが **CDP** と **LLDP** です。どちらも**直接接続された隣接機器**の情報だけをやり取りします（ルータを越えて伝わることはありません）。

| 項目 | **CDP**（Cisco Discovery Protocol） | **LLDP**（Link Layer Discovery Protocol） |
|---|---|---|
| 標準 | **Cisco独自** | **IEEE標準（802.1AB）** |
| 使う環境 | Cisco機器のみの環境 | **他社製品が混在する環境** |
| Cisco機器のデフォルト | **有効** | **無効の機種が多い** |
| 送信間隔（デフォルト） | **60秒** | **30秒** |
| 保持時間（デフォルト） | **180秒** | **120秒** |
| 全体で有効化/無効化 | `cdp run` / `no cdp run` | `lldp run` / `no lldp run` |
| インターフェース単位 | `cdp enable` / `no cdp enable` | `lldp transmit` / `lldp receive`（送信と受信を個別に設定） |
| 隣接機器の一覧 | `show cdp neighbors` | `show lldp neighbors` |
| 詳細 | `show cdp neighbors detail`、`show cdp entry <名前>` | `show lldp neighbors detail`、`show lldp entry <名前>` |

- 送信間隔：情報を隣に送る間隔。
- 保持時間（holdtime）：受け取った情報を保持する時間。この間に新しい情報が届かなければ、隣接機器が消えたと判断して情報を削除します。

### 10.2 CDPで分かる情報

CDPで分かる主な情報：

- 隣接機器のホスト名（Device ID）
- 自分のどのポートと、相手のどのポートがつながっているか
- 機種（Platform）、機能（Capability：ルータ、スイッチなど）
- **IPアドレス**（管理アドレス）
- **IOSのバージョン**
- ネイティブVLAN、デュプレックス（不一致の検出に使われる）
- VTPドメイン名など

### 10.3 show cdp neighbors と detail の違い

```
SW1# show cdp neighbors
Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge
                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone

Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
R1               Gig 0/1           152          R B S I   ISR4321   Gig 0/0/0
SW2              Gig 0/2           171            S I     WS-C2960X Gig 0/1
```

- `show cdp neighbors` … 隣接機器の名前・自分側のポート（Local Intrfce）・保持時間の残り・機能・機種・相手側のポート（Port ID）の**一覧**。**IPアドレスやIOSのバージョンは表示されません**。

```
SW1# show cdp neighbors detail
-------------------------
Device ID: R1
Entry address(es):
  IP address: 10.0.0.1
Platform: cisco ISR4321/K9,  Capabilities: Router Switch IGMP
Interface: GigabitEthernet0/1,  Port ID (outgoing port): GigabitEthernet0/0/0
Holdtime : 148 sec

Version :
Cisco IOS XE Software, Version 16.09.04
...
advertisement version: 2
Duplex: full
Management address(es):
  IP address: 10.0.0.1
```

- `show cdp neighbors detail` … **IPアドレス、プラットフォーム、IOSのバージョン**などの詳しい情報を全隣接機器について表示。
- `show cdp entry R1` … 特定の機器（R1）の詳細だけを表示。`show cdp entry *` は全機器。

**構成をたどる手順の例**：`show cdp neighbors` で隣の機器と接続ポートを確認 → `show cdp neighbors detail` でIPアドレスを調べる → SSHでその機器にログイン → 同じ手順を繰り返す。

### 10.4 CDPのセキュリティと無効化

CDPは機種やIOSのバージョン、IPアドレスを隣接機器に（暗号化も認証もなしで）送ります。攻撃者が受け取れば、脆弱性のあるバージョンを狙うなどの手がかりを与えてしまいます。そのため、**インターネットや社外の機器に面したインターフェースではCDPを止める**ことが推奨されます。

```
! スイッチ全体でCDPを止める（グローバル設定モード）
SW1(config)# no cdp run

! 特定のインターフェースだけ止める（インターフェース設定モード）
SW1(config)# interface g0/24
SW1(config-if)# no cdp enable
```

| コマンド | モード | 効果 |
|---|---|---|
| `no cdp run` | グローバル設定 | **スイッチ全体（全インターフェース）**でCDPを停止 |
| `no cdp enable` | インターフェース設定 | **そのインターフェースだけ**でCDPを停止 |
| `no lldp run` | グローバル設定 | LLDPを停止（CDPは止まらない） |
| `shutdown` | インターフェース設定 | インターフェース自体を無効化（CDPだけを止めるものではない） |

CDPの状態確認：

```
SW1# show cdp
Global CDP information:
        Sending CDP packets every 60 seconds
        Sending a holdtime value of 180 seconds
        Sending CDPv2 advertisements is  enabled
```

### 10.5 LLDPの有効化

他社製スイッチとの間で隣接機器の情報をやり取りするには、IEEE標準のLLDPを使います。Cisco機器ではLLDPがデフォルトで無効の機種が多いので、グローバル設定で有効にします。

```
SW1(config)# lldp run                    ← グローバルでLLDPを有効化

! 必要ならインターフェースごとに送受信を制御
SW1(config)# interface g0/1
SW1(config-if)# no lldp transmit         ← このIFからは送信しない
SW1(config-if)# lldp receive             ← 受信はする
```

```
SW1# show lldp neighbors
Capability codes:
    (R) Router, (B) Bridge, (T) Telephone, (C) DOCSIS Cable Device
    (W) WLAN Access Point, (P) Repeater, (S) Station, (O) Other

Device ID           Local Intf     Hold-time  Capability      Port ID
OtherVendorSW       Gi0/1          120        B               port-1

Total entries displayed: 1
```

LLDPのタイマーの変更（参考）：`lldp timer 30`、`lldp holdtime 120`。CDPは `cdp timer 60`、`cdp holdtime 180`。

### ひっかけポイント・よくある誤解

- **「LLDPはCisco独自」は誤り。** LLDPはIEEE標準（802.1AB）で、Cisco独自なのはCDPです。
- **DTPはトランクを自動で構成するプロトコル**で、隣接機器の情報は得られません。**STPはL2ループを防ぐプロトコル**です。
- **`no cdp enable` はインターフェース設定モードのコマンド**で、そのインターフェースだけを止めます。スイッチ全体を止めるのは**`no cdp run`**（グローバル設定モード）。
- **`no lldp run` ではCDPは止まりません。**
- **`shutdown` はインターフェース自体を止める**コマンドで、CDPだけを止めるものではありません。
- **`cdp run` で他社製の機器と情報交換はできない**ことが多いです（CDPはCisco独自）。
- **`lldp enable` というコマンドは（Cisco IOSには）存在しません。** インターフェースごとの設定は `lldp transmit` / `lldp receive`。
- **`show lldp neighbors` は表示コマンド**で、LLDPを有効にするコマンドではありません。
- **`show cdp neighbors` ではIPアドレスは表示されません。** IPアドレスやIOSのバージョンは `show cdp neighbors detail`（または `show cdp entry`）。
- `show interfaces` は自分のインターフェースの状態・エラー数、`show ip route` はルーティングテーブルの表示で、隣接機器の情報は出ません。

### 試験のポイント

- CDP = Cisco独自・デフォルト有効・60秒/180秒。LLDP = IEEE 802.1AB・Ciscoでは多くがデフォルト無効・30秒/120秒。
- 全体の停止 `no cdp run`、IF単位の停止 `no cdp enable`。
- LLDPの有効化は `lldp run`、IF単位は `lldp transmit` / `lldp receive`。
- IPアドレス・IOSバージョンは `show cdp neighbors detail` / `show cdp entry <名前>`。
- 外部に面したポートではCDPを無効にするのが推奨。

### 関連問題

- na-004、na-034、na-035、na-036

---

## 11. STPの目的とL2ループの問題

### 11.1 冗長化とループのジレンマ

スイッチ間を1本のリンクだけでつなぐと、そのリンクやスイッチが故障したときに通信が止まります。そこで、複数の経路でつないで**冗長化**します。ところが、L2（イーサネット）で経路を冗長化すると**ループ**ができてしまいます。

```
        [SW1]
        /    \
       /      \
   [SW2]------[SW3]

  3台が三角形につながっている → フレームがぐるぐる回る経路（ループ）がある
```

### 11.2 L2ループで起きる3つの問題

**① ブロードキャストストーム**

ブロードキャストフレームは「受信ポート以外の全ポート」にフラッディングされます。ループがあると、SW1が送ったブロードキャストがSW2経由とSW3経由でそれぞれ回り、戻ってきたフレームがまたフラッディングされ……と、**フレームが増え続けながら永遠に回り続けます**。数秒でリンクの帯域とスイッチのCPUを使い果たし、ネットワーク全体が通信不能になります。

**② MACアドレステーブルの不安定化（MACアドレスのフラッピング）**

同じ送信元MACアドレスのフレームが、ループを回って**複数のポートから次々に届く**ため、スイッチは「このMACアドレスはポートAにいる」「いやポートBだ」と学習するポートを次々に書き換えます。正しい転送ができなくなります。

```
%SW_MATM-4-MACFLAP_NOTIF: Host aaaa.aaaa.aaaa in vlan 1 is flapping
 between port Gi0/1 and port Gi0/2
```

**③ 同じフレームの重複受信**

ユニキャストフレームでも、ループの複数の経路を通って同じフレームのコピーが宛先に何度も届きます。

### 11.3 なぜL2ループは自然に消えないのか ― TTLの有無

L3（IP）では、IPヘッダに**TTL（Time To Live）**があり、ルータを1つ通るたびに1ずつ減って、0になったパケットは破棄されます。そのため、ルーティングのループがあっても、パケットが永遠に回り続けることはありません。

一方、**イーサネットフレームのヘッダにはTTLがありません**。スイッチはフレームのIPヘッダを書き換えないので、ループに入ったフレームは**消えずに回り続けます**。だからこそ、L2では**ループそのものを作らない**ためのプロトコル、STPが必要なのです。

| | L3（IP）のループ | L2（イーサネット）のループ |
|---|---|---|
| 寿命を制限する仕組み | IPヘッダのTTL | **なし** |
| ループ時の挙動 | TTLが0になれば破棄 | 永遠に回り続け、増殖する |
| 対策 | ルーティングプロトコルの設計、TTL | **STPでループを作らない** |

### 11.4 STPの目的と基本動作

**STP（Spanning Tree Protocol、スパニングツリープロトコル、IEEE 802.1D）** は、冗長化したL2ネットワークで**ループを防ぐ**プロトコルです。

- スイッチ同士が**BPDU（Bridge Protocol Data Unit）**という制御フレームを交換し、
- 一部のポートを**ブロッキング状態**（データを転送しない状態）にして、
- **ループのない木構造（ツリー）**を作ります。
- 使用中の経路が故障したら、ブロックしていたポートを転送状態にして**経路を切り替えます**。

```
        [SW1] ルートブリッジ
        /    \
     DP/      \DP
     RP/        \RP
   [SW2]--------X[SW3]
       DP    ブロック(非指定ポート)

  SW2-SW3間のSW3側のポートをブロック → ループが消える
  SW1-SW3間が故障したら → ブロックしていたポートを転送状態にして迂回
```

### 11.5 他の技術との区別

| 目的 | 担当する技術 |
|---|---|
| **冗長化したL2ネットワークでループを防ぐ** | **STP / RSTP** |
| 宛先ネットワークまでの最適な経路を選ぶ | ルーティングプロトコル（OSPFなど） |
| 異なるVLAN同士を通信させる | VLAN間ルーティング（ルータ／L3スイッチ） |
| 複数のリンクを束ねて帯域を増やす | EtherChannel |

### ひっかけポイント・よくある誤解

- **「L2のフレームはTTLが0になると自動で破棄される」は誤り。** TTLはIPヘッダの項目で、イーサネットフレームにはTTLがありません。だからループするフレームは消えません。
- **「L2ループでIPアドレスが重複する」は誤り。** IPアドレスの重複は設定ミスやDHCPの問題で起きるもので、L2ループとは無関係です。
- **STPは経路選択（OSPFなど）、VLAN間通信、リンクの束ね（EtherChannel）のためのものではありません。**

### 試験のポイント

- STPの目的 = **冗長化したL2ネットワークのループ防止**。一部ポートをブロックして木構造を作る。
- L2ループの問題 = **ブロードキャストストーム**、**MACアドレステーブルの不安定化**、**フレームの重複**。
- イーサネットフレームにはTTLがない → ループは自然に消えない。

### 関連問題

- na-013、na-014

---

## 12. ルートブリッジの選出とブリッジID

### 12.1 STPの役割決定の全体像

STPは次の4ステップでループのない木構造を作ります。この順番自体がよく問われます。

```
 ① ルートブリッジを1台選ぶ（ネットワーク全体で1台、VLANごと）
        ↓
 ② ルートブリッジ以外の各スイッチで、ルートポートを1つ選ぶ
        ↓
 ③ 各リンク（セグメント）で、指定ポートを1つ選ぶ
        ↓
 ④ 残ったポートを非指定ポートとしてブロックする
```

この章では①のルートブリッジの選出を、次章で②〜④を扱います。

### 12.2 ブリッジID

**ブリッジID（BID）** は、各スイッチを識別する8バイトの値で、**「ブリッジ優先度＋MACアドレス」**から成ります。

```
 ブリッジID（8バイト）
+-------------------------------+--------------------------------+
|  ブリッジ優先度 (2バイト)       |  MACアドレス (6バイト)          |
+-------------------------------+--------------------------------+

 PVST+ / Rapid PVST+ の場合、優先度の2バイトはさらに分かれる
+----------------+---------------------------+
| 優先度 4ビット  | 拡張システムID 12ビット     |
| (4096の倍数)   | (= VLAN番号)               |
+----------------+---------------------------+
```

**ルートブリッジには、ブリッジIDが最も小さいスイッチが選ばれます。** STPでは、ブリッジID、パスコスト、ポートIDなど、**比較する値はすべて「小さいほど優先」**です。

選出の手順：

1. まず**優先度**を比べ、小さい方が勝ち。
2. 優先度が同じなら、**MACアドレス**を比べ、小さい方が勝ち。

起動した順番やポート数は関係ありません。最初は全スイッチが「自分がルートブリッジだ」と主張するBPDUを送りますが、より小さいブリッジIDを含むBPDU（優れたBPDU、superior BPDU）を受け取ると、それを認めて主張をやめます。最終的にブリッジIDが最小のスイッチだけがルートブリッジとして残ります。

### 12.3 ブリッジ優先度と拡張システムID

- 優先度のデフォルトは **32768**。
- 設定できる値は **0〜61440 の範囲で、4096の倍数**（0, 4096, 8192, …, 24576, 28672, 32768, …, 61440 の16通り）。
- **PVST+ / Rapid PVST+** では、VLANごとに別々のスパニングツリーが動くため、ブリッジIDの優先度フィールドに**「設定した優先度＋VLAN番号（拡張システムID）」**が入ります。そのため、優先度フィールドの下位12ビットはVLAN番号に使われ、設定できるのは上位4ビットだけ ＝ **4096の倍数**に限られるのです。

| VLAN | 設定した優先度 | 表示される優先度（ブリッジIDの値） |
|---|---|---|
| 1 | 32768（デフォルト） | **32769**（32768＋1） |
| 10 | 32768（デフォルト） | **32778**（32768＋10） |
| 10 | 4096 | 4106（4096＋10） |
| 20 | 24576 | 24596（24576＋20） |

`32769` のような値は**表示値**であって、`spanning-tree vlan 1 priority 32769` のように設定することはできません。

```
SW1(config)# spanning-tree vlan 10 priority 1000
% Bridge Priority must be in increments of 4096.
% Allowed values are:
  0     4096  8192  12288 16384 20480 24576 28672
  32768 36864 40960 45056 49152 53248 57344 61440
```

### 12.4 ルートブリッジにしたいスイッチを決める

優先度がすべてデフォルト（32768）のままだと、**MACアドレスが最も小さいスイッチ**がルートブリッジになります。MACアドレスは製造時期が古いほど小さいことが多いため、**古くて性能の低いスイッチ**がルートブリッジに選ばれてしまうことがあります。ルートブリッジにはトラフィックが集まるため、これは望ましくありません。

そこで、**ルートにしたいスイッチ（トラフィックが集まる中心のスイッチ、ディストリビューション層・コア層など）の優先度を下げて**設定するのが一般的です。方法は2つあります。

**方法1：値を直接指定する**

```
SW1(config)# spanning-tree vlan 1 priority 4096
```

**方法2：root primary / root secondary マクロを使う**

```
SW1(config)# spanning-tree vlan 1 root primary
SW2(config)# spanning-tree vlan 1 root secondary
```

| コマンド | 動作 |
|---|---|
| `spanning-tree vlan X root primary` | そのVLANのルートブリッジになるよう、優先度を自動設定。通常は **24576**。現在のルートブリッジの優先度が24576以下なら、それより**4096小さい値**を設定する |
| `spanning-tree vlan X root secondary` | ルートブリッジが故障したときに代わりとなる**バックアップ**。優先度は **28672** |
| `spanning-tree vlan X priority 61440` | 設定可能な中で**最も大きい＝最も不利**な優先度。ルートブリッジになりにくくなる |

`root primary` は設定した時点の値を計算して書き込むだけです。後から、より小さい優先度のスイッチが追加されればルートブリッジは奪われます（これを防ぐのが**ルートガード**。第15章）。

### 12.5 確認：show spanning-tree

```
SW1# show spanning-tree vlan 10

VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    24586
             Address     0011.1111.1111
             This bridge is the root
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    24586  (priority 24576 sys-id-ext 10)
             Address     0011.1111.1111
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Desg FWD 4         128.1    P2p
Gi0/2               Desg FWD 4         128.2    P2p
```

- `Root ID` がルートブリッジの情報、`Bridge ID` が自分自身の情報です。両者が同じで **`This bridge is the root`** と表示されていれば、自分がルートブリッジです。
- `priority 24576 sys-id-ext 10` は「設定した優先度24576＋拡張システムID（VLAN番号）10」＝24586 を表しています。
- ルートブリッジの全ポートは `Desg FWD`（指定ポート・フォワーディング）です（次章）。

### 12.6 【解き方】ルートブリッジの選出問題

**例題**：VLAN 1で、次の3台のどれがルートブリッジになるか。

| スイッチ | 優先度（設定値） | MACアドレス |
|---|---|---|
| SW-A | 32768 | 0000.0c11.1111 |
| SW-B | 32768 | 0000.0c00.0001 |
| SW-C | 28672 | 00aa.bbbb.cccc |

- **ステップ1：優先度を比べる。** SW-Cが28672で最小 → この時点でSW-Cに決定。MACアドレスは比べない。
- **答え：SW-C**（MACアドレスが最も大きくても、優先度が小さければ勝つ）。

もしSW-Cも32768だったら：

- **ステップ1：** 全員32768で同じ。
- **ステップ2：MACアドレスを比べる。** 先頭から16進数で比較。0000.0c00.0001 < 0000.0c11.1111 < 00aa.bbbb.cccc → **SW-B**がルートブリッジ。

### ひっかけポイント・よくある誤解

- **「ブリッジIDが最も大きいスイッチがルートブリッジ」は誤り。** STPでは小さいほど優先されます。
- **ポート数、起動した順番は関係ありません。** 選出はブリッジIDだけで決まります。
- **ブリッジ優先度は4096の倍数。** 1000、5000 のような値は設定できません。
- **32769は「VLAN 1でのデフォルトの表示値（32768＋1）」**であり、設定値としては使えません。
- **`root secondary` はバックアップ用（28672）**で、ルートブリッジにするコマンドではありません。
- **`priority 61440` は最も不利な値**で、ルートブリッジにはなりにくくなります。
- **`spanning-tree portfast` はルートブリッジの選出とは無関係**です。

### 試験のポイント

- ルートブリッジ = **ブリッジID（優先度＋MACアドレス）が最小**のスイッチ。優先度 → MACの順で比較。
- デフォルト優先度32768。設定値は**0〜61440の4096の倍数**。
- PVST+では表示値 = 優先度＋VLAN番号（例：VLAN 10で32778）。
- ルートにしたいスイッチの優先度を下げる：`spanning-tree vlan X priority 4096` または `spanning-tree vlan X root primary`（通常24576）。`root secondary` は28672。

### 関連問題

- na-003、na-020、na-021

---

## 13. パスコストとポートの役割の決定

### 13.1 パスコスト

**パスコスト**は、リンクの「通りにくさ」を表す値で、**速いリンクほど小さく**なります。各スイッチは、ルートブリッジまでの経路上のポートのコストを合計した**ルートパスコスト**を計算し、**合計が最も小さい経路**を選びます。

Ciscoのショート方式（16ビット、IEEE 802.1D-1998準拠）のデフォルトコスト：

| リンク速度 | パスコスト（ショート方式） | （参考）ロング方式 |
|---|---|---|
| 10 Mbps | **100** | 2,000,000 |
| 100 Mbps | **19** | 200,000 |
| 1 Gbps | **4** | 20,000 |
| 10 Gbps | **2** | 2,000 |

> 覚え方：「100・19・4・2」。10Mbpsが100で、速くなるほど小さい。

コストはインターフェースで変更できます。

```
SW1(config)# interface g0/1
SW1(config-if)# spanning-tree vlan 10 cost 10
```

**ルートパスコストの計算方法**：ルートブリッジが送るBPDUのルートパスコストは0です。BPDUを**受信したポートのコスト**を加算していきます。

```
 [Root]--1G--[SW2]--1G--[SW3]
   0          0+4=4      4+4=8

 SW3のルートパスコスト = 4（SW2の受信ポート） + 4（SW3の受信ポート） = 8
```

### 13.2 ポートの役割（802.1D）

| 役割 | 選ばれる場所 | 状態 | 説明 |
|---|---|---|---|
| **ルートポート（RP）** | **ルートブリッジ以外の各スイッチに1つ** | フォワーディング | そのスイッチから**ルートブリッジまでのコストが最も小さい**ポート。「ルートブリッジへ向かう出口」 |
| **指定ポート（DP）** | **各リンク（セグメント）に1つ** | フォワーディング | そのリンク上で**ルートブリッジに最も近い側**（ルートパスコストが最小のスイッチ側）のポート |
| **非指定ポート** | 上記のどちらにもならなかったポート | **ブロッキング** | ループを防ぐためにデータを転送しない |

**ルートブリッジのポートは、すべて指定ポートになります。** ルートブリッジ自身のルートパスコストは0なので、どのリンクでも相手より近い（または同じ）からです。逆に、**ルートブリッジにはルートポートは存在しません**（ルートポートは「ルートブリッジへ向かうポート」なので、ルートブリッジ自身には不要）。これは頻出のひっかけポイントです。

### 13.3 タイブレーク（同点の場合の決め方）

ルートポートや指定ポートを選ぶとき、比べる値が同じだった場合は、次の順で比べます（いずれも**小さい方が優先**）。

**ルートポートの選出**（各非ルートブリッジで）：

1. ルートブリッジまでの**ルートパスコスト**が最小
2. 隣接スイッチ（BPDUの送信元）の**ブリッジID**が最小
3. 隣接スイッチの**ポートID**（ポート優先度＋ポート番号）が最小
4. （まれ）自分のポートIDが最小

**指定ポートの選出**（各リンクで）：

1. そのリンクの両端のスイッチのうち、**ルートパスコスト**が小さい方のポート
2. 同じなら、**ブリッジID**が小さいスイッチのポート
3. 同じなら（同じスイッチの2ポートが同じセグメントにある場合）、**ポートID**が小さいポート

ポート優先度のデフォルトは128（0〜240の16の倍数）で、`show spanning-tree` の `Prio.Nbr` 列に `128.1` のように表示されます。

### 13.4 【解き方】ポートの役割の決定（代表例）

**例題**：次の3台のスイッチが三角形に接続されている。すべてのリンクは1Gbps（コスト4）、優先度はすべてデフォルト（32768）。各ポートの役割を求めよ。

```
                 SW1 (MAC 0000.0000.0001)
                Gi0/1            Gi0/2
                 /                  \
                /                    \
            Gi0/1                    Gi0/1
  SW2 (MAC 0000.0000.0002)      SW3 (MAC 0000.0000.0003)
            Gi0/2 ------------------ Gi0/2
```

**ステップ1：ルートブリッジを選ぶ**

- 優先度はすべて32768で同じ → MACアドレスを比較。
- 0000.0000.0001 が最小 → **SW1がルートブリッジ**。

**ステップ2：非ルートブリッジ（SW2、SW3）でルートポートを選ぶ**

- SW2：
  - Gi0/1経由（SW1に直接）：コスト 4
  - Gi0/2経由（SW3を経由）：コスト 4＋4 = 8
  - → **Gi0/1 がルートポート**
- SW3：
  - Gi0/1経由（SW1に直接）：コスト 4
  - Gi0/2経由（SW2を経由）：コスト 8
  - → **Gi0/1 がルートポート**

**ステップ3：各リンクで指定ポートを選ぶ**

- リンク SW1-SW2：SW1（ルートパスコスト0）側が近い → **SW1 Gi0/1 が指定ポート**
- リンク SW1-SW3：同様に → **SW1 Gi0/2 が指定ポート**（ルートブリッジのポートはすべて指定ポート）
- リンク SW2-SW3：
  - SW2のルートパスコスト = 4、SW3のルートパスコスト = 4 → 同点
  - タイブレーク：ブリッジIDを比較。SW2（…0002）＜ SW3（…0003）
  - → **SW2 Gi0/2 が指定ポート**

**ステップ4：残りを非指定ポート（ブロッキング）にする**

- 残ったのは **SW3 Gi0/2** → **非指定ポート（ブロッキング）**

**結果**：

```
                  SW1 [ルートブリッジ]
                DP Gi0/1      Gi0/2 DP
                 /                  \
             RP Gi0/1              Gi0/1 RP
              SW2                    SW3
             DP Gi0/2 ------------X Gi0/2 非指定(BLK)
```

| スイッチ | ポート | 役割 | 状態 |
|---|---|---|---|
| SW1 | Gi0/1 | 指定ポート | フォワーディング |
| SW1 | Gi0/2 | 指定ポート | フォワーディング |
| SW2 | Gi0/1 | ルートポート | フォワーディング |
| SW2 | Gi0/2 | 指定ポート | フォワーディング |
| SW3 | Gi0/1 | ルートポート | フォワーディング |
| SW3 | Gi0/2 | 非指定ポート | ブロッキング |

**チェックのコツ**：

- ルートポートの数 = 非ルートブリッジの台数（この例では2）。
- 指定ポートの数 = リンクの本数（この例では3）。
- ブロックされるのは「ルートブリッジから遠い側」のポート。

**応用：速度が違う場合**

もしSW1-SW3間が100Mbps（コスト19）だったら、SW3のルートポートは：

- Gi0/1経由（直接）：19
- Gi0/2経由（SW2経由）：4＋4 = 8 → こちらが小さい
- → **SW3のルートポートはGi0/2**。SW1-SW3間リンクでは、SW1 Gi0/2が指定ポート、SW3 Gi0/1 が非指定ポート（ブロッキング）になります。

「直接つながっている経路が常に選ばれるとは限らない。合計コストで判断する」ことが重要です。

### 13.5 ポートの役割の確認

```
SW3# show spanning-tree vlan 1

VLAN0001
  Spanning tree enabled protocol ieee
  Root ID    Priority    32769
             Address     0000.0000.0001
             Cost        4
             Port        1 (GigabitEthernet0/1)
...
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Root FWD 4         128.1    P2p
Gi0/2               Altn BLK 4         128.2    P2p
```

- `Root ID` の `Cost 4` が自分のルートパスコスト、`Port` がルートポート。
- `Role`：`Root`（ルートポート）、`Desg`（指定ポート）、`Altn`（代替ポート）、`Back`（バックアップポート）。CiscoのPVST+の表示でも、非指定ポートは `Altn` と表示されることが多いです。
- `Sts`：`FWD`（フォワーディング）、`BLK`（ブロッキング）、`LIS`（リスニング）、`LRN`（ラーニング）など。

### ひっかけポイント・よくある誤解

- **ルートポートと指定ポートの違い**：ルートポートは「非ルートブリッジに1つずつ」、指定ポートは「各リンクに1つずつ」。
- **非指定ポートはブロッキング**になり、ループを防ぎます。
- **エッジポート**はPCなどの端末を接続するポート（PortFastを設定したポート）で、ルートポートとは別の概念です。
- **ルートブリッジのポートはすべて指定ポート。**「すべてルートポート」「1つだけルートポート」は誤り（ルートブリッジにルートポートはない）。「すべて非指定（ブロッキング）」も誤り（ルートブリッジのポートはブロックされない。ブロックされるのはルートブリッジから遠い側）。
- **パスコストは速いほど小さい。** 2は10Gbps、19は100Mbps、100は10Mbps。1Gbpsは4。

### 試験のポイント

- ショート方式のコスト：**10M=100、100M=19、1G=4、10G=2**。
- 役割決定の順：ルートブリッジ → ルートポート → 指定ポート → 非指定ポート（ブロック）。
- ルートポート = 非ルートブリッジごとにルートブリッジまでのコスト最小のポート（1つ）。
- 指定ポート = 各リンクでルートブリッジに近い側（1つ）。
- **ルートブリッジのポートはすべて指定ポート、ルートポートはない**。
- 同点なら、隣接ブリッジID → 隣接ポートIDの順で比較（小さい方が優先）。

### 関連問題

- na-015、na-016、na-017

---

## 14. STPのポートの状態とタイマー

### 14.1 802.1D のポートの状態

従来のSTP（IEEE 802.1D）では、ポートは次の状態を持ちます（ほかに管理的に無効な「ディセーブル」があります）。

| 順 | 状態 | データの転送 | MACアドレスの学習 | BPDU | 滞在時間 |
|---|---|---|---|---|---|
| ① | **ブロッキング** | しない | しない | **受信のみ** | 経路の故障を検知して抜けるまで最大**20秒**（最大エージタイマー） |
| ② | **リスニング** | しない | **しない** | 送受信（ポートの役割を決める） | **15秒**（転送遅延タイマー） |
| ③ | **ラーニング** | しない | **する** | 送受信 | **15秒**（転送遅延タイマー） |
| ④ | **フォワーディング** | **する** | する | 送受信 | 安定状態 |

ブロックされていたポートが転送できるようになるまでの順番は：

```
 ブロッキング ──(最大20秒)──▶ リスニング ──(15秒)──▶ ラーニング ──(15秒)──▶ フォワーディング
     ①                          ②                      ③                       ④
```

- **リスニング**では、BPDUを送受信してポートの役割を決めます。この段階ではまだMACアドレスを学習しません。
- **ラーニング**では、MACアドレスの学習を始めます。いきなり転送を始めると、テーブルが空でフラッディングが多発するため、先に学習だけしておくのです。データはまだ転送しません。
- **フォワーディング**で、ようやくデータの転送を始めます。

### 14.2 STPのタイマー

| タイマー | デフォルト | 意味 |
|---|---|---|
| **Hello タイマー** | **2秒** | ルートブリッジがBPDUを送る間隔 |
| **最大エージ（Max Age）** | **20秒** | BPDUが届かなくなってから、その情報を破棄するまでの時間（＝Helloの10倍） |
| **転送遅延（Forward Delay）** | **15秒** | リスニング、ラーニングのそれぞれに滞在する時間 |

### 14.3 収束時間

- **間接的な障害**（自分のリンクではなく、離れた場所の故障）で、ブロッキングのポートが切り替わる場合：
  - 最大エージ20秒 ＋ リスニング15秒 ＋ ラーニング15秒 ＝ **最大50秒**
- **直接の障害**（自分のルートポートのリンクダウンを直接検知）や、新しくポートが起動した場合：
  - リスニング15秒 ＋ ラーニング15秒 ＝ **30秒**

この「30〜50秒」の遅さが従来のSTPの大きな欠点で、これを改善したのが **RSTP（IEEE 802.1w）** です（第16章）。RSTPのポートの状態は**ディスカーディング・ラーニング・フォワーディングの3つ**に整理されています。

| 802.1D（STP） | 802.1w（RSTP） |
|---|---|
| ディセーブル | ディスカーディング |
| ブロッキング | ディスカーディング |
| リスニング | ディスカーディング |
| ラーニング | ラーニング |
| フォワーディング | フォワーディング |

### ひっかけポイント・よくある誤解

- 順番は**ブロッキング → リスニング → ラーニング → フォワーディング**。「ラーニング → リスニング」と逆にしないこと（先に役割を決め（リスニング）、次に学習（ラーニング））。
- **リスニングではMACアドレスを学習しない**。学習を始めるのはラーニングから。
- **ラーニングではまだデータを転送しない**。
- ブロッキングでも**BPDUの受信はしている**（だから経路の変化を検知できる）。

### 試験のポイント

- 802.1Dの状態遷移：**ブロッキング → リスニング（15秒） → ラーニング（15秒） → フォワーディング**。
- タイマー：Hello 2秒、最大エージ 20秒、転送遅延 15秒。
- 収束時間：最大 20＋15＋15 = **50秒**（直接障害や新規ポートは30秒）。
- RSTPの状態は**ディスカーディング・ラーニング・フォワーディング**の3つ。

### 関連問題

- na-018

---

## 15. PortFastとSTPの保護機能

STPは「ループを防ぐ」ことが本来の目的ですが、端末用ポートの待ち時間や、想定外の機器の接続、片方向のリンク障害など、運用上の問題に対応するために、いくつかの追加機能があります。名前が似ているので、**「何をきっかけに」「どう動くか」**で整理しましょう。

### 15.1 PortFast

**PortFast** は、PCやサーバなどの**端末を接続するポート**を、**リスニングとラーニングを省略してすぐにフォワーディング状態**にする機能です。

- PCをつないでから約30秒（リスニング15秒＋ラーニング15秒）待たずに通信できるようになります。DHCPのタイムアウトなどを防げます。
- 端末は（通常）ループを作らないので、待ち時間を省略しても問題ありません。
- PortFastを設定したポートは、RSTPでは**エッジポート**として扱われます。
- **スイッチ同士を接続するポートで使ってはいけません。** すぐにフォワーディングになるため、ループの危険があります。

```
! インターフェース単位
SW1(config)# interface fa0/1
SW1(config-if)# spanning-tree portfast
%Warning: portfast should only be enabled on ports connected to a single
 host. Connecting hubs, concentrators, switches, bridges, etc... to this
 interface  when portfast is enabled, can cause temporary bridging loops.
 Use with CAUTION

! 全アクセスポートでデフォルト有効（グローバル）
SW1(config)# spanning-tree portfast default
```

> 補足：新しいIOS-XEでは `spanning-tree portfast edge`、`spanning-tree portfast edge default` という書式も使われます。トランクで接続したサーバなどには `spanning-tree portfast trunk` を使います。

### 15.2 BPDUガード

**BPDUガード** は、そのポートで**どんなBPDUでも受信したら、ポートを err-disabled（エラーによる無効）状態にして停止**する機能です。

- PortFastのポートには本来、端末しかつながらないはずです。そこでBPDUを受信したら「スイッチが誤って（または悪意を持って）接続された」と判断して止めます。
- **PortFastとセットで設定するのが定番**です。安全側（ループを防ぐ側）に働きます。

```
SW1(config)# interface fa0/1
SW1(config-if)# spanning-tree portfast
SW1(config-if)# spanning-tree bpduguard enable

! または、PortFastのポート全体でデフォルト有効
SW1(config)# spanning-tree portfast bpduguard default
```

err-disabled になったときのログと状態：

```
%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Fa0/1 with BPDU Guard enabled.
 Disabling port.
%PM-4-ERR_DISABLE: bpduguard error detected on Fa0/1, putting Fa0/1 in err-disable state

SW1# show interfaces status err-disabled
Port      Name               Status       Reason               Err-disabled Vlans
Fa0/1                        err-disabled bpduguard
```

復旧方法：原因（つないだスイッチ）を取り除いてから、`shutdown` → `no shutdown`。または `errdisable recovery cause bpduguard` で自動復旧させます。

### 15.3 ルートガード

**ルートガード** は、そのポートで**より優先度の高い（＝ブリッジIDが小さく、ルートブリッジになろうとする）優れたBPDU（superior BPDU）を受信したら、ポートを root-inconsistent 状態にして使えない状態にし、ルートブリッジの位置を守る**機能です。

- 背景：誰かが優先度を低く設定したスイッチを接続すると、そのスイッチがルートブリッジになり、トラフィックの流れが大きく変わってしまいます。
- 設定場所：**ルートブリッジにしてはいけない方向のポート**（ネットワークの端にあるスイッチや、下位のアクセススイッチへ向かうポートなど）。
- **優れたBPDUが止まれば、自動で復旧します**（err-disabledとは違い、手動での復旧は不要）。
- 通常のBPDU（劣ったBPDU）は受け付けるので、下位のスイッチが接続されていても問題ありません。

```
SW1(config)# interface g0/10
SW1(config-if)# spanning-tree guard root

%SPANTREE-2-ROOTGUARD_BLOCK: Root guard blocking port GigabitEthernet0/10 on VLAN0001.

SW1# show spanning-tree inconsistentports
Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
VLAN0001             GigabitEthernet0/10      Root Inconsistent
```

### 15.4 ループガード

**ループガード** は、**BPDUが届かなくなった**ブロッキング（非指定・代替）ポートやルートポートが、**誤ってフォワーディング状態になるのを防ぐ**機能です。

- 背景：STPは「BPDUが届かない＝相手（上流）はいなくなった」と判断し、ブロックしていたポートを指定ポートにしてフォワーディング状態にします。ところが、**片方向だけ通信できなくなった光ファイバのリンク**（単方向リンク障害）では、相手は生きているのにBPDUだけが届かなくなります。ここでポートが転送を始めると**ループの原因**になります。
- ループガードは、BPDUが途絶えた理由が分からない場合は、ポートを **loop-inconsistent 状態**にして**転送を止めたまま**にします。BPDUが再び届けば自動で復旧します。

```
SW1(config)# interface g0/2
SW1(config-if)# spanning-tree guard loop

! グローバルで有効にする場合
SW1(config)# spanning-tree loopguard default
```

> 関連：単方向リンクを直接検出する UDLD（Unidirectional Link Detection）というCisco独自の機能もあります。

### 15.5 BPDUフィルタ

**BPDUフィルタ** は、そのポートで**BPDUを送らず、受信しても無視する**機能です。つまり**BPDUの送受信そのものを止めて**しまいます。

- インターフェースに設定した場合（`spanning-tree bpdufilter enable`）、そのポートではSTPが実質的に動作しなくなります。
- BPDUフィルタを設定したポートにスイッチをつなぐと、**STPがそのリンクを認識できず、ループを防げなくなります**。使い方を誤るとループの原因になるため、注意が必要です。
- 「BPDUを止める」点で、安全側に働く他の保護機能とは性格が違います。

> 補足：グローバルの `spanning-tree portfast bpdufilter default` は動作が少し異なり、PortFastのポートでBPDUを受信するとPortFastを解除して通常のSTPポートに戻ります。インターフェースに直接設定した場合が「完全に送受信を止める」動作です。

```
SW1(config)# interface fa0/1
SW1(config-if)# spanning-tree bpdufilter enable
```

### 15.6 比較表

| 機能 | きっかけ | 動作 | 状態 | 復旧 | 主な設定場所 |
|---|---|---|---|---|---|
| **PortFast** | ポートのリンクアップ | リスニング・ラーニングを省略しすぐフォワーディング | （エッジポート） | ― | 端末接続ポート |
| **BPDUガード** | **どんなBPDUでも**受信 | ポートを停止 | **err-disabled** | 手動（shut/no shut）か errdisable recovery | PortFastのポート |
| **ルートガード** | **優れたBPDU**を受信 | ポートを使えなくする（ルートブリッジを守る） | **root-inconsistent** | 優れたBPDUが止まれば**自動** | ルートにしてはいけない方向のポート |
| **ループガード** | **BPDUが届かなくなる** | 転送を止めたままにする | **loop-inconsistent** | BPDUが届けば自動 | ブロッキング/ルートポート（スイッチ間） |
| **BPDUフィルタ** | ― | **BPDUを送らず、受信も無視** | ― | ― | 慎重に使う（誤用でループの原因） |

覚え方：

- BPDU**ガード**：「BPDUが**来たら止める**」
- BPDU**フィルタ**：「BPDUを**無視する**」（名前は似ているが動作は大きく違う）
- **ルート**ガード：「**ルート**になろうとするBPDUが来たら止める」
- **ループ**ガード：「BPDUが**来なくなったら**止める」

### ひっかけポイント・よくある誤解

- **「PortFastはスイッチ同士を接続するポートで設定することが推奨される」は誤り。** スイッチ間で使うとループの危険があります。PortFastは端末を接続するポート専用。
- **「BPDUを受信したらポートを停止する」のはBPDUガード**であって、PortFastではありません（PortFastと組み合わせて使うことが多い）。
- **「複数リンクをまとめて帯域を増やす」のはEtherChannel**です。
- **PortFastは保護機能ではありません。** むしろ使い方を誤るとループの危険を高めます。
- **BPDUガードは「どんなBPDUでも」受信したら err-disabled。** ルートガードは「優れたBPDU」だけが対象で、root-inconsistent にして自動復旧。
- **ループガードはBPDUが届かなくなったときに働く機能**。優れたBPDUを受信したときに働くのはルートガード（ルートガードはBPDUが届かない場合には働きません）。
- **BPDUフィルタはループを防ぐ機能ではありません。** BPDUの送受信を止めるので、誤用するとループの原因になります。

### 試験のポイント

- PortFast：端末用ポートで、リスニング・ラーニングを省略してすぐフォワーディング。**BPDUガードとセット**。
- BPDUガード：BPDUを受信したら **err-disabled**。
- ルートガード：優れたBPDUを受信したら **root-inconsistent**。ルートブリッジの位置を守る。自動復旧。
- ループガード：BPDUが途絶えたら **loop-inconsistent**。単方向リンク障害によるループを防ぐ。
- BPDUフィルタ：BPDUを送らず受信も無視。**誤用でループの原因**。

### 関連問題

- na-019、na-029、na-030、na-031

---

## 16. RSTP と Rapid PVST+

### 16.1 RSTP（IEEE 802.1w）とは

**RSTP（Rapid Spanning Tree Protocol、IEEE 802.1w）** は、従来のSTP（802.1D）の**収束の遅さを改善**したIEEE標準のプロトコルです。現在は802.1D-2004に統合されています。

| 項目 | STP（802.1D） | RSTP（802.1w） |
|---|---|---|
| 標準 | IEEE | **IEEE**（Cisco独自ではない） |
| 収束時間 | 30〜50秒 | **数秒以内**（多くの場合1〜2秒以下） |
| ルートブリッジの選出 | あり | **あり**（同じ方法） |
| ルートポート・指定ポート | あり | **あり**（同じ考え方） |
| 予備のポート | 非指定ポート（ブロッキング）とひとまとめ | **代替ポート**と**バックアップポート**に分けて、あらかじめ予備の経路を決めておく |
| ポートの状態 | ブロッキング・リスニング・ラーニング・フォワーディング（＋ディセーブル） | **ディスカーディング・ラーニング・フォワーディング** |
| 端末用ポート | PortFast（Cisco拡張） | **エッジポート**として標準化 |
| BPDU | ルートブリッジが送り、他は中継 | **全スイッチが2秒ごとに自分でBPDUを送る**（3回分＝6秒届かなければ障害と判断） |
| 切り替えの方法 | タイマー待ち | 隣接スイッチと直接やり取り（**提案/合意＝Proposal/Agreement**）してすぐに切り替え |

**RSTPもループを防ぎます。** 速さを優先してループ防止を犠牲にしているわけではありません。ループを防ぐことがSTPの仲間（STP/RSTP/MSTP）の本来の目的です。

### 16.2 RSTPのポートの役割

| 役割 | 説明 | 状態 |
|---|---|---|
| **ルートポート** | 非ルートブリッジでルートブリッジへのコストが最小のポート（STPと同じ） | フォワーディング |
| **指定ポート** | 各リンクでルートブリッジに最も近い側のポート（STPと同じ） | フォワーディング |
| **代替ポート（alternate port）** | **ルートポートが故障したときにすぐ代わりになる、ルートブリッジへの予備の経路**。他のスイッチから優れたBPDUを受信しているポート | ディスカーディング |
| **バックアップポート（backup port）** | **同じスイッチの指定ポートと同じセグメントにつながる予備のポート**。自分自身のBPDUを受信している状態。ハブを使うような共有セグメントの古い構成でしか現れない | ディスカーディング |
| （エッジポート） | PCなどの端末をつなぐポート。PortFastを設定したポート | フォワーディング |

```
 代替ポートのイメージ

        [Root]
        /     \
      DP       DP
      /         \
    RP           RP
  [SW2]DP------ALT[SW3]
                ↑
         代替ポート：SW3のRPが故障したら、
         すぐにこのポートがルートポートになる

 バックアップポートのイメージ（ハブによる共有セグメント）

    [SW1] Gi0/1(DP) ----+
                        [Hub]
    [SW1] Gi0/2(Backup)-+
         ↑ 同じスイッチの指定ポートと同じセグメント
```

従来のSTPでは「ブロッキングのポート」とひとまとめにしていたものを、**代替**と**バックアップ**に分け、予備の経路をあらかじめ決めておくことで、切り替えを速くしています。

### 16.3 リンクタイプ

RSTPは、ポートの種類（リンクタイプ）によって高速な切り替えができるかを判断します。

| リンクタイプ | 条件 | 高速な切り替え |
|---|---|---|
| ポイントツーポイント（P2p） | 全二重のスイッチ間リンク | 可能 |
| 共有（Shr） | 半二重（ハブ経由など） | 不可（従来の動作） |
| エッジ（Edge） | PortFastを設定した端末用ポート | すぐにフォワーディング |

`show spanning-tree` の `Type` 列に `P2p`、`Shr`、`P2p Edge` などと表示されます。

### 16.4 Ciscoのスパニングツリーのモード

| モード | 標準/独自 | 内容 |
|---|---|---|
| STP（802.1D） | IEEE | 全VLANで1つのツリー（CST） |
| **PVST+** | Cisco独自 | 従来のSTP（802.1D）を**VLANごと**に動かす。古い機種のデフォルト |
| RSTP（802.1w） | IEEE | 全VLANで1つの高速なツリー |
| **Rapid PVST+** | Cisco独自 | **RSTPをVLANごと**に動かす。収束が速い。多くの新しい機種のデフォルト |
| MSTP（802.1s） | IEEE | 複数のVLANをグループ（インスタンス）にまとめてツリーを作る |

PVST+ と Rapid PVST+ は、どちらも**VLANごとに個別のスパニングツリー**を動かすので、**VLANごとに異なるルートブリッジを選べます**。これにより、例えば VLAN 10 は SW1 をルート、VLAN 20 は SW2 をルートにして、リンクの負荷を分散できます。

### 16.5 設定と確認

```
! グローバル設定モードで Rapid PVST+ にする
SW1(config)# spanning-tree mode rapid-pvst

! PVST+（従来のSTPをVLANごと）に戻す
SW1(config)# spanning-tree mode pvst
```

```
SW1# show spanning-tree

VLAN0001
  Spanning tree enabled protocol rstp       ← Rapid PVST+ なら「rstp」
  Root ID    Priority    32769
  ...
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Root FWD 4         128.1    P2p
Gi0/2               Altn BLK 4         128.2    P2p
Fa0/1               Desg FWD 19        128.3    P2p Edge
```

- PVST+ のときは `Spanning tree enabled protocol ieee` と表示されます。
- `show spanning-tree summary` でも現在のモード（`Switch is in rapid-pvst mode`）を確認できます。
- RSTPでもディスカーディング状態のポートの `Sts` は、Ciscoの表示では `BLK` と表示されます。

### ひっかけポイント・よくある誤解

- **「RSTPはCisco独自」は誤り。** RSTPはIEEE標準（802.1w）。CiscoがVLANごとに動作するよう拡張したものが **Rapid PVST+**。
- **「RSTPはルートブリッジを選出しない」は誤り。** RSTPも最初にルートブリッジを選出します。
- **「RSTPは速さを優先するためループ防止機能がない」は誤り。** RSTPもループを防ぎます。
- **代替ポート**は「ルートポートの予備」、**バックアップポート**は「同じスイッチの指定ポートと同じセグメントの予備」（ハブ構成でのみ）。混同しないこと。
- **指定ポート**は各リンクでルートブリッジに最も近い側の転送するポート、**エッジポート**は端末をつなぐポート。どちらも「予備の経路」ではありません。
- **`spanning-tree mode pvst` はPVST+（従来のSTPをVLANごと）**にするコマンドで、Rapid PVST+ ではありません。
- **`spanning-tree portfast`、`spanning-tree vlan 1 root primary` ではモードは変わりません。**

### 試験のポイント

- RSTP = IEEE 802.1w。収束が速い（数秒以内）。ルートブリッジ・ルートポート・指定ポートの考え方は同じ。
- RSTPのポートの役割：ルート、指定、**代替（ルートポートの予備）**、**バックアップ（同一セグメントの予備）**＋エッジ。
- RSTPのポートの状態：ディスカーディング、ラーニング、フォワーディング。
- Rapid PVST+ = RSTPをVLANごとに動かすCisco方式。設定は `spanning-tree mode rapid-pvst`（グローバル）。
- 確認：`show spanning-tree` の `Spanning tree enabled protocol rstp`。

### 関連問題

- na-022、na-032、na-033

---

## 17. EtherChannel の基礎

### 17.1 なぜEtherChannelが必要か

スイッチ間の帯域を増やそうとして、ケーブルを4本つないだとします。ところが、STPから見るとこれは「4本の並行した経路＝ループ」なので、**1本以外はブロックされて**しまいます。帯域は1本分のまま、残り3本は予備としてしか使えません。

```
 EtherChannelなし
 [SW1]=====[SW2]   4本のうち、STPが3本をブロック → 使えるのは1本分
   ----------  FWD
   ----X-----  BLK
   ----X-----  BLK
   ----X-----  BLK

 EtherChannelあり
 [SW1]╔════╗[SW2]  4本を1本の論理リンク（Port-channel1）にまとめる
      ║ Po1║       → STPからは1本に見えるので、ブロックされない
      ╚════╝       → 4本すべてを同時に使える
```

**EtherChannel**（リンクアグリゲーション、LAG、ポートチャネルとも呼ぶ）は、**複数の物理リンクを1本の論理リンクとして扱う**技術です。

| 利点 | 説明 |
|---|---|
| 帯域の増加 | 1Gbps × 4本 で最大4Gbps相当の論理リンクになる |
| STPでブロックされない | STPからは1本のリンク（Port-channel）に見えるので、全リンクを使える |
| 冗長性 | 1本が故障しても、残りのリンクで通信を続けられる。STPの再計算も起きない |
| 管理の簡素化 | 設定を論理インターフェース（port-channel）でまとめて行える |

### 17.2 負荷分散のしくみ

EtherChannelでは、通信は**メンバーリンク間で負荷分散**されます。ただし、1つのフレームを分割して複数のリンクに流すのではなく、**送信元/宛先のMACアドレスやIPアドレスなどからハッシュ値を計算し、通信（フロー）ごとにどのリンクを使うか決めます**。そのため、1つのフローの最大速度はメンバー1本分です。

```
SW1(config)# port-channel load-balance src-dst-ip
SW1# show etherchannel load-balance
```

### 17.3 EtherChannelでないもの

| これは… | 担当する技術 |
|---|---|
| VLANごとに異なるルートブリッジを選ぶ | PVST+ / Rapid PVST+ |
| 通信を暗号化する | VPN（IPsec）、MACsec など。**EtherChannelは暗号化しない** |
| 異なるVLAN間で通信させる | ルーティング（ルータやL3スイッチ） |

### ひっかけポイント・よくある誤解

- **「EtherChannelでVLANごとに異なるルートブリッジを選べる」は誤り。** それはPVST+の機能です。
- **「EtherChannelでスイッチ間の通信が暗号化される」は誤り。**
- **「EtherChannelで異なるVLAN間で通信できる」は誤り。** VLAN間の通信にはルーティングが必要です。

### 試験のポイント

- EtherChannel = 複数の物理リンクを1本の論理リンク（port-channel）にまとめる。
- 帯域の増加＋STPでブロックされず全リンク使用＋1本の故障でも継続。
- 負荷分散はフロー単位（ハッシュ）。

### 関連問題

- na-023

---

## 18. LACP・PAgP・on モード

### 18.1 3つの構成方法

EtherChannelを構成する方法は3つあります。

| 方法 | 標準/独自 | モード（積極的 / 受け身） | 特徴 |
|---|---|---|---|
| **LACP**（Link Aggregation Control Protocol） | **IEEE標準**（802.3ad、現在は **802.1AX**） | **active** / **passive** | 他社の機器とも使える。**CCNAで特に重視** |
| **PAgP**（Port Aggregation Protocol） | **Cisco独自** | **desirable** / **auto** | Cisco機器同士のみ |
| **on**（静的） | ― | on | ネゴシエーションなしで**無条件**に束ねる |

### 18.2 モードの組み合わせ

考え方はDTPと同じで、**「少なくとも一方が積極的なら構成される」**、**受け身同士では構成されない**です。

**LACP**

| | active | passive |
|---|---|---|
| **active** | ○ 構成される（両方から誘う） | ○ 構成される（active が誘い passive が応じる） |
| **passive** | ○ 構成される | **× 構成されない**（どちらも待つだけでネゴシエーションが始まらない） |

**PAgP**

| | desirable | auto |
|---|---|---|
| **desirable** | ○ | ○ |
| **auto** | ○ | **× 構成されない** |

**on**

| | on | active（LACP） | desirable（PAgP） |
|---|---|---|---|
| **on** | ○ 構成される | **× 構成されない** | **× 構成されない** |

- **on はネゴシエーションのパケット（LACPDU/PAgPパケット）を送らない**ため、相手が active や desirable で誘ってきても応じられず、EtherChannelは構成されません。**on を使うなら相手側も on** にする必要があります。
- LACPとPAgPを混ぜる（active と desirable など）ことはできません。

### 18.3 on モードのリスク

on はネゴシエーションをしないので、**両端の設定の食い違い（片側だけEtherChannel、メンバーの接続先が別のスイッチなど）を検知できません**。その結果、ループなどの問題が起きることがあります。LACPを使えば、相手と確認し合ってから束ねるので安全です。

### 18.4 DTP・LACP・PAgPの比較まとめ

| | 積極的 | 受け身 | 受け身同士 |
|---|---|---|---|
| DTP | desirable（trunk） | auto | トランクにならない |
| LACP | active | passive | 構成されない |
| PAgP | desirable | auto | 構成されない |

「auto/passive 同士はだめ」とまとめて覚えましょう。PAgPとDTPはどちらも「desirable/auto」という同じ名前のモードを使います（どちらもCisco独自）。

### ひっかけポイント・よくある誤解

- **IEEE標準はLACP。PAgPはCisco独自。**
- **DTPはトランクを自動で構成するプロトコル**、**LLDPは隣接機器の情報を取得するプロトコル**で、EtherChannelのネゴシエーションとは無関係。
- **active と passive は構成されます。active と active も構成されます。** 構成されないのは passive と passive。「どの組み合わせでも構成される」も誤り。
- **`mode on` は「LACPで積極的にネゴシエーション」ではありません**（それは `mode active`）。**「PAgPで積極的にネゴシエーション」でもありません**（それは `mode desirable`）。**インターフェースの有効化（no shutdown）とも無関係**です。
- **on と active、on と desirable では構成されません。**

### 試験のポイント

- LACP = IEEE標準（802.3ad / 802.1AX）、active/passive。PAgP = Cisco独自、desirable/auto。on = ネゴシエーションなし。
- **passive 同士、auto 同士は構成されない。** 一方が active/desirable なら構成される。
- on は相手も on のときだけ。食い違いを検知できないので LACP の方が安全。

### 関連問題

- na-024、na-025、na-026

---

## 19. EtherChannel の設定・確認・トラブルシューティング（L2/L3）

### 19.1 L2 EtherChannel の設定（LACP）

```
         Gi0/1 ---------- Gi0/1
  [SW1]  Gi0/2 ---------- Gi0/2  [SW2]
            Port-channel 1（トランク）
```

```
SW1(config)# interface range g0/1 - 2
SW1(config-if-range)# channel-group 1 mode active     ← LACP（積極的）
Creating a port-channel interface Port-channel 1
SW1(config-if-range)# exit
SW1(config)# interface port-channel 1
SW1(config-if)# switchport mode trunk                 ← 論理IFでトランクに

SW2(config)# interface range g0/1 - 2
SW2(config-if-range)# channel-group 1 mode passive    ← LACP（受け身）でもOK（相手がactive）
SW2(config-if-range)# exit
SW2(config)# interface port-channel 1
SW2(config-if)# switchport mode trunk
```

- `channel-group <番号> mode <モード>` をメンバーの物理インターフェースで設定すると、同じ番号の `port-channel` インターフェースが自動で作られます。
- チャネルグループ番号はスイッチ内で意味を持つ番号で、両端で一致している必要はありません（そろえる方が分かりやすい）。
- LACPを明示したい場合は `channel-protocol lacp` も使えます。
- port-channel インターフェースの設定（トランク、許可VLANなど）は、メンバーにも反映されます。

### 19.2 メンバーポートで一致している必要がある設定

EtherChannelにまとめるメンバーポートは、次の設定がそろっている必要があります。そろっていないポートは束ねられず、**suspended（s）** などの状態になります。

| 一致が必要 | 例 |
|---|---|
| **速度とデュプレックス** | 1Gbps と 100Mbps のポートは混ぜられない |
| **スイッチポートのモード** | アクセス / トランク のどちらか |
| **アクセスVLAN**（アクセスの場合） | すべて同じVLAN |
| **トランクの設定**（トランクの場合） | 許可VLAN、ネイティブVLAN が同じ |
| L2 / L3 の種別 | すべて switchport か、すべて no switchport |

| 一致しなくてよい | 理由 |
|---|---|
| インターフェースの説明文（description） | メモのようなもので、動作に影響しない |
| インターフェースの番号が連続していること | Gi0/1 と Gi0/5 のように離れていても束ねられる（別のモジュールでもよい） |

### 19.3 確認：show etherchannel summary

```
SW1# show etherchannel summary
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator
        ...
Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SU)         LACP      Gi0/1(P)    Gi0/2(P)
```

| 表示 | 意味 |
|---|---|
| `Po1(SU)` | S = レイヤー2、U = 使用中（正常） |
| `Po1(RU)` | R = レイヤー3、U = 使用中 |
| `Po1(SD)` | D = ダウン（メンバーが束ねられていないなど） |
| `Gi0/1(P)` | **P = bundled**：正常に束ねられている |
| `Gi0/2(s)` | s = suspended：設定の不一致などで参加できない |
| `Gi0/2(I)` | I = stand-alone：ネゴシエーションが成立せず単独で動作（相手が passive 同士など） |
| `Gi0/2(D)` | D = down：リンクダウン |

その他の確認コマンド：`show etherchannel port-channel`、`show lacp neighbor`、`show interfaces port-channel 1`。

**トラブルシューティングの流れ**：

1. `show etherchannel summary` で `(P)` になっていないポートを探す。
2. `(s)` なら、速度・デュプレックス・モード・VLAN設定の不一致を `show running-config interface` で比較。
3. `(I)` や Po が `D` なら、両端のモードの組み合わせ（passive 同士、on と active など）を確認。

### 19.4 L3 EtherChannel

L3スイッチ同士を、**ルーテッドポート**として EtherChannel で接続することもできます（L3 EtherChannel）。

- メンバーポートと port-channel インターフェースの**両方で `no switchport`** を設定してルーテッドポートにする。
- **IPアドレスは port-channel インターフェースに1つだけ**設定する。
- L2 EtherChannel はスイッチポート（アクセス/トランク）として動作し、IPアドレスは持たない。

```
DSW1(config)# interface range g1/0/1 - 2
DSW1(config-if-range)# no switchport                 ← メンバーをルーテッドポートに
DSW1(config-if-range)# channel-group 10 mode active
DSW1(config-if-range)# exit
DSW1(config)# interface port-channel 10
DSW1(config-if)# no switchport                       ← 論理IFもルーテッドに
DSW1(config-if)# ip address 10.0.0.1 255.255.255.252
```

```
DSW1# show etherchannel summary
...
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
10     Po10(RU)        LACP      Gi1/0/1(P)  Gi1/0/2(P)
```

（設定の順序として、先に port-channel を `no switchport` にしてIPを付け、その後メンバーに `no switchport` と `channel-group` を設定する手順もあります。大事なのは**両方がルーテッドで、IPは port-channel にある**ことです。）

### ひっかけポイント・よくある誤解

- **説明文（description）が違っていても束ねられます。**
- **インターフェースの番号は連続していなくても束ねられます。**
- **L3 EtherChannel で、メンバーの物理インターフェースそれぞれにIPアドレスを設定するのは誤り。** それぞれが別のリンクとして扱われ、EtherChannelになりません。
- **SVI（interface vlan）はVLAN間ルーティング用**の仮想インターフェースで、L3 EtherChannel のIPの設定場所ではありません。
- **IPアドレスはグローバル設定モードでは設定できません**（インターフェースに設定するもの）。

### 試験のポイント

- メンバーで一致必須：**速度・デュプレックス、スイッチポートのモード、アクセスVLAN／トランクの許可VLAN・ネイティブVLAN**。
- 一致不要：description、番号の連続性。
- 確認：`show etherchannel summary`。**P = bundled（正常）**、s = suspended、I = stand-alone。SU = L2で使用中、RU = L3で使用中。
- L3 EtherChannel：メンバーと port-channel の両方に `no switchport`、**IPは port-channel**。

### 関連問題

- na-027、na-028

---

## 20. 無線LANのアーキテクチャ

### 20.1 3つのアーキテクチャ

無線LANのアクセスポイント（AP）をどう管理するかによって、アーキテクチャは大きく3種類に分かれます。

| アーキテクチャ | AP | 管理方法 | 向いている環境 |
|---|---|---|---|
| **自律型**（スタンドアロン、Autonomous） | 自律型AP | **1台ずつ個別に設定**。WLCなしで単独で動作 | 台数が少ない環境（家庭、小規模オフィス）。台数が増えると管理の手間が大きい |
| **コントローラ型**（集中管理型） | **ライトウェイトAP**（LAP） | **WLC（ワイヤレスLANコントローラ）**で集中管理。APとWLCはCAPWAPでつながる。機能をAPとWLCで分担（**SplitMAC**） | 中〜大規模の企業 |
| **クラウド型** | クラウド管理型AP | **インターネット上のクラウドのダッシュボード**で管理（例：**Cisco Meraki**） | 多拠点、IT担当者が少ない組織 |

（ほかに、WLCの機能をAPに組み込んだ Embedded Wireless Controller / Mobility Express といった形態もあります。）

```
 自律型
   [AP1] [AP2] [AP3]   ← 1台ずつ設定（Web/CLI）
     |     |     |
   ----- スイッチ -----

 コントローラ型（SplitMAC）
   [LAP1] [LAP2] [LAP3]
     \      |      /
      CAPWAPトンネル
          \ | /
          [WLC]   ← 設定・管理を一元化

 クラウド型
   [AP1] [AP2]  ←── インターネット ──→ [クラウドのダッシュボード]
```

### 20.2 SplitMAC

コントローラ型では、無線のMAC層の機能をAPとWLCで分担します（**SplitMAC**）。

| ライトウェイトAPが担当（リアルタイム処理） | WLCが担当（管理処理） |
|---|---|
| ビーコンやプローブ応答の送信 | 認証・アソシエーションの管理 |
| フレームの送受信・確認応答（ACK） | セキュリティポリシーの管理 |
| 暗号化・復号 | チャネルや送信出力の管理（RRM） |
| キューイング、優先度の処理 | クライアントのローミングの管理、QoSのポリシー |

### 20.3 自律型APとスイッチポート

自律型APで複数のSSIDを別々のVLANに流す場合（例：SSID「Corp」→VLAN 10、SSID「Guest」→VLAN 20）、APが自分で各VLANのタグを付けてスイッチに渡すので、**接続するスイッチポートはトランク**にします。SSIDが1つだけならアクセスポートでも構いません。

### ひっかけポイント・よくある誤解

- **「WLCとCAPWAPのトンネルを作り、WLCから設定を受け取る」のはライトウェイトAP**の説明で、自律型APではありません。
- **「インターネット上のクラウドからのみ設定できる」のはクラウド管理型AP**（例：Cisco Meraki）の説明です。
- **「クライアントの接続を受け付けず、電波の監視だけを行う」のはWLCで管理するAPのモニターモード**の説明です。

### 試験のポイント

- 自律型 = 1台ずつ個別設定、WLCなし、小規模向け。
- コントローラ型 = ライトウェイトAP＋WLC、CAPWAP、SplitMAC。
- クラウド型 = クラウドのダッシュボード（Meraki）。
- 自律型APで複数SSID→複数VLANなら、スイッチポートはトランク。

### 関連問題

- na-049

---

## 21. CAPWAP とライトウェイトAP

### 21.1 CAPWAPとは

**CAPWAP（Control And Provisioning of Wireless Access Points）** は、**ライトウェイトAPとWLCの間**で使われる**トンネルのプロトコル**（IETF標準、RFC 5415）です。

CAPWAPは2つのトンネルを作ります。

| トンネル | 運ぶもの | ポート | 暗号化 |
|---|---|---|---|
| **制御用**（コントロール） | APの設定、管理、ファームウェアの配布などの制御メッセージ | UDP **5246** | **DTLSで暗号化される**（必須） |
| **データ用** | クライアントのデータ（無線フレームをカプセル化したもの） | UDP **5247** | 暗号化は任意（デフォルトでは暗号化されないことが多い） |

```
  [クライアント]~~~(無線)~~~[LAP]=========CAPWAP=========[WLC]---有線ネットワーク
                              ├ 制御トンネル  UDP 5246（DTLSで暗号化）
                              └ データトンネル UDP 5247
                         （IPでカプセル化されるので、ルータを越えてもよい）
```

CAPWAPはIPパケットでカプセル化されるため、**APとWLCが別のネットワーク（サブネット）にあっても、ルータを越えて管理できます**。

### 21.2 ライトウェイトAPの起動の流れ

1. APが起動し、DHCPでIPアドレスを取得する。
2. WLCを見つける（DHCPのオプション43、DNSで `CISCO-CAPWAP-CONTROLLER.<ドメイン>` を解決、ブロードキャスト、以前に接続したWLCの記憶など）。
3. WLCとCAPWAPのトンネルを作る（制御トンネルはDTLSで保護）。
4. 必要ならWLCからソフトウェア（ファームウェア）をダウンロードする。
5. WLCから設定をダウンロードして動作を始める。

### 21.3 他のカプセル化・タグ技術との区別

| 技術 | 用途 |
|---|---|
| **CAPWAP** | **ライトウェイトAP ↔ WLC のトンネル** |
| VXLAN | SD-Access のオーバーレイなどで使われるカプセル化技術 |
| 802.1Q | トランクでVLANタグを付ける規格（トンネルではない） |
| LACP | EtherChannelを構成するためのプロトコル |

### ひっかけポイント・よくある誤解

- **VXLANはSD-Accessのオーバーレイなどのカプセル化技術**で、AP-WLC間のトンネルではありません。
- **802.1QはVLANタグの規格**で、トンネルのプロトコルではありません。
- **LACPはEtherChannelのプロトコル**です。
- CAPWAPの**制御用のトンネルは暗号化される**（DTLS）。データ用は任意。

### 試験のポイント

- ライトウェイトAP ↔ WLC は **CAPWAP**。制御用（UDP 5246、DTLSで暗号化）とデータ用（UDP 5247）の2つのトンネル。
- IPでカプセル化されるので、ルータを越えてWLCが遠くにあってもよい。
- LAPはWLCを見つけてCAPWAPトンネルを作り、設定・ソフトウェアをWLCからダウンロードする。

### 関連問題

- na-042

---

## 22. APのモード

### 22.1 主なAPのモード

WLCで管理するライトウェイトAPは、用途に合わせてWLCからモードを切り替えます。

| モード | クライアントの接続 | 説明 |
|---|---|---|
| **ローカル**（Local） | ○ | **標準のモード**。クライアントの接続を受け付け、**すべての通信をCAPWAPでWLCへトンネル**する。空き時間に他のチャネルも少しずつ監視する |
| **FlexConnect** | ○ | **支社などのAP向け**。クライアントの通信を、**WLCを経由せずにその場（AP側）でスイッチへ転送**できる（**ローカルスイッチング**）。WANが切れても支社内の通信を続けられる |
| **モニター**（Monitor） | × | **監視専用**。クライアントの接続は受け付けず、**すべてのチャネルを順に監視**して、**不正なAP（rogue AP）や干渉、攻撃**を検知する（wIPSなど） |
| **スニファー**（Sniffer） | × | 1つのチャネルの無線通信を**キャプチャし、解析ツール（Wiresharkなど）を動かすPCへ送る**専用モード |
| **不正検知**（Rogue Detector） | × | 無線は使わず、有線側を監視して、不正なAPのクライアントのMACアドレスが有線ネットワークにいるかを調べる |
| **ブリッジ / メッシュ**（Bridge / Mesh） | ○（構成による） | **APを無線でつないで**、建物間などをつなぐ（ポイントツーポイント／ポイントツーマルチポイントのブリッジ、メッシュ網） |
| SE-Connect | × | スペクトラム解析専用（電波の干渉源の分析） |

### 22.2 ローカルモードと FlexConnect の比較

```
 ローカルモード（支社のAPを本社WLCで管理）
   支社                                 本社
 [PC]~~[AP]--[SW]--[R]====WAN====[R]--[WLC]--[有線ネットワーク]
            \______ CAPWAP（データもすべてWLCへ） ______/
   ・支社内のPC同士の通信も、毎回WANを越えてWLCまで往復 → 遅延大
   ・WANが切れるとクライアントは通信できない

 FlexConnect（ローカルスイッチング）
   支社                                 本社
 [PC]~~[AP]--[SW]--[R]====WAN====[R]--[WLC]
            \__ CAPWAP（制御のみ／一部のWLAN） __/
        └→ データは支社のスイッチへ直接（ローカルスイッチング）
   ・管理はWLCで行いつつ、データはその場で流す
   ・WANが切れても、支社内の通信を続けられる（スタンドアロン動作）
```

| 項目 | ローカルモード | FlexConnect |
|---|---|---|
| クライアントのデータ | 常にWLCへ（中央スイッチング） | AP側でスイッチへ（ローカルスイッチング）も可能 |
| WAN障害時 | 通信不可 | 支社内の通信を継続可能 |
| 遅延 | WANを往復するので大きい | 小さい |
| APを接続するスイッチポート | アクセスポートでよい | ローカルスイッチングで複数VLANを使うならトランク |

### ひっかけポイント・よくある誤解

- **ローカルモードは「通常のモード」**で、クライアントの接続を受け付けます。監視専用ではありません。また、WANが切れるとクライアントは通信できなくなります。
- **FlexConnectは支社向け**で、クライアントの通信をWLCを経由せずにその場で転送できます。監視専用モードではありません。
- **モニターモードとスニファーモードはクライアントの接続を受け付けません。** モニター＝不正APや干渉・攻撃の検知、スニファー＝キャプチャして解析ツールへ送る。
- **ブリッジモードはAPを無線でつないで建物間などを接続する**モードです。

### 試験のポイント

- クライアント接続なしで監視だけ → **モニターモード**（不正AP・干渉・攻撃の検知）。
- 支社でWANが切れても通信継続 → **FlexConnect**（ローカルスイッチング）。
- 標準 → **ローカル**（全通信をCAPWAPでWLCへ）。
- キャプチャして解析ツールへ → **スニファー**。建物間の無線接続 → **ブリッジ/メッシュ**。

### 関連問題

- na-040、na-041

---

## 23. AP・WLCを接続するスイッチポートの設定

### 23.1 ローカルモードのライトウェイトAPを接続するポート → アクセスポート

ローカルモードでは、**どのSSIDのクライアントの通信も、APからWLCへのCAPWAPのトンネル**で運ばれます。スイッチから見ると、APのポートには**APの管理用VLANのIPパケット（CAPWAP）**しか流れません。したがって、**アクセスポート**（1つのVLAN）で足ります。

```
SW1(config)# interface g0/5
SW1(config-if)# description LAP-1F
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 100        ← APの管理用VLAN
SW1(config-if)# spanning-tree portfast
```

APにPoE（Power over Ethernet）で給電することも一般的です。

### 23.2 トランクにするケース

| 接続する機器 | ポートの設定 | 理由 |
|---|---|---|
| ローカルモードのライトウェイトAP | **アクセスポート** | 全SSIDの通信がCAPWAPに入るので、1つのVLANでよい |
| 自律型AP（複数SSIDを別VLANへ） | **トランク** | APが自分でSSIDごとのVLANタグを付けてスイッチへ渡す |
| FlexConnectでローカルスイッチングするAP（複数VLAN） | **トランク** | AP側で各WLANのVLANにタグを付けてスイッチへ流す |
| **WLC（ディストリビューションシステムポート）** | **トランク**（WLANで使う複数のVLANを許可） | WLANごとにクライアントの通信を異なるVLANへ出す |

### 23.3 WLCのディストリビューションシステムポート

WLCの**ディストリビューションシステムポート（DSポート）**は、WLCを**有線ネットワーク側**につなぐポートです。WLCは、例えば

- 社員用のWLAN（SSID「Corp」）→ VLAN 10
- 来客用のWLAN（SSID「Guest」）→ VLAN 20
- WLC自身の管理 → VLAN 100

のように、WLANごとにクライアントの通信を異なるVLANへ出します。そのため、WLCを接続するスイッチポートは**トランク**にし、WLANで使うVLANを許可します。さらに、複数のDSポートを束ねて冗長化と帯域の拡大を行う **LAG（EtherChannel）** もよく使われます。

```
SW1(config)# interface range g0/23 - 24
SW1(config-if-range)# channel-group 5 mode on       ← AireOSのWLCのLAGはLACP/PAgP非対応のため on
SW1(config-if-range)# exit
SW1(config)# interface port-channel 5
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk allowed vlan 10,20,100
```

> 補足：従来のWLC（AireOS）のLAGはネゴシエーションプロトコルを使わないため、スイッチ側は `mode on` にします。Catalyst 9800 などの新しいWLCではLACPも使えます。

```
                    有線ネットワーク
                         |
                     [スイッチ]
             トランク ／          ＼ アクセス（VLAN 100）
    (VLAN 10,20,100)／              ＼
                [WLC]               [LAP]~~~~ クライアント
                   ＼___CAPWAP（VLAN 100経由）___／
```

### ひっかけポイント・よくある誤解

- **ローカルモードのLAPのポートをトランクにする必要はありません。** トランクにするのは、複数SSIDを別VLANへ直接流す**自律型AP**や、**FlexConnectのローカルスイッチング**の場合。
- APの接続に**L3のルーテッドポート**は通常使いません。**EtherChannel**もAPの接続には必須ではありません。
- **WLCのDSポートを「VLAN 1のアクセスポート」にするのは誤り。** アクセスポートでは1つのVLANしか運べず、複数のWLANを別々のVLANに出せません。
- **「PortFastとBPDUガードを設定したアクセスポート」は端末接続ポートの一般的な設定**で、WLCの接続には向きません。
- **shutdown したポートでは通信できません。**

### 試験のポイント

- ローカルモードのLAP → **アクセスポート**（通信はCAPWAPでWLCへ）。
- 自律型AP（複数SSID→複数VLAN）、FlexConnectのローカルスイッチング → **トランク**。
- WLCのDSポート → **トランク**（WLANで使う複数VLANを許可）。LAG（EtherChannel）もよく使う。

### 関連問題

- na-043、na-044

---

## 24. WLCのGUIによるWLAN設定とQoSプロファイル

### 24.1 WLCのインターフェースの種類

WLC（AireOS）には、いくつかの論理インターフェースがあります。

| インターフェース | 役割 |
|---|---|
| 管理インターフェース（management） | WLCの管理用のIPアドレス（GUI/SSHでの接続、APとのCAPWAP） |
| 仮想インターフェース（virtual） | Web認証やDHCPリレーなどで使う仮想的なアドレス |
| サービスポート（service-port） | 帯域外（OOB）管理用の物理ポート |
| **ダイナミックインターフェース**（dynamic） | **WLANのクライアントの通信を有線側のどのVLANに出すか**を決めるインターフェース。**インターフェースごとにVLAN番号（とIPアドレス）が決まっていて、それをWLANに結び付ける** |

### 24.2 WLCのGUIでWLANを作る流れ

```
 ① WLANs メニュー → 新規作成（Create New）
       プロファイル名、SSID、WLAN ID を決める
          ↓
 ② General タブ
       Status: Enabled（WLANを有効化）
       Interface/Interface Group: 例「vlan10-corp」（＝ダイナミックインターフェース → VLAN）
       Broadcast SSID: SSIDを端末の一覧に表示するか
          ↓
 ③ Security タブ
       Layer 2: WPA2/WPA3、認証方式（PSK、802.1X など）
       Layer 3: Web認証 など
       AAA Servers: RADIUSサーバの指定
          ↓
 ④ QoS タブ
       Quality of Service: Platinum / Gold / Silver / Bronze
          ↓
 ⑤ Advanced タブ
       セッションタイムアウト、FlexConnectのローカルスイッチング、DHCPなど細かい設定
          ↓
 Apply（適用）
```

WLANの各設定項目が何を決めるか：

| 設定 | 決めること |
|---|---|
| **インターフェース（ダイナミックインターフェース）** | **クライアントの通信を有線側のどのVLANに出すか** |
| QoSプロファイル | WLANの通信の優先度（Platinum/Gold/Silver/Bronze） |
| レイヤー2セキュリティ（WPA2/WPA3） | 無線区間の認証と暗号化の方式 |
| SSIDのブロードキャスト | 端末の接続先一覧にSSIDを表示するかどうか |

（WPA2-PSK の設定例：Security → Layer 2 → Layer 2 Security: WPA+WPA2、WPA2 Policy、暗号化 AES(CCMP)、Authentication Key Management: PSK にチェックし、事前共有キーを入力。）

### 24.3 QoSプロファイル

WLCのQoSプロファイルは4つあり、**優先度の高い順に Platinum → Gold → Silver → Bronze** です（メダルの順位と同じと覚える）。

| QoSプロファイル | 優先度 | 用途 | 対応するトラフィッククラス |
|---|---|---|---|
| **Platinum** | **最も高い** | **音声（VoIP）**。遅延に最も弱い | Voice |
| **Gold** | 2番目 | **ビデオ** | Video |
| **Silver** | 3番目 | **通常の通信（ベストエフォート）**。**WLANのデフォルト** | Best Effort |
| **Bronze** | 最も低い | **バックグラウンド**の通信（来客用のWLANなど） | Background |

無線区間のQoS（WMM、802.11e）の優先度は、有線側では802.1QタグのCoSやIPヘッダの**DSCP**のマーキングに対応付けられます。WLCのQoSと有線側のQoSを組み合わせて、**無線から有線まで一貫して音声を優先**します。

### ひっかけポイント・よくある誤解

- **VLANを決めるのはインターフェース（ダイナミックインターフェース）**の設定。QoSプロファイル（優先度）、レイヤー2セキュリティ（認証・暗号化）、SSIDのブロードキャスト（一覧に表示するか）ではありません。
- **音声はPlatinum。** Goldはビデオ、Silverはベストエフォート（デフォルト）、Bronzeはバックグラウンド。「Goldが最高」と思い込まないこと。

### 試験のポイント

- WLANのトラフィックを有線側のVLANに出す設定 = **WLANに割り当てるインターフェース（ダイナミックインターフェース）**。
- GUIの流れ：WLAN作成（プロファイル名・SSID）→ General（有効化・インターフェース）→ Security（WPA2/WPA3・PSK/802.1X）→ QoS → Advanced。
- QoSプロファイル：**Platinum（音声）＞ Gold（ビデオ）＞ Silver（ベストエフォート、デフォルト）＞ Bronze（バックグラウンド）**。

### 関連問題

- na-047、na-048

---

## 25. 機器の管理アクセス

### 25.1 管理方法の種類

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

### 25.2 暗号化の有無で整理

| 用途 | 暗号化されない | 暗号化される |
|---|---|---|
| CLI（リモート） | Telnet | **SSH** |
| GUI（Web） | HTTP | **HTTPS** |
| 監視 | SNMPv1 / v2c | SNMPv3（authPriv） |

### 25.3 HTTPSによるWeb管理の設定

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

### 25.4 （参考）SSHの設定

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

### 25.5 クラウド管理

クラウド管理（Cisco Meraki など）では、機器は**インターネット経由でクラウドに接続し、設定を受け取ります**。管理者はWebブラウザでクラウドのダッシュボードにログインし、**各拠点のスイッチやAPをまとめて**設定・監視できます。拠点にIT担当者がいなくても、機器をつなぐだけで設定が反映される（ゼロタッチプロビジョニング）のが利点です。一方、管理はインターネット接続とクラウドサービスに依存します。

### ひっかけポイント・よくある誤解

- **コンソール接続は1台ずつ、その場で作業する**方法で、一括管理ではありません。
- **Telnetは1台ずつCLIにログインする方法で、通信は暗号化されません。** Webブラウザでは使いません。
- **TFTPはファイル転送のプロトコル**で、機器の管理方法ではありません。
- **HTTP（`ip http server`）は暗号化されない**ため、ログイン情報を盗聴される恐れがあります。暗号化するのは **HTTPS（`ip http secure-server`）**。
- **SNMPv1は監視用のプロトコルで、コミュニティ名が平文**で送られます。

### 試験のポイント

- 管理方法：コンソール（直接）、Telnet/SSH（CLI）、HTTP/HTTPS（GUI）、クラウド管理（Meraki）。
- 暗号化なし：Telnet、HTTP。暗号化あり：SSH、HTTPS。
- HTTPSは `ip http secure-server`。HTTPは `no ip http server` で無効化。
- 管理者認証：ローカルユーザー、または TACACS+/RADIUS（AAA）。

### 関連問題

- na-045、na-046

---

## 26. 問題別クイックリファレンス

| 問題ID | 問われていること | 正解 | 一言ポイント |
|---|---|---|---|
| na-001 | L2スイッチが転送先ポートを決める表 | MACアドレステーブル | 送信元MACで学習、宛先MACで転送。未知はフラッディング |
| na-002 | 802.1Qトランクでタグなしで送るVLAN | ネイティブVLAN | デフォルトVLAN 1。両端で一致させる |
| na-003 | ルートブリッジに選ばれるスイッチ | ブリッジIDが最も小さいスイッチ | 優先度＋MAC。小さいほど優先 |
| na-004 | 隣接機器の情報を得るCisco独自プロトコル | CDP | LLDPはIEEE標準（802.1AB） |
| na-005 | VLANの主な目的 | ブロードキャストドメインを分割する | コリジョンドメインはポートごとに分割済み |
| na-006 | 初期状態の全ポートの所属VLAN | VLAN 1 | 名前変更・削除不可。0は予約、1002〜1005は削除不可 |
| na-007 | VLAN 10のアクセスポートにするコマンド2つ | `switchport mode access` と `switchport access vlan 10` | VLANがなければ自動作成 |
| na-008 | トランクと許可VLANの確認コマンド | `show interfaces trunk` | `show vlan brief` にトランクは出ない |
| na-009 | VLAN 10と20のPCの通信に必要なもの | ルータやL3スイッチによるルーティング | GWはそれぞれ自分のサブネットに |
| na-010 | ルータのサブIF＋トランクでのVLAN間ルーティングの名前 | ルータオンアスティック | `encapsulation dot1Q <VLAN>`。リンクがボトルネックに |
| na-011 | DTPでトランクにならない組み合わせ | dynamic auto と dynamic auto | 一方が誘えばトランク。実務は固定＋nonegotiate |
| na-012 | IP電話の音声用VLAN 20の指定 | `switchport voice vlan 20` | PCはタグなしでaccess vlanへ |
| na-013 | STPの目的 | 冗長化したL2ネットワークでループを防ぐ | 一部ポートをブロックして木構造に |
| na-014 | L2ループで起きる問題2つ | ブロードキャストストーム、MACアドレステーブルの不安定化 | イーサネットフレームにTTLはない |
| na-015 | 非ルートブリッジでルートまでのコスト最小のポート | ルートポート | 非ルートブリッジに1つずつ |
| na-016 | ルートブリッジのポートの役割 | すべて指定ポート | ルートブリッジにルートポートはない |
| na-017 | 1Gbpsのパスコスト（ショート方式） | 4 | 10M=100、100M=19、1G=4、10G=2 |
| na-018 | 802.1Dのポート状態の遷移順（並べ替え） | ブロッキング → リスニング → ラーニング → フォワーディング | 20＋15＋15＝最大50秒 |
| na-019 | PortFastの説明 | リスニングとラーニングを省略してすぐフォワーディング | 端末ポート専用。BPDUガードとセット |
| na-020 | 設定可能なブリッジ優先度 | 4096 | 0〜61440の4096の倍数。32769は表示値 |
| na-021 | VLAN 1のルートブリッジにするコマンド | `spanning-tree vlan 1 root primary` | 通常24576。secondaryは28672 |
| na-022 | RSTPの説明 | 802.1Dより収束が速い | IEEE標準。ルートブリッジも選出 |
| na-023 | EtherChannelの主な利点 | 1本の論理リンクとして帯域増加、STPでブロックされず全リンク使用 | 1本故障でも継続 |
| na-024 | EtherChannelのIEEE標準ネゴシエーション | LACP | 802.3ad/802.1AX。PAgPはCisco独自 |
| na-025 | LACPで構成されない組み合わせ | passive と passive | 一方がactiveなら構成 |
| na-026 | `channel-group 1 mode on` の説明 | ネゴシエーションなしで無条件に参加 | 相手もonが必要。食い違いを検知できない |
| na-027 | メンバーポートで一致が必要な設定2つ | 速度とデュプレックス、アクセスVLAN／トランクの設定 | description・番号の連続は不要。正常はP |
| na-028 | L3 EtherChannelのIPアドレスの設定場所 | `no switchport` を設定した port-channel インターフェース | メンバーもno switchport |
| na-029 | 優れたBPDUを受けたらポートを止めてルートを守る機能 | ルートガード | root-inconsistent、自動復旧 |
| na-030 | BPDUの送受信を止め、誤用でループの原因になる機能 | BPDUフィルタ | ガード＝来たら止める、フィルタ＝無視 |
| na-031 | 単方向リンクでBPDUが途絶えたポートの誤転送を防ぐ機能 | ループガード | loop-inconsistent |
| na-032 | RSTPでルートポートの予備になるポート | 代替ポート（alternate port） | バックアップは同一セグメントの予備 |
| na-033 | Rapid PVST+にするコマンド | `spanning-tree mode rapid-pvst` | `mode pvst` は従来のPVST+ |
| na-034 | スイッチ全体でCDPを無効化 | `no cdp run` | IF単位は `no cdp enable` |
| na-035 | 他社製スイッチと隣接情報を交換するコマンド | `lldp run` | LLDPは30秒/120秒、CDPは60秒/180秒 |
| na-036 | CDPで隣接機器のIPやIOSバージョンを確認 | `show cdp neighbors detail` | 無印の neighbors はIPを表示しない |
| na-037 | 許可VLAN 10,20を残してVLAN 30を追加 | `switchport trunk allowed vlan add 30` | addなしは置き換え |
| na-038 | ネイティブVLAN 1と99の不一致で起きること | タグなしフレームが別VLANに入り、CDPが不一致を警告 | トランク自体は動作し続ける |
| na-039 | 802.1QタグのVLAN IDのビット数 | 12ビット | TPID16・PCP3・DEI1・VID12。1〜4094 |
| na-040 | 接続を受け付けず監視だけを行うAPのモード | モニターモード | 不正AP・干渉・攻撃を検知 |
| na-041 | WAN断でも支社内通信を続けられるAPのモード | FlexConnectモード | ローカルスイッチング |
| na-042 | LAPとWLCの間のトンネルプロトコル | CAPWAP | 制御（暗号化）とデータの2トンネル |
| na-043 | ローカルモードのLAPを接続するスイッチポート | アクセスポート | 全通信がCAPWAPでWLCへ |
| na-044 | WLCのDSポートを接続するスイッチポート | トランクポート（WLANで使う複数VLANを許可） | WLANごとに別VLAN。LAGも可 |
| na-045 | ダッシュボードから各拠点を一括管理する方法 | クラウド管理（例：Cisco Meraki） | コンソールは1台ずつその場で |
| na-046 | Web管理画面を暗号化する機能 | HTTPS（`ip http secure-server`） | `no ip http server` でHTTPを無効化 |
| na-047 | WLANの通信を出すVLANを決める設定 | WLANに割り当てるインターフェース（ダイナミックインターフェース） | QoS・L2セキュリティ・SSID表示とは別 |
| na-048 | 音声用WLANに適したQoSプロファイル | Platinum | Platinum＞Gold＞Silver（デフォルト）＞Bronze |
| na-049 | 自律型APの説明 | 1台ずつ個別に設定し、WLCなしで単独で動作 | 小規模向け。LAPはWLC、Merakiはクラウド |
