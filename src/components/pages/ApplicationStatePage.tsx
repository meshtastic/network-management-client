import React from "react";
import ReactJson from "react-json-view";
import { useSelector } from "react-redux";

import { selectRootState } from "@features/device/deviceSelectors";
import NavigationBacktrace from "../NavigationBacktrace";

const ApplicationStatePage = () => {
  const rootState = useSelector(selectRootState());
  const backtrace = ["Application State"];

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="flex justify-center align-middle px-9 min-h-[5rem] border-b border-gray-100">
        <NavigationBacktrace className="my-auto mr-auto" levels={backtrace} />
      </div>

      <div className="px-9 py-6 overflow-x-hidden overflow-y-auto">
        <ReactJson collapsed src={rootState ?? {}} />
      </div>
    </div>
  );
};

export default ApplicationStatePage;
