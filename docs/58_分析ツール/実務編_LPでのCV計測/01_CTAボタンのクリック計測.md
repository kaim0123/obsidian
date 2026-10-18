# CTAボタンのクリック計測

## 🎯 このページのゴール

- LPで **最も需要の高い「CTAボタンクリック」の計測** を自分で設定できる
- 3つの実装パターン（クラス指定 / data属性 / dataLayer）の **使い分け** を理解する
- 取得した値をGA4でCVとしてマークできる

---

## 1. 想定シナリオ

LPにこんなCTAボタンがあるとする:

```html
<!-- ヒーローエリアのCTA -->
<a href="#form" class="btn btn-primary hero-cta" data-cta-position="hero">
  お問い合わせはこちら
</a>

<!-- 料金セクションのCTA -->
<a href="#form" class="btn btn-primary pricing-cta" data-cta-position="pricing">
  無料相談する
</a>
```

これらのクリックを GA4 で `cta_click` として計測し、**押された位置（hero / pricing）** も識別できるようにする。

---

## 2. 実装パターンの選択肢

| パターン | 必要なHTML変更 | GTM設定難度 | おすすめ度 |
|---------|--------------|-----------|-----------|
| **A: class名で判定** | 無し | 低 | ⭐⭐⭐ |
| **B: data属性で判定** | 属性を1つ足す | 中 | ⭐⭐⭐⭐ |
| **C: dataLayer.push** | JSを書く | 高 | ⭐⭐ |

→ 初心者は **パターンA or B** からスタートするのが基本。

---

## 3. パターンA: class名で判定（HTML改修なし）

### Step1: 組み込み変数を有効化

```
変数 > 組み込み変数の設定 > 次をチェック:
  ☑ Click Element
  ☑ Click Classes
  ☑ Click ID
  ☑ Click Text
  ☑ Click URL
```

### Step2: トリガーを作成

```
トリガー > 新規
  タイプ: クリック - すべての要素
  このトリガーの発火場所: 一部のクリック
  条件: Click Classes  contains  "hero-cta"
```

→ `hero-cta` を含むクリックだけ拾う

### Step3: タグを作成

```
タグ > 新規
  タイプ: Google アナリティクス: GA4 イベント
  設定タグ: (先に作った Googleタグ)
  イベント名: cta_click
  パラメータ:
    button_name  = {{Click Text}}
    cta_position = hero
    page_path    = {{Page Path}}
  トリガー: (Step2で作ったトリガー)
```

### Step4: 他の位置のCTAも同様に

`pricing-cta` 用に別トリガー・別タグを作る。**タグを分けると `cta_position` を固定値で送れて楽**。

---

## 4. パターンB: data属性で判定（推奨）

クリック位置が増えると「class名が被る」問題が出るので、**data属性** を使うのがスマート。

### HTML側

```html
<a href="#form" class="btn" data-cta="hero-main">お問い合わせはこちら</a>
<a href="#form" class="btn" data-cta="pricing-lower">無料相談する</a>
<button class="btn" data-cta="faq-bottom">質問する</button>
```

### GTM側

#### 変数: data属性を取り出す

```
変数 > 新規
  タイプ: 自動イベント変数
  変数タイプ: 要素属性
  属性名: data-cta
  名前: AEV - Click data-cta
```

または **カスタムJavaScript** で:

```js
function() {
  var el = {{Click Element}};
  return el.getAttribute('data-cta') || '';
}
```

#### トリガー

```
タイプ: クリック - すべての要素
条件: AEV - Click data-cta  matches RegEx  .+
  (data-cta属性が何か値を持っていればOK)
```

#### タグ

```
タイプ: GA4 イベント
イベント名: cta_click
パラメータ:
  cta_name     = {{AEV - Click data-cta}}
  button_text  = {{Click Text}}
  page_path    = {{Page Path}}
```

### この方式のメリット

- **1つのトリガー・1つのタグで全CTAをカバー** できる
- 新しいCTAボタンを追加しても **GTM側を触らなくていい**（data-cta属性を付ければ自動計測）
- 運用拡張性が圧倒的に良い

---

## 5. パターンC: dataLayer.push（複雑な条件時）

動的生成・SPA・複数データ付与したい場合。

### HTML/JS側

```html
<a href="#form" class="btn" onclick="trackCTA('hero-main', 'お問い合わせ')">
  お問い合わせはこちら
</a>

<script>
function trackCTA(position, label) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'cta_click',
    cta_position: position,
    cta_label: label,
    timestamp: new Date().toISOString()
  });
}
</script>
```

### GTM側

#### データレイヤー変数

```
変数 > 新規
  タイプ: データレイヤー変数
  変数名: cta_position
  バージョン: 2
  名前: DLV - cta_position
```

同様に `DLV - cta_label` も作成

#### トリガー

```
タイプ: カスタム イベント
イベント名: cta_click
```

#### タグ

```
タイプ: GA4 イベント
イベント名: cta_click
パラメータ:
  cta_position = {{DLV - cta_position}}
  cta_label    = {{DLV - cta_label}}
```

---

## 6. プレビューで確認

1. GTMで **プレビュー** ボタンをクリック
2. 対象サイトで実際にボタンをクリック
3. Tag Assistantで:
   - **Click** イベントに期待のタグが **Fired** になっているか
   - **Variables** タブで `{{Click Classes}}` 等が期待値か
4. 別タブで GA4 → リアルタイム → イベント に `cta_click` が出るか確認

---

## 7. GA4でCVとしてマーク

計測自体は成功しても、GA4では **キーイベントとしてマークするまで** CV扱いになりません。

1. GA4 → 管理 → イベント
2. `cta_click` が一覧に出ているのを確認（発火から数時間〜1日）
3. **「キーイベントとしてマーク」をON**

### 補足: ボタン別にCVを分けたい場合

「CTAすべて」ではなく「ヒーローCTAだけCV扱い」にしたい:

GA4で **イベントを作成** 機能を使い、条件付きの派生イベントを作る:

```
管理 → イベント → 「イベントを作成」
新規イベント名: cta_click_hero
条件:
  event_name equals cta_click
  cta_position equals hero
```

→ この新イベントを **キーイベント化** すれば、ヒーローCTAだけCVになる

---

## 8. カスタムディメンションへの登録（レポートに列として出す）

送信したパラメータを **レポートで表示** するには、カスタムディメンションの登録が必要です。

```
GA4 → 管理 → カスタム定義 → カスタムディメンション → 新規
  ディメンション名: CTA位置
  スコープ: イベント
  説明: クリックされたCTAの設置位置
  イベント パラメータ: cta_position
```

登録から **24〜48時間後** にレポートで利用可能に。

---

## 9. 広告のCV連携

Google Ads・Meta広告等でも `cta_click` や `cta_click_hero` をCVとして使う場合:

### Google Ads

1. GA4でキーイベント化
2. Google Ads とアカウント連携
3. Google Ads → ツール → コンバージョン → **「Google アナリティクス 4(GA4) プロパティ」からインポート**
4. 対象のキーイベントを選択

### Meta広告

GTMで **Meta Pixel カスタムイベント** タグを作り、同じクリックトリガーで発火:

```
タグ: Meta Pixel - Lead (Custom Event)
カスタムイベント名: CTAClick
トリガー: (CTAクリックトリガー)
```

---

## 10. 事故を防ぐチェックリスト

- [ ] 「すべての要素クリック」で **誤発火** していないか（画像クリック・ヘッダーロゴクリックまで拾わないか）
- [ ] モバイルでの **タップ** もきちんと計測されるか（ブラウザ・OSをまたいで確認）
- [ ] ボタンが `<button>` で href を持たない場合、`onclick` で遷移しているJSの挙動を妨げていないか
- [ ] ブラウザの **中クリック** やキーボード操作でも発火するか確認（必要に応じてclick→auxclickもトリガー追加）
- [ ] 動的に追加されたボタン（JSで後からDOMに挿入）でも発火するか
  - GTMの「All Elements」トリガーは **document全体でイベント委任** するので基本OK

---

## 🔗 次に読む

- [[02_フォーム送信完了の計測]] — CTAの先のフォームCV
- [[05_キーイベント(コンバージョン)設定]] — CV化の詳細
- [[06_よくあるトラブルとデバッグ]]
