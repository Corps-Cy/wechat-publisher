/**
 * 微信公众号文章自动生成工作流
 * 
 * 完整流程：
 * 1. AI 生成文章
 * 2. 转换为微信样式
 * 3. 上传图片到 MinIO
 * 4. 生成预览
 */

import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { nanoid } from 'nanoid'
import { renderInlineHtml, renderWechatHtml, generatePreviewPage } from './render-wechat.js'
import { uploadImages } from './upload-images.js'
import { loadConfig, type PublisherConfig } from './config.js'
import * as fs from 'fs'
import * as path from 'path'

export interface Article {
  id: string
  title: string
  content: string      // Markdown 内容
  html: string         // 渲染后的 HTML（内联样式）
  cover?: string       // 封面图 URL
  createdAt: Date
  topic: string
  theme: string
}

export interface GenerationOptions {
  topic?: string
  theme?: string
  style?: string
  length?: number
  customPrompt?: string
}

// AI 生成文章（通过 LLM）
async function generateWithAI(
  options: GenerationOptions,
  config: PublisherConfig
): Promise<{ title: string; content: string }> {
  const topic = options.topic || config.generator.defaultTopic
  const style = options.style || config.generator.style
  const length = options.length || config.generator.length
  
  // 这个函数会由 OpenClaw 的 LLM 来执行
  // 返回一个结构化的 prompt，让调用方通过 AI 生成
  const prompt = `
你是一位专业的内容创作者，请为我写一篇关于"${topic}"的文章。

要求：
- 写作风格：${style}
- 字数：约 ${length} 字
- 格式：使用 Markdown 格式
- 结构清晰，有小标题
- 内容有价值，能引发思考
- 开头有吸引力，结尾有总结

请直接输出文章内容，格式如下：

# 标题

正文内容...
`
  
  // 在实际使用中，这个 prompt 会返回给 OpenClaw 的 LLM 处理
  // 这里只是一个模板
  return {
    title: `待生成：${topic}`,
    content: prompt
  }
}

// 完整工作流
export async function createArticle(
  options: GenerationOptions = {},
  config?: PublisherConfig
): Promise<Article> {
  const cfg = config || await loadConfig()
  const articleId = nanoid(8)
  const topic = options.topic || cfg.generator.defaultTopic
  const theme = options.theme || cfg.themes.default
  
  console.log(`\n📝 开始创建文章 [${articleId}]`)
  console.log(`   主题: ${topic}`)
  console.log(`   样式: ${theme}`)
  
  // 1. 生成文章内容（AI 生成部分需要外部调用）
  const { title, content } = await generateWithAI(options, cfg)
  
  // 2. 渲染为微信样式 HTML
  console.log('\n🎨 渲染微信样式...')
  const { html: rawHtml, images } = await renderWechatHtml(content, theme)
  
  // 3. 上传图片
  let finalHtml = rawHtml
  if (images.length > 0) {
    console.log(`\n📤 上传 ${images.length} 张图片到 MinIO...`)
    const uploadedUrls = await uploadImages(images, cfg.minio)
    
    // 替换图片 URL
    images.forEach((original, index) => {
      finalHtml = finalHtml.replace(
        `__IMAGE_PLACEHOLDER_${index}__`, 
        uploadedUrls[index]
      )
    })
  }
  
  // 4. 内联 CSS
  const inlineHtml = await renderInlineHtml(content, theme)
  
  const article: Article = {
    id: articleId,
    title,
    content,
    html: inlineHtml,
    createdAt: new Date(),
    topic,
    theme
  }
  
  console.log(`\n✅ 文章创建完成: ${title}`)
  return article
}

// 从 Markdown 内容创建文章（用于手动提供内容）
export async function createArticleFromMarkdown(
  markdown: string,
  title: string,
  options: GenerationOptions = {},
  config?: PublisherConfig
): Promise<Article> {
  const cfg = config || await loadConfig()
  const articleId = nanoid(8)
  const theme = options.theme || cfg.themes.default
  
  console.log(`\n📝 从 Markdown 创建文章 [${articleId}]`)
  
  // 1. 渲染 HTML
  const { html: rawHtml, images } = await renderWechatHtml(markdown, theme)
  
  // 2. 上传图片
  let finalHtml = rawHtml
  if (images.length > 0) {
    console.log(`\n📤 上传 ${images.length} 张图片...`)
    const uploadedUrls = await uploadImages(images, cfg.minio)
    
    images.forEach((original, index) => {
      finalHtml = finalHtml.replace(
        `__IMAGE_PLACEHOLDER_${index}__`, 
        uploadedUrls[index]
      )
    })
  }
  
  // 3. 内联 CSS
  const inlineHtml = await renderInlineHtml(markdown, theme)
  
  return {
    id: articleId,
    title,
    content: markdown,
    html: inlineHtml,
    createdAt: new Date(),
    topic: options.topic || '自定义',
    theme
  }
}

// 保存文章到文件
export async function saveArticle(
  article: Article, 
  outputDir: string = './articles'
): Promise<{ markdownPath: string; htmlPath: string; previewPath: string }> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const dateStr = format(article.createdAt, 'yyyy-MM-dd')
  const timeStr = format(article.createdAt, 'HH-mm-ss')
  const safeTitle = article.title.replace(/[\/\\?%*:|"<>]/g, '-')
  const prefix = `${dateStr}_${timeStr}_${article.id}`
  
  // 保存 Markdown
  const markdownPath = path.join(outputDir, `${prefix}.md`)
  fs.writeFileSync(markdownPath, `# ${article.title}\n\n${article.content}`)
  
  // 保存 HTML（用于直接复制）
  const htmlPath = path.join(outputDir, `${prefix}.html`)
  fs.writeFileSync(htmlPath, article.html)
  
  // 保存预览页面
  const previewPath = path.join(outputDir, `${prefix}_preview.html`)
  const previewPage = generatePreviewPage(article.html, article.title)
  fs.writeFileSync(previewPath, previewPage)
  
  console.log(`\n💾 文章已保存:`)
  console.log(`   Markdown: ${markdownPath}`)
  console.log(`   HTML: ${htmlPath}`)
  console.log(`   预览: ${previewPath}`)
  
  return { markdownPath, htmlPath, previewPath }
}

// CLI 入口
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  const topicIndex = args.indexOf('--topic')
  const themeIndex = args.indexOf('--theme')
  
  const options: GenerationOptions = {
    topic: topicIndex > -1 ? args[topicIndex + 1] : undefined,
    theme: themeIndex > -1 ? args[themeIndex + 1] : undefined
  }
  
  createArticle(options)
    .then(article => saveArticle(article))
    .then(() => console.log('\n🎉 完成!'))
    .catch(err => console.error('\n❌ 错误:', err))
}
