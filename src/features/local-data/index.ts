import Dexie, { type Table } from "dexie";
import type {
  LifeOSExportData,
  ManualProfile,
  OnboardingAnswerRecord,
} from "@/types/lifeos";

export const LIFEOS_LOCAL_DATABASE_NAME = "lifeos-v1";

const CURRENT_RECORD_ID = "current";

type StoredOnboardingAnswerRecord = {
  id: typeof CURRENT_RECORD_ID;
  value: OnboardingAnswerRecord;
  updatedAt: string;
};

type StoredManualProfile = {
  id: typeof CURRENT_RECORD_ID;
  value: ManualProfile;
  updatedAt: string;
};

export type LifeOSLocalDataSnapshot = Omit<LifeOSExportData, "exportedAt">;

export class LifeOSLocalDatabase extends Dexie {
  onboardingAnswers!: Table<StoredOnboardingAnswerRecord, string>;
  manualProfiles!: Table<StoredManualProfile, string>;

  constructor(databaseName = LIFEOS_LOCAL_DATABASE_NAME) {
    super(databaseName);

    this.version(1).stores({
      onboardingAnswers: "id, updatedAt",
      manualProfiles: "id, updatedAt",
    });
  }
}

export const createLifeOSLocalDatabase = (
  databaseName = LIFEOS_LOCAL_DATABASE_NAME,
): LifeOSLocalDatabase => new LifeOSLocalDatabase(databaseName);

export const lifeOSLocalDatabase = createLifeOSLocalDatabase();

const currentTimestamp = () => new Date().toISOString();

export const saveOnboardingAnswerRecord = async (
  database: LifeOSLocalDatabase,
  record: OnboardingAnswerRecord,
): Promise<void> => {
  await database.onboardingAnswers.put({
    id: CURRENT_RECORD_ID,
    value: record,
    updatedAt: currentTimestamp(),
  });
};

export const readOnboardingAnswerRecord = async (
  database: LifeOSLocalDatabase,
): Promise<OnboardingAnswerRecord | null> => {
  const storedRecord = await database.onboardingAnswers.get(CURRENT_RECORD_ID);
  return storedRecord?.value ?? null;
};

export const saveManualProfile = async (
  database: LifeOSLocalDatabase,
  profile: ManualProfile,
): Promise<void> => {
  await database.manualProfiles.put({
    id: CURRENT_RECORD_ID,
    value: profile,
    updatedAt: currentTimestamp(),
  });
};

export const readManualProfile = async (
  database: LifeOSLocalDatabase,
): Promise<ManualProfile | null> => {
  const storedProfile = await database.manualProfiles.get(CURRENT_RECORD_ID);
  return storedProfile?.value ?? null;
};

export const readLifeOSLocalData = async (
  database: LifeOSLocalDatabase,
): Promise<LifeOSLocalDataSnapshot> => ({
  onboardingAnswer: await readOnboardingAnswerRecord(database),
  manualProfile: await readManualProfile(database),
});

export const readLifeOSLocalExportData = async (
  database: LifeOSLocalDatabase,
  exportedAt = currentTimestamp(),
): Promise<LifeOSExportData> => ({
  exportedAt,
  ...(await readLifeOSLocalData(database)),
});

export const clearLifeOSLocalData = async (
  database: LifeOSLocalDatabase,
): Promise<void> => {
  await database.transaction(
    "rw",
    database.onboardingAnswers,
    database.manualProfiles,
    async () => {
      await database.onboardingAnswers.clear();
      await database.manualProfiles.clear();
    },
  );
};
