# CSVファイルの操作

## はじめに

前の章では、ファイルの読み書きを学びました。

この章では、**CSVファイルの操作**を学びます。CSVファイルは、表形式のデータを保存する形式で、よく使われます。

## CSVとは

### CSVとは

**CSV（Comma-Separated Values）**とは、**カンマで区切られた値**のことです。

### CSVファイルの例

```csv
名前,年齢,都市
太郎,25,東京
花子,30,大阪
次郎,28,名古屋
```

## csvモジュールを使う

### csvモジュールのインポート

```python
import csv
```

## CSVファイルの読み込み

### reader()：CSVファイルを読み込む

```python
import csv

with open("data.csv", "r", encoding="utf-8") as file:
    reader = csv.reader(file)
    for row in reader:
        print(row)
```

**実行結果：**
```
['名前', '年齢', '都市']
['太郎', '25', '東京']
['花子', '30', '大阪']
['次郎', '28', '名古屋']
```

### DictReader()：辞書形式で読み込む（推奨）

```python
import csv

with open("data.csv", "r", encoding="utf-8") as file:
    reader = csv.DictReader(file)
    for row in reader:
        print(row["名前"], row["年齢"], row["都市"])
```

**実行結果：**
```
太郎 25 東京
花子 30 大阪
次郎 28 名古屋
```

**メリット：**
- 列名でアクセスできる
- 読みやすい

## CSVファイルの書き込み

### writer()：CSVファイルに書き込む

```python
import csv

data = [
    ["名前", "年齢", "都市"],
    ["太郎", "25", "東京"],
    ["花子", "30", "大阪"],
    ["次郎", "28", "名古屋"]
]

with open("output.csv", "w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    writer.writerows(data)
```

**注意：** `newline=""` を指定すると、改行が正しく処理されます。

### DictWriter()：辞書形式で書き込む（推奨）

```python
import csv

data = [
    {"名前": "太郎", "年齢": "25", "都市": "東京"},
    {"名前": "花子", "年齢": "30", "都市": "大阪"},
    {"名前": "次郎", "年齢": "28", "都市": "名古屋"}
]

with open("output.csv", "w", encoding="utf-8", newline="") as file:
    fieldnames = ["名前", "年齢", "都市"]
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()  # ヘッダーを書き込む
    writer.writerows(data)
```

## 実用的な例

### 例1：学生の成績を管理する

```python
import csv

def save_grades(filename, students):
    """学生の成績をCSVファイルに保存"""
    with open(filename, "w", encoding="utf-8", newline="") as file:
        fieldnames = ["名前", "点数", "評価"]
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(students)

def load_grades(filename):
    """学生の成績をCSVファイルから読み込む"""
    students = []
    try:
        with open(filename, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            for row in reader:
                students.append(row)
    except FileNotFoundError:
        pass
    return students

# 使用例
students = [
    {"名前": "太郎", "点数": "85", "評価": "合格"},
    {"名前": "花子", "点数": "92", "評価": "優秀"},
    {"名前": "次郎", "点数": "65", "評価": "不合格"}
]

save_grades("grades.csv", students)
loaded_students = load_grades("grades.csv")

for student in loaded_students:
    print(f"{student['名前']}: {student['点数']}点 ({student['評価']})")
```

### 例2：売上データを分析する

```python
import csv

def analyze_sales(filename):
    """売上データを分析"""
    total = 0
    count = 0
    
    with open(filename, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            amount = int(row["金額"])
            total += amount
            count += 1
    
    average = total / count if count > 0 else 0
    print(f"合計: {total:,}円")
    print(f"平均: {average:,.0f}円")
    print(f"件数: {count}件")

# CSVファイルの例（sales.csv）
# 商品名,金額
# りんご,100
# バナナ,150
# オレンジ,120

analyze_sales("sales.csv")
```

### 例3：CSVファイルをフィルタリング

```python
import csv

def filter_data(input_file, output_file, condition):
    """CSVファイルをフィルタリング"""
    filtered_rows = []
    
    with open(input_file, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            if condition(row):
                filtered_rows.append(row)
    
    if filtered_rows:
        with open(output_file, "w", encoding="utf-8", newline="") as file:
            fieldnames = filtered_rows[0].keys()
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(filtered_rows)
        print(f"{len(filtered_rows)}件のデータを保存しました")
    else:
        print("条件に合うデータがありませんでした")

# 使用例：年齢が25歳以上のデータだけを抽出
def is_adult(row):
    return int(row["年齢"]) >= 25

filter_data("data.csv", "filtered.csv", is_adult)
```

## CSVファイルの注意点

### カンマが含まれる場合

CSVファイルでは、値にカンマが含まれる場合、引用符で囲みます。

```csv
名前,説明
りんご,"赤くて,甘い果物"
```

### 改行が含まれる場合

値に改行が含まれる場合も、引用符で囲みます。

```csv
名前,説明
りんご,"赤くて
甘い果物"
```

### エンコーディング

日本語を含むCSVファイルは、`encoding="utf-8"` を指定します。

```python
with open("data.csv", "r", encoding="utf-8") as file:
    reader = csv.reader(file)
    # ...
```

## よくあるエラー

### エラー1：ファイルが見つからない

**エラーメッセージ：**
```
FileNotFoundError: [Errno 2] No such file or directory: 'data.csv'
```

**解決方法：**
```python
import os

if os.path.exists("data.csv"):
    with open("data.csv", "r", encoding="utf-8") as file:
        reader = csv.reader(file)
        # ...
else:
    print("ファイルが見つかりません")
```

### エラー2：列名が存在しない

**エラーメッセージ：**
```
KeyError: '名前'
```

**原因：**
- 列名が間違っている
- ヘッダーがない

**解決方法：**
```python
with open("data.csv", "r", encoding="utf-8") as file:
    reader = csv.DictReader(file)
    for row in reader:
        if "名前" in row:
            print(row["名前"])
```

## 練習問題

### 問題1：CSVファイルを読み込む

以下のCSVファイル `students.csv` を読み込んで、各学生の情報を表示してください。

```csv
名前,年齢,点数
太郎,20,85
花子,19,90
次郎,21,80
```

**ヒント：**
```python
import csv

with open("students.csv", "r", encoding="utf-8") as file:
    reader = csv.DictReader(file)
    for row in reader:
        print(f"{row['名前']}: {row['年齢']}歳, {row['点数']}点")
```

### 問題2：CSVファイルに書き込む

学生の情報をCSVファイルに書き込んでください。

**ヒント：**
```python
import csv

students = [
    {"名前": "太郎", "年齢": "20", "点数": "85"},
    {"名前": "花子", "年齢": "19", "点数": "90"}
]

with open("output.csv", "w", encoding="utf-8", newline="") as file:
    fieldnames = ["名前", "年齢", "点数"]
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(students)
```

### 問題3：CSVファイルをフィルタリング

点数が80点以上の学生だけを抽出して、新しいCSVファイルに保存してください。

**ヒント：**
```python
import csv

def filter_high_scores(input_file, output_file):
    filtered = []
    with open(input_file, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            if int(row["点数"]) >= 80:
                filtered.append(row)
    
    with open(output_file, "w", encoding="utf-8", newline="") as file:
        fieldnames = ["名前", "年齢", "点数"]
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(filtered)

filter_high_scores("students.csv", "high_scores.csv")
```

## まとめ

### 学んだこと

1. ✅ **CSVとは**：カンマで区切られた値
2. ✅ **CSVファイルの読み込み**：`csv.reader()`、`csv.DictReader()`
3. ✅ **CSVファイルの書き込み**：`csv.writer()`、`csv.DictWriter()`
4. ✅ **実用的な例**：成績管理、売上分析、フィルタリング

### 重要なポイント

- ✅ **DictReader/DictWriterが便利**：列名でアクセスできる
- ✅ **エンコーディングを指定**：`encoding="utf-8"`
- ✅ **newline=""を指定**：書き込み時に改行が正しく処理される

### 次のステップ

CSVファイルの操作ができるようになりました！

次は、**エラーハンドリング（try-except）**を学んで、エラーを適切に処理できるようにしましょう。

---

**次のステップ**：[エラーハンドリング（try-except）](08_エラーハンドリング（try-except）.md)

