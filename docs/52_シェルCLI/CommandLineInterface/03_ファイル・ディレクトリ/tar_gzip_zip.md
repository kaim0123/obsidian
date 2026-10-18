# tar / gzip / zip - アーカイブと圧縮

## 概要

ファイルの**アーカイブ**（複数ファイルを1つにまとめる）と**圧縮**（データサイズを小さくする）は、バックアップ、配布、転送において欠かせない操作です。

### アーカイブと圧縮の違い

| 操作 | 説明 | 例 |
|------|------|-----|
| **アーカイブ** | 複数のファイルを1つのファイルにまとめる（サイズは変わらない） | tar |
| **圧縮** | データを圧縮してサイズを小さくする | gzip, bzip2, xz |
| **アーカイブ + 圧縮** | まとめてから圧縮する | tar.gz, tar.bz2, tar.xz |

zipは**アーカイブと圧縮を同時に行う**形式です。

---

## tar（テープアーカイブ）

### tarとは

**tar**（Tape Archive）は、複数のファイルやディレクトリを1つのアーカイブファイル（.tar）にまとめるコマンドです。元々はテープメディアへのバックアップ用に作られました。

### 基本オプション

| オプション | 説明 |
|-----------|------|
| `-c` | アーカイブを作成（Create） |
| `-x` | アーカイブを展開（Extract） |
| `-t` | アーカイブの内容を一覧表示（lisT） |
| `-f` | ファイル名を指定（File）※必ず必要 |
| `-v` | 詳細な出力（Verbose） |
| `-z` | gzipで圧縮/解凍 |
| `-j` | bzip2で圧縮/解凍 |
| `-J` | xzで圧縮/解凍 |

### アーカイブの作成

```bash
# .tar アーカイブの作成
tar -cvf archive.tar file1.txt file2.txt dir/

# .tar.gz（gzip圧縮）の作成
tar -czvf archive.tar.gz dir/

# .tar.bz2（bzip2圧縮）の作成
tar -cjvf archive.tar.bz2 dir/

# .tar.xz（xz圧縮）の作成
tar -cJvf archive.tar.xz dir/
```

> **覚え方**: `c`（Create）、`z`（gzip）、`v`（Verbose）、`f`（File）で「czvf」

### アーカイブの展開

```bash
# .tar の展開
tar -xvf archive.tar

# .tar.gz の展開
tar -xzvf archive.tar.gz

# .tar.bz2 の展開
tar -xjvf archive.tar.bz2

# .tar.xz の展開
tar -xJvf archive.tar.xz

# 展開先のディレクトリを指定（-C）
tar -xzvf archive.tar.gz -C /tmp/extracted/

# 特定のファイルだけ展開
tar -xzvf archive.tar.gz path/to/specific/file.txt
```

> **覚え方**: `x`（eXtract）で展開

### アーカイブの内容確認

```bash
# 中身を展開せずに一覧表示
tar -tzvf archive.tar.gz

# 特定のパターンにマッチするファイルを表示
tar -tzvf archive.tar.gz '*.py'
```

### 除外オプション

```bash
# 特定のファイルやディレクトリを除外
tar -czvf archive.tar.gz --exclude='node_modules' --exclude='.git' project/

# 除外パターンをファイルから読み込む
tar -czvf archive.tar.gz --exclude-from='.tarignore' project/

# 特定の拡張子を除外
tar -czvf archive.tar.gz --exclude='*.log' --exclude='*.tmp' dir/
```

---

## gzip / gunzip / zcat

### gzipとは

**gzip**（GNU zip）は、単一ファイルを圧縮するツールです。tarと組み合わせて使うことが多いですが、単独でも使えます。

```bash
# ファイルを圧縮（元ファイルは削除される）
gzip file.txt
# → file.txt.gz が作成される

# 圧縮レベルを指定（1:最速/低圧縮 〜 9:最遅/高圧縮）
gzip -9 file.txt    # 最高圧縮
gzip -1 file.txt    # 最速

# 元ファイルを残す
gzip -k file.txt

# 解凍
gunzip file.txt.gz
# または
gzip -d file.txt.gz

# 圧縮ファイルの中身を表示（解凍せずに）
zcat file.txt.gz

# 圧縮率の確認
gzip -l file.txt.gz
```

---

## bzip2

**bzip2**はgzipより高い圧縮率を提供しますが、圧縮・解凍が遅くなります:

```bash
# 圧縮
bzip2 file.txt
# → file.txt.bz2

# 解凍
bunzip2 file.txt.bz2
# または
bzip2 -d file.txt.bz2

# 元ファイルを残す
bzip2 -k file.txt

# 圧縮ファイルの中身を表示
bzcat file.txt.bz2
```

---

## xz

**xz**は最も高い圧縮率を提供しますが、圧縮速度は最も遅くなります:

```bash
# 圧縮
xz file.txt
# → file.txt.xz

# 解凍
unxz file.txt.xz
# または
xz -d file.txt.xz

# 元ファイルを残す
xz -k file.txt

# 圧縮レベル指定
xz -9 file.txt     # 最高圧縮（非常に遅い）
xz -0 file.txt     # 最速

# マルチスレッド圧縮
xz -T0 file.txt    # 利用可能な全CPUコアを使用
```

---

## zip / unzip

### zipとは

**zip**はWindows環境でも広く使われるアーカイブ+圧縮形式です。tarと異なり、アーカイブと圧縮を同時に行います。

### zipの作成

```bash
# ファイルをzip圧縮
zip archive.zip file1.txt file2.txt

# ディレクトリを再帰的にzip圧縮
zip -r archive.zip dir/

# パスワード付きzip
zip -e -r archive.zip dir/

# 圧縮レベルの指定
zip -9 -r archive.zip dir/    # 最高圧縮
zip -0 -r archive.zip dir/    # 圧縮なし（アーカイブのみ）

# 特定のファイルを除外
zip -r archive.zip dir/ -x "*.log" "*.tmp"
zip -r archive.zip dir/ -x "dir/node_modules/*"
```

### zipの展開

```bash
# 展開
unzip archive.zip

# 展開先を指定
unzip archive.zip -d /tmp/extracted/

# 中身を確認（展開しない）
unzip -l archive.zip

# 特定のファイルだけ展開
unzip archive.zip "path/to/file.txt"

# 上書き確認なしで展開
unzip -o archive.zip

# 既存ファイルをスキップ
unzip -n archive.zip
```

---

## 各フォーマットの比較

| 形式 | 拡張子 | 圧縮率 | 速度 | 特徴 |
|------|--------|-------|------|------|
| gzip | `.gz` | 普通 | 高速 | 最も一般的。バランスが良い |
| bzip2 | `.bz2` | 高い | 遅い | gzipより高圧縮だが遅い |
| xz | `.xz` | 最高 | 最遅 | 配布用パッケージに使われる |
| zip | `.zip` | 普通 | 高速 | Windows互換。個別ファイルにアクセス可 |
| zstd | `.zst` | 高い | 非常に高速 | Meta開発の新世代圧縮 |

### 圧縮率の目安（テキストファイルの場合）

```
元ファイル: 100MB
gzip:       25MB（圧縮率75%）
bzip2:      20MB（圧縮率80%）
xz:         15MB（圧縮率85%）
zip:        25MB（圧縮率75%）
```

### どのフォーマットを選ぶか

| 場面 | 推奨形式 |
|------|---------|
| 一般的なバックアップ | `.tar.gz` |
| 配布パッケージ | `.tar.xz` |
| Windows環境との共有 | `.zip` |
| 高速な圧縮/解凍が必要 | `.tar.gz` or `.tar.zst` |
| 最高の圧縮率が必要 | `.tar.xz` |
| 個別ファイルへのアクセスが必要 | `.zip` |

---

## 実践的な使用例

### プロジェクトのバックアップ

```bash
# プロジェクトのバックアップ（不要ファイルを除外）
tar -czvf backup_$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='*.log' \
  project/
```

### 配布パッケージの作成

```bash
# リリース用パッケージ
tar -cJvf myapp-v1.0.0.tar.xz \
  --exclude='.git' \
  --exclude='tests' \
  --exclude='docs' \
  myapp/

# Windows向けzip
zip -r myapp-v1.0.0.zip myapp/ \
  -x "myapp/.git/*" "myapp/tests/*"
```

### 複数ファイルの一括圧縮

```bash
# 全ログファイルを個別に圧縮
gzip -k *.log

# 古いログファイルをアーカイブしてから削除
tar -czvf old_logs.tar.gz *.log.* && rm *.log.*
```

---

## Windows環境での注意点

- **tar**: Windows 10以降はtarコマンドが標準で利用可能
- **gzip**: Git BashやWSLに含まれる。7-Zipでも対応
- **zip/unzip**: エクスプローラーで標準対応。7-ZipやWSLでも使用可能
- **文字化け**: 日本語ファイル名を含むzipファイルは文字化けする場合がある（UTF-8 vs Shift_JIS）

```bash
# Windows の tar
tar -czvf archive.tar.gz dir/
tar -xzvf archive.tar.gz

# PowerShell でのzip操作
Compress-Archive -Path dir/ -DestinationPath archive.zip
Expand-Archive -Path archive.zip -DestinationPath extracted/
```

---

## まとめ

- **tar**はアーカイブ（まとめる）、**gzip/bzip2/xz**は圧縮（小さくする）
- 最もよく使うのは `tar -czvf`（作成）と `tar -xzvf`（展開）
- `zip`はWindows環境との互換性が必要な場合に使用
- 圧縮率を重視するなら `xz`、速度を重視するなら `gzip`
- バックアップや配布では `--exclude` で不要ファイルを除外する
