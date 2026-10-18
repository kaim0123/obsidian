# 02. README に Supabase の接続情報が直書きされている

## design.md の指摘

> **README.md に Supabase の URL / キーがコミットされている**
>
> anon（publishable）キーは公開前提とはいえ、接続情報をリポジトリに直書きするのは避けたい。`.env.local.example` に置き換え、実値はドキュメントから除去する。

---

## 基礎知識：環境変数とは？

アプリが Supabase に接続するには **2つの情報** が必要です。

| 変数名 | 内容 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | プロジェクトの URL（例: `https://xxxxx.supabase.co`） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 匿名（公開）API キー |

これらは **`.env.local`** というファイルに書き、**Git にはコミットしません**（`.gitignore` で除外）。

### なぜ README に書いてはいけないか

1. **リポジトリは公開されることがある** — GitHub を public にした瞬間、全世界に URL / キーが漏れる
2. **キーをローテーション（再発行）しにくい** — README を直す → 全員に周知、という手間
3. **anon キーは「公開前提」だが…** — RLS（行レベルセキュリティ）が正しく設定されていないと、anon キーだけでデータが読める可能性がある。キーと URL の組み合わせが知られると攻撃の標的になる
4. **本番と開発で別プロジェクトを使う** — README に本番の値が書いてあると、開発者が誤って本番 DB を触る

---

## 何が間違っていたか

以前の README には、おそらく次のような **実際の値** がそのまま書かれていました。

```markdown
<!-- 悪い例 -->
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

これは **「秘密」というより「接続先の住所」** ですが、ソースコード管理のベストプラクティスでは **実値はリポジトリに入れない** のが鉄則です。

---

## どう修正すべきか

### 1. `.env.local.example` を作る

**プレースホルダー（ダミー値）だけ** を書いたテンプレートファイルです。これは Git にコミットして OK です。

```env
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

### 2. README は「手順」だけ書く

```markdown
<!-- 良い例 -->
`.env.local.example` を `.env.local` にコピーし、
Supabase ダッシュボードの Project Settings → API から
URL と anon キーを取得して設定してください。
```

**実際の URL やキーは一切書かない。**

### 3. `.gitignore` に `.env.local` があることを確認

```
.env.local
.env*.local
```

### 4. すでに漏れた場合

- Supabase ダッシュボードで **anon キーを再生成（rotate）** する
- Git 履歴に残っている場合は `git filter-repo` 等で履歴から除去（上級者向け）

---

## 現在の対応状況

| 項目 | 状態 |
|------|------|
| `.env.local.example` の追加 | ✅ 完了 |
| README から実際の URL / キー除去 | ✅ 完了 |
| README がダッシュボード手順を案内 | ✅ 完了 |

### 残っている軽微な点

README の認証設定セクションに **プロジェクト名「ats8」** がハードコードされています。

```markdown
2. プロジェクト「ats8」を選択
```

これは秘密情報ではありませんが、**フォークした人や別環境の人には当てはまりません**。  
「自分の Supabase プロジェクトを選択」のように一般化するとより良いです。

---

## まとめ

| 間違い | 修正 |
|--------|------|
| README に実際の接続情報 | `.env.local.example` にプレースホルダーのみ |
| 開発者が README からコピペ | 「ダッシュボードから取得」と手順で案内 |
| 実値が Git 履歴に残る | `.env.local` を gitignore + 漏洩時はキー再生成 |

**学び**: 設定値は **コードや README ではなく環境変数** に閉じ込める。テンプレート（`.example`）と実値（`.local`）を分けるのが定石です。
