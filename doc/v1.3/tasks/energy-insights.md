# 能量聚合与能量风向标规则任务

## 目标

实现当前能量状态、今日能量轨迹和能量风向标的确定性计算。

## 最小可执行任务

给定一组本地能量观察点，系统可以计算最近状态、当天轨迹，以及 1 天、7 天、15 天、30 天的能量风向标摘要。

## 输入

- `EnergyObservation`
- `ENERGY_DIMENSIONS`
- `doc/v1.3/design.md`

## 输出

- 当前能量状态计算函数。
- 今日能量轨迹分组函数。
- 能量风向标聚合函数。
- 本地时间范围工具。

## 主要文件

- 新增：`src/features/energy-management/insights.ts`
- 新增：`src/features/energy-management/insights.test.ts`
- 可能新增：`src/features/energy-management/time.ts`
- 可能新增：`src/features/energy-management/time.test.ts`

## Checklist

- [x] 实现按浏览器本地日期计算今天范围。
- [x] 实现 1 天范围计算。
- [x] 实现 7 天范围计算。
- [x] 实现 15 天范围计算。
- [x] 实现 30 天范围计算。
- [x] 实现每个维度的最近观察点计算。
- [x] 当前状态能区分今日已观察、最近观察不是今天、从未观察。
- [x] 实现今日观察点按维度分组。
- [x] 今日观察点按时间升序排列。
- [x] 实现每个维度的 `observationCount`。
- [x] 实现每个维度的 `averageInternalScore`。
- [x] 实现 `lowObservationCount`，统计 `internalScore <= -1`。
- [x] 实现 `latestObservation`。
- [x] 实现平均值到最近语义状态的 `summaryLabel`。
- [x] 不对缺失数据插值。
- [x] 不把未观察当作 0 分。
- [x] 不生成诊断、建议或 AI 风格解释。
- [x] 测试稀疏观察点不会被连成连续趋势。
- [x] 测试跨日数据不会进入今日轨迹。
- [x] 测试历史数据可进入 7 天、15 天、30 天统计。

## 建议验证命令

```bash
npm run test -- src/features/energy-management/insights.test.ts
npm run test -- src/features/energy-management/time.test.ts
npm run typecheck
```
