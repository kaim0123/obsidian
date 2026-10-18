# エラーハンドリング（try-except）

## はじめに

前の章では、CSVファイルの操作を学びました。

この章では、**エラーハンドリング（try-except）**を学びます。エラーが発生した時に、プログラムが止まらないように処理できるようになります。

## エラーとは

### エラーの種類

プログラムを実行すると、様々なエラーが発生する可能性があります：

- **構文エラー**：コードの書き方が間違っている
- **実行時エラー**：実行中に問題が発生する
- **論理エラー**：プログラムは動くが、期待通りの結果にならない

### エラーの例

```python
# ゼロで割る
result = 10 / 0  # ZeroDivisionError

# 存在しないファイルを開く
file = open("存在しないファイル.txt", "r")  # FileNotFoundError

# 存在しないキーにアクセス
person = {"name": "太郎"}
age = person["age"]  # KeyError
```

## try-except文

### 基本的な書き方

```python
try:
    # エラーが発生する可能性があるコード
    処理
except エラーの種類:
    # エラーが発生した時の処理
    エラー処理
```

### 具体例

```python
try:
    result = 10 / 0
    print(result)
except ZeroDivisionError:
    print("ゼロで割ることはできません")
```

実行結果：
```
ゼロで割ることはできません
```

### エラーが発生しない場合

```python
try:
    result = 10 / 2
    print(result)
except ZeroDivisionError:
    print("ゼロで割ることはできません")
```

実行結果：
```
5.0
```

## 複数のエラーを処理する

### 複数のexcept文

```python
try:
    number = int(input("数字を入力してください: "))
    result = 10 / number
    print(result)
except ValueError:
    print("数字を入力してください")
except ZeroDivisionError:
    print("ゼロで割ることはできません")
```

### 1つのexceptで複数のエラーを処理

```python
try:
    number = int(input("数字を入力してください: "))
    result = 10 / number
    print(result)
except (ValueError, ZeroDivisionError):
    print("エラーが発生しました")
```

## else節とfinally節

### else節

エラーが発生しなかった時に実行される処理

```python
try:
    result = 10 / 2
    print(result)
except ZeroDivisionError:
    print("ゼロで割ることはできません")
else:
    print("計算が成功しました")
```

実行結果：
```
5.0
計算が成功しました
```

### finally節

エラーが発生しても、発生しなくても、**必ず実行される**処理

```python
try:
    file = open("test.txt", "r")
    content = file.read()
    print(content)
except FileNotFoundError:
    print("ファイルが見つかりません")
finally:
    print("処理を終了します")
    # ファイルを閉じる処理など
```

## エラーメッセージを取得する

### asキーワード

エラーメッセージを取得できます。

```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"エラーが発生しました: {e}")
```

実行結果：
```
エラーが発生しました: division by zero
```

## よくあるエラーの処理

### FileNotFoundError：ファイルが見つからない

```python
try:
    with open("存在しないファイル.txt", "r", encoding="utf-8") as file:
        content = file.read()
        print(content)
except FileNotFoundError:
    print("ファイルが見つかりません")
```

### ValueError：値が不正

```python
try:
    number = int(input("数字を入力してください: "))
    print(f"入力された数字: {number}")
except ValueError:
    print("数字を入力してください")
```

### KeyError：辞書のキーが存在しない

```python
person = {"name": "太郎"}

try:
    age = person["age"]
    print(age)
except KeyError:
    print("キーが存在しません")
    age = None
```

### IndexError：リストのインデックスが範囲外

```python
fruits = ["りんご", "バナナ", "オレンジ"]

try:
    fruit = fruits[10]
    print(fruit)
except IndexError:
    print("インデックスが範囲外です")
```

## 実用的な例

### 例1：安全なファイル読み込み

```python
def read_file_safely(filename):
    """ファイルを安全に読み込む"""
    try:
        with open(filename, "r", encoding="utf-8") as file:
            content = file.read()
        return content
    except FileNotFoundError:
        return "ファイルが見つかりません"
    except PermissionError:
        return "ファイルを読み込む権限がありません"
    except Exception as e:
        return f"予期しないエラーが発生しました: {e}"

content = read_file_safely("test.txt")
print(content)
```

### 例2：安全な数値入力

```python
def get_number(prompt):
    """ユーザーから数値を安全に取得"""
    while True:
        try:
            number = float(input(prompt))
            return number
        except ValueError:
            print("数字を入力してください")
        except KeyboardInterrupt:
            print("\n入力をキャンセルしました")
            return None

age = get_number("年齢を入力してください: ")
if age is not None:
    print(f"年齢: {age}歳")
```

### 例3：安全な辞書アクセス

```python
def get_value_safely(dictionary, key, default=None):
    """辞書から値を安全に取得"""
    try:
        return dictionary[key]
    except KeyError:
        return default

person = {"name": "太郎", "age": 25}

name = get_value_safely(person, "name", "不明")
age = get_value_safely(person, "age", 0)
city = get_value_safely(person, "city", "不明")

print(f"名前: {name}, 年齢: {age}, 都市: {city}")
```

## カスタムエラー

### raise文：エラーを発生させる

```python
def check_age(age):
    """年齢をチェック"""
    if age < 0:
        raise ValueError("年齢は0以上である必要があります")
    if age > 150:
        raise ValueError("年齢は150以下である必要があります")
    return True

try:
    check_age(-5)
except ValueError as e:
    print(f"エラー: {e}")
```

### カスタム例外クラス

```python
class AgeError(Exception):
    """年齢に関するエラー"""
    pass

def check_age(age):
    """年齢をチェック"""
    if age < 0:
        raise AgeError("年齢は0以上である必要があります")
    if age > 150:
        raise AgeError("年齢は150以下である必要があります")
    return True

try:
    check_age(-5)
except AgeError as e:
    print(f"年齢エラー: {e}")
```

## エラーハンドリングのベストプラクティス

### 1. 具体的なエラーを処理する

```python
# ❌ 悪い例：全てのエラーを同じように処理
try:
    # 処理
    pass
except:
    print("エラーが発生しました")

# ✅ 良い例：具体的なエラーを処理
try:
    # 処理
    pass
except FileNotFoundError:
    print("ファイルが見つかりません")
except ValueError:
    print("値が不正です")
```

### 2. エラーメッセージを記録する

```python
import logging

try:
    # 処理
    pass
except Exception as e:
    logging.error(f"エラーが発生しました: {e}")
    print("エラーが発生しました。ログを確認してください")
```

### 3. リソースを確実に解放する

```python
file = None
try:
    file = open("test.txt", "r")
    content = file.read()
except FileNotFoundError:
    print("ファイルが見つかりません")
finally:
    if file:
        file.close()
```

## よくあるエラー

### エラー1：exceptの順序が間違っている

**問題：**
```python
try:
    # 処理
    pass
except Exception:  # 全てのエラーをキャッチ
    pass
except ValueError:  # 到達しない
    pass
```

**解決方法：**
```python
try:
    # 処理
    pass
except ValueError:  # 具体的なエラーを先に
    pass
except Exception:  # 一般的なエラーを後に
    pass
```

### エラー2：エラーを無視する

**問題：**
```python
try:
    # 処理
    pass
except:
    pass  # エラーを無視（推奨されない）
```

**解決方法：**
```python
try:
    # 処理
    pass
except Exception as e:
    logging.error(f"エラー: {e}")
    # 適切な処理を行う
```

## 練習問題

### 問題1：安全な除算

2つの数を受け取って、安全に割り算を行う関数を作成してください。

**ヒント：**
```python
def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return "ゼロで割ることはできません"
    except TypeError:
        return "数字を入力してください"

result = safe_divide(10, 2)
print(result)  # 5.0

result = safe_divide(10, 0)
print(result)  # ゼロで割ることはできません
```

### 問題2：安全なファイル読み込み

ファイルを安全に読み込む関数を作成してください。

**ヒント：**
```python
def read_file_safely(filename):
    try:
        with open(filename, "r", encoding="utf-8") as file:
            return file.read()
    except FileNotFoundError:
        return "ファイルが見つかりません"
    except Exception as e:
        return f"エラー: {e}"

content = read_file_safely("test.txt")
print(content)
```

### 問題3：安全な数値変換

文字列を数値に安全に変換する関数を作成してください。

**ヒント：**
```python
def to_number(text, default=0):
    try:
        return float(text)
    except ValueError:
        return default

number = to_number("123")
print(number)  # 123.0

number = to_number("abc", default=-1)
print(number)  # -1
```

## まとめ

### 学んだこと

1. ✅ **try-except文**：エラーを処理する
2. ✅ **複数のエラー処理**：複数のexcept文、1つのexceptで複数のエラー
3. ✅ **else節とfinally節**：エラーが発生しなかった時、必ず実行される処理
4. ✅ **エラーメッセージの取得**：`as`キーワード
5. ✅ **よくあるエラーの処理**：FileNotFoundError、ValueError、KeyErrorなど
6. ✅ **カスタムエラー**：`raise`文、カスタム例外クラス

### 重要なポイント

- ✅ **具体的なエラーを処理する**：全てのエラーを同じように処理しない
- ✅ **エラーメッセージを記録する**：デバッグに役立つ
- ✅ **リソースを確実に解放する**：finally節を使う

### 次のステップ

エラーハンドリングができるようになりました！

次は、**モジュールの使い方**を学んで、コードを整理して再利用できるようにしましょう。

---

**次のステップ**：[モジュールの使い方](09_モジュールの使い方.md)

