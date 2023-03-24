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
  followList?: string[];
  relayList?: RelayList;
};

const myDataInitializedAtom = atom(false);

export const myDataAtom = atom(async (get): Promise<UserData> => {
  const pubkey = get(myPubkeyAtom);
  if (pubkey === "") {
    return {
      pubkey: "",
      profile: undefined,
      followList: undefined,
      relayList: undefined,
    };
  }

  const [profile, { followList, relayList }] = await Promise.all([
    EventFetcher.fetchSingleProfile(pubkey, []),
    EventFetcher.fetchFollowAndRelayList(pubkey, []),
  ]);

  if (profile) {
    store.set(profileAtomFamily(pubkey), profile);
  }
  store.set(myDataInitializedAtom, true);

  return {
    pubkey,
    profile,
    followList,
    relayList,
  };
});

store.sub(myDataInitializedAtom, async () => {
  if (store.get(myDataInitializedAtom)) {
    const { followList, relayList } = await store.get(myDataAtom);
    if (followList === undefined || relayList === undefined) {
      return;
    }
    const readRelays = Object.entries(relayList)
      .filter(([, usage]) => usage.read)
      .map(([url]) => url);

    for await (const [pubkey, profile] of EventFetcher.fetchProfiles(
      followList,
      readRelays
    )) {
      const profileAtom = profileAtomFamily(pubkey);
      store.set(profileAtom, profile);
    }
  }
});
