export type ResetConfirmationInput = {
  confirmed: boolean;
  typedText?: string;
  expectedText?: string;
};

export type ResetLifeOSDataInput = ResetConfirmationInput & {
  reset: () => Promise<void>;
  onReset?: () => void;
};

export type ResetLifeOSDataResult = {
  status: "cancelled" | "reset";
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
