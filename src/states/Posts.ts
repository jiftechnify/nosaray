import { atom, getDefaultStore, useAtomValue, useSetAtom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { NostrEvent } from "nostr-fetch";
import { useEffect } from "react";
import { EventFetcher } from "../nostr/EventFetcher";
import { getReadRelays } from "../nostr/utils";
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

export type PostOrder = "created-at-desc" | "created-at-asc";

const comparePostsFn = (
  order: PostOrder
): ((a: NostrEvent, b: NostrEvent) => number) => {
  switch (order) {
    case "created-at-desc":
      return (a, b) => b.created_at - a.created_at;
    case "created-at-asc":
      return (a, b) => a.created_at - b.created_at;
  }
};

export type PostQuery = {
  order: PostOrder;
};

const postQueryAtom = atom<PostQuery>({ order: "created-at-desc" });

const postIdsAtom = atom((get) => {
  const posts = Array.from(get(postsAtom).values());
  const query = get(postQueryAtom);

  const compareFn = comparePostsFn(query.order);
  return posts.sort(compareFn).map((p) => p.id);
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
  const readRelays = myData?.relayList
    ? getReadRelays(myData.relayList)
    : undefined;

  if (
    myData.pubkey === "" ||
    myData.followList === undefined ||
    readRelays === undefined
  ) {
    return;
  }

  clearPosts();
  clearPostSelection();

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

/* Selected Post IDs */
const selectedPostIdSetAtom = atom<Set<string>>(new Set<string>());

export const clearPostSelection = () => {
  store.set(selectedPostIdSetAtom, new Set<string>());
};

/**
 * Getter returns current selection state of the post.
 *
 * Setter toggles selection state of the post.
 */
export const postSelectionAtomFamily = atomFamily((id: string) =>
  atom(
    (get) => get(selectedPostIdSetAtom).has(id),
    (get, set) => {
      const prev = get(selectedPostIdSetAtom);
      const copied = new Set(prev);

      // toggle selection
      const selected = prev.has(id);
      if (selected) {
        copied.delete(id);
      } else {
        copied.add(id);
      }
      set(selectedPostIdSetAtom, copied);
    }
  )
);

const selectedPostsOrderAtom = atom<PostOrder>("created-at-asc");

const orderedSelectedPostIdsAtom = atom<string[]>((get) => {
  const allPosts = get(postsAtom);
  const selectedIdSet = get(selectedPostIdSetAtom);
  const order = get(selectedPostsOrderAtom);

  const selectedPosts: NostrEvent[] = [];
  for (const id of selectedIdSet) {
    const p = allPosts.get(id);
    if (p) {
      selectedPosts.push(p);
    }
  }

  const compareFn = comparePostsFn(order);
  return selectedPosts.sort(compareFn).map((p) => p.id);
});

export const useSelectedPostIds = (order: PostOrder) => {
  const setOrder = useSetAtom(selectedPostsOrderAtom);
  const selectedPostIds = useAtomValue(orderedSelectedPostIdsAtom);

  useEffect(() => {
    setOrder(order);
  }, [order, setOrder]);

  return selectedPostIds;
};
