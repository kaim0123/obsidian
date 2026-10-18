# 変数（Variables）の基礎

## 🎯 このページのゴール

- 変数が「**動的な値を取り出す仕組み**」であることを理解する
- **組み込み変数** と **ユーザー定義変数** の違いを知る
- よく使う変数タイプを覚え、**`{{変数名}}` 記法** で参照できるようになる

---

## 1. 変数とは

**実行時にその都度中身が変わる値を、GTM内で名前付きで扱う仕組み**。

### 2つの使いどころ

1. **トリガーの条件判定** で使う
   - 例: `Click URL contains ".pdf"` → `Click URL` は変数
2. **タグに渡すパラメータ** として使う
   - 例: `button_name = {{Click Text}}` → クリックされた要素のテキストを送る

### 変数の参照記法

```
{{変数名}}
```

この二重中括弧で、GTMの設定画面のどこでも変数を展開できます。

---

## 2. 組み込み変数（Built-in Variables）

GTMが最初から提供する定番変数。**使う前に有効化が必要**。

### 有効化の手順

```
変数 > 組み込み変数の設定 > 必要な変数にチェック
```

### 主要な組み込み変数

#### ページ関連

| 変数 | 意味 |
|------|------|
| `{{Page URL}}` | 完全なURL |
| `{{Page Hostname}}` | ホスト名（例: `example.com`） |
| `{{Page Path}}` | パス部分（例: `/contact`） |
| `{{Page Title}}` | `<title>` の中身 |
| `{{Referrer}}` | 直前のページURL |

#### クリック関連

| 変数 | 意味 |
|------|------|
| `{{Click Element}}` | クリックされた要素のDOMノード |
| `{{Click Classes}}` | class属性（半角スペース区切り） |
| `{{Click ID}}` | id属性 |
| `{{Click Target}}` | target属性（`_blank`等） |
| `{{Click URL}}` | href属性（リンクの場合） |
| `{{Click Text}}` | 要素内のテキスト |

**使うならどれがおすすめ？（実務の優先度イメージ）**

- **まず検討**: `{{Click URL}}` — リンク計測の中心。遷移先が取れるので、内部／外部・特定LP・ファイルDLの切り分けに向く（`リンクのみ` トリガーと相性が良い）。
- **識別子として強い**: `{{Click ID}}` — 開発が安定した `id` を付けているなら、トリガー条件がシンプルで壊れにくい（無い要素が多いサイトでは使えない）。
- **ラベル用途**: `{{Click Text}}` — レポート上わかりやすいが、同一文言の複数リンク・改行・アイコンだけのボタンなどでブレやすい。補助ディメンション扱いが無難。
- **CSSに依存**: `{{Click Classes}}` — 手早く書ける反面、デザイン改修でクラス名が変わると条件が一斉に死ぬ。長期運用なら `id` や `data-*` 設計の方が安全なことが多い。
- **たまに必要**: `{{Click Target}}` — 別タブ（`_blank`）だけ拾いたい等、開き方の区別が要るとき。
- **上級・複合条件**: `{{Click Element}}` — そのままでは使いにくく、**カスタムJavaScript変数**や「クリック要素」のマッチングと組み合わせて、DOM構造に依存する厳密な判定をするとき。

> 💡 次の節「**クリック系変数を詳しく**」で、1つずつ具体例・使いどころ・落とし穴を深掘りします（この6変数はGTM実務で **最頻出**）。

---

## 📌 クリック系変数を詳しく

クリック計測のほとんどは、この6変数で組み立てます。
**"どんなHTMLなら何が返るか"** を具体例で理解しておくと、トリガー条件の書き間違いが激減します。

### 前提: クリック系変数は裏で何をしているか

クリックトリガー（`クリック - すべての要素` または `リンクのみ`）が発火すると、
GTMは内部的に **dataLayer に `gtm.element*` というキー** を書き込み、
組み込み変数はそれを読むだけの仕組みになっています:

| 変数 | 裏のdataLayerキー |
|------|------------------|
| `{{Click Element}}` | `gtm.element` |
| `{{Click Classes}}` | `gtm.elementClasses` |
| `{{Click ID}}` | `gtm.elementId` |
| `{{Click Target}}` | `gtm.elementTarget` |
| `{{Click URL}}` | `gtm.elementUrl` |
| `{{Click Text}}` | `gtm.elementText` |

→ だから **「クリックトリガーを1つでも作っていないと、これらの変数は全部空（undefined）」** になります。まずは `クリック - すべての要素` のトリガーを1つ有効化するのが必須条件。

---

### ① `{{Click Element}}` — クリックされた要素そのもの（DOMオブジェクト）

**他の5変数が"文字列"を返すのに対し、これだけ "DOMノードそのもの" を返す** 特別な存在。

#### HTML例

```html
<button class="btn" id="hero-cta" data-position="top">お問い合わせ</button>
```

この `<button>` がクリックされると、`{{Click Element}}` は **このHTMLElement オブジェクト** を返します。

#### 使いどころ

1. **HTMLの任意の属性を取り出す**（特に `data-*` カスタム属性）

   ```js
   // カスタムJS変数
   function() {
     return {{Click Element}}.getAttribute('data-position') || '';
   }
   ```

2. **CSSセレクタで「一致するか」判定する**（超強力・後述）

   ```
   トリガー条件:
     Click Element  matches CSS selector  .cta[data-position="hero"]
   ```

3. **親要素をたどる**（クリックされたのが子要素でも、親のボタンとして扱う）

   ```js
   function() {
     var el = {{Click Element}};
     var btn = el.closest('button, a');
     return btn ? btn.textContent.trim() : '';
   }
   ```

#### ⚠️ 有効化の落とし穴

- `{{Click Element}}` は **デフォルト無効**。`変数 > 組み込み変数の設定 > Click Element` にチェックを入れる
- 有効化していないとカスタムJSで参照しても `undefined` になる

---

### ② `{{Click Classes}}` — class属性の値（文字列）

#### HTML例

```html
<button class="btn btn-primary hero-cta large">送信</button>
```

`{{Click Classes}}` は **`"btn btn-primary hero-cta large"`**（半角スペース区切りの1つの文字列）を返します。

#### 使いどころ

- **特定のクラスを含むボタンだけ計測したい** 時の定番
  ```
  トリガー条件: Click Classes  contains  "hero-cta"
  ```
- class名で「CTAの位置」や「種類」を区別している場合に一番早い

#### ⚠️ 落とし穴

**1. `equals`を使ってはいけない**

```
❌ Click Classes  equals  "hero-cta"
```
→ 実際は `"btn btn-primary hero-cta large"` なので **一致せず、永遠に発火しない**。

```
✅ Click Classes  contains  "hero-cta"
```

**2. 他のclass名と部分一致してしまう事故**

```
❌ Click Classes  contains  "btn"
```
→ `btn-primary` / `btn-danger` / `header-btn` 等、全部のbtn系に反応

```
✅ Click Classes  matches RegEx  (^|\s)hero-cta(\s|$)
```
→ **単独のclass名** として一致するものだけ拾う（前後が空白または文字列境界）

**3. 空白文字の表記ゆれ**

HTMLテンプレートで `class="btn    hero-cta"` のように連続スペースが入る場合、`equals` では確実に外す。

**4. DOMの動的変更に弱い**

Reactなどで class名がクリック直後に書き換わるケース → クリック時点のclassを拾うので通常は問題ないが、デバッグ時に注意。

---

### ③ `{{Click ID}}` — id属性の値

#### HTML例

```html
<button id="submit-btn" class="btn">送信</button>
```

`{{Click ID}}` は **`"submit-btn"`** を返します。

#### 使いどころ

- **id属性が付いている要素** を厳密に特定したい
  ```
  トリガー条件: Click ID  equals  "submit-btn"
  ```
- 1ページに1つしかない要素に最適（idはユニークな前提）

#### ⚠️ 落とし穴

- **多くのCTAボタンには id が付いていない**（デザイナーはclassを使うことが多い）
- **サイト全体で命名規則が統一されていない** ことが多く、運用コストが高い
- id が無ければ `{{Click ID}}` は **空文字列** を返す（`undefined` ではなく `""`）

**実務での使用頻度**: Classesに比べて低い。**主キーになる id がある場合** のみ使う。

---

### ④ `{{Click Target}}` — target属性の値

#### HTML例

```html
<a href="https://example.com" target="_blank">別タブで開く</a>
<a href="/about">同タブで開く</a>
```

- 1行目クリック: `{{Click Target}}` は **`"_blank"`**
- 2行目クリック: **空文字列** （target属性なし）

#### 使いどころ

- **新しいタブで開くリンクだけ計測する**
  ```
  トリガー条件: Click Target  equals  "_blank"
  ```
- **iframe内のリンククリック**（`target="myframe"` 等）を拾う
- 稀に `target="_self"` / `"_parent"` / `"_top"` で分岐

#### ⚠️ 落とし穴

- **大半のサイトでは使用頻度が低い**。他の5変数に比べて出番は少ない
- JSで動的に `target` を付けている場合、タイミングによっては拾えないことも

---

### ⑤ `{{Click URL}}` — リンクの遷移先URL（href属性）

#### HTML例

```html
<a href="/contact">お問い合わせ</a>
<a href="https://example.com/blog/post-1">記事</a>
<a href="tel:0312345678">電話する</a>
<a href="mailto:info@example.com">メール</a>
<a href="/files/brochure.pdf">資料DL</a>
```

それぞれのクリックで、`{{Click URL}}` は:
- `"https://自サイト.com/contact"` (**絶対URL**に展開される)
- `"https://example.com/blog/post-1"`
- `"tel:0312345678"`
- `"mailto:info@example.com"`
- `"https://自サイト.com/files/brochure.pdf"`

#### 使いどころ

- **外部リンク判定**
  ```
  Click URL  matches RegEx  ^https?://(?!(www\.)?example\.com)
  ```
- **ファイルダウンロード判定**
  ```
  Click URL  matches RegEx  \.(pdf|docx?|xlsx?|zip)(\?|$)
  ```
- **電話・メールリンク**
  ```
  Click URL  starts with  "tel:"
  Click URL  starts with  "mailto:"
  ```
- **特定ページへのリンク**
  ```
  Click URL  contains  "/contact"
  ```

#### ⚠️ 落とし穴

**1. `<button>` や `<div>` のクリックでは空になる**

- `{{Click URL}}` は **`<a>` のhref専用**。
- button要素のクリックは `Click URL` が空 → 条件式で `contains "/"` のようにAND指定すると永遠に発火しない

**2. 相対パスが絶対URLに変換される**

- HTMLに `href="/contact"` と書いていても、`{{Click URL}}` は **`https://自サイト.com/contact`** になる
- → `starts with "/contact"` は使えない。`contains "/contact"` を使う

**3. `クリック - リンクのみ` トリガーとセットで使う**

- `クリック - すべての要素` トリガーでも値は取れるが、**aタグ以外でもトリガーが発火** する点に注意
- 外部リンク計測は **`クリック - リンクのみ`** のほうが無駄発火が無く効率的

---

### ⑥ `{{Click Text}}` — クリックされた要素の内部テキスト

#### HTML例

```html
<button class="btn">お問い合わせ</button>
<a href="/about"><span class="icon">📧</span> 会社情報</a>
```

- 1つ目: `{{Click Text}}` は **`"お問い合わせ"`**
- 2つ目: **`"📧 会社情報"`**（子要素のテキストも連結される・前後の空白は除去）

#### 使いどころ

- **GA4にボタンラベルを送って分析軸にする**
  ```
  パラメータ: button_text = {{Click Text}}
  ```
- **同じclassの複数ボタンを、表示テキストで切り分ける**
  ```
  Click Text  equals  "資料をダウンロード"
  ```

#### ⚠️ 落とし穴

**1. テキストの表記ゆれに弱い**

`equals "お問い合わせ"` だと、`"お問い合わせ "`（末尾スペース）や `"お問合せ"`（送り仮名違い）にマッチしない。

**2. 画像のみのボタンは空になる**

```html
<button><img src="cta.png" alt="お問い合わせ"></button>
```
→ `{{Click Text}}` は空。**img要素の `alt` 属性** を取るにはカスタムJSが必要:

```js
function() {
  var el = {{Click Element}};
  var img = el.querySelector('img');
  return (el.textContent.trim() || (img && img.alt) || '');
}
```

**3. A/B テストで表示テキストが変わると計測が途切れる**

- 「お問い合わせ」→「無料相談する」へABテストで変更 → テキスト条件のトリガーが発火しなくなる
- 対策: テキストではなく **class名や data属性** でトリガーを組む

**4. 子要素を持つ場合、テキストが連結される**

```html
<a href="/pricing">
  <span class="label">料金</span>
  <span class="arrow">→</span>
</a>
```
→ `{{Click Text}}` は `"料金 →"`

---

### 🎯 どの変数を使うか? 決定ガイド

| やりたいこと | 第一選択 |
|------------|--------|
| 特定のクラスが付いたボタン | `{{Click Classes}}` + `contains` |
| idがユニークなボタン（例: 送信ボタン） | `{{Click ID}}` + `equals` |
| リンク先URLで判定（外部・tel・mailto・ファイル） | `{{Click URL}}` |
| 別タブリンクだけ拾う | `{{Click Target}}` |
| ボタンの表示名をGA4に送る | `{{Click Text}}`（パラメータ用） |
| data-* 属性で判定 | `{{Click Element}}` + カスタムJS |
| 複雑な条件（親要素まで遡る、CSS組み合わせ） | `{{Click Element}}` + `matches CSS selector` |

---

### 🔥 最強の組み合わせ: `Click Element` + `matches CSS selector`

トリガー条件の演算子で **`matches CSS selector`** を選ぶと、`{{Click Element}}` に対してCSSセレクタが使えます。

```
条件: Click Element  matches CSS selector  a.cta-btn[data-position="hero"]
```

これ一発で:
- a要素で
- class に `cta-btn` を持ち
- data-position が `"hero"` である

のすべてを満たすクリックだけ拾えます。

#### さらに: `:is()` / `:not()` なども使える

```
条件: Click Element  matches CSS selector  :is(.hero-cta, .pricing-cta):not(.disabled)
```

→ `hero-cta` または `pricing-cta` のクラスを持ち、かつ `disabled` ではない要素だけ。

#### 子要素クリックを親として扱うには

ユーザーがボタン内の `<span>` や `<img>` をクリックしても、親のボタンを計測対象にしたい時:

```
条件: Click Element  matches CSS selector  .cta-btn, .cta-btn *
```

→ `.cta-btn` 自身、または `.cta-btn` の子孫要素なら全部マッチ。

または カスタムJSで:

```js
function() {
  var target = {{Click Element}}.closest('.cta-btn');
  return target ? target.getAttribute('data-position') : '';
}
```

---

### 📸 プレビューモードで変数値を確認する

本当に欲しい値が取れているかは、**必ず Tag Assistant で確認** します。

1. GTMで「プレビュー」起動
2. サイトで対象ボタンをクリック
3. 左側の **Click** イベントを選択
4. 右側の **Variables** タブを開く
5. `Click Classes` / `Click URL` / `Click Text` などの現在値を目視確認

→ ここで期待値と違えば、**HTMLかGTM設定のどこかがズレている** とすぐ分かります。

---

### 🎬 実戦パターン集

#### パターン1: LP のヒーローCTA を class で拾う

```html
<a href="#form" class="btn btn-primary hero-cta">お問い合わせ</a>
```

```
トリガー:
  クリック - すべての要素
  条件: Click Classes contains "hero-cta"

タグ (GA4 イベント):
  event: cta_click
  parameters:
    button_text   = {{Click Text}}
    button_class  = {{Click Classes}}
    link_url      = {{Click URL}}
    page_path     = {{Page Path}}
```

#### パターン2: data-* 属性でCTA位置を識別

```html
<a href="#form" class="btn" data-cta="hero-main">お問い合わせ</a>
<a href="#form" class="btn" data-cta="pricing-lower">無料相談</a>
```

```
カスタムJS変数 (JS - data-cta):
  function() {
    return {{Click Element}}.getAttribute('data-cta') || '';
  }

トリガー:
  条件: JS - data-cta  matches RegEx  .+

タグ:
  event: cta_click
  parameters:
    cta_position = {{JS - data-cta}}
    button_text  = {{Click Text}}
```

→ 将来CTAを追加しても、HTMLに `data-cta="xxx"` を付けるだけで **GTM無改修で計測継続**。

#### パターン3: PDFダウンロードを URL で拾う

```
トリガー:
  クリック - リンクのみ
  条件: Click URL matches RegEx  \.pdf(\?|$)

タグ:
  event: file_download
  parameters:
    file_url       = {{Click URL}}
    file_extension = pdf
    file_name      = (カスタムJSでURLからファイル名抽出)
```

#### パターン4: 子要素クリックを親として扱う

```html
<a href="/pricing" class="pricing-card">
  <h3>スタンダード</h3>
  <span class="price">¥10,000</span>
  <button>選択する</button>
</a>
```

`<h3>` や `<button>` をクリックしても、**親の `.pricing-card` 全体** を計測したい:

```
条件: Click Element  matches CSS selector  .pricing-card, .pricing-card *
```

タグには:
```js
// カスタムJS変数で親の href を取得
function() {
  var card = {{Click Element}}.closest('.pricing-card');
  return card ? card.getAttribute('href') : '';
}
```

---

### ✅ クリック変数の運用チェックリスト

- [ ] `Click Element` / `Click Classes` / `Click ID` / `Click Target` / `Click URL` / `Click Text` をすべて **有効化** した
- [ ] 少なくとも1つの **クリックトリガー** を有効にした（そうしないと変数は空）
- [ ] `equals` ではなく `contains` / `matches RegEx` を使い分けている
- [ ] プレビューモードで **Variables タブの実値** を確認した
- [ ] ボタン内の子要素クリック時の挙動を実機で確認した
- [ ] A/Bテストや多言語対応で **テキストが変わっても壊れない** 条件式にした（class/data属性優先）

---

#### フォーム関連

| 変数 | 意味 |
|------|------|
| `{{Form Element}}` | 送信されたフォーム要素 |
| `{{Form Classes}}` | フォームのclass属性 |
| `{{Form ID}}` | フォームのid |
| `{{Form URL}}` | formタグのaction属性 |
| `{{Form Text}}` | フォーム内のテキスト |

#### 動画・スクロール

| 変数 | 意味 |
|------|------|
| `{{Video Title}}` | YouTube動画のタイトル |
| `{{Video Duration}}` | 動画の長さ |
| `{{Scroll Depth Threshold}}` | スクロール発火時の% |

---

## 3. ユーザー定義変数（Custom Variables）

組み込みで足りない値を **自分で定義** するタイプ。

### よく使うカスタム変数タイプ

#### ① データレイヤー変数（Data Layer Variable）

dataLayer にpushされた値を取り出す。**最重要・最頻出**。

```
変数タイプ: データレイヤー変数
データレイヤーの変数名: order_id
バージョン: 2 (推奨)
```

→ これで `{{DLV - order_id}}` のような名前で参照可能

```js
// 開発側の実装例
dataLayer.push({
  event: 'purchase',
  order_id: 'A12345',
  revenue: 5000
});
```

#### ② 定数（Constant）

固定値を1箇所にまとめる。計測IDの変更を一度で済ませたい時に便利。

```
変数タイプ: 定数
値: G-ABC12D3E4F
```

→ GA4タグのID指定で `{{Const - GA4 ID}}` と書けば、変更時に **ここ1箇所を直すだけ**

#### ③ Lookup Table（ルックアップテーブル）

入力値に応じて出力値を切り替える。

```
変数タイプ: ルックアップテーブル
入力変数: {{Page Hostname}}
  example.com     → G-PROD123
  stg.example.com → G-STG456
  localhost       → G-DEV789
```

→ 本番・ステージング・開発で **計測IDを自動切替** できる

#### ④ Regex Table（正規表現テーブル）

Lookupの正規表現版。URLパターンでの分岐に強い。

#### ⑤ カスタムJavaScript

1つの関数を書き、その戻り値を変数化する。

```js
function() {
  var h = window.location.hostname;
  return h.replace(/^www\./, '');
}
```

#### ⑥ DOM要素

ページ内の特定DOM要素の属性やテキストを取得。

```
選択方法: CSSセレクタ
要素セレクタ: .user-name
属性: (なし = テキスト取得)
```

#### ⑦ JavaScript変数

`window.myVar` のようなグローバル変数を読み取る。

---

## 4. 変数の命名規則

組み込み変数と区別しやすくするために **プレフィックス** を付けるのが定石。

| プレフィックス | 意味 |
|--------------|------|
| `DLV - xxx` | Data Layer Variable |
| `Const - xxx` | 定数 |
| `LT - xxx` | Lookup Table |
| `JS - xxx` | カスタムJavaScript |
| `DOM - xxx` | DOM要素 |

### 例

```
DLV - order_id
DLV - user_id
DLV - revenue
Const - GA4 Measurement ID
LT - GA4 ID by Environment
JS - Clean Hostname
DOM - User Name
```

> 📘 タグ・トリガー・GA4イベント名も含めた完全な命名ガイドは [[08_命名規則_運用ルール]] にまとめています。

---

## 5. 変数を使った実践例

### 例1: クリックされたボタンのテキストをGA4に送る

```
タグ: GA4 イベント
イベント名: cta_click
パラメータ:
  button_text  = {{Click Text}}
  button_class = {{Click Classes}}
  page_url     = {{Page URL}}
```

### 例2: フォームIDで分岐してCVを分ける

```
トリガー1: Form ID equals "contact-form"  → contact_form_submit として送信
トリガー2: Form ID equals "resource-dl"   → download_form_submit として送信
```

### 例3: 環境別に計測IDを切替

```
LT - GA4 ID by Environment:
  example.com  → G-PRODXXXXX
  stg.example.com → G-STGXXXXX

Google タグ:
  タグID: {{LT - GA4 ID by Environment}}
```

---

## 6. 変数の評価タイミング

**重要な罠**: 変数はトリガーが発火する瞬間に評価されます。

- **dataLayerのpushより早いタイミングで発火** するトリガーでは、欲しい値が取れない
- 例: Page View時点で未定義のDLVはundefinedになる

### 解決策

- 値を確実にpushしてから参照する（DOM Ready / Window Loaded トリガーを使う）
- またはカスタムイベントトリガーで **pushの瞬間** に発火させる

---

## 7. デバッグで変数の中身を確認する

プレビューモード（Tag Assistant）で確認できます。

```
画面左下の各イベント行をクリック
  → Variables タブ
  → 変数名と現在値が一覧表示
```

**トラブル時の基本は「その瞬間の変数値を見る」** こと。

---

## 8. 2026年の新機能: 変数の自動提案

GTMの新機能で、サイトのクリック/フォーム/dataLayerを自動解析し、
**「この変数を定義しておくと便利ですよ」** と提案してくれるようになりました。

- UI上の「変数の提案」バナー から採用可
- ML（機械学習）ベース

---

## 🔗 次に読む

- [[06_データレイヤー(dataLayer)]] — 変数で取り出す値のソース
- [[07_プレビューモードとデバッグ]] — 変数の中身を確認する
- [[01_CTAボタンのクリック計測]] — 変数を使った実戦例
