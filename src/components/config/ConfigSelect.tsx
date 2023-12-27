import React, { forwardRef } from "react";
import type { DetailedHTMLProps, SelectHTMLAttributes } from "react";
import type { UseFormRegister } from "react-hook-form";

import ConfigLabel from "@components/config/ConfigLabel";

export interface IConfigSelectProps
  extends DetailedHTMLProps<
    SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  > {
  text: string;
  error?: string;
}

const ConfigSelect = forwardRef<
  HTMLSelectElement,
  IConfigSelectProps & ReturnType<UseFormRegister<any>>
>(({ text, error, ...rest }, ref) => {
  return (
    <ConfigLabel text={text} error={error}>
      <select
        className={
          "bg-white dark:bg-gray-800 px-3 py-1 rounded-lg text-base font-normal text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-500 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
        }
        {...rest}
        ref={ref}
      />
    </ConfigLabel>
  );
});

export default ConfigSelect;
