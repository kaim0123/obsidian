---
title: 07_トークンの保存場所（Cookie_vs_localStorage）
created: 2026-10-17
tags:
  - セキュリティ
  - トークン
  - Cookie
---

# トークンの保存場所（Cookie vs localStorage）

「JWT は localStorage と Cookie のどちらに置くべきか」はよく議論になります。2026 年に出版された **RFC 10017（OAuth 2.0 for Browser-Based Applications）** で、IETF の考え方が整理されました。結論は **「できればブラウザにトークンを置かない」** です。

---

## 🎯 結論

| 優先 | 方式 | 一言で |
|------|------|------|
| 1 | **BFF**（Backend for Frontend） | トークンはサーバーに置き、ブラウザには `HttpOnly` のセッション Cookie だけ渡す |
| 2 | **トークン仲介バックエンド** | リフレッシュトークンはサーバーに置き、短いアクセストークンだけブラウザのメモリに渡す |
| 3 | **ブラウザだけで完結**（SPA が直接 OAuth） | トークンをメモリや Web Worker に置く。localStorage は避ける |

RFC 10017 は、3 番の「ブラウザだけで完結する方式」を **業務アプリ・重要なアプリ・個人情報を扱うアプリには勧めない** としています。

---

## 🤔 なぜ置き場所が問題になるのか

ブラウザに置いたトークンを狙う攻撃は、主に 2 つです。

| 攻撃 | 何が起きるか | 関係する置き場所 |
|------|------|------|
| **XSS**（[[01_XSS基本編（徳丸本5章）]]） | 攻撃者のスクリプトが、同じオリジンの JavaScript として動く | JavaScript から読める場所（localStorage・sessionStorage・メモリ） |
| **CSRF**（[[01_CSRF（徳丸本8章）]]） | 別サイトから、利用者のブラウザにリクエストを送らせる | 自動で送られる場所（Cookie） |

**大事な前提:** XSS が起きると、どこに置いても **そのページの中で API を呼ばれる** ことは防げません。違いは、**トークンそのものを外に持ち出されるかどうか** です。持ち出されると、利用者がブラウザを閉じた後も、攻撃者の手元で使い続けられます。

---

## 📊 置き場所ごとの比較

| 置き場所 | XSS で持ち出される | CSRF | 再読み込みで残る | タブ間で共有 | 備考 |
|------|:------:|:------:|:------:|:------:|------|
| **localStorage** | される | 関係ない | 残る | される | 同じオリジンのどのスクリプトからも読める。ディスクに平文で残る |
| **sessionStorage** | される | 関係ない | 残る（タブを閉じると消える） | されない | localStorage よりは少しまし |
| **メモリ**（JavaScript の変数） | されやすい | 関係ない | 消える | されない | 再読み込みのたびに取り直しが必要 |
| **Web Worker の中** | されにくい | 関係ない | 消える | されない | ページから直接読めない。ただし Worker が API を代わりに呼ぶので悪用はされる |
| **`HttpOnly` Cookie** | **されない** | 対策が必要 | 残る | される | JavaScript から読めない。ブラウザが自動で送る |
| **JavaScript で書いた Cookie** | される | 対策が必要 | 残る | される | RFC 10017 でも勧めない。両方の弱点を持つ |

**ポイント:** `HttpOnly` Cookie は XSS で **持ち出されない** 唯一の置き場所です。代わりに CSRF の対策が必要ですが、CSRF は `SameSite` 属性やトークンで確実に防げます。

---

## 🏛 BFF 方式

```
ブラウザ（SPA）                    BFF（自分のサーバー）              認証サーバー・API
     │                                 │                                  │
     │── ログイン ───────────────────▶│── OAuth（コード + PKCE）───────▶│
     │                                 │◀─ AT・RT ──────────────────────│
     │◀─ Set-Cookie: session=...       │   （トークンは BFF の中に保存）
     │   HttpOnly; Secure; SameSite    │
     │                                 │
     │── /api/orders（Cookie だけ）──▶│── Authorization: Bearer AT ───▶│ API
     │◀─ 結果 ────────────────────────│◀─────────────────────────────── │
```

| 長所 | 短所 |
|------|------|
| ブラウザにトークンがないので、持ち出されるものがない | サーバー（BFF）が必要。完全な静的ホスティングにはできない |
| リフレッシュトークンを安全に扱える（[[06_リフレッシュトークンの設計]]） | API への通信が BFF を経由する |
| OAuth のクライアント認証（client secret）を使える | Cookie なので CSRF 対策が必要 |

Next.js・Nuxt などのサーバー機能を持つフレームワークでは、BFF をアプリの一部として作れます。Auth.js（NextAuth）などのライブラリの標準的な形もこれです。

### BFF の Cookie の設定

```
Set-Cookie: __Host-session=ランダムなID; Path=/; Secure; HttpOnly; SameSite=Lax
```

| 属性 | 理由 |
|------|------|
| `HttpOnly` | JavaScript から読めなくする |
| `Secure` | HTTPS でだけ送る |
| `SameSite=Lax`（または `Strict`） | 別サイトからの POST などで送られなくなる（CSRF 対策の土台） |
| `__Host-` 接頭辞 | `Secure` 付き・`Domain` 属性なし・`Path=/` を強制。サブドメインから上書きされない |

- 状態を変える API には、`SameSite` に加えて **CSRF トークン** か **独自ヘッダの確認**（`X-Requested-With` などが付いているか）を入れます。
- Cookie にアクセストークンを入れる場合は、中身を **暗号化** します。
- Cookie の属性の詳細は [[02_クッキー出力にまつわる脆弱性（徳丸本11章）]]。

---

## 🧩 BFF が使えない場合（ブラウザだけで完結）

静的ホスティングの SPA などで、どうしてもブラウザに置く場合です。

| 対策 | 内容 |
|------|------|
| **localStorage に置かない** | メモリに置き、再読み込み時は認証サーバーのセッションを使って取り直す |
| **リフレッシュトークンは Web Worker の中** | ページのスクリプトから直接読めないようにする |
| **短い期限 + ローテーション** | 持ち出されても使える時間を短くし、再利用を検知する |
| **DPoP** | 取り出せない鍵（non-extractable）でトークンを端末に結び付ける |
| **XSS 対策を厚くする** | CSP・Trusted Types・依存ライブラリの管理（[[09_PKCEとCSPとは]]、[[10_セキュリティヘッダ全般]]） |

RFC 10017 も、「攻撃者のコードが動いている時点で、新しいトークンを取得することは止められない」と書いています。保存場所の工夫は **被害を小さくする** ためのもので、XSS 対策の代わりにはなりません。

---

## 🍪 第三者 Cookie の状況（2026 年）

「Cookie はそのうち使えなくなるから localStorage に」という話を見かけますが、混同されがちです。

- 制限の対象は、**別のサイトに埋め込まれたときに送られる第三者 Cookie** です。自分のサイトのログイン Cookie（ファーストパーティ）は関係ありません。
- Google は 2025 年に、Chrome の第三者 Cookie の廃止計画を取りやめ、Privacy Sandbox もほぼ終了しました。Safari と Firefox は以前から第三者 Cookie を制限しています。
- 認証サーバーとアプリのドメインを **同じサイト**（`auth.example.com` と `app.example.com` など）にしておくと、ブラウザの方針に左右されにくくなります。

---

## 🛡 Cookie そのものが盗まれる場合

マルウェア（情報窃取型のインフォスティーラー）は、ブラウザの Cookie のファイルを直接盗みます。`HttpOnly` でも防げません。

| 対策 | 内容 |
|------|------|
| **セッションを端末に結び付ける** | Chrome の **DBSC**（Device Bound Session Credentials）は、端末の TPM で守った鍵とセッションを結び付け、盗まれた Cookie を別の端末で使えなくする。2026 年 4 月から Windows の Chrome で正式に提供。サイト側の対応が必要 |
| **異常の検知** | IP・国・端末が急に変わったら再認証を求める |
| **短いセッション** | 重要な操作の前に再認証（ステップアップ）する（[[03_MFAの方式比較]]） |

---

## 📋 判断の早見表

```
サーバーを持てる？
 ├─ はい → BFF（トークンはサーバー、ブラウザには HttpOnly Cookie）
 └─ いいえ
     ├─ 業務・個人情報を扱う → サーバーを持つ構成を検討し直す
     └─ それ以外 → メモリ / Web Worker に置く + 短い期限 + ローテーション + DPoP
                   localStorage には置かない
```

---

## 参考
- [RFC 10017: OAuth 2.0 for Browser-Based Applications](https://www.rfc-editor.org/info/rfc10017/)（6 章：構成の選び方、8 章：ブラウザでの保存）
- [oauth.net: Browser-Based Apps](https://oauth.net/2/browser-based-apps/)
- [OWASP HTML5 Security Cheat Sheet（Local Storage）](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
- [Google Chrome の DBSC（The Hacker News, 2026-04）](https://thehackernews.com/2026/04/google-rolls-out-dbsc-in-chrome-146-to.html)
- [Privacy Sandbox の終了（Engadget）](https://engadget.com/cybersecurity/google-has-killed-privacy-sandbox-130029899.html)

前へ：[[06_リフレッシュトークンの設計]] ／ 目次：[[MOC_セッション管理]]
