# Windows の文字コード事情 — CP932 / UTF-8 / UTF-16

## はじめに

Windows の文字コードはややこしいです。**現代は UTF-8 が標準** ですが、Windows だけは歴史的理由で **CP932（Shift_JIS の亜種）** や **UTF-16** が色々な場所で混ざっていて、日本語を扱うと予期しない文字化けが起きます。

この資料では、Windows で遭遇する文字コードを整理し、どこで何が使われているか、何に気をつけるかを解説します。

---

## 登場する文字コード

### 1. CP932（Code Page 932）

- Microsoft の **日本語 Shift_JIS 拡張版**
- 「MS932」「SJIS-win」とも呼ばれる
- Windows の **日本語版の「ANSI コードページ」** として長年使われてきた
- cmd.exe のデフォルト、古いメモ帳、古いテキストファイル

### 2. UTF-8

- **Unicode の可変長エンコーディング**（1〜4バイト）
- Web、macOS、Linux、JSON、現代の開発の事実上の標準
- 日本語は **3バイト** で表現される
- ASCII 互換（英数字は1バイト、Shift_JIS と同じ）
- **Windows も徐々に UTF-8 ベースへ移行中**

### 3. UTF-16（LE/BE）

- Unicode の **固定長寄りエンコーディング**（2〜4バイト）
- **Windows API の内部表現**（`wchar_t` = 16ビット）
- NTFS のファイル名、レジストリ、clipboard などの内部
- 通常はファイル保存に使わない（BOM 付きが必要等、取り扱い面倒）
- 日本語は 2バイト（ASCII 文字も2バイトで ASCII 非互換）

### 4. UTF-8 with BOM

- UTF-8 の先頭に「BOM」（3バイト: `EF BB BF`）を付けたもの
- Windows の特定のツールが好む
- Unix 系ツールでは BOM があると誤動作することがある
- 詳しくは `BOM付きUTF-8問題.md`

---

## どこで何が使われているか

| 場所 | 文字コード | 備考 |
|------|-----------|------|
| NTFS ファイル名 | UTF-16 | OS レベル |
| Windows レジストリ | UTF-16 | OS レベル |
| Windows API (W系) | UTF-16 | `CreateFileW` 等 |
| Windows API (A系) | ANSI（日本なら CP932） | 古い API |
| cmd.exe（既定） | CP932 | 日本語版 |
| cmd.exe（`chcp 65001`） | UTF-8 | 手動変更 |
| PowerShell 5.1 | CP932 傾向 | 実は複雑 |
| PowerShell 7 | UTF-8 | 既定 |
| WSL | UTF-8 | Linux 準拠 |
| Web（HTTP） | UTF-8 | 事実上標準 |
| JSON | UTF-8 | 仕様で規定 |
| メモ帳（Windows 11） | UTF-8 | 既定 |
| メモ帳（古い Windows） | ANSI（CP932） | 要切替 |

---

## CP932 とは何か

### Shift_JIS との違い

**Shift_JIS** は日本語を2バイトで表現する古い規格。**CP932** は Microsoft がそれを拡張し、IBM 拡張文字や独自文字（機種依存文字）を追加したもの。厳密には別規格。

### 特徴

- 1バイト目: `0x81-0x9F` または `0xE0-0xFC`（漢字の先頭）
- 2バイト目: `0x40-0x7E` または `0x80-0xFC`
- **2バイト目に `\` (0x5C) が含まれる漢字** があり、これが大きなバグ源
  - 例: 「能」「表」「十」などの漢字で問題が起きた

### 「ダメ文字」問題

CP932 の一部漢字の2バイト目が `\`（バックスラッシュ）に一致する現象。これを **「ダメ文字」** と呼びます。

例:
```
ソ = 0x83 0x5C   ← 2バイト目が \
```

シェルやテキスト処理でエスケープ文字扱いされ、後続の処理が壊れる。**UTF-8 ならこの問題は起きない**（2バイト目以降は常に `0x80-0xBF`）。

---

## Windows 10 以降の UTF-8 化

2019年、Windows 10 で **「システム ロケールで UTF-8 を使う」** オプションが追加。

**設定 → 時刻と言語 → 言語と地域 → 管理用の言語の設定 → システムロケールの変更**

→ 「**ベータ: ワールドワイド言語サポートで Unicode UTF-8 を使用**」

これを ON にすると、**Windows 全体のデフォルト ANSI コードページが UTF-8** になります。

### メリット

- cmd.exe、古いアプリが UTF-8 を扱いやすくなる
- CP932 のダメ文字問題が消える
- モダンな開発環境と整合性が取れる

### デメリット / リスク

- **一部の古いソフトが誤動作する可能性**（日本語が化ける、起動しない）
- 会社 PC だと変更が制限されていることも
- 不具合が出た場合は OFF に戻せばよい（再起動必要）

---

## cmd.exe の文字コード

### 既定は CP932

cmd を開いて日本語を打つと、CP932 でやりとり。

### `chcp` で切り替え

```cmd
chcp 65001
```

で UTF-8 に切り替わる。逆に:

```cmd
chcp 932
```

で CP932 に戻る。詳しくは `コンソールの文字化け.md`。

### 永続化

レジストリで:

```
HKEY_CURRENT_USER\Console\%SystemRoot%_system32_cmd.exe
```

の `CodePage` を `0xFDE9`（= 65001）にするか、`autoexec.bat` 代わりに常駐設定を用意。

---

## PowerShell の文字コード

### PowerShell 5.1（Windows 標準）

- コンソール出力: CP932
- ファイル出力: 既定では UTF-16 LE BOM 付き（`Set-Content` 等）
- `$OutputEncoding` はパイプに関係
- 複雑…

### PowerShell 7（推奨）

- すべて UTF-8 既定
- モダンな開発では **PowerShell 7** を使うべき
- `winget install Microsoft.PowerShell` で入れられる

### 明示的に UTF-8 で出力

```powershell
# PowerShell 5.1 で UTF-8（BOM なし）
Set-Content -Path file.txt -Value "テキスト" -Encoding UTF8
# PS 5.1 では BOM 付きになる点に注意、BOM 無しは別途対応が必要

# PowerShell 7
Set-Content -Path file.txt -Value "テキスト" -Encoding utf8NoBOM
```

---

## ファイルとして保存する文字コードの選び方

現代の開発では **UTF-8（BOM なし）** が推奨。

| 種類 | 推奨 |
|------|-----|
| ソースコード（.js、.py、.html 等） | UTF-8（BOM なし） |
| JSON | UTF-8（BOM なし）※仕様 |
| YAML | UTF-8 |
| Markdown | UTF-8 |
| CSV（Excel 用） | UTF-8 with BOM または UTF-16 LE（さもないと化ける） |
| バッチファイル(.bat) | CP932（UTF-8 だと文字化け）※または先頭に `chcp 65001` |
| PowerShell(.ps1) | UTF-8 with BOM（PS 5.1 対応のため） |

### バッチファイルと PowerShell の罠

- **.bat は UTF-8 で保存すると cmd 上で日本語が化ける**（CP932 前提）
- **.ps1 は UTF-8 BOM なしで保存すると PowerShell 5.1 で化ける**
- PowerShell 7 なら両方 BOM なし UTF-8 で OK

---

## エディタでの設定

### VSCode

既定の文字コードを UTF-8 に。

```json
// settings.json
{
  "files.encoding": "utf8",
  "files.autoGuessEncoding": true
}
```

画面右下で、ファイル個別に確認・変換できる（エンコーディング表示 → 「エンコードを指定して再度開く」「エンコードを指定して保存」）。

### メモ帳

Windows 11 のメモ帳は既定 UTF-8。Windows 10 以前は「ANSI」なので注意。

### Excel の CSV

Excel は CSV を開くとき、**ローカルの ANSI コードページ（日本なら CP932）で開く**。UTF-8 の CSV を開くと化けるので:

- 保存時に **UTF-8 with BOM** にする
- または **UTF-16 LE（タブ区切り）**
- Excel 2016 以降で「データ → テキストから → ファイルの選択 → UTF-8 を指定」

---

## プログラミング言語での扱い

### Python

```python
# ファイルオープン時にエンコーディング指定（Python 3.10+ は既定 UTF-8）
with open('file.txt', encoding='utf-8') as f:
    ...

# Windows の既定は CP932 なので明示が安全
```

### Node.js

```javascript
// fs は既定 UTF-8
const content = fs.readFileSync('file.txt', 'utf-8');
```

### Java

```java
// Java 18 以降は既定 UTF-8
// それ以前は -Dfile.encoding=UTF-8 を指定
Files.readString(Paths.get("file.txt"), StandardCharsets.UTF_8);
```

---

## トラブルシューティング

### 1. 「ファイルを開いたら文字化け」

- エディタの右下でエンコーディング確認
- 正しいエンコーディングで開き直す
- 保存されているコードを特定して変換

### 2. 「コマンドの出力が化ける」

- `chcp 65001` を先に実行
- または PowerShell 7 に移行

### 3. 「CSV を Excel で開くと化ける」

- **UTF-8 with BOM** にする
- Excel からインポート（エンコーディング指定）

### 4. 「標準出力と標準エラーでエンコーディングが違う」

パイプやリダイレクトで混じる場合。全体を UTF-8 に統一（PowerShell 7 + `chcp 65001`）。

---

## 現代の推奨設定（まとめ）

1. **PowerShell 7** をメインに
2. **システム ロケールを UTF-8** に（必要に応じて）
3. **エディタの既定を UTF-8（BOM なし）** に
4. `.bat` だけは CP932 保存、中で `chcp 65001` が無難
5. CSV は **UTF-8 BOM 付き** か **UTF-16 LE** を明示

---

## まとめ

- Windows には **CP932 / UTF-8 / UTF-16** が混在
- 現代の標準は **UTF-8（BOM なし）**。しかし Windows は歴史的に CP932 前提
- cmd / PS 5.1 / .bat などは CP932、WSL / PS 7 / モダンなツールは UTF-8
- **「ベータ: UTF-8 システムロケール」** で Windows 全体を UTF-8 化する選択肢もある
- PowerShell 7 に移行するのが最も痛みが少ない
- 化けたら **右下の VSCode エンコーディング表示** から確認する癖をつける
