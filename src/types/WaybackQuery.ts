import { format, fromUnixTime, getUnixTime, parseISO } from "date-fns";

export interface WaybackQuery {
  since: number;
  until: number;
}

const formatUnixtime = (unixtime: number) =>
  format(fromUnixTime(unixtime), "yyyy/MM/dd HH:mm");

export const formatWaybackQuery = (q: WaybackQuery): string =>
  `${formatUnixtime(q.since)} 〜 ${formatUnixtime(q.until)}`;

const timeRangeUnits = ["minutes", "hours", "days"] as const;
export type TimeRangeUnit = typeof timeRangeUnits[number];

const SECS_IN_MINUTE = 60;
const SECS_IN_HOUR = 60 * SECS_IN_MINUTE;
const SECS_IN_DAY = 24 * SECS_IN_HOUR;
// const sinceUnixtime = (date: Date, timeStr: string): number | undefined => {
//   const [h, m] = timeStr.split(":").map((s) => Number(s));
//   if (h === undefined || m === undefined) {
//     return undefined;
//   }
//   return getUnixTime(startOfDay(date)) + h * SECS_IN_HOUR + m * SECS_IN_MINUTE;
// };

const secsPerTimeUnit = (unit: TimeRangeUnit): number => {
  switch (unit) {
    case "minutes":
      return SECS_IN_MINUTE;
    case "hours":
      return SECS_IN_HOUR;
    case "days":
      return SECS_IN_DAY;
  }
};

const parseTimeRangeLengthStr = (lenStr: string): number | undefined => {
  const lenRegexp = /^(\d+)([mhd])$/;
  const match = lenStr.match(lenRegexp);
  if (match === null) {
    return undefined;
  }
  const [, valStr, unit] = match;
  if (valStr === undefined || unit === undefined) {
    return undefined;
  }

  const val = Number(valStr);
  if (isNaN(val)) {
    return undefined;
  }
  switch (unit) {
    case "m":
      return val * secsPerTimeUnit("minutes");
    case "h":
      return val * secsPerTimeUnit("hours");
    case "d":
      return val * secsPerTimeUnit("days");
    default:
      return undefined;
  }
};

export class WaybackQuery {
  public static fromURLQueryStr = (
    queryStr: string
  ): WaybackQuery | undefined => {
    const params = new URLSearchParams(queryStr);
    const sinceStr = params.get("since"); // unixtime in seconds
    const lenStr = params.get("len"); // <number> ('m' | 'h' | 'd')
    if (!sinceStr || !lenStr) {
      return undefined;
    }

    let since: number;
    try {
      since = getUnixTime(parseISO(sinceStr));
    } catch (err) {
      console.error("parseQueryParams: 'since' is invalid:", err);
      return undefined;
    }
    const len = parseTimeRangeLengthStr(lenStr);
    if (isNaN(since) || len === undefined) {
      return undefined;
    }
    console.log("parseQueryParams", since, len);
    return { since, until: since + len };
  };
}
