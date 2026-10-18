# CCNA 200-301 問題解説ガイド

このアプリに収録している全305問の内容を、分野ごと・トピックごとに体系立てて解説した資料です。
問題を解いたあとの復習や、苦手分野の読み込みに使ってください。

## 分野一覧

| 分野 | 出題比率 | 収録問題数 | 主なトピック | 解説 |
| --- | ---: | ---: | --- | --- |
| ネットワーク基礎 | 20% | 50 | OSI参照モデル、TCP/UDP、IPv4/IPv6、サブネット、ケーブル、仮想化 | [network-fundamentals.md](./network-fundamentals.md) |
| ネットワークアクセス | 20% | 49 | VLAN、トランク、STP/RSTP、CDP/LLDP、EtherChannel、無線LAN | [network-access.md](./network-access.md) |
| IP接続 | 25% | 49 | ルーティングテーブル、AD、スタティックルート、OSPF、FHRP | [ip-connectivity.md](./ip-connectivity.md) |
| IPサービス | 10% | 52 | NAT/PAT、DHCP、DNS、NTP、SNMP、Syslog、QoS | [ip-services.md](./ip-services.md) |
| セキュリティ基礎 | 15% | 56 | ACL、ポートセキュリティ、L2セキュリティ、AAA、VPN、無線セキュリティ | [security-fundamentals.md](./security-fundamentals.md) |
| 自動化とプログラマビリティ | 10% | 49 | SDN、コントローラ、REST API、JSON、NETCONF/YANG、Ansible/Terraform、AI | [automation.md](./automation.md) |

## 各ファイルの構成

1. **トピック別の解説** — 基礎から順に、表・コマンド例・図を交えて説明
2. **ひっかけポイント・よくある誤解** — 不正解の選択肢から読み取れる典型的な間違い
3. **試験のポイント** — 覚えておくべき要点
4. **関連問題** — その章の知識で解ける問題ID
5. **問題別クイックリファレンス**（各ファイル末尾） — 全問の要点と正解を ID 順に一覧

## 問題IDの接頭辞

| 接頭辞 | 分野 |
| --- | --- |
| `nf-` | ネットワーク基礎 |
| `na-` | ネットワークアクセス |
| `ic-` | IP接続 |
| `is-` | IPサービス |
| `sf-` | セキュリティ基礎 |
| `au-` | 自動化とプログラマビリティ |

> 問題データ（`src/data/questions/*.json`）を更新した場合は、対応する解説ファイルも更新してください。
