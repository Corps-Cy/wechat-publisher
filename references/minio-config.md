# MinIO 图床配置指南

## 为什么需要图床？

微信公众号对图片有特殊要求：
1. 图片必须是公网可访问的 URL
2. 不能使用本地路径
3. 外部图片可能有防盗链

因此，我们需要将文章中的图片上传到图床（MinIO），获取公网 URL 后再发布。

## MinIO 配置步骤

### 1. 安装 MinIO（如未安装）

**Docker 方式（推荐）：**
```bash
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -v /data/minio:/data \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=your-password \
  minio/minio server /data --console-address ":9001"
```

### 2. 创建存储桶

访问 `http://your-minio:9001` 登录控制台：

1. 点击 **Buckets** → **Create Bucket**
2. 输入桶名（如 `wechat-images`）
3. 点击 **Create Bucket**

### 3. 设置公开访问

1. 进入桶 → **Manage** → **Access Policy**
2. 选择 **Public** 或添加以下策略：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::wechat-images/*"]
    }
  ]
}
```

### 4. 创建访问密钥

1. 点击 **Identity** → **Service Accounts**
2. **Create Service Account**
3. 保存 Access Key 和 Secret Key

### 5. 配置公网访问

确保 MinIO 可以通过公网访问：

**方式一：直接公网 IP**
```
publicUrl: https://your-server.com
```

**方式二：CDN 加速（推荐）**
```
publicUrl: https://cdn.your-domain.com
```

配置 CDN 时，回源地址设为 MinIO 地址。

## 配置文件示例

```json
{
  "minio": {
    "endpoint": "minio.example.com",
    "port": 9000,
    "useSSL": true,
    "accessKey": "your-access-key",
    "secretKey": "your-secret-key",
    "bucket": "wechat-images",
    "publicUrl": "https://cdn.example.com"
  }
}
```

| 字段 | 说明 |
|-----|------|
| endpoint | MinIO 服务地址（不含协议） |
| port | 端口号 |
| useSSL | 是否使用 HTTPS |
| accessKey | 访问密钥 |
| secretKey | 密钥 |
| bucket | 存储桶名称 |
| publicUrl | 公网访问地址（用户看到的图片 URL） |

## 常见问题

### Q: 图片上传失败？

1. 检查 endpoint 和 port 是否正确
2. 检查 accessKey/secretKey 是否有效
3. 检查网络连通性

### Q: 图片无法显示？

1. 确认桶的访问策略是 public
2. 确认 publicUrl 配置正确
3. 尝试直接访问图片 URL

### Q: 如何更换图床？

修改配置文件中的 minio 部分即可，支持：
- 阿里云 OSS
- 腾讯云 COS
- 七牛云
- AWS S3
- 任何 S3 兼容存储

只需对应修改 endpoint、accessKey 等配置。
