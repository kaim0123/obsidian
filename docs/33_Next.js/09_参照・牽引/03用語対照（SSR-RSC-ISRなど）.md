# 用語対照（SSR / RSC / ISR など）

Next.js を学ぶと、**似たような略語**が大量に出てきて混乱します。
このノートは「あの言葉、結局なんだっけ？」を 1 か所にまとめた辞書です。

---

## 1. レンダリング方式の用語

| 略語 | 正式名称 | 意味 |
|------|---------|------|
| **CSR** | Client-Side Rendering | ブラウザで JS を実行して画面を組み立てる。React 単体の従来型 |
| **SSR** | Server-Side Rendering | リクエストごとにサーバーで HTML を生成して返す |
| **SSG** | Static Site Generation | ビルド時に HTML を生成して保存しておく |
| **ISR** | Incremental Static Regeneration | SSG しつつ、一定間隔で部分再生成 |
| **PPR** | Partial Prerendering | 1 ページ内で静的 + 動的部分を混在 |
| **RSC** | React Server Components | サーバーでだけ動く React コンポーネント |
| **CSC** | Client Components | 「`'use client'` 付き」のクライアントコンポーネント（造語） |

### Next.js での対応

| 用語 | App Router での実現方法 |
|------|----------------------|
| CSR | Client Component（`'use client'`）+ `useEffect` |
| SSR | Server Component で `cookies()` 等を使う or `dynamic = "force-dynamic"` |
| SSG | Server Component（デフォルト）+ `generateStaticParams` |
| ISR | `next.revalidate` または `revalidateTag` |
| PPR | `experimental_ppr = true` + `<Suspense>` |
| RSC | Server Component（App Router のデフォルト） |

---

## 2. データ取得の用語

| 用語 | 意味 |
|------|------|
| **Fetch** | 通常の HTTP リクエスト（Next では拡張版） |
| **Cache**（データキャッシュ） | `fetch` 結果のサーバー保存 |
| **Memoization** | 同一リクエスト内の重複排除 |
| **Revalidation** | 古いキャッシュを更新 |
| **Stale-while-revalidate（SWR）** | 古いまま返しつつ裏で更新 |
| **`use cache`**（Next 16+） | 関数/コンポーネント単位でキャッシュ |
| **Mutation** | データ更新（POST/PUT/DELETE） |
| **Server Actions** | サーバー側の関数を直接呼ぶ仕組み |

---

## 3. パフォーマンス指標

| 略語 | 正式名称 | 意味 |
|------|---------|------|
| **LCP** | Largest Contentful Paint | 最大コンテンツ表示時間 |
| **FCP** | First Contentful Paint | 最初の描画時間 |
| **INP** | Interaction to Next Paint | 操作後の応答時間 |
| **CLS** | Cumulative Layout Shift | レイアウトずれ累計 |
| **TTFB** | Time To First Byte | 最初の 1 バイト到達時間 |
| **TBT** | Total Blocking Time | メインスレッド占有時間 |
| **TTI** | Time To Interactive | 操作可能になるまで |
| **FID** | First Input Delay | （旧）初回入力遅延、INP に置換 |
| **CWV** | Core Web Vitals | LCP / INP / CLS の総称 |

---

## 4. Next.js 固有の用語

| 用語 | 意味 |
|------|------|
| **App Router** | `app/` フォルダで動く新しいルーティング（13+） |
| **Pages Router** | `pages/` フォルダの旧来のルーティング |
| **Layout** | 共通ラッパー（再描画されない） |
| **Template** | 共通ラッパー（再描画される） |
| **Route Handler** | API ルート（`route.ts`） |
| **Server Action** | サーバー関数を直接呼ぶ仕組み（`'use server'`） |
| **Middleware** | リクエスト前に走る軽量関数 |
| **Edge Runtime** | 軽量な実行環境（V8 ベース、Node 専用 API 不可） |
| **Node.js Runtime** | フル Node.js 環境 |
| **Streaming** | HTML を少しずつ送信する手法 |
| **Suspense** | データ待機中の `fallback` を表示 |
| **Hydration** | サーバー HTML に JS を「水を注ぐ」ように紐付け |
| **`<Link>`** | ページ間リンク（クライアント遷移） |
| **`<Image>`** | 自動最適化画像 |
| **`<Script>`** | 制御付きスクリプトロード |

---

## 5. React の関連用語

| 用語 | 意味 |
|------|------|
| **JSX** | JavaScript の中で HTML 風に書く構文 |
| **Component** | 部品。関数 or クラスで定義 |
| **Props** | 親から子に渡すデータ |
| **State** | コンポーネント内部の状態 |
| **Hook** | `useXxx()` という関数群（React 16.8+） |
| **Context** | 階層を飛び越えてデータ共有 |
| **Memo** | 不要な再描画を防ぐ最適化 |
| **Suspense Boundary** | `<Suspense>` で囲んだ範囲 |
| **Error Boundary** | エラーをキャッチする境界 |
| **React 19** | Server Components / Actions が安定 |

---

## 6. キャッシュ階層（Next.js）

| 名称 | スコープ | 説明 |
|------|---------|------|
| **Request Memoization** | 1 リクエスト | 同一 `fetch` を 1 回に |
| **Data Cache** | リクエスト跨ぎ | `fetch` 結果の永続化 |
| **Full Route Cache** | リクエスト跨ぎ | レンダリング済み HTML |
| **Router Cache** | ブラウザ側 | 訪問済みページの一時保持 |

---

## 7. デプロイ・運用関連

| 用語 | 意味 |
|------|------|
| **CDN** | Content Delivery Network。世界中のキャッシュサーバー |
| **Edge** | ユーザーに近いサーバー（CDN 上で動かす） |
| **Cold Start** | サーバーレス関数の初回呼び出しの遅延 |
| **Serverless Function** | 必要時だけ起動するサーバー処理 |
| **OG（Open Graph）** | SNS シェア時のメタ情報 |
| **JSON-LD** | 構造化データの記法 |
| **CWV / Web Vitals** | パフォーマンス指標群 |

---

## 8. セキュリティ関連

| 略語 | 意味 |
|------|------|
| **CORS** | Cross-Origin Resource Sharing（オリジン間制御） |
| **CSRF** | Cross-Site Request Forgery |
| **XSS** | Cross-Site Scripting |
| **CSP** | Content Security Policy |
| **JWT** | JSON Web Token（トークン形式） |
| **OAuth** | 第三者認可プロトコル |
| **OIDC** | OpenID Connect（OAuth + 認証） |
| **httpOnly** | JS からアクセスできないクッキー属性 |
| **SameSite** | CSRF 対策のクッキー属性 |
| **PII** | Personally Identifiable Information（個人情報） |

---

## 9. 開発周辺

| 用語 | 意味 |
|------|------|
| **HMR** | Hot Module Replacement（保存即反映） |
| **Tree Shaking** | 未使用コードを削る |
| **Code Splitting** | バンドルを分割して必要分だけ配信 |
| **Lazy Loading** | 必要時に遅延読み込み |
| **Dynamic Import** | `import()` で動的に読み込み |
| **Polyfill** | 古いブラウザ向け補完コード |
| **Source Map** | minify 後のコードと元コードの対応表 |
| **Linting** | コード規約チェック |
| **Formatting** | コード整形 |
| **CI/CD** | 自動テスト・自動デプロイ |

---

## 10. CSS 関連

| 用語 | 意味 |
|------|------|
| **CSS Modules** | クラス名を自動でスコープ化 |
| **Tailwind CSS** | ユーティリティファースト CSS |
| **CSS-in-JS** | JS の中に CSS を書く方式 |
| **PostCSS** | CSS を変換するプラグインツール |
| **Atomic CSS** | 小さなクラスを組み合わせる方式（Tailwind が代表） |
| **Specificity** | CSS の優先度 |
| **CLS（再掲）** | レイアウトのガタつき |

---

## 11. データベース関連

| 用語 | 意味 |
|------|------|
| **ORM** | Object-Relational Mapping（Prisma 等） |
| **Migration** | DB 構造変更スクリプト |
| **Seed** | 初期データ投入 |
| **N+1 問題** | ループ内で個別 SQL を発行する遅さ |
| **Connection Pool** | DB 接続の使い回し |
| **Edge Compatible DB** | Edge Runtime からも繋がる DB（Neon 等） |

---

## 12. プロジェクトでよく出るキーワード

| キーワード | 意味 |
|-----------|------|
| **Monorepo** | 複数プロジェクトを 1 リポジトリで管理（Turborepo, Nx） |
| **Workspace** | パッケージマネージャの monorepo 機能 |
| **Lockfile** | 依存バージョンの固定（`package-lock.json` 等） |
| **Semver** | セマンティックバージョニング（メジャー.マイナー.パッチ） |
| **Breaking Change** | 互換性を壊す変更 |
| **Backport** | 新しい修正を旧バージョンに反映 |
| **Stable / Beta / RC / Canary** | リリース段階 |

---

## 13. 「結局どっち？」混同しやすいペア

| 紛らわしいペア | 違い |
|---------------|------|
| **SSR vs RSC** | SSR は実行タイミング、RSC は React の機能。両方使うことも |
| **`Layout` vs `Template`** | Layout は再描画なし、Template は遷移ごとに新規 |
| **`page.tsx` vs `route.ts`** | page は HTML、route は API |
| **`getServerSideProps` vs Server Component** | 前者は Pages Router、後者は App Router |
| **Server Actions vs Route Handlers** | 前者は内部用、後者は外部公開 |
| **`redirect` vs `notFound`** | リダイレクトする vs 404 にする |
| **`revalidatePath` vs `revalidateTag`** | パス基準 vs タグ基準で無効化 |
| **`useRouter`（next/router） vs `useRouter`（next/navigation）** | Pages 用 vs App 用、API も別物 |

---

## まとめ

- **CSR / SSR / SSG / ISR / PPR** は「いつ HTML を作るか」の違い
- **RSC** は React の概念、**App Router** は Next.js の機能
- **Core Web Vitals = LCP / INP / CLS**、これだけは覚える
- 紛らわしいペアは「**目的とタイミング**」で区別する

次は実務でよくある罠 → [[01認証付きレイアウト分岐]]
