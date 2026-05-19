import { describe, expect, it } from "vitest";

import type { OnboardingAnswerRecord } from "@/types/lifeos";
import {
  candidateSubsystems,
  collectAnsweredOptions,
  recommendSubsystems,
} from "./index";

const completedAt = "2026-05-18T08:00:00.000Z";

function answerRecord(
  selections: Array<[questionId: string, selectedOptionIds: string[]]>,
): OnboardingAnswerRecord {
  return {
    completedAt,
    answers: selections.map(([questionId, selectedOptionIds]) => ({
      questionId,
      type: "multi-select",
      selectedOptionIds,
    })),
  };
}

describe("subsystem recommendation", () => {
  it("exposes the v1.0 candidate subsystem list", () => {
    expect(candidateSubsystems).toEqual([
      { id: "energy", label: "能量管理系统" },
      { id: "goals", label: "人生目标管理系统" },
      { id: "relationships", label: "人际关系管理系统" },
      { id: "finance", label: "财务管理系统" },
      { id: "cognition", label: "认知管理系统" },
      { id: "manual", label: "个人说明书系统" },
    ]);
  });

  it("recommends the finance subsystem from money-related answers", () => {
    const suggestions = recommendSubsystems(
      answerRecord([
        ["q1-state-decline-signal", ["q1-spending-control"]],
        ["q7-current-improvement-area", ["q7-money-spending"]],
        ["q8-growth-direction", ["q8-financial-goal"]],
      ]),
    );

    const finance = suggestions.find((suggestion) => suggestion.id === "finance");

    expect(finance).toMatchObject({
      id: "finance",
      label: "财务管理系统",
    });
    expect(finance?.reason).toContain("消费控制");
    expect(finance?.sourceAnswerRefs).toEqual(
      expect.arrayContaining([
        { questionId: "q1-state-decline-signal", optionId: "q1-spending-control" },
        { questionId: "q7-current-improvement-area", optionId: "q7-money-spending" },
        { questionId: "q8-growth-direction", optionId: "q8-financial-goal" },
      ]),
    );
  });

  it("recommends the relationships subsystem from relationship-related answers", () => {
    const suggestions = recommendSubsystems(
      answerRecord([
        ["q4-communication-comfort", ["q4-written"]],
        ["q5-low-state-triggers", ["q5-repeat-questions"]],
        ["q6-long-term-relationship-note", ["q6-respect-boundaries"]],
        ["q7-current-improvement-area", ["q7-relationships-communication"]],
      ]),
    );

    expect(suggestions[0]).toMatchObject({
      id: "relationships",
      label: "人际关系管理系统",
    });
    expect(suggestions[0]?.reason).toContain("用文字说清楚");
    expect(suggestions[0]?.sourceAnswerRefs).toEqual(
      expect.arrayContaining([
        { questionId: "q4-communication-comfort", optionId: "q4-written" },
        { questionId: "q7-current-improvement-area", optionId: "q7-relationships-communication" },
      ]),
    );
  });

  it("recommends the energy subsystem from energy-related answers", () => {
    const suggestions = recommendSubsystems(
      answerRecord([
        ["q1-state-decline-signal", ["q1-sleep"]],
        ["q2-recovery-method", ["q2-walk"]],
        ["q7-current-improvement-area", ["q7-energy-routine"]],
        ["q8-growth-direction", ["q8-more-stable"]],
      ]),
    );

    expect(suggestions[0]).toMatchObject({
      id: "energy",
      label: "能量管理系统",
    });
    expect(suggestions[0]?.reason).toContain("睡眠");
    expect(suggestions[0]?.sourceAnswerRefs).toEqual(
      expect.arrayContaining([
        { questionId: "q1-state-decline-signal", optionId: "q1-sleep" },
        { questionId: "q2-recovery-method", optionId: "q2-walk" },
      ]),
    );
  });

  it("returns deterministic, sourced recommendations capped at two", () => {
    const record = answerRecord([
      ["q1-state-decline-signal", ["q1-sleep", "q1-spending-control", "q1-attention"]],
      ["q2-recovery-method", ["q2-walk", "q2-trusted-talk"]],
      ["q3-action-rhythm", ["q3-deadline-driven"]],
      ["q4-communication-comfort", ["q4-direct-point"]],
      [
        "q7-current-improvement-area",
        ["q7-money-spending", "q7-relationships-communication", "q7-energy-routine"],
      ],
      [
        "q8-growth-direction",
        ["q8-financial-goal", "q8-better-relationships", "q8-more-stable"],
      ],
    ]);

    const first = recommendSubsystems(record);
    const second = recommendSubsystems(record);

    expect(first).toEqual(second);
    expect(first).toHaveLength(2);
    expect(first.every((suggestion) => suggestion.reason.length > 0)).toBe(true);
    expect(
      first.every((suggestion) => suggestion.sourceAnswerRefs.length > 0),
    ).toBe(true);
  });

  it("keeps custom other answers as sourced answered options", () => {
    const answeredOptions = collectAnsweredOptions({
      completedAt,
      answers: [
        {
          questionId: "q1-state-decline-signal",
          type: "multi-select",
          selectedOptionIds: [],
          customText: "我会先逃避打开消息",
        },
      ],
    });

    expect(answeredOptions).toEqual([
      expect.objectContaining({
        questionId: "q1-state-decline-signal",
        optionId: "q1-state-decline-signal-other",
        label: "其他：我会先逃避打开消息",
        signalTags: ["自定义回答", "待验证观察"],
      }),
    ]);
  });
});
