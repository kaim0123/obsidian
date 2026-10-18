---
title: LighthouseとRUMで計測する
created: 2026-10-12
tags:
  - パフォーマンス
  - フロントエンド
---

# LighthouseとRUMで計測する

[[MOC_パフォーマンス体系|📚 目次]] ｜ [[05_ネットワークと読み込みの最適化|← 前へ]] ｜ [[01_APIレスポンスタイムの分解|次へ →]]

> [!abstract] この記事で分かること
> - Lighthouse のスコアの算出方法、ばらつきの原因、スロットリングの仕組み
> - PageSpeed Insights・CrUX・WebPageTest の使い分け
> - `web-vitals` ライブラリで実ユーザーの指標（RUM）を集める実装
> - RUM と合成監視の違い、Lighthouse CI でバジェットを守る方法
> - Shop 商品詳細ページの LCP を「計測 → 仮説 → 改善 → 再計測」で改善する通し手順
>
> **前提**：[[01_Core_Web_Vitals]] と [[01_計測の基本と落とし穴]] を読んでいると理解しやすいです。

## 1. ひとことで言うと

健康管理にたとえると、**Lighthouse は「人間ドック」**、**RUM は「毎日つけるウェアラブル端末」** です。人間ドックは決まった条件で詳しく検査でき、どこが悪いか（原因）が分かりますが、年に数回のスナップショットです。ウェアラブルは日常生活（実ユーザーの端末・回線・操作）の本当の状態を常に記録しますが、細かい原因までは分かりません。**両方を組み合わせて初めて「本当に問題があるか」と「なぜか」が分かります。**

- ラボ（合成）：Lighthouse、WebPageTest、DevTools — 原因調査、リリース前チェック、CI
- フィールド（実ユーザー）：CrUX、自前の RUM — 合否判定、改善効果の確認
- 背骨はいつもの「**計測 → 仮説 → 改善 → 再計測**」

## 2. Lighthouse

### 2-1. スコアの算出方法

Lighthouse のパフォーマンススコア（0〜100）は、5 つの指標を **重み付きで合算** したものです（Lighthouse 10 以降、2026 年時点の公式ドキュメント）。

| 指標 | 重み |
|---|---|
| TBT（Total Blocking Time） | 30% |
| LCP（Largest Contentful Paint） | 25% |
| CLS（Cumulative Layout Shift） | 25% |
| FCP（First Contentful Paint） | 10% |
| Speed Index | 10% |

- 各指標の生の値（例：LCP 3.1 秒）は、HTTP Archive の実サイトの分布から作った **対数正規分布の曲線** で 0〜100 の点に変換されます。そのため「あと 0.5 秒縮めると何点上がるか」は、今の位置によって変わります（Lighthouse の公式スコア計算機で確認できます）。
- 色分け：0〜49 赤（Poor）、50〜89 オレンジ、90〜100 緑（Good）。
- **INP は含まれていません**。ラボでは人が操作しないためで、代わりに TBT が反応性の代替指標です。

### 2-2. スロットリング

Lighthouse のモバイル計測は、既定で **低速なモバイル端末と回線をシミュレーション** します（2026 年時点の既定値）。

- 回線：RTT 150ms、下り約 1.6Mbps（遅めの 4G 相当）
- CPU：4 倍遅く（4x slowdown）
- 方式：**シミュレーション（Lantern）**。実際には速い回線で読み込み、その記録から「遅い条件ならどうなったか」を計算で推定します。

DevTools の Lighthouse パネルでは「DevTools throttling（実際に遅くする）」も選べますが、両者で値は一致しません。比較するときは **同じ方式・同じ設定** で測ることが大前提です。

### 2-3. ばらつき

同じページを連続で測っても、スコアが 5〜10 点ぶれることは珍しくありません。主な原因：

- 計測マシンの CPU 負荷（他のタブ、拡張機能、CI ランナーの混雑）
- ネットワークやサーバーの応答時間の揺らぎ
- A/B テスト、広告など毎回変わるコンテンツ

対策は [[01_計測の基本と落とし穴]] と同じ考え方です。

```bash
# Lighthouse CLI（2026 年時点）。シークレットに近いクリーンな状態で、複数回測る
npm i -g lighthouse
for i in 1 2 3 4 5; do
  lighthouse https://staging.shop.example.com/products/42 \
    --only-categories=performance --output=json --output-path=./lh-$i.json \
    --chrome-flags="--headless=new" --quiet
done
# 5 回の LCP の中央値を取る
node -e 'const v=[1,2,3,4,5].map(i=>require(`./lh-${i}.json`).audits["largest-contentful-paint"].numericValue).sort((a,b)=>a-b);console.log("LCP median(ms):",Math.round(v[2]),v.map(Math.round))'
```

- **1 回の結果で判断しない**。5 回程度測って中央値を見る
- **スコアより個々の指標と診断（Insights）を見る**。スコアは要約にすぎない
- 拡張機能の影響を避けるため、ヘッドレスかシークレットウィンドウで測る

## 3. PageSpeed Insights・CrUX・WebPageTest

| ツール | 種類 | 何が分かるか | 使いどころ |
|---|---|---|---|
| **PageSpeed Insights（PSI）** | フィールド + ラボ | 上部に **CrUX の実測値（28 日、75 パーセンタイル）**、下部に Lighthouse の結果 | まず全体像を見る。合否はフィールド側 |
| **CrUX** | フィールド | URL / オリジン単位の分布。BigQuery や CrUX API、CrUX Vis で履歴も | 競合比較、長期トレンド |
| **Search Console** | フィールド | サイト全体の Good / NI / Poor の URL グループ | どのページ群に問題があるかの発見 |
| **WebPageTest** | ラボ | 実機・実回線・世界各地からの計測、**フィルムストリップ**、ウォーターフォール、複数回の中央値、スクリプトでの操作 | 詳細な原因調査、Before/After の比較動画 |
| **DevTools Performance** | ラボ | メインスレッドの詳細、LCP 区間、INP の内訳 | コードレベルの原因調査（[[Performance・Memory（遅さとメモリリークの調査）]]） |

```bash
# PSI API で CrUX と Lighthouse の結果を取得（API キーは任意だが、多用するなら取得する）
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://shop.example.com/products/42&strategy=mobile" \
  | jq '.loadingExperience.metrics | {lcp: .LARGEST_CONTENTFUL_PAINT_MS.percentile, inp: .INTERACTION_TO_NEXT_PAINT.percentile, cls: .CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile}'
# {"lcp": 3900, "inp": 240, "cls": 12}   ← CLS は 100 倍した値（0.12）で返る（数値は説明用の例）
```

CrUX は「同意した Chrome ユーザーのみ」「Safari・Firefox は含まない」「訪問数が少ないページは出ない」「28 日遅れ」という制約があります。これを埋めるのが自前の RUM です。

## 4. RUM を実装する

**RUM（Real User Monitoring）** は、実ユーザーのブラウザで指標を計測し、自分のサーバーに送って集計する仕組みです。Google の `web-vitals` ライブラリを使うと、Core Web Vitals の公式な計測方法と同じロジックで取れます。

### 4-1. クライアント側

```ts
// app/web-vitals-reporter.tsx（Next.js App Router の例。web-vitals v5、2026 年時点）
"use client";
import { useEffect } from "react";
import { onLCP, onINP, onCLS, onTTFB, type MetricWithAttribution } from "web-vitals/attribution";

function send(metric: MetricWithAttribution) {
  // 原因調査に必要な情報だけを抜き出す（全部送るとデータ量が大きい）
  let attribution: Record<string, unknown> = {};
  if (metric.name === "LCP") {
    const a = metric.attribution;
    attribution = {
      target: a.target, url: a.url,
      ttfb: a.timeToFirstByte, loadDelay: a.resourceLoadDelay,
      loadDuration: a.resourceLoadDuration, renderDelay: a.elementRenderDelay,
    };
  } else if (metric.name === "INP") {
    const a = metric.attribution;
    attribution = {
      target: a.interactionTarget, type: a.interactionType,
      inputDelay: a.inputDelay, processing: a.processingDuration,
      presentation: a.presentationDelay,
      script: a.longestScript?.entry?.sourceURL,
    };
  } else if (metric.name === "CLS") {
    attribution = { target: metric.attribution.largestShiftTarget };
  }

  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,           // "good" | "needs-improvement" | "poor"
    id: metric.id,                   // 同じページビュー内の重複排除用
    page: location.pathname.replace(/\/products\/\d+/, "/products/[id]"), // ルート単位に正規化
    conn: (navigator as any).connection?.effectiveType, // "4g" など（Chromium のみ）
    attribution,
  });
  // ページを閉じる時にも確実に送れる sendBeacon を優先
  if (!navigator.sendBeacon?.("/api/rum", body)) {
    fetch("/api/rum", { method: "POST", body, keepalive: true });
  }
}

export function WebVitalsReporter() {
  useEffect(() => {
    onLCP(send);
    onINP(send);
    onCLS(send);
    onTTFB(send);
  }, []);
  return null;
}
```

ポイント：

- INP と CLS は **ページを離れるまで値が確定しない** ため、ライブラリは `visibilitychange`（タブが隠れたとき）に最終値を報告します。`sendBeacon` を使うのはこのためです。
- **attribution ビルド**（`web-vitals/attribution`）を使うと「どの要素が LCP か」「LCP のどの区間が長いか」「どの操作の、どの段階が遅いか」が取れます。これがないと RUM は「遅い」ことしか分かりません。
- 全ユーザーから送ると量が多い場合は **サンプリング**（例：10%）します。

### 4-2. サーバー側で集計する

```ts
// app/api/rum/route.ts — 受け取って保存する最小例
import { NextRequest } from "next/server";
import { db } from "@/lib/db"; // pg の Pool などを想定

export async function POST(req: NextRequest) {
  const m = JSON.parse(await req.text()); // sendBeacon は text/plain で届くことがある
  await db.query(
    `INSERT INTO web_vitals (name, value, rating, page, conn, attribution, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, now())`,
    [m.name, m.value, m.rating, m.page, m.conn, m.attribution]
  );
  return new Response(null, { status: 204 });
}
```

```sql
-- ページ別・直近 7 日の LCP の 75 パーセンタイル（PostgreSQL）
SELECT page,
       count(*)                                                AS samples,
       percentile_cont(0.75) WITHIN GROUP (ORDER BY value)     AS lcp_p75_ms,
       avg((attribution->>'loadDelay')::float)                 AS avg_load_delay_ms
FROM web_vitals
WHERE name = 'LCP' AND created_at > now() - interval '7 days'
GROUP BY page
ORDER BY lcp_p75_ms DESC;
```

本番では自前 DB よりも、可観測性基盤（OpenTelemetry、Datadog RUM、Sentry、Vercel Speed Insights など）に送る方が運用は楽です。パーセンタイル集計の注意点は [[04_パーセンタイルとヒストグラムの集計]] を参照してください。

## 5. RUM と合成監視、Lighthouse CI

### 5-1. RUM と合成監視の違い

| | RUM | 合成監視（Synthetic Monitoring） |
|---|---|---|
| 計測者 | 実ユーザー | ボット（決まった端末・回線・場所から定期実行） |
| 分かること | 実際の体験の分布、端末・地域ごとの差 | 条件を固定した変化。リリース前・トラフィックゼロでも測れる |
| 弱点 | トラフィックが必要。ノイズが多い。原因が分かりにくい | 実ユーザーの多様さを再現できない |
| 使い道 | SLO、改善効果の確認（[[01_SLI・SLOの設計]]） | リグレッション検知、CI、競合比較 |

### 5-2. Lighthouse CI でバジェットを守る

リリースのたびに性能が劣化（リグレッション）していないかを、プルリクエストごとに自動チェックします。運用面（どこで止めるか、誰が見るか）は [[06_パフォーマンス（Lighthouse CI）]] にまとめてあるので、ここでは性能面の設定だけを示します。

```js
// lighthouserc.js（@lhci/cli、2026 年時点）
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start",
      url: ["http://localhost:3000/", "http://localhost:3000/products/42"],
      numberOfRuns: 5,               // ばらつき対策。中央値で判定される
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "resource-summary:script:size": ["error", { maxNumericValue: 300000 }], // JS 300KB
      },
    },
    upload: { target: "temporary-public-storage" }, // 本番運用では LHCI サーバーを推奨
  },
};
```

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: pull_request
jobs:
  lhci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci && npm run build
      - run: npx @lhci/cli autorun
```

CI ランナーは性能が揺らぐので、**スコアは warn、主要指標は少し余裕を持った値で error** にするなど、誤検知でチームが CI を無視するようにならない設計が大切です。

## 6. 実践：Shop 商品詳細ページの LCP を改善する

ここまでの回の内容を、1 つの改善の流れとして通します。**以下の数値はすべて説明用の例** です。

### ステップ 1：フィールドで問題を確認する

PSI と自前 RUM で、商品詳細ページ（`/products/[id]`）のモバイル LCP の 75 パーセンタイルが **4.0 秒（Poor）** と分かりました。RUM の attribution を集計すると、内訳の平均は次のとおりでした。

```
  TTFB          ■■■■■■■■■■■■        1.2s
  読み込み遅延  ■■■■■■■■■■■         1.1s   ← 目安は <10%。異常に長い
  読み込み時間  ■■■■■■■■■■■■■       1.3s
  描画遅延      ■■■■                 0.4s
                                     合計 4.0s
```

### ステップ 2：ラボで原因を特定する（仮説）

Lighthouse と DevTools Performance パネルで調べると：

- LCP 要素は商品のメイン画像。`loading="lazy"` が付いており、さらに Client Component 内で描画されていた → **読み込み遅延**の原因（[[04_画像とフォントの最適化]]）
- 画像は 2000px の JPEG（820KB） → **読み込み時間**の原因
- HTML は毎回 SSR で、レビュー API（遅い）を待ってから返していた → **TTFB** の原因（[[05_ネットワークと読み込みの最適化]]）
- 巨大なクライアント JS でハイドレーションが重い → **描画遅延**の一因（[[03_JavaScriptとバンドルの最適化]]）

### ステップ 3：1 つずつ改善し、ラボで再計測する

影響が大きく、手間が小さいものから順に、**1 回に 1 つずつ** 変更して Lighthouse（5 回中央値）で確認します。

| ステップ | 施策 | ラボ LCP（中央値） |
|---|---|---|
| 0 | 現状 | 4.6s |
| 1 | LCP 画像の lazy を外し、`fetchPriority="high"`、Server Component で描画 | 3.5s |
| 2 | `next/image` + AVIF + 適切な `sizes`（820KB → 140KB） | 2.8s |
| 3 | 商品情報を ISR 化、レビューは `<Suspense>` でストリーミング | 2.0s |
| 4 | 画像 CDN への `preconnect`、不要な JS の削減 | 1.8s |

### ステップ 4：フィールドで効果を確認し、守る

- リリース後、RUM で LCP p75 を毎日確認（RUM は数日で傾向が見えます。CrUX は 28 日集計なので完全反映まで約 4 週間）
- 例：RUM の LCP p75 が 4.0s → 2.3s（Good）に改善
- Lighthouse CI に `largest-contentful-paint: 2500` のアサーションを追加し、次の機能追加で劣化したら PR の段階で気づけるようにする

この「フィールドで見つける → ラボで原因を探す → 1 つずつ直す → フィールドで確認 → CI で守る」が、フロントエンド性能改善の基本形です。

## よくある誤解・つまずき

- ❌ Lighthouse 100 点を目指すべき
  ✅ スコアはラボでの要約です。目標は **実ユーザーの Core Web Vitals を Good にすること** で、スコアは手段にすぎません。
- ❌ Lighthouse を 1 回測って前回より 5 点下がった → 劣化した
  ✅ 5〜10 点はばらつきの範囲です。複数回の中央値で比べます。
- ❌ CrUX があれば自前の RUM は不要
  ✅ CrUX は Chrome のみ・28 日遅れ・原因情報なしです。デプロイ直後の効果確認や原因の特定には自前 RUM（attribution 付き）が必要です。
- ❌ 自分の PC の DevTools で速ければ問題ない
  ✅ 開発用 PC と光回線は実ユーザーの中央値よりはるかに速いです。CPU / ネットワークスロットリングをかけて測ります。

## まとめ

- Lighthouse のスコアは TBT・LCP・CLS・FCP・Speed Index の加重平均。INP は含まない
- 既定はシミュレーションによるスロットリング。ばらつくので複数回の中央値で判断
- PSI で CrUX（合否）と Lighthouse（診断）を同時に見る。詳細調査は WebPageTest / DevTools
- `web-vitals/attribution` で RUM を集めると、実ユーザーで「どこが遅いか」まで分かる
- RUM（実際の体験）と合成監視（固定条件での変化検知）は補完関係
- Lighthouse CI でバジェットを PR ごとに守り、改善を後戻りさせない

## 確認クイズ

1. Lighthouse のパフォーマンススコアは 95 点なのに、PSI 上部の「実際のユーザーの環境で評価する」では INP が Poor です。矛盾していますか？
> [!tip]- 答え
> 矛盾していません。Lighthouse のスコアに INP は含まれず（ラボでは人が操作しないため）、読み込み後の操作が重いページは TBT に表れないこともあります。RUM の INP attribution で、どの操作のどの段階（入力遅延・処理・表示遅延）が遅いかを調べます。

2. RUM で LCP を送る際、`navigator.sendBeacon` を使うのはなぜですか？
> [!tip]- 答え
> CLS や INP などはページを離れる直前（`visibilitychange` で hidden になったとき）に最終値が報告されることがあり、通常の `fetch` はページの破棄とともにキャンセルされる可能性があるからです。`sendBeacon`（または `fetch` の `keepalive: true`）はページが閉じられても送信を完了させます。

3. Lighthouse CI を導入したところ、コード変更のない PR でもときどき失敗します。どう対処しますか？
> [!tip]- 答え
> ばらつきが原因と考えられます。`numberOfRuns` を増やして中央値で判定する、閾値に余裕を持たせる、スコアは `warn` にして主要指標だけ `error` にする、CI ランナーの負荷が安定した環境で実行する、などで対処します。

## 関連ノート

- [[01_Core_Web_Vitals]] — 指標の定義と閾値、フィールドとラボの違い
- [[06_パフォーマンス（Lighthouse CI）]] — QA プロセスとしての Lighthouse CI 運用
- [[Performance・Memory（遅さとメモリリークの調査）]] — DevTools での原因調査
- [[01_計測の基本と落とし穴]] — ばらつき、複数回計測、中央値
- [[04_パーセンタイルとヒストグラムの集計]] — RUM データのパーセンタイル集計
- [[01_SLI・SLOの設計]] — Core Web Vitals を SLO にする
- [[03_パフォーマンスを設計で作り込む]] — 計測を前提にしたフロントエンド設計
- [[Webサイトの「遅い」は3種類ある｜Web Vitalsを図で理解する]] — 「手元 100 点なのに実ユーザーは悪い」理由の解説

## 参考

- [Lighthouse performance scoring（Chrome for Developers）](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
- [Lighthouse Throttling（GitHub, GoogleChrome/lighthouse）](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md)
- [Lighthouse Variability（GitHub, GoogleChrome/lighthouse）](https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md)
- [PageSpeed Insights API（Google for Developers）](https://developers.google.com/speed/docs/insights/v5/get-started)
- [Chrome UX Report（Chrome for Developers）](https://developer.chrome.com/docs/crux)
- [WebPageTest documentation](https://docs.webpagetest.org/)
- [web-vitals（GitHub, GoogleChrome/web-vitals）](https://github.com/GoogleChrome/web-vitals)
- [Find slow interactions in the field（web.dev）](https://web.dev/articles/find-slow-interactions-in-the-field)
- [Why lab and field data can be different（web.dev）](https://web.dev/articles/lab-and-field-data-differences)
- [Lighthouse CI（GitHub, GoogleChrome/lighthouse-ci）](https://github.com/GoogleChrome/lighthouse-ci)
- [Lighthouse CI configuration（GitHub）](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md)
