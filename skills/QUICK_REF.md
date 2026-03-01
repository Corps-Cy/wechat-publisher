# 微信公众号发布 - 快速参考

## 一、生成文章

```bash
cd ~/.openclaw/workspace/skills/scripts

# 完整发布（推荐：自动封面 + 配图）
npx tsx publish-complete.ts articles/my-article.md

# 标准发布（使用默认封面）
npx tsx publish-article.ts articles/my-article.md
```

## 二、发布前检查

### 必查项

```bash
# 0. 标题是否重复？
grep -c '<h1' articles/my-article.html
# 应该返回 0 ✅

# 1. 代码块背景是否为浅色？
grep 'background-color: #282c34' articles/my-article.html
# 应该无输出 ✅

# 2. 列表是否有手动前缀？
grep -A 1 '<ul' articles/my-article.html | grep '•'
# 应该看到圆点 ✅

# 3. 语法高亮是否内联？
grep 'class="hljs-comment" style=' articles/my-article.html | wc -l
# 应该 > 0 ✅

# 4. 图片占位符是否已替换？
grep -c 'IMAGE_PLACEHOLDER' articles/my-article.html
# 应该返回 0 ✅
```

### 视觉检查

```bash
# 打开预览页面
open articles/my-article_preview.html
```

检查：
- [ ] 代码块清晰可读
- [ ] 列表序号正确
- [ ] 主题色一致

## 三、发布到公众号

1. 登录 https://mp.weixin.qq.com
2. 进入"素材管理" → "草稿箱"
3. 找到文章并预览
4. 确认无误后发布

## 四、格式规范速查

### ✅ 正确

```html
<!-- ✅ 标题：只在公众号编辑器填写，内容中不包含 -->
<!-- 内容直接从 <h2> 或 <p> 开始 -->

<!-- ✅ 代码块 -->
<pre style="background-color: #f6f8fa;">
  <code style="color: #24292e;">
    <span style="color: #6a737d;"># 注释</span>
  </code>
</pre>

<!-- ✅ 列表 -->
<ul style="list-style-type: none;">
  <li><span>•</span>项目</li>
</ul>

<!-- ✅ 图片 -->
<img src="https://images.unsplash.com/..." alt="描述" />
```

### ❌ 错误

```html
<!-- ❌ 标题重复 -->
<h1>文章标题</h1>  <!-- 公众号编辑器已有标题 -->

<!-- ❌ 深色背景 + 无颜色文字 -->
<pre style="background-color: #282c34;">
  <code># 注释（看不清）</code>
</pre>

<!-- ❌ 使用 list-style-type -->
<ul style="list-style-type: disc;">
  <li>项目（微信不支持）</li>
</ul>

<!-- ❌ 图片占位符未替换 -->
<img src="IMAGE_PLACEHOLDER:描述" />
```

## 五、常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 标题重复 | 内容中包含 `<h1>` | 使用完整发布脚本（自动移除） |
| 代码看不清 | 深色背景 | 使用 `wechat-formatter-fixed.ts` |
| 列表序号错 | `list-style-type` | 手动添加前缀 |
| 语法高亮失效 | 外部 CSS | 内联所有样式 |
| 缺少封面 | 未启用自动获取 | 使用 `publish-complete.ts` |
| 配图占位符未替换 | 未启用自动替换 | 使用 `publish-complete.ts` |

## 六、文档参考

- [SKILL.md](./SKILL.md) - 完整格式规范
- [FORMAT_SPEC.md](./FORMAT_SPEC.md) - 格式规范详解
- [CHECKLIST.md](./CHECKLIST.md) - 发布前检查清单

---

**记住**：微信公众号只支持内联样式！
