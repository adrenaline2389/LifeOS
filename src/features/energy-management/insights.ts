import type {
  EnergyCompassRange,
  EnergyDimensionId,
  EnergyDimensionSummary,
  EnergyObservation,
} from "@/types/lifeos";

import { ENERGY_DIMENSIONS } from "./dimensions";

export type LocalDateRange = {
  from: Date;
  to: Date;
};

export type EnergyCurrentStateStatus =
  | "observedToday"
  | "stale"
  | "neverObserved";

export type EnergyCurrentDimensionState = {
  dimensionId: EnergyDimensionId;
  latestObservation: EnergyObservation | null;
  status: EnergyCurrentStateStatus;
};

export type EnergyTimelineGroup = {
  dimensionId: EnergyDimensionId;
  observations: EnergyObservation[];
};

const RANGE_DAYS: Record<EnergyCompassRange, number> = {
  "1d": 1,
  "7d": 7,
  "15d": 15,
  "30d": 30,
};

export function getLocalDayRange(date: Date = new Date()): LocalDateRange {
  const from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const to = new Date(from);
  to.setDate(to.getDate() + 1);

  return { from, to };
}

export function getCompassDateRange(
  range: EnergyCompassRange,
  date: Date = new Date(),
): LocalDateRange {
  const to = new Date(date);
  const from = new Date(to);
  from.setDate(from.getDate() - RANGE_DAYS[range]);

  return {
    from,
    to,
  };
}

export function buildEnergyCurrentState(
  observations: EnergyObservation[],
  date: Date = new Date(),
): EnergyCurrentDimensionState[] {
  const today = getLocalDayRange(date);

  return ENERGY_DIMENSIONS.map((dimension) => {
    const latestObservation = latestForDimension(observations, dimension.id);

    if (!latestObservation) {
      return {
        dimensionId: dimension.id,
        latestObservation: null,
        status: "neverObserved",
      };
    }

    return {
      dimensionId: dimension.id,
      latestObservation,
      status: isWithinRange(latestObservation, today) ? "observedToday" : "stale",
    };
  });
}

export function buildTodayEnergyTimeline(
  observations: EnergyObservation[],
  date: Date = new Date(),
): EnergyTimelineGroup[] {
  const today = getLocalDayRange(date);

  return ENERGY_DIMENSIONS.map((dimension) => ({
    dimensionId: dimension.id,
    observations: sortByObservedAt(
      observations.filter(
        (observation) =>
          observation.dimensionId === dimension.id && isWithinRange(observation, today),
      ),
    ),
  }));
}

export function buildEnergyCompass(
  observations: EnergyObservation[],
  range: EnergyCompassRange,
  date: Date = new Date(),
): EnergyDimensionSummary[] {
  const dateRange = getCompassDateRange(range, date);

  return ENERGY_DIMENSIONS.map((dimension) => {
    const dimensionObservations = sortByObservedAt(
      observations.filter(
        (observation) =>
          observation.dimensionId === dimension.id &&
          isWithinRange(observation, dateRange),
      ),
    );
    const observationCount = dimensionObservations.length;
    const averageInternalScore =
      observationCount > 0
        ? dimensionObservations.reduce(
            (total, observation) => total + observation.internalScore,
            0,
          ) / observationCount
        : null;
    const latestObservation =
      observationCount > 0
        ? dimensionObservations[observationCount - 1] ?? null
        : null;

    return {
      dimensionId: dimension.id,
      observationCount,
      averageInternalScore,
      lowObservationCount: dimensionObservations.filter(
        (observation) => observation.internalScore <= -1,
      ).length,
      latestObservation,
      summaryLabel:
        averageInternalScore === null
          ? null
          : labelForNearestScore(dimension.id, averageInternalScore),
    };
  });
}

function latestForDimension(
  observations: EnergyObservation[],
  dimensionId: EnergyDimensionId,
): EnergyObservation | null {
  return sortByObservedAt(
    observations.filter((observation) => observation.dimensionId === dimensionId),
  ).at(-1) ?? null;
}

function sortByObservedAt(
  observations: EnergyObservation[],
): EnergyObservation[] {
  return [...observations].sort(
    (left, right) => observedTime(left) - observedTime(right),
  );
}

function isWithinRange(
  observation: EnergyObservation,
  range: LocalDateRange,
): boolean {
  const time = observedTime(observation);
  return time >= range.from.getTime() && time < range.to.getTime();
}

function observedTime(observation: EnergyObservation): number {
  return new Date(observation.observedAt).getTime();
}

function labelForNearestScore(
  dimensionId: EnergyDimensionId,
  averageInternalScore: number,
): string {
  const roundedScore = Math.max(-3, Math.min(3, Math.round(averageInternalScore)));
  const dimension = ENERGY_DIMENSIONS.find(
    (candidate) => candidate.id === dimensionId,
  );
  const value = dimension?.values.find(
    (candidate) => candidate.internalScore === roundedScore,
  );

  return value?.label ?? "";
}
