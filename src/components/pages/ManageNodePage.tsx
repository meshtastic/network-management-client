import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import type { ColumnDef } from "@tanstack/react-table";
import TimeAgo from "timeago-react";

import type { app_device_MeshNode } from "@bindings/index";

import TableLayout from "@components/Table/TableLayout";
import { selectAllNodes } from "@features/device/deviceSelectors";
import { getLastHeardTime } from "@utils/nodes";
import { formatLocation } from "@utils/map";

const ManageNodePage = () => {
  const nodes = useSelector(selectAllNodes());

  const columns = useMemo<ColumnDef<app_device_MeshNode, unknown>[]>(
    () => [
      {
        id: "ID",
        accessorFn: (n) => {
          const { nodeNum } = n;
          if (!nodeNum) return "No user info";
          return `0x${nodeNum?.toString(16)}`;
        },
      },
      {
        id: "Short Name",
        accessorFn: (n) => n.user?.shortName ?? "No user info",
      },
      {
        id: "Last Heard",
        header: "Last Heard",
        cell: ({ row }) => {
          const node = row.original;
          const lastHeardTime = getLastHeardTime(node);

          if (!lastHeardTime) return <p>No packets received</p>;
          return <TimeAgo datetime={lastHeardTime * 1000} />;
        },
      },
      {
        id: "Latitude",
        accessorFn: (n) => {
          const latitude = n.positionMetrics.at(-1)?.latitude;
          if (!latitude) return "No GPS lock";
          return formatLocation(latitude);
        },
      },
      {
        id: "Longitude",
        accessorFn: (n) => {
          const longitude = n.positionMetrics.at(-1)?.longitude;
          if (!longitude) return "No GPS lock";
          return formatLocation(longitude);
        },
      },
      {
        id: "Battery",
        accessorFn: (n) => {
          const batteryLevel = n.deviceMetrics.at(-1)?.metrics.batteryLevel;
          const batteryVoltage = n.deviceMetrics.at(-1)?.metrics.voltage;

          if (!batteryLevel || !batteryVoltage) return "No battery info";
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
      title="Manage Nodes"
      backtrace={["Nodes"]}
    />
  );
};

export default ManageNodePage;
