# 微信公众号文章格式规范

## 核心原则

**微信公众号只支持内联样式（inline style），不支持外部 CSS 或 `<style>` 标签。**

所有样式必须直接写在 `style="..."` 属性中。

## 代码块格式规范

### 问题诊断

❌ **错误做法**（代码看不清）：
```html
<pre style="background-color: #282c34;">
  <code class="hljs language-bash">
    # 注释（依赖外部 CSS，微信不支持）
    node --version
  </code>
</pre>
```

**问题**：
- 深色背景 `#282c34`
- 代码文字没有颜色样式
- highlight.js 的 class 依赖外部 CSS
- 结果：深色背景 + 无颜色文字 = 看不清

✅ **正确做法**（完全内联）：
```html
<pre style="background-color: #f6f8fa; padding: 15px; border-radius: 5px; overflow-x: auto; margin: 15px 0; font-size: 14px; line-height: 1.6;">
  <code style="background-color: transparent; padding: 0; color: #24292e; font-size: 14px;" class="hljs language-bash">
    <span class="hljs-comment" style="color: #6a737d; font-style: italic;"># 注释</span>
    node --version
  </code>
</pre>
```

**优点**：
- 浅色背景 `#f6f8fa`（GitHub 风格）
- 深灰文字 `#24292e`（高对比度）
- 语法高亮样式完全内联
- 微信完美支持

### 标准配色方案

参考 GitHub、VS Code 的配色：

| 元素 | 颜色 | 说明 |
|------|------|------|
| **代码块背景** | `#f6f8fa` | 浅灰（GitHub 风格） |
| **代码文字** | `#24292e` | 深灰（高对比度） |
| **注释** | `#6a737d` | 灰色斜体 |
| **关键字** | `#d73a49` | 红色 |
| **字符串** | `#032f62` | 蓝色 |
| **数字** | `#005cc5` | 蓝色 |
| **函数名** | `#6f42c1` | 紫色 |

### 行内代码规范

行内代码（`` `code` ``）使用主题色：

```html
<code style="background-color: #f8f0f4; padding: 2px 6px; border-radius: 3px; font-size: 14px; font-family: monospace; color: #92617E;">
  v22.0.0
</code>
```

- **背景**：主题浅色（玫瑰金：`#f8f0f4`）
- **文字**：主题色（玫瑰金：`#92617E`）

## 完整格式规范

### 容器

```css
padding: 20px 15px;
font-size: 16px;
line-height: 1.8;
color: #333;
font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;
```

### 标题

- **H1**: `24px` 加粗 居中 `#333`
- **H2**: `20px` 加粗 主题色 左边框
- **H3**: `18px` 加粗 主题色
- **H4**: `16px` 加粗 `#555`

### 段落

```css
margin: 10px 0;
text-align: justify;
word-wrap: break-word;
```

### 引用块

```css
margin: 15px 0;
padding: 15px 20px;
background-color: [主题背景色];
border-left: 4px solid [主题色];
color: #555;
border-radius: 3px;
```

### 表格

```css
/* 表格 */
width: 100%;
border-collapse: collapse;
margin: 15px 0;
font-size: 14px;

/* 表头 */
background-color: [主题背景色];
font-weight: bold;

/* 单元格 */
border: 1px solid [主题色];
padding: 10px;
text-align: left;
```

### 列表

**❌ 错误做法**（微信不支持）：
```css
ul: 'list-style-type: disc;'
ol: 'list-style-type: decimal;'
```

**✅ 正确做法**（手动前缀）：
```css
ul: 'padding-left: 0; list-style-type: none;'
ol: 'padding-left: 0; list-style-type: none;'
li: 'margin: 5px 0 5px 25px; text-indent: -20px;'
```

**HTML 输出**：
```html
<!-- 无序列表 -->
<ul style="list-style-type: none;">
  <li style="...">
    <span style="margin-right: 8px;">•</span>
    列表项内容
  </li>
</ul>

<!-- 有序列表 -->
<ol style="list-style-type: none;">
  <li style="...">
    <span style="margin-right: 8px; font-weight: bold;">1.</span>
    列表项内容
  </li>
</ol>
```

**关键原则**：
- 微信公众号不支持 `list-style-type`
- 必须手动为每个 `<li>` 添加前缀符号
- 无序列表：`•` （Unicode 圆点）
- 有序列表：`1.` `2.` `3.` ...（手动编号）

## 主题配色

### 玫瑰金（roseGold）

```typescript
{
  primary: '#92617E',      // 主题色（标题、强调）
  secondary: '#7a4f6a',    // 辅助色
  background: '#f8f0f4',   // 背景色（引用、表格）
  inlineCodeBg: '#f8f0f4', // 行内代码背景
  inlineCodeText: '#92617E', // 行内代码文字
  codeBlockBg: '#f6f8fa',  // 代码块背景（固定）
  codeText: '#24292e'      // 代码文字（固定）
}
```

**关键原则**：
- 代码块使用固定配色（GitHub 风格），不随主题变化
- 保证代码可读性优先
- 行内代码可以使用主题色

## 语法高亮实现

### 步骤

1. **使用 highlight.js 解析代码**
2. **为生成的 span 标签添加内联样式**
3. **应用代码块基础样式**

### 代码示例

```typescript
// 1. 解析代码
const highlighted = hljs.highlight(code, { language }).value

// 2. 添加内联样式
const styled = highlighted.replace(
  /class="(hljs-[^"]+)"/g,
  'class="$1" style="color: #6a737d;"'
)

// 3. 包裹在 pre/code 中
const html = `<pre style="background-color: #f6f8fa; padding: 15px;">
  <code style="color: #24292e;">${styled}</code>
</pre>`
```

## 验证清单

发布前检查：

- [ ] 所有样式都是内联的（`style="..."`）
- [ ] 代码块背景是浅色（`#f6f8fa`）
- [ ] 代码文字是深色（`#24292e`）
- [ ] 语法高亮样式已内联
- [ ] 行内代码使用主题色
- [ ] 对比度足够（WCAG AA 标准）

## 工具函数

### 检查内联样式

```bash
# 检查是否还有 class 依赖
grep -o 'class="[^"]*"' article.html

# 检查代码块样式
grep -A 5 '<pre' article.html
```

### 预览效果

1. 在浏览器打开 `_preview.html`
2. 检查代码块是否清晰可读
3. 检查行内代码是否美观
4. 复制 HTML 到公众号后台测试

---

**记住**：微信公众号 = 只支持内联样式。所有外部 CSS 都会失效。
