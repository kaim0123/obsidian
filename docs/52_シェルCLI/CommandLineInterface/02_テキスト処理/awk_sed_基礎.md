# awk / sed 基礎

## 概要

**awk**と**sed**は、Unix/Linux環境で長年使われてきたテキスト処理の定番コマンドです。どちらもパイプラインの中でテキストを加工するために設計されており、シェルスクリプトやワンライナーで非常によく使われます。

- **sed**（Stream Editor）: テキストの**置換・削除・挿入**に特化したストリームエディタ
- **awk**: テキストの**列の抽出・集計・整形**に強いパターンスキャン&処理言語

どちらも1970年代に誕生した歴史あるツールですが、現在でもサーバー管理、ログ解析、データ加工の現場で日常的に使われています。

---

## sed（Stream Editor）

### sedとは

sedは「Stream Editor」の略で、入力を1行ずつ読み込み、指定されたコマンドに従ってテキストを変換し、結果を出力します。ファイルを直接編集するのではなく、**ストリーム（データの流れ）を加工する**という考え方が特徴です。

### 基本構文

```bash
sed [オプション] 'コマンド' ファイル名
```

または、パイプラインで使用する場合:

```bash
echo "hello world" | sed 's/hello/hi/'
```

### 置換（s コマンド）

sedの最も基本的で頻繁に使う機能が**置換**です。

```bash
# 基本的な置換（各行の最初のマッチのみ）
sed 's/old/new/' file.txt

# グローバル置換（行内のすべてのマッチを置換）
sed 's/old/new/g' file.txt

# 大文字・小文字を無視して置換
sed 's/old/new/gi' file.txt

# N番目のマッチのみ置換
sed 's/old/new/2' file.txt
```

#### 区切り文字の変更

スラッシュ `/` を含む文字列を置換する場合、別の区切り文字を使うと読みやすくなります:

```bash
# パスの置換（|を区切り文字に使用）
sed 's|/usr/local/bin|/opt/bin|g' file.txt

# #を区切り文字に使用
sed 's#http://#https://#g' file.txt
```

### 削除（d コマンド）

```bash
# 3行目を削除
sed '3d' file.txt

# 2〜5行目を削除
sed '2,5d' file.txt

# 最終行を削除
sed '$d' file.txt

# 空行を削除
sed '/^$/d' file.txt

# パターンにマッチする行を削除
sed '/ERROR/d' file.txt

# パターンにマッチしない行を削除（!で反転）
sed '/ERROR/!d' file.txt
```

### 挿入・追加（i / a コマンド）

```bash
# 3行目の前に挿入
sed '3i\挿入するテキスト' file.txt

# 3行目の後に追加
sed '3a\追加するテキスト' file.txt

# パターンにマッチする行の前に挿入
sed '/ERROR/i\--- エラー発見 ---' file.txt
```

### アドレス指定

sedでは、コマンドを適用する範囲を**アドレス**で指定できます:

```bash
# 行番号で指定
sed '5s/old/new/' file.txt          # 5行目のみ

# 範囲で指定
sed '3,7s/old/new/' file.txt        # 3〜7行目

# パターンで指定
sed '/START/,/END/s/old/new/' file.txt  # STARTからENDまでの間

# 最初の行から10行目まで
sed '1,10s/old/new/' file.txt

# 5行目から最後まで
sed '5,$s/old/new/' file.txt
```

### 行の表示（p コマンド）

```bash
# マッチする行だけ表示（-nと組み合わせて使う）
sed -n '/ERROR/p' file.txt

# 5〜10行目を表示
sed -n '5,10p' file.txt

# マッチする行と行番号を表示
sed -n '/ERROR/=' file.txt
```

### ファイルを直接編集する（-i オプション）

```bash
# ファイルを直接書き換え（Linux版 GNU sed）
sed -i 's/old/new/g' file.txt

# バックアップを作成してから書き換え
sed -i.bak 's/old/new/g' file.txt

# macOS版（BSD sed）ではバックアップ拡張子が必須
sed -i '' 's/old/new/g' file.txt
```

> **注意**: `-i`はファイルを直接変更するため、事前にバックアップを取ることをお勧めします。

### sedの正規表現

```bash
# 基本正規表現（BRE）
sed 's/[0-9]\+/NUMBER/g' file.txt    # 数字の連続をNUMBERに

# 拡張正規表現（ERE）を使う場合は -E オプション
sed -E 's/[0-9]+/NUMBER/g' file.txt

# グループ化とバックリファレンス
sed -E 's/(foo)(bar)/\2\1/g' file.txt  # foobarをbarfooに

# 行頭・行末
sed 's/^/  /' file.txt        # 各行の先頭にスペース2つ追加
sed 's/$/;/' file.txt         # 各行の末尾にセミコロン追加

# 任意の文字
sed 's/h.t/hat/g' file.txt   # hot, hat, hitなどをhatに
```

### sedの実践例

```bash
# 設定ファイルのポート番号を変更
sed -i 's/port=8080/port=3000/' config.ini

# HTMLタグの除去
sed 's/<[^>]*>//g' page.html

# コメント行を削除（#で始まる行）
sed '/^#/d' config.txt

# 空行と空白のみの行を削除
sed '/^[[:space:]]*$/d' file.txt

# 行頭の空白を削除
sed 's/^[[:space:]]*//' file.txt

# 複数のsedコマンドを連結
sed -e 's/foo/bar/g' -e 's/baz/qux/g' file.txt

# CSV のカンマをタブに変換
sed 's/,/\t/g' data.csv

# 特定の行の後に複数行を挿入
sed '/\[database\]/a\
host=localhost\
port=5432\
name=mydb' config.ini
```

---

## awk

### awkとは

awkは、テキストファイルを**行単位・フィールド（列）単位**で処理するためのプログラミング言語です。名前はAho、Weinberger、Kernighanの3人の開発者のイニシャルに由来します。

awkは以下の場面で特に力を発揮します:

- CSVやTSVなどの**構造化テキスト**の処理
- ログファイルの**集計・分析**
- テキストの**列の抽出や並べ替え**

### 基本構文

```bash
awk 'パターン { アクション }' ファイル名
```

```bash
# パイプラインで使用
cat file.txt | awk '{ print $1 }'
```

### パターン-アクション構造

awkの処理は「パターン（条件）」と「アクション（処理）」のペアで構成されます:

```bash
# パターンにマッチする行にアクションを実行
awk '/ERROR/ { print $0 }' log.txt

# パターンを省略するとすべての行に適用
awk '{ print $1 }' file.txt

# アクションを省略するとマッチした行をそのまま出力
awk '/ERROR/' log.txt

# 特別なパターン: BEGIN と END
awk 'BEGIN { print "開始" } { print $0 } END { print "終了" }' file.txt
```

### フィールド（列）の操作

awkはデフォルトで**空白文字（スペースやタブ）**を区切り文字として、各行をフィールドに分割します:

```bash
# テストデータ（data.txt）
# Alice 25 Tokyo
# Bob 30 Osaka
# Charlie 28 Nagoya

# 1列目（名前）を表示
awk '{ print $1 }' data.txt
# → Alice
# → Bob
# → Charlie

# 1列目と3列目を表示
awk '{ print $1, $3 }' data.txt
# → Alice Tokyo
# → Bob Osaka
# → Charlie Nagoya

# カスタムフォーマットで出力
awk '{ printf "名前: %-10s 年齢: %d\n", $1, $2 }' data.txt
```

### 組み込み変数

| 変数 | 説明 | 例 |
|------|------|-----|
| `$0` | 行全体 | `{ print $0 }` |
| `$1`, `$2`... | N番目のフィールド | `{ print $1 }` |
| `NR` | 現在の行番号（全体通算） | `{ print NR, $0 }` |
| `NF` | 現在の行のフィールド数 | `{ print NF }` |
| `FS` | 入力フィールド区切り文字 | `BEGIN { FS="," }` |
| `OFS` | 出力フィールド区切り文字 | `BEGIN { OFS="\t" }` |
| `RS` | 入力レコード区切り文字 | `BEGIN { RS="\n\n" }` |
| `ORS` | 出力レコード区切り文字 | `BEGIN { ORS="\n---\n" }` |
| `FILENAME` | 現在のファイル名 | `{ print FILENAME }` |
| `FNR` | 現在のファイル内での行番号 | `{ print FNR }` |

```bash
# CSVファイルをカンマ区切りで処理
awk -F',' '{ print $1, $3 }' data.csv

# 出力の区切り文字をタブに変更
awk -F',' 'BEGIN { OFS="\t" } { print $1, $2, $3 }' data.csv

# 行番号を付けて出力
awk '{ print NR": "$0 }' file.txt

# 各行のフィールド数を表示
awk '{ print NF, $0 }' file.txt

# 最後のフィールドを表示
awk '{ print $NF }' file.txt
```

### 条件分岐と制御構造

```bash
# if文
awk '{ if ($2 > 25) print $1, "is older than 25" }' data.txt

# if-else文
awk '{
    if ($2 >= 30)
        print $1, "シニア"
    else
        print $1, "ジュニア"
}' data.txt

# for文
awk '{
    for (i = 1; i <= NF; i++)
        print "Field", i, ":", $i
}' data.txt

# while文
awk '{
    i = 1
    while (i <= NF) {
        print $i
        i++
    }
}' data.txt
```

### 算術演算と集計

```bash
# 2列目の合計を計算
awk '{ sum += $2 } END { print "合計:", sum }' data.txt

# 2列目の平均を計算
awk '{ sum += $2; count++ } END { print "平均:", sum/count }' data.txt

# 最大値を求める
awk 'BEGIN { max = 0 } { if ($2 > max) max = $2 } END { print "最大:", max }' data.txt

# 行数をカウント
awk 'END { print NR, "行" }' file.txt
```

### 連想配列（ハッシュ）

awkの強力な機能の一つが**連想配列**です:

```bash
# 各都市の出現回数をカウント
awk '{ count[$3]++ } END { for (city in count) print city, count[city] }' data.txt

# 部門ごとの売上合計（sales.csv: 名前,部門,売上）
awk -F',' '{ sales[$2] += $3 } END { for (dept in sales) print dept, sales[dept] }' sales.csv

# 重複行の除去（uniqの代わり）
awk '!seen[$0]++' file.txt
```

### awkの実践例

```bash
# アクセスログからステータスコード別にカウント
awk '{ status[$9]++ } END { for (s in status) print s, status[s] }' access.log

# CSVの特定列を合計（3列目）
awk -F',' 'NR > 1 { sum += $3 } END { printf "合計: %.2f\n", sum }' data.csv

# プロセスのメモリ使用量トップ5
ps aux | awk 'NR > 1 { print $4, $11 }' | sort -rn | head -5

# /etc/passwd からユーザー名とシェルを一覧表示
awk -F':' '{ printf "%-15s %s\n", $1, $7 }' /etc/passwd

# TSV を CSV に変換
awk 'BEGIN { FS="\t"; OFS="," } { $1=$1; print }' data.tsv

# 空行を除いた行数をカウント
awk 'NF > 0 { count++ } END { print count }' file.txt

# 各行を逆順に出力（フィールド単位）
awk '{ for (i=NF; i>0; i--) printf "%s ", $i; print "" }' file.txt

# 2つのファイルをキーで結合（簡易join）
awk -F',' 'NR==FNR { data[$1]=$2; next } $1 in data { print $0, data[$1] }' file1.csv file2.csv
```

---

## awk と sed の使い分け

| 用途 | sed | awk |
|------|-----|-----|
| 単純な文字列置換 | 最適 | 可能だが冗長 |
| 行の削除・挿入 | 最適 | 可能 |
| 列の抽出 | 不向き | 最適 |
| 数値の集計・計算 | 不可 | 最適 |
| 条件分岐 | 限定的 | 柔軟 |
| 正規表現による操作 | 得意 | 得意 |
| CSVなどの構造化データ | 不向き | 最適 |
| ファイルの直接編集（-i） | 可能 | 不可（通常） |

### 判断の目安

- **「置き換えたい」「消したい」→ sed**
- **「特定の列を取り出したい」「集計したい」→ awk**
- **両方必要な場合 → パイプラインで組み合わせる**

```bash
# sedで不要行を削除してからawkで集計
cat log.txt | sed '/^#/d' | awk '{ sum += $3 } END { print sum }'
```

---

## モダン代替ツール（sd）との比較

**sd**はsedの代替として開発されたモダンなツールです:

| 特徴 | sed | sd |
|------|-----|-----|
| 構文 | `s/old/new/` | `old new`（直感的） |
| 正規表現 | POSIX BRE/ERE | Rust正規表現（デフォルトで高機能） |
| エスケープ | 多い | 少ない |
| 速度 | 十分高速 | 高速 |
| 学習コスト | やや高い | 低い |
| 汎用性 | 非常に高い（どこでもある） | インストールが必要 |

```bash
# sed での置換
sed 's/hello/world/g' file.txt
sed 's|/usr/local|/opt|g' file.txt

# sd での同じ置換（よりシンプル）
sd 'hello' 'world' file.txt
sd '/usr/local' '/opt' file.txt
```

> sdの詳細は [[sd]] を参照してください。

---

## まとめ

- **sed**: テキストの置換・削除に特化。ワンライナーで素早くテキストを加工したい時に最適
- **awk**: 列の抽出・集計に特化。構造化データを処理する時に力を発揮
- どちらもパイプラインの中で組み合わせて使うことで、複雑なテキスト処理を効率的に行える
- モダンな代替ツール（sd など）もあるが、sed/awk はほぼすべてのUnix環境で使えるため、基本を押さえておく価値がある
