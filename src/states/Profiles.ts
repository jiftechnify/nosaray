import { atom, getDefaultStore, useSetAtom } from "jotai";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { EventFetcher } from "../nostr/EventFetcher";
import type { NostrProfile } from "../types/NostrProfile";
import type { RelayList } from "../types/RelayList";

const store = getDefaultStore();

const profilesAtom = atom<Record<string, NostrProfile>>({});

export const useProfileSetter = (): ((
  pubkey: string,
  profile: NostrProfile
) => void) => {
  const setProfiles = useSetAtom(profilesAtom);
  return (pubkey: string, profile: NostrProfile) => {
    setProfiles((prev) => {
      return { ...prev, [pubkey]: profile };
    });
  };
};

export const profileAtomFamily = atomFamily((pubkey: string) =>
  atom(
    (get) => get(profilesAtom)[pubkey],
    (get, set, arg: NostrProfile) => {
      const prev = get(profilesAtom);
      set(profilesAtom, { ...prev, [pubkey]: arg });
    }
  )
);

export const myPubkeyAtom = atomWithStorage<string>("my_pubkey", "");

type UserData = {
  pubkey: string;
  profile?: NostrProfile;
  followList: string[];
  relayList: RelayList;
};

export const myDataAtom = atom(async (get): Promise<UserData> => {
  const pubkey = get(myPubkeyAtom);
  if (pubkey === "") {
    return {
      pubkey: "",
      followList: [],
      relayList: {},
    };
  }

  const [profile, followsAndRelays] = await Promise.all([
    EventFetcher.fetchSingleProfile(pubkey, []),
    EventFetcher.fetchFollowAndRelayList(pubkey, []),
  ]);

  if (profile) {
    store.set(profileAtomFamily(pubkey), profile);
  }

  return {
    pubkey,
    profile,
    followList: followsAndRelays ? followsAndRelays.followList : [],
    relayList: followsAndRelays ? followsAndRelays.relayList : {},
  };
});
