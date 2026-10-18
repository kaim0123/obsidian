# 10-Kubernetes

## 概要
Kubernetes（K8s）は、コンテナ化されたアプリケーションのデプロイ・スケーリング・管理を自動化するオープンソースのコンテナオーケストレーションプラットフォームです。この章では、Kubernetesの基本、インストール、主要コンポーネント、リソースオブジェクト、デプロイ、スケーリング、ネットワーク、監視、セキュリティ、実践例について学習します。

## 目次
- [[09-Docker|← 09-Docker]]
- [[MOC_サーバー・インフラ体系|← サーバー・インフラ目次]]
- [[01_サーバー構築の流れ|サーバー構築の流れ（64章）→]]

## Kubernetesとは

### 特徴
- **自動化**: デプロイ、スケーリング、ロールアウト/ロールバック
- **自己修復**: 障害時の自動再起動・再スケジューリング
- **サービスディスカバリ**: 内部DNS、ロードバランサー
- **宣言的構成**: YAMLによるリソース管理
- **拡張性**: マイクロサービス、CI/CDに最適

### アーキテクチャ
```
[ユーザー]
   ↓
[Master Node]
   ├─ API Server
   ├─ Scheduler
   ├─ Controller Manager
   └─ etcd（クラスタ情報）

[Worker Node]
   ├─ Kubelet
   ├─ Kube Proxy
   └─ Container Runtime（Docker, containerd など）

[Pod]（最小デプロイ単位）
```

## インストール

### Minikube（ローカル開発用）
```bash
# Minikubeインストール
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# kubectlインストール
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Minikube起動
minikube start

# クラスタ情報確認
kubectl cluster-info
kubectl get nodes
```

### クラウドKubernetes（GKE/EKS/AKS）
- Google Kubernetes Engine（GKE）
- Amazon Elastic Kubernetes Service（EKS）
- Azure Kubernetes Service（AKS）

## 基本オブジェクト

### Pod
- コンテナの最小デプロイ単位
- 1つ以上のコンテナを含む

### Deployment
- Podの管理・ローリングアップデート
- レプリカ数の管理

### Service
- Podへのアクセスを提供（ClusterIP, NodePort, LoadBalancer）

### ConfigMap & Secret
- 設定値やシークレット情報の管理

### Volume
- 永続ストレージのマウント

### Namespace
- 論理的なリソース分離

## マニフェスト例（YAML）

### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: myrepo/my-app:latest
        ports:
        - containerPort: 3000
```

### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  type: NodePort
  selector:
    app: my-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
      nodePort: 30080
```

### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  NODE_ENV: production
  API_URL: https://api.example.com
```

### Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  DB_PASSWORD: cGFzc3dvcmQ=  # base64エンコード
```

### PersistentVolume & PersistentVolumeClaim
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-data
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /mnt/data
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

## デプロイ・スケーリング

### デプロイ
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

### スケーリング
```bash
kubectl scale deployment my-app --replicas=5
```

### ロールアウト/ロールバック
```bash
kubectl rollout status deployment/my-app
kubectl rollout undo deployment/my-app
```

### Podの確認・ログ
```bash
kubectl get pods
kubectl describe pod <pod名>
kubectl logs <pod名>
```

## ネットワーク
- **Service**: Pod間通信、外部公開
- **Ingress**: HTTP/HTTPSのルーティング・SSL終端
- **NetworkPolicy**: 通信制御

### Ingress例
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
spec:
  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-app-service
                port:
                  number: 80
```

## 監視・ロギング
- **Prometheus**: メトリクス監視
- **Grafana**: ダッシュボード
- **ELK Stack**: ログ収集・分析
- **Kubernetes Dashboard**: Web UI

## セキュリティ
- RBAC（Role-Based Access Control）
- NetworkPolicyによる通信制御
- Secret管理
- Pod Security Policy
- イメージスキャン（Trivy, Clair など）

## 実践例

### マイクロサービス構成
- 複数のDeployment/Service/Ingressでマイクロサービスを構築
- CI/CDパイプラインと連携（ArgoCD, GitOps）

### Blue-Green/Canaryデプロイ
- 新旧バージョンの共存・段階的リリース

## 演習問題

### 初級
1. **Minikubeでクラスタを構築してください**
2. **DeploymentとServiceを作成してアプリを公開してください**
3. **Podのスケーリングを行ってください**

### 中級
1. **ConfigMapとSecretを使って設定・シークレットを管理してください**
2. **PersistentVolumeで永続ストレージを利用してください**
3. **Ingressで独自ドメインをルーティングしてください**

### 上級
1. **NetworkPolicyで通信制御を実装してください**
2. **PrometheusとGrafanaで監視ダッシュボードを構築してください**
3. **Blue-GreenデプロイやCanaryリリースを実践してください**

## まとめ

Kubernetesの基本を学びました：
- **Kubernetesのアーキテクチャと主要コンポーネント**
- **リソースオブジェクト（Pod, Deployment, Service, etc）**
- **デプロイ・スケーリング・ロールアウト**
- **ネットワーク・Ingress・永続化**
- **監視・セキュリティ・実践例**

次の章では、サーバー構築について学習します。

---

**次の章**: [[01_サーバー構築の流れ|サーバー構築の流れ（64章）→]] 