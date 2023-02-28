import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import type { ColumnDef } from "@tanstack/react-table";
import moment from "moment";

import type { Waypoint } from "@bindings/protobufs/Waypoint";
import TableLayout from "@components/Table/TableLayout";
import {
  selectAllWaypoints,
  selectUserByNodeId,
} from "@features/device/deviceSelectors";

const ManageWaypointPage = () => {
  const waypoints = useSelector(selectAllWaypoints());

  const columns = useMemo<ColumnDef<Waypoint, unknown>[]>(
    () => [
      { header: "ID", accessorKey: "id" },
      { id: "Name", accessorFn: (n) => (n.name !== "" ? n.name : "N/A") },
      {
        id: "Description",
        accessorFn: (n) => (n.description !== "" ? n.description : "N/A"),
      },
      { id: "Expires", accessorFn: (n) => moment.unix(n.expire) },
      {
        id: "Latitude",
        accessorFn: (n) =>
          n.latitudeI || n.latitudeI == 0
            ? n.latitudeI / 1e7
            : "Latitude Unavailable",
      },
      {
        id: "Longitude",
        accessorFn: (n) =>
          n.longitudeI || n.longitudeI == 0
            ? n.longitudeI / 1e7
            : "Longitude Unavailable",
      },
      {
        id: "Owned by",
        accessorFn: (n) =>
          n.lockedTo == 0
            ? "Public"
            : useSelector(selectUserByNodeId(n.lockedTo))
            ? useSelector(selectUserByNodeId(n.lockedTo))?.longName
            : "N/A",
      },
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
