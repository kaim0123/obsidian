# 改行コード CRLF と LF — Git autocrlf 設定との関係

## はじめに

テキストファイルの「**改行**」には、**OS ごとに違う文字** が使われています。

| OS | 改行コード | バイト表現 |
|----|----------|----------|
| Windows | **CRLF**（`\r\n`） | `0x0D 0x0A` |
| Unix / Linux / macOS（OS X 以降） | **LF**（`\n`） | `0x0A` |
| 古い Mac（OS 9 以前） | **CR**（`\r`） | `0x0D` |

この違いが、**クロスプラットフォームで開発すると必ずぶつかる問題** を引き起こします。

---

## CR・LF の由来

昔のタイプライター → テレタイプ時代の名残:

- **CR (Carriage Return)**: キャリッジ（印字ヘッド）を左端に戻す
- **LF (Line Feed)**: 紙送り（次の行へ）

物理的には **2つの動作** だったので、初期のプリンタも `CR + LF` の組み合わせで改行を表現していました。Windows（とその祖先 DOS）はこの慣習を引き継ぎ、Unix 系は「1文字で十分」と LF のみに。

---

## どこで何が使われているか

| ツール・環境 | 既定 |
|------------|-----|
| Windows メモ帳 | CRLF |
| VSCode（Windows） | 設定次第（既定: LF） |
| Vim / Emacs | LF（cross platform） |
| Node.js で書き出すファイル | LF |
| Python `open(..., 'w')` | OS 依存（newline 指定で変わる） |
| Git（raw） | LF（推奨）※ autocrlf 設定で変換あり |
| Web 配信（HTTP） | 両方可（HTTP/1.1 は CRLF 推奨） |

---

## 何が問題になるか

### 1. Git で全行 diff 表示

CRLF のまま commit したファイルを Linux 環境で編集 → 変換され、**全行が変更** と表示される。実質的な変更ゼロでも diff が汚れる。

### 2. シェルスクリプト (`.sh`) が動かない

bash は **LF でなければスクリプトとして動作しない**。

```
$ bash script.sh
script.sh: line 2: #!/bin/bash: No such file or directory
   ← 実はシバン行の末尾に \r が入っていて、シバンが読めない
```

### 3. Python / Ruby のエラー

多くの言語はクロスプラットフォームだが、**CR を含む改行** でパーサーエラーになることも（特に古いバージョン）。

### 4. エディタで「^M」表示

```
#!/bin/bash^M
echo hello^M
```

CR を特殊記号 `^M` として表示するエディタあり（vim、less 等）。

### 5. 文字列処理のずれ

```python
len("hello\r\n")  # 7 文字
len("hello\n")    # 6 文字
```

文字列長計算、比較で違いが出る。

---

## 見分ける方法

### VSCode

右下のステータスバー:

```
CRLF / LF
```

で確認・切り替え可能。

### コマンドラインで確認

```bash
# Windows (PowerShell)
(Get-Content -Raw file.txt).Contains("`r`n")
# true → CRLF

# Linux / WSL
file file.txt
# text, ASCII text, with CRLF line terminators  ← CRLF
# text, ASCII text                              ← LF
```

### od（バイト表示）

```bash
head -n 2 file.txt | od -c
# ...  \r  \n  ← CRLF
# ...  \n     ← LF
```

---

## Git の `core.autocrlf`

Git の **目玉機能**。改行コードを自動変換します。

### 3つの設定値

| 値 | commit 時 | checkout 時 | 推奨環境 |
|----|----------|------------|---------|
| `true` | CRLF → LF | LF → CRLF | **Windows 開発者** |
| `input` | CRLF → LF | 変換なし | **Linux / macOS** |
| `false` | 変換なし | 変換なし | 変換したくない人 |

### 仕組み

- **リポジトリ内（.git）には常に LF** で保存される
- **作業ディレクトリ** は OS の都合に合わせる

これで、**リポジトリはクリーン、手元は快適** を両立。

### 設定

```bash
# Windows
git config --global core.autocrlf true

# Linux / macOS
git config --global core.autocrlf input

# 無効化（明示的に管理したい）
git config --global core.autocrlf false
```

---

## `.gitattributes` でリポジトリごとに制御

`autocrlf` は **ユーザー依存**（各自の環境で異なる）。チームでブレないように **リポジトリに設定を固定** するのが理想。

### 基本

プロジェクトルートに `.gitattributes`:

```
# 既定: 自動判定
* text=auto

# 明示: テキストとして扱う（LF 保存、OS 依存の変換）
*.md    text
*.js    text
*.py    text

# 特定拡張子は LF 固定
*.sh    text eol=lf
Makefile text eol=lf

# 特定拡張子は CRLF 固定（Windows 専用スクリプト）
*.bat   text eol=crlf
*.cmd   text eol=crlf
*.ps1   text eol=crlf

# バイナリは変換しない
*.png   binary
*.jpg   binary
*.pdf   binary
```

こうすると **各自の autocrlf 設定に関係なく、チーム全員が同じ改行コード** で作業できる。

### `text=auto` の意味

- Git がコンテンツを自動判定
- テキストと判断したら改行正規化
- バイナリと判断したら触らない

### `eol=lf` / `eol=crlf`

ファイルをチェックアウトするときの改行を強制。

### 推奨構成

```gitattributes
# デフォルトはテキスト扱い、OS 依存の変換
* text=auto eol=lf

# Unix スクリプトは必ず LF
*.sh text eol=lf

# Windows スクリプトは必ず CRLF
*.bat text eol=crlf
*.cmd text eol=crlf
*.ps1 text eol=crlf

# バイナリ
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
*.zip binary
*.pdf binary
```

---

## 既存ファイルを一括変換

### dos2unix / unix2dos

```bash
# WSL / Linux
sudo apt install dos2unix

# CRLF → LF
dos2unix file.txt

# LF → CRLF
unix2dos file.txt
```

### VSCode で一括変換

- ファイル個別: 右下の CRLF/LF をクリック → 切替 → 保存
- 複数ファイル: 拡張「Change End of Line sequence」

### Git で一括統一

```bash
# 正規化（.gitattributes 設定後）
git add --renormalize .
git commit -m "Normalize line endings"
```

---

## エディタ別の設定

### VSCode

```json
{
  "files.eol": "\n",       // 既定の改行 (LF)
  "files.insertFinalNewline": true,  // ファイル末尾に改行を入れる
  "files.trimFinalNewlines": true,   // 末尾の余分な改行を削除
  "files.trimTrailingWhitespace": true
}
```

### Vim

```vim
" 新規ファイルは LF
set fileformat=unix
```

### メモ帳

Windows 11 から CRLF / LF 切替対応（ステータスバー）。

---

## EditorConfig

言語・エディタ非依存の設定ファイル。`.editorconfig` をリポジトリルートに:

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf            # 改行
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.{bat,cmd,ps1}]
end_of_line = crlf

[Makefile]
indent_style = tab
```

VSCode は拡張「EditorConfig for VS Code」で対応。多くのエディタ・IDE が標準対応。

---

## 典型的トラブルと対処

### 1. シェルスクリプトが `^M` エラー

```
env: bash\r: No such file or directory
```

→ `dos2unix script.sh` または エディタで LF に変換。

### 2. Git の diff が全行表示される

→ `autocrlf` の設定ミス。`.gitattributes` でリポジトリ側に固定する。

```bash
git add --renormalize .
```

### 3. Docker コンテナで `entrypoint.sh` が動かない

Windows でビルドすると CRLF のまま入る。`Dockerfile` で:

```dockerfile
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh
```

または `.gitattributes` で `*.sh text eol=lf`。

### 4. Windows のサーバーソフトが LF で動かない

古いソフトに CRLF を要求されることも。対象ファイルだけ `eol=crlf` 指定。

---

## まとめ

- 改行コードは歴史的に **Windows=CRLF、Unix=LF** で分かれた
- 現代の開発はほぼ **LF 統一** が推奨
- Git は `core.autocrlf` で自動変換 → **Windows は `true`、Linux/macOS は `input`**
- **チーム開発では `.gitattributes`** でリポジトリ側に固定
- **シェルスクリプトは LF、Windows バッチは CRLF** が鉄則
- EditorConfig で一元管理すると事故が減る
