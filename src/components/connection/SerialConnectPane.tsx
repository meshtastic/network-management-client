import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import SerialPortOption from "@app/components/connection/SerialPortOption";

import type { RequestStatus } from "@features/requests/requestReducer";

export interface ISerialConnectPaneProps {
  availableSerialPorts: string[] | null;
  activePort: string;
  activePortState: RequestStatus;
  handlePortSelected: (portName: string) => void;
  refreshPorts: () => void;
}

const SerialConnectPane = ({
  availableSerialPorts,
  activePort,
  activePortState,
  handlePortSelected,
  refreshPorts,
}: ISerialConnectPaneProps) => {
  return (
    <div>
      <div className="flex flex-col mt-4">
        <div className="flex flex-col gap-4">
          {availableSerialPorts?.length ? (
            availableSerialPorts.map((portName) => (
              <SerialPortOption
                key={portName}
                name={portName}
                connectionState={
                  activePort === portName ? activePortState : { status: "IDLE" }
                }
                onClick={handlePortSelected}
              />
            ))
          ) : (
            <p className="text-base leading-6 font-normal text-gray-500 pl-40 pr-40 text-center">
              No ports detected.
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        className="flex flex-row justify-center align-middle mx-auto gap-4 mt-5"
        onClick={() => refreshPorts()}
      >
        <ArrowPathIcon className="text-gray-400 w-6 h-6 hover:cursor-pointer" />
        <p className="my-auto text-gray-500">Refresh ports</p>
      </button>
    </div>
  );
};

export default SerialConnectPane;
