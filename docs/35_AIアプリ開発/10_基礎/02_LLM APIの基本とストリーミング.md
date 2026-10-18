---
title: 02_LLM APIの基本とストリーミング
created: 2026-10-15
tags:
  - AIアプリ開発
  - LLM
  - API
---

# LLM APIの基本とストリーミング

LLM をアプリから使う最小単位は **「メッセージの配列を送って、返事を受け取る」** HTTP リクエストです。この章では、呼び出し方・ストリーミング・エラー処理・API キーの置き場所をまとめます。

---

## 1. リクエストの形

主要な LLM API（Claude、OpenAI、Gemini）はどれも、だいたい次の要素でできています。

| 要素 | 意味 |
|------|------|
| `model` | 使うモデルの ID |
| `system` | システムプロンプト。アプリ側が決める「役割・ルール」 |
| `messages` | 会話の履歴。`user` と `assistant` が交互に並ぶ |
| `max_tokens` | 出力の上限トークン数。小さすぎると途中で切れる |
| `tools` | LLM に呼ばせたい関数の定義（[[05_ツール呼び出し（Function Calling）]]） |

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // ANTHROPIC_API_KEY を環境変数から読む

const response = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  system: "あなたは社内ヘルプデスクの担当者です。敬語で簡潔に答えます。",
  messages: [{ role: "user", content: "VPN がつながりません" }],
});

// content はブロックの配列。type で絞り込んでから text を読む
for (const block of response.content) {
  if (block.type === "text") console.log(block.text);
}
```

- **LLM は会話を覚えていません**。2 回目の質問では、1 回目のやりとりも `messages` に入れて送り直します。
- 返ってきた `stop_reason` を必ず確認します。`max_tokens` なら出力が途中で切れています。

---

## 2. ストリーミング

LLM の応答は数秒〜数十秒かかります。全部できるまで待つと、ユーザーは固まったように感じます。**生成された文字から順に送る** のがストリーミングです。

```ts
const stream = client.messages.stream({
  model: "claude-opus-5-5",
  max_tokens: 64000,
  messages: [{ role: "user", content: "議事録を要約して" }],
});

stream.on("text", (delta) => process.stdout.write(delta)); // 届いた分だけ表示

const finalMessage = await stream.finalMessage(); // 最後に全体を受け取る
console.log(finalMessage.usage); // 使ったトークン数
```

| 使う場面 | 理由 |
|----------|------|
| チャット UI | 体感の待ち時間が大きく減る |
| 長い出力・大きな `max_tokens` | HTTP のタイムアウトを避けられる |

- ブラウザまで届けるには、サーバーから **SSE（Server-Sent Events）** などで中継します。
- 途中で切断されたときに、それまでの部分をどう扱うかも決めておきます。

---

## 3. API キーはサーバーに置く

```
ブラウザ ──▶ 自分のバックエンド ──(API キー)──▶ LLM API
```

- **フロントエンドに API キーを入れてはいけません**。ビルドされた JS からすぐに抜き取られ、他人に課金を使われます。
- キーは環境変数やシークレットマネージャで管理します（[[03_ログに書くこと・書かないこと]] と同じ考え方で、ログにも出さない）。
- 自分のバックエンドで **ユーザーごとの利用回数制限（レート制限）** をかけます。LLM は 1 回の呼び出しが高いので、制限がないと 1 人の悪用で請求が跳ね上がります。

---

## 4. エラー処理とリトライ

| 状態 | 意味 | 対応 |
|------|------|------|
| 400 | リクエストの形が間違っている | 直すまで何度送っても失敗する。リトライしない |
| 401 | API キーが無効 | 設定を確認 |
| 429 | レート制限 | 少し待ってリトライ（`retry-after` ヘッダに従う） |
| 5xx・接続エラー | 一時的な障害 | 指数バックオフでリトライ |

```ts
try {
  const response = await client.messages.create({ /* ... */ });
} catch (error) {
  if (error instanceof Anthropic.RateLimitError) {
    // 429：あとでリトライ
  } else if (error instanceof Anthropic.BadRequestError) {
    // 400：リクエストを直す
  } else if (error instanceof Anthropic.APIError) {
    console.error(`API error ${error.status}`);
  }
}
```

- 公式 SDK は 429 や 5xx を **自動で数回リトライ** します。自前で二重にリトライしないよう注意します。
- エラーメッセージの文字列で分岐せず、SDK のエラークラスで分岐します。
- 一般的なリトライ・タイムアウトの考え方は 34_Backend/60_外部連携 を参照。

---

## 5. チェックリスト

- [ ] API キーをフロントエンドに出していない
- [ ] チャット UI ではストリーミングを使っている
- [ ] `stop_reason` を見て、途中で切れた出力を検知している
- [ ] 429 / 5xx だけをリトライし、400 はリトライしていない
- [ ] ユーザーごとの利用制限をかけている

---

前へ：[[01_LLMアプリ開発の全体像]] ／ 次に読む：[[01_アプリに組み込むプロンプト設計]]
