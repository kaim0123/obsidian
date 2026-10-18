# `"use client"` と `"use server"`（統合ノート）

App Router で **サーバー側とブラウザ側の境界**を決めるのが `"use client"`、**サーバーだけで実行する関数（Server Actions の核）**を宣言するのが `"use server"` です。ここでは「いつどちらか」を優先順位ベースで整理します。

前提の復習は **[[01Server-ComponentsとClient-Components]]** を読むと楽です。

---

## 1. `"use client"` を付けるとき

ファイル **先頭**に `"use client"` を書くと、そのコンポーネント（と通常はそのインポート子のクライアント側ルール）は **Client Component** になります。

**付ける代表的な理由**です。

| 必要なもの | 理由 |
|-----------|------|
| **`useState` / `useReducer` / `useEffect`** などのフック | Server Component では使えない |
| **`onClick` / `onChange` / `onSubmit`** などのイベント | 同上 |
| **ブラウザ API**（`window`、`document`、`localStorage` など） | 同上 |
| **クライアント専用のライブラリ** | 同上 |

親に `"use client"` を付けると、その下のインポートして使うコンポーネントも **クライアントバンドルの対象**になりやすい、という親子関係にも注意があります。

また、資料では **リアルタイムに UI が動く Todo のようなもの** は、状態と副作用をブラウザで持つので **CSR 気味になりやすく**、その結果 **`"use client"` が親に付く**例が示されていました。とはいえ、**サーバー側でデータを読み込み、必要最小限だけ Client に渡す**設計への分割も可能であり、機能要件で選びます。

---

## 2. `"use server"`（Server Actions）を付けるとき

**ミューテーション**（フォーム送信・DB の書き込み・ログイン処理など）、**ユーザーからの入力をトリガにサーバー側の処理だけを実行したい**ときに検討します。

### 典型パターン

- **`form` の `action` 属性に** async 関数（Server Action）を渡す。
- 関数またはモジュールの先頭で **`"use server"`** を宣言する。
- **`FormData`** などで入力値を受け取る。

### 「クライアントの中に書けない」問題の解

**`"use client"` が付いたファイルの中には `"use server"` を直接並べられない**、という説明があります。

**対処**：Server Action を **別ファイル** に切り出し、そのファイル先頭だけに **`"use server"`**，クライアント側からは **インポートして `action=` に渡す**。これが定番です。

フォーム送信後に **入力をクリア**したければ、`useRef` で `<form>` を参照して **`reset()`** するようなクライアント側処理と組み合わせられます。

---

## 3. Server Actions のメリット（資料での整理）

- **専用の Route Handler を必ず用意しなくていい**。クライアントから `fetch` で叩く手順が省略できることがある。
- **往復や再レンダが減る**可能性（ケースによります）。
- **サーバーに近いところで DB 操作**が書けるので、インフラ配置次第ではレイテンシ面の利点の説明もある。
- `form action` は **ブラウザのフォーム機能として送信**にも寄せられるため、資料では **ハイドレーション前の短い時間**とも対比されていました（細部は要件次第）。

---

## 4. Server Actions のデメリット・注意

**関心の分離が曖昧になりやすい**点が挙げられています。「API はバックエンド、画面はフロント」という分業がプロジェクト規約にある場合、`actions.ts` に DB 処理が増えるほどレビューのルール設計が重要になります。また、**ミューテーション後の一覧更新**では `revalidatePath` / タグ系 API などとの **キャッシュ戦略が別途必要**になります（具体は **[[02revalidateとタグ]]** および **[[04use cache]]**）。

---

## 5. 使いどころの優先順位（ざっくり）

| 検討 | 向くこと |
|------|----------|
| まず **Secret / DB は Server Component で読む**か、必要な結果だけ props で渡す | バンドルと漏洩面で有利になりやすい |
| **インタラクション・状態**が主役なら **`"use client"`** で切り分ける塊を作る | フックとイベントが使える |
| **フォームとサーバー側の書き込み**がセットなら **Server Actions** を検討 | API レイヤーを薄くできることも |

「必ず Server Action を使う／使わない」はプロジェクト規約による、という総括にもなっています。

---

## 6. 関連ノート・出典

- **[[01Server-ComponentsとClient-Components]]**
- **[[02サーバーとクライアントのデータの渡し方]]**
- **[[../04_データ取得とキャッシュ/03Server-Actions（フォーム・ミューテーション）]]**：実装詳細・パターンの本丸。
- **元クリップ**：`[[あなたはuse clientとuse serverをいつ使うべきか知っていますか？【ServerActionsまで解説】]]`（Transcript メイン）。

---

## 公式リンク（起点）

- [Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
