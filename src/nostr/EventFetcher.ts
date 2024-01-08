import { eventKind, FetchTimeRangeFilter, NostrEvent, NostrFetcher } from "nostr-fetch";
import type { NostrProfileWithMeta } from "../types/NostrProfile";
import type { RelayList } from "../types/RelayList";
import { parseNostrProfile } from "./ProfileParser";

const fetcher = NostrFetcher.init({ minLogLevel: "info" });

const bootstrapRelays = ["wss://relay-jp.nostr.wirednet.jp", "wss://relay.damus.io"];

export class EventFetcher {
  private static withBootstraps(relayUrls: string[]) {
    return [...relayUrls, ...bootstrapRelays];
  }

  public static async fetchSingleProfile(
    pubkey: string,
    relayUrls: string[],
  ): Promise<NostrProfileWithMeta | undefined> {
    const ev = await fetcher.fetchLastEvent(this.withBootstraps(relayUrls), {
      authors: [pubkey],
      kinds: [eventKind.metadata],
    });
    if (ev === undefined) {
      return undefined;
    }

    const profile = parseNostrProfile(ev.content);
    return profile ? { ...profile, pubkey: ev.pubkey, created_at: ev.created_at } : undefined;
  }

  public static async *fetchProfiles(pubkeys: string[], relayUrls: string[]): AsyncIterable<NostrProfileWithMeta> {
    const evIter = fetcher.allEventsIterator(
      this.withBootstraps(relayUrls),
      { authors: pubkeys, kinds: [eventKind.metadata] },
      {},
    );

    for await (const ev of evIter) {
      const profile = parseNostrProfile(ev.content);
      if (!profile) {
        continue;
      }
      yield { ...profile, pubkey: ev.pubkey, created_at: ev.created_at };
    }
  }

  public static async fetchFollowAndRelayList(
    pubkey: string,
    relayUrls: string[],
  ): Promise<{ followList: string[]; relayList: RelayList }> {
    const [k3, k10002] = await Promise.all(
      [eventKind.contacts, eventKind.relayList].map(async (kind) =>
        fetcher.fetchLastEvent(this.withBootstraps(relayUrls), {
          authors: [pubkey],
          kinds: [kind],
        }),
      ),
    );

    const followList = k3 ? k3.tags.filter((t) => t.length >= 2 && t[0] === "p").map((t) => t[1] as string) : [];

    const relayList = parseRelayList([k3, k10002]);

    return { followList, relayList };
  }

  public static async *fetchTextNotes(
    pubkeys: string[],
    timeRangeFilter: FetchTimeRangeFilter,
    relayUrls: string[],
  ): AsyncIterable<NostrEvent> {
    const evIter = fetcher.allEventsIterator(
      this.withBootstraps(relayUrls),
      { authors: pubkeys, kinds: [eventKind.text] },
      timeRangeFilter,
    );
    for await (const ev of evIter) {
      if (ev.kind === eventKind.text) {
        yield ev;
      }
    }
  }
}

const parseRelayList = (evs: (NostrEvent | undefined)[]): RelayList => {
  const relayListEvs = evs.filter((ev): ev is NostrEvent => ev !== undefined && [3, 10002].includes(ev.kind));
  if (relayListEvs.length === 0) {
    return {};
  }
  const latest = relayListEvs.sort((a, b) => b.created_at - a.created_at)[0] as NostrEvent;
  switch (latest.kind) {
    case eventKind.contacts:
      return parseRelayListInKind3(latest);
    case eventKind.relayList:
      return parseRelayListInKind10002(latest);
    default:
      console.error("parseRelayList: unreachable");
      return {};
  }
};

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
