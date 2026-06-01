"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { Button, Panel } from "@/features/retro-ui";
import type { MoneyInflowSource, WalletContainer } from "@/types/lifeos";

import { formatMoneyAmount } from "./insights";
import styles from "./finance-management.module.css";

export type IncomeSourcePanelProps = {
  containers: WalletContainer[];
  sources: MoneyInflowSource[];
  onSaveSource: (source: MoneyInflowSource) => Promise<void> | void;
  onDeleteSource: (sourceId: string) => Promise<void> | void;
  onDepositSource?: (
    source: MoneyInflowSource,
    variableAmount?: number,
  ) => Promise<void> | void;
  now?: () => Date;
  createSourceId?: () => string;
};

type AmountMode = MoneyInflowSource["amountPattern"]["kind"];
type FrequencyMode =
  | "variable"
  | Extract<MoneyInflowSource["frequencyPattern"], { kind: "fixed" }>["interval"];

type IncomeSourceFormState = {
  id: string | null;
  name: string;
  amountMode: AmountMode;
  fixedAmount: string;
  frequencyMode: FrequencyMode;
  targetWalletContainerId: string;
  note: string;
  createdAt: string | null;
};

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "日结" },
  { value: "weekly", label: "周结" },
  { value: "monthly", label: "月结" },
  { value: "quarterly", label: "季结" },
  { value: "yearly", label: "年结" },
  { value: "variable", label: "不固定" },
] as const;

export function IncomeSourcePanel({
  containers,
  sources,
  onSaveSource,
  onDeleteSource,
  onDepositSource,
  now = () => new Date(),
  createSourceId = createDefaultSourceId,
}: IncomeSourcePanelProps) {
  const [savedSources, setSavedSources] = useState<MoneyInflowSource[]>([]);
  const [deletedSourceIds, setDeletedSourceIds] = useState<string[]>([]);
  const [formState, setFormState] = useState<IncomeSourceFormState | null>(null);
  const [depositSourceId, setDepositSourceId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  const localSources = useMemo(
    () => [
      ...sources.filter(
        (source) =>
          !deletedSourceIds.includes(source.id) &&
          !savedSources.some((savedSource) => savedSource.id === source.id),
      ),
      ...savedSources,
    ],
    [deletedSourceIds, savedSources, sources],
  );
  const canCreate = containers.length > 0;

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState || containers.length === 0) {
      return;
    }

    const timestamp = formatLocalDateTime(now());
    const trimmedName = formState.name.trim();
    const fixedAmount = Number.parseFloat(formState.fixedAmount);
    const note = formState.note.trim();
    const source: MoneyInflowSource = {
      id: formState.id ?? createSourceId(),
      name: trimmedName,
      amountPattern:
        formState.amountMode === "fixed"
          ? { kind: "fixed", amount: fixedAmount }
          : { kind: "variable" },
      frequencyPattern:
        formState.frequencyMode === "variable"
          ? { kind: "variable" }
          : { kind: "fixed", interval: formState.frequencyMode },
      targetWalletContainerId: formState.targetWalletContainerId,
      ...(note ? { note } : {}),
      createdAt: formState.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    await onSaveSource(source);
    setDeletedSourceIds((current) =>
      current.filter((sourceId) => sourceId !== source.id),
    );
    setSavedSources((current) => [
      ...current.filter((candidate) => candidate.id !== source.id),
      source,
    ]);
    setFormState(null);
  }

  async function handleDelete(sourceId: string) {
    await onDeleteSource(sourceId);
    setDeletedSourceIds((current) =>
      current.includes(sourceId) ? current : [...current, sourceId],
    );
    setSavedSources((current) =>
      current.filter((candidate) => candidate.id !== sourceId),
    );
    setFormState((current) => (current?.id === sourceId ? null : current));
  }

  async function handleDeposit(source: MoneyInflowSource) {
    if (source.amountPattern.kind === "variable") {
      setDepositSourceId(source.id);
      setDepositAmount("");
      return;
    }

    await onDepositSource?.(source);
  }

  async function handleVariableDeposit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const source = localSources.find((candidate) => candidate.id === depositSourceId);
    const amount = Number.parseFloat(depositAmount);

    if (!source || Number.isNaN(amount) || amount <= 0) {
      return;
    }

    await onDepositSource?.(source, amount);
    setDepositSourceId(null);
    setDepositAmount("");
  }

  return (
    <Panel title="收入来源">
      <div className={styles.incomeIntro}>
        <p>这些是你手动维护的本地收入来源。</p>
        <Button
          disabled={!canCreate}
          onClick={() => setFormState(createEmptyForm(containers))}
          size="sm"
        >
          新增收入来源
        </Button>
      </div>

      {!canCreate ? (
        <p className={styles.stateNote}>请先创建钱包容器，再新增收入来源。</p>
      ) : null}

      <ul className={styles.incomeSourceList}>
        {localSources.length > 0 ? (
          localSources.map((source) => {
            const targetContainer = containers.find(
              (container) => container.id === source.targetWalletContainerId,
            );
            const isTargetMissing = !targetContainer;

            return (
              <li
                aria-label={source.name}
                className={styles.incomeSourceCard}
                key={source.id}
              >
                <div className={styles.incomeSourceHeader}>
                  <div>
                    <strong>{source.name}</strong>
                    <p>{formatAmountPattern(source)}</p>
                    <p>{formatFrequencyPattern(source)}</p>
                    <p>
                      流入钱包容器：
                      {targetContainer?.name ?? "需要重新选择流入钱包"}
                    </p>
                    {source.note ? <p>{source.note}</p> : null}
                  </div>
                </div>
                <div
                  className={`${styles.containerActions} ${styles.incomeSourceActions}`}
                >
                  <Button
                    aria-label={`手动入账${source.name}`}
                    className={styles.depositButton}
                    disabled={isTargetMissing}
                    onClick={() => handleDeposit(source)}
                    size="lg"
                    title="手动入账"
                    variant="primary"
                  >
                    <span className={styles.depositButtonGlyph}>+</span>
                  </Button>
                  <Button
                    aria-label={`编辑${source.name}`}
                    onClick={() => setFormState(sourceToFormState(source))}
                    size="sm"
                    variant="quiet"
                  >
                    编辑
                  </Button>
                </div>
              </li>
            );
          })
        ) : (
          <li className={styles.emptyContainer}>尚未新建收入来源。</li>
        )}
      </ul>

      {depositSourceId ? (
        <form className={styles.editor} onSubmit={handleVariableDeposit}>
          <div className={styles.editorHeader}>
            <strong>确认本次到账</strong>
            <Button
              onClick={() => {
                setDepositSourceId(null);
                setDepositAmount("");
              }}
              size="sm"
              variant="quiet"
            >
              取消
            </Button>
          </div>
          <label>
            本次到账金额
            <input
              inputMode="decimal"
              min="0.01"
              onChange={(event) => setDepositAmount(event.target.value)}
              required
              step="0.01"
              type="number"
              value={depositAmount}
            />
          </label>
          <Button
            disabled={
              Number.isNaN(Number.parseFloat(depositAmount)) ||
              Number.parseFloat(depositAmount) <= 0
            }
            type="submit"
            variant="primary"
          >
            确认入账
          </Button>
        </form>
      ) : null}

      {formState ? (
        <form className={styles.editor} onSubmit={handleSave}>
          <div className={styles.editorHeader}>
            <strong>{formState.id ? "编辑收入来源" : "新建收入来源"}</strong>
            <Button onClick={() => setFormState(null)} size="sm" variant="quiet">
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
            金额模式
            <select
              onChange={(event) =>
                setFormState((current) =>
                  current
                    ? {
                        ...current,
                        amountMode: event.target.value as AmountMode,
                      }
                    : current,
                )
              }
              value={formState.amountMode}
            >
              <option value="fixed">固定金额</option>
              <option value="variable">不固定</option>
            </select>
          </label>
          {formState.amountMode === "fixed" ? (
            <label>
              固定金额
              <input
                inputMode="decimal"
                min="0.01"
                onChange={(event) =>
                  setFormState((current) =>
                    current
                      ? { ...current, fixedAmount: event.target.value }
                      : current,
                  )
                }
                required
                step="0.01"
                type="number"
                value={formState.fixedAmount}
              />
            </label>
          ) : null}
          <label>
            频率模式
            <select
              onChange={(event) =>
                setFormState((current) =>
                  current
                    ? {
                        ...current,
                        frequencyMode: event.target.value as FrequencyMode,
                      }
                    : current,
                )
              }
              value={formState.frequencyMode}
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            流入钱包容器
            <select
              onChange={(event) =>
                setFormState((current) =>
                  current
                    ? { ...current, targetWalletContainerId: event.target.value }
                    : current,
                )
              }
              required
              value={formState.targetWalletContainerId}
            >
              {containers.map((container) => (
                <option key={container.id} value={container.id}>
                  {container.name}
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
          <div className={styles.formActions}>
            {formState.id ? (
              <Button
                onClick={() => handleDelete(formState.id ?? "")}
                size="sm"
                variant="danger"
              >
                删除收入来源
              </Button>
            ) : null}
            <Button disabled={!isFormSubmittable(formState)} type="submit" variant="primary">
              保存收入来源
            </Button>
          </div>
        </form>
      ) : null}
    </Panel>
  );
}

function createEmptyForm(containers: WalletContainer[]): IncomeSourceFormState {
  return {
    id: null,
    name: "",
    amountMode: "fixed",
    fixedAmount: "0",
    frequencyMode: "monthly",
    targetWalletContainerId: containers[0]?.id ?? "",
    note: "",
    createdAt: null,
  };
}

function sourceToFormState(source: MoneyInflowSource): IncomeSourceFormState {
  return {
    id: source.id,
    name: source.name,
    amountMode: source.amountPattern.kind,
    fixedAmount:
      source.amountPattern.kind === "fixed" ? String(source.amountPattern.amount) : "",
    frequencyMode:
      source.frequencyPattern.kind === "fixed"
        ? source.frequencyPattern.interval
        : "variable",
    targetWalletContainerId: source.targetWalletContainerId,
    note: source.note ?? "",
    createdAt: source.createdAt,
  };
}

function isFormSubmittable(formState: IncomeSourceFormState): boolean {
  const fixedAmount = Number.parseFloat(formState.fixedAmount);

  return (
    formState.name.trim().length > 0 &&
    formState.targetWalletContainerId.length > 0 &&
    (formState.amountMode === "variable" ||
      (!Number.isNaN(fixedAmount) && fixedAmount > 0))
  );
}

function formatAmountPattern(source: MoneyInflowSource): string {
  if (source.amountPattern.kind === "variable") {
    return "金额模式：不固定";
  }

  return `固定金额：${formatMoneyAmount(source.amountPattern.amount)}`;
}

function formatFrequencyPattern(source: MoneyInflowSource): string {
  if (source.frequencyPattern.kind === "variable") {
    return "频率不固定";
  }

  const interval = source.frequencyPattern.interval;

  return (
    FREQUENCY_OPTIONS.find(
      (option) => option.value === interval,
    )?.label ?? "频率不固定"
  );
}

function createDefaultSourceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `income-source-${Date.now()}`;
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
