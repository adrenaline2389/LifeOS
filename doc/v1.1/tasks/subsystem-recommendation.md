# 子系统模型与推荐规则任务

## 目标

将可推荐系统改为六个正式子系统，新增个人生态系统，删除个人说明书系统推荐。

## 最小可执行任务

推荐模块能根据 onboarding 信号推荐最多 2 个子系统，并且可以推荐个人生态系统，不再推荐个人说明书系统。

## 输入

- `OnboardingAnswerRecord`
- 问题 schema 中的 signal tags
- v1.1 六个子系统定义

## 输出

- `SuggestedSubsystem[]`
- 六个候选子系统定义

## 主要文件

- `src/types/lifeos.ts`
- `src/features/subsystem-recommendation/index.ts`
- `src/features/subsystem-recommendation/index.test.ts`

## Checklist

- [x] 将 `SubsystemId` 改为只包含 `ecosystem`、`energy`、`cognition`、`goals`、`relationships`、`finance`。
- [x] 从候选子系统中删除 `manual`。
- [x] 新增 `ecosystem`，标签为“个人生态系统”。
- [x] 为六个子系统统一定义名称和一句说明。
- [x] 增加 `ecosystem` 的推荐原因文案。
- [x] 推荐规则识别 `子系统:ecosystem` 信号。
- [x] 推荐结果最多返回 2 个。
- [x] 每个推荐都包含来源回答引用。
- [x] 推荐理由解释“为什么建议先看这个系统”，不对用户下判断。
- [x] 测试个人生态相关回答可以推荐个人生态系统。
- [x] 测试个人说明书系统不再出现在候选推荐中。
- [x] 测试推荐结果不超过 2 个。
- [x] 测试每个推荐都有来源引用。

## 建议验证命令

```bash
npm run test -- src/features/subsystem-recommendation/index.test.ts
npm run typecheck
```
