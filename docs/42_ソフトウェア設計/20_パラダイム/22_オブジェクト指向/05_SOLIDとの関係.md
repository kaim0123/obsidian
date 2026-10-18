# オブジェクト指向とSOLIDの関係

## はじめに

オブジェクト指向プログラミング（OOP）の基本を理解したら、次に学ぶべきは **良いOOPコードを書くための設計原則** です。それが **SOLID原則** です。

ここでは、OOPの3大要素（カプセル化・継承・多態性）と、SOLIDの5原則がどう結びつくのかを整理します。

---

## SOLIDの5原則（おさらい）

| 記号 | 名称 | 一言で |
|------|------|--------|
| **S** | Single Responsibility Principle（単一責任） | 1クラス1責任 |
| **O** | Open-Closed Principle（開放閉鎖） | 拡張には開き、変更には閉じる |
| **L** | Liskov Substitution Principle（リスコフ置換） | 子は親の代わりになれる |
| **I** | Interface Segregation Principle（インターフェース分離） | 使わないメソッドを押しつけない |
| **D** | Dependency Inversion Principle（依存性逆転） | 抽象に依存する |

---

## OOPの3要素とSOLIDの対応

```
OOPの3要素          SOLID原則
───────────         ───────────
カプセル化    ──→   S（単一責任）
                    → 状態と責任を1つにまとめる

継承・多態性  ──→   L（リスコフ置換）
                    → 子は親の期待を守る

                    O（開放閉鎖）
                    → 多態性で拡張

抽象化        ──→   I（インターフェース分離）
                    → 必要最小限の約束

                    D（依存性逆転）
                    → 具象でなく抽象に依存
```

---

## S: 単一責任の原則（SRP）

**1つのクラスは、1つの責任だけを持つ。**

### OOPとの関係

カプセル化の目的は「**関連するデータと振る舞いをひとまとめにする**」ことですが、無関係なものまで詰め込むとクラスが肥大化します。SRPは「**まとめる単位を誤らない**」ための指針です。

### 悪い例

```javascript
class User {
  save() { /* DB保存（永続化の責任） */ }
  sendEmail() { /* メール送信（通知の責任） */ }
  render() { /* HTML生成（表示の責任） */ }
}
```

### 良い例

```javascript
class User { /* ユーザーの状態と振る舞い */ }
class UserRepository { save(user) { } }
class UserMailer { sendWelcome(user) { } }
class UserView { render(user) { } }
```

---

## O: 開放閉鎖の原則（OCP）

**拡張に対して開いており、変更に対して閉じている。**

### OOPとの関係

多態性のメリットを最大化する原則です。**既存のコードを変更せず、新しいクラスを追加するだけで機能を拡張** できるようにする。

### 悪い例

```javascript
function calcPrice(item) {
  if (item.type === 'book') return item.price * 0.9;
  if (item.type === 'food') return item.price * 0.95;
  // 種類が増えるたびにここを変更…
}
```

### 良い例

```javascript
class Item {
  calcPrice() { throw new Error('サブクラスで実装'); }
}
class Book extends Item { calcPrice() { return this.price * 0.9; } }
class Food extends Item { calcPrice() { return this.price * 0.95; } }
// 新種類を追加 → 新クラスを足すだけ
```

---

## L: リスコフ置換の原則（LSP）

**親の代わりに子を使っても、プログラムは壊れない。**

### OOPとの関係

継承・多態性が **正しく機能するための前提条件**。LSPを破る継承は、見かけ上 is-a 関係でも設計として破綻しています。

### 悪い例

```javascript
class Rectangle {
  setWidth(w) { this.w = w; }
  setHeight(h) { this.h = h; }
  area() { return this.w * this.h; }
}

class Square extends Rectangle {
  setWidth(w) { this.w = this.h = w; } // 同時に変わる
  setHeight(h) { this.w = this.h = h; }
}

function test(rect) {
  rect.setWidth(5);
  rect.setHeight(3);
  console.log(rect.area()); // 長方形なら15だが、正方形だと9
}
```

「正方形は長方形の一種」と思えても、**振る舞いの約束** が破れるのでLSP違反です。

---

## I: インターフェース分離の原則（ISP）

**使わないメソッドを無理やり実装させない。**

### OOPとの関係

インターフェースを **役割ごとに小さく切り分ける** 指針。大きな汎用インターフェースではなく、**専門的な小さいインターフェース** を複数作る。

### 悪い例

```typescript
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
}

class Robot implements Worker {
  work() { /* OK */ }
  eat() { throw new Error('食べない'); } // 困る
  sleep() { throw new Error('眠らない'); } // 困る
}
```

### 良い例

```typescript
interface Workable { work(): void; }
interface Eatable { eat(): void; }
interface Sleepable { sleep(): void; }

class Human implements Workable, Eatable, Sleepable { /* 全部実装 */ }
class Robot implements Workable { /* workだけでOK */ }
```

---

## D: 依存性逆転の原則（DIP）

**具体に依存せず、抽象に依存する。**

### OOPとの関係

多態性・インターフェースを **設計の方向付け** に使う原則。**上位モジュールが下位モジュールに引きずられない** ように、間に抽象を挟む。

### 悪い例

```javascript
class UserService {
  constructor() {
    this.db = new MySQLDatabase(); // 具体クラスに依存
  }
}
```

### 良い例

```typescript
interface UserRepository {
  save(user: User): void;
}

class UserService {
  constructor(private repo: UserRepository) {} // 抽象に依存
}

class MySQLUserRepo implements UserRepository { /* ... */ }
class MongoUserRepo implements UserRepository { /* ... */ }
```

DBを変えても `UserService` は変更不要。これが依存性逆転の効果です。

→ 詳しくは [[02_依存関係逆転の原則]]

---

## 全体の構図

```
         ┌──────────────────────────────┐
         │   使いやすく壊れにくいコード   │
         └──────────────────────────────┘
                    ↑
         ┌──────────┼──────────┐
         S           O           L
       単一責任    開放閉鎖    置換可能
         │          │          │
         ↓          ↓          ↓
      クラス       多態         継承
       設計      で拡張     の正しさ
                    │          
                 ┌──┴──┐
                 I      D
              小さな   抽象に
              API     依存
```

---

## まとめ

- **OOPの道具** を使って良い設計を作るための **指針** がSOLID
- OOPを書くだけでは不十分。SOLIDに沿って **責任・拡張・依存** を整える
- 1つ1つは特別なテクではなく、**当たり前を当たり前にやる** ための名前

---

## 関連ノート

- [[00_設計原則の変遷|SOLID]]
- [[02_クラスとオブジェクト]]
- [[03_継承と合成]]
- [[04_多態とインターフェース]]
- [[01_DRY_KISS_YAGNI]]
