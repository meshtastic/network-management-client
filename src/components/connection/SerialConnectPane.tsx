import React, { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { RowSpacingIcon, Cross2Icon } from "@radix-ui/react-icons";

import SerialPortOption from "@components/connection/SerialPortOption";
import ConnectionInput from "@components/connection/ConnectionInput";
import ConnectionSwitch from "@components/connection/ConnectionSwitch";
import type { RequestStatus } from "@features/requests/requestReducer";

export interface ISerialConnectPaneProps {
  availableSerialPorts: string[] | null;
  activePort: string;
  activePortState: RequestStatus;
  handlePortSelected: (portName: string) => void;
  baudRate: number;
  setBaudRate: (baudRate: number) => void;
  dtr: boolean;
  setDtr: (dtr: boolean) => void;
  rts: boolean;
  setRts: (rts: boolean) => void;
  refreshPorts: () => void;
}

const SerialConnectPane = ({
  availableSerialPorts,
  activePort,
  activePortState,
  handlePortSelected,
  refreshPorts,
  baudRate,
  setBaudRate,
  dtr,
  setDtr,
  rts,
  setRts,
}: ISerialConnectPaneProps) => {
  const [isAdvancedOpen, setAdvancedOpen] = useState(false);

  return (
    <Collapsible.Root open={isAdvancedOpen} onOpenChange={setAdvancedOpen}>
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

      <div className="flex flex-row align-middle justify-between mt-5 mb-2">
        <p className="text-base font-normal text-gray-500">
          Advanced connection options
        </p>
        <Collapsible.Trigger asChild>
          <button className="text-gray-500">
            {isAdvancedOpen ? <Cross2Icon /> : <RowSpacingIcon />}
          </button>
        </Collapsible.Trigger>
      </div>

      <Collapsible.Content>
        <div className="flex flex-col gap-4">
          <ConnectionInput
            type="number"
            placeholder="Baud rate"
            value={baudRate}
            onChange={(e) => setBaudRate(parseInt(e.target.value))}
          />

          <div className="flex flex-row justify-between">
            <p className="text-base font-normal text-gray-500">Enable DTR</p>
            <ConnectionSwitch checked={dtr} setChecked={setDtr} />
          </div>

          <div className="flex flex-row justify-between">
            <p className="text-base font-normal text-gray-500">Enable RTS</p>
            <ConnectionSwitch checked={rts} setChecked={setRts} />
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export default SerialConnectPane;
