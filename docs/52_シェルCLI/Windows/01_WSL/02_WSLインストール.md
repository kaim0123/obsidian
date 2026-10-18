# WSL インストール — `wsl --install` から初回セットアップまで

## はじめに

現代の WSL は、**たった1コマンド** でインストールできます。以前は BIOS 設定や Windows 機能の有効化などが必要でしたが、Windows 10 バージョン 2004 以降はシンプルになっています。

---

## 前提条件

### Windows バージョン

- **Windows 11**: すべてのバージョンで OK
- **Windows 10**: バージョン 2004（ビルド 19041）以降

確認方法:

```powershell
winver
```

または:

```powershell
Get-ComputerInfo | Select-Object WindowsVersion, OsBuildNumber
```

### CPU の仮想化機能

WSL2 は Hyper-V 仮想化を使うため、**CPU の仮想化機能が有効** である必要があります。

確認: タスクマネージャ → パフォーマンス → CPU の項目で「仮想化: 有効」と表示されていれば OK。

無効の場合は BIOS/UEFI で:

- Intel: **VT-x** を有効化
- AMD: **SVM** を有効化

### 管理者権限

WSL のインストールには管理者権限が必要。PowerShell を **管理者として実行** で開きます。

---

## 最速インストール

### ワンコマンドインストール

管理者 PowerShell で以下を実行:

```powershell
wsl --install
```

これだけで:

1. WSL のプラットフォーム機能を有効化
2. Virtual Machine Platform を有効化
3. 最新の WSL カーネルをダウンロード
4. デフォルトで **Ubuntu** をインストール

実行後、**再起動** を求められるので従います。再起動後に Ubuntu のターミナルが自動で開き、初期セットアップが始まります。

### 別のディストロを入れたい場合

```powershell
# 利用可能なディストロを一覧表示
wsl --list --online

# 指定して入れる（例: Debian）
wsl --install -d Debian
```

---

## 初回セットアップ

初回起動時、Ubuntu 等のターミナルで:

```
Enter new UNIX username: <好きなユーザー名>
New password: <パスワード>
Retype new password: <確認>
```

**注意**:
- このユーザー名・パスワードは **Windows とは無関係** で、WSL 内部のもの
- 全て小文字で短めのほうが後で楽（例: `kai`）
- パスワードは `sudo` で必要になる

セットアップ完了すると、プロンプトが以下のようになります:

```
kai@DESKTOP-XYZ:~$
```

---

## インストール後の確認

### ディストロとバージョンの確認

```powershell
wsl --list --verbose
# または
wsl -l -v
```

出力例:

```
  NAME            STATE           VERSION
* Ubuntu          Running         2
  docker-desktop  Stopped         2
```

- `*` はデフォルトディストロ
- `VERSION` が `2` なら WSL2、`1` なら WSL1

### WSL のバージョン確認

```powershell
wsl --version
```

出力例:

```
WSL version: 2.0.9.0
カーネル バージョン: 5.15.133.1-1
WSLg バージョン: 1.0.59
```

---

## 初期設定のおすすめ

### 1. パッケージを最新化

WSL 内で:

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. よく使うツールを入れる

```bash
sudo apt install -y git curl wget build-essential unzip
```

### 3. ロケール設定（日本語対応）

```bash
sudo apt install -y language-pack-ja
sudo update-locale LANG=ja_JP.UTF-8
```

設定後、ターミナルを再起動。

### 4. タイムゾーンを日本に

```bash
sudo timedatectl set-timezone Asia/Tokyo
# 確認
date
```

### 5. systemd を有効化（必要なら）

Ubuntu では新しめのバージョンでデフォルト有効だが、確認・有効化は:

```bash
# /etc/wsl.conf を作成または編集
sudo nano /etc/wsl.conf
```

以下を追記:

```ini
[boot]
systemd=true
```

Windows 側で:

```powershell
wsl --shutdown
```

再起動後、`ps -p 1` の結果が `systemd` なら成功。

---

## よくあるつまずき

### 1. 「仮想マシン プラットフォームが必要」エラー

```
WslRegisterDistribution failed with error: 0x80370102
Please enable the Virtual Machine Platform Windows feature...
```

BIOS で仮想化が無効、または Windows 機能で有効化されていない。

```powershell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

実行後に再起動。

### 2. WSL1 として入ってしまった

```powershell
# デフォルトバージョンを2に
wsl --set-default-version 2

# 既存ディストロを2に変換
wsl --set-version Ubuntu 2
```

### 3. カーネル更新エラー

```
カーネル コンポーネントの更新が必要です
```

```powershell
wsl --update
```

### 4. Microsoft Store が使えない環境

会社PC等でストアが制限されている場合:

```powershell
# 手動 DL 用の MSIX を Microsoft のサイトから取得してインストール
wsl --install --no-distribution
# ディストロは Store なしでも CLI で入る
wsl --install -d Ubuntu
```

---

## アンインストール・やり直し

### ディストロの削除（データも消える）

```powershell
wsl --unregister Ubuntu
```

### 再インストール

```powershell
wsl --install -d Ubuntu
```

### WSL 自体の無効化

「Windows の機能の有効化または無効化」で:

- Linux 用 Windows サブシステム
- 仮想マシン プラットフォーム

のチェックを外す。

---

## ディスク場所の確認と移動

### デフォルトの場所

```
%USERPROFILE%\AppData\Local\Packages\CanonicalGroupLimited.UbuntuXX.XX...\LocalState\ext4.vhdx
```

Cドライブを圧迫する場合、別ドライブへ移動できます:

```powershell
# エクスポート
wsl --export Ubuntu D:\wsl\ubuntu.tar

# 登録解除
wsl --unregister Ubuntu

# 新しい場所にインポート
wsl --import Ubuntu D:\wsl\ubuntu D:\wsl\ubuntu.tar

# デフォルトユーザーを再設定
# （ubuntu.exe config --default-user <username>）
```

---

## 起動方法いろいろ

```powershell
# デフォルトディストロを起動
wsl

# 特定ディストロを起動
wsl -d Ubuntu

# コマンドを直接実行（戻る）
wsl -d Ubuntu -e ls /home

# 管理者として起動
wsl -u root
```

Windows Terminal のプロファイルに登録しておくと、タブから一発で開けます（詳細は `Shell/01_Terminal/Windows_Terminal.md`）。

---

## まとめ

- `wsl --install` ワンコマンドでほぼ完了
- CPU 仮想化（VT-x / SVM）を BIOS で有効化するのを忘れずに
- 初期セットアップで **WSL 内のユーザー** を作成（Windows とは別）
- インストール後は **update → よく使うツール → ロケール・TZ** を整える
- `wsl --list --verbose` で状態確認、トラブル時は `wsl --update`
