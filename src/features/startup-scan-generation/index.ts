import type {
  OnboardingAnswerRecord,
  OnboardingQuestion,
  SourceAnswerRef,
  StartupScanClue,
  StartupScanProfile,
} from "@/types/lifeos";
import { ONBOARDING_QUESTIONS } from "@/features/question-schema";
import {
  collectAnsweredOptions,
  recommendSubsystems,
} from "@/features/subsystem-recommendation";

type AnsweredOption = ReturnType<typeof collectAnsweredOptions>[number];

export function generateStartupScanProfile(
  answerRecord: OnboardingAnswerRecord,
  questions: OnboardingQuestion[] = ONBOARDING_QUESTIONS,
): StartupScanProfile {
  const answeredOptions = collectAnsweredOptions(answerRecord, questions);

  return {
    version: "1.1",
    completedAt: answerRecord.completedAt,
    scanStatus: "completed",
    scanClues: buildScanClues(answeredOptions),
    suggestedSubsystems: recommendSubsystems(answerRecord, questions),
  };
}

function buildScanClues(answeredOptions: AnsweredOption[]): StartupScanClue[] {
  const clues: StartupScanClue[] = [];
  const stressSignal = firstOptionForQuestion(answeredOptions, "q1");
  const recoveryMethod = firstOptionForQuestion(answeredOptions, "q2");
  const actionRhythm = firstOptionForQuestion(answeredOptions, "q3");
  const communicationPreference = firstOptionForQuestion(answeredOptions, "q4");
  const frictionPoint = firstOptionForQuestion(answeredOptions, "q5");
  const relationshipNote = firstOptionForQuestion(answeredOptions, "q6");
  const improvementDirection = firstOptionForQuestion(answeredOptions, "q7");
  const growthDirection = firstOptionForQuestion(answeredOptions, "q8");

  if (stressSignal && recoveryMethod) {
    clues.push({
      id: "state-recovery-scan",
      text: `状态下降时的信号可能和「${stressSignal.label}」有关，恢复线索可能来自「${recoveryMethod.label}」。`,
      sourceAnswerRefs: refsFor(stressSignal, recoveryMethod),
    });
  }

  if (actionRhythm && improvementDirection) {
    clues.push({
      id: "action-improvement-scan",
      text: `当你想改善「${improvementDirection.label}」时，可能适合从「${actionRhythm.label}」这种节奏开始。`,
      sourceAnswerRefs: refsFor(actionRhythm, improvementDirection),
    });
  }

  if (communicationPreference && frictionPoint) {
    clues.push({
      id: "communication-boundary-scan",
      text: `沟通偏好里出现了「${communicationPreference.label}」，低状态时需要留意「${frictionPoint.label}」。`,
      sourceAnswerRefs: refsFor(communicationPreference, frictionPoint),
    });
  }

  if (relationshipNote) {
    clues.push({
      id: "relationship-scan",
      text: `长期合作或相处中，「${relationshipNote.label}」可能是值得记录的关系线索。`,
      sourceAnswerRefs: refsFor(relationshipNote),
    });
  }

  if (growthDirection) {
    clues.push({
      id: "growth-direction-scan",
      text: `你希望 LifeOS 先支持你成为「${growthDirection.label}」，这可以作为系统开启顺序的参考。`,
      sourceAnswerRefs: refsFor(growthDirection),
    });
  }

  if (clues.length === 0 && answeredOptions[0]) {
    clues.push({
      id: "first-recorded-scan-signal",
      text: `初始扫描先记录了「${answeredOptions[0].label}」这个信号，后续可以在对应系统中继续观察。`,
      sourceAnswerRefs: refsFor(answeredOptions[0]),
    });
  }

  return clues;
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
