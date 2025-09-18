import { useTranslation } from "react-i18next";
import { Wifi, Clock, Trash2 } from "lucide-react";

import type { RecentConnection } from "@features/appConfig/slice";

export interface IRecentConnectionCardProps {
  connection: RecentConnection;
  onConnect: (connection: RecentConnection) => void;
  onRemove: (connection: RecentConnection) => void;
}

export const RecentConnectionCard = ({
  connection,
  onConnect,
  onRemove,
}: IRecentConnectionCardProps) => {
  const { t } = useTranslation();

  const getConnectionIcon = () => {
    return <Wifi className="w-4 h-4" />;
  };

  const getConnectionTypeLabel = () => {
    return t("connectPage.tabs.tcp.title");
  };

  const formatLastConnected = () => {
    const now = Date.now();
    const diffMs = now - connection.lastConnected;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return t("recentConnections.justNow");
    } else if (diffMins < 60) {
      return t("recentConnections.minutesAgo", { count: diffMins });
    } else if (diffHours < 24) {
      return t("recentConnections.hoursAgo", { count: diffHours });
    } else {
      return t("recentConnections.daysAgo", { count: diffDays });
    }
  };

  const handleConnect = () => {
    onConnect(connection);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(connection);
  };

  return (
    <div className="relative w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <button
        type="button"
        onClick={handleConnect}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {getConnectionIcon()}
            <span>{getConnectionTypeLabel()}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatLastConnected()}</span>
          </div>
        </div>

        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
          <div className="font-medium truncate">
            {connection.deviceName || "Unknown Device"}
          </div>
          {connection.shortName &&
            connection.longName !== connection.shortName && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                ({connection.shortName})
              </div>
            )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {connection.address}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="ml-2 p-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            title="Remove connection"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </button>
    </div>
  );
};
