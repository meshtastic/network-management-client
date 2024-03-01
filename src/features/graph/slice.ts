import { MeshGraph } from "@app/types/graph";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type IGraphState = {
  graph: MeshGraph["graph"] | null;
};

export const initialGraphState: IGraphState = {
  graph: null,
};

export const graphSlice = createSlice({
  name: "graph",
  initialState: initialGraphState,
  reducers: {
    setGraph: (state, action: PayloadAction<MeshGraph>) => {
      state.graph = action.payload.graph;
    },
  },
});

export const { actions: graphSliceActions, reducer: graphReducer } = graphSlice;
