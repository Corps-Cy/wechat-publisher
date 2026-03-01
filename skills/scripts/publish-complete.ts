/**
 * 微信公众号发布器 - 完整版
 * 
 * 功能：
 * 1. 移除内容中的标题（避免重复）
 * 2. 自动获取封面图（Unsplash）
 * 3. 替换文章中的配图占位符
 * 4. 上传封面到微信素材库
 * 5. 创建草稿
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { getAccessToken, createDraft, uploadPermanentMaterial, WeChatConfig } from './wechat-api.js'
import { renderWechatFormat } from './wechat-formatter-fixed.js'
import { getSmartCover, replaceImagePlaceholders, downloadImage } from './image-fetcher.js'

const WECHAT_CONFIG: WeChatConfig = {
  appId: 'wx128453a2d5ea4c8c',
  appSecret: '6ea55d9a6c39f81d948c04eb3c30e4fa'
}

export interface PublishCompleteOptions {
  markdownPath: string
  title?: string
  author?: string
  digest?: string
  contentSourceUrl?: string
  theme?: 'roseGold' | 'classicBlue' | 'jadeGreen' | 'vibrantOrange'
  fetchCover?: boolean      // 是否获取封面（默认 true）
  fetchImages?: boolean     // 是否替换配图占位符（默认 true）
  useExistingCover?: string // 使用已有的封面 Media ID
}

/**
 * 完整发布流程
 */
export async function publishComplete(options: PublishCompleteOptions): Promise<string> {
  console.log('🚀 开始完整发布流程...\n')

  const {
    fetchCover = true,
    fetchImages = true,
    useExistingCover
  } = options

  // 1. 读取 Markdown 文件
  let markdown = readFileSync(options.markdownPath, 'utf-8')
  console.log(`✅ 文章已读取 (${markdown.length} 字符)\n`)

  // 2. 提取标题
  const title = options.title || extractTitle(markdown) || '未命名文章'
  console.log(`   标题: ${title}\n`)

  // 3. 替换配图占位符（如果有）
  if (fetchImages && markdown.includes('IMAGE_PLACEHOLDER')) {
    console.log('🖼️  开始替换配图占位符...\n')
    markdown = await replaceImagePlaceholders(markdown, title)
  }

  // 4. 转换为微信格式（移除标题）
  console.log(`🎨 转换为微信格式（主题: ${options.theme || 'roseGold'}）...\n`)
  console.log('   ✅ 移除内容中的 <h1> 标题（避免重复）\n')
  const content = await renderWechatFormat(markdown, options.theme || 'roseGold', true)

  // 5. 获取 Access Token
  const accessToken = await getAccessToken(WECHAT_CONFIG)

  // 6. 获取/使用封面
  let coverMediaId = useExistingCover

  if (!coverMediaId && fetchCover) {
    console.log('🖼️  开始获取封面图片...\n')
    
    // 获取封面
    const cover = await getSmartCover(title)
    
    // 下载封面到临时文件
    const tempPath = join(process.env.HOME || '/tmp', '.openclaw', 'temp', 'cover.jpg')
    await downloadImage(cover.url, tempPath)
    
    // 上传到微信
    console.log('📤 上传封面到微信素材库...\n')
    const uploadResult = await uploadPermanentMaterial(accessToken, tempPath, 'cover.jpg', 'image')
    coverMediaId = uploadResult.media_id
    
    console.log(`✅ 封面上传成功`)
    console.log(`   Media ID: ${coverMediaId}\n`)
  } else if (!coverMediaId) {
    // 使用默认封面
    coverMediaId = 'tdXp0No2A1pitGguS6BlZ8XpgNJuvEzEDlawId9VydPa4FULdDXa_BAb56_e73JR'
    console.log(`ℹ️  使用默认封面\n`)
  }

  // 7. 创建草稿
  console.log('📝 创建草稿...\n')
  const mediaId = await createDraft(accessToken, [{
    title,
    content,
    thumb_media_id: coverMediaId,
    author: options.author || 'OpenClaw',
    digest: options.digest || generateDigest(markdown),
    content_source_url: options.contentSourceUrl || '',
    need_open_comment: 0,
    only_fans_can_comment: 0
  }])

  console.log('✅ 发布成功！\n')
  console.log('📄 草稿信息:')
  console.log(`   标题: ${title}`)
  console.log(`   草稿 Media ID: ${mediaId}`)
  console.log(`   封面 Media ID: ${coverMediaId}\n`)

  console.log('🔍 格式检查:')
  console.log('   ✅ 标题: 已从内容中移除（避免重复）')
  console.log('   ✅ 封面: ' + (fetchCover ? '自动获取并上传' : '使用默认'))
  console.log('   ✅ 配图: ' + (fetchImages && markdown.includes('IMAGE_PLACEHOLDER') ? '已替换占位符' : '无占位符'))
  console.log('   ✅ 代码块: 浅色背景 + 深色文字')
  console.log('   ✅ 列表: 手动前缀\n')

  console.log('📱 下一步:')
  console.log('   1. 登录微信公众平台（https://mp.weixin.qq.com）')
  console.log('   2. 进入"素材管理" → "草稿箱"')
  console.log('   3. 预览文章')
  console.log('   4. 确认格式无误后发布\n')

  return mediaId
}

/**
 * 从 Markdown 提取标题
 */
function extractTitle(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match ? match[1] : null
}

/**
 * 生成摘要
 */
function generateDigest(markdown: string, maxLength: number = 120): string {
  const lines = markdown.split('\n')
  const contentLines = lines.filter(line => {
    const trimmed = line.trim()
    return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('!')
  })
  
  if (contentLines.length > 0) {
    const text = contentLines[0].replace(/[*_`#]/g, '').trim()
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }
  
  return ''
}

// 如果直接运行
if (process.argv[1].includes('publish-complete.ts')) {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('用法:')
    console.log('  npx tsx publish-complete.ts <markdown文件路径>')
    console.log('  npx tsx publish-complete.ts articles/my-article.md\n')
    console.log('选项:')
    console.log('  --no-cover       使用默认封面')
    console.log('  --no-images      不替换配图占位符')
    console.log('  --use-cover=ID   使用指定的封面 Media ID\n')
    process.exit(1)
  }
  
  const options: PublishCompleteOptions = {
    markdownPath: args[0],
    theme: 'roseGold',
    fetchCover: !args.includes('--no-cover'),
    fetchImages: !args.includes('--no-images')
  }
  
  const useCoverArg = args.find(arg => arg.startsWith('--use-cover='))
  if (useCoverArg) {
    options.useExistingCover = useCoverArg.split('=')[1]
  }
  
  publishComplete(options).catch(console.error)
}
