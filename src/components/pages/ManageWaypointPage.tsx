import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import type { ColumnDef } from "@tanstack/react-table";

import type { app_protobufs_Waypoint } from "@bindings/index";

import TableLayout from "@components/Table/TableLayout";
import {
  selectAllUsersByNodeIds,
  selectAllWaypoints,
} from "@features/device/deviceSelectors";

const ManageWaypointPage = () => {
  const waypoints = useSelector(selectAllWaypoints());
  const users = useSelector(selectAllUsersByNodeIds());

  const columns = useMemo<ColumnDef<app_protobufs_Waypoint, unknown>[]>(
    () => [
      { header: "ID", accessorKey: "id" },
      { id: "Name", accessorFn: (n) => (n.name !== "" ? n.name : "N/A") },
      {
        id: "Description",
        accessorFn: (n) => (n.description !== "" ? n.description : "N/A"),
      },
      { id: "Expires", accessorFn: (n) => new Date(n.expire * 1000) },
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
            : users[n.lockedTo]
            ? users[n.lockedTo]?.longName
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
