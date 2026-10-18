# yq - コマンドラインYAML/XML/TOMLプロセッサ

## 概要

**yq**は、YAML、XML、TOML、JSONなどの構造化データをコマンドラインで操作するためのツールです。jqのYAML版とも言える存在で、Kubernetes manifest、Docker Compose、CI/CD設定ファイルなど、YAMLを扱うあらゆる場面で活躍します。

### なぜyqが必要か

- **YAML**はインフラ・DevOps領域で最も広く使われる設定ファイル形式
- Kubernetes、Docker Compose、GitHub Actions、Ansible など、YAML設定ファイルの編集が日常的に発生
- 手動編集ではインデントエラーが起きやすく、自動化したい場面が多い

---

## yqのバージョンについて

yqには主に**2つの異なる実装**があります。現在主流なのは **mikefarah版** です:

| 項目 | mikefarah/yq | kislyuk/yq |
|------|-------------|------------|
| 言語 | Go | Python |
| jq依存 | 不要（独自構文） | 必要（jqのラッパー） |
| 構文 | jqに似た独自構文 | jqそのもの |
| 対応形式 | YAML, JSON, XML, TOML, CSV | YAML, XML |
| インストール | シングルバイナリ | pip install |

> 本ガイドでは **mikefarah/yq**（Go版）を扱います。

---

## インストール

```bash
# macOS（Homebrew）
brew install yq

# Ubuntu / Debian（snap）
snap install yq

# Ubuntu / Debian（バイナリ直接）
wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
chmod +x /usr/local/bin/yq

# Windows（Scoop）
scoop install yq

# Windows（Chocolatey）
choco install yq

# Go（go install）
go install github.com/mikefarah/yq/v4@latest
```

バージョン確認:

```bash
yq --version
```

---

## 基本的な使い方

### YAMLの読み取り

サンプルファイル（`config.yaml`）:

```yaml
server:
  host: localhost
  port: 8080
  ssl: false

database:
  host: db.example.com
  port: 5432
  name: myapp
  credentials:
    username: admin
    password: secret123

features:
  - logging
  - metrics
  - tracing
```

```bash
# ファイル全体を表示（整形）
yq '.' config.yaml

# 特定のキーを取得
yq '.server.host' config.yaml
# → localhost

yq '.server.port' config.yaml
# → 8080

# ネストしたキー
yq '.database.credentials.username' config.yaml
# → admin

# 配列の要素
yq '.features[0]' config.yaml
# → logging

yq '.features[]' config.yaml
# → logging
# → metrics
# → tracing

# 配列の長さ
yq '.features | length' config.yaml
# → 3
```

### パイプラインでの使用

```bash
# 標準入力から読み取り
cat config.yaml | yq '.server'

# コマンド出力をyqで処理
kubectl get pod -o yaml | yq '.metadata.name'
```

---

## YAMLの更新

### 値の変更

```bash
# ポート番号を変更（ファイルを直接更新）
yq -i '.server.port = 3000' config.yaml

# 文字列の変更
yq -i '.database.host = "production-db.example.com"' config.yaml

# 真偽値の変更
yq -i '.server.ssl = true' config.yaml

# 結果を標準出力に表示（ファイルは変更しない）
yq '.server.port = 3000' config.yaml
```

### キーの追加

```bash
# 新しいキーを追加
yq -i '.server.timeout = "30s"' config.yaml

# ネストしたキーを追加（中間パスも自動作成）
yq -i '.monitoring.enabled = true' config.yaml

# オブジェクトを追加
yq -i '.server.cors = {"enabled": true, "origins": ["*"]}' config.yaml
```

### 配列の操作

```bash
# 配列に要素を追加
yq -i '.features += ["caching"]' config.yaml

# 配列の先頭に追加
yq -i '.features = ["auth"] + .features' config.yaml

# 配列から要素を削除（インデックス指定）
yq -i 'del(.features[1])' config.yaml

# 条件に合う要素を削除
yq -i 'del(.features[] | select(. == "metrics"))' config.yaml
```

### キーの削除

```bash
# 単一キーの削除
yq -i 'del(.database.credentials.password)' config.yaml

# 複数キーの削除
yq -i 'del(.server.ssl, .server.timeout)' config.yaml
```

---

## 高度な操作

### select（条件付き抽出）

```bash
# サンプル: pods.yaml
# pods:
#   - name: web
#     replicas: 3
#     image: nginx:latest
#   - name: api
#     replicas: 2
#     image: node:18
#   - name: worker
#     replicas: 1
#     image: python:3.11

# replicas が 2 以上のpodを抽出
yq '.pods[] | select(.replicas >= 2)' pods.yaml

# 名前が "api" のpodを抽出
yq '.pods[] | select(.name == "api")' pods.yaml

# 特定のイメージを使用しているpodの名前
yq '.pods[] | select(.image == "nginx:*") | .name' pods.yaml
```

### 環境変数の利用

```bash
# 環境変数を値として使用
export DB_HOST="production.db.example.com"
yq -i '.database.host = env(DB_HOST)' config.yaml

# strenvで文字列として取得
yq -i '.database.host = strenv(DB_HOST)' config.yaml
```

### 複数ドキュメントの操作

YAMLは`---`で区切って複数のドキュメントを1つのファイルに含めることができます:

```bash
# すべてのドキュメントを処理
yq eval-all '.' multi-doc.yaml

# 特定のドキュメントを選択（0始まり）
yq 'select(document_index == 0)' multi-doc.yaml

# すべてのドキュメントから特定のキーを抽出
yq eval-all '.metadata.name' k8s-resources.yaml
```

### コメントの操作

yqはYAMLのコメントも操作できます:

```bash
# コメントを保持したまま値を更新
yq -i '.server.port = 3000' config.yaml

# コメントを追加
yq -i '.server.port line_comment = "HTTP port"' config.yaml

# ヘッドコメントを追加
yq -i '.server.port head_comment = "Server configuration"' config.yaml
```

---

## 複数ファイルのマージ

```bash
# 2つのYAMLファイルをマージ（後のファイルが優先）
yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1)' base.yaml override.yaml

# マージしてファイルに保存
yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1)' base.yaml override.yaml > merged.yaml
```

### マージの例

`base.yaml`:
```yaml
server:
  host: localhost
  port: 8080
database:
  host: localhost
```

`production.yaml`:
```yaml
server:
  host: 0.0.0.0
  ssl: true
database:
  host: prod-db.example.com
```

```bash
yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1)' base.yaml production.yaml
# 出力:
# server:
#   host: 0.0.0.0
#   port: 8080
#   ssl: true
# database:
#   host: prod-db.example.com
```

---

## フォーマット変換

### YAML → JSON

```bash
# YAML を JSON に変換
yq -o=json '.' config.yaml

# コンパクトなJSON
yq -o=json -I=0 '.' config.yaml
```

### JSON → YAML

```bash
# JSON を YAML に変換
yq -P '.' data.json

# または
yq -p=json '.' data.json
```

### YAML → XML

```bash
yq -o=xml '.' config.yaml
```

### XML → YAML

```bash
yq -p=xml '.' data.xml
```

### YAML → TOML

```bash
yq -o=toml '.' config.yaml
```

### YAML → CSV

```bash
yq -o=csv '.pods' pods.yaml
```

---

## 実践的な使用例

### Kubernetes manifest の操作

```bash
# イメージのタグを更新
yq -i '.spec.template.spec.containers[0].image = "myapp:v2.0"' deployment.yaml

# レプリカ数の変更
yq -i '.spec.replicas = 5' deployment.yaml

# 環境変数を追加
yq -i '.spec.template.spec.containers[0].env += [{"name": "DEBUG", "value": "true"}]' deployment.yaml

# リソース制限の設定
yq -i '.spec.template.spec.containers[0].resources.limits.memory = "512Mi"' deployment.yaml

# すべてのDeploymentの名前を一覧表示
yq eval-all 'select(.kind == "Deployment") | .metadata.name' k8s/*.yaml

# namespace を一括変更
fd -e yaml --search-path k8s/ | xargs -I{} yq -i '.metadata.namespace = "production"' {}
```

### Docker Compose の編集

```bash
# サービスのイメージを更新
yq -i '.services.web.image = "nginx:1.25"' docker-compose.yaml

# ポートマッピングの追加
yq -i '.services.web.ports += ["8443:443"]' docker-compose.yaml

# 環境変数の追加
yq -i '.services.api.environment.NODE_ENV = "production"' docker-compose.yaml

# ボリュームの追加
yq -i '.services.db.volumes += ["./data:/var/lib/postgresql/data"]' docker-compose.yaml

# サービス名の一覧
yq '.services | keys' docker-compose.yaml
```

### GitHub Actions の編集

```bash
# Node.jsのバージョンを変更
yq -i '.jobs.build.steps[] |= select(.uses == "actions/setup-node@*").with.node-version = "20"' .github/workflows/ci.yaml

# 新しいステップを追加
yq -i '.jobs.build.steps += [{"name": "Run linter", "run": "npm run lint"}]' .github/workflows/ci.yaml
```

### CI/CD設定の変更

```bash
# GitLab CI のステージを追加
yq -i '.stages += ["deploy"]' .gitlab-ci.yml

# 変数の更新
yq -i '.variables.NODE_VERSION = "20"' .gitlab-ci.yml
```

---

## jqとの比較

| 特徴 | jq | yq |
|------|----|----|
| 対象形式 | JSON | YAML, JSON, XML, TOML |
| 構文 | jq独自 | jqに似た独自構文 |
| コメント保持 | N/A（JSONにコメントなし） | 可能 |
| 複数ドキュメント | 非対応 | 対応（`---`区切り） |
| インプレース編集 | 不可（リダイレクト必要） | `-i` で可能 |
| 環境変数 | `--arg` で渡す | `env()` で直接参照 |

```bash
# jq でJSONを操作
jq '.name' data.json

# yq でYAMLを操作（jqに似た構文）
yq '.name' data.yaml

# yq でJSONも操作可能
yq -p=json '.name' data.json
```

---

## Tips

### よく使うオプション

| オプション | 説明 |
|-----------|------|
| `-i` | ファイルをインプレース（直接）編集 |
| `-o=json` | JSON形式で出力 |
| `-o=xml` | XML形式で出力 |
| `-P` | Pretty print（YAML形式で整形） |
| `-I=N` | インデント幅をN文字に設定 |
| `-p=json` | 入力をJSON形式として解釈 |
| `-C` | カラー出力を有効化 |
| `-M` | カラー出力を無効化 |
| `-N` | null値を出力しない |

### シェルスクリプトでの活用

```bash
#!/bin/bash
# config.yaml から設定値を読み取ってシェル変数に代入
DB_HOST=$(yq '.database.host' config.yaml)
DB_PORT=$(yq '.database.port' config.yaml)
DB_NAME=$(yq '.database.name' config.yaml)

echo "Connecting to $DB_HOST:$DB_PORT/$DB_NAME"
```

### バリデーション

```bash
# YAMLの構文チェック
yq '.' config.yaml > /dev/null 2>&1 && echo "Valid YAML" || echo "Invalid YAML"
```

---

## まとめ

- **yq**はYAMLファイルをコマンドラインで操作するための必須ツール
- jqに似た構文で、YAML・JSON・XML・TOMLを統一的に扱える
- Kubernetes、Docker Compose、CI/CD設定の自動化に特に有効
- `-i`オプションでファイルを直接編集でき、スクリプトとの相性が良い
- mikefarah版（Go版）を使用するのが現在の主流
