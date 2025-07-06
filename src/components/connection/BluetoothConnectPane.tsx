import { ArrowPathIcon } from "@heroicons/react/24/outline";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Cross2Icon, RowSpacingIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

import { ConnectionInput } from "@components/connection/ConnectionInput";
import { ConnectionSwitch } from "@components/connection/ConnectionSwitch";
import { SerialPortOption } from "@components/connection/SerialPortOption";
import type { RequestStatus } from "@features/requests/slice";

export interface ISerialConnectPaneProps {
  availableSerialPorts: string[] | null;
  activePort: string;
  activePortState: RequestStatus;
  handlePortSelected: (portName: string) => void;
  refreshPorts: () => void;
}

export const BluetoothConnectPane = ({
  availableSerialPorts,
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
          <button onClick={() => {handlePortSelected(activePort)}}>Connect!</button>
          {activePortState.status}
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
