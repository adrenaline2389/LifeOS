import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type {
  DailyExpenseEntry,
  DailyExpensePool,
  WalletContainer,
} from "@/types/lifeos";

import { DailyExpensePoolPanel } from "./DailyExpensePoolPanel";

const now = () => new Date("2026-06-03T10:30:00.000");

const walletContainer = (
  overrides: Partial<WalletContainer> = {},
): WalletContainer => ({
  id: "wallet-1",
  name: "现金口袋",
  balance: 1000,
  color: "#2f9be7",
  note: "桌面手动快照",
  createdAt: "2026-06-01T08:00:00.000",
  updatedAt: "2026-06-01T08:00:00.000",
  ...overrides,
});

const dailyExpensePool = (
  overrides: Partial<DailyExpensePool> = {},
): DailyExpensePool => ({
  id: "default",
  balance: 300,
  selectedWalletContainerId: "wallet-1",
  lastTransferAmount: 500,
  lastTransferAt: "2026-06-02T08:00:00.000",
  lastTransferWalletContainerId: "wallet-1",
  lastTransferWalletContainerNameSnapshot: "现金口袋",
  createdAt: "2026-06-02T08:00:00.000",
  updatedAt: "2026-06-02T08:00:00.000",
  ...overrides,
});

const dailyExpenseEntry = (
  overrides: Partial<DailyExpenseEntry> = {},
): DailyExpenseEntry => ({
  id: "expense-1",
  amount: 68,
  note: "早餐和交通",
  spentAt: "2026-06-03T09:00:00.000",
  createdAt: "2026-06-03T09:00:00.000",
  updatedAt: "2026-06-03T09:00:00.000",
  ...overrides,
});

describe("DailyExpensePoolPanel", () => {
  it("renders the top, middle, and bottom sections", () => {
    render(
      <DailyExpensePoolPanel
        entries={[dailyExpenseEntry()]}
        onDeleteEntry={vi.fn()}
        onSaveEntry={vi.fn()}
        onSavePool={vi.fn()}
        onSaveWalletContainer={vi.fn()}
        pool={dailyExpensePool()}
        walletContainers={[walletContainer()]}
        now={now}
      />,
    );

    const panel = screen.getByRole("region", { name: "日常开销池" });

    expect(panel).not.toHaveTextContent(
      "这是你手动划入、手动结算的本地日常开销池。",
    );
    expect(panel).toHaveTextContent("信息面板");
    expect(panel).toHaveTextContent("当前余额");
    expect(panel).toHaveTextContent("300");
    expect(panel).toHaveTextContent("最近划入500");
    expect(panel).toHaveTextContent("划款日期2026-06-02");
    expect(panel).toHaveTextContent("最近来源现金口袋");
    expect(panel).toHaveTextContent("消费结算");
    expect(panel).not.toHaveTextContent("余额不足时不能扣款。");
    expect(panel).toHaveTextContent("消费流水");
    expect(panel).not.toHaveTextContent("只保存在本机");
    expect(panel).toHaveTextContent("早餐和交通");
  });

  it("disables transfer when no wallet container exists", () => {
    render(
      <DailyExpensePoolPanel
        entries={[]}
        onDeleteEntry={vi.fn()}
        onSaveEntry={vi.fn()}
        onSavePool={vi.fn()}
        onSaveWalletContainer={vi.fn()}
        pool={dailyExpensePool({ selectedWalletContainerId: undefined })}
        walletContainers={[]}
        now={now}
      />,
    );

    const panel = screen.getByRole("region", { name: "日常开销池" });

    expect(panel).toHaveTextContent("请先创建钱包容器，再从钱包划入开销池。");
    expect(within(panel).getByRole("button", { name: "划入开销池" })).toBeDisabled();
  });

  it("transfers money from the selected wallet into the pool", async () => {
    const user = userEvent.setup();
    const onSavePool = vi.fn().mockResolvedValue(undefined);
    const onSaveWalletContainer = vi.fn().mockResolvedValue(undefined);

    render(
      <DailyExpensePoolPanel
        entries={[]}
        onDeleteEntry={vi.fn()}
        onSaveEntry={vi.fn()}
        onSavePool={onSavePool}
        onSaveWalletContainer={onSaveWalletContainer}
        pool={dailyExpensePool({ balance: 300 })}
        walletContainers={[walletContainer({ balance: 1000 })]}
        now={now}
      />,
    );

    await user.clear(screen.getByLabelText("划入金额"));
    await user.type(screen.getByLabelText("划入金额"), "250");
    await user.click(screen.getByRole("button", { name: "划入开销池" }));

    expect(onSaveWalletContainer).toHaveBeenCalledWith({
      ...walletContainer({ balance: 1000 }),
      balance: 750,
      updatedAt: "2026-06-03T10:30:00.000",
    });
    expect(onSavePool).toHaveBeenCalledWith({
      ...dailyExpensePool({ balance: 300 }),
      balance: 550,
      lastTransferAmount: 250,
      lastTransferAt: "2026-06-03T10:30:00.000",
      lastTransferWalletContainerId: "wallet-1",
      lastTransferWalletContainerNameSnapshot: "现金口袋",
      updatedAt: "2026-06-03T10:30:00.000",
    });
    expect(screen.getByRole("region", { name: "日常开销池" })).toHaveTextContent(
      "550",
    );
  });

  it("keeps settlement usable when the selected transfer source is missing", async () => {
    const user = userEvent.setup();
    const onSaveEntry = vi.fn().mockResolvedValue(undefined);

    render(
      <DailyExpensePoolPanel
        createEntryId={() => "expense-new"}
        entries={[]}
        onDeleteEntry={vi.fn()}
        onSaveEntry={onSaveEntry}
        onSavePool={vi.fn()}
        onSaveWalletContainer={vi.fn()}
        pool={dailyExpensePool({
          selectedWalletContainerId: "missing-wallet",
          balance: 300,
        })}
        walletContainers={[walletContainer({ id: "wallet-other", name: "其他钱包" })]}
        now={now}
      />,
    );

    const panel = screen.getByRole("region", { name: "日常开销池" });

    expect(panel).toHaveTextContent("需要重新选择划款来源容器");
    expect(within(panel).getByRole("button", { name: "划入开销池" })).toBeDisabled();

    await user.type(screen.getByLabelText("消费金额"), "68");
    await user.type(screen.getByLabelText("消费备注"), "早餐");
    await user.click(screen.getByRole("button", { name: "立即扣款" }));

    expect(onSaveEntry).toHaveBeenCalledWith({
      id: "expense-new",
      amount: 68,
      note: "早餐",
      spentAt: "2026-06-03T10:30:00.000",
      createdAt: "2026-06-03T10:30:00.000",
      updatedAt: "2026-06-03T10:30:00.000",
    });
  });

  it("requires a positive charge amount and a non-empty note", async () => {
    const user = userEvent.setup();
    const onSaveEntry = vi.fn().mockResolvedValue(undefined);

    render(
      <DailyExpensePoolPanel
        entries={[]}
        onDeleteEntry={vi.fn()}
        onSaveEntry={onSaveEntry}
        onSavePool={vi.fn()}
        onSaveWalletContainer={vi.fn()}
        pool={dailyExpensePool({ balance: 30 })}
        walletContainers={[walletContainer()]}
        now={now}
      />,
    );

    expect(screen.getByRole("button", { name: "立即扣款" })).toBeDisabled();

    await user.type(screen.getByLabelText("消费金额"), "40");
    await user.type(screen.getByLabelText("消费备注"), "早餐");

    expect(screen.getByRole("button", { name: "立即扣款" })).toBeDisabled();

    await user.clear(screen.getByLabelText("消费金额"));
    await user.type(screen.getByLabelText("消费金额"), "20");
    await user.clear(screen.getByLabelText("消费备注"));
    await user.type(screen.getByLabelText("消费备注"), "   ");

    expect(screen.getByRole("button", { name: "立即扣款" })).toBeDisabled();
    expect(onSaveEntry).not.toHaveBeenCalled();
  });

  it("charges the pool and creates an expense entry without touching wallets", async () => {
    const user = userEvent.setup();
    const onSavePool = vi.fn().mockResolvedValue(undefined);
    const onSaveEntry = vi.fn().mockResolvedValue(undefined);
    const onSaveWalletContainer = vi.fn().mockResolvedValue(undefined);

    render(
      <DailyExpensePoolPanel
        createEntryId={() => "expense-new"}
        entries={[]}
        onDeleteEntry={vi.fn()}
        onSaveEntry={onSaveEntry}
        onSavePool={onSavePool}
        onSaveWalletContainer={onSaveWalletContainer}
        pool={dailyExpensePool({ balance: 300 })}
        walletContainers={[walletContainer()]}
        now={now}
      />,
    );

    await user.type(screen.getByLabelText("消费金额"), "68");
    await user.type(screen.getByLabelText("消费备注"), " 早餐和交通 ");
    await user.click(screen.getByRole("button", { name: "立即扣款" }));

    expect(onSavePool).toHaveBeenCalledWith({
      ...dailyExpensePool({ balance: 300 }),
      balance: 232,
      updatedAt: "2026-06-03T10:30:00.000",
    });
    expect(onSaveEntry).toHaveBeenCalledWith({
      id: "expense-new",
      amount: 68,
      note: "早餐和交通",
      spentAt: "2026-06-03T10:30:00.000",
      createdAt: "2026-06-03T10:30:00.000",
      updatedAt: "2026-06-03T10:30:00.000",
    });
    expect(onSaveWalletContainer).not.toHaveBeenCalled();
  });

  it("deletes an expense entry and rolls the amount back into the pool", async () => {
    const user = userEvent.setup();
    const onSavePool = vi.fn().mockResolvedValue(undefined);
    const onDeleteEntry = vi.fn().mockResolvedValue(undefined);
    const onSaveWalletContainer = vi.fn().mockResolvedValue(undefined);

    render(
      <DailyExpensePoolPanel
        entries={[dailyExpenseEntry({ id: "expense-delete", amount: 80 })]}
        onDeleteEntry={onDeleteEntry}
        onSaveEntry={vi.fn()}
        onSavePool={onSavePool}
        onSaveWalletContainer={onSaveWalletContainer}
        pool={dailyExpensePool({ balance: 120 })}
        walletContainers={[walletContainer()]}
        now={now}
      />,
    );

    await user.click(screen.getByRole("button", { name: "删除消费流水早餐和交通" }));

    expect(onSavePool).toHaveBeenCalledWith({
      ...dailyExpensePool({ balance: 120 }),
      balance: 200,
      updatedAt: "2026-06-03T10:30:00.000",
    });
    expect(onDeleteEntry).toHaveBeenCalledWith("expense-delete");
    expect(onSaveWalletContainer).not.toHaveBeenCalled();
  });

  it("does not render forbidden finance language", () => {
    render(
      <DailyExpensePoolPanel
        entries={[]}
        onDeleteEntry={vi.fn()}
        onSaveEntry={vi.fn()}
        onSavePool={vi.fn()}
        onSaveWalletContainer={vi.fn()}
        pool={dailyExpensePool()}
        walletContainers={[walletContainer()]}
        now={now}
      />,
    );

    expect(screen.queryByText("周期判断")).not.toBeInTheDocument();
    expect(screen.queryByText("预算警报")).not.toBeInTheDocument();
    expect(screen.queryByText("超支惩罚")).not.toBeInTheDocument();
    expect(screen.queryByText("财务健康评分")).not.toBeInTheDocument();
    expect(screen.queryByText("消费建议")).not.toBeInTheDocument();
    expect(screen.queryByText("财务诊断")).not.toBeInTheDocument();
    expect(screen.queryByText("银行连接")).not.toBeInTheDocument();
    expect(screen.queryByText("支付平台")).not.toBeInTheDocument();
  });
});
