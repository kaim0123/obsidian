# OpenTelemetry入門

**OpenTelemetry（OTel）** は、トレース・メトリクス・ログを**ベンダーに依存しない形で作って送る**ための標準仕様と実装のセットです。CNCF のプロジェクトで、2019 年に OpenTracing と OpenCensus が統合して生まれました。以前は「Datadog のエージェント」「New Relic のエージェント」と製品ごとに計装を書き換える必要がありましたが、OTel で計装しておけば、**送り先を設定で切り替えるだけ**で済みます。この章では、OTel を構成する部品と用語を整理します。

---

## 1. OpenTelemetry が決めていること・決めていないこと

| 決めていること | 決めていないこと |
|----------------|------------------|
| シグナルのデータモデル（スパン・メトリクス・ログレコードの形） | データの**保存**と**表示**（それは Jaeger・Prometheus・Grafana・各 SaaS の仕事） |
| 計装のための API と SDK（言語ごと） | アラートやダッシュボードの作り方 |
| 送信プロトコル **OTLP** | |
| 属性の名前（**セマンティック規約**） | |
| データを中継・加工する **Collector** | |

つまり OTel は「**作る・運ぶ**」までを担当し、「**溜める・見る**」はバックエンドに任せます。

---

## 2. 全体の構成

```
┌──────────── アプリケーション ────────────┐
│  あなたのコード / ライブラリ               │
│        │ OTel API を呼ぶ                   │
│  ┌─────▼─────────────────────────────┐   │
│  │ OTel SDK                           │   │
│  │  Sampler → SpanProcessor → Exporter│   │
│  │  MeterProvider / LoggerProvider    │   │
│  └─────┬─────────────────────────────┘   │
└────────┼─────────────────────────────────┘
         │ OTLP (gRPC :4317 / HTTP :4318)
   ┌─────▼──────┐
   │ Collector  │  受信 → 加工 → 送信
   └─────┬──────┘
         ├──▶ Jaeger / Tempo（トレース）
         ├──▶ Prometheus / Mimir（メトリクス）
         └──▶ Loki / Elasticsearch（ログ）
```

---

## 3. 主要な部品

| 部品 | 役割 | 補足 |
|------|------|------|
| **API** | `tracer.startSpan()` などの計装用インターフェース | SDK がなくても呼べる（何もしない no-op になる）。ライブラリ作者は **API だけに依存**する |
| **SDK** | API の実装。サンプリング・バッファリング・送信を行う | アプリの起動時に 1 回だけ設定する |
| **Instrumentation Library** | Express・pg・Redis などの既存ライブラリを自動で計装するプラグイン | [[02_自動計装と手動計装]] |
| **Exporter** | SDK から外へ送る部品 | OTLP exporter が標準。Console exporter はデバッグ用 |
| **OTLP** | OpenTelemetry Protocol。Protobuf ベースの送信形式 | gRPC（4317 番）と HTTP（4318 番） |
| **Collector** | 受信・加工・送信を行う独立したプロセス | [[03_OTel_Collector]] |
| **Resource** | 「このテレメトリはどこから来たか」を表す属性の集まり | `service.name` など。3 シグナルすべてに付く |
| **Propagator** | コンテキストをプロセス間で運ぶ | [[02_トレースコンテキストの伝播]] |

**API と SDK が分かれている理由**：ライブラリ（例：ORM）が API で計装しておけば、アプリ側が SDK を入れたときだけ有効になります。SDK を入れていないアプリでは何のコストも発生しません。

---

## 4. シグナルごとの状況（2026 年時点）

| シグナル | 仕様 | JavaScript SDK | 補足 |
|----------|------|----------------|------|
| トレース | Stable | Stable | 最も成熟している |
| メトリクス | Stable | Stable | Counter / UpDownCounter / Histogram / Gauge |
| ログ | Stable（データモデル・OTLP） | 実装が進行中 | 既存のロガー（pino・winston）を **Log Bridge** でつなぐ方式。自分で OTel Logs API を直接呼ぶ設計ではない |
| プロファイル | 開発中 | — | 4 つ目のシグナルとして策定中 |

> 各言語の成熟度は OpenTelemetry 公式ドキュメント（opentelemetry.io/docs/languages）の Status 表で確認できます。バージョンの上がり方が速いので、ブログ記事より公式ドキュメントを優先します。

---

## 5. Resource とセマンティック規約

**Resource** は、すべてのテレメトリに付く「発生源」の情報です。

| 属性 | 例 | 設定方法 |
|------|----|----------|
| `service.name` | `checkout-api` | **必須**。`OTEL_SERVICE_NAME` 環境変数 |
| `service.version` | `1.8.2` | デプロイ時に埋め込む。リリース前後の比較に使う |
| `deployment.environment.name` | `production` | `OTEL_RESOURCE_ATTRIBUTES` |
| `host.name`、`k8s.pod.name`、`cloud.region` | | Resource Detector が自動で検出 |

```bash
OTEL_SERVICE_NAME=checkout-api
OTEL_RESOURCE_ATTRIBUTES=service.version=1.8.2,deployment.environment.name=production
```

**セマンティック規約（Semantic Conventions）** は、属性名の辞書です。

| 分野 | 属性の例 |
|------|----------|
| HTTP | `http.request.method`、`http.route`、`http.response.status_code`、`url.full` |
| DB | `db.system.name`、`db.namespace`、`db.query.text`、`db.operation.name` |
| メッセージング | `messaging.system`、`messaging.destination.name`、`messaging.operation.type` |
| 例外 | `exception.type`、`exception.message`、`exception.stacktrace` |

- 名前を規約に合わせると、バックエンドが「HTTP サーバーのスパン」と認識して RED メトリクスを自動生成したり、DB のスロークエリ一覧を出したりできます。
- 規約は改訂されることがあります（例：`http.method` → `http.request.method`）。古い計装ライブラリと新しいものが混在すると属性名がそろわないので、**バージョンを定期的に上げる**ことが大切です。
- 自分の業務属性は `app.` や会社名の接頭辞を付けて、規約の名前と衝突しないようにします（例：`app.cart.item_count`）。

---

## 6. 環境変数による設定

OTel の SDK は、言語をまたいで**共通の環境変数**で設定できます。コードを変えずに送り先やサンプリングを変えられるのが利点です。

| 環境変数 | 意味 | 例 |
|----------|------|----|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | 送信先 | `http://otel-collector:4318` |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | プロトコル | `http/protobuf` / `grpc` |
| `OTEL_TRACES_SAMPLER` / `_ARG` | サンプリング | `parentbased_traceidratio` / `0.1` |
| `OTEL_PROPAGATORS` | プロパゲーター | `tracecontext,baggage` |
| `OTEL_TRACES_EXPORTER` / `OTEL_METRICS_EXPORTER` / `OTEL_LOGS_EXPORTER` | 送信方式 | `otlp` / `console` / `none` |

---

## 7. 導入するときの判断

| 状況 | おすすめ |
|------|----------|
| 新規にサービスを作る | 最初から OTel SDK + 自動計装。送り先は後で決めてよい |
| すでにベンダーのエージェントを使っている | ベンダーの多くは OTLP の受信に対応している。新しいサービスから OTel に寄せる |
| 小規模・1 サービスだけ | Collector を置かず、アプリから直接バックエンドへ OTLP で送ってもよい |
| 複数サービス・複数バックエンド | Collector を必ず置く（送信先の切り替え・サンプリング・秘密情報の除去を一箇所で） |

---

## 8. 関連項目

- [[02_自動計装と手動計装]]：計装の 2 つのやり方
- [[03_OTel_Collector]]：データの中継と加工
- [[04_Node.jsアプリの計装例]]：実際のセットアップ
- [[01_分散トレースとは]]：OTel で作るトレースの中身
- [[04_ログ・メトリクス・トレースの相関]]：Resource で 3 シグナルをつなぐ
- [[04_可観測性ツールの比較と選び方]]：OTLP を受け取るバックエンドの選び方

---

**前へ** ← [[04_ログ・メトリクス・トレースの相関]]　｜　**次に読む** → [[02_自動計装と手動計装]]
