# 辞書（dict）の使い方

## はじめに

前の章では、リストの詳細操作を学びました。

この章では、**辞書（dict）**を学びます。辞書を使うと、キーと値のペアでデータを管理できます。

## 辞書とは

### 簡単に言うと

**辞書（dict）**とは、**キーと値のペアでデータを保存する**仕組みです。

### 具体例で理解する

#### 例1：電話帳

電話帳には、名前（キー）と電話番号（値）が書いてあります。

辞書も同じです：
- **名前** = キー
- **電話番号** = 値

#### 例2：辞書

普通の辞書には、単語（キー）と意味（値）が書いてあります。

プログラミングの辞書も同じです：
- **単語** = キー
- **意味** = 値

## 辞書の基本

### 基本的な書き方

```python
辞書名 = {
    キー1: 値1,
    キー2: 値2,
    キー3: 値3
}
```

### 具体例

```python
person = {
    "name": "太郎",
    "age": 25,
    "city": "東京"
}
```

- `"name"`、`"age"`、`"city"` = キー
- `"太郎"`、`25`、`"東京"` = 値

### 空の辞書を作成

```python
# 方法1
person = {}

# 方法2
person = dict()
```

## 辞書の要素へのアクセス

### キーでアクセス

```python
person = {
    "name": "太郎",
    "age": 25,
    "city": "東京"
}

print(person["name"])  # 太郎
print(person["age"])   # 25
print(person["city"])  # 東京
```

### get()メソッド

`get()`メソッドを使うと、キーが存在しない時もエラーになりません。

```python
person = {
    "name": "太郎",
    "age": 25
}

# キーが存在する場合
print(person.get("name"))  # 太郎

# キーが存在しない場合（デフォルト値を返す）
print(person.get("city", "不明"))  # 不明
```

## 辞書の要素の追加・変更・削除

### 要素の追加

```python
person = {
    "name": "太郎",
    "age": 25
}

person["city"] = "東京"
print(person)  # {"name": "太郎", "age": 25, "city": "東京"}
```

### 要素の変更

```python
person = {
    "name": "太郎",
    "age": 25
}

person["age"] = 26
print(person)  # {"name": "太郎", "age": 26}
```

### 要素の削除

#### del：キーを指定して削除

```python
person = {
    "name": "太郎",
    "age": 25,
    "city": "東京"
}

del person["city"]
print(person)  # {"name": "太郎", "age": 25}
```

#### pop()：キーを指定して削除（値を返す）

```python
person = {
    "name": "太郎",
    "age": 25,
    "city": "東京"
}

city = person.pop("city")
print(person)  # {"name": "太郎", "age": 25}
print(city)    # 東京
```

#### clear()：全ての要素を削除

```python
person = {
    "name": "太郎",
    "age": 25
}

person.clear()
print(person)  # {}
```

## 辞書の便利なメソッド

### keys()：全てのキーを取得

```python
person = {
    "name": "太郎",
    "age": 25,
    "city": "東京"
}

keys = person.keys()
print(keys)  # dict_keys(['name', 'age', 'city'])

# リストに変換
keys_list = list(person.keys())
print(keys_list)  # ['name', 'age', 'city']
```

### values()：全ての値を取得

```python
person = {
    "name": "太郎",
    "age": 25,
    "city": "東京"
}

values = person.values()
print(values)  # dict_values(['太郎', 25, '東京'])

# リストに変換
values_list = list(person.values())
print(values_list)  # ['太郎', 25, '東京']
```

### items()：キーと値のペアを取得

```python
person = {
    "name": "太郎",
    "age": 25,
    "city": "東京"
}

items = person.items()
print(items)  # dict_items([('name', '太郎'), ('age', 25), ('city', '東京')])

# リストに変換
items_list = list(person.items())
print(items_list)  # [('name', '太郎'), ('age', 25), ('city', '東京')]
```

## 辞書の繰り返し処理

### キーで繰り返す

```python
person = {
    "name": "太郎",
    "age": 25,
    "city": "東京"
}

for key in person:
    print(key, person[key])
```

実行結果：
```
name 太郎
age 25
city 東京
```

### keys()で繰り返す

```python
person = {
    "name": "太郎",
    "age": 25,
    "city": "東京"
}

for key in person.keys():
    print(key, person[key])
```

### values()で繰り返す

```python
person = {
    "name": "太郎",
    "age": 25,
    "city": "東京"
}

for value in person.values():
    print(value)
```

実行結果：
```
太郎
25
東京
```

### items()で繰り返す（推奨）

```python
person = {
    "name": "太郎",
    "age": 25,
    "city": "東京"
}

for key, value in person.items():
    print(key, value)
```

実行結果：
```
name 太郎
age 25
city 東京
```

## 辞書の結合

### update()：辞書を結合

```python
person1 = {
    "name": "太郎",
    "age": 25
}

person2 = {
    "city": "東京",
    "country": "日本"
}

person1.update(person2)
print(person1)  # {"name": "太郎", "age": 25, "city": "東京", "country": "日本"}
```

## 実用的な例

### 例1：学生の情報を管理する

```python
students = {
    "001": {
        "name": "太郎",
        "age": 20,
        "score": 85
    },
    "002": {
        "name": "花子",
        "age": 19,
        "score": 90
    },
    "003": {
        "name": "次郎",
        "age": 21,
        "score": 80
    }
}

# 学生の情報を表示
for student_id, info in students.items():
    print(f"ID: {student_id}")
    print(f"  名前: {info['name']}")
    print(f"  年齢: {info['age']}")
    print(f"  点数: {info['score']}")
```

### 例2：単語帳アプリ

```python
dictionary = {
    "apple": "りんご",
    "banana": "バナナ",
    "orange": "オレンジ"
}

# 単語を検索
word = "apple"
if word in dictionary:
    print(f"{word} は {dictionary[word]} です")
else:
    print(f"{word} は辞書にありません")

# 単語を追加
dictionary["grape"] = "ぶどう"
print(dictionary)
```

### 例3：商品の在庫管理

```python
inventory = {
    "りんご": 10,
    "バナナ": 5,
    "オレンジ": 8
}

# 在庫を確認
for item, quantity in inventory.items():
    print(f"{item}: {quantity}個")

# 在庫を追加
inventory["りんご"] = inventory["りんご"] + 5
print(f"りんごの在庫: {inventory['りんご']}個")

# 在庫を減らす
inventory["バナナ"] = inventory["バナナ"] - 2
print(f"バナナの在庫: {inventory['バナナ']}個")
```

## 辞書の内包表記

### 基本的な書き方

```python
# 通常の書き方
squares = {}
for i in range(1, 6):
    squares[i] = i ** 2

# 辞書内包表記
squares = {i: i ** 2 for i in range(1, 6)}
print(squares)  # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}
```

### 条件付きの辞書内包表記

```python
# 偶数だけの辞書を作成
even_squares = {i: i ** 2 for i in range(1, 11) if i % 2 == 0}
print(even_squares)  # {2: 4, 4: 16, 6: 36, 8: 64, 10: 100}
```

## よくあるエラー

### エラー1：キーが存在しない

**エラーメッセージ：**
```
KeyError: 'xxx'
```

**原因：**
- 存在しないキーにアクセスしている

**解決方法：**
```python
person = {"name": "太郎", "age": 25}

# 方法1：get()を使う
city = person.get("city", "不明")
print(city)  # 不明

# 方法2：inでチェック
if "city" in person:
    print(person["city"])
else:
    print("cityキーは存在しません")
```

### エラー2：辞書にキーを追加できない

**原因：**
- 辞書が正しく作成されていない

**解決方法：**
```python
# 正しい辞書の作成
person = {}
person["name"] = "太郎"
```

## 練習問題

### 問題1：辞書の基本操作

辞書 `person = {"name": "太郎", "age": 25, "city": "東京"}` に対して、以下を実行してください：

1. 全てのキーと値を表示する
2. "age"の値を26に変更する
3. "country"キーを追加して"日本"を設定する

**ヒント：**
```python
person = {"name": "太郎", "age": 25, "city": "東京"}
for key, value in person.items():
    print(key, value)

person["age"] = 26
person["country"] = "日本"
print(person)
```

### 問題2：単語帳アプリ

英語と日本語の対応を辞書で管理する単語帳アプリを作成してください。

**ヒント：**
```python
dictionary = {
    "apple": "りんご",
    "banana": "バナナ",
    "orange": "オレンジ"
}

word = "apple"
if word in dictionary:
    print(f"{word} は {dictionary[word]} です")
```

### 問題3：在庫管理

商品名をキー、在庫数を値とする辞書で、在庫を管理するプログラムを作成してください。

**ヒント：**
```python
inventory = {
    "りんご": 10,
    "バナナ": 5,
    "オレンジ": 8
}

# 在庫を確認
for item, quantity in inventory.items():
    print(f"{item}: {quantity}個")
```

## まとめ

### 学んだこと

1. ✅ **辞書の作成**：`{}` または `dict()`
2. ✅ **要素へのアクセス**：`辞書[キー]`、`get()`
3. ✅ **要素の追加・変更・削除**：`辞書[キー] = 値`、`del`、`pop()`
4. ✅ **便利なメソッド**：`keys()`、`values()`、`items()`
5. ✅ **繰り返し処理**：`for key, value in 辞書.items()`
6. ✅ **辞書の結合**：`update()`
7. ✅ **辞書内包表記**：短く書く方法

### 次のステップ

辞書が使えるようになりました！

次は、**タプルとセット**を学んで、データ構造の知識を広げましょう。

---

**次のステップ**：[タプルとセット](03_タプルとセット.md)

