# WSL 概要 — WSL1 と WSL2 の違い、何を解決してくれるのか

## はじめに

**WSL**（Windows Subsystem for Linux / ダブリューエスエル）とは、

> **Windows の中で Linux をそのまま動かせる仕組み**

です。Microsoft が公式に提供しており、Windows 上でネイティブに Linux のコマンドやツール（bash、git、python、docker 等）を使えるようになります。

### なぜ重要か

世界の Web / バックエンドサーバーの大半は Linux で動いています。そのため、**開発ツールや手順書も Linux 前提** のものが多いです。

- Node.js、Python、Rust 等の公式ドキュメントは Linux/macOS ベース
- CI/CD や本番環境も Linux
- Docker の多くのイメージは Linux ベース

以前は「Mac に乗り換える」くらいしか選択肢がなかったのが、WSL で **Windows のままでも同じ環境を再現できる** ようになりました。

---

## WSL1 と WSL2 の違い

WSL には2つの世代があり、仕組みが根本的に違います。

### WSL1（2017年登場）

- Linux のシステムコールを Windows 上で **翻訳** して動かす
- 本物の Linux カーネルは動いていない
- Windows と Linux が同じプロセス空間で動く

### WSL2（2019年登場 / 現在の主流）

- **本物の Linux カーネル** を軽量な VM（仮想マシン）上で動かす
- Microsoft が Linux 公式カーネルをカスタマイズして同梱
- Hyper-V 仮想化技術を使用

### 比較表

| 項目 | WSL1 | WSL2 |
|------|------|------|
| アーキテクチャ | 翻訳レイヤー | 軽量VM + 本物のLinuxカーネル |
| Linuxカーネル | なし（翻訳） | あり（実際に動作） |
| 起動速度 | 非常に速い | 速い（数秒） |
| Windows側ファイル性能 | 速い | **遅い** |
| Linux側ファイル性能 | 遅い | **速い** |
| ネットワーク | Windows と共有 | 独立した NIC（Mirrored modeで改善可） |
| Docker 対応 | 不可 | **可能** |
| systemd | 不可 | 可能（要設定） |
| メモリ使用 | 軽い | やや重い（VM分） |

### どっちを使うべきか

現代では **基本的に WSL2**。WSL1 のメリット（Windows 側のファイルが速い）より、Docker やカーネル互換性のメリットが大きいため。

---

## WSL が解決してくれる課題

### 1. 「Linux 前提のツール」がそのまま動く

以前の Windows では、Linux 前提のツールを動かすには:

- Cygwin / MSYS2（翻訳レイヤー、互換性に難あり）
- Git Bash（限定的な bash 環境）
- VirtualBox / VMware（重い）

これらに比べて、**WSL は本物の Linux がすぐに動く**。`apt install` で普通にパッケージが入る。

### 2. 本番環境（Linux サーバー）と同じ操作感

シェルスクリプト、cron、systemd 等、本番と同じ感覚でローカルで試せる。

### 3. Windows と Linux の両方を1台で使える

- Windows ならではのアプリ（Office、Adobe 等）も使える
- Linux のコマンドラインも使える
- エクスプローラーから WSL 内のファイルも見られる

### 4. Docker Desktop の実装基盤

Docker Desktop for Windows は、裏で WSL2 を使って Linux コンテナを動かしています。

---

## WSL でできること・できないこと

### ✅ できる

- Linux コマンドライン全般（bash、zsh、fish）
- パッケージ管理（apt、yum、pacman 等）
- Docker / Podman
- 開発ツール（Node.js、Python、Rust、Go、Ruby 等）
- Git、SSH、rsync
- 開発用 DB（PostgreSQL、MySQL、Redis）
- GUI アプリ（WSLg 対応、Windows 11 / Windows 10 最新版）
- Jupyter Notebook、VSCode Remote-WSL
- systemd（Windows 11 / Windows 10 22H2 以降）

### ❌ できない / 苦手

- Windows 専用ソフトの代替（Office、Adobe 等）
- Linux 専用のカーネルモジュール（一部）
- リアルタイムシステムや低レイヤー開発
- GPU を使う深層学習（CUDA は対応しているが制約あり）
- 古い Windows（Windows 10 バージョン 1903 未満は非対応）

---

## どんな Linux ディストリビューションが使える？

Microsoft Store から選んでインストール:

- **Ubuntu**（最も一般的、情報も豊富）
- **Debian**
- **openSUSE**
- **Fedora**（有償または手動導入）
- **Alpine**
- **Kali Linux**（セキュリティ学習用）
- **Oracle Linux**
- **Arch**（コミュニティ版）

初心者には **Ubuntu（LTS版）** が推奨。

---

## WSL の基本概念

### ディストリビューション（ディストロ）

インストールされた Linux 環境。複数同時に持てる。

```powershell
# インストール済み一覧
wsl --list --verbose

# 起動中のディストロ
wsl --list --running
```

### カーネル

WSL2 のカーネルは、**Windows Update 経由で全ディストロ共通** に更新される。

### vhdx ファイル

WSL2 のディストロは、Windows 側から見ると **仮想ハードディスクファイル**（`ext4.vhdx`）として保存されています。

典型的な場所:
```
%USERPROFILE%\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu...\LocalState\
```

---

## よくある勘違い

### 1. 「WSL = Linux VM」

ほぼ合っているが、**Windows と深く統合されている** 点が VirtualBox 等の仮想マシンと違います。
- `\\wsl$\...` でファイル共有
- `explorer.exe .` で Linux のフォルダを Windows エクスプローラーで開ける
- `code .` で VSCode を Windows 側で起動

### 2. 「WSL1 と WSL2 は設定で切り替えるだけ」

変換は可能ですが、コマンドが必要。

```powershell
wsl --set-version Ubuntu 2
```

### 3. 「WSL のファイルも Windows 側から自由に触れる」

触れますが、**性能低下** と **メタデータの問題** があります。基本は **それぞれのOS側から自分のファイルを触る** のが鉄則（詳細は `WSLとWindows間のファイル共有.md`）。

---

## 次に読むもの

- `WSLインストール.md` — インストール手順
- `WSLとWindows間のファイル共有.md` — `/mnt/c/` と `\\wsl$` の使い分け
- `WSLでのファイル性能.md` — パフォーマンスの落とし穴
- `VSCodeとWSL連携.md` — Remote-WSL で快適に開発
- `Docker_DesktopとWSL2.md` — Docker との関係

---

## まとめ

- WSL は **Windows の中で Linux を動かす** 公式の仕組み
- 現代は **WSL2**（本物の Linux カーネル + 軽量 VM）が標準
- Linux 前提のツール・手順書をそのまま使えるのが最大の価値
- WSL1 と WSL2 は性能特性が真逆（Windowsファイル vs Linuxファイル）
- Docker Desktop の基盤にもなっており、コンテナ開発の必須基盤
