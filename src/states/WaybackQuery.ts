import { atom, getDefaultStore, useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import type { UserData } from "../types/UserData";
import { WaybackQuery, WaybackQueryInputs } from "../types/WaybackQuery";
import { startFetchingPosts } from "./Posts";
import { myDataAtom } from "./Profiles";

const store = getDefaultStore();

export const waybackQueryInputsAtom = atom<WaybackQueryInputs | undefined>(
  WaybackQueryInputs.fromURLQuery(location.search),
);

export const clearWaybackQueryInputs = () => {
  store.set(waybackQueryInputsAtom, undefined);
};

const ongoingWaybackQueryAtom = atom<WaybackQuery | undefined>((get) => {
  const inputs = get(waybackQueryInputsAtom);
  return inputs !== undefined ? WaybackQuery.fromInputs(inputs) : undefined;
});

export const useOngoingWaybackQuery = () => {
  const query = useAtomValue(ongoingWaybackQueryAtom);
  return query;
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

const replaceURLQueryStr = (queryStr: string) => {
  const url = new URL(location.href);
  url.search = queryStr;
  history.replaceState(null, "", url);
};

store.sub(ongoingQueryWithMyDataAtom, async () => {
  const { query, myData } = store.get(ongoingQueryWithMyDataAtom);
  const inputs = store.get(waybackQueryInputsAtom);

  replaceURLQueryStr(inputs ? WaybackQueryInputs.toURLQuery(inputs) : "");

  if (query !== undefined && myData !== undefined) {
    await startFetchingPosts(query);
  }
  // TODO: cancel fetching posts if `query` is reset to undefined
});
