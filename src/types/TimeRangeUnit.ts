const timeRangeUnits = ["minutes", "hours", "days"] as const;
export type TimeRangeUnit = typeof timeRangeUnits[number];

export const timeRangeUnitLabels: Record<TimeRangeUnit, string> = {
  minutes: "分間",
  hours: "時間",
  days: "日間",
};
