import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type {
  DailyExpenseEntry,
  DailyExpensePool,
  MoneyInflowSource,
  WalletContainer,
  WealthFlowEvent,
} from "@/types/lifeos";

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

const incomeSource = (
  overrides: Partial<MoneyInflowSource> = {},
): MoneyInflowSource => ({
  id: "income-1",
  name: "固定工资",
  amountPattern: { kind: "fixed", amount: 300 },
  frequencyPattern: { kind: "fixed", interval: "monthly" },
  targetWalletContainerId: "wallet-1",
  createdAt: "2026-05-26T08:00:00.000",
  updatedAt: "2026-05-26T08:00:00.000",
  ...overrides,
});

const dailyExpensePool = (
  overrides: Partial<DailyExpensePool> = {},
): DailyExpensePool => ({
  id: "default",
  balance: 300,
  selectedWalletContainerId: "wallet-1",
  lastTransferAmount: 500,
  lastTransferAt: "2026-05-26T08:00:00.000",
  lastTransferWalletContainerId: "wallet-1",
  lastTransferWalletContainerNameSnapshot: "现金口袋",
  createdAt: "2026-05-26T08:00:00.000",
  updatedAt: "2026-05-26T08:00:00.000",
  ...overrides,
});

const dailyExpenseEntry = (
  overrides: Partial<DailyExpenseEntry> = {},
): DailyExpenseEntry => ({
  id: "expense-1",
  amount: 68,
  note: "早餐和交通",
  spentAt: "2026-05-27T08:30:00.000",
  createdAt: "2026-05-27T08:30:00.000",
  updatedAt: "2026-05-27T08:30:00.000",
  ...overrides,
});

const wealthFlowEvent = (
  overrides: Partial<WealthFlowEvent> = {},
): WealthFlowEvent => ({
  id: "wealth-flow-1",
  type: "daily_expense_spent",
  direction: "out",
  amount: 68,
  occurredAt: "2026-05-27T08:30:00.000",
  source: {
    type: "daily_expense_pool",
    id: "default",
    nameSnapshot: "日常开销池",
  },
  relatedDailyExpenseEntryId: "expense-1",
  note: "早餐和交通",
  createdAt: "2026-05-27T08:30:00.000",
  updatedAt: "2026-05-27T08:30:00.000",
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

    const incomeSources = screen.getByRole("region", { name: "收入来源" });
    expect(incomeSources).toHaveTextContent("这些是你手动维护的本地收入来源。");

    const dailyExpense = screen.getByRole("region", { name: "日常开销池" });
    expect(dailyExpense).not.toHaveTextContent(
      "这是你手动划入、手动结算的本地日常开销池。",
    );
    const wealthFlow = screen.getByRole("region", { name: "财富流动日志" });
    expect(wealthFlow).toHaveTextContent(
      "这里展示从当前版本开始追加记录的本地财富流动事件。",
    );

    expect(
      wallet.compareDocumentPosition(incomeSources) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      incomeSources.compareDocumentPosition(dailyExpense) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      dailyExpense.compareDocumentPosition(wealthFlow) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
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
    expect(
      screen.getByRole("region", { name: "我的钱包" }),
    ).toHaveTextContent("生活现金");
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

  it("deposits a fixed amount income source into its target wallet", async () => {
    const user = userEvent.setup();
    const onSaveContainer = vi.fn().mockResolvedValue(undefined);
    const onSaveWealthFlowEvent = vi.fn().mockResolvedValue(undefined);

    render(
      <FinanceManagementPanel
        containers={[walletContainer({ balance: 120 })]}
        incomeSources={[incomeSource({ amountPattern: { kind: "fixed", amount: 80 } })]}
        onBack={vi.fn()}
        onDeleteContainer={vi.fn()}
        onDeleteIncomeSource={vi.fn()}
        onSaveContainer={onSaveContainer}
        onSaveIncomeSource={vi.fn()}
        onSaveWealthFlowEvent={onSaveWealthFlowEvent}
        createWealthFlowEventId={() => "wealth-income"}
        now={now}
      />,
    );

    await user.click(screen.getByRole("button", { name: "手动入账固定工资" }));

    expect(onSaveContainer).toHaveBeenCalledWith({
      ...walletContainer({ balance: 120 }),
      balance: 200,
      updatedAt: "2026-05-27T09:10:00.000",
    });
    expect(screen.getByRole("region", { name: "我的钱包" })).toHaveTextContent("200");
    expect(onSaveWealthFlowEvent).toHaveBeenCalledWith({
      id: "wealth-income",
      type: "income_received",
      direction: "in",
      amount: 80,
      occurredAt: "2026-05-27T09:10:00.000",
      source: {
        type: "income_source",
        id: "income-1",
        nameSnapshot: "固定工资",
      },
      target: {
        type: "wallet_container",
        id: "wallet-1",
        nameSnapshot: "现金口袋",
      },
      createdAt: "2026-05-27T09:10:00.000",
      updatedAt: "2026-05-27T09:10:00.000",
    });
  });

  it("asks for a received amount before depositing a variable amount income source", async () => {
    const user = userEvent.setup();
    const onSaveContainer = vi.fn().mockResolvedValue(undefined);
    const onSaveWealthFlowEvent = vi.fn().mockResolvedValue(undefined);

    render(
      <FinanceManagementPanel
        containers={[walletContainer({ balance: 120 })]}
        incomeSources={[
          incomeSource({
            name: "平台收入",
            amountPattern: { kind: "variable" },
            frequencyPattern: { kind: "variable" },
          }),
        ]}
        onBack={vi.fn()}
        onDeleteContainer={vi.fn()}
        onDeleteIncomeSource={vi.fn()}
        onSaveContainer={onSaveContainer}
        onSaveIncomeSource={vi.fn()}
        onSaveWealthFlowEvent={onSaveWealthFlowEvent}
        createWealthFlowEventId={() => "wealth-variable-income"}
        now={now}
      />,
    );

    await user.click(screen.getByRole("button", { name: "手动入账平台收入" }));
    await user.type(screen.getByLabelText("本次到账金额"), "75.5");
    await user.click(screen.getByRole("button", { name: "确认入账" }));

    expect(onSaveContainer).toHaveBeenCalledWith({
      ...walletContainer({ balance: 120 }),
      balance: 195.5,
      updatedAt: "2026-05-27T09:10:00.000",
    });
    expect(screen.getByRole("region", { name: "我的钱包" })).toHaveTextContent("195.5");
    expect(onSaveWealthFlowEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "wealth-variable-income",
        type: "income_received",
        direction: "in",
        amount: 75.5,
      }),
    );
  });

  it("transfers money into the daily expense pool and refreshes wallet summary", async () => {
    const user = userEvent.setup();
    const onSaveContainer = vi.fn().mockResolvedValue(undefined);
    const onSaveDailyExpensePool = vi.fn().mockResolvedValue(undefined);
    const onSaveWealthFlowEvent = vi.fn().mockResolvedValue(undefined);

    render(
      <FinanceManagementPanel
        containers={[walletContainer({ balance: 1000 })]}
        dailyExpenseEntries={[]}
        dailyExpensePool={dailyExpensePool({ balance: 300 })}
        onBack={vi.fn()}
        onDeleteContainer={vi.fn()}
        onDeleteDailyExpenseEntry={vi.fn()}
        onDeleteIncomeSource={vi.fn()}
        onSaveContainer={onSaveContainer}
        onSaveDailyExpenseEntry={vi.fn()}
        onSaveDailyExpensePool={onSaveDailyExpensePool}
        onSaveIncomeSource={vi.fn()}
        onSaveWealthFlowEvent={onSaveWealthFlowEvent}
        createWealthFlowEventId={() => "wealth-transfer"}
        now={now}
      />,
    );

    await user.clear(screen.getByLabelText("划入金额"));
    await user.type(screen.getByLabelText("划入金额"), "250");
    await user.click(screen.getByRole("button", { name: "划入开销池" }));

    expect(onSaveContainer).toHaveBeenCalledWith({
      ...walletContainer({ balance: 1000 }),
      balance: 750,
      updatedAt: "2026-05-27T09:10:00.000",
    });
    expect(onSaveDailyExpensePool).toHaveBeenCalledWith({
      ...dailyExpensePool({ balance: 300 }),
      balance: 550,
      lastTransferAmount: 250,
      lastTransferAt: "2026-05-27T09:10:00.000",
      lastTransferWalletContainerId: "wallet-1",
      lastTransferWalletContainerNameSnapshot: "现金口袋",
      updatedAt: "2026-05-27T09:10:00.000",
    });
    expect(screen.getByRole("region", { name: "我的钱包" })).toHaveTextContent("750");
    expect(screen.getByRole("region", { name: "日常开销池" })).toHaveTextContent(
      "550",
    );
    expect(onSaveWealthFlowEvent).toHaveBeenCalledWith({
      id: "wealth-transfer",
      type: "daily_expense_transfer",
      direction: "transfer",
      amount: 250,
      occurredAt: "2026-05-27T09:10:00.000",
      source: {
        type: "wallet_container",
        id: "wallet-1",
        nameSnapshot: "现金口袋",
      },
      target: {
        type: "daily_expense_pool",
        id: "default",
        nameSnapshot: "日常开销池",
      },
      createdAt: "2026-05-27T09:10:00.000",
      updatedAt: "2026-05-27T09:10:00.000",
    });
  });

  it("shows v1.4.3 expense events in wealth flow log instead of the daily expense pool", () => {
    render(
      <FinanceManagementPanel
        containers={[walletContainer()]}
        dailyExpenseEntries={[dailyExpenseEntry()]}
        dailyExpensePool={dailyExpensePool()}
        wealthFlowEvents={[wealthFlowEvent()]}
        onBack={vi.fn()}
        onDeleteContainer={vi.fn()}
        onDeleteDailyExpenseEntry={vi.fn()}
        onDeleteIncomeSource={vi.fn()}
        onSaveContainer={vi.fn()}
        onSaveDailyExpenseEntry={vi.fn()}
        onSaveDailyExpensePool={vi.fn()}
        onSaveIncomeSource={vi.fn()}
        now={now}
      />,
    );

    const dailyExpense = screen.getByRole("region", { name: "日常开销池" });
    const wealthFlow = screen.getByRole("region", { name: "财富流动日志" });
    expect(dailyExpense).not.toHaveTextContent("早餐和交通");
    expect(wealthFlow).toHaveTextContent("早餐和交通");
    expect(dailyExpense).not.toHaveTextContent("后续开放");
  });

  it("charges the daily expense pool and records a wealth flow expense event", async () => {
    const user = userEvent.setup();
    const onSaveDailyExpensePool = vi.fn().mockResolvedValue(undefined);
    const onSaveDailyExpenseEntry = vi.fn().mockResolvedValue(undefined);
    const onSaveWealthFlowEvent = vi.fn().mockResolvedValue(undefined);

    render(
      <FinanceManagementPanel
        containers={[walletContainer({ balance: 1000 })]}
        dailyExpenseEntries={[]}
        dailyExpensePool={dailyExpensePool({ balance: 300 })}
        onBack={vi.fn()}
        onDeleteContainer={vi.fn()}
        onDeleteDailyExpenseEntry={vi.fn()}
        onDeleteIncomeSource={vi.fn()}
        onSaveContainer={vi.fn()}
        onSaveDailyExpenseEntry={onSaveDailyExpenseEntry}
        onSaveDailyExpensePool={onSaveDailyExpensePool}
        onSaveIncomeSource={vi.fn()}
        onSaveWealthFlowEvent={onSaveWealthFlowEvent}
        createDailyExpenseEntryId={() => "expense-new"}
        createWealthFlowEventId={() => "wealth-spent"}
        now={now}
      />,
    );

    await user.type(screen.getByLabelText("消费金额"), "68");
    await user.type(screen.getByLabelText("消费备注"), " 早餐和交通 ");
    await user.click(screen.getByRole("button", { name: "立即扣款" }));

    expect(onSaveDailyExpensePool).toHaveBeenCalledWith({
      ...dailyExpensePool({ balance: 300 }),
      balance: 232,
      updatedAt: "2026-05-27T09:10:00.000",
    });
    expect(onSaveDailyExpenseEntry).toHaveBeenCalledWith({
      id: "expense-new",
      amount: 68,
      note: "早餐和交通",
      spentAt: "2026-05-27T09:10:00.000",
      createdAt: "2026-05-27T09:10:00.000",
      updatedAt: "2026-05-27T09:10:00.000",
    });
    expect(onSaveWealthFlowEvent).toHaveBeenCalledWith({
      id: "wealth-spent",
      type: "daily_expense_spent",
      direction: "out",
      amount: 68,
      occurredAt: "2026-05-27T09:10:00.000",
      source: {
        type: "daily_expense_pool",
        id: "default",
        nameSnapshot: "日常开销池",
      },
      relatedDailyExpenseEntryId: "expense-new",
      note: "早餐和交通",
      createdAt: "2026-05-27T09:10:00.000",
      updatedAt: "2026-05-27T09:10:00.000",
    });
  });

  it("refunds an expense from the wealth flow log without touching wallets", async () => {
    const user = userEvent.setup();
    const onSaveDailyExpensePool = vi.fn().mockResolvedValue(undefined);
    const onDeleteDailyExpenseEntry = vi.fn().mockResolvedValue(undefined);
    const onSaveWealthFlowEvent = vi.fn().mockResolvedValue(undefined);
    const onSaveContainer = vi.fn().mockResolvedValue(undefined);

    render(
      <FinanceManagementPanel
        containers={[walletContainer({ balance: 1000 })]}
        dailyExpenseEntries={[dailyExpenseEntry({ id: "expense-1", amount: 68 })]}
        dailyExpensePool={dailyExpensePool({ balance: 232 })}
        wealthFlowEvents={[wealthFlowEvent({ id: "wealth-spent" })]}
        onBack={vi.fn()}
        onDeleteContainer={vi.fn()}
        onDeleteDailyExpenseEntry={onDeleteDailyExpenseEntry}
        onDeleteIncomeSource={vi.fn()}
        onSaveContainer={onSaveContainer}
        onSaveDailyExpenseEntry={vi.fn()}
        onSaveDailyExpensePool={onSaveDailyExpensePool}
        onSaveIncomeSource={vi.fn()}
        onSaveWealthFlowEvent={onSaveWealthFlowEvent}
        createWealthFlowEventId={() => "wealth-refund"}
        now={now}
      />,
    );

    await user.click(screen.getByRole("button", { name: "回退消费早餐和交通" }));

    expect(onSaveDailyExpensePool).toHaveBeenCalledWith({
      ...dailyExpensePool({ balance: 232 }),
      balance: 300,
      updatedAt: "2026-05-27T09:10:00.000",
    });
    expect(onDeleteDailyExpenseEntry).toHaveBeenCalledWith("expense-1");
    expect(onSaveContainer).not.toHaveBeenCalled();
    expect(onSaveWealthFlowEvent).toHaveBeenCalledWith({
      id: "wealth-refund",
      type: "daily_expense_refund",
      direction: "in",
      amount: 68,
      occurredAt: "2026-05-27T09:10:00.000",
      target: {
        type: "daily_expense_pool",
        id: "default",
        nameSnapshot: "日常开销池",
      },
      relatedEventId: "wealth-spent",
      relatedDailyExpenseEntryId: "expense-1",
      createdAt: "2026-05-27T09:10:00.000",
      updatedAt: "2026-05-27T09:10:00.000",
    });
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
    expect(wallet).toHaveTextContent("银行卡");
    expect(wallet).toHaveTextContent("桌面手动快照");
    expect(wallet).toHaveTextContent("300");
    expect(wallet).toHaveTextContent("30%");
    expect(within(wallet).getByRole("button", { name: "编辑银行卡" })).toBeInTheDocument();
    expect(within(wallet).getByRole("button", { name: "删除银行卡" })).toBeInTheDocument();
    expect(wallet).toHaveTextContent("学习基金");
    expect(wallet).toHaveTextContent("700");
    expect(wallet).toHaveTextContent("70%");
    expect(wallet).toHaveTextContent("信用卡");
    expect(wallet).toHaveTextContent("-100");
    expect(wallet).toHaveTextContent("暂不计算");
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
    expect(wallet).toHaveTextContent("尚未新建资金容器。");
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
    const wealthFlow = screen.getByRole("region", { name: "财富流动日志" });

    expect(future).toHaveTextContent("金鹅账户后续开放");
    expect(future).toHaveTextContent("梦想账户后续开放");
    expect(future).not.toHaveTextContent("财富流动日志后续开放");
    expect(future).not.toHaveTextContent("日常开销池");
    expect(future).not.toHaveTextContent("金钱流入来源");
    expect(
      wealthFlow.compareDocumentPosition(future) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
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
    expect(screen.queryByText("消费建议")).not.toBeInTheDocument();
    expect(screen.queryByText("投资建议")).not.toBeInTheDocument();
    expect(screen.queryByText("财务诊断")).not.toBeInTheDocument();
    expect(screen.queryByText("银行连接")).not.toBeInTheDocument();
    expect(screen.queryByText("支付平台")).not.toBeInTheDocument();
  });
});
