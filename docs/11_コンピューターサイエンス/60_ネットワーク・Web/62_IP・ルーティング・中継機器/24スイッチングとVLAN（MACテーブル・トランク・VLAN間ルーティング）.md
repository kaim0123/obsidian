# スイッチングとVLAN（MACテーブル・トランク・VLAN間ルーティング）

## この章で扱うこと
L2スイッチがMACアドレステーブルでフレームを転送するしくみから始めて、VLAN、アクセスポート、ボイスVLAN、トランク（IEEE 802.1Q）、ネイティブVLAN、許可VLAN、DTP、VLAN間ルーティング（ルータオンアスティック・SVI）、隣接機器の検出（CDP・LLDP）までを扱います。

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

### 1.4 スイッチの4つの基本動作

L2スイッチは、**MACアドレステーブル**（CAMテーブル）を使ってフレームを転送します。動作は次の4つです。

| 動作 | 使う情報 | 内容 |
| --- | --- | --- |
| ① **学習（Learning）** | **送信元MACアドレス** ＋ **受信ポート** | 「このMACアドレスの機器はこのポートの先にいる」とテーブルに登録 |
| ② **転送（Forwarding）** | **宛先MACアドレス** | テーブルを検索し、見つかればそのポートだけに送る |
| ③ **フラッディング（Flooding）** | 宛先MACアドレス | 宛先がテーブルにない（unknown unicast）・ブロードキャストの場合、**受信ポート以外の同じVLANの全ポート**に送る |
| ④ **フィルタリング（破棄）** | 宛先MACアドレス | 宛先のポートが受信ポートと同じなら送らずに破棄 |

ポイントは、**学習には送信元、検索（転送先の決定）には宛先**を使うことです。

### 1.5 動作の具体例

```
          ┌──────────────── SW1 ────────────────┐
          │  Gi0/1        Gi0/2        Gi0/3    │   （全ポート VLAN 1）
          └───┬─────────────┬────────────┬──────┘
              │             │            │
            PC-A          PC-B         PC-C
       0000.aaaa.aaaa  0000.bbbb.bbbb  0000.cccc.cccc
```

1. **PC-A → PC-B のフレーム**（テーブルは空）
   - 学習: 送信元 `0000.aaaa.aaaa` を Gi0/1 に登録
   - 宛先 `0000.bbbb.bbbb` はテーブルにない → **Gi0/2 と Gi0/3 にフラッディング**（受信ポート Gi0/1 には送り返さない）
2. **PC-B → PC-A の応答**
   - 学習: 送信元 `0000.bbbb.bbbb` を Gi0/2 に登録
   - 宛先 `0000.aaaa.aaaa` は Gi0/1 にある → **Gi0/1 だけに転送**
3. 以降、A⇔B の通信は該当ポートだけに転送され、PC-C には届かない

```
Switch# show mac address-table dynamic
          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    0000.aaaa.aaaa    DYNAMIC     Gi0/1
   1    0000.bbbb.bbbb    DYNAMIC     Gi0/2
Total Mac Addresses for this criterion: 2
```

L2スイッチは**IPアドレスを見ない**ので、MACアドレステーブルにIPアドレスは載りません。IPアドレスとMACアドレスの対応は、端末やルータの**ARPテーブル**で管理します。宛先IPアドレスとネクストホップの組は、ルータの**ルーティングテーブル**の情報です。また、L2スイッチは**デフォルトゲートウェイを意識しません**。ゲートウェイ宛てのフレームも、単に「ルータのMACアドレス宛てのフレーム」として転送するだけです。

### 1.6 フラッディングとVLAN

宛先が不明なユニキャスト（unknown unicast）とブロードキャストは、**同じVLANの**受信ポート以外の全ポートへフラッディングされます。スイッチは宛先が不明でも**破棄せず**、フラッディングして届けます。宛先の機器が応答すれば、その送信元MACアドレスを学習でき、次からは1ポートだけに転送できます。

VLANを分ければ、フラッディングが届く範囲（**ブロードキャストドメイン**）も小さくなります。

| 用語 | 分割する機器 |
| --- | --- |
| コリジョンドメイン | スイッチ（ポートごとに分割）、ルータ。ハブは分割しない |
| ブロードキャストドメイン | ルータ（L3）、VLAN。スイッチ（同じVLAN）は分割しない |

### 1.7 エージングタイム

動的に学習したMACアドレスは、**一定時間そのMACアドレスからの通信がないとテーブルから削除**されます。この時間が**エージングタイム**で、**Ciscoスイッチのデフォルトは300秒（5分）**です。

エージングがあることで、

- 別のポートへつなぎ替えた（移動した）機器の古い情報が残り続けない
- 外された機器のエントリが残り続けてテーブルが埋まらない

という効果があります（同じMACアドレスを別のポートで受信した場合は、エージングを待たずにその場でエントリが更新されます）。

```
Switch# show mac address-table aging-time
Global Aging Time:  300
Vlan    Aging Time
----    ----------

Switch(config)# mac address-table aging-time 600     ! 変更（秒）
Switch(config)# mac address-table static 0000.dddd.dddd vlan 1 interface gigabitethernet0/4
```

**手動で設定した（static）エントリはエージングで消えません。**

紛らわしい数値: **CiscoルータのARPのデフォルトのタイムアウトは4時間**。MACアドレステーブルの300秒と混同しないように注意します。

| テーブル | 機器 | 内容 | デフォルトの保持時間 |
| --- | --- | --- | --- |
| MACアドレステーブル | スイッチ | MACアドレス ⇔ ポート（VLAN） | **300秒** |
| ARPテーブル | ルータ・端末 | IPアドレス ⇔ MACアドレス | **4時間**（Cisco IOS） |
| ルーティングテーブル | ルータ・L3スイッチ | 宛先ネットワーク ⇔ ネクストホップ/出力IF | （ルートの種類による） |

### ひっかけポイント・よくある誤解

- **「スイッチはルーティングテーブルを見て転送する」は誤り。** ルーティングテーブルは宛先IPアドレスから転送先を決めるL3の表で、ルータやL3スイッチが使います。
- **ARPテーブルはIPアドレスとMACアドレスの対応表**で、PCやルータが「このIPアドレスの相手のMACアドレスは何か」を保存しておくものです。スイッチがフレームの転送先ポートを決めるための表ではありません。
- **NATテーブルはアドレス変換の記録**です。フレーム転送とは関係ありません。
- 宛先がテーブルにない場合でも、フレームは破棄されません。**受信ポート以外の全ポートにフラッディング**されます。
- **「宛先MACアドレスを学習する」は誤り。** 学習は送信元MAC＋受信ポート。宛先MACはテーブルを検索するときに使う。
- **「送信元IPアドレスを学習する」は誤り。** L2スイッチはIPアドレスを見ない。IP⇔MACはARPテーブル。
- **「宛先IPアドレスとネクストホップ」はルーティングテーブルの情報。**
- **宛先不明のユニキャストを「破棄する」は誤り。** フラッディングして届ける。
- **受信ポートにも送り返す、は誤り。** 受信ポートには送らない。
- **「デフォルトゲートウェイのルータにだけ転送する」は誤り。** L2スイッチはゲートウェイを意識しない。
- **エージングタイムを30秒・4時間と答える誤り。** 4時間はCiscoルータのARPタイムアウト。MACアドレステーブルは300秒。
- **「学習したMACアドレスは削除されない」は誤り。** 動的エントリはエージングで削除される（staticは削除されない）。

### 押さえておくポイント

- L2スイッチは**MACアドレステーブル**で転送先ポートを決める（`show mac address-table`）。
- **送信元MACアドレス**で学習し、**宛先MACアドレス**で転送先を決める。
- 宛先が未学習・ブロードキャストなら**受信ポート以外へフラッディング**。
- MACアドレステーブルはVLANごとに管理される。
- 学習＝送信元MAC＋受信ポート／転送＝宛先MACで検索
- unknown unicast・ブロードキャスト → 同じVLANの受信ポート以外の全ポートへフラッディング
- MACアドレステーブルのエージングタイム＝300秒（`mac address-table aging-time` で変更）、staticは消えない
- 確認は `show mac address-table`
- CiscoルータのARPタイムアウト＝4時間

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
- VLANは**VLAN同士を通信させません**。VLAN間の通信にはルーティングが必要です（第9節）。

1つのVLANは1つのIPサブネットに対応させるのが基本です（例：VLAN 10 = 192.168.10.0/24、VLAN 20 = 192.168.20.0/24）。

### 2.2 VLAN IDの範囲と特別なVLAN

VLAN IDは12ビット（第5節）で表され、使える範囲は 1〜4094 です。

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
- ネイティブVLANをVLAN 1以外の未使用VLANに変更する（第6節）
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

### 押さえておくポイント

- VLANの目的は**ブロードキャストドメインの分割**。異なるVLANにはブロードキャストが届かない。
- スイッチは**ポートごとにコリジョンドメインを分割**（VLANとは無関係）。
- 初期状態の全ポートは**VLAN 1（デフォルトVLAN）**。VLAN 1は名前変更・削除不可。初期のネイティブVLANもVLAN 1。
- 使用可能なVLAN IDは 1〜4094。0と4095は予約。1002〜1005は削除不可。
- 未使用ポートは未使用VLANに移して `shutdown` するのがベストプラクティス。

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

- `switchport mode access` … ポートをアクセスポートに**固定**します。DTPでトランクになってしまうことも防ぎます（第8節）。
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

`show vlan brief` には、**アクセスポート**とその所属VLANが表示されます。**トランクポートはこの一覧に表示されません**。「あるはずのポートが `show vlan brief` に出てこない」ときは、そのポートがトランクになっている（あるいはEtherChannelのメンバーなど）可能性を疑い、`show interfaces trunk` で確認します（第7節）。

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

### 押さえておくポイント

- アクセスポート = `switchport mode access` ＋ `switchport access vlan <番号>`。
- 存在しないVLANを指定すると自動で作成される。
- アクセスポートの所属は `show vlan brief` で確認。トランクポートは表示されない。

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

### 押さえておくポイント

- 音声用VLANの指定は `switchport voice vlan <番号>`。
- PCのフレームはタグなしでデータ用VLAN（access vlan）へ、IP電話の音声はタグ付きで音声用VLANへ。
- 音声とデータを分けるとQoSで音声を優先しやすい。

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

> 参考：かつてはCisco独自の ISL というトランクプロトコルもありましたが、現在はほとんど使われず、802.1Qが前提です。

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

### 押さえておくポイント

- トランク = 1本のリンクで複数VLANを運ぶ。VLANの区別は802.1Qタグで行う。
- 802.1Qタグは4バイト、送信元MACとタイプの間に挿入。
- 内訳：TPID 16ビット（0x8100）、PCP 3ビット、DEI 1ビット、**VID 12ビット**。
- 使えるVLAN IDは1〜4094。

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
| ボイスVLAN | IP電話の音声通信用のVLAN（第4節） |
| デフォルトVLAN | 初期状態の全ポートが所属するVLAN 1 |
| プライベートVLAN | 同じVLAN内のポート同士の通信をさらに制限する機能（発展的な内容） |

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

> 補足：CiscoのPVST+／Rapid PVST+が動いている場合は、STPもネイティブVLANの不一致を検出し、該当VLANでそのポートを「PVID不一致（PVID_Inc）」としてブロックすることがあります。その場合、実機では「フレームが漏れる」前に該当VLANの通信が止まります。まずは「タグなしフレームが別のVLANに入る」「CDPが警告する」という原理を押さえておきましょう。

ネイティブVLANの不一致は、**STPのルートブリッジの選出とは関係ありません**（ルートブリッジはブリッジIDで決まります。[[25STPとRSTP（L2ループ防止）]] 第2節）。

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

### 押さえておくポイント

- ネイティブVLAN = 802.1Qトランクでタグなしで送るVLAN。デフォルトはVLAN 1。
- 受信側はタグなしフレームを自分のネイティブVLANとして扱う。
- 両端のネイティブVLANが違うと、フレームが別VLANに入る。CDPが `NATIVE_VLAN_MISMATCH` を警告。
- 対策：両端で `switchport trunk native vlan <番号>` を同じにする。セキュリティ上は未使用VLANにする。

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

### 押さえておくポイント

- 許可VLANの変更は `add` / `remove` / `except` / `all`。**`add` を忘れると置き換え**。
- トランクの確認は `show interfaces trunk`（モード、カプセル化、状態、ネイティブVLAN、許可VLAN）。
- `show vlan brief` にポートが出ない → トランクになっている可能性。

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

DTPの「auto同士はだめ」という考え方は、EtherChannelのネゴシエーション（LACPの passive 同士、PAgPの auto 同士は構成されない）と同じです。[[26EtherChannel（リンク集約）]] 第2節で合わせて整理します。

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

### 押さえておくポイント

- DTPはCisco独自のトランク自動ネゴシエーション。
- auto = 誘われたら応じる、desirable = 自分から誘う、trunk = 常にトランク。
- **少なくとも一方が誘えばトランク。auto同士はアクセスポート**。
- 実務ではモードを固定し、`switchport nonegotiate` でDTPを止める。

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

L3スイッチでは、物理ポートで `no switchport` を設定して**ルーテッドポート**（ルータのインターフェースのように直接IPアドレスを持つポート）にすることもできます。L3 EtherChannel（[[26EtherChannel（リンク集約）]] 第3節）はこの考え方を使います。

### ひっかけポイント・よくある誤解

- **「スイッチ間をトランクでつなげばVLAN間で通信できる」は誤り。** トランクは複数VLANのフレームを運ぶだけで、VLAN同士をつなぐわけではありません。
- **「STPを有効にするとVLAN間で通信できる」は誤り。** STPはL2ループを防ぐプロトコルです。
- **「両方のPCに同じデフォルトゲートウェイを設定する」は誤り。** VLANが違えばサブネットも違うので、それぞれ自分のサブネットにあるゲートウェイを設定します。
- **SVIはL3スイッチの中に作る仮想インターフェース**で、ルータのサブインターフェースを使う構成（ルータオンアスティック）とは別物です。
- **EtherChannel**（リンクを束ねる技術）や**ネイティブVLAN**（タグなしで送るVLAN）は、ルータオンアスティックとは別の概念です。
- EtherChannel も VLAN間通信を可能にするものではありません（[[26EtherChannel（リンク集約）]] 第1節）。

### 押さえておくポイント

- 異なるVLAN（= 異なるサブネット）間の通信には**L3のルーティング**が必要。
- ルータオンアスティック = ルータの1物理IFをサブIFに分け、`encapsulation dot1Q <VLAN>` で各VLANを担当。スイッチ側はトランク。
- サブIFのIPアドレスが各VLANのデフォルトゲートウェイ。
- ルータオンアスティックはリンク1本に通信が集中しボトルネックになりやすい。
- L3スイッチでは `ip routing` ＋ `interface vlan X`（SVI）。

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

### 押さえておくポイント

- CDP = Cisco独自・デフォルト有効・60秒/180秒。LLDP = IEEE 802.1AB・Ciscoでは多くがデフォルト無効・30秒/120秒。
- 全体の停止 `no cdp run`、IF単位の停止 `no cdp enable`。
- LLDPの有効化は `lldp run`、IF単位は `lldp transmit` / `lldp receive`。
- IPアドレス・IOSバージョンは `show cdp neighbors detail` / `show cdp entry <名前>`。
- 外部に面したポートではCDPを無効にするのが推奨。

---

## 関連
- [[16ルーターとスイッチとハブとNAT]]
- [[21IPv4アドレスとサブネット計算・VLSM]]
- [[28ルーティングの基本とスタティックルート]]
- [[25STPとRSTP（L2ループ防止）]]
- [[26EtherChannel（リンク集約）]]
- [[27無線LAN（規格・構成・セキュリティ）]]
- [[23QoS（帯域制御と優先制御）]]
