import type { OnboardingAnswer, OnboardingQuestion } from "@/types/lifeos";

export type ValidationResult =
  | {
      valid: true;
    }
  | {
      valid: false;
      message: string;
    };

export function validateOnboardingAnswer(
  question: OnboardingQuestion,
  answer: OnboardingAnswer,
): ValidationResult {
  if (answer.questionId !== question.id || answer.type !== question.type) {
    return { valid: false, message: "回答与当前问题不匹配。" };
  }

  if (question.type === "multi-select") {
    if (answer.type !== "multi-select") {
      return { valid: false, message: "回答与当前问题不匹配。" };
    }

    const customText = answer.customText?.trim() ?? "";
    const answerCount =
      answer.selectedOptionIds.length + (customText.length > 0 ? 1 : 0);

    if (answerCount < question.minSelections) {
      return { valid: false, message: "请至少选择 1 个选项。" };
    }

    if (
      question.maxSelections !== undefined &&
      answerCount > question.maxSelections
    ) {
      return {
        valid: false,
        message: `最多选择 ${question.maxSelections} 个选项。`,
      };
    }

    const validOptionIds = new Set(question.options.map((option) => option.id));
    const hasUnknownOption = answer.selectedOptionIds.some(
      (optionId) => !validOptionIds.has(optionId),
    );

    if (hasUnknownOption) {
      return { valid: false, message: "包含未知选项。" };
    }

    return { valid: true };
  }

  if (answer.type !== "short-text") {
    return { valid: false, message: "回答与当前问题不匹配。" };
  }

  if (question.optional) {
    return { valid: true };
  }

  return answer.value.trim().length > 0
    ? { valid: true }
    : { valid: false, message: "请填写这一题。" };
}
