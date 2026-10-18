# CQS — コマンドとクエリの分離

## この章の目的

**CQS（Command-Query Separation）** — 状態を変える操作と値を返す操作を分ける原則を学ぶ章です。

---

## 1. Command（状態を変える）と Query（値を返す）

Bertrand Meyer（1988）が提唱した **CQS** は、メソッドを 2 種類に分類します。

| 種類 | 役割 | 戻り値 |
|------|------|--------|
| **Command（コマンド）** | 状態を変える | なし（void） |
| **Query（クエリ）** | 値を返す | あり |

```javascript
// Command: 副作用あり、戻り値なし
function activateUser(user) {
  user.isActive = true;
}

// Query: 副作用なし、値を返す
function isActive(user) {
  return user.isActive;
}
```

**原則**: Query は **副作用を持たない**。Command は **戻り値を返さない**（厳密な解釈）。

---

## 2. `get` / `is` / `has` / `can` に副作用を入れない

getter 系メソッドに **副作用** があると、呼び出し側が予測できません。

```javascript
// 悪い例: getter が副作用を持つ
function getUser(id) {
  logger.info(`accessed user ${id}`);  // 副作用
  cache.touch(id);                      // 副作用
  return db.findUser(id);
}

// 良い例: Query は純粋に
function getUser(id) {
  return db.findUser(id);
}
// ログは呼び出し側または別レイヤーで
```

`is` / `has` / `can` / `should` も同様に **副作用なし** が原則です。

---

## 3. 取得メソッドが副作用を持つ典型例

| アンチパターン | 問題 |
|--------------|------|
| **Lazy 初期化で getter が生成** | 初回アクセスで DB 書き込み |
| **getter 内でキャッシュ更新** | 読むたびに状態が変わる |
| **getter 内でログ・メトリクス** | テストで副作用をモックする必要 |

```javascript
// 問題: getTotal() が内部状態を更新
function getTotal(order) {
  order.lastAccessed = Date.now();  // 副作用
  return order.cachedTotal;
}
```

---

## 4. CQS の pragmatic な例外（lazy 初期化など）

実務では **厳密な CQS** が難しい場面があります。

| 例外 | 理由 | 対処 |
|------|------|------|
| **Lazy 初期化** | 初回だけ生成 | `getOrCreate()` 等、意図を名前で明示 |
| **キャッシュ** | パフォーマンス | 更新は Command に分離 |
| **Fluent API** | `builder.build()` | チームで例外として文書化 |

```javascript
// 例外を明示する命名
function getOrInitializeConfig() {
  if (!this._config) this._config = loadConfig();
  return this._config;
}
```

---

## 5. CQRS との関係（メソッド版 vs システム版）

| 概念 | スコープ | 内容 |
|------|----------|------|
| **CQS** | メソッド・クラス | 読むと書くを分ける |
| **CQRS** | システム・アーキテクチャ | 読み取りモデルと書き込みモデルを分離 |

CQS は **1 メソッドの設計原則**、CQRS は **システム全体のパターン** です。  
メソッドで CQS を守ると、CQRS への移行も容易になります。

---

## まとめ

- CQS = Command（変更）と Query（取得）を分離
- getter 系に副作用を入れない
- Lazy 初期化等は pragmatic な例外として名前で明示
- CQRS はシステム版、CQS はメソッド版

→ 次の章: [[02_純粋関数と副作用]]
