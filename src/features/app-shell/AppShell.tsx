"use client";

import { useEffect, useState } from "react";

import {
  clearLifeOSLocalData,
  deleteDailyExpenseEntry,
  deleteEcosystemObservation,
  deleteEnergyObservation,
  deleteMoneyInflowSource,
  deleteWalletContainer,
  lifeOSLocalDatabase,
  readDailyExpenseEntries,
  readDailyExpensePool,
  readEcosystemObservations,
  readEnergyObservations,
  readLifeOSLocalData,
  readMoneyInflowSources,
  readWalletContainers,
  saveDailyExpenseEntry,
  saveDailyExpensePool,
  saveMoneyInflowSource,
  saveOnboardingAnswerRecord,
  saveEcosystemObservation,
  saveEnergyObservation,
  saveStartupScanProfile,
  saveWalletContainer,
} from "@/features/local-data";
import { EnergyManagementPanel } from "@/features/energy-management";
import { FinanceManagementPanel } from "@/features/finance-management";
import { OnboardingFlow } from "@/features/onboarding";
import { PersonalEcosystemPanel } from "@/features/personal-ecosystem";
import { StartupScreen, WindowFrame } from "@/features/retro-ui";
import { StartupDashboard } from "@/features/startup-dashboard";
import { generateStartupScanProfile } from "@/features/startup-scan-generation";
import type {
  DailyExpenseEntry,
  DailyExpensePool,
  EcosystemObservation,
  EnergyObservation,
  MoneyInflowSource,
  OnboardingAnswerRecord,
  SubsystemId,
  StartupScanProfile,
  WalletContainer,
} from "@/types/lifeos";

import styles from "./app-shell.module.css";

export type AppShellDataSnapshot = {
  onboardingAnswer: OnboardingAnswerRecord | null;
  startupScanProfile: StartupScanProfile | null;
};

export type AppShellDataAdapter = {
  read: () => Promise<AppShellDataSnapshot>;
  readEcosystemObservations: () => Promise<EcosystemObservation[]>;
  readEnergyObservations: () => Promise<EnergyObservation[]>;
  readWalletContainers: () => Promise<WalletContainer[]>;
  readMoneyInflowSources: () => Promise<MoneyInflowSource[]>;
  readDailyExpensePool: () => Promise<DailyExpensePool | null>;
  readDailyExpenseEntries: () => Promise<DailyExpenseEntry[]>;
  deleteEcosystemObservation: (observationId: string) => Promise<void>;
  deleteEnergyObservation: (observationId: string) => Promise<void>;
  deleteWalletContainer: (containerId: string) => Promise<void>;
  deleteMoneyInflowSource: (sourceId: string) => Promise<void>;
  deleteDailyExpenseEntry: (entryId: string) => Promise<void>;
  saveOnboardingAnswer: (record: OnboardingAnswerRecord) => Promise<void>;
  saveEcosystemObservation: (observation: EcosystemObservation) => Promise<void>;
  saveEnergyObservation: (observation: EnergyObservation) => Promise<void>;
  saveWalletContainer: (container: WalletContainer) => Promise<void>;
  saveMoneyInflowSource: (source: MoneyInflowSource) => Promise<void>;
  saveDailyExpensePool: (pool: DailyExpensePool) => Promise<void>;
  saveDailyExpenseEntry: (entry: DailyExpenseEntry) => Promise<void>;
  saveStartupScanProfile: (profile: StartupScanProfile) => Promise<void>;
  clear: () => Promise<void>;
};

export type AppShellMode =
  | "loading"
  | "startup"
  | "onboarding"
  | "dashboard"
  | "personal-ecosystem"
  | "energy-management"
  | "finance-management";

export type AppShellProps = {
  dataAdapter?: AppShellDataAdapter;
  generateStartupScan?: (record: OnboardingAnswerRecord) => StartupScanProfile;
  initialMode?: Exclude<AppShellMode, "loading">;
};

const defaultDataAdapter: AppShellDataAdapter = {
  read: () => readLifeOSLocalData(lifeOSLocalDatabase),
  readEcosystemObservations: () => readEcosystemObservations(lifeOSLocalDatabase),
  readEnergyObservations: () => readEnergyObservations(lifeOSLocalDatabase),
  readWalletContainers: () => readWalletContainers(lifeOSLocalDatabase),
  readMoneyInflowSources: () => readMoneyInflowSources(lifeOSLocalDatabase),
  readDailyExpensePool: () => readDailyExpensePool(lifeOSLocalDatabase),
  readDailyExpenseEntries: () => readDailyExpenseEntries(lifeOSLocalDatabase),
  deleteEcosystemObservation: (observationId) =>
    deleteEcosystemObservation(lifeOSLocalDatabase, observationId),
  deleteEnergyObservation: (observationId) =>
    deleteEnergyObservation(lifeOSLocalDatabase, observationId),
  deleteWalletContainer: (containerId) =>
    deleteWalletContainer(lifeOSLocalDatabase, containerId),
  deleteMoneyInflowSource: (sourceId) =>
    deleteMoneyInflowSource(lifeOSLocalDatabase, sourceId),
  deleteDailyExpenseEntry: (entryId) =>
    deleteDailyExpenseEntry(lifeOSLocalDatabase, entryId),
  saveOnboardingAnswer: (record) =>
    saveOnboardingAnswerRecord(lifeOSLocalDatabase, record),
  saveEcosystemObservation: (observation) =>
    saveEcosystemObservation(lifeOSLocalDatabase, observation),
  saveEnergyObservation: (observation) =>
    saveEnergyObservation(lifeOSLocalDatabase, observation),
  saveWalletContainer: (container) =>
    saveWalletContainer(lifeOSLocalDatabase, container),
  saveMoneyInflowSource: (source) =>
    saveMoneyInflowSource(lifeOSLocalDatabase, source),
  saveDailyExpensePool: (pool) =>
    saveDailyExpensePool(lifeOSLocalDatabase, pool),
  saveDailyExpenseEntry: (entry) =>
    saveDailyExpenseEntry(lifeOSLocalDatabase, entry),
  saveStartupScanProfile: (profile) =>
    saveStartupScanProfile(lifeOSLocalDatabase, profile),
  clear: () => clearLifeOSLocalData(lifeOSLocalDatabase),
};

export function AppShell({
  dataAdapter = defaultDataAdapter,
  generateStartupScan = generateStartupScanProfile,
  initialMode,
}: AppShellProps) {
  const [mode, setMode] = useState<AppShellMode>(initialMode ?? "loading");
  const [startupScanProfile, setStartupScanProfile] =
    useState<StartupScanProfile | null>(null);
  const [ecosystemObservations, setEcosystemObservations] = useState<
    EcosystemObservation[]
  >([]);
  const [energyObservations, setEnergyObservations] = useState<EnergyObservation[]>(
    [],
  );
  const [walletContainers, setWalletContainers] = useState<WalletContainer[]>([]);
  const [moneyInflowSources, setMoneyInflowSources] = useState<MoneyInflowSource[]>(
    [],
  );
  const [dailyExpensePool, setDailyExpensePool] =
    useState<DailyExpensePool | null>(null);
  const [dailyExpenseEntries, setDailyExpenseEntries] = useState<
    DailyExpenseEntry[]
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    dataAdapter
      .read()
      .then((snapshot) => {
        if (!active) return;

        setStartupScanProfile(snapshot.startupScanProfile);

        if (snapshot.startupScanProfile) {
          setMode("dashboard");
          return;
        }

        if (!initialMode) {
          setMode("startup");
        }
      })
      .catch(() => {
        if (!active) return;
        setErrorMessage("读取本地 LifeOS 数据失败。");
        setMode("startup");
      });

    return () => {
      active = false;
    };
  }, [dataAdapter, initialMode]);

  async function handleOnboardingComplete(record: OnboardingAnswerRecord) {
    const profile = generateStartupScan(record);

    await dataAdapter.saveOnboardingAnswer(record);
    await dataAdapter.saveStartupScanProfile(profile);

    setStartupScanProfile(profile);
    setMode("dashboard");
  }

  async function handleReset() {
    await dataAdapter.clear();
    setStartupScanProfile(null);
    setEcosystemObservations([]);
    setEnergyObservations([]);
    setWalletContainers([]);
    setMoneyInflowSources([]);
    setDailyExpensePool(null);
    setDailyExpenseEntries([]);
    setMode("startup");
  }

  async function handleOpenSubsystem(subsystemId: SubsystemId) {
    if (subsystemId === "ecosystem") {
      const observations = await dataAdapter.readEcosystemObservations();
      setEcosystemObservations(observations);
      setMode("personal-ecosystem");
      return;
    }

    if (subsystemId === "energy") {
      const observations = await dataAdapter.readEnergyObservations();
      setEnergyObservations(observations);
      setMode("energy-management");
      return;
    }

    if (subsystemId === "finance") {
      const [containers, sources, pool, entries] = await Promise.all([
        dataAdapter.readWalletContainers(),
        dataAdapter.readMoneyInflowSources(),
        dataAdapter.readDailyExpensePool(),
        dataAdapter.readDailyExpenseEntries(),
      ]);
      setWalletContainers(containers);
      setMoneyInflowSources(sources);
      setDailyExpensePool(pool);
      setDailyExpenseEntries(entries);
      setMode("finance-management");
    }
  }

  async function handleSaveEcosystemObservation(
    observation: EcosystemObservation,
  ) {
    await dataAdapter.saveEcosystemObservation(observation);
  }

  async function handleDeleteEcosystemObservation(observationId: string) {
    await dataAdapter.deleteEcosystemObservation(observationId);
  }

  async function handleSaveEnergyObservation(observation: EnergyObservation) {
    await dataAdapter.saveEnergyObservation(observation);
  }

  async function handleDeleteEnergyObservation(observationId: string) {
    await dataAdapter.deleteEnergyObservation(observationId);
  }

  async function handleSaveWalletContainer(container: WalletContainer) {
    await dataAdapter.saveWalletContainer(container);
  }

  async function handleDeleteWalletContainer(containerId: string) {
    await dataAdapter.deleteWalletContainer(containerId);
  }

  async function handleSaveMoneyInflowSource(source: MoneyInflowSource) {
    await dataAdapter.saveMoneyInflowSource(source);
  }

  async function handleDeleteMoneyInflowSource(sourceId: string) {
    await dataAdapter.deleteMoneyInflowSource(sourceId);
  }

  async function handleSaveDailyExpensePool(pool: DailyExpensePool) {
    setDailyExpensePool(pool);
    await dataAdapter.saveDailyExpensePool(pool);
  }

  async function handleSaveDailyExpenseEntry(entry: DailyExpenseEntry) {
    setDailyExpenseEntries((current) => {
      const withoutEntry = current.filter((item) => item.id !== entry.id);
      return [...withoutEntry, entry].sort((left, right) =>
        left.spentAt.localeCompare(right.spentAt),
      );
    });
    await dataAdapter.saveDailyExpenseEntry(entry);
  }

  async function handleDeleteDailyExpenseEntry(entryId: string) {
    setDailyExpenseEntries((current) =>
      current.filter((entry) => entry.id !== entryId),
    );
    await dataAdapter.deleteDailyExpenseEntry(entryId);
  }

  return (
    <main className="lifeos-screen">
      <div className={styles.shell}>
        {mode === "loading" ? (
          <StartupScreen
            status="正在读取个人档案..."
            subtitle="请稍候，本地小电脑正在检查 IndexedDB。"
            title="LifeOS v1.4"
          />
        ) : null}

        {mode === "startup" ? (
          <StartupScreen
            actionLabel="开始初始扫描"
            onAction={() => setMode("onboarding")}
            status={errorMessage ?? "未发现本地启动扫描结果。"}
            subtitle="先用 9 个问题完成初始扫描，再进入六个子系统地图。"
            title="启动 LifeOS"
          />
        ) : null}

        {mode === "onboarding" ? (
          <WindowFrame
            statusBar="完成前不会写入本地数据。"
            title="初始扫描"
          >
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          </WindowFrame>
        ) : null}

        {mode === "dashboard" && startupScanProfile ? (
          <StartupDashboard
            onOpenSubsystem={handleOpenSubsystem}
            onResetConfirmed={handleReset}
            profile={startupScanProfile}
          />
        ) : null}

        {mode === "personal-ecosystem" ? (
          <PersonalEcosystemPanel
            observations={ecosystemObservations}
            onBack={() => setMode("dashboard")}
            onDeleteObservation={handleDeleteEcosystemObservation}
            onSaveObservation={handleSaveEcosystemObservation}
          />
        ) : null}

        {mode === "energy-management" ? (
          <EnergyManagementPanel
            observations={energyObservations}
            onBack={() => setMode("dashboard")}
            onDeleteObservation={handleDeleteEnergyObservation}
            onSaveObservation={handleSaveEnergyObservation}
          />
        ) : null}

        {mode === "finance-management" ? (
          <FinanceManagementPanel
            containers={walletContainers}
            dailyExpenseEntries={dailyExpenseEntries}
            dailyExpensePool={dailyExpensePool}
            incomeSources={moneyInflowSources}
            onBack={() => setMode("dashboard")}
            onDeleteContainer={handleDeleteWalletContainer}
            onDeleteIncomeSource={handleDeleteMoneyInflowSource}
            onDeleteDailyExpenseEntry={handleDeleteDailyExpenseEntry}
            onSaveContainer={handleSaveWalletContainer}
            onSaveDailyExpenseEntry={handleSaveDailyExpenseEntry}
            onSaveDailyExpensePool={handleSaveDailyExpensePool}
            onSaveIncomeSource={handleSaveMoneyInflowSource}
          />
        ) : null}
      </div>
    </main>
  );
}
