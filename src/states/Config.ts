import { atom } from "jotai";

export type PostDisplayMode = "normal" | "pubkey-hex-color";

export const postDisplayModeAtom = atom<PostDisplayMode>("pubkey-hex-color");
