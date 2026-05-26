# 钱包汇总与图表状态规则任务

## 目标

实现“我的钱包”的确定性汇总规则：当前总余额、正余额分布、零余额状态和负余额状态。

## 最小可执行任务

给定一组钱包容器，系统可以计算当前总余额、钱包状态和用于环形图展示的正余额分布。

## 输入

- `WalletContainer`
- `doc/v1.4/design.md`

## 输出

- 钱包汇总计算函数。
- 钱包状态判断函数。
- 正余额分布占比计算函数。
- 金额格式化辅助函数。

## 主要文件

- 新增：`src/features/finance-management/insights.ts`
- 新增：`src/features/finance-management/insights.test.ts`
- 可能新增：`src/features/finance-management/format.ts`
- 可能新增：`src/features/finance-management/format.test.ts`

## Checklist

- [x] 定义 `WalletSummaryStatus`，范围为 `positive | zero | negative`。
- [x] 定义 `WalletDistributionItem`。
- [x] 定义 `WalletSummary`。
- [x] 实现当前总余额计算。
- [x] 总余额包含正数容器。
- [x] 总余额包含 0 余额容器。
- [x] 总余额包含负数容器。
- [x] `totalBalance > 0` 时状态为 `positive`。
- [x] `totalBalance === 0` 时状态为 `zero`。
- [x] `totalBalance < 0` 时状态为 `negative`。
- [x] 仅当总余额为正时生成分布项。
- [x] 分布项只包含正余额容器。
- [x] 负数容器不参与占比计算。
- [x] 0 余额容器不参与占比计算。
- [x] 占比基于所有正余额容器总和计算。
- [x] 总余额为零时不生成分布项。
- [x] 总余额为负时不生成分布项。
- [x] 不生成财务建议。
- [x] 不生成财务诊断。
- [x] 不生成预算警报。
- [x] 测试全正余额分布。
- [x] 测试正负混合且总余额为正时只按正余额计算占比。
- [x] 测试总余额为零时没有占比。
- [x] 测试总余额为负时没有占比。
- [x] 测试空容器列表。
- [x] 测试金额格式化不改变原始数值。

## 建议验证命令

```bash
npm run test -- src/features/finance-management/insights.test.ts
npm run test -- src/features/finance-management/format.test.ts
npm run typecheck
```
