import { describe, expect, it } from "vitest";

import type { OnboardingAnswerRecord } from "@/types/lifeos";
import { generateManualProfile } from "./index";

const completedAt = "2026-05-18T08:00:00.000Z";

const richAnswerRecord: OnboardingAnswerRecord = {
  completedAt,
  answers: [
    {
      questionId: "q1-state-decline-signal",
      type: "multi-select",
      selectedOptionIds: ["q1-sleep", "q1-action"],
    },
    {
      questionId: "q2-recovery-method",
      type: "multi-select",
      selectedOptionIds: ["q2-walk", "q2-sleep"],
    },
    {
      questionId: "q3-action-rhythm",
      type: "multi-select",
      selectedOptionIds: ["q3-deadline-driven"],
    },
    {
      questionId: "q4-communication-comfort",
      type: "multi-select",
      selectedOptionIds: ["q4-written"],
    },
    {
      questionId: "q5-low-state-triggers",
      type: "multi-select",
      selectedOptionIds: ["q5-rush-me"],
    },
    {
      questionId: "q6-long-term-relationship-note",
      type: "multi-select",
      selectedOptionIds: ["q6-respect-boundaries"],
    },
    {
      questionId: "q7-current-improvement-area",
      type: "multi-select",
      selectedOptionIds: ["q7-money-spending", "q7-procrastination-action"],
    },
    {
      questionId: "q8-growth-direction",
      type: "multi-select",
      selectedOptionIds: ["q8-financial-goal"],
    },
    {
      questionId: "q9-future-self-note",
      type: "short-text",
      value: "不要忘记，慢慢来也是在前进。",
      skipped: false,
    },
  ],
};

describe("manual generation", () => {
  it("generates a deterministic hazy v1.0 manual profile", () => {
    const first = generateManualProfile(richAnswerRecord);
    const second = generateManualProfile(richAnswerRecord);

    expect(first).toEqual(second);
    expect(first.version).toBe("1.0");
    expect(first.selfClarity).toBe("hazy");
    expect(first.futureSelfNote).toBe("不要忘记，慢慢来也是在前进。");
    expect(first.suggestedSubsystems).toHaveLength(2);
    expect(first.editableSections.length).toBeGreaterThan(0);
    expect(
      first.editableSections.every(
        (section) =>
          section.source === "generated" && section.updatedAt === completedAt,
      ),
    ).toBe(true);
  });

  it("maps question write targets into identified parameters", () => {
    const profile = generateManualProfile(richAnswerRecord);

    expect(profile.identifiedParameters).toEqual(
      expect.arrayContaining([
        {
          id: "stress-signals",
          label: "压力信号",
          values: ["睡眠", "行动力"],
          sourceQuestionIds: ["q1-state-decline-signal"],
        },
        {
          id: "current-improvement-direction",
          label: "当前改善方向",
          values: ["金钱与消费", "拖延与行动"],
          sourceQuestionIds: ["q7-current-improvement-area"],
        },
      ]),
    );
  });

  it("creates pending observations with source answer references", () => {
    const profile = generateManualProfile(richAnswerRecord);

    expect(profile.pendingObservations.length).toBeGreaterThan(0);
    expect(
      profile.pendingObservations.every(
        (observation) =>
          observation.status === "pending" &&
          observation.sourceAnswerRefs.length > 0,
      ),
    ).toBe(true);
    expect(profile.pendingObservations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceAnswerRefs: expect.arrayContaining([
            { questionId: "q1-state-decline-signal", optionId: "q1-sleep" },
            { questionId: "q2-recovery-method", optionId: "q2-walk" },
          ]),
        }),
        expect.objectContaining({
          sourceAnswerRefs: expect.arrayContaining([
            { questionId: "q4-communication-comfort", optionId: "q4-written" },
            { questionId: "q5-low-state-triggers", optionId: "q5-rush-me" },
          ]),
        }),
      ]),
    );
  });

  it("does not generate diagnostic labels", () => {
    const profileText = JSON.stringify(generateManualProfile(richAnswerRecord));

    expect(profileText).not.toMatch(/诊断|人格诊断|心理诊断|抑郁症|焦虑症|人格障碍/);
  });

  it("only creates finance entry from finance-related growth answers", () => {
    const profile = generateManualProfile({
      completedAt,
      answers: [
        {
          questionId: "q8-growth-direction",
          type: "multi-select",
          selectedOptionIds: ["q8-more-stable"],
        },
      ],
    });

    expect(
      profile.identifiedParameters.some(
        (parameter) =>
          parameter.id === "finance-system-entry" ||
          parameter.label.includes("财务相关"),
      ),
    ).toBe(false);
  });

  it("omits futureSelfNote when the short-text answer is skipped", () => {
    const profile = generateManualProfile({
      completedAt,
      answers: [
        {
          questionId: "q1-state-decline-signal",
          type: "multi-select",
          selectedOptionIds: ["q1-unclear"],
        },
        {
          questionId: "q9-future-self-note",
          type: "short-text",
          value: "",
          skipped: true,
        },
      ],
    });

    expect(profile.futureSelfNote).toBeUndefined();
    expect(profile.editableSections.every((section) => section.source === "generated")).toBe(
      true,
    );
  });
});
