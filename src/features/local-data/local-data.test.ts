import { afterEach, describe, expect, it } from "vitest";
import type { ManualProfile, OnboardingAnswerRecord } from "@/types/lifeos";
import {
  clearLifeOSLocalData,
  createLifeOSLocalDatabase,
  readLifeOSLocalExportData,
  readLifeOSLocalData,
  readManualProfile,
  readOnboardingAnswerRecord,
  saveManualProfile,
  saveOnboardingAnswerRecord,
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
      questionId: "q1",
      type: "multi-select",
      selectedOptionIds: ["action"],
    },
    {
      questionId: "q9",
      type: "short-text",
      value: "慢慢来，但不要停。",
      skipped: false,
    },
  ],
};

const manualProfile: ManualProfile = {
  version: "1.0",
  selfClarity: "hazy",
  identifiedParameters: [
    {
      id: "energy-signal",
      label: "压力信号",
      values: ["行动力"],
      sourceQuestionIds: ["q1"],
    },
  ],
  pendingObservations: [
    {
      id: "low-energy-action",
      text: "你在压力状态下可能会先失去行动力。",
      status: "pending",
      sourceAnswerRefs: [{ questionId: "q1", optionId: "action" }],
    },
  ],
  suggestedSubsystems: [
    {
      id: "energy",
      label: "能量管理系统",
      reason: "压力信号和恢复方式都指向精力管理。",
      sourceAnswerRefs: [{ questionId: "q1", optionId: "action" }],
    },
  ],
  futureSelfNote: "慢慢来，但不要停。",
  editableSections: [
    {
      id: "homepage",
      title: "个人说明书首页",
      content: "先照顾能量，再推进事情。",
      source: "generated",
      updatedAt: "2026-05-18T08:00:00.000Z",
    },
  ],
};

describe("LifeOS local data storage", () => {
  it("returns an empty local data snapshot before anything is saved", async () => {
    const database = createTestDatabase();

    await expect(readOnboardingAnswerRecord(database)).resolves.toBeNull();
    await expect(readManualProfile(database)).resolves.toBeNull();
    await expect(readLifeOSLocalData(database)).resolves.toEqual({
      onboardingAnswer: null,
      manualProfile: null,
    });
  });

  it("saves and reads the current onboarding answer record", async () => {
    const database = createTestDatabase();

    await saveOnboardingAnswerRecord(database, onboardingAnswerRecord);

    await expect(readOnboardingAnswerRecord(database)).resolves.toEqual(
      onboardingAnswerRecord,
    );
  });

  it("saves and reads the current manual profile", async () => {
    const database = createTestDatabase();

    await saveManualProfile(database, manualProfile);

    await expect(readManualProfile(database)).resolves.toEqual(manualProfile);
  });

  it("clears all persisted LifeOS data", async () => {
    const database = createTestDatabase();
    await saveOnboardingAnswerRecord(database, onboardingAnswerRecord);
    await saveManualProfile(database, manualProfile);

    await clearLifeOSLocalData(database);

    await expect(readLifeOSLocalData(database)).resolves.toEqual({
      onboardingAnswer: null,
      manualProfile: null,
    });
  });

  it("builds export data from persisted LifeOS data", async () => {
    const database = createTestDatabase();
    await saveOnboardingAnswerRecord(database, onboardingAnswerRecord);
    await saveManualProfile(database, manualProfile);

    await expect(
      readLifeOSLocalExportData(database, "2026-05-18T09:00:00.000Z"),
    ).resolves.toEqual({
      exportedAt: "2026-05-18T09:00:00.000Z",
      onboardingAnswer: onboardingAnswerRecord,
      manualProfile,
    });
  });
});
