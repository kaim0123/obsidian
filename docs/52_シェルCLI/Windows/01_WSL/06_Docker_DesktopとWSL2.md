# Docker Desktop と WSL2 — WSL2 バックエンドの仕組み

## はじめに

Docker Desktop for Windows は、裏で **WSL2 を使って Linux コンテナを動かしています**。2021年以降、従来の Hyper-V バックエンドに代わって **WSL2 バックエンドが標準** になりました。

両者の関係を理解しておくと:

- なぜ `wsl --list` で `docker-desktop` が出てくるのか
- なぜ WSL の Ubuntu からも `docker` コマンドが使えるのか
- ディスク容量・メモリ不足のトラブル対応

などが見通せるようになります。

---

## Docker Desktop の仕組み（WSL2 バックエンド）

```
┌────────────────────────────────────────┐
│ Windows                                │
│                                        │
│  ┌──────────────┐   ┌──────────────┐ │
│  │Docker Desktop │   │   Ubuntu     │ │
│  │    GUI        │   │   (WSL2)     │ │
│  └──────┬────────┘   └──────┬───────┘ │
│         │                    │        │
│         │  統合 (docker CLI) │        │
│         ↓                    ↓        │
│  ┌──────────────────────────────────┐ │
│  │  docker-desktop (WSL2)           │ │
│  │  ├─ dockerd (Docker エンジン)    │ │
│  │  └─ containerd                   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  docker-desktop-data (WSL2)      │ │
│  │  └─ イメージ・ボリュームのストア │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

- **docker-desktop**: Docker エンジン本体が動く WSL2 ディストロ（特殊、ユーザーは直接入らない）
- **docker-desktop-data**: イメージやボリュームの保存用ディストロ
- **Ubuntu など**: ユーザーのディストロに **docker CLI が統合** される

`wsl --list` すると、これら3つが並びます:

```
  NAME                   STATE           VERSION
* Ubuntu                 Running         2
  docker-desktop         Running         2
  docker-desktop-data    Running         2
```

---

## WSL2 統合のメリット

### 1. 起動が速い

Hyper-V バックエンドに比べて起動が速く、リソース消費も少ない。

### 2. リソース動的確保

Hyper-V のように事前に固定メモリを取るのではなく、**必要な分だけ** Windows から借りる。

### 3. WSL の Ubuntu 等から `docker` が使える

Docker Desktop の設定で「Enable integration with my default WSL distro」を ON にすると、Ubuntu 内で:

```bash
docker run hello-world
```

がそのまま動きます。Docker エンジンは docker-desktop 側で動いているが、CLI が連携されて透過的に使える。

### 4. Volume マウントが自然

WSL 内の `/home/kai/project` をそのまま `docker run -v` でマウントできる。性能も Windows 側と比べて桁違いに速い。

---

## セットアップ手順

### 1. Docker Desktop のインストール

公式サイト（docker.com）から Docker Desktop for Windows をダウンロード → インストール → 再起動。

### 2. 設定画面で WSL2 統合を有効化

Docker Desktop → Settings → Resources → WSL Integration:

- **Enable integration with my default WSL distro**: ON
- **Enable integration with additional distros**: 使いたい Ubuntu 等を ON

### 3. 動作確認

WSL の Ubuntu 内で:

```bash
docker --version
docker run hello-world
```

これだけで Linux コンテナが動く。

---

## よく使う操作

### Linux コンテナの起動

```bash
# WSL 側で
docker run -it --rm ubuntu:22.04 bash

# ボリュームマウント
docker run -v $PWD:/app -w /app node:20 npm install

# Compose
docker compose up
```

### Windows 側（PowerShell）からも同じように使える

```powershell
docker run -it --rm ubuntu:22.04 bash
```

---

## ディスク容量の管理

Docker イメージやボリュームは **`docker-desktop-data` ディストロの仮想ディスク** に保存されます。放置すると数十GB に膨れあがることがある。

### 場所

```
%USERPROFILE%\AppData\Local\Docker\wsl\disk\docker_data.vhdx
```

### 不要なものを削除

```bash
# 止まっているコンテナ削除
docker container prune

# 使われていないイメージ削除
docker image prune -a

# ボリューム削除
docker volume prune

# 全部まとめて
docker system prune -a --volumes
```

### VHDX を縮小する

`docker system prune` の後でも、**Windows 側の VHDX ファイルは縮みません**（確保したサイズのまま）。縮小するには:

```powershell
# Docker Desktop を停止してから
wsl --shutdown

# 最適化（管理者 PowerShell）
Optimize-VHD -Path "$env:USERPROFILE\AppData\Local\Docker\wsl\disk\docker_data.vhdx" -Mode Full
```

※ `Optimize-VHD` は Hyper-V 機能が必要。

---

## メモリとCPUの制限

Windows 側の `%USERPROFILE%\.wslconfig`:

```ini
[wsl2]
memory=8GB
processors=4
swap=4GB
```

Docker コンテナは WSL2 VM 内で動くため、ここの上限に制約されます。

---

## Docker エンジンのみを使いたい場合

Docker Desktop は商用利用に課金が必要（大企業向け）。個人・小規模は無料ですが、代替も可能です。

### 代替手段

- **Docker Engine を直接 WSL に入れる**: `docker-desktop` ディストロを使わず、Ubuntu 内に Docker Engine をインストール
- **Rancher Desktop**: 無料、UIも近い
- **Podman Desktop**: OSS、互換CLI

### Ubuntu 内に Docker Engine を入れる（概要）

```bash
# 公式 docs の通り apt リポジトリを追加して
sudo apt install docker-ce docker-ce-cli containerd.io

# systemd 有効ならサービスとして起動
sudo systemctl enable --now docker

# 自分を docker グループへ
sudo usermod -aG docker $USER
```

systemd を使うため `/etc/wsl.conf` で `[boot] systemd=true` を設定すること。

---

## トラブルシューティング

### 1. 「Docker daemon が見つからない」

```bash
docker ps
# Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

→ Docker Desktop が起動していない、または WSL Integration が OFF。Settings → Resources → WSL Integration で有効化。

### 2. 「C ドライブがいっぱい」

docker-desktop-data の VHDX が肥大化している可能性。上記の `docker system prune` + `Optimize-VHD`。

### 3. WSL メモリを大量消費

コンテナが重い処理をしていると `vmmem` / `vmmemWSL` が数GB〜十数GB に。`.wslconfig` で上限設定。

### 4. `wsl --shutdown` でコンテナが消える

実行中コンテナも止まります。再起動で開発フローが崩れないよう、状態を永続化したいなら Volume に保存。

### 5. パーミッション問題

ボリュームマウント時、**ホスト（WSL）側のファイル所有者とコンテナ内の UID が違う** とエラーに。

```bash
# コンテナ内で UID を合わせる
docker run --user "$(id -u):$(id -g)" -v $PWD:/app ...
```

---

## WSL 側の Ubuntu で直接 Docker Engine を動かす vs Docker Desktop

| 項目 | Docker Desktop | Ubuntu 直接 |
|------|---------------|------------|
| GUI | あり | なし |
| Kubernetes 同梱 | あり | 別途必要 |
| ライセンス | 大企業は有料 | 無料 |
| セットアップ | ワンクリック | 手動 |
| リソース | やや重い | 軽い |
| WSL 統合 | 自動 | 自分で |

個人開発・学習なら Docker Desktop が圧倒的に楽。ライセンス・軽量さ重視なら Ubuntu 直接。

---

## まとめ

- Docker Desktop は **WSL2 をバックエンド** として Linux コンテナを動かす
- 裏で `docker-desktop` + `docker-desktop-data` の2つの WSL2 ディストロが動く
- 通常使う Ubuntu からも、**WSL Integration** で透過的に `docker` コマンドが使える
- ディスク・メモリ肥大化は `docker system prune` + `.wslconfig` で管理
- 企業利用ではライセンス要件に注意、代替として Rancher Desktop や素の Docker Engine もあり
