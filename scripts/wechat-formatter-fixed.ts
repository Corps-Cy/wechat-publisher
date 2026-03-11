/**
 * 微信公众号专用格式化器 - 修复版 v3
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
 * v3 修复：
 * - 列表：手动添加前缀（微信不支持 list-style）
 * - 代码块：减少行高，更紧凑
 * - 移除无意义的换行
 */

import { marked } from 'marked'
import hljs from 'highlight.js'
import { markedHighlight } from 'marked-highlight'

// 配置 marked
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
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
// 基础配置
// ============================================================================

export const DEFAULT_CONFIG = {
  fontFamily: '-apple-system-font, BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB, Microsoft YaHei UI, Microsoft YaHei, Arial, sans-serif',
  fontSize: '14px',
  codeBlockTheme: 'github-dark-dimmed',
  legend: 'title-alt',
  isMacCodeBlock: true,
  isShowLineNumber: true,
}

// ============================================================================
// 主题色配置
// ============================================================================

export const THEME_COLORS = {
  default: {
    name: '经典',
    primary: '#0F4C81',
    background: '#f0f5fa',
  },
  roseGold: {
    name: '熏衣紫',
    primary: '#8B7BA8',
    background: '#f5f0f8',
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
// github-dark-dimmed 语法高亮样式
// ============================================================================

function inlineHighlightStyles(html: string): string {
  const styles: Record<string, string> = {
    'hljs': 'color: #adbac7; background: #22272e;',
    'hljs-comment': 'color: #768390; font-style: italic;',
    'hljs-quote': 'color: #768390; font-style: italic;',
    'hljs-formula': 'color: #768390;',
    'hljs-keyword': 'color: #f47067; font-weight: bold;',
    'hljs-template-tag': 'color: #f47067;',
    'hljs-template-variable': 'color: #f47067;',
    'hljs-type': 'color: #f47067;',
    'hljs-variable.language_': 'color: #f47067;',
    'hljs-title': 'color: #dcbdfb;',
    'hljs-title.class_': 'color: #dcbdfb;',
    'hljs-title.class_.inherited__': 'color: #dcbdfb;',
    'hljs-title.function_': 'color: #dcbdfb;',
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
    'hljs-string': 'color: #96d0ff;',
    'hljs-regexp': 'color: #96d0ff;',
    'hljs-meta .hljs-string': 'color: #96d0ff;',
    'hljs-built_in': 'color: #f69d50;',
    'hljs-symbol': 'color: #f69d50;',
    'hljs-name': 'color: #8ddb8c;',
    'hljs-selector-pseudo': 'color: #8ddb8c;',
    'hljs-selector-tag': 'color: #8ddb8c;',
    'hljs-subst': 'color: #adbac7;',
    'hljs-section': 'color: #316dca; font-weight: bold;',
    'hljs-bullet': 'color: #eac55f;',
    'hljs-emphasis': 'font-style: italic;',
    'hljs-strong': 'font-weight: bold;',
    'hljs-addition': 'color: #b4f1b4; background-color: #1b4721;',
    'hljs-deletion': 'color: #ffd8d3; background-color: #78191b;',
    'hljs-code': 'color: #768390;',
    'hljs-params': 'color: #adbac7;',
  }
  
  for (const [className, style] of Object.entries(styles)) {
    const regex = new RegExp(`class="${className}"`, 'g')
    html = html.replace(regex, `class="${className}" style="${style}"`)
  }
  
  return html
}

// ============================================================================
// Mac 代码块生成
// ============================================================================

function generateMacCodeBlockHeader(): string {
  return `<div style="height: 30px; background: #1e2128; border-radius: 5px 5px 0 0; display: flex; align-items: center; padding-left: 12px;"><span style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56;"></span><span style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e; margin-left: 8px;"></span><span style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f; margin-left: 8px;"></span></div>`
}

/**
 * 为代码添加行号（紧凑版，减少行高）
 */
function addLineNumbers(code: string): string {
  const lines = code.split('\n')
  // 过滤掉最后的空行
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop()
  }
  
  const numberedLines = lines.map((line, index) => {
    const lineNum = index + 1
    // 紧凑的行高设置
    return `<div style="display: flex; line-height: 1.5;"><span style="min-width: 40px; padding-right: 10px; text-align: right; color: #768390; user-select: none; border-right: 1px solid #373e47; margin-right: 10px; font-size: 12.6px;">${lineNum}</span><span style="flex: 1; font-size: 12.6px; white-space: pre;">${line || ' '}</span></div>`
  }).join('')
  
  return numberedLines
}

// ============================================================================
// 列表处理（手动添加前缀）
// ============================================================================

/**
 * 处理列表，为微信手动添加前缀
 */
function processLists(html: string): string {
  // 处理无序列表
  let result = html.replace(/<ul>([\s\S]*?)<\/ul>/g, (match, content) => {
    let processedContent = content
    
    processedContent = processedContent.replace(/<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/g, (liMatch, liContent) => {
      const hasNestedList = /<[ou]l>/.test(liContent)
      
      const cleanContent = liContent
        .replace(/\n\s*\n/g, '\n')
        .replace(/^\s+|\s+$/g, '')
      
      if (hasNestedList) {
        return `<li style="margin: 0.2em 8px; color: #333;">${cleanContent}</li>`
      }
      
      return `<li style="margin: 0.2em 8px; color: #333;"><span style="margin-right: 8px; color: #333;">•</span>${cleanContent}</li>`
    })
    
    return `<ul style="list-style-type: none; padding-left: 0; margin-left: 0; color: #333;">${processedContent}</ul>`
  })
  
  // 处理有序列表
  result = result.replace(/<ol>([\s\S]*?)<\/ol>/g, (match, content) => {
    let processedContent = content
    let itemIndex = 0
    
    processedContent = processedContent.replace(/<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/g, (liMatch, liContent) => {
      itemIndex++
      const hasNestedList = /<[ou]l>/.test(liContent)
      
      const cleanContent = liContent
        .replace(/\n\s*\n/g, '\n')
        .replace(/^\s+|\s+$/g, '')
      
      if (hasNestedList) {
        return `<li style="margin: 0.2em 8px; color: #333;">${cleanContent}</li>`
      }
      
      return `<li style="margin: 0.2em 8px; color: #333;"><span style="margin-right: 8px; font-weight: bold; color: #333;">${itemIndex}.</span>${cleanContent}</li>`
    })
    
    return `<ol style="list-style-type: none; padding-left: 0; margin-left: 0; color: #333;">${processedContent}</ol>`
  })
  
  return result
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

export async function renderWechatFormat(
  markdown: string,
  themeKey: ThemeColorKey = 'default',
  removeTitle: boolean = true,
  options?: FormatOptions
): Promise<string> {
  const theme = THEME_COLORS[themeKey]
  const isMacCodeBlock = options?.isMacCodeBlock ?? DEFAULT_CONFIG.isMacCodeBlock
  const isShowLineNumber = options?.isShowLineNumber ?? DEFAULT_CONFIG.isShowLineNumber
  
  // 1. 解析 Markdown
  let html = await marked.parse(markdown) as string
  
  // 2. 为语法高亮添加内联样式
  html = inlineHighlightStyles(html)
  
  // 3. 定义样式
  const styles = {
    section: `padding: 20px 15px; font-size: ${DEFAULT_CONFIG.fontSize}; line-height: 1.75; color: #333; font-family: ${DEFAULT_CONFIG.fontFamily}; text-align: left;`,
    h1: `display: table; padding: 0 1em; border-bottom: 2px solid ${theme.primary}; margin: 2em auto 1em; font-size: 16.8px; font-weight: bold; text-align: center; color: #333;`,
    h2: `display: table; padding: 0 0.2em; margin: 4em auto 2em; background: ${theme.primary}; font-size: 16.8px; font-weight: bold; text-align: center; color: #fff;`,
    h3: `padding-left: 8px; border-left: 3px solid ${theme.primary}; margin: 2em 8px 0.75em 0; font-size: 15.4px; font-weight: bold; line-height: 1.2; color: #333;`,
    h4: `margin: 2em 8px 0.5em; font-size: 14px; font-weight: bold; color: ${theme.primary};`,
    p: `margin: 1.5em 8px; letter-spacing: 0.1em; color: #333;`,
    blockquote: `font-style: normal; padding: 1em; border-left: 4px solid ${theme.primary}; border-radius: 6px; color: #333; background: ${theme.background}; margin: 0 8px 1em;`,
    'blockquote p': `margin: 0; font-size: 14px; letter-spacing: 0.1em; color: #333;`,
    strong: `color: ${theme.primary}; font-weight: bold;`,
    em: `font-style: italic;`,
    codespan: `font-size: 12.6px; color: #d14; background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px;`,
    codeBlockWrapper: `margin: 10px 8px; border-radius: 5px; overflow: hidden; background: #22272e;`,
    pre: `margin: 0; padding: 16px; overflow-x: auto; background: #22272e;`,
    code: `color: #adbac7; font-size: 12.6px; line-height: 1.5; font-family: Menlo, Monaco, 'Courier New', monospace; background: transparent;`,
    'pre code': `color: #adbac7; font-size: 12.6px; background: transparent;`,
    table: `color: #333; border-collapse: collapse;`,
    th: `border: 1px solid #dfdfdf; padding: 0.25em 0.5em; font-weight: bold; background: rgba(0, 0, 0, 0.05);`,
    td: `border: 1px solid #dfdfdf; padding: 0.25em 0.5em;`,
    img: `display: block; max-width: 100%; margin: 0.1em auto 0.5em; border-radius: 4px;`,
    figcaption: `text-align: center; color: #888; font-size: 11.2px; margin-top: 0.5em;`,
    hr: `border-style: solid; border-width: 2px 0 0; border-color: rgba(0, 0, 0, 0.1); transform-origin: 0 0; transform: scale(1, 0.5); height: 0.4em; margin: 1.5em 0;`,
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
  
  // 5. 处理代码块（Mac 风格 + 行号 + 紧凑布局）
  html = html.replace(/<pre><code class="([^"]*)">([\s\S]*?)<\/code><\/pre>/g, (match, className, code) => {
    const decodedCode = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
    
    let codeContent = decodedCode
    if (isShowLineNumber) {
      codeContent = addLineNumbers(decodedCode)
    } else {
      const lines = decodedCode.split('\n')
      while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop()
      }
      codeContent = lines.map(line => 
        `<div style="line-height: 1.5; font-size: 12.6px; white-space: pre;">${line || ' '}</div>`
      ).join('')
    }
    
    const macHeader = isMacCodeBlock ? generateMacCodeBlockHeader() : ''
    
    if (isMacCodeBlock) {
      return `<section style="${styles.codeBlockWrapper}">${macHeader}<pre style="${styles.pre}"><code class="${className}" style="${styles['pre code']}">${codeContent}</code></pre></section>`
    } else {
      return `<pre style="${styles.pre}; border-radius: 5px;"><code class="${className}" style="${styles['pre code']}">${codeContent}</code></pre>`
    }
  })
  
  // 6. 处理行内代码
  html = html.replace(/<code>(?![^<]*<\/pre>)/g, `<code style="${styles.codespan}">`)
  
  // 7. 处理 Mermaid 图表
  html = html.replace(/<pre><code class="([^"]*)mermaid[^"]*">([\s\S]*?)<\/code><\/pre>/g, 
    (match, className, code) => {
      const decodedCode = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
      
      return `<figure style="margin: 1.5em 8px; padding: 20px; background: ${theme.background}; border-radius: 8px; text-align: center;"><div style="color: ${theme.primary}; font-size: 14px; margin-bottom: 10px;">📊 Mermaid 图表</div><pre style="background: #f6f8fa; padding: 15px; border-radius: 5px; text-align: left; overflow-x: auto; margin: 0;"><code style="color: #24292e; font-size: 12.6px;">${decodedCode}</code></pre><figcaption style="color: #888; font-size: 11.2px; margin-top: 10px;">请使用 AI 生成图表图片替换此占位符</figcaption></figure>`
    }
  )
  
  // 8. 处理 PlantUML 图表
  html = html.replace(/<pre><code class="([^"]*)plantuml[^"]*">([\s\S]*?)<\/code><\/pre>/g, 
    (match, className, code) => {
      const decodedCode = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
      
      return `<figure style="margin: 1.5em 8px; padding: 20px; background: ${theme.background}; border-radius: 8px; text-align: center;"><div style="color: ${theme.primary}; font-size: 14px; margin-bottom: 10px;">🔷 PlantUML 图表</div><pre style="background: #f6f8fa; padding: 15px; border-radius: 5px; text-align: left; overflow-x: auto; margin: 0;"><code style="color: #24292e; font-size: 12.6px;">${decodedCode}</code></pre><figcaption style="color: #888; font-size: 11.2px; margin-top: 10px;">请使用 AI 生成图表图片替换此占位符</figcaption></figure>`
    }
  )
  
  // 9. 处理 GFM 警告块
  html = html.replace(/<blockquote>\s*<p style="[^"]*">\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*<\/p>([\s\S]*?)<\/blockquote>/gi,
    (match, type, content) => {
      const alertConfig: Record<string, { icon: string; color: string; bg: string }> = {
        NOTE: { icon: 'ℹ️', color: '#478be6', bg: '#e8f4fd' },
        TIP: { icon: '💡', color: '#57ab5a', bg: '#e8f5e9' },
        IMPORTANT: { icon: '❗', color: '#986ee2', bg: '#f3e8fd' },
        WARNING: { icon: '⚠️', color: '#c69026', bg: '#fff8e6' },
        CAUTION: { icon: '🚫', color: '#e5534b', bg: '#fee' },
      }
      const config = alertConfig[type.toUpperCase()] || alertConfig.NOTE
      
      return `<blockquote style="margin: 15px 8px; padding: 15px 20px; background: ${config.bg}; border-left: 4px solid ${config.color}; border-radius: 6px;"><p style="margin: 0 0 8px 0; font-weight: bold; color: ${config.color}; font-size: 14px;"><span style="margin-right: 8px;">${config.icon}</span>${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}</p><div style="margin: 0; color: #333; font-size: 14px;">${content}</div></blockquote>`
    }
  )
  
  // 10. 处理数学公式
  html = html.replace(/\$([^$]+)\$/g, 
    (match, formula) => {
      return `<span style="font-family: 'Times New Roman', serif; font-style: italic; background: #f8f8f8; padding: 2px 6px; border-radius: 3px; color: #333;">${formula}</span>`
    }
  )
  html = html.replace(/\$\$([^$]+)\$\$/g,
    (match, formula) => {
      return `<section style="text-align: center; padding: 15px; background: #f8f8f8; border-radius: 5px; margin: 15px 8px; font-family: 'Times New Roman', serif; font-style: italic;">${formula}</section>`
    }
  )
  
  // 11. 处理列表（手动添加前缀）
  html = processLists(html)
  
  // 12. 处理表格
  html = html.replace(/<table>/g, `<table style="${styles.table}">`)
  html = html.replace(/<th>/g, `<th style="${styles.th}">`)
  html = html.replace(/<td>/g, `<td style="${styles.td}">`)
  
  // 13. 处理图片
  html = html.replace(/<img([^>]*)alt="([^"]*)"([^>]*)title="([^"]*)"([^>]*)\/>/g, 
    (match, before, alt, middle, title, after) => {
      return `<figure style="margin: 1.5em 8px;"><img${before}alt="${alt}"${middle}title="${title}"${after}style="${styles.img}"><figcaption style="${styles.figcaption}">${title}</figcaption></figure>`
    }
  )
  html = html.replace(/<img([^>]*)alt="([^"]*)"([^>]*)\/>/g, 
    (match, before, alt, after) => {
      if (match.includes('title=')) return match
      return `<img${before}alt="${alt}"${after}style="${styles.img}">`
    }
  )
  
  // 14. 处理分隔线
  html = html.replace(/<hr>/g, `<hr style="${styles.hr}">`)
  
  // 15. 移除 <h1> 标题
  if (removeTitle) {
    html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/g, '')
  }
  
  // 16. 清理多余空行
  html = html.replace(/\n\s*\n\s*\n/g, '\n\n')
  html = html.replace(/<p style="[^"]*">\s*<\/p>/g, '')
  
  // 17. 包裹在容器中
  const wechatHtml = `<section style="${styles.section}">${html}</section>`
  
  return wechatHtml
}
