import type { WalletContainer } from "@/types/lifeos";

export type WalletSummaryStatus = "positive" | "zero" | "negative";

export type WalletDistributionItem = {
  containerId: string;
  name: string;
  balance: number;
  color: string;
  percentage: number;
};

export type WalletSummary = {
  totalBalance: number;
  status: WalletSummaryStatus;
  distributionItems: WalletDistributionItem[];
};

export function buildWalletSummary(
  containers: WalletContainer[],
): WalletSummary {
  const totalBalance = containers.reduce(
    (total, container) => total + container.balance,
    0,
  );
  const status = walletStatusForTotal(totalBalance);

  return {
    totalBalance,
    status,
    distributionItems:
      status === "positive" ? buildDistributionItems(containers) : [],
  };
}

export function formatMoneyAmount(value: number): string {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 2,
  }).format(value);
}

function walletStatusForTotal(totalBalance: number): WalletSummaryStatus {
  if (totalBalance > 0) return "positive";
  if (totalBalance < 0) return "negative";
  return "zero";
}

function buildDistributionItems(
  containers: WalletContainer[],
): WalletDistributionItem[] {
  const positiveContainers = containers.filter((container) => container.balance > 0);
  const positiveTotal = positiveContainers.reduce(
    (total, container) => total + container.balance,
    0,
  );

  if (positiveTotal <= 0) {
    return [];
  }

  return positiveContainers.map((container) => ({
    containerId: container.id,
    name: container.name,
    balance: container.balance,
    color: container.color,
    percentage: (container.balance / positiveTotal) * 100,
  }));
}
