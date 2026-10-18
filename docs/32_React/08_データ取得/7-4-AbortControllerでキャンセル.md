# 7-4 AbortControllerでキャンセル

## 🎯 この章で学ぶこと

- `AbortController` の役割と使い方を理解できます
- なぜfetchをキャンセルする必要があるのかが分かります
- 高速タイピング検索や画面切り替え時の典型シナリオを学びます
- `AbortError` を正しく扱う方法を覚えます
- カスタムフックにまとめてキャンセル可能なfetchを作れるようになります

## 📖 概念の説明

### AbortControllerって何？

`AbortController` は **JavaScriptの標準API** で、進行中の処理（特にfetch）を **後から中断する** ために使います。

例えるなら、**配達の取り消しボタン** のようなものです。注文してしまった荷物を「やっぱり要らない、止めて」と取り消すスイッチ。

### なぜキャンセルが必要？

主に次のシナリオで必要になります。

**1. レーシングコンディション（race condition）**
ユーザーが検索ボックスに「ab」「abc」「abcd」と高速で打ち込むと、3つのリクエストが同時に飛びます。返ってくる順番は分かりません。「abc」の結果が「abcd」より遅れて返ってきて、最終的に「abc」の結果が画面に出てしまうとバグです。

**2. 画面遷移**
ユーザーがページを移動したのに、前のページのfetchが完了して `setState` されるとエラーや混乱の元。

**3. ユーザーが明示的にキャンセル**
「キャンセル」ボタンで進行中の処理を止めたい。

### 仕組み

`AbortController` は **`signal`** という監視信号を持ちます。これを `fetch` に渡しておくと、`controller.abort()` を呼んだ瞬間にfetchが中断されます。

```js
const controller = new AbortController();
fetch(url, { signal: controller.signal });

// 後で...
controller.abort(); // ← このfetchを中断
```

中断されたfetchは **`AbortError` という例外を投げます**。これは「エラー」というより「キャンセルされました」というシグナルです。

### 用語の整理

- **AbortController**：処理中断のためのコントローラ
- **signal**：中断信号を伝えるオブジェクト
- **abort**：中断する動作
- **AbortError**：中断されたときに投げられるエラー
- **race condition**：処理順序が不定になって起きるバグ

## 💻 コード例

### 例1：基本の使い方

```js
async function getUser(id) {
  const controller = new AbortController();

  const promise = fetch(`/api/users/${id}`, {
    signal: controller.signal, // ← signalを渡す
  });

  // 5秒後にタイムアウトでキャンセル
  setTimeout(() => controller.abort(), 5000);

  try {
    const res = await promise;
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('タイムアウト');
      return null;
    }
    throw err;
  }
}
```

### 例2：useEffectでクリーンアップとして使う

```jsx
import { useEffect, useState } from 'react';

function UserDetail({ id }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/users/${id}`, { signal: controller.signal })
      .then(r => r.json())
      .then(setUser)
      .catch(err => {
        if (err.name === 'AbortError') return; // キャンセルは無視
        console.error(err);
      });

    // クリーンアップでabort
    return () => controller.abort();
  }, [id]);

  return <div>{user?.name}</div>;
}
```

これで、`id` が連続で変わっても **古いリクエストはキャンセルされて**、最後のリクエストだけが結果を反映します。アンマウント時にも自動でキャンセル。

### 例3：検索のレーシングコンディションを防ぐ

```jsx
function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then(r => r.json())
      .then(setResults)
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });

    return () => controller.abort();
  }, [query]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>{results.map(r => <li key={r.id}>{r.title}</li>)}</ul>
    </div>
  );
}
```

入力するたびに、前のfetchがキャンセルされて新しいfetchが始まる。**最後の入力に対する結果だけ** が表示されます。

### 例4：手動キャンセルボタン

```jsx
function FileUpload() {
  const [progress, setProgress] = useState(0);
  const [controller, setController] = useState(null);

  const startUpload = async (file) => {
    const ctrl = new AbortController();
    setController(ctrl);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: file,
        signal: ctrl.signal,
      });
      // ...
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('ユーザーがキャンセル');
      }
    } finally {
      setController(null);
    }
  };

  return (
    <div>
      {/* ... */}
      {controller && <button onClick={() => controller.abort()}>キャンセル</button>}
    </div>
  );
}
```

ユーザーに明示的なキャンセル機能を提供できます。

### 例5：複数のfetchを1つで束ねる

```jsx
useEffect(() => {
  const controller = new AbortController();
  const { signal } = controller;

  Promise.all([
    fetch('/api/user', { signal }).then(r => r.json()),
    fetch('/api/posts', { signal }).then(r => r.json()),
    fetch('/api/comments', { signal }).then(r => r.json()),
  ])
    .then(([user, posts, comments]) => {
      // ...
    })
    .catch(err => {
      if (err.name !== 'AbortError') console.error(err);
    });

  return () => controller.abort();
}, []);
```

1つの `signal` を共有することで、まとめてキャンセルできます。

### 例6：タイムアウトと組み合わせる

```js
async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeout); // タイマーを片付ける
  }
}
```

最近では `AbortSignal.timeout(5000)` というショートカットもあります。

```js
const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
```

### 例7：カスタムフック化

```jsx
import { useEffect, useState } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => setData(d))
      .catch(err => {
        if (err.name === 'AbortError') return; // キャンセルは無視
        setError(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url]);

  return { data, error, loading };
}

// 使う側
function User({ id }) {
  const { data, loading, error } = useFetch(`/api/users/${id}`);
  // ...
}
```

毎回書くのは大変なので、カスタムフックにすると気持ちよくなります。

## ❌ よくある間違い

### 1. AbortError をエラーログに出す

```jsx
.catch(err => console.error(err)); // ❌ AbortErrorまでログに出る
```

`AbortError` は **意図的なキャンセル** なのでエラーログには出さない。

```jsx
.catch(err => {
  if (err.name === 'AbortError') return;
  console.error(err);
});
```

### 2. controller.abort() を呼び忘れる

```jsx
// ❌ 作っただけで使ってない
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(...);
  // returnしてないので意味がない
}, []);
```

クリーンアップで必ず `abort()` を呼ぶ。

### 3. 1つのcontrollerを使い回す

```jsx
// ❌ 一度abortしたcontrollerは再利用できない
const controller = new AbortController(); // useEffectの外で作る

useEffect(() => {
  fetch(url, { signal: controller.signal });
  return () => controller.abort();
}, [url]); // 2回目以降、abortされたsignalで動かない
```

useEffectの **中で毎回新しい controller を作る**。

### 4. abort後に setState

`abort` 後にPromiseチェーンが続くと `setState` が走ってしまう場合があります。`AbortError` を確実にキャッチして、それ以降は何もしないように。

## ✅ ベストプラクティス

1. **fetch は基本的にキャンセル可能にする**：useEffect内のfetchはほぼ全部 `signal` を渡す。
2. **AbortError は早期returnでスキップ**：エラーログから除外する。
3. **useEffect の中で controller を作る**：毎回新しいインスタンスを。
4. **タイムアウトには `AbortSignal.timeout()`**：シンプルに書ける。
5. **カスタムフックで使い回す**：パターンを共通化する。

## 🔬 実践演習

### お題：キャンセル可能な検索

入力ボックスに文字を打つと、サーバーから候補を取得して表示する検索機能を作りましょう。連続で文字を打っても **最後の入力の結果だけ** が表示されることを `AbortController` で保証します。

ヒント：

- `useEffect` に `query` を依存に取る
- 依存変更時のクリーンアップで `controller.abort()`
- `AbortError` は無視
- 結果が古いリクエストで上書きされないことをDevToolsのNetworkタブで確認

### 発展課題

- 検索にキャンセルボタンを追加して、ユーザーが手動で止められるようにしましょう
- `AbortSignal.timeout()` で「5秒以内に返ってこなかったらタイムアウト」を実装してみましょう

## 📝 まとめ

- `AbortController` で進行中のfetchを中断できる
- レーシングコンディションや画面遷移時のバグを防ぐ
- `controller.abort()` は `AbortError` を投げる
- `AbortError` はエラーではなくキャンセルなのでスキップ
- useEffect のクリーンアップで abort するのが定番

## 🔗 関連ページ

- [[7-2-fetchの基本]]
- [[7-3-ローディング-エラー-空状態]]
- [[7-5-データ取得ライブラリ]]
- [[../05_Effectsとライフサイクル/5-3-クリーンアップ]]
- [[../05_Effectsとライフサイクル/5-6-アンマウント後のsetState対策]]
