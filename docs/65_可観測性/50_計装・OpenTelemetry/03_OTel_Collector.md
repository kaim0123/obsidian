# OTel Collector

**OpenTelemetry Collector** は、アプリから送られたテレメトリを**受け取り、加工し、送り出す**独立したプロセスです。アプリとバックエンドの間に 1 段挟むことで、送り先の切り替え・サンプリング・秘密情報の除去・再送を**アプリのコードを変えずに**行えます。この章では、Collector の構成要素、設定ファイルの書き方、配置パターンを整理します。

---

## 1. なぜ Collector を挟むのか

| Collector なし（アプリ → バックエンド直送） | Collector あり |
|---------------------------------------------|----------------|
| 送り先を変えるたびにアプリを再デプロイ | Collector の設定変更だけ |
| バックエンドが落ちるとアプリ側でデータが失われる・メモリが膨らむ | Collector がバッファ・再送を担当 |
| サンプリングはヘッドのみ | テールサンプリングができる（[[03_サンプリング戦略]]） |
| 個人情報の除去を各アプリで実装 | 一箇所で属性を削除・マスク |
| 各アプリにベンダーの API キーを配る | キーは Collector だけが持つ |

小規模で 1 サービスだけなら直送でも構いませんが、**サービスが 2 つ以上になったら Collector を置く**のが OpenTelemetry 公式ドキュメントの推奨です。

---

## 2. パイプラインの構成要素

```
receivers ──▶ processors ──▶ exporters
(受け取る)     (加工する)      (送り出す)
                    ▲
               connectors（パイプライン同士をつなぐ）
               extensions（ヘルスチェック・認証など、データ経路の外）
```

| 要素 | 役割 | 代表例 |
|------|------|--------|
| **receivers** | データを受け取る | `otlp`（gRPC 4317 / HTTP 4318）、`prometheus`（スクレイプ）、`filelog`（ログファイルの読み取り）、`hostmetrics` |
| **processors** | 加工・間引き・保護 | `memory_limiter`、`batch`、`attributes`、`resource`、`filter`、`tail_sampling`、`k8sattributes` |
| **exporters** | 送り出す | `otlp`（Tempo・Jaeger・SaaS）、`otlphttp`、`prometheusremotewrite`、`debug` |
| **connectors** | あるパイプラインの出力を別のパイプラインの入力にする | `spanmetrics`（トレースから RED メトリクスを作る） |
| **extensions** | 補助機能 | `health_check`、`pprof`、`zpages`、認証 |

---

## 3. 設定ファイルの例

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc: { endpoint: 0.0.0.0:4317 }
      http: { endpoint: 0.0.0.0:4318 }

processors:
  memory_limiter:            # 必ず最初に置く：メモリ逼迫時にデータを捨てて Collector を守る
    check_interval: 1s
    limit_percentage: 80
    spike_limit_percentage: 20
  attributes/scrub:          # 個人情報を消す
    actions:
      - key: user.email
        action: delete
      - key: http.request.header.authorization
        action: delete
  resource:
    attributes:
      - key: deployment.environment.name
        value: production
        action: upsert
  batch:                     # 最後に置く：まとめて送って効率化
    send_batch_size: 8192
    timeout: 5s

exporters:
  otlp/tempo:
    endpoint: tempo:4317
    tls: { insecure: true }
  prometheusremotewrite:
    endpoint: http://prometheus:9090/api/v1/write
  otlphttp/loki:
    endpoint: http://loki:3100/otlp
  debug:
    verbosity: basic

connectors:
  spanmetrics: {}

extensions:
  health_check: {}

service:
  extensions: [health_check]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, attributes/scrub, resource, batch]
      exporters: [otlp/tempo, spanmetrics]
    metrics:
      receivers: [otlp, spanmetrics]
      processors: [memory_limiter, resource, batch]
      exporters: [prometheusremotewrite]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, attributes/scrub, resource, batch]
      exporters: [otlphttp/loki]
```

**書くときの注意**

- `receivers` などに**定義しただけでは動きません**。`service.pipelines` に並べて初めて有効になります。
- **processors は書いた順に実行されます**。`memory_limiter` を最初、`batch` を最後に置くのが公式の推奨順です。
- `type/name` の形（`otlp/tempo`）で、同じ種類のコンポーネントを複数定義できます。
- 設定の検証は `otelcol-contrib validate --config=otel-collector-config.yaml` でできます。

---

## 4. ディストリビューション

| 配布物 | 中身 | 使いどころ |
|--------|------|------------|
| **otelcol**（core） | 基本的なコンポーネントのみ | 最小構成 |
| **otelcol-contrib** | コミュニティ提供のコンポーネントを多数同梱（`tail_sampling`、`k8sattributes`、各 SaaS 向け exporter） | 多くの場合はこれ |
| **otelcol-k8s** | Kubernetes 向けに絞ったもの | k8s 環境 |
| ベンダー版（AWS Distro for OpenTelemetry など） | 特定クラウド向けに調整 | そのクラウドを使う場合 |
| **OCB（OpenTelemetry Collector Builder）** | 必要なコンポーネントだけで自前ビルド | イメージサイズや攻撃面を減らしたい場合 |

---

## 5. 配置パターン：エージェントとゲートウェイ

| パターン | 置き方 | 役割 |
|----------|--------|------|
| **エージェント** | 各ホスト・各 Pod のそば（DaemonSet やサイドカー） | アプリの近くで受け取る。ホストのメトリクス・ログファイルを集める。k8s のメタデータを付ける |
| **ゲートウェイ** | 独立したサービスとして複数台（Deployment + LB） | 全体の集約、テールサンプリング、バックエンドへの送信、API キーの管理 |

```
[App] ─▶ [Agent Collector (DaemonSet)] ─▶ [Gateway Collector ×N] ─▶ バックエンド
            k8sattributes, hostmetrics        tail_sampling, 秘密情報除去
```

- **テールサンプリングをゲートウェイで行う場合**、同じ trace_id のスパンが同じゲートウェイに届く必要があります。前段に `loadbalancing` exporter（trace_id でルーティング）を置いた **2 層構成**にします。
- 小規模なら「アプリ → ゲートウェイ 1 台 → バックエンド」から始め、必要になったらエージェント層を足します。

---

## 6. 運用のポイント

| 項目 | やること |
|------|----------|
| Collector 自身の監視 | Collector は自分のメトリクス（`otelcol_receiver_accepted_spans`、`otelcol_exporter_send_failed_spans`、`otelcol_processor_refused_spans` など）を出す。**送信失敗と拒否**をアラートにする |
| キューと再送 | exporter の `sending_queue` と `retry_on_failure` でバックエンド障害時に一時保持する。永続化が必要なら `file_storage` 拡張 |
| リソース | `memory_limiter` の上限をコンテナのメモリ制限に合わせる。GOMEMLIMIT も設定 |
| バージョン | contrib は更新が速く、設定項目が変わることがある。アップグレード時は CHANGELOG を確認 |
| デバッグ | `debug` exporter を一時的にパイプラインに足すと、受け取ったデータを標準出力で確認できる |

---

## 7. 関連項目

- [[01_OpenTelemetry入門]]：OTel 全体の中での Collector の位置
- [[03_サンプリング戦略]]：tail_sampling プロセッサの設定
- [[04_Node.jsアプリの計装例]]：アプリから Collector へ送る設定
- [[03_ログに書くこと・書かないこと]]：Collector で消すべき情報
- [[01_Prometheus]]、[[03_Jaeger・Tempo]]：送り先のバックエンド
- 64_サーバー・インフラ：Collector をどこで動かすか

---

**前へ** ← [[02_自動計装と手動計装]]　｜　**次に読む** → [[04_Node.jsアプリの計装例]]
