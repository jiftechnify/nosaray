import { RepeatClockIcon } from "@chakra-ui/icons";
import {
  Button,
  HStack,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { addMinutes, differenceInMilliseconds, format, getUnixTime, startOfMinute, subHours } from "date-fns";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { waybackQueryInputsAtom } from "../states/WaybackQuery";
import type { TimeUnit } from "../types/TimeUnit";
import { WaybackQuery, WaybackQueryInputs } from "../types/WaybackQuery";

const getNow = () => new Date();

const jaDayNames = "日月火水木金土".split("");
const jaMonthNames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => `${i}月`);

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
  const setQueryInputs = useSetAtom(waybackQueryInputsAtom);

  const sinceAndDurForm = useSinceAndDurForm();
  const untilNowForm = useUntilNowForm();

  const tabs = [
    { key: "since-dur", label: "始点+期間", form: sinceAndDurForm },
    { key: "until-now", label: "現在まで", form: untilNowForm },
  ];
  const [tabIdx, setTabIdx] = useState(0);
  const queryInputs = tabs[tabIdx]?.form.queryInputs;

  const handleClickWayback = () => {
    if (queryInputs === undefined) {
      return;
    }
    setQueryInputs(queryInputs);
  };

  return (
    <VStack w="100%">
      <Tabs w="100%" colorScheme="purple" onChange={(idx) => setTabIdx(idx)}>
        <TabList>
          {tabs.map((t) => (
            <Tab key={t.key}>{t.label}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabs.map((t) => (
            <TabPanel key={t.key}>{t.form.view}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      <Text>{formatQueryFromInputs(queryInputs)}</Text>
      <Button colorScheme="purple" onClick={handleClickWayback} isDisabled={queryInputs === undefined}>
        <HStack>
          <RepeatClockIcon />
          <Text>遡る</Text>
        </HStack>
      </Button>
    </VStack>
  );
};

const durTimeUnitLabels: Record<TimeUnit, string> = {
  minutes: "分間",
  hours: "時間",
  days: "日間",
};

const useSinceAndDurForm = () => {
  const now = getNow();
  const [sinceDate, setSinceDate] = useState<Date>(subHours(now, 1));
  const [sinceTime, setSinceTime] = useState<string>(format(subHours(now, 1), "HH:mm"));
  const [durationValue, setDurationValue] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState<TimeUnit>("hours");

  const queryInputs: WaybackQueryInputs = useMemo(() => {
    const sinceDatetime = `${format(sinceDate, "yyyy-MM-dd")}T${sinceTime}`;
    return {
      type: "since-and-dur",
      sinceDatetime,
      durationValue,
      durationUnit,
    };
  }, [sinceDate, sinceTime, durationValue, durationUnit]);

  const view = (
    <HStack alignItems="center" justifyContent="center">
      <SingleDatepicker
        date={sinceDate}
        onDateChange={setSinceDate}
        maxDate={now}
        configs={{
          dateFormat: "yyyy/MM/dd",
          dayNames: jaDayNames,
          monthNames: jaMonthNames,
        }}
        propsConfigs={{
          inputProps: { w: "140px" },
        }}
      />
      <Input type="time" value={sinceTime} onChange={(e) => setSinceTime(e.target.value)} w="120px" />
      <Text minW="2em">から</Text>
      <NumberInput
        min={0}
        max={100}
        allowMouseWheel
        value={durationValue}
        onChange={(_, n) => setDurationValue(isNaN(n) ? 0 : n)}
        w="120px"
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Select value={durationUnit} onChange={(e) => setDurationUnit(e.target.value as TimeUnit)} w="fit-content">
        {Object.entries(durTimeUnitLabels).map(([unit, label]) => (
          <option key={unit} value={unit}>
            {label}
          </option>
        ))}
      </Select>
    </HStack>
  );

  return {
    queryInputs,
    view,
  };
};

const agoTimeUnitLabels: Record<TimeUnit, string> = {
  minutes: "分",
  hours: "時間",
  days: "日",
};

const useUntilNowForm = () => {
  const [durationValue, setDurationValue] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState<TimeUnit>("hours");
  const tick = useTickOnStartOfMinute();

  const queryInputs: WaybackQueryInputs = useMemo(() => {
    void tick; // tick is only used to trigger update

    return {
      type: "until-now",
      durationValue,
      durationUnit,
    };
  }, [durationValue, durationUnit, tick]);

  const view = (
    <HStack alignItems="center" justifyContent="center">
      <NumberInput
        min={0}
        max={100}
        allowMouseWheel
        value={durationValue}
        onChange={(_, n) => setDurationValue(isNaN(n) ? 0 : n)}
        w="120px"
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Select w="fit-content" value={durationUnit} onChange={(e) => setDurationUnit(e.target.value as TimeUnit)}>
        {Object.entries(agoTimeUnitLabels).map(([unit, label]) => (
          <option key={unit} value={unit}>
            {label}
          </option>
        ))}
      </Select>
      <Text>前から現在まで</Text>
    </HStack>
  );

  return {
    queryInputs,
    view,
  };
};

// returns timestamp that will be updated on every start of minute.
// can be used to trigger action every minute.
const useTickOnStartOfMinute = () => {
  const [timestamp, setTimestamp] = useState(getUnixTime(getNow()));
  const timer = useRef<NodeJS.Timeout | undefined>(undefined);

  const setNextTick = useCallback(() => {
    const currTime = getNow();
    const nextTickTime = startOfMinute(addMinutes(currTime, 1));

    timer.current = setTimeout(
      () => {
        setTimestamp(getUnixTime(getNow()));
        setNextTick();
      },
      differenceInMilliseconds(nextTickTime, currTime),
    );
  }, []);

  useEffect(() => {
    setNextTick();
    return () => {
      if (timer.current !== undefined) {
        clearTimeout(timer.current);
      }
    };
  }, [setNextTick]);

  return timestamp;
};
