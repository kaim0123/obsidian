---
title: "API認証の仕組み"
source: "https://www.youtube.com/shorts/LnpbqJlORTE"
author:
  - "[[直也テック]]"
published:
created: 2026-09-26
description: "====note====海外ソフトウェアエンジニアリング事例を発信https://note.com/naoya_tech====SNS====●Xhttps://x.com/naoyashiga●Threadshttps://www.threads.com/@naoya_tech●直也テック TikTokhttp..."
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=LnpbqJlORTE)

\====note====海外ソフトウェアエンジニアリング事例を発信https://note.com/naoya\_tech====SNS====●Xhttps://x.com/naoyashiga●Threadshttps://www.threads.com/@naoya\_tech●直也テック TikTokhttp...

## 詳しい要約

**テーマ：API 認証の代表的な 4 つの方式と、認証と認可の違い**

API は URL を知っていれば誰でも呼べてしまうため、入口で「誰か」を確かめる認証が必要になる。代表的な方式として Basic 認証・API キー・JWT・OAuth の 4 つを紹介し、最後に認証と認可の違いを整理するショート動画。

---

### 4 つの認証方式

| 方式 | 仕組み | ポイント |
|---|---|---|
| **Basic 認証** | ユーザー名とパスワードを Base64 にしてヘッダーに入れて送る | Base64 は 64 文字でデータを表す**置き換えのルールにすぎず、暗号化ではない**。誰でも元に戻せる |
| **API キー** | 発行された固有のキーをリクエストに付ける | 誰がどれだけ使ったかを測れるので、**レート制限や従量課金**がしやすい。漏れたらパスワード同様に無効化が必要 |
| **JWT** | ログイン時にサーバーが署名付きトークンを発行 | **ヘッダー**（アルゴリズム）・**ペイロード**（ID や権限）・**署名**（2 つと秘密鍵から作る改ざん検知値）の 3 部構成。改ざんはすぐ分かり、サーバーは**ステートレス**なのでスケールしやすい |
| **OAuth** | Google などに認証を任せ、アクセストークンを受け取る | 今もっとも使われる方式。自分でパスワードを扱わない。トークンには**有効期限**があり、いつでも取り消せる |

### 認証と認可の違い

- **認証（Authentication）**：あなたは誰か。ログインが認証にあたる。
- **認可（Authorization）**：あなたは何ができるか。例：管理者だけが編集できる。

### まとめ

- Base64 は暗号ではないので、Basic 認証は中身が丸見えになる前提で考える。
- API キーは利用量の計測に強く、JWT は署名による改ざん検知とステートレス性、OAuth はパスワードを預からない委譲が特徴。
- 「誰か」を確かめる認証と、「何ができるか」を決める認可は別のもの。

## Transcript

**0:00** · How API authentication works. Anyone who knows the URL can call the API.

**0:04** · That is why we verify identity at the entrance. That is what authentication is. There are four typical methods.

**0:10** · Basic authentication sends the username and password as is. You just include them in the header using Base64. Base64 is a rule to represent data using only 64 characters. It just replaces bytes with characters; it is not a key. So it is not encryption and anyone can revert it. API authentication adds a unique issued key each time. A benefit is being able to measure who uses how much . It makes rate limiting and usage-based billing easy. However, like a password, if it leaks, you must revoke it.

**0:42** · JWT issues a signed token from the server upon login. It contains three parts: header, payload, and signature. The header holds the algorithm; the payload has the ID and permissions. The signature is a tamper-check value from those two and a secret. With a signature, tampering is immediately detected. Servers are stateless, so they scale easily. And OAuth is the most used method today.

**1:07** · Delegate authentication to services like Google; don't handle passwords.

**1:11** · Instead, you receive an access token.

**1:13** · It has an expiration and can be revoked at any time. The difference between authentication and authorization.

**1:18** · Authentication is who you are; authorization is what you can do.

**1:21** · Logging in is authentication. For example, authorization lets only admins edit.