# 文档同步任务

## 目标

让项目文档与 v1.2 个人生态系统最小闭环的产品口径一致。

## 最小可执行任务

v1.2 实现完成后，README、current 文档、版本目录和任务进度文件都准确描述当前版本。

## 输入

- `doc/v1.2/design.md`
- `doc/v1.2/tasks/`
- 最终实现结果

## 输出

- 更新后的项目文档。
- 更新后的版本号。

## 主要文件

- `README.md`
- `doc/current.md`
- `doc/README.md`
- `doc/v1.2/tasks/progress.md`
- `package.json`

## Checklist

- [x] README 中的当前版本描述改为 v1.2 口径。
- [x] README 明确 v1.2 是个人生态系统最小观察闭环。
- [x] README 明确 v1.2 仍保持本地优先。
- [x] README 不声称支持 JSON 导出。
- [x] README 不声称支持 Markdown 导出。
- [x] README 不把个人说明书描述为当前主功能。
- [x] README 不把个人生态系统描述为健康建议、诊断或习惯打卡系统。
- [x] `doc/current.md` 当前实现版本指向 v1.2。
- [x] `doc/current.md` 入口指向 `doc/v1.2/design.md`、`doc/v1.2/prompt.md` 和 `doc/v1.2/tasks/`。
- [x] `doc/README.md` 包含 v1.2 目录说明。
- [x] `doc/v1.2/tasks/progress.md` 与实际完成情况一致。
- [x] `package.json` 版本更新为 `1.2.0`。
- [x] 不直接改写 `doc/v1.1/design.md` 的历史叙事。

## 验收要求

- [x] 文档中明确六个子系统仍是 LifeOS 的长期主体。
- [x] 文档中明确 v1.2 只开启个人生态系统。
- [x] 文档中明确其他五个子系统仍后续开放。
- [x] 文档中不再把 9 道题描述为产品核心。
- [x] 文档中不再把个人说明书描述为当前主功能。
- [x] 文档中不声称当前用户侧支持 JSON / Markdown 导出。
- [x] 文档中不声称当前版本提供健康建议、医疗建议、心理诊断或 AI 分析。
