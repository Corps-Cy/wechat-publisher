/**
 * 微信公众号发布器 - 完整版
 * 
 * 功能：
 * 1. 移除内容中的标题（避免重复）
 * 2. 自动获取封面图（glm-image 优先）
 * 3. 替换文章中的配图占位符
 * 4. 上传封面到微信素材库
 * 5. 创建草稿
 * 
 * ⚠️ 安全提示：所有凭证从 .env 文件加载
 */

import { config } from 'dotenv'
config() // 自动加载 .env 文件

import { readFileSync } from 'fs'
import { join } from 'path'
import { getAccessToken, createDraft, uploadPermanentMaterial, WeChatConfig } from './wechat-api.js'
import { renderWechatFormat } from './wechat-formatter-fixed.js'
import { getSmartCover, replaceImagePlaceholders, downloadImage } from './image-fetcher.js'

// ============================================================================
// 配置
// ============================================================================

const WECHAT_CONFIG: WeChatConfig = {
  appId: process.env.WECHAT_APP_ID || '',
  appSecret: process.env.WECHAT_APP_SECRET || '',
}

// 主题色配置
const THEMES: Record<string, { primary: string; bg: string }> = {
  default: { primary: '#0F4C81', bg: '#f0f5fa' },
  roseGold: { primary: '#B76E79', bg: '#fdf2f4' },
  classicBlue: { primary: '#3585e0', bg: '#ecf5ff' },
  jadeGreen: { primary: '#009874', bg: '#e8f5f0' },
  vibrantOrange: { primary: '#FA5151', bg: '#fff0f0' },
}

// ============================================================================
// 主要功能
// ============================================================================

interface PublishOptions {
  markdownPath: string
  title?: string
  theme?: string
  fetchCover?: boolean
  fetchImages?: boolean
}

export async function publishComplete(options: PublishOptions): Promise<string> {
  const {
    markdownPath,
    theme = 'default',
    fetchCover = true,
    fetchImages = true,
  } = options

  console.log('\n📤 开始发布流程...\n')

  // 1. 读取 Markdown 文件
  console.log('📖 读取文章...')
  const markdown = readFileSync(markdownPath, 'utf-8')
  
  // 提取标题（第一个 # 开头的行）
  const titleMatch = markdown.match(/^#\s+(.+)$/m)
  const title = options.title || (titleMatch ? titleMatch[1] : '未命名文章')
  console.log(`   标题: ${title}\n`)

  // 2. 处理配图占位符
  let processedMarkdown = markdown
  if (fetchImages) {
    console.log('🖼️  处理配图...')
    processedMarkdown = await replaceImagePlaceholders(markdown)
  }

  // 3. 转换为微信格式
  console.log('📝 转换微信格式...')
  const themeConfig = THEMES[theme] || THEMES.default
  const html = renderWechatFormat(processedMarkdown, themeConfig)
  console.log(`   主题: ${theme}\n`)

  // 4. 获取封面
  let coverUrl = ''
  let coverMediaId = ''
  
  if (fetchCover) {
    console.log('🎨 获取封面...')
    const coverResult = await getSmartCover(title)
    coverUrl = coverResult.url
    console.log(`   封面: ${coverUrl.substring(0, 60)}...\n`)
  }

  // 5. 获取 access_token
  console.log('🔑 获取 access_token...')
  const accessToken = await getAccessToken(WECHAT_CONFIG)
  console.log('   成功\n')

  // 6. 上传封面到微信
  if (coverUrl) {
    console.log('📤 上传封面...')
    const imageBuffer = await downloadImage(coverUrl)
    coverMediaId = await uploadPermanentMaterial(accessToken, imageBuffer, 'image')
    console.log(`   Media ID: ${coverMediaId}\n`)
  }

  // 7. 创建草稿
  console.log('📝 创建草稿...')
  const draftResult = await createDraft(accessToken, {
    title,
    content: html,
    thumb_media_id: coverMediaId,
    author: 'OpenClaw',
    digest: '',
    content_source_url: '',
    need_open_comment: 0,
    only_fans_can_comment: 0,
  })

  const mediaId = draftResult.media_id
  console.log(`✅ 草稿已创建`)
  console.log(`   Media ID: ${mediaId}\n`)

  // 8. 输出结果
  console.log('═══════════════════════════════════')
  console.log(`标题: ${title}`)
  console.log(`草稿 Media ID: ${mediaId}`)
  console.log(`封面 Media ID: ${coverMediaId}`)
  console.log('═══════════════════════════════════\n')

  return mediaId
}

// ============================================================================
// CLI 入口
// ============================================================================

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
用法: npx tsx publish-complete.ts <markdown文件> [选项]

选项:
  --theme=<主题>     指定主题色 (default|roseGold|classicBlue|jadeGreen|vibrantOrange)
  --no-cover         不获取封面
  --no-images        不处理配图
  --title=<标题>     指定标题

示例:
  npx tsx publish-complete.ts articles/my-article.md
  npx tsx publish-complete.ts articles/my-article.md --theme=classicBlue
`)
    process.exit(1)
  }

  const markdownPath = args[0]
  const options: PublishOptions = {
    markdownPath,
    fetchCover: !args.includes('--no-cover'),
    fetchImages: !args.includes('--no-images'),
  }

  // 解析选项
  for (const arg of args) {
    if (arg.startsWith('--theme=')) {
      options.theme = arg.split('=')[1]
    } else if (arg.startsWith('--title=')) {
      options.title = arg.split('=')[1]
    }
  }

  try {
    await publishComplete(options)
  } catch (error) {
    console.error('❌ 发布失败:', error)
    process.exit(1)
  }
}

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { publishComplete }
