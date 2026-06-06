import type {
  DailyExpenseEntry,
  DailyExpensePool,
  MoneyInflowSource,
  WalletContainer,
  WealthFlowEvent,
  WealthFlowSubjectSnapshot,
} from "@/types/lifeos";

const DAILY_EXPENSE_POOL_NAME = "日常开销池";

type EventFactoryOptions = {
  now?: () => Date;
  createId?: () => string;
};

export type CreateIncomeReceivedEventInput = EventFactoryOptions & {
  source: MoneyInflowSource;
  targetWalletContainer: WalletContainer;
  amount: number;
};

export function createIncomeReceivedEvent({
  source,
  targetWalletContainer,
  amount,
  now = () => new Date(),
  createId = () => crypto.randomUUID(),
}: CreateIncomeReceivedEventInput): WealthFlowEvent {
  assertPositiveAmount(amount);
  const timestamp = formatLocalDateTime(now());

  return {
    id: createId(),
    type: "income_received",
    direction: "in",
    amount,
    occurredAt: timestamp,
    source: subjectSnapshot("income_source", source.id, source.name),
    target: subjectSnapshot(
      "wallet_container",
      targetWalletContainer.id,
      targetWalletContainer.name,
    ),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export type CreateDailyExpenseTransferEventInput = EventFactoryOptions & {
  sourceWalletContainer: WalletContainer;
  targetDailyExpensePool: DailyExpensePool;
  targetDailyExpensePoolName?: string;
  amount: number;
};

export function createDailyExpenseTransferEvent({
  sourceWalletContainer,
  targetDailyExpensePool,
  targetDailyExpensePoolName = DAILY_EXPENSE_POOL_NAME,
  amount,
  now = () => new Date(),
  createId = () => crypto.randomUUID(),
}: CreateDailyExpenseTransferEventInput): WealthFlowEvent {
  assertPositiveAmount(amount);
  const timestamp = formatLocalDateTime(now());

  return {
    id: createId(),
    type: "daily_expense_transfer",
    direction: "transfer",
    amount,
    occurredAt: timestamp,
    source: subjectSnapshot(
      "wallet_container",
      sourceWalletContainer.id,
      sourceWalletContainer.name,
    ),
    target: subjectSnapshot(
      "daily_expense_pool",
      targetDailyExpensePool.id,
      targetDailyExpensePoolName,
    ),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export type CreateDailyExpenseSpentEventInput = EventFactoryOptions & {
  sourceDailyExpensePool: DailyExpensePool;
  sourceDailyExpensePoolName?: string;
  dailyExpenseEntry: DailyExpenseEntry;
};

export function createDailyExpenseSpentEvent({
  sourceDailyExpensePool,
  sourceDailyExpensePoolName = DAILY_EXPENSE_POOL_NAME,
  dailyExpenseEntry,
  now = () => new Date(),
  createId = () => crypto.randomUUID(),
}: CreateDailyExpenseSpentEventInput): WealthFlowEvent {
  assertPositiveAmount(dailyExpenseEntry.amount);
  const timestamp = formatLocalDateTime(now());

  return {
    id: createId(),
    type: "daily_expense_spent",
    direction: "out",
    amount: dailyExpenseEntry.amount,
    occurredAt: timestamp,
    source: subjectSnapshot(
      "daily_expense_pool",
      sourceDailyExpensePool.id,
      sourceDailyExpensePoolName,
    ),
    relatedDailyExpenseEntryId: dailyExpenseEntry.id,
    note: dailyExpenseEntry.note.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export type CreateDailyExpenseRefundEventInput = EventFactoryOptions & {
  targetDailyExpensePool: DailyExpensePool;
  targetDailyExpensePoolName?: string;
  amount: number;
  relatedEventId?: string;
  relatedDailyExpenseEntryId?: string;
};

export function createDailyExpenseRefundEvent({
  targetDailyExpensePool,
  targetDailyExpensePoolName = DAILY_EXPENSE_POOL_NAME,
  amount,
  relatedEventId,
  relatedDailyExpenseEntryId,
  now = () => new Date(),
  createId = () => crypto.randomUUID(),
}: CreateDailyExpenseRefundEventInput): WealthFlowEvent {
  assertPositiveAmount(amount);
  if (!relatedEventId && !relatedDailyExpenseEntryId) {
    throw new Error(
      "Daily expense refund events must reference the original event or expense entry.",
    );
  }

  const timestamp = formatLocalDateTime(now());

  return {
    id: createId(),
    type: "daily_expense_refund",
    direction: "in",
    amount,
    occurredAt: timestamp,
    target: subjectSnapshot(
      "daily_expense_pool",
      targetDailyExpensePool.id,
      targetDailyExpensePoolName,
    ),
    relatedEventId,
    relatedDailyExpenseEntryId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function assertPositiveAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new RangeError("Wealth flow event amount must be a positive number.");
  }
}

function subjectSnapshot(
  type: WealthFlowSubjectSnapshot["type"],
  id: string | undefined,
  nameSnapshot: string,
): WealthFlowSubjectSnapshot {
  return {
    type,
    id,
    nameSnapshot,
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
