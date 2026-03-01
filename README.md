# OpenClaw Workspace

个人 AI 助手工作空间，包含各种技能和自动化工具。

## 📂 项目结构

```
.
├── skills/                 # 技能模块
│   └── wechat-publisher/  # 微信公众号发布器
├── AGENTS.md              # Agent 配置和规范
├── SOUL.md                # Agent 人格定义
├── USER.md                # 用户信息
├── TOOLS.md               # 工具说明
└── HEARTBEAT.md           # 定时任务配置
```

## 🎯 核心技能

### 微信公众号发布器

自动化生成公众号文章，转换为微信样式，并发布到公众号草稿箱。

**文档**：[skills/wechat-publisher/](./skills/)

**快速开始**：
```bash
cd skills/scripts
npx tsx publish-complete.ts articles/my-article.md
```

**核心功能**：
- ✅ AI 自动生成文章
- ✅ Markdown 转微信样式
- ✅ 自动获取封面（Unsplash）
- ✅ 图文并茂（自动配图）
- ✅ 一键发布到草稿箱

## 📖 文档

- [AGENTS.md](./AGENTS.md) - Agent 配置和行为规范
- [SOUL.md](./SOUL.md) - Agent 人格和价值观
- [USER.md](./USER.md) - 用户信息和偏好
- [TOOLS.md](./TOOLS.md) - 工具使用说明

## 🔧 配置

敏感配置存储在 `MEMORY.md`（不提交到 Git）：
- API 密钥
- 数据库凭证
- 第三方服务配置

## 📝 日志

工作日志存储在 `memory/` 目录（不提交到 Git）：
- `memory/YYYY-MM-DD.md` - 每日工作记录

## 🚀 快速命令

```bash
# 查看状态
openclaw status

# 打开 Dashboard
openclaw dashboard

# 运行技能
cd skills/scripts
npx tsx <script>.ts
```

## 📚 相关资源

- [OpenClaw 文档](https://docs.openclaw.ai)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [Skill 商店](https://clawhub.com)

---

**注意**：此工作空间包含个人配置和敏感信息，请勿分享或公开。
