---
title: 構成管理とAnsible
created: 2026-10-12
tags:
  - インフラ
  - IaC
---

# 構成管理とAnsible

[[MOC_サーバー・インフラ体系|📚 目次]] ｜ [[03_Terraform入門|← 前へ]] ｜ [[05_CloudFormationとCDK|次へ →]]

> [!abstract] この記事で分かること
> - Ansible がエージェントレス（SSH だけ）で動く仕組み
> - インベントリ・プレイブック・モジュール（apt / copy / template / service / user）の書き方
> - 冪等性と `changed` 表示の読み方、`--check --diff` での事前確認
> - ロール・変数・Jinja2 テンプレート・ansible-vault による整理と秘密情報の扱い
> - Shop サーバー（Nginx + Node.js + systemd）を構成するプレイブックの完全な例と、Terraform との分担
>
> **前提**：[[01_サーバー構築の流れ]]、[[03_Terraform入門]] を読んでいると理解しやすいです。

## 1. ひとことで言うと

Ansible は **「チェックリストを持って各部屋を回る、几帳面な管理人」** です。管理人はリスト（プレイブック）の各項目について「もうできていればそのまま、できていなければ直す」を繰り返します。各部屋に常駐スタッフ（エージェント）を置く必要はなく、合鍵（SSH）さえあれば回れます。

- **構成管理（Configuration Management）** ツール：OS の中身（パッケージ、設定ファイル、ユーザー、サービス）を「あるべき状態」にそろえる
- 対象サーバーに **SSH と Python があればよい**（エージェントレス）
- YAML で書き、何度実行しても同じ結果になる（**冪等**）

## 2. 仕組み：エージェントレスと SSH

```mermaid
sequenceDiagram
    participant C as コントロールノード<br>(手元 PC / CI)
    participant S1 as shop-web-01
    participant S2 as shop-web-02
    C->>C: インベントリとプレイブックを読む
    par 並列に実行
        C->>S1: SSH 接続、モジュール(Python)を転送
        S1->>S1: 実行：状態を確認し、必要なら変更
        S1-->>C: 結果 (ok / changed / failed) を JSON で返す
    and
        C->>S2: SSH 接続、モジュールを転送
        S2-->>C: 結果
    end
```

- Ansible を入れるのは **コントロールノード**（操作する側）だけ。管理対象には何も常駐しません
- Chef / Puppet はエージェントが定期的にサーバーから設定を取りに行く **pull 型**、Ansible は手元から押し込む **push 型** です

インストール（コントロールノード側）：

```bash
sudo apt install -y pipx
pipx install --include-deps ansible
ansible --version
```

Ubuntu の apt にも `ansible` パッケージがありますが、新しいバージョンを使うなら pipx（Python の CLI ツールを隔離して入れる仕組み）が便利です。

## 3. インベントリ・プレイブック・モジュール

### 3.1 インベントリ

**インベントリ（Inventory）** は「管理対象サーバーの一覧とグループ分け」です。

```yaml
# inventory/prod.yml
all:
  vars:
    ansible_user: deploy
    ansible_ssh_private_key_file: ~/.ssh/shop_deploy
  children:
    web:
      hosts:
        shop-web-01:
          ansible_host: 203.0.113.21   # Terraform の output の IP
        shop-web-02:
          ansible_host: 203.0.113.22
    db:
      hosts:
        shop-db-01:
          ansible_host: 10.0.2.10
```

接続確認：

```bash
ansible -i inventory/prod.yml web -m ansible.builtin.ping
# shop-web-01 | SUCCESS => {"ping": "pong"}
```

クラウドではサーバーが増減するので、AWS のタグからインベントリを自動生成する **動的インベントリ**（`amazon.aws.aws_ec2` プラグイン）もよく使われます。

### 3.2 プレイブックとモジュール

**プレイブック（Playbook）** は「どのホストに、どのタスクを、どの順で」を書いた YAML です。各タスクは **モジュール（Module）** を 1 つ呼び出します。

```yaml
# site.yml（最小例）
- name: Shop web サーバーの基本設定
  hosts: web
  become: true            # sudo で実行
  tasks:
    - name: Nginx をインストール
      ansible.builtin.apt:
        name: nginx
        state: present
        update_cache: true
        cache_valid_time: 3600

    - name: Nginx を起動し、自動起動を有効にする
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true
```

よく使うモジュール（`ansible.builtin` に含まれるもの）：

| モジュール | 役割 | 例 |
|---|---|---|
| `apt` | パッケージ管理 | `name: nginx, state: present` |
| `user` | ユーザー作成 | `name: shop, system: true, shell: /usr/sbin/nologin` |
| `file` | ディレクトリ・権限 | `path: /opt/shop, state: directory, owner: shop` |
| `copy` | ファイルをそのまま配置 | 静的な設定ファイル |
| `template` | Jinja2 で値を埋めて配置 | `nginx.conf.j2` → `/etc/nginx/sites-available/shop` |
| `service` / `systemd_service` | サービスの起動・有効化 | `state: restarted` |
| `command` / `shell` | 任意のコマンド | **最後の手段**。冪等にならないので注意 |

> [!tip] FQCN で書く
> `apt:` ではなく `ansible.builtin.apt:` のように **FQCN（完全修飾コレクション名）** で書くのが現在の推奨です。同名モジュールの取り違えを防げます。

## 4. 冪等性と changed 表示

プレイブックを 2 回実行すると、結果の表示が変わります。

```
# 1 回目
TASK [Nginx をインストール] ************
changed: [shop-web-01]
PLAY RECAP *****************************
shop-web-01 : ok=3  changed=2  unreachable=0  failed=0

# 2 回目（何も変わっていない）
TASK [Nginx をインストール] ************
ok: [shop-web-01]
PLAY RECAP *****************************
shop-web-01 : ok=3  changed=0  unreachable=0  failed=0
```

| 表示 | 意味 |
|---|---|
| `ok` | すでにあるべき状態だった。何もしていない |
| `changed` | 状態を変更した |
| `failed` | 失敗（そのホストの以降のタスクは止まる） |
| `skipped` | `when:` の条件で実行しなかった |

**2 回目に `changed=0` になること** が、プレイブックが冪等である証拠です。毎回 `changed` が出るタスクは、たいてい `command` / `shell` を素のまま使っています。どうしても使う場合は `creates:` や `changed_when:` で冪等にします。

```yaml
- name: 依存パッケージをインストール（package-lock.json が変わったときだけ）
  ansible.builtin.command: npm ci --omit=dev
  args:
    chdir: /opt/shop/app
  become_user: shop
  when: lockfile.changed      # 直前の copy/git タスクの結果を register しておく
```

本番に流す前は **ドライラン** で確認します。Terraform の `plan` に相当します。

```bash
ansible-playbook -i inventory/prod.yml site.yml --check --diff
```

`--check` は変更せずに「変更されるはず」を表示し、`--diff` は設定ファイルの差分を表示します（`command` などチェックモード非対応のタスクは正確に予測できない点に注意）。

## 5. 変数・テンプレート・ロール・vault

### 5.1 変数と Jinja2 テンプレート

環境ごとに違う値は **変数** にし、設定ファイルは **Jinja2 テンプレート** で生成します。変数はグループ単位のファイルに置けます。

```yaml
# inventory/group_vars/web.yml
shop_domain: shop.example.com
shop_api_port: 3000
node_major: 24
```

```nginx
# roles/nginx/templates/shop.conf.j2
server {
    listen 80;
    server_name {{ shop_domain }} api.{{ shop_domain }};

    location / {
        proxy_pass http://127.0.0.1:{{ shop_api_port }};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

`{{ 変数 }}` が値に置き換わります。`$host` などは Nginx の変数なのでそのまま残ります。

### 5.2 ロール

タスクが増えたら **ロール（Role）** に分けます。ロールは「Nginx 担当」「Node.js 担当」のような再利用単位で、決まったディレクトリ構成を持ちます。

```
ansible/
├── ansible.cfg
├── inventory/
│   ├── prod.yml
│   └── group_vars/
│       ├── web.yml
│       └── web_vault.yml    # 暗号化された秘密情報
├── site.yml
└── roles/
    ├── common/      tasks/main.yml
    ├── nginx/       tasks/main.yml  templates/shop.conf.j2  handlers/main.yml
    ├── nodejs/      tasks/main.yml
    └── shop_app/    tasks/main.yml  templates/shop.service.j2  templates/env.j2  handlers/main.yml
```

**ハンドラー（Handler）** は「設定ファイルが changed のときだけ Nginx を reload する」ための仕組みです。タスクに `notify:` を書いておくと、プレイの最後にまとめて 1 回だけ実行されます。

### 5.3 ansible-vault

DB のパスワードなどの秘密情報は **ansible-vault** で暗号化してから Git に入れます。

```bash
ansible-vault create inventory/group_vars/web_vault.yml   # 作成（エディタが開く）
ansible-vault edit   inventory/group_vars/web_vault.yml   # 編集
ansible-playbook -i inventory/prod.yml site.yml --ask-vault-pass
```

```yaml
# web_vault.yml の中身（保存時は暗号化される）
vault_database_url: "postgres://shop:S3cr3t@10.0.2.10:5432/shop"
```

`group_vars/web.yml` 側で `database_url: "{{ vault_database_url }}"` と参照すると、どの変数が秘密か一目で分かります。秘密情報を使うタスクには `no_log: true` を付けてログに出さないようにします。vault パスワード自体は CI のシークレットや `--vault-password-file` で渡します（秘密情報全般は [[05_設定と環境変数・シークレット]]）。

## 6. Shop サーバーを構成するプレイブック例

[[01_サーバー構築の流れ]] の手順 2〜8 をコード化したものです。`group_vars` に `shop_repo`、`shop_version`（Git のタグ）も定義しておきます。

```yaml
# site.yml
- name: Shop web サーバーを構成する
  hosts: web
  become: true
  roles:
    - common
    - nginx
    - nodejs
    - shop_app
```

```yaml
# roles/common/tasks/main.yml
- name: パッケージを最新化
  ansible.builtin.apt:
    update_cache: true
    upgrade: safe
    cache_valid_time: 3600

- name: タイムゾーンを設定
  community.general.timezone:
    name: Asia/Tokyo

- name: 基本パッケージ（acl は become_user で一般ユーザーになるために必要）
  ansible.builtin.apt:
    name: [unattended-upgrades, acl, git]
    state: present
```

```yaml
# roles/nginx/tasks/main.yml
- name: Nginx をインストール
  ansible.builtin.apt:
    name: nginx
    state: present

- name: Shop 用のサイト設定を配置
  ansible.builtin.template:
    src: shop.conf.j2
    dest: /etc/nginx/sites-available/shop
    mode: "0644"
  notify: Reload nginx

- name: サイトを有効化
  ansible.builtin.file:
    src: /etc/nginx/sites-available/shop
    dest: /etc/nginx/sites-enabled/shop
    state: link
  notify: Reload nginx

- name: default サイトを無効化
  ansible.builtin.file:
    path: /etc/nginx/sites-enabled/default
    state: absent
  notify: Reload nginx

- name: Nginx を起動・自動起動
  ansible.builtin.service:
    name: nginx
    state: started
    enabled: true
```

ハンドラーは **同じ名前を listen する 2 つ** にして、「文法チェックが通ったときだけ reload」にします。

```yaml
# roles/nginx/handlers/main.yml
- name: Check nginx config
  ansible.builtin.command: nginx -t
  changed_when: false
  listen: Reload nginx

- name: Reload nginx service
  ansible.builtin.service:
    name: nginx
    state: reloaded
  listen: Reload nginx
```

`nginx -t` が失敗すればそこで止まり、壊れた設定で reload されることはありません。

```yaml
# roles/nodejs/tasks/main.yml
- name: NodeSource リポジトリを追加
  ansible.builtin.deb822_repository:
    name: nodesource
    types: deb
    uris: "https://deb.nodesource.com/node_{{ node_major }}.x"
    suites: nodistro
    components: main
    signed_by: https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key

- name: Node.js をインストール
  ansible.builtin.apt:
    name: nodejs
    state: present
    update_cache: true
```

```yaml
# roles/shop_app/tasks/main.yml
- name: アプリ用ユーザー（ログイン不可）
  ansible.builtin.user:
    name: shop
    system: true
    home: /opt/shop
    shell: /usr/sbin/nologin

- name: ソースを取得（指定バージョン）
  ansible.builtin.git:
    repo: "{{ shop_repo }}"
    dest: /opt/shop/app
    version: "{{ shop_version }}"
  become_user: shop
  register: shop_src

- name: 依存関係のインストールとビルド
  ansible.builtin.shell: npm ci && npm run build && npm prune --omit=dev
  args:
    chdir: /opt/shop/app
  become_user: shop
  when: shop_src.changed
  notify: Restart shop

- name: 環境変数ファイル（秘密情報を含む）
  ansible.builtin.template:
    src: env.j2
    dest: /etc/shop.env
    owner: root
    group: shop
    mode: "0640"
  no_log: true
  notify: Restart shop

- name: systemd unit を配置
  ansible.builtin.template:
    src: shop.service.j2
    dest: /etc/systemd/system/shop.service
    mode: "0644"
  notify: Restart shop

- name: Shop API を起動・自動起動
  ansible.builtin.systemd_service:
    name: shop
    state: started
    enabled: true
    daemon_reload: true
```

```ini
# roles/shop_app/templates/shop.service.j2
[Unit]
Description=Shop API
After=network-online.target
Wants=network-online.target

[Service]
User=shop
WorkingDirectory=/opt/shop/app
EnvironmentFile=/etc/shop.env
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```

```yaml
# roles/shop_app/handlers/main.yml
- name: Restart shop
  ansible.builtin.systemd_service:
    name: shop
    state: restarted
    daemon_reload: true
```

実行：

```bash
ansible-playbook -i inventory/prod.yml site.yml --check --diff --ask-vault-pass  # 確認
ansible-playbook -i inventory/prod.yml site.yml --ask-vault-pass                 # 適用
ansible-playbook -i inventory/prod.yml site.yml --limit shop-web-01 ...          # 1 台だけ
```

`community.general.timezone` は community.general コレクションのモジュールです（pipx で入れた `ansible` パッケージには同梱。`ansible-core` だけの場合は `ansible-galaxy collection install community.general`）。HTTPS（certbot）もロールにできますが、最初の 1 回は DNS が向いてからの手動実行にして、更新は certbot のタイマーに任せる運用も現実的です。

## 7. Terraform との分担

```mermaid
flowchart LR
    TF[Terraform<br>VPC・SG・EC2・EIP・<br>RDS・Route 53] -->|output: IP / タグ| INV[インベントリ<br>静的 or 動的]
    INV --> AN[Ansible<br>OS 設定・Nginx・<br>Node.js・systemd]
    AN --> SRV[動いている<br>Shop サーバー]
```

| | Terraform | Ansible |
|---|---|---|
| 得意 | クラウドリソースの作成・削除 | サーバー内部の設定 |
| 状態 | state ファイルで管理 | 持たない（毎回実機を確認） |
| 削除 | コードから消せば実体も消える | 「消す」には `state: absent` を明示的に書く |
| 実行タイミング | インフラ変更時 | 構築時・設定変更時・定期的なドリフト修正 |

- Terraform の `user_data`（cloud-init）でも初期設定はできますが、**起動時 1 回だけ** です。継続的な設定変更は Ansible が向いています
- Ansible でも EC2 を作れますが（`amazon.aws` コレクション）、状態管理がないので削除や差分把握が苦手です
- **イミュータブル** にしたい場合は、Ansible を Packer から実行して AMI に焼き込み、Terraform はその AMI を使うだけにします（[[02_IaCとは]]）

## 発展：構成管理ツールの比較（ネットワーク自動化の観点）

ネットワーク機器の自動化の観点から、Ansible・Terraform・Puppet・Chef の方式と使い分けを比較します。

### 構成管理ツール：Ansible・Terraform・Puppet・Chef

#### 構成管理ツールとは

**構成管理ツール** は、機器やサーバの「あるべき設定」をコード（ファイル）として記述し、そのとおりに自動で設定・維持するツールです。代表は **Ansible・Terraform**、比較対象として **Puppet・Chef** です。

#### プッシュ型とプル型

```
 プッシュ型（Ansible）                     プル型（Puppet / Chef）
                                         
  管理サーバ ──SSHで接続して設定を送る──>   管理サーバ <──定期的に設定を取りに行く── エージェント
       │                    機器             (Puppet Master /          (各機器に
       ├──────────────────> 機器              Chef Server)              インストール)
       └──────────────────> 機器
  ・管理サーバが主体                        ・機器側のエージェントが主体
  ・エージェント不要                        ・エージェントが必要
```

| 方式 | 動作 | 代表例 |
| --- | --- | --- |
| **プッシュ型** | **管理サーバが主体** となって機器に接続し、設定を送り込む | **Ansible** |
| **プル型** | 機器に入れた **エージェント** が、定期的に管理サーバへ設定を **取りに行く** | **Puppet、Chef** |

ネットワーク機器には追加のソフト（エージェント）を入れられないことが多いため、**エージェント不要のプッシュ型（Ansible）はネットワークの自動化と相性がよい** のです。
（「ブロードキャスト型」「ピアツーピア型」は構成管理ツールの方式を表す用語ではありません。）

#### ツール比較

| 項目 | **Ansible** | **Terraform** | Puppet | Chef |
| --- | --- | --- | --- | --- |
| 方式 | **プッシュ型** | プッシュ型（API 経由） | プル型 | プル型 |
| エージェント | **不要**（SSH / API で接続） | 不要（プロバイダが API を呼ぶ） | 必要 | 必要 |
| 記述言語 | **YAML**（プレイブック） | **HCL** | Puppet 独自 DSL（マニフェスト） | **Ruby**（レシピ／クックブック） |
| 記述スタイル | 主に **手順的**（タスクを順に実行） | **宣言的**（あるべき状態を書く） | 宣言的 | 手順的 |
| 状態の記録 | なし | **ステートファイル** | ― | ― |
| よく使う用途 | **機器の設定変更** | **リソースの構築**（クラウド、ネットワーク） | サーバ構成管理 | サーバ構成管理 |

> 補足：Ansible のモジュール自体は冪等に作られており「あるべき状態」を書く側面もありますが、プレイブックはタスクを上から順に実行する手順的な記述です。学習上は「Ansible＝YAML のプレイブックで処理の手順を記述」「Terraform＝HCL で宣言的」と区別します。

#### Ansible の構成要素

| 要素 | 内容 |
| --- | --- |
| **インベントリ** | 管理対象の機器の **ホスト名・IPアドレス・グループ**（routers、switches 等）を書く一覧。「**どの機器に**」 |
| **プレイブック** | 実行する処理の内容と手順を **YAML** で書くファイル。「**何をするか**」 |
| モジュール | 個々の処理の部品（例：`cisco.ios.ios_vlans`、`ios_config`） |
| 変数・テンプレート | 機器ごとに違う値（ホスト名、IP など）の扱い。テンプレートは Jinja2 |

インベントリの例（INI 形式）：

```ini
[routers]
R1 ansible_host=10.1.1.1
R2 ansible_host=10.1.1.2

[switches]
SW1 ansible_host=10.1.1.11
SW2 ansible_host=10.1.1.12

[all:vars]
ansible_network_os=cisco.ios.ios
ansible_connection=ansible.netcommon.network_cli
```

プレイブックの例（YAML）：

```yaml
---
- name: VLANを作成
  hosts: switches            # インベントリのグループ名 → SW1, SW2 の全台に実行
  gather_facts: false
  tasks:
    - name: VLAN 10 Sales を作る
      cisco.ios.ios_vlans:
        config:
          - vlan_id: 10
            name: Sales
        state: merged
```

実行：

```
$ ansible-playbook -i inventory.ini vlan.yml
```

プレイブックで **グループ名を指定すると、そのグループのすべての機器に同じ処理を実行** できます。

Ansible の特徴まとめ：
- **エージェント不要**、**SSH** で接続（API 接続も可）
- **YAML** のプレイブック
- **プッシュ型**
- 監視ツールではなく、主に **設定の自動化** ツール（SNMP 監視専用ツールではない）

#### Terraform

- インフラの「**あるべき状態**」を **HCL（HashiCorp Configuration Language）** で **宣言的** に記述し、その状態になるようにリソースを作成・変更する。
- **宣言的** ＝「どういう手順で作るか」ではなく「**最終的にどうなっていてほしいか**」を書く。
- 現在の状態を **ステートファイル**（terraform.tfstate）に記録し、書かれた状態との **差分だけを適用** する。
- クラウドやネットワークのリソースをコードで構築・管理する **IaC（Infrastructure as Code）** の代表的ツール。

HCL の例：

```hcl
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "web" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}
```

##### Terraform の基本ワークフロー

```
 terraform init  ──>  terraform plan  ──>  terraform apply   (… terraform destroy)
   準備                変更内容の確認          適用                 全削除
 (プロバイダ取得)     (差分の一覧を表示)
```

| コマンド | 役割 |
| --- | --- |
| `terraform init` | 作業ディレクトリを初期化し、必要な **プロバイダ（プラグイン）** を準備 |
| **`terraform plan`** | 現在の状態と設定ファイルの差分から、**何が作成・変更・削除されるかを表示**（実際には変更しない） |
| `terraform apply` | 変更を **実際に適用** |
| `terraform destroy` | 管理しているリソースを **すべて削除** |

`plan` で **意図しない削除などがないかを確認してから `apply`** することで、作業ミスによる事故を防げます。

```
$ terraform plan
  + resource "aws_subnet" "web" { cidr_block = "10.0.1.0/24" ... }
  - resource "aws_subnet" "old" { ... }      ← 意図しない削除がないか確認！
Plan: 1 to add, 0 to change, 1 to destroy.
```

#### Ansible と Terraform の使い分け

| | Ansible | Terraform |
| --- | --- | --- |
| 得意 | 既存機器の **設定変更** | リソース（VM、VPC、ネットワーク）の **構築** |
| ファイル | インベントリ ＋ プレイブック（YAML） | 設定ファイル（HCL）＋ ステートファイル |
| スタイル | 手順を記述 | あるべき状態を宣言 |

#### ひっかけポイント・よくある誤解

- 「機器ごとにエージェントが必要」は **Puppet / Chef** の特徴。Ansible は **エージェント不要**。
- 「Ruby で記述」は **Chef**。Ansible は YAML。
- Ansible は監視ツールではない。
- 「HCL で宣言的」＝ **Terraform**。Ansible は YAML のプレイブックで手順を記述。Syslog / NTP はプロトコル。
- Ansible ＝ **プッシュ型**。プル型は Puppet / Chef。ブロードキャスト型・ピアツーピア型という方式名はない。
- 機器の一覧＝**インベントリ**、処理内容＝**プレイブック**、Terraform の状態記録＝**ステートファイル**、running-config は Cisco 機器の動作中の設定。
- 変更前の確認＝ **`terraform plan`**。apply は適用、init は準備、destroy は全削除。

#### 押さえておくポイント

- **Ansible：エージェントレス・SSH・YAML プレイブック・プッシュ型・インベントリ**。
- **Puppet / Chef：エージェント型・プル型。Chef は Ruby**。
- **Terraform：HCL・宣言的・ステートファイル・init → plan → apply**。

## よくある誤解・つまずき

- ❌ `shell` / `command` で手順書のコマンドを並べれば Ansible 化できる
  ✅ それは「SSH で流すシェルスクリプト」で、冪等になりません。可能な限り専用モジュール（apt、user、template など）を使い、`shell` には `when` / `creates` / `changed_when` を付けます。
- ❌ プレイブックから行を消せば、サーバーからも消える
  ✅ Ansible は state を持たないので、書かれていないものには何もしません。削除したいときは `state: absent` のタスクを書きます。
- ❌ 設定ファイルを変えたら、毎回 `state: restarted` のタスクで再起動する
  ✅ 毎回再起動すると冪等でなくなり、無駄な瞬断も起きます。ハンドラーで「変更があったときだけ」reload / restart します。
- ❌ vault で暗号化すれば、パスワードはどこにも漏れない
  ✅ 実行時のログ（`-v`）やエラー表示に出ることがあります。`no_log: true` を付け、配置先ファイルの権限（`0640` など）も絞ります。

## まとめ

- Ansible はエージェントレスで、SSH 経由でモジュールを送り込んで実行する push 型の構成管理ツール
- インベントリ（対象）＋プレイブック（何を）＋モジュール（どうやって）で構成する
- 2 回目の実行で `changed=0` が冪等の証拠。本番前は `--check --diff`
- ロール・group_vars・Jinja2 テンプレート・ハンドラーで整理し、秘密情報は ansible-vault で暗号化
- 「箱」は Terraform、「中身」は Ansible。イミュータブルにするなら Packer で焼き込む

## 確認クイズ

1. 同じプレイブックを 2 回続けて実行したら、2 回目も `changed=3` と表示されました。何が疑われますか。
> [!tip]- 答え
> 冪等でないタスクがあることが疑われます。`command` / `shell` を条件なしで使っている、毎回 `state: restarted` にしている、テンプレートに実行時刻など毎回変わる値を埋め込んでいる、などが典型例です。

2. Nginx の設定テンプレートを変更したときだけ Nginx を reload したい。どう書きますか。
> [!tip]- 答え
> `template` タスクに `notify: Reload nginx` を付け、`handlers/main.yml` に `state: reloaded` のハンドラーを定義します。テンプレートの内容が変わって `changed` になったときだけ、プレイの最後に 1 回 reload されます。

3. Terraform と Ansible の両方で EC2 を作れるのに、作成を Terraform に任せることが多いのはなぜですか。
> [!tip]- 答え
> Terraform は state で「作ったもの」を把握しているため、差分の確認（plan）や、コードから消したリソースの削除ができます。Ansible は state を持たないので、リソースのライフサイクル全体を管理するのが苦手だからです。

## 関連ノート

- [[03_Terraform入門]] — EC2 などの「箱」を作る側
- [[02_IaCとは]] — 構成管理とプロビジョニングの役割分担
- [[04_プロセス管理とsystemd]] — unit ファイルの詳細
- [[03_リバースプロキシ]] — Nginx の proxy 設定の意味
- [[05_設定と環境変数・シークレット]] — 秘密情報の扱い
- [[04_OSのハードニングとパッチ管理]] — common ロールに入れたいハードニング項目

## 参考

- [Ansible Documentation](https://docs.ansible.com/)
- [Installing Ansible (pipx)](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
- [ansible.builtin.apt module](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/apt_module.html)
- [ansible.builtin.template module](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/template_module.html)
- [ansible.builtin.deb822_repository module](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/deb822_repository_module.html)
- [Handlers: running operations on change](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_handlers.html)
- [Protecting sensitive data with Ansible vault](https://docs.ansible.com/ansible/latest/vault_guide/index.html)
- [NodeSource distributions](https://github.com/nodesource/distributions)
