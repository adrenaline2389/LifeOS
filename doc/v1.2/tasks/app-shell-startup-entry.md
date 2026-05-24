# App Shell 与启动面板入口任务

## 目标

让用户从 v1.1 启动面板进入个人生态系统，同时保持其他系统后续开放。

## 最小可执行任务

点击个人生态系统入口进入个人生态系统页面；从个人生态系统可以返回启动面板；其他五个子系统仍显示后续开放反馈。

## 输入

- LifeOS 启动面板。
- 个人生态系统页面。
- App Shell 流程。
- `doc/v1.2/design.md`

## 输出

- 启动面板到个人生态系统的入口。
- App Shell 页面模式切换。
- 返回启动面板流程。

## 主要文件

- `src/features/app-shell/AppShell.tsx`
- `src/features/app-shell/AppShell.test.tsx`
- `src/features/startup-dashboard/StartupDashboard.tsx`
- `src/features/startup-dashboard/StartupDashboard.test.tsx`
- `src/features/personal-ecosystem/PersonalEcosystemPanel.tsx`

## Checklist

- [x] App Shell 新增个人生态系统页面模式。
- [x] Startup Dashboard 支持点击个人生态系统入口。
- [x] 个人生态系统被推荐时，推荐卡片进入同一页面。
- [x] 其他五个子系统仍显示后续开放反馈。
- [x] 个人生态系统页面可以返回启动面板。
- [x] 无本地扫描结果时仍展示 onboarding。
- [x] 有本地扫描结果时仍展示 LifeOS 启动面板。
- [x] 重置后仍回到首次启动状态。
- [x] 不重新引入完整个人说明书入口。
- [x] 不重新引入 JSON 导出入口。
- [x] 不重新引入 Markdown 导出入口。
- [x] 不引入账号、云同步、云数据库或 AI 分析。
- [x] 测试点击个人生态系统入口进入页面。
- [x] 测试推荐卡片也能进入个人生态系统。
- [x] 测试其他五个系统后续开放反馈。
- [x] 测试从个人生态系统返回启动面板。
- [x] 测试重置流程仍然可用。
- [x] 测试 v1.1 删除项不回归。

## 建议验证命令

```bash
npm run test -- src/features/app-shell/AppShell.test.tsx
npm run test -- src/features/startup-dashboard/StartupDashboard.test.tsx
npm run typecheck
```
