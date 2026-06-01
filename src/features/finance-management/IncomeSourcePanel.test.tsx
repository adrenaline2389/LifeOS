import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { MoneyInflowSource, WalletContainer } from "@/types/lifeos";

import { IncomeSourcePanel } from "./IncomeSourcePanel";

const now = () => new Date("2026-05-27T09:10:00.000");

const walletContainer = (
  overrides: Partial<WalletContainer> = {},
): WalletContainer => ({
  id: "wallet-1",
  name: "现金口袋",
  balance: 120,
  color: "#2f9be7",
  note: "桌面手动快照",
  createdAt: "2026-05-26T08:00:00.000",
  updatedAt: "2026-05-26T08:00:00.000",
  ...overrides,
});

const incomeSource = (
  overrides: Partial<MoneyInflowSource> = {},
): MoneyInflowSource => ({
  id: "income-1",
  name: "固定工资",
  amountPattern: { kind: "fixed", amount: 8000 },
  frequencyPattern: { kind: "fixed", interval: "monthly" },
  targetWalletContainerId: "wallet-1",
  note: "月底手动确认",
  createdAt: "2026-05-20T08:00:00.000",
  updatedAt: "2026-05-20T08:00:00.000",
  ...overrides,
});

describe("IncomeSourcePanel", () => {
  it("disables creation when no wallet container exists", () => {
    render(
      <IncomeSourcePanel
        containers={[]}
        createSourceId={() => "income-new"}
        onDeleteSource={vi.fn()}
        onSaveSource={vi.fn()}
        sources={[]}
        now={now}
      />,
    );

    const panel = screen.getByRole("region", { name: "收入来源" });

    expect(panel).toHaveTextContent("这些是你手动维护的本地收入来源。");
    expect(panel).toHaveTextContent("请先创建钱包容器，再新增收入来源。");
    expect(within(panel).getByRole("button", { name: "新增收入来源" })).toBeDisabled();
  });

  it("creates a fixed amount income source", async () => {
    const user = userEvent.setup();
    const onSaveSource = vi.fn().mockResolvedValue(undefined);

    render(
      <IncomeSourcePanel
        containers={[walletContainer()]}
        createSourceId={() => "income-new"}
        onDeleteSource={vi.fn()}
        onSaveSource={onSaveSource}
        sources={[]}
        now={now}
      />,
    );

    await user.click(screen.getByRole("button", { name: "新增收入来源" }));
    await user.type(screen.getByLabelText("名称"), "咨询费");
    await user.selectOptions(screen.getByLabelText("金额模式"), "fixed");
    await user.clear(screen.getByLabelText("固定金额"));
    await user.type(screen.getByLabelText("固定金额"), "1200");
    await user.selectOptions(screen.getByLabelText("频率模式"), "weekly");
    await user.selectOptions(screen.getByLabelText("流入钱包容器"), "wallet-1");
    await user.type(screen.getByLabelText("备注（可选）"), "每次交付后手动确认");
    await user.click(screen.getByRole("button", { name: "保存收入来源" }));

    expect(onSaveSource).toHaveBeenCalledWith({
      id: "income-new",
      name: "咨询费",
      amountPattern: { kind: "fixed", amount: 1200 },
      frequencyPattern: { kind: "fixed", interval: "weekly" },
      targetWalletContainerId: "wallet-1",
      note: "每次交付后手动确认",
      createdAt: "2026-05-27T09:10:00.000",
      updatedAt: "2026-05-27T09:10:00.000",
    });
    expect(screen.getByText("咨询费")).toBeInTheDocument();
    expect(screen.getByText("固定金额：1,200")).toBeInTheDocument();
    expect(screen.getByText("周结")).toBeInTheDocument();
  });

  it("creates a variable amount income source without a default amount", async () => {
    const user = userEvent.setup();
    const onSaveSource = vi.fn().mockResolvedValue(undefined);

    render(
      <IncomeSourcePanel
        containers={[walletContainer()]}
        createSourceId={() => "income-variable"}
        onDeleteSource={vi.fn()}
        onSaveSource={onSaveSource}
        sources={[]}
        now={now}
      />,
    );

    await user.click(screen.getByRole("button", { name: "新增收入来源" }));
    await user.type(screen.getByLabelText("名称"), "平台收入");
    await user.selectOptions(screen.getByLabelText("金额模式"), "variable");
    await user.selectOptions(screen.getByLabelText("频率模式"), "variable");
    await user.selectOptions(screen.getByLabelText("流入钱包容器"), "wallet-1");
    await user.click(screen.getByRole("button", { name: "保存收入来源" }));

    expect(onSaveSource).toHaveBeenCalledWith({
      id: "income-variable",
      name: "平台收入",
      amountPattern: { kind: "variable" },
      frequencyPattern: { kind: "variable" },
      targetWalletContainerId: "wallet-1",
      createdAt: "2026-05-27T09:10:00.000",
      updatedAt: "2026-05-27T09:10:00.000",
    });
  });

  it("edits an income source and preserves createdAt", async () => {
    const user = userEvent.setup();
    const onSaveSource = vi.fn().mockResolvedValue(undefined);
    const source = incomeSource();

    render(
      <IncomeSourcePanel
        containers={[walletContainer()]}
        onDeleteSource={vi.fn()}
        onSaveSource={onSaveSource}
        sources={[source]}
        now={now}
      />,
    );

    await user.click(screen.getByRole("button", { name: "编辑固定工资" }));
    await user.clear(screen.getByLabelText("名称"));
    await user.type(screen.getByLabelText("名称"), "项目款");
    await user.selectOptions(screen.getByLabelText("金额模式"), "variable");
    await user.selectOptions(screen.getByLabelText("频率模式"), "quarterly");
    await user.click(screen.getByRole("button", { name: "保存收入来源" }));

    expect(onSaveSource).toHaveBeenCalledWith({
      ...source,
      name: "项目款",
      amountPattern: { kind: "variable" },
      frequencyPattern: { kind: "fixed", interval: "quarterly" },
      updatedAt: "2026-05-27T09:10:00.000",
    });
    expect(screen.getByText("项目款")).toBeInTheDocument();
  });

  it("deletes an income source from the edit form", async () => {
    const user = userEvent.setup();
    const onDeleteSource = vi.fn().mockResolvedValue(undefined);

    render(
      <IncomeSourcePanel
        containers={[walletContainer()]}
        onDeleteSource={onDeleteSource}
        onSaveSource={vi.fn()}
        sources={[incomeSource({ id: "income-delete", name: "临时收入" })]}
        now={now}
      />,
    );

    await user.click(screen.getByRole("button", { name: "编辑临时收入" }));
    await user.click(screen.getByRole("button", { name: "删除收入来源" }));

    expect(onDeleteSource).toHaveBeenCalledWith("income-delete");
    expect(screen.queryByText("临时收入")).not.toBeInTheDocument();
  });

  it("keeps sources visible when the target container is missing", () => {
    render(
      <IncomeSourcePanel
        containers={[walletContainer({ id: "wallet-other", name: "其他钱包" })]}
        onDeleteSource={vi.fn()}
        onSaveSource={vi.fn()}
        sources={[incomeSource({ targetWalletContainerId: "wallet-missing" })]}
        now={now}
      />,
    );

    const sourceItem = screen.getByRole("listitem", { name: "固定工资" });

    expect(sourceItem).toHaveTextContent("需要重新选择流入钱包");
    expect(within(sourceItem).getByRole("button", { name: "手动入账固定工资" })).toBeDisabled();
  });

  it("renders manual deposit as a prominent plus button above edit", () => {
    render(
      <IncomeSourcePanel
        containers={[walletContainer()]}
        onDeleteSource={vi.fn()}
        onSaveSource={vi.fn()}
        sources={[incomeSource()]}
        now={now}
      />,
    );

    const sourceItem = screen.getByRole("listitem", { name: "固定工资" });
    const buttons = within(sourceItem).getAllByRole("button");

    expect(buttons[0]).toHaveAccessibleName("手动入账固定工资");
    expect(buttons[0]).toHaveTextContent("+");
    expect(buttons[1]).toHaveAccessibleName("编辑固定工资");
  });

  it("does not render forbidden finance language", () => {
    render(
      <IncomeSourcePanel
        containers={[walletContainer()]}
        onDeleteSource={vi.fn()}
        onSaveSource={vi.fn()}
        sources={[incomeSource()]}
        now={now}
      />,
    );

    expect(screen.queryByText("收入预测")).not.toBeInTheDocument();
    expect(screen.queryByText("收入稳定性评分")).not.toBeInTheDocument();
    expect(screen.queryByText("职业建议")).not.toBeInTheDocument();
    expect(screen.queryByText("预算警报")).not.toBeInTheDocument();
    expect(screen.queryByText("财务诊断")).not.toBeInTheDocument();
    expect(screen.queryByText("银行连接")).not.toBeInTheDocument();
    expect(screen.queryByText("支付平台")).not.toBeInTheDocument();
    expect(screen.queryByText("雇主系统")).not.toBeInTheDocument();
    expect(screen.queryByText("税务系统")).not.toBeInTheDocument();
  });
});
