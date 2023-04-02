import { format, fromUnixTime, getUnixTime, parseISO } from "date-fns";
import { TimeRangeUnit } from "./TimeRangeUnit";

export type WaybackQueryInputs = {
  sinceDatetime: string; // yyyy-MM-ddTHH:mm
  timeRangeValue: number;
  timeRangeUnit: TimeRangeUnit;
};

const lenRegexp = /^(\d+)([mhd])$/;

export const WaybackQueryInputs = {
  fromURLQuery(queryStr: string): WaybackQueryInputs | undefined {
    const params = new URLSearchParams(queryStr);
    const sinceStr = params.get("since");
    const lenStr = params.get("len"); // <number> ('m' | 'h' | 'd')
    if (!sinceStr || !lenStr) {
      return undefined;
    }

    const match = lenStr.match(lenRegexp);
    if (match === null) {
      return undefined;
    }
    const [, valStr, unitStr] = match;
    if (valStr === undefined || unitStr === undefined) {
      return undefined;
    }
    const val = Number(valStr);
    if (isNaN(val)) {
      return undefined;
    }

    if (!TimeRangeUnit.isShortUnit(unitStr)) {
      return undefined;
    }
    const longUnit = TimeRangeUnit.toLong(unitStr);

    return {
      sinceDatetime: sinceStr,
      timeRangeValue: val,
      timeRangeUnit: longUnit,
    };
  },
  toURLQuery(inputs: WaybackQueryInputs): string {
    const { sinceDatetime, timeRangeValue, timeRangeUnit } = inputs;
    const shortUnit = TimeRangeUnit.toShort(timeRangeUnit);

    const params = new URLSearchParams();
    params.set("since", sinceDatetime);
    params.set("len", `${timeRangeValue}${shortUnit}`);
    return params.toString();
  },
} as const;

export type WaybackQuery = {
  since: number;
  until: number;
};

const SECS_IN_MINUTE = 60;
const SECS_IN_HOUR = 60 * SECS_IN_MINUTE;
const SECS_IN_DAY = 24 * SECS_IN_HOUR;

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

const formatUnixtime = (unixtime: number) =>
  format(fromUnixTime(unixtime), "yyyy/MM/dd HH:mm");

export const WaybackQuery = {
  fromInputs({
    sinceDatetime,
    timeRangeValue,
    timeRangeUnit,
  }: WaybackQueryInputs): WaybackQuery | undefined {
    if (timeRangeValue === 0) {
      return undefined;
    }
    let since: number;
    try {
      since = getUnixTime(parseISO(sinceDatetime));
    } catch (err) {
      console.error("fromInputs: invalid sinceDatetime:", err);
      return undefined;
    }

    const until = Math.min(
      since + timeRangeValue * secsPerTimeUnit(timeRangeUnit),
      getUnixTime(new Date())
    );
    return { since, until };
  },
  format(q: WaybackQuery): string {
    return `${formatUnixtime(q.since)} 〜 ${formatUnixtime(q.until)}`;
  },
} as const;
