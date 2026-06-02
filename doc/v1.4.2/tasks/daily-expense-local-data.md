# 日常开销池类型与本地存储任务

## 目标

使用 IndexedDB + Dexie 保存、读取、更新、删除和清空财务管理系统日常开销池与消费流水。

## 最小可执行任务

用户划款或消费后，日常开销池状态和消费流水保存在本地；页面可以读取当前开销池和全部消费流水；重置会清空开销池和消费流水。

## 输入

- `doc/v1.4.2/design.md`
- `doc/decisions/0001-local-first.md`
- 现有钱包容器类型。
- 现有收入来源类型。
- 现有本地数据模块。

## 输出

- 日常开销池类型。
- 消费流水类型。
- IndexedDB 中的日常开销池存储。
- IndexedDB 中的消费流水存储。
- 读取日常开销池函数。
- 保存日常开销池函数。
- 读取消费流水函数。
- 保存消费流水函数。
- 删除消费流水函数。
- 重置清空日常开销池和消费流水。

## 主要文件

- `src/types/lifeos.ts`
- `src/features/local-data/index.ts`
- `src/features/local-data/local-data.test.ts`
- 可能新增：`src/features/finance-management/daily-expense-storage.ts`
- 可能新增：`src/features/finance-management/daily-expense-storage.test.ts`

## Checklist

- [x] 定义 `DailyExpensePool` 类型。
- [x] `DailyExpensePool` 包含固定 `id`。
- [x] `DailyExpensePool` 包含 `balance`。
- [x] `DailyExpensePool` 包含可选 `selectedWalletContainerId`。
- [x] `DailyExpensePool` 包含可选 `lastTransferAmount`。
- [x] `DailyExpensePool` 包含可选 `lastTransferAt`。
- [x] `DailyExpensePool` 包含可选 `lastTransferWalletContainerId`。
- [x] `DailyExpensePool` 包含可选 `lastTransferWalletContainerNameSnapshot`。
- [x] `DailyExpensePool` 包含 `createdAt`。
- [x] `DailyExpensePool` 包含 `updatedAt`。
- [x] 定义 `DailyExpenseEntry` 类型。
- [x] `DailyExpenseEntry` 包含 `id`。
- [x] `DailyExpenseEntry` 包含 `amount`。
- [x] `DailyExpenseEntry` 包含 `note`。
- [x] `DailyExpenseEntry` 包含 `spentAt`。
- [x] `DailyExpenseEntry` 包含 `createdAt`。
- [x] `DailyExpenseEntry` 包含 `updatedAt`。
- [x] 不新增多个开销池类型。
- [x] 不新增开销分类类型。
- [x] 不新增周期类型。
- [x] 不新增划款历史类型。
- [x] 不新增完整财富流动日志类型。
- [x] 为 Dexie 新增日常开销池存储。
- [x] 为 Dexie 新增消费流水存储。
- [x] 新增读取日常开销池函数。
- [x] 没有已保存开销池时，读取函数可以返回默认开销池或空状态。
- [x] 新增保存日常开销池函数。
- [x] 相同 id 的日常开销池保存会覆盖旧值。
- [x] 新增读取消费流水函数。
- [x] 消费流水按消费时间或创建时间稳定排序。
- [x] 新增保存消费流水函数。
- [x] 新增删除单条消费流水函数。
- [x] `clearLifeOSLocalData` 会清空日常开销池。
- [x] `clearLifeOSLocalData` 会清空消费流水。
- [x] 重置仍会清空钱包容器。
- [x] 重置仍会清空收入来源。
- [x] 重置仍会清空生态观察点。
- [x] 重置仍会清空能量观察点。
- [x] 保存时不访问网络。
- [x] 保存时不写入服务端。
- [x] 测试保存和读取日常开销池。
- [x] 测试更新日常开销池。
- [x] 测试保存和读取消费流水。
- [x] 测试删除消费流水。
- [x] 测试重置会清空日常开销池。
- [x] 测试重置会清空消费流水。

## 建议验证命令

```bash
npm run test -- src/features/local-data/local-data.test.ts
npm run test -- src/features/finance-management/daily-expense-storage.test.ts
npm run typecheck
```
