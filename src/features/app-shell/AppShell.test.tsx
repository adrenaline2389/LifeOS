import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type {
  ManualProfile,
  OnboardingAnswerRecord,
} from "@/types/lifeos";

import { AppShell, type AppShellDataAdapter } from "./AppShell";

const completedAnswer: OnboardingAnswerRecord = {
  completedAt: "2026-05-18T08:00:00.000Z",
  answers: [
    {
      questionId: "q1-state-decline-signal",
      type: "multi-select",
      selectedOptionIds: ["q1-sleep"],
    },
    {
      questionId: "q2-recovery-method",
      type: "multi-select",
      selectedOptionIds: ["q2-walk"],
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
      selectedOptionIds: ["q7-energy-routine"],
    },
    {
      questionId: "q8-growth-direction",
      type: "multi-select",
      selectedOptionIds: ["q8-more-stable"],
    },
    {
      questionId: "q9-future-self-note",
      type: "short-text",
      value: "",
      skipped: true,
    },
  ],
};

const manualProfile: ManualProfile = {
  version: "1.0",
  selfClarity: "hazy",
  identifiedParameters: [],
  pendingObservations: [],
  suggestedSubsystems: [],
  editableSections: [],
};

function createAdapter(
  snapshot: {
    onboardingAnswer: OnboardingAnswerRecord | null;
    manualProfile: ManualProfile | null;
  },
): AppShellDataAdapter {
  return {
    read: vi.fn().mockResolvedValue(snapshot),
    saveOnboardingAnswer: vi.fn().mockResolvedValue(undefined),
    saveManualProfile: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  };
}

describe("AppShell", () => {
  it("shows the startup and onboarding flow when no profile is saved", async () => {
    render(<AppShell dataAdapter={createAdapter({ onboardingAnswer: null, manualProfile: null })} />);

    expect(await screen.findByText("启动 LifeOS")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "建立个人说明书" }));

    expect(screen.getByLabelText("LifeOS 引导流程")).toBeInTheDocument();
  });

  it("shows the manual panel when a saved profile exists", async () => {
    render(
      <AppShell
        dataAdapter={createAdapter({
          onboardingAnswer: completedAnswer,
          manualProfile,
        })}
      />,
    );

    expect(await screen.findByText("个人说明书控制面板")).toBeInTheDocument();
  });

  it("saves onboarding output and returns to first-run after reset", async () => {
    const user = userEvent.setup();
    const adapter = createAdapter({ onboardingAnswer: null, manualProfile: null });

    render(
      <AppShell
        dataAdapter={adapter}
        generateProfile={() => manualProfile}
        initialMode="onboarding"
      />,
    );

    for (let index = 0; index < 8; index += 1) {
      await user.click(screen.getAllByRole("checkbox")[0]);
      await user.click(screen.getByRole("button", { name: "下一题" }));
    }

    await user.click(screen.getByRole("button", { name: "跳过并完成" }));

    await waitFor(() => {
      expect(adapter.saveOnboardingAnswer).toHaveBeenCalledOnce();
      expect(adapter.saveManualProfile).toHaveBeenCalledOnce();
    });
    expect(screen.getByText("个人说明书控制面板")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "重置本地数据" }));
    await user.type(screen.getByLabelText("输入 RESET 确认重置"), "RESET");
    await user.click(screen.getByRole("button", { name: "确认重置" }));

    await waitFor(() => expect(adapter.clear).toHaveBeenCalledOnce());
    expect(screen.getByText("启动 LifeOS")).toBeInTheDocument();
  });
});
