# App Shell 与本地数据流程任务

## 目标

保持本地优先流程，但将已完成 onboarding 后的页面切换到 LifeOS 启动面板。

## 最小可执行任务

用户首次打开时进入扫描；完成扫描后进入启动面板；刷新后仍显示启动面板；重置后回到首次扫描。

## 输入

- Onboarding 模块
- 初始扫描生成模块
- LifeOS 启动面板
- 本地数据模块

## 输出

- 正确的首次启动、已完成扫描、重置流程

## 主要文件

- `src/features/app-shell/AppShell.tsx`
- `src/features/app-shell/AppShell.test.tsx`
- `src/features/local-data/index.ts`
- `src/features/local-data/local-data.test.ts`

## Checklist

- [x] 无本地扫描结果时展示 onboarding。
- [x] 有本地扫描结果时展示 LifeOS 启动面板。
- [x] 完成 onboarding 后保存回答。
- [x] 完成 onboarding 后保存启动扫描结果。
- [x] 刷新后能读取本地扫描结果。
- [x] 重置后清空本地数据。
- [x] 重置后回到 onboarding。
- [x] 不新增任何云端依赖。
- [x] 不新增账号、同步或远程数据逻辑。
- [x] 测试首次启动展示 onboarding。
- [x] 测试完成扫描后展示启动面板。
- [x] 测试刷新后仍展示启动面板。
- [x] 测试重置后回到 onboarding。

## 本地数据要求

v1.1 可以继续沿用 v1.0 的 IndexedDB + Dexie 方案。

本地数据至少应保存：

- onboarding 回答。
- 启动扫描结果。

不再作为用户侧能力提供：

- JSON 导出。
- Markdown 导出。

## 建议验证命令

```bash
npm run test -- src/features/app-shell/AppShell.test.tsx
npm run test -- src/features/local-data/local-data.test.ts
npm run typecheck
```
