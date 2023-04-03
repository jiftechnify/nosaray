const timeUnits = ["minutes", "hours", "days"] as const;
export type TimeUnit = typeof timeUnits[number];

const shortTimeUnits = ["m", "h", "d"] as const;
type ShortTimeUnit = typeof shortTimeUnits[number];

const timeUnitConversions: Record<TimeUnit, ShortTimeUnit> &
  Record<ShortTimeUnit, TimeUnit> = {
  minutes: "m",
  m: "minutes",
  hours: "h",
  h: "hours",
  days: "d",
  d: "days",
};

export const TimeUnit = {
  toShort(u: TimeUnit): ShortTimeUnit {
    return timeUnitConversions[u];
  },
  toLong(u: ShortTimeUnit): TimeUnit {
    return timeUnitConversions[u];
  },
  isShortUnit(s: string): s is ShortTimeUnit {
    return (shortTimeUnits as readonly string[]).includes(s);
  },
  isLongUnit(s: string): s is TimeUnit {
    return (timeUnits as readonly string[]).includes(s);
  },
} as const;
