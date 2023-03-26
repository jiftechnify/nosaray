import { atom, getDefaultStore, useAtomValue, useSetAtom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { NostrEvent } from "nostr-fetch";
import { useEffect } from "react";
import { EventFetcher } from "../nostr/EventFetcher";
import type { WaybackQuery } from "../types/WaybackQuery";
import { myDataAtom } from "./Profiles";

const store = getDefaultStore();

const postsAtom = atom(new Map<string, NostrEvent>());

const postAtomFamily = atomFamily((eventId: string) =>
  atom(
    (get) => get(postsAtom).get(eventId),
    (get, set, id: string, evPost: NostrEvent | undefined) => {
      const prev = get(postsAtom);

      if (evPost !== undefined) {
        // addition
        if (prev.has(id)) {
          return;
        }
        const copied = new Map(prev);
        copied.set(id, evPost);
        set(postsAtom, copied);
      } else {
        // deletion
        if (!prev.has(id)) {
          return;
        }
        const copied = new Map(prev);
        copied.delete(id);
        set(postsAtom, copied);
      }
    }
  )
);

export type PostQuery = {
  order: "created-at-desc" | "created-at-asc";
};

const postQueryAtom = atom<PostQuery>({ order: "created-at-desc" });

const postIdsAtom = atom((get) => {
  const posts = Array.from(get(postsAtom).values());
  const query = get(postQueryAtom);

  switch (query.order) {
    case "created-at-desc":
      return posts.sort((a, b) => b.created_at - a.created_at).map((p) => p.id);
    case "created-at-asc":
      return posts.sort((a, b) => a.created_at - b.created_at).map((p) => p.id);
  }
});

export const usePost = (id: string) => {
  const post = useAtomValue(postAtomFamily(id));
  return post;
};

export const usePostIds = (postQuery: PostQuery) => {
  const setPostQuery = useSetAtom(postQueryAtom);
  const postIds = useAtomValue(postIdsAtom);

  useEffect(() => {
    setPostQuery(postQuery);
  }, [postQuery, setPostQuery]);

  return postIds;
};

export const clearPosts = () => {
  if (store.get(postsAtom).size > 0) {
    store.set(postsAtom, new Map<string, NostrEvent>());
  }
};

export const startFetchingPosts = async (waybackQuery: WaybackQuery) => {
  const myData = await store.get(myDataAtom);
  const readRelays = (() => {
    if (myData?.relayList === undefined) {
      return undefined;
    }
    return Object.entries(myData.relayList)
      .filter(([, usage]) => usage.read)
      .map(([url]) => url);
  })();

  if (
    myData.pubkey === "" ||
    myData.followList === undefined ||
    readRelays === undefined
  ) {
    return;
  }

  clearPosts();

  for await (const ev of EventFetcher.fetchTextNotes(
    dedup([...myData.followList, myData.pubkey]),
    waybackQuery,
    readRelays
  )) {
    const { id } = ev;
    const setterAtom = postAtomFamily(id);
    store.set(setterAtom, id, ev);
  }
};

function dedup<T>(arr: T[]) {
  return Array.from(new Set(arr));
}
