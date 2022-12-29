import type React from "react";
import type { ReactNode } from "react";

export interface IMapIconButtonProps {
  children: ReactNode;
  onClick: () => void;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  className?: string;
}

const MapIconButton = ({
  children,
  onClick,
  type = "button",
  className = "",
}: IMapIconButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${className} default-overlay`}
    >
      {children}
    </button>
  );
};

export default MapIconButton;
