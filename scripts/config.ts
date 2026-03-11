/**
 * 微信公众号发布器配置
 * 
 * ⚠️ 推荐使用 .env 文件配置，而不是修改此文件
 */

import { config } from 'dotenv'
config()

export interface PublisherConfig {
  // 微信公众号配置（必填）
  wechat: {
    appId: string
    appSecret: string
  }
  
  // MinIO 图床配置（可选）
  minio?: {
    endpoint: string
    port: number
    useSSL: boolean
    accessKey: string
    secretKey: string
    bucket: string
    publicUrl: string
  }
  
  // 智谱AI配置（可选，自动使用 OpenClaw 内置）
  zhipu?: {
    apiKey: string
  }
  
  // 文章主题配置
  themes: {
    default: string
    available: string[]
  }
  
  // AI 生成配置
  generator: {
    topics: string[]
    defaultTopic: string
    style: string
    length: number
  }
  
  // 定时任务配置
  schedule: {
    times: string[]
    timezone: string
  }
}

/**
 * 从环境变量加载配置
 */
export function loadConfig(): PublisherConfig {
  // 验证必填环境变量
  if (!process.env.WECHAT_APP_ID || !process.env.WECHAT_APP_SECRET) {
    console.error('❌ 缺少必填环境变量:')
    console.error('   - WECHAT_APP_ID')
    console.error('   - WECHAT_APP_SECRET')
    console.error('\n请创建 .env 文件并配置这些变量。')
    console.error('示例: cp .env.example .env\n')
    throw new Error('缺少必填环境变量')
  }
  
  const cfg: PublisherConfig = {
    wechat: {
      appId: process.env.WECHAT_APP_ID,
      appSecret: process.env.WECHAT_APP_SECRET,
    } as any,
    
    themes: {
      default: 'classicBlue',
      available: ['default', 'roseGold', 'classicBlue', 'jadeGreen', 'vibrantOrange']
    },
    
    generator: {
      topics: ['技术分享', '行业观察', '产品思考', '生活随笔'],
      defaultTopic: '技术分享',
      style: '专业但不枯燥，深入浅出',
      length: 1500
    },
    
    schedule: {
      times: ['08:00'],
      timezone: 'Asia/Shanghai'
    }
  }
  
  // 可选：智谱AI（用于图片生成）
  const zhipuKey = process.env.ZAI_API_KEY || process.env.ZHIPU_API_KEY
  if (zhipuKey) {
    cfg.zhipu = { apiKey: zhipuKey }
  }
  
  // 可选：MinIO 图床
  if (process.env.MINIO_ENDPOINT && process.env.MINIO_ACCESS_KEY) {
    cfg.minio = {
      endpoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL !== 'false',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY || '',
      bucket: process.env.MINIO_BUCKET || 'wechat-images',
      publicUrl: process.env.MINIO_PUBLIC_URL || `https://${process.env.MINIO_ENDPOINT}`
    }
  }
  
  console.log('✅ 配置加载成功')
  if (cfg.zhipu) console.log('   ✅ 智谱AI图片生成: 已启用')
  if (cfg.minio) console.log('   ✅ MinIO图床: 已启用')
  console.log('')
  
  return cfg
}

// 默认导出
export default loadConfig
