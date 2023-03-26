import type { RelayList } from "../types/RelayList";

export const getReadRelays = (relayList: RelayList): string[] =>
  Object.entries(relayList)
    .filter(([, usage]) => usage.read)
    .map(([url]) => url);
