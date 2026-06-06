"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { Button, Panel, StatusLabel, WindowFrame } from "@/features/retro-ui";
import type {
  DailyExpenseEntry,
  DailyExpensePool,
  MoneyInflowSource,
  WalletContainer,
  WealthFlowEvent,
} from "@/types/lifeos";

import { applyDailyExpenseEntryDeletion } from "./daily-expense-actions";
import {
  buildWalletSummary,
  formatMoneyAmount,
  type WalletSummary,
} from "./insights";
import { applyMoneyInflowManualDeposit } from "./income-source-actions";
import { DailyExpensePoolPanel } from "./DailyExpensePoolPanel";
import { IncomeSourcePanel } from "./IncomeSourcePanel";
import { WealthFlowLogPanel } from "./WealthFlowLogPanel";
import styles from "./finance-management.module.css";
import {
  createDailyExpenseRefundEvent,
  createDailyExpenseSpentEvent,
  createDailyExpenseTransferEvent,
  createIncomeReceivedEvent,
} from "./wealth-flow-events";

export type FinanceManagementPanelProps = {
  containers: WalletContainer[];
  onSaveContainer: (container: WalletContainer) => Promise<void> | void;
  onDeleteContainer: (containerId: string) => Promise<void> | void;
  incomeSources?: MoneyInflowSource[];
  onSaveIncomeSource?: (source: MoneyInflowSource) => Promise<void> | void;
  onDeleteIncomeSource?: (sourceId: string) => Promise<void> | void;
  dailyExpensePool?: DailyExpensePool | null;
  dailyExpenseEntries?: DailyExpenseEntry[];
  wealthFlowEvents?: WealthFlowEvent[];
  onSaveDailyExpensePool?: (pool: DailyExpensePool) => Promise<void> | void;
  onSaveDailyExpenseEntry?: (entry: DailyExpenseEntry) => Promise<void> | void;
  onDeleteDailyExpenseEntry?: (entryId: string) => Promise<void> | void;
  onSaveWealthFlowEvent?: (event: WealthFlowEvent) => Promise<void> | void;
  onBack: () => void;
  now?: () => Date;
  createContainerId?: () => string;
  createIncomeSourceId?: () => string;
  createDailyExpenseEntryId?: () => string;
  createWealthFlowEventId?: () => string;
};

type WalletFormState = {
  id: string | null;
  name: string;
  balance: string;
  color: string;
  note: string;
  createdAt: string | null;
};

const CONTAINER_COLORS = [
  { value: "#2f9be7", label: "湖蓝" },
  { value: "#68bf8d", label: "苔绿" },
  { value: "#f1c84b", label: "暖黄" },
  { value: "#d96c62", label: "砖红" },
  { value: "#8f7ac8", label: "紫灰" },
];

const FUTURE_STRUCTURES = ["金鹅账户", "梦想账户"];

const EMPTY_FORM: WalletFormState = {
  id: null,
  name: "",
  balance: "0",
  color: CONTAINER_COLORS[0].value,
  note: "",
  createdAt: null,
};

export function FinanceManagementPanel({
  containers,
  onSaveContainer,
  onDeleteContainer,
  incomeSources = [],
  onSaveIncomeSource = noopSaveIncomeSource,
  onDeleteIncomeSource = noopDeleteIncomeSource,
  dailyExpensePool = null,
  dailyExpenseEntries = [],
  wealthFlowEvents = [],
  onSaveDailyExpensePool = noopSaveDailyExpensePool,
  onSaveDailyExpenseEntry = noopSaveDailyExpenseEntry,
  onDeleteDailyExpenseEntry = noopDeleteDailyExpenseEntry,
  onSaveWealthFlowEvent = noopSaveWealthFlowEvent,
  onBack,
  now = () => new Date(),
  createContainerId = createDefaultContainerId,
  createIncomeSourceId,
  createDailyExpenseEntryId,
  createWealthFlowEventId,
}: FinanceManagementPanelProps) {
  const [savedContainers, setSavedContainers] = useState<WalletContainer[]>([]);
  const [deletedContainerIds, setDeletedContainerIds] = useState<string[]>([]);
  const [formState, setFormState] = useState<WalletFormState | null>(null);

  const localContainers = useMemo(
    () => [
      ...containers.filter(
        (container) =>
          !deletedContainerIds.includes(container.id) &&
          !savedContainers.some((savedContainer) => savedContainer.id === container.id),
      ),
      ...savedContainers,
    ],
    [containers, deletedContainerIds, savedContainers],
  );
  const walletSummary = useMemo(
    () => buildWalletSummary(localContainers),
    [localContainers],
  );

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState) {
      return;
    }

    const timestamp = formatLocalDateTime(now());
    const trimmedName = formState.name.trim();
    const note = formState.note.trim();
    const container: WalletContainer = {
      id: formState.id ?? createContainerId(),
      name: trimmedName,
      balance: Number.parseFloat(formState.balance),
      color: formState.color,
      ...(note ? { note } : {}),
      createdAt: formState.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    await persistWalletContainer(container);
    setFormState(null);
  }

  async function handleDelete(container: WalletContainer) {
    await onDeleteContainer(container.id);
    setDeletedContainerIds((current) =>
      current.includes(container.id) ? current : [...current, container.id],
    );
    setSavedContainers((current) =>
      current.filter((candidate) => candidate.id !== container.id),
    );
    setFormState((current) =>
      current?.id === container.id ? null : current,
    );
  }

  async function handleDepositIncomeSource(
    source: MoneyInflowSource,
    variableAmount?: number,
  ) {
    const result = applyMoneyInflowManualDeposit({
      source,
      walletContainers: localContainers,
      variableAmount,
      now,
    });

    if (result.status !== "deposited") {
      return;
    }

    await persistWalletContainer(result.updatedContainer);
    await onSaveWealthFlowEvent(
      createIncomeReceivedEvent({
        source,
        targetWalletContainer: result.updatedContainer,
        amount: result.depositedAmount,
        now,
        ...(createWealthFlowEventId
          ? { createId: createWealthFlowEventId }
          : {}),
      }),
    );
  }

  async function persistWalletContainer(container: WalletContainer) {
    await onSaveContainer(container);
    setDeletedContainerIds((current) =>
      current.filter((containerId) => containerId !== container.id),
    );
    setSavedContainers((current) => [
      ...current.filter((candidate) => candidate.id !== container.id),
      container,
    ]);
  }

  async function handleRefundExpenseEvent(event: WealthFlowEvent) {
    if (
      event.type !== "daily_expense_spent" ||
      !event.relatedDailyExpenseEntryId ||
      !dailyExpensePool
    ) {
      return;
    }

    const entry = dailyExpenseEntries.find(
      (candidate) => candidate.id === event.relatedDailyExpenseEntryId,
    );

    if (!entry) {
      return;
    }

    const result = applyDailyExpenseEntryDeletion({
      pool: dailyExpensePool,
      entry,
      now,
    });

    await onSaveDailyExpensePool(result.pool);
    await onDeleteDailyExpenseEntry(result.deletedEntryId);
    await onSaveWealthFlowEvent(
      createDailyExpenseRefundEvent({
        targetDailyExpensePool: result.pool,
        amount: entry.amount,
        relatedEventId: event.id,
        relatedDailyExpenseEntryId: entry.id,
        now,
        ...(createWealthFlowEventId
          ? { createId: createWealthFlowEventId }
          : {}),
      }),
    );
  }

  return (
    <WindowFrame
      actions={
        <Button onClick={onBack} size="sm" variant="quiet">
          返回启动面板
        </Button>
      }
      statusBar="钱包容器只保存在这台设备上。"
      title="财务管理系统"
    >
      <div className={styles.layout}>
        <header className={styles.header}>
          <p>资源、消费和自由度</p>
        </header>

        <Panel title="我的钱包">
          <div className={styles.walletIntro}>
            <p>这是你手动记录的本地余额快照。</p>
            <Button onClick={() => setFormState(EMPTY_FORM)} size="sm">
              新建资金容器
            </Button>
          </div>

          <div className={styles.walletGrid}>
            <WalletDonut summary={walletSummary} />
            <WalletLegend
              containers={localContainers}
              onDeleteContainer={handleDelete}
              onEditContainer={(container) =>
                setFormState(containerToFormState(container))
              }
              summary={walletSummary}
            />
          </div>

          {formState ? (
            <form className={styles.editor} onSubmit={handleSave}>
              <div className={styles.editorHeader}>
                <strong>{formState.id ? "编辑资金容器" : "新建资金容器"}</strong>
                <Button
                  onClick={() => setFormState(null)}
                  size="sm"
                  variant="quiet"
                >
                  取消
                </Button>
              </div>
              <label>
                名称
                <input
                  onChange={(event) =>
                    setFormState((current) =>
                      current ? { ...current, name: event.target.value } : current,
                    )
                  }
                  required
                  value={formState.name}
                />
              </label>
              <label>
                当前余额
                <input
                  inputMode="decimal"
                  onChange={(event) =>
                    setFormState((current) =>
                      current ? { ...current, balance: event.target.value } : current,
                    )
                  }
                  required
                  step="0.01"
                  type="number"
                  value={formState.balance}
                />
              </label>
              <label>
                颜色
                <select
                  onChange={(event) =>
                    setFormState((current) =>
                      current ? { ...current, color: event.target.value } : current,
                    )
                  }
                  value={formState.color}
                >
                  {CONTAINER_COLORS.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                备注（可选）
                <textarea
                  onChange={(event) =>
                    setFormState((current) =>
                      current ? { ...current, note: event.target.value } : current,
                    )
                  }
                  rows={3}
                  value={formState.note}
                />
              </label>
              <Button
                disabled={
                  formState.name.trim().length === 0 ||
                  Number.isNaN(Number.parseFloat(formState.balance))
                }
                type="submit"
                variant="primary"
              >
                保存容器
              </Button>
            </form>
          ) : null}
        </Panel>

        <IncomeSourcePanel
          containers={localContainers}
          createSourceId={createIncomeSourceId}
          now={now}
          onDeleteSource={onDeleteIncomeSource}
          onDepositSource={handleDepositIncomeSource}
          onSaveSource={onSaveIncomeSource}
          sources={incomeSources}
        />

        <DailyExpensePoolPanel
          createEntryId={createDailyExpenseEntryId}
          entries={dailyExpenseEntries}
          now={now}
          onDeleteEntry={onDeleteDailyExpenseEntry}
          onExpenseCharged={async ({ entry, pool: updatedPool }) => {
            await onSaveWealthFlowEvent(
              createDailyExpenseSpentEvent({
                sourceDailyExpensePool: updatedPool,
                dailyExpenseEntry: entry,
                now,
                ...(createWealthFlowEventId
                  ? { createId: createWealthFlowEventId }
                  : {}),
              }),
            );
          }}
          onSaveEntry={onSaveDailyExpenseEntry}
          onSavePool={onSaveDailyExpensePool}
          onSaveWalletContainer={persistWalletContainer}
          onTransferCompleted={async ({
            pool: updatedPool,
            sourceContainer,
            amount,
          }) => {
            await onSaveWealthFlowEvent(
              createDailyExpenseTransferEvent({
                sourceWalletContainer: sourceContainer,
                targetDailyExpensePool: updatedPool,
                amount,
                now,
                ...(createWealthFlowEventId
                  ? { createId: createWealthFlowEventId }
                  : {}),
              }),
            );
          }}
          pool={dailyExpensePool}
          walletContainers={localContainers}
        />

        <WealthFlowLogPanel
          events={wealthFlowEvents}
          onRefundExpense={handleRefundExpenseEvent}
        />

        <Panel title="财务系统未来结构">
          <ul className={styles.futureList}>
            {FUTURE_STRUCTURES.map((structure) => (
              <li key={structure}>
                <strong>{structure}</strong>
                <StatusLabel tone="neutral">后续开放</StatusLabel>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </WindowFrame>
  );
}

function WalletDonut({ summary }: { summary: WalletSummary }) {
  const isPositive = summary.status === "positive";
  const background = isPositive
    ? buildDonutBackground(summary)
    : "conic-gradient(#b9b9ad 0 100%)";
  const amount =
    summary.status === "negative"
      ? Math.abs(summary.totalBalance)
      : summary.totalBalance;

  return (
    <div
      aria-label="钱包余额环形图"
      className={styles.donut}
      role="img"
      style={{ background }}
    >
      <div className={styles.donutCenter}>
        <span>
          {summary.status === "negative" ? "当前负债金额" : "当前总余额"}
        </span>
        <strong>{formatMoneyAmount(amount)}</strong>
      </div>
    </div>
  );
}

function WalletLegend({
  containers,
  onDeleteContainer,
  onEditContainer,
  summary,
}: {
  containers: WalletContainer[];
  onDeleteContainer: (container: WalletContainer) => void;
  onEditContainer: (container: WalletContainer) => void;
  summary: WalletSummary;
}) {
  if (containers.length === 0) {
    return <p className={styles.stateNote}>尚未新建资金容器。</p>;
  }

  const percentages = new Map(
    summary.distributionItems.map((item) => [item.containerId, item.percentage]),
  );

  return (
    <ul className={styles.legendList}>
      {containers.map((container) => (
        <li key={container.id}>
          <div className={styles.legendIdentity}>
            <span
              aria-hidden="true"
              className={styles.colorChip}
              style={{ backgroundColor: container.color }}
            />
            <div>
              <strong>{container.name}</strong>
              {container.note ? <p>{container.note}</p> : null}
            </div>
          </div>
          <span className={styles.balanceText}>
            {formatMoneyAmount(container.balance)}
          </span>
          <strong>
            {percentages.has(container.id)
              ? formatPercentage(percentages.get(container.id) ?? 0)
              : "暂不计算"}
          </strong>
          <div className={styles.containerActions}>
            <Button
              aria-label={`编辑${container.name}`}
              onClick={() => onEditContainer(container)}
              size="sm"
              variant="quiet"
            >
              编辑
            </Button>
            <Button
              aria-label={`删除${container.name}`}
              onClick={() => onDeleteContainer(container)}
              size="sm"
              variant="danger"
            >
              删除
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function buildDonutBackground(summary: WalletSummary): string {
  let cursor = 0;
  const segments = summary.distributionItems.map((item) => {
    const start = cursor;
    const end = cursor + item.percentage;
    cursor = end;
    return `${item.color} ${start}% ${end}%`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function containerToFormState(container: WalletContainer): WalletFormState {
  return {
    id: container.id,
    name: container.name,
    balance: String(container.balance),
    color: container.color,
    note: container.note ?? "",
    createdAt: container.createdAt,
  };
}

function createDefaultContainerId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `wallet-container-${Date.now()}`;
}

function noopSaveIncomeSource() {}

function noopDeleteIncomeSource() {}

function noopSaveDailyExpensePool() {}

function noopSaveDailyExpenseEntry() {}

function noopDeleteDailyExpenseEntry() {}

function noopSaveWealthFlowEvent() {}

function formatPercentage(value: number): string {
  return `${new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 1,
  }).format(value)}%`;
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
