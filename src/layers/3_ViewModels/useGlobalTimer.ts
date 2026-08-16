import { useState, useEffect } from "react";

const subscribers = new Set<(time: number) => void>();
let intervalId: NodeJS.Timeout | null = null;

export function useGlobalTimer() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    subscribers.add(setNow);
    if (!intervalId) {
      intervalId = setInterval(() => {
        const currentTime = Date.now();
        subscribers.forEach((cb) => cb(currentTime));
      }, 1000);
    }
    return () => {
      subscribers.delete(setNow);
      if (subscribers.size === 0 && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, []);

  return now;
}
