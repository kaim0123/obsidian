# jq - コマンドラインJSONプロセッサ

## 概要

**jq**は、コマンドラインで**JSONデータを解析・加工・整形**するための軽量で柔軟なツールです。JSONに対する「sed」のような存在であり、REST APIのレスポンス解析、設定ファイルの操作、ログの集計など、JSON を扱うあらゆる場面で活躍します。

### なぜjqが必要か

- REST APIの応答はほとんどがJSON形式
- 設定ファイル（package.json, tsconfig.jsonなど）の操作
- ログデータの解析・集計
- シェルスクリプトでのJSONデータの取り扱い

---

## インストール

```bash
# macOS（Homebrew）
brew install jq

# Ubuntu / Debian
sudo apt install jq

# Windows（Scoop）
scoop install jq

# Windows（Chocolatey）
choco install jq
```

バージョン確認:

```bash
jq --version
```

---

## 基本的な使い方

### JSONの整形（Pretty Print）

```bash
# 圧縮されたJSONを見やすく整形
echo '{"name":"Alice","age":25}' | jq '.'

# 出力:
# {
#   "name": "Alice",
#   "age": 25
# }
```

### ファイルからの読み込み

```bash
jq '.' data.json
```

### パイプラインでの使用

```bash
curl -s https://api.example.com/users | jq '.'
```

---

## 基本フィルタ

### アイデンティティフィルタ（`.`）

入力をそのまま出力します（整形に便利）:

```bash
echo '{"a":1}' | jq '.'
```

### オブジェクトのキーアクセス（`.key`）

```bash
echo '{"name":"Alice","age":25}' | jq '.name'
# → "Alice"

# ネストしたキーへのアクセス
echo '{"user":{"name":"Alice","address":{"city":"Tokyo"}}}' | jq '.user.address.city'
# → "Tokyo"
```

### 配列のアクセス（`.[]`, `.[n]`）

```bash
# 配列の全要素
echo '[1,2,3]' | jq '.[]'
# → 1
# → 2
# → 3

# 特定のインデックス
echo '["a","b","c"]' | jq '.[1]'
# → "b"

# スライス
echo '[1,2,3,4,5]' | jq '.[2:4]'
# → [3, 4]
```

### オブジェクト配列の操作

```bash
# サンプルデータ: users.json
# [
#   {"name": "Alice", "age": 25, "city": "Tokyo"},
#   {"name": "Bob", "age": 30, "city": "Osaka"},
#   {"name": "Charlie", "age": 28, "city": "Tokyo"}
# ]

# 全ユーザーの名前を取得
jq '.[].name' users.json
# → "Alice"
# → "Bob"
# → "Charlie"

# 最初のユーザーの情報
jq '.[0]' users.json

# 最後のユーザー
jq '.[-1]' users.json
```

---

## パイプ演算子（`|`）

jq内でもパイプを使ってフィルタを連結できます:

```bash
echo '{"users":[{"name":"Alice"},{"name":"Bob"}]}' | jq '.users | .[0] | .name'
# → "Alice"

# 上記は以下と同じ
echo '{"users":[{"name":"Alice"},{"name":"Bob"}]}' | jq '.users[0].name'
```

---

## 配列操作

### length（長さ）

```bash
echo '[1,2,3,4,5]' | jq 'length'
# → 5

echo '{"a":1,"b":2}' | jq 'length'
# → 2
```

### map（変換）

配列の各要素に処理を適用:

```bash
echo '[1,2,3,4,5]' | jq 'map(. * 2)'
# → [2, 4, 6, 8, 10]

echo '[{"name":"Alice","age":25},{"name":"Bob","age":30}]' | jq 'map(.name)'
# → ["Alice", "Bob"]
```

### select（フィルタリング）

条件に合う要素だけを抽出:

```bash
echo '[1,2,3,4,5]' | jq 'map(select(. > 3))'
# → [4, 5]

# 30歳以上のユーザーを抽出
jq 'map(select(.age >= 30))' users.json

# Tokyoに住むユーザーの名前
jq '.[] | select(.city == "Tokyo") | .name' users.json
```

### sort_by（ソート）

```bash
jq 'sort_by(.age)' users.json          # 年齢の昇順
jq 'sort_by(.age) | reverse' users.json # 年齢の降順
jq 'sort_by(.name)' users.json         # 名前のアルファベット順
```

### group_by（グループ化）

```bash
jq 'group_by(.city)' users.json
# → [
#   [{"name":"Bob","age":30,"city":"Osaka"}],
#   [{"name":"Alice","age":25,"city":"Tokyo"},{"name":"Charlie","age":28,"city":"Tokyo"}]
# ]

# 都市ごとの人数
jq 'group_by(.city) | map({city: .[0].city, count: length})' users.json
```

### unique / unique_by

```bash
echo '[1,2,2,3,3,3]' | jq 'unique'
# → [1, 2, 3]

jq '[.[].city] | unique' users.json
# → ["Osaka", "Tokyo"]
```

### flatten

```bash
echo '[[1,2],[3,[4,5]]]' | jq 'flatten'
# → [1, 2, 3, 4, 5]
```

---

## オブジェクト操作

### keys / values

```bash
echo '{"name":"Alice","age":25,"city":"Tokyo"}' | jq 'keys'
# → ["age", "city", "name"]

echo '{"name":"Alice","age":25}' | jq 'values'
# → ["Alice", 25]
```

### has（キーの存在確認）

```bash
echo '{"name":"Alice","age":25}' | jq 'has("name")'
# → true

echo '{"name":"Alice","age":25}' | jq 'has("email")'
# → false
```

### to_entries / from_entries

オブジェクトをキー・バリューペアの配列に変換、またはその逆:

```bash
echo '{"a":1,"b":2}' | jq 'to_entries'
# → [{"key":"a","value":1},{"key":"b","value":2}]

echo '[{"key":"a","value":1},{"key":"b","value":2}]' | jq 'from_entries'
# → {"a":1,"b":2}

# to_entries + map + from_entries でオブジェクトを変換
echo '{"a":1,"b":2}' | jq 'to_entries | map(.value += 10) | from_entries'
# → {"a":11,"b":12}
```

### オブジェクトの構築

```bash
# 新しいオブジェクトを構築
jq '.[] | {username: .name, location: .city}' users.json

# 配列として構築
jq '[.[] | {username: .name, location: .city}]' users.json
```

### add（結合）

```bash
# 配列の合計
echo '[1,2,3,4,5]' | jq 'add'
# → 15

# オブジェクトのマージ
echo '[{"a":1},{"b":2},{"c":3}]' | jq 'add'
# → {"a":1,"b":2,"c":3}
```

---

## 文字列操作

```bash
# 分割
echo '"hello-world-foo"' | jq 'split("-")'
# → ["hello", "world", "foo"]

# 結合
echo '["hello","world"]' | jq 'join(" ")'
# → "hello world"

# 正規表現マッチ
echo '"hello123world"' | jq 'test("[0-9]+")'
# → true

# 大文字・小文字変換
echo '"Hello World"' | jq 'ascii_downcase'
# → "hello world"

echo '"hello"' | jq 'ascii_upcase'
# → "HELLO"

# 文字列の長さ
echo '"hello"' | jq 'length'
# → 5

# 前後の文字列を除去
echo '"hello_world"' | jq 'ltrimstr("hello_")'
# → "world"

echo '"file.txt"' | jq 'rtrimstr(".txt")'
# → "file"
```

---

## 条件分岐

### if-then-else

```bash
echo '5' | jq 'if . > 3 then "big" else "small" end'
# → "big"

jq '.[] | if .age >= 30 then {(.name): "senior"} else {(.name): "junior"} end' users.json
```

### Alternative operator（`//`）

値がnullまたはfalseの場合のデフォルト値:

```bash
echo '{"name":"Alice"}' | jq '.email // "N/A"'
# → "N/A"

echo '{"name":"Alice","email":"alice@example.com"}' | jq '.email // "N/A"'
# → "alice@example.com"
```

### try-catch

```bash
echo '"not a number"' | jq 'try tonumber catch "変換失敗"'
# → "変換失敗"
```

---

## 変数と関数

### 変数（as）

```bash
# 中間結果を変数に保存
echo '{"width":3,"height":4}' | jq '.width as $w | .height as $h | $w * $h'
# → 12
```

### 関数定義（def）

```bash
echo '[1,2,3,4,5]' | jq 'def double: . * 2; map(double)'
# → [2, 4, 6, 8, 10]

echo '5' | jq 'def factorial: if . <= 1 then 1 else . * ((. - 1) | factorial) end; factorial'
# → 120
```

---

## 出力フォーマット

### よく使うオプション

| オプション | 説明 | 例 |
|-----------|------|-----|
| `-r` | 文字列のクォートを除去（raw output） | `jq -r '.name'` |
| `-c` | コンパクト出力（1行に圧縮） | `jq -c '.'` |
| `-S` | キーをソートして出力 | `jq -S '.'` |
| `--tab` | タブでインデント | `jq --tab '.'` |
| `-e` | 結果がfalse/nullなら終了コード1 | `jq -e '.key'` |
| `-n` | 入力なしで実行 | `jq -n '{}'` |
| `--arg` | 外部変数を渡す | `jq --arg name "Alice" '.name == $name'` |
| `--slurp` / `-s` | 複数の入力を1つの配列にまとめる | `jq -s '.'` |

### フォーマット文字列

```bash
# CSV形式で出力
jq -r '.[] | [.name, .age, .city] | @csv' users.json
# → "Alice",25,"Tokyo"
# → "Bob",30,"Osaka"
# → "Charlie",28,"Tokyo"

# TSV形式で出力
jq -r '.[] | [.name, (.age|tostring), .city] | @tsv' users.json

# Base64エンコード
echo '"hello world"' | jq '@base64'
# → "aGVsbG8gd29ybGQ="

# Base64デコード
echo '"aGVsbG8gd29ybGQ="' | jq '@base64d'
# → "hello world"

# URI エンコード
echo '"hello world"' | jq '@uri'
# → "hello%20world"

# HTMLエスケープ
echo '"<div>hello</div>"' | jq '@html'
# → "&lt;div&gt;hello&lt;/div&gt;"
```

---

## 外部変数の受け渡し

```bash
# --arg で文字列変数を渡す
jq --arg city "Tokyo" '.[] | select(.city == $city)' users.json

# --argjson で数値・JSON値を渡す
jq --argjson min_age 28 '.[] | select(.age >= $min_age)' users.json

# シェル変数を使用
CITY="Tokyo"
jq --arg c "$CITY" '.[] | select(.city == $c)' users.json
```

---

## 実践的な使用例

### APIレスポンスの解析

```bash
# GitHub APIからリポジトリ情報を取得
curl -s https://api.github.com/users/octocat/repos | \
  jq '.[] | {name: .name, stars: .stargazers_count, language: .language}'

# スター数の多い順にソート
curl -s https://api.github.com/users/octocat/repos | \
  jq 'sort_by(.stargazers_count) | reverse | .[0:5] | .[] | {name, stars: .stargazers_count}'
```

### package.jsonの操作

```bash
# 依存パッケージの一覧
jq '.dependencies | keys' package.json

# スクリプト一覧を表形式で表示
jq -r '.scripts | to_entries[] | "\(.key)\t\(.value)"' package.json

# バージョンの確認
jq -r '.version' package.json
```

### ログの集計

```bash
# JSONログからエラーだけを抽出
cat app.log | jq -c 'select(.level == "error")'

# ステータスコード別にカウント
cat access.log | jq -s 'group_by(.status) | map({status: .[0].status, count: length})'

# 特定時間帯のログを抽出
cat app.log | jq 'select(.timestamp >= "2024-01-01" and .timestamp < "2024-01-02")'
```

### 設定ファイルの更新

```bash
# 値の更新
jq '.database.port = 5433' config.json > config_new.json

# キーの追加
jq '. + {"newKey": "newValue"}' config.json

# キーの削除
jq 'del(.obsoleteKey)' config.json

# ネストした値の更新
jq '.server.host = "production.example.com"' config.json
```

### 複数ファイルの結合

```bash
# 複数のJSONファイルを1つの配列に結合
jq -s '.' file1.json file2.json file3.json

# 複数のオブジェクトをマージ
jq -s 'add' defaults.json overrides.json
```

---

## Tips

### nullの安全な処理

```bash
# ?演算子でエラーを回避
echo '{"a":{"b":1}}' | jq '.a.c?'
# → null（エラーにならない）

# //でデフォルト値を設定
echo '{}' | jq '.name // "unknown"'
```

### デバッグ

```bash
# debug関数で中間値を確認（stderrに出力）
echo '[1,2,3]' | jq 'map(. * 2 | debug)'
```

### jqをワンライナーで活用

```bash
# 環境変数をJSONに変換
env | jq -Rs 'split("\n") | map(select(length > 0) | split("=") | {(.[0]): .[1:] | join("=")} ) | add'

# 空のJSONオブジェクトを生成
jq -n '{}'

# 動的にJSONを構築
jq -n --arg name "Alice" --argjson age 25 '{name: $name, age: $age}'
```

---

## まとめ

- **jq**はコマンドラインでのJSON操作に不可欠なツール
- `.key`、`.[]`、`|`の基本を覚えれば多くの場面で活用できる
- `map`、`select`、`sort_by`、`group_by`で複雑なデータ操作が可能
- `-r`オプションでスクリプトとの連携がスムーズに
- APIの応答解析、設定ファイルの操作、ログ集計など用途は幅広い
