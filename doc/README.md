# LifeOS 文档目录

这个目录存放 LifeOS 的产品设计、实现提示词、任务拆分、版本规划和关键技术决策。

这些文档既给人读，也给 agent 读。它们的作用不是替代代码，而是保存项目为什么这样做、当前版本边界在哪里、后续版本应该从哪里继续。

## 目录结构

```text
doc/
  README.md
  current.md
  v1.0/
    design.md
    prompt.md
    tasks/
  v1.1/
    design.md
    prompt.md
    tasks/
  v1.2/
    design.md
    prompt.md
    tasks/
  v1.3/
    design.md
    prompt.md
    tasks/
  v1.4/
    design.md
    prompt.md
    tasks/
  v1.4.1/
    design.md
    prompt.md
    tasks/
  v1.4.2/
    design.md
    prompt.md
    tasks/
  roadmap/
  decisions/
```

## 当前版本

当前开发版本见 `doc/current.md`。

当前版本的主要入口：

- 产品与技术设计：`doc/v1.4.2/design.md`
- Agent 实现提示词：`doc/v1.4.2/prompt.md`
- 模块任务拆分：`doc/v1.4.2/tasks/`
- 模块完成进度：`doc/v1.4.2/tasks/progress.md`

## 版本目录

每个正式版本使用独立目录保存完整上下文，例如 `doc/v1.0/`。

版本目录应包含：

- `design.md`：该版本的产品范围、技术方案、模块边界和数据模型。
- `prompt.md`：给 agent 执行该版本开发时使用的起始 prompt。
- `tasks/`：该版本的模块拆分、checklist 和进度文件。

版本发布后，对应版本目录应尽量冻结。后续只允许修正文档错误、补充勘误或记录与代码实现不一致的地方。新需求、新模块和较大方向调整应进入 `roadmap/` 或新的版本目录。

## Roadmap

`doc/roadmap/` 用来存放未来版本的草案和想法。

适合放在这里的内容：

- v1.3 / v2.0 的候选功能。
- 尚未决定是否进入正式版本的想法。
- 需要进一步验证的产品方向。
- 暂时不能放进当前版本范围的需求。

不要把 roadmap 当作当前版本的需求来源。当前版本以对应版本目录中的 `design.md`、`prompt.md` 和 `tasks/` 为准。

## Decisions

`doc/decisions/` 存放重要决策记录。

适合记录的决策包括：

- 会长期影响架构的技术选择。
- 会影响用户数据安全或隐私边界的产品原则。
- 未来版本可能反复讨论、需要稳定依据的选择。

文件命名格式：

```text
0001-short-title.md
0002-short-title.md
```

编号只表示记录顺序，不表示重要程度。

## 给 Agent 的使用方式

Agent 开始处理 LifeOS 相关任务时，应先阅读：

1. `doc/current.md`
2. 当前版本的 `design.md`
3. 当前版本的 `prompt.md`
4. 当前版本的 `tasks/progress.md`
5. 与任务相关的具体 `tasks/*.md`

如果当前任务涉及架构、数据安全、框架选择或版本范围，还应阅读 `doc/decisions/` 中相关决策。

## Git 管理规则

这些文档应该随代码一起提交到 GitHub。

原因：

- 代码实现可以追溯到设计依据。
- agent 能获得稳定、版本化的上下文。
- 开源协作者能理解项目边界和非目标。
- 版本发布时，代码和文档可以通过 Git tag 对齐。

不要提交包含个人隐私、真实生活数据、密钥、账号信息或私人笔记的文件。项目级设计、任务拆分、agent prompt 和架构决策可以提交。
