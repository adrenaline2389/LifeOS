import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { EnergyObservation } from "@/types/lifeos";

import { EnergyManagementPanel } from "./EnergyManagementPanel";

const now = () => new Date("2026-05-18T08:30:00.000");

const existingObservation: EnergyObservation = {
  id: "pressure-yesterday",
  dimensionId: "pressureLoad",
  valueId: "heavy",
  valueLabel: "偏重",
  internalScore: -1,
  observedAt: "2026-05-17T20:00:00.000",
};

describe("EnergyManagementPanel", () => {
  it("renders the energy management page and six dimensions in order", () => {
    render(
      <EnergyManagementPanel
        observations={[existingObservation]}
        onBack={vi.fn()}
        onDeleteObservation={vi.fn()}
        onSaveObservation={vi.fn()}
        now={now}
      />,
    );

    expect(screen.getByText("能量管理系统")).toBeInTheDocument();
    expect(screen.getByText("心理余量与恢复")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "返回启动面板" })).toBeInTheDocument();

    const statusPanel = screen.getByRole("region", { name: "当前能量状态" });
    const updateButtons = within(statusPanel).getAllByRole("button");

    expect(updateButtons.map((button) => button.textContent)).toEqual([
      "更新当前余量",
      "更新压力负载",
      "更新情绪天气",
      "更新注意带宽",
      "更新社交电量",
      "更新行动阻力",
    ]);
    expect(
      updateButtons.map((button) => button.textContent?.replace("更新", "")),
    ).toEqual([
      "当前余量",
      "压力负载",
      "情绪天气",
      "注意带宽",
      "社交电量",
      "行动阻力",
    ]);
    expect(within(statusPanel).getByText("偏重")).toBeInTheDocument();
    expect(screen.getAllByText("尚未观察").length).toBeGreaterThan(0);
  });

  it("lets the user record one dimension without forcing a full daily form", async () => {
    const user = userEvent.setup();
    const onSaveObservation = vi.fn().mockResolvedValue(undefined);

    render(
      <EnergyManagementPanel
        createObservationId={() => "capacity-observation"}
        observations={[]}
        onBack={vi.fn()}
        onDeleteObservation={vi.fn()}
        onSaveObservation={onSaveObservation}
        now={now}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "更新当前余量" }));
    await user.click(screen.getByRole("button", { name: "有余量" }));

    expect(onSaveObservation).toHaveBeenCalledWith({
      id: "capacity-observation",
      dimensionId: "currentCapacity",
      valueId: "spacious",
      valueLabel: "有余量",
      internalScore: 2,
      observedAt: "2026-05-18T08:30:00.000",
    });
    expect(screen.getByText("今日已观察")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "今日能量轨迹" })).toHaveTextContent("08:30");
    expect(screen.getByRole("region", { name: "今日能量轨迹" })).toHaveTextContent("有余量");
    expect(screen.getAllByText("尚未观察").length).toBeGreaterThan(0);
  });

  it("renders semantic values as an ordered seven-step axis", async () => {
    const user = userEvent.setup();

    render(
      <EnergyManagementPanel
        observations={[]}
        onBack={vi.fn()}
        onDeleteObservation={vi.fn()}
        onSaveObservation={vi.fn()}
        now={now}
      />,
    );

    await user.click(screen.getByRole("button", { name: "更新行动阻力" }));

    const axis = screen.getByRole("group", { name: "行动阻力语义档位轴" });
    const options = within(axis).getAllByRole("button");

    expect(within(axis).getByText("支撑高")).toBeInTheDocument();
    expect(within(axis).getByText("拖累高")).toBeInTheDocument();
    expect(options).toHaveLength(7);
    expect(options.map((option) => option.textContent)).toEqual([
      "很顺手",
      "可以启动",
      "慢慢能动",
      "有点卡",
      "难启动",
      "抗拒",
      "停摆",
    ]);
  });

  it("switches the energy compass range and hides internal scores", async () => {
    const user = userEvent.setup();

    render(
      <EnergyManagementPanel
        observations={[
          {
            id: "capacity-today",
            dimensionId: "currentCapacity",
            valueId: "low",
            valueLabel: "偏低",
            internalScore: -1,
            observedAt: "2026-05-18T08:00:00.000",
          },
        ]}
        onBack={vi.fn()}
        onDeleteObservation={vi.fn()}
        onSaveObservation={vi.fn()}
        now={now}
      />,
    );

    const compass = screen.getByRole("region", { name: "能量风向标" });
    expect(compass).toHaveTextContent("过去 7 天");

    await user.click(screen.getByRole("button", { name: "30 天" }));

    expect(compass).toHaveTextContent("过去 30 天");
    expect(compass).toHaveTextContent("当前余量");
    expect(compass).toHaveTextContent("1 次观察");
    expect(screen.queryByText("internalScore")).not.toBeInTheDocument();
    expect(screen.queryByText("-1")).not.toBeInTheDocument();
    expect(screen.queryByText("连续打卡")).not.toBeInTheDocument();
    expect(screen.queryByText("完成率")).not.toBeInTheDocument();
    expect(screen.queryByText("诊断")).not.toBeInTheDocument();
    expect(screen.queryByText("建议")).not.toBeInTheDocument();
    expect(screen.queryByText("任务规划")).not.toBeInTheDocument();
    expect(screen.queryByText("恢复建议")).not.toBeInTheDocument();
  });

  it("overwrites this-entry observations for the same dimension instead of stacking them", async () => {
    const user = userEvent.setup();
    const onSaveObservation = vi.fn().mockResolvedValue(undefined);
    const createObservationId = vi.fn(() => "capacity-session-observation");
    let currentDate = new Date("2026-05-18T08:30:00.000");

    render(
      <EnergyManagementPanel
        createObservationId={createObservationId}
        observations={[]}
        onBack={vi.fn()}
        onDeleteObservation={vi.fn()}
        onSaveObservation={onSaveObservation}
        now={() => currentDate}
      />,
    );

    await user.click(screen.getByRole("button", { name: "更新当前余量" }));
    await user.click(screen.getByRole("button", { name: "有余量" }));

    currentDate = new Date("2026-05-18T08:35:00.000");
    await user.click(screen.getByRole("button", { name: "更新当前余量" }));
    await user.click(screen.getByRole("button", { name: "已透支" }));

    expect(createObservationId).toHaveBeenCalledOnce();
    expect(onSaveObservation).toHaveBeenNthCalledWith(1, {
      id: "capacity-session-observation",
      dimensionId: "currentCapacity",
      valueId: "spacious",
      valueLabel: "有余量",
      internalScore: 2,
      observedAt: "2026-05-18T08:30:00.000",
    });
    expect(onSaveObservation).toHaveBeenNthCalledWith(2, {
      id: "capacity-session-observation",
      dimensionId: "currentCapacity",
      valueId: "overdrawn",
      valueLabel: "已透支",
      internalScore: -3,
      observedAt: "2026-05-18T08:35:00.000",
    });

    const timeline = screen.getByRole("region", { name: "今日能量轨迹" });
    expect(within(timeline).queryByText("有余量")).not.toBeInTheDocument();
    expect(within(timeline).getByText("08:35")).toBeInTheDocument();
    expect(within(timeline).getByText("已透支")).toBeInTheDocument();
  });

  it("lets the user delete an observed timeline option after a mistaken tap", async () => {
    const user = userEvent.setup();
    const onDeleteObservation = vi.fn().mockResolvedValue(undefined);

    render(
      <EnergyManagementPanel
        observations={[
          {
            id: "capacity-today",
            dimensionId: "currentCapacity",
            valueId: "spacious",
            valueLabel: "有余量",
            internalScore: 2,
            observedAt: "2026-05-18T08:30:00.000",
          },
        ]}
        onBack={vi.fn()}
        onDeleteObservation={onDeleteObservation}
        onSaveObservation={vi.fn()}
        now={now}
      />,
    );

    const timeline = screen.getByRole("region", { name: "今日能量轨迹" });

    expect(within(timeline).getByText("有余量")).toBeInTheDocument();

    await user.click(
      within(timeline).getByRole("button", {
        name: "删除当前余量 08:30 有余量",
      }),
    );

    expect(onDeleteObservation).toHaveBeenCalledWith("capacity-today");
    expect(within(timeline).queryByText("有余量")).not.toBeInTheDocument();
    expect(within(timeline).getAllByText("今日未观察").length).toBeGreaterThan(0);
  });
});
