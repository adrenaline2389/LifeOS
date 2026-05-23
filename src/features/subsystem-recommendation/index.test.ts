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
  it("exposes the v1.1 candidate subsystem list", () => {
    expect(candidateSubsystems).toEqual([
      { id: "ecosystem", label: "个人生态系统", description: "生理基础与生活环境。" },
      { id: "energy", label: "能量管理系统", description: "心理余量与恢复。" },
      { id: "cognition", label: "认知管理系统", description: "信息、学习、判断和反思。" },
      { id: "goals", label: "人生目标管理系统", description: "方向、项目和行动。" },
      { id: "relationships", label: "人际关系管理系统", description: "连接、沟通和边界。" },
      { id: "finance", label: "财务管理系统", description: "资源、消费和自由度。" },
    ]);
  });

  it("recommends the personal ecosystem subsystem from body and environment answers", () => {
    const suggestions = recommendSubsystems(
      answerRecord([
        ["q1-state-decline-signal", ["q1-sleep", "q1-food"]],
        ["q2-recovery-method", ["q2-sleep", "q2-tidy-space"]],
        ["q7-current-improvement-area", ["q7-body-routine"]],
        ["q8-growth-direction", ["q8-more-self-caring"]],
      ]),
    );

    expect(suggestions[0]).toMatchObject({
      id: "ecosystem",
      label: "个人生态系统",
    });
    expect(suggestions[0]?.reason).toContain("睡眠");
    expect(suggestions[0]?.sourceAnswerRefs).toEqual(
      expect.arrayContaining([
        { questionId: "q1-state-decline-signal", optionId: "q1-sleep" },
        { questionId: "q2-recovery-method", optionId: "q2-sleep" },
        { questionId: "q7-current-improvement-area", optionId: "q7-body-routine" },
      ]),
    );
  });

  it("does not recommend the personal manual subsystem from unclear or future-note answers", () => {
    const suggestions = recommendSubsystems({
      completedAt,
      answers: [
        {
          questionId: "q1-state-decline-signal",
          type: "multi-select",
          selectedOptionIds: ["q1-unclear"],
        },
        {
          questionId: "q3-action-rhythm",
          type: "multi-select",
          selectedOptionIds: ["q3-not-observed"],
        },
        {
          questionId: "q9-future-self-note",
          type: "short-text",
          value: "以后再慢慢补充。",
          skipped: false,
        },
      ],
    });

    expect(candidateSubsystems.some((subsystem) => String(subsystem.id) === "manual")).toBe(false);
    expect(suggestions.some((suggestion) => String(suggestion.id) === "manual")).toBe(false);
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

  it("recommends the energy subsystem from psychological energy answers", () => {
    const suggestions = recommendSubsystems(
      answerRecord([
        ["q1-state-decline-signal", ["q1-emotional-stability"]],
        ["q2-recovery-method", ["q2-disconnect"]],
        ["q7-current-improvement-area", ["q7-emotional-stability"]],
        ["q8-growth-direction", ["q8-more-stable"]],
      ]),
    );

    expect(suggestions[0]).toMatchObject({
      id: "energy",
      label: "能量管理系统",
    });
    expect(suggestions[0]?.reason).toContain("情绪稳定");
    expect(suggestions[0]?.sourceAnswerRefs).toEqual(
      expect.arrayContaining([
        { questionId: "q1-state-decline-signal", optionId: "q1-emotional-stability" },
        { questionId: "q2-recovery-method", optionId: "q2-disconnect" },
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
        ["q7-money-spending", "q7-relationships-communication", "q7-emotional-stability"],
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
