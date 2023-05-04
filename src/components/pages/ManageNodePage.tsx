import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import type { ColumnDef } from "@tanstack/react-table";

import type { app_protobufs_NodeInfo } from "@bindings/index";

import TableLayout from "@components/Table/TableLayout";
import { selectAllNodes } from "@features/device/deviceSelectors";

const ManageNodePage = () => {
  const nodes = useSelector(selectAllNodes()).map((n) => n.data);
  const columns = useMemo<ColumnDef<app_protobufs_NodeInfo, unknown>[]>(
    () => [
      { id: "ID", accessorFn: (n) => n.num?.toString(16) ?? "No user info" },
      {
        id: "Short Name",
        accessorFn: (n) => n.user?.shortName ?? "No user info",
      },
      {
        id: "Last Heard",
        accessorFn: (n) => (!n.lastHeard ? n.lastHeard : "No data"),
      },
      {
        id: "Latitude",
        accessorFn: (n) =>
          n.position?.latitudeI ? n.position?.latitudeI / 1e7 : "No GPS lock",
      },
      {
        id: "Longitude",
        accessorFn: (n) =>
          n.position?.longitudeI ? n.position?.longitudeI / 1e7 : "No GPS lock",
      },
      {
        id: "Battery",
        accessorFn: (n) =>
          n.deviceMetrics?.batteryLevel && n.deviceMetrics.batteryLevel
            ? `${n.deviceMetrics.voltage.toPrecision(4)}V (${
                n.deviceMetrics.batteryLevel
              }%)`
            : "No battery info",
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
