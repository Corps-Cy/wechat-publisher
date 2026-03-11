# OpenClaw 微信公众号发布器

> 一键自动化公众号文章生成与发布，集成 OpenClaw 内置 AI 能力

## ✨ 特性

- 🤖 **AI 文章生成** - 自动生成高质量技术文章
- 🎨 **智能配图** - glm-image 自动生成封面和配图
- ⏰ **定时发布** - 支持 Cron 定时任务
- 📢 **推送通知** - 文章发布后自动推送
- 🔧 **零配置 AI** - 直接使用 OpenClaw 内置模型，无需配置 API Key
- 🎨 **15 种主题色** - 参考 doocs/md 主题配置

## 🙏 致谢

本项目格式化核心基于 [doocs/md](https://github.com/doocs/md) 项目的最佳实践。

**doocs/md** 是一款强大的微信公众号 Markdown 编辑器，支持：
- 完整 Markdown 语法
- 数学公式渲染
- Mermaid / PlantUML 图表
- 多种代码高亮主题
- 自定义 CSS 样式
- 多图床支持
- AI 辅助写作

如果你需要**在线可视化编辑**，强烈推荐使用 [doocs/md 在线版](https://md.doocs.org)。

## 📝 支持的格式

### 基础格式
| 格式 | 支持 | 备注 |
|------|:----:|------|
| 标题 (H1-H6) | ✅ | 自动移除 H1（避免重复） |
| 段落 | ✅ | 1.75 行高 |
| 粗体/斜体 | ✅ | - |
| 链接 | ✅ | 蓝色下划线 |
| 分割线 | ✅ | 细线样式 |

### 代码
| 格式 | 支持 | 备注 |
|------|:----:|------|
| 行内代码 | ✅ | 灰色背景 |
| 代码块 | ✅ | Mac 风格 + 行号 |
| 语法高亮 | ✅ | github-dark-dimmed 主题 |

### 列表
| 格式 | 支持 | 备注 |
|------|:----:|------|
| 无序列表 | ✅ | 手动 • 前缀 |
| 有序列表 | ✅ | 手动数字前缀 |
| 嵌套列表 | ✅ | 支持多级嵌套 |

### 表格
| 格式 | 支持 | 备注 |
|------|:----:|------|
| 基础表格 | ✅ | 带边框 |
| 对齐 | ✅ | 左/中/右 |
| 表头样式 | ✅ | 灰色背景 |

### 高级格式
| 格式 | 支持 | 备注 |
|------|:----:|------|
| 引用块 | ✅ | 灰色背景 + 左边框 |
| GFM 警告块 | ✅ | NOTE/TIP/WARNING/CAUTION |
| 图片 | ✅ | 自动圆角 + 可选图注 |
| 数学公式 | ✅ | LaTeX → CodeCogs 图片 |
| Mermaid | ✅ | 代码 → mermaid.ink 图片 |

## 🎨 主题色（共 15 种）

### 经典系列
| 主题 | 色值 | 适用场景 |
|------|------|----------|
| 经典 | `#0F4C81` | 技术文章（默认）|
| 经典蓝 | `#3585e0` | 教程类 |

### 暖色系列
| 主题 | 色值 | 适用场景 |
|------|------|----------|
| 熏衣紫 | `#8B7BA8` | 通用文章 |
| 活力橘 | `#FA5151` | 热点评论 |
| 暖红 | `#D9534F` | 警示类 |
| 金黄 | `#F0AD4E` | 生活类 |
| 咖啡 | `#795548` | 商务类 |
| 少女粉 | `#E91E63` | 情感类 |

### 冷色系列
| 主题 | 色值 | 适用场景 |
|------|------|----------|
| 翡翠绿 | `#009874` | 成长记录 |
| 森绿 | `#2E8B57` | 自然类 |
| 海蓝 | `#1E90FF` | 科技类 |
| 海洋蓝 | `#00ACC1` | 数据类 |
| 优雅紫 | `#8E44AD` | 艺术类 |
| 薰衣草 | `#7E57C2` | 文艺类 |
| 深夜 | `#455A64` | 专业类 |
| 深色 | `#2C3E50` | 商务类 |

## 📦 安装

```bash
# 1. 克隆到 OpenClaw skills 目录
cd ~/.openclaw/workspace/skills
git clone https://github.com/Corps-Cy/wechat-publisher.git

# 2. 安装依赖
cd wechat-publisher/scripts
npm install

# 3. 配置微信公众号（只需两行）
cp .env.example .env
# 编辑 .env，填入 WECHAT_APP_ID 和 WECHAT_APP_SECRET
```

**就这样！** 图片生成自动使用 OpenClaw 内置的 glm-image，无需额外配置。

## 🚀 使用

### 手动发布

```bash
# 发布一篇文章
npx tsx publish-complete.ts articles/my-article.md

# 指定主题色
npx tsx publish-complete.ts articles/my-article.md --theme=jadeGreen
```

### 定时自动发布

在 OpenClaw 中配置 Cron 任务，每天自动生成并发布。

## ⚙️ 配置

### 必填（仅需两项）

| 配置项 | 说明 | 获取方式 |
|--------|------|----------|
| `WECHAT_APP_ID` | 公众号 AppID | 公众平台 → 开发 → 基本配置 |
| `WECHAT_APP_SECRET` | 公众号 AppSecret | 同上 |

### 可选

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `PUSHDEER_KEY` | 推送通知 Key | 无 |
| `MINIO_*` | 图床配置 | 使用微信临时链接 |

## 📁 项目结构

```
wechat-publisher/
├── SKILL.md              # Skill 定义
├── README.md             # 本文件
├── FORMAT_SPEC.md        # 格式规范
├── scripts/
│   ├── .env.example      # 配置模板
│   ├── publish-complete.ts    # 发布入口
│   ├── ai-generator-v2.ts     # 文章生成
│   ├── image-fetcher.ts       # 图片获取（glm-image 优先）
│   ├── wechat-formatter-fixed.ts   # 微信格式转换（13种主题）
│   ├── wechat-api.ts          # 微信 API 封装
│   └── config.ts               # 配置管理
└── articles/             # 生成的文章
```

## 🔧 核心实现

### 图片生成优先级

```
1. glm-image（OpenClaw 内置）
   ↓ 失败
2. Kolors（免费代理）
   ↓ 失败
3. Unsplash（图库）
```

### 高级格式转换

```typescript
// 数学公式 → CodeCogs 图片
$E = mc^2$ → https://latex.codecogs.com/png.latex?...

// Mermaid 图表 → mermaid.ink 图片
graph LR; A→B → https://mermaid.ink/img/...
```

## 📄 License

MIT

## 🔗 相关链接

- [OpenClaw](https://openclaw.ai) - AI 助手框架
- [doocs/md](https://github.com/doocs/md) - 微信公众号 Markdown 编辑器（本项目参考）
- [智谱AI](https://open.bigmodel.cn) - glm-image 图片生成
- [CodeCogs](https://latex.codecogs.com) - LaTeX 渲染
- [Mermaid Ink](https://mermaid.ink) - Mermaid 图表渲染
