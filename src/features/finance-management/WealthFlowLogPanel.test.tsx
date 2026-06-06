import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { WealthFlowEvent } from "@/types/lifeos";

import { WealthFlowLogPanel } from "./WealthFlowLogPanel";
import styles from "./finance-management.module.css";

const wealthFlowEvent = (
  overrides: Partial<WealthFlowEvent> = {},
): WealthFlowEvent => ({
  id: "event-1",
  type: "income_received",
  direction: "in",
  amount: 8000,
  occurredAt: "2026-06-04T09:00:00.000",
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
  note: "月底手动确认",
  createdAt: "2026-06-04T09:00:00.000",
  updatedAt: "2026-06-04T09:00:00.000",
  ...overrides,
});

describe("WealthFlowLogPanel", () => {
  it("renders the title, local-only description, and restrained empty state", () => {
    render(<WealthFlowLogPanel events={[]} />);

    const panel = screen.getByRole("region", { name: "财富流动日志" });

    expect(panel).toHaveTextContent("财富流动日志");
    expect(panel).toHaveTextContent(
      "这里展示从当前版本开始追加记录的本地财富流动事件。",
    );
    expect(panel).toHaveTextContent(
      "还没有财富流动日志。当前版本只记录之后新发生的入账、划款、消费和消费回退。",
    );
    expect(panel).not.toHaveTextContent("补录");
    expect(panel).not.toHaveTextContent("完整历史");
  });

  it("renders all supported event types with direction-aware amounts and snapshots", () => {
    render(
      <WealthFlowLogPanel
        events={[
          wealthFlowEvent({
            id: "spent-1",
            type: "daily_expense_spent",
            direction: "out",
            amount: 68,
            occurredAt: "2026-06-04T12:30:00.000",
            source: {
              type: "daily_expense_pool",
              id: "daily-pool",
              nameSnapshot: "日常开销池",
            },
            target: undefined,
            note: "早餐和交通",
          }),
          wealthFlowEvent({
            id: "transfer-1",
            type: "daily_expense_transfer",
            direction: "transfer",
            amount: 300,
            occurredAt: "2026-06-04T10:00:00.000",
            source: {
              type: "wallet_container",
              id: "wallet-1",
              nameSnapshot: "现金口袋",
            },
            target: {
              type: "daily_expense_pool",
              id: "daily-pool",
              nameSnapshot: "日常开销池",
            },
            note: undefined,
          }),
          wealthFlowEvent(),
          wealthFlowEvent({
            id: "refund-1",
            type: "daily_expense_refund",
            direction: "in",
            amount: 68,
            occurredAt: "2026-06-04T13:00:00.000",
            source: undefined,
            target: {
              type: "daily_expense_pool",
              id: "daily-pool",
              nameSnapshot: "日常开销池",
            },
            relatedEventId: "spent-1",
            relatedDailyExpenseEntryId: "expense-1",
            note: "删除消费流水后回退",
          }),
        ]}
      />,
    );

    const panel = screen.getByRole("region", { name: "财富流动日志" });
    const items = within(panel).getAllByRole("listitem");

    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent("消费回退");
    expect(items[0]).toHaveTextContent("+68");
    expect(items[0]).toHaveTextContent("2026-06-04 13:00");
    expect(items[0]).toHaveTextContent("目标：日常开销池");
    expect(items[0]).toHaveTextContent("关联原消费：早餐和交通");
    expect(items[0]).toHaveTextContent("删除消费流水后回退");

    expect(items[1]).toHaveTextContent("消费");
    expect(items[1]).toHaveTextContent("-68");
    expect(items[1]).toHaveTextContent("来源：日常开销池");
    expect(items[1]).toHaveTextContent("早餐和交通");

    expect(items[2]).toHaveTextContent("划款");
    expect(items[2]).toHaveTextContent("划入开销池 300");
    expect(items[2]).toHaveTextContent("来源：现金口袋");
    expect(items[2]).toHaveTextContent("目标：日常开销池");

    expect(items[3]).toHaveTextContent("入账");
    expect(items[3]).toHaveTextContent("+8,000");
    expect(items[3]).toHaveTextContent("来源：固定工资");
    expect(items[3]).toHaveTextContent("目标：现金口袋");
    expect(items[3]).toHaveTextContent("月底手动确认");
  });

  it("places identity, metadata, and amount in the compact row body", () => {
    render(
      <WealthFlowLogPanel
        events={[
          wealthFlowEvent({
            id: "refund-1",
            type: "daily_expense_refund",
            direction: "in",
            amount: 68,
            source: undefined,
            target: {
              type: "daily_expense_pool",
              id: "daily-pool",
              nameSnapshot: "日常开销池",
            },
            relatedEventId: "spent-1",
          }),
          wealthFlowEvent({
            id: "spent-1",
            type: "daily_expense_spent",
            direction: "out",
            amount: 68,
            source: {
              type: "daily_expense_pool",
              id: "daily-pool",
              nameSnapshot: "日常开销池",
            },
            target: undefined,
            note: "早餐和交通",
          }),
        ]}
      />,
    );

    const item = screen.getByLabelText("消费回退 +68");
    const body = item.querySelector<HTMLElement>(
      `.${styles.wealthFlowEventBody}`,
    );
    const header = item.querySelector<HTMLElement>(
      `.${styles.wealthFlowEventHeader}`,
    );
    const meta = item.querySelector<HTMLElement>(`.${styles.wealthFlowMeta}`);
    const amount = item.querySelector<HTMLElement>(`.${styles.wealthFlowAmount}`);

    expect(body).toContainElement(header);
    expect(body).toContainElement(meta);
    expect(body).toContainElement(amount);
  });

  it("does not render forbidden finance product language", () => {
    render(<WealthFlowLogPanel events={[wealthFlowEvent()]} />);

    expect(screen.queryByText("银行连接")).not.toBeInTheDocument();
    expect(screen.queryByText("支付平台")).not.toBeInTheDocument();
    expect(screen.queryByText("预算统计")).not.toBeInTheDocument();
    expect(screen.queryByText("消费分类")).not.toBeInTheDocument();
    expect(screen.queryByText("财务诊断")).not.toBeInTheDocument();
    expect(screen.queryByText("投资建议")).not.toBeInTheDocument();
    expect(screen.queryByText("预算警报")).not.toBeInTheDocument();
    expect(screen.queryByText("超支惩罚")).not.toBeInTheDocument();
    expect(screen.queryByText("财务健康评分")).not.toBeInTheDocument();
  });

  it("marks refunded expense events as already refunded", () => {
    render(
      <WealthFlowLogPanel
        events={[
          wealthFlowEvent({
            id: "spent-1",
            type: "daily_expense_spent",
            direction: "out",
            amount: 68,
            source: {
              type: "daily_expense_pool",
              id: "daily-pool",
              nameSnapshot: "日常开销池",
            },
            target: undefined,
            note: "早餐和交通",
          }),
          wealthFlowEvent({
            id: "refund-1",
            type: "daily_expense_refund",
            direction: "in",
            amount: 68,
            source: undefined,
            target: {
              type: "daily_expense_pool",
              id: "daily-pool",
              nameSnapshot: "日常开销池",
            },
            relatedEventId: "spent-1",
            relatedDailyExpenseEntryId: "expense-1",
          }),
        ]}
        onRefundExpense={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: "回退消费早餐和交通" });
    expect(button).toHaveTextContent("已回退");
    expect(button).toBeDisabled();
  });

  it("uses distinct amount colors for in, transfer, and out events", () => {
    render(
      <WealthFlowLogPanel
        events={[
          wealthFlowEvent({
            id: "spent-1",
            type: "daily_expense_spent",
            direction: "out",
            amount: 68,
            occurredAt: "2026-06-04T12:30:00.000",
            source: {
              type: "daily_expense_pool",
              id: "daily-pool",
              nameSnapshot: "日常开销池",
            },
            target: undefined,
            note: "早餐和交通",
          }),
          wealthFlowEvent({
            id: "transfer-1",
            type: "daily_expense_transfer",
            direction: "transfer",
            amount: 300,
            occurredAt: "2026-06-04T10:00:00.000",
            source: {
              type: "wallet_container",
              id: "wallet-1",
              nameSnapshot: "现金口袋",
            },
            target: {
              type: "daily_expense_pool",
              id: "daily-pool",
              nameSnapshot: "日常开销池",
            },
            note: undefined,
          }),
          wealthFlowEvent(),
          wealthFlowEvent({
            id: "refund-1",
            type: "daily_expense_refund",
            direction: "in",
            amount: 68,
            occurredAt: "2026-06-04T13:00:00.000",
            source: undefined,
            target: {
              type: "daily_expense_pool",
              id: "daily-pool",
              nameSnapshot: "日常开销池",
            },
            relatedEventId: "spent-1",
          }),
        ]}
      />,
    );

    expect(screen.getByText("+68")).toHaveClass(styles.wealthFlowAmountIn);
    expect(screen.getByText("-68")).toHaveClass(styles.wealthFlowAmountOut);
    expect(screen.getByText("划入开销池 300")).toHaveClass(
      styles.wealthFlowAmountTransfer,
    );
    expect(screen.getByText("+8,000")).toHaveClass(styles.wealthFlowAmountIn);
  });

  it("paginates wealth flow events ten per page", async () => {
    const user = userEvent.setup();
    const events = Array.from({ length: 12 }, (_, index) =>
      wealthFlowEvent({
        id: `event-${index + 1}`,
        amount: index + 1,
        occurredAt: `2026-06-04T09:${String(index).padStart(2, "0")}:00.000`,
        note: `流水 ${index + 1}`,
      }),
    );

    render(<WealthFlowLogPanel events={events} />);

    const panel = screen.getByRole("region", { name: "财富流动日志" });
    expect(within(panel).getAllByRole("listitem")).toHaveLength(10);
    expect(panel).toHaveTextContent("流水 12");
    expect(panel).toHaveTextContent("流水 3");
    expect(panel).not.toHaveTextContent("流水 2");
    expect(panel).toHaveTextContent("第 1 / 2 页 · 共 12 条");
    expect(screen.getByRole("button", { name: "上一页" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "下一页" }));

    expect(within(panel).getAllByRole("listitem")).toHaveLength(2);
    expect(panel).toHaveTextContent("流水 2");
    expect(panel).toHaveTextContent("流水 1");
    expect(panel).not.toHaveTextContent("流水 3");
    expect(panel).toHaveTextContent("第 2 / 2 页 · 共 12 条");
    expect(screen.getByRole("button", { name: "下一页" })).toBeDisabled();
  });
});
