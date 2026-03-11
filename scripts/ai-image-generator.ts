/**
 * AI 文生图工具
 * 
 * 使用 doocs/md 提供的免费 AI 代理服务
 * 支持多种模型：Kolors、DALL-E 等
 */

import { writeFileSync } from 'fs'
import { join } from 'path'

// ============================================================================
// 配置
// ============================================================================

export interface AIImageConfig {
  endpoint: string
  model: string
  apiKey?: string  // 内置服务不需要
}

// 默认使用 doocs 内置免费服务
export const DEFAULT_IMAGE_CONFIG: AIImageConfig = {
  endpoint: 'https://proxy-ai.doocs.org/v1',
  model: 'Kwai-Kolors/Kolors',
}

// 可用的图片模型
export const IMAGE_MODELS = {
  // 免费模型（通过 doocs 代理）
  kolors: {
    name: 'Kolors（免费）',
    model: 'Kwai-Kolors/Kolors',
    endpoint: 'https://proxy-ai.doocs.org/v1',
  },
  
  // 硅基流动（需要 API Key）
  siliconflow_qwen: {
    name: 'Qwen-Image',
    model: 'Qwen/Qwen-Image',
    endpoint: 'https://api.siliconflow.cn/v1',
  },
  
  // OpenAI（需要 API Key）
  dall_e_3: {
    name: 'DALL-E 3',
    model: 'dall-e-3',
    endpoint: 'https://api.openai.com/v1',
  },
} as const

export type ImageModelKey = keyof typeof IMAGE_MODELS

// ============================================================================
// 图片生成
// ============================================================================

export interface ImageGenerationOptions {
  prompt: string
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  n?: number
  model?: ImageModelKey
}

export interface ImageGenerationResult {
  url: string
  revisedPrompt?: string
  localPath?: string
}

/**
 * 使用 AI 生成图片
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const modelConfig = IMAGE_MODELS[options.model || 'kolors']
  
  console.log(`🎨 生成图片: ${options.prompt.substring(0, 50)}...`)
  console.log(`   模型: ${modelConfig.name}`)
  
  try {
    const response = await fetch(`${modelConfig.endpoint}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 内置服务不需要 API Key
        ...(process.env.OPENAI_API_KEY && {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }),
      },
      body: JSON.stringify({
        model: modelConfig.model,
        prompt: options.prompt,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        n: options.n || 1,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`AI 图片生成失败: ${response.status} - ${error}`)
    }

    const data = await response.json() as any
    
    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url
      const revisedPrompt = data.data[0].revised_prompt
      
      console.log(`✅ 图片生成成功`)
      console.log(`   URL: ${imageUrl}\n`)
      
      return {
        url: imageUrl,
        revisedPrompt,
      }
    }
    
    throw new Error('未返回图片 URL')
  } catch (error) {
    console.error(`❌ 图片生成失败: ${error}\n`)
    throw error
  }
}

/**
 * 生成并下载图片到本地
 */
export async function generateAndSaveImage(
  options: ImageGenerationOptions,
  outputPath: string
): Promise<ImageGenerationResult> {
  const result = await generateImage(options)
  
  // 下载图片
  const imageResponse = await fetch(result.url)
  if (!imageResponse.ok) {
    throw new Error(`下载图片失败: ${imageResponse.status}`)
  }
  
  const buffer = Buffer.from(await imageResponse.arrayBuffer())
  writeFileSync(outputPath, buffer)
  
  result.localPath = outputPath
  console.log(`✅ 图片已保存: ${outputPath}\n`)
  
  return result
}

/**
 * 智能生成封面图片
 * 根据文章标题自动生成合适的封面
 */
export async function generateCoverImage(
  title: string,
  description?: string
): Promise<ImageGenerationResult> {
  // 构建提示词
  const prompt = buildCoverPrompt(title, description)
  
  console.log(`📝 生成封面提示词: ${prompt}\n`)
  
  return generateImage({
    prompt,
    size: '1792x1024',  // 横版封面
    quality: 'standard',
    model: 'kolors',
  })
}

/**
 * 构建封面图片提示词
 */
function buildCoverPrompt(title: string, description?: string): string {
  // 根据标题关键词判断主题
  const techKeywords = ['技术', '开发', '编程', '代码', 'AI', '人工智能', '教程', '安装', '部署']
  const businessKeywords = ['商业', '产品', '营销', '运营', '增长', '用户']
  
  const isTech = techKeywords.some(kw => title.includes(kw))
  const isBusiness = businessKeywords.some(kw => title.includes(kw))
  
  // 根据主题构建提示词
  let style = ''
  if (isTech) {
    style = 'modern technology style, clean code aesthetic, minimalist design, blue and white color scheme, futuristic, digital art'
  } else if (isBusiness) {
    style = 'professional business style, corporate aesthetic, modern design, warm colors, clean and elegant'
  } else {
    style = 'elegant illustration style, modern design, soft colors, clean composition, artistic'
  }
  
  const prompt = `${title}. ${description || ''}. ${style}. High quality, professional, suitable for WeChat article cover.`
  
  return prompt.substring(0, 1000)  // 限制长度
}

/**
 * 生成文章配图
 */
export async function generateArticleImage(
  topic: string,
  context?: string
): Promise<ImageGenerationResult> {
  const prompt = `${topic}. ${context || ''}. Clean, modern illustration style. High quality, suitable for blog post.`
  
  return generateImage({
    prompt,
    size: '1024x1024',
    quality: 'standard',
    model: 'kolors',
  })
}

// ============================================================================
// 批量生成
// ============================================================================

/**
 * 批量生成配图
 */
export async function generateMultipleImages(
  prompts: string[]
): Promise<ImageGenerationResult[]> {
  console.log(`🎨 批量生成 ${prompts.length} 张图片...\n`)
  
  const results: ImageGenerationResult[] = []
  
  for (let i = 0; i < prompts.length; i++) {
    console.log(`[${i + 1}/${prompts.length}]`)
    
    try {
      const result = await generateImage({
        prompt: prompts[i],
        model: 'kolors',
      })
      results.push(result)
      
      // 避免请求过快
      if (i < prompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (error) {
      console.error(`图片 ${i + 1} 生成失败，跳过`)
      results.push({ url: '' })
    }
  }
  
  return results
}

// ============================================================================
// CLI 使用
// ============================================================================

// 如果直接运行
if (process.argv[1].includes('ai-image-generator.ts')) {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('AI 图片生成工具')
    console.log('')
    console.log('用法:')
    console.log('  npx tsx ai-image-generator.ts "提示词"')
    console.log('  npx tsx ai-image-generator.ts --cover "文章标题"')
    console.log('  npx tsx ai-image-generator.ts --batch "提示词1" "提示词2" "提示词3"')
    console.log('')
    console.log('选项:')
    console.log('  --cover     生成封面图片')
    console.log('  --batch     批量生成')
    console.log('  --model     指定模型 (kolors|dall_e_3)')
    console.log('')
    console.log('示例:')
    console.log('  npx tsx ai-image-generator.ts "一只可爱的猫咪在编程"')
    console.log('  npx tsx ai-image-generator.ts --cover "OpenClaw 安装教程"')
    process.exit(0)
  }
  
  const isCover = args.includes('--cover')
  const isBatch = args.includes('--batch')
  const modelIndex = args.indexOf('--model')
  const model = modelIndex > -1 ? args[modelIndex + 1] as ImageModelKey : 'kolors'
  
  if (isCover) {
    const title = args[args.indexOf('--cover') + 1]
    generateCoverImage(title).then(result => {
      console.log('封面图片:', result.url)
    })
  } else if (isBatch) {
    const prompts = args.slice(args.indexOf('--batch') + 1)
    generateMultipleImages(prompts).then(results => {
      results.forEach((r, i) => {
        console.log(`图片 ${i + 1}:`, r.url)
      })
    })
  } else {
    const prompt = args[0]
    generateImage({ prompt, model: model as ImageModelKey }).then(result => {
      console.log('图片 URL:', result.url)
    })
  }
}
