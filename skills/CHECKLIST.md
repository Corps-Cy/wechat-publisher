# 微信公众号文章格式检查清单

发布前必须验证以下所有项目！

## ✅ 必须通过

### 0. 标题

- [ ] **内容中没有 `<h1>` 标题**（公众号编辑器已有标题字段）
- [ ] **标题只出现一次**（在公众号编辑器的标题字段）

**检查命令**：
```bash
# 检查是否有 h1 标题
grep -c '<h1' article.html
# 应该返回 0 ✅

# 如果返回 > 0，说明标题重复了 ❌
```

### 1. 代码块

- [ ] **背景色**是 `#f6f8fa`（浅灰），不是 `#282c34`（深色）
- [ ] **文字色**是 `#24292e`（深灰），不是无颜色
- [ ] **每个** `<span class="hljs-*">` 都有 `style="color: ..."`

**检查命令**：
```bash
# 检查代码块背景
grep -o 'background-color: #[a-fA-F0-9]\{6\}' article.html | grep -E '(282c34|1e1e1e)'
# 如果有输出，说明使用了深色背景 ❌

# 检查语法高亮是否有内联样式
grep -c 'class="hljs-' article.html
grep -c 'class="hljs-[^"]*" style=' article.html
# 两个数字应该相等 ✅
```

### 2. 列表

- [ ] **无序列表**每个 `<li>` 前面有 `•`
- [ ] **有序列表**每个 `<li>` 前面有 `1.` `2.` `3.` 等
- [ ] **没有** `list-style-type: disc` 或 `list-style-type: decimal`

**检查命令**：
```bash
# 检查是否有错误的 list-style-type
grep -E 'list-style-type: (disc|decimal)' article.html
# 应该没有输出 ✅

# 检查列表项是否有前缀
grep -A 1 '<ul' article.html | grep '<li' | head -3
# 应该看到 • 前缀 ✅
```

### 3. 行内代码

- [ ] **背景色**使用主题色（玫瑰金：`#f8f0f4`）
- [ ] **文字色**使用主题色（玫瑰金：`#92617E`）
- [ ] **不是**代码块的深色背景

**检查命令**：
```bash
# 检查行内代码样式
grep -o '<code[^>]*style="[^"]*"' article.html | grep -v 'pre' | head -3
# 应该看到主题色背景 ✅
```

### 4. 图片

- [ ] **封面图片**已上传到微信素材库（如果使用了 `fetchCover`）
- [ ] **配图占位符**已替换为真实图片 URL（如果使用了 `fetchImages`）
- [ ] **没有** `IMAGE_PLACEHOLDER` 残留

**检查命令**：
```bash
# 检查是否有占位符残留
grep -c 'IMAGE_PLACEHOLDER' article.html
# 应该返回 0 ✅

# 检查图片 URL 是否有效
grep -o 'src="https://[^"]*"' article.html | head -3
# 应该看到真实的图片 URL ✅
```

## 🔍 视觉检查

在浏览器打开 `_preview.html` 文件，检查：

1. **代码块**：
   - [ ] 背景是浅灰色
   - [ ] 文字清晰可读（高对比度）
   - [ ] 关键字、字符串、注释都有颜色

2. **列表**：
   - [ ] 无序列表显示为圆点（•）
   - [ ] 有序列表显示为数字（1. 2. 3.）
   - [ ] 没有错乱的序号

3. **整体**：
   - [ ] 主题色一致
   - [ ] 标题层级清晰
   - [ ] 表格对齐

## 📱 微信预览

1. 复制 HTML 内容
2. 粘贴到公众号后台编辑器
3. 检查格式是否正常
4. 预览手机效果

## ❌ 常见问题

### 问题 0：标题重复

**症状**：文章开头有标题，公众号编辑器也有标题，导致重复

**原因**：HTML 内容中包含了 `<h1>` 标题

**解决**：使用 `wechat-formatter-fixed.ts`，设置 `removeTitle=true`

### 问题 1：代码看不清

**症状**：深色背景，文字看不清

**原因**：使用了旧版格式化器

**解决**：使用 `wechat-formatter-fixed.ts`

### 问题 2：列表序号错乱

**症状**：无序列表显示为 `1. 2. 3.`

**原因**：使用了 `list-style-type`（微信不支持）

**解决**：手动添加前缀 `•`

### 问题 3：语法高亮失效

**症状**：代码都是黑色文字

**原因**：语法高亮样式没有内联

**解决**：确保每个 `<span class="hljs-*">` 都有 `style`

### 问题 4：缺少封面

**症状**：文章没有封面图片

**原因**：未启用 `fetchCover` 或上传失败

**解决**：使用 `publish-complete.ts`（自动获取封面）

### 问题 5：配图占位符未替换

**症状**：文章中显示 `IMAGE_PLACEHOLDER:xxx`

**原因**：未启用 `fetchImages` 或替换失败

**解决**：使用 `publish-complete.ts`（自动替换占位符）

## 📋 发布前检查流程

```bash
# 1. 使用完整发布脚本（推荐）
npx tsx publish-complete.ts articles/my-article.md

# 2. 检查生成的 HTML
cd articles

# 检查标题是否重复
grep -c '<h1' my-article.html
# 应该返回 0 ✅

# 检查代码块背景
grep -E 'list-style-type: (disc|decimal)' my-article.html
grep 'background-color: #282c34' my-article.html
# 应该没有输出 ✅

# 检查图片占位符
grep -c 'IMAGE_PLACEHOLDER' my-article.html
# 应该返回 0 ✅

# 3. 浏览器预览
open my-article_preview.html

# 4. 确认无误后，登录公众号后台发布
```

---

**记住**：微信公众号只支持内联样式！所有外部 CSS 都会失效。
