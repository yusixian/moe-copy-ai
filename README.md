# MoeCopy AI

[![](https://github.com/yusixian/moe-copy-ai/blob/main/assets/docs/logo.webp?raw=true)](https://chromewebstore.google.com/detail/moe-copy-ai/dfmlcfckmfgabpgbaobgapdfmjiihnck)

<p align="center">
  <b>✨ 萌萌哒的 AI 网页数据提取助手 ✨</b>
</p>

## 简介

MoeCopy AI 是一款基于 Plasmo 框架开发的浏览器扩展，能够智能识别并提取网页中的结构化数据，为 AI 模型提供高质量输入。

> 需求很简单，是我想在手机端 kiwi 浏览器访问的时候能够直接复制全文、标题、作者和网页元信息等，排除干扰，就类似 [llms.txt](https://llmstxt.org/) 那样。

本插件还处于早期开发阶段～欢迎 Star 关注一下

## 安装

已上架 [Chrome 应用商店](https://chromewebstore.google.com/detail/moe-copy-ai/dfmlcfckmfgabpgbaobgapdfmjiihnck)

- 也可以：从 Github 最新 Release 页面获取插件 zip 包 ( chrome-mv3-prod.zip ) ，然后打开浏览器的插件管理页面，启用**开发者模式**，点击“加载已解压的拓展程序”，选择刚刚下载并解压的插件文件夹，就可以完成安装。

## ✨ 功能

![example](https://github.com/yusixian/moe-copy-ai/blob/main/assets/docs/example.webp?raw=true)

- **一键解析**: 点击插件图标或浮动按钮，快速解析当前网页内容
- **实时编辑**: 支持手动编辑提取的内容，满足自定义需求
- **内容实时预览**: 在编辑内容时可实时预览效果
- **智能识别**: 自动识别文章主体、标题、作者和发布日期
- **多层级优先级抓取**: 按照预设的选择器优先级，确保抓取准确内容
- **双版本输出**:
  - 原始格式版: 保留 Markdown 格式和原始换行，适合需要保留格式的场景
  - 紧凑版: 清理多余空格和换行，使文本更加精简，优化AI模型输入
- **智能清理**: 自动去除干扰元素、多余空白和无意义内容
- **字数与Token统计**: 显示内容实际字数和估算的 AI 模型 token 数量，分词展示（使用 [gpt-tokenizer](https://github.com/niieani/gpt-tokenizer)）
- **移动端适配**: 响应式设计，支持移动设备使用
- **智能图片提取**: 从文章中提取出所有图片及其元信息
- **页面元数据**: 自动提取 og:title、og:description 等元标签信息，以表格形式展示
- **自定义抓取选择器**: 允许用户自定义 CSS 选择器规则
- **AI 内容摘要**:
  - 通过自由组合抓取到的内容与 AI 对话（ `{{content}}` 等）
  - 支持自定义摘要生成提示词，满足不同摘要需求

### **配置选项**

- **抓取时机设置**: 支持配置为页面加载后自动抓取或仅在用户手动触发时抓取，默认为**仅在用户手动触发时抓取**
- **调试面板控制**: 可配置是否显示调试信息面板
- **日志级别设置**: 提供从跟踪到静默的多个日志级别选项
- **AI 提供商设置**:
  - 基于 [xsai](https://xsai.js.org/docs/packages/overview) 提供 AI 提供商配置功能
  - API 密钥配置: 支持设置 OpenAI 或其他兼容提供商的 API 密钥
  - 模型选择: 支持选择和获取可用的 AI 模型列表
  - 系统提示词定制: 自定义 AI 摘要的默认行为和风格

### 待实现功能（画饼）

#### AI 增强功能

- 集成 xsai 或其他 AI SDK，提供更智能的内容处理能力
- 支持 AI 驱动的内容分析和理解
- 图片 OCR 功能 & AI 图片 OCR 功能，提取图片中的主要文本信息

#### 更多的自定义

- 为特定网站创建和保存抓取模板
- 支持导入/导出自定义选择器配置
- 提供常用网站的预设配置库

#### 功能优化

- 提供关键信息提取和重点标记
- 结构化数据导出：支持将抓取内容导出为 JSON、Markdown 等格式
- 提供数据清洗和格式转换工具

## 📋 开发计划

- [x] 实现基础UI框架与插件架构
- [x] 开发核心网页内容提取功能
- [x] 添加基本文本格式化与预览功能
- [x] 网页元数据抓取
- [x] 移动端适配
- [x] 完成基础错误处理和日志记录
- [x] 添加简单的用户配置选项
- [x] 自定义抓取的选择器
- [x] 集成 AI 摘要功能
- [ ] 增加图片的 AI OCR 功能
- [ ] 支持 JSON 结构化导出导出功能

## 开发指南

### 环境设置

这是一个 [Plasmo](https://docs.plasmo.com/) 编写的浏览器扩展项目。

```bash
# 安装依赖
pnpm i
# 或
npm i

# 运行开发服务器
pnpm dev
# 或
npm run dev
```

打开浏览器并加载相应的开发构建。例如，对于Chrome浏览器(manifest v3)，使用: `build/chrome-mv3-dev`。

### 构建生产版本

```bash
pnpm build
# 或
npm run build
```

这将创建一个生产包，可以打包并发布到各扩展商店。

## 🤝 贡献

欢迎各种形式的贡献，包括新功能、Bug修复和文档改进！

1. Fork 项目
2. 从 dev 分支创建特性分支 (`git checkout -b feat/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add some amazing feature'`)
4. 推送到分支 (`git push origin feat/amazing-feature`)
5. 创建 Pull Request 给 dev 分支

## 致谢

- Logo 及样式灵感来源 [xsai](https://github.com/moeru-ai/xsai) （对 萌A 拙劣的模仿～）

## License

GNU Affero General Public License version 3 (AGPL-3.0)
