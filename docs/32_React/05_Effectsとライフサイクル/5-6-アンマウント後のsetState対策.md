# 5-6 アンマウント後のsetState対策（キャンセル/ガード）

## 🎯 この章で学ぶこと

- 「アンマウント後のsetState」が何を意味するかを理解できます
- なぜそれが警告やバグの原因になるかが分かります
- フラグでガードするパターン、`AbortController` で中断するパターンを使い分けられるようになります
- React 18 以降では警告が出なくなったが、それでも対策が必要な理由を学びます
- 非同期処理を扱うときの基本的な防御パターンを身につけます

## 📖 概念の説明

### 何が起きてるの？

非同期処理（fetchやsetTimeout）の途中で、コンポーネントが画面から消えたとします。あとから処理が完了して `setState` を呼ぼうとしたとき、**もうそのコンポーネントは存在しない** のに状態を更新しようとしてしまう、というのがこの問題です。

例えるなら、**配達員が荷物を持って訪ねたら家がもう取り壊されていた** ような状態です。届け先がないのに、何かをしようとしている。

React 17以前では、この状況で次のような警告が出ていました。

```
Warning: Can't perform a React state update on an unmounted component.
This is a no-op, but it indicates a memory leak in your application.
```

React 18以降では、この警告自体は削除されました。それでも対策が必要な理由は次の通りです。

- 不要な処理（fetchの完了待ち）が走り続けて **リソースの無駄**
- 古いリクエストの結果が **新しい状態を上書き** してしまう（例：高速タイピング検索）
- メモリが解放されず、最終的に **重くなる可能性**

つまり「警告が出なくなった＝対策不要」ではなく、ユーザー体験のために **明示的に止めるべき** ということです。

### 対策の2つのアプローチ

**1. ガード（フラグでチェック）**
「もう要らない」というフラグを立てて、`setState` を呼ぶ前にチェックする。

**2. キャンセル（処理自体を止める）**
`AbortController` などで処理そのものを中断する。

ガードは「**返ってきても無視する**」、キャンセルは「**そもそも返さない**」という違いです。理想はキャンセル、最低限はガードです。

### 用語の整理

- **アンマウント**：コンポーネントが画面から消えること
- **ガード（guard）**：処理を実行する前にチェックすること
- **キャンセル（cancel）**：実行中の処理を中断すること
- **AbortController**：fetchを中断するための標準API

## 💻 コード例

### 例1：問題のあるコード（対策なし）

```jsx
import { useEffect, useState } from 'react';

function Bad({ id }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(r => r.json())
      .then(data => {
        setUser(data); // アンマウント後でも setState を呼ぶ
      });
  }, [id]);

  return <div>{user?.name}</div>;
}
```

このコードは、`id` が高速に変わったり、コンポーネントが急に消えたりすると、古い結果で上書きされる可能性があります。

### 例2：フラグでガードする

```jsx
function GuardedUser({ id }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true; // この呼び出しは「現役」かを示すフラグ

    fetch(`/api/users/${id}`)
      .then(r => r.json())
      .then(data => {
        if (active) { // ガード：現役のときだけ setState
          setUser(data);
        }
      });

    return () => {
      active = false; // 次回のEffect実行時 or アンマウント時にフラグを下ろす
    };
  }, [id]);

  return <div>{user?.name}</div>;
}
```

`active` はクロージャで保持される変数。クリーンアップで `false` にすると、まだ走っているPromiseの中の `if (active)` が `false` になって `setUser` がスキップされます。

### 例3：AbortControllerでキャンセルする

```jsx
function CancellableUser({ id }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/users/${id}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => setUser(data))
      .catch(err => {
        if (err.name === 'AbortError') {
          return; // キャンセルされた → 何もしない
        }
        throw err;
      });

    return () => {
      controller.abort(); // fetchを実際に中断
    };
  }, [id]);

  return <div>{user?.name}</div>;
}
```

`AbortController` を使うと、fetchそのものが中断されてネットワークの無駄も省けます。これが理想形です。詳しくは [[../07_データ取得/7-4-AbortControllerでキャンセル]]。

### 例4：setTimeoutの場合

```jsx
function DelayedMessage() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const id = setTimeout(() => {
      setMessage('5秒経ちました');
    }, 5000);

    return () => clearTimeout(id); // タイマーを止める
  }, []);

  return <p>{message}</p>;
}
```

`setTimeout` の場合は `clearTimeout` で止めるだけ。`setInterval` も `clearInterval` で同様です。

### 例5：複数の非同期処理がある場合

```jsx
function MultiFetch({ id }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      fetch(`/api/users/${id}`, { signal: controller.signal }).then(r => r.json()),
      fetch(`/api/users/${id}/posts`, { signal: controller.signal }).then(r => r.json()),
    ])
      .then(([userData, postsData]) => {
        setUser(userData);
        setPosts(postsData);
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });

    return () => controller.abort();
  }, [id]);

  return <div>...</div>;
}
```

1つの `AbortController` を共有することで、まとめて中断できます。

### 例6：カスタムフックで使い回す

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then(r => r.json())
      .then(setData)
      .catch(e => { if (e.name !== 'AbortError') throw e; });

    return () => controller.abort();
  }, [url]);

  return data;
}

// 使う側
function Component() {
  const user = useFetch('/api/me');
  return <div>{user?.name}</div>;
}
```

カスタムフックにまとめると、毎回ガードコードを書かずに済みます。

## ❌ よくある間違い

### 1. ガードを忘れる

```jsx
// ❌ アンマウント後でも setUser が走る
useEffect(() => {
  fetch('/api/data').then(r => r.json()).then(setData);
}, []);
```

何の対策もないコード。短いプロトタイプなら許容できますが、本番では避けたいパターンです。

### 2. AbortErrorをcatchで握りつぶさない

```jsx
// ❌ AbortErrorまでエラーログに出してしまう
.catch(err => console.error(err));
```

`AbortError` は **意図的なキャンセル** なので、エラー扱いしてはいけません。`if (err.name === 'AbortError') return;` で除外します。

### 3. クリーンアップで `controller.abort()` を呼び忘れる

```jsx
// ❌ controllerを作っただけで使ってない
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(...);
  // returnしてないのでabortされない
}, [url]);
```

クリーンアップ関数で必ず `abort` を呼びましょう。

### 4. `active` フラグを依存配列に入れる

```jsx
// ❌ activeはクロージャで管理するので依存に入れない
let active = true;
useEffect(() => {
  // ...
}, [active]); // ナンセンス
```

`active` はEffectの内側のローカル変数として使います。

## ✅ ベストプラクティス

1. **非同期処理 + setStateには必ず防御を入れる**：ガードかキャンセルのいずれかを必ず書く。
2. **AbortControllerを優先する**：処理自体を止められるなら、その方が省エネ。
3. **AbortErrorは握りつぶさず、ただしエラー扱いしない**：明示的にスキップする処理を書く。
4. **カスタムフックにパターンをまとめる**：何度も書くなら使い回しを考えます。
5. **可能ならデータ取得ライブラリ（TanStack Queryなど）に任せる**：自分で書かずに済みます（[[../07_データ取得/7-5-データ取得ライブラリ]]）。

## 🔬 実践演習

### お題：高速で切り替えても壊れない検索

検索ボックスに文字を打つと、サーバーから候補を取得して表示する。文字を高速に打ち変えても、**最後の入力に対する結果だけ** が表示されるように `AbortController` で実装してみましょう。

ヒント：

- `useState` で `query` を管理
- `useEffect` で `query` を依存にfetch
- クリーンアップで `controller.abort()`
- `AbortError` はスキップ

### 発展課題

- フラグ方式でも同じものを書いて、違いを比較しましょう
- ネットワークタブを開いて、古いリクエストが本当にキャンセルされていることを確認しましょう

## 📝 まとめ

- アンマウント後の `setState` は警告は出なくても、ユーザー体験を損ねる原因になります
- 対策はガード（フラグ）かキャンセル（AbortController）の2択
- AbortControllerを使えば、ネットワーク自体を中断できます
- AbortErrorはエラー扱いしないでスキップする
- カスタムフックやデータ取得ライブラリで、自分で書く量を減らせます

---

## 📎 統合：`04_isMountedフラグとアンマウント後のsetState防止`（全文）

[[17-4-メモリリーク]] の「ガード」と対になる詳細事例です。

# isMountedフラグとアンマウント後のsetState防止

## 概要

Reactコンポーネントで非同期処理（API呼び出しなど）を行った際、コンポーネントがアンマウントされた後に`setState`を呼び出すと、警告が発生したりメモリリークの原因となります。`isMounted`フラグを使用することで、この問題を防ぐことができます。

## 問題の症状

### 警告メッセージ

```
Warning: Can't perform a React state update on an unmounted component.
This is a no-op, but it indicates a memory leak in your application.
To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
```

### 発生する状況

- 非同期API呼び出し中にコンポーネントがアンマウントされる
- タイマーやWebSocketのコールバックでアンマウント後にsetStateが呼ばれる
- ページ遷移が速く、前のページのコンポーネントがまだ処理中

## 問題のコード例

### ❌ 悪い例：アンマウント後のsetState

```typescript
import { useState, useEffect } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 非同期処理
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        // コンポーネントがアンマウントされていても実行される
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        // アンマウント後でも実行される
        console.error(err);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}
```

### 何が問題なのか？

1. **API呼び出し中にページ遷移**すると、コンポーネントがアンマウントされる
2. **APIレスポンスが返ってきた時点**で、コンポーネントは既に存在しない
3. **setStateを呼び出そうとして警告が発生**する
4. **メモリリークの原因**となる可能性がある

## 解決方法

### 方法1：AbortControllerを使用（推奨）

現代的なアプローチとして、`AbortController`を使用してリクエストをキャンセルします。

```typescript
import { useState, useEffect } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/users/${userId}`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        // AbortErrorは無視（アンマウントによるキャンセル）
        if (err.name !== 'AbortError') {
          console.error(err);
          setLoading(false);
        }
      });

    // クリーンアップ関数でリクエストをキャンセル
    return () => {
      controller.abort();
    };
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}
```

### 方法2：isMountedフラグを使用

`isMounted`フラグを使用して、コンポーネントがマウントされているかどうかを追跡します。

```typescript
import { useState, useEffect, useRef } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        // マウントされている場合のみsetState
        if (isMountedRef.current) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMountedRef.current) {
          console.error(err);
          setLoading(false);
        }
      });

    // クリーンアップ関数でフラグをfalseに
    return () => {
      isMountedRef.current = false;
    };
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}
```

### 方法3：カスタムフックで抽象化

`isMounted`フラグのロジックをカスタムフックに抽出して再利用します。

```typescript
import { useEffect, useRef } from 'react';

// カスタムフック：isMountedフラグを管理
function useIsMounted() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
}

// 使用例
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useIsMounted();

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (isMountedRef.current) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMountedRef.current) {
          console.error(err);
          setLoading(false);
        }
      });
  }, [userId, isMountedRef]);

  if (loading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}
```

## 各方法の比較

### AbortController（推奨）

**メリット**
- リクエスト自体をキャンセルできる（ネットワークリソースの節約）
- 標準的なAPIで、モダンなアプローチ
- ブラウザのネイティブ機能

**デメリット**
- すべての非同期処理で使えるわけではない（タイマーなどには使えない）

### isMountedフラグ

**メリット**
- あらゆる非同期処理に適用可能（タイマー、Promise、コールバックなど）
- シンプルで理解しやすい
- 既存のコードに追加しやすい

**デメリット**
- リクエスト自体はキャンセルされない（ネットワークリソースは消費される）
- 手動でフラグを管理する必要がある

## 実践例

### 例1：タイマーでの使用

```typescript
import { useState, useEffect, useRef } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const interval = setInterval(() => {
      if (isMountedRef.current) {
        setSeconds(prev => prev + 1);
      }
    }, 1000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  return <div>経過時間: {seconds}秒</div>;
}
```

### 例2：複数の非同期処理

```typescript
import { useState, useEffect, useRef } from 'react';

function DataFetcher({ resourceId }: { resourceId: string }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    setError(null);

    // 複数の非同期処理
    Promise.all([
      fetch(`/api/resource/${resourceId}`).then(res => res.json()),
      fetch(`/api/metadata/${resourceId}`).then(res => res.json())
    ])
      .then(([resource, metadata]) => {
        if (isMountedRef.current) {
          setData({ resource, metadata });
        }
      })
      .catch(err => {
        if (isMountedRef.current) {
          setError(err.message);
        }
      });

    return () => {
      isMountedRef.current = false;
    };
  }, [resourceId]);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading...</div>;
  return <div>{/* データを表示 */}</div>;
}
```

### 例3：WebSocketでの使用

```typescript
import { useState, useEffect, useRef } from 'react';

function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<string[]>([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const ws = new WebSocket(`ws://example.com/rooms/${roomId}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (isMountedRef.current) {
        setMessages(prev => [...prev, message]);
      }
    };

    ws.onerror = (error) => {
      if (isMountedRef.current) {
        console.error('WebSocket error:', error);
      }
    };

    return () => {
      isMountedRef.current = false;
      ws.close();
    };
  }, [roomId]);

  return (
    <div>
      {messages.map((msg, idx) => (
        <div key={idx}>{msg}</div>
      ))}
    </div>
  );
}
```

## Next.jsでの注意点

### サーバーサイドレンダリング（SSR）

Next.jsでは、サーバー側でもコンポーネントがレンダリングされるため、`window`やブラウザAPIを使用する場合は注意が必要です。

```typescript
import { useState, useEffect, useRef } from 'react';

function ClientOnlyComponent() {
  const [data, setData] = useState(null);
  const isMountedRef = useRef(false); // 初期値はfalse

  useEffect(() => {
    // クライアント側でのみ実行
    isMountedRef.current = true;

    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (isMountedRef.current) {
          setData(data);
        }
      });

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // SSR時は何も表示しない
  if (!isMountedRef.current) {
    return null;
  }

  return <div>{data?.content}</div>;
}
```

## ベストプラクティス

### 1. AbortControllerを優先的に使用

API呼び出しの場合は、`AbortController`を使用してリクエストをキャンセルすることを推奨します。

### 2. カスタムフックで抽象化

`isMounted`フラグのロジックは、カスタムフックに抽出して再利用性を高めます。

### 3. クリーンアップ関数を必ず実装

`useEffect`のクリーンアップ関数で、必ずフラグをリセットします。

### 4. useRefを使用

`useState`ではなく`useRef`を使用することで、再レンダリングを引き起こさずにフラグを管理できます。

## まとめ

- **アンマウント後のsetStateは警告とメモリリークの原因**となる
- **AbortController**を使用してリクエストをキャンセルする（推奨）
- **isMountedフラグ**を使用して、マウント状態をチェックする
- **カスタムフック**でロジックを抽象化して再利用性を高める
- **クリーンアップ関数**で必ずフラグをリセットする

適切に実装することで、メモリリークを防ぎ、アプリケーションの安定性を向上させることができます。

## 関連ファイル

- [[17-1-エラー予防ガイド|エラー予防ガイド]]
- [[03_useEffectとstateの実践活用|useEffectとstateの実践活用]]
- [[9-6-ボタンが反応しない系の原因|ボタン無応答・メモリリークの整理]]

## 🔗 関連ページ

- [[5-3-クリーンアップ]]
- [[5-4-StrictModeで2回動く理由]]
- [[5-5-よくあるバグ集]]
- [[../07_データ取得/7-4-AbortControllerでキャンセル]]
- [[../07_データ取得/7-5-データ取得ライブラリ]]
- [[9-6-ボタンが反応しない系の原因]]
- [[17-4-メモリリーク]]
