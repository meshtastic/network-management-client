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
          const nodeNum = n.data.num;
          if (!nodeNum) return "No user info";
          return `0x${n.data.num?.toString(16)}`;
        },
      },
      {
        id: "Short Name",
        accessorFn: (n) => n.data.user?.shortName ?? "No user info",
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
          const latitude = n.data.position?.latitudeI;
          if (!latitude) return "No GPS lock";
          return formatLocation(latitude / 1e7);
        },
      },
      {
        id: "Longitude",
        accessorFn: (n) => {
          const longitude = n.data.position?.longitudeI;
          if (!longitude) return "No GPS lock";
          return formatLocation(longitude / 1e7);
        },
      },
      {
        id: "Battery",
        accessorFn: (n) => {
          const batteryLevel = n.data.deviceMetrics?.batteryLevel;
          const batteryVoltage = n.data.deviceMetrics?.voltage;

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
