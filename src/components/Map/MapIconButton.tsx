import type React from "react";
import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";

export interface IMapIconButtonProps {
  children: ReactNode;
  onClick: () => void;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  className?: string;
}

const MapIconUnimplemented = ({
  children,
  onClick,
  type = "button",
  className = "",
}: IMapIconButtonProps) => {
  return (
    <Dialog.Root>
      {/* Icon on map */}
      <Dialog.Trigger asChild>
        <button className={`${className} default-overlay`}>{children}</button>
      </Dialog.Trigger>

      {/* Appears when clicked */}
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="fixed top-1/4 left-1/3 rounded-lg bg-white drop-shadow-xl p-8">
          <Dialog.Title className="text-lg font-semibold">Warning</Dialog.Title>
          <Dialog.Description className="text-gray-500 my-4">
            This functionality is not yet implemented.
          </Dialog.Description>
          <div className="mt-5 flex justify-end">
            <Dialog.Close asChild>
              <button className="rounded-md py-3 px-5 font-medium hover:bg-gray-200">
                Close
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

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

export { MapIconUnimplemented, MapIconButton };
