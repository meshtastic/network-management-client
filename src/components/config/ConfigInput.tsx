import React, { forwardRef } from "react";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import type { UseFormRegister } from "react-hook-form";

import ConfigLabel from "@components/config/ConfigLabel";

export interface IConfigInputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  text: string;
  error?: string;
}

// eslint-disable-next-line react/display-name
const ConfigInput = forwardRef<
  HTMLInputElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  IConfigInputProps & ReturnType<UseFormRegister<any>>
>(({ text, error, ...rest }, ref) => {
  return (
    <ConfigLabel text={text} error={error}>
      <input
        className={`${
          rest.type === "checkbox" ? "mr-auto" : "w-full"
        } bg-white dark:bg-gray-800 px-3 py-1 rounded-lg text-base font-normal text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-500 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-700`}
        type="url"
        {...rest}
        ref={ref}
      />
    </ConfigLabel>
  );
});

export default ConfigInput;
