# AWS IoT Core とは

## 概要

AWS IoT Core は、IoTデバイスをクラウドに接続するためのマネージドサービスです。数十億台のIoTデバイスを安全に接続し、デバイスからのデータを収集・処理・分析できます。

## 主な機能

### 1. デバイス接続
- MQTT、HTTP、WebSocketプロトコルサポート
- デバイス認証と認可
- デバイスシャドウ機能
- デバイスレジストリ

### 2. メッセージ処理
- メッセージルーティング
- ルールエンジン
- データ変換
- リアルタイム処理

### 3. セキュリティ
- X.509証明書による認証
- IAMポリシーによる認可
- 暗号化された通信
- デバイス証明書の管理

## 料金体系

### 基本料金（2024年1月時点）
- **メッセージ**: 100万メッセージあたり$0.80
- **デバイスシャドウ**: 100万操作あたり$0.25
- **ルールエンジン**: 100万評価あたり$0.15

### 無料利用枠
- 月間2,250,000メッセージまで無料
- 月間250,000デバイスシャドウ操作まで無料
- 月間1,250,000ルールエンジン評価まで無料

## 基本的な使い方

### 1. デバイスの登録
```bash
# デバイス証明書の作成
aws iot create-keys-and-certificate \
  --set-as-active \
  --certificate-pem-outfile device-cert.pem \
  --public-key-outfile device-public-key.pem \
  --private-key-outfile device-private-key.pem

# デバイスの登録
aws iot create-thing --thing-name MyDevice
```

### 2. デバイスからの接続
```python
import boto3
import json
import time
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

# IoT Core設定
iot_client = AWSIoTMQTTClient("MyDevice")
iot_client.configureEndpoint("your-endpoint.iot.ap-northeast-1.amazonaws.com", 8883)
iot_client.configureCredentials("device-cert.pem", "device-private-key.pem", "root-ca.pem")

# 接続
iot_client.connect()

# メッセージの送信
message = {
    "temperature": 25.5,
    "humidity": 60,
    "timestamp": int(time.time())
}

iot_client.publish("sensors/temperature", json.dumps(message), 1)

# 切断
iot_client.disconnect()
```

### 3. ルールの作成
```sql
-- 温度が30度を超えた場合にSNSに通知
SELECT temperature, humidity, timestamp
FROM 'sensors/temperature'
WHERE temperature > 30
```

## 実践例

### 温度センサーの監視システム
```python
import boto3
import json
import time
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

class TemperatureMonitor:
    def __init__(self, endpoint, cert_path, key_path, ca_path):
        self.client = AWSIoTMQTTClient("TemperatureMonitor")
        self.client.configureEndpoint(endpoint, 8883)
        self.client.configureCredentials(cert_path, key_path, ca_path)
        self.client.configureAutoReconnectBackoffTime(1, 32, 20)
        self.client.configureOfflinePublishQueueing(-1)
        self.client.configureDrainingFrequency(2)
        self.client.configureConnectDisconnectTimeout(10)
        self.client.configureMQTTOperationTimeout(5)

    def connect(self):
        self.client.connect()
        print("Connected to AWS IoT Core")

    def publish_temperature(self, temperature, humidity):
        message = {
            "device_id": "temp_sensor_001",
            "temperature": temperature,
            "humidity": humidity,
            "timestamp": int(time.time()),
            "location": "office_room_1"
        }
        
        topic = f"sensors/temperature/{message['device_id']}"
        self.client.publish(topic, json.dumps(message), 1)
        print(f"Published: {message}")

    def subscribe_to_commands(self):
        def on_message(client, userdata, message):
            command = json.loads(message.payload.decode('utf-8'))
            print(f"Received command: {command}")
            self.handle_command(command)

        self.client.subscribe("commands/temperature_sensor", 1, on_message)

    def handle_command(self, command):
        if command.get("action") == "calibrate":
            print("Calibrating temperature sensor...")
            # キャリブレーション処理
        elif command.get("action") == "report_status":
            status = {
                "device_id": "temp_sensor_001",
                "status": "online",
                "battery_level": 85,
                "last_update": int(time.time())
            }
            self.client.publish("status/temperature_sensor", json.dumps(status), 1)

    def disconnect(self):
        self.client.disconnect()
        print("Disconnected from AWS IoT Core")

# 使用例
monitor = TemperatureMonitor(
    endpoint="your-endpoint.iot.ap-northeast-1.amazonaws.com",
    cert_path="device-cert.pem",
    key_path="device-private-key.pem",
    ca_path="root-ca.pem"
)

monitor.connect()
monitor.subscribe_to_commands()

# 温度データの送信
for i in range(10):
    temperature = 20 + (i * 2)
    humidity = 50 + (i * 3)
    monitor.publish_temperature(temperature, humidity)
    time.sleep(5)

monitor.disconnect()
```

### デバイスシャドウの活用
```python
import boto3
import json

# IoT Coreクライアント
iot_client = boto3.client('iot-data', region_name='ap-northeast-1')

def update_device_shadow(thing_name, desired_state):
    """デバイスシャドウの更新"""
    shadow_document = {
        "state": {
            "desired": desired_state
        }
    }
    
    response = iot_client.update_thing_shadow(
        thingName=thing_name,
        payload=json.dumps(shadow_document)
    )
    
    return response

def get_device_shadow(thing_name):
    """デバイスシャドウの取得"""
    response = iot_client.get_thing_shadow(thingName=thing_name)
    shadow = json.loads(response['payload'].read())
    return shadow

# デバイスシャドウの更新例
desired_state = {
    "temperature_threshold": 30,
    "reporting_interval": 60,
    "power_mode": "normal"
}

update_device_shadow("MyDevice", desired_state)

# デバイスシャドウの取得
shadow = get_device_shadow("MyDevice")
print(f"Current shadow: {shadow}")
```

## ベストプラクティス

### 1. セキュリティ
- デバイス証明書の適切な管理
- IAMポリシーの最小権限原則
- 定期的な証明書の更新
- デバイス認証の実装

### 2. パフォーマンス
- 適切なQoSレベルの選択
- メッセージサイズの最適化
- バッチ処理の活用
- 接続プールの使用

### 3. 監視とログ
- CloudWatchメトリクスの活用
- デバイス状態の監視
- エラーログの分析
- アラートの設定

## 注意点

### 1. 制限事項
- メッセージサイズ: 最大128KB
- トピック名: 最大256文字
- 同時接続数: アカウント制限あり
- ルール数: 最大1000ルール

### 2. パフォーマンス
- ネットワーク遅延の考慮
- デバイスの処理能力
- メッセージ処理速度
- スケーラビリティの計画

## まとめ

AWS IoT Core は、IoTデバイスをクラウドに接続するための包括的なサービスです。セキュリティ、スケーラビリティ、信頼性の面で優れており、大規模なIoTアプリケーションの構築に適しています。適切な設計と運用により、効率的で安全なIoTシステムを実現できます。
