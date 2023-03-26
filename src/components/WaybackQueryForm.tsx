import { RepeatClockIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  HStack,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { format, getUnixTime, parseISO, startOfDay, subHours } from "date-fns";
import { useMemo, useState } from "react";
import { formatWaybackQuery, WaybackQuery } from "../types/WaybackQuery";

const getNow = () => new Date();

const jaDayNames = "日月火水木金土".split("");
const jaMonthNames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
  (i) => `${i}月`
);

const SECS_IN_MINUTE = 60;
const SECS_IN_HOUR = 60 * SECS_IN_MINUTE;
const SECS_IN_DAY = 24 * SECS_IN_HOUR;
const sinceUnixtime = (date: Date, timeStr: string): number | undefined => {
  const [h, m] = timeStr.split(":").map((s) => Number(s));
  if (h === undefined || m === undefined) {
    return undefined;
  }
  return getUnixTime(startOfDay(date)) + h * SECS_IN_HOUR + m * SECS_IN_MINUTE;
};

const timeRangeUnits = ["minutes", "hours", "days"] as const;
type TimeRangeUnit = typeof timeRangeUnits[number];

const timeRangeUnitLabels: Record<TimeRangeUnit, string> = {
  minutes: "分間",
  hours: "時間",
  days: "日間",
};

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

const parseQueryParams = (): WaybackQuery | undefined => {
  const params = new URLSearchParams(location.search);
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

const clearQueryParams = () => {
  const url = new URL(location.href);
  url.search = "";
  history.replaceState(null, "", url);
};

type WaybackQueryFormProps = {
  onClickWayback: (q: WaybackQuery) => void;
};

export const WaybackQueryForm: React.FC<WaybackQueryFormProps> = ({
  onClickWayback,
}) => {
  const now = getNow();
  const [sinceDate, setSinceDate] = useState<Date>(subHours(now, 1));
  const [sinceTime, setSinceTime] = useState<string>(
    format(subHours(now, 1), "HH:mm")
  );
  const [timeRangeValue, setTimeRangeValue] = useState<number>(1);
  const [timeRangeUnit, setTimeRangeUnit] = useState<TimeRangeUnit>("hours");

  const [timeRangeFromUrl, setTimeRangeFromUrl] = useState(parseQueryParams());
  const disableInput = timeRangeFromUrl !== undefined;

  const timeRange = useMemo(() => {
    if (timeRangeFromUrl !== undefined) {
      return timeRangeFromUrl;
    }
    if (timeRangeValue === 0) {
      return undefined;
    }

    const since = sinceUnixtime(sinceDate, sinceTime);
    if (since === undefined) {
      return undefined;
    }
    const until = Math.min(
      since + timeRangeValue * secsPerTimeUnit(timeRangeUnit),
      getUnixTime(getNow())
    );
    return { since, until };
  }, [timeRangeFromUrl, sinceDate, sinceTime, timeRangeValue, timeRangeUnit]);

  const handleClickWayback = () => {
    if (timeRange === undefined) {
      return;
    }
    onClickWayback({ ...timeRange });

    setTimeRangeFromUrl(undefined);
    clearQueryParams();
  };

  return (
    <div>
      <VStack>
        <Flex alignItems="center" justifyContent="start" gap={2}>
          <SingleDatepicker
            date={sinceDate}
            onDateChange={setSinceDate}
            maxDate={now}
            configs={{
              dateFormat: "yyyy/MM/dd",
              dayNames: jaDayNames,
              monthNames: jaMonthNames,
            }}
            disabled={disableInput}
          />
          <Input
            type="time"
            value={sinceTime}
            onChange={(e) => setSinceTime(e.target.value)}
            disabled={disableInput}
          />
          <Text minW="2em">から</Text>
          <NumberInput
            min={0}
            max={100}
            allowMouseWheel
            value={timeRangeValue}
            onChange={(_, n) => setTimeRangeValue(isNaN(n) ? 0 : n)}
            isDisabled={disableInput}
            minW="5em"
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Select
            value={timeRangeUnit}
            onChange={(e) => setTimeRangeUnit(e.target.value as TimeRangeUnit)}
            isDisabled={disableInput}
          >
            {Object.entries(timeRangeUnitLabels).map(([unit, label]) => (
              <option key={unit} value={unit}>
                {label}
              </option>
            ))}
          </Select>
        </Flex>
        {timeRange && (
          <HStack>
            {timeRangeFromUrl && (
              <Text fontWeight={"bold"}>URLによる指定:</Text>
            )}
            <Text>{formatWaybackQuery(timeRange)}</Text>
          </HStack>
        )}
        {!timeRange && <Text>入力中...</Text>}
        <Button
          colorScheme="purple"
          onClick={handleClickWayback}
          isDisabled={timeRange === undefined}
        >
          <HStack>
            <RepeatClockIcon />
            <Text>遡る</Text>
          </HStack>
        </Button>
      </VStack>
    </div>
  );
};
