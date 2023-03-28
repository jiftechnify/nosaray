import { atom, getDefaultStore } from "jotai";
import type { WaybackQuery } from "../types/WaybackQuery";

const store = getDefaultStore();

export const ongoingWaybackQueryAtom = atom<WaybackQuery | undefined>(
  undefined
);

export const clearOngoingWaybackQuery = () => {
  store.set(ongoingWaybackQueryAtom, undefined);
};
