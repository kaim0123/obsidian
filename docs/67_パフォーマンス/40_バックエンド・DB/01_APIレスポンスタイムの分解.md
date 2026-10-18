---
title: APIレスポンスタイムの分解
created: 2026-10-12
tags:
  - パフォーマンス
  - バックエンド
---

# APIレスポンスタイムの分解

[[MOC_パフォーマンス体系|📚 目次]] ｜ [[06_LighthouseとRUMで計測する|← 前へ]] ｜ [[02_DBクエリのチューニング実践|次へ →]]

> [!abstract] この記事で分かること
> - 1 リクエストの時間が「どこで」使われているか（ネットワーク・TLS・LB/Nginx・アプリ・DB・外部 API・シリアライズ）
> - 内訳を測る 3 つの方法（分散トレース、Server-Timing ヘッダー、構造化ログ）
> - 直列の待ちを `Promise.all` で並列化する方法と、外部 API のタイムアウトの付け方
> - ペイロード（返すデータ量）を減らす方法：ページネーション・フィールド選択・圧縮
>
> **前提**：[[02_レイテンシとパーセンタイル]] と [[04_ボトルネックの特定（USE・RED）]] を読んでいると理解しやすいです。

## 1. ひとことで言うと

API が遅いときの調査は、**宅配便の「お届けまでの日数」を分解する**のと同じです。「3 日かかった」だけでは手の打ちようがありません。「集荷に 1 日、仕分けセンターで 1.5 日、配達に 0.5 日」と分かって初めて、「仕分けセンターを何とかしよう」と決められます。

- API の「2 秒」も、ネットワーク・アプリ・DB・外部 API などの**足し算**（と一部の重なり）でできている
- まず**内訳を測る**。勘で「DB が遅いはず」と決め打ちしない
- 一番大きい項目から手を付ける（[[04_最適化の進め方とトレードオフ]] のアムダールの法則）

## 2. 1 リクエストの時間の内訳

Shop の商品一覧 API（`GET /api/products`）を例に、ブラウザがリクエストを出してからレスポンスを受け取るまでを並べます。

```
ブラウザ
  │ ① DNS 解決            （初回のみ。数 ms〜数十 ms）
  │ ② TCP 接続            （1 往復 = 1 RTT）
  │ ③ TLS ハンドシェイク  （TLS 1.3 で 1 RTT。再接続なら 0〜1 RTT）
  ▼
ロードバランサー（LB）
  ▼
Nginx（リバースプロキシ）  ④ 転送・圧縮・バッファリング
  ▼
Shop API（Node.js）
  │ ⑤ ミドルウェア（認証・ログ・ボディ解析）
  │ ⑥ ビジネスロジック
  │ ⑦ DB クエリ（PostgreSQL） ← 往復 × 回数
  │ ⑧ Redis
  │ ⑨ 外部 API（在庫サービス・レコメンドなど）
  │ ⑩ シリアライズ（JSON.stringify）
  ▼
⑪ レスポンス転送（サイズ ÷ 帯域 + RTT）
```

| 区間 | 何に時間がかかるか | 主な測り方 |
|---|---|---|
| ①〜③ ネットワーク・TLS | 往復遅延（RTT：Round Trip Time、1 往復にかかる時間）。距離に比例 | ブラウザ DevTools の Timing タブ、RUM |
| ④ LB / Nginx | 通常は 1ms 未満。上流待ちのキューイングで伸びることがある | Nginx の `$request_time` と `$upstream_response_time` の差 |
| ⑤⑥ アプリ処理 | CPU 計算、イベントループの詰まり | プロファイラ（[[05_プロファイリング]]）、スパン |
| ⑦ DB | クエリ自体の時間 + **往復回数** + コネクション待ち | スパン、`pg_stat_statements` |
| ⑨ 外部 API | 相手の遅さがそのまま乗る。p99 が特に悪い | スパン、HTTP クライアントのログ |
| ⑩ シリアライズ | 大きな配列の JSON 化は意外に重い（同期処理） | プロファイラ |
| ⑪ 転送 | レスポンスが大きいほど長い。モバイル回線で顕著 | DevTools の Content Download |

> [!tip] Nginx のログで「アプリの外」と「中」を切り分ける
> Nginx の `$request_time` はクライアントから最初のバイトを読んでからログを書くまでの時間、`$upstream_response_time` は上流（アプリ）からレスポンスを受け取り終えるまでの時間です。両者の差が大きいなら、遅いのはアプリではなく**クライアントへの送信**（遅い回線・大きなレスポンス）側です。
> ```nginx
> log_format timing '$remote_addr "$request" $status $body_bytes_sent '
>                   'rt=$request_time urt=$upstream_response_time';
> access_log /var/log/nginx/access.log timing;
> ```

## 3. 内訳の測り方

### 3.1 分散トレース（スパン）

**分散トレース（Distributed Tracing）**：1 つのリクエストが通った処理を、**スパン（Span：開始時刻と終了時刻を持つ 1 区間）**の木として記録する仕組みです。OpenTelemetry（オープンテレメトリー、計装の標準規格）を入れると、HTTP・PostgreSQL・Redis などのスパンが自動で取れます。

```
GET /api/products                       ████████████████████████████████ 2000ms
├─ middleware: auth                     █                                  40ms
├─ pg: SELECT products ...              ██████                            380ms
├─ pg: SELECT stock WHERE product_id=1   ▏                                 12ms
├─ pg: SELECT stock WHERE product_id=2    ▏                                12ms
│   ...（× 50 回）                        ████████████                    600ms
├─ http: GET recommend-service                         ██████████████     800ms
└─ serialize                                                         █    120ms
```

この「ウォーターフォール（滝のような段々の図）」を見ると、**何が直列に並んでいるか**、**同じクエリが何十回も出ていないか**（[[03_N+1問題の発見と解決|N+1]]）が一目で分かります。トレースの仕組み自体は [[MOC_可観測性体系]] で扱います。

自動計装でカバーされない区間は、手動でスパンを作ります。

```ts
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("shop-api");

export async function buildProductList(ids: number[]) {
  return tracer.startActiveSpan("buildProductList", async (span) => {
    try {
      span.setAttribute("product.count", ids.length);
      return await doBuild(ids);
    } finally {
      span.end(); // 必ず end する（しないと記録されない）
    }
  });
}
```

### 3.2 Server-Timing ヘッダー

**Server-Timing**：サーバー側の処理時間の内訳をレスポンスヘッダーで返す標準ヘッダーです。Chrome などの DevTools の Network → Timing タブにそのまま表示され、トレース基盤がない環境でもすぐ使えます。

```http
Server-Timing: db;dur=380;desc="PostgreSQL", ext;dur=800;desc="recommend", app;dur=160
```

Express での最小実装例です。

```ts
import express, { Request, Response, NextFunction } from "express";

// リクエストごとに計測結果をためる
function serverTiming(req: Request, res: Response, next: NextFunction) {
  const marks: string[] = [];
  res.locals.time = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      marks.push(`${name};dur=${(performance.now() - start).toFixed(1)}`);
    }
  };
  // ヘッダーはボディ送信前に書く必要があるので、writeHead をフックする
  const origWriteHead = res.writeHead.bind(res);
  res.writeHead = ((...args: Parameters<typeof res.writeHead>) => {
    if (marks.length) res.setHeader("Server-Timing", marks.join(", "));
    return origWriteHead(...args);
  }) as typeof res.writeHead;
  next();
}

const app = express();
app.use(serverTiming);

app.get("/api/products", async (req, res) => {
  const t = res.locals.time;
  const products = await t("db", () => db.query("SELECT id, name, price FROM products LIMIT 20"));
  const recs = await t("ext", () => fetchRecommend(req.query.userId as string));
  res.json({ products: products.rows, recs });
});
```

> [!warning] 本番で誰にでも返さない
> Server-Timing は内部構成（DB を何回叩いているか等）を外部に見せることになります。MDN でも、送る指標と相手（認証済みユーザーだけ等）を選ぶよう注意されています。社内ユーザーやデバッグ用ヘッダー付きのリクエストに限定するのが無難です。また別オリジンの JS から `PerformanceServerTiming` で読むには `Timing-Allow-Origin` ヘッダーが必要です。

### 3.3 ログに所要時間を出す

トレースが重い環境でも、**構造化ログ（JSON 形式のログ）に区間ごとの時間を出す**だけで多くが分かります。

```ts
logger.info({
  route: "GET /api/products",
  status: 200,
  total_ms: 1980,
  db_ms: 980,
  db_queries: 51,   // ← クエリ数も出すと N+1 が見える
  ext_ms: 800,
  bytes: 412_000,
});
```

ログを集計基盤で `p99(total_ms)` と `p99(db_ms)` のように並べれば、「p99 が悪いリクエストでは何が伸びているか」が分かります。平均ではなくパーセンタイルで見ることは [[04_パーセンタイルとヒストグラムの集計]] を参照してください。

## 4. 直列の待ちを並列化する

### 4.1 直列と並列の違い

互いに依存しない I/O（DB・外部 API）を 1 つずつ `await` すると、待ち時間が**足し算**になります。並列にすれば**一番遅いものの時間**で済みます。

```
直列（await を順に書く）
  products ████████ 400ms
  reviews          ██████ 300ms
  recommend              ████████████████ 800ms
  合計 ≈ 1500ms

並列（Promise.all）
  products ████████ 400ms
  reviews  ██████ 300ms
  recommend████████████████ 800ms
  合計 ≈ 800ms（最も遅いものに律速される）
```

```ts
// ❌ Before：依存関係がないのに直列
const products = await getProducts(categoryId);
const reviews = await getReviewSummary(categoryId);
const recs = await getRecommendations(userId);

// ✅ After：同時に投げて、全部そろうのを待つ
const [products, reviews, recs] = await Promise.all([
  getProducts(categoryId),
  getReviewSummary(categoryId),
  getRecommendations(userId),
]);
```

`Promise.all` は 1 つでも失敗すると全体が失敗します。レコメンドのように「なくても画面は出せる」ものは `Promise.allSettled` で失敗を許容し、空配列で代替します。

> [!note] 並列化は「相手」の負荷を増やす
> 並列化は待ち時間を減らしますが、DB の同時接続数や外部 API への同時リクエスト数を増やします。コネクションプールの上限（[[01_アプリケーションサーバーとは]]）を超えると、今度はプール待ちが発生して逆に遅くなります。ループの中で何百件も `Promise.all` するときは同時実行数を制限します（[[05_非同期化とキューで待ち時間を隠す]]）。

### 4.2 外部 API にはタイムアウトを必ず付ける

外部 API の p99 は自分では制御できません。**タイムアウトがないと、相手が遅いときに自分の p99 も道連れになり**、さらにリクエストがたまってワーカーやコネクションを食い尽くします。

```ts
// Node.js 18 以降の fetch + AbortSignal.timeout（2026 年時点の標準的な書き方）
async function getRecommendations(userId: string): Promise<Product[]> {
  try {
    const res = await fetch(`${RECOMMEND_URL}/users/${userId}`, {
      signal: AbortSignal.timeout(300), // 300ms で打ち切る
    });
    if (!res.ok) return [];
    return (await res.json()) as Product[];
  } catch {
    // タイムアウト・接続失敗時は「なし」で返す（劣化運転）
    return [];
  }
}
```

タイムアウト値は「相手の p99 を少し超える程度」かつ「自分の SLO（[[01_SLI・SLOの設計]]）の予算内」で決めます。再試行を付ける場合は、再試行込みの合計が予算内に収まるようにします。

## 5. ペイロードサイズを減らす

レスポンスが大きいと、**シリアライズ（JSON 化）・転送・ブラウザ側のパース**の 3 か所で時間を食います。

| 方法 | 内容 | 効果 |
|---|---|---|
| ページネーション | 1 回に返す件数を制限（`limit=20`） | DB・シリアライズ・転送すべてが減る |
| フィールド選択 | 一覧に不要な列（`description` 全文など）を返さない。`?fields=id,name,price` や GraphQL | 1 件あたりのサイズが減る |
| 圧縮 | gzip / Brotli（Nginx・CDN で）。JSON は数分の 1 になることが多い | 転送時間が減る（CPU は少し使う） |

圧縮の設定は [[06_HTTPキャッシュと圧縮]]、ページネーションの SQL（OFFSET の罠）は [[02_DBクエリのチューニング実践]] で扱います。

```bash
# 圧縮の有無とサイズ・時間を確認する
curl -s -o /dev/null -H 'Accept-Encoding: br, gzip' \
  -w 'size=%{size_download}B ttfb=%{time_starttransfer}s total=%{time_total}s\n' \
  https://shop.example.com/api/products
```

## 6. 分解の実例：商品一覧 API の p99 2 秒（例）

> [!example] 以下の数値はすべて説明用の例です
> 実際の値は環境で大きく変わります。手順と考え方を追ってください。

**症状**：`GET /api/products` の p99 が 2 秒（目標は 300ms）。

**ステップ 1：遅いリクエストのトレースを見る**（p50 ではなく p99 付近のものを選ぶ）

| 区間 | p99 リクエストでの時間（例） | 気づき |
|---|---|---|
| ネットワーク・TLS・Nginx | 60ms | 小さい。後回し |
| 認証ミドルウェア | 40ms | 毎回ユーザーを DB から引いている |
| 商品取得 SQL | 380ms | `OFFSET 2000` の深いページで遅い |
| 在庫取得 SQL × 50 回 | 600ms | **N+1** |
| レコメンド API | 800ms | 直列実行・タイムアウトなし |
| JSON シリアライズ | 120ms | 説明文全文を含めて 400KB |
| 合計 | 2000ms | |

**ステップ 2：大きい順に仮説を立てて直す**

1. レコメンド API：商品取得と並列化 + タイムアウト 300ms → クリティカルパスから外れる
2. 在庫 N+1：`WHERE product_id = ANY($1)` で 1 回にまとめる → 600ms → 15ms
3. 商品 SQL：キーセットページネーション + 列の絞り込み → 380ms → 20ms
4. ペイロード：一覧から `description` を除外 → 400KB → 40KB、シリアライズ 120ms → 15ms

**ステップ 3：再計測する**

```
Before  ████████████████████████████████████████ 2000ms
After   ██████ 約 320ms（並列化により「DB 系」と「レコメンド 300ms」の長い方 + α）
```

まだ目標の 300ms を少し超えるので、次はレコメンドをキャッシュする（[[04_キャッシュで応答を速くする]]）か、画面側で後から非同期に読み込む（[[05_非同期化とキューで待ち時間を隠す]]）かを検討します。このように**直すたびに内訳が変わる**ので、毎回測り直すことが大切です。

## よくある誤解・つまずき

- ❌ 遅い API はまず DB を疑えばよい → ✅ 外部 API、直列の await、シリアライズ、ネットワークのことも多いです。必ず内訳を測ってから決めます。
- ❌ 平均レスポンスタイムが 200ms なら問題ない → ✅ p99 が 2 秒なら 100 回に 1 回は 2 秒待たされています。遅いリクエストのトレースを個別に見ます。
- ❌ `Promise.all` にすれば何でも速くなる → ✅ 依存関係がある処理は並列化できませんし、同時実行数が増えて DB や外部 API を詰まらせることがあります。
- ❌ サーバーの処理時間 = ユーザーの待ち時間 → ✅ ユーザーには TLS や転送時間も乗ります。Nginx の `$request_time` と `$upstream_response_time`、ブラウザの Timing も合わせて見ます。
- ❌ タイムアウトは長めにしておけば安全 → ✅ 長すぎるタイムアウトは「遅い相手に付き合って自分も詰まる」原因になります。

## まとめ

- API の応答時間は、ネットワーク・Nginx・アプリ・DB・外部 API・シリアライズ・転送の足し算でできている
- 内訳は分散トレース（スパン）、Server-Timing ヘッダー、構造化ログで測る。クエリ数も一緒に記録する
- 依存しない I/O は `Promise.all` で並列化すると「合計」が「最大」になる
- 外部 API には必ずタイムアウトと、失敗時の代替（劣化運転）を用意する
- ペイロードはページネーション・フィールド選択・圧縮で減らす
- 直すたびに内訳が変わるので、毎回再計測して次の一番大きい項目に進む

## 確認クイズ

1. 3 つの独立した処理（200ms・300ms・500ms）を直列に `await` すると約何 ms、`Promise.all` にすると約何 ms になりますか。
> [!tip]- 答え
> 直列は足し算で約 1000ms、並列は最も遅いものに律速されて約 500ms です。ただし並列化で DB や外部 API の同時負荷は増えます。

2. Nginx のログで `request_time=1.8` `upstream_response_time=0.2` でした。どこが遅いと考えられますか。
> [!tip]- 答え
> アプリ（上流）は 0.2 秒で応答しているので、残りの約 1.6 秒はクライアントとの通信側です。レスポンスが大きい、クライアントの回線が遅いなどが疑われます。圧縮やペイロード削減を検討します。

3. 外部 API にタイムアウトを付けないと、相手が遅くなったときに何が起きますか。
> [!tip]- 答え
> 自分の API の応答も相手と同じだけ遅くなり、待っているリクエストがワーカーやコネクションを占有し続けるため、外部 API と無関係なリクエストまで詰まる可能性があります。

## 関連ノート

- [[02_DBクエリのチューニング実践]] — 次回。分解で見つかった遅いクエリの直し方
- [[03_N+1問題の発見と解決]] — トレースに同じクエリが並ぶときの対処
- [[04_ボトルネックの特定（USE・RED）]] — どのリソースがボトルネックかを見つける考え方
- [[05_プロファイリング]] — アプリ内の CPU 時間の内訳を見る
- [[MOC_可観測性体系]] — 分散トレース・ログ・メトリクスの仕組み
- [[02_REDメソッドとUSEメソッド]] — API の Rate・Errors・Duration の見方
- [[06_HTTPキャッシュと圧縮]] — gzip / Brotli の設定
- [[01_アプリケーションサーバーとは]] — コネクションプールと同時実行数

## 参考

- [MDN: Server-Timing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Server-Timing)
- [W3C: Server Timing](https://www.w3.org/TR/server-timing/)
- [OpenTelemetry: Traces](https://opentelemetry.io/docs/concepts/signals/traces/)
- [Node.js docs: AbortSignal.timeout()](https://nodejs.org/api/globals.html#static-method-abortsignaltimeoutdelay)
- [MDN: Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [NGINX: ngx_http_upstream_module（$upstream_response_time）](https://nginx.org/en/docs/http/ngx_http_upstream_module.html#var_upstream_response_time)
