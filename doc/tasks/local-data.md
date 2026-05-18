# 本地数据模块任务

## 目标

实现 LifeOS v1.0 的本地持久化层，确保所有个人数据只保存在用户设备上。

## 最小可执行任务

使用 IndexedDB + Dexie 保存、读取、导出和重置 onboarding 回答与个人说明书档案。

## 输入

- `OnboardingAnswerRecord`
- `ManualProfile`

## 输出

- 本地保存的数据
- JSON 导出数据
- Markdown 导出数据
- 重置后的空状态

## Checklist

- [ ] 安装并配置 Dexie
- [ ] 定义 LifeOS 本地数据库
- [ ] 定义 onboarding answers 表
- [ ] 定义 manual profile 表
- [ ] 实现保存 onboarding 回答接口
- [ ] 实现读取 onboarding 回答接口
- [ ] 实现保存个人说明书档案接口
- [ ] 实现读取个人说明书档案接口
- [ ] 实现导出 JSON 数据接口
- [ ] 实现导出 Markdown 数据接口
- [ ] 实现清空本地 LifeOS 数据接口
- [ ] 确保模块不依赖 UI 组件
- [ ] 确保模块不调用任何云端服务
- [ ] 为保存、读取、导出、重置补充测试

