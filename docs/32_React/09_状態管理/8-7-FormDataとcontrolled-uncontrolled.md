# 8-7. FormDataとcontrolled/uncontrolledの使い分け

## 🎯 この章で学ぶこと

- FormData とは何か、いつ便利か
- controlled / uncontrolled の使い分け基準
- ファイルアップロードを含む送信例

---

## 📖 概念の説明

### おさらい

- **Controlled**：input の value を state で管理
- **Uncontrolled**：DOM が値を持つ。ref か FormData で取り出す

詳しくは [[3-6-フォーム入力の基本]]。

### FormData とは

ブラウザ標準の API。フォームの値を**1つのオブジェクトのように**まとめて取れる。

```jsx
function handleSubmit(e) {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  console.log(data.get('name'));   // 'name' input の値
  console.log(data.get('email'));  // 'email' input の値
}

<form onSubmit={handleSubmit}>
  <input name="name" />
  <input name="email" />
  <button>送信</button>
</form>
```

---

## 💻 FormData の使いどころ

### ① シンプルな送信フォーム

入力中にバリデーションしないなら、stateを持たない方が楽：

```jsx
function ContactForm() {
  function handleSubmit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button>送信</button>
    </form>
  );
}
```

`Object.fromEntries(FormData)` で **オブジェクト化**。stateも `useState` も不要。

### ② ファイルアップロード

ファイルは FormData が便利。

```jsx
function FileUpload() {
  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    fetch('/api/upload', {
      method: 'POST',
      body: formData, // ← multipart/form-data として送信
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" />
      <input name="file" type="file" />
      <button>アップロード</button>
    </form>
  );
}
```

JSON だとファイルが送れないので、FormData をそのまま `body` に渡す。

### ③ 複数の同名フィールド

```jsx
<input name="tags" value="a" />
<input name="tags" value="b" />

const data = new FormData(form);
data.getAll('tags'); // ['a', 'b']
```

---

## 💻 Controlled が向くケース

### ① リアルタイム表示・バリデーション

```jsx
const [text, setText] = useState('');
return (
  <>
    <input value={text} onChange={(e) => setText(e.target.value)} />
    <p>{text.length} 文字</p>
  </>
);
```

### ② 入力値で別UIを変える

```jsx
const [country, setCountry] = useState('jp');
return (
  <>
    <select value={country} onChange={(e) => setCountry(e.target.value)}>
      ...
    </select>
    {country === 'jp' && <ZipInput />}
  </>
);
```

### ③ 入力を加工して保存

```jsx
const [phone, setPhone] = useState('');

function handleChange(e) {
  // ハイフン自動挿入
  const formatted = e.target.value
    .replace(/\D/g, '')
    .replace(/^(\d{3})(\d{4})/, '$1-$2-');
  setPhone(formatted);
}
```

---

## 💻 ハイブリッド（一部だけ controlled）

すべてを controlled にする必要はない：

```jsx
function Form() {
  const [agreed, setAgreed] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // 名前・メールはuncontrolled、agreedだけstateで管理
    console.log(data.get('name'), agreed);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" />
      <input name="email" />
      <label>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        利用規約に同意
      </label>
      <button disabled={!agreed}>送信</button>
    </form>
  );
}
```

「**ボタンの有効/無効に必要なものだけ controlled**」というスタイル。

---

## 💡 使い分けのまとめ

| シーン | 推奨 |
| --- | --- |
| シンプルな送信フォーム | uncontrolled + FormData |
| ファイルアップロード | uncontrolled + FormData |
| リアルタイムプレビュー | controlled |
| 入力中バリデーション | controlled |
| 大規模フォーム | react-hook-form |

---

## ❌ よくある間違い

### ファイルを controlled にしようとする

```jsx
// ❌ <input type="file"> は value をJSから設定できない
<input type="file" value={file} onChange={...} />
```

→ ✅ 必ず uncontrolled。`onChange={(e) => setFile(e.target.files[0])}`。

### `name` 属性を忘れる（FormData が空）

```jsx
<input value={...} /> {/* name なし */}
```

→ FormData は `name` で値を引く。

### Object.fromEntries で重複キーが消える

```jsx
<input name="tags" />
<input name="tags" />

Object.fromEntries(formData); // ❌ 1つしか残らない
```

→ ✅ `formData.getAll('tags')`。

---

## ✅ ベストプラクティス

1. **シンプルな送信は uncontrolled + FormData**
2. **ファイルは必ず uncontrolled**
3. **必要な部分だけ controlled**
4. **大規模は react-hook-form**
5. `name` 属性を忘れない

---

## 🔬 実践演習

「画像投稿フォーム」を作る：

- タイトル（テキスト）
- 説明（テキストエリア）
- 画像（複数ファイル）
- カテゴリ（select）

uncontrolled + FormData で実装。

---

## 📝 まとめ

- FormData = フォーム値をまとめて取る標準API
- シンプルな送信・ファイルなら uncontrolled
- リアルタイム表示するなら controlled
- 必要に応じてハイブリッド

---

## 🔗 関連ページ

- [[3-6-フォーム入力の基本]]
- [[8-6-フォームの状態設計]]
- [[8-8-送信フローの状態管理]]
