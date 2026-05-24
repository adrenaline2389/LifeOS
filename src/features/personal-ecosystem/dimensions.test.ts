import { describe, expect, it } from "vitest";

import { ECOSYSTEM_DIMENSIONS } from "./dimensions";

const scoreRange = [-3, -2, -1, 0, 1, 2, 3];

describe("personal ecosystem dimensions", () => {
  it("defines the six v1.2 ecosystem dimensions in the required order", () => {
    expect(
      ECOSYSTEM_DIMENSIONS.map((dimension) => ({
        id: dimension.id,
        label: dimension.label,
      })),
    ).toEqual([
      { id: "sleepRecovery", label: "睡眠恢复" },
      { id: "dailyRhythm", label: "作息节律" },
      { id: "bodyState", label: "身体状态" },
      { id: "foodWater", label: "饮食饮水" },
      { id: "activityStretch", label: "活动舒展" },
      { id: "environmentSupport", label: "环境支撑" },
    ]);
  });

  it("gives every dimension exactly seven semantic values covering -3 to +3", () => {
    for (const dimension of ECOSYSTEM_DIMENSIONS) {
      expect(dimension.values).toHaveLength(7);
      expect(
        dimension.values
          .map((value) => value.internalScore)
          .sort((left, right) => left - right),
      ).toEqual(scoreRange);
    }
  });

  it("keeps missing observation out of the semantic values", () => {
    expect(
      ECOSYSTEM_DIMENSIONS.flatMap((dimension) =>
        dimension.values.map((value) => value.label),
      ),
    ).not.toContain("没观察");
  });

  it("stores the v1.2 semantic labels for each dimension", () => {
    const labelsByDimension = Object.fromEntries(
      ECOSYSTEM_DIMENSIONS.map((dimension) => [
        dimension.id,
        dimension.values.map((value) => value.label),
      ]),
    );

    expect(labelsByDimension).toEqual({
      sleepRecovery: ["很恢复", "够用", "勉强够", "断续", "偏少", "很差", "几乎没睡"],
      dailyRhythm: ["顺畅", "稳定", "基本在轨", "有点散", "被打断", "很混乱", "昼夜反转"],
      bodyState: ["轻盈", "稳定", "可用", "有点沉", "疲惫", "紧绷", "不适"],
      foodWater: ["很稳定", "基本稳定", "还可以", "有点乱", "偏少", "过量或失衡", "忘了照顾"],
      activityStretch: ["很舒展", "有活动", "走动过", "普通", "久坐", "僵住", "透支"],
      environmentSupport: ["清爽", "舒服", "可接受", "有点乱", "分心", "拖累", "压迫感"],
    });
  });
});
