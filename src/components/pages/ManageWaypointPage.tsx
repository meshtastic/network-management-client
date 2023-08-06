import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import type { ColumnDef } from "@tanstack/react-table";

import type { app_device_NormalizedWaypoint } from "@bindings/index";

import TableLayout from "@components/Table/TableLayout";
import {
  selectAllUsersByNodeIds,
  selectAllWaypoints,
} from "@features/device/selectors";
import { formatLocation } from "@utils/map";
import { useTranslation } from "react-i18next";

const ManageWaypointPage = () => {
  const { t } = useTranslation();

  const waypoints = useSelector(selectAllWaypoints());
  const users = useSelector(selectAllUsersByNodeIds());

  const columns = useMemo<ColumnDef<app_device_NormalizedWaypoint, unknown>[]>(
    () => [
      { header: t("manageWaypoints.id"), accessorFn: (n) => n.id },
      {
        id: t("manageWaypoints.name"),
        accessorFn: (n) => {
          const name = n.name;
          if (!name) return t("manageWaypoints.noName");
          return name;
        },
      },
      {
        id: t("manageWaypoints.description"),
        accessorFn: (n) => {
          const description = n.description;
          if (!description) return t("manageWaypoints.noDescription");
          return description;
        },
      },
      {
        id: t("manageWaypoints.expires"),
        accessorFn: (n) => {
          const expireTime = n.expire;
          if (!expireTime) return t("manageWaypoints.doesNotExpire");
          return new Date(expireTime * 1000);
        },
      },
      {
        id: t("manageWaypoints.latitude"),
        accessorFn: (n) => {
          const { latitude } = n;
          return formatLocation(latitude);
        },
      },
      {
        id: t("manageWaypoints.longitude"),
        accessorFn: (n) => {
          const { longitude } = n;
          return formatLocation(longitude);
        },
      },
      {
        id: t("manageWaypoints.ownedBy"),
        accessorFn: (n) => {
          const lockedTo = n.lockedTo;
          const owner = users[lockedTo];

          if (!lockedTo) return t("manageWaypoints.notLocked");
          if (!owner) return t("manageWaypoints.unknownOwner");
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
      title={t("manageWaypoints.title")}
      backtrace={[t("sidebar.manageWaypoints")]}
    />
  );
};

export default ManageWaypointPage;
