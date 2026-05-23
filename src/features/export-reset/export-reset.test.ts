import { describe, expect, it, vi } from "vitest";
import {
  isLifeOSResetConfirmed,
  resetLifeOSDataWithConfirmation,
} from "./index";

describe("LifeOS reset confirmation", () => {
  it("does not expose JSON, Markdown, or browser download helpers", async () => {
    const moduleExports = await import("./index");

    expect(moduleExports).not.toHaveProperty("createLifeOSExportData");
    expect(moduleExports).not.toHaveProperty("createLifeOSMarkdown");
    expect(moduleExports).not.toHaveProperty("stringifyLifeOSExportData");
    expect(moduleExports).not.toHaveProperty("triggerBrowserDownload");
  });

  it("requires explicit confirmation before reset", async () => {
    const reset = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

    expect(isLifeOSResetConfirmed({ confirmed: false })).toBe(false);
    await expect(
      resetLifeOSDataWithConfirmation({ confirmed: false, reset }),
    ).resolves.toEqual({ status: "cancelled" });
    expect(reset).not.toHaveBeenCalled();
  });

  it("can require an exact typed confirmation phrase", async () => {
    const reset = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

    expect(
      isLifeOSResetConfirmed({
        confirmed: true,
        typedText: "清空 LifeOS",
        expectedText: "清空 LifeOS",
      }),
    ).toBe(true);

    await expect(
      resetLifeOSDataWithConfirmation({
        confirmed: true,
        typedText: "清空 LifeOS",
        expectedText: "清空 LifeOS",
        reset,
      }),
    ).resolves.toEqual({ status: "reset" });
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
