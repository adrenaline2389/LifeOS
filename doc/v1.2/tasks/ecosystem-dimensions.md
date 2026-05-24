# 生态维度配置与类型任务

## 目标

建立个人生态系统的配置化维度模型。

## 最小可执行任务

定义个人生态系统的六个维度、七档语义选项、内部状态分数和观察点类型，并用测试锁定顺序与范围。

## 输入

- `doc/v1.2/design.md`
- `doc/decisions/0004-semantic-observation-events.md`

## 输出

- 生态维度类型。
- 生态观察点类型。
- 六个维度配置。
- 维度配置测试。

## 主要文件

- `src/types/lifeos.ts`
- 新增：`src/features/personal-ecosystem/dimensions.ts`
- 新增：`src/features/personal-ecosystem/dimensions.test.ts`
- 新增：`src/features/personal-ecosystem/index.ts`

## Checklist

- [x] 定义 `EcosystemInternalScore`，范围为 `-3 | -2 | -1 | 0 | 1 | 2 | 3`。
- [x] 定义 `EcosystemDimensionId`。
- [x] 定义 `EcosystemSemanticValue`。
- [x] 定义 `EcosystemDimensionDefinition`。
- [x] 定义 `EcosystemObservation`。
- [x] 新增 `ECOSYSTEM_DIMENSIONS` 配置。
- [x] 六个维度顺序为睡眠恢复、作息节律、身体状态、饮食饮水、活动舒展、环境支撑。
- [x] 每个维度恰好包含 7 个语义值。
- [x] 每个维度的内部状态覆盖 -3 到 +3。
- [x] `没观察` 不进入语义值列表。
- [x] 观察点保存 `valueLabel` 和 `internalScore` 快照。
- [x] 测试维度数量为 6。
- [x] 测试维度顺序固定。
- [x] 测试每个维度恰好 7 个语义值。
- [x] 测试每个维度覆盖 -3 到 +3。
- [x] 测试不存在 `没观察` 语义值。

## 建议验证命令

```bash
npm run test -- src/features/personal-ecosystem/dimensions.test.ts
npm run typecheck
```
