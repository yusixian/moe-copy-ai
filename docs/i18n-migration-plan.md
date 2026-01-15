# i18n 国际化迁移计划

## 概述

本文档描述了 Moe Copy AI 扩展的国际化（i18n）迁移计划。基础设施已搭建完成，本计划用于跟踪剩余组件的迁移工作。

## 已完成

### 基础设施 ✅

- [x] `utils/i18n/` - i18n 模块（types, context, translations）
- [x] `locales/zh_CN.json` - 简体中文翻译文件（~130 个键）
- [x] `locales/en_US.json` - 美式英语翻译文件
- [x] 入口文件 Provider 包装（popup.tsx, options.tsx, sidepanel.tsx）

### 已迁移组件 ✅

- [x] `components/option/OptionHeader.tsx`
- [x] `components/option/Footer.tsx`
- [x] `components/option/InterfaceSettingsSection.tsx`
- [x] `components/option/LanguageSelect.tsx` (新增)
- [x] `sidepanel.tsx` (部分)

---

## 待迁移组件

按优先级和工作量分组，总计 **39 个文件**，约 **1,017 行**包含中文文本。

### Phase 1: 高优先级 - 用户常见界面

这些是用户最常接触的界面，优先迁移。

| 文件 | 中文行数 | 复杂度 | 说明 |
|------|---------|--------|------|
| `PopupContent.tsx` | 80 | 高 | 弹窗主界面，最常用 |
| `ContentSection.tsx` | 30 | 中 | 内容展示区域 |
| `CopyableTextField.tsx` | 13 | 低 | 可复制文本组件 |
| `ContentDisplay.tsx` | 19 | 中 | 内容预览 |
| `TokenizationDisplay.tsx` | 11 | 低 | Token 统计展示 |

**预计工作量**: ~150 行，建议时间 1-2 小时

### Phase 2: 设置页面组件

完善设置页的国际化。

| 文件 | 中文行数 | 复杂度 | 说明 |
|------|---------|--------|------|
| `option/SelectorSettingsSection.tsx` | 72 | 高 | 选择器设置 |
| `option/ExtractionModeSection.tsx` | 29 | 中 | 抓取模式设置 |
| `option/AiSettingsSection.tsx` | 20 | 中 | AI 设置 |
| `option/LogSettingsSection.tsx` | 14 | 低 | 日志设置 |
| `option/DevSettingsSection.tsx` | 3 | 低 | 开发者设置 |
| `option/OptionSelect.tsx` | 1 | 低 | 通用选择组件 |

**预计工作量**: ~140 行，建议时间 1-2 小时

### Phase 3: AI 功能组件

AI 摘要相关的组件。

| 文件 | 中文行数 | 复杂度 | 说明 |
|------|---------|--------|------|
| `AiSummarySection.tsx` | 9 | 低 | AI 摘要入口 |
| `ai/AiSummaryPanel.tsx` | 25 | 中 | AI 摘要面板 |
| `ai/AiHistoryDrawer.tsx` | 37 | 中 | 历史记录抽屉 |
| `ai/PromptInput.tsx` | 13 | 低 | 提示词输入 |
| `ai/CompactPromptInput.tsx` | 13 | 低 | 紧凑提示词输入 |
| `ai/SummaryResultDisplay.tsx` | 8 | 低 | 摘要结果展示 |
| `ai/SummaryResult.tsx` | 4 | 低 | 摘要结果 |
| `ai/ModelSelectInput.tsx` | 3 | 低 | 模型选择 |

**预计工作量**: ~110 行，建议时间 1 小时

### Phase 4: 批量抓取组件

侧边栏批量抓取功能。

| 文件 | 中文行数 | 复杂度 | 说明 |
|------|---------|--------|------|
| `batch/LinkPreviewList.tsx` | 49 | 高 | 链接预览列表 |
| `batch/ScrapeResultsPanel.tsx` | 35 | 中 | 抓取结果面板 |
| `batch/BatchScrapeSettings.tsx` | 29 | 中 | 批量抓取设置 |
| `batch/BatchAiSummary.tsx` | 27 | 中 | 批量 AI 摘要 |
| `batch/ScrapeProgressPanel.tsx` | 25 | 中 | 抓取进度面板 |
| `batch/LinkFilterBar.tsx` | 17 | 低 | 链接筛选栏 |
| `batch/BatchScrapePanel.tsx` | 14 | 低 | 批量抓取面板 |

**预计工作量**: ~200 行，建议时间 2-3 小时

### Phase 5: 内容提取组件

侧边栏内容提取功能。

| 文件 | 中文行数 | 复杂度 | 说明 |
|------|---------|--------|------|
| `extraction/ContentExtractionPanel.tsx` | 16 | 中 | 内容提取面板 |
| `extraction/ContentFormatTabs.tsx` | 11 | 低 | 格式选项卡 |
| `extraction/ExtractionAiSummary.tsx` | 9 | 低 | 提取 AI 摘要 |

**预计工作量**: ~36 行，建议时间 30 分钟

### Phase 6: 单页抓取与其他

| 文件 | 中文行数 | 复杂度 | 说明 |
|------|---------|--------|------|
| `singlescrape/SingleScrapePanel.tsx` | 67 | 高 | 单页抓取面板 |
| `sidepanel/SidePanelSettings.tsx` | 28 | 中 | 侧边栏设置 |
| `SelectorDropdown.tsx` | 43 | 中 | 选择器下拉 |
| `ImageGrid.tsx` | 12 | 低 | 图片网格 |
| `MetadataTable.tsx` | 9 | 低 | 元数据表格 |
| `MetadataImageSection.tsx` | 6 | 低 | 元数据图片 |
| `MetadataImage.tsx` | 3 | 低 | 元数据图片组件 |
| `DownloadButton.tsx` | 4 | 低 | 下载按钮 |
| `FloatingButton.tsx` | 2 | 低 | 悬浮按钮 |

**预计工作量**: ~175 行，建议时间 2 小时

---

## 迁移指南

### 迁移步骤

1. **导入 hook**
   ```tsx
   import { useI18n } from "~utils/i18n"
   ```

2. **在组件中获取翻译函数**
   ```tsx
   const { t } = useI18n()
   ```

3. **替换硬编码文本**
   ```tsx
   // Before
   <button>保存</button>

   // After
   <button>{t("common.save")}</button>
   ```

4. **带参数的翻译**
   ```tsx
   // locales/zh.json: "batch.selectedCount": "已选择 {count} 个链接"
   t("batch.selectedCount", { count: links.length })
   ```

### 翻译 Key 命名规范

```
{namespace}.{component}.{element}

命名空间:
- app - 应用级别
- common - 通用文本
- popup - 弹窗
- sidepanel - 侧边栏
- option - 设置页
- ai - AI 功能
- batch - 批量抓取
- extraction - 内容提取
- content - 内容相关
- image - 图片相关
- error - 错误信息
```

### 注意事项

1. **不要在组件外部使用 `t()`** - hook 只能在函数组件内部调用
2. **动态内容用参数插值** - 避免字符串拼接
3. **保持两个翻译文件同步** - 添加新键时同时更新 zh_CN.json 和 en_US.json
4. **优先复用现有键** - 检查 `common.*` 是否已有需要的翻译

---

## 翻译文件扩展

迁移过程中需要添加新的翻译键，按模块组织：

### 待添加键（示例）

```json
{
  "selector.dropdown.title": "选择器",
  "selector.dropdown.noResults": "未找到匹配结果",

  "singlescrape.title": "单页抓取",
  "singlescrape.loading": "正在抓取...",

  "metadata.title": "元数据",
  "metadata.noData": "无元数据"
}
```

---

## 进度跟踪

| Phase | 状态 | 文件数 | 行数 |
|-------|------|--------|------|
| 基础设施 | ✅ 完成 | 8 | - |
| Phase 1: 高优先级 | ⏳ 待开始 | 5 | ~150 |
| Phase 2: 设置页 | ⏳ 待开始 | 6 | ~140 |
| Phase 3: AI 组件 | ⏳ 待开始 | 8 | ~110 |
| Phase 4: 批量抓取 | ⏳ 待开始 | 7 | ~200 |
| Phase 5: 内容提取 | ⏳ 待开始 | 3 | ~36 |
| Phase 6: 其他 | ⏳ 待开始 | 9 | ~175 |

**总计待迁移**: 38 个文件，约 810 行

---

## 验证清单

每完成一个 Phase 后执行：

- [ ] `pnpm build` 构建成功
- [ ] `pnpm test` 测试通过
- [ ] 手动测试语言切换功能
- [ ] 检查控制台无 `[i18n] Missing translation key` 警告
- [ ] 中英文界面显示正确

---

## 时间估算

| 工作项 | 预计时间 |
|--------|----------|
| Phase 1-6 组件迁移 | 8-10 小时 |
| 翻译文件补充 | 1-2 小时 |
| 测试与修复 | 1-2 小时 |
| **总计** | **10-14 小时** |

建议分多次完成，每次专注一个 Phase。
