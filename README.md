# MoeCopy AI

![](https://github.com/yusixian/moe-copy-ai/blob/main/assets/logo.webp?raw=true)

<p align="center">
  <b>✨ 萌萌哒的 AI 网页数据提取助手 ✨</b>
</p>

## 简介

MoeCopy AI 是一款基于 Plasmo 框架开发的浏览器扩展，能够智能识别并提取网页中的结构化数据，为 AI 模型提供高质量输入。

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
