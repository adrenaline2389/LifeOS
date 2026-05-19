# 复古 UI 系统模块任务

## 目标

建立 LifeOS v1.0 的复古 Macintosh 风格 UI 基础组件，供业务模块复用。

## 最小可执行任务

实现一组无业务逻辑的基础 UI 组件，使 onboarding、控制面板、导出重置等模块可以保持统一视觉风格。

## 输入

- LifeOS v1.0 视觉方向
- Next.js + React + TypeScript 技术栈

## 输出

- 可复用 UI 组件
- 基础样式 token

## Checklist

- [x] 定义基础颜色 token
- [x] 定义基础字体和字号规则
- [x] 定义窗口边框和阴影风格
- [x] 实现 StartupScreen 组件
- [x] 实现 WindowFrame 组件
- [x] 实现 Panel 组件
- [x] 实现 Button 组件
- [x] 实现 MultiSelectOptionGroup 组件
- [x] 实现 Dialog 组件
- [x] 实现 StatusLabel 组件
- [x] 实现 SourceReference 组件
- [x] MultiSelectOptionGroup 支持 min/max props
- [x] Dialog 可用于重置确认
- [x] 确保组件不包含 LifeOS 业务逻辑
- [x] 确保视觉不偏未来科技感
- [x] 确保视觉不偏现代金融后台
- [x] 为核心组件补充渲染测试
