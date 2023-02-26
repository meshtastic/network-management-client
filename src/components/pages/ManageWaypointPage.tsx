import React, { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import type { Waypoint } from "@bindings/protobufs/Waypoint";
import TableLayout from "@components/Table/TableLayout";

const defaultWaypoints: Waypoint[] = [
  {
    name: "Example Waypoint #1",
    description: "This is a test waypoint description",
    expire: 0,
    icon: 0,
    latitudeI: 2.0,
    longitudeI: 4.5,
    lockedTo: 0,
    id: 0,
  },
  {
    name: "Example Waypoint #2",
    description: "This is also a test waypoint description",
    expire: 1677373048,
    icon: 0,
    latitudeI: -8.0,
    longitudeI: -1.2,
    lockedTo: 0,
    id: 1,
  },
];

const ManageWaypointPage = () => {
  const [data, setData] = useState(() => [...defaultWaypoints]);
  const columns = useMemo<ColumnDef<Waypoint, unknown>[]>(
    () => [
      { header: "ID", accessorKey: "id" },
      { header: "Name", accessorKey: "name" },
      { header: "Description", accessorKey: "description" },
      { header: "Expires", accessorKey: "expire" },
      { header: "Latitude", accessorKey: "latitudeI" },
      { header: "Longitude", accessorKey: "longitudeI" },
      { header: "Owned by", accessorKey: "lockedTo" },
    ],
    []
  );

  return (
    <TableLayout
      data={data}
      columns={columns}
      title="Manage Waypoints"
      backtrace={["Waypoints"]}
    />
  );
};

export default ManageWaypointPage;
