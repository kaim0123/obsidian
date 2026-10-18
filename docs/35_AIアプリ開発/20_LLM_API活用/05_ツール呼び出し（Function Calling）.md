---
title: 05_ツール呼び出し（Function Calling）
created: 2026-10-15
tags:
  - AIアプリ開発
  - LLM
  - ツール
---

# ツール呼び出し（Function Calling）

LLM は文章を作るだけで、DB を検索したりメールを送ったりはできません。そこで **「こういう関数があるよ」と LLM に教え、必要なときに呼び出しを頼んでもらう** 仕組みがツール呼び出しです。実際に関数を実行するのは **アプリ側** です。

---

## 1. 流れ

```
① アプリ → LLM：質問 ＋ ツールの定義（名前・説明・引数のスキーマ）
② LLM → アプリ：「get_order を order_id=123 で呼んで」（tool_use）
③ アプリ：実際に get_order(123) を実行
④ アプリ → LLM：実行結果（tool_result）
⑤ LLM → アプリ：結果を踏まえた最終回答
```

- ② で止まった応答は `stop_reason: "tool_use"` になります。
- ③〜④ をくり返すと、LLM が何度もツールを使う [[01_エージェントループの設計|エージェント]] になります。

---

## 2. ツールの定義

```ts
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const getOrder = betaZodTool({
  name: "get_order",
  description:
    "注文番号から注文の状態（受付・発送済み・配達完了）と配送予定日を取得する。" +
    "ユーザーが注文や配送について聞いたときに使う。",
  inputSchema: z.object({
    order_id: z.string().describe("注文番号。例：A-12345"),
  }),
  run: async ({ order_id }) => {
    const order = await db.orders.findForUser(currentUserId, order_id); // 権限チェック込み
    return order ? JSON.stringify(order) : "該当する注文がありません";
  },
});

const client = new Anthropic();

// ツールの実行と LLM への返送を、SDK がくり返してくれる
const finalMessage = await client.beta.messages.toolRunner({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  tools: [getOrder],
  messages: [{ role: "user", content: "A-12345 はいつ届きますか？" }],
});
```

- **`description` がいちばん大事** です。LLM は説明文を読んで「いつ使うか」を判断します。何をするか・いつ使うか・引数の例を書きます。
- 引数のスキーマを厳密にする（`strict: true` や Zod）と、型の違う引数が来るのを防げます。

---

## 3. 安全に作るポイント

| ポイント | 理由 |
|---------|------|
| **権限チェックはツールの中で行う** | LLM は「他人の注文番号」を指定してくるかもしれない。LLM の判断に権限を任せない |
| **読み取りと書き込みを分ける** | 削除・送金・送信などは、人の確認をはさむ |
| **ツールの数を絞る** | 似たツールが多いと選び間違える。コンテキストも増える |
| **エラーは結果として返す** | 例外で止めず、「該当なし」「失敗：理由」を LLM に返すと、自分で言い直してくれる |
| **ツールの結果も信用しない** | Web ページや外部データの中に、悪意ある指示が入っていることがある（[[08_プロンプトインジェクション]]） |

---

## 4. 構造化出力との使い分け

| やりたいこと | 使う機能 |
|-------------|---------|
| 決まった形の JSON がほしいだけ | [[03_構造化出力]] |
| LLM に「必要かどうか」から判断して外部の処理を使わせたい | ツール呼び出し |

---

前へ：[[04_モデル選定とトークン課金]] ／ 次に読む：[[01_RAGの仕組み]]
