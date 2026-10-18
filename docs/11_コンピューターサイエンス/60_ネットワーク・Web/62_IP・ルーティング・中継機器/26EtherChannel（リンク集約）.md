# EtherChannel（リンク集約）

## この章で扱うこと
複数の物理リンクを1本の論理リンクに束ねるEtherChannelを扱います。基本と負荷分散、LACP・PAgP・on の3つの構成方法とモードの組み合わせ、L2/L3 EtherChannel の設定・確認・トラブルシューティングまでを説明します。

---

## 1. EtherChannel の基礎

### 1.1 なぜEtherChannelが必要か

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

### 1.2 負荷分散のしくみ

EtherChannelでは、通信は**メンバーリンク間で負荷分散**されます。ただし、1つのフレームを分割して複数のリンクに流すのではなく、**送信元/宛先のMACアドレスやIPアドレスなどからハッシュ値を計算し、通信（フロー）ごとにどのリンクを使うか決めます**。そのため、1つのフローの最大速度はメンバー1本分です。

```
SW1(config)# port-channel load-balance src-dst-ip
SW1# show etherchannel load-balance
```

### 1.3 EtherChannelでないもの

| これは… | 担当する技術 |
|---|---|
| VLANごとに異なるルートブリッジを選ぶ | PVST+ / Rapid PVST+ |
| 通信を暗号化する | VPN（IPsec）、MACsec など。**EtherChannelは暗号化しない** |
| 異なるVLAN間で通信させる | ルーティング（ルータやL3スイッチ） |

### ひっかけポイント・よくある誤解

- **「EtherChannelでVLANごとに異なるルートブリッジを選べる」は誤り。** それはPVST+の機能です。
- **「EtherChannelでスイッチ間の通信が暗号化される」は誤り。**
- **「EtherChannelで異なるVLAN間で通信できる」は誤り。** VLAN間の通信にはルーティングが必要です。

### 押さえておくポイント

- EtherChannel = 複数の物理リンクを1本の論理リンク（port-channel）にまとめる。
- 帯域の増加＋STPでブロックされず全リンク使用＋1本の故障でも継続。
- 負荷分散はフロー単位（ハッシュ）。

---

## 2. LACP・PAgP・on モード

### 2.1 3つの構成方法

EtherChannelを構成する方法は3つあります。

| 方法 | 標準/独自 | モード（積極的 / 受け身） | 特徴 |
|---|---|---|---|
| **LACP**（Link Aggregation Control Protocol） | **IEEE標準**（802.3ad、現在は **802.1AX**） | **active** / **passive** | 他社の機器とも使える。**特に重要** |
| **PAgP**（Port Aggregation Protocol） | **Cisco独自** | **desirable** / **auto** | Cisco機器同士のみ |
| **on**（静的） | ― | on | ネゴシエーションなしで**無条件**に束ねる |

### 2.2 モードの組み合わせ

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

### 2.3 on モードのリスク

on はネゴシエーションをしないので、**両端の設定の食い違い（片側だけEtherChannel、メンバーの接続先が別のスイッチなど）を検知できません**。その結果、ループなどの問題が起きることがあります。LACPを使えば、相手と確認し合ってから束ねるので安全です。

### 2.4 DTP・LACP・PAgPの比較まとめ

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

### 押さえておくポイント

- LACP = IEEE標準（802.3ad / 802.1AX）、active/passive。PAgP = Cisco独自、desirable/auto。on = ネゴシエーションなし。
- **passive 同士、auto 同士は構成されない。** 一方が active/desirable なら構成される。
- on は相手も on のときだけ。食い違いを検知できないので LACP の方が安全。

---

## 3. EtherChannel の設定・確認・トラブルシューティング（L2/L3）

### 3.1 L2 EtherChannel の設定（LACP）

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

### 3.2 メンバーポートで一致している必要がある設定

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

### 3.3 確認：show etherchannel summary

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

### 3.4 L3 EtherChannel

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

### 押さえておくポイント

- メンバーで一致必須：**速度・デュプレックス、スイッチポートのモード、アクセスVLAN／トランクの許可VLAN・ネイティブVLAN**。
- 一致不要：description、番号の連続性。
- 確認：`show etherchannel summary`。**P = bundled（正常）**、s = suspended、I = stand-alone。SU = L2で使用中、RU = L3で使用中。
- L3 EtherChannel：メンバーと port-channel の両方に `no switchport`、**IPは port-channel**。

---

## 関連
- [[24スイッチングとVLAN（MACテーブル・トランク・VLAN間ルーティング）]]
- [[25STPとRSTP（L2ループ防止）]]
- [[27無線LAN（規格・構成・セキュリティ）]]
