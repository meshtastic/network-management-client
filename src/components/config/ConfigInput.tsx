import { forwardRef } from "react";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import type { UseFormRegister } from "react-hook-form";

import { ConfigLabel } from "@components/config/ConfigLabel";

export interface IConfigInputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  text: string;
  error?: string;
  required?: boolean;
}

export const ConfigInput = forwardRef<
  HTMLInputElement,
  // biome-ignore lint/suspicious/noExplicitAny: Need any to simplify complexity of being config-agnostic
  IConfigInputProps & ReturnType<UseFormRegister<any>>
>(({ text, error, required, ...rest }, ref) => {
  return (
    <ConfigLabel text={text} error={error}>
      <input
        className={`${
          rest.type === "checkbox" ? "mr-auto" : "w-full"
        } bg-white dark:bg-gray-800 px-3 py-1 rounded-lg text-base font-normal text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-500 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-700`}
        type="url"
        required={required}
        {...rest}
        ref={ref}
      />
    </ConfigLabel>
  );
});
