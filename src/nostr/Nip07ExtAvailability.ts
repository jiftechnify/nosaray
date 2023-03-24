import { useCallback, useEffect, useRef, useState } from "react";

const NUM_CHECKS = 5;
const CHECK_INTERVAL_MS = 200;

type AvailabilityStatus = "checking" | "available" | "unavailable";

export const useNip07ExtAvailability = () => {
  const [status, setStatus] = useState<AvailabilityStatus>("checking");

  const timerRef = useRef<number | undefined>(undefined);
  const initiated = useRef(false);
  const checkCnt = useRef(0);

  const check = useCallback(() => {
    checkCnt.current++;
    const found = window.nostr !== undefined;
    console.log("check", checkCnt.current, found);
    if (found) {
      console.log(timerRef.current);
      setStatus("available");
      clearInterval(timerRef.current);
      return;
    }
    if (!found && checkCnt.current >= NUM_CHECKS) {
      setStatus("unavailable");
      clearInterval(timerRef.current);
      return;
    }
  }, []);

  useEffect(() => {
    if (!initiated.current) {
      timerRef.current = setInterval(() => check(), CHECK_INTERVAL_MS);
      initiated.current = true;
    }
  }, [check]);

  return status;
};
