---
title: 04_パスキーとWebAuthn
created: 2026-10-17
tags:
  - セキュリティ
  - 認証
  - パスキー
  - WebAuthn
---

# パスキーと WebAuthn

パスキーは、**パスワードの代わりに公開鍵暗号でログインする** 仕組みです。サーバーには秘密が残らず、偽サイトでは使えません。考え方の入門は [[05_パスワードは死んだ_パスキーの時代（ゆるコンピュータ科学ラジオ）]]、MFA の他の方式との比較は [[03_MFAの方式比較]]。

---

## 🗺 用語の整理

| 用語 | 意味 |
|------|------|
| **FIDO2** | パスワードなしの認証のための規格のまとまり。WebAuthn と CTAP からなる |
| **WebAuthn** | ブラウザの JavaScript API（`navigator.credentials`）と、サーバーが検証する手順の規格（W3C） |
| **CTAP** | ブラウザ・OS と、外付けのセキュリティキーが話すための規格 |
| **パスキー** | FIDO2 の認証情報（鍵のペア）のうち、**ユーザー名を入れずに選べて、多くは端末間で同期されるもの** の呼び名 |
| **認証器**（Authenticator） | 秘密鍵を持って署名する側。スマホ・PC（指紋・顔・PIN）や USB キー |
| **RP**（Relying Party） | ログインさせる側の Web サービス。**RP ID** はそのドメイン（例：`example.com`） |

---

## 🔑 仕組み

### 登録

```
ブラウザ ── 「登録したい」 ──────────────▶ サーバー
ブラウザ ◀─ challenge（ランダム値）・RP ID・ユーザー ID ─ サーバー
   │
   ▼ 認証器が指紋・顔・PIN で本人確認し、この RP ID 専用の鍵ペアを作る
   │   秘密鍵 … 認証器の中から出ない
   │   公開鍵 … サーバーへ送る
ブラウザ ── 公開鍵・認証情報 ID・challenge への署名 ─▶ サーバーが検証して保存
```

### ログイン

```
ブラウザ ◀─ challenge ─────────────────── サーバー
   │
   ▼ 認証器が本人確認し、秘密鍵で challenge と「接続先のオリジン」に署名
ブラウザ ── 署名 ─────────────────────────▶ サーバーが公開鍵で検証
```

### なぜ強いのか

| 性質 | 理由 |
|------|------|
| **フィッシングに強い** | 鍵は RP ID ごとに作られ、ブラウザが **実際に開いているドメイン** を署名に含める。`examp1e.com` の偽サイトでは `example.com` の鍵が選ばれない |
| **サーバーから漏れても困らない** | サーバーにあるのは公開鍵だけ。漏れてもログインには使えない |
| **使い回しがない** | サイトごとに別の鍵 |
| **リプレイできない** | 毎回違う challenge に署名する |
| **生体情報はサーバーに行かない** | 指紋・顔は、端末の中で秘密鍵を使ってよいか確かめるだけ |

---

## 📱 パスキーの種類

| 種類 | 保存場所 | 長所 | 短所 |
|------|------|------|------|
| **同期パスキー** | iCloud キーチェーン、Google パスワードマネージャー、1Password など | 機種変更しても使える。端末をなくしても復旧できる | 同期元のアカウントが乗っ取られると危ない |
| **端末固定のパスキー** | USB のセキュリティキー、端末の中だけ | 鍵が端末の外に出ない | 紛失すると使えない。予備が必要 |

- 一般の利用者には同期パスキー、管理者など権限の強い人には端末固定のセキュリティキー、という使い分けがよくあります。
- 手元に無い端末のパスキーも、**QR コードを読み取り、Bluetooth で近くにあることを確かめて**（ハイブリッド方式）使えます。

---

## 💻 実装の流れ（SimpleWebAuthn を使う例）

WebAuthn は検証の手順が多いので、**自作せず実績のあるライブラリ** を使います。Node.js なら `@simplewebauthn/server` と `@simplewebauthn/browser` がよく使われます。

### サーバー：登録

```javascript
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';

const rpID = 'example.com';
const origin = 'https://example.com';

// 1. オプションを作る
const options = await generateRegistrationOptions({
  rpName: 'Example',
  rpID,
  userName: user.email,
  excludeCredentials: user.passkeys.map((p) => ({ id: p.credentialId })), // 同じ認証器の二重登録を防ぐ
  authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' },
});
await saveChallenge(user.id, options.challenge); // セッションなどに一時保存

// 2. ブラウザからの応答を検証する
const verification = await verifyRegistrationResponse({
  response: body,
  expectedChallenge: await loadChallenge(user.id),
  expectedOrigin: origin,
  expectedRPID: rpID,
});
if (verification.verified) {
  const { credential, credentialBackedUp } = verification.registrationInfo;
  await savePasskey(user.id, {
    credentialId: credential.id,
    publicKey: credential.publicKey,
    counter: credential.counter,
    transports: credential.transports,
    backedUp: credentialBackedUp, // 同期パスキーかどうか
  });
}
```

### ブラウザ

```javascript
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

// 登録
const optionsJSON = await fetch('/passkeys/register/options').then((r) => r.json());
const attResp = await startRegistration({ optionsJSON });
await fetch('/passkeys/register/verify', { method: 'POST', body: JSON.stringify(attResp) });

// ログイン
const authOptions = await fetch('/passkeys/login/options').then((r) => r.json());
const authResp = await startAuthentication({ optionsJSON: authOptions });
await fetch('/passkeys/login/verify', { method: 'POST', body: JSON.stringify(authResp) });
```

ログインの検証は `generateAuthenticationOptions` と `verifyAuthenticationResponse` で同じ形になります。検証が通ったら、**保存してある counter を更新** してからセッションを発行します。

### 自動入力で出す（Conditional UI）

ユーザー名の入力欄に、パスワードマネージャーのようにパスキーの候補を出せます。

```html
<input type="text" name="username" autocomplete="username webauthn" />
```

```javascript
// ページを開いた時点で待ち受ける
startAuthentication({ optionsJSON: authOptions, useBrowserAutofill: true });
```

---

## 🗄 サーバーに保存するもの

| 項目 | 用途 |
|------|------|
| **認証情報 ID** | どの鍵か。1 人が複数のパスキーを持てるよう、ユーザーとは別のテーブルにする |
| **公開鍵** | 署名の検証 |
| **署名カウンター** | 認証器の複製を検出する。同期パスキーは常に 0 のことが多い |
| **transports** | `internal`・`usb`・`hybrid` など。次回のログインで候補を出しやすくする |
| **バックアップの状態** | 同期パスキーかどうか。端末固定だけの利用者には予備の登録を勧める |
| **名前・作成日時・最終利用日時** | 利用者が設定画面で見分けて削除できるように |

---

## ⚠️ 設計で気をつけること

| 論点 | 内容 |
|------|------|
| **challenge の扱い** | サーバーで作り、1 回だけ使い、短い期限を付ける。ブラウザから送られた値を信じない |
| **RP ID とオリジン** | RP ID を `example.com` にすると `login.example.com` などのサブドメインでも使える。後から変えると全員のパスキーが使えなくなるので最初に決める |
| **回復手段** | パスキーを全部なくした人をどう戻すか。メールのリンクだけで済ませると、そこが弱点になる（[[03_MFAの方式比較]]） |
| **パスワードとの併用** | 移行期はパスワードも残るので、パスワード側の対策（[[02_パスワードの安全な保存]]）も続ける。パスキーを登録した人にはパスワードの削除を選べるようにする |
| **attestation**（認証器の証明） | 一般のサービスでは `none` でよい。社内で特定の機種だけ許可したいときに使う |
| **セッションは別の話** | パスキーで安全にログインしても、その後の Cookie が盗まれれば同じ。セッションの対策は [[MOC_セッション管理]] |

---

## 📋 導入のステップ

```
1. ログイン後の設定画面で「パスキーを追加」できるようにする
2. ログイン画面に Conditional UI（自動入力の候補）を出す
3. 新規登録でパスキーを最初に勧める
4. 管理者アカウントはセキュリティキー・パスキーを必須にする
5. パスワードを削除できるようにする（回復手段を整えてから）
```

---

## 参考
- [passkeys.dev](https://passkeys.dev/)
- [W3C Web Authentication](https://www.w3.org/TR/webauthn-3/)
- [SimpleWebAuthn](https://simplewebauthn.dev/)

前へ：[[03_MFAの方式比較]] ／ 次へ：[[05_パスワードは死んだ_パスキーの時代（ゆるコンピュータ科学ラジオ）]] ／ 目次：[[MOC_認証認可]]
