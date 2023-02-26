import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import type { ColumnDef } from "@tanstack/react-table";

import type { NodeInfo } from "@bindings/protobufs/NodeInfo";
import TableLayout from "@components/Table/TableLayout";
import { selectAllNodes } from "@features/device/deviceSelectors";

const ManageNodePage = () => {
  const nodes = useSelector(selectAllNodes()).map((n) => n.data);
  const columns = useMemo<ColumnDef<NodeInfo, unknown>[]>(
    () => [
      { header: "ID", accessorKey: "num" },
      {
        id: "User Name",
        accessorFn: (n) => n.user?.shortName ?? "No user info",
      },
      {
        id: "Last Heard",
        accessorFn: (n) => (!n.lastHeard ? n.lastHeard : "No data"),
      },
      {
        id: "Latitude",
        accessorFn: (n) => n.position?.latitudeI ?? "No GPS lock",
      },
      {
        id: "Longitude",
        accessorFn: (n) => n.position?.longitudeI ?? "No GPS lock",
      },
      {
        id: "Battery",
        accessorFn: (n) =>
          n.deviceMetrics?.batteryLevel && n.deviceMetrics.batteryLevel
            ? `${n.deviceMetrics.voltage}V (${
                n.deviceMetrics.batteryLevel * 100
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
