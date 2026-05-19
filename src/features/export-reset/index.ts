import type {
  LifeOSExportData,
  ManualProfile,
  OnboardingAnswerRecord,
} from "@/types/lifeos";

export type LifeOSExportInput = {
  exportedAt?: string;
  onboardingAnswer: OnboardingAnswerRecord | null;
  manualProfile: ManualProfile | null;
};

export type ResetConfirmationInput = {
  confirmed: boolean;
  typedText?: string;
  expectedText?: string;
};

export type BrowserDownloadEnvironment = {
  document?: Document;
  createObjectURL?: (blob: Blob) => string;
  revokeObjectURL?: (url: string) => void;
};

export type ResetLifeOSDataInput = ResetConfirmationInput & {
  reset: () => Promise<void>;
  onReset?: () => void;
};

export type ResetLifeOSDataResult = {
  status: "cancelled" | "reset";
};

export type BrowserDownloadInput = {
  content: string;
  filename: string;
  mimeType: string;
  environment?: BrowserDownloadEnvironment;
};

export const createLifeOSExportData = (
  input: LifeOSExportInput,
): LifeOSExportData => ({
  exportedAt: input.exportedAt ?? new Date().toISOString(),
  onboardingAnswer: input.onboardingAnswer,
  manualProfile: input.manualProfile,
});

export const stringifyLifeOSExportData = (
  exportData: LifeOSExportData,
): string => `${JSON.stringify(exportData, null, 2)}\n`;

const renderSourceRefs = (
  refs: Array<{ questionId: string; optionId?: string }>,
): string =>
  refs
    .map((ref) =>
      ref.optionId ? `${ref.questionId}/${ref.optionId}` : ref.questionId,
    )
    .join(", ");

const renderEmpty = () => "_暂无记录。_";

const renderManualProfile = (manualProfile: ManualProfile | null): string[] => {
  if (!manualProfile) {
    return ["## 个人说明书", "", renderEmpty()];
  }

  const lines: string[] = [
    "## 自我清晰度",
    "",
    manualProfile.selfClarity === "hazy" ? "朦胧" : manualProfile.selfClarity,
    "",
    "## 给未来自己的备注",
    "",
    manualProfile.futureSelfNote?.trim() || renderEmpty(),
    "",
    "## 已识别参数",
    "",
  ];

  if (manualProfile.identifiedParameters.length === 0) {
    lines.push(renderEmpty());
  } else {
    for (const parameter of manualProfile.identifiedParameters) {
      lines.push(
        `- **${parameter.label}**：${parameter.values.join("、") || "暂无值"}（来源：${parameter.sourceQuestionIds.join(", ") || "暂无"}）`,
      );
    }
  }

  lines.push("", "## 待验证观察", "");

  if (manualProfile.pendingObservations.length === 0) {
    lines.push(renderEmpty());
  } else {
    for (const observation of manualProfile.pendingObservations) {
      lines.push(
        `- ${observation.text}（状态：待验证；来源：${renderSourceRefs(observation.sourceAnswerRefs) || "暂无"}）`,
      );
    }
  }

  lines.push("", "## 建议开启的子系统", "");

  if (manualProfile.suggestedSubsystems.length === 0) {
    lines.push(renderEmpty());
  } else {
    for (const subsystem of manualProfile.suggestedSubsystems) {
      lines.push(
        `- **${subsystem.label}**：${subsystem.reason}（来源：${renderSourceRefs(subsystem.sourceAnswerRefs) || "暂无"}）`,
      );
    }
  }

  lines.push("", "## 个人说明书章节", "");

  if (manualProfile.editableSections.length === 0) {
    lines.push(renderEmpty());
  } else {
    for (const section of manualProfile.editableSections) {
      lines.push(`### ${section.title}`, "", section.content || renderEmpty(), "");
    }
  }

  return lines;
};

const renderOnboardingAnswers = (
  onboardingAnswer: OnboardingAnswerRecord | null,
): string[] => {
  const lines = ["## Onboarding 回答", ""];

  if (!onboardingAnswer) {
    lines.push(renderEmpty());
    return lines;
  }

  lines.push(`完成时间：${onboardingAnswer.completedAt}`, "");

  for (const answer of onboardingAnswer.answers) {
    if (answer.type === "multi-select") {
      const answerParts = [
        ...answer.selectedOptionIds,
        ...(answer.customText?.trim() ? [`其他：${answer.customText.trim()}`] : []),
      ];

      lines.push(
        `- ${answer.questionId}：${answerParts.join(", ")}`,
      );
    } else if (answer.skipped) {
      lines.push(`- ${answer.questionId}：已跳过`);
    } else {
      lines.push(`- ${answer.questionId}：${answer.value}`);
    }
  }

  return lines;
};

export const createLifeOSMarkdown = (exportData: LifeOSExportData): string => {
  const lines = [
    "# LifeOS 个人说明书导出",
    "",
    `导出时间：${exportData.exportedAt}`,
    "",
    ...renderManualProfile(exportData.manualProfile),
    "",
    ...renderOnboardingAnswers(exportData.onboardingAnswer),
    "",
  ];

  return lines.join("\n");
};

export const isLifeOSResetConfirmed = (
  input: ResetConfirmationInput,
): boolean => {
  if (!input.confirmed) {
    return false;
  }

  if (input.expectedText === undefined) {
    return true;
  }

  return (input.typedText ?? "").trim() === input.expectedText.trim();
};

export const resetLifeOSDataWithConfirmation = async (
  input: ResetLifeOSDataInput,
): Promise<ResetLifeOSDataResult> => {
  if (!isLifeOSResetConfirmed(input)) {
    return { status: "cancelled" };
  }

  await input.reset();
  input.onReset?.();
  return { status: "reset" };
};

export const triggerBrowserDownload = (input: BrowserDownloadInput): void => {
  const documentRef = input.environment?.document ?? globalThis.document;
  const createObjectURL =
    input.environment?.createObjectURL ?? globalThis.URL?.createObjectURL;
  const revokeObjectURL =
    input.environment?.revokeObjectURL ?? globalThis.URL?.revokeObjectURL;

  if (!documentRef || !createObjectURL || !revokeObjectURL) {
    throw new Error("Browser download APIs are not available.");
  }

  const blob = new Blob([input.content], { type: input.mimeType });
  const objectUrl = createObjectURL(blob);
  const anchor = documentRef.createElement("a");

  anchor.href = objectUrl;
  anchor.download = input.filename;
  anchor.style.display = "none";

  documentRef.body.appendChild(anchor);
  anchor.click();
  documentRef.body.removeChild(anchor);
  revokeObjectURL(objectUrl);
};
