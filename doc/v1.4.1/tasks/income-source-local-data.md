# 收入来源类型与本地存储任务

## 目标

使用 IndexedDB + Dexie 保存、读取、更新、删除和清空财务管理系统收入来源。

## 最小可执行任务

用户新建或编辑收入来源后，数据保存在本地；页面可以读取全部收入来源；重置会清空收入来源。

## 输入

- `doc/v1.4.1/design.md`
- `doc/decisions/0001-local-first.md`
- 现有钱包容器类型。
- 现有本地数据模块。

## 输出

- 收入来源类型。
- IndexedDB 中的收入来源表。
- 保存收入来源函数。
- 删除收入来源函数。
- 读取全部收入来源函数。
- 重置清空收入来源。

## 主要文件

- `src/types/lifeos.ts`
- `src/features/local-data/index.ts`
- `src/features/local-data/local-data.test.ts`
- 可能新增：`src/features/finance-management/income-source-storage.ts`
- 可能新增：`src/features/finance-management/income-source-storage.test.ts`

## Checklist

- [x] 定义 `MoneyAmountPattern` 类型。
- [x] `MoneyAmountPattern` 支持固定金额。
- [x] `MoneyAmountPattern` 支持不固定金额。
- [x] 固定金额包含 `amount`。
- [x] 不固定金额不包含默认金额。
- [x] 定义 `MoneyFrequencyPattern` 类型。
- [x] `MoneyFrequencyPattern` 支持固定频率。
- [x] `MoneyFrequencyPattern` 支持不固定频率。
- [x] 固定频率支持 `daily`。
- [x] 固定频率支持 `weekly`。
- [x] 固定频率支持 `monthly`。
- [x] 固定频率支持 `quarterly`。
- [x] 固定频率支持 `yearly`。
- [x] 定义 `MoneyInflowSource` 类型。
- [x] `MoneyInflowSource` 包含 `id`。
- [x] `MoneyInflowSource` 包含 `name`。
- [x] `MoneyInflowSource` 包含 `amountPattern`。
- [x] `MoneyInflowSource` 包含 `frequencyPattern`。
- [x] `MoneyInflowSource` 包含 `targetWalletContainerId`。
- [x] `MoneyInflowSource` 包含可选 `note`。
- [x] `MoneyInflowSource` 包含 `createdAt`。
- [x] `MoneyInflowSource` 包含 `updatedAt`。
- [x] 不新增 `stability` 字段。
- [x] 不新增入账历史类型。
- [x] 不新增流水类型。
- [x] 为 Dexie 新增收入来源表。
- [x] 新增保存收入来源函数。
- [x] 相同 id 的收入来源保存会覆盖旧值。
- [x] 新增读取全部收入来源函数。
- [x] 新增删除单个收入来源函数。
- [x] `clearLifeOSLocalData` 会清空收入来源。
- [x] 重置仍会清空钱包容器。
- [x] 重置仍会清空生态观察点。
- [x] 重置仍会清空能量观察点。
- [x] 保存时不访问网络。
- [x] 保存时不写入服务端。
- [x] 测试保存单个收入来源。
- [x] 测试更新收入来源。
- [x] 测试删除收入来源。
- [x] 测试读取全部收入来源。
- [x] 测试不固定金额来源可以保存和读取。
- [x] 测试不固定频率来源可以保存和读取。
- [x] 测试重置会清空收入来源。

## 建议验证命令

```bash
npm run test -- src/features/local-data/local-data.test.ts
npm run test -- src/features/finance-management/income-source-storage.test.ts
npm run typecheck
```
