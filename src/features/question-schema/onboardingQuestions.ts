import type { OnboardingQuestion } from "@/types/lifeos";

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "q1-state-decline-signal",
    order: 1,
    title: "当你的状态开始下降时，最先失灵的通常是？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["压力信号", "能量管理系统入口"],
    options: [
      {
        id: "q1-attention",
        label: "注意力",
        signalTags: ["压力信号:注意力", "子系统:energy"],
      },
      {
        id: "q1-action",
        label: "行动力",
        signalTags: ["压力信号:行动力", "子系统:goals"],
      },
      {
        id: "q1-sleep",
        label: "睡眠",
        signalTags: ["压力信号:睡眠", "子系统:energy"],
      },
      {
        id: "q1-food",
        label: "饮食",
        signalTags: ["压力信号:饮食", "子系统:energy"],
      },
      {
        id: "q1-social-patience",
        label: "社交耐心",
        signalTags: ["压力信号:社交耐心", "子系统:relationships"],
      },
      {
        id: "q1-spending-control",
        label: "消费控制",
        signalTags: ["压力信号:消费控制", "子系统:finance"],
      },
      {
        id: "q1-expression",
        label: "表达能力",
        signalTags: ["压力信号:表达能力", "子系统:relationships"],
      },
      {
        id: "q1-emotional-stability",
        label: "情绪稳定",
        signalTags: ["压力信号:情绪稳定", "子系统:energy"],
      },
      {
        id: "q1-unclear",
        label: "我说不清",
        signalTags: ["压力信号:尚不清楚", "待验证观察"],
      },
    ],
  },
  {
    id: "q2-recovery-method",
    order: 2,
    title: "什么最容易让你恢复一点？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["恢复方式", "低能量处理方案"],
    options: [
      {
        id: "q2-solitude",
        label: "独处",
        signalTags: ["恢复方式:独处", "低能量处理"],
      },
      {
        id: "q2-sleep",
        label: "睡觉",
        signalTags: ["恢复方式:睡觉", "子系统:energy"],
      },
      {
        id: "q2-walk",
        label: "散步",
        signalTags: ["恢复方式:散步", "子系统:energy"],
      },
      {
        id: "q2-tidy-space",
        label: "整理环境",
        signalTags: ["恢复方式:整理环境", "生活秩序"],
      },
      {
        id: "q2-trusted-talk",
        label: "和信任的人说话",
        signalTags: ["恢复方式:信任对话", "子系统:relationships"],
      },
      {
        id: "q2-small-task",
        label: "做具体的小事",
        signalTags: ["恢复方式:具体小事", "子系统:goals"],
      },
      {
        id: "q2-music-content",
        label: "听音乐或看内容",
        signalTags: ["恢复方式:内容输入", "低能量处理"],
      },
      {
        id: "q2-exercise",
        label: "运动",
        signalTags: ["恢复方式:运动", "子系统:energy"],
      },
      {
        id: "q2-disconnect",
        label: "暂时断开一切",
        signalTags: ["恢复方式:断开连接", "边界"],
      },
    ],
  },
  {
    id: "q3-action-rhythm",
    order: 3,
    title: "你推进事情时，通常更适合哪种节奏？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["行动节奏", "目标系统偏好"],
    options: [
      {
        id: "q3-short-sprint",
        label: "短时间冲刺",
        signalTags: ["行动节奏:短冲刺", "子系统:goals"],
      },
      {
        id: "q3-daily-consistency",
        label: "稳定日更",
        signalTags: ["行动节奏:稳定日更", "子系统:goals"],
      },
      {
        id: "q3-think-first",
        label: "先想清楚再动手",
        signalTags: ["行动节奏:先规划", "认知偏好"],
      },
      {
        id: "q3-think-while-doing",
        label: "边做边想",
        signalTags: ["行动节奏:边做边想", "认知偏好"],
      },
      {
        id: "q3-deadline-driven",
        label: "被外部截止日期推动",
        signalTags: ["行动节奏:截止日期驱动", "子系统:goals"],
      },
      {
        id: "q3-with-others",
        label: "和别人一起推进",
        signalTags: ["行动节奏:协作推进", "子系统:relationships"],
      },
      {
        id: "q3-inspiration-burst",
        label: "灵感来了集中做",
        signalTags: ["行动节奏:灵感集中", "创造力"],
      },
      {
        id: "q3-not-observed",
        label: "我还没观察清楚",
        signalTags: ["行动节奏:尚未观察", "待验证观察"],
      },
    ],
  },
  {
    id: "q4-communication-comfort",
    order: 4,
    title: "别人和你沟通时，哪种方式通常最舒服？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["沟通偏好", "人际关系管理系统入口"],
    options: [
      {
        id: "q4-direct-point",
        label: "直接说重点",
        signalTags: ["沟通偏好:直接重点", "子系统:relationships"],
      },
      {
        id: "q4-context-first",
        label: "先给背景",
        signalTags: ["沟通偏好:先给背景", "子系统:relationships"],
      },
      {
        id: "q4-time-to-process",
        label: "给我时间消化",
        signalTags: ["沟通偏好:需要消化时间", "边界"],
      },
      {
        id: "q4-written",
        label: "用文字说清楚",
        signalTags: ["沟通偏好:文字沟通", "子系统:relationships"],
      },
      {
        id: "q4-quick-sync",
        label: "当面快速同步",
        signalTags: ["沟通偏好:当面同步", "子系统:relationships"],
      },
      {
        id: "q4-feelings-first",
        label: "先确认我的感受",
        signalTags: ["沟通偏好:先确认感受", "低状态交互"],
      },
      {
        id: "q4-clear-options",
        label: "给出明确选择",
        signalTags: ["沟通偏好:明确选择", "认知偏好"],
      },
      {
        id: "q4-no-circling",
        label: "不要绕弯",
        signalTags: ["沟通偏好:不要绕弯", "边界"],
      },
    ],
  },
  {
    id: "q5-low-state-triggers",
    order: 5,
    title: "当你状态不好时，别人做什么最容易让情况变糟？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["边界", "雷区", "低状态交互说明"],
    options: [
      {
        id: "q5-rush-me",
        label: "催促我",
        signalTags: ["雷区:催促", "边界"],
      },
      {
        id: "q5-repeat-questions",
        label: "反复追问",
        signalTags: ["雷区:反复追问", "边界"],
      },
      {
        id: "q5-dismiss-feelings",
        label: "否定我的感受",
        signalTags: ["雷区:否定感受", "低状态交互"],
      },
      {
        id: "q5-decide-for-me",
        label: "替我做决定",
        signalTags: ["雷区:代做决定", "边界"],
      },
      {
        id: "q5-preach",
        label: "讲大道理",
        signalTags: ["雷区:讲大道理", "低状态交互"],
      },
      {
        id: "q5-sudden-plan-change",
        label: "突然改变计划",
        signalTags: ["雷区:突然改计划", "边界"],
      },
      {
        id: "q5-demand-instant-reply",
        label: "要求我立刻回应",
        signalTags: ["雷区:立刻回应", "边界"],
      },
      {
        id: "q5-show-disappointment",
        label: "表现得很失望",
        signalTags: ["雷区:失望表达", "低状态交互"],
      },
    ],
  },
  {
    id: "q6-long-term-relationship-note",
    order: 6,
    title: "如果有人想长期和你合作或相处，他最好先知道什么？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["别人如何与我相处", "关系说明书"],
    options: [
      {
        id: "q6-need-space",
        label: "我需要空间",
        signalTags: ["关系说明:需要空间", "边界"],
      },
      {
        id: "q6-clear-expectations",
        label: "我需要明确预期",
        signalTags: ["关系说明:明确预期", "协作偏好"],
      },
      {
        id: "q6-not-instant-reply",
        label: "我不擅长即时回应",
        signalTags: ["关系说明:非即时回应", "沟通偏好"],
      },
      {
        id: "q6-serious-commitments",
        label: "我对承诺很认真",
        signalTags: ["关系说明:重视承诺", "协作偏好"],
      },
      {
        id: "q6-overthink",
        label: "我容易想太多",
        signalTags: ["关系说明:容易多想", "待验证观察"],
      },
      {
        id: "q6-respect-boundaries",
        label: "我需要被尊重边界",
        signalTags: ["关系说明:尊重边界", "边界"],
      },
      {
        id: "q6-relax-after-familiar",
        label: "我在熟悉后才放松",
        signalTags: ["关系说明:熟悉后放松", "关系节奏"],
      },
      {
        id: "q6-expression-feeling-async",
        label: "我的表达方式可能和感受不同步",
        signalTags: ["关系说明:表达感受不同步", "沟通偏好"],
      },
    ],
  },
  {
    id: "q7-current-improvement-area",
    order: 7,
    title: "最近你最想修复或改善的是哪一块？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["建议开启的子系统", "当前改善方向"],
    options: [
      {
        id: "q7-energy-routine",
        label: "作息与精力",
        signalTags: ["改善方向:作息与精力", "子系统:energy"],
      },
      {
        id: "q7-procrastination-action",
        label: "拖延与行动",
        signalTags: ["改善方向:拖延与行动", "子系统:goals"],
      },
      {
        id: "q7-money-spending",
        label: "金钱与消费",
        signalTags: ["改善方向:金钱与消费", "子系统:finance"],
      },
      {
        id: "q7-relationships-communication",
        label: "关系与沟通",
        signalTags: ["改善方向:关系与沟通", "子系统:relationships"],
      },
      {
        id: "q7-emotional-stability",
        label: "情绪稳定",
        signalTags: ["改善方向:情绪稳定", "子系统:energy"],
      },
      {
        id: "q7-long-term-goals",
        label: "长期目标",
        signalTags: ["改善方向:长期目标", "子系统:goals"],
      },
      {
        id: "q7-self-knowledge",
        label: "自我认知",
        signalTags: ["改善方向:自我认知", "子系统:manual"],
      },
      {
        id: "q7-learning-growth",
        label: "学习与成长",
        signalTags: ["改善方向:学习与成长", "子系统:cognition"],
      },
      {
        id: "q7-life-order",
        label: "生活秩序",
        signalTags: ["改善方向:生活秩序", "子系统:energy"],
      },
    ],
  },
  {
    id: "q8-growth-direction",
    order: 8,
    title: "你更希望 LifeOS 先帮你变成哪种人？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["成长方向", "目标系统种子", "与财务相关时，写入财务管理系统入口"],
    options: [
      {
        id: "q8-more-stable",
        label: "更稳定的人",
        signalTags: ["成长方向:稳定", "子系统:energy"],
      },
      {
        id: "q8-more-clear",
        label: "更清醒的人",
        signalTags: ["成长方向:清醒", "子系统:cognition"],
      },
      {
        id: "q8-more-active",
        label: "更有行动力的人",
        signalTags: ["成长方向:行动力", "子系统:goals"],
      },
      {
        id: "q8-more-self-caring",
        label: "更会照顾自己的人",
        signalTags: ["成长方向:照顾自己", "子系统:energy"],
      },
      {
        id: "q8-better-relationships",
        label: "更会处理关系的人",
        signalTags: ["成长方向:处理关系", "子系统:relationships"],
      },
      {
        id: "q8-more-free",
        label: "更自由的人",
        signalTags: ["成长方向:自由", "子系统:goals"],
      },
      {
        id: "q8-more-creative",
        label: "更有创造力的人",
        signalTags: ["成长方向:创造力", "子系统:cognition"],
      },
      {
        id: "q8-more-control",
        label: "更有掌控感的人",
        signalTags: ["成长方向:掌控感", "子系统:goals"],
      },
      {
        id: "q8-financial-goal",
        label: "更接近财务目标的人",
        signalTags: ["成长方向:财务目标", "子系统:finance"],
      },
    ],
  },
  {
    id: "q9-future-self-note",
    order: 9,
    title: "有什么是你希望未来的自己不要忘记的？",
    type: "short-text",
    optional: true,
    placeholder: "可以是一句话、一个提醒、一个底线，或一个你正在努力相信的东西。",
    writeTargets: ["个人说明书首页", "给未来自己的备注"],
  },
];
