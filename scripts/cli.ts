#!/usr/bin/env node
/**
 * 微信公众号发布器 CLI 工具
 * 
 * 用法：
 *   npx ts-node cli.ts generate --topic "AI发展趋势"
 *   npx ts-node cli.ts convert --file article.md
 *   npx ts-node cli.ts preview --file article.html
 *   npx ts-node cli.ts schedule --show
 */

import { program } from 'commander'
import * as fs from 'fs'
import * as path from 'path'
import { format } from 'date-fns'

// 动态导入模块
const loadModules = async () => {
  const { renderInlineHtml, renderWechatHtml, generatePreviewPage } = await import('./render-wechat.js')
  const { uploadImages } = await import('./upload-images.js')
  const { createArticleFromMarkdown, saveArticle } = await import('./workflow.js')
  const { loadConfig } = await import('./config.js')
  const { buildGenerationPrompt, extractTitle } = await import('./ai-generator.js')
  const { printScheduleStatus, generateCronConfig } = await import('./scheduler.js')
  
  return {
    renderInlineHtml,
    renderWechatHtml,
    generatePreviewPage,
    uploadImages,
    createArticleFromMarkdown,
    saveArticle,
    loadConfig,
    buildGenerationPrompt,
    extractTitle,
    printScheduleStatus,
    generateCronConfig
  }
}

program
  .name('wechat-publisher')
  .description('微信公众号文章自动生成与发布工具')
  .version('1.0.0')

// 生成文章命令
program
  .command('generate')
  .description('生成一篇新文章（输出 prompt，需要 AI 处理）')
  .option('-t, --topic <topic>', '文章主题')
  .option('-s, --style <style>', '写作风格')
  .option('-l, --length <number>', '文章字数', parseInt)
  .option('--tone <tone>', '语气：professional/casual/storytelling/educational')
  .option('--hot <topic>', '结合热点话题')
  .action(async (options) => {
    const modules = await loadModules()
    const config = await modules.loadConfig()
    
    const prompt = modules.buildGenerationPrompt({
      topic: options.topic,
      style: options.style,
      length: options.length,
      tone: options.tone
    }, config)
    
    console.log('\n📝 请将以下 prompt 发送给 AI 生成文章：\n')
    console.log('─'.repeat(60))
    console.log(prompt)
    console.log('─'.repeat(60))
    console.log('\n💡 提示：使用 OpenClaw 的 AI 可以直接生成文章')
  })

// 转换 Markdown 命令
program
  .command('convert')
  .description('将 Markdown 文件转换为微信样式 HTML')
  .requiredOption('-f, --file <file>', 'Markdown 文件路径')
  .option('-t, --title <title>', '文章标题')
  .option('--theme <theme>', '主题：default/dark/purple/green', 'default')
  .option('-o, --output <dir>', '输出目录', './articles')
  .action(async (options) => {
    const modules = await loadModules()
    
    if (!fs.existsSync(options.file)) {
      console.error(`❌ 文件不存在: ${options.file}`)
      process.exit(1)
    }
    
    const markdown = fs.readFileSync(options.file, 'utf-8')
    const title = options.title || modules.extractTitle(markdown) || '未命名文章'
    
    console.log(`\n📄 转换文章: ${title}`)
    console.log(`   主题: ${options.theme}`)
    
    try {
      const article = await modules.createArticleFromMarkdown(
        markdown,
        title,
        { theme: options.theme }
      )
      
      const paths = await modules.saveArticle(article, options.output)
      
      console.log('\n✅ 转换完成!')
      console.log(`   HTML: ${paths.htmlPath}`)
      console.log(`   预览: ${paths.previewPath}`)
    } catch (error) {
      console.error('\n❌ 转换失败:', error)
      process.exit(1)
    }
  })

// 预览文章命令
program
  .command('preview')
  .description('在浏览器中预览文章')
  .requiredOption('-f, --file <file>', 'HTML 文件路径')
  .option('--port <port>', '预览服务器端口', '3000')
  .action(async (options) => {
    if (!fs.existsSync(options.file)) {
      console.error(`❌ 文件不存在: ${options.file}`)
      process.exit(1)
    }
    
    console.log(`\n🌐 启动预览服务器...`)
    console.log(`   文件: ${options.file}`)
    console.log(`   地址: http://localhost:${options.port}`)
    console.log('\n按 Ctrl+C 停止服务器\n')
    
    // 简单的预览服务器
    const http = await import('http')
    const content = fs.readFileSync(options.file)
    
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(content)
    })
    
    server.listen(parseInt(options.port))
  })

// 上传图片命令
program
  .command('upload')
  .description('上传图片到 MinIO')
  .argument('<images...>', '图片路径或URL')
  .option('--config <file>', '配置文件路径')
  .action(async (images, options) => {
    const modules = await loadModules()
    const config = await modules.loadConfig()
    
    console.log(`\n📤 上传 ${images.length} 张图片到 MinIO...\n`)
    
    try {
      const urls = await modules.uploadImages(images, config.minio)
      
      console.log('\n✅ 上传完成!\n')
      urls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`)
      })
    } catch (error) {
      console.error('\n❌ 上传失败:', error)
      process.exit(1)
    }
  })

// 定时任务命令
program
  .command('schedule')
  .description('管理定时任务')
  .option('--show', '显示当前定时配置')
  .option('--cron', '输出 cron 表达式')
  .option('--generate-config', '生成 OpenClaw cron 配置')
  .action(async (options) => {
    const modules = await loadModules()
    const config = await modules.loadConfig()
    
    if (options.show) {
      modules.printScheduleStatus(config)
    } else if (options.cron) {
      const schedule = {
        times: config.schedule.times,
        timezone: config.schedule.timezone,
        enabled: true
      }
      const crons = modules.generateCronConfig(schedule)
      crons.forEach(c => console.log(c.cron))
    } else if (options.generateConfig) {
      const schedule = {
        times: config.schedule.times,
        timezone: config.schedule.timezone,
        enabled: true
      }
      const crons = modules.generateCronConfig(schedule)
      console.log(JSON.stringify({ crons }, null, 2))
    } else {
      program.help()
    }
  })

// 列出主题命令
program
  .command('themes')
  .description('列出所有可用主题')
  .action(async () => {
    const modules = await loadModules()
    const { themes } = await import('./render-wechat.js')
    
    console.log('\n🎨 可用主题:\n')
    Object.keys(themes).forEach(theme => {
      const descriptions: Record<string, string> = {
        default: '简洁优雅（默认）',
        dark: '暗黑风格',
        purple: '紫色主题',
        green: '绿色清新',
        blue: '商务蓝调',
        orange: '活力橙色',
        pink: '少女粉',
        tech: '科技感'
      }
      console.log(`  ${theme.padEnd(10)} - ${descriptions[theme] || '自定义主题'}`)
    })
    console.log('\n💡 使用 --theme <name> 指定主题\n')
  })

// 初始化配置命令
program
  .command('init')
  .description('初始化配置文件')
  .option('-f, --force', '覆盖现有配置')
  .action(async (options) => {
    const configPath = './config.json'
    
    if (fs.existsSync(configPath) && !options.force) {
      console.log('❌ 配置文件已存在，使用 --force 覆盖')
      process.exit(1)
    }
    
    const template = fs.readFileSync(
      path.join(__dirname, '../wechat-publisher/config.template.json'),
      'utf-8'
    )
    
    fs.writeFileSync(configPath, template)
    console.log('✅ 配置文件已创建: ./config.json')
    console.log('\n请编辑配置文件，填入你的 MinIO 配置')
  })

program.parse()
