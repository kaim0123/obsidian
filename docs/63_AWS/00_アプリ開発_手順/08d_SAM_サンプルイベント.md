## API Gateway（HTTP）
```json
{
  "version": "2.0",
  "routeKey": "GET /hello",
  "rawPath": "/hello",
  "requestContext": {
    "http": {"method": "GET", "path": "/hello"}
  },
  "headers": {"host": "localhost"},
  "isBase64Encoded": false
}
```

## SQS イベント
```json
{
  "Records": [
    {"body": "{\"message\":\"hello\"}"}
  ]
}
```


