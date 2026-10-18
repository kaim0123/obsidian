# sd - 直感的な検索・置換ツール

## 概要

**sd**は、sedの代替として開発された**直感的で高速なテキスト置換ツール**です。Rustで書かれており、sedの複雑なエスケープルールに悩まされることなく、シンプルな構文でテキストの検索・置換ができます。

### sdの特徴

- **直感的な構文**: `sd 'パターン' '置換文字列'`（sedの`s/old/new/`より簡単）
- **デフォルトで正規表現対応**: Rust正規表現エンジンによる高機能な正規表現
- **エスケープが少ない**: スラッシュやその他の特殊文字のエスケープがほぼ不要
- **高速**: Rustで実装されているため処理速度が速い
- **マルチライン対応**: デフォルトで複数行にまたがるマッチが可能

---

## インストール

```bash
# macOS（Homebrew）
brew install sd

# Ubuntu / Debian（cargo経由）
cargo install sd

# Windows（Scoop）
scoop install sd

# Windows（Cargo）
cargo install sd

# Arch Linux
pacman -S sd
```

バージョン確認:

```bash
sd --version
```

---

## 基本的な使い方

### パイプラインでの置換

```bash
# 基本的な文字列置換
echo "hello world" | sd 'hello' 'hi'
# → hi world

# 正規表現による置換
echo "foo123bar" | sd '[0-9]+' 'NUM'
# → fooNUMbar
```

### ファイルの置換

```bash
# ファイルの内容を直接置換（インプレース編集）
sd 'old_text' 'new_text' file.txt

# 複数ファイルを一括置換
sd 'old_text' 'new_text' file1.txt file2.txt file3.txt
```

> **注意**: sdはデフォルトでファイルを直接書き換えます。事前にバックアップを取るか、先にパイプで結果を確認しましょう。

### 置換前の確認（プレビュー）

```bash
# パイプで結果を確認してからファイルに適用
cat file.txt | sd 'old' 'new'

# findやfdと組み合わせて複数ファイルに適用
fd -e txt | xargs sd 'old' 'new'
```

---

## 正規表現サポート

sdはデフォルトで**Rust正規表現**を使用します。PCRE（Perl互換正規表現）に近い記法が使えます:

```bash
# 数字にマッチ
echo "abc123def456" | sd '\d+' 'NUM'
# → abcNUMdefNUM

# 単語境界
echo "cat concatenate" | sd '\bcat\b' 'dog'
# → dog concatenate

# キャプチャグループと後方参照
echo "2024-01-15" | sd '(\d{4})-(\d{2})-(\d{2})' '$2/$3/$1'
# → 01/15/2024

# 名前付きキャプチャグループ
echo "John Smith" | sd '(?P<first>\w+) (?P<last>\w+)' '$last, $first'
# → Smith, John

# 大文字・小文字を無視（フラグ）
echo "Hello HELLO hello" | sd '(?i)hello' 'hi'
# → hi hi hi

# 複数行マッチ
echo -e "foo\nbar\nbaz" | sd '(?s)foo.*baz' 'replaced'
# → replaced

# 非貪欲マッチ
echo "<a>text</a><b>more</b>" | sd '<.*?>' '[]'
# → []text[][]more[]
```

---

## よく使うオプション

| オプション | 説明 |
|-----------|------|
| `-p` / `--preview` | 変更をプレビュー（ファイルを変更しない） |
| `-s` / `--string-mode` | 正規表現を無効化（リテラル文字列として扱う） |
| `-f` / `--flags` | 正規表現フラグの指定 |

### リテラルモード（-s）

正規表現の特殊文字をそのまま文字列として扱いたい場合:

```bash
# 正規表現モード（デフォルト）: ドットは任意の文字にマッチ
echo "3.14" | sd '3.14' 'pi'    # "3X14"にもマッチしてしまう

# リテラルモード: ドットはドットそのもの
echo "3.14" | sd -s '3.14' 'pi'
# → pi

# 括弧やアスタリスクも安全
echo "func()" | sd -s 'func()' 'method()'
# → method()
```

---

## sedとの構文比較

### 基本置換

```bash
# sed
sed 's/hello/world/g' file.txt
echo "hello" | sed 's/hello/world/'

# sd（よりシンプル）
sd 'hello' 'world' file.txt
echo "hello" | sd 'hello' 'world'
```

### パスの置換

```bash
# sed（区切り文字の変更が必要）
sed 's|/usr/local/bin|/opt/bin|g' file.txt

# sd（エスケープ不要）
sd '/usr/local/bin' '/opt/bin' file.txt
```

### キャプチャグループ

```bash
# sed（バックスラッシュ + 番号）
echo "foo bar" | sed -E 's/(foo) (bar)/\2 \1/'

# sd（ドル記号 + 番号、より直感的）
echo "foo bar" | sd '(foo) (bar)' '$2 $1'
```

### 複雑な正規表現

```bash
# sed（多くのエスケープが必要）
sed -E 's/\{([^}]+)\}/[\1]/g' file.txt

# sd（Rust正規表現でよりクリーン）
sd '\{([^}]+)\}' '[$1]' file.txt
```

### 比較まとめ

| 特徴 | sed | sd |
|------|-----|-----|
| 構文 | `s/pattern/replacement/flags` | `pattern replacement` |
| 区切り文字 | 必要（`/` or `\|` or `#`） | 不要 |
| エスケープ | 多い | 少ない |
| 正規表現 | POSIX BRE/ERE | Rust正規表現 |
| ファイル直接編集 | `-i` オプション | デフォルト |
| 削除・挿入 | 可能（d, i, a コマンド） | 置換のみ |
| アドレス指定 | 可能（行番号、パターン） | 不可 |
| 複数コマンド | `-e` で連結 | パイプで連結 |
| 可搬性 | どこでもある | インストール必要 |

---

## 実践的な使用例

### コードのリファクタリング

```bash
# 関数名の変更（全ファイル）
fd -e py | xargs sd 'old_function_name' 'new_function_name'

# import文の変更
fd -e ts | xargs sd 'from "old-package"' 'from "new-package"'

# console.log の除去
fd -e js | xargs sd 'console\.log\(.*?\);?\n?' ''
```

### 設定ファイルの更新

```bash
# ポート番号の変更
sd 'port: 8080' 'port: 3000' config.yaml

# 環境変数の更新
sd 'DATABASE_URL=.*' 'DATABASE_URL=postgres://localhost:5432/mydb' .env
```

### パイプラインでの活用

```bash
# コマンド出力の加工
docker ps | sd '\s+' '\t'

# ログの整形
cat app.log | sd '(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})' '$1 $2'

# JSONキーのリネーム（簡易的に）
cat data.json | sd '"oldKey"' '"newKey"'
```

### fd + sd による一括置換

```bash
# プロジェクト全体でクラス名を変更
fd -e java -e kt | xargs sd 'OldClassName' 'NewClassName'

# Markdownファイルのリンク形式を変更
fd -e md | xargs sd '\[([^\]]+)\]\(http' '[$1](https'

# 特定ディレクトリ配下のみ対象
fd -e tsx --search-path src/components | xargs sd 'OldComponent' 'NewComponent'
```

---

## 注意点

- sdは**置換専用**のツールです。sedの`d`（削除）や`i`（挿入）のような行操作はできません
- ファイルをデフォルトで直接編集するため、gitなどで変更を追跡できる環境で使うと安全
- 空文字列への置換（削除）は`sd 'pattern' ''`で可能

---

## まとめ

- **sd**はsedの「置換」機能に特化した、よりシンプルで直感的なツール
- 正規表現のエスケープに悩まされることが少なく、初心者にも扱いやすい
- **fd**と組み合わせることで、プロジェクト全体の一括リファクタリングが簡単にできる
- sedの全機能が必要な場合はsedを、単純な置換だけならsdを使うのがおすすめ
