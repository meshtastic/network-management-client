import { ArrowPathIcon } from "@heroicons/react/24/outline";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Cross2Icon, RowSpacingIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

import ConnectionInput from "@components/connection/ConnectionInput";
import ConnectionSwitch from "@components/connection/ConnectionSwitch";
import SerialPortOption from "@components/connection/SerialPortOption";
import type { RequestStatus } from "@features/requests/slice";

export interface ISerialConnectPaneProps {
  availableSerialPorts: string[] | null;
  activePort: string;
  activePortState: RequestStatus;
  handlePortSelected: (portName: string) => void;
  isAdvancedOpen: boolean;
  setAdvancedOpen: (isAdvancedOpen: boolean) => void;
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
  isAdvancedOpen,
  setAdvancedOpen,
  baudRate,
  setBaudRate,
  dtr,
  setDtr,
  rts,
  setRts,
}: ISerialConnectPaneProps) => {
  const { t } = useTranslation();

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

      <Collapsible.Trigger asChild>
        <button className="flex flex-row align-middle justify-between w-full mt-5 mb-2">
          <p className="my-auto text-base font-normal text-gray-500 dark:text-gray-400">
            {t("connectPage.tabs.serial.advancedTitle")}
          </p>
          <span className="my-auto text-gray-500 dark:text-gray-400">
            {isAdvancedOpen ? <Cross2Icon /> : <RowSpacingIcon />}
          </span>
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content>
        <div className="flex flex-col gap-4">
          <ConnectionInput
            type="number"
            placeholder={t("connectPage.tabs.serial.baudTitle")}
            value={baudRate}
            onChange={(e) => setBaudRate(parseInt(e.target.value))}
          />

          <div className="flex flex-row justify-between">
            <p className="text-base font-normal text-gray-500 dark:text-gray-400">
              {t("connectPage.tabs.serial.dtrTitle")}
            </p>
            <ConnectionSwitch checked={dtr} setChecked={setDtr} />
          </div>

          <div className="flex flex-row justify-between">
            <p className="text-base font-normal text-gray-500 dark:text-gray-400">
              {t("connectPage.tabs.serial.rtsTitle")}
            </p>
            <ConnectionSwitch checked={rts} setChecked={setRts} />
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export default SerialConnectPane;
