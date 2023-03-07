import { createAction } from "@reduxjs/toolkit";

export const requestRunAllAlgorithms = createAction<{ bitfield: number }>(
  "@device/request-run-all-algorithms",
);
