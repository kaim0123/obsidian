# Node.jsアプリの計装例

ここまでの内容を、**Express + pino の Node.js アプリ**に実際に組み込んでみます。アプリは OpenTelemetry SDK で OTLP を Collector に送り、Collector がトレースを Jaeger（または Tempo）へ、メトリクスを Prometheus へ、ログを標準出力と Loki へ流します。この章は手を動かしながら読む前提の、ひとまとまりの構成例です。

---

## 1. 全体構成

```
┌──────── docker compose ────────────────────────────────────────┐
│                                                                 │
│  [order-api (Express)] ──OTLP/HTTP :4318──▶ [otel-collector]    │
│        ▲ pino ログ（trace_id 付き）            │                 │
│        │                                      ├─▶ [jaeger] :16686│
│   curl / ブラウザ                             ├─▶ [prometheus] :9090
│                                               └─▶ debug（標準出力）│
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. パッケージ

```bash
npm install express pino
npm install @opentelemetry/api \
  @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/exporter-metrics-otlp-http \
  @opentelemetry/sdk-metrics \
  @opentelemetry/resources \
  @opentelemetry/semantic-conventions
```

> パッケージ名と API は OpenTelemetry JS の公式ドキュメント（opentelemetry.io/docs/languages/js）で最新版を確認します。SDK 2.x 系では Resource の作り方が `resourceFromAttributes()` に変わるなど、1.x の記事の書き方がそのまま動かないことがあります。

---

## 3. SDK の初期化ファイル

```ts
// src/instrumentation.ts  ← アプリより先に読み込む
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME ?? 'order-api',
    [ATTR_SERVICE_VERSION]: process.env.APP_VERSION ?? 'dev',
  }),
  // エンドポイントは OTEL_EXPORTER_OTLP_ENDPOINT 環境変数から読まれる
  traceExporter: new OTLPTraceExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
    exportIntervalMillis: 15_000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (req) => req.url === '/healthz',
      },
      // pino のログに trace_id / span_id を自動で入れる
      '@opentelemetry/instrumentation-pino': { enabled: true },
    }),
  ],
});

sdk.start();

// 終了時に溜まっているデータを送り切る
const shutdown = () => sdk.shutdown().finally(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

**ポイント**

- **このファイルはアプリのどの `import` よりも先に実行**されなければなりません。起動コマンドの `--import` で読み込みます（4 章）。
- `sdk.shutdown()` を呼ばないと、プロセス終了直前のスパンがバッファに残ったまま失われます。コンテナの停止（SIGTERM）時に必ず呼びます。

---

## 4. アプリ本体

```ts
// src/app.ts
import express from 'express';
import pino from 'pino';
import { trace, metrics, SpanStatusCode } from '@opentelemetry/api';

const logger = pino();
const tracer = trace.getTracer('order-api');
const meter = metrics.getMeter('order-api');
const ordersPlaced = meter.createCounter('app.orders.placed', { description: '確定した注文数' });

const app = express();
app.use(express.json());

app.get('/healthz', (_req, res) => res.send('ok'));

app.post('/orders', async (req, res) => {
  // 自動計装が作った SERVER スパンに業務属性を足す
  trace.getActiveSpan()?.setAttribute('app.customer.tier', req.body.tier ?? 'standard');

  await tracer.startActiveSpan('order.validate_and_save', async (span) => {
    try {
      if (!req.body.items?.length) throw new Error('items is empty');
      span.setAttribute('app.order.item_count', req.body.items.length);

      await new Promise((r) => setTimeout(r, 50 + Math.random() * 200)); // DB 保存の代わり
      ordersPlaced.add(1, { 'app.customer.tier': req.body.tier ?? 'standard' });

      logger.info({ items: req.body.items.length }, '注文を保存しました'); // trace_id が自動で付く
      res.status(201).json({ ok: true });
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message });
      logger.error({ err }, '注文の保存に失敗しました');
      res.status(400).json({ error: (err as Error).message });
    } finally {
      span.end();
    }
  });
});

app.listen(3000, () => logger.info('listening on :3000'));
```

**起動**

```bash
# ビルド後の JS を想定（tsx を使う場合は --import tsx も並べる）
OTEL_SERVICE_NAME=order-api \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
node --import ./dist/instrumentation.js ./dist/app.js
```

---

## 5. Collector と バックエンド

```yaml
# docker-compose.yaml
services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    command: ["--config=/etc/otelcol/config.yaml"]
    volumes: ["./otel-collector-config.yaml:/etc/otelcol/config.yaml"]
    ports: ["4317:4317", "4318:4318", "8889:8889"]

  jaeger:
    image: jaegertracing/jaeger:latest     # Jaeger v2（OTLP を直接受信できる）
    ports: ["16686:16686"]

  prometheus:
    image: prom/prometheus:latest
    volumes: ["./prometheus.yml:/etc/prometheus/prometheus.yml"]
    ports: ["9090:9090"]
```

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      http: { endpoint: 0.0.0.0:4318 }
      grpc: { endpoint: 0.0.0.0:4317 }

processors:
  memory_limiter: { check_interval: 1s, limit_percentage: 80, spike_limit_percentage: 20 }
  batch: {}

exporters:
  otlp/jaeger:
    endpoint: jaeger:4317
    tls: { insecure: true }
  prometheus:                     # Prometheus がここをスクレイプする
    endpoint: 0.0.0.0:8889
  debug: { verbosity: basic }

service:
  pipelines:
    traces:  { receivers: [otlp], processors: [memory_limiter, batch], exporters: [otlp/jaeger, debug] }
    metrics: { receivers: [otlp], processors: [memory_limiter, batch], exporters: [prometheus] }
```

```yaml
# prometheus.yml
scrape_configs:
  - job_name: otel-collector
    scrape_interval: 15s
    static_configs:
      - targets: ['otel-collector:8889']
```

Tempo を使う場合は `otlp/jaeger` を `otlp/tempo`（`tempo:4317`）に替え、Grafana から Tempo をデータソースとして追加します（[[03_Jaeger・Tempo]]、[[02_Grafana]]）。

---

## 6. 動作確認

```bash
docker compose up -d
curl -X POST localhost:3000/orders -H 'content-type: application/json' -d '{"items":[1,2],"tier":"premium"}'
curl -X POST localhost:3000/orders -H 'content-type: application/json' -d '{"items":[]}'   # わざと失敗
```

| 確認すること | 場所 | 期待する結果 |
|--------------|------|--------------|
| トレースが届いているか | Jaeger UI（localhost:16686）で `order-api` を検索 | `POST /orders` → `order.validate_and_save` の親子。失敗した方は赤く表示 |
| ログに trace_id が入っているか | アプリの標準出力 | `"trace_id":"…","span_id":"…"` が付いている。その ID で Jaeger を検索できる |
| メトリクスが届いているか | Prometheus（localhost:9090）で `app_orders_placed_total` | `app_customer_tier="premium"` のラベル付きで増えている |
| HTTP の RED メトリクス | Prometheus で `http_server_request_duration_seconds_bucket` | 自動計装が作ったヒストグラムがある |
| Collector が受け取っているか | `docker compose logs otel-collector` | debug exporter の出力にスパン数が出る |

---

## 7. よくあるつまずき

| 症状 | 原因 | 対処 |
|------|------|------|
| スパンが 1 つも来ない | `instrumentation.ts` がアプリより後に読まれている | `--import` / `--require` で先に読み込む |
| Express のルート名が出ない（`POST` だけ） | express の計装が効いていない（ESM の読み込み問題が多い） | `--import` を使う。`OTEL_LOG_LEVEL=debug` でどの計装が有効か確認 |
| 手動スパンが HTTP スパンの子にならない | `startSpan` を使っていてアクティブコンテキストが切り替わっていない | `startActiveSpan` を使う |
| 終了直前のデータが欠ける | `sdk.shutdown()` を呼んでいない | SIGTERM ハンドラで呼ぶ |
| ポート 4317 に HTTP で送って失敗 | gRPC と HTTP のポートの取り違え | HTTP exporter は 4318、gRPC は 4317 |

---

## 8. 関連項目

- [[02_自動計装と手動計装]]：ここで使った 2 つの計装の考え方
- [[03_OTel_Collector]]：Collector の設定の詳細
- [[04_ログ・メトリクス・トレースの相関]]：pino の trace_id 注入
- [[01_Prometheus]]、[[03_Jaeger・Tempo]]、[[02_Grafana]]：バックエンドの使い方
- [[01_SLI・SLOの設計]]：ここで取れた HTTP メトリクスから SLI を作る
- 34_Backend/70：アプリのエラー処理・ロギングの書き方
- 53_コンテナ：docker compose の使い方

---

**前へ** ← [[03_OTel_Collector]]　｜　**次に読む** → [[01_SLI・SLOの設計]]
