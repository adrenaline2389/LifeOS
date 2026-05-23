# LifeOS 启动面板任务

## 目标

将 onboarding 后的主界面从个人说明书控制面板改为 LifeOS 启动面板。

## 最小可执行任务

用户完成首次启动扫描后，可以看到六个子系统入口、建议优先开启的系统、推荐来源、扫描线索和重置入口。

## 输入

- `StartupScanProfile`
- 子系统定义
- 复古 UI 系统组件
- 重置模块

## 输出

- LifeOS 启动面板 UI

## 主要文件

- `src/features/startup-dashboard/StartupDashboard.tsx`
- `src/features/startup-dashboard/startup-dashboard.module.css`
- `src/features/startup-dashboard/StartupDashboard.test.tsx`
- 可能新增：`src/features/startup-dashboard/StartupDashboard.tsx`
- 可能新增：`src/features/startup-dashboard/startup-dashboard.module.css`
- 可能新增：`src/features/startup-dashboard/index.ts`

## Checklist

- [x] 页面标题改为 `LifeOS 启动面板`。
- [x] 展示 `初始扫描完成`。
- [x] 删除“自我清晰度”主区块。
- [x] 删除完整个人说明书入口。
- [x] 删除说明书章节编辑 UI。
- [x] 主界面展示六个子系统入口。
- [x] 每个子系统展示名称和一句定义。
- [x] 被推荐的 1-2 个系统显示 `建议优先开启`。
- [x] 未推荐系统显示 `未开启` 或 `后续开放`。
- [x] 推荐系统展示推荐理由。
- [x] 推荐系统展示来源回答。
- [x] 展示扫描线索。
- [x] 保留重置入口。
- [x] 点击未开放子系统时展示轻量反馈。
- [x] 测试页面标题为 LifeOS 启动面板。
- [x] 测试六个子系统都被渲染。
- [x] 测试推荐系统显示 `建议优先开启`。
- [x] 测试不再渲染 `自我清晰度`。
- [x] 测试不再渲染完整个人说明书编辑入口。
- [x] 测试重置确认仍然可用。

## 六个系统定义

- 个人生态系统：生理基础与生活环境。
- 能量管理系统：心理余量与恢复。
- 认知管理系统：信息、学习、判断和反思。
- 人生目标管理系统：方向、项目和行动。
- 人际关系管理系统：连接、沟通和边界。
- 财务管理系统：资源、消费和自由度。

## 建议验证命令

```bash
npm run test -- src/features/startup-dashboard/StartupDashboard.test.tsx
npm run typecheck
```
