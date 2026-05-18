# 个人说明书生成模块任务

## 目标

将 onboarding 回答转换为确定性的个人说明书档案，不使用 AI 分析或心理诊断。

## 最小可执行任务

根据回答和问题 schema 生成 `ManualProfile`，包含自我清晰度、已识别参数、待验证观察、推荐子系统、未来自己的备注和可编辑章节。

## 输入

- `OnboardingAnswerRecord`
- 问题 Schema 模块
- 子系统推荐模块

## 输出

- `ManualProfile`

## Checklist

- [ ] 定义 ManualProfile 类型
- [ ] 定义 IdentifiedParameter 类型
- [ ] 定义 PendingObservation 类型
- [ ] 定义 ManualSection 类型
- [ ] 生成 `selfClarity: "hazy"`
- [ ] 根据 write targets 生成已识别参数
- [ ] 根据回答组合生成待验证观察
- [ ] 为每条待验证观察附加来源回答引用
- [ ] 调用子系统推荐模块生成最多 2 个推荐
- [ ] 将第 9 题写入 `futureSelfNote`
- [ ] 生成可编辑说明书章节
- [ ] 将生成章节标记为 `source: "generated"`
- [ ] 确保生成逻辑确定性
- [ ] 确保不调用 AI 服务
- [ ] 确保不生成诊断标签
- [ ] 为生成结果结构补充测试
- [ ] 为来源引用补充测试

