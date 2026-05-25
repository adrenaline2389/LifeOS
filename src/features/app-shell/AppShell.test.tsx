import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type {
  EcosystemObservation,
  EnergyObservation,
  OnboardingAnswerRecord,
  StartupScanProfile,
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
      selectedOptionIds: ["q2-sleep"],
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
      selectedOptionIds: ["q7-body-routine"],
    },
    {
      questionId: "q8-growth-direction",
      type: "multi-select",
      selectedOptionIds: ["q8-more-self-caring"],
    },
    {
      questionId: "q9-future-self-note",
      type: "short-text",
      value: "",
      skipped: true,
    },
  ],
};

const startupScanProfile: StartupScanProfile = {
  version: "1.1",
  completedAt: "2026-05-18T08:00:00.000Z",
  scanStatus: "completed",
  scanClues: [
    {
      id: "state-recovery-scan",
      text: "状态下降时的信号可能和「睡眠」有关。",
      sourceAnswerRefs: [
        { questionId: "q1-state-decline-signal", optionId: "q1-sleep" },
      ],
    },
  ],
  suggestedSubsystems: [
    {
      id: "ecosystem",
      label: "个人生态系统",
      reason: "你的回答提到了「睡眠」，可以先用个人生态系统观察作息。",
      sourceAnswerRefs: [
        { questionId: "q1-state-decline-signal", optionId: "q1-sleep" },
      ],
    },
  ],
};

function createAdapter(
  snapshot: {
    onboardingAnswer: OnboardingAnswerRecord | null;
    startupScanProfile: StartupScanProfile | null;
  },
  ecosystemObservations: EcosystemObservation[] = [],
  energyObservations: EnergyObservation[] = [],
): AppShellDataAdapter {
  return {
    read: vi.fn().mockResolvedValue(snapshot),
    readEcosystemObservations: vi.fn().mockResolvedValue(ecosystemObservations),
    readEnergyObservations: vi.fn().mockResolvedValue(energyObservations),
    deleteEcosystemObservation: vi.fn().mockResolvedValue(undefined),
    deleteEnergyObservation: vi.fn().mockResolvedValue(undefined),
    saveOnboardingAnswer: vi.fn().mockResolvedValue(undefined),
    saveEcosystemObservation: vi.fn().mockResolvedValue(undefined),
    saveEnergyObservation: vi.fn().mockResolvedValue(undefined),
    saveStartupScanProfile: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  };
}

describe("AppShell", () => {
  it("shows the startup and onboarding flow when no startup scan is saved", async () => {
    render(
      <AppShell
        dataAdapter={createAdapter({
          onboardingAnswer: null,
          startupScanProfile: null,
        })}
      />,
    );

    expect(await screen.findByText("启动 LifeOS")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "开始初始扫描" }));

    expect(screen.getByLabelText("LifeOS 引导流程")).toBeInTheDocument();
  });

  it("shows the startup dashboard when a saved scan exists", async () => {
    render(
      <AppShell
        dataAdapter={createAdapter({
          onboardingAnswer: completedAnswer,
          startupScanProfile,
        })}
      />,
    );

    expect(await screen.findByText("LifeOS 启动面板")).toBeInTheDocument();
  });

  it("opens and returns from the personal ecosystem subsystem", async () => {
    const user = userEvent.setup();
    const adapter = createAdapter(
      {
        onboardingAnswer: completedAnswer,
        startupScanProfile,
      },
      [
        {
          id: "sleep-today",
          dimensionId: "sleepRecovery",
          valueId: "enough",
          valueLabel: "够用",
          internalScore: 2,
          observedAt: "2026-05-18T08:30:00.000",
        },
      ],
    );

    render(<AppShell dataAdapter={adapter} />);

    expect(await screen.findByText("LifeOS 启动面板")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "查看系统入口" }));

    expect(await screen.findByText("个人生态系统")).toBeInTheDocument();
    expect(screen.getByText("生理基础与生活环境")).toBeInTheDocument();
    expect(adapter.readEcosystemObservations).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "返回启动面板" }));

    expect(screen.getByText("LifeOS 启动面板")).toBeInTheDocument();
  });

  it("opens and returns from the energy management subsystem", async () => {
    const user = userEvent.setup();
    const energyProfile: StartupScanProfile = {
      ...startupScanProfile,
      suggestedSubsystems: [
        {
          id: "energy",
          label: "能量管理系统",
          reason: "你的回答提到了「情绪稳定」，可以先用能量管理系统记录心理余量。",
          sourceAnswerRefs: [
            {
              questionId: "q1-state-decline-signal",
              optionId: "q1-emotional-stability",
            },
          ],
        },
      ],
    };
    const adapter = createAdapter(
      {
        onboardingAnswer: completedAnswer,
        startupScanProfile: energyProfile,
      },
      [],
      [
        {
          id: "capacity-today",
          dimensionId: "currentCapacity",
          valueId: "spacious",
          valueLabel: "有余量",
          internalScore: 2,
          observedAt: "2026-05-18T08:30:00.000",
        },
      ],
    );

    render(<AppShell dataAdapter={adapter} />);

    expect(await screen.findByText("LifeOS 启动面板")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "查看系统入口" }));

    expect(await screen.findByText("能量管理系统")).toBeInTheDocument();
    expect(screen.getByText("心理余量与恢复")).toBeInTheDocument();
    expect(adapter.readEnergyObservations).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "返回启动面板" }));

    expect(screen.getByText("LifeOS 启动面板")).toBeInTheDocument();
  });

  it("saves onboarding output and returns to first-run after reset", async () => {
    const user = userEvent.setup();
    const adapter = createAdapter({
      onboardingAnswer: null,
      startupScanProfile: null,
    });

    render(
      <AppShell
        dataAdapter={adapter}
        generateStartupScan={() => startupScanProfile}
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
      expect(adapter.saveStartupScanProfile).toHaveBeenCalledOnce();
    });
    expect(screen.getByText("LifeOS 启动面板")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "重置本地数据" }));
    await user.type(screen.getByLabelText("输入 RESET 确认重置"), "RESET");
    await user.click(screen.getByRole("button", { name: "确认重置" }));

    await waitFor(() => expect(adapter.clear).toHaveBeenCalledOnce());
    expect(screen.getByText("启动 LifeOS")).toBeInTheDocument();
  });
});
