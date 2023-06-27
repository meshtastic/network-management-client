import React from "react";

import { useSelector, useDispatch } from "react-redux";
import { Lightbulb } from "lucide-react";

import { MapIconButton } from "@components/Map/MapIconButton";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { selectInfoPane } from "@features/device/deviceSelectors";

const MapInteractionPane = () => {
  const dispatch = useDispatch();

  const accordionShown = useSelector(selectInfoPane()) === "algos";

  const handleClickStacks = () => {
    dispatch(deviceSliceActions.setInfoPane(accordionShown ? null : "algos"));
  };

  return (
    <div className="absolute top-9 right-9 flex gap-4">
      <MapIconButton selected={accordionShown} onClick={handleClickStacks}>
        <Lightbulb
          strokeWidth={1.5}
          className={`w-6 h-6 ${
            accordionShown ? "text-gray-200" : "text-gray-500"
          }`}
        />
      </MapIconButton>
    </div>
  );
};

export default MapInteractionPane;
