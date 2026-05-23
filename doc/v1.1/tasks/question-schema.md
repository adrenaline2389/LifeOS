# Onboarding 题目与信号修正任务

## 目标

保留 9 道 onboarding 题，但将题目事实源从“生成说明书”转向“推荐六个子系统”。

## 最小可执行任务

9 道题仍可完成首次启动扫描，并能为六个子系统推荐提供稳定 signal tags。

## 输入

- v1.0 onboarding 题目结构
- v1.1 六个子系统定义
- `doc/v1.1/design.md`

## 输出

- 更新后的 onboarding question schema
- 面向六个子系统推荐的 signal tags

## 主要文件

- `src/features/question-schema/onboardingQuestions.ts`
- `src/features/question-schema/questionSchema.test.ts`
- `src/features/onboarding/OnboardingFlow.tsx`
- `src/features/onboarding/OnboardingFlow.test.tsx`

## Checklist

- [x] 保持题目数量为 9。
- [x] 第 1-8 题仍然是多选题。
- [x] 第 1-8 题最少选择 1 个。
- [x] 第 1-8 题不设置最大选择数。
- [x] 第 1-8 题保留“其他”文本回答。
- [x] 第 9 题仍然是可跳过短文本题。
- [x] 修改题目和选项信号，让它们服务六个子系统推荐。
- [x] 为睡眠、饮食、运动、整理环境、生活秩序、作息与精力等选项加入 `子系统:ecosystem`。
- [x] 移除或停止使用 `子系统:manual`。
- [x] 将围绕个人说明书的 write targets 降级为扫描线索。
- [x] 避免输出“个人说明书首页”“关系说明书”等长期说明书概念。
- [x] 测试 schema 恰好包含 9 道题。
- [x] 测试第 1-8 题仍为多选且 min 为 1。
- [x] 测试第 9 题仍为可选短文本。
- [x] 测试至少存在若干 `子系统:ecosystem` 信号。
- [x] 测试不存在 `子系统:manual` 信号。

## 建议题目方向

第 1 题仍可问状态下降时最先失灵的部分，但睡眠、饮食应归入个人生态系统。

第 2 题仍可问恢复方式，但睡觉、散步、整理环境、运动应同时支持个人生态系统，独处、断开连接更偏能量管理。

第 7 题“最近你最想修复或改善的是哪一块？”应明确包含个人生态系统入口，例如“作息、饮食与身体状态”。

第 8 题“你更希望 LifeOS 先帮你变成哪种人？”应保留“更会照顾自己的人”，并映射到个人生态系统。

## 建议验证命令

```bash
npm run test -- src/features/question-schema/questionSchema.test.ts
npm run test -- src/features/onboarding/OnboardingFlow.test.tsx
npm run typecheck
```
