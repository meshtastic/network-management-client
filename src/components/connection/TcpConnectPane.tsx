import { LinkIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import type { FormEventHandler } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { ConnectionInput } from "@components/connection/ConnectionInput";
import { RecentConnectionCard } from "@components/connection/RecentConnectionCard";
import { selectRecentConnections } from "@features/appConfig/selectors";
import type { RecentConnection } from "@features/appConfig/slice";
import type { RequestStatus } from "@features/requests/slice";

export interface ITcpConnectPaneProps {
  socketAddress: string;
  setSocketAddress: (socketAddress: string) => void;
  socketPort: string;
  setSocketPort: (socketPort: string) => void;
  activeSocketState: RequestStatus;
  handleSocketConnect: FormEventHandler;
  onRecentConnectionSelect: (connection: RecentConnection) => void;
  onRecentConnectionRemove: (connection: RecentConnection) => void;
  onCancelConnection: () => void;
}

export const TcpConnectPane = ({
  socketAddress,
  setSocketAddress,
  socketPort,
  setSocketPort,
  activeSocketState,
  handleSocketConnect,
  onRecentConnectionSelect,
  onRecentConnectionRemove,
  onCancelConnection,
}: ITcpConnectPaneProps) => {
  const { t } = useTranslation();
  const recentConnections = useSelector(selectRecentConnections());

  // Track if we've started connecting to maintain overlay until component unmounts
  const [hasStartedConnecting, setHasStartedConnecting] = useState(false);

  const handleCancelConnection = () => {
    setHasStartedConnecting(false);
    onCancelConnection();
  };

  // Show connecting overlay if we've started connecting (and maintain until component unmounts)
  if (activeSocketState.status === "PENDING" || hasStartedConnecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
        <div className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">
          Connecting to {socketAddress}:{socketPort}
        </div>
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-6" />
        <button
          type="button"
          onClick={handleCancelConnection}
          className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  const handleFormSubmit: FormEventHandler = (e) => {
    setHasStartedConnecting(true);
    handleSocketConnect(e);
  };

  const handleRecentConnectionSelect = (connection: RecentConnection) => {
    setHasStartedConnecting(true);
    onRecentConnectionSelect(connection);
  };

  const handleRecentConnectionRemove = (connection: RecentConnection) => {
    onRecentConnectionRemove(connection);
  };

  return (
    <div>
      <form className="flex flex-col gap-4 mt-4" onSubmit={handleFormSubmit}>
        <ConnectionInput
          type="text"
          placeholder={t("connectPage.tabs.tcp.ip")}
          value={socketAddress}
          onChange={(e) => setSocketAddress(e.target.value)}
        />

        <ConnectionInput
          type="text"
          placeholder={t("connectPage.tabs.tcp.port")}
          value={socketPort}
          onChange={(e) => setSocketPort(e.target.value)}
        />

        <button
          className="flex flex-row flex-1 justify-center gap-3 border rounded-lg border-gray-400 dark:border-gray-500 mx-auto px-5 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-500 dark:hover:border-gray-400 hover:shadow-lg disabled:cursor-wait"
          type="submit"
        >
          <LinkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          <p className="text-gray-700 dark:text-gray-300">
            {t("connectPage.tabs.tcp.connect")}
          </p>
        </button>

        {activeSocketState.status === "FAILED" && (
          <div>
            <p className="pl-6 pr-2 ml-4 text-sm leading-5 font-light text-red-600 dark:text-red-400 my-1">
              {activeSocketState.message}
            </p>
          </div>
        )}
      </form>

      {recentConnections.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {t("recentConnections.title")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("recentConnections.subtitle")}
            </p>
          </div>

          <div className="space-y-3">
            {recentConnections.map((connection) => (
              <RecentConnectionCard
                key={connection.id}
                connection={connection}
                onConnect={handleRecentConnectionSelect}
                onRemove={handleRecentConnectionRemove}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
