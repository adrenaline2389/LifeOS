import { describe, expect, it } from "vitest";
import type { WalletContainer } from "@/types/lifeos";

import { buildWalletSummary, formatMoneyAmount } from "./insights";

const walletContainer = (
  overrides: Partial<WalletContainer> = {},
): WalletContainer => ({
  id: "wallet-1",
  name: "中国银行卡",
  balance: 1000,
  color: "#2f9be7",
  createdAt: "2026-05-27T08:00:00.000Z",
  updatedAt: "2026-05-27T08:00:00.000Z",
  ...overrides,
});

describe("wallet insights", () => {
  it("builds a positive wallet distribution from positive containers", () => {
    const summary = buildWalletSummary([
      walletContainer({ id: "bank", name: "银行卡", balance: 300, color: "#2f9be7" }),
      walletContainer({ id: "fund", name: "学习基金", balance: 700, color: "#68bf8d" }),
    ]);

    expect(summary).toEqual({
      totalBalance: 1000,
      status: "positive",
      distributionItems: [
        {
          containerId: "bank",
          name: "银行卡",
          balance: 300,
          color: "#2f9be7",
          percentage: 30,
        },
        {
          containerId: "fund",
          name: "学习基金",
          balance: 700,
          color: "#68bf8d",
          percentage: 70,
        },
      ],
    });
  });

  it("uses only positive containers for distribution when the total is positive", () => {
    const summary = buildWalletSummary([
      walletContainer({ id: "bank", name: "银行卡", balance: 500, color: "#2f9be7" }),
      walletContainer({ id: "cash", name: "现金", balance: 0, color: "#f1c84b" }),
      walletContainer({ id: "card", name: "信用卡", balance: -100, color: "#8f7ac8" }),
    ]);

    expect(summary.totalBalance).toBe(400);
    expect(summary.status).toBe("positive");
    expect(summary.distributionItems).toEqual([
      {
        containerId: "bank",
        name: "银行卡",
        balance: 500,
        color: "#2f9be7",
        percentage: 100,
      },
    ]);
  });

  it("does not build distribution items when the total balance is zero", () => {
    const summary = buildWalletSummary([
      walletContainer({ id: "bank", balance: 100 }),
      walletContainer({ id: "card", balance: -100 }),
    ]);

    expect(summary.totalBalance).toBe(0);
    expect(summary.status).toBe("zero");
    expect(summary.distributionItems).toEqual([]);
  });

  it("does not build distribution items when the total balance is negative", () => {
    const summary = buildWalletSummary([
      walletContainer({ id: "bank", balance: 100 }),
      walletContainer({ id: "card", balance: -250 }),
    ]);

    expect(summary.totalBalance).toBe(-150);
    expect(summary.status).toBe("negative");
    expect(summary.distributionItems).toEqual([]);
  });

  it("treats an empty wallet as a zero balance snapshot", () => {
    expect(buildWalletSummary([])).toEqual({
      totalBalance: 0,
      status: "zero",
      distributionItems: [],
    });
  });

  it("formats money amounts without changing the original numeric value", () => {
    const value = -33177.5;

    expect(formatMoneyAmount(value)).toBe("-33,177.5");
    expect(value).toBe(-33177.5);
  });
});
