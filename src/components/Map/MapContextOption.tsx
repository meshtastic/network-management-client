import React, { forwardRef } from "react";
import type { ReactNode } from "react";

export interface IMapContextOptionProps {
  text: string;
  onClick?: () => void;
  renderIcon: (className: string) => ReactNode;
}

const MapContextOption = forwardRef<HTMLButtonElement, IMapContextOptionProps>(
  function MapContextOption({ text, onClick, renderIcon }, ref) {
    return (
      <button
        className="px-1 pr-2 py-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        type="button"
        onClick={onClick}
        ref={ref}
      >
        <div className="flex flex-row gap-2 align-middle">
          {renderIcon("my-auto w-5 h-5 text-gray-400")}
          <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
            {text}
          </p>
        </div>
      </button>
    );
  }
);

export default MapContextOption;
