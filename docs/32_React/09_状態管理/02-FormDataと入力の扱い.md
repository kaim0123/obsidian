# FormData と入力の扱い

このジャンルでは、「**hidden の `<input>` を並べる**」のではなく「**`FormData` に `append` で足す**」こと、**Radix / shadcn の `Select` は `name` でフォームに載せる**ことが中心です。

---

## 指摘 A: hidden をやめて `formData.append` に寄せる

### 原文（レビュー・再構成）

> **`hidden input → formData.append に移行`**  
> `fetch` で送るなら、hidden で DOM を増やすより、送信処理で `formData.append` した方がすっきりする。  
> **`[must]`** 上記指摘に合わせ、**`append` で追加する予定**なので、`<input type="hidden" ...>` の行は**削除**してほしい。

> **`[must]`** 前回指摘の、**hidden の内容を `form`（の `FormData`）に `append` する処理**が**抜けている**と思われるので対応してほしい。

### 言葉の意味

| 用語 | 意味 |
|------|------|
| **`hidden` input** | 画面上は見えないが、フォーム送信時に一緒に送られる `<input type="hidden" name="..." value="...">`。 |
| **`FormData`** | フォームのフィールド名と値のペアをまとめるためのオブジェクト。`fetch` の `body` に渡せる。 |
| **`formData.append(キー, 値)`** | 既に作った `FormData` に、**もう一つフィールドを足す**メソッド。 |

### `append` をもう一段詳しく

- **何に付くメソッドか:** `FormData` インスタンスのメソッド。`const fd = new FormData(form)` のあとで `fd.append(...)` のように呼ぶ。
- **引数のイメージ:** 第1引数が **フィールド名**（サーバや Web3Forms が見る `name` に相当）、第2引数が **値**（文字列や `Blob` など）。ファイル送信では第3引数にファイル名を渡す形もあるが、今回のようなテキストメタデータでは **2引数だけ**で足りることが多い。
- **`new FormData(form)` との関係:** フォーム内の `<input>` などから **既に入っているエントリ**に対して、**さらに行を足す**イメージ。足した内容も `fetch` の `body` に載る。
- **`set` との違い（参考）:** 同じキーに対して `append` は **値を追加**（同じキーが複数行になることがある）。`set` はそのキーの既存値を **置き換え**る。メタデータを1つずつ足すだけなら、普段は **`append` で問題ない**。
- **型の話（TypeScript）:** ブラウザの `FormData.append` は第2引数に `string` や `Blob` などを取る。環境変数や定数文字列を渡す場合は、**文字列であること**を意識すればよい。

### なぜそうするか

- hidden が増えると **DOM が読みにくい**し、キーと値の対応が **JS の送信処理から離れる**。
- メタデータ（件名など）を **`onSubmit` 内に集約**すると、「送信時に何を送っているか」が **一箇所で追える**。

### 実際どう直すか

**1. JSX から hidden を削除する（例）**

削除対象になりやすい例:

```tsx
<input type="hidden" name="access_key" value={import.meta.env.PUBLIC_WEB3FORMS_KEY} />
<input type="hidden" name="from_name" value="K-One LP お問い合わせ" />
<input type="hidden" name="subject" value="K-One LP から新しいお問い合わせ" />
```

**2. `onSubmit` 内で `FormData` を作り、`append` する**

```typescript
const formData = new FormData(form);

formData.append('access_key', import.meta.env.PUBLIC_WEB3FORMS_KEY);
formData.append('from_name', 'K-One LP お問い合わせ');
formData.append('subject', 'K-One LP から新しいお問い合わせ');

// 続けて fetch(..., { body: formData })
```

**3. よくあるミス（再指摘で [must]）**

- hidden だけ消して **`append` を書き忘れる** → `access_key` などが送られず **Web3Forms がエラー**になる。
- 方針は「`append`」なのに **hidden が JSX に残っている** → 二重・混乱の元。

`new FormData(form)` は **フォーム内の通常の入力**から値を集める。DOM に存在しないキーは **自動では入らない**ので、**必ず `append` で足す**。

---

## 指摘 B: `employee_count` / `inquiry_type` は Select に `name`（手書き hidden 不要）

### 原文（レビュー・再構成）

> **`employeeCount` / `inquiryType` の state は不要**  
> Radix UI の `Select` は **`name` を付けると内部で hidden が生成**され、`FormData` に入る。state と二重管理になるのでやめてほしい。

### 言葉の意味

| 用語 | 意味 |
|------|------|
| **Radix UI** | アクセシビリティを意識したヘッドレス UI。shadcn/ui の Select の土台になることが多い。 |
| **`name` 属性** | フォーム送信時の**フィールド名**。Web3Forms 側が「どの項目か」を識別するのに使う。 |

### なぜそうするか

- 同じ値を **React の state** と **Select 内部**の両方で持つと、更新忘れなどで **食い違い（バグ）**が起きやすい。
- **`name` だけで済むなら、それが単一の情報源**に近い。

### 実際どう直すか

- `employeeCount` / `inquiryType` の **`useState` を削除**。
- `<Select name="employee_count" required>` のように **`name` を付ける**（お問い合わせ種別も同様に `name="inquiry_type"` など）。
- 手で足していた **hidden の補完用 input** や、`value` / `onValueChange` による **制御は削除**。

レビューでは **「Select を非制御コンポーネントに変更」**とも表現されていました（詳細は [[4-2-state設計のコツ]] の「実務メモ：state を減らす判断」）。
