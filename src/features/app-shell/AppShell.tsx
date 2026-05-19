"use client";

import { useEffect, useState } from "react";

import { clearLifeOSLocalData, lifeOSLocalDatabase, readLifeOSLocalData, saveManualProfile, saveOnboardingAnswerRecord } from "@/features/local-data";
import { generateManualProfile } from "@/features/manual-generation";
import { ManualPanel } from "@/features/manual-panel";
import { OnboardingFlow } from "@/features/onboarding";
import { StartupScreen, WindowFrame } from "@/features/retro-ui";
import type {
  ManualProfile,
  OnboardingAnswerRecord,
} from "@/types/lifeos";

import styles from "./app-shell.module.css";

export type AppShellDataSnapshot = {
  onboardingAnswer: OnboardingAnswerRecord | null;
  manualProfile: ManualProfile | null;
};

export type AppShellDataAdapter = {
  read: () => Promise<AppShellDataSnapshot>;
  saveOnboardingAnswer: (record: OnboardingAnswerRecord) => Promise<void>;
  saveManualProfile: (profile: ManualProfile) => Promise<void>;
  clear: () => Promise<void>;
};

export type AppShellMode = "loading" | "startup" | "onboarding" | "dashboard";

export type AppShellProps = {
  dataAdapter?: AppShellDataAdapter;
  generateProfile?: (record: OnboardingAnswerRecord) => ManualProfile;
  initialMode?: Exclude<AppShellMode, "loading">;
};

const defaultDataAdapter: AppShellDataAdapter = {
  read: () => readLifeOSLocalData(lifeOSLocalDatabase),
  saveOnboardingAnswer: (record) =>
    saveOnboardingAnswerRecord(lifeOSLocalDatabase, record),
  saveManualProfile: (profile) => saveManualProfile(lifeOSLocalDatabase, profile),
  clear: () => clearLifeOSLocalData(lifeOSLocalDatabase),
};

export function AppShell({
  dataAdapter = defaultDataAdapter,
  generateProfile = generateManualProfile,
  initialMode,
}: AppShellProps) {
  const [mode, setMode] = useState<AppShellMode>(initialMode ?? "loading");
  const [onboardingAnswer, setOnboardingAnswer] =
    useState<OnboardingAnswerRecord | null>(null);
  const [manualProfile, setManualProfile] = useState<ManualProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    dataAdapter
      .read()
      .then((snapshot) => {
        if (!active) return;

        setOnboardingAnswer(snapshot.onboardingAnswer);
        setManualProfile(snapshot.manualProfile);

        if (snapshot.manualProfile) {
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
    const profile = generateProfile(record);

    await dataAdapter.saveOnboardingAnswer(record);
    await dataAdapter.saveManualProfile(profile);

    setOnboardingAnswer(record);
    setManualProfile(profile);
    setMode("dashboard");
  }

  async function handleProfileChange(profile: ManualProfile) {
    await dataAdapter.saveManualProfile(profile);
    setManualProfile(profile);
  }

  async function handleReset() {
    await dataAdapter.clear();
    setOnboardingAnswer(null);
    setManualProfile(null);
    setMode("startup");
  }

  return (
    <main className="lifeos-screen">
      <div className={styles.shell}>
        {mode === "loading" ? (
          <StartupScreen
            status="正在读取个人档案..."
            subtitle="请稍候，本地小电脑正在检查 IndexedDB。"
            title="LifeOS v1.0"
          />
        ) : null}

        {mode === "startup" ? (
          <StartupScreen
            actionLabel="建立个人说明书"
            onAction={() => setMode("onboarding")}
            status={errorMessage ?? "未发现本地个人说明书档案。"}
            subtitle="第一版只做一件事：从 9 个问题开始，生成一份待验证的个人说明书。"
            title="启动 LifeOS"
          />
        ) : null}

        {mode === "onboarding" ? (
          <WindowFrame
            statusBar="完成前不会写入本地数据。"
            title="建立个人说明书"
          >
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          </WindowFrame>
        ) : null}

        {mode === "dashboard" && manualProfile ? (
          <ManualPanel
            onboardingAnswer={onboardingAnswer}
            onProfileChange={handleProfileChange}
            onResetConfirmed={handleReset}
            profile={manualProfile}
          />
        ) : null}
      </div>
    </main>
  );
}
