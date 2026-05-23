# 删除用户侧导出与说明书编辑任务

## 目标

删除 v1.0 中过早暴露给用户的 JSON 导出、Markdown 导出和完整个人说明书编辑能力。

## 最小可执行任务

用户界面中不再出现 JSON 导出、Markdown 导出或完整个人说明书编辑入口，但重置仍然可用。

## 输入

- 当前个人说明书面板实现
- 导出与重置模块
- 本地数据模块

## 输出

- 用户侧 reset-only 的操作区
- 不暴露导出的 UI

## 主要文件

- `src/features/startup-dashboard/StartupDashboard.tsx`
- `src/features/startup-dashboard/StartupDashboard.test.tsx`
- `src/features/export-reset/index.ts`
- `src/features/export-reset/export-reset.test.ts`
- `src/features/local-data/index.ts`
- `src/features/local-data/local-data.test.ts`

## Checklist

- [x] 从主界面删除 JSON 导出按钮。
- [x] 从主界面删除 Markdown 导出按钮。
- [x] 删除 `StartupDashboardProps` 中面向 UI 的 `onExportJson`。
- [x] 删除 `StartupDashboardProps` 中面向 UI 的 `onExportMarkdown`。
- [x] 删除主界面对 `triggerBrowserDownload` 的使用。
- [x] 删除完整个人说明书入口。
- [x] 删除说明书章节编辑和保存 UI。
- [x] 保留 reset 相关函数。
- [x] 保留重置确认对话框。
- [x] 如果保留底层导出函数，确保它们不在 UI 暴露。
- [x] 如果删除底层导出函数，同步删除相关测试和类型引用。
- [x] 测试界面中不存在 `导出 JSON`。
- [x] 测试界面中不存在 `导出 Markdown`。
- [x] 测试界面中不存在完整个人说明书编辑入口。
- [x] 测试重置功能仍然通过。

## 推荐取舍

优先彻底删除用户侧 UI 和 props。

底层 `export-reset` 模块可以暂时保留文件名，但 v1.1 用户侧只能暴露重置能力。若重命名成本较小，可以后续改为 `reset` 模块。

## 建议验证命令

```bash
npm run test -- src/features/startup-dashboard/StartupDashboard.test.tsx
npm run test -- src/features/export-reset/export-reset.test.ts
npm run test -- src/features/local-data/local-data.test.ts
npm run typecheck
```
