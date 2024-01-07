import * as Tooltip from "@radix-ui/react-tooltip";
import { useState } from "react";
import type { ReactNode } from "react";

export interface IDefaultTooltipProps extends Tooltip.TooltipContentProps {
  text: string;
  children: ReactNode;
  deactivated?: boolean;
}

export const DefaultTooltip = ({
  text,
  children,
  deactivated,
  ...rest
}: IDefaultTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Tooltip.Provider>
      <Tooltip.Root
        open={isOpen}
        onOpenChange={(e) => setIsOpen(e && !deactivated)}
        delayDuration={700}
      >
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 px-3 py-1.5 shadow-lg rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-500 text-xs font-normal text-gray-400 dark:text-gray-300"
            sideOffset={5}
            avoidCollisions
            collisionPadding={20}
            side={rest.side ?? "top"}
          >
            {text}
            <Tooltip.Arrow className="fill-gray-200 dark:fill-gray-600" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
