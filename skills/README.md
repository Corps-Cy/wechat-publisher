# 微信公众号发布器

自动化生成公众号文章，转换为微信样式，并发布到公众号草稿箱。

## 📖 文档

- **[SKILL.md](./SKILL.md)** - 完整使用指南（必读）
- **[FORMAT_SPEC.md](./FORMAT_SPEC.md)** - 微信格式规范详解
- **[CHECKLIST.md](./CHECKLIST.md)** - 发布前检查清单
- **[QUICK_REF.md](./QUICK_REF.md)** - 快速参考手册

## 🚀 快速开始

```bash
cd ~/.openclaw/workspace/skills/scripts

# 完整发布（推荐：自动封面 + 配图）
npx tsx publish-complete.ts articles/my-article.md

# 标准发布（使用默认封面）
npx tsx publish-article.ts articles/my-article.md
```

## ⚠️ 核心规范

### 必须遵守

1. **标题不重复**：内容中移除 `<h1>` 标题（公众号编辑器已有标题字段）
2. **所有样式内联**：微信公众号不支持外部 CSS
3. **代码块可读**：浅色背景（`#f6f8fa`）+ 深色文字（`#24292e`）
4. **列表手动编号**：微信不支持 `list-style-type`
5. **自动获取封面**：从 Unsplash 图库获取符合主题的封面
6. **图文并茂**：自动替换 `IMAGE_PLACEHOLDER` 为真实配图

### ❌ 绝对禁止

```html
<!-- ❌ 标题重复 -->
<h1>文章标题</h1>  <!-- 公众号编辑器已有标题 -->

<!-- ❌ 深色背景 + 无颜色文字 -->
<pre style="background-color: #282c34;">
  <code>代码（看不清）</code>
</pre>

<!-- ❌ 使用 list-style-type -->
<ul style="list-style-type: disc;">
  <li>项目（微信不支持）</li>
</ul>
```

### ✅ 正确做法

```html
<!-- ✅ 标题：只在公众号编辑器填写，内容中不包含 -->
<!-- 内容直接从 <h2> 或 <p> 开始 -->

<!-- ✅ 代码块：浅色背景 + 深色文字 -->
<pre style="background-color: #f6f8fa;">
  <code style="color: #24292e;">代码</code>
</pre>

<!-- ✅ 列表：手动添加前缀 -->
<ul style="list-style-type: none;">
  <li><span>•</span>项目</li>
</ul>
```

## 🔍 发布前检查

```bash
# 检查标题是否重复
grep -c '<h1' articles/my-article.html
# 应该返回 0 ✅

# 检查代码块背景
grep 'background-color: #282c34' articles/my-article.html
# 应该无输出 ✅

# 检查图片占位符
grep -c 'IMAGE_PLACEHOLDER' articles/my-article.html
# 应该返回 0 ✅
```

## 📂 目录结构

```
skills/
├── SKILL.md                 # 完整使用指南
├── FORMAT_SPEC.md           # 格式规范详解
├── CHECKLIST.md             # 发布前检查清单
├── QUICK_REF.md             # 快速参考
├── README.md                # 本文件
└── scripts/
    ├── publish-complete.ts          # ✅ 完整发布脚本（推荐）
    ├── publish-article.ts           # ✅ 标准发布脚本
    ├── wechat-formatter-fixed.ts    # ✅ 修复版格式化器
    ├── image-fetcher.ts             # ✅ 图片获取工具
    ├── wechat-api.ts                # ✅ 微信 API
    ├── config.ts                    # ✅ 配置管理
    ├── upload-images.ts             # ✅ MinIO 上传
    ├── workflow.ts                  # ✅ 工作流
    ├── scheduler.ts                 # ✅ 定时任务
    ├── cli.ts                       # ✅ CLI 工具
    ├── index.ts                     # ✅ 主入口
    └── ai-generator-v2.ts           # ✅ AI 生成器
```

## 🎨 主题支持

- `roseGold` - 玫瑰金（默认）
- `classicBlue` - 经典蓝
- `jadeGreen` - 翡翠绿
- `vibrantOrange` - 活力橘

指定主题：`publish-complete.ts articles/my-article.md --theme=classicBlue`

## 🔧 配置

### 微信公众号配置

在 `MEMORY.md` 中配置：
- AppId
- AppSecret

### MinIO 配置（可选）

在 `MEMORY.md` 中配置：
- Endpoint
- AccessKey
- SecretKey
- Bucket

## 📱 发布流程

1. 生成文章（Markdown）
2. 转换为微信格式（自动移除标题）
3. 获取封面和配图（Unsplash）
4. 上传封面到微信
5. 创建草稿
6. 登录公众号后台预览
7. 确认后发布

## ❓ 常见问题

| 问题 | 解决 |
|------|------|
| 标题重复 | 使用完整发布脚本（自动移除） |
| 代码看不清 | 使用 `wechat-formatter-fixed.ts` |
| 列表序号错 | 手动添加前缀 |
| 缺少封面 | 使用 `publish-complete.ts` |
| 配图占位符未替换 | 使用 `publish-complete.ts` |

## 📚 相关资源

- [微信公众平台](https://mp.weixin.qq.com)
- [Unsplash 图库](https://unsplash.com)
- [OpenClaw 文档](https://docs.openclaw.ai)

---

**记住**：微信公众号只支持内联样式！所有外部 CSS 都会失效。
