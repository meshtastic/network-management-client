import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid";

export interface INavigationBacktraceProps {
  levels: string[];
  className?: string;
}

const NavigationBacktrace = ({
  levels,
  className = "",
}: INavigationBacktraceProps) => {
  const navigateTo = useNavigate();

  return (
    <div className={`${className} flex flex-row gap-2`}>
      <button type="button" onClick={() => navigateTo("/")}>
        <HomeIcon className="my-auto w-5 h-5 text-gray-400" />
      </button>
      {levels.map((l) => (
        <div key={l} className="flex flex-row gap-2">
          <ChevronRightIcon className="my-auto w-5 h-5 text-gray-600" />
          <p className="my-auto text-sm leading-5 font-normal text-gray-500">
            {l}
          </p>
        </div>
      ))}
    </div>
  );
};

export default NavigationBacktrace;
