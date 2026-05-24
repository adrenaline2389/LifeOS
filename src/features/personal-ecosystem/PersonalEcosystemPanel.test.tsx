import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { EcosystemObservation } from "@/types/lifeos";

import { PersonalEcosystemPanel } from "./PersonalEcosystemPanel";

const now = () => new Date("2026-05-18T08:30:00.000");

const existingObservation: EcosystemObservation = {
  id: "body-yesterday",
  dimensionId: "bodyState",
  valueId: "tired",
  valueLabel: "疲惫",
  internalScore: -1,
  observedAt: "2026-05-17T20:00:00.000",
};

describe("PersonalEcosystemPanel", () => {
  it("renders the personal ecosystem page and six dimensions", () => {
    render(
      <PersonalEcosystemPanel
        observations={[existingObservation]}
        onBack={vi.fn()}
        onDeleteObservation={vi.fn()}
        onSaveObservation={vi.fn()}
        now={now}
      />,
    );

    expect(screen.getByText("个人生态系统")).toBeInTheDocument();
    expect(screen.getByText("生理基础与生活环境")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "返回启动面板" })).toBeInTheDocument();

    const statusPanel = screen.getByRole("region", { name: "当前生态状态" });
    expect(within(statusPanel).getByText("睡眠恢复")).toBeInTheDocument();
    expect(within(statusPanel).getByText("作息节律")).toBeInTheDocument();
    expect(within(statusPanel).getByText("身体状态")).toBeInTheDocument();
    expect(within(statusPanel).getByText("饮食饮水")).toBeInTheDocument();
    expect(within(statusPanel).getByText("活动舒展")).toBeInTheDocument();
    expect(within(statusPanel).getByText("环境支撑")).toBeInTheDocument();
    expect(within(statusPanel).getByText("疲惫")).toBeInTheDocument();
    expect(screen.getAllByText("尚未观察").length).toBeGreaterThan(0);
  });

  it("lets the user record one dimension without forcing a full daily form", async () => {
    const user = userEvent.setup();
    const onSaveObservation = vi.fn().mockResolvedValue(undefined);

    render(
      <PersonalEcosystemPanel
        createObservationId={() => "sleep-observation"}
        observations={[]}
        onBack={vi.fn()}
        onDeleteObservation={vi.fn()}
        onSaveObservation={onSaveObservation}
        now={now}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "更新睡眠恢复" }));
    await user.click(screen.getByRole("button", { name: "够用" }));

    expect(onSaveObservation).toHaveBeenCalledWith({
      id: "sleep-observation",
      dimensionId: "sleepRecovery",
      valueId: "enough",
      valueLabel: "够用",
      internalScore: 2,
      observedAt: "2026-05-18T08:30:00.000",
    });
    expect(screen.getByText("今日已观察")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "今日生态轨迹" })).toHaveTextContent("08:30");
    expect(screen.getByRole("region", { name: "今日生态轨迹" })).toHaveTextContent("够用");
    expect(screen.getAllByText("尚未观察").length).toBeGreaterThan(0);
  });

  it("renders semantic values as an ordered seven-step axis", async () => {
    const user = userEvent.setup();

    render(
      <PersonalEcosystemPanel
        observations={[]}
        onBack={vi.fn()}
        onDeleteObservation={vi.fn()}
        onSaveObservation={vi.fn()}
        now={now}
      />,
    );

    await user.click(screen.getByRole("button", { name: "更新活动舒展" }));

    const axis = screen.getByRole("group", { name: "活动舒展语义档位轴" });
    const options = within(axis).getAllByRole("button");

    expect(within(axis).getByText("支撑高")).toBeInTheDocument();
    expect(within(axis).getByText("拖累高")).toBeInTheDocument();
    expect(options).toHaveLength(7);
    expect(options.map((option) => option.textContent)).toEqual([
      "很舒展",
      "有活动",
      "走动过",
      "普通",
      "久坐",
      "僵住",
      "透支",
    ]);
  });

  it("switches the life barometer range and hides internal scores", async () => {
    const user = userEvent.setup();

    render(
      <PersonalEcosystemPanel
        observations={[
          {
            id: "sleep-today",
            dimensionId: "sleepRecovery",
            valueId: "short",
            valueLabel: "偏少",
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

    const barometer = screen.getByRole("region", { name: "生活晴雨表" });
    expect(barometer).toHaveTextContent("过去 7 天");

    await user.click(screen.getByRole("button", { name: "30 天" }));

    expect(barometer).toHaveTextContent("过去 30 天");
    expect(barometer).toHaveTextContent("睡眠恢复");
    expect(barometer).toHaveTextContent("1 次观察");
    expect(screen.queryByText("internalScore")).not.toBeInTheDocument();
    expect(screen.queryByText("-1")).not.toBeInTheDocument();
    expect(screen.queryByText("连续打卡")).not.toBeInTheDocument();
    expect(screen.queryByText("完成率")).not.toBeInTheDocument();
  });

  it("overwrites this-entry observations for the same dimension instead of stacking them", async () => {
    const user = userEvent.setup();
    const onSaveObservation = vi.fn().mockResolvedValue(undefined);
    const createObservationId = vi.fn(() => "sleep-session-observation");
    let currentDate = new Date("2026-05-18T08:30:00.000");

    render(
      <PersonalEcosystemPanel
        createObservationId={createObservationId}
        observations={[]}
        onBack={vi.fn()}
        onDeleteObservation={vi.fn()}
        onSaveObservation={onSaveObservation}
        now={() => currentDate}
      />,
    );

    await user.click(screen.getByRole("button", { name: "更新睡眠恢复" }));
    await user.click(screen.getByRole("button", { name: "够用" }));

    currentDate = new Date("2026-05-18T08:35:00.000");
    await user.click(screen.getByRole("button", { name: "更新睡眠恢复" }));
    await user.click(screen.getByRole("button", { name: "几乎没睡" }));

    expect(createObservationId).toHaveBeenCalledOnce();
    expect(onSaveObservation).toHaveBeenNthCalledWith(1, {
      id: "sleep-session-observation",
      dimensionId: "sleepRecovery",
      valueId: "enough",
      valueLabel: "够用",
      internalScore: 2,
      observedAt: "2026-05-18T08:30:00.000",
    });
    expect(onSaveObservation).toHaveBeenNthCalledWith(2, {
      id: "sleep-session-observation",
      dimensionId: "sleepRecovery",
      valueId: "almost-none",
      valueLabel: "几乎没睡",
      internalScore: -3,
      observedAt: "2026-05-18T08:35:00.000",
    });

    const timeline = screen.getByRole("region", { name: "今日生态轨迹" });
    expect(within(timeline).queryByText("够用")).not.toBeInTheDocument();
    expect(within(timeline).getByText("08:35")).toBeInTheDocument();
    expect(within(timeline).getByText("几乎没睡")).toBeInTheDocument();
  });

  it("lets the user delete an observed timeline option after a mistaken tap", async () => {
    const user = userEvent.setup();
    const onDeleteObservation = vi.fn().mockResolvedValue(undefined);

    render(
      <PersonalEcosystemPanel
        observations={[
          {
            id: "sleep-today",
            dimensionId: "sleepRecovery",
            valueId: "enough",
            valueLabel: "够用",
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

    const timeline = screen.getByRole("region", { name: "今日生态轨迹" });

    expect(within(timeline).getByText("够用")).toBeInTheDocument();

    await user.click(
      within(timeline).getByRole("button", {
        name: "删除睡眠恢复 08:30 够用",
      }),
    );

    expect(onDeleteObservation).toHaveBeenCalledWith("sleep-today");
    expect(within(timeline).queryByText("够用")).not.toBeInTheDocument();
    expect(within(timeline).getAllByText("今日未观察").length).toBeGreaterThan(0);
  });
});
