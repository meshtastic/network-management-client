import React from "react";
import {
  RadioIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisHorizontalCircleIcon,
} from "@heroicons/react/24/outline";

import type { IRequestState } from "@features/requests/requestReducer";

export interface ISerialPortOptions {
  name: string;
  connectionState: IRequestState;
  onClick: (portName: string) => void;
}

const SerialPortOption = ({
  name,
  connectionState,
  onClick,
}: ISerialPortOptions) => {
  switch (connectionState.status) {
    case "IDLE":
      return (
        <div>
          <div onClick={() => onClick(name)}>
            <div className={`flex justify-center`}>
              <div className="flex justify-left border rounded-lg border-gray-400 pl-4 pt-5 pb-5 pr-4 w-6/12 hover:bg-gray-50 hover:border-gray-500 hover:shadow-lg hover:cursor-pointer">
                <RadioIcon className="text-gray-500 w-6 h-6" />
                <h1 className="ml-4 text-base leading-6 font-normal text-gray-600 mt-0.5">
                  Serial port on {name}
                </h1>
              </div>
            </div>
          </div>
        </div>
      );

    case "PENDING":
      return (
        <div>
          <div className={`flex justify-center`}>
            <div className="flex justify-left border rounded-lg bg-gray-50 border-gray-500 pl-4 pt-5 pb-5 pr-4 w-6/12 hover:cursor-wait">
              <EllipsisHorizontalCircleIcon className="text-gray-500 w-6 h-6" />
              <h1 className="ml-4 text-base leading-6 font-normal text-gray-600 mt-0.5">
                Serial port on {name}
              </h1>
            </div>
          </div>
        </div>
      );

    case "SUCCESSFUL":
      return (
        <div>
          <div className={`flex justify-center`}>
            <div className="flex justify-left border rounded-lg border-green-500 bg-green-50 pl-4 pt-5 pb-5 pr-4 w-6/12 ">
              <CheckCircleIcon className="text-green-600 w-6 h-6" />
              <h1 className="ml-4 text-base leading-6 font-normal text-green-600 mt-0.5">
                Serial port on {name}
              </h1>
            </div>
          </div>
        </div>
      );

    case "FAILED":
      return (
        <div className="flex justify-center">
          <div className=" border rounded-lg border-red-500 bg-red-50 pl-4 pt-5 pb-5 pr-4 w-6/12 ">
            <div className="flex flex-row">
              <XCircleIcon className="text-red-600 w-6 h-6" />
              <h1 className="ml-4 text-base leading-6 font-normal text-red-600">
                Serial port on {name}
              </h1>
            </div>
            <h1 className="pl-6 pr-2 ml-4 text-sm leading-5 font-light text-red-600 mt-0.5">
              Could not connect to serial port on {name}, failed with error
              &quot;
              {connectionState.message}
              &quot;
            </h1>
          </div>
        </div>
      );

    default:
      return (
        <div>
          <div className={`flex justify-center`}>
            <div className="flex justify-left border rounded-lg border-gray-400 pl-4 pt-3 pb-3 pr-4 w-6/12 hover:bg-gray-50 hover:border-gray-500 hover:shadow-lg hover:cursor-pointer">
              <XCircleIcon className="text-gray-500 w-6 h-6" />
              <h1 className="ml-4 text-base leading-6 font-normal text-gray-600 mt-0.5">
                Serial port on {name}
              </h1>
            </div>
          </div>
        </div>
      );
  }
};

export default SerialPortOption;
