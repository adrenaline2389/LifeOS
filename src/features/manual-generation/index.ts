import type {
  IdentifiedParameter,
  ManualProfile,
  ManualSection,
  OnboardingAnswerRecord,
  OnboardingQuestion,
  PendingObservation,
  SourceAnswerRef,
} from "@/types/lifeos";
import { ONBOARDING_QUESTIONS } from "@/features/question-schema";
import {
  collectAnsweredOptions,
  getShortTextAnswer,
  recommendSubsystems,
} from "@/features/subsystem-recommendation";

type AnsweredOption = ReturnType<typeof collectAnsweredOptions>[number];

const targetIds: Record<string, string> = {
  压力信号: "stress-signals",
  能量管理系统入口: "energy-system-entry",
  恢复方式: "recovery-methods",
  低能量处理方案: "low-energy-handling",
  行动节奏: "action-rhythm",
  目标系统偏好: "goals-system-preference",
  沟通偏好: "communication-preference",
  人际关系管理系统入口: "relationship-system-entry",
  边界: "boundaries",
  雷区: "friction-zones",
  低状态交互说明: "low-state-interaction-notes",
  别人如何与我相处: "how-others-work-with-me",
  关系说明书: "relationship-manual",
  建议开启的子系统: "suggested-subsystem-seeds",
  当前改善方向: "current-improvement-direction",
  成长方向: "growth-direction",
  目标系统种子: "goals-system-seed",
  财务管理系统入口: "finance-system-entry",
  个人说明书首页: "manual-home",
  给未来自己的备注: "future-self-note",
};

export function generateManualProfile(
  answerRecord: OnboardingAnswerRecord,
  questions: OnboardingQuestion[] = ONBOARDING_QUESTIONS,
): ManualProfile {
  const answeredOptions = collectAnsweredOptions(answerRecord, questions);
  const futureSelfNote = extractFutureSelfNote(answerRecord);
  const identifiedParameters = buildIdentifiedParameters(answeredOptions);
  const pendingObservations = buildPendingObservations(answeredOptions);
  const suggestedSubsystems = recommendSubsystems(answerRecord, questions);
  const editableSections = buildEditableSections({
    completedAt: answerRecord.completedAt,
    identifiedParameters,
    pendingObservations,
    futureSelfNote,
  });

  return {
    version: "1.0",
    selfClarity: "hazy",
    identifiedParameters,
    pendingObservations,
    suggestedSubsystems,
    ...(futureSelfNote ? { futureSelfNote } : {}),
    editableSections,
  };
}

function buildIdentifiedParameters(answeredOptions: AnsweredOption[]): IdentifiedParameter[] {
  const parameters = new Map<string, IdentifiedParameter>();

  for (const answeredOption of answeredOptions) {
    for (const originalTarget of answeredOption.writeTargets) {
      const target = normalizeWriteTarget(originalTarget, answeredOption);

      if (!target) {
        continue;
      }

      const id = targetIds[target] ?? slugifyTarget(target);
      const parameter = parameters.get(id) ?? {
        id,
        label: target,
        values: [],
        sourceQuestionIds: [],
      };

      pushUniqueString(parameter.values, answeredOption.label);
      pushUniqueString(parameter.sourceQuestionIds, answeredOption.questionId);
      parameters.set(id, parameter);
    }
  }

  return [...parameters.values()];
}

function normalizeWriteTarget(
  target: string,
  answeredOption: AnsweredOption,
): string | null {
  if (!target.includes("财务相关")) {
    return target;
  }

  return answeredOption.signalTags.includes("子系统:finance")
    ? "财务管理系统入口"
    : null;
}

function buildPendingObservations(answeredOptions: AnsweredOption[]): PendingObservation[] {
  const observations: PendingObservation[] = [];
  const stressSignal = firstOptionForQuestion(answeredOptions, "q1");
  const recoveryMethod = firstOptionForQuestion(answeredOptions, "q2");
  const actionRhythm = firstOptionForQuestion(answeredOptions, "q3");
  const communicationPreference = firstOptionForQuestion(answeredOptions, "q4");
  const frictionPoint = firstOptionForQuestion(answeredOptions, "q5");
  const relationshipNote = firstOptionForQuestion(answeredOptions, "q6");
  const improvementDirection = firstOptionForQuestion(answeredOptions, "q7");
  const growthDirection = firstOptionForQuestion(answeredOptions, "q8");

  if (stressSignal && recoveryMethod) {
    observations.push({
      id: "energy-recovery-pattern",
      text: `你在状态下降时可能先注意到「${stressSignal.label}」，恢复线索可能来自「${recoveryMethod.label}」。`,
      status: "pending",
      sourceAnswerRefs: refsFor(stressSignal, recoveryMethod),
    });
  }

  if (actionRhythm && improvementDirection) {
    observations.push({
      id: "action-improvement-pattern",
      text: `当你想改善「${improvementDirection.label}」时，可能更适合用「${actionRhythm.label}」的节奏启动。`,
      status: "pending",
      sourceAnswerRefs: refsFor(actionRhythm, improvementDirection),
    });
  }

  if (communicationPreference && frictionPoint) {
    observations.push({
      id: "communication-boundary-pattern",
      text: `沟通上你可能更偏好「${communicationPreference.label}」，低状态时需要避开「${frictionPoint.label}」。`,
      status: "pending",
      sourceAnswerRefs: refsFor(communicationPreference, frictionPoint),
    });
  }

  if (relationshipNote) {
    observations.push({
      id: "relationship-manual-note",
      text: `长期合作或相处中，「${relationshipNote.label}」可能值得提前写进说明书。`,
      status: "pending",
      sourceAnswerRefs: refsFor(relationshipNote),
    });
  }

  if (growthDirection) {
    observations.push({
      id: "growth-direction-seed",
      text: `你希望 LifeOS 先支持你成为「${growthDirection.label}」，这可以作为后续调整方向。`,
      status: "pending",
      sourceAnswerRefs: refsFor(growthDirection),
    });
  }

  if (observations.length === 0 && answeredOptions[0]) {
    observations.push({
      id: "first-recorded-signal",
      text: `这份说明书先记录了「${answeredOptions[0].label}」这个信号，后续需要继续验证。`,
      status: "pending",
      sourceAnswerRefs: refsFor(answeredOptions[0]),
    });
  }

  return observations;
}

function buildEditableSections(input: {
  completedAt: string;
  identifiedParameters: IdentifiedParameter[];
  pendingObservations: PendingObservation[];
  futureSelfNote?: string;
}): ManualSection[] {
  const overviewContent = [
    "自我清晰度：朦胧。",
    input.futureSelfNote ? `给未来自己的备注：${input.futureSelfNote}` : undefined,
    "所有观察都处于待验证状态，可以在后续使用中手动修正。",
  ]
    .filter(Boolean)
    .join("\n");
  const parameterContent =
    input.identifiedParameters.length > 0
      ? input.identifiedParameters
          .map((parameter) => `- ${parameter.label}: ${parameter.values.join("、")}`)
          .join("\n")
      : "暂未识别到足够参数。";
  const observationContent =
    input.pendingObservations.length > 0
      ? input.pendingObservations.map((observation) => `- ${observation.text}`).join("\n")
      : "暂未生成待验证观察。";

  return [
    {
      id: "overview",
      title: "个人说明书首页",
      content: overviewContent,
      source: "generated",
      updatedAt: input.completedAt,
    },
    {
      id: "identified-parameters",
      title: "已识别参数",
      content: parameterContent,
      source: "generated",
      updatedAt: input.completedAt,
    },
    {
      id: "pending-observations",
      title: "待验证观察",
      content: observationContent,
      source: "generated",
      updatedAt: input.completedAt,
    },
  ];
}

function extractFutureSelfNote(answerRecord: OnboardingAnswerRecord): string | undefined {
  const answer = getShortTextAnswer(answerRecord);

  if (!answer || answer.skipped) {
    return undefined;
  }

  const trimmed = answer.value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function firstOptionForQuestion(
  answeredOptions: AnsweredOption[],
  questionIdPrefix: string,
): AnsweredOption | undefined {
  return answeredOptions.find(
    (answeredOption) =>
      answeredOption.questionId === questionIdPrefix ||
      answeredOption.questionId.startsWith(`${questionIdPrefix}-`),
  );
}

function refsFor(...answeredOptions: AnsweredOption[]): SourceAnswerRef[] {
  return answeredOptions.map((answeredOption) => ({
    questionId: answeredOption.questionId,
    optionId: answeredOption.optionId,
  }));
}

function slugifyTarget(target: string): string {
  return target
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\da-z-]/g, "");
}

function pushUniqueString(values: string[], value: string): void {
  if (!values.includes(value)) {
    values.push(value);
  }
}
