# Firefox 扩展构建说明

## 背景

Firefox 要求扩展的 `manifest.json` 包含 `browser_specific_settings` 字段，而 Chrome 不支持该字段。为了兼容两个平台，我们使用构建后脚本自动为 Firefox 版本添加该字段。

## 数据收集与传输说明

**本扩展会收集并传输网页数据到 AI 服务提供商进行处理。**

### 收集的数据类型

根据 Firefox 数据分类，本扩展涉及：

1. **Website Content（网页内容）**
   - 网页标题
   - 网页文本内容
   - 用途：发送到 AI 进行摘要和分析

2. **Browsing Activity（浏览活动）**
   - 当前访问的网页 URL
   - 用途：作为上下文信息提供给 AI

### 数据传输目标

- ✅ 发送到：用户配置的 AI API（默认 OpenAI，支持自定义）
- ❌ 不发送到：扩展开发者服务器
- ❌ 不发送到：第三方分析服务

### 本地存储

以下数据仅存储在本地浏览器：
- AI API 配置（API Key, Base URL, Model）
- 聊天历史记录
- 用户偏好设置

### 用户控制

- 用户必须主动点击"生成摘要"才会触发数据传输
- 用户可以自行配置 AI API endpoint
- 用户可以随时清空本地聊天历史

## 构建命令

### 开发模式

```bash
# Chrome 开发
pnpm dev

# Firefox 开发
pnpm dev:firefox
```

### 生产构建

```bash
# Chrome 构建
pnpm build

# Firefox 构建（自动添加 browser_specific_settings）
pnpm build:firefox
```

### 打包发布

```bash
# Chrome 打包
pnpm package

# Firefox 打包
pnpm package:firefox
```

## Extension ID 和配置说明

Firefox 的 Extension 配置在 `scripts/post-build-firefox.js` 中设置：

```javascript
const EXTENSION_ID = 'moe-copy-ai@cosine.ren';

manifest.browser_specific_settings = {
  gecko: {
    id: EXTENSION_ID,
    strict_min_version: "109.0",
    data_collection_permissions: false
  }
};
```

**重要提示：**

1. **Extension ID**
   - **首次提交后不可修改**：在首次提交到 Firefox Add-ons 后无法更改
   - **格式要求**：必须符合以下格式之一
     - Email 格式：`something@yourdomain.com`
     - UUID 格式：`{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}`
   - **建议**：不要使用真实的 email 地址，使用类似 `extension-name@yourdomain.com` 的格式

2. **data_collection_permissions**
   - Firefox 所有新扩展都必须声明此字段
   - 本扩展声明了以下 **required** 数据权限：
     - `websiteContent` - 提取网页内容（标题、文本等）用于 AI 处理
     - `browsingActivity` - 提取网页 URL 信息
   - **数据传输说明**：
     - 提取的网页内容和 URL 会发送到用户配置的 AI API（默认 OpenAI）
     - **数据仅发送到 AI 服务提供商**，不发送到扩展开发者服务器
     - 用户可自行配置 AI API endpoint（支持 OpenAI 兼容 API）
     - 聊天历史和设置仅存储在本地浏览器（Chrome Storage）

3. **strict_min_version**
   - 指定支持的最低 Firefox 版本
   - 当前设置为 `109.0`（支持 Manifest V3）

## 工作原理

1. `pnpm build:firefox` 执行 Plasmo 构建，生成 Firefox 版本
2. 构建完成后自动运行 `scripts/post-build-firefox.js`
3. 脚本读取 `build/firefox-mv3-prod/manifest.json`
4. 添加 `browser_specific_settings` 字段
5. 写回文件，保持格式化

## 验证

构建后检查 manifest.json：

```bash
cat build/firefox-mv3-prod/manifest.json | grep -A 10 "browser_specific_settings"
```

应该输出：

```json
"browser_specific_settings": {
  "gecko": {
    "id": "moe-copy-ai@cosine.ren",
    "strict_min_version": "109.0",
    "data_collection_permissions": {
      "required": [
        "websiteContent",
        "browsingActivity"
      ]
    }
  }
}
```

## 故障排除

### 构建后脚本未执行

检查脚本是否有执行权限：

```bash
chmod +x scripts/post-build-firefox.js
```

### Extension ID 冲突

如果首次提交后需要修改 ID，你需要：

1. 在 Firefox Add-ons 后台申请新的扩展
2. 更新 `scripts/post-build-firefox.js` 中的 `EXTENSION_ID`
3. 重新构建和提交

## 参考资料

- [Firefox Extension ID 要求](https://extensionworkshop.com/documentation/develop/extensions-and-the-add-on-id/)
- [Plasmo 多浏览器支持](https://docs.plasmo.com/framework/workflows/build#with-specific-target)
