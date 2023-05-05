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
      <label>
        <span>{text}</span>
        {children}
      </label>
      {error && <p>{error}</p>}
    </div>
  );
};

export default ConfigLabel;
