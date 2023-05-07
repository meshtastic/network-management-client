import { createAction } from "@reduxjs/toolkit";

export const requestBeginConfigTransaction = createAction(
  "@device/request-begin-config-transaction"
);

export const requestCommitConfigTransaction = createAction(
  "@device/request-commit-config-transaction"
);

