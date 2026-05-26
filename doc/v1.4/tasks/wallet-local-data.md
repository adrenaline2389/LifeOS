# 钱包容器类型与本地存储任务

## 目标

使用 IndexedDB + Dexie 保存、读取、更新、删除和清空财务管理系统钱包容器。

## 最小可执行任务

用户新建或编辑资金容器后，数据保存在本地；页面可以读取全部钱包容器；重置会清空钱包容器。

## 输入

- `doc/v1.4/design.md`
- `doc/decisions/0001-local-first.md`
- 现有本地数据模块。

## 输出

- 钱包容器类型。
- IndexedDB 中的钱包容器表。
- 保存钱包容器函数。
- 删除钱包容器函数。
- 读取钱包容器函数。
- 重置清空钱包容器。

## 主要文件

- `src/types/lifeos.ts`
- `src/features/local-data/index.ts`
- `src/features/local-data/local-data.test.ts`
- 可能新增：`src/features/finance-management/storage.ts`
- 可能新增：`src/features/finance-management/storage.test.ts`

## Checklist

- [x] 定义 `WalletContainer` 类型。
- [x] `WalletContainer` 包含 `id`。
- [x] `WalletContainer` 包含 `name`。
- [x] `WalletContainer` 包含 `balance`。
- [x] `WalletContainer` 包含 `color`。
- [x] `WalletContainer` 包含可选 `note`。
- [x] `WalletContainer` 包含 `createdAt`。
- [x] `WalletContainer` 包含 `updatedAt`。
- [x] `balance` 允许保存正数。
- [x] `balance` 允许保存 0。
- [x] `balance` 允许保存负数。
- [x] 不新增资金容器分类字段。
- [x] 不新增资金容器类型字段。
- [x] 为 Dexie 新增钱包容器表。
- [x] 新增保存钱包容器函数。
- [x] 相同 id 的钱包容器保存会覆盖旧值。
- [x] 新增读取全部钱包容器函数。
- [x] 新增删除单个钱包容器函数。
- [x] `clearLifeOSLocalData` 会清空钱包容器。
- [x] 重置仍会清空生态观察点。
- [x] 重置仍会清空能量观察点。
- [x] 保存时不访问网络。
- [x] 保存时不写入服务端。
- [x] 测试保存单个钱包容器。
- [x] 测试更新钱包容器。
- [x] 测试删除钱包容器。
- [x] 测试读取全部钱包容器。
- [x] 测试负数余额可以保存和读取。
- [x] 测试重置会清空钱包容器。

## 建议验证命令

```bash
npm run test -- src/features/local-data/local-data.test.ts
npm run test -- src/features/finance-management/storage.test.ts
npm run typecheck
```
