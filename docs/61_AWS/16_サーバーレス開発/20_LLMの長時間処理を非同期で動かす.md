---
title: 20_LLMの長時間処理を非同期で動かす
created: 2026-10-15
tags:
  - AWS
  - Lambda
  - サーバーレス
  - LLM
  - 非同期
---

# LLMの長時間処理を非同期で動かす（AWS）

LLM の呼び出しやエージェントの処理を AWS で非同期に動かす方法をまとめます。考え方（ジョブ方式、冪等性、状態管理）と、AWS 以外の簡単な方法は [[04_長時間処理の非同期化]]（35_AIアプリ開発）を参照してください。ここは **AWS で組むときの具体的な構成と制限** の話です。

---

## 1. 知っておくべき制限

| サービス | 制限 | LLM での影響 |
|---------|------|------------|
| **Lambda** | 最大実行時間 15 分 | エージェントや大量の文書処理ははみ出すことがある |
| **Lambda** | 待っている時間も課金（実行時間 × メモリ） | LLM の返事待ちの数分もそのまま課金される |
| **API Gateway（REST）** | 統合タイムアウトは原則 29 秒（リージョン / プライベートは申請で延長可） | 同期で LLM を待つとすぐ切れる |
| **API Gateway（HTTP API）** | 統合タイムアウトは最大 30 秒 | 同上 |
| **Lambda 同期呼び出し** | 15 分以内 | 呼び出し元も 15 分待つことになる |
| **Step Functions（Standard）** | 最長 1 年、1 ステートの入出力 256 KiB | 長い LLM の出力は S3 に置いて参照だけ渡す |
| **Step Functions（Express）** | 最長 5 分 | 長い処理には使えない |

---

## 2. 構成パターン

### パターン A：ストリーミング（チャット向け）

```
ブラウザ ──▶ Lambda 関数 URL（レスポンスストリーミング） ──▶ LLM API
```

- 生成された文字から順にブラウザへ返します。非同期ではなく **「待たせ方を良くする」** 方法です。
- Node.js ではハンドラを `awslambda.streamifyResponse()` で包む必要があります。
- 最大 15 分。API Gateway 経由の場合はさらに **無通信が続くと切れる**（リージョン / プライベートで 5 分、エッジ最適化で 30 秒）制限があります。長い処理には向きません。

### パターン B：SQS ＋ Lambda ＋ DynamoDB（まずはこれ）

```
① ブラウザ → API Gateway → 受付 Lambda：DynamoDB に {jobId, status: queued} → SQS に送信 → 202 を返す
② SQS → ワーカー Lambda：LLM を呼ぶ → DynamoDB を {status: done, result} に更新
③ ブラウザ → API Gateway → 状態確認 Lambda：DynamoDB から jobId を読む（ポーリング）
```

| 設定 | ポイント |
|------|---------|
| ワーカーのタイムアウト | LLM の最長応答時間 ＋ 余裕。最大 15 分 |
| SQS の可視性タイムアウト | **ワーカーのタイムアウトより長く**（AWS の推奨は 6 倍以上）。短いと処理中に別のワーカーが同じメッセージを拾い、LLM が二重に呼ばれる |
| DLQ（デッドレターキュー） | `maxReceiveCount` 回失敗したら移す。移ったら DynamoDB を `failed` に |
| 同時実行数の上限 | ワーカーの予約同時実行数で絞る。LLM API の 429（レート制限）を防ぐ |
| 冪等性 | DynamoDB の条件付き書き込みで「queued のときだけ running にする」 |
| 大きな結果 | DynamoDB の 1 アイテムは 400 KB まで。長い出力は S3 に保存してキーだけ持つ |

SQS と Lambda の接続そのものは [[10_LambdaとSQS接続]]、DynamoDB の操作は [[04_LambdaとDynamoDB接続]] を参照。

### パターン C：Lambda durable functions（15 分を超える・ステップが多い）

- Lambda の上で、**ステップごとに結果をチェックポイントとして保存** しながら進める仕組みです。落ちても、終わったステップは保存済みの結果を使って続きから再開します。
- 1 回の実行は **最長 1 年**。`wait`（待ち）の間は関数が停止し、**計算の課金がかかりません**。人の承認待ちに向いています。
- 待ちには durable functions の `wait` を使います。`setTimeout` や `sleep` で待つと、関数が動いたままになり課金されます。
- **LLM の呼び出しは必ず step の中に入れます**。step の外に置くと、再開のたびに LLM が呼び直され、結果も料金も変わってしまいます。
- 同期呼び出しの場合は 15 分の制限が残ります。長い処理は非同期で呼び出します。

### パターン D：Step Functions（状態機械で組む）

```
[検索 Lambda] → [Bedrock InvokeModel（.sync）] → [整形 Lambda] → [DynamoDB 更新]
                         └─ 失敗したらリトライ（指数バックオフ）→ それでも失敗なら通知
```

- 処理を小さな Lambda に分け、Step Functions がつなぎます。各ステップは 15 分以内、全体は最長 1 年です。
- リトライ、条件分岐、並列処理、人の承認待ち（タスクトークン）が組み込みで使えます。
- Bedrock とはサービス統合があり、Lambda を挟まずにモデルを呼んで完了を待てます。
- 状態遷移ごとに課金されます（Standard は 100 万遷移あたり 25 ドル程度。月 4,000 遷移まで無料）。
- 詳しくは [[05_StepFunctions]]。

### パターン E：ECS / Fargate（1 ステップ自体が長い）

- コンテナで動かすので時間の制限がありません。Step Functions から起動して完了を待つこともできます。
- 起動に 1〜2 分かかることがあり、終了したタスクのログはすぐ見られなくなるので CloudWatch Logs への出力を忘れずに設定します。

### パターン F：Bedrock AgentCore Runtime（エージェントを任せる）

- エージェントの実行環境を AWS が用意してくれるサービスです。紹介記事によると、1 セッションで最大 8 時間の処理に対応しています。
- 自分でループやコンテナを管理したくない場合の選択肢です。

---

## 3. どれを選ぶか

| 状況 | 選ぶもの |
|------|---------|
| チャットで、数分以内に答える | A：ストリーミング |
| 1 件 15 分以内、ステップは 1 つ | **B：SQS ＋ Lambda**（まずはこれ） |
| 15 分を超える、ステップが多い、待ちがある。コードで書きたい | C：durable functions |
| 同上。図で流れを見たい、AWS サービスを直接つなぎたい | D：Step Functions |
| 1 ステップが 15 分を超える | E：Fargate |
| エージェントの実行基盤ごと任せたい | F：AgentCore Runtime |

---

## 4. チェックリスト

- [ ] API Gateway の後ろで LLM を同期で待っていない
- [ ] SQS の可視性タイムアウトをワーカーのタイムアウトより十分長くしている
- [ ] DLQ を設定し、失敗したジョブを `failed` にしている
- [ ] ワーカーの同時実行数を絞り、LLM API のレート制限に収めている
- [ ] 長い出力を S3 に置き、DynamoDB / Step Functions には参照だけ渡している
- [ ] durable functions では LLM の呼び出しを step の中に入れている
- [ ] LLM の API キーを Secrets Manager などで管理している

---

## 参考
- [Lambda durable functions（AWS 公式ドキュメント）](https://docs.aws.amazon.com/lambda/latest/dg/durable-functions.html)
- [Lambda durable functions の基本概念](https://docs.aws.amazon.com/lambda/latest/dg/durable-basic-concepts.html)
- [sample-ai-workflows-in-aws-lambda-durable-functions（aws-samples）](https://github.com/aws-samples/sample-ai-workflows-in-aws-lambda-durable-functions)
- [Designing serverless integration patterns for LLMs（AWS Compute Blog）](https://aws.amazon.com/blogs/compute/designing-serverless-integration-patterns-for-large-language-models-llms/)
- [Serverless strategies for streaming LLM responses（AWS Compute Blog）](https://aws.amazon.com/blogs/compute/serverless-strategies-for-streaming-llm-responses/)
- [AWS Lambda レスポンスストリーミングの紹介](https://aws.amazon.com/jp/blogs/news/introducing-aws-lambda-response-streaming/)
- [Step Functions as the outer loop for long-running AI workflows（AWS Builder Center）](https://builder.aws.com/content/3Bfg6PkDQJPTWMK4mdVicc2TtVY/step-functions-as-the-outer-loop-for-long-running-ai-workflows)
- [Asynchronous patterns for Bedrock AgentCore agents](https://aihub.hkuspace.hku.hk/?p=8080)

---

考え方と AWS 以外の方法：[[04_長時間処理の非同期化]] ／ 目次：[00_目次](./00_目次.md)
