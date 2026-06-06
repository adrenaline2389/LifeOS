# 日常开销池面板收敛任务

## 目标

取消日常开销池用户侧“消费流水”可见板块，把 v1.4.3 之后的消费和消费回退统一交给财富流动日志面板展示。

## 最小可执行任务

日常开销池仍支持查看余额、划款和消费结算，但不再展示独立消费流水列表；底层消费流水可以继续作为内部数据用于消费回退和日志关联。

## 输入

- 现有日常开销池面板。
- 现有 `DailyExpenseEntry` 类型和存储。
- 财富流动日志面板。
- `doc/v1.4.3/design.md`

## 输出

- 收敛后的日常开销池面板。
- 移除用户侧消费流水列表。
- 保留划款入口和消费结算。
- 保留最近一次划款信息。
- 更新后的组件测试。

## 主要文件

- `src/features/finance-management/DailyExpensePoolPanel.tsx`
- `src/features/finance-management/DailyExpensePoolPanel.test.tsx`
- `src/features/finance-management/FinanceManagementPanel.tsx`
- `src/features/finance-management/FinanceManagementPanel.test.tsx`
- `src/features/finance-management/finance-management.module.css`

## Checklist

- [x] 日常开销池仍展示开销池当前余额。
- [x] 日常开销池仍展示当前划款来源钱包容器。
- [x] 日常开销池仍提供切换划款来源容器入口。
- [x] 日常开销池仍提供划入金额输入。
- [x] 日常开销池仍提供划款按钮。
- [x] 日常开销池仍展示最近一次划款金额。
- [x] 日常开销池仍展示最近一次划款日期。
- [x] 日常开销池仍展示最近一次划款来源容器名称快照。
- [x] 日常开销池仍展示消费金额输入。
- [x] 日常开销池仍展示消费备注输入。
- [x] 日常开销池仍展示立即扣款按钮。
- [x] 日常开销池不再展示消费流水列表。
- [x] 日常开销池不再展示消费流水独立标题。
- [x] 日常开销池不再展示消费流水空状态。
- [x] 日常开销池不再把消费流水作为第三个用户侧小窗口。
- [x] 没有钱包容器时，划款入口仍禁用。
- [x] 当前划款来源容器缺失时，划款入口仍禁用。
- [x] 当前划款来源容器缺失时，消费结算仍按开销池余额可用。
- [x] 消费成功后开销池余额刷新。
- [x] 消费成功后财富流动日志刷新。
- [x] 消费成功后不修改钱包容器余额。
- [x] 删除消费流水的能力如仍保留入口，应通过统一日志或合适入口触发，不再通过日常开销池列表触发。
- [x] `DailyExpenseEntry` 可以继续作为内部数据存在。
- [x] 不迁移旧消费流水为财富流动日志。
- [x] UI 不展示预算警报。
- [x] UI 不展示超支惩罚。
- [x] UI 不展示财务健康评分。
- [x] UI 不展示消费建议。
- [x] UI 不展示财务诊断。
- [x] 测试日常开销池主信息仍展示。
- [x] 测试划款入口仍可用。
- [x] 测试消费结算仍可用。
- [x] 测试消费流水列表不再展示。
- [x] 测试消费成功后开销池余额刷新。
- [x] 测试消费成功后不修改钱包容器余额。
- [x] 测试 UI 不出现禁止文案。

## 建议验证命令

```bash
npm run test -- src/features/finance-management/DailyExpensePoolPanel.test.tsx
npm run test -- src/features/finance-management/FinanceManagementPanel.test.tsx
npm run typecheck
```
