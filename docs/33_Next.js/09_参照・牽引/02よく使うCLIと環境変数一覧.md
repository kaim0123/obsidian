# よく使う CLI と環境変数一覧

開発中に頻繁に使うコマンドと、覚えておくと便利な環境変数の早見表です。

---

## 1. プロジェクト作成

```bash
# 最新版で雛形作成（推奨）
npx create-next-app@latest my-app

# pnpm 版
pnpm create next-app my-app

# 特定バージョンで
npx create-next-app@15 my-app

# テンプレート指定
npx create-next-app@latest my-app --example with-tailwindcss

# 質問なしで全部 Yes
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

---

## 2. 開発・ビルド

```bash
# 開発サーバー起動（最も使う）
npm run dev

# ポート変更
npm run dev -- -p 3001

# Turbopack で起動（高速）
npm run dev -- --turbo

# 特定ホストで（LAN 内テスト用）
npm run dev -- -H 0.0.0.0

# 本番ビルド
npm run build

# ビルド済みを起動
npm run start

# Lint
npm run lint
npm run lint -- --fix       # 自動修正
npm run lint -- --dir app   # 対象を絞る
```

---

## 3. 型チェック

```bash
# 型チェックのみ（コード生成なし）
npx tsc --noEmit

# 監視モード
npx tsc --noEmit --watch

# Next.js の生成型を含めて
npx tsc --noEmit -p tsconfig.json
```

---

## 4. パッケージ管理

```bash
# インストール
npm install
npm install <パッケージ名>
npm install -D <パッケージ名>      # devDependencies

# pnpm
pnpm install
pnpm add <パッケージ名>
pnpm add -D <パッケージ名>

# 削除
npm uninstall <パッケージ名>
pnpm remove <パッケージ名>

# 古いパッケージ確認
npm outdated

# 一括更新（メジャー含む）
npx npm-check-updates -u && npm install

# Next.js だけ最新へ
npm install next@latest react@latest react-dom@latest
```

---

## 5. キャッシュ・トラブル対応

```bash
# .next を削除して再ビルド
rm -rf .next && npm run build

# node_modules を再生成
rm -rf node_modules package-lock.json
npm install

# Next.js の永続キャッシュを削除
rm -rf .next/cache

# Turbo / npm キャッシュを削除（Linux/Mac）
rm -rf ~/.npm ~/.cache/turbo
```

---

## 6. Vercel CLI

```bash
# インストール
npm install -g vercel

# ログイン
vercel login

# 初回デプロイ
vercel

# 本番デプロイ
vercel --prod

# 環境変数を pull
vercel env pull .env.local

# 環境変数を追加
vercel env add MY_VAR production

# ログ確認
vercel logs <deployment-url>
vercel logs <deployment-url> --follow   # ストリーミング

# プロジェクト削除
vercel remove my-project
```

---

## 7. デバッグ

```bash
# Node のデバッガで起動
NODE_OPTIONS="--inspect" npm run dev
# Chrome の chrome://inspect で接続

# Next の詳細ログ
DEBUG=* npm run dev

# ビルド時間を測定
time npm run build

# Bundle Analyzer
ANALYZE=true npm run build
```

---

## 8. 主要な環境変数（Next.js が読む）

| 変数 | 用途 |
|------|------|
| `NODE_ENV` | `development` / `production` / `test`（自動設定） |
| `NEXT_PUBLIC_*` | クライアントに公開される変数 |
| `PORT` | 開発サーバーのポート |
| `HOSTNAME` | Host bind |
| `NEXT_TELEMETRY_DISABLED=1` | テレメトリを無効化 |
| `NEXT_PRIVATE_DEBUG_CACHE=1` | キャッシュデバッグログ |
| `ANALYZE=true` | bundle analyzer 有効化（自前設定） |

---

## 9. アプリ用環境変数の典型

```bash
# .env.local
# === DB ===
DATABASE_URL=postgresql://user:pass@host:5432/db

# === 認証 ===
AUTH_SECRET=長いランダム文字列
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...

# === 外部 API ===
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...

# === ストレージ ===
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=...
S3_REGION=ap-northeast-1

# === 監視 ===
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...

# === 公開設定 ===
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_GA_ID=G-XXXXX

# === 再検証用 ===
REVALIDATE_SECRET=ランダム文字列
```

---

## 10. ランダム文字列の生成

```bash
# Node.js で
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Linux / Mac
openssl rand -hex 32

# pwgen
pwgen -s 64 1
```

---

## 11. ビルド出力の見方

```bash
$ npm run build

Route (app)                    Size     First Load JS
┌ ○ /                          5 kB     90 kB
├ ○ /about                     1 kB     86 kB
├ ƒ /dashboard                 25 kB    200 kB
└ ƒ /api/auth/[...nextauth]    0 B      0 B

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

| 記号 | 意味 |
|------|------|
| `○` | 静的（ビルド時生成） |
| `●` | SSG（`generateStaticParams`） |
| `ƒ` | 動的（毎リクエスト） |
| `λ` | サーバー実行（同義） |

`First Load JS` の目安：**100KB 以下が理想、120KB 超は要注意**。

---

## 12. その他の便利な環境変数

| 変数 | 用途 |
|------|------|
| `LOG_LEVEL=debug` | アプリ内ロガーの詳細度 |
| `NEXT_RUNTIME` | "nodejs" or "edge"（読み取り専用） |
| `VERCEL_ENV` | "production" / "preview" / "development" |
| `VERCEL_URL` | デプロイ先 URL |
| `VERCEL_GIT_COMMIT_SHA` | コミットハッシュ |
| `CI=true` | CI 環境（CI 側で自動設定） |

```ts
// 使用例
const isProduction = process.env.VERCEL_ENV === "production";
const buildVersion = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
```

---

## 13. 他のフレームワークとのコマンド対応

| やりたいこと | Next.js | Remix | Astro | SvelteKit |
|-------------|---------|-------|-------|-----------|
| 開発サーバー | `next dev` | `remix dev` | `astro dev` | `vite dev` |
| ビルド | `next build` | `remix build` | `astro build` | `vite build` |
| 起動 | `next start` | `remix-serve` | `astro preview` | `node build` |

---

## 14. Git と組み合わせ

```bash
# 推奨 .gitignore（生成済みのもの + 追記）
.next/
node_modules/
.env*.local
.vercel/
*.log
.DS_Store

# よく使う Git コマンド
git status
git add .
git commit -m "feat: 機能追加"
git push origin main

# ブランチ作成 + 切り替え
git checkout -b feature/xxx

# 直前のコミットメッセージを修正
git commit --amend
```

---

## 15. つまずきポイント

### Q. `npm run dev` が「port 3000 in use」

→ 別アプリが使用中。`-p 3001` でポート変更、または `lsof -i :3000`（Mac/Linux）/ `netstat -ano | findstr :3000`（Windows）で確認して終了。

### Q. 環境変数を追加したのに反映されない

→ **開発サーバーを再起動**。`.env*` の変更は再起動が必要。

### Q. ビルド成果物が古い

→ `rm -rf .next` してビルドし直す。

### Q. `npx create-next-app` の質問が見えない

→ 一部のターミナル（古い PowerShell など）で起こる。Windows Terminal や iTerm2 を使うと改善。

---

## まとめ

- 開発：**`npm run dev`** が 90% 以上を占める
- 確認：**`npm run build`** をローカルで通すクセを付ける
- トラブル時：**`.next` 削除 → `node_modules` 削除 → `npm install`** の順で
- 環境変数の変更後は**サーバー再起動**

次は用語の対照表 → [[03用語対照（SSR-RSC-ISRなど）]]
