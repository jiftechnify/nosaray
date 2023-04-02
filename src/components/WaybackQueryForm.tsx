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
import { format, subHours } from "date-fns";
import { useSetAtom } from "jotai";
import { useMemo, useState } from "react";
import { waybackQueryInputsAtom } from "../states/WaybackQuery";
import type { TimeRangeUnit } from "../types/TimeRangeUnit";
import { WaybackQuery, WaybackQueryInputs } from "../types/WaybackQuery";

const getNow = () => new Date();

const jaDayNames = "日月火水木金土".split("");
const jaMonthNames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
  (i) => `${i}月`
);

const timeRangeUnitLabels: Record<TimeRangeUnit, string> = {
  minutes: "分間",
  hours: "時間",
  days: "日間",
};

const formatQueryFromInputs = (i: WaybackQueryInputs | undefined): string => {
  if (i === undefined) {
    return "入力中...";
  }
  const q = WaybackQuery.fromInputs(i);
  if (q === undefined) {
    return "入力中...";
  }
  return WaybackQuery.format(q);
};

export const WaybackQueryForm: React.FC = () => {
  const now = getNow();
  const [sinceDate, setSinceDate] = useState<Date>(subHours(now, 1));
  const [sinceTime, setSinceTime] = useState<string>(
    format(subHours(now, 1), "HH:mm")
  );
  const [timeRangeValue, setTimeRangeValue] = useState<number>(1);
  const [timeRangeUnit, setTimeRangeUnit] = useState<TimeRangeUnit>("hours");

  const setQueryInputs = useSetAtom(waybackQueryInputsAtom);
  const queryInputs = useMemo(() => {
    const sinceDatetime = `${format(sinceDate, "yyyy-MM-dd")}T${sinceTime}`;
    return {
      sinceDatetime,
      timeRangeValue,
      timeRangeUnit,
    };
  }, [sinceDate, sinceTime, timeRangeValue, timeRangeUnit]);

  const handleClickWayback = () => {
    if (queryInputs === undefined) {
      return;
    }
    setQueryInputs(queryInputs);
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
          />
          <Input
            type="time"
            value={sinceTime}
            onChange={(e) => setSinceTime(e.target.value)}
          />
          <Text minW="2em">から</Text>
          <NumberInput
            min={0}
            max={100}
            allowMouseWheel
            value={timeRangeValue}
            onChange={(_, n) => setTimeRangeValue(isNaN(n) ? 0 : n)}
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
          >
            {Object.entries(timeRangeUnitLabels).map(([unit, label]) => (
              <option key={unit} value={unit}>
                {label}
              </option>
            ))}
          </Select>
        </Flex>
        <Text>{formatQueryFromInputs(queryInputs)}</Text>
        <Button
          colorScheme="purple"
          onClick={handleClickWayback}
          isDisabled={queryInputs === undefined}
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
