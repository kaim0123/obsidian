# AWS Step Functions 初心者向け解説

## 目次
1. [Step Functionsとは](#step-functionsとは)
2. [主要な概念](#主要な概念)
3. [StandardとExpress](#standardとexpress)
4. [基本的な使い方](#基本的な使い方)
5. [LLM処理での使い方](#llm処理での使い方)
6. [料金体系](#料金体系)
7. [Lambda durable functionsとの使い分け](#lambda-durable-functionsとの使い分け)

## Step Functionsとは

AWS Step Functions は、**複数の処理（Lambda や AWS サービス）を順番・分岐・並列でつなぐワークフローサービス**です。流れを「状態機械（ステートマシン）」として定義し、実行の様子を画面で図として確認できます。

### 従来の問題点
- Lambda から Lambda を呼ぶと、エラー処理やリトライが各所に散らばる
- Lambda 1 つでは 15 分を超える処理ができない
- 途中で失敗したとき、どこまで終わったか分からない

### Step Functions の解決策
- **流れの見える化**: 処理の流れと、各実行の成功・失敗が図で見える
- **リトライ・エラー処理が組み込み**: 指数バックオフや、失敗時の分岐を定義だけで書ける
- **長時間の実行**: Standard ワークフローは最長 1 年
- **AWS サービスと直接つながる**: DynamoDB、SQS、Bedrock などを Lambda なしで呼べる

## 主要な概念

| 用語 | 意味 |
|------|------|
| **ステートマシン** | ワークフロー全体の定義（JSON の Amazon States Language で書く） |
| **ステート** | 1 つの処理単位 |
| **実行（Execution）** | ステートマシンを 1 回動かしたもの |
| **状態遷移** | ステートからステートへ進むこと。料金の単位 |

### 主なステートの種類

| ステート | 役割 |
|---------|------|
| `Task` | Lambda や AWS サービスを呼ぶ |
| `Choice` | 条件で分岐する |
| `Parallel` | 複数の処理を並列で動かす |
| `Map` | 配列の要素ごとに同じ処理をくり返す |
| `Wait` | 指定した時間だけ待つ |
| `Succeed` / `Fail` | 成功 / 失敗で終わる |

### サービス統合のパターン

| パターン | 動き |
|---------|------|
| リクエスト・レスポンス | 呼び出したらすぐ次へ進む |
| ジョブの実行（`.sync`） | 呼び出した処理の **完了を待って** から次へ進む |
| コールバック（`.waitForTaskToken`） | タスクトークンを渡し、**外部から完了の連絡が来るまで待つ**。人の承認待ちに使う |

## StandardとExpress

| 項目 | Standard | Express |
|------|----------|---------|
| 最長実行時間 | 1 年 | 5 分 |
| 実行の保証 | 1 回だけ実行（exactly-once） | 少なくとも 1 回（at-least-once） |
| 料金 | 状態遷移の数 | 実行回数と実行時間 |
| 向いている用途 | 長いワークフロー、人の承認、LLM の多段処理 | 大量・短時間のイベント処理 |

## 基本的な使い方

### ステートマシンの例（リトライ付き）
```json
{
  "StartAt": "ProcessOrder",
  "States": {
    "ProcessOrder": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": {
        "FunctionName": "process-order",
        "Payload.$": "$"
      },
      "Retry": [
        {
          "ErrorEquals": ["States.TaskFailed"],
          "IntervalSeconds": 2,
          "MaxAttempts": 3,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        { "ErrorEquals": ["States.ALL"], "Next": "NotifyFailure" }
      ],
      "Next": "Done"
    },
    "NotifyFailure": {
      "Type": "Task",
      "Resource": "arn:aws:states:::sns:publish",
      "Parameters": {
        "TopicArn": "arn:aws:sns:ap-northeast-1:123456789012:alerts",
        "Message.$": "$.Cause"
      },
      "End": true
    },
    "Done": { "Type": "Succeed" }
  }
}
```

### 開始の仕方
- API Gateway、EventBridge、Lambda（SDK の `StartExecution`）などから開始できる
- 開始するとすぐ実行 ARN が返る。**呼び出し元は完了を待たなくてよい**（非同期）

## LLM処理での使い方

LLM の多段処理（検索 → 生成 → 整形）や、15 分を超えるエージェント処理の **外側のループ** として使えます。

```
[検索 Lambda] → [Bedrock InvokeModel（.sync）] → [整形 Lambda] → [DynamoDB に結果を保存]
                       │
                       └─ スロットリングならリトライ（指数バックオフ）／ 失敗なら通知
```

| ポイント | 内容 |
|---------|------|
| **ステップを小さく分ける** | 各 Lambda は 15 分以内に収める。全体は最長 1 年 |
| **大きなデータは S3 に** | 1 ステートの入出力は **256 KiB まで**。LLM の長い出力や文書は S3 に保存し、キーだけ渡す |
| **LLM のレート制限** | `Retry` に指数バックオフを設定する。`Map` の並列数（`MaxConcurrency`）で同時呼び出しを絞る |
| **人の確認** | `.waitForTaskToken` で、レビュー画面から承認されるまで待つ |
| **Bedrock 以外の LLM** | Claude API や OpenAI など外部の API は、Lambda から呼ぶ（API キーは Secrets Manager） |

全体の構成の選び方は [[20_LLMの長時間処理を非同期で動かす]] を参照。

## 料金体系

### Standard
- 状態遷移 **1,000 回あたり 0.025 ドル**（100 万回で 25 ドル）
- 無料利用枠：月 4,000 回の状態遷移

### Express
- 実行回数と、実行時間 × メモリで課金

### 注意
- `Retry` のくり返しや `Map` の要素ごとにも状態遷移が発生する
- 待っている間（`Wait` や `.sync`）は遷移が発生しないので、長く待っても料金は増えにくい

## Lambda durable functionsとの使い分け

2025 年に、Lambda の中でステップごとに結果を保存しながら長時間動かせる **Lambda durable functions** が登場しました。

| 観点 | Step Functions | Lambda durable functions |
|------|---------------|-------------------------|
| 書き方 | JSON（または画面のデザイナー）で流れを定義 | 普通のコード（TypeScript / Python など）で書く |
| 流れの見える化 | 図で見える | コードを読む |
| AWS サービスとの直接統合 | 豊富 | コードから SDK で呼ぶ |
| 最長時間 | 1 年 | 1 年 |
| 向いている場面 | 複数サービスをつなぐ、流れを図で共有したい | アプリのロジックとしてコードで書きたい |

---

**注意**: 料金や制限は変わることがあります。本番で使う前に AWS 公式ドキュメントで確認してください。

## 参考リンク
- [AWS Step Functions 公式ドキュメント](https://docs.aws.amazon.com/step-functions/)
- [Designing serverless integration patterns for LLMs（AWS Compute Blog）](https://aws.amazon.com/blogs/compute/designing-serverless-integration-patterns-for-large-language-models-llms/)
- [Lambda durable functions（AWS 公式ドキュメント）](https://docs.aws.amazon.com/lambda/latest/dg/durable-functions.html)
