import type {
  DailyExpenseEntry,
  DailyExpensePool,
  DailyExpenseTransferSourceStatus,
  WalletContainer,
} from "@/types/lifeos";

import { buildWalletSummary, type WalletSummary } from "./insights";

export type DailyExpenseTransferSourceStatusInput = {
  pool: DailyExpensePool;
  walletContainers: WalletContainer[];
};

export function getDailyExpenseTransferSourceStatus({
  pool,
  walletContainers,
}: DailyExpenseTransferSourceStatusInput): DailyExpenseTransferSourceStatus {
  if (!pool.selectedWalletContainerId) {
    return "unselected";
  }

  return walletContainers.some(
    (container) => container.id === pool.selectedWalletContainerId,
  )
    ? "available"
    : "missing";
}

export type DailyExpenseTransferResult =
  | {
      status: "transferred";
      transferredAmount: number;
      pool: DailyExpensePool;
      walletContainers: WalletContainer[];
      walletSummary: WalletSummary;
      updatedSourceContainer: WalletContainer;
    }
  | {
      status:
        | "invalid-amount"
        | "unselected-source"
        | "missing-source"
        | "insufficient-wallet-balance";
      pool: DailyExpensePool;
      walletContainers: WalletContainer[];
      walletSummary: WalletSummary;
    };

export type DailyExpenseTransferInput = {
  pool: DailyExpensePool;
  walletContainers: WalletContainer[];
  amount: number;
  now?: () => Date;
};

export function applyDailyExpenseTransfer({
  pool,
  walletContainers,
  amount,
  now = () => new Date(),
}: DailyExpenseTransferInput): DailyExpenseTransferResult {
  const walletSummary = buildWalletSummary(walletContainers);

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      status: "invalid-amount",
      pool,
      walletContainers,
      walletSummary,
    };
  }

  if (!pool.selectedWalletContainerId) {
    return {
      status: "unselected-source",
      pool,
      walletContainers,
      walletSummary,
    };
  }

  const sourceContainer = walletContainers.find(
    (container) => container.id === pool.selectedWalletContainerId,
  );

  if (!sourceContainer) {
    return {
      status: "missing-source",
      pool,
      walletContainers,
      walletSummary,
    };
  }

  if (sourceContainer.balance < amount) {
    return {
      status: "insufficient-wallet-balance",
      pool,
      walletContainers,
      walletSummary,
    };
  }

  const timestamp = formatLocalDateTime(now());
  const updatedSourceContainer: WalletContainer = {
    ...sourceContainer,
    balance: sourceContainer.balance - amount,
    updatedAt: timestamp,
  };
  const updatedWalletContainers = walletContainers.map((container) =>
    container.id === updatedSourceContainer.id
      ? updatedSourceContainer
      : container,
  );
  const updatedPool: DailyExpensePool = {
    ...pool,
    balance: pool.balance + amount,
    lastTransferAmount: amount,
    lastTransferAt: timestamp,
    lastTransferWalletContainerId: sourceContainer.id,
    lastTransferWalletContainerNameSnapshot: sourceContainer.name,
    updatedAt: timestamp,
  };

  return {
    status: "transferred",
    transferredAmount: amount,
    pool: updatedPool,
    walletContainers: updatedWalletContainers,
    walletSummary: buildWalletSummary(updatedWalletContainers),
    updatedSourceContainer,
  };
}

export type DailyExpenseChargeResult =
  | {
      status: "charged";
      chargedAmount: number;
      pool: DailyExpensePool;
      entry: DailyExpenseEntry;
    }
  | {
      status: "invalid-amount" | "invalid-note" | "insufficient-pool-balance";
      pool: DailyExpensePool;
    };

export type DailyExpenseChargeInput = {
  pool: DailyExpensePool;
  amount: number;
  note: string;
  now?: () => Date;
  createId?: () => string;
};

export function applyDailyExpenseCharge({
  pool,
  amount,
  note,
  now = () => new Date(),
  createId = () => crypto.randomUUID(),
}: DailyExpenseChargeInput): DailyExpenseChargeResult {
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      status: "invalid-amount",
      pool,
    };
  }

  const trimmedNote = note.trim();

  if (!trimmedNote) {
    return {
      status: "invalid-note",
      pool,
    };
  }

  if (pool.balance < amount) {
    return {
      status: "insufficient-pool-balance",
      pool,
    };
  }

  const timestamp = formatLocalDateTime(now());
  const updatedPool: DailyExpensePool = {
    ...pool,
    balance: pool.balance - amount,
    updatedAt: timestamp,
  };
  const entry: DailyExpenseEntry = {
    id: createId(),
    amount,
    note: trimmedNote,
    spentAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return {
    status: "charged",
    chargedAmount: amount,
    pool: updatedPool,
    entry,
  };
}

export type DailyExpenseEntryDeletionInput = {
  pool: DailyExpensePool;
  entry: DailyExpenseEntry;
  now?: () => Date;
};

export type DailyExpenseEntryDeletionResult = {
  pool: DailyExpensePool;
  deletedEntryId: string;
};

export function applyDailyExpenseEntryDeletion({
  pool,
  entry,
  now = () => new Date(),
}: DailyExpenseEntryDeletionInput): DailyExpenseEntryDeletionResult {
  return {
    pool: {
      ...pool,
      balance: pool.balance + entry.amount,
      updatedAt: formatLocalDateTime(now()),
    },
    deletedEntryId: entry.id,
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
