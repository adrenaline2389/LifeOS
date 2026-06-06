import { describe, expect, it } from "vitest";

import type {
  DailyExpenseEntry,
  DailyExpensePool,
  MoneyInflowSource,
  WalletContainer,
} from "@/types/lifeos";

import {
  createDailyExpenseRefundEvent,
  createDailyExpenseSpentEvent,
  createDailyExpenseTransferEvent,
  createIncomeReceivedEvent,
} from "./wealth-flow-events";

const timestamp = "2026-06-05T11:20:30.000";
const now = () => new Date(timestamp);

const walletContainer = (
  overrides: Partial<WalletContainer> = {},
): WalletContainer => ({
  id: "wallet-1",
  name: "日常账户",
  balance: 1000,
  color: "#2f9be7",
  createdAt: "2026-06-01T08:00:00.000",
  updatedAt: "2026-06-01T08:00:00.000",
  ...overrides,
});

const moneyInflowSource = (
  overrides: Partial<MoneyInflowSource> = {},
): MoneyInflowSource => ({
  id: "source-1",
  name: "项目款",
  amountPattern: {
    kind: "variable",
  },
  frequencyPattern: {
    kind: "variable",
  },
  targetWalletContainerId: "wallet-1",
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
  createdAt: "2026-06-02T08:00:00.000",
  updatedAt: "2026-06-02T08:00:00.000",
  ...overrides,
});

const dailyExpenseEntry = (
  overrides: Partial<DailyExpenseEntry> = {},
): DailyExpenseEntry => ({
  id: "expense-entry-1",
  amount: 68,
  note: "早餐和交通",
  spentAt: "2026-06-05T10:00:00.000",
  createdAt: "2026-06-05T10:00:00.000",
  updatedAt: "2026-06-05T10:00:00.000",
  ...overrides,
});

describe("wealth flow event constructors", () => {
  it("creates an income_received event with in direction and source/target snapshots", () => {
    const event = createIncomeReceivedEvent({
      source: moneyInflowSource({ id: "source-1", name: "项目款" }),
      targetWalletContainer: walletContainer({
        id: "wallet-1",
        name: "日常账户",
      }),
      amount: 125.5,
      now,
      createId: () => "wealth-event-1",
    });

    expect(event).toEqual({
      id: "wealth-event-1",
      type: "income_received",
      direction: "in",
      amount: 125.5,
      occurredAt: timestamp,
      source: {
        type: "income_source",
        id: "source-1",
        nameSnapshot: "项目款",
      },
      target: {
        type: "wallet_container",
        id: "wallet-1",
        nameSnapshot: "日常账户",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });

  it("creates a daily_expense_transfer event with transfer direction and wallet/pool snapshots", () => {
    const event = createDailyExpenseTransferEvent({
      sourceWalletContainer: walletContainer({
        id: "wallet-1",
        name: "日常账户",
      }),
      targetDailyExpensePool: dailyExpensePool(),
      amount: 250,
      now,
      createId: () => "wealth-event-2",
    });

    expect(event).toEqual({
      id: "wealth-event-2",
      type: "daily_expense_transfer",
      direction: "transfer",
      amount: 250,
      occurredAt: timestamp,
      source: {
        type: "wallet_container",
        id: "wallet-1",
        nameSnapshot: "日常账户",
      },
      target: {
        type: "daily_expense_pool",
        id: "default",
        nameSnapshot: "日常开销池",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });

  it("creates a daily_expense_spent event with out direction, pool snapshot, note, and entry relation", () => {
    const event = createDailyExpenseSpentEvent({
      sourceDailyExpensePool: dailyExpensePool(),
      dailyExpenseEntry: dailyExpenseEntry({
        id: "expense-entry-1",
        amount: 68,
        note: "早餐和交通",
      }),
      now,
      createId: () => "wealth-event-3",
    });

    expect(event).toEqual({
      id: "wealth-event-3",
      type: "daily_expense_spent",
      direction: "out",
      amount: 68,
      occurredAt: timestamp,
      source: {
        type: "daily_expense_pool",
        id: "default",
        nameSnapshot: "日常开销池",
      },
      relatedDailyExpenseEntryId: "expense-entry-1",
      note: "早餐和交通",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });

  it("creates a daily_expense_refund event with in direction, pool target snapshot, and related ids", () => {
    const event = createDailyExpenseRefundEvent({
      targetDailyExpensePool: dailyExpensePool(),
      amount: 68,
      relatedEventId: "wealth-event-3",
      relatedDailyExpenseEntryId: "expense-entry-1",
      now,
      createId: () => "wealth-event-4",
    });

    expect(event).toEqual({
      id: "wealth-event-4",
      type: "daily_expense_refund",
      direction: "in",
      amount: 68,
      occurredAt: timestamp,
      target: {
        type: "daily_expense_pool",
        id: "default",
        nameSnapshot: "日常开销池",
      },
      relatedEventId: "wealth-event-3",
      relatedDailyExpenseEntryId: "expense-entry-1",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });

  it("requires positive finite amounts for every event type", () => {
    expect(() =>
      createIncomeReceivedEvent({
        source: moneyInflowSource(),
        targetWalletContainer: walletContainer(),
        amount: 0,
        now,
        createId: () => "wealth-event-1",
      }),
    ).toThrow("Wealth flow event amount must be a positive number.");

    expect(() =>
      createDailyExpenseTransferEvent({
        sourceWalletContainer: walletContainer(),
        targetDailyExpensePool: dailyExpensePool(),
        amount: -1,
        now,
        createId: () => "wealth-event-2",
      }),
    ).toThrow("Wealth flow event amount must be a positive number.");

    expect(() =>
      createDailyExpenseSpentEvent({
        sourceDailyExpensePool: dailyExpensePool(),
        dailyExpenseEntry: dailyExpenseEntry({ amount: Number.NaN }),
        now,
        createId: () => "wealth-event-3",
      }),
    ).toThrow("Wealth flow event amount must be a positive number.");

    expect(() =>
      createDailyExpenseRefundEvent({
        targetDailyExpensePool: dailyExpensePool(),
        amount: 0,
        relatedDailyExpenseEntryId: "expense-entry-1",
        now,
        createId: () => "wealth-event-4",
      }),
    ).toThrow("Wealth flow event amount must be a positive number.");
  });

  it("requires refund events to reference the original event or expense entry", () => {
    expect(() =>
      createDailyExpenseRefundEvent({
        targetDailyExpensePool: dailyExpensePool(),
        amount: 68,
        now,
        createId: () => "wealth-event-4",
      }),
    ).toThrow(
      "Daily expense refund events must reference the original event or expense entry.",
    );
  });
});
