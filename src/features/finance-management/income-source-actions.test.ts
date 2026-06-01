import { describe, expect, it } from "vitest";

import type { MoneyInflowSource, WalletContainer } from "@/types/lifeos";

import { applyMoneyInflowManualDeposit } from "./income-source-actions";

const timestamp = "2026-06-01T10:30:00.000";
const now = () => new Date(timestamp);

const walletContainer = (
  overrides: Partial<WalletContainer> = {},
): WalletContainer => ({
  id: "wallet-1",
  name: "日常账户",
  balance: 100,
  color: "#2f9be7",
  createdAt: "2026-05-30T08:00:00.000",
  updatedAt: "2026-05-30T08:00:00.000",
  ...overrides,
});

const moneyInflowSource = (
  overrides: Partial<MoneyInflowSource> = {},
): MoneyInflowSource => ({
  id: "source-1",
  name: "项目款",
  amountPattern: {
    kind: "fixed",
    amount: 300,
  },
  frequencyPattern: {
    kind: "variable",
  },
  targetWalletContainerId: "wallet-1",
  createdAt: "2026-05-31T08:00:00.000",
  updatedAt: "2026-05-31T08:00:00.000",
  ...overrides,
});

describe("applyMoneyInflowManualDeposit", () => {
  it("deposits the fixed amount into the target wallet and refreshes summary", () => {
    const result = applyMoneyInflowManualDeposit({
      source: moneyInflowSource({
        amountPattern: { kind: "fixed", amount: 300 },
      }),
      walletContainers: [
        walletContainer({ id: "wallet-1", balance: 100 }),
        walletContainer({ id: "wallet-2", name: "储蓄", balance: 50 }),
      ],
      now,
    });

    expect(result.status).toBe("deposited");
    if (result.status !== "deposited") {
      throw new Error("Expected fixed amount source to deposit");
    }
    expect(result.walletContainers).toEqual([
      {
        ...walletContainer({ id: "wallet-1", balance: 100 }),
        balance: 400,
        updatedAt: timestamp,
      },
      walletContainer({ id: "wallet-2", name: "储蓄", balance: 50 }),
    ]);
    expect(result.walletSummary.totalBalance).toBe(450);
    expect(result.walletSummary.distributionItems).toEqual([
      expect.objectContaining({
        containerId: "wallet-1",
        balance: 400,
        percentage: expect.closeTo(88.889, 3),
      }),
      expect.objectContaining({
        containerId: "wallet-2",
        balance: 50,
        percentage: expect.closeTo(11.111, 3),
      }),
    ]);
  });

  it("deposits a positive variable amount into the target wallet", () => {
    const result = applyMoneyInflowManualDeposit({
      source: moneyInflowSource({
        amountPattern: { kind: "variable" },
      }),
      variableAmount: 125.5,
      walletContainers: [walletContainer({ balance: 20 })],
      now,
    });

    expect(result.status).toBe("deposited");
    if (result.status !== "deposited") {
      throw new Error("Expected variable amount source to deposit");
    }
    expect(result.depositedAmount).toBe(125.5);
    expect(result.walletContainers[0]).toEqual({
      ...walletContainer({ balance: 20 }),
      balance: 145.5,
      updatedAt: timestamp,
    });
    expect(result.walletSummary.totalBalance).toBe(145.5);
  });

  it("rejects zero and negative variable amounts without changing wallets", () => {
    const walletContainers = [walletContainer({ balance: 20 })];

    expect(
      applyMoneyInflowManualDeposit({
        source: moneyInflowSource({ amountPattern: { kind: "variable" } }),
        variableAmount: 0,
        walletContainers,
        now,
      }),
    ).toEqual({
      status: "invalid-amount",
      walletContainers,
      walletSummary: expect.objectContaining({ totalBalance: 20 }),
    });

    expect(
      applyMoneyInflowManualDeposit({
        source: moneyInflowSource({ amountPattern: { kind: "variable" } }),
        variableAmount: -10,
        walletContainers,
        now,
      }),
    ).toEqual({
      status: "invalid-amount",
      walletContainers,
      walletSummary: expect.objectContaining({ totalBalance: 20 }),
    });
  });

  it("does not update any wallet when the target container is missing", () => {
    const walletContainers = [walletContainer({ id: "wallet-other", balance: 20 })];

    const result = applyMoneyInflowManualDeposit({
      source: moneyInflowSource({ targetWalletContainerId: "missing-wallet" }),
      walletContainers,
      now,
    });

    expect(result).toEqual({
      status: "missing-target",
      walletContainers,
      walletSummary: expect.objectContaining({ totalBalance: 20 }),
    });
  });
});
