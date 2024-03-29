import type { RelayList } from "./RelayList";

type NostrEventTemplate = {
  kind: number;
  tags: string[][];
  content: string;
  created_at: number;
};

type NostrEvent = {
  kind: number;
  tags: string[][];
  content: string;
  created_at: number;
  pubkey: string;
  id: string;
  sig: string;
};

declare global {
  interface Window {
    nostr: {
      getPublicKey: () => Promise<string>;
      signEvent: (event: NostrEventTemplate) => Promise<NostrEvent>;
      getRelays: () => Promise<RelayList>;
    };
  }
}
