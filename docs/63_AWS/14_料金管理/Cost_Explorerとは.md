# AWS Cost Explorer とは

## 概要

AWS Cost Explorer は、AWSのコストと使用量を可視化・分析するサービスです。過去のコストデータを分析し、将来のコストを予測することで、効率的なコスト管理を実現できます。

## 主な機能

### 1. コスト分析
- 過去12ヶ月のコストデータ分析
- サービス別・リージョン別・アカウント別の分析
- カスタム期間での分析
- コストの傾向分析

### 2. 予測機能
- 将来3ヶ月のコスト予測
- 使用量の増加傾向の分析
- コスト削減の機会の特定
- 予算の計画立案

### 3. レポート機能
- カスタムレポートの作成
- 定期的なレポートの配信
- コストアラートの設定
- データのエクスポート

## 料金体系

### 基本料金
- **Cost Explorer**: 無料
- **詳細な分析**: 無料
- **予測機能**: 無料

### 注意点
- 過去12ヶ月のデータのみ利用可能
- データの更新は24時間以内

## 基本的な使い方

### 1. Cost Explorerのアクセス
```bash
# AWS CLI
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

### 2. 基本的な分析
```python
import boto3
import pandas as pd
import matplotlib.pyplot as plt

# Cost Explorerクライアント
ce_client = boto3.client('ce')

def get_cost_data(start_date, end_date):
    """コストデータの取得"""
    response = ce_client.get_cost_and_usage(
        TimePeriod={
            'Start': start_date,
            'End': end_date
        },
        Granularity='MONTHLY',
        Metrics=['BlendedCost'],
        GroupBy=[
            {
                'Type': 'DIMENSION',
                'Key': 'SERVICE'
            }
        ]
    )
    
    return response

# データの取得
cost_data = get_cost_data('2024-01-01', '2024-01-31')

# データの処理
services = []
costs = []

for result in cost_data['ResultsByTime']:
    for group in result['Groups']:
        service = group['Keys'][0]
        cost = float(group['Metrics']['BlendedCost']['Amount'])
        services.append(service)
        costs.append(cost)

# データフレームの作成
df = pd.DataFrame({
    'Service': services,
    'Cost': costs
})

# コストの可視化
plt.figure(figsize=(12, 8))
plt.bar(df['Service'], df['Cost'])
plt.title('AWS Service Costs')
plt.xlabel('Service')
plt.ylabel('Cost (USD)')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()
```

### 3. コスト予測
```python
def get_cost_forecast():
    """コスト予測の取得"""
    response = ce_client.get_cost_forecast(
        TimePeriod={
            'Start': '2024-02-01',
            'End': '2024-04-30'
        },
        Metric='BLENDED_COST',
        Granularity='MONTHLY',
        PredictionIntervalLevel=80
    )
    
    return response

# 予測データの取得
forecast_data = get_cost_forecast()

# 予測結果の表示
for forecast in forecast_data['ForecastResultsByTime']:
    date = forecast['TimePeriod']['Start']
    predicted_cost = forecast['MeanValue']
    print(f"Date: {date}, Predicted Cost: ${predicted_cost}")
```

## 実践例

### 月次コストレポートの作成
```python
import boto3
import pandas as pd
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import seaborn as sns

class CostAnalyzer:
    def __init__(self):
        self.ce_client = boto3.client('ce')
    
    def get_monthly_costs(self, months=12):
        """過去Nヶ月のコストデータを取得"""
        end_date = datetime.now().replace(day=1)
        start_date = end_date - timedelta(days=months * 30)
        
        response = self.ce_client.get_cost_and_usage(
            TimePeriod={
                'Start': start_date.strftime('%Y-%m-%d'),
                'End': end_date.strftime('%Y-%m-%d')
            },
            Granularity='MONTHLY',
            Metrics=['BlendedCost'],
            GroupBy=[
                {
                    'Type': 'DIMENSION',
                    'Key': 'SERVICE'
                }
            ]
        )
        
        return response
    
    def analyze_top_services(self, data):
        """上位サービスの分析"""
        service_costs = {}
        
        for result in data['ResultsByTime']:
            for group in result['Groups']:
                service = group['Keys'][0]
                cost = float(group['Metrics']['BlendedCost']['Amount'])
                
                if service in service_costs:
                    service_costs[service] += cost
                else:
                    service_costs[service] = cost
        
        # 上位10サービス
        top_services = sorted(service_costs.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return top_services
    
    def create_cost_trend_chart(self, data):
        """コストトレンドチャートの作成"""
        dates = []
        costs = []
        
        for result in data['ResultsByTime']:
            date = result['TimePeriod']['Start']
            cost = float(result['Total']['BlendedCost']['Amount'])
            dates.append(date)
            costs.append(cost)
        
        plt.figure(figsize=(12, 6))
        plt.plot(dates, costs, marker='o')
        plt.title('Monthly AWS Costs Trend')
        plt.xlabel('Month')
        plt.ylabel('Cost (USD)')
        plt.xticks(rotation=45)
        plt.grid(True)
        plt.tight_layout()
        plt.show()
    
    def generate_report(self):
        """月次レポートの生成"""
        print("=== AWS Cost Analysis Report ===")
        print(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # コストデータの取得
        cost_data = self.get_monthly_costs()
        
        # 上位サービスの分析
        top_services = self.analyze_top_services(cost_data)
        
        print("Top 10 Services by Cost:")
        print("-" * 40)
        for i, (service, cost) in enumerate(top_services, 1):
            print(f"{i:2d}. {service:<30} ${cost:>10.2f}")
        
        print()
        
        # 総コスト
        total_cost = sum(cost for _, cost in top_services)
        print(f"Total Cost: ${total_cost:.2f}")
        
        # トレンドチャートの作成
        self.create_cost_trend_chart(cost_data)

# 使用例
analyzer = CostAnalyzer()
analyzer.generate_report()
```

### コスト最適化の提案
```python
class CostOptimizer:
    def __init__(self):
        self.ce_client = boto3.client('ce')
    
    def identify_cost_savings(self):
        """コスト削減機会の特定"""
        savings_opportunities = []
        
        # 1. 未使用のリソースの特定
        unused_resources = self.find_unused_resources()
        if unused_resources:
            savings_opportunities.append({
                'type': 'Unused Resources',
                'description': 'Stop or terminate unused EC2 instances, EBS volumes, etc.',
                'potential_savings': self.estimate_unused_savings(unused_resources)
            })
        
        # 2. リザーブドインスタンスの最適化
        ri_optimization = self.analyze_reserved_instances()
        if ri_optimization:
            savings_opportunities.append({
                'type': 'Reserved Instances',
                'description': 'Purchase Reserved Instances for predictable workloads',
                'potential_savings': ri_optimization
            })
        
        # 3. ストレージの最適化
        storage_optimization = self.analyze_storage_costs()
        if storage_optimization:
            savings_opportunities.append({
                'type': 'Storage Optimization',
                'description': 'Move infrequently accessed data to cheaper storage classes',
                'potential_savings': storage_optimization
            })
        
        return savings_opportunities
    
    def find_unused_resources(self):
        """未使用リソースの特定"""
        # EC2インスタンスの使用状況をチェック
        ec2_client = boto3.client('ec2')
        
        instances = ec2_client.describe_instances()
        unused_instances = []
        
        for reservation in instances['Reservations']:
            for instance in reservation['Instances']:
                if instance['State']['Name'] == 'stopped':
                    unused_instances.append({
                        'id': instance['InstanceId'],
                        'type': instance['InstanceType'],
                        'state': instance['State']['Name']
                    })
        
        return unused_instances
    
    def estimate_unused_savings(self, unused_resources):
        """未使用リソースの削減効果を推定"""
        # 簡易的な計算（実際の実装ではより詳細な計算が必要）
        estimated_savings = len(unused_resources) * 50  # 月額50ドルと仮定
        return estimated_savings
    
    def analyze_reserved_instances(self):
        """リザーブドインスタンスの分析"""
        # 過去の使用量データからリザーブドインスタンスの購入を推奨
        # 簡易的な実装
        return 200  # 月額200ドルの削減と仮定
    
    def analyze_storage_costs(self):
        """ストレージコストの分析"""
        # S3の使用状況を分析し、適切なストレージクラスへの移行を推奨
        # 簡易的な実装
        return 100  # 月額100ドルの削減と仮定

# 使用例
optimizer = CostOptimizer()
opportunities = optimizer.identify_cost_savings()

print("=== Cost Optimization Opportunities ===")
for i, opportunity in enumerate(opportunities, 1):
    print(f"{i}. {opportunity['type']}")
    print(f"   Description: {opportunity['description']}")
    print(f"   Potential Savings: ${opportunity['potential_savings']}/month")
    print()
```

## ベストプラクティス

### 1. 定期的な監視
- 月次コストレポートの作成
- 異常なコスト増加の監視
- 予算アラートの設定
- コストトレンドの分析

### 2. コスト最適化
- 未使用リソースの特定と削除
- リザーブドインスタンスの活用
- 適切なインスタンスタイプの選択
- ストレージクラスの最適化

### 3. 予算管理
- 現実的な予算の設定
- 部門別・プロジェクト別の予算管理
- コスト配分の透明性
- 定期的な予算見直し

## 注意点

### 1. データの制限
- 過去12ヶ月のデータのみ利用可能
- データの更新に24時間かかる場合がある
- 一部のサービスで詳細データが制限される

### 2. 予測の精度
- 予測は過去のデータに基づく
- 急激な変化は予測できない
- 定期的な予測の見直しが必要

## まとめ

AWS Cost Explorer は、AWSのコスト管理を効率化する重要なサービスです。過去のデータ分析と将来の予測により、適切なコスト管理と最適化を実現できます。定期的な監視と分析により、コストを削減し、予算を適切に管理できます。
