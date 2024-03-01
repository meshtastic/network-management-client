import { useDispatch } from "react-redux";

import * as backendGraphApi from "@api/graph";

import { trackRequestOperation } from "@utils/api";
import { graphSliceActions } from "./slice";

export enum GraphApiActions {
  FetchGraph = "graph/fetchGraph",
}

export const useGraphApi = () => {
  const dispatch = useDispatch();

  const fetchGraph = async () => {
    const TYPE = GraphApiActions.FetchGraph;

    await trackRequestOperation(TYPE, dispatch, async () => {
      const meshGraph = await backendGraphApi.fetchGraph();

      dispatch(graphSliceActions.setGraph(meshGraph));
    });
  };

  return {
    fetchGraph,
  };
};
