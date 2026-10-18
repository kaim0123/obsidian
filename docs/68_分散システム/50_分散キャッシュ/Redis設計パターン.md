# Redis 設計パターン

## はじめに

**Redis** は単なるキャッシュサーバではなく、**多機能なデータ構造ストア** です。文字列・ハッシュ・リスト・集合・ソート集合・ストリーム・Pub/Sub・Luaスクリプト・トランザクション …… あらゆる分散システムの道具箱として使えます。

本記事では、Redis を **設計パターン** として使いこなす実務テクニックを整理します。

---

## Redis のデータ構造（まずはこれ）

### 1. String（文字列 / 最も基本）

```
GET key
SET key value
SETEX key 300 value    ← TTL 付き
INCR counter           ← アトミックに +1
```

用途:
- キャッシュ値
- カウンタ
- ロック

### 2. Hash

```
HSET user:123 name "Alice" age 30 email "a@b.c"
HGET user:123 name
HGETALL user:123
```

用途:
- 構造化データ（ユーザープロファイル等）
- JSON よりメモリ効率が良い

### 3. List（両端キュー）

```
LPUSH queue:tasks "task-1"
RPUSH queue:tasks "task-2"
LPOP queue:tasks       ← 先頭取得
BLPOP queue:tasks 5    ← ブロックして待つ
```

用途:
- シンプルなジョブキュー
- 最近N件のタイムライン

### 4. Set（順序なし集合）

```
SADD tags:post:1 "redis" "cache" "db"
SISMEMBER tags:post:1 "cache"     ← 1 (true)
SINTER tags:post:1 tags:post:2    ← 交差
```

用途:
- タグ
- ユニークな訪問者の集計
- 関心タグの交差

### 5. Sorted Set（ソート済み集合）

```
ZADD leaderboard 100 "Alice" 80 "Bob" 95 "Charlie"
ZREVRANGE leaderboard 0 9      ← トップ10
ZRANK leaderboard "Alice"      ← 順位
```

用途:
- ランキング
- 時系列インデックス
- レートリミット（スコアに時刻）

### 6. Stream（Kafka 的ログ）

```
XADD events * type "click" user_id 123
XREAD COUNT 10 STREAMS events 0
```

用途:
- イベントストリーム
- Consumer Group による並列処理

### 7. Pub/Sub

```
SUBSCRIBE channel-1
PUBLISH channel-1 "hello"
```

用途:
- リアルタイム通知
- 軽量な Pub/Sub

### 8. Bitmap / HyperLogLog / Geo

- ユニーク計測、位置情報、集合推定等の特殊データ構造

---

## 設計パターン集

### 1. Cache-aside

最も基本。Cache-aside 戦略を Redis で:

```python
def get_user(user_id):
    cached = r.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)
    user = db.query(user_id)
    r.setex(f"user:{user_id}", 300, json.dumps(user))
    return user
```

詳細: `キャッシュ戦略.md`

### 2. 分散ロック (SETNX + TTL)

```python
def acquire_lock(key, ttl=10):
    return r.set(f"lock:{key}", "1", nx=True, ex=ttl)

def release_lock(key):
    r.delete(f"lock:{key}")
```

- `nx=True`: 存在しないときだけセット（排他）
- `ex=10`: 10秒 TTL（ロック取ったまま死んでも10秒で自動解放）
- **確実性重視なら Redlock アルゴリズム**（複数 Redis での合意）

### 3. レートリミット

Sliding Window 風:

```python
def rate_limit(user_id, limit=100, window=60):
    now = int(time.time())
    key = f"rate:{user_id}"
    # ソート集合に時刻を記録
    r.zadd(key, {str(now): now})
    # 古いエントリを削除
    r.zremrangebyscore(key, 0, now - window)
    # 残り数
    count = r.zcard(key)
    r.expire(key, window)
    return count <= limit
```

### 4. カウンタ

```python
r.incr("pageviews:home")
r.incr("pageviews:2026-04-24")
r.incrby("stats:revenue", 1000)
```

アトミック、超高速。

### 5. セッションストア

```python
r.setex(f"session:{session_id}", 1800, json.dumps(session_data))
```

複数アプリサーバでセッション共有。

### 6. ジョブキュー (簡易)

```python
# Producer
r.lpush("jobs:queue", json.dumps({"task": "send_email", ...}))

# Consumer (ブロッキング)
_, job = r.brpop("jobs:queue", 0)
process(json.loads(job))
```

DLQ:
```python
# 処理失敗時
r.lpush("jobs:dlq", json.dumps(job))
```

本格的には **Redis Streams + Consumer Group** を使う。

### 7. ランキング

```python
r.zincrby("leaderboard:daily", 10, "user:123")
r.zrevrange("leaderboard:daily", 0, 9, withscores=True)  # Top10
r.expire("leaderboard:daily", 86400)
```

### 8. Pub/Sub 通知

```python
# Publisher
r.publish("notifications", json.dumps({"type": "new_comment", ...}))

# Subscriber
pubsub = r.pubsub()
pubsub.subscribe("notifications")
for message in pubsub.listen():
    process(message)
```

### 9. ユニーク訪問者（HyperLogLog）

```python
r.pfadd("visitors:today", user_id)
r.pfcount("visitors:today")   # ユニーク数（誤差約1%）
```

メモリ消費が **一定（12KB）** で、億単位のユニーク数を扱える魔法。

### 10. 地理情報（Geo）

```python
r.geoadd("shops", (139.7, 35.6, "tokyo"), (135.5, 34.7, "osaka"))
r.georadius("shops", 139.8, 35.7, 50, "km")  # 50km 圏内
```

店舗検索などに。

---

## トランザクション

### MULTI / EXEC

複数コマンドを **アトミックに** 実行:

```python
pipe = r.pipeline()
pipe.set("a", 1)
pipe.set("b", 2)
pipe.incr("counter")
pipe.execute()  # すべて実行、途中失敗は全体失敗
```

### WATCH（楽観的ロック）

```python
with r.pipeline() as pipe:
    while True:
        pipe.watch("balance")
        balance = int(pipe.get("balance"))
        if balance < 100:
            pipe.unwatch()
            raise InsufficientFunds()
        pipe.multi()
        pipe.decrby("balance", 100)
        try:
            pipe.execute()
            break
        except WatchError:
            continue  # 他スレッドが変えた、再試行
```

### Lua スクリプト

複雑なアトミック操作:

```python
script = """
local balance = tonumber(redis.call('GET', KEYS[1]))
if balance < tonumber(ARGV[1]) then
    return 0
end
redis.call('DECRBY', KEYS[1], ARGV[1])
return 1
"""
result = r.eval(script, 1, "balance", "100")
```

- サーバ側で1操作として実行
- 「GET → 判定 → SET」のレース排除

---

## 永続化の設定

Redis はメモリ DB だが、永続化方法あり:

### RDB (Redis Database Backup)

- スナップショット方式
- 定期的にディスクに書き出す
- 高速、ただしクラッシュ時に直近データ喪失の可能性

### AOF (Append Only File)

- すべての書き込みを追記
- 耐久性高、ただしファイル肥大化

### 推奨

- **AOF + 定期 BGREWRITE** が一般的
- キャッシュ用途なら RDB でも可
- **完全喪失 OK ならどちらも不要**（ただし再起動で消える）

---

## 監視・運用

### 覚えておくコマンド

```
INFO           ← 統計
DBSIZE         ← キー数
CLIENT LIST    ← 接続クライアント
SLOWLOG GET    ← 遅いコマンドのログ
MEMORY USAGE key ← キーのメモリサイズ
SCAN 0 MATCH pattern COUNT 100 ← 本番安全な走査
```

### 禁止コマンド（本番）

```
KEYS *    ← 全キースキャンで全体停止
FLUSHDB   ← 全データ削除
FLUSHALL  ← 全 DB 全削除
DEBUG     ← 開発用
```

rename-command で無効化推奨:
```
rename-command FLUSHALL ""
rename-command KEYS ""
```

### クラスタ構成

- **Redis Sentinel**: マスター/スレーブ + 自動フェイルオーバー
- **Redis Cluster**: シャーディング + マルチマスター（16384 スロット）
- クラウドマネージド: ElastiCache / MemoryStore / Upstash / Redis Cloud

---

## パフォーマンスの勘所

### 1. パイプライン

多数のコマンドを **1回のネットワーク往復** でまとめる:

```python
with r.pipeline() as pipe:
    for key in keys:
        pipe.get(key)
    results = pipe.execute()
```

10〜100倍速くなることがある。

### 2. 適切なデータ構造選択

- 「ユーザーの属性5個」→ String 5個より **Hash 1個**
- 「重複なしのタグ」→ List より **Set**
- **誤った構造はメモリ浪費**

### 3. メモリ使用量の把握

- `MEMORY USAGE key` で個別確認
- `INFO memory` で全体
- `allkeys-lru` ポリシー設定

### 4. 大きな値を避ける

- 1キーあたり 100KB 以下が目安
- 巨大な値は分割

### 5. 不要な TTL を避ける

- TTL 監視にコストあり、大量の TTL ありキーは重い

---

## よくある失敗

### 1. `KEYS *` を本番で実行

- 全キースキャン → Redis がブロック → アプリ全停止
- **必ず SCAN を使う**

### 2. セッションに巨大データを詰める

- 100KB 超のセッション → ネットワーク / メモリ圧迫
- 必要最小限に

### 3. TTL なしで SET しまくる

- メモリ爆発 → イビクション → 本来残したいキーまで消える

### 4. Pub/Sub の至上命題化

- Pub/Sub は **配信保証なし**（切断時ロスト）
- 重要な通知は Redis Streams / 専用キュー

### 5. データ構造の選択ミス

- Hash にすべきところを String 複数個
- Set にすべきところを List

### 6. 単一ノード運用

- Redis が落ちたらサービス停止
- Sentinel / Cluster で冗長化

---

## 設計チェックリスト

- [ ] キー命名規則を定めた（`キャッシュキー設計.md` 参照）
- [ ] 各キーに適切な TTL（ジッターあり）
- [ ] 適切なデータ構造を選択
- [ ] `allkeys-lru` 等の eviction policy
- [ ] Sentinel / Cluster での冗長化
- [ ] 永続化戦略（AOF / RDB / なし）
- [ ] モニタリング（メモリ、ヒット率、コマンド数）
- [ ] `KEYS` / `FLUSHALL` の本番禁止

---

## 次に読むもの

- `キャッシュ戦略.md` — Cache-aside 等
- `キャッシュキー設計.md` — キー命名
- `TTLとイビクション.md` — 寿命設計
- `コンシステントハッシング.md` — 分散ハッシュ
- `../冪等性/` — レートリミット設計

---

## まとめ

- Redis は **データ構造ストア**、単なるキャッシュではない
- **String / Hash / List / Set / Sorted Set / Stream** を使い分ける
- 主な用途: キャッシュ、分散ロック、レートリミット、ジョブキュー、ランキング
- **SETNX + EX** で分散ロック、**Lua** で複雑なアトミック処理
- 本番で **`KEYS` 禁止、`SCAN` を使う**
- Sentinel / Cluster で **冗長化は必須**
- データ構造の選択がパフォーマンスを左右する
- パイプラインでネットワーク往復を削減
