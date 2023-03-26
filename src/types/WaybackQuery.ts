import { format, fromUnixTime } from "date-fns";

export type WaybackQuery = {
  since: number;
  until: number;
};

const formatUnixtime = (unixtime: number) =>
  format(fromUnixTime(unixtime), "yyyy/MM/dd HH:mm");

export const formatWaybackQuery = (q: WaybackQuery): string =>
  `${formatUnixtime(q.since)} 〜 ${formatUnixtime(q.until)}`;
