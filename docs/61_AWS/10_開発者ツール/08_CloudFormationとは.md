# AWS CloudFormation とは

## 概要

AWS CloudFormation は、Infrastructure as Code（IaC）を実現するサービスです。YAMLまたはJSONテンプレートを使用してAWSリソースを定義し、一貫性のあるインフラストラクチャを自動的に構築・管理できます。

## 主な機能

### 1. テンプレートベースの管理
- YAML/JSONテンプレート
- 再利用可能なテンプレート
- パラメータとマッピングのサポート
- 条件分岐とループの実装

### 2. スタック管理
- リソースの依存関係管理
- 自動的なリソース作成・更新・削除
- ロールバック機能
- 変更セットの確認

### 3. 統合機能
- 200以上のAWSリソースサポート
- カスタムリソースのサポート
- サードパーティリソースとの連携
- 他のAWSサービスとの統合

## 料金体系

### 基本料金
- **CloudFormation自体**: 無料
- **管理するリソース**: 各サービスの料金が適用

### 料金例
```
管理するリソース:
- EC2インスタンス: EC2の料金
- RDSインスタンス: RDSの料金
- S3バケット: S3の料金
```

## 基本的な使い方

### 1. テンプレートの作成
```yaml
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Simple EC2 instance with security group'

Parameters:
  InstanceType:
    Type: String
    Default: t3.micro
    AllowedValues:
      - t3.micro
      - t3.small
      - t3.medium
    Description: 'EC2 instance type'

Resources:
  SecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: 'Security group for EC2 instance'
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 22
          ToPort: 22
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0

  EC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: ami-0c02fb55956c7d316
      InstanceType: !Ref InstanceType
      SecurityGroupIds:
        - !Ref SecurityGroup
      Tags:
        - Key: Name
          Value: MyEC2Instance

Outputs:
  InstanceId:
    Description: 'Instance ID of the EC2 instance'
    Value: !Ref EC2Instance
    Export:
      Name: !Sub '${AWS::StackName}-InstanceId'
```

### 2. スタックの作成
```bash
# スタックの作成
aws cloudformation create-stack \
  --stack-name my-stack \
  --template-body file://template.yaml \
  --parameters ParameterKey=InstanceType,ParameterValue=t3.small

# スタックの状態確認
aws cloudformation describe-stacks --stack-name my-stack
```

### 3. スタックの更新
```bash
# 変更セットの作成
aws cloudformation create-change-set \
  --stack-name my-stack \
  --change-set-name my-change-set \
  --template-body file://updated-template.yaml

# 変更セットの実行
aws cloudformation execute-change-set \
  --change-set-name my-change-set
```

## 実践例

### VPCとサブネットの作成
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'VPC with public and private subnets'

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: MyVPC

  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: PublicSubnet1

  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      Tags:
        - Key: Name
          Value: PrivateSubnet1

  InternetGateway:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: MyInternetGateway

  InternetGatewayAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      InternetGatewayId: !Ref InternetGateway
      VpcId: !Ref VPC

  PublicRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: PublicRouteTable

  DefaultPublicRoute:
    Type: AWS::EC2::Route
    DependsOn: InternetGatewayAttachment
    Properties:
      RouteTableId: !Ref PublicRouteTable
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref InternetGateway

  PublicSubnet1RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref PublicRouteTable
      SubnetId: !Ref PublicSubnet1

Outputs:
  VPCId:
    Description: 'VPC ID'
    Value: !Ref VPC
    Export:
      Name: !Sub '${AWS::StackName}-VPCId'

  PublicSubnet1Id:
    Description: 'Public Subnet 1 ID'
    Value: !Ref PublicSubnet1
    Export:
      Name: !Sub '${AWS::StackName}-PublicSubnet1Id'
```

### RDSデータベースの作成
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'RDS MySQL database'

Parameters:
  DBInstanceClass:
    Type: String
    Default: db.t3.micro
    AllowedValues:
      - db.t3.micro
      - db.t3.small
      - db.t3.medium
    Description: 'RDS instance class'

  DBName:
    Type: String
    Default: mydatabase
    Description: 'Database name'

  DBUsername:
    Type: String
    Default: admin
    Description: 'Database username'

  DBPassword:
    Type: String
    NoEcho: true
    Description: 'Database password'

Resources:
  DBSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupDescription: 'Subnet group for RDS'
      SubnetIds:
        - !ImportValue 'MyVPC-PrivateSubnet1Id'
        - !ImportValue 'MyVPC-PrivateSubnet2Id'
      Tags:
        - Key: Name
          Value: MyDBSubnetGroup

  DBSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: 'Security group for RDS'
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 3306
          ToPort: 3306
          SourceSecurityGroupId: !Ref WebServerSecurityGroup
      Tags:
        - Key: Name
          Value: DBSecurityGroup

  RDSInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: my-rds-instance
      DBInstanceClass: !Ref DBInstanceClass
      Engine: mysql
      EngineVersion: '8.0'
      MasterUsername: !Ref DBUsername
      MasterUserPassword: !Ref DBPassword
      AllocatedStorage: 20
      StorageType: gp2
      DBName: !Ref DBName
      VPCSecurityGroups:
        - !Ref DBSecurityGroup
      DBSubnetGroupName: !Ref DBSubnetGroup
      BackupRetentionPeriod: 7
      MultiAZ: false
      PubliclyAccessible: false
      Tags:
        - Key: Name
          Value: MyRDSInstance

Outputs:
  RDSInstanceEndpoint:
    Description: 'RDS instance endpoint'
    Value: !GetAtt RDSInstance.Endpoint.Address
    Export:
      Name: !Sub '${AWS::StackName}-RDSInstanceEndpoint'
```

## ベストプラクティス

### 1. テンプレート設計
- モジュラー設計の採用
- パラメータの適切な使用
- 出力の活用
- 命名規則の統一

### 2. スタック管理
- 適切なスタック分割
- 依存関係の管理
- 変更セットの活用
- ロールバック計画の準備

### 3. セキュリティ
- IAMロールの適切な設定
- パスワードの安全な管理
- リソースの適切なアクセス制御
- 監査ログの有効化

## 注意点

### 1. 制限事項
- スタックサイズ: 最大1MB
- リソース数: 最大500リソース
- パラメータ数: 最大200パラメータ

### 2. パフォーマンス
- スタック作成・更新時間
- 依存関係の最適化
- 並列処理の活用

## まとめ

AWS CloudFormation は、Infrastructure as Codeを実現する強力なサービスです。テンプレートベースの管理により、一貫性のあるインフラストラクチャを構築・管理できます。適切な設計と運用により、効率的で保守性の高いインフラストラクチャ管理を実現できます。
