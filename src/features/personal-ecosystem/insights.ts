import type {
  EcosystemBarometerRange,
  EcosystemDimensionId,
  EcosystemDimensionSummary,
  EcosystemObservation,
} from "@/types/lifeos";

import { ECOSYSTEM_DIMENSIONS } from "./dimensions";

export type LocalDateRange = {
  from: Date;
  to: Date;
};

export type EcosystemCurrentStateStatus =
  | "observedToday"
  | "stale"
  | "neverObserved";

export type EcosystemCurrentDimensionState = {
  dimensionId: EcosystemDimensionId;
  latestObservation: EcosystemObservation | null;
  status: EcosystemCurrentStateStatus;
};

export type EcosystemTimelineGroup = {
  dimensionId: EcosystemDimensionId;
  observations: EcosystemObservation[];
};

const RANGE_DAYS: Record<EcosystemBarometerRange, number> = {
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

export function getBarometerDateRange(
  range: EcosystemBarometerRange,
  date: Date = new Date(),
): LocalDateRange {
  const today = getLocalDayRange(date);
  const from = new Date(today.from);
  from.setDate(from.getDate() - (RANGE_DAYS[range] - 1));

  return {
    from,
    to: today.to,
  };
}

export function buildEcosystemCurrentState(
  observations: EcosystemObservation[],
  date: Date = new Date(),
): EcosystemCurrentDimensionState[] {
  const today = getLocalDayRange(date);

  return ECOSYSTEM_DIMENSIONS.map((dimension) => {
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

export function buildTodayEcosystemTimeline(
  observations: EcosystemObservation[],
  date: Date = new Date(),
): EcosystemTimelineGroup[] {
  const today = getLocalDayRange(date);

  return ECOSYSTEM_DIMENSIONS.map((dimension) => ({
    dimensionId: dimension.id,
    observations: sortByObservedAt(
      observations.filter(
        (observation) =>
          observation.dimensionId === dimension.id && isWithinRange(observation, today),
      ),
    ),
  }));
}

export function buildEcosystemBarometer(
  observations: EcosystemObservation[],
  range: EcosystemBarometerRange,
  date: Date = new Date(),
): EcosystemDimensionSummary[] {
  const dateRange = getBarometerDateRange(range, date);

  return ECOSYSTEM_DIMENSIONS.map((dimension) => {
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
  observations: EcosystemObservation[],
  dimensionId: EcosystemDimensionId,
): EcosystemObservation | null {
  return sortByObservedAt(
    observations.filter((observation) => observation.dimensionId === dimensionId),
  ).at(-1) ?? null;
}

function sortByObservedAt(
  observations: EcosystemObservation[],
): EcosystemObservation[] {
  return [...observations].sort(
    (left, right) => observedTime(left) - observedTime(right),
  );
}

function isWithinRange(
  observation: EcosystemObservation,
  range: LocalDateRange,
): boolean {
  const time = observedTime(observation);
  return time >= range.from.getTime() && time < range.to.getTime();
}

function observedTime(observation: EcosystemObservation): number {
  return new Date(observation.observedAt).getTime();
}

function labelForNearestScore(
  dimensionId: EcosystemDimensionId,
  averageInternalScore: number,
): string {
  const roundedScore = Math.max(-3, Math.min(3, Math.round(averageInternalScore)));
  const dimension = ECOSYSTEM_DIMENSIONS.find(
    (candidate) => candidate.id === dimensionId,
  );
  const value = dimension?.values.find(
    (candidate) => candidate.internalScore === roundedScore,
  );

  return value?.label ?? "";
}
