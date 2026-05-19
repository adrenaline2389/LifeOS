import { describe, expect, it, vi } from "vitest";
import type { ManualProfile, OnboardingAnswerRecord } from "@/types/lifeos";
import {
  createLifeOSExportData,
  createLifeOSMarkdown,
  isLifeOSResetConfirmed,
  resetLifeOSDataWithConfirmation,
  stringifyLifeOSExportData,
  triggerBrowserDownload,
} from "./index";

const onboardingAnswerRecord: OnboardingAnswerRecord = {
  completedAt: "2026-05-18T08:00:00.000Z",
  answers: [
    {
      questionId: "q1",
      type: "multi-select",
      selectedOptionIds: ["action", "sleep"],
      customText: "需要先把手机放远",
    },
    {
      questionId: "q9",
      type: "short-text",
      value: "慢慢来，但不要停。",
      skipped: false,
    },
  ],
};

const manualProfile: ManualProfile = {
  version: "1.0",
  selfClarity: "hazy",
  identifiedParameters: [
    {
      id: "energy-signal",
      label: "压力信号",
      values: ["行动力", "睡眠"],
      sourceQuestionIds: ["q1"],
    },
  ],
  pendingObservations: [
    {
      id: "low-energy-action",
      text: "你在压力状态下可能会先失去行动力。",
      status: "pending",
      sourceAnswerRefs: [{ questionId: "q1", optionId: "action" }],
    },
  ],
  suggestedSubsystems: [
    {
      id: "energy",
      label: "能量管理系统",
      reason: "压力信号和恢复方式都指向精力管理。",
      sourceAnswerRefs: [{ questionId: "q1", optionId: "action" }],
    },
  ],
  futureSelfNote: "慢慢来，但不要停。",
  editableSections: [
    {
      id: "homepage",
      title: "个人说明书首页",
      content: "先照顾能量，再推进事情。",
      source: "generated",
      updatedAt: "2026-05-18T08:00:00.000Z",
    },
  ],
};

describe("LifeOS export data", () => {
  it("builds the JSON export structure from local data", () => {
    const exportData = createLifeOSExportData({
      exportedAt: "2026-05-18T09:00:00.000Z",
      onboardingAnswer: onboardingAnswerRecord,
      manualProfile,
    });

    expect(exportData).toEqual({
      exportedAt: "2026-05-18T09:00:00.000Z",
      onboardingAnswer: onboardingAnswerRecord,
      manualProfile,
    });
    expect(JSON.parse(stringifyLifeOSExportData(exportData))).toEqual(
      exportData,
    );
  });

  it("renders markdown with the manual, future note, observations, suggestions, and answers", () => {
    const markdown = createLifeOSMarkdown(
      createLifeOSExportData({
        exportedAt: "2026-05-18T09:00:00.000Z",
        onboardingAnswer: onboardingAnswerRecord,
        manualProfile,
      }),
    );

    expect(markdown).toContain("# LifeOS 个人说明书导出");
    expect(markdown).toContain("导出时间：2026-05-18T09:00:00.000Z");
    expect(markdown).toContain("## 给未来自己的备注");
    expect(markdown).toContain("慢慢来，但不要停。");
    expect(markdown).toContain("## 个人说明书章节");
    expect(markdown).toContain("### 个人说明书首页");
    expect(markdown).toContain("先照顾能量，再推进事情。");
    expect(markdown).toContain("## 待验证观察");
    expect(markdown).toContain("你在压力状态下可能会先失去行动力。");
    expect(markdown).toContain("## 建议开启的子系统");
    expect(markdown).toContain("能量管理系统");
    expect(markdown).toContain("## Onboarding 回答");
    expect(markdown).toContain("q1");
    expect(markdown).toContain("action, sleep, 其他：需要先把手机放远");
  });
});

describe("LifeOS reset confirmation", () => {
  it("requires explicit confirmation before reset", async () => {
    const reset = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

    expect(isLifeOSResetConfirmed({ confirmed: false })).toBe(false);
    await expect(
      resetLifeOSDataWithConfirmation({ confirmed: false, reset }),
    ).resolves.toEqual({ status: "cancelled" });
    expect(reset).not.toHaveBeenCalled();
  });

  it("can require an exact typed confirmation phrase", async () => {
    const reset = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

    expect(
      isLifeOSResetConfirmed({
        confirmed: true,
        typedText: "清空 LifeOS",
        expectedText: "清空 LifeOS",
      }),
    ).toBe(true);

    await expect(
      resetLifeOSDataWithConfirmation({
        confirmed: true,
        typedText: "清空 LifeOS",
        expectedText: "清空 LifeOS",
        reset,
      }),
    ).resolves.toEqual({ status: "reset" });
    expect(reset).toHaveBeenCalledTimes(1);
  });
});

describe("browser download trigger", () => {
  it("creates a Blob URL, clicks a temporary anchor, and revokes the URL", () => {
    const createObjectURL = vi.fn(() => "blob:lifeos-export-test");
    const revokeObjectURL = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const click = vi.fn();

    const createElement = vi
      .spyOn(document, "createElement")
      .mockImplementation((tagName, options) => {
        const element = originalCreateElement(tagName, options);
        if (tagName === "a") {
          element.click = click;
        }
        return element;
      });

    triggerBrowserDownload({
      content: "{}",
      filename: "lifeos-export.json",
      mimeType: "application/json",
      environment: {
        document,
        createObjectURL,
        revokeObjectURL,
      },
    });

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:lifeos-export-test");

    createElement.mockRestore();
  });
});
