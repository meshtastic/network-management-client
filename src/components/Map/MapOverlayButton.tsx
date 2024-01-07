import type { TooltipContentProps } from "@radix-ui/react-tooltip";
import type React from "react";
import type { ReactNode } from "react";
import DefaultTooltip from "../DefaultTooltip";

export interface IMapIconButtonProps {
  children: ReactNode;
  onClick: () => void;
  tooltipText: string;
  selected?: boolean;
  className?: string;
  tooltipProps?: TooltipContentProps;
}

const MapOverlayButton = ({
  children,
  onClick,
  tooltipText,
  selected = false,
  className = "",
  tooltipProps = {},
}: IMapIconButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <DefaultTooltip text={tooltipText} deactivated={selected} {...tooltipProps}>
      <button
        type="button"
        onClick={handleClick}
        className={`p-2 default-overlay ${
          selected
            ? "!bg-gray-700 dark:!bg-gray-300 !border-gray-500 dark:!border-gray-400"
            : "!bg-white dark:!bg-gray-800"
        } ${className}`}
      >
        {children}
      </button>
    </DefaultTooltip>
  );
};

export default MapOverlayButton;
