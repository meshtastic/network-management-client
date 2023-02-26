import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import type { ColumnDef } from "@tanstack/react-table";

import type { Waypoint } from "@bindings/protobufs/Waypoint";
import TableLayout from "@components/Table/TableLayout";
import { selectAllWaypoints } from "@features/device/deviceSelectors";

const ManageWaypointPage = () => {
  const waypoints = useSelector(selectAllWaypoints());
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
    [waypoints]
  );

  return (
    <TableLayout
      data={waypoints}
      columns={columns}
      title="Manage Waypoints"
      backtrace={["Waypoints"]}
    />
  );
};

export default ManageWaypointPage;
