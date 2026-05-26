import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { StartupScanProfile } from "@/types/lifeos";

import { StartupDashboard } from "./StartupDashboard";

const profile: StartupScanProfile = {
  version: "1.1",
  completedAt: "2026-05-18T08:00:00.000Z",
  scanStatus: "completed",
  scanClues: [
    {
      id: "state-recovery-scan",
      text: "状态下降时的信号可能和「睡眠」有关，恢复线索可能来自「睡觉」。",
      sourceAnswerRefs: [
        { questionId: "q1-state-decline-signal", optionId: "q1-sleep" },
        { questionId: "q2-recovery-method", optionId: "q2-sleep" },
      ],
    },
  ],
  suggestedSubsystems: [
    {
      id: "ecosystem",
      label: "个人生态系统",
      reason: "你的回答提到了「睡眠」，可以先用个人生态系统观察作息、身体状态和生活环境。",
      sourceAnswerRefs: [
        {
          questionId: "q1-state-decline-signal",
          optionId: "q1-sleep",
        },
      ],
    },
  ],
};

describe("StartupDashboard", () => {
  it("renders the LifeOS startup dashboard with six subsystem entries", () => {
    render(
      <StartupDashboard
        onResetConfirmed={vi.fn()}
        profile={profile}
      />,
    );

    expect(screen.getByText("LifeOS 启动面板")).toBeInTheDocument();
    expect(screen.getByText("初始扫描完成")).toBeInTheDocument();
    expect(screen.getAllByText("建议优先开启").length).toBeGreaterThan(0);
    expect(screen.getAllByText("个人生态系统").length).toBeGreaterThan(0);
    expect(screen.getByText("能量管理系统")).toBeInTheDocument();
    expect(screen.getAllByText("可进入").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("认知管理系统")).toBeInTheDocument();
    expect(screen.getByText("人生目标管理系统")).toBeInTheDocument();
    expect(screen.getByText("人际关系管理系统")).toBeInTheDocument();
    expect(screen.getByText("财务管理系统")).toBeInTheDocument();
    expect(screen.getByText("生理基础与生活环境。")).toBeInTheDocument();
    expect(screen.getByText(profile.scanClues[0].text)).toBeInTheDocument();
    expect(screen.getAllByText("第 1 题：睡眠").length).toBeGreaterThan(0);
  });

  it("does not render manual editing or export actions", () => {
    render(
      <StartupDashboard
        onResetConfirmed={vi.fn()}
        profile={profile}
      />,
    );

    expect(screen.queryByText("自我清晰度")).not.toBeInTheDocument();
    expect(screen.queryByText("完整个人说明书")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "打开完整说明书" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "导出 JSON" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "导出 Markdown" })).not.toBeInTheDocument();
  });

  it("requires explicit reset confirmation", async () => {
    const user = userEvent.setup();
    const onResetConfirmed = vi.fn().mockResolvedValue(undefined);

    render(
      <StartupDashboard
        onResetConfirmed={onResetConfirmed}
        profile={profile}
      />,
    );

    await user.click(screen.getByRole("button", { name: "重置本地数据" }));
    await user.click(screen.getByRole("button", { name: "确认重置" }));

    expect(screen.getByRole("heading", { name: "重置本地 LifeOS 数据" })).toHaveClass(
      "retro-ui-dialog-title",
    );
    expect(
      screen.getByText(
        "这会清空当前设备上的首次扫描回答、启动扫描结果、生态观察点、能量观察点和钱包容器。",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("输入 RESET 确认重置")).toHaveClass(
      "startup-dashboard-reset-input",
    );
    expect(onResetConfirmed).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("输入 RESET 确认重置"), "RESET");
    await user.click(screen.getByRole("button", { name: "确认重置" }));

    expect(onResetConfirmed).toHaveBeenCalledOnce();
  });

  it("opens the available subsystem entries and keeps other subsystems as later entries", async () => {
    const user = userEvent.setup();
    const onOpenSubsystem = vi.fn();

    render(
      <StartupDashboard
        onOpenSubsystem={onOpenSubsystem}
        onResetConfirmed={vi.fn()}
        profile={profile}
      />,
    );

    await user.click(screen.getByRole("button", { name: "查看系统入口" }));

    expect(onOpenSubsystem).toHaveBeenCalledWith("ecosystem");

    await user.click(screen.getAllByRole("button", { name: "查看" })[1]);

    expect(onOpenSubsystem).toHaveBeenCalledWith("energy");

    await user.click(screen.getAllByRole("button", { name: "查看" })[5]);

    expect(onOpenSubsystem).toHaveBeenCalledWith("finance");

    await user.click(screen.getAllByRole("button", { name: "查看" })[2]);

    expect(screen.getByRole("status")).toHaveTextContent(
      "认知管理系统 会在后续版本开放",
    );
  });

  it("opens the energy management recommendation card", async () => {
    const user = userEvent.setup();
    const onOpenSubsystem = vi.fn();
    const energyProfile: StartupScanProfile = {
      ...profile,
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

    render(
      <StartupDashboard
        onOpenSubsystem={onOpenSubsystem}
        onResetConfirmed={vi.fn()}
        profile={energyProfile}
      />,
    );

    await user.click(screen.getByRole("button", { name: "查看系统入口" }));

    expect(onOpenSubsystem).toHaveBeenCalledWith("energy");
  });

  it("opens the finance management recommendation card", async () => {
    const user = userEvent.setup();
    const onOpenSubsystem = vi.fn();
    const financeProfile: StartupScanProfile = {
      ...profile,
      suggestedSubsystems: [
        {
          id: "finance",
          label: "财务管理系统",
          reason: "你的回答提到了「资源和自由度」，可以先用财务管理系统观察当前余额快照。",
          sourceAnswerRefs: [
            {
              questionId: "q8-growth-direction",
              optionId: "q8-resource-freedom",
            },
          ],
        },
      ],
    };

    render(
      <StartupDashboard
        onOpenSubsystem={onOpenSubsystem}
        onResetConfirmed={vi.fn()}
        profile={financeProfile}
      />,
    );

    await user.click(screen.getByRole("button", { name: "查看系统入口" }));

    expect(onOpenSubsystem).toHaveBeenCalledWith("finance");
  });
});
