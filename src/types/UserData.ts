import type { NostrProfile } from "./NostrProfile";
import type { RelayList } from "./RelayList";

export type UserData = {
  pubkey: string;
  profile?: NostrProfile;
  followList?: string[];
  relayList?: RelayList;
};
