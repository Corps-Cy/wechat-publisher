/**
 * 微信公众号专用格式化器 - v5
 * 
 * 基于 doocs/md 最佳实践 (https://github.com/doocs/md)
 * 
 * 特性：
 * - 数学公式支持（LaTeX → CodeCogs 图片）
 * - Mermaid 图表支持（代码 → mermaid.ink 图片）
 * - 13 种主题色可选
 * - Mac 风格代码块 + 行号
 * - github-dark-dimmed 语法高亮
 */

import { marked } from 'marked'
import hljs from 'highlight.js'
import { markedHighlight } from 'marked-highlight'

// ============================================================================
// 主题色配置（参考 doocs/md，共 13 种主题）
// ============================================================================

export const THEME_COLORS = {
  // 经典系列
  default: { name: '经典', primary: '#0F4C81', background: '#f0f5fa' },
  classicBlue: { name: '经典蓝', primary: '#3585e0', background: '#ecf5ff' },
  
  // 暖色系列
  roseGold: { name: '熏衣紫', primary: '#8B7BA8', background: '#f5f0f8' },
  vibrantOrange: { name: '活力橘', primary: '#FA5151', background: '#fff0f0' },
  warmRed: { name: '暖红', primary: '#D9534F', background: '#fdf2f2' },
  golden: { name: '金黄', primary: '#F0AD4E', background: '#fff8f0' },
  
  // 冷色系列
  jadeGreen: { name: '翡翠绿', primary: '#009874', background: '#e8f5f0' },
  forestGreen: { name: '森绿', primary: '#2E8B57', background: '#f0fff4' },
  oceanBlue: { name: '海蓝', primary: '#1E90FF', background: '#f0f8ff' },
  
  // 特殊系列
  purple: { name: '优雅紫', primary: '#8E44AD', background: '#f8f0ff' },
  coffee: { name: '咖啡', primary: '#795548', background: '#f5f0eb' },
  pink: { name: '少女粉', primary: '#E91E63', background: '#fce4ec' },
  dark: { name: '深色', primary: '#2C3E50', background: '#ecf0f1' },
} as const

export type ThemeColorKey = keyof typeof THEME_COLORS

// ============================================================================
// 数学公式和 Mermaid 支持
// ============================================================================

function latexToImageUrl(latex: string, isBlock: boolean = false): string {
  const cleanLatex = latex.trim()
  const encodedLatex = encodeURIComponent(cleanLatex)
  const size = isBlock ? 200 : 150
  return `https://latex.codecogs.com/png.latex?\\dpi{${size}}\\color{333333}${encodedLatex}`
}

function mermaidToImageUrl(code: string): string {
  const encoded = Buffer.from(code.trim()).toString('base64')
  return `https://mermaid.ink/img/${encoded}`
}

function preprocessMarkdown(markdown: string): string {
  // 块级公式 $$...$$
  markdown = markdown.replace(/\$\$\s*([\s\S]+?)\s*\$\$/g, (_, latex) => {
    const url = latexToImageUrl(latex.trim(), true)
    return `\n<p style="text-align: center; margin: 1em 0;"><img src="${url}" style="max-width: 100%;"></p>\n`
  })
  
  // 行内公式 $...$
  markdown = markdown.replace(/(?<!\$)\$(?!\$)([^\$\n]+?)\$(?!\$)/g, (_, latex) => {
    const url = latexToImageUrl(latex.trim(), false)
    return `<img src="${url}" style="vertical-align: middle; margin: 0 2px; height: 1.2em;">`
  })
  
  // Mermaid
  markdown = markdown.replace(/```mermaid\s*([\s\S]+?)```/g, (_, code) => {
    const url = mermaidToImageUrl(code.trim())
    return `\n<p style="text-align: center; margin: 1em 0;"><img src="${url}" style="max-width: 100%; border-radius: 4px;"></p>\n`
  })
  
  return markdown
}

// 配置 marked
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code: string, lang: string) {
    if (lang === 'mermaid' || lang === 'plantuml') return code
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    try {
      return hljs.highlight(code, { language }).value
    } catch {
      return hljs.highlight(code, { language: 'plaintext' }).value
    }
  }
}))

export type ThemeKey = keyof typeof THEME_COLORS

// ============================================================================
// 基础配置
// ============================================================================

export const DEFAULT_CONFIG = {
  fontFamily: '-apple-system-font, BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB, Microsoft YaHei UI, Microsoft YaHei, Arial, sans-serif',
  fontSize: '14px',
  isMacCodeBlock: true,
  isShowLineNumber: true,
}

// ============================================================================
// 语法高亮样式
// ============================================================================

function inlineHighlightStyles(html: string): string {
  const styles: Record<string, string> = {
    'hljs': 'color: #adbac7; background: #22272e;',
    'hljs-comment': 'color: #768390; font-style: italic;',
    'hljs-keyword': 'color: #f47067; font-weight: bold;',
    'hljs-string': 'color: #96d0ff;',
    'hljs-number': 'color: #ae7f03;',
    'hljs-function': 'color: #dcbdfb;',
    'hljs-title': 'color: #dcbdfb;',
    'hljs-params': 'color: #adbac7;',
    'hljs-built_in': 'color: #6cb6ff;',
    'hljs-class': 'color: #f69d50;',
    'hljs-variable': 'color: #6cb6ff;',
    'hljs-attr': 'color: #96d0ff;',
  }
  
  for (const [cls, style] of Object.entries(styles)) {
    html = html.replace(new RegExp(`class="${cls}"`, 'g'), `class="${cls}" style="${style}"`)
  }
  return html
}

// ============================================================================
// 主渲染函数
// ============================================================================

export async function renderWechatFormat(
  markdown: string,
  themeKey: ThemeKey = 'default',
  removeTitle: boolean = true
): Promise<string> {
  const theme = THEME_COLORS[themeKey] || THEME_COLORS.default
  
  // 预处理
  markdown = preprocessMarkdown(markdown)
  
  // 解析
  let html = await marked.parse(markdown) as string
  
  // 高亮样式
  html = inlineHighlightStyles(html)
  
  // 样式定义
  const styles = {
    section: `padding: 20px 15px; font-size: 14px; line-height: 1.75; color: #333; font-family: ${DEFAULT_CONFIG.fontFamily};`,
    h1: `display: table; padding: 0 1em; border-bottom: 2px solid ${theme.primary}; margin: 2em auto 1em; font-size: 17px; font-weight: bold;`,
    h2: `display: table; padding: 0 0.2em; margin: 4em auto 2em; background: ${theme.primary}; font-size: 17px; font-weight: bold; color: #fff;`,
    h3: `padding-left: 8px; border-left: 3px solid ${theme.primary}; margin: 2em 8px 0.75em 0; font-size: 16px; font-weight: bold;`,
    h4: `margin: 2em 8px 0.5em; font-size: 14px; font-weight: bold; color: ${theme.primary};`,
    p: `margin: 1.5em 8px; letter-spacing: 0.1em;`,
    blockquote: `padding: 1em; border-left: 4px solid ${theme.primary}; border-radius: 6px; background: ${theme.background}; margin: 0 8px 1em;`,
    strong: `color: ${theme.primary}; font-weight: bold;`,
    codespan: `font-size: 13px; color: #d14; background: rgba(27,31,35,0.05); padding: 3px 5px; border-radius: 4px;`,
    code: `font-family: Menlo, Monaco, Consolas, monospace; font-size: 13px;`,
    hr: `border: none; border-top: 1px solid #eee; margin: 2em 0;`,
    img: `max-width: 100%; border-radius: 4px;`,
    table: `border-collapse: collapse; width: 100%; margin: 1em 0;`,
    th: `border: 1px solid #ddd; padding: 10px; background: #f5f5f5; font-weight: bold;`,
    td: `border: 1px solid #ddd; padding: 10px;`,
    li: `margin: 0.5em 0;`,
  }
  
  // 应用样式
  html = html.replace(/<section[^>]*>/g, `<section style="${styles.section}">`)
  html = html.replace(/<h1[^>]*>/g, `<h1 style="${styles.h1}">`)
  html = html.replace(/<h2[^>]*>/g, `<h2 style="${styles.h2}">`)
  html = html.replace(/<h3[^>]*>/g, `<h3 style="${styles.h3}">`)
  html = html.replace(/<h4[^>]*>/g, `<h4 style="${styles.h4}">`)
  html = html.replace(/<p(?![^>]*style)/g, `<p style="${styles.p}"`)
  html = html.replace(/<blockquote[^>]*>/g, `<blockquote style="${styles.blockquote}">`)
  html = html.replace(/<strong>/g, `<strong style="${styles.strong}">`)
  html = html.replace(/<code(?![^>]*class)/g, `<code style="${styles.codespan}"`)
  html = html.replace(/<pre>/g, `<pre style="background: #22272e; padding: 15px; border-radius: 5px; overflow-x: auto;">`)
  html = html.replace(/<hr>/g, `<hr style="${styles.hr}">`)
  html = html.replace(/<img(?![^>]*style)/g, `<img style="${styles.img}"`)
  
  // 列表手动前缀
  html = html.replace(/<ul>/g, `<ul style="list-style: none; padding-left: 0;">`)
  html = html.replace(/<li>/g, `<li style="${styles.li}"><span style="margin-right: 8px;">•</span>`)
  html = html.replace(/<ol>/g, `<ol style="list-style: none; padding-left: 0; counter-reset: ol-counter;">`)
  
  // 表格
  html = html.replace(/<table>/g, `<table style="${styles.table}">`)
  html = html.replace(/<th>/g, `<th style="${styles.th}">`)
  html = html.replace(/<td>/g, `<td style="${styles.td}">`)
  
  // 移除 h1
  if (removeTitle) {
    html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/g, '')
  }
  
  // 包裹
  return `<section style="${styles.section}">${html}</section>`
}

export default renderWechatFormat
