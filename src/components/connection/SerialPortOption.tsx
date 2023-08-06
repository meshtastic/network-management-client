import React from "react";
import { Trans } from "react-i18next";
import {
  CheckCircleIcon,
  XCircleIcon,
  EllipsisHorizontalCircleIcon,
} from "@heroicons/react/24/outline";
import { Usb } from "lucide-react";

import type { RequestStatus } from "@features/requests/requestSlice";

export interface ISerialPortOptions {
  name: string;
  connectionState: RequestStatus;
  onClick: (portName: string) => void;
}

const SerialPortOption = ({
  name,
  connectionState,
  onClick,
}: ISerialPortOptions) => {
  switch (connectionState.status) {
    case "PENDING":
      return (
        <div className="flex justify-center select-none">
          <div className="flex flex-1 justify-left border rounded-lg border-gray-500 dark:border-gray-200 pl-4 pt-5 pb-5 pr-4 w-6/12 hover:cursor-wait bg-white dark:bg-gray-800">
            <EllipsisHorizontalCircleIcon className="text-gray-500 dark:text-gray-300 w-6 h-6" />
            <h1 className="ml-4 text-base leading-6 font-normal text-gray-600 dark:text-gray-400 mt-0.5">
              <Trans
                i18nKey="connectPage.tabs.serial.portOption"
                values={{ portName: name }}
              />
            </h1>
          </div>
        </div>
      );

    case "SUCCESSFUL":
      return (
        <div className="flex justify-center select-none">
          <div className="flex flex-1 justify-left border rounded-lg border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900 pl-4 pt-5 pb-5 pr-4 w-6/12">
            <CheckCircleIcon className="text-green-600 dark:text-green-500 w-6 h-6" />
            <h1 className="ml-4 text-base leading-6 font-normal text-green-600 dark:text-green-500 mt-0.5">
              <Trans
                i18nKey="connectPage.tabs.serial.portOption"
                values={{ portName: name }}
              />
            </h1>
          </div>
        </div>
      );

    case "FAILED":
      return (
        <div className="flex justify-center select-none">
          <div className="flex-1 border rounded-lg border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900 pl-4 pt-5 pb-5 pr-4 w-6/12">
            <div className="flex flex-row">
              <XCircleIcon className="text-red-600 dark:text-red-400 w-6 h-6" />
              <h1 className="ml-4 text-base leading-6 font-normal text-red-600 dark:text-red-400">
                <Trans
                  i18nKey="connectPage.tabs.serial.portOption"
                  values={{ portName: name }}
                />
              </h1>
            </div>
            <h2 className="pl-6 pr-2 ml-4 text-sm leading-5 font-light text-red-600 dark:text-red-500 mt-0.5">
              <i>{connectionState.message}</i>
            </h2>
          </div>
        </div>
      );

    default: // "IDLE"
      return (
        <button
          className="hover:cursor-pointer"
          type="button"
          onClick={() => onClick(name)}
        >
          <div className="flex justify-center select-none">
            <div className="flex flex-1 justify-left border rounded-lg border-gray-400 dark:border-gray-200 pl-4 pt-5 pb-5 pr-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-500 dark:hover:border-gray-50 hover:shadow-lg">
              <Usb className="text-gray-500 dark:text-gray-400 w-6 h-6" />
              <h1 className="ml-4 text-base leading-6 font-normal text-gray-600 dark:text-gray-300 mt-0.5">
                <Trans
                  i18nKey="connectPage.tabs.serial.portOption"
                  values={{ portName: name }}
                />
              </h1>
            </div>
          </div>
        </button>
      );
  }
};

export default SerialPortOption;
