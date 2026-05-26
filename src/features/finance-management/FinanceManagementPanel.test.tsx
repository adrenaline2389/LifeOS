import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { WalletContainer } from "@/types/lifeos";

import { FinanceManagementPanel } from "./FinanceManagementPanel";

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

describe("FinanceManagementPanel", () => {
  it("renders the finance management page and wallet snapshot", () => {
    render(
      <FinanceManagementPanel
        containers={[walletContainer()]}
        onBack={vi.fn()}
        onDeleteContainer={vi.fn()}
        onSaveContainer={vi.fn()}
        now={now}
      />,
    );

    expect(screen.getByText("财务管理系统")).toBeInTheDocument();
    expect(screen.getByText("资源、消费和自由度")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "返回启动面板" })).toBeInTheDocument();

    const wallet = screen.getByRole("region", { name: "我的钱包" });
    expect(wallet).toHaveTextContent("这是你手动记录的本地余额快照。");
    expect(wallet).toHaveTextContent("当前总余额");
    expect(wallet).toHaveTextContent("120");
    expect(wallet).toHaveTextContent("现金口袋");
    expect(wallet).toHaveTextContent("桌面手动快照");
    expect(within(wallet).getByRole("img", { name: "钱包余额环形图" })).toBeInTheDocument();
  });

  it("lets the user create a wallet container", async () => {
    const user = userEvent.setup();
    const onSaveContainer = vi.fn().mockResolvedValue(undefined);

    render(
      <FinanceManagementPanel
        containers={[]}
        createContainerId={() => "new-wallet"}
        onBack={vi.fn()}
        onDeleteContainer={vi.fn()}
        onSaveContainer={onSaveContainer}
        now={now}
      />,
    );

    await user.click(screen.getByRole("button", { name: "新建资金容器" }));
    await user.type(screen.getByLabelText("名称"), "生活现金");
    await user.clear(screen.getByLabelText("当前余额"));
    await user.type(screen.getByLabelText("当前余额"), "-35.5");
    await user.selectOptions(screen.getByLabelText("颜色"), "#68bf8d");
    await user.type(screen.getByLabelText("备注（可选）"), "月底手动数了一遍");
    await user.click(screen.getByRole("button", { name: "保存容器" }));

    expect(onSaveContainer).toHaveBeenCalledWith({
      id: "new-wallet",
      name: "生活现金",
      balance: -35.5,
      color: "#68bf8d",
      note: "月底手动数了一遍",
      createdAt: "2026-05-27T09:10:00.000",
      updatedAt: "2026-05-27T09:10:00.000",
    });
    expect(screen.getByText("生活现金")).toBeInTheDocument();
    expect(screen.getByText("-35.5")).toBeInTheDocument();
  });

  it("lets the user edit an existing container and preserves createdAt", async () => {
    const user = userEvent.setup();
    const onSaveContainer = vi.fn().mockResolvedValue(undefined);
    const container = walletContainer({
      id: "bank",
      name: "银行卡",
      balance: 500,
      color: "#2f9be7",
      createdAt: "2026-05-20T08:00:00.000",
      updatedAt: "2026-05-21T08:00:00.000",
    });

    render(
      <FinanceManagementPanel
        containers={[container]}
        onBack={vi.fn()}
        onDeleteContainer={vi.fn()}
        onSaveContainer={onSaveContainer}
        now={now}
      />,
    );

    await user.click(screen.getByRole("button", { name: "编辑银行卡" }));
    await user.clear(screen.getByLabelText("当前余额"));
    await user.type(screen.getByLabelText("当前余额"), "650");
    await user.click(screen.getByRole("button", { name: "保存容器" }));

    expect(onSaveContainer).toHaveBeenCalledWith({
      ...container,
      balance: 650,
      updatedAt: "2026-05-27T09:10:00.000",
    });
    expect(screen.getByRole("region", { name: "我的钱包" })).toHaveTextContent("650");
  });

  it("lets the user delete a wallet container", async () => {
    const user = userEvent.setup();
    const onDeleteContainer = vi.fn().mockResolvedValue(undefined);

    render(
      <FinanceManagementPanel
        containers={[walletContainer({ id: "cash", name: "现金" })]}
        onBack={vi.fn()}
        onDeleteContainer={onDeleteContainer}
        onSaveContainer={vi.fn()}
        now={now}
      />,
    );

    await user.click(screen.getByRole("button", { name: "删除现金" }));

    expect(onDeleteContainer).toHaveBeenCalledWith("cash");
    expect(screen.queryByText("现金")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "我的钱包" })).toHaveTextContent("0");
  });

  it("shows positive distribution percentages only for positive containers", () => {
    render(
      <FinanceManagementPanel
        containers={[
          walletContainer({ id: "bank", name: "银行卡", balance: 300, color: "#2f9be7" }),
          walletContainer({ id: "fund", name: "学习基金", balance: 700, color: "#68bf8d" }),
          walletContainer({ id: "debt", name: "信用卡", balance: -100, color: "#8f7ac8" }),
        ]}
        onBack={vi.fn()}
        onDeleteContainer={vi.fn()}
        onSaveContainer={vi.fn()}
        now={now}
      />,
    );

    const wallet = screen.getByRole("region", { name: "我的钱包" });

    expect(wallet).toHaveTextContent("当前总余额");
    expect(wallet).toHaveTextContent("900");
    expect(wallet).toHaveTextContent("银行卡30030%");
    expect(wallet).toHaveTextContent("学习基金70070%");
    expect(wallet).toHaveTextContent("信用卡");
    expect(wallet).toHaveTextContent("-100");
  });

  it("shows a zero balance gray state without percentages", () => {
    render(
      <FinanceManagementPanel
        containers={[]}
        onBack={vi.fn()}
        onDeleteContainer={vi.fn()}
        onSaveContainer={vi.fn()}
        now={now}
      />,
    );

    const wallet = screen.getByRole("region", { name: "我的钱包" });

    expect(wallet).toHaveTextContent("当前总余额");
    expect(wallet).toHaveTextContent("还没有可分配余额快照");
    expect(wallet).not.toHaveTextContent("%");
  });

  it("shows a negative debt state without percentages while preserving negative balances", () => {
    render(
      <FinanceManagementPanel
        containers={[walletContainer({ name: "信用卡", balance: -420, color: "#8f7ac8" })]}
        onBack={vi.fn()}
        onDeleteContainer={vi.fn()}
        onSaveContainer={vi.fn()}
        now={now}
      />,
    );

    const wallet = screen.getByRole("region", { name: "我的钱包" });

    expect(wallet).toHaveTextContent("当前负债金额");
    expect(wallet).toHaveTextContent("420");
    expect(wallet).toHaveTextContent("信用卡");
    expect(wallet).toHaveTextContent("-420");
    expect(wallet).not.toHaveTextContent("%");
  });

  it("renders future finance structures as unavailable placeholders only", () => {
    render(
      <FinanceManagementPanel
        containers={[]}
        onBack={vi.fn()}
        onDeleteContainer={vi.fn()}
        onSaveContainer={vi.fn()}
        now={now}
      />,
    );

    const future = screen.getByRole("region", { name: "财务系统未来结构" });

    expect(future).toHaveTextContent("金鹅账户后续开放");
    expect(future).toHaveTextContent("梦想账户后续开放");
    expect(future).toHaveTextContent("金钱流入来源后续开放");
    expect(future).toHaveTextContent("日常开销池后续开放");
    expect(future).toHaveTextContent("财富流动日志后续开放");
    expect(within(future).queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not render forbidden finance product language", () => {
    render(
      <FinanceManagementPanel
        containers={[]}
        onBack={vi.fn()}
        onDeleteContainer={vi.fn()}
        onSaveContainer={vi.fn()}
        now={now}
      />,
    );

    expect(screen.queryByText("预算警报")).not.toBeInTheDocument();
    expect(screen.queryByText("超支惩罚")).not.toBeInTheDocument();
    expect(screen.queryByText("财务健康评分")).not.toBeInTheDocument();
    expect(screen.queryByText("投资建议")).not.toBeInTheDocument();
    expect(screen.queryByText("财务诊断")).not.toBeInTheDocument();
    expect(screen.queryByText("银行连接")).not.toBeInTheDocument();
    expect(screen.queryByText("支付平台")).not.toBeInTheDocument();
  });
});
