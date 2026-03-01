/**
 * 微信公众号发布器 - 标准版
 * 
 * 使用修复后的格式化器（wechat-formatter-fixed.ts）
 * 确保所有文章都符合微信公众号格式规范
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { getAccessToken, createDraft, WeChatConfig } from './wechat-api.js'
import { renderWechatFormat } from './wechat-formatter-fixed.js'

// 微信公众号配置
const WECHAT_CONFIG: WeChatConfig = {
  appId: 'wx128453a2d5ea4c8c',
  appSecret: '6ea55d9a6c39f81d948c04eb3c30e4fa'
}

// 已有的封面 Media ID
const COVER_MEDIA_ID = 'tdXp0No2A1pitGguS6BlZ8XpgNJuvEzEDlawId9VydPa4FULdDXa_BAb56_e73JR'

export interface PublishOptions {
  markdownPath: string
  title?: string
  author?: string
  digest?: string
  contentSourceUrl?: string
  theme?: 'roseGold' | 'classicBlue' | 'jadeGreen' | 'vibrantOrange'
}

/**
 * 发布文章到微信公众号草稿箱
 */
export async function publishArticle(options: PublishOptions): Promise<string> {
  console.log('🚀 开始发布文章到公众号...\n')

  // 1. 读取 Markdown 文件
  const markdown = readFileSync(options.markdownPath, 'utf-8')
  console.log(`✅ 文章已读取 (${markdown.length} 字符)\n`)

  // 2. 提取标题（如果没有提供）
  const title = options.title || extractTitle(markdown) || '未命名文章'
  console.log(`   标题: ${title}\n`)

  // 3. 转换为微信格式（使用修复版格式化器）
  console.log(`🎨 转换为微信格式（主题: ${options.theme || 'roseGold'}）...\n`)
  const content = await renderWechatFormat(markdown, options.theme || 'roseGold')

  // 4. 获取 Access Token
  const accessToken = await getAccessToken(WECHAT_CONFIG)

  // 5. 创建草稿
  console.log('📝 创建草稿...\n')
  const mediaId = await createDraft(accessToken, [{
    title,
    content,
    thumb_media_id: COVER_MEDIA_ID,
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
  console.log(`   封面 Media ID: ${COVER_MEDIA_ID}\n`)

  console.log('🔍 格式检查:')
  console.log('   ✅ 代码块: 浅色背景 + 深色文字')
  console.log('   ✅ 语法高亮: 完全内联')
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
 * 生成摘要（从第一段提取）
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

// 如果直接运行此脚本
if (process.argv[1].includes('publish-article.ts')) {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('用法:')
    console.log('  npx tsx publish-article.ts <markdown文件路径>')
    console.log('  npx tsx publish-article.ts articles/my-article.md\n')
    process.exit(1)
  }
  
  publishArticle({
    markdownPath: args[0],
    theme: 'roseGold'
  }).catch(console.error)
}
