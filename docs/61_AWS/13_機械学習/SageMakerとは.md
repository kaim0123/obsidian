# Amazon SageMaker とは

## 概要

Amazon SageMaker は、機械学習モデルの構築、訓練、デプロイを効率化するマネージドサービスです。データサイエンティストや開発者が機械学習ワークフロー全体を統合的に管理できます。

## 主な機能

### 1. データ準備
- データの前処理と変換
- 特徴量エンジニアリング
- データの可視化
- データのラベリング

### 2. モデル構築
- ビルトインアルゴリズム
- カスタムアルゴリズム
- 自動機械学習（AutoML）
- ハイパーパラメータチューニング

### 3. モデルデプロイ
- リアルタイム推論
- バッチ推論
- エンドポイントの自動スケーリング
- A/Bテスト

## 料金体系

### 基本料金（2024年1月時点）
- **ノートブックインスタンス**: $0.05/時間〜
- **トレーニング**: $0.10/時間〜
- **推論**: $0.05/時間〜
- **データ処理**: $0.10/時間〜

### 無料利用枠
- 月間250時間のノートブックインスタンス
- 月間50時間のトレーニング
- 月間125時間の推論

## 基本的な使い方

### 1. ノートブックインスタンスの作成
```python
import boto3
import sagemaker

# SageMakerセッションの作成
sagemaker_session = sagemaker.Session()
bucket = sagemaker_session.default_bucket()

# ノートブックインスタンスの作成
notebook_instance_name = 'my-notebook-instance'
role = 'arn:aws:iam::123456789012:role/SageMakerRole'

sagemaker_client = boto3.client('sagemaker')
sagemaker_client.create_notebook_instance(
    NotebookInstanceName=notebook_instance_name,
    InstanceType='ml.t3.medium',
    RoleArn=role
)
```

### 2. データの準備と前処理
```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# データの読み込み
data = pd.read_csv('data.csv')

# 特徴量とターゲットの分離
X = data.drop('target', axis=1)
y = data['target']

# データの分割
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 特徴量のスケーリング
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# データの保存
np.save('X_train.npy', X_train_scaled)
np.save('X_test.npy', X_test_scaled)
np.save('y_train.npy', y_train)
np.save('y_test.npy', y_test)
```

### 3. モデルの訓練
```python
from sagemaker.sklearn import SKLearn
from sagemaker import get_execution_role

# ロールの取得
role = get_execution_role()

# SKLearnエスティメーターの作成
sklearn_estimator = SKLearn(
    entry_point='train.py',
    framework_version='0.23-1',
    instance_type='ml.m5.large',
    role=role,
    sagemaker_session=sagemaker_session
)

# モデルの訓練
sklearn_estimator.fit({'training': 's3://my-bucket/training-data'})

# モデルのデプロイ
predictor = sklearn_estimator.deploy(instance_type='ml.m5.large', initial_instance_count=1)
```

### 4. 推論の実行
```python
# 予測の実行
predictions = predictor.predict(X_test_scaled)

# 結果の評価
from sklearn.metrics import accuracy_score, classification_report
accuracy = accuracy_score(y_test, predictions)
print(f"Accuracy: {accuracy}")
print(classification_report(y_test, predictions))
```

## 実践例

### 画像分類モデルの構築
```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import sagemaker
from sagemaker.tensorflow import TensorFlow

# データの準備
def load_and_preprocess_data():
    # 画像データの読み込み
    train_ds = tf.keras.preprocessing.image_dataset_from_directory(
        'data/train',
        image_size=(224, 224),
        batch_size=32
    )
    
    val_ds = tf.keras.preprocessing.image_dataset_from_directory(
        'data/validation',
        image_size=(224, 224),
        batch_size=32
    )
    
    return train_ds, val_ds

# モデルの定義
def create_model():
    model = keras.Sequential([
        layers.Rescaling(1./255),
        layers.Conv2D(32, 3, activation='relu'),
        layers.MaxPooling2D(),
        layers.Conv2D(64, 3, activation='relu'),
        layers.MaxPooling2D(),
        layers.Conv2D(128, 3, activation='relu'),
        layers.MaxPooling2D(),
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(10, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

# 訓練スクリプト
def train():
    train_ds, val_ds = load_and_preprocess_data()
    model = create_model()
    
    # モデルの訓練
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=10,
        verbose=1
    )
    
    # モデルの保存
    model.save('model.h5')

# SageMakerでの訓練
tensorflow_estimator = TensorFlow(
    entry_point='train.py',
    framework_version='2.8',
    py_version='py39',
    instance_type='ml.m5.large',
    role=role,
    sagemaker_session=sagemaker_session
)

tensorflow_estimator.fit({'training': 's3://my-bucket/training-data'})
```

### 自然言語処理モデルの構築
```python
import transformers
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import sagemaker
from sagemaker.pytorch import PyTorch

# トークナイザーとモデルの読み込み
tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
model = AutoModelForSequenceClassification.from_pretrained(
    'bert-base-uncased',
    num_labels=2
)

# データの前処理
def preprocess_data(texts, labels):
    encoded = tokenizer(
        texts,
        padding=True,
        truncation=True,
        max_length=512,
        return_tensors='pt'
    )
    
    return encoded, torch.tensor(labels)

# 訓練スクリプト
def train():
    # データの読み込み
    texts = ["This is a positive review", "This is a negative review"]
    labels = [1, 0]
    
    # データの前処理
    encoded, labels_tensor = preprocess_data(texts, labels)
    
    # モデルの訓練
    optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)
    criterion = torch.nn.CrossEntropyLoss()
    
    for epoch in range(3):
        optimizer.zero_grad()
        outputs = model(**encoded, labels=labels_tensor)
        loss = outputs.loss
        loss.backward()
        optimizer.step()
        
        print(f"Epoch {epoch+1}, Loss: {loss.item()}")
    
    # モデルの保存
    model.save_pretrained('model')
    tokenizer.save_pretrained('model')

# SageMakerでの訓練
pytorch_estimator = PyTorch(
    entry_point='train.py',
    framework_version='1.12',
    py_version='py38',
    instance_type='ml.m5.large',
    role=role,
    sagemaker_session=sagemaker_session
)

pytorch_estimator.fit({'training': 's3://my-bucket/training-data'})
```

## ベストプラクティス

### 1. データ管理
- データのバージョン管理
- データの品質チェック
- 特徴量エンジニアリング
- データの可視化

### 2. モデル開発
- 適切なアルゴリズムの選択
- ハイパーパラメータの最適化
- モデルの評価と検証
- 過学習の防止

### 3. デプロイメント
- エンドポイントの監視
- モデルのA/Bテスト
- 自動スケーリングの設定
- ロールバック計画の準備

## 注意点

### 1. 制限事項
- インスタンスタイプの制限
- ストレージサイズの制限
- 同時実行数の制限
- リージョンによる制限

### 2. コスト管理
- インスタンスの適切なサイズ選択
- 使用時間の監視
- 不要なリソースの削除
- スポットインスタンスの活用

## まとめ

Amazon SageMaker は、機械学習ワークフロー全体を統合的に管理する強力なサービスです。データの準備からモデルのデプロイまで、一貫した環境で効率的に機械学習プロジェクトを進めることができます。適切な設計と運用により、高品質な機械学習モデルを効率的に構築・運用できます。
