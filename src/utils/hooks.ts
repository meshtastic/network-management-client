import { useEffect, useState } from "react";
import { error } from "@utils/errors";

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

// https://usehooks-ts.com/react-hook/use-dark-mode
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export interface IUseDarkMode {
  isDarkMode: boolean;
}

/**
 * This hook is intended for use in components that need to know
 * whether the user has dark mode enabled for conditional rendering.
 * Developers should only use this when it is not possible to use
 * CSS media queries.
 * @returns Whether the user has dark mode enabled at the OS level
 */
export const useIsDarkMode = (): IUseDarkMode => {
  // Browser needs to support matchMedia but can't make useState conditional
  if (!window.matchMedia) {
    error("Browser doesn't support window.matchMedia method");
  }

  const runQuery = () => window.matchMedia(COLOR_SCHEME_QUERY);

  const [query, setQuery] = useState<MediaQueryList>(runQuery);

  query.onchange = () => {
    setQuery(runQuery);
  };

  return { isDarkMode: query.matches };
};
