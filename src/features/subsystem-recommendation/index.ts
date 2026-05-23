import type {
  OnboardingAnswerRecord,
  OnboardingQuestion,
  QuestionOption,
  ShortTextAnswer,
  SourceAnswerRef,
  SubsystemId,
  SuggestedSubsystem,
} from "@/types/lifeos";
import { ONBOARDING_QUESTIONS } from "@/features/question-schema";

type CandidateSubsystem = Pick<SuggestedSubsystem, "id" | "label"> & {
  description: string;
};

type AnsweredOption = {
  questionId: string;
  questionOrder: number;
  optionId: string;
  label: string;
  signalTags: string[];
  writeTargets: string[];
};

type ScoredSubsystem = CandidateSubsystem & {
  score: number;
  sourceAnswerRefs: SourceAnswerRef[];
  sourceLabels: string[];
};

export const candidateSubsystems = [
  { id: "ecosystem", label: "个人生态系统", description: "生理基础与生活环境。" },
  { id: "energy", label: "能量管理系统", description: "心理余量与恢复。" },
  { id: "cognition", label: "认知管理系统", description: "信息、学习、判断和反思。" },
  { id: "goals", label: "人生目标管理系统", description: "方向、项目和行动。" },
  { id: "relationships", label: "人际关系管理系统", description: "连接、沟通和边界。" },
  { id: "finance", label: "财务管理系统", description: "资源、消费和自由度。" },
] satisfies CandidateSubsystem[];

export const defaultOnboardingQuestions = [
  {
    id: "q1",
    order: 1,
    title: "当你的状态开始下降时，最先失灵的通常是？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["压力信号", "能量管理系统入口"],
    options: [
      { id: "attention", label: "注意力", signalTags: ["cognition"] },
      { id: "action", label: "行动力", signalTags: ["goals"] },
      { id: "sleep", label: "睡眠", signalTags: ["ecosystem"] },
      { id: "diet", label: "饮食", signalTags: ["ecosystem"] },
      { id: "social-patience", label: "社交耐心", signalTags: ["relationships"] },
      { id: "spending-control", label: "消费控制", signalTags: ["finance"] },
      { id: "expression", label: "表达能力", signalTags: ["relationships"] },
      { id: "emotional-stability", label: "情绪稳定", signalTags: ["energy"] },
      { id: "unclear", label: "我说不清", signalTags: ["cognition"] },
    ],
  },
  {
    id: "q2",
    order: 2,
    title: "什么最容易让你恢复一点？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["恢复方式", "低能量处理方案"],
    options: [
      { id: "solitude", label: "独处", signalTags: ["energy"] },
      { id: "sleep", label: "睡觉", signalTags: ["ecosystem"] },
      { id: "walk", label: "散步", signalTags: ["ecosystem"] },
      { id: "tidy", label: "整理环境", signalTags: ["ecosystem", "cognition"] },
      { id: "trusted-person", label: "和信任的人说话", signalTags: ["relationships"] },
      { id: "small-task", label: "做具体的小事", signalTags: ["energy", "goals"] },
      { id: "music-content", label: "听音乐或看内容", signalTags: ["energy", "cognition"] },
      { id: "exercise", label: "运动", signalTags: ["ecosystem"] },
      { id: "disconnect", label: "暂时断开一切", signalTags: ["energy"] },
    ],
  },
  {
    id: "q3",
    order: 3,
    title: "你推进事情时，通常更适合哪种节奏？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["行动节奏", "目标系统偏好"],
    options: [
      { id: "sprint", label: "短时间冲刺", signalTags: ["goals"] },
      { id: "daily", label: "稳定日更", signalTags: ["goals"] },
      { id: "think-first", label: "先想清楚再动手", signalTags: ["goals", "cognition"] },
      { id: "think-while-doing", label: "边做边想", signalTags: ["goals", "cognition"] },
      { id: "deadline", label: "被外部截止日期推动", signalTags: ["goals"] },
      { id: "together", label: "和别人一起推进", signalTags: ["goals", "relationships"] },
      { id: "inspiration", label: "灵感来了集中做", signalTags: ["goals", "cognition"] },
      { id: "unclear", label: "我还没观察清楚", signalTags: ["cognition"] },
    ],
  },
  {
    id: "q4",
    order: 4,
    title: "别人和你沟通时，哪种方式通常最舒服？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["沟通偏好", "人际关系管理系统入口"],
    options: [
      { id: "direct", label: "直接说重点", signalTags: ["relationships"] },
      { id: "background", label: "先给背景", signalTags: ["relationships", "cognition"] },
      { id: "digest-time", label: "给我时间消化", signalTags: ["relationships", "cognition"] },
      { id: "text", label: "用文字说清楚", signalTags: ["relationships", "cognition"] },
      { id: "in-person", label: "当面快速同步", signalTags: ["relationships"] },
      { id: "confirm-feelings", label: "先确认我的感受", signalTags: ["relationships"] },
      { id: "clear-choices", label: "给出明确选择", signalTags: ["relationships", "goals"] },
      { id: "no-circling", label: "不要绕弯", signalTags: ["relationships"] },
    ],
  },
  {
    id: "q5",
    order: 5,
    title: "当你状态不好时，别人做什么最容易让情况变糟？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["边界", "雷区", "低状态交互说明"],
    options: [
      { id: "rush", label: "催促我", signalTags: ["relationships", "energy"] },
      { id: "repeat-questions", label: "反复追问", signalTags: ["relationships", "energy"] },
      { id: "dismiss-feelings", label: "否定我的感受", signalTags: ["relationships"] },
      { id: "decide-for-me", label: "替我做决定", signalTags: ["relationships"] },
      { id: "lecture", label: "讲大道理", signalTags: ["relationships"] },
      { id: "change-plans", label: "突然改变计划", signalTags: ["relationships", "energy"] },
      { id: "instant-reply", label: "要求我立刻回应", signalTags: ["relationships", "energy"] },
      { id: "disappointed", label: "表现得很失望", signalTags: ["relationships"] },
    ],
  },
  {
    id: "q6",
    order: 6,
    title: "如果有人想长期和你合作或相处，他最好先知道什么？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["别人如何与我相处", "关系说明书"],
    options: [
      { id: "need-space", label: "我需要空间", signalTags: ["relationships"] },
      { id: "clear-expectations", label: "我需要明确预期", signalTags: ["relationships", "goals"] },
      { id: "slow-reply", label: "我不擅长即时回应", signalTags: ["relationships"] },
      { id: "serious-commitment", label: "我对承诺很认真", signalTags: ["relationships", "goals"] },
      { id: "overthink", label: "我容易想太多", signalTags: ["relationships", "cognition"] },
      { id: "respect-boundaries", label: "我需要被尊重边界", signalTags: ["relationships"] },
      { id: "warm-up-slowly", label: "我在熟悉后才放松", signalTags: ["relationships"] },
      {
        id: "expression-lag",
        label: "我的表达方式可能和感受不同步",
        signalTags: ["relationships"],
      },
    ],
  },
  {
    id: "q7",
    order: 7,
    title: "最近你最想修复或改善的是哪一块？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["建议开启的子系统", "当前改善方向"],
    options: [
      { id: "energy", label: "作息与精力", signalTags: ["ecosystem"] },
      { id: "procrastination", label: "拖延与行动", signalTags: ["goals"] },
      { id: "money", label: "金钱与消费", signalTags: ["finance"] },
      { id: "relationships", label: "关系与沟通", signalTags: ["relationships"] },
      { id: "mood", label: "情绪稳定", signalTags: ["energy"] },
      { id: "long-term-goals", label: "长期目标", signalTags: ["goals"] },
      { id: "self-knowledge", label: "自我认知", signalTags: ["cognition"] },
      { id: "learning", label: "学习与成长", signalTags: ["cognition"] },
      { id: "order", label: "生活秩序", signalTags: ["ecosystem", "cognition"] },
    ],
  },
  {
    id: "q8",
    order: 8,
    title: "你更希望 LifeOS 先帮你变成哪种人？",
    type: "multi-select",
    minSelections: 1,
    writeTargets: ["成长方向", "目标系统种子", "财务管理系统入口"],
    options: [
      { id: "stable", label: "更稳定的人", signalTags: ["energy"] },
      { id: "clear", label: "更清醒的人", signalTags: ["cognition"] },
      { id: "action", label: "更有行动力的人", signalTags: ["goals"] },
      { id: "self-care", label: "更会照顾自己的人", signalTags: ["ecosystem"] },
      { id: "relationships", label: "更会处理关系的人", signalTags: ["relationships"] },
      { id: "freedom", label: "更自由的人", signalTags: ["goals"] },
      { id: "creative", label: "更有创造力的人", signalTags: ["cognition"] },
      { id: "control", label: "更有掌控感的人", signalTags: ["goals", "finance"] },
      { id: "financial-goals", label: "更接近财务目标的人", signalTags: ["finance"] },
    ],
  },
  {
    id: "q9",
    order: 9,
    title: "有什么是你希望未来的自己不要忘记的？",
    type: "short-text",
    optional: true,
    placeholder: "可以是一句话、一个提醒、一个底线，或一个你正在努力相信的东西。",
    writeTargets: ["个人说明书首页", "给未来自己的备注"],
  },
] satisfies OnboardingQuestion[];

const reasonEndings: Record<SubsystemId, string> = {
  ecosystem: "可以先用个人生态系统观察作息、身体状态和生活环境。",
  energy: "可以先用能量管理系统记录心理余量、压力信号和恢复方式。",
  cognition: "可以先用认知管理系统记录注意力、学习和自我观察线索。",
  goals: "可以先用人生目标管理系统整理行动节奏和当前推进方式。",
  relationships: "可以先用人际关系管理系统保存沟通偏好、边界和相处说明。",
  finance: "可以先用财务管理系统观察消费控制、金钱目标和掌控感。",
};

export function getQuestionById(
  questionId: string,
  questions: OnboardingQuestion[] = ONBOARDING_QUESTIONS,
): OnboardingQuestion | undefined {
  return questions.find((question) => question.id === questionId);
}

export function getOptionById(
  questionId: string,
  optionId: string,
  questions: OnboardingQuestion[] = ONBOARDING_QUESTIONS,
): QuestionOption | undefined {
  const question = getQuestionById(questionId, questions);

  if (!question || question.type !== "multi-select") {
    return undefined;
  }

  return question.options.find((option) => option.id === optionId);
}

export function collectAnsweredOptions(
  answerRecord: OnboardingAnswerRecord,
  questions: OnboardingQuestion[] = ONBOARDING_QUESTIONS,
): AnsweredOption[] {
  const answersByQuestionId = new Map(
    answerRecord.answers
      .filter((answer) => answer.type === "multi-select")
      .map((answer) => [answer.questionId, answer]),
  );
  const seen = new Set<string>();
  const answeredOptions: AnsweredOption[] = [];

  for (const question of questions) {
    if (question.type !== "multi-select") {
      continue;
    }

    const answer = answersByQuestionId.get(question.id);

    if (!answer || answer.type !== "multi-select") {
      continue;
    }

    for (const optionId of answer.selectedOptionIds) {
      const key = `${question.id}:${optionId}`;

      if (seen.has(key)) {
        continue;
      }

      const option = question.options.find((candidate) => candidate.id === optionId);

      if (!option) {
        continue;
      }

      seen.add(key);
      answeredOptions.push({
        questionId: question.id,
        questionOrder: question.order,
        optionId: option.id,
        label: option.label,
        signalTags: option.signalTags,
        writeTargets: question.writeTargets,
      });
    }

    const customText = answer.customText?.trim();

    if (customText) {
      const optionId = `${question.id}-other`;
      const key = `${question.id}:${optionId}`;

      if (!seen.has(key)) {
        seen.add(key);
        answeredOptions.push({
          questionId: question.id,
          questionOrder: question.order,
          optionId,
          label: `其他：${customText}`,
          signalTags: ["自定义回答", "待验证观察"],
          writeTargets: question.writeTargets,
        });
      }
    }
  }

  return answeredOptions;
}

export function getShortTextAnswer(
  answerRecord: OnboardingAnswerRecord,
  questionId?: string,
): ShortTextAnswer | undefined {
  const answer = answerRecord.answers.find(
    (candidate) =>
      candidate.type === "short-text" &&
      (questionId === undefined || candidate.questionId === questionId),
  );

  return answer?.type === "short-text" ? answer : undefined;
}

export function recommendSubsystems(
  answerRecord: OnboardingAnswerRecord,
  questions: OnboardingQuestion[] = ONBOARDING_QUESTIONS,
): SuggestedSubsystem[] {
  const scored = new Map<SubsystemId, ScoredSubsystem>(
    candidateSubsystems.map((candidate) => [
      candidate.id,
      {
        ...candidate,
        score: 0,
        sourceAnswerRefs: [],
        sourceLabels: [],
      },
    ]),
  );

  for (const answeredOption of collectAnsweredOptions(answerRecord, questions)) {
    for (const signalTag of answeredOption.signalTags) {
      const subsystemId = toSubsystemId(signalTag);

      if (!subsystemId) {
        continue;
      }

      const candidate = scored.get(subsystemId);

      if (!candidate) {
        continue;
      }

      candidate.score += 1;
      pushUniqueRef(candidate.sourceAnswerRefs, {
        questionId: answeredOption.questionId,
        optionId: answeredOption.optionId,
      });
      pushUniqueLabel(candidate.sourceLabels, answeredOption.label);
    }
  }

  return [...scored.values()]
    .filter((candidate) => candidate.score > 0)
    .sort(compareScoredSubsystems)
    .slice(0, 2)
    .map(({ id, label, sourceAnswerRefs, sourceLabels }) => ({
      id,
      label,
      reason: buildReason(id, sourceLabels),
      sourceAnswerRefs,
    }));
}

function compareScoredSubsystems(left: ScoredSubsystem, right: ScoredSubsystem): number {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  return candidateIndex(left.id) - candidateIndex(right.id);
}

function candidateIndex(id: SubsystemId): number {
  return candidateSubsystems.findIndex((candidate) => candidate.id === id);
}

function buildReason(id: SubsystemId, labels: string[]): string {
  const sourceText = labels
    .slice(0, 2)
    .map((label) => `「${label}」`)
    .join("和");

  return `你的回答提到了${sourceText}，${reasonEndings[id]}`;
}

function toSubsystemId(value: string): SubsystemId | null {
  const normalizedValue = value.startsWith("子系统:")
    ? value.replace("子系统:", "")
    : value;

  return candidateSubsystems.some((candidate) => candidate.id === normalizedValue)
    ? (normalizedValue as SubsystemId)
    : null;
}

function pushUniqueRef(refs: SourceAnswerRef[], ref: SourceAnswerRef): void {
  if (
    refs.some(
      (existing) =>
        existing.questionId === ref.questionId && existing.optionId === ref.optionId,
    )
  ) {
    return;
  }

  refs.push(ref);
}

function pushUniqueLabel(labels: string[], label: string): void {
  if (!labels.includes(label)) {
    labels.push(label);
  }
}
