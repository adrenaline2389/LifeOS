"use client";

import { useMemo, useState } from "react";

import {
  createLifeOSExportData,
  createLifeOSMarkdown,
  resetLifeOSDataWithConfirmation,
  stringifyLifeOSExportData,
  triggerBrowserDownload,
  type BrowserDownloadEnvironment,
} from "@/features/export-reset";
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
  IdentifiedParameter,
  ManualProfile,
  ManualSection,
  OnboardingAnswerRecord,
  SourceAnswerRef,
  SuggestedSubsystem,
} from "@/types/lifeos";

import styles from "./manual-panel.module.css";

export type ManualPanelProps = {
  profile: ManualProfile;
  onboardingAnswer: OnboardingAnswerRecord | null;
  onProfileChange: (profile: ManualProfile) => void | Promise<void>;
  onResetConfirmed: () => Promise<void>;
  onExportJson?: () => void;
  onExportMarkdown?: () => void;
  downloadEnvironment?: BrowserDownloadEnvironment;
  now?: () => Date;
};

const RESET_TEXT = "RESET";
const MAX_PROFILE_CLUES = 8;

const clueTemplates: Record<string, (values: string) => string> = {
  "压力信号": (values) => `状态下降时，你可能最先受影响的是：${values}`,
  "恢复方式": (values) => `恢复方式里，${values} 对你可能比较有效`,
  "行动节奏": (values) => `推进事情时，你可能更适合：${values}`,
  "沟通偏好": (values) => `沟通上，你偏好：${values}`,
  "边界": (values) => `相处或协作时，你可能需要被尊重的边界是：${values}`,
  "雷区": (values) => `状态不好时，容易让情况变糟的触发点可能是：${values}`,
  "别人如何与我相处": (values) => `长期合作或相处中，别人最好先知道：${values}`,
  "当前改善方向": (values) => `最近你最想修复或改善的是：${values}`,
  "成长方向": (values) => `你希望 LifeOS 先支持你成为：${values}`,
};

function buildInitialProfileClues(parameters: IdentifiedParameter[]) {
  return parameters.flatMap((parameter) => {
    const template = clueTemplates[parameter.label];

    if (!template) {
      return [];
    }

    return [{
      id: parameter.id,
      text: template(parameter.values.join("、")),
    }];
  }).slice(0, MAX_PROFILE_CLUES);
}

export function ManualPanel({
  profile,
  onboardingAnswer,
  onProfileChange,
  onResetConfirmed,
  onExportJson,
  onExportMarkdown,
  downloadEnvironment,
  now = () => new Date(),
}: ManualPanelProps) {
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [draftSections, setDraftSections] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      profile.editableSections.map((section) => [section.id, section.content]),
    ),
  );
  const [resetOpen, setResetOpen] = useState(false);
  const [resetTypedText, setResetTypedText] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [subsystemMessage, setSubsystemMessage] = useState<string | null>(null);

  const suggestedSubsystems = profile.suggestedSubsystems.slice(0, 2);
  const suggestedIds = new Set(suggestedSubsystems.map((subsystem) => subsystem.id));
  const otherSubsystems = candidateSubsystems.filter(
    (subsystem) => !suggestedIds.has(subsystem.id),
  );
  const initialProfileClues = buildInitialProfileClues(
    profile.identifiedParameters,
  );

  const exportData = useMemo(
    () =>
      createLifeOSExportData({
        onboardingAnswer,
        manualProfile: profile,
      }),
    [onboardingAnswer, profile],
  );

  function handleExportJson() {
    if (onExportJson) {
      onExportJson();
      return;
    }

    triggerBrowserDownload({
      content: stringifyLifeOSExportData(exportData),
      filename: "lifeos-export.json",
      mimeType: "application/json;charset=utf-8",
      environment: downloadEnvironment,
    });
  }

  function handleExportMarkdown() {
    if (onExportMarkdown) {
      onExportMarkdown();
      return;
    }

    triggerBrowserDownload({
      content: createLifeOSMarkdown(exportData),
      filename: "lifeos-manual.md",
      mimeType: "text/markdown;charset=utf-8",
      environment: downloadEnvironment,
    });
  }

  async function handleSaveSection(section: ManualSection) {
    const nextSections = profile.editableSections.map((currentSection) =>
      currentSection.id === section.id
        ? {
            ...currentSection,
            content: draftSections[section.id] ?? currentSection.content,
            source: "user-edited" as const,
            updatedAt: now().toISOString(),
          }
        : currentSection,
    );

    await onProfileChange({
      ...profile,
      editableSections: nextSections,
    });
  }

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

  function handleSubsystemClick(subsystem: SuggestedSubsystem | (typeof candidateSubsystems)[number]) {
    setSubsystemMessage(`${subsystem.label} 会在后续版本开放，这里先记录为建议入口。`);
  }

  return (
    <WindowFrame
      statusBar="本地数据只保存在这台设备上。"
      title="个人说明书控制面板"
    >
      <div className={styles.panelGrid}>
        <Panel title="自我清晰度">
          <div className={styles.clarityRow}>
            <StatusLabel tone="pending">朦胧</StatusLabel>
            <p>系统刚开始认识你，所有观察都需要继续验证。</p>
          </div>
        </Panel>

        <Panel title="系统初步读到的线索">
          {initialProfileClues.length > 0 ? (
            <ul className={styles.clueList}>
              {initialProfileClues.map((clue) => (
                <li key={clue.id}>
                  <StatusLabel tone="pending">待验证</StatusLabel>
                  <p>{clue.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>暂无可读线索。</p>
          )}

          {profile.identifiedParameters.length > 0 ? (
            <details className={styles.parameterDetails}>
              <summary>查看系统解析细节</summary>
              <ul className={styles.cleanList}>
                {profile.identifiedParameters.map((parameter) => (
                  <li key={parameter.id}>
                    <strong>{parameter.label}</strong>
                    <span>{parameter.values.join("、")}</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </Panel>

        <Panel title="待验证观察">
          {profile.pendingObservations.length > 0 ? (
            <ul className={styles.observationList}>
              {profile.pendingObservations.map((observation) => (
                <li key={observation.id}>
                  <div className={styles.observationHeader}>
                    <StatusLabel tone="pending">待验证</StatusLabel>
                    <p>{observation.text}</p>
                  </div>
                  <SourceReference items={toSourceItems(observation.sourceAnswerRefs)} />
                </li>
              ))}
            </ul>
          ) : (
            <p>暂无待验证观察。</p>
          )}
        </Panel>

        <Panel title="建议开启的子系统">
          <p aria-hidden="true" className={styles.note}>
            &nbsp;
          </p>
          {suggestedSubsystems.length > 0 ? (
            <ul className={styles.subsystemList}>
              {suggestedSubsystems.map((subsystem) => (
                <li key={subsystem.id}>
                  <div>
                    <strong>{subsystem.label}</strong>
                    <p>{subsystem.reason}</p>
                  </div>
                  <SourceReference items={toSourceItems(subsystem.sourceAnswerRefs)} />
                  <Button size="sm" onClick={() => handleSubsystemClick(subsystem)}>
                    标记为稍后查看
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>暂无建议子系统。</p>
          )}

          <div className={styles.otherSubsystems}>
            <p>其他未推荐子系统入口</p>
            <div className={styles.buttonCluster}>
              {otherSubsystems.map((subsystem) => (
                <Button
                  key={subsystem.id}
                  onClick={() => handleSubsystemClick(subsystem)}
                  size="sm"
                  variant="quiet"
                >
                  {subsystem.label}
                </Button>
              ))}
            </div>
          </div>
          {subsystemMessage ? <p role="status">{subsystemMessage}</p> : null}
        </Panel>

        <Panel title="完整个人说明书">
          <div className={styles.buttonCluster}>
            <Button onClick={() => setIsManualOpen((open) => !open)} variant="primary">
              {isManualOpen ? "收起完整说明书" : "打开完整说明书"}
            </Button>
            <Button onClick={handleExportJson}>导出 JSON</Button>
            <Button onClick={handleExportMarkdown}>导出 Markdown</Button>
            <Button onClick={() => setResetOpen(true)} variant="danger">
              重置本地数据
            </Button>
          </div>

          {isManualOpen ? (
            <div className={styles.sectionEditor}>
              {profile.editableSections.map((section) => (
                <section className={styles.editorSection} key={section.id}>
                  <div className={styles.editorHeader}>
                    <h4>{section.title}</h4>
                    <StatusLabel tone={section.source === "generated" ? "neutral" : "ok"}>
                      {section.source === "generated" ? "系统生成" : "用户编辑"}
                    </StatusLabel>
                  </div>
                  <textarea
                    aria-label={`编辑 ${section.title}`}
                    onChange={(event) =>
                      setDraftSections((currentDrafts) => ({
                        ...currentDrafts,
                        [section.id]: event.target.value,
                      }))
                    }
                    rows={6}
                    value={draftSections[section.id] ?? section.content}
                  />
                  <Button onClick={() => handleSaveSection(section)} size="sm">
                    保存 {section.title}
                  </Button>
                </section>
              ))}
            </div>
          ) : null}
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
        <p>这会清空当前设备上的 onboarding 回答和个人说明书档案。</p>
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
