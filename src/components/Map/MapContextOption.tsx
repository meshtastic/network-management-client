import React from "react";
import type { ReactNode } from "react";

export interface IMapContextOptionProps {
  text: string;
  onClick: () => void;
  renderIcon: (className: string) => ReactNode;
}

const MapContextOption = ({
  text,
  onClick,
  renderIcon,
}: IMapContextOptionProps) => {
  return (
    <button
      className="px-1 pr-2 py-1 bg-white hover:bg-gray-100 rounded-lg"
      type="button"
      onClick={() => onClick()}
    >
      <div className="flex flex-row gap-2 align-middle">
        {renderIcon("my-auto w-5 h-5 text-gray-400")}
        <p className="text-sm font-normal text-gray-500">{text}</p>
      </div>
    </button>
  );
};

export default MapContextOption;
