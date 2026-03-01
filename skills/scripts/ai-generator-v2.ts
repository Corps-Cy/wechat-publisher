/**
 * AI 文章生成器 V2
 * 
 * 优化版：更精炼、更深度、支持图文并茂
 */

import type { PublisherConfig } from './config.js'

export interface GenerationOptions {
  topic: string
  style?: string
  length?: number
  tone?: 'professional' | 'casual' | 'storytelling' | 'educational'
  includeImages?: boolean  // 是否包含配图
  mode?: 'concise' | 'detailed' | 'deep'  // 简练/详细/深度
  hotTopic?: string    // 结合热点
  seriesInfo?: {       // 系列文章
    name: string
    part: number
    total: number
  }
}

// 语气模板（优化版 - 更精炼）
const TONE_TEMPLATES = {
  professional: {
    style: '专业深度、数据驱动、案例分析',
    instruction: '使用具体数据、行业案例、技术细节，避免空泛描述。每个观点都要有支撑依据。'
  },
  casual: {
    style: '轻松幽默、通俗易懂、接地气',
    instruction: '用日常语言解释复杂概念，适当使用比喻和类比，让读者有代入感。'
  },
  storytelling: {
    style: '故事化叙述、场景化表达',
    instruction: '通过具体场景和故事展开，让读者身临其境。避免说教，用故事传递观点。'
  },
  educational: {
    style: '教程性质、步骤清晰、实用性强',
    instruction: '提供可操作的步骤、代码示例、实操指南。重点在"怎么做"而非"是什么"。'
  }
}

// 文章结构模板（优化版 - 更紧凑）
const STRUCTURE_TEMPLATES = {
  concise: {
    name: '精简版（800-1200字）',
    structure: `
1. 开篇（100字）：用一个数据/案例/问题直接切入主题
2. 核心观点1（300字）：最关键的发现/趋势 + 具体案例
3. 核心观点2（300字）：另一个重要发现 + 实际应用
4. 实操建议（200字）：读者可以立即采取的行动
5. 结尾（100字）：一句话总结 + 引导互动
`,
    tips: '删除所有废话，每句话都要有价值。避免"随着...的发展"等套话。'
  },
  detailed: {
    name: '详细版（1500-2000字）',
    structure: `
1. 开篇（150字）：用具体案例或数据引入主题，建立紧迫感
2. 背景分析（300字）：现状如何？问题在哪？用数据说话
3. 核心观点1（400字）：深入分析 + 案例支撑 + 数据验证
4. 核心观点2（400字）：不同角度的分析 + 对比案例
5. 实操指南（350字）：具体步骤、工具推荐、注意事项
6. 未来展望（200字）：接下来的趋势预测
7. 结尾（150字）：总结 + 行动号召
`,
    tips: '每个章节要有明确的小标题，段落之间逻辑清晰，避免重复。'
  },
  deep: {
    name: '深度分析版（2500-3000字）',
    structure: `
1. 开篇（200字）：用一个反直觉的观点或震撼的数据开场
2. 深度背景（400字）：行业全貌、关键数据、核心矛盾
3. 深度分析1（600字）：多层分析（表象→原因→本质）
   - 现象描述
   - 深层原因
   - 数据支撑
   - 专家观点
4. 深度分析2（600字）：另一维度的分析
   - 对比视角
   - 历史演进
   - 案例研究
5. 实战应用（500字）：具体场景、操作步骤、工具方法
6. 前瞻预测（400字）：3-5年趋势、机会与风险
7. 结尾（200字）：核心洞察 + 行动建议
`,
    tips: '深度分析要有独到见解，不是简单罗列信息。使用"第一性原理"思考。'
  }
}

// 精炼化指令
const QUALITY_INSTRUCTIONS = `
【写作质量要求】

❌ 禁止使用的废话：
- "随着科技的快速发展..."
- "众所周知..."
- "不言而喻..."
- "总而言之..."
- "综上所述..."
- 大段的背景介绍和铺垫

✅ 必须做到：
1. **开头直接入题**：第一句话就要抓住眼球
   - ❌ "人工智能技术在近年来发展迅速..."
   - ✅ "OpenAI 最新发布的 GPT-5，训练成本降低了 90%，但性能提升了 3 倍。"

2. **用数据说话**：每个观点都要有支撑
   - ❌ "AI 提高了效率"
   - ✅ "AI 让代码编写速度提升 55%，bug 减少 38%（来源：GitHub 2025报告）"

3. **具体案例**：抽象概念要落地
   - ❌ "智能体应用广泛"
   - ✅ "比如 Cursor AI，它能理解整个代码库，自动重构低效代码，开发效率提升 10 倍"

4. **可操作建议**：读者看完知道怎么做
   - ❌ "我们要拥抱 AI"
   - ✅ "第一步：选择一个 AI 编程助手（如 Cursor/Continue）；第二步：用它重构你当前项目的 3 个模块..."

5. **精炼表达**：能用 1 句话不用 2 句
   - ❌ 3 段话解释一个概念
   - ✅ 1 句话 + 1 个案例 + 1 个数据

【段落结构】
每段遵循：观点 → 案例/数据 → 分析（可选）

【配图建议】
在以下位置自动插入配图：
- 核心概念处：添加概念图
- 数据对比处：添加图表
- 实操步骤处：添加流程图
- 案例分析处：添加示意图
`

// 生成高质量 prompt
export function buildGenerationPrompt(
  options: GenerationOptions,
  config: PublisherConfig
): string {
  const {
    topic,
    tone = 'professional',
    mode = 'concise',
    includeImages = true,
    hotTopic,
    seriesInfo
  } = options

  const toneConfig = TONE_TEMPLATES[tone]
  const structureConfig = STRUCTURE_TEMPLATES[mode]

  let prompt = `你是一位资深科技媒体主编，擅长撰写深度、精炼、有洞见的技术文章。

【文章主题】
${topic}

【文章要求】

1. **风格**：${toneConfig.style}
   ${toneConfig.instruction}

2. **结构**：${structureConfig.name}
${structureConfig.structure}

3. **质量控制**：
${QUALITY_INSTRUCTIONS}
${structureConfig.tips}

4. **字数控制**：
   - 精简版：800-1200字（当前模式）
   - 详细版：1500-2000字
   - 深度版：2500-3000字

5. **配图标记**（${includeImages ? '启用' : '禁用'}）：
${includeImages ? `
在需要配图的地方，使用以下格式标记：
![配图说明](IMAGE_PLACEHOLDER:描述)
例如：
![AI 架构图](IMAGE_PLACEHOLDER:一个展示大模型架构的示意图，包含输入层、处理层、输出层)
![数据趋势图](IMAGE_PLACEHOLDER:柱状图，展示 AI 市场规模从 2023 到 2026 的增长趋势，数据依次为 150亿、280亿、520亿、980亿美元)
` : '不插入配图标记'}

6. **Markdown 格式要求**：
   - 使用 ## 作为章节标题（不要用 #）
   - 重要观点用 **加粗**
   - 数据用 \`代码格式\` 标注
   - 引用数据要标注来源
   - 适当使用 > 引用块强调重点

${hotTopic ? `7. **结合热点**：
将以下热点自然融入文章：${hotTopic}
不要生硬插入，要有机融合。` : ''}

${seriesInfo ? `8. **系列文章**：
这是《${seriesInfo.name}》系列的第 ${seriesInfo.part}/${seriesInfo.total} 篇。
开头简短回顾前文，结尾预告下一篇。` : ''}

【特别提醒】
- 开头不要铺垫，直接用最吸引人的观点/数据/案例入场
- 每段要有明确观点，避免泛泛而谈
- 使用具体案例和数据，而不是抽象概念
- 给出可操作的建议，而不是空洞的总结
- 精炼！精炼！精炼！删除所有不增加价值的句子

现在请生成文章（使用 Markdown 格式）：`

  return prompt
}

// 从 Markdown 中提取标题
export function extractTitle(markdown: string): string | null {
  const lines = markdown.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('# ')) {
      return trimmed.replace(/^#\s+/, '').trim()
    }
  }
  
  return null
}

// 生成文章摘要（从第一段提取）
export function generateSummary(markdown: string, maxLength: number = 120): string {
  const lines = markdown.split('\n')
  const contentLines = lines.filter(line => {
    const trimmed = line.trim()
    return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('!')
  })
  
  if (contentLines.length > 0) {
    const firstParagraph = contentLines[0].trim()
    return firstParagraph.length > maxLength
      ? firstParagraph.substring(0, maxLength) + '...'
      : firstParagraph
  }
  
  return ''
}

// 提取关键词
export function extractKeywords(markdown: string): string[] {
  const words = markdown.toLowerCase()
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
  
  const wordCount: Record<string, number> = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })
  
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
}

// 提取配图占位符
export function extractImagePlaceholders(markdown: string): Array<{
  placeholder: string
  description: string
  alt: string
}> {
  const regex = /!\[([^\]]+)\]\(IMAGE_PLACEHOLDER:([^)]+)\)/g
  const images: Array<{ placeholder: string; description: string; alt: string }> = []
  
  let match
  while ((match = regex.exec(markdown)) !== null) {
    images.push({
      placeholder: match[0],
      alt: match[1],
      description: match[2]
    })
  }
  
  return images
}

export { TONE_TEMPLATES, STRUCTURE_TEMPLATES }
