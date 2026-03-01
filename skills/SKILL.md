---
name: wechat-publisher
description: |
  微信公众号文章自动生成与发布工具。支持：
  1. AI 自动生成高质量文章
  2. Markdown 转微信样式（多种主题）
  3. 图片自动上传到 MinIO
  4. 生成预览页面供确认
  5. 定时多时段自动生成
  
  触发场景：
  - 用户要求"生成一篇公众号文章"
  - 用户要求"写一篇关于XX的文章"
  - 用户要求"定时发布公众号内容"
  - 用户要求"把这段内容转成微信格式"
  - 定时任务触发文章生成
---

# 微信公众号发布器

自动化生成公众号文章，转换为微信样式，并通过 OpenClaw 消息推送预览。

## ⚠️⚠️⚠️ 格式规范（必须严格遵守）

**微信公众号只支持内联样式（inline style），不支持外部 CSS。**

**每次生成文章前，必须检查以下规范！详见 [FORMAT_SPEC.md](./FORMAT_SPEC.md)**

### 核心原则

1. **标题不重复**：内容中移除 `<h1>` 标题（公众号编辑器已有标题字段）
2. **所有样式必须内联**：每个 HTML 标签都必须有 `style="..."` 属性
3. **代码块必须可读**：浅色背景 + 深色文字（高对比度）
4. **列表必须手动编号**：微信不支持 `list-style-type`
5. **自动获取封面**：从 Unsplash 获取符合主题的封面图
6. **图文并茂**：自动替换 `IMAGE_PLACEHOLDER` 为真实配图

### ❌ 绝对禁止

```html
<!-- ❌ 错误：标题重复（公众号编辑器已有标题字段） -->
<section>
  <h1>文章标题</h1>
  <p>内容...</p>
</section>

<!-- ❌ 错误：微信不支持 list-style-type -->
ul { list-style-type: disc; }
ol { list-style-type: decimal; }

<!-- ❌ 错误：微信不支持外部 CSS -->
.hljs-comment { color: #6a737d; }

<!-- ❌ 错误：深色背景 + 无颜色文字 -->
pre { background-color: #282c34; }
code { /* 无颜色样式 */ }
```

### ✅ 正确做法

```html
<!-- ✅ 标题：只在公众号编辑器填写，内容中不包含 -->
<!-- 内容直接从 <h2> 或 <p> 开始 -->
<section>
  <h2 style="...">第一节</h2>
  <p style="...">内容...</p>
</section>

<!-- ✅ 代码块：浅色背景 + 深色文字 -->
<pre style="background-color: #f6f8fa; padding: 15px;">
  <code style="color: #24292e;">
    <span class="hljs-comment" style="color: #6a737d; font-style: italic;"># 注释</span>
    node --version
  </code>
</pre>

<!-- ✅ 无序列表：手动添加圆点 -->
<ul style="list-style-type: none;">
  <li><span style="margin-right: 8px;">•</span>列表项 1</li>
  <li><span style="margin-right: 8px;">•</span>列表项 2</li>
</ul>

<!-- ✅ 有序列表：手动添加序号 -->
<ol style="list-style-type: none;">
  <li><span style="margin-right: 8px; font-weight: bold;">1.</span>第一项</li>
  <li><span style="margin-right: 8px; font-weight: bold;">2.</span>第二项</li>
</ol>

<!-- ✅ 图片：使用 Unsplash 免费图库 -->
<img src="https://images.unsplash.com/..." alt="描述" />
```

### 格式检查清单

生成文章后，**必须验证**：详见 [CHECKLIST.md](./CHECKLIST.md)

- [ ] **标题**只出现在公众号编辑器，**不在**内容中（避免重复）
- [ ] **代码块背景**是 `#f6f8fa`（浅灰），**不是**深色
- [ ] **代码文字**是 `#24292e`（深灰），**不是**无颜色
- [ ] **每个语法高亮**的 `<span>` 都有 `style` 属性
- [ ] **列表项**有手动添加的前缀（`•` 或 `1.` `2.`）
- [ ] **没有** `list-style-type: disc/decimal`（会被微信忽略）
- [ ] **没有**外部 CSS class（如 `.hljs-comment`，必须有内联 style）
- [ ] **封面图片**已上传到微信素材库（如果启用了 `fetchCover`）
- [ ] **配图占位符**已替换为真实图片（如果启用了 `fetchImages`）

### 使用的格式化器

**必须使用**：`wechat-formatter-fixed.ts`（修复版）

**禁止使用**：
- `wechat-formatter.ts`（旧版，有列表问题）
- `wechat-formatter-v2.ts`（旧版，有代码块问题）
- `wechat-formatter-v3.ts`（旧版，有代码块问题）

### 配色方案（已固定）

**代码块**（GitHub 风格，不随主题变化）：
- 背景：`#f6f8fa`
- 文字：`#24292e`
- 注释：`#6a737d` 斜体
- 关键字：`#d73a49` 加粗
- 字符串：`#032f62`
- 数字：`#005cc5`
- 函数：`#6f42c1`

**行内代码**（使用主题色）：
- 背景：`#f8f0f4`（玫瑰金）/ `#ecf5ff`（经典蓝）等
- 文字：`#92617E`（玫瑰金）/ `#3585e0`（经典蓝）等

**列表**（通用）：
- 无序：`•` （Unicode 圆点）
- 有序：`1.` `2.` `3.` ...

---

## 快速开始

### 1. 配置 MinIO

编辑配置文件或设置环境变量：

```bash
export WECHAT_PUBLISHER_CONFIG="/path/to/config.json"
```

配置示例：
```json
{
  "minio": {
    "endpoint": "minio.example.com",
    "port": 9000,
    "useSSL": true,
    "accessKey": "YOUR_KEY",
    "secretKey": "YOUR_SECRET",
    "bucket": "wechat-images",
    "publicUrl": "https://cdn.example.com"
  },
  "generator": {
    "topics": ["技术分享", "行业观察", "产品思考"],
    "defaultTopic": "技术分享",
    "style": "专业但不枯燥",
    "length": 1500
  },
  "schedule": {
    "times": ["08:00", "12:00", "18:00"],
    "timezone": "Asia/Shanghai"
  }
}
```

### 2. 使用方式

**手动生成文章：**
```
帮我生成一篇关于"AI发展趋势"的公众号文章
```

**从现有内容转换：**
```
把这段内容转成微信格式：
[你的 Markdown 内容]
```

**设置定时任务：**
```
每天早上8点、中午12点、晚上6点各生成一篇文章
```

## 工作流程

```
用户请求 / 定时触发
       ↓
   AI 生成文章
       ↓
 Markdown → 微信样式 HTML
       ↓
   图片上传 MinIO
       ↓
   保存预览文件
       ↓
   推送预览链接给用户
       ↓
   用户确认 → 复制到公众号后台
```

## 可用主题

- `default` - 简洁优雅（默认）
- `dark` - 暗黑风格
- `purple` - 紫色主题
- `green` - 绿色清新

指定主题：`用 purple 主题生成一篇关于...`

## 定时任务配置

在 HEARTBEAT.md 或通过 cron 设置：

```bash
# 每天 8:00 生成文章
0 8 * * * openclaw run "生成一篇技术文章"

# 每天 12:00 生成文章
0 12 * * * openclaw run "生成一篇产品思考"

# 每天 18:00 生成文章
0 18 * * * openclaw run "生成一篇行业观察"
```

## 输出文件

生成的文章保存在 `./articles/` 目录：

- `2024-01-15_08-00-00_abc123.md` - Markdown 原文
- `2024-01-15_08-00-00_abc123.html` - 渲染后 HTML（可复制）
- `2024-01-15_08-00-00_abc123_preview.html` - 预览页面

## 注意事项

1. **订阅号限制**：由于是个人订阅号，无法通过 API 直接发布，需要手动复制到公众号后台
2. **图片要求**：MinIO 需要公网可访问，否则微信无法加载图片
3. **文章确认**：每篇文章生成后会推送预览，确认后再发布

## 脚本说明

| 脚本 | 功能 | 状态 |
|-----|------|------|
| `publish-complete.ts` | **完整发布脚本**（推荐） | ✅ 移除标题 + 自动封面 + 配图 |
| `publish-article.ts` | 标准发布脚本 | ✅ 移除标题 + 使用默认封面 |
| `wechat-formatter-fixed.ts` | **修复版格式化器** | ✅ 符合微信规范 |
| `image-fetcher.ts` | 图片获取工具 | ✅ Unsplash 图库 |
| `wechat-api.ts` | 微信 API 封装 | ✅ 草稿/素材管理 |
| `ai-generator-v2.ts` | AI 文章生成器 | ✅ 精炼版 |
| `config.ts` | 配置管理 | ✅ 正常 |
| `upload-images.ts` | MinIO 图片上传 | ✅ 正常 |
| `workflow.ts` | 完整工作流 | ✅ 正常 |
| `scheduler.ts` | 定时任务 | ✅ 正常 |
| `cli.ts` | CLI 工具 | ✅ 正常 |
| `index.ts` | 主入口 | ✅ 正常 |

**⚠️ 重要**：所有发布操作都应该使用 `publish-complete.ts`（完整版）或 `publish-article.ts`（标准版）。

## 示例对话

**用户**：帮我生成一篇关于"大模型应用"的技术文章

**AI**：
1. 调用 `workflow.ts` 生成文章
2. 保存预览文件
3. 返回预览链接

```
✅ 文章已生成！

📝 标题：大模型应用：从概念到落地的实践之路

📄 预览链接：./articles/2024-02-28_08-00-00_abc123_preview.html

📋 复制内容：./articles/2024-02-28_08-00-00_abc123.html

确认发布吗？我可以帮你打开预览页面。
```
