# BOM 付き UTF-8 問題

## はじめに

**BOM**（Byte Order Mark / バイト順マーク）は、テキストファイルの先頭に付く **特殊な3バイト** です。

```
EF BB BF   ← UTF-8 の BOM
FF FE      ← UTF-16 LE の BOM
FE FF      ← UTF-16 BE の BOM
```

UTF-8 には本来 BOM は不要ですが、Windows のツール（特に古いメモ帳）が付けることがあり、これが **さまざまなトラブルの原因** になります。

---

## BOM とは何か

### 本来の目的

- UTF-16 / UTF-32 では、**バイト順**（LE / BE）を示すために必要
- テキストを読み込むソフトが「どのエンコーディングか」を判別する手がかり

### UTF-8 には不要（本質的には）

UTF-8 は 1バイトずつ処理する設計なので、バイト順問題がない。よって本来 BOM は付ける必要がない。

### それでも Windows は付けてきた

Windows のメモ帳や古い API は、**UTF-8 と ANSI（CP932）を区別する目印** として BOM を使ってきた。

「BOM 付き = UTF-8」と判断するロジックは、Unicode 仕様には含まれないが、Windows 生態系では広く使われている。

---

## なぜ問題になるのか

### 1. Unix 系ツールは BOM を解釈しない

`cat`、`grep`、`sed`、シェルスクリプトなどは **BOM を通常の文字として扱う**。その結果:

```bash
#!/bin/bash   ← 先頭に BOM EF BB BF が付くと…
```

**実行時エラー**:
```
bash: ./script.sh: cannot execute: required file not found
env: 'bash\xef\xbb\xbf': No such file or directory
```

シバン行（`#!` で始まる）の前に BOM があると、OS がシェルを見つけられない。

### 2. JSON パースが失敗する

JSON の仕様では BOM は **認めない**（RFC 8259）。ただし多くのパーサーは BOM を許容する。一方で許容しないパーサーでは:

```json
{BOM}{"name": "kai"}   ← 先頭に BOM があるとエラー
```

```
Unexpected token  in JSON at position 0
```

### 3. プログラミング言語の挙動違い

- **Python 3**: UTF-8 ファイルを `open(..., encoding='utf-8')` で開くと BOM が文字列先頭に混入。`utf-8-sig` を使うと BOM を除去できる
- **Node.js**: `fs.readFileSync` は BOM 含めて返す。手動除去が必要
- **Java**: `Files.readString` は BOM を除去しない
- **PHP**: BOM が HTML に混入し、レイアウト崩れや文字化けの原因に

### 4. HTML / CSS / JavaScript で表示崩れ

```html
<!DOCTYPE html>
<html>
<head>...
```

先頭に BOM があると、レンダリング時に **本文の最初の文字** として扱われ、レイアウトが崩れる（空白1文字分のズレ）。

### 5. 連結時の事故

```bash
cat file1.txt file2.txt > combined.txt
```

各ファイルに BOM が付いていると、連結後のファイル中に **BOM が何度も出現**。処理が崩れる。

---

## BOM の確認方法

### バイナリを直接確認

**PowerShell**:
```powershell
Get-Content file.txt -Encoding Byte -TotalCount 3
# 239, 187, 191 → EF BB BF → BOM 付き
```

**bash (WSL)**:
```bash
head -c 3 file.txt | od -An -tx1
# ef bb bf  → BOM 付き
```

### ファイルコマンド

```bash
file file.txt
# UTF-8 Unicode (with BOM) text   ← BOM 付き
# UTF-8 Unicode text              ← BOM なし
```

### VSCode

右下のエンコーディング表示:

- `UTF-8` → BOM なし
- `UTF-8 with BOM` → BOM 付き

クリックして切り替え可能。

---

## BOM を削除する方法

### PowerShell

```powershell
# PowerShell 7
Set-Content -Path file.txt -Value (Get-Content file.txt -Raw) -Encoding utf8NoBOM

# PowerShell 5.1 は utf8NoBOM がないので自前で
$content = Get-Content -Path file.txt -Raw
[System.IO.File]::WriteAllText("file.txt", $content, [System.Text.UTF8Encoding]::new($false))
```

### VSCode

右下の `UTF-8 with BOM` → クリック → 「エンコード付きで保存」→ `UTF-8`（BOM なし）

### sed (WSL)

```bash
# 最初の行の BOM を削除
sed -i '1s/^\xEF\xBB\xBF//' file.txt
```

### dos2unix

```bash
dos2unix --remove-bom file.txt
```

---

## BOM を付ける / 付けないの判断

### BOM を **付けない** のが無難（推奨）

ほとんどのケースでは BOM なしの UTF-8 が安全。特に:

- シェルスクリプト (`.sh`)
- JSON / YAML / TOML
- プログラミング言語のソースコード
- Markdown、HTML、CSS、JavaScript
- Git で管理するファイル全般

### BOM を **付ける** ケース

| ケース | 理由 |
|-------|------|
| **Excel に食わせる CSV** | Excel は BOM 付き UTF-8 を認識して自動で UTF-8 として開く |
| **PowerShell 5.1 のスクリプト（`.ps1`）** | BOM なしだと日本語を含むスクリプトが化ける場合あり |
| **古い Windows アプリの設定ファイル** | BOM で UTF-8 を判別するものがある |

Excel の CSV 問題は、**BOM 付き UTF-8 か UTF-16 LE（タブ区切り）** にすれば文字化けしない。

---

## 言語別の対処

### Python

```python
# BOM を自動除去して読む
with open('file.txt', encoding='utf-8-sig') as f:
    content = f.read()   # BOM は含まれない

# BOM 付きで書き出す
with open('out.csv', 'w', encoding='utf-8-sig') as f:
    f.write("name,value\n甲斐,100\n")
```

### Node.js

```javascript
const fs = require('fs');

// 読み込み時に除去
let content = fs.readFileSync('file.txt', 'utf-8');
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}
```

### Java

```java
import java.nio.file.*;
import java.nio.charset.StandardCharsets;

String s = Files.readString(Paths.get("file.txt"), StandardCharsets.UTF_8);
if (s.startsWith("﻿")) {
  s = s.substring(1);
}
```

### Shell

```bash
# BOM を検出して除去しつつ処理
FILE=script.sh
if [ "$(head -c 3 $FILE)" = $'\xef\xbb\xbf' ]; then
  sed -i '1s/^\xEF\xBB\xBF//' $FILE
fi
```

---

## Git と BOM

### BOM 付きファイルが混入したらどうするか

1. 全 BOM 付きファイルを検出:

```bash
# WSL
find . -type f -exec sh -c 'head -c 3 "$1" | grep -q $"\xef\xbb\xbf" && echo "$1"' _ {} \;
```

2. 一括変換（テキストだけ）:

```bash
find . -name "*.js" -exec sed -i '1s/^\xEF\xBB\xBF//' {} +
```

3. `.editorconfig` で新規ファイルに BOM を付けないルール化:

```ini
[*]
charset = utf-8   # BOM なし
```

---

## メモ帳の挙動（Windows 11）

Windows 11 のメモ帳は、保存時に以下の選択肢を提供:

- **UTF-8**（既定、BOM なし）
- **UTF-8 with BOM**
- **UTF-16 LE**
- **ANSI**

BOM 付きは「UTF-8 with BOM」を明示的に選ばない限り付かない。古い Windows 10 以前のメモ帳は「UTF-8 = BOM 付き」しかなかったため、古いファイルに BOM が混入している。

---

## エディタ別の既定

| エディタ | 既定 |
|---------|------|
| VSCode | BOM なし |
| メモ帳（Win11） | BOM なし |
| メモ帳（Win10以前） | BOM 付き |
| Visual Studio | BOM 付き（設定可） |
| Notepad++ | UTF-8（BOM なし、設定可） |
| サクラエディタ | 設定次第 |

Visual Studio ユーザーは、プロジェクトの .editorconfig か設定で BOM なしを明示するのが安全。

---

## トラブル実例

### 実例 1: デプロイスクリプトが動かない

Windows の VS で書いた `.sh` を Linux サーバーで動かしたら:

```
bash: ./deploy.sh: cannot execute: required file not found
```

→ シバンの前に BOM。`sed -i '1s/^\xEF\xBB\xBF//' deploy.sh` で解消。

### 実例 2: API から返す JSON がエラー

Node.js で UTF-8 with BOM のファイルを JSON としてそのまま返していた → クライアント側でパースエラー。

→ サーバー側で BOM 除去してからパース。

### 実例 3: Web ページの先頭に空白

PHP ファイルに BOM → ページ上部に余計な空白 → CSS のレイアウトが崩れる → 全ファイルから BOM 除去して解決。

---

## まとめ

- BOM は **UTF-8 では不要だが、Windows が付けることがある3バイト**（`EF BB BF`）
- **Unix 系ツール・JSON・シェルスクリプト・Web** では **BOM なし** が原則
- **Excel の CSV** だけは BOM 付きのほうが楽
- VSCode の右下で BOM の有無を確認 → 切替
- 言語別に `utf-8-sig`（Python）等のオプションで対応
- `.editorconfig` で **charset = utf-8**（BOM なし）をチームで徹底
