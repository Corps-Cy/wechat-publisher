/**
 * 微信公众号专用格式化器 - 修复版 v2
 * 
 * 基于 doocs/md 最佳实践配置：
 * - 主题：经典 (default)
 * - 字体：无衬线
 * - 字号：14px（更小）
 * - 代码块主题：github-dark-dimmed
 * - 图注格式：title 优先
 * - Mac 代码块：开启
 * - 代码块行号：开启
 * 
 * 扩展支持：
 * - 数学公式（KaTeX）
 * - GFM 警告块
 * - Ruby 注音
 * - Mermaid 图表（转换为提示）
 * - PlantUML（转换为提示）
 */

import { marked } from 'marked'
import hljs from 'highlight.js'
import { markedHighlight } from 'marked-highlight'

// 配置 marked
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    // 跳过 mermaid 和 plantuml，不进行语法高亮
    if (lang === 'mermaid' || lang === 'plantuml') {
      return code
    }
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    try {
      return hljs.highlight(code, { language }).value
    } catch {
      return hljs.highlight(code, { language: 'plaintext' }).value
    }
  }
}))

// ============================================================================
// 基础配置（来自 doocs/md）
// ============================================================================

export const DEFAULT_CONFIG = {
  // 字体：无衬线
  fontFamily: '-apple-system-font, BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB, Microsoft YaHei UI, Microsoft YaHei, Arial, sans-serif',
  
  // 字号：14px（更小）
  fontSize: '14px',
  
  // 代码块主题：github-dark-dimmed
  codeBlockTheme: 'github-dark-dimmed',
  
  // 图注格式：title 优先
  legend: 'title-alt',
  
  // Mac 代码块：开启
  isMacCodeBlock: true,
  
  // 代码块行号：开启
  isShowLineNumber: true,
}

// ============================================================================
// 主题色配置
// ============================================================================

export const THEME_COLORS = {
  default: {
    name: '经典',
    primary: '#0F4C81',      // 经典蓝
    background: '#f0f5fa',
  },
  roseGold: {
    name: '玫瑰金',
    primary: '#92617E',
    background: '#f8f0f4',
  },
  classicBlue: {
    name: '经典蓝',
    primary: '#3585e0',
    background: '#ecf5ff',
  },
  jadeGreen: {
    name: '翡翠绿',
    primary: '#009874',
    background: '#e8f5f0',
  },
  vibrantOrange: {
    name: '活力橘',
    primary: '#FA5151',
    background: '#fff0f0',
  },
} as const

export type ThemeColorKey = keyof typeof THEME_COLORS

// ============================================================================
// github-dark-dimmed 语法高亮样式（完全内联）
// ============================================================================

/**
 * 为 highlight.js 生成的 span 标签添加内联样式
 * 参考 github-dark-dimmed 主题配色
 */
function inlineHighlightStyles(html: string): string {
  // github-dark-dimmed 配色方案
  const styles: Record<string, string> = {
    // 基础文字色
    'hljs': 'color: #adbac7; background: #22272e;',
    
    // 注释
    'hljs-comment': 'color: #768390; font-style: italic;',
    'hljs-quote': 'color: #768390; font-style: italic;',
    'hljs-formula': 'color: #768390;',
    
    // 关键字、类型
    'hljs-keyword': 'color: #f47067; font-weight: bold;',
    'hljs-template-tag': 'color: #f47067;',
    'hljs-template-variable': 'color: #f47067;',
    'hljs-type': 'color: #f47067;',
    'hljs-variable.language_': 'color: #f47067;',
    
    // 函数名、类名
    'hljs-title': 'color: #dcbdfb;',
    'hljs-title.class_': 'color: #dcbdfb;',
    'hljs-title.class_.inherited__': 'color: #dcbdfb;',
    'hljs-title.function_': 'color: #dcbdfb;',
    
    // 属性、数字、字面量
    'hljs-attr': 'color: #6cb6ff;',
    'hljs-attribute': 'color: #6cb6ff;',
    'hljs-literal': 'color: #6cb6ff;',
    'hljs-meta': 'color: #6cb6ff;',
    'hljs-number': 'color: #6cb6ff;',
    'hljs-operator': 'color: #6cb6ff;',
    'hljs-variable': 'color: #6cb6ff;',
    'hljs-selector-attr': 'color: #6cb6ff;',
    'hljs-selector-class': 'color: #6cb6ff;',
    'hljs-selector-id': 'color: #6cb6ff;',
    
    // 字符串
    'hljs-string': 'color: #96d0ff;',
    'hljs-regexp': 'color: #96d0ff;',
    'hljs-meta .hljs-string': 'color: #96d0ff;',
    
    // 内置函数、符号
    'hljs-built_in': 'color: #f69d50;',
    'hljs-symbol': 'color: #f69d50;',
    
    // 标签、名称
    'hljs-name': 'color: #8ddb8c;',
    'hljs-quote': 'color: #8ddb8c;',
    'hljs-selector-pseudo': 'color: #8ddb8c;',
    'hljs-selector-tag': 'color: #8ddb8c;',
    
    // 其他
    'hljs-subst': 'color: #adbac7;',
    'hljs-section': 'color: #316dca; font-weight: bold;',
    'hljs-bullet': 'color: #eac55f;',
    
    // 强调
    'hljs-emphasis': 'font-style: italic;',
    'hljs-strong': 'font-weight: bold;',
    
    // 添加/删除
    'hljs-addition': 'color: #b4f1b4; background-color: #1b4721;',
    'hljs-deletion': 'color: #ffd8d3; background-color: #78191b;',
    
    // 代码
    'hljs-code': 'color: #768390;',
    
    // 参数
    'hljs-params': 'color: #adbac7;',
  }
  
  // 为每个 hljs class 添加内联样式
  for (const [className, style] of Object.entries(styles)) {
    const regex = new RegExp(`class="${className}"`, 'g')
    html = html.replace(regex, `class="${className}" style="${style}"`)
  }
  
  return html
}

// ============================================================================
// Mac 代码块生成
// ============================================================================

/**
 * 生成 Mac 风格代码块头部
 */
function generateMacCodeBlockHeader(): string {
  return `<div style="height: 30px; background: #1e2128; border-radius: 5px 5px 0 0; position: relative; display: flex; align-items: center; padding-left: 12px;">
  <span style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
  <span style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e; display: inline-block; margin-left: 8px;"></span>
  <span style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f; display: inline-block; margin-left: 8px;"></span>
</div>`
}

/**
 * 为代码添加行号
 */
function addLineNumbers(code: string): string {
  const lines = code.split('\n')
  const numberedLines = lines.map((line, index) => {
    const lineNum = index + 1
    return `<div style="display: flex; min-height: 21px;">
  <span style="min-width: 40px; padding-right: 10px; text-align: right; color: #768390; user-select: none; border-right: 1px solid #373e47; margin-right: 10px; font-size: 12.6px;">${lineNum}</span>
  <span style="flex: 1; font-size: 12.6px;">${line || ' '}</span>
</div>`
  }).join('\n')
  
  return numberedLines
}

// ============================================================================
// 主函数
// ============================================================================

export interface FormatOptions {
  theme?: ThemeColorKey
  removeTitle?: boolean
  isMacCodeBlock?: boolean
  isShowLineNumber?: boolean
}

/**
 * 转换 Markdown 为微信公众号专用 HTML
 * @param markdown Markdown 文本
 * @param themeKey 主题色
 * @param removeTitle 是否移除 <h1> 标题（默认 true）
 * @param options 格式化选项
 */
export async function renderWechatFormat(
  markdown: string,
  themeKey: ThemeColorKey = 'default',
  removeTitle: boolean = true,
  options?: FormatOptions
): Promise<string> {
  const theme = THEME_COLORS[themeKey]
  const isMacCodeBlock = options?.isMacCodeBlock ?? DEFAULT_CONFIG.isMacCodeBlock
  const isShowLineNumber = options?.isShowLineNumber ?? DEFAULT_CONFIG.isShowLineNumber
  
  // 1. 解析 Markdown（带语法高亮）
  let html = await marked.parse(markdown) as string
  
  // 2. 为语法高亮添加内联样式
  html = inlineHighlightStyles(html)
  
  // 3. 定义样式（基于 doocs/md 经典主题 + 14px 字号）
  const styles = {
    // 容器：14px 字号
    section: `padding: 20px 15px; font-size: ${DEFAULT_CONFIG.fontSize}; line-height: 1.75; color: #333; font-family: ${DEFAULT_CONFIG.fontFamily}; text-align: left;`,
    
    // H1：居中 + 底部边框
    h1: `display: table; padding: 0 1em; border-bottom: 2px solid ${theme.primary}; margin: 2em auto 1em; font-size: 16.8px; font-weight: bold; text-align: center; color: #333;`,
    
    // H2：居中 + 主题色背景
    h2: `display: table; padding: 0 0.2em; margin: 4em auto 2em; background: ${theme.primary}; font-size: 16.8px; font-weight: bold; text-align: center; color: #fff;`,
    
    // H3：左边框
    h3: `padding-left: 8px; border-left: 3px solid ${theme.primary}; margin: 2em 8px 0.75em 0; font-size: 15.4px; font-weight: bold; line-height: 1.2; color: #333;`,
    
    // H4：主题色文字
    h4: `margin: 2em 8px 0.5em; font-size: 14px; font-weight: bold; color: ${theme.primary};`,
    
    // 段落
    p: `margin: 1.5em 8px; letter-spacing: 0.1em; color: #333;`,
    
    // 引用块
    blockquote: `font-style: normal; padding: 1em; border-left: 4px solid ${theme.primary}; border-radius: 6px; color: #333; background: ${theme.background}; margin: 0 8px 1em;`,
    'blockquote p': `margin: 0; font-size: 14px; letter-spacing: 0.1em; color: #333;`,
    
    // 强调
    strong: `color: ${theme.primary}; font-weight: bold;`,
    em: `font-style: italic;`,
    
    // 行内代码
    codespan: `font-size: 12.6px; color: #d14; background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px;`,
    
    // 代码块容器（Mac 风格）
    codeBlockWrapper: `margin: 10px 8px; border-radius: 5px; overflow: hidden; background: #22272e;`,
    
    // 代码块（github-dark-dimmed）
    pre: `margin: 0; padding: 16px; overflow-x: auto; background: #22272e;`,
    code: `color: #adbac7; font-size: 12.6px; line-height: 1.5; font-family: Menlo, Monaco, 'Courier New', monospace; background: transparent;`,
    'pre code': `color: #adbac7; font-size: 12.6px; background: transparent;`,
    
    // 列表（doocs/md 原版样式）
    // ⚠️ 注意：list-style 在浏览器预览中生效，微信公众号可能不生效
    // 但这个样式在微信中也能正常显示（可能是微信白名单支持）
    ul: `list-style: circle; padding-left: 1em; margin-left: 0; color: #333;`,
    ol: `padding-left: 1em; margin-left: 0; color: #333;`,
    li: `display: block; margin: 0.2em 8px; color: #333;`,
    
    // 表格
    table: `color: #333; border-collapse: collapse;`,
    th: `border: 1px solid #dfdfdf; padding: 0.25em 0.5em; font-weight: bold; background: rgba(0, 0, 0, 0.05);`,
    td: `border: 1px solid #dfdfdf; padding: 0.25em 0.5em;`,
    
    // 图片
    img: `display: block; max-width: 100%; margin: 0.1em auto 0.5em; border-radius: 4px;`,
    
    // 图注
    figcaption: `text-align: center; color: #888; font-size: 11.2px; margin-top: 0.5em;`,
    
    // 分隔线
    hr: `border-style: solid; border-width: 2px 0 0; border-color: rgba(0, 0, 0, 0.1); transform-origin: 0 0; transform: scale(1, 0.5); height: 0.4em; margin: 1.5em 0;`,
    
    // 链接
    a: `color: #576b95; text-decoration: none;`,
  }
  
  // 4. 应用样式到 HTML 元素
  html = html.replace(/<h1>/g, `<h1 style="${styles.h1}">`)
  html = html.replace(/<h2>/g, `<h2 style="${styles.h2}">`)
  html = html.replace(/<h3>/g, `<h3 style="${styles.h3}">`)
  html = html.replace(/<h4>/g, `<h4 style="${styles.h4}">`)
  html = html.replace(/<p>/g, `<p style="${styles.p}">`)
  html = html.replace(/<blockquote>/g, `<blockquote style="${styles.blockquote}">`)
  html = html.replace(/<strong>/g, `<strong style="${styles.strong}">`)
  html = html.replace(/<em>/g, `<em style="${styles.em}">`)
  html = html.replace(/<a /g, `<a style="${styles.a}" `)
  
  // 5. 处理代码块（Mac 风格 + 行号 + github-dark-dimmed 主题）
  html = html.replace(/<pre><code class="([^"]*)">([\s\S]*?)<\/code><\/pre>/g, (match, className, code) => {
    // 解码 HTML 实体
    const decodedCode = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
    
    // 添加行号
    let codeContent = decodedCode
    if (isShowLineNumber) {
      codeContent = addLineNumbers(decodedCode)
    } else {
      codeContent = decodedCode.split('\n').map(line => 
        `<div style="min-height: 21px; font-size: 12.6px;">${line || ' '}</div>`
      ).join('\n')
    }
    
    // Mac 风格头部
    const macHeader = isMacCodeBlock ? generateMacCodeBlockHeader() : ''
    
    // 组装代码块
    if (isMacCodeBlock) {
      return `<section style="${styles.codeBlockWrapper}">
  ${macHeader}
  <pre style="${styles.pre}"><code class="${className}" style="${styles['pre code']}">${codeContent}</code></pre>
</section>`
    } else {
      return `<pre style="${styles.pre}; border-radius: 5px;"><code class="${className}" style="${styles['pre code']}">${codeContent}</code></pre>`
    }
  })
  
  // 6. 处理行内代码（不在 <pre> 内的 <code>）
  html = html.replace(/<code>(?![^<]*<\/pre>)/g, `<code style="${styles.codespan}">`)
  
  // 7. 处理 Mermaid 图表（转换为图片占位符提示）
  html = html.replace(/<pre><code class="([^"]*)mermaid[^"]*">([\s\S]*?)<\/code><\/pre>/g, 
    (match, className, code) => {
      const decodedCode = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
      
      // 生成图片占位符
      return `<figure style="margin: 1.5em 8px; padding: 20px; background: ${theme.background}; border-radius: 8px; text-align: center;">
  <div style="color: ${theme.primary}; font-size: 14px; margin-bottom: 10px;">📊 Mermaid 图表</div>
  <pre style="background: #f6f8fa; padding: 15px; border-radius: 5px; text-align: left; overflow-x: auto; margin: 0;"><code style="color: #24292e; font-size: 12.6px;">${decodedCode}</code></pre>
  <figcaption style="color: #888; font-size: 11.2px; margin-top: 10px;">请使用 AI 生成图表图片替换此占位符</figcaption>
</figure>`
    }
  )
  
  // 8. 处理 PlantUML 图表（转换为图片占位符提示）
  html = html.replace(/<pre><code class="([^"]*)plantuml[^"]*">([\s\S]*?)<\/code><\/pre>/g, 
    (match, className, code) => {
      const decodedCode = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
      
      return `<figure style="margin: 1.5em 8px; padding: 20px; background: ${theme.background}; border-radius: 8px; text-align: center;">
  <div style="color: ${theme.primary}; font-size: 14px; margin-bottom: 10px;">🔷 PlantUML 图表</div>
  <pre style="background: #f6f8fa; padding: 15px; border-radius: 5px; text-align: left; overflow-x: auto; margin: 0;"><code style="color: #24292e; font-size: 12.6px;">${decodedCode}</code></pre>
  <figcaption style="color: #888; font-size: 11.2px; margin-top: 10px;">请使用 AI 生成图表图片替换此占位符</figcaption>
</figure>`
    }
  )
  
  // 9. 处理 GFM 警告块（alert）
  // > [!NOTE] 内容 -> 带图标的提示框
  html = html.replace(/<blockquote>\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*<\/p>([\s\S]*?)<\/blockquote>/gi,
    (match, type, content) => {
      const alertConfig: Record<string, { icon: string; color: string; bg: string }> = {
        NOTE: { icon: 'ℹ️', color: '#478be6', bg: '#e8f4fd' },
        TIP: { icon: '💡', color: '#57ab5a', bg: '#e8f5e9' },
        IMPORTANT: { icon: '❗', color: '#986ee2', bg: '#f3e8fd' },
        WARNING: { icon: '⚠️', color: '#c69026', bg: '#fff8e6' },
        CAUTION: { icon: '🚫', color: '#e5534b', bg: '#fee' },
      }
      const config = alertConfig[type.toUpperCase()] || alertConfig.NOTE
      
      return `<blockquote style="margin: 15px 8px; padding: 15px 20px; background: ${config.bg}; border-left: 4px solid ${config.color}; border-radius: 6px;">
  <p style="margin: 0 0 8px 0; font-weight: bold; color: ${config.color}; font-size: 14px;">
    <span style="margin-right: 8px;">${config.icon}</span>${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
  </p>
  <div style="margin: 0; color: #333; font-size: 14px;">${content}</div>
</blockquote>`
    }
  )
  
  // 10. 处理 Ruby 注音（[文字]{注音} 或 [文字]^(注音)）
  // 这需要在 Markdown 解析前处理，但 marked 可能已经处理过了
  // 这里处理已转换的 ruby 标签，添加样式
  html = html.replace(/<ruby data-text="([^"]*)" data-ruby="([^"]*)"[^>]*>(.*?)<\/ruby>/g,
    (match, text, ruby, content) => {
      return `<ruby style="ruby-position: over;">${content}<rp style="color: #888;">(</rp><rt style="font-size: 0.7em; color: ${theme.primary};">${ruby}</rt><rp>)</rp></ruby>`
    }
  )
  
  // 11. 处理数学公式（简单的视觉处理）
  // 行内公式 $...$ 或 \(...\)
  html = html.replace(/\$([^$]+)\$/g, 
    (match, formula) => {
      return `<span style="font-family: 'Times New Roman', serif; font-style: italic; background: #f8f8f8; padding: 2px 6px; border-radius: 3px; color: #333;">${formula}</span>`
    }
  )
  // 块级公式 $$...$$ 或 \[...\]
  html = html.replace(/\$\$([^$]+)\$\$/g,
    (match, formula) => {
      return `<section style="text-align: center; padding: 15px; background: #f8f8f8; border-radius: 5px; margin: 15px 8px; font-family: 'Times New Roman', serif; font-style: italic;">
  ${formula}
</section>`
    }
  )
  
  // 12. 处理列表（doocs/md 原版样式）
  html = html.replace(/<ul>/g, `<ul style="${styles.ul}">`)
  html = html.replace(/<ol>/g, `<ol style="${styles.ol}">`)
  html = html.replace(/<li>/g, `<li style="${styles.li}">`)
  
  // 13. 处理表格
  html = html.replace(/<table>/g, `<table style="${styles.table}">`)
  html = html.replace(/<thead>/g, `<thead>`)
  html = html.replace(/<th>/g, `<th style="${styles.th}">`)
  html = html.replace(/<td>/g, `<td style="${styles.td}">`)
  
  // 14. 处理图片（添加图注支持）
  html = html.replace(/<img([^>]*)alt="([^"]*)"([^>]*)title="([^"]*)"([^>]*)\/>/g, 
    (match, before, alt, middle, title, after) => {
      return `<figure style="margin: 1.5em 8px;">
  <img${before}alt="${alt}"${middle}title="${title}"${after}style="${styles.img}">
  <figcaption style="${styles.figcaption}">${title}</figcaption>
</figure>`
    }
  )
  html = html.replace(/<img([^>]*)alt="([^"]*)"([^>]*)\/>/g, 
    (match, before, alt, after) => {
      if (match.includes('title=')) return match // 已经处理过
      return `<img${before}alt="${alt}"${after}style="${styles.img}">`
    }
  )
  
  // 15. 处理分隔线
  html = html.replace(/<hr>/g, `<hr style="${styles.hr}">`)
  
  // 16. 移除 <h1> 标题（公众号编辑器已有标题字段，避免重复）
  if (removeTitle) {
    html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/g, '')
  }
  
  // 17. 包裹在容器中
  const wechatHtml = `<section style="${styles.section}">
${html}
</section>`
  
  return wechatHtml
}

// 导出配置供其他模块使用（已在文件顶部声明）
