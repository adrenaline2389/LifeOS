# App Shell 与启动面板入口任务

## 目标

让用户从启动面板进入能量管理系统，同时保持个人生态系统可进入、其他四个系统后续开放。

## 最小可执行任务

点击能量管理系统入口进入能量管理系统页面；从能量管理系统可以返回启动面板；能量管理系统被推荐时，推荐卡片进入同一页面。

## 输入

- LifeOS 启动面板。
- 能量管理系统页面。
- 个人生态系统页面。
- App Shell 流程。
- `doc/v1.3/design.md`

## 输出

- 启动面板到能量管理系统的入口。
- App Shell 页面模式切换。
- 返回启动面板流程。

## 主要文件

- `src/features/app-shell/AppShell.tsx`
- `src/features/app-shell/AppShell.test.tsx`
- `src/features/startup-dashboard/StartupDashboard.tsx`
- `src/features/startup-dashboard/StartupDashboard.test.tsx`
- `src/features/energy-management/EnergyManagementPanel.tsx`

## Checklist

- [x] App Shell 新增能量管理系统页面模式。
- [x] Startup Dashboard 支持点击能量管理系统入口。
- [x] 能量管理系统被推荐时，推荐卡片进入同一页面。
- [x] 个人生态系统入口仍进入个人生态系统页面。
- [x] 认知管理系统、人生目标管理系统、人际关系管理系统和财务管理系统仍显示后续开放反馈。
- [x] 能量管理系统页面可以返回启动面板。
- [x] 无本地扫描结果时仍展示 onboarding。
- [x] 有本地扫描结果时仍展示 LifeOS 启动面板。
- [x] 重置后仍回到首次启动状态。
- [x] 不重新引入完整个人说明书入口。
- [x] 不重新引入 JSON 导出入口。
- [x] 不重新引入 Markdown 导出入口。
- [x] 不引入账号、云同步、云数据库或 AI 分析。
- [x] 测试点击能量管理系统入口进入页面。
- [x] 测试推荐卡片也能进入能量管理系统。
- [x] 测试个人生态系统仍可进入。
- [x] 测试其他四个系统后续开放反馈。
- [x] 测试从能量管理系统返回启动面板。
- [x] 测试重置流程仍然可用。
- [x] 测试 v1.2 已删除项不回归。

## 建议验证命令

```bash
npm run test -- src/features/app-shell/AppShell.test.tsx
npm run test -- src/features/startup-dashboard/StartupDashboard.test.tsx
npm run typecheck
```
