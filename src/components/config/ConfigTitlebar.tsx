import type React from "react";
import type { ReactNode } from "react";

import DefaultTooltip from "@components/DefaultTooltip";

export interface IConfigTitleProps {
  title: string;
  subtitle: string;
  renderIcon: (classNames: string) => JSX.Element;
  onIconClick?: () => void;
  buttonTooltipText: string;
  buttonProps?: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >;
  children: ReactNode;
}

const ConfigTitle = ({
  title,
  subtitle,
  renderIcon,
  onIconClick = () => null,
  buttonTooltipText,
  buttonProps = {},
  children,
}: IConfigTitleProps) => {
  return (
    <div className={"flex flex-col w-full h-full bg-gray-100 dark:bg-gray-700"}>
      <div className="flex-initial flex flex-row justify-between items-center px-9 min-h-[5rem] h-20 bg-white dark:bg-gray-800 border-b border-l border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {title}
          </h2>
          <p className="text-xs font-normal text-gray-400 dark:text-gray-500">
            {subtitle}
          </p>
        </div>

        <DefaultTooltip text={buttonTooltipText}>
          <button type="button" onClick={() => onIconClick()} {...buttonProps}>
            {renderIcon("w-6 h-6 text-gray-400 dark:text-gray-400")}
          </button>
        </DefaultTooltip>
      </div>

      <div
        className="p-9 pr-3 flex flex-1 flex-col overflow-auto"
        style={{ height: "calc(100% - 5rem)" }}
      >
        {children}
      </div>
    </div>
  );
};

export default ConfigTitle;
