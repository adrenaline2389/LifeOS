import { afterEach, describe, expect, it } from "vitest";
import type {
  DailyExpenseEntry,
  DailyExpensePool,
  EcosystemObservation,
  EnergyObservation,
  MoneyInflowSource,
  OnboardingAnswerRecord,
  StartupScanProfile,
  WalletContainer,
  WealthFlowEvent,
} from "@/types/lifeos";
import {
  clearWealthFlowEvents,
  clearLifeOSLocalData,
  createLifeOSLocalDatabase,
  deleteEcosystemObservation,
  deleteEnergyObservation,
  deleteDailyExpenseEntry,
  deleteMoneyInflowSource,
  deleteWalletContainer,
  readDailyExpenseEntries,
  readDailyExpensePool,
  readEcosystemObservations,
  readEnergyObservations,
  readLifeOSLocalData,
  readMoneyInflowSources,
  readOnboardingAnswerRecord,
  readStartupScanProfile,
  readWalletContainers,
  readWealthFlowEvents,
  saveEcosystemObservation,
  saveEnergyObservation,
  saveDailyExpenseEntry,
  saveDailyExpensePool,
  saveMoneyInflowSource,
  saveOnboardingAnswerRecord,
  saveStartupScanProfile,
  saveWalletContainer,
  saveWealthFlowEvent,
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

const energyObservation = (
  overrides: Partial<EnergyObservation> = {},
): EnergyObservation => ({
  id: "energy-observation-1",
  dimensionId: "currentCapacity",
  valueId: "enough",
  valueLabel: "有余量",
  internalScore: 2,
  observedAt: "2026-05-18T09:00:00.000Z",
  ...overrides,
});

const walletContainer = (
  overrides: Partial<WalletContainer> = {},
): WalletContainer => ({
  id: "wallet-container-1",
  name: "日常账户",
  balance: 1280.5,
  color: "#5b8def",
  createdAt: "2026-05-20T08:00:00.000Z",
  updatedAt: "2026-05-20T08:00:00.000Z",
  ...overrides,
});

const moneyInflowSource = (
  overrides: Partial<MoneyInflowSource> = {},
): MoneyInflowSource => ({
  id: "salary-source",
  name: "固定工资",
  amountPattern: {
    kind: "fixed",
    amount: 12000,
  },
  frequencyPattern: {
    kind: "fixed",
    interval: "monthly",
  },
  targetWalletContainerId: "wallet-container-1",
  createdAt: "2026-05-21T08:00:00.000Z",
  updatedAt: "2026-05-21T08:00:00.000Z",
  ...overrides,
});

const dailyExpensePool = (
  overrides: Partial<DailyExpensePool> = {},
): DailyExpensePool => ({
  id: "default",
  balance: 800,
  selectedWalletContainerId: "wallet-container-1",
  lastTransferAmount: 1200,
  lastTransferAt: "2026-06-02T08:00:00.000Z",
  lastTransferWalletContainerId: "wallet-container-1",
  lastTransferWalletContainerNameSnapshot: "日常账户",
  createdAt: "2026-06-02T08:00:00.000Z",
  updatedAt: "2026-06-02T08:00:00.000Z",
  ...overrides,
});

const dailyExpenseEntry = (
  overrides: Partial<DailyExpenseEntry> = {},
): DailyExpenseEntry => ({
  id: "daily-expense-entry-1",
  amount: 68,
  note: "早餐和交通",
  spentAt: "2026-06-02T09:30:00.000Z",
  createdAt: "2026-06-02T09:30:00.000Z",
  updatedAt: "2026-06-02T09:30:00.000Z",
  ...overrides,
});

const wealthFlowEvent = (
  overrides: Partial<WealthFlowEvent> = {},
): WealthFlowEvent => ({
  id: "wealth-flow-event-1",
  type: "daily_expense_spent",
  direction: "out",
  amount: 68,
  occurredAt: "2026-06-02T09:30:00.000Z",
  source: {
    type: "daily_expense_pool",
    id: "default",
    nameSnapshot: "日常开销池",
  },
  relatedDailyExpenseEntryId: "daily-expense-entry-1",
  note: "早餐和交通",
  createdAt: "2026-06-02T09:30:00.000Z",
  updatedAt: "2026-06-02T09:30:00.000Z",
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
    await saveEnergyObservation(database, energyObservation());
    await saveWalletContainer(database, walletContainer());
    await saveMoneyInflowSource(database, moneyInflowSource());
    await saveDailyExpensePool(database, dailyExpensePool());
    await saveDailyExpenseEntry(database, dailyExpenseEntry());
    await saveWealthFlowEvent(database, wealthFlowEvent());

    await clearLifeOSLocalData(database);

    await expect(readLifeOSLocalData(database)).resolves.toEqual({
      onboardingAnswer: null,
      startupScanProfile: null,
    });
    await expect(readEcosystemObservations(database)).resolves.toEqual([]);
    await expect(readEnergyObservations(database)).resolves.toEqual([]);
    await expect(readWalletContainers(database)).resolves.toEqual([]);
    await expect(readMoneyInflowSources(database)).resolves.toEqual([]);
    await expect(readDailyExpensePool(database)).resolves.toBeNull();
    await expect(readDailyExpenseEntries(database)).resolves.toEqual([]);
    await expect(readWealthFlowEvents(database)).resolves.toEqual([]);
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

  it("saves energy observations with semantic snapshots", async () => {
    const database = createTestDatabase();
    const observation = energyObservation({
      valueLabel: "大脑宕机",
      internalScore: -3,
      note: "会议之后有点转不动。",
    });

    await saveEnergyObservation(database, observation);

    await expect(readEnergyObservations(database)).resolves.toEqual([
      observation,
    ]);
  });

  it("overwrites an energy observation when the same id is saved again", async () => {
    const database = createTestDatabase();
    const firstObservation = energyObservation({
      id: "same-entry-current-capacity",
      valueId: "enough",
      valueLabel: "有余量",
      internalScore: 2,
      observedAt: "2026-05-18T09:00:00.000Z",
    });
    const overwrittenObservation = energyObservation({
      id: "same-entry-current-capacity",
      valueId: "empty",
      valueLabel: "完全没电",
      internalScore: -3,
      observedAt: "2026-05-18T09:05:00.000Z",
    });

    await saveEnergyObservation(database, firstObservation);
    await saveEnergyObservation(database, overwrittenObservation);

    await expect(readEnergyObservations(database)).resolves.toEqual([
      overwrittenObservation,
    ]);
  });

  it("deletes an energy observation by id", async () => {
    const database = createTestDatabase();
    const deletedObservation = energyObservation({ id: "mistaken-energy-tap" });
    const keptObservation = energyObservation({
      id: "kept-energy-observation",
      dimensionId: "attentionBandwidth",
      valueId: "focused",
      valueLabel: "能聚焦",
      internalScore: 3,
    });

    await saveEnergyObservation(database, deletedObservation);
    await saveEnergyObservation(database, keptObservation);

    await deleteEnergyObservation(database, "mistaken-energy-tap");

    await expect(readEnergyObservations(database)).resolves.toEqual([
      keptObservation,
    ]);
  });

  it("reads energy observations by observed time range", async () => {
    const database = createTestDatabase();
    const previousDay = energyObservation({
      id: "previous-energy-day",
      observedAt: "2026-05-17T23:30:00.000Z",
    });
    const rangeStart = energyObservation({
      id: "range-start",
      observedAt: "2026-05-18T00:00:00.000Z",
    });
    const evening = energyObservation({
      id: "energy-evening",
      dimensionId: "socialBattery",
      valueId: "quiet",
      valueLabel: "想安静",
      internalScore: -1,
      observedAt: "2026-05-18T22:00:00.000Z",
    });
    const rangeEnd = energyObservation({
      id: "range-end",
      observedAt: "2026-05-19T00:00:00.000Z",
    });

    await saveEnergyObservation(database, rangeEnd);
    await saveEnergyObservation(database, evening);
    await saveEnergyObservation(database, previousDay);
    await saveEnergyObservation(database, rangeStart);

    await expect(
      readEnergyObservations(database, {
        from: "2026-05-18T00:00:00.000Z",
        to: "2026-05-19T00:00:00.000Z",
      }),
    ).resolves.toEqual([rangeStart, evening]);
    await expect(readEnergyObservations(database)).resolves.toEqual([
      previousDay,
      rangeStart,
      evening,
      rangeEnd,
    ]);
  });

  it("keeps energy observations out of the app shell local data snapshot", async () => {
    const database = createTestDatabase();
    await saveEnergyObservation(database, energyObservation());

    await expect(readLifeOSLocalData(database)).resolves.toEqual({
      onboardingAnswer: null,
      startupScanProfile: null,
    });
  });

  it("keeps historical energy observations when querying from a new local day", async () => {
    const database = createTestDatabase();
    const yesterday = energyObservation({
      id: "energy-yesterday",
      observedAt: "2026-05-18T22:30:00.000Z",
    });
    const today = energyObservation({
      id: "energy-today",
      observedAt: "2026-05-19T07:30:00.000Z",
    });

    await saveEnergyObservation(database, yesterday);
    await saveEnergyObservation(database, today);

    await expect(
      readEnergyObservations(database, {
        from: "2026-05-19T00:00:00.000Z",
      }),
    ).resolves.toEqual([today]);
    await expect(readEnergyObservations(database)).resolves.toEqual([
      yesterday,
      today,
    ]);
  });

  it("saves and reads wallet containers", async () => {
    const database = createTestDatabase();
    const container = walletContainer({
      note: "本地手动余额快照。",
    });

    await saveWalletContainer(database, container);

    await expect(readWalletContainers(database)).resolves.toEqual([container]);
  });

  it("overwrites a wallet container when the same id is saved again", async () => {
    const database = createTestDatabase();
    const firstContainer = walletContainer({
      id: "same-wallet-container",
      name: "旧名称",
      balance: 200,
      updatedAt: "2026-05-20T08:00:00.000Z",
    });
    const overwrittenContainer = walletContainer({
      id: "same-wallet-container",
      name: "新名称",
      balance: 350.75,
      color: "#f97316",
      updatedAt: "2026-05-20T09:00:00.000Z",
    });

    await saveWalletContainer(database, firstContainer);
    await saveWalletContainer(database, overwrittenContainer);

    await expect(readWalletContainers(database)).resolves.toEqual([
      overwrittenContainer,
    ]);
  });

  it("reads all wallet containers ordered by creation time", async () => {
    const database = createTestDatabase();
    const secondContainer = walletContainer({
      id: "second-wallet-container",
      name: "第二个账户",
      createdAt: "2026-05-20T09:00:00.000Z",
      updatedAt: "2026-05-20T09:00:00.000Z",
    });
    const firstContainer = walletContainer({
      id: "first-wallet-container",
      name: "第一个账户",
      createdAt: "2026-05-20T08:00:00.000Z",
      updatedAt: "2026-05-20T08:00:00.000Z",
    });

    await saveWalletContainer(database, secondContainer);
    await saveWalletContainer(database, firstContainer);

    await expect(readWalletContainers(database)).resolves.toEqual([
      firstContainer,
      secondContainer,
    ]);
  });

  it("deletes a wallet container by id", async () => {
    const database = createTestDatabase();
    const deletedContainer = walletContainer({ id: "wallet-to-delete" });
    const keptContainer = walletContainer({
      id: "wallet-to-keep",
      name: "保留账户",
    });

    await saveWalletContainer(database, deletedContainer);
    await saveWalletContainer(database, keptContainer);

    await deleteWalletContainer(database, "wallet-to-delete");

    await expect(readWalletContainers(database)).resolves.toEqual([
      keptContainer,
    ]);
  });

  it("preserves negative wallet container balances", async () => {
    const database = createTestDatabase();
    const debtContainer = walletContainer({
      id: "credit-card-debt",
      name: "信用卡当前余额",
      balance: -421.35,
    });

    await saveWalletContainer(database, debtContainer);

    await expect(readWalletContainers(database)).resolves.toEqual([
      debtContainer,
    ]);
  });

  it("saves and reads money inflow sources", async () => {
    const database = createTestDatabase();
    const source = moneyInflowSource({
      note: "每月手动确认到账。",
    });

    await saveMoneyInflowSource(database, source);

    await expect(readMoneyInflowSources(database)).resolves.toEqual([source]);
  });

  it("overwrites a money inflow source when the same id is saved again", async () => {
    const database = createTestDatabase();
    const firstSource = moneyInflowSource({
      id: "same-income-source",
      name: "旧来源",
      updatedAt: "2026-05-21T08:00:00.000Z",
    });
    const overwrittenSource = moneyInflowSource({
      id: "same-income-source",
      name: "新来源",
      amountPattern: {
        kind: "fixed",
        amount: 16000,
      },
      updatedAt: "2026-05-21T09:00:00.000Z",
    });

    await saveMoneyInflowSource(database, firstSource);
    await saveMoneyInflowSource(database, overwrittenSource);

    await expect(readMoneyInflowSources(database)).resolves.toEqual([
      overwrittenSource,
    ]);
  });

  it("reads all money inflow sources ordered by creation time", async () => {
    const database = createTestDatabase();
    const secondSource = moneyInflowSource({
      id: "second-income-source",
      name: "第二个来源",
      createdAt: "2026-05-21T09:00:00.000Z",
      updatedAt: "2026-05-21T09:00:00.000Z",
    });
    const firstSource = moneyInflowSource({
      id: "first-income-source",
      name: "第一个来源",
      createdAt: "2026-05-21T08:00:00.000Z",
      updatedAt: "2026-05-21T08:00:00.000Z",
    });

    await saveMoneyInflowSource(database, secondSource);
    await saveMoneyInflowSource(database, firstSource);

    await expect(readMoneyInflowSources(database)).resolves.toEqual([
      firstSource,
      secondSource,
    ]);
  });

  it("deletes a money inflow source by id", async () => {
    const database = createTestDatabase();
    const deletedSource = moneyInflowSource({ id: "income-source-to-delete" });
    const keptSource = moneyInflowSource({
      id: "income-source-to-keep",
      name: "保留收入来源",
    });

    await saveMoneyInflowSource(database, deletedSource);
    await saveMoneyInflowSource(database, keptSource);

    await deleteMoneyInflowSource(database, "income-source-to-delete");

    await expect(readMoneyInflowSources(database)).resolves.toEqual([
      keptSource,
    ]);
  });

  it("saves and reads variable amount money inflow sources", async () => {
    const database = createTestDatabase();
    const source = moneyInflowSource({
      id: "variable-amount-source",
      name: "平台收入",
      amountPattern: {
        kind: "variable",
      },
    });

    await saveMoneyInflowSource(database, source);

    await expect(readMoneyInflowSources(database)).resolves.toEqual([source]);
  });

  it("saves and reads variable frequency money inflow sources", async () => {
    const database = createTestDatabase();
    const source = moneyInflowSource({
      id: "variable-frequency-source",
      name: "临时项目",
      frequencyPattern: {
        kind: "variable",
      },
    });

    await saveMoneyInflowSource(database, source);

    await expect(readMoneyInflowSources(database)).resolves.toEqual([source]);
  });

  it("saves and reads the daily expense pool", async () => {
    const database = createTestDatabase();
    const pool = dailyExpensePool();

    await saveDailyExpensePool(database, pool);

    await expect(readDailyExpensePool(database)).resolves.toEqual(pool);
  });

  it("overwrites the daily expense pool when the default id is saved again", async () => {
    const database = createTestDatabase();
    const firstPool = dailyExpensePool({
      balance: 800,
      updatedAt: "2026-06-02T08:00:00.000Z",
    });
    const overwrittenPool = dailyExpensePool({
      balance: 620,
      lastTransferAmount: 500,
      updatedAt: "2026-06-02T12:00:00.000Z",
    });

    await saveDailyExpensePool(database, firstPool);
    await saveDailyExpensePool(database, overwrittenPool);

    await expect(readDailyExpensePool(database)).resolves.toEqual(overwrittenPool);
  });

  it("saves and reads daily expense entries ordered by spent time", async () => {
    const database = createTestDatabase();
    const secondEntry = dailyExpenseEntry({
      id: "second-expense-entry",
      amount: 88,
      note: "周二",
      spentAt: "2026-06-03T20:00:00.000Z",
      createdAt: "2026-06-03T20:00:00.000Z",
      updatedAt: "2026-06-03T20:00:00.000Z",
    });
    const firstEntry = dailyExpenseEntry({
      id: "first-expense-entry",
      amount: 42,
      note: "周一",
      spentAt: "2026-06-02T20:00:00.000Z",
      createdAt: "2026-06-02T20:00:00.000Z",
      updatedAt: "2026-06-02T20:00:00.000Z",
    });

    await saveDailyExpenseEntry(database, secondEntry);
    await saveDailyExpenseEntry(database, firstEntry);

    await expect(readDailyExpenseEntries(database)).resolves.toEqual([
      firstEntry,
      secondEntry,
    ]);
  });

  it("deletes a daily expense entry by id", async () => {
    const database = createTestDatabase();
    const deletedEntry = dailyExpenseEntry({ id: "expense-entry-to-delete" });
    const keptEntry = dailyExpenseEntry({
      id: "expense-entry-to-keep",
      note: "保留的一笔消费",
    });

    await saveDailyExpenseEntry(database, deletedEntry);
    await saveDailyExpenseEntry(database, keptEntry);

    await deleteDailyExpenseEntry(database, "expense-entry-to-delete");

    await expect(readDailyExpenseEntries(database)).resolves.toEqual([keptEntry]);
  });

  it("returns an empty wealth flow log before anything is saved", async () => {
    const database = createTestDatabase();

    await expect(readWealthFlowEvents(database)).resolves.toEqual([]);
  });

  it("saves and reads wealth flow events with snapshots", async () => {
    const database = createTestDatabase();
    const event = wealthFlowEvent({
      target: {
        type: "wallet_container",
        id: "wallet-container-1",
        nameSnapshot: "日常账户",
      },
    });

    await saveWealthFlowEvent(database, event);

    await expect(readWealthFlowEvents(database)).resolves.toEqual([event]);
  });

  it("reads wealth flow events by occurred time in descending order", async () => {
    const database = createTestDatabase();
    const latestEvent = wealthFlowEvent({
      id: "latest-event",
      occurredAt: "2026-06-03T10:00:00.000Z",
      createdAt: "2026-06-03T10:00:00.000Z",
      updatedAt: "2026-06-03T10:00:00.000Z",
    });
    const earliestEvent = wealthFlowEvent({
      id: "earliest-event",
      occurredAt: "2026-06-01T10:00:00.000Z",
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-01T10:00:00.000Z",
    });
    const middleEvent = wealthFlowEvent({
      id: "middle-event",
      occurredAt: "2026-06-02T10:00:00.000Z",
      createdAt: "2026-06-02T10:00:00.000Z",
      updatedAt: "2026-06-02T10:00:00.000Z",
    });

    await saveWealthFlowEvent(database, middleEvent);
    await saveWealthFlowEvent(database, earliestEvent);
    await saveWealthFlowEvent(database, latestEvent);

    await expect(readWealthFlowEvents(database)).resolves.toEqual([
      latestEvent,
      middleEvent,
      earliestEvent,
    ]);
  });

  it("uses created time as a stable wealth flow event tie breaker", async () => {
    const database = createTestDatabase();
    const firstCreatedEvent = wealthFlowEvent({
      id: "first-created-event",
      occurredAt: "2026-06-02T10:00:00.000Z",
      createdAt: "2026-06-02T10:00:00.000Z",
      updatedAt: "2026-06-02T10:00:00.000Z",
    });
    const secondCreatedEvent = wealthFlowEvent({
      id: "second-created-event",
      occurredAt: "2026-06-02T10:00:00.000Z",
      createdAt: "2026-06-02T10:00:01.000Z",
      updatedAt: "2026-06-02T10:00:01.000Z",
    });

    await saveWealthFlowEvent(database, firstCreatedEvent);
    await saveWealthFlowEvent(database, secondCreatedEvent);

    await expect(readWealthFlowEvents(database)).resolves.toEqual([
      secondCreatedEvent,
      firstCreatedEvent,
    ]);
  });

  it("clears wealth flow events without clearing other local data", async () => {
    const database = createTestDatabase();
    await saveWalletContainer(database, walletContainer());
    await saveWealthFlowEvent(database, wealthFlowEvent());

    await clearWealthFlowEvents(database);

    await expect(readWealthFlowEvents(database)).resolves.toEqual([]);
    await expect(readWalletContainers(database)).resolves.toEqual([
      walletContainer(),
    ]);
  });
});
