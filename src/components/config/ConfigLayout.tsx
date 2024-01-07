import type { ReactNode } from "react";

import { DefaultTooltip } from "@components/DefaultTooltip";
import { NavigationBacktrace } from "@components/NavigationBacktrace";

export interface IConfigLayoutProps {
  title: string;
  backtrace: string[];
  renderTitleIcon: (classNames: string) => JSX.Element;
  onTitleIconClick: () => void;
  titleIconTooltip: string;
  renderOptions: () => JSX.Element[];
  children: ReactNode;
}

export const ConfigLayout = ({
  title,
  backtrace,
  renderTitleIcon,
  onTitleIconClick,
  titleIconTooltip,
  renderOptions,
  children,
}: IConfigLayoutProps) => {
  return (
    <div className="flex flex-row w-full h-screen bg-white dark:bg-gray-800">
      <div className="flex flex-col w-96 after:shadow-lg">
        <div className="flex justify-center align-middle px-9 h-20 border-b border-gray-100 dark:border-gray-700">
          <NavigationBacktrace className="my-auto mr-auto" levels={backtrace} />
        </div>

        <div className="flex flex-col flex-1 px-9 py-6 overflow-y-auto">
          <div className="flex flex-row justify-between align-middle mb-6">
            <h1 className="text-4xl leading-10 font-semibold text-gray-700 dark:text-gray-300">
              {title}
            </h1>

            <DefaultTooltip text={titleIconTooltip}>
              <button
                type="button"
                className="cursor-pointer"
                onClick={() => onTitleIconClick()}
              >
                {renderTitleIcon(
                  "w-6 h-6 text-gray-400 dark:text-gray-400 my-auto",
                )}
              </button>
            </DefaultTooltip>
          </div>

          <div className="flex flex-col flex-1 gap-3">{renderOptions()}</div>
        </div>
      </div>

      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
};
