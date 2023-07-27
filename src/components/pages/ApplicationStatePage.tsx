import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import ReactJson from "react-json-view";

import NavigationBacktrace from "@components/NavigationBacktrace";
import { selectRootState } from "@features/device/deviceSelectors";
import { useIsDarkMode } from "@utils/hooks";

const ApplicationStatePage = () => {
  const { t } = useTranslation();

  const { isDarkMode } = useIsDarkMode();

  const rootState = useSelector(selectRootState());
  const backtrace = [t("applicationState.title")];

  return (
    <div className="flex flex-col w-full h-screen bg-white dark:bg-gray-800">
      <div className="flex justify-center align-middle px-9 min-h-[5rem] border-b border-gray-100 dark:border-gray-700">
        <NavigationBacktrace className="my-auto mr-auto" levels={backtrace} />
      </div>

      <div className="px-9 py-6 overflow-x-hidden overflow-y-auto">
        <ReactJson
          collapsed
          theme={isDarkMode ? "tomorrow" : "rjv-default"}
          iconStyle="square"
          src={rootState ?? {}}
        />
      </div>
    </div>
  );
};

export default ApplicationStatePage;
