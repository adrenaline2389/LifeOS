# LifeOS v1.0 Vibe Coding Prompt

## 目标

根据当前项目文档，实现 LifeOS v1.0。

LifeOS v1.0 是一个本地优先、开源的网页端个人人生操作系统。第一版只聚焦“认识自己”的起点：用户通过 9 道 onboarding 问题，生成一份初始的个人说明书控制面板。

实现过程需要由主 Agent 跟踪整体进度，并拆分子 Agent 完成各模块开发、测试和验证。整个过程不需要人工参与，除非遇到文档中没有定义且无法安全推断的问题。

## 输入

- 产品与技术设计：`doc/v1.0/design.md`
- 任务划分目录：`doc/v1.0/tasks/`
- 模块进度文件：`doc/v1.0/tasks/progress.md`

重点阅读：

- `doc/v1.0/tasks/app-shell.md`
- `doc/v1.0/tasks/onboarding.md`
- `doc/v1.0/tasks/question-schema.md`
- `doc/v1.0/tasks/local-data.md`
- `doc/v1.0/tasks/manual-generation.md`
- `doc/v1.0/tasks/manual-panel.md`
- `doc/v1.0/tasks/subsystem-recommendation.md`
- `doc/v1.0/tasks/export-reset.md`
- `doc/v1.0/tasks/retro-ui-system.md`

## 输出

完成 LifeOS v1.0 的可运行实现。

如果项目尚未初始化，应创建 Next.js + React + TypeScript 应用，并按文档要求实现：

- 复古 Macintosh 风格网页界面
- 首次启动引导流程
- 9 道 onboarding 问题
- 本地持久化
- 个人说明书生成
- 个人说明书控制面板
- 完整个人说明书入口与编辑
- 最多 2 个建议开启的子系统
- JSON / Markdown 导出
- 重置本地数据
- 对应单元测试或组件测试

## 技术要求

- 应用框架：Next.js
- 前端框架：React
- 开发语言：TypeScript
- 本地数据：IndexedDB
- IndexedDB 封装：Dexie
- 测试：使用项目内适合 Next.js + React + TypeScript 的测试方案
- 代码质量检查：必须通过 TypeScript 类型检查、测试和 lint / format 检查
- 包管理器：如果项目没有现成配置，默认使用 npm

如果项目中已经存在具体工具配置，并且不与 Next.js + React + TypeScript、本地优先和无云端依赖原则冲突，优先沿用现有配置。不要引入后端服务、账号系统、云端数据库、云同步或外部 AI 服务。

技术栈优先级以本 prompt 为准。实现时必须使用 Next.js + React + TypeScript，不得使用 Vite 初始化或重建项目。

Next.js 仅作为本地 Web App 框架使用。不要实现 API Routes / Server Actions 来处理个人生活数据；涉及 IndexedDB、导入导出和用户交互的模块应运行在浏览器端。若必须使用 Next.js 服务端能力，只能用于框架默认构建、静态资源或本地开发，不得保存、上传或分析用户个人数据。

## 核心产品约束

LifeOS v1.0 必须是本地优先的网页端 app：

- 用户数据只保存在用户自己的设备上。
- 默认不向任何云端上传个人生活数据。
- 不实现账号系统、云同步或多人协作。
- 不使用 AI 分析、AI 推理、心理诊断或人格诊断。
- 所有生成结论都必须是确定性规则生成。
- 所有观察都必须标记为“待验证观察”，不能呈现为最终真相。

界面语言使用简体中文。

## 模块边界

严格按照 `doc/v1.0/design.md` 和 `doc/v1.0/tasks/` 中的模块职责实现。

### App Shell 模块

负责应用整体布局、首次启动判断和高层流程切换。

要求：

- 无本地数据时展示启动界面和 onboarding。
- 有已保存个人说明书档案时展示控制面板。
- 重置后回到首次启动状态。
- 不硬编码问题内容。
- 不包含观察生成逻辑。

### Onboarding 模块

负责渲染 9 道题并产出结构化回答。

要求：

- 第 1-8 题为多选题。
- 每道多选题最少选择 1 个、最多选择 3 个。
- 第 9 题为可跳过短文本题。
- 支持逐题前进和返回修改。
- 完成前不写入持久化数据。
- 完成后输出 `OnboardingAnswerRecord`。

### 问题 Schema 模块

作为 9 道问题的静态事实来源。

要求：

- 定义问题、选项、校验规则、写入目标。
- 每个选项有稳定唯一 id、标签和 signal tags。
- schema 可被 Onboarding、个人说明书生成和子系统推荐模块复用。

### 本地数据模块

负责 LifeOS 数据的本地保存、读取、导出和重置。

要求：

- 使用 IndexedDB + Dexie。
- 保存 onboarding 回答和个人说明书档案。
- 支持 JSON 导出。
- 支持 Markdown 导出。
- 支持清空本地 LifeOS 数据。
- 不依赖 UI 组件。
- 不调用云端服务。

### 个人说明书生成模块

负责将 onboarding 回答转换为 `ManualProfile`。

要求：

- 生成 `selfClarity: "hazy"`。
- 根据 write targets 生成已识别参数。
- 根据回答组合生成待验证观察。
- 每条观察必须附加来源回答引用。
- 调用子系统推荐模块生成最多 2 个推荐。
- 将第 9 题写入 `futureSelfNote`。
- 生成可编辑说明书章节。
- 生成章节标记为 `source: "generated"`。
- 逻辑必须确定性。
- 不调用 AI 服务。
- 不生成诊断标签。

### 子系统推荐模块

负责根据 onboarding 信号生成建议开启的子系统。

要求：

- 最多返回 2 个推荐。
- 每个推荐包含原因文案和来源回答引用。
- 推荐不是 gating 逻辑。
- 不创建真实子系统数据。
- 初始候选子系统包括：
  - 能量管理系统
  - 人生目标管理系统
  - 人际关系管理系统
  - 财务管理系统
  - 认知管理系统
  - 个人说明书系统

### 个人说明书面板模块

负责展示 onboarding 后生成的控制面板。

要求：

- 展示自我清晰度。
- 展示已识别参数。
- 展示待验证观察和来源回答。
- 展示最多 2 个建议开启的子系统。
- 明确推荐不是强制选择。
- 提供完整个人说明书入口。
- 完整个人说明书可编辑。
- 用户编辑后的章节标记为 `source: "user-edited"`。
- 接入 JSON 导出、Markdown 导出和重置入口。

### 导出与重置模块

负责导出和重置操作。

要求：

- JSON 导出包含 onboarding 回答和个人说明书档案。
- Markdown 导出包含个人说明书主要内容、未来自己的备注、待验证观察和建议子系统。
- 重置必须要求用户明确确认。
- 未确认时不能执行重置。
- 确认后调用本地数据模块清空数据。
- 重置后通知 App Shell 回到首次启动状态。

### 复古 UI 系统模块

负责可复用 UI 组件和视觉一致性。

要求：

- 类 Macintosh 复古风格。
- 有旧电脑感、像素感或略显 outdated 的质感。
- 不要未来科技感。
- 不要科幻感。
- 不要现代金融后台感。
- 组件不包含 LifeOS 业务逻辑。
- 至少提供：
  - `StartupScreen`
  - `WindowFrame`
  - `Panel`
  - `Button`
  - `MultiSelectOptionGroup`
  - `Dialog`
  - `StatusLabel`
  - `SourceReference`

## 数据模型参考

以 `doc/v1.0/design.md` 中的数据模型为准。

核心类型至少包括：

- `OnboardingAnswerRecord`
- `ManualProfile`
- `IdentifiedParameter`
- `PendingObservation`
- `SuggestedSubsystem`
- `ManualSection`

类型定义应集中维护，避免 UI、存储和生成逻辑各自重复定义。

## Agent 工作方式

主 Agent 负责：

- 阅读全部输入文档。
- 建立整体实现计划。
- 如果项目尚未初始化，先完成 Next.js + TypeScript 项目初始化。
- 在分派子 Agent 前，先建立共享类型定义、模块目录结构、各模块 public API skeleton 和基础脚本。
- 跟踪 `doc/v1.0/tasks/progress.md` 中的模块进度。
- 拆分子 Agent 任务。
- 审核子 Agent 输出。
- 集成模块。
- 运行最终验证。
- 修复集成问题。

子 Agent 负责：

- 按模块任务文件完成对应模块。
- 补充对应单元测试或组件测试。
- 保持模块边界清晰。
- 不修改无关模块。
- 不引入云端依赖。
- 不重复定义核心类型。
- 不绕过主 Agent 建立的 public API skeleton。

## 并行开发约束

主 Agent 在并行分派前必须先完成：

- 项目初始化。
- 共享类型定义，例如 `OnboardingAnswerRecord`、`ManualProfile`、`IdentifiedParameter`、`PendingObservation`、`SuggestedSubsystem`、`ManualSection`。
- 模块目录结构。
- 各模块 public API skeleton。
- 类型检查、测试、lint / format、生产构建脚本。

子 Agent 只能围绕共享类型和 public API skeleton 实现自己的模块。若发现接口缺失，子 Agent 应在输出中说明需要主 Agent 补充，或在明确属于自己模块边界的情况下补齐最小接口；不得在多个模块内各自创建重复核心类型。

推荐并行拆分：

- 子 Agent A：问题 Schema + Onboarding
- 子 Agent B：本地数据 + 导出与重置
- 子 Agent C：个人说明书生成 + 子系统推荐
- 子 Agent D：复古 UI 系统
- 子 Agent E：个人说明书面板
- 主 Agent：App Shell、集成、进度文件、最终验证

如果可用子 Agent 数量有限，优先保持子 Agent D 只负责复古 UI 系统，由主 Agent 承担个人说明书面板集成。不要让同一个子 Agent 同时大范围修改 UI 基础组件和业务面板，除非主 Agent 已经提供稳定接口并明确写入边界。

如果并行实现导致接口不一致，以 `doc/v1.0/design.md` 的数据模型和模块关系为准，由主 Agent 统一收敛。

## 测试与质量门槛

每个模块必须有对应测试。

最低测试要求：

- 问题 schema 恰好包含 9 道题。
- 第 1-8 题为 multi-select，min 为 1，max 为 3。
- 第 9 题为 optional short-text。
- 每道题内选项 id 唯一。
- Onboarding 不能在未满足选择数量时继续。
- 第 9 题可以跳过。
- 本地数据模块能保存、读取、导出、重置。
- 个人说明书生成逻辑能生成自我清晰度、已识别参数、待验证观察和来源引用。
- 子系统推荐数量不超过 2 个。
- 金钱、关系、能量相关回答能触发对应推荐。
- 控制面板能渲染所有必要区块。
- 导出 JSON 结构合法。
- Markdown 导出包含主要内容。
- 重置必须经过确认。
- 复古 UI 核心组件可渲染。

最终必须运行：

- 类型检查
- 单元测试 / 组件测试
- lint 或 format 检查
- 生产构建
- 本地浏览器冒烟验证

如果项目没有现成脚本，主 Agent 需要补充合理脚本。

最终浏览器冒烟验证要求：

- 启动本地 dev server。
- 打开本地页面。
- 完成 9 道 onboarding。
- 确认控制面板显示自我清晰度、已识别参数、待验证观察、来源回答和建议子系统。
- 确认完整个人说明书可以打开并编辑。
- 确认 JSON 导出可触发。
- 确认 Markdown 导出可触发。
- 确认重置需要明确确认。
- 确认重置后回到首次启动状态。
- 检查浏览器控制台没有阻断主流程的错误。

## 进度更新

每完成一个模块：

1. 确认该模块任务文件 checklist 全部完成。
2. 确认该模块测试通过。
3. 确认没有引入云端依赖。
4. 确认模块边界符合 `doc/v1.0/design.md`。
5. 由主 Agent 更新 `doc/v1.0/tasks/progress.md`。

不要在未通过测试时标记完成。

## 不允许做的事

- 不实现账号系统。
- 不实现云同步。
- 不接入云端数据库。
- 不接入外部 AI 服务。
- 不生成心理诊断、人设标签或人格判断。
- 不把待验证观察写成确定结论。
- 不把推荐子系统做成必须开启的流程。
- 不实现完整财务记账、完整目标树、完整关系 CRM 或完整块编辑器。
- 不扩大 onboarding 到 9 题之外。
- 不在 onboarding 阶段追加条件追问。
- 不把界面做成现代金融后台、SaaS 管理台或未来科技风。
- 不使用 Vite 初始化或重建项目。

## 遇到不明确问题时

优先从以下文件推断：

1. `doc/v1.0/design.md`
2. 对应 `doc/v1.0/tasks/*.md`
3. `doc/v1.0/tasks/progress.md`

如果仍无法确定，并且会影响数据模型、模块边界、用户数据安全或产品范围，必须暂停并向我提问。

对于不影响核心行为的小型实现细节，使用最简单、最本地优先、最少依赖的方案。

## 最终完成标准

LifeOS v1.0 可以在本地启动并完成完整流程：

1. 首次打开看到复古启动界面。
2. 用户完成 9 道 onboarding。
3. 系统保存回答到本地 IndexedDB。
4. 系统生成个人说明书档案。
5. 系统展示个人说明书控制面板。
6. 用户能查看待验证观察和来源回答。
7. 用户能看到最多 2 个建议开启的子系统。
8. 用户能进入并编辑完整个人说明书。
9. 用户能导出 JSON。
10. 用户能导出 Markdown。
11. 用户能确认后重置本地数据。
12. 重置后回到首次启动状态。
13. 全部测试、类型检查、lint / format 检查、生产构建和本地浏览器冒烟验证通过。
