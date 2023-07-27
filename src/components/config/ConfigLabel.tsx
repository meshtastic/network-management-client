import React from "react";
import type { ReactNode } from "react";

export interface IConfigLabelProps {
  text: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

const ConfigLabel = ({
  text,
  error = "",
  children,
  className = "",
}: IConfigLabelProps) => {
  return (
    <div className={className}>
      <label className="">
        <p className="m-0 mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
          {text}
        </p>
        <div>{children}</div>
      </label>
      {error && <p>{error}</p>}
    </div>
  );
};

export default ConfigLabel;
