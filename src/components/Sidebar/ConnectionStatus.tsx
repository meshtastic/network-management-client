import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Wifi, Usb, Bluetooth, Unlink } from "lucide-react";

import { useDeviceApi } from "@features/device/api";
import {
  selectDevice,
  selectPrimaryDeviceKey,
  selectPrimaryConnectionType,
  selectConnectedDeviceNodeId,
  selectUserByNodeId,
} from "@features/device/selectors";

import { ConnectionType } from "@utils/connections";

export interface IConnectionStatusProps {
  onDisconnect: () => void;
  isCollapsed?: boolean;
}

export const ConnectionStatus = ({
  onDisconnect,
  isCollapsed = false,
}: IConnectionStatusProps) => {
  const { t } = useTranslation();
  const deviceApi = useDeviceApi();

  const device = useSelector(selectDevice());
  const primaryDeviceKey = useSelector(selectPrimaryDeviceKey());
  const connectionType = useSelector(selectPrimaryConnectionType());
  const connectedNodeId = useSelector(selectConnectedDeviceNodeId());
  const connectedUser = useSelector(selectUserByNodeId(connectedNodeId ?? 0));

  if (!device || !primaryDeviceKey || !connectionType) {
    return null;
  }

  const handleDisconnect = async () => {
    await deviceApi.disconnectFromAllDevices();
    onDisconnect();
  };

  const getConnectionIcon = () => {
    if (connectionType === ConnectionType.SERIAL) {
      return <Usb className="w-4 h-4" />;
    }
    if (connectionType === ConnectionType.BLUETOOTH) {
      return <Bluetooth className="w-4 h-4" />;
    }
    return <Wifi className="w-4 h-4" />;
  };

  const getConnectionDetails = () => {
    if (connectionType === ConnectionType.SERIAL) {
      return {
        method: t("connectPage.tabs.serial.title"),
        address: primaryDeviceKey,
      };
    }
    if (connectionType === ConnectionType.BLUETOOTH) {
      return {
        method: t("connectPage.tabs.bluetooth.title"),
        address: primaryDeviceKey,
      };
    }
    return {
      method: t("connectPage.tabs.tcp.title"),
      address: primaryDeviceKey,
    };
  };

  const connectionDetails = getConnectionDetails();

  return (
    <div
      className={`border-b border-gray-100 dark:border-gray-700 transition-all duration-300 ease-in-out overflow-hidden flex flex-col justify-end ${
        isCollapsed ? "h-[65px] py-2" : "h-[150px] py-3"
      }`}
    >
      <div
        className="flex flex-col transition-opacity duration-300 ease-in-out"
        style={
          isCollapsed
            ? { opacity: 0, pointerEvents: "none" }
            : { opacity: 1, pointerEvents: "auto" }
        }
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {getConnectionIcon()}
            <span>{connectionDetails.method}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{t("general.connected")}</span>
          </div>
        </div>

        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
          <div className="font-medium truncate">
            {connectedUser?.longName ||
              connectedUser?.shortName ||
              "Unknown Node"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {connectedUser?.shortName &&
              connectedUser?.longName !== connectedUser?.shortName &&
              `(${connectedUser.shortName})`}
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
          {connectionDetails.address}
        </div>
      </div>

      <div
        className={`flex ${isCollapsed ? "justify-center mb-[7px]" : "w-full mb-[3px]"} transition-all duration-300 ease-in-out`}
      >
        <button
          type="button"
          onClick={handleDisconnect}
          className={`flex items-center justify-center gap-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 ease-in-out ${
            isCollapsed ? "p-2" : "w-full px-3 py-1.5"
          }`}
          title={isCollapsed ? t("general.disconnect") : undefined}
        >
          <Unlink
            className={`${isCollapsed ? "w-4 h-4" : "w-3 h-3"} transition-all duration-300 ease-in-out`}
          />
          {!isCollapsed && t("general.disconnect")}
        </button>
      </div>
    </div>
  );
};
