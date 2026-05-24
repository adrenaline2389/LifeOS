import { afterEach, describe, expect, it } from "vitest";
import type {
  EcosystemObservation,
  OnboardingAnswerRecord,
  StartupScanProfile,
} from "@/types/lifeos";
import {
  clearLifeOSLocalData,
  createLifeOSLocalDatabase,
  deleteEcosystemObservation,
  readEcosystemObservations,
  readLifeOSLocalData,
  readOnboardingAnswerRecord,
  readStartupScanProfile,
  saveEcosystemObservation,
  saveOnboardingAnswerRecord,
  saveStartupScanProfile,
} from "./index";

const testDatabases: Array<ReturnType<typeof createLifeOSLocalDatabase>> = [];
let databaseCounter = 0;

const createTestDatabase = () => {
  databaseCounter += 1;
  const database = createLifeOSLocalDatabase(
    `lifeos-local-data-test-${databaseCounter}`,
  );
  testDatabases.push(database);
  return database;
};

afterEach(async () => {
  await Promise.all(
    testDatabases.map(async (database) => {
      database.close();
      await database.delete();
    }),
  );
  testDatabases.length = 0;
});

const onboardingAnswerRecord: OnboardingAnswerRecord = {
  completedAt: "2026-05-18T08:00:00.000Z",
  answers: [
    {
      questionId: "q1-state-decline-signal",
      type: "multi-select",
      selectedOptionIds: ["q1-sleep"],
    },
    {
      questionId: "q9-future-self-note",
      type: "short-text",
      value: "慢慢来，但不要停。",
      skipped: false,
    },
  ],
};

const startupScanProfile: StartupScanProfile = {
  version: "1.1",
  completedAt: "2026-05-18T08:00:00.000Z",
  scanStatus: "completed",
  scanClues: [
    {
      id: "state-recovery-scan",
      text: "初始扫描记录了睡眠这个信号。",
      sourceAnswerRefs: [
        { questionId: "q1-state-decline-signal", optionId: "q1-sleep" },
      ],
    },
  ],
  suggestedSubsystems: [
    {
      id: "ecosystem",
      label: "个人生态系统",
      reason: "你的回答提到了「睡眠」，可以先看个人生态系统。",
      sourceAnswerRefs: [
        { questionId: "q1-state-decline-signal", optionId: "q1-sleep" },
      ],
    },
  ],
};

const ecosystemObservation = (
  overrides: Partial<EcosystemObservation> = {},
): EcosystemObservation => ({
  id: "observation-1",
  dimensionId: "sleepRecovery",
  valueId: "short",
  valueLabel: "偏少",
  internalScore: -1,
  observedAt: "2026-05-18T08:30:00.000Z",
  ...overrides,
});

describe("LifeOS local data storage", () => {
  it("returns an empty local data snapshot before anything is saved", async () => {
    const database = createTestDatabase();

    await expect(readOnboardingAnswerRecord(database)).resolves.toBeNull();
    await expect(readStartupScanProfile(database)).resolves.toBeNull();
    await expect(readLifeOSLocalData(database)).resolves.toEqual({
      onboardingAnswer: null,
      startupScanProfile: null,
    });
  });

  it("saves and reads the current onboarding answer record", async () => {
    const database = createTestDatabase();

    await saveOnboardingAnswerRecord(database, onboardingAnswerRecord);

    await expect(readOnboardingAnswerRecord(database)).resolves.toEqual(
      onboardingAnswerRecord,
    );
  });

  it("saves and reads the current startup scan profile", async () => {
    const database = createTestDatabase();

    await saveStartupScanProfile(database, startupScanProfile);

    await expect(readStartupScanProfile(database)).resolves.toEqual(
      startupScanProfile,
    );
  });

  it("clears all persisted LifeOS data", async () => {
    const database = createTestDatabase();
    await saveOnboardingAnswerRecord(database, onboardingAnswerRecord);
    await saveStartupScanProfile(database, startupScanProfile);
    await saveEcosystemObservation(database, ecosystemObservation());

    await clearLifeOSLocalData(database);

    await expect(readLifeOSLocalData(database)).resolves.toEqual({
      onboardingAnswer: null,
      startupScanProfile: null,
    });
    await expect(readEcosystemObservations(database)).resolves.toEqual([]);
  });

  it("saves ecosystem observations with semantic snapshots", async () => {
    const database = createTestDatabase();
    const observation = ecosystemObservation({
      valueLabel: "几乎没睡",
      internalScore: -3,
      note: "醒来以后还是很困。",
    });

    await saveEcosystemObservation(database, observation);

    await expect(readEcosystemObservations(database)).resolves.toEqual([
      observation,
    ]);
  });

  it("deletes an ecosystem observation by id", async () => {
    const database = createTestDatabase();
    const deletedObservation = ecosystemObservation({ id: "mistaken-tap" });
    const keptObservation = ecosystemObservation({
      id: "kept-observation",
      dimensionId: "environmentSupport",
      valueId: "clear",
      valueLabel: "清爽",
      internalScore: 3,
    });

    await saveEcosystemObservation(database, deletedObservation);
    await saveEcosystemObservation(database, keptObservation);

    await deleteEcosystemObservation(database, "mistaken-tap");

    await expect(readEcosystemObservations(database)).resolves.toEqual([
      keptObservation,
    ]);
  });

  it("overwrites an ecosystem observation when the same id is saved again", async () => {
    const database = createTestDatabase();
    const firstObservation = ecosystemObservation({
      id: "same-entry-sleep",
      valueId: "enough",
      valueLabel: "够用",
      internalScore: 2,
      observedAt: "2026-05-18T08:30:00.000Z",
    });
    const overwrittenObservation = ecosystemObservation({
      id: "same-entry-sleep",
      valueId: "sleepless",
      valueLabel: "几乎没睡",
      internalScore: -3,
      observedAt: "2026-05-18T08:35:00.000Z",
    });

    await saveEcosystemObservation(database, firstObservation);
    await saveEcosystemObservation(database, overwrittenObservation);

    await expect(readEcosystemObservations(database)).resolves.toEqual([
      overwrittenObservation,
    ]);
  });

  it("reads ecosystem observations by observed time range", async () => {
    const database = createTestDatabase();
    const previousDay = ecosystemObservation({
      id: "previous-day",
      observedAt: "2026-05-17T23:30:00.000Z",
    });
    const morning = ecosystemObservation({
      id: "morning",
      observedAt: "2026-05-18T08:30:00.000Z",
    });
    const evening = ecosystemObservation({
      id: "evening",
      dimensionId: "environmentSupport",
      valueId: "clear",
      valueLabel: "清爽",
      internalScore: 3,
      observedAt: "2026-05-18T22:00:00.000Z",
    });
    const nextDay = ecosystemObservation({
      id: "next-day",
      observedAt: "2026-05-19T00:10:00.000Z",
    });

    await saveEcosystemObservation(database, nextDay);
    await saveEcosystemObservation(database, evening);
    await saveEcosystemObservation(database, previousDay);
    await saveEcosystemObservation(database, morning);

    await expect(
      readEcosystemObservations(database, {
        from: "2026-05-18T00:00:00.000Z",
        to: "2026-05-19T00:00:00.000Z",
      }),
    ).resolves.toEqual([morning, evening]);
    await expect(readEcosystemObservations(database)).resolves.toEqual([
      previousDay,
      morning,
      evening,
      nextDay,
    ]);
  });

  it("keeps ecosystem observations out of the app shell local data snapshot", async () => {
    const database = createTestDatabase();
    await saveEcosystemObservation(database, ecosystemObservation());

    await expect(readLifeOSLocalData(database)).resolves.toEqual({
      onboardingAnswer: null,
      startupScanProfile: null,
    });
  });
});
