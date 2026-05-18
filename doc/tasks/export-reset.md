# 导出与重置模块任务

## 目标

提供本地数据的 JSON / Markdown 导出能力，以及明确确认后的本地数据重置能力。

## 最小可执行任务

用户可以导出当前 LifeOS 数据，也可以在确认后清空本地 LifeOS 数据。

## 输入

- 本地数据模块
- `OnboardingAnswerRecord`
- `ManualProfile`

## 输出

- JSON 文件内容
- Markdown 文件内容
- 重置完成状态

## Checklist

- [ ] 实现 JSON 导出函数
- [ ] JSON 导出包含 onboarding 回答
- [ ] JSON 导出包含个人说明书档案
- [ ] 实现 Markdown 导出函数
- [ ] Markdown 导出包含个人说明书主要内容
- [ ] Markdown 导出包含未来自己的备注
- [ ] Markdown 导出包含待验证观察
- [ ] Markdown 导出包含建议子系统
- [ ] 实现浏览器下载触发逻辑
- [ ] 实现重置确认对话框
- [ ] 未确认时不执行重置
- [ ] 确认后调用本地数据模块清空数据
- [ ] 重置后通知 App Shell 回到首次启动状态
- [ ] 确保导出和重置不依赖云服务
- [ ] 为 JSON 导出结构补充测试
- [ ] 为 Markdown 导出内容补充测试
- [ ] 为重置确认逻辑补充测试

