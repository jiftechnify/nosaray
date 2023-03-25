import {
  eventKind,
  FetchTimeRangeFilter,
  NostrEvent,
  NostrFetcher,
} from "nostr-fetch";
import type { NostrProfile, NostrProfileWithMeta } from "../types/NostrProfile";
import type { RelayList } from "../types/RelayList";

const fetcher = new NostrFetcher({ enableDebugLog: true });

const bootstrapRelays = [
  "wss://relay-jp.nostr.wirednet.jp",
  "wss://relay.damus.io",
];

export class EventFetcher {
  private static withBootstraps(relayUrls: string[]) {
    return [...relayUrls, ...bootstrapRelays];
  }

  public static async fetchSingleProfile(
    pubkey: string,
    relayUrls: string[]
  ): Promise<NostrProfileWithMeta | undefined> {
    const ev = await fetcher.fetchLastEvent(this.withBootstraps(relayUrls), [
      { authors: [pubkey], kinds: [eventKind.metadata] },
    ]);
    if (ev === undefined) {
      return undefined;
    }

    try {
      const profile = JSON.parse(ev.content) as NostrProfile; // TODO: schema validation
      return { ...profile, pubkey: ev.pubkey, created_at: ev.created_at };
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  public static async *fetchProfiles(
    pubkeys: string[],
    relayUrls: string[]
  ): AsyncIterable<NostrProfileWithMeta> {
    const evIter = await fetcher.allEventsIterator(
      this.withBootstraps(relayUrls),
      [{ authors: pubkeys, kinds: [eventKind.metadata] }],
      {}
    );

    for await (const ev of evIter) {
      try {
        const profile = JSON.parse(ev.content) as NostrProfile; // TODO: schema validation
        yield { ...profile, pubkey: ev.pubkey, created_at: ev.created_at };
      } catch (err) {
        console.error(err);
      }
    }
  }

  public static async fetchFollowAndRelayList(
    pubkey: string,
    relayUrls: string[]
  ): Promise<{ followList: string[]; relayList: RelayList }> {
    const [k3, k10002] = await Promise.all(
      [eventKind.contacts, eventKind.relayList].map(async (kind) =>
        fetcher.fetchLastEvent(this.withBootstraps(relayUrls), [
          { authors: [pubkey], kinds: [kind] },
        ])
      )
    );

    const followList = k3
      ? k3.tags
          .filter((t) => t.length >= 2 && t[0] === "p")
          .map((t) => t[1] as string)
      : [];
    const relayList = k10002
      ? parseRelayListInKind10002(k10002)
      : k3
      ? parseRelayListInKind3(k3)
      : {};

    return { followList, relayList };
  }

  public static async *fetchTextNotes(
    pubkeys: string[],
    timeRangeFilter: FetchTimeRangeFilter,
    relayUrls: string[]
  ): AsyncIterable<NostrEvent> {
    const evIter = await fetcher.allEventsIterator(
      this.withBootstraps(relayUrls),
      [{ authors: pubkeys, kinds: [eventKind.text] }],
      timeRangeFilter
    );
    for await (const ev of evIter) {
      yield ev;
    }
  }
}

const parseRelayListInKind3 = (ev: NostrEvent): RelayList => {
  try {
    return JSON.parse(ev.content) as RelayList; // TODO: schema validation
  } catch (err) {
    console.error("failed to parse kind 3 event:", err);
    return {};
  }
};

const parseRelayListInKind10002 = (ev: NostrEvent): RelayList => {
  const res: RelayList = {};

  ev.tags
    .filter((t) => t.length >= 2 && t[0] === "r")
    .forEach((t) => {
      const [, url, relayType] = t as [string, string, string | undefined];

      if (relayType === undefined) {
        res[url] = { read: true, write: true };
      } else {
        switch (relayType) {
          case "read":
            res[url] = { read: true, write: false };
            return;
          case "write":
            res[url] = { read: false, write: true };
            return;
          default:
            console.warn("invalid relay type in kind 10002 event:", relayType);
        }
      }
    });

  return res;
};
