import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type {
  ManualProfile,
  OnboardingAnswerRecord,
} from "@/types/lifeos";

import { ManualPanel } from "./ManualPanel";

const onboardingAnswer: OnboardingAnswerRecord = {
  completedAt: "2026-05-18T08:00:00.000Z",
  answers: [
    {
      questionId: "q1-state-decline-signal",
      type: "multi-select",
      selectedOptionIds: ["q1-sleep"],
    },
    {
      questionId: "q9-future-self-note",
      type: "short-text",
      value: "慢慢来也是在前进。",
      skipped: false,
    },
  ],
};

const profile: ManualProfile = {
  version: "1.0",
  selfClarity: "hazy",
  futureSelfNote: "慢慢来也是在前进。",
  identifiedParameters: [
    {
      id: "stress-signals",
      label: "压力信号",
      values: ["睡眠"],
      sourceQuestionIds: ["q1-state-decline-signal"],
    },
  ],
  pendingObservations: [
    {
      id: "energy-recovery-pattern",
      text: "你在状态下降时可能先注意到「睡眠」。",
      status: "pending",
      sourceAnswerRefs: [
        {
          questionId: "q1-state-decline-signal",
          optionId: "q1-sleep",
        },
      ],
    },
  ],
  suggestedSubsystems: [
    {
      id: "energy",
      label: "能量管理系统",
      reason: "你的回答提到了「睡眠」，可以先观察状态。",
      sourceAnswerRefs: [
        {
          questionId: "q1-state-decline-signal",
          optionId: "q1-sleep",
        },
      ],
    },
  ],
  editableSections: [
    {
      id: "overview",
      title: "个人说明书首页",
      content: "自我清晰度：朦胧。",
      source: "generated",
      updatedAt: "2026-05-18T08:00:00.000Z",
    },
  ],
};

describe("ManualPanel", () => {
  it("renders the required dashboard blocks and source references", () => {
    render(
      <ManualPanel
        onboardingAnswer={onboardingAnswer}
        onProfileChange={vi.fn()}
        onResetConfirmed={vi.fn()}
        profile={profile}
      />,
    );

    expect(screen.getByText("自我清晰度")).toBeInTheDocument();
    expect(screen.getByText("朦胧")).toBeInTheDocument();
    expect(screen.getByText("系统初步读到的线索")).toBeInTheDocument();
    expect(
      screen.getByText("状态下降时，你可能最先受影响的是：睡眠"),
    ).toBeInTheDocument();
    expect(screen.getByText("查看系统解析细节")).toBeInTheDocument();
    expect(screen.getByText("待验证观察")).toBeInTheDocument();
    expect(screen.getByText("建议开启的子系统")).toBeInTheDocument();
    expect(screen.getByText("完整个人说明书")).toBeInTheDocument();
    expect(screen.getAllByText("第 1 题：睡眠").length).toBeGreaterThan(0);
    expect(screen.queryByText("推荐不是强制选择。")).not.toBeInTheDocument();
  });

  it("marks a saved edited section as user-edited", async () => {
    const user = userEvent.setup();
    const onProfileChange = vi.fn();

    render(
      <ManualPanel
        now={() => new Date("2026-05-18T09:00:00.000Z")}
        onboardingAnswer={onboardingAnswer}
        onProfileChange={onProfileChange}
        onResetConfirmed={vi.fn()}
        profile={profile}
      />,
    );

    await user.click(screen.getByRole("button", { name: "打开完整说明书" }));
    await user.clear(screen.getByLabelText("编辑 个人说明书首页"));
    await user.type(screen.getByLabelText("编辑 个人说明书首页"), "我手动修正了这一节。");
    await user.click(screen.getByRole("button", { name: "保存 个人说明书首页" }));

    expect(onProfileChange).toHaveBeenCalledWith(
      expect.objectContaining({
        editableSections: [
          expect.objectContaining({
            content: "我手动修正了这一节。",
            source: "user-edited",
            updatedAt: "2026-05-18T09:00:00.000Z",
          }),
        ],
      }),
    );
  });

  it("runs export actions and requires explicit reset confirmation", async () => {
    const user = userEvent.setup();
    const onExportJson = vi.fn();
    const onExportMarkdown = vi.fn();
    const onResetConfirmed = vi.fn().mockResolvedValue(undefined);

    render(
      <ManualPanel
        onboardingAnswer={onboardingAnswer}
        onExportJson={onExportJson}
        onExportMarkdown={onExportMarkdown}
        onProfileChange={vi.fn()}
        onResetConfirmed={onResetConfirmed}
        profile={profile}
      />,
    );

    await user.click(screen.getByRole("button", { name: "导出 JSON" }));
    await user.click(screen.getByRole("button", { name: "导出 Markdown" }));
    await user.click(screen.getByRole("button", { name: "重置本地数据" }));
    await user.click(screen.getByRole("button", { name: "确认重置" }));

    expect(onExportJson).toHaveBeenCalledOnce();
    expect(onExportMarkdown).toHaveBeenCalledOnce();
    expect(onResetConfirmed).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("输入 RESET 确认重置"), "RESET");
    await user.click(screen.getByRole("button", { name: "确认重置" }));

    expect(onResetConfirmed).toHaveBeenCalledOnce();
  });
});
