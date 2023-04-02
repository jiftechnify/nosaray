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
import { ongoingWaybackQueryAtom } from "../states/WaybackQuery";
import { TimeRangeUnit, timeRangeUnitLabels } from "../types/TimeRangeUnit";
import { formatWaybackQuery, WaybackQuery } from "../types/WaybackQuery";

const getNow = () => new Date();

const jaDayNames = "日月火水木金土".split("");
const jaMonthNames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
  (i) => `${i}月`
);

export const WaybackQueryForm: React.FC = () => {
  const now = getNow();
  const [sinceDate, setSinceDate] = useState<Date>(subHours(now, 1));
  const [sinceTime, setSinceTime] = useState<string>(
    format(subHours(now, 1), "HH:mm")
  );
  const [timeRangeValue, setTimeRangeValue] = useState<number>(1);
  const [timeRangeUnit, setTimeRangeUnit] = useState<TimeRangeUnit>("hours");
  const queryFromInput = useMemo(
    () =>
      WaybackQuery.fromInputs({
        sinceDate,
        sinceTime,
        timeRangeValue,
        timeRangeUnit,
      }),
    [sinceDate, sinceTime, timeRangeValue, timeRangeUnit]
  );

  const setOngoingQuery = useSetAtom(ongoingWaybackQueryAtom);
  const handleClickWayback = () => {
    if (queryFromInput === undefined) {
      return;
    }
    setOngoingQuery({ ...queryFromInput });
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
        {queryFromInput && (
          <HStack>
            <Text>{formatWaybackQuery(queryFromInput)}</Text>
          </HStack>
        )}
        {!queryFromInput && <Text>入力中...</Text>}
        <Button
          colorScheme="purple"
          onClick={handleClickWayback}
          isDisabled={queryFromInput === undefined}
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
