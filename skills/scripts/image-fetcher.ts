/**
 * 图片获取工具
 * 
 * 从 Unsplash 免费图库获取封面和配图
 */

import { writeFileSync } from 'fs'
import { join } from 'path'

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || ''

export interface ImageResult {
  url: string
  alt: string
  author?: string
  source?: string
}

/**
 * 从 Unsplash 搜索图片
 */
export async function searchUnsplash(
  query: string,
  options: {
    count?: number
    orientation?: 'landscape' | 'portrait' | 'squarish'
  } = {}
): Promise<ImageResult[]> {
  const { count = 1, orientation = 'landscape' } = options

  // 如果没有 API Key，使用公开的 source API（无需 key）
  if (!UNSPLASH_ACCESS_KEY) {
    return searchUnsplashSource(query, count, orientation)
  }

  // 使用官方 API
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=${orientation}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    })

    if (!response.ok) {
      console.warn(`⚠️  Unsplash API 错误: ${response.status}，使用备用方案`)
      return searchUnsplashSource(query, count, orientation)
    }

    const data = await response.json() as any
    
    return data.results.map((img: any) => ({
      url: img.urls.regular,
      alt: img.alt_description || query,
      author: img.user.name,
      source: `https://unsplash.com/@${img.user.username}`
    }))
  } catch (error) {
    console.warn('⚠️  Unsplash API 调用失败，使用备用方案')
    return searchUnsplashSource(query, count, orientation)
  }
}

/**
 * 使用 Unsplash Source API（无需 key，但可能被限流）
 */
async function searchUnsplashSource(
  query: string,
  count: number,
  orientation: 'landscape' | 'portrait' | 'squarish'
): Promise<ImageResult[]> {
  const results: ImageResult[] = []
  
  for (let i = 0; i < count; i++) {
    // Unsplash Source API 格式
    // https://source.unsplash.com/1600x900/?query
    const width = orientation === 'portrait' ? 900 : 1600
    const height = orientation === 'portrait' ? 1600 : 900
    
    const url = `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}&sig=${Date.now() + i}`
    
    results.push({
      url,
      alt: query,
      author: 'Unsplash',
      source: 'https://unsplash.com'
    })
  }
  
  return results
}

/**
 * 获取封面图片
 */
export async function fetchCoverImage(
  topic: string,
  orientation: 'landscape' | 'portrait' = 'landscape'
): Promise<ImageResult> {
  console.log(`🖼️  获取封面图片: ${topic}\n`)
  
  const images = await searchUnsplash(topic, { count: 1, orientation })
  
  if (images.length > 0) {
    console.log(`✅ 封面图片获取成功`)
    console.log(`   URL: ${images[0].url}\n`)
    return images[0]
  }
  
  // 如果获取失败，使用默认图片
  console.log(`⚠️  未找到合适的封面图片，使用默认图片\n`)
  return {
    url: 'https://source.unsplash.com/1600x900/?technology',
    alt: topic,
    author: 'Unsplash',
    source: 'https://unsplash.com'
  }
}

/**
 * 获取文章配图
 */
export async function fetchArticleImages(
  topic: string,
  count: number = 3
): Promise<ImageResult[]> {
  console.log(`🖼️  获取文章配图: ${topic} (x${count})\n`)
  
  const images = await searchUnsplash(topic, { count, orientation: 'landscape' })
  
  console.log(`✅ 配图获取成功 (${images.length} 张)\n`)
  
  return images
}

/**
 * 下载图片到本地
 */
export async function downloadImage(
  url: string,
  outputPath: string
): Promise<void> {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`)
    }
    
    const buffer = Buffer.from(await response.arrayBuffer())
    writeFileSync(outputPath, buffer)
    
    console.log(`✅ 图片已保存: ${outputPath}\n`)
  } catch (error) {
    console.error(`❌ 下载图片失败: ${error}\n`)
    throw error
  }
}

/**
 * 获取符合主题的封面图片（智能推荐）
 */
export async function getSmartCover(
  title: string,
  content?: string
): Promise<ImageResult> {
  // 从标题中提取关键词
  const keywords = extractKeywords(title, content)
  
  console.log(`🔍 关键词提取: ${keywords.join(', ')}\n`)
  
  // 尝试不同的关键词组合
  for (const keyword of keywords) {
    try {
      const image = await fetchCoverImage(keyword)
      return image
    } catch (error) {
      console.warn(`⚠️  关键词 "${keyword}" 获取失败，尝试下一个\n`)
    }
  }
  
  // 如果所有关键词都失败，使用通用关键词
  return fetchCoverImage('technology')
}

/**
 * 从标题和内容中提取关键词
 */
function extractKeywords(title: string, content?: string): string[] {
  const keywords: string[] = []
  
  // 从标题中提取
  const titleWords = title
    .replace(/[：:，,。.！!？?]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 2)
  
  // 优先级：技术关键词 > 通用关键词
  const techKeywords = ['AI', 'OpenClaw', '安装', '教程', '开发', '编程', '代码']
  const found = titleWords.filter(word => 
    techKeywords.some(keyword => word.includes(keyword))
  )
  
  if (found.length > 0) {
    keywords.push(found[0])
  } else if (titleWords.length > 0) {
    keywords.push(titleWords[0])
  }
  
  // 添加一些通用的备用关键词
  keywords.push('technology', 'computer', 'workspace')
  
  return keywords
}

/**
 * 替换 Markdown 中的图片占位符
 */
export async function replaceImagePlaceholders(
  markdown: string,
  topic: string
): Promise<string> {
  // 查找所有图片占位符
  const placeholderRegex = /!\[([^\]]+)\]\(IMAGE_PLACEHOLDER:([^)]+)\)/g
  const matches = [...markdown.matchAll(placeholderRegex)]
  
  if (matches.length === 0) {
    return markdown
  }
  
  console.log(`🖼️  发现 ${matches.length} 个图片占位符，开始获取配图...\n`)
  
  // 获取配图
  const images = await fetchArticleImages(topic, matches.length)
  
  // 替换占位符
  let result = markdown
  matches.forEach((match, index) => {
    const placeholder = match[0]
    const alt = match[1]
    const image = images[index] || images[0]
    
    result = result.replace(placeholder, `![${alt}](${image.url})`)
    console.log(`✅ 替换占位符 ${index + 1}/${matches.length}`)
  })
  
  console.log(`\n✅ 所有占位符已替换\n`)
  
  return result
}
