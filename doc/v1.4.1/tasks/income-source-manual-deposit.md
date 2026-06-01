# 收入来源手动入账任务

## 目标

实现收入来源的手动入账行为：用户点击收入来源的入账按钮后，目标钱包容器余额增加，并触发“我的钱包”汇总和环形图刷新。

## 最小可执行任务

固定金额来源点击入账后直接增加目标钱包容器余额；不固定金额来源点击入账后要求输入本次到账金额，再增加目标钱包容器余额。

## 输入

- 收入来源类型。
- 钱包容器类型。
- 钱包容器保存函数。
- 钱包汇总函数。
- 收入来源面板。
- `doc/v1.4.1/design.md`

## 输出

- 固定金额手动入账交互。
- 不固定金额本次到账金额输入交互。
- 目标钱包容器余额更新。
- 入账后钱包汇总刷新。
- 目标容器缺失时入账禁用。

## 主要文件

- `src/features/finance-management/FinanceManagementPanel.tsx`
- `src/features/finance-management/FinanceManagementPanel.test.tsx`
- 可能新增：`src/features/finance-management/income-source-actions.ts`
- 可能新增：`src/features/finance-management/income-source-actions.test.ts`

## Checklist

- [x] 收入来源列表中的每一项提供手动入账按钮。
- [x] 固定金额来源点击手动入账后读取固定金额。
- [x] 固定金额来源点击手动入账后找到目标钱包容器。
- [x] 固定金额来源点击手动入账后目标容器余额增加对应金额。
- [x] 固定金额来源点击手动入账后目标容器 `updatedAt` 更新。
- [x] 固定金额来源点击手动入账后保存目标容器。
- [x] 固定金额来源点击手动入账后钱包总余额刷新。
- [x] 固定金额来源点击手动入账后环形图刷新。
- [x] 不固定金额来源点击手动入账后弹出本次到账金额输入。
- [x] 不固定金额来源必须输入正数金额才能确认。
- [x] 不固定金额来源确认后找到目标钱包容器。
- [x] 不固定金额来源确认后目标容器余额增加本次金额。
- [x] 不固定金额来源确认后目标容器 `updatedAt` 更新。
- [x] 不固定金额来源确认后保存目标容器。
- [x] 不固定金额来源确认后钱包总余额刷新。
- [x] 不固定金额来源确认后环形图刷新。
- [x] 目标钱包容器缺失时手动入账按钮禁用。
- [x] 目标钱包容器缺失时不能更新任何钱包容器。
- [x] 入账不创建收入历史。
- [x] 入账不创建流水记录。
- [x] 入账不创建财富流动日志。
- [x] 入账不自动预测下一次收入。
- [x] 入账不根据频率自动执行。
- [x] 用户误点后只能通过“我的钱包”手动修正余额，不实现撤销栈。
- [x] 测试固定金额手动入账。
- [x] 测试不固定金额手动入账。
- [x] 测试不固定金额不能输入 0。
- [x] 测试不固定金额不能输入负数。
- [x] 测试目标容器缺失时不能入账。
- [x] 测试入账后钱包汇总更新。
- [x] 测试入账后环形图状态更新。
- [x] 测试入账不保存历史记录。

## 建议验证命令

```bash
npm run test -- src/features/finance-management/income-source-actions.test.ts
npm run test -- src/features/finance-management/FinanceManagementPanel.test.tsx
npm run typecheck
```
