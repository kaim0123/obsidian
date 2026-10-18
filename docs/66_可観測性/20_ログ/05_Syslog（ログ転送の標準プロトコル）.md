# Syslog（ログ転送の標準プロトコル）

**Syslog** は、Linux サーバーやルータ・スイッチなどのネットワーク機器が、ログを記録・転送するときに使う昔からの標準プロトコルです。rsyslog や Fluent Bit、クラウドのログ基盤も Syslog の受信に対応しており、ログ集約の入口として今も広く使われています。この章では、重大度（severity）レベル、メッセージの形式、Cisco IOS でのログの出力先・レベルの指定・タイムスタンプを整理します。

---

## 1. Syslogとは

Syslogは、機器のログメッセージ（インターフェースのup/down、設定変更、エラーなど）を記録・送信する仕組みです。外部のSyslogサーバへは **UDP 514** で送ります。ログの重要度は **0〜7の重大度（severity）レベル** で表します。

---

## 2. 重大度（severity）レベル

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

---

## 3. Syslogメッセージの形式

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

メッセージ中の数字「5」はインターフェース番号でも、発生回数でもありません。先頭のタイムスタンプは `service timestamps` を設定したときに付きます（7節）。

---

## 4. ログの出力先

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

---

## 5. レベルの指定：「指定したレベル以下の数字」が対象

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

---

## 6. terminal monitor

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

---

## 7. ログのタイムスタンプ

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

---

## 8. ひっかけポイント・よくある誤解

- **最も重大度が高いのはレベル0（emergencies）**。7（debugging）は最も低い。3（errors）、5（notifications）は0より低い。
- **`logging trap 4` ＝ レベル0〜4**。「4のみ」「4〜7」「5〜7」はすべて誤り。
- **`%LINEPROTO-5-UPDOWN` の5は重大度**（notifications）。ファシリティは LINEPROTO、インターフェースは本文中、回数は表示されない。
- **RAMに保存して `show logging` で見るのは `logging buffered`**。console は画面表示のみ、host は外部サーバ、trap は送信レベルの範囲。
- **SSHの画面にログを出すのは `terminal monitor`**。logging console / logging buffered / show logging では流れてこない。
- **ログに日時を付けるのは `service timestamps log datetime msec`**。clock set（手動設定）、ntp server（時刻同期）、logging trap（レベル）ではない。

---

## 9. 押さえておくポイント

- Syslogは UDP 514。重大度 0〜7、**数字が小さいほど深刻**。0 emergencies 〜 7 debugging の8つを順に言える。
- `logging trap N` / `logging console N` などは **0〜N** が対象。
- 形式 `%FACILITY-SEVERITY-MNEMONIC: 本文`。
- 出力先：console、monitor（＋terminal monitor）、buffered（show logging）、host（Syslogサーバ）。
- `terminal monitor` は特権EXEC、保存されない。
- `service timestamps log datetime msec` ＋ NTP で時系列分析。

---

## 10. 関連項目

- [[02_ログレベルの使い分け]]：アプリのログレベル（error / warn / info / debug）と Syslog の重大度の対応
- [[04_ログ集約基盤]]：Syslog で送ったログを集めて検索する仕組み
- [[06_DHCPとNTP（インフラを支えるネットワークサービス）]]：ログの時刻をそろえる NTP
- [[05_SNMP（ネットワーク機器のメトリクス収集）]]：ネットワーク機器のメトリクス側の標準プロトコル
- [[05_ログ監査と侵入の検知]]：rsyslog でサーバーのログを外部へ転送する

---

**前へ** ← [[04_ログ集約基盤]]　｜　**次に読む** → [[01_メトリクスの種類（カウンタ・ゲージ・ヒストグラム）]]
