# 财富流动日志面板任务

## 目标

在财务管理系统页面中实现“财富流动日志”面板，用于展示 v1.4.3 之后发生的入账、划款、消费和消费回退日志。

## 最小可执行任务

用户可以在财务管理系统中看到财富流动日志列表；列表清楚展示事件类型、金额方向、发生时间、来源和目标快照；没有日志时展示克制空状态。

## 输入

- 财富流动日志类型。
- 财富流动日志读取函数。
- 现有财务管理系统 UI 风格。
- `doc/v1.4.3/design.md`

## 输出

- “财富流动日志”面板。
- 日志空状态。
- 日志列表。
- 事件类型展示。
- 金额方向展示。
- 来源和目标快照展示。
- 消费回退关联提示。
- 对应组件测试。

## 主要文件

- `src/features/finance-management/FinanceManagementPanel.tsx`
- `src/features/finance-management/finance-management.module.css`
- `src/features/finance-management/FinanceManagementPanel.test.tsx`
- 可能新增：`src/features/finance-management/WealthFlowLogPanel.tsx`
- 可能新增：`src/features/finance-management/WealthFlowLogPanel.test.tsx`

## Checklist

- [x] 新增“财富流动日志”面板。
- [x] 面板展示本地记录说明。
- [x] 面板不暗示连接银行。
- [x] 面板不暗示连接支付平台。
- [x] 面板不暗示拥有完整历史。
- [x] 没有日志时展示空状态。
- [x] 空状态说明只记录当前版本之后的新事件。
- [x] 空状态不提示用户补录旧数据。
- [x] 列表展示入账日志。
- [x] 列表展示划款日志。
- [x] 列表展示消费日志。
- [x] 列表展示消费回退日志。
- [x] 入账展示为 `+金额`。
- [x] 划款展示为“划入开销池 金额”。
- [x] 消费展示为 `-金额`。
- [x] 消费回退展示为 `+金额`。
- [x] 每条日志展示发生时间。
- [x] 每条日志展示来源快照。
- [x] 每条日志展示目标快照。
- [x] 有备注时展示备注。
- [x] 消费回退日志展示关联原消费提示。
- [x] 日志列表按发生时间倒序展示。
- [x] 日志金额不通过保存负数表达方向。
- [x] UI 不展示预算统计。
- [x] UI 不展示消费分类。
- [x] UI 不展示财务诊断。
- [x] UI 不展示投资建议。
- [x] UI 不展示预算警报。
- [x] UI 不展示超支惩罚。
- [x] UI 不展示财务健康评分。
- [x] 测试面板标题和说明。
- [x] 测试空状态。
- [x] 测试四类事件均可展示。
- [x] 测试入账金额方向。
- [x] 测试划款金额展示。
- [x] 测试消费金额方向。
- [x] 测试消费回退金额方向。
- [x] 测试来源和目标快照展示。
- [x] 测试消费回退关联提示。
- [x] 测试 UI 不出现禁止文案。

## 建议验证命令

```bash
npm run test -- src/features/finance-management/WealthFlowLogPanel.test.tsx
npm run test -- src/features/finance-management/FinanceManagementPanel.test.tsx
npm run typecheck
```
