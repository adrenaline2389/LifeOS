"use client";

import { useState } from "react";

import { ONBOARDING_QUESTIONS } from "@/features/question-schema";
import { Button } from "@/features/retro-ui";
import type {
  MultiSelectAnswer,
  OnboardingAnswer,
  OnboardingAnswerRecord,
  OnboardingQuestion,
  ShortTextAnswer,
} from "@/types/lifeos";

import styles from "./onboarding-flow.module.css";
import { validateOnboardingAnswer } from "./validation";

export type OnboardingFlowProps = {
  questions?: OnboardingQuestion[];
  onComplete: (record: OnboardingAnswerRecord) => void;
  className?: string;
  now?: () => Date;
};

function createEmptyAnswer(question: OnboardingQuestion): OnboardingAnswer {
  if (question.type === "multi-select") {
    return {
      questionId: question.id,
      type: "multi-select",
      selectedOptionIds: [],
      customText: "",
    };
  }

  return {
    questionId: question.id,
    type: "short-text",
    value: "",
    skipped: false,
  };
}

function createInitialAnswers(
  questions: OnboardingQuestion[],
): Record<string, OnboardingAnswer> {
  return Object.fromEntries(
    questions.map((question) => [question.id, createEmptyAnswer(question)]),
  );
}

function getAnswer(
  answers: Record<string, OnboardingAnswer>,
  question: OnboardingQuestion,
): OnboardingAnswer {
  return answers[question.id] ?? createEmptyAnswer(question);
}

export function OnboardingFlow({
  questions = ONBOARDING_QUESTIONS,
  onComplete,
  className,
  now = () => new Date(),
}: OnboardingFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OnboardingAnswer>>(() =>
    createInitialAnswers(questions),
  );
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = getAnswer(answers, currentQuestion);
  const isLastQuestion = currentIndex === questions.length - 1;

  function updateAnswer(nextAnswer: OnboardingAnswer) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [nextAnswer.questionId]: nextAnswer,
    }));
  }

  function completeWith(nextAnswers: Record<string, OnboardingAnswer>) {
    const finalAnswers = questions.map((question) => getAnswer(nextAnswers, question));

    onComplete({
      completedAt: now().toISOString(),
      answers: finalAnswers,
    });
  }

  function handlePrevious() {
    setValidationMessage(null);
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function handleNext() {
    const answerForValidation =
      currentQuestion.type === "short-text" && currentAnswer.type === "short-text"
        ? {
            ...currentAnswer,
            skipped: currentAnswer.value.trim().length === 0,
          }
        : currentAnswer;

    const validation = validateOnboardingAnswer(
      currentQuestion,
      answerForValidation,
    );

    if (!validation.valid) {
      setValidationMessage(validation.message);
      return;
    }

    const nextAnswers = {
      ...answers,
      [answerForValidation.questionId]: answerForValidation,
    };

    setAnswers(nextAnswers);
    setValidationMessage(null);

    if (isLastQuestion) {
      completeWith(nextAnswers);
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  function handleSkipFinalQuestion() {
    if (currentQuestion.type !== "short-text") {
      return;
    }

    const skippedAnswer: ShortTextAnswer = {
      questionId: currentQuestion.id,
      type: "short-text",
      value: "",
      skipped: true,
    };
    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: skippedAnswer,
    };

    setAnswers(nextAnswers);
    setValidationMessage(null);
    completeWith(nextAnswers);
  }

  function handleMultiSelectToggle(optionId: string) {
    if (
      currentQuestion.type !== "multi-select" ||
      currentAnswer.type !== "multi-select"
    ) {
      return;
    }

    const selectedOptionIds = currentAnswer.selectedOptionIds;
    const isSelected = selectedOptionIds.includes(optionId);

    const nextSelectedOptionIds = isSelected
      ? selectedOptionIds.filter((selectedOptionId) => selectedOptionId !== optionId)
      : [...selectedOptionIds, optionId];

    const nextAnswer: MultiSelectAnswer = {
      questionId: currentQuestion.id,
      type: "multi-select",
      selectedOptionIds: nextSelectedOptionIds,
      ...(currentAnswer.customText ? { customText: currentAnswer.customText } : {}),
    };

    updateAnswer(nextAnswer);
    setValidationMessage(null);
  }

  function handleMultiSelectCustomTextChange(value: string) {
    if (
      currentQuestion.type !== "multi-select" ||
      currentAnswer.type !== "multi-select"
    ) {
      return;
    }

    updateAnswer({
      questionId: currentQuestion.id,
      type: "multi-select",
      selectedOptionIds: currentAnswer.selectedOptionIds,
      customText: value,
    });
    setValidationMessage(null);
  }

  function handleShortTextChange(value: string) {
    if (currentQuestion.type !== "short-text") {
      return;
    }

    updateAnswer({
      questionId: currentQuestion.id,
      type: "short-text",
      value,
      skipped: value.trim().length === 0,
    });
    setValidationMessage(null);
  }

  return (
    <section
      className={[styles.flow, className].filter(Boolean).join(" ")}
      aria-label="LifeOS 引导流程"
    >
      <p className={styles.progress}>
        问题 {currentQuestion.order} / {questions.length}
      </p>

      <h2 className={styles.questionTitle}>{currentQuestion.title}</h2>

      {currentQuestion.type === "multi-select" &&
      currentAnswer.type === "multi-select" ? (
        <div className={styles.options}>
          <p className={styles.helper}>
            请选择至少 {currentQuestion.minSelections} 个选项，可多选。已选择{" "}
            {currentAnswer.selectedOptionIds.length +
              ((currentAnswer.customText ?? "").trim().length > 0 ? 1 : 0)}
          </p>

          <div className={styles.optionGrid}>
            {currentQuestion.options.map((option) => (
              <label key={option.id} className={styles.option}>
                <input
                  type="checkbox"
                  checked={currentAnswer.selectedOptionIds.includes(option.id)}
                  onChange={() => handleMultiSelectToggle(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          <label className={styles.customOption}>
            <span>其他</span>
            <input
              aria-label={`问题 ${currentQuestion.order} 的其他回答`}
              placeholder="自己补充..."
              type="text"
              value={currentAnswer.customText ?? ""}
              onChange={(event) =>
                handleMultiSelectCustomTextChange(event.target.value)
              }
            />
          </label>
        </div>
      ) : null}

      {currentQuestion.type === "short-text" &&
      currentAnswer.type === "short-text" ? (
        <div className={styles.shortText}>
          <p className={styles.helper}>这一题可以跳过。</p>
          <textarea
            aria-label="给未来自己的备注"
            placeholder={currentQuestion.placeholder}
            value={currentAnswer.value}
            onChange={(event) => handleShortTextChange(event.target.value)}
            rows={5}
          />
        </div>
      ) : null}

      {validationMessage ? (
        <p className={styles.error} role="alert">
          {validationMessage}
        </p>
      ) : null}

      <div className={styles.actions}>
        {currentIndex > 0 ? (
          <Button type="button" onClick={handlePrevious}>
            上一题
          </Button>
        ) : null}

        {isLastQuestion && currentQuestion.type === "short-text" ? (
          <Button type="button" onClick={handleSkipFinalQuestion}>
            跳过并完成
          </Button>
        ) : null}

        <Button type="button" onClick={handleNext}>
          {isLastQuestion ? "完成" : "下一题"}
        </Button>
      </div>
    </section>
  );
}
