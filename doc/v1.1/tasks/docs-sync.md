# 文档同步任务

## 目标

让项目文档与 v1.1 减法重构后的产品口径一致。

## 最小可执行任务

v1.1 实现完成后，README、current 文档和任务进度文件都准确描述当前版本。

## 输入

- `doc/v1.1/design.md`
- `doc/v1.1/tasks/`
- 最终实现结果

## 输出

- 更新后的项目文档

## 主要文件

- `README.md`
- `doc/current.md`
- `doc/README.md`
- `doc/v1.1/tasks/progress.md`
- 可能新增：`doc/v1.0/errata.md`

## Checklist

- [x] README 中的当前版本描述改为 v1.1 口径。
- [x] README 明确 v1.1 是六系统启动器。
- [x] README 不再声称当前用户侧支持 JSON 导出。
- [x] README 不再声称当前用户侧支持 Markdown 导出。
- [x] README 不再把个人说明书描述为当前主功能。
- [x] `doc/current.md` 当前实现版本指向 v1.1。
- [x] `doc/current.md` 入口指向 `doc/v1.1/design.md`、`doc/v1.1/prompt.md` 和 `doc/v1.1/tasks/`。
- [x] `doc/README.md` 包含 v1.1 目录说明。
- [x] `doc/v1.1/tasks/progress.md` 与实际完成情况一致。
- [x] 不直接改写 `doc/v1.0/design.md` 的历史叙事。
- [x] 如需解释 v1.0 与后续方向偏差，新增勘误文件。

## 验收要求

- [x] 文档中不再把 9 道题描述为产品核心。
- [x] 文档中不再把个人说明书描述为当前主功能。
- [x] 文档中不再声称当前用户侧支持 JSON / Markdown 导出。
- [x] 文档中明确六个子系统是 LifeOS 的长期主体。
