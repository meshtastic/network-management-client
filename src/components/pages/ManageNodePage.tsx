import React, { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import type { NodeInfo } from "@bindings/protobufs/NodeInfo";
import TableLayout from "@components/Table/TableLayout";

const defaultNodes: NodeInfo[] = [
  {
    deviceMetrics: null,
    lastHeard: 0,
    num: 0,
    position: null,
    snr: 0,
    user: null,
  },
  {
    deviceMetrics: {
      airUtilTx: 0.2,
      batteryLevel: 0.9,
      channelUtilization: 0.3,
      voltage: 4.1,
    },
    lastHeard: 1677373048,
    num: 1,
    position: null,
    snr: 0,
    user: {
      hwModel: 0,
      id: "!fes8sfs3",
      isLicensed: false,
      shortName: "Test",
      longName: "Test User",
      macaddr: [0x1a, 0x2b, 0x3c, 0xd4, 0xe5, 0xf6],
    },
  },
];

const ManageNodePage = () => {
  const [data, setData] = useState(() => [...defaultNodes]);
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
    [data]
  );

  return (
    <TableLayout
      data={data}
      columns={columns}
      title="Manage Nodes"
      backtrace={["Nodes"]}
    />
  );
};

export default ManageNodePage;
