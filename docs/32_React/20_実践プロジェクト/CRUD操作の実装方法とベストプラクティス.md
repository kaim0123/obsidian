# CRUD操作の実装方法とベストプラクティス

## 概要

CRUD操作（Create, Read, Update, Delete）の実装には主に3つの方法があります。それぞれの特徴、メリット・デメリット、使用場面を詳しく解説します。

## 実装方法の比較表

| 項目 | ローカル状態 | サーバー状態 | ハイブリッド |
|------|---------------|--------------|----------------|
| **実装の複雑さ** | ⭐ 簡単 | ⭐⭐⭐ 複雑 | ⭐⭐ 中程度 |
| **パフォーマンス** | ⭐⭐⭐ 高速 | ⭐⭐ 中程度 | ⭐⭐ 中程度 |
| **データの一貫性** | ❌ 問題あり | ✅ 保証される | ✅ 保証される |
| **オフライン対応** | ✅ 可能 | ❌ 不可 | ⭐⭐ 部分的 |
| **リアルタイム更新** | ❌ 困難 | ✅ 可能 | ✅ 可能 |
| **エラーハンドリング** | ⭐ 簡単 | ⭐⭐⭐ 複雑 | ⭐⭐ 中程度 |
| **楽観的更新** | ✅ 簡単 | ❌ 困難 | ✅ 可能 |
| **データの永続化** | ❌ 一時的 | ✅ 永続的 | ✅ 永続的 |
| **競合状態の管理** | ❌ 困難 | ✅ 可能 | ✅ 可能 |
| **学習コスト** | ⭐ 低い | ⭐⭐⭐ 高い | ⭐⭐ 中程度 |
| **テストのしやすさ** | ⭐⭐ 中程度 | ⭐⭐ 中程度 | ⭐⭐⭐ 簡単 |

### 推奨使用場面

| 実装方法 | 最適な使用場面 | 例 |
|----------|----------------|-----|
| **ローカル状態** | 一時的なデータ操作 | フォーム、計算機、一時的なリスト |
| **サーバー状態** | 永続的なデータ管理 | ユーザー管理、商品管理、ブログ記事 |
| **ハイブリッド** | 複雑なアプリケーション | ECサイト、SNS、プロジェクト管理 |

---

## 1. ローカル状態

### 概要
ReactのuseStateやuseReducerを使用してコンポーネント内でデータを管理する方法

### 実装例

```javascript
import { useState } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, title: '買い物', completed: false },
    { id: 2, title: '会議', completed: true }
  ]);
  const [newTodo, setNewTodo] = useState('');

  // Create: 新しいTodoを作成
  const createTodo = () => {
    if (!newTodo.trim()) return;
    
    const newId = Math.max(...todos.map(t => t.id), 0) + 1;
    const todo = {
      id: newId,
      title: newTodo.trim(),
      completed: false
    };
    
    setTodos([...todos, todo]);
    setNewTodo('');
  };

  // Read: 特定のTodoを取得
  const getTodo = (id) => {
    return todos.find(todo => todo.id === id);
  };

  // Update: Todoを更新
  const updateTodo = (id, updates) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    ));
  };

  // Delete: Todoを削除
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // 一括操作
  const toggleAll = () => {
    const allCompleted = todos.every(todo => todo.completed);
    setTodos(todos.map(todo => ({ ...todo, completed: !allCompleted })));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && createTodo()}
          placeholder="新しいTodoを入力..."
        />
        <button onClick={createTodo}>追加</button>
      </div>

      <div>
        <button onClick={toggleAll}>
          {todos.every(t => t.completed) ? 'すべて未完了' : 'すべて完了'}
        </button>
        <button onClick={clearCompleted}>完了済みを削除</button>
      </div>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(e) => updateTodo(todo.id, { completed: e.target.checked })}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.title}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### メリット
- ✅ **実装が簡単**: useStateで簡単に実装できる
- ✅ **パフォーマンスが良い**: ローカルでの処理で高速
- ✅ **楽観的更新**: 即座にUIが更新される
- ✅ **オフライン対応**: ネットワーク不要で動作する
- ✅ **デバッグが容易**: 状態の変更を追跡しやすい

### デメリット
- ❌ **データの永続化なし**: ページリロードでデータが失われる
- ❌ **データの一貫性**: 複数ユーザー間での同期が困難
- ❌ **リアルタイム更新**: 他のユーザーの変更を反映できない
- ❌ **競合状態の管理**: 同時編集時の問題に対応困難

### 使用場面
- 📝 **フォーム**: 一時的な入力データの管理
- 🧮 **計算機**: 計算結果の一時的な保存
- 🎯 **モーダル**: 一時的なデータ編集
- 📋 **一時的なリスト**: ショッピングカート、お気に入りリスト

---

## 2. サーバー状態

### 概要
サーバーサイドでデータを管理し、APIを通じてCRUD操作を行う方法

### 実装例

```javascript
import { useState, useEffect } from 'react';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // Read: ユーザー一覧を取得
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('ユーザー取得に失敗しました');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create: 新しいユーザーを作成
  const createUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) throw new Error('ユーザー作成に失敗しました');
      const newUser = await response.json();
      setUsers([...users, newUser]);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update: ユーザーを更新
  const updateUser = async (id, userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) throw new Error('ユーザー更新に失敗しました');
      const updatedUser = await response.json();
      setUsers(users.map(user => user.id === id ? updatedUser : user));
      setEditingUser(null);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete: ユーザーを削除
  const deleteUser = async (id) => {
    if (!confirm('このユーザーを削除しますか？')) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('ユーザー削除に失敗しました');
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      {error && <div style={{ color: 'red' }}>エラー: {error}</div>}
      {loading && <div>読み込み中...</div>}

      <button onClick={() => setEditingUser({ name: '', email: '' })}>
        新しいユーザーを追加
      </button>

      <table>
        <thead>
          <tr>
            <th>名前</th>
            <th>メール</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => setEditingUser(user)}>編集</button>
                <button onClick={() => deleteUser(user.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 編集フォーム */}
      {editingUser && (
        <UserForm
          user={editingUser}
          onSave={(userData) => {
            if (editingUser.id) {
              updateUser(editingUser.id, userData);
            } else {
              createUser(userData);
            }
          }}
          onCancel={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}

// ユーザーフォームコンポーネント
function UserForm({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState(user);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="名前"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="メール"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <button type="submit">保存</button>
      <button type="button" onClick={onCancel}>キャンセル</button>
    </form>
  );
}
```

### メリット
- ✅ **データの永続化**: データがサーバーに保存される
- ✅ **データの一貫性**: 複数ユーザー間でデータが同期される
- ✅ **リアルタイム更新**: 他のユーザーの変更を反映可能
- ✅ **競合状態の管理**: 同時編集時の問題に対応可能
- ✅ **バックアップ**: データの損失リスクが低い

### デメリット
- ❌ **実装が複雑**: API設計とエラーハンドリングが必要
- ❌ **ネットワーク依存**: オフライン時は操作不可
- ❌ **パフォーマンス**: ネットワーク遅延の影響を受ける
- ❌ **エラーハンドリング**: 複雑なエラー処理が必要

### 使用場面
- 👥 **ユーザー管理**: アカウント情報の管理
- 🛒 **ECサイト**: 商品、注文、在庫の管理
- 📝 **CMS**: 記事、ページ、コンテンツの管理
- 💼 **業務システム**: 顧客、案件、売上の管理

---

## 3. ハイブリッド

### 概要
ローカル状態とサーバー状態を組み合わせて、最適なユーザー体験を提供する方法

### 実装例（楽観的更新 + サーバー同期）

```javascript
import { useState, useEffect, useCallback } from 'react';

function OptimisticTodoApp() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingOperations, setPendingOperations] = useState(new Set());

  // サーバーからデータを取得
  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/todos');
      if (!response.ok) throw new Error('データ取得に失敗しました');
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 楽観的更新: 即座にローカル状態を更新
  const optimisticUpdate = (operation, tempId = null) => {
    return (data) => {
      const tempTodo = {
        ...data,
        id: tempId || data.id,
        _temp: !!tempId,
        _operation: operation
      };

      switch (operation) {
        case 'create':
          setTodos(prev => [...prev, tempTodo]);
          break;
        case 'update':
          setTodos(prev => prev.map(todo => 
            todo.id === data.id ? tempTodo : todo
          ));
          break;
        case 'delete':
          setTodos(prev => prev.filter(todo => todo.id !== data.id));
          break;
      }

      return tempTodo;
    };
  };

  // サーバー操作の実行
  const performServerOperation = async (operation, data, tempId = null) => {
    const pendingId = tempId || data.id;
    setPendingOperations(prev => new Set(prev).add(pendingId));

    try {
      let response;
      switch (operation) {
        case 'create':
          response = await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          break;
        case 'update':
          response = await fetch(`/api/todos/${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          break;
        case 'delete':
          response = await fetch(`/api/todos/${data.id}`, {
            method: 'DELETE'
          });
          break;
      }

      if (!response.ok) throw new Error(`${operation}操作に失敗しました`);
      
      const serverData = await response.json();
      
      // サーバーデータでローカル状態を更新
      if (operation === 'create') {
        setTodos(prev => prev.map(todo => 
          todo.id === tempId ? { ...serverData, _temp: false } : todo
        ));
      } else if (operation === 'update') {
        setTodos(prev => prev.map(todo => 
          todo.id === data.id ? { ...serverData, _temp: false } : todo
        ));
      }
      // deleteの場合は既にローカルから削除済み

      return serverData;
    } catch (error) {
      // エラー時は元の状態に戻す
      setTodos(prev => {
        if (operation === 'create') {
          return prev.filter(todo => todo.id !== tempId);
        } else if (operation === 'update') {
          return prev.map(todo => 
            todo.id === data.id ? { ...data, _temp: false } : todo
          );
        } else if (operation === 'delete') {
          return [...prev, { ...data, _temp: false }];
        }
        return prev;
      });
      
      setError(error.message);
      throw error;
    } finally {
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(pendingId);
        return newSet;
      });
    }
  };

  // Create: 楽観的更新で新しいTodoを作成
  const createTodo = async (todoData) => {
    const tempId = `temp-${Date.now()}`;
    
    // 楽観的更新
    const tempTodo = optimisticUpdate('create', tempId)(todoData);
    
    // サーバー操作
    try {
      await performServerOperation('create', todoData, tempId);
    } catch (error) {
      // エラーは既にperformServerOperationで処理済み
    }
  };

  // Update: 楽観的更新でTodoを更新
  const updateTodo = async (id, updates) => {
    const originalTodo = todos.find(todo => todo.id === id);
    const updatedData = { ...originalTodo, ...updates };
    
    // 楽観的更新
    optimisticUpdate('update')(updatedData);
    
    // サーバー操作
    try {
      await performServerOperation('update', updatedData);
    } catch (error) {
      // エラーは既にperformServerOperationで処理済み
    }
  };

  // Delete: 楽観的更新でTodoを削除
  const deleteTodo = async (id) => {
    const todoToDelete = todos.find(todo => todo.id === id);
    
    // 楽観的更新
    optimisticUpdate('delete')(todoToDelete);
    
    // サーバー操作
    try {
      await performServerOperation('delete', todoToDelete);
    } catch (error) {
      // エラーは既にperformServerOperationで処理済み
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div>
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          エラー: {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {loading && <div>読み込み中...</div>}

      <TodoForm onSubmit={createTodo} />

      <ul>
        {todos.map(todo => (
          <li key={todo.id} style={{ 
            opacity: pendingOperations.has(todo.id) ? 0.5 : 1,
            borderLeft: todo._temp ? '3px solid orange' : 'none'
          }}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(e) => updateTodo(todo.id, { completed: e.target.checked })}
              disabled={pendingOperations.has(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.title}
              {todo._temp && <small> (同期中...)</small>}
            </span>
            <button 
              onClick={() => deleteTodo(todo.id)}
              disabled={pendingOperations.has(todo.id)}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Todoフォームコンポーネント
function TodoForm({ onSubmit }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit({ title: title.trim(), completed: false });
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="新しいTodoを入力..."
      />
      <button type="submit">追加</button>
    </form>
  );
}
```

### メリット
- ✅ **最適なUX**: 即座にUIが更新され、サーバーでデータが永続化される
- ✅ **エラー処理**: 失敗時は元の状態に戻すことができる
- ✅ **オフライン対応**: 部分的にオフライン操作が可能
- ✅ **データの一貫性**: サーバーとの同期により一貫性を保つ
- ✅ **パフォーマンス**: ローカル更新により高速なレスポンス

### デメリット
- ❌ **実装が複雑**: 楽観的更新のロジックが複雑
- ❌ **競合状態**: 同時編集時の処理が複雑
- ❌ **エラー処理**: 複雑なエラー回復ロジックが必要
- ❌ **テストの複雑さ**: 状態遷移のテストが困難

### 使用場面
- 📱 **モバイルアプリ**: ネットワークが不安定な環境
- 🛒 **ECサイト**: ショッピングカート、お気に入り機能
- 💬 **チャットアプリ**: メッセージの送信
- 📝 **コラボレーションツール**: リアルタイム編集

---

## 組み合わせパターン

実際のアプリケーションでは、操作の種類によって異なる方法を使い分けることが多いです。

### パターン1: 操作別の使い分け

```javascript
function HybridCRUDApp() {
  const [data, setData] = useState([]);
  
  // Read: サーバー状態（データの一貫性が重要）
  const fetchData = async () => {
    // サーバーからデータを取得
  };
  
  // Create: ハイブリッド（楽観的更新）
  const createItem = async (itemData) => {
    // 楽観的更新 + サーバー同期
  };
  
  // Update: ハイブリッド（楽観的更新）
  const updateItem = async (id, updates) => {
    // 楽観的更新 + サーバー同期
  };
  
  // Delete: ローカル状態（確認後サーバー削除）
  const deleteItem = async (id) => {
    // 確認ダイアログ → ローカル削除 → サーバー削除
  };
}
```

### パターン2: データの重要度による使い分け

```javascript
function DataImportanceBasedCRUD() {
  // 重要なデータ: サーバー状態
  const [userProfile, setUserProfile] = useState(null);
  
  // 一時的なデータ: ローカル状態
  const [draftPost, setDraftPost] = useState('');
  
  // 頻繁に更新されるデータ: ハイブリッド
  const [notifications, setNotifications] = useState([]);
}
```

---

## パフォーマンス最適化のポイント

### 1. バッチ処理

```javascript
// 複数の操作をまとめて実行
const batchUpdate = async (operations) => {
  const response = await fetch('/api/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operations })
  });
  return response.json();
};
```

### 2. キャッシュの活用

```javascript
// React Queryを使用したキャッシュ
import { useQuery, useMutation, useQueryClient } from 'react-query';

function CachedCRUD() {
  const queryClient = useQueryClient();
  
  const { data: todos } = useQuery('todos', fetchTodos);
  
  const createMutation = useMutation(createTodo, {
    onSuccess: () => {
      queryClient.invalidateQueries('todos');
    }
  });
}
```

### 3. 仮想化

```javascript
// 大量データの効率的な表示
import { FixedSizeList as List } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].title}
    </div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </List>
  );
}
```

---

## まとめ

| 実装方法 | 適用場面 | 主なメリット | 主なデメリット |
|---------|---------|-------------|---------------|
| **ローカル状態** | 一時的なデータ | 実装が簡単、高速 | データの永続化なし |
| **サーバー状態** | 永続的なデータ | データの一貫性、永続化 | 実装が複雑、ネットワーク依存 |
| **ハイブリッド** | 複雑なアプリ | 最適なUX、エラー処理 | 実装が複雑、テストが困難 |

### 選択の指針

1. **一時的なデータ** → ローカル状態
2. **永続的なデータ** → サーバー状態
3. **複雑な要件** → ハイブリッド
4. **操作の種類** → 操作別の使い分け

---

## 関連リンク

- [[一括操作の実装方法とベストプラクティス|一括操作の実装方法とベストプラクティス]]
- [[ドラッグ&ドロップの実装方法とベストプラクティス|ドラッグ&ドロップの実装方法とベストプラクティス]]
- [[06-state|React状態管理]]
- [[10-database|Node.jsデータベース操作]]
