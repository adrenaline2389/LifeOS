"use client";

import { useState } from "react";

import { Button, Panel } from "@/features/retro-ui";
import type { WealthFlowEvent } from "@/types/lifeos";

import { formatMoneyAmount } from "./insights";
import styles from "./finance-management.module.css";

export type WealthFlowLogPanelProps = {
  events: WealthFlowEvent[];
  onRefundExpense?: (event: WealthFlowEvent) => Promise<void> | void;
};

const EVENT_LABELS: Record<WealthFlowEvent["type"], string> = {
  income_received: "入账",
  daily_expense_transfer: "划款",
  daily_expense_spent: "消费",
  daily_expense_refund: "消费回退",
};
const EVENTS_PER_PAGE = 10;

export function WealthFlowLogPanel({
  events,
  onRefundExpense,
}: WealthFlowLogPanelProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const sortedEvents = [...events].sort((left, right) =>
    right.occurredAt.localeCompare(left.occurredAt),
  );
  const pageCount = Math.max(1, Math.ceil(sortedEvents.length / EVENTS_PER_PAGE));
  const currentPageIndex = Math.min(pageIndex, pageCount - 1);
  const visibleEvents = sortedEvents.slice(
    currentPageIndex * EVENTS_PER_PAGE,
    currentPageIndex * EVENTS_PER_PAGE + EVENTS_PER_PAGE,
  );
  const spentEventsById = new Map(
    events
      .filter((event) => event.type === "daily_expense_spent")
      .map((event) => [event.id, event]),
  );
  const refundedSpentEventIds = new Set(
    events
      .filter(
        (event) =>
          event.type === "daily_expense_refund" && event.relatedEventId,
      )
      .map((event) => event.relatedEventId),
  );

  return (
    <Panel title="财富流动日志">
      <div className={styles.wealthFlowIntro}>
        <p>这里展示从当前版本开始追加记录的本地财富流动事件。</p>
      </div>

      {sortedEvents.length > 0 ? (
        <>
          <ul className={styles.wealthFlowList}>
            {visibleEvents.map((event) => (
              <li
                aria-label={`${EVENT_LABELS[event.type]} ${formatEventAmount(event)}`}
                className={styles.wealthFlowCard}
                key={event.id}
              >
                <div className={styles.wealthFlowEventBody}>
                  <div className={styles.wealthFlowEventHeader}>
                    <div>
                      <strong>{EVENT_LABELS[event.type]}</strong>
                      <p>{formatEventTime(event.occurredAt)}</p>
                    </div>
                  </div>

                  <div className={styles.wealthFlowMeta}>
                    {event.source ? (
                      <span>来源：{event.source.nameSnapshot}</span>
                    ) : null}
                    {event.target ? (
                      <span>目标：{event.target.nameSnapshot}</span>
                    ) : null}
                    {event.note ? <span>备注：{event.note}</span> : null}
                    {event.type === "daily_expense_refund" ? (
                      <span>{formatRefundRelation(event, spentEventsById)}</span>
                    ) : null}
                  </div>

                  <span className={getEventAmountClassName(event)}>
                    {formatEventAmount(event)}
                  </span>
                </div>

                {event.type === "daily_expense_spent" && onRefundExpense ? (
                  <div className={styles.containerActions}>
                    <Button
                      aria-label={`回退消费${event.note ?? event.id}`}
                      disabled={refundedSpentEventIds.has(event.id)}
                      onClick={() => onRefundExpense(event)}
                      size="sm"
                      variant="danger"
                    >
                      {refundedSpentEventIds.has(event.id) ? "已回退" : "回退消费"}
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          {pageCount > 1 ? (
            <div className={styles.wealthFlowPagination}>
              <Button
                disabled={currentPageIndex === 0}
                onClick={() =>
                  setPageIndex((current) => Math.max(0, current - 1))
                }
                size="sm"
                variant="quiet"
              >
                上一页
              </Button>
              <span>
                第 {currentPageIndex + 1} / {pageCount} 页 · 共{" "}
                {sortedEvents.length} 条
              </span>
              <Button
                disabled={currentPageIndex >= pageCount - 1}
                onClick={() =>
                  setPageIndex((current) =>
                    Math.min(pageCount - 1, current + 1),
                  )
                }
                size="sm"
                variant="quiet"
              >
                下一页
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <p className={styles.emptyContainer}>
          还没有财富流动日志。当前版本只记录之后新发生的入账、划款、消费和消费回退。
        </p>
      )}
    </Panel>
  );
}

function formatEventAmount(event: WealthFlowEvent): string {
  const amount = formatMoneyAmount(event.amount);

  if (event.type === "daily_expense_transfer") {
    return `划入开销池 ${amount}`;
  }

  if (event.type === "daily_expense_spent") {
    return `-${amount}`;
  }

  return `+${amount}`;
}

function getEventAmountClassName(event: WealthFlowEvent): string {
  const toneClassName =
    event.type === "daily_expense_transfer"
      ? styles.wealthFlowAmountTransfer
      : event.type === "daily_expense_spent"
        ? styles.wealthFlowAmountOut
        : styles.wealthFlowAmountIn;

  return [styles.wealthFlowAmount, toneClassName].join(" ");
}

function formatEventTime(value: string): string {
  if (value.length >= 16) {
    return value.slice(0, 16).replace("T", " ");
  }

  return value;
}

function formatRefundRelation(
  event: WealthFlowEvent,
  spentEventsById: Map<string, WealthFlowEvent>,
): string {
  const relatedSpentEvent = event.relatedEventId
    ? spentEventsById.get(event.relatedEventId)
    : undefined;

  if (relatedSpentEvent?.note) {
    return `关联原消费：${relatedSpentEvent.note}`;
  }

  return "关联原消费：未记录原消费备注";
}
