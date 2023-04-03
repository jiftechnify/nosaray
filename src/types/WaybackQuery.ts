import { format, fromUnixTime, getUnixTime, parseISO } from "date-fns";
import { TimeUnit } from "./TimeUnit";

export type WaybackQueryInputs = {
  sinceDatetime: string; // yyyy-MM-ddTHH:mm
  durationValue: number;
  durationUnit: TimeUnit;
};

const lenRegexp = /^(\d+)([mhd])$/;

export const WaybackQueryInputs = {
  fromURLQuery(queryStr: string): WaybackQueryInputs | undefined {
    const params = new URLSearchParams(queryStr);
    const sinceStr = params.get("since");
    const durStr = params.get("dur") || params.get("len"); // "len" is legacy name
    if (!sinceStr || !durStr) {
      return undefined;
    }

    const match = durStr.match(lenRegexp);
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

    if (!TimeUnit.isShortUnit(unitStr)) {
      return undefined;
    }
    const longUnit = TimeUnit.toLong(unitStr);

    return {
      sinceDatetime: sinceStr,
      durationValue: val,
      durationUnit: longUnit,
    };
  },
  toURLQuery(inputs: WaybackQueryInputs): string {
    const { sinceDatetime, durationValue, durationUnit } = inputs;
    const shortUnit = TimeUnit.toShort(durationUnit);

    const params = new URLSearchParams();
    params.set("since", sinceDatetime);
    params.set("dur", `${durationValue}${shortUnit}`);
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

const secsPerTimeUnit = (unit: TimeUnit): number => {
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
    durationValue,
    durationUnit,
  }: WaybackQueryInputs): WaybackQuery | undefined {
    if (durationValue === 0) {
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
      since + durationValue * secsPerTimeUnit(durationUnit),
      getUnixTime(new Date())
    );
    return { since, until };
  },
  format(q: WaybackQuery): string {
    return `${formatUnixtime(q.since)} 〜 ${formatUnixtime(q.until)}`;
  },
} as const;
