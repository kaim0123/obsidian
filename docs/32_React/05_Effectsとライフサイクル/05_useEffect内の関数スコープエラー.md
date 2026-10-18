# useEffect内の関数スコープエラー

---

## このページで学ぶこと
- useEffect内で関数を定義した場合のスコープ問題
- エラーの原因と発生パターン
- 解決策とベストプラクティス
- 実践的な対処例

---

## エラーの概要

`useEffect`内で関数を定義すると、その関数のスコープが`useEffect`内に限定され、他の関数（`handleSubmit`や`handleDelete`など）から呼び出せなくなります。

### エラーの発生例

```jsx
// ❌ 間違った例：fetchEventsがuseEffect内で定義されている
function EventComponent() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // fetchEventsがuseEffect内で定義されている
    const fetchEvents = async () => {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    };
    
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ❌ エラー：fetchEvents is not defined
    // fetchEventsはuseEffect内のスコープにしか存在しない
    await fetchEvents();
  };

  const handleDelete = async (id) => {
    // ❌ エラー：fetchEvents is not defined
    await fetch('/api/events/' + id, { method: 'DELETE' });
    await fetchEvents(); // 削除後に再取得したいが呼び出せない
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

### エラーメッセージ

```
ReferenceError: fetchEvents is not defined
```

または

```
Uncaught ReferenceError: Cannot access 'fetchEvents' before initialization
```

---

## なぜこのエラーが発生するのか？

### JavaScriptのスコープの仕組み

1. **関数スコープ**: 関数内で定義された変数や関数は、その関数内でのみアクセス可能
2. **ブロックスコープ**: `{}`で囲まれたブロック内で定義された変数は、そのブロック内でのみアクセス可能
3. **useEffectのスコープ**: `useEffect`のコールバック関数内で定義された関数は、そのコールバック内でのみ有効

### 問題の構造

```jsx
function Component() {
  // コンポーネントのスコープ
  
  useEffect(() => {
    // useEffectのスコープ（別のスコープ）
    const fetchEvents = () => {
      // fetchEventsはここでのみ有効
    };
  }, []);

  const handleSubmit = () => {
    // handleSubmitのスコープ
    // ❌ fetchEventsは見えない（別のスコープにあるため）
    fetchEvents();
  };
}
```

---

## 解決策

### 解決策1: 関数をコンポーネントのスコープで定義する（推奨）

関数を`useEffect`の外で定義し、`useEffect`内で呼び出す方法です。

```jsx
// ✅ 正しい例：fetchEventsをコンポーネントのスコープで定義
function EventComponent() {
  const [events, setEvents] = useState([]);

  // fetchEventsをコンポーネントのスコープで定義
  const fetchEvents = async () => {
    const response = await fetch('/api/events');
    const data = await response.json();
    setEvents(data);
  };

  useEffect(() => {
    // useEffect内で呼び出す
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ✅ 正常に呼び出せる
    await fetchEvents();
  };

  const handleDelete = async (id) => {
    await fetch('/api/events/' + id, { method: 'DELETE' });
    // ✅ 正常に呼び出せる
    await fetchEvents();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

### 解決策2: useCallbackで関数をメモ化する（依存関係がある場合）

関数が他の値（stateやprops）に依存している場合、`useCallback`でメモ化することで、不要な再作成を防ぎます。

```jsx
// ✅ useCallbackを使用した例
import { useState, useEffect, useCallback } from 'react';

function EventComponent({ userId }) {
  const [events, setEvents] = useState([]);

  // useCallbackでメモ化（userIdが変わったときのみ再作成）
  const fetchEvents = useCallback(async () => {
    const response = await fetch(`/api/events?userId=${userId}`);
    const data = await response.json();
    setEvents(data);
  }, [userId]); // userIdが依存関係

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); // fetchEventsが依存関係

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchEvents(); // ✅ 正常に呼び出せる
  };

  const handleDelete = async (id) => {
    await fetch('/api/events/' + id, { method: 'DELETE' });
    await fetchEvents(); // ✅ 正常に呼び出せる
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

### 解決策3: カスタムフックに抽出する

複数のコンポーネントで同じロジックを使う場合、カスタムフックに抽出します。

```jsx
// ✅ カスタムフックとして抽出
function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}

// 使用例
function EventComponent() {
  const { events, loading, error, refetch } = useEvents();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 処理...
    await refetch(); // ✅ 正常に呼び出せる
  };

  const handleDelete = async (id) => {
    await fetch('/api/events/' + id, { method: 'DELETE' });
    await refetch(); // ✅ 正常に呼び出せる
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

---

## よくある間違いと注意点

### 間違い1: useEffect内で定義した関数を外部から呼び出そうとする

```jsx
// ❌ 間違い
useEffect(() => {
  const fetchData = () => { /* ... */ };
  fetchData();
}, []);

const handleClick = () => {
  fetchData(); // ❌ エラー：スコープ外
};
```

### 間違い2: 依存配列を正しく設定しない

```jsx
// ⚠️ 注意：依存配列が不完全
const fetchEvents = useCallback(async () => {
  const response = await fetch(`/api/events?userId=${userId}`);
  // ...
}, []); // ❌ userIdが依存関係に含まれていない

// ✅ 正しい
const fetchEvents = useCallback(async () => {
  const response = await fetch(`/api/events?userId=${userId}`);
  // ...
}, [userId]); // ✅ userIdを依存関係に含める
```

### 間違い3: 無限ループを引き起こす

```jsx
// ❌ 無限ループの原因
const fetchEvents = async () => {
  const response = await fetch('/api/events');
  const data = await response.json();
  setEvents(data);
};

useEffect(() => {
  fetchEvents();
}, [fetchEvents]); // ❌ fetchEventsが毎回新しく作成されるため無限ループ

// ✅ 正しい：useCallbackでメモ化
const fetchEvents = useCallback(async () => {
  const response = await fetch('/api/events');
  const data = await response.json();
  setEvents(data);
}, []); // 依存関係なし

useEffect(() => {
  fetchEvents();
}, [fetchEvents]); // ✅ fetchEventsは再作成されない
```

---

## 実践的なパターン

### パターン1: CRUD操作とデータ再取得

```jsx
function EventManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // データ取得関数をコンポーネントスコープで定義
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初回マウント時にデータ取得
  useEffect(() => {
    fetchEvents();
  }, []);

  // 作成
  const handleCreate = async (eventData) => {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    await fetchEvents(); // ✅ 作成後に再取得
  };

  // 更新
  const handleUpdate = async (id, eventData) => {
    await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    await fetchEvents(); // ✅ 更新後に再取得
  };

  // 削除
  const handleDelete = async (id) => {
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    await fetchEvents(); // ✅ 削除後に再取得
  };

  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### パターン2: フォーム送信後のデータ更新

```jsx
function EventForm() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ title: '', date: '' });

  // データ取得関数
  const fetchEvents = useCallback(async () => {
    const response = await fetch('/api/events');
    const data = await response.json();
    setEvents(data);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // フォーム送信
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setFormData({ title: '', date: '' }); // フォームをリセット
    await fetchEvents(); // ✅ 送信後に最新データを取得
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      <button type="submit">送信</button>
    </form>
  );
}
```

---

## チェックリスト

### 関数を定義する前に確認すること

- [ ] 関数を複数の場所から呼び出す必要があるか？
  - はい → コンポーネントのスコープで定義
  - いいえ → `useEffect`内で定義してもOK
- [ ] 関数がstateやpropsに依存しているか？
  - はい → `useCallback`でメモ化
  - いいえ → 通常の関数定義でOK
- [ ] 関数を他のコンポーネントでも使うか？
  - はい → カスタムフックに抽出
  - いいえ → コンポーネント内で定義

### コードレビュー時の確認ポイント

- [ ] `useEffect`内で定義された関数が外部から呼び出されていないか
- [ ] `useCallback`の依存配列が正しく設定されているか
- [ ] 無限ループの原因となる依存関係がないか

---

## まとめ

1. **問題**: `useEffect`内で定義した関数は、そのスコープ内でのみ有効で、外部から呼び出せない
2. **解決策**: 関数をコンポーネントのスコープで定義する
3. **最適化**: 依存関係がある場合は`useCallback`でメモ化する
4. **再利用**: 複数のコンポーネントで使う場合はカスタムフックに抽出する

---

## 関連ページ

- [[03_useEffectとstateの実践活用|useEffectとstateの実践活用]]
- [[17-3-状態管理エラー|状態管理エラー]]
- [[17-1-エラー予防ガイド|エラー予防ガイド]]
