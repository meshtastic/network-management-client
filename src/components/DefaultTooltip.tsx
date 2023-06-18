import React from "react";
import type { ReactNode } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

export interface IDefaultTooltipProps extends Tooltip.TooltipContentProps {
  text: string;
  children: ReactNode;
  deactivated?: boolean;
}

const DefaultTooltip = ({
  text,
  children,
  deactivated,
  ...rest
}: IDefaultTooltipProps) => {
  if (deactivated) return <>{children}</>;
  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={300}>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={rest.side ?? "top"}
            className="z-50 px-3 py-1.5 shadow-lg rounded-lg bg-white border border-gray-200 text-xs font-normal text-gray-400"
            sideOffset={5}
            avoidCollisions
            collisionPadding={20}
          >
            {text}
            <Tooltip.Arrow className="fill-gray-200" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default DefaultTooltip;
