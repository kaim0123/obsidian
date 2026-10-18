---
title: 03_SSRF
created: 2026-10-17
tags:
  - セキュリティ
  - SSRF
  - リクエスト偽造
---

# SSRF（サーバーサイドリクエストフォージェリ）

徳丸本には独立した章がない脆弱性です。概要と Capital One 事件は [[A10_サーバーサイドリクエストフォージェリ]] にまとめたので、ここでは **実装でどう防ぐか**（URL の検証・DNS・リダイレクト）を中心に整理します。

---

## 🔄 CSRF との違い

名前は似ていますが、**誰に** リクエストを送らせるかが違います。

| | CSRF（[[01_CSRF（徳丸本8章）]]） | SSRF |
|------|------|------|
| **送らせる相手** | 利用者の **ブラウザ** | アプリの **サーバー** |
| **悪用する権限** | 利用者のログイン状態（Cookie） | サーバーのネットワーク上の位置・クラウドの権限 |
| **狙う先** | 対象サイトの更新処理 | 社内ネットワーク・localhost・クラウドのメタデータ |
| **主な対策** | CSRF トークン・SameSite Cookie | 宛先の許可リスト・ネットワークの分離 |

```
攻撃者 ──「この URL を取ってきて」──▶ Web サーバー ──▶ http://169.254.169.254/ （メタデータ）
                                       │           ──▶ http://10.0.0.5:6379/  （社内の Redis）
                                       │           ──▶ http://localhost:8080/admin
                                       ▼
                        ファイアウォールの内側から送るので止まらない
```

**根本原因:** サーバーは社内ネットワークの **内側** にいます。外からは届かない宛先にも、サーバーなら届いてしまいます。

---

## 🎯 SSRF が起きる機能

「利用者が指定した URL を、サーバーが取りに行く」機能すべてが対象です。

| 機能 | 例 |
|------|------|
| **URL から画像を取り込む** | プロフィール画像を URL で指定 |
| **リンクのプレビュー**（OGP 取得） | チャットや SNS で URL を貼るとカードが出る |
| **Webhook** | 「イベントが起きたらこの URL に通知」 |
| **PDF・スクリーンショット生成** | ヘッドレスブラウザで指定ページを開く。ページ内の `<iframe>` や `<img>` からも内部に届く |
| **フィード・インポート** | RSS 取得、URL 指定の CSV 取り込み |
| **XML の外部実体参照** | XXE で `SYSTEM "http://内部/"` を読ませる（[[03_構造化データの読み込みにまつわる問題（徳丸本17章）]]） |
| **LLM のツール** | 「Web ページを読む」ツールに、プロンプトインジェクションで内部 URL を読ませる（[[08_プロンプトインジェクション]]） |

### 2 つの種類

| 種類 | 内容 |
|------|------|
| **通常の SSRF** | 取ってきた内容が画面に表示される。内部 API の応答やクラウドの認証情報がそのまま読める |
| **ブラインド SSRF** | 内容は返らない。それでも応答時間やエラーの違いで **社内のどのポートが開いているか** を調べられる。更新系の内部 API なら、送るだけで被害が出る |

---

## 🧨 よくある回避の手口

「`localhost` と `127.0.0.1` を禁止する」だけの対策は、すぐ破られます。

| 手口 | 例 |
|------|------|
| **IP の別表記** | `http://2130706433/`（10 進）、`http://0x7f.1/`、`http://127.1/`、`http://[::1]/`、`http://[::ffff:127.0.0.1]/` |
| **内部 IP を返すドメイン** | 攻撃者のドメイン `a.attacker.example` の DNS を `127.0.0.1` に向ける |
| **DNS リバインディング** | 検査のときは外部 IP、実際に接続するときは内部 IP を返す |
| **リダイレクト** | 許可された外部 URL が `302 Location: http://169.254.169.254/` を返す（[[02_リダイレクト処理にまつわる脆弱性（徳丸本10章）|オープンリダイレクト]] も踏み台になる） |
| **別のスキーム** | `file:///etc/passwd`、`gopher://`、`dict://`。PHP の curl などは HTTP 以外も話せる |
| **URL の解釈のずれ** | `http://allowed.example@evil.example/`、`http://evil.example#@allowed.example/`。検査に使うパーサーと、実際に接続するライブラリで解釈が違う |

**ポイント:** 文字列のまま検査するのではなく、**「実際に接続する IP アドレス」** を検査します。

---

## 🛡 対策

### 1. そもそも任意の URL を受け付けない（最も強い）

| 方法 | 例 |
|------|------|
| **宛先を固定する** | 画像は利用者のブラウザから直接アップロードさせる |
| **許可リスト** | 取りに行ってよいドメインを `cdn.partner.example` などに限る |
| **ID で指定させる** | 連携先は URL ではなく、登録済みの連携先 ID で指定させる |

### 2. 任意の URL が必要なら、接続先 IP を検査する

OGP 取得や Webhook のように、どうしても任意の URL が必要な場合の手順です。

```
1. URL をパースする（WHATWG URL で正規化）
2. スキームを http / https に限る
3. ホスト名を DNS で解決する
4. 解決した「全部の」IP が、公開されたアドレスか確認する
5. 確認した IP にそのまま接続する（もう一度 DNS を引かない）
6. リダイレクトは自動で追わず、行き先ごとに 1 から検査し直す
```

ブロックすべきアドレスの例です。

| 範囲 | 内容 |
|------|------|
| `127.0.0.0/8`、`::1` | ループバック（自分自身） |
| `10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`、`fc00::/7` | プライベートアドレス |
| `169.254.0.0/16`、`fe80::/10` | リンクローカル（**クラウドのメタデータ**） |
| `0.0.0.0/8`、`100.64.0.0/10` など | 予約済み・特殊用途 |

### 実装例（Node.js）

5 番の「確認した IP に接続する」を守るため、**接続のときに呼ばれる DNS 解決（`lookup`）の中で検査** します。検査と接続の間で DNS の答えが変わる、DNS リバインディングを防げます。

```javascript
import dns from 'node:dns';
import net from 'node:net';
import https from 'node:https';
import ipaddr from 'ipaddr.js';

function isPublicAddress(address) {
  let ip = ipaddr.parse(address);
  // ::ffff:127.0.0.1 のような IPv4 射影アドレスは IPv4 として判定する
  if (ip.kind() === 'ipv6' && ip.isIPv4MappedAddress()) ip = ip.toIPv4Address();
  // private / loopback / linkLocal / reserved などはすべて unicast 以外になる
  return ip.range() === 'unicast';
}

// 接続直前の DNS 解決で検査する（DNS リバインディング対策）
function safeLookup(hostname, options, callback) {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);
    const blocked = addresses.find((a) => !isPublicAddress(a.address));
    if (blocked) return callback(new Error(`blocked address: ${blocked.address}`));
    if (options.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
}

function assertSafeUrl(input) {
  const url = new URL(input); // http://2130706433/ は 127.0.0.1 に正規化される
  if (url.protocol !== 'https:') throw new Error('https only');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  // IP 直書きの URL では lookup が呼ばれないので、ここで検査する
  if (net.isIP(host) && !isPublicAddress(host)) throw new Error('blocked address');
  return url;
}

export function safeGet(input) {
  const url = assertSafeUrl(input);
  return new Promise((resolve, reject) => {
    const req = https.get(url, { lookup: safeLookup, timeout: 5000 }, (res) => {
      // リダイレクトは自動で追わない。追うなら Location を assertSafeUrl から検査し直す
      if (res.statusCode >= 300 && res.statusCode < 400) {
        res.resume();
        return reject(new Error('redirect not allowed'));
      }
      resolve(res);
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}
```

- 同じ考え方のライブラリ（`request-filtering-agent` など）もあります。自作より、こうしたものを使うほうが漏れにくいです。
- 応答の **サイズ上限** も付けます（巨大なファイルでメモリを使い切らせる攻撃を防ぐ）。

### 3. ネットワーク側でも止める（多層防御）

アプリの検査は、どこかで抜けるものとして設計します。

| 対策 | 内容 |
|------|------|
| **外向き通信をプロキシ経由にする** | URL を取りに行く処理を専用のプロキシやワーカーに分け、そこで許可リストを適用する。アプリ本体は社内ネットワークに置いたままでよい |
| **ファイアウォール・セキュリティグループ** | 取りに行くサーバーから、社内 DB や管理画面に届かないようにする |
| **IMDSv2 を必須にする**（AWS） | メタデータの取得に、`PUT` で発行するトークンが必要になる。単純な `GET` だけの SSRF では認証情報を取れない。コンテナからの到達を防ぐため、応答のホップ数上限は `1` にする |
| **最小権限の IAM ロール** | 認証情報を盗まれても、できることを小さくする（[[01_最小権限の原則]]） |
| **内部サービスにも認証を付ける** | 「社内からなら誰でも使える」Redis や管理画面をなくす |

### 4. 応答を返しすぎない

- 取ってきた内容を **そのまま利用者に返さない**。画像なら画像として検証し、OGP ならタイトルと説明だけを取り出す。
- エラーの文言を分けない（「接続拒否」「タイムアウト」などの違いから、社内のポートの状態が分かってしまう）。

---

## ❌ ありがちな失敗

| 失敗 | なぜ駄目か |
|------|------|
| URL の文字列に `localhost` が含まれるか調べる | 別表記・DNS で簡単に回避される |
| ホスト名を一度 DNS で引いて検査し、その後ライブラリに URL を渡す | ライブラリがもう一度 DNS を引くので、DNS リバインディングで破られる |
| 最初の URL だけ検査して、リダイレクトは自動で追う | 許可された外部サイトから内部へリダイレクトされる |
| IPv4 だけ検査する | `[::1]` や `[::ffff:169.254.169.254]` で届いてしまう |
| ヘッドレスブラウザの PDF 生成で、最初の URL だけ検査する | ページ内のリソースの読み込みは検査されない。ブラウザごと隔離したネットワークで動かす |

---

## 📋 対策の優先順位

```
1. 任意の URL を受け付けない設計にする（固定・許可リスト・ID 指定）（本質的対策）
2. 任意の URL が必要なら、接続先 IP を接続時に検査し、リダイレクトごとに検査し直す
3. http / https 以外のスキームを禁止する
4. 外向き通信の分離・ファイアウォール・IMDSv2（多層防御）
5. 応答の内容・エラー・サイズ・時間を絞る（補助）
```

---

## 参考
- [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [AWS: IMDSv2 の使用](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html)

前へ：[[02_リダイレクト処理にまつわる脆弱性（徳丸本10章）]] ／ 目次：[[MOC_Web脆弱性対策]]
