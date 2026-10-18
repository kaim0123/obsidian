# デプロイ（Vercel ほか）

書いたコードを世界に公開するのが「デプロイ」です。
Next.js は開発元の **Vercel** に最適化されていますが、他のホスティングや自前サーバーでも動かせます。

---

## 1. 選択肢の全体像

| 方式 | 特徴 | 向き |
|------|------|------|
| **Vercel** | Next.js 開発元、ゼロ設定、最速 | 9 割の人にこれがベスト |
| **Netlify** | Next.js 対応、Edge にも強い | Vercel の代替 |
| **Cloudflare Pages / Workers** | Edge 最強、安い | Edge 優先のサイト |
| **AWS Amplify** | AWS と統合、複雑だが柔軟 | AWS スタックの場合 |
| **Docker + 自前 VPS / EC2** | 完全コントロール、運用コスト大 | 大企業・特殊要件 |
| **Static Export（`output: 'export'`）** | 静的 HTML だけ出力 | 完全静的サイト、S3+CloudFront など |

---

## 2. Vercel：最速で公開する

### 1. アカウント作成

<https://vercel.com/> で GitHub/GitLab/Bitbucket 連携アカウント作成。

### 2. リポジトリを Git にプッシュ

```bash
git init
git add .
git commit -m "init"
git remote add origin git@github.com:user/repo.git
git push -u origin main
```

### 3. Vercel に Import

1. Vercel ダッシュボード → 「Add New」→「Project」
2. リポジトリを選択
3. 環境変数を設定（必要なら）
4. 「Deploy」

これだけで `xxx.vercel.app` という URL が発行されます。

### 4. 自動デプロイ

- `main` ブランチに push → **本番デプロイ**
- それ以外のブランチに push → **プレビューデプロイ**（PR ごとに URL）

PR を出すだけで「本物が動くプレビュー URL」が貰えるのは超便利。

### 5. カスタムドメイン

Settings → Domains から独自ドメインを追加。DNS の設定指示も Vercel が出してくれる。

---

## 3. Vercel ならではの機能

| 機能 | 内容 |
|------|------|
| **Edge Network** | 世界中の CDN から配信 |
| **Serverless Functions** | Route Handlers / Server Actions が自動デプロイ |
| **Edge Functions** | Edge Runtime で動く軽量 API |
| **Image Optimization** | `<Image>` の自動最適化 |
| **Preview Deployments** | PR ごとに URL |
| **Analytics / Speed Insights** | 実ユーザー計測 |
| **Vercel Postgres / KV / Blob** | マネージド DB / KV / ストレージ |
| **Cron Jobs** | スケジュール実行 |

---

## 4. Vercel の料金

| プラン | 月額 | 主な制限 |
|--------|-----|----------|
| **Hobby**（個人） | 無料 | 商用利用不可、帯域月 100GB、ファンクション実行時間など |
| **Pro** | $20/ユーザー | 商用 OK、帯域 1TB、チーム機能 |
| **Enterprise** | 要問合せ | SLA、専用サポート |

⚠ **Hobby は個人プロジェクト・学習用のみ**。会社や副業で使ったら規約違反。

---

## 5. 環境変数の設定

Vercel ダッシュボード → Settings → Environment Variables。

| 環境 | 適用される場面 |
|------|---------------|
| **Production** | `main` ブランチからのデプロイ |
| **Preview** | PR・他ブランチデプロイ |
| **Development** | `vercel dev`（ローカル） |

環境変数を変更したら**再デプロイ**が必要です。

---

## 6. Cloudflare Pages

Vercel の代替として人気上昇中。`@cloudflare/next-on-pages` というアダプタが必要。

### メリット

- 帯域実質無制限（無料プランでも）
- Edge ネットワークが世界最大級
- Workers との統合

### 制約

- Node.js 専用 API は使えない（Edge Runtime のみ）
- `Image Optimization` 機能は別途設定

```bash
npm install -D @cloudflare/next-on-pages
npx @cloudflare/next-on-pages
```

---

## 7. Docker でのデプロイ

完全コントロールしたい場合。Next.js は **Standalone モード**でデプロイサイズを最小化できます。

### Standalone 出力を有効化

```ts
// next.config.ts
export default {
  output: "standalone",
};
```

### Dockerfile の例

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t my-next-app .
docker run -p 3000:3000 my-next-app
```

このコンテナを Cloud Run、ECS、Fly.io、Railway などにデプロイ。

---

## 8. 静的エクスポート（`output: 'export'`）

完全に静的な HTML だけ出力したい場合。

```ts
// next.config.ts
export default {
  output: "export",
};
```

```bash
npm run build
# → out/ フォルダに静的ファイルが出力
```

`out/` を S3 や Cloudflare R2、Netlify などにアップ。

### 制約

- Server Components / Server Actions は使えない
- Route Handlers も使えない
- 動的セグメントは `generateStaticParams` 必須

→ ブログ・LP など **完全静的サイト**のみ向き。

---

## 9. デプロイ前チェックリスト

- [ ] **環境変数**を本番用に設定したか（特に `NEXT_PUBLIC_` でないものに API キーがあるか確認）
- [ ] **`npm run build` がローカルで通る**
- [ ] **型エラー / Lint エラー無し**
- [ ] **メタデータ（title / description / OG）**が設定されている
- [ ] **favicon、apple-touch-icon** が設置されている
- [ ] **`robots.ts`、`sitemap.ts`** が出ている（SEO 対象なら）
- [ ] **エラー画面（`error.tsx`、`not-found.tsx`）**がある
- [ ] **コンテンツの著作権・規約**を確認
- [ ] **アナリティクスや監視**を仕込んだ
- [ ] **HTTPS**（カスタムドメインは Vercel が自動）

---

## 10. デプロイ後にやること

### A. 動作確認

- すべての主要ページが開けるか
- フォーム送信や認証が動くか
- 環境変数が反映されているか

### B. パフォーマンス確認

- PageSpeed Insights で本番 URL をチェック
- LCP・CLS・INP が Good に入っているか

### C. 監視を仕込む

- エラー監視（Sentry）
- パフォーマンス監視（Vercel Speed Insights）
- ログ集約（自前 or Logtail / Datadog）

### D. ドメインとメール

- カスタムドメインを設定
- 必要なら問い合わせ先メールも

---

## 11. つまずきポイント

### Q. Vercel デプロイ後に「Application error」

→ ログを確認（Vercel ダッシュボード → Functions → Logs）。多くは環境変数漏れ。

### Q. ローカルで動くのに Vercel で動かない

→ ファイル名の大文字小文字。Linux サーバーは大文字小文字を区別する（Mac/Windows は鈍感）。

### Q. ビルド時に「Static generation failed」

→ `generateStaticParams` 内で外部 API が落ちている、もしくは `dynamic = 'force-static'` のページで Cookie を読んでいるなど。

### Q. 帯域が無料枠を超えた

→ 大きな画像を `<Image>` で配信する、CDN キャッシュを長めに、不要トラフィックを減らす。

### Q. Cron や定期実行をしたい

→ Vercel Cron Jobs、または GitHub Actions の schedule、外部 cron サービス（cron-job.org 等）。

### Q. 自前で動かしたら fetch のキャッシュが効かない

→ `output: 'standalone'` で動かす場合、ファイルシステムキャッシュがコンテナ間で共有されない。Redis 等の外部キャッシュが必要。

---

## まとめ

- **新規・個人なら Vercel**：5 分で公開できる
- 商用は **Vercel Pro** または **Cloudflare Pages** などへ
- **Docker + standalone モード**で自前ホスティングも可能
- **完全静的なサイトなら `output: 'export'`** で S3 等にも置ける
- 公開前は **チェックリスト**を一通り確認、後は監視を仕込む

次はログと監視 → [[04ログ・監視の要点]]
