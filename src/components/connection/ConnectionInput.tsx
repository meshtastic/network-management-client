import { forwardRef } from "react";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";

export type IConnectionInputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const ConnectionInput = forwardRef<
  HTMLInputElement,
  IConnectionInputProps
>(function ConnectionInput(props, ref) {
  return (
    <input
      {...props}
      className={`flex-1 border border-gray-400 dark:border-gray-400 rounded-lg px-5 py-4 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 h-full bg-transparent focus:outline-none disabled:cursor-wait ${
        props.className ?? ""
      }`}
      ref={ref}
    />
  );
});
