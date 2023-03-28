import { atom, getDefaultStore } from "jotai";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { EventFetcher } from "../nostr/EventFetcher";
import { getReadRelays } from "../nostr/utils";
import type { NostrProfile, NostrProfileWithMeta } from "../types/NostrProfile";
import type { RelayList } from "../types/RelayList";
import { nip07ExtAtom } from "./Nip07Ext";

const store = getDefaultStore();

export const profilesAtom = atom<Record<string, NostrProfileWithMeta>>({});

export const profileAtomFamily = atomFamily((pubkey: string) =>
  atom(
    (get) => get(profilesAtom)[pubkey],
    (get, set, arg: NostrProfileWithMeta) => {
      const prev = get(profilesAtom);
      const prevProfile = prev[pubkey];
      if (prevProfile && arg.created_at < prevProfile.created_at) {
        return;
      }
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

export const myDataInitializedAtom = atom(false);

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

  const nip07Ext = await get(nip07ExtAtom);
  const readRelaysFromExt = getReadRelays((await nip07Ext?.getRelays()) ?? {});

  const [profile, { followList, relayList }] = await Promise.all([
    EventFetcher.fetchSingleProfile(pubkey, readRelaysFromExt),
    EventFetcher.fetchFollowAndRelayList(pubkey, readRelaysFromExt),
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
    for await (const profile of EventFetcher.fetchProfiles(
      followList,
      getReadRelays(relayList)
    )) {
      const profileAtom = profileAtomFamily(profile.pubkey);
      store.set(profileAtom, profile);
    }
  }
});

export const clearProfiles = () => {
  store.set(profilesAtom, {});
  store.set(myDataInitializedAtom, false);
};
