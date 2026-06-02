export type QuestionType = "multi-select" | "short-text";

export type QuestionOption = {
  id: string;
  label: string;
  signalTags: string[];
};

export type MultiSelectQuestion = {
  id: string;
  order: number;
  title: string;
  type: "multi-select";
  minSelections: 1;
  maxSelections?: number;
  writeTargets: string[];
  options: QuestionOption[];
};

export type ShortTextQuestion = {
  id: string;
  order: number;
  title: string;
  type: "short-text";
  optional: true;
  placeholder: string;
  writeTargets: string[];
};

export type OnboardingQuestion = MultiSelectQuestion | ShortTextQuestion;

export type MultiSelectAnswer = {
  questionId: string;
  type: "multi-select";
  selectedOptionIds: string[];
  customText?: string;
};

export type ShortTextAnswer = {
  questionId: string;
  type: "short-text";
  value: string;
  skipped: boolean;
};

export type OnboardingAnswer = MultiSelectAnswer | ShortTextAnswer;

export type OnboardingAnswerRecord = {
  completedAt: string;
  answers: OnboardingAnswer[];
};

export type SourceAnswerRef = {
  questionId: string;
  optionId?: string;
};

export type SubsystemId =
  | "ecosystem"
  | "energy"
  | "cognition"
  | "goals"
  | "relationships"
  | "finance";

export type SuggestedSubsystem = {
  id: SubsystemId;
  label: string;
  reason: string;
  sourceAnswerRefs: SourceAnswerRef[];
};

export type StartupScanClue = {
  id: string;
  text: string;
  sourceAnswerRefs: SourceAnswerRef[];
};

export type StartupScanProfile = {
  version: "1.1";
  completedAt: string;
  scanStatus: "completed";
  scanClues: StartupScanClue[];
  suggestedSubsystems: SuggestedSubsystem[];
};

export type EcosystemInternalScore = -3 | -2 | -1 | 0 | 1 | 2 | 3;

export type EcosystemDimensionId =
  | "sleepRecovery"
  | "dailyRhythm"
  | "bodyState"
  | "foodWater"
  | "activityStretch"
  | "environmentSupport";

export type EcosystemSemanticValue = {
  id: string;
  label: string;
  internalScore: EcosystemInternalScore;
};

export type EcosystemDimensionDefinition = {
  id: EcosystemDimensionId;
  label: string;
  description: string;
  values: EcosystemSemanticValue[];
};

export type EcosystemObservation = {
  id: string;
  dimensionId: EcosystemDimensionId;
  valueId: string;
  valueLabel: string;
  internalScore: EcosystemInternalScore;
  observedAt: string;
  note?: string;
};

export type EcosystemBarometerRange = "1d" | "7d" | "15d" | "30d";

export type EcosystemDimensionSummary = {
  dimensionId: EcosystemDimensionId;
  observationCount: number;
  averageInternalScore: number | null;
  lowObservationCount: number;
  latestObservation: EcosystemObservation | null;
  summaryLabel: string | null;
};

export type EnergyInternalScore = -3 | -2 | -1 | 0 | 1 | 2 | 3;

export type EnergyDimensionId =
  | "currentCapacity"
  | "pressureLoad"
  | "emotionalWeather"
  | "attentionBandwidth"
  | "socialBattery"
  | "actionResistance";

export type EnergySemanticValue = {
  id: string;
  label: string;
  internalScore: EnergyInternalScore;
};

export type EnergyDimensionDefinition = {
  id: EnergyDimensionId;
  label: string;
  description: string;
  values: EnergySemanticValue[];
};

export type EnergyObservation = {
  id: string;
  dimensionId: EnergyDimensionId;
  valueId: string;
  valueLabel: string;
  internalScore: EnergyInternalScore;
  observedAt: string;
  note?: string;
};

export type EnergyCompassRange = "1d" | "7d" | "15d" | "30d";

export type EnergyDimensionSummary = {
  dimensionId: EnergyDimensionId;
  observationCount: number;
  averageInternalScore: number | null;
  lowObservationCount: number;
  latestObservation: EnergyObservation | null;
  summaryLabel: string | null;
};

export type WalletContainer = {
  id: string;
  name: string;
  balance: number;
  color: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type MoneyAmountPattern =
  | {
      kind: "fixed";
      amount: number;
    }
  | {
      kind: "variable";
    };

export type MoneyFrequencyPattern =
  | {
      kind: "fixed";
      interval: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
    }
  | {
      kind: "variable";
    };

export type MoneyInflowSource = {
  id: string;
  name: string;
  amountPattern: MoneyAmountPattern;
  frequencyPattern: MoneyFrequencyPattern;
  targetWalletContainerId: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type MoneyInflowTargetStatus = "available" | "missing";

export type DailyExpensePool = {
  id: "default";
  balance: number;
  selectedWalletContainerId?: string;
  lastTransferAmount?: number;
  lastTransferAt?: string;
  lastTransferWalletContainerId?: string;
  lastTransferWalletContainerNameSnapshot?: string;
  createdAt: string;
  updatedAt: string;
};

export type DailyExpenseEntry = {
  id: string;
  amount: number;
  note: string;
  spentAt: string;
  createdAt: string;
  updatedAt: string;
};

export type DailyExpenseTransferSourceStatus =
  | "available"
  | "missing"
  | "unselected";
