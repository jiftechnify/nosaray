const timeRangeUnits = ["minutes", "hours", "days"] as const;
export type TimeRangeUnit = typeof timeRangeUnits[number];

const timeRangeShortUnits = ["m", "h", "d"] as const;
type TimeRangeShortUnit = typeof timeRangeShortUnits[number];

const timeRangeUnitConversions: Record<TimeRangeUnit, TimeRangeShortUnit> &
  Record<TimeRangeShortUnit, TimeRangeUnit> = {
  minutes: "m",
  m: "minutes",
  hours: "h",
  h: "hours",
  days: "d",
  d: "days",
};

export const TimeRangeUnit = {
  toShort(u: TimeRangeUnit): TimeRangeShortUnit {
    return timeRangeUnitConversions[u];
  },
  toLong(u: TimeRangeShortUnit): TimeRangeUnit {
    return timeRangeUnitConversions[u];
  },
  isShortUnit(s: string): s is TimeRangeShortUnit {
    return (timeRangeShortUnits as readonly string[]).includes(s);
  },
  isLongUnit(s: string): s is TimeRangeUnit {
    return (timeRangeUnits as readonly string[]).includes(s);
  },
} as const;
