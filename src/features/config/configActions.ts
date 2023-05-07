import { createAction } from "@reduxjs/toolkit";
import type { IConfigState } from "@features/config/configSlice";

export const requestCommitConfig = createAction<(keyof IConfigState)[]>(
  "@device/request-commit-config"
);
