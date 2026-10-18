# Phase 1: 基本CMS機能

## 概要

社内文書管理システムの基本CMS機能を実装します。Next.js、AWS RDS、Lambda、API Gatewayを使用して、文書の作成、表示、管理機能を構築します。

## 前提条件

### 必要な知識
- Next.js基礎知識
- AWS基礎知識
- TypeScript基礎知識
- SQL基礎知識

### 必要なツール
- Node.js (v18以上)
- AWS CLI
- Git
- VS Code（推奨）

### AWSアカウント設定
```bash
# AWS CLI設定
aws configure
# Access Key ID, Secret Access Key, Region, Output formatを設定
```

## 1.1 プロジェクト初期化

### Next.jsプロジェクト作成
```bash
# プロジェクト作成
npx create-next-app@latest document-management-system --typescript --tailwind --eslint --app

# プロジェクトディレクトリに移動
cd document-management-system

# 必要なパッケージをインストール
npm install @aws-sdk/client-s3 @aws-sdk/client-rds-data @aws-sdk/client-cognito-identity-provider
npm install @types/node
```

### プロジェクト構造
```
document-management-system/
├── app/
│   ├── api/
│   │   └── documents/
│   ├── components/
│   │   ├── DocumentList.tsx
│   │   ├── DocumentForm.tsx
│   │   └── DocumentCard.tsx
│   ├── lib/
│   │   ├── database.ts
│   │   └── aws-config.ts
│   └── page.tsx
├── lambda/
│   ├── functions/
│   │   ├── get-documents/
│   │   ├── create-document/
│   │   └── update-document/
│   └── shared/
│       └── database.ts
└── infrastructure/
    ├── database.yaml
    ├── lambda.yaml
    └── api-gateway.yaml
```

## 1.2 データベース設計

### RDS PostgreSQLインスタンス作成
```yaml
# infrastructure/database.yaml
Resources:
  DocumentDatabase:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: document-management-db
      Engine: postgres
      EngineVersion: '15.4'
      DBInstanceClass: db.t3.micro
      AllocatedStorage: 20
      MasterUsername: admin
      MasterUserPassword: !Ref DatabasePassword
      VPCSecurityGroups:
        - !Ref DatabaseSecurityGroup
      DBSubnetGroupName: !Ref DatabaseSubnetGroup
      BackupRetentionPeriod: 7
      MultiAZ: false
      PubliclyAccessible: false
```

### データベーステーブル作成
```sql
-- ユーザーテーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文書テーブル
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    file_path VARCHAR(500),
    file_type VARCHAR(100),
    file_size BIGINT,
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文書権限テーブル
CREATE TABLE document_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id),
    user_id UUID REFERENCES users(id),
    permission_type VARCHAR(50) NOT NULL, -- 'read', 'write', 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_documents_author ON documents(author_id);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_document_permissions_document ON document_permissions(document_id);
CREATE INDEX idx_document_permissions_user ON document_permissions(user_id);
```

## 1.3 Lambda関数実装

### 文書取得API
```typescript
// lambda/functions/get-documents/index.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { RDSDataService } from '@aws-sdk/client-rds-data';

const rdsDataService = new RDSDataService({ region: 'ap-northeast-1' });

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { page = 1, limit = 10 } = event.queryStringParameters || {};
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const params = {
      resourceArn: process.env.RDS_ARN!,
      secretArn: process.env.RDS_SECRET_ARN!,
      database: 'document_management',
      sql: `
        SELECT d.id, d.title, d.content, d.file_path, d.file_type, 
               d.file_size, d.created_at, d.updated_at,
               u.name as author_name
        FROM documents d
        JOIN users u ON d.author_id = u.id
        ORDER BY d.created_at DESC
        LIMIT :limit OFFSET :offset
      `,
      parameters: [
        { name: 'limit', value: { longValue: Number(limit) } },
        { name: 'offset', value: { longValue: offset } }
      ]
    };

    const result = await rdsDataService.executeStatement(params);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        documents: result.records?.map(record => ({
          id: record[0]?.stringValue,
          title: record[1]?.stringValue,
          content: record[2]?.stringValue,
          filePath: record[3]?.stringValue,
          fileType: record[4]?.stringValue,
          fileSize: record[5]?.longValue,
          createdAt: record[6]?.stringValue,
          updatedAt: record[7]?.stringValue,
          authorName: record[8]?.stringValue
        }))
      })
    };
  } catch (error) {
    console.error('Error fetching documents:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
```

### 文書作成API
```typescript
// lambda/functions/create-document/index.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { RDSDataService } from '@aws-sdk/client-rds-data';

const rdsDataService = new RDSDataService({ region: 'ap-northeast-1' });

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { title, content, authorId } = body;
    
    if (!title || !authorId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Title and authorId are required' })
      };
    }

    const params = {
      resourceArn: process.env.RDS_ARN!,
      secretArn: process.env.RDS_SECRET_ARN!,
      database: 'document_management',
      sql: `
        INSERT INTO documents (title, content, author_id)
        VALUES (:title, :content, :authorId)
        RETURNING id, created_at
      `,
      parameters: [
        { name: 'title', value: { stringValue: title } },
        { name: 'content', value: { stringValue: content || '' } },
        { name: 'authorId', value: { stringValue: authorId } }
      ]
    };

    const result = await rdsDataService.executeStatement(params);
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        id: result.records?.[0]?.[0]?.stringValue,
        createdAt: result.records?.[0]?.[1]?.stringValue
      })
    };
  } catch (error) {
    console.error('Error creating document:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
```

## 1.4 Next.jsフロントエンド実装

### 文書一覧コンポーネント
```typescript
// app/components/DocumentList.tsx
'use client';

import { useState, useEffect } from 'react';

interface Document {
  id: string;
  title: string;
  content: string;
  filePath?: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
  authorName: string;
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">文書一覧</h2>
      {documents.length === 0 ? (
        <p>文書がありません</p>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 文書カードコンポーネント
```typescript
// app/components/DocumentCard.tsx
interface Document {
  id: string;
  title: string;
  content: string;
  filePath?: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
  authorName: string;
}

interface DocumentCardProps {
  document: Document;
}

export default function DocumentCard({ document }: DocumentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{document.title}</h3>
        <span className="text-sm text-gray-500">
          {formatDate(document.createdAt)}
        </span>
      </div>
      
      <p className="text-gray-600 mb-2 line-clamp-2">
        {document.content}
      </p>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>作成者: {document.authorName}</span>
        {document.fileSize && (
          <span>{formatFileSize(document.fileSize)}</span>
        )}
      </div>
      
      <div className="mt-3 flex gap-2">
        <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          閲覧
        </button>
        <button className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">
          編集
        </button>
      </div>
    </div>
  );
}
```

### 文書作成フォーム
```typescript
// app/components/DocumentForm.tsx
'use client';

import { useState } from 'react';

interface DocumentFormProps {
  onSubmit: (data: { title: string; content: string }) => void;
  onCancel: () => void;
}

export default function DocumentForm({ onSubmit, onCancel }: DocumentFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSubmit({ title, content });
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          タイトル *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">
          内容
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '作成中...' : '作成'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
```

## 1.5 API Gateway設定

### API Gateway作成
```yaml
# infrastructure/api-gateway.yaml
Resources:
  DocumentAPI:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: DocumentManagementAPI
      Description: API for Document Management System
      EndpointConfiguration:
        Types:
          - REGIONAL

  DocumentsResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref DocumentAPI
      ParentId: !GetAtt DocumentAPI.RootResourceId
      PathPart: documents

  GetDocumentsMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref DocumentAPI
      ResourceId: !Ref DocumentsResource
      HttpMethod: GET
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${GetDocumentsFunction.Arn}/invocations'

  CreateDocumentMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref DocumentAPI
      ResourceId: !Ref DocumentsResource
      HttpMethod: POST
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${CreateDocumentFunction.Arn}/invocations'

  Deployment:
    Type: AWS::ApiGateway::Deployment
    Properties:
      RestApiId: !Ref DocumentAPI
      StageName: prod
```

## 1.6 デプロイメント

### CloudFormationテンプレート
```bash
# インフラストラクチャデプロイ
aws cloudformation create-stack \
  --stack-name document-management-system \
  --template-body file://infrastructure/database.yaml \
  --parameters ParameterKey=DatabasePassword,ParameterValue=YourSecurePassword123! \
  --capabilities CAPABILITY_IAM
```

### Lambda関数デプロイ
```bash
# Lambda関数をパッケージ化
cd lambda/functions/get-documents
zip -r get-documents.zip .
aws lambda create-function \
  --function-name get-documents \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://get-documents.zip
```

## 次のステップ

Phase 1が完了したら、Phase 2の認証機能の実装に進みます。
