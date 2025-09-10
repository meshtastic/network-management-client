import { ArrowPathIcon } from "@heroicons/react/24/outline";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Cross2Icon, RowSpacingIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

import { ConnectionInput } from "@components/connection/ConnectionInput";
import { ConnectionSwitch } from "@components/connection/ConnectionSwitch";
import { SerialPortOption } from "@components/connection/SerialPortOption";
import type { RequestStatus } from "@features/requests/slice";
import { BluetoothDeviceOption } from "@components/connection/BluetoothDeviceOption";

export interface ISerialConnectPaneProps {
  availableBluetoothDevices: string[] | null;
  activePort: string;
  activePortState: RequestStatus;
  handlePortSelected: (portName: string) => void;
  refreshPorts: () => void;
}

export const BluetoothConnectPane = ({
  availableBluetoothDevices,
  activePort,
  activePortState,
  handlePortSelected,
  refreshPorts,
}: ISerialConnectPaneProps) => {
  const { t } = useTranslation();

  return (
    <Collapsible.Root open={true}>
      <div className="flex flex-col mt-4">
        <div className="flex flex-col gap-4">
          {availableBluetoothDevices?.length ? (
            availableBluetoothDevices.map((portName) => (
              <BluetoothDeviceOption
                key={portName}
                name={portName}
                connectionState={
                  activePort === portName ? activePortState : { status: "IDLE" }
                }
                onClick={handlePortSelected}
              />
            ))
          ) : (
            <p className="text-base leading-6 font-normal text-gray-500 dark:text-gray-400 pl-40 pr-40 text-center">
              {t("connectPage.tabs.serial.empty")}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        className="flex flex-row justify-center align-middle mx-auto gap-4 mt-5"
        onClick={() => refreshPorts()}
      >
        <ArrowPathIcon className="text-gray-400 dark:text-gray-300 w-6 h-6 hover:cursor-pointer" />
        <p className="my-auto text-gray-500 dark:text-gray-400">
          {t("connectPage.tabs.serial.refresh")}
        </p>
      </button>
    </Collapsible.Root>
  );
};
