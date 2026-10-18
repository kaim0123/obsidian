# データレイヤー（dataLayer）

## 🎯 このページのゴール

- dataLayer が **「Webサイトと計測ツールの間の公式な伝言板」** であることを理解する
- `dataLayer.push` の書き方を覚える
- 開発者とマーケターの **仕事の境界線** を dataLayer 設計で引けるようになる

---

## 1. dataLayer とは

**ブラウザのJavaScriptオブジェクト（配列）** であり、GTM/gtag.js が読み取る **共通のデータ置き場**。

```js
window.dataLayer = window.dataLayer || [];
```

この `window.dataLayer` という配列に **オブジェクトをpush** することで、GTMに情報を渡せます。

### なぜ必要?

- HTMLの中身や見た目に依存せず、**構造化されたデータ** として情報を渡せる
- マーケター側はHTMLを知らなくても、**dataLayerの仕様書** さえあれば計測設計できる
- 開発者側は `dataLayer.push` を書くだけで、後はGTM/計測ツールがよしなにやってくれる

---

## 2. データレイヤーの役割

```
[サイトの状態・ユーザーの行動]
          ↓  開発者が実装
   window.dataLayer.push({...})
          ↓
     [dataLayer 配列]
          ↓  自動で監視・検知
         [GTM]
          ↓  タグ発火
  [GA4 / Meta Pixel / その他]
```

---

## 3. `dataLayer.push` の書き方

### 最小例（イベントだけpush）

```js
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ event: 'sign_up' });
```

GTM側で **カスタムイベント トリガー** → イベント名 `sign_up` で受け取れる。

### 付加情報も一緒に

```js
window.dataLayer.push({
  event: 'purchase',
  order_id: 'A12345',
  revenue: 5000,
  currency: 'JPY',
  items: [
    { item_id: 'SKU-01', item_name: '商品A', price: 3000, quantity: 1 },
    { item_id: 'SKU-02', item_name: '商品B', price: 2000, quantity: 1 }
  ]
});
```

### イベントなし（ページロード時の値セット）

```js
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  user_id: 'U12345',
  membership_level: 'premium',
  login_status: 'logged_in'
});
```

→ `event` キーがないpushは **値の格納だけ** で、GTMのトリガーは発火しない。ページロード後すぐに、他のイベントで参照可能な状態になる。

---

## 4. GTM側での受け取り方

### Step1: カスタムイベントトリガーを作る

```
トリガータイプ: カスタム イベント
イベント名: purchase
```

### Step2: データレイヤー変数で値を取り出す

```
変数タイプ: データレイヤー変数
データレイヤーの変数名: order_id
バージョン: 2
```

→ `{{DLV - order_id}}` として使えるようになる

### Step3: タグでパラメータ指定

```
タグ: GA4 イベント
イベント名: purchase
パラメータ:
  transaction_id = {{DLV - order_id}}
  value          = {{DLV - revenue}}
  currency       = {{DLV - currency}}
  items          = {{DLV - items}}
```

---

## 5. 命名のベストプラクティス（超重要）

### イベント名は全員で統一

- **小文字スネークケース**（`form_submit_success` ✓、`formSubmitSuccess` ✗）
- `event_` プレフィックスは不要
- GA4推奨イベント名と重複しないカスタム命名を選ぶ

### 「push時にミスると追跡不能になる」

- イベント名の **タイポ1文字でトリガーが反応しない**
- 対策:
  - **dataLayer仕様書**（Googleスプレッドシート等）で一元管理
  - 実装時は **コピペで書く**、手入力しない
  - プレビューモードで必ず確認する

---

## 6. 典型パターン（2026年の現場でよく使う）

### ページ読み込み時に共通情報をpush

```js
// HTMLの <head> 内、GTMスニペットよりも"前"にpush
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  page_type: 'product',
  page_category: 'shoes',
  user_id: 'U12345',      // ログイン時のみ
  membership_level: 'premium'
});
```

### フォーム送信成功時にpush

```js
document.querySelector('#contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  // 送信処理 (fetch) ...
  fetch('/api/contact', { method: 'POST', body: new FormData(this) })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.dataLayer.push({
          event: 'contact_form_submit',
          form_id: 'contact-form',
          form_type: 'inquiry'
        });
        // サンクスメッセージ表示
      }
    });
});
```

### クリック系（dataLayerを介さずClick変数を使ってもよい）

シンプルな計測なら **組み込みのクリック変数** で十分。dataLayerは「サーバーで決まる値」や「フォームの成否判定」など **ブラウザの状態を越える情報** で威力を発揮する。

---

## 7. dataLayer と GTM の境界線

### 開発者の仕事

- HTMLに **GTMスニペット** を設置
- **主要イベントで `dataLayer.push`** を仕込む
  - ページロード時の状態
  - フォーム送信の成否
  - ユーザーログイン状態
  - EC購入完了など
- **命名規約を守って** push する

### マーケター/アナリティクス担当の仕事

- GTMで **カスタムイベントトリガー** を作る
- **データレイヤー変数** を定義
- GA4/広告タグに値をマッピング
- プレビュー・公開

この境界線を **dataLayer仕様書** として最初に明文化しておくのが、揉めない運用のコツ。

---

## 8. 高度なトピック

### ネストされたオブジェクト

```js
dataLayer.push({
  event: 'add_to_cart',
  item: {
    id: 'SKU-01',
    name: '商品A',
    price: { amount: 3000, currency: 'JPY' }
  }
});
```

データレイヤー変数では **ドット記法** で取り出せる:
```
データレイヤーの変数名: item.price.amount
```

### 配列のpush（ECで必須）

```js
dataLayer.push({
  event: 'view_item_list',
  items: [
    { item_id: 'SKU-01', item_name: '商品A' },
    { item_id: 'SKU-02', item_name: '商品B' }
  ]
});
```

→ GA4拡張Eコマースでは **items配列** が必須。

### 過去のpushを参照する

dataLayer は配列なので、**後続のpushからも過去の値を参照可能**。

```js
// ページ読み込み時
dataLayer.push({ user_id: 'U12345' });

// その後のクリック時
dataLayer.push({ event: 'click_cta' });
// → このイベントでも user_id は参照可能
```

---

## 9. よくあるつまずき

### つまずき1: push するタイミングがGTM読み込みより前

```html
<head>
  <!-- ⚠️ GTMスニペットより前にpushすると消える -->
  <script>dataLayer.push({...});</script>
  <!-- GTM スニペット -->
</head>
```

**対策**: GTMスニペットより **先に** `window.dataLayer = window.dataLayer || [];` を初期化

実際、GTM公式推奨の書き順は:

```html
<head>
  <script>
    // dataLayer の初期化と初期値push（GTM スニペットより前でOK）
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      page_type: 'product',
      user_id: 'U12345'
    });
  </script>
  <!-- Google Tag Manager スニペット -->
  <script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
</head>
```

### つまずき2: データレイヤー変数の「バージョン」をv1にしてしまう

- 「バージョン: 1」は **ドット記法を解釈しない** レガシー版
- 新規は常に **v2** を選ぶ

### つまずき3: イベント名がキャメルケース・ハイフン入り

- `form-submit` や `FormSubmit` はGA4で **別イベント扱い** になってしまう
- 統一して `form_submit` に

### つまずき4: dataLayer を上書きしてしまう

```js
// ❌ 危険: 既存のpush履歴が消える
window.dataLayer = [{ event: 'init' }];

// ✅ 正しい
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ event: 'init' });
```

---

## 10. dataLayer 設計書のテンプレート（参考）

| イベント名 | 発火タイミング | 必須パラメータ | 任意パラメータ |
|-----------|--------------|--------------|--------------|
| `contact_form_submit` | 問い合わせフォーム送信成功時 | form_id | form_type, source_lp |
| `cta_click` | 主要CTAボタンクリック時 | button_name, button_position | - |
| `purchase` | 決済完了時 | transaction_id, value, currency | items[] |
| `sign_up` | 新規会員登録完了時 | user_id, membership_level | - |
| `scroll_75` | 75%スクロール到達時 | - | page_type |

---

## 🔗 次に読む

- [[07_プレビューモードとデバッグ]] — push した内容を確認する
- [[02_フォーム送信完了の計測]] — dataLayerの実戦パターン
- [[05_変数(Variables)の基礎]] — データレイヤー変数の詳細
