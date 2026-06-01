import type { MoneyInflowSource, WalletContainer } from "@/types/lifeos";

import { buildWalletSummary, type WalletSummary } from "./insights";

export type MoneyInflowManualDepositResult =
  | {
      status: "deposited";
      depositedAmount: number;
      walletContainers: WalletContainer[];
      walletSummary: WalletSummary;
      updatedContainer: WalletContainer;
    }
  | {
      status: "missing-target";
      walletContainers: WalletContainer[];
      walletSummary: WalletSummary;
    }
  | {
      status: "invalid-amount";
      walletContainers: WalletContainer[];
      walletSummary: WalletSummary;
    };

export type MoneyInflowManualDepositInput = {
  source: MoneyInflowSource;
  walletContainers: WalletContainer[];
  variableAmount?: number;
  now?: () => Date;
};

export function applyMoneyInflowManualDeposit({
  source,
  walletContainers,
  variableAmount,
  now = () => new Date(),
}: MoneyInflowManualDepositInput): MoneyInflowManualDepositResult {
  const amount =
    source.amountPattern.kind === "fixed"
      ? source.amountPattern.amount
      : variableAmount;

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return {
      status: "invalid-amount",
      walletContainers,
      walletSummary: buildWalletSummary(walletContainers),
    };
  }

  const targetContainer = walletContainers.find(
    (container) => container.id === source.targetWalletContainerId,
  );

  if (!targetContainer) {
    return {
      status: "missing-target",
      walletContainers,
      walletSummary: buildWalletSummary(walletContainers),
    };
  }

  const updatedContainer: WalletContainer = {
    ...targetContainer,
    balance: targetContainer.balance + amount,
    updatedAt: formatLocalDateTime(now()),
  };
  const updatedWalletContainers = walletContainers.map((container) =>
    container.id === updatedContainer.id ? updatedContainer : container,
  );

  return {
    status: "deposited",
    depositedAmount: amount,
    walletContainers: updatedWalletContainers,
    walletSummary: buildWalletSummary(updatedWalletContainers),
    updatedContainer,
  };
}

function formatLocalDateTime(date: Date): string {
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${date
      .getMilliseconds()
      .toString()
      .padStart(3, "0")}`,
  ].join("T");
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}
