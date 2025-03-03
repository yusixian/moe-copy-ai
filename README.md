# MoeCopy AI (WIP)

![](https://github.com/yusixian/moe-copy-ai/blob/main/assets/docs/logo.webp?raw=true)

<p align="center">
  <b>✨ 萌萌哒的 AI 网页数据提取助手 ✨</b>
</p>

## 简介

MoeCopy AI 是一款基于 Plasmo 框架开发的浏览器扩展，能够智能识别并提取网页中的结构化数据，为 AI 模型提供高质量输入。

> 需求很简单，是我想在手机端 kiwi 浏览器访问的时候能够直接复制全文、标题、作者和网页元信息等，排除干扰，就类似 [llms.txt](https://llmstxt.org/) 那样。

## ✨ 功能

- 🔍 **一键解析**：点击插件图标即可解析当前页面
- 👁️ **实时预览**：直观展示提取的结构化数据
- 移动端适配

![](https://github.com/yusixian/moe-copy-ai/blob/main/assets/docs/example.webp?raw=true)

## 📋 开发计划

- [x] 实现基础UI框架与插件架构
- [x] 开发核心网页内容提取功能
- [x] 添加基本文本格式化与预览功能
- [x] 网页元数据抓取
- [x] 移动端适配
- [x] 完成基础错误处理和日志记录
- [x] 添加简单的用户配置选项
- [ ] 自定义抓取的选择器
- [ ] 增加图片的 AI OCR 功能
- [ ] 支持 JSON 结构化导出导出功能
- [ ] 集成 AI 摘要功能

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

## License

GNU Affero General Public License version 3 (AGPL-3.0)
