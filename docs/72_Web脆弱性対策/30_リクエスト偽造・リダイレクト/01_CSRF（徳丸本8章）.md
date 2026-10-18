# 安全なWebアプリケーションの作り方（第8章）

[[01_HTTPセッション管理（徳丸本1章）|第1章]] でセッション管理、[[01_XSS基本編（徳丸本5章）|第5章]] で XSS を学びました。第8章では **CSRF（クロスサイトリクエストフォージェリ）** の仕組みと対策を解説します。

---

## 🔄 クロスサイトリクエストフォージェリ（CSRF）

**CSRF（Cross-Site Request Forgery / クロスサイトリクエストフォージェリ）** は、ログイン済みのユーザーに **意図しないリクエストを送らせる** 攻撃です。

| 項目 | 内容 |
|------|------|
| **別名** | クロスサイト・リクエストフォージェリ、One-Click Attack |
| **前提** | 被害者が対象サイトに **ログイン済み**（Cookie が有効） |
| **攻撃方法** | 別サイトから対象サイトへリクエストを送らせる |

### 日常生活での例え

- **正常な操作**: 銀行サイトで自分の意志で「送金」ボタンを押す
- **CSRF**: 別のサイトを見ているだけなのに、裏で銀行サイトへ「送金」リクエストが送られる

### 攻撃の流れ

```
1. 被害者が bank.com にログイン（Cookie がブラウザに保存）
2. 被害者が evil.com を閲覧
3. evil.com のページが bank.com へリクエストを送る
4. ブラウザが bank.com の Cookie を自動添付
5. bank.com は「ログイン済みユーザーの正規リクエスト」と判断
6. 意図しない操作（送金・設定変更等）が実行される
```

### 攻撃コードの例

```html
<!-- evil.com のページに仕込む -->

<!-- GET リクエスト（画像タグ） -->
<img src="https://bank.com/transfer?to=attacker&amount=100000" width="0" height="0">

<!-- POST リクエスト（自動送信フォーム） -->
<form action="https://bank.com/transfer" method="POST" id="attack">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="100000">
</form>
<script>document.getElementById('attack').submit();</script>
```

### なぜ起きるか

| 要因 | 説明 |
|------|------|
| **Cookie の自動送信** | 同一サイトへのリクエストに Cookie が付く |
| **リクエスト元の未検証** | サーバーが「誰が意図して送ったか」を確認しない |
| **副作用のある GET** | GET で状態変更処理を行っている（設計上の問題） |

---

## ⚖️ CSRF攻撃とXSS攻撃の比較

CSRF と XSS は混同されやすいですが、**攻撃の仕組みと対策** が異なります。

### 比較表

| | CSRF | XSS |
|---|------|-----|
| **目的** | 意図しない **リクエスト** を送らせる | 悪意ある **スクリプト** を実行させる |
| **前提** | ログイン済み（Cookie 有効） | 入力が HTML に反映される脆弱性 |
| **攻撃者の能力** | 別サイトからリクエストを **送る** | ページ内で **JavaScript を実行** |
| **Cookie** | 自動送信を **悪用** | `document.cookie` で **窃取** |
| **主な対策** | CSRF トークン、SameSite Cookie | HTML エスケープ、CSP |

### 図解

```
CSRF:
  evil.com ──リクエスト──→ bank.com（Cookie 付き）
  「ユーザーが意図した操作か？」をサーバーが確認していない

XSS:
  evil.com ではなく bank.com 上で
  注入された <script> が実行される
  → Cookie 窃取、ページ改ざん等
```

### 組み合わせ攻撃

| パターン | 説明 |
|---------|------|
| **XSS 単独** | スクリプトで直接 API を呼び出し、操作可能 |
| **CSRF 単独** | スクリプト不要。フォームや img タグでリクエスト |
| **XSS + CSRF** | XSS で CSRF トークンを読み取り、CSRF 対策を突破 |

**重要:** CSRF トークンは **XSS があると無効化** される（トークンが JavaScript から読めるため）。XSS 対策も並行して必要。

---

## 📋 確認画面がある場合のCSRF攻撃

「確認画面があるから安全」とは **限りません**。確認画面は CSRF を防ぐ仕組みではありません。

### 典型的なフロー

```
入力画面 → 確認画面 → 完了画面
  POST       POST       （DB更新）
```

### なぜ確認画面だけでは防げないか

攻撃者は **確認画面を経由せず**、直接 POST リクエストを送れます。

```html
<!-- 攻撃者が evil.com に仕込むフォーム -->
<form action="https://shop.com/order/confirm" method="POST">
  <input type="hidden" name="product_id" value="123">
  <input type="hidden" name="quantity" value="1">
  <input type="hidden" name="confirmed" value="1">
  <input type="submit" value="Click me">
</form>
```

```
確認画面の役割:
  ✅ ユーザーが内容を見直す（UX）
  ❌ リクエストの正当性を保証する（セキュリティ）ではない
```

### 確認画面を CSRF 対策に使う場合

確認画面の POST に **CSRF トークン** を含め、サーバー側で検証する必要があります。

```php
// 確認画面のフォーム
<input type="hidden" name="csrf_token" value="<?= $token ?>">

// サーバー側で検証
if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    die('不正なリクエストです');
}
```

---

## 👁️ Hiddenパラメータでパラメータ受け渡ししている場合

多段階フォームで **hidden パラメータ** を使って値を引き継ぐ場合、CSRF のリスクがあります。

### 脆弱なパターン

```html
<!-- 入力画面 → 確認画面へ -->
<form method="POST" action="/order/confirm">
  <input type="hidden" name="product_id" value="123">
  <input type="hidden" name="price" value="1000">
  <input type="text" name="quantity" value="2">
  <button type="submit">確認</button>
</form>
```

### 攻撃

攻撃者は **同じパラメータを含むフォーム** を evil.com に作成し、自動送信できます。

```html
<form action="https://shop.com/order/confirm" method="POST">
  <input type="hidden" name="product_id" value="999">
  <input type="hidden" name="price" value="1">
  <input type="hidden" name="quantity" value="100">
</form>
<script>document.forms[0].submit();</script>
```

### なぜ危険か

| 問題 | 説明 |
|------|------|
| **Hidden は改ざん可能** | ブラウザの開発者ツールで値を変更できる |
| **CSRF で再現可能** | 攻撃者が任意の hidden 値で POST できる |
| **価格等の信頼** | hidden の price を信頼してはいけない |

### 対策

| 対策 | 説明 |
|------|------|
| **CSRF トークン** | リクエストの正当性を検証 |
| **サーバー側で値を保持** | 価格等は hidden ではなく **セッション** や DB から取得 |
| **重要値は hidden に載せない** | product_id のみ受け取り、price はサーバーで再取得 |

---

## 🗂️ セッション変数によりパラメータ受け渡ししている場合

**セッション変数** でパラメータを引き継ぐ方式は、hidden より安全ですが、**CSRF 自体は防げません**。

### 比較的安全なパターン

```php
// 入力画面：セッションに保存
$_SESSION['order'] = [
    'product_id' => (int)$_POST['product_id'],
    'quantity'   => (int)$_POST['quantity'],
];
header('Location: /order/confirm');

// 確認画面：セッションから読み取り
$order = $_SESSION['order'];
$product = getProduct($order['product_id']);  // 価格は DB から取得
```

### メリット

| メリット | 説明 |
|---------|------|
| **改ざん耐性** | クライアントから price を送らない |
| **Hidden より安全** | 攻撃者が price を直接指定しにくい |

### 残る CSRF リスク

```
攻撃者が「確定」処理の POST だけを送れる

<form action="https://shop.com/order/complete" method="POST">
  <!-- パラメータ不要。セッションに既存データがあれば処理される -->
</form>
<script>document.forms[0].submit();</script>
```

被害者のセッションに **正当な注文データ** がある場合、攻撃者が「確定」だけ CSRF できる可能性があります。

### 対策

- **確定処理にも CSRF トークン** を必須にする
- セッション引き継ぎは **値の改ざん防止**、CSRF トークンは **意図した操作の確認**

---

## 📤 ファイルアップロードフォームでのCSRF攻撃

**ファイルアップロード** も CSRF の対象になります。`enctype="multipart/form-data"` でも同様です。

### 攻撃の例

```html
<!-- evil.com：自動送信するアップロードフォーム -->
<form action="https://docs.example.com/upload" method="POST"
      enctype="multipart/form-data" id="upload">
  <input type="file" name="file" id="file">
</form>
<script>
  // ファイル選択は同一オリジン制限があり、完全自動化は難しい場合も
  // ただし、攻撃者が用意したファイルをユーザー操作で送らせる等の手法あり
  document.getElementById('upload').submit();
</script>
```

### リスク

| リスク | 説明 |
|--------|------|
| **不正ファイルのアップロード** | ログイン済みユーザー権限でファイルを配置 |
| **Web シェルの配置** | 実行可能なスクリプトをアップロード |
| **設定変更と組み合わせ** | アップロード先や権限の変更と連鎖 |

### 対策

| 対策 | 説明 |
|------|------|
| **CSRF トークン** | アップロードフォームにも必須 |
| **Content-Type 検証** | 許可するファイル形式を限定 |
| **保存先の制御** | Web ルート外、実行権限なし |
| **SameSite Cookie** | クロスサイトからの Cookie 送信を制限 |

---

## 🛡️ 対策

CSRF 対策の基本方針は次の2点です。

```
1. CSRF 対策が必要なページを区別する
2. 正規利用者の意図したリクエストであることを確認する
```

---

## 📍 CSRF対策の必要なページを区別する

すべてのページに CSRF 対策が必要なわけではありません。**状態を変更する処理** を対象にします。

### 対策が必要な操作

| 操作 | 例 | CSRF 対策 |
|------|-----|----------|
| **作成** | 投稿、注文、ユーザー登録 | ✅ 必要 |
| **更新** | プロフィール変更、設定変更 | ✅ 必要 |
| **削除** | 記事削除、アカウント削除 | ✅ 必要 |
| **送金・決済** | 振込、購入確定 | ✅ 必要 + 再認証 |
| **参照のみ** | 一覧表示、詳細表示 | △ 通常不要 |
| **検索（GET）** | キーワード検索 | △ GET で副作用がなければ低リスク |

### 判断基準

```
CSRF 対策が必要:
  → リクエストが「副作用」を持つ（データが変わる）
  → 認証済みユーザーの権限で実行される

CSRF 対策が不要（または優先度低）:
  → 参照のみ（GET でデータ変更なし）
  → 公開 API（認証不要）
```

### GET で状態変更しない

```php
// ❌ 危険：GET で削除
<a href="/delete?id=123">削除</a>
// → CSRF 攻撃が img タグ1つで可能

// ✅ 安全：POST + CSRF トークン
<form method="POST" action="/delete">
  <input type="hidden" name="id" value="123">
  <input type="hidden" name="csrf_token" value="<?= $token ?>">
  <button type="submit">削除</button>
</form>
```

---

## ✅ 正規利用者の意図したリクエストであることを確認する

CSRF 対策の本質は、**「このリクエストは、ユーザーが自サイト上で意図して送ったものか」** をサーバー側で確認することです。

### 確認方法

| 方法 | 信頼性 | 説明 |
|------|--------|------|
| **CSRF トークン** | 高 | 秘密トークンの一致を検証 |
| **SameSite Cookie** | 中〜高 | クロスサイト Cookie 送信を制限 |
| **Referer チェック** | 低〜中 | リクエスト元 URL を確認 |
| **パスワード再入力** | 高 | 重要操作で本人確認 |
| **カスタムヘッダ** | 高 | `X-Requested-With` 等（API 向け） |

### 多層防御

```
SameSite Cookie（第1の防御線）
    +
CSRF トークン（第2の防御線）
    +
重要操作ではパスワード再入力（第3の防御線）
```

---

## 🔑 秘密情報（トークン）の埋め込み

**CSRF トークン** は、CSRF 対策の **最も重要で標準的な手法** です。

### 仕組み

```
1. サーバーがランダムなトークンを生成
2. セッションに保存
3. フォームに hidden フィールドとして埋め込む
4. 送信時にトークンも POST される
5. サーバーがセッションのトークンと一致するか検証
6. 一致しなければ拒否
```

### 実装例（PHP）

```php
// トークン生成
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$token = $_SESSION['csrf_token'];
```

```html
<!-- フォームに埋め込み -->
<form method="POST" action="/transfer">
  <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($token) ?>">
  <!-- その他のフィールド -->
  <button type="submit">送金</button>
</form>
```

```php
// 検証
if (!isset($_POST['csrf_token']) ||
    !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    http_response_code(403);
    die('不正なリクエストです');
}
```

### なぜ有効か

```
evil.com のページから bank.com へ POST しても:
  → evil.com は bank.com の CSRF トークンを知らない
  → 正しいトークンを送れない
  → サーバーが拒否 ✅
```

### トークンの要件

| 要件 | 説明 |
|------|------|
| **推測困難** | `random_bytes()` 等で生成 |
| **セッションごと** | ユーザー・セッション単位で管理 |
| **重要操作ごと** | ワンタイムトークンも可能 |
| **比較は定数時間** | `hash_equals()` でタイミング攻撃を防ぐ |

### Ajax / API での利用

```javascript
// メタタグや Cookie からトークンを取得
const token = document.querySelector('meta[name="csrf-token"]').content;

fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token
  },
  body: JSON.stringify({ to: 'xxx', amount: 1000 })
});
```

---

## 🔐 パスワード再入力

**送金・パスワード変更・アカウント削除** など、特に重要な操作では **パスワードの再入力** を求めます。

### 仕組み

```
1. ユーザーが「アカウント削除」をクリック
2. 確認画面でパスワード入力を要求
3. サーバーがパスワードを検証
4. 正しければ処理を実行
```

### なぜ有効か

| 理由 | 説明 |
|------|------|
| **攻撃者が知らない情報** | パスワードは evil.com から取得できない |
| **ユーザー意図の確認** | 能動的な入力が必要 |
| **CSRF トークンと併用** | より強固な防御 |

### 実装例

```html
<form method="POST" action="/account/delete">
  <input type="hidden" name="csrf_token" value="<?= $token ?>">
  <p>アカウントを削除するにはパスワードを入力してください。</p>
  <input type="password" name="password" required>
  <button type="submit">削除する</button>
</form>
```

```php
// パスワード検証
if (!password_verify($_POST['password'], $user['password_hash'])) {
    die('パスワードが正しくありません');
}
// 削除処理...
```

### 適用場面

| 操作 | 再入力 |
|------|--------|
| 送金・決済 | ✅ 推奨 |
| パスワード変更 | ✅ 推奨 |
| アカウント削除 | ✅ 推奨 |
| メールアドレス変更 | ✅ 推奨 |
| プロフィール更新 | △ 任意 |
| 記事投稿 | △ CSRF トークンで十分なことが多い |

---

## 🔗 Refererのチェック

**Referer（Referrer）ヘッダ** を検証し、リクエストが **自サイトから** 送られたか確認する方法です。

### 仕組み

```
POST /transfer HTTP/1.1
Host: bank.com
Referer: https://bank.com/transfer/form
         ↑ リクエスト元の URL
```

```php
// Referer チェック
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$allowed = 'https://bank.com';
if (strpos($referer, $allowed) !== 0) {
    die('不正なリクエスト元です');
}
```

### メリット・デメリット

| メリット | デメリット |
|---------|-----------|
| 実装が比較的簡単 | Referer が **送信されない** 場合がある |
| 補助的防御として有効 | プライバシー設定で省略される |
| | 偽造の可能性（ブラウザ依存） |
| | **単独では不十分** |

### Referer が送られないケース

- HTTPS → HTTP への遷移
- `Referrer-Policy: no-referrer` の設定
- ブックマークからの直接アクセス
- 一部ブラウザ拡張

### 位置づけ

```
Referer チェック = 保険的・補助的対策
CSRF トークン    = 根本対策（必須）
```

**推奨:** CSRF トークンを主とし、Referer チェックは **追加防御** として利用。

---

## 📝 まとめ

| トピック | 要点 |
|---------|------|
| CSRF | ログイン済みユーザーに意図しないリクエストを送らせる |
| XSS との違い | CSRF=リクエスト送信、XSS=スクリプト実行 |
| 確認画面 | UX 用。CSRF 対策にはならない |
| Hidden パラメータ | 改ざん・CSRF で再現可能。信頼してはいけない |
| セッション引き継ぎ | 改ざん防止に有効だが CSRF は別対策が必要 |
| ファイルアップロード | CSRF トークン必須 |
| 対策対象 | 副作用のある操作（POST 等） |
| CSRF トークン | **最も重要な対策** |
| パスワード再入力 | 重要操作の追加防御 |
| Referer チェック | 補助的対策 |

### CSRF 対策チェックリスト

```
□ 状態変更処理は POST を使用（GET で変更しない）
□ フォームに CSRF トークンを埋め込み、サーバーで検証
□ Cookie に SameSite 属性を設定（Strict または Lax）
□ 価格・権限等は hidden ではなくサーバー側で管理
□ 送金・削除等の重要操作はパスワード再入力
□ Referer チェックは補助として（任意）
□ XSS 対策も並行（CSRF トークンは XSS で無効化される）
```

次の章では、セッション管理の脆弱性やその他の Web アプリケーションの問題について学んでいきます。
