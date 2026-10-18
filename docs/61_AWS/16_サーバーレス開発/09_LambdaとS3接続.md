# Lambda と S3 の接続

## 概要
このガイドでは、AWS Lambda関数からAmazon S3を操作する方法を学びます。ファイルのアップロード、ダウンロード、処理、署名付きURLの生成などを実装します。

## アーキテクチャパターン

### パターン1: 署名付きURLを使用した直接アップロード（推奨）
```
クライアント
    ↓ ① 署名付きURLリクエスト
Lambda（URL生成）
    ↓ ② 署名付きURL
クライアント
    ↓ ③ 直接アップロード
S3バケット
```

**メリット**:
- Lambda経由でデータ転送不要
- コスト削減
- 高速

### パターン2: Lambda経由でアップロード
```
クライアント
    ↓ ファイルデータ（Base64）
Lambda（ファイル処理）
    ↓
S3バケット
```

**メリット**:
- ファイルの検証・変換が可能
- ウイルススキャンなどの処理

**デメリット**:
- Lambda経由でデータ転送（遅い・高コスト）
- ファイルサイズ制限（6MB同期、10GB非同期）

### パターン3: S3イベントトリガー
```
S3バケット（アップロード）
    ↓ イベント通知
Lambda（自動処理）
    - 画像リサイズ
    - サムネイル生成
    - メタデータ抽出
    ↓
別のS3バケットまたはデータベース
```

## A. S3基本操作

### IAM権限設定
```yaml
Resources:
  S3AccessFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: s3-access-function
      Runtime: python3.11
      Handler: app.lambda_handler
      CodeUri: functions/s3_access/
      Environment:
        Variables:
          BUCKET_NAME: !Ref MyBucket
      Policies:
        - S3CrudPolicy:
            BucketName: !Ref MyBucket

  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: my-serverless-app-bucket
      CorsConfiguration:
        CorsRules:
          - AllowedHeaders:
              - "*"
            AllowedMethods:
              - GET
              - PUT
              - POST
              - DELETE
            AllowedOrigins:
              - "https://example.com"
              - "http://localhost:3000"
            MaxAge: 3000
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
```

### ファイルのアップロード
```python
import boto3
import json
import os
from typing import Dict, Any

s3_client = boto3.client('s3')
BUCKET_NAME = os.environ['BUCKET_NAME']

def upload_file(file_content: bytes, key: str, content_type: str = 'application/octet-stream') -> Dict[str, Any]:
    """S3にファイルをアップロード"""
    try:
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=file_content,
            ContentType=content_type,
            ServerSideEncryption='AES256'  # 暗号化
        )
        
        return {
            'success': True,
            'key': key,
            'bucket': BUCKET_NAME
        }
    except Exception as e:
        print(f"Error uploading file: {str(e)}")
        raise

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Lambda ハンドラー - Base64エンコードされたファイルをアップロード"""
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Base64デコード
        import base64
        file_content = base64.b64decode(body['fileContent'])
        file_name = body['fileName']
        content_type = body.get('contentType', 'application/octet-stream')
        
        # S3キーの生成（ユーザーIDなどを含める）
        user_id = event['requestContext']['authorizer']['claims']['sub']
        s3_key = f"uploads/{user_id}/{file_name}"
        
        result = upload_file(file_content, s3_key, content_type)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

### ファイルのダウンロード
```python
def download_file(key: str) -> bytes:
    """S3からファイルをダウンロード"""
    try:
        response = s3_client.get_object(
            Bucket=BUCKET_NAME,
            Key=key
        )
        return response['Body'].read()
    except s3_client.exceptions.NoSuchKey:
        raise FileNotFoundError(f"File not found: {key}")

def lambda_handler(event, context):
    """ファイルをダウンロードしてBase64エンコードで返す"""
    try:
        file_key = event['pathParameters']['key']
        
        # ファイルをダウンロード
        file_content = download_file(file_key)
        
        # Base64エンコード
        import base64
        encoded_content = base64.b64encode(file_content).decode('utf-8')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'content': encoded_content,
                'key': file_key
            })
        }
        
    except FileNotFoundError as e:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': str(e)})
        }
```

### ファイルの一覧取得
```python
def list_files(prefix: str = '', max_keys: int = 100) -> list:
    """S3バケット内のファイル一覧を取得"""
    try:
        response = s3_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=prefix,
            MaxKeys=max_keys
        )
        
        files = []
        if 'Contents' in response:
            for obj in response['Contents']:
                files.append({
                    'key': obj['Key'],
                    'size': obj['Size'],
                    'lastModified': obj['LastModified'].isoformat(),
                    'etag': obj['ETag']
                })
        
        return files
    except Exception as e:
        print(f"Error listing files: {str(e)}")
        raise

def lambda_handler(event, context):
    """ユーザーのファイル一覧を取得"""
    try:
        user_id = event['requestContext']['authorizer']['claims']['sub']
        prefix = f"uploads/{user_id}/"
        
        files = list_files(prefix)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'files': files,
                'count': len(files)
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

### ファイルの削除
```python
def delete_file(key: str) -> bool:
    """S3からファイルを削除"""
    try:
        s3_client.delete_object(
            Bucket=BUCKET_NAME,
            Key=key
        )
        return True
    except Exception as e:
        print(f"Error deleting file: {str(e)}")
        raise

def lambda_handler(event, context):
    """ファイルを削除"""
    try:
        file_key = event['pathParameters']['key']
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # ユーザーのファイルか確認
        if not file_key.startswith(f"uploads/{user_id}/"):
            return {
                'statusCode': 403,
                'body': json.dumps({'error': 'Forbidden'})
            }
        
        delete_file(file_key)
        
        return {
            'statusCode': 204
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

## B. 署名付きURL（推奨）

### アップロード用署名付きURL
```python
def generate_presigned_upload_url(
    key: str,
    content_type: str,
    expires_in: int = 3600
) -> str:
    """アップロード用の署名付きURLを生成"""
    try:
        url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': key,
                'ContentType': content_type
            },
            ExpiresIn=expires_in
        )
        return url
    except Exception as e:
        print(f"Error generating presigned URL: {str(e)}")
        raise

def lambda_handler(event, context):
    """アップロード用署名付きURLを生成"""
    try:
        body = json.loads(event.get('body', '{}'))
        
        file_name = body['fileName']
        content_type = body.get('contentType', 'application/octet-stream')
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # ユニークなキーを生成
        import uuid
        unique_id = str(uuid.uuid4())
        s3_key = f"uploads/{user_id}/{unique_id}/{file_name}"
        
        # 署名付きURL生成
        upload_url = generate_presigned_upload_url(s3_key, content_type)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'uploadUrl': upload_url,
                'key': s3_key,
                'expiresIn': 3600
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

### ダウンロード用署名付きURL
```python
def generate_presigned_download_url(key: str, expires_in: int = 3600) -> str:
    """ダウンロード用の署名付きURLを生成"""
    try:
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': key
            },
            ExpiresIn=expires_in
        )
        return url
    except Exception as e:
        print(f"Error generating presigned URL: {str(e)}")
        raise

def lambda_handler(event, context):
    """ダウンロード用署名付きURLを生成"""
    try:
        file_key = event['pathParameters']['key']
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # 権限チェック
        if not file_key.startswith(f"uploads/{user_id}/"):
            return {
                'statusCode': 403,
                'body': json.dumps({'error': 'Forbidden'})
            }
        
        # 署名付きURL生成
        download_url = generate_presigned_download_url(file_key)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'downloadUrl': download_url,
                'expiresIn': 3600
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

### フロントエンドからの使用
```javascript
// アップロード
async function uploadFile(file) {
  try {
    // 1. 署名付きURLを取得
    const response = await fetch('https://api.example.com/presigned-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type
      })
    });
    
    const { uploadUrl, key } = await response.json();
    
    // 2. S3に直接アップロード
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    });
    
    console.log('Upload successful!', key);
    return key;
    
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// ダウンロード
async function downloadFile(fileKey) {
  try {
    // 1. 署名付きURLを取得
    const response = await fetch(
      `https://api.example.com/presigned-download/${encodeURIComponent(fileKey)}`,
      {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      }
    );
    
    const { downloadUrl } = await response.json();
    
    // 2. ブラウザで開くまたはダウンロード
    window.open(downloadUrl, '_blank');
    
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}
```

## C. S3イベントトリガー

### SAMテンプレート
```yaml
Resources:
  # 画像処理関数
  ImageProcessFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: image-process-function
      Runtime: python3.11
      Handler: app.lambda_handler
      CodeUri: functions/image_process/
      MemorySize: 1024
      Timeout: 60
      Environment:
        Variables:
          PROCESSED_BUCKET: !Ref ProcessedBucket
      Events:
        S3Upload:
          Type: S3
          Properties:
            Bucket: !Ref UploadBucket
            Events: s3:ObjectCreated:*
            Filter:
              S3Key:
                Rules:
                  - Name: prefix
                    Value: uploads/
                  - Name: suffix
                    Value: .jpg
      Policies:
        - S3ReadPolicy:
            BucketName: !Ref UploadBucket
        - S3CrudPolicy:
            BucketName: !Ref ProcessedBucket

  UploadBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: uploads-bucket

  ProcessedBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: processed-bucket
```

### 画像リサイズの実装
```python
import boto3
import os
from PIL import Image
from io import BytesIO

s3_client = boto3.client('s3')
PROCESSED_BUCKET = os.environ['PROCESSED_BUCKET']

def resize_image(image_content: bytes, size: tuple) -> bytes:
    """画像をリサイズ"""
    image = Image.open(BytesIO(image_content))
    
    # アスペクト比を保持してリサイズ
    image.thumbnail(size, Image.Resampling.LANCZOS)
    
    # バイト列に変換
    output = BytesIO()
    image.save(output, format=image.format or 'JPEG', quality=85, optimize=True)
    return output.getvalue()

def lambda_handler(event, context):
    """S3アップロードイベントで画像を処理"""
    try:
        # S3イベントから情報を取得
        for record in event['Records']:
            bucket = record['s3']['bucket']['name']
            key = record['s3']['object']['key']
            
            print(f"Processing: {bucket}/{key}")
            
            # 元画像をダウンロード
            response = s3_client.get_object(Bucket=bucket, Key=key)
            original_image = response['Body'].read()
            
            # サムネイル生成（複数サイズ）
            sizes = {
                'small': (150, 150),
                'medium': (300, 300),
                'large': (800, 800)
            }
            
            for size_name, dimensions in sizes.items():
                # リサイズ
                resized_image = resize_image(original_image, dimensions)
                
                # 保存先キー
                file_name = os.path.basename(key)
                processed_key = f"thumbnails/{size_name}/{file_name}"
                
                # 処理済みバケットに保存
                s3_client.put_object(
                    Bucket=PROCESSED_BUCKET,
                    Key=processed_key,
                    Body=resized_image,
                    ContentType='image/jpeg',
                    ServerSideEncryption='AES256'
                )
                
                print(f"Saved: {processed_key}")
        
        return {
            'statusCode': 200,
            'body': 'Processing complete'
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise
```

### requirements.txt
```txt
boto3==1.34.10
Pillow==10.1.0
```

## D. マルチパートアップロード

### 大容量ファイルのアップロード
```python
def initiate_multipart_upload(key: str, content_type: str) -> str:
    """マルチパートアップロードを開始"""
    response = s3_client.create_multipart_upload(
        Bucket=BUCKET_NAME,
        Key=key,
        ContentType=content_type,
        ServerSideEncryption='AES256'
    )
    return response['UploadId']

def generate_presigned_upload_part_url(
    key: str,
    upload_id: str,
    part_number: int,
    expires_in: int = 3600
) -> str:
    """パートアップロード用の署名付きURLを生成"""
    url = s3_client.generate_presigned_url(
        'upload_part',
        Params={
            'Bucket': BUCKET_NAME,
            'Key': key,
            'UploadId': upload_id,
            'PartNumber': part_number
        },
        ExpiresIn=expires_in
    )
    return url

def complete_multipart_upload(key: str, upload_id: str, parts: list):
    """マルチパートアップロードを完了"""
    s3_client.complete_multipart_upload(
        Bucket=BUCKET_NAME,
        Key=key,
        UploadId=upload_id,
        MultipartUpload={'Parts': parts}
    )

def lambda_handler(event, context):
    """マルチパートアップロードの制御"""
    try:
        action = event['pathParameters']['action']
        body = json.loads(event.get('body', '{}'))
        
        if action == 'initiate':
            # アップロード開始
            file_name = body['fileName']
            content_type = body['contentType']
            user_id = event['requestContext']['authorizer']['claims']['sub']
            
            s3_key = f"uploads/{user_id}/{file_name}"
            upload_id = initiate_multipart_upload(s3_key, content_type)
            
            # パート数を計算（5MB per part）
            file_size = body['fileSize']
            part_size = 5 * 1024 * 1024  # 5MB
            part_count = (file_size + part_size - 1) // part_size
            
            # 各パート用の署名付きURL生成
            urls = []
            for part_number in range(1, part_count + 1):
                url = generate_presigned_upload_part_url(
                    s3_key, upload_id, part_number
                )
                urls.append({
                    'partNumber': part_number,
                    'url': url
                })
            
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'uploadId': upload_id,
                    'key': s3_key,
                    'partUrls': urls
                })
            }
        
        elif action == 'complete':
            # アップロード完了
            key = body['key']
            upload_id = body['uploadId']
            parts = body['parts']  # [{'PartNumber': 1, 'ETag': '...'}]
            
            complete_multipart_upload(key, upload_id, parts)
            
            return {
                'statusCode': 200,
                'body': json.dumps({'success': True})
            }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

### フロントエンド実装
```javascript
async function uploadLargeFile(file) {
  const PART_SIZE = 5 * 1024 * 1024; // 5MB
  
  try {
    // 1. マルチパートアップロード開始
    const initResponse = await fetch('/api/multipart/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size
      })
    });
    
    const { uploadId, key, partUrls } = await initResponse.json();
    
    // 2. 各パートをアップロード
    const uploadedParts = [];
    
    for (const partInfo of partUrls) {
      const start = (partInfo.partNumber - 1) * PART_SIZE;
      const end = Math.min(start + PART_SIZE, file.size);
      const partBlob = file.slice(start, end);
      
      const response = await fetch(partInfo.url, {
        method: 'PUT',
        body: partBlob
      });
      
      const etag = response.headers.get('ETag');
      uploadedParts.push({
        PartNumber: partInfo.partNumber,
        ETag: etag
      });
      
      // 進捗表示
      console.log(`Uploaded part ${partInfo.partNumber}/${partUrls.length}`);
    }
    
    // 3. アップロード完了
    await fetch('/api/multipart/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        key,
        uploadId,
        parts: uploadedParts
      })
    });
    
    console.log('Upload completed!');
    return key;
    
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}
```

## まとめ

✅ S3基本操作（アップロード、ダウンロード、削除、一覧取得）
✅ 署名付きURLによる直接アップロード（推奨）
✅ S3イベントトリガーによる自動処理
✅ 画像リサイズの実装
✅ マルチパートアップロード（大容量ファイル）

**次のステップ**:
- [07_LambdaとCognito接続](./07_LambdaとCognito接続.md)
- [04_LambdaとDynamoDB接続](./04_LambdaとDynamoDB接続.md)

---

**関連ドキュメント**:
- [S3基礎](../04_ストレージ/01_S3とは.md)
- [Lambda基礎](../03_コンピューティング/Lambda/AWS_Lambda.md)
- [S3署名付きURL公式ドキュメント](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)

