# OSPF（リンクステート型ルーティング）

## この章で扱うこと
OSPF は、ルーター同士がネットワークの構成（リンク状態）を共有し、各ルーターが自分で最短経路を計算する**リンクステート型**のルーティングプロトコルです。この章では、OSPF の基礎（LSA・LSDB・SPF・エリア）、設定（network / passive-interface / デフォルトルートの配布 / ルータID）、ネイバーの成立条件と状態遷移、DR/BDR、コストと経路選択を学び、最後にまぎらわしい数値・コマンドを総整理します。

- 前提：[[28ルーティングの基本とスタティックルート]]（ルーティングテーブルの読み方、ロンゲストマッチ → AD → メトリック）
- 関連：[[05IPアドレスとサブネットとゲートウェイ]]（サブネットマスクとワイルドカードマスクの関係を考えるときに）

---

## 1. OSPFの基礎：リンクステート、SPF、エリア

### 1.1 OSPFとは

OSPF（Open Shortest Path First）は、IETFが標準化した**リンクステート型**の内部ゲートウェイプロトコル（IGP）です。

| 特徴 | OSPF | 比較: RIP | 比較: EIGRP |
|---|---|---|---|
| 種類 | **リンクステート型** | ディスタンスベクター型 | 拡張ディスタンスベクター型（ハイブリッド） |
| 標準/独自 | **IETF標準**（他社機器とも使える） | 標準 | Cisco開発（現在は一部公開） |
| メトリック | **コスト**（帯域幅から計算） | ホップ数 | 帯域幅・遅延など |
| アルゴリズム | **SPF（ダイクストラ）** | ベルマン・フォード | DUAL |
| 更新 | **変化があったときだけ**送る（Helloで隣接維持） | **30秒ごと**にテーブル全体を送る | 変化時のみ |
| AD | 110 | 120 | 90（内部）/170（外部） |
| コード | O | R | D |

OSPFでは、各ルータがネットワーク全体の構成（リンク状態）を共有し、**それぞれが自分で**最短経路を計算します。変化があったときだけ情報を送るので、ネットワークの変化に素早く対応できます（**収束が速い**）。

### 1.2 リンクステート型の動作の流れ

```
 ① Helloでネイバーを見つける
        │   （224.0.0.5 宛てに Hello を送り合う）
        ▼
 ② LSA（リンク状態の情報）を交換し、エリア内のすべてのルータが
    同じ LSDB（リンクステートデータベース）を持つ
        │
        ▼
 ③ 各ルータが SPF（ダイクストラ）アルゴリズムで、
    自分を根（起点）とした最短経路の木（SPFツリー）を計算する
        │
        ▼
 ④ 計算結果をルーティングテーブルに載せる（コード O）
```

- **LSA**（Link State Advertisement）: 「自分にはこういうリンクがあり、コストはいくつ」という情報の単位。
- **LSDB**（Link State Database）: 集めたLSAのデータベース。エリア内の全ルータで同一になる＝エリアの「地図」。
- **SPF（ダイクストラ）アルゴリズム**: 地図から、自分を起点として**合計コストが最小**となる経路の木を計算する。

ほかのアルゴリズムとの区別:

| アルゴリズム/プロトコル | 使われる場所 |
|---|---|
| SPF（ダイクストラ） | **OSPF**（正解） |
| DUAL | EIGRP |
| ベルマン・フォード | RIP などのディスタンスベクター型 |
| スパニングツリー（STP） | L2のループ防止。ルーティング計算には使わない |

確認コマンド例:

```
R1# show ip ospf database

            OSPF Router with ID (1.1.1.1) (Process ID 1)

                Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
1.1.1.1         1.1.1.1         120         0x80000003 0x00A1B2 3
2.2.2.2         2.2.2.2         118         0x80000002 0x003C4D 2
3.3.3.3         3.3.3.3         115         0x80000002 0x0055E6 2

                Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.123.3   3.3.3.3         115         0x80000001 0x00ABCD
```

### 1.3 エリアとバックボーンエリア

OSPFはネットワークを**エリア**に分けて管理できます。エリアを分けると、LSAのやり取りやSPF計算の範囲がエリア内に限定され、大規模ネットワークでも負荷を抑えられます。

```
          エリア 1            エリア 0（バックボーン）           エリア 2
     [R4]----[R5]----ABR----[R1]----[R2]----[R3]----ABR----[R6]----[R7]
                   (R5兼)                           (R6兼)
     ※ すべてのエリアはエリア0に接続する必要がある
     ※ ABR（エリア境界ルータ）: 複数のエリアに属するルータ
```

- **エリア0＝バックボーンエリア**。OSPFの中心となるエリアです。
- **シングルエリア**で構成する場合は、通常 **エリア0** を使います。
- マルチエリア構成では、**すべてのエリアがエリア0に接続**する必要があります。
- エリア1など他の番号も設定はできますが、シングルエリアなら通常エリア0です。
- 入門段階では主に**シングルエリア（エリア0のみ）のOSPFv2**を扱います。

**プロセスIDとエリア番号は無関係**です。`router ospf 1` の「1」は**プロセスID**で、そのルータ内でだけ意味を持つ番号です（ネイバー同士で一致させる必要もありません）。

また、OSPFではインターフェースごとに所属するエリアを**必ず指定**します（network コマンドの `area` か、`ip ospf <プロセスID> area <エリア>`）。「エリア番号は指定しない」は誤りです。

### ひっかけポイント・よくある誤解

- 「ディスタンスベクター型でホップ数」「30秒ごとにテーブル全体を送る」→ これは **RIP**。
- 「Cisco独自」→ OSPFは**IETF標準**。Ciscoが開発したのは**EIGRP**。
- DUAL＝EIGRP、ベルマン・フォード＝RIP、スパニングツリー＝L2ループ防止。
- プロセスIDとエリア番号は無関係。

### 押さえておくポイント

- OSPF＝リンクステート型、IETF標準、メトリックはコスト、SPF（ダイクストラ）、AD 110。
- 流れ: Hello → LSA交換 → LSDB同期 → SPF計算 → ルーティングテーブル。
- エリア0＝バックボーン。シングルエリアはエリア0。全エリアはエリア0に接続。

---

## 2. OSPFの設定

この節で扱う設定例のトポロジ:

```
                        Loopback0 1.1.1.1/32
   PC LAN                                          ISP
192.168.1.0/24                                  203.0.113.1
     |                                               |
     | G0/0 .1                               G0/2 .2 | 203.0.113.0/30
    [R1]--------------------------------------------+
     | G0/1 .1
     |  10.0.12.0/30
     | G0/0 .2
    [R2] Loopback0 2.2.2.2/32
     | G0/1 .1
     |  192.168.2.0/24（PC LAN）
```

### 2.1 OSPFの有効化：network コマンド

```
R1(config)# router ospf 1
R1(config-router)# network 192.168.1.0 0.0.0.255 area 0
R1(config-router)# network 10.0.12.0 0.0.0.3 area 0
```

| 部分 | 意味 |
|---|---|
| `router ospf 1` | OSPFプロセス（プロセスID 1）を作成し、OSPFの設定モードに入る（グローバル設定モードで実行） |
| `network 192.168.1.0` | 対象とするアドレス |
| `0.0.0.255` | **ワイルドカードマスク** |
| `area 0` | 所属させるエリア番号 |

`network` コマンドは「**この範囲のIPアドレスを持つインターフェースでOSPFを有効にする**」という意味です。「このネットワークを広報する」と直接書いているのではなく、条件に一致したインターフェースでOSPFが有効になり、その結果としてそのインターフェースのネットワークが広報されます。

#### ワイルドカードマスク

ワイルドカードマスクは、各ビットについて

- **0** ＝「このビットは**一致が必要**」
- **1** ＝「このビットは**どんな値でもよい**」

を意味します。サブネットマスクと0/1が逆になるので、**サブネットマスクを反転したもの**（各オクテットについて 255 − 値）として求められます。

| サブネットマスク | ワイルドカードマスク | 計算 |
|---|---|---|
| 255.255.255.0（/24） | 0.0.0.255 | 255−255, 255−255, 255−255, 255−0 |
| 255.255.255.252（/30） | 0.0.0.3 | 255−252 ＝ 3 |
| 255.255.255.240（/28） | 0.0.0.15 | 255−240 ＝ 15 |
| 255.255.0.0（/16） | 0.0.255.255 | |
| 255.255.255.255（/32） | 0.0.0.0 | 特定の1アドレスに完全一致 |
| 0.0.0.0（/0） | 255.255.255.255 | すべてに一致 |

`192.168.1.0 0.0.0.255` は 192.168.1.0 〜 192.168.1.255 を表します。ワイルドカードマスクは**ACL**でも同じ考え方を使います。

```
! よく使う書き方のバリエーション
network 192.168.1.1 0.0.0.0 area 0        ← そのアドレスを持つインターフェース1つだけ
network 0.0.0.0 255.255.255.255 area 0    ← すべてのインターフェースでOSPFを有効化
```

`network 0.0.0.0 255.255.255.255 area 0` は**すべてのインターフェースでOSPFを有効にする**コマンドであって、デフォルトルートを配布するコマンドではありません。

よくある誤答の整理:

| 誤答 | 正しくは |
|---|---|
| サブネットマスク | サブネットマスクなら 255.255.255.0 と書く。ワイルドカードマスクは0と1が逆 |
| OSPFのルータID | ルータIDは `router-id` コマンドなどで設定 |
| エリア番号 | エリア番号は末尾の `area 0` |

### 2.2 インターフェースでの有効化：ip ospf <プロセスID> area <エリア>

network コマンドを使わずに、インターフェース設定モードで直接OSPFを有効化することもできます。

```
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip ospf 1 area 0
```

| 方法 | 設定場所 | 特徴 |
|---|---|---|
| `network <アドレス> <ワイルドカード> area <エリア>` | `router ospf` の中 | アドレスの範囲で、一致するインターフェースをまとめて指定 |
| `ip ospf <プロセスID> area <エリア>` | インターフェース | どのインターフェースで有効かが一目でわかる |

紛らわしいインターフェースコマンドの整理:

| コマンド | 実行するモード | 意味 |
|---|---|---|
| `ip ospf 1 area 0` | インターフェース | **このインターフェースでOSPFを有効化** |
| `router ospf 1` | グローバル | OSPFプロセスを作成し、OSPF設定モードに入る |
| `ip ospf priority 1` | インターフェース | DR選出のプライオリティ。OSPFは有効にならない |
| `ip ospf cost 1` | インターフェース | インターフェースのコスト。OSPFは有効にならない |

### 2.3 passive-interface

PCだけがつながるLAN側のインターフェースからHelloを送っても意味がありません。それどころか、悪意のある機器がOSPFのネイバーになって**偽のルートを流し込む危険**もあります。

`passive-interface` を設定すると:

- そのインターフェースから **Helloを送らなくなる**（受信したHelloも処理しないので、ネイバーにならない）
- しかし **そのインターフェースのネットワークは引き続きOSPFで他のルータへ広報される**
- インターフェース自体は動作し続け、PCとの通信もできる（shutdown ではない）
- コストとは無関係

```
R1(config)# router ospf 1
R1(config-router)# passive-interface GigabitEthernet0/0

! すべてを passive にしてから、必要なものだけ戻す書き方
R1(config-router)# passive-interface default
R1(config-router)# no passive-interface GigabitEthernet0/1
```

`passive-interface default` は**すべてのインターフェースを passive にする**コマンドです。

確認:

```
R1# show ip protocols
*** IP Routing is NSF aware ***

Routing Protocol is "ospf 1"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Router ID 1.1.1.1
  Number of areas in this router is 1. 1 normal 0 stub 0 nssa
  Maximum path: 4
  Routing for Networks:
    10.0.12.0 0.0.0.3 area 0
    192.168.1.0 0.0.0.255 area 0
  Passive Interface(s):
    GigabitEthernet0/0
  Routing Information Sources:
    Gateway         Distance      Last Update
    2.2.2.2              110      00:05:12
  Distance: (default is 110)
```

### 2.4 デフォルトルートの配布：default-information originate

インターネットにつながるルータ（R1）だけにデフォルトルートを設定し、それをOSPFで社内の他のルータに配布できます。

```
! ① R1自身にデフォルトルートを設定（router ospf の外、グローバル設定）
R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1

! ② OSPFで配布する
R1(config)# router ospf 1
R1(config-router)# default-information originate
```

R2 では次のように見えます。

```
R2# show ip route ospf
Gateway of last resort is 10.0.12.1 to network 0.0.0.0

O*E2  0.0.0.0/0 [110/1] via 10.0.12.1, 00:00:21, GigabitEthernet0/0
      192.168.1.0/24 ...
O        192.168.1.0/24 [110/2] via 10.0.12.1, 00:10:03, GigabitEthernet0/0
```

- `O*E2`: OSPFの外部ルート（タイプ2）で、`*` はデフォルトルートの候補。
- すべてのルータが個別にデフォルトルートを設定しなくて済む。
- `default-information originate` は、**自分のルーティングテーブルにデフォルトルートがあるときに**それを広報します（`always` キーワードを付けると、デフォルトルートがなくても広報）。そのため、①の `ip route 0.0.0.0 0.0.0.0 ...` だけでは配布されず、②だけでも（always なしでは）配布されません。

### 2.5 ルータIDの決定

**ルータID**はOSPFルータを識別する 32 ビットの値で、`1.1.1.1` のような **IPv4アドレスの形式**で表します。OSPFドメイン内でルータごとに**異なる**必要があります（重複するとネイバー関係やLSAで問題が起きる）。

ルータIDは次の優先順位で決まります。

| 優先順位 | 決定方法 | 備考 |
|---|---|---|
| ① 最優先 | `router-id` コマンドで**手動設定**した値 | 明示的に設定した値がそのまま使われる |
| ② | **ループバックインターフェース**のうち**最大**のIPアドレス | 手動設定がない場合。ループバックは物理的にダウンしないので安定したIDになる |
| ③ | **アップ状態の物理インターフェース**のうち**最大**のIPアドレス | 手動設定もループバックもない場合 |

```
R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1

R1# show ip ospf
 Routing Process "ospf 1" with ID 1.1.1.1
 ...
```

#### 例題の解き方① ルータIDの判定

例: R1 に router-id の設定がなく、次のインターフェースがある。

```
Loopback0        10.10.10.1
Loopback1        10.1.1.1
G0/0 (up)        192.168.100.1
G0/1 (up)        172.16.1.1
```

1. `router-id` の手動設定は？ → なし。
2. ループバックはある？ → ある。ループバックの中で最大は **10.10.10.1**（10.10 > 10.1）。
3. → ルータIDは **10.10.10.1**。物理インターフェースの 192.168.100.1 の方が大きいが、ループバックが優先されるので使われない。

### 2.6 ルータIDの変更は再起動まで反映されない

決定したルータIDは、**ルータの再起動**か **`clear ip ospf process`** を実行するまで変わりません。ルータIDはネイバー関係やLSAの識別に使われるため、動作中に勝手に変わると混乱が起きるからです。

```
R1(config)# router ospf 1
R1(config-router)# router-id 2.2.2.2
% OSPF: Reload or use "clear ip ospf process" command, for this to take effect

R1# clear ip ospf process
Reset ALL OSPF processes? [no]: yes

R1# show ip ospf | include ID
 Routing Process "ospf 1" with ID 2.2.2.2
```

| 誤答 | なぜダメか |
|---|---|
| ループバックインターフェースを作成する | 手動の router-id の方が優先されるので変わらない。反映にはやはりプロセスの再起動が必要 |
| しばらく待つと自動で反映される | ルータIDはプロセス起動時に決まり、自動では変わらない |
| router-id をもう一度入力する | 同じコマンドを再入力しても、動作中のプロセスには反映されない |

`clear ip ospf process` は**ネイバー関係がいったん切れる**ので、実務では影響を考えて実行します。

### ひっかけポイント・よくある誤解

- network コマンドの `0.0.0.255` は**ワイルドカードマスク**（サブネットマスクではない）。
- `router ospf 1` の 1 は**プロセスID**。エリア番号でもルータIDでもない。
- `ip ospf priority` / `ip ospf cost` ではOSPFは有効にならない。
- passive-interface は**広報を止めない**。止めるのはHello。shutdown でもない。
- デフォルトルートの配布は `default-information originate`。`network 0.0.0.0 255.255.255.255 area 0` は全インターフェースの有効化、`passive-interface default` は全インターフェースのpassive化。
- ルータIDの優先順位は **手動 → ループバック最大 → 物理（up）最大**。
- ルータIDの変更は `clear ip ospf process` か再起動が必要。

### 押さえておくポイント

- `router ospf <PID>` → `network <addr> <wildcard> area <id>`、またはインターフェースで `ip ospf <PID> area <id>`。
- ワイルドカード ＝ 255 − サブネットマスク（各オクテット）。
- `passive-interface <if>`: Hello停止、ネットワークは広報される。
- `default-information originate`: 自分のデフォルトルートをOSPFで配布（他ルータでは `O*E2`）。
- ルータID: `router-id` → ループバック最大 → up物理最大。変更反映は `clear ip ospf process`。
- 確認: `show ip ospf`、`show ip protocols`、`show ip ospf interface`。

---

## 3. OSPFネイバー

### 3.1 ネイバーになるための条件

OSPFルータは Hello パケットを交換して、Helloの中身が自分と合っている相手とだけネイバーになります。

| 項目 | 一致が必要か | 補足 |
|---|---|---|
| **エリアID** | **一致が必要** | 同じリンク上のインターフェースは同じエリアに所属している必要がある |
| **サブネット（ネットワークアドレスとマスク）** | **一致が必要** | 同じサブネットにいる必要がある |
| **Helloインターバル / Deadインターバル** | **一致が必要** | タイマーが一致しないとネイバーにならない |
| **認証の設定** | **一致が必要** | 認証の種類とパスワード |
| **スタブエリアのフラグ** | **一致が必要** | Helloに含まれる |
| **MTU** | 一致が必要（FULLになるため） | MTUはHelloには含まれず、不一致だとネイバー自体は見えるが、DBD交換の段階（ExStart/Exchange）で止まり、FULLにならない |
| **ルータID** | **異なる必要がある** | 重複してはいけない |
| **プロセスID** | 一致しなくてよい | ルータ内でだけ意味を持つ番号 |

ネイバーにならないときのトラブルシューティングで頻出のポイントです。

#### 例題の解き方②（R1 はエリア0、R2 はエリア1）

1. 直結リンクの両端でエリアIDが違う。
2. HelloパケットにはエリアIDが含まれており、受信したHelloのエリアIDが自分と一致しないと、そのHelloは破棄される。
3. → **ネイバーにならない**。
4. エリアが自動で変わること、ルータIDの大きい方のエリアに統一されることはない。「ネイバーになってエリア0とエリア1のルートを交換する」も誤り（同じリンク上のインターフェースは同じエリアでなければならない）。

確認・調査のコマンド:

```
R1# show ip ospf interface GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
  Internet Address 10.0.12.1/30, Area 0, Attached via Network Statement
  Process ID 1, Router ID 1.1.1.1, Network Type BROADCAST, Cost: 1
  Transmit Delay is 1 sec, State DR, Priority 1
  Designated Router (ID) 1.1.1.1, Interface address 10.0.12.1
  No backup designated router on this network
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
  ...
  Neighbor Count is 0, Adjacent neighbor count is 0

R1# debug ip ospf adj
OSPF-1 ADJ   Gi0/1: Rcv pkt from 10.0.12.2, area 0.0.0.0, mismatched area 0.0.0.1 in the header
```

`show ip ospf interface` で各インターフェースのエリア、タイマー、ネットワークタイプ、コスト、プライオリティ、DR/BDRを確認でき、`debug ip ospf adj` で不一致の内容を調べられます。

### 3.2 Hello / Dead インターバル

OSPFルータは Hello パケットを定期的に送ってネイバーの生存を確認します。**Deadインターバル**の間Helloが届かないと、そのネイバーはダウンしたと判断します。

| ネットワークタイプ | Hello | Dead |
|---|---|---|
| ブロードキャスト（イーサネット） | **10秒** | **40秒** |
| ポイントツーポイント | 10秒 | 40秒 |
| NBMA（フレームリレーなど） | 30秒 | 120秒 |

Deadインターバルはデフォルトで**Helloの4倍**です。値は変更できますが、**ネイバー同士で一致**させる必要があります。

```
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip ospf hello-interval 5
R1(config-if)# ip ospf dead-interval 20
```

似た数字との混同:

| 数字 | 正体 |
|---|---|
| 10 / 40 | **OSPF（ブロードキャスト、P2P）** |
| 30 / 120 | OSPF（NBMA） |
| 2 / 20 | **STP**のHelloタイマー（2秒）と最大エージタイマー（20秒）。転送遅延は15秒 |
| 30 / 180 | **RIP**の更新タイマー（30秒）と無効タイマー（180秒） |

### 3.3 ネイバーの状態遷移

```
 Down ─▶ Init ─▶ 2-Way ─▶ ExStart ─▶ Exchange ─▶ Loading ─▶ Full
  │       │        │         │           │           │         │
  │       │        │         │           │           │         └ LSDBが同期完了（完全な隣接）
  │       │        │         │           │           └ 足りないLSAを要求・受信中
  │       │        │         │           └ DBD（データベースの要約）を交換中
  │       │        │         └ マスター/スレーブを決め、DB交換の準備
  │       │        └ お互いのHelloに自分のルータIDが入っている（双方向確認）
  │       │           ※ ここでDR/BDR選出が行われる
  │       └ 相手のHelloを受信したが、相手はまだ自分を認識していない
  └ Helloを受信していない
```

| 状態 | 意味 | 止まっているときに疑うこと |
|---|---|---|
| INIT | 相手のHelloを受信したが、相手のHelloに自分のルータIDがまだ入っていない | 片方向の通信、ACLでHelloが遮断 |
| 2-WAY | お互いのHelloを確認できた | **DROTHER同士ならこれが正常**（異常ではない） |
| EXSTART | データベース交換を始める準備 | **MTUの不一致**、ルータIDの重複 |
| EXCHANGE | DBDの交換中 | MTUの不一致 |
| **FULL** | **LSDBが同期し、隣接関係が完全に確立**。ルーティング情報の交換が完了 | — |

ブロードキャスト型ネットワークでは、すべてのルータがDR/BDRとFULLになり、**DROTHER同士は 2-WAY のまま止まります**。これは正常な状態です（後述の「4. DR/BDRとOSPFのネットワークタイプ」）。

### 3.4 show ip ospf neighbor の読み方

```
R1# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   FULL/BDR        00:00:35    192.168.123.2   GigabitEthernet0/0
3.3.3.3         100   FULL/DR         00:00:31    192.168.123.3   GigabitEthernet0/0
4.4.4.4           1   2WAY/DROTHER    00:00:38    192.168.123.4   GigabitEthernet0/0
5.5.5.5           0   FULL/  -        00:00:33    10.0.15.2       GigabitEthernet0/1
```

| 列 | 意味 |
|---|---|
| Neighbor ID | **相手のルータID** |
| Pri | 相手のOSPFプライオリティ |
| State | `<ネイバーとの状態>/<ネイバー（相手）の役割>` |
| Dead Time | 残り時間。これが0になるまでにHelloが来ないとダウン扱い |
| Address | 相手インターフェースのIPアドレス |
| Interface | 自分側のインターフェース |

State 列の読み方:

| 表示 | 意味 |
|---|---|
| `FULL/DR` | 相手がDRで、完全な隣接関係 |
| `FULL/BDR` | 相手がBDRで、完全な隣接関係 |
| `2WAY/DROTHER` | 相手もDROTHERで、DROTHER同士なので2WAYで止まっている＝**正常**（自分もDROTHERの場合） |
| `FULL/ -` | ポイントツーポイントなど、DR/BDRがないリンク |

**「/」の右はネイバー（相手）の役割**です。R1 自身の役割は `show ip ospf interface` の `State DR` などで確認します。また接続が切れたネイバーは一覧から消えます（Down）。

#### 例題の解き方③（FULL/BDR）

1. 「/」の左 `FULL` → R1とそのネイバーの隣接は完全に確立（情報の交換は完了している）。
2. 「/」の右 `BDR` → **そのネイバー（相手）**がBDR。
3. → 「そのネイバーはBDRで、R1との隣接関係は完全に確立している」が正解。「R1自身がBDR」は誤り。

### ひっかけポイント・よくある誤解

- ネイバーの条件で「ルータIDが一致」→ 逆。**ルータIDは異なる必要がある**。
- 「プロセスIDが一致」→ **一致しなくてよい**。
- エリアIDが違うとネイバーにならない。自動修正も統一もされない。
- 10/40 は OSPF、2/20 は STP、30/180 は RIP、30/120 は OSPF NBMA。
- 2-WAY で止まるのは DROTHER 同士なら**正常**。
- EXSTART で止まる → **MTU不一致**を疑う。
- `FULL/BDR` の BDR は**相手**の役割。

### 押さえておくポイント

- 一致が必要: エリアID、サブネット、Hello/Dead、認証、スタブフラグ（＋FULLになるにはMTU）。
- 異なる必要: ルータID。どうでもよい: プロセスID。
- デフォルト: Hello 10秒 / Dead 40秒（Deadは4倍）。
- 状態: Down → Init → 2-Way → ExStart → Exchange → Loading → Full。
- 確認: `show ip ospf neighbor`、`show ip ospf interface`、`debug ip ospf adj`。

---

## 4. DR/BDRとOSPFのネットワークタイプ

### 4.1 DR/BDRが必要な理由

イーサネットのように、1つのセグメントに多数のルータがつながる**ブロードキャスト型ネットワーク**で、全員が互いに完全な隣接関係（FULL）を作ると、関係の数は

```
N × (N − 1) / 2
```

に増えてしまいます。たとえばルータ5台なら 5×4/2 ＝ 10、10台なら 45 の隣接関係が必要で、LSAのやり取りも重複します。

そこで、セグメントごとに**DR（代表ルータ）**を1台決め、各ルータは**DRとBDRとだけFULL**になります。LSAはDRが代表して取りまとめ・配布します。**BDR（バックアップ代表ルータ）**は、DRが故障したときにすぐ引き継ぐ予備です。DRでもBDRでもないルータは**DROTHER**と呼ばれます。

```
 DR/BDRなし（全員がFULL）            DR/BDRあり
                                       
   R1───R2                             R1(DR)   R2(BDR)
   │ ╲ ╱ │                              │ ╲      ╱ │
   │  ╳  │      10本                     │   ╲  ╱   │
   │ ╱ ╲ │                              │    ╳     │     DROTHER同士（R3-R4, R3-R5, R4-R5）は
   R3───R4  ＋R5                        R3  R4  R5        2-WAY のまま（正常）
                                     各DROTHERはDRとBDRだけとFULL
```

- DROTHER → DR/BDR 宛てのLSAは **224.0.0.6**（AllDRouters）
- DR → 全OSPFルータ宛ては **224.0.0.5**（AllSPFRouters、Helloもこのアドレス）

### 4.2 DR/BDRが選出されるネットワークタイプ

| ネットワークタイプ | 例 | DR/BDR | Hello/Dead |
|---|---|---|---|
| **ブロードキャスト** | イーサネット（デフォルト） | **選出される** | 10/40 |
| **ポイントツーポイント** | シリアル回線（HDLC/PPP）、`ip ospf network point-to-point` を設定したイーサネット | **選出されない**（ルータが2台しかいないので不要） | 10/40 |
| NBMA | フレームリレー | 選出される | 30/120 |

「どのネットワークタイプでも必ず選出される」「OSPFではDR/BDRは使われない」はどちらも誤りです。

### 4.3 DRの選出ルール

DRの選出は、各インターフェースのOSPFプライオリティとルータIDを使って次の順で行われます。

| 順番 | 比較する値 | 優先 |
|---|---|---|
| ① | インターフェースの**OSPFプライオリティ** | **大きい方**が優先（デフォルト **1**、範囲 **0〜255**） |
| ② | （①が同じなら）**ルータID** | **大きい方**が優先 |

- 1位がDR、2位がBDRになります。
- **プライオリティ0** のルータは**DR/BDRの選出に参加しない**（DRにもBDRにもならない）。OSPFは動作し、ネイバー関係も作ります。
- IPアドレスそのものやOSPFのコストは比較に使いません（コストは経路の選択に使う値）。
- **DRにはプリエンプションがない**: 選出後にプライオリティの高いルータが加わっても、DRは交代しません。DRが故障して初めて、BDRがDRに昇格し、新しいBDRが選出されます。

```
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip ospf priority 255   ← DRになりやすくする（最大255）
R4(config-if)# ip ospf priority 0     ← DR/BDRにしない
```

**STPとの違いに注意**: STPのルートブリッジ選出は、ブリッジID（プライオリティ＋MAC）が**小さい方**が優先です。OSPFのDR選出は**大きい方**が優先なので、逆です。

#### 例題の解き方④ DR/BDR選出

あるイーサネットセグメントに、次の4台が同時に起動した。

| ルータ | プライオリティ | ルータID |
|---|---|---|
| R1 | 1 | 1.1.1.1 |
| R2 | 1 | 4.4.4.4 |
| R3 | 100 | 2.2.2.2 |
| R4 | 0 | 9.9.9.9 |

1. **プライオリティ0を除外**: R4 は選出に参加しない（ルータIDが最大でもDROTHER）。
2. **プライオリティで比較**: R3（100）が最大 → **R3がDR**。
3. **残り（R1, R2）はプライオリティ1で同じ** → ルータIDで比較。4.4.4.4 > 1.1.1.1 → **R2がBDR**。
4. R1, R4 は DROTHER。R1 と R4 の間は 2-WAY のまま（正常）。
5. その後、プライオリティ200のR5が加わっても、**DRはR3のまま**（プリエンプションなし）。

R1 で見ると:

```
R1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
4.4.4.4           1   FULL/BDR        00:00:36    192.168.10.2    GigabitEthernet0/0
2.2.2.2         100   FULL/DR         00:00:33    192.168.10.3    GigabitEthernet0/0
9.9.9.9           0   2WAY/DROTHER    00:00:39    192.168.10.4    GigabitEthernet0/0
```

よくある誤答の整理（`ip ospf priority 0`）:

| 誤答 | 正しくは |
|---|---|
| 必ずDRになる | DRになりやすくするには、プライオリティを大きくする（最大255） |
| OSPFが無効になる | OSPFは動作し、ネイバー関係も作る。DR/BDRにならないだけ |
| コストが0になる | コストは `ip ospf cost` で設定する別の値 |

性能の低いルータや、DRにしたくないルータのプライオリティを0にしておくと、DR/BDRの役割を他のルータに任せられます。

### 4.4 ip ospf network point-to-point

2台のルータだけをイーサネットで直結している場合でも、イーサネットのデフォルトのネットワークタイプは**ブロードキャスト**なので、DR/BDRの選出が行われます。選出には**Waitタイマー**（デフォルトでDeadインターバルと同じ40秒）がかかり、FULLになるまでに時間がかかります。

両端で `ip ospf network point-to-point` を設定すると:

- **DR/BDRの選出が行われず**、隣接関係が早く確立する（すぐにFULLになる）
- Helloは送られる（Helloを止めるのは passive-interface）
- コストは変わらない
- ルートは通常どおり広報される
- **両端の設定をそろえる**必要がある（片側だけだと、ネイバーにはなってもLSDBの解釈がずれて正しくルートが計算されないことがある）

```
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip ospf network point-to-point

R1# show ip ospf interface GigabitEthernet0/1 | include Network Type
  Process ID 1, Router ID 1.1.1.1, Network Type POINT_TO_POINT, Cost: 1

R1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           0   FULL/  -        00:00:37    10.0.12.2       GigabitEthernet0/1
```

### ひっかけポイント・よくある誤解

- DR/BDRはポイントツーポイントでは選出されない。
- DR選出の最初の比較は**プライオリティ（大きい方）**。ルータIDも**大きい方**。STP（小さい方）と逆。
- IPアドレス、コストは DR 選出に使わない。
- プライオリティ0 ＝ DR/BDRにならないだけで、OSPF自体は有効。
- DRは**プリエンプションなし**。
- `ip ospf network point-to-point` は Hello を止めない・コストを変えない・広報を止めない。

### 押さえておくポイント

- DR/BDR はブロードキャスト（とNBMA）で選出。関係の数 N(N−1)/2 を減らすため。
- 選出: プライオリティ最大 → ルータID最大。デフォルト1、範囲0〜255、0は不参加。
- DRはプリエンプトしない。BDRは予備。それ以外はDROTHER。
- DROTHER同士は2-WAY（正常）、DR/BDRとはFULL。
- P2Pリンクは `ip ospf network point-to-point` で選出を省略し、素早くFULLに。

---

## 5. OSPFのコストと経路選択

### 5.1 コストの計算式

OSPFのコストは次の式で計算されます。

```
コスト ＝ 参照帯域幅 ÷ インターフェースの帯域幅
（参照帯域幅のデフォルト ＝ 100 Mbps）
```

- コストは**整数**で、**最小値は1**（1未満は1に切り上げ）。
- 小数点以下は切り捨て。

| インターフェース | 参照帯域幅 100Mbps（デフォルト） | 参照帯域幅 1000Mbps | 参照帯域幅 10000Mbps |
|---|---|---|---|
| 10 Mbps（Ethernet） | 10 | 100 | 1000 |
| 100 Mbps（FastEthernet） | **1** | **10** | 100 |
| 1 Gbps（GigabitEthernet） | **1**（計算上0.1） | **1** | 10 |
| 10 Gbps | 1 | 1 | 1 |
| 1.544 Mbps（T1シリアル） | 64 | 647 | 6476 |

デフォルトでは **100Mbps以上のリンクはすべてコスト1** になり、速さの違いが区別できません。そのため実際のネットワークでは、`router ospf` の中で `auto-cost reference-bandwidth` を大きくすることが多いです。この値は**全ルータでそろえる**必要があります（そろえないと、ルータごとにコストの基準が違い、最適でない経路が選ばれる）。

```
R1(config)# router ospf 1
R1(config-router)# auto-cost reference-bandwidth 10000
% OSPF: Reference bandwidth is changed.
        Please ensure reference bandwidth is consistent across all routers.
```

（`auto-cost reference-bandwidth` の単位は Mbps）

#### 例題の解き方⑤（100Mbps と 1Gbps のコスト）

1. 参照帯域幅 ＝ 100 Mbps。
2. 100 Mbps: 100 ÷ 100 ＝ **1**。
3. 1 Gbps（1000 Mbps）: 100 ÷ 1000 ＝ 0.1 → 1未満は **1**。
4. → 100Mbps＝1、1Gbps＝1。
5. 誤答の正体:
   - 10 と 1 → 参照帯域幅を **1000Mbps** に変更した場合の値。
   - 19 と 4 → **STP**のデフォルトパスコスト（ショート方式: 10M＝100、100M＝19、1G＝4、10G＝2）。
   - 1 と 0.1 → OSPFのコストは**整数**で最小値1。

### 5.2 コストを変える3つの方法

| 方法 | コマンド（モード） | 影響範囲 | 優先度 |
|---|---|---|---|
| ① コストを直接指定 | `ip ospf cost <値>`（インターフェース） | そのインターフェースだけ | **最優先**（帯域幅からの自動計算より優先） |
| ② 帯域幅を変更 | `bandwidth <kbps>`（インターフェース） | そのインターフェースの計算結果 | |
| ③ 参照帯域幅を変更 | `auto-cost reference-bandwidth <Mbps>`（router ospf） | すべてのインターフェースの計算基準 | |

```
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip ospf cost 50

R1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/1        1     0               10.0.12.1/30       50    P2P   1/1
Gi0/0        1     0               192.168.1.1/24     1     DR    0/0
```

紛らわしいコマンド:

| コマンド | 意味 |
|---|---|
| `ip ospf cost 50` | **OSPFのインターフェースコストを50に**（正解） |
| `ip ospf priority 50` | DR選出のプライオリティ。経路選択には影響しない |
| `auto-cost reference-bandwidth 50` | router ospf で全インターフェースの計算基準を変える |
| `spanning-tree cost 50` | **STP**のポートコスト。名前が似ているので混同に注意 |

`bandwidth` コマンドはコスト計算（やEIGRPのメトリック）に使われる値を変えるだけで、実際の通信速度は変わりません。

### 5.3 経路の合計コスト

OSPFのメトリックは、宛先までの経路上の**各ルータの出力インターフェースのコストを合計**したものです。OSPFは合計コストが最も小さい経路を選びます。**経由するルータの数（ホップ数）は関係ありません**。

#### 例題の解き方⑥（R1 から R4 への経路）

```
               (10)          (10)
         ┌──────────▶ R2 ──────────┐
         │                          ▼
        R1 ──(5)──▶ R3 ──(20)───▶ R4
         │                          ▲
         └──(5)──▶ R5 ──(5)──▶ R6 ─(5)┘
  （数字は各ルータの出力インターフェースのコスト）
```

1. 各経路のコストを足し算する:

   | 経路 | 計算 | 合計 | 経由ルータ数 |
   |---|---|---|---|
   | R1 → R2 → R4 | 10 ＋ 10 | 20 | 1台 |
   | R1 → R3 → R4 | 5 ＋ 20 | 25 | 1台 |
   | R1 → R5 → R6 → R4 | 5 ＋ 5 ＋ 5 | **15** | 2台 |

2. 最小は **15** → R1 → R5 → R6 → R4 が選ばれる。
3. 経由するルータが最も多い経路が選ばれている点に注目。「経由するルータが最も少ない経路」を選ぶのは**RIP**（ホップ数）。
4. このとき R1 の `show ip route` では `O ... [110/15] via <R5のアドレス>` となる（宛先が R4 の先のネットワークなら、さらにそのリンクのコストも加わる）。

> 注意: コストは**出力方向**のインターフェースで数えます。行きと帰りで経路のコストが異なる（非対称）こともあります。

### 5.4 等コストマルチパス（ECMP）

同じ宛先への経路が複数あり、合計コストが**等しい**場合、OSPFは**両方の経路をルーティングテーブルに載せて負荷分散**します。これを**等コストマルチパス（ECMP）**と呼びます。

- デフォルトで最大 **4本**（`maximum-paths` で変更できる。上限はIOSやプラットフォームによる）
- `show ip route` では、1つの宛先の下に `via` が複数行表示される

```
R1# show ip route 10.4.0.0
O     10.4.0.0/16 [110/20] via 10.0.12.2, 00:02:11, GigabitEthernet0/1
                  [110/20] via 10.0.13.3, 00:02:11, GigabitEthernet0/2

R1(config)# router ospf 1
R1(config-router)# maximum-paths 8
```

| 誤答 | なぜ違うか |
|---|---|
| 先に学習した経路だけを使う | コストが等しければ両方使われる |
| ルータIDが大きいネイバー経由の経路だけを使う | ルータIDは経路の選択には使わない |
| どちらも使わず破棄する | 等コストの経路があっても破棄することはない |

### ひっかけポイント・よくある誤解

- 1Gbpsのコストは「0.1」ではなく**1**（最小値1、整数）。
- 「19と4」はSTPのコスト。「10と1」は参照帯域幅1000Mbpsのとき。
- `ip ospf priority` は DR 選出用、`spanning-tree cost` は STP 用。コストを直接指定するのは `ip ospf cost`。
- OSPFは**ホップ数ではなく合計コスト**。
- 等コストなら**負荷分散**。ルータIDや学習順では選ばない。

### 押さえておくポイント

- コスト ＝ 参照帯域幅（デフォルト100Mbps）÷ 帯域幅。最小1。
- 100Mbps以上は全部コスト1 → `auto-cost reference-bandwidth` を全ルータで同じ値に上げる。
- 変更方法: `ip ospf cost`（最優先）、`bandwidth`、`auto-cost reference-bandwidth`。
- 経路のメトリック ＝ 出力インターフェースのコストの合計。最小を選ぶ。
- 等コストはECMP（デフォルト最大4本、`maximum-paths`）。

---

## 6. まとめ：ルーティング・OSPFのまぎらわしい数値・大小関係の総整理

ルーティングとOSPFには「似た数字」「大きい方が勝つか小さい方が勝つか」の取り違えやすいポイントが多いので、最後にまとめて整理します（[[28ルーティングの基本とスタティックルート]] の内容も含みます。HSRP など FHRP の数値は [[05_高可用性と冗長化]] にまとめています）。

### 6.1 「大きい方が優先」か「小さい方が優先」か

| 項目 | 優先されるのは |
|---|---|
| ルーティング: プレフィックス長 | **長い（大きい）**方 |
| ルーティング: AD | **小さい**方 |
| ルーティング: メトリック | **小さい**方 |
| OSPF経路: 合計コスト | **小さい**方 |
| OSPF DR選出: プライオリティ | **大きい**方（0は不参加） |
| OSPF DR選出: ルータID | **大きい**方 |
| OSPF ルータID決定: ループバック/物理のIP | **大きい**方 |
| STP ルートブリッジ: ブリッジID（プライオリティ→MAC） | **小さい**方（参考） |

### 6.2 似た数字

| 数字 | 正体 |
|---|---|
| 0 / 1 / 90 / 110 / 120 / 170 | AD: 直接接続 / スタティック / EIGRP内部 / OSPF / RIP / EIGRP外部 |
| 10 / 40 | OSPF Hello / Dead（ブロードキャスト、P2P） |
| 30 / 120 | OSPF Hello / Dead（NBMA） |
| 2 / 20（/15） | STP Hello / 最大エージ（/転送遅延） |
| 30 / 180 | RIP 更新 / 無効タイマー |
| 100 Mbps | OSPFのデフォルト参照帯域幅 |
| 1 | OSPFコストの最小値、OSPFプライオリティのデフォルト |
| 19 / 4 | STPのパスコスト（100M / 1G、ショート方式） |
| 4 | OSPF ECMP のデフォルト最大パス数 |
| /0 | デフォルトルート（IPv4 0.0.0.0/0、IPv6 ::/0） |
| /32 | IPv4ホストルート、ローカルルート（L） |
| /128 | IPv6のホストルート（::/128＝未指定、::1/128＝ループバック） |

### 6.3 似たコマンド

| コマンド | 意味 |
|---|---|
| `ip route 0.0.0.0 0.0.0.0 <NH>` | IPv4のデフォルトルート |
| `ip route ... <NH> <AD>` | フローティングスタティック（末尾はAD） |
| `ipv6 route ::/0 <NH>` | IPv6のデフォルトルート |
| `ipv6 unicast-routing` | IPv6ルーティングの有効化 |
| `ipv6 enable` | インターフェースでIPv6を有効化（リンクローカル生成） |
| `router ospf <PID>` | OSPFプロセスの作成 |
| `network <addr> <wildcard> area <id>` | 範囲内のインターフェースでOSPFを有効化 |
| `ip ospf <PID> area <id>` | インターフェースでOSPFを有効化 |
| `router-id <id>` | ルータIDの手動設定（反映は `clear ip ospf process`） |
| `passive-interface <if>` | Helloを止める（広報は続く） |
| `default-information originate` | デフォルトルートをOSPFで配布 |
| `ip ospf cost <n>` | インターフェースのOSPFコスト |
| `ip ospf priority <n>` | DR選出のプライオリティ |
| `ip ospf network point-to-point` | DR/BDR選出を省略 |
| `auto-cost reference-bandwidth <Mbps>` | 参照帯域幅（全ルータで統一） |
| `maximum-paths <n>` | ECMPの最大パス数 |
| `spanning-tree cost` / `spanning-tree portfast` | STP用（OSPFとは無関係） |

### 6.4 確認コマンド

| コマンド | わかること |
|---|---|
| `show ip route` | ルーティングテーブル、Gateway of last resort |
| `show ip route static` / `ospf` / `connected` | 種類別のルート |
| `show ip interface brief` | インターフェースの Status / Protocol |
| `show ipv6 route` | IPv6ルーティングテーブル |
| `show ip ospf` | ルータID、プロセス情報 |
| `show ip protocols` | ルータID、network設定、passive、AD、maximum-paths |
| `show ip ospf interface [brief]` | エリア、コスト、ネットワークタイプ、タイマー、自分のDR/BDR状態 |
| `show ip ospf neighbor` | ネイバーのルータID、状態/役割 |
| `show ip ospf database` | LSDB |
| `debug ip ospf adj` | 隣接関係の失敗理由 |

---

## 関連
- [[28ルーティングの基本とスタティックルート]] — ルーティングテーブル、AD、スタティックルート、フローティングスタティック
- [[05IPアドレスとサブネットとゲートウェイ]] — サブネットとプレフィックス長
- [[16ルーターとスイッチとハブとNAT]] — ルーターの役割
- [[05_高可用性と冗長化]] — デフォルトゲートウェイの冗長化（HSRP / VRRP / GLBP）
