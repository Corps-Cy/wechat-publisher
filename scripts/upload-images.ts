/**
 * MinIO 图片上传器
 *
 * 支持上传图片到 MinIO，返回公网 URL
 */

import { nanoid } from 'nanoid'
import type { PublisherConfig } from './config.js'

// MinIO 客户端（延迟初始化）
let minioClient: any = null

// 初始化 MinIO 客户端
async function getMinioClient(config: PublisherConfig['minio']) {
  if (minioClient) return minioClient

  const { Client } = await import('minio')
  minioClient = new Client({
    endPoint: config.endpoint,
    port: config.port,
    useSSL: config.useSSL,
    accessKey: config.accessKey,
    secretKey: config.secretKey
  })

  return minioClient
}

// 初始化 MinIO 客户端
export async function initMinio(config: PublisherConfig['minio']) {
  return getMinioClient(config)
}

// 确保存储桶存在
async function ensureBucket(client: any, bucket: string): Promise<void> {
  const exists = await client.bucketExists(bucket)
  if (!exists) {
    await client.makeBucket(bucket, 'cn-north-1')
    // 设置公开读取策略
    const policy = {
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucket}/*`]
      }]
    }
    await client.setBucketPolicy(bucket, JSON.stringify(policy))
  }
}

// 获取文件的 MIME 类型
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

// 上传 Buffer 到 MinIO
export async function uploadBuffer(
  buffer: Buffer,
  filename: string,
  config: PublisherConfig['minio']
): Promise<string> {
  const client = await initMinio(config)
  await ensureBucket(client, config.bucket)

  // 生成唯一文件名
  const ext = filename.split('.').pop() || 'png'
  const objectName = `wechat/${nanoid()}.${ext}`
  const mimeType = getMimeType(filename)

  await client.putObject(
    config.bucket,
    objectName,
    buffer,
    buffer.length,
    { 'Content-Type': mimeType }
  )

  // 返回公网 URL
  const publicUrl = config.publicUrl.replace(/\/$/, '')
  return `${publicUrl}/${objectName}`
}

// 从 URL 下载并上传
export async function uploadFromUrl(
  url: string,
  config: PublisherConfig['minio']
): Promise<string> {
  // 下载图片
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // 从 URL 提取文件名
  const urlPath = new URL(url).pathname
  const filename = urlPath.split('/').pop() || 'image.png'

  return uploadBuffer(buffer, filename, config)
}

// 从 Base64 上传
export async function uploadFromBase64(
  base64: string,
  config: PublisherConfig['minio']
): Promise<string> {
  // 提取 data URI 中的数据
  const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!matches) {
    throw new Error('Invalid base64 image format')
  }

  const ext = matches[1]
  const data = matches[2]
  const buffer = Buffer.from(data, 'base64')

  return uploadBuffer(buffer, `image.${ext}`, config)
}

// 批量上传图片
export async function uploadImages(
  images: string[],
  config: PublisherConfig['minio']
): Promise<string[]> {
  const results: string[] = []

  for (const image of images) {
    try {
      let url: string

      if (image.startsWith('data:')) {
        // Base64 图片
        url = await uploadFromBase64(image, config)
      } else if (image.startsWith('http')) {
        // 网络图片
        url = await uploadFromUrl(image, config)
      } else {
        // 本地路径（需要读取文件）
        const fs = await import('fs')
        const buffer = fs.readFileSync(image)
        url = await uploadBuffer(buffer, image, config)
      }

      results.push(url)
      console.log(`✅ Uploaded: ${url}`)
    } catch (error) {
      console.error(`❌ Failed to upload ${image}:`, error)
      results.push(image) // 保留原始 URL
    }
  }

  return results
}
