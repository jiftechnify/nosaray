import { atom, getDefaultStore } from "jotai";
import { loadable } from "jotai/utils";
import type { UserData } from "../types/UserData";
import { WaybackQuery } from "../types/WaybackQuery";
import { startFetchingPosts } from "./Posts";
import { myDataAtom } from "./Profiles";

const store = getDefaultStore();

export const ongoingWaybackQueryAtom = atom<WaybackQuery | undefined>(
  WaybackQuery.fromURLQueryStr(location.search)
);

export const clearOngoingWaybackQuery = () => {
  store.set(ongoingWaybackQueryAtom, undefined);
};

const ongoingQueryWithMyDataAtom = atom<{
  query?: WaybackQuery;
  myData?: UserData;
}>((get) => {
  const myDataLoadable = get(loadable(myDataAtom));
  if (myDataLoadable.state === "hasData") {
    return { query: get(ongoingWaybackQueryAtom), myData: myDataLoadable.data };
  }
  return {};
});

store.sub(ongoingQueryWithMyDataAtom, async () => {
  const { query, myData } = store.get(ongoingQueryWithMyDataAtom);
  console.log({ query, myData });
  if (query !== undefined && myData !== undefined) {
    await startFetchingPosts(query);
  }
  // TODO: cancel fetching posts if `q` is reset to undefined
});
