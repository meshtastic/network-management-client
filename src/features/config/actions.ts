import type { IConfigState } from "@features/config/slice";
import { createAction } from "@reduxjs/toolkit";

export const requestCommitConfig = createAction<(keyof IConfigState)[]>(
  "@device/request-commit-config",
);
