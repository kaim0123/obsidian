# タグ（Tags）の基礎

## 🎯 このページのゴール

- GTMの「タグ」が **何を指すか** を理解する
- よく使う **タグタイプ** を把握する
- GA4連携で使う **「Googleタグ」** と **「GA4イベント」** の違いを正確に区別できるようになる

---

## 1. タグとは

**「何を送るか」を定義するコード片**。GTMから発火させる実体。

- 例: GA4 にイベントを送るタグ / Meta Pixel にPVを送るタグ / カスタムHTMLを埋め込むタグ
- タグ自体は **発火条件（トリガー）** と組み合わせて初めて動く

```
[トリガー: ボタンクリック]
     ↓ これが発生したら
[タグ: GA4にcta_clickイベント送信]
     ↓
[GA4のサーバー]
```

---

## 2. タグの主要な種類（2026年時点）

GTMのタグ一覧は **ギャラリー形式** で選択します。主要なものは以下:

### Google系（公式テンプレート）

| タグ名 | 用途 |
|-------|------|
| **Google タグ** | 基本のGA4/GA/Ads用タグ。計測ID1つで複数サービスへ統合配信 |
| **Google アナリティクス: GA4 イベント** | 特定のイベントをGA4に送る |
| **Google 広告 コンバージョン トラッキング** | 広告CVタグ |
| **Google 広告 リマーケティング** | リマーケ用タグ |
| **Floodlight** | Google Marketing Platform向け |

### サードパーティ公式テンプレート

- **Meta Pixel**（Facebook/Instagram）
- **LinkedIn Insight Tag**
- **TikTok Pixel**
- **LINE Tag**
- **Microsoft Advertising UET Tag**
- **X (Twitter) Pixel**
- **Microsoft Clarity**
- **Hotjar**

### カスタム・その他

| タグ名 | 用途 |
|-------|------|
| **カスタムHTML** | 独自のHTML/JSスニペットを埋め込む（最終手段） |
| **カスタム画像** | 1x1ピクセルのトラッキング画像 |
| **コンバージョンリンカー** | 広告クリックID（gclid等）をCookieに保存 |

---

## 3. 最もよく使う2つのタグ（必修）

### ① Google タグ

- 旧「GA4 設定タグ」の後継。2024年以降の推奨
- **計測ID（`G-XXXXXXXXXX`）を渡すだけ** で、PVの自動計測が始まる
- **1つのサイトに原則1つだけ** 設置（複数置くと二重計測）

**設定項目の概要**:

```
タグID: G-XXXXXXXXXX
構成パラメータ (Configuration settings):
  ├ send_page_view: true   ← 自動でPVを送るか
  └ cookie_domain: auto    ← ほぼ "auto" のまま

イベント パラメータ (Event settings):
  └ すべてのイベントに共通で付けたいパラメータ
    例) environment = production

ユーザー プロパティ:
  └ 全ユーザーに付けたい属性 (ログイン後なら membership_level 等)

詳細設定:
  └ Consent Settings: Consent Modeとの連携
```

### ② GA4 イベント タグ

- **特定のイベント**（cta_click / form_submit 等）を送る
- Googleタグが先に発火している前提で使う

**設定例**:

```
設定タグ: (なし) もしくは先に作ったGoogleタグを選択
イベント名: cta_click

イベント パラメータ:
  button_name    = {{Click Text}}
  button_class   = {{Click Classes}}
  page_location  = {{Page Hostname}}{{Page Path}}
```

---

## 4. タグを作る実際の流れ

### 例: 「PDFダウンロードボタンのクリックをGA4に送る」

```
【Step1】 トリガー作成
  種類: クリック (すべての要素 or 一部の要素)
  条件: Click URL が .pdf で終わる

【Step2】 タグ作成
  種類: GA4 イベント
  イベント名: file_download
  パラメータ:
    file_url       = {{Click URL}}
    file_extension = pdf

【Step3】 上記タグに Step1 のトリガーを紐付け

【Step4】 プレビューで確認 → 公開
```

---

## 5. タグ設定の詳細オプション

### 配信の優先順位（Tag Sequencing）

タグ発火の前後関係を制御できます:

- **このタグの前に別のタグを発火**（例: 先にコンバージョンリンカー）
- **このタグの後に別のタグを発火**（例: 完了後にMeta Pixel）

### タグの発火オプション

| オプション | 意味 |
|-----------|------|
| **Once per page** | ページごとに1回だけ発火 |
| **Once per event** | 1イベントにつき1回 |
| **Unlimited** | 無制限発火（通常これ） |

### Consent Settings（同意設定）

Consent Mode v2 との連携で、このタグを発火させるのに **必要な同意カテゴリ** を指定:

| カテゴリ | 意味 |
|---------|------|
| `analytics_storage` | 分析Cookieの保存 |
| `ad_storage` | 広告Cookieの保存 |
| `ad_user_data` | 広告サービスへのデータ送信 |
| `ad_personalization` | パーソナライズ広告 |

> GA4タグなら `analytics_storage`、広告タグなら `ad_storage + ad_user_data` を指定するのが定石

---

## 6. タグの命名規則（運用のコツ）

数が増えると管理が大変になるので、**最初から命名ルール** を決めます。

### 推奨フォーマット

```
{ツール} - {目的} - {トリガー条件}

例:
GA4 - Config - All Pages
GA4 - Event - cta_click
GA4 - Event - form_submit
Meta Pixel - PageView - All Pages
Meta Pixel - Lead - Thanks Page
Google Ads - Conversion - Form Submit
```

### フォルダ分け

GTMにはタグ/トリガー/変数を入れる **フォルダ機能** があります。

- `GA4/` / `Meta/` / `Google Ads/` / `LINE/` などで整理
- 10タグを超えたらフォルダ必須

> 📘 より詳細な命名規則・バージョン管理・アンチパターンは [[08_命名規則_運用ルール]] にまとめています。

---

## 7. ⚠️ カスタムHTMLタグの注意点

「どうしても既存テンプレートで対応できない」時に使う最終手段。

```html
<script>
  // 任意の独自JS
  console.log('custom tag fired');
</script>
```

### リスクと対策

- **書き方次第でサイト全体が壊れる**（グローバル汚染・エラー）
- **Consent Modeの対象外**（手動で同意チェックを入れる必要あり）
- **CSP（Content Security Policy）** に引っかかる場合がある

→ まずは **公式テンプレートで実現できないか** を確認してから使うこと

---

## 8. 2026年の新機能

- **AIベースのタグ推奨**: サイトの動きを分析して「こういうタグを作るべき」と提案
- **自動エラー検出**: 壊れたタグや計測漏れを検知
- **サーバーサイド対応テンプレート** の拡充: GA4, Ads, Facebook, TikTok などがサーバーサイドでも動く

---

## 🔗 次に読む

- [[04_トリガー(Triggers)の基礎]]
- [[05_変数(Variables)の基礎]]
- [[01_CTAボタンのクリック計測]] — 実際のタグ例
