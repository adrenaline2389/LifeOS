import { describe, expect, it } from "vitest";

import type {
  EnergyDimensionId,
  EnergyObservation,
} from "@/types/lifeos";
import {
  buildEnergyCompass,
  buildEnergyCurrentState,
  buildTodayEnergyTimeline,
  getCompassDateRange,
  getLocalDayRange,
} from "./insights";

function observation(
  id: string,
  dimensionId: EnergyDimensionId,
  valueLabel: string,
  internalScore: -3 | -2 | -1 | 0 | 1 | 2 | 3,
  observedAt: string,
): EnergyObservation {
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

describe("energy management insights", () => {
  it("calculates local day and compass ranges from device-local midnight", () => {
    const today = getLocalDayRange(now);
    const sevenDays = getCompassDateRange("7d", now);

    expect(today.from.getFullYear()).toBe(2026);
    expect(today.from.getMonth()).toBe(4);
    expect(today.from.getDate()).toBe(18);
    expect(today.from.getHours()).toBe(0);
    expect(today.to.getDate()).toBe(19);
    expect(today.to.getHours()).toBe(0);
    expect(sevenDays.from.getDate()).toBe(12);
    expect(sevenDays.from.getHours()).toBe(0);
    expect(sevenDays.to.getTime()).toBe(today.to.getTime());
  });

  it("builds current state for observed today, stale, and never observed dimensions", () => {
    const states = buildEnergyCurrentState(
      [
        observation("capacity-yesterday", "currentCapacity", "偏低", -1, "2026-05-17T22:00:00.000"),
        observation("capacity-today", "currentCapacity", "有余量", 2, "2026-05-18T08:00:00.000"),
        observation("pressure-yesterday", "pressureLoad", "偏重", -1, "2026-05-17T20:00:00.000"),
      ],
      now,
    );

    expect(states.find((state) => state.dimensionId === "currentCapacity")).toMatchObject({
      latestObservation: expect.objectContaining({ id: "capacity-today" }),
      status: "observedToday",
    });
    expect(states.find((state) => state.dimensionId === "pressureLoad")).toMatchObject({
      latestObservation: expect.objectContaining({ id: "pressure-yesterday" }),
      status: "stale",
    });
    expect(states.find((state) => state.dimensionId === "actionResistance")).toMatchObject({
      latestObservation: null,
      status: "neverObserved",
    });
  });

  it("groups only today's sparse observations by dimension in time order", () => {
    const timeline = buildTodayEnergyTimeline(
      [
        observation("previous", "currentCapacity", "偏低", -1, "2026-05-17T23:50:00.000"),
        observation("attention-late", "attentionBandwidth", "容易分心", -1, "2026-05-18T16:00:00.000"),
        observation("attention-early", "attentionBandwidth", "清晰宽裕", 3, "2026-05-18T09:00:00.000"),
        observation("social", "socialBattery", "可以交流", 2, "2026-05-18T12:00:00.000"),
        observation("next", "currentCapacity", "够用", 1, "2026-05-19T00:10:00.000"),
      ],
      now,
    );

    expect(timeline.find((group) => group.dimensionId === "currentCapacity")?.observations).toEqual([]);
    expect(timeline.find((group) => group.dimensionId === "attentionBandwidth")?.observations).toEqual([
      expect.objectContaining({ id: "attention-early" }),
      expect.objectContaining({ id: "attention-late" }),
    ]);
    expect(timeline.find((group) => group.dimensionId === "socialBattery")?.observations).toEqual([
      expect.objectContaining({ id: "social" }),
    ]);
  });

  it("summarizes compass ranges without treating missing observations as zero", () => {
    const summaries = buildEnergyCompass(
      [
        observation("capacity-1", "currentCapacity", "快见底", -2, "2026-05-12T08:00:00.000"),
        observation("capacity-2", "currentCapacity", "偏低", -1, "2026-05-17T08:00:00.000"),
        observation("capacity-3", "currentCapacity", "很充足", 3, "2026-05-18T08:00:00.000"),
        observation("social-1", "socialBattery", "少量可用", 1, "2026-05-18T10:00:00.000"),
        observation("old-pressure", "pressureLoad", "过载", -3, "2026-05-01T10:00:00.000"),
      ],
      "7d",
      now,
    );

    expect(summaries.find((summary) => summary.dimensionId === "currentCapacity")).toMatchObject({
      observationCount: 3,
      averageInternalScore: 0,
      lowObservationCount: 2,
      latestObservation: expect.objectContaining({ id: "capacity-3" }),
      summaryLabel: "勉强可用",
    });
    expect(summaries.find((summary) => summary.dimensionId === "socialBattery")).toMatchObject({
      observationCount: 1,
      averageInternalScore: 1,
      lowObservationCount: 0,
      summaryLabel: "少量可用",
    });
    expect(summaries.find((summary) => summary.dimensionId === "pressureLoad")).toMatchObject({
      observationCount: 0,
      averageInternalScore: null,
      lowObservationCount: 0,
      latestObservation: null,
      summaryLabel: null,
    });
  });

  it("supports 1 day, 15 day, and 30 day compass windows", () => {
    const observations = [
      observation("today", "attentionBandwidth", "能聚焦", 2, "2026-05-18T09:00:00.000"),
      observation("two-days", "attentionBandwidth", "容易分心", -1, "2026-05-16T09:00:00.000"),
      observation("twenty-days", "attentionBandwidth", "很难处理", -2, "2026-04-28T09:00:00.000"),
    ];

    expect(
      buildEnergyCompass(observations, "1d", now).find(
        (summary) => summary.dimensionId === "attentionBandwidth",
      )?.observationCount,
    ).toBe(1);
    expect(
      buildEnergyCompass(observations, "15d", now).find(
        (summary) => summary.dimensionId === "attentionBandwidth",
      )?.observationCount,
    ).toBe(2);
    expect(
      buildEnergyCompass(observations, "30d", now).find(
        (summary) => summary.dimensionId === "attentionBandwidth",
      )?.observationCount,
    ).toBe(3);
  });
});
