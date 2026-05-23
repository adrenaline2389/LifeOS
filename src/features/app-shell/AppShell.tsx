"use client";

import { useEffect, useState } from "react";

import {
  clearLifeOSLocalData,
  lifeOSLocalDatabase,
  readLifeOSLocalData,
  saveOnboardingAnswerRecord,
  saveStartupScanProfile,
} from "@/features/local-data";
import { OnboardingFlow } from "@/features/onboarding";
import { StartupScreen, WindowFrame } from "@/features/retro-ui";
import { StartupDashboard } from "@/features/startup-dashboard";
import { generateStartupScanProfile } from "@/features/startup-scan-generation";
import type {
  OnboardingAnswerRecord,
  StartupScanProfile,
} from "@/types/lifeos";

import styles from "./app-shell.module.css";

export type AppShellDataSnapshot = {
  onboardingAnswer: OnboardingAnswerRecord | null;
  startupScanProfile: StartupScanProfile | null;
};

export type AppShellDataAdapter = {
  read: () => Promise<AppShellDataSnapshot>;
  saveOnboardingAnswer: (record: OnboardingAnswerRecord) => Promise<void>;
  saveStartupScanProfile: (profile: StartupScanProfile) => Promise<void>;
  clear: () => Promise<void>;
};

export type AppShellMode = "loading" | "startup" | "onboarding" | "dashboard";

export type AppShellProps = {
  dataAdapter?: AppShellDataAdapter;
  generateStartupScan?: (record: OnboardingAnswerRecord) => StartupScanProfile;
  initialMode?: Exclude<AppShellMode, "loading">;
};

const defaultDataAdapter: AppShellDataAdapter = {
  read: () => readLifeOSLocalData(lifeOSLocalDatabase),
  saveOnboardingAnswer: (record) =>
    saveOnboardingAnswerRecord(lifeOSLocalDatabase, record),
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
    setMode("startup");
  }

  return (
    <main className="lifeos-screen">
      <div className={styles.shell}>
        {mode === "loading" ? (
          <StartupScreen
            status="正在读取个人档案..."
            subtitle="请稍候，本地小电脑正在检查 IndexedDB。"
            title="LifeOS v1.1"
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
            onResetConfirmed={handleReset}
            profile={startupScanProfile}
          />
        ) : null}
      </div>
    </main>
  );
}
