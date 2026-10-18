# PowerShell初心者ガイド

## 目次
1. [PowerShellとは](#powershellとは)
2. [起動方法](#起動方法)
3. [基本的な画面構成](#基本的な画面構成)
4. [コマンドレットの基礎](#コマンドレットの基礎)
5. [基本的なコマンドレット](#基本的なコマンドレット)
6. [ファイルとディレクトリ操作](#ファイルとディレクトリ操作)
7. [オブジェクトの操作](#オブジェクトの操作)
8. [パイプラインの活用](#パイプラインの活用)
9. [変数とスクリプト](#変数とスクリプト)
10. [実践練習](#実践練習)
11. [よくあるエラーと対処法](#よくあるエラーと対処法)
12. [次のステップ](#次のステップ)

---

## PowerShellとは

**PowerShell**は、Microsoftが開発した高機能なコマンドラインシェルとスクリプト言語です。コマンドプロンプトよりも強力で、オブジェクト指向の操作が可能です。

### PowerShellの特徴
- **オブジェクト指向**: データをオブジェクトとして扱える
- **コマンドレット**: 「動詞-名詞」形式の直感的なコマンド
- **パイプライン**: コマンドを連鎖させて複雑な処理が可能
- **.NET統合**: .NET Frameworkとの連携が可能
- **クロスプラットフォーム**: Windows、Linux、macOSで動作

### なぜPowerShellを学ぶのか？
- **システム管理**: Windows環境での高度な管理が可能
- **自動化**: 複雑なタスクをスクリプトで自動化
- **Microsoft製品連携**: Office 365、Azure等との連携
- **開発効率**: プログラミング開発の効率化

---

## 起動方法

### 方法1: スタートメニューから
1. スタートボタンをクリック
2. 「PowerShell」と入力
3. 「Windows PowerShell」をクリック

### 方法2: ファイル名を指定して実行
1. `Windows + R` キーを押す
2. 「powershell」と入力
3. Enterキーを押す

### 方法3: 管理者権限で起動
1. スタートボタンを右クリック
2. 「Windows PowerShell (管理者)」を選択

---

## 基本的な画面構成

```
PS C:\Users\ユーザー名>
```

### 各部分の説明
- `PS`: PowerShellであることを示す
- `C:\Users\ユーザー名`: 現在のディレクトリのパス
- `>`: プロンプト（コマンド入力待ち状態）

### 重要なキー操作
- **Enter**: コマンドを実行
- **↑/↓**: コマンド履歴の移動
- **Tab**: コマンドやパラメータの自動補完
- **Ctrl + C**: 実行中のコマンドを中断
- **Ctrl + D**: PowerShellを終了

---

## コマンドレットの基礎

### コマンドレットとは
PowerShellのコマンドは「コマンドレット」と呼ばれ、「動詞-名詞」の形式で構成されています。

#### 基本的な形式
```powershell
動詞-名詞 -パラメータ 値
```

#### 例
```powershell
Get-Process -Name notepad
```
- `Get`: 動詞（取得する）
- `Process`: 名詞（プロセス）
- `-Name`: パラメータ（名前を指定）
- `notepad`: 値（notepadという名前）

### ヘルプの表示
```powershell
# コマンドレットのヘルプを表示
Get-Help Get-Process

# 詳細なヘルプを表示
Get-Help Get-Process -Detailed

# 例を含むヘルプを表示
Get-Help Get-Process -Examples

# すべてのコマンドレットを表示
Get-Command
```

---

## 基本的なコマンドレット

### 1. 現在のディレクトリを確認
```powershell
Get-Location
```
または
```powershell
pwd
```

### 2. ディレクトリ一覧の表示
```powershell
Get-ChildItem
```
または
```powershell
ls
```
または
```powershell
dir
```

### 3. ディレクトリの移動
```powershell
Set-Location ディレクトリ名
```
または
```powershell
cd ディレクトリ名
```

### 4. 新しいディレクトリの作成
```powershell
New-Item -ItemType Directory -Name ディレクトリ名
```
または
```powershell
mkdir ディレクトリ名
```

### 5. ディレクトリの削除
```powershell
Remove-Item ディレクトリ名
```
または
```powershell
rmdir ディレクトリ名
```

### 6. システム情報の取得
```powershell
Get-ComputerInfo
```

### 7. 実行中のプロセス一覧
```powershell
Get-Process
```

### 8. サービス一覧の表示
```powershell
Get-Service
```

---

## ファイルとディレクトリ操作

### ファイル一覧の表示
```powershell
# 基本的な表示
Get-ChildItem

# 詳細情報付きで表示
Get-ChildItem -Force

# 特定のファイルタイプのみ表示
Get-ChildItem *.txt

# 再帰的に表示（サブディレクトリも含む）
Get-ChildItem -Recurse
```

### ファイルのコピー
```powershell
Copy-Item 元ファイル コピー先
```
または
```powershell
cp 元ファイル コピー先
```

#### 例
```powershell
Copy-Item file1.txt file2.txt
Copy-Item file1.txt C:\backup\
Copy-Item -Recurse C:\source C:\destination
```

### ファイルの移動・リネーム
```powershell
Move-Item 元ファイル 移動先
```
または
```powershell
mv 元ファイル 移動先
```

### ファイルの削除
```powershell
Remove-Item ファイル名
```
または
```powershell
rm ファイル名
```

### ファイルの内容表示
```powershell
Get-Content ファイル名
```
または
```powershell
cat ファイル名
```

### ファイルの内容を書き込み
```powershell
Set-Content ファイル名 "内容"
```
または
```powershell
echo "内容" > ファイル名
```

---

## オブジェクトの操作

### オブジェクトとは
PowerShellでは、すべてのデータがオブジェクトとして扱われます。オブジェクトには「プロパティ」と「メソッド」があります。

### オブジェクトのプロパティを表示
```powershell
# プロセスの詳細情報を表示
Get-Process | Format-List

# 特定のプロパティのみ表示
Get-Process | Select-Object Name, Id, CPU

# プロパティを表形式で表示
Get-Process | Format-Table Name, Id, CPU
```

### オブジェクトのフィルタリング
```powershell
# 特定の条件でフィルタリング
Get-Process | Where-Object {$_.CPU -gt 100}

# 名前でフィルタリング
Get-Process | Where-Object {$_.Name -like "*notepad*"}
```

### オブジェクトの並び替え
```powershell
# CPU使用率で並び替え
Get-Process | Sort-Object CPU -Descending

# 名前で並び替え
Get-Process | Sort-Object Name
```

---

## パイプラインの活用

### パイプラインとは
パイプライン（`|`）を使用して、コマンドレットの出力を次のコマンドレットの入力として渡すことができます。

### 基本的なパイプライン
```powershell
# プロセス一覧を取得して、CPU使用率で並び替え
Get-Process | Sort-Object CPU -Descending

# サービス一覧を取得して、実行中のもののみ表示
Get-Service | Where-Object {$_.Status -eq "Running"}

# ファイル一覧を取得して、テキストファイルのみ表示
Get-ChildItem | Where-Object {$_.Extension -eq ".txt"}
```

### 複数のパイプライン
```powershell
# プロセス一覧を取得 → CPU使用率で並び替え → 上位5つを表示
Get-Process | Sort-Object CPU -Descending | Select-Object -First 5
```

---

## 変数とスクリプト

### 変数の使用
```powershell
# 変数に値を代入
$name = "PowerShell"
$number = 42
$files = Get-ChildItem

# 変数の値を表示
Write-Host $name
Write-Host "数値は $number です"

# 変数の型を確認
$name.GetType()
```

### 簡単なスクリプトの作成
```powershell
# スクリプトファイルを作成
notepad myscript.ps1
```

### スクリプトの内容例
```powershell
# スクリプトの例
param(
    [string]$UserName = "Guest"
)

Write-Host "こんにちは、$UserName さん！"
Write-Host "現在の時刻: $(Get-Date)"
Write-Host "現在のディレクトリ: $(Get-Location)"

# プロセス一覧を表示
Get-Process | Select-Object -First 5 | Format-Table
```

### スクリプトの実行
```powershell
# スクリプトを実行
.\myscript.ps1

# パラメータを指定して実行
.\myscript.ps1 -UserName "田中"
```

---

## 実践練習

### 練習1: 基本的なコマンドレット
```powershell
# 1. 現在のディレクトリを確認
Get-Location

# 2. ディレクトリ一覧を表示
Get-ChildItem

# 3. 新しいフォルダを作成
New-Item -ItemType Directory -Name "PowerShell練習"

# 4. 作成したフォルダに移動
Set-Location "PowerShell練習"

# 5. 現在のディレクトリを確認
Get-Location
```

### 練習2: オブジェクト操作
```powershell
# 1. プロセス一覧を取得
Get-Process

# 2. プロセスの詳細情報を表示
Get-Process | Format-List

# 3. 特定のプロセスのみ表示
Get-Process | Where-Object {$_.Name -like "*notepad*"}

# 4. CPU使用率で並び替え
Get-Process | Sort-Object CPU -Descending

# 5. 上位5つのプロセスを表示
Get-Process | Sort-Object CPU -Descending | Select-Object -First 5
```

### 練習3: ファイル操作
```powershell
# 1. テキストファイルを作成
"Hello PowerShell!" | Out-File -FilePath "test.txt"

# 2. ファイルの内容を表示
Get-Content "test.txt"

# 3. ファイルをコピー
Copy-Item "test.txt" "test_copy.txt"

# 4. ファイル一覧を確認
Get-ChildItem

# 5. コピーファイルを削除
Remove-Item "test_copy.txt"
```

### 練習4: パイプラインの活用
```powershell
# 1. サービス一覧を取得して実行中のもののみ表示
Get-Service | Where-Object {$_.Status -eq "Running"}

# 2. ファイル一覧を取得してテキストファイルのみ表示
Get-ChildItem | Where-Object {$_.Extension -eq ".txt"}

# 3. プロセス一覧を取得して名前で並び替え
Get-Process | Sort-Object Name | Select-Object Name, Id
```

---

## よくあるエラーと対処法

### 1. 実行ポリシーのエラー
```
myscript.ps1 を読み込めません。このファイルは実行ポリシーによって実行が無効になっています。
```
**原因**: PowerShellの実行ポリシーが制限されている
**対処法**: 
```powershell
# 実行ポリシーを確認
Get-ExecutionPolicy

# 実行ポリシーを変更（管理者権限が必要）
Set-ExecutionPolicy RemoteSigned
```

### 2. コマンドレットが見つからない
```
Get-Process : 'Get-Process' という名前のコマンドレットは認識されません。
```
**原因**: コマンドレット名のスペルミス
**対処法**: 
- コマンドレット名を正確に入力
- `Get-Command`で利用可能なコマンドを確認
- `Get-Help`でヘルプを確認

### 3. パラメータのエラー
```
Set-Location : 位置指定パラメータ 'Path' に複数の引数を渡すことはできません。
```
**原因**: パラメータの使用方法が間違っている
**対処法**: 
- `Get-Help コマンドレット名`でヘルプを確認
- パラメータの正しい使用方法を確認

### 4. アクセス権限のエラー
```
アクセスが拒否されました。
```
**原因**: 管理者権限が必要な操作
**対処法**: 
- 管理者としてPowerShellを実行
- 別のディレクトリで試す

---

## 便利なテクニック

### 1. エイリアスの使用
PowerShellでは、コマンドレットにエイリアス（別名）が設定されています。

```powershell
# エイリアス一覧を表示
Get-Alias

# よく使うエイリアス
ls = Get-ChildItem
dir = Get-ChildItem
cd = Set-Location
pwd = Get-Location
cat = Get-Content
cp = Copy-Item
mv = Move-Item
rm = Remove-Item
```

### 2. タブ補完
コマンドレット名やパラメータ名の途中まで入力してTabキーを押すと、自動補完されます。

### 3. 履歴の活用
```powershell
# コマンド履歴を表示
Get-History

# 特定のコマンドを実行
Invoke-History 5
```

### 4. プロファイルの設定
```powershell
# プロファイルのパスを確認
$PROFILE

# プロファイルを作成
New-Item -ItemType File -Path $PROFILE -Force

# プロファイルを編集
notepad $PROFILE
```

---

## 次のステップ

### 1. より高度なコマンドレットを学習
- `Invoke-WebRequest`: Webページの取得
- `ConvertTo-Json`: JSON形式への変換
- `Import-Csv`: CSVファイルの読み込み
- `Export-Csv`: CSVファイルへの出力

### 2. スクリプトの作成
- 条件分岐（if文）
- ループ（for文、while文）
- 関数の定義
- エラーハンドリング

### 3. モジュールの使用
- 既存のモジュールの活用
- カスタムモジュールの作成

### 4. リモート管理
- リモートコンピュータへの接続
- リモートスクリプトの実行

### 5. Azure PowerShell
- クラウドサービスの管理
- リソースの自動化

---

## まとめ

PowerShellは、Windows環境でのシステム管理と自動化に非常に強力なツールです。このガイドで学んだ内容を基に、実際にコマンドレットを入力して練習してください。

### 学習のポイント
1. **コマンドレットの命名規則**: 「動詞-名詞」形式を理解する
2. **オブジェクトの概念**: データをオブジェクトとして扱う
3. **パイプラインの活用**: コマンドを連鎖させて複雑な処理を実現
4. **ヘルプの活用**: `Get-Help`を積極的に使用
5. **実践重視**: 実際のタスクでPowerShellを使用する

次のステップとして、より高度なスクリプト作成や、Git Bashの学習に進むことをお勧めします！

---

*このガイドが皆様のPowerShell学習の一助となれば幸いです。*
