# 财富流动日志业务动作任务

## 目标

在现有入账、划款、消费和消费回退动作成功后，生成对应的财富流动日志。

## 最小可执行任务

收入来源手动入账成功后生成入账日志；日常开销池划款成功后生成划款日志；日常开销池消费成功后生成消费日志；删除消费流水并回滚开销池余额后生成消费回退日志。

## 输入

- `WealthFlowEvent`
- 财富流动日志保存函数。
- 收入来源手动入账动作。
- 日常开销池划款动作。
- 日常开销池消费动作。
- 日常开销池删除消费流水动作。
- `doc/v1.4.3/design.md`

## 输出

- 入账日志生成逻辑。
- 划款日志生成逻辑。
- 消费日志生成逻辑。
- 消费回退日志生成逻辑。
- 消费回退关联原消费逻辑。
- 对应单元测试。

## 主要文件

- `src/features/finance-management/income-source-actions.ts`
- `src/features/finance-management/income-source-actions.test.ts`
- `src/features/finance-management/daily-expense-actions.ts`
- `src/features/finance-management/daily-expense-actions.test.ts`
- 可能新增：`src/features/finance-management/wealth-flow-events.ts`
- 可能新增：`src/features/finance-management/wealth-flow-events.test.ts`

## Checklist

- [x] 实现入账日志构造函数。
- [x] 入账日志类型为 `income_received`。
- [x] 入账日志方向为 `in`。
- [x] 入账日志金额为本次成功入账金额。
- [x] 入账日志来源包含收入来源名称快照。
- [x] 入账日志目标包含钱包容器名称快照。
- [x] 固定金额收入来源入账成功后保存入账日志。
- [x] 不固定金额收入来源入账成功后保存入账日志。
- [x] 入账失败时不保存入账日志。
- [x] 钱包容器直接编辑余额时不保存入账日志。
- [x] 实现划款日志构造函数。
- [x] 划款日志类型为 `daily_expense_transfer`。
- [x] 划款日志方向为 `transfer`。
- [x] 划款日志金额为本次划款金额。
- [x] 划款日志来源包含钱包容器名称快照。
- [x] 划款日志目标包含日常开销池名称快照。
- [x] 划款成功后保存划款日志。
- [x] 划款失败时不保存划款日志。
- [x] 划款日志不替代 v1.4.2 最近一次划款信息。
- [x] 实现消费日志构造函数。
- [x] 消费日志类型为 `daily_expense_spent`。
- [x] 消费日志方向为 `out`。
- [x] 消费日志金额为本次消费金额。
- [x] 消费日志来源包含日常开销池名称快照。
- [x] 消费日志关联本次创建的 `DailyExpenseEntry`。
- [x] 消费日志备注使用裁剪后的消费备注。
- [x] 消费成功后保存消费日志。
- [x] 消费失败时不保存消费日志。
- [x] 消费日志不修改钱包容器余额。
- [x] 实现消费回退日志构造函数。
- [x] 消费回退日志类型为 `daily_expense_refund`。
- [x] 消费回退日志方向为 `in`。
- [x] 消费回退日志金额为被删除消费流水金额。
- [x] 消费回退日志目标包含日常开销池名称快照。
- [x] 消费回退日志包含 `relatedDailyExpenseEntryId`。
- [x] 能找到原消费日志时，消费回退日志包含 `relatedEventId`。
- [x] 删除消费流水并回滚开销池余额成功后保存消费回退日志。
- [x] 消费回退失败时不保存消费回退日志。
- [x] 消费回退不删除原消费日志。
- [x] 消费回退不修改钱包容器余额。
- [x] 业务动作失败时不创建孤立日志。
- [x] 日志保存失败时不静默吞掉错误。
- [x] 不用日志重算钱包容器余额。
- [x] 不用日志重算日常开销池余额。
- [x] 测试固定金额入账生成日志。
- [x] 测试不固定金额入账生成日志。
- [x] 测试入账失败不生成日志。
- [x] 测试划款成功生成日志。
- [x] 测试划款失败不生成日志。
- [x] 测试消费成功生成日志。
- [x] 测试消费失败不生成日志。
- [x] 测试消费回退成功生成日志。
- [x] 测试消费回退日志关联原消费。
- [x] 测试消费回退不删除原消费日志。
- [x] 测试钱包直接编辑余额不生成日志。

## 建议验证命令

```bash
npm run test -- src/features/finance-management/income-source-actions.test.ts
npm run test -- src/features/finance-management/daily-expense-actions.test.ts
npm run test -- src/features/finance-management/wealth-flow-events.test.ts
npm run typecheck
```
