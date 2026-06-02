import { describe, expect, it } from "vitest";

import type {
  DailyExpenseEntry,
  DailyExpensePool,
  WalletContainer,
} from "@/types/lifeos";

import {
  applyDailyExpenseCharge,
  applyDailyExpenseEntryDeletion,
  applyDailyExpenseTransfer,
  getDailyExpenseTransferSourceStatus,
} from "./daily-expense-actions";

const timestamp = "2026-06-03T10:30:00.000";
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
  id: "expense-1",
  amount: 80,
  note: "早餐",
  spentAt: "2026-06-03T09:00:00.000",
  createdAt: "2026-06-03T09:00:00.000",
  updatedAt: "2026-06-03T09:00:00.000",
  ...overrides,
});

describe("getDailyExpenseTransferSourceStatus", () => {
  it("reports unselected, missing, and available transfer source states", () => {
    expect(
      getDailyExpenseTransferSourceStatus({
        pool: dailyExpensePool({ selectedWalletContainerId: undefined }),
        walletContainers: [walletContainer()],
      }),
    ).toBe("unselected");

    expect(
      getDailyExpenseTransferSourceStatus({
        pool: dailyExpensePool({ selectedWalletContainerId: "missing-wallet" }),
        walletContainers: [walletContainer()],
      }),
    ).toBe("missing");

    expect(
      getDailyExpenseTransferSourceStatus({
        pool: dailyExpensePool({ selectedWalletContainerId: "wallet-1" }),
        walletContainers: [walletContainer()],
      }),
    ).toBe("available");
  });
});

describe("applyDailyExpenseTransfer", () => {
  it("moves a positive amount from the selected wallet into the daily expense pool", () => {
    const result = applyDailyExpenseTransfer({
      pool: dailyExpensePool({ balance: 300 }),
      walletContainers: [
        walletContainer({ id: "wallet-1", balance: 1000 }),
        walletContainer({ id: "wallet-2", name: "储蓄", balance: 200 }),
      ],
      amount: 250,
      now,
    });

    expect(result.status).toBe("transferred");
    if (result.status !== "transferred") {
      throw new Error("Expected transfer to succeed");
    }
    expect(result.updatedSourceContainer).toEqual({
      ...walletContainer({ id: "wallet-1", balance: 1000 }),
      balance: 750,
      updatedAt: timestamp,
    });
    expect(result.walletContainers).toEqual([
      result.updatedSourceContainer,
      walletContainer({ id: "wallet-2", name: "储蓄", balance: 200 }),
    ]);
    expect(result.pool).toEqual({
      ...dailyExpensePool({ balance: 300 }),
      balance: 550,
      lastTransferAmount: 250,
      lastTransferAt: timestamp,
      lastTransferWalletContainerId: "wallet-1",
      lastTransferWalletContainerNameSnapshot: "日常账户",
      updatedAt: timestamp,
    });
    expect(result.walletSummary.totalBalance).toBe(950);
  });

  it("rejects zero and negative transfer amounts without changing wallets or pool", () => {
    const pool = dailyExpensePool({ balance: 300 });
    const walletContainers = [walletContainer({ balance: 1000 })];

    expect(
      applyDailyExpenseTransfer({
        pool,
        walletContainers,
        amount: 0,
        now,
      }),
    ).toEqual({
      status: "invalid-amount",
      pool,
      walletContainers,
      walletSummary: expect.objectContaining({ totalBalance: 1000 }),
    });

    expect(
      applyDailyExpenseTransfer({
        pool,
        walletContainers,
        amount: -10,
        now,
      }),
    ).toEqual({
      status: "invalid-amount",
      pool,
      walletContainers,
      walletSummary: expect.objectContaining({ totalBalance: 1000 }),
    });
  });

  it("rejects missing and unselected transfer sources without changing wallets or pool", () => {
    const walletContainers = [walletContainer({ id: "wallet-1", balance: 1000 })];

    expect(
      applyDailyExpenseTransfer({
        pool: dailyExpensePool({ selectedWalletContainerId: undefined }),
        walletContainers,
        amount: 100,
        now,
      }).status,
    ).toBe("unselected-source");

    expect(
      applyDailyExpenseTransfer({
        pool: dailyExpensePool({ selectedWalletContainerId: "missing-wallet" }),
        walletContainers,
        amount: 100,
        now,
      }).status,
    ).toBe("missing-source");
  });

  it("rejects transfer amounts above the source wallet balance", () => {
    const pool = dailyExpensePool({ balance: 300 });
    const walletContainers = [walletContainer({ balance: 50 })];

    expect(
      applyDailyExpenseTransfer({
        pool,
        walletContainers,
        amount: 80,
        now,
      }),
    ).toEqual({
      status: "insufficient-wallet-balance",
      pool,
      walletContainers,
      walletSummary: expect.objectContaining({ totalBalance: 50 }),
    });
  });
});

describe("applyDailyExpenseCharge", () => {
  it("charges the daily expense pool and creates a local expense entry", () => {
    const pool = dailyExpensePool({ balance: 300 });

    const result = applyDailyExpenseCharge({
      pool,
      amount: 68,
      note: " 早餐和交通 ",
      now,
      createId: () => "expense-entry-1",
    });

    expect(result.status).toBe("charged");
    if (result.status !== "charged") {
      throw new Error("Expected charge to succeed");
    }
    expect(result.pool).toEqual({
      ...pool,
      balance: 232,
      updatedAt: timestamp,
    });
    expect(result.entry).toEqual({
      id: "expense-entry-1",
      amount: 68,
      note: "早餐和交通",
      spentAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });

  it("rejects invalid charge amounts without changing the pool", () => {
    const pool = dailyExpensePool({ balance: 300 });

    expect(
      applyDailyExpenseCharge({
        pool,
        amount: 0,
        note: "早餐",
        now,
        createId: () => "expense-entry-1",
      }),
    ).toEqual({ status: "invalid-amount", pool });

    expect(
      applyDailyExpenseCharge({
        pool,
        amount: -5,
        note: "早餐",
        now,
        createId: () => "expense-entry-1",
      }),
    ).toEqual({ status: "invalid-amount", pool });
  });

  it("rejects blank notes and amounts above pool balance", () => {
    const pool = dailyExpensePool({ balance: 30 });

    expect(
      applyDailyExpenseCharge({
        pool,
        amount: 20,
        note: "   ",
        now,
        createId: () => "expense-entry-1",
      }),
    ).toEqual({ status: "invalid-note", pool });

    expect(
      applyDailyExpenseCharge({
        pool,
        amount: 40,
        note: "早餐",
        now,
        createId: () => "expense-entry-1",
      }),
    ).toEqual({ status: "insufficient-pool-balance", pool });
  });
});

describe("applyDailyExpenseEntryDeletion", () => {
  it("adds the deleted entry amount back into the pool without touching wallets", () => {
    const pool = dailyExpensePool({ balance: 120 });
    const entry = dailyExpenseEntry({ amount: 80 });

    const result = applyDailyExpenseEntryDeletion({
      pool,
      entry,
      now,
    });

    expect(result).toEqual({
      pool: {
        ...pool,
        balance: 200,
        updatedAt: timestamp,
      },
      deletedEntryId: "expense-1",
    });
  });
});
