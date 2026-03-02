# 微信公众号文章格式规范

> 基于 doocs/md 项目最佳实践配置

## 核心配置（必须遵守）

### 默认样式配置

```typescript
const defaultStyleConfig = {
  theme: 'default',              // 经典主题
  fontFamily: '-apple-system-font,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Hiragino Sans GB,Microsoft YaHei UI,Microsoft YaHei,Arial,sans-serif',  // 无衬线
  fontSize: '14px',              // 更小字号
  codeBlockTheme: 'github-dark-dimmed',  // 代码块主题
  legend: 'title-alt',           // 图注格式：title 优先
  isMacCodeBlock: true,          // Mac 代码块：开启
  isShowLineNumber: true,        // 代码块行号：开启
}
```

## 核心原则

**微信公众号只支持内联样式（inline style），不支持外部 CSS 或 `<style>` 标签。**

所有样式必须直接写在 `style="..."` 属性中。

---

## 容器基础样式

```css
font-family: -apple-system-font, BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB, Microsoft YaHei UI, Microsoft YaHei, Arial, sans-serif;
font-size: 14px;
line-height: 1.75;
text-align: left;
color: #333;
```

---

## 标题样式（经典主题 default）

### 一级标题 H1

```css
display: table;
padding: 0 1em;
border-bottom: 2px solid var(--md-primary-color);
margin: 2em auto 1em;
font-size: calc(14px * 1.2);  /* 16.8px */
font-weight: bold;
text-align: center;
color: #333;
```

**⚠️ 注意：微信公众号编辑器已有标题字段，内容中应移除 H1 避免重复！**

### 二级标题 H2

```css
display: table;
padding: 0 0.2em;
margin: 4em auto 2em;
background: var(--md-primary-color);
font-size: calc(14px * 1.2);  /* 16.8px */
font-weight: bold;
text-align: center;
color: #fff;
```

### 三级标题 H3

```css
padding-left: 8px;
border-left: 3px solid var(--md-primary-color);
margin: 2em 8px 0.75em 0;
font-size: calc(14px * 1.1);  /* 15.4px */
font-weight: bold;
line-height: 1.2;
color: #333;
```

### 四级标题 H4

```css
margin: 2em 8px 0.5em;
font-size: 14px;
font-weight: bold;
color: var(--md-primary-color);
```

---

## 代码块样式（github-dark-dimmed）

### 基础代码块样式

```css
/* 代码块容器 */
pre {
  font-size: 90%;              /* 12.6px */
  overflow-x: auto;
  border-radius: 8px;
  padding: 0 !important;
  line-height: 1.5;
  margin: 10px 8px;
}

/* 代码块内代码 */
pre > code {
  display: block;
  padding: 0.5em 1em 1em;
  overflow-x: auto;
  color: inherit;
  background: none;
  white-space: nowrap;
}
```

### Mac 代码块样式（isMacCodeBlock: true）

```css
/* Mac 风格代码块 */
.mac-code-block {
  border-radius: 5px;
  overflow: hidden;
  margin: 10px 8px;
}

/* Mac 顶部栏 */
.mac-code-block::before {
  content: '';
  display: block;
  height: 30px;
  background: #1e2128;
  border-radius: 5px 5px 0 0;
  position: relative;
}

/* Mac 三色按钮 */
.mac-code-block::after {
  content: '●●●';
  position: absolute;
  top: 10px;
  left: 12px;
  font-size: 12px;
  letter-spacing: 4px;
  color: #ff5f56;
}
```

### 行号样式（isShowLineNumber: true）

```css
/* 带行号的代码 */
.code-line {
  display: flex;
}

.line-number {
  min-width: 40px;
  padding-right: 10px;
  text-align: right;
  color: #768390;
  user-select: none;
  border-right: 1px solid #373e47;
  margin-right: 10px;
}

.line-content {
  flex: 1;
}
```

### github-dark-dimmed 配色方案

```css
/* 背景 */
.hljs {
  color: #adbac7;
  background: #22272e;
}

/* 关键字、类型 */
.hljs-keyword,
.hljs-template-tag,
.hljs-template-variable,
.hljs-type,
.hljs-variable.language_ {
  color: #f47067;
}

/* 函数名、类名 */
.hljs-title,
.hljs-title.class_,
.hljs-title.function_ {
  color: #dcbdfb;
}

/* 属性、数字、字面量 */
.hljs-attr,
.hljs-literal,
.hljs-number,
.hljs-variable {
  color: #6cb6ff;
}

/* 字符串 */
.hljs-string,
.hljs-regexp {
  color: #96d0ff;
}

/* 注释 */
.hljs-comment {
  color: #768390;
  font-style: italic;
}

/* 内置函数 */
.hljs-built_in {
  color: #f69d50;
}

/* 强调 */
.hljs-emphasis {
  font-style: italic;
}

.hljs-strong {
  font-weight: bold;
}
```

### 完整代码块 HTML 示例

```html
<!-- Mac 风格代码块 + 行号 -->
<section style="margin: 10px 8px; border-radius: 5px; overflow: hidden; background: #22272e;">
  <!-- Mac 顶部栏 -->
  <div style="height: 30px; background: #1e2128; position: relative;">
    <span style="position: absolute; top: 8px; left: 12px; font-size: 12px; letter-spacing: 4px;">
      <span style="color: #ff5f56;">●</span>
      <span style="color: #ffbd2e;">●</span>
      <span style="color: #27c93f;">●</span>
    </span>
  </div>
  <!-- 代码内容 -->
  <pre style="margin: 0; padding: 16px; overflow-x: auto; background: #22272e;">
    <code style="color: #adbac7; font-size: 12.6px; line-height: 1.5; font-family: Menlo, Monaco, 'Courier New', monospace;">
      <div style="display: flex;">
        <span style="min-width: 40px; text-align: right; color: #768390; border-right: 1px solid #373e47; margin-right: 10px; padding-right: 10px;">1</span>
        <span><span style="color: #f47067;">const</span> <span style="color: #6cb6ff;">app</span> = <span style="color: #dcbdfb;">express</span>();</span>
      </div>
      <div style="display: flex;">
        <span style="min-width: 40px; text-align: right; color: #768390; border-right: 1px solid #373e47; margin-right: 10px; padding-right: 10px;">2</span>
        <span><span style="color: #768390; font-style: italic;">// 启动服务</span></span>
      </div>
    </code>
  </pre>
</section>
```

---

## 行内代码样式

```css
font-size: 90%;                  /* 12.6px */
color: #d14;
background: rgba(27, 31, 35, 0.05);
padding: 3px 5px;
border-radius: 4px;
```

### HTML 示例

```html
<code style="font-size: 12.6px; color: #d14; background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px;">npm install</code>
```

---

## 图片样式

### 基础图片

```css
display: block;
max-width: 100%;
margin: 0.1em auto 0.5em;
border-radius: 4px;
```

### 图注样式（legend: title-alt）

**title 优先规则：**
1. 优先使用 `![alt](url "title")` 中的 title
2. 如果没有 title，使用 alt
3. 只显示 title 或只显示 alt

```css
figcaption {
  text-align: center;
  color: #888;
  font-size: 0.8em;  /* 11.2px */
  margin-top: 0.5em;
}
```

### HTML 示例

```html
<figure style="margin: 1.5em 8px;">
  <img src="https://example.com/image.jpg" alt="示例图片" style="display: block; max-width: 100%; margin: 0 auto; border-radius: 4px;">
  <figcaption style="text-align: center; color: #888; font-size: 11.2px; margin-top: 0.5em;">这是图片标题</figcaption>
</figure>
```

---

## 段落样式

```css
margin: 1.5em 8px;
letter-spacing: 0.1em;
color: #333;
```

---

## 引用块样式

```css
font-style: normal;
padding: 1em;
border-left: 4px solid var(--md-primary-color);
border-radius: 6px;
color: #333;
background: #f8f8f8;
margin-bottom: 1em;
```

### HTML 示例

```html
<blockquote style="font-style: normal; padding: 1em; border-left: 4px solid #0F4C81; border-radius: 6px; color: #333; background: #f8f8f8; margin: 1em 8px;">
  <p style="margin: 0; font-size: 14px; letter-spacing: 0.1em;">这是一段引用文字</p>
</blockquote>
```

---

## 列表样式

### 无序列表

```css
ul {
  list-style: circle;
  padding-left: 1em;
  margin-left: 0;
}

li {
  display: block;
  margin: 0.2em 8px;
}
```

### 有序列表

```css
ol {
  padding-left: 1em;
  margin-left: 0;
}
```

**⚠️ 微信公众号可能不支持 `list-style-type`，建议手动添加前缀：**

```html
<!-- 无序列表 -->
<ul style="list-style: circle; padding-left: 1em;">
  <li style="margin: 0.2em 8px;">列表项 1</li>
  <li style="margin: 0.2em 8px;">列表项 2</li>
</ul>

<!-- 如果 list-style 不生效，使用手动前缀 -->
<ul style="list-style: none; padding-left: 0;">
  <li style="margin: 0.2em 8px;"><span style="margin-right: 8px;">•</span>列表项 1</li>
  <li style="margin: 0.2em 8px;"><span style="margin-right: 8px;">•</span>列表项 2</li>
</ul>
```

---

## 表格样式

```css
table {
  width: 100%;
  border-collapse: collapse;
  color: #333;
}

th {
  border: 1px solid #dfdfdf;
  padding: 0.25em 0.5em;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.05);
}

td {
  border: 1px solid #dfdfdf;
  padding: 0.25em 0.5em;
}
```

---

## 分隔线样式

```css
border-style: solid;
border-width: 2px 0 0;
border-color: rgba(0, 0, 0, 0.1);
transform-origin: 0 0;
transform: scale(1, 0.5);
height: 0.4em;
margin: 1.5em 0;
```

---

## 链接样式

```css
color: #576b95;
text-decoration: none;
```

---

## 强调样式

### 粗体

```css
color: var(--md-primary-color);
font-weight: bold;
```

### 斜体

```css
font-style: italic;
```

---

## 主题色变量

```css
/* 经典蓝（默认） */
--md-primary-color: #0F4C81;

/* 其他可选主题色 */
/* 翡翠绿: #009874 */
/* 活力橘: #FA5151 */
/* 薰衣紫: #92617E */
/* 玫瑰金: #B76E79 */
```

---

## ❌ 绝对禁止

```html
<!-- ❌ 标题重复 -->
<h1>文章标题</h1>  <!-- 公众号编辑器已有标题 -->

<!-- ❌ 深色背景 + 无颜色文字（看不清） -->
<pre style="background-color: #282c34;">
  <code>代码（看不清）</code>
</pre>

<!-- ❌ 使用外部 CSS class（微信不支持） -->
<pre>
  <code class="hljs language-bash">npm install</code>
</pre>

<!-- ❌ 依赖 list-style-type（可能不生效） -->
<ul style="list-style-type: disc;">
  <li>项目</li>
</ul>
```

---

## ✅ 正确做法

```html
<!-- ✅ 标题：只在公众号编辑器填写，内容中不包含 -->

<!-- ✅ 代码块：github-dark-dimmed 主题 + Mac 风格 + 行号 -->
<section style="margin: 10px 8px; border-radius: 5px; overflow: hidden; background: #22272e;">
  <div style="height: 30px; background: #1e2128; position: relative;">
    <span style="position: absolute; top: 8px; left: 12px; font-size: 12px; letter-spacing: 4px;">
      <span style="color: #ff5f56;">●</span>
      <span style="color: #ffbd2e;">●</span>
      <span style="color: #27c93f;">●</span>
    </span>
  </div>
  <pre style="margin: 0; padding: 16px; overflow-x: auto; background: #22272e;">
    <code style="color: #adbac7; font-size: 12.6px;">
      <span style="color: #f47067;">const</span> app = <span style="color: #dcbdfb;">express</span>();
    </code>
  </pre>
</section>

<!-- ✅ 列表：手动添加前缀（兼容性更好） -->
<ul style="list-style: none; padding-left: 0;">
  <li style="margin: 0.2em 8px;"><span style="margin-right: 8px;">•</span>列表项</li>
</ul>
```

---

## 验证清单

发布前检查：

- [ ] 所有样式都是内联的（`style="..."`）
- [ ] 字体使用无衬线字体
- [ ] 字号使用 14px
- [ ] 代码块使用 github-dark-dimmed 主题
- [ ] 代码块背景是 `#22272e`
- [ ] 代码文字是 `#adbac7`
- [ ] 语法高亮样式已内联
- [ ] 代码块有 Mac 风格三色按钮
- [ ] 代码块有行号
- [ ] 图注使用 title 优先格式
- [ ] 列表项有手动前缀（如不生效）
- [ ] 标题不在内容中重复

---

## 相关资源

- doocs/md 项目：https://github.com/doocs/md
- 在线编辑器：https://md.doocs.org
- github-dark-dimmed 主题：https://github.com/highlightjs/highlight.js

---

**记住**：微信公众号 = 只支持内联样式。所有外部 CSS 都会失效。
