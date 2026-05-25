import { describe, expect, it } from "vitest";

import { ENERGY_DIMENSIONS } from "./dimensions";

const scoreRange = [-3, -2, -1, 0, 1, 2, 3];

describe("energy management dimensions", () => {
  it("defines the six v1.3 energy dimensions in the required order", () => {
    expect(
      ENERGY_DIMENSIONS.map((dimension) => ({
        id: dimension.id,
        label: dimension.label,
      })),
    ).toEqual([
      { id: "currentCapacity", label: "当前余量" },
      { id: "pressureLoad", label: "压力负载" },
      { id: "emotionalWeather", label: "情绪天气" },
      { id: "attentionBandwidth", label: "注意带宽" },
      { id: "socialBattery", label: "社交电量" },
      { id: "actionResistance", label: "行动阻力" },
    ]);
  });

  it("gives every dimension exactly seven semantic values covering -3 to +3", () => {
    for (const dimension of ENERGY_DIMENSIONS) {
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
      ENERGY_DIMENSIONS.flatMap((dimension) =>
        dimension.values.map((value) => value.label),
      ),
    ).not.toContain("没观察");
  });

  it("stores the v1.3 semantic labels for each dimension", () => {
    const labelsByDimension = Object.fromEntries(
      ENERGY_DIMENSIONS.map((dimension) => [
        dimension.id,
        dimension.values.map((value) => value.label),
      ]),
    );

    expect(labelsByDimension).toEqual({
      currentCapacity: ["很充足", "有余量", "够用", "勉强可用", "偏低", "快见底", "已透支"],
      pressureLoad: ["很轻", "可承载", "稍有压力", "有点满", "偏重", "很重", "过载"],
      emotionalWeather: ["明亮", "平稳", "柔和", "阴晴不定", "敏感", "低沉", "麻木/失控"],
      attentionBandwidth: ["清晰宽裕", "能聚焦", "基本在线", "有点散", "容易分心", "很难处理", "大脑宕机"],
      socialBattery: ["想连接", "可以交流", "少量可用", "看情况", "需要边界", "不想说话", "完全封闭"],
      actionResistance: ["很顺手", "可以启动", "慢慢能动", "有点卡", "难启动", "抗拒", "停摆"],
    });
  });
});
