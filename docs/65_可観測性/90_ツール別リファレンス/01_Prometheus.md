# Prometheus

**Prometheus** は、メトリクスを収集・保存し、クエリ言語 **PromQL** で集計し、アラートを出すためのオープンソースの監視システムです。CNCF の卒業プロジェクトで、Kubernetes 環境のメトリクス監視では事実上の標準になっています。この章では、Prometheus の仕組み・PromQL の基本・Alertmanager・長期保存の選択肢をまとめます（Prometheus 公式ドキュメントが下敷き）。

---

## 1. 全体構成

```
[アプリ /metrics] ─┐
[node_exporter]  ──┼─ pull（scrape）→ [Prometheus サーバー] → [TSDB（ローカルディスク）]
[DB の exporter] ─┘                          │
                                              ├─ アラートルール評価 → [Alertmanager] → PagerDuty / Slack
                                              ├─ PromQL ← [Grafana]
                                              └─ remote_write → [Thanos / Mimir など長期保存]
```

| 部品 | 役割 |
|------|------|
| **Prometheus サーバー** | 定期的に各ターゲットの `/metrics` を取りに行き（scrape）、時系列 DB に保存する |
| **exporter** | Prometheus 形式でメトリクスを出せないもの（OS・DB・ミドルウェア）の代わりに出す |
| **クライアントライブラリ** | アプリにメトリクスを埋め込む（Node.js なら `prom-client`、または OpenTelemetry） |
| **Alertmanager** | アラートのグルーピング・抑制・通知先への振り分け |
| **Pushgateway** | 短命なバッチジョブ用。ジョブが終わる前にメトリクスを置いていく |

---

## 2. pull 型であること

Prometheus は**自分から取りに行く（pull）**方式です。

| 特徴 | 意味 |
|------|------|
| ターゲットが落ちたらすぐわかる | scrape に失敗すると `up == 0` になる |
| 監視対象は Prometheus 側で管理 | Kubernetes のサービスディスカバリで自動的に見つける |
| 短命なジョブは苦手 | scrape の前に終わると取りこぼす → Pushgateway か OTel を使う |
| ファイアウォール越しは苦手 | 外から取りに行けない環境では remote_write や Agent モードを使う |

```yaml
# prometheus.yml（最小構成）
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: api
    static_configs:
      - targets: ["api:3000"]
rule_files:
  - "rules/*.yml"
alerting:
  alertmanagers:
    - static_configs:
        - targets: ["alertmanager:9093"]
```

---

## 3. データモデル

時系列は「**メトリクス名 + ラベルの組**」で一意に決まります。

```
http_requests_total{method="GET", route="/products", code="200"}  15321
```

- ラベルの値の組み合わせごとに別の時系列になる。**ユーザー ID やリクエスト ID をラベルにしてはいけない**（[[03_カーディナリティ問題]]）
- メトリクスの型（Counter・Gauge・Histogram・Summary）は [[01_メトリクスの種類（カウンタ・ゲージ・ヒストグラム）]] を参照

---

## 4. PromQL の基本

| やりたいこと | PromQL |
|--------------|--------|
| 秒間リクエスト数 | `rate(http_requests_total[5m])` |
| サービス全体の合計 | `sum(rate(http_requests_total[5m]))` |
| エンドポイント別 | `sum by (route) (rate(http_requests_total[5m]))` |
| エラー率 | `sum(rate(http_requests_total{code=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))` |
| p99 レイテンシ | `histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))` |
| 1 時間で増えた件数 | `increase(http_requests_total[1h])` |
| 落ちているターゲット | `up == 0` |
| 4 時間後の予測 | `predict_linear(node_filesystem_avail_bytes[6h], 4*3600)` |

- **Counter には必ず `rate` か `increase` をかけてから `sum` する**（順序を逆にすると、再起動によるリセットを正しく扱えない）
- `rate` の範囲は scrape 間隔の 4 倍以上にする（15 秒間隔なら `[1m]` 以上）

---

## 5. 記録ルールとアラートルール

```yaml
groups:
  - name: api
    rules:
      # 記録ルール：重いクエリを事前に計算して新しい時系列として保存
      - record: job:http_requests:rate5m
        expr: sum by (job) (rate(http_requests_total[5m]))

      # アラートルール
      - alert: TargetDown
        expr: up == 0
        for: 5m
        labels:
          severity: page
        annotations:
          summary: "{{ $labels.job }} の {{ $labels.instance }} が応答しません"
```

- 記録ルールの名前は `level:metric:operations` の形にするのが慣例（公式ドキュメント）
- `for:` は条件が続いた時間。一瞬のスパイクで鳴らないようにする
- SLO のアラートは [[03_バーンレートアラート]]、Alertmanager の設定は [[04_アラート設計の原則]] を参照

---

## 6. 長期保存とスケール

単体の Prometheus は **1 台のローカルディスク**に保存するので、保存期間（既定 15 日）と冗長性に限界があります。

| 選択肢 | 特徴 |
|--------|------|
| **Thanos** | 既存の Prometheus の横にサイドカーを置き、オブジェクトストレージ（S3 など）に保存。複数 Prometheus を横断クエリ |
| **Grafana Mimir** | remote_write で受け取る水平スケール型。マルチテナント対応 |
| **VictoriaMetrics** | 高圧縮・省メモリ。単体でも使える |
| **マネージド** | Amazon Managed Service for Prometheus、Grafana Cloud など |

- **remote_write**：Prometheus が収集したデータを外部ストレージに送る仕組み
- **Agent モード**：Prometheus をローカル保存なしの「収集して送るだけ」にするモード。エッジやクラスタごとに置く

---

## 7. つまずきやすい点

- **ラベルの爆発**でメモリが足りなくなる → `prometheus_tsdb_head_series` を監視する
- **平均だけ見てしまう** → レイテンシはヒストグラムで分布を見る（[[04_パーセンタイルとヒストグラムの集計]]）
- **Summary を集計しようとする** → Summary の分位数は複数インスタンスで合算できない。集計するなら Histogram
- **高可用性** → 同じ設定の Prometheus を 2 台動かし、Alertmanager 側で重複を除去するのが基本

---

## 8. 関連項目

- [[01_メトリクスの種類（カウンタ・ゲージ・ヒストグラム）]]：メトリクスの型
- [[03_カーディナリティ問題]]：ラベル設計の注意点
- [[02_Grafana]]：Prometheus のデータを可視化する
- [[03_OTel_Collector]]：OpenTelemetry から Prometheus へ送る
- [[04_アラート設計の原則]]：Alertmanager の振り分け

---

**前へ** ← [[05_ダッシュボード設計]]　｜　**次に読む** → [[02_Grafana]]
