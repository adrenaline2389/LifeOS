# 财富流动日志类型与本地存储任务

## 目标

使用 IndexedDB + Dexie 保存、读取、排序和清空财务管理系统财富流动日志。

## 最小可执行任务

系统可以保存 v1.4.3 之后发生的财富流动事件；页面可以读取全部财富流动日志并按发生时间稳定排序；重置会清空财富流动日志。

## 输入

- `doc/v1.4.3/design.md`
- `doc/decisions/0001-local-first.md`
- 现有钱包容器类型。
- 现有收入来源类型。
- 现有日常开销池和消费流水类型。
- 现有本地数据模块。

## 输出

- 财富流动事件类型。
- 财富流动主体快照类型。
- IndexedDB 中的财富流动日志存储。
- 保存财富流动日志函数。
- 读取财富流动日志函数。
- 清空财富流动日志能力。
- 重置清空财富流动日志。
- 对应单元测试。

## 主要文件

- `src/types/lifeos.ts`
- `src/features/local-data/index.ts`
- `src/features/local-data/local-data.test.ts`
- 可能新增：`src/features/finance-management/wealth-flow-storage.ts`
- 可能新增：`src/features/finance-management/wealth-flow-storage.test.ts`

## Checklist

- [x] 定义 `WealthFlowEventType` 类型。
- [x] `WealthFlowEventType` 只包含 `income_received`、`daily_expense_transfer`、`daily_expense_spent` 和 `daily_expense_refund`。
- [x] 定义 `WealthFlowDirection` 类型。
- [x] `WealthFlowDirection` 只包含 `in`、`out` 和 `transfer`。
- [x] 定义 `WealthFlowSubjectType` 类型。
- [x] `WealthFlowSubjectType` 包含 `wallet_container`。
- [x] `WealthFlowSubjectType` 包含 `income_source`。
- [x] `WealthFlowSubjectType` 包含 `daily_expense_pool`。
- [x] `WealthFlowSubjectType` 包含 `daily_expense_entry`。
- [x] `WealthFlowSubjectType` 预留 `dream_account`。
- [x] `WealthFlowSubjectType` 预留 `golden_goose_account`。
- [x] 定义 `WealthFlowSubjectSnapshot` 类型。
- [x] `WealthFlowSubjectSnapshot` 包含 `type`。
- [x] `WealthFlowSubjectSnapshot` 包含可选 `id`。
- [x] `WealthFlowSubjectSnapshot` 包含 `nameSnapshot`。
- [x] 定义 `WealthFlowEvent` 类型。
- [x] `WealthFlowEvent` 包含 `id`。
- [x] `WealthFlowEvent` 包含 `type`。
- [x] `WealthFlowEvent` 包含 `direction`。
- [x] `WealthFlowEvent` 包含正数 `amount`。
- [x] `WealthFlowEvent` 包含 `occurredAt`。
- [x] `WealthFlowEvent` 包含可选 `source`。
- [x] `WealthFlowEvent` 包含可选 `target`。
- [x] `WealthFlowEvent` 包含可选 `relatedEventId`。
- [x] `WealthFlowEvent` 包含可选 `relatedDailyExpenseEntryId`。
- [x] `WealthFlowEvent` 包含可选 `note`。
- [x] `WealthFlowEvent` 包含 `createdAt`。
- [x] `WealthFlowEvent` 包含 `updatedAt`。
- [x] 不新增 `Transaction` 类型。
- [x] 不新增 `LedgerEntry` 类型。
- [x] 不新增通用预算分类类型。
- [x] 不新增梦想账户业务类型。
- [x] 不新增金鹅账户业务类型。
- [x] 为 Dexie 新增财富流动日志存储。
- [x] 新增保存财富流动日志函数。
- [x] 新增读取财富流动日志函数。
- [x] 财富流动日志按 `occurredAt` 或 `createdAt` 稳定倒序排序。
- [x] 新增清空财富流动日志能力。
- [x] `clearLifeOSLocalData` 会清空财富流动日志。
- [x] 保存时不访问网络。
- [x] 保存时不写入服务端。
- [x] 测试保存和读取财富流动日志。
- [x] 测试多条财富流动日志稳定排序。
- [x] 测试读取空日志返回空列表。
- [x] 测试重置会清空财富流动日志。
- [x] 测试重置仍会清空钱包容器。
- [x] 测试重置仍会清空收入来源。
- [x] 测试重置仍会清空日常开销池。
- [x] 测试重置仍会清空消费流水。

## 建议验证命令

```bash
npm run test -- src/features/local-data/local-data.test.ts
npm run test -- src/features/finance-management/wealth-flow-storage.test.ts
npm run typecheck
```
