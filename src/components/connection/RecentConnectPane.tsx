import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { RecentConnectionCard } from "@components/connection/RecentConnectionCard";

import { selectRecentConnections } from "@features/appConfig/selectors";
import type { RecentConnection } from "@features/appConfig/slice";

export interface IRecentConnectPaneProps {
  onConnect: (connection: RecentConnection) => void;
  onRemove: (connection: RecentConnection) => void;
}

export const RecentConnectPane = ({
  onConnect,
  onRemove,
}: IRecentConnectPaneProps) => {
  const { t } = useTranslation();
  const recentConnections = useSelector(selectRecentConnections());

  if (recentConnections.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <p>{t("recentConnections.noRecent")}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
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
            onConnect={onConnect}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};
