/**
 * 微信公众号发布器 - 主入口
 * 
 * 这个文件是整个 skill 的入口点
 * OpenClaw 会调用这里的函数来生成文章
 */

import { createArticleFromMarkdown, saveArticle, type Article } from './workflow.js'
import { 
  buildGenerationPrompt, 
  extractTitle, 
  generateSummary,
  type GenerationOptions,
  type GeneratedArticle 
} from './ai-generator.js'
import { loadConfig, type PublisherConfig } from './config.js'
import { renderInlineHtml } from './render-wechat.js'

// 导出所有模块
export * from './workflow.js'
export * from './ai-generator.js'
export * from './config.js'
export * from './render-wechat.js'
export * from './upload-images.js'
export * from './scheduler.js'
export * from './wechat-api.js'

/**
 * 主函数：生成并保存文章
 * 
 * 这个函数会：
 * 1. 接收用户的主题和选项
 * 2. 返回生成文章所需的 prompt
 * 3. 接收 AI 生成的内容
 * 4. 渲染为微信样式 HTML
 * 5. 保存文件
 */
export async function generateArticle(
  markdownContent: string,
  title?: string,
  options: {
    theme?: string
    topic?: string
    outputDir?: string
  } = {}
): Promise<{
  article: Article
  paths: {
    markdownPath: string
    htmlPath: string
    previewPath: string
  }
}> {
  const config = await loadConfig()
  const articleTitle = title || extractTitle(markdownContent)
  const theme = options.theme || config.themes.default
  
  // 创建文章
  const article = await createArticleFromMarkdown(
    markdownContent,
    articleTitle,
    { theme, topic: options.topic },
    config
  )
  
  // 保存文件
  const paths = await saveArticle(article, options.outputDir || './articles')
  
  return { article, paths }
}

/**
 * 快速生成：从主题到完成
 * 
 * 返回一个对象，包含：
 * - prompt: 需要发送给 AI 的提示词
 * - complete: 接收 AI 响应后完成生成的函数
 */
export function prepareArticleGeneration(
  options: GenerationOptions = {}
): {
  prompt: string
  complete: (aiResponse: string, theme?: string) => Promise<{
    article: Article
    paths: ReturnType<typeof saveArticle> extends Promise<infer T> ? T : never
  }>
} {
  let configPromise = loadConfig()
  
  return {
    prompt: '', // 会在 complete 中异步生成
    
    complete: async (aiResponse: string, theme?: string) => {
      const config = await configPromise
      const topic = options.topic || config.generator.defaultTopic
      const articleTheme = theme || config.themes.default
      const title = extractTitle(aiResponse)
      
      const article = await createArticleFromMarkdown(
        aiResponse,
        title,
        { theme: articleTheme, topic },
        config
      )
      
      const paths = await saveArticle(article)
      
      return { article, paths }
    }
  }
}

/**
 * OpenClaw Skill 入口点
 * 
 * 当用户说"生成一篇关于XX的公众号文章"时调用
 */
export async function handleGenerationRequest(
  userInput: string
): Promise<{
  status: 'success' | 'error'
  message: string
  article?: Article
  paths?: {
    markdownPath: string
    htmlPath: string
    previewPath: string
  }
}> {
  try {
    // 从用户输入中提取主题
    const topicMatch = userInput.match(/关于["']?([^"']+)["']?/)
    const topic = topicMatch ? topicMatch[1] : '技术分享'
    
    // 获取生成 prompt
    const config = await loadConfig()
    const prompt = buildGenerationPrompt({ topic }, config)
    
    return {
      status: 'success',
      message: `请使用以下 prompt 生成文章，然后将生成的内容发给我：\n\n${prompt}\n\n💡 或者直接让我根据这个 prompt 生成文章`
    }
  } catch (error) {
    return {
      status: 'error',
      message: `生成失败: ${error}`
    }
  }
}

/**
 * 转换已有 Markdown 为微信格式
 * 
 * 当用户说"把这段内容转成微信格式"时调用
 */
export async function convertToWechat(
  markdown: string,
  title?: string,
  theme?: string
): Promise<{
  html: string
  preview: string
  title: string
}> {
  const config = await loadConfig()
  const articleTitle = title || extractTitle(markdown)
  const articleTheme = theme || config.themes.default
  
  // 渲染 HTML
  const html = await renderInlineHtml(markdown, articleTheme)
  
  // 生成预览
  const { generatePreviewPage } = await import('./render-wechat.js')
  const preview = generatePreviewPage(html, articleTitle)
  
  return {
    html,
    preview,
    title: articleTitle
  }
}

/**
 * 发布文章到微信公众号
 * 
 * 当用户说"发布这篇文章到公众号"时调用
 */
export async function publishToWechat(
  title: string,
  content: string,
  options: {
    publish?: boolean // true=直接发布，false=仅创建草稿
    author?: string
    digest?: string
  } = {}
): Promise<{
  success: boolean
  message: string
  mediaId?: string
  publishId?: string
}> {
  try {
    const config = await loadConfig()
    
    if (!config.wechat?.appId || !config.wechat?.appSecret) {
      return {
        success: false,
        message: '❌ 微信公众号配置缺失，请先配置 appId 和 appSecret'
      }
    }
    
    const { publishArticle, createDraftOnly } = await import('./wechat-api.js')
    
    if (options.publish) {
      // 直接发布
      const result = await publishArticle(config.wechat, {
        title,
        content,
        author: options.author,
        digest: options.digest
      })
      
      return {
        success: true,
        message: '✅ 文章已发布到微信公众号！',
        mediaId: result.mediaId,
        publishId: result.publishId
      }
    } else {
      // 仅创建草稿
      const mediaId = await createDraftOnly(config.wechat, {
        title,
        content,
        author: options.author,
        digest: options.digest
      })
      
      return {
        success: true,
        message: '✅ 草稿已创建，请在公众号后台查看并发布',
        mediaId
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `❌ 发布失败: ${error}`
    }
  }
}

// 默认导出
export default {
  generateArticle,
  prepareArticleGeneration,
  handleGenerationRequest,
  convertToWechat,
  publishToWechat,
  loadConfig
}
