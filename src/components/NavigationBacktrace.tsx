import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid";
import DefaultTooltip from "./DefaultTooltip";
import { useTranslation } from "react-i18next";

export interface INavigationBacktraceProps {
  levels: string[];
  className?: string;
}

const NavigationBacktrace = ({
  levels,
  className = "",
}: INavigationBacktraceProps) => {
  const { t } = useTranslation();

  const navigateTo = useNavigate();

  return (
    <div className={`${className} flex flex-row gap-2`}>
      <DefaultTooltip text={t("general.goHome")}>
        <button type="button" onClick={() => navigateTo("/")}>
          <HomeIcon className="my-auto w-5 h-5 text-gray-400" />
        </button>
      </DefaultTooltip>
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
