import Dexie, { type Table } from "dexie";
import type {
  OnboardingAnswerRecord,
  StartupScanProfile,
} from "@/types/lifeos";

export const LIFEOS_LOCAL_DATABASE_NAME = "lifeos-v1";

const CURRENT_RECORD_ID = "current";

type StoredOnboardingAnswerRecord = {
  id: typeof CURRENT_RECORD_ID;
  value: OnboardingAnswerRecord;
  updatedAt: string;
};

type StoredStartupScanProfile = {
  id: typeof CURRENT_RECORD_ID;
  value: StartupScanProfile;
  updatedAt: string;
};

export type LifeOSLocalDataSnapshot = {
  onboardingAnswer: OnboardingAnswerRecord | null;
  startupScanProfile: StartupScanProfile | null;
};

export class LifeOSLocalDatabase extends Dexie {
  onboardingAnswers!: Table<StoredOnboardingAnswerRecord, string>;
  startupScanProfiles!: Table<StoredStartupScanProfile, string>;

  constructor(databaseName = LIFEOS_LOCAL_DATABASE_NAME) {
    super(databaseName);

    this.version(1).stores({
      onboardingAnswers: "id, updatedAt",
      manualProfiles: "id, updatedAt",
    });
    this.version(2).stores({
      onboardingAnswers: "id, updatedAt",
      manualProfiles: null,
      startupScanProfiles: "id, updatedAt",
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

export const saveStartupScanProfile = async (
  database: LifeOSLocalDatabase,
  profile: StartupScanProfile,
): Promise<void> => {
  await database.startupScanProfiles.put({
    id: CURRENT_RECORD_ID,
    value: profile,
    updatedAt: currentTimestamp(),
  });
};

export const readStartupScanProfile = async (
  database: LifeOSLocalDatabase,
): Promise<StartupScanProfile | null> => {
  const storedProfile = await database.startupScanProfiles.get(CURRENT_RECORD_ID);
  return storedProfile?.value ?? null;
};

export const readLifeOSLocalData = async (
  database: LifeOSLocalDatabase,
): Promise<LifeOSLocalDataSnapshot> => ({
  onboardingAnswer: await readOnboardingAnswerRecord(database),
  startupScanProfile: await readStartupScanProfile(database),
});

export const clearLifeOSLocalData = async (
  database: LifeOSLocalDatabase,
): Promise<void> => {
  await database.transaction(
    "rw",
    database.onboardingAnswers,
    database.startupScanProfiles,
    async () => {
      await database.onboardingAnswers.clear();
      await database.startupScanProfiles.clear();
    },
  );
};
