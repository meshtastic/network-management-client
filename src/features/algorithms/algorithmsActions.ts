import { createAction } from "@reduxjs/toolkit";

export type AlgorithmConfigFlags = {
  articulationPoint?: boolean;
  diffusionCentrality?: boolean;
  globalMincut?: boolean;
  mostSimilarTimeline?: boolean;
  predictedState?: boolean;
};

export const requestRunAllAlgorithms = createAction<
  { flags: AlgorithmConfigFlags }
>(
  "@device/request-run-all-algorithms",
);
