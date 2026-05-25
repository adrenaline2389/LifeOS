import { describe, expect, it } from "vitest";

import type {
  EcosystemDimensionId,
  EcosystemObservation,
} from "@/types/lifeos";
import {
  buildEcosystemBarometer,
  buildEcosystemCurrentState,
  buildTodayEcosystemTimeline,
  getLocalDayRange,
} from "./insights";

function observation(
  id: string,
  dimensionId: EcosystemDimensionId,
  valueLabel: string,
  internalScore: -3 | -2 | -1 | 0 | 1 | 2 | 3,
  observedAt: string,
): EcosystemObservation {
  return {
    id,
    dimensionId,
    valueId: valueLabel,
    valueLabel,
    internalScore,
    observedAt,
  };
}

const now = new Date(2026, 4, 18, 16, 30, 0);

describe("personal ecosystem insights", () => {
  it("calculates local day ranges from device-local midnight", () => {
    const range = getLocalDayRange(now);

    expect(range.from.getFullYear()).toBe(2026);
    expect(range.from.getMonth()).toBe(4);
    expect(range.from.getDate()).toBe(18);
    expect(range.from.getHours()).toBe(0);
    expect(range.to.getDate()).toBe(19);
    expect(range.to.getHours()).toBe(0);
  });

  it("builds current state for today, stale, and never observed dimensions", () => {
    const states = buildEcosystemCurrentState(
      [
        observation("sleep-yesterday", "sleepRecovery", "偏少", -1, "2026-05-17T22:00:00.000"),
        observation("sleep-today", "sleepRecovery", "够用", 2, "2026-05-18T08:00:00.000"),
        observation("body-yesterday", "bodyState", "疲惫", -1, "2026-05-17T20:00:00.000"),
      ],
      now,
    );

    expect(states.find((state) => state.dimensionId === "sleepRecovery")).toMatchObject({
      latestObservation: expect.objectContaining({ id: "sleep-today" }),
      status: "observedToday",
    });
    expect(states.find((state) => state.dimensionId === "bodyState")).toMatchObject({
      latestObservation: expect.objectContaining({ id: "body-yesterday" }),
      status: "stale",
    });
    expect(states.find((state) => state.dimensionId === "environmentSupport")).toMatchObject({
      latestObservation: null,
      status: "neverObserved",
    });
  });

  it("groups only today's sparse observations by dimension without interpolation", () => {
    const timeline = buildTodayEcosystemTimeline(
      [
        observation("previous", "sleepRecovery", "偏少", -1, "2026-05-17T23:50:00.000"),
        observation("body-late", "bodyState", "疲惫", -1, "2026-05-18T16:00:00.000"),
        observation("body-early", "bodyState", "轻盈", 3, "2026-05-18T09:00:00.000"),
        observation("environment", "environmentSupport", "清爽", 3, "2026-05-18T12:00:00.000"),
        observation("next", "sleepRecovery", "够用", 2, "2026-05-19T00:10:00.000"),
      ],
      now,
    );

    expect(timeline.find((group) => group.dimensionId === "sleepRecovery")?.observations).toEqual([]);
    expect(timeline.find((group) => group.dimensionId === "bodyState")?.observations).toEqual([
      expect.objectContaining({ id: "body-early" }),
      expect.objectContaining({ id: "body-late" }),
    ]);
    expect(timeline.find((group) => group.dimensionId === "environmentSupport")?.observations).toEqual([
      expect.objectContaining({ id: "environment" }),
    ]);
  });

  it("summarizes barometer ranges without treating missing observations as zero", () => {
    const summaries = buildEcosystemBarometer(
      [
        observation("sleep-1", "sleepRecovery", "偏少", -1, "2026-05-12T08:00:00.000"),
        observation("sleep-2", "sleepRecovery", "很差", -2, "2026-05-17T08:00:00.000"),
        observation("sleep-3", "sleepRecovery", "很恢复", 3, "2026-05-18T08:00:00.000"),
        observation("environment-1", "environmentSupport", "可接受", 1, "2026-05-18T10:00:00.000"),
        observation("old-body", "bodyState", "不适", -3, "2026-05-01T10:00:00.000"),
      ],
      "7d",
      now,
    );

    expect(summaries.find((summary) => summary.dimensionId === "sleepRecovery")).toMatchObject({
      observationCount: 3,
      averageInternalScore: 0,
      lowObservationCount: 2,
      latestObservation: expect.objectContaining({ id: "sleep-3" }),
      summaryLabel: "断续",
    });
    expect(summaries.find((summary) => summary.dimensionId === "environmentSupport")).toMatchObject({
      observationCount: 1,
      averageInternalScore: 1,
      lowObservationCount: 0,
      summaryLabel: "可接受",
    });
    expect(summaries.find((summary) => summary.dimensionId === "bodyState")).toMatchObject({
      observationCount: 0,
      averageInternalScore: null,
      lowObservationCount: 0,
      latestObservation: null,
      summaryLabel: null,
    });
  });

  it("supports 1 day, 15 day, and 30 day barometer windows", () => {
    const observations = [
      observation("today", "dailyRhythm", "稳定", 2, "2026-05-18T09:00:00.000"),
      observation("two-days", "dailyRhythm", "被打断", -1, "2026-05-16T09:00:00.000"),
      observation("twenty-days", "dailyRhythm", "很混乱", -2, "2026-04-28T09:00:00.000"),
    ];

    expect(
      buildEcosystemBarometer(observations, "1d", now).find(
        (summary) => summary.dimensionId === "dailyRhythm",
      )?.observationCount,
    ).toBe(1);
    expect(
      buildEcosystemBarometer(observations, "15d", now).find(
        (summary) => summary.dimensionId === "dailyRhythm",
      )?.observationCount,
    ).toBe(2);
    expect(
      buildEcosystemBarometer(observations, "30d", now).find(
        (summary) => summary.dimensionId === "dailyRhythm",
      )?.observationCount,
    ).toBe(3);
  });

  it("treats the 1 day barometer range as the last 24 hours across midnight", () => {
    const afterMidnight = new Date(2026, 4, 19, 0, 10, 0);
    const summaries = buildEcosystemBarometer(
      [
        observation("before-midnight", "sleepRecovery", "够用", 2, "2026-05-18T23:50:00.000"),
        observation("too-old", "sleepRecovery", "偏少", -1, "2026-05-17T23:50:00.000"),
      ],
      "1d",
      afterMidnight,
    );

    expect(summaries.find((summary) => summary.dimensionId === "sleepRecovery")).toMatchObject({
      observationCount: 1,
      latestObservation: expect.objectContaining({ id: "before-midnight" }),
      summaryLabel: "够用",
    });
  });
});
