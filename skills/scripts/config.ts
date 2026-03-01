/**
 * 微信公众号发布器配置
 * 
 * 用户需要修改此文件中的配置
 */

export interface PublisherConfig {
  // MinIO 图床配置
  minio: {
    endpoint: string      // 如: minio.example.com
    port: number          // 端口，如 9000
    useSSL: boolean       // 是否使用 HTTPS
    accessKey: string     // MinIO AccessKey
    secretKey: string     // MinIO SecretKey
    bucket: string        // 存储桶名称
    publicUrl: string     // 公网访问地址，如 https://cdn.example.com
  }
  
  // 文章主题配置
  themes: {
    default: string       // 默认主题
    available: string[]   // 可用主题列表
  }
  
  // AI 生成配置
  generator: {
    topics: string[]      // 可选主题列表
    defaultTopic: string  // 默认主题
    style: string         // 写作风格
    length: number        // 默认文章字数
  }
  
  // 定时任务配置
  schedule: {
    times: string[]       // 发布时间，如 ["08:00", "12:00", "18:00"]
    timezone: string      // 时区，如 "Asia/Shanghai"
  }
}

// 默认配置模板
export const defaultConfig: PublisherConfig = {
  minio: {
    endpoint: 'YOUR_MINIO_ENDPOINT',
    port: 9000,
    useSSL: true,
    accessKey: 'YOUR_ACCESS_KEY',
    secretKey: 'YOUR_SECRET_KEY',
    bucket: 'wechat-images',
    publicUrl: 'https://YOUR_MINIO_PUBLIC_URL'
  },
  
  themes: {
    default: 'default',
    available: ['default', 'dark', 'purple', 'green']
  },
  
  generator: {
    topics: [
      '技术分享',
      '行业观察',
      '产品思考',
      '生活随笔'
    ],
    defaultTopic: '技术分享',
    style: '专业但不枯燥，深入浅出',
    length: 1500
  },
  
  schedule: {
    times: ['08:00', '12:00', '18:00'],
    timezone: 'Asia/Shanghai'
  }
}

// 加载用户配置
export async function loadConfig(): Promise<PublisherConfig> {
  const configPath = process.env.WECHAT_PUBLISHER_CONFIG || './config.json'
  
  try {
    const fs = await import('fs')
    if (fs.existsSync(configPath)) {
      const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      return { ...defaultConfig, ...userConfig }
    }
  } catch (error) {
    console.warn('Failed to load user config, using defaults')
  }
  
  return defaultConfig
}
