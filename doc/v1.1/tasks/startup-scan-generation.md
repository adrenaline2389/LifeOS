# 初始扫描生成模块任务

## 目标

将 v1.0 的个人说明书生成逻辑降级为 v1.1 的启动扫描结果生成逻辑。

## 最小可执行任务

完成 onboarding 后，系统能生成启动扫描结果，包含扫描线索和最多 2 个建议优先开启的子系统。

## 输入

- `OnboardingAnswerRecord`
- 问题 Schema 模块
- 子系统推荐模块

## 输出

- `StartupScanProfile`
- `StartupScanClue[]`
- `SuggestedSubsystem[]`

## 主要文件

- `src/types/lifeos.ts`
- `src/features/startup-scan-generation/index.ts`
- `src/features/startup-scan-generation/index.test.ts`
- 可能新增：`src/features/startup-scan-generation/index.ts`
- 可能新增：`src/features/startup-scan-generation/index.test.ts`

## Checklist

- [x] 新增或定义 `StartupScanProfile` 类型。
- [x] 新增或定义 `StartupScanClue` 类型。
- [x] 启动扫描结果版本为 `"1.1"`。
- [x] 启动扫描结果包含 `scanStatus: "completed"`。
- [x] 启动扫描结果包含带来源回答的扫描线索。
- [x] 调用子系统推荐模块生成最多 2 个建议子系统。
- [x] 不再生成面向用户的 `editableSections`。
- [x] 不再生成 `selfClarity: "hazy"` 作为主界面概念。
- [x] 不调用 AI 服务。
- [x] 不生成诊断标签。
- [x] 测试生成结果包含建议子系统。
- [x] 测试生成结果包含带来源的扫描线索。
- [x] 测试不再要求生成可编辑说明书章节。
- [x] 测试不再要求自我清晰度作为核心字段。

## 建议验证命令

```bash
npm run test -- src/features/startup-scan-generation/index.test.ts
npm run typecheck
```
