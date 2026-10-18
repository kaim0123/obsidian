# Jaeger・Tempo

**Jaeger** と **Grafana Tempo** は、どちらも分散トレースを保存・検索・表示するオープンソースのバックエンドです。OpenTelemetry で集めたトレースの送り先として、よく比較されます。この章では、2 つの設計の違いと選び方をまとめます（Jaeger・Grafana Tempo の公式ドキュメントが下敷き）。分散トレースそのものの考え方は [[01_分散トレースとは]] を参照してください。

---

## 1. 共通点

- どちらも **OTLP（OpenTelemetry Protocol）** でトレースを受け取れる。アプリ側は OpenTelemetry で計装しておけば、どちらにも送れる（[[01_OpenTelemetry入門]]）
- **トレース ID** で 1 つのリクエストの全スパンを取り出し、ウォーターフォール（時間軸の図）で表示できる
- 収集は通常 **OTel Collector** を経由させる（[[03_OTel_Collector]]）

```
[アプリ（OTel SDK）] → OTLP → [OTel Collector] → [Jaeger または Tempo] → [UI / Grafana]
```

---

## 2. Jaeger

Uber が開発し、CNCF の卒業プロジェクトになったトレーシングシステムです。

| 項目 | 内容 |
|------|------|
| UI | **専用 UI** を持つ。サービス・操作名・タグ・時間で検索できる |
| ストレージ | Elasticsearch / OpenSearch、Cassandra、Badger（ローカル）、メモリなど |
| 検索 | タグ（属性）で柔軟に検索できる。その分、ストレージにインデックスが必要 |
| 追加機能 | サービス依存関係グラフ、2 つのトレースの比較、SPM（スパンからの RED メトリクス） |
| 現在 | v2 で内部が OpenTelemetry Collector ベースに作り直された |

```bash
# 手元で試す（all-in-one：メモリ保存）
docker run --rm -p 16686:16686 -p 4317:4317 -p 4318:4318 jaegertracing/jaeger:latest
# UI: http://localhost:16686 、OTLP: 4317(gRPC) / 4318(HTTP)
```

---

## 3. Grafana Tempo

Grafana Labs が開発した、**安く大量に保存する**ことを重視したトレースバックエンドです。

| 項目 | 内容 |
|------|------|
| UI | 専用 UI はなく **Grafana** で表示する（[[02_Grafana]]） |
| ストレージ | **オブジェクトストレージ**（S3・GCS・Azure Blob）だけ。DB 不要 |
| 検索 | 基本はトレース ID。属性検索は **TraceQL** で行う（Parquet 形式の列指向ストレージ） |
| 追加機能 | metrics-generator（スパンから RED メトリクスとサービスグラフを作る） |
| 強み | サンプリングを弱めて全件近く保存してもコストが低い |

```traceql
# api サービスで 1 秒以上かかったスパンを含むトレース
{ resource.service.name = "api" && duration > 1s }

# HTTP 500 を返したスパン
{ span.http.response.status_code = 500 }
```

---

## 4. 比較

| 観点 | Jaeger | Tempo |
|------|--------|-------|
| 保存コスト | 検索用インデックスのため高め | オブジェクトストレージのみで安い |
| 運用の手間 | Elasticsearch / Cassandra の運用が必要 | S3 があればよい。ただし分散構成は部品が多い |
| 属性での検索 | 得意 | TraceQL で可能。大量データでは遅くなることも |
| UI | 専用 UI が単体で完結 | Grafana 前提。メトリクス・ログとの行き来が強い |
| 他シグナルとの相関 | 別途設定が必要 | Loki・Mimir と組み合わせやすい |
| 向いている環境 | 既に Elasticsearch がある、単体でトレースを見たい | Grafana を使っている、トレースを大量に保存したい |

---

## 5. 選び方

| 状況 | おすすめ |
|------|----------|
| まず手元で分散トレースを試したい | **Jaeger all-in-one**（1 コマンドで UI まで動く） |
| 本番で Grafana・Prometheus・Loki を使っている | **Tempo**（LGTM で統一） |
| 既に OpenSearch / Elasticsearch を運用している | **Jaeger** |
| 運用したくない | マネージド（Grafana Cloud Traces、AWS X-Ray、Datadog APM など。[[04_可観測性ツールの比較と選び方]]） |

- どちらを選んでも、**アプリの計装は OpenTelemetry にしておく**。バックエンドを乗り換えても Collector の送り先を変えるだけで済む
- サンプリング方針（Head / Tail）は保存コストに直結するので、バックエンド選びと一緒に決める（[[03_サンプリング戦略]]）

---

## 6. 関連項目

- [[01_分散トレースとは]]：トレース・スパンの考え方
- [[03_サンプリング戦略]]：どれだけ保存するか
- [[03_OTel_Collector]]：トレースの経路
- [[02_Grafana]]：Tempo の表示と相関
- [[04_ログ・メトリクス・トレースの相関]]：トレースからログ・メトリクスへ

---

**前へ** ← [[02_Grafana]]　｜　**次に読む** → [[04_可観測性ツールの比較と選び方]]
