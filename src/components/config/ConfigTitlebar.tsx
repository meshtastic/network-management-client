import type React from "react";
import type { ReactNode } from "react";

export interface IConfigTitleProps {
  title: string;
  subtitle: string;
  renderIcon: (classNames: string) => JSX.Element;
  onIconClick?: () => void;
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
  buttonProps = {},
  children,
}: IConfigTitleProps) => {
  return (
    <div className={`flex flex-col w-full h-full bg-gray-100`}>
      <div className="flex-initial flex flex-row justify-between items-center px-9 min-h-[5rem] h-20 bg-white border-b border-l border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
          <p className="text-xs font-normal text-gray-400">{subtitle}</p>
        </div>

        <button type="button" onClick={() => onIconClick()} {...buttonProps}>
          {renderIcon("w-6 h-6 text-gray-400")}
        </button>
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
