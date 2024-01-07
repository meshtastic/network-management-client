import {
  EllipsisHorizontalCircleIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import type { FormEventHandler } from "react";
import { useTranslation } from "react-i18next";

import { ConnectionInput } from "@components/connection/ConnectionInput";
import type { RequestStatus } from "@features/requests/slice";

export interface ITcpConnectPaneProps {
  socketAddress: string;
  setSocketAddress: (socketAddress: string) => void;
  socketPort: string;
  setSocketPort: (socketPort: string) => void;
  activeSocketState: RequestStatus;
  handleSocketConnect: FormEventHandler;
}

export const TcpConnectPane = ({
  socketAddress,
  setSocketAddress,
  socketPort,
  setSocketPort,
  activeSocketState,
  handleSocketConnect,
}: ITcpConnectPaneProps) => {
  const { t } = useTranslation();

  return (
    <form className="flex flex-col gap-4 mt-4" onSubmit={handleSocketConnect}>
      <ConnectionInput
        type="text"
        placeholder={t("connectPage.tabs.tcp.ip")}
        value={socketAddress}
        onChange={(e) => setSocketAddress(e.target.value)}
        disabled={activeSocketState.status === "PENDING"}
      />

      <ConnectionInput
        type="text"
        placeholder={t("connectPage.tabs.tcp.port")}
        value={socketPort}
        onChange={(e) => setSocketPort(e.target.value)}
        disabled={activeSocketState.status === "PENDING"}
      />

      <button
        className="flex flex-row flex-1 justify-center gap-3 border rounded-lg border-gray-400 dark:border-gray-500 mx-auto px-5 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-500 dark:hover:border-gray-400 hover:shadow-lg disabled:cursor-wait"
        disabled={activeSocketState.status === "PENDING"}
        type="submit"
      >
        {activeSocketState.status === "PENDING" ? (
          <>
            <EllipsisHorizontalCircleIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            <p className="text-gray-700 dark:text-gray-300">
              {t("connectPage.tabs.tcp.connecting")}
            </p>
          </>
        ) : (
          <>
            <LinkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            <p className="text-gray-700 dark:text-gray-300">
              {t("connectPage.tabs.tcp.connect")}
            </p>
          </>
        )}
      </button>

      {activeSocketState.status === "FAILED" && (
        <div>
          <p className="pl-6 pr-2 ml-4 text-sm leading-5 font-light text-red-600 dark:text-red-400 my-1">
            {activeSocketState.message}
          </p>
        </div>
      )}
    </form>
  );
};
