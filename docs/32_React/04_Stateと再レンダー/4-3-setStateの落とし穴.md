# 4-3. setStateの落とし穴（非同期・バッチ・関数更新）

## 🎯 この章で学ぶこと

- setState は「すぐ反映されない」こと
- 複数の setState がまとめて処理される（バッチング）
- 関数更新（`prev => ...`）の使いどき

---

## 📖 概念の説明

### 落とし穴1：setState はすぐ反映されない

```jsx
const [count, setCount] = useState(0);

function handleClick() {
  setCount(count + 1);
  console.log(count); // ⚠️ まだ 0！
}
```

setCount は「次の再レンダーで count を1にしてね」と**予約**するだけ。今のレンダーの中の `count` は変わりません。

#### 対処：計算結果を変数に入れる

```jsx
function handleClick() {
  const next = count + 1;
  setCount(next);
  console.log(next); // 1
}
```

---

### 落とし穴2：連続呼び出しが効かない

```jsx
function handleClick() {
  setCount(count + 1); // 0 + 1 = 1
  setCount(count + 1); // 0 + 1 = 1（countは0のまま）
  setCount(count + 1); // 0 + 1 = 1
}
// 結果：1（3を期待していたのに）
```

3回setCountしても、count は最初の0のまま。

#### 対処：関数更新

```jsx
function handleClick() {
  setCount((c) => c + 1); // 0 → 1
  setCount((c) => c + 1); // 1 → 2
  setCount((c) => c + 1); // 2 → 3
}
// 結果：3
```

`(c) => c + 1` は「**最新値を受け取って、新しい値を返す**」関数。Reactが順番に処理するので、ちゃんと3になる。

---

### 落とし穴3：バッチング（まとめ処理）

```jsx
function handleClick() {
  setName('太郎');
  setAge(25);
  setEmail('a@b.com');
}
```

3回setStateを呼んでも、Reactは**1回だけ再レンダー**します。これが「バッチング（batching）」。

#### React 18から：非同期内でも自動バッチング

以前は、setTimeoutやfetchの中だとバッチされませんでした。React 18から自動で全部バッチされる。

```jsx
async function load() {
  const data = await fetch(...);
  setData(data);
  setLoading(false);
  // ここも1回の再レンダーで済む
}
```

---

## 💡 関数更新を使うべき場面

### 1. 直前の値に依存する更新

```jsx
setCount((c) => c + 1);   // 増やす
setItems((items) => [...items, newItem]); // 配列追加
```

### 2. 非同期コールバックの中

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setCount((c) => c + 1); // ← 関数更新
  }, 1000);
  return () => clearInterval(id);
}, []);
```

ここで `setCount(count + 1)` と書くと、`count` が古いままになります（stale closure。 [[5-5-よくあるバグ集]]）。

### 3. 連続更新

→ 上の例参照。

---

## 💻 コード例

### 例：トグルボタン（連続クリック対応）

```jsx
function Toggle() {
  const [count, setCount] = useState(0);
  const [on, setOn] = useState(false);

  function handleClick() {
    // ❌ こうするとonが反転だけしか効かないことがある
    // setOn(!on);
    // setOn(!on);

    // ✅ 関数更新で確実に
    setOn((prev) => !prev);
  }

  return <button onClick={handleClick}>{on ? 'ON' : 'OFF'}</button>;
}
```

### 例：タイマー

```jsx
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => c + 1); // ✅ 古いcountに引きずられない
    }, 1000);
    return () => clearInterval(id);
  }, []); // 依存空でもOK
}
```

---

## ❌ よくある間違い

### setStateの後に値を見て条件分岐

```jsx
// ❌
setCount(count + 1);
if (count > 5) { ... } // 古いcount

// ✅
const next = count + 1;
setCount(next);
if (next > 5) { ... }
```

### 連続更新で +N を期待する

```jsx
// ❌ 1しか増えない
function bulkInc() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
}

// ✅
function bulkInc() {
  setCount(c => c + 1);
  setCount(c => c + 1);
  setCount(c => c + 1);
}
```

### setIntervalで現在のstateを直接読む

```jsx
useEffect(() => {
  setInterval(() => {
    setCount(count + 1); // ❌ count は固まったまま
  }, 1000);
}, []);
```

→ ✅ 関数更新。

### useEffectの依存に毎回新しい値を入れる（無限ループ）

```jsx
useEffect(() => {
  setData(fetchData());
}, [fetchData]); // fetchData が毎回新しい関数だと無限ループ
```

→ 詳細は [[5-5-よくあるバグ集]]。

---

## ✅ ベストプラクティス

1. **直前の値に依存するなら関数更新**（`prev => ...`）
2. **setStateの結果を即読まない**。計算結果を変数に
3. **複数setStateは1回の再レンダーにまとまる**ことを意識
4. **非同期処理の中では関数更新を強く推奨**
5. **useEffectで定期処理**するときは関数更新が基本

---

## 🔬 実践演習

```jsx
// このカウンターは「+1ボタンを連打すると毎回1ずつ増える」を期待しています
// ところが連打しても1しか増えません。なぜ？修正してください

function FastCounter() {
  const [count, setCount] = useState(0);

  function rapidIncrease() {
    for (let i = 0; i < 10; i++) {
      setCount(count + 1);
    }
  }

  return <button onClick={rapidIncrease}>{count} 連打+10</button>;
}
```

---

## 📝 まとめ

- setStateは予約。すぐ反映されない
- 連続呼び出しはバッチで1回の再レンダーに
- 直前値に依存する更新は **関数更新（c => c+1）**
- 非同期内・useEffectでは特に関数更新が安全

---

## 🔗 関連ページ

- [[4-1-useStateの基本]]
- [[4-4-Immutable更新]]
- [[5-5-よくあるバグ集]]
- [[9-2-React-memo-useMemo-useCallback]]
