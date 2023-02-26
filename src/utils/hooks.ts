import { useEffect, useState } from "react";

/**
 * This hook is intended for use in components that need to rerender
 * within a specific repeated time interval.
 * @param interval How often the component should reload (ms)
 * @returns The last time this hook forced a component reload
 */
export const useComponentReload = (interval: number) => {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const intervalHandle = setInterval(() => setTime(Date.now()), interval);
    return () => clearInterval(intervalHandle);
  }, []);

  return time;
};
