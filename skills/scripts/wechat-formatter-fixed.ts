/**
 * 微信公众号专用格式化器 - 修复版
 * 
 * 核心修复：
 * 1. 代码块语法高亮样式完全内联（不依赖外部 CSS）
 * 2. 确保文字和背景对比度足够
 * 3. 参考微信公众号编辑器的实际效果
 */

import { marked } from 'marked'
import hljs from 'highlight.js'
import { markedHighlight } from 'marked-highlight'

// 配置 marked
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    try {
      return hljs.highlight(code, { language }).value
    } catch {
      return hljs.highlight(code, { language: 'plaintext' }).value
    }
  }
}))

// ============================================================================
// 主题色配置（确保对比度）
// ============================================================================

export const THEME_COLORS = {
  roseGold: {
    name: '玫瑰金',
    primary: '#92617E',
    secondary: '#7a4f6a',
    background: '#f8f0f4',
    codeBackground: '#f5f5f5',  // 浅灰背景，不使用主题色
    codeText: '#24292e',        // GitHub 风格深灰文字
    codeBlockBg: '#f6f8fa',     // GitHub 风格浅灰背景
    inlineCodeBg: '#f8f0f4',    // 行内代码使用主题背景
    inlineCodeText: '#92617E'   // 行内代码使用主题色
  },
  classicBlue: {
    name: '经典蓝',
    primary: '#3585e0',
    secondary: '#1e6fcc',
    background: '#ecf5ff',
    codeBackground: '#f5f5f5',
    codeText: '#24292e',
    codeBlockBg: '#f6f8fa',
    inlineCodeBg: '#ecf5ff',
    inlineCodeText: '#3585e0'
  },
  // ... 其他主题类似配置
} as const

export type ThemeColorKey = keyof typeof THEME_COLORS

// ============================================================================
// Highlight.js 语法高亮样式（完全内联）
// ============================================================================

/**
 * 为 highlight.js 生成的 span 标签添加内联样式
 * 参考 GitHub、VS Code 的配色方案
 */
function inlineHighlightStyles(html: string): string {
  // GitHub 风格的语法高亮配色
  const styles: Record<string, string> = {
    // 注释
    'hljs-comment': 'color: #6a737d; font-style: italic;',
    'hljs-quote': 'color: #6a737d; font-style: italic;',
    
    // 关键字
    'hljs-keyword': 'color: #d73a49; font-weight: bold;',
    'hljs-selector-tag': 'color: #d73a49;',
    'hljs-addition': 'color: #22863a;',
    
    // 字符串
    'hljs-string': 'color: #032f62;',
    'hljs-meta': 'color: #032f62;',
    'hljs-meta-string': 'color: #032f62;',
    
    // 数字
    'hljs-number': 'color: #005cc5;',
    
    // 函数/类名
    'hljs-built_in': 'color: #005cc5;',
    'hljs-title': 'color: #6f42c1;',
    'hljs-section': 'color: #6f42c1;',
    
    // 变量/参数
    'hljs-variable': 'color: #e36209;',
    'hljs-attr': 'color: #6f42c1;',
    'hljs-attribute': 'color: #005cc5;',
    'hljs-params': 'color: #24292e;',
    
    // 符号
    'hljs-symbol': 'color: #e36209;',
    'hljs-bullet': 'color: #e36209;',
    'hljs-link': 'color: #032f62; text-decoration: underline;',
    
    // 正则
    'hljs-regexp': 'color: #032f62;',
    
    // 删除
    'hljs-deletion': 'color: #b31d28; background-color: #ffeef0;',
    
    // 强调
    'hljs-emphasis': 'font-style: italic;',
    'hljs-strong': 'font-weight: bold;',
    
    // 类型
    'hljs-type': 'color: #6f42c1;',
    
    // 模板变量
    'hljs-template-variable': 'color: #e36209;',
    
    // 字面量
    'hljs-literal': 'color: #005cc5;',
    
    // 保留
    'hljs-selector-id': 'color: #6f42c1;',
    'hljs-selector-class': 'color: #6f42c1;',
    'hljs-selector-attr': 'color: #6f42c1;',
    'hljs-selector-pseudo': 'color: #6f42c1;',
    
    // 标签
    'hljs-tag': 'color: #22863a;',
    'hljs-name': 'color: #22863a;',
    
    // 其他
    'hljs-addition': 'color: #22863a; background-color: #f0fff4;',
    'hljs-formula': 'color: #24292e;',
  }
  
  // 为每个 hljs class 添加内联样式
  for (const [className, style] of Object.entries(styles)) {
    const regex = new RegExp(`class="${className}"`, 'g')
    html = html.replace(regex, `class="${className}" style="${style}"`)
  }
  
  return html
}

// ============================================================================
// 主函数
// ============================================================================

/**
 * 转换 Markdown 为微信公众号专用 HTML
 * @param markdown Markdown 文本
 * @param colorKey 主题色
 * @param removeTitle 是否移除 <h1> 标题（默认 true，因为公众号编辑器已有标题字段）
 */
export async function renderWechatFormat(
  markdown: string,
  colorKey: ThemeColorKey = 'roseGold',
  removeTitle: boolean = true
): Promise<string> {
  const color = THEME_COLORS[colorKey]
  
  // 1. 解析 Markdown（带语法高亮）
  let html = await marked.parse(markdown) as string
  
  // 2. 为语法高亮添加内联样式
  html = inlineHighlightStyles(html)
  
  // 3. 应用基础样式
  const styles = {
    section: 'padding: 20px 15px; font-size: 16px; line-height: 1.8; color: #333; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; letter-spacing: 0.5px;',
    
    h1: 'font-size: 24px; font-weight: bold; margin: 30px 0 20px; color: #333; text-align: center; letter-spacing: 1px;',
    h2: `font-size: 20px; font-weight: bold; margin: 25px 0 15px; color: ${color.primary}; border-left: 4px solid ${color.primary}; padding-left: 12px; border-bottom: 1px solid ${color.background}; padding-bottom: 8px;`,
    h3: `font-size: 18px; font-weight: bold; margin: 20px 0 12px; color: ${color.primary};`,
    h4: 'font-size: 16px; font-weight: bold; margin: 18px 0 10px; color: #555;',
    
    p: 'margin: 10px 0; text-align: justify; word-wrap: break-word;',
    
    blockquote: `margin: 15px 0; padding: 15px 20px; background-color: ${color.background}; border-left: 4px solid ${color.primary}; color: #555; border-radius: 3px;`,
    'blockquote p': 'margin: 0; line-height: 1.8;',
    
    strong: `font-weight: bold; color: ${color.primary};`,
    em: `font-style: italic; color: ${color.secondary};`,
    
    // 行内代码（使用主题色）
    codespan: `background-color: ${color.inlineCodeBg}; padding: 2px 6px; border-radius: 3px; font-size: 14px; font-family: Menlo, Monaco, Consolas, "Courier New", monospace; color: ${color.inlineCodeText};`,
    
    // 代码块（GitHub 风格浅色主题）
    pre: `background-color: ${color.codeBlockBg}; padding: 15px; border-radius: 5px; overflow-x: auto; margin: 15px 0; font-size: 14px; line-height: 1.6;`,
    code: `background-color: ${color.codeBlockBg}; padding: 0; color: ${color.codeText}; font-size: 14px; font-family: Menlo, Monaco, Consolas, "Courier New", monospace;`,
    'pre code': `background-color: transparent; padding: 0; color: ${color.codeText}; font-size: 14px;`,
    
    // 列表（微信不支持 list-style-type，使用手动前缀）
    ul: 'padding-left: 0; margin: 10px 0; list-style-type: none;',
    ol: 'padding-left: 0; margin: 10px 0; list-style-type: none;',
    li: 'margin: 5px 0 5px 25px; line-height: 1.8; text-indent: -20px;',
    
    table: 'width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;',
    thead: `background-color: ${color.background}; font-weight: bold;`,
    th: `border: 1px solid ${color.primary}; padding: 10px; text-align: left; background-color: ${color.background}; color: ${color.secondary};`,
    td: `border: 1px solid ${color.background}; padding: 10px; text-align: left;`,
    
    img: 'max-width: 100%; display: block; margin: 15px auto; border-radius: 4px;',
    hr: `border: none; border-top: 2px solid ${color.background}; margin: 25px 0;`,
  }
  
  // 4. 应用样式
  html = html.replace(/<h1>/g, `<h1 style="${styles.h1}">`)
  html = html.replace(/<h2>/g, `<h2 style="${styles.h2}">`)
  html = html.replace(/<h3>/g, `<h3 style="${styles.h3}">`)
  html = html.replace(/<h4>/g, `<h4 style="${styles.h4}">`)
  html = html.replace(/<p>/g, `<p style="${styles.p}">`)
  html = html.replace(/<blockquote>/g, `<blockquote style="${styles.blockquote}">`)
  html = html.replace(/<strong>/g, `<strong style="${styles.strong}">`)
  html = html.replace(/<em>/g, `<em style="${styles.em}">`)
  
  // 行内代码（<code> 不在 <pre> 内）
  html = html.replace(/<code>(?![^<]*<\/code>.*<pre)/g, `<code style="${styles.codespan}">`)
  
  // 代码块
  html = html.replace(/<pre>/g, `<pre style="${styles.pre}">`)
  html = html.replace(/<pre([^>]*)><code/g, `<pre$1><code style="${styles['pre code']}"`)
  
  // 列表（手动添加前缀符号，微信不支持 list-style-type）
  html = html.replace(/<ul>/g, `<ul style="${styles.ul}">`)
  html = html.replace(/<ol>/g, `<ol style="${styles.ol}">`)
  
  // 处理有序列表（添加序号）
  html = html.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/g, (match, content) => {
    let counter = 0
    const processed = content.replace(/<li>/g, () => {
      counter++
      return `<li style="${styles.li}"><span style="margin-right: 8px; font-weight: bold;">${counter}.</span>`
    })
    return `<ol style="${styles.ol}">${processed}</ol>`
  })
  
  // 处理无序列表（添加圆点）
  html = html.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (match, content) => {
    const processed = content.replace(/<li>/g, () => {
      return `<li style="${styles.li}"><span style="margin-right: 8px;">•</span>`
    })
    return `<ul style="${styles.ul}">${processed}</ul>`
  })
  
  // 表格
  html = html.replace(/<table>/g, `<table style="${styles.table}">`)
  html = html.replace(/<thead>/g, `<thead style="${styles.thead}">`)
  html = html.replace(/<th>/g, `<th style="${styles.th}">`)
  html = html.replace(/<td>/g, `<td style="${styles.td}">`)
  
  // 图片和分割线
  html = html.replace(/<img /g, `<img style="${styles.img}" `)
  html = html.replace(/<hr>/g, `<hr style="${styles.hr}">`)
  
  // 5. 移除 <h1> 标题（公众号编辑器已有标题字段，避免重复）
  if (removeTitle) {
    html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/g, '')
  }
  
  // 6. 包裹在容器中
  const wechatHtml = `<section style="${styles.section}">
${html}
</section>`
  
  return wechatHtml
}
