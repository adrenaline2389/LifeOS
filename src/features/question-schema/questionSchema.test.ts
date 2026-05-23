import { describe, expect, it } from "vitest";

import { ONBOARDING_QUESTIONS } from "./onboardingQuestions";

describe("ONBOARDING_QUESTIONS", () => {
  it("contains exactly 9 ordered onboarding questions", () => {
    expect(ONBOARDING_QUESTIONS).toHaveLength(9);
    expect(ONBOARDING_QUESTIONS.map((question) => question.order)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });

  it("defines questions 1-8 as multi-select with min 1, open-ended max, write targets, and stable options", () => {
    const multiSelectQuestions = ONBOARDING_QUESTIONS.slice(0, 8);
    const allOptionIds = new Set<string>();

    for (const question of multiSelectQuestions) {
      expect(question.type).toBe("multi-select");

      if (question.type !== "multi-select") {
        throw new Error(`Expected ${question.id} to be multi-select.`);
      }

      expect(question.minSelections).toBe(1);
      expect(question.maxSelections).toBeUndefined();
      expect(question.writeTargets.length).toBeGreaterThan(0);
      expect(question.options.length).toBeGreaterThanOrEqual(8);

      const questionOptionIds = new Set<string>();

      for (const option of question.options) {
        expect(option.id).toMatch(/^q[1-8]-[a-z0-9-]+$/);
        expect(option.label.trim()).not.toBe("");
        expect(option.signalTags.length).toBeGreaterThan(0);
        expect(questionOptionIds.has(option.id)).toBe(false);
        expect(allOptionIds.has(option.id)).toBe(false);

        questionOptionIds.add(option.id);
        allOptionIds.add(option.id);
      }
    }
  });

  it("defines question 9 as optional short text with write targets and placeholder", () => {
    const question = ONBOARDING_QUESTIONS[8];

    expect(question).toMatchObject({
      id: "q9-future-self-note",
      order: 9,
      type: "short-text",
      optional: true,
      title: "有什么是你希望未来的自己不要忘记的？",
      placeholder:
        "可以是一句话、一个提醒、一个底线，或一个你正在努力相信的东西。",
      writeTargets: ["扫描备注"],
    });
  });

  it("contains ecosystem signals and no manual subsystem signals", () => {
    const allSignalTags = ONBOARDING_QUESTIONS.flatMap((question) =>
      question.type === "multi-select"
        ? question.options.flatMap((option) => option.signalTags)
        : [],
    );

    expect(
      allSignalTags.filter((signalTag) => signalTag === "子系统:ecosystem").length,
    ).toBeGreaterThanOrEqual(6);
    expect(allSignalTags).not.toContain("子系统:manual");

    const question7 =
      ONBOARDING_QUESTIONS.find((question) => question.id === "q7-current-improvement-area");

    expect(question7).toMatchObject({
      type: "multi-select",
      options: expect.arrayContaining([
        expect.objectContaining({
          id: "q7-body-routine",
          label: "作息、饮食与身体状态",
          signalTags: expect.arrayContaining(["子系统:ecosystem"]),
        }),
      ]),
    });
  });
});
