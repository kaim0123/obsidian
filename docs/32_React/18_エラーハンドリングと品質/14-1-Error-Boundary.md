# 14-1. Error Boundary（できること/できないこと）

## 🎯 この章で学ぶこと

- Error Boundary の役割
- 何をキャッチでき、何をキャッチできないか
- react-error-boundary ライブラリの使い方

---

## 📖 Error Boundary とは

「**子コンポーネントのレンダー中エラー**」をキャッチして、代替UIを表示する仕組み。

通常：レンダー中に例外が起きると、**画面が真っ白**になる。
Error Boundary を使えば「**エラーが起きました**」のような代替表示にできる。

---

## 💻 実装：class component（標準）

Hooks では実装できない、唯一の class が必要なケース。

```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback: ReactNode };
type State = { hasError: boolean };

class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error caught:', error, info);
    // ログ送信なども
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
```

```tsx
<ErrorBoundary fallback={<p>エラーが発生しました</p>}>
  <App />
</ErrorBoundary>
```

---

## 💻 react-error-boundary（推奨）

ライブラリでもっと便利に：

```bash
npm install react-error-boundary
```

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>エラーが発生しました：</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>もう一度</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
  <App />
</ErrorBoundary>
```

---

## 💡 何をキャッチできる？

### ✅ できる

- レンダー中のエラー
- ライフサイクル（componentDidMount等）のエラー
- コンストラクタのエラー

### ❌ できない

- **イベントハンドラ**のエラー（onClick内）
- **非同期コード**（setTimeout、fetch then）
- **サーバサイドレンダリング**（別の仕組みで）
- **Error Boundary自体**のエラー

→ イベント・非同期は **try/catch** で自分で処理する。

---

## 💻 イベントハンドラのエラー対処

```tsx
async function handleClick() {
  try {
    await api.save();
  } catch (err) {
    setError(err.message);
  }
}
```

→ Error Boundary は届かない。手動 try/catch。

### useErrorBoundary（react-error-boundary）

非同期エラーを Error Boundary に投げ直すフック：

```tsx
import { useErrorBoundary } from 'react-error-boundary';

function MyComponent() {
  const { showBoundary } = useErrorBoundary();

  async function load() {
    try {
      await api.fetch();
    } catch (err) {
      showBoundary(err); // 親の Error Boundary が拾う
    }
  }
}
```

---

## 💻 配置場所

### 全アプリ

```tsx
<ErrorBoundary fallback={<p>エラー</p>}>
  <App />
</ErrorBoundary>
```

### ページ単位

```tsx
<Routes>
  <Route path="/" element={
    <ErrorBoundary fallback={<HomeError />}>
      <Home />
    </ErrorBoundary>
  } />
  <Route path="/about" element={
    <ErrorBoundary fallback={<AboutError />}>
      <About />
    </ErrorBoundary>
  } />
</Routes>
```

→ ページが壊れても他のページは生きる。

### 部分的（推奨）

```tsx
<Layout>
  <Header />
  <ErrorBoundary fallback={<p>サイドバーにエラー</p>}>
    <Sidebar />
  </ErrorBoundary>
  <ErrorBoundary fallback={<p>メインにエラー</p>}>
    <Main />
  </ErrorBoundary>
</Layout>
```

→ 一部が壊れてもアプリ全体は生きる。

---

## 💻 reset でリトライ

```tsx
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onReset={() => window.location.reload()}
  resetKeys={[currentUserId]}
>
  <App />
</ErrorBoundary>
```

`resetKeys` の値が変わるとエラー状態がリセットされる。例えば「ユーザー切替で再試行」。

---

## 💻 ログ送信

```tsx
function logError(error, info) {
  fetch('/api/logs', {
    method: 'POST',
    body: JSON.stringify({ message: error.message, stack: error.stack, info }),
  });
}

<ErrorBoundary FallbackComponent={...} onError={logError}>
```

→ Sentry などのツールに送るのが一般的。

---

## ❌ よくある間違い

### イベント内エラーが取れない

→ try/catch + showBoundary を使う。

### Error Boundary の中で stateリセットしない

→ ボタンで `resetErrorBoundary` を呼ぶ。

### ルートに1つだけ置く

→ 1つのエラーで全画面真っ白。**部分的に配置**。

### 開発時にfallbackで隠れて気づかない

→ console.error やSentryで本物のエラーは把握。

---

## ✅ ベストプラクティス

1. **react-error-boundary** を使う
2. **複数階層に配置**（ルート・ページ・コンポーネント単位）
3. **エラー情報をログ送信**
4. **リトライ手段を提供**
5. **イベント・非同期は try/catch + showBoundary**

---

## 🔬 実践演習

「お問い合わせフォーム」を Error Boundary で囲む：

- 投稿時にAPIエラーで例外
- フォームだけ「エラー、もう一度」表示
- 他の部分は生きている

---

## 📝 まとめ

- Error Boundary はレンダーエラーをキャッチ
- イベント・非同期は対象外（try/catch）
- 部分的に配置して影響を局所化
- react-error-boundary が便利

---

## 🔗 関連ページ

- [[14-3-ログ設計]]
- [[7-3-ローディング-エラー-空状態]]
- [[17-2-API連携エラー]]
