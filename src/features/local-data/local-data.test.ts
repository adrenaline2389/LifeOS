import { afterEach, describe, expect, it } from "vitest";
import type { OnboardingAnswerRecord, StartupScanProfile } from "@/types/lifeos";
import {
  clearLifeOSLocalData,
  createLifeOSLocalDatabase,
  readLifeOSLocalData,
  readOnboardingAnswerRecord,
  readStartupScanProfile,
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

    await clearLifeOSLocalData(database);

    await expect(readLifeOSLocalData(database)).resolves.toEqual({
      onboardingAnswer: null,
      startupScanProfile: null,
    });
  });
});
