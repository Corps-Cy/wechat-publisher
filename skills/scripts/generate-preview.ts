import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { renderWechatFormat } from './wechat-formatter-fixed.js'

const mdPath = process.argv[2]
if (!mdPath) {
  console.log('Usage: npx tsx generate-preview.ts <markdown-file>')
  process.exit(1)
}

const markdown = readFileSync(mdPath, 'utf-8')
const html = await renderWechatFormat(markdown, 'roseGold', true)

// 生成预览文件
const previewHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>文章预览</title>
  <style>
    body {
      max-width: 677px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .preview-container {
      background: white;
      padding: 20px 15px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .tip {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 10px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="tip">
    📱 这是微信公众号预览效果，样式可能与实际略有差异
  </div>
  <div class="preview-container">
    ${html}
  </div>
</body>
</html>`

const outputPath = mdPath.replace('.md', '_preview.html')
writeFileSync(outputPath, previewHtml)
console.log(`✅ 预览文件已生成: ${outputPath}`)
