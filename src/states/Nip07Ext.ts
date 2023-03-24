import { atom } from "jotai";

const NUM_CHECKS = 5;
const CHECK_INTERVAL_MS = 200;

export const isNip07ExtAvailableAtom = atom(async () => {
  return new Promise<boolean>((resolve) => {
    let checkCnt = 0;
    const timer = setInterval(() => {
      const found = window.nostr !== undefined;
      if (found) {
        clearInterval(timer);
        resolve(true);
        return;
      }
      if (checkCnt >= NUM_CHECKS) {
        clearInterval(timer);
        resolve(false);
        return;
      }
      checkCnt++;
    }, CHECK_INTERVAL_MS);
  });
});
