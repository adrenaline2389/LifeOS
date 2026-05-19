import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ONBOARDING_QUESTIONS } from "@/features/question-schema";
import type { MultiSelectQuestion, OnboardingQuestion } from "@/types/lifeos";

import { OnboardingFlow } from "./OnboardingFlow";
import { validateOnboardingAnswer } from "./validation";

const fixedNow = () => new Date("2026-05-18T00:00:00.000Z");

function asMultiSelectQuestion(
  question: OnboardingQuestion,
): MultiSelectQuestion {
  if (question.type !== "multi-select") {
    throw new Error(`Expected ${question.id} to be multi-select.`);
  }

  return question;
}

async function answerCurrentMultiSelectQuestion() {
  const user = userEvent.setup();
  const firstOption = screen.getAllByRole("checkbox")[0];

  await user.click(firstOption);
  await user.click(screen.getByRole("button", { name: "下一题" }));
}

describe("validateOnboardingAnswer", () => {
  it("requires at least one selection or custom answer for multi-select questions", () => {
    const question = asMultiSelectQuestion(ONBOARDING_QUESTIONS[0]);

    expect(
      validateOnboardingAnswer(question, {
        questionId: question.id,
        type: "multi-select",
        selectedOptionIds: [],
      }),
    ).toEqual({
      valid: false,
      message: "请至少选择 1 个选项。",
    });

    expect(
      validateOnboardingAnswer(question, {
        questionId: question.id,
        type: "multi-select",
        selectedOptionIds: question.options.slice(0, 4).map((option) => option.id),
      }),
    ).toEqual({ valid: true });

    expect(
      validateOnboardingAnswer(question, {
        questionId: question.id,
        type: "multi-select",
        selectedOptionIds: [],
        customText: "还有：逃避打开消息",
      }),
    ).toEqual({ valid: true });
  });

  it("allows the optional short-text question to be skipped", () => {
    const question = ONBOARDING_QUESTIONS[8];

    expect(
      validateOnboardingAnswer(question, {
        questionId: question.id,
        type: "short-text",
        value: "",
        skipped: true,
      }),
    ).toEqual({ valid: true });
  });
});

describe("OnboardingFlow", () => {
  it("supports moving forward and returning while preserving selected answers", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<OnboardingFlow now={fixedNow} onComplete={onComplete} />);

    expect(
      screen.getByRole("heading", {
        name: "当你的状态开始下降时，最先失灵的通常是？",
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "下一题" }));
    expect(screen.getByText("请至少选择 1 个选项。")).toBeInTheDocument();

    await user.click(screen.getByLabelText("注意力"));
    await user.click(screen.getByRole("button", { name: "下一题" }));

    expect(
      screen.getByRole("heading", { name: "什么最容易让你恢复一点？" }),
    ).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "上一题" }));

    expect(screen.getByLabelText("注意力")).toBeChecked();
  });

  it("allows selecting more than 3 options on multi-select questions", async () => {
    const user = userEvent.setup();

    render(<OnboardingFlow now={fixedNow} onComplete={vi.fn()} />);

    await user.click(screen.getByLabelText("注意力"));
    await user.click(screen.getByLabelText("行动力"));
    await user.click(screen.getByLabelText("睡眠"));
    await user.click(screen.getByLabelText("饮食"));

    expect(screen.getByLabelText("注意力")).toBeChecked();
    expect(screen.getByLabelText("行动力")).toBeChecked();
    expect(screen.getByLabelText("睡眠")).toBeChecked();
    expect(screen.getByLabelText("饮食")).toBeChecked();
    expect(screen.getByText(/请选择至少 1 个选项，可多选。已选择\s+4/)).toBeInTheDocument();
  });

  it("counts the custom other answer as a valid multi-select answer", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<OnboardingFlow now={fixedNow} onComplete={onComplete} />);

    await user.type(
      screen.getByLabelText("问题 1 的其他回答"),
      "打开消息会先卡住",
    );
    await user.click(screen.getByRole("button", { name: "下一题" }));

    expect(
      screen.getByRole("heading", { name: "什么最容易让你恢复一点？" }),
    ).toBeInTheDocument();
  });

  it("emits an OnboardingAnswerRecord only after skipping the optional final question", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<OnboardingFlow now={fixedNow} onComplete={onComplete} />);

    for (let questionIndex = 0; questionIndex < 8; questionIndex += 1) {
      await answerCurrentMultiSelectQuestion();
    }

    expect(
      screen.getByRole("heading", {
        name: "有什么是你希望未来的自己不要忘记的？",
      }),
    ).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "跳过并完成" }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith({
      completedAt: "2026-05-18T00:00:00.000Z",
      answers: [
        ...ONBOARDING_QUESTIONS.slice(0, 8).map((question) => {
          if (question.type !== "multi-select") {
            throw new Error("Expected a multi-select question.");
          }

          return {
            questionId: question.id,
            type: "multi-select",
            selectedOptionIds: [question.options[0].id],
          };
        }),
        {
          questionId: "q9-future-self-note",
          type: "short-text",
          value: "",
          skipped: true,
        },
      ],
    });
  });
});
