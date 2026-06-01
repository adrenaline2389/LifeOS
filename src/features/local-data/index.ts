import Dexie, { type Table } from "dexie";
import type {
  EcosystemObservation,
  EnergyObservation,
  MoneyInflowSource,
  OnboardingAnswerRecord,
  StartupScanProfile,
  WalletContainer,
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

type StoredEcosystemObservation = EcosystemObservation & {
  updatedAt: string;
};

type StoredEnergyObservation = EnergyObservation & {
  updatedAt: string;
};

type StoredWalletContainer = WalletContainer;

type StoredMoneyInflowSource = MoneyInflowSource;

export type LifeOSLocalDataSnapshot = {
  onboardingAnswer: OnboardingAnswerRecord | null;
  startupScanProfile: StartupScanProfile | null;
};

export type EcosystemObservationRange = {
  from?: string;
  to?: string;
};

export type EnergyObservationRange = {
  from?: string;
  to?: string;
};

export class LifeOSLocalDatabase extends Dexie {
  onboardingAnswers!: Table<StoredOnboardingAnswerRecord, string>;
  startupScanProfiles!: Table<StoredStartupScanProfile, string>;
  ecosystemObservations!: Table<StoredEcosystemObservation, string>;
  energyObservations!: Table<StoredEnergyObservation, string>;
  walletContainers!: Table<StoredWalletContainer, string>;
  moneyInflowSources!: Table<StoredMoneyInflowSource, string>;

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
    this.version(3).stores({
      onboardingAnswers: "id, updatedAt",
      startupScanProfiles: "id, updatedAt",
      ecosystemObservations: "id, observedAt, dimensionId, updatedAt",
    });
    this.version(4).stores({
      onboardingAnswers: "id, updatedAt",
      startupScanProfiles: "id, updatedAt",
      ecosystemObservations: "id, observedAt, dimensionId, updatedAt",
      energyObservations: "id, observedAt, dimensionId, updatedAt",
    });
    this.version(5).stores({
      onboardingAnswers: "id, updatedAt",
      startupScanProfiles: "id, updatedAt",
      ecosystemObservations: "id, observedAt, dimensionId, updatedAt",
      energyObservations: "id, observedAt, dimensionId, updatedAt",
      walletContainers: "id, createdAt, updatedAt",
    });
    this.version(6).stores({
      onboardingAnswers: "id, updatedAt",
      startupScanProfiles: "id, updatedAt",
      ecosystemObservations: "id, observedAt, dimensionId, updatedAt",
      energyObservations: "id, observedAt, dimensionId, updatedAt",
      walletContainers: "id, createdAt, updatedAt",
      moneyInflowSources: "id, createdAt, updatedAt, targetWalletContainerId",
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

export const saveEcosystemObservation = async (
  database: LifeOSLocalDatabase,
  observation: EcosystemObservation,
): Promise<void> => {
  await database.ecosystemObservations.put({
    ...observation,
    updatedAt: currentTimestamp(),
  });
};

export const deleteEcosystemObservation = async (
  database: LifeOSLocalDatabase,
  observationId: string,
): Promise<void> => {
  await database.ecosystemObservations.delete(observationId);
};

export const readEcosystemObservations = async (
  database: LifeOSLocalDatabase,
  range: EcosystemObservationRange = {},
): Promise<EcosystemObservation[]> => {
  const observations = await database.ecosystemObservations
    .orderBy("observedAt")
    .toArray();

  return observations
    .filter((observation) => {
      if (range.from && observation.observedAt < range.from) {
        return false;
      }

      if (range.to && observation.observedAt >= range.to) {
        return false;
      }

      return true;
    })
    .map((observation) => ({
      id: observation.id,
      dimensionId: observation.dimensionId,
      valueId: observation.valueId,
      valueLabel: observation.valueLabel,
      internalScore: observation.internalScore,
      observedAt: observation.observedAt,
      ...(observation.note ? { note: observation.note } : {}),
    }));
};

export const saveEnergyObservation = async (
  database: LifeOSLocalDatabase,
  observation: EnergyObservation,
): Promise<void> => {
  await database.energyObservations.put({
    ...observation,
    updatedAt: currentTimestamp(),
  });
};

export const deleteEnergyObservation = async (
  database: LifeOSLocalDatabase,
  observationId: string,
): Promise<void> => {
  await database.energyObservations.delete(observationId);
};

export const readEnergyObservations = async (
  database: LifeOSLocalDatabase,
  range: EnergyObservationRange = {},
): Promise<EnergyObservation[]> => {
  const observations = await database.energyObservations
    .orderBy("observedAt")
    .toArray();

  return observations
    .filter((observation) => {
      if (range.from && observation.observedAt < range.from) {
        return false;
      }

      if (range.to && observation.observedAt >= range.to) {
        return false;
      }

      return true;
    })
    .map((observation) => ({
      id: observation.id,
      dimensionId: observation.dimensionId,
      valueId: observation.valueId,
      valueLabel: observation.valueLabel,
      internalScore: observation.internalScore,
      observedAt: observation.observedAt,
      ...(observation.note ? { note: observation.note } : {}),
    }));
};

export const saveWalletContainer = async (
  database: LifeOSLocalDatabase,
  container: WalletContainer,
): Promise<void> => {
  await database.walletContainers.put(container);
};

export const deleteWalletContainer = async (
  database: LifeOSLocalDatabase,
  containerId: string,
): Promise<void> => {
  await database.walletContainers.delete(containerId);
};

export const readWalletContainers = async (
  database: LifeOSLocalDatabase,
): Promise<WalletContainer[]> => {
  const containers = await database.walletContainers.orderBy("createdAt").toArray();

  return containers.map((container) => ({
    id: container.id,
    name: container.name,
    balance: container.balance,
    color: container.color,
    ...(container.note ? { note: container.note } : {}),
    createdAt: container.createdAt,
    updatedAt: container.updatedAt,
  }));
};

export const saveMoneyInflowSource = async (
  database: LifeOSLocalDatabase,
  source: MoneyInflowSource,
): Promise<void> => {
  await database.moneyInflowSources.put(source);
};

export const deleteMoneyInflowSource = async (
  database: LifeOSLocalDatabase,
  sourceId: string,
): Promise<void> => {
  await database.moneyInflowSources.delete(sourceId);
};

export const readMoneyInflowSources = async (
  database: LifeOSLocalDatabase,
): Promise<MoneyInflowSource[]> => {
  const sources = await database.moneyInflowSources.orderBy("createdAt").toArray();

  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    amountPattern: source.amountPattern,
    frequencyPattern: source.frequencyPattern,
    targetWalletContainerId: source.targetWalletContainerId,
    ...(source.note ? { note: source.note } : {}),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  }));
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
    [
      database.onboardingAnswers,
      database.startupScanProfiles,
      database.ecosystemObservations,
      database.energyObservations,
      database.walletContainers,
      database.moneyInflowSources,
    ],
    async () => {
      await database.onboardingAnswers.clear();
      await database.startupScanProfiles.clear();
      await database.ecosystemObservations.clear();
      await database.energyObservations.clear();
      await database.walletContainers.clear();
      await database.moneyInflowSources.clear();
    },
  );
};
