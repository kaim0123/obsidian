# CDN キャッシュ戦略

## はじめに

**CDN（Content Delivery Network）** は、コンテンツを **世界中の多数のサーバ（エッジ）** にキャッシュ・配信する基盤です。静的アセット（画像・JS・CSS）を速く届けるだけでなく、**動的ページの高速化・DDoS 対策・オリジン保護** まで担える現代 Web の必需品です。

本記事では、CDN を **キャッシュ層として設計する** ための考え方を整理します。

---

## CDN の役割

```
[ユーザー] ←── 数ms〜数十ms（物理的に近い）──→ [CDNエッジ]
                                                    ↓ キャッシュミス時だけ
                                                [オリジン(Web server)]
```

- **レイテンシ削減**（物理距離短縮）
- **オリジン保護**（エッジで応答、オリジンは叩かれない）
- **帯域コスト削減**（エッジからユーザーに近距離配信）
- **DDoS 吸収**
- **SSL/TLS オフロード**

---

## 代表的な CDN

| 製品 | 特徴 |
|------|------|
| **Cloudflare** | 無料プランあり、DNS込、Workers（エッジ実行） |
| **AWS CloudFront** | AWS統合、Lambda@Edge |
| **Fastly** | VCL による強力な制御、パージ高速（150ms） |
| **Akamai** | 最古参、大企業採用、機能豊富 |
| **Vercel Edge Network** | Next.js / Vercel 特化 |
| **Google Cloud CDN** | GCP統合 |

---

## CDN で制御できる主な HTTP ヘッダ

### Cache-Control

キャッシュの寿命と共有範囲を指定:

```http
Cache-Control: public, max-age=3600, s-maxage=86400
```

| ディレクティブ | 意味 |
|---------------|------|
| `public` | 誰でもキャッシュ可（CDN も OK） |
| `private` | ブラウザのみ、CDN は不可 |
| `no-store` | 全くキャッシュしない |
| `no-cache` | キャッシュするが、毎回サーバ確認 |
| `max-age=N` | ブラウザのキャッシュ秒数 |
| `s-maxage=N` | CDN のキャッシュ秒数（`max-age` を上書き） |
| `immutable` | 変わらないのでリバリデート不要 |
| `must-revalidate` | 期限切れでは必ず再検証 |
| `stale-while-revalidate=N` | N秒間、古い値を返しつつ裏で更新 |
| `stale-if-error=N` | N秒間、オリジンエラー時は古い値を返す |

### ETag / Last-Modified

```http
ETag: "abc123"
Last-Modified: Mon, 24 Apr 2026 12:00:00 GMT
```

コンテンツの「識別子」。次回リクエスト時:

```http
If-None-Match: "abc123"
If-Modified-Since: Mon, 24 Apr 2026 12:00:00 GMT
```

→ 変わってなければ `304 Not Modified`（ボディなし、帯域節約）

### Vary

キャッシュを **リクエストヘッダごとに分岐**:

```http
Vary: Accept-Encoding    ← 圧縮別
Vary: Accept-Language    ← 言語別
Vary: Cookie             ← Cookieごと（危険！）
```

**Vary: Cookie は基本ダメ**。セッション Cookie で全ユーザー別キャッシュが作られ、ヒット率0に。

---

## コンテンツタイプ別の戦略

### 静的アセット（画像・JS・CSS）

```http
Cache-Control: public, max-age=31536000, immutable
```

- 1年キャッシュ（最大）
- ファイル名にハッシュを入れて、変更時は URL 自体を変える

```
/static/app.a1b2c3.js   ← 旧
/static/app.d4e5f6.js   ← 新（URLが変わるから自動で新しく取得される）
```

**パージ不要**。最強の戦略。

### HTML ページ

```http
Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=300
```

- ブラウザはキャッシュしない（`max-age=0`）
- CDN は60秒キャッシュ
- 期限切れ後5分間、古い値を返しつつ裏で更新

### API レスポンス

```http
Cache-Control: public, max-age=30, s-maxage=60
```

- 認証不要の公開 API
- 短 TTL

または:

```http
Cache-Control: private, no-store
```

- 認証必須の API（**CDN キャッシュ禁止**）

### ユーザー個別コンテンツ

```http
Cache-Control: private, max-age=0, must-revalidate
```

- ブラウザ個別キャッシュのみ
- CDN 絶対禁止

---

## 認証付きコンテンツと CDN

### 最重要ルール

> **認証付きコンテンツは CDN でキャッシュしない**

### 漏洩事故例

```
User A が /mypage にアクセス → CDN が "User A のマイページ" をキャッシュ
User B が /mypage にアクセス → CDN は "User A のキャッシュ" を返す

→ User A の情報が User B に漏れる
```

### 防ぎ方

1. **`Cache-Control: private, no-store`** を必ず設定
2. URL に `?user=123` のようにユニーク化（それでも危険、基本は no-store）
3. CDN 側の設定で「認証があるパス」を除外

### 一部 CDN の便利機能

- **Cloudflare**: Cache Level → Bypass for logged-in users
- **Fastly**: Vary: Cookie を厳密制御
- **Varnish**: VCL で細かく分岐

---

## キャッシュキーの設計

### デフォルト

```
キー = method + host + path + query
```

例: `GET https://example.com/product/123?lang=ja`

### カスタマイズ

CDN によって、**無視するクエリパラメータ** を指定できる:

```
? fbclid=xxx (トラッキング用) は無視
? tz=JST (言語) は区別
```

→ `tz=JST` と `tz=EST` は別キャッシュ、`fbclid` は同一キャッシュ。

### 注意

- 余計なパラメータ（`?from=xxx`）でキャッシュが細分化されると、ヒット率低下
- 逆に重要なパラメータを無視するとコンテンツ取り違え

---

## パージ（無効化）

### 種類

1. **URL パージ**: 特定 URL だけ
2. **タグ / サロゲートキー**: 複数 URL を一括
3. **全パージ**: すべて消す（緊急時のみ）

### パージの速さ

| CDN | 伝播速度 |
|-----|---------|
| Fastly | 150ms（最速） |
| Cloudflare | 数秒〜30秒 |
| CloudFront | 数分〜15分 |
| Akamai | 数分 |

### サロゲートキー（Surrogate Key）

Fastly / Cloudflare の高度機能:

```http
Surrogate-Key: user-123 orders-user-123 product-456
```

→ 「user-123」のタグがついた全キャッシュを1コマンドで無効化可能。

---

## エッジでの計算

最近の CDN は **エッジでコード実行** 可能:

- **Cloudflare Workers**
- **AWS Lambda@Edge / CloudFront Functions**
- **Fastly Compute@Edge**
- **Vercel Edge Functions**

用途:
- A/Bテスト振り分け
- 地理的ルーティング
- レスポンス改変
- 認証トークン検証
- 動的キャッシュキー

---

## 典型的な失敗

### 1. Cookie ヘッダを Vary に含める

→ 全ユーザー別キャッシュ、ヒット率激減。

### 2. 認証コンテンツを `public` でキャッシュ

→ **最悪の事故**: 他人の情報が見える。

### 3. 短すぎる TTL

→ オリジンの負荷が減らない。

### 4. 長すぎる TTL + パージ忘れ

→ 古いコンテンツが配信され続ける。

### 5. クエリパラメータで無駄に細分化

→ トラッキング用パラメータを入れただけでキャッシュミス。

### 6. CDN と Redis キャッシュで整合性が崩れる

→ CDN は古い、Redis は新しい、DB はもっと新しい …… 整合性地獄。

---

## 設計パターン

### 1. ファイル名ハッシュ化（静的アセット）

```html
<link href="/static/app.a1b2c3.css">
<script src="/static/app.d4e5f6.js"></script>
```

- デプロイでハッシュが変わる
- 古い URL は順次フェードアウト
- パージ不要、長期 TTL OK

### 2. HTML短 TTL + static 長 TTL

```
/index.html  → max-age=0, s-maxage=60    ← 短い
/static/*    → max-age=31536000, immutable  ← 1年
```

HTML だけ即更新、アセットは長期キャッシュ。

### 3. Stale-while-revalidate

```http
Cache-Control: max-age=60, stale-while-revalidate=300
```

- 60秒間: ヒット
- 61〜360秒: 古い値を即返しつつ、裏で更新
- ユーザー体感ミスゼロ

### 4. API キャッシュ + 認証分離

```
[公開API] /api/products/*   → CDN キャッシュ
[認証API] /api/me/*          → CDN バイパス
```

パスで明確に分ける。

### 5. ISR（Incremental Static Regeneration）

Next.js などのフレームワーク機能:

- ビルド時に静的生成
- リクエストが来たら、TTL 超過なら裏で再生成
- ユーザーは高速応答 + 新鮮度両立

---

## モニタリング

- **キャッシュヒット率**（80%以上が目安）
- **オリジンへのリクエスト数**
- **エッジのレスポンスコード内訳**
- **地域別レイテンシ**

CDN の管理コンソールで確認。

---

## セキュリティ視点

### 1. HSTS（HTTP Strict Transport Security）

```http
Strict-Transport-Security: max-age=31536000
```

HTTPS 強制。

### 2. キャッシュポイズニング

悪意ある HTTP ヘッダで **エッジに不正キャッシュを仕込む** 攻撃。
- Vary ヘッダの取り扱い
- 信頼できないヘッダを反映しない

### 3. ログの扱い

- アクセスログに **認証トークン** や PII が含まれる可能性
- CDN ログ保管期間と内容を設計

---

## 次に読むもの

- `キャッシュ戦略.md` — 戦略全般
- `キャッシュ配置レイヤー.md` — CDN 層の位置づけ
- `TTLとイビクション.md` — TTL 設計
- `キャッシュ無効化の難しさ.md` — 無効化の原理

---

## まとめ

- CDN は **静的だけでなく動的ページも高速化** できる
- **Cache-Control** の `public/private`, `max-age/s-maxage`, `stale-while-revalidate` を使い分ける
- **静的アセットはファイル名ハッシュ + 1年キャッシュ** が最強
- **認証コンテンツは CDN キャッシュしない**（`private, no-store`）
- `Vary: Cookie` は基本使わない（ヒット率崩壊）
- パージは **サロゲートキー** で効率化
- ISR / Stale-while-revalidate で体感ゼロミス
- キャッシュポイズニングに注意
