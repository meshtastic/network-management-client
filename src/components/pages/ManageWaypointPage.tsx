import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import type { ColumnDef } from "@tanstack/react-table";

import type { app_device_NormalizedWaypoint } from "@bindings/index";

import TableLayout from "@components/Table/TableLayout";
import {
  selectAllUsersByNodeIds,
  selectAllWaypoints,
} from "@features/device/deviceSelectors";
import { formatLocation } from "@utils/map";

const ManageWaypointPage = () => {
  const waypoints = useSelector(selectAllWaypoints());
  const users = useSelector(selectAllUsersByNodeIds());

  const columns = useMemo<ColumnDef<app_device_NormalizedWaypoint, unknown>[]>(
    () => [
      { header: "ID", accessorFn: (n) => n.id },
      {
        id: "Name",
        accessorFn: (n) => {
          const name = n.name;
          if (!name) return "No name provided";
          return name;
        },
      },
      {
        id: "Description",
        accessorFn: (n) => {
          const description = n.description;
          if (!description) return "No description provided";
          return description;
        },
      },
      {
        id: "Expires",
        accessorFn: (n) => {
          const expireTime = n.expire;
          if (!expireTime) return "Does not expire";
          return new Date(expireTime * 1000);
        },
      },
      {
        id: "Latitude",
        accessorFn: (n) => {
          const { latitude } = n;
          return formatLocation(latitude);
        },
      },
      {
        id: "Longitude",
        accessorFn: (n) => {
          const { longitude } = n;
          return formatLocation(longitude);
        },
      },
      {
        id: "Owned by",
        accessorFn: (n) => {
          const lockedTo = n.lockedTo;
          const owner = users[lockedTo];

          if (!lockedTo) return "Not locked";
          if (!owner) return "Unknown owner";
          return owner.longName;
        },
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
