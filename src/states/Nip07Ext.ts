import { atom } from "jotai";

const NUM_CHECKS = 5;
const CHECK_INTERVAL_MS = 200;

export const nip07ExtAtom = atom(async () => {
  return new Promise<typeof window.nostr | undefined>((resolve) => {
    let checkCnt = 0;
    const timer = setInterval(() => {
      const found = window.nostr !== undefined;
      if (found) {
        clearInterval(timer);
        resolve(window.nostr);
        return;
      }
      if (checkCnt >= NUM_CHECKS) {
        clearInterval(timer);
        resolve(undefined);
        return;
      }
      checkCnt++;
    }, CHECK_INTERVAL_MS);
  });
});
