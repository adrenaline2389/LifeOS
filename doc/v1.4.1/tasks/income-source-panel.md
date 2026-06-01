# 收入来源面板与表单任务

## 目标

在财务管理系统页面中实现“收入来源”面板，支持新建、编辑、删除收入来源。

## 最小可执行任务

用户在已有钱包容器的前提下，可以创建收入来源；收入来源列表展示名称、金额模式、频率模式、目标钱包容器和备注；用户可以编辑和删除收入来源。

## 输入

- 收入来源类型。
- 收入来源存储函数。
- 钱包容器读取函数。
- 复古 UI 系统组件。
- `doc/v1.4.1/design.md`

## 输出

- “收入来源”面板。
- 收入来源列表。
- 收入来源新建和编辑表单。
- 目标钱包容器缺失状态展示。
- 删除收入来源交互。

## 主要文件

- `src/features/finance-management/FinanceManagementPanel.tsx`
- `src/features/finance-management/finance-management.module.css`
- `src/features/finance-management/FinanceManagementPanel.test.tsx`
- 可能新增：`src/features/finance-management/IncomeSourcePanel.tsx`
- 可能新增：`src/features/finance-management/IncomeSourcePanel.test.tsx`

## Checklist

- [x] 财务管理系统页面展示“收入来源”面板。
- [x] 收入来源面板展示本地手动维护说明。
- [x] 收入来源面板提供新增入口。
- [x] 没有钱包容器时，新增入口禁用。
- [x] 没有钱包容器时，提示先创建钱包容器。
- [x] 用户可以填写收入来源名称。
- [x] 名称必填。
- [x] 用户可以选择固定金额。
- [x] 固定金额时必须填写正数金额。
- [x] 用户可以选择不固定金额。
- [x] 不固定金额时不填写默认金额。
- [x] 用户可以选择日结。
- [x] 用户可以选择周结。
- [x] 用户可以选择月结。
- [x] 用户可以选择季结。
- [x] 用户可以选择年结。
- [x] 用户可以选择频率不固定。
- [x] 用户必须选择流入钱包容器。
- [x] 流入钱包容器选项来自“我的钱包”已创建的资金容器。
- [x] 用户可以填写可选备注。
- [x] 保存后生成收入来源。
- [x] 保存后收入来源列表刷新。
- [x] 用户可以编辑已有收入来源名称。
- [x] 用户可以编辑已有收入来源金额模式。
- [x] 用户可以编辑已有收入来源频率模式。
- [x] 用户可以编辑已有收入来源目标钱包容器。
- [x] 用户可以编辑已有收入来源备注。
- [x] 编辑后 `updatedAt` 更新。
- [x] 删除入口放在编辑表单中。
- [x] 用户可以删除收入来源。
- [x] 删除收入来源不影响钱包容器余额。
- [x] 目标钱包容器存在时，列表展示容器名称。
- [x] 目标钱包容器缺失时，列表展示需要重新选择流入钱包。
- [x] 目标钱包容器缺失时，收入来源仍保留。
- [x] UI 不展示收入预测。
- [x] UI 不展示收入稳定性评分。
- [x] UI 不展示职业建议。
- [x] UI 不展示预算警报。
- [x] UI 不展示财务诊断。
- [x] UI 不暗示连接银行、支付平台、雇主系统或税务系统。
- [x] 测试无钱包容器时不能新增收入来源。
- [x] 测试新建固定金额收入来源。
- [x] 测试新建不固定金额收入来源。
- [x] 测试编辑收入来源。
- [x] 测试删除收入来源。
- [x] 测试目标容器缺失状态。
- [x] 测试 UI 不出现禁止文案。

## 建议验证命令

```bash
npm run test -- src/features/finance-management/IncomeSourcePanel.test.tsx
npm run test -- src/features/finance-management/FinanceManagementPanel.test.tsx
npm run typecheck
```
