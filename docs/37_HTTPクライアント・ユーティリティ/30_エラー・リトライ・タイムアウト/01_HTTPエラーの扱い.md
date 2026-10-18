---
title: 01_HTTPエラーの扱い
created: 2026-09-25
tags:
  - HTTPクライアント
  - エラー処理
---

# HTTPエラーの扱い

> **ひとことで言うと**：通信の失敗には「届かなかった（ネットワークエラー）」「届いたが断られた（4xx/5xx）」「待ちきれなかった（タイムアウト・キャンセル）」「中身が想定外（パース・検証エラー）」の4種類がある。**`fetch` は 4xx/5xx でも例外を投げない**ので、自分で `response.ok` を見て、1つのエラー型に揃えて投げ直す。

## 4種類の失敗

| 種類 | 例 | fetch での現れ方 | ky / Axios |
|---|---|---|---|
| ネットワークエラー | オフライン、DNS失敗、CORS拒否 | `TypeError` で reject | ky v2: `NetworkError` / Axios: `error.request` はあるが `error.response` が無い |
| HTTPエラー | 400, 401, 404, 500 | **resolve する**（`res.ok === false`） | ky: `HTTPError` / Axios: `AxiosError`（`error.response.status`） |
| タイムアウト・キャンセル | 10秒応答なし、画面を閉じた | `DOMException`（`TimeoutError` / `AbortError`） | ky: `TimeoutError` / Axios: `ECONNABORTED`・`CanceledError` |
| パース・検証エラー | HTMLのエラーページが返ってきた、項目が足りない | `res.json()` の `SyntaxError`、Zod の `ZodError` | 同左 |

## なぜ揃えるのか

画面側が「これは AxiosError？ TypeError？」と道具の都合を知っていると、道具を替えたときに全画面を直すことになる。**自前の `ApiError` 1種類**に揃え、画面は `status` や `code` だけを見るようにする。

```ts
// shared/api/errors.ts
export class ApiError extends Error {
  constructor(
    public readonly status: number,   // 0 = ネットワークエラー
    public readonly code: string,     // サーバーが返すエラーコード
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static async from(res: Response): Promise<ApiError> {
    const body = await res.json().catch(() => undefined); // JSON でないこともある
    return new ApiError(
      res.status,
      (body as any)?.code ?? `HTTP_${res.status}`,
      (body as any)?.message ?? res.statusText,
      body,
    );
  }
}
```

## ステータスごとの扱い方の目安

| ステータス | 意味 | クライアントでの扱い |
|---|---|---|
| 400 / 422 | 入力が不正 | フォームの項目エラーとして表示（リトライしない） |
| 401 | 未認証・トークン期限切れ | トークン更新 → 再送、だめならログイン画面（[[01_トークンの付与と自動更新]]） |
| 403 | 権限なし | 「権限がありません」表示。リトライしない |
| 404 | 存在しない | 「見つかりません」表示 |
| 409 | 競合（他の人が先に更新） | 最新を取り直して再確認を促す |
| 429 | 回数制限 | `Retry-After` を見て待ってから再送 |
| 500 / 502 / 503 / 504 | サーバー側の問題 | 冪等なリクエストならリトライ（[[03_リトライと指数バックオフ]]） |

## よくある失敗

- `if (!res.ok)` を書き忘れ、エラーJSONを正常データとして画面に出す
- エラーボディを読まずに `res.statusText` だけ出す（HTTP/2 では `statusText` は空のことが多い）
- `catch (e) { console.log(e) }` で握りつぶし、画面は読み込み中のまま
- キャンセル（`AbortError`）までエラー通知してしまう → キャンセルは「失敗」ではないので無視する

## 関連
- サーバーが返すエラー形式の設計（RFC 9457 Problem Details など） → 45_API設計
- 画面でのエラー表示 → 36_状態管理/40_サーバー状態/03_ローディング・エラー・空状態
