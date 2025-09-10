import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Wifi, WifiOff, Usb } from "lucide-react";

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
}

export const ConnectionStatus = ({ onDisconnect }: IConnectionStatusProps) => {
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
    return <Wifi className="w-4 h-4" />;
  };

  const getConnectionDetails = () => {
    if (connectionType === ConnectionType.SERIAL) {
      return {
        method: t("connectPage.tabs.serial.title"),
        address: primaryDeviceKey,
      };
    } else {
      return {
        method: t("connectPage.tabs.tcp.title"),
        address: primaryDeviceKey,
      };
    }
  };

  const connectionDetails = getConnectionDetails();

  return (
    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
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

      <button
        type="button"
        onClick={handleDisconnect}
        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
      >
        <WifiOff className="w-3 h-3" />
        {t("general.disconnect")}
      </button>
    </div>
  );
};
