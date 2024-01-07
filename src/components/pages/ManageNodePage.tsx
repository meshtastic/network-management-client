import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import TimeAgo from "timeago-react";
import { useTranslation } from "react-i18next";

import type { app_device_MeshNode } from "@bindings/index";

import { TableLayout } from "@components/Table/TableLayout";

import { selectAllNodes } from "@features/device/selectors";
import { formatLocation } from "@utils/map";
import { getLastHeardTime } from "@utils/nodes";

export const ManageNodePage = () => {
  const { t, i18n } = useTranslation();

  const nodes = useSelector(selectAllNodes());

  const columns = useMemo<ColumnDef<app_device_MeshNode, unknown>[]>(
    () => [
      {
        id: t("manageNodes.id"),
        accessorFn: (n) => {
          const { nodeNum } = n;
          if (!nodeNum) return "No user info";
          return `0x${nodeNum?.toString(16)}`;
        },
      },
      {
        id: t("manageNodes.shortName"),
        accessorFn: (n) => n.user?.shortName ?? t("manageNodes.noUserInfo"),
      },
      {
        id: t("manageNodes.lastHeard"),
        header: t("manageNodes.lastHeard"),
        cell: ({ row }) => {
          const node = row.original;
          const lastHeardTime = getLastHeardTime(node);

          if (!lastHeardTime) return <p>No packets received</p>;
          return (
            <TimeAgo datetime={lastHeardTime * 1000} locale={i18n.language} />
          );
        },
      },
      {
        id: t("manageNodes.latitude"),
        accessorFn: (n) => {
          const latitude = n.positionMetrics.at(-1)?.latitude;
          if (!latitude) return t("manageNodes.noGpsLock");
          return formatLocation(latitude);
        },
      },
      {
        id: t("manageNodes.longitude"),
        accessorFn: (n) => {
          const longitude = n.positionMetrics.at(-1)?.longitude;
          if (!longitude) return t("manageNodes.noGpsLock");
          return formatLocation(longitude);
        },
      },
      {
        id: t("manageNodes.battery"),
        accessorFn: (n) => {
          const batteryLevel = n.deviceMetrics.at(-1)?.metrics.batteryLevel;
          const batteryVoltage = n.deviceMetrics.at(-1)?.metrics.voltage;

          if (!(batteryLevel && batteryVoltage))
            return t("manageNodes.noBatteryInfo");
          return `${batteryVoltage.toPrecision(4)}V (${batteryLevel}%)`;
        },
      },
    ],
    [nodes]
  );

  return (
    <TableLayout
      data={nodes}
      columns={columns}
      title={t("manageNodes.title")}
      backtrace={[t("sidebar.manageNodes")]}
    />
  );
};
