"use client";

import { useState } from "react";

import { resetLifeOSDataWithConfirmation } from "@/features/export-reset";
import { ONBOARDING_QUESTIONS } from "@/features/question-schema";
import {
  Button,
  Dialog,
  Panel,
  SourceReference,
  StatusLabel,
  WindowFrame,
} from "@/features/retro-ui";
import { candidateSubsystems } from "@/features/subsystem-recommendation";
import type {
  SourceAnswerRef,
  StartupScanProfile,
  SuggestedSubsystem,
} from "@/types/lifeos";

import styles from "./startup-dashboard.module.css";

export type StartupDashboardProps = {
  profile: StartupScanProfile;
  onResetConfirmed: () => Promise<void>;
};

const RESET_TEXT = "RESET";

export function StartupDashboard({
  profile,
  onResetConfirmed,
}: StartupDashboardProps) {
  const [resetOpen, setResetOpen] = useState(false);
  const [resetTypedText, setResetTypedText] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [subsystemMessage, setSubsystemMessage] = useState<string | null>(null);

  const suggestedSubsystems = profile.suggestedSubsystems.slice(0, 2);
  const suggestedIds = new Set(suggestedSubsystems.map((subsystem) => subsystem.id));

  async function handleConfirmReset() {
    const result = await resetLifeOSDataWithConfirmation({
      confirmed: true,
      typedText: resetTypedText,
      expectedText: RESET_TEXT,
      reset: onResetConfirmed,
    });

    if (result.status === "cancelled") {
      setResetMessage("请输入 RESET 后再确认。");
      return;
    }

    setResetMessage(null);
    setResetOpen(false);
    setResetTypedText("");
  }

  function handleSubsystemClick(
    subsystem: SuggestedSubsystem | (typeof candidateSubsystems)[number],
  ) {
    setSubsystemMessage(`${subsystem.label} 会在后续版本开放，这里先作为系统入口保留。`);
  }

  return (
    <WindowFrame
      statusBar="本地数据只保存在这台设备上。"
      title="LifeOS 启动面板"
    >
      <div className={styles.panelGrid}>
        <Panel title="启动状态">
          <div className={styles.statusRow}>
            <StatusLabel tone="ok">初始扫描完成</StatusLabel>
            <p>LifeOS 已生成六个子系统的初始入口和建议开启顺序。</p>
          </div>
        </Panel>

        <Panel title="建议优先开启的系统">
          {suggestedSubsystems.length > 0 ? (
            <ul className={styles.subsystemList}>
              {suggestedSubsystems.map((subsystem) => (
                <li key={subsystem.id}>
                  <div>
                    <StatusLabel tone="pending">建议优先开启</StatusLabel>
                    <strong>{subsystem.label}</strong>
                    <p>{subsystem.reason}</p>
                  </div>
                  <SourceReference items={toSourceItems(subsystem.sourceAnswerRefs)} />
                  <Button size="sm" onClick={() => handleSubsystemClick(subsystem)}>
                    查看系统入口
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>暂无建议优先开启的系统。</p>
          )}
        </Panel>

        <Panel title="六个子系统地图">
          <ul className={styles.subsystemList}>
            {candidateSubsystems.map((subsystem) => (
              <li key={subsystem.id}>
                <div>
                  <StatusLabel tone={suggestedIds.has(subsystem.id) ? "pending" : "neutral"}>
                    {suggestedIds.has(subsystem.id) ? "建议优先开启" : "后续开放"}
                  </StatusLabel>
                  <strong>{subsystem.label}</strong>
                  <p>{subsystem.description}</p>
                </div>
                <Button
                  onClick={() => handleSubsystemClick(subsystem)}
                  size="sm"
                  variant="quiet"
                >
                  查看
                </Button>
              </li>
            ))}
          </ul>
          {subsystemMessage ? <p role="status">{subsystemMessage}</p> : null}
        </Panel>

        <Panel title="扫描线索">
          {profile.scanClues.length > 0 ? (
            <ul className={styles.observationList}>
              {profile.scanClues.map((clue) => (
                <li key={clue.id}>
                  <div className={styles.observationHeader}>
                    <StatusLabel tone="pending">扫描线索</StatusLabel>
                    <p>{clue.text}</p>
                  </div>
                  <SourceReference items={toSourceItems(clue.sourceAnswerRefs)} />
                </li>
              ))}
            </ul>
          ) : (
            <p>暂无扫描线索。</p>
          )}
        </Panel>

        <Panel title="本地数据">
          <div className={styles.buttonCluster}>
            <Button onClick={() => setResetOpen(true)} variant="danger">
              重置本地数据
            </Button>
          </div>
        </Panel>
      </div>

      <Dialog
        cancelLabel="取消"
        confirmLabel="确认重置"
        confirmVariant="danger"
        onCancel={() => {
          setResetOpen(false);
          setResetTypedText("");
          setResetMessage(null);
        }}
        onConfirm={handleConfirmReset}
        open={resetOpen}
        title="重置本地 LifeOS 数据"
      >
        <p>这会清空当前设备上的首次扫描回答和启动扫描结果。</p>
        <label className={styles.resetLabel}>
          <span>输入 RESET 确认重置</span>
          <input
            aria-label="输入 RESET 确认重置"
            onChange={(event) => setResetTypedText(event.target.value)}
            value={resetTypedText}
          />
        </label>
        {resetMessage ? <p role="alert">{resetMessage}</p> : null}
      </Dialog>
    </WindowFrame>
  );
}

function toSourceItems(sourceAnswerRefs: SourceAnswerRef[]) {
  return sourceAnswerRefs.map((ref) => {
    const question = ONBOARDING_QUESTIONS.find(
      (candidate) => candidate.id === ref.questionId,
    );
    const option =
      question?.type === "multi-select"
        ? question.options.find((candidate) => candidate.id === ref.optionId)
        : undefined;
    const questionLabel = question ? `第 ${question.order} 题` : ref.questionId;
    const detail = option?.label ?? ref.optionId;

    return {
      id: `${ref.questionId}:${ref.optionId ?? "text"}`,
      label: detail ? `${questionLabel}：${detail}` : questionLabel,
    };
  });
}
