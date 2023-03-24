import { RepeatClockIcon } from "@chakra-ui/icons";
import { Button, HStack, Text, VStack } from "@chakra-ui/react";
import { RangeDatepicker } from "chakra-dayzed-datepicker";
import { endOfDay, getUnixTime, startOfDay } from "date-fns";
import { useState } from "react";
import type { WaybackQuery } from "../types/WaybackQuery";

type WaybackQueryFormProps = {
  onClickQuery: (q: WaybackQuery) => void;
};

const now = new Date();

export const WaybackQueryForm: React.FC<WaybackQueryFormProps> = ({
  onClickQuery,
}) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([now, now]);

  const handleClickWayback = () => {
    const [sinceDate, untilDate] = selectedDates;
    onClickQuery({
      since: getUnixTime(startOfDay(sinceDate ?? now)),
      until: getUnixTime(untilDate ? endOfDay(untilDate) : now),
    });
  };

  return (
    <div>
      <VStack>
        <Text alignSelf="start">クリックして日付範囲を設定</Text>
        <RangeDatepicker
          selectedDates={selectedDates}
          onDateChange={setSelectedDates}
          maxDate={now}
          configs={{ dateFormat: "yyyy/MM/dd" }}
        />
        <Button colorScheme="purple" onClick={handleClickWayback}>
          <HStack>
            <RepeatClockIcon />
            <Text>遡る</Text>
          </HStack>
        </Button>
      </VStack>
    </div>
  );
};
