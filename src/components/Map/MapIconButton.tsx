import type React from "react";
import type { ReactNode } from "react";
// import * as Dialog from "@radix-ui/react-dialog";

export interface IMapIconButtonProps {
  children: ReactNode;
  onClick: () => void;
  selected?: boolean;
  className?: string;
}

// const MapIconUnimplemented = ({
//   children,
//   onClick,
//   type = "button",
//   className = "",
// }: IMapIconButtonProps) => {
//   return (
//     <Dialog.Root>
//       {/* Icon on map */}
//       <Dialog.Trigger asChild>
//         <button className={`${className} default-overlay`}>{children}</button>
//       </Dialog.Trigger>

//       {/* Appears when clicked */}
//       <Dialog.Portal>
//         <div className="bg-black">
//           <Dialog.Overlay className="" />
//           <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white drop-shadow-2xl p-8 shadow-2xl">
//             <Dialog.Title className="text-lg font-semibold">
//               Warning
//             </Dialog.Title>
//             <Dialog.Description className="text-gray-500 my-4">
//               This functionality is not yet implemented.
//             </Dialog.Description>
//             <div className="mt-5 flex justify-end">
//               <Dialog.Close asChild>
//                 <button className="rounded-md py-3 px-5 font-medium hover:bg-gray-200">
//                   Close
//                 </button>
//               </Dialog.Close>
//             </div>
//           </Dialog.Content>
//         </div>
//       </Dialog.Portal>
//     </Dialog.Root>
//   );
// };

const MapIconButton = ({
  children,
  onClick,
  selected = false,
  className = "",
}: IMapIconButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className} p-2 rounded-lg border shadow-lg ${
        selected ? "bg-gray-700 border-gray-500" : "bg-white border-gray-200"
      }`}
    >
      {children}
    </button>
  );
};

export { MapIconButton };
