import { useEffect } from "react";
import { ColorMode } from "@features/appConfig/slice";

/**
 * Check if dark mode was manually selected or if system color mode is dark
 * Add or remove the "dark" class from the document based on the selected mode
 * https://tailwindcss.com/docs/dark-mode#supporting-system-preference-and-manual-selection
 * @throws {Error} If the browser doesn't support the `matchMedia` API
 * @param colorMode Color mode to apply a CSS class for
 */
export function setColorModeClass(colorMode: ColorMode) {
  if (
    colorMode === "dark" || // Manual dark mode
    (colorMode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches) // System dark mode
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export const useAsyncUnlistenUseEffect = (
  effect: () => Promise<() => void>,
  deps: unknown[],
) => {
  // biome-ignore lint/nursery/noEmptyBlockStatements: Needed for no-op unlisten
  let unlistenFn = () => {};

  useEffect(() => {
    effect().then((unlisten) => {
      unlistenFn = unlisten;
    });

    return () => {
      unlistenFn();
    };
  }, deps);
};
