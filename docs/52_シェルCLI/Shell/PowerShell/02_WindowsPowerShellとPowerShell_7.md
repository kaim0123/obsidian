# Windows PowerShell と PowerShell 7 — 5.1 と 7.x の違い

## なぜ 2 種類あるのか

Windows 10 / 11 を触っていると、PowerShell 関連で **2 つの別物** に出会う。

- **Windows PowerShell 5.1** — OS に最初から入っているやつ
- **PowerShell 7.x** — 別途インストールする新しいやつ（`pwsh`）

「どっちを使えばいいのか」「両方入れていいのか」で混乱しがちなので、この文書でその交通整理をする。

---

## 1. そもそもの歴史

```
Windows PowerShell 1.0 (2006)
   ↓ ... Windows に同梱されながら進化 ...
Windows PowerShell 5.1 (2016)   ← ★ ここで Windows 専用版は終了
   ↓
PowerShell Core 6.x (2018)      ← OSS化・マルチプラットフォーム化
   ↓
PowerShell 7.0 (2020)           ← "Core" が取れて正式後継に
   ↓
PowerShell 7.4 / 7.5 (最新)
```

ポイントは次の 2 点。

1. **Windows PowerShell は 5.1 で凍結された**。これ以上の新機能は来ない（バグ修正のみ）。
2. **「PowerShell 7.x」が公式の後継**。クロスプラットフォーム（Windows / macOS / Linux）。

---

## 2. ひと目で違いを

| 項目                       | Windows PowerShell 5.1               | PowerShell 7.x (`pwsh`)                  |
|----------------------------|--------------------------------------|------------------------------------------|
| 実行ファイル名             | `powershell.exe`                     | `pwsh.exe`                               |
| 基盤                       | .NET Framework 4.x                   | .NET 6 / 8 以降                          |
| 対応 OS                    | **Windows のみ**                     | Windows / macOS / Linux                  |
| 同梱                       | Windows 10/11 に標準                 | **別途インストール**（MSI / winget / Store） |
| 今後のアップデート         | セキュリティ修正のみ                 | 機能追加あり（活発に開発中）             |
| 起動速度                   | 遅め                                 | 速め（特に 7.4 以降）                    |
| パイプライン並列化         | なし                                 | あり（`ForEach-Object -Parallel`）       |
| 三項演算子 `a ? b : c`     | なし                                 | あり                                     |
| Null 合体 `??` / `??=`     | なし                                 | あり                                     |
| チェーン演算子 `&&` `\|\|`   | なし                                 | あり                                     |
| `Invoke-RestMethod` などの改良 | 古い挙動                         | 新しい挙動                               |
| 主な用途                   | Windows 管理・古いスクリプトの互換  | 新規開発・クロスプラットフォーム         |

---

## 3. 結論としてどう使い分けるか

### 「これから学ぶなら PowerShell 7」

- 構文が今風（三項演算子、null 合体、パイプチェーン）
- macOS / Linux でもそのまま使える知識になる
- コミュニティ・ドキュメントもこちらを前提にしつつある

### 「既存環境で動くものを触るなら 5.1 も必要」

- **古い社内スクリプトは 5.1 前提** のことが多い
- Windows 管理系モジュールの一部は 5.1 でしか動かない（改善中）
- Active Directory 管理や一部の Windows 専用モジュールは互換性に注意

### 両方入れて共存させるのが普通

PowerShell 7.x は 5.1 を **上書きせず**、**横に並んで共存** する。
「普段は 7、古いスクリプトは 5.1」という使い分けで問題ない。

---

## 4. インストールと起動

### 4-1. PowerShell 7 を入れる

どれか 1 つ：

```powershell
# winget（推奨）
winget install --id Microsoft.PowerShell

# Microsoft Store からでもOK
# 公式サイトの MSI インストーラでもOK
```

### 4-2. 起動する

```powershell
powershell      # Windows PowerShell 5.1 が起動
pwsh            # PowerShell 7.x が起動
```

Windows Terminal のプロファイルに **両方登録しておく** と、起動時に選べて便利。

### 4-3. いま自分がどっちにいるか確かめる

```powershell
$PSVersionTable
```

`PSVersion` を見る：
- `5.1.x` → Windows PowerShell
- `7.x.x` → PowerShell 7

---

## 5. 互換性で気をつけること

### 5-1. スクリプトが動かない原因 TOP 3

1. **`Add-Type -TypeDefinition` で .NET Framework 依存コード** を使っている
   - 5.1 は .NET Framework、7 は .NET Core/.NET 系列なので完全互換ではない
2. **古いモジュールが 7 に対応していない**
   - 例：一部の Exchange 系、社内製モジュールなど
   - → `Windows PowerShell Compatibility` という仕組みで呼び出す手はある
3. **文字コードの扱いが違う**
   - 7 は既定が UTF-8（BOMなし）、5.1 は BOMあり UTF-8 を出すなど差がある
   - 日本語出力の挙動が違うことがある

### 5-2. スクリプトが 5.1 / 7 どちらでも動くように書く

- 新機能（三項演算子・`??` など）は 7 限定。使うと 5.1 で構文エラー
- どちらでも動かしたいなら **古い書き方に統一** しておく
- どうしてもなら先頭で判定：

```powershell
if ($PSVersionTable.PSVersion.Major -lt 7) {
    throw "PowerShell 7 以上が必要です"
}
```

---

## 6. よくある誤解

| 誤解                                       | 実際                                                                 |
|--------------------------------------------|----------------------------------------------------------------------|
| 「PowerShell 7 を入れると 5.1 が消える」   | 消えない。共存する                                                   |
| 「`powershell` と打てば常に最新が起動する」| `powershell` は 5.1 固定。7 は `pwsh`                                |
| 「`Windows PowerShell ISE` でも 7 が使える」| ISE は 5.1 専用。7 は VS Code + PowerShell 拡張が公式推奨            |
| 「7 に移行すれば何も考えなくていい」       | 社内モジュールや古い COM 呼び出しは動かないことがある                |
| 「PowerShell Core ってまだ別物？」         | PowerShell 7 で "Core" は取れた。いまは PowerShell 7 が正式後継      |

---

## 7. 学習・業務での現実的な方針

- **新しく書くスクリプト・コマンド** → `pwsh`（PowerShell 7）で書く
- **社内の既存スクリプトの保守** → 明示されてなければ `powershell`（5.1）で再現確認
- **Windows Terminal** のデフォルトは PowerShell 7 にしておくと快適
- **ISE は卒業**して、VS Code + PowerShell 拡張に移る（コード補完・デバッガが強い）

---

## 関連ドキュメント
- `PowerShell基礎.md` — PowerShell の考え方
- `PowerShellプロファイル.md` — 5.1 と 7 で `$PROFILE` の置き場が別になる話
- `../../Editor/VSCode/` — ISE の代わりになる開発環境
