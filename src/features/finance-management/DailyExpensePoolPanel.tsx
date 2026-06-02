"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { Button, Panel } from "@/features/retro-ui";
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
import { formatMoneyAmount } from "./insights";
import styles from "./finance-management.module.css";

export type DailyExpensePoolPanelProps = {
  pool: DailyExpensePool | null;
  entries: DailyExpenseEntry[];
  walletContainers: WalletContainer[];
  onSavePool: (pool: DailyExpensePool) => Promise<void> | void;
  onSaveEntry: (entry: DailyExpenseEntry) => Promise<void> | void;
  onDeleteEntry: (entryId: string) => Promise<void> | void;
  onSaveWalletContainer: (container: WalletContainer) => Promise<void> | void;
  now?: () => Date;
  createEntryId?: () => string;
};

export function DailyExpensePoolPanel({
  pool,
  entries,
  walletContainers,
  onSavePool,
  onSaveEntry,
  onDeleteEntry,
  onSaveWalletContainer,
  now = () => new Date(),
  createEntryId = createDefaultEntryId,
}: DailyExpensePoolPanelProps) {
  const initialPool = useMemo(
    () => pool ?? createEmptyPool(walletContainers[0]?.id, now()),
    [pool, walletContainers, now],
  );
  const [localPool, setLocalPool] = useState<DailyExpensePool>(initialPool);
  const [localEntries, setLocalEntries] = useState<DailyExpenseEntry[]>(entries);
  const [transferAmount, setTransferAmount] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeNote, setChargeNote] = useState("");

  const transferSourceStatus = getDailyExpenseTransferSourceStatus({
    pool: localPool,
    walletContainers,
  });
  const selectedSourceContainer = walletContainers.find(
    (container) => container.id === localPool.selectedWalletContainerId,
  );
  const parsedTransferAmount = Number.parseFloat(transferAmount);
  const parsedChargeAmount = Number.parseFloat(chargeAmount);
  const canTransfer =
    transferSourceStatus === "available" &&
    Number.isFinite(parsedTransferAmount) &&
    parsedTransferAmount > 0 &&
    selectedSourceContainer !== undefined &&
    selectedSourceContainer.balance >= parsedTransferAmount;
  const canCharge =
    Number.isFinite(parsedChargeAmount) &&
    parsedChargeAmount > 0 &&
    parsedChargeAmount <= localPool.balance &&
    chargeNote.trim().length > 0;

  async function handleSourceChange(sourceContainerId: string) {
    const updatedPool: DailyExpensePool = {
      ...localPool,
      selectedWalletContainerId: sourceContainerId || undefined,
      updatedAt: formatLocalDateTime(now()),
    };

    await onSavePool(updatedPool);
    setLocalPool(updatedPool);
  }

  async function handleTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = applyDailyExpenseTransfer({
      pool: localPool,
      walletContainers,
      amount: parsedTransferAmount,
      now,
    });

    if (result.status !== "transferred") {
      return;
    }

    await onSaveWalletContainer(result.updatedSourceContainer);
    await onSavePool(result.pool);
    setLocalPool(result.pool);
    setTransferAmount("");
  }

  async function handleCharge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = applyDailyExpenseCharge({
      pool: localPool,
      amount: parsedChargeAmount,
      note: chargeNote,
      now,
      createId: createEntryId,
    });

    if (result.status !== "charged") {
      return;
    }

    await onSavePool(result.pool);
    await onSaveEntry(result.entry);
    setLocalPool(result.pool);
    setLocalEntries((current) => [...current, result.entry]);
    setChargeAmount("");
    setChargeNote("");
  }

  async function handleDeleteEntry(entry: DailyExpenseEntry) {
    const result = applyDailyExpenseEntryDeletion({
      pool: localPool,
      entry,
      now,
    });

    await onSavePool(result.pool);
    await onDeleteEntry(result.deletedEntryId);
    setLocalPool(result.pool);
    setLocalEntries((current) =>
      current.filter((candidate) => candidate.id !== result.deletedEntryId),
    );
  }

  return (
    <Panel title="日常开销池">
      <div className={styles.dailyExpenseStack}>
        <section
          aria-label="信息面板"
          className={styles.dailyExpenseSection}
        >
          <div className={styles.editorHeader}>
            <strong>信息面板</strong>
            <span className={styles.balanceText}>
              当前余额 {formatMoneyAmount(localPool.balance)}
            </span>
          </div>
          <div className={styles.dailyExpenseSummaryGrid}>
            <span>最近划入{formatOptionalMoney(localPool.lastTransferAmount)}</span>
            <span>划款日期{formatOptionalDate(localPool.lastTransferAt)}</span>
            <span>
              最近来源
              {localPool.lastTransferWalletContainerNameSnapshot ?? "暂无"}
            </span>
          </div>

          {walletContainers.length === 0 ? (
            <p className={styles.stateNote}>
              请先创建钱包容器，再从钱包划入开销池。
            </p>
          ) : null}

          {transferSourceStatus === "missing" ? (
            <p className={styles.stateNote}>需要重新选择划款来源容器。</p>
          ) : null}

          <form className={styles.inlineEditor} onSubmit={handleTransfer}>
            <label>
              当前划款来源容器
              <select
                disabled={walletContainers.length === 0}
                onChange={(event) => handleSourceChange(event.target.value)}
                value={localPool.selectedWalletContainerId ?? ""}
              >
                <option value="">选择钱包容器</option>
                {walletContainers.map((container) => (
                  <option key={container.id} value={container.id}>
                    {container.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              划入金额
              <input
                inputMode="decimal"
                min="0.01"
                onChange={(event) => setTransferAmount(event.target.value)}
                step="0.01"
                type="number"
                value={transferAmount}
              />
            </label>
            <Button disabled={!canTransfer} type="submit" variant="primary">
              划入开销池
            </Button>
          </form>
        </section>

        <section aria-label="消费结算" className={styles.dailyExpenseSection}>
          <div className={styles.editorHeader}>
            <strong>消费结算</strong>
          </div>
          <form className={styles.inlineEditor} onSubmit={handleCharge}>
            <label>
              消费金额
              <input
                inputMode="decimal"
                min="0.01"
                onChange={(event) => setChargeAmount(event.target.value)}
                required
                step="0.01"
                type="number"
                value={chargeAmount}
              />
            </label>
            <label>
              消费备注
              <input
                onChange={(event) => setChargeNote(event.target.value)}
                required
                type="text"
                value={chargeNote}
              />
            </label>
            <Button disabled={!canCharge} type="submit" variant="primary">
              立即扣款
            </Button>
          </form>
        </section>

        <section aria-label="消费流水" className={styles.dailyExpenseSection}>
          <div className={styles.editorHeader}>
            <strong>消费流水</strong>
          </div>
          <ul className={styles.dailyExpenseEntryList}>
            {localEntries.length > 0 ? (
              localEntries.map((entry) => (
                <li className={styles.incomeSourceCard} key={entry.id}>
                  <div className={styles.incomeSourceHeader}>
                    <div>
                      <strong>-{formatMoneyAmount(entry.amount)}</strong>
                      <p>{entry.note}</p>
                      <p>{formatDateTime(entry.spentAt)}</p>
                    </div>
                  </div>
                  <div className={styles.containerActions}>
                    <Button
                      aria-label={`删除消费流水${entry.note}`}
                      onClick={() => handleDeleteEntry(entry)}
                      size="sm"
                      variant="danger"
                    >
                      删除
                    </Button>
                  </div>
                </li>
              ))
            ) : (
              <li className={styles.emptyContainer}>还没有消费流水。</li>
            )}
          </ul>
        </section>
      </div>
    </Panel>
  );
}

function createEmptyPool(
  selectedWalletContainerId: string | undefined,
  date: Date,
): DailyExpensePool {
  const timestamp = formatLocalDateTime(date);

  return {
    id: "default",
    balance: 0,
    ...(selectedWalletContainerId ? { selectedWalletContainerId } : {}),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createDefaultEntryId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `daily-expense-entry-${Date.now()}`;
}

function formatOptionalMoney(value: number | undefined): string {
  return typeof value === "number" ? formatMoneyAmount(value) : "暂无";
}

function formatOptionalDate(value: string | undefined): string {
  return value ? formatDateTime(value) : "暂无";
}

function formatDateTime(value: string): string {
  return value.slice(0, 10);
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
