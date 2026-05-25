# 本地能量观察点存储任务

## 目标

使用 IndexedDB + Dexie 保存、读取和清空能量管理系统观察点。

## 最小可执行任务

用户记录能量观察点后，数据保存在本地；页面可以按时间范围读取观察点；重置会清空能量观察点。

## 输入

- 能量维度与观察点类型。
- 现有本地数据模块。
- `doc/v1.3/design.md`
- `doc/decisions/0001-local-first.md`
- `doc/decisions/0004-semantic-observation-events.md`

## 输出

- IndexedDB 中的能量观察点表。
- 保存观察点函数。
- 删除观察点函数。
- 按时间范围读取观察点函数。
- 重置清空能量观察点。

## 主要文件

- `src/features/local-data/index.ts`
- `src/features/local-data/local-data.test.ts`
- 可能新增：`src/features/energy-management/storage.ts`
- 可能新增：`src/features/energy-management/storage.test.ts`

## Checklist

- [x] 为 Dexie 新增 `energyObservations` 表。
- [x] 新增保存单个能量观察点的函数。
- [x] 新增删除单个能量观察点的函数。
- [x] 新增按时间范围读取能量观察点的函数。
- [x] 新增读取全部能量观察点的测试辅助能力。
- [x] 保存观察点时保留 `valueLabel` 快照。
- [x] 保存观察点时保留 `internalScore` 快照。
- [x] 读取时间范围使用 `observedAt`。
- [x] `clearLifeOSLocalData` 会清空能量观察点。
- [x] 重置仍会清空生态观察点。
- [x] 本地数据快照不需要默认读取全部能量观察点，避免启动面板承担子系统数据。
- [x] 保存时不访问网络。
- [x] 保存时不写入服务端。
- [x] 测试保存单个观察点。
- [x] 测试相同 id 的观察点保存会覆盖旧值。
- [x] 测试删除单个观察点。
- [x] 测试按范围读取观察点。
- [x] 测试范围外观察点不会出现在结果中。
- [x] 测试重置会清空能量观察点。
- [x] 测试 0 点清零只影响查询结果，不删除历史数据。

## 建议验证命令

```bash
npm run test -- src/features/local-data/local-data.test.ts
npm run test -- src/features/energy-management/storage.test.ts
npm run typecheck
```
