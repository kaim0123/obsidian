# GTMの導入手順

## 🎯 このページのゴール

- GTM のアカウント・コンテナを作成できるようになる
- コンテナスニペットを **正しい位置に設置** できる
- 最初のタグとして **GA4 設定タグ** を置き、計測を動かす

---

## 1. 手順の全体像

```
Step1. GTMアカウント＆コンテナ作成 (https://tagmanager.google.com)
   ↓
Step2. コンテナスニペットを取得
   ↓
Step3. サイトの <head> と <body> 直後にスニペット設置
   ↓
Step4. GA4 設定タグを作成（計測IDを指定）
   ↓
Step5. All Pages トリガーで発火するよう設定
   ↓
Step6. プレビューモードで発火を確認
   ↓
Step7. 「公開」して本番反映
```

---

## 2. Step1〜2: アカウント・コンテナ作成

### 作成手順

1. https://tagmanager.google.com にアクセス
2. 「アカウントを作成」をクリック
3. 入力:
   - **アカウント名**: 会社名（例: 株式会社サンプル）
   - **国**: 日本
   - **コンテナ名**: サイトドメイン（例: `example.com`）
   - **ターゲットプラットフォーム**: **ウェブ** を選択
4. 利用規約に同意
5. **コンテナID（GTM-XXXXXXX）** とスニペットが表示される

### コンテナIDとは

- 形式: `GTM-XXXXXXX`（7文字英数字）
- サイトごと・コンテナごとにユニーク
- ⚠️ GA4の計測IDとは別物。混同しないこと

---

## 3. Step3: スニペットの設置

GTMは **2つのスニペット** をHTMLに設置します。

### 1つ目: `<head>` の **できるだけ早い位置** に

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

### 2つ目: `<body>` 開始タグの **直後** に

```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### 設置のポイント

- **全ページ共通**のHTMLテンプレートに入れる（共通レイアウト・ヘッダーパーシャル等）
- `<head>` 内は **できるだけ上の方** に（後続タグよりも早く読ませるため）
- `<body>` の **最初** に `<noscript>` 版（JS無効ユーザー向けの保険）
- ⚠️ **既存のgtag.jsは削除** する（GTMと併用するとイベント二重送信になる）

### フレームワーク別の設置例

#### Next.js（App Router, `app/layout.tsx`）

```tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-XXXXXXX');`}
        </Script>
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
            height="0" width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
      </body>
    </html>
  )
}
```

#### WordPress

- プラグイン `Site Kit by Google` または `GTM4WP` を使う
- 手動ならテーマの `header.php` と `footer.php` を編集

---

## 4. Step4〜5: GA4 設定タグを作成

### 4-1. 新規タグ作成

1. GTM の左メニュー → **タグ** → 右上「**新規**」
2. タグに名前を付ける（例: `GA4 - Config - All Pages`）
3. 「**タグの設定**」エリアをクリック → タグタイプから **Google タグ** を選択
   - 2024年以降、以前の「GA4 設定タグ」は **「Google タグ」** に統合された

### 4-2. 計測IDを入力

- **タグID**: GA4の計測ID（`G-XXXXXXXXXX`）を貼り付け

### 4-3. トリガーを設定

- 「**トリガー**」エリアをクリック
- 組み込みトリガー **"All Pages"** を選択
- これで全ページで発火する

### 4-4. 保存

画面右上の「保存」

---

## 5. Step6: プレビューモードで確認

右上の **「プレビュー」** ボタンから Tag Assistant を開きます。

### 手順

1. 「プレビュー」をクリック
2. 新しいタブで Tag Assistant が開く
3. 対象サイトのURLを入力 → 「Connect」
4. 別タブで自分のサイトが開き、Tag Assistant側で発火状況が見える
5. 「Tags Fired」に **`GA4 - Config - All Pages`** が出ていれば成功

### 同時に確認すること

- GA4の **リアルタイムレポート** にPVが記録されているか
- コンソールエラーが出ていないか（F12でDevTools）

> 💡 **Tag Assistant で反映されない場合**: キャッシュが残っていることが多い。シークレットウィンドウで再アクセス。

---

## 6. Step7: 公開（本番反映）

プレビューで問題なければ公開します。

1. 右上の **「公開」** をクリック
2. **バージョン名**（例: `v1.0 - GA4初期設定`）と **説明** を入力
3. 「公開」を実行
4. バージョン履歴に記録される（後からロールバック可能）

---

## 7. ⚠️ よくあるつまずき

### スニペット設置を `<head>` の中に入れ忘れ

- `<body>` に両方入れてしまうケース。**1つ目は必ず `<head>` 内**
- 設置位置が後ろすぎると、計測タイミングがずれる

### コンテナIDを本番・ステージングで使い分けない

- 同じコンテナで別環境を計測すると、データが混ざる
- 対策: **環境別にコンテナを分ける** or **Lookup Table変数** で計測ID切替

### GTMとgtag.jsを併用

- PV・イベントが2倍になる
- 設置前のHTMLで `gtag('config', ...)` を検索して削除すること

### 公開忘れ

- プレビューでは動くのに本番で動かない → **公開していないだけ**
- GTMでの変更は **公開しない限り本番に反映されない**

### 管理者権限の設計

- 公開権限（Publish）を全員に付けると事故のもと
- 運用者: 編集のみ、責任者: 公開権限、という分離が安全

---

## 8. GA4設定タグを作った後の最初のチェックリスト

- [ ] HTMLからGTMスニペット以外のGAコードを **削除**
- [ ] GA4のリアルタイムレポートで **自分のPV** が見える
- [ ] GTM プレビューで `GA4 - Config - All Pages` が **Tags Fired** に出る
- [ ] 別ブラウザ/端末でアクセスしても **計測される**
- [ ] 公開バージョンに **バージョン名と説明** が残っている

---

## 🔗 次に読む

- [[03_タグ(Tags)の基礎]]
- [[04_トリガー(Triggers)の基礎]]
- [[07_プレビューモードとデバッグ]]
