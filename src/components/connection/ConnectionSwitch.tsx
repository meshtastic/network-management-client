import React from "react";
import * as Switch from "@radix-ui/react-switch";

export interface IConnectionSwitchProps {
  checked: boolean;
  setChecked: (checked: boolean) => void;
}

const ConnectionSwitch = ({ checked, setChecked }: IConnectionSwitchProps) => {
  return (
    <Switch.Root
      className="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative data-[state=checked]:bg-gray-700 dark:data-[state=checked]:bg-gray-500 transition-colors"
      checked={checked}
      onCheckedChange={setChecked}
    >
      <Switch.Thumb className="block w-5 h-5 bg-white dark:bg-gray-200 rounded-full translate-x-[2px] data-[state=checked]:translate-x-[18px] transition-transform" />
    </Switch.Root>
  );
};

export default ConnectionSwitch;
