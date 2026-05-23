import { describe, expect, it } from "vitest";

import type { OnboardingAnswerRecord } from "@/types/lifeos";
import { generateStartupScanProfile } from "./index";

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
      selectedOptionIds: [
        "q7-money-spending",
        "q7-procrastination-action",
        "q7-body-routine",
      ],
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

describe("startup scan generation", () => {
  it("generates a deterministic v1.1 startup scan profile", () => {
    const first = generateStartupScanProfile(richAnswerRecord);
    const second = generateStartupScanProfile(richAnswerRecord);

    expect(first).toEqual(second);
    expect(first.version).toBe("1.1");
    expect(first.completedAt).toBe(completedAt);
    expect(first.scanStatus).toBe("completed");
    expect(first.suggestedSubsystems).toHaveLength(2);
    expect(first.scanClues.length).toBeGreaterThan(0);
    expect("selfClarity" in first).toBe(false);
    expect("editableSections" in first).toBe(false);
    expect("futureSelfNote" in first).toBe(false);
  });

  it("creates scan clues with source answer references", () => {
    const profile = generateStartupScanProfile(richAnswerRecord);

    expect(profile.scanClues.length).toBeGreaterThan(0);
    expect(
      profile.scanClues.every(
        (clue) => clue.text.length > 0 && clue.sourceAnswerRefs.length > 0,
      ),
    ).toBe(true);
    expect(profile.scanClues).toEqual(
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
    const profileText = JSON.stringify(generateStartupScanProfile(richAnswerRecord));

    expect(profileText).not.toMatch(/诊断|人格诊断|心理诊断|抑郁症|焦虑症|人格障碍/);
  });

  it("does not turn future-self notes into persisted manual fields", () => {
    const profile = generateStartupScanProfile({
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
          value: "以后再慢慢补充。",
          skipped: false,
        },
      ],
    });

    expect("futureSelfNote" in profile).toBe(false);
    expect("editableSections" in profile).toBe(false);
    expect(profile.scanClues.some((clue) => clue.text.includes("未来自己的备注"))).toBe(
      false,
    );
  });
});
