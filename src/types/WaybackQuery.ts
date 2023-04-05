import {
  endOfMinute,
  format,
  fromUnixTime,
  getUnixTime,
  parseISO,
} from "date-fns";
import { TimeUnit } from "./TimeUnit";

type DurationInputs = {
  durationValue: number;
  durationUnit: TimeUnit;
};

type WBQueryInputsSinceAndDur = {
  type: "since-and-dur";
  sinceDatetime: string; // yyyy-MM-ddTHH:mm
} & DurationInputs;

type WBQueryInputsUntilNow = {
  type: "until-now";
} & DurationInputs;

export type WaybackQueryInputs =
  | WBQueryInputsSinceAndDur
  | WBQueryInputsUntilNow;

type WBQueryInputsTypes = WaybackQueryInputs["type"];

const durRegexp = /^(\d+)([mhd])$/;

const parseDurationInputs = (
  durStr: string
): { durationValue: number; durationUnit: TimeUnit } | undefined => {
  const match = durStr.match(durRegexp);
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
    durationValue: val,
    durationUnit: longUnit,
  };
};

const stringifyDurationInputs = ({
  durationValue: value,
  durationUnit: unit,
}: DurationInputs): string => {
  const shortUnit = TimeUnit.toShort(unit);
  return `${value}${shortUnit}`;
};

const detectWBQueryType = (
  urlParams: URLSearchParams
): WBQueryInputsTypes | undefined => {
  if (
    urlParams.has("since") &&
    (urlParams.has("dur") || urlParams.has("len"))
  ) {
    return "since-and-dur";
  }
  if (urlParams.has("ago")) {
    return "until-now";
  }
  return undefined;
};

const sinceAndDurfromURLQuery = (
  params: URLSearchParams
): WaybackQueryInputs | undefined => {
  const sinceStr = params.get("since");
  const durStr = params.get("dur") || params.get("len"); // "len" is legacy name

  if (!sinceStr || !durStr) {
    return undefined;
  }

  const dur = parseDurationInputs(durStr);
  if (!dur) {
    return undefined;
  }

  return {
    type: "since-and-dur",
    sinceDatetime: sinceStr,
    ...dur,
  };
};

const untilNowfromURLQuery = (
  params: URLSearchParams
): WaybackQueryInputs | undefined => {
  const agoStr = params.get("ago");
  if (!agoStr) {
    return undefined;
  }

  const dur = parseDurationInputs(agoStr);
  if (!dur) {
    return undefined;
  }

  return {
    type: "until-now",
    ...dur,
  };
};

export const WaybackQueryInputs = {
  fromURLQuery(queryStr: string): WaybackQueryInputs | undefined {
    const params = new URLSearchParams(queryStr);
    const wbQueryType = detectWBQueryType(params);
    if (wbQueryType === undefined) {
      return undefined;
    }
    switch (wbQueryType) {
      case "since-and-dur":
        return sinceAndDurfromURLQuery(params);
      case "until-now":
        return untilNowfromURLQuery(params);
    }
  },
  toURLQuery(inputs: WaybackQueryInputs): string {
    const params = new URLSearchParams();
    switch (inputs.type) {
      case "since-and-dur": {
        params.set("since", inputs.sinceDatetime);
        params.set("dur", stringifyDurationInputs(inputs));
        break;
      }
      case "until-now": {
        params.set("ago", stringifyDurationInputs(inputs));
        break;
      }
    }
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

const durationInSecs = (dur: DurationInputs): number =>
  dur.durationValue * secsPerTimeUnit(dur.durationUnit);

const formatUnixtime = (unixtime: number) =>
  format(fromUnixTime(unixtime), "yyyy/MM/dd HH:mm");

export const WaybackQuery = {
  fromInputs(inputs: WaybackQueryInputs): WaybackQuery | undefined {
    switch (inputs.type) {
      case "since-and-dur": {
        if (inputs.durationValue === 0) {
          return undefined;
        }
        let since: number;
        try {
          since = getUnixTime(parseISO(inputs.sinceDatetime));
        } catch (err) {
          console.error("fromInputs: invalid sinceDatetime:", err);
          return undefined;
        }

        const until = Math.min(
          since + durationInSecs(inputs),
          getUnixTime(new Date())
        );
        return { since, until };
      }
      case "until-now": {
        if (inputs.durationValue === 0) {
          return undefined;
        }
        const now = getUnixTime(endOfMinute(new Date()));
        const since = now - durationInSecs(inputs);
        return { since, until: now };
      }
    }
  },
  format(q: WaybackQuery): string {
    return `${formatUnixtime(q.since)} 〜 ${formatUnixtime(q.until)}`;
  },
} as const;
