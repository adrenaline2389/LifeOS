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

export type IdentifiedParameter = {
  id: string;
  label: string;
  values: string[];
  sourceQuestionIds: string[];
};

export type PendingObservation = {
  id: string;
  text: string;
  status: "pending";
  sourceAnswerRefs: SourceAnswerRef[];
};

export type SubsystemId =
  | "energy"
  | "goals"
  | "relationships"
  | "finance"
  | "cognition"
  | "manual";

export type SuggestedSubsystem = {
  id: SubsystemId;
  label: string;
  reason: string;
  sourceAnswerRefs: SourceAnswerRef[];
};

export type ManualSection = {
  id: string;
  title: string;
  content: string;
  source: "generated" | "user-edited";
  updatedAt: string;
};

export type ManualProfile = {
  version: "1.0";
  selfClarity: "hazy";
  identifiedParameters: IdentifiedParameter[];
  pendingObservations: PendingObservation[];
  suggestedSubsystems: SuggestedSubsystem[];
  futureSelfNote?: string;
  editableSections: ManualSection[];
};

export type LifeOSExportData = {
  exportedAt: string;
  onboardingAnswer: OnboardingAnswerRecord | null;
  manualProfile: ManualProfile | null;
};
