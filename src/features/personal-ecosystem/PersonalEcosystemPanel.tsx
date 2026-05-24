"use client";

import { useMemo, useState } from "react";

import { Button, Panel, StatusLabel, WindowFrame } from "@/features/retro-ui";
import type {
  EcosystemBarometerRange,
  EcosystemDimensionId,
  EcosystemObservation,
} from "@/types/lifeos";

import { ECOSYSTEM_DIMENSIONS } from "./dimensions";
import {
  buildEcosystemBarometer,
  buildEcosystemCurrentState,
  buildTodayEcosystemTimeline,
} from "./insights";
import styles from "./personal-ecosystem.module.css";

export type PersonalEcosystemPanelProps = {
  observations: EcosystemObservation[];
  onDeleteObservation: (observationId: string) => Promise<void> | void;
  onSaveObservation: (observation: EcosystemObservation) => Promise<void> | void;
  onBack: () => void;
  now?: () => Date;
  createObservationId?: () => string;
};

const BAROMETER_RANGES: Array<{
  id: EcosystemBarometerRange;
  label: string;
}> = [
  { id: "1d", label: "1 天" },
  { id: "7d", label: "7 天" },
  { id: "15d", label: "15 天" },
  { id: "30d", label: "30 天" },
];

export function PersonalEcosystemPanel({
  observations,
  onDeleteObservation,
  onSaveObservation,
  onBack,
  now = () => new Date(),
  createObservationId = createDefaultObservationId,
}: PersonalEcosystemPanelProps) {
  const [savedObservations, setSavedObservations] = useState<
    EcosystemObservation[]
  >([]);
  const [deletedObservationIds, setDeletedObservationIds] = useState<string[]>([]);
  const [sessionObservationIds, setSessionObservationIds] = useState<
    Partial<Record<EcosystemDimensionId, string>>
  >({});
  const [activeDimensionId, setActiveDimensionId] =
    useState<EcosystemDimensionId | null>(null);
  const [barometerRange, setBarometerRange] =
    useState<EcosystemBarometerRange>("7d");
  const currentDate = now();

  const localObservations = useMemo(
    () => [
      ...observations.filter(
        (observation) => !deletedObservationIds.includes(observation.id),
      ),
      ...savedObservations,
    ],
    [deletedObservationIds, observations, savedObservations],
  );

  const currentStates = useMemo(
    () => buildEcosystemCurrentState(localObservations, currentDate),
    [localObservations, currentDate],
  );
  const todayTimeline = useMemo(
    () => buildTodayEcosystemTimeline(localObservations, currentDate),
    [localObservations, currentDate],
  );
  const barometer = useMemo(
    () => buildEcosystemBarometer(localObservations, barometerRange, currentDate),
    [barometerRange, localObservations, currentDate],
  );
  const activeDimension = ECOSYSTEM_DIMENSIONS.find(
    (dimension) => dimension.id === activeDimensionId,
  );

  async function handleRecord(
    dimensionId: EcosystemDimensionId,
    valueId: string,
  ) {
    const dimension = ECOSYSTEM_DIMENSIONS.find(
      (candidate) => candidate.id === dimensionId,
    );
    const value = dimension?.values.find((candidate) => candidate.id === valueId);

    if (!dimension || !value) {
      return;
    }

    const observationId = sessionObservationIds[dimensionId] ?? createObservationId();

    const observation: EcosystemObservation = {
      id: observationId,
      dimensionId,
      valueId: value.id,
      valueLabel: value.label,
      internalScore: value.internalScore,
      observedAt: formatLocalDateTime(now()),
    };

    await onSaveObservation(observation);
    setSessionObservationIds((current) => ({
      ...current,
      [dimensionId]: observationId,
    }));
    setDeletedObservationIds((current) =>
      current.filter((deletedObservationId) => deletedObservationId !== observationId),
    );
    setSavedObservations((current) => [
      ...current.filter((candidate) => candidate.id !== observationId),
      observation,
    ]);
    setActiveDimensionId(null);
  }

  async function handleDelete(observation: EcosystemObservation) {
    await onDeleteObservation(observation.id);
    setDeletedObservationIds((current) =>
      current.includes(observation.id) ? current : [...current, observation.id],
    );
    setSavedObservations((current) =>
      current.filter((candidate) => candidate.id !== observation.id),
    );
    setSessionObservationIds((current) => {
      if (current[observation.dimensionId] !== observation.id) {
        return current;
      }

      const next = { ...current };
      delete next[observation.dimensionId];
      return next;
    });
  }

  return (
    <WindowFrame
      actions={
        <Button onClick={onBack} size="sm" variant="quiet">
          返回启动面板
        </Button>
      }
      statusBar="生态观察点只保存在这台设备上。"
      title="个人生态系统"
    >
      <div className={styles.layout}>
        <header className={styles.header}>
          <p>生理基础与生活环境</p>
        </header>

        <Panel title="当前生态状态">
          <ul className={styles.dimensionGrid}>
            {ECOSYSTEM_DIMENSIONS.map((dimension) => {
              const state = currentStates.find(
                (candidate) => candidate.dimensionId === dimension.id,
              );
              const latestObservation = state?.latestObservation ?? null;
              const status = state?.status ?? "neverObserved";

              return (
                <li className={styles.dimensionCard} key={dimension.id}>
                  <div className={styles.dimensionHeader}>
                    <div>
                      <strong>{dimension.label}</strong>
                      <p>{dimension.description}</p>
                    </div>
                    <StatusLabel tone={statusTone(status)}>
                      {statusLabel(status)}
                    </StatusLabel>
                  </div>

                  {latestObservation ? (
                    <p className={styles.currentValue}>
                      {latestObservation.valueLabel}
                      <span>
                        {formatObservationTime(
                          latestObservation.observedAt,
                          currentDate,
                        )}
                      </span>
                    </p>
                  ) : (
                    <p className={styles.emptyValue}>尚未观察</p>
                  )}

                  <Button
                    onClick={() => setActiveDimensionId(dimension.id)}
                    size="sm"
                  >
                    更新{dimension.label}
                  </Button>
                </li>
              );
            })}
          </ul>

          {activeDimension ? (
            <div
              aria-label={`更新${activeDimension.label}`}
              className={styles.recordPanel}
              role="group"
            >
              <div className={styles.recordHeader}>
                <strong>更新{activeDimension.label}</strong>
                <Button
                  onClick={() => setActiveDimensionId(null)}
                  size="sm"
                  variant="quiet"
                >
                  取消
                </Button>
              </div>
              <div
                aria-label={`${activeDimension.label}语义档位轴`}
                className={styles.valueAxis}
                role="group"
              >
                <div className={styles.axisEnds} aria-hidden="true">
                  <span>支撑高</span>
                  <span>拖累高</span>
                </div>
                <div className={styles.axisTrack}>
                  {activeDimension.values.map((value) => (
                    <button
                      className={styles.axisStop}
                      key={value.id}
                      onClick={() => handleRecord(activeDimension.id, value.id)}
                      type="button"
                    >
                      <span className={styles.axisKnob} aria-hidden="true" />
                      <span className={styles.axisLabel}>{value.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </Panel>

        <Panel title="今日生态轨迹">
          <ul className={styles.timelineList}>
            {todayTimeline.map((group) => {
              const dimension = ECOSYSTEM_DIMENSIONS.find(
                (candidate) => candidate.id === group.dimensionId,
              );

              return (
                <li key={group.dimensionId}>
                  <strong>{dimension?.label ?? group.dimensionId}</strong>
                  {group.observations.length > 0 ? (
                    <ol className={styles.observationPills}>
                      {group.observations.map((observation) => (
                        <li key={observation.id}>
                          <span>{formatClockTime(observation.observedAt)}</span>
                          <span>{observation.valueLabel}</span>
                          <Button
                            aria-label={`删除${dimension?.label ?? group.dimensionId} ${formatClockTime(
                              observation.observedAt,
                            )} ${observation.valueLabel}`}
                            onClick={() => handleDelete(observation)}
                            size="sm"
                            variant="quiet"
                          >
                            删除
                          </Button>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>今日未观察</p>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="生活晴雨表">
          <div className={styles.rangeControls}>
            {BAROMETER_RANGES.map((range) => (
              <Button
                aria-pressed={barometerRange === range.id}
                key={range.id}
                onClick={() => setBarometerRange(range.id)}
                size="sm"
                variant={barometerRange === range.id ? "primary" : "quiet"}
              >
                {range.label}
              </Button>
            ))}
          </div>
          <p className={styles.rangeSummary}>
            过去 {BAROMETER_RANGES.find((range) => range.id === barometerRange)?.label}
          </p>
          <ul className={styles.barometerList}>
            {barometer.map((summary) => {
              const dimension = ECOSYSTEM_DIMENSIONS.find(
                (candidate) => candidate.id === summary.dimensionId,
              );

              return (
                <li key={summary.dimensionId}>
                  <strong>{dimension?.label ?? summary.dimensionId}</strong>
                  {summary.observationCount > 0 ? (
                    <p>
                      {summary.observationCount} 次观察，平均位置接近
                      「{summary.summaryLabel}」，低位观察 {summary.lowObservationCount} 次。
                    </p>
                  ) : (
                    <p>暂无观察。</p>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </WindowFrame>
  );
}

function createDefaultObservationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `ecosystem-observation-${Date.now()}`;
}

function statusLabel(status: "observedToday" | "stale" | "neverObserved"): string {
  if (status === "observedToday") return "今日已观察";
  if (status === "stale") return "今日未观察";
  return "尚未观察";
}

function statusTone(status: "observedToday" | "stale" | "neverObserved") {
  if (status === "observedToday") return "ok";
  if (status === "stale") return "warning";
  return "neutral";
}

function formatObservationTime(value: string, currentDate: Date): string {
  const date = new Date(value);
  const isToday =
    date.getFullYear() === currentDate.getFullYear() &&
    date.getMonth() === currentDate.getMonth() &&
    date.getDate() === currentDate.getDate();

  if (isToday) {
    return `今日 ${formatClockTime(value)}`;
  }

  return `${date.getMonth() + 1}/${date.getDate()} ${formatClockTime(value)}`;
}

function formatClockTime(value: string): string {
  const date = new Date(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
