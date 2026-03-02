# 发布前检查清单

> 基于 doocs/md 最佳实践配置

## ✅ 基础配置检查

- [ ] **主题**：经典 (default) 或玫瑰金 (roseGold) 等
- [ ] **字体**：无衬线 (`-apple-system-font, BlinkMacSystemFont, Helvetica Neue...`)
- [ ] **字号**：`14px`（更小）
- [ ] **行高**：`1.75`

## ✅ 列表样式检查

**使用 doocs/md 原版样式**：

- [ ] **无序列表**：`list-style: circle; padding-left: 1em`
- [ ] **有序列表**：`padding-left: 1em`（默认数字序号）
- [ ] **列表项**：`display: block; margin: 0.2em 8px`

### 验证命令

```bash
# 检查列表样式
grep 'list-style: circle' article.html
grep 'padding-left: 1em' article.html
grep 'display: block' article.html
```

## ✅ 代码块检查

- [ ] **主题**：github-dark-dimmed
- [ ] **背景色**：`#22272e`（深色）
- [ ] **文字色**：`#adbac7`（浅灰）
- [ ] **Mac 风格**：顶部显示红黄绿三色按钮
- [ ] **行号**：左侧显示，颜色 `#768390`
- [ ] **语法高亮**：所有 `<span class="hljs-xxx">` 都有内联 `style`

### 语法高亮配色验证

| 元素 | 颜色 | 检查 |
|------|------|------|
| 注释 | `#768390` 斜体 | `/* comment */` |
| 关键字 | `#f47067` 加粗 | `const`, `function` |
| 字符串 | `#96d0ff` | `"hello"` |
| 数字 | `#6cb6ff` | `123` |
| 函数名 | `#dcbdfb` | `myFunction()` |

## ✅ 行内代码检查

- [ ] **背景色**：`rgba(27, 31, 35, 0.05)`
- [ ] **文字色**：`#d14`
- [ ] **字号**：`12.6px` (90%)
- [ ] **圆角**：`4px`

## ✅ 标题检查

- [ ] **H1 已移除**：内容中不包含 `<h1>`（公众号编辑器已有标题）
- [ ] **H2 样式**：居中 + 主题色背景 + 白色文字
- [ ] **H3 样式**：左边框 + 主题色边框
- [ ] **H4 样式**：主题色文字

## ✅ 图片检查

- [ ] **图注格式**：title 优先（`legend: title-alt`）
- [ ] **居中显示**：`display: block; margin: auto`
- [ ] **圆角**：`4px`

## ✅ 列表检查

- [ ] **无序列表**：`list-style: circle` 或手动 `•` 前缀
- [ ] **有序列表**：自动编号
- [ ] **左边距**：`padding-left: 1em`

## ✅ 表格检查

- [ ] **表头背景**：`rgba(0, 0, 0, 0.05)`
- [ ] **边框**：`#dfdfdf`
- [ ] **内边距**：`0.25em 0.5em`

## ✅ 引用块检查

- [ ] **左边框**：4px 主题色
- [ ] **背景色**：主题浅色背景
- [ ] **圆角**：`6px`

## ✅ 格式验证命令

```bash
# 检查 H1 是否存在（应该返回 0）
grep -c '<h1' articles/my-article.html

# 检查代码块背景（应该是 #22272e）
grep 'background: #22272e' articles/my-article.html

# 检查行号（应该存在）
grep 'color: #768390' articles/my-article.html

# 检查 Mac 三色按钮
grep 'background: #ff5f56' articles/my-article.html

# 检查字号
grep 'font-size: 14px' articles/my-article.html
```

## ✅ 最终确认

- [ ] 所有样式都是内联的（`style="..."`）
- [ ] 没有外部 CSS 依赖
- [ ] 代码块清晰可读
- [ ] 行号正确显示
- [ ] 标题不重复
- [ ] 图片有图注
- [ ] 列表格式正确
- [ ] 表格对齐

---

**发布前务必通过所有检查项！**
